/**
 * BETA PROBE — DON'T PANIC! (the Hitchhiker's-parody adventure)
 * -------------------------------------------------------------
 * Part 1: authorship validation — DONT_PANIC must validate with zero
 *         errors AND zero warnings.
 * Part 2: the real <GamePlayer> mounted in happy-dom, playing the full
 *         GOLD path by hand through the object-first verb menus: title →
 *         bedroom (conversation, multi-state drawer, pickups) → street
 *         (entry cutscene, USE verb, exit hub) → pub (gated exit, topic
 *         hub, press-the-lie, exclusive replies) → vogon hold (classic
 *         hotspots) → poetry (quick-time event) → Heart of Gold (topics,
 *         kick verb, tap-to-combine, USE-item puzzle, travel map) →
 *         Magrathea finale, plus a map round-trip along the way.
 * Part 3: branch endings (silver / earth / poetry / panic) via mounts.
 * Part 4: the console stays silent and the error boundary never trips.
 *
 * Run: node scripts/beta/dont-panic-harness.mjs
 */
import type { Story } from "../../src/types";

const failures: string[] = [];
const passes: string[] = [];
function ok(cond: boolean, label: string, detail = "") {
  // Live logging: the harness kills the child on timeout, so progress must
  // be visible incrementally — a silent hang would otherwise say nothing.
  if (cond) { passes.push(label); console.log(`  ✓ ${label}`); }
  else {
    failures.push(label + (detail ? ` — ${detail}` : ""));
    console.log(`  ✗ ${label}${detail ? ` — ${detail.slice(0, 400)}` : ""}`);
  }
}

