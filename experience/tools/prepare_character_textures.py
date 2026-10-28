"""Prepare bundled CC0 skin/eye derivatives and original linen maps.
Usage: python prepare_character_textures.py /path/to/original-png-directory
The directory must contain the three upstream PNG basenames in the source README.
Requires Pillow. Blender builds use the included JPEG/PNG derivatives directly.
"""
from pathlib import Path
import sys,math,random
from PIL import Image,ImageDraw,ImageFilter
ROOT=Path(__file__).resolve().parents[1];DEST=ROOT/'assets'/'character-textures'
DEST.mkdir(parents=True,exist_ok=True);source=Path(sys.argv[1])
verts=[];uvs=[];faces=[];group=''
for line in (Path(__file__).parent/'character_sources'/'makehuman-base.obj').read_text().splitlines():
    p=line.split()
    if not p:continue
    if p[0]=='v':verts.append(tuple(map(float,p[1:4])))
    elif p[0]=='vt':uvs.append(tuple(map(float,p[1:3])))
    elif p[0]=='g':group=p[1]
    elif p[0]=='f' and group=='body':
        f=[tuple(int(n)-1 for n in x.split('/')[:2]) for x in p[1:]]
        if all(verts[i][1]>5.8 for i,j in f) or all(verts[i][0]>3.7 and verts[i][1]<2.7 for i,j in f) or all(verts[i][0]<-3.7 and verts[i][1]<2.7 for i,j in f):faces.append(f)
mask=Image.new('L',(1024,1024));draw=ImageDraw.Draw(mask)
for f in faces:draw.polygon([(uvs[j][0]*1024,(1-uvs[j][1])*1024) for i,j in f],fill=255)
mask=mask.filter(ImageFilter.MaxFilter(9));rng=random.Random(934)
for name,original in [('male','young_darkskinned_male_diffuse.png'),('female','middleage_darkskinned_female_diffuse.png')]:
    image=Image.open(source/original).convert('RGB');image.thumbnail((1024,1024));tile=Image.new('RGB',(1024,1024),(134,90,61));pixels=tile.load()
    for y in range(295,506):
        for x in range(195,406):
            grain=rng.uniform(-2,2)+1.2*math.sin(x*.4)+1.5*math.sin(y*.12);pixels[x,y]=tuple(round(v+grain) for v in (130,85,57))
    Image.composite(image,tile,mask).save(DEST/(name+'-skin.jpg'),quality=90,optimize=True)
image=Image.open(source/'brown_eye.png').convert('RGB');image.thumbnail((256,256));image.save(DEST/'brown-eye.jpg',quality=90,optimize=True)
rng=random.Random(8193);cloth=Image.new('RGB',(256,256));normal=Image.new('RGB',(256,256));cp=cloth.load();np=normal.load()
for y in range(256):
    for x in range(256):
        weave=(2.8 if x%4<2 else -2.8)+(2.0 if y%4<2 else -2.0);v=round(242+weave+rng.uniform(-2,2));cp[x,y]=(v,v,v);np[x,y]=(128+int(7*math.sin(x*math.pi/2)),128+int(7*math.sin(y*math.pi/2)),254)
cloth.save(DEST/'linen-weave.jpg',quality=90,optimize=True);normal.save(DEST/'linen-normal.png',optimize=True)
def srgb(x):return 12.92*x if x<=.0031308 else 1.055*x**(1/2.4)-.055
# Reload the JPEG to preserve the exact supplied derivative workflow.
cloth=Image.open(DEST/'linen-weave.jpg')
for name,col in {'male-shirt':(.56,.51,.39),'male-trouser':(.205,.225,.19),'female-shirt':(.47,.36,.23),'female-trouser':(.23,.19,.15)}.items():
    out=cloth.copy();pixels=out.load()
    for y in range(out.height):
        for x in range(out.width):pixels[x,y]=tuple(round(cloth.getpixel((x,y))[j]*srgb(col[j])) for j in range(3))
    out.save(DEST/(name+'.jpg'),quality=90,optimize=True)
