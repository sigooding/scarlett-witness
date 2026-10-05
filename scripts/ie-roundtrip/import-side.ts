/**
 * IMPORT/EXPORT ROUND TRIP — RECIPIENT'S MACHINE (process 2 of 2).
 *
 * A FRESH Node process, so IndexedDB starts empty: nothing is inherited from
 * the author's session. Runs the REAL import path exactly as App.tsx's file
 * handler does:
 *
 *   JSON.parse -> importStoryAssets(id, assets) -> compactStoryMedia(story)
 *
 * then resolves the result with the REAL `resolveStoryMedia()` and deep-compares
 * every media field against the ground truth written by the export side (the
 * pre-compact story, i.e. the original uploaded bytes). The expectation is
 * therefore independent of the code under test — it is not a re-read.
 */
import { readFileSync } from "node:fs";
import { compactStoryMedia, importStoryAssets, loadAssets, resolveStoryMedia } from "../../src/data/mediaLibrary";
import type { Story } from "../../src/types";

const payloadPath = process.argv[2];
const truthPath = process.argv[3];
if (!payloadPath || !truthPath) throw new Error("usage: import-side <payload> <ground-truth>");

const failures: string[] = [];
function check(name: string, ok: boolean, extra?: unknown) {
  if (!ok) failures.push(`${name}${extra !== undefined ? ` — got ${JSON.stringify(extra)}` : ""}`);
}

/* ------------------------------------------------------------------ */
/*  0. Fresh machine: the media store really is empty to begin with    */
/* ------------------------------------------------------------------ */

const text = readFileSync(payloadPath, "utf8");
const importedBundle: Story = JSON.parse(text);

check("import: store is empty before import (fresh machine)", (await loadAssets(importedBundle.id)).length === 0);

/* ------------------------------------------------------------------ */
/*  1. The guard App.tsx applies before touching storage               */
/*    (verbatim: `if (!importedBundle.id || !importedBundle.scenes?.length)`) */
/* ------------------------------------------------------------------ */

// App.tsx wraps the whole handler in try/catch (its catch reports "Invalid
// case file or broken bundle."), so a throw here is also a rejection — e.g.
// `null` dereferences before the `!b.id` test can run.
const guardRejects = (v: unknown) => {
  try {
    const b = v as { id?: unknown; scenes?: unknown[] };
    return !b.id || !b.scenes?.length;
  } catch {
    return true;
  }
};
for (const [name, bad] of [
  ["null", null],
  ["empty object", {}],
  ["array", []],
  ["no id", { title: "X", scenes: [{}] }],
  ["no scenes", { id: "x" }],
  ["empty scenes", { id: "x", scenes: [] }],
] as Array<[string, unknown]>) {
  check(`guard: rejects ${name}`, guardRejects(bad), bad);
}
check("guard: accepts a real payload", !guardRejects(importedBundle));
check("import: bundle carries media assets", (importedBundle.assets?.length ?? 0) > 0, importedBundle.assets?.length);

/* ------------------------------------------------------------------ */
/*  2. Real import: write bundled assets, then compact the story       */
/* ------------------------------------------------------------------ */

await importStoryAssets(importedBundle.id, importedBundle.assets ?? []);

const { assets, ...cleanedStory } = importedBundle;
const compacted = await compactStoryMedia(cleanedStory);

const restoredRows = await loadAssets(importedBundle.id);
check(
  "import: every bundled asset is now in the recipient's store",
  restoredRows.length === (assets?.length ?? 0),
  restoredRows.length
);
check(
  "import: restored rows carry their payloads",
  restoredRows.every((a) => a.dataUrl?.startsWith("data:")),
  restoredRows.filter((a) => !a.dataUrl?.startsWith("data:")).map((a) => a.id)
);
check(
  "import: no fileUrl (author's desktop path) leaks across machines",
  restoredRows.every((a) => a.fileUrl === undefined),
  restoredRows.filter((a) => a.fileUrl !== undefined).map((a) => a.id)
);
check(
  "import: compacted story carries no raw base64 (localStorage-safe)",
  !/;base64,/.test(JSON.stringify(compacted))
);

/* ------------------------------------------------------------------ */
/*  3. Play time: every seeded field must resolve to its OWN bytes     */
/*                                                                     */
/*  Per-field byte integrity, not a whole-object diff: for each field   */
/*  the export side seeded, its `asset:<id>` reference must be GONE and */
/*  the exact bytes originally uploaded must be there in its place, the */
/*  same number of times. This names the offending field on failure.   */
/* ------------------------------------------------------------------ */

const manifest: Array<{ label: string; dataUrl: string; ref: string }> = JSON.parse(
  readFileSync(truthPath, "utf8")
);
const beforeJson = JSON.stringify(compacted);
const resolved = await resolveStoryMedia(compacted);
const afterJson = JSON.stringify(resolved);

const count = (hay: string, needle: string) => hay.split(needle).length - 1;

let unresolvedFields: string[] = [];
let wrongBytesFields: string[] = [];
for (const m of manifest) {
  const refsBefore = count(beforeJson, m.ref);
  if (refsBefore === 0) {
    failures.push(`resolve: field "${m.label}" lost its reference before play time`);
    continue;
  }
  const refsAfter = count(afterJson, m.ref);
  const bytesAfter = count(afterJson, m.dataUrl);
  if (refsAfter > 0) unresolvedFields.push(m.label);
  if (bytesAfter !== refsBefore) wrongBytesFields.push(`${m.label} (${bytesAfter}/${refsBefore})`);
}

check("resolve: every seeded field resolved (no asset: ref left behind)", unresolvedFields.length === 0, unresolvedFields);
check(
  "resolve: every field carries exactly the bytes that were uploaded",
  wrongBytesFields.length === 0,
  wrongBytesFields
);
check(
  "resolve: no unresolved asset: references remain anywhere",
  !/"asset:/.test(afterJson),
  (afterJson.match(/asset:[^"]{0,24}/g) ?? []).slice(0, 5)
);
check(
  "resolve: paths and gradients are passed through untouched",
  count(afterJson, "gradient:") + count(afterJson, "/img/") >= count(beforeJson, "gradient:") + count(beforeJson, "/img/")
);
check("resolve: input story not mutated by the resolver", JSON.stringify(compacted) === beforeJson);

/* ------------------------------------------------------------------ */
/*  4. Re-importing the same file is idempotent (no duplicate rows)    */
/* ------------------------------------------------------------------ */

await importStoryAssets(importedBundle.id, importedBundle.assets ?? []);
const afterSecond = await loadAssets(importedBundle.id);
check("re-import: idempotent, no duplicate rows", afterSecond.length === (assets?.length ?? 0), afterSecond.length);

console.log(
  JSON.stringify({
    ok: failures.length === 0,
    failures,
    restoredRows: restoredRows.length,
    bundledAssets: assets?.length ?? 0,
    scenes: compacted.scenes.length,
    // What localStorage would have to hold for this case.
    localStorageBytes: Buffer.byteLength(JSON.stringify(compacted)),
  })
);
process.exitCode = failures.length ? 1 : 0;
