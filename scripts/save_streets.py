import bpy
import json
from pathlib import Path

root = Path(r"C:\Users\fauzi\OneDrive\Desktop\Budayago")
out = root / "output" / "working"
out.mkdir(parents=True, exist_ok=True)

blend_path = out / "streets-01.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

# Create inventory
inventory = {
    "schema_version": 1,
    "operation_id": "streets-01",
    "scene": str(blend_path),
    "objects": len(bpy.data.objects),
    "meshes": len(bpy.data.meshes),
    "materials": len(bpy.data.materials),
    "collections": [c.name for c in bpy.data.collections]
}
inv_path = out / "streets-01.inventory.json"
with open(inv_path, 'w') as f:
    json.dump(inventory, f, indent=2)
print(f"Saved {blend_path} and {inv_path}")
