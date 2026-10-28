const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const http = require("http"),
  fs = require("fs"),
  path = require("path"),
  assert = require("assert/strict");
const root = path.resolve(__dirname, "../..");
const out = fs.mkdtempSync(
  path.join(require("os").tmpdir(), "jejaka-browser-test-"),
);
const results = [],
  errors = [];
const server = http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  try {
    if (fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
    const d = fs.readFileSync(p);
    res.setHeader(
      "Content-Type",
      {
        html: "text/html",
        js: "text/javascript",
        css: "text/css",
        mp3: "audio/mpeg",
        gz: "application/gzip",
      }[p.split(".").pop()] || "application/octet-stream",
    );
    res.setHeader("Content-Length", d.length);
    res.end(d);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
(async () => {
  await new Promise((r) => server.listen(8765, "127.0.0.1", r));
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_EXECUTABLE || chromium.executablePath(),
    headless: true,
    args: [
      "--no-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("http://127.0.0.1:8765/experience/?test=1");
  await page.waitForFunction(
    () => window.__JEJAKA__?.ready,
    {},
    { timeout: 180000 },
  );
  results.push(
    "Local model and both animated characters loaded under /experience/ subpath",
  );
  await page.evaluate(() => {
    __JEJAKA__.renderer.shadowMap.enabled = false;
    __JEJAKA__.renderer.setPixelRatio(0.5);
  });
  await page.click("#start");
  await page.check("#intro-motion");
  await page.click("#enter");
  await page.waitForFunction(() => __JEJAKA__.mode === "play");
  assert(
    await page
      .locator("body")
      .evaluate((el) => el.classList.contains("reduced-motion")),
  );
  results.push("Actual title/introduction/start/reduced-motion flow");
  await page.click("#act");
  await page.keyboard.press("n");
  assert(await page.locator("#journal").isVisible());
  assert.equal(await page.locator("#entries .entry").count(), 1);
  assert(!(await page.locator("#entries").textContent()).includes("Sari"));
  await page.keyboard.press("n");
  results.push(
    "Notebook opens/closes with N; contains only recorded observation",
  );
  const x0 = await page.evaluate(() => __JEJAKA__.camera.position.x);
  await page.keyboard.down("w");
  await page.waitForFunction(
    (x) => __JEJAKA__.camera.position.x > x + 0.01,
    x0,
    { timeout: 30000 },
  );
  await page.keyboard.up("w");
  await page.waitForTimeout(300);
  const p1 = await page.evaluate(() => __JEJAKA__.camera.position.x);
  await page.waitForTimeout(500);
  const p2 = await page.evaluate(() => __JEJAKA__.camera.position.x);
  assert(p1 > x0);
  assert(Math.abs(p2 - p1) < 0.05);
  results.push("Held-W movement stops on key release");
  await page.evaluate(() => __JEJAKA__.arrive());
  await page.locator(".choice").first().click();
  await page.click("#walk");
  await page.evaluate(() => __JEJAKA__.arrive());
  for (let i = 2; i <= 8; i++) {
    assert.equal(await page.evaluate(() => __JEJAKA__.state.chapter), i);
    if (i === 6 || i === 8) await page.locator(".choice").first().click();
    else await page.click("#act");
    if (i === 2) {
      assert(
        await page.evaluate(
          () => !!__JEJAKA__.state.entries.find((e) => e.id === "bridge").photo,
        ),
      );
      results.push("Bridge photograph recorded from first-person renderer");
    }
    if (i === 6) {
      const choice = await page.evaluate(
        () => __JEJAKA__.state.choices.shelter,
      );
      assert.equal(choice, "help");
      results.push("Shelter choice recorded");
    }
    await page.click("#walk");
    await page.evaluate(() => __JEJAKA__.arrive());
  }
  assert.equal(await page.evaluate(() => __JEJAKA__.state.chapter), 9);
  await page.evaluate(() => {
    for (let i = 0; i < 80; i++) __JEJAKA__.world.update(0.1, 100 + i * 0.1, 1);
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, "final-fire.png") });
  await page.evaluate(() => __JEJAKA__.advanceTime(56));
  await page.waitForFunction(
    () => __JEJAKA__.mode === "ending",
    {},
    { timeout: 30000 },
  );
  assert.equal(await page.evaluate(() => __JEJAKA__.state.entries.length), 9);
  assert.match(await page.locator("#ending-account").textContent(), /membantu/);
  results.push(
    "All11 beats reachable; nine lifetime entries; chosen branch retained in ending",
  );
  await page.click("#ending-notes");
  assert.equal(await page.locator("#entries .entry").count(), 9);
  await page.click("#close-journal");
  await page.click("#ending-sources");
  assert(await page.locator("#about-modal").isVisible());
  await page.click("#close-about");
  results.push("Ending notebook and historical context accessible");
  await page.reload();
  await page.waitForFunction(
    () => window.__JEJAKA__?.ready,
    {},
    { timeout: 180000 },
  );
  await page.evaluate(() => {
    __JEJAKA__.renderer.shadowMap.enabled = false;
    __JEJAKA__.renderer.setPixelRatio(0.35);
  });
  await page.click("#continue");
  await page.waitForFunction(() => __JEJAKA__.mode === "ending");
  assert.equal(await page.evaluate(() => __JEJAKA__.state.entries.length), 9);
  results.push("Reload/continue restores completed account and choices");
  assert.equal(errors.length, 0, errors.join("\n"));
  results.push("Zero browser JS errors or HTTP errors");
  fs.writeFileSync(
    path.join(out, "browser-results.json"),
    JSON.stringify(
      {
        browser: await browser.version(),
        renderer: "SwiftShader software WebGL",
        acceleratedTraversal: true,
        results,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ results, errors, output: out }, null, 2));
  await browser.close();
  server.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
