#!/usr/bin/env python3
"""Depth layers for the depth-map camera (cinematic.depthMap / depthPlate / depthCutouts, src/game/DepthParallax.tsx).

For every picture in docs/film-depth-layers.json this writes public/film/depth/<scene folder>/<picture>/:
  depth.png     the background's depth, 960x540 grayscale, white = near, black = far. The people are taken out and the map is
                smoothed hard, so the wall and the street move as flat surfaces and their straight lines stay straight.
  plate.jpg     the picture with the people taken out and the gap painted in: what shows behind them as they move.
  cutout-N.png  each person, or group that touches, as a transparent PNG the size of the picture, moved as one solid layer
                (no stretching), at the street's depth where its feet are.
and writes each cut-out's depth and every file's path back into the JSON, ready for src/film/studio-edits.json (pictureLook).

    python3 tools/make-depth-layers.py --depth-model M --seg-model M --inpaint-model M [picture names]

Needs numpy, opencv-python-headless and onnxruntime (pip install). The three models run locally:
  depth   Depth Anything V2 Small (Apache-2.0)
          https://github.com/fabio-sim/Depth-Anything-ONNX/releases/download/v2.0.0/depth_anything_v2_vits.onnx
  people  BiRefNet general, Swin-tiny backbone (MIT), the export rembg uses
          https://github.com/danielgatis/rembg/releases/download/v0.0.0/BiRefNet-general-bb_swin_v1_tiny-epoch_232.onnx
  fill    LaMa inpainting (Apache-2.0), the OpenCV model zoo export
          https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/inpainting_lama/inpainting_lama_2025jan.onnx
"""
import argparse
import json
import os
import re

import cv2
import numpy as np
import onnxruntime as ort

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, "docs", "film-depth-layers.json")
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)
DEPTH_SIZE = (960, 540)
# Gaussian sigma for the background depth, in pixels of a 480x270 copy (x4 at 1920 wide): large enough that the depth model's
# grain on the shutters and the wet street cannot bend straight lines, small enough to keep the wall apart from the street.
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


def matte_in(sess, rgb, box):
    """The person or group inside box [x, y, w, h] as a soft matte the size of the picture. The box is cut out as a square
    (edges repeated past the frame), segmented at 1024x1024, and only the solid pieces of the result are kept."""
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
    # Keep the people (every piece at least a fifth the size of the largest), not specks of shutter the model also liked.
    n, labels, stats, _ = cv2.connectedComponentsWithStats((full > 0.5).astype(np.uint8))
    if n > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        keep = np.isin(labels, 1 + np.flatnonzero(areas >= areas.max() / 5)).astype(np.uint8)
        near = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
        full *= near
    full[full < 0.02] = 0
    return full


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


def background_depth(depth, hole):
    """The depth with the people taken out (filled from around them) and smoothed hard, at 960x540. The depth model's own blur
    carries a person's nearness 15-20 pixels past their outline, so the hole is widened before the fill; left in, that halo
    becomes a bump the street bends around."""
    d16 = (depth * 65535).round().astype(np.uint16)
    wide = cv2.dilate(hole.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (45, 45)))
    filled = cv2.inpaint(d16, wide, 15, cv2.INPAINT_TELEA).astype(np.float32) / 65535
    small = cv2.GaussianBlur(cv2.resize(filled, (480, 270), interpolation=cv2.INTER_AREA), (0, 0), SMOOTH)
    return cv2.resize(small, DEPTH_SIZE, interpolation=cv2.INTER_CUBIC).clip(0, 1)


def feet_depth(matte, bg):
    """The background depth just under the lowest solid row of a cut-out, at the middle of its feet: the cut-out moves at the
    street's depth there, so the feet stay planted."""
    H, W = matte.shape
    ys, xs = np.nonzero(matte > 0.5)
    bottom = ys.max()
    feet = xs[ys >= bottom - max(4, (bottom - ys.min()) // 25)]
    fx = float(np.median(feet)) * DEPTH_SIZE[0] / W
    fy = min(H - 1, bottom + 4) * DEPTH_SIZE[1] / H
    x0, x1 = int(max(0, fx - 3)), int(min(DEPTH_SIZE[0], fx + 4))
    y0, y1 = int(max(0, fy - 2)), int(min(DEPTH_SIZE[1], fy + 3))
    return float(np.median(bg[y0:y1, x0:x1]))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--depth-model", required=True)
    ap.add_argument("--seg-model", required=True)
    ap.add_argument("--inpaint-model", required=True)
    ap.add_argument("names", nargs="*", help="pictures to make (default: every one in the JSON)")
    args = ap.parse_args()
    ort.set_default_logger_severity(3)
    config = json.load(open(CONFIG))
    depth_s, seg_s, fill_s = session(args.depth_model), session(args.seg_model), session(args.inpaint_model)
    for name, pic in config["pictures"].items():
        if args.names and name not in args.names:
            continue
        rgb = cv2.cvtColor(cv2.imread(os.path.join(ROOT, pic["picture"])), cv2.COLOR_BGR2RGB)
        H, W = rgb.shape[:2]
        scene = os.path.basename(os.path.dirname(pic["picture"]))
        rel = f"film/depth/{scene}/{name}"
        out = os.path.join(ROOT, "public", rel)
        os.makedirs(out, exist_ok=True)
        depth = depth_of(depth_s, rgb)
        mattes = [matte_in(seg_s, rgb, c["box"]) for c in pic["cutouts"]]
        # The hole reaches a few pixels past each matte: the picture's own edge pixels carry the old background's colour.
        hole = np.zeros((H, W), np.uint8)
        for m in mattes:
            hole |= (m > 0.02).astype(np.uint8)
        hole = cv2.dilate(hole, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
        bg = background_depth(depth, hole)
        plate = fill(fill_s, rgb, hole)
        cv2.imwrite(os.path.join(out, "depth.png"), (bg * 255).round().astype(np.uint8))
        cv2.imwrite(os.path.join(out, "plate.jpg"), cv2.cvtColor(plate, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])
        pic["depthMap"], pic["depthPlate"] = f"/{rel}/depth.png", f"/{rel}/plate.jpg"
        for k, (c, m) in enumerate(zip(pic["cutouts"], mattes), start=1):
            alpha = (m * 255).round().astype(np.uint8)
            rgba = np.dstack([rgb * (alpha > 0)[..., None], alpha]).astype(np.uint8)
            cv2.imwrite(os.path.join(out, f"cutout-{k}.png"), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_PNG_COMPRESSION, 9])
            c["image"] = f"/{rel}/cutout-{k}.png"
            c["depth"] = round(feet_depth(m, bg), 3)
        print(name, "->", rel, [(c["name"], c["depth"]) for c in pic["cutouts"]])
    text = json.dumps(config, indent=1)
    # Boxes on one line, as they are written by hand.
    text = re.sub(r"\[\s+([-\d.,\s]+?)\s+\]", lambda m: "[" + ", ".join(v.strip() for v in m.group(1).split(",")) + "]", text)
    with open(CONFIG, "w") as f:
        f.write(text + "\n")


if __name__ == "__main__":
    main()
