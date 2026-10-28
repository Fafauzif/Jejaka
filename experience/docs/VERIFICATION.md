# Field edition verification

Edition: Jejaka 2.0.0, 28 October 2026 (Asia/Jakarta). This record supersedes the first-edition report archived under `docs/reconstruction/`.

## Executed software and asset checks

| Area | Result | Actual scope |
|---|---|---|
| State, clocks and export | 17 tests passed | Node tests cover bilingual schema, all eight branch combinations, save validation, duplicates, storage failure, non-recordable ending, real-time clocks at simulated 1/5/15/30/60 FPS, pause/stall bounds, transition envelope, actual Three.js gesture progress at 1/5/30/60 FPS, portable notebook and markup escaping |
| Browser journey | Passed in Chromium 133.0.6943.141 | All eleven beats reached through visitor controls using actual short transitions; nine entries, photograph, chosen actions, notebook handoff and ending retained |
| Camera | Passed | Native keyboard cancel records nothing; pointer drag changes composition; shutter saves a nonblank 960×540 JPEG; touch capture works at 375×667 |
| Portable notebook | Passed | Actual HTML download contained chosen text and the embedded visitor photograph; file was 61,553 bytes in the checked session |
| Timing and transitions | Passed | Camera reposition observed under computed opacity 1 with reduced motion off; manual W movement stops on release and skip remains available; first software-browser transition took 10.358 seconds including click/voice completion and rendering overhead |
| Save and continuation | Passed | Reload restored photograph, choices, account and selected quality/pacing settings |
| Pause and controls | Passed | Zero world renders during a 1.6-second paused sample; Escape works after focusing select/range controls; phone settings fit their viewport |
| Caption layout | Passed | Three choice scenes at 1280×720, 390×844 and 375×667: nine measured layouts with no caption/button overlap, clipping or horizontal overflow; named heads remained in frame and above captions |
| Final viewpoint | Passed | Sampled eye was 0.542 m above local bridge floor; final skip reaches afterword; viewpoint stays physically with Raka |
| Restart resources | Passed | Two confirmed restarts retained six cast members and cleared entries; measured geometry/texture counts did not grow (410→404 geometries, 69→38 textures) |
| Browser errors | Passed | No JavaScript errors, failed HTTP requests or console errors, including shader compilation, in the release journey |
| Audio | Passed | Web Audio start, actual MP3 decode, speech duck/recovery, pause/resume races, cues, source expiry and disposal; delayed MP3 accepted while paused and produced speech after resume; stop/disposal canceled pending speech |
| Character exports | Passed in Blender 4.0.2 | Both final GLBs freshly imported; one skin, five actions with animated channels and preserved hand.R binding; male Idle/Gesture/Run and Sari Idle/Gesture renders inspected |
| Delivery assets | Passed | All three GLBs have valid version/length headers and no network-dependent image/buffer URIs; gzip decoding valid; original city export remains byte-identical to the baseline source |

The browser journey used SwiftShader software WebGL. Functional controls ran at pixel ratio 0.5 to limit test-machine cost; separate visual captures and the workload profile used pixel ratio 1. The journey did not accelerate the ordinary short scene transitions. Layout and profile checks separately staged chapter positions. These are software checks, not a visitor study or target-GPU performance measurement.

## Final acting check

After the route checks, a focused browser inspection checked the delivered male rig’s actual skinned shoe vertices and skeletal positions. The legacy Crouch pelvis track moved backward instead of down. A guarded runtime correction now lowers it by 0.17 m on the correct axis; the source generator uses that corrected axis for future rebuilds. Compared with Idle, the measured sole height changed by less than 1 mm and the head lowered by 18.77 cm. The result is a protective crouch, not deep kneeling. The corrected last-view capture was inspected with secondary bridge passers hidden, so they do not cross through Damar.

The final skeletal clock uses bounded real elapsed time, separately checked with actual Three.js clips at 1/5/30/60 FPS and pause. The last changes affected acting and the final-view overlays; they received focused browser checks after the full journey. The state/clock/export suite then passed all 17 tests again.

## Measured asset and rendering change

| Measure | Deployed first-edition baseline | Field edition |
|---|---:|---:|
| City delivery file | 15,981,642 bytes | 7,175,486 bytes |
| City triangles in asset | 589,280 | 298,603 |
| Male character | 52,406 triangles / 9 primitives | 31,820 / 5 |
| Sari character | 38,476 triangles / 9 primitives | 25,030 / 6 |
| Combined three 3D delivery files | 19,166,070 bytes | 9,466,486 bytes |
| Steady arrival-view draw calls | 928 per frame | 324 per frame |
| Steady arrival-view processed triangles | 1,619,652 per frame | 466,035 per frame |

The file payload fell by 50.6%. Renderer counts include all passes: the earlier baseline regenerated shadows every frame, while the field edition reuses the architecture shadow map after warm-up. Both views used the arrival camera and a 1280×720 drawing buffer. The new measurement sampled four frames with balanced cached shadows and pixel ratio 1. It demonstrates about 65% fewer draw calls and 71% fewer submitted triangles in this view; it does not establish the FPS gain on a laptop GPU. First-render shadow generation and other viewpoints have different costs. Texture allocation counts are not measured VRAM bytes.

## Extracted application check

A clean extraction was served with `experience/` directly at `/`, matching Vercel’s output directory. The compatibility journey passed title/start, reduced motion, notebook, held-key movement/release, bridge image, shelter choice, all eleven beats, nine entries, ending sources, reload/continue and a confirmed restart from the completed account. New street civilian marks were checked in the camera frustum and clear of nearby architecture. No JavaScript or HTTP errors occurred.

This compatibility journey accelerated long ordinary walking and the final timer through test-only hooks; the separate field-edition journey above used actual short transitions. Both distinguish control/state verification from a natural-duration visitor study.

## Hosting and packaging

The supplied baseline URL, https://jejakaprototype.vercel.app/, and its original asset responses returned HTTP 200. The old gzip response had no Content-Encoding and was compatible with the explicit decompression loader. A cloud browser could not create its WebGL context; that limitation does not establish a fault on the user's device. The updated field edition has not been deployed by this package.

The update ZIP supplies relative local modules, assets, source scripts, licences and context files. `PACKAGE_MANIFEST.json` records bytes and SHA-256 hashes. Its source city master and research folders remain outside the update archive. The obsolete runtime `district.glb.gz` is not included or loaded; the new route derivative is complete for playback.

## Material limits

- No measured hardware-GPU FPS, VRAM, thermal or hosted-network result on the presentation machine; no 60 FPS guarantee.
- No full facial rig, lip sync, finger articulation, cloth simulation or motion capture. The body rig and authored motion remain stylized. Receiving the notebook is staged, not contact-solved hand animation.
- Fire, dust and falling plaster are authored effects, not a structural-collapse simulation. Background architecture and fixtures retain reconstruction assumptions.
- No human listening assessment of pronunciation, acting or the full mix, and no calibrated headphone/loudspeaker test. Signal tests do not establish sound quality.
- No broad browser certification, formal accessibility conformance, kiosk deployment, learning-outcome study or museum partnership.
- No verified exact day/hour, attack identity or building-specific 1945 damage record for the fictional episode. The afterword and historical notes retain this boundary.
