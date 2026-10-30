/**
 * Jejaka — authored playable street. Architectural completion, time of day,
 * signage and damage are production fiction, not archival reconstruction.
 * No network assets. Canvas materials are deterministic original artwork.
 */
export function createWorld(THREE, scene, { quality = 'balanced' } = {}) {
  const root = new THREE.Group(); root.name = 'authored-surabaya-slice'; scene.add(root);
  const colliders = [], cover = [], batches = new Map(), textures = [], details = [], distanceBatches = [];
  let batchLayer = 'structure';
  const rand = (() => { let n=1945; return () => {n=(n*1664525+1013904223)>>>0;return n/4294967296;}; })();
  const v = new THREE.Vector3(), q = new THREE.Quaternion(), scale = new THREE.Vector3(), matrix = new THREE.Matrix4();
  const boxGeo = new THREE.BoxGeometry(1,1,1), cylGeo = new THREE.CylinderGeometry(1,1,1,10), sphereGeo = new THREE.SphereGeometry(1,10,7);
  const mats = {};
  function material(name,color,roughness=0.88,map=null) {return mats[name] = new THREE.MeshStandardMaterial({color,roughness,map});}
  function canvasTexture(kind) {
    const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');
    const palette={textile:'#292f39',plaster:'#aa987b',wood:'#66503b',roof:'#744735',paving:'#686457',cloth:'#9b8457',brick:'#8c5c43'};
    ctx.fillStyle=palette[kind]||'#777';ctx.fillRect(0,0,512,512);
    for(let i=0;i<15000;i++){const lum=rand()>.5?255:0;ctx.fillStyle=`rgba(${lum},${lum},${lum},${.01+rand()*.04})`;ctx.fillRect(rand()*512,rand()*512,1+rand()*8,1+rand()*4);}
    if(kind==='plaster') {for(let i=0;i<50;i++){ctx.fillStyle=`rgba(45,35,20,${rand()*.08})`;ctx.fillRect(rand()*512,rand()*512,rand()*80,rand()*120);} const g=ctx.createLinearGradient(0,0,0,512);g.addColorStop(0,'rgba(25,20,10,.02)');g.addColorStop(.75,'rgba(30,25,10,.02)');g.addColorStop(1,'rgba(25,20,10,.32)');ctx.fillStyle=g;ctx.fillRect(0,0,512,512);}
    if(kind==='wood'){for(let i=0;i<16;i++){ctx.fillStyle='rgba(12,10,5,.26)';ctx.fillRect(i*32,0,2,512);for(let j=0;j<6;j++){ctx.strokeStyle='rgba(17,10,4,.16)';ctx.beginPath();ctx.moveTo(i*32+5+j*4,0);ctx.bezierCurveTo(i*32+12,140,i*32+24,290,i*32+j*4+8,512);ctx.stroke();}}}
    if(kind==='paving'){for(let y=0;y<16;y++){for(let x=-1;x<9;x++){const xx=x*64+(y%2)*32,yy=y*32;ctx.fillStyle=`rgba(${rand()>.5?'165,155,130':'28,31,27'},${.12+rand()*.16})`;ctx.fillRect(xx+2,yy+2,61,29);ctx.strokeStyle='rgba(16,20,16,.35)';ctx.strokeRect(xx+1,yy+1,63,31);}}}
    if(kind==='roof'||kind==='brick'){for(let y=0;y<16;y++){for(let x=-1;x<9;x++){ctx.strokeStyle='rgba(24,15,9,.44)';ctx.lineWidth=3;ctx.strokeRect(x*64+(y%2)*32,y*32,64,32);ctx.fillStyle='rgba(215,160,100,.09)';ctx.fillRect(x*64+(y%2)*32+3,y*32+2,58,4);}}}
    if(kind==='textile'){ctx.fillStyle='#b78f57';for(let y=18;y<512;y+=64)for(let x=18;x<512;x+=64){ctx.save();ctx.translate(x+(y%128?0:32),y);ctx.rotate(Math.PI/4);ctx.strokeStyle='#b89463';ctx.lineWidth=3;ctx.strokeRect(-15,-15,30,30);ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.strokeStyle='#d3b780';ctx.lineWidth=7;ctx.strokeRect(8,8,496,496);}
    if(kind==='cloth'){for(let x=0;x<512;x+=64){ctx.fillStyle=x%128?'rgba(50,51,33,.43)':'rgba(222,194,138,.2)';ctx.fillRect(x,0,32,512);}for(let y=0;y<512;y+=3){ctx.fillStyle='rgba(0,0,0,.04)';ctx.fillRect(0,y,512,1);}}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;textures.push(t);return t;
  }
  const plasterTex=canvasTexture('plaster'), woodTex=canvasTexture('wood'), roofTex=canvasTexture('roof'), pavingTex=canvasTexture('paving'), clothTex=canvasTexture('cloth'), brickTex=canvasTexture('brick'), textileTex=canvasTexture('textile');
  material('sand',0xd8c9a9,.95,plasterTex);material('ivory',0xe0d2af,.94,plasterTex);material('sage',0x8b9987,.95,plasterTex);material('ochre',0xd0ab70,.94,plasterTex);material('faded',0xa2b0aa,.95,plasterTex);material('darkPlaster',0x7e7766,.96,plasterTex);
  material('wood',0xc2ac89,.89,woodTex);material('darkwood',0x574432,.92,woodTex);material('redwood',0x803c2c,.8,woodTex);material('roof',0xc68c68,.92,roofTex);material('paving',0xaaa28d,.97,pavingTex);material('brick',0xc7a182,.93,brickTex);material('black',0x252b26,.95);material('metal',0x3d443e,.67);material('rust',0x9e4932,.79);material('trim',0xd0c8ae,.88);material('cloth',0xd0b885,1,clothTex);material('greencloth',0x6b7b61,1,clothTex);material('earth',0x6f7159,1);material('leaves',0x3d5140,.93);material('leavesLight',0x6e7950,.9);material('pots',0xa36a48,.98);material('sack',0xa59772,1);material('fruit',0xc4963f,.8);material('fruitGreen',0x738248,.85);material('paper',0xc5ba9b,1);
  for(const key of ['sand','ivory','sage','ochre','faded','darkPlaster']) {mats[key].bumpMap=plasterTex;mats[key].bumpScale=.035;}
  mats.wood.bumpMap=woodTex;mats.wood.bumpScale=.018;mats.roof.bumpMap=roofTex;mats.roof.bumpScale=.04;mats.paving.bumpMap=pavingTex;mats.paving.bumpScale=.025;
  scene.userData.jejakaTextileTexture=textileTex;
  material('textile',0xffffff,1,textileTex);material('scorchedTextile',0x6f5141,1,textileTex);material('brass',0xad9156,.53);
  mats.glass=new THREE.MeshStandardMaterial({color:0x1c2725,roughness:.25,metalness:.2});mats.lamp=new THREE.MeshBasicMaterial({color:0xffc477});mats.shadow=new THREE.MeshBasicMaterial({color:0x222c25,transparent:true,opacity:.24,depthWrite:false});
  function shape(type,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0) {
    // Keep instance bounds local enough for Three's actual frustum culling.
    // Very long river/ground members remain conservative structural batches.
    const cell = batchLayer==='structure'?'resident':z<-38?'north':'south';
    const key=type+':'+mat+':'+cell+':'+batchLayer;
    if(!batches.has(key))batches.set(key,{type,mat,cell,layer:batchLayer,items:[]});
    q.setFromEuler(new THREE.Euler(rx,ry,rz));v.set(x,y,z);scale.set(sx,sy,sz);matrix.compose(v,q,scale);batches.get(key).items.push(matrix.clone());
  }
  const box=(mat,x,y,z,sx,sy,sz,ry=0)=>shape('box',mat,x,y,z,sx,sy,sz,0,ry,0);
  const cyl=(mat,x,y,z,r,h,ry=0)=>shape('cyl',mat,x,y,z,r,h,r,0,ry,0);
  function collider(minX,maxX,minZ,maxZ){colliders.push({minX,maxX,minZ,maxZ});}
  const labelAtlas=document.createElement('canvas');labelAtlas.width=2048;labelAtlas.height=1024;
  const labelContext=labelAtlas.getContext('2d'),labelTexture=new THREE.CanvasTexture(labelAtlas);
  labelTexture.colorSpace=THREE.SRGBColorSpace;textures.push(labelTexture);
  const labelMaterial=new THREE.MeshStandardMaterial({map:labelTexture,roughness:.94});let labelCount=0;
  function label(text,w=4,h=.7,bg='#3a493e',fg='#d3c3a4') {
    const index=labelCount++,xx=(index%4)*512,yy=Math.floor(index/4)*128,ctx=labelContext;
    ctx.fillStyle=bg;ctx.fillRect(xx,yy,512,128);ctx.strokeStyle=fg;ctx.lineWidth=2;ctx.strokeRect(xx+7,yy+7,498,114);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 38px Georgia';ctx.fillText(text,xx+256,yy+66,475);
    labelTexture.needsUpdate=true;
    const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
    for(let i=0;i<uv.count;i++){uv.setX(i,(xx+uv.getX(i)*512)/2048);uv.setY(i,1-(yy+(1-uv.getY(i))*128)/1024);}
    const mesh=new THREE.Mesh(g,labelMaterial);mesh.userData.isLabel=true;return mesh;
  }
  // The skyline and sun are purely authored atmosphere; they do not date the episode.
  scene.background=new THREE.Color(0x9b9c86);scene.fog=new THREE.FogExp2(0x9b9c86,.009);
  const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color(0x465d65)},bottom:{value:new THREE.Color(0xc8b486)}},vertexShader:'varying vec3 wp;void main(){wp=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 wp;uniform vec3 top;uniform vec3 bottom;void main(){float h=clamp(normalize(wp).y*1.7,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.65)),1.);}'});
  root.add(new THREE.Mesh(new THREE.SphereGeometry(180,48,24),skyMat));
  const hemi=new THREE.HemisphereLight(0xc4d2cc,0x443b32,1.45);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffd2a0,3.8);sun.position.set(-35,48,-55);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-43,right:43,top:45,bottom:-45,near:1,far:160});sun.shadow.bias=-.00035;sun.shadow.normalBias=.035;sun.target.position.set(0,0,-12);scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight(0x8bafbd,.48);fill.position.set(20,12,20);scene.add(fill);
  // Ground has no height jumps. The river is excluded from walkable collision.
  const groundMat=mats.paving.clone();groundMat.map=pavingTex.clone();groundMat.map.repeat.set(15,24);textures.push(groundMat.map);
  const groundSouth=new THREE.Mesh(new THREE.PlaneGeometry(120,65),groundMat);groundSouth.rotation.x=-Math.PI/2;groundSouth.position.set(0,-.025,8.5);groundSouth.receiveShadow=true;root.add(groundSouth);
  const groundNorth=new THREE.Mesh(new THREE.PlaneGeometry(120,72),groundMat);groundNorth.rotation.x=-Math.PI/2;groundNorth.position.set(0,-.025,-74);groundNorth.receiveShadow=true;root.add(groundNorth);
  box('earth',0,-1.45,-31,230,1.9,14);
  const waterMat=new THREE.ShaderMaterial({transparent:true,uniforms:{time:{value:0},color:{value:new THREE.Color(0x496154)}},vertexShader:'varying vec3 wp;uniform float time;void main(){vec3 p=position;p.z+=sin(p.x*.7+time*.5)*.035+sin(p.y*2.+time)*.02;wp=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'varying vec3 wp;uniform float time;uniform vec3 color;void main(){float r=sin(wp.x*2.2+wp.y*4.+sin(wp.x*.2+time*.4)*3.+time)*.5+.5;float g=pow(max(0.,sin(wp.x*.15+wp.y*1.7+time*.2)),14.);gl_FragColor=vec4(color+vec3(r*.035+g*.11,r*.04+g*.075,r*.027+g*.035),.94);}'});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(230,14,90,12),waterMat);water.rotation.x=-Math.PI/2;water.position.set(0,-.85,-31);root.add(water);
  for(const z of [-23.6,-38.4]) {box('brick',0,-.85,z,115,1.7,.6);box('trim',0,.02,z,115,.2,.8);}
  // Low red steel bridge, keeping the eye-level route at ground zero.
  box('darkwood',0,-.18,-31,10,.35,15.4);
  for(let z=-38.5;z<-23.5;z+=.48)box('wood',0,.005,z,9.7,.055,.42);
  for(const x of [-5,5]){
    box('rust',x,.96,-31,.15,.15,15.3);box('rust',x,.3,-31,.16,.16,15.3);box('redwood',x,1.29,-31,.22,.13,15.4);
    for(let z=-38.5;z<=-23.5;z+=2.5){box('rust',x,.7,z,.2,1.5,.22);shape('box','rust',x,.66,z+1.2,.1,.12,2.7,.45,0,0);shape('box','rust',x,.66,z+1.2,.1,.12,2.7,-.45,0,0);}
    collider(x-.16,x+.16,-38.7,-23.4);
  }
  collider(-29,-5.25,-38,-24);collider(5.25,29,-38,-24);
  for(const x of [-5.3,5.3])for(const z of [-39,-23]){box('brick',x,.8,z,.7,1.6,.7);box('trim',x,1.63,z,.86,.12,.86);}
  // Pavement, drains, and interrupted stone edges give the street human scale.
  for(const x of [-8.4,8.4]) {box('trim',x,.015,3,1.1,.08,46);box('darkwood',x+(x<0?.8:-.8),-.015,3,.18,.02,46);for(let z=-18;z<28;z+=3.5)box('metal',x+(x<0?.7:-.7),.018,z,.2,.025,.65);}
  const buildingMats=['ivory','sage','sand','ochre','faded'];
  function shop(side,z,index,depth=13,width=10) {
    const previousLayer=batchLayer; batchLayer='structure';
    const inside=side*10.6, cx=side*(10.6+depth/2), h=6.4+(index%3)*.8, facade=buildingMats[(index+(side>0?2:0))%buildingMats.length];
    box(facade,cx,h/2,z,depth,h,width);
    collider(side<0?cx-depth/2:inside,side<0?inside:cx+depth/2,z-width/2,z+width/2);
    const face=inside-side*.035, behind=inside+side*.04;
    batchLayer='detail';
    box('darkwood',face,1.5,z,.08,2.9,width-.7);
    // Recessed shop aperture, lit slices, timber shutters and sturdy columns.
    for(const dz of [-3.5,0,3.5]) {
      box('black',face-side*.04,1.5,z+dz,.12,2.65,2.8);
      box('wood',face-side*.10,1.5,z+dz-1.4,.18,2.8,.15);box('wood',face-side*.10,1.5,z+dz+1.4,.18,2.8,.15);
      if(dz!==0){box('wood',face-side*.16,1.45,z+dz,.12,2.6,1.95);for(let k=-4;k<5;k++)box('darkwood',face-side*.24,1.4,z+dz+k*.2,.06,2.45,.035);}
      else {box('lamp',behind+side*.22,2.4,z+dz,.05,.09,1.3);box('sack',face+.08*side,.45,z+dz,1,.8,1.4);}
    }
    for(const dz of [-width/2+.2,width/2-.2]){box('trim',face-side*.1,1.8,z+dz,.36,3.65,.38);box('trim',face-side*.2,.2,z+dz,.54,.4,.58);}
    box('trim',face-side*.1,3.2,z,.26,.3,width);box('trim',face-side*.12,h-.25,z,.3,.28,width+.4);
    for(const dz of [-2.7,2.7]){
      box('trim',face-side*.12,4.75,z+dz,.22,2.15,2.45);box('glass',face-side*.26,4.75,z+dz,.12,1.85,2.12);
      box('wood',face-side*.35,4.75,z+dz,.13,.1,2.1);box('wood',face-side*.35,4.75,z+dz,.13,1.86,.08);
      for(const sh of [-1,1])box(index%2?'sage':'darkwood',face-side*.37,4.75,z+dz+sh*1.35,.12,1.95,.48);
      box('trim',face-side*.4,3.72,z+dz,.55,.13,2.65);
    }
    // Coarse body and roof stay visible when facade detail is distance-culled.
    batchLayer='structure';
    box('darkwood',cx,h+.1,z,depth+.8,.22,width+.8);shape('box','roof',cx-side*depth*.245,h+.8,z,depth*.55,.15,width+1,0,0,side*.20);shape('box','roof',cx+side*depth*.245,h+.8,z,depth*.55,.15,width+1,0,0,-side*.20);
    box('roof',cx,h+1.37,z,.35,.25,width+1.1);
    batchLayer='detail';
    for(let zz=z-width/2;zz<=z+width/2;zz+=.45)box('roof',inside-side*.4,h+.23,zz,.55,.16,.25);
    const names=side<0?['WAROENG SARI','TOKO KELONTONG','PENJAHIT','KOPI & TEH']:['TOKO MERDEKA','RUMAH OBAT','PERNIAGAAN','TJOEKER'];
    const sign=label(names[index%4],Math.min(width-1,6.6),.7,index%2?'#6b3a2c':'#3b4b41');sign.rotation.y=side<0?Math.PI/2:-Math.PI/2;sign.position.set(face-side*.26,3.46,z);root.add(sign);details.push(sign);
    // Timber lean-to awning, fabric scallops, supports and tie cords.
    shape('box',index%2?'greencloth':'cloth',face-side*1.2,2.94,z,2.7,.065,width-.5,0,0,-side*.12);
    for(const dz of [-width/2+.5,width/2-.5]) {cyl('wood',face-side*2.35,1.4,z+dz,.055,2.8);box('darkwood',face-side*1.2,2.6,z+dz,2.5,.08,.08);}
    for(let zz=z-width/2+.3;zz<z+width/2-.2;zz+=.4)box(index%2?'greencloth':'cloth',face-side*2.45,2.68,zz,.08,.35,.39);
    // Occupied upper-floor balcony on alternating parcels.
    if(index%2===0){box('darkwood',face-side*.6,3.7,z,1.3,.12,6.3);box('wood',face-side*1.1,4.16,z,.08,.08,6.3);for(let zz=z-3;zz<z+3.1;zz+=.36)box('wood',face-side*1.1,3.94,zz,.06,.48,.06);}
    // Weather marks and lower courses, original authored set dressing.
    box('brick',face-side*.08,.19,z,.13,.37,width-.2);
    for(let i=0;i<5;i++){const zz=z-width*.4+rand()*width*.8;box('darkPlaster',face-side*.12,.7+rand()*.4,zz,.015,.18+rand()*.55,.18+rand()*.45);}
    batchLayer=previousLayer;
    return {inside,face,h};
  }
  shop(-1,21,1);shop(-1,9,0);shop(-1,-2,2);
  // Recessed shelter courtyard accessible from the left-hand alley.
  shop(-1,-19,3,11,5);shop(1,21,1);shop(1,9,0);shop(1,-3,2);shop(1,-15,3,13,10);
  for(const side of [-1,1]){shop(side,-46,side<0?0:2,12,9);shop(side,-58,side<0?2:1,12,11);}
  // Shelter: deep porch and a distinct warm entrance. No collider across its mouth.
  box('sage',-24,2,-12,1,4,10);box('ivory',-19.3,2,-17,10,4,.65);box('ivory',-19.3,2,-7,10,4,.65);box('darkwood',-19.5,4.05,-12,11,.25,10.5);
  collider(-24.5,-23.5,-17,-7);collider(-24,-14,-17.4,-16.65);collider(-24,-14,-7.35,-6.65);
  const shelterSign=label('TEMPAT BERLINDUNG',6,.6);shelterSign.rotation.y=Math.PI/2;shelterSign.position.set(-14.0,3.25,-12);root.add(shelterSign);
  box('darkwood',-22,.46,-12,1.1,.9,4);box('cloth',-21.98,.95,-12,1.15,.1,4.1);box('lamp',-23.35,2.7,-12,.08,.34,.22);
  const shelterLight=new THREE.PointLight(0xffbb6e,8,12,2);shelterLight.position.set(-20,2.4,-12);scene.add(shelterLight);
  cover.push({x:-18,z:-12,r:5},{x:-7.5,z:9,r:1.8},{x:7.5,z:-2,r:1.7},{x:-4.1,z:-26,r:1.4});
  function crate(x,z,s=1) {collider(x-s*.5,x+s*.5,z-s*.5,z+s*.5);cover.push({x,z,r:s*.8});box('wood',x,s*.5,z,s,s,s);for(const a of [-1,1]){box('darkwood',x+a*s*.44,s*.5,z,s*.08,s,.98*s);box('darkwood',x,s*.5,z+a*s*.44,s,.12*s,.08*s);}box('darkwood',x,s*.12,z,s,.07,s);box('darkwood',x,s*.88,z,s,.07,s);}
  function barrel(x,z,s=1) {collider(x-.4*s,x+.4*s,z-.4*s,z+.4*s);cover.push({x,z,r:.65*s});cyl('wood',x,.57*s,z,.4*s,1.12*s);for(const y of [.16,.93])cyl('metal',x,y*s,z,.415*s,.06*s);cyl('darkwood',x,1.14*s,z,.395*s,.025*s);}
  function sack(x,z,s=1){shape('sphere','sack',x,.34*s,z,.35*s,.5*s,.31*s);cyl('darkwood',x,.77*s,z,.09*s,.05*s);}
  function pot(x,z){cyl('pots',x,.23,z,.23,.44);cyl('earth',x,.45,z,.19,.03);for(let i=0;i<6;i++)shape('box',i%2?'leavesLight':'leaves',x+Math.sin(i)*.15,.7+rand()*.3,z+Math.cos(i)*.15,.1,.55,.04,0,i,.3+i*.3);}
  for(let side of [-1,1])for(let z=-17;z<26;z+=5.5){const x=side*(7.9+rand()*.6);if(side<0&&z<-6&&z>-18)continue;if(rand()<.5)crate(x,z,.6+rand()*.35);else barrel(x,z,.8);if(rand()<.6)sack(x-side*.65,z+.6,.9);if(rand()<.5)pot(x,z+1.5);}
  // Produce stall on the right, a handcart on the left, and washing overhead.
  box('darkwood',7.5,.78,16.2,1.8,.15,3.5);for(const x of [6.75,8.25])for(const z of [14.8,17.6])box('wood',x,.38,z,.1,.76,.1);
  for(let x=6.9;x<8.1;x+=.3)for(let z=14.9;z<17.5;z+=.32)shape('sphere',rand()<.4?'fruitGreen':'fruit',x,.98+rand()*.08,z,.13,.12,.13);
  barrel(6.8,19.4);crate(8.2,19.3,.9);
  const cart=new THREE.Group();cart.name='shortcut-cart';cart.position.set(-9,0,-7.7);root.add(cart);
  function cartPart(mat,x,y,z,sx,sy,sz){const m=new THREE.Mesh(boxGeo,mats[mat]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;cart.add(m);}
  cartPart('wood',0,.72,0,1.3,.17,2.15);cartPart('wood',-.67,1.03,0,.09,.58,2.2);cartPart('wood',.67,1.03,0,.09,.58,2.2);cartPart('wood',0,1.03,.98,1.4,.58,.09);cartPart('darkwood',-.47,.65,-1.65,.08,.08,1.9);cartPart('darkwood',.47,.65,-1.65,.08,.08,1.9);
  for(const x of [-.85,.85]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(.43,.045,6,16),mats.darkwood);wheel.rotation.y=Math.PI/2;wheel.position.set(x,.44,.2);cart.add(wheel);}
  cartPart('sack',0,1.15,0,.8,.7,1.3);
  const cartCollider={minX:-9.85,maxX:-8.15,minZ:-9,maxZ:-5.3};colliders.push(cartCollider);
  const cordGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10,5.4,18),new THREE.Vector3(0,4.75,18),new THREE.Vector3(10,5.4,18)]);root.add(new THREE.Line(cordGeo,new THREE.LineBasicMaterial({color:0x4e4937})));
  for(let i=0;i<6;i++)box(i%2?'cloth':'greencloth',-4+i*1.4,4.5,18,.85,1.2,.04);
  function lamp(x,z){cyl('metal',x,1.8,z,.055,3.6);box('metal',x,3.7,z,.37,.08,.37);box('lamp',x,3.46,z,.22,.36,.22);box('metal',x,3.25,z,.34,.06,.34);for(const dx of [-.14,.14])for(const dz of [-.14,.14])box('metal',x+dx,3.45,z+dz,.027,.4,.027);}
  for(const z of [24,1,-21,-40,-61])for(const side of [-1,1])lamp(side*(z<-21&&z>-40?5.8:7.3),z);
  for(const z of [1,-40]){const light=new THREE.PointLight(0xffbd72,4,10,2);light.position.set(-7.3,3.4,z);scene.add(light);}
  // Palm silhouettes and distant roofs place depth behind the playable block.
  function palm(x,z,h=12){shape('cyl','wood',x,h/2,z,.19,h,.19,0,0,.06);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;for(let j=0;j<3;j++){const r=1+j*.8;shape('box',j===0?'leavesLight':'leaves',x+Math.cos(a)*r,h+.4-j*.4,z+Math.sin(a)*r,.55,.08,2.2,.2,a+Math.PI/2,.12*j);}}}
  palm(-28,-23,13);palm(27,-41,15);palm(-30,21,14);palm(30,-61,12);
  for(let i=0;i<40;i++){const x=-130+i*6.7,h=5+rand()*8,z=i%2?-88:-105;box(i%3?'darkPlaster':'sage',x,h/2,z,5+rand()*5,h,7);shape('box','roof',x,h+.8,z,8,.2,8,0,0,.18);}
  // Fixed horizon card: safely beyond every reachable viewpoint. The player can
  // never approach its missing parallax. Foreground roofs remain real geometry.
  const skylineCanvas=document.createElement('canvas');skylineCanvas.width=2048;skylineCanvas.height=512;
  const skylineCtx=skylineCanvas.getContext('2d');
  for(let layer=0;layer<3;layer++){
    skylineCtx.fillStyle=['#7c8174','#70786c','#626e61'][layer];
    for(let x=-10;x<2048;){const w=25+rand()*70,h=55+rand()*160+layer*25,y=512-h;
      skylineCtx.fillRect(x,y,w,h);skylineCtx.beginPath();skylineCtx.moveTo(x-5,y);skylineCtx.lineTo(x+w*.5,y-14-rand()*24);skylineCtx.lineTo(x+w+5,y);skylineCtx.closePath();skylineCtx.fill();
      skylineCtx.fillStyle='rgba(190,174,125,.13)';for(let wx=x+8;wx<x+w-4;wx+=12)for(let wy=y+20;wy<495;wy+=21)skylineCtx.fillRect(wx,wy,4,7);
      skylineCtx.fillStyle=['#7c8174','#70786c','#626e61'][layer];x+=w-2;
    }
  }
  const skylineTexture=new THREE.CanvasTexture(skylineCanvas);skylineTexture.colorSpace=THREE.SRGBColorSpace;textures.push(skylineTexture);
  const skylineCard=new THREE.Mesh(new THREE.PlaneGeometry(320,38),new THREE.MeshBasicMaterial({map:skylineTexture,transparent:true,alphaTest:.04,depthWrite:false,color:0xc8c9b7,fog:true}));
  skylineCard.position.set(0,17,-120);skylineCard.name='north-horizon-2d';root.add(skylineCard);
  // Torn papers, wheel tracks and stones — instanced, not hundreds of draw calls.
  for(let i=0;i<100;i++){const x=-7+rand()*14,z=-19+rand()*48;box(i%4?'earth':'paper',x,.018,z,.04+rand()*.18,.008,.05+rand()*.25,rand()*6);}
  for(let z=-20;z<27;z+=.55)for(const x of [-1.8,-.5])box('darkPlaster',x,.003,z,.11,.006,.34);
  // Atmospheric smoke lives in effects.js; a second sprite layer here would
  // duplicate the same source and cost one draw per card.
  const smoke=[];
  crate(-3.5,-17,1.15);crate(3.5,-14,1.15);crate(-7.1,-43.4,1.45);
  cover.push({minX:-9.5,maxX:-5.5,minZ:-43,maxZ:-40.7});
  // Batch all rigid geometry by material/type. No material-per-prop explosion.
  let instanceCount=0;
  for(const {type,mat,cell,layer,items} of batches.values()){
    const geo=type==='box'?boxGeo:type==='cyl'?cylGeo:sphereGeo;
    const mesh=new THREE.InstancedMesh(geo,mats[mat],items.length);items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=mat!=='lamp'&&mat!=='glass'&&mat!=='leaves';mesh.receiveShadow=true;mesh.computeBoundingSphere();mesh.computeBoundingBox();mesh.name='street-'+cell+'-'+layer+'-'+type+'-'+mat;root.add(mesh);instanceCount+=items.length;
    if(layer==='detail')distanceBatches.push({mesh,visible:true});
  }
  // A small-prop cell layer provides genuine distance culling with hysteresis.
  // Rigid batched street architecture remains conservative to avoid visibility holes.
  const detailCells=[];
  for(let zi=-60;zi<30;zi+=15){
    const cell=new THREE.InstancedMesh(boxGeo,mats.earth,8);cell.position.set(0,0,zi+7.5);cell.name='detail-cell-'+zi;
    for(let i=0;i<8;i++){q.setFromAxisAngle(new THREE.Vector3(0,1,0),rand()*6);v.set(-6+rand()*12,.025,-6+rand()*12);scale.set(.12+rand()*.3,.05,.16+rand()*.3);matrix.compose(v,q,scale);cell.setMatrixAt(i,matrix);}
    cell.computeBoundingSphere();root.add(cell);detailCells.push({cell,visible:true});
  }
  const sariShutter = new THREE.Group(); sariShutter.name='sari-closing-shutter'; sariShutter.position.set(-10.29,0,9);root.add(sariShutter);
  for(let i=0;i<10;i++){const slat=new THREE.Mesh(new THREE.BoxGeometry(.12,2.6,.25),mats.wood);slat.position.set(0,1.45,-1.2+i*.265);slat.castShadow=true;sariShutter.add(slat);}sariShutter.visible=false;
  const shelterDoor=new THREE.Group();shelterDoor.name='shelter-side-door';shelterDoor.position.set(-22.9,0,-12);root.add(shelterDoor);
  const door=new THREE.Mesh(new THREE.BoxGeometry(.12,2.6,1.5),mats.darkwood);door.position.set(0,1.35,.75);shelterDoor.add(door);
  // Original patterned cloth is an authored family possession, not a copied
  // historical motif. The folding table makes the ordinary practice visible.
  const foldingTable=new THREE.Group();foldingTable.name='sari-folding-table';root.add(foldingTable);
  function prop(group,mat,x,y,z,sx,sy,sz){const m=new THREE.Mesh(boxGeo,mats[mat]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
  prop(foldingTable,'wood',-6,.80,10.8,1.8,.12,.68);
  collider(-6.9,-5.1,10.46,11.14);
  for(const x of [-6.75,-5.25])prop(foldingTable,'darkwood',x,.4,10.8,.08,.8,.5);
  const foldLeaf=prop(foldingTable,'textile',-6,.88,10.78,1.45,.035,.65);
  const waxBowl=new THREE.Mesh(new THREE.CylinderGeometry(.12,.09,.09,12),mats.brass);waxBowl.position.set(-5.35,.90,10.8);foldingTable.add(waxBowl);
  const cantingHandle=prop(foldingTable,'wood',-5.6,.91,10.65,.26,.025,.025);cantingHandle.rotation.y=.6;
  const cantingCup=new THREE.Mesh(new THREE.SphereGeometry(.035,8,5),mats.brass);cantingCup.position.set(-5.48,.92,10.57);foldingTable.add(cantingCup);
  const clothRoll=prop(foldingTable,'textile',-6.5,.97,10.78,.4,.12,.46);
  // Eye-level swatch sits right of Sari, aligned with the natural north-facing
  // portrait approach. It is the same original pattern as the retrieved roll.
  for(const x of [-7.25,-5.35])prop(foldingTable,'darkwood',x,1.16,9.95,.055,2.32,.055);
  prop(foldingTable,'wood',-6.3,2.30,9.95,2.02,.055,.055);
  const hangingSwatch=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.05),mats.textile);hangingSwatch.position.set(-6.3,1.60,10.01);hangingSwatch.castShadow=true;foldingTable.add(hangingSwatch);

  const marketParcel=new THREE.Group();marketParcel.name='family-patterned-cloth-parcel';marketParcel.position.set(-10,0,-48);root.add(marketParcel);
  prop(marketParcel,'wood',0,.4,0,1.1,.8,1);
  prop(marketParcel,'textile',0,.91,0,.83,.22,.65);
  prop(marketParcel,'cloth',0,1.05,0,.08,.06,.7);
  const parcelSign=label('KAIN KELUARGA',1.5,.25,'#313b35');parcelSign.position.set(0,.58,.52);marketParcel.add(parcelSign);
  const savedCloth=new THREE.Group();savedCloth.name='cloth-in-shelter';root.add(savedCloth);
  prop(savedCloth,'textile',-18.1,.65,-12,.85,.18,.7);prop(savedCloth,'cloth',-18.1,.76,-12,.09,.05,.72);
  // Essential cover stays visible on every tier. These stacks form two readable
  // choices at the approach, without closing the centre or the existing route.
  const shelterBench=new THREE.Group();shelterBench.name='courtyard-help-object';root.add(shelterBench);
  prop(shelterBench,'wood',-17.5,.4,-13.6,2.6,.12,.5);
  for(const x of [-18.5,-16.5])prop(shelterBench,'darkwood',x,.2,-13.6,.12,.4,.48);
  const fixedSigns=root.children.filter(m=>m.userData.isLabel);
  if(fixedSigns.length){
    const ps=[],ns=[],uvs=[],indices=[];let offset=0;
    for(const m of fixedSigns){m.updateMatrix();const g=m.geometry,normalMatrix=new THREE.Matrix3().getNormalMatrix(m.matrix),normal=new THREE.Vector3();
      for(let i=0;i<g.attributes.position.count;i++){v.fromBufferAttribute(g.attributes.position,i).applyMatrix4(m.matrix);ps.push(v.x,v.y,v.z);normal.fromBufferAttribute(g.attributes.normal,i).applyMatrix3(normalMatrix).normalize();ns.push(normal.x,normal.y,normal.z);uvs.push(g.attributes.uv.getX(i),g.attributes.uv.getY(i));}
      for(const n of g.index.array)indices.push(n+offset);offset+=g.attributes.position.count;root.remove(m);g.dispose();
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(ns,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeBoundingSphere();const signs=new THREE.Mesh(g,labelMaterial);signs.name='shop-sign-atlas';root.add(signs);
  }
  let currentQuality=quality, lastCulling=0, moved=false;

  const stats={instances:instanceCount,batches:batches.size,activeDetailCells:detailCells.length,residentCells:6,cullableBatches:batches.size,activeDetailBatches:distanceBatches.length,representation:'resident material batches + north/south facade detail LOD + skyline card'};
  const anchors={spawn:{x:0,z:24},sari:{x:-6,z:10},shelter:{x:-15,z:-12},damar:{x:6,z:-42},impact:{x:7,z:-10},cart:{x:-9,z:-7.7},bridge:{x:0,z:-31},return:{x:0,z:-20},final:{x:-4,z:-22},bounds:{minX:-28,maxX:28,minZ:-65,maxZ:30}};
  function update(dt,time,state={},player={x:0,z:24}) {
    waterMat.uniforms.time.value=time;
    const help=Math.max(0,Math.min(1,state.helpProgress||0));
    const threatened=Boolean(state.flags?.impact);
    foldLeaf.scale.z=.65-(Math.sin(time*1.6)*.5+.5)*.2;
    foldLeaf.rotation.x=threatened?0:Math.sin(time*1.6)*.07;
    foldLeaf.visible=!threatened;clothRoll.visible=!threatened;
    hangingSwatch.material=threatened?mats.scorchedTextile:mats.textile;hangingSwatch.scale.y=threatened?.68:1;hangingSwatch.rotation.z=threatened?.14:Math.sin(time*.6)*.015;
    marketParcel.visible=!state.flags?.parcel;
    savedCloth.visible=Boolean(state.flags?.rescued)||(state.helpKind==='help'&&help>.3);
    savedCloth.children[0].material=state.flags?.clothSaved===false?mats.scorchedTextile:mats.textile;
    if(savedCloth.visible){savedCloth.position.x=state.flags?.rescued?0:(1-help)*3.4;savedCloth.position.y=state.flags?.rescued?0:Math.sin(help*Math.PI)*.25;}
    const war=threatened?Math.min(1,(state.eventTime||0)/4):0;
    hemi.intensity=1.45-war*.25;sun.color.setHex(threatened?0xffbd8d:0xffd2a0);

    sariShutter.visible=Boolean(state.flags?.sariWarned);
    shelterDoor.rotation.y=state.flags?.rescued?-1.35:0;
    for(const p of smoke){p.s.position.x=p.x+Math.sin(time*.08+p.phase)*1.6;p.s.position.y=p.y+Math.sin(time*.11+p.phase)*.5;}
    const shouldMove=Boolean(state.cartMoved||state.choices?.cart==='move'||state.flags?.cartMoved||state.flags?.cart||state.flags?.cartCleared);
    const slide=shouldMove?1:state.helpKind==='check'?help:0;
    cart.position.x=-9-slide*4;cartCollider.minX=cart.position.x-.85;cartCollider.maxX=cart.position.x+.85;moved=shouldMove;
    if(time-lastCulling>.3){
      lastCulling=time;const p=player.position||player;
      const detailRange=currentQuality==='low'?42:currentQuality==='high'?90:64;
      for(const item of distanceBatches){const b=item.mesh.boundingSphere;const d=Math.hypot((p.x??0)-b.center.x,(p.z??24)-b.center.z)-b.radius;const visible=d<detailRange+(item.visible?10:0);item.mesh.visible=visible;item.visible=visible;}
      for(const sign of details){const d=Math.hypot((p.x??0)-sign.position.x,(p.z??24)-sign.position.z);sign.visible=d<detailRange+(sign.visible?10:0);}
      for(const item of detailCells){const d=Math.abs((p.z??24)-item.cell.position.z),limit=currentQuality==='low'?28:currentQuality==='high'?65:45;const visible=d<limit+(item.visible?8:0);item.cell.visible=visible;item.visible=visible;}
      stats.activeDetailCells=detailCells.filter(x=>x.visible).length;stats.activeDetailBatches=distanceBatches.filter(x=>x.visible).length;
    }
  }
  function setQuality(value){currentQuality=value;sun.castShadow=value!=='low';sun.shadow.mapSize.set(value==='high'?2048:1024,value==='high'?2048:1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}sun.shadow.needsUpdate=true;}
  setQuality(quality);
  return {root,colliders,cover,anchors,stats,update,setQuality,cart,
    dispose(){scene.remove(root,hemi,sun,sun.target,fill,shelterLight);labelMaterial.dispose();for(const t of textures)t.dispose();for(const m of Object.values(mats))m.dispose();boxGeo.dispose();cylGeo.dispose();sphereGeo.dispose();}
  };
}
