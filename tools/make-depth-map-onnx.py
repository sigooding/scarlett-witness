#!/usr/bin/env python3
"""Depth maps for the depth-map camera, made with a Depth Anything ONNX model (no torch, no HuggingFace).

The house pipeline is `tools/make-depth-layers.py` (Depth Anything + BiRefNet cut-outs + LaMa inpainting),
which needs torch and the model weights. This script is the small way: one ONNX file of Depth Anything,
onnxruntime, numpy and pillow, and it makes the **depth-only** kind of map — the sort a picture with
nobody in it needs. Pictures with people are left alone on purpose: a map on its own stretches a person
as the camera moves, and they want cut-outs and a plate first (`docs/film-depth-layers.json` →
`peopleInShot`, and `scripts/film-depth.entry.ts` fails a picture that breaks that rule).

The map is written at the picture's exact size, 8-bit grayscale, white = near, black = far, which is what
`src/game/DepthParallax.tsx` samples and what `scripts/film-depth.entry.ts` checks.

Choose the pictures yourself, or let it pick:

    python3 tools/make-depth-map-onnx.py 412-pressed-against-the-railway 402-the-windows-wake
    python3 tools/make-depth-map-onnx.py --pick 3 --maps 2 --wire --seed 7

Options
    --pick N        choose N pictures at random from the film's own high-resolution pictures
    --maps M        make maps for the first M of them (default: every picture named or picked)
    --wire          write the map into the picture's `pictureLook` entry in src/film/studio-edits.json
                    (a truck move, the film's default, kept gentle) and into
                    docs/film-depth-layers.json
    --seed N        seed the random pick so the same run can be repeated
    --model PATH    the ONNX file (default: $DEPTH_ANYTHING_ONNX or the path below)
    --min-width N   how wide a picture must be to count as high-resolution (default 1920)
    --dry-run       print what it would do

Every picture it considers is one the film actually plays (a `bg` step in src/film/story.json), is at
least --min-width wide, has nobody in it, and has no depth map yet. Names are picture file names
without the folder or the extension.

    pip install numpy pillow onnxruntime
    # Depth Anything v1 ViT-S, ONNX, uint8 NHWC input, relative depth out (higher = nearer):
    # github.com/Akiya-Research-Institute/Depth-Anything-UE (Source/ThirdParty/Models/depth_anything_vits14_pre.onnx)
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
from collections import OrderedDict

ROOT = os.getcwd()
DEFAULT_MODEL = "/home/user/.cache/depth/da-ue/Source/ThirdParty/Models/depth_anything_vits14_pre.onnx"
INFER_SIZE = 518  # ViT-S/14, the size Depth Anything was exported at
MODEL_NOTE = ("Depth Anything v1 ViT-S ONNX map (higher = nearer), written at the picture's exact size. "
              "Machine-made and not eyeballed against the still — check it before it ships.")


def jpeg_size(path):
    import struct
    with open(path, "rb") as fh:
        d = fh.read()
    i = 2
    while i + 9 < len(d):
        if d[i] != 0xFF:
            i += 1
            continue
        marker = d[i + 1]
        if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
            return struct.unpack(">HH", d[i + 5:i + 9])[::-1]
        i += 2 + struct.unpack(">H", d[i + 2:i + 4])[0]
    return None


def film_pictures():
    """Picture file names the film plays, in the order they are first shown."""
    story = json.load(open(os.path.join(ROOT, "src/film/story.json"), encoding="utf-8"))
    names, seen = [], set()
    for scene in story.get("scenes", []):
        for step in scene.get("steps", []):
            src = step.get("src") if step.get("t") == "bg" else None
            if not src or not src.endswith(".jpg"):
                continue
            name = src.rsplit("/", 1)[-1][:-4]
            if name not in seen:
                seen.add(name)
                names.append((name, src.lstrip("/")))
    return names


def picture_path(rel):
    """rel is 'img/<scene>/<name>.jpg' as story.json writes it; the film's copies live under public/film."""
    return os.path.join(ROOT, "public/film", rel)


def scene_of(rel):
    return rel.split("/")[1]


