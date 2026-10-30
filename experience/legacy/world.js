import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { makeSurfaceKit, addBridgeDetails, makeSkyEnvironment, refineExposedWalls } from "./environment-detail.js";

// The architecture remains intact. Props and effects belong to a separate,
// authored dramatic layer; they are not evidence for damage at a real address.
export async function createWorld({ scene, renderer, onProgress = () => {} }) {
  const owned = new THREE.Group();
  owned.name = "JEJAKA_AUTHORED_PRESENTATION";
  scene.add(owned);
  const rng = (() => {
    let s = 194511;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  })();
  const surfaces = makeSurfaceKit(renderer);
  const oldEnvironment = scene.environment;
  const environment = makeSkyEnvironment();
  scene.environment = environment;
  scene.environmentIntensity = .55;
  const oldFog = scene.fog;
  scene.fog = new THREE.FogExp2(0xc0c9c6, 0.00185);
  const palette = {
    plaster: 0xc8b996,
    timber: 0x584839,
    canvas: 0x948b70,
    dark: 0x393832,
    clay: 0x755344,
    leaf: 0x4d5a40,
  };
  const materials = {};
  for (const [key, color] of Object.entries(palette))
    materials[key] = new THREE.MeshStandardMaterial({ color, roughness: 0.91 });
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.43, 1, 10);
  const sphereGeo = new THREE.SphereGeometry(1, 8, 6);
  const geometries = [boxGeo, cylinderGeo, sphereGeo];
  function box(x, y, z, w, h, d, mat = materials.timber, parent = owned) {
    const mesh = new THREE.Mesh(boxGeo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  const skyUniforms = {
    top: { value: new THREE.Color(0x759bb4) },
    bottom: { value: new THREE.Color(0xd2d7ce) },
  };
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: skyUniforms,
    vertexShader:
      "varying vec3 vWorld; void main(){vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}",
    fragmentShader:
      "varying vec3 vWorld; uniform vec3 top; uniform vec3 bottom; void main(){float h=clamp(normalize(vWorld).y,0.,1.);vec3 c=mix(bottom,top,pow(h,.48));gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
  });
  const skyGeo = new THREE.SphereGeometry(1500, 24, 12);
  geometries.push(skyGeo);
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.name = "JEJAKA_SKY_DOME";
  sky.frustumCulled = false;
  owned.add(sky);
  const hemi = new THREE.HemisphereLight(0xcddfe9, 0x605c4d, 1.15);
  owned.add(hemi);
  const sun = new THREE.DirectionalLight(0xffedce, 2.65);
  sun.position.set(-170, 240, -140);
  sun.target.position.set(0, 0, 0);
  owned.add(sun, sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -210,
    right: 210,
    top: 190,
    bottom: -190,
    near: 1,
    far: 650,
  });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.12;
  sun.shadow.camera.updateProjectionMatrix();
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  let quality = "balanced";
  function setQuality(value) {
    const next = value === "low" ? "low" : value === "high" ? "high" : "balanced";
    if (quality === next && sun.shadow.map) return;
    quality = next;
    renderer.shadowMap.enabled = next !== "low";
    const size = next === "high" ? 2048 : 1024;
    if (sun.shadow.mapSize.x !== size) {
      sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(size,size);
    }
    renderer.shadowMap.needsUpdate = true;
  }

  const loader = new GLTFLoader();
  onProgress(0.02);
  if (!globalThis.DecompressionStream)
    throw new Error(
      "Browser ini belum mendukung aset terkompresi. Gunakan Chrome, Edge, Firefox, atau Safari versi terbaru.",
    );
  const response = await fetch(
    new URL("../assets/district-route.glb.gz", import.meta.url),
  );
  if (!response.ok)
    throw new Error("Aset kota tidak dapat dimuat (" + response.status + ").");
  const total = Number(response.headers.get("Content-Length")) || 7175486;
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(0.04 + (0.77 * received) / total);
  }
  const packed = new Blob(chunks)
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const binary = await new Response(packed).arrayBuffer();
  onProgress(0.85);
  const gltf = await loader.parseAsync(binary, "");
  const model = gltf.scene;
  model.name = "SURABAYA_RECONSTRUCTION";
  scene.add(model);
  let plasterScan;
  model.traverse(o=>{if(plasterScan||!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.map&&/PLASTER|FACADE/.test(m.name)){plasterScan=m.map;break;}});
  surfaces.setSource('plaster',plasterScan);
  surfaces.apply(materials.timber,'wood',{scale:1.2,tint:0xc0b8a1,bump:.018});
  surfaces.apply(materials.canvas,'canvas',{scale:.4,tint:0xe5deca,bump:.003});
  surfaces.apply(materials.plaster,'plaster',{scale:3,tint:0xe9dfc6,bump:.015});
  const groundMeshes = [];
  const modelMats = new Set();
  // Several Blender procedural materials export as an untextured white PBR
  // material. Restore their intended material role instead of boosting exposure.
  const waterUniforms = { value: 0 };
  function waterMaterial(m) {
    m.map=null;m.normalMap=null;m.roughness=.46;m.metalness=0;m.envMapIntensity=.15;m.color.set(0x526b58);
    m.onBeforeCompile=(shader)=>{
      shader.uniforms.jWaterTime=waterUniforms;
      shader.vertexShader='varying vec3 jWaterWorld;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\njWaterWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
      shader.fragmentShader='varying vec3 jWaterWorld;uniform float jWaterTime;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
        vec2 w=jWaterWorld.xz;
        vec3 wn=normalize(vec3(sin(w.x*1.7+w.y*.42+jWaterTime*.7)*.055+cos(w.y*3.1-jWaterTime*.9)*.027,1.,cos(w.y*1.2-w.x*.3-jWaterTime*.6)*.07));
        normal=normalize(mat3(viewMatrix)*wn);
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
        float wf=pow(1.-max(0.,dot(normal,normalize(vViewPosition))),3.);
        float wp=sin(jWaterWorld.x*.19+jWaterWorld.z*.73+jWaterTime*.35)*sin(jWaterWorld.z*.43-jWaterTime*.28);
        vec3 wb=vec3(.105,.155,.115)*(1.+wp*.045);
        outgoingLight=mix(wb,vec3(.23,.30,.29),wf*.5)+min(vec3(.025),reflectedLight.directSpecular*.15);
        #include <opaque_fragment>
      `);
    };
    m.customProgramCacheKey=()=>"jejaka-river-v3";m.needsUpdate=true;
  }
  model.traverse((o) => {
    if (!o.isMesh) return;
    if (/BRIDGE_LAMPS/.test(o.name)) {o.visible=false;o.castShadow=false;}
    o.receiveShadow = true;
    const b = new THREE.Box3().setFromObject(o);
    o.castShadow =
      !/PALAGAN_LAND_|PALAGAN_R_|SIDEWALK|APRON|WATER/.test(o.name) &&
      b.min.x < 220 &&
      b.max.x > -240 &&
      b.min.z < 100 &&
      b.max.z > -100;
    if (
      /PALAGAN_R_|BRIDGE_DECK|BRIDGE_RAMPS|BRIDGEHEAD_APRONS|SIDEWALK/.test(
        o.name,
      )
    )
      groundMeshes.push(o);
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (modelMats.has(m)) continue;
      modelMats.add(m);
      if (/ROAD_SETTS/.test(m.name)) surfaces.apply(m,'setts',{scale:2.4,bump:.032});
      else if (/ROAD_ASPHALT/.test(m.name)) surfaces.apply(m,'road',{scale:1.6,tint:0xf4f1e9,bump:.009});
      else if (/GROUND_EARTH/.test(m.name)) surfaces.apply(m,'earth',{scale:3,tint:0xe0d9bd,bump:.02});
      else if (/STREET_ROOF|ROOF_DARK|SINGA_TILE/.test(m.name)) surfaces.apply(m,'roof',{scale:2.7,tint:/ROOF_B|DARK/.test(m.name)?0xaab2b1:0xffffff,bump:.045});
      else if (/PLASTER|FACADE|STREET_PARTY/.test(m.name)) {
        const tint = /ROSE/.test(m.name)?0xe9c4ae:/SAGE/.test(m.name)?0xbdcfbc:/OCHRE/.test(m.name)?0xe3d4ad:/GREY/.test(m.name)?0xcbd0c7:0xf3ebd6;
        surfaces.apply(m,'plaster',{scale:3.5,tint,bump:.014});
      }
      else if (/WOOD|TIMBER/.test(m.name)) surfaces.apply(m,'wood',{scale:1.8,tint:0xb3b5a7,bump:.012});
      else if (/STONE/.test(m.name)) surfaces.apply(m,'stone',{scale:2.4,tint:0xd5d4c7,bump:.024});
      if (m.map) m.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      if (/GLASS|WINDOW/.test(m.name)) {m.color.set(0x647675);m.roughness=.3;m.metalness=.22;m.envMapIntensity=.8;}
      if (/METAL/.test(m.name)) {m.color.set(0x414b49);m.roughness=.47;m.metalness=.65;}
      if (/WATER/.test(m.name)) waterMaterial(m);
    }
  });
  model.updateMatrixWorld(true);
  // Reconstructed facade vocabulary on the explicitly approximate F_* volumes.
  // Their source supports location/massing, not these particular windows.
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x3d4843,
    roughness: 0.74,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xaaa18b,
    roughness: 0.95,
  });
  materials.window = windowMat;
  materials.frame = frameMat;
  const facadePanels = [],
    facadeFrames = [];
  const facadeDummy = new THREE.Object3D();
  function facadePart(x, y, z, w, h, d, mat, angle) {
    facadeDummy.position.set(x, y, z);
    facadeDummy.rotation.set(0, angle, 0);
    facadeDummy.scale.set(w, h, d);
    facadeDummy.updateMatrix();
    (mat === windowMat ? facadePanels : facadeFrames).push(
      facadeDummy.matrix.clone(),
    );
  }
  function hull(points) {
    const sorted = points.sort((a, b) => a.x - b.x || a.z - b.z);
    const cross = (o, a, b) =>
      (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
    const low = [],
      up = [];
    for (const p of sorted) {
      while (
        low.length >= 2 &&
        cross(low[low.length - 2], low[low.length - 1], p) <= 0
      )
        low.pop();
      low.push(p);
    }
    for (const p of [...sorted].reverse()) {
      while (
        up.length >= 2 &&
        cross(up[up.length - 2], up[up.length - 1], p) <= 0
      )
        up.pop();
      up.push(p);
    }
    low.pop();
    up.pop();
    return low.concat(up);
  }
  model.traverse((o) => {
    if (!o.isMesh || !/^PALAGAN_F_(PWD_1|PHONE)_MASSING$/.test(o.name)) return;
    const bounds = new THREE.Box3().setFromObject(o),
      pos = o.geometry.attributes.position,
      points = [],
      seen = new Set();
    const pt = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      pt.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      if (pt.y > bounds.min.y + 0.15) continue;
      const key = pt.x.toFixed(2) + "," + pt.z.toFixed(2);
      if (!seen.has(key)) {
        seen.add(key);
        points.push({ x: pt.x, z: pt.z });
      }
    }
    if (points.length < 3) return;
    const perimeter = hull(points),
      storeys = Math.max(1, Math.floor((bounds.max.y - bounds.min.y) / 3.8));
    const replacement = new THREE.MeshStandardMaterial({
      color: 0xa69d86,
      roughness: 0.97,
    });
    modelMats.add(replacement);
    o.material = replacement;
    for (let e = 0; e < perimeter.length; e++) {
      const a = perimeter[e],
        b = perimeter[(e + 1) % perimeter.length],
        dx = b.x - a.x,
        dz = b.z - a.z,
        len = Math.hypot(dx, dz);
      if (len < 7) continue;
      const nx = dz / len,
        nz = -dx / len,
        angle = -Math.atan2(dz, dx),
        bays = Math.max(1, Math.floor(len / 4.2));
      for (let j = 0; j < bays; j++) {
        const t = (j + 0.5) / bays,
          x = a.x + dx * t + nx * 0.05,
          z = a.z + dz * t + nz * 0.05;
        for (let k = 0; k < storeys; k++) {
          const y = bounds.min.y + 2.15 + k * 3.65;
          facadePart(x, y, z, 1.65, 2.1, 0.12, windowMat, angle);
          facadePart(
            x + nx * 0.08,
            y - 1.08,
            z + nz * 0.08,
            1.94,
            0.13,
            0.27,
            frameMat,
            angle,
          );
          facadePart(
            x + nx * 0.07,
            y,
            z + nz * 0.07,
            0.065,
            2.13,
            0.14,
            frameMat,
            angle,
          );
        }
      }
      facadePart(
        (a.x + b.x) / 2 + nx * 0.06,
        bounds.max.y - 0.45,
        (a.z + b.z) / 2 + nz * 0.06,
        len,
        0.22,
        0.22,
        frameMat,
        angle,
      );
    }
  });
  for (const [matrices, material] of [
    [facadePanels, windowMat],
    [facadeFrames, frameMat],
  ]) {
    const mesh = new THREE.InstancedMesh(boxGeo, material, matrices.length);
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.receiveShadow = true;
    mesh.userData.evidenceStatus = "authored_facade_assumption";
    owned.add(mesh);
  }
  const ray = new THREE.Raycaster();
  const groundCache = new Map();
  function groundHeight(x, z) {
    const key = `${Math.round(x * 2)},${Math.round(z * 2)}`;
    if (groundCache.has(key)) return groundCache.get(key);
    ray.set(new THREE.Vector3(x, 3, z), new THREE.Vector3(0, -1, 0));
    const hit = ray
      .intersectObjects(groundMeshes, false)
      .find((h) => h.point.y < 2);
    const height = hit ? hit.point.y : 0.035;
    if (groundCache.size > 5000) groundCache.clear();
    groundCache.set(key, height);
    return height;
  }

  addBridgeDetails(owned,groundHeight,surfaces);
  refineExposedWalls(model,owned,surfaces);

  // Small lived-in details placed at the road margins, outside the guided path.
  function crate(x, z, angle = 0, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, groundHeight(x, z), z);
    g.rotation.y = angle;
    g.scale.setScalar(scale);
    owned.add(g);
    box(0, 0.35, 0, 0.88, 0.7, 0.65, materials.timber, g);
    for (let i = 0; i < 5; i++)
      box(
        -0.35 + i * 0.175,
        0.35,
        0.334,
        0.024,
        0.58,
        0.025,
        materials.dark,
        g,
      );
    for (const y of [0.12, 0.58])
      box(0, y, 0.35, 0.9, 0.065, 0.045, materials.canvas, g);
    return g;
  }
  for (const [x, z, a, s] of [
    [-135, 12, 0.3, 1],
    [-133.9, 12.4, -0.2, 0.8],
    [-90, 12, 0.1, 1.1],
    [-89, 12.3, 0.4, 0.75],
    [73, 9, 0.25, 0.9],
    [100, 15, -0.2, 1],
    [102, 15.5, 0.3, 0.8],
    [128, 23, 0.1, 1.1],
    [150, 28, 0.2, 0.85],
  ])
    crate(x, z, a, s);
  function pot(x, z) {
    const y = groundHeight(x, z);
    const pot = new THREE.Mesh(cylinderGeo, materials.clay);
    pot.position.set(x, y + 0.32, z);
    pot.scale.set(0.55, 0.64, 0.55);
    pot.castShadow = true;
    owned.add(pot);
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(sphereGeo, materials.leaf);
      leaf.position.set(
        x + (rng() - 0.5) * 0.45,
        y + 0.8 + rng() * 0.38,
        z + (rng() - 0.5) * 0.4,
      );
      leaf.scale.set(0.19, 0.35, 0.13);
      leaf.rotation.z = (rng() - 0.5) * 1.2;
      owned.add(leaf);
    }
  }
  for (const p of [
    [-121, 12],
    [-98, 12],
    [67, 6],
    [122, 20],
    [154, 29],
  ])
    pot(...p);
  // Shop canopies are scene assumptions, kept separate from the base asset.
  for (const [x, z, angle] of [
    [-88, 11, 0],
    [106, 14, -0.27],
    [145, 26, -0.27],
  ]) {
    const g = new THREE.Group();
    g.position.set(x, 0.04, z);
    g.rotation.y = angle;
    owned.add(g);
    for (const sx of [-2.2, 2.2])
      box(sx, 1.5, 0, 0.055, 3, 0.055, materials.dark, g);
    const awning = box(0, 3.1, 0, 4.8, 0.065, 2.1, materials.canvas, g);
    awning.rotation.x = 0.13;
    box(0, 2.8, 1, 4.8, 0.45, 0.05, materials.canvas, g);
  }

  // A small authored stone forecourt anchors the stall to the street surface.
  materials.stallPaving=surfaces.apply(new THREE.MeshStandardMaterial(),'setts',{scale:2.4,tint:0xd6d3c5,bump:.026});
  box(-88,groundHeight(-88,8)+.015,9,6,.03,6,materials.stallPaving).castShadow=false;
  // A plain reconstructed stall behind Sari, with wrapped bundles and produce.
  box(-88, 0.94, 11, 3.6, 0.12, 0.9, materials.timber);
  for (const x of [-89.5, -86.5])
    box(x, 0.47, 11, 0.12, 0.94, 0.12, materials.dark);
  for (let i = 0; i < 4; i++) {
    const bundle = new THREE.Mesh(sphereGeo, materials.canvas);
    bundle.position.set(-89.1 + i * 0.7, 1.12, 11);
    bundle.scale.set(0.3, 0.18, 0.25);
    bundle.rotation.z = (rng() - 0.5) * 0.15;
    owned.add(bundle);
  }

  // Cloth sacks and a low crate give the encounters tactile, human-scale detail.
  // All stay outside the route's centre line and merge into static material bins.
  function sack(x,z,y,lean=0) {
    const geo=new THREE.SphereGeometry(1,16,12),pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){const yy=pos.getY(i),a=Math.atan2(pos.getZ(i),pos.getX(i));const fold=1+Math.sin(a*7+yy*2)*.035;pos.setXYZ(i,pos.getX(i)*.31*fold,(yy+1)*.4,pos.getZ(i)*.24*fold);}
    geo.computeVertexNormals();geometries.push(geo);const mesh=new THREE.Mesh(geo,materials.canvas);mesh.position.set(x,y,z);mesh.rotation.z=lean;mesh.castShadow=true;mesh.receiveShadow=true;owned.add(mesh);
    const tie=new THREE.Mesh(new THREE.CylinderGeometry(.072,.065,.035,10),materials.timber);tie.position.set(x-Math.sin(lean)*.72,y+.75,z);tie.rotation.z=lean;owned.add(tie);geometries.push(tie.geometry);
  }
  crate(-86.4,10.3,-.08,.7);
  sack(-86.4,10.3,groundHeight(-86.4,10.3)+.49,.08);
  sack(-85.85,10.35,groundHeight(-85.85,10.35),-.12);

  function spriteTexture(kind) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    if (kind === "smoke") {
      const image=ctx.createImageData(128,128),noise=Array.from({length:1024},rng);
      const sample=(x,y)=>{const xx=Math.floor(x),yy=Math.floor(y),fx=x-xx,fy=y-yy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const at=(a,b)=>noise[((b%32+32)%32)*32+((a%32+32)%32)];return (at(xx,yy)*(1-u)+at(xx+1,yy)*u)*(1-v)+(at(xx,yy+1)*(1-u)+at(xx+1,yy+1)*u)*v;};
      for(let y=0;y<128;y++)for(let x=0;x<128;x++){
        const nx=(x-64)/58,ny=(y-64)/58,rad=Math.sqrt(nx*nx+ny*ny);
        const n=sample(x/22,y/22)*.52+sample(x/9,y/9)*.31+sample(x/3.5,y/3.5)*.17;
        const edge=THREE.MathUtils.clamp((1.07-rad+(n-.5)*.55)*3.2,0,1),alpha=edge*(.35+n*.65);
        const i=(y*128+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=220+n*35;image.data[i+3]=alpha*225;
      }
      ctx.putImageData(image,0,0);
    } else {
      const g=ctx.createLinearGradient(0,128,0,0);g.addColorStop(0,'rgba(255,112,18,.9)');g.addColorStop(.25,'rgba(255,192,57,.95)');g.addColorStop(.6,'rgba(255,99,10,.85)');g.addColorStop(1,'rgba(212,49,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(35,126);ctx.bezierCurveTo(15,102,32,75,33,47);ctx.bezierCurveTo(48,61,37,79,51,86);ctx.bezierCurveTo(42,51,69,26,63,3);ctx.bezierCurveTo(89,35,84,65,79,86);ctx.bezierCurveTo(99,70,101,47,99,37);ctx.bezierCurveTo(120,78,115,110,91,126);ctx.closePath();ctx.fill();
      const core=ctx.createRadialGradient(64,112,1,64,104,26);core.addColorStop(0,'rgba(255,246,186,.95)');core.addColorStop(.5,'rgba(255,187,52,.8)');core.addColorStop(1,'rgba(255,100,10,0)');ctx.fillStyle=core;ctx.fillRect(25,68,78,60);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const smokeTex = spriteTexture("smoke"),
    flameTex = spriteTexture("flame");
  const smoke = [],
    flames = [],
    fires = [];
  // Fictional fire locations. No named historical building is replaced/damaged.
  const columns = [
    [-118, 58],
    [-88, 75],
    [-152, 49],
    [142, 22],
    [-195, 90],
    [-165, -100],
  ];
  for (let k = 0; k < columns.length; k++) {
    const [x, z] = columns[k];
    for (let j = 0; j < 8; j++) {
      const mat = new THREE.SpriteMaterial({
        map: smokeTex,
        color: 0x4f4941,
        transparent: true,
        depthWrite: false,
        opacity: 0,
        rotation: rng() * Math.PI * 2,
      });
      const s = new THREE.Sprite(mat);
      s.position.set(x, 8 + j * 5, z);
      s.scale.setScalar(10 + j * 1.6);
      s.renderOrder = 2;
      owned.add(s);
      smoke.push({ sprite: s, x, z, age: j / 8, seed: rng() * 10, column: k });
    }
    for (let j = 0; j < 3; j++) {
      const mat = new THREE.SpriteMaterial({
        map: flameTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
        color: 0xffc288,
      });
      const s = new THREE.Sprite(mat);
      s.position.set(x + (j % 2) * 1.8, 10.5, z + (j - 1) * 4);
      s.renderOrder=3;
      s.scale.set(4, 8, 1);
      owned.add(s);
      flames.push({
        sprite: s,
        x: x + (j % 2) * 1.8,
        z: z + (j - 1) * 4,
        seed: rng() * 10,
        column: k,
      });
    }
    if (k < 4) {
      const light = new THREE.PointLight(0xff9b3f, 0, 24, 2);
      light.position.set(x, 8, z);
      owned.add(light);
      fires.push(light);
    }
  }
  const dustCount = 160;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = -170 + rng() * 370;
    dustPositions[i * 3 + 1] = 0.4 + rng() * 15;
    dustPositions[i * 3 + 2] = -75 + rng() * 155;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  geometries.push(dustGeo);
  const dustMat = new THREE.PointsMaterial({
    color: 0xf1d5a8,
    size: 0.08,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  owned.add(dust);
  const debris = new THREE.Group();
  debris.name = "FICTIONAL_FALLING_PLASTER";
  // The generic shop eave sits near Z=28.4 at X=145. Fragments fall just
  // outside it, ahead-left of the impact camera, clear of the guided path.
  debris.position.set(145, groundHeight(145,30.2), 30.2);
  owned.add(debris);
  const debrisPieces = [];
  for (let i = 0; i < 14; i++) {
    const m = box(
      (rng() - 0.5) * 7,
      6 + rng() * 4,
      (rng() - 0.5) * 2,
      0.2 + rng() * 0.5,
      0.12 + rng() * 0.3,
      0.2 + rng() * 0.4,
      materials.plaster,
      debris,
    );
    m.visible = false;
    m.castShadow = false;
    debrisPieces.push({
      mesh: m,
      x: m.position.x,
      y: m.position.y,
      z: m.position.z,
      delay: rng() * 1.8,
      floor: m.scale.y * .5 + .005,
    });
  }
  const parcel = crate(114.8, 29.3, 0.12, 0.8);
  parcel.traverse(o=>{if(o.isMesh)o.castShadow=false;});
  parcel.name = "JEJAKA_FICTIONAL_SHELTER_PARCEL";
  parcel.visible=false;
  const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=64;
  const contactContext=contactCanvas.getContext('2d'),contactGradient=contactContext.createRadialGradient(32,32,1,32,32,32);
  contactGradient.addColorStop(0,'rgba(0,0,0,.38)');contactGradient.addColorStop(.6,'rgba(0,0,0,.25)');contactGradient.addColorStop(1,'rgba(0,0,0,0)');
  contactContext.fillStyle=contactGradient;contactContext.fillRect(0,0,64,64);
  const contactTexture=new THREE.CanvasTexture(contactCanvas);surfaces.textures.push(contactTexture);
  const contactGeo=new THREE.PlaneGeometry(1.4,1.1);geometries.push(contactGeo);
  const contact=new THREE.Mesh(contactGeo,new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
  contact.rotation.x=-Math.PI/2;contact.position.y=.008;parcel.add(contact);

  // Batch the original procedural stall/props and refined fixtures by material.
  // Animated parcel/debris, billboards, sky and instanced facade bands retain
  // their own identities; static detail should not cost one draw per screw.
  owned.updateMatrixWorld(true);
  const propBatches = new Map(), staticParts = [];
  owned.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || o.material?.isShaderMaterial || Array.isArray(o.material)) return;
    let ancestor = o;
    while (ancestor && ancestor !== owned) {
      if (ancestor === parcel || ancestor === debris) return;
      ancestor = ancestor.parent;
    }
    const key = o.material.uuid + ":" + o.castShadow + ":" + o.receiveShadow;
    if (!propBatches.has(key)) propBatches.set(key, { material:o.material,cast:o.castShadow,receive:o.receiveShadow,parts:[] });
    propBatches.get(key).parts.push(o.geometry.clone().applyMatrix4(o.matrixWorld));staticParts.push(o);
  });
  for (const o of staticParts) o.removeFromParent();
  for (const b of propBatches.values()) {
    const geo = mergeGeometries(b.parts,false);b.parts.forEach(g=>g.dispose());
    if (!geo) continue;
    geometries.push(geo);const mesh=new THREE.Mesh(geo,b.material);mesh.castShadow=b.cast;mesh.receiveShadow=b.receive;
    mesh.name="JEJAKA_BATCHED_STREET_DETAIL";mesh.userData.evidenceStatus="authored_production_layer";owned.add(mesh);
  }
  let parcelMoved = false,
    parcelTravel = 0;
  function choose(beatId, choiceId, instant = false) {
    if (beatId === "shelter" && choiceId === "help") {
      parcelMoved = true;
      if (instant) parcelTravel = 1;
    }
  }
  let phase = 0,
    phaseTarget = 0,
    collapseTime = -1,
    disposed = false;
  function setPhase(value) {
    const next = THREE.MathUtils.clamp(Number(value) || 0, 0, 1);
    if (next < 0.05 && phaseTarget > 0.2) {
      phase = next;
      collapseTime = -1;
      parcelMoved = false;
      parcelTravel = 0;
      parcel.position.set(114.8, groundHeight(114.8, 29.3), 29.3);
      debrisPieces.forEach((p) => {
        p.mesh.visible = false;
        p.mesh.position.set(p.x, p.y, p.z);
        p.mesh.rotation.set(0, 0, 0);
      });
    }
    if (next > 0.85) phase = Math.max(phase, next - 0.05);
    phaseTarget = next;
  }
  const fogCalm = new THREE.Color(0xc0c9c6),
    fogDanger = new THREE.Color(0x8d8170);
  const skyCalm = new THREE.Color(0xd2d7ce),
    skyDanger = new THREE.Color(0xafa18b);
  function update(dt, elapsed, nextPhase) {
    if (disposed) return;
    dt = Math.min(0.1, Math.max(0, dt));
    if (nextPhase !== undefined) setPhase(nextPhase);
    phase = THREE.MathUtils.damp(phase, phaseTarget, 0.6, dt);
    parcelTravel = THREE.MathUtils.damp(
      parcelTravel,
      parcelMoved ? 1 : 0,
      2,
      dt,
    );
    parcel.position.set(
      THREE.MathUtils.lerp(114.8, 113.3, parcelTravel),
      groundHeight(114.8, 29.3),
      THREE.MathUtils.lerp(29.3, 30.5, parcelTravel),
    );
    parcel.rotation.y = 0.12 + parcelTravel * 0.2;
    parcel.visible = phaseTarget >= .45 && phaseTarget < .8;
    const danger = THREE.MathUtils.smoothstep(phase, 0.32, 0.93);
    scene.fog.color.copy(fogCalm).lerp(fogDanger, danger);
    scene.fog.density = 0.00185 + danger * 0.0011;
    skyUniforms.bottom.value.copy(skyCalm).lerp(skyDanger, danger);
    sun.intensity = 2.65 - danger * 0.65;
    waterUniforms.value = elapsed;
    for (const p of smoke) {
      const active = THREE.MathUtils.smoothstep(
        phase,
        0.32 + p.column * 0.045,
        0.55 + p.column * 0.045,
      );
      p.age = (p.age + dt * 0.026 * (0.8 + p.seed * 0.03)) % 1;
      const a = p.age;
      p.sprite.position.set(
        p.x + a * 18 + Math.sin(elapsed * 0.08 + p.seed) * 2,
        10 + a * 55,
        p.z + a * 5,
      );
      p.sprite.scale.set(13 + a * 27,16 + a * 26,1);
      p.sprite.material.opacity = active * (.5+.5*Math.sin(a*Math.PI)) * (1-THREE.MathUtils.smoothstep(a,.8,1)) * .82;
      p.sprite.visible = active > .01;
      p.sprite.material.rotation += dt * 0.015;
    }
    for (const p of flames) {
      const active = THREE.MathUtils.smoothstep(
        phase,
        0.43 + p.column * 0.04,
        0.65 + p.column * 0.04,
      );
      const heroFire=p.column<3;
      p.sprite.position.set(p.x,(heroFire?13:10.7)+Math.sin(elapsed*1.8+p.seed)*.2,p.z);
      p.sprite.material.opacity =
        active * (0.66 + 0.15 * Math.sin(elapsed * 8 + p.seed));
      p.sprite.visible = active > .01;
      p.sprite.scale.set(
        (heroFire?6.6:5.2) + Math.sin(elapsed * 3 + p.seed)*.65,
        (heroFire?13:9.2) + Math.sin(elapsed * 7 + p.seed) * 1.25,
        1,
      );
    }
    fires.forEach(
      (l, i) => (l.intensity = danger * (44 + Math.sin(elapsed * 11 + i) * 8)),
    );
    dust.rotation.y = Math.sin(elapsed * 0.025) * 0.025;
    dust.position.y = Math.sin(elapsed * 0.2) * 0.12;
    dustMat.opacity = 0.15 + danger * 0.3;
    if (phaseTarget > 0.30 && collapseTime < 0) collapseTime = elapsed;
    if (collapseTime >= 0) {
      const t = elapsed - collapseTime;
      debrisPieces.forEach((p) => {
        const a = t - p.delay;
        p.mesh.visible = a > 0;
        p.mesh.position.y = a > 0 ? Math.max(p.floor, p.y - 4.9 * a * a) : p.y;
        p.mesh.position.x = p.x + Math.max(0,Math.min(a,1))*(.3+p.delay*.12);
        p.mesh.position.z = p.z + Math.max(0,Math.min(a,1))*(.4+p.delay*.14);
        if (a > 0 && p.mesh.position.y > p.floor) {
          p.mesh.rotation.x += dt * (1 + p.delay);
          p.mesh.rotation.z += dt * 0.7;
        }
      });
    }
  }
  onProgress(1);
  return {
    model,
    update,
    setPhase,
    setQuality,
    groundHeight,
    choose,
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.remove(owned, model);
      scene.fog = oldFog;
      scene.environment = oldEnvironment;environment.dispose();surfaces.dispose();
      const textures = new Set([smokeTex, flameTex]);
      model.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            for (const v of Object.values(m)) if (v?.isTexture) textures.add(v);
        }
      });
      modelMats.forEach((m) => m.dispose());
      owned.traverse((o) => {
        if (o.material) {
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            m.dispose();
        }
      });
      geometries.forEach((g) => g.dispose());
      textures.forEach((t) => t.dispose());
      sun.shadow.map?.dispose();
    },
  };
}
