"""Run from the project root: python -m unittest discover -s tests -v"""
from pathlib import Path
import importlib.util
import json
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("palagan_state", Path(__file__).resolve().parents[1] / "scripts" / "palagan_state.py")
STATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(STATE)


class StateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="palagan state test ")
        self.root = Path(self.temp.name)
        self.project = STATE.Project(self.root)
        self.project.init()

    def tearDown(self):
        self.temp.cleanup()

    def output(self, name="output/scene.blend", content=b"BLENDER-vtest"):
        path = self.project.path(name)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return path

    def begin(self):
        return self.project.begin("blockout-01", "blockout", "Build approved blockout", ["output/scene.blend"])

    def complete(self):
        return self.project.complete("blockout-01", "File saved and inspected in the test fixture", "output/scene.blend")

    def test_init_is_idempotent_and_preserves_operations(self):
        self.begin()
        self.assertEqual(self.project.init()["active_operation"], "blockout-01")

    def test_missing_output_never_completes(self):
        self.begin()
        with self.assertRaises(STATE.StateError):
            self.complete()
        self.assertEqual(self.project.read()["operations"]["blockout-01"]["status"], "pending")

    def test_empty_output_never_completes(self):
        self.begin()
        self.output(content=b"")
        with self.assertRaises(STATE.StateError):
            self.complete()

    def test_complete_copies_scene_and_associates_state(self):
        self.begin()
        self.output()
        manifest = self.complete()
        snapshot = self.project.path(manifest["scene"]["snapshot_path"])
        self.assertEqual(snapshot.read_bytes(), b"BLENDER-vtest")
        saved_state = json.loads(self.project.path(manifest["state_snapshot"]).read_text())
        self.assertEqual(saved_state["last_checkpoint"], self.project.read()["last_checkpoint"])
        self.assertTrue(self.project.reconcile()["ok"])

    def test_hash_mismatch_is_reported_without_repair(self):
        self.begin()
        self.output()
        self.complete()
        self.output(content=b"different scene")
        report = self.project.reconcile()
        self.assertFalse(report["ok"])
        self.assertTrue(any("Hash changed" in item for item in report["issues"]))
        self.assertEqual(self.project.read()["operations"]["blockout-01"]["status"], "complete")

    def test_immutable_scene_corruption_is_detected(self):
        self.begin()
        self.output()
        manifest = self.complete()
        self.project.path(manifest["scene"]["snapshot_path"]).write_bytes(b"damaged")
        self.assertFalse(self.project.reconcile()["ok"])

    def test_checkpoint_state_corruption_is_detected(self):
        self.begin()
        self.output()
        manifest = self.complete()
        snapshot = self.project.path(manifest["state_snapshot"])
        value = json.loads(snapshot.read_text())
        value["current_stage"] = "tampered"
        snapshot.write_text(json.dumps(value))
        self.assertTrue(any("state snapshot hash" in issue for issue in self.project.reconcile()["issues"]))

    def test_incomplete_state_is_rejected(self):
        self.project.state_path.write_text('{"schema_version":1}')
        with self.assertRaises(STATE.StateError):
            self.project.read()

    def test_invalid_transition_and_reused_id_are_rejected(self):
        self.begin()
        with self.assertRaises(STATE.StateError):
            self.project.begin("other", "detail", "Another operation", ["output/other.blend"])
        with self.assertRaises(STATE.StateError):
            self.project.complete("wrong-id", "Checked")
        self.project.fail("blockout-01", "Interrupted before geometry was saved")
        with self.assertRaises(STATE.StateError):
            self.begin()

    def test_pending_interruption_survives_fresh_helper(self):
        self.begin()
        self.output()
        fresh = STATE.Project(self.root)
        report = fresh.reconcile()
        self.assertEqual(report["active_operation"], "blockout-01")
        self.assertFalse(report["ok"])
        self.assertEqual(fresh.read()["operations"]["blockout-01"]["status"], "pending")

    def test_orphan_candidate_not_silently_promoted(self):
        self.begin()
        candidate = self.root / "progress/checkpoints/blockout-01"
        candidate.mkdir(parents=True)
        (candidate / "manifest.json").write_text("{}")
        report = self.project.reconcile()
        self.assertEqual(report["orphan_candidates"], ["progress/checkpoints/blockout-01"])
        self.assertEqual(self.project.read()["active_operation"], "blockout-01")

    def test_unchanged_outputs_require_explicit_exception(self):
        self.output()
        self.begin()
        with self.assertRaises(STATE.StateError):
            self.complete()
        self.project.complete("blockout-01", "Deliberately verified unchanged existing output", "output/scene.blend", allow_unchanged=True)

    def test_windows_separators_spaces_and_escaping(self):
        self.assertEqual(self.project.path(r"output\scene with spaces.blend"), self.root / "output/scene with spaces.blend")
        for invalid in (r"C:\Users\name\scene.blend", r"\\server\share\scene.blend", "../scene.blend", r"output\..\scene.blend", "/tmp/scene.blend"):
            with self.subTest(invalid=invalid):
                with self.assertRaises(STATE.StateError):
                    self.project.path(invalid)

    def test_lock_prevents_concurrent_writers(self):
        self.project.lock_path.write_text("test-lock")
        with self.assertRaises(STATE.StateError):
            self.begin()
        self.assertEqual(self.project.lock_path.read_text(), "test-lock")


if __name__ == "__main__":
    unittest.main()
