#!/usr/bin/env node
/**
 * STUDIO EDITING PERF PROBE — what one keystroke in the Studio actually costs.
 *
 * Every edit in the Studio runs the same few steps against the WHOLE story:
 * a deep clone to produce the next state, a structural fingerprint (twice) so
 * undo can coalesce typing, the validator over every scene/beat, an autosave
 * that compacts media and serialises the story, and a re-render of the whole
 * inspector. This measures each of those on the real Nobody's Witness film
 * (201 scenes, ~1,350 media refs) so "the Studio feels slow" has numbers
 * behind it — and so a fix can be proven.
 *
 * Part two mounts the REAL <Studio/> in happy-dom and measures the editing
 * loop end to end: mount, a burst of keystrokes in a text field, the autosave
 * settling behind them, and opening an image picker on a film scene (the 921
 * built-in rows, windowed to a screenful). It also counts whole-library reads
 * — one cursor per `loadAllAssets`, every row carrying its base64 data URL —
 * and says who asked for them, so a read can be blamed on the right code.
 *
 * happy-dom is several times slower at DOM work than a real browser, so the
 * absolute milliseconds are pessimistic; the ratios between two versions of
 * the same code are the point.
 *
 * Run: node scripts/studio-perf.mjs
 * (npm run perf:studio)
 */
import { build } from "esbuild";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scanBuiltinImages } from "../tools/builtin-images.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const dir = path.join(root, "scripts", ".tmp-studio-perf");
mkdirSync(dir, { recursive: true });
const entry = path.join(dir, "entry.mjs");
const probeOut = path.join(dir, "probe.mjs");

process.on("exit", () => {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {}
});

writeFileSync(
  entry,
  `
await import("fake-indexeddb/auto");
import { readFileSync } from "node:fs";
import path from "node:path";
// The Studio's draft store is localStorage; give it one so the autosave path
// measures real serialisation instead of throwing.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: (k) => { store.delete(k); },
  clear: () => store.clear(),
  key: (i) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};
const probe = await import(${JSON.stringify(pathToFileURL(probeOut).href)});
await probe.run({ root: ${JSON.stringify(root)}, readFileSync, path });
`,
);

writeFileSync(
  path.join(dir, "probe.ts"),
  `
import { NOBODYS_WITNESS_FILM as FILM } from "STUDIO_PATH_PLACEHOLDER";
`,
);

