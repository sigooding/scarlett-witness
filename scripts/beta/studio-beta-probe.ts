/**
 * STUDIO-SIDE BETA PROBE — runs inside the harness's happy-dom shim.
 *
 * Everything here drives the REAL Studio UI (buttons, selects, inputs — no
 * internal handles) and then asserts on the STORY DATA that the editor
 * actually produced, using the engine's own validator (imported straight
 * from src/logic) as the independent judge.
 *
 * Scene-selection strategy: addScene/addEndScene auto-select the new node,
 * the Episodes tab's scene buttons reselect existing scenes, and a fresh
 * mount with initialStoryId reopens a registered case — so the flow canvas
 * never has to be clicked directly.
 */
import { StrictMode, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Studio } from "STUDIO_PATH";
import { ErrorBoundary } from "EB_PATH";
import { STORIES } from "STORIES_PATH";
import { validateStory } from "LOGIC_PATH";
import type { Story, SceneNode } from "TYPES_PATH";

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
  problems.push(["console.error", a.map(String).join(" ").slice(0, 400)]);
};
process.on("uncaughtException", (e) => problems.push(["uncaught", String((e as any)?.stack || e).slice(0, 600)]));
process.on("unhandledRejection", (e) => problems.push(["unhandled rejection", String((e as any)?.stack || e).slice(0, 600)]));

/** console.error during a phase = a failed beta check (warnings only reported). */
function sweepProblems(label: string) {
  const errs = problems.filter(([k]) => k !== "console.warn");
  if (errs.length) check(`no console errors during ${label}`, false, errs.slice(0, 3).map((e) => e[1]));
  problems.length = 0;
}

const q = (sel: string) => [...container.querySelectorAll(sel)] as any[];
const byText = (re: RegExp, sel = "button") => q(sel).find((el) => re.test((el.textContent || "").trim()));
const snap = () => (container.textContent || "").replace(/\s+/g, " ");
const crashed = () => /the reel snapped|something broke/i.test(container.innerHTML);

/** happy-dom needs the native setter for React-controlled inputs. */
function setInput(el: any, value: string) {
  const proto = el instanceof win.HTMLTextAreaElement ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set;
  setter.call(el, value);
  el.dispatchEvent(new win.Event("input", { bubbles: true }));
}
function setSelect(el: any, value: string) {
  const setter = Object.getOwnPropertyDescriptor(win.HTMLSelectElement.prototype, "value")!.set;
  setter.call(el, value);
  el.dispatchEvent(new win.Event("change", { bubbles: true }));
}

const TAB_RE: Record<string, RegExp> = {
  scene: /^Scene$/,
  beats: /^Beats$/,
  hotspots: /^Hotspots$/,
  choices: /^Choices$/,
  characters: /^Characters$/,
  items: /^Items$/,
  briefing: /Game Objective/,
  acts: /Acts/,
  episodes: /Episodes/,
  media: /Media Tools/,
  ai: /AI Images/,
  map: /Map/,
  stage: /🚶 Stage/,
  test: /Test/,
};
async function tab(name: string) {
  // The toolbar's "🚶 Stage" button ADDS a stage scene; the inspector tab with
  // the same label switches panels. Prefer semantic tabs, not their layout CSS.
  const matches = q("button").filter((el: any) => TAB_RE[name].test((el.textContent || "").trim()));
  const b = matches.find((el: any) => el.getAttribute?.("role") === "tab") ?? matches[0];
  if (!b) { check(`tab ${name} exists`, false); return false; }
  b.click();
  await sleep(500);
  return true;
}

/** A destination picker in the inspector, not the scene-navigation select. */
const selectWithTargets = (...ids: string[]) =>
  q(".studio-inspector select").find((el: any) => ids.every((id) => [...el.querySelectorAll("option")].some((o: any) => o.value === id)));

