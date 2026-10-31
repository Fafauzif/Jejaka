import {LAYOUT, DATA} from './layout.js';

/** Jejaka escape district. Original authored geometry, materials and destruction.
 * Mapped topology uses the recorded 50% presentation transform. Individual shops,
 * material colours, heights, damage and refuge use remain authored fiction.
 * Source reconstruction/research and the older games remain untouched. */
export function createWorld(THREE, scene, {quality='balanced'}={}) {
  const root=new THREE.Group();root.name='Kembang Djepoen — Kali Mas — Willemskade, compressed map district';scene.add(root);
  const colliders=[],cover=[],animated=[],resources=[],batches=new Map(),damage=[];
  const bounds={...LAYOUT.bounds};
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
  let detailTier=0; const dummy=new THREE.Object3D();function add(type,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const zx=detailTier?0:Math.floor(x/144),zz=detailTier?0:Math.floor(z/144),key=type+':'+m+':'+zx+':'+zz+':'+detailTier;if(!batches.has(key))batches.set(key,{type,m,items:[],detailTier,cx:zx*144+72,cz:zz*144+72});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
  const box=(m,x,y,z,w,h,d,ry=0,rz=0)=>add('box',m,x,y,z,w,h,d,0,ry,rz);
  const cyl=(m,x,y,z,r,h)=>add('cyl',m,x,y,z,r,h,r);
  const ball=(m,x,y,z,a,b=a,c=a)=>add('sphere',m,x,y,z,a,b,c);
  function solid(x,z,w,d,tag='architecture'){colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,tag});}
  function text(txt,x,y,z,w=4,h=.7,yaw=0,bg='#273d38',fg='#e2d0a9') {const c=document.createElement('canvas');c.width=1024;c.height=160;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,1024,160);g.strokeStyle=fg;g.lineWidth=3;g.strokeRect(8,8,1008,144);g.fillStyle=fg;g.font='bold 67px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,512,85,980);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshStandardMaterial({map:t,roughness:1});const geo=new THREE.PlaneGeometry(w,h);const mesh=new THREE.Mesh(geo,m);mesh.position.set(x,y,z);mesh.rotation.y=yaw;root.add(mesh);resources.push(t,m,geo);return mesh;}
  scene.background=new THREE.Color(0x9fa99b);scene.fog=new THREE.FogExp2(0xaab0a0,.0028);
  const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color(0x405e65)},bottom:{value:new THREE.Color(0xcbb996)},burn:{value:0}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform vec3 top,bottom;uniform float burn;void main(){float h=clamp(normalize(p).y*1.6,0.,1.);vec3 col=mix(bottom,top,pow(h,.6));col=mix(col,vec3(.52,.31,.22),burn*.38*(1.-h));gl_FragColor=vec4(col,1.);}' });
  const skyGeo=new THREE.SphereGeometry(800,24,16);const sky=new THREE.Mesh(skyGeo,skyMat);sky.position.set(0,0,-110);root.add(sky);resources.push(skyMat,skyGeo);
  const hemi=new THREE.HemisphereLight(0xb6d0d3,0x544435,1.75);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffd2a1,3.1);sun.position.set(-60,95,-85);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-70,right:70,top:80,bottom:-80,near:1,far:240});sun.shadow.normalBias=.035;sun.shadow.bias=-.00025;sun.target.position.set(0,0,-45);scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight(0x8eb4c1,.53);fill.position.set(35,18,15);scene.add(fill);
  function ground(cx,cz,w,d){const t=tex.stone.clone();t.repeat.set(w/3,d/3);t.needsUpdate=true;const m=mat.stone.clone();m.map=t;const g=new THREE.PlaneGeometry(w,d);const mesh=new THREE.Mesh(g,m);mesh.rotation.x=-Math.PI/2;mesh.position.set(cx,-.035,cz);mesh.receiveShadow=true;root.add(mesh);resources.push(t,m,g);}
  const route=LAYOUT.actorRoute.map(p=>({x:p.x,z:p.z})), W=LAYOUT.workshop,R=LAYOUT.rescue,F=LAYOUT.refuge,B=LAYOUT.crossing,C=LAYOUT.cart;
  const distSegment=(p,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz);};
  const pathDistance=(p,points)=>points.slice(1).reduce((d,q,i)=>Math.min(d,distSegment(p,points[i],q)),Infinity);
  const pointIn=(p,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)yes=!yes;}return yes;};
  const nearRoute=p=>pathDistance(p,route);
  // Background water tails are deliberate scenery extensions, not additional traced geography.
  const waterPolygons=DATA.waters.map(w=>({id:w.id,points:w.points.map(p=>({...p}))}));
  for(const w of waterPolygons){
    const n=w.points.length,half=w.points.findIndex(p=>Math.abs(p.x-w.points[0].x)===Math.max(...w.points.map(q=>Math.abs(q.x-w.points[0].x))))+1,a=w.points[0],b=w.points[half-1],c=w.points[half],d=w.points[n-1];
    const signStart=Math.sign(a.x-b.x)||-1,signEnd=-signStart;
    w.points=[{x:a.x+signStart*1400,z:a.z},...w.points.slice(0,half),{x:b.x+signEnd*1400,z:b.z},{x:c.x+signEnd*1400,z:c.z},...w.points.slice(half),{x:d.x+signStart*1400,z:d.z}];
  }
  const wet=p=>waterPolygons.some(w=>pointIn(p,w.points));
  const pavementTexture=tex.stone.clone();pavementTexture.repeat.set(.3,.3);resources.push(pavementTexture);
  const landMat=mat.stone.clone();landMat.map=pavementTexture;resources.push(landMat);
  const landShape=new THREE.Shape();landShape.moveTo(-2000,-2000);landShape.lineTo(2000,-2000);landShape.lineTo(2000,2000);landShape.lineTo(-2000,2000);landShape.closePath();
  for(const w of waterPolygons){const hole=new THREE.Path();w.points.forEach((p,i)=>i?hole.lineTo(p.x,-p.z):hole.moveTo(p.x,-p.z));hole.closePath();landShape.holes.push(hole);}
  const landGeo=new THREE.ShapeGeometry(landShape),land=new THREE.Mesh(landGeo,landMat);land.rotation.x=-Math.PI/2;land.position.y=-.035;land.receiveShadow=true;root.add(land);resources.push(landGeo);
  const waterMat=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec2 uvv;uniform float time;void main(){uvv=position.xz;vec3 p=position;p.y+=sin(p.x*.6+time*.5)*.022;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'varying vec2 uvv;uniform float time;void main(){float r=sin(uvv.x*2.+uvv.y*.8+sin(uvv.x*.23+time)*2.+time)*.5+.5;float glint=pow(max(0.,sin(uvv.y*3.+uvv.x*.4-time*.7)),24.);gl_FragColor=vec4(vec3(.15,.255,.235)+r*.025+glint*vec3(.12,.1,.06),1.);}'});resources.push(waterMat);
  const banks=[];
  for(const w of waterPolygons){
    const pts=w.points.map(p=>new THREE.Vector2(p.x,p.z)),tri=THREE.ShapeUtils.triangulateShape(pts,[]),positions=[];
    for(const face of tri)for(const i of face)positions.push(pts[i].x,-.48,pts[i].y);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();root.add(new THREE.Mesh(g,waterMat));resources.push(g);
    // Horizontal strips follow each bank, keeping the map-derived water out of walkable land.
    const minX=Math.max(bounds.minX-5,Math.min(...w.points.map(p=>p.x))),maxX=Math.min(bounds.maxX+5,Math.max(...w.points.map(p=>p.x)));
    for(let x=minX;x<maxX;x+=1.5){const zs=[],xx=x+.75;for(let i=0,j=w.points.length-1;i<w.points.length;j=i++){const a=w.points[i],b=w.points[j];if((a.x>xx)!==(b.x>xx))zs.push(a.z+(b.z-a.z)*(xx-a.x)/(b.x-a.x));}zs.sort((a,b)=>a-b);for(let i=0;i+1<zs.length;i+=2){const lo=zs[i],hi=zs[i+1];if(w.id==='W_KALIMAS'&&hi>B.minZ&&lo<B.maxZ&&x<B.railX[1]&&x+1.51>B.railX[0]){if(x<B.railX[0])colliders.push({minX:x,maxX:B.railX[0],minZ:lo,maxZ:hi,tag:'river'});if(x+1.51>B.railX[1])colliders.push({minX:B.railX[1],maxX:x+1.51,minZ:lo,maxZ:hi,tag:'river'});}else colliders.push({minX:x,maxX:x+1.51,minZ:lo,maxZ:hi,tag:'river'});}}
    // Only real traced bank segments receive quay walls. Long background tails remain water scenery.
    const original=DATA.waters.find(v=>v.id===w.id).points,half=original.findIndex(p=>Math.abs(p.x-original[0].x)===Math.max(...original.map(q=>Math.abs(q.x-original[0].x))))+1;
    for(const side of [original.slice(0,half),original.slice(half)])for(let i=1;i<side.length;i++){const a=side[i-1],b=side[i],len=Math.hypot(b.x-a.x,b.z-a.z),yaw=Math.atan2(b.x-a.x,b.z-a.z);box('brick',(a.x+b.x)/2,-.62,(a.z+b.z)/2,.55,1.1,len,yaw);box('creamtrim',(a.x+b.x)/2,-.02,(a.z+b.z)/2,.68,.16,len+.2,yaw);banks.push({a,b});}
  }
  // Narrow attached commercial bays follow mapped road centerlines, rather than an invented grid.
  const occupied=[],activityCandidates=[];let buildingCount=0,detailedBuildingCount=0;
  const names=['WARUNG KOPI','PENJAHIT','BERAS · GULA','TOKO KAIN','PERCETAKAN','TOKO KELONTONG'];
  const roadDistance=p=>DATA.roads.reduce((d,r)=>Math.min(d,pathDistance(p,r.points)-r.width/2),Infinity);
  function footprintClear(x,z,w,d,yaw,routeMargin=3.8){
    const c=Math.cos(yaw),s=Math.sin(yaw),samples=[];
    for(const dx of [-w/2,0,w/2])for(const dz of [-d/2,0,d/2])samples.push({x:x+dx*c+dz*s,z:z-dx*s+dz*c});
    if(samples.some(p=>wet(p)||nearRoute(p)<routeMargin||roadDistance(p)<1.7))return false;
    const mnx=Math.min(...samples.map(p=>p.x)),mxx=Math.max(...samples.map(p=>p.x)),mnz=Math.min(...samples.map(p=>p.z)),mxz=Math.max(...samples.map(p=>p.z));
    if(DATA.footprints.some(f=>mnx<Math.max(...f.points.map(p=>p.x))+1&&mxx>Math.min(...f.points.map(p=>p.x))-1&&mnz<Math.max(...f.points.map(p=>p.z))+1&&mxz>Math.min(...f.points.map(p=>p.z))-1))return false;
    const radius=Math.hypot(w,d)/2;
    return !occupied.some(b=>Math.hypot(b.x-x,b.z-z)<Math.min(radius,b.r)*1.35);
  }
  function building(x,z,w,d,h,i,yaw=0,level=0,label=''){
    const color=['cream','sage','ochre','grey','peach','teal'][i%6],co=Math.cos(yaw),si=Math.sin(yaw);
    detailTier=level;
    const p=(m,xx,y,zz,ww,hh,dd,rz=0)=>add('box',m,x+xx*co+zz*si,y,z-xx*si+zz*co,ww,hh,dd,0,yaw,rz);
    // A recessed shop front: side walls and interior back, not a dark plane painted on a solid cube.
    p(color,0,h/2,-d*.15,w,h,d*.7);p(color,-w*.46,1.48,d*.35,w*.08,2.96,d*.3);p(color,w*.46,1.48,d*.35,w*.08,2.96,d*.3);
    p('brick',-w*.44,.28,d*.49,w*.12,.55,.18);p('brick',w*.44,.28,d*.49,w*.12,.55,.18);p('creamtrim',0,3.1,d*.49,w+.18,.22,.27);
    p('roof',-w*.245,h+.55,0,w*.57,.14,d+1,.28);p('roof',w*.245,h+.55,0,w*.57,.14,d+1,-.28);p('roof',0,h+1.12,0,.2,.18,d+1);
    if(level<2){
      p('wood',0,1.4,d*.21,w*.74,2.7,.1);p('black',0,1.25,d*.23,w*.54,2.5,.12);
      for(const side of [-1,1]){p('wood',side*w*.35,1.38,d*.52,w*.14,2.7,.14);p('creamtrim',side*w*.46,1.5,d*.53,.17,3,.23);}
      p(i%2?'redcloth':'sage',0,2.96,d*.5+.9,w+.3,.08,2.0);for(const xx of [-w*.45,w*.45])p('darkwood',xx,1.45,d*.5+1.6,.065,2.9,.065);
      if(h>5){
        p('black',0,4.7,d*.36,w*.7,1.9,.12);for(const xx of [-w*.28,0,w*.28])p('wood',xx,4.7,d*.46,.065,1.9,.18);
        p('wood',0,3.64,d*.58,w*.84,.13,1.15);p('darkwood',0,4.15,d*.68,w*.84,.07,.06);for(let xx=-w*.38;xx<w*.4;xx+=.42)p('darkwood',xx,3.95,d*.68,.045,.48,.055);
      }
      if(level===0){
        for(let xx=-w*.4;xx<w*.43;xx+=.75)p('creamtrim',xx,3.25,d*.51,.08,.16,.23);
        const kind=['cloth','grocer','coffee','paper','closed','wood'][i%6],counterZ=d*.4;
        const local=(xx,zz)=>({x:x+xx*co+zz*si,z:z-xx*si+zz*co});
        const detailBall=(material,xx,y,zz,sx,sy=sx,sz=sx)=>{const q=local(xx,zz);ball(material,q.x,y,q.z,sx,sy,sz);};
        const detailCylinder=(material,xx,y,zz,r,hh)=>{const q=local(xx,zz);cyl(material,q.x,y,q.z,r,hh);};
        // Stocked shelves sit behind the counter, making the shop recess visible in oblique views.
        for(const yy of [.48,1.28,2.08])p('darkwood',w*.19,yy,d*.25,w*.48,.09,.48);
        if(kind==='closed'){
          for(let xx=-w*.31;xx<w*.33;xx+=.3)p(i%2?'sage':'wood',xx,1.4,d*.47,.27,2.75,.16);
          p('darkwood',0,1.35,d*.49,w*.68,.13,.15);
        }else{
          p('wood',0,.79,counterZ,w*.68,.14,.83);for(const xx of [-w*.28,w*.28])p('darkwood',xx,.4,counterZ,.08,.8,.56);
          if(kind==='cloth'){
            for(let k=0;k<4;k++){p(k%2?'textile':'whitecloth',-.8+k*.55,.96+k*.03,counterZ,.48,.18,.75);p(k%2?'redcloth':'textile',w*.16+k*.28,1.65,d*.28,.22,1.1,.2);}
            p('textile',-w*.31,1.95,d*.47,.62,1.35,.05);p('redcloth',w*.31,2.15,d*.47,.55,1.2,.05);
          }else if(kind==='grocer'){
            for(let k=0;k<4;k++){p('sack',w*.06+k*.4,.76,d*.28,.36,.58,.4);p('wood',-w*.25+k*.45,.96,counterZ,.4,.2,.65);for(let j=0;j<5;j++)detailBall(j%3?'fruit':'fruitgreen',-w*.25+k*.45+(j%2)*.13-.05,1.1+(j%3)*.03,counterZ+(Math.floor(j/2)-1)*.16,.11);}
            for(const xx of [-w*.29,w*.29])detailBall('sack',xx,.31,d*.49,.3,.39,.28);
          }else if(kind==='coffee'){
            for(let k=0;k<3;k++){detailCylinder('whitecloth',-.8+k*.6,.97,counterZ,.09,.16);detailCylinder('darkwood',-.8+k*.6,1.06,counterZ,.075,.012);}
            detailCylinder('clay',w*.2,1.12,d*.28,.16,.36);detailCylinder('brass',w*.3,1.12,counterZ,.16,.34);
            p('wood',-w*.28,.45,d*.49,.62,.1,.55);p('darkwood',-w*.28,.22,d*.49,.12,.44,.12);
          }else if(kind==='paper'){
            for(let k=0;k<4;k++)p(k%2?'whitecloth':'sack',-.9+k*.5,.91+k*.02,counterZ,.44,.09,.58);
            for(let k=0;k<6;k++)p('whitecloth',w*.05+k*.23,1.48,d*.28,.17,.32,.25);
            p('black',-.7,.91,counterZ-.18,.27,.025,.37);
          }else{
            for(let k=0;k<5;k++)p(k%2?'wood':'darkwood',-.7+k*.32,.98+k*.04,counterZ,.23,.14,.9);
            detailBall('sack',w*.23,.38,d*.48,.28,.4,.24);
          }
          const vendor=local(-w*.22,d*.5+1.9),customer=local(w*.16,d*.5+1.9);
          activityCandidates.push({...vendor,yaw,kind,customer});
        }
        // Asymmetric shutters, shade curtains and upper drying cloth break repeated-bay rhythm.
        if(i%3===0)p('sage',-w*.32,4.55,d*.53,w*.18,1.7,.13);
        if(i%4===0)p('whitecloth',w*.18,3.83,d*.7,w*.27,.46,.05);
        if(i%5===0)p('redcloth',-w*.36,2.7,d*.58,.33,.75,.04);
        if(label)text(label,x+(d*.5+.05)*si,3.45,z+(d*.5+.05)*co,Math.min(w-.4,5),.55,yaw);
      }
    }
    const hx=Math.abs(co)*w/2+Math.abs(si)*d/2,hz=Math.abs(si)*w/2+Math.abs(co)*d/2;
    if(x+hx>bounds.minX&&x-hx<bounds.maxX&&z+hz>bounds.minZ&&z-hz<bounds.maxZ){
      if(level>0)solid(x,z,hx*2,hz*2,'architecture');
      else{
        const obstacle=(xx,zz,ww,dd,tag='architecture')=>{const ox=x+xx*co+zz*si,oz=z-xx*si+zz*co,rx=Math.abs(co)*ww/2+Math.abs(si)*dd/2,rz=Math.abs(si)*ww/2+Math.abs(co)*dd/2;solid(ox,oz,rx*2,rz*2,tag);};
        obstacle(0,-d*.15,w,d*.7);obstacle(-w*.46,d*.35,w*.08,d*.3);obstacle(w*.46,d*.35,w*.08,d*.3);
        if(i%6===4)obstacle(0,d*.47,w*.68,.16);else obstacle(0,d*.4,w*.68,.83,'counter');
      }
    }occupied.push({x,z,r:Math.hypot(w,d)/2});buildingCount++;if(level===0)detailedBuildingCount++;
    detailTier=0;
  }
  // Named/indexed footprints are unconditional solids. Routes must avoid them;
  // geometry is never silently removed because a proposed route crosses it.
  let mappedBuildingCount=0;
  for(const f of DATA.footprints){
    if(f.id==='F_SCHOOL_63')continue; // Authored doorway/interior shell is built below.
    const points=f.points,shape=new THREE.Shape();points.forEach((p,i)=>i?shape.lineTo(p.x,-p.z):shape.moveTo(p.x,-p.z));shape.closePath();
    const height=f.id==='F_CHURCH_81'?9.5:f.id==='F_POST_7'?7.8:7.2;
    const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1}),mesh=new THREE.Mesh(geo,mat.cream);mesh.rotation.x=-Math.PI/2;mesh.receiveShadow=mesh.castShadow=true;mesh.name=f.label;mesh.userData={sourceId:DATA.source.id,footprintId:f.id,evidence:f.evidence,heightEvidence:'authored, not surveyed'};root.add(mesh);resources.push(geo);
    const roofGeo=new THREE.ShapeGeometry(shape),roof=new THREE.Mesh(roofGeo,mat.roof);roof.rotation.x=-Math.PI/2;roof.position.y=height+.08;root.add(roof);resources.push(roofGeo);
    const area=points.reduce((sum,p,i)=>sum+p.x*points[(i+1)%points.length].z-points[(i+1)%points.length].x*p.z,0),direction=area>0?1:-1;
    for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),nx=dz/len*direction,nz=-dx/len*direction,yaw=-Math.atan2(dz,dx);
      box('creamtrim',(a.x+b.x)/2+nx*.12,3.25,(a.z+b.z)/2+nz*.12,len,.2,.4,yaw);
      for(let at=1.5;at<len-1;at+=3.2)for(const y of [1.7,4.85]){const x=a.x+dx*at/len+nx*.07,z=a.z+dz*at/len+nz*.07;box('window',x,y,z,1.55,2.15,.14,yaw);box('wood',x+nx*.06,y,z+nz*.06,.075,2.25,.16,yaw);box('creamtrim',x+nx*.05,y+1.15,z+nz*.05,1.85,.16,.3,yaw);}
    }
    const loZ=Math.min(...points.map(p=>p.z)),hiZ=Math.max(...points.map(p=>p.z));
    for(let z=loZ;z<hiZ;z+=.6){const zz=Math.min(z+.3,hiZ-1e-5),xs=[];for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.z>zz)!==(b.z>zz))xs.push(a.x+(b.x-a.x)*(zz-a.z)/(b.z-a.z));}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)colliders.push({minX:xs[i]-.12,maxX:xs[i+1]+.12,minZ:z,maxZ:Math.min(z+.61,hiZ),tag:'architecture',sourceFeature:f.id});}
    mappedBuildingCount++;
  }
  for(const road of DATA.roads){
    for(let j=1;j<road.points.length;j++){
      const a=road.points[j-1],b=road.points[j],len=Math.hypot(b.x-a.x,b.z-a.z),tx=(b.x-a.x)/len,tz=(b.z-a.z)/len;
      for(let along=5;along<len-3;along+=8.2){
        const center={x:a.x+tx*along,z:a.z+tz*along};
        for(const side of [-1,1]){
          const depth=8.2+(buildingCount%3)*.8,offset=road.width/2+depth/2+2.5,x=center.x+tz*side*offset,z=center.z-tx*side*offset,yaw=Math.atan2(-tz*side,tx*side),dr=nearRoute({x,z});
          if(x<-490||x>470||z<-630||z>300||!footprintClear(x,z,7.8,depth,yaw))continue;
          const level=dr<52?0:dr<145?1:2;
          building(x,z,7.8,depth,level===2?7+(buildingCount%3):6.7+(buildingCount%4)*.55,buildingCount,yaw,level,road.id==='R_KEMBANG'&&buildingCount%3===0?names[buildingCount%names.length]:'');
        }
      }
    }
  }
  // Fill the rear of blocks. These representative masses are not individually documented buildings.
  for(let x=-500;x<=475;x+=20)for(let z=-640;z<=300;z+=21){
    const xx=x+(rand()-.5)*3,zz=z+(rand()-.5)*3,dr=nearRoute({x:xx,z:zz});
    if(dr<15||!footprintClear(xx,zz,15,16,0,8))continue;
    building(xx,zz,15,16,6.5+(buildingCount%4)*.65,buildingCount,0,dr<65?1:2);
  }
  // Beyond the map crop, cheap roof/back-block silhouettes close long street views.
  for(let x=-950;x<=925;x+=31)for(const z of [-760,-728,398,430])if(!wet({x,z})){
    detailTier=2;box('grey',x,5,z,29,10,29);box('roof',x,10.4,z,30,.6,30);detailTier=0;
  }
  for(let z=-750;z<=425;z+=31)for(const x of [-930,-900,850,882])if(!wet({x,z})){
    detailTier=2;box('teal',x,5,z,29,10,29);box('roof',x,10.4,z,30,.6,30);detailTier=0;
  }
  // A single playable low, open-railing crossing. Red is an authored presentation palette.
  const bridgeLength=B.length+1.2,bz=B.center.z;
  box('darkwood',-20,-.21,bz,8,.42,B.length+5);for(let z=B.minZ-2.4;z<B.maxZ+2.4;z+=.6)box('stone',-20,.015,z,8,.055,.56);
  for(const x of B.railX){
    box('rust',x,.79,bz,.13,.13,bridgeLength);box('rust',x,1.24,bz,.13,.13,bridgeLength);
    for(let z=B.minZ-.5;z<B.maxZ+.5;z+=2.4){box('rust',x,.66,z,.16,1.45,.16);add('box','rust',x,.64,z+1.1,.085,.085,2.5,.43,0,0);add('box','rust',x,.64,z+1.1,.085,.085,2.5,-.43,0,0);}
    solid(x,bz,.25,bridgeLength,'bridge rail');
  }
  for(const x of [-24.4,-15.6])for(const z of [B.minZ-.8,B.maxZ+.8]){box('brick',x,.59,z,.6,1.2,.6);box('creamtrim',x,1.22,z,.78,.13,.78);}
  // The school follows its actual coarse polygon, with an authored doorway and interior.
  const school=LAYOUT.school.footprint.points,frontA=school[1],frontB=school[2],frontDX=frontB.x-frontA.x,frontDZ=frontB.z-frontA.z,frontL=Math.hypot(frontDX,frontDZ),frontT=(F.x-frontA.x)/frontDX,doorCenter={x:F.x,z:frontA.z+frontDZ*frontT},doorHalf=2.75;
  function schoolWall(a,b){const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx),x=(a.x+b.x)/2,z=(a.z+b.z)/2;box('cream',x,3.3,z,len,6.6,.45,yaw);box('creamtrim',x,6.35,z,len,.2,.65,yaw);const hx=Math.abs(dx)/2+.22,hz=Math.abs(dz)/2+.22;solid(x,z,hx*2,hz*2,'architecture');}
  for(let i=0;i<school.length;i++){if(i===1)continue;schoolWall(school[i],school[(i+1)%school.length]);}
  const doorLeft={x:doorCenter.x-frontDX/frontL*doorHalf,z:doorCenter.z-frontDZ/frontL*doorHalf},doorRight={x:doorCenter.x+frontDX/frontL*doorHalf,z:doorCenter.z+frontDZ/frontL*doorHalf};schoolWall(frontA,doorLeft);schoolWall(doorRight,frontB);const frontYaw=-Math.atan2(frontDZ,frontDX);box('cream',doorCenter.x,5.6,doorCenter.z,doorHalf*2,2,.45,frontYaw);
  const schoolShape=new THREE.Shape();school.forEach((p,i)=>i?schoolShape.lineTo(p.x,-p.z):schoolShape.moveTo(p.x,-p.z));schoolShape.closePath();const schoolRoofGeo=new THREE.ShapeGeometry(schoolShape),schoolRoof=new THREE.Mesh(schoolRoofGeo,mat.roof);schoolRoof.rotation.x=-Math.PI/2;schoolRoof.position.y=6.85;root.add(schoolRoof);resources.push(schoolRoofGeo);
  const schoolFloorGeo=new THREE.ShapeGeometry(schoolShape),schoolFloor=new THREE.Mesh(schoolFloorGeo,mat.darkwood);schoolFloor.rotation.x=-Math.PI/2;schoolFloor.position.y=-.018;root.add(schoolFloor);resources.push(schoolFloorGeo);
  const schoolArea=school.reduce((v,p,i)=>v+p.x*school[(i+1)%school.length].z-school[(i+1)%school.length].x*p.z,0),schoolSign=schoolArea>0?1:-1,nx=frontDZ/frontL*schoolSign,nz=-frontDX/frontL*schoolSign,textYaw=Math.atan2(nx,nz);
  for(const t of [.13,.85]){const x=frontA.x+frontDX*t+nx*.26,z=frontA.z+frontDZ*t+nz*.26;box('window',x,3.4,z,1.6,2.2,.09,frontYaw);box('wood',x+nx*.07,3.4,z+nz*.07,.07,2.3,.13,frontYaw);}
  text('SEKOLAH',doorCenter.x+nx*.3,5.0,doorCenter.z+nz*.3,7,.75,textYaw);text('TEMPAT BERLINDUNG',doorCenter.x+nx*.32,3.7,doorCenter.z+nz*.32,5.1,.6,textYaw);
  // Original small props remain separate from historical architecture.
  function crate(x,z,s=1,blocking=true){box('wood',x,s/2,z,s,s,s);box('darkwood',x,s*.25,z+s*.51,s,.08,.04);box('darkwood',x,s*.72,z+s*.51,s,.08,.04);if(blocking){solid(x,z,s,s,'crate');cover.push({x,z,r:s*.9});}}
  function barrel(x,z,r=.4){cyl('wood',x,.57,z,r,1.15);for(const y of [.16,.95])cyl('iron',x,y,z,r+.015,.06);cyl('darkwood',x,1.16,z,r,.04);solid(x,z,r*2,r*2,'barrel');cover.push({x,z,r:r+1});}
  function plant(x,z,s=1){cyl('clay',x,.22*s,z,.25*s,.44*s);for(let j=0;j<5;j++)ball('leaves',x+Math.cos(j)*.18*s,.65*s,z+Math.sin(j)*.18*s,.2*s,.38*s,.11*s);}
  function lamp(x,z){cyl('iron',x,2.1,z,.055,4.2);box('iron',x,4.23,z,.4,.1,.4);box('glow',x,3.98,z,.22,.4,.22);box('iron',x,3.74,z,.35,.07,.35);}
  function cart(x,z,ry=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;root.add(g);const p=(m,xx,y,zz,w,h,d)=>{const me=new THREE.Mesh(boxGeo,mat[m]);me.position.set(xx,y,zz);me.scale.set(w,h,d);me.castShadow=true;g.add(me);};p('wood',0,.75,0,1.5,.18,2.2);for(const xx of [-.76,.76])p('wood',xx,1,0,.1,.5,2.2);for(const xx of [-.5,.5])p('darkwood',xx,.65,-1.8,.07,.07,1.7);for(const xx of [-.92,.92]){const geo=new THREE.TorusGeometry(.45,.045,6,18),me=new THREE.Mesh(geo,mat.darkwood);me.rotation.y=Math.PI/2;me.position.set(xx,.45,.15);g.add(me);resources.push(geo);}solid(x,z,2,3,'cart');return g;}
  for(let i=0;i<route.length-1;i++){
    const a=route[i],b=route[i+1],len=Math.hypot(b.x-a.x,b.z-a.z),tx=(b.x-a.x)/(len||1),tz=(b.z-a.z)/(len||1);
    if(i>=9&&i<=11)continue;
    for(let along=9;along<len-3;along+=19){const x=a.x+tx*along+tz*5.7,z=a.z+tz*along-tx*5.7;if(wet({x,z}))continue;lamp(x,z);if(i%3===0)plant(x+tz*1.1,z-tx*1.1,.8);}
  }
  for(const p of [W,R,LAYOUT.plaza,LAYOUT.quayBreather]){crate(p.x-4,p.z+1,1.1);barrel(p.x-5.2,p.z+1.4,.4);}
  // The protected crate is placed to one side; the center route stays usable when unprotected.
  const coverSide=Math.sign(LAYOUT.events.coverImpact.x-LAYOUT.cover.x)||1;crate(LAYOUT.cover.x+coverSide*1.2,LAYOUT.cover.z-1,1.25);crate(LAYOUT.cover.x+coverSide*1.4,LAYOUT.cover.z-2.1,.9);barrel(LAYOUT.cover.x+coverSide*2.3,LAYOUT.cover.z-1,.43);
  // Workshop relative to Sari's root, keeping the working plane at readable hand height.
  box('darkwood',W.x-1.5,.88,W.z+1.62,3,.16,2.5);for(const x of [W.x-2.7,W.x-.3])for(const z of [W.z+.62,W.z+2.62])cyl('wood',x,.42,z,.055,.84);box('textile',W.x-1.2,.98,W.z+1.3,2.2,.035,1.8);solid(W.x-1.5,W.z+1.62,3,2.5,'worktable');
  for(const x of [W.x-2.9,W.x+.1])cyl('wood',x,1.5,W.z-1.5,.055,3);box('darkwood',W.x-1.4,2.9,W.z-1.5,3.2,.09,.1);box('textile',W.x-1.4,1.95,W.z-1.5,2.8,1.8,.04);
  cyl('brass',W.x-2.3,1.07,W.z+2.1,.16,.17);cyl('black',W.x-2.3,1.17,W.z+2.1,.125,.02);text('BATIK · JAHIT',W.x-1.4,3.45,W.z-1.35,3.8,.6);
  const workCanvas=document.createElement('canvas');workCanvas.width=workCanvas.height=512;const workCtx=workCanvas.getContext('2d'),workTexture=new THREE.CanvasTexture(workCanvas);workTexture.colorSpace=THREE.SRGBColorSpace;
  const workMaterial=new THREE.MeshStandardMaterial({map:workTexture,roughness:1}),workGeometry=new THREE.PlaneGeometry(1.45,.85,8,6),workSample=new THREE.Mesh(workGeometry,workMaterial);workSample.position.set(W.x-.4,1.08,W.z+1);workSample.rotation.y=Math.PI/3;workSample.rotation.x=-.07;root.add(workSample);resources.push(workTexture,workMaterial,workGeometry);
  let oldWork='';
  function drawWork(stage,progress){
    const g=workCtx;g.fillStyle=stage===0?'#e6dfc7':'#203b46';g.fillRect(0,0,512,512);
    const lerp=(a,b)=>Math.round(a+(b-a)*progress),wax=stage===0?'#886a2e':stage===1?'#baa05a':`rgb(${lerp(186,235)},${lerp(160,223)},${lerp(90,192)})`;g.strokeStyle=wax;g.lineWidth=11;
    const visible=stage===0?Math.max(0,progress):1;
    g.save();g.beginPath();g.rect(512*(1-visible),0,512*visible,512);g.clip();
    for(let yy=48;yy<512;yy+=104)for(let xx=48;xx<512;xx+=104){g.save();g.translate(xx,yy);for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.beginPath();g.ellipse(20,0,23,9,0,0,Math.PI*2);g.stroke();}g.restore();}g.restore();
    if(stage===1){g.fillStyle='rgba(221,211,167,.16)';g.fillRect(0,0,512*(1-progress),512);}if(stage===2){g.strokeStyle='#eee1bd';g.lineWidth=11;g.strokeRect(9,9,494,494);}workTexture.needsUpdate=true;
  }
  // Large-enough silhouette to distinguish wooden handle, wax bowl and narrow spout.
  const canting=new THREE.Group();root.add(canting);const handle=new THREE.Mesh(boxGeo,mat.wood);handle.scale.set(.035,.035,.24);handle.position.z=.1;canting.add(handle);const cup=new THREE.Mesh(cylGeo,mat.brass);cup.scale.set(.075,.065,.075);cup.position.set(0,0,-.07);canting.add(cup);const spout=new THREE.Mesh(cylGeo,mat.brass);spout.scale.set(.012,.16,.012);spout.rotation.x=.9;spout.position.set(0,-.045,-.17);canting.add(spout);canting.position.set(W.x-1.8,1.21,W.z+.7);canting.rotation.set(.08,.4,.1);
  const waxDrop=new THREE.Mesh(sphereGeo,mat.brass);waxDrop.scale.set(.02,.045,.02);root.add(waxDrop);
  const bowlGeo=new THREE.CylinderGeometry(.24,.2,.21,12,1,true),bowl=new THREE.Mesh(bowlGeo,mat.brass);bowl.position.set(W.x-1.8,1.08,W.z+.7);root.add(bowl);resources.push(bowlGeo);
  // One beam remains an actual rotating obstacle rather than a caption-only gate.
  const helpBeam=new THREE.Group();helpBeam.name='Broken drying rack';root.add(helpBeam);
  const rackParts=[];const rackPart=(x,y,z,w,h,d,ry=0,rz=0)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,ry,rz);dummy.scale.set(w,h,d);dummy.updateMatrix();rackParts.push(dummy.matrix.clone());};
  rackPart(2,.11,-.24,4,.15,.14);rackPart(2,.11,.24,4,.15,.14);rackPart(.46,.13,0,.16,.15,.82);rackPart(3.5,.13,0,.16,.15,.82);rackPart(1.31,.22,.02,1.85,.09,.18,.18,.015);rackPart(2.97,.23,.11,1.25,.1,.18,-.15,-.018);
  const rackMesh=new THREE.InstancedMesh(boxGeo,mat.wood,rackParts.length);rackParts.forEach((m,i)=>rackMesh.setMatrixAt(i,m));rackMesh.castShadow=true;helpBeam.add(rackMesh);
  const pivotFoot=new THREE.Mesh(boxGeo,mat.darkwood);pivotFoot.position.set(R.x-2.65,.1,R.z-.52);pivotFoot.scale.set(.44,.2,.88);root.add(pivotFoot);
  const beamCollider={minX:1000,maxX:1001,minZ:R.z-.77,maxZ:R.z-.16,tag:'help beam'};colliders.push(beamCollider);
  const bridgeCart=cart(C.x,C.z),bridgeCollider=colliders[colliders.length-1];
  const matLoad=new THREE.Group();bridgeCart.add(matLoad);for(let i=0;i<3;i++){const m=new THREE.Mesh(cylGeo,mat.sack);m.rotation.z=Math.PI/2;m.position.set(0,1.37,(i-1)*.6);m.scale.set(.19,5.2,.19);matLoad.add(m);}const platform=new THREE.Mesh(boxGeo,mat.wood);platform.position.set(0,1.15,0);platform.scale.set(5.2,.17,1.95);matLoad.add(platform);
  const outrigger=new THREE.Mesh(boxGeo,mat.wood);outrigger.position.set(-3.2,1.08,-.42);outrigger.rotation.z=.16;outrigger.scale.set(1.38,.1,1.7);matLoad.add(outrigger);const braceCollider={minX:C.x-3.97,maxX:C.x-2.6,minZ:C.z-1.3,maxZ:C.z+1,tag:'cart outrigger'};colliders.push(braceCollider);
  const refugeBench=new THREE.Group();refugeBench.name='School refuge bench';refugeBench.position.set(F.x,0,F.z);root.add(refugeBench);const refugePart=(m,x,y,z,w,h,d)=>{const me=new THREE.Mesh(boxGeo,mat[m]);me.position.set(x,y,z);me.scale.set(w,h,d);refugeBench.add(me);};refugePart('wood',0,.46,0,4.2,.12,.68);refugePart('darkwood',-1.7,.22,0,.14,.44,.52);refugePart('darkwood',1.7,.22,0,.14,.44,.52);refugePart('darkwood',0,.75,-.26,4.2,.16,.11);refugePart('textile',-1.4,.54,.04,.8,.06,.44);
  const waterTable={x:F.x+3,z:F.z+.05};box('wood',waterTable.x,.62,waterTable.z,1.15,.12,.85);for(const dx of [-.46,.46])for(const dz of [-.32,.32])box('darkwood',waterTable.x+dx,.3,waterTable.z+dz,.07,.6,.07);cyl('clay',waterTable.x,.79,waterTable.z,.13,.22);solid(waterTable.x,waterTable.z,1.15,.85,'refuge water table');
  // Authored wayfinding uses map-supported names, not claimed surviving 1945 signs.
  text('KEMBANG DJEPOEN',W.x+5.1,3.4,W.z-8,5.5,.52,0,'#d0c8af','#263932');
  text('JEMBATAN MERAH',B.east.x-1,2.45,B.east.z+8,5,.54,0,'#d0c8af','#263932');
  text('KALI MAS',B.railX[0]+.06,1.52,B.center.z,3.2,.46,Math.PI/2,'#c7bca0','#263932');
  text('WILLEMSKADE',B.west.x-15,2.65,B.west.z-8,4.7,.52,Math.PI/2,'#d0c8af','#263932');
  // The scripted damage is fiction and affects local shop furniture, not a claimed landmark attack.
  const collapse=new THREE.Group();collapse.name='Fictional market awning failure';root.add(collapse);const blast=LAYOUT.events.marketClosure;
  for(let i=0;i<12;i++){const m=new THREE.Mesh(boxGeo,mat[i%3?'wood':'roof']);m.position.set(blast.x+3+(rand()-.5)*3,.2+rand()*.4,blast.z+(rand()-.5)*3);m.scale.set(.7+rand()*1.4,.15,.4+rand()*.4);m.rotation.set(rand()*.4,rand()*3,rand()*.2);m.userData.restPosition=m.position.clone();m.userData.restRotation=m.rotation.clone();m.userData.fallHeight=3+rand()*2;collapse.add(m);}damage.push(collapse);
  for(const f of LAYOUT.fireSites)for(let i=0;i<8;i++){const m=new THREE.Mesh(boxGeo,mat[i%3?'brick':'wood']);m.position.set(f.x+(rand()-.5)*3,.08+rand()*.2,f.z+(rand()-.5)*3);m.scale.set(.25+rand()*.5,.16,.2+rand()*.4);m.rotation.set(rand(),rand()*3,rand());m.userData.damagePhase=f.phase;root.add(m);damage.push(m);}
  const closures=[];
  function closure(key,p){const group=new THREE.Group();root.add(group);const parts=[];for(let i=0;i<9;i++){const m=new THREE.Mesh(boxGeo,mat[i%3?'wood':'roof']);m.scale.set(.6,.15,1.8);group.add(m);parts.push(m);}const c={minX:1000,maxX:1001,minZ:p.z-1.4,maxZ:p.z+1.4,tag:key==='alleySealed'?'sealed alley':'plaza cutoff'};colliders.push(c);closures.push({key,p,group,parts,collider:c,active:false,age:0});}
  closure('alleySealed',{x:LAYOUT.cover.x+5,z:LAYOUT.cover.z+8});closure('plazaCutoff',{x:LAYOUT.plaza.x+7,z:LAYOUT.plaza.z-7});
  function updateClosures(dt,state,player){const guests=state.groupPositions||[],occupants=[player,...guests];for(const c of closures){const requested=!!state[c.key],clear=occupants.every(p=>Math.hypot(p.x-c.p.x,p.z-c.p.z)>4);if(!requested){c.active=false;c.age=0;}else if(!c.active&&clear){c.active=true;c.age=0;stats.closureEvents++;stats.lastClosure={key:c.key,x:c.p.x,z:c.p.z,time:state.time||0};}if(c.active)c.age+=dt;const u=c.active?(comfort?1:Math.min(1,c.age/1.1)):0;c.parts.forEach((m,i)=>{m.position.set(c.p.x+(i%3-1)*.8,.2+(1-u)*4+(i%2)*.12,c.p.z+(Math.floor(i/3)-1)*.7);m.rotation.set(u*.3,i*.6,u*(i%2?.2:-.3));});c.group.visible=c.active;c.collider.minX=c.active?c.p.x-1.45:1000;c.collider.maxX=c.active?c.p.x+1.45:1001;}}
  const siteClear=p=>!colliders.some(b=>{const x=Math.max(b.minX,Math.min(p.x,b.maxX)),z=Math.max(b.minZ,Math.min(p.z,b.maxZ));return (x-p.x)**2+(z-p.z)**2<.27**2;});
  scene.userData.escapeActivitySites=activityCandidates.filter(p=>Math.hypot(p.x-W.x,p.z-W.z)<56&&siteClear(p)&&siteClear(p.customer));
  // Build static instances only after all architectural and prop pieces have been appended.
  const chunkMeshes=[];
  for(const [key,b] of batches){const geo=b.type==='box'?boxGeo:b.type==='cyl'?cylGeo:sphereGeo,mesh=new THREE.InstancedMesh(geo,mat[b.m],b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.name='Grounded city '+key;mesh.castShadow=b.detailTier===0&&!['leaves','leaveslight','glow'].includes(b.m);mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);chunkMeshes.push({mesh,...b});}
  const warm=new THREE.PointLight(0xffb56c,7,9,2);warm.position.set(W.x-1,2.8,W.z+1);scene.add(warm);
  const stats={staticBatches:batches.size,colliders:colliders.length,scene:'map-guided Kembang–Kali Mas–Willemskade district',footprintMetres:[bounds.maxX-bounds.minX,bounds.maxZ-bounds.minZ],buildings:buildingCount,mappedBuildings:mappedBuildingCount+1,detailedBuildings:detailedBuildingCount,activitySites:scene.userData.escapeActivitySites.length,playableBridges:1,distanceScale:.5,mapSource:DATA.source.id,closureEvents:0,lastClosure:null,visibleBatches:0};
  function setReducedMotion(v){comfort=!!v;}
  function setQuality(q){tier=q;sun.shadow.mapSize.set(q==='low'?1024:2048,q==='low'?1024:2048);}
  let lastLOD=-1;
  function update(dt,t,state={},player=LAYOUT.spawn){
    const war=Math.max(0,Math.min(1,Number(state.war)||0));waterMat.uniforms.time.value=t;skyMat.uniforms.burn.value=war;hemi.intensity=1.9-war*.2;sun.intensity=2.7-war*.35;fill.intensity=.7;sky.position.set(player.x,0,player.z);sun.position.set(player.x-60,95,player.z-60);sun.target.position.set(player.x,0,player.z-25);scene.fog.density=.0028+war*.0005;
    if(t-lastLOD>.25||lastLOD<0){lastLOD=t;let visible=0;for(const c of chunkMeshes){const d=Math.hypot(c.cx-player.x,c.cz-player.z);c.mesh.visible=c.detailTier===0?d<(tier==='low'?110:160):c.detailTier===1?true:true;if(c.mesh.visible)visible++;}stats.visibleBatches=visible;}
    for(const m of damage)m.visible=state.phase>=(m.userData.damagePhase||1);
    const fall=comfort||state.phase!==1?1:Math.max(0,Math.min(1,(Number(state.phaseTime)||0)/1.2));for(const board of collapse.children){const p=board.userData.restPosition,r=board.userData.restRotation;board.position.set(p.x,p.y+(1-fall)*board.userData.fallHeight,p.z);board.rotation.set(r.x+(1-fall),r.y,r.z+(1-fall)*.7);}
    const sampleStage=Math.max(0,Number(state.workStage)||0),stage=Math.min(2,state.workStarted||state.learned?sampleStage:Math.max(0,sampleStage-1)),progress=state.learned||(!state.workStarted&&sampleStage>0)?1:Math.max(0,Math.min(1,Number(state.workProgress)||0)),workKey=stage+':'+Math.round(progress*30);
    if(workKey!==oldWork){oldWork=workKey;drawWork(stage,progress);}canting.visible=state.phase===0;waxDrop.visible=false;
    const hp=Math.max(0,Math.min(1,Number(state.helpProgress)||(state.helped?1:0))),falling=state.phase===3&&hp===0&&!comfort?Math.max(0,1-(Number(state.phaseTime)||0)/.8):0,liftAngle=state.phase<3?Math.PI/2:hp<=.7?.44*(hp/.7)+falling*Math.PI/2:.44+.92*((hp-.7)/.3);helpBeam.visible=state.phase>=2;helpBeam.position.set(R.x-2.65,.08,R.z-.52);helpBeam.rotation.z=liftAngle;pivotFoot.visible=helpBeam.visible;beamCollider.minX=state.phase<3?1000:R.x-2.85;beamCollider.maxX=state.phase<3?1001:R.x-2.65+4*Math.cos(liftAngle)+.2;
    const bp=Math.max(0,Math.min(1,Number(state.bridgeProgress)||(state.bridgeHelped?1:0)));bridgeCart.position.x=C.x+bp*LAYOUT.cartShift;bridgeCollider.minX=bridgeCart.position.x-2.6;bridgeCollider.maxX=bridgeCart.position.x+2.6;braceCollider.minX=bridgeCart.position.x-3.97;braceCollider.maxX=bridgeCart.position.x-2.6;
    updateClosures(dt,state,player);stats.alleySealed=closures[0].active;stats.plazaCutoff=closures[1].active;
  }
  function dispose(){scene.remove(root,hemi,sun,sun.target,fill,warm);for(const r of resources)r.dispose?.();}
  update(0,0,{phase:0,war:0,workStage:0,workProgress:0});
  return {root,colliders,bounds,cover,update,setQuality,setReducedMotion,dispose,stats,textileTexture:tex.cloth,route};
}
