import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
  const oldFog = scene.fog;
  scene.fog = new THREE.FogExp2(0xbab7a5, 0.00185);
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
    top: { value: new THREE.Color(0x6d8491) },
    bottom: { value: new THREE.Color(0xd7c4a0) },
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
  const hemi = new THREE.HemisphereLight(0xd6e0df, 0x5c5145, 1.8);
  owned.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe4b2, 3.0);
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

  const loader = new GLTFLoader();
  onProgress(0.02);
  if (!globalThis.DecompressionStream)
    throw new Error(
      "Browser ini belum mendukung aset terkompresi. Gunakan Chrome, Edge, Firefox, atau Safari versi terbaru.",
    );
  const response = await fetch(
    new URL("./assets/district.glb.gz", import.meta.url),
  );
  if (!response.ok)
    throw new Error("Aset kota tidak dapat dimuat (" + response.status + ").");
  const total = Number(response.headers.get("Content-Length")) || 15981642;
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
  const groundMeshes = [];
  const modelMats = new Set();
  // Several Blender procedural materials export as an untextured white PBR
  // material. Restore their intended material role instead of boosting exposure.
  const roadColors = {
    MAT_ROAD_ASPHALT: 0x777369,
    MAT_GROUND_EARTH: 0x716b5c,
    MAT_ROAD_SETTS: 0x827d70,
  };
  function matteGround(m) {
    m.map = null;
    m.normalMap = null;
    m.roughnessMap = null;
    m.metalnessMap = null;
    m.metalness = 0;
    m.roughness = 0.97;
    m.polygonOffset = true;
    m.polygonOffsetFactor =
      m.name === "MAT_GROUND_EARTH"
        ? 2
        : m.name === "MAT_ROAD_ASPHALT"
          ? -1
          : -2;
    m.polygonOffsetUnits = m.polygonOffsetFactor;
    m.color.set(roadColors[m.name]);
    m.onBeforeCompile = (shader) => {
      shader.vertexShader =
        "varying vec3 vJejakaWorld;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\nvJejakaWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
      shader.fragmentShader =
        "varying vec3 vJejakaWorld;\nfloat jHash(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z); }\nfloat jNoise(vec2 p){vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(jHash(i),jHash(i+vec2(1,0)),f.x),mix(jHash(i+vec2(0,1)),jHash(i+vec2(1,1)),f.x),f.y); }\n" +
        shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.rgb *= .88 + .16*jNoise(vJejakaWorld.xz*.7) + .04*jNoise(vJejakaWorld.xz*7.);",
      );
    };
    m.customProgramCacheKey = () => "jejaka-matte-ground-v1";
    m.needsUpdate = true;
  }
  model.traverse((o) => {
    if (!o.isMesh) return;
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
      modelMats.add(m);
      if (roadColors[m.name] !== undefined) matteGround(m);
      if (m.map)
        m.map.anisotropy = Math.min(
          4,
          renderer.capabilities.getMaxAnisotropy(),
        );
      if (m.name?.includes("GLASS") || m.name?.includes("WINDOW")) {
        m.roughness = 0.36;
        m.metalness = 0.15;
      }
      if (m.name?.includes("WATER")) {
        m.color.set(0x526760);
        m.roughness = 0.4;
        m.metalness = 0.18;
      }
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

  function spriteTexture(kind) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    if (kind === "smoke") {
      for (let i = 0; i < 32; i++) {
        const x = 36 + rng() * 56,
          y = 36 + rng() * 56,
          r = 18 + rng() * 32;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(255,255,255,.10)");
        g.addColorStop(0.5, "rgba(255,255,255,.07)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
      }
    } else {
      const g = ctx.createRadialGradient(64, 87, 0, 64, 76, 55);
      g.addColorStop(0, "rgba(255,247,177,1)");
      g.addColorStop(0.18, "rgba(255,177,65,.9)");
      g.addColorStop(0.45, "rgba(230,76,14,.6)");
      g.addColorStop(1, "rgba(170,30,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
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
    [-115, 65],
    [-90, 110],
    [-230, -110],
    [142, 22],
    [-230, 140],
    [-160, -180],
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
      s.position.set(x + (j - 1) * 2, 12, z);
      s.scale.set(4, 8, 1);
      owned.add(s);
      flames.push({
        sprite: s,
        x: x + (j - 1) * 2,
        z,
        seed: rng() * 10,
        column: k,
      });
    }
    if (k < 4) {
      const light = new THREE.PointLight(0xff9b3f, 0, 24, 2);
      light.position.set(x, 4, z);
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
  debris.position.set(125, 0, 20);
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
    debrisPieces.push({
      mesh: m,
      x: m.position.x,
      y: m.position.y,
      z: m.position.z,
      delay: rng() * 1.8,
    });
  }
  const parcel = crate(118, 31, 0.12, 0.8);
  parcel.name = "JEJAKA_FICTIONAL_SHELTER_PARCEL";
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
      parcel.position.set(118, groundHeight(118, 31), 31);
      debrisPieces.forEach((p) => {
        p.mesh.visible = false;
        p.mesh.position.set(p.x, p.y, p.z);
        p.mesh.rotation.set(0, 0, 0);
      });
    }
    if (next > 0.85) phase = Math.max(phase, next - 0.05);
    phaseTarget = next;
  }
  const fogCalm = new THREE.Color(0xbab7a5),
    fogDanger = new THREE.Color(0x8d8170);
  const skyCalm = new THREE.Color(0xd7c4a0),
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
      THREE.MathUtils.lerp(118, 121, parcelTravel),
      groundHeight(118, 31),
      THREE.MathUtils.lerp(31, 33, parcelTravel),
    );
    parcel.rotation.y = 0.12 + parcelTravel * 0.2;
    const danger = THREE.MathUtils.smoothstep(phase, 0.32, 0.93);
    scene.fog.color.copy(fogCalm).lerp(fogDanger, danger);
    scene.fog.density = 0.00185 + danger * 0.0011;
    skyUniforms.bottom.value.copy(skyCalm).lerp(skyDanger, danger);
    sun.intensity = 3 - danger * 0.8;
    for (const p of smoke) {
      const active = THREE.MathUtils.smoothstep(
        phase,
        0.32 + p.column * 0.045,
        0.55 + p.column * 0.045,
      );
      p.age = (p.age + dt * 0.026 * (0.8 + p.seed * 0.03)) % 1;
      const a = p.age;
      p.sprite.position.set(
        p.x + a * 12 + Math.sin(elapsed * 0.08 + p.seed) * 2,
        11 + a * 55,
        p.z + a * 4,
      );
      p.sprite.scale.setScalar(7 + a * 25);
      p.sprite.material.opacity = active * Math.sin(a * Math.PI) * 0.7;
      p.sprite.material.rotation += dt * 0.015;
    }
    for (const p of flames) {
      const active = THREE.MathUtils.smoothstep(
        phase,
        0.43 + p.column * 0.04,
        0.65 + p.column * 0.04,
      );
      p.sprite.material.opacity =
        active * (0.5 + 0.22 * Math.sin(elapsed * 8 + p.seed));
      p.sprite.scale.set(
        4 + Math.sin(elapsed * 3 + p.seed),
        7 + Math.sin(elapsed * 7 + p.seed) * 1.4,
        1,
      );
    }
    fires.forEach(
      (l, i) => (l.intensity = danger * (16 + Math.sin(elapsed * 11 + i) * 3)),
    );
    dust.rotation.y = Math.sin(elapsed * 0.025) * 0.025;
    dust.position.y = Math.sin(elapsed * 0.2) * 0.12;
    dustMat.opacity = 0.15 + danger * 0.3;
    if (phaseTarget > 0.58 && collapseTime < 0) collapseTime = elapsed;
    if (collapseTime >= 0) {
      const t = elapsed - collapseTime;
      debrisPieces.forEach((p) => {
        const a = t - p.delay;
        p.mesh.visible = a > 0;
        p.mesh.position.y = a > 0 ? Math.max(0.12, p.y - 4.9 * a * a) : p.y;
        if (a > 0 && p.mesh.position.y > 0.12) {
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
    groundHeight,
    choose,
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.remove(owned, model);
      scene.fog = oldFog;
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
