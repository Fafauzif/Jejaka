# Grounded revision — 31 October 2026 latest user decisions

Read `MASTER_AI_CONTEXT.md` and `handoff/10_GROUNDED_REVISION.md` first. Latest answers: **1A** real street/river/landmark relationships with explicitly disclosed distance compression; **2B** a roughly **four-to-five-minute MAIN route**; **3A** natural Indonesian captions and environmental sound, **no voiceover**. User authorized implementation and another independent critique/fix/actual-play loop capped by the latest user at **four rounds maximum (latest user reduction from5–6), with the earlier2–3hour ceiling still in force**, and separately requests a comprehensive standalone master AI context Markdown plus the tested repository-root overlay ZIP. These override the older three-minute direction below. No push/deployment/submission is authorized.

Active modules remain `experience/index.html` → `experience/escape/app.js`; new `layout.js` contains map-derived topology with uniform 50% travel-distance compression. Fictional people, workshop, attacks, cart and school refuge use remain fiction. Keep mapped geometry, inferred architecture and fictional events distinct. A catalogue record is not an inspected image, native geometric clearance is not map fidelity, and source hashes invalidate affected old play results. Latest working base is `f57363b5543ed3f9428f8ba01b879107e39dc0ab` (the previous delivered H ZIP); all29 remote changed paths were byte-compared with that ZIP before integration.

Use fresh named freezes and real native desktop/touch input. One software-WebGL renderer at a time. Label snapshots, bounded component runs, complete natural endings, cleanup and extracted-package checks separately. No fabricated independent scores, human learning, real-phone GPU results or human completion time. Previous H verification is historical for H, not this geometry or story. Preserve research, original maps/photos, master geometry, prior editions and unrelated files. `MASTER_AI_CONTEXT.md` must be finalized with actual release evidence and also delivered separately.

---

# Active escape revision — latest user direction

The latest user explicitly requests a much larger revision and 10–20 substantive review/refine/play passes, with several hours available. That supersedes the earlier up-to-four-round cap and acceptance of the old guided errand route. They reject forced photography, unclear sudden fire, unnatural Indonesian, weak animation/chaos and an incoherent death. The active replacement is now `experience/index.html` → `experience/escape/app.js` with `escape.css`; the former active game is preserved at `experience/previous/`, and the earlier field edition at `experience/legacy/`.

Read `handoff/09_ESCAPE_REVISION.md`, `experience/docs/ESCAPE_CULTURAL_RECORD.md` and the current escape verification record. The central experience is escorting Sari and Adi through an expanding civilian escape with readable causes, meaningful cover/help, visible culture and historical context. The latest story deliberately replaces the unearned fixed death with reaching refuge. Preserve all original research/master/source assets. No push or deployment is authorized; deliver a root-extraction ZIP. Do not ask the settled questions again.

New tests: `node --test experience/escape/*.test.mjs experience/game/*.test.mjs experience/tests/*.test.mjs`. Old browser harnesses target older UIs; do not report their result as new escape evidence. Native touch completion requires genuine touch contacts. Bind evidence to frozen source hashes, retain failed observations and separate automated clocks from human pacing. No physical-device performance or measured learning claim without evidence.

---

# Current continuation build

Read `handoff/08_CONTINUATION_RESULT.md` and `experience/docs/CONTINUATION_VERIFICATION.md` first for current implementation and actual evidence. The settled direction in handoff/01_LOCKED_USER_DIRECTION.md remains authoritative. Older checkpoint test claims and file hashes apply only to that earlier archive. Preserve research/master assets and legacy edition. No push/deploy authorized.

# Checkpoint continuation override — 30 October 2026

