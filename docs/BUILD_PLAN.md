# Local Blender build plan

Execute from the extracted project root using the actual local paths. The package was prepared for the owner's OpenCode/DeepSeek/Blender MCP workflow. Read `AGENTS.md` and the recovery protocol before starting. This plan authorises ordinary reversible construction within this project; it does not authorise altering unrelated work.

## Task 1: Environment, evidence and baseline

Inputs: `docs/APPROVED_SPEC.md`, `research/RESEARCH_OVERVIEW.md`, `runtime/BLENDER_WORKFLOW.md`.

1. Discover live MCP tools and schemas. Verify a read-only scene query and a viewport image operation. Report whether image inspection is actually available to the model in this host.
2. Detect Blender version, engines, current filepath, scene objects, addons and devices with the supplied preflight. Record OpenCode version. Use version-specific docs if code fails; never repeatedly guess old enum names.
3. Locate project root and external Python. Run `python scripts/palagan_state.py init`, `status`, then `reconcile`. On a resumed project, do not reinitialise or ignore pending work.
4. Save the user's current scene to an explicit backup without deleting unrelated objects. Establish owned collections. Save the environment/preflight report to `output/environment.json`.
5. Inspect the original map overview, exact district crop, trace overlay and reference board. Read spatial limitations. Explain the chosen local frame in `DECISIONS.md`.
6. Record an environment operation and baseline snapshot according to `runtime/STATE_PROTOCOL.md`. Check that `.blend` and matching inventory exist and refer to the intended scene.

Deliverables: environment report, known-good baseline scene/inventory, live-MCP capability notes and next steps. Gate: connection and file paths verified; unrelated work preserved; no claim of model generation yet.

## Task 2: Cartographic blockout

Inputs: `data/HISTORICAL_LAYOUT.json`, `docs/SPATIAL_METHOD.md`, M001 image and crops.

1. Begin `blockout-01` or a fresh unique retry ID with expected `.blend` and inventory outputs.
2. Save a working script for construction. The optional starter can be invoked inside Blender:

```python
import runpy, json
ROOT = r"<actual extracted directory>"
seed = runpy.run_path(ROOT + "/scripts/blender_map_blockout.py")
print(json.dumps(seed["build"](ROOT), indent=2))
```

3. Compare the resulting river and road topology to `district_trace_overlay.png`. Fix trace mistakes by editing source-pixel geometry and regenerating the local coordinates; preserve a revision record. Do not alter the source image to fit the model.
4. Import `district_base_reference.jpg` as an image reference/plane with the exact local dimensions and orientation. Verify a known point on both sides of the river; ensure no left-right mirror or vertical flip.
5. Separate waterways, road surfaces, tram/rail alignments and building masses. The starter's arbitrary road widths, bridge height and eight-metre placeholder footprints are not researched dimensions. Replace or retain as labelled placeholders.
6. Establish a map-check camera and an oblique overview. Inspect open-space/river continuity and road connections. Do not create the detailed landmark on the P.W.D. footprint.
7. Save with `save_snapshot`, visually inspect, complete the operation with actual notes and update continuation files.

Gate: spatial seed works, scene origin/scale are consistent, reference underlay alignment checked, obvious topology problems corrected. A blockout is not the finished district.

## Task 3: Landmark placement and massing

Inputs: all four briefs in `landmarks/`, appearance sources L004/L006/L007/L008, identity sources L001–L003, map M001.

1. Establish a placement hypothesis for `LM_BRIDGE`, `LM_INTERNATIO`, `LM_SINGA` and `ST_KEMBANG`. Use independent image relationships and street context. Modern municipal visiting pins are locator aids, not measured centroids.
2. Record the hypothesis, source IDs, inferred footprint/height and unresolved issues in `data/ASSET_MANIFEST.json` and the Blender object properties. Do not fabricate a complete measured plan.
3. Construct massing only for one landmark at a time. Store its parameters in `output/asset_specs/<asset_id>.json` and its reproducible script under `output/build_scripts/`.
4. Match silhouette and relative proportions in a source-like view. Compare foreground occlusion, visible return walls, roof/parapet profile, neighbouring street width and bank/open-space relationship.
5. Save each asset massing separately as a full-scene checkpoint. Only after massing review add its detailed architecture.

