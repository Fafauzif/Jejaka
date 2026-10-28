# Spatial evidence and local layout method

## What was actually done
M001 was downloaded at7452×10970 pixels and inspected as a full overview and original-resolution crops. A small district was selected around the crossing associated with Jembatan Merah. River outlines, selected street corridors and a few black building silhouettes were manually digitised into `data/HISTORICAL_LAYOUT.json`. The trace is intentionally sparse; use the map as an underlay to improve it before detailed modelling.

The original is `references/maps/Soerabaja_1943_original.jpg`. Its graphic legend states that the map was revised from air photographs dated March1943. Commons catalogues the image as1943. M002 describes the same HIND1072 map series with an approximate printed denominator1:1390, corrected in its catalogue to1:15000. The date/catalogue difference is preserved rather than collapsed into an exact publication date for this physical copy.

## Coordinate contract
- Original image coordinates `(u,v)`: top-left origin; u right, v down.
- Working origin: original pixel `(3090,4330)`, near the candidate bridge crossing.
- Working scale:1.19metres per pixel, rounded from the graphical1000metre bar visually spanning approximately u5358–6198 in the original.
- Blender: `X=(u-3090)*1.19`, `Y=(4330-v)*1.19`, Z up.
- Extent: original pixel box `[2460,3700,3720,4960]`, about1499.4metres square at that approximate scale.
- No EPSG CRS is assigned. No global control-point registration, transformation grid, orthorectification or residual error measurement was performed.
- Image-up is approximate north. Paper/photo skew and local distortion remain. Do not claim metre-accurate world location.

The original image pixel coordinates are retained on every feature. They are the audit trail. If scale or alignment is improved, regenerate local coordinates from those pixels and update the recorded method. Do not silently stretch X/Y or overwrite the map metadata until it looks convenient.

## Included visual aids
`Soerabaja_1943_overview.jpg` locates the district within the city. `core_district.png` is a larger context crop with original box[2450,3700,3850,5100]. `core_district_pixel_grid.png` adds original-image coordinate labels. `district_base_reference.jpg` matches the exact selected extent. `district_trace_overlay.png` shows the current coarse trace on that exact crop. `legend_scale.png` and `building_index.png` retain the evidence needed to interpret symbols.

Grid lines, railway lines and electric tramways are not road-width boundaries. The original legend distinguishes railway and electric tramway symbols. A thick black line with cross ticks must not be extruded as a wall or interpreted as the full road pavement. Building silhouettes are cartographic signs and may be generalised.

## Feature classes
- `water_polygon`: coarse visible water corridor. River depth, bed and historical level are unknown. Continuity below bridge is inferred.
- `road_centerline`: interpreted street corridor with no documented pavement width. Set a visually plausible parameter, record it as inferred, then check against photos.
- `bridge_axis`: candidate crossing axis. It does not specify engineering span, width, deck thickness or parapet design.
- `mapped_footprint`: simplified selected black silhouette. Height is null/unknown. Identity follows the printed map label/index, not a nearby famous landmark.

The source-map footprint1 is explicitly P.W.D. Offices/Burg Genesk Dienst according to the index. It is not assigned to Internatio. Number84 was excluded from the final seed because an initial polygon did not unambiguously correspond to its full mapped symbol. This is an example of a rejected trace, not missing data to be invented.

## Landmark placement
Use the briefs and historic photographs to establish relative relationships around the bridge and Heerenstraat/Willemsplein. Municipal modern visiting pins are coarse locator leads, not historical centroids. Keep an explicit placement hypothesis for Internatio and Singa until their footprint/setting is reconciled. Do not anchor a large building solely at a visiting pin.

If placement remains uncertain, create an editable approximate massing with `palagan_evidence_status=reconstructed` and explain the hypothesis. Show the map and a reference-like camera side by side. Improving an approximate placement does not make it survey-derived.

## Further improvement protocol
1. Identify surviving control features across the crop and establish their historical correspondence independently.
2. Obtain a reliable coordinate reference and fit a suitable transform with more observations than its minimum.
3. Hold back independent check points; report their residuals separately from fitted-point residuals.
4. Inspect local deformation, changed river edges and postwar street alterations.
5. Store old/new transforms and checkpoints; regenerate features deterministically.

This improvement has not been executed in this kit. The local-frame approach remains sufficient for a first editable district model as long as its limitations are retained.
