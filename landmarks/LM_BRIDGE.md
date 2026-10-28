# LM_BRIDGE — Jembatan Merah / Roode Brug

**Role:** Primary geographic anchor and river crossing. **Build priority:**1. **Historical state:** prewar-form reconstruction for the November 1945 setting, with exact 1945 condition unresolved.

## Read these references first

- L001: Municipal heritage record, establishing the named site and its association with fighting in 1945.
- L006: `references/images/L006.jpg`, KITLV 118477; catalogue describes creation around 1929 and a postcard postmark dated12 September 1929. Exact exposure date is unknown. CC BY4.0.
- Crop: `references/images/L006_bridge_railings_crop.jpg`.
- M001:1943 city map. Use the corresponding layout entry when its crossing identification and scale have been recorded.

## What can be used directly

The inspected L006 image shows a low road crossing with an approximately straight deck and open metal railings; visible railing sections have diagonal bracing. The photograph also shows approach paving, street lighting and waterfront steps. This establishes visible prewar form; it does not establish every rail panel or its survival through the battle.

The photograph is oblique and its underside is largely hidden. It cannot establish an exact span, width, support count, deck thickness, load-bearing system or foundation detail. Red paint is not measurable from this monochrome image.

## Modelling specification

1. Create the river corridor and locate the candidate crossing against M001 before generating the bridge. Preserve the map's actual bank separation; do not widen the river merely to make the bridge more dramatic.
2. Build a deck with editable length, width, elevation, approach grade and thickness. Keep the visible top surface flat or near-flat as supported by the photo. Avoid a fantasy high arch, suspension cables or a large covered truss.
3. Build one railing-panel prototype with configurable post spacing, top rail and diagonal brace. Instance it along the edges. Inspect the reference crop before deciding which portion visibly has crossed versus simple members.
4. Separate abutment blocks and unseen underside construction into `RECONSTRUCTED_STRUCTURAL_FILL`. Keep them modest and visually unobtrusive. They are modelling solutions, not measured engineering reconstruction.
5. Keep paving, kerbs, lampposts, steps and optional street furniture separately editable. The source lamp positions and vehicles are not a complete 1945 traffic plan.
6. Use a neutral material palette until a colour source is supplied. If choosing a muted red railing to make the bridge legible, tag it as a presentation assumption; do not cite the photograph as proof of that colour.

## Verification and rejection checks

- The bridge joins both banks and connects to roads without a gap, floating approach or accidental step.
- The deck scale agrees with the map-based crossing rather than a car inserted as an assumed ruler.
- The railing silhouette resembles the historical image from a comparable view.
- No current plaza furniture, modern LED fixtures, road markings or monument is included from contemporary photographs.
- The model records uncertainty for its exact 1945 material colour and wartime damage.

## Location caution

The municipal routing link gives a present-day visiting pin near latitude−7.236742, longitude112.738301. Treat it as a coarse location check, not a bridge centroid or georeferencing control point. Image-left/right in L006 must not be equated to map-west/east without a camera-location check.

## Evidence rules for all assets

The target is November 1945, but most included visual evidence is prewar. A source image proves appearance at its own catalogue date, not uninterrupted continuity to the target. Preserve the source date in object metadata. Do not promote a reconstruction to documented status after rendering it convincingly.

Metric dimensions are not surveyed in this brief. Obtain footprint and orientation from the historical layout data after map interpretation; keep heights, unseen elevations and fine detail parameterised. If the layout provides a provisional identification, the Blender asset must retain that status. Never silently identify an unlabelled black map footprint as this landmark. Keep source IDs on the object and on any generated asset specification.

Use one metre per scene unit. Organise into a parent collection named for the asset ID, with separate massing, architectural detail, materials and optional time-specific props. Reusable subparts should have named dimensions and a fixed seed. Save an intermediate massing checkpoint before detailed mesh generation. A broad proportion check and a reference-camera comparison must pass before ornamental work.

Acceptance requires a saved `.blend`, a plan view showing its position in the district, and a comparison render approximating the reference photograph's perspective. A reference-camera match is visual evidence of a resemblance, not a new historical source. Record any lens/occlusion limitations.
