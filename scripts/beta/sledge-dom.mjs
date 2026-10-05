#!/usr/bin/env node
/**
 * DOM harness - SLEDGE HAMMER! mounted in happy-dom.
 *
 * sledge-probe.ts covers the story LOGIC; this covers what only a real mount
 * can prove: that the three stage rooms render their markers and walker, that
 * the talking portraits and the animated foreground extra mount without
 * tripping SheetSprite, that every ending renders, and that the case produces
 * no console.error / warning / error-boundary trip anywhere.
 *
 * The mounted program lives in sledge-dom-entry.jsx as a REAL FILE rather than
 * a template string. dom-smoke.mjs embeds its entry as an interpolated
 * template literal, which means every backtick and ${} in the test body has to
 * be escaped by hand - and a mistake there is a syntax error in generated code
 * that no linter or editor ever sees. A plain file is type-checkable,
 * greppable and diffable. (See also the beta writeup 3.1: the same
 * generated-source pattern is what hid the studio harness's exit-code bug.)
 *
 *   npm run test:sledge-dom
 */
import { build } from "esbuild";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");

const dir = path.join(root, "scripts", ".tmp-sledge-dom");
mkdirSync(dir, { recursive: true });
const entry = path.join(dir, "entry.jsx");
copyFileSync(path.join(here, "sledge-dom-entry.jsx"), entry);

const out = path.join(dir, "bundle.mjs");
await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out,
  jsx: "automatic",
  loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty", ".mp3": "empty", ".png": "dataurl", ".jpg": "dataurl" },
  absWorkingDir: root,
  alias: { "@": path.join(root, "src") },
  plugins: [
    {
      name: "virtuals",
      setup(b) {
        b.onResolve({ filter: /^virtual:builtin-(images|audio)$/ }, (a) => ({ path: a.path, namespace: "v" }));
        b.onLoad({ filter: /.*/, namespace: "v" }, () => ({ contents: "export default [];" }));
      },
    },
  ],
  define: { __SCARLET_REEL_BUILD_ID__: JSON.stringify("sledge-dom") },
  external: ["happy-dom"],
});

const { spawnSync } = await import("node:child_process");
const res = spawnSync(process.execPath, [out], { stdio: "inherit", cwd: root, timeout: 240000 });
rmSync(dir, { recursive: true, force: true });
process.exit(res.status ?? 1);
