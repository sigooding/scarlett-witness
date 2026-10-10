// Watches a depth-camera move in the real game: opens the film at a scene in headless Chromium with a fake clock, clicks on
// until the depth canvas for a picture is up, then saves one PNG per frame at exact times (the page only moves when the clock
// is run, so frames are evenly spaced however slow the machine). See docs/depth-camera.md.
//
//   npm run dev                                     # in another terminal (or set DEPTH_FRAMES_URL)
//   node tools/depth-frames.mjs nw_s25 200-the-number-114 /tmp/frames 16 2
//   ffmpeg -framerate 2 -i /tmp/frames/f%04d.png ...   # or look at the first and last PNG side by side
//
// Arguments: scene id, part of the picture's file name, output folder, seconds (default 16), frames a second (default 2).
// PLAYWRIGHT_CHROMIUM_PATH points at a browser when Playwright's own is not installed; software WebGL (SwiftShader) is used.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const [scene, match, outdir, seconds = "16", fps = "2"] = process.argv.slice(2);
if (!scene || !match || !outdir) {
  console.error("usage: node tools/depth-frames.mjs <scene id> <picture name> <out dir> [seconds] [fps]");
  process.exit(1);
}
const base = process.env.DEPTH_FRAMES_URL || "http://localhost:5173";
mkdirSync(outdir, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await page.clock.install();
await page.goto(`${base}/?story=nobodys-witness-film&scene=${scene}`, { waitUntil: "load" });
await page.clock.runFor(2500);
await page.mouse.click(640, 360);
// Press on until the picture's depth canvas is up (a press while a line is still typing only finishes the line).
const canvasFor = (ready) => page.evaluate(([m, r]) =>
  [...document.querySelectorAll("canvas.depth-parallax")].some((c) => (c.dataset.depthFor ?? "").includes(m) && (!r || c.dataset.depthReady === "1")), [match, ready]);
// The new picture's layer mounts only once the clock runs, so look a moment after each press: looking only before the next
// press can press once too often and land on the following beat.
for (let i = 0; i < 150 && !(await canvasFor(false)); i++) {
  await page.keyboard.press("Space");
  await page.clock.runFor(300);
  if (await canvasFor(false)) break;
  await page.clock.runFor(600);
}
await page.mouse.move(640, 710);
let ready = false;
for (let i = 0; i < 600 && !ready; i++) { await page.clock.runFor(16); await new Promise((r) => setTimeout(r, 30)); ready = await canvasFor(true); }
if (!ready) { console.error(`no depth canvas for "${match}" in ${scene}`); await browser.close(); process.exit(1); }
// Stops early if the film moves on (a beat that auto-advances can leave before its move ends; that is worth knowing).
const n = Math.round(Number(seconds) * Number(fps));
let saved = 0;
for (; saved < n && (await canvasFor(false)); saved++) {
  // Software WebGL can take most of a minute over a frame (two of 198's did on 10 October); a slow frame is not a failure.
  await page.screenshot({ path: `${outdir}/f${String(saved).padStart(4, "0")}.png`, timeout: 180000 });
  await page.clock.runFor(1000 / Number(fps));
}
const left = saved < n ? `; the picture left the screen after about ${saved / Number(fps)} s` : "";
console.log(`${saved} frames in ${outdir}${left}`, errors.length ? errors : "no page errors");
await browser.close();
