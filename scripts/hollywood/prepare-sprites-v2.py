#!/usr/bin/env python3
"""Prepare the second, classic-DOS sprite pass (Pillow only).

Inputs are nine newly generated plates in public/img/hollywood-opening/src/sprites-v2.
Only *-v2 PNGs and the manifest are shipped. V1 files/layouts are never overwritten.
The requested extra frontal-walk plate failed at the generation cap; frontal
walking is made from the generated idle pose with small, grounded leg movements.
"""
from collections import Counter, deque
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageOps
import hashlib
import json
import math

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/img/hollywood-opening'
SRC = OUT / 'src/sprites-v2'
FRAME = 96
GROUND = 94
MANIFEST = {'version': 2, 'enemies': {}, 'weapons': {}, 'props': {}}


def background(im):
    rgb = im.convert('RGB')
    w, h = rgb.size
    points = [rgb.getpixel((x, y)) for x in range(4, w-4, max(1, w//40))
              for y in [4, min(h-1, 8), max(0, h-9)]]
    return Counter(points).most_common(1)[0][0]


def matte(im):
    """Connected background removal, then saturated-magenta holes/despill.

    Muted background colors are removed only when connected to the outside;
    this preserves the brown/pink skin instead of globally punching holes in it.
    The final native-pixel sprites have binary alpha: no purple soft fringe.
    """
    im = im.convert('RGB')
    w, h = im.size
    pixels = list(im.getdata())
    bg = background(im)
    eligible = bytearray(w*h)
    strong = bytearray(w*h)
    for i, (r, g, b) in enumerate(pixels):
        magenta = r > 1.75*g and b > 1.75*g and min(r, b) > 8
        close = (r-bg[0])**2+(g-bg[1])**2+(b-bg[2])**2 < 70**2
        eligible[i] = magenta or close
        strong[i] = magenta
    removed = bytearray(w*h)
    queue = deque()
    for i in list(range(w)) + list(range(w*(h-1), w*h)) + [y*w for y in range(h)] + [y*w+w-1 for y in range(h)]:
        if eligible[i] and not removed[i]:
            removed[i] = 1
            queue.append(i)
    while queue:
        i = queue.popleft()
        x, y = i % w, i // w
        for n in ((i-1 if x else -1), (i+1 if x<w-1 else -1), (i-w if y else -1), (i+w if y<h-1 else -1)):
            if n >= 0 and eligible[n] and not removed[n]:
                removed[n] = 1
                queue.append(n)
    out = Image.new('RGBA', (w, h))
    data = []
    for i, (r, g, b) in enumerate(pixels):
        if removed[i] or strong[i]:
            data.append((0, 0, 0, 0))
        else:
            # Spill suppression, limited to the border of the extracted shape.
            x, y = i % w, i // w
            border = any(removed[n] for n in ((i-1 if x else i), (i+1 if x<w-1 else i), (i-w if y else i), (i+w if y<h-1 else i)))
            if border and r > g*1.3 and b > g*1.3:
                grey = min(r, b, max(g, 14))
                r, b = min(r, grey+12), min(b, grey+12)
            data.append((r, g, b, 255))
    out.putdata(data)
    return out


def strip_cells(name, count):
    """Respect actual generated divider locations rather than clipping fingers.

    The generator occasionally draws narrow grid lines despite the prompt.
    Detect those lines near the expected boundaries and exclude them.
    """
    im = Image.open(SRC / f'{name}.png').convert('RGB')
    small = im.resize((im.width, 64), Image.Resampling.NEAREST)
    cuts = [0]
    for i in range(1, count):
        center = round(i*im.width/count)
        radius = round(im.width/count*.16)
        candidates = []
        for x in range(center-radius, center+radius+1):
            dark = sum(max(small.getpixel((x, y))) < 75 for y in range(64))
            if dark >= 60:
                candidates.append(x)
        cuts.append(min(candidates, key=lambda x: abs(x-center)) if candidates else center)
    cuts.append(im.width)
    return [matte(im.crop((cuts[i]+3, 3, cuts[i+1]-3, im.height-3))) for i in range(count)]


def trim(im):
    bounds = im.getbbox()
    if not bounds:
        raise ValueError('Empty generated sprite')
    return im.crop(bounds)


def actor_frame(im, state, who, side):
    im = trim(im)
    if state < 4:
        scale = min(88/im.height, 88/im.width)
    elif state == 4:
        scale = min(66/im.height, 86/im.width)
    else:
        scale = min(38/im.height, 86/im.width)
    width, height = max(1,round(im.width*scale)), max(1,round(im.height*scale))
    if state < 4:
        # The initial concepts were too lean. Match the broad original-era
        # silhouettes without stretching the billboard in the renderer.
        if side in ('front','back'): width = 56 if who == 'trooper' else 64
        else: width = min(88,round(width*1.2))
    im = im.resize((width,height),Image.Resampling.LANCZOS)
    # Feet/pelvis anchor: a muzzle flash must not pull the whole actor sideways.
    if state < 4:
        legs = im.getchannel('A').crop((0, im.height*2//3, im.width, im.height)).getbbox()
        anchor = (legs[0]+legs[2])/2 if legs else im.width/2
    else:
        anchor = im.width/2
    x = round(FRAME/2-anchor)
    x = max(2, min(FRAME-im.width-2, x))
    out = Image.new('RGBA', (FRAME, FRAME))
    out.alpha_composite(im, (x, GROUND-im.height))
    return out


def front_step(idle, leading_left):
    """Frontal gait without turning the head/body into a side-view frame."""
    out = Image.new('RGBA', idle.size)
    waist, center = 54, FRAME//2
    for left, x0, x1 in [(True, 0, center), (False, center, FRAME)]:
        leg = idle.crop((x0, waist, x1, GROUND))
        lead = left == leading_left
        height = leg.height if lead else leg.height-4
        leg = leg.resize((leg.width, height), Image.Resampling.NEAREST)
        out.alpha_composite(leg, (x0, waist))
    upper = idle.crop((0, 0, FRAME, waist+3))
    out.alpha_composite(upper, (0, 0))
    return out


def pixel_finish(im, colors=64):
    alpha = im.getchannel('A').point(lambda a: 255 if a >= 155 else 0)
    rgb = im.convert('RGB')
    rgb = ImageEnhance.Color(rgb).enhance(.82)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.08)
    rgb = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    result = rgb.convert('RGBA')
    result.putalpha(alpha)
    # Canonical transparent pixels also compress well and cannot leak chroma.
    result.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in result.getdata()])
    return result


def save(name, im):
    path = OUT/name
    im.save(path, optimize=True)
    return {'file': name, 'width': im.width, 'height': im.height, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


for who in ['trooper', 'pigcop']:
    source = {side: strip_cells(f'{who}-{side}', 6) for side in ['front','right','back']}
    # The Pig Cop right strip put its shot in cell 2, not cell 3. Select poses
    # explicitly instead of letting an attack/kneel enter a walking cycle.
    maps = {'front':[0,1,2,3,4,5], 'back':[0,1,2,3,4,5],
            'right': [1,2,1,3,4,5] if who == 'trooper' else [0,1,0,2,4,5]}
    sides = {side:[actor_frame(source[side][idx], state, who, side) for state,idx in enumerate(maps[side])] for side in source}
    sides['front'][1] = front_step(sides['front'][0], True)
    sides['front'][2] = front_step(sides['front'][0], False)
    # quakeMath heading convention: 1 = left-facing profile, 3 = right.
    rows = [sides['front'], [ImageOps.mirror(im) for im in sides['right']], sides['back'], sides['right']]
    atlas = Image.new('RGBA', (FRAME*6, FRAME*4))
    for row,frames in enumerate(rows):
        for col,im in enumerate(frames): atlas.alpha_composite(im,(col*FRAME,row*FRAME))
    atlas = pixel_finish(atlas, 64)
    data = save(f'{who}-v2-sheet.png', atlas)
    data.update(frameWidth=FRAME, frameHeight=FRAME, columns=6, rows=4,
                directions=['front','left-profile','back','right-profile'],
                states=['idle','walk-a','walk-b','attack','collapse','dead'])
    MANIFEST['enemies'][who] = data

for who in ['pistol','shotgun']:
    cells = strip_cells(who,4)
    frames = [im.resize((128,128),Image.Resampling.LANCZOS) for im in cells]
    if who == 'pistol':
        # The generated third frame rotated the gun side-on. A short recoil
        # from the forward-aimed pose is more faithful and keeps the sight line.
        recoil = Image.new('RGBA',(128,128))
        recoil.alpha_composite(frames[0], (1,-3))
        frames[2] = recoil
    atlas=Image.new('RGBA',(512,128))
    for i,im in enumerate(frames): atlas.alpha_composite(im,(128*i,0))
    data=save(f'{who}-v2-sheet.png',pixel_finish(atlas,64))
    data.update(frameWidth=128,frameHeight=128,columns=4,rows=1)
    MANIFEST['weapons'][who]=data

props = Image.open(SRC/'props.png')
for i,(name,size) in enumerate([
    ('c9',(48,72)),('medkit',(28,22)),('armor',(32,42)),('pistol-ammo',(12,26)),
    ('shells',(28,20)),('shotgun-pickup',(64,20)),('popcorn',(64,88)),('arcade',(45,96)),
]):
    x,y=i%4,i//4
    part=matte(props.crop((round(x*props.width/4)+3,round(y*props.height/2)+3,
                          round((x+1)*props.width/4)-3,round((y+1)*props.height/2)-3)))
    part=trim(part)
    if name == 'shotgun-pickup': part=trim(part.rotate(-45,expand=True,resample=Image.Resampling.BICUBIC))
    part.thumbnail(size,Image.Resampling.LANCZOS)
    MANIFEST['props'][name]=save(f'{name}-v2.png',pixel_finish(part,48))

(OUT/'sprites-v2-manifest.json').write_text(json.dumps(MANIFEST,indent=2)+'\n')
print('Prepared 12 versioned sprite assets; 24 frames per enemy; 64-color / binary-alpha atlases.')
