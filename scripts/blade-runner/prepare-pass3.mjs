#!/usr/bin/env node
/** Reproducible, non-generative derivatives from the ten pass-3 sources.
 * Uses the REAL Studio forge and atlas assembler via Vite/browser canvas.
 * Start Vite first; optional PLAYWRIGHT_BASE_URL / PLAYWRIGHT_CHROMIUM_PATH.
 * Rebuild pass-2 assets first if missing. Never changes the source PNGs. */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const out = path.join(process.cwd(), 'public/assets/blade-runner/hd/pass3');
mkdirSync(out, { recursive: true });
const save = (name, data) => writeFileSync(path.join(out, name), Buffer.from(data.split(',')[1], 'base64'));
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}), args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173');
  const metadata = {};
  for (const actor of ['mccoy', 'zuben', 'gaff']) {
    const result = await page.evaluate(async actor => {
      const { forgeSpriteSheet } = await import('/src/studio/spriteForge.ts');
      const { assembleSpriteAtlas } = await import('/src/studio/spriteAtlas.ts');
      const legacy = await (await fetch('/assets/blade-runner/hd/sheets.json')).json();
      const banks = [];
      if (actor !== 'gaff') banks.push({ id: 'side', image: `/assets/blade-runner/hd/${actor}-sheet.png`, ...legacy[actor] });
      const sources = actor === 'mccoy' ? [['rest',4],['walk-away',6],['walk-near',4],['actions',4]] : actor === 'zuben' ? [['pot',4]] : [['',4]];
      for (const [suffix, count] of sources) {
        const name = suffix ? `${actor}-${suffix}` : actor;
        const forged = await forgeSpriteSheet(`/plates/blade-runner-pass3/${name}.png`, 'walk', {
          key: { r: 255, g: 0, b: 255 }, tolerance: 60, softness: 24, targetHeight: 768,
          preserveScale: true, despill: true,
          // All new sources have a genuinely flat key. Islands keep each
          // foot/pot/cane with its body even where x-projections overlap.
          keyMode: 'flat', islands: true, frameCount: count,
        });
        if (forged.frameCount !== count) throw new Error(`${name}: expected ${count} separated poses, got ${forged.frameCount}; inspect before changing the slice.`);
        banks.push({ id: suffix || actor, image: forged.dataUrl, frameWidth: forged.frameWidth, frameHeight: forged.frameHeight, frameCount: forged.frameCount });
      }
      const atlas = await assembleSpriteAtlas(banks, 704);
      const frames = (bank, offsets) => offsets.map(i => atlas.ranges[bank].first + i);
      const clip = (bank, offsets, fps = 7, loop = true) => ({ frames: frames(bank, offsets), fps, loop });
      const animations = actor === 'mccoy' ? {
        idle: clip('rest',[0],1), rest: clip('rest',[0,2],.7), talk: clip('rest',[0,1,0,3],3),
        walk: clip('side',[0,1,2,3]), 'walk-right': clip('side',[0,1,2,3]),
        'idle-right': clip('rest',[0],1), 'idle-up': clip('actions',[1],1), 'idle-down': clip('actions',[0],1),
        'idle-up-right': clip('walk-away',[1],1), 'idle-down-right': clip('rest',[2],1),
        'walk-up': clip('walk-away',[0,1,2,3,4,5],8), 'walk-up-right': clip('walk-away',[0,1,2,3,4,5],8),
        'walk-down': clip('walk-near',[0,1,2,3]), 'walk-down-right': clip('walk-near',[0,1,2,3]),
        duck: clip('actions',[2],1,false), draw: { frames: [...frames('rest',[0]), ...frames('actions',[3])], fps: 5, loop: false },
        aim: clip('actions',[3],1,false), holster: { frames: [...frames('actions',[3]), ...frames('rest',[0])], fps: 4, loop: false },
      } : actor === 'zuben' ? {
        idle: clip('side',[0],1), rest: clip('side',[0],1), walk: clip('side',[2,0,3,0],5), talk: clip('side',[0,1,0,1],3),
        pot: clip('pot',[0],1), threat: clip('pot',[0,1],2,false), throw: clip('pot',[1,2],4,false),
        run: { frames: [...frames('pot',[3]), ...frames('side',[3]), ...frames('pot',[3]), ...frames('side',[2])], fps: 8 },
      } : {
        idle: clip('gaff',[0],1), rest: clip('gaff',[1],1), talk: clip('gaff',[0,2,0,3],1.5), walk: clip('gaff',[1],1),
      };
      const img = new Image(); img.src = atlas.dataUrl; await img.decode();
      const portraitFrame = actor === 'mccoy' ? atlas.ranges.rest.first : 0;
      const portrait = document.createElement('canvas'); portrait.width = Math.round(atlas.frameWidth * .95); portrait.height = Math.round(atlas.frameHeight * .38);
      portrait.getContext('2d').drawImage(img,
        portraitFrame % atlas.columns * atlas.frameWidth + (atlas.frameWidth - portrait.width) / 2,
        Math.floor(portraitFrame / atlas.columns) * atlas.frameHeight,
        portrait.width, portrait.height, 0, 0, portrait.width, portrait.height);
      return { dataUrl: atlas.dataUrl, portrait: portrait.toDataURL('image/png'), metadata: {
        frameWidth: atlas.frameWidth, frameHeight: atlas.frameHeight, frameCount: atlas.frameCount,
        columns: atlas.columns, rows: atlas.rows, ranges: atlas.ranges, animations,
      } };
    }, actor);
    save(`${actor}-sheet.png`, result.dataUrl); save(`${actor}-portrait.png`, result.portrait);
    metadata[actor] = result.metadata;
    console.log(`${actor}: ${result.metadata.frameCount} × ${result.metadata.frameWidth}×${result.metadata.frameHeight}, grid ${result.metadata.columns}×${result.metadata.rows}`);
  }
  // Empty environments and genuine crops of the SAME security still. The
  // gold dragonfly pin and red wrapper/reflection are already in that source;
  // these derivatives don't invent detail or substitute an unrelated room.
  const derivatives = [
    ['chinatown-alley','chinatown-alley'], ['warehouse-stairs','warehouse-stairs'], ['howie-street','howie-street'],
    ['runciter-security','runciter-security'],
    ['esper-wrapper','runciter-security',[1030,400,310,210]],
    ['esper-dragonfly','runciter-security',[816,212,245,255]],
    ['esper-cages','runciter-security',[40,270,630,420]],
  ];
  for (const [name, source, crop] of derivatives) {
    const data = await page.evaluate(async ({ source, crop }) => {
      const img = new Image(); img.src = `/plates/blade-runner-pass3/${source}.png`; await img.decode();
      const [x,y,w,h] = crop || [0,0,img.width,img.height];
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img,x,y,w,h,0,0,w,h);
      return c.toDataURL('image/webp', .95);
    }, { source, crop });
    save(`${name}.webp`, data);
  }
  writeFileSync(path.join(out, 'sheets.json'), JSON.stringify(metadata, null, 2) + '\n');
} finally { await browser.close(); }
