// Makes depth maps for the depth-map camera (cinematic.depthMap, src/game/DepthParallax.tsx): one grayscale PNG per picture,
// white = near the camera, black = far, written to public/film/depth/<scene folder>/<picture name>.png.
//
//   FFMPEG=/path/to/ffmpeg MODEL=/path/to/depth_anything_v2_vits.onnx node tools/make-depth-maps.mjs public/film/img/s74/*.jpg
//
// The model is Depth Anything V2 Small (Apache-2.0), the ONNX export at
// https://github.com/fabio-sim/Depth-Anything-ONNX/releases/download/v2.0.0/depth_anything_v2_vits.onnx (fixed 518x518 input:
// the 16:9 picture is squeezed in and the map stretched back). It needs onnxruntime-node, which is not a dependency of this repo:
// `npm i --no-save onnxruntime-node`, or point ORT at an install elsewhere (ORT=/somewhere/node_modules/onnxruntime-node).
// The model's output is relative inverse depth (larger = nearer), so it maps straight to white = near. Its 0.5th to 99.5th
// percentiles are stretched to black..white, then near edges are widened by a few pixels (two 3x3 dilations) and the map softened
// (gaussian, sigma 1.5) at 960x540: without that, a figure's outline drags strips of the wall behind it as the camera moves.
// Any grayscale map of the same shape works in its place (painted, or from another tool); keep white = near.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const model = process.env.MODEL;
const pictures = process.argv.slice(2);
if (!model || !pictures.length) {
  console.error("usage: MODEL=<depth_anything_v2_vits.onnx> [FFMPEG=…] [ORT=…] node tools/make-depth-maps.mjs <picture>…");
  process.exit(1);
}
const require = createRequire(import.meta.url);
let ort;
try {
  ort = require(process.env.ORT || "onnxruntime-node");
} catch {
  console.error("onnxruntime-node is not installed: npm i --no-save onnxruntime-node (or set ORT to an install)");
  process.exit(1);
}

const SIDE = 518, OUT_W = 960, OUT_H = 540;
const MEAN = [0.485, 0.456, 0.406], STD = [0.229, 0.224, 0.225];
const session = await ort.InferenceSession.create(model);

for (const pic of pictures) {
  const rgb = execFileSync(ffmpeg, ["-nostdin", "-v", "error", "-i", pic, "-vf", `scale=${SIDE}:${SIDE}:flags=bicubic`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 26 });
  const input = new Float32Array(3 * SIDE * SIDE);
  for (let i = 0; i < SIDE * SIDE; i++) for (let c = 0; c < 3; c++) input[c * SIDE * SIDE + i] = (rgb[i * 3 + c] / 255 - MEAN[c]) / STD[c];
  const result = await session.run({ [session.inputNames[0]]: new ort.Tensor("float32", input, [1, 3, SIDE, SIDE]) });
  const depth = result[session.outputNames[0]];
  const [h, w] = depth.dims.slice(-2);
  const sorted = Float32Array.from(depth.data).sort();
  const lo = sorted[Math.floor(sorted.length * 0.005)], hi = sorted[Math.floor(sorted.length * 0.995)];
  const gray = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) gray[i] = Math.max(0, Math.min(255, Math.round(((depth.data[i] - lo) / (hi - lo)) * 255)));
  const out = resolve(root, "public/film/depth", basename(dirname(pic)), basename(pic).replace(/\.[a-z0-9]+$/i, ".png"));
  mkdirSync(dirname(out), { recursive: true });
  execFileSync(ffmpeg, ["-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", `${w}x${h}`, "-i", "-",
    "-vf", `scale=${OUT_W}:${OUT_H}:flags=bicubic,dilation,dilation,gblur=sigma=1.5`, "-pix_fmt", "gray", out], { input: gray });
  console.log(`${pic} -> ${out.slice(root.length + 1)}`);
}