def depth_map_url(name, rel):
    return f"/film/depth/{scene_of(rel)}/{name}/depth.png"


def cast_and_pronouns():
    """Everybody the screenplay gives a line to, plus the words that mean a body is in shot.

    `peopleInShot` in docs/film-depth-layers.json only lists pictures that already have a map, so it
    cannot be the only guard: a picture nobody has given depth yet may still have someone standing in
    it. The captions are the next best thing — a shot's `quote` is the words it covers.
    """
    import re

    story = json.load(open(os.path.join(ROOT, "src/film/story.json"), encoding="utf-8"))
    names = set()
    for scene in story.get("scenes", []):
        for step in scene.get("steps", []):
            if step.get("t") == "line" and step.get("who"):
                names.add(step["who"].lower())
    words = {
        # pronouns and the words that only turn up when a body is in the shot
        "he", "she", "him", "his", "her", "hers", "they", "them", "their", "whoever", "someone",
        "somebody", "everyone", "man", "men", "woman", "women", "people", "crowd", "figure",
        "silhouette", "body", "shoulder", "shoulders", "arm", "arms", "hand", "hands", "face",
        "faces", "eyes", "legs", "feet", "shoes", "heels", "hair", "head", "driver", "passenger",
        "girl", "boy", "child", "children", "customer", "customers", "officer", "officers",
    }
    marks = set()
    for w in names | words:
        for part in w.split():
            if len(part) >= 2:
                marks.add(part)
    return re.compile(r"\b(" + "|".join(sorted(map(re.escape, marks))) + r")\b")


def eligible(min_width):
    edits = json.load(open(os.path.join(ROOT, "src/film/studio-edits.json"), encoding="utf-8"))
    look = edits.get("pictureLook") or {}
    layers = json.load(open(os.path.join(ROOT, "docs/film-depth-layers.json"), encoding="utf-8"))
    people = layers.get("peopleInShot") or {}
    done = set((layers.get("pictures") or {}).keys())
    cast = cast_and_pronouns()
    story = json.load(open(os.path.join(ROOT, "src/film/story.json"), encoding="utf-8"))
    captions = {}
    for scene in story.get("scenes", []):
        for step in scene.get("steps", []):
            if step.get("t") == "bg":
                captions.setdefault(step["src"].lstrip("/").rsplit("/", 1)[-1][:-4],
                                    f"{step.get('title', '')} {step.get('quote', '')}")
    out = []
    for name, rel in film_pictures():
        path = picture_path(rel)
        if not os.path.exists(path):
            continue
        if name in people or name in done:
            continue
        if (look.get(name) or {}).get("cinematic", {}).get("depthMap"):
            continue
        if cast.search((captions.get(name) or "").lower()):
            continue  # somebody is in the shot: it wants cut-outs and a plate first
        size = jpeg_size(path)
        if not size or size[0] < min_width:
            continue
        out.append((name, rel, size))
    return out


def run_model(model_path, image):
    """Relative depth for a PIL image: float array, higher = nearer."""
    import numpy as np
    import onnxruntime as ort

    session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
    net = image.resize((INFER_SIZE, INFER_SIZE), 3)  # 3 = PIL.Image.BICUBIC
    arr = np.asarray(net.convert("RGB"), dtype=np.uint8)[None, ...]
    (out,) = session.run(None, {session.get_inputs()[0].name: arr})
    return np.squeeze(out).astype("float32")


def to_map(depth, size, smooth=2.0):
    """Resize to the picture's size, soften, normalise to 8-bit grayscale (white = near)."""
    import numpy as np
    from PIL import Image, ImageFilter

    d = Image.fromarray(depth, mode="F").resize(size, Image.BICUBIC)
    a = np.asarray(d, dtype="float32")
    lo, hi = np.percentile(a, 1.0), np.percentile(a, 99.0)
    if hi - lo < 1e-6:
        hi = lo + 1e-6
    a = (np.clip((a - lo) / (hi - lo), 0, 1) * 255 + 0.5).astype("uint8")
    out = Image.fromarray(a, mode="L")
    if smooth:  # the film's depth-only maps are smoothed so the camera's warp has no steps in it
        out = out.filter(ImageFilter.GaussianBlur(smooth))
    return out


