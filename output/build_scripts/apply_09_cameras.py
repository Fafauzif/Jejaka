"""PALAGAN cameras-01: place the required review cameras deterministically.

Position and target come from output/camera_setup.json; rotation is derived with
a look-at quaternion so the aim is unambiguous. Cameras marked keep_existing are
left where they are (their review framing was already validated).
"""
from __future__ import annotations

import json
from pathlib import Path

import bpy
from mathutils import Vector

OWNER = "PALAGAN_SURABAYA_V1"


def _project_root():
    here = Path(bpy.data.filepath).resolve()
    for candidate in [here.parent, *here.parents]:
        if (candidate / "data" / "HISTORICAL_LAYOUT.json").is_file():
            return candidate
    raise RuntimeError("Project root not found from " + str(here))


ROOT = _project_root()
PARAMS = ROOT / "output" / "camera_setup.json"
REPORT = ROOT / "output" / "cameras_report.json"

params = json.loads(PARAMS.read_text(encoding="utf-8"))["cameras"]
report = {"placed": [], "kept": [], "missing": [], "warnings": []}

scene = bpy.context.scene
for name, spec in params.items():
    cam_ob = bpy.data.objects.get(name)
    if cam_ob is None:
        # Look for a camera carrying the matching asset id instead of creating one.
        for ob in scene.objects:
            if ob.type == "CAMERA" and ob.get("palagan_asset_id") == name:
                cam_ob = ob
                break
    if cam_ob is None:
        report["missing"].append(name)
        continue
    cam_ob["palagan_owner"] = OWNER
    entry = {"name": name, "purpose": spec["purpose"], "lens_mm": spec["lens_mm"],
             "basis": spec["basis"]}
    if spec.get("keep_existing"):
        report["kept"].append(entry)
        continue
    pos = Vector(spec["position"])
    target = Vector(spec["target"])
    cam_ob.location = pos
    direction = target - pos
    if direction.length < 1e-6:
        report["warnings"].append(name + ": target equals position")
        continue
    cam_ob.rotation_mode = "QUATERNION"
    cam_ob.rotation_quaternion = direction.to_track_quat("-Z", "Y")
    cam_ob.data.lens = float(spec["lens_mm"])
    if spec.get("ortho_scale"):
        cam_ob.data.type = "ORTHO"
        cam_ob.data.ortho_scale = float(spec["ortho_scale"])
    else:
        cam_ob.data.type = "PERSP"
    cam_ob.data.clip_start = 0.1
    cam_ob.data.clip_end = 4000.0
    cam_ob["palagan_purpose"] = spec["purpose"]
    cam_ob["palagan_target_xyz"] = list(spec["target"])
    cam_ob["palagan_basis"] = spec["basis"]
    entry.update({"position": list(pos), "target": list(spec["target"]),
                  "mode": cam_ob.data.type})
    report["placed"].append(entry)

scene.camera = bpy.data.objects.get("CAM_DISTRICT_OVERVIEW") or scene.camera
REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print("CAMERAS placed", len(report["placed"]), "kept", len(report["kept"]),
      "missing", report["missing"])
