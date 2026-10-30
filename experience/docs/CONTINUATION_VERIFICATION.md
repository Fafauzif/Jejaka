# Continuation verification — 30 October 2026

This is a tested development checkpoint, not a claim that every visual/quality target has been reached. Four bounded independent review → fix → actual replay rounds were used. Playtest, phone/reliability, art/population and cultural/narrative critics were separate from the feature builder. Failures and less flattering views were retained privately. No fabricated human playtest, learning result, score consensus or device benchmark is claimed.

## Source and delivery

Remote clone and a later remote check both matched documented base `417a8a6d259ffb77e11c0bfe2b02bf42b0616fb9`; there were no newer remote changes to overwrite. The supplied checkpoint was applied at repository root; unrelated research/master/source work remains preserved. This ZIP is a root overlay with no enclosing directory, deletion or rename requirement. It does not include Git data, browser binaries, caches, private reference images or bulky QA captures. Original research/master files are not duplicated.

Final runtime tree: `2d7095ed191f7835084ac2cafaa51748f82db80b7c951c3f0916f8ad2b519e1c`. This hashes active HTML, CSS and the five game modules with their relative names, matching the final natural desktop report method. Per-file hashes for the entire delivered overlay are in RELEASE_SHA256SUMS.txt / RELEASE_MANIFEST.json. A final fourth-round repair made cart reach follow the moving object instead of its starting point; the last three natural sessions repeat desktop, portrait and landscape on that repaired runtime. Later documentation/harness bootstrap cleanup did not alter its seven frozen files.

The overlay was extracted onto a disposable checkout of the documented base. ZIP CRC, paths and manifest bytes were checked; unit and browser checks were run from that extracted copy. Normal `/experience/` and mapped `/demo/experience/` loading are covered separately below. Old field edition resource paths were repaired; 26 HTTP checks verified shared fonts, audio, district gzip and vendor files at normal/subpath routes. Stored gzip is not incorrectly served with Content-Encoding. This is static legacy-resource verification, not a fresh full legacy gameplay run.

## Rules / effects checks

`node --test experience/game/*.test.mjs experience/tests/*.test.mjs`: **38/38 passed**, including from the extracted copy. There are 21 active-game checks and 17 retained legacy checks. Active checks cover collision/substeps, normalized movement, stance/stamina, pause, ordered interactions, all 8 local-choice combinations,9 lifetime notebook entries, immutable handoff, bounded save decoding, schema 3→4 migration, interrupted help/reload, sheltered/exposed forward consequences, coherent effects timing at 10/60 update rates, comfort aftermath restoration and bounded effect pools. A rendering/physics simulation does not prove historical facts.

## Actual browser sessions

Browser: Chromium 150.0.7871.100, Linux container, ANGLE/Vulkan SwiftShader. DPR 1. Final desktop used 640×400/low; phone profiles 390×844 and 844×390/low. This is browser-native touch emulation, not a physical phone or a modest-laptop GPU benchmark.

The natural drivers used ordinary keyboard/mouse or native CDP/touchscreen contacts, including simultaneous contacts and cancellation. They read opt-in state to steer and record evidence; they did not teleport, mutate progression, accelerate clocks or skip the ending. This establishes automated input behavior, not unguided human comprehension or human pace.

| Session | Result | Automated wall seconds | Application clock seconds |
| --- | --- | ---: | ---: |
| Round2 touch portrait / earlier revision | Natural afterword; no progression skip | 535.093 | 167.699 |
| Round3 desktop help + both cover segments / earlier effects | Natural afterword; no progression skip | 450.577 | 128.382 |
| Before cart repair: portrait lifecycle / exposed / family | Natural afterword; no progression skip | 534.229 | 163.217 |
| Before cart repair: desktop / warn / exposed / cart | Natural afterword; no progression skip | 407.433 | 118.916 |
| Before cart repair: landscape / north protected, south exposed / comfort/subpath | Natural afterword; no progression skip | 609.291 | 150.049 |
| Shipped cart repair: portrait lifecycle / touch cart | Natural afterword; no progression skip | 684.713 | 184.516 |
| Shipped cart repair: desktop / cart follow | Natural afterword; no progression skip | 569.760 | 119.100 |
| Shipped cart repair: landscape / comfort / subpath | Natural afterword; no progression skip | 751.559 | 152.349 |

