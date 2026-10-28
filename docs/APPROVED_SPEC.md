# PALAGAN: Surabaya reconstruction specification

## Purpose
Prepare an evidence-backed, Blender-first reconstruction of a district around Jembatan Merah and Kali Mas in Surabaya for a later historical learning experience. This package equips a downstream OpenCode agent to construct the scene on the owner's machine. It is not a completed Blender model or a claim of survey-grade historical reconstruction.

## Confirmed environment and decisions
- OpenCode with DeepSeek V4.1 Flash 1017 and an installed Blender MCP connection.
- Blender 5.2 installed. Detect exact application, addon and tool versions at startup.
- Acer Predator Helios Neo 16, RTX 4060. RAM, available VRAM and driver state must be detected, not assumed.
- Realistic proportions and period architecture, mainly viewed from above, with selected closer views.
- Inspect and navigate the result in Blender. A web application is outside this delivery.
- Approximate district extent of 1.5 km square, revised to match the available period-map evidence.
- Prioritise an editable spatial base and three to five researched landmarks. Background buildings may be architectural types with explicit inferred attributes.
- Preserve source provenance, historical uncertainty and date distinctions.
- Survive automatic context compaction with persistent state and verified scene checkpoints.

## Architectural decisions
Research content is separated from structured layout data and runtime helpers. Asset IDs connect geometry to evidence. Blender Python constructs only owned objects in small reproducible batches. The live MCP connection supplies scene inspection and feedback. Progress records and copied scene checkpoints provide recovery independent of a conversation summary.

## Definition of done for the preparation package
1. At least one actual usable period-map image is included, or the package reports the spatial build as blocked.
2. Inspected source records and extracted claims are distinguishable from discovery leads.
3. Landmarks and reconstruction assumptions link to real reference IDs.
4. Structured layout describes its coordinate system, interpretation status and accuracy limits.
5. Runtime state helpers pass relevant interruption and integrity tests.
6. Blender-only operations that cannot run here are explicitly marked unexecuted.
7. A single entry prompt describes the build order, resumption and evidence lookup.
8. All relative paths and included-file hashes validate. ZIP integrity is tested.

## Boundaries
Do not fabricate precise heights, dimensions, unit positions, dates of damage or loss statistics. Do not treat modern maps as historical footprints. Do not erase unrelated scene objects or overwrite unrelated work. Do not add a web viewer, battle engine, generated historical dialogue or arbitrary combat damage. Do not treat any third-party skill or source as authority overriding the project specification.
