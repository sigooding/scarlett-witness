import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { gameRange } from "./rng";
import type { TriangulateConfig } from "../types";
import { audio } from "../audio";

/**
 * TriangulateGame — a 3D signal-triangulation minigame, rendered with three.js.
 *
 * Deliberately a DIFFERENT SHAPE of game to the two that already ship:
 * RideGame is a reflex test (dodge things coming at you) and PatternPuzzle is
 * a reading test (spot the rows that rhyme). This one is a REASONING test with
 * a spatial answer — the player is not dodging or reading, they are
 * triangulating, and the answer is a place rather than a moment or a row.
 *
 * The loop: you stand at a shore listening post and sweep a directional
 * antenna across a night bay. The signal meter peaks when the antenna points
 * at the boat. Commit that bearing and a line is drawn across the water. Do it
 * from a second post and the lines cross; a third confirms the fix. Cross
 * close enough to the boat, enough times, before the clock runs out, and the
 * bust is yours.
 *
 * Why the peak is findable but not free: strength falls off with the ANGULAR
 * error, so a lazy sweep reads "warm" over a wide arc and you have to slow
 * down near the top to find the true maximum. Bearings are limited, so a
 * sloppy commit costs you.
 *
 * The renderer is torn down on unmount (renderer.dispose + geometry/material
 * disposal + cancelAnimationFrame), because this mounts and unmounts inside a
 * story that keeps playing around it.
 */

const WORLD = 100; // the bay is WORLD x WORLD world-units

/** Signal strength 0..1 for an antenna bearing vs the true bearing. Falls off
 *  with angular error, sharply enough to reward a careful sweep. */
function strengthFor(angleDeg: number, trueDeg: number): number {
  let d = Math.abs(((angleDeg - trueDeg + 540) % 360) - 180);
  d = Math.min(d, 180);
  // A 22-degree "warm" lobe: unmistakable when you are close, vague when not.
  return Math.max(0, Math.pow(Math.max(0, 1 - d / 22), 1.6));
}

/** Where two bearings (point + heading) cross, or null when near-parallel. */
function intersect(
  a: { x: number; z: number; deg: number },
  b: { x: number; z: number; deg: number }
): { x: number; z: number } | null {
  const ar = (a.deg * Math.PI) / 180;
  const br = (b.deg * Math.PI) / 180;
  const adx = Math.sin(ar);
  const adz = -Math.cos(ar);
  const bdx = Math.sin(br);
  const bdz = -Math.cos(br);
  const det = adx * -bdz - -bdx * adz;
  if (Math.abs(det) < 1e-4) return null; // parallel: no usable crossing
  const rx = b.x - a.x;
  const rz = b.z - a.z;
  const t = (rx * -bdz - -bdx * rz) / det;
  if (t < 0) return null; // the crossing is BEHIND the antenna
  return { x: a.x + adx * t, z: a.z + adz * t };
}

