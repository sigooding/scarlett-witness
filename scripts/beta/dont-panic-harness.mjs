#!/usr/bin/env node
/**
 * Beta-test harness — DON'T PANIC! (the Hitchhiker's-parody adventure).
 *
 * Same esbuild trick as scripts/engine-tests.mjs: bundles the TypeScript
 * probe (dont-panic-probe.ts — imports the real engine from src/ and the
 * real <GamePlayer> mounted in happy-dom) and runs it under plain Node.
 *
 * The probe covers:
 *   1. Authorship validation: DONT_PANIC must validate with zero errors
 *      AND zero warnings.
 *   2. A real DOM play-through of the full gold path: title → bedroom
 *      (conversation, multi-state drawer, item pickups) → street (entry
 *      cutscene, USE-verb delay, exit hub) → pub (gated exit, topic hub,
 *      press-the-lie, exclusive replies) → vogon hold (classic hotspots)
 *      → poetry (quick-time event) → Heart of Gold (topics, kick verb,
 *      tap-to-combine, USE-item puzzle, travel map) → Magrathea finale.
 *   3. Branch endings (silver / earth / poetry / panic) via scene mounts.
 *   4. Map travel round-trip (finale → Heart → Magrathea).
 *
 * Run: node scripts/beta/dont-panic-harness.mjs
 */

import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "dont-panic-probe.ts");
// The bundle lives INSIDE the repo (like dom-smoke's) so the external
// happy-dom import resolves from the project's node_modules.
const root = path.resolve(here, "..", "..");
const dir = path.join(root, "scripts", ".tmp-dont-panic-beta");
const outfile = path.join(dir, "dont-panic.bundle.mjs");

try {
  mkdirSync(dir, { recursive: true });
  const { build } = await import("esbuild");
  await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    outfile,
    logLevel: "warning",
    absWorkingDir: root,
    // Same shape as scripts/dom-smoke.mjs: TSX needs the automatic JSX
    // runtime, asset imports are stubbed, happy-dom stays external (it
    // pulls in `ws`, which cannot be bundled for ESM), and the vite
    // virtual modules (pulled in once the probe mounts the Studio) are
    // stubbed empty.
    jsx: "automatic",
    loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty", ".mp3": "empty", ".png": "dataurl", ".jpg": "dataurl" },
    define: { __SCARLET_REEL_BUILD_ID__: JSON.stringify("dont-panic-beta") },
    external: ["happy-dom"],
    plugins: [
      {
        name: "virtuals",
        setup(b) {
          b.onResolve({ filter: /^virtual:builtin-(images|audio)$/ }, (a) => ({ path: a.path, namespace: "v" }));
          b.onLoad({ filter: /.*/, namespace: "v" }, () => ({ contents: "export default [];" }));
        },
      },
    ],
  });

  // Run as a child process with a hard timeout: happy-dom's rAF loop can
  // keep the event loop alive after the probe finishes, so the parent
  // enforces the exit (exactly like scripts/dom-smoke.mjs). The gold-path
  // play-through walks seven scenes in real time, so the budget is generous.
  const { spawnSync } = await import("node:child_process");
  const res = spawnSync(process.execPath, [outfile], {
    stdio: "inherit",
    cwd: root,
    timeout: 420000,
    // happy-dom + a seven-scene play-through is hungry (same precedent as
    // the gg-probe harness).
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=3072" },
  });
  process.exitCode = res.status ?? 1;
} catch (err) {
  console.error("dont-panic beta harness failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
