"""PALAGAN Task 4/5: Algemeene / Gedung Singa riverfront block.

Replaces the LM_SINGA massing with a two-storey arcaded riverfront, a taller
central gabled pavilion, deep tiled roofs, veranda colonnades, timber gable
detail and two simple winged-lion proxies. The roof-sign frame is a separate,
removable object and deliberately carries no lettering.

Evidence: M001 waterfront position (provisional), L007 c.1910 appearance.
Wing symmetry, dimensions, roof form, rear elevations and the 1945 condition
are authored reconstruction. Boats and people are deliberately left to the
environment pass and are not treated as a 1945 inventory.
"""
from __future__ import annotations

import json
import math
import runpy
from pathlib import Path

import bpy
from mathutils import Vector

ORIGIN = (-53.0, 47.0)
ROT_Z = -math.pi / 2
FRONT_Y = 0.0
DEPTH = 18.0
WING_HEIGHT = 10.65


def build(root):
    root = Path(root).expanduser().resolve()
    lib = runpy.run_path(str(root / "output/build_scripts/palagan_build_lib.py"))
    ensure = lib["ensure_collection"]
    clear = lib["clear_owned_layer"]
    MB = lib["MeshBuilder"]
    tag = lib["tag_object"]
    mats = lib["material_set"](root)
    layer = ensure("LM_SINGA")
    clear("LM_SINGA")

    def simple_material(name, base, roughness, metallic=0.0):
        mat = bpy.data.materials.get(name)
        if mat is None:
            mat = lib["make_principled_material"](name, base, roughness, metallic=metallic)
        if mat.use_nodes:
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = base
                bsdf.inputs["Roughness"].default_value = roughness
                bsdf.inputs["Metallic"].default_value = metallic
            mat.diffuse_color = base
        return mat

    plaster = simple_material("MAT_SINGA_PLASTER", (0.69, 0.66, 0.57, 1), 0.86)
    trim = simple_material("MAT_SINGA_TRIM", (0.82, 0.80, 0.71, 1), 0.82)
    timber = simple_material("MAT_SINGA_TIMBER", (0.16, 0.105, 0.07, 1), 0.78)
    interior = simple_material("MAT_SINGA_INTERIOR", (0.055, 0.055, 0.05, 1), 0.94)
    glass = simple_material("MAT_SINGA_GLASS", (0.075, 0.085, 0.085, 1), 0.32, 0.15)
    tile = simple_material("MAT_SINGA_TILE", (0.10, 0.09, 0.08, 1), 0.95)
    if tile.use_nodes:
        tile.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.05
    stone = simple_material("MAT_SINGA_STONE", (0.47, 0.45, 0.39, 1), 0.92)
    metal = simple_material("MAT_SINGA_SIGN_METAL", (0.10, 0.095, 0.085, 1), 0.6, 0.4)
    roof_tile = mats["roof_dark"]

    if not plaster.node_tree.nodes.get("PlasterMicroBump"):
        nt = plaster.node_tree
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.name = "PlasterMicroBump"
        noise.inputs["Scale"].default_value = 7.0
        noise.inputs["Detail"].default_value = 3.0
        noise.location = (-520, -280)
        bump = nt.nodes.new("ShaderNodeBump")
        bump.location = (-240, -280)
        bump.inputs["Strength"].default_value = 0.09
        bump.inputs["Distance"].default_value = 0.045
        nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
        nt.links.new(bump.outputs["Normal"], nt.nodes.get("Principled BSDF").inputs["Normal"])
    if not tile.node_tree.nodes.get("TileBump"):
        nt = tile.node_tree
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.name = "TileBump"
        noise.inputs["Scale"].default_value = 70.0
        noise.inputs["Detail"].default_value = 2.0
        noise.location = (-520, -280)
        bump = nt.nodes.new("ShaderNodeBump")
        bump.location = (-240, -280)
        bump.inputs["Strength"].default_value = 0.18
        bump.inputs["Distance"].default_value = 0.015
        nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
        nt.links.new(bump.outputs["Normal"], nt.nodes.get("Principled BSDF").inputs["Normal"])

    def box(mb, xa, xb, ya, yb, za, zb, mat):
        mb.add_box(((xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2),
                   (xb - xa, yb - ya, zb - za), mat)

    def arch(mb, cx, y, z0, width, height, depth, band, mat):
        mb.add_arch((cx, y, z0), width, height, depth, mat, segments=10, band=band)

    def bar_xz(mb, p0, p1, y, width, depth, mat):
        x0, z0 = p0
        x1, z1 = p1
        dx, dz = x1 - x0, z1 - z0
        ln = math.hypot(dx, dz)
        if ln < 1e-6:
            return
        nx, nz = -dz / ln * width / 2, dx / ln * width / 2
        ya, yb = y - depth / 2, y + depth / 2
        a0 = (x0 + nx, ya, z0 + nz)
        a1 = (x1 + nx, ya, z1 + nz)
        a2 = (x1 - nx, ya, z1 - nz)
        a3 = (x0 - nx, ya, z0 - nz)
        b0 = (x0 + nx, yb, z0 + nz)
        b1 = (x1 + nx, yb, z1 + nz)
        b2 = (x1 - nx, yb, z1 - nz)
        b3 = (x0 - nx, yb, z0 - nz)
        mb.add_quad(a0, a1, a2, a3, mat)
        mb.add_quad(b3, b2, b1, b0, mat)
        mb.add_quad(a0, b0, b1, a1, mat)
        mb.add_quad(a1, b1, b2, a2, mat)
        mb.add_quad(a2, b2, b3, a3, mat)
        mb.add_quad(a3, b3, b0, a0, mat)

    def place(obj):
        obj.location = (ORIGIN[0], ORIGIN[1], 0.0)
        obj.rotation_euler.z = ROT_Z
        return obj

    source = ("M001", "L003", "L007")
    base_assumption = (
        "Provisional west-bank riverfront placement from M001, fitted to the L007 c.1910 composition. "
        "Length/depth are authored; wing symmetry, unseen sides/rear and exact 1945 condition are unresolved. "
        "Paired winged lions are proxies justified only by the municipal identification, not by a close dated image."
    )

    wing_ranges = ((-39.0, -6.5), (6.5, 39.0))
    wing_bays = 7

    # ------------------------------------------------------------------
    # 1. wing volumes, floor slabs, end walls
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_SINGA_WINGS")
    for wx0, wx1 in wing_ranges:
        box(b, wx0, wx1, -DEPTH, -2.35, 0.0, WING_HEIGHT, 0)
        box(b, wx0, wx1, -2.35, 0.1, 5.5, 5.95, 1)   # arcade ceiling / balcony slab
        box(b, wx0, wx1, -2.35, 0.1, 9.95, 10.45, 1) # veranda ceiling / eave band
    # clean outer end walls (inner ends terminate against the central pavilion)
    for wx0, wx1 in wing_ranges:
        if wx0 < 0:
            box(b, wx0 - 0.35, wx0, -2.35, 0.15, 0.0, WING_HEIGHT, 0)
        else:
            box(b, wx1, wx1 + 0.35, -2.35, 0.15, 0.0, WING_HEIGHT, 0)
    wings = b.finish(layer, [plaster, trim],
                     name="PALAGAN_LM_SINGA_WINGS", asset_id="LM_SINGA_WINGS",
                     layer="LM_SINGA", source_ids=source, evidence_status="reconstructed",
                     assumption=base_assumption,
                     extra={"palagan_wing_bays": wing_bays,
                            "palagan_frontage_length_m": 78.0,
                            "palagan_height_status": "authored; no measured section"})
    place(wings)

    # ------------------------------------------------------------------
    # 2. ground arcade and upper veranda colonnades
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_SINGA_ARCADES")
    for wx0, wx1 in wing_ranges:
        bay = (wx1 - wx0) / wing_bays
        for i in range(wing_bays):
            cx = wx0 + (i + 0.5) * bay
            arch(b, cx, -0.25, 0.28, 3.25, 5.35, 0.55, 0.52, 0)
            # arched recess is dark; a simple door/window sits behind it
            box(b, cx - 1.05, cx + 1.05, -2.31, -2.24, 0.35, 4.0, 2)
            box(b, cx - 1.28, cx - 1.08, -2.2, -2.08, 4.05, 4.35, 1)
            box(b, cx + 1.08, cx + 1.28, -2.2, -2.08, 4.05, 4.35, 1)
        # continuous dark wall behind both arcade levels so the recesses read as depth
        box(b, wx0, wx1, -2.34, -2.27, 0.25, 5.55, 3)
        box(b, wx0, wx1, -2.34, -2.27, 5.95, 9.9, 3)
        # storey band / projecting balcony edge
        box(b, wx0, wx1, -0.55, 0.55, 5.55, 5.85, 1)
        # veranda columns and capitals
        for i in range(wing_bays + 1):
            x = wx0 + i * bay
            box(b, x - 0.16, x + 0.16, -0.28, 0.04, 5.85, 9.95, 1)
            box(b, x - 0.25, x + 0.25, -0.38, 0.14, 5.85, 6.05, 1)
            box(b, x - 0.25, x + 0.25, -0.38, 0.14, 9.72, 9.98, 1)
        # upper lintel / eaves band
        box(b, wx0 - 0.2, wx1 + 0.2, -0.42, 0.2, 9.95, 10.45, 1)
        # timber veranda railing
        box(b, wx0, wx1, -0.08, 0.05, 6.12, 6.25, 2)
        box(b, wx0, wx1, -0.08, 0.05, 6.78, 6.9, 2)
        n_bal = int((wx1 - wx0) / 0.45)
        for i in range(n_bal + 1):
            x = wx0 + i * (wx1 - wx0) / n_bal
            box(b, x - 0.028, x + 0.028, -0.06, 0.03, 6.2, 6.85, 2)
    arcades = b.finish(layer, [plaster, trim, timber, interior],
                       name="PALAGAN_LM_SINGA_ARCADES", asset_id="LM_SINGA_ARCADES",
                       layer="LM_SINGA", source_ids=("L007",), evidence_status="reconstructed",
                       assumption="Ground arcade and upper veranda follow L007's visible bays. Exact arch profile, column spacing and railing density are authored from the photograph; hidden bays are inferred.",
                       extra={"palagan_arcade_bays": wing_bays})
    place(arcades)

    # ------------------------------------------------------------------
    # 3. central pavilion
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_SINGA_CENTRAL")
    box(b, -6.5, 6.5, -DEPTH, -2.0, 0.0, 14.0, 0)
    box(b, -6.2, -5.8, -2.0, 2.05, 0.0, 14.0, 1)
    box(b, 5.8, 6.2, -2.0, 2.05, 0.0, 14.0, 1)
    # rear closing walls behind the open arcade, dark to create depth
    box(b, -6.5, 6.5, -2.05, -1.8, 0.0, 5.7, 2)
    box(b, -6.5, 6.5, -2.05, -1.8, 6.5, 10.9, 2)
    # three ground arches and three upper arches
    for cx in (-4.2, 0.0, 4.2):
        arch(b, cx, 1.68, 0.28, 2.9, 5.4, 0.62, 0.54, 0)
        arch(b, cx, 1.68, 6.55, 2.4, 4.0, 0.55, 0.42, 0)
        box(b, cx - 0.85, cx + 0.85, -1.82, -1.76, 0.4, 4.0, 2)
        box(b, cx - 0.8, cx + 0.8, -1.82, -1.76, 6.75, 9.4, 2)
    # balcony, cornices and the projecting central bay
    box(b, -6.6, 6.6, -1.9, 3.1, 5.78, 6.25, 1)
    box(b, -6.5, 6.5, 1.75, 2.5, 5.95, 6.22, 0)
    box(b, -6.5, 6.5, -1.9, 2.55, 11.0, 11.35, 1)
    box(b, -6.5, 6.5, -1.9, 2.55, 13.1, 13.5, 1)
    # balcony balustrade
    for i in range(15):
        x = -5.8 + i * 0.83
        box(b, x - 0.055, x + 0.055, 2.5, 2.62, 6.28, 7.05, 2)
    box(b, -5.8, 5.8, 2.48, 2.65, 6.98, 7.14, 2)
    # front gable face is supplied by the roof layer (single surface, no coplanar wall)
    box(b, -6.5, 6.5, 1.45, 2.02, 13.55, 14.05, 1)
    # entrance steps; the lions flank these
    box(b, -3.6, 3.6, 1.95, 2.55, 0.0, 0.16, 3)
    box(b, -3.4, 3.4, 2.55, 3.05, 0.0, 0.32, 3)
    box(b, -3.2, 3.2, 3.05, 3.5, 0.0, 0.48, 3)
    central = b.finish(layer, [plaster, trim, interior, stone],
                       name="PALAGAN_LM_SINGA_CENTRAL", asset_id="LM_SINGA_CENTRAL",
                       layer="LM_SINGA", source_ids=("L007",), evidence_status="reconstructed",
                       assumption="Central projecting pavilion, its three-arch arcade and balcony follow the L007 composition. Exact bay width, gable pitch and opening heights are authored reconstruction.",
                       extra={"palagan_central_gable": "front_gable_ridge_along_depth",
                              "palagan_arches_central": 3})
    place(central)

    # ------------------------------------------------------------------
    # 4. joinery: veranda doors, gable timber, glass
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_SINGA_JOINERY")
    for wx0, wx1 in wing_ranges:
        bay = (wx1 - wx0) / wing_bays
        for i in range(wing_bays):
            cx = wx0 + (i + 0.5) * bay
            # tall dark veranda door/window with timber frame
            box(b, cx - 1.15, cx + 1.15, -2.3, -2.22, 6.2, 9.45, 3)
            box(b, cx - 1.3, cx - 1.14, -2.2, -2.08, 6.2, 9.55, 1)
            box(b, cx + 1.14, cx + 1.3, -2.2, -2.08, 6.2, 9.55, 1)
            box(b, cx - 1.15, cx + 1.15, -2.2, -2.08, 9.35, 9.55, 1)
            box(b, cx - 0.04, cx + 0.04, -2.19, -2.07, 6.2, 9.4, 1)
    # gable half-timbering
    bar_xz(b, (-6.5, 14.0), (6.5, 14.0), 2.08, 0.3, 0.18, 2)
    for x in (-4.4, 0.0, 4.4):
        top = 19.6 - abs(x) * (5.6 / 6.5) - 0.22
        bar_xz(b, (x, 14.15), (x, top), 2.08, 0.28, 0.16, 2)
    bar_xz(b, (-6.5, 14.25), (0.0, 19.3), 2.08, 0.24, 0.15, 2)
    bar_xz(b, (6.5, 14.25), (0.0, 19.3), 2.08, 0.24, 0.15, 2)
    bar_xz(b, (-4.4, 14.25), (0.0, 17.9), 2.1, 0.16, 0.12, 2)
    bar_xz(b, (4.4, 14.25), (0.0, 17.9), 2.1, 0.16, 0.12, 2)
    # two small gable windows, kept just clear of the plaster gable face
    for cx in (-1.4, 1.4):
        box(b, cx - 0.55, cx + 0.55, 2.03, 2.1, 14.7, 15.9, 3)
        box(b, cx - 0.68, cx + 0.68, 2.1, 2.16, 15.9, 16.05, 1)
        box(b, cx - 0.68, cx + 0.68, 2.1, 2.16, 14.55, 14.7, 1)
    # central entrance doors behind arches
    for cx in (-4.2, 0.0, 4.2):
        box(b, cx - 0.95, cx + 0.95, -1.83, -1.75, 0.35, 4.2, 2)
        box(b, cx - 0.04, cx + 0.04, -1.74, -1.7, 0.35, 4.2, 1)
    joinery = b.finish(layer, [trim, timber, glass],
                       name="PALAGAN_LM_SINGA_JOINERY", asset_id="LM_SINGA_JOINERY",
                       layer="LM_SINGA", source_ids=("L007",), evidence_status="reconstructed",
                       assumption="Doors, glazing and half-timbered gable pattern are authored from visible dark/light rhythms. The photograph cannot resolve individual joinery profiles.")
    place(joinery)

    # ------------------------------------------------------------------
    # 5. roofs, eaves and central steep gable
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_SINGA_ROOFS")
    for wx0, wx1 in wing_ranges:
        b.add_hip_roof(wx0 - 0.2, wx1 + 0.2, -DEPTH, 0.25, 10.42, 3.35, 0,
                       overhang=1.25, ridge_ratio=0.62)
        # fascia board under the eave
        box(b, wx0 - 0.6, wx1 + 0.6, -0.75, 0.9, 10.05, 10.45, 1)
    # gable_mat=2 plaster: the front/back gable faces are the only gable surfaces
    b.add_gable_roof(-6.5, 6.5, -DEPTH, 2.0, 14.0, 5.6, 0, 2,
                     overhang=0.85, ridge_axis="y")
    box(b, -6.9, 6.9, 1.8, 2.9, 13.65, 14.05, 1)
    traces = b.finish(layer, [tile, trim, plaster],
                      name="PALAGAN_LM_SINGA_ROOFS", asset_id="LM_SINGA_ROOFS",
                      layer="LM_SINGA", source_ids=("L007",), evidence_status="reconstructed",
                      assumption="Pitched tiled wing roofs and the steep central gable follow the L007 silhouette. Roof pitch, tile colour and unseen roof construction are inferred; no tile-by-tile survey is implied.")
    place(traces)

    # ------------------------------------------------------------------
    # 6. removable blank roof-sign frame + flagpole
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_SINGA_ROOF_SIGN")
    # open lattice frame, no letters
    for x in (-5.6, 5.6):
        box(b, x - 0.09, x + 0.09, -0.18, 0.18, 19.8, 23.9, 0)
    for z in (20.0, 21.0, 22.0, 23.0, 23.8):
        box(b, -5.8, 5.8, -0.12, 0.12, z - 0.07, z + 0.07, 0)
    for i in range(10):
        x = -5.4 + i * 1.2
        b.add_quad((x, 0.13, 20.05), (x + 1.2, 0.13, 21.0),
                   (x + 1.2, 0.13, 21.1), (x, 0.13, 20.15), 0)
        b.add_quad((x + 1.2, -0.13, 20.05), (x, -0.13, 21.0),
                   (x, -0.13, 21.1), (x + 1.2, -0.13, 20.15), 0)
    # blank sign board is deliberately left unlettered
    box(b, -5.0, 5.0, -0.12, 0.12, 21.8, 23.15, 1)
    # flagpole
    b.add_cylinder((-7.1, 0.0, 19.8), 0.07, 4.8, 0, 8, axis="Z")
    b.add_cylinder((-7.1, 0.0, 24.45), 0.16, 0.3, 1, 8, axis="Z")
    sign = b.finish(layer, [metal, mats["wood"]],
                    name="PALAGAN_LM_SINGA_ROOF_SIGN", asset_id="LM_SINGA_ROOF_SIGN",
                    layer="LM_SINGA", source_ids=("L007",), evidence_status="reconstructed",
                    assumption="L007 shows a large roof sign with legible prewar wording. Its 1945 survival and wording are unresolved, so this is a separate removable lattice frame and blank board; no text has been invented or copied.",
                    extra={"palagan_optional_prop": True,
                           "palagan_lettering_status": "intentionally omitted"})
    place(sign)

    # ------------------------------------------------------------------
    # 7. winged-lion proxies (simple, tagged ornaments)
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_SINGA_LIONS")
    for sx in (-4.6, 4.6):
        # plinth
        box(b, sx - 0.55, sx + 0.55, 3.0, 4.1, 0.0, 0.72, 0)
        box(b, sx - 0.45, sx + 0.45, 3.1, 4.0, 0.72, 1.05, 1)
        # body, legs, chest and head; faces +Y (river)
        box(b, sx - 0.32, sx + 0.32, 3.25, 4.15, 1.05, 1.55, 1)
        for dx in (-0.24, 0.24):
            for dy in (3.3, 3.98):
                box(b, sx + dx - 0.09, sx + dx + 0.09, dy - 0.09, dy + 0.09, 1.0, 1.2, 1)
        box(b, sx - 0.22, sx + 0.22, 4.05, 4.55, 1.42, 1.82, 1)
        box(b, sx - 0.13, sx + 0.13, 4.5, 4.68, 1.5, 1.68, 1)
        # simple wing planes
        for side in (-1, 1):
            b.add_tri((sx + side * 0.3, 3.5, 1.4), (sx + side * 0.95, 3.7, 2.25),
                      (sx + side * 0.3, 4.1, 1.55), 2)
            b.add_tri((sx + side * 0.3, 3.5, 1.4), (sx + side * 0.3, 4.1, 1.55),
                      (sx + side * 0.95, 3.7, 2.25), 2)
        # tail
        box(b, sx - 0.1, sx + 0.1, 3.05, 3.35, 1.35, 1.75, 1)
    lions = b.finish(layer, [stone, trim, plaster],
                     name="PALAGAN_LM_SINGA_LIONS", asset_id="LM_SINGA_LIONS",
                     layer="LM_SINGA", source_ids=("L003",), evidence_status="hypothetical",
                     assumption="Paired winged lions are justified only by the municipal identification. These are deliberately simple 1.8 m-high proxy ornaments, not an anatomical reconstruction; no close dated view supports the pose or detail.",
                     extra={"palagan_proxy_ornament": True})
    place(lions)

    # ------------------------------------------------------------------
    # 8. simple rear and end elevations
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_SINGA_REAR")
    for wx0, wx1 in wing_ranges:
        for i in range(7):
            cx = wx0 + (i + 0.5) * (wx1 - wx0) / 7
            for zc in (2.0, 6.8):
                box(b, cx - 0.75, cx + 0.75, -18.05, -17.97, zc, zc + 1.7, 1)
                box(b, cx - 0.88, cx + 0.88, -17.97, -17.91, zc + 1.7, zc + 1.85, 2)
                box(b, cx - 0.88, cx + 0.88, -17.97, -17.91, zc - 0.13, zc, 2)
                box(b, cx - 0.88, cx - 0.76, -17.97, -17.91, zc, zc + 1.7, 2)
                box(b, cx + 0.76, cx + 0.88, -17.97, -17.91, zc, zc + 1.7, 2)
        box(b, wx0, wx1, -17.9, -17.62, 10.2, 10.55, 2)
    # central pavilion rear windows
    for cx in (-5.0, 0.0, 5.0):
        for zc in (2.0, 7.3):
            box(b, cx - 0.85, cx + 0.85, -18.05, -17.97, zc, zc + 1.9, 1)
            box(b, cx - 0.98, cx + 0.98, -17.97, -17.91, zc + 1.9, zc + 2.05, 2)
            box(b, cx - 0.98, cx + 0.98, -17.97, -17.91, zc - 0.14, zc, 2)
    # side end windows with simple frames
    for sx, inward in ((-39.4, 1), (39.4, -1)):
        for zc in (2.1, 6.9):
            for dy in (-12.0, -6.0):
                box(b, sx - 0.04, sx + 0.04, dy - 0.8, dy + 0.8, zc, zc + 1.7, 1)
                box(b, sx - 0.07, sx + 0.07, dy - 0.92, dy + 0.92, zc + 1.7, zc + 1.84, 2)
                box(b, sx - 0.07, sx + 0.07, dy - 0.92, dy + 0.92, zc - 0.12, zc, 2)
                box(b, sx - 0.07, sx + 0.07, dy - 0.92, dy - 0.8, zc, zc + 1.7, 2)
                box(b, sx - 0.07, sx + 0.07, dy + 0.8, dy + 0.92, zc, zc + 1.7, 2)
    rear = b.finish(layer, [plaster, glass, trim],
                    name="PALAGAN_LM_SINGA_REAR", asset_id="LM_SINGA_REAR",
                    layer="LM_SINGA", source_ids=("L007",), evidence_status="reconstructed",
                    assumption="Rear and end elevations are unobserved in L007. The simple window grid is plausible repeated architectural language, not archival detail.")
    place(rear)

    # ------------------------------------------------------------------
    # camera approximating the riverside L007 view
    # ------------------------------------------------------------------
    cam = bpy.data.objects.get("CAM_SINGA_REFERENCE")
    if cam is None:
        cdata = bpy.data.cameras.new("CAM_SINGA_REFERENCE")
        cam = bpy.data.objects.new("CAM_SINGA_REFERENCE", cdata)
        ensure("CAMERAS").objects.link(cam)
    cam.data.lens = 45.0
    cam.data.sensor_width = 36.0
    cam.data.clip_start = 0.3
    cam.data.clip_end = 4000.0
    cam.location = (-9.0, 112.0, 2.7)
    target = (-55.0, 49.0, 8.6)
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
    tag(cam, "CAM_SINGA_REFERENCE", "CAMERAS", ("L007",), "reconstructed",
        "Approximate riverside view from the east/north-east, low over the water. Lens, height and framing are authored; boats and people are intentionally absent.",
        extra={"palagan_camera_purpose": "Singa frontage and gable comparison",
               "palagan_target_xyz": list(target), "palagan_lens_mm": 45.0})

    scene = bpy.context.scene
    scene["palagan_last_operation"] = "singa-01"
    scene["palagan_singa_status"] = (
        "Detailed two-storey arcaded riverfront with central gabled pavilion, veranda colonnades, "
        "tiled roofs, blank removable roof-sign frame and proxy winged lions. Placement/condition remain reconstructed."
    )
    scene["palagan_singa_checks"] = (
        "Lions and roof lettering are tagged as proxy/optional; no 1945 advertising wording asserted. "
        "Arcade and upper veranda counts follow visible L007 intervals; hidden bays inferred."
    )
    return {
        "objects": len(layer.objects),
        "frontage_m": 78.0,
        "wing_bays": wing_bays,
        "central_gable": True,
        "camera_world": [-9.0, 112.0, 2.7],
        "next": "Render CAM_SINGA_REFERENCE and compare with L007 crop.",
    }


if __name__ == "__main__":
    raise SystemExit("Run build(ROOT) inside Blender")
