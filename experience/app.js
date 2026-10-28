import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneActor } from "three/addons/utils/SkeletonUtils.js";
import { createWorld } from "./world.js";
import { Soundscape } from "./audio.js";
import { beats, storyMeta } from "./story.js";
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
  volume = 0.55;
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
  saveAvailable = true;
const testsEnabled = new URLSearchParams(location.search).has("test");
const clamp = THREE.MathUtils.clamp,
  lerp = THREE.MathUtils.lerp;
function show(id, yes = true) {
  $(id).hidden = !yes;
}
function text(id, value) {
  $(id).textContent = value || "";
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
  $("dialogue").style.bottom =
    innerWidth <= 700 ? `${Math.max(190, innerHeight - r.top + 18)}px` : "";
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
}
function setDialogue(speaker, id, en) {
  text("speaker", speaker);
  text("line", id);
  text("line-en", en);
  show("dialogue", !!id);
}
function setLook(target) {
  const pos = camera.position;
  baseYaw = Math.atan2(-(target[0] - pos.x), -(target[1] - pos.z));
}
function phaseFor(index) {
  return clamp((index - 3) / 6, 0, 1);
}
function attachActor(data, x, z, rotation = 0, scale = 1, shirt) {
  const root = cloneActor(data.scene);
  root.position.set(x, world.groundHeight(x, z), z);
  root.rotation.y = rotation;
  root.scale.setScalar(scale);
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      o.material = o.material.clone();
      if (shirt && o.material.name === "CIVILIAN_SHIRT")
        o.material.color.set(shirt);
    }
  });
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
  if (actor.current === name) return;
  const next = actor.actions[name] || actor.actions.Idle;
  if (!next) return;
  next.reset().fadeIn(0.4).play();
  if (actor.current) actor.actions[actor.current]?.fadeOut(0.4);
  actor.current = name;
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
function updateCast(dt, t) {
  actors.forEach((a, i) => {
    a.mixer.update(dt);
    if (i === 1 && a.carried) a.carried.visible = !!state.choices.wounded;
    if (i === 1) {
      const targets =
        state.chapter >= 8
          ? [31, 5]
          : state.chapter >= 6
            ? [114, 28]
            : state.chapter >= 5
              ? [126, 30]
              : [51, 11];
      const dx = targets[0] - a.root.position.x,
        dz = targets[1] - a.root.position.z,
        d = Math.hypot(dx, dz);
      if (d > 0.5) {
        const speed = state.chapter >= 5 ? 1.7 : 1.0;
        a.root.position.x += (dx / d) * Math.min(d, speed * dt);
        a.root.position.z += (dz / d) * Math.min(d, speed * dt);
        a.root.rotation.y = Math.atan2(dx, dz);
        a.root.position.y = world.groundHeight(
          a.root.position.x,
          a.root.position.z,
        );
        animateActor(a, state.chapter >= 5 ? "Run" : "Walk");
      } else {
        animateActor(
          a,
          state.chapter >= 8
            ? "Crouch"
            : state.chapter === 6
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
      a.root.position.x += dt * (i === 2 ? 1.2 : -1.4);
      a.root.position.z = a.root.position.x * 0.265 + 1.5;
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
  }
  actors.length = 0;
  positionCast();
}
function syncBeat({ resume = false } = {}) {
  const beat = beats[state.chapter];
  beatTime = 0;
  lastDialogue = -1;
  phase = phaseFor(state.chapter);
  walking = false;
  heldWalk = false;
  travel = null;
  lookYaw = 0;
  lookPitch = 0;
  camera.position.set(
    beat.position[0],
    world.groundHeight(...beat.position) +
      (beat.id === "lastview" ? 0.52 : beat.id === "wounded" ? 1.03 : 1.68),
    beat.position[1],
  );
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
    resume
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
      show("interaction", false);
    } else show("interaction", true);
  }
  $("hud").classList.toggle("final-view", beat.id === "lastview");
  world.setPhase(phase);
  for (const [id, choice] of Object.entries(state.choices))
    world.choose?.(id, choice, true);
  sound.setPhase(phase);
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
function observe(choiceId) {
  if (mode !== "play" || modal || travel || hasEntry()) return;
  const beat = beats[state.chapter];
  let photo;
  if (beat.id === "bridge") {
    notebook.visible = false;
    renderer.render(scene, camera);
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 270;
    canvas.getContext("2d").drawImage(renderer.domElement, 0, 0, 480, 270);
    photo = canvas.toDataURL("image/jpeg", 0.7);
    notebook.visible = true;
    sound.cue("camera");
    if (!reducedMotion) {
      $("flash").style.opacity = ".5";
      setTimeout(() => ($("flash").style.opacity = 0), 80);
    }
  } else sound.cue("write");
  state = record(state, beat, choiceId, photo);
  world.choose?.(beat.id, choiceId);
  writing = 1.5;
  show("act", false);
  show("choices", false);
  show("walk", state.chapter < beats.length - 2);
  toast("Pengamatan ditambahkan ke buku catatan.");
  if (choiceId === "help") {
    sound.cue("door");
    animateActor(actors[1], "Gesture");
  }
  if (choiceId === "check") {
    lookYaw = -0.35;
    toast("Dari sini, sebagian jalan menuju jembatan tampak terbuka.");
  }
  if (beat.id === "wounded") {
    notebook.visible = false;
    setTimeout(() => {
      if (mode === "play" && !modal && state.chapter === 8) beginTravel();
    }, 6500);
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
  };
  walking = auto;
  show("walk", false);
  show("act", false);
  show("choices", false);
  show("walking", true);
  sound.stopVoice?.();
  setDialogue("", "", "");
  text(
    "objective",
    state.chapter >= 7 ? "Menuju tepian sungai" : "Ikuti jalan di depanmu",
  );
  text(
    "objective-en",
    "Follow the route. Drag to look around; stop whenever you need.",
  );
  text("pacing", "Kau dapat berhenti dan membuka buku catatan.");
  setLook(next.position);
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
  const first = $(name).querySelector("button");
  first?.focus();
}
function closeModal() {
  if (!modal) return;
  show(modal, false);
  modal = null;
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
  const lines = [
    `JEJAKA — Buku catatan Raka Pradana`,
    storyMeta.period,
    "Tokoh dan kesaksian dalam catatan ini fiktif.",
    "",
    ...state.entries.flatMap((e) => [
      e.title,
      e.text,
      english ? e.textEn : "",
      "",
    ]),
  ];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }),
  );
  a.download = "Jejaka_Catatan_Raka.txt";
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
  $("walk").onclick = () => {
    if (travel) {
      walking = true;
      show("walk", false);
      show("walking");
    } else beginTravel();
  };
  $("stop-walk").onclick = () => {
    walking = false;
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
      const focusable = [...$(modal).querySelectorAll("button,a,input")].filter(
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
    if (e.target.matches("input")) return;
    if (e.code === "Escape") {
      if (modal) {
        if (modal === "about-modal") $("close-about").click();
        else closeModal();
      } else if (mode === "play") openModal("pause");
      e.preventDefault();
    }
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
function render(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.12);
  lastFrame = now;
  const active = mode === "play" && !modal;
  elapsed += active || mode === "cover" ? dt : 0;
  if (world) {
    world.update(active ? dt : 0, elapsed, phase);
    if (active) updateCast(dt, elapsed);
  }
  if (mode === "cover") {
    camera.position.set(-54, 2.25, 5);
    camera.lookAt(25, 6, -3);
  }
  if (active) {
    beatTime += dt;
    writing = Math.max(0, writing - dt);
    const beat = beats[state.chapter];
    if (!travel) {
      let idx = -1;
      beat.dialogue?.forEach((d, i) => {
        if (beatTime >= d.at) idx = i;
      });
      if (idx !== lastDialogue && idx >= 0 && !sound.voiceSource) {
        const d = beat.dialogue[idx];
        setDialogue(d.speaker, d.id, d.en);
        lastDialogue = idx;
      }
      if (beat.id === "lastview") {
        for (const t of [12, 27])
          if (beatTime >= t && beatTime - dt < t) sound.cue("breath");
        if (beatTime >= 9 && beatTime - dt < 9) sound.voice?.("lastview");
        camera.position.y = lerp(camera.position.y, 0.34, dt * 0.07);
        lookPitch = lerp(lookPitch, -0.1, dt * 0.1);
        if (beatTime > beat.duration) {
          state.chapter++;
          syncBeat();
        }
      }
    }
    if (travel && (walking || heldWalk)) {
      const delta = travel.to.clone().sub(camera.position);
      delta.y = 0;
      const d = delta.length();
      const speed =
        state.chapter >= 8 ? 0.38 : state.chapter >= 5 ? 1.25 : 0.95;
      const step = Math.min(d, speed * dt);
      if (d > 0.08) {
        camera.position.addScaledVector(delta.normalize(), step);
        const height = state.chapter >= 8 ? 0.8 : 1.68;
        camera.position.y =
          world.groundHeight(camera.position.x, camera.position.z) +
          height +
          (reducedMotion ? 0 : Math.sin(elapsed * 7.5) * 0.014);
        stepDistance += step;
        if (stepDistance > 0.68) {
          sound.step(speed);
          stepDistance = 0;
        }
      } else {
        state.chapter = travel.index;
        syncBeat();
      }
    }
    camera.rotation.order = "YXZ";
    camera.rotation.y = baseYaw + lookYaw;
    camera.rotation.x =
      lookPitch + (reducedMotion ? 0 : Math.sin(elapsed * 1.6) * 0.0015);
    camera.rotation.z = state.chapter === 9 ? -0.09 : 0;
    if (notebook) {
      notebook.visible =
        state.chapter < 9 && !(state.chapter === 8 && hasEntry());
      notebook.position.y = lerp(
        notebook.position.y,
        (travel ? -0.53 : -0.34) +
          (writing > 0 ? Math.sin(elapsed * 14) * 0.005 : 0),
        dt * 4,
      );
      notebook.rotation.z =
        -0.12 + (writing > 0 ? Math.sin(elapsed * 8) * 0.012 : 0);
    }
  }
  if (renderer) renderer.render(scene, camera);
  requestAnimationFrame(render);
}
async function init() {
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    $("scene").append(renderer.domElement);
    bind();
    settings();
    requestAnimationFrame(render);
    world = await createWorld({
      scene,
      renderer,
      onProgress: (p) => {
        $("load-bar").style.width = Math.round(p * 90) + "%";
        text(
          "load-status",
          `Membuka kawasan Kali Mas · ${Math.round(p * 90)}%`,
        );
      },
    });
    const loader = new GLTFLoader();
    [actorLibrary, sariLibrary] = await Promise.all([
      loader.loadAsync("./assets/characters.glb"),
      loader.loadAsync("./assets/sari.glb"),
    ]);
    positionCast();
    notebook = makeNotebook();
    notebook.visible = false;
    try {
      saved = restore(localStorage.getItem(SAVE_KEY), beats);
    } catch {}
    show("continue", !!saved);
    ready = true;
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
        },
        observe,
        beginTravel,
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
    error(e.message || "Model tidak dapat dimuat.");
  }
}
init();
