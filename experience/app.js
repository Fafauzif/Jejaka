import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneActor } from "three/addons/utils/SkeletonUtils.js";
import { createWorld } from "./world.js";
import { Soundscape } from "./audio.js";
import { beats, storyMeta } from "./story.js";
import { frameDelta, briskTransition, travelSpeed } from "./pacing.js";
import { buildNotebookHTML } from "./notebook-export.js";
import {
  SAVE_KEY,
  newState,
  restore,
  record,
  persist,
  endingAccount,
} from "./state.js";
const $ = (id) => document.getElementById(id);
const sound = new Soundscape();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  57,
  innerWidth / innerHeight,
  0.08,
  1800,
);
let renderer,
  world,
  ready = false,
  mode = "cover",
  modal = null,
  previousFocus = null,
  state = newState(),
  saved = null;
let elapsed = 0,
  beatTime = 0,
  walking = false,
  heldWalk = false,
  travel = null,
  phase = 0,
  lookYaw = 0,
  lookPitch = 0,
  baseYaw = 0;
let english = true,
  reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches,
  volume = 0.55,
  pacing = "brisk",
  quality = "auto",
  framing = false,
  transition = null,
  dirty = true,
  autoLow = false,
  qualitySamples = [];
let dragging = false,
  pointer = null,
  toastTimer,
  arrivalTimer,
  writing = 0,
  lastFrame = performance.now(),
  lastDialogue = -1,
  pauseBeforeAbout = null,
  notebook;
const actors = [];
let actorLibrary,
  sariLibrary,
  stepDistance = 0,
  saveAvailable = true,
  contactTexture;
const testsEnabled = new URLSearchParams(location.search).has("test");
const clamp = THREE.MathUtils.clamp,
  lerp = THREE.MathUtils.lerp;
