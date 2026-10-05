/**
 * FOREGROUND & SPRITE-SHEET BETA PROBE — the 10-point checklist, driven
 * through the REAL UI and verified against the DATA the editor produces
 * plus the DOM the engine actually renders. Nothing here trusts a claim
 * from an earlier pass: every gate is re-run from scratch.
 *
 *   Part A — the real <Studio/> in happy-dom
 *     A0  boot, new case, stage scene
 *     A1  sprite-sheet layers with 1, 2 and many frames        (item 1)
 *     A2  every animation preset × frame adaptation            (item 2)
 *     A3  the full-screen frame player: play/pause/scrub/loop  (item 3)
 *     A4  layer stack edits: reorder / hide / rotate / opacity (item 4)
 *     A5  every blend mode over a contrasting background       (item 5)
 *     A6  composite parity: Studio preview vs 🚶 Stage tab     (item 6a/6b)
 *     A7  undo/redo across layer edits and preset creation     (item 8)
 *     A8  export / import / reload keep foreground properties  (item 9)
 *   Part B — the real <GamePlayer> fed Part A's authored draft
 *     B1  the same composite in actual game playback           (item 6c)
 *     B2  sheet layers animate in play (frame stepping)
 *     B3  parallax planes shift by authored depth              (item 7a)
 *     B4  walk-behind occlusion with a moving actor            (item 7b)
 *     B5  skull-pie / object-first verb menu hits the right
 *         object, with item USE and hold-to-open               (item 10)
 *     B6  the same composite on a classic dialogue scene
 *
 * Sheets are GENUINE PNGs generated here (64px frames, 1 / 2 / 5 columns)
 * and uploaded through the real ⤒ Upload button into real (fake-)IndexedDB,
 * so every grid computation runs against true pixel sizes.
 */
import zlib from "node:zlib";
import { StrictMode, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Studio } from "STUDIO_PATH";
import { GamePlayer } from "GAME_PATH";
import { ErrorBoundary } from "EB_PATH";
import { STORIES } from "STORIES_PATH";
import { sheetCols, spriteSheetIssues } from "SPRITESHEET_PATH";
import type { Story, SceneNode, ForegroundExtra } from "TYPES_PATH";

/* ---------------- tiny DOM/util layer ---------------- */

interface Ctx {
  win: any;
  doc: any;
  container: any;
  exit: (code: number) => void;
}

let win: any;
let doc: any;
let container: any;
let exitFn: (code: number) => void;

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
console.error = (...a: unknown[]) => {
  const msg = a.map(String).join(" ").slice(0, 2200);
  problems.push(["console.error", msg]);
};
process.on("uncaughtException", (e) => problems.push(["uncaught", String((e as any)?.stack || e).slice(0, 600)]));
process.on("unhandledRejection", (e) => problems.push(["unhandled rejection", String((e as Error)?.stack || e).slice(0, 600)]));

/** console.error during a phase = a failed beta check. */
function sweepProblems(label: string) {
  const errs = problems.filter(([k]) => k !== "console.warn");
  if (errs.length) check(`no console errors during ${label}`, false, errs.slice(0, 3).map((e) => e[1]));
  problems.length = 0;
}

const q = (sel: string, root?: any) => [...(root ?? container).querySelectorAll(sel)] as any[];
const byText = (re: RegExp, sel = "button", root?: any) => q(sel, root).find((el: any) => re.test((el.textContent || "").trim()));
const snap = () => (container.textContent || "").replace(/\s+/g, " ");
const crashed = () => /the reel snapped|something broke/i.test(container.innerHTML);

/** happy-dom needs the native setter for React-controlled inputs. */
function setInput(el: any, value: string, root = win) {
  const proto = el instanceof root.HTMLTextAreaElement ? root.HTMLTextAreaElement.prototype : root.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set;
  setter.call(el, value);
  el.dispatchEvent(new root.Event("input", { bubbles: true }));
}
function setSelect(el: any, value: string, root = win) {
  const setter = Object.getOwnPropertyDescriptor(root.HTMLSelectElement.prototype, "value")!.set;
  setter.call(el, value);
  el.dispatchEvent(new root.Event("change", { bubbles: true }));
}
/** onChange + onBlur fields (animation frame lists commit on blur). */
function setInputThenBlur(el: any, value: string) {
  setInput(el, value);
  // React delegates onBlur through the bubbling focusout event.
  el.dispatchEvent(new win.FocusEvent("focusout", { bubbles: true }));
  el.dispatchEvent(new win.Event("blur"));
}
const setRange = (el: any, value: number) => setInput(el, String(value));
function toggleCheck(el: any) {
  el?.click();
}

const TAB_RE: Record<string, RegExp> = {
  scene: /^Scene$/,
  stage: /🚶 Stage/,
};
async function tab(name: string) {
  // The toolbar's "🚶 Stage" button ADDS a stage scene; the inspector tab
  // with the same label switches panels. Always prefer the tab-grid button.
  const matches = q("button").filter((el: any) => TAB_RE[name].test((el.textContent || "").trim()));
  const b = matches.find((el: any) => el.closest?.(".grid.grid-cols-4")) ?? matches[0];
  if (!b) {
    check(`tab ${name} exists`, false);
    if (process.env.FGB_DEBUG) console.log("TAB CANDIDATES:", q("button").map((el: any) => (el.textContent || "").trim()).filter(Boolean).slice(0, 100));
    return false;
  }
  if (process.env.FGB_DEBUG) console.log(`TAB ${name} ->`, (b.textContent || "").trim());
  b.click();
  await sleep(700);
  return true;
}

/** The current story, read from the editor's own autosaved draft. */
const draftKey = (id: string) => `scarlet-studio-draft-${id}`;
function draft(id: string): Story | null {
  const raw = win.localStorage.getItem(draftKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
async function waitFor(pred: () => boolean, ms = 4000, step = 120) {
  for (let t = 0; t < ms; t += step) {
    if (pred()) return true;
    await sleep(step);
  }
  return pred();
}
async function waitDraft(id: string, pred: (s: Story) => boolean = () => true, ms = 8000) {
  const ok = await waitFor(() => {
    const d = draft(id);
    return !!d && pred(d);
  }, ms);
  return ok ? draft(id) : null;
}

/* ---------------- the studio mount ---------------- */

const events: { created: Story[] } = { created: [] };
const allStories: Story[] = [...STORIES.slice(0, 3)];
let rootR: Root;

const studioProps = (extra: { initialStoryId?: string } = {}) => ({
  baseStories: allStories.slice(),
  ...(extra.initialStoryId ? { initialStoryId: extra.initialStoryId } : {}),
  onPublish: (s: Story) => true,
  onPlay: () => {},
  onExit: () => {},
  onDeleteStory: () => true,
  onCreateStory: (s: Story) => {
    events.created.push(s);
    allStories.push(s);
    return true;
  },
  onUpdateTitleTheme: () => {},
});

function mountFresh(target: any, extra: { initialStoryId?: string } = {}) {
  const r = createRoot(target);
  r.render(createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(Studio, studioProps(extra)))));
  return r;
}

/** Structural edits are spaced >600ms apart so each is its own undo step. */
const spacing = 900;

/* ---------------- genuine PNG sheets (1 / 2 / 5 frames) ---------------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Buffer {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  Buffer.from(data).copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
/** One flat-colour RGBA PNG of w×h (a "sheet" of w/64 frames). */
function makePng(w: number, h: number, rgba: [number, number, number, number]): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = 1 + w * 4;
  const raw = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const row = y * stride;
    raw[row] = 0; // filter: none
    for (let x = 0; x < w; x++) {
      const p = row + 1 + x * 4;
      raw[p] = rgba[0];
      raw[p + 1] = rgba[1];
      raw[p + 2] = rgba[2];
      raw[p + 3] = rgba[3];
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", new Uint8Array(0)),
  ]);
}
const pngFile = (name: string, w: number, h: number, rgba: [number, number, number, number]) => {
  const bytes = makePng(w, h, rgba);
  return new win.File([new Uint8Array(bytes)], name, { type: "image/png" }) as File;
};

/* ---------------- foreground-layer DOM reading ---------------- */

const styleOf = (el: any) => String(el.getAttribute("style") || "");

/** Rendered foreground extras: the layer box is className="absolute" exactly
 *  (stage markers and hotspot art use richer classes), with left: NN% top:. */
const extraEls = (root: any) =>
  q("div", root).filter((el: any) => {
    const cls = String(el.className || "").trim();
    return cls === "absolute" && /left:\s*\d+(\.\d+)?%/.test(styleOf(el)) && /top:/.test(styleOf(el));
  });
const extraByLeft = (root: any, left: number) =>
  extraEls(root).find((el: any) => {
    const m = /left:\s*([\d.]+)%/.exec(styleOf(el));
    return m && Math.abs(parseFloat(m[1]) - left) < 0.6;
  });
const blendOf = (el: any) => (/mix-blend-mode:\s*([\w-]+)/.exec(styleOf(el)) || [])[1] ?? "";
const opacityOf = (el: any) => (/opacity:\s*([\d.]+)/.exec(styleOf(el)) || [])[1];
const rotateOf = (el: any) => (/rotate\((-?[\d.]+)deg\)/.exec(styleOf(el)) || [])[1];

