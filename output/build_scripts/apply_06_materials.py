"""PALAGAN materials-01: rebuild owned material node trees from the palette file.

Run inside Blender on a PALAGAN scene. Only materials tagged with the project
owner are touched; anything else is skipped and reported. Texture sets are the
CC0 production resources recorded in assets/ASSET_CATALOG.json; they are not
historical evidence for colour or condition.
"""
from __future__ import annotations

import json
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
PALETTE = ROOT / "output" / "material_palette.json"
REPORT = ROOT / "output" / "materials_report.json"
OWNER = "PALAGAN_SURABAYA_V1"

pal = json.loads(PALETTE.read_text(encoding="utf-8"))
TEX = {k: {kk: ROOT / vv for kk, vv in v.items() if kk in ("diffuse", "rough", "normal")}
       for k, v in pal["texture_sets"].items()}
UV = {k: v["uv_repeat"] for k, v in pal["uv_metres"].items() if isinstance(v, dict)}

report = {"changed": [], "skipped": [], "missing_images": [], "eevee": {}, "warnings": []}


# ---------------------------------------------------------------- node helpers
def owned_mat(name):
    mat = bpy.data.materials.get(name)
    if mat is None:
        report["skipped"].append({"material": name, "reason": "not in scene"})
        return None
    if mat.get("palagan_owner") != OWNER:
        report["skipped"].append({"material": name, "reason": "not PALAGAN-owned"})
        return None
    if not mat.use_nodes:
        mat.use_nodes = True
    mat.node_tree.nodes.clear()
    return mat


def wire(nt, a, sa, b, sb):
    """Link two sockets; accepts socket objects or a node plus a socket name."""
    if isinstance(sa, bpy.types.NodeSocket):
        src = sa
    elif isinstance(a, bpy.types.NodeSocket):
        src = a
    else:
        src = a.outputs[sa]
    if isinstance(sb, bpy.types.NodeSocket):
        dst = sb
    elif isinstance(b, bpy.types.NodeSocket):
        dst = b
    else:
        dst = b.inputs[sb]
    nt.links.new(src, dst)


def colour_sockets(node):
    return [s for s in node.inputs if s.type == "RGBA"]


def colour_output(node):
    return [s for s in node.outputs if s.type == "RGBA"][0]


def out_node(nt):
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (960, 0)
    return out


def bsdf_node(nt, base, roughness, metallic=0.0, ior=1.45):
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.location = (660, 0)
    b.inputs["Base Color"].default_value = (base[0], base[1], base[2], 1.0)
    b.inputs["Roughness"].default_value = roughness
    b.inputs["Metallic"].default_value = metallic
    if "IOR" in b.inputs:
        b.inputs["IOR"].default_value = ior
    return b


def image_node(nt, path, colorspace, loc):
    if path is None or not path.is_file():
        report["missing_images"].append(str(path))
        return None
    img = bpy.data.images.load(str(path), check_existing=True)
    if colorspace:
        img.colorspace_settings.name = colorspace
    node = nt.nodes.new("ShaderNodeTexImage")
    node.image = img
    node.location = loc
    return node


def uv_socket(nt, repeat, loc=(-1240, 0)):
    """Repeats per metre; the project MeshBuilder writes UVs in metres."""
    coord = nt.nodes.new("ShaderNodeTexCoord")
    coord.location = (loc[0] - 180, loc[1])
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.name = "UVRepeat"
    mapping.location = loc
    mapping.inputs["Scale"].default_value = (repeat, repeat, repeat)
    wire(nt, coord, "UV", mapping, "Vector")
    return mapping.outputs["Vector"]


def object_noise(nt, scale, detail=3.0, roughness=0.55, loc=(-980, -520)):
    coord = nt.nodes.new("ShaderNodeTexCoord")
    coord.location = (loc[0] - 180, loc[1])
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.name = "Mottle"
    noise.location = loc
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = detail
    noise.inputs["Roughness"].default_value = roughness
    wire(nt, coord, "Object", noise, "Vector")
    return noise


