#!/usr/bin/env node
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "validator-audit.entry.ts");
const dir = mkdtempSync(path.join(tmpdir(), "val-audit-"));
const outfile = path.join(dir, "o.mjs");
try {
  buildSync({ entryPoints: [entry], bundle: true, platform: "node", format: "esm", target: "node18", outfile, logLevel: "warning", absWorkingDir: path.join(here, "..") });
  await import(pathToFileURL(outfile).href);
} catch (e) { console.error(e); process.exitCode = 1; }
finally { rmSync(dir, { recursive: true, force: true }); }
