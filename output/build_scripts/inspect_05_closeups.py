"""Close-up and map-alignment inspection renders for streets-01. Read-only."""
from __future__ import annotations

import runpy
from pathlib import Path

import bpy
from mathutils import Vector

PROJECT = Path(r"C:\Users\fauzi\OneDrive\Desktop\Budayago")
scene = bpy.context.scene
review = runpy.run_path(str(PROJECT / "output/build_scripts/render_review.py"))

# 1. plan view with the M001 underlay, to check rows against the mapped blocks
print("PLANMAP " + str(review["render"](str(PROJECT), "CAM_PLAN_CHECK",
      "output/renders/_diag_plan_map.png", width=1400, height=1400, samples=24,
      show_map=True)))

# 2. bridgehead / west bank close oblique
cam = bpy.data.objects.new("DIAG_BRIDGEHEAD", bpy.data.cameras.new("DIAG_BRIDGEHEAD"))
scene.collection.objects.link(cam)
cam.data.lens = 50.0
cam.data.clip_start = 0.5
cam.data.clip_end = 4000.0
cam.location = Vector((-140.0, -120.0, 78.0))
target = Vector((-50.0, -10.0, 4.0))
cam.rotation_mode = "QUATERNION"
cam.rotation_quaternion = (target - cam.location).to_track_quat("-Z", "Y")

saved = (scene.camera, scene.render.filepath, scene.render.resolution_x,
         scene.render.resolution_y, scene.render.image_settings.file_format)
try:
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y = 1400, 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(PROJECT / "output/renders/_diag_bridgehead.png")
    print("BRIDGEHEAD", list(bpy.ops.render.render(write_still=True)))
finally:
    (scene.camera, scene.render.filepath, scene.render.resolution_x,
     scene.render.resolution_y, scene.render.image_settings.file_format) = saved
