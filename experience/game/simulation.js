/** Deterministic game rules. No renderer, DOM, storage, or wall-clock dependency.
 * Positions are metres, Y-up; camera yaw follows Three.js (zero faces -Z).
 * stepPlayer mutates its player. interact returns {ok, reason?, message}.
 * UI owns reach/line-of-sight checks; rules reject out-of-order interactions.
 */
export const TARGETS = Object.freeze({
  sari: { x: -6, z: 10 }, bridge: { x: 0, z: -24 },
  damar: { x: 6, z: -42 }, parcel: { x: -10, z: -48 },
  shelter: { x: -15, z: -12 }, cart: { x: -10, z: -7 },
  handoff: { x: -15, z: -12 },
});
export const BOUNDS = Object.freeze({ minX: -28, maxX: 28, minZ: -65, maxZ: 30 });
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
const copy = value => JSON.parse(JSON.stringify(value));
const RADIUS = 0.33;
export function createPlayer(spawn = {}) {
  return { x: clamp(finite(spawn.x), -27.6, 27.6), z: clamp(finite(spawn.z, 24), -64.6, 29.6),
    vx: 0, vz: 0, yaw: finite(spawn.yaw), eyeHeight: 1.68, stance: 'walk',
    stamina: 1, noise: 0, distance: 0, exposure: 0, moving: false };
}

function pushOut(player, box) {
  const nearestX = clamp(player.x, box.minX, box.maxX);
  const nearestZ = clamp(player.z, box.minZ, box.maxZ);
  const dx = player.x - nearestX, dz = player.z - nearestZ;
  const length = Math.hypot(dx, dz);
  if (length >= RADIUS) return;
  if (length > 0.00001) {
    const depth = RADIUS - length;
    const nx = dx / length, nz = dz / length;
    player.x += nx * depth; player.z += nz * depth;
    const inward = player.vx * nx + player.vz * nz;
    if (inward < 0) { player.vx -= nx * inward; player.vz -= nz * inward; }
  } else {
    // Recovery for a restored checkpoint overlapping newly active route debris.
    const sides = [
      [Math.abs(player.x - box.minX), 'x', box.minX - RADIUS],
      [Math.abs(player.x - box.maxX), 'x', box.maxX + RADIUS],
      [Math.abs(player.z - box.minZ), 'z', box.minZ - RADIUS],
      [Math.abs(player.z - box.maxZ), 'z', box.maxZ + RADIUS],
    ].sort((a, b) => a[0] - b[0]);
    player[sides[0][1]] = sides[0][2];
    player[sides[0][1] === 'x' ? 'vx' : 'vz'] = 0;
  }
}

export function stepPlayer(player, input = {}, dt = 0, colliders = []) {
  if (input.paused || dt <= 0 || !Number.isFinite(dt)) return player;
  dt = Math.min(dt, 0.1); // A stalled tab must not move across an entire hazard.
  const steps = Math.max(1, Math.ceil(dt / 0.02)), h = dt / steps;
  const forward = clamp(finite(input.forward), -1, 1);
  const right = clamp(finite(input.right), -1, 1);
  const amount = Math.max(1, Math.hypot(forward, right));
  const running = Boolean(input.sprint && !input.crouch && player.stamina > 0.05 && Math.hypot(forward, right) > 0.1);
  const speed = input.crouch ? 1.1 : input.injured ? 1.5 : running ? 4.8 : 2.6;
  player.stance = input.crouch ? 'crouch' : running ? 'run' : input.injured ? 'injured' : 'walk';
  if (Number.isFinite(input.yaw)) player.yaw = input.yaw;
  const sy = Math.sin(player.yaw), cy = Math.cos(player.yaw);
  const targetX = (-sy * forward + cy * right) / amount * speed;
  const targetZ = (-cy * forward - sy * right) / amount * speed;
  const oldX = player.x, oldZ = player.z;
  for (let i = 0; i < steps; i++) {
    const smoothing = 1 - Math.exp(-h * (Math.hypot(forward, right) > 0.1 ? 12 : 16));
    player.vx += (targetX - player.vx) * smoothing;
    player.vz += (targetZ - player.vz) * smoothing;
    player.x += player.vx * h; player.z += player.vz * h;
    for (const box of colliders) {
      if (box.disabled || box.enabled === false) continue;
      if (![box.minX, box.maxX, box.minZ, box.maxZ].every(Number.isFinite)) continue;
      pushOut(player, box);
    }
    player.x = clamp(player.x, BOUNDS.minX + RADIUS, BOUNDS.maxX - RADIUS);
    player.z = clamp(player.z, BOUNDS.minZ + RADIUS, BOUNDS.maxZ - RADIUS);
  }
  const moved = Math.hypot(player.x - oldX, player.z - oldZ);
  player.distance += moved;
  player.moving = moved > 0.002;
  player.noise += ((player.moving ? (running ? 1 : input.crouch ? 0.12 : 0.4) : 0) - player.noise) * (1 - Math.exp(-dt * 8));
  player.stamina = clamp(player.stamina + dt * (running ? -0.12 : 0.09), 0, 1);
  const height = input.crouch ? 1.08 : input.injured ? 1.5 : 1.68;
  player.eyeHeight += (height - player.eyeHeight) * (1 - Math.exp(-dt * 10));
  return player;
}
export function isCovered(player, cover = []) {
  return cover.some(c => {
    if (c.disabled || c.enabled === false) return false;
    if (Number.isFinite(c.minX)) return player.x >= c.minX && player.x <= c.maxX && player.z >= c.minZ && player.z <= c.maxZ;
    return Math.hypot(player.x - c.x, player.z - c.z) < (c.r ?? c.radius ?? 2);
  });
}