/** The current story, read from the editor's own autosaved draft. */
const draftKey = (id: string) => `scarlet-studio-draft-${id}`;
function draft(id: string): Story | null {
  const raw = win.localStorage.getItem(draftKey(id));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function waitFor(pred: () => boolean, ms = 4000, step = 150) {
  for (let t = 0; t < ms; t += step) {
    if (pred()) return true;
    await sleep(step);
  }
  return pred();
}
/** Wait for the autosaved draft (800ms debounce) to exist and pass pred. */
async function waitDraft(id: string, pred: (s: Story) => boolean = () => true, ms = 6000) {
  const ok = await waitFor(() => {
    const d = draft(id);
    return !!d && pred(d);
  }, ms);
  return ok ? draft(id) : null;
}

/* ---------------- the studio mount ---------------- */

const events: { published: Story | null; created: Story[]; played: Story | null } = { published: null, created: [], played: null };
/** The newsstand the way the real App keeps it: created cases register. */
const allStories: Story[] = [...STORIES.slice(0, 3)];
let rootR: Root;

const studioProps = (extra: { initialStoryId?: string } = {}) => ({
  baseStories: allStories.slice(),
  ...(extra.initialStoryId ? { initialStoryId: extra.initialStoryId } : {}),
  get onPublish() { return (s: Story) => { events.published = s; return true; }; },
  onPlay: (s: Story) => { events.played = s; },
  onExit: () => {},
  onDeleteStory: () => true,
  onCreateStory: (s: Story) => { events.created.push(s); allStories.push(s); return true; },
  onUpdateTitleTheme: () => {},
});

function mountFresh(target: any, extra: { initialStoryId?: string } = {}) {
  const r = createRoot(target);
  r.render(createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(Studio, studioProps(extra)))));
  return r;
}

const errorsOf = (s: Story) => validateStory(s).filter((i) => i.severity === "error");
/** Every internal scene-reference in a story that points outside its own scenes. */
function danglingSceneRefs(s: Story): string[] {
  const ids = new Set(s.scenes.map((x) => x.id));
  const refs: string[] = [];
  s.scenes.forEach((sc) => {
    sc.choices?.forEach((c) => {
      if (c.targetSceneId && !ids.has(c.targetSceneId)) refs.push(`choice→${c.targetSceneId}`);
      if (c.timedOutTargetSceneId && !ids.has(c.timedOutTargetSceneId)) refs.push(`choiceTimeout→${c.timedOutTargetSceneId}`);
    });
    if (sc.autoAdvanceTargetSceneId && !ids.has(sc.autoAdvanceTargetSceneId)) refs.push(`auto→${sc.autoAdvanceTargetSceneId}`);
    (sc.dialogueBeats ?? []).forEach((b) => {
      if (b.afterBeatTargetSceneId && !ids.has(b.afterBeatTargetSceneId)) refs.push(`beat→${b.afterBeatTargetSceneId}`);
    });
    for (const edge of ["left", "right"] as const) {
      const t = sc.stage?.exitEdges?.[edge]?.targetSceneId;
      if (t && !ids.has(t)) refs.push(`edgeExit→${t}`);
    }
    (sc.stage?.enterScript ?? []).forEach((st, i) => { if (st.do === "goToScene" && !ids.has(st.targetSceneId)) refs.push(`enterScript${i}→${st.targetSceneId}`); });
    Object.keys(sc.stage?.entrySpawns ?? {}).forEach((k) => { if (!ids.has(k)) refs.push(`entrySpawnFrom→${k}`); });
    (sc.hotspots ?? []).forEach((h) => {
      if (h.action.targetSceneId && !ids.has(h.action.targetSceneId)) refs.push(`hotspot→${h.action.targetSceneId}`);
      (h.action.script ?? []).forEach((st) => { if (st.do === "goToScene" && !ids.has(st.targetSceneId)) refs.push(`script→${st.targetSceneId}`); });
      h.action.patternPuzzle && h.action.patternPuzzle.targetSceneId && !ids.has(h.action.patternPuzzle.targetSceneId) && refs.push(`puzzle→${h.action.patternPuzzle.targetSceneId}`);
    });
  });
  (s.map?.locations ?? []).forEach((l) => { if (!ids.has(l.targetSceneId)) refs.push(`map→${l.targetSceneId}`); });
  (s.acts ?? []).forEach((a) => { if (!ids.has(a.startSceneId)) refs.push(`act→${a.startSceneId}`); });
  return refs;
}

/** Structural edits are spaced >600ms apart so each is its own undo step. */
const spacing = 800;

/** Select an existing scene via the Episodes tab's scene buttons. */
async function selectSceneViaEpisodes(sceneId: string) {
  await tab("episodes");
  const s = currentStory();
  const target = s?.scenes.find((x) => x.id === sceneId);
  if (!target) return false;
  // scene buttons carry ★/🏁 badges before the title — match by suffix
  const btn = q("button").find((el: any) => (el.textContent || "").trim().endsWith(target.title));
  if (!btn) return false;
  btn.click();
  await sleep(400);
  return true;
}
/** The story currently being edited = last-story pointer's draft (or fallback). */
function currentStory(): Story | null {
  const lastId = win.localStorage.getItem("scarlet-studio-last-story");
  return lastId ? draft(lastId) : null;
}

