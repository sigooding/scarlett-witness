#!/usr/bin/env python3
"""Prepare eight original generated atlases; raw src/ plates stay ignored.
Requires Pillow. Ships compact alpha sprites and textures, never source plates.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'public/img/hollywood-opening'
SRC = OUT/'src'
OUT.mkdir(parents=True, exist_ok=True)

def cell(im, i, cols, rows, inset=2):
    w,h=im.size; x=i%cols; y=i//cols
    return im.crop((round(x*w/cols)+inset,round(y*h/rows)+inset,round((x+1)*w/cols)-inset,round((y+1)*h/rows)-inset))
def key(im):
    im=im.convert('RGBA'); bg=im.getpixel((1,1)); data=[]
    for r,g,b,a in im.getdata():
        dist=math.sqrt((r-bg[0])**2+(g-bg[1])**2+(b-bg[2])**2)
        if dist<43 or (r>40 and b>40 and r>g*1.8 and b>g*1.8): a=0
        elif dist<65: a=round((dist-43)/22*255)
        data.append((r,g,b,a))
    im.putdata(data); return im

def prop_atlas(name,names):
    im=Image.open(SRC/f'{name}.png')
    for i,name in enumerate(names):
        part=key(cell(im,i,4,4)); box=part.getbbox()
        if box: part=part.crop(box)
        part.thumbnail((192,224), Image.Resampling.LANCZOS)
        part.save(OUT/f'{name}.png', optimize=True)

prop_atlas('street-props', ['hvac','c9','crate','dumpster','hydrant','palm','streetlamp','newspaper','trash-bags','trash-can','junction','fan','bench','phonebooth','aerial','fire'])
prop_atlas('cinema-props', ['seat-front','seat-back','arcade','popcorn','register','soda','urinal','toilet','sink','extinguisher','projector','fern','film-reel','wastebasket','payphone','monitor'])
prop_atlas('pickups', ['medkit','armor','pistol-ammo','shells','red-key','blue-key','shotgun-pickup','pistol-pickup','blast-1','blast-2','blast-3','smoke','spark','battery','bottle','debris'])
for name in ['trooper','pigcop']:
    im=Image.open(SRC/f'{name}.png'); out=Image.new('RGBA',(512,512))
    for i in range(16): out.paste(key(cell(im,i,4,4)).resize((128,128), Image.Resampling.LANCZOS), ((i%4)*128,(i//4)*128))
    out.save(OUT/f'{name}-sheet.png', optimize=True)
im=Image.open(SRC/'weapons.png')
for row,name in enumerate(['pistol','shotgun']):
    out=Image.new('RGBA',(1024,256))
    for i in range(4): out.paste(key(cell(im,i+row*4,4,2)).resize((256,256),Image.Resampling.LANCZOS),(i*256,0))
    out.save(OUT/f'{name}-sheet.png', optimize=True)
im=Image.open(SRC/'materials.png')
for i,name in enumerate(['brick','concrete','windows','shutter','asphalt','gravel','carpet','tiles']):
    cell(im,i,4,2,0).convert('RGB').resize((256,256),Image.Resampling.LANCZOS).save(OUT/f'tex-{name}.webp',quality=88)
Image.open(SRC/'sky.png').convert('RGB').resize((1792,592)).save(OUT/'sky.webp',quality=88)

# Deliberately typeset signage, not unreliable text inside AI texture atlases.
font='/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf'
if not Path(font).exists(): font='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def f(size): return ImageFont.truetype(font,size)
def sign(name,size,bg,fg,lines):
    im=Image.new('RGB',size,bg);d=ImageDraw.Draw(im)
    d.rectangle((5,5,size[0]-6,size[1]-6),outline=fg,width=4)
    step=size[1]/len(lines)
    for n,text in enumerate(lines):
        sz=min(int(step*.62),int(size[0]*1.4/max(len(text),1))); fo=f(sz)
        d.text((size[0]/2,step*(n+.5)),text,font=fo,fill=fg,anchor='mm',stroke_width=1)
    im.save(OUT/f'{name}.png',optimize=True)
sign('cinema-sign',(192,640),'#5c1310','#ffca54',list('CINEMA'))
sign('marquee',(768,192),'#d4c391','#321e18',['NOW SHOWING','MIDNIGHT • DOUBLE FEATURE'])
sign('innocent',(640,256),'#d2cdc0','#25262b',['INNOCENT?','THE CITY WANTS ANSWERS'])
sign('exit-sign',(256,128),'#133b2a','#b3ff99',['EXIT'])
sign('no-parking',(192,256),'#d0c5ab','#711c13',['NO','PARKING','ANY TIME'])
sign('screen',(640,360),'#19262d','#7b969b',['SIGNAL INTERRUPTED','HOLLYWOOD • 1996'])
sign('poster',(256,384),'#301e25','#e5b27f',['MIDNIGHT','PURSUIT','ONE CITY.','NO WAY OUT.'])
sign('end-switch',(128,192),'#343b39','#91eb78',['EXIT','☢','USE'])
sign('switch',(128,192),'#242c2e','#cf7353',['POWER','ON'])
# Durable cover is original artwork plus type, not an extracted game image.
cover=Image.open(OUT/'sky.webp').resize((720,960));d=ImageDraw.Draw(cover)
d.rectangle((0,380,720,960),fill='#1d252c')
for x,h in [(0,320),(95,460),(230,400),(510,420),(640,340)]:
 d.rectangle((x,h,x+110,940),fill='#292c30')
 for yy in range(h+20,850,48):
  for xx in range(x+10,x+105,28): d.rectangle((xx,yy,xx+13,yy+23),fill='#727464')
d.polygon([(235,960),(485,960),(390,440),(350,440)],fill='#4b4540')
for i,text in enumerate(['HOLLYWOOD','OPENING']): d.text((360,110+i*80),text,font=f(72),fill='#efd3a1',anchor='mm',stroke_width=3,stroke_fill='#151819')
d.text((360,288),'DUKE NUKEM 3D • FAN STUDY',font=f(22),fill='#e8b776',anchor='mm')
d.text((360,900),'A PLAYABLE FIRST-PERSON RECONSTRUCTION',font=f(19),fill='#e8b776',anchor='mm')
cover.save(OUT/'cover.webp',quality=90)
print('Prepared',len(list(OUT.glob('*.*'))),'shipped files')
