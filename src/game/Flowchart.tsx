import { useEffect, useMemo, useRef, useState } from "react";
import { prettyFlagName } from "../logic";
import type { JourneyStep, Story } from "../types";

/* ------------------------------------------------------------------ *
 *  ROUTE FLOWCHART
 *
 *  A Detroit: Become Human style route map. Every decision is a node BOX
 *  on a spine: the box scales and fades in, a connector line draws itself
 *  down to the next one, and the branches you didn't take fan out to the
 *  right as smaller ghost boxes.
 *
 *  Two presentations, same component:
 *    variant="panel"  — inline, inside the ending panel (paper background)
 *    variant="screen" — full-screen interstitial shown at each part break
 * ------------------------------------------------------------------ */

const ACCENT: Record<string, { border: string; text: string; bg: string; line: string; hex: string }> = {
  Sultry: { border: "border-neon", text: "text-neon", bg: "bg-neon", line: "bg-neon", hex: "#ff2d95" },
  Aggressive: { border: "border-crimson", text: "text-crimson", bg: "bg-crimson", line: "bg-crimson", hex: "#ff3b30" },
  Clever: { border: "border-cyan-neon", text: "text-cyan-neon", bg: "bg-cyan-neon", line: "bg-cyan-neon", hex: "#2ad9d9" },
  Neutral: { border: "border-gold", text: "text-gold", bg: "bg-gold", line: "bg-gold", hex: "#e8b647" },
};

const accentOf = (tag?: string) => ACCENT[tag ?? "Neutral"] ?? ACCENT.Neutral;

/** Per-node reveal cadence. Slow enough to read, brisk enough to not drag. */
const STEP_MS = 460;

