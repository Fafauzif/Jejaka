import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../lib/three.module.js';
import { createActors } from './actors.js';
import { createWorld } from './world.js';
import { collides, createPlayer, createRun, impactProtection, assessImpact } from './rules.js';

// Current map-guided district: physical route, rescue, Continue and pause regressions.
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

import { LAYOUT } from './layout.js';
const R=LAYOUT.rescue,F=LAYOUT.refuge,B=LAYOUT.bridge,RI=LAYOUT.routeIndices,LAST=LAYOUT.actorRoute.length-1;
test('crouching at the actual G04 exposed-impact root protects without widening cover or skipping the route', t => {
 const world=createWorld(THREE,new THREE.Scene(),{quality:'low'});
 t.after(()=>world.dispose());
 // Recorded G04 impact, not its intended target. This is native geometry only.
 const p={...createPlayer(),x:-53.76811065923358,z:-28.41899335053767},h={...LAYOUT.events.coverImpact,radius:26};
 world.update(0,112.883,{...createRun(),phase:2,time:112.883,phaseTime:12.6998},p);
 const standing=impactProtection({...p,stance:'walk'},h,world.colliders,world.cover),crouching=impactProtection({...p,stance:'crouch'},h,world.colliders,world.cover);
 assert.equal(standing.reason,'exposed');assert.equal(crouching.reason,'cover');
 assert(crouching.distance<26,'Being outside the attack radius is not a cover result');
 const exposed={...createRun(),phase:2},sheltered={...createRun(),phase:2};
 assert.equal(assessImpact(exposed,{...p,stance:'walk'},world.cover,h,world.colliders),false);
 assert.equal(assessImpact(sheltered,{...p,stance:'crouch'},world.cover,h,world.colliders),true);
 assert.equal(exposed.exposures,1);assert.equal(exposed.clothIntact,false);
 assert.equal(sheltered.exposures,0);assert.equal(sheltered.clothIntact,true);
 assert.equal(exposed.phase,2);assert.equal(sheltered.phase,2);
});
function setup(t,phase=6,{helped=true,cleared=true}={}) {
 const scene=new THREE.Scene(),world=createWorld(THREE,scene,{quality:'low'}),actors=createActors(THREE,scene,{quality:'low'});
 t.after(()=>{actors.dispose();world.dispose();});
 const state=Object.assign(createRun(),{phase,time:120,phaseTime:20,learned:true,learnedAt:30,helped,helpedAt:helped?70:0,helpProgress:helped?1:0,bridgeHelped:cleared,bridgeProgress:cleared?1:0,war:1,companionTarget:{...F},colliders:world.colliders});
 const player=Object.assign(createPlayer(),{x:F.x,z:F.z+2.55,yaw:0});
 const snapshot={version:2,layoutId:LAYOUT.id,phase,heroes:{sari:{x:F.x-.1,z:F.z+.55,yaw:0,routeIndex:LAST,gait:0},adi:{x:F.x+1,z:F.z+.75,yaw:0,routeIndex:LAST,gait:0},wiryo:{x:LAYOUT.cart.x+Math.sign(B.laneX-LAYOUT.cart.x)*3.2,z:LAYOUT.cart.z+.5,yaw:Math.PI/2,routeIndex:RI.bridgeApproach,gait:0}}};
 const run={world,actors,state,player,snapshot};return run;
}
function restore(run){run.state.groupPositions=[run.player,...Object.values(run.snapshot.heroes)];run.world.update(0,run.state.time,run.state,run.player);return run.actors.restore(run.snapshot,run.state,run.player);}
function step(run,dt=.05){const {actors,world,state,player}=run;state.time+=dt;state.phaseTime+=dt;state.groupPositions=[player,actors.heroes.sari,actors.heroes.adi];world.update(dt,state.time,state,player);actors.update(dt,state.time,state,player);}
function finish(run,key='sari',limit=160){const p=run.actors.heroes[key];const target=key==='sari'?{x:F.x-.1,z:F.z+.55}:{x:F.x+1,z:F.z+.75};const visited=[p.routeIndex];for(let t=0;t<limit;t+=.05){const before={x:p.x,z:p.z};step(run);assert(Math.hypot(p.x-before.x,p.z-before.z)<.81,'Physical walk cannot teleport');assert(!collides(p.x,p.z,run.world.colliders,.24),'Hero root must remain outside solids/water');if(visited.at(-1)!==p.routeIndex)visited.push(p.routeIndex);if(p.mode==='rest'&&p.routeIndex===LAST&&Math.hypot(p.x-target.x,p.z-target.z)<.6)return visited;}assert.fail('Companion failed to arrive '+JSON.stringify({key,x:p.x,z:p.z,routeIndex:p.routeIndex,mode:p.mode}));}

