"""PALAGAN review render helper (run inside Blender)."""
from __future__ import annotations

import json
from pathlib import Path

import bpy


def render(root, camera_name, relative_png, width=1600, height=1000, samples=32,
           show_map=False, engine="BLENDER_EEVEE"):
    root = Path(root)
    scene = bpy.context.scene
    cam = bpy.data.objects.get(camera_name)
    if cam is None or cam.type != "CAMERA":
        raise ValueError("Missing camera " + camera_name)
    underlay = bpy.data.objects.get("PALAGAN_MAP_UNDERLAY")
    saved = {
        "camera": scene.camera,
        "x": scene.render.resolution_x,
        "y": scene.render.resolution_y,
        "pct": scene.render.resolution_percentage,
        "filepath": scene.render.filepath,
        "format": scene.render.image_settings.file_format,
        "engine": scene.render.engine,
        "map_hide": underlay.hide_render if underlay else None,
    }
    try:
        scene.camera = cam
        scene.render.engine = engine
        scene.render.resolution_x = int(width)
        scene.render.resolution_y = int(height)
        scene.render.resolution_percentage = 100
        scene.render.image_settings.file_format = "PNG"
        if hasattr(scene, "eevee") and engine == "BLENDER_EEVEE":
            try:
                scene.eevee.taa_render_samples = int(samples)
            except Exception:
                pass
        if underlay:
            underlay.hide_render = not bool(show_map)
        out = root / relative_png
        out.parent.mkdir(parents=True, exist_ok=True)
        scene.render.filepath = str(out)
        result = bpy.ops.render.render(write_still=True)
        if "FINISHED" not in result or not out.is_file():
            raise RuntimeError("Render failed: " + str(out))
        return {"written": str(out), "bytes": out.stat().st_size, "camera": camera_name,
                "resolution": [width, height], "show_map": show_map, "engine": engine}
    finally:
        scene.camera = saved["camera"]
        scene.render.resolution_x = saved["x"]
        scene.render.resolution_y = saved["y"]
        scene.render.resolution_percentage = saved["pct"]
        scene.render.filepath = saved["filepath"]
        scene.render.image_settings.file_format = saved["format"]
        scene.render.engine = saved["engine"]
        if underlay and saved["map_hide"] is not None:
            underlay.hide_render = saved["map_hide"]


def batch(root, items):
    out = []
    for item in items:
        out.append(render(root, **item))
    return out
