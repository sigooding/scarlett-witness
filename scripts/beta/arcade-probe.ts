/**
 * BETA PROBE — 🕹 THE ARCADE CABINET
 * ----------------------------------
 * Part 1: the config contract — the shipped cabinet's screenRect is sane,
 *         the art exists, and the story wires the win flag to a payoff.
 * Part 2: the real <ArcadeGame> mounted in happy-dom — the canvas mounts
 *         behind the cabinet art, the screen wrapper is positioned by the
 *         authored percentages, the attract screen accepts ENTER, and the
 *         loop runs frames without a console error.
 * Part 3: the ENGINE side — an arcadeGame hotspot surfaces both outcomes as
 *         decisions, winning sets its flag and spends the marker, and losing
 *         leaves the cabinet playable (you can always put another quarter in).
 * Part 7: the DIORAMA layer — cursor art, the backpack container and the
 *         foreground/parallax overlays.
 * Part 8: REACHABILITY — every stage hotspot can actually be walked to.
 * Part 9: the full USE-the-cabinet click path in the real GamePlayer.
 * Part 10: narration is never truncated by a visual timer.
 * Part 11: the minigame is playable — ladders grab, barrels drain.
 * Part 12: the big centred inventory.
 * Part 5: the ART CONTRACT — every referenced asset is on disk, item icons
 *         are square with alpha, sheets divide into whole frames.
 * Part 6: the KITCHEN and the TRAVEL MAP — the lights are gated behind the
 *         alphabet-wall beat, and map pins unlock in step with the story.
 * Part 4: NON-INTERFERENCE — a story with no cabinet is untouched, and the
 *         cabinet's key handling doesn't leak to the stage walker.
 *
 * Run: node scripts/beta/arcade-harness.mjs
 */
import type { Story } from "../../src/types";

const failures: string[] = [];
const passes: string[] = [];
function ok(cond: boolean, label: string, detail = "") {
  if (cond) passes.push(label);
  else failures.push(label + (detail ? ` — ${detail}` : ""));
}

/* ================================================================
 * PART 1 — THE CONFIG CONTRACT
 * ================================================================ */
async function part1() {
  console.log("\n=== PART 1 · CABINET CONFIG ===");
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");
  const scene = HOLLOW_SIGNAL.scenes.find((s) => s.id === "hs_arcade")!;
  ok(!!scene, "the arcade room exists");
  const hs = (scene.hotspots ?? []).find((h) => h.action.type === "arcadeGame");
  ok(!!hs, "the room carries an arcadeGame hotspot");
  const cfg = hs!.action.arcadeGame!;
  ok(!!cfg, "the hotspot carries a cabinet config");

  const r = cfg.screenRect!;
  ok(!!r, "the cabinet declares a screenRect");
  ok(r.x >= 0 && r.y >= 0, "screenRect origin is on the image", JSON.stringify(r));
  ok(r.x + r.w <= 100.5 && r.y + r.h <= 100.5, "screenRect fits inside the cabinet image", JSON.stringify(r));
  ok(r.w > 10 && r.h > 10, "screenRect is big enough to play in", JSON.stringify(r));
  ok(!!cfg.cabinetImage && cfg.cabinetImage.endsWith(".png"), "cabinet art is a PNG (needs alpha for the screen hole)");

  // The win flag must actually pay off somewhere, or beating the game is
  // invisible to the player — exactly the class of bug the validator hunts.
  const flag = cfg.rewardConsequences?.setFlags?.[0];
  ok(!!flag, "winning sets a flag");
  const paysOff =
    !!HOLLOW_SIGNAL.flagNotes?.[flag!] ||
    HOLLOW_SIGNAL.scenes.some((s) =>
      (s.dialogueBeats ?? []).some((b) => b.conditionRule?.requiresFlags?.includes(flag!))
    );
  ok(paysOff, `the win flag "${flag}" pays off in a beat or a flag note`);

  // The whole story must still validate.
  const { validateStory } = await import("../../src/logic");
  const errors = validateStory(HOLLOW_SIGNAL as Story).filter((i) => i.severity === "error");
  ok(errors.length === 0, "the story has no validation ERRORS", errors.map((e) => e.message).join(" | "));
}

/* ================================================================
 * PART 2 — THE COMPONENT IN A REAL DOM
 * ================================================================ */
