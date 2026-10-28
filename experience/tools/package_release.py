"""Create the repository-root update archive and its SHA-256 manifest."""
from pathlib import Path
import argparse,hashlib,json,zipfile
root=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);a=p.parse_args()
roots=['AGENTS.md','README.md','INSTALLATION.md','index.html','vercel.json','.vercelignore','docs/context','docs/reconstruction','experience']
files=[]
for name in roots:
 item=root/name
 for f in ([item] if item.is_file() else item.rglob('*')):
  if not f.is_file():continue
  rel=f.relative_to(root).as_posix()
  if '__pycache__' in f.parts or f.suffix in ('.pyc','.tmp') or rel=='experience/assets/district.glb.gz':continue
  files.append(f)
files=sorted(set(files))
manifest={'product':'Jejaka','edition':'Field edition 2.0.0','date':'2026-10-28','base_repository':'https://github.com/Fafauzif/Jejaka','base_commit':'cdfab9cf0e0385386e76effb75ba0e341b21f9a9','integration':'Extract archive contents into repository root and replace matching files. Preserve original reconstruction folders.','files':[{'path':f.relative_to(root).as_posix(),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in files]}
m=root/'PACKAGE_MANIFEST.json';m.write_text(json.dumps(manifest,indent=2)+'\n');files.append(m)
a.output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(a.output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for f in files:z.write(f,f.relative_to(root).as_posix())
with zipfile.ZipFile(a.output) as z:
 assert z.testzip() is None
 assert all(not n.startswith('/') and '..' not in Path(n).parts for n in z.namelist())
print(json.dumps({'archive':str(a.output),'bytes':a.output.stat().st_size,'files':len(files),'sha256':hashlib.sha256(a.output.read_bytes()).hexdigest()},indent=2))
