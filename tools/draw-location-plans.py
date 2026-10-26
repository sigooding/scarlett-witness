#!/usr/bin/env python3
"""Draws the film's location plans: overhead maps of a place, with who stands where, for attaching to an image generator
beside the pictures of that place (docs/location-references.md says which pictures each plan corrects).

    python3 tools/draw-location-plans.py [--out DIR]
    FFMPEG=/usr/bin/ffmpeg node tools/install-film-picture.mjs DIR/<plan>.jpg public/film/img/sheets/<plan>.jpg

Writes, at 1920x1080:
  hive-service-road-plan.jpg  the service road behind the Hive (scenes 67 and 70): the back door, the dumpster, the
                              pillars, the grey sedan, the driver, the shooter, and Jack and Mara's moves, numbered
  jacks-office-plan.jpg       Jack's office (scenes 10, 11, 18, 21, 77) as the room master s10/164 has it

Every position below is in metres, so a plan is changed by changing a number here and drawing it again. Install the new
plan with tools/install-film-picture.mjs, which archives the one it replaces. Needs Pillow and the DejaVu fonts.

State (26 October 2026): neither plan is installed or approved.
- The OFFICE plan is wrong: the director says it has the desk the wrong way. Its door also follows 164, and most office
  pictures have another one (docs/location-references.md, section 1). Change jacks_office() to match the director's
  office reference before drawing it again.
- The service road plan follows the screenplay and docs/location-references.md, section 2. The director approved it as
  drawn ("the hive map was ok"), and it is installed as sheets/hive-service-road-plan.jpg. Its top runs a little into
  the title, and its labels crowd around the back door.
- The director's instruction stands: Claude draws no more maps unless asked. This tool is kept for the director to use.
"""
import argparse
import math
import os
import tempfile

from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
W, H = 1920, 1080
BG, INK, DIM, FAINT = (24, 28, 33), (232, 232, 228), (150, 156, 162), (70, 76, 84)
JACK, MARA, DRIVER, SHOOTER = (95, 211, 255), (255, 143, 177), (255, 166, 77), (255, 77, 77)
LAMP, WALL, ROAD, CAR = (255, 170, 60), (96, 100, 106), (40, 45, 51), (170, 174, 178)


