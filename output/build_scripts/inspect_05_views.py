"""Diagnostic views for streets-01 review. Renders only; never saves the .blend.

blender.exe --background output/working/streets-01.blend \
    --python output/build_scripts/inspect_05_views.py
"""
from __future__ import annotations

from pathlib import Path

import bpy
from mathutils import Vector

PROJECT = Path(r"C:\Users\fauzi\OneDrive\Desktop\Budayago")
scene = bpy.context.scene
underlay = bpy.data.objects.get("PALAGAN_MAP_UNDERLAY")

views = []


def add(name, location, target, lens):
    cam = bpy.data.objects.get(name)
    if cam is None:
        data = bpy.data.cameras.new(name)
        cam = bpy.data.objects.new(name, data)
        scene.collection.objects.link(cam)
    cam.data.lens = lens
    cam.data.sensor_width = 36.0
    cam.data.clip_start = 0.5
    cam.data.clip_end = 6000.0
    cam.location = Vector(location)
    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = (Vector(target) - cam.location).to_track_quat("-Z", "Y")
    views.append(cam)


# top-down over the river core (orthographic-ish via long lens and height)
add("DIAG_PLAN_CORE", (-60.0, 60.0, 620.0), (-60.0, 60.0, 0.0), 60.0)
# close oblique on the west-bank fabric south of the bridge (suspicious roofs)
add("DIAG_WEST_SOUTH", (-150.0, -110.0, 70.0), (-40.0, -40.0, 6.0), 55.0)
# eye-level down Kembang Djepoen from the north end, looking south
add("DIAG_KEMBANG_NORTH", (150.0, 150.0, 2.2), (150.0, -120.0, 6.0), 32.0)
# east bank Heerenstraat from above the river
add("DIAG_HEEREN", (10.0, -60.0, 55.0), (120.0, 40.0, 4.0), 40.0)

saved = (scene.camera, scene.render.filepath, scene.render.resolution_x,
         scene.render.resolution_y, scene.render.resolution_percentage,
         scene.render.image_settings.file_format, underlay.hide_render if underlay else None)
try:
    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 32
    scene.render.resolution_x, scene.render.resolution_y = 1100, 760
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    if underlay:
        underlay.hide_render = True
    for cam in views:
        out = PROJECT / ("output/renders/_diag_%s.png" % cam.name.lower())
        scene.camera = cam
        scene.render.filepath = str(out)
        result = bpy.ops.render.render(write_still=True)
        print("DIAG", cam.name, list(result), out.stat().st_size if out.is_file() else 0)
finally:
    (scene.camera, scene.render.filepath, scene.render.resolution_x,
     scene.render.resolution_y, scene.render.resolution_percentage,
     scene.render.image_settings.file_format) = saved[:6]
    if underlay and saved[6] is not None:
        underlay.hide_render = saved[6]
