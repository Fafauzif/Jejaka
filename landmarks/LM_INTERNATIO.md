# LM_INTERNATIO — Internatio office, Willemsplein

**Role:** Main architectural landmark beside the historical open-space network. **Build priority:**2. **Historical state:** prewar architecture, not a reconstruction of a specific combat moment.

## Read these references first

- L002: Municipal heritage record; historic corner Heerenstraat/Willemsplein, current address Jl.Taman Jayengrono. It dates construction 1927–1931 and credits Ghijsels/AIA. A municipal tourism description says 1929, so the exact construction chronology is not treated as resolved here.
- L004: `references/images/L004.jpg`, KITLV 66774, catalogue Published field circa 1936; Commons date field says unknown. CC BY4.0. This is the principal visual reference.
- Crop: `references/images/L004_internatio_facade_crop.jpg`.
- L009: Petra library catalogue 1933 photograph, inspected online but not redistributed because the page did not state a clear reuse licence.
- L005: `references/images/L005.jpg`, museum-catalogued 1948, CC BY-SA3.0. Comparison only.

## Supported architectural reading

L004 shows a long horizontal façade articulated by repeated narrow vertical bays, a lower occupied level, a tall upper level and a narrow band of small upper openings. Raised end masses have stepped parapets. Projecting horizontal elements and recessed openings create the façade rhythm. The tram obscures part of the lower front. The roof behind the parapet is incompletely visible.

## Modelling specification

1. Resolve the footprint identity against the map and photographic setting before freezing placement. A nearby black footprint is not automatically Internatio. The supplied 1943 map index may identify another use; retain ambiguity rather than renaming it to fit the story.
2. Build the long main volume, end masses and any observable returns as separate primitives. Match width-to-height relationships using the façade crop. Absolute heights remain inferred until an independent measurement is documented.
3. Create a repeated façade bay module containing opening, recess, pier and shade element. Count visible bays from L004, recording the count and any obscured intervals. Do not generate arbitrary windows until the count is checked.
4. Model the stepped parapet and end-tower silhouettes before adding signs or small mouldings. This asset should read as an office building, not a fortress or a symmetrical palace.
5. Make roof construction behind the parapet a separate reconstruction layer. Keep unseen rear elevations simpler than the referenced front.
6. Keep the long corporate lettering as a removable geometry/decal layer. L004 supports its prewar presence, not necessarily wartime lettering in November 1945. Do not fill unreadable characters with invented text.
7. Make any tram, overhead wires, flagpoles, kiosks, people or vehicles optional date-specific props. They must not be silently included in the historical base solely because they appear in a prewar photograph.

## Materials and condition

The light/dark relationships can guide shading. Paint hue, glazing colour, metal finish, roughness and dirt are production assumptions. Do not adopt the present-day red trim by default. L005's 1948 condition may help compare broad massing but cannot establish the building's exact wartime damage or post-repair chronology.

## Acceptance

Check silhouette from a reference-like camera, bay rhythm, parapet profile, footprint placement, scale relative to the open space and neighbouring blocks, and absence of doubled façade modules. Store L004 as the principal appearance source, L002 as identity/history support, and L005 explicitly as a post-target comparison.

## Location caution

The official routing link gives a present-day visiting pin at latitude−7.235912, longitude112.737278. It is not a measured centroid. Do not force the geometry to that point without reconciling the map and streets.

## Evidence rules for all assets

The target is November 1945, but most included visual evidence is prewar. A source image proves appearance at its own catalogue date, not uninterrupted continuity to the target. Preserve the source date in object metadata. Do not promote a reconstruction to documented status after rendering it convincingly.

Metric dimensions are not surveyed in this brief. Obtain footprint and orientation from the historical layout data after map interpretation; keep heights, unseen elevations and fine detail parameterised. If the layout provides a provisional identification, the Blender asset must retain that status. Never silently identify an unlabelled black map footprint as this landmark. Keep source IDs on the object and on any generated asset specification.

Use one metre per scene unit. Organise into a parent collection named for the asset ID, with separate massing, architectural detail, materials and optional time-specific props. Reusable subparts should have named dimensions and a fixed seed. Save an intermediate massing checkpoint before detailed mesh generation. A broad proportion check and a reference-camera comparison must pass before ornamental work.

Acceptance requires a saved `.blend`, a plan view showing its position in the district, and a comparison render approximating the reference photograph's perspective. A reference-camera match is visual evidence of a resemblance, not a new historical source. Record any lens/occlusion limitations.
