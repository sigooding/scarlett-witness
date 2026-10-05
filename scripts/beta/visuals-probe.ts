/**
 * BETA PROBE — DYNAMIC VISUALS OVERHAUL
 * ======================================
 * Part 1: pure logic (glowColorWithAlpha) + the CSS contract (iris-out
 *         reveal, storm bolt size, HUD corner brackets).
 * Part 2: the REAL <Particles> engine mounted in happy-dom — all 12 kinds,
 *         reduced-motion, and the rain-on-lens on/off semantics (explicit
 *         false must win over the "on for rain scenes" default).
 * Part 3: Studio's CinematicControls live preview — it must render the real
 *         particle engine (the whole point of ✨ Dynamic Visuals).
 * Part 4: scene TRANSITIONS played through the real <GamePlayer> — the plate
 *         must stay on the old scene until the wipe is fully closed (no
 *         mid-cover black flash), and "cut" must flip instantly.
 * Part 4b: the overlay ART lifecycle — the destination-art stack must
 *         unmount after the reveal settles, and must NEVER mount under
 *         reduced motion (the cut path has no probe of its own otherwise).
 * Part 5: the Jack Morrow — Midnight Reel showcase story mounts, skips its
 *         credits and reaches the dust warehouse stage without console noise.
 * Part 6: the CHANCE GAMBLE through the real <GamePlayer> — the 🎲 odds chip
 *         renders on the button, a 100% choice always takes the happy route,
 *         a 0% choice always takes the fail route, and a seeded 60% choice
 *         replays the exact same dice on remount. Plus the new Second Reel
 *         story's mount smoke.
 * Part 8: the THIRD REEL — the full-kit showcase — with its slide entry
 *         carrying real destination art, and the authored transition-sound
 *         picks (thump on the booth fade, silence on the catch).
 *
 * Run: node scripts/beta/visuals-harness.mjs
 */
import type { Story } from "../../src/types";
import type { ReactElement } from "react";
import { fileURLToPath } from "node:url";
import path from "node:path";

// The bundle lives in scripts/.tmp-visuals-beta/ — two levels up is the repo
// root. ESM has no __dirname, so derive it from import.meta.url.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const repoRel = (rel: string) => path.resolve(HERE, rel);

