/**
 * One-off: import the REAL shipped 48MB case file through the real import path
 * and report how many of its asset references actually resolve at play time.
 */
import { readFileSync, statSync } from "node:fs";
import { compactStoryMedia, importStoryAssets, loadAssets, resolveStoryMedia } from "../../src/data/mediaLibrary";
import type { Story } from "../../src/types";

const file = process.argv[2];
const bytes = statSync(file).size;
const bundle: Story = JSON.parse(readFileSync(file, "utf8"));

const guard = !bundle.id || !bundle.scenes?.length;
const assets = bundle.assets ?? [];

await importStoryAssets(bundle.id, assets);
const { assets: _a, ...cleaned } = bundle;
const compacted = await compactStoryMedia(cleaned);
const rows = await loadAssets(bundle.id);
const resolved = await resolveStoryMedia(compacted);

const json = JSON.stringify(resolved);
const dangling = [...new Set(json.match(/(?:video:)?asset:[^"]+/g) ?? [])];

console.log(
  JSON.stringify(
    {
      file,
      fileMB: +(bytes / 1048576).toFixed(1),
      importGuardRejects: guard,
      scenes: bundle.scenes.length,
      bundledAssets: assets.length,
      rowsRestoredToIndexedDB: rows.length,
      danglingAssetRefsAfterResolve: dangling.length,
      dangling: dangling.slice(0, 5),
      localStorageMB: +(Buffer.byteLength(JSON.stringify(compacted)) / 1048576).toFixed(2),
      ok: !guard && rows.length === assets.length && dangling.length === 0,
    },
    null,
    2
  )
);
process.exitCode = guard || rows.length !== assets.length || dangling.length ? 1 : 0;
