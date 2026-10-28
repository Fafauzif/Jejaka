"""Jejaka civilians: CC0 anatomical head/hands, tailored clothing and authored clips.
Run with Blender 4.0+ in background. Bundled CC0 mesh and texture derivatives are included; no network is required.
"""
import sys, math, json, struct, os, tempfile
from pathlib import Path
# Standard Blender bundles its dependencies. Extracted distribution builds can
# add a compatible Python site directory explicitly when needed.
extra = os.environ.get('JEJAKA_PYTHON_EXTRA', '')
for value in extra.split(os.pathsep):
    if value and Path(value).is_dir(): sys.path.append(value)
system_dynload = Path('/usr/lib') / ('python%d.%d' % sys.version_info[:2]) / 'lib-dynload'
if system_dynload.is_dir(): sys.path.append(str(system_dynload))
import bpy
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
from character_anatomy import add_anatomy, add_hands
ROOT=Path(__file__).resolve().parents[1]
FEMALE=os.environ.get('JEJAKA_CHARACTER_VARIANT')=='SARI'
BASENAME='sari' if FEMALE else 'characters'
ASSETS=ROOT/'assets'
ASSETS.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for a in list(bpy.data.actions): bpy.data.actions.remove(a)

def mat(name,color,rough=0.85):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough
    return m
skin=mat('CIVILIAN_SKIN',(.43,.255,.15),.62); shirt=mat('CIVILIAN_SHIRT',(.56,.51,.39)); trouser=mat('CIVILIAN_TROUSERS',(.205,.225,.19))
if FEMALE:
    shirt.diffuse_color=(.47,.36,.23,1)
    shirt.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.47,.36,.23,1)
    trouser.diffuse_color=(.23,.19,.15,1)
    trouser.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.23,.19,.15,1)
hair=mat('CIVILIAN_HAIR',(.027,.019,.013),.74); shoes=mat('CIVILIAN_SHOES',(.07,.046,.027),.72)
# Shared materials keep each skinned actor at five or six draw primitives.
collar=shirt;belt=shoes;dark=hair;eye=mat('CIVILIAN_EYE',(.92,.92,.88),.30)
def texture(material,filename,normal=False):
    nt=material.node_tree;p=nt.nodes.get('Principled BSDF');node=nt.nodes.new('ShaderNodeTexImage');node.image=bpy.data.images.load(str(ASSETS/'character-textures'/filename),check_existing=True)
    if normal:
        node.image.colorspace_settings.name='Non-Color';nm=nt.nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.28;nt.links.new(node.outputs['Color'],nm.inputs['Color']);nt.links.new(nm.outputs['Normal'],p.inputs['Normal'])
    else:nt.links.new(node.outputs['Color'],p.inputs['Base Color'])
texture(skin,('female' if FEMALE else 'male')+'-skin.jpg');texture(eye,'brown-eye.jpg')
# Cloth colour remains adjustable by the runtime; this tile contributes fine weave.
for material,garment in [(shirt,'shirt'),(trouser,'trouser')]:
    base=material.diffuse_color[:];nt=material.node_tree;p=nt.nodes.get('Principled BSDF');node=nt.nodes.new('ShaderNodeTexImage');node.image=bpy.data.images.load(str(ASSETS/'character-textures'/((('female' if FEMALE else 'male')+'-'+garment)+'.jpg')),check_existing=True)
    nt.links.new(node.outputs['Color'],p.inputs['Base Color']);p.inputs['Base Color'].default_value=base
    texture(material,'linen-normal.png',True)
parts=[]
def finish(o,name,material,bone,smooth=True):
    o.name=name;o.data.materials.clear();o.data.materials.append(material)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if smooth:
        for p in o.data.polygons:p.use_smooth=True
    vg=o.vertex_groups.new(name=bone);vg.add(list(range(len(o.data.vertices))),1.0,'REPLACE')
    parts.append(o);return o

