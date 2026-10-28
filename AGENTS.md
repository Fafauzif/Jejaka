# PALAGAN project rules

## Objective and environment
Build an editable, visually convincing Surabaya district in Blender 5.2, centred on Jembatan Merah and Kali Mas and intended for a November 1945 historical learning experience. OpenCode and DeepSeek drive the user's existing Blender MCP connection. Target an RTX 4060 laptop; detect available RAM/VRAM. Inspect in Blender. Do not add a web app.

## Read on initial launch and after compaction
1. This file and `NEXT_STEPS.md`.
2. `progress/PROJECT_STATE.json` if present, then run `python scripts/palagan_state.py status` and `reconcile` from this root.
3. `DECISIONS.md`, `runtime/STATE_PROTOCOL.md` and the relevant task in `docs/BUILD_PLAN.md`.
4. Only the asset brief, reference crop and source rows needed for the next task. Do not reread every source into the context window.

No progress directory means no local build has been recorded yet. Initialise it using the helper. Python examples refer to external Python except code explicitly marked to run inside Blender. Discover the actual MCP tool schemas before calling them. Detect the real project directory; never use example paths literally.

## Evidence
Use `research/RESEARCH_OVERVIEW.md` before construction. `data/HISTORICAL_LAYOUT.json` is a coarse local trace with original-image pixel provenance and an approximate graphical-scale conversion. It is NOT EPSG georeferenced. Do not invent absolute location accuracy or elevations. Inspect the original/crops while interpreting.

Every owned asset records source IDs, source dates, evidence status and assumptions. No source means an authored reconstruction assumption, not a documented fact. Prewar and postwar photographs do not automatically prove the target-day condition. Do not guess historical text, exact losses, weapon placements or facade colours.

The source-map black footprint numbered1 is P.W.D. Offices, not established Internatio. Do not conflate the former residency at the bridge with the later governor's office elsewhere. Exclude Tugu Pahlawan, modern memorial parks, modern bridge paint/railings, modern traffic infrastructure and arbitrary smoke/combat damage from the historical base.

## Construction
Preserve all unrelated user data. Create project-owned collections and stable asset IDs; scripts may update/remove only explicitly owned objects. Back up before destructive edits. Use small, rerunnable operations and one active Blender writer. Save source scripts to disk before executing them. Never rely on transient chat code as the sole construction record.

One unit equals one metre. Local +X is image-right/approximate east, +Y image-up/approximate north, +Z up. Use instances for repeated modules, controlled texture sizes and adjustable detail collections. Detect Blender5.2 enums/API capabilities; a third-party skill does not override actual runtime inspection.

The optional `scripts/blender_map_blockout.py` is a starter for map-derived geometry only. It does not finish researched landmarks or validate architecture. Keep its water, road and placeholder heights classified as approximations where appropriate. Resolve landmark placement by comparing map, photos and official locator leads before detailed work; if no exact footprint can be justified, use a clearly labelled editable approximate massing and record the uncertainty, rather than silently blocking all progress.

## Durable progress and compaction
Before each meaningful batch: `begin` an operation with unique ID and expected outputs. After the batch: save the scene plus inventory, visually inspect, record actual verification, then `complete` with `--scene`. Update `NEXT_STEPS.md` and any changed decisions. Checkpoint before expensive work; never wait for a guessed token threshold.

After interruption, reconcile saved state with the live Blender filepath, owned asset IDs and `palagan_last_operation`. Pending work may already exist. Inspect it before rerunning. Never auto-complete pending work, regenerate the whole city after compaction, silently overwrite a known-good checkpoint or delete objects merely because their names appeared in an old summary.

The optional compaction plugin only injects compact recovery context. It neither saves Blender nor guarantees continuation. Validate compatibility with the installed OpenCode version; keep file-based recovery working without it.

## Completion
Follow `docs/QUALITY_GATES.md`. A nonempty file and successful script are necessary but not proof of visual/historical quality. Reopen the final `.blend`, inspect fixed reference views and source comparisons, report actual object/triangle/material counts, retain remaining assumptions, and provide exact output paths. Never describe unexecuted checks as passed. Work through the approved scope without repeated requests for ordinary reversible choices.
