// Optional OpenCode local plugin. No network, shell calls, or background jobs.
// Enable only after checking the installed OpenCode version's plugin API.
import { open } from "node:fs/promises";
import path from "node:path";

async function readBounded(filename, limit) {
  const file = await open(filename, "r");
  try {
    const stat = await file.stat();
    if (stat.size > limit) throw new Error("Project state exceeds the compaction read limit");
    const bytes = Buffer.alloc(stat.size);
    const { bytesRead } = await file.read(bytes, 0, bytes.length, 0);
    return bytes.subarray(0, bytesRead).toString("utf8");
  } finally {
    await file.close();
  }
}

export const PalaganCompaction = async ({ directory }) => ({
  "experimental.session.compacting": async (_input, output) => {
    if (!Array.isArray(output.context)) return;
    const instruction = "PALAGAN continuation: read AGENTS.md, progress/PROJECT_STATE.json, NEXT_STEPS.md, and relevant asset briefs. Run python scripts/palagan_state.py reconcile. Inspect Blender's actual saved filepath and owned objects before a rerun. Pending is not complete. Do not reset the user's scene or infer missing historical geometry.";
    try {
      const state = JSON.parse(await readBounded(path.join(directory, "progress", "PROJECT_STATE.json"), 262144));
      const active = state.active_operation ? state.operations?.[state.active_operation] : null;
      const compact = {
        schema_version: state.schema_version,
        current_stage: state.current_stage,
        active_operation: active ? {
          id: active.id, stage: active.stage, status: active.status,
          description: String(active.description ?? "").slice(0, 1000),
          expected_outputs: active.expected_outputs,
        } : null,
        last_checkpoint: state.last_checkpoint,
        scene_file: state.scene_file,
        updated_at: state.updated_at,
      };
      output.context.push(instruction + "\nSaved state excerpt (verify on disk):\n" + JSON.stringify(compact));
    } catch {
      output.context.push(instruction + "\nState excerpt unavailable: use the on-disk recovery procedure. Do not assume the scene was saved.");
    }
  },
});
