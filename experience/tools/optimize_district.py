"""Build a route-focused glTF LOD without changing the research/master asset.
Retains wall/roof silhouettes; removes distant sub-metre joinery, batches static
parts by material and 160m spatial tiles, and encodes delivery-sized textures.
Run with Python + numpy + Pillow + scipy. Source remains district.glb.gz.
"""
from pathlib import Path
import copy,gzip,io,json,struct,numpy as np
from PIL import Image
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'assets/district.glb.gz';target=ROOT/'assets/district-route.glb.gz'
raw=gzip.decompress(source.read_bytes()); jl=struct.unpack_from('<I',raw,12)[0]
src=json.loads(raw[20:20+jl]); start=20+jl;bl=struct.unpack_from('<I',raw,start)[0];binary=raw[start+8:start+8+bl]
doc={k:copy.deepcopy(v) for k,v in src.items() if k not in ('buffers','bufferViews','accessors','meshes','nodes','scenes')}
doc.update(bufferViews=[],accessors=[],meshes=[],nodes=[],scenes=[{'nodes':[]}],scene=0)
out=bytearray();types={5126:np.float32,5125:np.uint32,5123:np.uint16,5121:np.uint8};dims={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
def read(a):
 a=src['accessors'][a];v=src['bufferViews'][a['bufferView']];dtype=types[a['componentType']];n=dims[a['type']];offset=v.get('byteOffset',0)+a.get('byteOffset',0)
 if v.get('byteStride'):
  return np.ndarray((a['count'],n),dtype=dtype,buffer=binary,offset=offset,strides=(v['byteStride'],np.dtype(dtype).itemsize)).copy()
 return np.frombuffer(binary,dtype=dtype,count=a['count']*n,offset=offset).copy().reshape(-1,n)
def view(b):
 while len(out)%4:out.append(0)
 pos=len(out);out.extend(b);doc['bufferViews'].append({'buffer':0,'byteOffset':pos,'byteLength':len(b)});return len(doc['bufferViews'])-1
def accessor(a,kind):
 a=np.ascontiguousarray(a);v=view(a.tobytes());ctype={np.dtype('float32'):5126,np.dtype('uint32'):5125,np.dtype('uint16'):5123}[a.dtype]
 item={'bufferView':v,'componentType':ctype,'count':len(a),'type':kind}
 if kind=='VEC3':item.update(min=a.min(axis=0).astype(float).tolist(),max=a.max(axis=0).astype(float).tolist())
 doc['accessors'].append(item);return len(doc['accessors'])-1
def primitive(attrs,idx,mat):
 return {'attributes':{k:accessor(v,{'POSITION':'VEC3','NORMAL':'VEC3','TEXCOORD_0':'VEC2'}[k]) for k,v in attrs.items()},'indices':accessor(idx.reshape(-1,1).astype(np.uint32),'SCALAR'),'material':mat}
def add_mesh(name,prims,node=None):
 mi=len(doc['meshes']);doc['meshes'].append({'name':name+'_mesh','primitives':prims});n=copy.deepcopy(node or {});n.update(name=name,mesh=mi);ni=len(doc['nodes']);doc['nodes'].append(n);doc['scenes'][0]['nodes'].append(ni)
buckets={};before=after=0; removed=0;roof_edges=0;roof_plates=0;roof_plate_tris=0
fine={'MAT_STREET_TRIM','MAT_WINDOW_DARK','MAT_WOOD_DARK','MAT_STREET_INTERIOR','MAT_AWNING_CANVAS','MAT_AWNING_DARK','MAT_STREET_METAL'}
for node in src['nodes']:
 if 'mesh' not in node:continue
 mesh=src['meshes'][node['mesh']];name=node['name'];batch=('SHOP_ROW' in name or 'ST_KEMBANG_ROW' in name or 'BG_CORE_BLOCKS' in name)
 for p in mesh['primitives']:before+=len(read(p['indices']))//3
 if not batch:
  ps=[]
  for p in mesh['primitives']:
   attrs={k:read(v) for k,v in p['attributes'].items()};idx=read(p['indices']).reshape(-1);after+=len(idx)//3;ps.append(primitive(attrs,idx,p['material']))
  add_mesh(name,ps,node);continue
 # The district's street/background batches are world-space exports. Fail closed
 # if a future source changes that rather than silently misplacing architecture.
 if any(k in node for k in ('matrix','translation','rotation','scale')):raise ValueError('Unexpected transform on batch '+name)
 for p in mesh['primitives']:
  attrs={k:read(v) for k,v in p['attributes'].items()};tri=read(p['indices']).reshape(-1,3);mat=p['material'];mn=src['materials'][mat]['name']
  # Legacy street generator accidentally used a full-depth timber box at the
  # ridge of parallel roofs (build_05_streets.py:500). These thin high plates
  # visibly float across the roof. Remove that precise component shape only.
  if mn=='MAT_WOOD_DARK':
   xyz=attrs['POSITION'];ww,iv=np.unique(np.round(xyz,4),axis=0,return_inverse=True);tt=iv[tri];ed=np.concatenate((tt[:,[0,1]],tt[:,[1,2]],tt[:,[2,0]]));adj=coo_matrix((np.ones(len(ed)),(ed[:,0],ed[:,1])),shape=(len(ww),len(ww)));nc,labels=connected_components(adj,directed=False)
   bad=[]
   for label in range(nc):
    v=ww[labels==label];lo=v.min(axis=0);hi=v.max(axis=0);dim=hi-lo
    if lo[1]>4 and dim[1]<.17 and min(dim[0],dim[2])>1.3 and dim[0]*dim[2]>8:bad.append(label)
   keep_plate=~np.isin(labels[tt[:,0]],bad);roof_plates+=len(bad);roof_plate_tris+=int((~keep_plate).sum());tri=tri[keep_plate]
  # Original inferred tiled roofs are infinitely thin exported sheets. Add a
  # 14cm fascia at their exposed boundaries; retain the source roof silhouette.
  if mn in ('MAT_STREET_ROOF_A','MAT_STREET_ROOF_B'):
   xyz=attrs['POSITION'];welded,first,inv=np.unique(np.round(xyz,4),axis=0,return_index=True,return_inverse=True);tt=inv[tri];edges=np.concatenate((tt[:,[0,1]],tt[:,[1,2]],tt[:,[2,0]]));edge,count=np.unique(np.sort(edges,axis=1),axis=0,return_counts=True);edge=edge[count==1]
   aa=welded[edge[:,0]];bb=welded[edge[:,1]];mid=(aa+bb)*.5;valid=(np.hypot(np.maximum(np.maximum(-155-mid[:,0],mid[:,0]-160),0),np.maximum(np.maximum(-25-mid[:,2],mid[:,2]-65),0))<180)&(np.linalg.norm(bb-aa,axis=1)>.15)
   aa=aa[valid];bb=bb[valid]
   if len(aa):
    ad=aa.copy();bd=bb.copy();ad[:,1]-=.14;bd[:,1]-=.14;v=np.stack((aa,bb,bd,ad),axis=1).reshape(-1,3).astype(np.float32);nn=np.cross(bb-aa,bd-aa);nn/=np.maximum(np.linalg.norm(nn,axis=1)[:,None],1e-6);nn=np.repeat(nn,4,axis=0).astype(np.float32);base=len(xyz);idx=(np.arange(len(aa))[:,None]*4+np.array([0,1,2,0,2,3])).reshape(-1,3)+base
    attrs['POSITION']=np.concatenate((xyz,v));attrs['NORMAL']=np.concatenate((attrs['NORMAL'],nn));attrs['TEXCOORD_0']=np.concatenate((attrs['TEXCOORD_0'],v[:,[0,2]]));tri=np.concatenate((tri,idx));roof_edges+=len(aa)
  cent=attrs['POSITION'][tri].mean(axis=1)
  distance=np.hypot(np.maximum(np.maximum(-155-cent[:,0],cent[:,0]-160),0),np.maximum(np.maximum(-25-cent[:,2],cent[:,2]-65),0))
  keep=distance<(95 if 'BG_CORE' in name else 155) if mn in fine else np.ones(len(tri),dtype=bool)
  removed+=int((~keep).sum());tri=tri[keep];cent=cent[keep];distance=distance[keep];tile=np.floor(cent[:,[0,2]]/160).astype(int);tile[distance>180]=9999
  for key in np.unique(tile,axis=0):
   take=np.all(tile==key,axis=1);t=tri[take];vertices,idx=np.unique(t.reshape(-1),return_inverse=True);at={k:v[vertices] for k,v in attrs.items()};k=(int(key[0]),int(key[1]),mat)
   buckets.setdefault(k,[]).append((at,idx));after+=len(t)
for (x,z,mat),pieces in sorted(buckets.items()):
 attrs={k:np.concatenate([p[0][k] for p in pieces]) for k in pieces[0][0]};offset=0;indices=[]
 for at,idx in pieces:indices.append(idx+offset);offset+=len(at['POSITION'])
 # Welding equal corner attributes cuts transfer and GPU memory while retaining
 # UV seams and hard normals. No aggressive simplification of near landmarks.
 names=list(attrs);combo=np.concatenate([attrs[k] for k in names],axis=1);unique,first,inverse=np.unique(combo,axis=0,return_index=True,return_inverse=True);idx=inverse[np.concatenate(indices)]
 attrs={k:v[first] for k,v in attrs.items()};add_mesh(f'JEJAKA_ROUTE_TILE_{x}_{z}_{mat}',[primitive(attrs,idx,mat)])
for image in doc.get('images',[]):
 v=src['bufferViews'][image['bufferView']];im=Image.open(io.BytesIO(binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])).convert('RGB');name=image.get('name','')
 size=1024 if 'diff' in name else 512;im.thumbnail((size,size),Image.Resampling.LANCZOS);buf=io.BytesIO()
 if 'nor_' in name:im.save(buf,format='PNG',optimize=True);image['mimeType']='image/png'
 else:im.save(buf,format='JPEG',quality=90 if 'diff' in name else 94,optimize=True);image['mimeType']='image/jpeg'
 image['bufferView']=view(buf.getvalue())
