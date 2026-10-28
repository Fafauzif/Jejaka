#!/usr/bin/env python3
"""Small, dependency-free operation journal for the PALAGAN Blender project.

This records evidence of saved files. It does not assert historical or visual
accuracy. Run with the project's external Python, not Blender's Python.
"""
from __future__ import annotations

import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path, PureWindowsPath
import re
import shutil
import sys
import tempfile

SCHEMA_VERSION = 1
SAFE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")


class StateError(RuntimeError):
    pass


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def atomic_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            json.dump(value, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def sha256(path: Path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


class Project:
    def __init__(self, root):
        self.root = Path(root).expanduser().resolve()
        if not self.root.is_dir():
            raise StateError("Project root must be an existing directory")
        self.progress = self.root / "progress"
        self.state_path = self.progress / "PROJECT_STATE.json"
        self.lock_path = self.progress / ".state.lock"

    def path(self, value):
        """Accept project-relative POSIX/Windows separators, reject escape paths."""
        text = str(value)
        windows = PureWindowsPath(text)
        if not text or windows.drive or windows.root or Path(text).is_absolute():
            raise StateError("Use a project-relative path, not an absolute path: " + text)
        normalized = text.replace("\\", "/")
        if ".." in normalized.split("/"):
            raise StateError("Parent traversal is not allowed: " + text)
        target = (self.root / normalized).resolve()
        try:
            target.relative_to(self.root)
        except ValueError:
            raise StateError("Path escapes the project: " + text) from None
        if target == self.root:
            raise StateError("A file path is required")
        return target

    def relative(self, path):
        return Path(path).resolve().relative_to(self.root).as_posix()

    @contextmanager
    def locked(self):
        self.progress.mkdir(parents=True, exist_ok=True)
        try:
            fd = os.open(self.lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError:
            raise StateError("State is locked. If the prior process crashed, confirm no helper is running, then remove progress/.state.lock") from None
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                handle.write(json.dumps({"pid": os.getpid(), "created_at": now()}))
            yield
        finally:
            self.lock_path.unlink(missing_ok=True)

    def read(self):
        if not self.state_path.exists():
            raise StateError("Run init first")
        try:
            state = json.loads(self.state_path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            raise StateError("State cannot be read; preserve it and inspect checkpoints: " + str(error)) from error
        if state.get("schema_version") != SCHEMA_VERSION:
            raise StateError("Unsupported state schema")
        if not isinstance(state.get("operations"), dict) or not all(key in state for key in ("active_operation", "last_checkpoint", "scene_file", "current_stage")):
            raise StateError("Incomplete state structure; preserve it and inspect checkpoint state snapshots")
        active = state["active_operation"]
        if active is not None and (active not in state["operations"] or state["operations"][active].get("status") != "pending"):
            raise StateError("Active operation association is inconsistent; inspect checkpoint state snapshots")
        return state

    def write(self, state):
        state["updated_at"] = now()
        atomic_json(self.state_path, state)

    def event(self, event, **data):
        record = {"at": now(), "event": event, **data}
        with (self.progress / "OPERATIONS.jsonl").open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
            handle.flush()
            os.fsync(handle.fileno())

    def init(self):
        with self.locked():
            if self.state_path.exists():
                return self.read()
            state = {
                "schema_version": SCHEMA_VERSION,
                "project": "PALAGAN Surabaya Reconstruction",
                "created_at": now(), "updated_at": now(),
                "current_stage": "not_started", "active_operation": None,
                "last_checkpoint": None, "scene_file": None,
                "operations": {},
            }
            self.write(state)
            self.event("initialized")
            return state

    def begin(self, operation_id, stage, description, expected):
        if not SAFE_ID.fullmatch(operation_id) or not SAFE_ID.fullmatch(stage):
            raise StateError("Operation/stage IDs must be 1-64 simple letters, digits, dots, underscores or hyphens")
        if not description.strip() or not expected:
            raise StateError("Description and at least one expected output are required")
        outputs = [self.relative(self.path(item)) for item in expected]
        if len(outputs) != len(set(outputs)):
            raise StateError("Duplicate expected outputs")
        if any(item.startswith("progress/") for item in outputs):
            raise StateError("Expected outputs cannot be the state helper's own progress files")
        with self.locked():
            state = self.read()
            if state["active_operation"]:
                raise StateError("Reconcile or fail the active operation before starting another")
            if operation_id in state["operations"]:
                raise StateError("Operation ID already exists; use a new attempt ID")
            before = {}
            for item in outputs:
                path = self.path(item)
                before[item] = sha256(path) if path.is_file() else None
            operation = {
                "id": operation_id, "stage": stage, "description": description,
                "status": "pending", "started_at": now(), "expected_outputs": outputs,
                "before_sha256": before,
            }
            state["operations"][operation_id] = operation
            state["active_operation"] = operation_id
            state["current_stage"] = stage
            self.write(state)
            self.event("began", operation_id=operation_id, stage=stage)
            return operation

    def complete(self, operation_id, verification, scene=None, allow_unchanged=False):
        if not verification.strip():
            raise StateError("Record the checks actually performed in --verification")
        with self.locked():
            state = self.read()
            if state["active_operation"] != operation_id:
                raise StateError("Only the active pending operation can complete")
            operation = state["operations"][operation_id]
            if operation["status"] != "pending":
                raise StateError("Operation is not pending")
            files = []
            for item in operation["expected_outputs"]:
                path = self.path(item)
                if not path.is_file() or path.stat().st_size == 0:
                    raise StateError("Expected nonempty output is missing: " + item)
                files.append({"path": item, "bytes": path.stat().st_size, "sha256": sha256(path)})
            if not allow_unchanged and all(operation["before_sha256"][item["path"]] == item["sha256"] for item in files):
                raise StateError("All expected outputs are unchanged; inspect the operation before completing")
            scene_path = self.path(scene) if scene else None
            if scene_path:
                if scene_path.suffix.lower() != ".blend" or not scene_path.is_file() or scene_path.stat().st_size == 0:
                    raise StateError("Scene must be a saved nonempty .blend file")
                if self.relative(scene_path) not in operation["expected_outputs"]:
                    raise StateError("Scene must be one of the operation's expected outputs")
            checkpoint_dir = self.progress / "checkpoints" / operation_id
            # A prior interrupted completion may have left an orphan candidate.
            # Never overwrite it: reconcile reports it and a human/agent inspects it.
            if checkpoint_dir.exists():
                raise StateError("Checkpoint candidate already exists; run reconcile and inspect before retrying")
            checkpoint_dir.mkdir(parents=True)
            scene_record = None
            if scene_path:
                copied = checkpoint_dir / "scene.blend"
                shutil.copyfile(scene_path, copied)
                original_hash = sha256(scene_path)
                copied_hash = sha256(copied)
                manifest_hash = next(item["sha256"] for item in files if item["path"] == self.relative(scene_path))
                if original_hash != copied_hash or original_hash != manifest_hash:
                    raise StateError("Scene changed during checkpoint copy; candidate is uncommitted")
                scene_record = {"working_path": self.relative(scene_path), "snapshot_path": self.relative(copied), "sha256": copied_hash}
            operation["status"] = "complete"
            operation["completed_at"] = now()
            operation["verification"] = verification
            operation["checkpoint"] = self.relative(checkpoint_dir / "manifest.json")
            state["active_operation"] = None
            state["last_checkpoint"] = operation["checkpoint"]
            if scene_path:
                state["scene_file"] = self.relative(scene_path)
            manifest = {
                "schema_version": SCHEMA_VERSION, "operation_id": operation_id,
                "stage": operation["stage"], "created_at": now(),
                "verification": verification, "outputs": files, "scene": scene_record,
                "state_snapshot": self.relative(checkpoint_dir / "state.json"),
            }
            # Ordered commit: immutable candidate files first; live state last.
            atomic_json(checkpoint_dir / "state.json", state)
            manifest["state_sha256"] = sha256(checkpoint_dir / "state.json")
            atomic_json(checkpoint_dir / "manifest.json", manifest)
            self.write(state)
            self.event("completed", operation_id=operation_id, checkpoint=operation["checkpoint"])
            return manifest

    def fail(self, operation_id, reason):
        if not reason.strip():
            raise StateError("Failure reason is required")
        with self.locked():
            state = self.read()
            if state["active_operation"] != operation_id:
                raise StateError("Only the active operation can fail")
            state["operations"][operation_id].update(status="failed", failed_at=now(), failure=reason)
            state["active_operation"] = None
            self.write(state)
            self.event("failed", operation_id=operation_id, reason=reason)
            return state["operations"][operation_id]

    def reconcile(self):
        """Read-only audit. Never silently promote pending work or load a scene."""
        state = self.read()
        report = {"active_operation": state["active_operation"], "last_checkpoint": state["last_checkpoint"], "issues": [], "orphan_candidates": []}
        if state["active_operation"]:
            report["issues"].append("Pending work exists: inspect the live scene and expected outputs before any rerun")
        cp = state["last_checkpoint"]
        if cp:
            manifest_path = self.path(cp)
            if not manifest_path.is_file():
                report["issues"].append("Last checkpoint manifest is missing")
            else:
                try:
                    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
                    snap = self.path(manifest["state_snapshot"])
                    if not snap.is_file():
                        report["issues"].append("Checkpoint state snapshot is missing")
                    else:
                        if sha256(snap) != manifest.get("state_sha256"):
                            report["issues"].append("Checkpoint state snapshot hash is inconsistent")
                        snap_state = json.loads(snap.read_text(encoding="utf-8"))
                        if snap_state.get("last_checkpoint") != cp:
                            report["issues"].append("Checkpoint state association is inconsistent")
                    records = list(manifest["outputs"])
                    if manifest.get("scene"):
                        records.append({"path": manifest["scene"]["snapshot_path"], "sha256": manifest["scene"]["sha256"]})
                    for item in records:
                        path = self.path(item["path"])
                        if not path.is_file():
                            report["issues"].append("Missing checkpoint output: " + item["path"])
                        elif sha256(path) != item["sha256"]:
                            report["issues"].append("Hash changed since checkpoint: " + item["path"])
                except (ValueError, KeyError, TypeError, OSError) as error:
                    report["issues"].append("Cannot inspect checkpoint: " + str(error))
        committed = {op.get("checkpoint") for op in state["operations"].values() if op.get("status") == "complete"}
        checkpoint_root = self.progress / "checkpoints"
        if checkpoint_root.exists():
            for directory in sorted(checkpoint_root.iterdir()):
                if directory.is_dir() and self.relative(directory / "manifest.json") not in committed:
                    report["orphan_candidates"].append(self.relative(directory))
        if report["orphan_candidates"]:
            report["issues"].append("Uncommitted checkpoint candidates exist; preserve and inspect them")
        report["ok"] = not report["issues"]
        return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Project directory (default: current directory)")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("init")
    sub.add_parser("status")
    sub.add_parser("reconcile")
    begin = sub.add_parser("begin")
    begin.add_argument("--id", required=True)
    begin.add_argument("--stage", required=True)
    begin.add_argument("--description", required=True)
    begin.add_argument("--expect", action="append", required=True, help="Repeat for each expected project-relative output")
    complete = sub.add_parser("complete")
    complete.add_argument("--id", required=True)
    complete.add_argument("--verification", required=True)
    complete.add_argument("--scene", help="Expected .blend output to copy into the checkpoint")
    complete.add_argument("--allow-unchanged", action="store_true", help="For a deliberately verified no-change operation only")
    fail = sub.add_parser("fail")
    fail.add_argument("--id", required=True)
    fail.add_argument("--reason", required=True)
    args = parser.parse_args(argv)
    try:
        project = Project(args.root)
        if args.command == "init":
            result = project.init()
        elif args.command == "status":
            result = project.read()
        elif args.command == "begin":
            result = project.begin(args.id, args.stage, args.description, args.expect)
        elif args.command == "complete":
            result = project.complete(args.id, args.verification, args.scene, args.allow_unchanged)
        elif args.command == "fail":
            result = project.fail(args.id, args.reason)
        else:
            result = project.reconcile()
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if args.command != "reconcile" or result["ok"] else 2
    except (StateError, OSError) as error:
        print(json.dumps({"error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
