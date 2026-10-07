import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { audio, type MixChannel } from "./audio";
import { STORIES } from "./data/stories";
import { GamePlayer, LensFlareLayer } from "./game/Game";
import { clearSession, readSession, writeSession } from "./game/session";
import { deepLinkFromUrl } from "./game/deepLink";
import { decodeStory, isEpisodic, latestSave, loadEndings, removeStoryEndings, seasonEpisodes, storySeasonProgress } from "./logic";
import { assetUrl } from "./assetPath";
import { Studio } from "./studio/Studio";
import { createPortableStoryBundle } from "./studio/exportBundle";
import { CreatorManual } from "./studio/CreatorManual";
import { resolveAssetReference, resolveStoryMedia, compactStoryMedia, loadStoryAssetsForExport, importStoryAssets, deleteStoryAssets } from "./data/mediaLibrary";
import { parseCaseBytes } from "./data/screel";
import type { EndingLog, Story, TitleTheme } from "./types";

type PrimedAudio = { url: string; el: HTMLAudioElement };

type Mode =
  | { kind: "menu" }
  | {
      kind: "play";
      story: Story;
      resumeSlot?: number;
      resumeEpisodeId?: string;
      /** Studio "Play from here": open directly at this scene (episodic
       *  playtest launches the owning episode straight into it). */
      playFromSceneId?: string;
      primedMusic?: PrimedAudio | null;
      primedNarration?: PrimedAudio | null;
    }
  | { kind: "studio"; openStoryId?: string; openSceneId?: string }
  | { kind: "manual" }
  | { kind: "gallery" };

const SETTINGS_KEY = "scarlet-reel-settings-v1";
const HIDDEN_STORIES_KEY = "scarlet-reel-hidden-stories";
const CUSTOM_STORIES_KEY = "scarlet-reel-custom-stories-v1";
const publishedKey = (id: string) => `scarlet-reel-published-${id}`;
const draftKey = (id: string) => `scarlet-studio-draft-${id}`;
const GLOBAL_TITLE_THEME_KEY = "scarlet-reel-global-title-theme";
const STORY_SNAPSHOT_BUILD_KEY = "scarlet-reel-story-snapshot-build";
const APP_BUILD_ID = __SCARLET_REEL_BUILD_ID__;
const STUDIO_PLAY_HASH = "#studio-play=";
const studioPlayKey = (token: string) => `scarlet-studio-play-${token}`;
// Content metadata is diagnostic only. App updates must never delete author work.
const CONTENT_REVISION = "40";

export function loadGlobalTitleTheme(): TitleTheme {
  try {
    const raw = localStorage.getItem(GLOBAL_TITLE_THEME_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    titleText: "Nobody’s Witness",
    tagline: "A film in Tokyo rain",
    bgImageUrl: "/img/bg-alley.jpg",
    neonColor: "#e8a24a",
    // The newest case gets the front page out of the box, so the featured
    // strip is visible without having to go and configure it first.
    featuredStoryIds: ["hollywood-opening", "black-mass-bride", "dominion", "sledge-hammer-caliber"],
  };
}

function loadHiddenStories(): string[] {
  // The catalogue is a single flagship case, so nothing is hidden by default.
  // A saved list is still honoured, but can never hide every story — an empty
  // newsstand looks identical to a broken build, and there would be no card
  // left to click to reach the restore control.
  try {
    const saved = localStorage.getItem(HIDDEN_STORIES_KEY);
    if (saved === null) return [];
    const parsed = JSON.parse(saved) as string[];
    if (!Array.isArray(parsed)) return [];
    const visible = STORIES.filter((s) => !parsed.includes(s.id));
    return visible.length ? parsed : [];
  } catch {
    return [];
  }
}

function loadCustomStories(): Story[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_STORIES_KEY) ?? "[]") as Story[];
    return parsed.filter((story) => story?.id && typeof story.title === "string" && Array.isArray(story.scenes));
  } catch {
    return [];
  }
}

function saveCustomStories(stories: Story[]): boolean {
  try {
    localStorage.setItem(CUSTOM_STORIES_KEY, JSON.stringify(stories));
    return true;
  } catch {
    return false;
  }
}

/** Track upgrades without deleting drafts or publications. A built-in opened
 * in Studio is editable author work too; only an explicit Reset may replace
 * it. Older builds erased these snapshots every time Vite/build restarted. */
function migrateLegacyStoryStorage() {
  try {
    localStorage.setItem(STORY_SNAPSHOT_BUILD_KEY, APP_BUILD_ID);
    localStorage.setItem("scarlet-reel-content-revision", CONTENT_REVISION);
  } catch { /* Storage unavailable: the built-in catalogue still works. */ }
}

/**
 * The newsstand plays exactly what Studio last saved. Published takes priority,
 * then the live autosaved draft, then the built-in story — so what you build in
 * the backend is always what you play in the frontend.
 */
function loadPublishedCatalog(): Story[] {
  migrateLegacyStoryStorage();
  const hidden = new Set(loadHiddenStories());
  const read = (key: string): Story | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Story;
      return parsed.id && parsed.scenes?.length ? parsed : null;
    } catch {
      return null;
    }
  };
  const builtIns = STORIES.filter((story) => !hidden.has(story.id)).map(
    (fallback) => read(publishedKey(fallback.id)) ?? read(draftKey(fallback.id)) ?? fallback
  );
  // A custom-stories entry carrying a BUILT-IN id would shadow the real story
  // forever: it is keyed separately, so no revision sweep ever touched it, and
  // the newsstand would keep playing an ancient snapshot (that is how a story
  // with no episodes kept presenting itself as a season). Built-ins always win.
  const builtInIds = new Set(STORIES.map((s) => s.id));
  const custom = loadCustomStories()
    .filter((story) => !hidden.has(story.id) && !builtInIds.has(story.id))
    .map((fallback) => read(publishedKey(fallback.id)) ?? read(draftKey(fallback.id)) ?? fallback);
  return [...builtIns, ...custom].filter((story, index, all) => all.findIndex((candidate) => candidate.id === story.id) === index);
}

interface Settings {
  volumes: Record<MixChannel, number>;
  typeSpeed: number;
}

function loadSettings(): Settings {
  const defaults = { volumes: { master: 0.8, music: 0.8, ambient: 0.45, voice: 0.9, sfx: 0.75 }, typeSpeed: 34 };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      // Merge so newly-added channels (e.g. music) get defaults on old saves.
      return { ...defaults, ...parsed, volumes: { ...defaults.volumes, ...(parsed.volumes ?? {}) } };
    }
  } catch {
    /* ignore */
  }
  return defaults;
}

function coverStyle(cover: string): React.CSSProperties {
  if (cover.startsWith("gradient:")) return { background: cover.slice(9) };
  return { backgroundImage: `url(${assetUrl(cover)})`, backgroundSize: "cover", backgroundPosition: "center" };
}

const TIER_LABEL: Record<string, { text: string; cls: string }> = {
  "victory-gold": { text: "★★ GOLD CASE", cls: "text-amber-600 border-amber-600" },
  "victory-silver": { text: "★ SILVER CASE", cls: "text-slate-500 border-slate-500" },
  gameover: { text: "✖ GAME OVER", cls: "text-crimson border-crimson" },
};

