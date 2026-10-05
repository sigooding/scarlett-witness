#!/usr/bin/env python3
"""Hollywood texture pass 2: seamless 256px wall/floor materials, sky and cover.

Raw generated plates live in the ignored public/img/hollywood-opening/src/tex-v2/.
Outputs (committed):  tex2-<name>.webp, sky-v2.webp, cover-v2.webp
Each material is made tileable by cross-blending a border strip with the
opposite edge, then quantised to a 128-colour palette for the Build-era look.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/img/hollywood-opening"
SRC = OUT / "src/tex-v2"


def seamless(im: Image.Image, blend=0.12) -> Image.Image:
    im = im.convert("RGB")
    w, h = im.size
    bw, bh = int(w * blend), int(h * blend)
    # Offset by half, blend the visible seam, offset back.
    shifted = Image.new("RGB", (w, h))
    shifted.paste(im.crop((w // 2, 0, w, h)), (0, 0))
    shifted.paste(im.crop((0, 0, w // 2, h)), (w // 2, 0))
    seam = shifted.crop((w // 2 - bw, 0, w // 2 + bw, h))
    mask = Image.linear_gradient("L").rotate(90, expand=True).resize((bw * 2, h))
    left = shifted.crop((w // 2 - bw, 0, w // 2 + bw, h))
    right = Image.new("RGB", (bw * 2, h))
    right.paste(im.crop((w - bw, 0, w, h)), (0, 0))
    right.paste(im.crop((0, 0, bw, h)), (bw, 0))
    shifted.paste(Image.composite(right, left, mask), (w // 2 - bw, 0))
    out = Image.new("RGB", (w, h))
    out.paste(shifted.crop((w // 2, 0, w, h)), (0, 0))
    out.paste(shifted.crop((0, 0, w // 2, h)), (w // 2, 0))
    im = out
    # Same trick vertically.
    shifted = Image.new("RGB", (w, h))
    shifted.paste(im.crop((0, h // 2, w, h)), (0, 0))
    shifted.paste(im.crop((0, 0, w, h // 2)), (0, h // 2))
    mask = Image.linear_gradient("L").resize((w, bh * 2))
    top = shifted.crop((0, h // 2 - bh, w, h // 2 + bh))
    bottom = Image.new("RGB", (w, bh * 2))
    bottom.paste(im.crop((0, h - bh, w, h)), (0, 0))
    bottom.paste(im.crop((0, 0, w, bh)), (0, bh))
    shifted.paste(Image.composite(bottom, top, mask), (0, h // 2 - bh))
    out = Image.new("RGB", (w, h))
    out.paste(shifted.crop((0, h // 2, w, h)), (0, 0))
    out.paste(shifted.crop((0, 0, w, h // 2)), (0, h // 2))
    return out


def palette(im: Image.Image, colors=128) -> Image.Image:
    return im.quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


MATERIALS = {
    # name: (source, blend, unused)
    "facade": ("facade.png", 0.10, True),
    "brick": ("brick.png", 0.10, True),
    "curtain": ("curtain.png", 0.08, False),  # folds run vertically; keep V
    "lobby-wall": ("lobby-wall.png", 0.10, True),
    "carpet": ("carpet.png", 0.10, True),
    "bathroom-tile": ("bathroom-tile.png", 0.06, False),
    "wood-panel": ("wood-panel.png", 0.08, False),
    "metal-panel": ("metal-panel.png", 0.08, True),
}
for name, (src, blend, vert) in MATERIALS.items():
    im = Image.open(SRC / src).convert("RGB")
    im = seamless(im, blend)
    im = im.resize((256, 256), Image.Resampling.LANCZOS)
    palette(im).save(OUT / f"tex2-{name}.webp", quality=90)
    print("tex2-" + name)

# Derived materials from the same plates so the set stays coherent.
fac = Image.open(OUT / "tex2-facade.webp").convert("RGB")
# Concrete = desaturated facade with less block contrast (ceilings / parapets).
grey = fac.convert("L").convert("RGB")
palette(Image.blend(fac, grey, 0.7)).save(OUT / "tex2-concrete.webp", quality=90)

sky = Image.open(SRC / "sky.png").convert("RGB")
sky = seamless(sky.resize((1792, 592)), 0.08)
palette(sky, 192).save(OUT / "sky-v2.webp", quality=88)

cover = Image.open(SRC / "cover.png").convert("RGB").resize((720, 960))
d = ImageDraw.Draw(cover)
font = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
if not Path(font).exists():
    font = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
try:
    big, small = ImageFont.truetype(font, 78), ImageFont.truetype(font, 26)
except OSError:
    big = small = ImageFont.load_default()
for dx, dy in ((4, 4), (-2, -2), (0, 0)):
    col = "#1a0800" if (dx, dy) != (0, 0) else "#ffd257"
    d.text((360 + dx, 60 + dy), "HOLLYWOOD", font=big, fill=col, anchor="mm")
    d.text((360 + dx, 140 + dy), "HOLOCAUST", font=big, fill=col, anchor="mm")
d.rectangle((0, 880, 720, 960), fill="#0a0604")
d.text((360, 920), "L.A. MELTDOWN  ·  LEVEL ONE  ·  UNOFFICIAL FAN STUDY", font=small, fill="#e7be75", anchor="mm")
cover.save(OUT / "cover-v2.webp", quality=90)
print("sky-v2, cover-v2, tex2-concrete")

# ---- Typeset signage and simple drawn props for the original-layout pass ----
def f(size):
    try:
        return ImageFont.truetype(font, size)
    except OSError:
        return ImageFont.load_default()


def sign(name, size, bg, fg, lines, border=4, pad=5):
    im = Image.new("RGB", size, bg)
    d = ImageDraw.Draw(im)
    if border:
        d.rectangle((pad, pad, size[0] - pad - 1, size[1] - pad - 1), outline=fg, width=border)
    step = size[1] / len(lines)
    for n, text in enumerate(lines):
        sz = min(int(step * 0.62), int(size[0] * 1.45 / max(len(text), 1)))
        d.text((size[0] / 2, step * (n + 0.5)), text, font=f(sz), fill=fg, anchor="mm", stroke_width=1)
    palette(im, 64).save(OUT / f"{name}.png", optimize=True)
    return im


# Original-level marquee (the theatre is showing the Biker Bimbos picture).
sign("marquee-v2", (768, 192), "#e8dcb6", "#1e1613",
     ["ATTACK OF THE BLEACHED", "BLONDE BIKER BIMBOS"])
# Adult-cinema poster used for secret 3 (the steroids compartment).
sign("poster-bimbos", (256, 384), "#6b1420", "#ffd66b",
     ["BIKER", "BIMBOS", "XXX", "NOW SHOWING"])
sign("keep-out", (256, 128), "#c9b13a", "#141414", ["KEEP OUT"])
sign("ledge-sign", (384, 128), "#2a2f36", "#d9d9d9", ["HOLLYWOOD  BLVD"])

# Cracked wall: a wall sprite laid over facade texture; shooting it "breaks" it.
crack = Image.open(OUT / "tex2-facade.webp").convert("RGBA").resize((256, 256))
d = ImageDraw.Draw(crack)
pts = [(128, 10), (118, 60), (140, 95), (112, 140), (135, 180), (120, 246)]
for a, b in zip(pts, pts[1:]):
    d.line([a, b], fill=(20, 16, 14, 255), width=9)
    d.line([a, b], fill=(60, 52, 46, 255), width=3)
for x, y in [(118, 60), (140, 95), (112, 140), (135, 180)]:
    for dx, dy in [(-30, -12), (28, 10), (-22, 18), (26, -20)]:
        d.line([(x, y), (x + dx, y + dy)], fill=(24, 20, 18, 255), width=4)
crack.save(OUT / "cracked-wall.png", optimize=True)

# Air vent grate (bathroom secret shaft entrance).
vent = Image.new("RGBA", (192, 128), (58, 62, 66, 255))
d = ImageDraw.Draw(vent)
d.rectangle((0, 0, 191, 127), outline=(28, 30, 32, 255), width=6)
for y in range(14, 118, 12):
    d.rectangle((12, y, 179, y + 5), fill=(22, 24, 26, 255))
vent.save(OUT / "vent.png", optimize=True)

# Glass pane for the exit-button window (breakable).
glass = Image.new("RGBA", (256, 256), (140, 190, 220, 90))
d = ImageDraw.Draw(glass)
d.rectangle((0, 0, 255, 255), outline=(40, 44, 50, 255), width=8)
d.line([(128, 0), (128, 255)], fill=(40, 44, 50, 255), width=6)
d.line([(0, 128), (255, 128)], fill=(40, 44, 50, 255), width=6)
d.line([(20, 30), (90, 100)], fill=(230, 240, 250, 160), width=3)
glass.save(OUT / "glass.png", optimize=True)

# Atomic health: glowing blue atom.
atom = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
d = ImageDraw.Draw(atom)
for ang in (0, 60, 120):
    ring = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((24, 52, 104, 76), outline=(90, 170, 255, 255), width=5)
    atom.alpha_composite(ring.rotate(ang))
d.ellipse((52, 52, 76, 76), fill=(210, 240, 255, 255))
atom.save(OUT / "atomic.png", optimize=True)

# Steroids bottle, pipe bombs, jetpack, night vision, portable medkit, rocket box, RPG pickup.
def blob(name, size, draw):
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    draw(ImageDraw.Draw(im))
    im.save(OUT / f"{name}.png", optimize=True)


blob("steroids", (64, 96), lambda d: (
    d.rounded_rectangle((12, 20, 52, 92), 8, fill=(40, 70, 170, 255), outline=(15, 20, 40, 255), width=3),
    d.rectangle((10, 6, 54, 24), fill=(230, 230, 230, 255), outline=(60, 60, 60, 255), width=2),
    d.rectangle((16, 44, 48, 70), fill=(220, 40, 40, 255)),
    d.text((32, 57), "Rx", fill=(255, 255, 255, 255), anchor="mm", font=f(18)),
))
blob("pipebombs", (96, 64), lambda d: [
    (d.rounded_rectangle((8 + i * 26, 12, 30 + i * 26, 56), 6, fill=(78, 92, 60, 255), outline=(20, 24, 16, 255), width=2),
     d.rectangle((8 + i * 26, 20, 30 + i * 26, 26), fill=(40, 44, 36, 255)),
     d.rectangle((8 + i * 26, 42, 30 + i * 26, 48), fill=(40, 44, 36, 255))) for i in range(3)])
blob("jetpack", (96, 112), lambda d: (
    d.rounded_rectangle((16, 8, 44, 84), 8, fill=(120, 124, 130, 255), outline=(30, 30, 34, 255), width=3),
    d.rounded_rectangle((52, 8, 80, 84), 8, fill=(120, 124, 130, 255), outline=(30, 30, 34, 255), width=3),
    d.rectangle((40, 30, 56, 44), fill=(200, 60, 40, 255)),
    d.polygon([(20, 84), (40, 84), (30, 108)], fill=(255, 150, 40, 255)),
    d.polygon([(56, 84), (76, 84), (66, 108)], fill=(255, 150, 40, 255)),
))
blob("nightvision", (96, 56), lambda d: (
    d.rounded_rectangle((6, 14, 90, 46), 10, fill=(38, 40, 44, 255), outline=(10, 10, 12, 255), width=3),
    d.ellipse((14, 18, 42, 44), fill=(60, 200, 90, 255), outline=(10, 40, 20, 255), width=3),
    d.ellipse((54, 18, 82, 44), fill=(60, 200, 90, 255), outline=(10, 40, 20, 255), width=3),
))
blob("portable-medkit", (80, 64), lambda d: (
    d.rounded_rectangle((4, 12, 76, 60), 6, fill=(235, 235, 235, 255), outline=(60, 60, 60, 255), width=3),
    d.rectangle((28, 4, 52, 16), fill=(120, 120, 120, 255)),
    d.rectangle((34, 24, 46, 50), fill=(210, 30, 30, 255)),
    d.rectangle((26, 32, 54, 42), fill=(210, 30, 30, 255)),
))
blob("rockets", (96, 64), lambda d: [
    (d.rectangle((10 + i * 20, 14, 24 + i * 20, 56), fill=(110, 116, 100, 255), outline=(30, 30, 30, 255), width=2),
     d.polygon([(10 + i * 20, 14), (24 + i * 20, 14), (17 + i * 20, 2)], fill=(200, 40, 40, 255))) for i in range(4)])
blob("rpg-pickup", (160, 56), lambda d: (
    d.rounded_rectangle((4, 18, 150, 40), 8, fill=(84, 96, 72, 255), outline=(20, 24, 18, 255), width=3),
    d.ellipse((134, 10, 158, 48), fill=(60, 66, 54, 255), outline=(20, 24, 18, 255), width=3),
    d.rectangle((50, 40, 64, 54), fill=(40, 40, 40, 255)),
    d.rectangle((90, 8, 110, 18), fill=(40, 40, 40, 255)),
))
# Rocket launcher view strips: idle, fire (flash), recoil, idle.
def rpg_frame(flash: float):
    im = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lift = int(flash * 6)
    d.polygon([(44, 128), (84, 128), (78, 60 - lift), (50, 60 - lift)], fill=(76, 86, 66, 255), outline=(22, 26, 20, 255))
    d.rectangle((46, 56 - lift, 82, 66 - lift), fill=(40, 44, 38, 255))
    d.ellipse((50, 40 - lift, 78, 62 - lift), fill=(58, 64, 52, 255), outline=(22, 26, 20, 255), width=2)
    d.ellipse((58, 46 - lift, 70, 56 - lift), fill=(16, 16, 16, 255))
    d.rectangle((84, 96, 112, 128), fill=(196, 150, 110, 255), outline=(90, 60, 40, 255), width=2)
    if flash > 0:
        r = int(28 * flash)
        d.ellipse((64 - r, 50 - lift - r, 64 + r, 50 - lift + r), fill=(255, 220, 120, int(230 * flash)))
        d.ellipse((64 - r // 2, 50 - lift - r // 2, 64 + r // 2, 50 - lift + r // 2), fill=(255, 255, 220, 255))
    return im


strip = Image.new("RGBA", (512, 128), (0, 0, 0, 0))
for i, fl in enumerate((0, 1, 0.45, 0)):
    strip.paste(rpg_frame(fl), (i * 128, 0))
strip.save(OUT / "rpg-sheet.png", optimize=True)
print("signage, props, rpg-sheet")