def mix_colour(nt, fac, a, b, loc, blend="MIX", name=None, factor=None):
    node = nt.nodes.new("ShaderNodeMix")
    node.data_type = "RGBA"
    node.blend_type = blend
    node.location = loc
    if name:
        node.name = name
    sockets = colour_sockets(node)
    sockets[0].default_value = (a[0], a[1], a[2], 1.0)
    sockets[1].default_value = (b[0], b[1], b[2], 1.0)
    if isinstance(fac, (int, float)):
        node.inputs["Factor"].default_value = float(fac)
    elif fac is not None:
        wire(nt, fac[0], fac[1], node, "Factor")
        if factor is not None:
            node.inputs["Factor"].default_value = factor
    return node, colour_output(node)


def ramp(nt, loc, stops, name=None):
    node = nt.nodes.new("ShaderNodeValToRGB")
    node.location = loc
    if name:
        node.name = name
    els = node.color_ramp.elements
    while len(els) > 1:
        els.remove(els[-1])
    for i, (pos, col) in enumerate(stops):
        e = els[0] if i == 0 else els.new(pos)
        e.position = pos
        e.color = (col[0], col[1], col[2], 1.0) if len(col) == 3 else col
    return node


def tint_chain(nt, tex_key, uv_repeat, tint, saturation=1.0, value=1.0,
               flatten=0.0, loc=(-900, 300)):
    """Texture -> optional desaturation -> multiply tint, preserving texture detail."""
    vec = uv_socket(nt, uv_repeat, loc=(loc[0] - 240, loc[1]))
    diff = image_node(nt, TEX[tex_key]["diffuse"], "sRGB", loc)
    if diff is None:
        return None, None, None, None
    wire(nt, vec, "Vector", diff, "Vector")
    hue = nt.nodes.new("ShaderNodeHueSaturation")
    hue.name = "TexAdjust"
    hue.location = (loc[0] + 200, loc[1])
    hue.inputs["Saturation"].default_value = saturation
    hue.inputs["Value"].default_value = value
    wire(nt, diff, "Color", hue, "Color")
    source = hue.outputs["Color"]
    if flatten > 0.0:
        # Reduce the sample's own tonal variance so it reads as one wall material.
        flat = nt.nodes.new("ShaderNodeMix")
        flat.data_type = "RGBA"
        flat.blend_type = "MIX"
        flat.location = (loc[0] + 320, loc[1])
        flat_sockets = colour_sockets(flat)
        flat.inputs["Factor"].default_value = float(flatten)
        flat_sockets[1].default_value = (0.52, 0.52, 0.52, 1.0)
        wire(nt, hue, "Color", flat_sockets[0], None)
        source = colour_output(flat)
    mul, col = mix_colour(nt, None, (1, 1, 1), tint, (loc[0] + 480, loc[1]),
                          blend="MULTIPLY", name="TexTint")
    mul.inputs["Factor"].default_value = 1.0
    wire(nt, source, None, colour_sockets(mul)[0], None)
    return vec, col, source, diff


def texture_maps(nt, tex_key, vec, loc=(-900, 60), normal_strength=0.3):
    rough_t = image_node(nt, TEX[tex_key]["rough"], "Non-Color", loc)
    norm_t = image_node(nt, TEX[tex_key]["normal"], "Non-Color", (loc[0], loc[1] - 300))
    if rough_t is not None and vec is not None:
        wire(nt, vec, "Vector", rough_t, "Vector")
    if norm_t is not None and vec is not None:
        wire(nt, vec, "Vector", norm_t, "Vector")
    nm = None
    if norm_t is not None:
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nm.location = (loc[0] + 420, loc[1] - 300)
        nm.inputs["Strength"].default_value = normal_strength
        wire(nt, norm_t, "Color", nm, "Color")
    return rough_t, norm_t, nm


