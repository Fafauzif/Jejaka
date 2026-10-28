# PALAGAN Surabaya 1945 — build delivery report

Operation `handoff-01`. Written after the scene was saved, reopened and re-inspected.

## 1. Deliverables and exact paths

| Item | Path |
|---|---|
| Master scene | `output/PALAGAN_Surabaya_Master.blend` |
| Master inventory | `output/PALAGAN_Surabaya_Master.inventory.json` |
| Verification report | `output/verification_report.json` |
| Checkpoint copy | `progress/checkpoints/handoff-01/scene.blend` |
| Six review renders | `output/renders/final_district_overview.png`, `final_plan_check.png`, `final_bridge.png`, `final_internatio.png`, `final_singa.png`, `final_kembang.png` |
| Material palette (parameters) | `output/material_palette.json` |
| Lighting parameters | `output/lighting_params.json` |
| Camera setup | `output/camera_setup.json` |
| Street / parcel plan | `output/street_fabric_plan.json` |

The master scene carries `palagan_last_operation = handoff-01`. It was reopened in Blender 5.2.2 LTS after saving: 137 objects, 42 materials, 8 cameras, no missing image files.

Recovery authority is the project directory plus these files, not this report. `NEXT_STEPS.md` records the exact next action.

## 2. What exists

One unit is one metre; local +X is image-right, +Y image-up, +Z up. The scene is a local, image-derived frame with no EPSG georeferencing (D006).

**Water and ground.** Kali Mas as a traced polygon from M001, with bed, quay, coping and a silty grey-green water material. Land on both banks, road ribbons for ten mapped centre lines, kerbed footways along the eight core roads, bridgehead aprons, and a tram alignment readable in the Kembang corridor.

**Landmarks.** All four core subjects are modelled beyond massing:

- `LM_BRIDGE` — low deck with camber, kerbs, open railings with diagonal braces, lamp standards, abutments, approach ramps and quay steps (8 meshes).
- `LM_INTERNATIO` — 12-bay facade, projecting piers, mezzanine band, cornices, small top lights, stepped end towers, reconstructed rear and roof, deliberately blank signage band (8 meshes).
- `LM_SINGA` — gabled central pavilion with a three-bay arcade, seven-bay flanking arcaded wings, upper veranda arches, hipped tiled roofs, blank roof-sign frame and proxy lions (8 meshes). The lions are placeholders, not sculpted animals.
- `ST_KEMBANG` — Kembang Djepoen as a continuous shophouse corridor using the L008-derived vocabulary.

**Street fabric.** 327 front shophouse modules and 246 rear service ranges along the eight core mapped roads, with a 3.8 m footway band, four module variants, four roof forms and articulated shopfronts (timber stall riser, mullions at about 1.15 m pane pitch, transom lights, door leaf).

**Background fabric — approximate.** 883 parcels with 1,563 authored ground-floor units behind the street rows, laid on a 25 × 34 m parcel pitch with 15° quantised orientation and a courtyard rear range. This is authored urban depth for visual density, tagged `hypothetical`; it is not a building-by-building inventory.

**Coarse massing — approximate.** Four `F_*` massings (`F_PWD_1`, `F_PHONE`, `F_POST_7`, `F_TRADING_62`) remain labelled approximate volumes with no facade detail. They are visible at the bridgehead and read as plain blocks; they were left as explicit massing rather than given invented facades.

## 3. Exact counts (from the actual scene)

| Measure | Value |
|---|---|
| Owned objects | 134 |
| Preserved baseline objects (untouched) | 3 (`Cube`, `Light`, `Camera`) |
| Base triangles | 589,282 |
| Evaluated triangles (depsgraph) | 589,282 |
| Base vertices | 1,180,044 |
| Materials | 42 (41 PALAGAN-owned) |
| Cameras | 8 |
| Lights | 2 (one renderable sun, one hidden baseline point) |
| Image datablocks | 15 (11 files on disk, 4 runtime) |
| Texture sets | 4 × 1K PBR (plaster, brick, clay roof tile, dark planks) = 12 images |
| Missing image files | 0 |
| Reference underlay | 1,260² map plane, inspection only |

Base and evaluated counts are identical because no modifier expansion is used. Instancing is not used for the repeated modules: the rows are merged into one mesh per road side, which keeps object count and draw calls low but means the geometry is not instanced. This is a real limitation on a 4060 laptop if the module family is expanded substantially.

## 4. Views inspected and defects corrected

Six required views plus many diagnostics were rendered and read back as images. Renders are EEVEE at 1600 × 1000, 64 TAA samples, AgX Medium High Contrast, exposure 0.15, raytracing enabled, map underlay excluded.

