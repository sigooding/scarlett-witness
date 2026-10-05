#!/usr/bin/env node
/**
 * FLASH PROBE harness — bundles scripts/beta/flash-probe.ts with the exact
 * stage-harness build config and runs it. Diagnoses "NPCs keep flashing".
 * Run: node scripts/flash-probe.mjs
 */
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "beta", "flash-probe.ts");
const root = path.resolve(here, "..");
const dir = path.join(root, "scripts", ".tmp-flash-probe");
const outfile = path.join(dir, "flash.bundle.mjs");

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
    define: { __SCARLET_REEL_BUILD_ID__: JSON.stringify("flash-probe") },
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
  const res = spawnSync(process.execPath, [outfile], { stdio: "inherit", cwd: root, timeout: 120000 });
  process.exitCode = res.status ?? 1;
} catch (err) {
  console.error("flash probe harness failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
