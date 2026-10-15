/**
 * IMAGE PICKER BETA PROBE — mounts the REAL <ImagePicker/> in happy-dom and
 * drives the two things every image box in the Studio promises:
 *
 *   A — the list: every built-in image the scan finds (the film's 800+
 *       pictures under public/film/img, its depth layers under
 *       public/film/depth, /img and /assets where they exist), the group
 *       headings, the “show every group too” switch, the presets, the filter,
 *       Enter-to-pick and the rollover preview;
 *   B — the upload button inside the box: ⇧ Upload → real (fake-)IndexedDB,
 *       the file is picked AND filed in the folder the field asked for, a
 *       dropped file does the same, a picker with no story id still files
 *       under the case Studio has open, and a non-image is refused politely.
 *
 * The list under test is the repo's own: the harness bakes
 * tools/builtin-images.mjs's scan into the bundle and passes the counts and a
 * few real file names in as defines (__FILM_PICTURE_COUNT__ etc.), so every
 * count below is a statement about what is on disk, not about a stub.
 */
import { createRoot, type Root } from "react-dom/client";
import { useState } from "react";
import { ImagePicker, setImagePickerStoryId } from "IMAGE_PICKER_PATH";
import { loadAllAssets, loadAssets, type MediaAsset } from "MEDIA_PATH";

declare const __FILM_PICTURE_COUNT__: number;
declare const __FILM_LAYER_COUNT__: number;
declare const __HIVE_PICTURE__: string;
declare const __HIVE_DEPTH__: string;
declare const __HIVE_PICTURE_LABEL__: string;
declare const __LAST_FILM_PICTURE__: string;
declare const __LAST_FILM_PICTURE_LABEL__: string;
declare const __HIVE_DEPTH_LABEL__: string;

interface Ctx {
  win: any;
  doc: any;
  container: any;
}

let win: any;
let root: Root | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Wait for a condition instead of guessing at a sleep: React updates, the
 *  panel opening and the (fake-)IndexedDB writes are all asynchronous, and a
 *  fixed delay is only ever a race waiting to be lost under load. */
async function waitFor(pred: () => boolean | Promise<boolean>, ms = 4000, step = 20): Promise<boolean> {
  for (let waited = 0; waited <= ms; waited += step) {
    if (await pred()) return true;
    await sleep(step);
  }
  return pred();
}
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
const triggerOf = (sel: string): any => win.document.querySelector(`${sel} button`);
const textOf = (el: any): string => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
const rowsOf = (panel: any): any[] => [...(panel?.querySelectorAll("button") ?? [])];
const rowNamed = (panel: any, name: string): any => rowsOf(panel).find((b) => textOf(b).includes(name));
const allText = () => (win.document.body.textContent ?? "").replace(/\s+/g, " ");

async function openPicker(sel: string) {
  triggerOf(sel)?.click();
  await waitFor(() => !!panelOf(sel));
}

/** Close an open panel (clicking its trigger again). */
async function closePicker(sel: string) {
  triggerOf(sel)?.click();
  await waitFor(() => !panelOf(sel));
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
  // The upload finishes when the library row can be read back.
  await waitFor(async () => (await loadAllAssets("image")).some((a) => a.name === file.name));
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
  await waitFor(async () => (await loadAllAssets("image")).some((a) => a.name === file.name));
  return hot;
}

/** The boxes the Studio shows: a plain scene background, one already pointing
 *  at a film picture (auto-reveal), the depth-map field (its own group + an
 *  upload folder), one with no story id, and one that must stay pick-only. */
