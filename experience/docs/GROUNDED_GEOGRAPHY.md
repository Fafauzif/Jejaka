# Grounded escape geography: evidence and production boundaries

This edition follows a selected street-and-river network read from the repository's wartime map. It is a compressed historical-fiction environment, not a surveyed reconstruction of Surabaya or a recreation of a documented civilian escape. The local people, workshop, conversations, cart, rescue, fires, route obstructions and use of the school as a refuge are authored fiction.

## Geographic structure

The played route runs westward along Kembang Djepoen, crosses Kali Mas once at the candidate Jembatan Merah crossing, then turns south along the western quay, Willemskade. A minor connector and local access lead toward the building marked 63, Juliana School. The bridge connects the eastern Kembang Djepoen approach to the western Heerenstraat approach. Heerenstraat remains part of the surrounding street network even though this escape turns toward the quay.

There is one playable river crossing in this route. This does not imply that Surabaya had only one bridge. Other crossings, including southern railway crossings visible on the source map, are outside this played sequence. The previous two adjacent generic road bridges and their implied historical closures are not a source for this layout.

`experience/escape/layout.js` contains the source-pixel coordinates and generated world coordinates. `DATA.roads`, `DATA.waters` and `DATA.footprints` retain the coarse map-derived feature identities. `LAYOUT.actorRoute` records the playable lane choices and their uncertainty; it is not an archival evacuation route.

## Map, scale and orientation

The base is M001, `references/maps/Soerabaja_1943_original.jpg`, SHA256 `3cc62f945bac6e82772fdd3b0bd52df256d1fdc61d4004e27f9a2cab9ae1e36a`. It was revised from March 1943 aerial photographs. Its publication date must not be equated automatically with its imagery date. The British Library catalogue for the comparable HIND1072 first edition describes it as [1944] and corrects the suspect printed denominator to1:15,000. The comparable catalogue record does not prove that it is the same physical copy.

The existing kit estimated 1.19 metres per original-image pixel from the graphic scale. That estimate, the paper image and the manual tracing are approximate. There is no EPSG assignment, surveyed control network, orthorectification or measured georeferencing residual.

The new presentation uses 50% of that approximate horizontal scale:

- `gameX = −(sourceV −4330) ×0.595 −20`
- `gameZ = (sourceU −3050) ×0.595 −196`
- Source-image west points toward game −Z; source-image south points toward game −X.

This rotation is a presentation choice. The 50% distance compression is deliberate and must remain disclosed. Vertical dimensions and road widths are separately authored parameters, not measurements certified by the map. The compressed route length depends on the selected playable lane and school access correction; its length does not establish a human completion time.

## Important anchors

| Element | Source pixels / basis | Production position and status |
| --- | --- | --- |
| Kembang workshop | Near(3460,4415), on the mapped commercial corridor | Fictional workshop and family; Sari root(−70.575,47.95). |
| Bridge east end | Existing trace(3095,4330) | (−20,−169.225). |
| Bridge west end | Existing trace(3050,4330) | (−20,−196). Approximate compressed span 26.775; exact engineering dimensions unknown. |
| Cart | Authored east-bank approach near(3100.7563,4330) | Root(−20,−165.8), clear of the bridge rail. No documented wartime cart obstruction is claimed. |
| Western quay breather | Playable centre offset near(3028,4670) | (−222.3,−209.09). The old coarse quay trace runs too close to the traced bank to serve directly as a human-width lane. |
| School / refuge | Map index 63, coarse new footprint reading near(2883–2927,4801–4834) | Bench root(−310.36,−272.16). Entrance/interior and refuge use are fictional. |

**Map index 81 is an R.C.Church, not Juliana School.** The school identity follows index 63 and the visible map label. The exact school doorway, internal arrangement, 1945 condition and occupation are not established. The bench's authored access must remain physically open rather than being placed inside an impassable footprint cube.

The small quay centre offsets, connector, lane selection and doorway are playable interpretations of a coarse map. They preserve bank and street relationships but are not surveyed alignments. Street widths must remain described as production estimates. Black lines with cross marks may be tram or railway symbols; they are not road-width boundaries or walls.

## Architecture and damage

