#!/usr/bin/env python3
"""Prepare the optional fan-test art: --rooms contact.png --cast chroma.png.
Requires Pillow and numpy. Raw generated plates stay outside Git; only the
small WebP/PNG outputs are shipped. The WAVs are original synthetic test cues,
not character recordings. No paid API or impersonated actor voices.
"""
import argparse
import math
import pathlib
import struct
import wave
import numpy as np
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--rooms', required=True)
parser.add_argument('--cast', required=True)
parser.add_argument('--out', default='public/assets/family-guy')
args = parser.parse_args()
out = pathlib.Path(args.out)
out.mkdir(parents=True, exist_ok=True)
rooms = Image.open(args.rooms).convert('RGB')
w, h = rooms.size
for name, col, row in [('living-room', 0, 0), ('basement', 1, 0), ('clam', 0, 1), ('yard', 1, 1)]:
    # Trim the generated contact sheet's thin separator lines.
    plate = rooms.crop((col*w//2+2, row*h//2+2, (col+1)*w//2-2, (row+1)*h//2-2))
    plate = plate.resize((960, 540), Image.Resampling.LANCZOS)
    plate.save(out / (name+'.webp'), quality=88, method=6)

cast = Image.open(args.cast).convert('RGBA')
p = np.array(cast)
# Chroma key with a soft fringe. Only saturated magenta is removed, not the
# characters' white clothing/fur. No background colour bleeds into alpha.
r, g, b = [p[:, :, i].astype(float) for i in range(3)]
magenta = np.minimum(r, b) - g
p[:, :, 3] = np.clip(255 - (magenta-45)*2.5, 0, 255).astype(np.uint8)
# Split on transparent GUTTERS, not equal quarters. Generators don't place
# differently-sized characters at exact 25% boundaries; quartering clipped
# Peter's hand and put that stray hand beside Lois in the running game.
occupied = (p[:, :, 3] > 32).sum(axis=0) > 3
runs, start = [], None
for x, on in enumerate(occupied):
    if on and start is None:
        start = x
    if not on and start is not None:
        if x-start > 20:
            runs.append((max(0, start-3), min(cast.width, x+3)))
        start = None
if start is not None:
    runs.append((max(0, start-3), cast.width))
if len(runs) != 4:
    raise ValueError(f'Expected four separated characters; found {len(runs)}. Inspect the chroma plate.')
cast = Image.fromarray(p)
for (left, right), name in zip(runs, ['peter', 'lois', 'brian', 'stewie']):
    tile = cast.crop((left, 0, right, cast.height))
    box = tile.getbbox()
    if box:
        tile = tile.crop(box)
    tile.thumbnail((320, 440), Image.Resampling.LANCZOS)
    tile.save(out / (name+'.png'), optimize=True)
    if name == 'peter':
        # Four lightly bobbing walk frames: a deliberately simple test sheet
        # to exercise idle/walk/talk playback and the Studio frame scrubber.
        sheet = Image.new('RGBA', (352*4, 464), (0, 0, 0, 0))
        for frame, bob in enumerate([0, -3, 0, -2]):
            sheet.alpha_composite(tile, (frame*352+(352-tile.width)//2, 464-tile.height-4+bob))
        sheet.save(out / 'peter-sheet.png', optimize=True)

for name, notes in [('channel', [660, 880, 440]), ('lab', [440, 550, 660]), ('clam', [330, 440]), ('ending', [523.25, 659.25, 783.99])]:
    rate = 22050
    samples = []
    for freq in notes:
        n = int(rate * 0.18)
        for j in range(n):
            t = j / rate
            envelope = min(1, j/110) * (1-j/n)**2
            samples.append(int(5000 * envelope * math.sin(2*math.pi*freq*t)))
    with wave.open(str(out/(name+'.wav')), 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(struct.pack('<'+'h'*len(samples), *samples))
print('Prepared', sum(1 for p in out.iterdir() if p.is_file()), 'small, local test assets in', out)
