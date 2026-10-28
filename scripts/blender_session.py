"""Load inside Blender 5.2 via MCP. Importing this file does not edit the scene.

Example, after replacing ROOT with the actual extracted project path:
    import runpy, json
    api = runpy.run_path(ROOT + '/scripts/blender_session.py')
    print(json.dumps(api['preflight'](), indent=2))

Blender-dependent functions have not been executed in the kit's build runtime.
"""
from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path, PureWindowsPath
import tempfile

import bpy

OWNER = "PALAGAN_SURABAYA_V1"


def _json_write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(value, handle, indent=2, ensure_ascii=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def _project_file(project_root, relative):
    root = Path(project_root).expanduser().resolve()
    text = str(relative)
    win = PureWindowsPath(text)
    if not root.is_dir() or win.drive or win.root or Path(text).is_absolute():
        raise ValueError("Existing project root and project-relative output are required")
    normalized = text.replace("\\", "/")
    if ".." in normalized.split("/"):
        raise ValueError("Parent traversal is not allowed")
    path = (root / normalized).resolve()
    path.relative_to(root)
    if path == root:
        raise ValueError("Output must be a file")
    return path


def preflight():
    """Read-only environment report. No dependency installation or reset."""
    scene = bpy.context.scene
    cycles = bpy.context.preferences.addons.get("cycles")
    gpu_devices = []
    if cycles:
        try:
            gpu_devices = [
                {"name": device.name, "type": device.type, "enabled": bool(device.use)}
                for device in cycles.preferences.devices
            ]
        except Exception as error:
            gpu_devices = [{"unavailable": str(error)}]
    return {
        "schema_version": 1,
        "reported_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "blender_version": bpy.app.version_string,
        "blender_version_tuple": list(bpy.app.version),
        "background": bool(bpy.app.background),
        "binary_path": bpy.app.binary_path,
        "current_blend": bpy.data.filepath,
        "current_scene": scene.name,
        "render_engine": scene.render.engine,
        "units": {"system": scene.unit_settings.system, "scale_length": scene.unit_settings.scale_length},
        "objects": len(bpy.data.objects),
        "materials": len(bpy.data.materials),
        "collections": len(bpy.data.collections),
        "cycles_devices_already_detected": gpu_devices,
        "save_operator_properties": list(bpy.ops.wm.save_as_mainfile.get_rna_type().properties.keys()),
        "notes": [
            "GPU devices may be empty until Blender has detected them; this report does not enable or change a device.",
            "Discover the MCP server's screenshot and code tools from its live schema.",
            "Do not assume OpenCode's model can view screenshots: confirm with a small image-inspection test.",
        ],
    }


def inventory():
    """Read-only scene manifest, with counts and persistent ownership/evidence."""
    rows = []
    for obj in sorted(bpy.context.scene.objects, key=lambda item: item.name):
        if obj.get("palagan_owner") != OWNER:
            continue
        matrix = obj.matrix_world
        mesh = obj.data if obj.type == "MESH" else None
        rows.append({
            "name": obj.name, "type": obj.type,
            "asset_id": obj.get("palagan_asset_id", ""),
            "layer": obj.get("palagan_layer", ""),
            "evidence_status": obj.get("palagan_evidence_status", "unknown"),
            "source_ids_json": obj.get("palagan_source_ids_json", "[]"),
            "dimensions_m": [round(float(value), 5) for value in obj.dimensions],
            "location_scene_units": [round(float(value), 5) for value in matrix.translation],
            "base_vertices": len(mesh.vertices) if mesh else 0,
            "base_faces": len(mesh.polygons) if mesh else 0,
            "base_triangle_estimate": sum(max(0, len(face.vertices) - 2) for face in mesh.polygons) if mesh else 0,
            "material_slots": len(obj.material_slots),
        })
    return {
        "schema_version": 1,
        "reported_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "blender_version": bpy.app.version_string,
        "scene": bpy.context.scene.name,
        "blend_filepath": bpy.data.filepath,
        "project_owner": OWNER,
        "owned_objects": rows,
        "owned_object_count": len(rows),
        "unowned_scene_object_count": sum(1 for item in bpy.context.scene.objects if item.get("palagan_owner") != OWNER),
        "base_triangle_estimate": sum(item["base_triangle_estimate"] for item in rows),
        "counts_are_evaluated": False,
        "note": "Base geometry counts exclude modifier expansion and instances; measure evaluated counts separately before performance claims.",
    }


def write_report(project_root, relative, kind="inventory"):
    value = inventory() if kind == "inventory" else preflight() if kind == "preflight" else None
    if value is None:
        raise ValueError("kind must be inventory or preflight")
    path = _project_file(project_root, relative)
    _json_write(path, value)
    return {"written": str(path), "bytes": path.stat().st_size, "kind": kind}


def save_snapshot(project_root, relative_blend, operation_id, overwrite=False):
    """Save a new project-owned checkpoint file; never reset or reload a scene.

    Use a unique path per operation. Existing user files are not overwritten
    unless the caller explicitly passes overwrite=True. The external state CLI
    then copies this saved file into an immutable operation checkpoint.
    """
    path = _project_file(project_root, relative_blend)
    if path.suffix.lower() != ".blend":
        raise ValueError("Snapshot must end in .blend")
    if path.exists() and not overwrite:
        raise FileExistsError("Choose a new checkpoint name: " + str(path))
    if not operation_id or len(operation_id) > 64:
        raise ValueError("A short operation ID is required")
    path.parent.mkdir(parents=True, exist_ok=True)
    # Project metadata is attached to a scene, not to unrelated user objects.
    bpy.context.scene["palagan_last_operation"] = operation_id
    bpy.context.scene["palagan_checkpoint_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    properties = bpy.ops.wm.save_as_mainfile.get_rna_type().properties.keys()
    kwargs = {"filepath": str(path)}
    if "check_existing" in properties:
        kwargs["check_existing"] = False
    if "compress" in properties:
        kwargs["compress"] = True
    result = bpy.ops.wm.save_as_mainfile(**kwargs)
    if "FINISHED" not in result or not path.is_file() or path.stat().st_size == 0:
        raise RuntimeError("Blender did not produce a nonempty snapshot")
    report = inventory()
    report["operation_id"] = operation_id
    sidecar = path.with_suffix(".inventory.json")
    _json_write(sidecar, report)
    return {"saved": str(path), "bytes": path.stat().st_size, "inventory": str(sidecar), "operation_id": operation_id}


def render_review(project_root, relative_png, camera_name, resolution=(1280, 720), samples=24):
    """Render one existing camera, restoring temporary render settings afterward.

    Run only after a small render has succeeded on the user's laptop. This is a
    blocking call and does not create cameras or choose a render engine.
    """
    scene = bpy.context.scene
    camera = scene.objects.get(camera_name)
    if camera is None or camera.type != "CAMERA":
        raise ValueError("Named camera is not in the active scene")
    if camera.get("palagan_owner") != OWNER:
        raise ValueError("Use a PALAGAN-owned review camera")
    if len(resolution) != 2 or any(int(value) < 64 or int(value) > 4096 for value in resolution):
        raise ValueError("Review dimensions must be 64..4096 pixels")
    output = _project_file(project_root, relative_png)
    if output.suffix.lower() != ".png":
        raise ValueError("Review output must be PNG")
    output.parent.mkdir(parents=True, exist_ok=True)
    saved = (scene.camera, scene.render.filepath, scene.render.resolution_x, scene.render.resolution_y,
             scene.render.resolution_percentage, scene.render.image_settings.file_format)
    cycle_samples = scene.cycles.samples if hasattr(scene, "cycles") else None
    try:
        scene.camera = camera
        scene.render.filepath = str(output)
        scene.render.resolution_x, scene.render.resolution_y = map(int, resolution)
        scene.render.resolution_percentage = 100
        scene.render.image_settings.file_format = "PNG"
        if scene.render.engine == "CYCLES" and cycle_samples is not None:
            scene.cycles.samples = max(1, min(int(samples), 128))
        result = bpy.ops.render.render(write_still=True)
        if "FINISHED" not in result or not output.is_file():
            raise RuntimeError("Review render was not written")
        return {"written": str(output), "camera": camera.name, "engine": scene.render.engine}
    finally:
        (scene.camera, scene.render.filepath, scene.render.resolution_x, scene.render.resolution_y,
         scene.render.resolution_percentage, scene.render.image_settings.file_format) = saved
        if cycle_samples is not None:
            scene.cycles.samples = cycle_samples