const entry = (id, type, en, idText) => ({ id, type, en, idText });
const arrival = entry('arrival', 'seen', 'A street of shutters, bundles and unfinished errands. The city is still moving.', 'Jalan dipenuhi daun jendela, bungkusan, dan urusan yang belum selesai. Kota ini masih bergerak.');
export function createSession() {
  return { version: 4, helpProgress: 0, helpKind: null, pendingImpact: null, dangerTime: 0, stage: 'sari', time: 0, eventTime: 0, event: 'quiet', paused: false,
    flags: { sariWarned: false, testimony: false, photographed: false, metDamar: false,
      parcel: false, rescued: false, cartCleared: false, shelterOpen: false,
      safeLane: false, clothSaved: true, exposed: false, returnImpact: false, impact: false, notebookPassed: false },
    choices: {}, entries: [copy(arrival)], photographs: [], endingTime: 0 };
}
function note(s, data) {
  if (!s.flags.notebookPassed && !s.entries.some(e => e.id === data.id)) s.entries.push({ ...data, time: Math.round(s.time) });
}
const response = (ok, en, id, reason) => ({ ok, ...(reason ? { reason } : {}), message: { en, id } });
const reject = () => response(false, 'There is nothing to do here yet.', 'Belum ada yang bisa dilakukan di sini.', 'stage');
export function interact(s, id, choice) {
  if (!s || s.paused || s.stage === 'ending' || s.stage === 'afterword') return reject();
  if (id === 'sari' && s.stage === 'sari') {
    choice = choice === 'place' ? 'warn' : choice;
    if (!['testimony', 'warn'].includes(choice)) return response(false, 'Listen, or warn Sari to close the shop.', 'Dengarkan, atau minta Sari menutup tokonya.', 'choice');
    s.choices.sari = choice; s.flags.sariWarned = choice === 'warn'; s.flags.testimony = choice === 'testimony';
    note(s, entry('sari', 'told', choice === 'testimony'
      ? 'Sari says she learned batik from her mother: hot wax keeps dye from parts of the cloth. She wants her sister to learn too. Her family story is fictional.'
      : 'I asked Sari to take shelter. She closed the batik shop and carried her canting; her sister still needed help at the courtyard.',
    choice === 'testimony' ? 'Sari belajar membatik dari ibunya: malam panas menutup bagian kain agar tidak terkena warna. Ia ingin mengajari adiknya. Kisah keluarga Sari adalah fiksi.' : 'Aku meminta Sari berlindung. Ia menutup toko batiknya dan membawa canting. Ia hendak mengajari adiknya; kain tanpa pembuatnya tidak cukup.'));
    s.stage = 'bridge';
    return response(true, choice === 'warn' ? 'Sari closes the shop. Find the bridge.' : 'Her account is in your notebook. Find the bridge.', choice === 'warn' ? 'Sari menutup toko. Temukan jembatan.' : 'Kesaksiannya tersimpan. Temukan jembatan.');
  }
  if ((id === 'photo' || id === 'bridge') && s.stage === 'bridge') {
    s.flags.photographed = true;
    note(s, entry('bridge', 'seen', 'I photographed the red bridge and the river below it. A frame records what was visible, not everything that happened.', 'Aku memotret jembatan merah dan sungai di bawahnya. Bingkai hanya merekam yang tampak, bukan seluruh kejadian.'));
    s.stage = 'damar';
    return response(true, 'Photograph secured. Damar is across the river.', 'Foto tersimpan. Damar berada di seberang sungai.');
  }
  if (id === 'damar' && s.stage === 'damar') {
    s.flags.metDamar = true;
    note(s, entry('damar', 'told', 'Damar asked for Sari’s batik roll at the market. She has her canting; the cloth is still missing. He will meet us at the south courtyard.', 'Damar meminta gulungan kain Sari di pasar. Canting sudah dibawa Sari; gulungan kainnya masih tertinggal. Ia menunggu di halaman selatan.'));
    s.stage = 'parcel';
    return response(true, 'Find the cloth-wrapped parcel at the market.', 'Ambil gulungan batik Sari di pasar.');
  }
  if (id === 'parcel' && s.stage === 'parcel') {
    s.flags.parcel = true;
    note(s, entry('street', 'seen', 'I collected Sari’s batik roll. Wax resists dye to make the pattern. Its makers and their knowledge matter beyond this one cloth.', 'Aku mengambil gulungan kain Sari. Polanya dibuat dengan perintang warna; keluarga dan keterampilannya lebih berarti daripada selembar kain.'));
    s.pendingImpact = 'north'; s.dangerTime = 0; s.event = 'warning'; s.eventTime = 0; s.stage = 'shelter';
    return response(true, 'Impact! Return across the bridge. Use the doorways for cover.', 'Benturan! Kembali melintasi jembatan. Berlindunglah di ambang pintu.');
  }
  if ((id === 'shelter' || id === 'cart') && s.stage === 'shelter') {
    if (s.helpProgress < 1) return response(false, 'Hold to help in the street.', 'Tahan untuk membantu di jalan.', 'hold');
    choice = id === 'cart' ? 'check' : choice;
    if (!['help', 'check'].includes(choice)) return response(false, 'Guide the family inside, or clear the street for others.', 'Bantu keluarga masuk, atau buka jalan bagi yang lain.', 'choice');
    s.choices.shelter = choice; s.flags.rescued = choice === 'help'; s.flags.shelterOpen = choice === 'help';
    s.flags.cartCleared = choice === 'check'; s.flags.safeLane = choice === 'check';
    note(s, entry('shelter', 'seen', choice === 'help'
      ? 'I supported the cloth as the family reached the courtyard. Sari can teach her sister again: patterns can be made when someone teaches. The street remained obstructed.'
      : 'I moved the abandoned cart and left a passage open. I could not stay to bring the family inside.',
    choice === 'help' ? 'Aku menopang bungkusan saat keluarga itu masuk halaman. Sari masih bisa mengajari adiknya: pola dapat dibuat lagi selama ada yang mengajarkan. Jalan masih terhalang.' : 'Aku mendorong gerobak agar warga lewat. Gulungan kain kubawa ke gang bersama mereka; keluarga di pintu masih menunggu bantuan masuk.'));
    s.stage = 'handoff';
    note(s, entry('return', 'seen', 'The same street had changed: dust, closed shops and people seeking shelter. My steps were becoming unsteady.', 'Jalan yang sama telah berubah: debu, toko tertutup, orang-orang mencari perlindungan. Langkahku mulai goyah.'));
    return response(true, choice === 'help' ? 'The family is inside. Give Damar your notebook.' : 'The passage is open. Find Damar at the shelter.', choice === 'help' ? 'Keluarga itu sudah masuk. Serahkan buku catatan kepada Damar.' : 'Jalur terbuka. Temui Damar di tempat berlindung.');
  }
  if ((id === 'handoff' || id === 'damar') && s.stage === 'handoff') {
    if (!['notebook', 'page'].includes(choice)) return response(false, 'Pass the notebook, or write one last line first.', 'Serahkan buku, atau tulis satu kalimat terakhir.', 'choice');
    s.choices.handoff = choice;
    note(s, entry('wounded', 'seen', choice === 'page'
      ? 'If this reaches someone: keep their names beside their words. I have given Damar this notebook.'
      : 'I gave Damar the notebook. The people in these pages deserve to be remembered beyond the moment I saw them.',
    choice === 'page' ? 'Jika ini sampai kepada seseorang: simpan nama mereka bersama perkataan mereka. Buku ini telah kuserahkan kepada Damar.' : 'Buku catatan telah kuserahkan kepada Damar. Orang-orang dalam halaman ini patut dikenang lebih dari saat aku melihat mereka.'));
    s.flags.notebookPassed = true; s.stage = 'ending'; s.endingTime = 0;
    return response(true, 'Damar takes the notebook. Rest.', 'Damar menerima buku catatan itu. Beristirahatlah.');
  }
  return reject();
}