const WINDOW_RESOLUTIONS = [
  { label: "1280 × 720 — HD", width: 1280, height: 720 },
  { label: "1366 × 768 — Laptop", width: 1366, height: 768 },
  { label: "1600 × 900 — Wide", width: 1600, height: 900 },
  { label: "1920 × 1080 — Full HD", width: 1920, height: 1080 },
  { label: "2560 × 1440 — QHD", width: 2560, height: 1440 },
];

export default function App() {
  const [mode, setMode] = useState<Mode>({ kind: "menu" });
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [endings, setEndings] = useState<EndingLog>(loadEndings);
  const [catalog, setCatalog] = useState<Story[]>(loadPublishedCatalog);
  const [hiddenStories, setHiddenStories] = useState<string[]>(loadHiddenStories);
  const [, setCustomStories] = useState<Story[]>(loadCustomStories);
  const [globalTitleTheme, setGlobalTitleTheme] = useState<TitleTheme>(loadGlobalTitleTheme);
  const [resolvedTitleTheme, setResolvedTitleTheme] = useState<TitleTheme>(loadGlobalTitleTheme);
  const [imported, setImported] = useState<Story | null>(null);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [infoStory, setInfoStory] = useState<Story | null>(null);
  const [verticalRack, setVerticalRack] = useState(false);
  const [fullscreenOn, setFullscreenOn] = useState(false);
  const [resolutionValue, setResolutionValue] = useState("1440x900");
  const menuMusicRef = useRef<HTMLAudioElement | null>(null);
  // Live view of settings so the menu-music helper can read current volumes
  // without making the menu re-mount on every slider tick.
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      resolveAssetReference(globalTitleTheme.musicUrl),
      resolveAssetReference(globalTitleTheme.bgImageUrl),
    ]).then(([musicUrl, bgImageUrl]) => {
      if (!cancelled) setResolvedTitleTheme({ ...globalTitleTheme, musicUrl, bgImageUrl });
    });
    return () => {
      cancelled = true;
    };
  }, [globalTitleTheme]);

  const startMenuMusic = useCallback(() => {
    if (mode.kind !== "menu" || !resolvedTitleTheme.musicUrl) return;
    // Compare by the raw configured URL (not Audio.src, which is resolved to an
    // absolute URL) so we don't re-create + stack a new track every call.
    if (menuMusicRef.current?.dataset.src === resolvedTitleTheme.musicUrl && !menuMusicRef.current.paused) return;
    menuMusicRef.current?.pause();
    const track = new Audio(assetUrl(resolvedTitleTheme.musicUrl));
    track.loop = true;
    track.dataset.src = resolvedTitleTheme.musicUrl;
    // The title soundtrack is music — follow the same Master × Music mix as the
    // in-game scene music so the Sound Booth Music slider actually controls it.
    track.volume = Math.min(1, settingsRef.current.volumes.master * settingsRef.current.volumes.music);
    menuMusicRef.current = track;
    track.play().catch(() => {
      // Browser autoplay policy: the root pointer handler retries after the
      // player's first gesture.
    });
  }, [mode.kind, resolvedTitleTheme.musicUrl]);

  // apply volumes to engine (WebAudio buses) AND the raw menu-music element.
  useEffect(() => {
    (Object.keys(settings.volumes) as MixChannel[]).forEach((ch) => audio.setVolume(ch, settings.volumes[ch]));
    if (menuMusicRef.current) {
      menuMusicRef.current.volume = Math.min(1, settings.volumes.master * settings.volumes.music);
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // shared reel import / Studio playtest handoff from URL hash. The hash is
  // STUDIO_PLAY_HASH + token; we strip any trailing "&scene=…" suffix because
  // the scene id rides in the payload, not the token — otherwise the popup's
  // &scene= suffix made the localStorage token lookups miss.
  useEffect(() => {
    if (location.hash.startsWith(STUDIO_PLAY_HASH)) {
      let token = decodeURIComponent(location.hash.slice(STUDIO_PLAY_HASH.length));
      token = token.split("&")[0];
      const key = studioPlayKey(token);
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const payload = JSON.parse(raw) as { story?: Story } | Story | null;
          const wrapped = payload && typeof payload === "object" && "story" in payload ? payload : null;
          const story = (wrapped ? wrapped.story : payload) as Story | null | undefined;
          const fromSceneId = (wrapped && (wrapped as { fromSceneId?: string }).fromSceneId) || undefined;
          if (story?.id && Array.isArray(story.scenes)) {
            // React StrictMode runs mount effects twice in dev. Do not remove the
            // handoff before the async media resolver finishes, or the second
            // effect sees an empty token and the new tab falls back to the
            // newsstand. Duplicate resolves are harmless; both land on the same
            // play mode, and the token is cleared only after a successful handoff.
            void resolveStoryMedia(story).then((resolved) => {
              setMode({ kind: "play", story: resolved, primedMusic: null, playFromSceneId: fromSceneId });
              localStorage.removeItem(key);
              window.history.replaceState(null, "", `${location.pathname}${location.search}`);
            });
            return;
          }
        } catch {
          // Bad or expired handoff: leave the new tab on the newsstand.
        }
      }
      // Missing/corrupt token: keep reloads from retrying a dead handoff forever.
      window.history.replaceState(null, "", `${location.pathname}${location.search}`);
    } else if (location.hash.startsWith("#reel=")) {
      const story = decodeStory(location.hash.slice(6));
      if (story) setImported(story);
    } else if (location.hash === "#studio" || new URLSearchParams(location.search).get("studio")) {
      setMode({ kind: "studio" });
    } else if (location.hash === "#manual" || location.hash.startsWith("#manual/") || new URLSearchParams(location.search).get("manual") !== null) {
      setMode({ kind: "manual" });
    } else if (
      location.hash === "#play" ||
      new URLSearchParams(location.search).get("play") ||
      // WORLD-STATE DEEP LINK — ?scene=…&flags=…&items=… boots straight into
      // the game so a collaborator can be handed one specific branch as a URL.
      // ?story=<id> picks which case; without it the flagship is assumed, so
      // the short form (?scene=tt_light&flags=tt_caught_lie) just works.
      // GamePlayer does the resolving; App only has to open the player.
      deepLinkFromUrl().present
    ) {
      const wanted = new URLSearchParams(location.search).get("story");
      const playableCatalog = loadPublishedCatalog();
      const target =
        (wanted ? playableCatalog.find((s) => s.id === wanted) : undefined) ??
        STORIES.find((s) => s.id === "nobodys-witness-true") ??
        STORIES.find((s) => s.id === "nobodys-witness-flagship") ??
        STORIES[0];
      if (wanted && !playableCatalog.some((s) => s.id === wanted)) {
        console.warn(`[deep-link] unknown story "${wanted}" — opening the flagship instead`);
      }
      if (target) {
        void resolveStoryMedia(target).then((resolved) => {
          setMode({ kind: "play", story: resolved, primedMusic: null });
        });
      }
    }
  }, []);

  useEffect(() => {
    if (mode.kind === "menu") {
      if (resolvedTitleTheme.musicUrl) {
        startMenuMusic();
        audio.setAmbient(null);
      } else {
        audio.setAmbient("rain");
      }
      setEndings(loadEndings());
      setCatalog(loadPublishedCatalog());
      setHiddenStories(loadHiddenStories());
      // Re-read settings so volumes changed inside a story (which persist
      // straight to localStorage) show up in the Sound Booth and menu music.
      setSettings(loadSettings());
    } else {
      if (menuMusicRef.current) {
        menuMusicRef.current.pause();
        menuMusicRef.current = null;
      }
    }
    if (mode.kind === "studio" || mode.kind === "gallery") audio.setAmbient(null);
  }, [mode.kind, resolvedTitleTheme.musicUrl, startMenuMusic]);

  const allStories = useMemo(() => (imported ? [...catalog, imported] : catalog), [catalog, imported]);
  /** ★ FEATURED — the big banner cards at the top of the newsstand, in the
   *  order the author listed them. Unresolvable ids are skipped so a hidden
   *  or deleted case can't leave a hole on the front page. */
  const featuredStories = useMemo(() => {
    const ids = globalTitleTheme.featuredStoryIds ?? [];
    if (ids.length === 0) return [];
    const byId = new Map(allStories.map((s) => [s.id, s]));
    const seen = new Set<string>();
    return ids
      .filter((id) => !seen.has(id) && seen.add(id))
      .map((id) => byId.get(id))
      .filter((s): s is NonNullable<typeof s> => !!s);
  }, [allStories, globalTitleTheme.featuredStoryIds]);
  /** The ordinary grid below — a featured case is NOT repeated in it. */
  const stories = useMemo(() => {
    if (featuredStories.length === 0) return allStories;
    const feat = new Set(featuredStories.map((s) => s.id));
    return allStories.filter((s) => !feat.has(s.id));
  }, [allStories, featuredStories]);

  const primeOpeningNarration = useCallback((story: Story): PrimedAudio | null => {
    // Recorded prose MP3s are raw <audio> elements. Start-scene autoplay must be
    // kicked off inside the user's Play click, the same way opening music is
    // primed, or stricter browsers reject it when the React scene-entry effect
    // runs a tick later.
    if (isEpisodic(story)) return null;
    const startScene = story.scenes.find((s) => s.id === story.startSceneId);
    const url = startScene?.narrationAudioUrl;
    if (!startScene || startScene.autoNarrate === false || !url || url.startsWith("asset:")) return null;
    try {
      const el = new Audio(assetUrl(url));
      el.preload = "auto";
      el.volume = Math.min(1, audio.volumes.master * audio.volumes.voice);
      el.play().catch(() => {
        /* the player will adopt the element and retry on its own */
      });
      return { url, el };
    } catch {
      return null;
    }
  }, []);

  const play = useCallback((story: Story, resumeSlot?: number, resumeEpisodeId?: string, playFromSceneId?: string) => {
    audio.unlock();
    audio.stopSpeech();
    // The persisted story stores compact `asset:<id>` references instead of
    // base64 data URLs (so localStorage never overflows). Resolve them to real
    // URLs right before the game player reads them.
    //
    // Autoplay root-cause fix: the opening scene's soundtrack used to start
    // inside GamePlayer's mount effect — a macrotask AFTER this click — so the
    // browser's user-activation window had already closed and `play()` was
    // rejected on the credits node. Prime the opening track here, synchronously
    // inside the gesture, and hand the already-playing element to the player.
    let primedMusic: PrimedAudio | null = null;
    // Only a fresh run primes the opening narration. A resume lands mid-story,
    // where the start scene's prose MP3 is never adopted (playProse only
    // consumes the primer for the scene it is entering) and would otherwise
    // keep playing over the resumed scene until the player quit. Music priming
    // is safe on resume: an unused primer is paused when the scene mounts.
    const primedNarration = resumeSlot !== undefined || resumeEpisodeId ? null : primeOpeningNarration(story);
    // An episodic season opens on its season screen, not on a scene, so there
    // is no opening track to prime — the episode's music starts after the
    // title card, well inside a later user gesture.
    const startScene = isEpisodic(story) ? undefined : story.scenes.find((s) => s.id === story.startSceneId);
    const openingTrack = startScene?.musicUrl ?? startScene?.sceneAudioUrl;
    if (startScene?.musicMode !== "none" && openingTrack && !/^(asset:|data:|video:)/.test(openingTrack)) {
      try {
        const el = new Audio(assetUrl(openingTrack));
        el.loop = true;
        el.volume = audio.volumes.master * audio.volumes.music;
        el.play().catch(() => {
          /* the player will adopt the element and retry on its own */
        });
        primedMusic = { url: openingTrack, el };
      } catch {
        /* fall back to the player's own attempt */
      }
    }
    resolveStoryMedia(story)
      .then((resolved) => setMode({ kind: "play", story: resolved, resumeSlot, resumeEpisodeId, playFromSceneId, primedMusic, primedNarration }))
      .catch((err) => {
        // Never leave the primed opening audio playing over the newsstand if
        // media resolution fails before the player mounts.
        if (primedNarration) primedNarration.el.pause();
        if (primedMusic) primedMusic.el.pause();
        console.warn("Couldn't resolve story media before play.", err);
      });
  }, [primeOpeningNarration]);

  /* -------- session restore --------
   * A reload used to drop the player back on the newsstand even though the AUTO
   * checkpoint still held their exact scene — with HMR reloads in dev (or a
   * browser refresh, or reopening the packaged app) that reads as "the game
   * restarted". Remember which screen we were on and put the player back there.
   * A case resumes through the same latestSave() path as the newsstand's
   * "▶ Resume" button, so nothing about save handling changes. */
  const sessionRestored = useRef(false);
  useEffect(() => {
    if (sessionRestored.current) return;
    sessionRestored.current = true;
    // A world-state deep link is an explicit instruction about where to land.
    // Restoring the last session on top of it would silently discard the
    // branch the link was sent to show.
    if (deepLinkFromUrl().present) return;
    const session = readSession();
    if (!session) return;
    if (session.kind === "studio") {
      setMode({ kind: "studio" });
      return;
    }
    if (session.kind === "gallery") {
      setMode({ kind: "gallery" });
      return;
    }
    // allStories, not `stories`: the grid list excludes anything promoted to
    // the featured strip, and a featured case must still be resumable.
    const story = allStories.find((s) => s.id === session.storyId);
    // Case deleted or hidden, or no checkpoint to return to — the newsstand is
    // the right place to land, so fall through and leave mode alone.
    if (!story) return;
    const newest = latestSave(story);
    if (!newest) return;
    play(story, newest.slot, newest.episodeId);
  }, [allStories, play]);

  // Persist the current screen. The first run is skipped so the stored session
  // survives long enough for the restore effect above to read it.
  const sessionPersistReady = useRef(false);
  useEffect(() => {
    if (!sessionPersistReady.current) {
      sessionPersistReady.current = true;
      return;
    }
    if (mode.kind === "menu") {
      // Quitting to the newsstand is deliberate — don't bounce back on reload.
      clearSession();
    } else if (mode.kind === "play") {
      writeSession({ kind: "play", storyId: mode.story.id });
    } else if (mode.kind === "studio" || mode.kind === "gallery") {
      writeSession({ kind: mode.kind });
    } else {
      clearSession();
    }
  }, [mode]);

  // Native File menu follows this window's screen: Studio gets Save Case /
  // Open Case, play gets Save Game / Load Game. A no-op in the browser.
  useEffect(() => {
    const bridge = typeof window !== "undefined" ? window.scarletReelDesktop : undefined;
    void bridge?.setAppMode?.(mode.kind);
  }, [mode.kind]);

  // Robust export: try download, always try clipboard too, surface feedback via a
  // banner instead of silent failure (sandboxed previews often block downloads).
  const [notice, setNotice] = useState<string | null>(null);
  const say = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4200);
  };

  useEffect(() => {
    const syncFullscreen = () => {
      const bridge = window.scarletReelDesktop;
      if (bridge?.isFullscreen) {
        bridge.isFullscreen().then(setFullscreenOn).catch(() => setFullscreenOn(false));
      } else {
        setFullscreenOn(!!document.fullscreenElement);
      }
    };
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    window.addEventListener("resize", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      window.removeEventListener("resize", syncFullscreen);
    };
  }, []);

  const setFullscreenMode = useCallback(async (enabled: boolean) => {
    const bridge = window.scarletReelDesktop;
    try {
      if (bridge?.setFullscreen) {
        const active = await bridge.setFullscreen(enabled);
        setFullscreenOn(active);
        say(active ? "Fullscreen enabled." : "Windowed mode enabled.");
        return;
      }
      if (enabled) {
        await document.documentElement.requestFullscreen();
        setFullscreenOn(true);
        say("Fullscreen enabled.");
      } else {
        if (document.fullscreenElement) await document.exitFullscreen();
        setFullscreenOn(false);
        say("Windowed mode enabled.");
      }
    } catch {
      say(enabled ? "Fullscreen was blocked by the browser." : "Couldn't leave fullscreen.");
    }
  }, []);

  const applyResolution = useCallback(async (value: string) => {
    setResolutionValue(value);
    const choice = WINDOW_RESOLUTIONS.find((r) => `${r.width}x${r.height}` === value);
    if (!choice) return;
    const bridge = window.scarletReelDesktop;
    try {
      if (bridge?.setWindowSize) {
        const actual = await bridge.setWindowSize(choice.width, choice.height);
        setFullscreenOn(false);
        say(`Window set to ${actual.width} × ${actual.height}.`);
        return;
      }
      window.resizeTo(choice.width, choice.height);
      say("Resolution requested. Browsers only allow this for some popup windows; desktop builds support it fully.");
    } catch {
      say("Couldn't change window size here. Try the desktop build or use fullscreen.");
    }
  }, []);

  const quitGame = useCallback(async () => {
    const bridge = window.scarletReelDesktop;
    if (bridge?.quit) {
      await bridge.quit();
      return;
    }
    window.close();
    say("If this tab stays open, close it in your browser to quit.");
  }, []);

  const openStudioPlayWindow = useCallback((story: Story, fromSceneId?: string): boolean => {
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const key = studioPlayKey(token);
    // The playtest runs in a separate document, so an <audio> element primed
    // here could never be adopted there. Priming used to make the prose MP3
    // play behind Studio while skipOpeningNarration told the playtest tab to
    // wait for an element it would never receive — narration was silent in the
    // playtest and leaked out of the editor. Let the playtest start its own
    // narration; if a strict browser rejects the opening autoplay, the engine
    // retries the clip on the player's first real gesture.
    try {
      localStorage.setItem(key, JSON.stringify({ story, fromSceneId: fromSceneId ?? story.startSceneId, createdAt: Date.now() }));
    } catch {
      return false;
    }

    const baseUrl = location.href.split("#")[0];
    const sceneQ = fromSceneId ? `&scene=${encodeURIComponent(fromSceneId)}` : "";
    const child = window.open(`${baseUrl}${STUDIO_PLAY_HASH}${encodeURIComponent(token)}${sceneQ}`, "_blank");
    if (!child) {
      localStorage.removeItem(key);
      return false;
    }
    try {
      child.opener = null;
    } catch {
      /* noop — older browsers may not allow clearing opener */
    }
    return true;
  }, []);

  const downloadReel = async (data: unknown, filename: string) => {
    const text = JSON.stringify(data, null, 2);
    let downloaded = false;
    try {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      downloaded = true;
    } catch {
      downloaded = false;
    }
    try {
      await navigator.clipboard.writeText(text);
      say(downloaded ? `${filename} downloaded and copied to clipboard.` : `Clipboard ready — save it as ${filename}.`);
    } catch {
      say(downloaded ? `${filename} downloaded.` : `Download blocked — copy the JSON from Studio's Export modal instead.`);
    }
  };

  const endingsTotal = (s: Story) => s.scenes.filter((sc) => sc.isEnding).length;
  const endingsFound = (s: Story) => (endings[s.id] ?? []).length;

  const exitToMenu = () => {
    try { audio.setAmbient(null); } catch {}
    try { audio.stopSpeech(); } catch {}
    // Pause any primed music that might still be playing (quit during prime)
    if (mode.kind === "play") {
      try { mode.primedMusic?.el.pause(); } catch {}
      try { mode.primedNarration?.el.pause(); } catch {}
    }
    setMode({ kind: "menu" });
  };

  return (
    <div
      className="h-full w-full overflow-hidden"
      onPointerDown={() => {
        audio.unlock();
        startMenuMusic();
      }}
    >
      {notice && (
        <div className="pop-in pointer-events-none fixed left-1/2 top-16 z-[95] -translate-x-1/2 border border-gold/60 bg-noir-950/95 px-4 py-2 font-type text-xs text-gold shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          {notice}
        </div>
      )}
      {mode.kind === "play" && (
        <GamePlayer
          story={mode.story}
          typeSpeed={settings.typeSpeed}
          isNewGamePlus={endingsFound(mode.story) > 0}
          resumeSlot={mode.resumeSlot}
          resumeEpisodeId={mode.resumeEpisodeId}
          playFromSceneId={mode.playFromSceneId}
          primedMusic={mode.primedMusic}
          primedNarration={mode.primedNarration}
          onOpenInStudio={(sceneId) =>
            setMode({ kind: "studio", openStoryId: mode.story.id, openSceneId: sceneId })
          }
          onExit={exitToMenu}
        />
      )}

      {mode.kind === "studio" && (
        <Studio
          // allStories, NOT the grid list: `stories` excludes anything
          // promoted to the featured strip, which is a NEWSSTAND-PRESENTATION
          // concern only. Passing the filtered list hid featured cases from
          // Studio entirely — and when every story was featured it arrived
          // empty, so `baseStories[0].id` threw on mount and the featured
          // checkbox had no row left to untick.
          baseStories={allStories}
          initialStoryId={mode.openStoryId}
          initialSceneId={mode.openSceneId}
          onExit={() => setMode({ kind: "menu" })}
          onOpenManual={() => setMode({ kind: "manual" })}
          onPlay={(s, opts) => {
            if (openStudioPlayWindow(s, opts?.fromSceneId)) {
              say("Playtest opened in a new window.");
            } else {
              say("Pop-up blocked or storage full — opening playtest here instead.");
              play(s, undefined, undefined, opts?.fromSceneId);
            }
          }}
          onPublish={(published) => {
            try {
              localStorage.setItem(publishedKey(published.id), JSON.stringify(published));
              setCatalog(loadPublishedCatalog());
              return true;
            } catch {
              return false;
            }
          }}
          onDeleteStory={(id, deleteMedia = false) => {
            const visible = [...STORIES, ...loadCustomStories()].filter((story) => !loadHiddenStories().includes(story.id));
            if (visible.length <= 1) return false;
            try {
              const hidden = new Set(loadHiddenStories());
              hidden.add(id);
              localStorage.setItem(HIDDEN_STORIES_KEY, JSON.stringify([...hidden]));
              localStorage.removeItem(publishedKey(id));
              localStorage.removeItem(draftKey(id));
              const nextCustom = loadCustomStories().filter((story) => story.id !== id);
              if (!saveCustomStories(nextCustom)) return false;
              // Wipe the ending record so the case leaves no trace behind.
              removeStoryEndings(id);
              setCustomStories(nextCustom);
              setHiddenStories([...hidden]);
              setEndings(loadEndings());
              setCatalog(loadPublishedCatalog());
              // Media assets stay in the library unless the author explicitly
              // asked to delete them too.
              if (deleteMedia) {
                deleteStoryAssets(id).catch(() => {});
              }
              return true;
            } catch {
              return false;
            }
          }}
          onCreateStory={(created) => {
            const nextCustom = [...loadCustomStories().filter((story) => story.id !== created.id), created];
            if (!saveCustomStories(nextCustom)) return false;
            setCustomStories(nextCustom);
            setCatalog(loadPublishedCatalog());
            return true;
          }}
          onUpdateTitleTheme={(theme) => {
            localStorage.setItem(GLOBAL_TITLE_THEME_KEY, JSON.stringify(theme));
            setGlobalTitleTheme(theme);
          }}
        />
      )}

      {mode.kind === "manual" && (
        <CreatorManual onExit={() => setMode({ kind: "menu" })} onOpenStudio={() => setMode({ kind: "studio" })} />
      )}

      {mode.kind === "gallery" && (
        <div className="fx-grain relative h-full overflow-y-auto bg-noir-950 p-8">
          <div className="mx-auto max-w-4xl">
            <button
              onClick={() => setMode({ kind: "menu" })}
              className="mb-6 border border-paper/30 px-4 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-paper/70 hover:text-neon"
            >
              ← Back to the newsstand
            </button>
            <h1 className="font-pulp text-4xl uppercase text-gold">Morgue File</h1>
            <p className="font-type mt-1 text-sm text-paper/60">
              Every headline you've earned, clipped and yellowing. Replay cases in New Game+ to collect the rest.
            </p>
            <div className="mt-8 space-y-8">
              {catalog.map((s) => {
                const found = endings[s.id] ?? [];
                const total = endingsTotal(s);
                return (
                  <section key={s.id}>
                    <h2 className="font-pulp text-xl uppercase tracking-wide text-paper">
                      {s.title} <span className="text-sm text-neon">{found.length}/{total} endings</span>
                    </h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {found.map((e) => (
                        <article key={e.sceneId} className="rotate-[-0.4deg] border-4 border-double border-noir-600 bg-paper p-3 text-noir-900">
                          <div className={`inline-block border px-1.5 font-pulp text-[9px] uppercase tracking-widest ${TIER_LABEL[e.tier].cls}`}>
                            {TIER_LABEL[e.tier].text}
                          </div>
                          <h3 className="font-pulp mt-1 text-lg leading-tight">{e.headline}</h3>
                          <div className="font-type mt-1 text-[10px] text-noir-700/70">
                            Filed {new Date(e.unlockedAt).toLocaleDateString()} — The Daily Sentinel
                          </div>
                        </article>
                      ))}
                      {Array.from({ length: Math.max(0, total - found.length) }).map((_, i) => (
                        <article
                          key={i}
                          className="flex min-h-24 items-center justify-center border-2 border-dashed border-noir-600 p-3 text-paper/30"
                        >
                          <span className="font-type text-xs">— headline not yet earned —</span>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {mode.kind === "menu" && (
        <div className="fx-grain fx-halftone fx-vignette relative h-full overflow-y-auto bg-noir-950">
          {/* Custom style block to support custom neon hex code */}
          {resolvedTitleTheme.neonColor && (
            <style>{`
              .neon-flicker-custom {
                color: ${resolvedTitleTheme.neonColor};
                text-shadow: 0 0 6px ${resolvedTitleTheme.neonColor}, 0 0 22px ${resolvedTitleTheme.neonColor}, 0 0 46px ${resolvedTitleTheme.neonColor}b0;
              }
            `}</style>
          )}
          {/* backdrop */}
          <div
            className="absolute inset-0 opacity-25 kenburns-a"
            style={{ backgroundImage: `url(${assetUrl(resolvedTitleTheme.bgImageUrl || "/img/bg-alley.jpg")})`, backgroundSize: "cover", backgroundPosition: "center" }}
            aria-hidden
          />
          <LensFlareLayer
            cinematic={{
              lensFlare: {
                preset: "anamorphic-blue",
                x: 65,
                y: 22,
                intensity: 0.85,
                streakIntensity: 0.95,
                streakWidth: 1.1,
                ghostIntensity: 0.75,
              },
            }}
          />
          <div className="relative z-40 mx-auto flex min-h-full max-w-5xl flex-col px-6 py-10">
            <header className="text-center">
              <div className="font-type text-[9px] uppercase tracking-[0.6em] text-paper/40">
                Headphones recommended
              </div>
              <div className="font-type text-xs uppercase tracking-[0.5em] text-cyan-neon neon-cyan mt-1">
                {resolvedTitleTheme.tagline || "A film in Tokyo rain"}
              </div>
              <h1 className="neon-flicker-custom font-pulp mt-2 text-6xl uppercase md:text-7xl">
                {resolvedTitleTheme.titleText || "Nobody’s Witness"}
              </h1>
              <p className="font-type mx-auto mt-3 max-w-xl text-sm text-paper/70">
                Tokyo as a memory that is still happening. The screenplay, the storyboard and the recorded voices, played as a film.
                Or open the <span className="text-gold">Studio</span> to see how it is built.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  // The hero button should open the FRONT of the stand — the
                  // first featured case if there is one, else the first card.
                  onClick={() => play(featuredStories[0] ?? stories[0] ?? catalog[0])}
                  className="border-2 border-gold bg-gold/15 px-6 py-2.5 font-pulp text-xs uppercase tracking-[0.2em] text-gold shadow-[0_0_20px_rgba(232,178,60,0.3)] hover:bg-gold/25 transition-all hover:scale-105"
                >
                  ▶ Play {(featuredStories[0] ?? stories[0] ?? catalog[0])?.title ?? "a game"}
                </button>
                <button
                  onClick={() => setMode({ kind: "studio" })}
                  className="border-2 border-cyan-neon bg-cyan-neon/15 px-6 py-2.5 font-pulp text-xs uppercase tracking-[0.2em] text-cyan-neon shadow-[0_0_20px_rgba(42,217,217,0.3)] hover:bg-cyan-neon/25 transition-all hover:scale-105"
                >
                  🎬 Open Studio Editor
                </button>
                <button
                  onClick={() => setMode({ kind: "manual" })}
                  className="border border-gold/70 bg-gold/5 px-5 py-2.5 font-pulp text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold/15 transition-all hover:scale-105"
                >
                  📓 Creator Manual
                </button>
              </div>
            </header>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setMixerOpen((o) => !o)}
                className="border border-gold/50 bg-noir-950/80 px-3 py-1 font-pulp text-[10px] uppercase tracking-widest text-gold hover:border-neon hover:text-neon"
                title="Open the game menu"
                aria-expanded={mixerOpen}
              >
                ⚙ Game Menu
              </button>
              <button
                onClick={() => setVerticalRack((v) => !v)}
                className="border border-paper/30 bg-noir-950/70 px-3 py-1 font-pulp text-[10px] uppercase tracking-widest text-paper/70 hover:border-neon hover:text-neon"
                title="Toggle newsstand layout"
              >
                {verticalRack ? "Grid View" : "Magazine Rack"}
              </button>
            </div>

            {/* ★ FEATURED — the front page of the magazine rack. Set in
                Studio → Global Title Page Theme → Featured cases. Ids that no
                longer resolve (hidden or deleted) are dropped rather than
                leaving a gap, and with none set the stand renders exactly as
                it always did. */}
            {featuredStories.length > 0 ? (
              <div className="mt-4 space-y-4">
                {featuredStories.map((s) => {
                  const found = endingsFound(s);
                  const total = endingsTotal(s);
                  return (
                    <div
                      key={`feat-${s.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => play(s)}
                      onKeyDown={(e) => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          play(s);
                        }
                      }}
                      className="group relative cursor-pointer overflow-hidden border-2 border-gold/70 bg-noir-800 text-left shadow-2xl transition-transform hover:-translate-y-1 hover:border-neon focus-visible:border-neon"
                    >
                      <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
                        {s.coverImage.startsWith("gradient:") ? (
                          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={coverStyle(s.coverImage)} />
                        ) : (
                          <img
                            src={assetUrl(s.coverImage)}
                            alt=""
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/40 to-transparent" />
                        <div className="absolute left-3 top-3 border border-gold bg-noir-950/90 px-2.5 py-1 font-pulp text-[10px] uppercase tracking-widest text-gold">
                          ★ Featured
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                          <h2 className="font-pulp text-2xl uppercase leading-none tracking-wide text-paper drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:text-4xl">
                            {s.title}
                          </h2>
                          {s.tagline ? (
                            <p className="mt-1.5 max-w-2xl font-type text-[12px] italic text-paper/80 sm:text-sm">{s.tagline}</p>
                          ) : null}
                          <div className="mt-2 flex items-center gap-3 font-pulp text-[9px] uppercase tracking-widest text-gold/90">
                            <span>▶ Play</span>
                            {total > 0 ? (
                              <span className="text-paper/60">
                                {found}/{total} endings
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className={`mt-4 ${verticalRack ? "space-y-4" : "grid gap-5 md:grid-cols-2 xl:grid-cols-3"}`}>
              {stories.map((s, idx) => {
                const found = endingsFound(s);
                const total = endingsTotal(s);
                return (
                  // Not a <button>: the card contains its own buttons (export,
                  // import, hide, resume) and nesting interactive elements
                  // inside a button is invalid HTML — React errors on it and
                  // the inner file-picker label can misfire. role="button" +
                  // tabIndex keeps the card keyboard-playable.
                  <div
                    key={s.id + idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => play(s)}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        play(s);
                      }
                    }}
                    className={`group relative cursor-pointer overflow-hidden border-2 border-noir-600 bg-noir-800 text-left shadow-2xl transition-transform hover:-translate-y-1 hover:border-neon focus-visible:border-neon ${
                      verticalRack ? "flex w-full flex-col" : ""
                    }`}
                  >
                    <div className={`relative overflow-hidden ${verticalRack ? "h-72 w-full" : "h-44 w-full"}`}>
                      {s.coverImage.startsWith("gradient:") ? (
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" style={coverStyle(s.coverImage)} />
                      ) : (
                        <img
                          src={assetUrl(s.coverImage)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent" />
                      <div className="absolute left-2 top-2 border border-gold/70 bg-noir-950/85 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-gold">
                        {s.id === "nobodys-witness-true"
                          ? "★ Production — True Romance Cut"
                          : s.id === "nobodys-witness"
                          ? "★ Flagship — Graphic Novel"
                          : s.id === "low-midnight"
                          ? "⭐ New — Neon Noir Horror"
                          : s.id === "jungle-juniper"
                          ? "⭐ New — Pulp Prehistoric"
                          : s.id === "war-of-the-worlds"
                          ? "⭐ New — Pulp Adaptation, H.G. Wells"
                          : s.id === "tintin-meridian"
                          ? "⭐ New — Fan Homage, Ligne Claire"
                          : s.id === "pulp-reel"
                          ? "⭐ New — Fan Homage, Original Dialogue"
                          : s.id === "blackwood-ledger"
                          ? "⭐ New — Neon Noir Break-In"
                          : s.id === "pier-four"
                          ? "⭐ New — Under Pier Four"
                          : s.id === "static-marlowe"
                          ? "🎞 Showcase — All Nodes"
                          : s.id === "glass-hour"
                          ? "⭐ Studio-Polished Case"
                          : s.id === "the-thing"
                          ? "⭐ New — Arctic Horror"
                          : s.id === "confession"
                            ? "New — Noir Thriller"
                            : s.id === "last-reel"
                              ? "Mystery Case"
                              : s.id === "velvet-sting"
                                ? "Charm Demo — Gating Test"
                                : "Library Case"}
                      </div>
                      {found > 0 && (
                        <div className="absolute right-2 top-2 border border-neon/70 bg-noir-950/85 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-neon">
                          NG+ ready
                        </div>
                      )}
                      {isEpisodic(s) && (
                        <div className="absolute bottom-2 left-2 border border-crimson/70 bg-noir-950/90 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-crimson">
                          🎞 {seasonEpisodes(s).length}-Part Season
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="font-pulp text-lg uppercase leading-tight text-paper group-hover:text-neon">{s.title}</h2>
                      <p className="font-type mt-1 text-xs italic text-paper/60">{s.tagline}</p>
                      {isEpisodic(s) && (() => {
                        // Season progress strip: one pip per episode, filled as
                        // the player clears them.
                        const eps = seasonEpisodes(s);
                        const cleared = storySeasonProgress(s.id);
                        const done = eps.filter((ep) => cleared[ep.id]).length;
                        return (
                          <div className="mt-2">
                            <div className="flex items-center gap-1" aria-hidden>
                              {eps.map((ep) => (
                                <span
                                  key={ep.id}
                                  title={ep.title}
                                  className={`h-1 flex-1 ${cleared[ep.id] ? "bg-gold" : "bg-paper/15"}`}
                                />
                              ))}
                            </div>
                            <div className="mt-1 font-pulp text-[9px] uppercase tracking-widest text-gold/70">
                              {done}/{eps.length} episodes · {s.seasonTitle ?? "Season One"}
                            </div>
                          </div>
                        );
                      })()}
                      {s.briefing?.objective && (
                        <p className="font-type mt-2 border-l-2 border-cyan-neon/50 pl-2 text-[11px] leading-snug text-paper/70">
                          <span className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">Case objective:</span> {s.briefing.objective}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-paper/40">
                          {s.scenes.length} scenes · {total} endings ({found} found)
                        </span>
                        <div className="flex items-center gap-1 text-[9px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInfoStory(s);
                            }}
                            className="border border-cyan-neon/40 px-1.5 py-0.5 font-pulp text-cyan-neon hover:bg-cyan-neon/10"
                            title={`About ${s.title}`}
                            aria-label={`Info about ${s.title}`}
                          >
                            ⓘ Info
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const bundle = await createPortableStoryBundle(s);
                                await downloadReel({ ...bundle.story, assets: bundle.assets }, `${s.id}.reel.json`);
                                if (bundle.missing.length) say(`Export warning: ${bundle.missing.length} media reference(s) could not be bundled.`);
                              } catch {
                                say("Failed to bundle media assets.");
                              }
                            }}
                            className="border border-emerald-500/30 px-1.5 py-0.5 font-pulp text-emerald-400 hover:bg-emerald-500/10"
                            title="Export case with all referenced audio, video, sprites and images bundled"
                          >
                            ⤓
                          </button>
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="border border-emerald-500/30 px-1.5 py-0.5 font-pulp text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                            title="Import single case (restores custom assets)"
                          >
                            ⤒
                            <input
                              type="file"
                              accept=".screel,.json,.reel.json"
                              className="hidden"
                              onChange={async (e) => {
                                e.stopPropagation();
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (!file) return;
                                try {
                                  const bytes = new Uint8Array(await file.arrayBuffer());
                                  const parsed = parseCaseBytes(bytes, file.name);
                                  if (!parsed.story.id || !parsed.story.scenes?.length) throw new Error("bad");
                                  if (parsed.assets.length > 0) {
                                    await importStoryAssets(parsed.story.id, parsed.assets);
                                  }
                                  const compacted = await compactStoryMedia(parsed.story);
                                  localStorage.setItem(`scarlet-reel-published-${compacted.id}`, JSON.stringify(compacted));
                                  setCatalog(loadPublishedCatalog());
                                  say(`Imported "${compacted.title}" with ${parsed.assets.length} media asset(s).`);
                                } catch {
                                  say("Invalid case file or broken bundle.");
                                }
                              }}
                            />
                          </label>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Counted across the WHOLE stand (featured cases
                              // included), or hiding down to one featured card
                              // would be wrongly blocked/allowed.
                              if (allStories.length <= 1) {
                                say("At least one playable case must remain on the newsstand.");
                                return;
                              }
                              if (!confirm(`Hide "${s.title}" from the newsstand? You can restore it later.`)) return;
                              const hidden = new Set(loadHiddenStories());
                              hidden.add(s.id);
                              localStorage.setItem(HIDDEN_STORIES_KEY, JSON.stringify([...hidden]));
                              setHiddenStories([...hidden]);
                              setCatalog(loadPublishedCatalog());
                            }}
                            className="border border-crimson/40 px-1.5 py-0.5 font-pulp text-crimson hover:bg-crimson/10"
                            title="Hide case from newsstand"
                          >
                            ✕
                          </button>
                          {(() => {
                            // Episodic seasons keep save slots per episode, so
                            // "Resume" has to look across the whole season for
                            // the newest one rather than only slot 1.
                            const newest = latestSave(s);
                            return newest ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  play(s, newest.slot, newest.episodeId);
                                }}
                                className="border border-gold/60 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/15"
                                title={`Resume: ${newest.save.sceneTitle}`}
                              >
                                ▶ Resume
                              </button>
                            ) : null;
                          })()}
                          <span className="font-pulp text-[10px] uppercase tracking-widest text-gold group-hover:translate-x-1 transition-transform">
                            Play ▸
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {infoStory && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="case-info-title"
                onClick={() => setInfoStory(null)}
              >
                <section
                  className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto border-2 border-cyan-neon/60 bg-noir-950 p-6 shadow-[0_0_45px_rgba(42,217,217,0.18)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setInfoStory(null)}
                    className="absolute right-3 top-3 border border-paper/30 px-2 py-1 font-pulp text-[10px] text-paper/60 hover:border-crimson hover:text-crimson"
                    aria-label="Close case info"
                  >
                    ✕
                  </button>
                  <div className="font-pulp text-[9px] uppercase tracking-[0.35em] text-cyan-neon">Case File · Game Info</div>
                  <h2 id="case-info-title" className="mt-2 pr-10 font-pulp text-2xl uppercase text-paper">{infoStory.title}</h2>
                  <p className="mt-1 font-type text-sm italic text-gold/80">{infoStory.tagline}</p>
                  <div className="mt-5 border-l-2 border-cyan-neon/60 pl-4 font-type text-sm leading-relaxed whitespace-pre-wrap text-paper/80">
                    {infoStory.briefing?.gameInfo?.trim() || infoStory.briefing?.objective || "No synopsis has been filed for this case yet."}
                  </div>
                  {infoStory.briefing?.objective && (
                    <div className="mt-5 border border-noir-600 bg-noir-900/70 p-3">
                      <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">Objective</div>
                      <p className="mt-1 font-type text-xs leading-relaxed text-paper/65">{infoStory.briefing.objective}</p>
                    </div>
                  )}
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => setInfoStory(null)}
                      className="border border-paper/30 px-4 py-2 font-pulp text-[10px] uppercase tracking-widest text-paper/65 hover:border-paper"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        const selected = infoStory;
                        setInfoStory(null);
                        play(selected);
                      }}
                      className="border-2 border-gold bg-gold/10 px-5 py-2 font-pulp text-[10px] uppercase tracking-widest text-gold hover:bg-gold/20"
                    >
                      ▶ Play Case
                    </button>
                  </div>
                </section>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setMode({ kind: "studio" })}
                className="border-2 border-gold bg-gold/10 px-6 py-3 font-pulp text-sm uppercase tracking-[0.2em] text-gold hover:bg-gold/20"
              >
                🎬 Studio Mode — build your own reel
              </button>
              <button
                onClick={() => setMode({ kind: "gallery" })}
                className="border-2 border-paper/30 px-6 py-3 font-pulp text-sm uppercase tracking-[0.2em] text-paper/80 hover:border-cyan-neon hover:text-cyan-neon"
              >
                🗞 Morgue File — ending gallery
              </button>
              <button
                onClick={() => setMode({ kind: "manual" })}
                className="border-2 border-cyan-neon/45 px-6 py-3 font-pulp text-sm uppercase tracking-[0.2em] text-cyan-neon hover:bg-cyan-neon/10"
              >
                📓 Creator Manual — Studio guide
              </button>
              {/* Import / Export for the entire catalog */}
              <button
                onClick={async () => {
                  // Library backup: keep uploaded rows, but avoid pulling every built-in
                  // file into one potentially enormous JSON. Per-case Export is portable.
                  try {
                    const bundles: Story[] = [];
                    for (const s of catalog) {
                      const caseAssets = await loadStoryAssetsForExport(s);
                      bundles.push({ ...s, assets: caseAssets });
                    }
                    await downloadReel(bundles, "scarlet-reel-cases.reel.json");
                  } catch {
                    say("Failed to bundle media assets for all cases.");
                  }
                }}
                className="border-2 border-emerald-500/40 px-4 py-3 font-pulp text-xs uppercase tracking-[0.16em] text-emerald-400 hover:bg-emerald-500/10"
                title="Back up the catalog and uploaded media. Built-in file paths stay external; use a case’s Export button for a portable copy."
              >
                ⤓ Export all
              </button>
              <label className="flex items-center justify-center cursor-pointer border-2 border-emerald-500/40 px-4 py-3 font-pulp text-xs uppercase tracking-[0.16em] text-emerald-400 hover:bg-emerald-500/10" title="Import single or multiple cases">
                ⤒ Import
                <input
                  type="file"
                  accept=".screel,.json,.reel.json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      const bytes = new Uint8Array(await file.arrayBuffer());
                      let incoming: Story[] = [];
                      let assetCount = 0;
                      try {
                        const one = parseCaseBytes(bytes, file.name);
                        incoming = [one.story];
                        if (one.assets.length) {
                          await importStoryAssets(one.story.id, one.assets);
                          assetCount += one.assets.length;
                        }
                        const compacted = await compactStoryMedia(one.story);
                        localStorage.setItem(`scarlet-reel-published-${compacted.id}`, JSON.stringify(compacted));
                        localStorage.removeItem(`scarlet-studio-draft-${compacted.id}`);
                      } catch {
                        // Catalogue dumps are a JSON array of stories, not a single case.
                        const parsed = JSON.parse(new TextDecoder().decode(bytes));
                        incoming = Array.isArray(parsed) ? parsed : [parsed];
                        for (const s of incoming) {
                          if (!s.id || !s.scenes?.length) continue;
                          if (Array.isArray(s.assets) && s.assets.length > 0) {
                            await importStoryAssets(s.id, s.assets);
                            assetCount += s.assets.length;
                          }
                          const { assets, ...cleanedStory } = s;
                          const compacted = await compactStoryMedia(cleanedStory);
                          localStorage.setItem(`scarlet-reel-published-${compacted.id}`, JSON.stringify(compacted));
                          localStorage.removeItem(`scarlet-studio-draft-${compacted.id}`);
                        }
                      }
                      setCatalog(loadPublishedCatalog());
                      say(`Imported ${incoming.length} case(s) with ${assetCount} media asset(s).`);
                    } catch {
                      say("Invalid case file or broken bundle.");
                    }
                  }}
                />
              </label>

              {hiddenStories.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.setItem(HIDDEN_STORIES_KEY, "[]");
                    setHiddenStories([]);
                    setCatalog(loadPublishedCatalog());
                  }}
                  className="border-2 border-paper/20 px-4 py-3 font-pulp text-xs uppercase tracking-[0.16em] text-paper/55 hover:border-gold hover:text-gold"
                >
                  Restore {hiddenStories.length} hidden case{hiddenStories.length === 1 ? "" : "s"}
                </button>
              )}
            </div>

            {mixerOpen && (
              <div className="pop-in fixed left-1/2 top-4 z-[90] max-h-[calc(100vh-2rem)] w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto border-2 border-gold/50 bg-noir-950/98 p-4 shadow-[0_0_60px_rgba(0,0,0,0.85)] backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3 border-b border-noir-600 pb-2">
                  <div>
                    <h3 className="font-pulp text-sm uppercase tracking-widest text-gold">⚙ Game Menu</h3>
                    <p className="font-type mt-0.5 text-[10px] text-paper/45">Sound, display and desktop controls. Saves and Resume Game are not affected.</p>
                  </div>
                  <button
                    onClick={() => setMixerOpen(false)}
                    className="border border-paper/20 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/60 hover:border-neon hover:text-neon"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <section>
                    <h4 className="font-pulp text-[11px] uppercase tracking-widest text-cyan-neon">🎚 Sound Options</h4>
                    {(Object.keys(settings.volumes) as MixChannel[]).map((ch) => (
                      <label key={ch} className="mt-2 flex items-center gap-3 text-[11px] uppercase tracking-wider text-paper/60">
                        <span className="w-16">{ch}</span>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={settings.volumes[ch]}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, volumes: { ...s.volumes, [ch]: Number(e.target.value) } }))
                          }
                          className="flex-1 accent-pink-500"
                        />
                        <span className="w-8 text-right">{Math.round(settings.volumes[ch] * 100)}</span>
                      </label>
                    ))}
                    <div className="mt-3 border-t border-noir-600 pt-3">
                      <label className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-paper/60">
                        <span className="w-28">Typewriter speed</span>
                        <select
                          className="flex-1 border border-noir-600 bg-noir-800 px-2 py-1 text-xs text-paper"
                          value={settings.typeSpeed}
                          onChange={(e) => setSettings((s) => ({ ...s, typeSpeed: Number(e.target.value) }))}
                        >
                          <option value={45}>Slow burn</option>
                          <option value={22}>House style</option>
                          <option value={10}>Deadline mode</option>
                        </select>
                      </label>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-pulp text-[11px] uppercase tracking-widest text-cyan-neon">🖥 Display</h4>
                    <label className="mt-2 block text-[10px] uppercase tracking-wider text-paper/55">
                      Screen resolution / window size
                      <select
                        value={resolutionValue}
                        onChange={(e) => void applyResolution(e.target.value)}
                        className="mt-1 w-full border border-noir-600 bg-noir-800 px-2 py-2 font-type text-xs text-paper"
                      >
                        <option value="1440x900">1440 × 900 — Default</option>
                        {WINDOW_RESOLUTIONS.map((res) => (
                          <option key={`${res.width}x${res.height}`} value={`${res.width}x${res.height}`}>
                            {res.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => void setFullscreenMode(true)}
                        className={`border px-3 py-2 font-pulp text-[10px] uppercase tracking-widest ${fullscreenOn ? "border-gold bg-gold/15 text-gold" : "border-paper/30 text-paper/70 hover:border-gold hover:text-gold"}`}
                      >
                        ⛶ Fullscreen
                      </button>
                      <button
                        onClick={() => void setFullscreenMode(false)}
                        className={`border px-3 py-2 font-pulp text-[10px] uppercase tracking-widest ${!fullscreenOn ? "border-gold bg-gold/15 text-gold" : "border-paper/30 text-paper/70 hover:border-gold hover:text-gold"}`}
                      >
                        ▣ Windowed
                      </button>
                    </div>
                    <p className="mt-2 font-type text-[10px] leading-relaxed text-paper/40">
                      Desktop builds apply window sizes directly. Browsers may block resizing; fullscreen still works after a click.
                      Shortcut: F11, or Ctrl+Cmd+F on macOS.
                    </p>

                    <div className="mt-4 border-t border-noir-600 pt-3">
                      <h4 className="font-pulp text-[11px] uppercase tracking-widest text-crimson">Quit</h4>
                      <button
                        onClick={() => void quitGame()}
                        className="mt-2 w-full border-2 border-crimson/60 bg-crimson/10 py-2 font-pulp text-[10px] uppercase tracking-widest text-crimson hover:bg-crimson/20"
                      >
                        ✕ Quit Game
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            )}

            <footer className="mt-auto pt-10 text-center font-type text-[10px] text-paper/30">
              Keyboard: 1-9 / ↑↓ / WASD choices · Space advance · B corkboard · Esc quit · Ctrl+Z undo (Studio) — all vice
              strictly implied, never shown.
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