export function Flowchart({
  story,
  journey,
  endingHeadline,
  endingTier,
  title = "Your Route",
  variant = "panel",
  onDone,
}: {
  story: Story;
  journey: JourneyStep[];
  endingHeadline?: string;
  endingTier?: string;
  title?: string;
  variant?: "panel" | "screen";
  onDone?: () => void;
}) {
  // Only real forks are interesting. A lone "continue" button isn't a
  // decision and would pad the chart with noise.
  //
  // Variant choices are also collapsed by text: a branch is often authored as
  // several mutually-exclusive entries carrying the same line (one per story
  // path), and showing "Let her keep the version she's got" three times —
  // twice greyed as locked — reads as a bug rather than as a road not taken.
  const steps = useMemo(
    () =>
      journey
        .filter((s) => s.options.length > 1 || s.timedOut || s.rememberLine)
        .map((s) => {
          const seen = new Set<string>();
          const options = s.options.filter((o) => {
            const key = o.text.trim().toLowerCase();
            // always keep the taken branch; drop later twins of the same line
            if (o.taken) {
              seen.add(key);
              return true;
            }
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          return { ...s, options };
        })
        // After collapsing: a node is only a real decision if the player could
        // actually have gone another way. One taken branch plus nothing but
        // locked siblings is a continue button wearing a fork's clothes.
        .filter((s) => {
          if (s.timedOut || s.rememberLine) return true;
          const alternatives = s.options.filter((o) => !o.taken && !o.locked);
          return alternatives.length > 0;
        }),
    [journey]
  );

  const total = steps.length;

  // Route notes — the flags THIS stretch of the run set (from each journey
  // step's consequences), shown under the chart with their author notes so
  // the recap doubles as a "what now changes in this case" summary.
  const routeNotes = useMemo(() => {
    const seen = new Set<string>();
    const notes: { flag: string; note: string }[] = [];
    for (const step of journey) {
      for (const flag of step.flagsSet ?? []) {
        if (seen.has(flag)) continue;
        seen.add(flag);
        notes.push({ flag, note: story.flagNotes?.[flag]?.trim() ?? "" });
      }
    }
    return notes;
  }, [journey, story]);

  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (done) return;
    if (revealed >= total) {
      setDone(true);
      return;
    }
    timer.current = window.setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 280 : STEP_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [revealed, total, done]);

  // keep the newest node in view while the chart draws itself
  useEffect(() => {
    const el = scroller.current;
    if (!el || variant !== "screen") return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [revealed, variant]);

  // The part-break screen behaves like its sibling interstitials (RouteMap,
  // act/episode title cards): Esc / Enter / Space dismisses it. The case
  // player's global key handler stands down while the part break is up, so
  // these keys can't double-fire behind the chart.
  useEffect(() => {
    if (variant !== "screen" || !onDone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        if (timer.current) window.clearTimeout(timer.current);
        setRevealed(total);
        setDone(true);
        onDone();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, onDone, total]);

  const skip = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setRevealed(total);
    setDone(true);
  };

  const missedCount = steps.reduce((n, s) => n + s.options.filter((o) => !o.taken).length, 0);

  if (!total) {
    // Nothing to chart (e.g. a part with no forks) — don't block the player.
    if (variant === "screen" && onDone) {
      return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-noir-950">
          <button
            onClick={onDone}
            className="border-2 border-gold px-6 py-2 font-pulp text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-noir-950"
          >
            Continue ▸
          </button>
        </div>
      );
    }
    return null;
  }

  const chart = (
    <div className="relative">
      {steps.slice(0, revealed).map((step, i) => {
        const taken = step.options.find((o) => o.taken);
        const others = step.options.filter((o) => !o.taken);
        const acc = accentOf(step.attitudeTag ?? taken?.attitudeTag);
        const last = i === steps.length - 1;

        return (
          <div key={`${step.sceneId}-${i}`} className="fc-row relative pb-6">
            {/* connector down to the next node */}
            {!last && (
              <span
                className={`fc-link absolute left-[11px] top-[38px] w-[2px] ${acc.line} opacity-50`}
                aria-hidden
              />
            )}

            {/* scene caption */}
            <div className="mb-1 pl-8 font-pulp text-[9px] uppercase tracking-[0.3em] text-paper/40">
              {step.sceneTitle}
            </div>

            <div className="flex items-start gap-3">
              {/* junction marker */}
              <span
                className={`fc-dot relative z-10 mt-[6px] h-[22px] w-[22px] shrink-0 rotate-45 border-2 ${acc.border} ${
                  step.timedOut ? "bg-crimson fc-pulse" : "bg-noir-950"
                }`}
                aria-hidden
              />

              {/* THE NODE BOX — the branch taken */}
              <div className="min-w-0 flex-1">
                <div
                  className={`fc-box relative border-2 ${acc.border} bg-noir-900/95 px-3 py-2 shadow-[0_2px_18px_rgba(0,0,0,0.55)]`}
                  style={{ "--fc-accent": acc.hex } as React.CSSProperties}
                >
                  <span className={`absolute left-0 top-0 h-full w-[3px] ${acc.bg}`} aria-hidden />
                  <div className={`font-type text-[13px] leading-snug ${acc.text}`}>
                    {step.timedOut ? (
                      <span className="italic">⏱ You let the window close.</span>
                    ) : (
                      step.choiceText ?? taken?.text ?? "—"
                    )}
                  </div>

                  {step.rememberLine && (
                    <div className="mt-1.5 flex items-center gap-1.5 rounded border border-gold/40 bg-gold/10 px-2 py-1">
                      <span className="shrink-0 text-[10px]">✦</span>
                      <span className="font-type text-[10px] leading-snug text-gold/90">{step.rememberLine}</span>
                    </div>
                  )}

                  {!!step.trustChanges?.length && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {step.trustChanges.map((t) => {
                        const ch = story.characters.find((c) => c.id === t.characterId);
                        if (!ch) return null;
                        const positive = t.delta > 0;
                        return (
                          <span
                            key={t.characterId}
                            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-type text-[10px] ${
                              positive ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-crimson/40 bg-crimson/10 text-crimson"
                            }`}
                          >
                            {positive ? "♥" : "✖"} {ch.name.split(" ")[0]} {positive ? `+${t.delta}` : t.delta}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* GHOST BOXES — the roads not taken, branching right */}
                {others.length > 0 && (
                  <div className="mt-1.5 space-y-1.5 pl-5">
                    {others.map((o, k) => (
                      <div
                        key={o.id}
                        className="fc-ghost relative flex items-center gap-2"
                        style={{ animationDelay: `${260 + k * 90}ms` }}
                      >
                        {/* elbow connector into the ghost box */}
                        <span
                          className="absolute -left-5 top-0 h-1/2 w-[2px] bg-paper/15"
                          aria-hidden
                        />
                        <span className="absolute -left-5 top-1/2 h-[2px] w-5 bg-paper/15" aria-hidden />
                        <div className="flex-1 border border-dashed border-paper/20 bg-noir-950/60 px-2.5 py-1.5">
                          <span className="font-type text-[11px] leading-snug text-paper/30 line-through decoration-paper/20">
                            {o.text}
                          </span>
                          {o.locked && (
                            <span className="ml-1.5 font-pulp text-[8px] uppercase tracking-[0.2em] text-crimson/50">
                              locked
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* terminal node */}
      {done && endingHeadline && (
        <div className="fc-row relative flex items-start gap-3">
          <span
            className={`fc-dot relative z-10 mt-[6px] h-[22px] w-[22px] shrink-0 rotate-45 border-2 ${
              endingTier === "gameover" ? "border-crimson bg-crimson" : "border-gold bg-gold"
            }`}
            aria-hidden
          />
          <div
            className={`fc-box flex-1 border-2 px-3 py-2 ${
              endingTier === "gameover"
                ? "border-crimson bg-crimson/10"
                : "border-gold bg-gold/10"
            }`}
          >
            <div className="font-pulp text-[8px] uppercase tracking-[0.3em] text-paper/45">Ending</div>
            <div
              className={`font-pulp mt-0.5 text-[13px] uppercase leading-tight tracking-[0.1em] ${
                endingTier === "gameover" ? "text-crimson" : "text-gold"
              }`}
            >
              {endingHeadline}
            </div>
          </div>
        </div>
      )}

      {/* route notes — the flags this stretch of the run set, with the
          author's notes, so the chart doubles as a "what has changed" log */}
      {done && routeNotes.length > 0 && (
        <div className="fc-row relative mt-1 border-l-2 border-gold/50 bg-gold/5 px-3 py-2">
          <div className="font-pulp text-[8px] uppercase tracking-[0.3em] text-gold/90">🏷 Route notes</div>
          <ul className="mt-1 space-y-0.5">
            {routeNotes.map(({ flag, note }) => (
              <li key={flag} className="font-type text-[11px] leading-snug text-paper/75" title={flag}>
                <span className="text-gold/90">{note || prettyFlagName(flag)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  /* ---------------- full-screen part-break interstitial ---------------- */
  if (variant === "screen") {
    return (
      <div className="fc-screen fixed inset-0 z-[80] flex flex-col bg-noir-950/98">
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-5 py-6">
          <div className="flex items-baseline justify-between gap-3 border-b border-gold/25 pb-3">
            <div>
              <div className="font-pulp text-xs uppercase tracking-[0.34em] text-gold">{title}</div>
              <div className="font-type mt-1 text-[10px] uppercase tracking-[0.2em] text-paper/40">
                {total} decisions · {missedCount} roads not taken
              </div>
            </div>
            {!done && (
              <button
                onClick={skip}
                className="border border-paper/30 px-2.5 py-1 font-pulp text-[9px] uppercase tracking-[0.25em] text-paper/60 hover:border-gold hover:text-gold"
              >
                Skip ▸▸
              </button>
            )}
          </div>

          <div ref={scroller} className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
            {chart}
          </div>

          {onDone && (
            <div className="mt-4 flex justify-end border-t border-gold/25 pt-3">
              <button
                onClick={onDone}
                className={`border-2 px-6 py-2 font-pulp text-xs uppercase tracking-[0.3em] transition ${
                  done
                    ? "fc-continue border-gold text-gold hover:bg-gold hover:text-noir-950"
                    : "border-paper/20 text-paper/30"
                }`}
              >
                Continue ▸
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- inline panel ---------------- */
  return (
    <div className="mt-3 border-4 border-double border-gold/70 bg-noir-950/95 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="font-pulp text-[10px] uppercase tracking-[0.34em] text-gold/80">{title}</div>
          <div className="font-type mt-0.5 text-[10px] uppercase tracking-[0.2em] text-paper/40">
            {total} decisions · {missedCount} roads not taken
          </div>
        </div>
        {!done && (
          <button
            onClick={skip}
            className="border border-paper/30 px-2 py-1 font-pulp text-[9px] uppercase tracking-[0.25em] text-paper/60 hover:border-gold hover:text-gold"
          >
            Skip ▸▸
          </button>
        )}
      </div>
      <div className="mt-4">{chart}</div>
    </div>
  );
}
