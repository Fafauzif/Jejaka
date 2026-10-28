/** Actual Web Audio regression. No 3D/GPU or human listening claim is implied. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const assert = require("assert/strict");
const root = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(path.join(require("os").tmpdir(), "jejaka-audio-test-"));
const errors = [];
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!doctype html><html><body><button id="go">Start</button>
      <script type="module">
        import { Soundscape } from "./audio.js";
        window.sound = new Soundscape();
        document.getElementById("go").onclick = async () => {
          window.started = await sound.start();
        };
      </script></body></html>`);
    return;
  }
  if (req.url === "/favicon.ico") { res.writeHead(204); res.end(); return; }
  try {
    const file = path.resolve(root, "." + decodeURIComponent(req.url.split("?")[0]));
    if (!file.startsWith(root + path.sep)) throw new Error("Outside test root");
    res.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" :
      file.endsWith(".mp3") ? "audio/mpeg" : "application/octet-stream");
    res.end(fs.readFileSync(file));
  } catch (_) { res.writeHead(404); res.end(); }
});

(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE || chromium.executablePath(),
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", e => errors.push(e.message));
    page.on("response", r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => window.sound);
    assert.equal(await page.evaluate(() => sound.ctx), null);
    await page.click("#go");
    await page.waitForFunction(() => window.started === true);
    const result = { browser: browser.version(), checks: [] };
    result.initial = await page.evaluate(() => ({
      state: sound.ctx.state, loops: sound.loops.length, timer: sound.timer !== null,
      buses: !!sound.ambience && !!sound.effects && !!sound.speech,
    }));
    assert.equal(result.initial.state, "running");
    assert.equal(result.initial.loops, 6);
    assert(result.initial.buses);
    result.checks.push("No AudioContext before start; gesture starts six layers and three buses");

    result.voice = await page.evaluate(async () => {
      const invalid = await sound.voice("unknown");
      const valid = await sound.voice("arrival");
      await new Promise(resolve => setTimeout(resolve, 350));
      return { invalid, valid, playing: !!sound.voiceSource,
        duck: sound.ambience.gain.value,
        duration: (await sound.voiceCache.get("arrival")).duration };
    });
    assert.equal(result.voice.invalid, false);
    assert(result.voice.valid && result.voice.playing);
    assert(result.voice.duck < 0.55);
    assert(result.voice.duration > 6);
    await page.evaluate(() => sound.stopVoice());
    await page.waitForTimeout(1800);
    result.duckRecovered = await page.evaluate(() => sound.ambience.gain.value);
    assert(result.duckRecovered > 0.9);
    result.checks.push("Packaged arrival narration decodes/plays; ambience ducks and recovers");


    // Hold network delivery until after pause. The decoded line must remain scheduled
    // in suspended audio time, while explicit cancellation must still invalidate it.
    async function delayedNarration(id, whilePending) {
      let release;
      const blocked = new Promise(resolve => { release = resolve; });
      const pattern = `**/assets/audio/${id}.mp3`;
      const handler = async route => { await blocked; await route.continue(); };
      await page.route(pattern, handler);
      try {
        const requested = page.waitForRequest(request => request.url().endsWith(`/audio/${id}.mp3`));
        await page.evaluate(id => {
          sound.voiceCache.delete(id);
          window.pendingNarration = sound.voice(id);
        }, id);
        await requested;
        await whilePending();
        release();
        return await page.evaluate(async () => ({
          accepted: await window.pendingNarration,
          source: !!sound.voiceSource, state: sound.ctx.state,
        }));
      } finally {
        release();
        await page.unroute(pattern, handler);
      }
    }
    result.pendingPause = await delayedNarration("sari", () => page.evaluate(() => sound.pause()));
    assert.equal(result.pendingPause.accepted, true);
    assert(result.pendingPause.source);
    assert.equal(result.pendingPause.state, "suspended");
    result.pendingResume = await page.evaluate(async () => {
      const before = sound.ctx.currentTime;
      const analyser = sound.ctx.createAnalyser();
      analyser.fftSize = 2048;
      sound.speech.connect(analyser);
      await sound.resume();
      let peak = 0;
      for (let sample = 0; sample < 8; sample++) {
        await new Promise(resolve => setTimeout(resolve, 60));
        const data = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(data);
        for (const value of data) peak = Math.max(peak, Math.abs(value));
      }
      sound.speech.disconnect(analyser);
      analyser.disconnect();
      return { source: !!sound.voiceSource, state: sound.ctx.state,
        progressed: sound.ctx.currentTime > before + 0.05, speechPeak: peak };
    });
    assert(result.pendingResume.source && result.pendingResume.progressed);
    assert(result.pendingResume.speechPeak > 0.001);
    assert.equal(result.pendingResume.state, "running");
    await page.evaluate(() => sound.stopVoice());
    result.pendingCancel = await delayedNarration("bridge", () => page.evaluate(async () => {
      await sound.pause(); sound.stopVoice();
    }));
    assert.equal(result.pendingCancel.accepted, false);
    assert.equal(result.pendingCancel.source, false);
    await page.evaluate(() => sound.resume());
    result.checks.push("Delayed narration survives pause/decode and resumes; explicit stop cancels it");

    result.pause = await page.evaluate(async () => {
      await sound.pause();
      const t = sound.ctx.currentTime, count = sound.transients.size;
      await new Promise(resolve => setTimeout(resolve, 400));
      sound.cue("debris");
      return { state: sound.ctx.state, timer: sound.timer,
        timeStopped: Math.abs(sound.ctx.currentTime - t) < 0.01,
        unchanged: sound.transients.size === count };
    });
    assert.equal(result.pause.state, "suspended");
    assert.equal(result.pause.timer, null);
    assert(result.pause.timeStopped && result.pause.unchanged);
    // Simultaneous UI changes must leave the latest pause authoritative.
    result.race = await page.evaluate(async () => {
      await Promise.all([sound.resume(), sound.pause()]);
      return { state: sound.ctx.state, timer: sound.timer, paused: sound.paused };
    });
    assert.equal(result.race.state, "suspended");
    assert.equal(result.race.timer, null);
    assert(result.race.paused);
    await page.evaluate(async () => {
      await Promise.all([sound.resume(), sound.resume()]);
      sound.setVolume(-2); sound.setVolume(2);
      sound.setPhase(1);
      sound.setLocation({ x: 120, z: 28, chapter: 6 });
      sound.setSurface("wood");
    });
    result.resume = await page.evaluate(() => ({
      state: sound.ctx.state, timer: sound.timer !== null,
      volume: sound.volume, phase: sound.phase,
    }));
    assert.equal(result.resume.volume, 1);
    assert(result.resume.timer);
    result.checks.push("Pause stops audio time/scheduling; resume races respect latest intent");

    result.signal = await page.evaluate(async () => {
      sound.setVolume(0.65);
      sound.nextAmbient = sound.ctx.currentTime + 30;
      const analyser = sound.ctx.createAnalyser();
      analyser.fftSize = 2048;
      sound.master.connect(analyser);
      let peak = 0, sum = 0, count = 0;
      for (const surface of ["stone", "wood", "earth"]) {
        sound.lastStep = -10;
        sound.step(1.3, surface);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      for (const cue of ["impact", "debris", "camera", "transition", "write"]) sound.cue(cue);
      for (let k = 0; k < 40; k++) {
        const data = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(data);
        for (const sample of data) {
          peak = Math.max(peak, Math.abs(sample)); sum += sample * sample; count++;
        }
        await new Promise(resolve => setTimeout(resolve, 75));
      }
      sound.master.disconnect(analyser);
      analyser.disconnect();
      return { peak, rms: Math.sqrt(sum / count), transients: sound.transients.size,
        riverPan: sound.layers.river.panner.pan.value };
    });
    assert(result.signal.peak > 0.001 && result.signal.peak < 1);
    assert.equal(result.signal.transients, 0);
    assert(result.signal.riverPan < 0);
    result.checks.push("Three surface footsteps and layered cues yield bounded nonzero signal; sources expire");

    result.pendingDispose = await delayedNarration("street", async () => {
      result.dispose = await page.evaluate(async () => {
        sound.cue("debris");
        const activeBefore = sound.transients.size;
        await sound.dispose();
        return { activeBefore, state: sound.ctx.state, loops: sound.loops.length,
          transients: sound.transients.size, timer: sound.timer,
          voice: sound.voiceSource, startAgain: await sound.start() };
      });
    });
    assert.equal(result.pendingDispose.accepted, false);
    assert.equal(result.pendingDispose.source, false);
    assert(result.dispose.activeBefore > 0);
    assert.equal(result.dispose.state, "closed");
    assert.equal(result.dispose.transients, 0);
    assert.equal(result.dispose.loops, 0);
    assert.equal(result.dispose.timer, null);
    assert.equal(result.dispose.startAgain, false);
    assert.deepEqual(errors, []);
    result.checks.push("Disposal cancels pending narration, stops sources/timer and closes context; no HTTP/JS errors");
    result.errors = errors;
    fs.writeFileSync(path.join(output, "audio-results.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ ...result, output }, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
