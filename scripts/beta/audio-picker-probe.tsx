/**
 * AUDIO PICKER BETA PROBE — mounts the REAL <AudioPicker/> (the box the beat's
 * "🔊 Sound effect on this beat" field uses) and the REAL <AmbientLayers/> (the
 * scene's "Ambient loop" field, which adds recorded loops through the same box)
 * and drives what they promise:
 *
 *   A — the list: every sound the project ships, sectioned, filtered, windowed,
 *       auditioned on hover, Enter-to-take, upload-into-the-box, drop-a-file,
 *       clearing, and a path the scan does not know still being usable;
 *   B — the ambient field: adding a recorded loop keeps the synth preset,
 *       labels it, tests it, removes just that loop.
 *
 * The list under test is the repo's own: the harness bakes
 * tools/builtin-audio.mjs's scan into the bundle and passes counts and real
 * file names in as defines (__FILM_SFX_COUNT__ etc.), so every count below is a
 * statement about what is on disk, not about a stub.
 */
import { createRoot, type Root } from "react-dom/client";
import { useState } from "react";
import { AudioPicker } from "AUDIO_PICKER_PATH";
import { AmbientLayers } from "AMBIENT_PATH";
import { loadAllAssets, loadAssets, type MediaAsset } from "MEDIA_PATH";

declare const __AUDIO_COUNT__: number;
declare const __FILM_SFX_COUNT__: number;
declare const __FILM_MUSIC_COUNT__: number;
declare const __FILM_SFX_SECTION__: string;
declare const __CROSSING__: string;
declare const __CROSSING_LABEL__: string;
declare const __AMB_HIVE__: string;
declare const __AMB_HIVE_LABEL__: string;
declare const __TITLE_SONG__: string;
declare const __TITLE_SONG_LABEL__: string;

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
/** The picker's trigger. Not "the first button": the ambient field renders a
 *  ▶ per recorded loop before the adder, so find it by what it is. */
const browseTriggerOf = (sel: string): any =>
  win.document.querySelector(`${sel} button[aria-label$="browse every sound"]`) ?? win.document.querySelector(`${sel} button`);
const wrapOf = (sel: string): any => win.document.querySelector(`${sel} > div`);
const triggerOf = (sel: string): any => win.document.querySelector(`${sel} button`);
const textOf = (el: any): string => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
const rowsOf = (panel: any): any[] => [...(panel?.querySelectorAll("button") ?? [])];
const rowNamed = (panel: any, name: string): any => rowsOf(panel).find((b) => textOf(b).includes(name));
const allText = () => (win.document.body.textContent ?? "").replace(/\s+/g, " ");
/** The picker's one shared audition element (inside the box's wrapper). */
const playerOf = (sel: string): any => win.document.querySelector(`${sel} audio`);

async function openPicker(sel: string) {
  browseTriggerOf(sel)?.click();
  await waitFor(() => !!panelOf(sel));
}

async function closePicker(sel: string) {
  browseTriggerOf(sel)?.click();
  await waitFor(() => !panelOf(sel));
}

/** happy-dom needs the native setter for React-controlled inputs. */
function setInput(el: any, value: string) {
  const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")!.set;
  setter.call(el, value);
  el.dispatchEvent(new win.Event("input", { bubbles: true }));
}

const filterOf = (panel: any): any => panel.querySelector('input:not([type="file"]):not([type="checkbox"])');

const wavFile = (name: string) =>
  new win.File([new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0])], name, { type: "audio/wav" });

async function feedFile(sel: string, file: any) {
  const panel = panelOf(sel);
  const input = panel?.querySelector('input[type="file"]');
  if (!input) return false;
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  input.dispatchEvent(new win.Event("change", { bubbles: true }));
  await waitFor(async () => (await loadAllAssets("audio")).some((a) => a.name === file.name));
  return true;
}

async function dropFile(sel: string, file: any) {
  const wrapper = wrapOf(sel);
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
  await waitFor(async () => (await loadAllAssets("audio")).some((a) => a.name === file.name));
  return hot;
}

/** The boxes the probe mounts: a beat's sound effect (with a real film sfx),
 *  a loop-adder for a scene's ambience, and a pick-only box. */
let sfxValue: string | undefined = __CROSSING__;
let sfxVolume = 0.6;
let ambientValue: string | undefined = "rain+file:/film/sfx/amb-city-traffic.mp3";
let freshValue: string | undefined;

