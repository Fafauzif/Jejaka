import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../lib/three.module.js';
import {createEffects} from './effects.js';
// Pixel creation is a 2D-only adapter; all scene objects and event logic are real.
globalThis.document={createElement(){return {width:128,height:128,getContext(){return {createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};}};}};
test('blast presentation starts with rule impact, after the existing seven-second warning',()=>{
 const scene=new THREE.Scene(),fx=createEffects(THREE,scene,{quality:'low'});
 fx.triggerImpact({x:1,z:-40});fx.update(.1,.1,{},{});
 assert.equal(fx.stats.event,'impact');assert.ok(fx.stats.debris>0);fx.dispose();
});
test('effects retain game-clock duration at 10 and 60 frames per second',()=>{
 for(const fps of [10,60]){const scene=new THREE.Scene(),fx=createEffects(THREE,scene);fx.triggerImpact();
 for(let i=0;i<fps*5;i++)fx.update(1/fps,(i+1)/fps,{},{});
 assert.equal(fx.stats.event,'aftermath');assert.ok(fx.stats.debris<=42);fx.dispose();}
});
test('restored comfort aftermath has no flash and repeated sources keep bounded pools',()=>{
 const scene=new THREE.Scene(),fx=createEffects(THREE,scene,{quality:'high',reducedMotion:true});
 fx.restoreImpact({x:1,z:-40},20);assert.equal(fx.stats.event,'aftermath');
 assert.ok(scene.children[0].children.filter(o=>o.isPointLight).every(o=>o.intensity<20));
 const initial=scene.children[0].children.length;
 for(let j=0;j<5;j++){fx.triggerImpact({x:j*5,z:-10});for(let i=0;i<30;i++)fx.update(.1,i*.1,{flags:{impact:true}},{});}
 assert.equal(scene.children[0].children.length,initial);
 for(const o of scene.children[0].children)if(o.geometry?.isInstancedBufferGeometry)assert.ok(o.geometry.instanceCount<=o.geometry.attributes.aCenter.count);
 fx.dispose();assert.equal(scene.children.length,0);
});
