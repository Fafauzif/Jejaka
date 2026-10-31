> **Latest: read `10_GROUNDED_REVISION.md` and root `MASTER_AI_CONTEXT.md`.** User1A/2B/3A locks map-grounded relationships, disclosed compression, 4–5min main route, Indonesian captions/environment only. Earlier duration and geography below are preserved history.

> Latest escape revision: read `09_ESCAPE_REVISION.md` and `experience/docs/ESCAPE_VERIFICATION.md` for the active implementation and actual checks. The notices and checkpoint text below are preserved history. Settled answers remain unchanged; the latest user request expands review/refinement to 10–20 substantive passes.

> Continued build: read `08_CONTINUATION_RESULT.md` and `experience/docs/CONTINUATION_VERIFICATION.md` for the delivered implementation and actual evidence. The text below is the original checkpoint history; its earlier test counts and unfinished-feature descriptions are not the current release record. Settled user answers remain unchanged.

# Jejaka implementation checkpoint — 30 October 2026

**Latest clarification answers are now included.** Read `01_LOCKED_USER_DIRECTION.md` immediately after this technical handoff; it overrides older length, language and device assumptions. Read `02_USER_ANSWERS_VERBATIM.md`, inspect the five supplied reference images, then follow `04_NEXT_RUN_BUILD_TARGET.md`. No repeated preference questions. The later council/playtesting request is adapted in `06_GAME_REVIEW_CONTRACT.md`; read it before implementation. The current code remains a checkpoint; the new three-minute, Indonesian-first, phone-essential cultural/stealth/helping direction is work for the next run.

This is WORK IN PROGRESS, packaged early at the user's request to move to a new chat before credits run out. The user wants implementation and iterative improvement, not another planning-only ZIP. This package contains the entire current `experience/` tree plus relevant instructions/context. Extract at repository root, replacing overlapping files. It has no enclosing Jejaka directory. No GitHub push or deployment has occurred.

## Resume without repeating discovery

1. Clone https://github.com/Fafauzif/Jejaka. Baseline read by this run: `417a8a6d259ffb77e11c0bfe2b02bf42b0616fb9`. If remote has moved, inspect differences before overlaying. Apply this ZIP's files to the checkout. Preserve unrelated research/assets/master Blender files.
2. Read root AGENTS.md, this technical handoff, `handoff/01_LOCKED_USER_DIRECTION.md`, the verbatim answers and reference guide, then relevant repository/history context and DESIGN.md. Latest answers override earlier guided-tour, desktop-first, English-default and long-session assumptions.
3. Start from current implementation, not the original runtime. Active entry: experience/index.html -> game/app.js. Old field edition retained at experience/legacy/index.html. Root/Vercel still serve the website. No build step, backend, API keys, npm runtime or native engine migration.
4. Run the new unit and browser tests, inspect actual rendered output, repair first, then improve. Final user deliverable is a repository-root extraction ZIP, not just a prompt bundle.

## User's settled direction

Browser mandatory. Stylized cinematic. Full active-runtime replacement, previous version preserved. First-person journalist Raka Pradana in Surabaya, November 1945; Sari/Damar fictional. Free movement, richer social activity, visible war, meaningful interaction and local consequences. Historical battle outcome stays fixed; non-graphic death and surviving notebook. Do not invent exact date/attacker/weapon/landmark damage or institutional partnerships. Do not ask routine permission. Delegate independent tasks and demanding review when useful. Keep refining, but verify actual output and disclose gaps honestly.

## Current implementation

