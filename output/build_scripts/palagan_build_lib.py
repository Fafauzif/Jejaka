"""PALAGAN shared Blender construction helpers (Blender 5.2).

Run inside Blender only. The module contains no scene mutation at import time.
All geometry is authored in metres; local +X image-east, +Y image-north, +Z up.
"""
from __future__ import annotations

import json
import math
import random
from pathlib import Path

import bpy
from mathutils import Vector
from mathutils.geometry import tessellate_polygon

OWNER = "PALAGAN_SURABAYA_V1"
ROOT_NAME = "PALAGAN_SURABAYA"


# ---------------------------------------------------------------------------
# collection / ownership helpers
# ---------------------------------------------------------------------------

def ensure_collection(layer):
    root = bpy.data.collections.get(ROOT_NAME)
    if root is None:
        root = bpy.data.collections.new(ROOT_NAME)
        root["palagan_owner"] = OWNER
        bpy.context.scene.collection.children.link(root)
    if root.get("palagan_owner") != OWNER:
        raise RuntimeError("PALAGAN root collection is not project-owned")
    name = "PALAGAN_" + layer
    coll = bpy.data.collections.get(name)
    if coll is not None and coll.get("palagan_owner") != OWNER:
        raise RuntimeError("Collection name collision: " + name)
    if coll is None:
        coll = bpy.data.collections.new(name)
        coll["palagan_owner"] = OWNER
        coll["palagan_layer"] = layer
        root.children.link(coll)
    return coll


def layer_collection(layer):
    return bpy.data.collections.get("PALAGAN_" + layer)


def clear_owned_layer(layer, asset_prefix=None):
    """Remove only project-owned objects in one layer, optionally by ID prefix."""
    coll = layer_collection(layer)
    if coll is None:
        return []
    removed = []
    for obj in list(coll.objects):
        if obj.get("palagan_owner") != OWNER:
            continue
        if asset_prefix and not str(obj.get("palagan_asset_id", "")).startswith(asset_prefix):
            continue
        data = obj.data if obj.type == "MESH" else None
        removed_name = obj.name
        bpy.data.objects.remove(obj, do_unlink=True)
        if data is not None and data.users == 0:
            bpy.data.meshes.remove(data)
        removed.append(removed_name)
    return removed


def tag_object(obj, asset_id, layer, source_ids, evidence_status, assumption="", extra=None):
    if evidence_status not in {"documented", "reconstructed", "unknown", "hypothetical"}:
        raise ValueError("Bad evidence status: " + evidence_status)
    obj["palagan_owner"] = OWNER
    obj["palagan_asset_id"] = asset_id
    obj["palagan_layer"] = layer
    obj["palagan_source_ids_json"] = json.dumps(list(source_ids))
    obj["palagan_evidence_status"] = evidence_status
    obj["palagan_assumption"] = assumption
    if extra:
        for key, value in extra.items():
            obj[key] = value
    return obj


# ---------------------------------------------------------------------------
# mesh construction
# ---------------------------------------------------------------------------

