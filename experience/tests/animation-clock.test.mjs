import test from 'node:test';
import assert from 'node:assert/strict';
import {AnimationMixer, AnimationClip, NumberKeyframeTrack, Object3D, LoopOnce} from '../lib/three.module.js';
import {frameDelta} from '../pacing.js';
test('actual skeletal clip keeps gesture progress at low frame rates and pauses',()=>{
 for(const fps of [1,5,30,60]) {
  const root=new Object3D(),mixer=new AnimationMixer(root);
  const action=mixer.clipAction(new AnimationClip('Gesture',2.5,[new NumberKeyframeTrack('.position[x]',[0,2.5],[0,1])]));
  action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
  for(let n=1;n<=fps*2;n++)mixer.update(frameDelta(n*1000/fps,(n-1)*1000/fps,true).movement);
  assert(Math.abs(action.time-2)<1e-6,`clip time at ${fps} fps`);
  assert(Math.abs(root.position.x-.8)<1e-6,`gesture pose at ${fps} fps`);
  mixer.update(frameDelta(62000,2000,false).movement);
  assert(Math.abs(action.time-2)<1e-6,`pause at ${fps} fps`);
 }
});
