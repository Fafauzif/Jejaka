/** Jejaka escape district. Original authored geometry, materials and destruction.
 * This connected theatrical street is historical fiction, not a surveyed 1945 plan.
 * Source reconstruction/research and the older games remain untouched. */
export function createWorld(THREE, scene, {quality='balanced'}={}) {
  const root=new THREE.Group();root.name='Escape district — original production staging';scene.add(root);
  const colliders=[],cover=[],animated=[],resources=[],batches=new Map(),damage=[];
  const bounds={minX:-64,maxX:64,minZ:-244,maxZ:29};
  let tier=quality,comfort=false,seed=194511;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const boxGeo=new THREE.BoxGeometry(1,1,1),cylGeo=new THREE.CylinderGeometry(1,1,1,10),sphereGeo=new THREE.SphereGeometry(1,9,6);
  resources.push(boxGeo,cylGeo,sphereGeo);
  function texture(kind) {
    const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
    g.fillStyle={plaster:'#a79c84',brick:'#89634e',wood:'#78634d',roof:'#965f47',stone:'#817b68',cloth:'#273e45'}[kind];g.fillRect(0,0,512,512);
    for(let i=0;i<9000;i++){g.fillStyle=rand()<.5?'rgba(15,19,17,.045)':'rgba(235,220,186,.045)';g.fillRect(rand()*512,rand()*512,1+rand()*7,1+rand()*4);}
    if(kind==='brick'||kind==='roof'||kind==='stone'){const sy=kind==='stone'?42:32,sx=kind==='stone'?91:65;for(let y=-sy;y<512;y+=sy)for(let x=-sx;x<512;x+=sx){g.fillStyle=rand()<.5?'rgba(19,26,23,.12)':'rgba(236,213,169,.1)';g.fillRect(x+(Math.round(y/sy)%2)*sx/2+2,y+2,sx-4,sy-4);g.strokeStyle='rgba(19,25,22,.24)';g.lineWidth=2;g.strokeRect(x+(Math.round(y/sy)%2)*sx/2,y,sx,sy);}}
    if(kind==='stone'){
      // Cool, small, irregular setts; local RNG preserves the authored layout seed.
      let n=194513;const rr=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
      g.fillStyle='#4d5855';g.fillRect(0,0,512,512);
      for(let y=-60,row=0;y<512;y+=57,row++)for(let x=-80;x<512;x+=76){const xx=x+(row%2)*38,j=rr()*4,lum=96+Math.floor(rr()*32);g.beginPath();g.moveTo(xx+3+j,y+4);g.lineTo(xx+69,y+2+j);g.lineTo(xx+74-j,y+48);g.lineTo(xx+66,y+54);g.lineTo(xx+5,y+52-j);g.lineTo(xx+1,y+12);g.closePath();g.fillStyle=`rgb(${lum-4},${lum+3},${lum})`;g.fill();g.strokeStyle='rgba(26,37,33,.32)';g.lineWidth=1.6;g.stroke();g.strokeStyle='rgba(207,214,194,.14)';g.beginPath();g.moveTo(xx+7,y+6);g.lineTo(xx+65,y+5);g.stroke();if(rr()<.25){g.strokeStyle='rgba(28,38,33,.28)';g.beginPath();g.moveTo(xx+22,y+5);g.lineTo(xx+29,y+23);g.lineTo(xx+25,y+43);g.stroke();}}
      for(let i=0;i<3400;i++){g.fillStyle=rr()<.5?'rgba(22,31,26,.075)':'rgba(212,217,198,.06)';g.fillRect(rr()*512,rr()*512,rr()*3+1,rr()*2+1);}
    }
    if(kind==='wood'){for(let x=0;x<512;x+=32){g.fillStyle='rgba(22,24,18,.26)';g.fillRect(x,0,2,512);for(let j=0;j<4;j++){g.strokeStyle='rgba(37,28,18,.19)';g.beginPath();g.moveTo(x+5+j*6,0);g.bezierCurveTo(x+25,150,x+2,340,x+6+j*6,512);g.stroke();}}}
    if(kind==='plaster'){for(let i=0;i<55;i++){g.fillStyle='rgba(43,47,37,.05)';g.fillRect(rand()*512,rand()*512,rand()*90,rand()*180);}const grad=g.createLinearGradient(0,0,0,512);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,'rgba(22,28,23,.28)');g.fillStyle=grad;g.fillRect(0,0,512,512);}
    if(kind==='cloth'){g.strokeStyle='#d5b888';g.fillStyle='#d5b888';g.lineWidth=3;for(let y=32;y<512;y+=64)for(let x=32;x<512;x+=64){g.save();g.translate(x+(y%128?0:32),y);g.rotate(.4);for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.beginPath();g.ellipse(11,0,13,5,0,0,Math.PI*2);g.stroke();}g.beginPath();g.arc(0,0,2.6,0,Math.PI*2);g.fill();for(let k=0;k<4;k++)g.fillRect(Math.cos(k*Math.PI/2+.7)*25,Math.sin(k*Math.PI/2+.7)*25,2,2);g.restore();}g.strokeStyle='#e2cda5';g.lineWidth=8;g.strokeRect(9,9,494,494);}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;resources.push(t);return t;
  }
  const tex={};for(const k of ['plaster','brick','wood','roof','stone','cloth'])tex[k]=texture(k);
  scene.userData.jejakaTextileTexture=tex.cloth;scene.userData.escapeTextileTexture=tex.cloth;
  const mat={};function material(n,color,map=null,roughness=.88){return mat[n]=new THREE.MeshStandardMaterial({color,map,roughness});}
  material('cream',0xe0ccb0,tex.plaster);material('sage',0x8c9d90,tex.plaster);material('teal',0x526d6b,tex.plaster);material('ochre',0xb49b74,tex.plaster);material('peach',0xc5a38a,tex.plaster);material('grey',0x8d9891,tex.plaster);
  material('brick',0xb69174,tex.brick);material('wood',0xc1a67b,tex.wood);material('darkwood',0x66523f,tex.wood);material('roof',0xc08b69,tex.roof);material('stone',0xa8b3ad,tex.stone,.96);material('creamtrim',0xd9d0b9);material('black',0x26332f);material('iron',0x414e49,null,.61);material('rust',0x984b35);material('soil',0x5d6550);material('leaves',0x475e48);material('leaveslight',0x7a8958);material('sack',0xaca184);material('fruit',0xc89b52);material('fruitgreen',0x7e925b);material('textile',0xffffff,tex.cloth,1);material('clay',0xa97757);material('brass',0xbb9c58,null,.48);material('redcloth',0x9e4739);material('whitecloth',0xd9d0b8);
  mat.window=new THREE.MeshStandardMaterial({color:0x273b39,roughness:.34,metalness:.15});mat.glow=new THREE.MeshBasicMaterial({color:0xf3c98d});
  Object.values(mat).forEach(x=>resources.push(x));
  const dummy=new THREE.Object3D();function add(type,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const zone=Math.floor((z+250)/48),key=type+':'+m+':'+zone;if(!batches.has(key))batches.set(key,{type,m,items:[]});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
  const box=(m,x,y,z,w,h,d,ry=0,rz=0)=>add('box',m,x,y,z,w,h,d,0,ry,rz);
  const cyl=(m,x,y,z,r,h)=>add('cyl',m,x,y,z,r,h,r);
  const ball=(m,x,y,z,a,b=a,c=a)=>add('sphere',m,x,y,z,a,b,c);
  function solid(x,z,w,d,tag='architecture'){colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,tag});}
  function text(txt,x,y,z,w=4,h=.7,yaw=0,bg='#273d38',fg='#e2d0a9') {const c=document.createElement('canvas');c.width=1024;c.height=160;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,1024,160);g.strokeStyle=fg;g.lineWidth=3;g.strokeRect(8,8,1008,144);g.fillStyle=fg;g.font='bold 67px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,512,85,980);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshStandardMaterial({map:t,roughness:1});const geo=new THREE.PlaneGeometry(w,h);const mesh=new THREE.Mesh(geo,m);mesh.position.set(x,y,z);mesh.rotation.y=yaw;root.add(mesh);resources.push(t,m,geo);return mesh;}
  scene.background=new THREE.Color(0x9fa99b);scene.fog=new THREE.FogExp2(0xaab0a0,.0052);
  const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color(0x405e65)},bottom:{value:new THREE.Color(0xcbb996)},burn:{value:0}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform vec3 top,bottom;uniform float burn;void main(){float h=clamp(normalize(p).y*1.6,0.,1.);vec3 col=mix(bottom,top,pow(h,.6));col=mix(col,vec3(.52,.31,.22),burn*.38*(1.-h));gl_FragColor=vec4(col,1.);}' });
  const skyGeo=new THREE.SphereGeometry(550,32,20);const sky=new THREE.Mesh(skyGeo,skyMat);sky.position.set(0,0,-110);root.add(sky);resources.push(skyMat,skyGeo);
  const hemi=new THREE.HemisphereLight(0xb6d0d3,0x544435,1.75);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffd2a1,3.1);sun.position.set(-60,95,-85);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-70,right:70,top:80,bottom:-80,near:1,far:240});sun.shadow.normalBias=.035;sun.shadow.bias=-.00025;sun.target.position.set(0,0,-45);scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight(0x8eb4c1,.53);fill.position.set(35,18,15);scene.add(fill);
  function ground(cx,cz,w,d){const t=tex.stone.clone();t.repeat.set(w/3,d/3);t.needsUpdate=true;const m=mat.stone.clone();m.map=t;const g=new THREE.PlaneGeometry(w,d);const mesh=new THREE.Mesh(g,m);mesh.rotation.x=-Math.PI/2;mesh.position.set(cx,-.035,cz);mesh.receiveShadow=true;root.add(mesh);resources.push(t,m,g);}
  ground(0,-73.5,150,207);ground(0,-220,150,54);
  // A continuous river creates a real crossing and a long lateral sightline.
  const waterMat=new THREE.ShaderMaterial({transparent:true,uniforms:{time:{value:0}},vertexShader:'varying vec2 uvv;uniform float time;void main(){uvv=uv;vec3 p=position;p.z+=sin(p.x*.7+time*.7)*.045;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'varying vec2 uvv;uniform float time;void main(){float r=sin(uvv.x*220.+uvv.y*80.+sin(uvv.x*23.+time)*2.+time)*.5+.5;float shine=pow(max(0.,sin(uvv.y*90.+uvv.x*17.-time*.7)),20.);gl_FragColor=vec4(vec3(.18,.29,.27)+r*.027+shine*vec3(.16,.12,.07),.98);}' });
  const waterGeo=new THREE.PlaneGeometry(160,16,80,10),water=new THREE.Mesh(waterGeo,waterMat);water.rotation.x=-Math.PI/2;water.position.set(0,-.47,-185);root.add(water);resources.push(waterGeo,waterMat);
  for(const z of [-176.8,-193.2]){box('brick',0,-.72,z,145,1.5,.8);box('creamtrim',0,.08,z,145,.18,.95);}
  for(const [a,b] of [[-65,-24.4],[-15.6,23.6],[32.4,65]])colliders.push({minX:a,maxX:b,minZ:-193,maxZ:-177,tag:'river'});
  function bridge(x){box('darkwood',x,-.2,-185,8,.4,23);for(let z=-196;z<-174;z+=.52)box('wood',x,.02,z,8.1,.065,.48);for(const side of [-1,1]){const xx=x+side*4.1;box('rust',xx,.8,-185,.14,.15,22);box('rust',xx,1.3,-185,.18,.17,22);for(let z=-196;z<=-174;z+=2.7){box('rust',xx,.72,z,.17,1.55,.2);add('box','rust',xx,.68,z+1.3,.11,.11,2.9,.45,0,0);add('box','rust',xx,.68,z+1.3,.11,.11,2.9,-.45,0,0);}solid(xx,-185,.25,23,'bridge rail');}for(const xx of [x-4.4,x+4.4])for(const z of [-196.3,-173.7]){box('brick',xx,.8,z,.7,1.7,.7);box('creamtrim',xx,1.67,z,.9,.12,.9);}}
  bridge(-20);bridge(28);
  const palette=['cream','sage','ochre','grey','peach','teal'];
  function building(x,z,w,d,h,i,front='south',sign='') {
    const color=palette[i%palette.length];box(color,x,h/2,z,w,h,d);solid(x,z,w,d);
    const frontZ=z+d/2+.055,backZ=z-d/2-.055,sideX=x+(front==='west'?-w/2:w/2);
    box('brick',x,.42,z,w+.06,.84,d+.06);box('creamtrim',x,h-.12,z,w+.36,.26,d+.32);box('creamtrim',x,3.3,z,w+.15,.18,d+.13);
    // Two roof slopes, eaves, ridge and small chimneys give varied silhouettes.
    add('box','roof',x-w/4,h+.72,z,w*.58,.16,d+1,0,0,.29);add('box','roof',x+w/4,h+.72,z,w*.58,.16,d+1,0,0,-.29);box('roof',x,h+1.38,z,.28,.22,d+1.1);
    if(i%3===0){box('brick',x+w*.27,h+1.5,z-d*.18,.7,2,.7);box('black',x+w*.27,h+2.53,z-d*.18,.8,.12,.8);}
    if(front==='south'||front==='north'){
      const f=front==='south'?frontZ:backZ,dir=front==='south'?1:-1;
      for(let xx=x-w/2+1.2;xx<x+w/2-.6;xx+=2.7){box('black',xx,1.55,f,2.1,2.7,.12);box(i%2?'wood':'teal',xx+.66,1.5,f+dir*.08,.7,2.6,.14);box('creamtrim',xx,3.02,f+dir*.08,2.4,.14,.3);if(h>5){box('window',xx,4.55,f+dir*.04,1.4,1.8,.12);box('wood',xx,4.55,f+dir*.1,.08,1.85,.13);box('wood',xx,4.55,f+dir*.11,1.5,.09,.13);box('wood',xx,3.65,f+dir*.16,1.6,.12,.4);}}
      if(i%2===0){add('box',i%4?'redcloth':'sage',x,3.0,f+dir*1.2,w+.6,.09,2.3,-dir*.12,0,0);for(const xx of [x-w/2-.1,x+w/2+.1])cyl('darkwood',xx,1.5,f+dir*2.05,.06,3);}
      if(sign)text(sign,x,3.5,f+dir*.15,Math.min(w-.7,6.6),.75,front==='south'?0:Math.PI);
    } else {
      const dir=front==='east'?1:-1,f=sideX;
      for(let zz=z-d/2+1.5;zz<z+d/2-.7;zz+=2.8){box('black',f,1.5,zz,.13,2.6,2.1);box('wood',f+dir*.07,1.5,zz+.6,.15,2.6,.7);if(h>5){box('window',f+dir*.05,4.7,zz,.13,1.8,1.35);box('wood',f+dir*.12,4.7,zz,.14,1.85,.09);box('wood',f+dir*.12,3.76,zz,.42,.13,1.65);}}
      if(i%2===0){add('box',i%4?'sage':'redcloth',f+dir*1.1,3,z,2.3,.09,d+.5,0,0,dir*.1);for(const zz of [z-d/2,z+d/2])cyl('darkwood',f+dir*2.1,1.5,zz,.06,3);}
      if(sign)text(sign,f+dir*.15,3.6,z,Math.min(d-.8,6.8),.7,front==='east'?Math.PI/2:-Math.PI/2);
    }
    if(i%4===0){box('creamtrim',x,h+.45,z+d/2+.3,w*.4,1.3,.35);}
  }
  // The ordinary market has real spatial depth, cross streets, recessed shops and roofs.
  const names=['WARUNG KOPI','PENJAHIT','BERAS & GULA','TOKO KAIN','PERCETAKAN','ROTI HANGAT'];
  let bi=0;
  for(const side of [-1,1])for(let z=20;z>=-20;z-=13){building(side*16.5,z,11.5,11,6.3+(bi%3)*1.5,bi++,side<0?'east':'west',names[bi%names.length]);}
  // A visible junction allows the flight to turn east; it is never a tunnel.
  for(const [x,z,w,d] of [[-24,-48,17,13],[8,-54,17,14],[-26,-71,19,17],[9,-70,18,16],[9,-105,18,12],[41,-51,22,19],[42,-71,23,17],[43,-96,21,18],[-24,-99,23,18]])building(x,z,w,d,6.5+(bi%4)*1.3,bi++,x>24?'west':x<0?'east':'east',bi%3===0?'TOKO KELONTONG':'');
  // Courtyard roofs stand open around the cultural/family encounter rather than boxing it in.
  building(12,-85,6,20,4.8,bi++,'east','KAIN & JAHIT');building(40,-85,9,15,5.7,bi++,'west');
  for(const x of [16,33]){cyl('wood',x,2.2,-78,.1,4.4);cyl('wood',x,2.2,-99,.1,4.4);}box('darkwood',24.5,4.1,-78,18,.16,.17);box('darkwood',24.5,4.1,-99,18,.16,.17);
  for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.7,3,5),i%2?mat.textile:mat.whitecloth);m.position.set(16+i*2.9,2.65,-79.2);m.rotation.y=.13;root.add(m);animated.push({mesh:m,kind:'cloth',phase:i});resources.push(m.geometry);}
  // Broad square, orthogonal side streets and a civic facade make the second half a new place.
  building(-35,-127,20,32,10.5,bi++,'east','BALAI WARGA');building(38,-130,23,35,10,bi++,'west','PASAR');building(0,-155,26,10,12.5,bi++,'south','');
  for(const x of [-48,48])for(const z of [-145,-112,-205,-230])building(x,z,15,19,8+(bi%3)*3,bi++,'south');
  // A clock tower anchors the plaza skyline but is kept off the walking line.
  box('cream',-34,7.5,-151,7,15,7);solid(-34,-151,7,7);box('creamtrim',-34,15.2,-151,8,.6,8);add('box','roof',-34,17,-151,8,.2,8,0,0,.0);cyl('iron',-34,18.5,-151,.1,3);
  text('◷',-34,12,-147.45,3,3,0,'#d6c7a5','#354840');
  // Refuge school opens onto the far riverbank. Its door is wide enough for a group.
  building(-20,-236,27,10,7.3,bi++,'south','SEKOLAH');
  for(const x of [-34,-6]){box('cream',x,1.35,-224,1,2.7,1);box('creamtrim',x,2.74,-224,1.3,.18,1.3);}box('wood',-20,3.5,-224,29,.2,.2);
  text('TEMPAT BERLINDUNG',-20,3.25,-223.8,10,.9);text('LEWAT GANG →',6,3,-31,6,.7,0,'#e0cda8','#384d43');text('← JEMBATAN',6,3,-146,5.4,.7,0,'#d2c6a9','#384d43');
  // Distant warehouses and towers occupy the horizon behind the played streets.
  for(let i=0;i<23;i++){const x=(i<12?-1:1)*(53+rand()*25),z=25-rand()*275,h=9+rand()*12;box(i%2?'grey':'teal',x,h/2,z,10+rand()*12,h,10+rand()*13);if(i%4===0)cyl('brick',x,h+5,z,.8,10);}
  function crate(x,z,s=1,blocking=true){box('wood',x,s*.5,z,s,s,s);for(const side of [-1,1]){box('darkwood',x+side*s*.44,s*.5,z,.08*s,s,s);box('darkwood',x,s*.2,z+side*s*.49,s,.09*s,.03);}if(blocking){solid(x,z,s,s,'crate');cover.push({x,z,r:s*.9});}}
  function barrel(x,z,r=.4){cyl('wood',x,.57,z,r,1.15);for(const y of [.16,.95])cyl('iron',x,y,z,r+.015,.06);cyl('darkwood',x,1.16,z,r,.04);solid(x,z,r*2,r*2,'barrel');cover.push({x,z,r:r+1});}
  function plant(x,z,s=1){cyl('clay',x,.25*s,z,.28*s,.5*s);cyl('soil',x,.51*s,z,.24*s,.03);for(let j=0;j<6;j++)add('box','leaves',x+Math.cos(j)*.2*s,.85*s,z+Math.sin(j)*.2*s,.14*s,.85*s,.07*s,0,j,.3);}
  function tree(x,z,s=1){cyl('darkwood',x,2*s,z,.19*s,4*s);for(let i=0;i<7;i++)ball(i%2?'leaves':'leaveslight',x+(rand()-.5)*2*s,(4+rand())*s,z+(rand()-.5)*2*s,(1+rand())*s,.8*s,(1+rand())*s);solid(x,z,.5*s,.5*s,'tree');}
  function stall(x,z,i){box('darkwood',x,.95,z,2.6,.18,3.1);for(const xx of [x-1.1,x+1.1])for(const zz of [z-1.3,z+1.3])cyl('wood',xx,1.6,zz,.055,3.2);add('box',i%2?'redcloth':'sage',x,3.2,z,3.2,.06,3.8,.08,0,0);for(let k=0;k<19;k++)ball(k%4?'fruit':'fruitgreen',x+(rand()-.5)*2,.99+rand()*.2,z+(rand()-.5)*2.6,.13,.12,.14);solid(x,z,2.6,3.1,'stall');cover.push({x,z,r:2});}
  for(const x of [-7.4,7.3])for(let z=19;z>=-23;z-=10){if(x<0&&z>0)continue;stall(x,z,bi++);crate(x+(x>0?1.6:-1.6),z+3,.7);plant(x+(x>0?1.9:-1.9),z-3,.8);}
  for(const [x,z] of [[19.2,-53],[28.8,-63],[18,-85],[32,-91],[-15,-121],[15,-133],[-27,-161],[19,-166],[-30,-215],[-9,-212]]){barrel(x,z,.38);crate(x+.9,z+.3,.85);plant(x-.9,z+1,.9);}
  for(const [x,z,s] of [[-28,-33,1.2],[36,-34,1.4],[35,-109,1.3],[-24,-119,1.4],[22,-149,1.2],[-35,-204,1.4],[1,-214,1.4]])tree(x,z,s);
  // Layer the open square without closing its escape diagonal.
  stall(14,-126,3);crate(-6.5,-139,1.15);crate(-5.7,-140.2,.7);barrel(8.3,-147,.43);
  for(const [x,z] of [[-4,16],[3,-8],[7,-33],[23,-57],[25,-75],[20,-105],[-5,-119],[12,-131],[-18,-159],[-24,-204]]){
    const g=new THREE.CircleGeometry(1,10),m=new THREE.MeshBasicMaterial({color:0x38443b,transparent:true,opacity:.12,depthWrite:false});
    const patch=new THREE.Mesh(g,m);patch.rotation.x=-Math.PI/2;patch.rotation.z=rand()*6;patch.position.set(x,-.018,z);patch.scale.set(1.4+rand()*1.8,.4+rand()*.8,1);root.add(patch);resources.push(g,m);
    for(let k=0;k<9;k++)box(k%3?'brick':'darkwood',x+(rand()-.5)*2.5,.035+rand()*.04,z+(rand()-.5)*1.4,.05+rand()*.12,.04,.08+rand()*.17,rand()*3);
  }
  // Workshop: hot-wax bowl, original patterned cloth and drying frame are encountered at hand height.
  box('darkwood',-5.8,.88,4,3,.16,2.5);for(const x of [-7,-4.6])for(const z of [3,5])cyl('wood',x,.42,z,.055,.84);box('textile',-5.5,.98,3.8,2.2,.035,1.8);solid(-5.8,4,3,2.5,'worktable');
  for(const x of [-7.2,-4.2])cyl('wood',x,1.5,1,.055,3);box('darkwood',-5.7,2.9,1,3.2,.09,.1);box('textile',-5.7,1.95,1,2.8,1.8,.04);
  cyl('brass',-6.6,1.07,4.6,.16,.17);cyl('black',-6.6,1.17,4.6,.125,.02);add('box','wood',-6.4,1.08,4.35,.035,.04,.5,0,.5,.0);ball('brass',-6.3,1.1,4.17,.05,.04,.055);
  text('BATIK • JAHIT',-6.4,3.45,1.15,3.8,.6);text('← SEKOLAH',-12,2.9,-202,4.5,.65);
  // Handcarts, baskets, drain grates, lanterns and telephone wires provide foreground parallax.
  function cart(x,z,ry=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;root.add(g);function p(m,x,y,z,w,h,d){const me=new THREE.Mesh(boxGeo,mat[m]);me.position.set(x,y,z);me.scale.set(w,h,d);me.castShadow=true;g.add(me);}p('wood',0,.75,0,1.5,.18,2.2);p('wood',-.76,1.0,0,.1,.5,2.2);p('wood',.76,1,0,.1,.5,2.2);p('darkwood',-.5,.65,-1.8,.07,.07,1.7);p('darkwood',.5,.65,-1.8,.07,.07,1.7);for(const xx of [-.92,.92]){const geo=new THREE.TorusGeometry(.45,.045,6,18),me=new THREE.Mesh(geo,mat.darkwood);me.rotation.y=Math.PI/2;me.position.set(xx,.45,.15);g.add(me);resources.push(geo);}for(let i=0;i<3;i++)p('sack',(i-1)*.4,1.02,0,.38,.4,1.2);solid(x,z,2,3,'cart');return g;}
  cart(9.6,-36.5,Math.PI/2);cart(32.5,-83,.2);cart(-18,-137,.5);cart(-28,-210,0);
  for(const side of [-1,1])for(let z=24;z>=-22;z-=5.5){box('creamtrim',side*9.6,.025,z,1,.1,4.9);box('black',side*9.0,-.005,z,.2,.015,4.9);if(Math.round(z)%2===0)box('iron',side*9,.02,z,.3,.03,.65);}
  function lamp(x,z){cyl('iron',x,2.1,z,.055,4.2);box('iron',x,4.23,z,.4,.1,.4);box('glow',x,3.98,z,.22,.4,.22);box('iron',x,3.74,z,.35,.07,.35);for(const dx of [-.14,.14])for(const dz of [-.14,.14])box('iron',x+dx,3.98,z+dz,.025,.45,.025);}
  for(const [x,z] of [[-9,-27],[10,-27],[20,-40],[28,-73],[17,-105],[-23,-115],[20,-139],[-25,-172],[-15,-172],[-25,-198],[-15,-198],[-34,-220]])lamp(x,z);
  function wire(points){const g=new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))).getPoints(24)),m=new THREE.LineBasicMaterial({color:0x37463e});root.add(new THREE.Line(g,m));resources.push(g,m);}
  for(const z of [16,-8,-28]){for(const x of [-10,10]){cyl('darkwood',x,3.4,z,.09,6.8);box('darkwood',x,6.5,z,1.9,.1,.1);}for(const dz of [-.5,.5])wire([[-10,6.4,z+dz],[0,5.65,z+dz],[10,6.4,z+dz]]);}
  wire([[18,5.1,-45],[24,4.5,-53],[31,5.1,-62]]);wire([[-34,6,-111],[0,5.2,-111],[35,6,-111]]);
  // Displaced roofing closes the first street only after the visible blast.
  const collapse=new THREE.Group();collapse.name='Market roof collapse';root.add(collapse);
  for(let i=0;i<17;i++){const m=new THREE.Mesh(boxGeo,mat[i%3?'wood':'roof']);m.position.set((rand()-.5)*14,.2+rand()*.55,-45+(rand()-.5)*3);m.scale.set(1+rand()*2.4,.2+rand()*.4,.5+rand());m.rotation.set(rand()*.5,rand()*3,.1+rand()*.3);m.castShadow=true;m.userData.restPosition=m.position.clone();m.userData.restRotation=m.rotation.clone();m.userData.fallHeight=4+rand()*2.5;collapse.add(m);}solid(0,-45,14,3.8,'collapsed street');damage.push(collapse);
  // This actual shop awning rattles before the first blast, then falls.
  const failingAwning=new THREE.Group();failingAwning.position.set(8,3.2,-46);root.add(failingAwning);
  for(let i=0;i<6;i++){const me=new THREE.Mesh(boxGeo,i%3?mat.wood:mat.roof);me.position.set(-4.5+i*1.8,0,.55);me.scale.set(1.72,.15,2.8);me.rotation.x=.14;me.castShadow=true;me.userData.start=me.position.clone();failingAwning.add(me);}
  const chipGeo=new THREE.BoxGeometry(.035,.06,.035),chipMat=new THREE.MeshStandardMaterial({color:0xc7b99b,roughness:1}),chips=new THREE.InstancedMesh(chipGeo,chipMat,12);chips.frustumCulled=false;chips.visible=false;root.add(chips);resources.push(chipGeo,chipMat);
  // Rubble follows edges: every apparent gap that is part of the route stays walkable.
  for(const [cx,cz] of [[-7,-43],[11,-49],[18,-67],[32,-100],[-18,-145],[20,-150]])for(let i=0;i<18;i++){const m=new THREE.Mesh(boxGeo,mat[i%3?'brick':'wood']);m.position.set(cx+(rand()-.5)*3,.08+rand()*.2,cz+(rand()-.5)*4);m.scale.set(.2+rand()*.8,.15+rand()*.3,.2+rand()*.6);m.rotation.set(rand(),rand()*3,rand());root.add(m);damage.push(m);}
  function scorch(x,z,w,h,yaw,phase){
    const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
    const gr=g.createRadialGradient(256,330,25,256,260,290);gr.addColorStop(0,'rgba(14,19,16,.94)');gr.addColorStop(.55,'rgba(22,26,22,.76)');gr.addColorStop(1,'rgba(28,28,23,0)');g.fillStyle=gr;g.fillRect(0,0,512,512);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const geo=new THREE.PlaneGeometry(w,h),m=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});const skin=new THREE.Mesh(geo,m);skin.position.set(x,h*.48,z);skin.rotation.y=yaw;skin.userData.damagePhase=phase;root.add(skin);damage.push(skin);resources.push(t,m,geo);
  }
  scorch(8,-46.91,10,7.6,0,1);scorch(30.42,-67,10,8,-Math.PI/2,2);scorch(26.42,-140,12,9,-Math.PI/2,4);
  // Broken windows stay in the destroyed facades, contextualising the flames.
  function brokenOpening(x,z,yaw,phase){const g=new THREE.Shape();g.moveTo(-2.8,-1.9);g.lineTo(-2.5,.2);g.lineTo(-2.9,1.7);g.lineTo(-1.2,1.9);g.lineTo(-.3,1.35);g.lineTo(1.1,2.1);g.lineTo(2.65,1.6);g.lineTo(2.45,-.3);g.lineTo(2.8,-1.6);g.lineTo(.7,-1.9);g.lineTo(-.2,-1.55);g.closePath();const geo=new THREE.ShapeGeometry(g),m=new THREE.MeshStandardMaterial({color:0x17211b,roughness:1});const hole=new THREE.Mesh(geo,m);hole.position.set(x,3.4,z);hole.rotation.y=yaw;hole.userData.damagePhase=phase;root.add(hole);damage.push(hole);resources.push(geo,m);
    const frame=new THREE.Group();frame.position.copy(hole.position);frame.rotation.y=yaw;root.add(frame);frame.userData.damagePhase=phase;damage.push(frame);
    for(let i=0;i<7;i++){const me=new THREE.Mesh(boxGeo,mat.darkwood);me.position.set(-2.5+i*.8,(i%2?1.5:-1.5),.06);me.scale.set(.18,1.4,.15);me.rotation.z=(i%3-1)*.7;frame.add(me);}
  }
  brokenOpening(8,-46.82,0,1);brokenOpening(30.34,-67,-Math.PI/2,2);brokenOpening(26.34,-140,-Math.PI/2,4);
  // Drains and local cracks break the street surface without closing walking gaps.
  for(const [x,z] of [[20.6,-55],[27.4,-72],[20.6,-104],[-15,-148],[-25,-165],[-15,-204]]){box('black',x,-.007,z,.45,.025,1.35);for(let i=0;i<7;i++)box('iron',x,.006,z-.57+i*.19,.43,.025,.035);}
  const crackPoints=[];let crackSeed=731;const cr=()=>{crackSeed=(crackSeed*1664525+1013904223)>>>0;return crackSeed/4294967296;};
  for(let i=0;i<44;i++){let x=i<26?21+cr()*6:-16+cr()*32,z=i<26?-43-cr()*65:-116-cr()*35;for(let j=0;j<3;j++){const nx=x+(cr()-.5)*.9,nz=z-.4-cr()*.7;crackPoints.push(new THREE.Vector3(x,-.008,z),new THREE.Vector3(nx,-.008,nz));x=nx;z=nz;}}
  const crackGeo=new THREE.BufferGeometry().setFromPoints(crackPoints),crackMat=new THREE.LineBasicMaterial({color:0x2d3931,transparent:true,opacity:.4});root.add(new THREE.LineSegments(crackGeo,crackMat));resources.push(crackGeo,crackMat);
  for(const [key,b] of batches){const geo=b.type==='box'?boxGeo:b.type==='cyl'?cylGeo:sphereGeo,mesh=new THREE.InstancedMesh(geo,mat[b.m],b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.name='District batch '+key;mesh.castShadow=!['leaves','leaveslight','glow'].includes(b.m);mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);}
  const warm=new THREE.PointLight(0xffa14f,9,11,2);warm.position.set(-5.8,2.7,3);scene.add(warm);
  const banner=text('← JEMBATAN  ·  SEKOLAH',-1,4.2,-157,13,1.15,0,'#ad9b76','#263c35');
  // The visitor's hands hold this waxed sample while indigo reaches the cloth.
  // Cream resist lines remain visible, making the technique readable in the action.
  const workCanvas=document.createElement('canvas');workCanvas.width=workCanvas.height=512;
  const workCtx=workCanvas.getContext('2d'),workTexture=new THREE.CanvasTexture(workCanvas);workTexture.colorSpace=THREE.SRGBColorSpace;
  const workMaterial=new THREE.MeshStandardMaterial({map:workTexture,roughness:1}),workGeometry=new THREE.PlaneGeometry(1.4,.82,12,8),workSample=new THREE.Mesh(workGeometry,workMaterial);
  workSample.position.set(-4.7,1.0,3.5);workSample.rotation.y=Math.PI/3;workSample.rotation.x=-.07;const wp=workGeometry.attributes.position;for(let i=0;i<wp.count;i++){const x=wp.getX(i),y=wp.getY(i);wp.setZ(i,Math.cos(x/.7*Math.PI/2)*Math.cos(y/.41*Math.PI/2)*.07);}workGeometry.computeVertexNormals();root.add(workSample);resources.push(workTexture,workMaterial,workGeometry);let oldWork=-1;
  function drawWork(progress){const g=workCtx;g.fillStyle='#e5dfcb';g.fillRect(0,0,512,512);g.fillStyle='#243f49';g.fillRect(0,0,512*Math.max(0,Math.min(1,progress)),512);g.lineWidth=9;g.strokeStyle='#ead9af';for(let yy=48;yy<512;yy+=104)for(let xx=48;xx<512;xx+=104){g.save();g.translate(xx,yy);for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.beginPath();g.ellipse(20,0,23,9,0,0,Math.PI*2);g.stroke();}g.restore();}workTexture.needsUpdate=true;}
  drawWork(0);
  // One physical beam and cart share stable collision objects with the controller.
  const helpBeam=new THREE.Group();helpBeam.name='Grounded broken drying rack';helpBeam.position.set(22,.16,-93.25);root.add(helpBeam);
  const rackParts=[];function rackPart(x,y,z,w,h,d,ry=0,rz=0){dummy.position.set(x,y,z);dummy.rotation.set(0,ry,rz);dummy.scale.set(w,h,d);dummy.updateMatrix();rackParts.push(dummy.matrix.clone());}
  // Two longitudinal rails, two crossbars and one visibly split board.
  rackPart(2,.11,-.24,4,.15,.14);rackPart(2,.11,.24,4,.15,.14);
  rackPart(.46,.13,0,.16,.15,.82);rackPart(3.5,.13,0,.16,.15,.82);
  rackPart(1.31,.22,.02,1.85,.09,.18,.18,.015);rackPart(2.97,.23,.11,1.25,.1,.18,-.15,-.018);
  const rackMesh=new THREE.InstancedMesh(boxGeo,mat.wood,rackParts.length);rackParts.forEach((m,i)=>rackMesh.setMatrixAt(i,m));rackMesh.castShadow=true;helpBeam.add(rackMesh);
  const pivotFoot=new THREE.Mesh(boxGeo,mat.darkwood);pivotFoot.position.set(22,.1,-93.25);pivotFoot.scale.set(.44,.2,.88);pivotFoot.castShadow=true;root.add(pivotFoot);
  const beamCollider={minX:21.8,maxX:26.2,minZ:-93.5,maxZ:-92.5,tag:'help beam'};colliders.push(beamCollider);
  const bridgeCart=cart(-20,-182,0),bridgeCollider=colliders[colliders.length-1];
  // The overloaded handcart still permits an individual to edge left, while
  // the broader stretcher/blanket group needs its load moved out of the deck.
  const weaveCanvas=document.createElement('canvas');weaveCanvas.width=weaveCanvas.height=128;const weaveCtx=weaveCanvas.getContext('2d');weaveCtx.fillStyle='#aa926b';weaveCtx.fillRect(0,0,128,128);for(let i=0;i<128;i+=4){weaveCtx.fillStyle=i%8?'#bca67c':'#8e7855';weaveCtx.fillRect(i,0,2,128);weaveCtx.fillStyle=i%8?'rgba(230,210,160,.23)':'rgba(55,49,29,.13)';weaveCtx.fillRect(0,i,128,2);}const weaveTexture=new THREE.CanvasTexture(weaveCanvas);weaveTexture.colorSpace=THREE.SRGBColorSpace;weaveTexture.wrapS=weaveTexture.wrapT=THREE.RepeatWrapping;weaveTexture.repeat.set(4,1);const weaveMaterial=new THREE.MeshStandardMaterial({map:weaveTexture,roughness:1,color:0xc8bb97});resources.push(weaveTexture,weaveMaterial);
  const payloadFrame=new THREE.InstancedMesh(boxGeo,mat.wood,6);for(let i=0;i<6;i++){if(i<2){dummy.position.set(0,1.18,i?1:-1);dummy.scale.set(5.2,.08,.09);}else{dummy.position.set(i%2?.63:-.63,.99,i<4?.85:-.85);dummy.scale.set(.07,.48,.07);}dummy.rotation.set(0,0,0);dummy.updateMatrix();payloadFrame.setMatrixAt(i,dummy.matrix);}payloadFrame.castShadow=true;bridgeCart.add(payloadFrame);
  const rolledMats=new THREE.InstancedMesh(cylGeo,weaveMaterial,3);for(let i=0;i<3;i++){dummy.position.set(0,1.4,(i-1)*.66);dummy.rotation.set(0,0,Math.PI/2);dummy.scale.set(.19,5.2,.19);dummy.updateMatrix();rolledMats.setMatrixAt(i,dummy.matrix);}rolledMats.castShadow=true;bridgeCart.add(rolledMats);
  const matStack=new THREE.Mesh(boxGeo,weaveMaterial);matStack.position.set(0,1.2,0);matStack.scale.set(5.2,.17,1.95);matStack.castShadow=true;bridgeCart.add(matStack);
  const outrigger=new THREE.Mesh(boxGeo,mat.wood);outrigger.position.set(3.2,1.08,-.42);outrigger.rotation.z=-.16;outrigger.scale.set(1.38,.1,1.7);outrigger.castShadow=true;bridgeCart.add(outrigger);
  const braceCollider={minX:-17.4,maxX:-16.03,minZ:-183.3,maxZ:-181,tag:'cart outrigger'};colliders.push(braceCollider);
  // Seating sits within the school gate; the standing approach remains clear.
  const refugeBench=new THREE.Group();refugeBench.name='School refuge bench';refugeBench.position.set(-20.5,0,-229.05);root.add(refugeBench);function refugePart(m,x,y,z,w,h,d){const me=new THREE.Mesh(boxGeo,mat[m]);me.position.set(x,y,z);me.scale.set(w,h,d);me.castShadow=true;refugeBench.add(me);}refugePart('wood',0,.46,0,4.2,.12,.68);refugePart('darkwood',-1.7,.22,0,.14,.44,.52);refugePart('darkwood',1.7,.22,0,.14,.44,.52);refugePart('darkwood',0,.75,-.26,4.2,.16,.11);
  // Bench is intentionally seatable, rather than a new controller wall.
  refugePart('textile',-1.4,.54,.04,.8,.06,.44);const refugeWater=new THREE.Group();refugeWater.position.set(-17.65,0,-229);root.add(refugeWater);const top=new THREE.Mesh(boxGeo,mat.wood);top.position.y=.62;top.scale.set(1.15,.12,.85);refugeWater.add(top);for(const x of [-.46,.46])for(const z of [-.32,.32]){const leg=new THREE.Mesh(boxGeo,mat.darkwood);leg.position.set(x,.3,z);leg.scale.set(.07,.6,.07);refugeWater.add(leg);}const cup=new THREE.Mesh(cylGeo,mat.clay);cup.position.set(0,.79,0);cup.scale.set(.13,.22,.13);refugeWater.add(cup);solid(-17.65,-229,1.15,.85,'refuge water table');
  // Two contingent closures make the escaped route change behind the family.
  const closures=[];
  function createClosure(key,x,z,w,d,kind){const group=new THREE.Group();group.name=key==='alleySealed'?'Fallen alley canopy':'Fallen plaza frontage';group.position.set(x,0,z);root.add(group);const pieces=[],buckets=[];let n=key==='alleySealed'?817:621;const rr=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
    for(const materialName of ['wood','roof']){const count=materialName==='wood'?12:8,mesh=new THREE.InstancedMesh(boxGeo,mat[materialName],count);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.castShadow=true;group.add(mesh);buckets.push(mesh);for(let i=0;i<count;i++){const j=pieces.length,xx=(j/19-.5)*(w-.6),rest=new THREE.Vector3(xx,.2+(j%4)*.22,(rr()-.5)*(d-.5)),rot=new THREE.Euler((rr()-.5)*.8,rr()*.8,(rr()-.5)*.55),start=kind==='canopy'?new THREE.Vector3(xx,4.7+(j%2)*.07,(j%2-.5)*1.15):new THREE.Vector3(xx,3.5+(j%4)*1.05,-7+(j%2)*.1),scale=kind==='canopy'?new THREE.Vector3(w/11,.16,2.6):new THREE.Vector3(.8,2.3,.17);pieces.push({mesh,index:i,start,rest,rot,scale});}}
    const collider={minX:1000,maxX:1001,minZ:z-d/2,maxZ:z+d/2,tag:key==='alleySealed'?'sealed alley':'plaza cutoff'};colliders.push(collider);const record={key,x,z,w,d,kind,group,pieces,collider,active:false,age:0};closures.push(record);return record;
  }
  createClosure('alleySealed',24,-48,8,4,'canopy');createClosure('plazaCutoff',8,-142,12,4,'frontage');
  function updateClosures(dt,state,player){const raw=state.groupPositions||state.heroPositions||state.heroes||[],guests=Array.isArray(raw)?raw:Object.values(raw),occupants=[player,...guests].filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z));for(const c of closures){const requested=!!state[c.key],at=Number(state[c.key+'At']);if(!requested){c.active=false;c.age=0;}if(requested&&!c.active){const clear=occupants.every(p=>!(p.x>c.x-c.w/2-.8&&p.x<c.x+c.w/2+.8&&p.z>c.z-c.d/2-.8&&p.z<c.z+c.d/2+.8))&&(c.key!=='alleySealed'||occupants.every(p=>p.z<-55));if(clear){c.active=true;c.age=Number.isFinite(at)&&at>0?Math.max(0,(state.time||0)-at):0;if(c.age<1.2){stats.closureEvents++;stats.lastClosure={key:c.key,x:c.x,z:c.z,time:state.time||0};}}}
      if(c.active)c.age=Number.isFinite(at)&&at>0?Math.max(0,(state.time||0)-at):c.age+dt;const u=c.active?(comfort?1:Math.min(1,c.age/1.15)):0;for(const p of c.pieces){dummy.position.copy(p.start).lerp(p.rest,u*u);dummy.rotation.set(p.rot.x*u,p.rot.y*u,p.rot.z*u);dummy.scale.copy(p.scale);if(c.active&&c.kind==='frontage'){dummy.scale.y=Math.max(.4,2.3-u*1.55);dummy.scale.z=.17+u*1.2;}dummy.updateMatrix();p.mesh.setMatrixAt(p.index,dummy.matrix);}for(const mesh of c.group.children)mesh.instanceMatrix.needsUpdate=true;c.collider.minX=c.active?c.x-c.w/2:1000;c.collider.maxX=c.active?c.x+c.w/2:1001;} }
  const stats={staticBatches:batches.size,colliders:colliders.length,scene:'multi-neighborhood escape district',footprintMetres:[130,275],closureEvents:0,lastClosure:null};
  function setReducedMotion(v){comfort=!!v;}
  function setQuality(q){tier=q;sun.shadow.mapSize.set(q==='low'?1024:2048,q==='low'?1024:2048);}
  function update(dt,t,state={},player={x:0,z:12}){const war=Math.max(0,Math.min(1,Number(state.war)||0));waterMat.uniforms.time.value=t;skyMat.uniforms.burn.value=war;hemi.intensity=1.75-war*.3;sun.intensity=3.1-war*.55;sky.position.x=player.x*.5;sky.position.z=-110+player.z*.2;sun.position.set(player.x-60,95,player.z-60);sun.target.position.set(player.x,0,player.z-25);scene.fog.density=.0052+war*.0012;for(const m of damage)m.visible=state.phase>=(m.userData.damagePhase||1);const fall=comfort||state.phase!==1?1:Math.max(0,Math.min(1,(Number(state.phaseTime)||0)/1.2));for(const board of collapse.children){const p=board.userData.restPosition,r=board.userData.restRotation,u=Math.max(0,Math.min(1,(fall-(board.id%4)*.035)/.895));board.position.set(p.x+(1-u)*(board.id%2?2:-2),p.y+(1-u)*board.userData.fallHeight+Math.sin(u*Math.PI)*.7,p.z-(1-u)*2.4);board.rotation.set(r.x+(1-u)*1.5,r.y+(1-u)*.8,r.z+(1-u)*.9);}const warned=!!state.firstWarned&&state.phase===0;failingAwning.rotation.z=warned&&!comfort?Math.sin(t*29)*.014:0;for(let i=0;i<failingAwning.children.length;i++){const plank=failingAwning.children[i],p=plank.userData.start,u=state.phase===0?0:fall;plank.position.set(p.x+u*(i%2?.4:-.5),p.y-u*u*2.95+(warned&&!comfort?Math.sin(t*24+i)*.015:0),p.z+u*.7);plank.rotation.set(.14+u*(i%2?.5:-.4),u*.12,u*(i%3-1)*.22);}chips.visible=warned&&!comfort;if(chips.visible){for(let i=0;i<12;i++){const q=(t*1.3+i*.19)%1;dummy.position.set(4.4+i*.65,3.2-q*2.5,-44.9+Math.sin(i*2.2)*.4+q*.2);dummy.rotation.set(i+t,i*.4,t);dummy.scale.setScalar(1);dummy.updateMatrix();chips.setMatrixAt(i,dummy.matrix);}chips.instanceMatrix.needsUpdate=true;}const wp=Math.round(Math.max(0,Math.min(1,Number(state.workProgress)||0))*30)/30;if(wp!==oldWork){oldWork=wp;drawWork(wp);}const hp=Math.max(0,Math.min(1,Number(state.helpProgress)||(state.helped?1:0)));helpBeam.visible=state.phase>=3;const liftAngle=hp<=.7?.08+.36*(hp/.7):.44+.92*((hp-.7)/.3);helpBeam.position.set(22,.16,-93.25);helpBeam.rotation.z=liftAngle;pivotFoot.visible=helpBeam.visible;beamCollider.minX=state.phase<3?1000:21.8;beamCollider.maxX=state.phase<3?1001:22+4*Math.cos(liftAngle)+.2;const bp=Math.max(0,Math.min(1,Number(state.bridgeProgress)||(state.bridgeHelped?1:0)));bridgeCart.position.x=-20+bp*3.2;bridgeCollider.minX=bridgeCart.position.x-2.6;bridgeCollider.maxX=bridgeCart.position.x+2.6;braceCollider.minX=bridgeCart.position.x+2.6;braceCollider.maxX=bridgeCart.position.x+3.97;updateClosures(dt,state,player);stats.alleySealed=closures[0].active;stats.plazaCutoff=closures[1].active;for(const a of animated){a.mesh.rotation.y=.13+Math.sin(t*1.1+a.phase)*.035;a.mesh.rotation.z=Math.sin(t*.8+a.phase)*.015;}banner.rotation.z=Math.sin(t*.8)*.007;}
  function dispose(){scene.remove(root,hemi,sun,sun.target,fill,warm);for(const r of resources)r.dispose?.();}
  update(0,0,{phase:0,war:0});
  return {root,colliders,bounds,cover,update,setQuality,setReducedMotion,dispose,stats,textileTexture:tex.cloth,route:[{x:0,z:12},{x:0,z:-30},{x:24,z:-32},{x:24,z:-93},{x:24,z:-108},{x:20,z:-114},{x:0,z:-126},{x:-20,z:-150},{x:-20,z:-197},{x:-20,z:-220}]};
}