async function part1() {
  const { validateStory } = await import("../../src/logic");
  const { DONT_PANIC } = await import("../../src/data/dontPanic");
  const issues = validateStory(DONT_PANIC);
  const errs = issues.filter((i) => i.severity === "error");
  const warns = issues.filter((i) => i.severity === "warning");
  ok(errs.length === 0, "DONT_PANIC validates with no errors",
    errs.map((i) => i.message).join(" | "));
  ok(warns.length === 0, "DONT_PANIC validates with no warnings",
    warns.map((i) => i.message).join(" | "));
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function parts2to4() {
  const { Window } = await import("happy-dom");
  const win = new Window({ url: "http://localhost:5173/" });
  const doc = win.document;
  doc.body.innerHTML = '<div id="root"></div>';
  // rAF THROTTLE — happy-dom fires requestAnimationFrame unthrottled
  // (~500k fps), which turns the stage's per-frame loops into a memory
  // firehose and OOMs long playthroughs. Cap it at ~60fps like a vsync'd
  // browser; all stage motion is dt-based so wall-time behavior is unchanged.
  {
    const rafTimers = new Map<number, ReturnType<typeof win.setTimeout>>();
    let rafId = 0;
    let lastRaf = 0;
    const realSetTimeout = win.setTimeout.bind(win);
    const realClearTimeout = win.clearTimeout.bind(win);
    win.requestAnimationFrame = ((cb: (t: number) => void) => {
      const id = ++rafId;
      const wait = Math.max(0, 16 - (Date.now() - lastRaf));
      rafTimers.set(id, realSetTimeout(() => {
        rafTimers.delete(id);
        lastRaf = Date.now();
        cb(lastRaf);
      }, wait));
      return id;
    }) as typeof win.requestAnimationFrame;
    win.cancelAnimationFrame = ((id: number) => {
      const t = rafTimers.get(id);
      if (t !== undefined) { realClearTimeout(t); rafTimers.delete(id); }
    }) as typeof win.cancelAnimationFrame;
  }

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
  try { (win.HTMLCanvasElement.prototype as unknown as { getContext: () => null }).getContext = function () { return null; }; } catch {}
  win.scrollTo = () => {};
  globalThis.scrollTo = win.scrollTo as typeof scrollTo;

  // Console capture — every React warning/error fails the beta unless it is
  // the known happy-dom rAF artifact (see dom-smoke.mjs for the rationale).
  const problems: [string, string][] = [];
  console.error = (...a: unknown[]) => {
    const msg = a.map(String).join(" ");
    problems.push(["console.error", msg]);
    if (process.env.DONT_PANIC_BETA_VERBOSE) process.stderr.write(`[live console.error] ${msg.slice(0, 2000)}\n`);
  };
  console.warn = (...a: unknown[]) => {
    const msg = a.map(String).join(" ");
    problems.push(["console.warn", msg]);
    if (process.env.DONT_PANIC_BETA_VERBOSE) process.stderr.write(`[live console.warn] ${msg.slice(0, 600)}\n`);
  };
  process.on("uncaughtException", (e) => problems.push(["uncaught", String((e as Error)?.stack || e)]));
  process.on("unhandledRejection", (e) => problems.push(["unhandled rejection", String(e)]));

  const { StrictMode, createElement }: typeof import("react") = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { GamePlayer } = await import("../../src/game/Game");
  const { ErrorBoundary } = await import("../../src/ErrorBoundary");
  const { DONT_PANIC } = await import("../../src/data/dontPanic");

  const container = doc.getElementById("root")!;
  let root: ReturnType<typeof createRoot> | null = null;

  const mountStory = async (story: Story, fromSceneId?: string) => {
    try { win.localStorage.clear(); win.sessionStorage.clear(); } catch {}
    // Unmount the previous root BEFORE wiping the DOM — clearing first would
    // have React's unmount remove children that no longer exist (the classic
    // "removeChild: not a child of this node" crash).
    root?.unmount();
    container.innerHTML = "";
    root = createRoot(container);
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(ErrorBoundary, null, createElement(GamePlayer, {
          story,
          // The default reading pace: Space force-completes a typing line
          // exactly like a player, and happy-dom starves 1ms typewriter
          // timers anyway.
          typeSpeed: 34,
          isNewGamePlus: false,
          onExit: () => {},
          ...(fromSceneId ? { playFromSceneId: fromSceneId } : {}),
        }))
      )
    );
    await sleep(1200);
  };

  const text = () => (container.textContent || "").replace(/\s+/g, " ");
  const q = <T extends Element>(sel: string) => container.querySelector(sel) as T | null;
  const qa = <T extends Element>(sel: string) => [...container.querySelectorAll(sel)] as T[];
  async function until(desc: string, fn: () => boolean, timeoutMs = 10000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      if (fn()) { ok(true, desc); return true; }
      await sleep(150);
    }
    ok(false, desc, `timed out; rendered: ${text().slice(0, 1200)}`);
    return false;
  }
  const key = (k: string, code?: string) =>
    win.dispatchEvent(new win.KeyboardEvent("keydown", { key: k, code: code ?? k, bubbles: true }));
  const space = () => key(" ", "Space");
  const marker = (id: string) => q<HTMLButtonElement>(`.stage-marker[data-hs-id="${id}"]`);
  const crashed = () => /the reel snapped|something broke/i.test(container.innerHTML);
  const hasItem = (id: string) => !!q(`[data-item-id="${id}"]`);
  const btnWith = (snippet: string, scope?: Element) =>
    [...(scope ?? container).querySelectorAll("button")].find((b) => (b.textContent || "").includes(snippet)) as HTMLButtonElement | undefined;
  const clickText = (snippet: string, scope?: Element) => {
    const b = btnWith(snippet, scope);
    if (!b) return false;
    b.click();
    return true;
  };
  // Mash Space (text advance only — Space never picks a choice) until a
  // beat/choice/modal state arrives.
  async function advanceUntil(desc: string, pred: () => boolean, maxPresses = 40) {
    for (let i = 0; i < maxPresses; i++) {
      if (pred()) { ok(true, desc); return true; }
      space();
      await sleep(320);
    }
    const pass = pred();
    ok(pass, desc, pass ? "" : `not reached; rendered: ${text().slice(0, 1200)}`);
    return pass;
  }
  // Object-first verb menu: click the marker (opens the pie), then the verb.
  // Retries the marker click — a click while walking/conversing is ignored.
  // Verb clicks are scoped to the pie so the satchel rail / dock never win.
  const menuVerbBtn = (verbLabel: string) => {
    const menu = q("[data-stage-object-menu]");
    return menu
      ? [...menu.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === verbLabel) as HTMLButtonElement | undefined
      : undefined;
  };
  async function useVerb(id: string, verbLabel: string, tries = 6) {
    for (let i = 0; i < tries; i++) {
      marker(id)?.click();
      await sleep(450);
      const btn = menuVerbBtn(verbLabel);
      if (btn) { btn.click(); await sleep(300); return true; }
    }
    return false;
  }
  // Talking to a walking NPC: press the actor (opens THEIR pie), then Talk.
  async function npcTalk(npcId: string, tries = 6) {
    for (let i = 0; i < tries; i++) {
      q<HTMLElement>(`[data-npc-id="${npcId}"]`)?.dispatchEvent(
        new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
      await sleep(450);
      const btn = menuVerbBtn("Talk to");
      if (btn) { btn.click(); await sleep(300); return true; }
    }
    return false;
  }
  const dialog = (label: string) => q(`[role="dialog"][aria-label="${label}"]`);
  const topicsHub = () => q('[role="menu"][aria-label="Conversation topics"]');
  // A linear conversation only hands the floor back once its LAST beat is
  // acknowledged — keep advancing while waiting for the markers to re-enable.
  async function untilFloorBack(desc: string, timeoutMs = 20000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      if (qa(".stage-marker[disabled]").length === 0) { ok(true, desc); return true; }
      space();
      await sleep(400);
    }
    ok(false, desc, `timed out; rendered: ${text().slice(0, 1200)}`);
    return false;
  }

  /* ---------------- PART 2 · THE GOLD PATH, PLAYED BY HAND ---------------- */
  console.log("\n=== PART 2 · GOLD PATH (real DOM play-through) ===");
  const heapTimer = setInterval(() => {
    const m = process.memoryUsage();
    console.log(`  [heap] rss=${Math.round(m.rss / 1048576)}MB heap=${Math.round(m.heapUsed / 1048576)}MB captured-logs=${problems.length}`);
  }, 15000);
  try {
  await mountStory(DONT_PANIC);
  ok(!crashed(), "game mounts without tripping the error boundary");

  // CASE FILE → TITLE (single-choice credits auto-play) → BEDROOM
  await until("the case file offers Begin", () => !!btnWith("Begin Case"), 15000);
  ok(clickText("Begin Case"), "opening the case file");
  await until("the title auto-plays into the bedroom", () => !!marker("dp_bed_door"), 20000);

  // BEDROOM — markers, NPC-linked Ford, the door unlocks after the talk.
  for (const id of ["dp_bed_drawer", "dp_bed_door", "dp_bed_window"]) {
    ok(!!marker(id), `bedroom marker renders: ${id}`);
  }
  ok(qa(".hotspot-box").length === 0, "no classic hotspot boxes on the bedroom stage");
  ok(!marker("dp_bed_ford"), "ford's static diamond hides (he's a walking NPC)");
  ok(!marker("dp_bed_satchel"), "the satchel hides until Ford is met");
  ok(text().includes("🔒"), "the front door shows locked before the talk");
  const ford = q<HTMLElement>('[data-npc-id="dp_npc_ford_bed"]');
  ok(!!ford && /Ford, vibrating/i.test(ford.textContent || ""), "ford patrols with his own talk chip");
  ok(await npcTalk("dp_npc_ford_bed"), "talking to Ford (press the actor, pick Talk to)");
  await until("talking to Ford freezes the floor", () => qa(".stage-marker[disabled]").length > 0, 15000);
  await advanceUntil("ford's towel lecture plays", () => text().includes("bring your TOWEL"));
  await advanceUntil("ford's bypass warning plays", () => text().includes("hyperspace bypass"));
  await advanceUntil("the Guide's towel entry plays", () => text().includes("TOWEL, n."));
  // No closing choices — the conversation auto-closes and the floor comes
  // back (the markers re-enable).
  await untilFloorBack("ford's conversation hands the floor back");
  await until("the satchel peeks out after meeting Ford", () => !!marker("dp_bed_satchel"), 8000);
  ok(!text().includes("🔒"), "the front door unlocks after meeting Ford");
  ok(await useVerb("dp_bed_drawer", "Use"), "yanking the drawer open (USE verb)");
  await until("the drawer opens", () => text().includes("funereal precision"), 15000);
  ok(await useVerb("dp_bed_drawer", "Pick up"), "taking the towel from the opened drawer");
  await until("the towel lands in the pockets", () => hasItem("dp_towel"), 15000);
  ok(await useVerb("dp_bed_satchel", "Pick up"), "taking the Guide from the satchel");
  await until("the Guide lands in the pockets", () => hasItem("dp_guidebook"), 15000);
  ok(await useVerb("dp_bed_door", "Go to"), "leaving through the front door");
  await until("the street mounts", () => !!marker("dp_street_pub"), 20000);

  // STREET — entry cutscene, USE-the-dozer, exit hub.
  await until("prosser's cutscene starts", () => !!q("[data-stage-cutscene]"), 8000);
  let cutGone = false;
  for (let i = 0; i < 40 && !cutGone; i++) {
    space();
    await sleep(400);
    cutGone = !q("[data-stage-cutscene]");
  }
  ok(cutGone, "prosser's cutscene plays through and releases the floor");
  ok(await useVerb("dp_street_dozer", "Use"), "lying down in front of the bulldozer (USE verb)");
  await until("the paperwork gambit lands", () => text().includes("glorious paperwork"), 15000);
  // The USE plays a lie-down cutscene now (letterbox + input lock) — wait for
  // it to release the floor before heading inside, like the entry cutscene.
  let lieGone = false;
  for (let i = 0; i < 40 && !lieGone; i++) {
    space();
    await sleep(400);
    lieGone = !q("[data-stage-cutscene]");
  }
  ok(lieGone, "the lie-down cutscene plays through and releases the floor");
  ok(await useVerb("dp_street_pub", "Go to"), "heading into the Horse and Groom");
  await until("the pub mounts", () => !!marker("dp_pub_follow"), 20000);

  // PUB — gated exit, topic hub, press-the-lie, exclusive replies.
  ok(await useVerb("dp_pub_follow", "Go to"), "trying to follow Ford out early");
  await until("the gated exit refuses with Ford's line", () => text().includes("Know the truth AND finish your pint"), 15000);
  ok(await npcTalk("dp_npc_barman"), "chatting with the barman (topic hub)");
  await until("the topic hub opens", () => !!topicsHub() && text().includes("What's on tap?"), 15000);
  ok(clickText("What's on tap?"), "asking what's on tap");
  await until("the tap answer plays", () => !topicsHub(), 8000);
  await advanceUntil("the hub returns after the answer", () => !!topicsHub());
  ok(clickText("That'll be all."), "leaving the topic hub");
  await until("the hub closes", () => !topicsHub(), 8000);
  ok(await npcTalk("dp_npc_ford_pub"), "talking to Ford");
  // The beat panel's invisible sizer holds the scene's tallest line, so lie
  // text matches from the first beat — use the press affordance itself as
  // the "the lie is current" signal instead.
  await advanceUntil("ford's Guildford lie becomes pressable", () => !!btnWith("Press them on that"));
  // The press button is disabled while the line types out (a disabled click
  // is a no-op, not even a typing-complete) — Space to finish the line,
  // then press for real.
  let bagOpen = false;
  for (let i = 0; i < 12 && !bagOpen && btnWith("Press them on that"); i++) {
    const b = btnWith("Press them on that")!;
    if (b.disabled) { space(); await sleep(600); }
    else { b.click(); await sleep(600); }
    bagOpen = !!dialog("Press them — present your evidence");
  }
  ok(bagOpen, "pressing Ford on the lie");
  await until("the evidence bag opens", () => !!dialog("Press them — present your evidence"), 8000);
  {
    const bag = dialog("Press them — present your evidence")!;
    ok(clickText("The Guide", bag), "presenting the Guide as evidence");
  }
  // Let the evidence resolution flush and the caught beat start typing
  // before advancing: a space in the same tick as the presentation
  // double-steps the cursor past the caught beat (it plays unseen).
  await sleep(1200);
  await advanceUntil("ford's cover story collapses", () => text().includes("Guildford was COVER"));
  await advanceUntil("the replies arrive", () => !!btnWith("Starting with Guildford"));
  ok(clickText("Starting with Guildford"), "demanding the truth (Clever reply)");
  // The poetry warning is a conditional beat unlocked by the reveal reply.
  await advanceUntil("ford's poetry warning plays", () => text().includes("they'll do POETRY first"));
  await advanceUntil("the replies return after the warning", () => !!btnWith("I trust you"));
  // The trust reply sometimes needs a beat to re-render after the reveal.
  let trusted = false;
  for (let i = 0; i < 16 && !trusted; i++) {
    trusted = clickText("I trust you");
    if (!trusted) await sleep(500);
  }
  if (!trusted) {
    console.log(`  [debug] choices at trust time: ${(q('[aria-label="Choices"]')?.innerHTML ?? "NO MENU").slice(0, 600)}`);
  }
  ok(trusted, "trusting Ford (locks out the doubt reply)");
  await sleep(800);
  ok(!btnWith("This is insane"), "the exclusive doubt reply is locked out");
  await untilFloorBack("the replies run out and the floor comes back");
  ok(await useVerb("dp_pub_beer", "Pick up"), "taking the pint");
  await until("the pint lands in the pockets", () => hasItem("dp_beer"), 15000);
  ok(await useVerb("dp_pub_peanuts", "Pick up"), "taking the peanuts");
  await until("the peanuts land in the pockets", () => hasItem("dp_peanuts"), 15000);
  ok(await useVerb("dp_pub_thumb", "Pick up"), "taking the spare thumb");
  await until("the thumb lands in the pockets", () => hasItem("dp_thumb"), 15000);
  // The travel map exists but both pins are locked this early.
  key("t");
  await until("the travel map opens", () => text().includes("???"), 8000);
  ok(text().includes("???"), "both map pins are locked before the poetry");
  key("t");
  await until("the travel map closes", () => !text().includes("???"), 8000);
  ok(await useVerb("dp_pub_follow", "Go to"), "following Ford out as the sky rips open");
  await until("the vogon hold mounts", () => text().includes("Vogon Constructor Ship"), 20000);

  // VOGON HOLD — an evidence scene behind entry narration+beats: flush to
  // choice mode first (the examine gate is the stable signal), THEN touch the
  // hotspots. (Querying/clicking earlier hits DOM behind the modal and the
  // guarded giveItem swallows the click.)
  await advanceUntil("the hold opens up", () => text().includes("Before you go"));
  await until("the march-in choices arrive", () => !!btnWith("How bad can it be"), 8000);
  ok(!!q('.hotspot-box[aria-label="the babel fish dispenser"]'), "the babel fish dispenser renders as a classic hotspot");
  q<HTMLButtonElement>('.hotspot-box[aria-label="the babel fish dispenser"]')?.click();
  await until("the fish goes in the ear", () => hasItem("dp_babel"), 10000);
  for (let i = 0; i < 10 && text().includes("into your ear"); i++) { space(); await sleep(300); }
  const notice = q<HTMLButtonElement>('.hotspot-box[aria-label="a posted notice (now readable, thanks to the fish)"]');
  ok(!!notice, "the posted notice renders");
  notice?.click();
  await until("the notice is readable", () => text().includes("BY ORDER"), 8000);
  for (let i = 0; i < 10 && text().includes("BY ORDER"); i++) { space(); await sleep(300); }
  let marched = clickText("How bad can it be");
  for (let i = 0; i < 3 && !marched; i++) { space(); await sleep(500); marched = clickText("How bad can it be"); }
  ok(marched, "marching in to the poetry");
  await advanceUntil("the poetry mounts", () => text().includes("whispering"));

  // POETRY — the quick-time event.
  await advanceUntil("the QTE prompt fires", () => text().includes("APPRECIATE THE POETRY!"), 20);
  ok(clickText("APPLAUD WILDLY"), "applauding before the clock runs out");
  await until("the Heart of Gold mounts", () => !!marker("dp_heart_drive"), 20000);

  // HEART OF GOLD — topics, kick, combine, USE-item, map.
  ok(await useVerb("dp_heart_nutri", "Kick"), "kicking the Nutrimatic (extended verb)");
  await until("the kick lands", () => text().includes("philosopher clearing its throat"), 20000);
  ok(await useVerb("dp_heart_nutri", "Pick up"), "taking the almost-tea");
  await until("the tea lands in the pockets", () => hasItem("dp_tea"), 15000);
  // Tap-to-combine: towel + thumb → towel-wrapped signal.
  ok(clickText("Combine"), "opening tap-to-combine mode");
  await until("combine mode arms", () => text().includes("Tap the first item"), 8000);
  q<HTMLButtonElement>('[data-item-id="dp_towel"]')?.click();
  await sleep(400);
  q<HTMLButtonElement>('[data-item-id="dp_thumb"]')?.click();
  await until("the towel-wrapped thumb is crafted",
    () => hasItem("dp_towel_signal") && !hasItem("dp_towel") && !hasItem("dp_thumb"), 10000);
  // USE the signal on the Drive via the object menu's item picker.
  ok(await useVerb("dp_heart_drive", "Use"), "offering the Drive a use");
  await until("the drive's item picker opens",
    () => !!btnWith("Towel-Wrapped Thumb", q("[data-stage-object-menu]") ?? undefined), 8000);
  ok(clickText("Towel-Wrapped Thumb", q("[data-stage-object-menu]") ?? undefined),
    "pressing the towel-wrapped thumb to the Drive");
  await until("the Drive wakes", () => text().includes("Drive is AWAKE"), 20000);
  // Magrathea's pin unlocks; the Heart is "you are here".
  key("t");
  await until("the map shows Magrathea unlocked", () => !!dialog("Heart of Gold — Destination Computer") && !text().includes("???"), 8000);
  key("t");
  await until("the map closes again", () => !dialog("Heart of Gold — Destination Computer"), 8000);
  // Zaphod waits behind the bridge's energy field until the Drive wakes.
  ok(await npcTalk("dp_npc_zaphod"), "chatting with Zaphod (topic hub)");
  await until("zaphod's hub opens", () => !!topicsHub() && text().includes("Who ARE you?"), 20000);
  ok(clickText("Who ARE you?"), "asking Zaphod who he is");
  await until("zaphod's answer plays", () => !topicsHub(), 8000);
  await advanceUntil("zaphod's hub returns", () => !!topicsHub());
  ok(clickText("Back away slowly."), "backing away from Zaphod");
  await until("zaphod's hub closes", () => !topicsHub(), 8000);
  ok(await useVerb("dp_heart_drive", "Go to"), "riding the awake Drive to Magrathea");
  await until("the finale mounts", () => !!btnWith("six by nine") || text().includes("MAG RATHEA") || text().includes("Magrathea"), 25000);

  // MAGRATHEA — map round-trip, then the Question.
  await advanceUntil("the finale choices arrive", () => !!btnWith("six by nine"));
  ok(!!btnWith("six by nine"), "the gold choice is offered (Clever 3 through real play)");
  key("t");
  await until("the map opens in the finale", () => !!q('button[title="Travel to Heart of Gold"]'), 8000);
  q<HTMLButtonElement>('button[title="Travel to Heart of Gold"]')?.click();
  await until("map travel returns to the Heart", () => !!marker("dp_heart_viewport"), 25000);
  key("t");
  await until("the map reopens on the Heart", () => !!q('button[title="Travel to Magrathea"]'), 8000);
  q<HTMLButtonElement>('button[title="Travel to Magrathea"]')?.click();
  await advanceUntil("map travel reaches Magrathea", () => !!btnWith("six by nine") || !!btnWith("quiet life"));
  await advanceUntil("the finale choices return", () => !!btnWith("six by nine"));
  ok(clickText("six by nine"), "asking the Question (six times nine)");
  await advanceUntil("the gold ending lands", () => text().includes("THE QUESTION, MORE OR LESS"));

  /* ---------------- PART 3 · BRANCH ENDINGS ---------------- */
  console.log("\n=== PART 3 · BRANCH ENDINGS ===");

  // Crisps: ignore everything in the pub.
  await mountStory(DONT_PANIC, "dp_pub");
  await until("the pub remounts", () => !!marker("dp_pub_stay"), 15000);
  ok(await useVerb("dp_pub_stay", "Go to"), "ordering crisps and ignoring all of this");
  await advanceUntil("the crisps ending lands", () => text().includes("DEMOLISHED, WITH CRISPS"));

  // Rhymed at: critique the verse.
  await mountStory(DONT_PANIC, "dp_poetry");
  await advanceUntil("the poetry choices mount", () => !!btnWith("scansion's off"));
  ok(clickText("scansion's off"), "critiquing the scansion (fatal)");
  await advanceUntil("the spaced ending lands", () => text().includes("RHYMED AT, THEN SPACED"));

  // Panic: the gold stays locked with Clever 0, panic instead.
  await mountStory(DONT_PANIC, "dp_magrathea");
  await advanceUntil("the finale choices mount", () => !!btnWith("PANIC. Loudly"));
  const goldLocked = btnWith("six by nine");
  ok(!!goldLocked && goldLocked.disabled, "the gold choice stays locked with Clever 0");
  ok(clickText("PANIC. Loudly"), "panicking, loudly, with arm movements");
  await advanceUntil("the panic ending lands", () => text().includes("YOU PANICKED"));

  // The quiet life, earned.
  await mountStory(DONT_PANIC, "dp_magrathea");
  await advanceUntil("the finale choices remount", () => !!btnWith("quiet life"));
  ok(clickText("quiet life"), "asking for a lift home and a proper cup of tea");
  await advanceUntil("the silver ending lands", () => text().includes("THE QUIET LIFE, EARNED"));

  /* ---------------- PART 4 · SILENCE + STABILITY ---------------- */
  const realProblems = problems.filter(([k, m]) => !(k === "console.error" && /Maximum update depth/.test(m)));
  ok(realProblems.length === 0, "no console errors/warnings during the whole run",
    realProblems.slice(0, 4).map(([k, m]) => `${k}: ${m.slice(0, 1600)}`).join(" || "));
  ok(!crashed(), "the error boundary never tripped");

  root?.unmount();
  } finally {
    clearInterval(heapTimer);
  }
}

(async () => {
  try {
    await part1();
    await parts2to4();
  } catch (err) {
    failures.push(`probe threw: ${String((err as Error)?.stack || err)}`);
  }
  console.log(`\n=== DON'T PANIC BETA: ${passes.length} passed, ${failures.length} failed ===`);
  for (const f of failures) console.log("  ✗ " + f);
  if (failures.length) process.exitCode = 1;
})();
