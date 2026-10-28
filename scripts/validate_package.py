"""Read-only validation of the preparation kit. No Blender or network required."""
from pathlib import Path
import json, hashlib, math, struct, sys

ROOT=Path(__file__).resolve().parents[1]
def main():
    errors=[];checks=[]
    required=['README.md','AGENTS.md','START_PROMPT.txt','NEXT_STEPS.md','DECISIONS.md',
      'RIGHTS_AND_ATTRIBUTION.md','docs/BUILD_PLAN.md','docs/SPATIAL_METHOD.md','docs/QUALITY_GATES.md',
      'docs/ASSET_USAGE.md','runtime/STATE_PROTOCOL.md','runtime/SETUP_OPENCODE_BLENDER.md',
      'data/HISTORICAL_LAYOUT.json','data/ASSET_MANIFEST.json','research/SOURCE_REGISTER.csv',
      'research/REFERENCE_INDEX.json','research/RESEARCH_OVERVIEW.md','assets/ASSET_CATALOG.json']
    for rel in required:
        if not (ROOT/rel).is_file():errors.append('missing required file: '+rel)
    all_json={}
    for p in ROOT.rglob('*.json'):
        if 'progress' in p.relative_to(ROOT).parts:continue
        try:all_json[p.relative_to(ROOT).as_posix()]=json.loads(p.read_text(encoding='utf-8'))
        except Exception as e:errors.append(str(p)+': '+str(e))
    checks.append('JSON documents parse')
    sources=[]
    for rel in ['research/map_sources.json','research/landmark_sources.json','research/history_sources.json','runtime/tech_sources.json','research/asset_sources.json']:
        v=all_json.get(rel)
        if v is None:errors.append('missing source register '+rel)
        elif isinstance(v,list):sources.extend(v)
        else:errors.append('expected array '+rel)
    ids=[s.get('source_id') for s in sources]
    if len(ids)!=len(set(ids)):errors.append('duplicate source IDs')
    for s in sources:
        local=s.get('local_file')
        if local and not (ROOT/local).exists():errors.append('source missing local path: '+str(local))
    layout=all_json.get('data/HISTORICAL_LAYOUT.json',{})
    for ft in layout.get('features',[]):
        for sid in ft.get('source_ids',[]):
            if sid not in ids:errors.append('unknown source '+sid)
        if len(ft.get('source_pixels',[]))!=len(ft.get('local_xy_m',[])):errors.append('coordinate count mismatch '+ft['feature_id'])
        for (u,v),(x,y) in zip(ft.get('source_pixels',[]),ft.get('local_xy_m',[])):
            frame=layout['coordinate_system'];ox,oy=frame['origin_original_pixel'];k=frame['meters_per_pixel']
            if abs((u-ox)*k-x)>.02 or abs((oy-v)*k-y)>.02:errors.append('coordinate transform '+ft['feature_id'])
    for claim in all_json.get('research/history_claims.json',[]):
        for sid in claim.get('source_ids',[]):
            if sid not in ids:errors.append('unknown historical source '+sid)
    for asset in all_json.get('data/ASSET_MANIFEST.json',{}).get('assets',[]):
        if not (ROOT/asset['brief']).is_file():errors.append('missing brief '+asset['brief'])
        for sid in asset.get('source_ids',[]):
            if sid not in ids:errors.append('unknown asset source '+sid)
    # Included image records use source checksums independent of the package manifest.
    for rel in ['references/images/IMAGE_INDEX.json','references/maps/MAP_DERIVATIVES.json']:
        for item in all_json.get(rel,[]):
            name=item.get('local_file') or item.get('path');p=ROOT/name
            if not p.is_file():errors.append('missing reference '+name);continue
            if item.get('sha256') and hashlib.sha256(p.read_bytes()).hexdigest()!=item['sha256']:errors.append('reference hash '+name)
    for p in ROOT.rglob('*.glb'):
        b=p.read_bytes()
        if len(b)<12 or b[:4]!=b'glTF' or struct.unpack('<I',b[4:8])[0]!=2 or struct.unpack('<I',b[8:12])[0]!=len(b):
            errors.append('invalid GLB header/length '+str(p.relative_to(ROOT)))
        else:
            try:
                n,typ=struct.unpack('<II',b[12:20]);gltf=json.loads(b[20:20+n].decode('utf-8'))
                if typ!=0x4E4F534A:raise ValueError('first chunk is not JSON')
                for row in gltf.get('images',[])+gltf.get('buffers',[]):
                    uri=row.get('uri','')
                    if uri and not uri.startswith('data:'):
                        q=(p.parent/uri).resolve();q.relative_to(ROOT)
                        if not q.is_file():errors.append('missing GLB external dependency '+str(q))
            except Exception as e:errors.append('GLB JSON/dependencies '+str(p)+': '+str(e))
    for p in ROOT.rglob('*.gltf'):
        try:
            gltf=json.loads(p.read_text())
            for row in gltf.get('buffers',[])+gltf.get('images',[]):
                u=row.get('uri','')
                if not u or u.startswith('data:'):continue
                q=(p.parent/u).resolve();q.relative_to(ROOT)
                if not q.is_file():errors.append('missing glTF dependency '+str(q))
        except Exception as e:errors.append('glTF '+str(p)+': '+str(e))
    for asset in all_json.get('assets/ASSET_CATALOG.json',{}).get('assets',[]):
        if asset.get('source_id') not in ids:errors.append('unknown production asset source '+str(asset.get('source_id')))
        for file in asset.get('files',[]):
            p=ROOT/file['path']
            if not p.is_file():errors.append('missing production asset '+file['path'])
            elif file.get('sha256') and hashlib.sha256(p.read_bytes()).hexdigest()!=file['sha256']:
                errors.append('production asset checksum '+file['path'])
    manifest=ROOT/'PACKAGE_CONTENTS.json'
    if manifest.is_file():
        for item in json.loads(manifest.read_text()).get('files',[]):
            p=ROOT/item['path']
            if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=item['sha256']:
                errors.append('package manifest mismatch '+item['path'])
        checks.append('included-file SHA256 manifest')
    checks.extend(['source/claim/brief referential integrity','layout pixel/local transforms','reference checksums','GLB headers and glTF external dependencies'])
    print(json.dumps({'passed':not errors,'source_count':len(sources),'json_files':len(all_json),
      'layout_features':len(layout.get('features',[])),'checks':checks,'errors':errors,
      'not_checked':['Blender5.2execution','MCPconnection','OpenCodepluginloading','historicalsurveyaccuracy','targetlaptopperformance']},indent=2))
    return 1 if errors else 0
if __name__=='__main__':sys.exit(main())
