/**
 * Original civilian cast for Jejaka's escape edition.
 * Bodies are articulated from shared meshes, with speed-driven planted-foot
 * gait, bent-knee IK, restrained faces, staggered reactions and authored routes.
 * These people, their clothes and their actions are historical fiction.
 */
export function createActors(THREE, scene, { quality = 'balanced' } = {}) {
  const root = new THREE.Group(); root.name = 'Jejaka • people and shared escape'; scene.add(root);
  const MAX = 128, batches = {}, dummy = new THREE.Object3D(), colour = new THREE.Color();
  const local = new THREE.Matrix4(), world = new THREE.Matrix4(), rotation = new THREE.Quaternion();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  let seed = 456871;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const angle = v => Math.atan2(Math.sin(v), Math.cos(v));
  const fabricCanvas = document.createElement('canvas'); fabricCanvas.width = fabricCanvas.height = 64;
  const fc = fabricCanvas.getContext('2d'); fc.fillStyle = '#e2dccb'; fc.fillRect(0, 0, 64, 64);
  for (let x = 0; x < 64; x += 2) { fc.fillStyle = x % 4 ? '#c3bba7' : '#d4cbb6'; fc.fillRect(x, 0, 1, 64); }
  fc.fillStyle = 'rgba(70,56,36,.09)'; for (let y = 0; y < 64; y += 3) fc.fillRect(0, y, 64, 1);
  const fabric = new THREE.CanvasTexture(fabricCanvas); fabric.colorSpace = THREE.SRGBColorSpace;
  const shirtMat = new THREE.MeshStandardMaterial({ roughness: .94, map: fabric });
  const skinMat = new THREE.MeshStandardMaterial({ roughness: .75 });
  const clothMat = new THREE.MeshStandardMaterial({ roughness: .93, color: 0xffffff, map: scene.userData.jejakaTextileTexture || fabric });
  const darkMat = new THREE.MeshStandardMaterial({ roughness: .86 });
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 64;
  const sc = shadowCanvas.getContext('2d'), gradient = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(15,18,16,.4)'); gradient.addColorStop(.5, 'rgba(15,18,16,.19)'); gradient.addColorStop(1, 'rgba(15,18,16,0)');
  sc.fillStyle = gradient; sc.fillRect(0, 0, 64, 64);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, toneMapped: false });
  const sphere = new THREE.SphereGeometry(1, 12, 8), cylinder = new THREE.CylinderGeometry(1, .91, 1, 9);
  const torso = new THREE.LatheGeometry([new THREE.Vector2(.155, 0), new THREE.Vector2(.16, .1), new THREE.Vector2(.185, .31), new THREE.Vector2(.214, .43), new THREE.Vector2(.2, .49), new THREE.Vector2(.083, .55)], 12);
  const skirt = new THREE.CylinderGeometry(.165, .245, .72, 12);
  const shoe = new THREE.SphereGeometry(1, 10, 6);
  const shadow = new THREE.PlaneGeometry(1, 1); shadow.rotateX(-Math.PI / 2);
  const definitions = {
    torso: [torso, shirtMat, 1], pelvis: [sphere, shirtMat, 1], upper: [cylinder, shirtMat, 8],
    skin: [cylinder, skinMat, 4], head: [sphere, skinMat, 4], hand: [sphere, skinMat, 2],
    hair: [sphere, darkMat, 2], face: [sphere, darkMat, 5], shoe: [shoe, darkMat, 2],
    skirt: [skirt, clothMat, 1], peci: [new THREE.CylinderGeometry(.105, .114, .105, 12), darkMat, 1],
    straw: [new THREE.ConeGeometry(.28, .13, 14), shirtMat, 1],
    collar: [new THREE.TorusGeometry(.074, .014, 5, 12, Math.PI * 1.6), shirtMat, 1],
    basket: [new THREE.CylinderGeometry(.145, .12, .24, 10), shirtMat, 2],
    bundle: [new THREE.CylinderGeometry(.115, .115, .47, 10), clothMat, 1],
    shawl: [new THREE.TorusGeometry(.215, .04, 5, 14, Math.PI * 1.2), clothMat, 1],
    shadow: [shadow, shadowMat, 1], fruit: [sphere, shirtMat, 4], tool: [cylinder, darkMat, 2], cup: [sphere, darkMat, 1]
  };
  for (const [name, [geometry, material, multiple]] of Object.entries(definitions)) {
    const mesh = new THREE.InstancedMesh(geometry, material, MAX * multiple);
    mesh.name = `Civilian ${name}`; mesh.count = 0; mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.castShadow = ['torso', 'pelvis', 'upper', 'head', 'hair', 'skirt', 'peci'].includes(name);
    mesh.receiveShadow = name !== 'face' && name !== 'shadow';
    root.add(mesh); batches[name] = { mesh, count: 0 };
  }
  const palette = [0x8a9e95, 0xbba37c, 0x8c7066, 0xd5c6a4, 0x5f817e, 0xaea99b, 0x786a75, 0x827b63];
  const skins = [0xb78861, 0x9d6a49, 0xc29470, 0x9f7252, 0xac7d58];
  const trousers = [0x424a46, 0x554d40, 0x545e59, 0x4b474b, 0x665c48];
  const route = [[0, 7], [0, -30], [24, -32], [24, -46], [24, -82], [24, -93], [24, -108], [20, -114], [0, -126], [-20, -150], [-23.3, -170], [-23.3, -197], [-20, -228.5]];
  // Match the authored burning storefronts in effects.js. These are pedestrian
  // avoidance footprints, not player damage volumes or extra world colliders.
  const burningFronts = [
    { x: -6, z: -45, phase: 1, radius: 4.23 }, { x: 8, z: -45.3, phase: 1, radius: 3.58 },
    { x: 29.3, z: -65, phase: 2, radius: 3.42 }, { x: 32, z: -100, phase: 3, radius: 2.6 },
    { x: -20, z: -137, phase: 4, radius: 3.9 }, { x: 17, z: -144, phase: 4, radius: 4.88 },
    { x: 30, z: -174, phase: 5, radius: 4.23 }
  ];
  function fireAt(x, z, margin = 0) {
    return burningFronts.find(f => current.phase >= f.phase && Math.hypot(x - f.x, z - f.z) < f.radius + margin);
  }
  function rescueStageActive() {
    return (current.phase === 3 && !current.helped) || (current.phase === 4 && current.helpedAt > 0 && current.time >= current.helpedAt && current.time - current.helpedAt < 2.2);
  }
  function rescueWorkingArea(x, z) {
    return rescueStageActive() && x > 21.5 && x < 27.4 && z < -87.4 && z > -96.8;
  }

  const people = [], heroes = {}, dropped = [];
  const districts = [
    { name: 'market', count: 40, x: 0, z: -6, w: 12, d: 42, route: [[-5, 10], [-5, -20], [5, -20], [5, 10]], escape: 1 },
    { name: 'alley', count: 16, x: 24, z: -59, w: 5.4, d: 35, route: [[22, -43], [22, -72], [26, -72], [26, -43]], escape: 4 },
    { name: 'courtyard', count: 16, x: 23, z: -88, w: 15, d: 14, route: [[17, -81], [29, -81], [29, -95], [19, -95]], escape: 6 },
    { name: 'plaza', count: 26, x: 0, z: -132, w: 30, d: 21, route: [[-13, -121], [13, -121], [13, -140], [-13, -140]], escape: 9 },
    { name: 'bridge', count: 12, x: -20, z: -164, w: 5.2, d: 19, route: [[-22, -155], [-22, -172], [-18, -172], [-18, -155]], escape: 10 },
    { name: 'refuge', count: 7, x: -20, z: -217, w: 17, d: 13, route: [[-27, -211], [-13, -211], [-13, -224], [-27, -224]], escape: 12 }
  ];
  function person(i, x, z, hero = '', district = null) {
    const female = hero === 'sari' || (!hero && i % 3 === 1);
    return { i, id: hero || `civilian-${i}`, hero, district, x, z, homeX: x, homeZ: z,
      scale: hero === 'adi' ? .65 : hero === 'sari' ? .97 : .91 + random() * .13,
      wide: .91 + random() * .15, female, sarong: hero === 'sari' || (female && i % 4 !== 0),
      shirt: hero === 'sari' ? 0xd3b994 : hero === 'adi' ? 0x7f9b96 : hero === 'wiryo' ? 0x898b71 : palette[i % palette.length],
      pants: hero === 'sari' ? 0x5c5363 : trousers[i % trousers.length], skin: skins[i % skins.length],
      hair: i % 9 === 0 ? 0x6e6b5d : [0x242720, 0x302e25, 0x2b2a24][i % 3],
      hat: hero === 'wiryo' ? 1 : hero ? 0 : i % 8 === 0 ? 2 : i % 5 === 0 ? 1 : 0,
      yaw: hero ? Math.PI : random() * Math.PI * 2, speed: 0, distance: random() * 2,
      gait: random(), job: i % 7, bag: !hero && i % 5 === 0, phaseOffset: random() * Math.PI * 2,
      targetX: x, targetZ: z, routeIndex: 1, routineIndex: i % 4, mode: 'routine', reaction: .25 + random() * 1.9,
      alertedAt: null, age: 0, stopped: 1, look: 0, renderTier: 'near', pending: 0, drop: false };
  }
  for (const [name, x, z] of [['sari', -4.3, 2.5], ['adi', -2, 2], ['wiryo', -23.2, -181.5]]) {
    const p = person(people.length, x, z, name); people.push(p); heroes[name] = p;
  }
  for (const district of districts) for (let n = 0; n < district.count; n++) {
    const p = person(people.length, district.x + (random() - .5) * district.w, district.z + (random() - .5) * district.d, '', district);
    // Keep the natural workshop approach open: residents still trade and walk
    // on the right and farther up-street, rather than masking Sari's hands.
    if (district.name === 'market' && p.z >= 0) { p.x = 3.4 + p.i % 5 * .7; p.homeX = p.x; p.targetX = p.x; }
    if (district.name === 'plaza' && n < 6) {
      // These existing residents are present from boot. Their local departure
      // starts when the visitor reaches the square, not thirty metres earlier.
      const homes = [[4.6, -131.4], [5.5, -132.2], [9.4, -135.2], [10.3, -136], [-5.7, -137.6], [-6.35, -137.8]];
      p.x = p.homeX = homes[n][0]; p.z = p.homeZ = homes[n][1];
      p.plazaRole = n < 4 ? 'crossing' : n === 4 ? 'helper' : 'supported';
      p.plazaOrder = n; p.plazaStep = 0; p.plazaFinished = false;
      p.bag = n === 1 || n === 3; p.yaw = p.plazaHomeYaw = n < 4 ? -Math.PI / 2 : n === 4 ? -1.87 : 1.27;
    }
    p.routeIndex = district.escape; people.push(p);
  }
  const stats = { population: people.length, active: 0, visible: 0, near: 0, mid: 0, hidden: 0, moving: 0, drawCalls: 0, overflows: 0, heroModels: 0 };
  let colliders = [], current = {}, previousPhase = 0, disposed = false, departureStartedAt = null, plazaEnteredAt = null, plazaImpactAt = null;
  const modelStats = { loading: false, loaded: 0, failed: 0, errors: [], strategy: 'Anatomical hero models with articulated fallback' };
  const heroModels = new Map();
  function add(name, position, scale, hex, euler = null) {
    const batch = batches[name], index = batch.count++;
    if (index >= batch.mesh.instanceMatrix.count) { batch.count--; stats.overflows++; return; }
    dummy.position.set(position[0], position[1], position[2]); dummy.scale.set(scale[0], scale[1], scale[2]); dummy.quaternion.identity();
    if (euler) dummy.rotation.set(euler[0], euler[1], euler[2]);
    dummy.updateMatrix(); local.copy(dummy.matrix); local.premultiply(world);
    batch.mesh.setMatrixAt(index, local); colour.setHex(hex); batch.mesh.setColorAt(index, colour);
  }
  function segment(name, first, second, radius, hex) {
    a.set(...first); b.set(...second); const len = a.distanceTo(b); rotation.setFromUnitVectors(up, b.sub(a).normalize());
    dummy.position.set((first[0] + second[0]) / 2, (first[1] + second[1]) / 2, (first[2] + second[2]) / 2);
    dummy.quaternion.copy(rotation); dummy.scale.set(radius, len, radius); dummy.updateMatrix(); local.copy(dummy.matrix).premultiply(world);
    const batch = batches[name], index = batch.count++;
    if (index >= batch.mesh.instanceMatrix.count) { batch.count--; stats.overflows++; return; }
    batch.mesh.setMatrixAt(index, local); colour.setHex(hex); batch.mesh.setColorAt(index, colour);
  }
  function knee(hip, ankle, length = .415) {
    // Two equal bones: preserve limb length while bending the knee forward.
    const dx = ankle[0] - hip[0], dy = ankle[1] - hip[1], dz = ankle[2] - hip[2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz), uy = dy / d, uz = dz / d;
    const bendY = -uz, bendZ = uy, n = Math.hypot(bendY, bendZ) || 1;
    const bend = Math.sqrt(Math.max(.0002, length * length - Math.min(d * d / 4, length * length - .0002)));
    return [(hip[0] + ankle[0]) / 2, (hip[1] + ankle[1]) / 2 - bendY / n * bend, (hip[2] + ankle[2]) / 2 - bendZ / n * bend];
  }
  function draw(p, t, player) {
    dummy.position.set(p.x, 0, p.z); dummy.rotation.set(0, p.yaw, 0); dummy.scale.set(p.scale * p.wide, p.scale, p.scale); dummy.updateMatrix(); world.copy(dummy.matrix);
    const run = p.speed > 2.1, moving = clamp(p.speed / 1.25, 0, 1), crouch = ['duck', 'help', 'trapped'].includes(p.mode);
    const lowered = p.mode === 'trapped' ? .52 * (1 - (p.helpRise || 0)) : p.mode === 'help' ? .2 : p.mode === 'push' ? .06 : crouch ? .28 : 0, stride = run ? .79 : .645, stanceFraction = run ? .5 : .62, cycle = p.gait % 1;
    const bob = Math.sin(cycle * Math.PI * 4) * (run ? .022 : .009) * moving;
    const hipY = .885 - lowered + bob - moving * .065 - (run ? .025 : 0), bodyLean = run ? .09 : crouch ? .12 : .008;
    const breathe = Math.sin(t * 1.8 + p.phaseOffset) * .003;
    add('shadow', [0, .018, 0], [.74 + lowered * .3, .74, 1], 0xffffff);
    add('pelvis', [0, hipY - .025, 0], [.18, .14, .13], p.pants);
    add('torso', [0, hipY - .025, bodyLean], [1, 1 + breathe, .93], p.shirt, [run ? .11 : crouch ? .16 : 0, 0, Math.sin(cycle * 6.28) * .015 * moving]);
    add('skin', [0, hipY + .565, bodyLean + .015], [.055, .075, .055], p.skin);
    add('collar', [0, hipY + .508, bodyLean + .02], [1, .85, 1], 0xd0c8b4, [Math.PI / 2, 0, 0]);
    if (p.sarong) add('skirt', [0, hipY - .285, -.005], [1, 1, .91], p.pants, [0, 0, Math.sin(cycle * 6.28) * .017 * moving]);
    for (const side of [-1, 1]) {
      const footPhase = (cycle + (side === 1 ? .5 : 0)) % 1;
      let footZ, lift;
      if (footPhase < stanceFraction) { footZ = (.5 - footPhase / stanceFraction) * stride; lift = 0; }
      else { const s = (footPhase - stanceFraction) / (1 - stanceFraction), ease = s * s * (3 - 2 * s); footZ = (-.5 + ease) * stride; lift = Math.sin(s * Math.PI) * (run ? .2 : .105); }
      footZ *= moving; lift *= moving;
      const hip = [side * .103, hipY, 0], ankle = [side * .108, .073 + lift, footZ];
      const joint = knee(hip, ankle);
      if (!p.sarong) { segment('upper', hip, joint, .078, p.pants); segment('upper', joint, ankle, .059, p.pants); }
      else segment('skin', [side * .108, .275 + lift * .3, footZ * .55], ankle, .047, p.skin);
      add('shoe', [side * .108, .048 + lift, footZ + .041], [.072, .045, .135], 0x373a32, [footPhase > .84 ? -.15 * moving : footPhase > .48 && footPhase < .62 ? .19 * moving : 0, 0, 0]);
      const swing = -Math.sin(footPhase * 6.28) * (run ? .31 : .22) * moving;
      const shoulder = [side * .207, hipY + .445, bodyLean + .015];
      let elbow = [side * .235, hipY + (run ? .255 : .225), bodyLean + swing * .5];
      let wrist = [side * .23, hipY + (run ? .27 : .035), bodyLean + swing + (run ? .12 : .02)];
      if (p.hero === 'sari' && current.phase === 0 && !current.learned) {
        elbow = [side * .235, hipY + .27, .2]; wrist = [side * .14, hipY + .12 + Math.sin(t * 1.6 + side) * .028, .4];
      } else if (p.hero === 'sari') {
        elbow = [side * .23, hipY + .26, .24]; wrist = [side * .14, hipY + .15, .36];
      } else if (p.mode === 'trapped') {
        elbow = [side * .23, hipY + .19, .23]; wrist = [side * .12, hipY - .08, .36];
      } else if (p.mode === 'carry' && side === p.carrierSide) { elbow = [side * .27, hipY + .23, 0]; wrist = [side * .24, hipY + .04, 0];
      } else if (p.plazaRole === 'helper' && p.mode === 'help') {
        elbow = [side * .23, hipY + .36, .24]; wrist = [side * .13, hipY + .34, .5];
      } else if (p.mode === 'help' || p.mode === 'push') {
        elbow = [side * .25, hipY + .2, .27]; wrist = [side * .19, hipY + .02, .48];
      } else if (p.mode === 'shield' || (p.mode === 'duck' && side === 1)) {
        elbow = [side * .29, hipY + .51, .12]; wrist = [side * .13, hipY + .7, .16];
      } else if (p.mode === 'routine' && p.speed < .15) {
        if (p.job === 0 && side === 1) { elbow = [.29, hipY + .31, .1]; wrist = [.25, hipY + .43 + Math.sin(t * 1.9 + p.i) * .025, .29]; }
        if (p.job === 2) { elbow = [side * .23, hipY + .22, .17]; wrist = [side * .12, hipY + .1, .32]; }
        if (p.job === 4 && side === 1) { elbow = [.2, hipY + .32, .15]; wrist = [.14, hipY + .56, .16]; }
      }
      segment('upper', shoulder, elbow, .057, p.shirt); segment('skin', elbow, wrist, .04, p.skin);
      add('hand', wrist, [.038, .052, .032], p.skin, [0, 0, side * .1]);
    }
    const headY = hipY + .7, look = p.look || 0;
    const hx = Math.sin(look) * .016, hz = bodyLean + .015;
    add('head', [hx, headY, hz], [.103, .135, .101], p.skin, [crouch ? .13 : -.015, look, 0]);
    add('hair', [hx, headY + .075, hz - .015], [.107, .073, .097], p.hair, [0, look, 0]);
    if (p.female) add('hair', [hx - Math.sin(look) * .085, headY + .035, hz - Math.cos(look) * .09], [.066, .066, .055], p.hair);
    if (p.renderTier === 'near') {
      // No spherical white eyeballs: eyes and mouth stay small at human scale.
      const blink = Math.sin(t * .83 + p.phaseOffset) > .993;
      for (const side of [-1, 1]) {
        const x = side * .038, z = .095;
        add('face', [hx + Math.cos(look) * x + Math.sin(look) * z, headY + .014, hz - Math.sin(look) * x + Math.cos(look) * z], [.009, blink ? .0015 : .005, .003], 0x322b23, [0, look, 0]);
        add('head', [hx + side * .1, headY - .005, hz], [.016, .028, .02], p.skin);
      }
      add('head', [hx + Math.sin(look) * .112, headY - .015, hz + Math.cos(look) * .112], [.019, .028, .027], p.skin, [0, look, 0]);
      add('face', [hx + Math.sin(look) * .097, headY - .062, hz + Math.cos(look) * .097], [.018, .003, .003], 0x765440, [0, look, 0]);
    }
    if (p.hat === 1) add('peci', [hx, headY + .12, hz - .009], [1, 1, 1], 0x292d27, [0, look, 0]);
    if (p.hat === 2) add('straw', [hx, headY + .13, hz], [1, 1, 1], 0xc0a578, [0, look, 0]);
    if (p.hero === 'sari') {
      add('shawl', [0, hipY + .43, .04], [1, .76, 1], 0xe6d6b7, [.1, 0, .12]);
      add('bundle', [0, hipY + .13, .39], [1, 1, 1], current.helped === false && current.phase > 4 ? 0xb39470 : 0xffffff, [0, 0, Math.PI / 2]);
    }
    if (p.hero === 'sari' && current.phase === 0 && !current.learned) {
      const stroke = Math.sin(t * 1.6 + 1) * .028;
      segment('tool', [.14, hipY + .12 + stroke, .4], [.12, hipY + .08 + stroke, .55], .012, 0x74583d);
      add('cup', [.12, hipY + .08 + stroke, .55], [.025, .017, .026], 0x9c7c43);
      segment('tool', [.13, hipY + .075 + stroke, .56], [.145, hipY + .06 + stroke, .59], .006, 0xb79a60);
    } else if (p.hero === 'sari') {
      segment('tool', [.16, hipY + .15, .36], [.19, hipY + .11, .50], .012, 0x74583d);
      add('cup', [.19, hipY + .11, .50], [.025, .017, .026], 0xad8b4a);
      segment('tool', [.2, hipY + .105, .51], [.215, hipY + .085, .54], .006, 0xc2a368);
    }
    if (p.bag && !p.drop) add('basket', [.265, hipY - .08, .03], [1, 1.08, 1], 0x9c8158, [0, 0, -.06]);
  }
  function blocked(x, z, radius = .24, person = null) {
    // This is a pre-war social staging boundary, never a player collider.
    // Once the attack starts, ordinary escape routes can use this space.
    if (person && !person.hero && (current.phase || 0) === 0 && x + radius > -7 && x - radius < 1 && z + radius > 1 && z - radius < 9) return true;
    if (person && !person.hero) for (const f of burningFronts) {
      if (current.phase < f.phase) continue;
      const next = Math.hypot(x - f.x, z - f.z), previous = Math.hypot(person.x - f.x, person.z - f.z);
      // A resident already caught by a newly lit frontage may step outward.
      // Ordinary collision checks still prevent crossing its wall or a prop.
      if (next < f.radius + radius && (previous >= f.radius + radius || next <= previous + .00001)) return true;
    }

    for (const c of colliders) {
      if (person?.hero === 'adi' && current.phase === 3 && !current.helped && c.tag === 'help beam') continue;
      if (x + radius > c.minX && x - radius < c.maxX && z + radius > c.minZ && z - radius < c.maxZ) return true;
    }
    return false;
  }
  function walk(p, tx, tz, wantedSpeed, dt, player, arrivalRadius = .24, navigation = null) {
    let dx = tx - p.x, dz = tz - p.z, distance = Math.hypot(dx, dz);
    if (distance < arrivalRadius) wantedSpeed = 0;
    p.speed += (wantedSpeed - p.speed) * Math.min(1, dt * (wantedSpeed > p.speed ? 3.8 : 7));
    if (distance < .08 || p.speed < .015) { p.speed = 0; return; }
    dx /= distance; dz /= distance;
    // Neighbours separate locally; they do not march in synchronized rigid lanes.
    let avoidX = 0, avoidZ = 0;
    for (const other of people) {
      if (other === p || Math.abs(other.z - p.z) > .8 || Math.abs(other.x - p.x) > .8) continue;
      const ox = p.x - other.x, oz = p.z - other.z, d = Math.hypot(ox, oz);
      if (d > .01 && d < .68) { const force = (.68 - d) * (p.hero && !other.hero ? .12 : !p.hero && other.hero ? 1.3 : .7); avoidX += ox / d * force; avoidZ += oz / d * force; }
    }
    const toPlayerX = p.x - player.x, toPlayerZ = p.z - player.z, cameraDistance = Math.hypot(toPlayerX, toPlayerZ);
    const minimum = p.hero ? 1.6 : .78;
    if (cameraDistance < minimum && cameraDistance > .01) {
      const force = (minimum - cameraDistance) * 2.3; avoidX += toPlayerX / cameraDistance * force; avoidZ += toPlayerZ / cameraDistance * force;
    }
    const step = Math.min(dt, .1);
    if (navigation?.returnToEntry) {
      // Outside a rail, first walk back along its exterior. Turning inward here
      // would hit the rail; crossing first would hit the river. Keep this a
      // physical increasing-z walk, without a lateral personal-space shove.
      dx = 0; dz = 1; avoidX = avoidZ = 0;
    }
    const pathSpeed = navigation?.precise ? Math.min(p.speed, distance / Math.max(.001, step)) : p.speed;
    let vx = dx * pathSpeed + avoidX, vz = dz * pathSpeed + avoidZ;
    if (navigation && p.x >= navigation.minX - .03 && p.x <= navigation.maxX + .03) {
      // On this narrow authored lane, separation cannot push a companion off
      // the usable mouth before the physical rail begins. Only the avoidance
      // velocity is limited; neither positions nor world colliders are moved.
      avoidX = clamp(avoidX, (navigation.minX - p.x) / Math.max(.001, step) - dx * pathSpeed, (navigation.maxX - p.x) / Math.max(.001, step) - dx * pathSpeed);
      vx = dx * pathSpeed + avoidX;
    }
    let nx = p.x + vx * step, nz = p.z + vz * step;
    if (blocked(nx, nz, .24, p)) {
      if (!blocked(nx, p.z, .24, p)) nz = p.z;
      else if (!blocked(p.x, nz, .24, p)) nx = p.x;
      else {
        // Side-step an authored prop; never tunnel through a building.
        nx = p.x + dz * step * p.speed; nz = p.z - dx * step * p.speed;
        if (blocked(nx, nz, .24, p)) { nx = p.x; nz = p.z; }
      }
    }
    const travelled = Math.hypot(nx - p.x, nz - p.z); p.x = nx; p.z = nz; p.distance += travelled; p.gait = (p.gait + travelled / (p.speed > 2.1 ? 1.58 : 1.04)) % 1;
    const actual = travelled / Math.max(.001, step); p.speed += (actual - p.speed) * Math.min(1, dt * 9);
    if (travelled > .001) {
      const targetYaw = Math.atan2(vx, vz); p.yaw += angle(targetYaw - p.yaw) * Math.min(1, dt * 8);
    }
  }
  function goalIndex(target, fallback) {
    if (!target || !Number.isFinite(target.x) || !Number.isFinite(target.z)) return fallback;
    let best = 0, distance = Infinity;
    route.forEach(([x, z], i) => { const d = Math.hypot(x - target.x, z - target.z); if (d < distance) { best = i; distance = d; } });
    return best;
  }
  function moveHero(p, dt, t, state, player) {
    const phase = state.phase || 0;
    if (phase === 0) {
      if (!state.learned || p.hero === 'wiryo') {
        p.speed *= Math.exp(-dt * 8); p.mode = 'routine';
        if (p.hero === 'adi') p.yaw = Math.PI / 2 + Math.sin(t * .4) * .1;
        else if (p.hero === 'sari') p.yaw = -.3217505544;
        return;
      }
      const clock = Number.isFinite(state.time) ? state.time : t;
      if (departureStartedAt === null) departureStartedAt = Number.isFinite(state.learnedAt) && state.learnedAt >= 0 ? state.learnedAt : clock;
      const packingTime = Math.max(0, clock - departureStartedAt);
      if (packingTime < 1.5) { p.speed *= Math.exp(-dt * 8); p.mode = 'packing'; p.packingTime = packingTime; return; }
      const target = state.companionTarget && Number.isFinite(state.companionTarget.x) && Number.isFinite(state.companionTarget.z) ? state.companionTarget : { x: 0, z: -20 };
      const tx = target.x + (p.hero === 'sari' ? -.65 : .6), tz = target.z;
      const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz), pd = Math.hypot(player.x - p.x, player.z - p.z);
      const ahead = ((player.x - p.x) * dx + (player.z - p.z) * dz) / Math.max(.01, d) < -3;
      const partner = p.hero === 'sari' ? heroes.adi : heroes.sari;
      const partnerBehind = ((partner.x - p.x) * dx + (partner.z - p.z) * dz) / Math.max(.01, d) < -3.2;
      const speed = d < .65 || (pd > 10 && ahead) || partnerBehind ? 0 : 3.8;
      p.mode = speed ? 'walk' : 'wait'; walk(p, tx, tz, speed, dt, player); return;
    }
    if (p.hero === 'wiryo') {
      if (phase < 5) { p.mode = state.war > .4 ? 'duck' : 'routine'; p.speed = 0; return; }
      const progress = state.bridgeHelped ? 1 : clamp(state.bridgeProgress || 0, 0, 1);
      p.mode = progress > 0 && progress < 1 ? 'push' : progress === 0 ? 'wait' : 'run';
      if (progress >= 1) walk(p, -24.5, -226, 3.8, dt, player);
      else { const nx = -23.2 + progress * 3.2; const travelled = Math.abs(nx - p.x); p.distance += travelled; p.gait = (p.gait + travelled / 1.04) % 1; p.x = nx; p.z = -181.5; p.yaw = Math.PI / 2; p.speed = travelled / Math.max(.001, dt); }
      return;
    }
    const releasedAge = phase === 4 && state.helped && Number.isFinite(state.helpedAt) && state.helpedAt > 0 ? (state.time || 0) - state.helpedAt : Infinity;
    if (releasedAge >= 0 && releasedAge < 1.2) {
      // Let the actual rescued child stand and rejoin before running again.
      // No route gate or position reset: a moving player can continue at once.
      p.speed = 0; p.routeIndex = Math.max(6, p.routeIndex);
      p.recoveryRise = clamp(releasedAge / .8, 0, 1);
      if (p.hero === 'adi') {
        p.trapLatched = false; p.trapAnchor = null; p.helpRise = 1; p.mode = 'recover';
        p.yaw += angle(Math.atan2(player.x - p.x, player.z - p.z) - p.yaw) * Math.min(1, dt * 3);
      } else p.mode = 'steady';
      return;
    }
    const fallback = [0, 3, 4, 5, 9, 11, 12, 12][Math.min(7, phase)];
    let finalIndex = goalIndex(state.companionTarget, fallback);
    if (phase === 3 && !state.helped) finalIndex = 5;
    if (p.hero === 'adi' && phase === 2) finalIndex = 5;
    if (p.hero === 'adi' && phase === 3 && !state.helped && (p.trapLatched || Math.hypot(p.x - 24.6, p.z + 93) < .32)) {
      const h = clamp(state.helpProgress || 0, 0, 1), crawl = clamp(h / .65, 0, 1);
      if (!p.trapLatched) { p.trapLatched = true; p.trapAnchor = { x: p.x, z: p.z }; }
      const nx = p.trapAnchor.x - 1.05 * crawl, nz = p.trapAnchor.z + .28 * crawl;
      p.speed = Math.hypot(nx - p.x, nz - p.z) / Math.max(.001, dt); p.x = nx; p.z = nz;
      p.mode = 'trapped'; p.yaw = Math.PI * .8; p.helpRise = clamp((h - .35) / .65, 0, 1); return;
    }
    if (p.hero === 'sari' && phase === 3 && !state.helped && p.routeIndex >= 5 && p.z < -88) {
      const d = Math.hypot(p.x - 24.2, p.z + 92.22); p.mode = d < .15 ? 'help' : 'walk';
      walk(p, 24.2, -92.22, d < .15 ? 0 : 3.4, dt, player, .08);
      p.yaw += angle(Math.atan2(heroes.adi.x - p.x, heroes.adi.z - p.z) - p.yaw) * Math.min(1, dt * 5); return;
    }
    if (p.hero === 'adi' && phase > 3 && p.trapLatched) { p.trapLatched = false; p.routeIndex = Math.max(6, p.routeIndex); }
    if (phase > 3 && !state.helped && p.z > -96) {
      p.heroBypass = p.heroBypass || 0; const bypass = p.heroBypass === 0 ? [20.7, -90.5] : [20.7, -96];
      if (Math.hypot(p.x - bypass[0], p.z - bypass[1]) < .65) p.heroBypass++;
      if (p.heroBypass < 2) { p.mode = 'run'; walk(p, bypass[0], bypass[1], 6.5, dt, player); return; }
      p.routeIndex = Math.max(6, p.routeIndex);
    }
    p.routeIndex = clamp(p.routeIndex, 1, 12);
    const bridgeRails = colliders.filter(c => c.tag === 'bridge rail' && c.maxX < 0).sort((a, b) => a.minX - b.minX);
    const entryRail = bridgeRails[0], farRail = bridgeRails[1];
    const entryClearZ = entryRail ? entryRail.maxZ + .24 + .1 : -173.16;
    const laneMinX = Math.max(route[10][0] - .3, entryRail ? entryRail.maxX + .24 + .04 : -Infinity);
    const laneMaxX = Math.min(route[10][0] + .3, farRail ? farRail.minX - .24 - .04 : Infinity);
    const nearEntry = finalIndex >= 11 && p.z > -177 && p.z < route[10][1] + 2;
    const outsideLane = p.x < laneMinX - .03 || p.x > laneMaxX + .03;
    // A valid older save or a player backtrack may leave a companion beside
    // the exterior of the rail. Revisit the real approach waypoint rather
    // than aiming diagonally through the rail/water toward the school.
    if (nearEntry && outsideLane && p.routeIndex >= 11) p.routeIndex = 10;
    while (p.routeIndex < finalIndex && Math.hypot(route[p.routeIndex][0] - p.x, route[p.routeIndex][1] - p.z) < (p.routeIndex === 10 ? .25 : 1.1)) p.routeIndex++;
    const target = route[Math.min(p.routeIndex, finalIndex)], bridgeLane = p.routeIndex >= 10 && p.routeIndex <= 11;
    const offset = bridgeLane ? 0 : p.hero === 'sari' ? -.65 : .6;
    let tx = target[0] + offset, tz = target[1];
    const navigation = bridgeLane && finalIndex >= 11 ? { minX: laneMinX, maxX: laneMaxX, precise: p.routeIndex === 10, returnToEntry: nearEntry && outsideLane && p.z <= entryClearZ } : null;
    if (navigation?.returnToEntry) { tx = p.x; tz = route[10][1]; }
    if (phase >= 6 && finalIndex === 12 && p.routeIndex >= 12) { tx = p.hero === 'sari' ? -20.6 : -19.5; tz = p.hero === 'sari' ? -228.5 : -228.3; }
    const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz), pd = Math.hypot(player.x - p.x, player.z - p.z);
    const ahead = ((player.x - p.x) * dx + (player.z - p.z) * dz) / Math.max(.01, d) < -5;
    let speed = p.hero === 'adi' ? 7.65 : 6.8;
    const lag = projectRoute(player, Math.max(0, p.routeIndex - 2), finalIndex).along - projectRoute(p, Math.max(0, p.routeIndex - 2), finalIndex).along;
    if (lag > 6 || (pd > 10 && !ahead)) speed = p.hero === 'adi' ? 8.4 : 8.2;
    if (pd > 13 && lag < -5) speed = 0;
    if (d < (p.hero === 'adi' && phase === 3 && !state.helped ? .25 : 1.0) && p.routeIndex >= finalIndex) speed = 0;
    if (phase >= 6 && p.routeIndex >= finalIndex && Math.hypot(tx - p.x, tz - p.z) < .45) speed = 0;
    p.mode = speed > 0 ? 'run' : phase >= 6 && p.routeIndex >= finalIndex ? 'rest' : 'wait';
    if (phase >= 6 && speed === 0) p.yaw += angle(Math.atan2(player.x - p.x, player.z - p.z) - p.yaw) * Math.min(1, dt * 3);
    if (p.hero === 'adi' && phase === 3 && !state.helped && p.routeIndex === 5 && p.z < -90) { p.mode = 'duck'; speed = Math.min(speed, 1.4); }
    p.look = Math.sin(t * .7 + p.i) > .76 ? .38 : 0;
    walk(p, tx, tz, speed, dt, player, .24, navigation);
  }
  function escapeBurningFront(p, dt, player) {
    const fire = fireAt(p.x, p.z, .3);
    if (!fire && !p.fireEscapeTarget) return false;
    if (!p.fireEscapeTarget || fireAt(p.fireEscapeTarget.x, p.fireEscapeTarget.z, .3)) {
      const centre = fire || burningFronts.find(f => current.phase >= f.phase);
      let best = null, score = Infinity;
      const start = Math.atan2(p.z - centre.z, p.x - centre.x);
      for (let i = 0; i < 24; i++) {
        const theta = start + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * Math.PI / 12;
        const x = centre.x + Math.cos(theta) * (centre.radius + .85), z = centre.z + Math.sin(theta) * (centre.radius + .85);
        if (fireAt(x, z, .4) || blocked(x, z, .28, p)) continue;
        const d = Math.hypot(x - p.x, z - p.z), steps = Math.max(1, Math.ceil(d / .2));
        let clear = true;
        for (let j = 1; j <= steps && clear; j++) clear = !blocked(p.x + (x - p.x) * j / steps, p.z + (z - p.z) * j / steps, .24, p);
        const cost = d + Math.abs(x - p.district.x) * .08;
        if (clear && cost < score) { best = { x, z }; score = cost; }
      }
      if (!best) return false;
      p.fireEscapeTarget = best;
    }
    const target = p.fireEscapeTarget;
    if (Math.hypot(target.x - p.x, target.z - p.z) < .3 && !fire) { p.fireEscapeTarget = null; return false; }
    p.mode = 'run'; p.coverTarget = null; p.alertedAt = p.alertedAt === null ? p.age : p.alertedAt;
    walk(p, target.x, target.z, 3.8, dt, player); return true;
  }
  function clearRescueArea(p, dt, player) {
    if (!rescueStageActive() || p.x <= 21.5 || p.x >= 32 || p.z >= -85.8 || p.z <= -99.5) return false;
    if (!Number.isFinite(p.rescueBypassZ)) p.rescueBypassZ = p.z < -92 ? -97.2 : -87;
    const edgeZ = p.rescueBypassZ, aroundEast = p.x > 26.6 && Math.abs(p.z - edgeZ) > .3;
    p.mode = 'run'; p.coverTarget = null; p.beamBypass = edgeZ < -92 ? 1 : 0;
    p.routeIndex = Math.max(5, p.routeIndex);
    // East-side residents first use the edge of the yard, then cross west.
    // They do not run between Raka and the child during the lifted-frame action.
    walk(p, aroundEast ? Math.max(27.7, p.x) : 20.65, edgeZ, 3.2, dt, player); return true;
  }
  function movePlazaResident(p, dt, t, state, player) {
    if (!p.plazaRole) return false;
    const clock = Number.isFinite(state.time) ? state.time : t;
    const held = p.plazaRole === 'helper' || p.plazaRole === 'supported';
    const waitingMode = p.plazaRole === 'helper' ? 'help' : p.plazaRole === 'supported' ? 'duck' : 'shield';
    if (plazaEnteredAt === null) { p.mode = waitingMode; p.speed *= Math.exp(-dt * 7); return true; }
    const elapsed = Math.max(0, clock - plazaEnteredAt), delay = p.plazaOrder < 2 ? .65 + p.plazaOrder * .2 : p.plazaOrder < 4 ? 2.8 + (p.plazaOrder - 2) * .22 : 0;
    const heldUntilImpact = held && (plazaImpactAt === null || clock < plazaImpactAt + 2.1 + (p.plazaOrder - 4) * .2) && elapsed < 12;
    if (elapsed < delay || heldUntilImpact) { p.mode = waitingMode; p.speed *= Math.exp(-dt * 7); return true; }
    if (plazaImpactAt !== null && clock - plazaImpactAt < .7 + p.plazaOrder * .035) { p.mode = 'shield'; p.speed *= Math.exp(-dt * 8); return true; }
    if (!p.plazaFinished) {
      const lane = p.plazaOrder % 2 ? .6 : -.35;
      const path = held ? [[-10.5, -136.5], [-13.5, -146], [-20, -160]] : p.plazaOrder < 2 ? [[0, -132.7], [-9.5, -135.4], [-13.5, -146], [-20, -160]] : [[2, -135.2], [-10, -136], [-14, -147], [-20, -160.7]];
      let target = path[p.plazaStep];
      if (Math.hypot(target[0] + lane - p.x, target[1] - p.z) < .75) {
        if (p.plazaStep < path.length - 1) target = path[++p.plazaStep];
        else { p.plazaFinished = true; p.routeIndex = 10; }
      }
      if (!p.plazaFinished) { p.mode = 'run'; walk(p, target[0] + lane, target[1], held ? 2.55 : 3.25 + (p.plazaOrder % 2) * .18, dt, player); return true; }
    }
    if (Math.hypot(route[p.routeIndex][0] - p.x, route[p.routeIndex][1] - p.z) < 1.1 && p.routeIndex < route.length - 1) p.routeIndex++;
    const goal = route[p.routeIndex];
    p.mode = p.routeIndex === route.length - 1 && p.z < -223 ? 'wait' : 'run';
    walk(p, goal[0] + (p.routeIndex >= 10 && p.routeIndex <= 11 ? 0 : (p.plazaOrder % 2 ? .5 : -.5)), goal[1], p.mode === 'wait' ? 0 : held ? 2.55 : 3.4, dt, player);
    return true;
  }
  function moveCivilian(p, dt, t, state, player) {
    if (escapeBurningFront(p, dt, player) || clearRescueArea(p, dt, player) || movePlazaResident(p, dt, t, state, player)) return;
    if (p.coverTarget && (fireAt(p.coverTarget.x, p.coverTarget.z, .4) || rescueWorkingArea(p.coverTarget.x, p.coverTarget.z))) p.coverTarget = null;
    const district = p.district, danger = (state.war || 0) > .08 && (player.z < p.homeZ + 30 || district.name === 'market');
    if (danger && p.alertedAt === null) p.alertedAt = p.age + p.reaction;
    if (p.alertedAt !== null && p.age < p.alertedAt) { p.mode = 'shield'; p.speed *= Math.exp(-dt * 6); return; }
    if (p.alertedAt !== null) {
      const elapsed = p.age - p.alertedAt;
      if (elapsed < .45 + p.i % 4 * .17) { p.mode = 'shield'; p.speed *= Math.exp(-dt * 8); return; }
      if (p.i % 7 === 0) {
        p.coverTarget = p.coverTarget || findCover(p);
        const d = Math.hypot(p.coverTarget.x - p.x, p.coverTarget.z - p.z);
        p.mode = d < .65 ? 'duck' : 'run'; walk(p, p.coverTarget.x, p.coverTarget.z, d < .65 ? 0 : 2.2, dt, player);
        if (d < .65) p.yaw += angle(Math.PI - p.yaw) * Math.min(1, dt * 3); return;
      }
      if (p.i % 9 === 0 && ['alley', 'courtyard', 'plaza'].includes(district.name) && elapsed < 5.5) {
        const side = p.homeX < district.x ? 1 : -1; p.mode = 'run';
        walk(p, district.x + side * district.w * .32, p.homeZ - 1.3, 2.5, dt, player); return;
      }
      if (p.bag && !p.drop && p.i % 2 === 0) { p.drop = true; dropped.push({ x: p.x + .3, z: p.z, i: p.i }); }
      p.mode = 'run'; p.look = Math.sin(t * 1.8 + p.phaseOffset) > .88 ? -.65 : 0;
      const target = route[p.routeIndex];
      if (Math.hypot(target[0] - p.x, target[1] - p.z) < 1.2 && p.routeIndex < route.length - 1) p.routeIndex++;
      let goal = route[p.routeIndex]; const lane = (p.i % 5 - 2) * .47;
      // The fallen frame has a real west-side opening. Fleeing adults take it,
      // leaving the small trapped child visible instead of piling onto his spot.
      if (!state.helped && (state.phase || 0) >= 3 && p.routeIndex >= 5 && p.routeIndex <= 6 && p.z > -95.8) {
        if (p.beamBypass === undefined) p.beamBypass = 0;
        const bypass = p.beamBypass === 0 ? [20.7, -90.5] : [20.7, -96];
        if (Math.hypot(p.x - bypass[0], p.z - bypass[1]) < .75) p.beamBypass++;
        if (p.beamBypass >= 2) { p.routeIndex = Math.max(6, p.routeIndex); goal = route[p.routeIndex]; }
        else goal = p.beamBypass === 0 ? [20.7, -90.5] : [20.7, -96];
      }
      if (p.routeIndex === route.length - 1 && p.z < -214) { p.mode = p.i % 3 ? 'wait' : 'help'; p.speed *= Math.exp(-dt * 7); return; }
      const aftermathPause = p.i % 11 === 0 && elapsed > 7 && elapsed < 11;
      if (aftermathPause) { p.mode = 'help'; p.speed *= Math.exp(-dt * 7); return; }
      walk(p, goal[0] + lane, goal[1] + p.i % 3 * .5, 3.15 + p.i % 6 * .24, dt, player); return;
    }
    p.mode = 'routine'; p.look = Math.sin(t * .4 + p.i) * .1;
    // Conversations, a drink, cloth handling and customers remain independent
    // of the player. Only some residents are perpetually walking.
    if (p.job === 0 || p.job === 2 || p.job === 4) {
      p.speed *= Math.exp(-dt * 7); p.yaw += angle((p.i % 2 ? Math.PI / 2 : -Math.PI / 2) - p.yaw) * Math.min(1, dt * 2); return;
    }
    const routine = district.name === 'market' ? (p.homeZ >= 0 ? [[3.3, 12], [7, 12], [7, -3], [3.3, -3]] : [[-6, -5], [-6, -22], [6, -22], [6, -5]]) : district.route;
    const wp = routine[p.routineIndex];
    if (Math.hypot(wp[0] - p.x, wp[1] - p.z) < .45) p.routineIndex = (p.routineIndex + 1) % routine.length;
    const target = routine[p.routineIndex]; walk(p, target[0] + (p.i % 3 - 1) * .28, target[1], .68 + p.i % 4 * .13, dt, player);
  }
  function update(dt, t, state = {}, player = { x: 0, z: 12 }) {
    current = state;
    selectActive();
    updateCommunity(dt, t, state, player);
    if (Array.isArray(state.colliders)) colliders = state.colliders;
    if (state.phase === 0 && previousPhase > 0) reset();
    previousPhase = state.phase || 0;
    if (!state.paused) {
      const clock = Number.isFinite(state.time) ? state.time : t;
      if (plazaEnteredAt === null && state.phase >= 4 && player.z < -115) plazaEnteredAt = clock;
      if (plazaEnteredAt !== null && plazaImpactAt === null && state.hazards?.includes('square')) plazaImpactAt = clock;
    }
    stats.plaza = { stagedResidents: 6, entered: plazaEnteredAt !== null, enteredAt: plazaEnteredAt, impactAt: plazaImpactAt, near: 0, moving: 0, sheltered: 0 };
    const cap = quality === 'low' ? 70 : quality === 'high' ? 120 : 95;
    for (const batch of Object.values(batches)) batch.count = 0;
    stats.active = stats.visible = stats.near = stats.mid = stats.hidden = stats.moving = stats.overflows = 0;
    for (const p of people) {
      const active = activeIds.has(p.i);
      if (!active) { stats.hidden++; continue; }
      stats.active++;
      const distance = Math.hypot(player.x - p.x, player.z - p.z);
      if (p.model) p.model.wrapper.visible = false;
      if (!state.paused) { p.age += dt; if (p.hero) moveHero(p, dt, t, state, player); else if (p.communityRole === 'waiter') moveCommunityWaiter(p, dt, t, state, player); else if (!p.communityRole) moveCivilian(p, dt, t, state, player); }
      // The guided bridge lane already handles personal space. A second
      // camera shove here could put a companion outside a rail before its end,
      // defeating navigation and trapping them against the river corner.
      const guidedBridge = p.hero !== 'wiryo' && p.routeIndex >= 10 && p.z < route[10][1] + 2 && p.z > route[11][1] - 1;
      if (!state.paused && p.hero && !guidedBridge && !['trapped', 'help', 'rest', 'push', 'recover', 'steady'].includes(p.mode)) {
        const dx = p.x - player.x, dz = p.z - player.z, d = Math.hypot(dx, dz);
        if (d < 1.5) {
          const ux = d > .001 ? dx / d : 1, uz = d > .001 ? dz / d : 0;
          const step = Math.min(1.5 - d, dt * 5);
          const nx = p.x + ux * step, nz = p.z + uz * step;
          let sx = nx, sz = nz;
          if (blocked(sx, sz)) { sx = p.x - uz * step; sz = p.z + ux * step; if (blocked(sx, sz)) { sx = p.x + uz * step; sz = p.z - ux * step; } }
          if (!blocked(sx, sz)) { p.x = sx; p.z = sz; p.distance += step; p.gait = (p.gait + step / 1.04) % 1; p.speed = Math.max(p.speed, step / Math.max(dt, .001)); }
        }
      }
      if (distance > (quality === 'low' ? 72 : 105)) { stats.hidden++; continue; }
      p.renderTier = distance < 20 || !!p.hero ? 'near' : 'mid'; stats[p.renderTier]++; stats.visible++;
      if (p.speed > .1) stats.moving++;
      if (p.plazaRole) { if (distance < 24) stats.plaza.near++; if (p.speed > .1) stats.plaza.moving++; if (['duck', 'help', 'shield'].includes(p.mode)) stats.plaza.sheltered++; }
      if (p.model) drawHeroModel(p, dt, t, state, player); else draw(p, t, player);
    }
    // Abandoned baskets/fruit make a visible transition from trading to flight.
    world.identity();
    for (const d of dropped) {
      if (Math.hypot(d.x - player.x, d.z - player.z) > 70) continue;
      add('basket', [d.x, .14, d.z], [1, 1, 1], 0x9c8158, [0, .4, 1.05]);
      for (let n = 0; n < 3; n++) add('fruit', [d.x + Math.sin(n * 2.3 + d.i) * (.3 + n * .1), .08, d.z + Math.cos(n * 2.3 + d.i) * .35], [.085, .08, .085], n % 2 ? 0xb48d39 : 0x8a9259);
    }
    stats.drawCalls = 0;
    for (const batch of Object.values(batches)) {
      batch.mesh.count = batch.count; batch.mesh.instanceMatrix.needsUpdate = true;
      if (batch.mesh.instanceColor) batch.mesh.instanceColor.needsUpdate = true;
      if (batch.count) stats.drawCalls++;
    }
  }
  function reset() {
    dropped.length = 0; departureStartedAt = null; plazaEnteredAt = plazaImpactAt = null; community.x = -21.3; community.z = -177; community.speed = community.distance = 0; community.releasedAt = null;
    for (const p of people) {
      p.x = p.homeX; p.z = p.homeZ; p.speed = 0; p.routeIndex = p.hero === 'wiryo' ? 10 : p.district?.escape || 1;
      p.plazaStep = 0; p.plazaFinished = false; if (p.plazaRole) p.yaw = p.plazaHomeYaw; p.mode = 'routine'; p.alertedAt = null; p.beamBypass = undefined; p.heroBypass = 0; p.coverTarget = null; p.fireEscapeTarget = null; p.rescueBypassZ = null; p.trapLatched = false; p.trapAnchor = null; p.drop = false; p.helpRise = 0; p.look = 0;
    }
  }
  function projectRoute(point, from = 0, to = route.length - 1) {
    let along = 0, best = { x: route[0][0], z: route[0][1], index: 1, along: 0, distance: Infinity };
    for (let i = 0; i < route.length - 1; i++) {
      const start = route[i], end = route[i + 1], dx = end[0] - start[0], dz = end[1] - start[1], len = Math.hypot(dx, dz);
      if (i >= Math.max(0, Math.min(from, to - 1)) && i < to) {
        const u = clamp(((point.x - start[0]) * dx + (point.z - start[1]) * dz) / (len * len), 0, 1);
        const x = start[0] + dx * u, z = start[1] + dz * u, d = Math.hypot(point.x - x, point.z - z);
        if (d < best.distance) best = { x, z, index: i + 1, along: along + len * u, distance: d };
      }
      along += len;
    }
    return best;
  }
  function sampleRoute(along) {
    for (let i = 0; i < route.length - 1; i++) {
      const start = route[i], end = route[i + 1], len = Math.hypot(end[0] - start[0], end[1] - start[1]);
      if (along <= len) { const u = clamp(along / len, 0, 1); return { x: start[0] + (end[0] - start[0]) * u, z: start[1] + (end[1] - start[1]) * u, routeIndex: i + 1 }; }
      along -= len;
    }
    return { x: route.at(-1)[0], z: route.at(-1)[1], routeIndex: route.length - 1 };
  }
  function findCover(p) {
    let best = null, score = Infinity;
    for (const c of colliders) {
      if (!['crate', 'barrel', 'stall'].includes(c.tag)) continue;
      const cx = (c.minX + c.maxX) / 2, cz = (c.minZ + c.maxZ) / 2;
      for (const [x, z] of [[cx, c.maxZ + .7], [c.minX - .7, cz], [c.maxX + .7, cz]]) {
        const d = Math.hypot(x - p.homeX, z - p.homeZ);
        if (d < 14 && d < score && !fireAt(x, z, .4) && !rescueWorkingArea(x, z) && !blocked(x, z, .28, p)) { best = { x, z }; score = d; }
      }
    }
    if (best) return best;
    const d = p.district, side = p.i % 2 ? -1 : 1;
    const x = d.name === 'market' ? side * 7.4 : d.name === 'alley' ? 24 + side * 3 : d.name === 'courtyard' ? 24 + side * 6 : d.name === 'plaza' ? side * 17 : d.name === 'bridge' ? -20 + side * 2.7 : -20 + side * 8;
    const z = clamp(p.homeZ + 1, d.z - d.d / 2, d.z + d.d / 2);
    if (!blocked(x, z, .25, p) && !fireAt(x, z, .4) && !rescueWorkingArea(x, z)) return { x, z };
    // A lack of a local safe prop is not a reason to return into the fire.
    return { x: p.x, z: p.z };
  }
  const bridgeResidents = people.filter(p => p.district?.name === 'bridge');
  const community = { x: -21.3, z: -177, speed: 0, distance: 0, releasedAt: null, cleared: false, carriers: bridgeResidents.slice(0, 2), waiters: bridgeResidents.slice(2, 5) };
  community.carriers.forEach((p, i) => { p.communityRole = 'carrier'; p.carrierSide = i ? 1 : -1; p.x = p.homeX = -21.3 + p.carrierSide * .73; p.z = p.homeZ = -177; p.yaw = Math.PI; p.bag = false; });
  community.waiters.forEach((p, i) => { p.communityRole = 'waiter'; p.queueIndex = i; p.x = p.homeX = -20.7 + (i % 2) * 1.2; p.z = p.homeZ = -174.8 + Math.floor(i / 2) * 1.2; p.yaw = Math.PI; });
  const stretcher = new THREE.Group(); stretcher.name = 'Two residents carry a blanket through the opened lane'; root.add(stretcher);
  const stretcherWood = new THREE.MeshStandardMaterial({ color: 0x785e40, roughness: .94 }), stretcherCloth = new THREE.MeshStandardMaterial({ color: 0xa79b83, map: fabric, roughness: 1 });
  function stretcherPart(geometry, material, x, y, z) { const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; m.userData.ownedGeometry = true; stretcher.add(m); return m; }
  stretcherPart(new THREE.BoxGeometry(1.04, .075, 1.65), stretcherCloth, 0, .88, 0);
  for (const x of [-.51, .51]) { const pole = stretcherPart(new THREE.CylinderGeometry(.035, .035, 2.2, 8), stretcherWood, x, .89, 0); pole.rotation.x = Math.PI / 2; }
  const folded = stretcherPart(new THREE.CylinderGeometry(.16, .16, .86, 12), stretcherCloth, 0, 1.02, -.3); folded.rotation.z = Math.PI / 2;
  let activeQuality = null, activeIds = new Set();
  function selectActive() {
    if (activeQuality === quality) return;
    activeQuality = quality; const cap = quality === 'low' ? 70 : quality === 'high' ? 120 : 95;
    const required = people.filter(p => p.hero || p.communityRole || p.plazaRole), rest = people.filter(p => !p.hero && !p.communityRole && !p.plazaRole).sort((a, b) => (a.i * 47) % 117 - (b.i * 47) % 117);
    activeIds = new Set([...required, ...rest].slice(0, cap).map(p => p.i));
  }
  function updateCommunity(dt, t, state, player) {
    const clock = Number.isFinite(state.time) ? state.time : t;
    if (state.bridgeHelped && community.releasedAt === null) community.releasedAt = clock;
    const moving = community.releasedAt !== null && clock > community.releasedAt + .4;
    community.cleared = moving;
    if (moving && !state.paused) {
      const tx = community.z > -198 ? -21.3 : -23, tz = community.z > -198 ? -199 : -224;
      const dx = tx - community.x, dz = tz - community.z, d = Math.hypot(dx, dz), step = Math.min(d, dt * 1.7);
      if (d > .25 && !blocked(community.x + dx / d * step, community.z + dz / d * step, .88)) { community.x += dx / d * step; community.z += dz / d * step; community.distance += step; community.speed = step / Math.max(.001, dt); }
      else community.speed = 0;
    } else community.speed = 0;
    stretcher.position.set(community.x, 0, community.z); stretcher.visible = Math.hypot(community.x - player.x, community.z - player.z) < (quality === 'low' ? 72 : 105);
    for (const p of community.carriers) { p.x = community.x + p.carrierSide * .73; p.z = community.z; p.yaw = Math.PI; p.mode = 'carry'; p.speed = community.speed; p.distance = community.distance; p.gait = (community.distance / 1.04 + .2) % 1; }
    stats.community = { waiting: !moving, carriers: 2, queuedResidents: 3, travelledMetres: +community.distance.toFixed(2) };
  }
  function moveCommunityWaiter(p, dt, t, state, player) {
    const clock = Number.isFinite(state.time) ? state.time : t;
    if (!state.bridgeHelped || community.releasedAt === null || clock < community.releasedAt + .8 + p.queueIndex * .4) { p.speed = 0; p.mode = 'wait'; p.yaw = Math.PI; return; }
    const tx = p.z > -198 ? -21.3 + (p.queueIndex - 1) * .35 : -25 + p.queueIndex * .8, tz = p.z > -198 ? -199 : -224;
    p.mode = p.z < -222 ? 'wait' : 'walk'; walk(p, tx, tz, p.z < -222 ? 0 : 1.7, dt, player);
  }
  function snapshot() {
    const saved = { version: 1, phase: previousPhase, heroes: {}, community: { x: community.x, z: community.z, distance: community.distance, released: community.cleared } };
    for (const [key, p] of Object.entries(heroes)) saved.heroes[key] = {
      x: p.x, z: p.z, yaw: p.yaw, routeIndex: p.routeIndex, gait: ((p.gait % 1) + 1) % 1,
      trapLatched: key === 'adi' && !!p.trapLatched,
      trapAnchor: key === 'adi' && p.trapLatched && validTrapAnchor(p.trapAnchor) ? { x: p.trapAnchor.x, z: p.trapAnchor.z } : null,
      helpRise: Number.isFinite(p.helpRise) ? clamp(p.helpRise, 0, 1) : 0
    };
    return saved;
  }
  function validTrapAnchor(anchor) {
    return anchor && [anchor.x, anchor.z].every(Number.isFinite) && Math.hypot(anchor.x - 24.6, anchor.z + 93) < .55;
  }
  function restore(data, state = {}, player = { x: 0, z: 12 }) {
    // Caller invokes this once at boot/Continue, after world.update restores
    // the dynamic rack/cart colliders. No normal frame calls this method.
    current = state; previousPhase = clamp(Math.trunc(state.phase || 0), 0, 7); departureStartedAt = Number.isFinite(state.learnedAt) && state.learnedAt >= 0 ? state.learnedAt : null;
    if (Array.isArray(state.colliders)) colliders = state.colliders;
    const result = { restored: [], fallback: [] }, samePhase = data?.version === 1 && data.phase === previousPhase && data.heroes && typeof data.heroes === 'object';
    for (const [key, p] of Object.entries(heroes)) {
      const raw = samePhase ? data.heroes[key] : null;
      const valid = raw && [raw.x, raw.z, raw.yaw, raw.gait].every(Number.isFinite) && raw.x > -64 && raw.x < 64 && raw.z > -244 && raw.z < 29 && Number.isInteger(raw.routeIndex) && raw.routeIndex >= 1 && raw.routeIndex < route.length && raw.gait >= 0 && raw.gait <= 1 && !blocked(raw.x, raw.z, .19, p);
      let point;
      if (valid) { point = raw; result.restored.push(key); }
      else {
        if (previousPhase === 0) point = { x: p.homeX, z: p.homeZ, routeIndex: key === 'wiryo' ? 10 : 1, yaw: key === 'sari' ? -.3217505544 : Math.PI };
        else if (key === 'wiryo') point = state.bridgeHelped && previousPhase >= 6 ? { x: -24.5, z: -226, routeIndex: 12, yaw: 0 } : { x: -23.2 + clamp(state.bridgeProgress || 0, 0, 1) * 3.2, z: -181.5, routeIndex: 10, yaw: Math.PI / 2 };
        else if (previousPhase === 3 && !state.helped) {
          const crawl = clamp((state.helpProgress || 0) / .65, 0, 1);
          point = key === 'adi' ? { x: 24.65 - 1.05 * crawl, z: -92.73 + .28 * crawl, routeIndex: 5, yaw: Math.PI * .8 } : { x: 24.2, z: -92.22, routeIndex: 5, yaw: 2.4 };
        } else if (previousPhase >= 7) point = key === 'sari' ? { x: -20.6, z: -228.5, routeIndex: 12, yaw: 0 } : { x: -19.5, z: -228.3, routeIndex: 12, yaw: 0 };
        else {
          const bands = [[0, 1], [0, 3], [1, 5], [3, 5], [5, 10], [9, 11], [11, 12]], band = bands[previousPhase] || [0, 12];
          const projected = projectRoute(player, band[0], band[1]); point = sampleRoute(projected.along + (key === 'adi' ? 3.2 : 2.1));
          if (point.routeIndex >= 10 && point.routeIndex <= 11) point.x = -23.3;
          else point.x += key === 'sari' ? -.65 : .6;
          point.yaw = player.yaw || 0;
        }
        if (blocked(point.x, point.z, .22, p)) {
          let safe = null;
          for (const [dx, dz] of [[-.4, 0], [.4, 0], [0, .8], [0, -.8], [-.8, .8], [.8, .8], [0, 1.6], [0, -1.6]]) if (!blocked(point.x + dx, point.z + dz, .22, p)) { safe = { ...point, x: point.x + dx, z: point.z + dz }; break; }
          if (safe) point = safe;
        }
        result.fallback.push(key);
      }
      p.x = point.x; p.z = point.z; p.yaw = angle(point.yaw || 0); p.routeIndex = point.routeIndex;
      // Repair an older late-companion snapshot on the north riverbank by
      // resuming at the bridge approach. Preserve her exact saved position.
      if (previousPhase >= 6 && p.routeIndex < 10 && p.z < -170 && p.z > -177) p.routeIndex = 10;
      p.gait = point.gait || 0; p.speed = 0;
      p.trapLatched = false; p.trapAnchor = null; p.helpRise = 0; p.mode = 'wait';
      if (key === 'adi' && previousPhase === 3 && !state.helped) {
        const progress = clamp(Number(state.helpProgress) || 0, 0, 1), crawl = clamp(progress / .65, 0, 1);
        const derivedAnchor = { x: p.x + 1.05 * crawl, z: p.z - .28 * crawl };
        const savedAnchor = valid && raw.trapLatched === true && validTrapAnchor(raw.trapAnchor) ? raw.trapAnchor : null;
        const savedAnchorMatches = savedAnchor && Math.hypot(p.x - (savedAnchor.x - 1.05 * crawl), p.z - (savedAnchor.z + .28 * crawl)) < .25;
        // A phase alone does not mean this child has reached the frame. In
        // particular, a valid approaching save must continue its visible walk.
        const anchor = savedAnchorMatches ? savedAnchor : validTrapAnchor(derivedAnchor) ? derivedAnchor : null;
        if (anchor) {
          p.trapLatched = true; p.trapAnchor = { x: anchor.x, z: anchor.z };
          const expectedRise = clamp((progress - .35) / .65, 0, 1);
          p.helpRise = valid && Number.isFinite(raw.helpRise) && raw.helpRise >= 0 && raw.helpRise <= 1 && Math.abs(raw.helpRise - expectedRise) < .03 ? raw.helpRise : expectedRise;
          p.mode = 'trapped';
        }
      }
    }
    if (state.bridgeHelped) {
      const q = data?.community, validQueue = q && [q.x, q.z, q.distance].every(Number.isFinite) && q.x > -24 && q.x < -19.5 && q.z >= -226 && q.z <= -174 && q.distance >= 0 && q.distance < 100;
      if (validQueue) { community.x = q.x; community.z = q.z; community.distance = q.distance; }
      else { const projected = projectRoute(player, 10, 12); community.x = -21.3; community.z = Math.max(-224, Math.min(-177, projected.z + 4)); community.distance = Math.abs(community.z + 177); }
      community.releasedAt = (state.time || 0) - 1;
    } else { community.x = -21.3; community.z = -177; community.releasedAt = null; community.distance = 0; }
    return result;
  }

  async function loadHeroModels() {
    if (typeof window === 'undefined' || typeof document.createElementNS !== 'function') { modelStats.skipped = 'Non-browser runtime'; return modelStats; }
    modelStats.loading = true;
    try {
      const [{ GLTFLoader }, { clone }] = await Promise.all([import('../lib/addons/loaders/GLTFLoader.js'), import('../lib/addons/utils/SkeletonUtils.js')]);
      const loader = new GLTFLoader();
      const loaded = await Promise.allSettled([loader.loadAsync(new URL('../assets/sari.glb', import.meta.url).href), loader.loadAsync(new URL('../assets/characters.glb', import.meta.url).href)]);
      for (const [key, p] of Object.entries(heroes)) {
        const source = loaded[key === 'sari' ? 0 : 1];
        if (disposed) break;
        if (source.status !== 'fulfilled') { modelStats.failed++; modelStats.errors.push(`${key}: ${source.reason?.message || 'Model unavailable'}`); continue; }
        try { attachHero(p, source.value, clone); modelStats.loaded++; } catch (error) { modelStats.failed++; modelStats.errors.push(`${key}: ${error.message}`); }
      }
    } catch (error) { modelStats.failed = 3; modelStats.errors.push(error.message); }
    modelStats.loading = false; stats.heroModels = modelStats.loaded; return modelStats;
  }
  function attachHero(p, data, clone) {
    const object = clone(data.scene), wrapper = new THREE.Group(), bones = {}, seatGarments = [];
    wrapper.name = `Anatomical ${p.hero}`; wrapper.visible = false; wrapper.add(object); root.add(wrapper);
    object.traverse(o => {
      if (o.isBone) bones[o.userData?.name || o.name] = o;
      if (o.isMesh) {
        const materials = Array.isArray(o.material) ? o.material : [o.material];
        const copied = materials.map(m => { const c = m.clone(); if (c.name === 'CIVILIAN_SHIRT') c.color.setHex(p.shirt); c.roughness = Math.max(.65, c.roughness || .85); return c; });
        o.material = Array.isArray(o.material) ? copied : copied[0]; o.userData.ownedMaterial = true; o.castShadow = true; o.receiveShadow = true;
        if (p.hero === 'sari' && o.isSkinnedMesh && copied.some(m => m.name === 'CIVILIAN_TROUSERS')) {
          // The original garment is rigidly hip-weighted. Clone it locally;
          // seated-only weights let it fold over the posed knees, not the floor.
          o.geometry = o.geometry.clone(); o.userData.ownedGeometry = true;
          const index = name => o.skeleton.bones.findIndex(b => b.name.replaceAll('.', '') === name.replaceAll('.', ''));
          seatGarments.push({ mesh: o, hip: index('hips'), L: [index('thigh.L'), index('shin.L')], R: [index('thigh.R'), index('shin.R')], amount: -1, indices: o.geometry.attributes.skinIndex.array.slice(), weights: o.geometry.attributes.skinWeight.array.slice() });
        }

      }
    });
    const bone = name => bones[name] || bones[name.replaceAll('.', '')];
    const box = new THREE.Box3().setFromObject(object, true), size = box.getSize(new THREE.Vector3());
    if (!Number.isFinite(size.y) || size.y < .5 || !bone('hand.R') || !bone('thigh.L')) throw Error('Hero rig is incomplete');
    const wantedHeight = p.hero === 'adi' ? 1.15 : p.hero === 'sari' ? 1.65 : 1.77, scale = wantedHeight / size.y;
    wrapper.scale.set(scale * p.wide, scale, scale); wrapper.position.set(p.x, -box.min.y * scale, p.z); wrapper.rotation.y = p.yaw; wrapper.updateMatrixWorld(true);
    if (p.hero === 'adi' && bone('head')) bone('head').scale.multiplyScalar(1.12);
    const mixer = new THREE.AnimationMixer(object), actions = Object.fromEntries(data.animations.map(clip => [clip.name, mixer.clipAction(clip)]));
    const model = { wrapper, object, bones, bone, mixer, actions, current: null, scale, baseY: -box.min.y * scale, groundCorrection: 0, hipsRest: bone('hips').position.clone(), headRest: bone('head').quaternion.clone(), seatAmount: 0, seatGarments, footBase: {}, footOrient: {}, tool: null, bundle: null };
    for (const side of ['L', 'R']) {
      const foot = bone(`foot.${side}`); if (!foot) continue;
      model.footBase[side] = wrapper.worldToLocal(foot.getWorldPosition(new THREE.Vector3()));
      model.footOrient[side] = wrapper.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(foot.getWorldQuaternion(new THREE.Quaternion()));
    }
    const shadowMesh = new THREE.Mesh(shadow.clone(), shadowMat); shadowMesh.scale.set(.72 / scale, 1, .68 / scale); shadowMesh.position.y = box.min.y + .018 / scale; shadowMesh.userData.ownedGeometry = true; wrapper.add(shadowMesh);
    if (p.hero === 'wiryo') {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(.107, .115, .105, 12), new THREE.MeshStandardMaterial({ color: 0x252c27, roughness: .95 }));
      cap.position.set(0, .19, -.02); cap.userData.ownedGeometry = cap.userData.ownedMaterial = true; bone('head')?.add(cap);
    } else if (p.hero === 'adi') {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshStandardMaterial({ color: 0x292a23, roughness: .93 }));
      hair.scale.set(.102, .062, .095); hair.position.set(0, .175, -.025); hair.userData.ownedGeometry = hair.userData.ownedMaterial = true; bone('head')?.add(hair);
    }
    if (p.hero === 'sari') {
      model.tool = new THREE.Group(); model.tool.name = 'Canting carried in Sari right hand';
      const wood = new THREE.MeshStandardMaterial({ color: 0x815b35, roughness: .85 }), brass = new THREE.MeshStandardMaterial({ color: 0xd0a965, metalness: .55, roughness: .4 });
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(.009, .012, .15, 9), wood); handle.rotation.x = Math.PI / 2; handle.position.z = -.015;
      const cup = new THREE.Mesh(new THREE.SphereGeometry(.024, 12, 8), brass); cup.scale.y = .7; cup.position.set(0, 0, .076);
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(.004, .007, .055, 8), brass); spout.rotation.x = Math.PI / 2 + .25; spout.position.set(.014, -.009, .111);
      for (const mesh of [handle, cup, spout]) { mesh.castShadow = true; mesh.userData.ownedGeometry = mesh.userData.ownedMaterial = true; model.tool.add(mesh); }
      model.tool.position.set(.008, .045, .018); bone('hand.R').add(model.tool);
      model.bundle = new THREE.Group(); const roll = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .43, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, map: scene.userData.jejakaTextileTexture || fabric, roughness: 1 }));
      roll.rotation.z = Math.PI / 2; roll.userData.ownedGeometry = roll.userData.ownedMaterial = true; roll.castShadow = true; model.bundle.add(roll); model.bundle.position.set(0, .04, .035); bone('hand.L').add(model.bundle);
    }
    p.model = model; heroModels.set(p.hero, model); setHeroClip(model, 'Idle');
  }
  function setHeroClip(model, name, speed = 1) {
    if (!model.actions[name]) name = 'Idle';
    if (model.current !== name) {
      const previous = model.actions[model.current], next = model.actions[name];
      next.reset().setEffectiveWeight(1).setEffectiveTimeScale(speed).play(); if (previous) { next.crossFadeFrom(previous, .22, false); } else next.fadeIn(.15);
      model.current = name;
    }
    model.actions[name]?.setEffectiveTimeScale(speed);
  }
  function aimBone(bone, child, target) {
    if (!bone || !child) return;
    bone.updateWorldMatrix(true, true);
    const origin = bone.getWorldPosition(new THREE.Vector3()), currentDir = child.getWorldPosition(new THREE.Vector3()).sub(origin).normalize(), wantedDir = target.clone().sub(origin).normalize();
    const delta = new THREE.Quaternion().setFromUnitVectors(currentDir, wantedDir), worldQ = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
    const parentQ = bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert(); bone.quaternion.copy(parentQ.multiply(worldQ)); bone.updateWorldMatrix(false, true);
  }
  function chainIK(model, firstName, middleName, lastName, target, poleDirection) {
    const first = model.bone(firstName), middle = model.bone(middleName), last = model.bone(lastName); if (!first || !middle || !last) return;
    model.wrapper.updateMatrixWorld(true);
    const start = first.getWorldPosition(new THREE.Vector3()), elbow = middle.getWorldPosition(new THREE.Vector3()), end = last.getWorldPosition(new THREE.Vector3());
    const l1 = start.distanceTo(elbow), l2 = elbow.distanceTo(end), direction = target.clone().sub(start), originalD = direction.length();
    if (originalD < .001 || l1 < .001 || l2 < .001) return;
    direction.normalize(); const d = clamp(originalD, Math.abs(l1 - l2) + .003, (l1 + l2) * .98), reached = start.clone().addScaledVector(direction, d);
    const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d), height = Math.sqrt(Math.max(.00001, l1 * l1 - along * along));
    const pole = poleDirection.clone().addScaledVector(direction, -poleDirection.dot(direction)); if (pole.lengthSq() < .001) pole.set(0, 0, 1); pole.normalize();
    const joint = start.clone().addScaledVector(direction, along).addScaledVector(pole, height);
    aimBone(first, middle, joint); aimBone(middle, last, reached);
  }
  function localTarget(model, x, y, z) { return model.wrapper.localToWorld(new THREE.Vector3(x, y, z)); }
  function poseKneel(model, p, amount, footForward = .1) {
    const hips = model.bone('hips'); if (!hips) return;
    hips.position.y = model.hipsRest.y - amount; model.wrapper.updateMatrixWorld(true);
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(up, p.yaw);
    for (const side of ['L', 'R']) {
      const base = model.footBase[side]; if (!base) continue;
      const target = model.wrapper.localToWorld(base.clone().add(new THREE.Vector3(0, 0, side === 'R' ? footForward : -.05)));
      chainIK(model, `thigh.${side}`, `shin.${side}`, `foot.${side}`, target, forward);
      const foot = model.bone(`foot.${side}`), wantedWorld = model.wrapper.getWorldQuaternion(new THREE.Quaternion()).multiply(model.footOrient[side]);
      foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(wantedWorld));
    }
  }
  function poseSeatedGarments(model, amount) {
    for (const g of model.seatGarments) {
      if (Math.abs(g.amount - amount) < .0001) continue;
      const { position, skinIndex, skinWeight } = g.mesh.geometry.attributes;
      if (amount === 0) { skinIndex.array.set(g.indices); skinWeight.array.set(g.weights); }
      else for (let i = 0; i < position.count; i++) {
        const hip = clamp((position.getY(i) - .79) / .08, 0, 1), shin = clamp((.55 - position.getY(i)) / .12, 0, 1);
        const leg = position.getX(i) < 0 ? g.L : g.R, weights = new Map();
        const addWeight = (bone, weight) => weights.set(bone, (weights.get(bone) || 0) + weight);
        for (let j = 0; j < 4; j++) addWeight(g.indices[i * 4 + j], g.weights[i * 4 + j] * (1 - amount));
        addWeight(g.hip, amount * hip); addWeight(leg[0], amount * (1 - hip) * (1 - shin)); addWeight(leg[1], amount * (1 - hip) * shin);
        const chosen = [...weights].sort((a, b) => b[1] - a[1]).slice(0, 4); while (chosen.length < 4) chosen.push([0, 0]);
        const total = chosen.reduce((sum, w) => sum + w[1], 0) || 1;
        skinIndex.setXYZW(i, ...chosen.map(w => w[0])); skinWeight.setXYZW(i, ...chosen.map(w => w[1] / total));
      }
      skinIndex.needsUpdate = skinWeight.needsUpdate = true; g.amount = amount;
    }
  }
  function poseSeated(model, p, amount) {
    // The bench top is .52m. Move the rendered hips onto it while the route
    // anchor remains unchanged. Adult soles stay grounded; the child's shorter
    // legs hang naturally, clear of the street rather than stretching to it.
    const hips = model.bone('hips'); if (!hips || amount <= 0) return;
    const startFeet = Object.fromEntries(['L', 'R'].map(side => [side, model.wrapper.localToWorld(model.footBase[side].clone())]));
    const seatY = p.hero === 'adi' ? .57 : .61;
    model.wrapper.position.z += (-229.0 - model.wrapper.position.z) * amount;
    model.wrapper.rotation.y = p.yaw * (1 - amount);
    model.wrapper.updateMatrixWorld(true);
    const standingHips = hips.getWorldPosition(new THREE.Vector3());
    const seatedHips = standingHips.clone(); seatedHips.y += (seatY - seatedHips.y) * amount;
    hips.position.copy(hips.parent.worldToLocal(seatedHips));
    model.wrapper.updateMatrixWorld(true);
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(model.wrapper.quaternion);
    for (const side of ['L', 'R']) {
      const target = startFeet[side], seated = new THREE.Vector3(p.x + (side === 'L' ? -.12 : .12) * model.scale * p.wide, target.y + (p.hero === 'adi' ? .105 : 0), p.hero === 'adi' ? -228.70 : -228.42);
      target.lerp(seated, amount);
      chainIK(model, `thigh.${side}`, `shin.${side}`, `foot.${side}`, target, forward);
      const foot = model.bone(`foot.${side}`), wantedWorld = model.wrapper.getWorldQuaternion(new THREE.Quaternion()).multiply(model.footOrient[side]);
      foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(wantedWorld));
    }
    model.wrapper.updateMatrixWorld(true);
  }
  function poseArm(model, p, side, target) {
    const outward = new THREE.Vector3(side === 'L' ? -1 : 1, -.25, .2).applyAxisAngle(up, model.wrapper.rotation.y);
    chainIK(model, `upper_arm.${side}`, `forearm.${side}`, `hand.${side}`, target, outward);
  }
  function orientPropAtHand(model, side, prop, yaw, pitch = 0) {
    if (!prop) return; const hand = model.bone(`hand.${side}`); hand.updateWorldMatrix(true, false);
    const desired = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0)); prop.parent.updateWorldMatrix(true, false); prop.quaternion.copy(prop.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(desired));
  }
  function drawHeroModel(p, dt, t, state, player) {
    const model = p.model; if (!model) return;
    model.wrapper.visible = true; if (state.paused && model.hasRendered) return; model.wrapper.position.set(p.x, model.baseY, p.z); model.wrapper.rotation.y = p.yaw;
    if ((model.seatAmount > 0 && state.phase < 6) || (model.recoveryPose && state.phase < 4)) {
      // A replay may retain the Idle clip. Restore its base bindings before
      // leaving the authored seated offsets, even when clip values are cached.
      model.mixer.stopAllAction(); model.current = null; model.seatAmount = 0; model.groundCorrection = 0; model.recoveryPose = false;
    }
    const speed = p.speed || 0, crouch = ['duck', 'help', 'trapped'].includes(p.mode), clip = crouch ? 'Crouch' : state.phase === 0 && state.learned && speed > .18 ? 'Walk' : speed > 2.2 ? 'Run' : speed > .18 ? 'Walk' : 'Idle';
    const rate = clip === 'Run' ? clamp(speed / 3.4, .85, 2.25) : clip === 'Walk' ? clamp(speed / 1.15, .55, 1.8) : 1;
    setHeroClip(model, clip, rate); if (!state.paused) model.mixer.update(dt);
    model.wrapper.updateMatrixWorld(true);
    const sitting = (p.hero === 'sari' || p.hero === 'adi') && state.phase >= 6 && p.mode === 'rest';
    if (state.phase < 6) model.seatAmount = 0;
    else model.seatAmount = clamp(model.seatAmount + (sitting ? 1 : -1) * dt / .85, 0, 1);
    poseSeated(model, p, model.seatAmount);
    const garmentFold = p.hero === 'sari' && p.mode === 'help' ? 1 : p.hero === 'sari' && p.mode === 'steady' ? 1 : model.seatAmount;
    poseSeatedGarments(model, garmentFold);
    if (p.hero === 'sari' && state.phase === 0 && !state.learned) {
      const stroke = Math.sin(t * 1.65) * .035;
      poseArm(model, p, 'R', new THREE.Vector3(-4.45 + stroke * .5, 1.12, 3.05 - stroke * .866));
      poseArm(model, p, 'L', new THREE.Vector3(-4.4, 1.12, 2.96));
      model.bundle.visible = false; orientPropAtHand(model, 'R', model.tool, p.yaw, -.08);
    } else if (p.hero === 'sari' && p.mode === 'packing') {
      const fold = Math.sin(clamp(p.packingTime || 0, 0, 1.5) / 1.5 * Math.PI) * .035;
      poseArm(model, p, 'L', localTarget(model, -.08, 1.08 + fold, .3)); poseArm(model, p, 'R', localTarget(model, .14, 1.07 + fold, .29));
      model.bundle.visible = true; orientPropAtHand(model, 'R', model.tool, p.yaw, -.35); orientPropAtHand(model, 'L', model.bundle, p.yaw);
    } else if (p.hero === 'sari' && p.mode === 'help') {
      poseKneel(model, p, .52, .14);
      const child = heroes.adi, grip = new THREE.Vector3(p.x * .42 + child.x * .58, .62 + (child.helpRise || 0) * .22, p.z * .42 + child.z * .58);
      poseArm(model, p, 'L', grip); poseArm(model, p, 'R', localTarget(model, .16, .7, .28));
      if (model.bundle.parent !== model.bone('forearm.L')) model.bone('forearm.L').add(model.bundle); model.bundle.position.set(-.02, .07, -.055);
      model.bundle.visible = true; orientPropAtHand(model, 'R', model.tool, p.yaw, -.5); orientPropAtHand(model, 'L', model.bundle, p.yaw);
    } else if (p.hero === 'sari' && p.mode === 'steady') {
      const rise = p.recoveryRise || 0, stow = clamp((rise - .55) / .45, 0, 1);
      poseKneel(model, p, .52 * (1 - rise), .14 * (1 - rise));
      const child = heroes.adi, grip = new THREE.Vector3(p.x * .42 + child.x * .58, .84, p.z * .42 + child.z * .58);
      poseArm(model, p, 'L', grip.lerp(localTarget(model, -.12, 1.03, .28), stow));
      poseArm(model, p, 'R', localTarget(model, .16 + .08 * rise, .7 + .24 * rise, .28 - .12 * rise));
      if (model.bundle.parent !== model.bone('forearm.L')) model.bone('forearm.L').add(model.bundle); model.bundle.position.set(-.02, .07, -.055);
      model.bundle.visible = true; orientPropAtHand(model, 'R', model.tool, p.yaw, -.5); orientPropAtHand(model, 'L', model.bundle, p.yaw);
    } else if (p.hero === 'sari') {
      if (model.bundle.parent !== model.bone('hand.L')) model.bone('hand.L').add(model.bundle); model.bundle.position.set(0, .04, .035);
      poseArm(model, p, 'L', localTarget(model, -.12, 1.03 - .25 * model.seatAmount, .28));
      if (speed < .3 || p.mode === 'rest') poseArm(model, p, 'R', localTarget(model, .24, .94 - .24 * model.seatAmount, .16));
      model.bundle.visible = true; orientPropAtHand(model, 'R', model.tool, p.yaw, -.48); orientPropAtHand(model, 'L', model.bundle, p.yaw);
    } else if (p.hero === 'adi' && p.mode === 'recover') {
      // The Idle clip supplies quiet breathing while the child regains balance.
      const head = model.bone('head'); head?.quaternion.copy(model.headRest);
    } else if (p.hero === 'adi' && p.mode === 'trapped') {
      const rise = p.helpRise || 0; poseKneel(model, p, .52 * (1 - rise), .28 * (1 - rise));
      const sari = heroes.sari, grip = new THREE.Vector3(sari.x * .42 + p.x * .58, .62 + rise * .22, sari.z * .42 + p.z * .58);
      if (Math.hypot(sari.x - p.x, sari.z - p.z) < 1.2) poseArm(model, p, 'L', grip);
      poseArm(model, p, 'R', localTarget(model, .12, .39 + rise * .55, .2));
    } else if (p.hero === 'wiryo' && p.mode === 'push') {
      const spine = model.bone('spine'); spine?.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), .4));
      model.bone('hips').position.z += .07; model.wrapper.updateMatrixWorld(true);
      const edge = -22.6 + clamp(state.bridgeProgress || 0, 0, 1) * 3.2;
      poseArm(model, p, 'L', new THREE.Vector3(edge, 1.1, -181.28)); poseArm(model, p, 'R', new THREE.Vector3(edge, 1.1, -181.72));
    } else if (p.hero === 'adi' && p.mode === 'rest') {
      const head = model.bone('head'); head?.quaternion.copy(model.headRest).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (-.25 + Math.sin(t * .5) * .05) * model.seatAmount));
      poseArm(model, p, 'L', localTarget(model, -.13, .85, .19)); poseArm(model, p, 'R', localTarget(model, .13, .85, .19));
    }
    if (sitting && p.hero === 'sari') {
      const head = model.bone('head'), glance = clamp(Math.atan2(player.x - p.x, player.z - p.z), -.5, .5) * model.seatAmount;
      head?.quaternion.copy(model.headRest).multiply(new THREE.Quaternion().setFromAxisAngle(up, glance));
    }
    // Keep the lowest supporting sole on the ground after the authored clips.
    // This is a modest correction, not a claim of captured motion or solved gait.
    model.wrapper.updateMatrixWorld(true);
    const feet = ['L', 'R'].map(side => ({ bone: model.bone(`foot.${side}`), rest: model.footBase[side] })).filter(x => x.bone && x.rest);
    if (feet.length) {
      const error = Math.min(...feet.map(x => x.bone.getWorldPosition(new THREE.Vector3()).y - x.rest.y * model.scale - (p.hero === 'adi' ? .105 * model.seatAmount : p.hero === 'sari' ? .002 * model.seatAmount : 0)));
      model.groundCorrection += (clamp(-error, -.14, .14) - model.groundCorrection) * Math.min(1, dt * 18);
      model.wrapper.position.y += model.groundCorrection; model.wrapper.updateMatrixWorld(true);
    }
    model.recoveryPose = p.mode === 'recover' || p.mode === 'steady';
    model.hasRendered = true;
  }

  const ready = loadHeroModels();
  return { root, people, heroes, stats, modelStats, ready, update, reset, route, snapshot, restore,
    setQuality(value) { quality = ['low', 'balanced', 'high'].includes(value) ? value : 'balanced'; },
    setColliders(value) { colliders = Array.isArray(value) ? value : []; },
    dispose() { disposed = true; stretcher.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); stretcherWood.dispose(); stretcherCloth.dispose(); for (const model of heroModels.values()) { model.mixer.stopAllAction(); model.mixer.uncacheRoot(model.object); model.wrapper.traverse(o => { if (o.userData?.ownedGeometry) o.geometry?.dispose(); if (o.userData?.ownedMaterial) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => m?.dispose()); } }); } scene.remove(root); for (const batch of Object.values(batches)) batch.mesh.geometry.dispose(); shirtMat.dispose(); skinMat.dispose(); clothMat.dispose(); darkMat.dispose(); shadowMat.dispose(); shadowTexture.dispose(); fabric.dispose(); }
  };
}