# ------------------------------------------------------------------- families
def build_glass(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    base, sheen = spec["base"], spec["sheen"]
    b = bsdf_node(nt, base, spec["roughness"], 0.0, ior=1.50)
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")

    # EEVEE screen-space tracing cannot reflect the sky off a vertical panel, so
    # the grazing reflection is mixed explicitly and modulated across the surface
    # so a run of shopfronts does not read as one flat black band.
    layer = nt.nodes.new("ShaderNodeLayerWeight")
    layer.location = (-980, 260)
    layer.inputs["Blend"].default_value = 0.30
    fres = ramp(nt, (-780, 260), [(spec["fresnel_edge"], (0, 0, 0)), (1.0, (1, 1, 1))],
                name="GlassFresnel")
    wire(nt, layer, "Facing", fres, "Fac")

    noise = object_noise(nt, 0.9, detail=2.0, roughness=0.5, loc=(-980, 40))
    var = ramp(nt, (-780, 40), [(0.0, (1 - spec["variation"],) * 3), (1.0, (1.0, 1.0, 1.0))],
               name="GlassVariation")
    wire(nt, noise, "Fac", var, "Fac")

    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.location = (-520, 200)
    mul.inputs["Factor"].default_value = 1.0
    mul_sockets = colour_sockets(mul)
    mul_sockets[0].default_value = (0, 0, 0, 1)
    mul_sockets[1].default_value = (1, 1, 1, 1)
    wire(nt, fres, "Color", mul_sockets[0], None)
    wire(nt, var, "Color", mul_sockets[1], None)

    _, col = mix_colour(nt, (mul, colour_output(mul)), base, sheen, (-260, 260), name="GlassSheen")
    wire(nt, col, "Color", b, "Base Color")

    rough = nt.nodes.new("ShaderNodeMapRange")
    rough.location = (-520, -180)
    rough.inputs["To Min"].default_value = spec["roughness"] * 0.7
    rough.inputs["To Max"].default_value = spec["roughness"] * 1.8
    wire(nt, var, "Color", rough, "Value")
    wire(nt, rough, "Result", b, "Roughness")

    mat.diffuse_color = (base[0], base[1], base[2], 1.0)
    report["changed"].append({"material": name, "family": "glass", "nodes": len(nt.nodes)})


def build_plain(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["base"], spec["roughness"], spec.get("metallic", 0.0))
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    if spec.get("mottle"):
        noise = object_noise(nt, 0.35, detail=2.0, loc=(-880, -260))
        _, col = mix_colour(nt, (noise, "Fac"),
                            [c * (1 - spec["mottle"]) for c in spec["base"]],
                            [min(1.0, c * (1 + spec["mottle"])) for c in spec["base"]],
                            (-420, -160))
        wire(nt, col, "Color", b, "Base Color")
    mat.diffuse_color = (spec["base"][0], spec["base"][1], spec["base"][2], 1.0)
    report["changed"].append({"material": name, "family": "plain", "nodes": len(nt.nodes)})


def build_roof(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, (0.5, 0.4, 0.32), spec["roughness"])
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")

    vec, col, _, _ = tint_chain(nt, "roof_tiles", UV["clay_roof"], spec["tint"],
                                saturation=spec.get("saturation", 1.0),
                                value=spec.get("value", 1.0),
                                flatten=spec.get("flatten", 0.28), loc=(-1020, 380))

    # Low-frequency weathering breaks up the tile repeat along a long terrace.
    noise = object_noise(nt, 0.06, detail=3.0, loc=(-1000, -560))
    mottle = ramp(nt, (-700, -560),
                  [(0.30, (1 - spec["mottle"],) * 3), (0.78, (1.0, 1.0, 1.0))],
                  name="RoofMottle")
    wire(nt, noise, "Fac", mottle, "Fac")
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.location = (-200, 300)
    mul.inputs["Factor"].default_value = 1.0
    roof_sockets = colour_sockets(mul)
    wire(nt, col, "Color", roof_sockets[0], None)
    wire(nt, mottle, "Color", roof_sockets[1], None)
    wire(nt, colour_output(mul), "Result", b, "Base Color")

    rough_t, _, nm = texture_maps(nt, "roof_tiles", vec, loc=(-1020, 60),
                                  normal_strength=spec["normal_strength"])
    if rough_t is not None:
        wire(nt, rough_t, "Color", b, "Roughness")
    if nm is not None:
        wire(nt, nm, "Normal", b, "Normal")
    mat.diffuse_color = (0.34, 0.24, 0.18, 1.0)
    report["changed"].append({"material": name, "family": "roof", "nodes": len(nt.nodes)})


def build_facade(name, spec):
    """Colourised plaster that keeps the texture's tonal detail."""
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["tint"], spec["roughness"])
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    vec, col, _, _ = tint_chain(nt, "plaster", UV["plaster_wall"], spec["tint"],
                                saturation=spec.get("saturation", 0.55),
                                value=spec.get("value", 1.0),
                                flatten=spec.get("flatten", 0.55), loc=(-1020, 380))
    wire(nt, col, "Color", b, "Base Color")
    rough_t, _, nm = texture_maps(nt, "plaster", vec, loc=(-1020, 60),
                                  normal_strength=spec.get("normal_strength", 0.22))
    if rough_t is not None:
        wire(nt, rough_t, "Color", b, "Roughness")
    if nm is not None:
        wire(nt, nm, "Normal", b, "Normal")
    mat.diffuse_color = (spec["tint"][0], spec["tint"][1], spec["tint"][2], 1.0)
    report["changed"].append({"material": name, "family": "facade", "nodes": len(nt.nodes)})