/** Physical assistance advances only while held, within reach and unpaused. */
export function advanceHelp(s, kind, dt, held, inReach) {
  if (!s || s.paused || s.stage !== 'shelter' || !held || !inReach || !['help','check'].includes(kind) || !Number.isFinite(dt) || dt <= 0) return false;
  if (s.helpKind !== kind) { s.helpKind = kind; s.helpProgress = 0; }
  s.helpProgress = Math.min(1, s.helpProgress + Math.min(dt,.1) / 4);
  if (s.helpProgress >= 1) return interact(s, kind === 'check' ? 'cart' : 'shelter', kind).ok;
  return false;
}
/** Warning gives time to reach solid cover; crouching in the open is not cover. */
export function resolveDanger(s, sheltered) {
  if (!s.pendingImpact) return false;
  const south = s.pendingImpact === 'south';
  note(s, entry('impact', 'heard', 'A flash, then an impact. I could not identify its cause.', 'Kilat, lalu hantaman. Aku tidak dapat memastikan penyebabnya.'));
  s.flags.impact = true; if (south) s.flags.returnImpact = true;
  s.flags.exposed ||= !sheltered;
  if (!sheltered) s.flags.clothSaved = false;
  s.pendingImpact = null; s.event = 'impact'; s.eventTime = 0;
  return south ? 'south' : 'north';
}

