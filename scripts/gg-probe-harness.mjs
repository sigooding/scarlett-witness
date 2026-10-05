#!/usr/bin/env node
/** Bundles scripts/gg-probe.ts (same esbuild trick as the stage beta) and
    runs it under Node with happy-dom external. One-shot QA for GUARDS! GUARDS! */

import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entryName = process.argv[2] || "gg-probe.ts";
const entry = path.join(here, entryName);
const root = path.resolve(here, "..");
const dir = path.join(root, "scripts", ".tmp-gg-probe");
const outfile = path.join(dir, "gg-probe.bundle.mjs");

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
    jsx: "automatic",
    loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty", ".mp3": "empty", ".png": "dataurl", ".jpg": "dataurl" },
    define: { __SCARLET_REEL_BUILD_ID__: JSON.stringify("gg-probe") },
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

  const { spawnSync } = await import("node:child_process");
  const res = spawnSync(process.execPath, [outfile], {
    stdio: "inherit",
    cwd: root,
    timeout: 300000,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
  });
  process.exitCode = res.status ?? 1;
} catch (err) {
  console.error("gg probe harness failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
