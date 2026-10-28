# PALAGAN: Surabaya reconstruction kit

A research and execution package for a Blender 5.2 reconstruction of the Jembatan Merah–Kali Mas district, targeting November 1945. The package contains a high-resolution wartime city map, historical photographs, architectural briefs, source-critical research, a coarse map-derived layout and recoverable OpenCode build instructions.

**This is a preparation kit, not a finished `.blend`.** The supplied helpers are intended to run on the owner's computer through the existing Blender MCP connection. Geometry and final renders must be generated and reviewed there.

## Start
1. Extract this complete folder to a normal writable directory. Keep its subdirectories together. A short path such as `C:\Projects\PALAGAN` is convenient, but spaces in the path are supported when properly quoted.
2. Open Blender 5.2 and enable the existing MCP connection. Save any current work. The project agent must preserve unrelated objects.
3. Open OpenCode in the extracted project directory. Use the selected DeepSeek model and the existing Blender MCP server.
4. Give OpenCode the text in `START_PROMPT.txt`. The first task is to inspect the environment, source overview, map and current scene.
5. Inspect the result directly in Blender. The agent should leave the finished scene in a useful overview and provide saved landmark views.

No browser viewer is required. No model weights or paid-service credentials are included. The kit does not modify global OpenCode settings.

## Read by purpose
| Need | File |
|---|---|
| Stable agent instructions | `AGENTS.md` |
| Confirmed scope and acceptance | `docs/APPROVED_SPEC.md` |
| Exact downstream tasks | `docs/BUILD_PLAN.md` |
| Research summary and source access states | `research/RESEARCH_OVERVIEW.md`, `research/SOURCE_REGISTER.csv` |
| Original cartographic evidence | `references/maps/Soerabaja_1943_original.jpg` |
| Readable district tracing and uncertainty | `docs/SPATIAL_METHOD.md`, `data/HISTORICAL_LAYOUT.json` |
| Main architectural references | `references/images/REFERENCE_BOARD.jpg`, `landmarks/README.md` |
| Materials and appearance | `docs/ART_DIRECTION.md` |
| Operation and compaction recovery | `runtime/STATE_PROTOCOL.md` |
| Blender skill recommendation | `runtime/SETUP_OPENCODE_BLENDER.md` |
| Recorded package verification | `review/VALIDATION_REPORT.md` |

## Evidence limits
The principal map is based on a March 1943 aerial revision. Most appearance photographs are prewar; one 1948 image is a later comparison. They are useful evidence of urban layout and architectural form, not a photographic record of every feature in November 1945. Unseen sides, precise heights, colours, ground elevation and date-specific damage are not established. The supplied trace is local cartographic geometry, not a world-georeferenced survey.

The old residency beside the bridge is not the later governor's office. The map footprint marked `1` is P.W.D. Offices according to its index; it must not be renamed Internatio simply because it is nearby. Read the individual briefs before detailed modelling.

## What is verified here
The package's text/data consistency, image files, helper syntax and pure-Python recovery logic are checked. Live Blender MCP execution, Blender 5.2 visual output, laptop performance, and OpenCode plugin loading must be verified on the target machine. Read the validation report for the exact checks and limitations.

Image rights and attributions are recorded in `references/images/IMAGE_CREDITS.md`, the map notes and `RIGHTS_AND_ATTRIBUTION.md`. External papers and archive films with unconfirmed redistribution terms remain linked sources with original research notes.