function App() {
  const [, force] = useState(0);
  const bump = () => force((n) => n + 1);
  return (
    <div>
      <div className="p-sfx">
        <AudioPicker
          storyId="case-a"
          label="Sound effect for beat b1"
          placeholder="/film/sfx/… — browse every sound, or upload"
          uploadFolder="sound effects"
          value={sfxValue}
          testVolume={sfxVolume}
          resolve={(v) => v}
          onChange={(v) => { sfxValue = v; bump(); }}
        />
      </div>
      <div className="p-ambient">
        <AmbientLayers
          storyId="case-a"
          value={ambientValue}
          media={(v) => v}
          onChange={(v) => { ambientValue = v; bump(); }}
        />
      </div>
      <div className="p-fresh">
        <AudioPicker storyId="case-a" placeholder="fresh…" value={freshValue} onChange={(v) => { freshValue = v; bump(); }} />
      </div>
    </div>
  );
}

export async function run({ doc, container }: Ctx) {
  win = globalThis.window as any;

  root = createRoot(container);
  root.render(<App />);
  await waitFor(() => !!triggerOf(".p-sfx"));

  console.log("\n=== A · THE BOX LISTS EVERY SOUND THERE IS ===");
  check(
    `A0 the repo's own scan carries the film's sounds (${__FILM_SFX_COUNT__} in film/sfx, ${__FILM_MUSIC_COUNT__} cues)`,
    __FILM_SFX_COUNT__ >= 100 && __FILM_MUSIC_COUNT__ >= 10,
    { sfx: __FILM_SFX_COUNT__, music: __FILM_MUSIC_COUNT__ },
  );
  check("A1 the beat's sound box mounts and shows the sound it is set to", textOf(triggerOf(".p-sfx")).includes(__CROSSING_LABEL__), textOf(triggerOf(".p-sfx")));
  check("A2 …and names the folder it came from, not just the file", textOf(triggerOf(".p-sfx")).includes("film/sfx"), textOf(triggerOf(".p-sfx")));

  await openPicker(".p-sfx");
  const panel = panelOf(".p-sfx");
  const placeholder = filterOf(panel)?.placeholder ?? "";
  check("A3 the panel opens with a filter counting every sound available", /Filter \d+ sounds/.test(placeholder), placeholder);
  check(
    "A4 …and that count is the whole library, not just the uploads",
    new RegExp(`Filter ${__AUDIO_COUNT__} sounds`).test(placeholder),
    placeholder,
  );
  check(
    `A5 the film's own one-shots are listed, under their own heading`,
    !!rowNamed(panel, __CROSSING_LABEL__) && textOf(panel).includes(__FILM_SFX_SECTION__),
    textOf(panel).slice(0, 200),
  );
  const panelText = textOf(panel);
  check(
    "A6 …and that heading comes before the sounds themselves",
    panelText.indexOf(__FILM_SFX_SECTION__) >= 0 && panelText.indexOf(__FILM_SFX_SECTION__) < panelText.indexOf(__CROSSING_LABEL__),
    panelText.slice(0, 200),
  );
  const windowed = /Showing \d+ of \d+/.test(panelText) && /Show all \d+/.test(panelText);
  check(`A7 a ${__AUDIO_COUNT__}-sound list opens as a window, not the whole library`, windowed, panelText.slice(-160));
  check("A8 the field's current sound is marked as the picked one", /✓/.test(textOf(rowNamed(panel, __CROSSING_LABEL__))));

  const filter = filterOf(panel);
  setInput(filter, "crossing");
  await waitFor(() => !!rowNamed(panelOf(".p-sfx"), __CROSSING_LABEL__));
  const narrowed = rowsOf(panelOf(".p-sfx")).filter((b: any) => /min-w-0 flex-1 truncate/.test(b.innerHTML)).length;
  check("A9 filtering narrows the list to the sound you mean", narrowed > 0 && narrowed < 20, narrowed);
  setInput(panelOf(".p-sfx").querySelector('input:not([type="file"]):not([type="checkbox"])'), "title-song");
  await waitFor(() => !!rowNamed(panelOf(".p-sfx"), __TITLE_SONG_LABEL__));
  filterOf(panelOf(".p-sfx")).dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await waitFor(() => sfxValue === __TITLE_SONG__);
  check("A10 Enter takes the first match and closes the box", sfxValue === __TITLE_SONG__, sfxValue);
  check("A11 the trigger then shows the new sound", textOf(triggerOf(".p-sfx")).includes(__TITLE_SONG_LABEL__), textOf(triggerOf(".p-sfx")));

  await openPicker(".p-sfx");
  const longPanel = panelOf(".p-sfx");
  setInput(filterOf(longPanel), "");
  await waitFor(() => /Showing \d+ of \d+/.test(textOf(panelOf(".p-sfx"))));
  const rowsBefore = rowsOf(panelOf(".p-sfx")).length;
  [...rowsOf(panelOf(".p-sfx"))].find((b) => /^Show all \d+$/.test(textOf(b)))?.click();
  await waitFor(() => rowsOf(panelOf(".p-sfx")).length > rowsBefore);
  check("A12 “Show all” really does list the rest", rowsOf(panelOf(".p-sfx")).length > rowsBefore, { rowsBefore, after: rowsOf(panelOf(".p-sfx")).length });

  // Auditioning: point at a row and it plays through the box's own player.
  const target = rowNamed(panelOf(".p-sfx"), __AMB_HIVE_LABEL__) ?? rowNamed(panelOf(".p-sfx"), __CROSSING_LABEL__);
  target.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }));
  await waitFor(() => (playerOf(".p-sfx")?.getAttribute("src") ?? "").includes("amb-hive"));
  const src = playerOf(".p-sfx")?.getAttribute("src") ?? "";
  check("A13 pointing at a sound loads it into the box's own player", src.includes("amb-hive"), src);
  await waitFor(() => /♪/.test(textOf(rowNamed(panelOf(".p-sfx"), __AMB_HIVE_LABEL__))));
  check("A14 …and the row says which one is playing", /♪/.test(textOf(rowNamed(panelOf(".p-sfx"), __AMB_HIVE_LABEL__))), textOf(rowNamed(panelOf(".p-sfx"), __AMB_HIVE_LABEL__)));
  // React derives onMouseLeave from a mouseout whose relatedTarget is outside
  // the element — dispatch what a browser would send, not a bare mouseleave.
  const list = panelOf(".p-sfx").querySelector(".max-h-72");
  list.dispatchEvent(new win.MouseEvent("mouseout", { bubbles: true, relatedTarget: win.document.body }));
  await waitFor(() => !/♪/.test(textOf(panelOf(".p-sfx"))));
  check("A15 leaving the list stops the audition", !/♪/.test(textOf(panelOf(".p-sfx"))));

  // A path the scan does not know stays usable (the old box accepted one).
  setInput(filterOf(panelOf(".p-sfx")), "https://example.test/boom.mp3");
  await waitFor(() => /Use “https:\/\/example.test\/boom.mp3” as it is/.test(allText()));
  filterOf(panelOf(".p-sfx")).dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await waitFor(() => sfxValue === "https://example.test/boom.mp3");
  check("A16 a path or URL the scan does not have can still be taken verbatim", sfxValue === "https://example.test/boom.mp3", sfxValue);
  check("A17 an unknown value is still shown honestly on the trigger", textOf(triggerOf(".p-sfx")).includes("boom.mp3"), textOf(triggerOf(".p-sfx")));

  console.log("\n=== B · UPLOADING FROM THE BOX ===");
  await openPicker(".p-fresh");
  const ok = await feedFile(".p-fresh", wavFile("hive-hum.wav"));
  await closePicker(".p-fresh");
  // Filed uploads are the beat box's job: it is the field that asks for a folder.
  await openPicker(".p-sfx");
  check("B0 the beat box takes an upload too", await feedFile(".p-sfx", wavFile("shot-tail.wav")));
  check("B1 the upload row takes a file", ok);
  const assets: MediaAsset[] = await loadAllAssets("audio");
  const uploaded = assets.find((a) => a.name === "hive-hum.wav");
  check("B2 the sound really landed in the library", !!uploaded, assets.map((a) => a.name));
  check("B3 …and is picked into the field", !!uploaded && freshValue === `asset:${uploaded.id}`, { freshValue, id: uploaded?.id });
  const filed = (await loadAllAssets("audio")).find((a) => a.name === "shot-tail.wav");
  check("B4 …and filed under the folder the field asked for", filed?.folder === "sound effects", filed?.folder);
  const sfxPanel = panelOf(".p-sfx");
  await waitFor(() => !!rowNamed(sfxPanel, "shot-tail.wav"));
  const uploadRows = rowsOf(sfxPanel).filter((b: any) => textOf(b).includes("shot-tail.wav"));
  check("B5 the new sound is listed under “Your uploads”", uploadRows.length > 0, textOf(sfxPanel).slice(0, 120));
  check(
    "B6 …above the built-in library, not buried under it",
    rowsOf(sfxPanel).indexOf(uploadRows[0]) < rowsOf(sfxPanel).findIndex((b: any) => textOf(b).includes(__CROSSING_LABEL__)),
    { upload: rowsOf(sfxPanel).indexOf(uploadRows[0]), builtin: rowsOf(sfxPanel).findIndex((b: any) => textOf(b).includes(__CROSSING_LABEL__)) },
  );
  const refused = await feedFile(".p-sfx", new win.File(["not audio"], "notes.txt", { type: "text/plain" }));
  await waitFor(() => /✕/.test(textOf(panelOf(".p-sfx"))));
  check("B7 a non-audio file is refused in the box, not silently kept", refused && /✕/.test(textOf(panelOf(".p-sfx"))), textOf(panelOf(".p-sfx")).slice(-120));
  check("B8 …and the field is untouched by the refusal", sfxValue === `asset:${filed?.id}`, sfxValue);
  await closePicker(".p-sfx");

  const hot = await dropFile(".p-fresh", wavFile("drop-hum.wav"));
  check("B9 dropping a file on the box highlights it", hot);
  const dropped = (await loadAllAssets("audio")).find((a) => a.name === "drop-hum.wav");
  check("B10 dropping a file uploads and picks it", !!dropped && freshValue === `asset:${dropped.id}`, { freshValue, dropped: dropped?.id });
  const cleared = triggerOf(".p-fresh");
  const clearBtn = [...win.document.querySelectorAll(".p-fresh button")].find((b: any) => textOf(b) === "✕");
  clearBtn?.click();
  await waitFor(() => !freshValue);
  check("B11 ✕ clears the field", !freshValue, freshValue);
  check("B12 …and the trigger goes back to its placeholder", /fresh…/.test(textOf(triggerOf(".p-fresh"))), textOf(triggerOf(".p-fresh")));

  console.log("\n=== C · THE SCENE'S AMBIENT LOOP ===");
  const amb = () => win.document.querySelector(".p-ambient")!;
  check("C1 the ambient field still offers the synth presets", !!amb().querySelector("select"), textOf(amb()).slice(0, 80));
  check("C2 …and the recorded loop the scene already had", textOf(amb()).includes("amb-city-traffic"), textOf(amb()).slice(0, 200));
  check(
    "C3 the loop-adder browses every sound too",
    !!browseTriggerOf(".p-ambient") && textOf(browseTriggerOf(".p-ambient")).includes("Add a recorded loop"),
    textOf(browseTriggerOf(".p-ambient")),
  );
  await openPicker(".p-ambient");
  const ambPanel = panelOf(".p-ambient");
  check("C4 it lists the film's own ambience", !!rowNamed(ambPanel, __AMB_HIVE_LABEL__), textOf(ambPanel).slice(0, 200));
  check("C5 …with no upload row of its own (the field has its own button)", !/⇧ Upload a sound/.test(textOf(ambPanel)));
  check("C6 …and no “None” row, because a loop is added, not chosen", !/— None —/.test(textOf(ambPanel)));
  setInput(filterOf(ambPanel), "amb-hive");
  await waitFor(() => !!rowNamed(panelOf(".p-ambient"), __AMB_HIVE_LABEL__));
  rowNamed(panelOf(".p-ambient"), __AMB_HIVE_LABEL__).click();
  await waitFor(() => (ambientValue ?? "").includes("amb-hive"));
  check(
    "C7 picking one adds it as a recorded loop beside the preset",
    ambientValue === "rain+file:/film/sfx/amb-city-traffic.mp3+file:/film/sfx/amb-hive.mp3",
    ambientValue,
  );
  check("C8 the loop is listed back with its own controls", textOf(amb()).includes("amb-hive") && (amb().querySelectorAll("button").length >= 2));
  const removeBtn = [...amb().querySelectorAll("button")].find((b: any) => /Remove recorded loop .*amb.hive/.test(b.getAttribute("aria-label") ?? ""));
  removeBtn?.click();
  await waitFor(() => !(ambientValue ?? "").includes("amb-hive"));
  check("C9 ✕ removes just that loop and keeps the rest", ambientValue === "rain+file:/film/sfx/amb-city-traffic.mp3", ambientValue);

  await sleep(50);
  if (problems.length) {
    console.log("\nconsole errors / throws during the probe:");
    for (const [kind, msg] of problems.slice(0, 6)) console.log(`  ${kind}: ${msg.slice(0, 400)}`);
  }
  check("D1 no console errors, uncaught throws or rejected promises", problems.length === 0, problems.length);
  check("D2 no error boundary trip", !/the reel snapped|something broke/i.test(doc.body.innerHTML));

  console.log(`\naudio picker: ${passed} passed, ${failed} failed`);
  if (failed) throw new Error(`${failed} audio-picker check(s) failed`);
}
