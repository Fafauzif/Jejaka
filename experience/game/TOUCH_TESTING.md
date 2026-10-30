# Native touch journey checks

The game itself is static and needs no Node build. These optional development checks require Node, Playwright and Chromium.

```sh
npm install --no-save playwright
npx playwright install chromium
node experience/game/touch-play.cjs portrait
node experience/game/touch-play.cjs landscape
node experience/game/touch-play.cjs comfort
```

`portrait` completes the family-help route. `landscape` uses low quality, muted sound and reduced motion, attempts cover, rotates through portrait and back, helps the family and reaches the natural ending. `comfort` uses the original lane-side cart approach and holds Help while following the moving object when necessary. Branch assertions check that the intended action really completed.

Additional examples (POSIX shell syntax):

```sh
JEJAKA_LIFECYCLE=1 node experience/game/touch-play.cjs comfort
JEJAKA_SUBPATH=/demo node experience/game/touch-play.cjs landscape
JEJAKA_QA_DIR=/tmp/jejaka-touch-results node experience/game/touch-play.cjs portrait
```

The lifecycle option adds real pause, reload and Continue checks. A headless tab switch may not deliver an OS blur event; that case is recorded as unverified. The subpath option serves the same files under `/demo/experience/` to check relative URLs.

Set `PLAYWRIGHT_MODULE` to use a particular Playwright installation; otherwise the driver uses the primary-runtime modules directory when available, then ordinary installed `playwright`. Set `CHROMIUM_PATH` only when choosing a browser executable; none is hardcoded. Output defaults to a new directory under the OS temporary directory. The final console line prints `QA_OUTPUT=...`.

## Contact and frame preflights

Before loading the game, the driver presses two native touch contacts on a blank page, ends the second contact and verifies that only its pointer ended, then ends the first contact. This guards the Chromium selective-contact adapter. The adapter was verified with Chromium 150.0.7871.100. If this preflight fails on another browser/version, stop and update the adapter; never count the journey as passed or bypass the check.

At game startup the driver verifies simultaneous movement/look, active-contact cancellation, and actual-frame crouch on/off. It waits for session frames and UI modes rather than assuming a fixed wall-time sleep is enough. Native modal swipes reveal off-screen choices. Every essential action uses browser-native touch contacts or Playwright's native `locator.tap`, with no keyboard rescue, teleport, clock acceleration, direct game handler invocation or simulation-state changes. The opt-in `?test=1` getters supply read-only navigation and measurement telemetry.

## Evidence limits

Reports include runtime hashes, browser/renderer, viewport, actual outcomes, errors, event-phase captures and timing. Intended cover attempts can end exposed and still complete; use the recorded flags, not an old screenshot filename, to identify the outcome. Actual WebGL canvas readbacks bind the displayed event frame to its state.

Software WebGL wall time includes automation and screenshot overhead. The `activeWallMs` field subtracts measured pauses but is not a precise human active-play measurement and can include loading. Simulation seconds, automated wall time and human pacing are different evidence. These checks establish functional touch emulation, not physical-phone performance, human learning gains, cross-browser certification or a measured three-minute human playthrough.
