/* QA probe: mounts the real <GamePlayer> with GUARDS! GUARDS! in happy-dom.
   Part 1 renders the scene kinds; Part 2 is a REACHABILITY + INTERACTION
   SWEEP: it keyboard-walks the walker next to every marker / NPC on each
   stage (happy-dom can't click-to-walk — zero bounding rects — so the sweep
   drives WASD/arrows like the stage beta does), works the object-first verb
   pie, and asserts the authored effect fires. Any hotspot a walker can never
   reach fails the probe here instead of in a player's session. */

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
let failures = 0;
const ok = (cond: boolean, desc: string, extra = "") => {
  if (cond) console.log(`  ✔ ${desc}`);
  else {
    failures++;
    console.log(`  ✘ ${desc}${extra ? ` — ${extra}` : ""}`);
  }
};

async function main() {
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
    try { (globalThis as unknown as Record<string, unknown>)[key] = (win as unknown as Record<string, unknown>)[key]; } catch {}
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
    paused = true; volume = 1; currentTime = 0; duration = 0;
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
  try { (win.HTMLCanvasElement.prototype as unknown as { getContext: () => null }).getContext = function () { return null; } } catch {}
  win.scrollTo = () => {};
  globalThis.scrollTo = win.scrollTo as typeof scrollTo;

  const problems: string[] = [];
  console.error = (...a: unknown[]) => problems.push(a.map(String).join(" "));
  console.warn = (...a: unknown[]) => problems.push(a.map(String).join(" "));

  const { StrictMode, createElement } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { GamePlayer } = await import("../src/game/Game");
  const { ErrorBoundary } = await import("../src/ErrorBoundary");
  const { GUARDS_GUARDS } = await import("../src/data/guardsGuards");

  const container = doc.getElementById("root")!;
  let root: ReturnType<typeof createRoot> | null = null;

  const mount = async (from?: string) => {
    try { win.localStorage.clear(); win.sessionStorage.clear(); } catch {}
    root?.unmount();
    container.innerHTML = "";
    root = createRoot(container);
    root.render(
      createElement(StrictMode, null,
        createElement(ErrorBoundary, null, createElement(GamePlayer, {
          story: GUARDS_GUARDS,
          typeSpeed: 34,
          isNewGamePlus: false,
          onExit: () => {},
          ...(from ? { playFromSceneId: from } : {}),
        })))
    );
    await sleep(1400);
  };
  const text = () => (container.textContent || "").replace(/\s+/g, " ");
  const q = (sel: string) => container.querySelector(sel) as HTMLElement | null;
  const qa = (sel: string) => [...container.querySelectorAll(sel)] as HTMLElement[];
  const crashed = () => /the reel snapped|something broke/i.test(container.innerHTML);
  const pressSpace = () => win.dispatchEvent(new win.KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true }));
  async function until(desc: string, fn: () => boolean, timeoutMs = 9000, mash = false) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      if (fn()) return true;
      if (mash) pressSpace();
      await sleep(150);
    }
    ok(false, desc, `timed out; text: ${text().slice(0, 260)}`);
    return false;
  }
  const click = (el: HTMLElement | null | undefined) => el?.click?.();
  const verbButton = (label: string) => qa("button").find((b) => b.getAttribute("aria-label") === label) ?? null;
  const buttonByText = (rx: RegExp) => qa("button").find((b) => rx.test(b.textContent || "")) ?? null;

  /* keyboard walking — happy-dom click-to-walk has no layout to click on */
  const key = (k: string, code?: string) => win.dispatchEvent(new win.KeyboardEvent("keydown", { key: k, code: code ?? k, bubbles: true }));
  const keyUp = (k: string) => win.dispatchEvent(new win.KeyboardEvent("keyup", { key: k, bubbles: true }));
  const hold = async (k: string, ms: number) => { key(k); await sleep(ms); keyUp(k); await sleep(120); };
  const cur = () => {
    const el = q("[data-stage-player]");
    if (!el) return { x: 50, y: 90 };
    return { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
  };
  async function nav(tx: number, ty: number) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const c = cur();
      const dx = tx - c.x;
      const dy = ty - c.y;
      if (Math.abs(dx) > 1.5) await hold(dx < 0 ? "ArrowLeft" : "ArrowRight", (Math.abs(dx) / 20) * 1000 + 100);
      const c2 = cur();
      if (Math.abs(ty - c2.y) > 1.5) await hold(ty < c2.y ? "ArrowUp" : "ArrowDown", (Math.abs(ty - c2.y) / 20) * 1000 + 100);
      const c3 = cur();
      if (Math.abs(c3.x - tx) < 2.5 && Math.abs(c3.y - ty) < 2.5) return;
    }
  }

  /** Walk to the approach point, tap the marker, pick the pie verb, assert. */
  async function act(desc: string, hsId: string, ax: number, ay: number, verb: string, expect: RegExp) {
    await nav(ax, ay);
    click(q(`.stage-marker[data-hs-id="${hsId}"]`));
    await until(`${desc}: pie opens`, () => !!verbButton(verb) || expect.test(text()), 5000);
    await sleep(1300); // let the tap-walk settle — verb clicks mid-walk are ignored
    for (let i = 0; i < 2 && !expect.test(text()); i++) {
      const vb = verbButton(verb);
      if (vb) click(vb);
      await sleep(700);
    }
    ok(await until(desc, () => expect.test(text()), 6000), desc);
    await sleep(300);
  }
  /** Keyboard-walk off the right edge; the exit routes when the walker leaves. */
  async function walkOffRight(expectRx: RegExp, desc: string) {
    for (let i = 0; i < 4 && !expectRx.test(text()); i++) {
      await sleep(600);
      await hold("ArrowRight", 2500);
      console.log(`    [walkOff ${i}] pos=${cur().x.toFixed(1)},${cur().y.toFixed(1)}`);
    }
    ok(await until(desc, () => expectRx.test(text()), 6000, true), desc, `pos ${cur().x.toFixed(1)},${cur().y.toFixed(1)}`);
  }

  /** Walk next to a linked NPC, click it, run the hub, leave. */
  async function talk(desc: string, npcId: string, ax: number, ay: number, hubRx: RegExp, topicRx?: RegExp, topicExpect?: RegExp, leaveRx?: RegExp) {
    await nav(ax, ay);
    // N = walk to & talk with the nearest linked character (keyboard-driven,
    // unlike an NPC click, which chase-walks — inert under happy-dom).
    key("n");
    await sleep(300);
    keyUp("n");
    if (!(await until(`${desc}: hub opens`, () => hubRx.test(text()), 7000))) return;
    ok(true, `${desc}: hub opens`);
    if (topicRx && topicExpect) {
      click(buttonByText(topicRx));
      ok(await until(`${desc}: topic answer`, () => topicExpect.test(text()), 8000, true), `${desc}: topic answer`);
      if (leaveRx) await until(`${desc}: hub returns`, () => !!buttonByText(leaveRx), 6000, true);
    }
    if (leaveRx) { click(buttonByText(leaveRx)); await sleep(900); } // hub close re-locks input briefly
  }

  /* ---------------- Part 1 · cold open ---------------- */
  console.log("=== GG PROBE · cold open ===");
  await mount();
  ok(!crashed(), "cold open mounts");
  ok(await until("prose types in", () => /Ankh-Morpork/.test(text())), "city prose renders");
  {
    const t0 = Date.now();
    while (Date.now() - t0 < 25000 && !buttonByText(/oath/i)) { pressSpace(); await sleep(300); }
    ok(!!buttonByText(/oath/i), "oath choice offered after advancing the beat");
  }

  /* ---------------- Part 2 · watch house sweep ---------------- */
  console.log("=== GG PROBE · watch house sweep ===");
  await mount("gg_watchhouse");
  ok(await until("walker appears", () => !!q("[data-stage-player]")), "Carrot walker renders");
  ok(await until("enter script done", () => !!q('.stage-marker[data-hs-id="gg_hs_errol"]'), 12000), "enter script releases control");
  // NOTE: the walk-cycle / talking sheets render through SheetSprite, which
  // waits for the sheet image's natural size — happy-dom never fetches
  // network images, so sheet rendering is a real-browser check only.
  await act("duty desk look", "gg_hs_desk", 20, 80, "Look at", /duty ledger/);
  await act("patrol bell use", "gg_hs_bell", 63, 68, "Use", /mildly startled/);
  await act("errol take", "gg_hs_errol", 57, 77, "Pick up", /Watch Kit 1/);
  await act("wanted board look (remote)", "gg_hs_posters", 44, 90, "Look at", /WANTED: vampires/);
  await talk("vimes", "gg_npc_vimes", 30, 90, /Captain Vimes looks up/, /plaster cast/i, /arsonist's bookkeeping/, /snaps a salute/);
  await talk("colon", "gg_npc_colon", 78, 90, /Sergeant Colon leans/, /strange on the streets/i, /chalk and black candles/, /leaves the Sarge/);
  await talk("nobbs", "gg_npc_nobbs", 62, 86, /caught holding something/, /found this time/i, /three promotions/, /search Nobbs/);
  await act("door go", "gg_hs_door", 68, 70, "Go to", /STREETS OF ANKH-MORPORK/);

  /* ---------------- Part 2b · street sweep ---------------- */
  console.log("=== GG PROBE · street sweep ===");
  ok(await until("street mounts", () => !!q("[data-stage-player]")), "walker on the street");
  await act("signpost look (remote)", "gg_hs_signpost", 14, 92, "Look at", /PSEUDOPOLIS YARD/);
  await act("tower look (remote)", "gg_hs_tower", 14, 92, "Look at", /absolutely nothing about the dragon/);
  await act("sausage take", "gg_hs_sausage", 31, 70, "Pick up", /🌭/);
  await talk("dibbler", "gg_npc_dibbler", 31, 90, /Dibbler grins/, undefined, undefined, /backs away/);

  /* ---------------- Part 2b1 · kennels visit (pass 3) ----------- */
  console.log("=== GG PROBE · kennels sweep ===");
  await act("kennels door go", "gg_kennels_door", 11, 80, "Go to", /DRAGON KENNELS/);
  ok(await until("kennels mounts", () => !!q('[data-npc-id="gg_npc_ramkin"]'), 7000), "kennels mounts with Lady Ramkin");
  await act("terrariums look", "gg_hs_terrariums", 30, 74, "Look at", /glowing gently/);
  await act("kettle look", "gg_hs_kettle", 31, 88, "Look at", /teething/);
  await act("moon look (remote)", "gg_hs_moon", 30, 90, "Look at", /eating sheep/);
  await talk("ramkin", "gg_npc_ramkin", 66, 90, /feeding something small/, /cast of the scale/i, /SUMMONED one/, /waves to the smoke/);
  await act("kennels exit go", "gg_kennels_exit", 4, 92, "Go to", /STREETS OF ANKH-MORPORK/);

  // The painted travel map (pass 3): T opens the modal over the parchment.
  key("t");
  ok(await until("travel map opens", () => /destinations open/.test(text()), 5000), "travel map (T) opens");
  ok(/Pseudopolis Yard/.test(text()) && /The Shades/.test(text()), "map pins kennels and the Shades");
  key("t");
  await sleep(400);

  // Edge exits walk off-screen: drive the walker to the edge with the
  // keyboard (click-to-walk is inert under happy-dom). Stay below the crate
  // band (y>88) so nothing collides on the way out.
  await nav(45, 93);
  await walkOffRight(/ELUCIDATED BRETHREN/, "right edge routes to the lodge");

  /* ---------------- Part 2c · lodge sweep ----------------
     NO fresh mount from here on: one continuous session, so flags set in
     the watch house (Errol!) survive to gate the gold ending. */
  console.log("=== GG PROBE · lodge sweep ===");
  ok(await until("lodge walker", () => /ELUCIDATED BRETHREN/.test(text()) && !!q('[data-npc-id="gg_npc_wonse"]'), 8000), "walker in the lodge");
  await until("lodge markers enabled", () => {
    const b = q('.stage-marker[data-hs-id="gg_hs_chalk"]') as HTMLButtonElement | null;
    return !!b && !b.disabled;
  }, 9000);
  await act("chalk circle look", "gg_hs_chalk", 55, 76, "Look at", /Chalk runes/);
  await act("candles look (remote)", "gg_hs_candles", 88, 93, "Look at", /black candles/);
  {
    await nav(55, 76);
    click(q('.stage-marker[data-hs-id="gg_talk_circle"]'));
    await until("circle pie", () => !!verbButton("Talk to"), 5000);
    await sleep(1300);
    click(verbButton("Talk to"));
    ok(await until("ritual hub", () => /The chanting rises/.test(text()), 8000), "eavesdrop hub opens");
    click(buttonByText(/what could go wrong/i));
    ok(await until("ritual completes", () => /easiest paperwork/.test(text()), 14000, true), "ritual beats play to the end");
    await until("hub returns", () => !!buttonByText(/stops taking mental notes/), 7000, true);
    click(buttonByText(/stops taking mental notes/));
    await sleep(300);
  }
  await act("book take", "gg_hs_book", 17, 66, "Pick up", /decorative/);
  await talk("wonse", "gg_npc_wonse", 17, 90, /stain on the chalk/, /Explain yourself/i, /GET OUT OF MY SUMMONING/, /leaves him to his summoning/);
  await walkOffRight(/careful enthusiasm/, "right edge routes to the coronation");
  {
    const t0 = Date.now();
    while (Date.now() - t0 < 25000 && !buttonByText(/To the rooftops/i)) { pressSpace(); await sleep(300); }
    ok(!!buttonByText(/To the rooftops/i), "coronation beats play to the choice");
    click(buttonByText(/To the rooftops/i));
  }

  /* ---------------- Part 2e · cell & stake sweep (pass 4) -------- */
  console.log("=== GG PROBE · cell & stake sweep ===");
  {
    // standard scene: advance the beats to the choice list
    const t0 = Date.now();
    while (Date.now() - t0 < 25000 && !buttonByText(/Refuse to kneel/i)) { pressSpace(); await sleep(300); }
    ok(!!buttonByText(/Refuse to kneel/i), "burning offers the arrest choice");
  }
  click(buttonByText(/Refuse to kneel/i));
  ok(await until("cell mounts", () => !!q('[data-npc-id="gg_npc_librarian"]'), 8000), "cell mounts with the Librarian");
  await act("cell bars look (remote)", "gg_cell_bars", 30, 90, "Look at", /better view than anyone/);
  await act("cell door locked (gated)", "gg_cell_door", 80, 88, "Go to", /professional pride/);
  await talk("vimes cell", "gg_npc_vimes_cell", 45, 90, /waiting for a bus/, /How do we get out/i, /business model of a lock/, /leaves Vimes/);
  await talk("vetinari cell", "gg_npc_vetinari_cell", 20, 90, /court of rats/, /rats seem fond/i, /most reliable department/, /court of rats/);
  await talk("librarian", "gg_npc_librarian", 88, 90, /quiet competence/, /open the lock/i, /apologetic/, /ooks back/);
  await act("cell door go (freed)", "gg_cell_door", 80, 88, "Go to", /MONTHLY PERSON/);
  // enter caption locks input: markers are disabled until it releases
  await until("stake markers enabled", () => {
    const b = q('.stage-marker[data-hs-id="gg_stake_crowd_l"]') as HTMLButtonElement | null;
    return !!b && !b.disabled;
  }, 9000);
  await act("stake crowd look (remote)", "gg_stake_crowd_l", 50, 90, "Look at", /respectful distance/);
  await talk("sybil", "gg_npc_sybil", 50, 88, /health-and-safety inspector/, /are you alright/i, /greater insult/, /steps back/);
  await talk("dragon king", "gg_npc_dragon", 70, 92, /scheduled meal/, /by-laws/i, /tail flicking like a cat/, /backs away slowly/);
  await act("ropes use (freed)", "gg_stake_rope", 48, 82, "Use", /files the stake/);
  await act("stake exit go", "gg_stake_exit", 95, 92, "Go to", /distillery roof/);

  /* ---------------- Part 2f · finale sweep (pass 5) -------------- */
  console.log("=== GG PROBE · finale sweep ===");
  {
    const t0 = Date.now();
    while (Date.now() - t0 < 25000 && !buttonByText(/DUCK behind the casks/i)) { pressSpace(); await sleep(300); }
    ok(!!buttonByText(/DUCK behind the casks/i), "distillery offers the ambush choice");
    click(buttonByText(/DUCK behind the casks/i));
  }
  {
    const t0 = Date.now();
    while (Date.now() - t0 < 25000 && !buttonByText(/Escort the Patrician/i)) { pressSpace(); await sleep(300); }
    ok(!!buttonByText(/Escort the Patrician/i), "plaza offers the escort choice");
    click(buttonByText(/Escort the Patrician/i));
  }
  ok(await until("throne mounts", () => !!q('[data-npc-id="gg_npc_vetinari_throne"]'), 8000), "throne room mounts");
  await until("throne markers enabled", () => {
    const b = q('.stage-marker[data-hs-id="gg_throne_look"]') as HTMLButtonElement | null;
    return !!b && !b.disabled;
  }, 9000);
  await act("throne look (remote)", "gg_throne_look", 50, 90, "Look at", /With rules, this time/);
  await talk("vetinari reward", "gg_npc_vetinari_throne", 50, 84, /whole trick/, /owes you nothing/i, /Guards, indeed/, /means it/);
  await talk("colon birthmark", "gg_npc_colon_throne", 72, 90, /owed him money/, /birthmark/i, /not my problem/, /dartboard rules/);
  await act("gold ending go", "gg_throne_gold", 9, 82, "Go to", /Two Specks In The Sky/);
  ok(await until("gold ending", () => /Two Specks In The Sky/.test(text()), 9000, true), "gold ending reached");

  const real = problems.filter((p) => !/requestAnimationFrame|rAF/i.test(p));
  ok(real.length === 0, "no console errors/warnings", real.slice(0, 5).join(" || "));

  console.log(failures ? `\nGG PROBE FAILED (${failures})` : "\nGG PROBE PASSED");
  process.exit(failures ? 1 : 0);
}

main().then(() => process.exit(failures ? 1 : 0));
