import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Original delivery textures, in physical metre scales. They are production
// materials, not a record of the colour/construction of a particular address.
export function makeSurfaceKit(renderer) {
  const textures = [], materials = [];
  let seed=721945;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const maps={};
  for(const kind of ['plaster','setts','earth','roof','wood','stone','canvas','road']) {
    const size=512,c=document.createElement('canvas'),h=document.createElement('canvas');c.width=c.height=h.width=h.height=size;
    const ctx=c.getContext('2d'),hx=h.getContext('2d'),im=ctx.createImageData(size,size),hm=hx.createImageData(size,size);
    const grain=Array.from({length:4096},random);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const n=random(),gx=Math.floor(x/8),gy=Math.floor(y/8),fx=(x%8)/8,fy=(y%8)/8,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),g00=grain[gy*64+gx],g10=grain[gy*64+(gx+1)%64],g01=grain[((gy+1)%64)*64+gx],g11=grain[((gy+1)%64)*64+(gx+1)%64],cloud=(g00*(1-sx)+g10*sx)*(1-sy)+(g01*(1-sx)+g11*sx)*sy,i=(y*size+x)*4;
      let col=[.76,.73,.66],v=.92+.1*cloud+.04*n,height=.5+.15*n;
      if(kind==='road'){col=[.48,.465,.44];v=.93+.06*cloud+.1*n;height=.42+.16*n;}
      else if(kind==='setts'){
        const row=Math.floor(y/65),xx=(x+(row%2)*43)%86,yy=y%65;
        const joint=Math.min(xx,86-xx,yy,65-yy)<2;
        const block=grain[(row*31+Math.floor((x+(row%2)*43)/86))%4096];
        col=[.53,.52,.47];v=joint?.49:.84+.29*block+.11*n;height=joint?.18:.68+.09*n;
      } else if(kind==='earth') {col=[.51,.49,.42];v=.9+.1*cloud+.07*n;height=.42+.18*n;}
      else if(kind==='roof') {
        const xx=(x%51.2)/51.2,yy=(y%102.4)/102.4,seam=yy<.033;
        const tile=grain[(Math.floor(y/102.4)*11+Math.floor(x/51.2))%4096];
        col=[.47,.235,.14];v=(seam?.47:.76+.22*Math.sin(xx*Math.PI)+.28*tile)+.06*n;height=seam?.18:.45+.34*Math.sin(xx*Math.PI)+yy*.08;
      } else if(kind==='canvas') {col=[.72,.66,.53];v=.9+.04*n+.055*Math.sin(x*Math.PI)*Math.sin(y*Math.PI);height=.48+.12*((x+y)%2);}
      else if(kind==='wood') {col=[.31,.215,.135];v=.74+.23*Math.sin(x*.17+Math.sin(y*.014)*.8)+.13*n;const joint=x%128<2;height=joint?.15:.52+.15*Math.sin(x*.17)+.1*n;if(joint)v=.28;}
      else if(kind==='stone'){const row=Math.floor(y/128),xx=(x+(row%2)*128)%256,yy=y%128;const joint=Math.min(xx,256-xx,yy,128-yy)<3;col=[.61,.59,.52];v=joint?.55:.86+.14*cloud+.08*n;height=joint?.17:.65+.1*n;}
      else {v=.89+.08*cloud+.055*n;const freckle=n>.997?.86:1;v*=freckle;height=.5+.15*n+.04*cloud;}
      for(let k=0;k<3;k++)im.data[i+k]=Math.min(255,Math.max(0,col[k]*v*255));im.data[i+3]=255;
      hm.data[i]=hm.data[i+1]=hm.data[i+2]=height*255;hm.data[i+3]=255;
    }
    ctx.putImageData(im,0,0);hx.putImageData(hm,0,0);
    const albedo=new THREE.CanvasTexture(c),height=new THREE.CanvasTexture(h);albedo.colorSpace=THREE.SRGBColorSpace;
    for(const t of [albedo,height]) {t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(t);}
    maps[kind]={albedo,height};
  }
  function apply(m,kind,{scale=2,tint=0xffffff,bump=.035}={}) {
    m.map=null;m.normalMap=null;m.roughnessMap=null;m.metalnessMap=null;m.color.set(tint);m.roughness=.91;m.metalness=0;
    const kit=maps[kind];
    m.onBeforeCompile=shader=>{
      shader.uniforms.jColor={value:kit.albedo};shader.uniforms.jHeight={value:kit.height};shader.uniforms.jScale={value:scale};shader.uniforms.jBump={value:bump};
      shader.vertexShader='varying vec3 jWorld; varying vec3 jNormal;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\njWorld=(modelMatrix*vec4(transformed,1.)).xyz;jNormal=normalize(mat3(modelMatrix)*objectNormal);');
      shader.fragmentShader='varying vec3 jWorld; varying vec3 jNormal;uniform sampler2D jColor;uniform sampler2D jHeight;uniform float jScale;uniform float jBump;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec3 jN=abs(normalize(jNormal));vec2 jUv=jN.y>.65?jWorld.xz:(jN.x>jN.z?jWorld.zy:jWorld.xy);jUv/=jScale;
        diffuseColor.rgb*=${kind==='plaster'&&kit.photo?'min(vec3(.82),texture2D(jColor,jUv).rgb*1.25+.10)':'texture2D(jColor,jUv).rgb'};
        ${kind==='road'?'diffuseColor.rgb*=.94+.06*smoothstep(.15,.8,abs(sin((jWorld.z-jWorld.x*.265)*.33)));':''}
        ${kind==='plaster'?'diffuseColor.rgb*=mix(vec3(.64,.61,.53),vec3(1.),smoothstep(.04,.55+texture2D(jHeight,jUv*.37).r*.9,jWorld.y));':''}
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
        float jH=texture2D(jHeight,jUv).r*jBump;
        vec3 jDx=dFdx(-vViewPosition),jDy=dFdy(-vViewPosition);vec3 jR1=cross(jDy,normal),jR2=cross(normal,jDx);float jD=dot(jDx,jR1);
        normal=normalize(abs(jD)*normal-sign(jD)*(dFdx(jH)*jR1+dFdy(jH)*jR2));
      `);
    };
    m.customProgramCacheKey=()=>`jejaka-world-surface-v3-${kind}`;m.needsUpdate=true;materials.push(m);return m;
  }
  return {apply,textures,setSource(kind,texture){if(!texture||!maps[kind])return;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());maps[kind].albedo=texture;maps[kind].photo=true;},dispose(){textures.forEach(t=>t.dispose());}};
}

export function addBridgeDetails(parent,groundHeight,surfaces) {
  const metal=surfaces.apply(new THREE.MeshStandardMaterial(),'plaster',{tint:0x697370,scale:1,bump:.003});metal.metalness=.72;metal.roughness=.44;
  const bronze=new THREE.MeshStandardMaterial({color:0x6e6250,metalness:.72,roughness:.5});
  const stone=surfaces.apply(new THREE.MeshStandardMaterial(),'stone',{scale:1.2,tint:0xd8d6c9,bump:.025});
  const glass=new THREE.MeshStandardMaterial({color:0xa2bcc0,metalness:.25,roughness:.18,transparent:false,emissive:0x243436,emissiveIntensity:.12});
  const bins=new Map([[metal,[]],[bronze,[]],[stone,[]],[glass,[]]]);const dummy=new THREE.Object3D();
  const add=(g,mat,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();g.applyMatrix4(dummy.matrix);bins.get(mat).push(g);};
  const box=(m,x,y,z,w,h,d)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(m,x,y,z,r1,r2,h,segments=16)=>add(new THREE.CylinderGeometry(r1,r2,h,segments),m,x,y,z);
  // Original source positions, refined lantern morphology as a separate inferred
  // production interpretation. The researched master lamp mesh is retained.
  for(const x of [-48,-22,4])for(const z of [-6.0,6.0]){
    const y=groundHeight(x,Math.sign(z)*4);
    box(stone,x,y+.12,z,.62,.24,.62);
    cyl(metal,x,y+.3,z,.19,.26,.14);cyl(metal,x,y+.53,z,.105,.18,.36);
    cyl(metal,x,y+1.95,z,.057,.089,2.55,20);
    for(const yy of [.7,2.7,3.1])cyl(bronze,x,y+yy,z,.095,.095,.065);
    cyl(metal,x,y+3.2,z,.13,.07,.18);
    const ly=y+3.65;
    cyl(metal,x,ly-.35,z,.24,.17,.12,6);cyl(glass,x,ly,z,.23,.18,.62,6);
    for(let j=0;j<6;j++){const a=j*Math.PI/3;const xx=x+Math.sin(a)*.217,zz=z+Math.cos(a)*.217;box(metal,xx,ly,zz,.026,.7,.026);}
    cyl(metal,x,ly+.38,z,.36,.255,.12,6);cyl(metal,x,ly+.52,z,.025,.35,.23,6);cyl(bronze,x,ly+.69,z,.025,.05,.11);
  }
  // Riveted base shoes and end caps give the existing railings a physical join.
  for(const z of [-6.42,6.42])for(let x=-60;x<=18;x+=3){const y=groundHeight(x,Math.sign(z)*4);box(metal,x,y+.045,z,.25,.06,.28);for(const dx of [-.085,.085])for(const dz of [-.09,.09])cyl(bronze,x+dx,y+.09,z+dz,.024,.024,.026,8);}
  const group=new THREE.Group();group.name='JEJAKA_BRIDGE_REFINED_FIXTURES';group.userData.evidenceStatus='inferred_production_refinement';parent.add(group);
  for(const [mat,geos] of bins)if(geos.length){const g=mergeGeometries(geos,false);geos.forEach(x=>x.dispose());const mesh=new THREE.Mesh(g,mat);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
  return group;
}

export function makeSkyEnvironment() {
  const faces=[];
  for(let f=0;f<6;f++){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,f===2?'#8aafca':'#86a4b7');g.addColorStop(.48,'#d7dfdd');g.addColorStop(.52,'#a2a69b');g.addColorStop(1,f===3?'#605d51':'#807c6b');x.fillStyle=g;x.fillRect(0,0,128,128);faces.push(c);}
  const cube=new THREE.CubeTexture(faces);cube.colorSpace=THREE.SRGBColorSpace;cube.needsUpdate=true;return cube;
}

// Restrained joints on the approximate shop volumes: deep party walls keep
// their blank character. No windows or business signs are invented here.
export function refineExposedWalls(model,parent,surfaces) {
  model.updateMatrixWorld(true);const planes=new Map(),p=new THREE.Vector3(),q=new THREE.Vector3(),r=new THREE.Vector3(),normal=new THREE.Vector3();
  model.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(Array.isArray(m)||!/STREET_PARTY|FACADE/.test(m.name))return;const g=o.geometry,a=g.attributes.position,ix=g.index;
    for(let i=0;i<(ix?ix.count:a.count);i+=3){p.fromBufferAttribute(a,ix?ix.getX(i):i).applyMatrix4(o.matrixWorld);q.fromBufferAttribute(a,ix?ix.getX(i+1):i+1).applyMatrix4(o.matrixWorld);r.fromBufferAttribute(a,ix?ix.getX(i+2):i+2).applyMatrix4(o.matrixWorld);normal.crossVectors(q.clone().sub(p),r.clone().sub(p));const area=normal.length()*.5;if(area<.3)continue;normal.normalize();if(Math.abs(normal.y)>.08)continue;const cx=(p.x+q.x+r.x)/3,cz=(p.z+q.z+r.z)/3;if(cx < -180||cx>185||Math.abs(cz)>80)continue;
      const d=normal.dot(p),key=[Math.round(normal.x*100),Math.round(normal.z*100),Math.round(d*20)].join(',');let v=planes.get(key);if(!v){v={n:normal.clone(),d,minT:Infinity,maxT:-Infinity,minY:Infinity,maxY:-Infinity,area:0};planes.set(key,v);}for(const pt of [p,q,r]){const t=-normal.z*pt.x+normal.x*pt.z;v.minT=Math.min(v.minT,t);v.maxT=Math.max(v.maxT,t);v.minY=Math.min(v.minY,pt.y);v.maxY=Math.max(v.maxY,pt.y);}v.area+=area;
    }
  });
  const bins=[[],[]];const trim=surfaces.apply(new THREE.MeshStandardMaterial(),'plaster',{tint:0xd7d1bd,scale:2.5,bump:.012});const iron=new THREE.MeshStandardMaterial({color:0x515c57,roughness:.65,metalness:.55});
  const make=(g,bin,x,y,z,angle=0)=>{g.rotateY(angle);g.translate(x,y,z);bins[bin].push(g);};let count=0;
  const score=v=>{const t=(v.maxT+v.minT)*.5,x=-v.n.z*t+v.n.x*v.d,z=v.n.x*t+v.n.z*v.d;return Math.min(...[[-88,8],[36,-9],[65,27],[118,29]].map(p=>(p[0]-x)**2+(p[1]-z)**2));};
  for(const v of [...planes.values()].sort((a,b)=>score(a)-score(b))) {const w=v.maxT-v.minT,h=v.maxY-v.minY;if(w<5||w>34||h<5||v.area<w*h*.62||count>36)continue;count++;const t=(v.maxT+v.minT)/2,n=v.n,angle=Math.atan2(n.x,n.z),x=-n.z*t+n.x*(v.d+.025),z=n.x*t+n.z*(v.d+.025);
    for(const yy of [v.minY+.22,v.minY+3.45,v.maxY-.12])if(yy<v.maxY)make(new THREE.BoxGeometry(w,.13,.12),0,x,yy,z,angle);
    const edge=v.minT+.28,px=-n.z*edge+n.x*(v.d+.09),pz=n.x*edge+n.z*(v.d+.09);make(new THREE.CylinderGeometry(.045,.045,h-.25,8),1,px,v.minY+h*.5,pz);
    for(let yy=v.minY+.7;yy<v.maxY-.3;yy+=1.5)make(new THREE.BoxGeometry(.12,.04,.13),1,px,yy,pz,angle);
  }
  const group=new THREE.Group();group.name='JEJAKA_INFERRED_WALL_JOINTS';group.userData.evidenceStatus='inferred_surface_finish';group.userData.refinedWallCount=count;parent.add(group);
  bins.forEach((geos,i)=>{if(!geos.length)return;const g=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());const mesh=new THREE.Mesh(g,i?iron:trim);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);});
  return group;
}
