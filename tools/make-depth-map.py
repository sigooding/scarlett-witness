#!/usr/bin/env python3
"""Depth-only maps for the depth-map camera (cinematic.depthMap, src/game/DepthParallax.tsx).

A depth map is a grayscale copy of a picture — white = near the camera, black = far — that the engine warps the
picture through to get a 2.5D camera move on a still. Where a shot has people who must not stretch, use
tools/make-depth-layers.py instead: it also writes the clean plate and the cut-outs. This tool is for the scenic
shots with nobody to cut out, where a map on its own is enough and the background stretching beside a figure is
what you want (a truck slides the wall and everything on it together).

    python3 tools/make-depth-map.py                 # every picture in MAPS below
    python3 tools/make-depth-map.py 153-the-rain-has-stopped
    python3 tools/make-depth-map.py --preview       # ... and write /tmp/depth-preview/<name>.jpg to look at
    python3 tools/make-depth-map.py --check         # assert every shipped map is its picture's exact size

Writes public/film/depth/<scene folder>/<picture>/depth.png at exactly the picture's own pixel size, so the
engine's cover crop and its depth-map UVs line up with no rescaling (DepthParallax works out the crop from the
picture's aspect, so a map of a different aspect would slide against the picture as the camera moves).

Needs numpy and opencv only (pip install numpy opencv-python-headless) — no models. The map is a smooth,
low-frequency field, so it is built from the cues that survive a heavy blur rather than from per-pixel detail:

  ground    where a pixel sits against the shot's horizon: a ground plane's depth grows fast just under the
            horizon and slowly after, so depth is (y - horizon) / (1 - horizon) raised to a power < 1. Above the
            horizon is far away and flat.
  detail    local edge energy, log-compressed: near things carry fine texture, far things are smeared.
  contrast  local standard deviation: aerial perspective washes distant rain-city surfaces flat, so low contrast
            reads as far. This one works at night as well as in daylight, which plain brightness does not.
  anchors   rectangles pinned to a depth, for the pieces geometry cannot know — a windscreen or a ledge in the
            near foreground, a bright sky pinned far. They are laid in after the blur, feathered, so they hold.

Everything is worked out on a 480x270 copy and blurred hard (the repo's house style: soft, single-surface,
straight lines stay straight), then upscaled to the picture's size. Per-shot numbers live in MAPS; run with
--preview, look at the result, and adjust.
"""
import argparse
import glob
import os
import struct
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "public", "film", "img")
OUT = os.path.join(ROOT, "public", "film", "depth")
# Everything is measured on this small copy, then blurred and upscaled: the map is a low-frequency field, so
# working small is both faster and a guarantee that no per-pixel grain survives into it.
GRID = (480, 270)
# Gaussian sigma of the final field, in pixels of the 480x270 grid. This is what keeps a wall a flat surface:
# smaller than ~2 and the depth model's worth of texture noise starts to bend straight lines.
SMOOTH = 5.0