test('a late companion follows the mapped bridge then quay turns to the real-school footprint approach',t=>{
 const run=setup(t);const point=LAYOUT.actorRoute[RI.plaza];run.snapshot.heroes.sari={...run.snapshot.heroes.sari,x:point.x,z:point.z,routeIndex:RI.plaza};assert(restore(run).restored.includes('sari'));const visited=finish(run);assert(visited.includes(RI.bridgeApproach)&&visited.includes(RI.bridgeExit)&&visited.includes(RI.quayBreather)&&visited.includes(RI.connectorWest)&&visited.at(-1)===LAST);
});

test('legal exterior bridge-entry saves recover continuously and Continue retains their recovery roots',t=>{
 for(const [key,side] of [['sari',-1],['adi',1]]){
  const run=setup(t),rails=run.world.colliders.filter(c=>c.tag==='bridge rail').sort((a,b)=>a.minX-b.minX),rail=rails[side<0?0:1];
  const x=side<0?rail.minX-.241:rail.maxX+.241;
  const z=[.241,.5,1,2,3,4].map(d=>rail.maxZ+d).find(z=>!collides(x,z,run.world.colliders,.24));
  assert(Number.isFinite(z),'An exterior entry fixture must be physically legal');
  run.snapshot.heroes[key]={x,z,yaw:0,routeIndex:RI.bridgeEntry,gait:0};assert(restore(run).restored.includes(key));
  const p=run.actors.heroes[key];assert.equal(p.x,x);assert.equal(p.z,z);
  for(let i=0;i<30;i++)step(run);
  const saved=run.actors.snapshot(),position={x:p.x,z:p.z};
  const continued=setup(t);continued.snapshot=saved;assert(restore(continued).restored.includes(key));assert.equal(continued.actors.heroes[key].x,position.x);assert.equal(continued.actors.heroes[key].z,position.z);
  finish(continued,key);
 }
});

test('backtracking beside the entry cannot shove a companion into the river and a bridge wait is not a school seat',t=>{
 const run=setup(t);run.snapshot.heroes.sari={x:LAYOUT.actorRoute[RI.bridgeApproach].x,z:LAYOUT.actorRoute[RI.bridgeApproach].z+.2,yaw:0,routeIndex:RI.bridgeEntry,gait:0};
 run.player.x=run.snapshot.heroes.sari.x-Math.sign(B.laneX-LAYOUT.cart.x)*.55;run.player.z=run.snapshot.heroes.sari.z+.2;restore(run);
 for(let i=0;i<240;i++)step(run);
 assert(run.actors.heroes.sari.z<B.maxZ-1,'Companion must enter the mapped bridge despite nearby player');assert.notEqual(run.actors.heroes.sari.mode,'rest');
 run.player.x=F.x;run.player.z=F.z+2.55;finish(run);
});

test('an approaching child save remains approaching until reaching the actual mapped rack',t=>{
 const run=setup(t,3,{helped:false,cleared:false});run.state.helpProgress=0;run.state.companionTarget={...R};run.player.x=R.x-.65;run.player.z=R.z+2.03;
 const a=LAYOUT.actorRoute[RI.rescueApproach];run.snapshot.heroes.adi={x:a.x,z:a.z,yaw:0,routeIndex:RI.rescueApproach,gait:.3};
 run.snapshot.heroes.sari={x:R.x+.46,z:R.z+.1,yaw:-Math.PI/2,routeIndex:RI.rescue,gait:0};
 assert(restore(run).restored.includes('adi'));assert.equal(run.actors.heroes.adi.trapLatched,false);
 for(let i=0;i<500&&!run.actors.heroes.adi.trapLatched;i++)step(run);
 const child=run.actors.heroes.adi;assert.equal(child.trapLatched,true);assert(Math.hypot(child.trapAnchor.x-R.x,child.trapAnchor.z-R.z)<.55);
});