export function updateSession(s, dt, player) {
  if (!s || s.paused || !Number.isFinite(dt) || dt <= 0) return s;
  dt = Math.min(dt, 0.1); s.time += dt; s.eventTime += dt;
  if (s.pendingImpact) s.dangerTime += dt;
  if (s.event === 'quiet' && (s.time > 35 || (player && player.z < -12))) { s.event = 'warning'; s.eventTime = 0; }
  if (s.event === 'impact' && s.eventTime > 4) { s.event = 'aftermath'; s.eventTime = 0; }
  if (s.stage === 'ending') { s.endingTime += dt; if (s.endingTime >= 16) s.stage = 'afterword'; }
  return s;
}

const OBJECTIVES = {
  sari: ['sari', 'A city still breathing', 'Kota yang masih bergerak', 'Speak with Sari outside her shop.', 'Temui Sari yang sedang melipat batik di kiri jalan.', 'Listen', 'Dengarkan'],
  bridge: ['bridge', 'Keep a record', 'Simpan sebuah jejak', 'Photograph the bridge from its southern approach.', 'Potret jembatan dari sisi selatan.', 'Photograph', 'Potret'],
  damar: ['damar', 'Across the river', 'Di seberang sungai', 'Find Damar beyond the red bridge.', 'Temukan Damar di seberang jembatan merah.', 'Speak', 'Bicara'],
  parcel: ['parcel', 'An unfinished errand', 'Kain yang tertinggal', 'Recover the cloth-wrapped parcel at the market.', 'Ambil gulungan batik Sari di pasar utara.', 'Recover', 'Ambil'],
  shelter: ['shelter', 'Find shelter', 'Cari perlindungan', 'Return south. Help the family or clear the cart from the lane.', 'Kembali lewat jembatan. Tahan Bantu di pintu kiri, atau dorong gerobak di gang.', 'Help', 'Bantu'],
  handoff: ['handoff', 'What remains', 'Yang tertinggal', 'Find Damar at the shelter. Preserve the notebook.', 'Temui Damar di tempat berlindung. Selamatkan buku catatan.', 'Pass notebook', 'Serahkan buku'],
  ending: ['handoff', 'The unfinished account', 'Catatan yang tertinggal', 'Damar carries your words onward.', 'Damar membawa catatanmu melanjutkan perjalanan.', 'Rest', 'Istirahat'],
  afterword: ['handoff', 'Beyond one account', 'Di luar satu catatan', 'Read the historical afterword and your surviving notebook.', 'Baca catatan sejarah dan buku yang terselamatkan.', 'Read', 'Baca'],
};
export function getObjective(s) {
  const data = OBJECTIVES[s?.stage] ?? OBJECTIVES.sari;
  const [id, en, idText, description, descriptionId, verbEn, verbId] = data;
  return { id, ...TARGETS[id], en, idText, description, descriptionId, verb: { en: verbEn, id: verbId } };
}