let bgValue: string | undefined;
let filmValue: string | undefined = __HIVE_PICTURE__;
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
      <div className="p-film">
        <ImagePicker value={filmValue} storyId="case-a" placeholder="film…" onChange={(v) => { filmValue = v; bump(); }} />
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

  root = createRoot(container);
  root.render(<App />);
  await waitFor(() => !!triggerOf(".p-bg"));

  console.log("\n=== A · THE BOX LISTS EVERY AVAILABLE IMAGE ===");
  check(
    `A0 the repo's own scan carries the film's pictures and depth layers (${__FILM_PICTURE_COUNT__} + ${__FILM_LAYER_COUNT__})`,
    __FILM_PICTURE_COUNT__ >= 800 && __FILM_LAYER_COUNT__ >= 50,
    { pictures: __FILM_PICTURE_COUNT__, layers: __FILM_LAYER_COUNT__ },
  );
  check("A1 five image boxes mount", ["p-bg", "p-film", "p-depth", "p-anon", "p-no-upload"].every((c) => !!triggerOf(`.${c}`)));
  check("A2 trigger shows the placeholder until something is picked", textOf(triggerOf(".p-bg")).includes("bg…"));

  await openPicker(".p-bg");
  const bg = panelOf(".p-bg");
  check("A3 the panel opens", !!bg);
  check("A4 the gradient presets are always listed", !!rowNamed(bg, "Indigo → Magenta"));
  check("A5 the film's pictures stay out of a plain background list", !rowNamed(bg, __HIVE_PICTURE_LABEL__));
  check("A6 …and the box says how many are held back, and names them",
    new RegExp(`Show every group too \\(${__FILM_PICTURE_COUNT__ + __FILM_LAYER_COUNT__} more — film pictures \\(nobody's witness\\), film depth maps, plates & cut-outs\\)`).test(allText()),
    allText().slice(-220));
  bg.querySelector('input[type="checkbox"]')?.click();
  await waitFor(() => !!rowNamed(panelOf(".p-bg"), __HIVE_DEPTH_LABEL__));
  check("A7 ticking it lists every film picture and depth layer", !!rowNamed(panelOf(".p-bg"), __HIVE_PICTURE_LABEL__) && !!rowNamed(panelOf(".p-bg"), __HIVE_DEPTH_LABEL__));
  const panelText = textOf(panelOf(".p-bg"));
  check("A8 the pictures sit under their own heading, ahead of the depth layers",
    panelText.indexOf("Film pictures (Nobody's Witness)") >= 0 &&
      panelText.indexOf("Film pictures (Nobody's Witness)") < panelText.indexOf(__HIVE_PICTURE_LABEL__) &&
      panelText.indexOf(__HIVE_PICTURE_LABEL__) < panelText.indexOf("Film depth maps, plates & cut-outs"),
    panelText.slice(0, 200));
  const filter = panelOf(".p-bg").querySelector('input:not([type="file"]):not([type="checkbox"])');
  check("A9 the filter box counts what it can offer", /Filter \d+ images/.test(filter?.placeholder ?? ""), filter?.placeholder);
  setInput(filter, "hive-remembered");
  await waitFor(() => !!rowNamed(panelOf(".p-bg"), __HIVE_PICTURE_LABEL__) && !rowNamed(panelOf(".p-bg"), "M4 Railway Rain (montage)"));
  check("A10 filtering narrows the list to the shot", !!rowNamed(panelOf(".p-bg"), __HIVE_PICTURE_LABEL__) && !rowNamed(panelOf(".p-bg"), "M4 Railway Rain (montage)"));
  filter.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await waitFor(() => bgValue === __HIVE_PICTURE__);
  check("A11 Enter picks the first match and closes the box", bgValue === __HIVE_PICTURE__, bgValue);
  check("A12 the trigger then names what is picked", textOf(triggerOf(".p-bg")).includes(__HIVE_PICTURE_LABEL__), textOf(triggerOf(".p-bg")));

  await openPicker(".p-film");
  const filmPanel = panelOf(".p-film");
  await waitFor(() => !!rowNamed(panelOf(".p-film"), __HIVE_PICTURE_LABEL__));
  check("A13 a field already on a film picture lists the film's pictures straight away", !!rowNamed(filmPanel, __HIVE_PICTURE_LABEL__));
  check("A14 …while its depth layers stay one click away",
    !rowNamed(filmPanel, __HIVE_DEPTH_LABEL__) && new RegExp(`Show every group too \\(${__FILM_LAYER_COUNT__} more — film depth maps`).test(textOf(filmPanel)),
    textOf(filmPanel).slice(-200));
  const activeRow = rowNamed(filmPanel, __HIVE_PICTURE_LABEL__);
  check("A15 the field's current picture is marked as the picked one", /✓/.test(textOf(activeRow)));
  check("A16 the value also drives the trigger label", textOf(triggerOf(".p-film")).includes(__HIVE_PICTURE_LABEL__));
  activeRow.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }));
  const previewOf = () =>
    [...doc.querySelectorAll("div")].find((d: any) => (d.getAttribute("style") ?? "").includes("position: fixed") && textOf(d).includes(__HIVE_PICTURE_LABEL__));
  await waitFor(() => !!previewOf());
  check("A17 hovering a row pops the big preview", !!previewOf());

  // 800-odd rows is a list to search, not to render: the panel builds a window
  // of them, says how many are held back, offers the rest on request, and does
  // not queue a thumbnail fetch per row while it is at it. The picture the
  // field is already on is always shown, even when it sorts past the window.
  const listRows = () => rowsOf(panelOf(".p-film")).length;
  check(`A17a a ${__FILM_PICTURE_COUNT__}-picture list is windowed, not built whole`, listRows() > 0 && listRows() <= 260, listRows());
  check("A17b …and says how many it is holding back, with a way to see them",
    /Showing \d+ of \d+/.test(textOf(filmPanel)) && /Show all \d+/.test(textOf(filmPanel)),
    textOf(filmPanel).slice(-140));
  check("A17c …and fetches no thumbnail per row for a list that size",
    panelOf(".p-film").querySelectorAll("img").length <= 2,
    panelOf(".p-film").querySelectorAll("img").length);
  const lastLabel = __LAST_FILM_PICTURE_LABEL__;
  setInput(filmPanel.querySelector('input:not([type="file"]):not([type="checkbox"])'), lastLabel);
  await waitFor(() => !!rowNamed(panelOf(".p-film"), lastLabel));
  panelOf(".p-film")
    .querySelector('input:not([type="file"]):not([type="checkbox"])')
    .dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await waitFor(() => filmValue === __LAST_FILM_PICTURE__);
  check("A17d the last picture in the library can still be searched to and picked", filmValue === __LAST_FILM_PICTURE__, filmValue);
  await openPicker(".p-film");
  await waitFor(() => !!rowNamed(panelOf(".p-film"), lastLabel));
  check("A17e …and re-opening the box still shows the picture the field is on", !!rowNamed(panelOf(".p-film"), lastLabel));
  check("A17f the window is still a window after re-opening", listRows() <= 260, listRows());
  [...rowsOf(panelOf(".p-film"))].find((b) => /^Show all \d+$/.test(textOf(b)))?.click();
  await waitFor(() => listRows() > 400);
  check("A17g “Show all” really does list the rest", listRows() > 400, listRows());
  await closePicker(".p-film");

  await openPicker(".p-depth");
  await waitFor(() => !!rowNamed(panelOf(".p-depth"), __HIVE_DEPTH_LABEL__));
  const depthPanel = panelOf(".p-depth");
  check("A18 the depth box lists the film's own depth files by default, labelled by shot", !!rowNamed(depthPanel, __HIVE_DEPTH_LABEL__));
  check("A19 …and still offers the upload button in the box itself", /⇧ Upload an image/.test(textOf(depthPanel)), textOf(depthPanel).slice(0, 120));

  console.log("\n=== B · THE UPLOAD BUTTON INSIDE THE BOX ===");
  const ok = await feedFile(".p-depth", pngFile("depth-test.png"));
  check("B1 the hidden file input takes a file", ok);
  const all: MediaAsset[] = await loadAllAssets("image");
  const uploaded = all.find((a) => a.name === "depth-test.png");
  check("B2 the upload really landed in the library", !!uploaded, all.map((a) => a.name));
  check("B3 the field is set to the new asset reference", !!uploaded && depthValue === `asset:${uploaded.id}`, { depthValue, id: uploaded?.id });
  check("B4 it was filed in the folder the field asked for", uploaded?.folder === "depth maps", uploaded?.folder);
  check("B5 the box keeps itself open and confirms what happened", /✓ depth-test\.png/.test(textOf(panelOf(".p-depth"))), textOf(panelOf(".p-depth")).slice(-160));
  await waitFor(() => !!rowNamed(panelOf(".p-depth"), "📁 depth maps / depth-test.png"));
  check("B6 the new image is listed under “Your uploads”", !!rowNamed(panelOf(".p-depth"), "📁 depth maps / depth-test.png"));
  const imageRows = rowsOf(panelOf(".p-depth")).filter((b: any) => b.querySelector("img"));
  check("B7 the new image leads the list, not buried under the library", textOf(imageRows[0]).includes("depth-test.png"), textOf(imageRows[0]));
  check("B8 the trigger shows the freshly uploaded file", textOf(triggerOf(".p-depth")).includes("depth-test.png"), textOf(triggerOf(".p-depth")));
  await waitFor(() => /✓ depth-test\.png/.test(textOf(panelOf(".p-depth"))));
  const refused = await feedFile(".p-depth", new win.File(["not an image"], "notes.txt", { type: "text/plain" }));
  await waitFor(() => /✕/.test(textOf(panelOf(".p-depth"))));
  check("B9 a non-image is refused in the box, not silently kept", refused && /✕/.test(textOf(panelOf(".p-depth"))), textOf(panelOf(".p-depth")).slice(-120));
  check("B10 …and the field is untouched by the refusal", depthValue === `asset:${uploaded?.id}`, depthValue);

  const hot = await dropFile(".p-bg", pngFile("drop-test.png"));
  check("B11 dragging a file over the box highlights it", hot);
  const dropped = (await loadAllAssets("image")).find((a) => a.name === "drop-test.png");
  check("B12 dropping a file uploads and picks it", !!dropped && bgValue === `asset:${dropped.id}`, { bgValue, dropped: dropped?.id });
  check("B13 a picker with no upload folder leaves it unfiled", !dropped?.folder, dropped?.folder);

  setImagePickerStoryId("case-z");
  await openPicker(".p-anon");
  await feedFile(".p-anon", pngFile("anon-test.png"));
  await waitFor(async () => (await loadAssets("case-z")).some((a) => a.name === "anon-test.png"));
  const filed = await loadAssets("case-z");
  check("B14 a picker with no story id files under the case Studio has open", !!filed.find((a) => a.name === "anon-test.png"), filed.map((a) => a.name));
  check("B15 …and still picks it", (anonymousValue ?? "").startsWith("asset:"), anonymousValue);

  await openPicker(".p-no-upload");
  check("B16 a pick-only box shows no upload row", !/⇧ Upload an image/.test(textOf(panelOf(".p-no-upload"))) && !panelOf(".p-no-upload").querySelector('input[type="file"]'));

  await sleep(50);
  if (problems.length) {
    console.log("\nconsole errors / throws during the probe:");
    for (const [kind, msg] of problems.slice(0, 6)) console.log(`  ${kind}: ${msg.slice(0, 400)}`);
  }
  check("B17 no console errors, uncaught throws or rejected promises", problems.length === 0, problems.length);
  check("B18 no error boundary trip", !/the reel snapped|something broke/i.test(doc.body.innerHTML));

  console.log(`\nimage picker: ${passed} passed, ${failed} failed`);
  if (failed) throw new Error(`${failed} image-picker check(s) failed`);
}
