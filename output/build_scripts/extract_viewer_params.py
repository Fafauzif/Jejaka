"""Read lighting, water and camera parameters from the master scene for the web viewer.

Run headless inside Blender 5.2. Read-only: opens the master, prints JSON, never saves.
The output is consumed by output/viewer/index.html so the viewer's sun, sky and preset
cameras match the Blender review renders instead of being re-guessed in JavaScript.

    blender -b -noaudio --python output/build_scripts/extract_viewer_params.py
"""
from __future__ import annotations

import json
import math
import os

import bpy
import mathutils

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MASTER = os.path.join(ROOT, "output", "PALAGAN_Surabaya_Master.blend")

out: dict = {}

bpy.ops.wm.open_mainfile(filepath=MASTER)

# ---------------------------------------------------------------- sun
sun = bpy.data.objects.get("PALAGAN_SUN")
if sun is None:
    for o in bpy.data.objects:
        if o.type == "LIGHT" and o.data.type == "SUN":
            sun = o
            break
if sun is not None:
    # A Blender lamp emits along its local -Z.
    d = mathutils.Vector(sun.matrix_world.col[2][:3]) * -1.0
    d.normalize()
    out["sun_object"] = sun.name
    # Unit vector pointing FROM the scene TOWARDS the sun (three.js light position).
    out["sun_direction_towards_sun"] = [round(v, 6) for v in d]
    out["sun_rotation_euler_deg"] = [round(math.degrees(a), 3) for a in sun.rotation_euler]
    out["sun_energy"] = sun.data.energy
    out["sun_angle_deg"] = round(math.degrees(sun.data.angle), 4)
    out["sun_color"] = [round(c, 5) for c in sun.data.color]

# ------------------------------------------------- elevation / azimuth in world terms
if "sun_direction_towards_sun" in out:
    dx, dy, dz = out["sun_direction_towards_sun"]
    out["sun_elevation_deg"] = round(math.degrees(math.asin(max(-1.0, min(1.0, dz)))), 3)
    out["sun_azimuth_xy_deg"] = round(math.degrees(math.atan2(dy, dx)), 3)

# ---------------------------------------------------------------- world / view
world = bpy.context.scene.world
if world is not None and world.use_nodes:
    for n in world.node_tree.nodes:
        if n.type == "BACKGROUND":
            out["world_strength"] = n.inputs["Strength"].default_value
            break

sc = bpy.context.scene
out["view_transform"] = sc.view_settings.view_transform
out["look"] = sc.view_settings.look
out["exposure"] = sc.view_settings.exposure


# ---------------------------------------------------------------- helpers
def world_extents(obj):
    xs, ys, zs = [], [], []
    for corner in obj.bound_box:
        p = obj.matrix_world @ mathutils.Vector(corner)
        xs.append(p.x)
        ys.append(p.y)
        zs.append(p.z)
    return {
        "min": [round(min(xs), 3), round(min(ys), 3), round(min(zs), 3)],
        "max": [round(max(xs), 3), round(max(ys), 3), round(max(zs), 3)],
    }


geo = {}
for name in (
    "PALAGAN_KALIMAS_WATER",
    "PALAGAN_KALIMAS_BED",
    "PALAGAN_LAND_EAST",
    "PALAGAN_LAND_WEST",
):
    o = bpy.data.objects.get(name)
    if o is not None:
        geo[name] = world_extents(o)
out["geo"] = geo

# ------------------------------------------------- water material authored values
wm = bpy.data.materials.get("MAT_KALIMAS_WATER")
if wm is not None and wm.use_nodes:
    bsdf = next((n for n in wm.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is not None:
        out["water_base_color"] = [round(c, 4) for c in bsdf.inputs["Base Color"].default_value]
        out["water_roughness"] = round(bsdf.inputs["Roughness"].default_value, 4)
        out["water_metallic"] = round(bsdf.inputs["Metallic"].default_value, 4)
out["water_objects"] = [
    o.name
    for o in bpy.data.objects
    if o.type == "MESH"
    and o.data.materials
    and any(m is not None and m.name == "MAT_KALIMAS_WATER" for m in o.data.materials)
]

# ---------------------------------------------------------------- preset cameras
# Blender is Z-up / Y-forward; export_yup writes glTF as Y-up, so a Blender point
# (x, y, z) lands at three.js (x, z, -y). Every camera is converted here once so the
# hand-written viewer never has to remember the axis swap.
def blz(v):
    return [round(v[0], 4), round(v[2], 4), round(-v[1], 4)]


cams = {}
for o in bpy.data.objects:
    if o.type != "CAMERA":
        continue
    loc = list(o.matrix_world.translation)
    stored = o.get("palagan_target_xyz")
    if not stored:
        fwd = mathutils.Vector(o.matrix_world.col[2][:3]) * -1.0
        stored = [loc[i] + fwd[i] * 50.0 for i in range(3)]
    entry = {
        "blender_position": [round(v, 3) for v in loc],
        "blender_target": [round(v, 3) for v in stored],
        "position": blz(loc),
        "target": blz(stored),
        "lens_mm": round(o.data.lens, 2),
        "type": o.data.type,
        "sensor_width": round(o.data.sensor_width, 2),
    }
    if o.data.type == "ORTHO":
        entry["ortho_scale"] = round(o.data.ortho_scale, 2)
    if o.get("palagan_purpose"):
        entry["purpose"] = o.get("palagan_purpose")
    cams[o.name] = entry
out["cameras"] = cams

# ---------------------------------------------------------------- identity checks
# Landmark world positions let the viewer verify the axis swap against known geometry.
lm = {}
for n in (
    "PALAGAN_LM_BRIDGE_DECK",
    "PALAGAN_LM_INTERNATIO_BODY",
    "PALAGAN_LM_SINGA_CENTRAL",
):
    o = bpy.data.objects.get(n)
    if o is not None:
        lm[n] = {"blender": [round(v, 3) for v in o.matrix_world.translation],
                 "three_js": blz(list(o.matrix_world.translation))}
out["landmark_positions"] = lm

out["source_scene"] = os.path.relpath(MASTER, ROOT).replace("\\", "/")
out["source_operation"] = sc.get("palagan_last_operation")
out["object_count"] = len(bpy.data.objects)

print("===VIEWER_PARAMS===")
print(json.dumps(out, indent=2))
print("===END===")
