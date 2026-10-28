// Run: node --test tests/test_compaction.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PalaganCompaction } from "../runtime/palagan-compaction.mjs";

test("hook injects bounded current state without unrelated content", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "palagan-hook-"));
  try {
    await mkdir(path.join(directory, "progress"));
    await writeFile(path.join(directory, "progress", "PROJECT_STATE.json"), JSON.stringify({schema_version: 1, current_stage: "blockout", active_operation: "op-1", operations: {"op-1": {id: "op-1", stage: "blockout", status: "pending", description: "Pending step", expected_outputs: ["output/a.blend"]}}, secret_unrelated: "DO_NOT_INCLUDE"}));
    const plugin = await PalaganCompaction({directory});
    const output = {context: []};
    await plugin["experimental.session.compacting"]({}, output);
    assert.match(output.context[0], /Pending is not complete/);
    assert.match(output.context[0], /op-1/);
    assert.doesNotMatch(output.context[0], /DO_NOT_INCLUDE/);
  } finally { await rm(directory, {recursive: true, force: true}); }
});

test("missing state yields recovery instructions rather than success", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "palagan-hook-"));
  try {
    const plugin = await PalaganCompaction({directory});
    const output = {context: []};
    await plugin["experimental.session.compacting"]({}, output);
    assert.match(output.context[0], /State excerpt unavailable/);
    assert.match(output.context[0], /Do not assume the scene was saved/);
  } finally { await rm(directory, {recursive: true, force: true}); }
});

test("unknown hook contract does nothing", async () => {
  const plugin = await PalaganCompaction({directory: process.cwd()});
  const output = {};
  await plugin["experimental.session.compacting"]({}, output);
  assert.deepEqual(output, {});
});
