# Rules to preserve in the project entry instructions

These are the runtime rules to incorporate into the root `AGENTS.md` and start
prompt. This fragment is a reference, not a second hidden source of authority.

1. Read the project state and run `palagan_state.py reconcile` on first launch,
   after compaction and after any interruption. Inspect Blender's actual scene.
2. Initialise missing progress using `palagan_state.py init`. Do not fabricate
   a completed state or a scene path.
3. One active operation at a time. Record `begin` before mutations. Save unique
   outputs, inspect them, then `complete --scene ...` with the actual checks.
4. Update `NEXT_STEPS.md` and decisions at every meaningful boundary. Avoid
   storing essential decisions only in conversation.
5. Never infer a failed operation from missing chat context. Pending work may
   already exist in the scene. Reconcile by stable asset IDs before rerunning.
6. Never reset Blender or delete unrelated objects. Use owned collections and
   stable tags. Preserve the open user's scene and existing files.
7. Never state visual verification occurred unless the model actually inspected
   the relevant image/view. Inventories and successful tool calls are different
   checks.
8. Source IDs and assumptions belong on model assets and in the evidence
   manifest. A schema passing is not proof of historical accuracy.
9. Do not install a compaction plugin until the local OpenCode version's contract
   has been checked. Recovery must work even without the optional plugin.
10. Before delivery, reopen the saved `.blend`, check external asset paths,
    inspect required views and record unperformed checks.
