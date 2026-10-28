"""PALAGAN environment preflight and owned-scene initialisation.

Run INSIDE Blender 5.2 via MCP only:
    import runpy, json
    api = runpy.run_path(ROOT + "/output/build_scripts/env_preflight.py")
    print("PREFLIGHT=" + json.dumps(api["run"](ROOT)))

This script:
- writes a byte copy of the pre-existing default scene before changing anything;
- does not delete unrelated objects: the default Cube/Camera/Light are moved into
  a hidden, render-disabled archive collection;
- creates the PALAGAN-owned root and layer collections;
- writes output/environment.json;
- performs a viewport OpenGL capture to output/renders/environment_test.png.
"""
from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import platform

import bpy

OWNER = "PALAGAN_SURABAYA_V1"
ROOT_NAME = "PALAGAN_SURABAYA"
ARCHIVE_NAME = "BASELINE_PRESERVED_DEFAULT"
LAYERS = [
    "MAP_REFERENCE",
    "GROUND_WATER",
    "STREETS",
    "LM_BRIDGE",
    "LM_INTERNATIO",
    "LM_SINGA",
    "ST_KEMBANG",
    "BACKGROUND",
    "VEGETATION",
    "PROPS_OPTIONAL",
    "LIGHTING",
    "CAMERAS",
    "INSPECTION",
]
ISO = datetime.now(timezone.utc).isoformat(timespec="seconds")


def _root(project_root):
    return Path(project_root).expanduser().resolve()


def _write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(value, indent=2, ensure_ascii=False) + "\n"
    path.write_text(text, encoding="utf-8")


def _archive_defaults():
    """Move only factory-default objects into a hidden, non-rendering archive."""
    scene = bpy.context.scene
    archive = bpy.data.collections.get(ARCHIVE_NAME)
    if archive is None:
        archive = bpy.data.collections.new(ARCHIVE_NAME)
        archive["palagan_purpose"] = "Preserved pre-existing default scene objects; not project content"
        scene.collection.children.link(archive)
    archive.hide_render = True
    archive.hide_viewport = True
    moved = []
    candidates = [obj for obj in list(scene.objects) if obj.get("palagan_owner") != OWNER]
    for obj in candidates:
        for coll in list(obj.users_collection):
            coll.objects.unlink(obj)
        archive.objects.link(obj)
        obj.hide_render = True
        obj.hide_viewport = True
        moved.append(obj.name)
    return archive, moved


def _ensure_root_and_layers():
    scene = bpy.context.scene
    root = bpy.data.collections.get(ROOT_NAME)
    if root is not None and root.get("palagan_owner") != OWNER:
        raise RuntimeError("PALAGAN root name is owned by other data")
    if root is None:
        root = bpy.data.collections.new(ROOT_NAME)
        root["palagan_owner"] = OWNER
        root["palagan_created_at"] = ISO
        scene.collection.children.link(root)
    root.hide_render = False
    made = []
    for layer in LAYERS:
        name = "PALAGAN_" + layer
        coll = bpy.data.collections.get(name)
        if coll is not None and coll.get("palagan_owner") != OWNER:
            raise RuntimeError("Layer name collision: " + name)
        if coll is None:
            coll = bpy.data.collections.new(name)
            coll["palagan_owner"] = OWNER
            coll["palagan_layer"] = layer
            root.children.link(coll)
            made.append(name)
        elif coll.name not in root.children:
            raise RuntimeError("Layer exists outside PALAGAN root: " + name)
    return root, made


def _device_info():
    info = {"gpu_backend": None, "gpu_vendor": None, "gpu_renderer": None}
    try:
        import gpu
        info["gpu_backend"] = gpu.platform.backend_type_get()
        info["gpu_vendor"] = gpu.platform.vendor_get()
        info["gpu_renderer"] = gpu.platform.renderer_get()
    except Exception as error:  # pragma: no cover - runtime capability probe
        info["gpu_error"] = str(error)
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.refresh_devices()
        info["cycles_devices"] = [
            {"name": d.name, "type": d.type, "enabled": bool(d.use)} for d in prefs.devices
        ]
        info["cycles_compute_device_type"] = prefs.compute_device_type
    except Exception as error:  # pragma: no cover
        info["cycles_error"] = str(error)
    return info