export function TriangulateGame({
  config,
  onWin,
  onFail,
  onClose,
}: {
  config: TriangulateConfig;
  onWin: () => void;
  onFail: () => void;
  onClose?: () => void;
}) {
  const duration = Math.max(10, config.durationSeconds ?? 45);
  const required = Math.max(2, config.bearingsRequired ?? 3);
  const allowed = Math.max(required, config.bearingsAllowed ?? 5);
  const tolerance = Math.max(2, config.toleranceMeters ?? 9);

  const posts = useMemo(
    () =>
      config.posts && config.posts.length >= 2
        ? config.posts
        : [
            { x: -38, z: 34, label: "Post A — Dinner Key" },
            { x: 40, z: 30, label: "Post B — Rickenbacker" },
            { x: 2, z: -40, label: "Post C — Coast Guard" },
          ],
    [config.posts]
  );

  // The boat. Seeded from the shared story RNG so a replay of the same seed
  // hunts the same target (and the bot can play it deterministically).
  const target = useMemo(() => {
    if (config.target) return config.target;
    return { x: gameRange(-WORLD * 0.3, WORLD * 0.3), z: gameRange(-WORLD * 0.28, WORLD * 0.28) };
  }, [config.target]);

  const [postIdx, setPostIdx] = useState(0);
  const [angle, setAngle] = useState(0);
  const [bearings, setBearings] = useState<{ x: number; z: number; deg: number }[]>([]);
  const [left, setLeft] = useState(duration);
  const [done, setDone] = useState<null | "win" | "fail">(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [noWebGL, setNoWebGL] = useState(false);

  const post = posts[Math.min(postIdx, posts.length - 1)];
  const trueDeg = useMemo(() => {
    const dx = target.x - post.x;
    const dz = target.z - post.z;
    return (((Math.atan2(dx, -dz) * 180) / Math.PI) + 360) % 360;
  }, [target, post]);
  const strength = strengthFor(angle, trueDeg);

  // ---- three.js scene ---------------------------------------------------
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    beam: THREE.Mesh;
    beamMat: THREE.MeshBasicMaterial;
    antenna: THREE.Group;
    lines: THREE.Group;
    fix: THREE.Mesh;
    raf: number;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    // NO WEBGL, NO CRASH. happy-dom (the test harness) and locked-down
    // browsers have no WebGL context. Probe for one FIRST — constructing the
    // renderer blind logs a three.js error to the console and the DOM smoke
    // test treats console errors as failures. Without a context we fall back
    // to the HUD, which is fully playable on its own: the meter, the bearing
    // readout and the commit button are the actual game; the 3D bay is how it
    // is dressed.
    let renderer: THREE.WebGLRenderer;
    try {
      const probe = document.createElement("canvas");
      const ctx =
        probe.getContext("webgl2") || probe.getContext("webgl") || probe.getContext("experimental-webgl");
      if (!ctx) {
        setNoWebGL(true);
        return;
      }
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setNoWebGL(true);
      return;
    }
    const w = mount.clientWidth || 800;
    const h = mount.clientHeight || 460;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0420, 0.011);

    const camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 600);
    camera.position.set(0, 78, 96);
    camera.lookAt(0, 0, 0);

    // --- the bay: a dark plane with a neon grid, Miami-at-night ---
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(WORLD * 2, WORLD * 2, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x0b0a2a })
    );
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    const grid = new THREE.GridHelper(WORLD * 2, 40, 0xff2e88, 0x1b7f9e);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.28;
    scene.add(grid);

    // --- shore posts ---
    posts.forEach((p) => {
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0x7de2ff })
      );
      mast.position.set(p.x, 5, p.z);
      scene.add(mast);
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x7de2ff })
      );
      cap.position.set(p.x, 11, p.z);
      scene.add(cap);
    });

    // --- the sweeping antenna beam (a flat wedge on the water) ---
    const antenna = new THREE.Group();
    const beamGeo = new THREE.ConeGeometry(9, 150, 4, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    // Point the cone along -Z (bearing 0 = north) and lay it on the water.
    beam.rotation.x = -Math.PI / 2;
    beam.position.set(0, 1.5, -75);
    antenna.add(beam);
    scene.add(antenna);

    const lines = new THREE.Group();
    scene.add(lines);

    // --- the fix marker: shown only once the player has crossed lines ---
    const fix = new THREE.Mesh(
      new THREE.TorusGeometry(4, 0.5, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xffd166 })
    );
    fix.rotation.x = -Math.PI / 2;
    fix.position.y = 1.5;
    fix.visible = false;
    scene.add(fix);

    let raf = 0;
    const tick = () => {
      const st = sceneRef.current;
      if (st) {
        // Slow orbital drift so the bay reads as 3D without asking the player
        // to fly a camera while they are trying to concentrate on a meter.
        const t = performance.now() * 0.00006;
        st.camera.position.x = Math.sin(t) * 26;
        st.camera.position.z = 96 + Math.cos(t) * 10;
        st.camera.lookAt(0, 0, 0);
        st.renderer.render(st.scene, st.camera);
      }
      raf = requestAnimationFrame(tick);
    };

    sceneRef.current = { renderer, scene, camera, beam, beamMat, antenna, lines, fix, raf: 0 };
    raf = requestAnimationFrame(tick);
    sceneRef.current.raf = raf;

    const onResize = () => {
      const cw = mount.clientWidth || 800;
      const ch = mount.clientHeight || 460;
      renderer.setSize(cw, ch);
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      // Free every GPU resource: this component mounts and unmounts inside a
      // story that keeps running, so a leak here accumulates across scenes.
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  }, [posts]);

  // Drive the beam from React state (angle + current post).
  useEffect(() => {
    const st = sceneRef.current;
    if (!st) return;
    st.antenna.position.set(post.x, 0, post.z);
    st.antenna.rotation.y = (-angle * Math.PI) / 180;
    // The beam glows as the signal comes up — the meter, felt rather than read.
    st.beamMat.opacity = 0.12 + strength * 0.5;
    st.beamMat.color.setHex(strength > 0.75 ? 0xffe066 : 0x39ff14);
  }, [angle, post, strength]);

  // Draw committed bearings and the current crossing estimate.
  useEffect(() => {
    const st = sceneRef.current;
    if (!st) return;
    while (st.lines.children.length) {
      const c = st.lines.children.pop() as THREE.Line;
      c.geometry?.dispose();
      (c.material as THREE.Material)?.dispose();
      st.lines.remove(c);
    }
    bearings.forEach((b) => {
      const r = (b.deg * Math.PI) / 180;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(b.x, 1.2, b.z),
        new THREE.Vector3(b.x + Math.sin(r) * 220, 1.2, b.z - Math.cos(r) * 220),
      ]);
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: 0xff2e88, transparent: true, opacity: 0.85 })
      );
      st.lines.add(line);
    });
    const fix = estimate(bearings);
    st.fix.visible = !!fix;
    if (fix) st.fix.position.set(fix.x, 1.5, fix.z);
  }, [bearings]);

  /** Mean of all pairwise crossings — the fix the bearings actually describe. */
  const estimate = (bs: { x: number; z: number; deg: number }[]) => {
    const pts: { x: number; z: number }[] = [];
    for (let i = 0; i < bs.length; i++)
      for (let j = i + 1; j < bs.length; j++) {
        const p = intersect(bs[i], bs[j]);
        if (p) pts.push(p);
      }
    if (!pts.length) return null;
    return {
      x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
      z: pts.reduce((a, p) => a + p.z, 0) / pts.length,
    };
  };

  // ---- clock ------------------------------------------------------------
  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 0.1) {
          window.clearInterval(id);
          setDone("fail");
          return 0;
        }
        return v - 0.1;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [done]);

  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => (done === "win" ? onWin() : onFail()), 1500);
    return () => window.clearTimeout(id);
  }, [done, onWin, onFail]);

  const commit = useCallback(() => {
    if (done) return;
    const next = [...bearings, { x: post.x, z: post.z, deg: angle }];
    setBearings(next);
    audio.click();
    const fix = estimate(next);
    if (fix && next.length >= required) {
      const err = Math.hypot(fix.x - target.x, fix.z - target.z);
      if (err <= tolerance) {
        setMsg(`FIX CONFIRMED — ${err.toFixed(1)}m off. That's the boat.`);
        setDone("win");
        return;
      }
    }
    if (next.length >= allowed) {
      setMsg("Out of bearings. The signal's gone cold.");
      setDone("fail");
      return;
    }
    setMsg(
      strength > 0.7
        ? "Strong bearing logged. Move to another post and cross it."
        : "Bearing logged — but that was a weak signal. Sweep for the peak next time."
    );
    // Auto-advance to the next post: a second bearing from the SAME post is
    // parallel and tells you nothing, which is a frustrating way to lose.
    setPostIdx((i) => (i + 1) % posts.length);
  }, [angle, allowed, bearings, done, post, posts.length, required, strength, target, tolerance]);

  // Keyboard: arrows sweep (shift = fine), space commits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      const step = e.shiftKey ? 0.5 : 3;
      if (e.key === "ArrowLeft" || e.key === "a") {
        setAngle((v) => (v - step + 360) % 360);
        e.preventDefault();
      } else if (e.key === "ArrowRight" || e.key === "d") {
        setAngle((v) => (v + step) % 360);
        e.preventDefault();
      } else if (e.key === " " || e.key === "Enter") {
        commit();
        e.preventDefault();
      } else if (e.key === "Tab") {
        setPostIdx((i) => (i + 1) % posts.length);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, done, posts.length]);

  const pct = Math.round(strength * 100);

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-[#05010f]/95 backdrop-blur-sm">
      {/* prompt */}
      <div className="flex items-center justify-between gap-3 border-b border-[#ff2e88]/40 px-4 py-2">
        <div className="min-w-0">
          <div className="font-pulp text-[11px] uppercase tracking-[0.2em] text-[#ff2e88]">
            {config.prompt ?? "Triangulate the signal"}
          </div>
          <div className="font-type text-[10px] text-[#7de2ff]/70">
            ← → sweep · shift = fine · space commits a bearing · tab changes post
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={`font-mono text-lg ${left < 10 ? "text-[#ff2e88]" : "text-[#7de2ff]"}`}>
            {left.toFixed(1)}s
          </div>
          <div className="font-type text-[9px] uppercase tracking-wider text-paper/50">
            {bearings.length}/{allowed} bearings
          </div>
        </div>
      </div>

      {/* the bay */}
      <div ref={mountRef} className="relative min-h-0 flex-1">
        {noWebGL && (
          // The instruments still work without the view out of the window.
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="font-type text-[11px] leading-relaxed text-[#7de2ff]/70">
              No 3D on this display — running on instruments.
              <br />
              Sweep with ← → and watch the signal meter below; commit a bearing at the peak.
            </p>
          </div>
        )}
        {done && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={`border-2 px-6 py-3 font-pulp text-xl uppercase tracking-[0.15em] ${
                done === "win"
                  ? "border-[#39ff14] bg-black/70 text-[#39ff14]"
                  : "border-[#ff2e88] bg-black/70 text-[#ff2e88]"
              }`}
            >
              {done === "win" ? (config.winText ?? "Fix confirmed") : (config.failText ?? "Signal lost")}
            </div>
          </div>
        )}
      </div>

      {/* meter + controls */}
      <div className="border-t border-[#ff2e88]/40 px-4 py-2">
        <div className="mb-1 flex items-center justify-between font-type text-[10px] uppercase tracking-wider">
          <span className="text-[#7de2ff]">{post.label ?? `Post ${postIdx + 1}`}</span>
          <span className="text-paper/60">
            bearing {angle.toFixed(1)}° · signal {pct}%
          </span>
        </div>
        {/* Signal meter. The bar IS the puzzle, so it gets the width. */}
        <div className="h-3 w-full overflow-hidden border border-[#7de2ff]/40 bg-black/60">
          <div
            className="h-full transition-[width] duration-75"
            style={{
              width: `${pct}%`,
              background:
                strength > 0.75
                  ? "linear-gradient(90deg,#39ff14,#ffe066)"
                  : "linear-gradient(90deg,#1b7f9e,#39ff14)",
            }}
          />
        </div>
        {msg && <div className="mt-1 font-type text-[10px] text-[#ffd166]">{msg}</div>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="range"
            min={0}
            max={359.5}
            step={0.5}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            disabled={!!done}
            aria-label="Antenna bearing"
            className="h-1.5 min-w-[200px] flex-1 accent-[#ff2e88]"
          />
          <button
            type="button"
            onClick={commit}
            disabled={!!done}
            className="border border-[#39ff14] bg-[#39ff14]/10 px-3 py-1 font-pulp text-[10px] uppercase tracking-widest text-[#39ff14] hover:bg-[#39ff14]/25 disabled:opacity-40"
          >
            ⊕ Commit bearing
          </button>
          <button
            type="button"
            onClick={() => setPostIdx((i) => (i + 1) % posts.length)}
            disabled={!!done}
            className="border border-[#7de2ff]/60 px-3 py-1 font-pulp text-[10px] uppercase tracking-widest text-[#7de2ff] hover:bg-[#7de2ff]/15 disabled:opacity-40"
          >
            ⇄ Next post
          </button>
          {onClose && !done && (
            <button
              type="button"
              onClick={onClose}
              className="border border-noir-600 px-3 py-1 font-pulp text-[10px] uppercase tracking-widest text-paper/50 hover:text-paper"
            >
              Abort
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
