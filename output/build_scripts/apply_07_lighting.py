"""PALAGAN lighting-01: neutral daylight for review plus a restrained presentation look.

Run inside Blender on a PALAGAN scene. Replaces the flat single-colour world with
a vertical sky gradient, tightens the sun disc so shadows are readable, and sets
exposure. No rainfall, smoke, fire or other unsourced atmosphere is added.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import bpy

def _project_root():
    """Locate the project by a known data file, so checkpoints in subfolders work."""
    here = Path(bpy.data.filepath).resolve()
    for candidate in [here.parent, *here.parents]:
        if (candidate / "data" / "HISTORICAL_LAYOUT.json").is_file():
            return candidate
    raise RuntimeError("Project root not found from " + str(here))


ROOT = _project_root()
PARAMS = ROOT / "output" / "lighting_params.json"
REPORT = ROOT / "output" / "lighting_report.json"
OWNER = "PALAGAN_SURABAYA_V1"

params = json.loads(PARAMS.read_text(encoding="utf-8"))
report = {"world": {}, "sun": {}, "view": {}, "eevee": {}, "warnings": []}

scene = bpy.context.scene

# --------------------------------------------------------------------- world
world = scene.world
if world is None:
    world = bpy.data.worlds.new("World")
    scene.world = world
world["palagan_owner"] = OWNER
if not world.use_nodes:
    world.use_nodes = True
nt = world.node_tree
nt.nodes.clear()

out = nt.nodes.new("ShaderNodeOutputWorld")
out.location = (600, 0)
bg = nt.nodes.new("ShaderNodeBackground")
bg.location = (380, 0)
nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

coord = nt.nodes.new("ShaderNodeTexCoord")
coord.location = (-800, 0)
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
sep.location = (-600, 0)
nt.links.new(coord.outputs["Generated"], sep.inputs["Vector"])

# World "Generated" runs -1..1 on the direction vector; remap so the horizon sits
# at 0.5 and the zenith reaches 1.0.
remap = nt.nodes.new("ShaderNodeMapRange")
remap.location = (-420, 0)
remap.inputs["From Min"].default_value = -0.15
remap.inputs["From Max"].default_value = 1.0
remap.inputs["To Min"].default_value = 0.0
remap.inputs["To Max"].default_value = 1.0
remap.clamp = True
nt.links.new(sep.outputs["Z"], remap.inputs["Value"])

sky = nt.nodes.new("ShaderNodeValToRGB")
sky.name = "SkyGradient"
sky.location = (-200, 0)
els = sky.color_ramp.elements
while len(els) > 1:
    els.remove(els[-1])
stops = params["sky"]["stops"]
for i, stop in enumerate(stops):
    el = els[0] if i == 0 else els.new(stop["position"])
    el.position = stop["position"]
    el.color = tuple(stop["colour"]) + (1.0,)
sky.color_ramp.interpolation = "B_SPLINE"
nt.links.new(remap.outputs["Result"], sky.inputs["Fac"])
nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
bg.inputs["Strength"].default_value = params["sky"]["strength"]

report["world"] = {
    "stops": stops,
    "strength": params["sky"]["strength"],
    "note": params["sky"]["note"],
}

# ----------------------------------------------------------------------- sun
sun_ob = None
for ob in scene.objects:
    if ob.type == "LIGHT" and ob.data.type == "SUN" and not ob.hide_render:
        sun_ob = ob
        break
if sun_ob is None:
    raise RuntimeError("No renderable SUN light found; refusing to invent a new rig")

spec = params["sun"]
sun_ob["palagan_owner"] = OWNER
sun_ob.data.energy = spec["energy"]
sun_ob.data.angle = math.radians(spec["angle_deg"])
sun_ob.data.color = tuple(spec["colour"])
# A SUN lamp points along -Z, so elevation is the complement of the X rotation.
sun_ob.rotation_euler = (math.radians(90.0 - spec["elevation_deg"]), 0.0,
                         math.radians(spec["azimuth_deg"]))
report["sun"] = {"name": sun_ob.name, **spec}

# ----------------------------------------------------------------- view/look
scene.view_settings.view_transform = params["view"]["view_transform"]
scene.view_settings.look = params["view"]["look"]
scene.view_settings.exposure = params["view"]["exposure"]
report["view"] = dict(params["view"])

# -------------------------------------------------------------------- eevee
ee = scene.eevee
for attr, value in params["eevee"].items():
    if attr == "comment":
        continue
    if not hasattr(ee, attr):
        report["warnings"].append("EEVEE has no attribute " + attr)
        continue
    try:
        setattr(ee, attr, value)
        report["eevee"][attr] = value
    except Exception as exc:
        report["warnings"].append(f"eevee.{attr}: {type(exc).__name__}: {exc}")

REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print("LIGHTING APPLIED")
print(json.dumps(report, indent=2))
