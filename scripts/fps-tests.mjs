import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const dir = mkdtempSync(join(tmpdir(), "scarlet-fps-"));
try {
  const outfile = join(dir, "tests.mjs");
  buildSync({
    entryPoints: ["scripts/fps-tests.entry.ts"],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    define: { "import.meta.env": '{"BASE_URL":"/"}' },
    logLevel: "warning",
  });
  await import(pathToFileURL(outfile).href);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