- game/app.js: renderer, free-look/keyboard/touch input, modals, objectives, contextual interaction, camera, notebook/download, local saves, settings, ending, debug/test hooks.
- game/simulation.js: renderer-independent controller and rules. Circle footprint vs AABBs with substeps, acceleration/braking, walk/run/crouch/injured speeds, stamina, cover regions, ordered objective progression, three choices, nine entries, schema validation.
- game/world.js: authored compact street/river/bridge rather than loading the old whole district. Original procedural materials, shopfronts, props, lamps, shelter, moving cart, shutter; instancing, detail culling, spatial batches, skyline representation. Newly composed street is production fiction, not survey-exact historical reconstruction.
- game/actors.js: batched articulated stylized civilians, variable silhouettes/accessories/faces, blink, gait, routine/alert/flee/cover, distance tiers/far cards, Sari/Damar movement.
- game/effects.js: bounded instanced smoke/fire/debris, directional warning/trail/flash, impact/aftermath, reset and restoreImpact API, reduced-motion fallback.
- game.css and index.html: cinematic local-font title/HUD, responsive native dialog, viewfinder, notebook, pause, settings, touch controls.
- Existing audio.js reused for original procedural ambience/foley. New dialogue is bilingual captions. Existing MP3s were intentionally not used to voice changed dialogue.
- Legacy old HTML/module/CSS copied under experience/legacy. Root master geometry, research, cartography and original assets not overwritten.

## Spatial layout

Y-up, flat ground0. Spawn (x0,z24), face -Z. Sari(-6,10). Photograph marker(0,-24). Bridge across river z-24..-38; walk x roughly±4.7. Damar(6,-42). Parcel(-10,-48). Shelter(-15,-12), cart(-10,-7). Bounds x±28,z[-65,30]. Stage order: sari,bridge,damar,parcel,shelter,handoff,ending,afterword. First impact near north market(7,-44), second on return south(7,-10), persistent south rubble only after flags.returnImpact. The flag returnImpact was added during final integration; the 32 unit tests were then re-run and passed. Re-run relevant tests after changing this checkpoint.

## Actual verification so far

- `node --test experience/game/*.test.mjs experience/tests/*.test.mjs`: 32/32 passed after final rule integration. Includes 15 new simulation tests and 17 retained legacy unit tests. The later sky-radius and browser-harness shutdown edits were syntax-checked without a new full browser render. Re-run relevant checks in the next environment.
- Actual Three scene graph exercised by agents, bounded crowd/effects pools, target reachability through authored world colliders.
- Actual software-WebGL browser started. Observed passing checks: title ready; WASD; river collision; pause freezes time; Sari warn choice; real camera JPEG; reload+continue with choice/photo; Damar errand; parcel causes impact+aftermath; shelter help opens courtyard. The browser suite then finished: all15 checks passed, with zero uncaught errors, console errors or failed resource requests. The actual report is bundled. Re-run in the next environment. The final sky-radius fix and harness server shutdown correction were applied afterward and syntax-checked, but not re-rendered before handoff.
- Screenshots in handoff/qa are real browser captures, not design mockups. They may precede the last world edits.
- Old browser harnesses target old UI and are not the new app's regression contract. New one: game/browser-test.cjs.
- No human timed playtest, consumer-GPU benchmark, hosted Vercel test, audio listening review, cross-browser matrix or complete accessibility audit.

## Review fixes already applied

1. Simulation rejects paused interactions, so app's `act()` temporarily unpauses only the rule mutation when a modal choice is selected.
2. `copy()` understands the simulation's {en,idText} evidence schema as well as {en,id} UI strings.
3. End/afterword excluded from nearest interaction so handoff cannot repeat; E can skip ending.
4. Viewfinder passes drag input to world; photograph samples actual optical-frame DOM rectangle instead of unrelated16:9 crop.
5. Aftermath restore uses restoreImpact direct age, avoiding a replayed blast on Continue.
6. Handoff interaction uses Damar's live position in nearest() to avoid speaking to empty space.
7. Latest source may include sky sphere radius correction by world agent; inspect current file.

## Highest-priority next work

