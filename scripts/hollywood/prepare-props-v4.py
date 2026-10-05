#!/usr/bin/env python3
"""Fourth art pass: generated props for the full Hollywood Holocaust layout.

Reads generated magenta-keyed plates from public/img/hollywood-opening/src/props-v4
(ignored) and writes *-v4.png sprites plus a manifest. Uses the same
connected-background matte as the v3 sprite pass. Earlier files are untouched.
"""
import hashlib, json, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts/hollywood"))
OUT = ROOT / "public/img/hollywood-opening"
SRC = OUT / "src/props-v4"

# Import matte/pixel_finish without running the v3 script body.
src = (ROOT / "scripts/hollywood/prepare-sprites-v3.py").read_text()
ns = {"__file__": str(ROOT / "scripts/hollywood/prepare-sprites-v3.py")}
exec(src.split("\nfor who in ['trooper', 'pigcop']")[0], ns)
matte, pixel_finish = ns["matte"], ns["pixel_finish"]

MANIFEST = {"version": 4, "props": {}}


def save(name, im):
    path = OUT / name
    im.save(path, optimize=True)
    MANIFEST["props"][name.replace("-v4.png", "").replace(".png", "")] = {
        "file": name, "width": im.width, "height": im.height,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def trim(im, pad=2):
    b = im.getbbox()
    if not b:
        return im
    return im.crop((max(0, b[0]-pad), max(0, b[1]-pad), min(im.width, b[2]+pad), min(im.height, b[3]+pad)))


def fit(im, w, h):
    im = trim(im)
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width*s)), max(1, round(im.height*s))), Image.Resampling.LANCZOS)


def sprite(name, plate, box, size):
    im = Image.open(SRC / plate).convert("RGB")
    if box:
        im = im.crop(box)
    save(f"{name}-v4.png", pixel_finish(fit(matte(im), *size), 128))


# Free-standing props.
sprite("bed", "bed.png", None, (192, 120))
sprite("couch", "couch.png", None, (192, 110))
sprite("pod-woman", "pod-woman.png", None, (110, 192))

# 2x2 pickup sheet: atomic, rpg-pickup, rockets, portable-medkit.
for i, (name, size) in enumerate([("atomic", (64, 64)), ("rpg-pickup", (128, 48)),
                                  ("rockets", (72, 72)), ("portable-medkit", (64, 56))]):
    x, y = (i % 2) * 512, (i // 2) * 512
    sprite(name, "items-b.png", (x+8, y+8, x+504, y+504), size)

# 1x3 wall squares: cracked wall, vent, glass (opaque textures, no keying).
walls = Image.open(SRC / "walls.png").convert("RGB")
cols = [(0, 0), (1, 0), (2, 0)]
for i, name in enumerate(["cracked-wall", "vent", "glass"]):
    cell = walls.crop((i*walls.width//3, 0, (i+1)*walls.width//3, walls.height))
    # Inner square: drop the magenta margin.
    m = matte(cell); b = m.getbbox()
    sq = cell.crop(b).resize((256, 256), Image.Resampling.LANCZOS)
    sq = sq.quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGBA")
    save(f"{name}-v4.png", sq)

# RPG first-person strip: 4 cells -> 512x128 atlas, bottom-anchored so the
# grip stays put while the muzzle flash grows upward.
rpg = Image.open(SRC / "rpg.png").convert("RGB")
cells = [matte(rpg.crop((i*rpg.width//4+4, 0, (i+1)*rpg.width//4-4, rpg.height))) for i in range(4)]
boxes = [c.getbbox() for c in cells]
top = min(b[1] for b in boxes)
scale = 128 / (rpg.height - top)
atlas = Image.new("RGBA", (512, 128))
for i, c in enumerate(cells):
    c = c.crop((0, top, c.width, c.height)).resize((round(c.width*scale), 128), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (128, 128))
    frame.alpha_composite(c, ((128-c.width)//2, 0))
    atlas.alpha_composite(frame, (i*128, 0))
save("rpg-v4-sheet.png", pixel_finish(atlas, 128))

# Flat signage: poster and marquee, resized and palette-reduced.
for name, plate, size in [("poster-bimbos", "poster-bimbos.png", (256, 448)), ("marquee", "marquee.png", (1024, 256))]:
    im = Image.open(SRC / plate).convert("RGB").resize(size, Image.Resampling.LANCZOS)
    im = im.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGBA")
    save(f"{name}-v4.png", im)

# Restroom mirror: crop the glass and frame from the generated restroom plate.
mp = Image.open(SRC / "mirror.png").convert("RGB")
w, h = mp.size
mirror = mp.crop((int(w*0.09), int(h*0.13), int(w*0.93), int(h*0.78))).resize((512, 192), Image.Resampling.LANCZOS)
save("mirror-v4.png", mirror.quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGBA"))

(OUT / "props-v4-manifest.json").write_text(json.dumps(MANIFEST, indent=2) + "\n")
print("v4 props:", ", ".join(sorted(MANIFEST["props"])))
