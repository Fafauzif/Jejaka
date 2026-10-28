"""PALAGAN Task 2: cartographic blockout.

Run INSIDE Blender 5.2 via MCP:
    import runpy, json
    api = runpy.run_path(ROOT + "/output/build_scripts/build_01_blockout.py")
    print("BLOCKOUT=" + json.dumps(api["build"](ROOT)))

Builds only PALAGAN-owned geometry:
- land polygons cut around the M001 river trace;
- Kali Mas water, riverbed and quay walls;
- road ribbons from the approved local layout plus explicitly inferred lanes;
- bridge massing and approach ramps;
- simple landmark masses and map-footprint masses;
- duplicated map underlay plane for plan comparison;
- neutral lighting and two review cameras.
This is a blockout; it is not the finished architecture.
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
ASSET_NAME = "PALAGAN_BLOCKOUT_V1"


def build(project_root):
    root = Path(project_root).expanduser().resolve()
    lib = runpy.run_path(str(root / "output/build_scripts/palagan_build_lib.py"))
    ensure = lib["ensure_collection"]
    clear = lib["clear_owned_layer"]
    MB = lib["MeshBuilder"]
    tag = lib["tag_object"]
    ribbon = lib["ribbon"]
    mats = lib["material_set"](root)
    spec = lib["load_layout"](root)

    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0

    # Clear only blockout-owned layers, preserving all other data.
    for layer in ("GROUND_WATER", "STREETS", "MASSING", "LM_BRIDGE",
                  "LM_INTERNATIO", "LM_SINGA", "MAP_REFERENCE"):
        clear(layer)

    # ------------------------------------------------------------------
    # 1. Land, river and quays
    # ------------------------------------------------------------------
    water_feature = next(f for f in spec["features"] if f["feature_id"] == "W_KALIMAS")
    river_pts = [tuple(p) for p in water_feature["local_xy_m"]]
    # The trace is ordered north -> west bank -> south curve -> east bank -> north.
    west_bank = river_pts[:15]
    east_bank = river_pts[15:]
    h = spec["extent"]["width_m"] / 2.0
    west_land = west_bank + [(-h, -h), (-h, h)]
    east_land = east_bank + [(h, h), (h, -h)]

    ground = ensure("GROUND_WATER")
    b = MB("PALAGAN_LAND_WEST")
    b.add_ngon(west_land, mat=0, z=0.0)
    west_obj = b.finish(ground, [mats["earth"]], name="PALAGAN_LAND_WEST",
                        asset_id="GND_LAND_WEST", layer="GROUND_WATER",
                        source_ids=("M001",), evidence_status="reconstructed",
                        assumption="Land polygon derived by closing the M001 river trace to the local extent; ground is a flat scene datum.")
    b = MB("PALAGAN_LAND_EAST")
    b.add_ngon(east_land, mat=0, z=0.0)
    east_obj = b.finish(ground, [mats["earth"]], name="PALAGAN_LAND_EAST",
                        asset_id="GND_LAND_EAST", layer="GROUND_WATER",
                        source_ids=("M001",), evidence_status="reconstructed",
                        assumption="Land polygon derived by closing the M001 river trace to the local extent; ground is a flat scene datum.")

    b = MB("PALAGAN_KALIMAS_WATER")
    b.add_ngon(river_pts, mat=0, z=-1.25)
    water_obj = b.finish(ground, [mats["water"]], name="PALAGAN_KALIMAS_WATER",
                         asset_id="W_KALIMAS_WATER", layer="GROUND_WATER",
                         source_ids=("M001",), evidence_status="reconstructed",
                         assumption="Water level is an authored scene datum, not a surveyed historical stage; plan trace is a coarse manual map interpretation.")
    b = MB("PALAGAN_KALIMAS_BED")
    b.add_ngon(river_pts, mat=0, z=-4.0)
    b.finish(ground, [mats["stone_dark"]], name="PALAGAN_KALIMAS_BED",
             asset_id="W_KALIMAS_BED", layer="GROUND_WATER",
             source_ids=("M001",), evidence_status="reconstructed",
             assumption="Channel bed depth is a production assumption; unseen below water.")

    # Quay walls: two-sided masonry faces plus a stone coping strip.
    b = MB("PALAGAN_QUAY_WALLS")
    for bank, flip in ((west_bank, False), (east_bank, True)):
        for i in range(len(bank) - 1):
            a, c = bank[i], bank[i + 1]
            if flip:
                a, c = c, a
            # river-facing wall: pick winding that gives a face toward the channel
            b.add_quad((a[0], a[1], -2.1), (c[0], c[1], -2.1),
                       (c[0], c[1], 0.16), (a[0], a[1], 0.16), 0)
            b.add_quad((c[0], c[1], -2.1), (a[0], a[1], -2.1),
                       (a[0], a[1], 0.16), (c[0], c[1], 0.16), 1)
    quay = b.finish(ground, [mats["stone"], mats["stone_dark"]],
                    name="PALAGAN_QUAY_WALLS", asset_id="W_KALIMAS_QUAY",
                    layer="GROUND_WATER", source_ids=("M001",),
                    evidence_status="reconstructed",
                    assumption="Quay wall form, depth and coping are authored reconstruction; L006 steps are referenced but not measured.")
    b = MB("PALAGAN_QUAY_COPING")
    ribbon(b, west_bank, 1.0, 0.17, 0, lateral_offset=0.0)
    ribbon(b, east_bank, 1.0, 0.17, 0, lateral_offset=0.0)
    b.finish(ground, [mats["stone"]], name="PALAGAN_QUAY_COPING",
             asset_id="W_KALIMAS_COPING", layer="GROUND_WATER",
             source_ids=("M001",), evidence_status="reconstructed",
             assumption="Coping width is a visual assumption.")

    # ------------------------------------------------------------------
    # 2. Street network
    # ------------------------------------------------------------------
    road_specs = [
        # id, points, width, material key, row detail
        ("R_HEEREN", [(-749.7, 243.95), (-464.1, 142.8), (-208.25, 71.4), (-83.3, 29.75), (-47.6, 0.0)], 16.0, "asphalt", True),
        ("R_KEMBANG", [(5.95, 0.0), (178.5, -47.6), (368.9, -83.3), (535.5, -130.9), (749.7, -188.0)], 11.5, "asphalt", True),
        ("R_WILLEMS", [(-47.6, 0.0), (-95.2, -214.2), (-71.4, -267.75), (-47.6, -440.3), (0.0, -654.5), (30.0, -749.7)], 10.5, "asphalt", True),
        ("R_OOSTER", [(61.88, 749.7), (65.45, 511.7), (71.4, 273.7), (57.12, 83.3), (38.0, 34.0), (14.0, 10.0)], 9.5, "asphalt", True),
        ("R_CHINEESCHE", [(18.0, -8.0), (57.12, -35.7), (64.26, -202.3), (83.3, -380.8), (119.0, -535.5), (142.0, -690.0)], 8.5, "setts", True),
        ("R_PARADE", [(-650.0, -175.0), (-321.3, -202.3), (-214.2, -243.95), (-95.2, -255.85), (-55.0, -260.0)], 9.0, "asphalt", True),
        ("R_BOOM", [(-160.0, 58.0), (-172.55, 59.5), (-214.2, -83.3), (-232.05, -232.05), (-236.0, -270.0)], 8.0, "setts", True),
        ("R_KALISOSOK", [(-715.0, 485.0), (-392.7, 440.3), (-238.0, 404.6), (-107.1, 398.65), (-47.6, 416.5)], 10.0, "asphalt", True),
        ("R_TJANTIAN", [(340.0, -75.0), (368.9, -83.3), (499.8, -107.1), (535.5, -130.9), (606.9, -148.75), (749.7, -205.0)], 8.5, "setts", True),
        ("R_SASAK", [(250.0, 355.0), (297.5, 380.8), (416.5, 428.4), (517.65, 464.1), (680.0, 520.0)], 8.0, "setts", True),
        ("R_NIEUW_HOLLAND", [(-210.0, 70.0), (-215.0, 210.0), (-208.0, 400.0)], 7.5, "setts", False),
        ("R_WERF", [(-48.0, 418.0), (-68.0, 260.0), (-78.0, 120.0), (-60.0, 18.0)], 7.0, "setts", True),
        ("R_RUSTENBURG", [(-640.0, 500.0), (-450.0, 415.0), (-270.0, 365.0)], 7.0, "setts", False),
        ("R_PROFETEN", [(-540.0, -500.0), (-300.0, -490.0), (-80.0, -505.0)], 8.0, "setts", True),
        ("R_KALONGAN", [(-350.0, -230.0), (-360.0, -420.0), (-375.0, -650.0)], 7.5, "setts", False),
        ("R_SLOMPRETAN", [(230.0, -120.0), (245.0, -300.0), (255.0, -520.0)], 7.5, "setts", True),
        ("R_BONGKARAN", [(310.0, -150.0), (325.0, -350.0), (340.0, -600.0)], 7.5, "setts", False),
        ("R_BOENGGERAN", [(520.0, -230.0), (540.0, -450.0), (560.0, -650.0)], 7.0, "setts", False),
        ("R_PANGGGOENG", [(150.0, 35.0), (165.0, 200.0), (180.0, 380.0)], 6.5, "setts", True),
        ("R_TJINASTRAAT", [(300.0, 80.0), (315.0, 260.0), (330.0, 420.0)], 6.5, "setts", False),
        ("R_SONGOYUDAN", [(250.0, 35.0), (270.0, 200.0), (285.0, 360.0)], 6.0, "setts", False),
        ("R_WEST_LANE1", [(-540.0, 300.0), (-400.0, 280.0), (-260.0, 260.0), (-150.0, 240.0)], 6.5, "setts", False),
        ("R_WEST_LANE2", [(-540.0, 80.0), (-400.0, 90.0), (-260.0, 100.0), (-150.0, 110.0)], 6.0, "setts", False),
        ("R_SOUTH_LANE", [(-520.0, -350.0), (-300.0, -340.0), (-120.0, -350.0)], 6.5, "setts", False),
        ("R_EAST_LANE1", [(80.0, -250.0), (200.0, -260.0), (330.0, -270.0)], 6.5, "setts", False),
        ("R_EAST_LANE2", [(80.0, -420.0), (200.0, -430.0), (330.0, -440.0)], 6.5, "setts", False),
        ("R_WEST_NORTH", [(-650.0, 620.0), (-350.0, 600.0), (-100.0, 590.0), (-40.0, 580.0)], 6.0, "setts", False),
        ("R_EAST_NORTH", [(90.0, 650.0), (250.0, 640.0), (430.0, 630.0)], 6.0, "setts", False),
        ("R_WEST_SOUTH", [(-650.0, -620.0), (-450.0, -600.0), (-250.0, -620.0), (-60.0, -650.0)], 6.5, "setts", False),
        ("R_EAST_SOUTH", [(200.0, -700.0), (350.0, -690.0), (500.0, -680.0)], 6.5, "setts", False),
    ]
    roads = []
    for idx, (rid, pts, width, matkey, detail) in enumerate(road_specs):
        b = MB("PALAGAN_" + rid)
        ribbon(b, pts, width, 0.035 + idx * 0.0008, 0, uv_scale=0.2)
        obj = b.finish(ensure("STREETS"), [mats[matkey]], name="PALAGAN_" + rid,
                       asset_id=rid, layer="STREETS", source_ids=("M001",),
                       evidence_status="reconstructed",
                       assumption="Centerline traced from M001 where available; width and continuation beyond the inspected crop are authored production assumptions. Not a road-engineering survey.",
                       extra={"palagan_road_width_m": width, "palagan_width_status": "inferred; historical width not measured",
                              "palagan_detail_row_target": bool(detail)})
        roads.append({"id": rid, "points": pts, "width": width, "detail": detail, "object": obj.name})

    # Bridgehead paved aprons.
    b = MB("PALAGAN_BRIDGEHEAD_APRONS")
    for cx, cy, sx, sy in ((-51.0, 0.0, 22.0, 26.0), (7.0, 0.0, 22.0, 26.0)):
        b.add_quad((cx - sx / 2, cy - sy / 2, 0.07), (cx + sx / 2, cy - sy / 2, 0.07),
                   (cx + sx / 2, cy + sy / 2, 0.07), (cx - sx / 2, cy + sy / 2, 0.07),
                   0, uv=[(cx, cy), (cx + sx, cy), (cx + sx, cy + sy), (cx, cy + sy)])
    b.finish(ensure("STREETS"), [mats["setts"]], name="PALAGAN_BRIDGEHEAD_APRONS",
             asset_id="RD_BRIDGEHEAD_APRONS", layer="STREETS", source_ids=("M001",),
             evidence_status="reconstructed",
             assumption="Apron extent is an authored visual reconstruction; the map supports a crossing and open junction, not pavement dimensions.")

    # Tram rails: prewar tram infrastructure visible in L004/L006. Kept as a
    # separate reconstructed layer; exact 1945 operation is not asserted.
    b = MB("PALAGAN_TRAM_RAILS")
    rail_roads = [
        ("R_HEEREN", [(-749.7, 243.95), (-464.1, 142.8), (-208.25, 71.4), (-83.3, 29.75), (-47.6, 0.0)]),
        ("R_KEMBANG", [(5.95, 0.0), (178.5, -47.6), (368.9, -83.3), (535.5, -130.9)]),
    ]
    for rid, pts in rail_roads:
        for off in (-0.72, 0.72):
            ribbon(b, pts, 0.09, 0.065, 0, lateral_offset=off, uv_scale=1.0)
    b.finish(ensure("STREETS"), [mats["metal"]], name="PALAGAN_TRAM_RAILS",
             asset_id="TRAM_RAILS_PREWAR", layer="STREETS", source_ids=("L004", "L006"),
             evidence_status="reconstructed",
             assumption="Tram rails and gauge are inferred from L004/L006 prewar appearance; wartime service is not asserted.")

    # ------------------------------------------------------------------
    # 3. Bridge massing (replaced by the detailed bridge in bridge-01)
    # ------------------------------------------------------------------
    bridge_layer = ensure("LM_BRIDGE")
    b = MB("PALAGAN_LM_BRIDGE_MASSING")
    b.add_box((-20.0, 0.0, 0.18), (68.0, 13.0, 0.72), 0)
    b.add_box((-56.4, 0.0, -0.6), (7.0, 15.0, 2.2), 1)
    b.add_box((16.4, 0.0, -0.6), (7.0, 15.0, 2.2), 1)
    for y in (-6.15, 6.15):
        b.add_box((-20.0, y, 1.08), (66.0, 0.22, 0.12), 2)
        for x in (-50.0, -34.0, -18.0, -2.0, 12.0):
            b.add_box((x, y, 0.82), (0.22, 0.22, 1.15), 2)
    bridge = b.finish(bridge_layer, [mats["stone"], mats["stone_dark"], mats["metal"]],
                      name="PALAGAN_LM_BRIDGE_MASSING", asset_id="LM_BRIDGE_MASSING",
                      layer="LM_BRIDGE", source_ids=("M001", "L006"),
                      evidence_status="reconstructed",
                      assumption="Massing only: deck width/elevation and rail rhythm are authored until the detailed bridge pass. Source L006 shows a low crossing with open metal railings; no engineering dimensions are documented.")
    # approach wedges
    b = MB("PALAGAN_LM_BRIDGE_APPROACHES")
    for x0, x1, west in ((-82.0, -54.0, True), (14.0, 42.0, False)):
        z0, z1 = (0.04, 0.54) if west else (0.54, 0.04)
        b.add_quad((x0, -6.5, z0), (x1, -6.5, z1), (x1, 6.5, z1), (x0, 6.5, z0), 0)
        b.add_box(((x0 + x1) / 2, 0, min(z0, z1) - 0.2), (abs(x1 - x0), 13.0, 0.4), 0)
    b.finish(bridge_layer, [mats["setts"]], name="PALAGAN_LM_BRIDGE_APPROACHES",
             asset_id="LM_BRIDGE_APPROACHES_MASSING", layer="LM_BRIDGE",
             source_ids=("M001", "L006"), evidence_status="reconstructed",
             assumption="Approach grade is an authored reconstruction; no measured longitudinal section exists.")

    # ------------------------------------------------------------------
    # 4. Landmark massing (located now, detailed later)
    # ------------------------------------------------------------------
    # Internatio: long axis parallel to Heerenstraat, south of the street.
    intern_layer = ensure("LM_INTERNATIO")
    angle = math.atan2(71.4 - 29.75, -208.25 + 83.3)
    b = MB("PALAGAN_LM_INTERNATIO_MASSING")
    b.add_box((0.0, -12.0, 9.8), (96.0, 24.0, 19.6), 0)
    b.add_box((-48.0, -10.0, 11.0), (12.0, 20.0, 22.0), 0)
    b.add_box((48.0, -10.0, 10.5), (11.0, 20.0, 21.0), 0)
    intern = b.finish(intern_layer, [mats["plaster_cream"]],
                      name="PALAGAN_LM_INTERNATIO_MASSING", asset_id="LM_INTERNATIO_MASSING",
                      layer="LM_INTERNATIO", source_ids=("M001", "L002", "L004", "L005"),
                      evidence_status="reconstructed",
                      assumption="Placement hypothesis: long frontage south of Heerenstraat near the bridge, parallel to the street, based on L002/L004 setting and M001 block geometry. Exact footprint, height and 1945 condition are unresolved. P.W.D. footprint is NOT used.")
    intern.location = (-135.0, 22.0, 0.0)
    intern.rotation_euler.z = angle
    intern["palagan_footprint_angle_deg"] = math.degrees(angle)
    intern["palagan_reference_view"] = "CAM_INTERNATIO_REFERENCE"

    # Singa: west bank north of the bridge, river frontage facing east.
    singa_layer = ensure("LM_SINGA")
    b = MB("PALAGAN_LM_SINGA_MASSING")
    b.add_box((0.0, -9.0, 6.5), (78.0, 18.0, 13.0), 0)
    b.add_hip_roof(-39.0, 39.0, -18.0, 0.0, 13.0, 4.0, 1, overhang=0.7)
    singa = b.finish(singa_layer, [mats["plaster_cream"], mats["roof_clay"]],
                     name="PALAGAN_LM_SINGA_MASSING", asset_id="LM_SINGA_MASSING",
                     layer="LM_SINGA", source_ids=("M001", "L003", "L007"),
                     evidence_status="reconstructed",
                     assumption="Placement hypothesis: west-bank river frontage immediately north of the crossing, following the Jl. Jembatan Merah address and L006/L007 waterfront relationship. Map footprint identity is not independently fixed; massing and heights are inferred.")
    singa.location = (-53.0, 47.0, 0.0)
    singa.rotation_euler.z = -math.pi / 2
    singa["palagan_footprint_angle_deg"] = -90.0

    # Documented map footprints (retain printed identities, especially P.W.D.).
    mass_layer = ensure("MASSING")
    for ft in spec["features"]:
        if ft["kind"] != "mapped_footprint":
            continue
        hgt = {"F_PWD_1": 14.0, "F_PHONE": 12.0, "F_POST_7": 13.0, "F_TRADING_62": 10.0}.get(ft["feature_id"], 9.0)
        b = MB("PALAGAN_" + ft["feature_id"] + "_MASSING")
        pts = ft["local_xy_m"]
        b.add_ngon(pts, mat=0, z=hgt)
        # vertical walls
        for a, c in zip(pts, pts[1:] + pts[:1]):
            b.add_quad((a[0], a[1], 0.0), (c[0], c[1], 0.0), (c[0], c[1], hgt), (a[0], a[1], hgt), 0)
        b.finish(mass_layer, [mats["plaster_ochre"] if ft["feature_id"] != "F_PWD_1" else mats["plaster_white"]],
                 name="PALAGAN_" + ft["feature_id"] + "_MASSING",
                 asset_id=ft["feature_id"] + "_MASSING", layer="MASSING",
                 source_ids=tuple(ft["source_ids"]), evidence_status="reconstructed",
                 assumption="Extruded M001 silhouette; height and roof are authored placeholders. Identity follows the printed map index, not a nearby landmark. F_PWD_1 is P.W.D. Offices / Burg Genesk Dienst, not Internatio.",
                 extra={"palagan_map_label": ft["label"], "palagan_height_status": "inferred, not surveyed"})

    # ------------------------------------------------------------------
    # 5. Distant coarse fabric (outside the detailed core)
    # ------------------------------------------------------------------
    rng = random.Random(19451110)
    road_polys = [r["points"] for r in roads]
    water_poly = river_pts
    placed = []
    bg_layer = ensure("BACKGROUND")
    b = MB("PALAGAN_BG_COARSE")
    count = 0
    for gx in range(-700, 701, 95):
        for gy in range(-700, 701, 95):
            if abs(gx) < 420 and abs(gy) < 420:
                continue
            if rng.random() < 0.28:
                continue
            w = rng.uniform(16, 32)
            d = rng.uniform(14, 28)
            hgt = rng.uniform(5.5, 13.0)
            x = gx + rng.uniform(-22, 22)
            y = gy + rng.uniform(-22, 22)
            corners = lib["box_footprint_corners"](x, y, 0.0, w, d)
            if any(lib["point_in_polygon"](p[0], p[1], water_poly) for p in corners):
                continue
            if any(lib["dist_to_polyline"](p[0], p[1], rp) < 9.0 for p in corners for rp in road_polys):
                continue
            if any((x - px) ** 2 + (y - py) ** 2 < (w + pw) ** 2 for px, py, pw in placed):
                continue
            placed.append((x, y, max(w, d)))
            b.add_box((x, y, hgt / 2), (w, d, hgt), 0)
            b.add_gable_roof(x - w / 2, x + w / 2, y - d / 2, y + d / 2, hgt, rng.uniform(1.6, 2.8), 1, 0,
                             overhang=0.45, ridge_axis="x" if w >= d else "y")
            count += 1
    b.finish(bg_layer, [mats["plaster_grey"], mats["roof_dark"]], name="PALAGAN_BG_COARSE_MASSING",
             asset_id="BG_COARSE_FABRIC", layer="BACKGROUND", source_ids=("M001",),
             evidence_status="reconstructed",
             assumption="Low-detail outer-district fabric; block shapes, heights and roofs are authored approximations to suggest urban continuity beyond the inspected trace. Not documented building footprints.",
             extra={"palagan_module_count": count})

    # ------------------------------------------------------------------
    # 6. Map underlay and alignment aids
    # ------------------------------------------------------------------
    map_layer = ensure("MAP_REFERENCE")
    map_img = bpy.data.images.load(str(root / "references/maps/district_base_reference.jpg"), check_existing=True)
    map_mat = bpy.data.materials.get("MAT_MAP_UNDERLAY")
    if map_mat is None:
        map_mat = bpy.data.materials.new("MAT_MAP_UNDERLAY")
        map_mat["palagan_owner"] = OWNER
        map_mat.use_nodes = True
        nt = map_mat.node_tree
        nt.nodes.clear()
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        em = nt.nodes.new("ShaderNodeEmission")
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = map_img
        em.inputs["Strength"].default_value = 0.55
        nt.links.new(tex.outputs["Color"], em.inputs["Color"])
        nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    b = MB("PALAGAN_MAP_UNDERLAY")
    b.add_quad((-h, -h, -0.14), (h, -h, -0.14), (h, h, -0.14), (-h, h, -0.14), 0,
               uv=[(0, 0), (1, 0), (1, 1), (0, 1)])
    underlay = b.finish(map_layer, [map_mat], name="PALAGAN_MAP_UNDERLAY",
                        asset_id="REF_MAP_UNDERLAY", layer="MAP_REFERENCE",
                        source_ids=("M001",), evidence_status="documented",
                        assumption="Exact 1499.4 m local-extent crop of M001; alignment is approximate and not georeferenced. Hidden for final render.")
    underlay.hide_render = True
    underlay["palagan_image_path"] = "references/maps/district_base_reference.jpg"
    underlay["palagan_pixel_box"] = "2460,3700,3720,4960"

    # Empty marker at the working origin and bridge axis.
    origin = bpy.data.objects.new("PALAGAN_ORIGIN_BRIDGE", None)
    map_layer.objects.link(origin)
    origin.empty_display_type = "PLAIN_AXES"
    origin.empty_display_size = 12.0
    tag(origin, "REF_ORIGIN_BRIDGE", "MAP_REFERENCE", ("M001",), "reconstructed",
        "Working local origin at original-image pixel (3090, 4330); approximate bridge crossing. Not a geodetic control point.")

    # ------------------------------------------------------------------
    # 7. Lighting and cameras
    # ------------------------------------------------------------------
    light_layer = ensure("LIGHTING")
    for obj in list(light_layer.objects):
        if obj.get("palagan_owner") == OWNER:
            bpy.data.objects.remove(obj, do_unlink=True)
    sun_data = bpy.data.lights.new("PALAGAN_SUN", "SUN")
    sun_data.energy = 3.4
    sun_data.angle = math.radians(2.2)
    sun_data.color = (1.0, 0.955, 0.88)
    sun = bpy.data.objects.new("PALAGAN_SUN", sun_data)
    light_layer.objects.link(sun)
    sun.rotation_euler = (math.radians(52), math.radians(0), math.radians(-38))
    tag(sun, "LGT_SUN_NEUTRAL", "LIGHTING", ("M001",), "reconstructed",
        "Neutral daylight rig for review; no historical lighting condition asserted.")

    world = scene.world
    if world is None:
        world = bpy.data.worlds.new("PALAGAN_WORLD")
        scene.world = world
    world["palagan_owner"] = OWNER
    world.use_nodes = True
    wn = world.node_tree
    wn.nodes.clear()
    wout = wn.nodes.new("ShaderNodeOutputWorld")
    bg = wn.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (0.47, 0.58, 0.68, 1)
    bg.inputs["Strength"].default_value = 0.55
    wn.links.new(bg.outputs["Background"], wout.inputs["Surface"])

    cam_layer = ensure("CAMERAS")
    for obj in list(cam_layer.objects):
        if obj.get("palagan_owner") == OWNER:
            bpy.data.objects.remove(obj, do_unlink=True)

    def camera(name, location, target, lens=45.0, ortho=None, purpose="review"):
        data = bpy.data.cameras.new(name)
        data.lens = lens
        data.sensor_width = 36.0
        data.clip_start = 0.5
        data.clip_end = 4000.0
        if ortho:
            data.type = "ORTHO"
            data.ortho_scale = ortho
        obj = bpy.data.objects.new(name, data)
        cam_layer.objects.link(obj)
        obj.location = location
        direction = Vector(target) - Vector(location)
        obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        tag(obj, name, "CAMERAS", ("M001",), "reconstructed",
            "Review camera. Lens and framing are authored to approximate the cited reference; not a measured camera match.",
            extra={"palagan_camera_purpose": purpose, "palagan_target_xyz": list(target)})
        return obj

    cam_overview = camera("CAM_DISTRICT_OVERVIEW", (-455.0, -545.0, 390.0), (-15.0, 10.0, 0.0), 42.0,
                          purpose="whole-district oblique overview; river, bridge and core landmarks")
    cam_plan = camera("CAM_PLAN_CHECK", (0.0, 0.0, 1200.0), (0.0, 0.0, 0.0), 50.0, ortho=1540.0,
                      purpose="near-orthographic plan comparison with district_base_reference.jpg")
    scene.camera = cam_overview

    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    try:
        scene.eevee.taa_render_samples = 32
    except Exception:
        pass
    try:
        scene.view_settings.view_transform = "AgX"
        scene.view_settings.look = "AgX - Medium High Contrast"
    except Exception:
        pass
    scene.view_settings.exposure = 0.15

    scene["palagan_last_operation"] = "blockout-01"
    scene["palagan_map_source"] = "M001"
    scene["palagan_layout_status"] = spec["status"]
    scene["palagan_blockout_status"] = "Cartographic river/street/bridge/massing seed only; detailed architecture not yet built."
    scene["palagan_road_count"] = len(roads)
    scene["palagan_detailed_row_roads"] = json.dumps([r["id"] for r in roads if r["detail"]])
    scene["palagan_unregistered_height_note"] = "Building heights are authored estimates with explicit reconstructed/unknown status. No surveyed heights exist in the source package."

    # Save a row-plan JSON for the later shophouse pass.
    row_plan = {
        "roads": roads,
        "internatio": {"center": [-135.0, 22.0], "angle_deg": math.degrees(angle), "length": 96.0, "depth": 24.0},
        "singa": {"front_x": -53.0, "y_range": [8.0, 86.0], "depth": 18.0},
        "exclusions": [
            {"id": "LM_INTERNATIO", "center": [-135.0, 22.0], "radius": 70.0},
            {"id": "LM_SINGA", "center": [-62.0, 47.0], "radius": 50.0},
            {"id": "F_PWD_1", "center": [-86.0, 46.0], "radius": 30.0},
            {"id": "F_PHONE", "center": [-126.0, 176.0], "radius": 30.0},
            {"id": "F_POST_7", "center": [-75.0, -617.0], "radius": 75.0},
            {"id": "F_TRADING_62", "center": [-145.0, -447.0], "radius": 50.0},
        ],
    }
    lib["save_project_json"](root / "output/row_plan.json", row_plan)

    return {
        "status": "blockout built; not final",
        "objects": len(scene.objects),
        "roads": len(roads),
        "coarse_background_boxes": count,
        "river_vertices": len(river_pts),
        "row_plan": "output/row_plan.json",
        "next": "Inspect plan overlay and overview; correct trace/topology before landmark detail.",
    }


if __name__ == "__main__":
    raise SystemExit("Run build(ROOT) inside Blender through MCP")