A. Re-run the completed browser suite after the final small patches and fix integration regressions. Handoff test must follow live Damar: static marker and actor can diverge. Root HUD still draws target marker from rules at(-15,-12); align it with live actor too. Ensure afterword/note panel return path behaves. The harness now closes its internal server in finally; that shutdown correction is syntax-checked and should be exercised on the next run.
B. Re-render the sky-radius fix. Early screenshots show a huge pale angular patch. Suspected cause: sky sphere radius350 versus camera far300. The delivered sphere is now radius180; the corrected appearance still needs actual visual confirmation.
C. Make the first impact visible from parcel encounter; then verify second impact only once on return. Current player faces parcel left; northern blast can be off-axis. Warn before blast, allow cover, ensure reduced-motion/mute still readable.
D. Verify Damar path/arrival and Sari shelter travel, obstacles/props, photo framing at narrow aspect, modal focus/Escape, title/new account/continue reset. Verify session flag returnImpact saves/restores and old saves default false.
E. Improve near-character appeal and contact/performance. Current organic primitive/instanced humans are stylized, not hero-quality rigs. No facial lip sync/hand IK/foot IK or contact-solved handoff. Rescue is a state-driven choice with door/civilian changes, not a fully animated physical assistance sequence. Do not claim those features exist.
F. Improve gameplay consequences further. Cover reduces exposure feedback and impact stamina loss, but no full ballistic hazard simulation/navmesh. Listen currently provides contextual sound captions. Do not describe the full brief as completed.
G. Profile meaningful views. Small resident procedural world has detail culling, frustum/spatial batching and far cards, not network chunk streaming/KTX2/HLOD atlas pipeline. Rendering software speed is not hardware FPS evidence.
H. Update documentation and packaging manifests. Baseline PACKAGE_MANIFEST/CONTENTS describe the previous release and may be stale; new checkpoint SHA256SUMS is authoritative for this archive.

## Browser environment workaround used in this chat

Each exec command has an isolated network namespace. A server started in an earlier separate exec call is unreachable. New browser-test.cjs now starts an internal Node HTTP server at8123 in the SAME process/namespace as Playwright. Do not keep retrying separate python servers.

No installed browser at first. npx download returned invalid0MB ZIP. Debian bookworm Chromium and headless-shell packages were downloaded via isolated APT lists and extracted under `/tmp/jejaka-chromium/runtime`. No repo dependency on these files. Desktop chromium fails AF_UNIX singleton restrictions; headless-shell with single-process works. Wrapper `/tmp/jejaka-chromium/headless` exports LD_LIBRARY_PATH and execs headless-shell with --no-sandbox --no-zygote --single-process --disable-dev-shm-usage --disable-gpu-sandbox --enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader. This temp runtime is NOT bundled and need not be reproduced on normal machines. In a fresh environment use an ordinary installed Chromium.

Browser command: `CHROMIUM_PATH=/path/to/chrome PLAYWRIGHT_MODULE=/path/to/playwright node experience/game/browser-test.cjs`. It creates its own server unless JEJAKA_TEST_URL is set. Output defaults temporary; JEJAKA_QA_DIR can choose a path. Hooks exist only at ?test=1. Debug counters at ?debug=1. If regular Chromium needs extra args adapt launch options, don't change product behavior for tests.

## Completion standard

Use up to four concrete critique/fix/recheck rounds with an independent reviewer. Do not stop at visual declarations or arbitrary self-scores. Ship the strongest verified browser slice. Clearly separate implemented features, verified behavior, subjective art judgments and remaining production gaps. Keep scores/process chatter out of player-facing UI and final product docs unless asked. Return a tested root-overlay ZIP with install instructions and truthful remaining limits. Do not publish/push without explicit authorization.

## Final checkpoint note

The broad doc refresh delegated to an agent was interrupted when the user asked to hand off; root AGENTS/README now point to this file, which is authoritative. Sky sphere was changed350→180 (camera far300) to address suspected far-plane clipping; actual corrected appearance remains unverified. Harness now closes its internal server. These two final small changes passed syntax checks only. Other inherited manifests and guides may still describe v2.

## Clarification update included in this archive

The user has now answered all13 questions. The archive contains their exact text, a resolved decision sheet, all5 supplied images with byte/hash provenance, a reference guide and a next-run build target. The current runtime is unchanged from the earlier code checkpoint. New requirements have been documented for continuation rather than silently marked implemented. The next chat must use these answers and proceed, not ask them again.

The user's final clarification explicitly places the full subagent council, repeated game play and improvement loop in the NEXT chat. This package is the handoff, not the result of that future loop. Read `06_GAME_REVIEW_CONTRACT.md` and execute it during continuation.
