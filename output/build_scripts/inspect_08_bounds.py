"""Report world bounding boxes of key owned objects for camera planning."""
import json
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(bpy.data.filepath).resolve().parents[2]
scene = bpy.context.scene
groups = {}
for ob in scene.objects:
    if ob.type != "MESH":
        continue
    layer = ob.get("palagan_layer") or "?"
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    xs = [p.x for p in pts]; ys = [p.y for p in pts]; zs = [p.z for p in pts]
    g = groups.setdefault(layer, {"min": [1e9]*3, "max": [-1e9]*3, "n": 0})
    g["min"] = [min(g["min"][0], min(xs)), min(g["min"][1], min(ys)), min(g["min"][2], min(zs))]
    g["max"] = [max(g["max"][0], max(xs)), max(g["max"][1], max(ys)), max(g["max"][2], max(zs))]
    g["n"] += 1
for k in sorted(groups):
    g = groups[k]
    g["min"] = [round(v, 1) for v in g["min"]]
    g["max"] = [round(v, 1) for v in g["max"]]
print("BOUNDS " + json.dumps(groups, indent=1))

# individual landmark objects
out = {}
for ob in scene.objects:
    aid = ob.get("palagan_asset_id")
    if not aid or ob.type != "MESH":
        continue
    if not (aid.startswith("LM_") or aid.startswith("R_") or aid.startswith("W_")):
        continue
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    out[aid] = {
        "min": [round(min(p.x for p in pts), 1), round(min(p.y for p in pts), 1), round(min(p.z for p in pts), 1)],
        "max": [round(max(p.x for p in pts), 1), round(max(p.y for p in pts), 1), round(max(p.z for p in pts), 1)],
    }
print("ASSETS " + json.dumps(out, indent=1))
