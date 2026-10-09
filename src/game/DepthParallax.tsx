import { useEffect, useRef, useState } from "react";
import type { CinematicSettings } from "../types";
import { assetBackground, assetUrl } from "../assetPath";

/* ------------------------------------------------------------------ */
/*  depth-map parallax (2.5D camera on a still picture)                */
/* ------------------------------------------------------------------ */

/** How strongly a depth map can move the picture: at `depthAmount` 1 the
 * nearest and farthest pixels part by this fraction of the frame width. */
const MAX_SHIFT = 0.045;

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

/* The picture is drawn through its depth map: a pixel of depth d moves by
 * (d - focus) times the camera offset, so the plane at `focus` holds still
 * while nearer things slide one way and farther things the other. The loop
 * inverts that mapping (for each screen pixel, find the picture pixel that
 * lands on it), which keeps near objects in front of the background they
 * pass over instead of smearing it. `uPush` is a dolly: near pixels grow
 * away from the centre faster than far ones. */
const FRAGMENT = `
precision mediump float;
uniform sampler2D uImg;
uniform sampler2D uDepth;
uniform vec2 uShift;
uniform float uPush;
uniform float uFocus;
uniform vec2 uScale;
uniform float uOverscan;
varying vec2 vUv;
vec2 moved(vec2 s, float d) { float k = d - uFocus; return uShift * k + (s - 0.5) * uPush * k; }
void main() {
  vec2 uv = (vUv - 0.5) * uScale / uOverscan + 0.5;
  vec2 s = uv;
  for (int i = 0; i < 6; i++) { s = uv - moved(s, texture2D(uDepth, clamp(s, 0.0, 1.0)).r); }
  gl_FragColor = texture2D(uImg, clamp(s, 0.0, 1.0));
}`;

/** True when this cinematic asks for a depth-map camera on a still picture. */
export function hasDepthParallax(c: CinematicSettings | undefined, picture: string | undefined): boolean {
  if (!c?.depthMap || !picture) return false;
  // The dolly mode oversizes the plate's picture to travel across it; the redraw would not line up with it.
  if (c.mode === "dolly") return false;
  return !/^(gradient:|video:|asset:)/.test(picture) && !c.depthMap.startsWith("asset:");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}

function texture(gl: WebGLRenderingContext, unit: number, img: HTMLImageElement) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  // Pictures are rarely powers of two: no mipmaps, clamped edges.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

/** A WebGL canvas that redraws `picture` through `cinematic.depthMap` (a
 * grayscale image the same shape as the picture: white = near the camera,
 * black = far) with a slow camera move, so a still frame reads as a shot with
 * depth. It sits INSIDE the plate's cinematic layer, so the camera mode, the
 * grade filter, dimming, glows and flares all still apply on top of it. The
 * plate's own CSS background stays underneath: until both images have loaded,
 * or if WebGL is unavailable, or for players who ask for reduced motion, the
 * still picture is what shows. */
export function DepthParallaxLayer({ cinematic, picture, reducedMotion }: {
  cinematic?: CinematicSettings;
  picture: string;
  reducedMotion?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const on = hasDepthParallax(cinematic, picture) && !reducedMotion;
  const depthMap = cinematic?.depthMap;
  const amount = Math.max(0, Math.min(1, cinematic?.depthAmount ?? 0.4));
  const focus = Math.max(0, Math.min(1, cinematic?.depthFocus ?? 0.5));
  const motion = cinematic?.depthMotion ?? "orbit";
  const seconds = Math.max(2, cinematic?.depthSeconds ?? 12);
  const follow = cinematic?.depthPointer !== false;

  useEffect(() => {
    setReady(false);
    if (!on || !depthMap) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) return;
    let alive = true;
    let raf = 0;
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uShift = u("uShift"), uPush = u("uPush"), uFocus = u("uFocus"), uScale = u("uScale"), uOverscan = u("uOverscan");
    gl.uniform1i(u("uImg"), 0);
    gl.uniform1i(u("uDepth"), 1);
    gl.uniform1f(uFocus, focus);

    const shift = amount * MAX_SHIFT;
    const reach = Math.max(focus, 1 - focus);
    // Zoom in just enough that the farthest move never pulls an edge into
    // frame: the largest offset is 1.5 x shift (drift plus pointer lean) or,
    // for the dolly, 1.1 x shift at the frame's edge, times the depth reach.
    const farthest = reach * shift * (motion === "push" ? 1.1 : 1.5);
    const overscan = 1 / Math.max(0.5, 1 - 2 * farthest);

    let imgAspect = 16 / 9;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      // object-fit: cover, centred — the same crop as the plate's background.
      const ca = w / h;
      gl.uniform2f(uScale, ca > imgAspect ? 1 : ca / imgAspect, ca > imgAspect ? imgAspect / ca : 1);
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    // The pointer leans the camera a little; touch screens keep the drift only.
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const finePointer = follow && !!window.matchMedia?.("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    };
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

    const onLost = (e: Event) => { e.preventDefault(); alive = false; cancelAnimationFrame(raf); setReady(false); };
    canvas.addEventListener("webglcontextlost", onLost);

    const start = performance.now();
    const draw = (now: number) => {
      if (!alive) return;
      const t = ((now - start) / 1000) * ((2 * Math.PI) / seconds);
      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;
      // Ease in over the first two seconds so the move starts from the still frame.
      const ease = Math.min(1, (now - start) / 2000);
      const e = ease * ease * (3 - 2 * ease);
      let x = 0, y = 0, push = 0;
      if (motion === "sway") x = Math.sin(t);
      else if (motion === "push") push = (1 - Math.cos(t)) * 0.5;
      else { x = Math.sin(t); y = 0.4 * Math.sin(2 * t); }
      gl.uniform2f(uShift, shift * e * (x + 0.5 * pointer.sx), shift * e * (y - 0.35 * pointer.sy));
      gl.uniform1f(uPush, shift * 2.2 * e * push);
      // The edge zoom ramps in with the move, so the first frame matches the still plate underneath exactly.
      gl.uniform1f(uOverscan, 1 + (overscan - 1) * e);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };

    Promise.all([loadImage(assetBackground(picture)), loadImage(assetUrl(depthMap))])
      .then(([img, depth]) => {
        if (!alive) return;
        imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);
        texture(gl, 0, img);
        texture(gl, 1, depth);
        resize();
        raf = requestAnimationFrame((now) => { draw(now); setReady(true); });
      })
      .catch(() => { /* the still picture underneath stays */ });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      if (finePointer) window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      // Free the context once the canvas has left the page: a long film crossfades through many pictures. Not
      // while it is still mounted (React's development double-run of effects): a freed context cannot be reused.
      window.setTimeout(() => {
        if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
      }, 0);
    };
  }, [on, picture, depthMap, amount, focus, motion, seconds, follow]);

  if (!on) return null;
  return (
    <canvas
      // A fresh canvas per setting: the old one is removed from the page and its context freed.
      key={`${picture}|${depthMap}|${amount}|${focus}|${motion}|${seconds}|${follow}`}
      ref={canvasRef}
      className="depth-parallax"
      data-depth-ready={ready ? "1" : "0"}
      aria-hidden
      style={{ opacity: ready ? 1 : 0 }}
    />
  );
}
