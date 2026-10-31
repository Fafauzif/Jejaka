# Grounded browser checks

The visitor game is buildless and needs no npm runtime dependency. Optional test drivers require a separately installed Node/Playwright/Chromium environment. The current driver is `escape/grounded-test.cjs`; the older `browser-test.cjs` and `desktop-test.cjs` are historical H drivers.

From repository root, use `CHROMIUM_PATH=/your/chromium node experience/escape/grounded-test.cjs portrait` (or `desktop`, `landscape`). `PLAYWRIGHT_MODULE` can select an existing installation. Each invocation creates its own read-only same-process HTTP fixture; do not launch another server or renderer alongside it.

Options: `JEJAKA_SCOPE=snapshot|workshop|cover|rescue|bridge|journey`, `JEJAKA_SCENARIO=assistance|alternate`, `JEJAKA_QUALITY=low|balanced|high`, `JEJAKA_SUBPATH=/museum`, `JEJAKA_QA_DIR=/absolute/output`, `JEJAKA_ROOT=/absolute/checkout`. Video is optional with `JEJAKA_RECORD_VIDEO=1` and requires a compatible Playwright ffmpeg executable; ordinary verification does not require video.

Every run records source/driver/asset hashes before and after, environment, native input, screenshots and checkpoints. Native touch uses CDP contacts, including selective release. Navigation telemetry is opt-in and read-only; game handlers, state writes, teleports and clock overrides are not used. A bounded finalized run is not a complete journey. An immediate ending seal is not proof of optional postchecks or browser/server cleanup.

The four-round cap applies to the revision's actual review/play cycles. Native/component/extraction checks are reported separately, not inflated into extra game runs. See `GROUNDED_VERIFICATION.md` for actual results and limits.

## Final driver boundary

G04 completed the workshop but reached its first impact while still standing: the fixture waited too long to crouch. Native actual-world checks at that exact root show crouching protects and standing exposes. The driver now crouches when cued before walking toward cover. This correction has syntax/static verification only; it was not replayed after the four-round cap. Game warning time, radius and protection were retained. Do not turn the corrected script into a claimed passing session.
