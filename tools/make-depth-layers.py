#!/usr/bin/env python3
"""Depth layers for the depth-map camera (cinematic.depthMap / depthPlate / depthCutouts, src/game/DepthParallax.tsx).
The whole process, start to finish, is in docs/depth-camera.md.

For each picture in docs/film-depth-layers.json ("pictures") this writes public/film/depth/<scene folder>/<picture>/.
Pictures with people and "cutouts" get:
  depth.png     the background's depth, grayscale, white = near, black = far, with the people taken out (filled from around
                them). Made by Depth Anything and smoothed hard (960x540), or, when the picture names a "depthSource" (a map
                someone made, e.g. with Google's image tools), that map with only the people filled, at its own size.
  plate.jpg     the picture with the people taken out and the gap painted in by LaMa: what shows behind them as they move.
  cutout-N.png  each person, or group that touches, as a transparent PNG the size of the picture (BiRefNet), moved by the
                engine as one solid layer so nobody stretches. Its depth is the source map's median under the person when
                there is a source, else the smoothed background's depth just under their feet (so the feet stay planted).
Pictures with no people and no "cutouts" are depth-only: they get just an exact-picture-size grayscale depth.png, and need
only Depth Anything (unless they have a "depthSource"). The script writes the map path and each cut-out's depth back into
the JSON, ready for src/film/studio-edits.json (pictureLook).

    python3 tools/make-depth-layers.py [--depth-model M] [--seg-model M --inpaint-model M] [--wire] [picture names]
    python3 tools/make-depth-layers.py --wire [picture names]
    python3 tools/make-depth-layers.py --find-people --people-model M <picture name or image path>...

--wire writes the available depthMap, depthPlate and depthCutouts into its "pictureLook" entry in src/film/studio-edits.json,
keeping the move already there (mode, depthMotion, depthAmount...); a picture with no entry yet is skipped with a note. With
no image models it only wires maps/layers already made.

--find-people suggests a box round each person (U2-Net human segmentation over three overlapping squares, so a small
figure far off is still found) and draws them on <name>-people.jpg in --preview-dir: look at it, keep the boxes that are
people (not a face on a television, not a photograph on a wall), add any it missed, and put them in the JSON as
"cutouts": [{"name": ..., "box": [x, y, w, h]}]. Where two cut-outs overlap, each pixel goes to the one whose matte is
strongest there, and where both claim it outright, to the nearer of the two (the one in front hides the other), so a person
standing behind another is not cut out twice. A cut-out may also list "exclude": [[x, y, w, h], ...], parts of its box where
something the person holds or stands behind was taken with them (a crate of bottles in front, the drawer a hand grips): they
stay in the plate at their own depth instead of moving with the person. A cut-out with "people": true also takes in the U2-Net
human mask inside its box (needs --people-model): BiRefNet keeps the most striking thing in a box, which in a close-up of a hand
holding a phone or a key is the phone or the key, not the hand (05 and 16, 24 October 2026). "close": N (pixels) bridges gaps up
to about N wide inside a cut-out, such as a dark watch strap between a hand and a sleeve.

Needs numpy, opencv-python-headless and onnxruntime (pip install). The models run locally:
  depth   Depth Anything V2 Small (Apache-2.0); only for pictures with no "depthSource"
          https://github.com/fabio-sim/Depth-Anything-ONNX/releases/download/v2.0.0/depth_anything_v2_vits.onnx
  people  BiRefNet general, Swin-tiny backbone (MIT), the export rembg uses
          https://github.com/danielgatis/rembg/releases/download/v0.0.0/BiRefNet-general-bb_swin_v1_tiny-epoch_232.onnx
  fill    LaMa inpainting (Apache-2.0), the OpenCV model zoo export
          https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/inpainting_lama/inpainting_lama_2025jan.onnx
  finding U2-Net human segmentation (Apache-2.0), only for --find-people
          https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx
"""
import argparse
import json
import os
import re
import tempfile

import cv2
import numpy as np
import onnxruntime as ort

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, "docs", "film-depth-layers.json")
EDITS = os.path.join(ROOT, "src", "film", "studio-edits.json")
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)
DEPTH_SIZE = (960, 540)
# Gaussian sigma for a Depth Anything background, in pixels of a 480x270 copy (x4 at 1920 wide): large enough that the depth
# model's grain on the shutters and the wet street cannot bend straight lines, small enough to keep the wall apart from the
# street. A "depthSource" map is taken as it is made (its own "smooth" can add some).
SMOOTH = 3.0


def session(path):
    return ort.InferenceSession(path, providers=["CPUExecutionProvider"])


