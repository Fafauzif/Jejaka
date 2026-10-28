import test from "node:test";
import assert from "node:assert/strict";
import { beats } from "../story.js";
import { newState, record, restore, persist, endingAccount } from "../state.js";
test("complete story schema, all beats and choices bilingual", () => {
  assert.equal(beats.length, 11);
  assert.equal(new Set(beats.map((b) => b.id)).size, 11);
  assert.ok(beats.reduce((s, b) => s + b.duration, 0) >= 600);
  for (const b of beats) {
    assert.equal(b.position.length, 2);
    assert.ok(b.description && b.descriptionEn);
    if (b.recordable !== false) assert.ok(b.note && b.noteEn);
    for (const c of b.choices || [])
      assert.ok(c.label && c.labelEn && c.note && c.noteEn);
  }
});
test("recording is idempotent, choice persists and changes account", () => {
  let s = newState();
  for (const b of beats) s = record(s, b, b.choices?.[0].id);
  assert.equal(s.entries.length, 9);
  assert.equal(record(s, beats[0]).entries.length, 9);
  assert.equal(s.choices.shelter, "help");
  assert.match(endingAccount(s).en, /make room/);
  const alternate = {
    ...s,
    choices: { sari: "place", shelter: "check", wounded: "page" },
  };
  assert.match(endingAccount(alternate).en, /checked the street/);
  assert.notEqual(endingAccount(s).id, endingAccount(alternate).id);
});
test("invalid choice cannot silently advance", () =>
  assert.throws(() => record(newState(), beats[1], "invalid")));
test("restore rejects malformed or incompatible saves", () => {
  for (const v of [
    "bad",
    "null",
    "{}",
    JSON.stringify({ ...newState(), chapter: 99 }),
    JSON.stringify({ ...newState(), version: 2 }),
  ])
    assert.equal(restore(v, beats), null);
});
test("restore strips invalid entries/choices and duplicates", () => {
  const s = {
    ...newState(),
    entries: [
      { id: "arrival", text: "a", textEn: "b" },
      { id: "arrival", text: "a", textEn: "b" },
      { id: "unknown", text: "x", textEn: "y" },
    ],
    choices: { sari: "bad" },
  };
  const r = restore(JSON.stringify(s), beats);
  assert.equal(r.entries.length, 1);
  assert.deepEqual(r.choices, {});
});
test("storage failure does not crash gameplay", () =>
  assert.equal(
    persist(
      {
        setItem() {
          throw Error("denied");
        },
      },
      newState(),
    ),
    false,
  ));
test("full save roundtrip keeps records and choices", () => {
  let s = newState();
  s = record(s, beats[1], "testimony");
  s.chapter = 2;
  assert.deepEqual(restore(JSON.stringify(s), beats), s);
});

test("curatorial afterword and final view never become diary entries", () => {
  for (const b of beats.filter((b) => b.recordable === false))
    assert.equal(record(newState(), b).entries.length, 0);
});
test("all eight choice combinations survive and produce distinct accounts", () => {
  const results = new Set();
  for (const a of ["testimony", "place"])
    for (const b of ["help", "check"])
      for (const c of ["notebook", "page"]) {
        let s = newState();
        s = record(
          s,
          beats.find((x) => x.id === "sari"),
          a,
        );
        s = record(
          s,
          beats.find((x) => x.id === "shelter"),
          b,
        );
        s = record(
          s,
          beats.find((x) => x.id === "wounded"),
          c,
        );
        const saved = restore(JSON.stringify(s), beats);
        results.add(endingAccount(saved).id);
      }
  assert.equal(results.size, 8);
});