doc['buffers']=[{'byteLength':len(out)}];doc['asset']['generator']='Jejaka route delivery optimizer; source retained'
j=json.dumps(doc,separators=(',',':')).encode();j+=b' ' *((-len(j))%4);out+=b'\x00'*((-len(out))%4)
result=struct.pack('<4sII',b'glTF',2,12+8+len(j)+8+len(out))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(out),0x004e4942)+out
target.write_bytes(gzip.compress(result,compresslevel=9,mtime=0));stats={'sourceTriangles':before,'deliveryTriangles':after,'distantDetailTrianglesRemoved':removed,'sourceGzipBytes':source.stat().st_size,'deliveryGzipBytes':target.stat().st_size,'deliveryGLBBytes':len(result),'sourcePrimitives':sum(len(m['primitives']) for m in src['meshes']),'deliveryPrimitives':sum(len(m['primitives']) for m in doc['meshes']),'roofFasciaEdgesAdded':roof_edges,'legacyFloatingRoofPlatesRemoved':roof_plates,'roofPlateTrianglesRemoved':roof_plate_tris,'policy':'Distant trim/joinery LOD; 14cm inferred roof fascias; original landmark geometry and archive/master retained.'};target.with_suffix('.json').write_text(json.dumps(stats,indent=2)+'\n');print(json.dumps(stats,indent=2))