L006, the circa 1929 Roode Brug photograph, supports a low, approximately straight crossing with open metal railings and diagonal bracing. It does not establish exact supports, material colours or survival of every feature in November1945. L008, a 1927 Kembang streetscape image, supports a vocabulary of attached shop fronts, balconies/eaves, pitched roofs and commercial street depth. It does not certify every shop or its wartime condition.

Do not relabel map index1, P.W.D. Offices/Burg Genesk Dienst, as Internatio. Its identity is preserved. Likewise, the old bridge-side residency and the later governor's office must not be conflated or represented by an invented clock tower. Landmark placement requires its own evidence check.

`LAYOUT.events` and `LAYOUT.fireSites` are production staging on fictional shops/props and surrounding unlabelled lots. They are not claims that a named mapped building burned or a particular attack occurred there. The native layout checks establish finite transforms, source-point roundtrips, route bounds, shared fire sites on land, one bridge span, retained map identities and line-segment clearance against the currently traced building polygons. The last segment deliberately enters School 63 through its authored doorway; that is the sole building-interior exception. They do not establish historical attacks, render quality, collider clearance or complete gameplay.

The source-map polygons are clipped to the kit's recorded extent. Any world geometry continuing beyond that extent is a disclosed background construction; an extended water surface must not be promoted to a new cartographic trace. Playable bounds are separate from the wider mapped/background scenery.

## Source access in this revision

- M001 original map crops, grid overlay, prior trace and building index were inspected directly from the repository. A close crop clarified the school/church identities. Original research files were not changed.
- [British Library, IOR/X/14499/SOERABAJA(1)](https://searcharchives.bl.uk/catalog/040-002247525): catalogue retrieved; metadata supports the March 1943 imagery basis, first-edition dating qualification and scale discrepancy. The British Library physical map itself was not newly inspected.
- [Surabaya municipal heritage record, Jembatan Merah](https://disbudporapar.surabaya.go.id/adinda/portaldata/cagarbudaya/detail/jembatan-merah): retrieved; establishes the named site and general association with 1945 fighting. It does not document the game's closures, family or route.
- See `research/map_sources.json`, `research/landmark_sources.json`, `docs/SPATIAL_METHOD.md` and `landmarks/` for prior access states and uncertainty. Reference-image rights remain recorded in the existing credit files; historical photographs are not new runtime textures.

## School access correction

The first proposed school-access line was wrong: from source pixel(2950,4680) to(2953,4798), it crossed the mapped black footprints of Trading Company 62 and R.C.Church 81. That failure was identified through an independent source-map overlay. It is not repaired by deleting the buildings or treating the source polygons as decoration.

The corrected access uses `connectorWest` at source pixel(2911,4676), then `schoolApproach` at(2934,4792), following the map-visible street corridor WEST of those masses. It remains east of School 63 until the final authored doorway/bench segment. All other story anchors are unchanged. The exact centre of a human-width lane is an interpretation of a coarse map; it is not a surveyed road line.

Two additional visible black masses are retained in runtime source data: the upper rectangle corresponding to index 81, and the cross-shaped mass immediately south of it. The latter's ownership/grouping is unresolved; it is labelled accordingly rather than silently merged into the church, post office or school.

A native analytic segment/polygon check reproduces both old intersections, rejects them on the corrected route and checks a 0.24-metre actor radius against every traced non-door building polygon. These checks support the source-coordinate correction; they do not verify final renderer views, generated wall/door colliders, mapped facade appearance or ordinary-input completion. Those require separate actual-world and browser checks after integration.

## Orientation correction

The first experimental frame mistakenly exchanged the image axes in a way that mirrored the map. The corrected `school63-r2` frame maps source north to game +X, east to game +Z and south to game −X. Thus, when facing geographic west along game −Z, north is on the player's right and the southward quay is on the left. This is checked explicitly rather than inferred from a convincing render. All source-image pixel coordinates are retained unchanged.

The correction reflects spatial placements around the bridge centre; it does not negatively scale human anatomy or mirror the character rigs. Local furniture/rig helper offsets are authored after the anchor transform. The loaded cart has a shared signed push of −3.2 game metres so the high-X bypass lane remains available. Experimental saved world positions from the initial mirrored frame must not be reused in the corrected frame.
