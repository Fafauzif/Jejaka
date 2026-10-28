"""Eye-level review of the bridge approaches. Read-only."""
from pathlib import Path
import bpy
from mathutils import Vector

PROJECT = Path(r"C:\Users\fauzi\OneDrive\Desktop\Budayago")
scene = bpy.context.scene
underlay = bpy.data.objects.get("PALAGAN_MAP_UNDERLAY")

def shot(name, loc, target, lens):
    cam = bpy.data.objects.new(name, bpy.data.cameras.new(name))
    scene.collection.objects.link(cam)
    cam.data.lens = lens; cam.data.clip_start = 0.3; cam.data.clip_end = 4000.0
    cam.location = Vector(loc)
    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = (Vector(target) - cam.location).to_track_quat("-Z", "Y")
    scene.camera = cam
    scene.render.filepath = str(PROJECT / ("output/renders/_diag_%s.png" % name.lower()))
    print(name, list(bpy.ops.render.render(write_still=True)))

saved = (scene.camera, scene.render.filepath, scene.render.resolution_x,
         scene.render.resolution_y, scene.render.image_settings.file_format,
         underlay.hide_render if underlay else None)
try:
    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 32
    scene.render.resolution_x, scene.render.resolution_y = 1300, 820
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    if underlay:
        underlay.hide_render = True
    # east bridgehead looking west along the bridge and across the river
    shot("EAST_APPROACH", (60.0, -14.0, 2.1), (-90.0, -4.0, 6.0), 35.0)
    # west bridgehead looking east down Heerenstraat
    shot("WEST_HEEREN", (-78.0, -30.0, 2.1), (120.0, 30.0, 8.0), 32.0)
finally:
    (scene.camera, scene.render.filepath, scene.render.resolution_x,
     scene.render.resolution_y, scene.render.image_settings.file_format) = saved[:5]
    if underlay and saved[5] is not None:
        underlay.hide_render = saved[5]
