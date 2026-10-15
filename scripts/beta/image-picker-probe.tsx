/**
 * IMAGE PICKER BETA PROBE — mounts the REAL <ImagePicker/> in happy-dom and
 * drives the two things every image box in the Studio promises:
 *
 *   A — the list: every built-in image, the film's own depth maps / plates /
 *       cut-outs behind “show every group”, the gradient presets, the uploads
 *       of every story, the filter, Enter-to-pick and the rollover preview;
 *   B — the upload button inside the box: ⇧ Upload → real (fake-)IndexedDB,
 *       the file is picked AND filed in the folder the field asked for, a
 *       dropped file does the same, a picker with no story id still files
 *       under the case Studio has open, and a non-image is refused politely.
 *
 * Nothing here trusts a claim from an earlier pass: every gate re-runs from
 * scratch against the rendered DOM and the library rows that really landed.
 */
import { createRoot, type Root } from "react-dom/client";
import { useState } from "react";
import { ImagePicker, setImagePickerStoryId } from "IMAGE_PICKER_PATH";
import { loadAllAssets, loadAssets, type MediaAsset } from "MEDIA_PATH";

interface Ctx {
  win: any;
  doc: any;
  container: any;
}

let win: any;
let root: Root | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) passed++;
  else failed++;
  const d = !ok && detail !== undefined ? "  -> " + String(JSON.stringify(detail) ?? detail).slice(0, 400) : "";
  console.log((ok ? "  ok  " : "  FAIL") + " " + name + d);
}

const problems: [string, string][] = [];
console.error = (...a: unknown[]) => problems.push(["console.error", a.map(String).join(" ").slice(0, 2000)]);
process.on("uncaughtException", (e) => problems.push(["uncaught", String((e as any)?.stack || e).slice(0, 800)]));
process.on("unhandledRejection", (e) => problems.push(["unhandled rejection", String((e as Error)?.stack || e).slice(0, 800)]));

const panelOf = (sel: string): any => win.document.querySelector(`${sel} .absolute.z-50`);
/** The trigger is the first button inside the box (the panel's rows come later). */
const triggerOf = (sel: string): any => win.document.querySelector(`${sel} button`);
const textOf = (el: any): string => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
const rowsOf = (panel: any): any[] => [...(panel?.querySelectorAll("button") ?? [])];
const rowNamed = (panel: any, name: string): any => rowsOf(panel).find((b) => textOf(b).includes(name));
const allText = () => (win.document.body.textContent ?? "").replace(/\s+/g, " ");

async function openPicker(sel: string) {
  triggerOf(sel)?.click();
  await sleep(40);
}

/** happy-dom needs the native setter for React-controlled inputs. */
function setInput(el: any, value: string) {
  const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")!.set;
  setter.call(el, value);
  el.dispatchEvent(new win.Event("input", { bubbles: true }));
}

const pngFile = (name: string) => new win.File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], name, { type: "image/png" });

async function feedFile(sel: string, file: any) {
  const panel = panelOf(sel);
  const input = panel?.querySelector('input[type="file"]');
  if (!input) return false;
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  input.dispatchEvent(new win.Event("change", { bubbles: true }));
  await sleep(80);
  return true;
}

async function dropFile(sel: string, file: any) {
  const wrapper = triggerOf(sel)?.parentElement;
  if (!wrapper) return false;
  const dt = { files: [file], types: ["Files"], items: [{ kind: "file", type: file.type }] };
  const over = new win.Event("dragover", { bubbles: true, cancelable: true });
  Object.defineProperty(over, "dataTransfer", { value: dt, configurable: true });
  wrapper.dispatchEvent(over);
  await sleep(30);
  const hot = wrapper.className.includes("outline");
  const drop = new win.Event("drop", { bubbles: true, cancelable: true });
  Object.defineProperty(drop, "dataTransfer", { value: dt, configurable: true });
  wrapper.dispatchEvent(drop);
  await sleep(120);
  return hot;
}

/** The four boxes the Studio shows: a scene background, a beat shot, a
 *  depth-map field (with the film's group listed and an upload folder), one
 *  with no story id, and one that must stay pick-only. */
