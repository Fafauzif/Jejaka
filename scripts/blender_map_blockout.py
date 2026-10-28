"""Optional cartographic starter. Execute build(ROOT) INSIDE Blender via MCP.

Creates only owned geometry. No surveyed heights, historical landmark model,
scene save, render verification or historical validation is implied.
"""
from pathlib import Path
import json

OWNER = 'PALAGAN_SURABAYA_V1'
GENERATOR = 'PALAGAN_MAP_BLOCKOUT_V1'

def pixel_to_local(u, v, origin=(3090, 4330), meters_per_pixel=1.19):
    return ((u-origin[0])*meters_per_pixel, (origin[1]-v)*meters_per_pixel)

def counterclockwise(points):
    """Return an open polygon ring with positive local-XY signed area."""
    pts=[tuple(p) for p in points]
    if len(pts)>1 and pts[0]==pts[-1]:pts.pop()
    area=sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(pts,pts[1:]+pts[:1]))
    if len(pts)<3 or abs(area)<1e-8:raise ValueError('Degenerate polygon')
    return list(reversed(pts)) if area<0 else pts

def build(project_root, placeholder_height_m=8.0, road_width_m=10.0):
    import bpy
    import runpy
    root=Path(project_root).resolve()
    spec=json.loads((root/'data/HISTORICAL_LAYOUT.json').read_text(encoding='utf-8'))
    layer_api=runpy.run_path(str(root/'scripts/blender_layer_helpers.py'))
    collection=layer_api['ensure_collection']('MAP_BASE')
    # A repeat rebuild may replace only this generator's own objects.
    for ob in list(collection.objects):
        if ob.get('palagan_owner') == OWNER and ob.get('palagan_generator') == GENERATOR:
            old_mesh=ob.data if ob.type=='MESH' else None
            bpy.data.objects.remove(ob,do_unlink=True)
            if old_mesh and old_mesh.users==0 and old_mesh.get('palagan_generator')==GENERATOR:
                bpy.data.meshes.remove(old_mesh)
    materials={}
    def material(key,rgba):
        mat=bpy.data.materials.get('PALAGAN_SEED_'+key)
        if mat and mat.get('palagan_owner') != OWNER:
            raise RuntimeError('Material ownership collision: '+key)
        if mat is None: mat=bpy.data.materials.new('PALAGAN_SEED_'+key)
        mat['palagan_owner']=OWNER;mat['palagan_generator']=GENERATOR
        mat.diffuse_color=rgba;materials[key]=mat
        return mat
    for key,rgba in [('ground',(0.33,0.29,0.22,1)),('water',(0.10,0.24,0.23,1)),
        ('road',(0.46,0.40,0.30,1)),('footprint',(0.65,0.55,0.41,1)),('bridge',(0.40,0.35,0.28,1))]:
        material(key,rgba)
    def mesh_object(name,verts,faces,mat,ft=None):
        mesh=bpy.data.meshes.new(name+'_mesh');mesh['palagan_owner']=OWNER
        mesh['palagan_generator']=GENERATOR;mesh.from_pydata(verts,[],faces);mesh.update()
        ob=bpy.data.objects.new(name,mesh);collection.objects.link(ob)
        layer_api['tag_asset'](ob,(ft or {}).get('feature_id','GROUND'),'MAP_BASE',
            (ft or {}).get('source_ids',['M001']),'reconstructed',
            'Cartographic starter only; heights/road widths/ground datum are production placeholders')
        ob['palagan_generator']=GENERATOR
        if mat:ob.data.materials.append(mat)
        return ob
    half=spec['extent']['width_m']/2
    mesh_object('PALAGAN_GROUND',[(-half,-half,-0.12),(half,-half,-0.12),(half,half,-0.12),(-half,half,-0.12)],[(0,1,2,3)],materials['ground'])
    for ft in spec['features']:
        pts=ft['local_xy_m'];kind=ft['kind'];name='PALAGAN_'+ft['feature_id']
        if kind=='water_polygon':
            pts=counterclockwise(pts)
            mesh_object(name,[(x,y,0.0) for x,y in pts],[tuple(range(len(pts)))],materials['water'],ft)
        elif kind=='mapped_footprint':
            pts=counterclockwise(pts)
            n=len(pts);height=float(placeholder_height_m)
            verts=[(x,y,z) for z in (0.0,height) for x,y in pts]
            faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
            faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
            ob=mesh_object(name,verts,faces,materials['footprint'],ft)
            ob['palagan_placeholder_height_m']=height
        elif kind in ('road_centerline','bridge_axis'):
            # Flat segment ribbons; junction cleanup belongs to the next modelling pass.
            width=float(road_width_m) if kind=='road_centerline' else 10.0
            z=0.06 if kind=='road_centerline' else 0.5
            verts=[];faces=[]
            for a,b in zip(pts,pts[1:]):
                dx,dy=b[0]-a[0],b[1]-a[1];length=(dx*dx+dy*dy)**0.5
                if length<1e-6:continue
                nx,ny=-dy/length*width/2,dx/length*width/2;k=len(verts)
                verts += [(a[0]+nx,a[1]+ny,z),(a[0]-nx,a[1]-ny,z),(b[0]-nx,b[1]-ny,z),(b[0]+nx,b[1]+ny,z)]
                faces.append((k,k+1,k+2,k+3))
            ob=mesh_object(name,verts,faces,materials['bridge' if kind=='bridge_axis' else 'road'],ft)
            ob['palagan_placeholder_width_m']=width
    bpy.context.scene.unit_settings.system='METRIC'
    bpy.context.scene.unit_settings.scale_length=1.0
    bpy.context.scene['palagan_map_source']='M001'
    bpy.context.scene['palagan_layout_status']=spec['status']
    return {'collection':collection.name,'objects':len(collection.objects),
        'status':'starter geometry only; landmarks and all quality gates remain unfinished',
        'next':'Compare top view against references/maps/district_trace_overlay.png, then save/inventory through blender_session.py.'}

if __name__=='__main__':
    raise SystemExit('Inside Blender: api=runpy.run_path(SCRIPT_PATH); print(api["build"](PROJECT_ROOT))')
