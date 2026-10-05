#!/usr/bin/env node
/**
 * Import/export round-trip check — runs the REAL src/data/mediaLibrary.ts
 * against a real IndexedDB (fake-indexeddb), across TWO separate Node
 * processes so the importing side genuinely starts with an empty store.
 *
 *   process 1 (author)   uploadDataUrlAsset -> compactStoryMedia
 *                        -> loadStoryAssetsForExport -> writes .reel.json
 *   process 2 (recipient) JSON.parse -> importStoryAssets -> compactStoryMedia
 *                        -> resolveStoryMedia, deep-compared to ground truth
 *
 * Bundled with the esbuild that ships with Vite, same as scripts/engine-tests.mjs.
 * Needs `fake-indexeddb` (an IndexedDB implementation for Node) — it is NOT in
 * package.json, so this check is opt-in:
 *
 *   npm i --no-save fake-indexeddb && node scripts/ie-roundtrip/run.mjs
 */
import { spawnSync } from "node:child_process";
import { buildSync } from "esbuild";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const require = createRequire(path.join(root, "package.json"));

// fake-indexeddb is a devDependency, so `npm ci` provides it. If it is somehow
// missing, skip loudly rather than fail — a red `npm test` over a missing dev
// package is the wrong signal.
let fakeIdbUrl;
try {
  fakeIdbUrl = pathToFileURL(require.resolve("fake-indexeddb/auto")).href;
} catch {
  console.log("SKIP import/export round trip — fake-indexeddb not installed.");
  console.log("     run `npm ci` (or `npm i -D fake-indexeddb`) to enable it.");
  process.exit(0);
}

const dir = mkdtempSync(path.join(tmpdir(), "scarlet-ie-roundtrip-"));

let failed = false;
try {
  const payload = path.join(dir, "roundtrip.reel.json");
  const truth = path.join(dir, "ground-truth.json");

  for (const side of ["export", "import"]) {
    const entry = path.join(here, `${side}-side.ts`);
    const outfile = path.join(dir, `${side}.mjs`);
    buildSync({
      entryPoints: [entry],
      bundle: true,
      platform: "node",
      format: "esm",
      target: "node18",
      outfile,
      logLevel: "warning",
      absWorkingDir: root,
    });

    // fake-indexeddb must be installed as a global BEFORE mediaLibrary's
    // openDb() runs, so it goes in a loader that imports the bundle after.
    // The loader lives in tmp, so resolve the package from the repo root
    // (node_modules lookup does not walk up from /tmp).
    const loader = path.join(dir, `${side}.loader.mjs`);
    writeFileSync(loader, `await import(${JSON.stringify(fakeIdbUrl)});\nawait import(${JSON.stringify(outfile)});\n`);

    const args = [payload, truth]; // both sides take <payload> <ground-truth>
    const res = spawnSync(process.execPath, [loader, ...args], { encoding: "utf8", cwd: root });
    const out = (res.stdout ?? "").trim();
    const err = (res.stderr ?? "").trim();

    console.log(`\n=== ${side} side (pid ${res.pid}, exit ${res.status}) ===`);
    if (err) console.log(err.split("\n").filter((l) => !l.startsWith("    at ")).join("\n"));

    let parsed = null;
    try {
      parsed = JSON.parse(out.split("\n").filter(Boolean).pop() ?? "null");
    } catch {
      console.log(out);
    }
    if (!parsed) {
      console.log("NO RESULT — side crashed");
      failed = true;
      continue;
    }
    for (const [k, v] of Object.entries(parsed)) {
      if (k === "ok" || k === "failures") continue;
      console.log(`  ${k}: ${JSON.stringify(v)}`);
    }
    if (!parsed.ok) {
      failed = true;
      console.log("  FAILURES:");
      for (const f of parsed.failures) console.log(`   ✗ ${f}`);
    } else {
      console.log("  ✔ all checks passed");
    }
  }
} catch (err) {
  console.error("round-trip check failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (failed) process.exitCode = 1;
console.log(failed ? "\n✗ import/export round trip FAILED" : "\n✔ import/export round trip passed end to end");