def ell(name,pos,scale,material,bone,seg=16,rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=pos)
    o=bpy.context.object;o.scale=scale
    return finish(o,name,material,bone)

def box(name,pos,scale,material,bone,bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    mod=o.modifiers.new('Soft tailored edges','BEVEL');mod.width=bevel;mod.segments=2
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,material,bone)

def taper(name,a,b,ra,rb,material,bone,sides=12):
    a,b=Vector(a),Vector(b);axis=(b-a).normalized();helper=Vector((0,0,1)) if abs(axis.z)<.95 else Vector((1,0,0))
    u=axis.cross(helper).normalized();v=axis.cross(u).normalized();verts=[]
    for t,r in [(0,ra),(.1,ra),(.9,rb),(1,rb)]:
        center=a.lerp(b,t)
        for k in range(sides):
            angle=2*math.pi*k/sides;verts.append(center+r*(u*math.cos(angle)+v*math.sin(angle)))
    faces=[]
    for j in range(3):
        for k in range(sides):faces.append((j*sides+k,j*sides+(k+1)%sides,(j+1)*sides+(k+1)%sides,(j+1)*sides+k))
    faces.extend([tuple(range(sides-1,-1,-1)),tuple(range(3*sides,4*sides))])
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    return finish(o,name,material,bone)

# Tailored silhouette, slightly relaxed standing pose.
box('actor_pelvis',(0,.005,.962),(.29,.19,.13),trouser,'hips',.025)
# Shirt body follows a tailored shoulder-to-waist profile.
verts=[];faces=[];N=16
for z,rx,ry in [(1.025,.155,.103),(1.10,.16,.112),(1.28,.184,.116),(1.375,.205,.105),(1.455,.062,.057)]:
    for k in range(N):
        a=k*math.tau/N;verts.append((rx*math.cos(a),ry*math.sin(a),z))
for j in range(4):
    for k in range(N):faces.append((j*N+k,j*N+(k+1)%N,(j+1)*N+(k+1)%N,(j+1)*N+k))
faces.extend([tuple(range(N-1,-1,-1)),tuple(range(4*N,5*N))])
mesh=bpy.data.meshes.new('TailoredShirt');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('actor_shirt_body',mesh);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o;finish(o,'actor_shirt_body',shirt,'spine')
# Lower shirt hem belongs to the continuous body.
box('actor_belt',(0,-.004,1.005),(.31,.214,.035 if FEMALE else .025),trouser if FEMALE else belt,'hips',.008)

if not FEMALE:box('actor_belt_buckle',(0,-.116,1.005),(.033,.012,.027),collar,'hips',.003)
# Open collar pieces rather than a large painted neck opening.
# The imported head includes a continuous neck hidden naturally by the collar.
# Folded pointed collar panels follow the chest, instead of raised boxes.
for sign,suffix in [(-1,'L'),(1,'R')]:
    verts=[(sign*.018,-.065,1.444),(sign*.060,-.080,1.425),(sign*.040,-.096,1.398),(sign*.015,-.087,1.422)]
    faces=[(0,1,2,3)] if sign<0 else [(3,2,1,0)]
    mesh=bpy.data.meshes.new('Folded collar');mesh.from_pydata(verts,[],faces);mesh.update()
    collar_obj=bpy.data.objects.new('actor_collar_'+suffix,mesh);bpy.context.collection.objects.link(collar_obj);bpy.context.view_layer.objects.active=collar_obj
    finish(collar_obj,collar_obj.name,shirt,'spine',False)
    solid=collar_obj.modifiers.new('Collar thickness','SOLIDIFY');solid.thickness=.0015;bpy.ops.object.modifier_apply(modifier=solid.name)
box('actor_button_placket',(0,-.116,1.23),(.010,.003,.25),collar,'spine',.002)
for z in [1.32,1.23,1.14]:ell('actor_shirt_button',(0,-.120,z),(.004,.002,.004),belt,'spine',8,6)