def build_brick(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["tint"], spec["roughness"])
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    vec, col, _, _ = tint_chain(nt, "brick", UV["brick_wall"], spec["tint"],
                                saturation=spec.get("saturation", 0.75),
                                value=spec.get("value", 1.0),
                                flatten=spec.get("flatten", 0.30), loc=(-1020, 380))
    wire(nt, col, "Color", b, "Base Color")
    rough_t, _, nm = texture_maps(nt, "brick", vec, loc=(-1020, 60),
                                  normal_strength=spec.get("normal_strength", 0.4))
    if rough_t is not None:
        wire(nt, rough_t, "Color", b, "Roughness")
    if nm is not None:
        wire(nt, nm, "Normal", b, "Normal")
    mat.diffuse_color = (spec["tint"][0], spec["tint"][1], spec["tint"][2], 1.0)
    report["changed"].append({"material": name, "family": "brick", "nodes": len(nt.nodes)})


def build_wood(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["tint"], spec["roughness"])
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    vec, col, _, _ = tint_chain(nt, "wood", UV["timber"], spec["tint"],
                                saturation=spec.get("saturation", 0.85),
                                value=spec.get("value", 1.0),
                                flatten=spec.get("flatten", 0.20), loc=(-1020, 380))
    wire(nt, col, "Color", b, "Base Color")
    rough_t, _, nm = texture_maps(nt, "wood", vec, loc=(-1020, 60),
                                  normal_strength=spec.get("normal_strength", 0.3))
    if rough_t is not None:
        wire(nt, rough_t, "Color", b, "Roughness")
    if nm is not None:
        wire(nt, nm, "Normal", b, "Normal")
    mat.diffuse_color = (spec["tint"][0], spec["tint"][1], spec["tint"][2], 1.0)
    report["changed"].append({"material": name, "family": "wood", "nodes": len(nt.nodes)})


def build_stone(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["tint"], spec["roughness"])
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    vec, col, _, _ = tint_chain(nt, "plaster", UV["plaster_wall"], spec["tint"],
                                saturation=spec.get("saturation", 0.35),
                                value=spec.get("value", 1.0),
                                flatten=spec.get("flatten", 0.60), loc=(-1020, 380))
    wire(nt, col, "Color", b, "Base Color")
    rough_t, _, nm = texture_maps(nt, "plaster", vec, loc=(-1020, 60),
                                  normal_strength=spec.get("normal_strength", 0.3))
    if rough_t is not None:
        wire(nt, rough_t, "Color", b, "Roughness")
    if nm is not None:
        wire(nt, nm, "Normal", b, "Normal")
    mat.diffuse_color = (spec["tint"][0], spec["tint"][1], spec["tint"][2], 1.0)
    report["changed"].append({"material": name, "family": "stone", "nodes": len(nt.nodes)})


def build_asphalt(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["base"], spec["roughness"])
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    noise = object_noise(nt, 2.4, detail=4.0, roughness=0.6, loc=(-980, -200))
    _, col = mix_colour(nt, (noise, "Fac"),
                        [c * (1 - spec["aggregate"]) for c in spec["base"]],
                        [c * (1 + spec["aggregate"]) for c in spec["base"]],
                        (-440, 260))
    wire(nt, col, "Color", b, "Base Color")
    agg = object_noise(nt, 26.0, detail=2.0, loc=(-980, -600))
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-440, -420)
    bump.inputs["Strength"].default_value = 0.22
    bump.inputs["Distance"].default_value = 0.01
    wire(nt, agg, "Fac", bump, "Height")
    wire(nt, bump, "Normal", b, "Normal")
    track = object_noise(nt, 0.22, detail=1.0, loc=(-980, -100))
    rmap = nt.nodes.new("ShaderNodeMapRange")
    rmap.location = (-440, -120)
    rmap.inputs["To Min"].default_value = spec["roughness"] * 0.55
    rmap.inputs["To Max"].default_value = spec["roughness"]
    wire(nt, track, "Fac", rmap, "Value")
    wire(nt, rmap, "Result", b, "Roughness")
    mat.diffuse_color = (spec["base"][0], spec["base"][1], spec["base"][2], 1.0)
    report["changed"].append({"material": name, "family": "asphalt", "nodes": len(nt.nodes)})


