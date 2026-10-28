"""Restore missing bundled previews from their pinned metadata URLs.

Run only if a bundled JPG was removed. Existing files are verified and left
untouched. Requires Pillow. No model-generation or paid service is involved.
"""
from pathlib import Path
from io import BytesIO
import hashlib,json,urllib.request
from PIL import Image
BASE=Path(__file__).resolve().parent

def main():
    for sid in ('L004','L005','L006','L007','L008'):
        meta=json.loads((BASE/(sid+'_metadata.json')).read_text(encoding='utf-8'))
        destination=BASE/(sid+'.jpg')
        if destination.exists():
            actual=hashlib.sha256(destination.read_bytes()).hexdigest()
            if actual!=meta['sha256']:
                raise RuntimeError(f'{sid}: local checksum differs; preserve manual changes and investigate')
            print(sid,'verified existing preview')
            continue
        request=urllib.request.Request(meta['download_url'],headers={'User-Agent':'PALAGAN historical reference restoration/1.0'})
        with urllib.request.urlopen(request,timeout=30) as response:
            data=response.read(50*1024*1024+1)
        if len(data)>50*1024*1024:
            raise RuntimeError(f'{sid}: download exceeds50MiB bound')
        temporary=BASE/(sid+'.restore.jpg')
        Image.open(BytesIO(data)).convert('RGB').save(temporary,quality=93)
        if hashlib.sha256(temporary.read_bytes()).hexdigest()!=meta['sha256']:
            temporary.unlink()
            raise RuntimeError(f'{sid}: fetched preview differs from packaged version; inspect source instead of overwriting evidence')
        temporary.replace(destination)
        print(sid,'restored')

if __name__=='__main__':
    main()