if not FEMALE:box('actor_chest_pocket',(-.105,-.118,1.29),(.075,.005,.078),shirt,'spine',.005)
# Anatomical face/eyes/hands from explicit CC0 mesh data.
# The shape is fitted to this original rig; it does not depict a real person.
anatomy_source=add_anatomy(parts,skin,eye,FEMALE)

if FEMALE:
    ell('actor_hair_bun',(0,.115,1.637),(.061,.059,.054),hair,'head',20,12)
    # A plain wrap skirt: an authored civilian garment, no invented historical print.
    skirt=taper('actor_sarong',(0,0,.98),(0,-.004,.17),.174,.19,trouser,'hips',20)
    # Flatten the wrap in depth while retaining hip width and a generous hem.
    for v in skirt.data.vertices:v.co.y*=.72
    # Vertical front overlap seam.
    seam=box('actor_sarong_wrap',(.053,-.127,.576),(.004,.0015,.70),trouser,'hips',.001)

for sign,suffix in [(-1,'L'),(1,'R')]:
    x=sign*.21
    ell('actor_shoulder_'+suffix,(sign*.205,0,1.335),(.060,.065,.053),shirt,'upper_arm.'+suffix)
    taper('actor_sleeve_'+suffix,(sign*.22,0,1.33),(sign*.25,.003,1.12),.060,.050,shirt,'upper_arm.'+suffix)
    # Rolled sleeve edge.
    
    if FEMALE:
        taper('actor_sleeve_cuff_'+suffix,(sign*.255,-.014,.90),(sign*.255,-.014,.87),.038,.037,collar,'forearm.'+suffix)
    else:
        taper('actor_sleeve_cuff_'+suffix,(sign*.25,.003,1.145),(sign*.25,.003,1.11),.052,.051,collar,'upper_arm.'+suffix)
    ell('actor_elbow_'+suffix,(sign*.25,.001,1.095),(.045,.045,.045),shirt if FEMALE else skin,'forearm.'+suffix)
    taper('actor_forearm_'+suffix,(sign*.25,0,1.10),(sign*.255,-.014,.87),.049,.026,shirt if FEMALE else skin,'forearm.'+suffix)
    hip=sign*.095
    if FEMALE:
        # Skin at the ankle replaces the previously exposed trouser stubs.
        taper('actor_ankle_'+suffix,(hip,.002,.19),(hip,.002,.078),.024,.023,skin,'foot.'+suffix)
    else:
        taper('actor_thigh_'+suffix,(hip,0,.955),(hip,.006,.54),.088,.066,trouser,'thigh.'+suffix)
        taper('actor_trouser_lower_'+suffix,(hip,.006,.541),(hip,.004,.105),.066,.048,trouser,'shin.'+suffix)
        box('actor_trouser_hem_'+suffix,(hip,.004,.12),(.099,.102,.04),trouser,'shin.'+suffix,.005)
        taper('actor_sock_'+suffix,(hip,.003,.145),(hip,.003,.075),.026,.026,shoes,'foot.'+suffix)
    # A sewn leather upper with a flattened lasting edge. Every ring meets the
    # snug sole at the same height; no spherical upper floats above a platform.
    rings=[(.065,.028,.090),(.046,.039,.095),(-.015,.050,.080),(-.085,.050,.065),(-.137,.042,.049),(-.168,.020,.037)]
    verts=[];faces=[];N=12;base=.012
    for y,width,height in rings:
        for k in range(N):
            a=k*math.tau/N;z=base+(height-base)*(math.sin(a)+1)*.5
            if math.sin(a)<-.50:z=base
            verts.append((hip+width*math.cos(a),y,z))
    for j in range(len(rings)-1):
        for k in range(N):faces.append((j*N+k,j*N+(k+1)%N,(j+1)*N+(k+1)%N,(j+1)*N+k))
    faces.extend([tuple(range(N-1,-1,-1)),tuple(range((len(rings)-1)*N,len(rings)*N))])
    mesh=bpy.data.meshes.new('Lasted shoe upper');mesh.from_pydata(verts,[],faces);mesh.update()
    upper=bpy.data.objects.new('actor_shoe_'+suffix,mesh);bpy.context.collection.objects.link(upper);bpy.context.view_layer.objects.active=upper
    finish(upper,upper.name,shoes,'foot.'+suffix)
    # Same fitted outline, only fourteen millimetres thick, bottom on ground.
    outline=[(-.028,.066),(-.042,.044),(-.052,-.015),(-.052,-.085),(-.044,-.138),(-.021,-.171),(.021,-.171),(.044,-.138),(.052,-.085),(.052,-.015),(.042,.044),(.028,.066)]
    vs=[(hip+x,y,z) for z in [0,.014] for x,y in outline];M=len(outline)
    fs=[tuple(range(M-1,-1,-1)),tuple(range(M,2*M))]
    fs.extend((k,(k+1)%M,(k+1)%M+M,k+M) for k in range(M))
    mesh=bpy.data.meshes.new('Fitted shoe sole');mesh.from_pydata(vs,[],fs);mesh.update()
    sole=bpy.data.objects.new('actor_sole_'+suffix,mesh);bpy.context.collection.objects.link(sole);bpy.context.view_layer.objects.active=sole
    finish(sole,sole.name,shoes,'foot.'+suffix,False)

