/** Original stylized civilian cast. Instanced articulation, deterministic identities,
 * route-constrained routines, staggered panic reactions and distance-tiered updates.
 * People and actions are fictional production staging, not historical testimony. */
export function createActors(THREE, scene, { quality = 'balanced' } = {}) {
  const root = new THREE.Group(); root.name = 'Fictional civilian population'; scene.add(root);
  const MAX = 64, buckets = {}, dummy = new THREE.Object3D(), v = new THREE.Vector3(), v2 = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0), quat = new THREE.Quaternion(), matrix = new THREE.Matrix4();
  const color = new THREE.Color(), local = new THREE.Matrix4(), world = new THREE.Matrix4();
  const material = new THREE.MeshStandardMaterial({ roughness: .92 });
  const bundleMaterial=new THREE.MeshStandardMaterial({roughness:1,map:scene.userData.jejakaTextileTexture||null,color:0xffffff});
  const shadowMaterial = new THREE.MeshBasicMaterial({color:0x1c211d,transparent:true,opacity:.2,depthWrite:false});
  const sphere = new THREE.SphereGeometry(1, 10, 8);
  const limb = new THREE.CylinderGeometry(1, .83, 1, 7);
  const shirtGeo = new THREE.LatheGeometry([
    new THREE.Vector2(.16,0),new THREE.Vector2(.19,.04),new THREE.Vector2(.18,.22),
    new THREE.Vector2(.22,.39),new THREE.Vector2(.19,.44),new THREE.Vector2(.075,.47)
  ],10);
  const skirtGeo = new THREE.CylinderGeometry(.16,.25,.72,10,1);
  const shoeGeo = new THREE.SphereGeometry(1,8,6);
  const hatGeo = new THREE.CylinderGeometry(.117,.13,.12,10);
  const strawGeo = new THREE.ConeGeometry(.28,.14,12);
  const basketGeo = new THREE.CylinderGeometry(.12,.09,.23,9);
  const collarGeo = new THREE.TorusGeometry(.083,.017,4,12,Math.PI*1.75);
  const shawlGeo = new THREE.TorusGeometry(.24,.045,4,12,Math.PI);
  const shadowGeo = new THREE.CircleGeometry(.27,12); shadowGeo.rotateX(-Math.PI/2);
  const defs = {torso:shirtGeo,skirt:skirtGeo,limb,head:sphere,hand:sphere,eye:sphere,hair:sphere,
    shoe:shoeGeo,peci:hatGeo,straw:strawGeo,basket:basketGeo,collar:collarGeo,shawl:shawlGeo,shadow:shadowGeo,book:new THREE.BoxGeometry(.21,.27,.045),bundle:new THREE.BoxGeometry(.33,.18,.25)};
  for(const [name,geo] of Object.entries(defs)) {
    const capacity=MAX*({limb:8,hand:2,eye:8,shoe:2,head:4,hair:2}[name]||1);
    const mesh=new THREE.InstancedMesh(geo,name==='shadow'?shadowMaterial:name==='bundle'?bundleMaterial:material,capacity);
    mesh.name=`Civilian ${name}`; mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled=false; mesh.count=0; mesh.castShadow=false; mesh.receiveShadow=name!=='eye';
    root.add(mesh); buckets[name]={mesh,count:0};
  }
  let seed=56431;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const palette=[0x9a7961,0x56726b,0x8e6050,0xb49d77,0x4c5d59,0x7b7771,0x745c62,0xa7a795];
  const skins=[0x9d6b4d,0xb98461,0x986449,0xc79773,0xae7655];
  const people=[];
  function person(i,x,z,hero='') {
    const female=hero==='sari'||(hero!=='damar'&&i%3===1);
    return {i,x,z,homeX:x,homeZ:z,targetX:x,targetZ:z,hero,female,
      yaw:hero==='sari'?0:hero?Math.PI:rand()*Math.PI*2,height:hero==='sari'?.96:hero==='damar'?1.04:.86+rand()*.23,
      wide:.9+rand()*.22,shirt:hero==='sari'?0xc9b692:hero==='damar'?0x6c827a:palette[i%palette.length],
      pants:hero==='sari'?0x5b4850:[0x414c49,0x574b3b,0x5f6558,0x4a4541][i%4],skin:skins[i%5],
      hair:[0x25241e,0x312d26,0x302b24][i%3],hat:hero==='damar'?1:hero==='sari'?0:i%6===0?2:i%5===0?1:0,
      bag:i%4===0||hero==='sari',phase:rand()*6.28,walk:0,speed:0,activity:i%5,
      age:0,next:rand()*4,react:.2+rand()*2.8,mode:'routine',tier:'near',waypoints:null,waypoint:0};
  }
  people.push(person(0,-6,10,'sari'),person(1,6,-42,'damar'));
  // Family is visible beside the courtyard before danger; the player's help
  // later moves the same people, rather than spawning an abstract reward.
  people.push(person(2,-15.5,-11.6),person(3,-15.8,-12.6),person(4,-15.1,-12.1));
  people[4].height=.66;people[4].wide=.88;
  for(let i=5;i<56;i++) {
    const north=i%3===0;
    const p=person(i,(rand()-.5)*(north?13:12),north?-43-rand()*19:25-rand()*45);
    if(!north&&i%5===0){p.homeX=p.x=i%2?-6.8:6.8;p.targetX=p.x;}
    people.push(p);
  }
  const actors={sari:people[0],damar:people[1]};
  // Distant people are textured cards. Their seeded identities remain stable at tier changes.
  const atlas=document.createElement('canvas');atlas.width=512;atlas.height=256;
  const ctx=atlas.getContext('2d');
  for(let i=0;i<8;i++) {
    const cx=i*64+32;ctx.fillStyle=`#${palette[i].toString(16)}`;
    ctx.beginPath();ctx.moveTo(cx-11,63);ctx.quadraticCurveTo(cx,55,cx+11,63);ctx.lineTo(cx+13,142);ctx.lineTo(cx-13,142);ctx.closePath();ctx.fill();
    ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(cx-9,69);ctx.lineTo(cx-17,127);ctx.moveTo(cx+9,69);ctx.lineTo(cx+18,127);ctx.stroke();
    ctx.strokeStyle='#41483d';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(cx-6,140);ctx.lineTo(cx-9,214);ctx.moveTo(cx+6,140);ctx.lineTo(cx+9,214);ctx.stroke();
    ctx.fillStyle='#aa7956';ctx.beginPath();ctx.ellipse(cx,45,10,14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2b2c24';ctx.beginPath();ctx.ellipse(cx,35,11,7,0,Math.PI,Math.PI*2);ctx.fill();
  }
  const texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;
  const farGeometry=new THREE.PlaneGeometry(.56,1.8),farFrames=new THREE.InstancedBufferAttribute(new Float32Array(MAX),1);farGeometry.setAttribute('aFrame',farFrames);
  const farMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.15,side:THREE.DoubleSide,depthWrite:true,color:0xa7a89c});
  farMaterial.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float aFrame; varying float vFrame;').replace('#include <begin_vertex>','vFrame=aFrame;\n#include <begin_vertex>');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFrame;').replace('#include <map_fragment>',`#ifdef USE_MAP
      vec4 sampledDiffuseColor=texture2D(map,vec2((vMapUv.x+vFrame)/8.,vMapUv.y));
      diffuseColor*=sampledDiffuseColor;
      #endif`);
  };
  const farCards=new THREE.InstancedMesh(farGeometry,farMaterial,MAX);farCards.count=0;farCards.frustumCulled=false;farCards.name='distant-civilian-atlas';root.add(farCards);
  const stats={population:people.length,near:0,mid:0,far:0,hidden:0,drawCalls:Object.keys(buckets).length};
  function add(name,position,scale,col,rotation=null) {
    const b=buckets[name],index=b.count++;
    dummy.position.set(...position);dummy.scale.set(...scale);dummy.quaternion.identity();
    if(rotation)dummy.rotation.set(...rotation);
    dummy.updateMatrix();local.copy(dummy.matrix);matrix.multiplyMatrices(world,local);
    b.mesh.setMatrixAt(index,matrix);color.setHex(col);b.mesh.setColorAt(index,color);
  }
  function segment(a,b,radius,col) {
    v.set(...a);v2.set(...b);const len=v.distanceTo(v2);quat.setFromUnitVectors(up,v2.sub(v).normalize());
    dummy.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);
    dummy.quaternion.copy(quat);dummy.scale.set(radius,len,radius);dummy.updateMatrix();
    matrix.multiplyMatrices(world,dummy.matrix);
    const bucket=buckets.limb,i=bucket.count++;bucket.mesh.setMatrixAt(i,matrix);color.setHex(col);bucket.mesh.setColorAt(i,color);
  }
  function draw(p,t) {
    dummy.position.set(p.x,0,p.z);dummy.rotation.set(0,p.yaw,0);dummy.scale.set(p.height*p.wide,p.height,p.height);dummy.updateMatrix();world.copy(dummy.matrix);
    const stride=Math.min(1,p.walk),cycle=p.phase,panic=p.mode==='fleeing';
    const crouched=p.mode==='cover'&&!p.hero;
    const bob=Math.abs(Math.sin(cycle*2))*.018*stride-(crouched?.28:0),lean=panic?.09:crouched?.12:0;
    const folding=p.hero==='sari'&&!current.flags?.sariWarned&&current.stage==='sari'&&stride<.1;
    const carrying=p.i===2&&((current.helpProgress||0)>.15||current.flags?.rescued);
    const gesturing=p.activity===0&&!p.hero&&p.mode==='routine'&&stride<.1;

    add('shadow',[0,.014,0],[1,1,1],0x202820);
    add('torso',[0,.88+bob,lean],[1,1,1],p.shirt,[panic?.1:0,Math.sin(cycle)*.015*stride,0]);
    add('collar',[0,1.345+bob,.012],[1,1,1],0xe4dbc5,[Math.PI/2,0,0]);
    if(p.female)add('skirt',[0,.54+bob*.5,0],[1,1,1],p.pants,[0,0,Math.sin(cycle)*.025*stride]);
    for(let side=-1;side<=1;side+=2) {
      const phase=cycle+(side===1?Math.PI:0),s=Math.sin(phase),c=Math.cos(phase);
      const ankleZ=-s*.23*stride,ankleY=.09+Math.max(0,c)*.13*stride;
      const hip=[side*.105,.91+bob,0],ankle=[side*.105,ankleY,ankleZ];
      const knee=[side*.11,(hip[1]+ankleY)/2+.01,(ankleZ*.5)+Math.max(0,c)*.15*stride+(crouched?.2:0)];
      if(!p.female){segment(hip,knee,.085,p.pants);segment(knee,ankle,.065,p.pants);}
      else segment([side*.1,.3,ankleZ*.3],ankle,.055,p.skin);
      add('shoe',[side*.105,ankleY-.025,ankleZ+.04],[.071,.045,.132],0x34352c,[Math.max(0,-c)*.12*stride,0,0]);
      const shoulder=[side*.205,1.245+bob,.015+lean],armSwing=s*.22*stride;
      const shielding=(p.mode==='alert'||p.mode==='cover')&&side===1;
      let elbow=[side*(shielding?.26:.24),shielding?1.26+bob:1.02+bob,shielding?.19:armSwing*.4];
      let wrist=[side*(shielding?.12:.245),shielding?1.48+bob:.82+bob,shielding?.15:armSwing];
      if(folding||carrying){elbow=[side*.22,1.10+bob,.19];wrist=[side*.16,.99+bob+(folding?Math.sin(t*1.6+side*.5)*.035:0),.40];}
      if(gesturing&&side===1){elbow=[.3,1.13,.12];wrist=[.35+Math.sin(t*1.2+p.i)*.08,1.25,.25];}
      if(p.hero==='damar'&&current.flags?.notebookPassed&&side===1){elbow=[.2,1.08,.18];wrist=[.16,1.04,.35];}

      segment(shoulder,elbow,.066,p.shirt);segment(elbow,wrist,.045,p.skin);
      add('hand',wrist,[.043,.06,.035],p.skin,[0,0,side*.15]);
    }
    const headY=1.51+bob;
    add('head',[0,headY,.025+lean],[.115,.151,.105],p.skin);
    add('hair',[0,headY+.085,.005+lean],[.12,.09,.11],p.hair);
    if(p.female)add('hair',[0,headY+.065,-.105+lean],[.075,.065,.06],p.hair);
    if(p.tier==='near'){
      add('head',[0,headY-.003,.127+lean],[.022,.034,.035],p.skin);
      for(const side of[-1,1])add('head',[side*.111,headY,.02+lean],[.023,.039,.025],p.skin);
      add('eye',[0,headY-.073,.119+lean],[.025,.005,.004],0x68473a);
      for(const side of[-1,1])add('eye',[side*.043,headY+.04,.115+lean],[.026,.004,.004],p.hair,[0,0,side*.12]);
    }
    if(p.female&&p.i%2===0)add('shawl',[0,1.24+bob,.015],[1,.8,1],0x9c8162,[0,0,.1]);
    if(p.bag&&!folding&&!carrying)add('basket',[.27,.78+bob,.03],[1,1.1,1],0x9d865a);
    if(carrying)add('bundle',[0,.99+bob,.40],[1,1,1],current.flags?.clothSaved===false?0x6f5141:0xffffff);
    if(p.hero==='damar'&&current.flags?.notebookPassed)add('book',[.16,1.03+bob,.38],[1,1,1],0xc3aa7b,[0,.3,0]);
    if(p.hat===1)add('peci',[0,headY+.128,.006+lean],[1,1,1],0x292e29);
    if(p.hat===2)add('straw',[0,headY+.135,.01+lean],[1,1,1],0xb7a36d);
    const blink=Math.sin(t*1.7+p.i*1.13)> .992;
    if(p.tier==='near')for(const side of[-1,1]) {
      add('eye',[side*.041,headY+.017,.118+lean],[.019,blink?.002:.011,.009],0xe6dac6);
      add('eye',[side*.041,headY+.017,.125+lean],[.008,blink?.002:.009,.004],0x302b21);
    }
  }
  function routeTo(p,waypoints){p.waypoints=waypoints;p.waypoint=0;}
  function move(p,dt,time,event,player) {
    p.age+=dt;
    const alert=event==='warning'||event==='impact'||event==='aftermath';
    if(alert&&!p.sensed){p.sensed=true;p.respondAt=p.age+p.react;}
    if(alert&&p.mode==='routine'&&p.age>p.respondAt){p.mode=event==='warning'?'alert':'fleeing';p.next=p.age+.4+p.react;}
    // Every blast gets a fresh seeded response window. A long earlier warning
    // must not make all civilians run on the first frame of the next blast.
    const impactNumber=current.flags?.returnImpact?2:current.flags?.impact?1:0;
    if(p.i>4&&impactNumber>(p.respondedImpact||0)){p.respondedImpact=impactNumber;p.blastRespondAt=p.age+p.react;p.mode='alert';}
    if(p.mode==='alert'&&event!=='warning'&&impactNumber>0&&p.age>(p.blastRespondAt??Infinity))p.mode=p.i%6===0?'cover':'fleeing';
    if(p.i>=2&&p.i<=4){
      const help=current.flags?.rescued?1:current.helpKind==='help'?Math.max(0,Math.min(1,current.helpProgress||0)):0;
      p.x=p.homeX-help*(3.2+(p.i-2)*.12);p.z=p.homeZ+help*(p.i===3?.5:p.i===4?-.2:0);
      p.walk=help>0&&help<1?1:0;p.phase+=dt*(p.walk?5:0);p.yaw=help>0?-Math.PI/2:Math.PI/2;
      p.mode=help>=1?'routine':alert?'cover':'routine';return;
    }
    if(p.hero) {
      if(p.hero==='sari'&&(current.flags?.sariWarned||current.flags?.impact)&&!p.warned){p.warned=true;routeTo(p,[[-5,9],[-5,-14],[-19,-14]]);}
      if(p.hero==='damar'&&['shelter','handoff','ending','afterword'].includes(current.stage)&&!p.relocated){
        p.relocated=true;routeTo(p,[[1,-42],[1,-20],[-12,-15]]);
        // Preserve an interaction's required position when the player completes the return first.
      }
      if(!p.waypoints){p.walk*=Math.exp(-dt*8);p.yaw+=Math.atan2(Math.sin(Math.atan2(player.x-p.x,player.z-p.z)-p.yaw),Math.cos(Math.atan2(player.x-p.x,player.z-p.z)-p.yaw))*Math.min(1,dt*.7);return;}
    }
    if(p.waypoints) {
      const wp=p.waypoints[p.waypoint];p.targetX=wp[0];p.targetZ=wp[1];
      if(Math.hypot(p.targetX-p.x,p.targetZ-p.z)<.3){p.waypoint++;if(p.waypoint>=p.waypoints.length){p.waypoints=null;p.walk=0;p.mode='cover';return;}}
    } else if(p.mode==='fleeing') {
      const north=p.homeZ<-38;
      p.targetX=p.homeX<0?-7.2:7.2;p.targetZ=north?-56-p.i%5:-10+p.i%9*3;
      if(Math.hypot(p.targetX-p.x,p.targetZ-p.z)<.4){p.mode='cover';p.walk=0;return;}
    } else if(p.mode==='cover'||p.mode==='alert'){p.walk*=Math.exp(-dt*8);return;}
    else if(p.activity===0&&p.i%3!==0){
      p.walk*=Math.exp(-dt*8);p.yaw=p.homeX<0?Math.PI/2:-Math.PI/2;return;
    }
    else if(p.age>p.next){
      p.targetZ=Math.max(p.homeZ<-38?-62:-18,Math.min(p.homeZ<-38?-42:27,p.homeZ+Math.sin(time*.2+p.i)*7));
      p.targetX=Math.max(-6.5,Math.min(6.5,p.homeX+Math.cos(time*.3+p.i)*2));p.next=p.age+5+p.i%7;
    }
    const dx=p.targetX-p.x,dz=p.targetZ-p.z,d=Math.hypot(dx,dz),wants=d>.22;
    const speed=p.mode==='fleeing'?2.8:p.hero?(current.flags?.impact?2.7:1.7):.65+(p.i%5)*.11;
    p.speed+=(wants?speed-p.speed:-p.speed)*Math.min(1,dt*5);
    if(wants){const step=Math.min(d,p.speed*dt);p.x+=dx/d*step;p.z+=dz/d*step;const target=Math.atan2(dx,dz);p.yaw+=Math.atan2(Math.sin(target-p.yaw),Math.cos(target-p.yaw))*Math.min(1,dt*7);}
    p.walk+=(wants?1-p.walk:-p.walk)*Math.min(1,dt*7);p.phase+=dt*p.speed*6.5;
  }
  let current={},tick=0;
  function update(dt,time,state={},player={x:0,z:24}) {
    current=state;tick++;
    for(const b of Object.values(buckets))b.count=0;
    stats.near=stats.mid=stats.far=stats.hidden=0;let farCount=0;
    const maxPopulation=quality==='low'?40:quality==='high'?56:48;
    for(const p of people) {
      const distance=Math.hypot(p.x-player.x,p.z-player.z);
      if(p.i>=maxPopulation){stats.hidden++;continue;}
      p.tier=distance<(quality==='low'?14:22)||p.hero?'near':distance<42?'mid':'far';
      // Accumulate elapsed simulation time for throttled far agents; no frame-rate-dependent speed.
      p.pending=(p.pending||0)+dt;
      if(p.tier==='near'||tick%(p.tier==='mid'?3:6)===p.i%(p.tier==='mid'?3:6)){move(p,p.pending,time,state.event||'quiet',player);p.pending=0;}
      if(distance>82){stats.hidden++;continue;}
      stats[p.tier]++;
      if(p.tier==='far'){
        dummy.position.set(p.x,.9*p.height,p.z);dummy.rotation.set(0,Math.atan2(player.x-p.x,player.z-p.z),0);dummy.scale.setScalar(p.height);dummy.updateMatrix();farCards.setMatrixAt(farCount,dummy.matrix);farFrames.array[farCount++]=p.i%8;
      } else {draw(p,time);}
    }
    farCards.count=farCount;farCards.instanceMatrix.needsUpdate=true;farFrames.needsUpdate=true;
    stats.drawCalls=Object.values(buckets).filter(b=>b.count>0).length+(farCount?1:0);
    for(const b of Object.values(buckets)){
      b.mesh.count=b.count;b.mesh.instanceMatrix.needsUpdate=true;
      if(b.mesh.instanceColor)b.mesh.instanceColor.needsUpdate=true;
    }
  }
  return {update,setQuality(q){quality=q;},stats,actors,root,
    restore(state,player){
      // Boot-only logical recovery. Ordinary play always uses the visible paths.
      const returned=['handoff','ending','afterword'].includes(state?.stage)||(state?.stage==='shelter'&&(player?.z??-65)>-20);
      if(returned){for(const [p,x,z] of [[people[0],-19,-14],[people[1],-12,-15]]){p.x=x;p.z=z;p.targetX=x;p.targetZ=z;p.waypoints=null;p.waypoint=0;p.walk=0;p.speed=0;p.warned=true;p.relocated=true;p.mode='cover';}}
    },
    reset(){for(const p of people){p.x=p.homeX;p.z=p.homeZ;p.targetX=p.homeX;p.targetZ=p.homeZ;p.waypoints=null;p.waypoint=0;p.warned=false;p.relocated=false;p.mode='routine';p.walk=0;p.speed=0;p.age=0;p.next=p.i%5;p.pending=0;p.sensed=false;p.respondAt=0;p.respondedImpact=0;p.blastRespondAt=Infinity;p.yaw=p.hero==='sari'?0:p.hero?Math.PI:p.yaw;}},
    dispose(){scene.remove(root);for(const b of Object.values(buckets))b.mesh.geometry.dispose();farGeometry.dispose();farMaterial.dispose();material.dispose();bundleMaterial.dispose();shadowMaterial.dispose();texture.dispose();}};
}
