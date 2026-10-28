"""PALAGAN Task 4: core street fabric from the mapped road alignments.

Builds deterministic typological shophouse rows along the eight core roads,
plus sidewalks. Kembang Djepoen uses the L008-derived vocabulary; other rows
are the same family transferred as a typological reconstruction from M001.

No building-by-building 1945 inventory is claimed. Widths, storeys, facade
colours, shopfront detail and roof forms are authored assumptions. Blank sign
boards are intentionally unlettered. The script is rerunnable and only touches
objects in the STREET_FABRIC and ST_KEMBANG layers.
"""
from __future__ import annotations

import json
import math
import random
import runpy
from pathlib import Path

import bpy
from mathutils import Vector

OWNER = "PALAGAN_SURABAYA_V1"
SIDEWALK = 3.8
GAP = 0.03
MIN_MODULE = 4.6
BRIDGE_KEEPOUT = (-94.0, 34.0, -18.0, 18.0)  # xmin, xmax, ymin, ymax

CORE_ROADS = {
    "R_HEEREN": 380.0,
    "R_KEMBANG": 380.0,
    "R_WILLEMS": 330.0,
    "R_OOSTER": 330.0,
    "R_CHINEESCHE": 330.0,
    "R_PARADE": 470.0,
    "R_BOOM": 270.0,
    "R_KALISOSOK": 560.0,
}