class MeshBuilder:
    def __init__(self, name):
        self.name = name
        self.verts = []
        self.faces = []
        self.face_mats = []
        self.uvs = []  # per-face list of (u,v)

    def _v(self, p):
        self.verts.append((float(p[0]), float(p[1]), float(p[2])))
        return len(self.verts) - 1

    def add_quad(self, p0, p1, p2, p3, mat=0, uv=None):
        i0, i1, i2, i3 = (self._v(p) for p in (p0, p1, p2, p3))
        self.faces.append((i0, i1, i2, i3))
        self.face_mats.append(int(mat))
        if uv is None:
            a, b, c = Vector(p0), Vector(p1), Vector(p2)
            n = (b - a).cross(c - a)
            if abs(n.x) >= max(abs(n.y), abs(n.z)):
                uv = [(p[1], p[2]) for p in (p0, p1, p2, p3)]
            elif abs(n.y) >= abs(n.z):
                uv = [(p[0], p[2]) for p in (p0, p1, p2, p3)]
            else:
                uv = [(p[0], p[1]) for p in (p0, p1, p2, p3)]
        self.uvs.append([(float(u), float(v)) for u, v in uv])

    def add_tri(self, p0, p1, p2, mat=0, uv=None):
        i0, i1, i2 = (self._v(p) for p in (p0, p1, p2))
        self.faces.append((i0, i1, i2))
        self.face_mats.append(int(mat))
        if uv is None:
            a, b, c = Vector(p0), Vector(p1), Vector(p2)
            n = (b - a).cross(c - a)
            if abs(n.x) >= max(abs(n.y), abs(n.z)):
                uv = [(p[1], p[2]) for p in (p0, p1, p2)]
            elif abs(n.y) >= abs(n.z):
                uv = [(p[0], p[2]) for p in (p0, p1, p2)]
            else:
                uv = [(p[0], p[1]) for p in (p0, p1, p2)]
        self.uvs.append([(float(u), float(v)) for u, v in uv])

    def add_box(self, center, size, mat=0, wall_uv=None):
        cx, cy, cz = map(float, center)
        sx, sy, sz = (abs(float(v)) for v in size)
        x0, x1 = cx - sx / 2, cx + sx / 2
        y0, y1 = cy - sy / 2, cy + sy / 2
        z0, z1 = cz - sz / 2, cz + sz / 2
        p = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
             (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
        self.add_quad(p[0], p[3], p[2], p[1], mat)
        self.add_quad(p[4], p[5], p[6], p[7], mat)
        self.add_quad(p[0], p[1], p[5], p[4], mat)
        self.add_quad(p[2], p[3], p[7], p[6], mat)
        self.add_quad(p[3], p[0], p[4], p[7], mat)
        self.add_quad(p[1], p[2], p[6], p[5], mat)

    def add_ngon(self, points, mat=0, z=None):
        pts = [Vector((p[0], p[1], p[2] if z is None else z)) for p in points]
        if len(pts) < 3:
            return
        normal = (pts[1] - pts[0]).cross(pts[2] - pts[0])
        order = list(range(len(pts)))
        if normal.z < 0:
            order.reverse()
        tris = tessellate_polygon([[pts[i] for i in order]])
        for tri in tris:
            if all(isinstance(item, int) for item in tri):
                # Blender 5.2 may return indices into the supplied point list.
                idx = [order[item] for item in tri]
            else:
                idx = [next(i for i, p in enumerate(pts) if (p - q).length < 1e-9) for q in tri]
            self.add_tri(pts[idx[0]], pts[idx[1]], pts[idx[2]], mat)

    def add_gable_roof(self, x0, x1, y0, y1, eave_z, rise, mat, gable_mat, overhang=0.55,
                       ridge_axis="x"):
        """Pitched roof with ridge along x or y; roof UV follows eave/ridge direction."""
        if ridge_axis == "x":
            xa, xb = x0 - overhang, x1 + overhang
            ya, yb = y0 - overhang, y1 + overhang
            ymid = (ya + yb) / 2
            zr = eave_z + rise
            # two slopes
            self.add_quad((xa, ya, eave_z), (xb, ya, eave_z), (xb, ymid, zr), (xa, ymid, zr), mat,
                          uv=[(xa, 0), (xb, 0), (xb, rise), (xa, rise)])
            self.add_quad((xb, yb, eave_z), (xa, yb, eave_z), (xa, ymid, zr), (xb, ymid, zr), mat,
                          uv=[(xb, 0), (xa, 0), (xa, rise), (xb, rise)])
            # gable ends (outward winding: -X at x0, +X at x1)
            self.add_tri((x0, y1, eave_z), (x0, y0, eave_z), (x0, (y0 + y1) / 2, zr), gable_mat)
            self.add_tri((x1, y0, eave_z), (x1, y1, eave_z), (x1, (y0 + y1) / 2, zr), gable_mat)
        else:
            xa, xb = x0 - overhang, x1 + overhang
            ya, yb = y0 - overhang, y1 + overhang
            xmid = (xa + xb) / 2
            zr = eave_z + rise
            self.add_quad((xa, yb, eave_z), (xa, ya, eave_z), (xmid, ya, zr), (xmid, yb, zr), mat,
                          uv=[(yb, 0), (ya, 0), (ya, rise), (yb, rise)])
            self.add_quad((xb, ya, eave_z), (xb, yb, eave_z), (xmid, yb, zr), (xmid, ya, zr), mat,
                          uv=[(ya, 0), (yb, 0), (yb, rise), (ya, rise)])
            self.add_tri((x0, y0, eave_z), (x1, y0, eave_z), ((x0 + x1) / 2, y0, zr), gable_mat)
            self.add_tri((x1, y1, eave_z), (x0, y1, eave_z), ((x0 + x1) / 2, y1, zr), gable_mat)

    def add_hip_roof(self, x0, x1, y0, y1, eave_z, rise, mat, overhang=0.55, ridge_ratio=0.55):
        xa, xb = x0 - overhang, x1 + overhang
        ya, yb = y0 - overhang, y1 + overhang
        zr = eave_z + rise
        half = (yb - ya) * ridge_ratio * 0.5
        ymid = (ya + yb) / 2
        self.add_quad((xa, ya, eave_z), (xb, ya, eave_z), (xb, ymid + half, zr), (xa, ymid + half, zr), mat,
                      uv=[(xa, 0), (xb, 0), (xb, rise), (xa, rise)])
        self.add_quad((xb, yb, eave_z), (xa, yb, eave_z), (xa, ymid - half, zr), (xb, ymid - half, zr), mat,
                      uv=[(xb, 0), (xa, 0), (xa, rise), (xb, rise)])
        self.add_quad((xa, yb, eave_z), (xa, ya, eave_z), (xa, ymid + half, zr), (xa, ymid - half, zr), mat,
                      uv=[(ya, 0), (yb, 0), (yb, rise), (ya, rise)])
        self.add_quad((xb, ya, eave_z), (xb, yb, eave_z), (xb, ymid - half, zr), (xb, ymid + half, zr), mat,
                      uv=[(yb, 0), (ya, 0), (ya, rise), (yb, rise)])

    def add_cylinder(self, center, radius, height, mat=0, segments=10, axis="Z", cap=True):
        cx, cy, cz = map(float, center)
        r = float(radius)
        hgt = float(height)
        ring0, ring1 = [], []
        for i in range(segments):
            a = 2 * math.pi * i / segments
            u, v = r * math.cos(a), r * math.sin(a)
            if axis == "Z":
                p0 = (cx + u, cy + v, cz - hgt / 2)
                p1 = (cx + u, cy + v, cz + hgt / 2)
            elif axis == "X":
                p0 = (cx - hgt / 2, cy + u, cz + v)
                p1 = (cx + hgt / 2, cy + u, cz + v)
            else:
                p0 = (cx + u, cy - hgt / 2, cz + v)
                p1 = (cx + u, cy + hgt / 2, cz + v)
            ring0.append(self._v(p0))
            ring1.append(self._v(p1))
        for i in range(segments):
            j = (i + 1) % segments
            self.faces.append((ring0[i], ring0[j], ring1[j], ring1[i]))
            self.face_mats.append(int(mat))
            self.uvs.append([(i / segments, 0), ((i + 1) / segments, 0),
                             ((i + 1) / segments, 1), (i / segments, 1)])
        if cap:
            self.faces.append(tuple(reversed(ring0)))
            self.face_mats.append(int(mat))
            self.uvs.append([(i / segments, 0) for i in range(segments)])
            self.faces.append(tuple(ring1))
            self.face_mats.append(int(mat))
            self.uvs.append([(i / segments, 1) for i in range(segments)])

    def add_arch(self, center, width, height, depth, mat, facing="+Y", segments=10, band=0.35):
        """Semicircular arch ring (two piers + curved band) extruded in depth."""
        cx, cy, cz = center
        r = width / 2.0
        spring = cz + height - r
        # rectangular piers under spring
        self.add_box((cx - r + band / 2, cy, (cz + spring) / 2), (band, depth, spring - cz), mat)
        self.add_box((cx + r - band / 2, cy, (cz + spring) / 2), (band, depth, spring - cz), mat)
        # arch ring segments
        for i in range(segments):
            a0 = math.pi * i / segments
            a1 = math.pi * (i + 1) / segments
            ro = r
            ri = r - band
            outer0 = (cx + ro * math.cos(a0), spring + ro * math.sin(a0))
            outer1 = (cx + ro * math.cos(a1), spring + ro * math.sin(a1))
            inner0 = (cx + ri * math.cos(a0), spring + ri * math.sin(a0))
            inner1 = (cx + ri * math.cos(a1), spring + ri * math.sin(a1))
            y0 = cy - depth / 2
            y1 = cy + depth / 2
            self.add_quad((outer0[0], y0, outer0[1]), (outer1[0], y0, outer1[1]),
                          (inner1[0], y0, inner1[1]), (inner0[0], y0, inner0[1]), mat)
            self.add_quad((outer0[0], y1, outer0[1]), (inner0[0], y1, inner0[1]),
                          (inner1[0], y1, inner1[1]), (outer1[0], y1, outer1[1]), mat)
            self.add_quad((outer0[0], y0, outer0[1]), (outer0[0], y1, outer0[1]),
                          (outer1[0], y1, outer1[1]), (outer1[0], y0, outer1[1]), mat)
            self.add_quad((inner1[0], y0, inner1[1]), (inner1[0], y1, inner1[1]),
                          (inner0[0], y1, inner0[1]), (inner0[0], y0, inner0[1]), mat)

    def finish(self, collection, materials, name=None, asset_id=None, layer=None,
               source_ids=("M001",), evidence_status="reconstructed", assumption="",
               bevel=None, extra=None, smooth=False):
        mesh = bpy.data.meshes.new((name or self.name) + "_mesh")
        mesh.from_pydata(self.verts, [], self.faces)
        mesh.validate(verbose=False)
        mesh.update()
        if len(self.uvs) == len(mesh.polygons):
            uv_layer = mesh.uv_layers.new(name="UVMap")
            for poly, uvs in zip(mesh.polygons, self.uvs):
                for li, (u, v) in zip(poly.loop_indices, uvs):
                    uv_layer.data[li].uv = (u, v)
        for mat in materials:
            mesh.materials.append(mat)
        for poly, mi in zip(mesh.polygons, self.face_mats):
            poly.material_index = min(mi, max(0, len(materials) - 1))
        if smooth:
            for poly in mesh.polygons:
                poly.use_smooth = True
        obj = bpy.data.objects.new(name or self.name, mesh)
        collection.objects.link(obj)
        if asset_id:
            tag_object(obj, asset_id, layer or collection.get("palagan_layer", "BACKGROUND"),
                       source_ids, evidence_status, assumption, extra)
        if bevel:
            mod = obj.modifiers.new("EdgeBevel", "BEVEL")
            mod.width = float(bevel)
            mod.segments = 2
            mod.limit_method = "ANGLE"
            mod.angle_limit = math.radians(40)
        return obj


# ---------------------------------------------------------------------------
# geometry helpers
# ---------------------------------------------------------------------------

def offset_polyline(points, distance):
    """Offset a 2D polyline by signed distance (left positive)."""
    pts = [Vector((p[0], p[1])) for p in points]
    seg_normals = []
    for a, b in zip(pts, pts[1:]):
        d = b - a
        if d.length < 1e-9:
            seg_normals.append(Vector((0, 0)))
            continue
        n = Vector((d.y, -d.x)).normalized()
        seg_normals.append(n)
    out = []
    for i, p in enumerate(pts):
        if i == 0:
            n = seg_normals[0]
        elif i == len(pts) - 1:
            n = seg_normals[-1]
        else:
            n = (seg_normals[i - 1] + seg_normals[i])
            if n.length < 1e-9:
                n = seg_normals[i]
            n.normalize()
        out.append((p.x + n.x * distance, p.y + n.y * distance))
    return out


def ribbon(builder, points, width, z, mat, lateral_offset=0.0, uv_scale=0.25):
    """Flat ribbon along a polyline, using averaged mitre normals."""
    if len(points) < 2:
        return
    left = offset_polyline(points, lateral_offset + width / 2)
    right = offset_polyline(points, lateral_offset - width / 2)
    for i in range(len(points) - 1):
        a0, b0 = left[i], left[i + 1]
        a1, b1 = right[i], right[i + 1]
        if (b0[0] - a0[0]) ** 2 + (b0[1] - a0[1]) ** 2 < 1e-6:
            continue
        # normal is +Z; ordered left->right for downward-facing? Use CCW seen from +Z.
        builder.add_quad((a0[0], a0[1], z), (a1[0], a1[1], z),
                         (b1[0], b1[1], z), (b0[0], b0[1], z), mat,
                         uv=[(a0[0] * uv_scale, a0[1] * uv_scale),
                             (a1[0] * uv_scale, a1[1] * uv_scale),
                             (b1[0] * uv_scale, b1[1] * uv_scale),
                             (b0[0] * uv_scale, b0[1] * uv_scale)])


def ribbon_vertical(builder, points, top_z, bottom_z, mat, outward=True):
    """Vertical wall along a polyline; outward=True makes normals face river side."""
    for i in range(len(points) - 1):
        a, b = points[i], points[i + 1]
        if outward:
            builder.add_quad((a[0], a[1], bottom_z), (b[0], b[1], bottom_z),
                             (b[0], b[1], top_z), (a[0], a[1], top_z), mat)
        else:
            builder.add_quad((b[0], b[1], bottom_z), (a[0], a[1], bottom_z),
                             (a[0], a[1], top_z), (b[0], b[1], top_z), mat)


def point_in_polygon(x, y, poly):
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i][0], poly[i][1]
        xj, yj = poly[j][0], poly[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi):
            inside = not inside
        j = i
    return inside


