import {LAYOUT} from './layout.js';
/** Original bounded 3D fire, smoke and destruction for the authored escape district.
 * App calls burst() for warned gameplay hazards; ambient distant bursts never
 * decide damage, cover or story progression. No copied textures or audio. */
export function createEffects(THREE,scene,{reducedMotion=false,quality='balanced'}={}) {
  const root=new THREE.Group();root.name='Escape fire / layered soot / debris';scene.add(root);
  let comfort=reducedMotion,tier=quality,seed=45011,time=0,emitClock=0,nextDistant=12,lastPhase=0;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const MAX_SMOKE=270,MAX_DEBRIS=240,MAX_EMBERS=180,MAX_FLAME=150;
  const dummy=new THREE.Object3D(),color=new THREE.Color();
  const smoke=Array.from({length:MAX_SMOKE},()=>({life:0})),debris=Array.from({length:MAX_DEBRIS},()=>({life:0})),embers=Array.from({length:MAX_EMBERS},()=>({life:0}));
  let smokeCursor=0,debrisCursor=0,emberCursor=0;
  const smokeGeo=new THREE.SphereGeometry(1,14,10),smokeAlpha=new THREE.InstancedBufferAttribute(new Float32Array(MAX_SMOKE),1),smokeTint=new THREE.InstancedBufferAttribute(new Float32Array(MAX_SMOKE*3),3);
  smokeGeo.setAttribute('aAlpha',smokeAlpha);smokeGeo.setAttribute('aTint',smokeTint);
  const smokeMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{clock:{value:0}},vertexShader:`attribute float aAlpha;attribute vec3 aTint;varying float alpha;varying vec3 nrm,world,tint;void main(){vec3 p=position;float grain=sin(p.x*8.1+p.z*5.7+aTint.x*35.)*sin(p.y*7.3-p.z*4.2);p*=1.+grain*.12;vec4 w=modelMatrix*instanceMatrix*vec4(p,1.);world=w.xyz;nrm=normalize(mat3(modelMatrix*instanceMatrix)*normal);alpha=aAlpha;tint=aTint;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform float clock;varying float alpha;varying vec3 nrm,world,tint;void main(){vec3 n=normalize(nrm);float face=abs(dot(n,normalize(cameraPosition-world)));float edge=pow(face,.48);float grain=.75+.16*sin(world.x*2.3+sin(world.z*2.7)+world.y*3.-clock*.18)+.09*sin(world.z*6.1-world.y*4.);float light=.68+.27*max(0.,dot(n,normalize(vec3(-.6,1.,.2))));gl_FragColor=vec4(tint*light,alpha*edge*grain);}`});
  const smokeMesh=new THREE.InstancedMesh(smokeGeo,smokeMat,MAX_SMOKE);smokeMesh.frustumCulled=false;smokeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);smokeMesh.count=0;root.add(smokeMesh);
  const flameGeo=new THREE.PlaneGeometry(1,1,2,8),flameSeed=new THREE.InstancedBufferAttribute(new Float32Array(MAX_FLAME),1);flameGeo.setAttribute('aSeed',flameSeed);
  const flameMat=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,blending:THREE.NormalBlending,uniforms:{clock:{value:0},motion:{value:comfort?0:1}},vertexShader:`attribute float aSeed;uniform float clock,motion;varying vec2 vUv;varying float seed;void main(){vUv=uv;seed=aSeed;vec3 p=position;float h=uv.y;p.x+=sin(clock*(3.+aSeed)+h*7.+aSeed*9.)*h*h*.13*motion;vec4 w=modelMatrix*instanceMatrix*vec4(p,1.);gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform float clock,motion;varying vec2 vUv;varying float seed;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
void main(){float y=vUv.y,x=vUv.x-.5,flow=clock*motion;
float n=noise(vec2(x*4.+seed*7.,y*4.7-flow*1.7));
float detail=noise(vec2(x*9.-seed*3.,y*10.-flow*2.6));
float bend=sin(y*8.-flow*3.1+seed*5.)*y*y*.16+(n-.5)*.13*y;
float width=(.43+.06*sin(y*13.+seed*4.))*pow(max(.001,1.-y),.72);
float edge=1.-smoothstep(width*.55,width,abs(x+bend));
float top=1.-smoothstep(.68+n*.12,.99,y);
float holes=mix(1.,smoothstep(.22,.66,n*.73+detail*.27),smoothstep(.08,.48,y));
float core=(1.-smoothstep(.02,.22,abs(x+bend)))*(1.-smoothstep(.1,.6,y));
vec3 col=mix(vec3(.85,.095,.008),vec3(1.,.47,.045),1.-y);
col=mix(col,vec3(1.,.73,.24),core*.8);
float alpha=edge*top*holes*(.84-y*.22);gl_FragColor=vec4(col,alpha);}
`});
  const flames=new THREE.InstancedMesh(flameGeo,flameMat,MAX_FLAME);flames.instanceMatrix.setUsage(THREE.DynamicDrawUsage);flames.frustumCulled=false;flames.count=0;root.add(flames);
  const debrisGeo=new THREE.BoxGeometry(1,1,1),debrisMat=new THREE.MeshStandardMaterial({color:0xa88962,roughness:1});
  const debrisMesh=new THREE.InstancedMesh(debrisGeo,debrisMat,MAX_DEBRIS);debrisMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);debrisMesh.frustumCulled=false;debrisMesh.count=0;debrisMesh.castShadow=true;root.add(debrisMesh);
  const emberGeo=new THREE.BufferGeometry(),emberPositions=new Float32Array(MAX_EMBERS*3),emberSizes=new Float32Array(MAX_EMBERS),emberAlpha=new Float32Array(MAX_EMBERS);
  emberGeo.setAttribute('position',new THREE.BufferAttribute(emberPositions,3));emberGeo.setAttribute('aSize',new THREE.BufferAttribute(emberSizes,1));emberGeo.setAttribute('aAlpha',new THREE.BufferAttribute(emberAlpha,1));
  const emberMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`attribute float aSize,aAlpha;varying float opacity;void main(){opacity=aAlpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(160.*aSize/max(1.,-mv.z),1.,6.);gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying float opacity;void main(){float d=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-d),1.5)*opacity;gl_FragColor=vec4(1.,.43,.08,a);}`});
  const emberMesh=new THREE.Points(emberGeo,emberMat);emberMesh.frustumCulled=false;root.add(emberMesh);
  const flashes=[];
  for(let i=0;i<3;i++){const geo=new THREE.SphereGeometry(1,12,8),mat=new THREE.MeshBasicMaterial({color:0xffd99a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const mesh=new THREE.Mesh(geo,mat);root.add(mesh);const ringGeo=new THREE.TorusGeometry(1,.075,4,36),ringMat=new THREE.MeshBasicMaterial({color:0xd5c6a2,transparent:true,opacity:0,depthWrite:false});const ring=new THREE.Mesh(ringGeo,ringMat);ring.rotation.x=-Math.PI/2;root.add(ring);const light=new THREE.PointLight(0xffb461,0,35,2);root.add(light);flashes.push({mesh,ring,light,age:99,strength:1});}
  const fireLights=[];for(let i=0;i<4;i++){const l=new THREE.PointLight(0xff8b35,0,19,2);root.add(l);fireLights.push(l);}
  // Shared off-road fictional damage sites; no authored random burst may invent a river crossing.
  const sites=LAYOUT.fireSites.map(s=>({...s,size:s.size??Math.max(.65,Math.min(1.3,(s.radius||3)/3.2))}));
  function overWater(x,z){return LAYOUT.data.waters.some(w=>{let inside=false;const points=w.points;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;}return inside;});}
  const stats={smoke:0,flames:0,debris:0,embers:0,total:0,bursts:0,distantBursts:0,lastDistant:null,dustBursts:0,budget:'bounded'};
  const smokeBudget=()=>tier==='low'?110:tier==='high'?270:185;
  const debrisBudget=()=>tier==='low'?105:tier==='high'?240:170;
  const emberBudget=()=>tier==='low'?70:tier==='high'?180:120;
  function puff(x,y,z,size=1,violent=false){const limit=smokeBudget(),p=smoke[smokeCursor++%limit];Object.assign(p,{x,y,z,size:size*(.7+rand()*.6),age:0,life:12+rand()*8,vx:.36+rand()*.3,vz:-.13+(rand()-.5)*.17,vy:violent?1.1+rand()*1.5:.8+rand()*.7,grow:.25+rand()*.21,shade:violent?.32+rand()*.12:.19+rand()*.12,dust:false,seed:rand()*6.28});}
  function dust(x,z,intensity){const limit=smokeBudget(),p=smoke[smokeCursor++%limit],angle=rand()*Math.PI*2,speed=(1.7+rand()*3.5)*intensity;Object.assign(p,{x:x+(rand()-.5)*2,y:.35+rand()*.8,z:z+(rand()-.5)*2,size:.6+rand()*.8,age:0,life:2.4+rand()*1.1,vx:Math.cos(angle)*speed,vz:Math.sin(angle)*speed,vy:.7+rand()*.8,grow:.95+rand()*.7,shade:.42+rand()*.08,dust:true,seed:rand()*6.28});}
  function ember(x,y,z,strong=false){const p=embers[emberCursor++%emberBudget()];Object.assign(p,{x,y,z,life:2+rand()*4,age:0,vx:(rand()-.5)*(strong?5:1.3),vy:1.3+rand()*3,vz:(rand()-.5)*(strong?5:1.1),size:.25+rand()*.3});}
  function burst(x,z,strength=1){const intensity=Math.max(.2,Math.min(2,strength));stats.bursts++;for(let i=0;i<(comfort?10:20)*intensity;i++)dust(x,z,intensity);for(let i=0;i<(comfort?7:16)*intensity;i++)puff(x+(rand()-.5)*3,.3+rand()*2,z+(rand()-.5)*3,1.2+rand()*1.4,true);for(let i=0;i<(comfort?12:45)*intensity;i++){const p=debris[debrisCursor++%debrisBudget()],angle=rand()*Math.PI*2,speed=(2+rand()*7)*intensity;Object.assign(p,{x,y:.7+rand()*2,z,vx:Math.cos(angle)*speed,vy:3+rand()*8,vz:Math.sin(angle)*speed,age:0,life:9+rand()*8,scale:.09+rand()*.26,rx:rand()*4,ry:rand()*4,rz:rand()*4,spin:(rand()-.5)*7,color:rand()<.5?0x846449:0xb59a76});}for(let i=0;i<35;i++)ember(x,1,z,true);const f=flashes.reduce((a,b)=>a.age>b.age?a:b);f.age=0;f.strength=intensity;f.mesh.position.set(x,1.8,z);f.ring.position.set(x,.12,z);f.light.position.set(x,3,z);}
  function dustBurst(x,z,strength=1){const intensity=Math.max(.2,Math.min(2,strength));stats.dustBursts++;for(let i=0;i<(comfort?10:24)*intensity;i++)dust(x,z,intensity);}
  function setQuality(q){tier=q;for(let i=smokeBudget();i<smoke.length;i++)smoke[i].life=0;for(let i=debrisBudget();i<debris.length;i++)debris[i].life=0;for(let i=emberBudget();i<embers.length;i++)embers[i].life=0;}
  function setReducedMotion(value){comfort=!!value;flameMat.uniforms.motion.value=comfort?0:1;}
  function update(dt,t,state={},player={x:0,z:12}) {
    dt=Math.max(0,Math.min(.1,dt));time=t;const phase=Number(state.phase)||0,war=Math.max(0,Math.min(1,Number(state.war)||0));
    smokeMat.uniforms.clock.value=t;flameMat.uniforms.clock.value=t;
    if(phase<lastPhase){for(const p of [...smoke,...debris,...embers])p.life=0;for(const f of flashes)f.age=99;emitClock=0;nextDistant=t+12;}lastPhase=phase;
    const active=sites.filter(s=>phase>=s.phase).sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z));
    emitClock+=dt;
    if(emitClock>(tier==='low'?.22:.14)){emitClock=0;for(const site of active){const close=Math.hypot(site.x-player.x,site.z-player.z)<125;if(close){puff(site.x+(rand()-.5)*site.size*2,.65+rand()*1.15,site.z+(rand()-.5)*site.size*1.7,site.size*(.75+rand()*.35));for(let k=0;k<(tier==='low'?1:2);k++)ember(site.x+(rand()-.5)*2,1+rand()*3,site.z+(rand()-.5)*2);}}}
    // Only theatrical distant events are autonomous; app owns every warned local event.
    if(dt>0&&war>.2&&t>nextDistant){nextDistant=t+12+rand()*9;const candidates=active.filter(s=>{const d=Math.hypot(s.x-player.x,s.z-player.z);return d>38&&d<220;});if(candidates.length){const site=candidates[Math.floor(rand()*candidates.length)];for(let i=0;i<(comfort?4:8);i++)puff(site.x+(rand()-.5)*2,1.5+rand()*3,site.z+(rand()-.5)*2,site.size*1.35,true);stats.distantBursts++;stats.lastDistant={x:site.x,z:site.z,time:t,site:site.id||null};}}
    let n=0;
    for(let i=0;i<smokeBudget();i++){const p=smoke[i];if(p.life<=0)continue;p.age+=dt;if(p.age>=p.life){p.life=0;continue;}p.x+=p.vx*dt;p.z+=p.vz*dt;if(p.dust){p.vy-=.9*dt;p.vx*=Math.exp(-dt*1.1);p.vz*=Math.exp(-dt*1.1);p.y=Math.max(.3,p.y+p.vy*dt);}else p.y+=p.vy*dt;const s=p.size+p.age*p.grow,fade=Math.min(1,p.age/.4)*Math.max(0,1-p.age/p.life);dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.seed+p.age*.03,p.seed*.7,p.age*.025);dummy.scale.set(s,s*(p.dust?.46:.85),s*.9);dummy.updateMatrix();smokeMesh.setMatrixAt(n,dummy.matrix);smokeAlpha.setX(n,fade*(p.dust?.48:tier==='low'?.29:.25));const shade=p.shade+Math.min(.13,p.age*.006);smokeTint.setXYZ(n,shade*(p.dust?1:.91),shade*(p.dust?.83:.96),shade*(p.dust?.62:.92));n++;}
    smokeMesh.count=n;smokeMesh.instanceMatrix.needsUpdate=true;smokeAlpha.needsUpdate=true;smokeTint.needsUpdate=true;stats.smoke=n;
    n=0;const flameBudget=tier==='low'?54:tier==='high'?150:108;for(const site of active){if(Math.hypot(site.x-player.x,site.z-player.z)>125)continue;const count=tier==='low'?6:tier==='high'?14:10;for(let i=0;i<count&&n<flameBudget;i++){const angle=(i%2)*Math.PI/2+.15*Math.sin(site.x),cluster=Math.floor(i/2),xx=site.x+Math.sin(cluster*2.4)*site.size*1.35,zz=site.z+Math.cos(cluster*2.4)*site.size*.75,h=site.size*(1.15+Math.sin(cluster*1.8+site.x*.17)*.35+Math.abs(Math.sin(cluster*2.7))*.8);dummy.position.set(xx,h*.46+.08,zz);dummy.rotation.set(.05*Math.sin(cluster),angle,.07*Math.cos(cluster));dummy.scale.set(site.size*(.68+Math.abs(Math.cos(cluster*2.1+site.x))*.4),h,1);dummy.updateMatrix();flames.setMatrixAt(n,dummy.matrix);flameSeed.setX(n,cluster*.37+site.x*.1+(i%2)*1.91);n++;}}
    flames.count=n;flames.instanceMatrix.needsUpdate=true;flameSeed.needsUpdate=true;stats.flames=n;
    n=0;for(let i=0;i<debrisBudget();i++){const p=debris[i];if(p.life<=0)continue;p.age+=dt;if(p.age>p.life){p.life=0;continue;}p.vy-=9.8*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.y<p.scale*.5){if(overWater(p.x,p.z)){p.life=0;continue;}p.y=p.scale*.5;if(Math.abs(p.vy)>1)p.vy=Math.abs(p.vy)*.24;else p.vy=0;p.vx*=.85;p.vz*=.85;p.spin*=.82;}dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx+p.age*p.spin,p.ry+p.age*p.spin*.7,p.rz);dummy.scale.set(p.scale*(1+p.age*.01),p.scale*.7,p.scale*1.8);dummy.updateMatrix();debrisMesh.setMatrixAt(n,dummy.matrix);color.setHex(p.color);debrisMesh.setColorAt(n,color);n++;}
    debrisMesh.count=n;debrisMesh.instanceMatrix.needsUpdate=true;if(debrisMesh.instanceColor)debrisMesh.instanceColor.needsUpdate=true;stats.debris=n;
    n=0;for(let i=0;i<emberBudget();i++){const p=embers[i];if(p.life<=0)continue;p.age+=dt;if(p.age>p.life){p.life=0;continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=dt*.45;emberPositions[n*3]=p.x;emberPositions[n*3+1]=p.y;emberPositions[n*3+2]=p.z;emberSizes[n]=p.size;emberAlpha[n]=Math.min(1,p.age/.1)*(1-p.age/p.life);n++;}
    emberGeo.setDrawRange(0,n);for(const key of ['position','aSize','aAlpha'])emberGeo.attributes[key].needsUpdate=true;stats.embers=n;
    for(const f of flashes){f.age+=dt;const a=f.age;f.mesh.visible=false;f.mesh.scale.setScalar((1+a*15)*f.strength);f.mesh.material.opacity=comfort?.06:Math.max(0,.72-a*2.5);f.ring.visible=!comfort&&a<.27;f.ring.scale.setScalar(1+a*13);f.ring.material.opacity=Math.max(0,.13-a*.48);f.light.intensity=comfort?0:Math.max(0,42-a*280)*f.strength;}
    const near=[...active].sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z));for(let i=0;i<fireLights.length;i++){const l=fireLights[i],s=near[i];if(s&&Math.hypot(s.x-player.x,s.z-player.z)<48){l.position.set(s.x,2.5,s.z);l.intensity=(comfort?11:13+Math.sin(t*7+i)*1.5)*s.size;}else l.intensity=0;}
    stats.total=stats.smoke+stats.flames+stats.debris+stats.embers;stats.activeSites=active.length;
  }
  function dispose(){scene.remove(root);for(const p of [smokeGeo,smokeMat,flameGeo,flameMat,debrisGeo,debrisMat,emberGeo,emberMat])p.dispose();for(const f of flashes){f.mesh.geometry.dispose();f.mesh.material.dispose();f.ring.geometry.dispose();f.ring.material.dispose();}}
  return {root,update,burst,dustBurst,setQuality,setReducedMotion,stats,dispose};
}
