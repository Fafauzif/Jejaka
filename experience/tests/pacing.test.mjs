import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameDelta, briskTransition, travelSpeed } from '../pacing.js';
test('story and ordinary walking retain real time at 1, 5, 15, 30 and 60fps', () => {
  for (const fps of [1,5,15,30,60]) {
    let story=0,movement=0;
    for (let i=1;i<=fps*5;i++) { const d=frameDelta(i*1000/fps,(i-1)*1000/fps,true);story+=d.story;movement+=d.movement;assert(d.animation<=.15); }
    assert(Math.abs(story-5)<1e-9);assert(Math.abs(movement-5)<1e-9);
  }
});
test('pause drops no story or movement into the next active frame',()=>{
  assert.deepEqual(frameDelta(60000,0,false),{story:0,animation:0,movement:0});
  const resumed=frameDelta(60100,60000,true);assert.equal(resumed.story,.1);
});
test('foreground stall keeps story time while bounding camera displacement',()=>{
  const d=frameDelta(60000,0,true);assert.equal(d.story,60);assert.equal(d.movement,2);assert.equal(d.animation,.15);
});
test('brisk journey jumps only under full fade, then completes within 3.4sec',()=>{
  assert.equal(briskTransition(1.39).jump,false);assert.equal(briskTransition(1.4).jump,true);assert.equal(briskTransition(1.4).fade,1);
  assert.equal(briskTransition(2).complete,false);assert.equal(briskTransition(3.4).complete,true);assert.equal(briskTransition(3.4).fade,0);
  assert(travelSpeed(8)<travelSpeed(5));
});
