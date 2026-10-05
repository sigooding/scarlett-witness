import { useEffect, useRef, useState } from "react";
import type { Hotspot, QuakeModeSettings } from "../../types";
import type { FpsSnapshot } from "./types";
import { FpsWorld, clamp, tileAt } from "./simulation";
import { FpsRenderer } from "./renderer";
import { FpsAudio } from "./audio";
import { validateFpsRoom } from "./validate";
import { ClassicHud, NuclearMark } from "./ClassicHud";
import { QuakeHud } from "./QuakeHud";
import { inventoryActive } from "./inventory";
import "./fps.css";

interface Props {
  quake: QuakeModeSettings;
  title?: string;
  preview?: boolean;
  active?: boolean;
  soundOn?: boolean;
  initialSnapshot?: FpsSnapshot;
  onSnapshot?: (snapshot: FpsSnapshot) => void;
  hotspots?: Hotspot[];
  onInteract?: (hotspot: Hotspot) => void;
  unlocked?: (hotspot: Hotspot) => boolean;
  onMenu?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onToggleSound?: () => void;
}
export function FpsStage(props: Props) {
  const { quake } = props;
  const classic = quake.fps?.presentation === "classic";
  const quakeStyle = quake.fps?.presentation === "quake";
  const mount = useRef<HTMLDivElement>(null),
    root = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const world = useRef<FpsWorld | null>(null),
    renderer = useRef<FpsRenderer | null>(null);
  const keys = useRef(new Set<string>()),
    audio = useRef<FpsAudio | null>(null);
  const running = useRef(false),
    fresh = useRef(false);
  const pulses = useRef(new Set<string>());
  const [started, setStarted] = useState(false),
    [paused, setPaused] = useState(false),
    [showMap, setShowMap] = useState(false);
  const [restart, setRestart] = useState(0),
    [error, setError] = useState("");
  const [notice, setNotice] = useState(""),
    [snapshot, setSnapshot] = useState<FpsSnapshot | null>(null);
  const [near, setNear] = useState(""),
    [loaded, setLoaded] = useState(false);
  const ui = useRef({ started, paused });
  ui.current = { started, paused };
  running.current =
    started &&
    !paused &&
    props.active !== false &&
    !error &&
    (snapshot?.player.health ?? 1) > 0;
  useEffect(() => {
    if (started && !paused && (snapshot?.player.health ?? 1) > 0 && !error)
      return;
    if (!loaded && !error) return;
    root.current
      ?.querySelector<HTMLButtonElement>(".fps-overlay button:not(:disabled)")
      ?.focus();
  }, [started, paused, loaded, error, snapshot?.player.health]);
  const pause = () => {
    keys.current.clear();
    setPaused(true);
    if (document.pointerLockElement) document.exitPointerLock();
  };
  const begin = () => {
    audio.current?.unlock();
    keys.current.clear();
    setStarted(true);
    setPaused(false);
    root.current?.focus();
    if (world.current && world.current.state.time < 0.1 && quake.fps?.intro)
      world.current.events.push({ type: "message", text: quake.fps.intro });
  };
  const restartLevel = () => {
    fresh.current = true;
    keys.current.clear();
    setRestart((n) => n + 1);
    setPaused(false);
    setStarted(true);
  };

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const invalid = validateFpsRoom(quake, latest.current.hotspots).filter(
      (i) => i.severity === "error",
    );
    if (invalid.length) {
      setError(
        `Fix these settings in Studio Check: ${invalid.map((i) => i.message).join(" ")}`,
      );
      return;
    }
    let w: FpsWorld, view: FpsRenderer;
    try {
      w = new FpsWorld(
        quake,
        fresh.current ? undefined : latest.current.initialSnapshot,
        (id) => {
          const hs = latest.current.hotspots?.find((h) => h.id === id);
          return !!hs && (latest.current.unlocked?.(hs) ?? true);
        },
      );
      fresh.current = false;
      view = new FpsRenderer(el, w);
    } catch (e) {
      setError(`This first-person level needs WebGL 2. ${String(e)}`);
      return;
    }
    world.current = w;
    renderer.current = view;
    audio.current = new FpsAudio();
    setError("");
    setLoaded(false);
    setSnapshot(w.snapshot());
    setNotice(quake.fps?.objective ?? "");
    let raf = 0,
      last = performance.now(),
      uiAt = 0,
      saveAt = 0,
      noticeUntil = 7;
    let touch: { id: number; x: number; y: number } | null = null;
    let mouseDrag: { x: number; y: number } | null = null;
    const clear = () => {
      keys.current.clear();
      pulses.current.clear();
      touch = null;
      mouseDrag = null;
    };
    const focusedInput = (e: Event) =>
      e.target instanceof HTMLElement &&
      (e.target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
    const handled = new Set([
      "w",
      "a",
      "s",
      "d",
      "c",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "q",
      "e",
      "f",
      "r",
      " ",
      "shift",
      "control",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "tab",
      "escape", "j", "n", "b", "m", "h", "g", "[", "]", "enter", "`", "0",
    ]);
    const down = (e: KeyboardEvent) => {
      if (latest.current.active === false || focusedInput(e)) return;
      const key = e.key.toLowerCase();
      if (!handled.has(key)) return;
      if (key === "escape" && latest.current.preview) {
        e.preventDefault();
        e.stopImmediatePropagation();
        latest.current.onMenu?.();
        return;
      }
      if (key === "escape" && ui.current.started) {
        e.preventDefault();
        e.stopImmediatePropagation();
        clear();
        setPaused((v) => !v);
        if (document.pointerLockElement === view.canvas)
          document.exitPointerLock();
        return;
      }
      if (!running.current) return; // Dialogs own Tab / Enter, not the movement controls.
      e.preventDefault();
      e.stopImmediatePropagation();
      if (key === "tab") {
        if (!e.repeat) setShowMap((v) => !v);
        return;
      }
      keys.current.add(key);
      if (!e.repeat) pulses.current.add(key);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const mouseDown = (e: MouseEvent) => {
      if (!running.current) return;
      if (e.button === 2) {
        mouseDrag = { x: e.clientX, y: e.clientY };
        return;
      }
      if (e.button !== 0) return;
      audio.current?.unlock();
      keys.current.add("fire");
      pulses.current.add("fire");
      if (
        quake.mouseLook !== false &&
        document.pointerLockElement !== view.canvas
      ) {
        try {
          const result = view.canvas.requestPointerLock();
          if (result)
            void result.catch(() => {
              setNotice(
                "Mouse capture unavailable here. Use arrow keys to aim, or swipe the view.",
              );
              noticeUntil = w.state.time + 5;
            });
        } catch {
          setNotice("Use arrow keys to aim; F fires and E operates doors.");
        }
      }
    };
    const mouseUp = () => {
      keys.current.delete("fire");
      mouseDrag = null;
    };
    const move = (e: MouseEvent) => {
      if (!running.current) return;
      if (document.pointerLockElement === view.canvas) {
        w.state.player.yaw -= e.movementX * 0.0028;
        w.state.player.pitch = clamp(
          w.state.player.pitch - e.movementY * 0.0028,
          -0.85,
          0.85,
        );
      } else if (mouseDrag) {
        w.state.player.yaw -= (e.clientX - mouseDrag.x) * 0.0028;
        w.state.player.pitch = clamp(
          w.state.player.pitch - (e.clientY - mouseDrag.y) * 0.0028,
          -0.85,
          0.85,
        );
        mouseDrag = { x: e.clientX, y: e.clientY };
      }
    };
    const touchDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" && running.current) {
        e.preventDefault();
        touch = { id: e.pointerId, x: e.clientX, y: e.clientY };
        view.canvas.setPointerCapture(e.pointerId);
      }
    };
    const touchMove = (e: PointerEvent) => {
      if (!touch || touch.id !== e.pointerId || !running.current) return;
      w.state.player.yaw -= (e.clientX - touch.x) * 0.006;
      w.state.player.pitch = clamp(
        w.state.player.pitch - (e.clientY - touch.y) * 0.004,
        -0.85,
        0.85,
      );
      touch.x = e.clientX;
      touch.y = e.clientY;
    };
    const touchUp = () => {
      touch = null;
    };
    const context = (e: Event) => e.preventDefault();
    const hide = () => {
      if (document.hidden) {
        clear();
        setPaused(true);
      }
    };
    window.addEventListener("keydown", down, true);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", hide);
    view.canvas.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    document.addEventListener("mousemove", move);
    view.canvas.addEventListener("contextmenu", context);
    view.canvas.addEventListener("pointerdown", touchDown);
    view.canvas.addEventListener("pointermove", touchMove);
    view.canvas.addEventListener("pointerup", touchUp);
    view.canvas.addEventListener("pointercancel", touchUp);
    const frame = (now: number) => {
      const dt = Math.min(0.15, (now - last) / 1000);
      last = now;
      if (running.current) {
        // Catch up in bounded physics steps when software WebGL renders slowly.
        for (let remaining = dt; remaining > 0; remaining -= 0.05) {
          const k = new Set([...keys.current, ...pulses.current]);
          w.tick(Math.min(0.05, remaining), {
            forward:
              +(k.has("w") || k.has("arrowup")) -
              +(k.has("s") || k.has("arrowdown")),
            right: +k.has("d") - +k.has("a"),
            turn: +(k.has("arrowleft") || k.has("q")) - +k.has("arrowright"),
            jump: k.has(" "),
            crouch: k.has("control") || k.has("c"),
            run: k.has("shift"),
            fire: k.has("f") || k.has("fire"),
            use: k.has("e"),
            reload: k.has("r"),
            weapon: w.config.weapons.find((weapon, i) => k.has(String(weapon.slot ?? i + 1)))?.id,
            inventory: k.has("j") ? "jetpack" : k.has("n") ? "nightvision" :
              k.has("b") ? (w.config.presentation === "quake" ? "biosuit" : "steroids") :
              k.has("m") ? "medkit" : k.has("h") ? "holoduke" : undefined,
            useInventory: k.has("enter"),
            cycleInventory: k.has("]") ? 1 : k.has("[") ? -1 : 0,
            throwBomb: k.has("6") && w.config.presentation === "classic",
            detonate: k.has("g"),
            quickKick: k.has("`") || (k.has("1") && w.config.presentation === "classic"),
          });
          pulses.current.clear();
        }
      } else clear();
      const events = w.events.splice(0);
      for (const event of events) {
        view.effect(event);
        if (latest.current.soundOn !== false) audio.current?.play(event);
        if (event.text) {
          setNotice(event.text);
          noticeUntil = w.state.time + 4;
        }
        if (event.type === "exit" || event.type === "interact") {
          const hs = latest.current.hotspots?.find((h) => h.id === event.id);
          latest.current.onSnapshot?.(w.snapshot());
          if (hs && (latest.current.unlocked?.(hs) ?? true)) {
            clear();
            latest.current.onInteract?.(hs);
          } else {
            setNotice(
              hs
                ? "That interaction is locked by the story."
                : "Connect this exit sprite to a Go to scene hotspot in Studio.",
            );
            noticeUntil = w.state.time + 4;
          }
        }
      }
      if (w.state.time > noticeUntil) setNotice("");
      view.draw();
      if (root.current) {
        // Observation-only hooks: browser tests still move and shoot with real inputs.
        const d = root.current.dataset,
          p = w.state.player;
        d.fpsX = p.x.toFixed(3);
        d.fpsY = p.y.toFixed(3);
        d.fpsZ = p.z.toFixed(3);
        d.fpsYaw = p.yaw.toFixed(4);
        d.fpsPitch = p.pitch.toFixed(4);
        d.fpsCrouched = p.crouched ? "1" : "0";
        d.fpsTime = w.state.time.toFixed(3);
        d.fpsEquipment = JSON.stringify({ selected: p.inventorySelected, active: p.activeInventory, amounts: p.inventoryAmounts });
        d.fpsBombs = String(w.state.pipebombs?.length ?? 0);
        d.fpsActors = JSON.stringify(
          w.state.actors.map((a) => ({
            id: a.id,
            x: a.x,
            y: a.y,
            z: a.z,
            hp: a.hp,
            hidden: a.hidden,
            height: (w.definitions.get(w.placements.get(a.id)!.sprite)?.height ?? 1.8) * (w.placements.get(a.id)?.scale ?? 1),
          })),
        );
        d.fpsDoors = JSON.stringify(w.state.doors);
        d.fpsRemoved = w.state.actors
          .filter((a) => a.hidden || a.hp <= 0)
          .map((a) => a.id)
          .join(",");
      }
      if (now - uiAt > 100) {
        setSnapshot(w.snapshot());
        setNear(w.nearby()?.name ?? "");
        setLoaded(view.pending === 0);
        if (view.errors.length)
          setError(`Missing first-person artwork: ${view.errors.join("; ")}`);
        uiAt = now;
      }
      if (now - saveAt > 700 || events.length) {
        latest.current.onSnapshot?.(w.snapshot());
        saveAt = now;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      clear();
      latest.current.onSnapshot?.(w.snapshot());
      window.removeEventListener("keydown", down, true);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("mousemove", move);
      view.canvas.removeEventListener("mousedown", mouseDown);
      view.canvas.removeEventListener("contextmenu", context);
      view.canvas.removeEventListener("pointerdown", touchDown);
      view.canvas.removeEventListener("pointermove", touchMove);
      view.canvas.removeEventListener("pointerup", touchUp);
      view.canvas.removeEventListener("pointercancel", touchUp);
      if (document.pointerLockElement === view.canvas)
        document.exitPointerLock();
      view.dispose();
      audio.current?.dispose();
      world.current = null;
      renderer.current = null;
    };
    // Room identity/restart rebuilds the world; callbacks and UI state are read through refs.
  }, [quake, restart]);

  useEffect(() => {
    if (props.active === false) {
      keys.current.clear();
      if (document.pointerLockElement) document.exitPointerLock();
    }
  }, [props.active]);
  const p = snapshot?.player;
  const held = (label: string, key: string, glyph: string) => (
    <button
      key={key}
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        if (!running.current) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        audio.current?.unlock();
        keys.current.add(key);
        pulses.current.add(key);
      }}
      onPointerUp={() => keys.current.delete(key)}
      onPointerCancel={() => keys.current.delete(key)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          keys.current.add(key);
          pulses.current.add(key);
        }
      }}
      onKeyUp={() => keys.current.delete(key)}
      onClick={(e) => {
        if (e.detail === 0 && running.current) pulses.current.add(key);
      }}
    >
      {glyph}
    </button>
  );
  return (
    <div
      ref={root}
      className={`fps-root${classic ? " fps-classic" : ""}${quakeStyle ? " fps-quake" : ""}`}
      data-fps-stage
      data-fps-ready={loaded && !error ? "1" : "0"}
      data-fps-running={running.current ? "1" : "0"}
      tabIndex={-1}
    >
      <div className="fps-view" ref={mount} />
      {p && inventoryActive(p, "nightvision") && <div className="fps-nightvision" aria-hidden="true" />}
      {p && p.health > 0 && started && (
        <div className="fps-crosshair" aria-hidden>
          +
        </div>
      )}
      {p && snapshot && snapshot.time - p.hurtAt < 0.15 && (
        <div className="fps-hurt" aria-hidden />
      )}
      <div className="fps-topline">
        <span>{props.title ?? "FIRST-PERSON"}</span>
        <div>
          {props.onToggleSound && (
            <button
              onClick={props.onToggleSound}
              aria-label="Toggle first-person sound"
            >
              {props.soundOn === false ? "SOUND OFF" : "SOUND ON"}
            </button>
          )}
          <button onClick={() => setShowMap((v) => !v)}>MAP · TAB</button>
          <button onClick={pause}>PAUSE · ESC</button>
        </div>
      </div>
      {notice && started && !paused && (
        <div className="fps-notice" role="status">
          {notice}
        </div>
      )}
      {near && started && !paused && <div className="fps-use">E · {near}</div>}
      {showMap && snapshot && (
        <div className="fps-automap">
          <h3>AUTOMAP</h3>
          <svg
            viewBox={`0 0 ${Math.max(...quake.map.map((r) => r.length))} ${quake.map.length}`}
            role="img"
            aria-label="Level automap"
          >
            {classic ? quake.map.flatMap((row, z) => [...row].flatMap((_, x) => {
              const tile = tileAt(quake, x, z);
              if (tile.solid) return [];
              return [[0, -1, x, z, x + 1, z], [1, 0, x + 1, z, x + 1, z + 1],
                [0, 1, x, z + 1, x + 1, z + 1], [-1, 0, x, z, x, z + 1]].flatMap(([dx, dz, x1, z1, x2, z2]) => {
                const other = tileAt(quake, x + dx, z + dz);
                return other.solid || other.floor !== tile.floor ? [<line key={`${x}-${z}-${dx}-${dz}`}
                  x1={x1} y1={z1} x2={x2} y2={z2} stroke={other.solid ? "#9a4861" : "#634830"} strokeWidth={0.14} />] : [];
              });
            })) : quake.map.flatMap((row, z) =>
              [...row].map((_, x) => (
                <rect
                  key={`${x}-${z}`}
                  x={x}
                  y={z}
                  width={1}
                  height={1}
                  fill={
                    tileAt(quake, x, z).solid
                      ? "#2b3338"
                      : (tileAt(quake, x, z).floor ?? 0) > 0
                        ? "#b48750"
                        : "#657e83"
                  }
                />
              )),
            )}
            <circle
              cx={snapshot.player.x}
              cy={snapshot.player.z}
              r={0.45}
              fill="#ffef83"
            />
            <line
              x1={snapshot.player.x}
              y1={snapshot.player.z}
              x2={snapshot.player.x - Math.sin(snapshot.player.yaw) * 1.8}
              y2={snapshot.player.z - Math.cos(snapshot.player.yaw) * 1.8}
              stroke="#fff6ab"
              strokeWidth={0.2}
            />
          </svg>
          {classic && <p className="fps-map-stats">E1L1 · {Math.floor(snapshot.time / 60)}:{String(Math.floor(snapshot.time % 60)).padStart(2, "0")}<br />
            KILLS {snapshot.kills}/{quake.fps?.entities.filter((e) => quake.fps?.sprites.find((s) => s.id === e.sprite)?.kind === "enemy").length}
            {" · "}SECRETS {snapshot.secrets.length}/8</p>}
        </div>
      )}
      {started && !paused && (classic || quakeStyle) && <div className="fps-touch-loadout" aria-label="Touch weapon selection">
        {classic && held("Quick kick", "1", "KICK")}
        {quake.fps?.weapons.filter((w) => p?.weapons.includes(w.id)).map((w) => held(`Select ${w.name} on touch`, String(w.slot), w.name))}
        {classic && !!p?.inventory?.includes("pipebombs") && held("Throw pipe bomb", "6", "BOMB")}
        {quakeStyle && !!p?.inventory?.includes("biosuit") && held("Use biosuit", "b", "SUIT")}
      </div>}
      {started && !paused && (
        <div className="fps-touch">
          <div>
            {held("Turn left", "arrowleft", "↶")}
            {held("Move forward", "w", "↑")}
            {held("Turn right", "arrowright", "↷")}
            {held("Strafe left", "a", "←")}
            {held("Move backward", "s", "↓")}
            {held("Strafe right", "d", "→")}
          </div>
          <div>
            {held("Fire weapon", "f", "FIRE")}
            {held("Use nearby object", "e", "USE")}
            {held("Jump", " ", "JUMP")}
            {held("Crouch or descend", "c", "DUCK")}
            {classic && held("Detonate pipe bombs", "g", "DETONATE")}
          </div>
        </div>
      )}
      {classic && quake.fps ? <ClassicHud config={quake.fps} snapshot={snapshot}
        onCycle={(direction) => { if (running.current) pulses.current.add(direction > 0 ? "]" : "["); }}
        onUse={() => { if (running.current) pulses.current.add("enter"); }}
        onWeapon={(id) => {
          if (!running.current) return;
          const weapon = quake.fps!.weapons.find((w) => w.id === id);
          pulses.current.add(String(weapon?.slot ?? 6));
        }} /> : quakeStyle && quake.fps ? <QuakeHud config={quake.fps} snapshot={snapshot}
        onWeapon={(id) => {
          if (!running.current) return;
          const weapon = quake.fps!.weapons.find((w) => w.id === id);
          pulses.current.add(String(weapon?.slot ?? 1));
        }}
        onUseInventory={(id) => {
          if (!running.current) return;
          pulses.current.add("b");
          world.current?.tick(0, { inventory: id });
        }} /> : <footer className="fps-hud" aria-label="First-person status">
        <div>
          <small>HEALTH</small>
          <strong data-fps-health>{Math.ceil(p?.health ?? 100)}</strong>
        </div>
        <div>
          <small>ARMOR</small>
          <strong>{Math.ceil(p?.armor ?? 0)}</strong>
        </div>
        <div>
          <small>{p?.weapon?.toUpperCase() ?? "AMMO"}</small>
          <strong data-fps-ammo>{p?.ammo[p.weapon] ?? 0}</strong>
        </div>
        <div className="fps-hud-gear">
          <span>
            KEYS{" "}
            <b>
              {p?.keys.length
                ? p.keys.map((k) => k.toUpperCase()).join(" · ")
                : "—"}
            </b>
          </span>
          {!!p?.inventory?.length && (
            <span>
              INV{" "}
              <b data-fps-inventory>
                {p.inventory.map((k) => k.toUpperCase()).join(" · ")}
              </b>
            </span>
          )}
          <span>
            KILLS <b data-fps-kills>{snapshot?.kills ?? 0}</b> /{" "}
            {
              quake.fps?.entities.filter(
                (e) =>
                  quake.fps?.sprites.find((s) => s.id === e.sprite)?.kind ===
                  "enemy",
              ).length
            }
          </span>
          <span>
            SECRETS <b>{snapshot?.secrets.length ?? 0}</b>
          </span>
        </div>
        <div className="fps-hud-help">
          WASD MOVE · ← → AIM · F FIRE
          <br />E USE · SPACE JUMP · SHIFT RUN
          <br />
          1/2 WEAPONS · R RELOAD
        </div>
      </footer>}
      {(!started || paused || (p && p.health <= 0) || error) && (
        <div className="fps-overlay">
          <section
            role="dialog"
            aria-modal="true"
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              const buttons = [
                ...e.currentTarget.querySelectorAll<HTMLButtonElement>(
                  "button:not(:disabled)",
                ),
              ];
              const first = buttons[0],
                last = buttons[buttons.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              }
              if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }}
            aria-label={
              error
                ? "First-person unavailable"
                : p && p.health <= 0
                  ? "You were defeated"
                  : paused
                    ? "First-person paused"
                    : "Enter first-person level"
            }
          >
            {quakeStyle && !paused && !error && <div className="fps-wordmark fps-quake-wordmark" aria-label={quake.fps?.menuWordmark ?? "Quake"}>
              <span>{quake.fps?.menuWordmark ?? "QUAKE"}</span>
            </div>}
            {classic && !paused && !error && <div className="fps-wordmark fps-duke-wordmark" aria-label="Duke Nukem 3D">
              <span>DUKE NUKEM</span><b>3D</b>
            </div>}
            <p className="fps-kicker">{quake.fps?.menuKicker ?? (classic ? "L.A. MELTDOWN · EPISODE ONE · E1L1" : quakeStyle ? "SCARLET REEL · QUAKE-STYLE ACTION" : "SCARLET REEL · SPRITE ACTION ENGINE")}</p>
            <h2>
              {error
                ? "VIEW UNAVAILABLE"
                : p && p.health <= 0
                  ? "TRY THAT AGAIN."
                  : paused
                    ? "PAUSED"
                    : (props.title ?? "FIRST-PERSON")}
            </h2>
            <p>
              {error ||
                (p && p.health <= 0
                  ? "You’re not done yet. Restart the level or load your last save."
                  : quake.fps?.objective)}
            </p>
            {!paused && !error && (
              <p className="fps-controls">
                WASD move · Mouse / right-drag / arrows aim · Click / F fire · E
                use
                <br />
                Space jump · C / Ctrl crouch · Shift run · {classic ? "2 pistol · 3 shotgun · 5 RPG" : "1/2 weapons"} · R reload
                <br />
                {classic && <>1 / ` kick · J jetpack · B steroids · N night vision · M medkit<br />
                  H Holoduke · 6 throw bomb · G detonate · [ ] inventory · Enter use<br /></>}
                {quakeStyle && <>1 axe · 2 shotgun · 3 double shotgun · 4 nailgun · B biosuit<br /></>}
                Touch: swipe to look; tap the inventory panel to use equipment.
              </p>
            )}
            {(classic || quakeStyle) && !started && (snapshot?.time ?? 0) === 0 && <label className="fps-skill-select">
                Difficulty
                <select value={snapshot?.skill ?? quake.fps?.defaultSkill ?? 2} onChange={(event) => {
                  if (!world.current || running.current) return;
                  world.current.state.skill = Number(event.target.value) as 1 | 2 | 3;
                  setSnapshot(world.current.snapshot());
                }}>
                  <option value="1">{quake.fps?.skillLabels?.[0] ?? "PIECE OF CAKE"}</option>
                  <option value="2">{quake.fps?.skillLabels?.[1] ?? "LET'S ROCK"}</option>
                  <option value="3">{quake.fps?.skillLabels?.[2] ?? "COME GET SOME"}</option>
                </select>
              </label>}
              <div className="fps-menu-buttons">
              {!error && (p?.health ?? 100) > 0 && (
                <button
                  className="fps-primary"
                  onClick={begin}
                  disabled={!loaded}
                >
                  {classic && <NuclearMark className="fps-menu-mark" />}
                  {loaded
                    ? paused
                      ? "RESUME"
                      : (props.initialSnapshot?.time ?? 0) > 0
                        ? "RESUME LEVEL"
                        : "ENTER LEVEL"
                    : "LOADING ARTWORK…"}
                </button>
              )}
              {(started || (p?.health ?? 100) <= 0) && !error && (
                <button onClick={restartLevel}>RESTART LEVEL</button>
              )}
              {props.onSave && started && (
                <button
                  onClick={() => {
                    if (world.current)
                      props.onSnapshot?.(world.current.snapshot());
                    props.onSave?.();
                  }}
                >
                  SAVE GAME
                </button>
              )}
              {props.onLoad && (
                <button onClick={props.onLoad}>LOAD GAME</button>
              )}
              {props.onMenu && (
                <button onClick={props.onMenu}>BACK TO GAME MENU</button>
              )}
            </div>
            {!paused && !error && (
              <small>
                {quake.fps?.credit ??
                  "Made in Scarlet Reel Studio. Original sprite-action engine."}
              </small>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
