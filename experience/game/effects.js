/** Original, fictional presentation effects. No weapon, unit, exact date or damaged landmark is inferred. */
export function createEffects(THREE, scene, { quality = 'balanced', reducedMotion = false } = {}) {
  const root = new THREE.Group(); root.name = 'Fictional event presentation'; scene.add(root);
  const resources = [];
  const random = (n) => { const a = Math.sin(n * 127.1 + 311.7) * 43758.5453; return a - Math.floor(a); };
  const smokeTexture = makeTexture(false), fireTexture = makeTexture(true);
  resources.push(smokeTexture, fireTexture);
  let tier = quality, comfort = reducedMotion, eventAge = -1, pos = { x: 7, z: -10 }, elapsed = 0;
  const fog = scene.fog;
  const capacity = 144, pastSources = [];
  const smoke = cards(capacity, smokeTexture, false), flame = cards(44, fireTexture, true);
  const smokePositions = smoke.geometry.attributes.aCenter.array, smokeSizes = smoke.geometry.attributes.aSize.array;
  const smokeAlpha = smoke.geometry.attributes.aAlpha.array, smokeRotation = smoke.geometry.attributes.aRotation.array;
  const flamePositions = flame.geometry.attributes.aCenter.array, flameSizes = flame.geometry.attributes.aSize.array;
  const flameAlpha = flame.geometry.attributes.aAlpha.array, flameRotation = flame.geometry.attributes.aRotation.array;
  const fogColor = fog?.color?.clone() || new THREE.Color('#777568');
  smoke.material.uniforms.fogColor.value.copy(fogColor); flame.material.uniforms.fogColor.value.copy(fogColor);
  const debrisGeometry = new THREE.DodecahedronGeometry(.11, 0);
  const debrisMaterial = new THREE.MeshStandardMaterial({ color: '#91816b', roughness: 1 });
  const fragments = new THREE.InstancedMesh(debrisGeometry, debrisMaterial, 42);
  fragments.frustumCulled = false; fragments.count = 0; root.add(fragments); resources.push(debrisGeometry, debrisMaterial);
  const transform = new THREE.Object3D();
  // Bounded fictional burning belongings at the return approach: the same
  // street remains visibly disrupted even after the first source is behind you.
  const aftermathSites=[{x:-7.2,z:-17.4},{x:7.1,z:3.5}];
  const burnedMaterial=new THREE.MeshStandardMaterial({color:0x30251c,roughness:1});
  const burned=new THREE.InstancedMesh(debrisGeometry,burnedMaterial,10);burned.count=0;burned.frustumCulled=false;root.add(burned);resources.push(burnedMaterial);
  for(let i=0;i<10;i++){const p=aftermathSites[i%2];transform.position.set(p.x+Math.sin(i*3)*.6,.12,p.z+Math.cos(i*5)*.5);transform.rotation.set(i*.4,i,.3);transform.scale.set(3.5,1,2);transform.updateMatrix();burned.setMatrixAt(i,transform.matrix);}
  burned.instanceMatrix.needsUpdate=true;
  const flash = new THREE.PointLight('#ffb64e', 0, 24, 2); root.add(flash);
  const warm = new THREE.PointLight('#ff812a', 0, 15, 2); root.add(warm);
  const scarMaterial = new THREE.MeshBasicMaterial({ map: smokeTexture, color: '#211e19', transparent: true, opacity: .44, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const scarGeometry = new THREE.PlaneGeometry(5, 5);
  const scar = new THREE.Mesh(scarGeometry, scarMaterial); scar.rotation.x = -Math.PI / 2; scar.visible = false; root.add(scar); resources.push(scarGeometry, scarMaterial);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#ffd18d', transparent: true, opacity: 0, depthWrite: false });
  const line = new THREE.Line(lineGeometry, lineMaterial); line.frustumCulled = false; root.add(line); resources.push(lineGeometry, lineMaterial);
  const plumes = [
    { x: -23, z: -66, y: 8, size: 5.2, tint: [0.36, .34, .30] },
    { x: 28, z: -78, y: 7, size: 7, tint: [.31, .31, .29] },
    { x: -35, z: -5, y: 8, size: 4.4, tint: [.39, .37, .32] },
    { x: 10, z: -110, y: 9, size: 8, tint: [.34, .32, .28] },
  ];
  const stats = { particles: 0, smoke: 0, debris: 0, event: 'distant', sources: 4 };

  function makeTexture(fire) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d'), pixels = ctx.createImageData(128, 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const u = (x - 64) / 64, v = (y - 64) / 64;
      let density = 0;
      if (fire) {
        const lift = (1 - y / 128), width = .10 + y / 128 * .48;
        const lean = Math.sin(lift * 8) * .12;
        density = Math.exp(-Math.pow((u - lean) / width, 2) * 2) * Math.pow(Math.sin(Math.PI * y / 128), .7);
      } else {
        for (let l = 0; l < 9; l++) {
          const cx = (random(l + 1) - .5) * .9, cy = (random(l + 26) - .5) * .9;
          const r = .24 + random(l + 43) * .35;
          density += Math.exp(-((u - cx) ** 2 + (v - cy) ** 2) / (r * r) * 2) * .31;
        }
        density *= Math.max(0, 1 - Math.pow(u * u + v * v, 2));
      }
      const i = (y * 128 + x) * 4;
      pixels.data[i] = 255; pixels.data[i + 1] = fire ? Math.floor(95 + y / 128 * 150) : 255;
      pixels.data[i + 2] = fire ? Math.floor(10 + y / 128 * 110) : 255;
      pixels.data[i + 3] = Math.min(255, density * 245);
    }
    ctx.putImageData(pixels, 0, 0);
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function cards(count, texture, additive) {
    const geometry = new THREE.InstancedBufferGeometry();
    const plane = new THREE.PlaneGeometry(1, 1);
    geometry.index = plane.index; geometry.attributes.position = plane.attributes.position; geometry.attributes.uv = plane.attributes.uv;
    geometry.setAttribute('aCenter', new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aSize', new THREE.InstancedBufferAttribute(new Float32Array(count * 2), 2));
    geometry.setAttribute('aAlpha', new THREE.InstancedBufferAttribute(new Float32Array(count), 1));
    geometry.setAttribute('aRotation', new THREE.InstancedBufferAttribute(new Float32Array(count), 1));
    geometry.setAttribute('aTint', new THREE.InstancedBufferAttribute(new Float32Array(count * 3).fill(1), 3));
    geometry.instanceCount = 0;
    const material = new THREE.ShaderMaterial({
      uniforms: { map: { value: texture }, fogColor: { value: new THREE.Color('#82786b') }, fogNear: { value: fog?.near || 24 }, fogFar: { value: fog?.far || 130 } },
      vertexShader: `attribute vec3 aCenter; attribute vec2 aSize; attribute float aAlpha; attribute float aRotation; attribute vec3 aTint;
        varying vec2 vUv; varying float vAlpha; varying vec3 vTint; varying float vDepth;
        void main(){ vUv=uv; vAlpha=aAlpha; vTint=aTint; vec4 p=modelViewMatrix*vec4(aCenter,1.0);
        vec2 q=position.xy*aSize; float s=sin(aRotation),c=cos(aRotation); p.xy+=vec2(q.x*c-q.y*s,q.x*s+q.y*c);vDepth=-p.z;gl_Position=projectionMatrix*p; }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar; varying vec2 vUv; varying float vAlpha; varying vec3 vTint; varying float vDepth;
        void main(){vec4 t=texture2D(map,vUv);float a=t.a*vAlpha; if(a<.008)discard;vec3 col=t.rgb*vTint;float f=smoothstep(fogNear,fogFar,vDepth);gl_FragColor=vec4(mix(col,fogColor,f*.78),a*(1.0-f*.4));}`,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material); mesh.frustumCulled = false; mesh.renderOrder = additive ? 4 : 3; root.add(mesh); resources.push(geometry, material); return mesh;
  }
  function put(mesh, i, x, y, z, sx, sy, alpha, rotation, tint) {
    const a = mesh.geometry.attributes;
    a.aCenter.array.set([x, y, z], i * 3); a.aSize.array.set([sx, sy], i * 2); a.aAlpha.array[i] = alpha; a.aRotation.array[i] = rotation;
    a.aTint.array.set(tint, i * 3);
  }
  function dirty(mesh, count) { mesh.geometry.instanceCount = count; for (const a of Object.values(mesh.geometry.attributes)) if (a.isInstancedBufferAttribute) a.needsUpdate = true; }
  function triggerImpact(at = { x: 7, z: -10 }) {
    if(eventAge>=0&&Math.hypot(pos.x-(at.x??7),pos.z-(at.z??-10))>2&&pastSources.length<2)pastSources.push({...pos});
    pos = { x: at.x ?? 7, z: at.z ?? -10 }; eventAge = 0;
    flash.position.set(pos.x, 2.8, pos.z); warm.position.set(pos.x, 1.8, pos.z);
    scar.position.set(pos.x, .025, pos.z); scar.visible = true;
  }
  // Restoring a checkpoint must render its persistent aftermath immediately,
  // without replaying the anticipation, flash or airborne fragments.
  function restoreImpact(at = { x: 7, z: -10 }, age = 20) {
    triggerImpact(at);
    eventAge = Number.isFinite(age) ? Math.max(0, age) : 20;
    update(0, elapsed, null, null);
  }
  function update(dt, time, state, player) {
    elapsed += Math.min(.1, Math.max(0, dt)); if (eventAge >= 0) eventAge += Math.min(.1, Math.max(0, dt));
    const t = elapsed, low = tier === 'low', high = tier === 'high';
    let n = 0, f = 0;
    const plumeCount = low ? 6 : high ? 13 : 10;
    plumes.forEach((p, j) => {
      for (let k = 0; k < plumeCount; k++) {
        const phase = ((t * .024 + k / plumeCount + random(j + 20) * .2) % 1);
        const rise = phase * (15 + j * 2), size = p.size * (.65 + phase * 1.5);
        const fade = Math.sin(phase * Math.PI) * (low ? .20 : .26);
        put(smoke, n++, p.x + phase * (4 + j) + Math.sin(k * 2.6 + t * .06) * .7, p.y + rise, p.z + Math.sin(k * 2) * 1.7, size, size * 1.14, fade, random(k + j * 30) * Math.PI + t * .006, p.tint);
      }
    });
    // Previous disruptions remain in the world when the next one starts.
    for(const p of pastSources){
      const count=low?5:9;
      for(let k=0;k<count;k++){
        const phase=(t*.06+k/count)%1;
        put(smoke,n++,p.x+phase*3,.8+phase*8,p.z,1.8+phase*3.7,2+phase*4,Math.sin(phase*Math.PI)*.26,k*.7,[.31,.28,.25]);
      }
      for(let k=0;k<(low?4:8);k++){
        const phase=(t*(comfort?.16:.36)+k*.27)%1;
        put(flame,f++,p.x+Math.sin(k)*.75,.4+phase*1.3,p.z+Math.cos(k)*.5,.35,1.2+phase,Math.sin(phase*Math.PI)*.65,k*.05,[1,.78,.45]);
      }
    }
    burned.count=state?.flags?.impact?10:0;
    if(state?.flags?.impact)for(const p of aftermathSites){
      const amount=low?4:6;
      for(let k=0;k<amount;k++){
        const phase=(t*.08+k/amount)%1;
        put(smoke,n++,p.x+phase*1.5,.6+phase*5,p.z,1+phase*2.8,1.5+phase*3,Math.sin(phase*Math.PI)*.38,k*.6,[.28,.26,.23]);
      }
      for(let k=0;k<4;k++){
        const phase=(t*(comfort?.16:.45)+k*.25)%1;
        put(flame,f++,p.x+Math.sin(k)*.45,.25+phase*.9,p.z+Math.cos(k)*.35,.48,1+phase,Math.sin(phase*Math.PI)*.85,k*.1,[1,.82,.5]);
      }
    }
    const age = eventAge;
    if (eventAge >= 0) {
      stats.event = age < 0 ? 'warning' : age < 4 ? 'impact' : 'aftermath';
      line.visible = !comfort && age >= 0 && age < .22;
      if (line.visible) {
        const v = Math.min(1, eventAge / .22), bx = 30 + (pos.x - 30) * v, by = 17 * (1 - v) + .6, bz = -55 + (pos.z + 55) * v;
        const a = line.geometry.attributes.position.array; a.set([bx + 1.6, by + 1.2, bz - 3, bx, by, bz]); line.geometry.attributes.position.needsUpdate = true; lineMaterial.opacity = .75;
      }
      if (age >= 0) {
        flash.intensity = comfort ? 0 : Math.max(0, 1 - age / .28) * 140;
        warm.intensity = 10 + Math.sin(t * 8) * 1.2;
        // Dust crosses the road; source visibility is not required for the cue.
        if(age<7)for(let k=0;k<(low?5:9);k++){
          const spread=Math.min(1,age/2.5),x=pos.x-(k+1)*spread*1.8;
          put(smoke,n++,x,.6+random(k+400)*1.3,pos.z+1.5+Math.sin(k)*1.3,1.5+spread*2.4,1+spread*1.4,Math.max(0,Math.sin(Math.min(1,age/7)*Math.PI))*.24,k*.15,[.55,.46,.35]);
        }
        const localCount = low ? 14 : high ? 36 : 27;
        for (let k = 0; k < localCount; k++) {
          const phase = ((t * .1 + k / localCount) % 1), isBurst = age < 6;
          let x, y, z, size, opacity;
          if (isBurst) {
            const angle = random(k + 5) * Math.PI * 2, travel = Math.min(age * .8, 4) * random(k + 52);
            x = pos.x + Math.cos(angle) * travel; z = pos.z + Math.sin(angle) * travel; y = .5 + random(k + 74) * Math.min(7, age * 2.7);
            size = .9 + Math.min(age, 4) * .5 + random(k + 120) * 1.2; opacity = Math.min(1, age * 3) * .26 * Math.max(.2, 1 - age / 9);
          } else {
            x = pos.x + phase * 2.8 + Math.sin(k) * .4; z = pos.z + Math.cos(k * 1.8) * .5; y = .9 + phase * 9;
            size = 1.7 + phase * 4; opacity = Math.sin(phase * Math.PI) * .24;
          }
          put(smoke, n++, x, y, z, size * 1.2, size, opacity, random(k + 180) * Math.PI + t * .008, [.36, .33, .28]);
        }
        const flames = low ? 9 : 19;
        for (let k = 0; k < flames; k++) {
          const v = random(k + 66), phase = ((t * (comfort ? .16 : .55) + random(k + 32)) % 1);
          put(flame, f++, pos.x + (v - .5) * 2, .35 + phase * 1.8, pos.z + (random(k + 29) - .5) * 1.3, .55 * (1 - phase * .5), 1.1 + phase * 1.6, Math.sin(phase * Math.PI) * .8 * Math.min(1, age), Math.sin(t + k) * .08, [1, .85, .6]);
        }
        const count = low ? 18 : 42; fragments.count = count;
        for (let k = 0; k < count; k++) {
          const speed = 1.2 + random(k + 13) * 4, angle = random(k + 143) * Math.PI * 2, vy = 2.2 + random(k + 200) * 4.8;
          const flight = Math.min(age, vy * 2 / 9.81), travel = comfort ? speed * vy * 2 / 9.81 : speed * flight;
          transform.position.set(pos.x + Math.cos(angle) * travel, comfort ? .07 : Math.max(.07, vy * flight - 4.905 * flight * flight), pos.z + Math.sin(angle) * travel);
          transform.rotation.set(flight * 2 + k, flight * 3, k); const s = .4 + random(k + 600) * 1.7; transform.scale.set(s, s * .5, s); transform.updateMatrix(); fragments.setMatrixAt(k, transform.matrix);
        }
        fragments.instanceMatrix.needsUpdate = true;
      }
    } else { flash.intensity = warm.intensity = 0; line.visible = false; fragments.count = 0; stats.event = 'distant'; }
    dirty(smoke, n); dirty(flame, f);
    stats.smoke = n; stats.debris = fragments.count; stats.particles = n + f + fragments.count;
  }
  function reset() { burned.count=0;pastSources.length=0;eventAge = -1; scar.visible = false; fragments.count = 0; flash.intensity = warm.intensity = 0; line.visible = false; }
  function dispose() { scene.remove(root); for (const r of resources) r.dispose?.(); }
  return { update, triggerImpact, restoreImpact, reset, dispose, stats, setQuality(q) { tier = ['low', 'balanced', 'high'].includes(q) ? q : 'balanced'; }, setReducedMotion(v) { comfort = !!v; } };
}
