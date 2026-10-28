"""Repack the existing export without editing the master scene."""
from pathlib import Path
import gzip, hashlib
root = Path(__file__).resolve().parents[2]
source = root / 'output' / 'viewer' / 'palagan_district.glb'
target = root / 'experience' / 'assets' / 'district.glb.gz'
raw = source.read_bytes()
assert raw[:4] == b'glTF', 'Expected a binary glTF export'
packed = gzip.compress(raw, compresslevel=6, mtime=0)
assert gzip.decompress(packed) == raw
target.write_bytes(packed)
print('Packed', len(raw), 'bytes into', len(packed), 'bytes; SHA256', hashlib.sha256(raw).hexdigest())
