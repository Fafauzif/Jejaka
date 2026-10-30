import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceHelp, resolveDanger, createPlayer, stepPlayer, createSession, interact, updateSession, getObjective, saveSession, loadSession, isCovered, TARGETS } from './simulation.js';
const tick = (p, input, seconds, boxes = []) => { for (let t = 0; t < seconds; t += 1 / 60) stepPlayer(p, input, 1 / 60, boxes); };
const until = (s, seconds, p) => { for (let t = 0; t < seconds; t += .05) updateSession(s, .05, p); };
const play = (first = 'testimony', second = 'help', last = 'notebook') => {
  const s = createSession();
  for (const [id, choice] of [['sari', first], ['photo'], ['damar'], ['parcel']]) assert.equal(interact(s, id, choice).ok, true);
  resolveDanger(s, true); for(let i=0;i<81;i++) advanceHelp(s,second,.05,true,true);
  assert.equal(interact(s,'handoff',last).ok,true);
  return s;
};
test('movement starts on first update and brakes predictably', () => {
  const p = createPlayer(); stepPlayer(p, { forward: 1 }, 1 / 60); assert.ok(p.z < 24);
  tick(p, { forward: 1 }, 1); assert.ok(p.vz < -2.5);
  tick(p, {}, .5); assert.ok(Math.abs(p.vz) < .005);
});
test('diagonal movement is normalized and yaw matches Three.js', () => {
  const a = createPlayer(), b = createPlayer();
  tick(a, { forward: 1 }, 2); tick(b, { forward: 1, right: 1 }, 2);
  assert.ok(Math.abs(a.distance - b.distance) < .01);
  const c = createPlayer(); tick(c, { forward: 1, yaw: Math.PI / 2 }, 1); assert.ok(c.x < -2 && Math.abs(c.z - 24) < 1e-8);
});
test('circle collision blocks walls while preserving tangential slide', () => {
  const p = createPlayer({ x: 0, z: 2 });
  tick(p, { forward: 1, right: 1 }, 3, [{ minX: -8, maxX: 8, minZ: -1, maxZ: 0 }]);
  assert.ok(p.z >= .329); assert.ok(p.x > 4);
});
test('small substeps prevent sprinting through a thin wall', () => {
  const p = createPlayer({ x: 0, z: 1 });
  for (let i = 0; i < 30; i++) stepPlayer(p, { forward: 1, sprint: true }, .1, [{ minX: -5, maxX: 5, minZ: -.02, maxZ: 0 }]);
  assert.ok(p.z >= .329);
});
test('crouching changes physical viewpoint and movement speed', () => {
  const p = createPlayer(); tick(p, { forward: 1, crouch: true }, 2);
  assert.ok(p.eyeHeight < 1.1); assert.ok(p.distance < 2.3); assert.equal(p.stance, 'crouch');
});
test('sprint consumes stamina and recovery restores it', () => {
  const p = createPlayer(); tick(p, { forward: 1, sprint: true }, 3);
  assert.ok(p.stamina < .7 && p.stamina > .5); assert.ok(p.distance > 12);
  tick(p, {}, 3); assert.ok(p.stamina > .8);
});
test('paused player and session clocks do not advance', () => {
  const p = createPlayer(), s = createSession(); const initial = JSON.stringify(p);
  stepPlayer(p, { paused: true, forward: 1 }, 1); assert.equal(JSON.stringify(p), initial);
  s.paused = true; updateSession(s, .1, p); assert.equal(s.time, 0); assert.equal(interact(s, 'sari', 'warn').ok, false);
});
test('cover volumes support circles and rectangles', () => {
  const p = createPlayer({ x: 1, z: 2 });
  assert.equal(isCovered(p, [{ x: 0, z: 2, r: 2 }]), true);
  assert.equal(isCovered(p, [{ minX: 0, maxX: 2, minZ: 1, maxZ: 3 }]), true);
  assert.equal(isCovered(p, [{ x: 0, z: 2, r: 2, disabled: true }]), false);
});
test('interaction ordering rejects shortcuts and repeated actions', () => {
  const s = createSession(); assert.equal(interact(s, 'parcel').ok, false);
  assert.equal(interact(s, 'sari', 'bogus').ok, false);
  assert.equal(interact(s, 'sari', 'warn').ok, true); assert.equal(interact(s, 'sari', 'testimony').ok, false);
  assert.equal(s.stage, 'bridge'); assert.equal(s.flags.sariWarned, true); assert.equal(s.flags.testimony, false);
});
test('photography is the gate to crossing and witness investigation', () => {
  const s = createSession(); interact(s, 'sari', 'testimony');
  assert.equal(getObjective(s).id, 'bridge'); interact(s, 'photo');
  assert.equal(s.flags.photographed, true); assert.equal(getObjective(s).x, TARGETS.damar.x);
  interact(s, 'damar'); assert.equal(s.stage, 'parcel');
});
test('impact has persistent aftermath and shelter choice changes route flags', () => {
  const s = createSession(); for (const [id, c] of [['sari', 'warn'], ['photo'], ['damar'], ['parcel']]) interact(s, id, c);
  assert.equal(s.event,'warning'); assert.equal(s.flags.impact,false);
  until(s,7); resolveDanger(s,true); assert.equal(s.event,'impact'); assert.equal(s.flags.impact,true); until(s,5);
  assert.equal(s.event, 'aftermath'); assert.equal(interact(s,'cart').ok,false);
  for(let i=0;i<81;i++) advanceHelp(s,'check',.05,true,true);
  assert.equal(s.flags.cartCleared, true); assert.equal(s.flags.rescued, false); assert.equal(s.stage, 'handoff');
});
test('all eight branches retain unique accounts and exactly nine lifetime entries', () => {
  const accounts = new Set();
  for (const a of ['testimony', 'warn']) for (const b of ['help', 'check']) for (const c of ['notebook', 'page']) {
    const s = play(a, b, c); assert.equal(s.entries.length, 9); assert.equal(s.flags.notebookPassed, true);
    accounts.add(JSON.stringify(s.entries)); const before = JSON.stringify(s.entries);
    assert.equal(interact(s, 'photo').ok, false); until(s, 17); assert.equal(s.stage, 'afterword'); assert.equal(JSON.stringify(s.entries), before);
  }
  assert.equal(accounts.size, 8);
});
test('saved state and player restore without resuming a paused clock', () => {
  const s = play('warn', 'check', 'page'), p = createPlayer({ x: -15, z: -12, yaw: 1 }); s.paused = true;
  const restored = loadSession(saveSession(s, p)); assert.ok(restored);
  assert.deepEqual(restored.session.choices, s.choices); assert.equal(restored.session.paused, false);
  assert.equal(restored.player.x, -15); assert.equal(restored.player.yaw, 1);
});
test('save decoder rejects malformed, unknown and oversized evidence', () => {
  assert.equal(loadSession('{'), null); assert.equal(loadSession('null'), null); assert.equal(loadSession('{"version":2}'), null);
  const s = createSession(); s.entries.push({ ...s.entries[0] }); assert.equal(loadSession(saveSession(s)), null);
  const s2 = createSession(); s2.flags.notebookPassed = true; assert.equal(loadSession(saveSession(s2)), null);
  const s3 = createSession(); s3.choices.sari = 'invented'; assert.equal(loadSession(saveSession(s3)), null);
});
test('large time steps are bounded to prevent a background-tab jump', () => {
  const p = createPlayer(); stepPlayer(p, { forward: 1, sprint: true }, 120); assert.ok(p.distance < .5);
  const s = createSession(); updateSession(s, 120, p); assert.equal(s.time, .1);
});