/* ================================================================
 * THE PROBE
 * ================================================================ */
export async function run(ctx: Ctx) {
  win = ctx.win; doc = ctx.doc; container = ctx.container; exitFn = ctx.exit;
  try {
    await main();
  } catch (err) {
    console.error("\nPROBE THREW:", err);
    failed++;
  }
  console.log(`\n=== STUDIO BETA: ${passed} passed, ${failed} failed ===`);
  const leftover = problems.filter(([k]) => k !== "console.warn");
  if (leftover.length) console.log("unswept problems:", leftover.slice(0, 5).map((p) => p[1]));
  exitFn(failed ? 1 : 0);
}

async function main() {
  /* ---------- Part 1: boot ---------- */
  rootR = mountFresh(container);
  await sleep(2600);
  check("1.1 studio mounts", !crashed() && container.innerHTML.length > 5000, "len=" + container.innerHTML.length);
  sweepProblems("boot");

  /* ---------- Part 2: ＋ New Story ---------- */
  byText(/＋ New Story/)?.click();
  await sleep(700);
  check("2.1 onCreateStory fired with blank case", events.created.length === 1 && events.created[0].scenes.length === 0, events.created.map((s) => s.id));
  const blank = events.created[0];
  const blankIssues = validateStory(blank);
  check(
    "2.2 blank case validates as guided draft (single warning, no errors)",
    blankIssues.length === 1 && blankIssues[0].severity === "warning" && !errorsOf(blank).length,
    blankIssues.map((i) => i.message),
  );
  const blankSnap = snap();
  check("2.3 next-step coach points at the first room", /Add your first room/.test(blankSnap), blankSnap.slice(0, 240));
  check("2.4 empty-canvas starter is on the map", /Your game is empty/.test(blankSnap), blankSnap.slice(0, 240));
  sweepProblems("new story");

  /* ---------- Part 3: author the micro-case ----------
   * END is created FIRST so the choice can be wired while scene A (added
   * second, still selected) is the scene under the inspector. */
  byText(/🏁 End/)?.click();
  await sleep(spacing);
  byText(/＋ Scene/)?.click();
  const caseId = blank.id;
  let s = (await waitDraft(caseId, (d) => d.scenes.length === 2 && d.scenes.some((x) => !x.isEnding)))!;
  const endScene = s?.scenes.find((x) => x.isEnding);
  const sceneA = s?.scenes.find((x) => !x.isEnding);
  check("3.1 scene + ending added + autosaved", !!s && !!endScene && !!sceneA, s?.scenes.map((x) => x.title));
  check("3.2 classic scene became start scene", s?.startSceneId === sceneA?.id, { start: s?.startSceneId, a: sceneA?.id });

  await tab("scene");
  const titleInput = q("input").find((el) => el.value === sceneA.title);
  check("3.3 scene title input found", !!titleInput);
  if (titleInput && sceneA) {
    setInput(titleInput, "The Empty Office");
    s = (await waitDraft(caseId, (d) => d.scenes.find((x) => x.id === sceneA.id)!.title === "The Empty Office"))!;
    check("3.4 scene rename persisted", !!s, draft(caseId)?.scenes.find((x) => x.id === sceneA.id)?.title);
  }
  sweepProblems("scene authoring");

  await tab("characters");
  byText(/＋ Add character/)?.click();
  s = (await waitDraft(caseId, (d) => d.characters.length === 1))!;
  check("3.5 character added", !!s && s.characters.length === 1, s?.characters.map((c) => c.id));

  await tab("items");
  byText(/＋ Add new item/)?.click();
  s = (await waitDraft(caseId, (d) => d.items.length === 1))!;
  check("3.6 item added", !!s && s.items.length === 1, s?.items.map((i) => i.id));

  await tab("beats");
  byText(/＋ Add dialogue beat/)?.click();
  s = (await waitDraft(caseId, (d) => (d.scenes.find((x) => x.id === sceneA.id)!.dialogueBeats ?? []).length === 1))!;
  check("3.7 beat added to scene", !!s && (s.scenes.find((x) => x.id === sceneA.id)!.dialogueBeats ?? []).length === 1);

  await tab("choices");
  byText(/＋ Add choice/)?.click();
  s = (await waitDraft(caseId, (d) => (d.scenes.find((x) => x.id === sceneA.id)!.choices ?? []).length === 1))!;
  check("3.8 choice added to the classic scene", !!s, s?.scenes.find((x) => x.id === sceneA.id)?.choices);
  if (s?.scenes.find((x) => x.id === sceneA.id)?.choices?.length && endScene) {
    const targetSel = selectWithTargets(endScene.id);
    check("3.9 choice target select lists the ending", !!targetSel);
    if (targetSel) {
      setSelect(targetSel, endScene.id);
      const ok = await waitDraft(caseId, (d) => d.scenes.find((x) => x.id === sceneA.id)!.choices?.[0]?.targetSceneId === endScene.id);
      check("3.10 choice wired to ending scene", !!ok, draft(caseId)?.scenes.find((x) => x.id === sceneA.id)?.choices?.[0]?.targetSceneId);
    }
  }
  sweepProblems("micro-case authoring");

  const authored = draft(caseId)!;
  const authoredErrs = errorsOf(authored);
  check("3.11 authored micro-case has zero validator errors", authoredErrs.length === 0, authoredErrs.map((e) => e.message));

  /* ---------- Part 4: Test tab sees the graph ---------- */
  await tab("test");
  const testText = snap();
  check(
    "4.1 playtester lists the authored choice",
    !!authored && authored.scenes.find((x) => x.id === sceneA.id)!.choices!.length > 0 &&
      testText.includes(authored.scenes.find((x) => x.id === sceneA.id)!.choices![0].text.slice(0, 12)),
    testText.slice(0, 200),
  );
  sweepProblems("test tab");

  /* ---------- Part 5: undo/redo integrity ---------- */
  {
    await tab("scene");
    const before = draft(caseId)!;
    const inp = q("input").find((el) => el.value === "The Empty Office");
    if (!inp) check("5.0 scene title input present for undo test", false);
    else {
      setInput(inp, "The Empty Office (revised)");
      const after = (await waitDraft(caseId, (d) => d.scenes.find((x) => x.id === sceneA.id)!.title === "The Empty Office (revised)"))!;
      check("5.1 revision persisted", !!after, after?.scenes.find((x) => x.id === sceneA.id)?.title);
      byText(/↶ Undo/)?.click();
      const undone = (await waitDraft(caseId, (d) => d.scenes.find((x) => x.id === sceneA.id)!.title === before.scenes.find((x) => x.id === sceneA.id)!.title))!;
      check("5.2 undo restored the exact previous title", !!undone, draft(caseId)?.scenes.find((x) => x.id === sceneA.id)?.title);
      byText(/↷ Redo/)?.click();
      const redone = (await waitDraft(caseId, (d) => d.scenes.find((x) => x.id === sceneA.id)!.title === "The Empty Office (revised)"))!;
      check("5.3 redo restored the revision", !!redone, draft(caseId)?.scenes.find((x) => x.id === sceneA.id)?.title);
    }
    sweepProblems("undo/redo");
  }

  /* ---------- Part 6: export ---------- */
  let exportJson = "";
  {
    byText(/⤓ Export/)?.click();
    const ok = await waitFor(() => {
      const ta = doc.getElementById("reel-export-textarea");
      exportJson = ta?.value ?? "";
      return !!exportJson;
    });
    check("6.1 export produced JSON in the export box", ok);
    if (ok) {
      const ex = JSON.parse(exportJson) as Story;
      check("6.2 export id/title match the draft", ex.id === caseId && ex.title === draft(caseId)!.title, { id: ex.id, title: ex.title });
      check("6.3 export scenes deep-equal the draft", JSON.stringify(ex.scenes) === JSON.stringify(draft(caseId)!.scenes));
      check("6.4 exported case validates with zero errors", errorsOf(ex).length === 0, errorsOf(ex).map((e) => e.message));
      byText(/^✕$/, "button")?.click();
      await sleep(300);
    }
    sweepProblems("export");
  }

  /* ---------- Part 7: import roundtrip ---------- */
  {
    const fileInput = q('input[type="file"]').find((el: any) => (el.getAttribute("accept") ?? "").includes("json"));
    check("7.1 import file input present", !!fileInput);
    if (fileInput && exportJson) {
      // Give the import a unique marker so the probe can see it LAND (the
      // pre-import draft already equals the export, so an unmodified import
      // is unobservable — and racing it is exactly the bug class to catch).
      const bundle = JSON.parse(exportJson) as Story;
      const marked = bundle.scenes.find((x) => x.id === sceneA.id);
      if (marked) marked.title = "The Empty Office (imported)";
      const file = new win.File([JSON.stringify(bundle)], "case.reel.json", { type: "application/json" });
      Object.defineProperty(fileInput, "files", { value: [file], configurable: true });
      fileInput.dispatchEvent(new win.Event("change", { bubbles: true }));
      const ok = await waitDraft(caseId, (d) => d.scenes.find((x) => x.id === sceneA.id)?.title === "The Empty Office (imported)", 12000);
      check("7.2 import landed and round-tripped intact", !!ok && JSON.stringify(ok.scenes) === JSON.stringify(bundle.scenes), draft(caseId)?.scenes.find((x) => x.id === sceneA.id)?.title);
      check("7.3 re-imported case validates with zero errors", !!ok && errorsOf(ok).length === 0, ok ? errorsOf(ok).map((e) => e.message) : "no draft");
      // the import must be inert once it lands: no late clobber of later edits
      const stable = await waitFor(() => false, 1200).then(() => draft(caseId));
      check("7.4 import did not clobber later edits (settled)", !!stable && stable.scenes.find((x) => x.id === sceneA.id)?.title === "The Empty Office (imported)");
    }
    sweepProblems("import");
  }

  /* ================================================================
   * Part 8a: build the reference-graph case (every link kind)
   * ================================================================ */
  byText(/＋ New Story/)?.click();
  await sleep(700);
  const case2 = events.created[events.created.length - 1];
  byText(/🏁 End/)?.click(); await sleep(spacing); // END (no auto-start)
  byText(/＋ Scene/)?.click(); await sleep(spacing); // START (auto-start, selected)
  // rename START while it is selected so scene names stay unique
  await tab("scene");
  {
    const inp = q("input").find((el) => el.value === "New Scene");
    check("8a.0a start-scene title input found", !!inp);
    inp && setInput(inp, "The Precinct");
    await waitDraft(case2.id, (d) => d.scenes.some((x) => x.title === "The Precinct"), 8000);
  }
  byText(/＋ Scene/)?.click(); await sleep(spacing); // MIDDLE (selected)
  let s2 = (await waitDraft(case2.id, (d) => d.scenes.length === 3, 8000))!;
  const end2 = s2.scenes.find((x) => x.isEnding)!;
  const start = s2.scenes.find((x) => x.title === "The Precinct")!;
  const middle = s2.scenes.find((x) => !x.isEnding && x.title !== "The Precinct")!;
  check("8a.1 scaffold built", !!end2 && !!start && !!middle, s2?.scenes.map((x) => [x.id, x.title]));
  check("8a.1b start scene auto-assigned despite end-first order", s2.startSceneId === start.id, { start: s2?.startSceneId, want: start?.id });

  // MIDDLE (still selected) gets its choice → END
  await tab("choices");
  byText(/＋ Add choice/)?.click();
  {
    const ok = await waitDraft(case2.id, (d) => (d.scenes.find((x) => x.id === middle.id)!.choices ?? []).length === 1);
    check("8a.2 middle's choice added", !!ok);
    const sel = selectWithTargets(end2.id);
    check("8a.3 choice target select present", !!sel);
    sel && setSelect(sel, end2.id);
    await waitDraft(case2.id, (d) => d.scenes.find((x) => x.id === middle.id)!.choices?.[0]?.targetSceneId === end2.id);
  }

  // stage room: wire its seeded exit hotspot, then a left edge exit → MIDDLE
  byText(/🚶 Stage/)?.click();
  s2 = (await waitDraft(case2.id, (d) => d.scenes.some((x) => x.nodeType === "stage"), 8000))!;
  const stage = s2.scenes.find((x: SceneNode) => x.nodeType === "stage");
  check("8a.4 stage scene added", !!stage, s2?.scenes.map((x) => x.nodeType));
  if (stage) {
    // the seeded "The way out" goToScene hotspot needs its target wired; its
    // editor is a collapsed section (⌖ prefix) — open it first
    await tab("hotspots");
    {
      const header = byText(/⌖ The way out/);
      check("8a.5 seeded exit hotspot listed", !!header);
      header?.click();
      await sleep(400);
      const sel = selectWithTargets(end2.id);
      check("8a.6 seeded exit hotspot target select present", !!sel);
      if (sel) {
        setSelect(sel, end2.id);
        const ok = await waitDraft(case2.id, (d) => d.scenes.find((x) => x.id === stage.id)!.hotspots?.[0]?.action?.targetSceneId === end2.id);
        check("8a.7 seeded exit hotspot wired", !!ok, draft(case2.id)?.scenes.find((x) => x.id === stage.id)?.hotspots?.[0]?.action);
      }
    }
    await tab("stage");
    // edge exits live in the collapsed "➡ Entrances & exits" section
    const header = byText(/➡ Entrances & exits/);
    header?.click();
    await sleep(400);
    const addExit = byText(/＋ Add left edge exit/);
    check("8a.8 add-left-edge-exit button reachable", !!addExit);
    addExit?.click();
    await sleep(spacing);
    const exitSel = selectWithTargets(middle.id);
    check("8a.9 edge-exit target select present", !!exitSel);
    if (exitSel) {
      setSelect(exitSel, middle.id);
      const ok = await waitDraft(case2.id, (d) => d.scenes.find((x) => x.id === stage.id)?.stage?.exitEdges?.left?.targetSceneId === middle.id);
      check("8a.10 left edge exit targets middle", !!ok, JSON.stringify(draft(case2.id)?.scenes.find((x) => x.id === stage.id)?.stage?.exitEdges ?? "NO-EDGES"));
    }
  }

  // map pin → MIDDLE
  await tab("map");
  byText(/\+ Add location/i)?.click();
  s2 = (await waitDraft(case2.id, (d) => (d.map?.locations ?? []).length === 1))!;
  const loc = (s2?.map?.locations ?? [])[0];
  check("8a.10 map location added", !!loc, s2?.map?.locations?.map((l) => l.id));
  if (loc) {
    const pinSel = selectWithTargets(middle.id);
    check("8a.11 pin target select present", !!pinSel);
    if (pinSel) {
      setSelect(pinSel, middle.id);
      const ok = await waitDraft(case2.id, (d) => d.map?.locations?.[0]?.targetSceneId === middle.id);
      check("8a.12 map pin targets middle", !!ok, draft(case2.id)?.map?.locations?.[0]?.targetSceneId);
    }
  }

  // pack into a season (episode one claims every scene)
  await tab("episodes");
  byText(/🎞 Turn this case into a season/)?.click();
  s2 = (await waitDraft(case2.id, (d) => (d.episodes ?? []).length === 1))!;
  const ep1 = (s2?.episodes ?? [])[0];
  check("8a.13 season created claiming all scenes", !!ep1 && ep1.sceneIds.length === s2.scenes.length, ep1 && ep1.sceneIds);

  // select START via the episode scene list, wire its choice → MIDDLE
  check("8a.14 selected START via episodes tab", await selectSceneViaEpisodes(start.id));
  await tab("choices");
  byText(/＋ Add choice/)?.click();
  {
    const ok = await waitDraft(case2.id, (d) => (d.scenes.find((x) => x.id === start.id)!.choices ?? []).length === 1);
    check("8a.15 start's choice added", !!ok);
    const sel = selectWithTargets(middle.id);
    check("8a.16 start's choice target select present", !!sel);
    sel && setSelect(sel, middle.id);
    await waitDraft(case2.id, (d) => d.scenes.find((x) => x.id === start.id)!.choices?.[0]?.targetSceneId === middle.id);
  }
  s2 = draft(case2.id)!;
  check("8a.17 chain wired start→middle→end",
    s2.scenes.find((x) => x.id === start.id)!.choices?.some((c) => c.targetSceneId === middle.id) &&
    s2.scenes.find((x) => x.id === middle.id)!.choices?.some((c) => c.targetSceneId === end2.id),
    undefined);

  const preErrs = errorsOf(s2);
  check("8a.18 reference graph validates clean before the cut", preErrs.length === 0, preErrs.map((e) => e.message));
  sweepProblems("reference graph build");

  /* ================================================================
   * Part 9: ⧉ Duplicate Story must rewire EVERY scene reference
   * ================================================================ */
  {
    const srcStory = draft(case2.id)!;
    const createdBefore = events.created.length;
    byText(/⧉ Duplicate Story/)?.click();
    const ok = await waitFor(() => events.created.length > createdBefore, 12000);
    check("9.1 duplicate created", ok);
    if (ok) {
      const dup = events.created[events.created.length - 1];
      check("9.1b duplicate has fresh id + (copy) title", dup.id !== case2.id && /\(copy\)/.test(dup.title), { id: dup.id, title: dup.title });
      const dupDraft = (await waitDraft(dup.id)) ?? dup;
      check("9.2 duplicate keeps the scene count", dupDraft.scenes.length === srcStory.scenes.length, dupDraft.scenes.length);
      check("9.3 duplicate scene ids are fresh", !dupDraft.scenes.some((x) => srcStory.scenes.some((y) => y.id === x.id)), undefined);
      const refs = danglingSceneRefs(dupDraft);
      console.log("  · dangling refs inside duplicate:", JSON.stringify(refs));
      check("9.4 duplicate rewires every scene ref into the copy", refs.length === 0, refs);
      const dupErrs = errorsOf(dupDraft);
      check("9.5 duplicate validates clean", dupErrs.length === 0, dupErrs.map((e) => e.message).slice(0, 6));
    }
    sweepProblems("duplicate");
  }

  /* ================================================================
   * Part 8b: delete MIDDLE — what does Check flag, what does Repair fix?
   * (fresh mount reopens case2 like "edit in Studio" from the newsstand)
   * ================================================================ */
  {
    rootR.unmount();
    await sleep(300);
    doc.body.innerHTML = '<div id="root2"></div>';
    container = doc.getElementById("root2");
    rootR = mountFresh(container, { initialStoryId: case2.id });
    await sleep(2600);
    check("8b.0 case2 reopened on remount", win.localStorage.getItem("scarlet-studio-last-story") === case2.id, win.localStorage.getItem("scarlet-studio-last-story"));

    check("8b.1 selected MIDDLE via episodes tab", await selectSceneViaEpisodes(middle.id));
    await tab("scene");
    const delBtn = byText(/🗑 Delete scene/);
    check("8b.2 delete-scene button present", !!delBtn);
    delBtn?.click();
    const after = (await waitDraft(case2.id, (d) => !d.scenes.some((x) => x.id === middle.id)))!;
    check("8b.3 scene gone, start preserved", !!after && after.startSceneId === start.id, after?.startSceneId);

    const dangling = {
      choice: !!after?.scenes.find((x) => x.id === start.id)!.choices?.some((c) => c.targetSceneId === middle.id),
      episode: !!((after?.episodes ?? []).some((e) => e.sceneIds.includes(middle.id))),
      mapPin: !!((after?.map?.locations ?? []).some((l) => l.targetSceneId === middle.id)),
      edgeExit: !!(after?.scenes.some((x) => x.stage?.exitEdges?.left?.targetSceneId === middle.id)),
    };
    console.log("  · dangling refs after delete:", JSON.stringify(dangling));
    const postErrs = after ? errorsOf(after) : [];
    console.log(`  · validator errors after delete: ${postErrs.length}`, postErrs.map((e) => e.message).slice(0, 6));

    byText(/🛠 Repair/)?.click();
    await sleep(1800);
    const repaired = draft(case2.id);
    const still = {
      choice: !!repaired?.scenes.find((x) => x.id === start.id)!.choices?.some((c) => c.targetSceneId === middle.id),
      episode: !!((repaired?.episodes ?? []).some((e) => e.sceneIds.includes(middle.id))),
      mapPin: !!((repaired?.map?.locations ?? []).some((l) => l.targetSceneId === middle.id)),
      edgeExit: !!(repaired?.scenes.some((x) => x.stage?.exitEdges?.left?.targetSceneId === middle.id)),
    };
    console.log("  · dangling refs after repair:", JSON.stringify(still));
    const repErrs = repaired ? errorsOf(repaired) : [];
    check("8b.4 repair fixed the dangling CHOICE", !still.choice, still);
    check("8b.5 repair cleaned the dangling EPISODE list", !still.episode, still);
    check("8b.6 repair fixed the dangling MAP PIN", !still.mapPin, still);
    check("8b.7 repair fixed the dangling STAGE EDGE EXIT", !still.edgeExit, still);
    check("8b.8 zero validator errors after repair", repErrs.length === 0, repErrs.map((e) => e.message).slice(0, 8));
    sweepProblems("deletion + repair");
  }

  /* ================================================================
   * Part 8c: Repair must NOT "fix" a healthy edge-exit-only stage.
   * The validator counts a walk-off edge exit as a way out; if Repair's
   * exit accounting disagrees, it injects a bogus "Move on." choice into
   * a sound room and reports repairs on a structurally sound reel.
   * ================================================================ */
  {
    byText(/＋ New Story/)?.click();
    await sleep(700);
    const case3 = events.created[events.created.length - 1];
    byText(/🏁 End/)?.click(); await sleep(spacing); // END
    byText(/🚶 Stage/)?.click(); await sleep(spacing); // STAGE (claims start)
    let s3 = (await waitDraft(case3.id, (d) => d.scenes.length === 2 && d.scenes.some((x) => x.nodeType === "stage"), 8000))!;
    const stage3 = s3.scenes.find((x) => x.nodeType === "stage")!;
    const end3 = s3.scenes.find((x) => x.isEnding)!;
    check("8c.1 stage-first authoring claims the start marker", !!s3 && s3.startSceneId === stage3.id, { start: s3?.startSceneId, stage: stage3?.id });

    // drop the seeded exit hotspot — the edge arrow will be the ONLY way out
    await tab("hotspots");
    const delHs = q('button[title="Delete this hotspot"]')[0];
    check("8c.2 seeded hotspot delete control present", !!delHs);
    delHs?.click();
    s3 = (await waitDraft(case3.id, (d) => (d.scenes.find((x) => x.id === stage3.id)!.hotspots ?? []).length === 0))!;
    check("8c.3 seeded hotspot removed", !!s3 && (s3.scenes.find((x) => x.id === stage3.id)!.hotspots ?? []).length === 0);

    // wire the left edge exit → END
    await tab("stage");
    byText(/➡ Entrances & exits/)?.click();
    await sleep(400);
    byText(/＋ Add left edge exit/)?.click();
    await sleep(spacing);
    const exitSel = selectWithTargets(end3.id);
    check("8c.4 edge-exit target select present", !!exitSel);
    exitSel && setSelect(exitSel, end3.id);
    s3 = (await waitDraft(case3.id, (d) => d.scenes.find((x) => x.id === stage3.id)?.stage?.exitEdges?.left?.targetSceneId === end3.id))!;
    check("8c.5 edge exit wired to the ending", !!s3);

    const pre = draft(case3.id)!;
    const preErrs3 = errorsOf(pre);
    check("8c.6 edge-exit-only stage validates clean", preErrs3.length === 0, preErrs3.map((e) => e.message));

    // Repair a sound reel: it must change NOTHING
    byText(/🛠 Repair/)?.click();
    await sleep(1800);
    const post = draft(case3.id)!;
    check("8c.7 repair left the sound reel byte-identical", JSON.stringify(post.scenes) === JSON.stringify(pre.scenes),
      post.scenes.find((x) => x.id === stage3.id)?.choices ?? "no choices");
    check("8c.8 no bogus choice injected into the stage", (post.scenes.find((x) => x.id === stage3.id)!.choices ?? []).length === 0,
      post.scenes.find((x) => x.id === stage3.id)!.choices);
    check("8c.9 still validates clean after repair", errorsOf(post).length === 0, errorsOf(post).map((e) => e.message));
    sweepProblems("edge-exit repair no-op");
  }

  /* ---------- Part 10: draft reload ---------- */
  {
    const lastId = win.localStorage.getItem("scarlet-studio-last-story");
    const before = draft(lastId!)!;
    rootR.unmount();
    await sleep(300);
    doc.body.innerHTML = '<div id="root3"></div>';
    container = doc.getElementById("root3");
    rootR = mountFresh(container);
    await sleep(2800);
    const reopened = win.localStorage.getItem("scarlet-studio-last-story");
    const afterReload = reopened ? draft(reopened) : null;
    check("10.1 studio reopened the last story", reopened === lastId, { before: lastId, after: reopened });
    check(
      "10.2 reopened draft matches the pre-reload draft",
      !!afterReload && JSON.stringify(afterReload.scenes) === JSON.stringify(before.scenes) && afterReload.startSceneId === before.startSceneId,
      undefined,
    );
    check("10.3 no crash on reload", !crashed());
    sweepProblems("reload");
  }
}