/* ---------------- shared state ---------------- */
let caseId = "";
let stageSceneId = "";
const LEFT = { occluder: 70, one: 12, two: 28, many: 44, blend: 58 } as const;
const PNGS = {
  one: { name: "sheet-one.png", w: 64, frames: 1, color: [220, 60, 60, 255] as [number, number, number, number] },
  two: { name: "sheet-two.png", w: 128, frames: 2, color: [60, 200, 120, 255] as [number, number, number, number] },
  many: { name: "sheet-many.png", w: 320, frames: 5, color: [90, 120, 240, 255] as [number, number, number, number] },
};
const SHEET_KEY_BY_BLOCK: Record<number, "one" | "two" | "many"> = { 1: "one", 2: "two", 3: "many" };

const extrasOf = (s: Story | null | undefined): ForegroundExtra[] => {
  if (s && !Array.isArray(s.scenes) && process.env.FGB_DEBUG) {
    console.log("DRAFT WITHOUT SCENES:", JSON.stringify(s).slice(0, 300));
    console.log("RAW DRAFT:", String(win.localStorage.getItem(draftKey(caseId))).slice(0, 120), "len:", String(win.localStorage.getItem(draftKey(caseId))).length);
  }
  return ((s?.scenes?.find((x: SceneNode) => x.id === stageSceneId)?.cinematic?.foregroundExtras ?? []) as ForegroundExtra[]).slice();
};
const cinOf = (s: Story | null | undefined) => s?.scenes.find((x: SceneNode) => x.id === stageSceneId)?.cinematic;

/** Open a collapsible section by title regex; return its content div. */
async function openSection(re: RegExp): Promise<any | null> {
  const btn = byText(re);
  if (!btn) {
    if (process.env.FGB_DEBUG) console.log("SECTION NOT FOUND:", re, "— headers:", q("button").map((el: any) => (el.textContent || "").trim().slice(0, 60)).filter((t: string) => t.length < 60).slice(0, 120));
    return null;
  }
  const section = btn.parentElement.parentElement;
  const isOpen = () => section.children.length > 1 && String(section.children[1]?.className || "").includes("space-y-2");
  if (!isOpen()) {
    btn.click();
    await sleep(350);
  }
  return isOpen() ? section.children[1] : null;
}

/** The per-extra editor blocks (array order = layer order). */
const extraBlocks = (section: any) => [...section.children].filter((el: any) => String(el.className).includes("border-neon/20")) as any[];
/** The 🎞 sheet sub-editor inside one extra block. */
const sheetAreaOf = (block: any) => ([...block.children].find((el: any) => String(el.className).includes("border-cyan-neon/30")) ?? null) as any;
/** The layer-stack block. */
const layerStackOf = (section: any) => ([...section.children].find((el: any) => String(el.className).includes("border-cyan-neon/35")) ?? null) as any;
/** The stack's layer rows (nested one div down, not direct children). */
const stackRows = (stack: any) => q("div", stack).filter((el: any) => String(el.className).includes("flex items-center gap-1 border"));

/** Pick an image inside an ImagePicker by its row label. */
async function pickImage(pickerButton: any, name: string) {
  if (!pickerButton) return false;
  pickerButton.click();
  await sleep(300);
  const item = q("button", win.document.body).find(
    (el: any) => (el.textContent || "").includes(name) && !(el.textContent || "").includes("— None —") && el.closest(".z-50, [class*='z-50']"),
  );
  if (!item) return false;
  item.click();
  await sleep(350);
  return true;
}

/** The first two 0..100 range inputs in a block = Position X, Position Y. */
async function positionLayer(blockIdx: number, x: number, y: number, section: any) {
  const blk = extraBlocks(section)[blockIdx];
  const pair = q('input[type="range"]', blk).filter((r: any) => r.min === "0" && r.max === "100");
  setRange(pair[0], x);
  await sleep(spacing);
  setRange(pair[1], y);
  await sleep(spacing);
}

/* ================================================================ */
export async function run(ctx: Ctx) {
  win = ctx.win;
  doc = ctx.doc;
  container = ctx.container;
  exitFn = ctx.exit;
  try {
    await partA();
    await partB();
  } catch (err) {
    console.error("\nPROBE THREW:", err);
    if (process.env.FGB_DEBUG) console.error((err as Error)?.stack);
    failed++;
  }
  console.log(`\n=== FOREGROUND BETA: ${passed} passed, ${failed} failed ===`);
  const leftover = problems.filter(([k]) => k !== "console.warn");
  if (leftover.length) console.log("unswept problems:", leftover.slice(0, 5).map((p) => p[1]));
  exitFn(failed ? 1 : 0);
}

/* ================================================================
 * PART A — THE STUDIO
 * ================================================================ */