def wire(entries):
    """Write depthMap (+ a gentle truck move) into studio-edits.json and the layers registry."""
    edits_path = os.path.join(ROOT, "src/film/studio-edits.json")
    edits = json.load(open(edits_path, encoding="utf-8"), object_pairs_hook=OrderedDict)
    look = edits.setdefault("pictureLook", OrderedDict())
    for name, rel in entries:
        pic = look.get(name) or {}
        cine = pic.get("cinematic") or OrderedDict()
        cine.setdefault("mode", "pan")
        cine["panDistance"] = cine.get("panDistance", 2)
        cine["zoomDuration"] = cine.get("zoomDuration", 18)
        cine["depthMap"] = depth_map_url(name, rel)
        cine["depthMotion"] = cine.get("depthMotion", "truck")
        cine["depthAmount"] = cine.get("depthAmount", 0.35)
        cine["depthSeconds"] = cine.get("depthSeconds", 16)
        cine.setdefault("focalPoint", "50% 50%")
        pic["cinematic"] = cine
        look[name] = pic
    with open(edits_path, "w") as fh:
        fh.write(json.dumps(edits, ensure_ascii=False, indent=1) + "\n")

    layers_path = os.path.join(ROOT, "docs/film-depth-layers.json")
    lines = open(layers_path).read().split("\n")
    for name, rel in entries:
        block = [
            f'  "{name}": {{',
            f'   "picture": "public/film/{rel}",',
            f'   "depthMap": "{depth_map_url(name, rel)}",',
            '   "smooth": 2.0,',
            f'   "note": "{MODEL_NOTE} No people visible."',
            "  }",
        ]
        # "pictures" is the last key of the file: its closing brace is the last line that is exactly " }"
        end = max(i for i, line in enumerate(lines) if line == " }")
        if lines[end - 1].rstrip() == "  }":
            lines[end - 1] = "  },"
        lines[end:end] = block
    with open(layers_path, "w") as fh:
        fh.write("\n".join(lines))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("names", nargs="*")
    ap.add_argument("--pick", type=int, default=0)
    ap.add_argument("--maps", type=int, default=0)
    ap.add_argument("--wire", action="store_true")
    ap.add_argument("--seed", type=int)
    ap.add_argument("--model", default=os.environ.get("DEPTH_ANYTHING_ONNX", DEFAULT_MODEL))
    ap.add_argument("--min-width", type=int, default=1920)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    by_name = dict((n, r) for n, r in film_pictures())
    pool = eligible(args.min_width)

    if args.names:
        chosen = [(n, by_name[n]) for n in args.names if n in by_name]
        missing = [n for n in args.names if n not in by_name]
        for n in missing:
            print(f"  not a picture the film plays: {n}")
    else:
        rng = random.Random(args.seed)
        chosen = [(n, r) for n, r, _ in rng.sample(pool, min(args.pick or 1, len(pool)))]
    if not chosen:
        print("nothing to do")
        return 1

    print(f"{len(pool)} pictures are eligible (high-resolution, nobody in shot, no map yet)")
    print(f"picked {len(chosen)}: " + ", ".join(n for n, _ in chosen))
    make = chosen if not args.maps else chosen[: args.maps]
    print(f"making {len(make)} depth map(s)")

    if args.dry_run:
        return 0
    if not os.path.exists(args.model):
        print(f"no model at {args.model} — set --model or DEPTH_ANYTHING_ONNX", file=sys.stderr)
        return 1

    from PIL import Image

    made = []
    for name, rel in make:
        path = picture_path(rel)
        size = jpeg_size(path)
        depth = run_model(args.model, Image.open(path))
        out_dir = os.path.join(ROOT, "public/film/depth", scene_of(rel), name)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "depth.png")
        to_map(depth, size).save(out_path, optimize=True)
        made.append((name, rel))
        print(f"  {name}: {size[0]}x{size[1]} -> public/film/depth/{scene_of(rel)}/{name}/depth.png")

    if args.wire and made:
        wire(made)
        print(f"wired {len(made)} into src/film/studio-edits.json and docs/film-depth-layers.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