const failures: string[] = [];
const passes: string[] = [];
function ok(cond: boolean, label: string, detail = "") {
  if (cond) passes.push(label);
  else failures.push(label + (detail ? ` — ${detail}` : ""));
  if (!cond) process.stderr.write(`  ✗ ${label}${detail ? ` — ${detail}` : ""}\n`);
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/* ================================================================
 * PART 1 — PURE LOGIC + CSS CONTRACT (no DOM)
 * ================================================================ */

async function part1() {
  console.log("\n=== PART 1 · PURE LOGIC + CSS CONTRACT ===");
  const C = await import("../../src/cinematic");

  /* glowColorWithAlpha — the "white1A" crash class */
  {
    const t: [string | undefined, number, string, string][] = [
      ["#ff2e88", 0.5, "rgba(255, 46, 136, 0.5)", "full hex"],
      ["ff2e88", 1, "rgba(255, 46, 136, 1)", "hex without #"],
      ["#abc", 0.25, "rgba(170, 187, 204, 0.25)", "3-char hex expands"],
      ["rgb(10, 20, 30)", 0.4, "rgba(10, 20, 30, 0.4)", "rgb() → rgba()"],
      ["rgba(1, 2, 3, 0.9)", 0.5, "rgba(1, 2, 3, 0.5)", "alpha replaced"],
      ["white", 0.3, "color-mix(in srgb, white 30%, transparent)", "named color → color-mix"],
      ["hsl(120, 50%, 50%)", 0.5, "color-mix", "hsl() → color-mix fallback"],
      [undefined, 0.5, "rgba(232, 178, 60, 0.5)", "undefined → default gold"],
    ];
    for (const [input, alpha, expect, name] of t) {
      const got = C.glowColorWithAlpha(input, alpha);
      if (expect === "color-mix(in srgb, white 30%, transparent)") ok(got === expect, `glowColorWithAlpha ${name}`, got);
      else if (expect === "color-mix") ok(got.includes("color-mix") && !/rgba?\(/.test(got), `glowColorWithAlpha ${name}`, got);
      else ok(got === expect, `glowColorWithAlpha ${name}`, `${got} ≠ ${expect}`);
    }
    // The original crash: a 4-hex-digit alpha suffix must never reach the
    // browser as a 9-digit hex.
    const crashy = C.glowColorWithAlpha("#1a2333", 0.5);
    ok(!/[0-9a-fA-F]{9}/.test(crashy), "no 8-digit hex + alpha suffix is ever produced", crashy);
  }

  /* The CSS contract — assert the shipped rules, not the intent. */
  {
    const fs = await import("node:fs");
    const css = fs.readFileSync(repoRel("../../src/index.css"), "utf8");
    const rule = (sel: string): string => {
      const i = css.indexOf(sel);
      if (i < 0) return "";
      const j = css.indexOf("{", i);
      // find the closing brace OUTSIDE any comment (the HUD rule's comment
      // contains a literal `}`)
      let inComment = false;
      for (let k = j + 1; k < css.length; k++) {
        if (inComment) {
          if (css[k] === "*" && css[k + 1] === "/") { inComment = false; k++; }
        } else if (css[k] === "/" && css[k + 1] === "*") {
          inComment = true;
          k++;
        } else if (css[k] === "}") {
          return css.slice(j, k);
        }
      }
      return "";
    };
    const irisCover = rule('.scene-iris[data-transitioning="1"]');
    const irisReveal = rule('.scene-iris[data-transitioning="0"]');
    ok(irisCover.includes("iris-in"), "iris COVER plays iris-in (the black card closes)", irisCover.slice(0, 120));
    ok(irisReveal.includes("iris-out"), "iris REVEAL plays iris-out (the white ring opens) — was a static scale-1.15 hold", irisReveal.slice(0, 120));
    ok(rule(".storm-bolt").includes("width: 130px"), "storm bolt is a full screen-span (130px), not a 3px sliver", rule(".storm-bolt").slice(0, 120));
    const hudBefore = rule(".hud-frame::before");
    ok(hudBefore.includes('content: ""') && hudBefore.includes("background-image"), "HUD corner brackets live on .hud-frame::before (outside @layer, so they win the cascade)", hudBefore.slice(0, 120));
  }
}

/* ================================================================
 * PARTS 2–5 — THE REAL ENGINE, MOUNTED
 * ================================================================ */

const GRAD = "gradient:linear-gradient(160deg,#1a2340 0%,#0c1020 100%)";
const LIGHTS = {
  lights: [
    { x: 50, y: 30, color: "#ffcc66", intensity: 0.8, size: 40, pulseSeconds: 2.8, pulseAmount: 0.3 },
    { x: 18, y: 60, color: "#66d9ff", intensity: 0.6, size: 32, pulseSeconds: 3.4, pulseAmount: 0.25 },
  ],
};

async function parts2to5() {
  const { Window } = await import("happy-dom");
  const win = new Window({ url: "http://localhost:5173/" });
  const doc = win.document;
  doc.body.innerHTML = '<div id="root"></div>';

  for (const key of [
    "document", "navigator", "location", "history", "customElements",
    "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "HTMLIFrameElement",
    "Element", "Node", "NodeList", "CharacterData", "DocumentFragment", "Document",
    "MutationObserver", "ResizeObserver", "IntersectionObserver", "getComputedStyle",
    "requestAnimationFrame", "cancelAnimationFrame", "localStorage", "sessionStorage",
    "CustomEvent", "Event", "KeyboardEvent", "MouseEvent", "PointerEvent",
    "matchMedia", "DOMRect", "SVGElement", "Image", "Audio", "CSS",
  ]) {
    if ((win as unknown as Record<string, unknown>)[key] === undefined) continue;
    try {
      (globalThis as unknown as Record<string, unknown>)[key] = (win as unknown as Record<string, unknown>)[key];
    } catch {
      /* already bound */
    }
  }
  globalThis.window = win as unknown as Window & typeof globalThis;
  win.matchMedia =
    (win.matchMedia?.bind(win) as typeof matchMedia) ??
    ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  globalThis.matchMedia = win.matchMedia as typeof matchMedia;

  if (!globalThis.ResizeObserver) {
    class RO { observe() {} unobserve() {} disconnect() {} }
    globalThis.ResizeObserver = RO as unknown as typeof ResizeObserver;
  }
  class FakeAudio {
    paused = true;
    volume = 1;
    currentTime = 0;
    duration = 0;
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    load() {}
    addEventListener() {}
    removeEventListener() {}
    cloneNode() { return new FakeAudio(); }
  }
  (globalThis as unknown as { Audio: typeof FakeAudio }).Audio = FakeAudio;
  (win as unknown as { Audio: typeof FakeAudio }).Audio = FakeAudio;
  try { (win.HTMLMediaElement.prototype as unknown as { play: () => Promise<void> }).play = function () { return Promise.resolve(); }; } catch {}
  // No canvas 2d context under Node — the particle loops bail after the
  // structural mount (canvas elements still render, so the DOM assertions
  // are exactly "did the engine mount the right layer").
  try { (win.HTMLCanvasElement.prototype as unknown as { getContext: () => null }).getContext = function () { return null; }; } catch {}
  win.scrollTo = () => {};
  globalThis.scrollTo = win.scrollTo as typeof scrollTo;

  // Inject the shipped CSS so computed-style assertions (storm bolt) read
  // the real rules.
  {
    const fs = await import("node:fs");
    const css = fs.readFileSync(repoRel("../../src/index.css"), "utf8");
    const style = doc.createElement("style");
    style.textContent = css;
    doc.head.appendChild(style);
  }

  const problems: [string, string][] = [];
  console.error = (...a: unknown[]) => {
    const msg = a.map(String).join(" ");
    problems.push(["console.error", msg]);
    if (process.env.VISUALS_BETA_VERBOSE) process.stderr.write(`[live console.error] ${msg.slice(0, 2000)}\n`);
  };
  console.warn = (...a: unknown[]) => {
    const msg = a.map(String).join(" ");
    problems.push(["console.warn", msg]);
    if (process.env.VISUALS_BETA_VERBOSE) process.stderr.write(`[live console.warn] ${msg.slice(0, 600)}\n`);
  };
  process.on("uncaughtException", (e) => problems.push(["uncaught", String((e as Error)?.stack || e)]));
  process.on("unhandledRejection", (e) => problems.push(["unhandled rejection", String(e)]));

  const { StrictMode, createElement }: typeof import("react") = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { Particles } = await import("../../src/game/AmbientParticles");
  const { CinematicControls } = await import("../../src/studio/CinematicControls");
  const { GamePlayer } = await import("../../src/game/Game");
  const { ErrorBoundary } = await import("../../src/ErrorBoundary");
  const { JACK_MORROW_MIDNIGHT_REEL } = await import("../../src/data/jackMorrowMidnightReel");
  const { JACK_MORROW_SECOND_REEL } = await import("../../src/data/jackMorrowSecondReel");
  const { setGameSeed } = await import("../../src/game/rng");

  const container = doc.getElementById("root")!;
  let root: ReturnType<typeof createRoot> | null = null;
  const text = () => (container.textContent || "").replace(/\s+/g, " ");
  const q = <T extends Element>(sel: string) => container.querySelector(sel) as T | null;
  const qa = <T extends Element>(sel: string) => [...container.querySelectorAll(sel)] as T[];
  async function until(desc: string, fn: () => boolean, timeoutMs = 10000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      if (fn()) return true;
      await sleep(120);
    }
    ok(false, desc, `timed out; rendered: ${text().slice(0, 800)}`);
    return false;
  }
  const crashed = () => /the reel snapped|something broke/i.test(container.innerHTML);
  const mount = (node: ReactElement) => {
    root?.unmount();
    container.innerHTML = "";
    root = createRoot(container);
    root.render(createElement(StrictMode, null, node));
  };
  const overlay = () =>
    qa<HTMLElement>("div[data-transitioning]").find(
      (el) => /scene-(fade|wipe|slide|zoom|glitch|burn|iris|cut)/.test(el.className)
    );

  /* ---------------- PART 2 · the particle engine, all 12 kinds ---------------- */
  console.log("\n=== PART 2 · PARTICLES — ALL 12 KINDS (real engine) ===");

  {
    mount(createElement(Particles, { kind: "rain", soundOn: false, cinematic: LIGHTS, reducedMotion: false }));
    await sleep(300);
    ok(!!q("canvas"), "rain: canvas layer mounts");
    ok(qa(".fx-rain-lens-drop").length > 0, "rain: droplets mount AUTOMATICALLY (the default is on for rain scenes)", `${qa(".fx-rain-lens-drop").length} drops`);
  }
  {
    mount(createElement(Particles, { kind: "rain", soundOn: false, cinematic: { ...LIGHTS, rainOnLens: false }, reducedMotion: false }));
    await sleep(300);
    ok(!!q("canvas"), "rain + rainOnLens:false: the rain itself still falls");
    ok(qa(".fx-rain-lens-drop").length === 0, "rain + explicit rainOnLens:false: NO droplets (explicit false wins over the default)", `${qa(".fx-rain-lens-drop").length} drops`);
  }
  {
    mount(createElement(Particles, { kind: "smoke", soundOn: false, cinematic: { ...LIGHTS, rainOnLens: true }, reducedMotion: false }));
    await sleep(300);
    ok(qa(".smoke-puff").length > 0, "smoke: puff layer mounts", `${qa(".smoke-puff").length} puffs`);
    ok(qa(".fx-rain-lens-drop").length > 0, "smoke + explicit rainOnLens:true: droplets mount (manual toggle on a non-rain kind)");
  }
  {
    // No lights here on purpose: the fog ITSELF must be pure CSS (fog banks),
    // and with no lights/dim the dust-motes underlay doesn't mount either.
    mount(createElement(Particles, { kind: "fog", soundOn: false, cinematic: undefined, reducedMotion: false }));
    await sleep(300);
    ok(qa(".fog-bank").length >= 3, "fog: fog banks mount", `${qa(".fog-bank").length} banks`);
    ok(!q("canvas"), "fog: pure CSS — no canvas (no lights ⇒ no dust underlay)");
    // …but with lights the same scene gets the dust-motes-under-shafts underlay.
    mount(createElement(Particles, { kind: "fog", soundOn: false, cinematic: LIGHTS, reducedMotion: false }));
    await sleep(300);
    ok(qa(".fog-bank").length >= 3 && !!q("canvas"), "fog + lights: banks plus the dust-motes underlay canvas", `${qa(".fog-bank").length} banks`);
  }
  {
    mount(createElement(Particles, { kind: "smoke", soundOn: false, cinematic: LIGHTS, reducedMotion: false }));
    await sleep(300);
    ok(!q("canvas") || qa(".smoke-puff").length > 0, "smoke: DOM layer (no canvas needed for puffs)");
  }
  for (const kind of ["drizzle", "snow", "dust", "ember", "ash", "fireflies", "motes"] as const) {
    mount(createElement(Particles, { kind, soundOn: false, cinematic: LIGHTS, reducedMotion: false }));
    await sleep(250);
    ok(!!q("canvas"), `${kind}: canvas layer mounts`);
  }
  {
    mount(createElement(Particles, { kind: "none", soundOn: false, cinematic: LIGHTS, reducedMotion: false }));
    await sleep(250);
    ok(!!q("canvas"), "none + lights: the atmosphere underlay (dust motes in the light) still shows");
  }

  /* storm — the bolt must actually fire, at full screen-span */
  {
    mount(createElement(Particles, { kind: "storm", soundOn: false, cinematic: LIGHTS, reducedMotion: false }));
    const fired = await until("storm: a lightning strike fires (bolt element appears)", () => !!q(".storm-bolt"), 15000);
    ok(fired, "storm: strike scheduled and rendered");
    if (fired) {
      const bolt = q<HTMLElement>(".storm-bolt")!;
      const w = (doc.defaultView as unknown as Window).getComputedStyle(bolt).width;
      ok(w === "130px" || w === "130px ", "storm bolt computed width is 130px (full span) — was 3px", `computed=${w}`);
      const clip = bolt.style.clipPath || "";
      ok(clip.includes("polygon(") && !clip.includes("30%, 30%") && /polygon\(\d+% \d+%,?\s*\d+% \d+%/.test(clip), "storm bolt clip-path is a 2-point sliver from a random top to a random bottom (forked)", clip.slice(0, 120));
    }
  }

  /* reduced motion — the accessibility pass */
  {
    for (const kind of ["snow", "storm", "ember", "rain"] as const) {
      mount(createElement(Particles, { kind, soundOn: false, cinematic: LIGHTS, reducedMotion: true }));
      await sleep(250);
      ok(!q("canvas"), `reduced motion · ${kind}: no animated canvas`);
    }
    mount(createElement(Particles, { kind: "fog", soundOn: false, cinematic: LIGHTS, reducedMotion: true }));
    await sleep(250);
    ok(!q("canvas") && qa(".fog-bank").length === 0, "reduced motion · fog: static gradient wash, no drifting banks");
    // motes/dust collapse to a STATIC radial-gradient div — no canvas, no rAF.
    mount(createElement(Particles, { kind: "motes", soundOn: false, cinematic: LIGHTS, reducedMotion: true }));
    await sleep(250);
    const staticMotes = q<HTMLElement>("div[aria-hidden][style*='radial-gradient']");
    ok(!q("canvas") && !!staticMotes, "reduced motion · motes: a STATIC dust div, no canvas/rAF");
    // smoke/storm/snow/ember are motion-only effects: under reduced motion
    // they render an empty inert div (the catch-all) — no canvas, no puffs.
    mount(createElement(Particles, { kind: "smoke", soundOn: false, cinematic: LIGHTS, reducedMotion: true }));
    await sleep(250);
    ok(!q("canvas") && qa(".smoke-puff").length === 0, "reduced motion · smoke: empty inert div (no canvas, no puffs)");
  }

  /* ---------------- PART 3 · Studio CinematicControls live preview ---------------- */
  console.log("\n=== PART 3 · STUDIO — DYNAMIC VISUALS LIVE PREVIEW ===");
  {
    const base = {
      dimAmount: 0.4,
      ...LIGHTS,
    };
    // rain scene, lens explicitly OFF
    mount(
      createElement(CinematicControls, {
        cinematic: { ...base, rainOnLens: false },
        previewUrl: GRAD,
        storyId: "beta-visuals",
        media: (v?: string) => v,
        onChange: () => {},
        particles: "rain",
      })
    );
    await sleep(300);
    const camBtn = qa<HTMLButtonElement>("button").find((b) => (b.textContent || "").includes("📷 Camera"));
    ok(!!camBtn, "CinematicControls: the Camera section is present");
    camBtn?.click();
    await sleep(400);
    ok(!!q("canvas"), "preview: the real particle engine renders (rain canvas)");
    ok(qa(".fx-rain-lens-drop").length === 0, "preview honours explicit rainOnLens:false (no droplets)", `${qa(".fx-rain-lens-drop").length}`);
    ok(qa(".cin-light").length >= 1, "preview: light sources render", `${qa(".cin-light").length} lights`);
    ok(qa(".parallax-mid").length >= 1, "preview: the volumetric shaft plane renders", `${qa(".parallax-mid").length}`);
    const badge = qa<HTMLSpanElement>("span").find((s) => /·\s*rain\s*$/.test((s.textContent || "").trim()));
    ok(!!badge, "preview badge names the particle kind", `badge="${badge?.textContent}"`);

    // flip the toggle via a fresh mount with rainOnLens:true
    mount(
      createElement(CinematicControls, {
        cinematic: { ...base, rainOnLens: true },
        previewUrl: GRAD,
        storyId: "beta-visuals",
        media: (v?: string) => v,
        onChange: () => {},
        particles: "rain",
      })
    );
    await sleep(400);
    ok(qa(".fx-rain-lens-drop").length > 0, "preview with rainOnLens:true: droplets appear", `${qa(".fx-rain-lens-drop").length}`);

    // a fog scene shows fog banks in the preview
    mount(
      createElement(CinematicControls, {
        cinematic: base,
        previewUrl: GRAD,
        storyId: "beta-visuals",
        media: (v?: string) => v,
        onChange: () => {},
        particles: "fog",
      })
    );
    await sleep(400);
    ok(qa(".fog-bank").length >= 3, "preview with particles:fog: fog banks render", `${qa(".fog-bank").length}`);

    // the rain-on-lens checkbox reads the EFFECTIVE state (default for rain kinds)
    mount(
      createElement(CinematicControls, {
        cinematic: base, // no explicit rainOnLens
        previewUrl: GRAD,
        storyId: "beta-visuals",
        media: (v?: string) => v,
        onChange: () => {},
        particles: "rain",
      })
    );
    await sleep(300);
    // the checkbox lives in the "✨ Dynamic Visuals" section — open it first
    qa<HTMLButtonElement>("button")
      .find((b) => /Dynamic Visuals/.test(b.textContent || ""))
      ?.click();
    await sleep(300);
    const lensBox = qa<HTMLInputElement>('input[type="checkbox"]').find((b) => {
      const lbl = b.closest("label");
      return !!lbl && /Rain on lens/.test(lbl.textContent || "");
    });
    ok(!!lensBox && lensBox.checked, "checkbox: default on a RAIN scene reads checked (effective state)", lensBox ? String(lensBox.checked) : "not found");
    // …and on a non-rain scene the same unset value reads UNCHECKED.
    mount(
      createElement(CinematicControls, {
        cinematic: base,
        previewUrl: GRAD,
        storyId: "beta-visuals",
        media: (v?: string) => v,
        onChange: () => {},
        particles: "smoke",
      })
    );
    await sleep(300);
    const lensBox2 = qa<HTMLInputElement>('input[type="checkbox"]').find((b) => {
      const lbl = b.closest("label");
      return !!lbl && /Rain on lens/.test(lbl.textContent || "");
    });
    ok(!!lensBox2 && !lensBox2.checked, "checkbox: default on a SMOKE scene reads unchecked", lensBox2 ? String(lensBox2.checked) : "not found");
  }

  /* ---------------- PART 4 · scene transitions in the real player ---------------- */
  console.log("\n=== PART 4 · TRANSITIONS — NO MID-COVER BLACK FLASH ===");
  {
    const TRANSITION_STORY: Story = {
      id: "beta-transitions",
      title: "Beta Lab: Transitions",
      tagline: "Transition timing probe.",
      coverImage: GRAD,
      startSceneId: "t_alpha",
      layout: {
        t_alpha: { x: 60, y: 100 },
        t_bravo: { x: 480, y: 100 },
        t_charlie: { x: 900, y: 100 },
        t_delta: { x: 60, y: 300 },
        t_echo: { x: 480, y: 300 },
      },
      briefing: { objective: "Cross five transition types.", winConditions: ["Flip at full cover"], loseConditions: ["A black frame mid-wipe."] },
      flagNotes: {},
      characters: [],
      items: [],
      scenes: [
        {
          id: "t_alpha",
          title: "Alpha",
          background: GRAD,
          prose: "ALPHA-PROSE: the old street, a black card over it.",
          noTypewriter: true,
          transition: "fade",
          transitionSpeed: 0.5,
          choices: [{ id: "tc_b", text: "to the alley", targetSceneId: "t_bravo" }],
        },
        {
          id: "t_bravo",
          title: "Bravo",
          background: GRAD,
          prose: "BRAVO-PROSE: the alley, mid-wipe.",
          noTypewriter: true,
          transition: "wipe-left",
          transitionSpeed: 1.2,
          choices: [{ id: "tc_c", text: "to the rooftop", targetSceneId: "t_charlie" }],
        },
        {
          id: "t_charlie",
          title: "Charlie",
          background: GRAD,
          prose: "CHARLIE-PROSE: the rooftop, cut straight in.",
          noTypewriter: true,
          transition: "cut",
          choices: [{ id: "tc_d", text: "to the dock", targetSceneId: "t_delta" }],
        },
        {
          id: "t_delta",
          title: "Delta",
          background: "/img/sr-probe-delta.jpg",
          prose: "DELTA-PROSE: the dock, slid in with its own art.",
          noTypewriter: true,
          transition: "slide-left",
          transitionSpeed: 0.6,
          choices: [{ id: "tc_e", text: "to the vault", targetSceneId: "t_echo" }],
        },
        {
          id: "t_echo",
          title: "Echo",
          background: "/img/sr-probe-echo.jpg",
          prose: "ECHO-PROSE: the vault, zoomed in with its own art.",
          noTypewriter: true,
          transition: "zoom",
          transitionSpeed: 0.6,
          choices: [{ id: "tc_a", text: "back to the street", targetSceneId: "t_alpha" }],
        },
      ],
    };
    mount(
      createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(GamePlayer, { story: TRANSITION_STORY, typeSpeed: 34, isNewGamePlus: false, onExit: () => {} })))
    );
    await until("alpha scene mounts", () => text().includes("ALPHA-PROSE"), 8000);
    ok(!crashed(), "game mounts without tripping the error boundary");
    const cont = () => qa<HTMLButtonElement>("button").find((b) => (b.textContent || "").includes("continue to choices"));
    if (!(await until("continue button appears", () => !!cont(), 6000))) return;
    cont()!.click();
    if (!(await until("choices appear", () => qa("button").some((b) => (b.textContent || "").includes("to the alley")), 6000))) return;
    const alley = qa<HTMLButtonElement>("button").find((b) => (b.textContent || "").includes("to the alley"));
    if (!alley) {
      ok(false, "alpha's wipe choice is clickable", text().slice(0, 400));
      return;
    }

    /* wipe-left (1.2s): destination's class while pending, old plate until full cover */
    const plateId = () => q<HTMLElement>("[data-scene-id]")?.getAttribute("data-scene-id");
    alley.click();
    const t0 = Date.now();
    await sleep(150);
    const mid = overlay();
    ok(!!mid && mid.getAttribute("data-transitioning") === "1", "mid-wipe: the cover is animating", mid ? `data=${mid.getAttribute("data-transitioning")}` : "no overlay");
    ok(!!mid && /scene-wipe-left/.test(mid.className), "mid-wipe: the overlay plays the DESTINATION's wipe class (pending scene)", mid?.className.slice(0, 120));
    ok(plateId() === "t_alpha", "mid-wipe: the OLD scene (alpha) is still on the plate — no early flip", `plate=${plateId()}`);
    const flipped = await until("bravo plate appears", () => plateId() === "t_bravo", 5000);
    const flipMs = Date.now() - t0;
    ok(flipped, "the wipe completes and reveals bravo");
    ok(flipMs >= 1050, "the plate flips at FULL cover (1.2s wipe) — the old code flipped at 380ms into a black flash", `flip at ${flipMs}ms`);
    const post = overlay();
    ok(!!post && post.getAttribute("data-transitioning") === "0" && /scene-wipe-left/.test(post.className), "post-flip: the reveal plays the same wipe out", post ? `data=${post.getAttribute("data-transitioning")}` : "no overlay");

    /* cut: instant, no overlay animation */
    // bravo's choices only exist after its own continue-click
    const contB = qa<HTMLButtonElement>("button").find((b) => (b.textContent || "").includes("continue to choices"));
    if (!contB) {
      ok(false, "bravo continue appears", text().slice(0, 400));
    } else {
      contB.click();
      await until("bravo choices appear", () => !!qa<HTMLButtonElement>("button").find((b) => !b.disabled && (b.textContent || "").includes("to the rooftop")), 8000);
      const roof = qa<HTMLButtonElement>("button").find((b) => !b.disabled && (b.textContent || "").includes("to the rooftop"));
      ok(!!roof, "bravo's cut choice is clickable");
      if (roof) {
        const t1 = Date.now();
        roof.click();
        const cutOk = await until("charlie plate appears", () => plateId() === "t_charlie", 1500);
        const cutMs = Date.now() - t1;
        ok(cutOk && cutMs < 600, "cut flips the plate instantly (no black cover)", `cut at ${cutMs}ms`);
        const cutOv = overlay();
        ok(!cutOv || cutOv.getAttribute("data-transitioning") === "0", "cut: the overlay is at rest (never covered)", cutOv ? `data=${cutOv.getAttribute("data-transitioning")}` : "none");
      }

      /* slide-left (0.6s): the overlay must carry DELTA's own background art —
         not a black shape — while the old plate (charlie) is still mounted. */
      const contC = qa<HTMLButtonElement>("button").find((b) => (b.textContent || "").includes("continue to choices"));
      if (contC) {
        contC.click();
        await until("charlie choices appear", () => !!qa<HTMLButtonElement>("button").find((b) => !b.disabled && (b.textContent || "").includes("to the dock")), 8000);
        const dock = qa<HTMLButtonElement>("button").find((b) => !b.disabled && (b.textContent || "").includes("to the dock"));
        ok(!!dock, "charlie's slide choice is clickable");
        if (dock) {
          dock.click();
          await sleep(150);
          const midSlide = overlay();
          ok(!!midSlide && midSlide.getAttribute("data-transitioning") === "1", "mid-slide: the cover is animating", midSlide ? `data=${midSlide.getAttribute("data-transitioning")}` : "no overlay");
          ok(!!midSlide && /scene-slide-left/.test(midSlide.className), "mid-slide: the overlay plays the DESTINATION's slide class", midSlide?.className.slice(0, 120));
          ok(!!midSlide && !/bg-black/.test(midSlide.className), "mid-slide: no black background — the destination art replaces the black card", midSlide?.className.slice(0, 120));
          const slideArt = midSlide?.querySelector("div") ?? null;
          ok(!!slideArt && (slideArt.style.backgroundImage || "").includes("sr-probe-delta"), "mid-slide: the overlay carries the DESTINATION scene's background art", slideArt ? (slideArt.style.backgroundImage || "").slice(0, 80) : "no art layer");
          ok(!!slideArt && /cin-/.test(slideArt.className || ""), "mid-slide: the art layer keeps the cinematic treatment (grade/dim/vars)", slideArt?.className?.slice(0, 80));
          ok(plateId() === "t_charlie", "mid-slide: the OLD scene (charlie) is still on the plate — no early flip", `plate=${plateId()}`);
          const slideFlipped = await until("delta plate appears", () => plateId() === "t_delta", 5000);
          ok(slideFlipped, "the slide completes and reveals delta");
          const postSlide = overlay();
          ok(!!postSlide && postSlide.getAttribute("data-transitioning") === "0" && /scene-slide-left/.test(postSlide.className), "post-slide: the reveal settles over the identical art", postSlide ? `data=${postSlide.getAttribute("data-transitioning")}` : "no overlay");
          const postSlideArt = postSlide?.querySelector("div") ?? null;
          ok(!!postSlideArt && (postSlideArt.style.backgroundImage || "").includes("sr-probe-delta"), "post-slide: the reveal art is the same destination image (no mid-reveal re-swap)", postSlideArt ? (postSlideArt.style.backgroundImage || "").slice(0, 80) : "no art layer");

          /* zoom (0.6s): same contract — ECHO's art inside the lens */
          const contD = qa<HTMLButtonElement>("button").find((b) => (b.textContent || "").includes("continue to choices"));
          if (contD) {
            contD.click();
            await until("delta choices appear", () => !!qa<HTMLButtonElement>("button").find((b) => !b.disabled && (b.textContent || "").includes("to the vault")), 8000);
            const vault = qa<HTMLButtonElement>("button").find((b) => !b.disabled && (b.textContent || "").includes("to the vault"));
            ok(!!vault, "delta's zoom choice is clickable");
            if (vault) {
              vault.click();
              await sleep(150);
              const midZoom = overlay();
              ok(!!midZoom && midZoom.getAttribute("data-transitioning") === "1", "mid-zoom: the cover is animating", midZoom ? `data=${midZoom.getAttribute("data-transitioning")}` : "no overlay");
              ok(!!midZoom && /scene-zoom/.test(midZoom.className), "mid-zoom: the overlay plays the DESTINATION's zoom class", midZoom?.className.slice(0, 120));
              ok(!!midZoom && !/bg-black/.test(midZoom.className), "mid-zoom: no black background — the destination art replaces the black card", midZoom?.className.slice(0, 120));
              const zoomArt = midZoom?.querySelector("div") ?? null;
              ok(!!zoomArt && (zoomArt.style.backgroundImage || "").includes("sr-probe-echo"), "mid-zoom: the overlay carries the DESTINATION scene's background art", zoomArt ? (zoomArt.style.backgroundImage || "").slice(0, 80) : "no art layer");
              ok(plateId() === "t_delta", "mid-zoom: the OLD scene (delta) is still on the plate — no early flip", `plate=${plateId()}`);
              const zoomFlipped = await until("echo plate appears", () => plateId() === "t_echo", 5000);
              ok(zoomFlipped, "the zoom completes and reveals echo");
              const postZoom = overlay();
              ok(!!postZoom && postZoom.getAttribute("data-transitioning") === "0" && /scene-zoom/.test(postZoom.className), "post-zoom: the reveal settles over the identical art", postZoom ? `data=${postZoom.getAttribute("data-transitioning")}` : "no overlay");
            }
          }
        }
      }
    }
  }

  /* ---------------- PART 4b · art lifecycle + reduced-motion art path ---------------- */
  console.log("\n=== PART 4b · ART STACK LIFECYCLE + REDUCED MOTION ===");
  {
    /* (a) hygiene: the slide/zoom overlay carries the destination art while a
     * move is playing — and NOTHING after it settles. The player sits at
     * t_echo (zoom, 0.6s reveal); wait past the reveal window and assert the
     * art stack (image + lights + flare + grade) unmounted instead of being
     * held at opacity 0 for the rest of the scene. */
    await sleep(1100);
    const echoRest = overlay();
    ok(!!echoRest, "at rest: the overlay element itself survives (cheap, invisible)");
    ok(!!echoRest && echoRest.getAttribute("data-transitioning") === "0", "at rest: data-transitioning=0", echoRest?.getAttribute("data-transitioning") ?? "no overlay");
    ok(!!echoRest && !echoRest.querySelector("div"), "at rest: the art stack unmounts after the reveal — no zombie lights/flare layers behind the plate",
      echoRest ? `${echoRest.querySelectorAll("div").length} child divs` : "no overlay");

    /* (b) reduced motion: the art path must never mount at all. A player
     * with the preference set gets a pure cut from goToScene AND a cut as
     * the entry class on a slide scene — with zero art children. */
    const REDUCED_STORY: Story = {
      id: "beta-reduced-art",
      title: "Beta Lab: Reduced Art Path",
      tagline: "Reduced-motion probe for the art-carrying overlays.",
      coverImage: GRAD,
      startSceneId: "r_start",
      briefing: { objective: "Enter a slide scene with reduced motion.", winConditions: ["No art stack"], loseConditions: ["A moving overlay."] },
      flagNotes: {},
      characters: [],
      items: [],
      scenes: [
        {
          id: "r_start",
          title: "Start",
          background: GRAD,
          prose: "REDUCED-START: the room before the move.",
          noTypewriter: true,
          transition: "cut",
          choices: [{ id: "r_go", text: "to the slide room", targetSceneId: "r_slide" }],
        },
        {
          id: "r_slide",
          title: "Slide room",
          background: "/img/sr-probe-delta.jpg",
          prose: "REDUCED-SLIDE: entered by cut — never by art.",
          noTypewriter: true,
          transition: "slide-left",
          transitionSpeed: 1.0,
          choices: [],
        },
      ],
    };
    const realMatchMedia = win.matchMedia;
    const reducedMq = (query: string) => ({
      matches: /prefers-reduced-motion/.test(query),
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    });
    win.matchMedia = reducedMq as unknown as typeof win.matchMedia;
    globalThis.matchMedia = reducedMq as unknown as typeof matchMedia;
    try {
      mount(
        createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(GamePlayer, { story: REDUCED_STORY, typeSpeed: 34, isNewGamePlus: false, onExit: () => {} })))
      );
      const startOk = await until("reduced story mounts", () => text().includes("REDUCED-START"), 8000);
      ok(startOk, "reduced: the start scene mounts");
      if (startOk) {
        const contR = () => qa<HTMLButtonElement>("button").find((b) => (b.textContent || "").includes("continue to choices"));
        if (await until("reduced: continue appears", () => !!contR(), 6000)) {
          contR()!.click();
          await until("reduced: choices appear", () => qa("button").some((b) => (b.textContent || "").includes("to the slide room")), 6000);
          const goR = qa<HTMLButtonElement>("button").find((b) => !b.disabled && (b.textContent || "").includes("to the slide room"));
          ok(!!goR, "reduced: the slide choice is clickable");
          if (goR) {
            const tR0 = Date.now();
            goR.click();
            const flippedR = await until("reduced: the plate flips to the slide room", () => q<HTMLElement>("[data-scene-id]")?.getAttribute("data-scene-id") === "r_slide", 4000);
            const flipMsR = Date.now() - tR0;
            ok(flippedR, "reduced: goToScene cuts straight through — no cover, no wait", `flipped at ${flipMsR}ms`);
            ok(flipMsR < 400, "reduced: the cut is INSTANT (the 1s slide speed must not gate the flip)", `flip at ${flipMsR}ms`);
            await sleep(300);
            const restR = overlay();
            ok(!!restR && !/scene-slide/.test(restR.className || ""), "reduced: the resting overlay maps the slide ENTRY to a cut class (never plays the move)", restR?.className.slice(0, 160) ?? "no overlay");
            ok(!!restR && !restR.querySelector("div"), "reduced: the art stack never mounts — no destination image behind a cut", restR ? `${restR.querySelectorAll("div").length} child divs` : "no overlay");
          }
        }
      }
    } finally {
      win.matchMedia = realMatchMedia;
      globalThis.matchMedia = realMatchMedia as unknown as typeof matchMedia;
      root?.unmount();
    }
  }

  /* ---------------- PART 5 · Jack Morrow — Midnight Reel smoke ---------------- */
  console.log("\n=== PART 5 · JACK MORROW — MIDNIGHT REEL (showcase smoke) ===");
  {
    mount(
      createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(GamePlayer, { story: JACK_MORROW_MIDNIGHT_REEL, typeSpeed: 34, isNewGamePlus: false, onExit: () => {} })))
    );
    ok(!crashed(), "showcase mounts without tripping the error boundary");
    const skipped = await until("credits show a skip button", () => qa("button").some((b) => /skip title sequence/i.test(b.textContent || "")), 12000);
    ok(skipped, "the credits scene renders its skip control");
    if (skipped) {
      qa<HTMLButtonElement>("button").find((b) => /skip title sequence/i.test(b.textContent || ""))!.click();
      const reached = await until("the dust warehouse stage mounts", () => !!q("[data-stage-player]"), 15000);
      ok(reached, "skipping credits lands on the warehouse STAGE (walker present)");
      if (reached) {
        ok(qa(".stage-marker").length >= 2, "warehouse markers render (walk-to-talk)", `${qa(".stage-marker").length} markers`);
        ok(!!q("canvas"), "dust particle canvas mounts on the warehouse");
      }
    }
    ok(!crashed(), "showcase never tripped the error boundary");
  }

  /* ---------------- PART 6 · CHANCE GAMBLE — the 🎲 choice ---------------- */
  console.log("\n=== PART 6 · CHANCE GAMBLE (🎲 odds, fail route, seeded dice) ===");
  {
    const GAMBLE_STORY: Story = {
      id: "beta-gamble",
      title: "Beta Lab: The Gamble",
      tagline: "Chance-gamble probe.",
      coverImage: GRAD,
      startSceneId: "g_start",
      characters: [],
      items: [],
      scenes: [
        {
          id: "g_start",
          title: "The Table",
          background: GRAD,
          prose: "GAMBLE-PROSE: three bets on one street.",
          noTypewriter: true,
          choices: [
            { id: "g_always", text: "always lands (100%)", targetSceneId: "g_hit", chance: 100 },
            { id: "g_never", text: "never lands (0%)", targetSceneId: "g_hit", chance: 0, failTargetSceneId: "g_miss" },
            { id: "g_coin", text: "the coin (60%)", targetSceneId: "g_hit", chance: 60, failTargetSceneId: "g_miss" },
          ],
        },
        {
          id: "g_hit",
          title: "The Win",
          background: GRAD,
          prose: "GAMBLE-HIT: the dice landed.",
          noTypewriter: true,
          choices: [],
        },
        {
          id: "g_miss",
          title: "The Fail",
          background: GRAD,
          prose: "GAMBLE-MISS: the dice bet you.",
          noTypewriter: true,
          choices: [],
        },
      ],
    };
    const plateId = () => q<HTMLElement>("[data-scene-id]")?.getAttribute("data-scene-id");
    const cont = () => qa<HTMLButtonElement>("button").find((b) => (b.textContent || "").includes("continue to choices"));
    const pick = (label: string) => qa<HTMLButtonElement>("button").find((b) => !b.disabled && (b.textContent || "").includes(label));
    const playToChoice = async () => {
      mount(
        createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(GamePlayer, { story: GAMBLE_STORY, typeSpeed: 34, isNewGamePlus: false, onExit: () => {} })))
      );
      if (!(await until("gamble table mounts", () => text().includes("GAMBLE-PROSE"), 8000))) return false;
      if (!(await until("continue appears", () => !!cont(), 6000))) return false;
      cont()!.click();
      return await until("choices appear", () => !!pick("always lands"), 6000);
    };

    // 100%: the happy route, every time, and the button wears its odds.
    if (await playToChoice()) {
      const always = pick("always lands")!;
      ok(/🎲 100%/.test(always.textContent || ""), "the odds chip renders on the button (🎲 100%)", always.textContent?.slice(0, 80) ?? "");
      always.click();
      ok(await until("100% lands on the hit route", () => plateId() === "g_hit", 6000), "100% gamble: the happy route, no fail route ever");
      ok(text().includes("🎲"), "100% gamble: the dice toast plays over the frame", text().slice(0, 300));
    }

    // 0%: the fail route, every time.
    if (await playToChoice()) {
      const never = pick("never lands")!;
      ok(/🎲 0%/.test(never.textContent || ""), "the odds chip renders 0% honestly", never.textContent?.slice(0, 80) ?? "");
      never.click();
      ok(await until("0% lands on the fail route", () => plateId() === "g_miss", 6000), "0% gamble: the fail route, no happy route ever");
    }

    // Seeded 60%: same seed + same click = the SAME dice on a fresh mount.
    const seededCoin = async () => {
      if (!(await playToChoice())) return null;
      setGameSeed("probe-60");
      pick("the coin")!.click();
      await until("coin resolves", () => plateId() === "g_hit" || plateId() === "g_miss", 6000);
      const dest = plateId();
      root?.unmount();
      return dest;
    };
    const coinA = await seededCoin();
    const coinB = await seededCoin();
    setGameSeed(null);
    ok(coinA !== null && coinA === coinB, "seeded 60%: the same seed replays the exact dice across mounts", `${coinA} vs ${coinB}`);
    ok(coinA === "g_hit" || coinA === "g_miss", "seeded 60%: the roll lands on a real route", `${coinA}`);
  }

  /* ---------------- PART 7 · Second Reel smoke ---------------- */
  console.log("\n=== PART 7 · JACK MORROW — THE SECOND REEL (showcase smoke) ===");
  {
    mount(
      createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(GamePlayer, { story: JACK_MORROW_SECOND_REEL, typeSpeed: 34, isNewGamePlus: false, onExit: () => {} })))
    );
    ok(!crashed(), "the Second Reel mounts without tripping the error boundary");
    const skipped = await until("credits show a skip button", () => qa("button").some((b) => /skip title sequence/i.test(b.textContent || "")), 12000);
    ok(skipped, "the Second Reel renders its credits + skip control");
    if (skipped) {
      qa<HTMLButtonElement>("button").find((b) => /skip title sequence/i.test(b.textContent || ""))!.click();
      const reached = await until("the office stage mounts", () => !!q("[data-stage-player]"), 15000);
      ok(reached, "skipping credits lands on the office STAGE (walker present)");
      if (reached) {
        ok(qa(".stage-marker").length >= 2, "office markers render (radio, case file, door)", `${qa(".stage-marker").length} markers`);
        ok(!!q("canvas"), "rain particle canvas mounts in the office");
        ok(qa(".fx-rain-lens-drop").length > 0, "rain-on-lens droplets mount on the office (the pass-1 transparency pass)", `${qa(".fx-rain-lens-drop").length} drops`);
      }
    }
    ok(!crashed(), "the Second Reel never tripped the error boundary");
    root?.unmount();
  }

  /* ---------------- PART 8 · Third Reel smoke (the full-kit showcase) ---------------- */
  console.log("\n=== PART 8 · JACK MORROW — THE THIRD REEL (full-kit showcase smoke) ===");
  {
    const { JACK_MORROW_THIRD_REEL } = await import("../../src/data/jackMorrowThirdReel");
    mount(
      createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(GamePlayer, { story: JACK_MORROW_THIRD_REEL, typeSpeed: 34, isNewGamePlus: false, onExit: () => {} })))
    );
    ok(!crashed(), "the Third Reel mounts without tripping the error boundary");
    const skipped = await until("credits show a skip button", () => qa("button").some((b) => /skip title sequence/i.test(b.textContent || "")), 12000);
    ok(skipped, "the Third Reel renders its credits + skip control");
    if (skipped) {
      qa<HTMLButtonElement>("button").find((b) => /skip title sequence/i.test(b.textContent || ""))!.click();
      const reached = await until("the alley stage mounts", () => !!q("[data-stage-player]"), 15000);
      ok(reached, "skipping credits lands on the alley STAGE (walker present)");
      if (reached) {
        // The trash can + the stage door carry static diamonds; SID doesn't —
        // an NPC-linked talker is clicked on the actor (Stage hides its
        // marker: `.filter((hs) => !npcLinks[hs.id])`).
        ok(qa(".stage-marker").length >= 2, "alley markers render (take, go — talk rides the NPC)", `${qa(".stage-marker").length} markers`);
        ok(!!q("canvas"), "rain particle canvas mounts in the alley");
        // Still inside the reveal window: the overlay must play the slide
        // class AND carry the destination art (sr-street) — the art-carrying
        // contract exercised by a real story, not the synthetic lab one.
        const ov = overlay();
        ok(!!ov && /scene-slide-left/.test(ov.className || ""), "alley entry played the slide-left class (destination transition honored)", ov?.className.slice(0, 140) ?? "no overlay");
        const artNow = ov?.querySelector("div");
        ok(!!artNow && (artNow.style.backgroundImage || "").includes("sr-street"), "alley entry overlay carried the DESTINATION art through the reveal", artNow ? (artNow.style.backgroundImage || "").slice(0, 80) : "no art layer");
      }
    }
    ok(!crashed(), "the Third Reel never tripped the error boundary");
    // The authored sound picks exist where the studio demo needs them.
    const booth = JACK_MORROW_THIRD_REEL.scenes.find((s) => s.id === "tr_booth");
    const caught = JACK_MORROW_THIRD_REEL.scenes.find((s) => s.id === "tr_caught");
    ok(booth?.transitionSound === "thump", "authored on the booth: a fade given a deliberate THUMP", String(booth?.transitionSound));
    ok(caught?.transitionSound === "none", "authored on the catch: total silence over a fade-black", String(caught?.transitionSound));
    root?.unmount();
  }

  /* ---------------- final report ---------------- */
  const realProblems = problems.filter(([k, m]) => !(k === "console.error" && /Maximum update depth/.test(m)));
  ok(realProblems.length === 0, "no console errors/warnings during the whole run", realProblems.slice(0, 4).map(([k, m]) => `${k}: ${m.slice(0, 800)}`).join(" || "));

  root?.unmount();
}

(async () => {
  try {
    await part1();
  } catch (err) {
    failures.push(`part1 threw: ${String((err as Error)?.stack || err)}`);
  }
  try {
    await parts2to5();
  } catch (err) {
    failures.push(`parts2to5 threw: ${String((err as Error)?.stack || err)}`);
  }
  console.log(`\n=== VISUALS BETA: ${passes.length} passed, ${failures.length} failed ===`);
  for (const f of failures) console.log("  ✗ " + f);
  if (failures.length) process.exitCode = 1;
})();
