#!/usr/bin/env python3
"""Original, newly drawn pixel-art for the Quake replica (E1M1-style level).

Everything here is drawn from scratch with Pillow — no extracted game data.
Deterministic: re-running produces byte-identical PNGs. Output lands in
public/img/quake-e1m1/ (checked in, runtime dependency for the story).
Requires: pip install pillow
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "img", "quake-e1m1")
os.makedirs(ROOT, exist_ok=True)

rng = random.Random(19960622)

FONT_DIR = "/usr/share/fonts/truetype/dejavu"


def font(size):
    return ImageFont.truetype(os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf"), size)


def save(img, name):
    img.save(os.path.join(ROOT, name), optimize=True)
    print("wrote", name)


def hash01(x, y, salt=0):
    v = (x * 374761393 + y * 668265263 + salt * 974634721) & 0xFFFFFFFF
    v = (v ^ (v >> 13)) * 1274126177 & 0xFFFFFFFF
    return ((v ^ (v >> 16)) & 0xFFFFFF) / 0xFFFFFF


def shade(color, factor):
    r, g, b = color
    return (
        max(0, min(255, int(r * factor))),
        max(0, min(255, int(g * factor))),
        max(0, min(255, int(b * factor))),
    )


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


# ---------------------------------------------------------------- textures --


def seamless(w, fn, name):
    img = Image.new("RGB", (w, w))
    px = img.load()
    for y in range(w):
        for x in range(w):
            px[x, y] = fn(x, y, w)
    save(img, name)
    return img


def tex_brown_brick():
    def fn(x, y, w):
        h = 16
        if y % h < 2 or x % 32 < 2:
            return (44, 33, 25)
        n = hash01(x // 32, y // h, 1)
        base = mix((84, 66, 50), (58, 44, 34), n)
        if n > 0.92:
            return mix(base, (60, 74, 42), 0.6)  # moss patch
        if n < 0.06:
            return shade(base, 0.82)
        return base

    seamless(120, fn, "tex-brown-brick.png")


def tex_gray_block():
    def fn(x, y, w):
        if y % 24 < 2 or x % 40 < 2:
            return (48, 47, 43)
        n = hash01(x // 40, y // 24, 2)
        base = mix((92, 91, 84), (72, 71, 65), n)
        if n > 0.9:
            return mix(base, (52, 50, 46), 0.5)
        return base

    seamless(120, fn, "tex-gray-block.png")


def tex_tech_panel():
    def fn(x, y, w):
        if y % 30 < 3 or x % 30 < 3:
            return (40, 43, 45)
        if (x % 30) in (6, 7) and (y % 30) in (6, 7):
            return (110, 118, 120)
        if hash01(x // 30, y // 30, 3) > 0.9:
            return (62, 66, 68)
        return (75, 80, 82)

    seamless(120, fn, "tex-tech-panel.png")


def tex_tech_trim():
    def fn(x, y, w):
        if y % 12 < 3:
            return (32, 34, 37)
        n = hash01(x // 24, y // 12, 4)
        return mix((62, 66, 70), (46, 49, 52), n)

    seamless(120, fn, "tex-tech-trim.png")


def tex_metal_floor():
    def fn(x, y, w):
        if y % 40 < 3 or x % 48 < 3:
            return (52, 44, 35)
        if (x % 48) in (8, 9) and (y % 40) in (8, 9):
            return (122, 104, 80)
        n = hash01(x, y, 5)
        base = mix((99, 84, 64), (78, 66, 51), n)
        if n > 0.97:
            return shade(base, 1.25)
        if n < 0.04:
            return shade(base, 0.8)
        return base

    seamless(120, fn, "tex-metal-floor.png")


def tex_slime_wall():
    def fn(x, y, w):
        n = hash01(x // 24, y // 24, 6)
        base = mix((66, 72, 62), (50, 55, 47), n)
        if hash01(x // 8, y // 8, 7) > 0.86:
            return mix((124, 154, 67), (62, 82, 40), hash01(x, y, 8))
        return base

    seamless(120, fn, "tex-slime-wall.png")


def tex_pipes():
    def fn(x, y, w):
        if 24 <= x < 36 or 84 <= x < 96:
            return (96, 86, 68)
        if x in (22, 38, 82, 98):
            return (40, 35, 27)
        return mix((84, 76, 62), (66, 59, 47), hash01(x // 20, y // 20, 9))

    seamless(120, fn, "tex-pipes.png")


def tex_wood():
    def fn(x, y, w):
        if y % 24 < 2:
            return (57, 43, 28)
        n = hash01(x, y // 24, 10)
        base = mix((102, 80, 54), (76, 58, 38), n)
        if x % 37 == 0:
            return shade(base, 0.85)
        return base

    seamless(120, fn, "tex-wood.png")


def tex_stone():
    def fn(x, y, w):
        if y % 20 < 2 or x % 30 < 2:
            return (80, 75, 64)
        n = hash01(x // 30, y // 20, 11)
        base = mix((118, 111, 96), (94, 88, 75), n)
        if n > 0.9:
            return mix(base, (70, 66, 56), 0.4)
        return base

    seamless(120, fn, "tex-stone.png")


def tex_dark_rock():
    def fn(x, y, w):
        n = hash01(x // 16, y // 16, 12)
        base = mix((64, 59, 51), (44, 40, 34), n)
        if hash01(x, y, 13) > 0.9:
            return shade(base, 1.3)
        return base

    seamless(120, fn, "tex-dark-rock.png")


def tex_water():
    def fn(x, y, w):
        n = hash01(x // 6, y // 6, 14)
        base = mix((58, 107, 99), (40, 78, 72), n)
        if y % 24 < 3 and hash01(x // 24, y // 24, 15) > 0.5:
            return mix(base, (92, 148, 133), 0.55)
        return base

    seamless(120, fn, "tex-water.png")


def tex_ceil():
    def fn(x, y, w):
        if y % 30 < 2 or x % 30 < 2:
            return (26, 24, 21)
        return mix((40, 37, 33), (33, 30, 26), hash01(x // 30, y // 30, 16))

    seamless(120, fn, "tex-ceil.png")


def tex_exit():
    def fn(x, y, w):
        # alternating black / hazard stripes, vertical
        if (x // 8) % 2 == 0:
            base = (26, 25, 22)
        else:
            base = (176, 142, 54)
        if hash01(x, y, 17) > 0.96:
            return shade(base, 0.85)
        return base

    seamless(120, fn, "tex-exit.png")


def tex_light():
    def fn(x, y, w):
        base = mix((150, 148, 132), (196, 190, 168), hash01(x, y, 18))
        if y < 2 or y > w - 3:
            return (110, 104, 88)
        return base

    seamless(120, fn, "tex-light.png")


def tex_crate():
    def fn(x, y, w):
        # crate planking with diagonal bracing
        n = hash01(x, y, 23)
        base = mix((122, 92, 56), (94, 70, 42), n)
        if (x + y) % 46 < 4:
            return shade(base, 0.72)
        if x % 34 < 2 or y % 34 < 2:
            return shade(base, 0.6)
        return base

    seamless(120, fn, "tex-crate.png")


def tex_slipgate():
    # procedural blue/violet energy swirl with bright sparks
    w = 120

    def fn(x, y, w):
        cx, cy = w / 2, w / 2
        r = math.hypot(x - cx, y - cy)
        a = math.atan2(y - cy, x - cx)
        band = math.sin(r * 0.45 + a * 3.0) * math.sin(r * 0.21 - a * 5.0)
        if band > 0.55:
            t = (band - 0.55) / 0.45
            return mix((64, 44, 160), (120, 200, 255), t)
        if band < -0.55:
            return (16, 10, 34)
        return mix((28, 18, 58), (44, 30, 96), (band + 0.55) / 1.1)

    seamless(120, fn, "tex-slipgate.png")


# ------------------------------------------------------------- billboards --


def billboard(name, painter, w=160, h=200):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    painter(d, w, h)
    save(img, name)
    return img


def px_rect(d, x0, y0, x1, y1, fill):
    d.rectangle([x0, y0, x1, y1], fill=fill)


def grunt(d, w, h):
    # base shadow
    d.ellipse([44, 182, 116, 192], fill=(10, 6, 4, 180))
    # legs
    px_rect(d, 62, 132, 74, 182, (48, 26, 20))
    px_rect(d, 86, 132, 98, 182, (48, 26, 20))
    # boots
    px_rect(d, 58, 174, 78, 182, (30, 16, 12))
    px_rect(d, 82, 174, 102, 182, (30, 16, 12))
    # torso armor
    d.polygon([(58, 84), (102, 84), (112, 138), (48, 138)], fill=(118, 44, 34))
    d.polygon([(66, 92), (94, 92), (102, 132), (58, 132)], fill=(150, 62, 44))
    # chest plate
    d.polygon([(70, 98), (90, 98), (94, 126), (66, 126)], fill=(176, 148, 100))
    # shoulder pads
    px_rect(d, 42, 84, 60, 112, (96, 36, 28))
    px_rect(d, 100, 84, 118, 112, (96, 36, 28))
    # arms
    px_rect(d, 40, 106, 54, 140, (70, 26, 20))
    px_rect(d, 106, 106, 120, 140, (70, 26, 20))
    # gun in right hand
    px_rect(d, 104, 118, 136, 128, (60, 58, 52))
    px_rect(d, 128, 112, 138, 134, (38, 36, 32))
    # neck + head
    px_rect(d, 70, 66, 90, 88, (94, 74, 52))
    d.ellipse([64, 40, 96, 74], fill=(118, 92, 62))
    # helmet with horns
    d.polygon([(60, 50), (100, 50), (96, 62), (64, 62)], fill=(70, 26, 20))
    d.polygon([(56, 44), (60, 30), (68, 42)], fill=(70, 26, 20))
    d.polygon([(104, 44), (100, 30), (92, 42)], fill=(70, 26, 20))
    # face: glowing eyes
    px_rect(d, 68, 52, 76, 58, (0, 0, 0))
    px_rect(d, 84, 52, 92, 58, (0, 0, 0))
    px_rect(d, 70, 53, 74, 56, (255, 120, 40))
    px_rect(d, 86, 53, 90, 56, (255, 120, 40))
    # belt
    px_rect(d, 58, 132, 102, 140, (44, 34, 26))
    d.rectangle([76, 130, 84, 142], fill=(150, 122, 60))


def rottweiler(d, w, h):
    d.ellipse([50, 184, 110, 192], fill=(8, 5, 3, 180))
    # body
    d.ellipse([44, 128, 116, 184], fill=(52, 36, 28))
    d.ellipse([54, 136, 106, 178], fill=(70, 48, 34))
    # legs
    for x0 in (52, 96):
        px_rect(d, x0, 168, x0 + 12, 184, (30, 20, 14))
    # tail
    d.polygon([(44, 132), (26, 118), (42, 124)], fill=(40, 26, 18))
    # head
    d.polygon([(102, 96), (118, 88), (140, 108), (128, 132), (100, 132)], fill=(58, 40, 30))
    # ears
    d.polygon([(104, 100), (100, 84), (114, 94)], fill=(40, 26, 18))
    d.polygon([(118, 92), (124, 78), (128, 94)], fill=(40, 26, 18))
    # muzzle / teeth
    px_rect(d, 120, 112, 142, 120, (44, 28, 20))
    for i in range(3):
        px_rect(d, 124 + i * 6, 112, 126 + i * 6, 116, (220, 210, 190))
    # glowing eye
    px_rect(d, 118, 100, 126, 106, (255, 60, 20))
    # spikes
    for x in (72, 84, 60):
        d.polygon([(x, 126), (x + 4, 112), (x + 10, 126)], fill=(36, 24, 16))


def flame(d, w, h):
    cx = w / 2
    base = h - 10
    for y in range(30, base + 1):
        t = (base - y) / (base - 30)
        half = 6 + t * 26
        for x in range(int(cx - half), int(cx + half) + 1):
            if not (30 <= y <= base):
                continue
            wob = 1 + 0.25 * math.sin(y * 0.9) * math.sin(x * 0.7)
            if abs(x - cx) > half * wob:
                continue
            if t < 0.35:
                color = mix((255, 240, 160), (255, 160, 40), t / 0.35)
            elif t < 0.75:
                color = mix((255, 160, 40), (196, 60, 16), (t - 0.35) / 0.4)
            else:
                color = mix((196, 60, 16), (90, 26, 10), (t - 0.75) / 0.25)
            d.point((x, y), fill=color + (235,))


def explosion_frame(d, w, h, frame):
    cx, cy = w / 2, h / 2 + 10
    rng2 = random.Random(7 + frame)
    if frame < 2:
        r = 18 + frame * 34
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 196, 90, 235))
        d.ellipse([cx - r * 0.55, cy - r * 0.55, cx + r * 0.55, cy + r * 0.55],
                  fill=(255, 238, 200, 255))
        for i in range(12):
            a = rng2.random() * math.tau
            d.line([cx, cy, cx + math.cos(a) * (r + 10), cy + math.sin(a) * (r + 10)],
                   fill=(255, 140, 40, 230), width=6)
    else:
        r = 58
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(120, 90, 70, 140))
        d.ellipse([cx - r * 0.5, cy - r * 0.5, cx + r * 0.5, cy + r * 0.5],
                  fill=(60, 44, 34, 120))
        for i in range(10):
            a = rng2.random() * math.tau
            d.ellipse([cx + math.cos(a) * r - 10, cy + math.sin(a) * r - 10,
                       cx + math.cos(a) * r + 10, cy + math.sin(a) * r + 10],
                      fill=(80, 62, 48, 110))


def spark(d, w, h):
    cx, cy = w / 2, h / 2
    d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(255, 246, 190, 255))
    for a in (0, math.pi / 2, math.pi, 3 * math.pi / 2):
        d.line([cx, cy, cx + math.cos(a) * 26, cy + math.sin(a) * 26],
               fill=(255, 210, 120, 230), width=4)
    for a in (math.pi / 4, 3 * math.pi / 4, 5 * math.pi / 4, 7 * math.pi / 4):
        d.line([cx, cy, cx + math.cos(a) * 16, cy + math.sin(a) * 16],
               fill=(255, 236, 170, 200), width=3)


def c9(d, w, h):
    x0, y0 = 20, 6
    x1, y1 = w - 20, h - 12
    d.ellipse([x0 - 4, y0 - 4, x0 + 4, y0 + 4], fill=(120, 150, 80))
    d.ellipse([x1 - 4, y0 - 4, x1 + 4, y0 + 4], fill=(120, 150, 80))
    d.rectangle([x0, y0, x1, y1], fill=(74, 108, 52))
    d.rectangle([x0 + 8, y0, x1 - 8, y1], fill=(104, 146, 70))
    d.rectangle([x0 + 8, y0 + 12, x1 - 8, y0 + 34], fill=(70, 92, 44))
    d.rectangle([x0 + 8, y0 + 46, x1 - 8, y0 + 72], fill=(70, 92, 44))
    d.rectangle([x0 + 8, y0 + 84, x1 - 8, y0 + 108], fill=(70, 92, 44))
    d.rectangle([x0 + 24, y0 + 12, x0 + 60, y0 + 34], fill=(216, 190, 66))
    d.ellipse([x0 - 8, y0 - 14, x1 + 8, y0 + 6], fill=(150, 180, 110))


def slipgate(d, w, h):
    cx, cy = w / 2, h / 2
    rng2 = random.Random(11)
    for r in range(56, 10, -3):
        color = mix((36, 16, 90), (150, 220, 255), (56 - r) / 46)
        d.arc([cx - r, cy - r, cx + r, cy + r], start=-40, end=200, fill=color, width=4)
    d.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(240, 250, 255, 255))
    for i in range(22):
        a = rng2.random() * math.tau
        rr = rng2.random() * 52
        d.ellipse([cx + math.cos(a) * rr - 2, cy + math.sin(a) * rr - 2,
                   cx + math.cos(a) * rr + 2, cy + math.sin(a) * rr + 2],
                  fill=(200, 230, 255, 240))


def pickup_box(name, w, h, base, stripe, symbol):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x0, y0 = 4, 10
    x1, y1 = w - 4, h - 6
    d.rectangle([x0 + 4, y0 + 4, x1 + 4, y1 + 4], fill=(10, 8, 6, 200))
    d.rectangle([x0, y0, x1, y1], fill=base)
    d.rectangle([x0, y0, x1, y0 + 7], fill=shade(base, 1.4))
    d.rectangle([x0, y0, x0 + 6, y1], fill=shade(base, 1.25))
    d.rectangle([x1 - 6, y0, x1, y1], fill=shade(base, 0.7))
    d.rectangle([x0, y1 - 6, x1, y1], fill=shade(base, 0.65))
    d.rectangle([x0 + 8, y0 + 22, x1 - 8, y0 + 34], fill=stripe)
    symbol(d, x0, y0, x1, y1)
    save(img, name)


def cross_symbol(color):
    def draw_cross(d, x0, y0, x1, y1):
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        s = (x1 - x0) * 0.16
        d.rectangle([cx - s * 1.9, cy - s, cx + s * 1.9, cy + s], fill=color)
        d.rectangle([cx - s, cy - s * 1.9, cx + s, cy + s * 1.9], fill=color)

    return draw_cross


def q_symbol():
    def draw_q(d, x0, y0, x1, y1):
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        r = (x1 - x0) * 0.24
        f = font(int(r * 1.7))
        bbox = d.textbbox((0, 0), "Q", font=f)
        d.text((cx - (bbox[2] - bbox[0]) / 2 - bbox[0], cy - (bbox[3] - bbox[1]) / 2 - bbox[1]),
               "Q", font=f, fill=(255, 226, 120, 255))

    return draw_q


def nails_symbol():
    def draw_nails(d, x0, y0, x1, y1):
        for i in range(3):
            x = x0 + 10 + i * ((x1 - x0 - 20) / 2)
            d.line([x, y0 + 18, x, y1 - 10], fill=(200, 190, 120), width=4)
            d.polygon([(x - 4, y0 + 18), (x + 4, y0 + 18), (x, y0 + 6)], fill=(220, 210, 150))

    return draw_nails


def gun_symbol(barrels=1):
    def draw_gun(d, x0, y0, x1, y1):
        my = (y0 + y1) / 2
        for b in range(barrels):
            yy = my + (b - (barrels - 1) / 2) * 10
            d.rectangle([x0 + 8, yy - 3, x1 - 10, yy + 3], fill=(66, 62, 56))
        d.rectangle([x1 - 22, y0 + 18, x1 - 6, y1 - 14], fill=(112, 82, 50))

    return draw_gun


def armor_symbol():
    def draw_a(d, x0, y0, x1, y1):
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        d.polygon([(cx, y0 + 10), (x0 + 14, y0 + 26), (x0 + 22, cy),
                   (x0 + 22, y1 - 18), (x1 - 22, y1 - 18), (x1 - 22, cy),
                   (x1 - 14, y0 + 26)], outline=(30, 24, 16), width=3)

    return draw_a


def suit_symbol():
    def draw_s(d, x0, y0, x1, y1):
        cx = (x0 + x1) / 2
        d.ellipse([cx - 12, y0 + 10, cx + 12, y0 + 34], outline=(16, 30, 16), width=3)
        d.polygon([(cx - 16, y0 + 30), (cx + 16, y0 + 30), (cx + 20, y1 - 12),
                   (cx - 20, y1 - 12)], outline=(16, 30, 16), width=3)
        d.rectangle([cx - 6, y0 + 16, cx + 6, y0 + 28], fill=(180, 220, 190))

    return draw_s


def shell_symbol():
    def draw_sh(d, x0, y0, x1, y1):
        for i in range(2):
            x = x0 + 14 + i * 20
            d.rectangle([x, y0 + 20, x + 10, y1 - 10], fill=(196, 156, 72))
            d.rectangle([x, y0 + 20, x + 10, y0 + 28], fill=(120, 60, 40))
            d.rectangle([x, y0 + 28, x + 10, y0 + 34], fill=(216, 180, 90))

    return draw_sh


# ----------------------------------------------------------------- weapons --


def weapon_view(name, painter):
    img = Image.new("RGBA", (384, 240), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    painter(d)
    save(img, name)


def axe_view(d):
    # handle diagonal from bottom-left of view to mid-right
    d.line([(120, 214), (318, 118)], fill=(108, 76, 40), width=16)
    d.line([(120, 214), (318, 118)], fill=(134, 96, 52), width=10)
    # leather wrap
    for i in range(4):
        y = 186 - i * 18
        x = 148 + i * 16
        d.line([(x - 8, y + 6), (x + 8, y - 8)], fill=(72, 48, 28), width=6)
    # steel head
    hx, hy = 318, 118
    d.polygon([(hx - 26, hy - 74), (hx + 34, hy - 82), (hx + 46, hy - 20),
               (hx - 6, hy - 12)], fill=(152, 156, 150))
    d.polygon([(hx - 26, hy - 74), (hx + 6, hy - 74), (hx + 18, hy - 20),
               (hx - 6, hy - 12)], fill=(198, 202, 192))
    d.polygon([(hx - 46, hy - 58), (hx - 22, hy - 66), (hx - 6, hy - 12),
               (hx - 26, hy - 10)], fill=(126, 130, 124))
    d.polygon([(hx - 46, hy - 58), (hx - 34, hy - 58), (hx - 26, hy - 10),
               (hx - 40, hy - 10)], fill=(180, 184, 176))
    # edge gleam
    d.line([(hx - 24, hy - 72), (hx + 32, hy - 80)], fill=(236, 240, 232), width=3)


def shotgun_view(d):
    d.line([(96, 158), (330, 132)], fill=(58, 54, 48), width=20)
    d.line([(96, 158), (330, 132)], fill=(74, 70, 62), width=14)
    d.line([(96, 158), (330, 132)], fill=(96, 92, 82), width=6)
    # pump
    d.line([(196, 146), (248, 140)], fill=(110, 76, 44), width=24)
    # stock
    d.polygon([(96, 148), (56, 176), (46, 206), (104, 178)], fill=(98, 68, 38))
    d.polygon([(96, 148), (56, 176), (46, 206), (104, 178)], outline=(60, 40, 22))
    # muzzle
    d.rectangle([330, 122, 344, 142], fill=(40, 38, 34))


def dbs_view(d):
    # upper barrel
    d.line([(86, 130), (330, 108)], fill=(54, 50, 44), width=18)
    d.line([(86, 130), (330, 108)], fill=(70, 66, 58), width=12)
    # lower barrel
    d.line([(86, 158), (330, 150)], fill=(54, 50, 44), width=18)
    d.line([(86, 158), (330, 150)], fill=(70, 66, 58), width=12)
    # stock
    d.polygon([(86, 128), (40, 158), (32, 196), (92, 172)], fill=(98, 68, 38))
    d.polygon([(86, 128), (40, 158), (32, 196), (92, 172)], outline=(60, 40, 22))
    # muzzles
    d.rectangle([330, 98, 344, 118], fill=(40, 38, 34))
    d.rectangle([330, 140, 344, 160], fill=(40, 38, 34))


def nailgun_view(d):
    d.rectangle([110, 120, 330, 188], fill=(74, 78, 80))
    d.rectangle([110, 120, 330, 132], fill=(104, 110, 112))
    d.rectangle([110, 176, 330, 188], fill=(50, 54, 56))
    # barrels
    d.rectangle([330, 112, 344, 134], fill=(44, 46, 48))
    d.rectangle([330, 162, 344, 184], fill=(44, 46, 48))
    # grip
    d.polygon([(118, 160), (96, 200), (86, 226), (150, 196)], fill=(60, 62, 64))
    # nail strip
    for x in range(132, 320, 22):
        d.polygon([(x, 120), (x + 8, 120), (x + 4, 104)], fill=(206, 196, 140))
    # vents
    for x in range(140, 310, 24):
        d.rectangle([x, 140, x + 10, 148], fill=(52, 56, 58))


# ------------------------------------------------------------- hud / menus --


def make_hud():
    w, h = 768, 84
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # brown metal strip
    d.rectangle([0, 0, w, h], fill=(97, 77, 53))
    d.rectangle([0, 0, w, 6], fill=(130, 106, 76))
    d.rectangle([0, h - 8, w, h], fill=(48, 37, 25))
    d.line([(0, 10), (w, 10)], fill=(72, 56, 38))
    d.line([(0, h - 12), (w, h - 12)], fill=(72, 56, 38))
    # rivets
    for x in range(6, w, 24):
        d.ellipse([x - 2, 3, x + 2, 7], fill=(160, 134, 98))
        d.ellipse([x - 2, h - 9, x + 2, h - 5], fill=(160, 134, 98))
    # division ridges
    x = 0
    divs = []
    for col in range(4):
        x += 148
        divs.append(x)
        d.rectangle([x, 8, x + 5, h - 12], fill=(74, 58, 40))
        d.line([(x + 5, 8), (x + 5, h - 12)], fill=(44, 34, 23))
    # labels + values
    f_small = font(13)
    f_num = font(46)
    d.text((divs[0] + 20, 20), "HEALTH", font=f_small, fill=(44, 34, 23))
    d.text((divs[0] + 20, 34), "100", font=f_num, fill=(206, 156, 58))
    d.text((divs[1] + 20, 20), "AMMO", font=f_small, fill=(44, 34, 23))
    d.text((divs[1] + 20, 34), "25", font=f_num, fill=(206, 156, 58))
    d.text((divs[2] + 20, 20), "ARMOR", font=f_small, fill=(44, 34, 23))
    d.text((divs[2] + 20, 34), "0", font=f_num, fill=(206, 156, 58))
    d.text((divs[3] + 16, 24), "QUAKE", font=font(26), fill=(206, 156, 58))
    d.text((divs[3] + 16, 52), "E1M1", font=f_small, fill=(60, 48, 33))
    save(img, "hud-strip.png")


def make_wordmark():
    w, h = 900, 260
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    text = "QUAKE"
    size = 150
    f = font(size)
    bbox = d.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    x0 = (w - tw) / 2 - bbox[0]
    y0 = 20
    # bevel layers
    d.text((x0 + 8, y0 + 10), text, font=f, fill=(24, 12, 4, 255))
    d.text((x0 + 4, y0 + 6), text, font=f, fill=(110, 66, 22, 255))
    d.text((x0, y0), text, font=f, fill=(196, 146, 52, 255))
    d.text((x0 - 2, y0 - 2), text, font=f, fill=(238, 206, 128, 255))
    save(img, "wordmark.png")


def make_menu_sky():
    w, h = 512, 256
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = y / h
            base = mix((20, 14, 10), (2, 2, 4), t)
            n = hash01(x // 2, y // 2, 21)
            px[x, y] = shade(base, 0.85 + n * 0.3)
    # stars
    for i in range(130):
        x = rng.randrange(w)
        y = rng.randrange(int(h * 0.7))
        c = rng.choice([(170, 160, 140), (120, 130, 160), (200, 190, 170)])
        img.putpixel((x, y), c)
    d = ImageDraw.Draw(img)
    # gothic arch silhouette
    d.rectangle([0, 168, w, h], fill=(10, 8, 6))
    arch = [(0, 256), (0, 190), (176, 190), (196, 152), (216, 190), (256, 190),
            (256, 256)]
    d.polygon(arch, fill=(6, 5, 4))
    d.polygon([(150, 256), (150, 198), (196, 168), (242, 198), (242, 256)], fill=(4, 3, 3))
    # glowing slit inside the arch
    d.rectangle([192, 186, 200, 226], fill=(90, 200, 220))
    d.rectangle([194, 190, 198, 222], fill=(190, 240, 250))
    # floor glow
    for y in range(226, 256):
        t = (y - 226) / 30
        for x in range(160, 232):
            if hash01(x // 3, y // 3, 22) > 0.5:
                img.putpixel((x, y), mix((20, 60, 66), (4, 10, 12), t))
    save(img, "menu-sky.png")


def make_cover():
    img = Image.new("RGB", (400, 260), (8, 6, 4))
    sky = Image.open(os.path.join(ROOT, "menu-sky.png")).convert("RGBA").resize((400, 200))
    img.paste(sky, (0, 0), sky)
    mark = Image.open(os.path.join(ROOT, "wordmark.png")).convert("RGBA")
    mark = mark.resize((340, int(340 * 260 / 900)))
    img.paste(mark, (30, 60), mark)
    d = ImageDraw.Draw(img)
    d.text((30, 210), "E1M1", font=font(30), fill=(206, 156, 58))
    d.text((100, 218), "THE SLIPGATE COMPLEX", font=font(22), fill=(160, 140, 110))
    save(img, "cover.png")


def make_favicon():
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 31, 31], fill=(16, 10, 6))
    d.rectangle([0, 0, 31, 3], fill=(60, 42, 22))
    f = font(22)
    bbox = d.textbbox((0, 0), "Q", font=f)
    d.text(((32 - (bbox[2] - bbox[0])) / 2 - bbox[0], (32 - (bbox[3] - bbox[1])) / 2 - bbox[1] - 1),
           "Q", font=f, fill=(206, 156, 58))
    save(img, "favicon.png")


# ------------------------------------------------------------------ main ----


def main():
    tex_brown_brick()
    tex_gray_block()
    tex_tech_panel()
    tex_tech_trim()
    tex_metal_floor()
    tex_slime_wall()
    tex_pipes()
    tex_wood()
    tex_stone()
    tex_dark_rock()
    tex_water()
    tex_ceil()
    tex_exit()
    tex_light()
    tex_crate()
    tex_slipgate()

    billboard("grunt.png", grunt)
    billboard("rottweiler.png", rottweiler)
    billboard("flame.png", flame)
    billboard("c9.png", c9)
    billboard("slipgate.png", slipgate, 120, 120)
    billboard("explosion-1.png", lambda d, w, h: explosion_frame(d, w, h, 0))
    billboard("explosion-2.png", lambda d, w, h: explosion_frame(d, w, h, 1))
    billboard("explosion-3.png", lambda d, w, h: explosion_frame(d, w, h, 2))
    billboard("spark.png", spark, 64, 64)

    pickup_box("pickup-shells.png", 80, 60, (150, 110, 44), (186, 40, 30), shell_symbol())
    pickup_box("pickup-shells-big.png", 80, 60, (196, 156, 72), (186, 40, 30), shell_symbol())
    pickup_box("pickup-health15.png", 80, 60, (208, 200, 176), (186, 40, 30), cross_symbol((186, 40, 30)))
    pickup_box("pickup-health25.png", 80, 60, (208, 200, 176), (186, 40, 30), cross_symbol((186, 40, 30)))
    pickup_box("pickup-health100.png", 80, 60, (216, 196, 140), (186, 40, 30), cross_symbol((186, 40, 30)))
    pickup_box("pickup-armor-green.png", 80, 60, (58, 122, 58), (24, 66, 24), armor_symbol())
    pickup_box("pickup-armor-yellow.png", 80, 60, (188, 162, 58), (120, 96, 26), armor_symbol())
    pickup_box("pickup-quad.png", 80, 60, (38, 62, 148), (16, 26, 84), q_symbol())
    pickup_box("pickup-nailgun.png", 80, 60, (66, 70, 72), (150, 150, 144), gun_symbol(2))
    pickup_box("pickup-nails.png", 80, 60, (96, 84, 62), (150, 150, 144), nails_symbol())
    pickup_box("pickup-shotgun.png", 80, 60, (120, 84, 48), (186, 40, 30), gun_symbol(1))
    pickup_box("pickup-dbs.png", 80, 60, (120, 84, 48), (186, 40, 30), gun_symbol(2))
    pickup_box("pickup-biosuit.png", 80, 60, (60, 100, 60), (24, 66, 24), suit_symbol())

    weapon_view("axe-view.png", axe_view)
    weapon_view("shotgun-view.png", shotgun_view)
    weapon_view("dbs-view.png", dbs_view)
    weapon_view("nailgun-view.png", nailgun_view)

    make_hud()
    make_wordmark()
    make_menu_sky()
    make_cover()
    make_favicon()

    files = sorted(os.listdir(ROOT))
    total = sum(os.path.getsize(os.path.join(ROOT, f)) for f in files)
    print(f"{len(files)} files, {total // 1024} KB total")


if __name__ == "__main__":
    main()
