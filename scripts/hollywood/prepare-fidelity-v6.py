#!/usr/bin/env python3
"""Newly drawn, deterministic DOS-era surfaces and keyed prop preparation.

No original Duke MAP/ART/GRP data is used. Requires Pillow, fonttools and brotli
(install them in a Python virtual environment). Optional generated
plates in public/img/hollywood-opening/src/fidelity are NOT runtime dependencies.
Old asset versions are deliberately retained for existing authored reels.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageEnhance
import random
import hashlib
import json
import math

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/img/hollywood-opening"
RAW = OUT / "src/fidelity"
R = random.Random(19960129)
FILES = []
# Reuse the bundled OFL font; no machine-specific system font dependency.
from fontTools.ttLib import TTFont
RAW.mkdir(parents=True, exist_ok=True)
lettering = TTFont(ROOT / "public/fonts/oswald-normal.woff2")
lettering.flavor = None
FONT = str(RAW / "lettering.ttf")
lettering.save(FONT)

def save(img, name):
    dest = OUT / name
    img.save(dest, optimize=True)
    FILES.append(name)

def noise(base, size=(128, 128), strength=5):
    im = Image.new("RGB", size)
    im.putdata([tuple(max(0, min(255, c + R.randint(-strength, strength))) for c in base)
                for _ in range(size[0] * size[1])])
    return im

def bricks(name, color, brick=(32, 16), mortar=(32, 30, 27), stagger=True):
    im = noise(color, strength=6); d = ImageDraw.Draw(im)
    bw, bh = brick
    for row, y in enumerate(range(0, 128, bh)):
        offset = -(bw // 2) if stagger and row % 2 else 0
        d.line((0, y, 127, y), fill=mortar, width=2)
        d.line((0, y + 2, 127, y + 2), fill=tuple(min(255, c + 15) for c in color))
        for x in range(offset, 128, bw):
            d.line((x, y, x, y + bh), fill=mortar)
            d.line((x + 1, y + 2, x + 1, y + bh - 1), fill=tuple(min(255, c + 10) for c in color))
            d.line((x + 2, y + bh - 1, x + bw - 1, y + bh - 1), fill=tuple(max(0, c - 20) for c in color))
    save(im.quantize(64).convert("RGB"), name)

bricks("tex6-facade.png", (103, 103, 96), (64, 24), (47, 47, 43))
bricks("tex6-brick.png", (88, 52, 39), (32, 12), (31, 28, 26))
bricks("tex6-concrete.png", (94, 91, 81), (64, 64), (53, 50, 43), False)
bricks("tex6-roof.png", (67, 47, 35), (32, 64), (28, 22, 18), False)

im = noise((47, 47, 44), strength=6)
save(im.quantize(32).convert("RGB"), "tex6-asphalt.png")
im = noise((71, 16, 14), strength=6); d = ImageDraw.Draw(im)
for y in range(0, 128, 8):
    for x in range(0, 128, 8):
        d.point((x + (y % 16) // 2, y), (120, 57, 34))
save(im.quantize(32).convert("RGB"), "tex6-carpet.png")

im = noise((104, 76, 48), strength=7); d = ImageDraw.Draw(im)
for x in range(0, 128, 16):
    d.line((x, 0, x, 127), fill=(37, 27, 18), width=2)
    d.line((x + 2, 0, x + 2, 127), fill=(139, 103, 65))
for y in [4, 7, 118, 121]:
    d.line((0, y, 127, y), fill=(45, 29, 18) if y % 2 else (160, 115, 70), width=2)
save(im.quantize(64).convert("RGB"), "tex6-wood.png")

im = noise((90, 32, 27), strength=4); d = ImageDraw.Draw(im)
# Lower wainscot and restrained upper geometric wallpaper, not huge stone blocks.
for x in range(0, 128, 16):
    d.line((x, 0, x, 79), fill=(121, 63, 42))
    d.polygon([(x + 8, 12), (x + 11, 20), (x + 8, 28), (x + 5, 20)], outline=(167, 112, 64))
d.rectangle((0, 82, 127, 127), fill=(61, 42, 27))
for x in range(0, 128, 32):
    d.rectangle((x + 3, 90, x + 28, 121), outline=(114, 78, 43), width=2)
for y, c in [(80, (44, 25, 17)), (81, (184, 133, 75)), (84, (130, 83, 46)), (125, (25, 21, 19))]:
    d.line((0, y, 127, y), fill=c, width=2)
save(im.quantize(64).convert("RGB"), "tex6-lobby.png")

im = Image.new("RGB", (128, 128)); px = im.load()
for x in range(128):
    v = int(32 + 61 * (0.5 + 0.5 * math.cos(x * math.pi / 16)) ** 1.9)
    for y in range(128):
        n = R.randint(-3, 3); px[x, y] = (v + n, max(0, v // 7 + n), max(0, v // 9 + n))
save(im.quantize(48).convert("RGB"), "tex6-curtain.png")

bricks("tex6-bathroom.png", (136, 144, 134), (16, 16), (60, 69, 63), False)
im = noise((151, 151, 132), strength=3); d = ImageDraw.Draw(im)
for y in range(0, 128, 32):
    for x in range(0, 128, 32):
        d.rectangle((x, y, x + 31, y + 31), outline=(72, 73, 62))
        d.polygon([(x, y - 4), (x + 4, y), (x, y + 4), (x - 4, y)], fill=(32, 35, 31))
save(im.quantize(32).convert("RGB"), "tex6-tiles.png")

im = noise((62, 65, 64), strength=4); d = ImageDraw.Draw(im)
for y in range(0, 128, 8):
    d.rectangle((1, y, 126, y + 3), fill=(19, 24, 24))
    d.line((1, y + 4, 126, y + 4), fill=(108, 110, 101))
for x in [0, 63, 126]:
    d.line((x, 0, x, 127), fill=(40, 41, 36), width=2)
save(im.quantize(32).convert("RGB"), "tex6-vent.png")

im = noise((65, 70, 67), strength=5); d = ImageDraw.Draw(im)
for y in [0, 63, 126]:
    d.line((0, y, 127, y), fill=(24, 30, 27), width=2)
for x in [0, 63, 126]:
    d.line((x, 0, x, 127), fill=(24, 30, 27), width=2)
for x in [5, 58, 69, 122]:
    for y in [5, 58, 69, 122]:
        d.rectangle((x, y, x + 2, y + 2), fill=(117, 124, 112))
save(im.quantize(48).convert("RGB"), "tex6-metal.png")

# Alpha-cut mesh: repeats in world space; holes really show the skyline.
im = Image.new("RGBA", (64, 64)); d = ImageDraw.Draw(im)
for n in range(-64, 129, 16):
    d.line((n, 0, n + 64, 64), fill=(98, 96, 74, 255))
    d.line((n, 0, n - 64, 64), fill=(135, 130, 98, 255))
save(im, "tex6-chainlink.png")

# A sparse window grid used on dimensional facade bays.
im = noise((21, 25, 24), strength=2); d = ImageDraw.Draw(im)
for y in range(2, 128, 32):
    for x in range(3, 128, 32):
        c = R.choice([(36, 44, 39), (47, 54, 42), (112, 109, 60), (151, 140, 84)])
        d.rectangle((x, y, x + 24, y + 24), fill=c, outline=(8, 13, 12), width=2)
        d.line((x, y + 12, x + 24, y + 12), fill=(18, 23, 20), width=2)
        d.line((x + 12, y, x + 12, y + 24), fill=(18, 23, 20), width=2)
        d.line((x, y + 26, x + 25, y + 26), fill=(76, 77, 65))
save(im, "tex6-windows.png")

# Night-time Los Angeles, not an orange burning fantasy sky. Cylindrical
# projection preserves upright buildings and a straight, wrapping horizon.
im = Image.new("RGB", (1024, 256)); d = ImageDraw.Draw(im)
for y in range(256):
    value = max(0, min(1, (y - 30) / 210))
    d.line((0, y, 1023, y), fill=(int(5 + value * 15), int(8 + value * 14), int(12 + value * 15)))
for layer in range(3):
    x = -30
    while x < 1050:
        width = R.randint(25, 80)
        top = R.randint(55, 150) + (2 - layer) * 18
        base = [(16, 23, 25), (12, 18, 20), (7, 11, 12)][layer]
        d.rectangle((x, top, x + width - 3, 255), fill=base)
        d.line((x + 2, top - 1, x + width - 6, top - 1), fill=(30, 35, 31))
        if R.random() > 0.5:
            d.rectangle((x + width // 3, top - 5, x + width * 2 // 3, top), fill=base)
            d.line((x + width // 2, top - 14, x + width // 2, top), fill=(42, 43, 36))
        for y in range(top + 6, 256, 6):
            for wx in range(x + 5, x + width - 6, 7):
                if R.random() < 0.48:
                    c = R.choice([(126, 128, 71), (168, 162, 95), (213, 201, 125), (81, 88, 52)])
                    d.rectangle((wx, y, wx + R.choice([1, 2]), y + 2), fill=c)
        x += width
# Tiny distant red antenna lamps, like the original city's night palette.
for x in [123, 294, 580, 765]:
    d.point((x, 57), fill=(158, 24, 13))
# Seam is a dark vertical building edge at both ends.
d.rectangle((0, 90, 3, 255), fill=(7, 11, 12)); d.rectangle((1020, 90, 1023, 255), fill=(7, 11, 12))
save(im.quantize(96).convert("RGB"), "sky-v6.png")

# Hand-set period signage. No generated pseudo-lettering.
def text_center(d, text, y, width, font, fill):
    box = d.textbbox((0, 0), text, font=font)
    d.text(((width - box[2] + box[0]) // 2, y - box[1]), text, font=font, fill=fill)

im = Image.new("RGB", (384, 112), (42, 35, 28)); d = ImageDraw.Draw(im)
d.rectangle((3, 3, 380, 108), fill=(175, 167, 129), outline=(91, 74, 43), width=3)
for y in [14, 32, 50, 68, 86, 101]: d.line((6, y, 377, y), fill=(138, 131, 105))
font = ImageFont.truetype(FONT, 20)
for text, y in [("ATTACK OF THE", 15), ("BLEACHED BLONDE", 44), ("BIKER BIMBOS", 73)]:
    text_center(d, text, y, 384, font, (37, 31, 25))
for x in range(8, 382, 12):
    d.rectangle((x, 1, x + 2, 3), fill=(243, 207, 125)); d.rectangle((x, 108, x + 2, 110), fill=(243, 207, 125))
save(im, "marquee-v6.png")

im = Image.new("RGB", (48, 224), (45, 16, 13)); d = ImageDraw.Draw(im)
d.rectangle((2, 2, 45, 221), outline=(202, 141, 46), width=2)
d.rectangle((5, 5, 42, 218), outline=(99, 46, 24))
font = ImageFont.truetype(FONT, 30)
for i, letter in enumerate("CINEMA"):
    text_center(d, letter, 9 + i * 34, 48, font, (252, 205, 80))
save(im, "cinema-sign-v6.png")

im = noise((69, 45, 25), (128, 128), 9); d = ImageDraw.Draw(im)
for x in range(0, 128, 21): d.line((x, 0, x, 127), fill=(29, 24, 16), width=2)
for y in [18, 96]:
    d.rectangle((0, y, 127, y + 12), fill=(122, 90, 48))
    for x in [8, 116]: d.rectangle((x, y + 4, x + 2, y + 6), fill=(23, 22, 18))
save(im.quantize(48).convert("RGB"), "tex6-boarded.png")

# Transparent cracks don't paste a mismatched square of masonry onto the wall.
im = Image.new("RGBA", (128, 128)); d = ImageDraw.Draw(im)
paths = [[(63, 0), (61, 22), (73, 38), (57, 55), (66, 78), (52, 103), (58, 127)],
         [(64, 28), (41, 39), (48, 54), (23, 63), (15, 82)],
         [(62, 71), (92, 62), (109, 76), (123, 73)]]
for points in paths:
    d.line([(x + 1, y) for x, y in points], fill=(169, 154, 119, 255), width=3)
    d.line(points, fill=(9, 8, 6, 255), width=2)
save(im, "crack-v6.png")

# Small access-card reader, restroom signs and payphone labels.
for name, text, color in [("restroom-sign-v6.png", "RESTROOMS", (164, 174, 158)),
                           ("exit-sign-v6.png", "EXIT", (140, 13, 8)),
                           ("box-office-v6.png", "BOX OFFICE", (200, 171, 103))]:
    im = Image.new("RGB", (160, 40), (22, 26, 24)); d = ImageDraw.Draw(im)
    d.rectangle((1, 1, 158, 38), outline=color, width=2)
    text_center(d, text, 10, 160, ImageFont.truetype(FONT, 18), color)
    save(im, name)
im = Image.new("RGBA", (32, 48)); d = ImageDraw.Draw(im)
d.rectangle((4, 2, 28, 46), fill=(44, 48, 44), outline=(111, 114, 100), width=2)
d.rectangle((9, 10, 23, 19), fill=(198, 14, 6)); d.rectangle((8, 28, 24, 33), fill=(7, 10, 7))
save(im, "reader-v6.png")

# Holoduke pickup device (the activated decoy uses the separate keyed sprite).
im = Image.new("RGBA", (48, 56)); d = ImageDraw.Draw(im)
d.rectangle((7, 39, 40, 53), fill=(60, 65, 54), outline=(153, 150, 103), width=2)
d.rectangle((12, 43, 25, 48), fill=(26, 210, 71)); d.rectangle((32, 41, 35, 45), fill=(204, 50, 22))
d.polygon([(14, 37), (19, 16), (19, 7), (28, 7), (28, 16), (35, 37)], fill=(49, 116, 71, 255))
d.rectangle((20, 9, 27, 13), fill=(161, 171, 111)); d.line((12, 36, 37, 36), fill=(73, 221, 91), width=2)
save(im, "holoduke-v6.png")

# Boot-view silhouette with explicit pixel clusters rather than browser emoji.
im = Image.new("RGBA", (128, 128)); d = ImageDraw.Draw(im)
d.polygon([(26, 127), (50, 45), (82, 34), (105, 49), (99, 80), (70, 127)], fill=(47, 52, 41))
d.polygon([(50, 53), (54, 26), (66, 14), (91, 9), (112, 18), (116, 38), (101, 57), (93, 89), (64, 81)], fill=(31, 29, 24))
d.line([(57, 31), (69, 20), (91, 16), (104, 22)], fill=(102, 99, 80), width=4)
d.line([(55, 45), (102, 57), (91, 85), (65, 78)], fill=(8, 10, 8), width=5)
for y in [38, 45, 52, 59]: d.line((62, y, 93, y + 5), fill=(88, 85, 66), width=2)
save(im, "boot-v6.png")

# A spray replaces the hydrant after it breaks; the base remains visible.
base = Image.open(OUT / "hydrant.png").convert("RGBA")
base.thumbnail((48, 66), Image.Resampling.NEAREST)
im = Image.new("RGBA", (80, 112)); im.alpha_composite(base, ((80-base.width)//2,112-base.height)); d = ImageDraw.Draw(im)
for _ in range(140):
    x = R.randint(18, 62); y = R.randint(4, 60)
    if abs(x-40) < 6 + (60-y)*0.24: d.rectangle((x, y, x+1, y+3), fill=R.choice([(137,185,184,255),(195,226,215,255),(57,114,139,255)]))
save(im, "hydrant-broken-v6.png")

# Opaque fence/window panels are not used for the exit glass.
im = Image.new("RGBA", (128, 128)); d = ImageDraw.Draw(im)
d.rectangle((1, 1, 126, 126), outline=(138, 160, 147, 255), width=2)
for off in [-45, 13, 85]: d.line((max(0, off), 0, min(127, off+110), 127), fill=(180, 215, 209, 70), width=3)
save(im, "glass-v6.png")

# A non-explicit film still, palette-reduced from our own existing poster art.
poster = Image.open(OUT / "poster-bimbos-v4.png").convert("RGB")
poster = ImageOps.fit(poster, (256, 144), centering=(0.5, 0.48))
poster = ImageOps.grayscale(poster).quantize(8).convert("RGB")
poster = ImageEnhance.Brightness(poster).enhance(0.55)
save(poster, "screen-v6.png")

# Isolated generated set pieces. Key by color, then trim to real opaque bounds.
def keyed(name, target, size):
    source = RAW / name
    if not source.exists():
        if (OUT / target).exists(): FILES.append(target)
        return
    im = Image.open(source).convert("RGBA")
    data = []
    for r, g, b, a in im.getdata():
        if r > 105 and b > 95 and g < min(r,b) * 0.72: data.append((0,0,0,0))
        else: data.append((r,g,b,255))
    im.putdata(data)
    box = im.getbbox()
    if box: im = im.crop(box)
    im.thumbnail(size, Image.Resampling.LANCZOS)
    # Palette ramp without translucent key fringe. Quantization excludes magenta.
    alpha = im.getchannel("A").point(lambda a: 255 if a > 170 else 0)
    im = im.convert("RGB").quantize(96).convert("RGBA"); im.putalpha(alpha)
    canvas = Image.new("RGBA", size)
    canvas.alpha_composite(im, ((size[0]-im.width)//2, size[1]-im.height))
    save(canvas, target)
keyed("skycar.png", "skycar-v6.png", (256, 128))
keyed("turret.png", "turret-v6.png", (96, 96))
keyed("holoduke.png", "holo-decoy-v6.png", (64, 128))

# A small original 5x7 pixel font. No extracted game font or remote font service.
# Glyph shapes are hand-specified here; fontTools is optional after generation.
try:
    from fontTools.fontBuilder import FontBuilder
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    alphabet = {
        'A':['01110','11011','11011','11111','11011','11011','11011'],
        'B':['11110','11011','11011','11110','11011','11011','11110'],
        'C':['01111','11000','11000','11000','11000','11000','01111'],
        'D':['11110','11011','11011','11011','11011','11011','11110'],
        'E':['11111','11000','11000','11110','11000','11000','11111'],
        'F':['11111','11000','11000','11110','11000','11000','11000'],
        'G':['01111','11000','11000','11011','11011','11011','01111'],
        'H':['11011','11011','11011','11111','11011','11011','11011'],
        'I':['11111','00100','00100','00100','00100','00100','11111'],
        'J':['00111','00011','00011','00011','11011','11011','01110'],
        'K':['11011','11011','11110','11100','11110','11011','11011'],
        'L':['11000','11000','11000','11000','11000','11000','11111'],
        'M':['10001','11011','11111','10101','10001','10001','10001'],
        'N':['10001','11001','11101','10111','10011','10001','10001'],
        'O':['01110','11011','11011','11011','11011','11011','01110'],
        'P':['11110','11011','11011','11110','11000','11000','11000'],
        'Q':['01110','11011','11011','11011','11111','01110','00011'],
        'R':['11110','11011','11011','11110','11100','11010','11011'],
        'S':['01111','11000','11000','01110','00011','00011','11110'],
        'T':['11111','00100','00100','00100','00100','00100','00100'],
        'U':['11011','11011','11011','11011','11011','11011','01110'],
        'V':['11011','11011','11011','11011','11011','01110','00100'],
        'W':['10001','10001','10001','10101','11111','11011','10001'],
        'X':['11011','11011','01110','00100','01110','11011','11011'],
        'Y':['11011','11011','11011','01110','00100','00100','00100'],
        'Z':['11111','00011','00110','01100','11000','11000','11111'],
        '0':['01110','11011','11011','11011','11011','11011','01110'],
        '1':['00110','01110','00110','00110','00110','00110','11111'],
        '2':['01110','11011','00011','00110','01100','11000','11111'],
        '3':['11110','00011','00011','01110','00011','00011','11110'],
        '4':['11011','11011','11011','11111','00011','00011','00011'],
        '5':['11111','11000','11000','11110','00011','00011','11110'],
        '6':['01110','11000','11000','11110','11011','11011','01110'],
        '7':['11111','00011','00011','00110','00110','01100','01100'],
        '8':['01110','11011','11011','01110','11011','11011','01110'],
        '9':['01110','11011','11011','01111','00011','00011','01110'],
        '.':['0','0','0','0','0','1','1'], ':':['0','1','1','0','1','1','0'],
        '-':['00000','00000','00000','11111','00000','00000','00000'],
        '/':['00001','00011','00110','00100','01100','11000','10000'],
        '%':['11001','11011','00110','00100','01100','11011','10011'],
        '!':['1','1','1','1','1','0','1'], '?':['11110','00011','00110','01100','01100','00000','01100'],
        '+':['00000','00100','00100','11111','00100','00100','00000'],
        '[':['111','110','110','110','110','110','111'], ']':['111','011','011','011','011','011','111'],
        "'":['1','1','0','0','0','0','0'],
    }
    glyphs = {'.notdef': TTGlyphPen(None).glyph(), 'space': TTGlyphPen(None).glyph()}
    metrics = {'.notdef': (600,0), 'space': (400,0)}; cmap = {32:'space'}
    for letter, rows in alphabet.items():
        name = f'uni{ord(letter):04X}'; pen = TTGlyphPen(None)
        # Union pixel squares before making contours. Adjacent individual
        # contours leave antialias seams at non-integer browser font sizes.
        edges = set()
        for y, row in enumerate(rows):
            for x, on in enumerate(row):
                if on == '1':
                    left, bottom = x*100, (6-y)*100
                    points = [(left,bottom),(left+100,bottom),(left+100,bottom+100),(left,bottom+100)]
                    for i, a in enumerate(points):
                        b = points[(i+1)%4]
                        if (b,a) in edges: edges.remove((b,a))
                        else: edges.add((a,b))
        while edges:
            start, at = min(edges); edges.remove((start,at)); pen.moveTo(start); pen.lineTo(at)
            while at != start:
                nxt = min(b for a,b in edges if a == at)
                edges.remove((at,nxt)); at = nxt
                if at != start: pen.lineTo(at)
            pen.closePath()
        glyphs[name] = pen.glyph(); metrics[name] = ((len(rows[0])+1)*100,0); cmap[ord(letter)] = name
        if letter.isalpha(): cmap[ord(letter.lower())] = name
    fb = FontBuilder(1000, isTTF=True); fb.setupGlyphOrder(list(glyphs)); fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics); fb.setupHorizontalHeader(ascent=800,descent=-200)
    fb.setupNameTable({'familyName':'Reel Sector','styleName':'Regular','uniqueFontIdentifier':'ScarletReelSector1','fullName':'Reel Sector','psName':'ReelSector'})
    fb.setupOS2(sTypoAscender=800,sTypoDescender=-200,usWinAscent=800,usWinDescent=200); fb.setupPost()
    fb.font.flavor='woff2'; fb.save(ROOT / 'public/fonts/reel-sector.woff2')
except ImportError:
    pass

manifest = {name: {"sha256":hashlib.sha256((OUT/name).read_bytes()).hexdigest(), "bytes":(OUT/name).stat().st_size} for name in sorted(FILES)}
(OUT / 'fidelity-v6-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
print(f'Prepared {len(FILES)} versioned runtime assets; old art retained.')