Gate: all core assets can be located and inspected; every uncertain measurement has a parameter/assumption. If exact position cannot be established, a documented editable approximation is permitted. Never quietly promote it to documented fact.

## Task 4: Architecture, background blocks and reusable assets

1. Model the bridge's supported deck/parapet rhythm from L006; keep unseen foundation/deck sections inferred. Do not import present-day red rails by habit.
2. Model Internatio's repeated facade bays, parapets and end masses from L004 and its crop. Count visible bays and preserve obscured areas as uncertain. L005 is1948 comparison, not proof of1945condition.
3. Model Singa/Algemeene massing and characteristic upper silhouette using L007. Keep unknown rear elevations simple and editable. Do not generate invented readable lettering.
4. Build a small architectural vocabulary for Kembang Djepoen from L008. Apply controlled variation in frontage width/storeys/roof length; place street-facing fronts using the mapped blocks. Do not fill every grey map area with identical houses.
5. Read `docs/ASSET_USAGE.md` and `assets/ASSET_CATALOG.json` before using downloaded meshes/materials. Use the licensed local files. Record which variants were used, alterations, actual scale and metadata. Generic props and modern material samples are production resources, not historical sources.
6. Keep repeated components instanced. Benchmark a block before expanding. Preserve door/storey/vehicle scale relationships. Keep optional uncertain props separate and hidden until reviewed.
7. Save and inspect each landmark and each manageable background-block batch using unique operations.

Gate: at least three detailed core architectural subjects and a coherent streetscape are present. Reference-like renders demonstrate proportions; background buildings do not collide with the river or block required streets.

## Task 5: Materials, lighting and presentation

1. Load only selected material sets. Observe provided texture channel metadata; colour/albedo maps use colour interpretation, roughness/normal/displacement use appropriate non-colour interpretation. Confirm normals in a small render rather than assuming channel convention.
2. Make material scale and colour parameters explicit. B&W appearance images do not establish exact paint hues. Avoid mirrored text, oversized bricks and fresh-looking repeated stains.
3. Use neutral daylight for review. Set a separate restrained presentation look. Do not add unsourced combat effects, rainfall, drama or rubble to hide modelling errors.
4. Add the six cameras in `docs/ART_DIRECTION.md`. Save their purpose/target assets. Refine composition and scene readability; inspect both sides of the river.
5. Pack or use verified relative dependencies. Save before expensive renders. Render lightweight review images first and improve only where inspection justifies it.

Gate: useful Blender overview, clear architectural reference comparisons, no missing materials/textures, manageable resource use on the actual laptop.

## Task 6: Final verification and handoff

Apply every item in `docs/QUALITY_GATES.md`. Save `output/PALAGAN_Surabaya_Master.blend` and its inventory with a final operation ID. Reopen it through Blender and inspect its owned assets and dependencies. Reopening must not discard unsaved unrelated work; preserve before switching files.

Write `output/DELIVERY_REPORT.md` containing:
- Exact final file paths and final operation/checkpoint ID.
- What was built, which landmarks are detailed and which blocks remain approximate.
- Exact evaluated mesh/triangle, object and material counts from the actual scene; texture/dependency summary.
- Views actually inspected/rendered and defects corrected.
- Source IDs supporting each core landmark and any important remaining placement/height/appearance uncertainty.
- Actual device/engine and observed behaviour, without extrapolated FPS guarantees.
- Checks not performed and any failed checks.

Update `NEXT_STEPS.md` to final state, retain `DECISIONS.md`, leave Blender on the overview and report completion concisely. Do not claim the project is a surveyed historical twin or that an empty/nonzero `.blend` proves historical accuracy.