async function partA() {
  /* ---------- A0: boot, new case, stage scene ---------- */
  rootR = mountFresh(container);
  await sleep(2600);
  check("A0.1 studio booted without a crash", !crashed());
  sweepProblems("boot");

  byText(/＋ New Story/)?.click();
  await sleep(700);
  const created = events.created[events.created.length - 1];
  check("A0.2 new story created", !!created);
  if (!created) return;
  caseId = created.id;

  const stageBtn = q("button").find((el: any) => (el.textContent || "").trim() === "🚶 Stage" && String(el.className).includes("btn-tool"));
  check("A0.3 toolbar 🚶 Stage button present", !!stageBtn);
  stageBtn?.click();
  const withStage = (await waitDraft(caseId, (d) => d.scenes.some((x) => x.nodeType === "stage"), 9000))!;
  stageSceneId = withStage.scenes.find((x) => x.nodeType === "stage")!.id;
  check("A0.4 walkable stage scene authored (and claims the start)", !!stageSceneId && withStage.startSceneId === stageSceneId, {
    stageSceneId,
    start: withStage.startSceneId,
  });
  sweepProblems("stage creation");

  /* ---------- A1: sprite-sheet layers, 1 / 2 / many frames ---------- */
  await tab("scene");
  const lookSection = await openSection(/🖼 Look, atmosphere & camera/);
  check("A1.0 look & camera section opens (stage nodes keep Cinematics)", !!lookSection);
  const section = await openSection(/Sprite sheet editor — foreground sprites/);
  check("A1.1 sprite sheet editor section opens", !!section);
  if (!section) return;

  const addBtn = byText(/＋ Add foreground image/, "button", section);
  check("A1.2 ＋ Add foreground image present", !!addBtn);
  for (let i = 0; i < 3; i++) {
    addBtn.click();
    await sleep(spacing);
  }
  let s = (await waitDraft(caseId, (d) => extrasOf(d).length === 3))!;
  check("A1.3 three foreground layers added", extrasOf(s).length === 3, extrasOf(s).length);

  // A contrasting background for the blend tests: bright indigo→magenta.
  const bgField = q("label").find((el: any) => (el.textContent || "").startsWith("Background image / gradient"));
  const bgPicker = bgField ? q("button", bgField)[0] : null;
  check("A1.4 scene background picker present", !!bgPicker);
  if (bgPicker) {
    await pickImage(bgPicker, "Indigo → Magenta");
    s = (await waitDraft(caseId, (d) => (d.scenes.find((x) => x.id === stageSceneId)?.background || "").startsWith("gradient:")))!;
    check("A1.5 contrasting background set", !!s);
  }

  // Upload three genuine PNG sheets (⤒ Upload new adds an extra per upload;
  // the assets stay in the library for the sheet pickers).
  const uploadLabel = q("label", section).find((el: any) => (el.textContent || "").includes("⤒ Upload new"));
  const uploadInput = uploadLabel ? uploadLabel.querySelector('input[type="file"]') : null;
  check("A1.6 ⤒ Upload new present in the foreground panel", !!uploadInput);
  if (!uploadInput) return;
  const files = [pngFile(PNGS.one.name, PNGS.one.w, 64, PNGS.one.color), pngFile(PNGS.two.name, PNGS.two.w, 64, PNGS.two.color), pngFile(PNGS.many.name, PNGS.many.w, 64, PNGS.many.color)];
  for (let i = 0; i < files.length; i++) {
    Object.defineProperty(uploadInput, "files", { value: [files[i]], configurable: true });
    uploadInput.dispatchEvent(new win.Event("change", { bubbles: true }));
    await waitDraft(caseId, (d) => extrasOf(d).length === 3 + i + 1, 10000);
    await sleep(500);
  }
  check("A1.7 three sheet PNGs uploaded through the real upload button", extrasOf(draft(caseId)).length === 6, extrasOf(draft(caseId)).length);

  // Drop the three upload-extras (assets remain in the library).
  for (let i = 0; i < 3; i++) {
    await sleep(spacing);
    const blocks = extraBlocks(section);
    const del = q("button", blocks[blocks.length - 1]).find((el: any) => (el.textContent || "").trim() === "✕");
    del?.click();
    await waitDraft(caseId, (d) => extrasOf(d).length === 6 - i - 1);
  }
  check("A1.8 back to three authored layers; uploads live in the library", extrasOf(draft(caseId)).length === 3);

  // Two more layers: the occluder + the blend-test layer (gradients).
  for (let i = 0; i < 2; i++) {
    addBtn.click();
    await sleep(spacing);
  }
  s = (await waitDraft(caseId, (d) => extrasOf(d).length === 5))!;
  check("A1.9 five layers staged (3 sheets + 2 gradients)", extrasOf(s).length === 5, extrasOf(s).length);

  // Fill: [0] occluder gradient, [1..3] sheets, [4] blend gradient.
  const gradLabel = { occluder: "Amber → Noir", blend: "Teal → Indigo" };
  const gradPicker = (blockIdx: number) => q("button", extraBlocks(section)[blockIdx]).find((el: any) => /Pick a transparent image/.test(el.textContent || ""));
  check("A1.10 occluder gradient picked", await pickImage(gradPicker(0), gradLabel.occluder));
  check("A1.11 blend gradient picked", await pickImage(gradPicker(4), gradLabel.blend));
  const sheetPicker = (blockIdx: number) => q("button", sheetAreaOf(extraBlocks(section)[blockIdx])).find((el: any) => /Pick the sprite sheet|sheet-/.test(el.textContent || ""));
  check("A1.12 1-frame sheet picked for its layer", await pickImage(sheetPicker(1), PNGS.one.name));
  check("A1.13 2-frame sheet picked for its layer", await pickImage(sheetPicker(2), PNGS.two.name));
  check("A1.14 5-frame sheet picked for its layer", await pickImage(sheetPicker(3), PNGS.many.name));
  s = (await waitDraft(caseId, (d) => extrasOf(d).filter((e) => e.sheet).length === 3, 12000))!;
  const sheets = extrasOf(s).map((e) => e.sheet);
  check("A1.12b all three sheets landed", sheets.length === 5 && sheets.slice(1, 4).every(Boolean), sheets.map((sh) => !!sh));
  if (!(sheets.length === 5 && sheets.slice(1, 4).every(Boolean))) {
    sweepProblems("A1 sheet layers");
    return; // nothing else in Part A can be authored without the sheets
  }
  check(
    "A1.15 sheet frame sizes defaulted from the preset (64×64)",
    sheets.length === 5 && sheets.slice(1, 4).every((sh) => sh && sh.frameWidth === 64 && sh.frameHeight === 64),
    sheets.map((sh) => sh && [sh.frameWidth, sh.frameHeight]),
  );
  check(
    "A1.16 every sheet validates clean (spriteSheetIssues)",
    sheets.length === 5 && sheets.slice(1, 4).every((sh) => sh && spriteSheetIssues(sh, "sheet", ["loop"]).length === 0),
    sheets.map((sh) => sh && spriteSheetIssues(sh, "sheet", ["loop"])),
  );

  // Unique x positions so the DOM can tell the layers apart.
  await positionLayer(0, LEFT.occluder, 82, section);
  await positionLayer(1, LEFT.one, 80, section);
  await positionLayer(2, LEFT.two, 80, section);
  await positionLayer(3, LEFT.many, 80, section);
  await positionLayer(4, LEFT.blend, 78, section);
  s = draft(caseId)!;
  const xs = extrasOf(s).map((e) => e.x);
  check("A1.17 layers positioned at unique x offsets", [70, 12, 28, 44, 58].every((v, i) => xs[i] === v), xs);

  // THE FRAME COUNTS — grid maths in data (cols) and in the live preview
  // (SheetSprite backgroundSize = cols × 100%).
  s = draft(caseId)!;
  const cols = [1, 2, 3].map((i) => {
    const sh = extrasOf(s)[i].sheet!;
    return sheetCols(sh, PNGS[SHEET_KEY_BY_BLOCK[i]].w);
  });
  check("A1.18 frame counts: 1, 2 and many (5) frames", cols[0] === 1 && cols[1] === 2 && cols[2] === 5, cols);

  const camera = await openSection(/📷 Camera/);
  check("A1.19 camera (live preview) section opens", !!camera);
  const previewRoot = camera ? camera.children[0] : null;
  const bgSizeAt = (left: number) => {
    const el = extraByLeft(previewRoot, left);
    const inner = el && el.querySelector("div");
    return inner ? ((/background-size:\s*([^;]+)/.exec(styleOf(inner)) || [])[1] ?? "") : "(missing)";
  };
  check("A1.20 preview: 1-frame sheet grid 100%", /100%/.test(bgSizeAt(LEFT.one)), bgSizeAt(LEFT.one));
  check("A1.21 preview: 2-frame sheet grid 200%", /200%/.test(bgSizeAt(LEFT.two)), bgSizeAt(LEFT.two));
  check("A1.22 preview: 5-frame sheet grid 500%", /500%/.test(bgSizeAt(LEFT.many)), bgSizeAt(LEFT.many));
  sweepProblems("A1 sheet layers");

  /* ---------- A2: animation presets × frame adaptation ---------- */
  const sheetBlock = (key: "one" | "two" | "many") => extraBlocks(section)[({ one: 1, two: 2, many: 3 } as any)[key]];
  const animsOf = (s: Story | null, key: "one" | "two" | "many") =>
    ((extrasOf(s)[({ one: 1, two: 2, many: 3 } as any)[key]]?.sheet?.animations ?? {}) as Record<string, { frames: number[]; fps?: number; loop?: boolean }>);
  const framesOf = (s: Story | null, key: "one" | "two" | "many", name: string) => animsOf(s, key)[name]?.frames;

  // A custom animation the presets must NOT touch.
  const oneArea = sheetAreaOf(sheetBlock("one"));
  byText(/\+ animation/, "button", oneArea)?.click();
  await sleep(spacing);
  s = (await waitDraft(caseId, (d) => !!framesOf(d, "one", "anim1")))!;
  check("A2.1 custom animation added", s && JSON.stringify(framesOf(s, "one", "anim1")) === "[0]", s && framesOf(s, "one", "anim1"));

  // Narrow the 1-frame sheet's loop to "0" so presets must clamp to 0.
  const setFrames = async (key: "one" | "two" | "many", animName: string, csv: string) => {
    const area = sheetAreaOf(sheetBlock(key));
    const rows = q("div", area).filter((el: any) => String(el.className).includes("grid-cols-[5rem_1fr_3.2rem_2.4rem_1.2rem]"));
    const row = rows.find((r: any) => q("input", r)[0]?.value === animName);
    if (!row) return false;
    setInputThenBlur(q("input", row)[1], csv);
    return true;
  };
  check("A2.2 1-frame sheet loop narrowed to frame 0 (row found)", await setFrames("one", "loop", "0"));
  s = (await waitDraft(caseId, (d) => JSON.stringify(framesOf(d, "one", "loop")) === "[0]", 6000))!;
  check("A2.3 narrowing persisted through the blur commit", !!s && JSON.stringify(framesOf(s, "one", "loop")) === "[0]", s && animsOf(s, "one").loop);

  const clickPreset = async (key: "one" | "two" | "many", label: RegExp, pred: (d: Story) => boolean) => {
    byText(label, "button", sheetAreaOf(sheetBlock(key)))?.click();
    const landed = await waitDraft(caseId, pred, 8000);
    if (!landed && process.env.FGB_DEBUG) console.log("PRESET TIMEOUT:", label.source, key, "anims now:", JSON.stringify(animsOf(draft(caseId), key)), "btn found:", !!byText(label, "button", sheetAreaOf(sheetBlock(key))));
    return landed ? draft(caseId) : null;
  };

  s =
    (await clickPreset("one", /Prop loop/, (d) => JSON.stringify(framesOf(d, "one", "loop")) === "[0,0,0]"))!;
  check("A2.4 Prop preset on 1-frame sheet clamps to frame 0", !!s && JSON.stringify(framesOf(s, "one", "loop")) === "[0,0,0]" && JSON.stringify(framesOf(s, "one", "flicker")) === "[0,0,0,0]" && JSON.stringify(framesOf(s, "one", "hold")) === "[0]", s && animsOf(s, "one"));
  s =
    (await clickPreset("one", /Character/, (d) => JSON.stringify(framesOf(d, "one", "walk")) === "[0,0,0,0]"))!;
  check("A2.5 Character preset on 1-frame sheet clamps", !!s && JSON.stringify(framesOf(s, "one", "talk")) === "[0,0,0,0]" && JSON.stringify(framesOf(s, "one", "idle")) === "[0]", s && animsOf(s, "one"));
  check("A2.6 custom animation survives preset clicks", !!s && JSON.stringify(framesOf(s, "one", "anim1")) === "[0]", s && animsOf(s, "one").anim1);
  s =
    (await clickPreset("two", /Ping-pong/, (d) => JSON.stringify(framesOf(d, "two", "reverse")) === "[1,1,1,0]"))!;
  check("A2.7 Ping-pong preset adapts to 2 frames", !!s && JSON.stringify(framesOf(s, "two", "loop")) === "[0,1,1,1,1,1]" && JSON.stringify(framesOf(s, "two", "reverse")) === "[1,1,1,0]", s && animsOf(s, "two"));
  s =
    (await clickPreset("two", /Character/, (d) => JSON.stringify(framesOf(d, "two", "walk")) === "[0,1,1,1]"))!;
  check("A2.8 Character preset adapts to 2 frames", !!s && JSON.stringify(framesOf(s, "two", "walk")) === "[0,1,1,1]" && JSON.stringify(framesOf(s, "two", "talk")) === "[0,1,1,1]", s && animsOf(s, "two"));
  check("A2.9 preset replaced only its own names (reverse survived Character)", !!s && JSON.stringify(framesOf(s, "two", "reverse")) === "[1,1,1,0]", s && animsOf(s, "two"));
  // Widen the many-sheet, then presets must use the full range.
  check("A2.10 many-sheet loop widened to 0–4 (row found)", await setFrames("many", "loop", "0, 1, 2, 3, 4"));
  s = (await waitDraft(caseId, (d) => JSON.stringify(framesOf(d, "many", "loop")) === "[0,1,2,3,4]", 6000))!;
  check("A2.10b widening persisted", !!s, s && animsOf(s, "many").loop);
  s =
    (await clickPreset("many", /Character/, (d) => JSON.stringify(framesOf(d, "many", "walk")) === "[0,1,2,3]"))!;
  check("A2.11 Character preset uses the full 5-frame range", !!s && JSON.stringify(framesOf(s, "many", "walk")) === "[0,1,2,3]" && JSON.stringify(framesOf(s, "many", "talk")) === "[0,1,2,1]", s && animsOf(s, "many"));
  s =
    (await clickPreset("many", /Prop loop/, (d) => JSON.stringify(framesOf(d, "many", "loop")) === "[0,1,2]"))!;
  check("A2.12 Prop preset on the wide sheet keeps in-range frames", !!s && JSON.stringify(framesOf(s, "many", "loop")) === "[0,1,2]" && JSON.stringify(framesOf(s, "many", "flicker")) === "[0,1,0,2]", s && animsOf(s, "many"));
  s = draft(caseId)!;
  check(
    "A2.13 no preset ever wrote an out-of-range frame index",
    ["one", "two", "many"].every((k) => Object.values(animsOf(s, k as any)).every((a) => a.frames.every((f) => Number.isInteger(f) && f >= 0))),
    { one: animsOf(s, "one"), two: animsOf(s, "two"), many: animsOf(s, "many") },
  );
  sweepProblems("A2 presets");

  /* ---------- A3: the full-screen frame player ---------- */
  {
    const area = sheetAreaOf(sheetBlock("many"));
    const playerText = () => (area.textContent || "").match(/frame\s+\d+\s*\(step\s+\d+\/\d+\)/)?.[0] ?? "";
    check("A3.1 frame player present with grid info", /Frame player/.test(area.textContent || "") && /grid\s+5×1/.test(area.textContent || ""), (area.textContent || "").slice(0, 200));
    // select the walk animation (4 steps)
    const animSelect = q("select", area).find((el: any) => [...el.querySelectorAll("option")].some((o: any) => o.value === "walk"));
    check("A3.2 animation select lists every animation", !!animSelect && ["loop", "flicker", "hold", "idle", "walk", "talk", "rest"].every((n) => [...animSelect.querySelectorAll("option")].some((o: any) => o.value === n)), animSelect && [...animSelect.querySelectorAll("option")].map((o: any) => o.value));
    setSelect(animSelect, "walk");
    await sleep(400);
    // auto-play advances the step
    const t0 = playerText();
    await waitFor(() => playerText() !== t0, 2500);
    check("A3.3 auto-play advances the frame", playerText() !== t0, { t0, now: playerText() });
    // pause freezes it
    const pauseBtn = q("button", area).find((el: any) => /⏸ pause/.test(el.textContent || ""));
    pauseBtn?.click();
    await sleep(250);
    const paused = playerText();
    await sleep(600);
    check("A3.4 pause freezes the frame", playerText() === paused && /▶ play/.test((q("button", area).find((el: any) => /▶ play/.test(el.textContent || "")) || {}).textContent || ""), { paused, now: playerText() });
    // scrub to the last step
    const scrub = q('input[type="range"]', area).find((r: any) => String(r.max) === "3");
    check("A3.5 scrub slider present", !!scrub);
    setRange(scrub, 3);
    await sleep(300);
    check("A3.6 scrub shows the chosen step and pauses", playerText() === "frame 3 (step 4/4)", playerText());
    // full screen
    const fsBtn = q("button", area).find((el: any) => /⛶ full screen/.test(el.textContent || ""));
    fsBtn?.click();
    await sleep(350);
    const overlay = q("div", win.document.body).find((el: any) => String(el.className).includes("fixed inset-4"));
    check("A3.7 full-screen player opens as an overlay", !!overlay && /Frame player/.test(overlay.textContent || ""));
    const overlayScrub = overlay ? q('input[type="range"]', overlay).find((r: any) => String(r.max) === "3") : null;
    check("A3.8 scrubbing works in the full-screen player", !!overlayScrub);
    if (overlayScrub) {
      setRange(overlayScrub, 0);
      await sleep(250);
      check("A3.9 full-screen scrub reflects the frame", /frame 0 \(step 1\/4\)/.test(overlay.textContent || ""), (overlay.textContent || "").match(/frame\s+\d+\s*\(step[^)]*\)/)?.[0]);
    }
    q("button", overlay).find((el: any) => /✕ close/.test(el.textContent || ""))?.click();
    await sleep(300);
    check("A3.10 full-screen player closes", !q("div", win.document.body).some((el: any) => String(el.className).includes("fixed inset-4")));

    // LOOP — a non-looping animation HOLDS its last frame in the player
    // (matching the runtime's sheetFrameAt behaviour), it must not wrap.
    {
      const twoArea = sheetAreaOf(sheetBlock("two"));
      const rows = q("div", twoArea).filter((el: any) => String(el.className).includes("grid-cols-[5rem_1fr_3.2rem_2.4rem_1.2rem]"));
      const talkRow = rows.find((r: any) => q("input", r)[0]?.value === "talk");
      const loopBox = talkRow ? q('input[type="checkbox"]', talkRow)[0] : null;
      check("A3.11 loop checkbox present on the animation row", !!loopBox);
      if (loopBox) {
        toggleCheck(loopBox); // loop = false (hold last frame)
        await sleep(spacing);
        check("A3.12 loop:false persisted", extrasOf(draft(caseId))[2].sheet!.animations.talk.loop === false, extrasOf(draft(caseId))[2].sheet!.animations.talk);
        const sel = q("select", twoArea).find((el: any) => [...el.querySelectorAll("option")].some((o: any) => o.value === "talk"));
        setSelect(sel, "talk");
        await sleep(400);
        const playBtn = q("button", twoArea).find((el: any) => /▶ play/.test(el.textContent || ""));
        playBtn?.click(); // restart from frame 0
        await sleep(300);
        const text2 = () => (twoArea.textContent || "").match(/frame\s+\d+\s*\(step\s+(\d+)\/(\d+)\)/)?.[0] ?? "";
        await waitFor(() => /step 4\/4/.test(text2()), 2500);
        check("A3.13 non-looping animation reaches and HOLDS the last frame", /step 4\/4/.test(text2()), text2());
        const held = text2();
        await sleep(700);
        check("A3.14 the held frame does not wrap back to step 1", text2() === held && !/step 1\/4/.test(text2()), { held, now: text2() });
        // loop:false stays authored — A8's byte-exact round-trip then also
        // proves the loop flag persists through export/import/reload.
        await sleep(spacing);
      }
    }
    sweepProblems("A3 frame player");
  }

  /* ---------- A4: reorder / hide / rotate / opacity ---------- */
  {
    // Reorder via the layer stack: move the blend layer (row 4) to the back.
    const stack = layerStackOf(section);
    check("A4.1 layer stack lists all five layers", !!stack && q("button", stack).filter((b: any) => /○|◉/.test((b.textContent || "").trim())).length === 5, stack && stack.textContent);
    const rows = () => stackRows(stack);
    const arrow = (rowIdx: number, dir: "↑" | "↓") => q("button", rows()[rowIdx]).find((b: any) => (b.textContent || "").trim() === dir);
    await sleep(spacing);
    arrow(4, "↑")?.click();
    await sleep(spacing);
    s = (await waitDraft(caseId, (d) => extrasOf(d)[3].x === LEFT.blend))!; // blend (row 4) swapped with many (row 3)
    check("A4.2 ↑ moves the layer toward the back (order swapped)", extrasOf(s).map((e) => e.x).join(",") === [70, 12, 28, 58, 44].join(","), extrasOf(s).map((e) => e.x));
    // per-layer ↓ Front button restores it (blend sits at row 3 after the swap)
    const frontBtn = q("button", extraBlocks(section)[3]).find((b: any) => /↓ Front/.test(b.textContent || ""));
    frontBtn?.click();
    await sleep(spacing);
    s = (await waitDraft(caseId, (d) => extrasOf(d).map((e) => e.x).join(",") === [70, 12, 28, 44, 58].join(",")))!;
    check("A4.3 ↓ Front restores the order", extrasOf(s).map((e) => e.x).join(",") === [70, 12, 28, 44, 58].join(","), extrasOf(s).map((e) => e.x));

    // Hide the 2-frame sheet layer via the stack's ◉ toggle.
    const hideBtn = (rowIdx: number) => q("button", rows()[rowIdx]).find((b: any) => /◉|○/.test((b.textContent || "").trim()));
    await sleep(spacing);
    hideBtn(2)?.click(); // row 2 = sheet-two (x=28)
    s = (await waitDraft(caseId, (d) => extrasOf(d)[2].visible === false))!;
    check("A4.4 hide layer persisted (visible:false)", extrasOf(s)[2].visible === false, extrasOf(s)[2]);
    await sleep(400);
    check("A4.5 hidden layer not rendered in the Studio preview", !extraByLeft(previewRoot, LEFT.two), extraByLeft(previewRoot, LEFT.two));

    // Rotation + opacity on the blend layer, opacity on the occluder.
    // (Layer order restored above: [occluder, one, two, many, blend].)
    const setKnob = async (blockIdx: number, pick: (blk: any) => any, value: number) => {
      const blk = extraBlocks(section)[blockIdx];
      const el = blk ? pick(blk) : null;
      if (!el) return false;
      setRange(el, value);
      await sleep(spacing);
      return true;
    };
    const rotationInput = (blk: any) => q('input[type="range"]', blk).find((r: any) => r.min === "-180");
    const opacityInput = (blk: any) => q('input[type="range"]', blk).find((r: any) => r.min === "0" && r.max === "1" && String(r.className).includes("accent-pink"));
    check("A4.6 rotation knob found", await setKnob(4, rotationInput, 90));
    check("A4.7 rotation 90° persisted", extrasOf(draft(caseId))[4].rotation === 90, extrasOf(draft(caseId))[4].rotation);
    check("A4.8 opacity knob found (blend layer)", await setKnob(4, opacityInput, 0.5));
    check("A4.9 opacity 50% persisted (blend layer)", extrasOf(draft(caseId))[4].opacity === 0.5, extrasOf(draft(caseId))[4].opacity);
    check("A4.10 opacity knob found (occluder layer)", await setKnob(0, opacityInput, 0.75));
    check("A4.11 opacity 75% persisted (occluder layer)", extrasOf(draft(caseId))[0].opacity === 0.75, extrasOf(draft(caseId))[0].opacity);
    await sleep(400);
    const blendEl = extraByLeft(previewRoot, LEFT.blend);
    check("A4.12 preview shows rotate(90deg)", blendEl && rotateOf(blendEl) === "90", blendEl && styleOf(blendEl));
    check("A4.13 preview shows opacity 0.5", blendEl && opacityOf(blendEl) === "0.5", blendEl && styleOf(blendEl));

    // Walk-behind: flag the occluder (block 0), set its depth line to 80.
    const occluderBlock = extraBlocks(section)[0];
    const occBox = occluderBlock ? q('input[type="checkbox"]', occluderBlock).find((c: any) => /Draw this OVER the player/.test(c.parentElement?.textContent || "")) : null;
    check("A4.14 walk-behind checkbox present", !!occBox);
    if (occBox) {
      toggleCheck(occBox);
      await sleep(spacing);
      check("A4.15 occludes persisted", extrasOf(draft(caseId))[0].occludes === true, extrasOf(draft(caseId))[0]);
      const baseSlider = q('input[type="range"]', occluderBlock).find((r: any) => String(r.className).includes("accent-amber") && r.min === "0" && r.max === "100");
      check("A4.16 depth-line slider present", !!baseSlider);
      if (baseSlider) {
        setRange(baseSlider, 80);
        await sleep(spacing);
        check("A4.17 occludeBaseline 80 persisted", extrasOf(draft(caseId))[0].occludeBaseline === 80, extrasOf(draft(caseId))[0].occludeBaseline);
      }
    }
    sweepProblems("A4 layer edits");
  }

  /* ---------- A5: every blend mode over a contrasting background ---------- */
  {
    const blendBlock = () => extraBlocks(section)[4];
    const blendSelect = () => q("select", blendBlock()).find((el: any) => [...el.querySelectorAll("option")].some((o: any) => o.value === "soft-light"));
    check("A5.1 blend style select offers all six modes", ["normal", "screen", "multiply", "overlay", "soft-light", "difference"].every((v) => blendSelect() && [...blendSelect().querySelectorAll("option")].some((o: any) => o.value === v)));
    const modes = ["normal", "screen", "multiply", "overlay", "soft-light", "difference"] as const;
    for (const mode of modes) {
      setSelect(blendSelect(), mode);
      await sleep(spacing);
      const inDraft = extrasOf(draft(caseId))[4].blendMode;
      const el = extraByLeft(previewRoot, LEFT.blend);
      const inDom = el ? blendOf(el) : "(missing)";
      check(
        `A5.2 blend ${mode}: draft + rendered over the contrasting plate`,
        (mode === "normal" ? inDraft === "normal" || inDraft === undefined : inDraft === mode) &&
          (mode === "normal" ? !inDom || inDom === "normal" : inDom === mode),
        { inDraft, inDom },
      );
    }
    // Distinct final modes across layers for the parity pass.
    const setBlend = async (blockIdx: number, mode: string) => {
      const sel = q("select", extraBlocks(section)[blockIdx]).find((el: any) => [...el.querySelectorAll("option")].some((o: any) => o.value === "soft-light"));
      setSelect(sel, mode);
      await sleep(spacing);
    };
    await setBlend(0, "multiply");
    await setBlend(4, "difference");
    await sleep(400);
    const finals = extrasOf(draft(caseId)).map((e) => e.blendMode ?? "normal");
    check("A5.3 final blend assignment across layers", finals.join(",") === "multiply,normal,normal,normal,difference", finals);
    sweepProblems("A5 blend modes");
  }

  /* ---------- A6: composite parity — Studio preview vs 🚶 Stage tab ---------- */
  let studioMap: Record<string, { blend: string; opacity: string; rotate: string }> = {};
  {
    // Parallax: master depth 40%, and the 1-frame sheet layer pinned to
    // depth 0 (so one layer demonstrably does NOT ride a plane).
    const parSection = await openSection(/🌆 Parallax depth/);
    check("A6.0a parallax section opens", !!parSection);
    if (parSection) {
      const master = q('input[type="range"]', parSection).find((r: any) => r.min === "0" && r.max === "1" && String(r.className).includes("accent-cyan"));
      check("A6.0b master depth slider present", !!master);
      if (master) {
        setRange(master, 0.4);
        await sleep(spacing);
        check("A6.0c parallaxDepth 40% persisted", cinOf(draft(caseId))?.parallaxDepth === 0.4, cinOf(draft(caseId))?.parallaxDepth);
      }
    }
    const oneBlock = extraBlocks(section)[1];
    const depthZero = q('input[type="range"]', oneBlock).find((r: any) => r.min === "0" && r.max === "1" && String(r.className).includes("accent-cyan"));
    if (depthZero) {
      setRange(depthZero, 0);
      await sleep(spacing);
    }
    check("A6.0d layer depth 0 authored (no plane for this one)", extrasOf(draft(caseId))[1].depth === undefined, extrasOf(draft(caseId))[1].depth);

    await sleep(500);
    for (const el of extraEls(previewRoot)) {
      const left = parseFloat((/left:\s*([\d.]+)%/.exec(styleOf(el)) || [])[1]);
      if (Number.isFinite(left)) studioMap[String(left)] = { blend: blendOf(el), opacity: opacityOf(el) ?? "1", rotate: rotateOf(el) ?? "0" };
    }
    check("A6.1 Studio preview renders 4 visible layers (hidden one absent)", Object.keys(studioMap).length === 4, Object.keys(studioMap));
    // Parallax planes in the Studio preview: depth>0 layers ride mid planes.
    const pMids = q("div", previewRoot).filter((el: any) => String(el.className).includes("parallax-mid"));
    check("A6.1b preview wraps the 3 depth layers as parallax planes", pMids.length === 3, pMids.length);
    const shifts = pMids.map((m: any) => (/--plane-shift:\s*([^;]+)/.exec(styleOf(m)) || [])[1]);
    check("A6.1c plane shift = 4 + depth×26 (authored depth)", shifts.every((v: string) => v === "19.6px"), shifts);
    if (process.env.FGB_DEBUG) console.log("A6.1d mids contain:", pMids.map((m: any) => q("div", m).map((d: any) => (styleOf(d).match(/left:\s*([\d.]+)%/) || [])[1]).filter(Boolean)));
    check("A6.1d the depth-0 layer rides no plane", !pMids.some((m: any) => extraByLeft(m, LEFT.one)), pMids.map((m: any) => !!extraByLeft(m, LEFT.one)));

    await tab("stage");
    const stagePreviewText = snap();
    check("A6.2 Stage tab shows the composite preview", /Stage composite preview/.test(stagePreviewText) && /Stage layer composite/.test(stagePreviewText));
    const stagePreview = q("div").find((el: any) => /Stage layer composite/.test(el.textContent || "") && String(el.className).includes("pointer-events-none"));
    const plate = stagePreview ? stagePreview.parentElement : null;
    let stageMap: Record<string, { blend: string; opacity: string; rotate: string }> = {};
    for (const el of extraEls(plate)) {
      const left = parseFloat((/left:\s*([\d.]+)%/.exec(styleOf(el)) || [])[1]);
      if (Number.isFinite(left)) stageMap[String(left)] = { blend: blendOf(el), opacity: opacityOf(el) ?? "1", rotate: rotateOf(el) ?? "0" };
    }
    check("A6.3 Stage tab renders the same 4 layers", Object.keys(stageMap).length === 4, Object.keys(stageMap));
    const same = Object.keys(studioMap).every((k) => stageMap[k] && JSON.stringify(studioMap[k]) === JSON.stringify(stageMap[k]));
    check("A6.4 per-layer blend/opacity/rotation identical across both views", same, { studioMap, stageMap });
    // Stage parity with PLAY: the game pins a stage plate still (the walker is
    // anchored to the art), so the composite preview must show no depth planes.
    const stageMids = q("div", plate).filter((el: any) => String(el.className).includes("parallax-mid"));
    check("A6.5 Stage tab pins parallax like the real stage (no planes)", stageMids.length === 0, stageMids.length);
    sweepProblems("A6 parity");
  }

  /* ---------- A7: undo/redo across layer edits and preset creation ---------- */
  {
    await tab("scene");
    const section7 = (await openSection(/Sprite sheet editor — foreground sprites/))!;
    const before = JSON.stringify(cinOf(draft(caseId)));
    // three edits, each its own undo step: unhide · reorder · preset creation
    const stack = layerStackOf(section7);
    const rows = () => stackRows(stack);
    if (process.env.FGB_DEBUG) console.log("A7 rows:", rows().length, "blocks:", extraBlocks(section7).length, "hidden:", extrasOf(draft(caseId)).map((e) => e.visible));
    q("button", rows()[2]).find((b: any) => /○/.test((b.textContent || "").trim()))?.click();
    const unhidden = await waitDraft(caseId, (d) => extrasOf(d)[2].visible !== false, 8000);
    const afterUnhide = JSON.stringify(cinOf(draft(caseId)));
    check("A7.1 edit 1 (unhide) landed", !!unhidden && afterUnhide !== before, extrasOf(draft(caseId)).map((e) => e.visible));
    q("button", extraBlocks(section7)[4]).find((b: any) => /↑ Back/.test(b.textContent || ""))?.click();
    const reordered = await waitDraft(caseId, (d) => extrasOf(d).map((e) => e.x).join(",") === [70, 12, 28, 58, 44].join(","), 8000);
    const afterReorder = JSON.stringify(cinOf(draft(caseId)));
    check("A7.2 edit 2 (reorder) landed", !!reordered && afterReorder !== afterUnhide, extrasOf(draft(caseId)).map((e) => e.x));
    byText(/Ping-pong/, "button", sheetAreaOf(extraBlocks(section7)[4]))?.click();
    const presetted = await waitDraft(
      caseId,
      (d) => JSON.stringify(extrasOf(d).find((e) => e.x === LEFT.many)?.sheet?.animations.loop?.frames) === "[0,1,2,3,2,1]",
      8000,
    );
    const afterPreset = JSON.stringify(cinOf(draft(caseId)));
    check("A7.3 edit 3 (Ping-pong preset creation) landed", !!presetted && afterPreset !== afterReorder, { afterReorder: JSON.parse(afterReorder).foregroundExtras.map((e: ForegroundExtra) => e.x), now: JSON.parse(afterPreset).foregroundExtras.map((e: ForegroundExtra) => e.x) });

    const undoBtn = () => q("button").find((el: any) => /↶ Undo/.test(el.textContent || "") && !el.disabled);
    const redoBtn = () => q("button").find((el: any) => /↷ Redo/.test(el.textContent || "") && !el.disabled);
    const reaches = (target: string) => waitDraft(caseId, (d) => JSON.stringify(cinOf(d)) === target, 8000);
    undoBtn()?.click();
    check("A7.4 undo 1 restores the pre-preset composite", await reaches(afterReorder), cinOf(draft(caseId))?.foregroundExtras?.map((e: ForegroundExtra) => e.x));
    undoBtn()?.click();
    check("A7.5 undo 2 restores the pre-reorder composite", await reaches(afterUnhide), cinOf(draft(caseId))?.foregroundExtras?.map((e: ForegroundExtra) => e.x));
    undoBtn()?.click();
    check("A7.6 undo 3 restores the original composite byte-exact (hidden layer back)", await reaches(before), cinOf(draft(caseId))?.foregroundExtras?.map((e: ForegroundExtra) => [e.x, e.visible]));
    redoBtn()?.click();
    await reaches(afterUnhide);
    redoBtn()?.click();
    await reaches(afterReorder);
    redoBtn()?.click();
    check("A7.7 redo replays every edit to the final composite", await reaches(afterPreset), cinOf(draft(caseId))?.foregroundExtras?.map((e: ForegroundExtra) => [e.x, e.visible]));
    sweepProblems("A7 undo/redo");
  }

  /* ---------- A8: export / import / reload ---------- */
  let exportJson = "";
  {
    // Let the autosave settle first — the export box and the draft must
    // describe the SAME commit before byte-comparing them.
    await sleep(1400);
    const exBtn = byText(/⤓ Export/);
    exBtn?.click();
    const ok = await waitFor(() => !!(doc.getElementById("reel-export-textarea") as any)?.value);
    await sleep(600);
    exportJson = (doc.getElementById("reel-export-textarea") as any)?.value ?? "";
    check("A8.1 export produced JSON", ok);
    if (ok) {
      const ex = JSON.parse(exportJson) as Story & { assets?: unknown[] };
      const exStage = ex.scenes.find((x) => x.id === stageSceneId);
      check("A8.2 export preserves foregroundExtras byte-exact", JSON.stringify(exStage?.cinematic?.foregroundExtras) === JSON.stringify(cinOf(draft(caseId))?.foregroundExtras), exStage?.cinematic?.foregroundExtras?.length);
      check("A8.3 export bundles the sheet assets (media envelope)", Array.isArray(ex.assets) && ex.assets.length >= 3, (ex.assets as any[])?.length);
      byText(/^✕$/, "button")?.click();
      await sleep(300);
    }

    // Import a marked copy — the foreground properties must ride along.
    if (exportJson) {
      const bundle = JSON.parse(exportJson) as Story;
      bundle.title = "Foreground Beta (imported)";
      const fileInput = q('input[type="file"]').find((el: any) => (el.getAttribute("accept") ?? "").includes("json"));
      check("A8.4 import file input present", !!fileInput);
      if (fileInput) {
        const file = new win.File([JSON.stringify(bundle)], "case.reel.json", { type: "application/json" });
        Object.defineProperty(fileInput, "files", { value: [file], configurable: true });
        fileInput.dispatchEvent(new win.Event("change", { bubbles: true }));
        const landed = await waitDraft(caseId, (d) => d.title === "Foreground Beta (imported)", 14000);
        check("A8.5 import landed", !!landed);
        check(
          "A8.6 import preserved every foreground property",
          !!landed && JSON.stringify(landed.scenes.find((x) => x.id === stageSceneId)?.cinematic?.foregroundExtras) === JSON.stringify(bundle.scenes.find((x) => x.id === stageSceneId)?.cinematic?.foregroundExtras),
          landed?.scenes.find((x) => x.id === stageSceneId)?.cinematic?.foregroundExtras?.length,
        );
      }
    }

    // Reload: unmount → remount reopens the same draft with the composite.
    const pre = JSON.stringify(cinOf(draft(caseId)));
    rootR.unmount();
    container.innerHTML = "";
    await sleep(400);
    rootR = mountFresh(container, { initialStoryId: caseId });
    const reopened = await waitDraft(caseId, (d) => !!cinOf(d), 12000);
    check("A8.7 reload reopens the same draft", !!reopened);
    check("A8.8 reload preserves the foreground composite byte-exact", !!reopened && JSON.stringify(cinOf(reopened)) === pre, cinOf(reopened)?.foregroundExtras?.map((e) => e.x));
    await sleep(600);
    check("A8.9 no crash after reload", !crashed());
    sweepProblems("A8 persistence");
  }
}

