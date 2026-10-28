/** Original environmental sound and foley. No archival recordings are simulated as evidence.
 * Three buses leave dialogue intelligible without flattening the environmental effects.
 * Audio begins only after start() in a user gesture.
 */
export class Soundscape {
  constructor() {
    this.ctx = null;
    this.volume = 0.65;
    this.phase = 0;
    this.seed = 194511;
    this.loops = [];
    this.layers = {};
    this.lastStep = -10;
    this.foot = false;
    this.paused = false;
    this.disposed = false;
    this.nextAmbient = 0;
    this.voiceCache = new Map();
    this.voiceSource = null;
    this.voiceSerial = 0;
    this.timer = null;
    this.transients = new Set();
    this.surface = "stone";
    this.location = { x: 0, z: 0, chapter: 0 };
    this.lastModulation = 0;
    this.lifecycleSerial = 0;
  }

  _random() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  async start() {
    if (this.disposed) return false;
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Context) return false;
    if (this.ctx) {
      await this.resume();
      return true;
    }
    this.ctx = new Context();
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.volume * 0.55;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 16;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.3;
    this.master.connect(compressor).connect(ctx.destination);
    this.ambience = ctx.createGain();
    this.effects = ctx.createGain();
    this.speech = ctx.createGain();
    this.ambience.connect(this.master);
    this.effects.connect(this.master);
    this.speech.connect(this.master);
    // A short, filtered outdoor reflection on major impacts, never on narration.
    this.reflection = ctx.createGain();
    this.reflection.gain.value = 0.08;
    const echo = ctx.createDelay(0.4);
    echo.delayTime.value = 0.105;
    const echoFilter = ctx.createBiquadFilter();
    echoFilter.type = "lowpass";
    echoFilter.frequency.value = 1150;
    this.reflection.connect(echo).connect(echoFilter).connect(this.effects);
    this.noise = this._noise(7.1, "brown");
    this.white = this._noise(3.7, "white");
    this.layers.river = this._layer(this.white, "lowpass", 920, -0.65, 0.048, 0.91);
    this.layers.riverDetail = this._layer(this.white, "bandpass", 1750, -0.4, 0.012, 0.67);
    this.layers.wind = this._layer(this.noise, "lowpass", 280, 0.25, 0.065, 0.83);
    this.layers.city = this._layer(this.white, "bandpass", 360, 0.5, 0.005, 0.71);
    this.layers.fire = this._layer(this.noise, "bandpass", 1250, -0.15, 0.0001, 1.12);
    this.layers.distance = this._layer(this.noise, "lowpass", 100, 0.55, 0.0001, 0.55);
    this.setPhase(this.phase);
    this.setLocation(this.location);
    this._startTimer();
    await ctx.resume();
    if (this.paused && ctx.state === "running") await ctx.suspend();
    return true;
  }

  _noise(seconds, type) {
    const buffer = this.ctx.createBuffer(
      1,
      Math.ceil(this.ctx.sampleRate * seconds),
      this.ctx.sampleRate,
    );
    const samples = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < samples.length; i++) {
      const white = this._random() * 2 - 1;
      brown = (brown + 0.02 * white) / 1.02;
      samples[i] = type === "brown" ? brown * 3.5 : white;
    }
    // A tiny edge envelope avoids loop clicks without a large silent seam.
    const edge = Math.min(180, samples.length / 2);
    for (let i = 0; i < edge; i++) {
      samples[i] *= i / edge;
      samples[samples.length - 1 - i] *= i / edge;
    }
    return buffer;
  }

  _layer(buffer, type, frequency, pan, volume, rate = 1) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.playbackRate.value = rate;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 0.4;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    src.connect(filter).connect(gain).connect(panner).connect(this.ambience);
    src.start(0, this._random() * Math.min(buffer.duration, 2));
    this.loops.push(src);
    return { src, filter, gain, panner };
  }

  setVolume(value) {
    if (!Number.isFinite(Number(value))) return;
    this.volume = Math.max(0, Math.min(1, Number(value)));
    if (this.ctx && this.master && this.ctx.state !== "closed") {
      this.master.gain.setTargetAtTime(
        this.volume * 0.55,
        this.ctx.currentTime,
        0.04,
      );
    }
  }

  setPhase(value) {
    if (!Number.isFinite(Number(value))) return;
    this.phase = Math.max(0, Math.min(1, Number(value)));
    if (!this.ctx || this.ctx.state === "closed" || !this.layers.fire) return;
    const t = this.ctx.currentTime;
    const danger = Math.max(0, (this.phase - 0.32) / 0.68);
    const fire = Math.max(0, (this.phase - 0.55) / 0.45);
    this.layers.river.gain.gain.setTargetAtTime(
      0.048 * (1 - danger * 0.55),
      t,
      2,
    );
    this.layers.riverDetail.gain.gain.setTargetAtTime(0.012 * (1 - danger * 0.7), t, 2);
    this.layers.wind.gain.gain.setTargetAtTime(0.065 + danger * 0.025, t, 2);
    this.layers.city.gain.gain.setTargetAtTime(0.005 * (1 - danger), t, 1.5);
    this.layers.fire.gain.gain.setTargetAtTime(fire * 0.115, t, 2);
    this.layers.distance.gain.gain.setTargetAtTime(danger * 0.025, t, 2);
    // Audio time stops while paused, so scheduled incidental events do not bunch up.
    this.nextAmbient = Math.min(this.nextAmbient, t + 2.5);
  }

  /** Authored local staging only: x/z are not GPS or a historical acoustic survey. */
  setLocation({ x = this.location.x, z = this.location.z, chapter = this.location.chapter } = {}) {
    this.location = {
      x: Number.isFinite(Number(x)) ? Number(x) : 0,
      z: Number.isFinite(Number(z)) ? Number(z) : 0,
      chapter: Number.isFinite(Number(chapter)) ? Number(chapter) : 0,
    };
    if (!this.ctx || !this.layers.river || this.ctx.state === "closed") return;
    const t = this.ctx.currentTime;
    const pan = this.location.x < -35 ? 0.55 : this.location.x > 35 ? -0.55 : -0.3;
    this.layers.river.panner.pan.setTargetAtTime(pan, t, 0.8);
    this.layers.riverDetail.panner.pan.setTargetAtTime(-pan * 0.55, t, 0.8);
  }

  setSurface(surface) {
    if (["stone", "wood", "earth"].includes(surface)) this.surface = surface;
  }

  _startTimer() {
    if (this.timer !== null || this.disposed) return;
    this.timer = setInterval(() => this._ambient(), 350);
  }

  _duck(speaking) {
    if (!this.ctx || !this.ambience || this.ctx.state === "closed") return;
    this.ambience.gain.setTargetAtTime(speaking ? 0.42 : 1, this.ctx.currentTime, speaking ? 0.1 : 0.65);
  }

  _track(node, cleanup) {
    this.transients.add(node);
    node.onended = () => {
      this.transients.delete(node);
      cleanup();
    };
  }

  _active() {
    return (
      this.ctx && this.ctx.state === "running" && !this.paused && !this.disposed
    );
  }

  _burst({
    duration = 0.2,
    volume = 0.15,
    frequency = 700,
    type = "lowpass",
    pan = 0,
    rate = 1,
    delay = 0,
    attack = 0.012,
    brown = false,
    reflected = false,
  } = {}) {
    if (!this._active()) return;
    const ctx = this.ctx,
      now = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = brown ? this.noise : this.white;
    src.playbackRate.value = rate;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(
      volume,
      now + Math.min(attack, duration * 0.35),
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    src.connect(filter).connect(gain).connect(panner).connect(this.effects);
    if (reflected) panner.connect(this.reflection);
    src.start(now, this._random() * 2);
    src.stop(now + duration + 0.02);
    this._track(src, () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
      panner.disconnect();
    });
  }

  _tone(
    frequency,
    duration,
    volume,
    pan = 0,
    endFrequency = frequency,
    delay = 0,
  ) {
    if (!this._active()) return;
    const ctx = this.ctx,
      t = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, t);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      t + duration,
    );
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(
      volume,
      t + Math.min(0.02, duration * 0.2),
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    oscillator.connect(gain).connect(panner).connect(this.effects);
    oscillator.start(t);
    oscillator.stop(t + duration + 0.01);
    this._track(oscillator, () => {
      oscillator.disconnect();
      gain.disconnect();
      panner.disconnect();
    });
  }

  step(speed = 1, surface = this.surface) {
    if (!this._active()) return;
    const now = this.ctx.currentTime;
    const fast = Math.max(0.4, Math.min(2.5, Number(speed) || 1));
    if (now - this.lastStep < 0.35 / Math.sqrt(fast)) return;
    this.lastStep = now;
    this.foot = !this.foot;
    const pan = this.foot ? -0.12 : 0.12;
    const variation = 0.87 + this._random() * 0.22;
    const material = ["wood", "earth"].includes(surface) ? surface : "stone";
    // Heel, sole, then a tiny scrape: separate transients instead of a repeated thud.
    this._burst({ duration: 0.075, volume: 0.105 * variation,
      frequency: material === "wood" ? 680 : material === "earth" ? 380 : 1250,
      type: material === "wood" ? "bandpass" : "lowpass", pan });
    this._tone(material === "wood" ? 152 : 108, 0.065, material === "earth" ? 0.018 : 0.043, pan, 52);
    this._burst({ duration: 0.12, volume: 0.022 * variation,
      frequency: material === "earth" ? 1100 : 2400, type: "bandpass", pan,
      attack: 0.023, delay: 0.045 });
    if (material === "wood") this._tone(265 + this._random() * 60, 0.075, 0.012, pan, 210, 0.025);
    if (this._random() > 0.55) this._burst({ duration: 0.15, volume: 0.006,
      frequency: 2200, type: "highpass", pan: -pan, attack: 0.03, delay: 0.065 });
  }

  cue(name) {
    if (!this._active()) return;
    switch (String(name).toLowerCase()) {
      case "intro":
        void this.voice("intro-id");
        break;
      case "write":
      case "pen":
        // Short dry strokes; keep the voice and reading cadence unobstructed.
        for (let i = 0; i < 4; i++) this._burst({ duration: 0.055 + this._random() * 0.04,
          volume: 0.022, frequency: 2300 + this._random() * 1100,
          type: "bandpass", pan: 0.12, delay: i * 0.105, attack: 0.005 });
        break;
      case "transition":
      case "cloth":
        this._burst({ duration: 0.22, volume: 0.023, frequency: 1350,
          type: "bandpass", pan: 0.1, attack: 0.065 });
        break;
      case "paper":
      case "page":
      case "notebook":
        this._burst({
          duration: 0.31,
          volume: 0.055,
          frequency: 1650,
          type: "bandpass",
          pan: 0.1,
        });
        this._burst({
          duration: 0.15,
          volume: 0.016,
          frequency: 3200,
          type: "bandpass",
          pan: 0.12,
          delay: 0.1,
        });
        break;
      case "camera":
      case "shutter":
      case "photo":
        this._burst({
          duration: 0.045,
          volume: 0.105,
          frequency: 2300,
          type: "bandpass",
        });
        this._tone(230, 0.045, 0.025, 0, 110);
        this._burst({
          duration: 0.055,
          volume: 0.045,
          frequency: 900,
          delay: 0.12,
        });
        break;
      case "impact":
      case "explosion":
      case "boom":
      case "blast":
        this._impact(0.45, 1);
        break;
      case "distant":
      case "distant-impact":
        this._impact(-0.55, 0.5);
        break;
      case "debris":
      case "collapse":
        this._impact(0.4, 0.8);
        for (let i = 0; i < 6; i++) {
          this._burst({
            duration: 0.2 + this._random() * 0.4,
            volume: 0.06,
            frequency: 650 + this._random() * 1900,
            pan: this._random() * 1.4 - 0.7,
            delay: 0.12 + i * 0.11,
          });
        }
        break;
      case "breath":
      case "injury":
      case "ending":
        this._burst({
          duration: 1.15,
          volume: 0.055,
          frequency: 850,
          type: "bandpass",
          pan: 0.08,
          rate: 0.8,
        });
        this._burst({
          duration: 0.85,
          volume: 0.045,
          frequency: 460,
          type: "bandpass",
          pan: -0.08,
          delay: 1.25,
          rate: 0.7,
        });
        break;
      case "heartbeat":
        this._tone(60, 0.17, 0.11, 0, 39);
        this._tone(56, 0.13, 0.075, 0, 35, 0.25);
        break;
      case "fire":
      case "crackle":
        this._burst({
          duration: 0.08,
          volume: 0.07,
          frequency: 1800,
          type: "bandpass",
          pan: this._random() * 1.5 - 0.75,
        });
        break;
      case "door":
      case "shutter-close":
        this._burst({
          duration: 0.8,
          volume: 0.09,
          frequency: 470,
          type: "bandpass",
          pan: -0.4,
          rate: 0.6,
        });
        this._tone(125, 0.15, 0.07, -0.4, 55, 0.55);
        break;
      default:
        break;
    }
  }

  stopVoice() {
    this.voiceSerial++;
    this._duck(false);
    if (this.voiceSource) {
      try {
        this.voiceSource.stop();
      } catch (_) {
        /* finished */
      }
      this.voiceSource = null;
    }
  }

  async voice(id) {
    if (!this._active()) return false;
    const allowed = new Set([
      "intro-id",
      "arrival",
      "sari",
      "bridge",
      "damar",
      "street",
      "impact",
      "shelter",
      "return",
      "wounded",
      "lastview",
      "afterword",
    ]);
    if (!allowed.has(id)) return false;
    const serial = ++this.voiceSerial;
    if (this.voiceSource) {
      try {
        this.voiceSource.stop();
      } catch (_) {
        /* finished */
      }
    }
    if (!this.voiceCache.has(id)) {
      const request = fetch(
        new URL(`./assets/audio/${id}.mp3`, import.meta.url),
      )
        .then((response) => {
          if (!response.ok) throw new Error("Narration unavailable");
          return response.arrayBuffer();
        })
        .then((bytes) => this.ctx.decodeAudioData(bytes));
      this.voiceCache.set(id, request);
    }
    try {
      const buffer = await this.voiceCache.get(id);
      // A legitimate request can finish decoding while the notebook suspends audio.
      // Schedule it in that suspended timeline; resume then starts it from the beginning.
      // Only an explicit stop/new request/disposal invalidates the pending line.
      if (this.disposed || !this.ctx || this.ctx.state === "closed" || serial !== this.voiceSerial)
        return false;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.value = 1.6;
      src.connect(gain).connect(this.speech);
      this._duck(true);
      this.voiceSource = src;
      src.start();
      src.onended = () => {
        src.disconnect();
        gain.disconnect();
        if (this.voiceSource === src) {
          this.voiceSource = null;
          this._duck(false);
        }
      };
      return true;
    } catch (_) {
      this.voiceCache.delete(id);
      return false;
    }
  }

  _impact(pan, strength) {
    this._tone(66, 1.2, 0.2 * strength, pan, 30);
    this._burst({
      duration: 0.48,
      volume: 0.2 * strength,
      frequency: 510,
      pan,
      reflected: true,
    });
    this._burst({
      duration: 2.3,
      volume: 0.1 * strength,
      frequency: 160,
      pan: -pan * 0.6,
      rate: 0.55,
      delay: 0.08,
      brown: true,
      reflected: true,
    });
    // A few late fragments make the direction and decay readable without a large boom.
    for (let i = 0; i < 3; i++) this._burst({ duration: 0.09 + i * 0.035,
      volume: 0.018 * strength, frequency: 1300 + this._random() * 1200,
      type: "bandpass", pan: -pan * 0.7, delay: 0.18 + i * 0.14 });
  }

  _ambient() {
    if (!this._active()) return;
    const t = this.ctx.currentTime;
    // Slowly changing filters prevent the ambient noise loops becoming a fixed drone.
    if (t > this.lastModulation + 2) {
      this.lastModulation = t;
      this.layers.wind.filter.frequency.setTargetAtTime(190 + this._random() * 160, t, 3.5);
      this.layers.river.filter.frequency.setTargetAtTime(650 + this._random() * 650, t, 2.8);
      this.layers.fire.filter.frequency.setTargetAtTime(800 + this._random() * 700, t, 2.5);
    }
    if (t < this.nextAmbient) return;
    this.nextAmbient = t + 3.2 + this._random() * 4.7;
    if (this.phase > 0.6) {
      this.cue("crackle");
      if (this.phase > 0.9 && this._random() > 0.6) this.cue("breath");
      else if (this._random() > 0.75) this._burst({ duration: 0.2, volume: 0.015,
        frequency: 2100, type: "bandpass", pan: this._random() * 1.4 - 0.7 });
    } else if (this.phase > 0.35 && this._random() > 0.55) {
      this._impact(this._random() * 1.5 - 0.75, 0.16);
    } else if (this.phase < 0.35) {
      if (this._random() < 0.45) {
        // A small water lap remains off to the river side, never fake crowd speech.
        this._burst({ duration: 0.8, volume: 0.015, frequency: 1500,
          type: "bandpass", pan: this.layers.river.panner.pan.value,
          attack: 0.2, rate: 0.7 });
      } else {
        const p = this._random() > 0.5 ? 0.7 : -0.7;
        this._tone(220 + this._random() * 80, 0.3, 0.005, p, 170);
        this._burst({ duration: 0.45, volume: 0.007, frequency: 620,
          type: "bandpass", pan: p, attack: 0.08 });
      }
    }
  }

  async pause() {
    this.lifecycleSerial++;
    this.paused = true;
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    if (this.ctx && this.ctx.state === "running") await this.ctx.suspend();
  }
  async resume() {
    if (!this.ctx || this.disposed || this.ctx.state === "closed") return;
    const serial = ++this.lifecycleSerial;
    this.paused = false;
    await this.ctx.resume();
    // A pause or disposal may have arrived while the browser resumed its device.
    if (this.disposed || serial !== this.lifecycleSerial || this.paused) {
      if (this.paused && this.ctx.state === "running") await this.ctx.suspend();
      return;
    }
    this._startTimer();
    this.lastStep = this.ctx.currentTime;
  }
  async dispose() {
    this.disposed = true;
    this.lifecycleSerial++;
    this.voiceSerial++;
    if (this.voiceSource) {
      try {
        this.voiceSource.stop();
      } catch (_) {
        /* finished */
      }
    }
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    for (const node of this.loops) {
      try {
        node.stop();
        node.disconnect();
      } catch (_) {
        /* already stopped */
      }
    }
    this.loops = [];
    this.voiceSource = null;
    for (const node of this.transients) {
      try { node.stop(); node.disconnect(); } catch (_) { /* ended */ }
    }
    this.transients.clear();
    this.layers = {};
    this.voiceCache.clear();
    if (this.ctx && this.ctx.state !== "closed") await this.ctx.close();
  }
}
