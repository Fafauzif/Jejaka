# Blender 5.2 live-session workflow

## Startup inspection

1. Open the intended project scene in Blender and connect its MCP server.
2. In OpenCode, discover the server's actual tools and input schemas. Server
   forks may use different code-execution and screenshot tool names.
3. Load `scripts/blender_session.py` with `runpy.run_path` inside Blender and
   call `preflight()`. Save the response using `write_report(ROOT,
   "review/environment.json", "preflight")`.
4. Record exact Blender version, current filepath, scene, existing objects,
   units, devices and render engine. Do not infer RAM, VRAM or successful GPU
   rendering solely from the laptop model name.
5. Confirm that the model can inspect a viewport screenshot from this setup.
   If it cannot, it may generate geometry and inventories, but it must explicitly
   leave visual review unverified.

No provided script resets Blender or deletes the default scene. Existing user
objects are left alone. An unrelated open scene is a reason to create a new
project-owned scene/file with the user's existing work preserved, not a reason
to run `read_factory_settings` or select/delete everything.

## Scene organisation

Use one owned root collection `PALAGAN_SURABAYA`, then collections for map
reference, terrain, waterways, roads, landmarks, background buildings, vegetation,
cameras and lights. The collection names are organisational choices, not evidence
of historical categories.

Each authored object carries:

- `palagan_owner = "PALAGAN_SURABAYA_V1"`
- `palagan_asset_id`: stable ID from the asset/spatial manifest
- `palagan_layer`: stable construction layer
- `palagan_source_ids_json`: JSON array of source IDs
- `palagan_evidence_status`: `documented`, `reconstructed`, `unknown`, or
  `hypothetical`
- `palagan_assumption`: concise explanation of inferred features

An asset can contain both supported and inferred features. Use the asset brief
for feature-level evidence. Do not label an entire detailed building documented
merely because its street position is known.

`scripts/blender_layer_helpers.py` provides ownership checks, owned-collection
creation and an idempotent per-asset mesh upsert. It contains no historical
coordinates. Import it into the live Blender session, then provide geometry
from the approved layout/brief. It refuses name collisions with unowned objects.

Use the Blender data API for bulk construction. Keep per-vertex work out of
`bpy.ops` loops. If an operator is required, establish its context explicitly
and inspect its result. Introspect installed properties/enums rather than
copying examples from a different Blender release.

## Safe incremental construction

Write one script per build layer/landmark. Store constants and coordinates in
project data, not only in a conversation. Prefer deterministic inputs and stable
seeds. Rebuilding one asset should update that asset, not erase an entire
collection. Never delete objects without checking the project owner and asset ID.

Work in metres after confirming scene units. The project map reference defines
north and the local origin. Do not place large geographic coordinates directly
in a Blender scene and call the result metrically accurate. Use a documented
local-coordinate transform.

Begin with river, crossings, road centrelines/widths, building masses and open
spaces. Validate layout before detailed façades. Duplicate instanced mesh data
only when an asset genuinely requires a different shape. Material variation
does not necessarily require unique geometry.

## Hardware-aware inspection

The target is the user's Acer Predator Helios Neo with RTX 4060. Its actual
memory, power configuration, available system RAM and drivers must be inspected
locally. No FPS, render-time or maximum-object guarantee is supplied.

Start with a small EEVEE preview and measure viewport interaction. Test one
1280×720 review render before batch rendering. Use 1K background textures and
2K textures on selected close-view assets as starting budgets, then adjust to
measured use. Repeated architecture should share mesh/material data where
appropriate. Dense displacement, per-building 4K sets, simulation and volumetric
smoke are not requirements for the base reconstruction.

`inventory()` reports base mesh counts and explicitly excludes evaluated
modifier/instance expansion. A low base count is not a performance benchmark.
Record evaluated counts and memory observations before making such claims.

## Review cameras

Create named, owned cameras for: top-down layout, overview, river/crossing,
landmark façades, and a representative street. Use consistent camera positions
between iterations so differences can be inspected. Keep a neutral daylight
review setup separate from the presentation lighting.

For each view, check source correspondence, scale relationships, roof forms,
floating/intersecting geometry, z-fighting, missing textures and post-1945
features. The source brief controls confidence. Atmosphere is not a substitute
for reference correspondence.

`render_review()` renders an already existing owned camera and restores temporary
render settings. It is optional; a working viewport screenshot tool may be
faster. Use low-cost previews before expensive renders.

## Final inspection in Blender

- Reopen the saved final `.blend` with the existing live session preserved first.
- Confirm the expected collection and asset inventory.
- Check paths for every external image/linked asset; pack permitted textures or
  supply relative paths. Do not pack restricted reference files into a distributable
  `.blend` without the necessary rights.
- Inspect overview and close views in the saved state.
- Confirm source/assumption properties remain on assets.
- Save a useful opening workspace, active overview camera and visible model.
- Record unperformed checks and unresolved historical approximations.

The kit's Python helpers are syntax-checked only outside Blender. Their bpy
behaviour, rendering, MCP integration and compatibility with the user's exact
Blender build must be exercised during local preflight. Do not state that the
scene or Blender scripts were tested merely because standard-library tests pass.