Defects found and fixed during this build:

- **Shopfronts read as black voids.** Traced to a single unbroken glazed panel per bay plus a near-black interior plane. Fixed with a Fresnel-driven sheen mix on the glass, a lifted interior colour, and stall risers plus mullions in the geometry.
- **Facade textures were being flattened.** The original luminance-ramp colouring discarded texture detail; replaced with desaturate-plus-multiply tinting that preserves it.
- **Roof and sett tints were silently ignored.** The Hue/Saturation node's Color input is overridden when linked, so tint assignments did nothing. Rebuilt as an explicit multiply after adjustment.
- **Footways read as red brick rubble.** The brick diffuse was being used at an implausible scale and full saturation; now desaturated to grey setts at about 1.2 m per texture tile.
- **Sun disc was 9.17°**, which erased shadows; now 2.2° with a gradient sky replacing a flat world colour.
- **`CAM_BRIDGE` was buried inside the new shopfront row** after the street fabric arrived. Moved onto the deck.
- **`CAM_INTERNATIO_REFERENCE` was blocked and then over-cropped** over three attempts before framing the full facade.
- **Background parcels were isolated scatter** with huge empty gaps; replaced with a coherent parcel grid, which is why the plan view now reads as lanes and blocks rather than a scatter plot.
- **River read as pale concrete at grazing angles**; Fresnel threshold raised to 0.80, base darkened, ripple strengthened.

## 5. Sources and remaining uncertainty

| Subject | Sources | Status |
|---|---|---|
| Kali Mas geometry, road alignments, bridge position | M001 (1943 map) | Local image-derived trace; coarse, not georeferenced |
| `LM_BRIDGE` form | L006 | Low deck and open railings supported; exact spans, railing rhythm and 1945 paint are reconstructed |
| `LM_INTERNATIO` | L004, L005 | 12 visible bays and stepped towers compared; L005 (1948) is comparison only, not 1945 proof; rear and roof reconstructed; signage deliberately blank |
| `LM_SINGA` | L007 | Massing, arcades and roof-sign frame compared; lions are proxies; rear elevations simple |
| Kembang Djepoen | L008 | Vocabulary transferred; per-frontage widths, storeys and colours authored (D011) |
| All surface colour | A001–A004 texture sets | Production resources, not historical evidence for hue or condition |

Recorded approximations: every facade colour, module width, storey mix, roof form and background parcel is authored (D011). Signboards are blank because no period lettering was verifiable. No combat damage, smoke, fire, weather or rubble has been added. Prewar photographs are not treated as proof of the November 1945 condition (D007).

## 6. Device and observed behaviour

Blender 5.2.2 LTS, EEVEE, RTX 4060 laptop with 8 GB VRAM and 31.7 GB RAM detected at the start of the build. A 1600 × 1000 review render at 64 samples with raytracing complete in seconds. Interactive viewport behaviour with the full scene was **not** benchmarked in this batch; no FPS or VRAM figure is claimed.

All construction in this batch ran headless from saved scripts, because the GUI session's MCP socket had stopped executing code when `streets-01` was recovered (D012).

**Correction, verified after this report was first written:** the MCP bridge is working. A `{"type": "execute", ...}` request (JSON terminated with a NUL byte) to 127.0.0.1:9876 returned `status: ok` and reported the live GUI scene. No configuration change was needed and none should be inferred from D012. The add-on is Blender Lab "MCP" 1.0.3, enabled; its Start/Stop controls live in **Edit > Preferences > Add-ons > MCP** (the add-on preferences panel), not in a 3D Viewport sidebar panel. The live GUI session currently holds `output/working/singa-01.blend` with unsaved changes from the earlier stuck run; that is not the master file.

## 7. Checks not performed, and known gaps

- **No interactive GUI inspection in this batch.** Every scene check was a headless open, a scripted query, or an image read back from disk.
- **No Cycles render test** was run; only EEVEE.
- **No ground-contact sweep at grazing angles** across the whole district; overlaps were rejected at build time by footprint tests, not by a rendered sweep.
- **Water still reads as a flat pale surface** in near-horizontal views such as `final_singa.png`. It is closer to silty river water than before, but not convincing at grazing angles.
- **Bridgehead `F_*` massings are blank boxes** and dominate the most important view.
- **Open ground remains at the outer corners** of the 650 m district radius.
- **Shopfront signs, street furniture, vehicles and people are absent.** Their date and placement are unverified, so they were not invented.
- **The scene is not instanced**, so raising the module count substantially will raise memory use roughly linearly.
- **No absolute geographic accuracy is claimed** for any position, and no elevations beyond locally authored values.