add_hands(anatomy_source,parts,skin)

# Union overlapping garments and facial volumes into continuous surfaces.
# This prevents spherical shoulder joints and separate jaw/nose primitives from
# reading as a wooden mannequin. Assign blended weights after remeshing.
def union_parts(name,chosen,material,weight_fn,voxel):
    global parts
    chosen=list(chosen)
    if not chosen:return
    chosen_names={o.name for o in chosen}
    parts=[o for o in parts if o.name not in chosen_names]
    bpy.ops.object.select_all(action='DESELECT')
    for o in chosen:o.select_set(True)
    bpy.context.view_layer.objects.active=chosen[0]
    bpy.ops.object.join();o=bpy.context.object;o.name=name
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    o.vertex_groups.clear()
    rem=o.modifiers.new('Continuous surface','REMESH');rem.mode='VOXEL';rem.voxel_size=voxel;rem.use_smooth_shade=True
    bpy.ops.object.modifier_apply(modifier=rem.name)
    sm=o.modifiers.new('Soft fabric transitions','SMOOTH');sm.factor=.7;sm.iterations=8
    bpy.ops.object.modifier_apply(modifier=sm.name)
    dec=o.modifiers.new('Efficient surface','DECIMATE');dec.ratio=.36
    bpy.ops.object.modifier_apply(modifier=dec.name)
    o.data.materials.clear();o.data.materials.append(material)
    groups={}
    for v in o.data.vertices:
        for group,weight in weight_fn(v.co).items():
            if weight<.001:continue
            if group not in groups:groups[group]=o.vertex_groups.new(name=group)
            groups[group].add([v.index],weight,'REPLACE')
    for poly in o.data.polygons:poly.use_smooth=True
    parts.append(o)

def garment_weights(v):
    x,y,z=v;side='L' if x<0 else 'R'
    arm=max(0,min(1,(abs(x)-.145)/.075))
    if abs(x)>.20:arm=1
    fore=max(0,min(1,(1.18-z)/.105)) if FEMALE else 0
    return {'spine':1-arm,'upper_arm.'+side:arm*(1-fore),'forearm.'+side:arm*fore}