def font(size, bold=False):
    return ImageFont.truetype(os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"), size)


class Plan:
    """A canvas with a metre grid: x east (right), y north (up) for the road; the office uses y down from the back wall."""

    def __init__(self, title, subtitle, scale, origin, y_up=True):
        self.im = Image.new("RGB", (W, H), BG)
        self.d = ImageDraw.Draw(self.im, "RGBA")
        self.scale, self.origin, self.y_up = scale, origin, y_up
        self.d.text((48, 30), title, font=font(40, True), fill=INK)
        self.d.text((50, 84), subtitle, font=font(21), fill=DIM)

    def p(self, x, y):
        ox, oy = self.origin
        return (ox + x * self.scale, oy - y * self.scale if self.y_up else oy + y * self.scale)

    def rect(self, x0, y0, x1, y1, fill=None, outline=None, width=2):
        (a, b), (c, e) = self.p(x0, y0), self.p(x1, y1)
        self.d.rectangle((min(a, c), min(b, e), max(a, c), max(b, e)), fill=fill, outline=outline, width=width)

    def poly(self, pts, fill=None, outline=None, width=2):
        self.d.polygon([self.p(*q) for q in pts], fill=fill, outline=outline, width=width)

    def line(self, pts, fill=INK, width=3, dash=None):
        pts = [self.p(*q) for q in pts]
        if not dash:
            self.d.line(pts, fill=fill, width=width, joint="curve")
            return
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = max(1, int(math.hypot(x1 - x0, y1 - y0) // dash))
            for i in range(0, n, 2):
                t0, t1 = i / n, min(1, (i + 1) / n)
                self.d.line((x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0, x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1), fill=fill, width=width)

    def arrow(self, a, b, fill=INK, width=3, dash=None):
        self.line([a, b], fill, width, dash)
        (x0, y0), (x1, y1) = self.p(*a), self.p(*b)
        ang = math.atan2(y1 - y0, x1 - x0)
        for s in (-1, 1):
            self.d.line((x1, y1, x1 - 16 * math.cos(ang + s * 0.45), y1 - 16 * math.sin(ang + s * 0.45)), fill=fill, width=width)

    def dot(self, x, y, r, fill, label=None, ink=BG):
        cx, cy = self.p(x, y)
        self.d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill, outline=BG, width=2)
        if label:
            f = font(int(r * 1.1), True)
            w = self.d.textlength(label, font=f)
            self.d.text((cx - w / 2, cy - r * 0.62), label, font=f, fill=ink)

    def glow(self, x, y, radius_m, colour, alpha=46):
        cx, cy = self.p(x, y)
        r = radius_m * self.scale
        for k in range(8, 0, -1):
            rr = r * k / 8
            self.d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=colour + (int(alpha / 8),))

    def camera(self, x, y, heading_deg, label, colour=INK):
        """A camera mark: a wedge pointing the way the camera looks, as a screen angle (0 = right, 90 = up the page).
        (The first version flipped the angle on the office plan, so its camera marks pointed the wrong way.)"""
        cx, cy = self.p(x, y)
        a = math.radians(heading_deg)
        tip = (cx + 34 * math.cos(a), cy - 34 * math.sin(a))
        l = (cx + 22 * math.cos(a + 2.5), cy - 22 * math.sin(a + 2.5))
        r = (cx + 22 * math.cos(a - 2.5), cy - 22 * math.sin(a - 2.5))
        self.d.polygon([tip, l, r], fill=colour + (60,), outline=colour, width=3)
        f = font(22, True)
        self.d.text((cx - 10 - self.d.textlength(label, font=f) if math.cos(a) > 0.3 else cx + 14, cy + 10), label, font=f, fill=colour)

    def text(self, x, y, s, size=18, fill=DIM, bold=False, anchor="la"):
        self.d.text(self.p(x, y), s, font=font(size, bold), fill=fill, anchor=anchor)

    def legend(self, x, y, rows, width=760):
        """rows: (text, colour, bold) or ("", ...) for a gap; long lines wrap at the panel's width."""
        for s, colour, bold in rows:
            if not s:
                y += 12
                continue
            f = font(20, bold)
            words, line = s.split(" "), ""
            for w in words:
                trial = (line + " " + w).strip()
                if self.d.textlength(trial, font=f) > width and line:
                    self.d.text((x, y), line, font=f, fill=colour)
                    y += 27
                    line = "    " + w
                else:
                    line = trial
            self.d.text((x, y), line, font=f, fill=colour)
            y += 27
        return y


def car(plan, cx, cy, heading, open_rear_left=True):
    """A saloon 4.8 x 1.8 m pointing `heading` degrees; returns where the open rear left door's outer edge is."""
    h = math.radians(heading)
    fwd, left = (math.cos(h), math.sin(h)), (math.cos(h + math.pi / 2), math.sin(h + math.pi / 2))
    at = lambda f, l: (cx + fwd[0] * f + left[0] * l, cy + fwd[1] * f + left[1] * l)
    body = [at(2.4, 0.9), at(2.4, -0.9), at(-2.4, -0.9), at(-2.4, 0.9)]
    plan.poly(body, fill=CAR + (255,), outline=INK, width=2)
    plan.poly([at(1.1, 0.75), at(1.1, -0.75), at(-1.6, -0.75), at(-1.6, 0.75)], fill=(120, 124, 128, 255))
    plan.poly([at(2.4, 0.9), at(2.4, -0.9), at(2.15, -0.9), at(2.15, 0.9)], fill=(250, 245, 200, 255))   # headlights: the nose
    plan.poly([at(-2.4, 0.9), at(-2.4, -0.9), at(-2.25, -0.9), at(-2.25, 0.9)], fill=(200, 40, 40, 255))  # tail lights
    if open_rear_left:
        hinge = at(-0.15, 0.9)
        swing = math.radians(heading + 180 - 62)          # front-hinged: the door's back edge swings out and back
        edge = (hinge[0] + 1.05 * math.cos(swing), hinge[1] + 1.05 * math.sin(swing))
        plan.line([hinge, edge], fill=(255, 220, 120), width=7)
        return edge, at, left
    return None, at, left


def service_road(out):
    plan = Plan("LOCATION PLAN · SERVICE ROAD BEHIND THE HIVE",
                "Scenes 67 and 70 · overhead, north up · grid squares 2 m · distances from the screenplay (the car 20 m from the door)",
                scale=21.5, origin=(560, 1000))
    d = plan.d
    for gx in range(-6, 16, 2):                              # the grid
        plan.line([(gx, -1.5), (gx, 43)], fill=(36, 41, 47), width=1)
    for gy in range(-1, 44, 2):
        plan.line([(-6.5, gy), (15.5, gy)], fill=(36, 41, 47), width=1)
    plan.rect(0, -1.5, 8.2, 43, fill=ROAD)                    # the road
    plan.rect(-6.5, -1.5, 0, 13, fill=(58, 62, 68), outline=WALL, width=3)       # the Hive
    plan.text(-3.3, 7.5, "THE HIVE", 26, INK, True, "mm")
    plan.text(-3.3, 5.8, "(back wall)", 18, DIM, False, "mm")
    plan.rect(-6.5, 13, 0, 43, fill=(48, 52, 58), outline=WALL, width=3)          # garages along the same side
    for gy in range(14, 43, 4):
        plan.rect(-0.6, gy + 0.4, 0, gy + 3.4, fill=(110, 114, 120))
    plan.text(-3.3, 27, "CLOSED", 20, DIM, True, "mm")
    plan.text(-3.3, 25.6, "GARAGES", 20, DIM, True, "mm")
    plan.text(-3.3, 24.2, "(shutters)", 16, DIM, False, "mm")
    plan.rect(-1.6, 33.6, -0.2, 34.8, fill=(160, 40, 40), outline=(255, 120, 120))
    plan.text(-2.0, 34.2, "8:52 CLOCK SIGN", 16, (255, 150, 150), True, "rm")
    plan.rect(2.0, 40.4, 5.2, 42.6, fill=(80, 80, 60), outline=(230, 220, 150))
    plan.text(3.6, 41.5, "LIT BOOTH", 14, (230, 220, 150), True, "mm")
    plan.text(3.6, 43.6, "FAR END OF THE ROAD", 16, DIM, True, "mm")
    plan.rect(8.2, -1.5, 15.5, 43, fill=(16, 18, 22))         # the dark under the viaduct
    for gy in (2, 10, 18, 26, 34, 42):                        # the row of pillars
        plan.rect(8.7, gy - 0.8, 10.3, gy + 0.8, fill=(120, 124, 128), outline=INK, width=2)
    plan.text(13.0, 38, "RAILWAY", 18, DIM, True, "mm")
    plan.text(13.0, 36.8, "OVERHEAD", 18, DIM, True, "mm")
    plan.text(13.0, 30, "DARK", 18, FAINT, True, "mm")
    plan.text(13.0, 28.8, "UNDER THE", 18, FAINT, True, "mm")
    plan.text(13.0, 27.6, "VIADUCT", 18, FAINT, True, "mm")
    plan.text(9.5, 44.1, "PILLARS", 16, DIM, True, "mm")
    plan.glow(8.2, 18.6, 7.5, LAMP, 70)                       # the one sodium lamp, by the pillar at the car
    plan.dot(8.2, 18.6, 7, LAMP)
    plan.text(8.0, 15.9, "SODIUM LAMP", 15, LAMP, True, "rm")
    plan.glow(-0.2, 0.9, 2.2, LAMP, 60)                       # the lamp over the back door
    plan.dot(-0.2, 0.9, 5, LAMP)
    # the back door
    plan.rect(-0.35, -0.6, 0.05, 0.6, fill=(255, 215, 130), outline=INK)
    plan.text(-0.8, -0.1, "BACK DOOR", 18, INK, True, "rm")
    plan.text(-0.8, -1.2, "(steel, lamp above)", 15, DIM, False, "rm")
    # the dumpster
    plan.rect(0.0, 5.0, 1.5, 7.2, fill=(50, 110, 70), outline=INK)
    plan.text(0.75, 6.1, "DUMP-", 12, INK, True, "mm")
    plan.text(0.75, 5.5, "STER", 12, INK, True, "mm")
    # the car, its nose toward the Hive wall, its left side (and the open rear door) toward the back door
    edge, at, left = car(plan, 5.3, 20.0, 200)
    plan.text(5.3, 23.0, "GREY SEDAN", 18, INK, True, "mm")
    plan.text(5.3, 22.0, "nose toward the Hive wall", 14, DIM, False, "mm")
    plan.text(1.0, 18.1, "rear LEFT door", 14, (255, 220, 120), True, "lm")
    plan.text(1.0, 17.3, "open, toward them", 14, (255, 220, 120), False, "lm")
    # lines of fire from the shooter in the dark between the pillars
    shooter = (11.0, 14.0)
    for target in ((3.6, 10.2), (1.4, 7.0), (0.25, 0.7)):
        plan.line([shooter, target], fill=SHOOTER + (150,), width=2, dash=10)
    # Jack and Mara: out of the door, halfway, back behind the dumpster, Mara's run, Jack after her
    plan.arrow((0.4, 0.4), (3.1, 9.4), fill=INK, width=3, dash=12)
    plan.arrow((3.0, 9.6), (1.9, 4.9), fill=MARA, width=3)
    plan.arrow((1.3, 4.2), (0.35, 0.8), fill=MARA, width=4)
    plan.arrow((2.3, 3.7), (0.7, 0.5), fill=JACK, width=3, dash=8)
    plan.dot(3.3, 10.4, 15, JACK, "J")
    plan.dot(4.4, 10.0, 15, MARA, "M")
    plan.dot(2.3, 4.4, 13, JACK, "J")
    plan.dot(1.6, 4.0, 13, MARA, "M")
    plan.dot(edge[0] + 0.2, edge[1] - 0.9, 16, DRIVER, "D")
    plan.dot(*shooter, 16, SHOOTER, "S", ink=INK)
    for n, (x, y) in (("1", (1.3, 2.4)), ("2", (5.6, 10.4)), ("3", (3.2, 6.4)), ("4", (-0.2, 2.9)), ("5", (2.9, 1.8))):
        plan.dot(x, y, 13, INK, n)
    plan.text(5.3, 9.0, "HALFWAY · 10 m", 15, INK, True, "lm")
    plan.text(5.3, 21.0 - 4.4, "20 m from the door", 14, DIM, False, "mm")
    # cameras
    plan.camera(3.2, -0.9, 90, "A", INK)
    plan.camera(3.6, 25.5, 270, "B", (190, 255, 170))
    plan.camera(3.2, 12.3, 0, "C", (255, 230, 120))
    rows = [
        ("WHO", INK, True),
        ("J  Jack     M  Mara     D  the driver     S  the shooter, in the dark between the pillars", INK, False),
        ("", INK, False),
        ("WHAT HAPPENS (the numbers on the plan)", INK, True),
        ("1  They come out of the back door into the rain. The car waits beside the pillars, 20 m away (389).", DIM, False),
        ("2  Halfway the driver, at the open rear door, bows: \"Shitsurei shimasu.\" Mara stops dead. He murmurs \"Position.\" into his sleeve (390, 391, 392, 237).", DIM, False),
        ("3  \"Run!\" Jack shoves her back; muzzle flashes from between the pillars; they get down on the DOOR side of the dumpster, the dumpster between them and the shooter (393, 394, 395).", DIM, False),
        ("4  Mara breaks for the door: five metres, three. The shot. She falls through the doorway (396, 397).", DIM, False),
        ("5  Jack goes after her, low; bullets chew the doorframe (398).", DIM, False),
        ("", INK, False),
        ("CAMERAS", INK, True),
        ("A  From the door end, up the road: Hive wall and dumpster LEFT, pillars and lamp RIGHT, the car ahead-right with its nose to the LEFT and its open door toward us. Most of the scene: 234, 389, 237, 393, 395, 396.", DIM, False),
        ("B  The reverse, from beyond the car: pillars LEFT, the Hive wall RIGHT, the lit back door at the end of the run. For Mara's run seen from behind (396's fix).", (190, 255, 170), False),
        ("C  From where they stand, into the pillars: the car at the LEFT edge, nose toward us; the muzzle flash in the dark between two pillars (394's fix).", (255, 230, 120), False),
        ("", INK, False),
        ("NEVER: the dumpster on the far side of the door; Mara running toward the car; the car's nose pointing up the road.", SHOOTER, True),
    ]
    plan.legend(1080, 150, rows, width=790)
    plan.im.save(out, quality=92)


def jacks_office(out):
    # WRONG as it stands (26 October 2026): the director says the desk is the wrong way. Fix the numbers below against
    # the director's office reference before drawing this again (see the docstring at the top).
    plan = Plan("LOCATION PLAN · JACK'S OFFICE",
                "Scenes 10, 11, 18, 21, 77 · overhead, the back wall at the top · as the room master s10/164 has it · never mirrored",
                scale=150, origin=(150, 250), y_up=False)
    d = plan.d
    rw, rd = 4.6, 4.0
    plan.rect(-0.15, -0.15, rw + 0.15, rd + 0.02, fill=WALL)              # walls
    plan.rect(0, 0, rw, rd, fill=(44, 49, 55))                              # floor
    for gx in range(1, 5):
        plan.line([(gx, 0), (gx, rd)], fill=(52, 57, 63), width=1)
    for gy in range(1, 4):
        plan.line([(0, gy), (rw, gy)], fill=(52, 57, 63), width=1)
    # the window and the railway outside it
    plan.rect(1.3, -0.15, 3.4, 0.0, fill=(120, 170, 210))
    plan.text(2.35, -0.62, "WINDOW · grey blinds · rain · the elevated railway outside", 17, (150, 190, 220), True, "mm")
    # under the window: the low grey steel cupboard with binders on it
    plan.rect(1.3, 0.0, 3.4, 0.45, fill=(105, 110, 116), outline=INK)
    plan.text(2.35, 0.22, "LOW STEEL CUPBOARD · binders", 14, BG, True, "mm")
    # right back corner: filing cabinet, the CRT on top
    plan.rect(3.95, 0.0, 4.6, 0.62, fill=(118, 122, 128), outline=INK)
    plan.text(4.27, 0.2, "FILING", 12, BG, True, "mm")
    plan.text(4.27, 0.42, "+ CRT", 12, BG, True, "mm")
    # right wall: the sofa
    plan.rect(3.9, 2.25, 4.6, 4.0, fill=(110, 84, 62), outline=INK)
    plan.text(4.25, 3.1, "SOFA", 16, INK, True, "mm")
    plan.text(4.25, 3.4, "blanket", 13, INK, False, "mm")
    # left wall: the door (frosted glass) toward the front, a frosted window nearer the camera
    plan.rect(-0.15, 2.3, 0.0, 3.2, fill=(200, 215, 225))
    plan.line([(0.0, 2.3), (0.82, 2.62)], fill=(200, 215, 225), width=5)
    cx, cy = plan.p(0, 2.3)
    d.arc((cx - 0.9 * 150, cy - 0.9 * 150, cx + 0.9 * 150, cy + 0.9 * 150), 0, 90, fill=(200, 215, 225), width=2)
    plan.rect(-0.15, 3.35, 0.0, 3.9, fill=(150, 165, 175))
    plan.text(-0.25, 2.75, "DOOR", 17, INK, True, "rm")
    plan.text(-0.25, 2.98, "frosted glass", 13, DIM, False, "rm")
    plan.text(-0.25, 3.62, "frosted", 13, DIM, False, "rm")
    plan.text(-0.25, 3.8, "window", 13, DIM, False, "rm")
    plan.text(-0.25, 2.1, "landing, stairs ▸", 13, DIM, False, "rm")
    # the desk, free-standing in the middle, its long side to the camera
    plan.rect(1.4, 1.62, 3.0, 2.37, fill=(98, 64, 40), outline=INK, width=3)
    plan.text(2.2, 2.12, "DESK · dark walnut · 1.6 × 0.75 m", 14, INK, True, "mm")
    plan.dot(1.58, 1.82, 13, (80, 200, 110))                               # the lamp: its LEFT end
    plan.text(1.58, 1.42, "LAMP", 13, (120, 230, 140), True, "mm")
    plan.dot(2.08, 1.78, 11, (12, 12, 12))                                 # the one phone: back edge, left of centre
    plan.text(2.2, 1.42, "PHONE", 13, INK, True, "lm")
    # chairs: Jack at the RIGHT end facing LEFT, the visitor at the LEFT end facing him
    plan.rect(3.12, 1.78, 3.58, 2.24, fill=(70, 50, 40), outline=INK)
    plan.dot(3.32, 2.0, 18, JACK, "J")
    plan.arrow((3.1, 2.0), (2.75, 2.0), fill=JACK, width=4)
    plan.rect(0.82, 1.82, 1.25, 2.25, fill=(70, 50, 40), outline=INK)
    plan.dot(1.05, 2.03, 16, (255, 200, 120), "V")
    # cameras
    plan.camera(2.2, 4.55, 90, "MASTER", INK)
    plan.camera(3.85, 1.15, 200, "REVERSE", (190, 255, 170))
    plan.camera(0.35, 3.05, 25, "DOOR", (255, 230, 120))
    rows = [
        ("THE ROOM, NEVER CHANGED", INK, True),
        ("One small grey room. Back wall: the window, grey blinds, rain, the elevated railway outside; under it the low grey steel cupboard with a few binders on it.", DIM, False),
        ("Right back corner: the grey filing cabinet, the small CRT on top (a black-and-white samurai film). Right wall: the worn brown sofa with a grey blanket.", DIM, False),
        ("Left wall, toward the front: the door, frosted glass in a wooden frame (JACK is lettered on the OUTSIDE, so from inside it is not readable), a frosted window nearer the camera.", DIM, False),
        ("The desk stands free in the middle, its long side to the camera: the green-shaded brass lamp at its LEFT end, ONE black rotary phone at its back edge, left of centre.", DIM, False),
        ("J  Jack sits at the desk's RIGHT end, side-on, facing LEFT toward the door, the sofa behind him.", JACK, True),
        ("V  A visitor sits at the LEFT end, facing him.", (255, 200, 120), True),
        ("", INK, False),
        ("CAMERAS", INK, True),
        ("MASTER  In front of the desk's long side, looking at the window: the room master 164, and 194, 249, 189, 435, 87.", DIM, False),
        ("REVERSE  Behind Jack's right shoulder, looking past him to the visitor and the door. No picture yet: make one for the reference.", (190, 255, 170), False),
        ("DOOR  From the doorway, looking at Jack across the desk, the filing cabinet behind him.", (255, 230, 120), False),
        ("", INK, False),
        ("NEVER: the sofa by the door; Jack behind the desk with the window at his back; a second desk or table; two phones; the room mirrored.", SHOOTER, True),
    ]
    plan.legend(1080, 150, rows, width=790)
    plan.im.save(out, quality=92)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default=None, help="folder to write the plans into (default: a new temporary folder)")
    out = ap.parse_args().out or tempfile.mkdtemp(prefix="location-plans-")
    os.makedirs(out, exist_ok=True)
    service_road(os.path.join(out, "hive-service-road-plan.jpg"))
    jacks_office(os.path.join(out, "jacks-office-plan.jpg"))
    print(out)


if __name__ == "__main__":
    main()
