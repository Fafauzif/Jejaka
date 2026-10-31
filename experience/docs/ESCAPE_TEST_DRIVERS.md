# Escape edition: tests and browser drivers

The game needs no package installation or build. These development tests are optional and separate from playing it.

Run the rule suites from repository root:

```sh
npm test --prefix experience
```

The browser drivers require a separately installed Playwright and Chromium. They accept `PLAYWRIGHT_MODULE` for an external Playwright module and `CHROMIUM_PATH` for an existing Chromium executable; otherwise they use a normal local Playwright installation and its configured browser. Browser binaries and package caches are not included in the ZIP.

```sh
node experience/escape/browser-test.cjs portrait
node experience/escape/browser-test.cjs landscape
node experience/escape/desktop-test.cjs assistance
node experience/escape/desktop-test.cjs alternate
```

Run software WebGL journeys sequentially. Each driver creates a local HTTP fixture, uses ordinary browser inputs and opts into read-only navigation evidence with `?test=1`. The phone driver uses genuine browser-native touch contacts, including simultaneous contacts and cancellation. Neither driver advances the story through state writes, teleports or clock acceleration.

`JEJAKA_QA_DIR` selects an output folder; otherwise the driver uses a temporary folder. `JEJAKA_ROOT` selects another checkout. `JEJAKA_SUBPATH` tests a nested hosting prefix. Each report records source hashes, actual inputs, observed failures, captures and available timings. Preserve failed runs when diagnosing a regression.

See `ESCAPE_VERIFICATION.md` and `ESCAPE_TEST_EVIDENCE.json` for the release checks actually executed. A staged component check, a bounded workshop test and a completed natural journey are different evidence. Native touch emulation does not establish physical-phone performance; automated or clamped application clocks do not establish normal human pacing or learning.

The final portrait's expanded input/recovery coverage used these optional flags:

```sh
JEJAKA_SECONDARY_PREFLIGHT=1 JEJAKA_MIDHELP_RELOAD=1 JEJAKA_MANUAL_LOOK=1 JEJAKA_RUN_CAPTURE=1 node experience/escape/browser-test.cjs portrait
```

For nested hosting, prefix a command with `JEJAKA_SUBPATH=/qa/nested` (touch) or `JEJAKA_SUBPATH=/museum` (desktop). `JEJAKA_SECONDARY_PREFLIGHT=1` and `JEJAKA_MANUAL_LOOK=1` also enable the additional simultaneous-touch and camera-override probes in either touch orientation.

The touch driver requests software WebGL for reproducibility. Desktop can request it with `JEJAKA_SOFTWARE_WEBGL=1`. Desktop viewport defaults to 960×640; `JEJAKA_VIEWPORT_WIDTH` and `JEJAKA_VIEWPORT_HEIGHT` select a different test window. These are test settings, not game rendering requirements.

`JEJAKA_CAPTURE_HELD=1` records a held workshop frame while continuing the full route. `JEJAKA_BOUNDED=1` stops after the workshop and explicitly reports an incomplete, bounded check; it is not a full journey. The final landscape repair replay uses held capture with the full route.
