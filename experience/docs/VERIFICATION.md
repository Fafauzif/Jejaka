# Verification and known limits

Edition: guided browser prototype, 28 October 2026.

## Executed checks

| Area | Result | Scope |
|---|---|---|
| Story and state | 9 automated tests passed | Bilingual schema; valid choices; eight distinct final-account combinations; duplicate protection; save roundtrip; malformed saves; unavailable storage; no posthumous notebook entries |
| Browser journey | Passed in Chromium 133 | Actual start/introduction and DOM actions; all 11 beats reached using accelerated travel hooks; nine lifetime notebook entries; first-person bridge image; chosen account in ending; reload/continue; zero page or HTTP errors |
| Movement | Passed | Holding W advances; releasing stops; button continuation and guided arrival work |
| Phone layout | Passed | Three choice scenes at 390×844 and 375×667;18px measured caption/button separation; no header collision or horizontal overflow; final375×667 heading visible at scroll 0 |
| Notebook and menus | Passed | N/Escape, journal entries, ending notebook, pause, English/reduced-motion settings, mute, modal focus containment |
| Ending sound lifecycle | Passed in fresh browser check | Running audio pauses in journal and resumes after close |
| Saved visual choice | Passed in fresh browser check | Reload/Continue restores shelter/help and moved parcel at the selected position |
| Audio signal | Passed in Chromium 133 | Original effects yielded a nonzero analyser signal; arrival MP3 fetched, decoded and played; pause/resume/close and volume clamps passed |
| Voice media | Passed | All 12 MP3s decoded with FFmpeg; source peak levels inspected; main-line transcripts recorded in the manifest |
| Character exports | Passed in Blender 4.0.2 | Both GLB headers, skin and five clip names checked; fresh imports and animated-pose CPU renders inspected |
| Route geometry | Checked against exported base | Revised straight staging segments checked at several body heights and lateral offsets; previous wall intersections removed. Low intersections with the rising bridge deck remain ground surfaces and the camera samples actual deck height |
| Scene appearance | Rendered inspection performed | Title, approach, Sari, final fire/smoke view and phone screens. Ground banding and clipped sky-dome triangles corrected after inspection |
| Portable typography | Passed | Both local font faces loaded; all six phone choice layouts rechecked after font loading |
| Extracted release | Passed | ZIP extracted and served with the application at site root, matching the Vercel output layout; title, gameplay, both character assets and final view loaded without page errors |
| Asset packing | Passed | Gzip decompression reproduces the source district GLB byte-for-byte |
| Vercel configuration | Fields and local output path checked | Static framework selection, empty install/build commands, output directory `experience`; no hosted deployment performed |

The browser harness uses a software WebGL renderer. Tests accelerated travel and the final-view timer to cover state transitions. These are executed software checks, not a human visitor study. No numerical review scores or critique exchanges form part of this report.

## Rendering and asset baseline

The district export contains 124 meshes and 500 primitives; runtime props, civilian meshes and effects add to that workload. The compressed city payload is 15,981,642 bytes; decompressed data is 51,880,068 bytes. Compression reduces transfer size, not geometry, decoded memory or GPU cost. The source reconstruction master is unchanged.

The characters use an original skeleton and authored clips. Their faces remain simplified. They have no facial lip-sync, motion capture or cloth simulation. The runtime shows a carried notebook after transfer; a bespoke two-person receiving animation remains future production work. Destruction consists of separate staged effects and falling material, rather than a general structural-collapse simulation.

## Unverified or incomplete production work

- Hardware GPU frame rate, loading time on public networks, memory use and thermal behaviour on the intended presentation device.
- A full-duration human-paced run.10–12 minutes is a planning target; waiting for every optional caption extends the visit.
- Live Vercel deployment, hosted response headers and browser compatibility beyond the tested Chromium environment. Test the deployed preview before presenting.
- Human listening review of Indonesian pronunciation, performance consistency, emotional delivery and calibrated museum speaker/headphone levels. Main lines have synthetic fictional performances; secondary dialogue remains captioned and there is no English dub.
- Formal accessibility conformance, screen-reader navigation through the full 3D experience, and physical museum installation testing.
- Verification of the exact target-day condition of individual buildings. The episode does not lock an exact day or reproduce an identified attack.
- Competition eligibility, official template and generative-AI policy, organizer confirmations and actual submission status. The competition context records prior booklet information with its access limits.
- Institutional partnership, visitor learning outcomes, adoption, impact or commercial readiness. None is claimed.

The playable chapter, production sources and documentation are suitable for prototype review. Museum release and historical certification require further work with the intended venue, historians and visitors.
