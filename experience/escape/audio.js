/** Original procedural sound, not archival audio or performed dialogue.
 * No river/water loop. Quiet beds, bounded transients and one final limiter.
 * Nothing starts until unlock() is called by a visitor's gesture.
 */
export function createAudio() {
  let ctx = null, master = null, limiter = null, ambienceBus = null, effectsBus = null;
  let volume = .6, muted = false, paused = false, disposed = false, seed = 481945;
  let white = null, brown = null, fireLayer = null, airLayer = null;
  let nextWar = 4, nextMarket = .8, nextCrackle = .2, footDistance = 0, lastPlayer = null;
  let footSide = -1, lastEventWall = -1000;
  const voices = new Set(), loops = [];
  const eventTimes = new Map();
  const stats = {
    unlocked: false, muted: false, paused: false, volume,
    activeVoices: 0, totalEvents: 0, totalSteps: 0, droppedEvents: 0,
    limiterReduction: 0, masterTarget: 0, airGain: 0, fireGain: 0,
    waterLayers: 0, status: 'locked', lastEvent: null,
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function safeParam(param, value, seconds = .05) {
    if (!ctx || !param) return;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(value, ctx.currentTime, Math.max(.006, seconds));
  }
  function mixTarget() {
    const gain = muted || paused || disposed ? 0 : volume * .62;
    if (master) safeParam(master.gain, gain, .035);
    stats.masterTarget = gain; stats.volume = volume; stats.muted = muted; stats.paused = paused;
  }
  function makeNoise(seconds, low = false) {
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
    const a = b.getChannelData(0); let smooth = 0;
    for (let i = 0; i < a.length; i++) {
      const n = rand() * 2 - 1; smooth = (smooth + .035 * n) / 1.035;
      a[i] = low ? smooth * 3.4 : n;
    }
    // Smooth both ends of continuously repeating beds, not every transient.
    const edge = Math.min(250, a.length / 2);
    for (let i = 0; i < edge; i++) { a[i] *= i / edge; a[a.length - 1 - i] *= i / edge; }
    return b;
  }
  function addLoop(buffer, frequency, gain, type = 'lowpass') {
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), level = ctx.createGain();
    source.buffer = buffer; source.loop = true; filter.type = type; filter.frequency.value = frequency;
    filter.Q.value = .4; level.gain.value = gain;
    source.connect(filter).connect(level).connect(ambienceBus); source.start();
    const item = { source, filter, level }; loops.push(item); return item;
  }
  async function unlock() {
    if (disposed) return false;
    try {
      if (!ctx) {
        const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Context) { stats.status = 'unavailable'; return false; }
        ctx = new Context({ latencyHint: 'interactive' });
        master = ctx.createGain(); master.gain.value = 0;
        limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -14; limiter.knee.value = 16; limiter.ratio.value = 8;
        limiter.attack.value = .003; limiter.release.value = .2;
        ambienceBus = ctx.createGain(); ambienceBus.gain.value = .72;
        effectsBus = ctx.createGain(); effectsBus.gain.value = .88;
        ambienceBus.connect(limiter); effectsBus.connect(limiter); limiter.connect(master).connect(ctx.destination);
        white = makeNoise(3.13); brown = makeNoise(5.39, true);
        airLayer = addLoop(brown, 210, .008);
        fireLayer = addLoop(brown, 820, 0, 'bandpass');
      }
      if (!paused && ctx.state !== 'running') await ctx.resume();
      if (paused && ctx.state === 'running') await ctx.suspend();
      stats.unlocked = ctx.state === 'running' || ctx.state === 'suspended';
      stats.status = ctx.state; mixTarget(); return stats.unlocked;
    } catch { stats.status = 'blocked'; return false; }
  }
  function spatial(x, z, player, maxDistance = 65) {
    if (!player || !Number.isFinite(x) || !Number.isFinite(z)) return { gain: 1, pan: 0 };
    const dx = x - player.x, dz = z - player.z, d = Math.hypot(dx, dz);
    // Floor keeps a distant explosion perceptible; never louder than a near one.
    const gain = clamp(1 / (1 + d * .045), .12, 1) * clamp(1 - d / (maxDistance * 3), .08, 1);
    const yaw = Number.isFinite(player.yaw) ? player.yaw : 0;
    const right = dx * Math.cos(yaw) - dz * Math.sin(yaw);
    return { gain, pan: clamp(right / Math.max(8, d), -.85, .85) };
  }
  function route(source, { gain = .1, pan = 0, frequency = 1000, type = 'lowpass', duration = .2, delay = 0, bus = effectsBus, attack = .004 } = {}) {
    if (!ctx || disposed || paused || muted || !bus || voices.size >= 40) { stats.droppedEvents++; return null; }
    const now = ctx.currentTime + Math.max(0, delay), filter = ctx.createBiquadFilter(), amp = ctx.createGain();
    filter.type = type; filter.frequency.value = frequency; filter.Q.value = .5;
    amp.gain.setValueAtTime(.00001, now); amp.gain.exponentialRampToValueAtTime(Math.max(.00002, gain), now + attack);
    amp.gain.exponentialRampToValueAtTime(.00001, now + Math.max(attack + .01, duration));
    source.connect(filter).connect(amp);
    let panNode = null;
    if (ctx.createStereoPanner) { panNode = ctx.createStereoPanner(); panNode.pan.value = pan; amp.connect(panNode).connect(bus); }
    else amp.connect(bus);
    const item = { source, filter, amp, panNode }; voices.add(item); stats.activeVoices = voices.size;
    source.onended = () => {
      voices.delete(item); stats.activeVoices = voices.size;
      try { source.disconnect(); filter.disconnect(); amp.disconnect(); panNode?.disconnect(); } catch {}
    };
    source.start(now); source.stop(now + duration + .03); return item;
  }
  function noiseHit(gain, frequency, duration, pan = 0, low = false, delay = 0, type = 'lowpass') {
    if (!ctx) return; const s = ctx.createBufferSource(); s.buffer = low ? brown : white;
    // Different offsets keep repeated debris/footsteps from sounding like a loop.
    s.loop = true; s.playbackRate.value = .82 + rand() * .36;
    return route(s, { gain, frequency, duration, pan, delay, type });
  }
  function tone(gain, start, end, duration, pan = 0, shape = 'sine', delay = 0) {
    if (!ctx) return; const s = ctx.createOscillator(); s.type = shape;
    s.frequency.setValueAtTime(start, ctx.currentTime + delay);
    s.frequency.exponentialRampToValueAtTime(Math.max(12, end), ctx.currentTime + delay + duration);
    return route(s, { gain, frequency: Math.max(300, start * 2.8), duration, pan, delay });
  }
  let listener = { x: 0, z: 12, yaw: 0 };
  function event(kind, options = {}) {
    if (!ctx || disposed || paused || muted || ctx.state !== 'running') return false;
    const now = ctx.currentTime;
    const cooldown = { blast: .32, impact: .32, collapse: .4, warning: .5, help: .18, success: .8, step: .12, footstep: .12, debris: .1, fire: .15 }[kind] ?? .16;
    if (now - (eventTimes.get(kind) ?? -100) < cooldown) { stats.droppedEvents++; return false; }
    eventTimes.set(kind, now);
    const s = spatial(options.x, options.z, listener), strength = clamp(options.strength ?? 1, .1, 1.35), g = s.gain * strength;
    if (kind === 'blast' || kind === 'impact' || kind === 'collapse') {
      // Front crack, body, then low reflection: direction and distance stay audible.
      noiseHit(.25 * g, 1850, .12, s.pan);
      noiseHit(.34 * g, 390, .92, s.pan, true, .035);
      tone(.2 * g, 90, 29, 1.25, s.pan, 'sine', .025);
      noiseHit(.055 * g, 650, 1.55, -s.pan * .45, true, .22);
      if (kind === 'collapse') for (let i = 0; i < 4; i++) noiseHit(.075 * g, 600 + rand() * 1300, .16 + rand() * .25, clamp(s.pan + (rand() - .5) * .4, -.9, .9), false, .18 + i * .13);
    } else if (kind === 'warning' || kind === 'whistle' || kind === 'incoming') {
      // Short rising whine, not a constant siren; visual captions remain primary.
      tone(.055 * g, 240, 690, .65, s.pan, 'triangle');
      noiseHit(.028 * g, 1700, .75, s.pan, false, 0, 'bandpass');
    } else if (kind === 'step' || kind === 'footstep') {
      footSide *= -1;
      const crouched = options.crouch || listener.stance === 'crouch';
      noiseHit((crouched ? .028 : .065) * strength, options.surface === 'wood' ? 520 : 1150, .095, footSide * .13, false);
      tone((crouched ? .012 : .026) * strength, options.surface === 'wood' ? 145 : 95, 62, .075, footSide * .12);
      stats.totalSteps++;
    } else if (kind === 'debris' || kind === 'help' || kind === 'wood') {
      noiseHit(.09 * g, 500 + rand() * 800, .2, s.pan);
      tone(.03 * g, 180, 90, .13, s.pan, 'triangle', .025);
    } else if (kind === 'success' || kind === 'freed') {
      // Physical release/wood settling rather than a game reward jingle.
      noiseHit(.085 * g, 650, .3, s.pan); tone(.025 * g, 240, 90, .22, s.pan);
    } else if (kind === 'bell') {
      tone(.026 * g, 930, 890, .65, s.pan); tone(.009 * g, 1860, 1790, .42, s.pan, 'sine', .025);
    } else if (kind === 'cough' || kind === 'breath') {
      noiseHit(.035 * g, 740, .19, s.pan, false, 0, 'bandpass');
    } else if (kind === 'rumble' || kind === 'distant') {
      noiseHit(.11 * g, 200, 1.4, s.pan, true); tone(.045 * g, 57, 27, 1.8, s.pan);
    } else if (kind === 'fire' || kind === 'crackle') {
      noiseHit(.035 * g, 1250 + rand() * 1300, .045 + rand() * .09, s.pan);
    } else return false;
    stats.totalEvents++; stats.lastEvent = { kind, time: now, x: options.x ?? null, z: options.z ?? null, strength, attenuation: s.gain, pan: s.pan };
    lastEventWall = now; return true;
  }
  function update(dt, time, state = {}, player = {}) {
    listener = { ...player };
    stats.activeVoices = voices.size; stats.limiterReduction = limiter?.reduction || 0; stats.status = ctx?.state || (disposed ? 'closed' : 'locked');
    if (!ctx || disposed || paused || muted || ctx.state !== 'running') { lastPlayer = { x: player.x, z: player.z }; return; }
    const war = clamp(Number(state.war) || 0, 0, 1), phase = Number(state.phase) || 0;
    const captioned = Boolean(state.dialogue || state.caption || state.speaking);
    const duck = captioned ? .65 : 1;
    safeParam(ambienceBus.gain, .72 * duck, .15);
    safeParam(airLayer.level.gain, .008 + war * .004, .7);
    const sites = [[0, -46], [19, -105], [-3, -147]];
    let nearFire = 0, nearest = sites[0], distance = Infinity;
    if (war > .1) for (const site of sites) { const d = Math.hypot((player.x || 0) - site[0], (player.z || 0) - site[1]); if (d < distance) { distance = d; nearest = site; } nearFire = Math.max(nearFire, clamp(1 - d / 28, 0, 1)); }
    const fireGain = .018 * nearFire * war * duck;
    safeParam(fireLayer.level.gain, fireGain, .4); stats.fireGain = fireGain; stats.airGain = .008 + war * .004;
    // Locomotion sound follows actual displacement, never a held key in a wall.
    if (lastPlayer && Number.isFinite(player.x) && Number.isFinite(player.z)) {
      const moved = Math.hypot(player.x - lastPlayer.x, player.z - lastPlayer.z);
      if (moved < 2) footDistance += moved; else footDistance = 0;
      const stride = player.stance === 'crouch' ? .85 : player.running || player.stance === 'run' ? 1.55 : 1.35;
      if (footDistance >= stride) { footDistance %= stride; event('footstep', { strength: player.running ? 1.12 : .85, crouch: player.stance === 'crouch', surface: player.z < -175 && player.z > -195 ? 'wood' : 'stone' }); }
    }
    lastPlayer = { x: player.x, z: player.z };
    const step = clamp(Number(dt) || 0, 0, .2);
    nextWar -= step; nextMarket -= step; nextCrackle -= step;
    if (war > .2 && phase < 7 && nextWar <= 0) {
      nextWar = 6 + rand() * 6;
      const farX = (rand() - .5) * 90, farZ = (player.z || 0) - 45 - rand() * 45;
      event('distant', { x: farX, z: farZ, strength: .45 + war * .3 });
    }
    if (war < .45 && phase < 3 && nextMarket <= 0) {
      nextMarket = 1.1 + rand() * 2.8;
      event(rand() > .86 ? 'bell' : 'wood', { x: (rand() - .5) * 17, z: -6 - rand() * 24, strength: .22 });
    }
    if (nearFire > .1 && nextCrackle <= 0) { nextCrackle = .16 + rand() * .32; event('crackle', { x: nearest[0], z: nearest[1], strength: nearFire * .65 }); }
  }
  function setVolume(v) { volume = clamp(Number(v) || 0, 0, 1); mixTarget(); }
  function setMuted(v) { muted = Boolean(v); mixTarget(); }
  function setPaused(v) {
    paused = Boolean(v); stats.paused = paused; mixTarget(); lastPlayer = null; footDistance = 0;
    if (ctx && !disposed) { const promise = paused ? ctx.suspend() : ctx.resume(); promise?.catch?.(() => { stats.status = 'blocked'; }); }
  }
  function dispose() {
    if (disposed) return; disposed = true; mixTarget();
    for (const { source } of [...voices]) try { source.stop(); } catch {}
    for (const { source } of loops) try { source.stop(); } catch {}
    voices.clear(); loops.length = 0; stats.activeVoices = 0; stats.status = 'closed';
    if (ctx) ctx.close().catch(() => {});
  }
  return { unlock, update, event, setVolume, setMuted, setPaused, dispose, stats };
}