The wall clock includes mandatory dialogue, automated steering, capture waits and, in the portrait lifecycle run, reload overhead. The application clock pauses in dialogue/menus and bounds long frame deltas; it is not human active-play time. The pre-cart-repair portrait measured 521.042 wall seconds after subtracting only measured pauses, still including automation/loading overhead. These numbers must not be silently rescaled into a human three-minute claim. Approximately three minutes remains a design target awaiting representative human/device timing.

Earlier mutable-source attempts were discarded. Failed strict-turn, wall-vs-simulation cancellation and headless-focus assumptions are not counted as completed play sessions. Six named contract case areas can be combined within sessions (for example portrait lifecycle and landscape comfort), but a combined case is not represented as another distinct full playthrough.

Observed consequences include warned versus listening Sari, protected versus scorched cloth, family/bundle moving into the courtyard versus cart/lane opening with family still at the threshold, actual photograph persistence, and the surviving notebook. A critic could identify batik's wax-resist process and the teacher/younger-relative relationship before reading the claim ledger. This is an AI content-legibility check, not a measured human learning outcome.

## Staged integration

`CHROMIUM_PATH=... PLAYWRIGHT_MODULE=... node experience/game/browser-test.cjs` from extracted copy: **15/15 passed**. It uses disclosed test-only teleports and a test ending hook, so it does not establish natural traversal or pacing. It verifies readiness, WASD, river collision, pause, choice, actual camera JPEG, reload/Continue with photo, ordered errand/impact/help, ending without posthumous notes, downloaded notebook with 9 entries/photo/sources, narrow panel, reset/comfort/language persistence, and no uncaught errors, console errors or failed requests.

The recorded natural portrait lifecycle checks verified real touch pause, two actual reload/Continue cycles (including northern aftermath), photograph, crouch, interrupted/resumed help, live handoff, natural ending and no horizontal overflow/resources/runtime failures. The final landscape checks orientation change, low/muted/reduced-motion readability and subpath hosting. Both impacts were protected in the repaired landscape replay. In the earlier landscape replay, the southern snapshot showed walking and an exposed outcome. The contextual Help row changes the touch-button layout, a remaining usability limitation; the exact cause of that earlier missed crouch tap was not established. Test harness bootstrap defaults are portable; install Playwright/Chromium separately for development tests or provide PLAYWRIGHT_MODULE/CHROMIUM_PATH. Runtime itself has no npm/build dependency.

## Profiling and material limits

The scene defines 56 civilians; low renders 40, balanced 48 and high 56, with distance tiers. In a pre-cart-repair portrait northern-impact readback: 77 draws,79,002 triangles and 86 effect particles, including 51 smoke cards and 18 debris instances. That is one recorded view, not a worst-case benchmark or an FPS claim. Static world batching fell from175 to 57 batches; different player views must not be treated as paired hardware measurements.

War/source visibility, helping composition and cultural continuity improved in actual captures. War still looks more orderly than the requested references: thin flames, modest dust/smoke and simplified crowd reactions remain limitations. Characters use stylized articulation. Helping moves people/cloth/cart but has no solved hand contact, lip sync, foot IK, navmesh or ballistic simulation. Cover is an authored-zone abstraction, not ray-tested ballistic protection. The photo may retain an objective-marker tip in a narrow frame.

No physical-phone/modest-laptop performance test, cross-browser matrix, hosted deployment, human timed playtest, learning study, full accessibility audit or new audio listening review occurred. Headless foreground-tab switching did not reliably deliver an OS focus event; actual OS focus-loss recovery remains unverified, although touch pause and real reload recovery passed. New dialogue is captioned Indonesian; unrelated old MP3s are not presented as new acting.

Raka, Sari, Damar, the family/shop/pattern, local route and exact destruction are fiction. Historical/source boundaries and asset licenses remain separate; see CULTURAL_RECORD.md, HISTORICAL_NOTES.md and existing credits. No push, deployment, purchase or publication occurred.