# Per-shot tuning. `horizon` is the fraction of the frame's height the shot's eye level sits at (above it is sky
# or far wall, flat and far); `ground` weights the ground-plane prior, `detail` and `contrast` the texture cues;
# `anchors` are [x0, y0, x1, y1, depth] in frame fractions, laid in after the blur. `flip` is for a shot looking
# down, where lower in frame means farther, not nearer.
MAPS = {
    # Scene 61: parked under the elevated expressway. The dashboard and the near pillars are close, the road and
    # the far pillars run away under the deck.
    "228-nine-oclock": dict(horizon=0.40, ground=1.0, detail=0.5, contrast=0.35, smooth=5.0,
                            anchors=[[0.00, 0.86, 1.00, 1.00, 0.95], [0.00, 0.00, 1.00, 0.16, 0.10]]),
    # Scene 53a: the old newspaper office. Desks jammed together running back to the wall of televisions; the
    # floor in front of the camera is the nearest thing in the room.
    "297-the-glass-office": dict(horizon=0.34, ground=0.85, detail=0.55, contrast=0.3, smooth=5.0,
                                 anchors=[[0.00, 0.88, 1.00, 1.00, 1.00]]),
    # Scene 98: the rain has stopped, the sky is pale and enormous. Everything above the roofs is sky and reads
    # as far away; the wet street in front is near.
    "153-the-rain-has-stopped": dict(horizon=0.36, ground=1.0, detail=0.35, contrast=0.3, smooth=6.0,
                                     anchors=[[0.00, 0.00, 1.00, 0.28, 0.03], [0.00, 0.86, 1.00, 1.00, 0.95]]),
    # Scene 14a: engine off in the lane. The windscreen and its smears of light are the nearest plane; the lane
    # runs away through the glass.
    "337-engine-off": dict(horizon=0.44, ground=1.0, detail=0.45, contrast=0.3, smooth=5.0,
                           anchors=[[0.00, 0.80, 1.00, 1.00, 1.00], [0.00, 0.00, 1.00, 0.14, 0.15]]),
    # Scene 83: the fortieth floor, looking down. The ledge and the rain on the glass are close; Tokyo falls away
    # below and beyond, so the ground-plane prior is turned right down and the haze does the work.
    "109-the-fortieth-floor": dict(horizon=0.20, ground=0.25, detail=0.5, contrast=0.7, smooth=5.0,
                                   anchors=[[0.00, 0.80, 1.00, 1.00, 1.00], [0.00, 0.00, 1.00, 0.18, 0.05]]),
    # Scene 8: the same bar in flat grey daylight, chairs up on the counter. The counter and the stools in front
    # of the camera are near, the back wall and the CRT are far.
    "160-were-closed": dict(horizon=0.30, ground=0.8, detail=0.6, contrast=0.35, smooth=5.0,
                            anchors=[[0.00, 0.80, 1.00, 1.00, 1.00]]),
    # Scene 62: the crossing. The signal and the far buildings are away, the wet crossing right under the
    # camera is the nearest surface in the shot.
    "229-like-a-date": dict(horizon=0.42, ground=1.0, detail=0.4, contrast=0.3, smooth=5.0,
                            anchors=[[0.00, 0.84, 1.00, 1.00, 0.95], [0.00, 0.00, 1.00, 0.22, 0.08]]),
    # Scene 15: the Hive from across the road, low and dark and patched. The street in the foreground is near,
    # the block itself is one flat far surface.
    "184-a-gap-in-someones-teeth": dict(horizon=0.52, ground=1.0, detail=0.45, contrast=0.3, smooth=6.0,
                                        anchors=[[0.00, 0.86, 1.00, 1.00, 0.95], [0.00, 0.00, 1.00, 0.20, 0.05]]),
    # Scene 4: the apartment, empty of people. The table and the lamp in front are the nearest things; the window
    # wall and the room behind it are far.
    "33-the-apartment": dict(horizon=0.60, ground=0.9, detail=0.5, contrast=0.3, smooth=5.0,
                             anchors=[[0.00, 0.86, 1.00, 1.00, 0.95]]),
    # Scene 2: the bar, empty. The long corridor of bottles and stools runs away to the lit TV at the far end; the
    # stools and the floor at the bottom of the frame are close.
    "19-the-bar": dict(horizon=0.46, ground=1.0, detail=0.45, contrast=0.3, smooth=5.0,
                       anchors=[[0.00, 0.88, 1.00, 1.00, 0.95], [0.40, 0.30, 0.60, 0.52, 0.10]]),
    # Scene 31: the only car outside the building at night. The wet gravel and the car are near; the building
    # front and the dark sky are far.
    "169-the-only-car": dict(horizon=0.52, ground=1.0, detail=0.4, contrast=0.35, smooth=5.0,
                             anchors=[[0.00, 0.00, 1.00, 0.18, 0.02], [0.00, 0.88, 1.00, 1.00, 0.95]]),
    # Scene 100: the back-street bar with the news on the set. The counter and stools are near, the back wall
    # and the shutter are far.
    "320-the-news-nobody-watches": dict(horizon=0.48, ground=0.9, detail=0.45, contrast=0.3, smooth=5.0,
                                        anchors=[[0.00, 0.00, 1.00, 0.14, 0.05], [0.00, 0.90, 1.00, 1.00, 0.95]]),
}


def picture_of(name):
    hits = glob.glob(os.path.join(IMG, "*", f"{name}.jpg")) + glob.glob(os.path.join(IMG, "*", f"{name}.png"))
    if not hits:
        raise SystemExit(f"no picture called {name} under public/film/img/")
    if len(hits) > 1:
        raise SystemExit(f"{name} is ambiguous: {hits}")
    return hits[0]