await build({
  stdin: {
    contents: `
import { NOBODYS_WITNESS_FILM as FILM } from "${path.join(root, "src/data/nobodysWitnessFilm")}";
import { deepClone, validateStory } from "${path.join(root, "src/logic")}";
import { storyStructure } from "${path.join(root, "src/studio/storyEdits")}";
import { compactStoryMedia, loadAssets } from "${path.join(root, "src/data/mediaLibrary")}";
import { scanBuiltinImages } from "${path.join(root, "tools/builtin-images.mjs")}";
import type { Story } from "${path.join(root, "src/types")}";

const round = (n: number) => Math.round(n * 100) / 100;
function time(label: string, fn: () => unknown, iterations = 10) {
  fn(); // warm up
  const t0 = performance.now();
  for (let i = 0; i < iterations; i += 1) fn();
  const ms = (performance.now() - t0) / iterations;
  console.log(\`  \${label.padEnd(46)} \${round(ms).toString().padStart(8)} ms\`);
  return ms;
}

export async function run({ root }: { root: string }) {
  const story = FILM as unknown as Story;
  const json = JSON.stringify(story);
  console.log("Nobody's Witness, the flagship case");
  console.log(\`  \${"story size".padEnd(46)} \${(json.length / 1024 / 1024).toFixed(2).padStart(8)} MB (\${story.scenes.length} scenes)\`);

  console.log("\\nONE KEYSTROKE IN A TEXT FIELD (what Studio.tsx does per edit)");
  const clone = time("deepClone(story)  — mutate() makes the next state", () => deepClone(story), 20);
  const structure = time("storyStructure(story) ×2 — undo coalescing", () => storyStructure(story), 20) * 2;
  const validate = time("validateStory(story) — the memo that follows the story", () => validateStory(story), 10);
  const stringify = time("JSON.stringify(story) — the draft is written whole", () => JSON.stringify(story), 10);
  // The autosave only runs this when the draft actually carries inline media
  // (an upload that has not been filed yet); a clean draft is written as-is.
  const compact = time("compactStoryMedia(story) — only if the draft embeds media", () => compactStoryMedia(story), 5);
  const scan = time("the check that decides it — does the draft embed media", () => json.includes("data:"), 200);

  console.log("\\nTHE IMAGE PICKER'S LIST (921 built-in images + uploads)");
  const builtins = scanBuiltinImages();
  const items = builtins.map((b) => ({ value: b.url, label: b.label, hay: (b.label + " " + b.url).toLowerCase() }));
  time("build the list", () => items.map((i) => ({ ...i })), 20);
  time("filter it (one keystroke in the filter box)", () => {
    const q = "the";
    return items.filter((i) => i.hay.includes(q));
  }, 20);

  console.log("\\nTOTALS");
  const perKeystroke = clone + structure + validate;
  console.log(\`  \${"main thread work per keystroke".padEnd(46)} \${round(perKeystroke).toString().padStart(8)} ms  (clone + structure + validate)\`);
  const perSave = stringify + scan;
  console.log(\`  \${"autosave, debounced 800 ms after typing stops".padEnd(46)} \${round(perSave).toString().padStart(8)} ms  (stringify only — nothing embedded)\`);
  console.log(\`  \${"…a draft that embeds an upload, same save".padEnd(46)} \${round(perSave + compact).toString().padStart(8)} ms  (compact + stringify)\`);

  const misses = await loadAssets(story.id);
  console.log(\`  library rows for this story: \${misses.length}\`);
}
`,
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: probeOut,
  absWorkingDir: root,
  loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty" },
  external: ["fake-indexeddb", "fake-indexeddb/auto"],
  logLevel: "warning",
});

await import(pathToFileURL(entry).href);

/* ------------------------------------------------------------------ */
/*  Part two: the real Studio in happy-dom                             */
/* ------------------------------------------------------------------ */

const domEntry = path.join(dir, "dom-entry.mjs");
const domProbe = path.join(dir, "dom-probe.mjs");
// The real image library, so the picker measured here is the one authors see.
const scanForDom = scanBuiltinImages();

await build({
  stdin: {
    contents: `
import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import { Studio } from "${path.join(root, "src/studio/Studio")}";
import { ErrorBoundary } from "${path.join(root, "src/ErrorBoundary")}";
import { NOBODYS_WITNESS_FILM } from "${path.join(root, "src/data/nobodysWitnessFilm")}";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const round = (n: number) => Math.round(n * 100) / 100;

/** Count every read of the media library: one cursor over a store per call,
 *  each row carrying its base64 data URL. */
let scans = 0;
let phase = "mount";
const stacks = new Map<string, number>();
let capture = false;
const patch = () => {
  const proto = (globalThis as any).IDBObjectStore?.prototype;
  if (!proto || proto.__perfPatched) return false;
  const orig = proto.openCursor;
  proto.openCursor = function (...args: unknown[]) {
    scans += 1;
    if (capture) {
      const frames = String(new Error().stack ?? "").split("\\n").map((f) => f.trim()).filter((f) => f.startsWith("at "));
      const caller = frames.find((f) => /loadAllAssets|loadAssets|readAssetRows/.test(f)) ?? frames[1] ?? "?";
      const line = phase + " — " + caller.slice(0, 200);
      stacks.set(line, (stacks.get(line) ?? 0) + 1);
    }
    return orig.apply(this, args);
  };
  proto.__perfPatched = true;
  return true;
};

export async function runDom({ win, doc, container }: any) {
  const patched = patch();
  console.log("\\nTHE REAL STUDIO IN HAPPY-DOM (JS work only — no paint)");
  console.log(\`  library reads instrumented: \${patched}\`);
  win.localStorage.setItem("scarlet-studio-last-story", "nobodys_witness_film");

  const t0 = performance.now();
  const root = createRoot(container);
  root.render(
    createElement(
      StrictMode,
      null,
      createElement(
        ErrorBoundary,
        null,
        createElement(Studio, {
          baseStories: [NOBODYS_WITNESS_FILM],
          initialStoryId: NOBODYS_WITNESS_FILM.id,
          get onPublish() { return () => true; },
          onPlay: () => {},
          onExit: () => {},
          onDeleteStory: () => true,
          onCreateStory: () => true,
          onUpdateTitleTheme: () => {},
        }),
      ),
    ),
  );
  for (let i = 0; i < 100 && !doc.querySelector("input, button"); i += 1) await sleep(50);
  await sleep(1500);
  const mountMs = performance.now() - t0;
  console.log(\`  \${"mount (draft load, first render)".padEnd(46)} \${round(mountMs).toString().padStart(8)} ms\`);
  console.log(\`  \${"DOM nodes".padEnd(46)} \${String(doc.querySelectorAll("*").length).padStart(8)}\`);
  const mountScans = scans;
  console.log(\`  \${"whole-library reads during mount".padEnd(46)} \${String(mountScans).padStart(8)}\`);

  // Something mounts late and reads the library once; that is not typing and
  // must not be blamed on the keystrokes below, so let it happen first.
  capture = true;
  phase = "nobody typing";
  await sleep(3000);
  const idleScans = scans;
  console.log(\`  \${"whole-library reads while nobody types".padEnd(46)} \${String(idleScans - mountScans).padStart(8)}\`);

  // A burst of typing into a real text field (the story title).
  const title = [...doc.querySelectorAll("input")].find((el: any) => el.getAttribute("aria-label") === "Story title")
    ?? [...doc.querySelectorAll("input")][0];
  if (title) {
    const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")!.set;
    const before = scans;
    phase = "keystroke";
    const t1 = performance.now();
    const N = 10;
    for (let i = 0; i < N; i += 1) {
      setter.call(title, "Nobody's Witness " + "x".repeat(i + 1));
      title.dispatchEvent(new win.Event("input", { bubbles: true }));
      await sleep(20);
    }
    const per = (performance.now() - t1) / N;
    console.log(\`  \${"one keystroke, end to end (React included)".padEnd(46)} \${round(per).toString().padStart(8)} ms\`);
    console.log(\`  \${"whole-library reads for those keystrokes".padEnd(46)} \${String(scans - before).padStart(8)}\`);
    const fromTyping = [...stacks.entries()].filter(([line]) => line.startsWith("keystroke"));
    for (const [line, n] of fromTyping.sort((a, b) => b[1] - a[1]).slice(0, 4)) console.log(\`    \${n} × \${line}\`);
    // And what the saves did behind the typing: the draft autosave debounces by
    // 800 ms, so wait it out and report reads + the cost of the idle work.
    phase = "autosave after typing";
    const afterBurst = scans;
    const t4 = performance.now();
    await sleep(1600);
    console.log(\`  \${"autosave settling after the burst".padEnd(46)} \${round(performance.now() - t4).toString().padStart(8)} ms\`);
    console.log(\`  \${"…whole-library reads it needed".padEnd(46)} \${String(scans - afterBurst).padStart(8)}\`);
    capture = false;
  }

  // Open an image picker on the film's own field: the biggest list on offer.
  const sceneTab = doc.querySelector("#studio-tab-scene");
  sceneTab?.click();
  await sleep(600);
  const look = [...doc.querySelectorAll("button")].find((b: any) => /Look, atmosphere & camera/.test(b.textContent ?? ""));
  look?.click();
  await sleep(600);
  const picker = doc.querySelector("button[title*='click to browse every image']");
  if (picker) {
    // Wait for the rows, not for a guessed number of milliseconds: the number
    // this reports is the time until the list is on screen.
    const t2 = performance.now();
    picker.click();
    // The list is built in two passes (rows first, then the count settles as
    // the library hook reports), so wait for the window notice as well.
    for (let i = 0; i < 400 && !/Showing \\d+ of \\d+/.test(doc.body.textContent ?? ""); i += 1) await sleep(5);
    const openMs = performance.now() - t2;
    const imgs = doc.querySelectorAll("img").length;
    const rows = doc.querySelectorAll("button span.truncate").length;
    const held = /Showing \\d+ of (\\d+)/.exec(doc.body.textContent ?? "");
    console.log(\`  \${"open the image picker".padEnd(46)} \${round(openMs).toString().padStart(8)} ms\`);
    console.log(\`  \${"rows rendered / <img> tags in that list".padEnd(46)} \${(rows + " / " + imgs).padStart(8)}\`);
    console.log(\`  \${"…of how many the list offers".padEnd(46)} \${String(held ? held[1] : "all of them").padStart(8)}\`);
    const filter = [...doc.querySelectorAll("input")].find((el: any) => /^Filter \d+ images/.test(el.placeholder ?? ""));
    if (filter) {
      const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")!.set;
      const t3 = performance.now();
      const F = 6;
      for (let i = 0; i < F; i += 1) {
        setter.call(filter, "th" + "e".repeat(i));
        filter.dispatchEvent(new win.Event("input", { bubbles: true }));
        await sleep(30);
      }
      console.log(\`  \${"one keystroke in the picker's filter box".padEnd(46)} \${round((performance.now() - t3) / F).toString().padStart(8)} ms\`);
    }
  } else {
    console.log("  (could not find an image picker to open)");
  }
  console.log(\`  \${"whole-library reads, total".padEnd(46)} \${String(scans).padStart(8)}\`);
}
`,
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: domProbe,
  absWorkingDir: root,
  jsx: "automatic",
  loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty" },
  external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "happy-dom", "fake-indexeddb", "fake-indexeddb/auto"],
  alias: { "@": path.join(root, "src") },
  define: { "process.env.NODE_ENV": '"development"', "import.meta.env": "{}", __SCARLET_REEL_BUILD_ID__: '"perf"' },
  // The flow canvas pulls a CJS shim that does require("react") at runtime.
  banner: { js: `\nimport { createRequire } from "node:module";\nconst require = createRequire(import.meta.url);\n` },
  plugins: [
    {
      name: "virtuals",
      setup(b) {
        b.onResolve({ filter: /^virtual:builtin-(images|audio)$/ }, (a) => ({ path: a.path, namespace: "v" }));
        b.onLoad({ filter: /.*/, namespace: "v" }, (a) =>
          a.path === "virtual:builtin-images"
            ? { contents: `export default ${JSON.stringify(scanForDom)};` }
            : { contents: "export default [];" },
        );
      },
    },
  ],
  logLevel: "warning",
});

writeFileSync(
  domEntry,
  `
await import("fake-indexeddb/auto");

import { Window } from "happy-dom";

const win = new Window({ url: "http://localhost:5173/" });
const doc = win.document;
doc.body.innerHTML = '<div id="root"></div>';

for (const key of [
  "document", "navigator", "location", "history", "customElements",
  "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLIFrameElement",
  "Element", "Node", "NodeList", "CharacterData", "DocumentFragment", "Document",
  "MutationObserver", "ResizeObserver", "IntersectionObserver", "getComputedStyle",
  "requestAnimationFrame", "cancelAnimationFrame", "localStorage", "sessionStorage",
  "CustomEvent", "Event", "KeyboardEvent", "MouseEvent", "PointerEvent", "FocusEvent",
  "matchMedia", "DOMRect", "SVGElement", "Image", "Audio", "CSS",
  "File", "FileReader", "Blob", "URL", "indexedDB", "IDBKeyRange", "IDBObjectStore", "IDBIndex", "IDBDatabase",
]) {
  if (win[key] === undefined) continue;
  try { globalThis[key] = win[key]; }
  catch { try { Object.defineProperty(globalThis, key, { value: win[key], configurable: true }); } catch {} }
}
globalThis.window = win;
globalThis.HTMLElement = win.HTMLElement;
win.matchMedia = win.matchMedia?.bind(win) ?? ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
globalThis.matchMedia = win.matchMedia;
win.alert = () => {};
globalThis.alert = win.alert;
win.confirm = () => false;
globalThis.confirm = win.confirm;

const probe = await import(${JSON.stringify(pathToFileURL(domProbe).href)});
await probe.runDom({ win, doc, container: doc.getElementById("root") });
`,
);

const { spawnSync } = await import("node:child_process");
const res = spawnSync(process.execPath, [domEntry], { stdio: "inherit", cwd: root, timeout: 600000 });
process.exit(res.status ?? 1);