/* ================================================================
 * PART B — THE GAME (real <GamePlayer>, fed Part A's authored draft)
 * ================================================================ */
const GRAD = "gradient:linear-gradient(160deg,#101018 0%,#1c1424 60%,#050508 100%)";

async function partB() {
  const authored = draft(caseId);
  if (!authored) {
    check("B0 authored draft available for playback", false);
    return;
  }
  const stageScene = authored.scenes.find((x) => x.id === stageSceneId)!;
  // The author's final publish state, as it rode through export/import/reload:
  // the 2-frame sheet layer is left HIDDEN (toggled in the layer stack), so
  // the runtime composite carries every authored foreground property —
  // sheets, blends, opacity, rotation, depths, occlusion, the loop:false flag.
  const authoredExtras = (stageScene.cinematic?.foregroundExtras ?? []).map((e: ForegroundExtra) =>
    e.x === LEFT.two ? { ...e, visible: false } : e,
  );
  const cinematic = { ...(stageScene.cinematic ?? {}), foregroundExtras: authoredExtras };
  const expectVisible = authoredExtras.filter((e) => e.visible !== false);
  check("B0.1 runtime composite fixture (4 visible of 5)", expectVisible.length === 4, authoredExtras.map((e) => [e.x, e.visible]));

  const mkStage = (id: string, opts: { hold?: boolean } = {}): SceneNode =>
    ({
      ...stageScene,
      id,
      title: id === "fgx_hold" ? "The Hold Room" : "The Composite Room",
      background: stageScene.background,
      cinematic,
      prose: "",
      choices: [],
      dialogueBeats: [],
      stage: {
        ...stageScene.stage,
        playerImage: "emoji:🕵️",
        spawn: { x: 50, y: 88 },
        speed: 40,
        reach: 6,
        keyboard: true,
        floor: { top: 62, bottom: 94 },
        objectVerbMenu: true,
        ...(opts.hold ? { objectMenuHold: true } : {}),
        enterCaption: undefined,
      },
      hotspots:
        id === "fgx_hold"
          ? [
              {
                id: "fgx_poster",
                label: "the poster",
                bounds: { x: 66, y: 40, w: 14, h: 16 },
                cursor: "look",
                remote: true,
                verbs: {
                  look: { type: "showText", text: "POSTER-LOOK: JAZZ NIGHT — two dollars at the door." },
                  talk: { type: "showText", text: "POSTER-TALK: the paper stays quiet." },
                },
                action: { type: "showText", text: "POSTER-LOOK: JAZZ NIGHT — two dollars at the door." },
              },
            ]
          : [
              {
                id: "fgx_bell",
                label: "the desk bell",
                bounds: { x: 16, y: 66, w: 9, h: 10 },
                cursor: "look",
                remote: true,
                verbs: { look: { type: "showText", text: "BELL-LOOK: brass, dented by a hundred knuckles." } },
                action: { type: "showText", text: "BELL-LOOK: brass, dented by a hundred knuckles." },
              },
              {
                id: "fgx_radio",
                label: "the radio",
                bounds: { x: 76, y: 64, w: 11, h: 12 },
                cursor: "look",
                remote: true,
                verbs: {
                  look: { type: "showText", text: "RADIO-LOOK: a philco, still warm." },
                  take: { type: "giveItem", itemGranted: "fgx_coin" },
                },
                action: { type: "showText", text: "RADIO-LOOK: a philco, still warm." },
              },
              {
                id: "fgx_mug",
                label: "the coffee mug",
                bounds: { x: 42, y: 70, w: 8, h: 9 },
                cursor: "look",
                remote: true,
                verbs: {
                  look: { type: "showText", text: "MUG-LOOK: cold, half-finished." },
                  use: { type: "showText", text: "MUG-COIN: the coin rings against the ceramic." },
                },
                acceptsItems: ["fgx_coin"],
                action: { type: "showText", text: "MUG-LOOK: cold, half-finished." },
              },
            ],
    }) as SceneNode;

  const runtime: Story = {
    ...authored,
    id: "fg-beta-runtime",
    title: "Foreground Beta Runtime",
    startSceneId: "fgx_stage",
    layout: {},
    items: [{ id: "fgx_coin", name: "Lucky dollar", icon: "🪙", description: "Found in the radio.", flavorText: "Heads, anyway." }],
    characters: [{ id: "fgx_ash", name: "Ash", role: "The walker", avatarUrl: "emoji:🕵️", trustMeter: 0 }],
    scenes: [
      mkStage("fgx_stage"),
      mkStage("fgx_hold", { hold: true }),
      {
        id: "fgx_room",
        title: "The Same Composite (novel)",
        background: stageScene.background,
        cinematic,
        prose: "The novel view of the same room.",
        choices: [{ id: "c_end", text: "Done", targetSceneId: "fgx_end" }],
        dialogueBeats: [],
      } as SceneNode,
      { id: "fgx_end", title: "The End", background: GRAD, isEnding: true, prose: "That is all.", choices: [], dialogueBeats: [] } as SceneNode,
    ],
  };

  // Fresh player storage for the runtime mounts (the AUTHOR's draft was
  // already re-verified in A8 — B only needs the in-memory copy).
  rootR?.unmount();
  container.innerHTML = "";
  try {
    win.localStorage.clear();
    win.sessionStorage.clear();
  } catch {}

  const { createRoot: cr2 } = await import("react-dom/client");
  const React2 = await import("react");
  let root2: Root | null = null;
  const mountGame = async (story: Story, fromSceneId?: string) => {
    root2?.unmount();
    container.innerHTML = "";
    root2 = cr2(container);
    root2.render(
      React2.createElement(
        StrictMode,
        null,
        React2.createElement(ErrorBoundary, null, React2.createElement(GamePlayer, {
          story,
          typeSpeed: 34,
          isNewGamePlus: false,
          onExit: () => {},
          ...(fromSceneId ? { playFromSceneId: fromSceneId } : {}),
        } as any)),
      ),
    );
    await sleep(1500);
  };
  const text = () => (container.textContent || "").replace(/\s+/g, " ");
  const marker = (id: string) => container.querySelector(`.stage-marker[data-hs-id="${id}"]`) as any;
  const playerEl = () => container.querySelector("[data-stage-player]") as any;
  const playerY = () => {
    const el = playerEl();
    const m = /top:\s*([\d.]+)%/.exec(styleOf(el));
    return m ? parseFloat(m[1]) : NaN;
  };
  const key = (k: string) => win.dispatchEvent(new win.KeyboardEvent("keydown", { key: k, code: k, bubbles: true }));
  const keyUp = (k: string) => win.dispatchEvent(new win.KeyboardEvent("keyup", { key: k, bubbles: true }));
  async function holdKey(k: string, ms: number) {
    key(k);
    const t0 = Date.now();
    while (Date.now() - t0 < ms) await sleep(60);
    keyUp(k);
  }

  /* ---------- B1: the same composite, in actual game playback ---------- */
  await mountGame(runtime);
  check("B1.1 game booted into the stage room without a crash", !crashed() && !!playerEl(), snap().slice(0, 160));
  // The walk-behind pass treats the walker as "behind" until the first
  // position report lands — wait for the composite to settle to the
  // authored arrangement (spawn is BELOW the depth line, occluder normal).
  const frontWrapper0 = () => q("div", container).find((el: any) => String(el.className).includes("z-[58]"));
  const settled = await waitFor(() => !(frontWrapper0() && extraByLeft(frontWrapper0(), LEFT.occluder)), 6000, 150);
  check("B1.1b composite settled after boot (spawn in front of the occluder)", settled, snap().slice(0, 120));
  const gameMap: Record<string, { blend: string; opacity: string; rotate: string }> = {};
  const gameOrder: string[] = []; // Object.keys() would numerically sort these
  for (const el of extraEls(container)) {
    const left = parseFloat((/left:\s*([\d.]+)%/.exec(styleOf(el)) || [])[1]);
    if (Number.isFinite(left)) {
      gameMap[String(left)] = { blend: blendOf(el), opacity: opacityOf(el) ?? "1", rotate: rotateOf(el) ?? "0" };
      gameOrder.push(String(left));
    }
  }
  if (process.env.FGB_DEBUG)
    console.log(
      "B1.2 DOM order:",
      extraEls(container).map((el: any) => ({
        left: (styleOf(el).match(/left:\s*([\d.]+)%/) || [])[1],
        parent: String(el.parentElement?.className).slice(0, 40),
        grand: String(el.parentElement?.parentElement?.className).slice(0, 40),
      })),
    );
  check(
    "B1.2 game renders exactly the visible layers, in authored order",
    gameOrder.join(",") === expectVisible.map((e) => String(e.x)).join(","),
    { rendered: gameOrder, want: expectVisible.map((e) => e.x) },
  );
  check(
    "B1.3 hidden layer absent in game too",
    !Object.keys(gameMap).some((k) => Math.abs(parseFloat(k) - LEFT.two) < 0.6),
    Object.keys(gameMap),
  );
  const bBlend = extraByLeft(container, LEFT.blend);
  check("B1.4 blend layer carries difference + rotate(90deg) + opacity .5", bBlend && blendOf(bBlend) === "difference" && rotateOf(bBlend) === "90" && opacityOf(bBlend) === "0.5", bBlend && styleOf(bBlend));
  const bOcc = extraByLeft(container, LEFT.occluder);
  check("B1.5 occluder layer keeps its multiply blend + opacity .75", bOcc && blendOf(bOcc) === "multiply" && opacityOf(bOcc) === "0.75", bOcc && styleOf(bOcc));

  /* ---------- B2: sheet layers animate in play ---------- */
  {
    const sprite = extraByLeft(container, LEFT.many)?.querySelector("div");
    check("B2.1 animated sheet layer rendered by SheetSprite", !!sprite && /background-image/.test(styleOf(sprite)), sprite && styleOf(sprite));
    const posAt = () => ((/background-position:\s*([^;]+)/.exec(styleOf(sprite)) || [])[1] ?? "");
    const samples = new Set<string>();
    for (let i = 0; i < 6; i++) {
      samples.add(posAt());
      await sleep(220);
    }
    check("B2.2 the sheet steps through frames while playing", samples.size >= 2, [...samples]);
  }

  /* ---------- B3: parallax on a stage is PINNED (plate still, no planes) ---------- */
  {
    // The game pins a 🚶 stage's plate still — the walker, markers and
    // barriers are anchored to the art — so the authored depth planes must
    // NOT run here (exactly what the Stage-tab preview now mirrors).
    const mids = q("div", container).filter((el: any) => String(el.className).includes("parallax-mid"));
    const plate = q("div", container).find((el: any) => String(el.className).includes("parallax-plate"));
    const fg = q("div", container).find((el: any) => String(el.className).includes("parallax-fg"));
    check("B3.1 stage playback pins parallax (no depth planes over the walker)", mids.length === 0, mids.length);
    check("B3.2 stage plate renders static (no parallax-plate / parallax-fg)", !plate && !fg, { plate: !!plate, fg: !!fg });
  }

  /* ---------- B4: walk-behind occlusion with a moving actor ---------- */
  {
    // The occluder must be flagged; if Part A left it unflagged this fails
    // loudly (that was item 4/7 authoring).
    const occluder = cinematic?.foregroundExtras?.find((e) => e.occludes);
    check("B4.1 an occludes layer exists in the authored composite", !!occluder, cinematic?.foregroundExtras?.map((e) => e.occludes));
    if (occluder) {
      const frontWrapper = () => q("div", container).find((el: any) => String(el.className).includes("z-[58]"));
      const occluderInFrontPass = () => {
        const w = frontWrapper();
        return !!(w && extraByLeft(w, LEFT.occluder));
      };
      await sleep(600);
      check("B4.2 walker in front (below the line): occluder drawn in the normal pass", !occluderInFrontPass(), { y: playerY(), front: !!frontWrapper() });
      // walk UP past the baseline (occludeBaseline 80)
      await holdKey("ArrowUp", 2600);
      const behind = await waitFor(() => {
        return playerY() < 79 && occluderInFrontPass();
      }, 6000, 150);
      check("B4.3 walker behind (above the line): occluder drawn OVER the player", behind, { y: playerY() });
      if (behind) {
        const player = playerEl();
        const occEl = extraByLeft(frontWrapper(), LEFT.occluder);
        const occludesAfter = !!(player && occEl && (occEl.compareDocumentPosition(player) & 2 /* PRECEDING: player before occluder → occluder paints on top */));
        check("B4.4 the occluder element paints after (over) the walker", occludesAfter, { y: playerY() });
      }
      await holdKey("ArrowDown", 2600);
      const inFrontAgain = await waitFor(() => {
        return playerY() > 82 && !occluderInFrontPass();
      }, 6000, 150);
      check("B4.5 stepping back below the line returns the occluder behind", inFrontAgain, { y: playerY() });
    }
  }

  /* ---------- B5: the skull-pie / object-first verb menu ---------- */
  {
    // The room's objects: bell (look), radio (look+take), mug (look+use w/ item).
    const bell = marker("fgx_bell");
    const radio = marker("fgx_radio");
    const mug = marker("fgx_mug");
    check("B5.1 stage markers present", !!bell && !!radio && !!mug, [!!bell, !!radio, !!mug]);

    const pieButtons = () => q("button", container).filter((b: any) => ["Look at", "Pick up", "Use", "Talk to"].includes(b.getAttribute("aria-label") || ""));
    bell?.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    await sleep(400);
    let pie = pieButtons();
    check("B5.2 clicking the object opens its verb pie", pie.length === 1 && pie[0].getAttribute("aria-label") === "Look at", pie.map((b: any) => b.getAttribute("aria-label")));
    // switching objects without firing: the menu follows the NEW object
    radio?.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    await sleep(400);
    pie = pieButtons();
    check("B5.3 clicking a second object swaps the pie to ITS verbs", pie.length === 2 && pie.some((b: any) => b.getAttribute("aria-label") === "Pick up"), pie.map((b: any) => b.getAttribute("aria-label")));
    pie.find((b: any) => b.getAttribute("aria-label") === "Look at")?.click();
    const radioLook = await waitFor(() => /RADIO-LOOK/.test(text()), 9000);
    check("B5.4 the pie acted on the RIGHT object (RADIO, not BELL)", radioLook && !/BELL-LOOK/.test(text()), text().slice(0, 200));
    await sleep(400);
    // bell direct look
    bell?.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    await sleep(400);
    pieButtons().find((b: any) => b.getAttribute("aria-label") === "Look at")?.click();
    const bellLook = await waitFor(() => /BELL-LOOK/.test(text()), 9000);
    check("B5.5 the bell's own pie fires the bell's line", bellLook, text().slice(0, 200));

    // USE with an item: take the coin from the radio, then use it on the mug.
    radio?.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    await sleep(400);
    pieButtons().find((b: any) => b.getAttribute("aria-label") === "Pick up")?.click();
    const gotCoin = await waitFor(() => /Lucky dollar/.test(text()), 9000);
    check("B5.6 Pick up granted the item (inventory chip visible)", gotCoin, text().slice(0, 160));
    await sleep(500);
    mug?.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    await sleep(400);
    const useBtn = pieButtons().find((b: any) => b.getAttribute("aria-label") === "Use");
    check("B5.7 the mug's pie offers Use (it accepts items)", !!useBtn, pieButtons().map((b: any) => b.getAttribute("aria-label")));
    useBtn?.click();
    await sleep(400);
    const coinBtn = q("button", container).find((b: any) => /Lucky dollar/.test(b.textContent || ""));
    check("B5.8 USE expands to the inventory", !!coinBtn);
    coinBtn?.click();
    const used = await waitFor(() => /MUG-COIN/.test(text()), 9000);
    check("B5.9 using the item fired the mug's USE line", used, text().slice(0, 200));

    /* ---- the HOLD-TO-OPEN skull pie (big, centre-screen) ---- */
    await mountGame(runtime, "fgx_hold");
    const poster = marker("fgx_poster");
    check("B5.10 hold room mounted with its poster", !!poster && !!playerEl(), snap().slice(0, 140));
    const pieVerbEls = () => q("[data-pie-verb]", container);
    poster?.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: 700, clientY: 300 }));
    await sleep(520); // > PIE_HOLD_MS (320)
    const verbs = pieVerbEls();
    check("B5.11 holding the object opens the big skull pie", verbs.length === 2, verbs.map((v: any) => v.getAttribute("data-pie-verb")));
    // hover a verb sector geometrically (centre = innerWidth/2, innerHeight/2)
    const cx = win.innerWidth / 2;
    const cy = win.innerHeight / 2;
    const names = verbs.map((v: any) => v.getAttribute("data-pie-verb"));
    const idxLook = names.indexOf("look");
    const sector = 360 / names.length;
    // Verb k renders AT angle k*sector - 90 (0 = up); hover exactly there.
    const ang = ((idxLook * sector - 90) * Math.PI) / 180;
    win.dispatchEvent(new win.PointerEvent("pointermove", { clientX: cx + 140 * Math.cos(ang), clientY: cy + 140 * Math.sin(ang), bubbles: true }));
    await sleep(300);
    const hovered = q("[data-pie-verb]", container).find((v: any) => String(v.className).includes("scale-110"));
    check("B5.12 the sector under the pointer highlights", hovered && hovered.getAttribute("data-pie-verb") === "look", hovered && hovered.getAttribute("data-pie-verb"));
    win.dispatchEvent(new win.PointerEvent("pointerup", { clientX: cx + 140 * Math.cos(ang), clientY: cy + 140 * Math.sin(ang), bubbles: true }));
    const posterLook = await waitFor(() => /POSTER-LOOK/.test(text()), 9000);
    check("B5.13 releasing on the verb acts on the held object", posterLook, text().slice(0, 200));
    // releasing on the skull cancels
    await sleep(600);
    poster?.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: 700, clientY: 300 }));
    await sleep(520);
    win.dispatchEvent(new win.PointerEvent("pointermove", { clientX: cx, clientY: cy, bubbles: true }));
    await sleep(200);
    win.dispatchEvent(new win.PointerEvent("pointerup", { clientX: cx, clientY: cy, bubbles: true }));
    await sleep(800);
    check("B5.14 releasing on the skull cancels (no action, pie closed)", !/POSTER-TALK/.test(text()) && pieVerbEls().length === 0, text().slice(0, 160));
    sweepProblems("B5 verb menu");
  }

  /* ---------- B6: the same composite on a classic dialogue scene ---------- */
  {
    await mountGame(runtime, "fgx_room");
    await sleep(800);
    const novelMap: Record<string, { blend: string; opacity: string; rotate: string }> = {};
    const novelOrder: string[] = [];
    for (const el of extraEls(container)) {
      const left = parseFloat((/left:\s*([\d.]+)%/.exec(styleOf(el)) || [])[1]);
      if (Number.isFinite(left)) {
        novelMap[String(left)] = { blend: blendOf(el), opacity: opacityOf(el) ?? "1", rotate: rotateOf(el) ?? "0" };
        novelOrder.push(String(left));
      }
    }
    check(
      "B6.1 classic scene renders the same visible layers",
      novelOrder.join(",") === gameOrder.join(","),
      { novel: novelOrder, stage: gameOrder },
    );
    const same = Object.keys(gameMap).every((k) => novelMap[k] && JSON.stringify(gameMap[k]) === JSON.stringify(novelMap[k]));
    check("B6.2 classic-scene composite identical to the stage composite", same, { gameMap, novelMap });
    check("B6.3 the prose panel is present (novel view intact)", /The novel view/.test(text()), text().slice(0, 120));
    // Parallax RUNS on a classic scene: plate + fg wrapper + authored depth
    // planes (the 3 depth>0 layers ride mid planes; the depth-0 layer walks).
    const plate = q("div", container).find((el: any) => String(el.className).includes("parallax-plate"));
    const fgWrap = q("div", container).find((el: any) => String(el.className).includes("parallax-fg"));
    check("B6.4 classic plate + foreground wrapper parallax", !!plate && !!fgWrap, { plate: !!plate, fg: !!fgWrap });
    const mids = q("div", container).filter((el: any) => String(el.className).includes("parallax-mid"));
    check("B6.5 the 3 authored depth layers ride parallax planes", mids.length === 3, mids.length);
    const shifts = mids.map((m: any) => (/--plane-shift:\s*([^;]+)/.exec(styleOf(m)) || [])[1]);
    check("B6.6 plane shift derives from authored depth (19.6px)", shifts.every((v: string) => v === "19.6px"), shifts);
    check("B6.7 the depth-0 layer rides no plane", !mids.some((m: any) => extraByLeft(m, LEFT.one)), mids.map((m: any) => !!extraByLeft(m, LEFT.one)));
    sweepProblems("B6 novel parity");
  }

  root2?.unmount();
}