let bgValue: string | undefined;
let depthValue: string | undefined;
let anonymousValue: string | undefined;

function App() {
  const [, force] = useState(0);
  const bump = () => force((n) => n + 1);
  return (
    <div>
      <div className="p-bg">
        <ImagePicker value={bgValue} storyId="case-a" placeholder="bg…" onChange={(v) => { bgValue = v; bump(); }} />
      </div>
      <div className="p-depth">
        <ImagePicker
          value={depthValue}
          groups={["film-depth"]}
          includeGradients={false}
          allowClear={false}
          uploadFolder="depth maps"
          placeholder="depth…"
          onChange={(v) => { depthValue = v; bump(); }}
        />
      </div>
      <div className="p-anon">
        <ImagePicker value={anonymousValue} includeGradients={false} placeholder="anon…" onChange={(v) => { anonymousValue = v; bump(); }} />
      </div>
      <div className="p-no-upload">
        <ImagePicker value={undefined} includeGradients={false} allowUpload={false} placeholder="pick only…" onChange={() => {}} />
      </div>
    </div>
  );
}

export async function run({ doc, container }: Ctx) {
  win = globalThis.window as any;

  // The stub virtual:builtin-images list the harness injects (2 ungrouped
  // plates + 2 of the film's own depth-layer files).
  const BUILTINS = 4;

  root = createRoot(container);
  root.render(<App />);
  await sleep(80);

  console.log("\n=== A · THE BOX LISTS EVERY AVAILABLE IMAGE ===");
  check("A1 four image boxes mount", ["p-bg", "p-depth", "p-anon", "p-no-upload"].every((c) => !!triggerOf(`.${c}`)));
  check("A2 trigger shows the placeholder until something is picked", textOf(triggerOf(".p-bg")).includes("bg…"));

  await openPicker(".p-bg");
  const bg = panelOf(".p-bg");
  check("A3 the panel opens", !!bg);
  check("A4 the list offers every built-in plate", !!rowNamed(bg, "Alley") && !!rowNamed(bg, "Leather Case"));
  check("A5 the gradient presets are listed too", !!rowNamed(bg, "Indigo → Magenta"));
  check("A6 the film's depth maps stay out of a background list", !rowNamed(bg, "The Hive Remembered"), allText().slice(0, 120));
  check("A7 …but the box says so, and offers them in one click", /Show every group too \(2 more/.test(allText()));
  const grouped = bg?.querySelector('input[type="checkbox"]');
  grouped?.click();
  await sleep(40);
  check("A8 ticking it lists the film's own depth files", !!rowNamed(panelOf(".p-bg"), "The Hive Remembered"));
  check("A9 …under their own heading", allText().includes("Film depth maps, plates & cut-outs"));
  const filter = panelOf(".p-bg").querySelector('input:not([type="file"]):not([type="checkbox"])');
  check("A10 the filter box counts what it can offer", /Filter \d+ images/.test(filter?.placeholder ?? ""), filter?.placeholder);
  if (!filter) { check("A10 the filter box is present", false); return; }
  setInput(filter, "case");
  await sleep(40);
  check("A11 filtering narrows the list to the match", !!rowNamed(panelOf(".p-bg"), "Leather Case") && !rowNamed(panelOf(".p-bg"), "Alley"));
  filter.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await sleep(60);
  check("A12 Enter picks the first match and closes the box", bgValue === "/assets/ui/case.png" && !panelOf(".p-bg"), bgValue);
  check("A13 the trigger then names what is picked", textOf(triggerOf(".p-bg")).includes("Leather Case"), textOf(triggerOf(".p-bg")));

  await openPicker(".p-bg");
  const hoverRow = rowNamed(panelOf(".p-bg"), "Alley");
  hoverRow?.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }));
  await sleep(40);
  const preview = [...doc.querySelectorAll("div")].find((d: any) => (d.getAttribute("style") ?? "").includes("position: fixed") && d.textContent.includes("Alley"));
  check("A14 hovering a row pops the big preview", !!preview);
  check("A15 every listed group carries a heading", allText().includes("Built-in art & sprites"));
  triggerOf(".p-bg")?.click();
  await sleep(30);

  console.log("\n=== B · THE UPLOAD BUTTON INSIDE THE BOX ===");
  await openPicker(".p-depth");
  const depthPanel = panelOf(".p-depth");
  check("B1 the depth box lists the film's own files by default", !!rowNamed(depthPanel, "The Hive Remembered"));
  check("B2 …and offers the upload button in the box itself", /⇧ Upload an image/.test(textOf(depthPanel)), textOf(depthPanel).slice(0, 120));
  const ok = await feedFile(".p-depth", pngFile("depth-test.png"));
  check("B3 the hidden file input takes a file", ok);
  const all: MediaAsset[] = await loadAllAssets("image");
  const uploaded = all.find((a) => a.name === "depth-test.png");
  check("B4 the upload really landed in the library", !!uploaded, all.map((a) => a.name));
  check("B5 the field is set to the new asset reference", !!uploaded && depthValue === `asset:${uploaded.id}`, { depthValue, id: uploaded?.id });
  check("B6 it was filed in the folder the field asked for", uploaded?.folder === "depth maps", uploaded?.folder);
  check("B7 the box keeps itself open and confirms what happened", /✓ depth-test\.png/.test(textOf(panelOf(".p-depth"))), textOf(panelOf(".p-depth")).slice(-160));
  check("B8 the new image is listed under “Your uploads”", !!rowNamed(panelOf(".p-depth"), "📁 depth maps / depth-test.png"));
  check("B9 the trigger shows the freshly uploaded file", textOf(triggerOf(".p-depth")).includes("depth-test.png"), textOf(triggerOf(".p-depth")));
  const imageRows = rowsOf(panelOf(".p-depth")).filter((b: any) => b.querySelector("img"));
  check("B9b the new image leads the list, not buried under the library", textOf(imageRows[0]).includes("depth-test.png"), textOf(imageRows[0]));
  const refused = await feedFile(".p-depth", new win.File(["not an image"], "notes.txt", { type: "text/plain" }));
  check("B10 a non-image is refused in the box, not silently kept", refused && /✕/.test(textOf(panelOf(".p-depth"))), textOf(panelOf(".p-depth")).slice(-120));
  check("B11 …and the field is untouched by the refusal", depthValue === `asset:${uploaded?.id}`, depthValue);

  const hot = await dropFile(".p-bg", pngFile("drop-test.png"));
  check("B12 dragging a file over the box highlights it", hot);
  const dropped = (await loadAllAssets("image")).find((a) => a.name === "drop-test.png");
  check("B13 dropping a file uploads and picks it", !!dropped && bgValue === `asset:${dropped.id}`, { bgValue, dropped: dropped?.id });
  check("B14 a picker with no upload folder leaves it unfiled", !dropped?.folder, dropped?.folder);

  setImagePickerStoryId("case-z");
  await openPicker(".p-anon");
  await feedFile(".p-anon", pngFile("anon-test.png"));
  const filed = await loadAssets("case-z");
  check("B15 a picker with no story id files under the case Studio has open", !!filed.find((a) => a.name === "anon-test.png"), filed.map((a) => a.name));
  check("B16 …and still picks it", (anonymousValue ?? "").startsWith("asset:"), anonymousValue);

  await openPicker(".p-no-upload");
  check("B17 a pick-only box shows no upload row", !/⇧ Upload an image/.test(textOf(panelOf(".p-no-upload"))) && !panelOf(".p-no-upload").querySelector('input[type="file"]'));

  await sleep(60);
  if (problems.length) {
    console.log("\nconsole errors / throws during the probe:");
    for (const [kind, msg] of problems.slice(0, 6)) console.log(`  ${kind}: ${msg.slice(0, 400)}`);
  }
  check("B18 no console errors, uncaught throws or rejected promises", problems.length === 0, problems.length);

  const crashed = /the reel snapped|something broke/i.test(doc.body.innerHTML);
  check("B19 no error boundary trip", !crashed);

  console.log(`\nimage picker: ${passed} passed, ${failed} failed`);
  if (failed) {
    console.log(`(stub built-in list held ${BUILTINS} files; the harness lists what the real /img scan would)`);
    throw new Error(`${failed} image-picker check(s) failed`);
  }
}