def dist_point_segment(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    length2 = dx * dx + dy * dy
    if length2 < 1e-12:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / length2))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def dist_to_polyline(px, py, points):
    return min(dist_point_segment(px, py, a[0], a[1], b[0], b[1]) for a, b in zip(points, points[1:]))


def polyline_length(points):
    return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(points, points[1:]))


def sample_polyline(points, distance):
    """Return (x,y,tangent angle) at arc distance."""
    d = float(distance)
    for a, b in zip(points, points[1:]):
        seg = math.hypot(b[0] - a[0], b[1] - a[1])
        if seg < 1e-9:
            continue
        if d <= seg:
            t = d / seg
            return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t,
                    math.atan2(b[1] - a[1], b[0] - a[0]))
        d -= seg
    a, b = points[-2], points[-1]
    return b[0], b[1], math.atan2(b[1] - a[1], b[0] - a[0])


def obb_corners(cx, cy, angle, width, depth):
    ca, sa = math.cos(angle), math.sin(angle)
    pts = []
    for lx, ly in ((-width / 2, 0), (width / 2, 0), (width / 2, depth), (-width / 2, depth)):
        pts.append((cx + lx * ca - ly * sa, cy + lx * sa + ly * ca))
    return pts


def box_footprint_corners(cx, cy, angle, width, depth):
    """Footprint centred in local Y (front/back symmetric)."""
    ca, sa = math.cos(angle), math.sin(angle)
    pts = []
    for lx, ly in ((-width / 2, -depth / 2), (width / 2, -depth / 2),
                   (width / 2, depth / 2), (-width / 2, depth / 2)):
        pts.append((cx + lx * ca - ly * sa, cy + lx * sa + ly * ca))
    return pts