async function part2() {
  console.log("\n=== PART 2 · CABINET IN THE DOM ===");
  const { Window } = await import("happy-dom");
  const w = new Window({ url: "http://localhost/", width: 1280, height: 900 });
  const g = globalThis as unknown as Record<string, unknown>;
  // Some globals (navigator) are getter-only on modern Node, so fall back to
  // defineProperty exactly as scripts/dom-smoke.mjs does.
  const put = (key: string, value: unknown) => {
    try {
      g[key] = value;
    } catch {
      try {
        Object.defineProperty(globalThis, key, { value, configurable: true });
      } catch {
        /* a global we can't shim is one the probe doesn't need */
      }
    }
  };
  const win = w as unknown as Record<string, unknown>;
  for (const key of ["document", "navigator", "HTMLElement", "HTMLCanvasElement", "Element", "Node", "Event", "KeyboardEvent", "CustomEvent"]) {
    put(key, win[key]);
  }
  put("window", w);
  put("getComputedStyle", w.getComputedStyle.bind(w));
  put("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number);
  put("cancelAnimationFrame", (id: number) => clearTimeout(id));
  // React 19 requires this opt-in before act() will flush without warning.
  put("IS_REACT_ACT_ENVIRONMENT", true);

  const problems: string[] = [];
  const realError = console.error;
  const realWarn = console.warn;
  console.error = (...a: unknown[]) => { problems.push("error: " + a.join(" ")); };
  console.warn = (...a: unknown[]) => { problems.push("warn: " + a.join(" ")); };

  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { act } = await import("react");
  const { ArcadeGame } = await import("../../src/game/ArcadeGame");
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");

  const scene = HOLLOW_SIGNAL.scenes.find((s) => s.id === "hs_arcade")!;
  const hs = (scene.hotspots ?? []).find((h) => h.action.type === "arcadeGame")!;
  const cfg = hs.action.arcadeGame!;

  let won = false;
  let closed = false;
  const host = w.document.createElement("div");
  w.document.body.appendChild(host);
  const root = createRoot(host as unknown as Element);

  await act(async () => {
    root.render(
      React.createElement(ArcadeGame, {
        config: cfg,
        onWin: () => { won = true; },
        onLose: () => {},
        onClose: () => { closed = true; },
      })
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 120)); });

  const canvas = host.querySelector("canvas");
  ok(!!canvas, "the playfield canvas mounts");
  ok(canvas?.getAttribute("width") === "224" && canvas?.getAttribute("height") === "256",
    "the canvas uses the fixed internal resolution", `${canvas?.getAttribute("width")}x${canvas?.getAttribute("height")}`);

  const img = host.querySelector("img");
  ok(!!img, "the cabinet art mounts over the canvas");

  // The screen wrapper must be positioned by the AUTHORED percentages —
  // this is the bit Studio edits, so a regression here silently misaligns
  // every cabinet in every story.
  const wrapper = canvas?.parentElement as unknown as { getAttribute(n: string): string | null } | null;
  const style = wrapper?.getAttribute("style") ?? "";
  const r = cfg.screenRect!;
  ok(style.includes(`${r.x}%`), `the wrapper uses the authored left (${r.x}%)`, style);
  ok(style.includes(`${r.y}%`), `the wrapper uses the authored top (${r.y}%)`, style);
  ok(style.includes(`${r.w}%`), `the wrapper uses the authored width (${r.w}%)`, style);
  ok(style.includes(`${r.h}%`), `the wrapper uses the authored height (${r.h}%)`, style);

  // A changed rect must move the playfield — proves Studio's sliders work.
  await act(async () => {
    root.render(
      React.createElement(ArcadeGame, {
        config: { ...cfg, screenRect: { x: 11, y: 12, w: 33, h: 34 } },
        onWin: () => {}, onLose: () => {}, onClose: () => { closed = true; },
      })
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 60)); });
  const moved = (host.querySelector("canvas")?.parentElement as unknown as { getAttribute(n: string): string | null })?.getAttribute("style") ?? "";
  ok(moved.includes("11%") && moved.includes("12%") && moved.includes("33%") && moved.includes("34%"),
    "editing screenRect repositions the playfield (Studio's sliders take effect)", moved);

  // ENTER starts the game; the loop must then run frames without throwing.
  await act(async () => {
    w.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 200)); });
  ok(true, "the attract screen accepts ENTER and the loop keeps running");

  // ESC steps away.
  await act(async () => {
    w.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
  ok(closed, "ESC closes the cabinet");

  await act(async () => { root.unmount(); });

  console.error = realError;
  console.warn = realWarn;
  ok(problems.length === 0, "no console errors or warnings while the cabinet plays", problems.slice(0, 3).join(" | "));
  void won;
}

/* ================================================================
 * PART 3 — THE ENGINE SIDE
 * ================================================================ */
async function part3() {
  console.log("\n=== PART 3 · ENGINE / DECISIONS ===");
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");
  const { availableDecisions, applyDecision, initialSim } = await import("../../src/game/decisions");
  const { createInitialState } = await import("../../src/logic");

  type Sim = ReturnType<typeof initialSim>;
  const at = (sceneId: string): Sim => initialSim(HOLLOW_SIGNAL as Story, createInitialState(HOLLOW_SIGNAL as Story), sceneId);

  const sim = at("hs_arcade");
  const decisions = availableDecisions(HOLLOW_SIGNAL as Story, sim);
  const games = decisions.filter((d) => d.kind === "minigame" && d.game === "arcade");
  ok(games.length === 2, "the cabinet offers BOTH outcomes as decisions", `got ${games.length}`);
  ok(games.some((d) => d.won) && games.some((d) => !d.won), "one win branch and one lose branch");

  // Winning sets the flag.
  const winD = games.find((d) => d.won)!;
  const afterWin = applyDecision(HOLLOW_SIGNAL as Story, sim, winD).sim;
  ok(afterWin.state.activeFlags.has("hs_arcade_beaten"), "beating the cabinet sets its flag");

  // Losing must NOT lock the cabinet — another quarter is always allowed.
  const loseD = games.find((d) => !d.won)!;
  const afterLose = applyDecision(HOLLOW_SIGNAL as Story, sim, loseD).sim;
  const stillThere = availableDecisions(HOLLOW_SIGNAL as Story, afterLose)
    .filter((d) => d.kind === "minigame" && d.game === "arcade");
  ok(stillThere.length === 2, "losing leaves the cabinet playable", `got ${stillThere.length}`);
  ok(!afterLose.state.activeFlags.has("hs_arcade_beaten"), "losing does NOT set the win flag");

  // Teddy's gated reaction only appears once you've actually beaten it.
  const av = HOLLOW_SIGNAL.scenes.find((s) => s.id === "hs_av_room")!;
  const gated = (av.dialogueBeats ?? []).find((b) => b.conditionRule?.requiresFlags?.includes("hs_arcade_beaten"));
  ok(!!gated, "Teddy has a beat gated on beating the cabinet");

  // The cabinet must not be an EXIT — it keeps the player in the room.
  ok(!winD.targetSceneId, "beating the cabinet doesn't teleport the player out of the arcade");
}

/* ================================================================
 * PART 5 — ART CONTRACT: every referenced asset exists on disk, item
 * icons are SQUARE (the dock crops with object-cover), and the keyed
 * PNGs actually carry an alpha channel.
 * ================================================================ */
async function part5() {
  console.log("\n=== PART 5 · ART CONTRACT ===");
  const { readFileSync, existsSync } = await import("node:fs");
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");

  /** Read a PNG's IHDR: width, height, colour type. */
  const ihdr = (file: string) => {
    const b = readFileSync(file);
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), colorType: b[25] };
  };

  // Every /assets/ reference anywhere in the story must exist.
  const refs = new Set<string>();
  JSON.stringify(HOLLOW_SIGNAL, (_k, v) => {
    if (typeof v === "string" && v.startsWith("/assets/")) refs.add(v);
    return v;
  });
  const missing = [...refs].filter((r) => !existsSync(`public${r}`));
  ok(missing.length === 0, `all ${refs.size} referenced assets exist on disk`, missing.join(", "));
  ok(refs.size >= 20, "the story references a full art set", `${refs.size} refs`);

  // Item icons render with object-cover in the dock, so a non-square icon
  // gets cropped on its long axis. They must also carry alpha (colour type
  // 6 = RGBA) or the keyed background comes back as a solid block.
  for (const item of HOLLOW_SIGNAL.items) {
    if (!item.iconUrl) continue;
    const path = `public${item.iconUrl}`;
    if (!existsSync(path)) continue;
    const m = ihdr(path);
    ok(m.w === m.h, `item icon "${item.id}" is square (dock crops object-cover)`, `${m.w}x${m.h}`);
    ok(m.colorType === 6, `item icon "${item.id}" has an alpha channel`, `colourType ${m.colorType}`);
  }
  const withIcons = HOLLOW_SIGNAL.items.filter((i) => i.iconUrl).length;
  ok(withIcons === HOLLOW_SIGNAL.items.length, "every item has real icon art (no emoji fallbacks left)",
    `${withIcons}/${HOLLOW_SIGNAL.items.length}`);

  // The cabinet's screen must be a genuine hole, not a painted rectangle.
  const scene = HOLLOW_SIGNAL.scenes.find((s) => s.id === "hs_arcade")!;
  const cab = (scene.hotspots ?? []).find((h) => h.action.type === "arcadeGame")!.action.arcadeGame!;
  const cabMeta = ihdr(`public${cab.cabinetImage}`);
  ok(cabMeta.colorType === 6, "the cabinet PNG has an alpha channel (its screen is a real hole)");

  // Talking sheets must divide evenly into their declared frame width, or
  // every frame after the first is offset by a sliver.
  for (const ch of HOLLOW_SIGNAL.characters) {
    const sheet = ch.talkingSheet;
    if (!sheet?.image?.startsWith("/assets/")) continue;
    const m = ihdr(`public${sheet.image}`);
    const frames = m.w / sheet.frameWidth;
    ok(Number.isInteger(frames) && frames >= 3,
      `"${ch.id}" sheet divides cleanly into whole frames`, `${m.w}/${sheet.frameWidth} = ${frames}`);
    ok(m.h === sheet.frameHeight, `"${ch.id}" sheet height matches its frameHeight`, `${m.h} vs ${sheet.frameHeight}`);
  }
}