def build(root, dry_run=False):
    root = Path(root).expanduser().resolve()
    lib = runpy.run_path(str(root / "output/build_scripts/palagan_build_lib.py"))
    ensure = lib["ensure_collection"]
    clear = lib["clear_owned_layer"]
    MB = lib["MeshBuilder"]
    tag = lib["tag_object"]
    mats = lib["material_set"](root)
    sample = lib["sample_polyline"]
    plen = lib["polyline_length"]
    offset_polyline = lib["offset_polyline"]
    point_in_polygon = lib["point_in_polygon"]
    polygon_overlaps_obb = lib["polygon_overlaps_obb"]
    dist_to_polyline = lib["dist_to_polyline"]
    ribbon = lib["ribbon"]
    save_json = lib["save_project_json"]

    row_plan = json.loads((root / "output/row_plan.json").read_text(encoding="utf-8"))
    layout = json.loads((root / "data/HISTORICAL_LAYOUT.json").read_text(encoding="utf-8"))
    water = next(f for f in layout["features"] if f["feature_id"] == "W_KALIMAS")["local_xy_m"]
    roads = row_plan["roads"]
    road_by_id = {r["id"]: r for r in roads}
    features = {f["feature_id"]: f for f in layout["features"]}

    def obb_keepout(cx, cy, length, depth, angle_deg, buffer=4.0):
        a = math.radians(angle_deg)
        ca, sa = math.cos(a), math.sin(a)
        hl, hd = length / 2 + buffer, depth / 2 + buffer
        out = []
        for lx, ly in ((-hl, -hd), (hl, -hd), (hl, hd), (-hl, hd)):
            out.append((cx + lx * ca - ly * sa, cy + lx * sa + ly * ca))
        return out

    def bbox_keepout(poly, buffer=4.0):
        xs = [p[0] for p in poly]
        ys = [p[1] for p in poly]
        return [(min(xs) - buffer, min(ys) - buffer), (max(xs) + buffer, min(ys) - buffer),
                (max(xs) + buffer, max(ys) + buffer), (min(xs) - buffer, max(ys) + buffer)]

    landmark_keepouts = []
    intr = row_plan["internatio"]
    landmark_keepouts.append(("LM_INTERNATIO", obb_keepout(
        intr["center"][0], intr["center"][1], intr["length"], intr["depth"], intr["angle_deg"], 4.0)))
    singa = row_plan["singa"]
    sx0 = singa["front_x"] - singa["depth"] - 4.0
    sx1 = singa["front_x"] + 2.0 + 4.0
    sy0, sy1 = singa["y_range"][0] - 4.0, singa["y_range"][1] + 4.0
    landmark_keepouts.append(("LM_SINGA", [(sx0, sy0), (sx1, sy0), (sx1, sy1), (sx0, sy1)]))
    for fid in ("F_PWD_1", "F_PHONE", "F_POST_7", "F_TRADING_62"):
        f = features.get(fid)
        if f:
            landmark_keepouts.append((fid, bbox_keepout(f["local_xy_m"], 4.0)))

    fabric_layer = ensure("STREET_FABRIC")
    kembang_layer = ensure("ST_KEMBANG")
    background_layer = ensure("BACKGROUND_CORE")
    if not dry_run:
        removed = clear("STREET_FABRIC") + clear("ST_KEMBANG") + clear("BACKGROUND_CORE")
    else:
        removed = []

    def simple_material(name, base, roughness, metallic=0.0, specular=None):
        mat = bpy.data.materials.get(name)
        if mat is None:
            mat = lib["make_principled_material"](name, base, roughness, metallic=metallic)
        if mat.use_nodes:
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = base
                bsdf.inputs["Roughness"].default_value = roughness
                bsdf.inputs["Metallic"].default_value = metallic
                if specular is not None:
                    bsdf.inputs["Specular IOR Level"].default_value = specular
            mat.diffuse_color = base
        return mat

    plaster_dir = root / "assets/materials/grey_plaster"
    diff_img = bpy.data.images.load(str(plaster_dir / "grey_plaster_diff_1k.jpg"), check_existing=True)
    rough_img = bpy.data.images.load(str(plaster_dir / "grey_plaster_rough_1k.jpg"), check_existing=True)
    normal_img = bpy.data.images.load(str(plaster_dir / "grey_plaster_nor_gl_1k.jpg"), check_existing=True)

    def make_plaster(name, dark, light, roughness=0.9):
        mat = bpy.data.materials.get(name)
        if mat is not None:
            if mat.use_nodes:
                ramp = mat.node_tree.nodes.get("FacadeRamp")
                if ramp:
                    ramp.color_ramp.elements[0].color = dark
                    ramp.color_ramp.elements[1].color = light
                bsdf = mat.node_tree.nodes.get("Principled BSDF")
                if bsdf:
                    bsdf.inputs["Roughness"].default_value = roughness
            mat.diffuse_color = light
            return mat
        mat = bpy.data.materials.new(name)
        mat["palagan_owner"] = OWNER
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()
        out = nodes.new("ShaderNodeOutputMaterial")
        out.location = (720, 0)
        bsdf = nodes.new("ShaderNodeBsdfPrincipled")
        bsdf.location = (400, 0)
        links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
        bsdf.inputs["Roughness"].default_value = roughness
        coord = nodes.new("ShaderNodeTexCoord")
        coord.location = (-920, 0)
        mapping = nodes.new("ShaderNodeMapping")
        mapping.location = (-740, 0)
        mapping.inputs["Scale"].default_value = (0.32, 0.32, 0.32)
        links.new(coord.outputs["UV"], mapping.inputs["Vector"])
        tex = nodes.new("ShaderNodeTexImage")
        tex.name = "FacadeMap"
        tex.location = (-520, 220)
        tex.image = diff_img
        links.new(mapping.outputs["Vector"], tex.inputs["Vector"])
        ramp = nodes.new("ShaderNodeValToRGB")
        ramp.name = "FacadeRamp"
        ramp.location = (-260, 220)
        ramp.color_ramp.elements[0].position = 0.08
        ramp.color_ramp.elements[0].color = dark
        ramp.color_ramp.elements[1].position = 0.92
        ramp.color_ramp.elements[1].color = light
        links.new(tex.outputs["Color"], ramp.inputs["Fac"])
        links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
        rtex = nodes.new("ShaderNodeTexImage")
        rtex.name = "FacadeRough"
        rtex.location = (-520, -100)
        rtex.image = rough_img
        rtex.image.colorspace_settings.name = "Non-Color"
        links.new(mapping.outputs["Vector"], rtex.inputs["Vector"])
        links.new(rtex.outputs["Color"], bsdf.inputs["Roughness"])
        ntex = nodes.new("ShaderNodeTexImage")
        ntex.name = "FacadeNormal"
        ntex.location = (-520, -400)
        ntex.image = normal_img
        ntex.image.colorspace_settings.name = "Non-Color"
        nmap = nodes.new("ShaderNodeNormalMap")
        nmap.name = "FacadeNormalMap"
        nmap.location = (-230, -400)
        nmap.inputs["Strength"].default_value = 0.25
        links.new(mapping.outputs["Vector"], ntex.inputs["Vector"])
        links.new(ntex.outputs["Color"], nmap.inputs["Color"])
        links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
        mat.diffuse_color = light
        return mat

    facade_cream = make_plaster("MAT_FACADE_CREAM", (0.44, 0.37, 0.26, 1), (0.79, 0.69, 0.52, 1), 0.92)
    facade_ochre = make_plaster("MAT_FACADE_OCHRE", (0.36, 0.26, 0.15, 1), (0.66, 0.50, 0.30, 1), 0.93)
    facade_rose = make_plaster("MAT_FACADE_ROSE", (0.38, 0.27, 0.24, 1), (0.65, 0.48, 0.42, 1), 0.93)
    facade_sage = make_plaster("MAT_FACADE_SAGE", (0.30, 0.34, 0.26, 1), (0.52, 0.57, 0.44, 1), 0.93)
    facade_pale = make_plaster("MAT_FACADE_PALE", (0.45, 0.48, 0.45, 1), (0.74, 0.76, 0.69, 1), 0.92)

    trim = simple_material("MAT_STREET_TRIM", (0.78, 0.75, 0.66, 1), 0.86)
    party = simple_material("MAT_STREET_PARTY", (0.50, 0.47, 0.40, 1), 0.94)
    roof_a = simple_material("MAT_STREET_ROOF_A", (0.155, 0.115, 0.092, 1), 0.95, specular=0.04)
    roof_b = simple_material("MAT_STREET_ROOF_B", (0.115, 0.105, 0.095, 1), 0.96, specular=0.04)
    interior = simple_material("MAT_STREET_INTERIOR", (0.045, 0.045, 0.040, 1), 0.95)
    metal = simple_material("MAT_STREET_METAL", (0.085, 0.082, 0.075, 1), 0.58, metallic=0.55)
    sidewalk_mat = mats["setts"]
    awning_light = simple_material("MAT_AWNING_CANVAS", (0.52, 0.45, 0.34, 1), 0.96)
    awning_dark = simple_material("MAT_AWNING_DARK", (0.20, 0.18, 0.15, 1), 0.97)

    for mat in (roof_a, roof_b):
        if mat.use_nodes and not mat.node_tree.nodes.get("RoofBump"):
            nt = mat.node_tree
            noise = nt.nodes.new("ShaderNodeTexNoise")
            noise.name = "RoofBump"
            noise.inputs["Scale"].default_value = 55.0
            noise.inputs["Detail"].default_value = 2.0
            noise.location = (-500, -260)
            bump = nt.nodes.new("ShaderNodeBump")
            bump.location = (-240, -260)
            bump.inputs["Strength"].default_value = 0.16
            bump.inputs["Distance"].default_value = 0.012
            nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
            nt.links.new(bump.outputs["Normal"], nt.nodes.get("Principled BSDF").inputs["Normal"])

    palette = [
        facade_cream,            # 0
        facade_ochre,            # 1
        facade_rose,             # 2
        facade_sage,             # 3
        facade_pale,             # 4
        trim,                    # 5
        mats["glass"],           # 6
        mats["wood"],            # 7
        roof_a,                  # 8
        roof_b,                  # 9
        awning_light,            # 10
        mats["stone"],           # 11
        metal,                   # 12
        interior,                # 13
        awning_dark,             # 14
        mats["brick"],           # 15
        party,                   # 16
    ]

    # ---------------------------------------------------------------
    # placement helpers
    # ---------------------------------------------------------------
    def box(b, x0, x1, y0, y1, z0, z1, mat=0):
        b.add_box(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2),
                  (abs(x1 - x0), abs(y1 - y0), abs(z1 - z0)), mat)

    def dist_point_segment(px, py, ax, ay, bx, by):
        dx, dy = bx - ax, by - ay
        ln2 = dx * dx + dy * dy
        if ln2 < 1e-12:
            return math.hypot(px - ax, py - ay)
        t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / ln2))
        return math.hypot(px - (ax + t * dx), py - (ay + t * dy))

    def water_distance(x, y):
        best = 1e9
        n = len(water)
        for i in range(n):
            ax, ay = water[i]
            bx, by = water[(i + 1) % n]
            best = min(best, dist_point_segment(x, y, ax, ay, bx, by))
        return best

    def in_water(x, y):
        return point_in_polygon(x, y, water)

    def bridge_blocked(corners):
        xmin, xmax, ymin, ymax = BRIDGE_KEEPOUT
        keepout = [(xmin, ymin), (xmax, ymin), (xmax, ymax), (xmin, ymax)]
        return polygon_overlaps_obb(corners, keepout) or any(
            xmin <= x <= xmax and ymin <= y <= ymax for x, y in corners)

    def exclusion_blocked(corners):
        for _name, keepout in landmark_keepouts:
            if polygon_overlaps_obb(corners, keepout):
                return True
        return False

    def road_corridor_blocked(corners, cx, cy, own_road, road_margin=1.5):
        for r in roads:
            if r["id"] == own_road:
                continue
            if any(dist_to_polyline(x, y, r["points"]) < r["width"] / 2 + road_margin for x, y in corners):
                return True
            if dist_to_polyline(cx, cy, r["points"]) < r["width"] / 2 + road_margin + 2.7:
                return True
        return False

    def footprint_ok(corners, occupied, own_road, road_margin=1.5):
        # water, bridge, landmark keepouts
        pts = list(corners)
        pts.append(((corners[0][0] + corners[1][0]) / 2, (corners[0][1] + corners[1][1]) / 2))
        pts.append(((corners[1][0] + corners[2][0]) / 2, (corners[1][1] + corners[2][1]) / 2))
        pts.append(((corners[2][0] + corners[3][0]) / 2, (corners[2][1] + corners[3][1]) / 2))
        pts.append(((corners[3][0] + corners[0][0]) / 2, (corners[3][1] + corners[0][1]) / 2))
        cx = sum(p[0] for p in corners) / 4
        cy = sum(p[1] for p in corners) / 4
        pts.append((cx, cy))
        if any(in_water(x, y) for x, y in pts):
            return False, "water"
        if any(water_distance(x, y) < 2.8 for x, y in pts):
            return False, "bank"
        if bridge_blocked(corners):
            return False, "bridge"
        if exclusion_blocked(corners):
            return False, "landmark"
        if road_corridor_blocked(corners, cx, cy, own_road, road_margin):
            return False, "intersection"
        for other in occupied:
            if polygon_overlaps_obb(corners, other):
                return False, "overlap"
        return True, "ok"

    # ---------------------------------------------------------------
    # module vocabulary
    # ---------------------------------------------------------------
    def window(b, cx, y0, z0, width=0.9, height=1.5, detail=1, shutters=False):
        x0, x1 = cx - width / 2, cx + width / 2
        z1 = z0 + height
        if shutters and detail <= 1:
            for sx0, sx1 in ((x0 - 0.44, x0 - 0.08), (x1 + 0.08, x1 + 0.44)):
                box(b, sx0, sx1, y0 - 0.055, y0 + 0.002, z0, z1, 7)
                for k in range(1, 4):
                    gx = sx0 + (sx1 - sx0) * k / 4
                    box(b, gx - 0.012, gx + 0.012, y0 - 0.075, y0 - 0.045, z0 + 0.06, z1 - 0.06, 5)
        if detail <= 1:
            box(b, x0, x1, y0 - 0.045, y0 - 0.012, z0, z1, 6)
            box(b, x0 - 0.075, x0, y0 - 0.10, y0 + 0.015, z0, z1, 5)
            box(b, x1, x1 + 0.075, y0 - 0.10, y0 + 0.015, z0, z1, 5)
            box(b, x0 - 0.075, x1 + 0.075, y0 - 0.10, y0 + 0.015, z0 - 0.075, z0, 5)
            box(b, x0 - 0.075, x1 + 0.075, y0 - 0.10, y0 + 0.015, z1, z1 + 0.075, 5)
            box(b, x0 - 0.13, x1 + 0.13, y0 - 0.15, y0 + 0.02, z0 - 0.16, z0 - 0.075, 11)
            box(b, x0 - 0.13, x1 + 0.13, y0 - 0.16, y0 + 0.02, z1 + 0.075, z1 + 0.17, 5)
        else:
            box(b, x0, x1, y0 - 0.025, y0, z0, z1, 6)
            box(b, x0 - 0.06, x0, y0 - 0.06, y0 + 0.01, z0, z1, 5)
            box(b, x1, x1 + 0.06, y0 - 0.06, y0 + 0.01, z0, z1, 5)
            box(b, x0 - 0.06, x1 + 0.06, y0 - 0.06, y0 + 0.01, z0 - 0.06, z0, 5)
            box(b, x0 - 0.06, x1 + 0.06, y0 - 0.06, y0 + 0.01, z1, z1 + 0.06, 5)

    def shop_module(width, depth, storeys, variant, facade, roof_mat, seed, detail=1,
                    roof_style="parallel", awning_mat=10):
        b = MB("module")
        h1 = 3.45
        h2 = 3.0
        h = h1 + (storeys - 1) * h2
        w = width
        # stone plinth; inset 6 mm from the party edge so its side face is not coplanar
        box(b, -w / 2 + 0.006, w / 2 - 0.006, -0.055, 0.02, 0.0, 0.18, 11)
        # upper body sits flush at the street; ground floor is recessed 0.35 m
        if h > h1 + 0.01:
            box(b, -w / 2, w / 2, 0.0, depth, h1, h, facade)
        box(b, -w / 2, w / 2, 0.35, depth, 0.0, h1, facade)
        # ground-floor side piers and lintel
        box(b, -w / 2, -w / 2 + 0.55, 0.0, 0.35, 0.0, h1, facade)
        box(b, w / 2 - 0.55, w / 2, 0.0, 0.35, 0.0, h1, facade)
        box(b, -w / 2 + 0.55, w / 2 - 0.55, 0.0, 0.35, 2.75, h1, facade)
        # vertical party pilasters give each narrow frontage a readable edge
        for px in (-w / 2 + 0.012, w / 2 - 0.132):
            box(b, px, px + 0.12, -0.045, 0.02, 0.18, h - 0.01, 16)
            box(b, px - 0.02, px + 0.14, -0.075, 0.035, h - 0.18, h + 0.04, 5)
        # dark shop interior
        box(b, -w / 2 + 0.55, w / 2 - 0.55, 0.345, 0.365, 0.18, 2.75, 13)
        # shopfront: timber stall riser with glazing above, divided by mullions
        opening0, opening1 = -w / 2 + 0.62, w / 2 - 0.62
        mid = (opening0 + opening1) / 2
        # door position is needed before the glazing so no pane fights the leaf
        door_x = opening0 + 0.65 if seed % 2 == 0 else mid
        has_folding = seed % 3 == 0
        door_l, door_r = door_x - 0.42, door_x + 0.42
        for gx0, gx1 in ((opening0, max(opening0, door_l)),
                         (min(opening1, door_r), opening1)):
            if gx1 - gx0 < 0.30:
                continue
            box(b, gx0, gx1, 0.20, 0.26, 0.14, 0.92, 7)
            box(b, gx0, gx1, 0.175, 0.205, 0.90, 0.98, 5)
            pane_n = max(2, min(5, int(round((gx1 - gx0) / 1.15))))
            for i in range(pane_n):
                px0 = gx0 + (gx1 - gx0) * i / pane_n
                px1 = gx0 + (gx1 - gx0) * (i + 1) / pane_n
                box(b, px0 + 0.03, max(px0 + 0.05, px1 - 0.03), 0.22, 0.26, 0.98, 2.30, 6)
            for i in range(pane_n + 1):
                mx = gx0 + (gx1 - gx0) * i / pane_n
                box(b, max(gx0, mx - 0.045), min(gx1, mx + 0.045), 0.175, 0.27, 0.90, 2.36, 7)
        # transom glazing above the shopfront
        box(b, opening0, opening1, 0.18, 0.22, 2.35, 2.62, 6)
        for tx in (opening0 + (opening1 - opening0) / 3, opening0 + 2 * (opening1 - opening0) / 3):
            box(b, tx - 0.035, tx + 0.035, 0.16, 0.25, 2.36, 2.66, 7)
        box(b, opening0, opening1, 0.15, 0.29, 2.62, 2.75, 7)
        box(b, opening0, opening1, 0.15, 0.29, 0.0, 0.14, 11)
        # door leaf, hung between the glazed panels
        fx0, fx1 = opening0, mid - 0.08
        box(b, door_l, door_r, 0.19, 0.30, 0.15, 2.3, 7)
        door_hidden = has_folding and fx0 <= door_x <= fx1
        if not door_hidden and abs(door_x - mid) > 0.1:
            box(b, door_x - 0.06, door_x + 0.06, 0.17, 0.31, 0.35, 2.2, 5)
        # closed timber folding shopfront on some modules
        if has_folding:
            box(b, fx0, fx1, 0.13, 0.17, 0.14, 2.32, 7)
            npanel = max(3, int((fx1 - fx0) / 0.55))
            for k in range(1, npanel):
                gx = fx0 + (fx1 - fx0) * k / npanel
                box(b, gx - 0.018, gx + 0.018, 0.10, 0.20, 0.16, 2.30, 5)
        # canopy / awning
        if detail <= 2:
            proj = 1.45 if detail == 1 else 1.15
            z_in = h1 - 0.42
            z_out = z_in - 0.28
            x0a, x1a = -w / 2 + 0.15, w / 2 - 0.15
            # thin sloped canvas awning: top, underside, front and side edges
            b.add_quad((x0a, -proj, z_out), (x1a, -proj, z_out),
                       (x1a, 0.02, z_in), (x0a, 0.02, z_in), awning_mat)
            b.add_quad((x0a, 0.02, z_in - 0.06), (x1a, 0.02, z_in - 0.06),
                       (x1a, -proj, z_out - 0.06), (x0a, -proj, z_out - 0.06), awning_mat)
            box(b, x0a + 0.005, x1a - 0.005, -proj - 0.02, -proj + 0.02, z_out - 0.06, z_out + 0.01, awning_mat)
            b.add_quad((x0a, -proj, z_out - 0.06), (x0a, -proj, z_out),
                       (x0a, 0.02, z_in), (x0a, 0.02, z_in - 0.06), awning_mat)
            b.add_quad((x1a, 0.02, z_in - 0.06), (x1a, 0.02, z_in),
                       (x1a, -proj, z_out), (x1a, -proj, z_out - 0.06), awning_mat)
            # hanging valance at the front edge
            box(b, x0a + 0.005, x1a - 0.005, -proj - 0.035, -proj + 0.005, z_out - 0.20, z_out - 0.06, awning_mat)
            # simple brackets from the facade to mid-awning
            for bx in (-w / 2 + 0.45, w / 2 - 0.45):
                b.add_box((bx, -0.50, z_in - 0.12), (0.06, 1.0, 0.06), 7)
        # upper windows
        upper_start = h1
        nwin = max(2, int(round(w / 3.3)))
        span = w - 1.5
        for f in range(1, storeys):
            z0 = upper_start + (f - 1) * h2 + 0.95
            for i in range(nwin):
                cx = -span / 2 + span * (i + 0.5) / nwin
                shut = detail == 1 and ((int(seed) + f * 7 + i * 3) % 5 == 0)
                window(b, cx, 0.0, z0, width=0.82 if w < 9 else 0.92,
                       height=1.5, detail=detail, shutters=shut)
            # floor band, inset from the party edge
            box(b, -w / 2 + 0.006, w / 2 - 0.006, -0.015, 0.02, upper_start + (f - 1) * h2 - 0.08,
                upper_start + (f - 1) * h2 + 0.08, 5)
        # balcony variant
        if variant == "B" and detail == 1:
            bz = h1
            box(b, -w / 2 + 0.35, w / 2 - 0.35, -1.15, 0.12, bz, bz + 0.14, 11)
            # solid metal balustrade panel, with applied timber battens in front
            box(b, -w / 2 + 0.35, w / 2 - 0.35, -1.08, -1.0, bz + 0.15, bz + 0.98, 12)
            box(b, -w / 2 + 0.35, w / 2 - 0.35, -1.10, -1.02, bz + 0.14, bz + 0.21, 5)
            nb = max(8, int((w - 0.7) / 0.32))
            for i in range(nb + 1):
                bx = -w / 2 + 0.38 + i * (w - 0.76) / nb
                box(b, bx - 0.018, bx + 0.018, -1.12, -1.06, bz + 0.18, bz + 0.96, 5)
            for bx in (-w / 2 + 0.55, 0.0, w / 2 - 0.55):
                b.add_box((bx, -0.55, bz - 0.2), (0.08, 0.9, 0.4), 7)
        # blank horizontal fascia sign board above the awning (no lettering)
        if storeys >= 2:
            box(b, -w / 2 + 0.22, w / 2 - 0.22, -0.075, 0.03, 3.52, 3.92, 7)
            box(b, -w / 2 + 0.16, w / 2 - 0.16, -0.10, 0.04, 3.92, 4.00, 5)
        else:
            box(b, -w / 2 + 0.22, w / 2 - 0.22, -0.075, 0.03, 2.86, 3.24, 7)
            box(b, -w / 2 + 0.16, w / 2 - 0.16, -0.10, 0.04, 3.24, 3.32, 5)
        # blank projecting shop sign above the awning (no lettering)
        if detail == 1 and variant != "B" and (seed % 5 in (0, 2)):
            sx = w / 2 - 0.55
            box(b, sx - 0.035, sx + 0.035, -0.95, -0.18, 3.58, 4.14, 7)
            b.add_box((sx, -0.55, 4.20), (0.05, 0.8, 0.05), 12)
        # eaves fascia, inset so it does not share the roof gable plane
        box(b, -w / 2 + 0.006, w / 2 - 0.006, -0.62, -0.48, h - 0.08, h + 0.18, 7)
        # close the visible underside of the street-side eave
        if roof_style != "flat":
            b.add_quad((-w / 2, 0.02, h - 0.01), (w / 2, 0.02, h - 0.01),
                       (w / 2, -0.62, h - 0.01), (-w / 2, -0.62, h - 0.01), 7)
        # pitched roof, no side overhang so adjacent roofs do not interpenetrate
        rise = 1.45 if storeys == 1 else (1.75 if storeys == 2 else 2.15)
        if variant == "C":
            b.add_hip_roof(-w / 2, w / 2, -0.6, depth + 0.6, h, rise, roof_mat,
                           overhang=0.0, ridge_ratio=0.45)
            # small square roof lantern; typological corner marker, not a copied dome
            lx = 0.0
            ly = depth * 0.5
            box(b, lx - 0.65, lx + 0.65, ly - 0.65, ly + 0.65, h + rise - 0.1, h + rise + 0.95, facade)
            b.add_hip_roof(lx - 0.75, lx + 0.75, ly - 0.75, ly + 0.75,
                           h + rise + 0.95, 0.7, roof_mat, overhang=0.0, ridge_ratio=0.1)
        elif roof_style == "front_gable":
            # ridge runs away from the street, so the triangular gable faces the frontage
            b.add_gable_roof(-w / 2, w / 2, -0.6, depth + 0.6, h, rise,
                             roof_mat, facade, overhang=0.0, ridge_axis="y")
            box(b, -0.5, 0.5, -0.66, -0.58, h + 0.45, h + 1.15, 7)
            box(b, -0.58, 0.58, -0.69, -0.55, h + 1.15, h + 1.24, 5)
            box(b, -0.08, 0.08, -0.62, depth + 0.62, h + rise - 0.03, h + rise + 0.09, 7)
        elif roof_style == "flat":
            # flat roof with a low front and side parapet
            box(b, -w / 2, w / 2, -0.25, depth + 0.25, h, h + 0.12, 11)
            box(b, -w / 2, w / 2, -0.16, 0.04, h + 0.12, h + 0.55, facade)
            box(b, -w / 2 + 0.006, w / 2 - 0.006, -0.20, 0.08, h + 0.55, h + 0.62, 5)
            for px in (-w / 2, w / 2 - 0.12):
                box(b, px, px + 0.12, 0.0, depth, h + 0.55, h + 0.72, 16)
        elif roof_style == "hip":
            b.add_hip_roof(-w / 2, w / 2, -0.6, depth + 0.6, h, rise, roof_mat,
                           overhang=0.0, ridge_ratio=0.5)
        else:
            b.add_gable_roof(-w / 2, w / 2, -0.6, depth + 0.6, h, rise,
                             roof_mat, facade, overhang=0.0, ridge_axis="x")
            box(b, -w / 2, w / 2, -0.62, depth + 0.62, h + rise - 0.03, h + rise + 0.09, 7)
        return b, {"width": width, "depth": depth, "storeys": storeys,
                   "variant": variant, "facade": facade, "roof": roof_mat,
                   "roof_style": roof_style, "awning_mat": awning_mat,
                   "detail": detail}

    def back_module(width, depth, height, facade, roof_mat, seed):
        """Simple courtyard/service range behind a street row; roofs only read from above."""
        b = MB("back_lot")
        box(b, -width / 2, width / 2, 0.0, depth, 0.0, height, facade)
        nwin = max(2, int(width / 3.2))
        for i in range(nwin):
            cx = -width / 2 + width * (i + 0.5) / nwin
            box(b, cx - 0.45, cx + 0.45, -0.025, 0.012, 1.0, 2.0, 6)
            if height > 4.6:
                box(b, cx - 0.45, cx + 0.45, -0.025, 0.012, height - 2.0, height - 1.1, 6)
        box(b, -0.58, 0.58, -0.03, 0.012, 0.0, 2.2, 7)
        rise = 0.85 + 0.30 * (height / 3.4)
        b.add_gable_roof(-width / 2, width / 2, -0.3, depth + 0.3, height, rise,
                         roof_mat, facade, overhang=0.0, ridge_axis="x")
        box(b, -width / 2, width / 2, -0.34, depth + 0.34, height - 0.06, height + 0.10, 7)
        return b

    def nearest_road_info(x, y):
        best = (1e9, 0.0, 0.0, 0.0)
        for r in roads:
            for a, b in zip(r["points"], r["points"][1:]):
                ax, ay = a
                bx, by = b
                dx, dy = bx - ax, by - ay
                ln2 = dx * dx + dy * dy
                if ln2 < 1e-9:
                    continue
                t = max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / ln2))
                px, py = ax + t * dx, ay + t * dy
                d = math.hypot(x - px, y - py)
                if d < best[0]:
                    best = (d, math.atan2(dy, dx), px, py)
        return best

    def background_terrace(width, depth, storeys, facades, roof_mat, seed):
        """Aligned low-rise terrace segment for the approximate background fabric."""
        b = MB("bg_terrace")
        h = 3.2 * storeys
        base = facades[0]
        # continuous body, with a thin coloured front panel per unit
        box(b, -width / 2, width / 2, -depth / 2, depth / 2, 0.0, h, base)
        box(b, -width / 2, width / 2, -depth / 2 - 0.07, -depth / 2, 0.0, 0.22, 11)
        box(b, -width / 2 - 0.03, width / 2 + 0.03, -depth / 2 - 0.08, depth / 2 + 0.02, h - 0.22, h - 0.10, 5)
        n = len(facades)
        uw = width / n
        for i, fac in enumerate(facades):
            x0 = -width / 2 + i * uw
            x1 = x0 + uw
            box(b, x0, x1, -depth / 2 - 0.045, -depth / 2, 0.22, h, fac)
            if i > 0:
                box(b, x0 - 0.07, x0 + 0.07, -depth / 2 - 0.07, -depth / 2 + 0.01, 0.0, h, 16)
                box(b, x0 - 0.10, x0 + 0.10, -depth / 2 - 0.10, -depth / 2 + 0.02, h - 0.18, h + 0.04, 5)
            ox0, ox1 = x0 + 0.55, x1 - 0.55
            if ox1 - ox0 > 1.2:
                box(b, ox0, ox1, -depth / 2 - 0.06, -depth / 2 - 0.04, 0.23, 2.55, 6)
                box(b, ox0, ox1, -depth / 2 - 0.07, -depth / 2 - 0.04, 2.55, 2.75, 7)
                dx = (ox0 + ox1) / 2
                box(b, dx - 0.45, dx + 0.45, -depth / 2 - 0.08, -depth / 2 - 0.04, 0.23, 2.30, 7)
            for f in range(1, storeys):
                z0 = f * 3.2 + 0.95
                nw = max(1, int(uw / 3.4))
                for k in range(nw):
                    cx = x0 + uw * (k + 0.5) / nw
                    box(b, cx - 0.42, cx + 0.42, -depth / 2 - 0.07, -depth / 2 - 0.04, z0, z0 + 1.35, 6)
                    box(b, cx - 0.48, cx - 0.42, -depth / 2 - 0.09, -depth / 2 - 0.02, z0, z0 + 1.35, 5)
                    box(b, cx + 0.42, cx + 0.48, -depth / 2 - 0.09, -depth / 2 - 0.02, z0, z0 + 1.35, 5)
        rise = 1.1 + 0.12 * storeys
        b.add_gable_roof(-width / 2, width / 2, -depth / 2 - 0.45, depth / 2 + 0.45,
                         h, rise, roof_mat, base, overhang=0.0, ridge_axis="x")
        box(b, -width / 2, width / 2, -depth / 2 - 0.52, -depth / 2 - 0.38, h - 0.10, h + 0.10, 7)
        # close the visible underside of the street-side eave
        b.add_quad((-width / 2, -depth / 2 + 0.02, h - 0.01), (width / 2, -depth / 2 + 0.02, h - 0.01),
                   (width / 2, -depth / 2 - 0.45, h - 0.01), (-width / 2, -depth / 2 - 0.45, h - 0.01), 7)
        box(b, -width / 2, width / 2, -0.07, 0.07, h + rise - 0.02, h + rise + 0.06, 7)
        return b

    # ---------------------------------------------------------------
    # intervals and row construction
    # ---------------------------------------------------------------
    def clip_intervals(points, center, radius, step=4.0):
        length = plen(points)
        if length < 1.0:
            return []
        runs = []
        start = None
        s = 0.0
        while s <= length:
            x, y, _ = sample(points, s)
            inside = math.hypot(x - center[0], y - center[1]) <= radius
            if inside and start is None:
                start = s
            elif not inside and start is not None:
                if s - start > 18:
                    runs.append((start, s))
                start = None
            s += step
        if start is not None and length - start > 18:
            runs.append((start, length))
        return runs

    def append_builder(dst, src, transform):
        off = len(dst.verts)
        for v in src.verts:
            dst.verts.append(tuple(transform(Vector(v))))
        for f in src.faces:
            dst.faces.append(tuple(i + off for i in f))
        for m in src.face_mats:
            dst.face_mats.append(m)
        for uv in src.uvs:
            dst.uvs.append(uv)

    def world_frame(road, side, s):
        x, y, theta = sample(road["points"], s)
        nx, ny = (-math.sin(theta), math.cos(theta)) if side > 0 else (math.sin(theta), -math.cos(theta))
        off = road["width"] / 2 + SIDEWALK
        fx, fy = x + nx * off, y + ny * off
        phi = theta if side > 0 else theta + math.pi
        ca, sa = math.cos(phi), math.sin(phi)

        def T(v):
            lx, ly, lz = v
            return (fx + lx * ca - ly * sa, fy + lx * sa + ly * ca, lz)
        return T, (fx, fy), theta, phi, (nx, ny)

    def build_row(road, side, s0, s1, run_idx):
        road_id = road["id"]
        is_kembang = road_id == "R_KEMBANG"
        layer_name = "ST_KEMBANG" if is_kembang else "STREET_FABRIC"
        collection = kembang_layer if is_kembang else fabric_layer
        prefix = "ST_KEMBANG_ROW" if is_kembang else "SHOP_ROW"
        row_name = f"PALAGAN_{prefix}_{road_id.replace('R_', '')}_{'L' if side > 0 else 'R'}_{run_idx:02d}"
        asset_id = f"{prefix}_{road_id.replace('R_', '')}_{'L' if side > 0 else 'R'}_{run_idx:02d}"
        b = MB(row_name)
        back_builder = MB(row_name + "_back")
        records = []
        back_records = []
        placed_runs = []
        current_run_start = None
        last_end = None
        skipped = {}
        s = s0
        while s + MIN_MODULE <= s1:
            T, (fx, fy), theta, phi, normal = world_frame(road, side, s)
            d_origin = math.hypot(fx, fy)
            if road_id in ("R_KEMBANG", "R_HEEREN") and d_origin < 235:
                detail = 1
            elif d_origin < 310:
                detail = 2
            else:
                detail = 3
            road_key = sum((i + 1) * ord(c) for i, c in enumerate(road_id))
            rng = random.Random(100000 * side + 1000 * (road_key % 997) + int(s * 10) + 17)
            if detail == 1:
                width = rng.choice([7.4, 8.2, 9.0, 9.8, 10.8])
                storeys = 3 if rng.random() < 0.26 else 2
                variant = "B" if rng.random() < 0.38 else "A"
                depth = 14.0 + rng.random() * 3.5
            elif detail == 2:
                width = rng.choice([8.0, 9.0, 10.0, 11.0, 12.0])
                storeys = 3 if rng.random() < 0.14 else 2
                variant = "B" if rng.random() < 0.18 else ("D" if rng.random() < 0.25 else "A")
                depth = 14.0 + rng.random() * 4.0
            else:
                width = rng.choice([10.0, 12.0, 14.0, 16.0])
                storeys = 2 if rng.random() < 0.35 else 1
                variant = "D"
                depth = 12.0 + rng.random() * 4.0
            width = min(width, s1 - s)
            if width < MIN_MODULE:
                break
            # emphasize a taller corner mass at genuine intersections
            near_cross = False
            for other in roads:
                if other["id"] == road_id:
                    continue
                if dist_to_polyline(fx, fy, other["points"]) < other["width"] / 2 + 18.0:
                    near_cross = True
                    break
            if near_cross and detail <= 2 and rng.random() < 0.28:
                storeys = 3
                variant = "C"
            facade = rng.choice([0, 0, 1, 1, 2, 2, 3, 4, 4, 15])
            roof_mat = 8 if rng.random() < 0.62 else 9
            if variant == "C":
                roof_style = "hip"
            elif detail >= 3:
                roof_style = rng.choices(["parallel", "front_gable", "flat"],
                                         weights=[0.60, 0.25, 0.15])[0]
            else:
                roof_style = rng.choices(["parallel", "front_gable", "hip", "flat"],
                                         weights=[0.56, 0.24, 0.12, 0.08])[0]
            awning_mat = 14 if rng.random() < 0.45 else 10
            T, (fx, fy), theta, phi, normal = world_frame(road, side, s + width / 2)
            corners = [T((-width / 2, 0, 0))[:2], T((width / 2, 0, 0))[:2],
                       T((width / 2, depth, 0))[:2], T((-width / 2, depth, 0))[:2]]
            ok, reason = footprint_ok(corners, occupied, road_id)
            if not ok:
                skipped[reason] = skipped.get(reason, 0) + 1
                s += 2.2
                continue
            module_seed = int(s * 10) + (1 if side > 0 else 2)
            mb, rec = shop_module(width, depth, storeys, variant, facade, roof_mat,
                                  module_seed, detail,
                                  roof_style=roof_style, awning_mat=awning_mat)
            append_builder(b, mb, T)
            occupied.append(corners)
            rec.update({"s_m": round(s, 2), "world_front": [round(fx, 2), round(fy, 2)],
                        "normal": [round(normal[0], 3), round(normal[1], 3)],
                        "road_id": road_id, "side": "left" if side > 0 else "right"})
            records.append(rec)
            # rear service range / courtyard wing, set back 2.2 m from the row
            if rng.random() > 0.20:
                rear_gap = 2.2
                rear_depth = 7.5 + rng.random() * 4.5
                rear_height = 3.1 + rng.random() * 2.4
                if detail >= 3 or storeys == 1:
                    rear_height = min(rear_height, 3.4)
                bw = max(3.4, width - 0.9)

                def Tb(v, _T=T, _d=depth + rear_gap):
                    return _T((v[0], v[1] + _d, v[2]))

                rear_corners = [Tb((-bw / 2, 0, 0))[:2], Tb((bw / 2, 0, 0))[:2],
                                Tb((bw / 2, rear_depth, 0))[:2], Tb((-bw / 2, rear_depth, 0))[:2]]
                okb, reasonb = footprint_ok(rear_corners, occupied, road_id)
                if okb:
                    bb = back_module(bw, rear_depth, rear_height, facade, roof_mat, module_seed)
                    append_builder(back_builder, bb, Tb)
                    occupied.append(rear_corners)
                    back_records.append({
                        "width": round(bw, 2), "depth": round(rear_depth, 2),
                        "height": round(rear_height, 2),
                        "world_front": [round(Tb((0, 0, 0))[0], 2), round(Tb((0, 0, 0))[1], 2)],
                        "road_id": road_id, "side": "left" if side > 0 else "right"})
                else:
                    skipped["back_" + reasonb] = skipped.get("back_" + reasonb, 0) + 1
            if current_run_start is None:
                current_run_start = s
            last_end = s + width
            s += width + GAP
            if s1 - s < MIN_MODULE:
                break
        if records and current_run_start is not None:
            placed_runs.append((current_run_start, last_end))
        if not records:
            return 0, skipped, 0
        # contiguous runs for sidewalk ribbons (split at gaps > 4 m)
        runs = []
        rstart = records[0]["s_m"]
        rend = rstart + records[0]["width"]
        for rec in records[1:]:
            if rec["s_m"] - rend < 4.0:
                rend = rec["s_m"] + rec["width"]
            else:
                runs.append((rstart, rend))
                rstart = rec["s_m"]
                rend = rstart + rec["width"]
        runs.append((rstart, rend))
        if not dry_run:
            obj = b.finish(collection, palette, name=row_name, asset_id=asset_id,
                           layer=layer_name, source_ids=("M001", "L008"),
                           evidence_status="reconstructed",
                           assumption=("Typological shophouse row fitted to the M001 road alignment. "
                                       "The module family is derived from the L008 Kembang Djepoen streetscape vocabulary; "
                                       "individual widths, storeys, colours, shopfronts and roof forms are authored "
                                       "and do not represent a building-by-building 1945 inventory."),
                           extra={"palagan_road_id": road_id,
                                  "palagan_side": side,
                                  "palagan_building_count": len(records),
                                  "palagan_modules_json": json.dumps(records, ensure_ascii=False),
                                  "palagan_front_offset_m": road["width"] / 2 + SIDEWALK})
            obj["palagan_skipped_json"] = json.dumps(skipped)
        # rear service ranges / courtyard wings
        if back_records and not dry_run:
            back_name = row_name + "_BACK"
            back_id = asset_id + "_BACK"
            back_obj = back_builder.finish(
                collection, palette, name=back_name, asset_id=back_id, layer=layer_name,
                source_ids=("M001", "L008"), evidence_status="reconstructed",
                assumption=("Rear service ranges and courtyard wings behind the reconstructed street frontage. "
                            "Their footprints, heights and roof forms are authored typological assumptions, "
                            "not a documentary building-by-building inventory."),
                extra={"palagan_road_id": road_id,
                       "palagan_side": side,
                       "palagan_building_count": len(back_records),
                       "palagan_modules_json": json.dumps(back_records, ensure_ascii=False)})
            back_obj["palagan_skipped_json"] = json.dumps(
                {k: v for k, v in skipped.items() if k.startswith("back_")})
        # sidewalks on contiguous frontage runs
        if not dry_run:
            for ri, (a, c) in enumerate(runs):
                pts = []
                dist = a
                while dist < c:
                    x, y, _ = sample(road["points"], dist)
                    pts.append((x, y))
                    dist += 2.5
                x, y, _ = sample(road["points"], c)
                pts.append((x, y))
                if len(pts) < 2:
                    continue
                sb = MB(f"sidewalk_{asset_id}_{ri}")
                lateral = -(road["width"] / 2 + SIDEWALK / 2) if side > 0 else (road["width"] / 2 + SIDEWALK / 2)
                ribbon(sb, pts, SIDEWALK, 0.035, 0, lateral_offset=lateral, uv_scale=0.25)
                sb.finish(collection, [sidewalk_mat], name=f"PALAGAN_SIDEWALK_{asset_id}_{ri:02d}",
                          asset_id=f"SIDEWALK_{asset_id}_{ri:02d}", layer=layer_name,
                          source_ids=("M001",), evidence_status="reconstructed",
                          assumption="Sidewalk strip authored to connect the road edge to the reconstructed frontage line.")
        return len(records), skipped, len(back_records)

    occupied = []
    row_summaries = []
    total_modules = 0
    total_rear_modules = 0
    for road in roads:
        radius = CORE_ROADS.get(road["id"])
        if not radius:
            continue
        intervals = clip_intervals(road["points"], (0.0, 0.0), radius, step=4.0)
        for side in (1, -1):
            for ri, (s0, s1) in enumerate(intervals):
                # clear the immediate intersection ends
                a, c = s0 + 5.0, s1 - 5.0
                if c - a < 20:
                    continue
                n, skipped, nr = build_row(road, side, a, c, ri)
                if n:
                    total_modules += n
                    total_rear_modules += nr
                    row_summaries.append({"road": road["id"], "side": "left" if side > 0 else "right",
                                          "run": ri, "s0": round(a, 1), "s1": round(c, 1),
                                          "modules": n, "rear_modules": nr, "skipped": skipped})

    # ---------------------------------------------------------------
    # approximate background core fabric
    # ---------------------------------------------------------------
    bg_reasons = {}
    background_blocks = 0
    background_units = 0
    bg_builder = MB("BG_CORE_BLOCKS")
    rng_bg = random.Random(19451110)
    # Parcels are laid on an anisotropic grid: a narrow frontage pitch so neighbours
    # form a continuous street wall, and a deeper pitch so each parcel keeps a
    # courtyard between the front range and its rear range.
    step_x = 25.0
    step_y = 34.0
    step = step_x
    for gx in range(-26, 27):
        for gy in range(-19, 20):
            x = gx * step_x + rng_bg.uniform(-1.5, 1.5)
            y = gy * step_y + rng_bg.uniform(-2.0, 2.0)
            if math.hypot(x, y) > 650.0:
                continue
            if rng_bg.random() < 0.04:
                continue
            road_dist, road_angle, rx, ry = nearest_road_info(x, y)
            vx, vy = rx - x, ry - y
            if math.hypot(vx, vy) > 0.5:
                angle = math.atan2(vx, -vy)
            else:
                angle = road_angle + math.pi / 2
            # Quantise orientation so neighbouring parcels share a street alignment
            # instead of each turning to its own nearest road point.
            snap = math.pi / 12.0
            angle = round(angle / snap) * snap
            width = rng_bg.choice([23.2, 24.0, 24.8])
            depth = rng_bg.choice([14.0, 15.0, 16.0])
            storeys = rng_bg.choices([1, 2], weights=[0.42, 0.58])[0]
            n = max(2, min(4, int(round(width / 9.0))))
            facades = []
            prev_fac = None
            for _ in range(n):
                f = rng_bg.choice([0, 0, 1, 1, 2, 2, 3, 4, 4, 15])
                if f == prev_fac:
                    f = (f + 1) % 5
                facades.append(f)
                prev_fac = f
            roof_mat = 8 if rng_bg.random() < 0.62 else 9
            ca, sa = math.cos(angle), math.sin(angle)
            corners = []
            for lx, ly in ((-width / 2, -depth / 2), (width / 2, -depth / 2),
                           (width / 2, depth / 2), (-width / 2, depth / 2)):
                corners.append((x + lx * ca - ly * sa, y + lx * sa + ly * ca))
            # check a slightly expanded footprint so roofs/cornices do not touch
            margin = 0.8
            ew, ed = width + 2 * margin, depth + 2 * margin
            check_corners = []
            for lx, ly in ((-ew / 2, -ed / 2), (ew / 2, -ed / 2),
                           (ew / 2, ed / 2), (-ew / 2, ed / 2)):
                check_corners.append((x + lx * ca - ly * sa, y + lx * sa + ly * ca))
            ok, reason = footprint_ok(check_corners, occupied, "", road_margin=SIDEWALK + 1.0)
            if not ok:
                bg_reasons[reason] = bg_reasons.get(reason, 0) + 1
                continue
            bb = background_terrace(width, depth, storeys, facades, roof_mat,
                                    int(x * 10) + int(y * 3))

            def T(v, _x=x, _y=y, _ca=ca, _sa=sa):
                lx, ly, lz = v
                return (_x + lx * _ca - ly * _sa, _y + lx * _sa + ly * _ca, lz)

            append_builder(bg_builder, bb, T)
            occupied.append(corners)
            background_blocks += 1
            background_units += n
            # rear range across a courtyard, so a parcel reads as a block with depth
            # rather than a single shed dropped on open ground
            back_depth = depth * rng_bg.uniform(0.75, 0.95)
            back_gap = rng_bg.uniform(3.5, 5.5)
            back_y = depth / 2 + back_gap + back_depth / 2
            back_width = width * rng_bg.uniform(0.72, 0.92)
            bx = x - back_y * sa
            by = y + back_y * ca
            bcorners = []
            for lx, ly in ((-back_width / 2, -back_depth / 2), (back_width / 2, -back_depth / 2),
                           (back_width / 2, back_depth / 2), (-back_width / 2, back_depth / 2)):
                bcorners.append((bx + lx * ca - ly * sa, by + lx * sa + ly * ca))
            okb, reasonb = footprint_ok(bcorners, occupied, "", road_margin=SIDEWALK + 1.0)
            if okb:
                bfacades = []
                prev = None
                for _ in range(max(2, min(4, int(round(back_width / 9.0))))):
                    f = rng_bg.choice([0, 0, 1, 1, 2, 3, 4, 15])
                    if f == prev:
                        f = (f + 2) % 5
                    bfacades.append(f)
                    prev = f
                bstoreys = 1 if storeys == 1 else rng_bg.choices([1, 2], weights=[0.55, 0.45])[0]
                rbb = background_terrace(back_width, back_depth, bstoreys, bfacades, roof_mat,
                                         int(bx * 10) + int(by * 5))

                def TB(v, _T=T, _by=back_y):
                    return _T((v[0], v[1] + _by, v[2]))

                append_builder(bg_builder, rbb, TB)
                occupied.append(bcorners)
                background_blocks += 1
            else:
                bg_reasons["rear_" + reasonb] = bg_reasons.get("rear_" + reasonb, 0) + 1
    if background_blocks and not dry_run:
        bg_obj = bg_builder.finish(
            background_layer, palette, name="PALAGAN_BG_CORE_BLOCKS",
            asset_id="BG_CORE_BLOCKS", layer="BACKGROUND_CORE",
            source_ids=("M001",), evidence_status="hypothetical",
            assumption=("Approximate low-rise urban fabric generated from the M001 road grid. "
                        "Block footprints, heights and roofs are authored for visual density and "
                        "must not be read as a building-by-building inventory."),
            extra={"palagan_building_count": background_units,
                   "palagan_terrace_count": background_blocks,
                   "palagan_grid_step_m": step,
                   "palagan_generator": "output/build_scripts/build_05_streets.py"})
        bg_obj["palagan_skipped_json"] = json.dumps(bg_reasons)

    # ---------------------------------------------------------------
    # review cameras
    # ---------------------------------------------------------------
    cam_summary = {}
    if not dry_run:
        cam_coll = ensure("CAMERAS")
        kembang = road_by_id["R_KEMBANG"]
        px, py, theta = sample(kembang["points"], 52.0)
        tx, ty, _ = sample(kembang["points"], 170.0)
        cam = bpy.data.objects.get("CAM_KEMBANG_STREET")
        if cam is None:
            cam_data = bpy.data.cameras.new("CAM_KEMBANG_STREET")
            cam = bpy.data.objects.new("CAM_KEMBANG_STREET", cam_data)
            cam_coll.objects.link(cam)
        cam.data.lens = 28.0
        cam.data.sensor_width = 36.0
        cam.data.clip_start = 0.2
        cam.data.clip_end = 3000.0
        # slightly left of the carriageway centre, looking obliquely down the street
        nx, ny = (-math.sin(theta), math.cos(theta))
        cam.location = (px + nx * 2.8, py + ny * 2.8, 2.05)
        target = (tx, ty, 5.3)
        cam.rotation_mode = "QUATERNION"
        cam.rotation_quaternion = (Vector(target) - cam.location).to_track_quat("-Z", "Y")
        tag(cam, "CAM_KEMBANG_STREET", "CAMERAS", ("M001", "L008"), "reconstructed",
            "Street-level review camera on Kembang Djepoen; perspective and lens are authored.",
            {"palagan_target_xyz": list(target), "palagan_lens_mm": 28.0})
        cam_summary["CAM_KEMBANG_STREET"] = {"location": [round(v, 2) for v in cam.location],
                                             "target": list(target)}
        overview = bpy.data.objects.get("CAM_FABRIC_OVERVIEW")
        if overview is None:
            ov_data = bpy.data.cameras.new("CAM_FABRIC_OVERVIEW")
            overview = bpy.data.objects.new("CAM_FABRIC_OVERVIEW", ov_data)
            cam_coll.objects.link(overview)
        overview.data.lens = 52.0
        overview.data.sensor_width = 36.0
        overview.data.clip_start = 0.5
        overview.data.clip_end = 5000.0
        overview.location = (-245.0, -265.0, 155.0)
        otarget = (-40.0, 15.0, 8.0)
        overview.rotation_mode = "QUATERNION"
        overview.rotation_quaternion = (Vector(otarget) - overview.location).to_track_quat("-Z", "Y")
        tag(overview, "CAM_FABRIC_OVERVIEW", "CAMERAS", ("M001",), "reconstructed",
            "Elevated review camera for the reconstructed street fabric; not a historical viewpoint.",
            {"palagan_target_xyz": list(otarget), "palagan_lens_mm": 52.0})
        cam_summary["CAM_FABRIC_OVERVIEW"] = {"location": list(overview.location), "target": list(otarget)}

    plan = {
        "schema_version": 1,
        "generated_by": "output/build_scripts/build_05_streets.py",
        "dry_run": bool(dry_run),
        "core_roads": CORE_ROADS,
        "sidewalk_m": SIDEWALK,
        "module_family": ["A_simple", "B_balcony", "C_tall_corner", "D_plain"],
        "roof_styles": ["parallel", "front_gable", "hip", "flat"],
        "row_summaries": row_summaries,
        "total_modules": total_modules,
        "total_rear_modules": total_rear_modules,
        "background_blocks": background_blocks,
        "background_units": background_units,
        "background_skip_reasons": bg_reasons,
        "removed_owned_objects": removed,
        "cameras": cam_summary,
        "assumption": ("Rows are typological reconstructions from M001 alignments and the L008 family. "
                       "Rear ranges and background blocks are authored massing for urban depth and are "
                       "not a building-by-building 1945 inventory; colours and details are authored."),
    }
    if not dry_run:
        save_json(root / "output/street_fabric_plan.json", plan)
    return plan
