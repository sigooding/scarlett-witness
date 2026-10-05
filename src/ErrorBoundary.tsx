import { Component, type ErrorInfo, type ReactNode } from "react";

/* ------------------------------------------------------------------ *
 *  ERROR BOUNDARY
 *
 *  Without one of these, a single throw anywhere in the tree unmounts
 *  the entire app and leaves a blank white page — no message, no menu,
 *  no way back. The most likely trigger is a save that's older than the
 *  current schema, hand-edited, or truncated by a storage quota error,
 *  and the player has no way to know that's what happened.
 *
 *  So: catch it, say so plainly, and offer the two things that actually
 *  recover — reload, or clear the local save data and start clean.
 * ------------------------------------------------------------------ */

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: string;
}

/**
 * Errors that reach window.onerror but are NOT failures.
 *
 * "ResizeObserver loop completed with undelivered notifications" is the big
 * one: the spec requires the browser to report it whenever observer callbacks
 * resize their own targets and the work spills into the next frame. Chrome
 * fires it as a genuine ErrorEvent even though nothing is broken and the
 * layout settles normally on the following tick.
 *
 * Treating that as fatal is worse than ignoring it — it replaces a working
 * game with a crash screen over a benign notice.
 */
const BENIGN = [
  "ResizeObserver loop completed with undelivered notifications",
  "ResizeObserver loop limit exceeded",
  // Cross-origin script errors are opaque by design and carry no detail.
  "Script error.",
];

function isBenign(message: string | undefined): boolean {
  if (!message) return false;
  return BENIGN.some((b) => message.includes(b));
}

/** Save/progress keys. Deliberately narrow: clearing must not touch the
 *  player's authored stories (drafts, published, custom). */
const PROGRESS_PREFIXES = [
  "scarlet-reel-save-",
  "scarlet-reel-season-progress",
  "scarlet-reel-endings",
];

/** A cached Studio draft/published copy overrides the built-in story, so a
 *  stale snapshot keeps playing long after the story file has moved on. This
 *  drops those copies (backing them up first) without touching custom stories. */
function clearCachedStories(): number {
  let n = 0;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (!k || k.includes("-backup-pre-r")) continue;
      if (k.startsWith("scarlet-reel-published-") || k.startsWith("scarlet-studio-draft-")) keys.push(k);
    }
    for (const k of keys) {
      const old = localStorage.getItem(k);
      if (old) localStorage.setItem(`${k}-backup-crash`, old);
      localStorage.removeItem(k);
      n += 1;
    }
  } catch {
    /* storage unavailable */
  }
  return n;
}

function clearProgress(): number {
  let n = 0;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && PROGRESS_PREFIXES.some((p) => k.startsWith(p))) keys.push(k);
    }
    for (const k of keys) {
      localStorage.removeItem(k);
      n += 1;
    }
  } catch {
    /* storage unavailable — nothing to clear */
  }
  return n;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the component stack: it's the only clue about where it broke.
    this.setState({ info: info.componentStack?.slice(0, 900) ?? "" });
    console.error("[Scarlet Reel] render error:", error, info);
  }

  /* A React boundary only catches errors thrown during RENDER. Anything that
   * throws in a timer, a promise, or a DOM event handler escapes it entirely
   * and — because the tree may already be half torn down — can still leave the
   * player looking at a blank page. Catching those here means every failure
   * mode reaches the same recovery screen instead of a white void. */
  private onWindowError = (e: ErrorEvent) => {
    if (this.state.error) return;
    if (isBenign(e.message)) return;
    const err = e.error instanceof Error ? e.error : new Error(e.message || "Unknown error");
    this.setState({ error: err, info: `${e.filename ?? ""}:${e.lineno ?? 0}` });
  };

  private onRejection = (e: PromiseRejectionEvent) => {
    if (this.state.error) return;
    const r = e.reason;
    if (isBenign(typeof r === "string" ? r : r?.message)) return;
    const err = r instanceof Error ? r : new Error(typeof r === "string" ? r : "Unhandled promise rejection");
    this.setState({ error: err, info: "unhandled promise rejection" });
  };

  componentDidMount() {
    window.addEventListener("error", this.onWindowError);
    window.addEventListener("unhandledrejection", this.onRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.onWindowError);
    window.removeEventListener("unhandledrejection", this.onRejection);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-auto bg-noir-950 p-6">
        <div className="w-full max-w-2xl border-2 border-crimson/70 bg-black/80 p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
          <div className="font-pulp text-[10px] uppercase tracking-[0.5em] text-crimson">
            The reel jammed
          </div>
          <h1 className="font-pulp mt-2 text-3xl uppercase tracking-[0.08em] text-paper">
            Something broke while drawing the screen
          </h1>
          <p className="font-type mt-3 text-sm leading-relaxed text-paper/70">
            This is usually a saved game left over from an older version of the
            story. Reloading is safe. If it keeps happening, clearing your saved
            progress will fix it — your written stories in the Studio are not
            touched.
          </p>

          <pre className="mt-4 max-h-40 overflow-auto border border-paper/15 bg-noir-900/80 p-3 font-mono text-[11px] leading-relaxed text-crimson/90">
            {error.message}
            {info ? `\n${info}` : ""}
          </pre>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => window.location.reload()}
              className="border-2 border-gold bg-gold/10 px-6 py-2.5 font-pulp text-xs uppercase tracking-[0.22em] text-gold hover:bg-gold/30"
            >
              ▸ Reload
            </button>
            <button
              onClick={() => {
                const n = clearProgress();
                console.info(`[Scarlet Reel] cleared ${n} progress key(s)`);
                window.location.reload();
              }}
              className="border-2 border-crimson/70 px-6 py-2.5 font-pulp text-xs uppercase tracking-[0.22em] text-crimson hover:bg-crimson/20"
            >
              ✖ Clear saved progress and reload
            </button>
            <button
              onClick={() => {
                const n = clearCachedStories();
                console.info(`[Scarlet Reel] cleared ${n} cached story copy(ies)`);
                window.location.reload();
              }}
              className="border-2 border-cyan-neon/60 px-6 py-2.5 font-pulp text-xs uppercase tracking-[0.22em] text-cyan-neon hover:bg-cyan-neon/20"
            >
              ⟳ Reset stories to built-in
            </button>
            <button
              onClick={() => {
                void navigator.clipboard?.writeText(`${error.message}\n\n${info}`);
              }}
              className="border border-paper/30 px-5 py-2.5 font-pulp text-xs uppercase tracking-[0.22em] text-paper/70 hover:bg-paper/10"
            >
              ⧉ Copy details
            </button>
          </div>
        </div>
      </div>
    );
  }
}