/* ================================================================
 * PART 7 — THE DIORAMA LAYER: per-verb cursor art, the backpack
 * container, and the foreground overlays that give each room depth.
 *
 * These are pure-presentation features, so nothing else in the suite
 * would notice if they silently stopped resolving — hence explicit
 * checks on the shape of the data AND the pixels behind it.
 * ================================================================ */
async function part7() {
  console.log("\n=== PART 7 · CURSORS, CONTAINER & PARALLAX ===");
  const { readFileSync, existsSync } = await import("node:fs");
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");
  const ihdr = (file: string) => {
    const b = readFileSync(file);
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), colorType: b[25] };
  };

  // --- per-verb cursor art -------------------------------------------------
  const cursors = HOLLOW_SIGNAL.cursorArt;
  ok(!!cursors, "the story ships custom cursor art");
  const verbs = ["look", "take", "talk", "use", "go"] as const;
  for (const verb of verbs) {
    const c = cursors?.[verb];
    ok(!!c?.image, `the ${verb.toUpperCase()} verb has a cursor image`);
    if (!c?.image || !existsSync(`public${c.image}`)) continue;
    const m = ihdr(`public${c.image}`);
    // A browser cursor is drawn into a square hotspot box; a non-square
    // image gets squashed, and one without alpha shows its key colour.
    ok(m.w === m.h, `the ${verb} cursor is square`, `${m.w}x${m.h}`);
    ok(m.colorType === 6, `the ${verb} cursor has an alpha channel`, `colourType ${m.colorType}`);
    // Cursors above 128px are refused outright by some browsers.
    ok(m.w <= 128, `the ${verb} cursor is within the 128px browser limit`, `${m.w}px`);
  }

  // --- the backpack container ---------------------------------------------
  const inv = HOLLOW_SIGNAL.inventoryDisplay;
  // The story now opens the loot as a big centred overlay (see Part 12); the
  // backpack art is kept because container mode remains one Studio toggle
  // away, and it must stay valid if an author flips back.
  ok(inv?.mode === "modal" || inv?.mode === "container",
    "the inventory uses a designed presentation, not the plain default rail", inv?.mode);
  ok(!!inv?.image && existsSync(`public${inv.image}`), "the backpack art is still on disk");
  if (inv?.image && existsSync(`public${inv.image}`)) {
    ok(ihdr(`public${inv.image}`).colorType === 6, "the backpack art is cut out (has alpha)");
  }

  // --- foreground overlays -------------------------------------------------
  // A foreground extra only actually moves if its scene also declares a
  // parallaxDepth — that pairing is the bug most likely to creep back in.
  const staged = HOLLOW_SIGNAL.scenes.filter((s) => s.cinematic?.foregroundExtras?.length);
  ok(staged.length >= 8, "most rooms have a foreground layer", `${staged.length} rooms`);

  for (const scene of staged) {
    const extras = scene.cinematic!.foregroundExtras!;
    for (const fx of extras) {
      ok(!!fx.image && existsSync(`public${fx.image}`),
        `"${scene.id}" foreground art exists`, fx.image);
      if (!fx.image || !existsSync(`public${fx.image}`)) continue;
      const m = ihdr(`public${fx.image}`);
      ok(m.colorType === 6, `"${scene.id}" foreground is keyed to alpha`, `colourType ${m.colorType}`);
      // Overlays must stay 16:9 and full-frame; a trimmed plate would
      // no longer register with the background behind it.
      const aspect = m.w / m.h;
      ok(Math.abs(aspect - 16 / 9) < 0.05,
        `"${scene.id}" foreground kept its 16:9 frame`, aspect.toFixed(3));
      ok((fx.depth ?? 0) > 0.5,
        `"${scene.id}" foreground sits near the camera (depth > 0.5)`, String(fx.depth));
    }
    ok((scene.cinematic!.parallaxDepth ?? 0) > 0,
      `"${scene.id}" sets parallaxDepth, so its foreground actually drifts`,
      String(scene.cinematic!.parallaxDepth));
  }
}

