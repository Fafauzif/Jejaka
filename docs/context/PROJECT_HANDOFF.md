# Jejaka project handoff

**Snapshot:** 28 October 2026, Asia/Jakarta. **Repository:** https://github.com/Fafauzif/Jejaka

## Read first

Read the root `AGENTS.md`, this handoff, `docs/context/CURRENT_DECISIONS.md`, and `docs/context/COMPETITION.md`. Then inspect the files relevant to the current task. `experience/docs/STORY_ROUTE.md` describes the active route and separates shipped behavior from extended direction; `experience/docs/HISTORICAL_NOTES.md` defines the evidence boundary.

An earlier master context pack describes a discovery stage and includes superseded aerial/strategy ideas. It is historical context, not the authority for the current camera, scope, or permission to implement. The user has approved the playable guided prototype and autonomous reversible implementation. Do not repeatedly ask for those approvals.

## Product in one paragraph

Jejaka is a first-person browser experience set in a researched but approximate reconstruction of the Jembatan Merah–Kali Mas district of Surabaya in November 1945. The visitor follows fictional journalist Raka Pradana as he meets residents, writes observations, experiences escalating danger, and passes on his notebook before dying. The visitor makes three local decisions. The ending account retains those choices while the battle's historical outcome remains unchanged. A separate afterword distinguishes the fiction from the historical setting. Museum reuse is a future aim.

## Current implementation map

| Path | Responsibility |
|---|---|
| `index.html` | Repository-root entry that redirects to the active experience |
| `experience/index.html` | Title, introduction, HUD, notebook, pause, historical context, and ending markup; local module imports |
| `experience/style.css` | Responsive presentation, readable overlays, focus/control styling, reduced-motion layout |
| `experience/app.js` | Renderer/camera, guided movement, cast instances, interaction UI, dialogue timing, save/continue, pause/restart, notebook photograph/export |
| `experience/story.js` | Eleven bilingual story beats, route positions, spoken text, secondary captions, three choice pairs, source links |
| `experience/state.js` | Nine-record notebook state, validated restore, choice persistence, derived ending account |
| `experience/world.js` | Compressed district loading, lighting, walking-surface height, original props, staged smoke/fire/dust/plaster, local choice response |
| `experience/audio.js` | Original procedural ambience/foley and playback of packaged synthetic speech through visitor-controlled Web Audio |
| `experience/lib/` | Vendored Three.js revision 169, required addons, and licence |
| `experience/assets/district.glb.gz` | Gzip-compressed copy of the original exported district |
| `experience/assets/characters.glb` | Original adult male civilian, skin, materials, and five skeletal clips |
| `experience/assets/sari.glb` | Original adult woman variant for Sari, sharing the clip vocabulary |
| `experience/assets/audio/` | Twelve packaged mono MP3 files, including optional introduction, principal beat speech, final line, and afterword |
| `experience/tools/build_characters.py` | Reproducible Blender character, skeleton, and clip generation |
| `experience/tools/build_sari.py` | Woman variant generation using the shared builder |
| `experience/tests/state.test.mjs` | Story schema, choices, persistence, invalid input, recordability, and eight branch combinations |
| `experience/docs/` | Route, history, writing standard, and world/character/audio production notes |

The active application is **buildless JavaScript**, not React or Vite. Its import map uses local modules, so normal operation does not require a runtime CDN or shared API secret. Serve it over HTTP(S); opening module files through `file://` is not a supported launch method.

The district loader fetches the packaged gzip asset and uses `DecompressionStream('gzip')` before parsing glTF. This requires a browser that supports that API and WebGL. An error state handles missing support or failed asset loading. The application does not implement a service worker or guarantee offline relaunch/caching.

## Chapter and notebook

The sequence is arrival, Sari encounter, bridge, Damar encounter, Kembang Djepoen observation, close disruption, shelter choice, return, wounded notebook transfer, last view, and afterword.

Nine beats are recordable. `lastview` and `afterword` have `recordable:false` and no diary text. Raka cannot write after giving away his notebook, and the historical afterword belongs to the presentation rather than his account.

Three choice IDs are stable:

| Beat | Choice values |
|---|---|
| `sari` | `testimony`, `place` |
| `shelter` | `help`, `check` |
| `wounded` | `notebook`, `page` |

All eight combinations produce distinct ending accounts. The visitor can read and download the collected notebook. The bridge interaction captures a small image from the current renderer; it is a fictional in-experience photograph, not archival evidence.

The route is bounded. The visitor uses the guided continuation control or holds W/up to follow the path, can stop, and can look within the first-person view. There is no free-roaming open world, aerial camera, shooting, tactical simulation, or generative historical inference.

The nominal 10–12-minute duration is an unmeasured planning target. Optional stationary dialogue allowances total 660 seconds and movement adds time. A visitor who waits for all secondary captions can take longer; the runtime permits earlier progression. Do not present a target as a measured playtest result.

## Asset and historical source separation

The original reconstruction remains under `output/`, `assets/`, `data/`, `landmarks/`, `references/`, and `research/`. Its principal source scene is `output/PALAGAN_Surabaya_Master.blend`; the original browser export is `output/viewer/palagan_district.glb`. Preserve their source provenance and keep legacy asset IDs stable.

