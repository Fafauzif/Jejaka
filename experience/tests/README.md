# Checks

From the repository root:

```bash
node --test experience/tests/*.test.mjs
```

The state suite uses only Node's built-in test runner. It covers bilingual schema, valid choices, eight final-account combinations, duplicate prevention, save restoration, invalid saves, storage errors and non-recordable final scenes.

`browser-smoke.cjs` runs an accelerated complete journey through actual DOM controls and test-only staging hooks. It serves the checkout within its own process, checks model/character loading, notebook, bridge photograph, held-key movement, branch state, ending and continuation, and rejects page/HTTP errors. It requires Playwright and an installed Chromium executable. It does not measure a full-duration play session or hardware-GPU performance.

```bash
npm install --no-save playwright
npx playwright install chromium
node experience/tests/browser-smoke.cjs
```

Use `PLAYWRIGHT_MODULE` for a nonstandard module path and `CHROMIUM_EXECUTABLE` for a locally supplied Chromium. Screenshots and results go to a temporary directory, outside the source. `?test=1` exposes chapter jumps for QA; ordinary URLs do not expose those hooks.

For release presentation, also inspect the actual screen on the target laptop and hosted preview, listen to Indonesian pronunciation, check speaker levels, and walk the chapter at human pace. Automated checks cannot establish museum suitability or historical authority.