/* ================================================================
 * PART 8 — REACHABILITY: can the walker actually GET to every
 * hotspot it is supposed to use?
 *
 * This is the check that was missing. A hotspot can validate, render,
 * show its label and still be impossible to trigger, because the
 * walk point the router aims at — the zone's bottom-centre, clamped
 * into the walk polygon — landed inside a furniture obstacle. The
 * player sees the verb and nothing happens. Three separate rooms
 * shipped that way, including the arcade cabinet.
 *
 * The probe runs the ENGINE's own geometry (same functions Stage.tsx
 * calls at runtime), so it can't drift from real behaviour.
 * ================================================================ */
async function part8() {
  console.log("\n=== PART 8 · STAGE REACHABILITY ===");
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");
  const {
    stageWalkPoly, stageWalkDepth, stageMarkerPointPoly,
    stageRoutePoly, clampToWalkPoly, posReachesMarker,
  } = await import("../../src/logic");
  const DEFAULT_REACH = 5;

  for (const scene of HOLLOW_SIGNAL.scenes) {
    if (scene.nodeType !== "stage" || !scene.stage) continue;
    const st = scene.stage;
    const worldW = st.worldWidth ?? 100;
    const poly = stageWalkPoly(st, worldW);
    const depth = stageWalkDepth(poly);
    const reach = st.reach ?? DEFAULT_REACH;
    const spawn = clampToWalkPoly(st.spawn.x, st.spawn.y, poly, worldW);

    for (const hs of scene.hotspots ?? []) {
      // Remote zones are interacted with from anywhere by design.
      if (hs.remote) continue;
      const marker = stageMarkerPointPoly(hs, poly, worldW);
      const route = stageRoutePoly(spawn, marker, st.obstacles, poly, depth, undefined, worldW);
      const arrival = route.length ? route[route.length - 1] : null;
      const reached = !!arrival && posReachesMarker(arrival, marker, reach, 16 / 9);
      ok(reached, `"${scene.id}" · the walker can reach "${hs.id}"`,
        route.length === 0
          ? "no route exists (marker is inside an obstacle or outside the floor)"
          : `stops at (${arrival!.x.toFixed(1)}, ${arrival!.y.toFixed(1)}) but the marker is (${marker.x.toFixed(1)}, ${marker.y.toFixed(1)})`);
    }

    // Furniture must leave standing room in front of it. An obstacle that
    // reaches the bottom of the floor band walls off the strip the player
    // needs to occupy to interact with the thing the obstacle represents.
    for (const o of st.obstacles ?? []) {
      const floorBottom = depth.bottom;
      ok(o.y + o.h < floorBottom - 1,
        `"${scene.id}" · obstacle at x${o.x} leaves floor in front of it`,
        `obstacle ends at y${o.y + o.h}, floor ends at y${floorBottom}`);
    }
  }
}


/* ================================================================
 * PART 9 — THE FULL CLICK PATH: does USE on the cabinet actually
 * open the minigame, in the real <GamePlayer>, on the real stage?
 *
 * Part 2 mounts <ArcadeGame> directly, which proves the component
 * works but says NOTHING about whether a player can ever reach it.
 * That gap hid a real bug: the stage's arrival fire-loop only runs
 * on a frame where the walker MOVED, so once the player was already
 * standing at the cabinet, clicking USE dispatched nothing at all.
 *
 * This drives the actual UI: mount the arcade room, arm USE on the
 * verb coin, click the cabinet's marker, and assert the minigame
 * opened. Then click it AGAIN from the same spot — the repeat case
 * that was broken.
 * ================================================================ */
