# Jejaka: instructions for continuing this repository

## Current objective
Jejaka is a guided, first-person historical-fiction experience for the browser. A fictional Indonesian journalist, Raka Pradana, documents civilian life around Jembatan Merah and Kali Mas in November 1945, witnesses fighting, attempts to leave, passes on his notebook, and dies from an unseen injury. Indonesian speech and text have English subtitle support. The visitor stays inside his physical viewpoint. The user approved a playable prototype, a detailed route/story package, restrained realistic characters, notebook-led choices, and autonomous implementation and review. The user will deploy through Vercel.

This direction supersedes older requirements for an overhead strategy view, a Blender-only product, and no web application. Preserve the researched reconstruction as an asset and evidence base. Do not resurrect old product assumptions from the archived context pack.

## Read first
1. `docs/context/PROJECT_HANDOFF.md` and `docs/context/CURRENT_DECISIONS.md`.
2. `docs/context/COMPETITION.md` for the competition facts and their verification status.
3. `experience/docs/VERIFICATION.md` for what actually passed and what remains unverified.
4. `experience/docs/STORY_ROUTE.md` and `experience/docs/HISTORICAL_NOTES.md` before changing story or staging.
5. The relevant source module and production document. Read more only as needed.

The original discussion snapshot lives in `docs/context/ORIGINAL_CONTEXT_PACK_2026-10-28.md`; it includes superseded ideas and generic essay-workflow appendices. Current decisions take precedence. Legacy Blender construction rules live in `docs/reconstruction/BLENDER_RULES_LEGACY.md`.

## Implementation
The runnable app is `experience/`. It uses vendored Three.js r169, ES modules, relative URLs, local MP3s, procedural WebAudio, original animated civilian GLBs, and a gzip-packed copy of the district export. No build step, backend, login, API key, or live language model is required. Start a local HTTP server; file:// cannot reliably load modules/assets. Vercel serves `experience/` through root `vercel.json`.

`app.js` owns progression, camera, characters, notebook presentation and UI. `story.js` owns bilingual narrative data. `state.js` owns save decoding and notebook/branch state. `world.js` owns the reconstruction loader and separate presentation layer. `audio.js` owns sound and voice playback. Use the source scripts in `experience/tools/` to regenerate original characters. Test hooks exist only with `?test=1` and are not visitor controls.

## Boundaries
- Preserve the master `.blend`, existing research, source cartography, source photos, unrelated files, and recovery checkpoints.
- Blender 4.0.2 was verified for new asset generation in the authoring environment. Compatibility with the production scene reported as Blender 5.2.2 is NOT established. Do not overwrite a newer master with an older Blender.
- The district frame is local and map-derived, not survey-accurate EPSG georeferencing. Runtime uses Three Y-up; historical Blender coordinates convert `(x,y,z)` to `(x,z,-y)`.
- First-person staging is constrained by existing geometry. Do not move a route point without checking the whole connecting segment, body clearance, ground/bridge height, view and props. The west approach is authored staging; do not relabel it as a verified historical street alignment.
- Keep static architectural evidence separate from fictional people, dialogue, damage, fire, sound and events. A physics simulation or plausible model does not prove historical truth.
- Do not combine the September flag incident, October fighting/Mallaby's death, and November battle into one day. No exact date is locked for Raka's fictional episode.
- Never invent partners, museum adoption, competition submission/eligibility, survey results, measured learning gains, historical quotations, source access or passed tests.
- Nine beats create lifetime notebook entries. Final view and curatorial afterword are non-recordable. Three choices affect observations and the surviving account, not the historical battle outcome.
- Keep player-facing prose free of process commentary, scores, generic filler and prompt/tool references. Production docs may explain technical methods and actual limits.
- No pushing, publishing or competition submission is implied by permission to work locally. The current delivery is a ZIP for the user's GitHub/Vercel workflow.

## Verification after changes
Run `node --test experience/tests/*.test.mjs`. Run the browser harness with Playwright installed and a Chromium executable; see `experience/tests/README.md`. Check notebook/choice persistence, all eleven beats, sound lifecycle, mobile caption/button separation, reset, reduced motion, root and subpath loading. Test narration changes against actual MP3 transcripts. Check asset licensing before adding external files. Record only checks actually executed.
