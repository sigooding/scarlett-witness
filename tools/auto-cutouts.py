#!/usr/bin/env python3
"""Cut-outs and depth moves for many film pictures at once, unattended (22 October 2026). The checks a person would make by
eye are left for later: every picture gets a review sheet and automatic flags instead. See docs/depth-camera.md.

For each picture the film plays in the chosen scenes (by `animaticMark`: 1, 2, 72...) that has no depth move yet:
  1. find the people (U2-Net, tools/make-depth-layers.py --find-people) and widen each box a little, so hair and hems are
     not clipped; a picture where nobody is found is skipped, never given a depth map alone (a missed person would stretch);
  2. register them in docs/film-depth-layers.json ("cutouts", and "peopleInShot") and make the layers (BiRefNet cut-outs,
     LaMa plate, Depth Anything map) with tools/make-depth-layers.py;
  3. give the picture the suggested move (truck, 0.4, 14 s) in src/film/studio-edits.json "pictureLook" where it has none,
     and wire the layers in (--wire);
  4. check the result without a person: a cut-out filling its box to the edge (it may be clipped), a cut-out that is nearly
     empty, someone still found in the plate; and write a review sheet (picture, the cut-outs on green, the plate, the map).
Pictures whose camera is a dolly or a vertigo dolly-zoom are left alone (the engine skips depth there, and those moves were
chosen). The film is rebuilt and `npm run test:film-depth` run after each group of pictures, which is committed (and pushed,
with --push) so the work survives a stopped session.

    python3 tools/auto-cutouts.py --models <dir with the four .onnx files> --scenes 1,2,72,73,74,75,76 [--chunk 10] [--push]
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, "docs", "film-depth-layers.json")
EDITS = os.path.join(ROOT, "src", "film", "studio-edits.json")
FILM = os.path.join(ROOT, "src", "data", "nobodysWitnessFilm.ts")
TOOL = os.path.join(ROOT, "tools", "make-depth-layers.py")
MOVE = {"depthMotion": "truck", "depthAmount": 0.4, "depthSeconds": 14}
PAD = 0.06  # each box grows by this share of its size on every side


def run(cmd, **kw):
    return subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True, **kw)


def load_json(path):
    with open(path) as f:
        return json.load(f)


def save_edits(edits):
    with open(EDITS, "w") as f:
        f.write(json.dumps(edits, indent=1, ensure_ascii=False) + "\n")


def film_pictures(marks):
    text = open(FILM).read()
    film = json.loads(text[text.index("= {") + 2:text.rindex(" as unknown")])
    out = []
    for sc in film["scenes"]:
        if sc.get("animaticMark") not in marks:
            continue
        for bg in [sc.get("background")] + [b.get("background") for b in sc.get("dialogueBeats") or []]:
            if bg and bg.startswith("/film/img/") and bg not in out:
                out.append(bg)
    return out


def find_people(models, paths):
    r = run([sys.executable, TOOL, "--find-people", "--people-model", os.path.join(models, "u2net_human_seg.onnx"), *paths])
    if r.returncode:
        raise SystemExit(r.stderr[-2000:])
    found = {}
    for line in r.stdout.splitlines():
        m = re.match(r'^"(.+?)": (\[.*\])$', line)
        if m:
            found[m.group(1)] = [c["box"] for c in json.loads(m.group(2))]
    return found


def pad(box, W, H):
    x, y, w, h = box
    dx, dy = round(w * PAD), round(h * PAD)
    x0, y0 = max(0, x - dx), max(0, y - dy)
    x1, y1 = min(W, x + w + dx), min(H, y + h + dy)
    return [x0, y0, x1 - x0, y1 - y0]


def checks(models, name, entry):
    """Flags a person would want to look at: a clipped or empty cut-out, someone left in the plate."""
    flags = []
    for k, c in enumerate(entry.get("cutouts", []), start=1):
        png = cv2.imread(os.path.join(ROOT, "public", c["image"].lstrip("/")), cv2.IMREAD_UNCHANGED)
        if png is None or png.shape[2] < 4:
            flags.append(f"cut-out {k} missing")
            continue
        x, y, w, h = c["box"]
        a = png[y:y + h, x:x + w, 3] > 128
        if a.mean() < 0.08:
            flags.append(f"cut-out {k} nearly empty")
        H, W = png.shape[:2]
        # an edge of the box that is not the picture's own edge, with the matte running into it, may have cut someone off
        inner = [(a[0].mean(), y > 0), (a[-1].mean(), y + h < H), (a[:, 0].mean(), x > 0), (a[:, -1].mean(), x + w < W)]
        if any(v > 0.25 and inside for v, inside in inner):
            flags.append(f"cut-out {k} runs to its box edge (may be clipped)")
    plate = os.path.join(ROOT, "public", entry["depthPlate"].lstrip("/")) if entry.get("depthPlate") else None
    if plate and os.path.exists(plate):
        left = find_people(models, [plate]).get("plate", [])
        if left:
            flags.append(f"{len(left)} person-like shape(s) still found in the plate")
    return flags


def sheet(name, entry, out_dir):
    pic = cv2.imread(os.path.join(ROOT, entry["picture"]))
    H, W = pic.shape[:2]
    size = (640, 360)
    green = np.zeros_like(pic)
    green[:] = (102, 255, 0)
    for c in entry.get("cutouts", []):
        png = cv2.imread(os.path.join(ROOT, "public", c["image"].lstrip("/")), cv2.IMREAD_UNCHANGED)
        if png is not None and png.shape[2] == 4:
            al = (png[:, :, 3:4].astype(np.float32) / 255)
            green = (png[:, :, :3] * al + green * (1 - al)).astype(np.uint8)
    plate = cv2.imread(os.path.join(ROOT, "public", entry["depthPlate"].lstrip("/"))) if entry.get("depthPlate") else pic
    depth = cv2.imread(os.path.join(ROOT, "public", entry["depthMap"].lstrip("/"))) if entry.get("depthMap") else pic
    tiles = []
    for img, label in ((pic, "picture"), (green, "cut-outs"), (plate, "plate (people painted out)"), (depth, "depth map")):
        t = cv2.resize(img, size, interpolation=cv2.INTER_AREA)
        cv2.putText(t, label, (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        tiles.append(t)
    grid = np.vstack([np.hstack(tiles[:2]), np.hstack(tiles[2:])])
    cv2.imwrite(os.path.join(out_dir, f"{name}.jpg"), grid, [cv2.IMWRITE_JPEG_QUALITY, 82])


def git(*args):
    return run(["git", *args])


def push(branch):
    for wait in (0, 2, 4, 8, 16):
        time.sleep(wait)
        if git("push", "-u", "origin", branch).returncode == 0:
            return True
    return False


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--models", required=True, help="folder holding the four .onnx files named in tools/make-depth-layers.py")
    ap.add_argument("--scenes", required=True, help="screenplay scenes, as the animatic marks them: 1,2,72...")
    ap.add_argument("--chunk", type=int, default=10)
    ap.add_argument("--review", default="public/film/review/2026-10-22-auto-cutouts")
    ap.add_argument("--push", action="store_true", help="commit and push after every group of pictures")
    args = ap.parse_args()
    marks = set(args.scenes.split(","))
    review = os.path.join(ROOT, args.review)
    os.makedirs(review, exist_ok=True)
    branch = git("branch", "--show-current").stdout.strip()
    config, edits = load_json(CONFIG), load_json(EDITS)
    looks = edits.setdefault("pictureLook", {})

    todo, skipped = [], []
    for bg in film_pictures(marks):
        name = os.path.splitext(os.path.basename(bg))[0]
        cin = (looks.get(name) or {}).get("cinematic") or {}
        if cin.get("depthMap"):
            continue
        if name in config["pictures"]:
            skipped.append((name, "already has a depth entry under this name"))
        elif cin.get("mode") in ("dolly", "dolly-zoom"):
            skipped.append((name, f"its camera is a {cin['mode']} (chosen; the engine skips depth there)"))
        elif not os.path.exists(os.path.join(ROOT, "public", bg.lstrip("/"))):
            skipped.append((name, "picture not on disk"))
        else:
            todo.append((name, "public" + bg))
    print(f"{len(todo)} pictures to do, {len(skipped)} left alone", flush=True)

    results = []
    for i in range(0, len(todo), args.chunk):
        group = todo[i:i + args.chunk]
        found = find_people(args.models, [p for _, p in group])
        made = []
        config = load_json(CONFIG)
        for name, path in group:
            boxes = found.get(name, [])
            if not boxes:
                skipped.append((name, "nobody found: left as it was, since a missed person would stretch on a depth map alone"))
                continue
            H, W = cv2.imread(os.path.join(ROOT, path)).shape[:2]
            config["pictures"][name] = {
                "picture": path,
                "cutouts": [{"name": f"person {k}", "box": pad(b, W, H)} for k, b in enumerate(boxes, start=1)],
                "note": "Automatic (tools/auto-cutouts.py, 22 October 2026): boxes from U2-Net, widened; not yet checked by eye. "
                        "Review sheet in public/film/review/2026-10-22-auto-cutouts/.",
            }
            config["peopleInShot"][name] = f"automatic: {len(boxes)} found"
            made.append(name)
        with open(CONFIG, "w") as f:
            f.write(json.dumps(config, indent=1) + "\n")
        if made:
            r = run([sys.executable, TOOL, "--depth-model", os.path.join(args.models, "depth_anything_v2_vits.onnx"),
                     "--seg-model", os.path.join(args.models, "BiRefNet-general-bb_swin_v1_tiny-epoch_232.onnx"),
                     "--inpaint-model", os.path.join(args.models, "inpainting_lama_2025jan.onnx"), *made])
            if r.returncode:
                print(r.stderr[-3000:], flush=True)
                raise SystemExit("make-depth-layers failed")
            edits = load_json(EDITS)
            looks = edits.setdefault("pictureLook", {})
            for name in made:
                cin = looks.setdefault(name, {}).setdefault("cinematic", {})
                cin.setdefault("mode", "static")
                for k, v in MOVE.items():
                    cin.setdefault(k, v)
            save_edits(edits)
            r = run([sys.executable, TOOL, "--wire", *made])
            if r.returncode:
                print(r.stderr[-3000:], flush=True)
                raise SystemExit("wiring failed")
            config = load_json(CONFIG)
            for name in made:
                entry = config["pictures"][name]
                flags = checks(args.models, name, entry)
                sheet(name, entry, review)
                results.append((name, len(entry.get("cutouts", [])), flags))
                print(f"{name}: {len(entry.get('cutouts', []))} cut-out(s){'; ' + '; '.join(flags) if flags else ''}", flush=True)
        build = run(["node", "tools/build-film-story.mjs"], env={**os.environ, "FILM_SRC": "/nonexistent"})
        test = run(["npm", "run", "-s", "test:film-depth"])
        status = "film-depth checks pass" if test.returncode == 0 else "film-depth checks FAIL"
        print(f"group {i // args.chunk + 1}: {status}", flush=True)
        write_report(review, results, skipped, args.scenes)
        if args.push:
            git("add", "-A", "docs/film-depth-layers.json", "src/film/studio-edits.json", "src/data/nobodysWitnessFilm.ts",
                "public/film/depth", args.review)
            msg = (f"Automatic cut-outs, group {i // args.chunk + 1}: {', '.join(made) or 'nobody found'} ({status})\n\n"
                   "Made unattended by tools/auto-cutouts.py; not yet checked by eye (review sheets in " + args.review + ").\n\n"
                   "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n"
                   "Claude-Session: https://claude.ai/code/session_01A5Z5XGvVNqJaCarWiDWen6\n")
            git("commit", "-q", "-m", msg)
            if not push(branch):
                print("push failed; the commit is local", flush=True)
        if build.returncode or test.returncode:
            print((build.stderr + test.stdout + test.stderr)[-3000:], flush=True)
    print("done", flush=True)


def write_report(review, results, skipped, scenes):
    flagged = [r for r in results if r[2]]
    lines = [
        "# Automatic cut-outs, 22 October 2026",
        "",
        f"Made unattended by `tools/auto-cutouts.py` for the pictures of scenes {scenes} that had no depth move. **Nobody has",
        "looked at them.** Each picture has a review sheet here (`<picture>.jpg`: the picture, its cut-outs on green, the plate",
        "with the people painted out, and the depth map). Look at the flagged ones first; to take one back out, delete its entry",
        "from `docs/film-depth-layers.json` (`pictures` and `peopleInShot`) and the depth fields from its `pictureLook` in",
        "`src/film/studio-edits.json`, then rebuild. Each gets the suggested move: truck, 0.4, over 14 s.",
        "",
        f"**{len(results)} made, {len(flagged)} flagged, {len(skipped)} left alone.**",
        "",
        "| Picture | Cut-outs | Flags |",
        "|---|---|---|",
    ]
    for name, n, flags in sorted(results, key=lambda r: (not r[2], r[0])):
        lines.append(f"| [{name}]({name}.jpg) | {n} | {'; '.join(flags) or ''} |")
    lines += ["", "## Left alone", ""] + [f"- `{n}`: {why}" for n, why in skipped]
    with open(os.path.join(review, "README.md"), "w") as f:
        f.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
