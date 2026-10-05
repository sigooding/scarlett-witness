/** BISECT — mount DONT_PANIC bedroom and idle: steady-state leak or not? */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
(async () => {
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
    try { (globalThis as unknown as Record<string, unknown>)[key] = (win as unknown as Record<string, unknown>)[key]; } catch {}
  }
  globalThis.window = win as unknown as Window & typeof globalThis;
  class FakeAudio {
    paused = true; volume = 1; currentTime = 0; duration = 0;
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    load() {} addEventListener() {} removeEventListener() {}
    cloneNode() { return new FakeAudio(); }
  }
  (globalThis as unknown as { Audio: typeof FakeAudio }).Audio = FakeAudio;
  (win as unknown as { Audio: typeof FakeAudio }).Audio = FakeAudio;
  const { StrictMode, createElement }: typeof import("react") = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { GamePlayer } = await import("../../src/game/Game");
  const { ErrorBoundary } = await import("../../src/ErrorBoundary");
  const { DONT_PANIC } = await import("../../src/data/dontPanic");
  const variant = process.env.BISECT_VARIANT ?? "full";
  const story = {
    ...DONT_PANIC,
    scenes: DONT_PANIC.scenes.map((s) =>
      s.id === "dp_bedroom"
        ? {
            ...s,
            ...(variant === "nonpc" || variant === "bare"
              ? { stage: { ...s.stage!, npcs: [] } }
              : {}),
            ...(variant === "bare"
              ? {
                  ambientAudio: "none" as const,
                  stage: {
                    ...s.stage!, npcs: [],
                    hints: "none" as const, sentenceLine: false,
                    enterCaption: undefined, obstacles: [],
                  },
                }
              : {}),
          }
        : s
    ),
  };
  console.log("variant:", variant, "from:", process.env.BISECT_FROM ?? "(start)");
  const container = doc.getElementById("root")!;
  const root = createRoot(container);
  root.render(createElement(StrictMode, null,
    createElement(ErrorBoundary, null, createElement(GamePlayer, {
      story, typeSpeed: 34, isNewGamePlus: false, onExit: () => {},
      ...(process.env.BISECT_FROM ? { playFromSceneId: process.env.BISECT_FROM } : {}),
    }))));
  await sleep(5000);
  // Click "Begin Case".
  const btns = [...container.querySelectorAll("button")];
  const begin = btns.find((b) => (b.textContent || "").includes("Begin Case")) as HTMLButtonElement | undefined;
  console.log("begin found:", !!begin, "buttons:", btns.length, "text:", (container.textContent || "").slice(0, 200));
  for (let i = 0; i < 20 && !begin; i++) {
    await sleep(1000);
    const b2 = [...container.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Begin Case")) as HTMLButtonElement | undefined;
    if (b2) { console.log("begin appeared after", i + 1, "s"); b2.click(); break; }
  }
  await sleep(8000);
  const markers = container.querySelectorAll(".stage-marker").length;
  console.log("bedroom markers:", markers);
  for (let i = 0; i < 7; i++) {
    const m = process.memoryUsage();
    console.log(`[idle ${i * 15}s] rss=${Math.round(m.rss / 1048576)}MB heap=${Math.round(m.heapUsed / 1048576)}MB`);
    await sleep(15000);
  }
  root.unmount();
  process.exit(0);
})();
