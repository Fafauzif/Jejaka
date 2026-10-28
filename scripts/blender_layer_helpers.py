"""Minimal non-destructive bpy patterns for agent-authored district scripts.

Load in Blender. These helpers contain no invented historical geometry.
"""
import json
import re
import bpy

OWNER = "PALAGAN_SURABAYA_V1"
ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$")


def ensure_collection(layer):
    if not ID.fullmatch(layer):
        raise ValueError("Use a short stable layer ID")
    root_name = "PALAGAN_SURABAYA"
    root = bpy.data.collections.get(root_name)
    if root is not None and root.get("palagan_owner") != OWNER:
        raise ValueError("Collection name belongs to existing user data: " + root_name)
    if root is None:
        root = bpy.data.collections.new(root_name)
        root["palagan_owner"] = OWNER
        bpy.context.scene.collection.children.link(root)
    elif root.name not in bpy.context.scene.collection.children:
        raise ValueError("PALAGAN root exists outside the active scene; inspect before linking")
    name = "PALAGAN_" + layer
    collection = bpy.data.collections.get(name)
    if collection is not None and collection.get("palagan_owner") != OWNER:
        raise ValueError("Collection name collision: " + name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        collection["palagan_owner"] = OWNER
        collection["palagan_layer"] = layer
        root.children.link(collection)
    elif collection.name not in root.children:
        raise ValueError("Layer exists under another parent; inspect before editing")
    return collection


def tag_asset(obj, asset_id, layer, source_ids, evidence_status, assumption=""):
    if not ID.fullmatch(asset_id) or not ID.fullmatch(layer):
        raise ValueError("Invalid stable asset/layer ID")
    if evidence_status not in {"documented", "reconstructed", "unknown", "hypothetical"}:
        raise ValueError("Explicit evidence status is required")
    if not isinstance(source_ids, (list, tuple)) or any(not isinstance(item, str) for item in source_ids):
        raise TypeError("source_ids must be a list of source ID strings")
    if evidence_status == "documented" and not source_ids:
        raise ValueError("Documented assets need at least one source ID")
    if obj.get("palagan_owner") not in {None, OWNER}:
        raise ValueError("Object is owned by another project")
    obj["palagan_owner"] = OWNER
    obj["palagan_asset_id"] = asset_id
    obj["palagan_layer"] = layer
    obj["palagan_source_ids_json"] = json.dumps(list(source_ids))
    obj["palagan_evidence_status"] = evidence_status
    obj["palagan_assumption"] = assumption


def upsert_mesh(asset_id, layer, vertices, faces, source_ids, evidence_status, assumption=""):
    """Replace only the mesh data of one specifically owned asset.

    Provide mesh coordinates from the approved spatial/asset brief. No source
    means no claim of documentation. Existing object transforms are preserved.
    Existing modifiers remain: inspect them before replacing topology.
    """
    if not ID.fullmatch(asset_id):
        raise ValueError("Invalid asset ID")
    collection = ensure_collection(layer)
    name = "PALAGAN_" + asset_id
    obj = bpy.data.objects.get(name)
    if obj is not None:
        if obj.get("palagan_owner") != OWNER or obj.get("palagan_asset_id") != asset_id or obj.type != "MESH":
            raise ValueError("Object name collision or type mismatch: " + name)
        if obj.get("palagan_layer") != layer:
            raise ValueError("Layer mismatch: inspect the asset before moving it")
    mesh = bpy.data.meshes.new(name + "_mesh")
    try:
        mesh.from_pydata(vertices, [], faces)
        mesh.validate(verbose=False)
        mesh.update()
        if obj is None:
            obj = bpy.data.objects.new(name, mesh)
            collection.objects.link(obj)
        else:
            previous = obj.data
            materials = list(previous.materials)
            obj.data = mesh
            for material in materials:
                mesh.materials.append(material)
            if previous.users == 0:
                bpy.data.meshes.remove(previous)
        tag_asset(obj, asset_id, layer, source_ids, evidence_status, assumption)
        return obj
    except Exception:
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
        raise
