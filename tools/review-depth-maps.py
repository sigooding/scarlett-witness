#!/usr/bin/env python3
"""Reviews the film's depth maps (src/film/studio-edits.json "pictureLook" entries that name a depthMap): is each one a
real depth map of its picture, and is it safe to use alone? See docs/depth-camera.md.

    python3 tools/review-depth-maps.py --depth-model M [--people-model M] [--out DIR] [picture names]

For every map it prints, worst agreement first:
  agree   rank correlation (at 64x36) with Depth Anything V2 Small's estimate of the same picture. Near 1 means the map
          follows the scene; below about 0.75 look hard at it (on 10 October 2026 every guessed map scored 0.12 to 0.79
          while the made ones scored 0.8 to 0.99); negative means it is the wrong way round (black = near).
  edge    the hardest step in the map, in depth units per 1% of the frame's width. Above about 1 a depth-only map will
          tear (stretch) there as the camera moves; cut-outs and a plate fix that for people.
  people  with --people-model: the share of the frame U2-Net human segmentation calls a person. A map with people and no
          cut-outs is flagged: a depth map alone stretches a person.
and writes contact sheets (picture beside map, 12 to a sheet, in the same order) to --out (default: a new temporary
folder). For a picture with cut-outs it scores the map as it was made (source-depth.png, people still in it) when there is
one, since the depth.png beside it has the people filled in. Needs numpy, opencv-python-headless and onnxruntime; the models are the ones in tools/make-depth-layers.py.
"""
import argparse
import json
import os
import tempfile

import cv2
import numpy as np
import onnxruntime as ort

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)


def rank(a):
    r = np.empty(a.size)
    r[np.argsort(a.ravel())] = np.arange(a.size)
    return r


def model_depth(sess, rgb):
    x = cv2.resize(rgb, (518, 518), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
    return cv2.resize(sess.run(None, {sess.get_inputs()[0].name: x})[0][0], (64, 36), interpolation=cv2.INTER_AREA)


def people_share(sess, rgb):
    H, W = rgb.shape[:2]
    side = min(H, W)
    full = np.zeros((H, W), np.float32)
    for x0 in sorted({0, (W - side) // 2, W - side}):
        x = cv2.resize(rgb[:side, x0:x0 + side], (320, 320), interpolation=cv2.INTER_AREA).astype(np.float32)
        x = ((x / max(float(x.max()), 1e-6) - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
        m = cv2.resize(sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0], (side, side), interpolation=cv2.INTER_LINEAR)
        full[:side, x0:x0 + side] = np.maximum(full[:side, x0:x0 + side], m)
    return float((full > 0.5).mean())


def picture_of(name):
    for scene in sorted(os.listdir(os.path.join(ROOT, "public/film/img"))):
        for ext in (".jpg", ".png"):
            p = os.path.join(ROOT, "public/film/img", scene, name + ext)
            if os.path.exists(p):
                return p
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--depth-model", required=True)
    ap.add_argument("--people-model")
    ap.add_argument("--out")
    ap.add_argument("names", nargs="*")
    args = ap.parse_args()
    ort.set_default_logger_severity(3)
    dsess = ort.InferenceSession(args.depth_model, providers=["CPUExecutionProvider"])
    psess = ort.InferenceSession(args.people_model, providers=["CPUExecutionProvider"]) if args.people_model else None
    look = json.load(open(os.path.join(ROOT, "src/film/studio-edits.json"))).get("pictureLook", {})
    rows = []
    for name, entry in look.items():
        c = entry.get("cinematic") or {}
        if not c.get("depthMap") or (args.names and name not in args.names):
            continue
        pic = picture_of(name)
        mpath = os.path.join(ROOT, "public", c["depthMap"].lstrip("/"))
        layered = bool(c.get("depthPlate")) and bool(c.get("depthCutouts"))
        source = os.path.join(os.path.dirname(mpath), "source-depth.png")
        if layered and os.path.exists(source):
            mpath = source  # the map as it was made, people still in it, is the one to hold against the picture
        if not pic or not os.path.exists(mpath):
            rows.append((-9, name, "MISSING picture or map", None, None))
            continue
        bgr = cv2.imread(pic)
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        raw = cv2.imread(mpath, cv2.IMREAD_UNCHANGED)
        g = (raw if raw.ndim == 2 else cv2.cvtColor(raw[..., :3], cv2.COLOR_BGR2GRAY)).astype(np.float32)
        g /= 65535 if raw.dtype == np.uint16 else 255
        agree = float(np.corrcoef(rank(cv2.resize(g, (64, 36), interpolation=cv2.INTER_AREA)), rank(model_depth(dsess, rgb)))[0, 1])
        m = cv2.resize(g, (480, 270), interpolation=cv2.INTER_AREA)
        edge = float(np.percentile(np.hypot(cv2.Sobel(m, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(m, cv2.CV_32F, 0, 1, ksize=3)) / 8, 99.9) * 4.8)
        share = people_share(psess, rgb) if psess else None
        flags = []
        if agree < 0:
            flags.append("INVERTED?")
        elif agree < 0.75:
            flags.append("does not follow the picture")
        if edge > 1 and not layered:
            flags.append("hard edges will stretch")
        if share is not None and share > 0.003 and not layered:
            flags.append("PEOPLE with no cut-outs")
        same = (g.shape[1], g.shape[0]) == (rgb.shape[1], rgb.shape[0])
        aspect = abs(g.shape[1] / g.shape[0] - rgb.shape[1] / rgb.shape[0]) < 1e-3
        if not aspect:
            flags.append("WRONG ASPECT")
        rows.append((agree, name, "; ".join(flags) or "ok", (bgr, cv2.cvtColor((g * 255).astype(np.uint8), cv2.COLOR_GRAY2BGR)),
                     f"edge {edge:.2f}" + (f", people {share:.1%}" if share is not None else "") + ("" if same else ", not picture size") + (", layered" if layered else "")))
    rows.sort(key=lambda r: r[0])
    print("agree | picture | verdict | details")
    for r in rows:
        print(f"{r[0]:+.2f} | {r[1]} | {r[2]} | {r[4] or ''}")
    out = args.out or tempfile.mkdtemp(prefix="depth-review-")
    os.makedirs(out, exist_ok=True)
    tiles = []
    for r in rows:
        if not r[3]:
            continue
        pair = np.hstack([cv2.resize(x, (320, 180), interpolation=cv2.INTER_AREA) for x in r[3]])
        for col, th in (((0, 0, 0), 3), ((80, 255, 255), 1)):
            cv2.putText(pair, f"{r[1][:30]} {r[0]:+.2f}", (6, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.45, col, th, cv2.LINE_AA)
        tiles.append(pair)
    for s in range(0, len(tiles), 12):
        chunk = tiles[s:s + 12]
        while len(chunk) % 2:
            chunk.append(np.zeros_like(chunk[0]))
        sheet = np.vstack([np.hstack([chunk[i], np.full((180, 8, 3), 255, np.uint8), chunk[i + 1]]) for i in range(0, len(chunk), 2)])
        cv2.imwrite(os.path.join(out, f"review-{s // 12 + 1}.jpg"), sheet, [cv2.IMWRITE_JPEG_QUALITY, 82])
    print(f"contact sheets in {out}")


if __name__ == "__main__":
    main()