def build_setts(name, spec):
    """Grey stone setts: the brick diffuse is desaturated hard so it reads as paving."""
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["tint"], spec["roughness"])
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    vec, col, _, _ = tint_chain(nt, "brick", UV["setts_paving"], spec["tint"],
                                saturation=spec.get("saturation", 0.10),
                                value=spec.get("value", 1.0),
                                flatten=spec.get("flatten", 0.45), loc=(-1020, 380))
    wire(nt, col, "Color", b, "Base Color")
    # Break the bond pattern's regularity across a long footway.
    noise = object_noise(nt, 0.25, detail=2.0, loc=(-1000, -420))
    wear = ramp(nt, (-700, -420), [(0.28, (0.86,) * 3), (0.72, (1.08,) * 3)], name="SettWear")
    wire(nt, noise, "Fac", wear, "Fac")
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.location = (-260, 320)
    mul.inputs["Factor"].default_value = 1.0
    sett_sockets = colour_sockets(mul)
    wire(nt, col, "Color", sett_sockets[0], None)
    wire(nt, wear, "Color", sett_sockets[1], None)
    wire(nt, colour_output(mul), "Result", b, "Base Color")

    rough_t, _, nm = texture_maps(nt, "brick", vec, loc=(-1020, 60),
                                  normal_strength=spec.get("normal_strength", 0.28))
    if rough_t is not None:
        wire(nt, rough_t, "Color", b, "Roughness")
    if nm is not None:
        wire(nt, nm, "Normal", b, "Normal")
    mat.diffuse_color = (spec["tint"][0], spec["tint"][1], spec["tint"][2], 1.0)
    report["changed"].append({"material": name, "family": "setts", "nodes": len(nt.nodes)})


def build_earth(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["base"], spec["roughness"])
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    large = object_noise(nt, 0.02, detail=4.0, roughness=0.6, loc=(-1040, 320))
    _, col = mix_colour(nt, (large, "Fac"), spec["base"], spec["green"], (-480, 320))
    fine = object_noise(nt, 1.6, detail=3.0, loc=(-1040, -200))
    _, col2 = mix_colour(nt, (fine, "Fac"),
                         [c * 0.82 for c in spec["base"]],
                         [c * 1.14 for c in spec["base"]], (-480, 40))
    final = nt.nodes.new("ShaderNodeMix")
    final.data_type = "RGBA"
    final.blend_type = "OVERLAY"
    final.location = (-200, 200)
    final.inputs["Factor"].default_value = 0.6
    earth_sockets = colour_sockets(final)
    wire(nt, col, "Result", earth_sockets[0], None)
    wire(nt, col2, "Result", earth_sockets[1], None)
    wire(nt, colour_output(final), "Result", b, "Base Color")
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-440, -560)
    bump.inputs["Strength"].default_value = 0.18
    bump.inputs["Distance"].default_value = 0.02
    wire(nt, fine, "Fac", bump, "Height")
    wire(nt, bump, "Normal", b, "Normal")
    mat.diffuse_color = (spec["base"][0], spec["base"][1], spec["base"][2], 1.0)
    report["changed"].append({"material": name, "family": "earth", "nodes": len(nt.nodes)})


def build_canvas(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["base"], spec["roughness"])
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    noise = object_noise(nt, 3.5, detail=2.0, loc=(-980, 220))
    _, col = mix_colour(nt, (noise, "Fac"),
                        [c * 0.86 for c in spec["base"]],
                        [min(1.0, c * 1.10) for c in spec["base"]], (-440, 300))
    wire(nt, col, "Color", b, "Base Color")
    weave = object_noise(nt, 40.0, detail=1.0, loc=(-980, -380))
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-440, -380)
    bump.inputs["Strength"].default_value = 0.10
    bump.inputs["Distance"].default_value = 0.004
    wire(nt, weave, "Fac", bump, "Height")
    wire(nt, bump, "Normal", b, "Normal")
    mat.diffuse_color = (spec["base"][0], spec["base"][1], spec["base"][2], 1.0)
    report["changed"].append({"material": name, "family": "canvas", "nodes": len(nt.nodes)})


