import { sheetCols, type SpriteSheetAnimation } from "../game/spriteSheet";

export interface AtlasBank {
  id: string;
  image: string;
  frameWidth: number;
  frameHeight: number;
  /** Omit to use the entire source grid; specify to exclude padding cells. */
  frameCount?: number;
  /** Optional authored clips, offset into the result without changing timing. */
  animations?: Record<string, SpriteSheetAnimation>;
}
export interface DecodedAtlasBank extends AtlasBank { imageWidth: number; imageHeight: number }
export interface AtlasPlacement { bank: number; frame: number; sx: number; sy: number; x: number; y: number; width: number; height: number }

/** Pure, bounded plan shared by Studio and automated asset preparation.
 * Every bank is scaled uniformly to a common CANVAS height. Transparent head
 * room is retained, so a duck remains short instead of stretching into a
 * standing actor. Frames are centred horizontally and bottom-aligned. */
export function spriteAtlasPlan(banks: DecodedAtlasBank[], targetHeight?: number, maxDimension = 8192) {
  if (!banks.length) throw new Error("Choose at least one sprite bank.");
  const ids = new Set<string>();
  for (const b of banks) {
    if (!b.id || ids.has(b.id)) throw new Error("Sprite bank names must be non-empty and unique.");
    ids.add(b.id);
    if ([b.frameWidth, b.frameHeight, b.imageWidth, b.imageHeight].some(n => !Number.isInteger(n) || n < 1)) throw new Error(`${b.id}: frame and image dimensions must be positive whole pixels.`);
  }
  const frameHeight = targetHeight ?? Math.max(...banks.map(b => b.frameHeight));
  if (!Number.isInteger(frameHeight) || frameHeight < 1 || frameHeight > maxDimension) throw new Error("Invalid atlas frame height.");
  const widths = banks.map(b => Math.max(1, Math.round(b.frameWidth * frameHeight / b.frameHeight)));
  const frameWidth = Math.max(...widths);
  const counts = banks.map(b => {
    const columns = sheetCols({ image: b.image, frameWidth: b.frameWidth, frameHeight: b.frameHeight, animations: {} }, b.imageWidth);
    const available = columns * Math.floor(b.imageHeight / b.frameHeight);
    const count = b.frameCount ?? available;
    if (!Number.isInteger(count) || count < 1 || count > available || b.frameWidth > b.imageWidth * 1.05) throw new Error(`${b.id}: frame count does not fit the source grid.`);
    return count;
  });
  const frameCount = counts.reduce((a, b) => a + b, 0);
  if (frameCount > 1024) throw new Error("Assemble at most 1024 frames at a time.");
  // Prefer a complete rectangular grid (no surprise blank frame in the
  // slicer's frame scrubber); otherwise choose the closest-to-square fit.
  const grids = Array.from({ length: frameCount }, (_, i) => {
    const columns = i + 1, rows = Math.ceil(frameCount / columns);
    return { columns, rows, width: columns * frameWidth, height: rows * frameHeight,
      padding: columns * rows - frameCount };
  }).filter(g => g.width <= maxDimension && g.height <= maxDimension);
  grids.sort((a, b) => Number(a.padding > 0) - Number(b.padding > 0) || Math.abs(Math.log(a.width / a.height)) - Math.abs(Math.log(b.width / b.height)) || a.padding - b.padding);
  const grid = grids[0];
  if (!grid) throw new Error("Atlas is too large; use a lower frame height or fewer banks (8192px canvas limit).");
  const ranges: Record<string, { first: number; count: number }> = Object.create(null);
  const animations: Record<string, SpriteSheetAnimation> = Object.create(null);
  const placements: AtlasPlacement[] = [];
  let offset = 0;
  banks.forEach((b, bank) => {
    const cols = sheetCols({ image: b.image, frameWidth: b.frameWidth, frameHeight: b.frameHeight, animations: {} }, b.imageWidth);
    ranges[b.id] = { first: offset, count: counts[bank] };
    for (const [name, clip] of Object.entries(b.animations ?? {})) {
      if (Object.prototype.hasOwnProperty.call(animations, name)) throw new Error(`Duplicate clip “${name}”; rename it before assembling.`);
      if (!clip.frames.length || clip.frames.some(f => !Number.isInteger(f) || f < 0 || f >= counts[bank])) throw new Error(`${b.id}: clip “${name}” references a missing frame.`);
      animations[name] = { ...clip, frames: clip.frames.map(f => f + offset) };
    }
    for (let frame = 0; frame < counts[bank]; frame++) {
      const index = offset + frame;
      placements.push({ bank, frame, sx: frame % cols * b.frameWidth, sy: Math.floor(frame / cols) * b.frameHeight,
        x: index % grid.columns * frameWidth + Math.floor((frameWidth - widths[bank]) / 2),
        y: Math.floor(index / grid.columns) * frameHeight,
        width: widths[bank], height: frameHeight });
    }
    offset += counts[bank];
  });
  return { ...grid, frameWidth, frameHeight, frameCount, ranges, animations, placements };
}

/** Real browser canvas assembly, used both by SheetEditor and rebuild scripts.
 * Inputs must already be keyed/cut out. Resolve asset: URLs before calling. */
export async function assembleSpriteAtlas(banks: AtlasBank[], targetHeight?: number) {
  const images = await Promise.all(banks.map(async b => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = b.image;
    await img.decode();
    return img;
  }));
  const plan = spriteAtlasPlan(banks.map((b, i) => ({ ...b, imageWidth: images[i].naturalWidth, imageHeight: images[i].naturalHeight })), targetHeight);
  const canvas = document.createElement("canvas");
  canvas.width = plan.width; canvas.height = plan.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot create a sprite atlas canvas.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  for (const p of plan.placements) {
    const b = banks[p.bank];
    ctx.drawImage(images[p.bank], p.sx, p.sy, b.frameWidth, b.frameHeight, p.x, p.y, p.width, p.height);
  }
  return { ...plan, dataUrl: canvas.toDataURL("image/png") };
}
