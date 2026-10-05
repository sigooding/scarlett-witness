#!/usr/bin/env python3
"""Prepare the Black-Mass Bride illustrations and original synthetic sound cues.

Optional authoring dependency: Pillow (python -m pip install pillow).
Raw AI plates belong in public/img/black-mass-bride/src/ (ignored). Shipped
WebPs, portraits, sprite sheet, SVG inventory art and WAVs are ordinary files.
No download, provider key or runtime generation is required to play the reel.
"""
from pathlib import Path
from PIL import Image
import math
import random
import struct
import subprocess
import wave

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "public/img/black-mass-bride"
RAW = ART / "src"
SOUND = ROOT / "public/audio/black-mass-bride"
ART.mkdir(parents=True, exist_ok=True)
SOUND.mkdir(parents=True, exist_ok=True)

# Remove the generated paper margins: the room is a full-bleed, clickable plate.
for name in ("library", "chamber", "office", "apartment", "garden", "dream", "cover"):
    file = RAW / f"{name}.png"
    if not file.exists():
        continue
    im = Image.open(file).convert("RGB")
    inset = (24, 22, 1352, 748) if name == "cover" else (15, 12, 1360, 754)
    im = im.crop(inset)
    im.save(ART / f"{name}.webp", quality=88, method=6)

# The generated contact sheet has four columns; the useful six are hand-selected.
portraits = {"jay": (0, 0), "victoria": (1, 0), "pat": (2, 0),
             "arthur": (0, 1), "peters": (1, 1), "marne": (2, 1)}
if (RAW / "cast.png").exists():
    im = Image.open(RAW / "cast.png").convert("RGB")
    for name, (col, row) in portraits.items():
        x, y = 24 + 336 * col, 22 + 373 * row
        im.crop((x, y, x + 312, y + 350)).resize((240, 270), Image.Resampling.LANCZOS).save(ART / f"{name}.webp", quality=90)
