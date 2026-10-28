"""Fit CC0 MakeHuman topology to Jejaka's existing deformation rig.

Only mesh/UV data is reused, not MakeHuman application code. See
character_sources/README.md and LICENSE-CC0.txt for upstream provenance.
"""
from pathlib import Path
from mathutils import Vector
import bpy
SOURCES=Path(__file__).parent/'character_sources'

def read_obj(path):
    verts=[];uvs=[];faces=[];group='body'
    for line in Path(path).read_text().splitlines():
        p=line.split()
        if not p:continue
        if p[0]=='v':verts.append(Vector(tuple(map(float,p[1:4]))))
        elif p[0]=='vt':uvs.append(tuple(map(float,p[1:3])))
        elif p[0]=='g':group=p[1]
        elif p[0]=='f':faces.append((group,[tuple(int(v)-1 for v in token.split('/')[:2]) for token in p[1:]]))
    return verts,uvs,faces

def build_mesh(name,src,rule,transform,material,parts,weights):
    verts,uvs,faces=src
    chosen=[face for group,face in faces if rule(group,face,verts)]
    ids=sorted({i for f in chosen for i,j in f});remap={i:k for k,i in enumerate(ids)}
    mesh=bpy.data.meshes.new(name);mesh.from_pydata([transform(verts[i]) for i in ids],[],[[remap[i] for i,j in f] for f in chosen]);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);mesh.materials.append(material)
    uv=mesh.uv_layers.new(name='UVMap')
    for poly,face in zip(mesh.polygons,chosen):
        poly.use_smooth=True
        for idx,(_,j) in zip(poly.loop_indices,face):uv.data[idx].uv=uvs[j]
    groups={}
    for vert in mesh.vertices:
        for bone,weight in weights(vert.co).items():
            if weight<.001:continue
            if bone not in groups:groups[bone]=obj.vertex_groups.new(name=bone)
            groups[bone].add([vert.index],weight,'REPLACE')
    parts.append(obj);return obj

def fit_head(v,female=False):
    # A .108 scale yields a natural adult head and preserves a 1.76 m actor.
    x,y,z=v
    jaw=max(0,min(1,(7.25-y)/.8))
    xx=x*.108*(1-.075*jaw if female else 1+.035*jaw)
    return Vector((xx,.05-z*.108,.805+y*.108))

def add_anatomy(parts,skin,eyes,female):
    src=read_obj(SOURCES/'makehuman-base.obj')
    def hw(v):
        t=max(0,min(1,(v.z-1.46)/.055));return {'neck':1-t,'head':t}
    head=build_mesh('actor_anatomical_head',src,lambda g,f,v:g=='body' and all(v[i].y>5.80 for i,j in f),lambda v:fit_head(v,female),skin,parts,hw)
    # These low-poly eyeballs share the upstream head's actual eyelid topology.
    eye_src=read_obj(SOURCES/'makehuman-eyes.obj')
    eyes_obj=build_mesh('actor_anatomical_eyes',eye_src,lambda g,f,v:True,lambda v:fit_head(v,female),eyes,parts,lambda v:{'head':1})
    # Close hair is carried by the licensed anatomical scalp texture. Avoid
    # an overlapping helmet mesh and its additional material submission.
    return src

def add_hands(src,parts,skin):
    # Bind detailed palm and fingers rigidly to the named wrist; fingers stay
    # relaxed during these five clips. No unsupported finger rig is implied.
    for sign,suffix in [(-1,'L'),(1,'R')]:
        wrist=Vector((sign*4.31185,2.4518125,1.75655));tip=Vector((sign*4.7841375,1.302775,3.0146875))
        e=(tip-wrist).normalized();u=Vector((1,0,0));u=(u-e*u.dot(e)).normalized();v=e.cross(u).normalized()
        def transform(p):
            d=p-wrist
            length=d.dot(e)*.094;curl=max(0,length-.065)
            return Vector((sign*.255+d.dot(u)*.085,-.018+d.dot(v)*.094+.42*curl*curl/.10,.871-length))
        def select(g,f,verts):
            return g=='body' and all(verts[i].x*sign>3.70 and verts[i].y<2.70 and (verts[i]-wrist).dot(e)>-.10 for i,j in f)
        build_mesh('actor_anatomical_hand_'+suffix,src,select,transform,skin,parts,lambda p:{'hand.'+suffix:1})
