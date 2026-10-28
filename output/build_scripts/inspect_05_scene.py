"""Headless inspection + engine smoke test for the saved singa-01 scene.

External command:
  blender.exe --background output/working/singa-01.blend \
      --python output/build_scripts/inspect_05_scene.py

Read-only apart from the small test PNG.
"""
from __future__ import annotations

import json
from pathlib import Path

import bpy

ROOT = Path(bpy.path.abspath("//")).resolve().parent  # output/working -> output
PROJECT = ROOT.parent
scene = bpy.context.scene

report = {
    "blend": bpy.data.filepath,
    "scene": scene.name,
    "blender": bpy.app.version_string,
    "background": bool(bpy.app.background),
    "engine": scene.render.engine,
    "last_operation": scene.get("palagan_last_operation"),
    "checkpoint_at": scene.get("palagan_checkpoint_at"),
    "objects": len(bpy.data.objects),
    "materials": len(bpy.data.materials),
    "collections": sorted(c.name for c in bpy.data.collections),
    "cameras": sorted(o.name for o in bpy.data.objects if o.type == "CAMERA"),
    "owned": sum(1 for o in scene.objects if o.get("palagan_owner") == "PALAGAN_SURABAYA_V1"),
    "street_fabric_objects": sorted(o.name for o in bpy.data.objects
                                   if o.get("palagan_layer") in ("STREET_FABRIC", "ST_KEMBANG",
                                                                 "BACKGROUND_CORE")),
    "render_settings": {
        "res": [scene.render.resolution_x, scene.render.resolution_y],
        "filepath": scene.render.filepath,
        "camera": scene.camera.name if scene.camera else None,
    },
    "world_strength": (scene.world.node_tree.nodes["Background"].inputs[1].default_value
                       if scene.world and scene.world.use_nodes else None),
    "exposure": scene.view_settings.exposure,
}
print("INSPECT_JSON " + json.dumps(report, indent=2))

# ---- tiny EEVEE smoke render (GPU context availability in background mode)
cam = bpy.data.objects.get("CAM_FABRIC_OVERVIEW")
print("HAS_OVERVIEW_CAM", bool(cam))
if cam:
    out = PROJECT / "output/renders/_headless_test.png"
    saved = (scene.camera, scene.render.filepath, scene.render.resolution_x,
             scene.render.resolution_y, scene.render.resolution_percentage,
             scene.render.image_settings.file_format)
    try:
        scene.camera = cam
        scene.render.engine = "BLENDER_EEVEE"
        scene.render.resolution_x, scene.render.resolution_y = 480, 300
        scene.render.resolution_percentage = 100
        scene.render.image_settings.file_format = "PNG"
        scene.render.filepath = str(out)
        result = bpy.ops.render.render(write_still=True)
        print("TEST_RENDER", list(result), out.is_file(), out.stat().st_size if out.is_file() else 0)
    finally:
        (scene.camera, scene.render.filepath, scene.render.resolution_x,
         scene.render.resolution_y, scene.render.resolution_percentage,
         scene.render.image_settings.file_format) = saved