shirt_names=lambda o:(o.name=='actor_shirt_body' or o.name.startswith('actor_shoulder_') or (o.name.startswith('actor_sleeve_') and not o.name.startswith('actor_sleeve_cuff_')) or (FEMALE and (o.name.startswith('actor_elbow_') or o.name.startswith('actor_forearm_'))))
union_parts('actor_continuous_garment',[o for o in parts if shirt_names(o)],shirt,garment_weights,.0095)
if not FEMALE:
    def trouser_weights(v):
        side='L' if v.x<0 else 'R'
        thigh=max(0,min(1,(.98-v.z)/.13))
        shin=max(0,min(1,(.61-v.z)/.15))
        return {'hips':1-thigh,'thigh.'+side:thigh*(1-shin),'shin.'+side:thigh*shin}
    trouser_names=lambda o:(o.name=='actor_pelvis' or o.name.startswith('actor_thigh_') or o.name.startswith('actor_trouser_lower_') or o.name.startswith('actor_trouser_hem_'))
    union_parts('actor_continuous_trousers',[o for o in parts if trouser_names(o)],trouser,trouser_weights,.010)
# Subtle garment folds follow real contact zones at waist, knee and elbow.
for obj in parts:
    if obj.name=='actor_continuous_garment':
        for v in obj.data.vertices:
            x,y,z=v.co
            waist=math.exp(-((z-1.08)/.09)**2)
            underarm=math.exp(-((abs(x)-.17)/.06)**2)*math.exp(-((z-1.24)/.10)**2)
            fold=.0022*math.sin(z*90+x*23)*(waist+.6*underarm)
            v.co.y+=fold*(1 if y>0 else -1)
    if obj.name=='actor_continuous_trousers':
        for v in obj.data.vertices:
            x,y,z=v.co
            amount=math.exp(-((z-.57)/.09)**2)+.7*math.exp(-((z-.19)/.07)**2)
            v.co.y+=.0025*math.sin(z*99+x*29)*amount
# Original forearm geometry samples a dedicated neutral skin tile, avoiding
# unrelated body-atlas islands on the elbow or wrist. Head/hands retain real UVs.
for obj in parts:
    if not (obj.name.startswith('actor_forearm_') or obj.name.startswith('actor_elbow_') or obj.name.startswith('actor_ankle_')) or obj.data.materials[0]!=skin:continue
    uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='UVMap')
    for loop in obj.data.loops:
        co=obj.matrix_world@obj.data.vertices[loop.vertex_index].co
        angle=(math.atan2(co.y,co.x-(.25 if co.x>0 else -.25))/math.tau)%1
        uv.data[loop.index].uv=(.2+angle*.17,.52+max(0,min(1,(co.z-.87)/.23))*.18)
# Consistent cylindrical textile UVs; geometry keeps normals and colours separate.
for obj in parts:
    if not obj.data.materials or obj.data.materials[0] not in [shirt,trouser]:continue
    uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='UVMap')
    for poly in obj.data.polygons:
        coords=[]
        for li in poly.loop_indices:
            co=obj.matrix_world@obj.data.vertices[obj.data.loops[li].vertex_index].co
            coords.append((li,(math.atan2(co.y,co.x)/math.tau)%1,co.z*3))
        wrap=max(p[1] for p in coords)-min(p[1] for p in coords)>.5
        for li,u,v in coords:uv.data[li].uv=(u+(1 if wrap and u<.5 else 0),v)

# A small deformation rig. Mesh parts use rigid bone weights; elbows and knees
# overlap to avoid gaps. This is deliberately simpler than facial/cloth simulation.
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0));rig=bpy.context.object;rig.name='CivilianRig';arm=rig.data;arm.name='CivilianSkeleton'
arm.edit_bones.remove(arm.edit_bones[0])
def bone(name,head,tail,parent=None):
    b=arm.edit_bones.new(name);b.head=head;b.tail=tail
    if parent:b.parent=arm.edit_bones[parent]
    return b
