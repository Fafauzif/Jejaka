import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../lib/three.module.js';
import { createActors } from './actors.js';
import { createWorld } from './world.js';
import { collides, createPlayer, createRun } from './rules.js';

// Geometry and navigation regressions from the failed E2 refuge journey.
// This Node fixture does not load GLBs, render frames or benchmark physics.
const originalDocument = globalThis.document;
globalThis.document = {
  createElement(name) {
    assert.equal(name, 'canvas');
    const canvas = { width: 0, height: 0 };
    const gradient = { addColorStop() {} };
    const context = new Proxy({
      canvas,
      measureText() { return { width: 120 }; },
      createLinearGradient() { return gradient; },
      createRadialGradient() { return gradient; },
    }, {
      get(target, key) { return key in target ? target[key] : () => {}; },
    });
    canvas.getContext = () => context;
    return canvas;
  },
};
after(() => {
  if (originalDocument === undefined) delete globalThis.document;
  else globalThis.document = originalDocument;
});

function restoreLateFamily(t, sari) {
  const scene = new THREE.Scene();
  const world = createWorld(THREE, scene, { quality: 'high' });
  const actors = createActors(THREE, scene, { quality: 'high' });
  t.after(() => { actors.dispose(); world.dispose(); });

  const state = Object.assign(createRun(), {
    phase: 6,
    time: 166.3823,
    phaseTime: 40,
    learned: true,
    helped: true,
    helpedAt: 59.7998,
    helpProgress: 1,
    bridgeHelped: true,
    bridgeProgress: 1,
    alleySealed: true,
    alleySealedAt: 40,
    plazaCutoff: true,
    plazaCutoffAt: 85,
    war: 1,
    companionTarget: { x: -20, z: -226.5 },
    colliders: world.colliders,
  });
  const player = Object.assign(createPlayer(), {
    x: -19.996038714812848,
    z: -225.52573370685414,
    yaw: 0.023642354002021956,
  });
  const snapshot = {
    version: 1,
    phase: 6,
    heroes: {
      sari: { ...sari, gait: 0 },
      adi: {
        x: -19.551492822988383, z: -227.97417218210188,
        yaw: -0.17960649521771035, routeIndex: 12, gait: 0,
      },
      wiryo: {
        x: -24.493246886994793, z: -225.93299185614165,
        yaw: 3.2420340002178216, routeIndex: 10, gait: 0,
      },
    },
  };
  state.groupPositions = [player, snapshot.heroes.sari, snapshot.heroes.adi];
  world.update(0, state.time, state, player);
  const restored = actors.restore(snapshot, state, player);
  assert(restored.restored.includes('sari'), 'The captured position must restore, not use a fallback.');
  assert.equal(actors.heroes.sari.x, sari.x);
  assert.equal(actors.heroes.sari.z, sari.z);
  return { actors, world, state, player };
}

function followRemainingRoute({ actors, world, state, player }) {
  const sari = actors.heroes.sari;
  const visited = [sari.routeIndex];
  const river = world.colliders.filter(collider => collider.tag === 'river');
  const step = 0.05;
  for (let frame = 0; frame < 30 / step; frame++) {
    state.time += step;
    state.phaseTime += step;
    state.groupPositions = [player, actors.heroes.sari, actors.heroes.adi];
    world.update(step, state.time, state, player);
    actors.update(step, state.time, state, player);
    if (visited.at(-1) !== sari.routeIndex) visited.push(sari.routeIndex);
    assert(!collides(sari.x, sari.z, river, 0.24), 'Sari must use the bridge, not the river.');
    assert(!collides(sari.x, sari.z, world.colliders, 0.24), 'Sari must remain outside solid geometry.');
    if (sari.mode === 'rest' && sari.routeIndex === 12
      && Math.hypot(sari.x + 20.6, sari.z + 228.5) < 0.6) return visited;
  }
  assert.fail(`Sari did not reach refuge within 30 native seconds: ${JSON.stringify({
    x: sari.x, z: sari.z, routeIndex: sari.routeIndex, mode: sari.mode,
  })}`);
}

test('a late plaza companion follows the west bridge route when the player is already at school', t => {
  const run = restoreLateFamily(t, {
    x: -1.4483060750619607,
    z: -125.95992026736332,
    yaw: 1.613337324579677,
    routeIndex: 8,
  });
  assert.equal(run.actors.heroes.sari.routeIndex, 8);
  assert.deepEqual(followRemainingRoute(run), [8, 9, 10, 11, 12]);
});

test('an old bank-edge snapshot keeps its position and recovers through the bridge approach', t => {
  const run = restoreLateFamily(t, {
    x: -15.532661642780873,
    z: -176.75441624703646,
    yaw: 3.23828914937123,
    routeIndex: 8,
  });
  assert.equal(run.actors.heroes.sari.routeIndex, 10);
  assert.deepEqual(followRemainingRoute(run), [10, 11, 12]);
});

