#!/usr/bin/env python3
"""Fifth art pass: remaining Hollywood Holocaust pickups and set dressing.

Reads magenta-keyed plates from public/img/hollywood-opening/src/props-v5
(ignored) and writes *-v5.png sprites plus props-v5-manifest.json, using the
v3 matte. Earlier files are untouched.
"""
import hashlib, json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/img/hollywood-opening"
SRC = OUT / "src/props-v5"
V3 = ROOT / "scripts/hollywood/prepare-sprites-v3.py"
ns = {"__file__": str(V3)}
exec(V3.read_text().split("\nfor who in ['trooper', 'pigcop']")[0], ns)
matte, pixel_finish = ns["matte"], ns["pixel_finish"]
MANIFEST = {"version": 5, "props": {}}


def save(name, im):
    path = OUT / name
    im.save(path, optimize=True)
    MANIFEST["props"][name.replace("-v5.png", "")] = {
        "file": name, "width": im.width, "height": im.height,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def fit(im, w, h, pad=2):
    b = im.getbbox()
    im = im.crop((max(0, b[0]-pad), max(0, b[1]-pad), min(im.width, b[2]+pad), min(im.height, b[3]+pad)))
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width*s)), max(1, round(im.height*s))), Image.Resampling.LANCZOS)


def magenta_only(im):
    """Strict chroma key for grey subjects the tolerant matte would eat."""
    im = im.convert("RGB")
    px = im.load()
    out = Image.new("RGBA", im.size)
    op = out.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]
            if r > 150 and b > 150 and g < 110:
                op[x, y] = (0, 0, 0, 0)
            else:
                if r > g * 1.3 and b > g * 1.3:  # despill fringe
                    grey = min(r, b, max(g, 14)); r, b = min(r, grey + 12), min(b, grey + 12)
                op[x, y] = (r, g, b, 255)
    return out


def sprite(name, plate, size, box=None, strict=False):
    im = Image.open(SRC / plate).convert("RGB")
    if box:
        im = im.crop(box)
    keyed = magenta_only(im) if strict else matte(im)
    save(f"{name}-v5.png", pixel_finish(fit(keyed, *size), 128))


sprite("jetpack", "jetpack.png", (80, 96))
sprite("nightvision", "nightvision.png", (88, 56))
sprite("pipebombs", "pipebombs.png", (88, 64))
sprite("steroids", "steroids.png", (48, 80))
sprite("monitor", "monitor.png", (112, 96))
sprite("arcade", "arcade.png", (110, 224))
sprite("dumpster", "dumpster-fire.png", (224, 200))
sprite("projector", "projector.png", (200, 224), strict=True)
sprite("red-key", "key-switch.png", (64, 72), box=(0, 0, 704, 768))
sprite("end-switch", "key-switch.png", (96, 96), box=(704, 0, 1408, 768))

# Billboard: opaque texture, no keying.
bb = Image.open(SRC / "innocent.png").convert("RGB").resize((640, 256), Image.Resampling.LANCZOS)
save("innocent-v5.png", bb.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGBA"))

(OUT / "props-v5-manifest.json").write_text(json.dumps(MANIFEST, indent=2) + "\n")
print("v5 props:", ", ".join(sorted(MANIFEST["props"])))