bone('root',(0,0,0),(0,0,.2))
bone('hips',(0,0,.95),(0,0,1.08),'root')
bone('spine',(0,0,1.08),(0,0,1.40),'hips')
bone('neck',(0,0,1.40),(0,0,1.53),'spine')
bone('head',(0,0,1.53),(0,0,1.75),'neck')
for sign,s in [(-1,'L'),(1,'R')]:
    bone('upper_arm.'+s,(sign*.21,0,1.39),(sign*.25,0,1.10),'spine')
    bone('forearm.'+s,(sign*.25,0,1.10),(sign*.255,-.014,.87),'upper_arm.'+s)
    bone('hand.'+s,(sign*.255,-.014,.87),(sign*.255,-.02,.78),'forearm.'+s)
    bone('thigh.'+s,(sign*.095,0,.95),(sign*.095,.006,.54),'hips')
    bone('shin.'+s,(sign*.095,.006,.54),(sign*.095,.004,.13),'thigh.'+s)
    bone('foot.'+s,(sign*.095,.004,.13),(sign*.095,-.16,.06),'shin.'+s)
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();body=bpy.context.object;body.name='CivilianBody'
body.parent=rig;mod=body.modifiers.new('Civilian deformation','ARMATURE');mod.object=rig
# Parent inverse identity because source geometry is already in rig space.
for pb in rig.pose.bones:pb.rotation_mode='XYZ'
scene=bpy.context.scene;scene.render.fps=24
rig.animation_data_create()

def reset():
    for p in rig.pose.bones:p.rotation_euler=(0,0,0);p.location=(0,0,0)
def key(frame):
    for p in rig.pose.bones:
        p.keyframe_insert('rotation_euler',frame=frame,group=p.name)
        if p.name=='hips':p.keyframe_insert('location',frame=frame,group=p.name)

def clip(name,frames,fn):
    reset();action=bpy.data.actions.new(name);rig.animation_data.action=action
    for f in range(1,frames+1):
        reset();fn((f-1)/(frames-1),f);key(f)
    for fc in action.fcurves:
        for k in fc.keyframe_points:k.interpolation='LINEAR'
    track=rig.animation_data.nla_tracks.new();track.name=name
    strip=track.strips.new(name,1,action);strip.name=name
    rig.animation_data.action=None
    track.mute=True
    return action

def idle(t,f):
    s=math.sin(t*math.tau)
    rig.pose.bones['hips'].location.x=.002*math.sin(t*math.tau)
    rig.pose.bones['spine'].rotation_euler.x=.006*s
    rig.pose.bones['head'].rotation_euler.z=.016*math.sin(t*math.tau)
    rig.pose.bones['head'].rotation_euler.x=.008*math.sin(t*math.tau)
    rig.pose.bones['forearm.L'].rotation_euler.x=-.08
    rig.pose.bones['forearm.R'].rotation_euler.x=-.11
    rig.pose.bones['upper_arm.L'].rotation_euler.y=-.045
    rig.pose.bones['upper_arm.R'].rotation_euler.y=.045

def locomotion(t,f,run=False):
    a=math.sin(t*math.tau);amp=(.23 if run else .16) if FEMALE else (.62 if run else .37)
    rig.pose.bones['hips'].location.z=(.012 if FEMALE else (.025 if run else .012))*(1-math.cos(t*math.tau*2))
    rig.pose.bones['spine'].rotation_euler.x=.10 if run else .025
    rig.pose.bones['spine'].rotation_euler.z=.045*a
    for sg,s in [(-1,'L'),(1,'R')]:
        v=a*sg
        rig.pose.bones['thigh.'+s].rotation_euler.x=-amp*v
        rig.pose.bones['shin.'+s].rotation_euler.x=max(0,-v)*(.22 if FEMALE else (1.0 if run else .55))
        rig.pose.bones['foot.'+s].rotation_euler.x=-max(0,v)*.14
        rig.pose.bones['upper_arm.'+s].rotation_euler.x=amp*v*.7
        rig.pose.bones['forearm.'+s].rotation_euler.x=(-.9 if run else -.16)
        rig.pose.bones['upper_arm.'+s].rotation_euler.y=sg*.055