The old `output/viewer/index.html` is a preliminary reconstruction viewer with known loading/control defects identified before this implementation. It is not the active Jejaka application. Earlier reports saying that no browser runtime was verified describe that earlier stage.

The district export was measured at 51,880,068 bytes, 124 meshes, 40 materials, 12 embedded images, and no animations. Its browser delivery copy is gzip-compressed; compression does not add historical accuracy or reduce the geometry automatically. Original characters, props, effects, sound, and fiction are layered separately.

The reconstruction's base scene was reported as authored in Blender 5.2.2. A self-contained Blender 4.0.2 was installed and verified in the execution environment: cube creation, 128×128 Cycles CPU render, `.blend` save, and nonempty valid GLB export passed. New characters were built with that verified version. Compatibility of the newer production `.blend` with the older local Blender was not established; do not overwrite the master through an older version.

Use `RIGHTS_AND_ATTRIBUTION.md`, the image credits, and asset-specific notices. A map or photograph supports only what its date and coverage establish. A licensed production asset is not evidence that an object stood at a particular address in November 1945.

## Verification established during implementation

The recorded browser check used Chromium 133.0.6943.141 with SwiftShader software WebGL. Its accelerated traversal confirmed:

- The local district and both animated character assets loaded under an `/experience/` subpath.
- Title, introduction, start, and reduced-motion flows were exercised.
- N opened/closed the notebook and recorded observations appeared there.
- Holding W moved along the guide and releasing it stopped movement.
- A bridge photograph was captured from the first-person renderer.
- The shelter choice was recorded.
- All eleven beats were reachable, with nine notebook entries and a retained chosen branch in the ending.
- The ending notebook and historical context remained accessible.
- Reload/continue restored a completed account and choices.
- That traversal recorded no browser JavaScript or HTTP errors.

The traversal used accelerated test controls. It is not a full-duration natural visitor session, a hardware performance benchmark, or evidence of museum usability. Additional small-viewport and audio-state checks were part of the corrective verification work. Consult `experience/docs/VERIFICATION.md` for the last checked state rather than infer closure from an earlier report. That final record supersedes intermediate check outputs.

State tests cover malformed saves, incompatible versions, invalid choices, duplicate entries, storage failure, full save round trips, non-recordable closing beats, and eight distinct choice combinations. Run them from `experience/` with `npm test` or `node --test tests/*.test.mjs`.

Audio production notes record FFmpeg decoding of the twelve MP3 files and a headless Web Audio signal/playback check. These tests establish functional decoding and signal output, not pronunciation, acting quality, calibrated volume, or the quality of the complete mixed chapter. Character notes record Blender export/import and inspected pose renders, not film-quality facial acting.

## Remaining verification limits

- No measured frame-rate/VRAM result on the user's presentation device or museum hardware.
- No broad compatibility claim for Safari, Firefox, low-end mobile GPUs, kiosks, or touch-only visitors from Chromium software rendering alone.
- No completed learning-impact study, audience study, institutional review, museum partnership, or real exhibit deployment.
- No verified exact day/hour or building-specific damage record for the fictional episode.
- No full facial rig, cloth simulation, motion capture, or synchronized hand-to-hand notebook transfer.
- No service-worker offline guarantee and no live Vercel deployment verification in this source-preparation run.
- The timing target still needs a natural, timed visitor session.

The final record at `experience/docs/VERIFICATION.md` should disclose any additional unresolved issue found in packaging or the last regression pass. Do not hide a defect to preserve a review score; review scores and private critiques are not product content.

## Local operation and deployment

From the repository root, `python3 -m http.server 8000` serves the source. Open the root URL to use its entry redirect, or open `/experience/` directly. From `experience/`, `npm start` invokes a simple Python HTTP server for the same buildless files. Python is a local development convenience; Vercel serves the static files without Python or a running Blender process.

The user will deploy to Vercel. Preserve any repository deployment configuration added during final packaging. The project requires static asset serving for local ES modules, GLB files, MP3s, and the gzip payload. A hosted success claim requires checking the actual user deployment; source files and local tests do not prove it happened.

An update ZIP is meant to be extracted and its contents merged into the repository. Merely committing the ZIP stores an archive. Keep the original reconstruction files and use the package's changed-file instructions for entry/configuration updates.

## Working on the next change

1. Inspect the current working tree, root instructions, current decisions, and the relevant production module.
2. Reproduce any reported issue before changing behavior. For visual changes, inspect the actual rendered route at eye level.
3. Keep historical base, fictional presentation layer, story data, and visitor state distinct.
4. Make reversible local changes within the approved scope without repeatedly reopening settled questions.
5. Recheck the affected route, choices, notebook, restart/continue, captions, motion/audio settings, and source/asset loading.
6. Update these context records when the user changes direction or the implementation materially changes. Record what was tested and what remains unverified.

Seek new direction when a change would alter the fixed ending, move to a new historical incident, add external commitments, change deployment ownership, or expand the chapter into a substantially different product. Routine repairs, documented route adjustments, and presentation refinements do not require a new discovery interview.