test('help requires contact in reach and preserves interrupted progress after reload',()=>{
 const s=createSession();for(const [id,c] of [['sari','warn'],['photo'],['damar'],['parcel']])interact(s,id,c);
 for(let i=0;i<20;i++)advanceHelp(s,'help',.05,true,true);
 const partial=s.helpProgress;assert.ok(partial>0&&partial<1);
 advanceHelp(s,'help',1,false,true);advanceHelp(s,'help',1,true,false);assert.equal(s.helpProgress,partial);
 s.paused=true;advanceHelp(s,'help',1,true,true);assert.equal(s.helpProgress,partial);s.paused=false;
 const restored=loadSession(saveSession(s)).session;assert.equal(restored.helpProgress,partial);
 for(let i=0;i<81;i++)advanceHelp(restored,'help',.05,true,true);assert.equal(restored.stage,'handoff');assert.equal(restored.flags.rescued,true);
});
test('cover preserves textile; exposure changes cloth but never requires reload',()=>{
 const a=createSession(),b=createSession();for(const s of [a,b]){interact(s,'sari','warn');interact(s,'photo');interact(s,'damar');interact(s,'parcel');}
 assert.equal(resolveDanger(a,true),'north');assert.equal(resolveDanger(b,false),'north');assert.equal(a.flags.clothSaved,true);assert.equal(b.flags.clothSaved,false);assert.equal(b.stage,'shelter');assert.equal(resolveDanger(b,false),false);
 b.pendingImpact='south';resolveDanger(b,true);assert.equal(b.flags.returnImpact,true);assert.equal(b.flags.clothSaved,false);
});
test('v3 migration defaults to intact cloth and no invented help progress',()=>{
 const s=createSession();s.version=3;delete s.flags.clothSaved;delete s.helpProgress;
 const got=loadSession(saveSession(s)).session;assert.equal(got.version,4);assert.equal(got.flags.clothSaved,true);assert.equal(got.helpProgress,0);
});