def crouch(t,f):
    # Pelvis bone local Y is vertical; preserve shoe contact while bending.
    rig.pose.bones['hips'].location.y=-.17
    rig.pose.bones['spine'].rotation_euler.x=.25
    for s in ['L','R']:
        rig.pose.bones['thigh.'+s].rotation_euler.x=-.8
        rig.pose.bones['shin.'+s].rotation_euler.x=1.3
        rig.pose.bones['foot.'+s].rotation_euler.x=-.5
        rig.pose.bones['upper_arm.'+s].rotation_euler.x=-.25
        rig.pose.bones['forearm.'+s].rotation_euler.x=-.7

def gesture(t,f):
    idle(t,f)
    a=math.sin(math.pi*t)
    rig.pose.bones['upper_arm.R'].rotation_euler.x=-.45*a
    rig.pose.bones['forearm.R'].rotation_euler.x=-.55*a
    rig.pose.bones['head'].rotation_euler.x=.035*math.sin(t*math.tau*2)

clip('Idle',73,idle);clip('Walk',25,lambda t,f:locomotion(t,f,False));clip('Run',19,lambda t,f:locomotion(t,f,True));clip('Crouch',49,crouch);clip('Gesture',61,gesture)
reset();scene.frame_set(1)
if FEMALE:
    rig.scale=(.85,.944,.944)
else:
    rig.scale=(1,1,1.02)
# Export active chosen objects only; each named NLA track becomes one clip.
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);body.select_set(True);bpy.context.view_layer.objects.active=rig
for tr in rig.animation_data.nla_tracks:tr.mute=False
bpy.ops.export_scene.gltf(filepath=str(ASSETS/(BASENAME+'.glb')),export_format='GLB',use_selection=True,export_animations=True,export_nla_strips=True,export_force_sampling=True,export_skins=True,export_cameras=False,export_lights=False)
for tr in rig.animation_data.nla_tracks:tr.mute=True
rig.animation_data.action=bpy.data.actions['Idle'];scene.frame_set(1)
# Render actual asset with a neutral ground at presentation scale.
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,0));floor=bpy.context.object;floor.name='QA_Ground';floor.data.materials.append(mat('QA_Ground',(.18,.17,.14)))
bpy.ops.object.camera_add(location=(2.8,-5,2.2));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.94))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.35;scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(-3,-4,6));bpy.context.object.data.energy=500;bpy.context.object.data.size=4
bpy.ops.object.light_add(type='AREA',location=(3,1,3));bpy.context.object.data.energy=220;bpy.context.object.data.size=3
scene.world.color=(.3,.3,.3);scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=48;scene.cycles.use_denoising=False
scene.render.resolution_x=650;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(Path(os.environ.get('JEJAKA_QA_DIR', tempfile.gettempdir()))/('jejaka-'+BASENAME+'-qa.png'));bpy.ops.render.render(write_still=True)
# Inspect the actual binary export, not the scene's intended state.
p=ASSETS/(BASENAME+'.glb')
with p.open('rb') as f:
    magic,version,total=struct.unpack('<4sII',f.read(12));n,typ=struct.unpack('<II',f.read(8));g=json.loads(f.read(n))
names=[a.get('name') for a in g.get('animations',[])]
assert magic==b'glTF' and total==p.stat().st_size
assert set(['Idle','Walk','Run','Crouch','Gesture']).issubset(names),names
assert len(g.get('skins',[]))==1
report={'file':'assets/'+BASENAME+'.glb','bytes':p.stat().st_size,'animations':names,'skins':len(g.get('skins',[])),'meshes':len(g.get('meshes',[])),'vertices':len(body.data.vertices),'polygons':len(body.data.polygons),'triangles':sum(g['accessors'][p['indices']]['count']//3 for m in g['meshes'] for p in m['primitives']),'primitives':sum(len(m['primitives']) for m in g['meshes']),'height_m':1.63 if FEMALE else 1.76,'forward_three':'+Z','materials':[m['name'] for m in g.get('materials',[])]}
print('CHARACTER_EXPORT_VERIFIED',json.dumps(report))
(ASSETS/(BASENAME+'.json')).write_text(json.dumps(report,indent=2))