function show(id, yes = true) {
  if ($(id)) $(id).hidden = !yes;
  dirty = true;
}
function text(id, value) {
  if ($(id)) $(id).textContent = value || "";
  dirty = true;
}
function toast(message) {
  text("toast", message);
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 4000);
}
function save() {
  let storage;
  try {
    storage = localStorage;
  } catch {}
  saveAvailable = persist(storage, state);
  if (!saveAvailable)
    text(
      "pacing",
      "Penyimpanan tidak tersedia. Catatan tetap ada selama halaman ini terbuka.",
    );
}
function layoutDialogue() {
  if (!ready || !$("hud") || $("hud").hidden) return;
  const choosing = !$("choices").hidden && $("choices").children.length > 0;
  document.body.classList.toggle("has-choices", choosing);
  const r = $("interaction").getBoundingClientRect();
  const occupied = !$("interaction").hidden && r.height > 0 ? innerHeight - r.top + 18 : 0;
  $("dialogue").style.bottom = `${Math.max(innerWidth <= 700 ? 132 : 104, occupied)}px`;
}
function loadSettings() {
  try {
    const value = JSON.parse(localStorage.getItem("jejaka.settings.v2") || "null");
    if (!value) return;
    if (["brisk", "walk"].includes(value.pacing)) pacing = value.pacing;
    if (["auto", "high", "low"].includes(value.quality)) quality = value.quality;
    if (typeof value.english === "boolean") english = value.english;
    if (typeof value.reducedMotion === "boolean") reducedMotion = value.reducedMotion;
    if (Number.isFinite(value.volume)) volume = clamp(value.volume, 0, 1);
  } catch {}
}
function applyQuality() {
  if (!renderer) return;
  const effective = quality === "auto" ? (autoLow ? "low" : "balanced") : quality;
  const cap = effective === "high" ? 1.5 : effective === "low" ? 0.8 : 1;
  renderer.setPixelRatio(Math.min(devicePixelRatio, cap));
  renderer.shadowMap.enabled = effective !== "low";
  world?.setQuality?.(effective);
  dirty = true;
}
function settings() {
  document.body.classList.toggle("no-english", !english);
  document.body.classList.toggle("reduced-motion", reducedMotion);
  $("english").checked = $("intro-english").checked = english;
  $("motion").checked = $("intro-motion").checked = reducedMotion;
  sound.setVolume(volume);
  layoutDialogue();
  $("volume").value = volume;
  text("audio-toggle", volume > 0 ? "Suara aktif" : "Suara mati");
  $("audio-toggle").setAttribute(
    "aria-label",
    volume > 0 ? "Matikan suara" : "Aktifkan suara",
  );
  if ($("quality-select")) $("quality-select").value = quality;
  if ($("pacing-select")) $("pacing-select").value = pacing;
  try { localStorage.setItem("jejaka.settings.v2", JSON.stringify({ english, reducedMotion, volume, pacing, quality })); } catch {}
  dirty = true;
}
function setDialogue(speaker, id, en) {
  text("speaker", speaker);
  text("line", id);
  text("line-en", en);
  show("dialogue", !!id);
  layoutDialogue();
}
function setLook(target) {
  const pos = camera.position;
  baseYaw = Math.atan2(-(target[0] - pos.x), -(target[1] - pos.z));
}
function phaseFor(index) {
  return clamp((index - 3) / 6, 0, 1);
}
function retargetLegacyCrouch(data) {
  const clip = data.animations.find(c => c.name === "Crouch");
  const hips = clip?.tracks.find(t => t.name === "hips.position");
  if (!hips) return;
  const values = hips.values;
  // Earlier source clips translated the pelvis on its local Z (backwards),
  // leaving the torso high and the bent feet floating. Recognize only that
  // legacy signature; newly rebuilt clips already use the corrected local Y.
  const baseY = values[1];
  for (let i = 0; i < values.length; i += 3) {
    if (Math.abs(values[i + 1] - baseY) > .005 || values[i + 2] > -.2) return;
  }
  for (let i = 0; i < values.length; i += 3) {
    values[i + 1] -= .17;
    values[i + 2] = 0;
  }
  clip.userData = { ...clip.userData, legacyPelvisRetargeted: true };
}
function attachActor(data, x, z, rotation = 0, scale = 1, shirt) {
  const root = cloneActor(data.scene);
  root.position.set(x, world.groundHeight(x, z), z);
  root.rotation.y = rotation;
  root.scale.setScalar(scale);
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = false;
      o.receiveShadow = true;
      o.material = o.material.clone();
      if (shirt && o.material.name === "CIVILIAN_SHIRT")
        o.material.color.set(shirt);
    }
  });
  if (!contactTexture) {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d"), gradient = context.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, "rgba(20,16,12,.65)"); gradient.addColorStop(1, "rgba(20,16,12,0)");
    context.fillStyle = gradient; context.fillRect(0, 0, 64, 64);
    contactTexture = new THREE.CanvasTexture(canvas);
  }
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(.8, .6), new THREE.MeshBasicMaterial({
    map: contactTexture, transparent: true, depthWrite: false, toneMapped: false, opacity: .52,
  }));
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = .018;
  contact.renderOrder = 1;
  contact.name = "CIVILIAN_CONTACT_SHADOW";
  contact.userData.ownedGeometry = true;
  root.add(contact);
  scene.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const actions = Object.fromEntries(
    data.animations.map((c) => [c.name, mixer.clipAction(c)]),
  );
  const actor = {
    root,
    mixer,
    actions,
    current: null,
    origin: new THREE.Vector3(x, 0, z),
  };
  if (actors.length === 1 || actors.length >= 4) {
    const prop = new THREE.Mesh(
      new THREE.BoxGeometry(
        actors.length === 1 ? 0.16 : 0.22,
        actors.length === 1 ? 0.22 : 0.18,
        0.045,
      ),
      new THREE.MeshStandardMaterial({
        color: actors.length === 1 ? 0x4c4434 : 0xa39473,
        roughness: 1,
      }),
    );
    prop.position.set(0.015, -0.05, 0.025);
    prop.userData.ownedGeometry = true;
    const hand = root.getObjectByName("hand.R");
    if (hand) hand.add(prop);
    prop.visible = actors.length >= 4;
    actor.carried = prop;
  }
  animateActor(actor, "Idle");
  actors.push(actor);
  return actor;
}
function animateActor(actor, name) {
  if (!actor) return;
  if (actor.current === name) return;
  const next = actor.actions[name] || actor.actions.Idle;
  if (!next) return;
  next.reset().fadeIn(0.4).play();
  if (actor.current) actor.actions[actor.current]?.fadeOut(0.4);
  actor.current = name;
}
function gestureActor(actor, name = "Gesture", duration = 2.5) {
  if (!actor) return;
  actor.gestureUntil = elapsed + duration;
  animateActor(actor, name);
}
// Named encounters are staged along the cleared visitor corridor. Brisk
// transitions conceal repositioning; the optional walk uses the same corridor.
const damarMarks = [
  [51, 11], [51, 11], [10, 3], [51, 11], [104, 25],
  [127, 29], [113.5, 28.5], [63, 16.5], [26.5, 4], [21.5, 3.5], [21.5, 3.5],
];
function stageCast(index = state.chapter) {
  actors.forEach((actor, i) => { if (i >= 2) actor.root.visible = index < 8; });
  // Let the street observation contain the civilians it describes. These marks
  // sit beside the already checked route; the transition conceals staging.
  if (index === 4) {
    for (const [i, x, z] of [[2, 118.5, 27.5], [3, 126.5, 26.8]]) {
      const actor = actors[i];
      if (actor) {
        actor.root.visible = true;
        actor.root.position.set(x, world.groundHeight(x, z), z);
        animateActor(actor, "Idle");
      }
    }
  }
  const damar = actors[1];
  if (!damar) return;
  const [x, z] = damarMarks[index];
  damar.root.position.set(x, world.groundHeight(x, z), z);
  damar.root.rotation.y = Math.atan2(camera.position.x - x, camera.position.z - z);
  damar.gestureUntil = 0;
  animateActor(damar, index >= 6 ? "Crouch" : "Idle");
  if (damar.carried) damar.carried.visible = index >= 9 && !!state.choices.wounded;
}
function positionCast() {
  const data = actorLibrary;
  if (!data) return;
  attachActor(sariLibrary || data, -88, 8, -2.36, sariLibrary ? 1 : 0.95);
  attachActor(data, 51, 11, -2.3, 1, "#77765a");
  attachActor(data, 104, 29, 2.9, 0.98, "#8c785a");
  attachActor(data, 77, 29, -1.6, 1.02, "#576653");
  attachActor(data, -42, 3, 1.57, 0.96, "#b9ad87");
  attachActor(data, 3, 4, 1.57, 1.01, "#6e746b");
}
function updateCast(dt, t, movementDt = dt) {
  const presentationIndex = travel?.kind === "brisk" && travel.jumped ? travel.index : state.chapter;
  actors.forEach((a, i) => {
    // The last encounter is held with Damar. Bridge passers must not walk
    // through the receiving performance or obscure the final viewpoint.
    if (i >= 2 && presentationIndex >= 8) { a.root.visible = false; return; }
    // Do not update distant civilian skeletons every frame.
    const near = a.root.position.distanceToSquared(camera.position) < 10000;
    // Skeletal clips sample authored transforms; they must use elapsed time,
    // rather than the small physics/visual-effects step. Otherwise low frame
    // rates expire gestures before their poses or cross-fades have advanced.
    if (near || i < 2) a.mixer.update(movementDt);
    if (i === 0 && a.current === "Gesture" && (a.gestureUntil || 0) <= t) animateActor(a, "Idle");
    if (i === 1 && a.carried) a.carried.visible = !!state.choices.wounded && elapsed >= (a.handoffAt || 0);
    if (i === 1) {
      const stagedIndex = travel?.kind === "brisk" && travel.jumped ? travel.index : state.chapter;
      const targets = damarMarks[stagedIndex].slice();
      if (travel && state.chapter >= 3 && travel.kind === "walk") {
        const direction = travel.to.clone().sub(travel.from).setY(0).normalize();
        targets[0] = camera.position.x + direction.x * 1.8;
        targets[1] = camera.position.z + direction.z * 1.8;
      }
      const dx = targets[0] - a.root.position.x,
        dz = targets[1] - a.root.position.z,
        d = Math.hypot(dx, dz);
      if ((a.gestureUntil || 0) > t) return;
      if (d > 0.5) {
        const speed = travel ? travelSpeed(state.chapter) + 0.35 : 1.7;
        a.root.position.x += (dx / d) * Math.min(d, speed * movementDt);
        a.root.position.z += (dz / d) * Math.min(d, speed * movementDt);
        a.root.rotation.y = Math.atan2(dx, dz);
        a.root.position.y = world.groundHeight(
          a.root.position.x,
          a.root.position.z,
        );
        animateActor(a, speed > 2.2 ? "Run" : "Walk");
      } else {
        animateActor(
          a,
          stagedIndex >= 8
            ? "Crouch"
            : stagedIndex === 6
              ? "Crouch"
              : "Idle",
        );
        a.root.rotation.y = Math.atan2(
          camera.position.x - a.root.position.x,
          camera.position.z - a.root.position.z,
        );
      }
    } else if (i >= 2 && i <= 3 && phase > 0.25) {
      animateActor(a, "Run");
      const escapeStep = movementDt * (i === 2 ? 1.2 : -1.4);
      a.root.position.x += escapeStep;
      a.root.position.z += escapeStep * .32;
      a.root.rotation.y = i === 2 ? 1.3 : -1.6;
      a.root.position.y = world.groundHeight(
        a.root.position.x,
        a.root.position.z,
      );
      a.root.visible = Math.abs(a.root.position.x) < 190;
    } else if (i >= 4) {
      const routeTime = (t * 0.7 + i * 15) % 88;
      const walkOffset = routeTime <= 44 ? routeTime - 22 : 66 - routeTime;
      a.root.position.x = a.origin.x + walkOffset;
      a.root.position.y = world.groundHeight(
        a.root.position.x,
        a.root.position.z,
      );
      const heading = routeTime <= 44 ? Math.PI / 2 : -Math.PI / 2;
      const turn = Math.atan2(
        Math.sin(heading - a.root.rotation.y),
        Math.cos(heading - a.root.rotation.y),
      );
      a.root.rotation.y += turn * Math.min(1, dt * 4);
      animateActor(a, "Walk");
    }
  });
}
function makeNotebook() {
  const group = new THREE.Group();
  camera.add(group);
  scene.add(camera);
  const leather = new THREE.MeshStandardMaterial({
    color: 0x494637,
    roughness: 1,
  });
  const page = new THREE.MeshStandardMaterial({
    color: 0xe0d4b6,
    roughness: 1,
  });
  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    group.add(m);
    return m;
  };
  box(0.29, 0.39, 0.022, leather, 0, 0, 0);
  box(0.265, 0.362, 0.023, page, 0.004, 0.004, 0.012);
  const cvs = document.createElement("canvas");
  cvs.width = 384;
  cvs.height = 512;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#e5d9b8";
  ctx.fillRect(0, 0, 384, 512);
  ctx.fillStyle = "#4d5545";
  ctx.font = "italic 29px Georgia";
  ctx.fillText("Catatan lapangan", 30, 60);
  ctx.font = "16px Georgia";
  ctx.fillText("Surabaya, November 1945", 30, 92);
  ctx.strokeStyle = "#555d4938";
  for (let y = 130; y < 470; y += 30) {
    ctx.beginPath();
    ctx.moveTo(25, y);
    ctx.lineTo(355, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#525847";
  ctx.font = "italic 22px Georgia";
  [
    "Nama. Tempat. Kesaksian.",
    "Periksa sebelum menulis.",
    "Sari — menunggu kabar",
    "keluarga.",
    "Kali Mas. Jembatan.",
  ].forEach((s, i) => ctx.fillText(s, 30, 155 + i * 30));
  const texture = new THREE.CanvasTexture(cvs);
  group.userData.pageCanvas = cvs;
  group.userData.pageTexture = texture;
  texture.colorSpace = THREE.SRGBColorSpace;
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.258, 0.35),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 1 }),
  );
  paper.position.set(0.004, 0.004, 0.026);
  group.add(paper);
  const skin = new THREE.MeshStandardMaterial({
    color: 0x9b7755,
    roughness: 1,
  });
  const hand = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.026, 0.09, 4, 8),
    skin,
  );
  hand.rotation.z = 0.2;
  hand.position.set(0.12, -0.15, 0.03);
  group.add(hand);
  for (let i = 0; i < 4; i++) {
    const finger = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.008, 0.045, 3, 6),
      skin,
    );
    finger.rotation.z = 1.1;
    finger.position.set(0.11 + i * 0.004, -0.11 - i * 0.018, 0.045);
    group.add(finger);
  }
  const pen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x353b30 }),
  );
  pen.rotation.z = -0.3;
  pen.position.set(0.16, 0.02, 0.03);
  group.add(pen);
  group.position.set(0.34, -0.37, -0.65);
  group.scale.setScalar(0.75);
  group.rotation.set(-0.4, -0.35, -0.12);
  return group;
}
function resetCast() {
  for (const a of actors) {
    scene.remove(a.root);
    a.mixer.stopAllAction();
    a.mixer.uncacheRoot(a.root);
    const materials = new Set(), skeletons = new Set();
    a.root.traverse(o => {
      if (!o.isMesh) return;
      // Imported geometry and maps belong to the shared GLTF library. Only the
      // avatar's cloned materials and its authored small props are disposable.
      for (const material of Array.isArray(o.material) ? o.material : [o.material]) if (material) materials.add(material);
      if (o.isSkinnedMesh && o.skeleton) skeletons.add(o.skeleton);
      if (o.userData.ownedGeometry) o.geometry.dispose();
    });
    for (const material of materials) material.dispose();
    // SkeletonUtils.clone gives these meshes independent skeletons. Dispose
    // their GPU bone textures; the source GLTF skeletons are never touched.
    for (const skeleton of skeletons) skeleton.dispose();
  }
  actors.length = 0;
  positionCast();
}
function syncBeat({ resume = false } = {}) {
  closeViewfinder();
  setFade(0);
  const beat = beats[state.chapter];
  beatTime = 0;
  lastDialogue = -1;
  phase = phaseFor(state.chapter);
  walking = false;
  heldWalk = false;
  travel = null;
  transition = null;
  lookYaw = 0;
  lookPitch = 0;
  if ([1, 3, 6, 8].includes(state.chapter)) {
    camera.fov = state.chapter === 8 ? 54 : 50;
    camera.updateProjectionMatrix();
    lookYaw = .2;
    lookPitch = state.chapter === 6 ? -.22 : -.1;
  }
  camera.position.set(
    beat.position[0],
    world.groundHeight(...beat.position) +
      (beat.id === "lastview" ? 0.52 : beat.id === "wounded" ? 1.03 : 1.68),
    beat.position[1],
  );
  stageCast();
  setLook(beat.look);
  text(
    "chapter-count",
    String(state.chapter + 1).padStart(2, "0") +
      " / " +
      String(beats.length).padStart(2, "0"),
  );
  text("chapter-title", beat.subtitle.split(" · ")[0].toUpperCase());
  text("chapter-subtitle", beat.title);
  text("objective", beat.target);
  text("objective-en", beat.descriptionEn);
  setDialogue(beat.speaker, beat.line, beat.lineEn);
  text("arrival-location", beat.subtitle);
  text("arrival-title", beat.title.split(" / ")[1]);
  $("arrival").classList.add("show");
  clearTimeout(arrivalTimer);
  arrivalTimer = setTimeout(() => $("arrival").classList.remove("show"), 3200);
  show(
    "act",
    !beat.choices &&
      beat.id !== "afterword" &&
      beat.id !== "lastview" &&
      !hasEntry(),
  );
  show("choices", !!beat.choices && !hasEntry());
  show("walk", hasEntry() && state.chapter < beats.length - 2);
  show("walking", false);
  show("skip-travel", false);
  show("skip-scene", beat.id === "lastview");
  text(
    "act-label",
    beat.id === "bridge" ? "Ambil foto dan catat" : beat.target,
  );
  $("choices").replaceChildren();
  for (const choice of beat.choices || []) {
    const b = document.createElement("button");
    b.className = "choice";
    b.textContent = choice.label;
    const en = document.createElement("small");
    en.className = "translation";
    en.textContent = choice.labelEn;
    b.append(en);
    b.addEventListener("click", () => observe(choice.id));
    $("choices").append(b);
  }
  text(
    "pacing",
    beat.id === "lastview" ? "" : resume
      ? "Catatan dilanjutkan."
      : "Luangkan waktu untuk melihat. Buku catatan dapat dibuka kapan saja.",
  );
  $("chapter-progress-bar").style.width =
    (state.chapter / (beats.length - 1)) * 100 + "%";
  if (!resume) {
    if (beat.id === "impact") {
      sound.cue("impact");
      if (!reducedMotion) {
        $("flash").style.opacity = ".18";
        setTimeout(() => ($("flash").style.opacity = 0), 150);
      }
    }
    if (beat.id === "return") sound.cue("debris");
    if (beat.id === "wounded") sound.cue("injury");
    if (beat.id === "lastview") {
      sound.cue("ending");
    }
  }
  show("interaction", true);
  $("hud").classList.toggle("final-view", beat.id === "lastview");
  world.setPhase(phase);
  for (const [id, choice] of Object.entries(state.choices))
    world.choose?.(id, choice, true);
  sound.setPhase(phase);
  sound.setLocation?.({ x: beat.position[0], z: beat.position[1], chapter: state.chapter });
  if (beat.id !== "lastview" && beat.id !== "afterword") sound.voice?.(beat.id);
  else sound.stopVoice?.();
  updateNotebook();
  layoutDialogue();
  save();
  if (beat.id === "afterword") finish();
}
function hasEntry() {
  return state.entries.some((e) => e.id === beats[state.chapter].id);
}
function closeViewfinder() {
  framing = false;
  show("viewfinder", false);
  $("hud")?.classList.remove("photographing");
  camera.fov = [1, 3, 6, 8].includes(state.chapter) ? (state.chapter === 8 ? 54 : 50) : 57;
  camera.updateProjectionMatrix();
  dirty = true;
}
function openViewfinder() {
  if (!ready || modal || travel || hasEntry()) return;
  framing = true;
  show("viewfinder");
  $("hud")?.classList.add("photographing");
  notebook.visible = false;
  camera.fov = 48;
  camera.updateProjectionMatrix();
  sound.cue("camera");
  $("photo-capture")?.focus({ preventScroll: true });
  dirty = true;
}
function capturePhoto() {
  if (!framing || mode !== "play" || modal || travel || hasEntry()) return;
  notebook.visible = false;
  camera.rotation.order = "YXZ";
  camera.rotation.y = baseYaw + lookYaw;
  camera.rotation.x = lookPitch;
  renderer.render(scene, camera);
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 540;
  const source = renderer.domElement;
  const rect = source.getBoundingClientRect();
  const frame = document.querySelector("#viewfinder .finder-frame")?.getBoundingClientRect();
  const scaleX = source.width / rect.width, scaleY = source.height / rect.height;
  let sx = frame ? (frame.left - rect.left) * scaleX : 0;
  let sy = frame ? (frame.top - rect.top) * scaleY : 0;
  let sw = frame ? frame.width * scaleX : source.width;
  let sh = frame ? frame.height * scaleY : source.height;
  // The frame is responsive; clamp its edges to the canvas and keep 16:9.
  sx = clamp(sx, 0, source.width); sy = clamp(sy, 0, source.height);
  sw = Math.min(sw, source.width - sx); sh = Math.min(sh, source.height - sy);
  const cropH = Math.min(sh, sw * 9 / 16), cropW = cropH * 16 / 9;
  canvas.getContext("2d").drawImage(source, sx + (sw - cropW) / 2, sy + (sh - cropH) / 2, cropW, cropH, 0, 0, 960, 540);
  const photo = canvas.toDataURL("image/jpeg", 0.82);
  closeViewfinder();
  sound.cue("shutter");
  if (!reducedMotion) {
    $("flash").style.opacity = ".38";
    setTimeout(() => ($("flash").style.opacity = 0), 80);
  }
  observe(undefined, photo);
  toast("Foto tersimpan di buku catatan. Tekan N untuk melihatnya.");
}
function observe(choiceId, photo) {
  if (mode !== "play" || modal || travel || hasEntry()) return;
  const beat = beats[state.chapter];
  if (beat.id === "bridge" && !photo) return openViewfinder();
  if (!photo) sound.cue("write");
  state = record(state, beat, choiceId, photo);
  world.choose?.(beat.id, choiceId);
  writing = 1.5;
  show("act", false);
  show("choices", false);
  show("walk", state.chapter < beats.length - 2);
  toast("Pengamatan ditambahkan ke buku catatan.");
  if (choiceId === "help") {
    sound.cue("door");
    gestureActor(actors[1], "Gesture", 2.5);
    lookYaw = 0;
    lookPitch = -0.12;
    toast("Damar menggeser barang. Satu orang lagi dapat masuk.");
  }
  if (beat.id === "sari") {
    gestureActor(actors[0], "Gesture", 2.2);
    toast(choiceId === "testimony" ? "Ucapan Sari tersimpan bersama namanya." : "Pertemuan dengan Sari tersimpan di catatanmu.");
  }
  if (choiceId === "check") {
    lookYaw = -0.35;
    toast("Dari sini, sebagian jalan menuju jembatan tampak terbuka.");
  }
  if (beat.id === "wounded") {
    gestureActor(actors[1], "Gesture", 2.5);
    actors[1].handoffAt = elapsed + 1.5;
    // Pause-aware handoff allowance. The visitor may also continue immediately.
    writing = 3;
    toast(choiceId === "page" ? "Pesan terakhirmu ikut bersama buku yang dibawa Damar." : "Damar menerima buku. Catatanmu akan tetap bersamanya.");
  }
  updateNotebook();
  layoutDialogue();
  save();
}
function beginTravel(auto = true) {
  if (
    mode !== "play" ||
    modal ||
    travel ||
    !hasEntry() ||
    state.chapter >= beats.length - 1
  )
    return;
  const next = beats[state.chapter + 1];
  travel = {
    from: camera.position.clone(),
    to: new THREE.Vector3(next.position[0], 0, next.position[1]),
    index: state.chapter + 1,
    kind: auto && (pacing === "brisk" || reducedMotion) ? "brisk" : "walk",
    elapsed: 0,
    jumped: false,
  };
  walking = auto;
  show("walk", false);
  show("act", false);
  show("choices", false);
  show("walking", true);
  show("skip-travel");
  // Existing speech keeps playing as the visitor starts to move.
  text(
    "objective",
    state.chapter >= 7 ? "Menuju tepian sungai" : "Ikuti jalan di depanmu",
  );
  text(
    "objective-en",
    travel.kind === "brisk" ? "A short transition to the next encounter. You can still pause." : "Look around while walking. Skip ahead whenever you want.",
  );
  text("pacing", travel.kind === "brisk" ? "Menuju perjumpaan berikutnya…" : "Berjalan · berhenti atau lanjut langsung kapan saja.");
  setLook(next.position);
  sound.cue("transition");
}
function setFade(value) {
  if ($("scene-fade")) $("scene-fade").style.opacity = clamp(value, 0, 1);
}
function arriveTravel() {
  if (!travel) return;
  const next = travel.index;
  setFade(0);
  state.chapter = next;
  syncBeat();
}
function skipTravel() {
  if (!travel || modal) return;
  travel.kind = "brisk";
  travel.skipVoice = true;
  sound.stopVoice?.();
  travel.elapsed = 0.9;
  walking = true;
  heldWalk = false;
  show("walking");
  show("walk", false);
}
function skipScene() {
  if (mode !== "play" || modal || beats[state.chapter].id !== "lastview") return;
  state.chapter++;
  syncBeat();
}
function updateHeldPage() {
  if (!notebook?.userData.pageCanvas) return;
  const cvs = notebook.userData.pageCanvas,
    ctx = cvs.getContext("2d");
  ctx.fillStyle = "#e5d9b8";
  ctx.fillRect(0, 0, 384, 512);
  ctx.fillStyle = "#4d5545";
  ctx.font = "italic 29px Georgia";
  ctx.fillText("Catatan lapangan", 25, 55);
  ctx.font = "16px Georgia";
  ctx.fillText("Surabaya, November 1945", 25, 85);
  ctx.strokeStyle = "#555d4938";
  for (let y = 125; y < 480; y += 32) {
    ctx.beginPath();
    ctx.moveTo(25, y);
    ctx.lineTo(355, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#525847";
  ctx.font = "italic 21px Georgia";
  const note =
    state.entries.at(-1)?.text ||
    "Tugas dari redaksi: temui warga. Tulis nama dan apa yang mereka alami.";
  let line = "",
    row = 0;
  for (const word of note.split(" ")) {
    const next = line + word + " ";
    if (ctx.measureText(next).width > 320) {
      ctx.fillText(line, 25, 148 + row * 32);
      row++;
      line = word + " ";
    } else line = next;
    if (row > 9) break;
  }
  if (row <= 9) ctx.fillText(line, 25, 148 + row * 32);
  notebook.userData.pageTexture.needsUpdate = true;
}
function updateNotebook() {
  updateHeldPage();
  text("note-count", `${state.entries.length} pengamatan`);
  text("journal-objective", beats[state.chapter].target);
  $("entries").replaceChildren();
  for (const entry of state.entries) {
    const article = document.createElement("article");
    article.className = "entry";
    const small = document.createElement("small");
    small.textContent = beats
      .find((b) => b.id === entry.id)
      ?.subtitle.toUpperCase();
    const h = document.createElement("h4");
    h.textContent = entry.title.split(" / ")[1];
    const p = document.createElement("p");
    p.textContent = entry.text;
    const en = document.createElement("p");
    en.className = "translation";
    en.textContent = entry.textEn;
    article.append(small, h, p, en);
    if (entry.photo) {
      const image = document.createElement("img");
      image.src = entry.photo;
      image.alt = "Foto Kali Mas dari sudut pandang Raka di Jembatan Merah";
      article.append(image);
    }
    $("entries").append(article);
  }
  show("journal-empty", !state.entries.length);
}
function openModal(name) {
  if (modal) return;
  previousFocus = document.activeElement;
  modal = name;
  show(name);
  sound.pause();
  heldWalk = false;
  setFade(0);
  const first = $(name).querySelector("button");
  first?.focus();
}
function closeModal() {
  if (!modal) return;
  show(modal, false);
  modal = null;
  lastFrame = performance.now();
  if (mode === "play" || mode === "ending") sound.resume();
  previousFocus?.focus();
}
function about() {
  if (modal) {
    pauseBeforeAbout = modal;
    show(modal, false);
    modal = null;
  }
  openModal("about-modal");
}
function finish() {
  state.completed = true;
  mode = "ending";
  show("hud", false);
  show("ending");
  const account = endingAccount(state);
  text("ending-account", account.id);
  text("ending-account-en", account.en);
  save();
  sound.setPhase(0.9);
  sound.stopVoice?.();
  sound.setVolume(volume * 0.65);
  sound.voice?.("afterword");
  $("ending-notes").focus({ preventScroll: true });
  document.querySelector(".ending-content").scrollTop = 0;
}
async function start(resume = false) {
  if (!ready) return;
  show("cover", false);
  if (!resume) {
    show("intro");
    mode = "intro";
    $("enter").focus();
  } else {
    state = saved || newState();
    resetCast();
    mode = "play";
    show("hud");
    await sound.start();
    sound.setVolume(volume);
    syncBeat({ resume: true });
    if (state.completed) finish();
  }
}
async function enter() {
  show("intro", false);
  state = newState();
  resetCast();
  mode = "play";
  show("hud");
  await sound.start();
  sound.setVolume(volume);
  syncBeat();
  $("notebook-button").focus();
}
function restart() {
  if (!confirm("Mulai kembali? Catatan pada sesi ini akan diganti.")) return;
  closeModal();
  show("ending", false);
  state = newState();
  elapsed = 0;
  beatTime = 0;
  stepDistance = 0;
  mode = "play";
  show("hud");
  resetCast();
  sound.resume();
  sound.setVolume(volume);
  syncBeat();
}
function downloadNotes() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([buildNotebookHTML(state)], { type: "text/html;charset=utf-8" }),
  );
  a.download = "Jejaka_Catatan_Raka.html";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function bind() {
  $("start").onclick = () => start();
  $("continue").onclick = () => start(true);
  $("enter").onclick = enter;
  for (const id of ["cover-about", "about", "ending-sources"])
    $(id).onclick = about;
  $("close-about").onclick = () => {
    closeModal();
    if (pauseBeforeAbout) {
      const m = pauseBeforeAbout;
      pauseBeforeAbout = null;
      openModal(m);
    }
  };
  $("brand").onclick = $("pause-button").onclick = () => openModal("pause");
  $("resume").onclick = closeModal;
  $("notebook-button").onclick = $("ending-notes").onclick = () => {
    sound.cue("paper");
    openModal("journal");
  };
  $("close-journal").onclick = closeModal;
  $("download-notes").onclick = downloadNotes;
  $("restart").onclick = $("ending-restart").onclick = restart;
  $("act").onclick = () => observe();
  if ($("photo-capture")) $("photo-capture").onclick = capturePhoto;
  if ($("photo-cancel")) $("photo-cancel").onclick = closeViewfinder;
  if ($("skip-travel")) $("skip-travel").onclick = skipTravel;
  if ($("skip-scene")) $("skip-scene").onclick = skipScene;
  if ($("quality-select")) $("quality-select").onchange = e => {
    quality = e.target.value;
    applyQuality();
    settings();
  };
  if ($("pacing-select")) $("pacing-select").onchange = e => {
    pacing = e.target.value;
    settings();
  };
  $("walk").onclick = () => {
    if (travel) {
      walking = true;
      show("walk", false);
      show("walking");
    } else beginTravel();
  };
  $("stop-walk").onclick = () => {
    if (travel?.kind === "brisk" && travel.jumped) { arriveTravel(); return; }
    walking = false;
    setFade(0);
    show("walking", false);
    show("walk");
  };
  $("volume").oninput = (e) => {
    volume = +e.target.value;
    settings();
  };
  $("audio-toggle").onclick = () => {
    volume = volume > 0 ? 0 : 0.55;
    settings();
  };
  for (const id of ["english", "intro-english"])
    $(id).onchange = (e) => {
      english = e.target.checked;
      settings();
    };
  for (const id of ["motion", "intro-motion"])
    $(id).onchange = (e) => {
      reducedMotion = e.target.checked;
      settings();
    };
  document.addEventListener("keydown", (e) => {
    if (e.code === "Tab" && modal) {
      const focusable = [...$(modal).querySelectorAll("button,a,input,select")].filter(
        (x) => !x.hidden && !x.disabled,
      );
      const first = focusable[0],
        last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
      return;
    }
    if (e.code === "Escape") {
      if (modal) {
        if (modal === "about-modal") $("close-about").click();
        else closeModal();
      } else if (framing) closeViewfinder();
      else if (mode === "play") openModal("pause");
      e.preventDefault();
      return;
    }
    if (e.target.matches("input,select,textarea")) return;
    if (
      e.code === "KeyN" &&
      !e.repeat &&
      (mode === "play" || mode === "ending")
    ) {
      if (modal === "journal") closeModal();
      else if (!modal) {
        sound.cue("paper");
        openModal("journal");
      }
      e.preventDefault();
    }
    if (mode !== "play" || modal) return;
    const shutterKey = e.code === "KeyE" ||
      (["Space", "Enter"].includes(e.code) && (!e.target.closest("button,a,input,select,textarea") || e.target.closest("#photo-capture")));
    if (framing && shutterKey && !e.repeat) {
      e.preventDefault();
      capturePhoto();
      return;
    }
    if (framing && e.code === "KeyW") return;
    if (framing && e.code.startsWith("Arrow")) {
      e.preventDefault();
      if (e.code === "ArrowLeft") lookYaw = clamp(lookYaw + .08, -1.4, 1.4);
      if (e.code === "ArrowRight") lookYaw = clamp(lookYaw - .08, -1.4, 1.4);
      if (e.code === "ArrowUp") lookPitch = clamp(lookPitch + .05, -.5, .45);
      if (e.code === "ArrowDown") lookPitch = clamp(lookPitch - .05, -.5, .45);
      dirty = true;
      return;
    }
    if (e.code === "KeyE" && !e.repeat) {
      if (!$("act").hidden) observe();
      else if (!$("walk").hidden) $("walk").click();
    }
    if (e.code === "KeyW" || e.code === "ArrowUp") {
      e.preventDefault();
      heldWalk = true;
      if (!travel && hasEntry()) beginTravel(false);
    }
    if (e.code === "ArrowLeft") lookYaw += 0.08;
    if (e.code === "ArrowRight") lookYaw -= 0.08;
    if (e.code === "ArrowDown") lookPitch = clamp(lookPitch - 0.05, -0.5, 0.45);
    if (e.code === "ArrowUp" && framing) lookPitch = clamp(lookPitch + 0.05, -0.5, 0.45);
    dirty = true;
  });
  document.addEventListener("keyup", (e) => {
    if (e.code === "KeyW" || e.code === "ArrowUp") {
      heldWalk = false;
      if (travel && !walking) {
        show("walking", false);
        show("walk");
      }
    }
  });
  window.addEventListener("blur", () => {
    heldWalk = false;
    dragging = false;
    if (mode === "play" && !modal) openModal("pause");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && mode === "play" && !modal) openModal("pause");
  });
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (mode !== "play" || modal) return;
    dragging = true;
    pointer = { x: e.clientX, y: e.clientY };
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    lookYaw = clamp(lookYaw - (e.clientX - pointer.x) * 0.003, -1.4, 1.4);
    lookPitch = clamp(lookPitch - (e.clientY - pointer.y) * 0.002, -0.5, 0.45);
    pointer = { x: e.clientX, y: e.clientY };
    dirty = true;
  });
  renderer.domElement.addEventListener("pointerup", () => (dragging = false));
  renderer.domElement.addEventListener(
    "pointercancel",
    () => (dragging = false),
  );
  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    layoutDialogue();
    dirty = true;
  });
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    error(
      "Browser kehilangan konteks grafis. Muat ulang untuk melanjutkan catatan tersimpan.",
    );
  });
}
function error(message) {
  text("error-message", message);
  show("error");
  mode = "error";
  sound.pause();
}
function updateTravel(storyDt, movementDt) {
  if (!travel || !(walking || heldWalk)) return;
  travel.elapsed += storyDt;
  const direction = travel.to.clone().sub(travel.from).setY(0).normalize();
  if (travel.kind === "brisk") {
    const stage = briskTransition(travel.elapsed);
    if (stage.jump && !travel.jumped) {
      // Reposition only under a fully opaque first-person transition. Even a
      // slow frame that skips the fade boundary cannot reveal a flying camera.
      setFade(1);
      camera.position.copy(travel.to).addScaledVector(direction, reducedMotion ? 0 : -1);
      camera.position.y = world.groundHeight(camera.position.x, camera.position.z) + (state.chapter >= 8 ? 0.8 : 1.68);
      stageCast(travel.index);
      travel.jumped = true;
      travel.elapsed = Math.min(travel.elapsed, 1.75);
      return;
    }
    setFade(stage.fade);
    if (!reducedMotion && (travel.elapsed < .9 || travel.elapsed > 2.35)) {
      const distance = camera.position.clone().setY(0).distanceTo(travel.to);
      const step = Math.min(distance, 1.1 * movementDt);
      camera.position.addScaledVector(direction, step);
      camera.position.y = world.groundHeight(camera.position.x, camera.position.z) + (state.chapter >= 8 ? 0.8 : 1.68);
    }
    if (stage.complete && (travel.skipVoice || !sound.voiceSource || volume === 0 || travel.elapsed > 12)) arriveTravel();
    return;
  }
  setFade(0);
  const delta = travel.to.clone().sub(camera.position).setY(0);
  const distance = delta.length();
  const speed = travelSpeed(state.chapter);
  const step = Math.min(distance, speed * movementDt);
  if (distance > .08) {
    camera.position.addScaledVector(delta.normalize(), step);
    camera.position.y = world.groundHeight(camera.position.x, camera.position.z) +
      (state.chapter >= 8 ? .8 : 1.68) + (reducedMotion ? 0 : Math.sin(elapsed * 7.5) * .01);
    stepDistance += step;
    if (stepDistance > .68) { sound.step(speed); stepDistance %= .68; }
  } else arriveTravel();
}
function render(now) {
  const active = mode === "play" && !modal && !document.hidden;
  const delta = frameDelta(now, lastFrame, active);
  lastFrame = now;
  const dt = delta.animation;
  if (active) {
    elapsed += delta.story;
    beatTime += delta.story;
    writing = Math.max(0, writing - delta.story);
    world?.update(dt, elapsed, phase);
    updateCast(dt, elapsed, delta.movement);
    const beat = beats[state.chapter];
    if (!travel || travel.kind === "walk") {
      let idx = -1;
      beat.dialogue?.forEach((d, i) => { if (beatTime >= d.at) idx = i; });
      if (idx !== lastDialogue && idx >= 0 && !sound.voiceSource) {
        const d = beat.dialogue[idx];
        setDialogue(d.speaker, d.id, d.en);
        lastDialogue = idx;
      }
      if (beat.id === "lastview") {
        for (const at of [4, 12]) if (beatTime >= at && beatTime - delta.story < at) sound.cue("breath");
        if (beatTime >= 9 && beatTime - delta.story < 9) sound.voice?.("lastview");
        // The low viewpoint remains above the actual bridge surface and keeps
        // the district visible. Never sink toward an absolute world Y value.
        const floor = world.groundHeight(...beat.position);
        camera.position.y = floor + lerp(.62, .48, clamp(beatTime / beat.duration, 0, 1));
        lookPitch = lerp(lookPitch, .045, Math.min(1, dt * .35));
        if (beatTime >= beat.duration) { state.chapter++; syncBeat(); }
      }
    }
    updateTravel(delta.story, delta.movement);
    camera.rotation.order = "YXZ";
    camera.rotation.y = baseYaw + lookYaw;
    camera.rotation.x = lookPitch + (reducedMotion || framing ? 0 : Math.sin(elapsed * 1.6) * .0015);
    camera.rotation.z = state.chapter === 9 ? -.055 : 0;
    if (notebook) {
      notebook.visible = !framing && state.chapter < 9 && !(state.chapter === 8 && hasEntry() && writing < 1.5);
      notebook.position.y = lerp(notebook.position.y,
        (travel ? -.53 : -.34) + (writing > 0 ? Math.sin(elapsed * 14) * .005 : 0), Math.min(1, dt * 4));
      notebook.rotation.z = -.12 + (writing > 0 ? Math.sin(elapsed * 8) * .012 : 0);
    }
    // Auto may lower resolution once after a sustained expensive sample. It
    // never silently changes a manually selected high/low setting.
    if (quality === "auto" && !autoLow && delta.story > 0 && ready) {
      qualitySamples.push(delta.story);
      if (qualitySamples.length >= 45) {
        const sorted = qualitySamples.slice().sort((a,b) => a-b);
        if (sorted[Math.floor(sorted.length * .6)] > .045) { autoLow = true; applyQuality(); }
        qualitySamples = [];
      }
    }
  } else if (dirty && world) world.update(0, elapsed, phase);
  if (mode === "cover") {
    camera.position.set(-54, 2.25, 5);
    camera.lookAt(25, 6, -3);
  }
  if (renderer && !document.hidden && (active || dirty)) {
    renderer.render(scene, camera);
    dirty = false;
  }
  requestAnimationFrame(render);
}
async function init() {
  try {
    loadSettings();
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    $("scene").append(renderer.domElement);
    bind();
    applyQuality();
    settings();
    requestAnimationFrame(render);
    const loader = new GLTFLoader();
    const loaded = await Promise.all([createWorld({
      scene,
      renderer,
      onProgress: (p) => {
        $("load-bar").style.width = Math.round(p * 90) + "%";
        text(
          "load-status",
          `Membuka kawasan Kali Mas · ${Math.round(p * 90)}%`,
        );
      },
    }), Promise.all([
      loader.loadAsync("./assets/characters.glb?v=2"),
      loader.loadAsync("./assets/sari.glb?v=2"),
    ])]);
    [world, [actorLibrary, sariLibrary]] = loaded;
    retargetLegacyCrouch(actorLibrary);
    retargetLegacyCrouch(sariLibrary);
    applyQuality();
    positionCast();
    notebook = makeNotebook();
    notebook.visible = false;
    try {
      saved = restore(localStorage.getItem(SAVE_KEY), beats);
    } catch {}
    show("continue", !!saved);
    ready = true;
    dirty = true;
    $("start").disabled = false;
    text("start-label", "Mulai pengalaman");
    text("load-status", "Kota siap. Buka catatan pertama.");
    $("load-bar").style.width = "100%";
    if (testsEnabled)
      window.__JEJAKA__ = {
        get state() {
          return state;
        },
        get mode() {
          return mode;
        },
        get renderer() {
          return renderer;
        },
        get camera() {
          return camera;
        },
        get world() {
          return world;
        },
        get actors() {
          return actors;
        },
        get ready() {
          return ready;
        },
        goto(index) {
          state.chapter = clamp(index, 0, beats.length - 1);
          mode = "play";
          show("cover", false);
          show("intro", false);
          show("ending", false);
          show("hud");
          syncBeat();
        },
        arrive() {
          if (travel) {
            state.chapter = travel.index;
            syncBeat();
          }
        },
        advanceTime(seconds) {
          beatTime += seconds;
          dirty = true;
        },
        observe,
        beginTravel,
        capturePhoto,
        skipTravel,
        skipScene,
        get framing() { return framing; },
        get timing() { return { elapsed, beatTime, writing }; },
        get settings() { return { pacing, quality, autoLow, english, reducedMotion, volume }; },
        get phase() {
          return phase;
        },
        get travel() {
          return travel;
        },
        get audio() {
          return sound;
        },
      };
  } catch (e) {
    console.error(e);
    error(/webgl|graphics context|gpu/i.test(e.message || "")
      ? "Tampilan 3D belum dapat dibuka. Aktifkan akselerasi grafis di browser, lalu muat ulang. Coba Chrome atau Edge terbaru jika masih terkendala."
      : "Kota belum berhasil dimuat. Periksa koneksi lalu muat ulang halaman.");
  }
}
init();