def imagenet(rgb, size):
    shrink = rgb.shape[0] > size or rgb.shape[1] > size
    x = cv2.resize(rgb, (size, size), interpolation=cv2.INTER_AREA if shrink else cv2.INTER_CUBIC).astype(np.float32) / 255
    return ((x - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)


def depth_of(sess, rgb):
    """Relative inverse depth (1 = near) at the picture's size, its 0.5th to 99.5th percentiles stretched to 0..1. The export
    takes a fixed 518x518 input: the picture is squeezed in and the map stretched back."""
    h, w = rgb.shape[:2]
    d = sess.run(None, {sess.get_inputs()[0].name: imagenet(rgb, 518)})[0][0]
    lo, hi = np.percentile(d, [0.5, 99.5])
    d = np.clip((d - lo) / (hi - lo), 0, 1).astype(np.float32)
    return cv2.resize(d, (w, h), interpolation=cv2.INTER_CUBIC).clip(0, 1)


def read_depth(path, size):
    """A depth map someone made, as 0..1 at the picture's size (8- or 16-bit, gray or colour)."""
    raw = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if raw is None:
        raise SystemExit(f"cannot read the depth source {path}")
    if raw.ndim == 3:
        raw = cv2.cvtColor(raw[..., :3], cv2.COLOR_BGR2GRAY)
    d = raw.astype(np.float32) / (65535 if raw.dtype == np.uint16 else 255)
    return cv2.resize(d, size, interpolation=cv2.INTER_CUBIC).clip(0, 1) if (d.shape[1], d.shape[0]) != size else d


def people_mask(sess, rgb):
    """U2-Net human segmentation over three overlapping squares (left, middle, right), so a far-off figure is not lost in one
    320x320 squeeze of the whole frame."""
    H, W = rgb.shape[:2]
    side = min(H, W)
    full = np.zeros((H, W), np.float32)
    for x0 in sorted({0, (W - side) // 2, W - side}):
        for y0 in sorted({0, (H - side) // 2, H - side}):
            x = cv2.resize(rgb[y0:y0 + side, x0:x0 + side], (320, 320), interpolation=cv2.INTER_AREA).astype(np.float32)
            x = ((x / max(float(x.max()), 1e-6) - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
            m = cv2.resize(sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0], (side, side), interpolation=cv2.INTER_LINEAR)
            full[y0:y0 + side, x0:x0 + side] = np.maximum(full[y0:y0 + side, x0:x0 + side], m)
    return full


def find_people(sess, rgb, share=0.15):
    """Suggested boxes: the solid pieces of the human mask at least `share` the size of the largest (drops specks)."""
    H, W = rgb.shape[:2]
    n, _, stats, _ = cv2.connectedComponentsWithStats((people_mask(sess, rgb) > 0.5).astype(np.uint8))
    pieces = [(int(stats[i, cv2.CC_STAT_AREA]), [int(v) for v in stats[i, :4]]) for i in range(1, n)]
    if not pieces:
        return []
    keep = max(max(a for a, _ in pieces) * share, H * W * 0.0004)
    return [box for area, box in sorted(pieces, key=lambda p: p[1][0]) if area >= keep]


def matte_in(sess, rgb, box, exclude=(), people=None, close=0):
    """The person or group inside box [x, y, w, h] as a soft matte the size of the picture. The box is cut out as a square
    (edges repeated past the frame), segmented at 1024x1024, and only the solid pieces of the result are kept. Boxes in
    `exclude` (whatever was taken with the person but is not them) are left out."""
    H, W = rgb.shape[:2]
    x, y, w, h = box
    side = int(max(w, h) * 1.15)
    x0, y0 = int(round(x + w / 2 - side / 2)), int(round(y + h / 2 - side / 2))
    padded = cv2.copyMakeBorder(rgb, side, side, side, side, cv2.BORDER_REPLICATE)
    crop = padded[y0 + side:y0 + 2 * side, x0 + side:x0 + 2 * side]
    logits = sess.run(None, {sess.get_inputs()[0].name: imagenet(crop, 1024)})[0][0, 0]
    m = cv2.resize((1 / (1 + np.exp(-logits))).astype(np.float32), (side, side), interpolation=cv2.INTER_CUBIC).clip(0, 1)
    full = np.zeros((H + 2 * side, W + 2 * side), np.float32)
    full[y0 + side:y0 + 2 * side, x0 + side:x0 + 2 * side] = m
    full = full[side:side + H, side:side + W]
    inside = np.zeros_like(full)
    inside[max(0, y):y + h, max(0, x):x + w] = 1
    full *= inside
    for ex, ey, ew, eh in exclude:
        full[max(0, ey):ey + eh, max(0, ex):ex + ew] = 0
    # Keep the people (every piece at least a fifth the size of the largest), not specks of shutter the model also liked.
    n, labels, stats, _ = cv2.connectedComponentsWithStats((full > 0.5).astype(np.uint8))
    if n > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        keep = np.isin(labels, 1 + np.flatnonzero(areas >= areas.max() / 5)).astype(np.uint8)
        near = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
        full *= near
    if people is not None:
        # the hand or arm that holds the thing BiRefNet chose, kept to the box and to the pieces that touch it
        inside_people = people * inside
        for ex, ey, ew, eh in exclude:
            inside_people[max(0, ey):ey + eh, max(0, ex):ex + ew] = 0
        n, labels, stats, _ = cv2.connectedComponentsWithStats((inside_people > 0.5).astype(np.uint8))
        if n > 1:
            big = 1 + np.flatnonzero(stats[1:, cv2.CC_STAT_AREA] >= stats[1:, cv2.CC_STAT_AREA].max() / 5)
            inside_people *= cv2.dilate(np.isin(labels, big).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
        full = np.maximum(full, inside_people)
    if close:
        solid = cv2.morphologyEx((full > 0.5).astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close)))
        full = np.maximum(full, cv2.GaussianBlur(solid.astype(np.float32), (5, 5), 0) * inside)
        for ex, ey, ew, eh in exclude:
            full[max(0, ey):ey + eh, max(0, ex):ex + ew] = 0
    full[full < 0.02] = 0
    return full


def own(mattes, depth):
    """Where cut-outs overlap, each pixel goes to the one whose matte claims it most strongly, and where two or more claim it
    outright (above half), to the nearest of them by the depth map's median under each: the one in front hides the rest."""
    if len(mattes) < 2:
        return mattes
    stack = np.stack(mattes)
    solid = stack > 0.5
    near = np.array([np.median(depth[s]) if s.any() else 0.0 for s in solid], np.float32)
    best = stack.argmax(0)
    contested = solid.sum(0) > 1
    best[contested] = np.where(solid, near[:, None, None], -1.0).argmax(0)[contested]
    return [np.where(best == i, m, 0).astype(np.float32) for i, m in enumerate(mattes)]


def fill(sess, rgb, hole):
    """Paints the hole in with LaMa: one square crop around each piece of the hole (twice its size, at most the picture's
    height), run at 512x512, scaled back and feathered into the picture over two pixels."""
    out = rgb.copy()
    H, W = hole.shape
    n, labels, stats, _ = cv2.connectedComponentsWithStats(hole.astype(np.uint8))
    for i in range(1, n):
        x, y, w, h = stats[i, :4]
        side = int(min(H, W, max(512, 2 * max(w, h))))
        x0 = int(np.clip(round(x + w / 2 - side / 2), 0, W - side))
        y0 = int(np.clip(round(y + h / 2 - side / 2), 0, H - side))
        crop = out[y0:y0 + side, x0:x0 + side]
        m = (labels[y0:y0 + side, x0:x0 + side] == i).astype(np.float32)
        img = cv2.resize(crop, (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        mk = (cv2.resize(m, (512, 512), interpolation=cv2.INTER_LINEAR) > 0.01).astype(np.float32)
        res = sess.run(None, {"image": img.transpose(2, 0, 1)[None], "mask": mk[None, None]})[0][0].transpose(1, 2, 0)
        res = cv2.resize(np.clip(res, 0, 255).astype(np.float32), (side, side), interpolation=cv2.INTER_CUBIC)
        a = np.maximum(cv2.GaussianBlur(m, (0, 0), 2), m)[..., None]
        out[y0:y0 + side, x0:x0 + side] = (res * a + crop.astype(np.float32) * (1 - a)).clip(0, 255).astype(np.uint8)
    return out


def background_depth(depth, hole, smooth, size):
    """The depth with the people taken out (filled from around them), smoothed by `smooth` (sigma in pixels of a 480x270
    copy; 0 keeps the map as it is), at `size`. A depth map carries a person's nearness a little past their outline (the
    model's blur, or a hand-made map's soft edge), so the hole is widened before the fill; left in, that halo becomes a
    bump the background bends around."""
    if hole.any():
        d16 = (depth * 65535).round().astype(np.uint16)
        wide = cv2.dilate(hole.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (45, 45)))
        filled = cv2.inpaint(d16, wide, 15, cv2.INPAINT_TELEA).astype(np.float32) / 65535
    else:
        filled = depth.astype(np.float32, copy=False)
    if smooth > 0:
        small = cv2.GaussianBlur(cv2.resize(filled, (480, 270), interpolation=cv2.INTER_AREA), (0, 0), smooth)
        return cv2.resize(small, size, interpolation=cv2.INTER_CUBIC).clip(0, 1)
    return cv2.resize(filled, size, interpolation=cv2.INTER_AREA).clip(0, 1) if (filled.shape[1], filled.shape[0]) != size else filled


def feet_depth(matte, bg):
    """The background depth just under the lowest solid row of a cut-out, at the middle of its feet: the cut-out moves at the
    street's depth there, so the feet stay planted."""
    H, W = matte.shape
    bh, bw = bg.shape
    ys, xs = np.nonzero(matte > 0.5)
    bottom = ys.max()
    feet = xs[ys >= bottom - max(4, (bottom - ys.min()) // 25)]
    fx = float(np.median(feet)) * bw / W
    fy = min(H - 1, bottom + 4) * bh / H
    x0, x1 = int(max(0, fx - 3)), int(min(bw, fx + 4))
    y0, y1 = int(max(0, fy - 2)), int(min(bh, fy + 3))
    return float(np.median(bg[y0:y1, x0:x1]))


def matte_depth(matte, source):
    """The source map's median under the solid middle of a cut-out (a seated or half-framed person has no feet in shot)."""
    core = cv2.erode((matte > 0.9).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))) > 0
    if core.sum() < 50:
        core = matte > 0.5
    return float(np.median(source[core]))


def save_config(config):
    text = json.dumps(config, indent=1)
    # Boxes on one line, as they are written by hand.
    text = re.sub(r"\[\s+([-\d.,\s]+?)\s+\]", lambda m: "[" + ", ".join(v.strip() for v in m.group(1).split(",")) + "]", text)
    with open(CONFIG, "w") as f:
        f.write(text + "\n")


def wire(names, config):
    """Puts each picture's map, and any plate/cut-outs, in its pictureLook entry."""
    with open(EDITS, encoding="utf-8") as f:
        edits = json.load(f)
    look = edits.get("pictureLook", {})
    for name in names:
        pic = config["pictures"][name]
        entry = look.get(name, {}).get("cinematic")
        if entry is None:
            print(name, "not wired: give it a pictureLook entry with its move first (docs/depth-camera.md, step 3)")
            continue
        if not pic.get("depthMap"):
            print(name, "not wired: no depth map made yet")
            continue
        layers = {"depthMap": pic["depthMap"]}
        if pic.get("depthPlate"):
            layers["depthPlate"] = pic["depthPlate"]
            layers["depthCutouts"] = [
                {"image": c["image"], "depth": c["depth"]} for c in pic.get("cutouts", [])
            ]
        out = {}
        for k, v in entry.items():
            if k == "depthMap":
                out.update(layers)
            elif k not in ("depthPlate", "depthCutouts"):
                out[k] = v
        out.update({k: v for k, v in layers.items() if k not in out})
        look[name]["cinematic"] = out
        if "depthPlate" in layers:
            print(name, "wired:", len(layers["depthCutouts"]), "cut-outs")
        else:
            print(name, "wired: depth-only map")
    with open(EDITS, "w", encoding="utf-8") as f:
        f.write(json.dumps(edits, indent=1, ensure_ascii=False) + "\n")


def find_mode(args, config):
    sess = session(args.people_model)
    out = args.preview_dir or tempfile.mkdtemp(prefix="depth-people-")
    os.makedirs(out, exist_ok=True)
    for item in args.names:
        path = os.path.join(ROOT, config["pictures"][item]["picture"]) if item in config["pictures"] else item
        name = os.path.splitext(os.path.basename(path))[0]
        bgr = cv2.imread(path)
        if bgr is None:
            raise SystemExit(f"cannot read {item}")
        boxes = find_people(sess, cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
        view = bgr.copy()
        for k, (x, y, w, h) in enumerate(boxes, start=1):
            cv2.rectangle(view, (x, y), (x + w, y + h), (0, 255, 255), 3)
            cv2.putText(view, str(k), (x + 6, y + 34), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)
        cv2.imwrite(os.path.join(out, f"{name}-people.jpg"), view, [cv2.IMWRITE_JPEG_QUALITY, 85])
        print(f'"{name}": ' + json.dumps([{"name": f"person {k}", "box": b} for k, b in enumerate(boxes, start=1)]))
    print(f"overlays in {out}")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--depth-model", help="Depth Anything V2 Small, for pictures with no depthSource")
    ap.add_argument("--seg-model", help="BiRefNet, for the cut-outs")
    ap.add_argument("--inpaint-model", help="LaMa, for the plate")
    ap.add_argument("--find-people", action="store_true", help="only suggest boxes round the people in the named pictures")
    ap.add_argument("--people-model", help="U2-Net human segmentation, for --find-people and cut-outs marked \"people\": true")
    ap.add_argument("--preview-dir", help="where --find-people writes its overlays (default: a new temporary folder)")
    ap.add_argument("--wire", action="store_true", help="write the layers into src/film/studio-edits.json (pictureLook)")
    ap.add_argument("names", nargs="*", help="pictures to make (default: every one in the JSON)")
    args = ap.parse_args()
    ort.set_default_logger_severity(3)
    config = json.load(open(CONFIG))
    if args.find_people:
        if not args.people_model or not args.names:
            raise SystemExit("--find-people needs --people-model and at least one picture")
        return find_mode(args, config)
    todo = [(n, p) for n, p in config["pictures"].items() if not args.names or n in args.names]
    if args.wire and not args.seg_model and not args.inpaint_model and not args.depth_model:
        return wire([n for n, _ in todo], config)
    need_depth = any(not p.get("depthSource") for _, p in todo)
    need_cutouts = any(p.get("cutouts") for _, p in todo)
    if need_depth and not args.depth_model:
        raise SystemExit("--depth-model is needed for pictures with no depthSource")
    if need_cutouts and (not args.seg_model or not args.inpaint_model):
        raise SystemExit("--seg-model and --inpaint-model are needed for pictures with cutouts")
    depth_s = session(args.depth_model) if need_depth else None
    seg_s = session(args.seg_model) if need_cutouts else None
    fill_s = session(args.inpaint_model) if need_cutouts else None
    need_people = any(c.get("people") for _, p in todo for c in p.get("cutouts", []))
    if need_people and not args.people_model:
        raise SystemExit("--people-model is needed for cut-outs marked \"people\": true")
    people_s = session(args.people_model) if need_people else None
    for name, pic in todo:
        rgb = cv2.cvtColor(cv2.imread(os.path.join(ROOT, pic["picture"])), cv2.COLOR_BGR2RGB)
        H, W = rgb.shape[:2]
        scene = os.path.basename(os.path.dirname(pic["picture"]))
        rel = f"film/depth/{scene}/{name}"
        out = os.path.join(ROOT, "public", rel)
        os.makedirs(out, exist_ok=True)
        source = read_depth(os.path.join(ROOT, pic["depthSource"]), (W, H)) if pic.get("depthSource") else None
        depth = source if source is not None else depth_of(depth_s, rgb)
        cutouts = pic.get("cutouts", [])
        people = people_mask(people_s, rgb) if any(c.get("people") for c in cutouts) else None
        mattes = own([matte_in(seg_s, rgb, c["box"], c.get("exclude", ()), people if c.get("people") else None, c.get("close", 0)) for c in cutouts], depth) if cutouts else []
        # The hole reaches a few pixels past each matte: the picture's own edge pixels carry the old background's colour.
        hole = np.zeros((H, W), np.uint8)
        for m in mattes:
            hole |= (m > 0.02).astype(np.uint8)
        if mattes:
            hole = cv2.dilate(hole, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
        smooth = pic.get("smooth", 0 if source is not None else SMOOTH)
        output_size = (W, H) if source is not None or not cutouts else DEPTH_SIZE
        bg = background_depth(depth, hole, smooth, output_size)
        cv2.imwrite(os.path.join(out, "depth.png"), (bg * 255).round().astype(np.uint8))
        pic["depthMap"] = f"/{rel}/depth.png"
        if cutouts:
            plate = fill(fill_s, rgb, hole)
            cv2.imwrite(os.path.join(out, "plate.jpg"), cv2.cvtColor(plate, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])
            pic["depthPlate"] = f"/{rel}/plate.jpg"
            for k, (c, m) in enumerate(zip(cutouts, mattes), start=1):
                alpha = (m * 255).round().astype(np.uint8)
                rgba = np.dstack([rgb * (alpha > 0)[..., None], alpha]).astype(np.uint8)
                cv2.imwrite(os.path.join(out, f"cutout-{k}.png"), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_PNG_COMPRESSION, 9])
                c["image"] = f"/{rel}/cutout-{k}.png"
                c["depth"] = round(matte_depth(m, source) if source is not None else feet_depth(m, bg), 3)
        else:
            pic.pop("depthPlate", None)
        print(name, "->", rel, [(c["name"], c["depth"]) for c in cutouts])
    save_config(config)
    if args.wire:
        wire([n for n, _ in todo], config)


if __name__ == "__main__":
    main()