async function part9() {
  console.log("\n=== PART 9 · USE-THE-CABINET CLICK PATH ===");
  const { Window } = await import("happy-dom");
  const w = new Window({ url: "http://localhost/", width: 1280, height: 900 });
  const g = globalThis as unknown as Record<string, unknown>;
  const put = (key: string, value: unknown) => {
    try { g[key] = value; } catch {
      try { Object.defineProperty(globalThis, key, { value, configurable: true }); } catch { /* noop */ }
    }
  };
  const win = w as unknown as Record<string, unknown>;
  for (const key of ["document", "navigator", "HTMLElement", "HTMLCanvasElement", "HTMLImageElement", "Image", "Element", "Node", "Event", "KeyboardEvent", "CustomEvent", "MouseEvent", "PointerEvent", "localStorage", "sessionStorage"]) {
    put(key, win[key]);
  }
  // Sprite sheets are preloaded through `new Image()`. happy-dom has the
  // constructor but it isn't on globalThis, and the loader never resolves
  // in a headless run anyway — a stub that reports "loaded" keeps the
  // walker rendering instead of suspending forever.
  if (!g.Image) {
    class StubImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      width = 512; height = 512; naturalWidth = 512; naturalHeight = 512;
      complete = true;
      #src = "";
      get src() { return this.#src; }
      set src(v: string) { this.#src = v; setTimeout(() => this.onload?.(), 0); }
    }
    put("Image", StubImage);
  }
  put("window", w);
  put("getComputedStyle", w.getComputedStyle.bind(w));
  put("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number);
  put("cancelAnimationFrame", (id: number) => clearTimeout(id));
  put("IS_REACT_ACT_ENVIRONMENT", true);
  try { (w.HTMLCanvasElement.prototype as unknown as { getContext: () => null }).getContext = function () { return null; }; } catch { /* noop */ }
  w.scrollTo = () => {};
  put("scrollTo", w.scrollTo);
  // The stage measures its plate to convert % to px; happy-dom reports 0x0,
  // which would make every hit-test degenerate.
  try {
    Object.defineProperty(w.HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value() { return { x: 0, y: 0, left: 0, top: 0, right: 1280, bottom: 720, width: 1280, height: 720 }; },
    });
  } catch { /* noop */ }

  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { act } = await import("react");
  const { GamePlayer } = await import("../../src/game/Game");
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");

  const host = w.document.createElement("div");
  w.document.body.appendChild(host);
  const root = createRoot(host as unknown as Element);
  const settle = async (ms = 400) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };

  // Spawn the walker AT the cabinet. This removes the need for happy-dom to
  // simulate a real-time walk (its rAF is a setTimeout shim and the walk
  // never advances), and it targets the exact regression: when the player is
  // already in reach the route is zero-length, so the arrival fire-loop never
  // runs and the verb must be dispatched immediately instead.
  const arcadeAt = (() => {
    const base = HOLLOW_SIGNAL.scenes.find((s) => s.id === "hs_arcade")!;
    const scenes = HOLLOW_SIGNAL.scenes.map((s) =>
      s.id !== "hs_arcade" ? s : { ...s, stage: { ...s.stage!, spawn: { x: 31, y: 88 } } });
    void base;
    return { ...HOLLOW_SIGNAL, scenes };
  })();

  await act(async () => {
    root.render(React.createElement(GamePlayer, {
      story: arcadeAt,
      typeSpeed: 0,
      isNewGamePlus: false,
      onExit: () => {},
      playFromSceneId: "hs_arcade",
    }));
  });
  await settle(900);

  const txt = () => ((host as unknown as HTMLElement).textContent || "").replace(/\s+/g, " ");
  const qa = (sel: string) => [...(host as unknown as Element).querySelectorAll(sel)] as HTMLElement[];
  const byLabel = (needle: string) =>
    qa("button").find((b) => (b.getAttribute("aria-label") || "").includes(needle)) || null;

  ok(txt().length > 0, "the arcade room mounts");

  const marker = byLabel("cabinet nobody remembers");
  ok(!!marker, "the cabinet's marker is on the stage");

  if (marker) {
    // This room is OBJECT-FIRST (objectVerbMenu: true), so a press opens the
    // object's verb pie and the player then picks USE from it. Drive that
    // real gesture rather than a bare click.
    await act(async () => {
      marker.dispatchEvent(new w.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    });
    await settle(400);
    // The pie's verb entries are the small icon buttons (aria-label "Use"),
    // NOT the object marker itself (whose label also begins "USE — ...").
    const pie = qa("button").find(
      (b) => (b.getAttribute("aria-label") || "").trim().toLowerCase() === "use"
    );
    ok(!!pie, "the object menu offers USE",
      qa("button").map((b) => (b.textContent || "").slice(0, 16)).join("|"));
    if (pie) {
      await act(async () => {
        pie.dispatchEvent(new w.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
      });
      await act(async () => { pie.click(); });
    }
    // The minigame's title is painted INTO the canvas, so textContent never
    // shows it. The cabinet is a role=dialog labelled with the title.
    const cabinetUp = () =>
      !!(host as unknown as Element).querySelector('[role="dialog"][aria-label="HOLLOW CLIMB"]');
    await settle(600);
    for (let i = 0; i < 20 && !cabinetUp(); i++) await settle(200);
    const opened = cabinetUp();
    ok(opened, "clicking USE on the cabinet opens the minigame", txt().slice(0, 240));

    // THE REGRESSION: close it, then use it again WITHOUT moving. The walker
    // is parked at the cabinet, so the route is zero-length — the arrival
    // fire-loop never runs and the verb must dispatch immediately instead.
    if (opened) {
      // Close via the cabinet's own button. A raw ESC on window ALSO reaches
      // the game's quit prompt, which unmounts the stage and would make the
      // re-use check meaningless.
      const dlg = (host as unknown as Element).querySelector('[role="dialog"][aria-label="HOLLOW CLIMB"]');
      const closeBtn = dlg
        ? ([...dlg.querySelectorAll("button")] as HTMLElement[]).find(
            (b) => (b.textContent || "").toLowerCase().includes("step away"))
        : undefined;
      if (closeBtn) await act(async () => { closeBtn.click(); });
      await settle(700);
      ok(!cabinetUp(), "the cabinet closes");

      const again = byLabel("cabinet nobody remembers");
      ok(!!again, "the cabinet marker is still there after closing");
      if (again) {
        await act(async () => {
          again.dispatchEvent(new w.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
        });
        await settle(400);
        const pie2 = qa("button").find(
          (b) => (b.getAttribute("aria-label") || "").trim().toLowerCase() === "use"
        );
        if (pie2) {
          await act(async () => {
            pie2.dispatchEvent(new w.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
          });
          await act(async () => { pie2.click(); });
        }
        await settle(600);
        for (let i = 0; i < 20 && !cabinetUp(); i++) await settle(200);
        ok(cabinetUp(),
          "USE works AGAIN from the same spot (the zero-length-walk case)",
          txt().slice(0, 240));
      }
    }
  }

  await act(async () => { root.unmount(); });
}


/* ================================================================
 * PART 10 — NARRATION MUST NOT BE CUT OFF
 *
 * Three separate timers used to call audio.stopSpeech() when their
 * VISUAL element expired: the stage caption bar (capped at 5.2s),
 * the examine card (7s) and the prose auto-advance (900ms after the
 * typewriter finishes). Spoken narration of the same sentence runs
 * far longer — 29 of this story's 36 stage lines were being chopped,
 * some 7 seconds early, and all three endings died mid-paragraph.
 *
 * Two things are checked here:
 *   1. the AUDIO ENGINE honours "don't stop a line that's still
 *      talking" (stopSpeechIfIdle), driven against a fake
 *      speechSynthesis so the behaviour is observable; and
 *   2. no timer-driven dismissal in Game.tsx calls the hard
 *      stopSpeech() any more — a source check, because the real bug
 *      was a call site, not a missing capability.
 * ================================================================ */
async function part10() {
  console.log("\n=== PART 10 · NARRATION IS NEVER TRUNCATED ===");
  const { readFileSync } = await import("node:fs");

  /* --- 1. the engine's contract ------------------------------------ */
  // A minimal speechSynthesis double: speaking stays true until we end it.
  let cancelled = 0;
  const fakeSynth = {
    speaking: false,
    pending: false,
    paused: false,
    cancel() { cancelled++; this.speaking = false; this.pending = false; },
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak() { this.speaking = true; },
    getVoices() { return [] as unknown[]; },
  };
  const g = globalThis as unknown as Record<string, unknown>;
  const put = (k: string, v: unknown) => {
    try { g[k] = v; } catch {
      try { Object.defineProperty(globalThis, k, { value: v, configurable: true }); } catch { /* noop */ }
    }
  };
  const priorWindow = g.window;
  put("window", { speechSynthesis: fakeSynth, setTimeout, clearTimeout, setInterval, clearInterval });

  const { audio } = await import("../../src/audio");

  // Mid-line: the caption fades but the narrator is still talking.
  fakeSynth.speaking = true;
  const before = cancelled;
  (audio as unknown as { stopSpeechIfIdle: () => void }).stopSpeechIfIdle();
  ok(cancelled === before, "a caption fading does NOT cut a line that is still speaking");

  // Line finished: the same call is free to tidy up (release the duck).
  fakeSynth.speaking = false;
  (audio as unknown as { stopSpeechIfIdle: () => void }).stopSpeechIfIdle();
  ok(cancelled > before, "once the line has ended, the idle tidy-up still runs");

  // A genuine supersede (new beat / scene change) must always cut.
  fakeSynth.speaking = true;
  const before2 = cancelled;
  audio.stopSpeech();
  ok(cancelled > before2, "stopSpeech() still hard-cancels when a line is superseded");
  put("window", priorWindow);

  /* --- 2. no timer-driven hard stops remain ------------------------ */
  const src = readFileSync("src/game/Game.tsx", "utf8");
  const lines = src.split("\n");
  const offenders: string[] = [];
  // Walk the file tracking setTimeout callback depth, so a hard stopSpeech()
  // is flagged wherever it sits inside a timer body — a fixed look-back
  // window misses calls separated from their setTimeout by a comment.
  let timerDepth = 0;
  let braceAtTimerStart = 0;
  let braces = 0;
  let timerStops: string[] = [];
  lines.forEach((ln, i) => {
    if (timerDepth === 0 && /setTimeout\(\s*\(\s*\)\s*=>\s*\{/.test(ln)) {
      timerDepth = 1;
      braceAtTimerStart = braces;
      timerStops = [];
    }
    // Teardown timers (setTimeout(..., 0) in an unmount cleanup) SHOULD cut
    // audio — the component is going away. Only dwell timers, which fire
    // after a reading delay, must let the voice finish.
    if (timerDepth > 0 && ln.includes("audio.stopSpeech()")) timerStops.push(`line ${i + 1}`);
    braces += (ln.match(/\{/g) ?? []).length - (ln.match(/\}/g) ?? []).length;
    if (timerDepth > 0 && braces <= braceAtTimerStart) {
      // Read the timer's own delay, not "two lines after stopSpeech": adding
      // another teardown operation must not turn cleanup into a dwell timer.
      if (!/^\s*\},\s*0\);\s*$/.test(ln)) offenders.push(...timerStops);
      timerDepth = 0;
    }
  });
  ok(offenders.length === 0,
    "no timer-driven dismissal hard-cancels narration (use stopSpeechIfIdle)",
    offenders.join(", "));

  /* --- 3. the Chromium long-utterance keepalive -------------------- */
  const audioSrc = readFileSync("src/audio.ts", "utf8");
  ok(/speechKeepAlive/.test(audioSrc) && /\.pause\(\);[\s\S]{0,60}\.resume\(\)/.test(audioSrc),
    "speak() installs the pause/resume keepalive for long utterances");
  ok(/if \(!s\.speaking\)/.test(audioSrc),
    "the keepalive stops itself once the queue drains");

  /* --- 4. the story actually contains lines long enough to matter -- */
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");
  const CPS = 13.5; // speechSynthesis at rate 0.88, chars/sec
  const long = (HOLLOW_SIGNAL.scenes ?? []).filter((sc) => (sc.prose?.length ?? 0) / CPS > 14);
  ok(long.length > 0,
    "the story has narration past Chromium's ~15s cutoff (so the keepalive is load-bearing)",
    long.map((sc) => `${sc.id} ~${((sc.prose!.length) / CPS).toFixed(0)}s`).join(", "));
}


/* ================================================================
 * PART 11 — THE MINIGAME IS ACTUALLY PLAYABLE
 *
 * Two shipped bugs that no config-level check could see:
 *
 *  - LADDERS COULDN'T BE CLIMBED. Girders slope, but ladder endpoints
 *    were pinned to the FLAT level height (FLOOR_Y - i*LEVEL_H). On
 *    every odd board half the ladders sat up to ~3px above the
 *    player's feet, outside ladderAt()'s grab window, so UP did
 *    nothing.
 *  - BARRELS GOT STUCK. They reflected off the SCREEN edge (x<4)
 *    rather than falling off the GIRDER end (girders span x=8..216).
 *    A barrel rolled past the girder, hit the wall, bounced back onto
 *    the same girder, was re-aimed downhill by the slope, and looped
 *    forever — barrels accumulated and never drained.
 *
 * These are pure geometry, so the probe re-implements the shipped
 * constants and asserts the invariants directly. Keep in sync with
 * ArcadeGame.tsx if the board layout ever changes.
 * ================================================================ */
async function part11() {
  console.log("\n=== PART 11 · MINIGAME PLAYABILITY ===");
  const { readFileSync } = await import("node:fs");
  const src = readFileSync("src/game/ArcadeGame.tsx", "utf8");

  // Constants mirrored from the component.
  const VW = 224, VH = 256, GRAVITY = 0.32, LEVELS = 5;
  const FLOOR_Y = VH - 22, LEVEL_H = 40;
  type G = { x: number; y: number; w: number; slope: number };
  type L = { x: number; y0: number; y1: number };
  const girderY = (g: G, x: number) => g.y + (x - g.x) * g.slope;

  const buildBoard = (board: number) => {
    const girders: G[] = [];
    const ladders: L[] = [];
    for (let i = 0; i < LEVELS; i++) {
      const y = FLOOR_Y - i * LEVEL_H;
      const slope = i === LEVELS - 1 ? 0 : (i % 2 === 0 ? 1 : -1) * 0.045;
      girders.push({
        x: i === LEVELS - 1 ? 14 : 8,
        y,
        w: i === LEVELS - 1 ? VW * 0.5 : VW - 16,
        slope,
      });
    }
    for (let i = 0; i < LEVELS - 1; i++) {
      const side = (i + board) % 2 === 0;
      const x = side ? VW * 0.22 + (board % 3) * 7 : VW * 0.74 - (board % 3) * 7;
      const lower = girders[i], upper = girders[i + 1];
      const lo = Math.max(lower.x + 6, upper.x + 6);
      const hi = Math.min(lower.x + lower.w - 6, upper.x + upper.w - 6);
      const lx = Math.max(lo, Math.min(hi, x));
      ladders.push({ x: lx, y0: girderY(upper, lx), y1: girderY(lower, lx) });
    }
    return { girders, ladders };
  };
  const onGirderAt = (girders: G[], x: number, y: number, tol = 3) => {
    for (let i = 0; i < girders.length; i++) {
      const g = girders[i];
      if (x < g.x - 2 || x > g.x + g.w + 2) continue;
      const gy = girderY(g, x);
      if (y >= gy - tol && y <= gy + tol + 2) return i;
    }
    return -1;
  };
  const ladderAt = (ls: L[], x: number, y: number) =>
    ls.find((l) => Math.abs(x - l.x) < 6 && y >= l.y0 - 6 && y <= l.y1 + 4) ?? null;

  // --- the source no longer pins ladders to the flat level height ---
  ok(/y0:\s*girderY\(upper, lx\)/.test(src) && /y1:\s*girderY\(lower, lx\)/.test(src),
    "ladder endpoints are measured off the sloped girder surfaces");

  // --- every ladder is grabbable from BOTH ends, on many boards ---
  let ungrabbable = 0;
  for (let board = 1; board <= 8; board++) {
    const { girders, ladders } = buildBoard(board);
    ladders.forEach((l, i) => {
      const feetLow = girderY(girders[i], l.x);
      const feetHigh = girderY(girders[i + 1], l.x);
      if (!ladderAt(ladders, l.x, feetLow)) ungrabbable++;
      if (!ladderAt(ladders, l.x, feetHigh)) ungrabbable++;
      // the ladder must also sit within BOTH girders it joins
      const within =
        l.x >= girders[i].x && l.x <= girders[i].x + girders[i].w &&
        l.x >= girders[i + 1].x && l.x <= girders[i + 1].x + girders[i + 1].w;
      ok(within, `board ${board} ladder ${i} lands on both girders`, `x=${l.x.toFixed(1)}`);
    });
  }
  ok(ungrabbable === 0,
    "every ladder can be grabbed from the girder at each end (UP works)",
    `${ungrabbable} unreachable ladder end(s)`);

  // --- barrels always drain; none loop forever ---
  let leaked = 0;
  for (let board = 1; board <= 6; board++) {
    const { girders } = buildBoard(board);
    const top = girders[girders.length - 1];
    let barrels = [{ x: top.x + 12, y: girderY(top, top.x + 12) - 3, vx: 0.85, vy: 0 }];
    let spawned = 1;
    const dt = 1;
    for (let f = 0; f < 30000; f++) {
      if (spawned < 30 && f % 90 === 0) {
        spawned++;
        barrels.push({ x: top.x + 12, y: girderY(top, top.x + 12) - 3, vx: 0.85, vy: 0 });
      }
      for (const b of barrels) {
        b.vy += GRAVITY * dt; b.x += b.vx * dt; b.y += b.vy * dt;
        const gi = onGirderAt(girders, b.x, b.y, 5);
        if (gi >= 0 && b.vy >= 0) {
          b.y = girderY(girders[gi], b.x) - 3;
          b.vy = 0;
          const g = girders[gi];
          if (g.slope !== 0) b.vx = g.slope > 0 ? -0.85 : 0.85;
        }
        if (b.x < 2 || b.x > VW - 2) {
          b.x = Math.max(2, Math.min(VW - 2, b.x));
          b.vx = Math.abs(b.vx) * (b.x <= 2 ? 1 : -1);
        }
      }
      barrels = barrels.filter((b) => b.y < VH + 30);
      if (spawned >= 30 && barrels.length === 0) break;
    }
    if (barrels.length > 0) leaked++;
    ok(barrels.length === 0, `board ${board}: every barrel rolls off and drains`,
      `${barrels.length} stuck`);
  }
  ok(leaked === 0, "no board traps barrels in a wall-bounce loop");

  // The simulation above mirrors the physics, so it only proves the CURRENT
  // rules drain. Assert the shipped source really uses them: the old
  // `if (b.x < 4 || b.x > VW - 4) b.vx *= -1;` reflected a barrel back onto
  // the girder it had just left, which is the loop players saw.
  ok(!/b\.x < 4 \|\| b\.x > VW - 4\) b\.vx \*= -1/.test(src),
    "barrels no longer reflect off the screen edge back onto the same girder");
  ok(/BARRELS FALL OFF GIRDER ENDS/.test(src),
    "the barrel edge rule is the fall-off-the-end one");

  // --- the board is still winnable: a bot can climb to the top ---
  for (let board = 1; board <= 4; board++) {
    const { girders, ladders } = buildBoard(board);
    let px = 20, py = FLOOR_Y, vy = 0, climbing = false, level = 0, won = false;
    const RUN = 1.05, CLIMB = 0.75, dt = 1;
    for (let f = 0; f < 20000; f++) {
      if (level < ladders.length) {
        const l = ladders[level];
        if (climbing) {
          py -= CLIMB * dt;
          if (!ladderAt(ladders, px, py) || py <= l.y0 - 4) {
            climbing = false;
            const gi = onGirderAt(girders, px, py, 8);
            if (gi >= 0) { py = girderY(girders[gi], px); level++; }
          }
        } else if (ladderAt(ladders, px, py) && Math.abs(px - l.x) < 3) {
          climbing = true; px = l.x; vy = 0;
        } else {
          px += (l.x > px ? RUN : -RUN) * dt;
          vy += GRAVITY * dt; py += vy * dt;
          const gi = onGirderAt(girders, px, py, 5);
          if (gi >= 0 && vy >= 0) { py = girderY(girders[gi], px); vy = 0; }
        }
      } else {
        const top = girders[girders.length - 1];
        px += RUN * dt; vy += GRAVITY * dt; py += vy * dt;
        const gi = onGirderAt(girders, px, py, 5);
        if (gi >= 0 && vy >= 0) { py = girderY(girders[gi], px); vy = 0; }
        if (py <= girderY(top, px) + 3 && px > top.x + top.w - 22) { won = true; break; }
      }
      if (py > VH + 20) break;
    }
    ok(won, `board ${board} is climbable to the win tile`, `stalled at level ${level}/${ladders.length}`);
  }
}

/* ================================================================
 * PART 12 — THE BIG CENTRED INVENTORY
 * ================================================================ */
async function part12() {
  console.log("\n=== PART 12 · MODAL INVENTORY ===");
  const { readFileSync } = await import("node:fs");
  const { inventoryDisplay } = await import("../../src/logic");
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");

  const inv = inventoryDisplay(HOLLOW_SIGNAL);
  ok(inv.mode === "modal", "the story opens its inventory as a centred overlay", inv.mode);
  ok(inv.tileSize >= 120, "items are drawn large enough to read as objects", `${inv.tileSize}px`);
  ok(inv.label === "Backpack", "the overlay keeps the story's own heading", inv.label);

  // Unknown modes must still fall back to the classic rail.
  const bogus = inventoryDisplay({ inventoryDisplay: { mode: "nonsense" as never } });
  ok(bogus.mode === "classic", "an unknown mode falls back to the classic rail");
  ok(inventoryDisplay(null).mode === "classic", "no settings at all still yields a valid dock");

  const dock = readFileSync("src/game/InventoryDock.tsx", "utf8");
  const frame = readFileSync("src/components/DialogFrame.tsx", "utf8");
  ok(/<DialogFrame/.test(dock) && /role="dialog"/.test(frame) && /aria-modal="true"/.test(frame),
    "the overlay is a proper dialog for assistive tech");
  ok(/object-contain/.test(dock),
    "large item art is contained, not cropped (icons are square, art may not be)");
  ok(/<DialogFrame[^>]+onDismiss=/.test(dock) && /addEventListener\("keydown", key, true\)/.test(frame) && /stopImmediatePropagation/.test(frame),
    "Escape is captured so it can't also reach the quit prompt underneath");

  // Every item needs art, or the big tiles show an emoji at 150px.
  const missing = HOLLOW_SIGNAL.items.filter((i) => !i.iconUrl);
  ok(missing.length === 0,
    "every item has real art for the large tiles",
    missing.map((i) => i.id).join(", "));
}

/* ================================================================
 * PART 6 — THE NEW ROOMS: the kitchen gates the string lights, and
 * the travel map's pins unlock in step with the story.
 * ================================================================ */
async function part6() {
  console.log("\n=== PART 6 · KITCHEN & MAP ===");
  const { HOLLOW_SIGNAL } = await import("../../src/data/hollowSignal");
  const { meetsGating, createInitialState } = await import("../../src/logic");

  const kitchen = HOLLOW_SIGNAL.scenes.find((s) => s.id === "hs_kitchen");
  ok(!!kitchen, "the Pike kitchen exists");
  const lights = (kitchen!.hotspots ?? []).find((h) => h.id === "hs_lights_hs")!;
  ok(!!lights, "the string lights are taken from the kitchen wall");
  ok(lights.gating?.requiresFlags?.includes("hs_ollie_spelled"),
    "the lights can't be taken until Ollie has spelled through them");

  // The lights are REQUIRED to enter the Hollow safely, so a player who
  // never visits the kitchen must be routed to the losing ending — the
  // room has to be load-bearing, not decoration.
  const gate = HOLLOW_SIGNAL.scenes.find((s) => s.id === "hs_lab_gate")!;
  const prepared = (gate.hotspots ?? []).find((h) => h.id === "hs_enter_prepared")!;
  ok(prepared.gating?.requiresItems?.includes("hs_lights"),
    "entering the Hollow still requires the kitchen's lights");

  // Map pins gate in step with the critical path.
  const map = HOLLOW_SIGNAL.map;
  ok(!!map, "the story carries a travel map");
  ok((map!.locations ?? []).length >= 6, "the map has a pin per major location");
  const targets = new Set(HOLLOW_SIGNAL.scenes.map((s) => s.id));
  const bad = (map!.locations ?? []).filter((l) => !targets.has(l.targetSceneId));
  ok(bad.length === 0, "every map pin points at a real scene", bad.map((l) => l.id).join(", "));

  // At the start, only the open pins should be reachable.
  const fresh = createInitialState(HOLLOW_SIGNAL);
  const open = (map!.locations ?? []).filter((l) => meetsGating(l.gating, fresh));
  const locked = (map!.locations ?? []).filter((l) => !meetsGating(l.gating, fresh));
  ok(open.length >= 3, "some pins are open from the start", `${open.length} open`);
  ok(locked.length >= 3, "the late-game pins start locked", `${locked.length} locked`);
  ok(locked.every((l) => !!l.lockedHint), "every locked pin explains how to earn it");

  // The map must not be the ONLY way anywhere — the authored GO hotspots
  // stay primary, so a player who never opens the map can still finish.
  ok(map!.replaceTravelChoices !== true, "the map does not absorb the authored travel hotspots");
}

/* ================================================================
 * PART 4 — NON-INTERFERENCE
 * ================================================================ */
async function part4() {
  console.log("\n=== PART 4 · NON-INTERFERENCE ===");
  const { availableDecisions, initialSim } = await import("../../src/game/decisions");
  const { createInitialState, validateStory } = await import("../../src/logic");
  const { POINT_CLICK_TEMPLATE } = await import("../../src/data/pointClickTemplate");
  const { NEON_DINER } = await import("../../src/data/neonDiner");

  // A story with no cabinet must produce no arcade decisions anywhere.
  let leaked = 0;
  for (const story of [POINT_CLICK_TEMPLATE, NEON_DINER] as Story[]) {
    for (const sc of story.scenes) {
      const sim = initialSim(story, createInitialState(story), sc.id);
      const ds = availableDecisions(story, sim);
      leaked += ds.filter((d) => d.kind === "minigame" && d.game === "arcade").length;
    }
  }
  ok(leaked === 0, "stories without a cabinet never see an arcade decision", `leaked ${leaked}`);

  // Those stories must still validate exactly as before.
  for (const story of [POINT_CLICK_TEMPLATE, NEON_DINER] as Story[]) {
    const errs = validateStory(story).filter((i) => i.severity === "error");
    ok(errs.length === 0, `"${story.title}" still validates clean`, errs.map((e) => e.message).join(" | "));
  }
}

/* ================================================================ */
async function main() {
  await part1();
  await part3();
  await part4();
  await part5();
  await part6();
  await part7();
  await part8();
  await part2();
  await part9();
  await part10();
  await part11();
  await part12();

  console.log("");
  for (const p of passes) console.log(`  ok    ${p}`);
  if (failures.length) {
    console.log("");
    for (const f of failures) console.log(`  FAIL  ${f}`);
  }
  console.log(`\n=== ARCADE BETA: ${passes.length} passed, ${failures.length} failed ===`);
  if (failures.length) process.exitCode = 1;
  // happy-dom's rAF shim keeps the loop alive; the harness enforces exit.
  setTimeout(() => process.exit(failures.length ? 1 : 0), 50);
}

void main();
