#!/usr/bin/env node
/** Rebuild the seven HD sheets with the SAME forge the Studio uses.
 * Start Vite first. Optional: PLAYWRIGHT_BASE_URL / PLAYWRIGHT_CHROMIUM_PATH.
 * Source plates: plates/blade-runner-pass2 (all ten images).
 * Browser canvas produces the actual PNG, no separate/approximate keyer. */
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'public/assets/blade-runner/hd');
mkdirSync(out, { recursive: true });
const names = ['mccoy', 'runciter', 'howie', 'guzza', 'leary', 'gordo', 'zuben'];
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}),
  args: ['--no-sandbox'],
});
const metadata = {};
try {
  const page = await browser.newPage();
  await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173');
  for (const name of names) {
    const result = await page.evaluate(async (name) => {
      const { forgeSpriteSheet } = await import('/src/studio/spriteForge.ts');
      const sheet = await forgeSpriteSheet(`/plates/blade-runner-pass2/${name}.png`, 'walk', {
        key: { r: 255, g: 0, b: 255 }, tolerance: 60, softness: 24,
        targetHeight: 768, preserveScale: true, despill: true,
      });
      if (sheet.frameCount !== 4) throw new Error(`${name}: expected four cleanly separated poses, got ${sheet.frameCount}`);
      const img = new Image();
      img.src = sheet.dataUrl;
      await img.decode();
      const canvas = document.createElement('canvas');
      // Real single-person head-and-shoulders avatar, not the whole atlas
      // squeezed into the inventory/cast portrait.
      canvas.width = Math.round(sheet.frameWidth * 0.85);
      canvas.height = Math.round(sheet.frameHeight * 0.38);
      canvas.getContext('2d').drawImage(img,
        Math.round((sheet.frameWidth - canvas.width) / 2), 0, canvas.width, canvas.height,
        0, 0, canvas.width, canvas.height);
      return { ...sheet, portrait: canvas.toDataURL('image/png') };
    }, name);
    const save = (file, data) => writeFileSync(path.join(out, file), Buffer.from(data.split(',')[1], 'base64'));
    save(`${name}-sheet.png`, result.dataUrl);
    save(`${name}-portrait.png`, result.portrait);
    metadata[name] = { frameWidth: result.frameWidth, frameHeight: result.frameHeight, frameCount: result.frameCount };
    console.log(`${name}: ${result.frameCount} × ${result.frameWidth}×${result.frameHeight}`);
  }
  // Convert the three environment sources, and crop the legacy shop plate
  // to remove its giant baked-in policeman. These are deterministic edits,
  // not additional image generations.
  for (const name of ['mainframe', 'kitchen', 'warehouse', 'runciter-room']) {
    const data = await page.evaluate(async (name) => {
      const img = new Image();
      img.src = name === 'runciter-room' ? '/assets/blade-runner/runciter-int.jpg' : `/plates/blade-runner-pass2/${name}.png`;
      await img.decode();
      const x = name === 'runciter-room' ? Math.floor(img.width * .285) : 0;
      const y = name === 'runciter-room' ? Math.floor(img.height * .285) : 0;
      const canvas = document.createElement('canvas');
      canvas.width = img.width - x; canvas.height = img.height - y;
      canvas.getContext('2d').drawImage(img, x, y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/webp', .93);
    }, name);
    writeFileSync(path.join(out, `${name}.webp`), Buffer.from(data.split(',')[1], 'base64'));
  }
  // The old inventory thumbnails were multi-megabyte PNG plates. Keep
  // 768px versions for the KIA rather than loading 3 MB for a 44px icon.
  mkdirSync(path.join(out, 'items'), { recursive: true });
  for (const file of readdirSync(path.join(root, 'public/assets/blade-runner')).filter(f => /^br-item-.*\.png$/.test(f))) {
    const data = await page.evaluate(async (file) => {
      const img = new Image(); img.src = `/assets/blade-runner/${file}`; await img.decode();
      const scale = Math.min(1, 768 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/webp', .92);
    }, file);
    writeFileSync(path.join(out, 'items', file.replace('br-item-', '').replace('.png', '.webp')), Buffer.from(data.split(',')[1], 'base64'));
  }
  // Repair the legacy rectangular windscreen crop: reveal the left glass
  // ABOVE the A-pillar, retain its hand-keyed wipers, and exclude the cabin TV.
  // Derive from the unmodified original masks so rebuilds are idempotent.
  const masks = await page.evaluate(async () => {
    const load = async src => { const i = new Image(); i.src = src; await i.decode(); return i; };
    const original = await load('/assets/blade-runner/spinner-windscreen-window.png');
    const w = original.width, h = original.height;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = 'white'; ctx.beginPath();
    const points = [[0,0],[.935,0],[.925,.46],[.84,.454],[.70,.435],[.26,.421],[.23,.401],[0,.145]];
    points.forEach(([x,y], i) => i ? ctx.lineTo(x*w,y*h) : ctx.moveTo(x*w,y*h)); ctx.closePath(); ctx.fill();
    const aperture = ctx.getImageData(0, 0, w, h).data;
    ctx.clearRect(0,0,w,h); ctx.drawImage(original,0,0);
    const window = ctx.getImageData(0,0,w,h);
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
      const i=(y*w+x)*4;
      window.data[i]=window.data[i+1]=window.data[i+2]=255;
      window.data[i+3]=Math.min(aperture[i+3], x < w*.19 ? 255 : window.data[i+3]);
    }
    ctx.putImageData(window,0,0); const windscreen = c.toDataURL('image/png');
    const highway = await load('/assets/blade-runner/spinner-highway-window.png');
    ctx.clearRect(0,0,w,h); ctx.drawImage(highway,0,0,w,h);
    const traffic=ctx.getImageData(0,0,w,h);
    for (let i=3;i<traffic.data.length;i+=4) traffic.data[i]=Math.min(traffic.data[i],window.data[i]);
    ctx.putImageData(traffic,0,0); return { windscreen, highway: c.toDataURL('image/png') };
  });
  for (const [name, data] of Object.entries(masks))
    writeFileSync(path.join(out, `spinner-${name === 'windscreen' ? 'windscreen' : 'highway'}-window.png`), Buffer.from(data.split(',')[1], 'base64'));
  writeFileSync(path.join(out, 'sheets.json'), JSON.stringify(metadata, null, 2) + '\n');
} finally {
  await browser.close();
}
