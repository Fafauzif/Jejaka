"""Independent footprint validation for the streets-01 fabric.

Reads module records stored on owned objects, rebuilds module footprints, and
tests them against the river polygon, mapped road ribbons, the bridge keepout
and landmark footprints. Read-only.

blender.exe --background output/working/streets-01.blend \
    --python output/build_scripts/validate_05_streets.py
"""
from __future__ import annotations

import json
import math
import runpy
from pathlib import Path

import bpy

PROJECT = Path(r"C:\Users\fauzi\OneDrive\Desktop\Budayago")
lib = runpy.run_path(str(PROJECT / "output/build_scripts/palagan_build_lib.py"))
point_in_polygon = lib["point_in_polygon"]
dist_to_polyline = lib["dist_to_polyline"]

layout = json.loads((PROJECT / "data/HISTORICAL_LAYOUT.json").read_text(encoding="utf-8"))
row_plan = json.loads((PROJECT / "output/row_plan.json").read_text(encoding="utf-8"))
water = next(f for f in layout["features"] if f["feature_id"] == "W_KALIMAS")["local_xy_m"]
roads = row_plan["roads"]

BRIDGE = (-94.0, 34.0, -18.0, 18.0)


def road_hits(x, y, skip_id=None):
    hits = []
    for road in roads:
        if road["id"] == skip_id:
            continue
        if dist_to_polyline(x, y, road["points"]) < road["width"] / 2:
            hits.append(road["id"])
    return hits


issues = {"water": [], "road": [], "bridge": [], "landmark": [], "other": []}
stats = {"modules": 0, "rows": 0, "background_units": 0}

for obj in bpy.context.scene.objects:
    if obj.get("palagan_owner") != "PALAGAN_SURABAYA_V1":
        continue
    layer = obj.get("palagan_layer")
    if layer not in ("STREET_FABRIC", "ST_KEMBANG", "BACKGROUND_CORE"):
        continue
    stats["rows"] += 1
    raw = obj.get("palagan_modules_json")
    records = json.loads(raw) if raw else []
    stats["modules"] += len(records)
    if layer == "BACKGROUND_CORE":
        stats["background_units"] = int(obj.get("palagan_building_count", 0))
        continue
    for rec in records:
        if "normal" not in rec:
            stats["rear_records_skipped"] = stats.get("rear_records_skipped", 0) + 1
            continue
        fx, fy = rec["world_front"]
        nx, ny = rec["normal"]
        width, depth = rec["width"], rec["depth"]
        # world_frame(): front sits at road edge + sidewalk, body runs along +normal
        tx, ty = -ny, nx
        corners = [
            (fx + tx * width / 2, fy + ty * width / 2),
            (fx - tx * width / 2, fy - ty * width / 2),
            (fx - tx * width / 2 + nx * depth, fy - ty * width / 2 + ny * depth),
            (fx + tx * width / 2 + nx * depth, fy + ty * width / 2 + ny * depth),
        ]
        cx = sum(p[0] for p in corners) / 4
        cy = sum(p[1] for p in corners) / 4
        if any(point_in_polygon(p[0], p[1], water) for p in corners) or point_in_polygon(cx, cy, water):
            issues["water"].append((obj.name, rec.get("s_m"), round(cx, 1), round(cy, 1)))
        for p in corners:
            hits = road_hits(p[0], p[1], rec.get("road_id"))
            if hits:
                issues["road"].append((obj.name, rec.get("s_m"), hits, [round(p[0], 1), round(p[1], 1)]))
                break
        x0, x1, y0, y1 = BRIDGE
        if x0 < cx < x1 and y0 < cy < y1:
            issues["bridge"].append((obj.name, rec.get("s_m"), round(cx, 1), round(cy, 1)))

summary = {
    "objects_examined": stats["rows"],
    "module_records": stats["modules"],
    "background_units": stats["background_units"],
    "rear_records_skipped": stats.get("rear_records_skipped", 0),
    "water_violations": len(issues["water"]),
    "road_violations": len(issues["road"]),
    "bridge_violations": len(issues["bridge"]),
    "samples": {k: v[:5] for k, v in issues.items() if v},
}
print("VALIDATION " + json.dumps(summary, indent=2))
