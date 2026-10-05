/**
 * QuakeStage — OPT-IN first-person "Quake-style" billboard renderer.
 *
 * Renders a 🚶 stage's `quake` grid map as a true 3D room with three.js:
 * solid wall cells become boxes, the player walks first-person (WASD +
 * turn keys, optional pointer-lock mouse look), and every character and
 * interaction marker is a depth-sorted billboard sprite — exactly how
 * Quake and Doom dressed their 3D worlds with 2D art.
 *
 * It changes ONLY the room's geometry. Hotspot actions, gating,
 * conversations, items and the enter script run through the very same
 * callbacks the 2D Stage uses, so a scene can flip between the two
 * renderers without touching its gameplay. A stage without `quake`
 * never mounts this component at all.
 *
 * Map legend (StageSettings.quake.map):
 *   `#` solid wall · `.` / other walkable floor · `S` spawn ·
 *   capital letters resolve through `markers` (→ hotspot id) and
 *   `npcAnchors` (→ npc id).
 */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Hotspot, QuakeModeSettings, StageNpc, StageScriptStep, StageSettings } from "../types";
import { sheetAnim, sheetCols, sheetFrameAt } from "./spriteSheet";
import { quakeMoveDelta, quakePropSpec } from "./quakeMath";
import { assetUrl } from "../assetPath";
import { resolveAssetReference } from "../data/mediaLibrary";

const CURSOR_GLYPH: Record<string, string> = {
  look: "👁️",
  take: "✋",
  talk: "💬",
  use: "🔧",
  go: "🚪",
  kick: "👢",
  punch: "👊",
};

/** True when this environment can actually build a WebGL context. A quake
 *  scene on a display without WebGL falls back to the classic 2D stage
 *  (Game.tsx checks this before mounting QuakeStage), the same "running on
 *  instruments" idea as the triangulation bay. */
export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

interface QuakeStageProps {
  settings: StageSettings;
  quake: QuakeModeSettings;
  hotspots: Hotspot[];
  unlocked: (hs: Hotspot) => boolean;
  onInteract: (hs: Hotspot) => void;
  onCaption: (text: string, kind?: "info" | "fail") => void;
  enterScript?: StageScriptStep[];
  onScriptEffect?: (eff: { type: "setFlag"; flag: string } | { type: "goToScene"; targetSceneId: string } | { type: "pose"; pose?: string }) => void;
  onScriptStep?: (info: { tag: string; index: number }) => void;
}