def polygon_overlaps_obb(corners_a, corners_b):
    """Separating-axis test for two convex quads."""
    def axes(c):
        out = []
        for i in range(len(c)):
            x1, y1 = c[i]
            x2, y2 = c[(i + 1) % len(c)]
            out.append((y2 - y1, x1 - x2))
        return out
    for ax in axes(corners_a) + axes(corners_b):
        ln = math.hypot(*ax)
        if ln < 1e-9:
            continue
        ax = (ax[0] / ln, ax[1] / ln)
        pa = [p[0] * ax[0] + p[1] * ax[1] for p in corners_a]
        pb = [p[0] * ax[0] + p[1] * ax[1] for p in corners_b]
        if max(pa) < min(pb) or max(pb) < min(pa):
            return False
    return True


# ---------------------------------------------------------------------------
# materials
# ---------------------------------------------------------------------------

def make_principled_material(name, base=(0.5, 0.5, 0.5, 1), roughness=0.7, metallic=0.0,
                             texture=None, roughness_texture=None, normal_texture=None,
                             uv_scale=0.35, tint=(1, 1, 1), normal_strength=0.35):
    mat = bpy.data.materials.get(name)
    if mat is not None:
        if mat.get("palagan_owner") != OWNER:
            raise RuntimeError("Material name collision: " + name)
        return mat
    mat = bpy.data.materials.new(name)
    mat["palagan_owner"] = OWNER
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    out.location = (600, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (300, 0)
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    bsdf.inputs["Base Color"].default_value = base
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    mat.diffuse_color = base

    uv_socket = None
    if (texture or roughness_texture or normal_texture) and uv_scale != 1.0:
        coord = nodes.new("ShaderNodeTexCoord")
        coord.location = (-900, 0)
        mapping = nodes.new("ShaderNodeMapping")
        mapping.name = "UVRepeat"
        mapping.location = (-720, 0)
        mapping.inputs["Scale"].default_value = (uv_scale, uv_scale, 1)
        links.new(coord.outputs["UV"], mapping.inputs["Vector"])
        uv_socket = mapping.outputs["Vector"]
    if texture:
        tex = nodes.new("ShaderNodeTexImage")
        tex.name = "BaseColorMap"
        tex.image = bpy.data.images.load(str(texture), check_existing=True)
        tex.location = (-500, 200)
        if uv_socket:
            links.new(uv_socket, tex.inputs["Vector"])
        hue = nodes.new("ShaderNodeHueSaturation")
        hue.location = (-80, 200)
        hue.inputs["Color"].default_value = tint + (1,) if len(tint) == 3 else tint
        links.new(tex.outputs["Color"], hue.inputs["Color"])
        links.new(hue.outputs["Color"], bsdf.inputs["Base Color"])
    if roughness_texture:
        tex = nodes.new("ShaderNodeTexImage")
        tex.name = "RoughnessMap"
        tex.image = bpy.data.images.load(str(roughness_texture), check_existing=True)
        tex.image.colorspace_settings.name = "Non-Color"
        tex.location = (-500, -100)
        if uv_socket:
            links.new(uv_socket, tex.inputs["Vector"])
        links.new(tex.outputs["Color"], bsdf.inputs["Roughness"])
    if normal_texture:
        tex = nodes.new("ShaderNodeTexImage")
        tex.name = "NormalMapImage"
        tex.image = bpy.data.images.load(str(normal_texture), check_existing=True)
        tex.image.colorspace_settings.name = "Non-Color"
        tex.location = (-500, -400)
        if uv_socket:
            links.new(uv_socket, tex.inputs["Vector"])
        nm = nodes.new("ShaderNodeNormalMap")
        nm.location = (-80, -350)
        nm.inputs["Strength"].default_value = normal_strength
        links.new(tex.outputs["Color"], nm.inputs["Color"])
        links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def material_set(root):
    """Create the restrained authored palette, sharing 1K CC0 texture sets."""
    root = Path(root)
    m = {}
    plaster = root / "assets/materials/grey_plaster/grey_plaster_diff_1k.jpg"
    plaster_r = root / "assets/materials/grey_plaster/grey_plaster_rough_1k.jpg"
    plaster_n = root / "assets/materials/grey_plaster/grey_plaster_nor_gl_1k.jpg"
    brick = root / "assets/materials/brick_wall_001/brick_wall_001_diffuse_1k.jpg"
    brick_r = root / "assets/materials/brick_wall_001/brick_wall_001_rough_1k.jpg"
    brick_n = root / "assets/materials/brick_wall_001/brick_wall_001_nor_gl_1k.jpg"
    roof = root / "assets/materials/clay_roof_tiles/clay_roof_tiles_diff_1k.jpg"
    roof_r = root / "assets/materials/clay_roof_tiles/clay_roof_tiles_rough_1k.jpg"
    roof_n = root / "assets/materials/clay_roof_tiles/clay_roof_tiles_nor_gl_1k.jpg"
    wood = root / "assets/materials/dark_wooden_planks/dark_wooden_planks_diff_1k.jpg"
    wood_r = root / "assets/materials/dark_wooden_planks/dark_wooden_planks_rough_1k.jpg"
    wood_n = root / "assets/materials/dark_wooden_planks/dark_wooden_planks_nor_gl_1k.jpg"

    m["plaster_cream"] = make_principled_material(
        "MAT_PLASTER_CREAM", (0.78, 0.73, 0.62, 1), 0.82, texture=plaster,
        roughness_texture=plaster_r, normal_texture=plaster_n, tint=(1.12, 1.07, 0.94), normal_strength=0.25)
    m["plaster_white"] = make_principled_material(
        "MAT_PLASTER_WHITE", (0.85, 0.83, 0.77, 1), 0.8, texture=plaster,
        roughness_texture=plaster_r, normal_texture=plaster_n, tint=(1.22, 1.18, 1.10), normal_strength=0.22)
    m["plaster_ochre"] = make_principled_material(
        "MAT_PLASTER_OCHRE", (0.68, 0.58, 0.45, 1), 0.85, texture=plaster,
        roughness_texture=plaster_r, normal_texture=plaster_n, tint=(1.18, 0.96, 0.74), normal_strength=0.3)
    m["plaster_grey"] = make_principled_material(
        "MAT_PLASTER_GREY", (0.63, 0.62, 0.57, 1), 0.85, texture=plaster,
        roughness_texture=plaster_r, normal_texture=plaster_n, tint=(0.95, 0.95, 0.92), normal_strength=0.3)
    m["plaster_sage"] = make_principled_material(
        "MAT_PLASTER_SAGE", (0.60, 0.63, 0.55, 1), 0.84, texture=plaster,
        roughness_texture=plaster_r, normal_texture=plaster_n, tint=(0.92, 1.02, 0.88), normal_strength=0.28)
    m["brick"] = make_principled_material(
        "MAT_BRICK_WEATHERED", (0.55, 0.36, 0.28, 1), 0.88, texture=brick,
        roughness_texture=brick_r, normal_texture=brick_n, tint=(1.05, 0.88, 0.78), normal_strength=0.4)
    m["brick_dark"] = make_principled_material(
        "MAT_BRICK_DARK", (0.40, 0.28, 0.22, 1), 0.9, texture=brick,
        roughness_texture=brick_r, normal_texture=brick_n, tint=(0.78, 0.68, 0.61), normal_strength=0.4)
    m["roof_clay"] = make_principled_material(
        "MAT_ROOF_CLAY", (0.52, 0.32, 0.23, 1), 0.86, texture=roof,
        roughness_texture=roof_r, normal_texture=roof_n, tint=(0.92, 0.77, 0.66), normal_strength=0.45)
    m["roof_dark"] = make_principled_material(
        "MAT_ROOF_DARK", (0.36, 0.24, 0.19, 1), 0.9, texture=roof,
        roughness_texture=roof_r, normal_texture=roof_n, tint=(0.68, 0.58, 0.51), normal_strength=0.45)
    m["wood"] = make_principled_material(
        "MAT_WOOD_DARK", (0.22, 0.15, 0.10, 1), 0.75, texture=wood,
        roughness_texture=wood_r, normal_texture=wood_n, tint=(0.85, 0.72, 0.60), normal_strength=0.3)
    m["wood_pale"] = make_principled_material(
        "MAT_WOOD_PALE", (0.46, 0.36, 0.26, 1), 0.8, texture=wood,
        roughness_texture=wood_r, normal_texture=wood_n, tint=(1.35, 1.15, 0.92), normal_strength=0.3)
    m["stone"] = make_principled_material(
        "MAT_STONE", (0.55, 0.53, 0.47, 1), 0.84, texture=plaster,
        roughness_texture=plaster_r, normal_texture=plaster_n, tint=(0.78, 0.79, 0.75), normal_strength=0.35)
    m["stone_dark"] = make_principled_material(
        "MAT_STONE_DARK", (0.38, 0.37, 0.33, 1), 0.9, texture=plaster,
        roughness_texture=plaster_r, normal_texture=plaster_n, tint=(0.58, 0.60, 0.56), normal_strength=0.3)
    m["glass"] = make_principled_material(
        "MAT_WINDOW_DARK", (0.045, 0.055, 0.055, 1), 0.22, metallic=0.15)
    m["metal"] = make_principled_material(
        "MAT_METAL_DARK", (0.055, 0.058, 0.058, 1), 0.48, metallic=0.75)
    m["metal_rust"] = make_principled_material(
        "MAT_METAL_OXIDE", (0.072, 0.062, 0.052, 1), 0.64, metallic=0.55)
    m["canvas"] = make_principled_material(
        "MAT_CANVAS_AWNING", (0.67, 0.61, 0.48, 1), 0.9)
    m["asphalt"] = make_principled_material(
        "MAT_ROAD_ASPHALT", (0.16, 0.15, 0.135, 1), 0.93)
    m["setts"] = make_principled_material(
        "MAT_ROAD_SETTS", (0.32, 0.30, 0.26, 1), 0.9)
    m["earth"] = make_principled_material(
        "MAT_GROUND_EARTH", (0.42, 0.38, 0.30, 1), 0.95)
    m["grass"] = make_principled_material(
        "MAT_GRASS", (0.24, 0.31, 0.16, 1), 0.95)
    m["water"] = make_principled_material(
        "MAT_KALIMAS_WATER", (0.075, 0.13, 0.115, 1), 0.16, metallic=0.05)
    m["water"].node_tree.nodes.get("Principled BSDF").inputs["IOR"].default_value = 1.33
    # Subtle procedural ripple bump for water, independent of UVs.
    nt = m["water"].node_tree
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.name = "WaterRipple"
    noise.inputs["Scale"].default_value = 0.22
    noise.inputs["Detail"].default_value = 4.0
    noise.inputs["Roughness"].default_value = 0.55
    noise.location = (-500, -300)
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.12
    bump.inputs["Distance"].default_value = 0.15
    bump.location = (-200, -300)
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], nt.nodes.get("Principled BSDF").inputs["Normal"])
    m["vegetation"] = make_principled_material(
        "MAT_FOLIAGE", (0.18, 0.28, 0.12, 1), 0.9)
    m["vegetation_light"] = make_principled_material(
        "MAT_FOLIAGE_LIGHT", (0.27, 0.36, 0.16, 1), 0.9)
    m["trunk"] = make_principled_material(
        "MAT_TRUNK", (0.20, 0.15, 0.11, 1), 0.93, texture=wood,
        roughness_texture=wood_r, normal_texture=wood_n, tint=(0.72, 0.60, 0.50), normal_strength=0.3)
    return m


# ---------------------------------------------------------------------------
# scene / IO helpers
# ---------------------------------------------------------------------------

def load_layout(root):
    with open(Path(root) / "data/HISTORICAL_LAYOUT.json", encoding="utf-8") as fh:
        return json.load(fh)


def save_project_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