// Additional regressions from the actual G side-cart/backtracking failure.
// Uses the authored world solids; GLBs/rendering remain outside this Node suite.
function restoreBridgeEntry(t, heroKey, raw, { cleared = true, snapshot = null, time = 96.366 } = {}) {
  const scene = new THREE.Scene();
  const world = createWorld(THREE, scene, { quality: 'balanced' });
  const actors = createActors(THREE, scene, { quality: 'balanced' });
  t.after(() => { actors.dispose(); world.dispose(); });
  const state = Object.assign(createRun(), {
    phase: 6, time, phaseTime: 20, learned: true, helped: true,
    helpedAt: 45, helpProgress: 1, bridgeHelped: cleared,
    bridgeProgress: cleared ? 1 : 0, alleySealed: true,
    alleySealedAt: 30, plazaCutoff: true, plazaCutoffAt: 55,
    war: 1, companionTarget: { x: -20, z: -226.5 }, colliders: world.colliders,
  });
  const player = Object.assign(createPlayer(), { x: -20, z: -225.5, yaw: 0 });
  const data = snapshot || { version: 1, phase: 6, heroes: {
    sari: { x: -20.6, z: -228.5, yaw: 0, routeIndex: 12, gait: 0 },
    adi: { x: -19.5, z: -228.3, yaw: 0, routeIndex: 12, gait: 0 },
    wiryo: { x: cleared ? -24.5 : -23.2, z: cleared ? -226 : -181.5, yaw: 0, routeIndex: 10, gait: 0 },
    [heroKey]: { ...raw, yaw: raw.yaw || 0, gait: raw.gait || 0 },
  } };
  state.groupPositions = [player, data.heroes.sari, data.heroes.adi];
  world.update(0, time, state, player);
  const restored = actors.restore(data, state, player);
  assert(restored.restored.includes(heroKey), 'The legal captured root must restore without a fallback.');
  const hero = actors.heroes[heroKey];
  assert.equal(hero.x, raw.x); assert.equal(hero.z, raw.z);
  return { actors, world, state, player, hero, heroKey, visited: [hero.routeIndex] };
}
function stepBridgeEntry(run, dt) {
  const { actors, world, state, player, hero, visited } = run;
  const before = { x: hero.x, z: hero.z };
  state.time += dt; state.phaseTime += dt;
  state.groupPositions = [player, actors.heroes.sari, actors.heroes.adi];
  world.update(dt, state.time, state, player);
  actors.update(dt, state.time, state, player);
  const distance = Math.hypot(hero.x - before.x, hero.z - before.z);
  assert(distance <= dt * 16 + .001, 'Recovery must be continuous walking, not a position reset.');
  const samples = Math.max(1, Math.ceil(distance / .025));
  for (let j = 1; j <= samples; j++) {
    const x = before.x + (hero.x - before.x) * j / samples;
    const z = before.z + (hero.z - before.z) * j / samples;
    assert(!collides(x, z, world.colliders, .24), 'The complete walked segment must remain outside river, rails and solids.');
  }
  if (visited.at(-1) !== hero.routeIndex) visited.push(hero.routeIndex);
}
function finishBridgeEntry(run, dt = .05) {
  const target = run.heroKey === 'sari' ? { x: -20.6, z: -228.5 } : { x: -19.5, z: -228.3 };
  for (let elapsed = 0; elapsed < 30; elapsed += dt) {
    stepBridgeEntry(run, dt);
    if (run.hero.mode === 'rest' && run.hero.routeIndex === 12 && Math.hypot(run.hero.x - target.x, run.hero.z - target.z) < .6) return;
  }
  assert.fail(`Companion remained trapped: ${JSON.stringify({ x: run.hero.x, z: run.hero.z, routeIndex: run.hero.routeIndex, mode: run.hero.mode })}`);
}

test('either bridge-rail corner recovers physically and Continue preserves the exact recovery root', t => {
  for (const sample of [
    { key: 'sari', x: -24.465759629, z: -176.759376896, cleared: true, dt: .05 },
    { key: 'adi', x: -15.534, z: -176.759376896, cleared: false, dt: .1 },
  ]) {
    const run = restoreBridgeEntry(t, sample.key, { x: sample.x, z: sample.z, routeIndex: 11 }, { cleared: sample.cleared });
    for (let elapsed = 0; elapsed < 3 && run.hero.z < sample.z + .6; elapsed += sample.dt) stepBridgeEntry(run, sample.dt);
    assert(run.hero.z > sample.z + .6 && run.hero.z < -173.5, 'The first recovery leg must walk back along the exterior before aligning.');
    assert.equal(run.hero.routeIndex, 10);
    const snapshot = run.actors.snapshot(), saved = snapshot.heroes[sample.key];
    const continued = restoreBridgeEntry(t, sample.key, saved, { cleared: sample.cleared, snapshot, time: run.state.time });
    assert.equal(continued.hero.x, saved.x); assert.equal(continued.hero.z, saved.z);
    finishBridgeEntry(continued, sample.dt);
    assert.deepEqual(continued.visited, [10, 11, 12]);
  }
});

test('a player backtracking beside the bridge mouth cannot shove a companion outside its entry', t => {
  const run = restoreBridgeEntry(t, 'sari', { x: -24.1455, z: -171.9816, routeIndex: 11 });
  run.player.x = -23.3008; run.player.z = -171.6432;
  for (let elapsed = 0; elapsed < 10; elapsed += .05) stepBridgeEntry(run, .05);
  assert(run.hero.z < -177.5, 'Sari must enter the bridge even while the player remains beside the mouth.');
  assert.notEqual(run.hero.mode, 'rest', 'Waiting for the player on a bridge is not sitting at the school.');
  assert.deepEqual(run.visited, [11, 10, 11]);
  run.player.x = -20; run.player.z = -225.5;
  finishBridgeEntry(run);
});

test('pausing beside a companion freezes the post-walk personal-space adjustment too', t => {
  const run = restoreBridgeEntry(t, 'sari', { x: -1.4483060750619607, z: -125.95992026736332, routeIndex: 8 });
  run.player.x = -1; run.player.z = -125.9; run.state.paused = true;
  const fields = p => ({ x: p.x, z: p.z, gait: p.gait, distance: p.distance, speed: p.speed, routeIndex: p.routeIndex });
  const before = fields(run.hero);
  for (let frame = 0; frame < 20; frame++) run.actors.update(.05, run.state.time, run.state, run.player);
  assert.deepEqual(fields(run.hero), before);
});