/** A marker reticle billboard: verb glyph + (when close) its label. */
function markerTexture(hs: Hotspot, locked: boolean): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 192;
  c.height = 224;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, c.width, c.height);
  // Diamond reticle, the stage's marker shape, glowing.
  const col = locked ? "#d9a441" : "#2ad9d9";
  g.save();
  g.translate(96, 96);
  g.rotate(Math.PI / 4);
  g.strokeStyle = col;
  g.lineWidth = 8;
  g.shadowColor = col;
  g.shadowBlur = 22;
  g.strokeRect(-46, -46, 92, 92);
  g.restore();
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "72px serif";
  g.fillText(CURSOR_GLYPH[hs.cursor] ?? "◆", 96, 96);
  g.font = "600 17px system-ui, sans-serif";
  g.fillStyle = locked ? "#d9a44188" : "#ffffffdd";
  g.shadowColor = "#000";
  g.shadowBlur = 6;
  const label = hs.label.split("—")[0].trim() || hs.label;
  g.fillText(label.slice(0, 16), 96, 200);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function QuakeStage({
  settings,
  quake,
  hotspots,
  unlocked,
  onInteract,
  onCaption,
  enterScript,
  onScriptEffect,
  onScriptStep,
}: QuakeStageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nearLabel, setNearLabel] = useState<string | null>(null);
  const [scriptRunning, setScriptRunning] = useState(false);
  const [handSrc, setHandSrc] = useState<string | null>(null);

  /* The hand overlay may be an `asset:` upload — resolve before painting. */
  useEffect(() => {
    let dead = false;
    const src = quake.handImage;
    if (!src) return setHandSrc(null);
    if (src.startsWith("asset:")) void resolveAssetReference(src).then((r) => !dead && setHandSrc(r ?? null));
    else setHandSrc(assetUrl(src));
    return () => {
      dead = true;
    };
  }, [quake.handImage]);

  const worldRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    markers: THREE.Group;
    npcs: { sprite: THREE.Sprite; npc: StageNpc; tex: THREE.Texture; cols: number; anim: { frames: number[]; fps?: number }; started: number; talking: boolean }[];
    player: { x: number; z: number; heading: number };
    keys: Set<string>;
    solid: (cx: number, cz: number) => boolean;
    locked: boolean;
    dispose: () => void;
  } | null>(null);

  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;
  const interactRef = useRef(onInteract);
  interactRef.current = onInteract;
  const hotspotsRef = useRef(hotspots);
  hotspotsRef.current = hotspots;

  /* ---------------- build the 3D world once per mount ------------- */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const rows = quake.map.length;
    const cols = Math.max(...quake.map.map((r) => r.length), 1);
    const WALL_H = 2.4;

    const scene = new THREE.Scene();
    const fogColor = quake.fogColor ?? quake.ceilingColor ?? "#171412";
    scene.fog = new THREE.Fog(new THREE.Color(fogColor), 2, Math.max(cols, rows) * 1.35);
    scene.background = new THREE.Color(fogColor);

    const camera = new THREE.PerspectiveCamera(quake.fov ?? 75, 1, 0.05, 120);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      // GL context refused at the last moment — leave the mount empty;
      // Game only mounts us when webglAvailable() already said yes.
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const sun = new THREE.DirectionalLight(0xfff1d6, 1.4);
    sun.position.set(2, 6, 1);
    scene.add(sun);

    const cellAt = (cx: number, cz: number): string => {
      if (cz < 0 || cz >= rows || cx < 0 || cx >= cols) return "#";
      return quake.map[cz][cx] ?? "#";
    };
    const solid = (cx: number, cz: number) => cellAt(cx, cz) === "#";

    /** asset:-aware texture loader — `asset:` refs (Studio uploads kept in
     *  the media library) resolve to a data/file URL first; everything else
     *  goes through assetUrl so deploy-base prefixes still work. */
    const loadTex = (url: string, onImg?: (tex: THREE.Texture, img: HTMLImageElement) => void): THREE.Texture => {
      const tex = new THREE.Texture();
      const finish = (resolved: string) =>
        new THREE.TextureLoader().load(resolved, (t) => {
          tex.image = t.image;
          tex.needsUpdate = true;
          onImg?.(tex, t.image as HTMLImageElement);
        });
      if (url.startsWith("asset:")) void resolveAssetReference(url).then((r) => r && finish(r));
      else finish(assetUrl(url));
      return tex;
    };

    /* floor + ceiling */
    const floorMat = quake.floorTexture
      ? (() => {
          const t = loadTex(quake.floorTexture);
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(cols / 2, rows / 2);
          t.colorSpace = THREE.SRGBColorSpace;
          return new THREE.MeshLambertMaterial({ map: t });
        })()
      : new THREE.MeshLambertMaterial({ color: new THREE.Color(quake.floorColor ?? "#2b2622") });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(cols, rows), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cols / 2, 0, rows / 2);
    scene.add(floor);
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(cols, rows),
      new THREE.MeshLambertMaterial({ color: new THREE.Color(quake.ceilingColor ?? "#171412") })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(cols / 2, WALL_H, rows / 2);
    scene.add(ceil);

    /* walls — one box per solid cell, shared material */
    let wallMat: THREE.MeshLambertMaterial;
    if (quake.wallTexture) {
      const tex = loadTex(quake.wallTexture);
      tex.colorSpace = THREE.SRGBColorSpace;
      wallMat = new THREE.MeshLambertMaterial({ map: tex });
    } else {
      wallMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(quake.wallColor ?? "#6b5a44") });
    }
    const box = new THREE.BoxGeometry(1, WALL_H, 1);
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        if (!solid(x, z)) continue;
        const m = new THREE.Mesh(box, wallMat);
        m.position.set(x + 0.5, WALL_H / 2, z + 0.5);
        scene.add(m);
      }
    }

    /* spawn */
    let sx = 1.5,
      sz = 1.5;
    outer: for (let z = 0; z < rows; z++)
      for (let x = 0; x < cols; x++)
        if (cellAt(x, z) === "S") {
          sx = x + 0.5;
          sz = z + 0.5;
          break outer;
        }
    const player = { x: sx, z: sz, heading: 0 };

    /* NPC billboards from their sprite sheets */
    const npcs: { sprite: THREE.Sprite; npc: StageNpc; tex: THREE.Texture; cols: number; anim: { frames: number[]; fps?: number }; started: number; talking: boolean }[] = [];
    for (const [letter, npcId] of Object.entries(quake.npcAnchors ?? {})) {
      const npc = (settings.npcs ?? []).find((n) => n.id === npcId);
      let ax = -1,
        az = -1;
      for (let z = 0; z < rows && ax < 0; z++)
        for (let x = 0; x < cols; x++)
          if (cellAt(x, z) === letter) {
            ax = x + 0.5;
            az = z + 0.5;
            break;
          }
      if (!npc || ax < 0) continue;
      if (npc.sheet) {
        const sheet = npc.sheet;
        const entry = {
          sprite: null as unknown as THREE.Sprite,
          npc,
          tex: null as unknown as THREE.Texture,
          cols: 1,
          anim: sheetAnim(sheet, "idle", ["rest", "talk"]) ?? { frames: [0] },
          started: performance.now() / 1000,
          talking: false,
        };
        const tex = loadTex(sheet.image, (t) => {
          const img = t.image as HTMLImageElement;
          const c = sheetCols(sheet, img.width);
          const rowsInSheet = Math.max(1, Math.ceil(img.height / sheet.frameHeight));
          entry.cols = c;
          t.repeat.set(1 / c, 1 / rowsInSheet);
          t.offset.set(0, 1 - 1 / rowsInSheet);
        });
        tex.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(mat);
        const h = 1.15 * (npc.scale ?? 1);
        const ratio = sheet.frameWidth / sheet.frameHeight;
        sprite.scale.set(h * ratio, h, 1);
        sprite.position.set(ax, (h / 2) * 0.9 + 0.35, az);
        scene.add(sprite);
        entry.sprite = sprite;
        entry.tex = tex;
        npcs.push(entry);
      }
    }

    /* PROPS — STATIC upright quads, never billboards: a door stays put
     * while you strafe past it (billboarding a door is what made doors
     * "float and act weird"). Value is "url", "url@height" or
     * "url@height@yawDeg" — yaw 0 faces +z (south), 90 faces +x (east). */
    const propGeo = new THREE.PlaneGeometry(1, 1);
    for (const [letter, val] of Object.entries(quake.props ?? {})) {
      const { url, height: h, yaw } = quakePropSpec(val);
      let ax = -1,
        az = -1;
      for (let z = 0; z < rows && ax < 0; z++)
        for (let x = 0; x < cols; x++)
          if (cellAt(x, z) === letter) {
            ax = x + 0.5;
            az = z + 0.5;
            break;
          }
      if (ax < 0) continue;
      const mat = new THREE.MeshLambertMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.08,
      });
      const mesh = new THREE.Mesh(propGeo, mat);
      const tex = loadTex(url, (_t, img) => {
        if (img?.width) mesh.scale.set(h * (img.width / img.height), h, 1);
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      mat.map = tex;
      mat.needsUpdate = true;
      mesh.scale.set(h * 0.55, h, 1);
      mesh.rotation.y = yaw;
      mesh.position.set(ax, h / 2, az);
      scene.add(mesh);
    }

    const markers = new THREE.Group();
    scene.add(markers);

    const keys = new Set<string>();
    const world = {
      scene,
      camera,
      renderer,
      markers,
      npcs,
      player,
      keys,
      solid,
      locked: false,
      dispose: () => {},
    };
    worldRef.current = world;

    /* ---------- input ---------- */
    const down = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      keys.add(e.key.toLowerCase());
    };
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const ray = new THREE.Raycaster();
    const click = (e: MouseEvent) => {
      if (world.locked) return;
      if (quake.mouseLook && document.pointerLockElement === renderer.domElement) return;
      const r = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects([...markers.children, ...npcs.map((n) => n.sprite)], false);
      for (const h of hits) {
        const hs = (h.object.userData as { hotspot?: Hotspot }).hotspot;
        if (hs) {
          interactRef.current(hs);
          return;
        }
      }
      if (quake.mouseLook) renderer.domElement.requestPointerLock();
    };
    renderer.domElement.addEventListener("mousedown", click);
    const mouseMove = (e: MouseEvent) => {
      if (quake.mouseLook && document.pointerLockElement === renderer.domElement) {
        player.heading -= e.movementX * 0.0026;
      }
    };
    document.addEventListener("mousemove", mouseMove);

    /* ---------- resize ---------- */
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* ---------- frame loop ---------- */
    let raf = 0;
    let last = performance.now();
    const R = 0.28; // player radius for wall collision
    const canStand = (x: number, z: number) =>
      !solid(Math.floor(x - R), Math.floor(z - R)) &&
      !solid(Math.floor(x + R), Math.floor(z - R)) &&
      !solid(Math.floor(x - R), Math.floor(z + R)) &&
      !solid(Math.floor(x + R), Math.floor(z + R));

    let near: string | null = null;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      if (!world.locked) {
        const speed = quake.moveSpeed ?? 3.2;
        const turn = quake.turnSpeed ?? 2.4;
        if (keys.has("arrowleft") || keys.has("q")) player.heading += turn * dt;
        if (keys.has("arrowright") || keys.has("e")) player.heading -= turn * dt;
        const f = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
        const s = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
        if (f || s) {
          // W walks where the camera looks, D strafes to its right — the
          // pure math lives in quakeMath.ts (pinned by engine tests).
          const { dx, dz } = quakeMoveDelta(player.heading, f, s);
          const nx = player.x + dx * speed * dt;
          const nz = player.z + dz * speed * dt;
          if (canStand(nx, player.z)) player.x = nx;
          if (canStand(player.x, nz)) player.z = nz;
        }
      }

      camera.position.set(player.x, 1.42, player.z);
      camera.rotation.set(0, player.heading, 0, "YXZ");

      /* npc frame stepping */
      for (const n of npcs) {
        const frame = sheetFrameAt(n.anim, t - n.started);
        const col = frame % Math.max(1, n.cols);
        const row = Math.floor(frame / Math.max(1, n.cols));
        const rowsInSheet = Math.max(1, Math.round(1 / (n.tex.repeat.y || 1)));
        n.tex.offset.set(col / Math.max(1, n.cols), 1 - (row + 1) / rowsInSheet);
      }

      /* nearest marker label */
      let best: string | null = null;
      let bd = quake.labelDistance ?? 2.5;
      for (const m of markers.children) {
        const hs = (m.userData as { hotspot?: Hotspot }).hotspot;
        if (!hs) continue;
        const d = Math.hypot(m.position.x - player.x, m.position.z - player.z);
        if (d < bd) {
          bd = d;
          best = hs.label;
        }
      }
      if (best !== near) {
        near = best;
        setNearLabel(best);
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    world.dispose = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      renderer.domElement.removeEventListener("mousedown", click);
      document.removeEventListener("mousemove", mouseMove);
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    return () => worldRef.current?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- marker sprites track the live hotspots -------- */
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    const g = world.markers;
    while (g.children.length) {
      const c = g.children.pop() as THREE.Sprite;
      (c.material.map as THREE.Texture | null)?.dispose();
      c.material.dispose();
    }
    const rows = quake.map.length;
    const cols = Math.max(...quake.map.map((r) => r.length), 1);
    for (const [letter, hsId] of Object.entries(quake.markers ?? {})) {
      const hs = hotspots.find((h) => h.id === hsId);
      let ax = -1,
        az = -1;
      for (let z = 0; z < rows && ax < 0; z++)
        for (let x = 0; x < cols; x++)
          if ((quake.map[z][x] ?? "#") === letter) {
            ax = x + 0.5;
            az = z + 0.5;
            break;
          }
      if (!hs || ax < 0) continue;
      const open = unlockedRef.current(hs);
      const tex = markerTexture(hs, !open);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      const sc = quake.markerScale ?? 1;
      sprite.scale.set(0.85 * sc, 1.0 * sc, 1);
      sprite.position.set(ax, 1.05, az);
      sprite.userData.hotspot = hs;
      g.add(sprite);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspots]);

  /* ---------------- enter script (say / wait / flags / move) ------ */
  useEffect(() => {
    const world = worldRef.current;
    if (!world || !enterScript?.length) return;
    let dead = false;
    setScriptRunning(true);
    world.locked = true;
    if (settings.enterCaption) onCaption(settings.enterCaption);

    const sleep = (s: number) => new Promise((r) => setTimeout(r, s * 1000));
    (async () => {
      for (let i = 0; i < enterScript.length; i++) {
        if (dead) return;
        const step = enterScript[i];
        onScriptStep?.({ tag: "enter", index: i });
        if (step.do === "say") {
          onCaption(step.text);
          for (const n of world.npcs) n.talking = n.npc.id === step.npcId;
          await sleep(Math.min(7, Math.max(1.6, step.text.length * 0.055)));
        } else if (step.do === "wait") {
          await sleep(step.seconds);
        } else if (step.do === "setFlag") {
          onScriptEffect?.({ type: "setFlag", flag: step.flag });
        } else if (step.do === "face") {
          world.player.heading = step.dir === "left" ? Math.PI / 2 : step.dir === "right" ? -Math.PI / 2 : world.player.heading;
        } else if (step.do === "walkTo") {
          // In quake mode walkTo targets are GRID coordinates (cell x, y).
          const tx = step.x + 0.5;
          const tz = step.y + 0.5;
          const d = Math.hypot(tx - world.player.x, tz - world.player.z);
          const steps = Math.max(1, Math.ceil(d / 0.05));
          for (let k = 0; k < steps && !dead; k++) {
            world.player.x += ((tx - world.player.x) / (steps - k)) ;
            world.player.z += ((tz - world.player.z) / (steps - k));
            await sleep(0.03);
          }
        } else if (step.do === "goToScene") {
          onScriptEffect?.({ type: "goToScene", targetSceneId: step.targetSceneId });
          return;
        }
      }
      if (!dead) {
        world.locked = false;
        setScriptRunning(false);
      }
    })();
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" data-quake-stage>
      <div ref={mountRef} className="absolute inset-0" />
      {/* first-person hand overlay — the Quake visible-weapon trick */}
      {handSrc && (
        <img
          src={handSrc}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute bottom-0 right-[4%] z-[55] h-[46%] max-w-none select-none"
        />
      )}
      {/* proximity label, the 2D stage's hint strip in miniature */}
      {nearLabel && !scriptRunning && (
        <div className="pointer-events-none absolute inset-x-0 bottom-14 z-[60] flex justify-center">
          <span className="rounded border border-cyan-neon/50 bg-noir-950/85 px-3 py-1 font-pulp text-[11px] uppercase tracking-widest text-cyan-neon">
            {nearLabel}
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-[60] flex justify-center">
        <span className="rounded bg-noir-950/70 px-2 py-0.5 font-type text-[9px] tracking-widest text-paper/50">
          W A S D — move · ← → / Q E — turn · click a marker to interact
        </span>
      </div>
      {scriptRunning && <div className="pointer-events-none absolute inset-x-0 top-0 z-[70] h-[9vh] bg-black" aria-hidden />}
      {scriptRunning && <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[70] h-[9vh] bg-black" aria-hidden />}
    </div>
  );
}