test('partial extraction Continue preserves the same child root and clears space for the flank helper',t=>{
 const run=setup(t,3,{helped:false,cleared:false}),h=.46,crawl=h/.65;run.state.helpProgress=h;run.state.companionTarget={...R};run.player.x=R.x-.65;run.player.z=R.z+2.03;
 run.snapshot.heroes.adi={x:R.x-1.05*crawl,z:R.z+.28*crawl,yaw:Math.PI*.8,routeIndex:RI.rescue,gait:0,trapLatched:true,trapAnchor:{...R},helpRise:(h-.35)/.65};
 run.snapshot.heroes.sari={x:R.x+.46-1.05*crawl,z:R.z+.1+.28*crawl,yaw:-Math.PI/2,routeIndex:RI.rescue,gait:0};
 assert(restore(run).restored.includes('adi'));const a=run.actors.heroes.adi,before={x:a.x,z:a.z};step(run);assert(Math.hypot(a.x-before.x,a.z-before.z)<1e-6);
 for(let i=0;i<20;i++)step(run);const helper=run.actors.heroes.sari;assert.equal(helper.mode,'help');assert(!collides(helper.x,helper.z,run.world.colliders,.24),'The helper must occupy actual clear floor beside the rack');
 assert(helper.x>a.x+.35&&helper.z<a.z+.4,'Helper must remain on east flank, leaving ordinary north approach open');
});

test('pausing freezes roots, gait and the moving community instead of reposing carriers',t=>{
 const run=setup(t);const p=LAYOUT.actorRoute[RI.bridgeApproach];run.snapshot.heroes.sari={x:p.x,z:p.z,yaw:0,routeIndex:RI.bridgeEntry,gait:0};restore(run);for(let i=0;i<30;i++)step(run);
 const fields=()=>JSON.stringify({people:run.actors.people.map(p=>({x:p.x,z:p.z,yaw:p.yaw,speed:p.speed,gait:p.gait,mode:p.mode})),community:run.actors.stats.community});const before=fields();run.state.paused=true;
 for(let i=0;i<30;i++)run.actors.update(.05,run.state.time,run.state,run.player);assert.equal(fields(),before);
});

test('old authored-stage actor snapshots cannot masquerade as mapped-district positions',t=>{
 const run=setup(t,3,{helped:false,cleared:false});run.snapshot.version=1;delete run.snapshot.layoutId;const result=restore(run);assert.deepEqual(result.restored,[]);assert.equal(result.fallback.length,3);assert(Math.hypot(run.actors.heroes.adi.x-R.x,run.actors.heroes.adi.z-R.z)<.6);
});

test('waiting at an intermediate quay conversation stays standing rather than sitting before the school',t=>{
 const run=setup(t);run.state.companionTarget={...LAYOUT.quayBreather};run.snapshot.heroes.sari={x:LAYOUT.quayBreather.x-.65,z:LAYOUT.quayBreather.z,yaw:0,routeIndex:RI.quayBreather,gait:0};restore(run);for(let i=0;i<20;i++)step(run);assert.equal(run.actors.heroes.sari.mode,'wait');assert(run.actors.heroes.sari.routeIndex<LAST);
});

test('restarting after releasing the bridge queue resets its visible consequence on the first new frame',t=>{
 const run=setup(t);restore(run);for(let i=0;i<80;i++)step(run);assert(run.actors.stats.community.travelledMetres>0);
 Object.assign(run.state,createRun());run.actors.update(0,0,run.state,LAYOUT.spawn);
 assert.equal(run.actors.stats.community.waiting,true);assert.equal(run.actors.stats.community.travelledMetres,0);
 for(const p of run.actors.people.filter(p=>p.communityRole==='carrier')){assert.equal(p.x,p.homeX);assert.equal(p.z,p.homeZ);}
});

test('living street residents exist from boot behind and ahead of spawn and retain their home positions',t=>{
 const run=setup(t,0,{helped:false,cleared:false});Object.assign(run.state,createRun());Object.assign(run.player,LAYOUT.spawn);run.state.colliders=run.world.colliders;
 const market=run.actors.people.filter(p=>p.marketRole),homes=market.map(p=>({x:p.x,z:p.z,homeX:p.homeX,homeZ:p.homeZ}));
 assert.equal(market.length,40);assert(market.some(p=>p.z>LAYOUT.spawn.z+18));assert(market.some(p=>p.z<LAYOUT.spawn.z-18));
 for(const p of market)assert(!collides(p.x,p.z,run.world.colliders,.24),'Initial residents must occupy real clear street/forecourt space');
 run.world.update(.05,.05,run.state,run.player);run.actors.update(.05,.05,run.state,run.player);assert.equal(run.actors.stats.active,70);
 const bands=run.actors.stats.marketResidentsInRange;assert(bands.rear>=4&&bands.near>=4&&bands.forward>=4,'Low tier must retain physical near/rear/front groups');
 for(let i=0;i<market.length;i++){assert.equal(market[i].homeX,homes[i].homeX);assert.equal(market[i].homeZ,homes[i].homeZ);assert(Math.hypot(market[i].x-homes[i].x,market[i].z-homes[i].z)<.2,'The first frame must walk, not relocate a resident');}
});