Latest user direction: full browser game-runtime replacement, stylized cinematic, old edition preserved. Clarifications now lock a roughly THREE-MINUTE, fast-paced, Indonesian-first experience, essential PHONE support, dense civilian population, stealth/cover and helping, and culture-through-play. Read `handoff/01_LOCKED_USER_DIRECTION.md` and the supplied reference guide before implementing; these supersede older duration/language/desktop assumptions. The answers are settled: do not ask them again. The user explicitly requests specialist agents, an adversarial independent council, repeated actual playthroughs and an evidence-based review/fix/replay loop up to4 rounds; follow `handoff/06_GAME_REVIEW_CONTRACT.md` and the role briefs. Never invent independence, gameplay checks or passing scores. Read `handoff/00_CONTINUE_HERE.md` FIRST; it supersedes conflicting guided-tour implementation descriptions below. Active app is `experience/index.html` -> `experience/game/app.js`, with new simulation/world/actors/effects modules and `experience/game.css`. Old field edition is at `experience/legacy/`. Preserve historical research, source geometry and attribution. User requested an early checkpoint to continue in a new chat, not a final release.

Run `node --test experience/game/*.test.mjs experience/tests/*.test.mjs`. New browser harness: `experience/game/browser-test.cjs`; old browser harnesses exercise the previous UI. No push/deployment authorized. Deliver repository-root extraction ZIP.

---

# Jejaka: instructions for continuing this repository

## Current objective
Jejaka is a guided, first-person historical-fiction experience for the browser. A fictional Indonesian journalist, Raka Pradana, documents civilian life around Jembatan Merah and Kali Mas in November 1945, witnesses fighting, attempts to leave, passes on his notebook, and dies from an unseen injury. Indonesian speech and text have English subtitle support. The visitor stays inside his physical viewpoint. The user approved a playable prototype, a detailed route/story package, restrained realistic characters, notebook-led choices, and autonomous implementation and review. The user will deploy through Vercel.

This direction supersedes older requirements for an overhead strategy view, a Blender-only product, and no web application. Preserve the researched reconstruction as an asset and evidence base. Do not resurrect old product assumptions from the archived context pack.

## Read first
1. `docs/context/EDITION_2.md` (current field edition), then `docs/context/PROJECT_HANDOFF.md` and `docs/context/CURRENT_DECISIONS.md`.
2. `docs/context/COMPETITION.md` for the competition facts and their verification status.
3. `experience/docs/VERIFICATION.md` for what actually passed and what remains unverified.
4. `experience/docs/STORY_ROUTE.md` and `experience/docs/HISTORICAL_NOTES.md` before changing story or staging.
5. The relevant source module and production document. Read more only as needed.

The original discussion snapshot lives in `docs/context/ORIGINAL_CONTEXT_PACK_2026-10-28.md`; it includes superseded ideas and generic essay-workflow appendices. Current decisions take precedence. Legacy Blender construction rules live in `docs/reconstruction/BLENDER_RULES_LEGACY.md`.

## Implementation
The runnable app is `experience/`. It uses vendored Three.js r169, ES modules, relative URLs, local MP3s, procedural WebAudio, original animated civilian GLBs, and an optimized gzip-packed derivative of the district export. No build step, backend, login, API key, or live language model is required. Start a local HTTP server; file:// cannot reliably load modules/assets. Vercel serves `experience/` through root `vercel.json`.

`app.js` owns progression, camera, characters, notebook presentation and UI. `story.js` owns bilingual narrative data. `state.js` owns save decoding and notebook/branch state. `world.js` owns the reconstruction loader and separate presentation layer. `audio.js` owns sound and voice playback. `pacing.js` separates story time from movement/animation. `environment-detail.js` provides spatially scaled materials and fixtures. `notebook-export.js` produces the portable visitor book. The current city payload is `district-route.glb.gz`, an optimized derivative; old `district.glb.gz` is no longer loaded. Use the source scripts in `experience/tools/` to regenerate original characters. Test hooks exist only with `?test=1` and are not visitor controls.

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
Run `node --test experience/tests/*.test.mjs`. Run the browser harnesses with Playwright installed and a Chromium executable; see `experience/tests/README.md`. `v2-browser.cjs` covers current scene transitions/photo/skip/layout/reset; `audio-browser.cjs` covers actual sound lifecycle including delayed speech. Run software-WebGL checks sequentially to avoid rendering contention. Check notebook/choice persistence, all eleven beats, sound lifecycle, mobile caption/button separation, reset, reduced motion, root and subpath loading. Test narration changes against actual MP3 transcripts. Check asset licensing before adding external files. Record only checks actually executed.
