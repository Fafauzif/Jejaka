# LM_SINGA — Algemeene / Gedung Singa / Aperdi Djawa Maluku

**Role:** Secondary waterfront architectural anchor. **Build priority:**3. **Historical state:** prewar-form continuity hypothesis for 1945, with unseen elevations and exact condition unresolved.

## Read these references first

- L003: Municipal heritage record for Aperdi Djawa Maluku, current address Jl.Jembatan Merah19–23. It dates construction 1901–1903, attributes the design to Berlage after an earlier design by another office, and identifies paired winged lion sculptures.
- L007: `references/images/L007.jpg`, KITLV 117755, catalogue Published field circa 1910, exact capture date unknown. CC BY4.0.
- Crop: `references/images/L007_algemeene_front_crop.jpg`.
- M001:1943 layout; the brief does not independently settle which map footprint corresponds to this asset.

## Supported architectural reading

The inspected image shows an arcaded riverside front with a central projecting, gabled roof composition, pitched tiled roofs, upper arched openings and flanking building wings. Large roof advertising is visible in this older view. Foreground boats obscure part of the base.

## Modelling specification

1. Place the waterfront edge from the historical layout, then fit a simplified massing model to the source. Keep the building distinct from the long rectilinear Internatio façade.
2. Separate the main central mass, flanking wings and pitched roof sections. Parameterise all dimensions, including unobserved depth.
3. Model arched openings as reusable components. Trace their profiles from the crop rather than using oversized Gothic arches. The number and arrangement must follow visible intervals; hidden bays remain inferred.
4. Model the central gable and roof breaks to match the silhouette. Use a tile normal/material at distance, reserving actual tile geometry for close-up areas where necessary.
5. Use the municipal identification of paired winged lions only to justify the type of ornament. The photograph is not detailed enough to support an anatomically exact sculpture. Keep these as simple separately tagged proxy ornaments until a closer dated source is obtained.
6. Make the roof advertising removable. Its appearance circa 1910 does not prove it remained in 1945. An uncertain sign must not be treated as a source of new historical wording.
7. Limit detail on unobserved side and rear elevations. Use plausible repeated architectural language with `reconstructed` status, not fabricated archival detail.

## Waterfront props

Keep boats, mooring poles, overhead lines and temporary structures outside the building collection. Their presence in L007 establishes that view's setting only. Population density and boat positions are not a 1945 inventory. Use a small number of generic river-craft silhouettes only if tagged as atmosphere/reconstruction.

## Verification and acceptance

The source-like camera should recover the central gable/arcade relationship. Check that arches are not stretched by unapplied scale, roofs meet their walls, the object is grounded and the riverfront passage remains passable. Record the source date, inferred roof colour and inferred unseen elevations in custom properties.

## Location caution

The municipal routing link gives a present-day visiting pin near latitude−7.237150, longitude112.737800. Use it as coarse independent identity support. It is not an exact building-outline survey or historical control point.

## Evidence rules for all assets

The target is November 1945, but most included visual evidence is prewar. A source image proves appearance at its own catalogue date, not uninterrupted continuity to the target. Preserve the source date in object metadata. Do not promote a reconstruction to documented status after rendering it convincingly.

Metric dimensions are not surveyed in this brief. Obtain footprint and orientation from the historical layout data after map interpretation; keep heights, unseen elevations and fine detail parameterised. If the layout provides a provisional identification, the Blender asset must retain that status. Never silently identify an unlabelled black map footprint as this landmark. Keep source IDs on the object and on any generated asset specification.

Use one metre per scene unit. Organise into a parent collection named for the asset ID, with separate massing, architectural detail, materials and optional time-specific props. Reusable subparts should have named dimensions and a fixed seed. Save an intermediate massing checkpoint before detailed mesh generation. A broad proportion check and a reference-camera comparison must pass before ornamental work.

Acceptance requires a saved `.blend`, a plan view showing its position in the district, and a comparison render approximating the reference photograph's perspective. A reference-camera match is visual evidence of a resemblance, not a new historical source. Record any lens/occlusion limitations.
