/** Original procedural score and foley. Audio begins only after start() in a user gesture. */
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
    this.noise = this._noise(7.1, "brown");
    this.white = this._noise(3.7, "white");
    this.layers.river = this._layer(
      this.white,
      "lowpass",
      780,
      -0.65,
      0.055,
      0.91,
    );
    this.layers.wind = this._layer(
      this.noise,
      "lowpass",
      360,
      0.25,
      0.15,
      0.83,
    );
    this.layers.city = this._layer(
      this.white,
      "bandpass",
      240,
      0.5,
      0.012,
      0.71,
    );
    this.layers.fire = this._layer(
      this.noise,
      "bandpass",
      1100,
      -0.15,
      0.0001,
      1.12,
    );
    this.layers.distance = this._layer(
      this.noise,
      "lowpass",
      115,
      0.55,
      0.0001,
      0.55,
    );
    this.setPhase(this.phase);
    this.timer = setInterval(() => this._ambient(), 400);
    await ctx.resume();
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
    src.connect(filter).connect(gain).connect(panner).connect(this.master);
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
      0.055 * (1 - danger * 0.55),
      t,
      2,
    );
    this.layers.wind.gain.gain.setTargetAtTime(0.13 + danger * 0.05, t, 2);
    this.layers.city.gain.gain.setTargetAtTime(0.012 * (1 - danger), t, 1.5);
    this.layers.fire.gain.gain.setTargetAtTime(fire * 0.17, t, 2);
    this.layers.distance.gain.gain.setTargetAtTime(danger * 0.12, t, 2);
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
  } = {}) {
    if (!this._active()) return;
    const ctx = this.ctx,
      now = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.white;
    src.playbackRate.value = rate;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(
      volume,
      now + Math.min(0.015, duration * 0.15),
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    src.connect(filter).connect(gain).connect(panner).connect(this.master);
    src.start(now, this._random() * 2);
    src.stop(now + duration + 0.02);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
      panner.disconnect();
    };
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
    oscillator.connect(gain).connect(panner).connect(this.master);
    oscillator.start(t);
    oscillator.stop(t + duration + 0.01);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      panner.disconnect();
    };
  }

  step(speed = 1) {
    if (!this._active()) return;
    const now = this.ctx.currentTime;
    const fast = Math.max(0.4, Math.min(2.5, Number(speed) || 1));
    if (now - this.lastStep < 0.42 / fast) return;
    this.lastStep = now;
    this.foot = !this.foot;
    const pan = this.foot ? -0.13 : 0.13;
    this._burst({
      duration: 0.12,
      volume: 0.09,
      frequency: 430 + this._random() * 180,
      pan,
    });
    this._tone(90 + this._random() * 15, 0.085, 0.07, pan, 48);
    this._burst({
      duration: 0.13,
      volume: 0.023,
      frequency: 1800,
      type: "bandpass",
      pan,
      delay: 0.025,
    });
  }

  cue(name) {
    if (!this._active()) return;
    switch (String(name).toLowerCase()) {
      case "intro":
        void this.voice("intro-id");
        break;
      case "paper":
      case "page":
      case "notebook":
      case "write":
      case "pen":
        this._burst({
          duration: 0.31,
          volume: 0.12,
          frequency: 1650,
          type: "bandpass",
          pan: 0.1,
        });
        this._burst({
          duration: 0.15,
          volume: 0.035,
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
          volume: 0.16,
          frequency: 1700,
          type: "bandpass",
        });
        this._tone(230, 0.045, 0.05, 0, 110);
        this._burst({
          duration: 0.055,
          volume: 0.07,
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
      if (!this._active() || serial !== this.voiceSerial) return false;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.value = 1.6;
      src.connect(gain).connect(this.master);
      this.voiceSource = src;
      src.start();
      src.onended = () => {
        src.disconnect();
        gain.disconnect();
        if (this.voiceSource === src) this.voiceSource = null;
      };
      return true;
    } catch (_) {
      this.voiceCache.delete(id);
      return false;
    }
  }

  _impact(pan, strength) {
    this._tone(66, 1.55, 0.3 * strength, pan, 26);
    this._burst({
      duration: 0.48,
      volume: 0.24 * strength,
      frequency: 390,
      pan,
    });
    this._burst({
      duration: 2.3,
      volume: 0.13 * strength,
      frequency: 160,
      pan: -pan * 0.6,
      rate: 0.55,
      delay: 0.08,
    });
  }

  _ambient() {
    if (!this._active()) return;
    const t = this.ctx.currentTime;
    if (t < this.nextAmbient) return;
    this.nextAmbient = t + 2.8 + this._random() * 5;
    if (this.phase > 0.6) {
      this.cue("crackle");
      if (this.phase > 0.9) this.cue("breath");
    } else if (this.phase > 0.35 && this._random() > 0.55) {
      this._impact(this._random() * 1.5 - 0.75, 0.18);
    } else if (this.phase < 0.35) {
      // A distant wooden cart: brief resonant creak, never simulated speech.
      const p = this._random() > 0.5 ? 0.7 : -0.7;
      this._tone(310, 0.38, 0.012, p, 260);
      this._burst({
        duration: 0.5,
        volume: 0.009,
        frequency: 620,
        type: "bandpass",
        pan: p,
      });
    }
  }

  async pause() {
    this.paused = true;
    if (this.ctx && this.ctx.state === "running") await this.ctx.suspend();
  }
  async resume() {
    if (!this.ctx || this.disposed || this.ctx.state === "closed") return;
    this.paused = false;
    await this.ctx.resume();
    this.lastStep = this.ctx.currentTime;
  }
  async dispose() {
    this.disposed = true;
    this.voiceSerial++;
    if (this.voiceSource) {
      try {
        this.voiceSource.stop();
      } catch (_) {
        /* finished */
      }
    }
    if (this.timer) clearInterval(this.timer);
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
    if (this.ctx && this.ctx.state !== "closed") await this.ctx.close();
  }
}