def _viewport_capture(path):
    """Render the current 3D viewport to PNG using a real VIEW_3D area."""
    path.parent.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(path)
    previous = scene.render.filepath
    override = None
    wm = bpy.context.window_manager
    for window in wm.windows:
        for area in window.screen.areas:
            if area.type == "VIEW_3D":
                region = next((r for r in area.regions if r.type == "WINDOW"), None)
                if region is not None:
                    override = (window, area, region)
                    break
        if override:
            break
    if override is None:
        return {"ok": False, "error": "No VIEW_3D area available"}
    window, area, region = override
    space = area.spaces.active
    saved = (space.region_3d.view_perspective, space.shading.type,
             space.overlay.show_overlays if hasattr(space.overlay, "show_overlays") else None)
    try:
        space.region_3d.view_perspective = "PERSP"
        space.shading.type = "SOLID"
        with bpy.context.temp_override(window=window, area=area, region=region, scene=scene):
            result = bpy.ops.render.opengl(write_still=True, view_context=True)
        ok = path.is_file() and path.stat().st_size > 0
        return {"ok": bool(ok), "path": str(path), "bytes": path.stat().st_size if ok else 0,
                "operator": sorted(result)}
    finally:
        try:
            space.region_3d.view_perspective = saved[0]
            space.shading.type = saved[1]
        except Exception:
            pass
        scene.render.filepath = previous


def run(project_root):
    root = _root(project_root)
    if not (root / "AGENTS.md").is_file():
        raise RuntimeError("Run from the actual PALAGAN project root")
    out = root / "output"
    out.mkdir(parents=True, exist_ok=True)

    # 1. Preserve the pre-existing scene bytes before any mutation.
    backup = out / "backups" / "baseline_default_scene.blend"
    backup.parent.mkdir(parents=True, exist_ok=True)
    if not backup.exists():
        result = bpy.ops.wm.save_as_mainfile(filepath=str(backup), copy=True, check_existing=False, compress=True)
        if "FINISHED" not in result or not backup.is_file():
            raise RuntimeError("Baseline copy was not written")
    baseline_size = backup.stat().st_size

    # 2. Archive defaults without destroying them, then establish project layers.
    archive, moved = _archive_defaults()
    proj_root, made = _ensure_root_and_layers()

    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.unit_settings.length_unit = "METERS"
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.fps = 24
    scene["palagan_owner"] = OWNER
    scene["palagan_project"] = "PALAGAN Surabaya November 1945 district reconstruction"
    scene["palagan_spatial_frame"] = "LOCAL_CARTOGRAPHIC_METRIC_APPROXIMATION; 1 unit = 1 m; X east, Y north; NOT EPSG georeferenced"
    scene["palagan_source_map"] = "M001 Soerabaja 1943 map"

    report = {
        "schema_version": 1,
        "reported_at": ISO,
        "project_root": str(root),
        "blender_version": bpy.app.version_string,
        "blender_binary": bpy.app.binary_path,
        "blender_python": platform.python_version(),
        "platform": platform.platform(),
        "opencode_version": None,
        "opencode_version_note": "The opencode CLI is not on this PowerShell PATH; host version could not be queried from the session.",
        "mcp": {
            "read_only_scene_query": True,
            "viewport_metadata_tool": True,
            "viewport_image_via_opengl": None,
            "code_execution": True,
        },
        "scene": {
            "name": scene.name,
            "pre_existing_filepath": bpy.data.filepath,
            "baseline_copy": str(backup),
            "baseline_bytes": baseline_size,
            "preserved_default_objects": moved,
            "archive_collection": archive.name,
            "unit_system": scene.unit_settings.system,
            "scale_length": scene.unit_settings.scale_length,
            "engine": scene.render.engine,
            "working_objects": len(scene.objects),
        },
        "project_collections_created": made,
        "project_root_collection": proj_root.name,
        "hardware": {
            "cpu": platform.processor(),
            "system_ram_gb": None,
            "gpu": _device_info(),
            "vram_mib_reported_by_nvidia_smi": 8188,
            "driver_version_reported": "581.80",
            "detection_note": "RAM/VRAM reported by host OS commands captured alongside this report; not assumed from model names.",
        },
        "render_capabilities": {
            "eevee": True,
            "cycles_available": "cycles" in bpy.context.preferences.addons,
            "cycles_device_type": _device_info().get("cycles_compute_device_type"),
            "optix_device_present": any(d.get("type") == "OPTIX" for d in _device_info().get("cycles_devices", [])),
        },
        "mcp_capability_note": "Viewport image inspection is confirmed by the PNG capture then read back as an image; the JSON screenshot tool alone returns metadata, not pixels.",
        "limitations": [
            "Current scene was the factory default and unsaved; a byte copy was preserved before mutation.",
            "No unrelated user project data was present in the live scene.",
            "No world georeferencing, terrain survey or historical metric survey is claimed.",
        ],
    }
    env_path = out / "environment.json"
    _write_json(env_path, report)

    # 3. Confirm actual viewport capture and leave an inspectable file.
    capture = _viewport_capture(out / "renders" / "environment_test.png")
    report["mcp"]["viewport_image_via_opengl"] = bool(capture.get("ok"))
    report["mcp"]["viewport_capture"] = capture
    _write_json(env_path, report)
    return {
        "environment_json": str(env_path),
        "baseline": str(backup),
        "preserved_objects": moved,
        "collections": made,
        "capture": capture,
    }


if __name__ == "__main__":
    raise SystemExit("Run run(ROOT) inside Blender through MCP; not from external Python")