def build_water(name, spec):
    mat = owned_mat(name)
    if mat is None:
        return
    nt = mat.node_tree
    b = bsdf_node(nt, spec["base"], spec["roughness"], 0.0, ior=1.33)
    out = out_node(nt)
    wire(nt, b, "BSDF", out, "Surface")
    layer = nt.nodes.new("ShaderNodeLayerWeight")
    layer.location = (-980, 260)
    layer.inputs["Blend"].default_value = 0.35
    fres = ramp(nt, (-760, 260), [(spec.get("fresnel_edge", 0.42), (0, 0, 0)),
                                  (1.0, (1, 1, 1))], name="WaterFresnel")
    wire(nt, layer, "Facing", fres, "Fac")
    _, col = mix_colour(nt, (fres, "Color"), spec["base"], spec["sheen"], (-380, 260))
    wire(nt, col, "Color", b, "Base Color")

    coord = nt.nodes.new("ShaderNodeTexCoord")
    coord.location = (-1280, -400)
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.name = "RippleScale"
    mapping.location = (-1100, -400)
    mapping.inputs["Scale"].default_value = (1.0, 2.6, 1.0)
    wire(nt, coord, "Object", mapping, "Vector")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.name = "WaterRipple"
    noise.location = (-880, -400)
    noise.inputs["Scale"].default_value = 0.55
    noise.inputs["Detail"].default_value = 5.0
    noise.inputs["Roughness"].default_value = 0.62
    wire(nt, mapping, "Vector", noise, "Vector")
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-440, -400)
    bump.inputs["Strength"].default_value = spec.get("ripple_strength", 0.16)
    bump.inputs["Distance"].default_value = spec.get("ripple_distance", 0.30)
    wire(nt, noise, "Fac", bump, "Height")
    wire(nt, bump, "Normal", b, "Normal")
    rough = nt.nodes.new("ShaderNodeMapRange")
    rough.location = (-440, 40)
    rough.inputs["To Min"].default_value = spec["roughness"] * 0.7
    rough.inputs["To Max"].default_value = spec["roughness"] * 1.9
    wire(nt, noise, "Fac", rough, "Value")
    wire(nt, rough, "Result", b, "Roughness")
    mat.diffuse_color = (spec["base"][0], spec["base"][1], spec["base"][2], 1.0)
    report["changed"].append({"material": name, "family": "water", "nodes": len(nt.nodes)})


BUILDERS = {
    "glass": build_glass,
    "plain": build_plain,
    "roof": build_roof,
    "facade": build_facade,
    "brick": build_brick,
    "wood": build_wood,
    "stone": build_stone,
    "asphalt": build_asphalt,
    "setts": build_setts,
    "earth": build_earth,
    "canvas": build_canvas,
    "water": build_water,
}

for name, spec in pal["materials"].items():
    builder = BUILDERS.get(spec["family"])
    if builder is None:
        report["warnings"].append("no builder for family " + str(spec["family"]))
        continue
    try:
        builder(name, spec)
    except Exception as exc:  # report and continue; do not abort the whole pass
        report["warnings"].append(f"{name}: {type(exc).__name__}: {exc}")

# ---------------------------------------------------------------- render settings
scene = bpy.context.scene
ee = scene.eevee
for attr, value in pal["eevee"].items():
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
rt = ee.ray_tracing_options
for attr, value in pal.get("eevee_ray_tracing_options", {}).items():
    if hasattr(rt, attr):
        try:
            setattr(rt, attr, value)
            report["eevee"]["rt." + attr] = value
        except Exception as exc:
            report["warnings"].append(f"rt.{attr}: {type(exc).__name__}: {exc}")

report["material_count"] = len(bpy.data.materials)
report["image_count"] = len(bpy.data.images)
REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print("CHANGED", len(report["changed"]), "SKIPPED", len(report["skipped"]),
      "WARN", len(report["warnings"]))
print("WROTE", REPORT)
for w in report["warnings"]:
    print("  WARN:", w)
