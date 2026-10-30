export const SAVE_KEY = "jejaka.account.v1";
export function newState() {
  return { version: 1, chapter: 0, entries: [], choices: {}, completed: false };
}
export function restore(raw, beats) {
  try {
    const v = JSON.parse(raw);
    if (
      v?.version !== 1 ||
      !Number.isInteger(v.chapter) ||
      v.chapter < 0 ||
      v.chapter >= beats.length ||
      !Array.isArray(v.entries)
    )
      return null;
    const ids = new Set(
      beats.filter((b) => b.recordable !== false).map((b) => b.id),
    );
    return {
      ...newState(),
      chapter: v.chapter,
      completed: v.completed === true,
      choices: Object.fromEntries(
        Object.entries(v.choices || {}).filter(([id, choice]) =>
          beats.find((b) => b.id === id)?.choices?.some((c) => c.id === choice),
        ),
      ),
      entries: v.entries
        .filter(
          (e) =>
            e &&
            ids.has(e.id) &&
            typeof e.text === "string" &&
            typeof e.textEn === "string",
        )
        .filter((e, i, a) => a.findIndex((x) => x.id === e.id) === i)
        .map((e) => ({
          id: e.id,
          title: String(e.title || ""),
          text: e.text,
          textEn: e.textEn,
          ...(typeof e.photo === "string" &&
          e.photo.startsWith("data:image/jpeg;base64,")
            ? { photo: e.photo }
            : {}),
        })),
    };
  } catch {
    return null;
  }
}
export function record(state, beat, choiceId, photo) {
  if (beat.recordable === false) return state;
  if (state.entries.some((e) => e.id === beat.id)) return state;
  const choice = beat.choices?.find((c) => c.id === choiceId);
  if (beat.choices && !choice)
    throw Error("Choose one of the available actions.");
  const entry = {
    id: beat.id,
    title: beat.title,
    text: choice?.note || beat.note,
    textEn: choice?.noteEn || beat.noteEn,
  };
  if (photo) entry.photo = photo;
  return {
    ...state,
    entries: [...state.entries, entry],
    choices: choice
      ? { ...state.choices, [beat.id]: choice.id }
      : { ...state.choices },
  };
}
export function persist(storage, state) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
export function endingAccount(state) {
  const testimony = state.choices.sari === "testimony";
  const help = state.choices.shelter === "help";
  const message = state.choices.wounded === "page";
  return {
    id: `Damar membawa buku Raka. ${testimony ? "Di dalamnya, ia menemukan ucapan Sari tentang keluarga yang belum pulang." : "Di dalamnya, ia menemukan catatan pertemuannya dengan Sari di dekat jembatan."} ${help ? "Sebelum kembali ke sungai, Raka sempat membantu memberi ruang bagi seorang warga untuk berteduh." : "Sebelum kembali ke sungai, Raka sempat memeriksa jalan dari tempat berteduh."} ${message ? "Di halaman depan tertulis: “Nama dan ucapan di dalam ini belum lengkap.”" : "Raka meminta Damar menjaga halaman-halamannya."}`,
    en: `Damar carries Raka’s notebook. ${testimony ? "Inside, he finds Sari’s words about families still waiting for someone to come home." : "Inside, he finds an account of meeting Sari near the bridge."} ${help ? "Before returning to the river, Raka helped make room for another resident to take shelter." : "Before returning to the river, Raka checked the street from shelter."} ${message ? "The first page reads: “The names and accounts here are incomplete.”" : "Raka asked Damar to keep the pages together."}`,
  };
}
