import { useEffect, useMemo, useState } from "react";
import { audio } from "../audio";
import {
  isEpisodeUnlocked,
  resolveRecap,
  seasonEpisodes,
  storySeasonProgress,
  readSaves,
} from "../logic";
import { assetUrl } from "../assetPath";
import type { Act, Character, Episode, EpisodeProgress, GlobalState, Story } from "../types";

/* ------------------------------------------------------------------ */
/*  shared helpers                                                     */
/* ------------------------------------------------------------------ */

export function plateStyle(image?: string): React.CSSProperties {
  if (!image) return { background: "linear-gradient(160deg,#07111e 0%,#1d0c22 55%,#07070c 100%)" };
  if (image.startsWith("gradient:")) return { background: image.slice(9) };
  if (image.startsWith("video:")) return { background: "#05050a" };
  return { backgroundImage: `url(${assetUrl(image)})`, backgroundSize: "cover", backgroundPosition: "center" };
}

const ROMAN = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/** "Episode Two" for small numbers, "Episode 13" beyond the spelled-out
 * range. An optional suffix renders "Episode 2a" for sub-chapters. */
export function episodeLabel(n: number, suffix?: string): string {
  return `Episode ${ROMAN[n] ?? n}${suffix ?? ""}`;
}

function avatarNode(character: Character | undefined) {
  if (!character) return null;
  const url = assetUrl(character.avatarUrl ?? "");
  if (url.startsWith("emoji:")) {
    return <span className="flex h-10 w-10 items-center justify-center border border-gold/40 bg-noir-900 text-xl">{url.slice(6)}</span>;
  }
  if (!url) return null;
  // object-top, not the default centre crop: cast refs are tall 2:3 portraits,
  // and centring a 2:3 image in a square box crops to the chest — a wall of
  // headless avatars. Anchoring the crop to the top keeps the face.
  return <img src={url} alt="" className="h-10 w-10 border border-gold/40 object-cover object-top" />;
}

/* ------------------------------------------------------------------ */
/*  season screen — pick an episode                                    */
/* ------------------------------------------------------------------ */