def cue_fields(rgb):
    """The two texture cues on the grid, each stretched to 0..1 (1 = near)."""
    g = cv2.cvtColor(rgb, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    small = cv2.resize(g, GRID, interpolation=cv2.INTER_AREA)
    # Edge energy: Sobel magnitude, blurred to a local measure, then log-compressed so one bright neon sign does
    # not dominate a whole street.
    sx = cv2.Sobel(small, cv2.CV_32F, 1, 0, ksize=3)
    sy = cv2.Sobel(small, cv2.CV_32F, 0, 1, ksize=3)
    energy = cv2.GaussianBlur(cv2.magnitude(sx, sy), (0, 0), 3)
    detail = np.log1p(energy * 40)
    # Aerial perspective: the standard deviation over a wide window. Far rain-city surfaces are washed flat.
    mean = cv2.GaussianBlur(small, (0, 0), 9)
    spread = cv2.GaussianBlur((small - mean) ** 2, (0, 0), 9)
    contrast = np.sqrt(np.maximum(spread, 0)) * 6
    stretch = lambda a: np.clip((a - a.min()) / max(1e-6, a.max() - a.min()), 0, 1)
    return stretch(detail), stretch(contrast)


def ground_prior(shape, horizon):
    """A ground plane's relative depth against the horizon: 0 at the horizon, 1 at the bottom, growing fast just
    under the horizon (where the plane is nearly edge-on) and slowly after. Above it, far and flat."""
    h, w = shape
    y = (np.arange(h, dtype=np.float32)[:, None] / max(1, h - 1) - horizon) / max(1e-3, 1 - horizon)
    d = np.clip(y, 0, 1) ** 0.55
    return np.repeat(d, w, axis=1)


def depth_for(name, tune):
    rgb = cv2.cvtColor(cv2.imread(picture_of(name)), cv2.COLOR_BGR2RGB)
    H, W = rgb.shape[:2]
    detail, contrast = cue_fields(rgb)
    geo = ground_prior(GRID[::-1], tune.get("horizon", 0.4))
    w = dict(ground=1.0, detail=0.4, contrast=0.3)
    w.update({k: v for k, v in tune.items() if k in w})
    field = (w["ground"] * geo + w["detail"] * detail + w["contrast"] * contrast) / (
        w["ground"] + w["detail"] + w["contrast"])
    field = cv2.GaussianBlur(field, (0, 0), tune.get("smooth", SMOOTH))
    # The anchors are laid in after the blur, feathered over about a twentieth of the frame, so a windscreen or a
    # ledge keeps its depth instead of being smoothed away by the wall behind it.
    for x0, y0, x1, y1, d in tune.get("anchors", []):
        gh, gw = GRID[1], GRID[0]
        mask = np.zeros((gh, gw), np.float32)
        mask[int(y0 * gh):max(int(y0 * gh) + 1, int(y1 * gh)), int(x0 * gw):max(int(x0 * gw) + 1, int(x1 * gw))] = 1
        mask = cv2.GaussianBlur(mask, (0, 0), max(2.0, gh * 0.02))
        field = field * (1 - mask) + d * mask
    # Stretch the used range to full black..white: the engine reads the map's grey directly, so a map that only
    # ever reaches mid grey moves half as far as one that uses the range.
    lo, hi = np.percentile(field, [0.5, 99.5])
    field = np.clip((field - lo) / max(1e-6, hi - lo), 0, 1)
    return (field * 255).round().astype(np.uint8), (H, W)


def write(name, tune, preview=False):
    small, (H, W) = depth_for(name, tune)
    # Nearest-neighbour up from the grid would stair-step the field; cubic keeps it smooth without ringing.
    full = cv2.resize(small, (W, H), interpolation=cv2.INTER_CUBIC)
    path = picture_of(name)
    scene = os.path.basename(os.path.dirname(path))
    out = os.path.join(OUT, scene, name)
    os.makedirs(out, exist_ok=True)
    cv2.imwrite(os.path.join(out, "depth.png"), full)
    print(f"{name} -> film/depth/{scene}/{name}/depth.png {W}x{H}  "
          f"grey {int(full.min())}..{int(full.max())} mean {full.mean():.0f}")
    if preview:
        os.makedirs("/tmp/depth-preview", exist_ok=True)
        pic = cv2.resize(cv2.imread(path), (640, int(640 * H / W)))
        dm = cv2.resize(cv2.applyColorMap(full, cv2.COLORMAP_INFERNO), (640, pic.shape[0]))
        cv2.imwrite(f"/tmp/depth-preview/{name}.jpg", np.hstack([pic, dm]))
    return full


def png_size(path):
    with open(path, "rb") as f:
        head = f.read(26)
    return struct.unpack(">II", head[16:24]) if head[:8] == b"\x89PNG\r\n\x1a\n" else None


def check():
    """Every shipped map must be its picture's exact pixel size, or the engine's cover crop slides against it."""
    bad = 0
    for scene in sorted(os.listdir(OUT)):
        for name in sorted(os.listdir(os.path.join(OUT, scene))):
            d = os.path.join(OUT, scene, name, "depth.png")
            if not os.path.isfile(d):
                continue
            src = picture_of(name)
            w, h = cv2.imread(src).shape[1::-1]
            dw, dh = png_size(d)
            ok = (dw, dh) == (w, h)
            bad += not ok
            print(("ok   " if ok else "BAD  ") + f"{scene}/{name}: map {dw}x{dh}, picture {w}x{h}")
    print("checked", "— all match" if not bad else f"— {bad} do not match")
    return 1 if bad else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("names", nargs="*", help="pictures to make (default: every one in MAPS)")
    ap.add_argument("--preview", action="store_true", help="also write /tmp/depth-preview/<name>.jpg")
    ap.add_argument("--check", action="store_true", help="check every shipped map against its picture's size")
    args = ap.parse_args()
    if args.check:
        sys.exit(check())
    names = args.names or list(MAPS)
    for n in names:
        if n not in MAPS:
            raise SystemExit(f"{n} has no tuning in MAPS — add it there first")
        write(n, MAPS[n], args.preview)
