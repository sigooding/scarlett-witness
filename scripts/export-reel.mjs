#!/usr/bin/env node
/** Export a source story with its public/ media as a portable .reel.json.
 * Usage: node scripts/export-reel.mjs <src/data/story.ts> <story-id> <out.reel.json>
 * Uses the same schema traversal as Studio (including SVG icons, sprites,
 * nested reactions/topics, MP3/video wrappers and Quake prop heights).
 * Unlike browser Studio, this CLI cannot read the author's IndexedDB or
 * download external URLs. Those remain unchanged with explicit warnings.
 */
import { buildSync } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [, , sourceArg, storyId, outArg] = process.argv;
if (!sourceArg || !storyId || !outArg) {
  console.error('usage: node scripts/export-reel.mjs <src/data/story.ts> <story-id> <out.reel.json>');
  process.exit(2);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(root, sourceArg);
const out = path.resolve(root, outArg);
const dir = fs.mkdtempSync(path.join(tmpdir(), 'scarlet-export-'));
const modulePath = path.join(dir, 'export.bundle.mjs');
const MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', svg: 'image/svg+xml',
  gif: 'image/gif', avif: 'image/avif', bmp: 'image/bmp', mp3: 'audio/mpeg', wav: 'audio/wav',
  ogg: 'audio/ogg', opus: 'audio/opus', flac: 'audio/flac', m4a: 'audio/mp4', aac: 'audio/aac',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
};
const unwrap = (value) => {
  const prefix = value.startsWith('video:') ? 'video:' : value.startsWith('mp3:') ? 'mp3:' : '';
  return { prefix, raw: value.slice(prefix.length) };
};
try {
  buildSync({
    stdin: { contents: `import * as stories from ${JSON.stringify(source)}; export { stories }; export { visitStoryMediaFields } from ${JSON.stringify(path.join(root, 'src/data/storyMedia.ts'))};`, resolveDir: root },
    bundle: true, platform: 'node', format: 'esm', target: 'node18', outfile: modulePath, logLevel: 'warning',
  });
  const { stories: exports, visitStoryMediaFields } = await import(pathToFileURL(modulePath).href);
  const stories = Object.values(exports).filter((v) => v && typeof v === 'object' && Array.isArray(v.scenes));
  const original = stories.find((s) => s.id === storyId) ?? (stories.length === 1 ? stories[0] : undefined);
  if (!original) throw new Error(`No story "${storyId}" in ${sourceArg}. Found: ${stories.map((s) => s.id).join(', ') || 'none'}`);
  const story = JSON.parse(JSON.stringify(original));
  const refs = new Map();
  visitStoryMediaFields(story, ({ value, kind }) => {
    const { raw } = unwrap(value);
    if (!/^(?:asset:|data:|gradient:|emoji:)/i.test(raw)) refs.set(raw, kind);
  });
  const assets = new Map((story.assets ?? []).map(({ fileUrl: _local, ...a }) => [a.id, a]));
  const rewritten = new Map(); const warnings = [];
  const publicDir = fs.realpathSync(path.join(root, 'public'));
  for (const [ref, kind] of [...refs].sort(([a], [b]) => a.localeCompare(b))) {
    try {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(ref)) throw new Error('external reference; use Studio to bundle');
      const local = decodeURIComponent(ref.split(/[?#]/)[0]).replace(/^\//, '');
      const disk = fs.realpathSync(path.resolve(publicDir, local));
      if (!disk.startsWith(publicDir + path.sep)) throw new Error('not inside public/');
      const bytes = fs.readFileSync(disk);
      if (!bytes.length) throw new Error('empty file');
      const ext = path.extname(disk).slice(1).toLowerCase();
      const mime = MIME[ext] ?? 'application/octet-stream';
      const id = `file-${createHash('sha256').update(ref).digest('hex').slice(0, 24)}`;
      assets.set(id, { id, name: path.basename(disk), type: mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : mime.startsWith('audio/') ? 'audio' : kind, dataUrl: `data:${mime};base64,${bytes.toString('base64')}`, size: bytes.length, uploadedAt: Date.now() });
      rewritten.set(ref, `asset:${id}`);
    } catch (error) {
      warnings.push(`${ref}: ${error.code === 'ENOENT' ? 'missing from public/' : error.message} (reference kept)`);
    }
  }
  const missingIds = new Set();
  visitStoryMediaFields(story, ({ value, set }) => {
    const { prefix, raw } = unwrap(value);
    if (rewritten.has(raw)) set(prefix + rewritten.get(raw));
    else if (raw.startsWith('asset:') && !assets.has(raw.slice(6))) missingIds.add(raw);
  });
  for (const id of missingIds) warnings.push(`${id}: no embedded library row; export from Studio on the author's machine`);
  story.assets = [...assets.values()];
  const json = JSON.stringify(story, null, 2);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, json);
  console.log(`exported "${story.id}" → ${path.relative(root, out)}`);
  console.log(`  embedded ${rewritten.size}/${refs.size} file reference(s); ${story.assets.length} total assets; ${(Buffer.byteLength(json) / 1024 / 1024).toFixed(2)} MiB JSON`);
  if (warnings.length) { console.warn(`  WARNING: export is not fully portable (${warnings.length} missing/external reference(s))`); warnings.forEach((w) => console.warn(`  ${w}`)); }
} catch (error) {
  console.error(`Export failed: ${error.message}`); process.exitCode = 1;
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