export function SeasonScreen({
  story,
  onPlayEpisode,
  onResume,
  onExit,
}: {
  story: Story;
  onPlayEpisode: (episode: Episode) => void;
  onResume: (episode: Episode, slot: number) => void;
  onExit: () => void;
}) {
  const episodes = useMemo(() => seasonEpisodes(story), [story]);
  const progress = useMemo(() => storySeasonProgress(story.id), [story.id]);

  return (
    <div className="fx-grain fx-vignette relative h-full w-full overflow-y-auto bg-noir-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-20 kenburns-a"
        style={plateStyle(story.coverImage)}
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-full max-w-5xl flex-col px-6 py-8">
        <button
          onClick={onExit}
          className="self-start border border-paper/30 px-4 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-paper/70 hover:border-neon hover:text-neon"
        >
          ← Back to the newsstand
        </button>

        <header className="mt-6 text-center">
          <div className="font-type text-[10px] uppercase tracking-[0.5em] text-cyan-neon">
            {story.seasonTitle ?? "Season One"}
          </div>
          <h1 className="font-pulp mt-1 text-5xl uppercase leading-none text-gold md:text-6xl">{story.title}</h1>
          <p className="font-type mx-auto mt-2 max-w-xl text-sm italic text-paper/65">{story.tagline}</p>
          <p className="font-type mt-3 text-[10px] uppercase tracking-[0.28em] text-paper/40">
            {Object.keys(progress).length}/{episodes.length} episodes complete · choices carry forward
          </p>
        </header>

        <div className="mt-8 space-y-4">
          {episodes.map((ep, i) => {
            const unlocked = isEpisodeUnlocked(story, ep.id, progress);
            const done = progress[ep.id];
            const saves = readSaves(story.id, ep.id);
            const newest = saves.reduce<{ slot: number; at: number } | null>(
              (best, s, idx) => (s && (!best || s.savedAt > best.at) ? { slot: idx + 1, at: s.savedAt } : best),
              null
            );
            const poster = ep.posterImage ?? ep.titleCardImage ?? story.scenes.find((s) => s.id === ep.startSceneId)?.background;
            return (
              <article
                key={ep.id}
                className={`group relative flex overflow-hidden border-2 transition-all ${
                  unlocked ? "border-noir-600 bg-noir-900/85 hover:border-neon" : "border-noir-700 bg-noir-950/85 opacity-60"
                }`}
              >
                <div className="relative h-40 w-56 shrink-0 overflow-hidden md:w-72" style={plateStyle(poster)}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-noir-900/95" />
                  <div className="absolute left-2 top-2 border border-gold/60 bg-noir-950/85 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-gold">
                    {episodeLabel(ep.number ?? i + 1, ep.numberSuffix)}
                  </div>
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-3xl" aria-hidden>
                      🔒
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                  <div>
                    <h2 className="font-pulp text-2xl uppercase leading-tight text-paper">{ep.title}</h2>
                    {ep.tagline && <p className="font-type mt-1 text-xs italic text-paper/60">{ep.tagline}</p>}
                    {done ? (
                      <div className="mt-2 inline-block border border-emerald-500/40 bg-emerald-500/5 px-2 py-1">
                        <div className="font-pulp text-[9px] uppercase tracking-widest text-emerald-400">
                          {done.endingTier === "gameover" ? "✖ Ended badly" : done.endingTier === "victory-gold" ? "★★ Gold" : "★ Silver"}
                        </div>
                        <div className="font-type text-[10px] text-paper/60">{done.endingHeadline}</div>
                      </div>
                    ) : unlocked ? (
                      <p className="font-type mt-2 text-[10px] uppercase tracking-widest text-cyan-neon">▸ Ready to play</p>
                    ) : (
                      <p className="font-type mt-2 text-[10px] uppercase tracking-widest text-paper/40">
                        Locked — finish {episodes[i - 1]?.title ?? "the previous episode"} first
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      disabled={!unlocked}
                      onClick={() => {
                        audio.click();
                        onPlayEpisode(ep);
                      }}
                      className={`border-2 px-4 py-1.5 font-pulp text-[10px] uppercase tracking-[0.18em] ${
                        unlocked
                          ? "border-gold bg-gold/10 text-gold hover:bg-gold/25"
                          : "cursor-not-allowed border-paper/20 text-paper/30"
                      }`}
                    >
                      {done ? "↻ Replay episode" : "▸ Play episode"}
                    </button>
                    {unlocked && newest && (
                      <button
                        onClick={() => {
                          audio.click();
                          onResume(ep, newest.slot);
                        }}
                        className="border border-cyan-neon/60 px-3 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                      >
                        ▶ Resume · slot {newest.slot}
                      </button>
                    )}
                    <span className="font-type text-[9px] uppercase tracking-widest text-paper/35">
                      {saves.filter(Boolean).length}/{saves.length} slots used
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  previously on… recap                                               */
/* ------------------------------------------------------------------ */

export function EpisodeRecap({
  story,
  episode,
  state,
  onDone,
}: {
  story: Story;
  episode: Episode;
  state: GlobalState;
  onDone: () => void;
}) {
  const lines = useMemo(() => resolveRecap(episode, state), [episode, state]);
  // Memory-driven beats: replay the player's own words back at them, which is
  // the single most gratifying thing a recap can do.
  const memoryLines = useMemo(() => {
    if (!episode.recapFromMemories) return [];
    return Object.entries(state.memories).map(([tag, said]) => ({
      id: `mem-${tag}`,
      text: `You said: ${said}`,
      characterId: undefined as string | undefined,
      image: undefined as string | undefined,
    }));
  }, [episode.recapFromMemories, state.memories]);
  const all = useMemo(() => [...lines, ...memoryLines], [lines, memoryLines]);
  const [idx, setIdx] = useState(0);

  // Auto-advance each beat on a film-trailer cadence; clicking skips ahead.
  useEffect(() => {
    if (idx >= all.length) return;
    const t = window.setTimeout(() => setIdx((i) => i + 1), 2600);
    return () => window.clearTimeout(t);
  }, [idx, all.length]);

  useEffect(() => {
    if (all.length && idx >= all.length) {
      const t = window.setTimeout(onDone, 500);
      return () => window.clearTimeout(t);
    }
  }, [idx, all.length, onDone]);

  if (!all.length) return null;

  const current = all[Math.min(idx, all.length - 1)];
  const speaker = current.characterId ? story.characters.find((c) => c.id === current.characterId) : undefined;

  return (
    <div
      className="fx-grain absolute inset-0 z-[80] flex flex-col items-center justify-center bg-black"
      onClick={() => {
        audio.click();
        setIdx((i) => i + 1);
      }}
    >
      {current.image && (
        <div key={`img-${current.id}`} className="recap-still absolute inset-0 opacity-35" style={plateStyle(current.image)} aria-hidden />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black" aria-hidden />

      <div className="relative z-10 w-full max-w-3xl px-8 text-center">
        <div className="font-pulp text-[11px] uppercase tracking-[0.55em] text-crimson">Previously on</div>
        <div className="font-pulp mt-1 text-lg uppercase tracking-[0.3em] text-paper/60">{story.title}</div>

        <div key={current.id} className="recap-line mt-10 flex items-center justify-center gap-3">
          {avatarNode(speaker)}
          <p className="font-pulp text-2xl leading-snug text-paper md:text-3xl">
            {speaker && <span className="mr-2 text-gold">{speaker.name}:</span>}
            {current.text}
          </p>
        </div>

        <div className="mt-12 flex items-center justify-center gap-1.5" aria-hidden>
          {all.map((line, i) => (
            <span key={line.id} className={`h-0.5 w-8 transition-colors ${i <= idx ? "bg-gold" : "bg-paper/20"}`} />
          ))}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          audio.click();
          onDone();
        }}
        className="absolute bottom-6 right-6 z-10 border border-paper/30 px-3 py-1.5 font-pulp text-[9px] uppercase tracking-[0.25em] text-paper/60 hover:border-neon hover:text-neon"
      >
        Skip recap ⏭
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  title card                                                         */
/* ------------------------------------------------------------------ */

export function EpisodeTitleCard({
  story,
  episode,
  onDone,
}: {
  story: Story;
  episode: Episode;
  onDone: () => void;
}) {
  const holdSeconds = episode.titleCardSeconds ?? 2.4;
  const [ready, setReady] = useState(holdSeconds <= 0);
  const image = episode.titleCardImage ?? story.scenes.find((s) => s.id === episode.startSceneId)?.background;

  useEffect(() => {
    audio.stinger();
    if (holdSeconds <= 0) return;
    const t = window.setTimeout(() => setReady(true), holdSeconds * 1000);
    return () => window.clearTimeout(t);
  }, [holdSeconds]);

  // Once the hold elapses, any click / Space / Enter drops into the episode.
  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        onDone();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, onDone]);

  return (
    <div
      className="fx-grain absolute inset-0 z-[80] flex items-center justify-center bg-black"
      onClick={() => ready && onDone()}
    >
      <div className="title-card-plate absolute inset-0 opacity-45" style={plateStyle(image)} aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/85" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="letterbox-bar letterbox-top" style={{ "--letterbox-h": "12%" } as React.CSSProperties} />
        <div className="letterbox-bar letterbox-bottom" style={{ "--letterbox-h": "12%" } as React.CSSProperties} />
      </div>

      <div className="relative z-10 px-8 text-center">
        <div className="title-card-kicker font-pulp text-[11px] uppercase tracking-[0.6em] text-cyan-neon">
          {episode.kicker ?? story.title}
        </div>
        <div className="title-card-number font-pulp mt-3 text-sm uppercase tracking-[0.5em] text-gold">
          {episodeLabel(episode.number ?? 1, episode.numberSuffix)}
        </div>
        <h1 className="title-card-title font-pulp mt-2 text-5xl uppercase leading-none text-paper drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] md:text-7xl">
          {episode.title}
        </h1>
        <div className="title-card-rule mx-auto mt-5 h-px w-56 bg-gold/70" />
        {episode.tagline && (
          <p className="title-card-tagline font-type mt-4 text-sm italic tracking-wide text-paper/70">{episode.tagline}</p>
        )}

        <div className="mt-10 h-8">
          {ready && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                audio.click();
                onDone();
              }}
              className="pop-in border-2 border-gold bg-gold/10 px-7 py-2.5 font-pulp text-xs uppercase tracking-[0.22em] text-gold hover:bg-gold/30"
            >
              ▸ Begin {episodeLabel(episode.number ?? 1, episode.numberSuffix)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  next time on… teaser                                               */
/* ------------------------------------------------------------------ */

export function NextTimeCard({
  story,
  fromEpisode,
  toEpisode,
  onContinue,
  onSeasonScreen,
  lines: linesProp,
}: {
  story: Story;
  fromEpisode: Episode;
  toEpisode: Episode;
  onContinue: () => void;
  onSeasonScreen: () => void;
  /** per-ending teaser lines (forked seasons); falls back to the episode's */
  lines?: string[];
}) {
  const lines = linesProp ?? fromEpisode.nextTimeLines ?? [];
  const [shown, setShown] = useState(0);
  const image = toEpisode.titleCardImage ?? toEpisode.posterImage ?? story.scenes.find((s) => s.id === toEpisode.startSceneId)?.background;

  useEffect(() => {
    if (shown >= lines.length) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), 1400);
    return () => window.clearTimeout(t);
  }, [shown, lines.length]);

  return (
    <div className="fx-grain absolute inset-0 z-[80] flex items-center justify-center bg-black">
      <div className="absolute inset-0 opacity-30 kenburns-b" style={plateStyle(image)} aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/90" aria-hidden />

      <div className="relative z-10 w-full max-w-2xl px-8 text-center">
        <div className="font-pulp text-[11px] uppercase tracking-[0.55em] text-crimson">Next time on</div>
        <div className="font-pulp mt-1 text-xl uppercase tracking-[0.3em] text-paper/70">{story.title}</div>

        <div className="mt-8 min-h-[9rem] space-y-3">
          {lines.slice(0, shown).map((line, i) => (
            <p key={i} className="recap-line font-pulp text-xl leading-snug text-paper md:text-2xl">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-6 border-t border-gold/30 pt-5">
          <div className="font-pulp text-[10px] uppercase tracking-[0.4em] text-gold">
            {episodeLabel(toEpisode.number ?? 1, toEpisode.numberSuffix)}
          </div>
          <h2 className="font-pulp mt-1 text-3xl uppercase leading-tight text-paper md:text-4xl">{toEpisode.title}</h2>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              audio.click();
              onContinue();
            }}
            className="border-2 border-gold bg-gold/15 px-6 py-2.5 font-pulp text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold/30"
          >
            ▸ Play {episodeLabel(toEpisode.number ?? 1, toEpisode.numberSuffix)}
          </button>
          <button
            onClick={() => {
              audio.click();
              onSeasonScreen();
            }}
            className="border-2 border-paper/40 px-6 py-2.5 font-pulp text-xs uppercase tracking-[0.2em] text-paper/80 hover:border-neon hover:text-neon"
          >
            Episode list
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  episode ending card                                                */
/* ------------------------------------------------------------------ */

/** End-of-episode card: how this chapter closed, the standout
 * choices the player made in it, and the handoff to the next episode. */
export function EpisodeEndCard({
  story,
  episode,
  progress,
  choiceHighlights,
  hasNext,
  onNextTime,
  onReplay,
  onSeasonScreen,
  onExit,
}: {
  story: Story;
  episode: Episode;
  progress: EpisodeProgress;
  choiceHighlights: string[];
  hasNext: boolean;
  onNextTime: () => void;
  onReplay: () => void;
  onSeasonScreen: () => void;
  onExit: () => void;
}) {
  const episodes = seasonEpisodes(story);
  const idx = episodes.findIndex((e) => e.id === episode.id);
  const cleared = storySeasonProgress(story.id);

  return (
    <div className="pop-in mt-2 border-4 border-double border-gold bg-paper p-4 text-noir-900 shadow-[0_0_60px_rgba(232,178,60,0.25)]">
      <div className="flex items-baseline justify-between gap-2 border-b border-noir-900/20 pb-1">
        <span className="font-pulp text-[11px] uppercase tracking-[0.3em] text-noir-700">
          {episodeLabel(episode.number ?? idx + 1, episode.numberSuffix)} — {episode.title}
        </span>
        <span
          className={`font-pulp text-[10px] uppercase tracking-[0.2em] ${
            progress.endingTier === "gameover" ? "text-crimson" : "text-emerald-700"
          }`}
        >
          {progress.endingTier === "victory-gold"
            ? "★★ Gold"
            : progress.endingTier === "victory-silver"
              ? "★ Silver"
              : "✖ Game Over"}
        </span>
      </div>

      <h2 className="font-pulp mt-2 text-2xl leading-tight">{progress.endingHeadline}</h2>

      {choiceHighlights.length > 0 && (
        <div className="mt-3 border-t border-noir-900/15 pt-2">
          <div className="font-pulp text-[9px] uppercase tracking-[0.3em] text-noir-700/70">Your defining choices</div>
          <ul className="mt-1 space-y-0.5">
            {choiceHighlights.map((line, i) => (
              <li key={i} className="font-type text-[11px] italic text-noir-700">
                — {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-center gap-1.5 border-t border-noir-900/15 pt-2" aria-hidden>
        {episodes.map((ep) => (
          <span
            key={ep.id}
            title={ep.title}
            className={`h-1.5 flex-1 ${ep.id === episode.id ? "bg-crimson" : cleared[ep.id] ? "bg-emerald-700/70" : "bg-noir-900/20"}`}
          />
        ))}
      </div>
      <p className="font-type mt-1 text-[9px] uppercase tracking-[0.28em] text-noir-700/60">
        {Object.keys(cleared).length}/{episodes.length} episodes complete · your choices carry forward
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {hasNext ? (
          <button
            onClick={onNextTime}
            className="border-2 border-noir-900 bg-noir-900 px-4 py-1.5 font-pulp text-xs uppercase tracking-widest text-paper hover:border-crimson hover:bg-crimson"
          >
            ▸ Next time on…
          </button>
        ) : (
          <span className="border-2 border-noir-900/40 px-4 py-1.5 font-pulp text-xs uppercase tracking-widest text-noir-700">
            ★ Season complete
          </span>
        )}
        <button
          onClick={onReplay}
          className="border-2 border-noir-900 px-4 py-1.5 font-pulp text-xs uppercase tracking-widest text-noir-900 hover:bg-noir-900 hover:text-gold"
        >
          ↻ Replay episode
        </button>
        <button
          onClick={onSeasonScreen}
          className="border-2 border-noir-900 px-4 py-1.5 font-pulp text-xs uppercase tracking-widest hover:bg-noir-900 hover:text-paper"
        >
          Episode list
        </button>
        <button
          onClick={onExit}
          className="border-2 border-noir-900/50 px-4 py-1.5 font-pulp text-xs uppercase tracking-widest text-noir-700 hover:bg-noir-900 hover:text-paper"
        >
          Back to the Newsstand
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  in-episode HUD chip                                                */
/* ------------------------------------------------------------------ */

/** A small persistent "Ep. 2 · The Long Drop" chip so the player always knows
 * which chapter they're in. */
export function EpisodeChip({ episode, onOpenSeason }: { episode: Episode; onOpenSeason: () => void }) {
  return (
    <button
      onClick={() => {
        audio.click();
        onOpenSeason();
      }}
      className="hud-btn px-2.5 py-1"
      data-color="crimson"
      title="Episode list"
    >
      <span className="text-gold">Ep. {episode.number ?? 1}</span>
      <span className="max-w-40 truncate text-paper/70">{episode.title}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ *
 *  ACT TITLE CARD
 *
 *  The act-level sibling of EpisodeTitleCard. Acts live inside one
 *  continuous run, so this card is a beat rather than a chapter break:
 *  no recap, no save prompt, no "Begin Episode" framing. It states where
 *  you are and gets out of the way.
 * ------------------------------------------------------------------ */

export function ActTitleCard({
  story,
  act,
  onDone,
}: {
  story: Story;
  act: Act;
  onDone: () => void;
}) {
  const holdSeconds = act.titleCardSeconds ?? 2.6;
  const [ready, setReady] = useState(holdSeconds <= 0);
  const image =
    act.titleCardImage ?? story.scenes.find((s) => s.id === act.startSceneId)?.background;

  useEffect(() => {
    audio.stinger();
    if (holdSeconds <= 0) return;
    const t = window.setTimeout(() => setReady(true), holdSeconds * 1000);
    return () => window.clearTimeout(t);
  }, [holdSeconds]);

  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        onDone();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, onDone]);

  return (
    <div
      className="fx-grain absolute inset-0 z-[80] flex items-center justify-center bg-black"
      onClick={() => ready && onDone()}
    >
      <div className="title-card-plate absolute inset-0 opacity-40" style={plateStyle(image)} aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/85" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="letterbox-bar letterbox-top" style={{ "--letterbox-h": "14%" } as React.CSSProperties} />
        <div className="letterbox-bar letterbox-bottom" style={{ "--letterbox-h": "14%" } as React.CSSProperties} />
      </div>

      <div className="relative z-10 px-8 text-center">
        <div className="title-card-number font-pulp text-sm uppercase tracking-[0.55em] text-gold">
          {act.label}
        </div>
        <h1 className="title-card-title font-pulp mt-3 text-4xl uppercase leading-none text-paper drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] md:text-6xl">
          {act.title}
        </h1>
        <div className="title-card-rule mx-auto mt-5 h-px w-48 bg-gold/70" />
        {act.tagline && (
          <p className="title-card-tagline font-type mt-4 text-sm italic tracking-wide text-paper/70">
            {act.tagline}
          </p>
        )}

        <div className="mt-10 h-8">
          {ready && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                audio.click();
                onDone();
              }}
              className="pop-in border-2 border-gold bg-gold/10 px-7 py-2.5 font-pulp text-xs uppercase tracking-[0.22em] text-gold hover:bg-gold/30"
            >
              ▸ Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