const stages = new Set(Object.keys(OBJECTIVES));
const events = new Set(['quiet', 'warning', 'impact', 'aftermath']);
const flagKeys = Object.keys(createSession().flags);
const entryIds = new Set(['arrival', 'sari', 'bridge', 'damar', 'street', 'impact', 'shelter', 'return', 'wounded']);
export function saveSession(session, player) {
  return JSON.stringify({ session, ...(player ? { player } : {}) });
}
/** Returns null for invalid/unknown data, otherwise {session, player?}.
 * Saved text is never rendered as HTML. Restore is bounded and schema-based.
 */
export function loadSession(raw) {
  try {
    if (typeof raw !== 'string' || raw.length > 12_000_000) return null;
    const payload = JSON.parse(raw), src = payload.session ?? payload;
    if (!src || ![3,4].includes(src.version) || !stages.has(src.stage) || !events.has(src.event)) return null;
    if (!Array.isArray(src.entries) || src.entries.length > 9 || !src.flags || !src.choices) return null;
    const s = createSession(); s.stage = src.stage; s.event = src.event;
    s.time = clamp(finite(src.time), 0, 1_000_000); s.eventTime = clamp(finite(src.eventTime), 0, 1_000_000);
    s.helpProgress = clamp(finite(src.helpProgress), 0, 1);
    s.helpKind = ['help','check'].includes(src.helpKind) ? src.helpKind : null;
    s.pendingImpact = ['north','south'].includes(src.pendingImpact) ? src.pendingImpact : null;
    s.dangerTime = clamp(finite(src.dangerTime), 0, 7);
    s.endingTime = clamp(finite(src.endingTime), 0, 16); s.paused = false;
    for (const key of flagKeys) s.flags[key] = key === 'clothSaved' ? src.flags[key] !== false : src.flags[key] === true;
    for (const [key, values] of Object.entries({ sari: ['testimony', 'warn'], shelter: ['help', 'check'], handoff: ['notebook', 'page'] })) {
      if (src.choices[key] !== undefined && !values.includes(src.choices[key])) return null;
      if (values.includes(src.choices[key])) s.choices[key] = src.choices[key];
    }
    const seen = new Set(); s.entries = [];
    for (const e of src.entries) {
      if (!e || !entryIds.has(e.id) || seen.has(e.id) || !['seen', 'heard', 'told'].includes(e.type) || typeof e.en !== 'string' || typeof e.idText !== 'string') return null;
      if (e.en.length > 2000 || e.idText.length > 2000) return null;
      seen.add(e.id); s.entries.push({ id: e.id, type: e.type, en: e.en, idText: e.idText, time: clamp(finite(e.time), 0, 1_000_000) });
    }
    s.photographs = Array.isArray(src.photographs) ? src.photographs.slice(0, 3).filter(p => typeof p === 'string' && /^data:image\/(?:jpeg|png);base64,/.test(p) && p.length < 3_500_000) : [];
    // A handoff is final: no save can resume writing after it.
    if (s.flags.notebookPassed && !['ending', 'afterword'].includes(s.stage)) return null;
    const result = { session: s };
    if (payload.player && Number.isFinite(payload.player.x) && Number.isFinite(payload.player.z)) {
      const p = createPlayer(payload.player); p.stamina = clamp(finite(payload.player.stamina, 1), 0, 1); p.distance = clamp(finite(payload.player.distance), 0, 1_000_000); result.player = p;
    }
    return result;
  } catch { return null; }
}