if (RAW / "law.png").exists():
    im = Image.open(RAW / "law.png").convert("RGB")
    for name, col in (("oleary", 0), ("starr", 1)):
        w, h = im.size
        im.crop((w // 2 * col + 14, 14, w // 2 * (col + 1) - 14, h - 14)).resize((260, 260), Image.Resampling.LANCZOS).save(ART / f"{name}.webp", quality=90)

if (RAW / "walker.png").exists():
    # Same key-and-slice pipeline as Studio's Sprite Forge.
    subprocess.run(["node", "scripts/make-sprite-sheet.mjs", "--in", str(RAW / "walker.png"),
                    "--out", str(ART / "jay-sheet.png"), "--key", "ff00ff", "--height", "320", "--frames", "4"], cwd=ROOT, check=True)

# Deliberately legible, hand-authored evidence silhouettes, not tiny stock emoji.
icons = {
    "mark": '<path d="M66 42c-26 8-32 50-11 64 14 10 24-15 24-30V44zM94 42c26 8 32 50 11 64-14 10-24-15-24-30V44z" fill="#803a39"/><path d="M82 28v96" stroke="#e7d7b1" stroke-width="3"/>',
    "envelope": '<path d="M27 48h106v68H27zM27 49l53 39 53-39M27 116l40-35m66 35L94 81"/><circle cx="81" cy="91" r="12" fill="#9c4442" stroke="none"/>',
    "plan": '<path d="M33 28h94v105H33zM46 44h64v28H46zm0 40h25v30H46zm39 0h25v30H85z"/><path d="M70 70h17m-5 6v37" stroke="#9c4442" stroke-dasharray="4 4"/>',
    "keys": '<circle cx="59" cy="53" r="18"/><path d="M71 67l44 43m-12-12l9-9m0 18l10-10M56 72v49m0-13H42m14 4h12" stroke-width="6"/>',
    "newspaper": '<path d="M31 28h98v105H31zM46 44h68M46 53h68M46 70h28v30H46zm41 0h27m-27 10h27m-27 10h27M46 113h68"/><path d="M46 44h68" stroke="#9c4442" stroke-width="7"/>',
    "wire": '<path d="M37 105c-18-32 56-91 83-47s-52 62-65 24 67-32 65 24" stroke="#bf9061" stroke-width="7"/><path d="M31 107l-9 7m98-8l11 7" stroke="#e7d7b1" stroke-width="4"/>',
    "scarf": '<path d="M50 30c38-7 38 27 66 32l-14 32c-34-14-37-34-38-1l-6 39-24-5c5-56 25-65 16-97z" fill="#e7d7b1" stroke="#beab80"/><path d="M35 117l23 6m42-38l18-14" stroke="#9c4442"/>',
    "dossier": '<path d="M27 45h45l10 11h51v74H27z" fill="#67543e"/><path d="M45 27h70v81H45z" fill="#dfcba3" stroke="#dfcba3"/><path d="M57 45h42M57 58h42M57 71h24" stroke="#514332"/><path d="M27 72h106v58H27z" fill="#836848"/><circle cx="83" cy="94" r="13" fill="#963f3d" stroke="none"/>',
    "glove": '<path d="M56 125l-5-32-16-23c-5-10 3-14 10-8l12 12-2-38c0-13 13-13 13 0l1 27 2-40c0-10 13-10 13 0v39l4-34c2-12 14-10 13 3l-1 34 5-25c3-11 14-8 11 3l-6 47-13 35z" fill="#c7b894"/>',
    "shovel": '<path d="M59 23h40v19H59zM80 42v58" stroke-width="7"/><path d="M53 96h54l-4 29-23 15-23-15z" fill="#859993"/>',
    "testimony": '<path d="M35 24h88v112H35zM48 44h61M48 57h61M48 70h61M48 83h44"/><path d="M50 110l12 10 30-24" stroke="#9c4442" stroke-width="6"/>',
}
for name, drawing in icons.items():
    (ART / f"{name}.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect x="5" y="5" width="150" height="150" rx="16" fill="#112725"/><rect x="10" y="10" width="140" height="140" rx="12" fill="none" stroke="#927d56" stroke-opacity=".5"/><g fill="none" stroke="#d9c89f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">{drawing}</g></svg>')

RATE = 22050

def wav(name, seconds, sample):
    random.seed(1936)
    with wave.open(str(SOUND / f"{name}.wav"), "wb") as f:
        f.setparams((1, 2, RATE, 0, "NONE", "not compressed"))
        data = bytearray()
        for i in range(int(seconds * RATE)):
            t = i / RATE
            # Click-free edges. These are original synthesized cues, not voices.
            edge = min(1, t / .08, (seconds - t) / .12)
            value = max(-.92, min(.92, sample(t))) * max(0, edge)
            data.extend(struct.pack("<h", round(value * 32767)))
        f.writeframes(data)

# Sparse, quiet underscore; the music bus supplies player-adjustable gain.
def score(t):
    notes = [110, 130.8128, 146.8324, 103.8262, 110, 164.8138, 146.8324, 123.4708]
    n = notes[int(t / 3) % len(notes)]
    env = math.sin(math.pi * (t % 3) / 3) ** 2
    return .09 * math.sin(2 * math.pi * 55 * t) + env * (.11 * math.sin(2 * math.pi * n * t) + .045 * math.sin(2 * math.pi * (n * 2.002) * t))
wav("undertone", 24, score)
wav("phone", 2.2, lambda t: .24 * (math.sin(2 * math.pi * 760 * t) + .5 * math.sin(2 * math.pi * 1020 * t)) * (1 if t % .85 < .55 else 0) * (.65 + .35 * math.sin(2 * math.pi * 24 * t)))
wav("bell", 1.8, lambda t: math.exp(-3 * t) * (.38 * math.sin(2 * math.pi * 880 * t) + .18 * math.sin(2 * math.pi * 1423 * t)))
wav("knock", 1.2, lambda t: sum(math.exp(-55 * (t - start)) * .45 * math.sin(2 * math.pi * 105 * t) for start in (.08, .4, .72) if t >= start))
print("Prepared compact local art, portraits, evidence and four original sound cues.")
