"""Original Jejaka civilian: rigid-weight biped with authored animation clips.
Run with Blender 4.0+ in background. No external models or textures required.
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
skin=mat('CIVILIAN_SKIN',(.43,.255,.15)); shirt=mat('CIVILIAN_SHIRT',(.56,.51,.39)); trouser=mat('CIVILIAN_TROUSERS',(.205,.225,.19))
if FEMALE:
    shirt.diffuse_color=(.47,.36,.23,1)
    shirt.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.47,.36,.23,1)
    trouser.diffuse_color=(.23,.19,.15,1)
    trouser.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.23,.19,.15,1)
hair=mat('CIVILIAN_HAIR',(.035,.025,.018)); shoes=mat('CIVILIAN_SHOES',(.075,.052,.035)); dark=mat('CIVILIAN_FACE_DETAIL',(.105,.063,.04))
collar=mat('CIVILIAN_COLLAR',(.62,.57,.45));belt=mat('CIVILIAN_BELT',(.15,.10,.055)); eye=mat('CIVILIAN_EYE',(.045,.033,.025),.6)
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
ell('actor_neck',(0,0,1.46),(.055,.054,.061),skin,'neck')
left=box('actor_collar_L',(-.043,-.112,1.417),(.058,.018,.065),collar,'spine',.005);left.rotation_euler.y=-.26
right=box('actor_collar_R',(.043,-.112,1.417),(.058,.018,.065),collar,'spine',.005);right.rotation_euler.y=.26
box('actor_button_placket',(0,-.122,1.23),(.012,.007,.26),collar,'spine',.002)
for z in [1.32,1.23,1.14]:ell('actor_shirt_button',(0,-.129,z),(.005,.004,.005),belt,'spine',8,6)

if not FEMALE:box('actor_chest_pocket',(-.105,-.118,1.29),(.075,.013,.078),shirt,'spine',.005)
# Head shaped as an adult, with a small jaw and understated eyes.
ell('actor_head',(0,-.005,1.627),(.091,.087,.125),skin,'head',24,16)
ell('actor_jaw',(0,-.014,1.566),(.064 if FEMALE else .072,.071 if FEMALE else .076,.058 if FEMALE else .064),skin,'head',16,10)
for x in [-.093,.093]:ell('actor_ear',(x,0,1.626),(.018,.025,.036),skin,'head',12,8)
ell('actor_nose',(0,-.092,1.621),(.013 if FEMALE else .017,.019 if FEMALE else .027,.024 if FEMALE else .03),skin,'head',12,8)
for x in [-.034,.034]:
    ell('actor_eye',(x,-.085,1.648),(.010,.005,.0045),eye,'head',12,6)
    brow=box('actor_brow',(x,-.084,1.668),(.027,.005,.004),hair,'head',.001)
box('actor_mouth',(0,-.085,1.58),(.031,.004,.0028),dark,'head',.001)
# Close-cropped hair cap built only over upper cranium; keeps forehead and ears visible.
verts=[];faces=[];N=24
for j in range(6):
    theta=(math.pi*.54)*j/5
    for k in range(N):
        phi=2*math.pi*k/N
        # Back hairline a little lower than forehead.
        theta2=theta*(.88 if math.sin(phi)<0 else 1.0)
        verts.append((.094*math.sin(theta2)*math.cos(phi),-.003+.090*math.sin(theta2)*math.sin(phi),1.638+.12*math.cos(theta2)))
for j in range(5):
    for k in range(N):faces.append((j*N+k,j*N+(k+1)%N,(j+1)*N+(k+1)%N,(j+1)*N+k))
mesh=bpy.data.meshes.new('HairCap');mesh.from_pydata(verts,[],faces);mesh.update();obj=bpy.data.objects.new('actor_hair',mesh);bpy.context.collection.objects.link(obj);bpy.context.view_layer.objects.active=obj;finish(obj,'actor_hair',hair,'head')

if FEMALE:
    ell('actor_hair_bun',(0,.113,1.655),(.069,.07,.064),hair,'head',20,12)
    # A plain wrap skirt: an authored civilian garment, no invented historical print.
    skirt=taper('actor_sarong',(0,0,.98),(0,-.004,.17),.174,.19,trouser,'hips',20)
    # Flatten the wrap in depth while retaining hip width and a generous hem.
    for v in skirt.data.vertices:v.co.y*=.72
    # Vertical front overlap seam.
    seam=box('actor_sarong_wrap',(.053,-.127,.576),(.008,.007,.77),belt,'hips',.002)

for sign,suffix in [(-1,'L'),(1,'R')]:
    x=sign*.21
    ell('actor_shoulder_'+suffix,(sign*.205,0,1.335),(.075,.077,.06),shirt,'upper_arm.'+suffix)
    taper('actor_sleeve_'+suffix,(sign*.22,0,1.33),(sign*.25,.003,1.12),.069,.055,shirt,'upper_arm.'+suffix)
    # Rolled sleeve edge.
    
    if FEMALE:
        taper('actor_sleeve_cuff_'+suffix,(sign*.255,-.014,.90),(sign*.255,-.014,.87),.038,.037,collar,'forearm.'+suffix)
    else:
        taper('actor_sleeve_cuff_'+suffix,(sign*.25,.003,1.145),(sign*.25,.003,1.11),.057,.056,collar,'upper_arm.'+suffix)
    ell('actor_elbow_'+suffix,(sign*.25,.001,1.095),(.045,.045,.045),shirt if FEMALE else skin,'forearm.'+suffix)
    taper('actor_forearm_'+suffix,(sign*.25,0,1.10),(sign*.255,-.014,.87),.049,.035,shirt if FEMALE else skin,'forearm.'+suffix)
    ell('actor_hand_'+suffix,(sign*.255,-.02,.832),(.04,.026,.055),skin,'hand.'+suffix)
    for i in range(4):
        fx=sign*.255+(i-1.5)*.015
        ell('actor_finger_'+suffix+str(i),(fx,-.023,.782+(abs(i-1.5)*.004)),(.008,.012,.026),skin,'hand.'+suffix,8,6)
    ell('actor_thumb_'+suffix,(sign*.255-sign*.034,-.034,.824),(.014,.015,.027),skin,'hand.'+suffix,8,6)
    hip=sign*.095
    taper('actor_thigh_'+suffix,(hip,0,.955),(hip,.006,.54),.056 if FEMALE else .088,.046 if FEMALE else .066,trouser,'thigh.'+suffix)
    # Matching trouser diameters keep the knee seam quiet.
    taper('actor_trouser_lower_'+suffix,(hip,.006,.541),(hip,.004,.13),.045 if FEMALE else .066,.036 if FEMALE else .052,trouser,'shin.'+suffix)
    
    if not FEMALE:box('actor_trouser_hem_'+suffix,(hip,.004,.15),(.105,.108,.045),trouser,'shin.'+suffix,.008)
    ell('actor_shoe_'+suffix,(hip,-.048,.065),(.064,.134,.055),shoes,'foot.'+suffix)
    box('actor_sole_'+suffix,(hip,-.047,.029),(.128,.252,.023),shoes,'foot.'+suffix,.012)

# Compress the exposed neck without changing the facial relationships.
for o in parts:
    if any(g.name=='head' for g in o.vertex_groups):
        o.location.z-=.035

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
    dec=o.modifiers.new('Efficient surface','DECIMATE');dec.ratio=.52
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
union_parts('actor_continuous_garment',[o for o in parts if shirt_names(o)],shirt,garment_weights,.007)
if not FEMALE:
    def trouser_weights(v):
        side='L' if v.x<0 else 'R'
        thigh=max(0,min(1,(.98-v.z)/.13))
        shin=max(0,min(1,(.61-v.z)/.15))
        return {'hips':1-thigh,'thigh.'+side:thigh*(1-shin),'shin.'+side:thigh*shin}
    trouser_names=lambda o:(o.name=='actor_pelvis' or o.name.startswith('actor_thigh_') or o.name.startswith('actor_trouser_lower_') or o.name.startswith('actor_trouser_hem_'))
    union_parts('actor_continuous_trousers',[o for o in parts if trouser_names(o)],trouser,trouser_weights,.008)
head_names=lambda o:(o.name in ['actor_head','actor_jaw','actor_neck','actor_nose'] or o.name.startswith('actor_ear'))
def face_weights(v):
    t=max(0,min(1,(v.z-1.475)/.045))
    return {'neck':1-t,'head':t}
union_parts('actor_continuous_face',[o for o in parts if head_names(o)],skin,face_weights,.0045)

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
    rig.pose.bones['spine'].rotation_euler.x=.008*s
    rig.pose.bones['head'].rotation_euler.z=.025*math.sin(t*math.tau)
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
    rig.pose.bones['hips'].location.z=-.25
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
report={'file':'assets/'+BASENAME+'.glb','bytes':p.stat().st_size,'animations':names,'skins':len(g.get('skins',[])),'meshes':len(g.get('meshes',[])),'vertices':len(body.data.vertices),'polygons':len(body.data.polygons),'height_m':1.63 if FEMALE else 1.76,'forward_three':'+Z','materials':[m['name'] for m in g.get('materials',[])]}
print('CHARACTER_EXPORT_VERIFIED',json.dumps(report))
(ASSETS/(BASENAME+'.json')).write_text(json.dumps(report,indent=2))
