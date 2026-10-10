#!/usr/bin/env python3
"""Renders src/game/DepthParallax.tsx's shader on the CPU, so a depth map and its camera settings can be looked at
without a browser. It is a straight transcription of the GLSL — same source(), same five-step inverse mapping,
same push/truck/drift maths from the component's frame() — so what it shows is what the engine shows.

    python3 tools/depth-parallax-probe.py <picture> [--seconds 14] [--out /tmp/pp]

Writes, for each of the picture's camera settings in src/film/studio-edits.json, a strip of the frame at the start,
the middle and the end of the move, plus a difference image that lights up wherever the camera moved. A move that
shows nothing in the difference is a move the player will not see.
"""
import argparse
import glob
import json
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# The component's constants (src/game/DepthParallax.tsx).
PUSH_FAR, PUSH_NEAR, TRUCK = 0.12, 0.36, 0.08
W, H = 480, 270          # render small: this is for looking at, not for shipping
# Output row 0 is the top of the frame; the shader's v=0 is the bottom of the screen, so v runs 1 -> 0 down
# the array. x runs 0 -> 1 left to right, same as the shader.
UV = np.stack(np.meshgrid(np.linspace(0, 1, W, dtype=np.float32), np.linspace(1, 0, H, dtype=np.float32)), -1)


def ease_in_out(x):
    return 0.5 - 0.5 * np.cos(np.pi * np.clip(x, 0, 1))


def centre(focal):
    x, y = (focal or "50% 50%").split()
    return np.array([float(x.rstrip("%")) / 100, 1 - float(y.rstrip("%")) / 100], np.float32)


def camera_at(motion, amount, seconds, direction, t):
    """(zoomFar, zoomNear, slide) at time t — the body of the component's frame()."""
    if motion == "push":
        p = ease_in_out(t / seconds)
        return 1 + amount * PUSH_FAR * p, 1 + amount * PUSH_NEAR * p, 0.0
    if motion == "truck":
        slide = amount * TRUCK * ease_in_out(t / seconds) * direction
        return None, None, slide
    grow = ease_in_out(t / 2)
    return None, None, amount * TRUCK * 0.5 * grow * np.sin(2 * np.pi * t / seconds) * direction


def overscan_for(slide, focus):
    reach = max(focus, 1 - focus)
    return 1 / max(0.5, 1 - 2 * reach * abs(slide))


def render(plate, depth, motion, amount, seconds, direction, focus, focal, t):
    zf, zn, slide = camera_at(motion, amount, seconds, direction, t)
    if zf is None:
        zf = zn = overscan_for(slide, focus)
    c = centre(focal) if motion == "push" else np.array([0.5, 0.5], np.float32)

    def depth_at(p):
        # clamp((p - 0.5) * uDepthScale + 0.5) with uDepthScale 1 (the map is the picture's own size and aspect)
        mx = np.ascontiguousarray(np.clip(p[..., 0], 0, 1) * (W - 1), np.float32)
        my = np.ascontiguousarray((1 - np.clip(p[..., 1], 0, 1)) * (H - 1), np.float32)
        return cv2.remap(depth, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

    def source(uv, d):
        d = d[..., None]
        z = zf + (zn - zf) * d                       # mix(uZoom.x, uZoom.y, d)
        return c + (uv - slide * (d - focus) - c) / z

    p = UV.copy()
    for _ in range(5):                               # the shader's fixed five-step inverse mapping
        p = source(UV, depth_at(p))
    # Texture uv (0,0) is the picture's bottom left (UNPACK_FLIP_Y_WEBGL), so the row runs the other way.
    mx = np.ascontiguousarray(np.clip(p[..., 0], 0, 1) * (W - 1), np.float32)
    my = np.ascontiguousarray((1 - np.clip(p[..., 1], 0, 1)) * (H - 1), np.float32)
    bgr = cv2.remap(plate, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    return bgr


def settings_for(name):
    look = json.load(open(os.path.join(ROOT, "src/film/studio-edits.json")))["pictureLook"].get(name, {})
    c = look.get("cinematic") or {}
    cuts = c.get("depthCutouts") or []
    focus = c.get("depthFocus")
    if focus is None:
        focus = sum(k["depth"] for k in cuts) / len(cuts) if cuts else 0.5
    return dict(motion=c.get("depthMotion", "push"), amount=min(1, max(0, c.get("depthAmount", 0.4))),
                seconds=max(2, c.get("depthSeconds", 14)),
                direction=-1 if c.get("depthDirection") == "left" else 1,
                focus=min(1, max(0, focus)), focal=c.get("focalPoint"))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("names", nargs="+")
    ap.add_argument("--out", default="/tmp/depth-probe")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    for name in args.names:
        pic = glob.glob(os.path.join(ROOT, "public/film/img/*", f"{name}.jpg"))[0]
        depth_path = glob.glob(os.path.join(ROOT, "public/film/depth/*", name, "depth.png"))[0]
        plate = cv2.resize(cv2.imread(pic), (W, H), interpolation=cv2.INTER_AREA)
        depth = cv2.resize(cv2.imread(depth_path, cv2.IMREAD_GRAYSCALE), (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        s = settings_for(name)
        times = [0, s["seconds"] / 2, s["seconds"]] if s["motion"] != "drift" else [0, s["seconds"] / 4, s["seconds"] / 2]
        frames = [render(plate, depth, **s, t=t) for t in times]
        # The difference image: the biggest change any pixel makes across the move, scaled up to see. A blank
        # strip here means the camera never really moved.
        stack = np.stack(frames).astype(np.float32)
        diff = (stack.max(0) - stack.min(0)).max(-1)
        moved = float((diff > 6).mean())
        heat = cv2.applyColorMap(np.clip(diff * 3, 0, 255).astype(np.uint8), cv2.COLORMAP_INFERNO)
        strip = np.hstack(frames + [heat])
        cv2.imwrite(os.path.join(args.out, f"{name}.jpg"), strip, [cv2.IMWRITE_JPEG_QUALITY, 90])
        print(f"{name}: {s['motion']} amount {s['amount']} {s['seconds']}s focus {s['focus']:.2f} "
              f"-> {moved * 100:.1f}% of the frame moves, mean shift {diff.mean():.1f}/255")


if __name__ == "__main__":
    main()
