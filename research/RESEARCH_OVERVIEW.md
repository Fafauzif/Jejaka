# Research overview and modelling consequences

## Goal and scope
The prepared evidence supports a first editable district reconstruction around Jembatan Merah and Kali Mas, targeting November1945. The research is descriptive: it identifies what can be built and what remains interpretive. It is not a complete battle simulation, architectural measured survey or exhaustive history of Surabaya.

Knowledge depth: working knowledge of the selected district's source landscape and visible architecture, with explicit limits on exact metric reconstruction and target-day condition. The package includes actual map/photo files, original source notes and externally linked documents; a catalogue record is never labelled as a downloaded scan.

## Source hierarchy
1. Period cartography, contemporary photographs and attributed1945dispatches are used for claims they can actually establish.
2. Institutional catalogue metadata establishes identity, dates and access state, not unseen image content.
3. Municipal heritage records support building identity/history and present-day locator leads.
4. Scholarly historical/photo research supports interpretation and leads back to original sources.
5. Modern photographs/maps are comparison aids only. Downloaded production assets and third-party Blender skills are not historical evidence.

Primary source content has viewpoints and limitations. British military imagery, Indonesian institutional interpretation and the Indian observer's dispatches are not interchangeable perspectives. Do not count several copies of one image as independent confirmation.

## What is physically included
- M001: high-resolution7452×10970wartime city map, its inspected legend/index, exact district crop and traced overlay.
- L004: prewar Internatio facade reference, circa1936catalogue description, exact exposure unknown.
- L006: Roode Brug/Jembatan Merah reference, circa1929.
- L007: Algemeene/Gedung Singa reference, circa1910.
- L008: Kembang Djepoen streetscape, catalogue20January1927.
- L005: Internatio1948 comparison image, explicitly after target period.
- Four focused landmark/streetscape briefs, annotated source crops and a reference board.
- History notes and17specific claims with source/page locators.
- A coarse local trace with original source-pixel positions, plus ownership/checkpoint helpers.
- Reusable free production assets and material maps listed separately in `assets/ASSET_CATALOG.json`.

## What the source base supports
The map supports a period street/waterway framework and selected named/indexed building symbols. Prewar photographs support visible architectural massing, facade rhythm and streetscape proportions. Municipal records corroborate identities. The1945dispatches and museum accounts support a dated narrative context while also exposing uncertainty in locations, captions and event sequences.

The included appearance photos are not a complete November1945photographic survey. Historical building heights, rear facades, exact surface colours, water levels, microtopography and detailed battle damage are not established. Those must remain adjustable reconstruction assumptions if modelled.

## Findings ledger
The machine-readable historical ledger is `history_claims.json`. Landmark-specific evidence is in each brief and `landmark_sources.json`; spatial interpretation is in `data/HISTORICAL_LAYOUT.json` and `map_sources.json`. The consolidated `SOURCE_REGISTER.csv` preserves the exact inspection/access statuses.

Notable findings with direct modelling implications:
- M001/M002: the printed scale denominator is suspect; use the inspected graphical scale as a coarse local basis and record the method.
- M001: index1identifies P.W.D. Offices. Nearby location alone does not identify it as Internatio.
- L001–L003/L010: modern visiting points do not fix1945centroids; old residency and later governor's office must not be conflated.
- HC008/HC009: JFU437production metadata and tentative catalogue identifications are not per-shot coordinates/dates. Its film was not watched in this research pass.
- HC005/HC015: Mallaby chronology contains a conflicting later caption. Do not stage disputed precise circumstances as settled fact.
- HC013/HC014: Tugu Pahlawan and modern memorial installations are later features, excluded from the1945base.
- HC017: distinguish British and Indian forces; do not label all Allied troops Dutch or all Indian troops Gurkhas.

## Scope filter
Full-campaign tactics, casualties, weapon placement, generic history articles and images with no district relevance were not used to determine geometry. September's flag incident is not merged into November's setting. Late-November southern operations are not moved into the northern core. Modern material samples and generic meshes remain production resources.

## Object filter and corrections
An initial polygon associated with map number84was removed after review because it did not unambiguously correspond to the complete labelled footprint. The P.W.D. footprint keeps its printed identity. The place-name CSV labels authored feature descriptions as `feature_label`, not as literal map transcription. The geographic extent remains a local source-image frame; no world georeferencing is claimed.

## Open questions and allowed treatment
| Question | Current position | Build treatment |
|---|---|---|
| Exact Internatio/Singa footprints | Not frozen by the prepared evidence | Establish an image/map placement hypothesis; preserve it as approximate if unresolved. |
| Exact target day and damage state | November1945target, no exact combat moment selected | Architecture-first base; keep all time-specific damage/props separate. |
| Absolute heights and unseen elevations | Not surveyed | Parameterised plausible massing, explicitly inferred. |
| Map distortion/world control | Not measured | Keep local frame; do not invent an EPSG/RMS value. |
| Additional detailed1945map scan | NEFIS/AWM catalogued, scan not acquired | Existing M001is usable; later acquisition could improve cross-checking. |
| Film imagery usage | Catalogue inspected; film not included/viewed | Do not invent timecodes or use film as if frames had been reviewed. |

## Research access and rights
Open access is not the same as unrestricted redistribution. Research notes are original paraphrases. Restricted/qualified papers, books and archive films remain external references. Included historical images retain their individual credit/licence information. The material/model inventory has its own licence ledger. Read `RIGHTS_AND_ATTRIBUTION.md` before distributing derivative outputs.

## Reading order
Begin with this overview and `docs/SPATIAL_METHOD.md`. Inspect the source map and reference board. Before each landmark, read only its brief, principal image/crop and relevant source rows. Consult `history_source_criticism.md` when assigning dated events, props or damage. Keep claims tied to evidence IDs so compaction does not detach a confident statement from its limitation.
