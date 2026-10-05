/* ------------------------------------------------------------------ */
/*  fx-alpha — give animated foreground FX plates REAL transparency.    */
/*                                                                      */
/*  The FX overlays (smoke, neon, steam, palm fronds, ceiling fan…)     */
/*  shipped as JPEGs, a format with no alpha channel at all. Every one  */
/*  was a solid rectangle: the subject painted on flat black or flat    */
/*  white. Scenes hid that by leaning on CSS blend modes —              */
/*  `screen` drops black, `multiply` drops white — which works only     */
/*  while the plate underneath is dark enough (or light enough) to sell */
/*  the trick, tints the art toward the plate, and cannot be used at    */
/*  all by the PRIMARY foreground layer, which has no blendMode. There  */
/*  the JPEG rendered as an opaque black slab over the scene.           */
/*                                                                      */
/*  This derives an alpha channel from luminance and re-encodes as PNG: */
/*                                                                      */
/*    --light   subject is LIGHT on black (smoke, neon, glow, steam)    */
/*              → alpha = luminance, so black becomes fully transparent */
/*    --dark    subject is DARK on white (fronds, branch, fan)          */
/*              → alpha = 1 - luminance, colour forced to the subject's */
/*                own dark ink so edges don't fringe white              */
/*                                                                      */
/*  Requires ImageMagick (`convert`) — a build-time asset tool only.    */
/*  The game ships the resulting PNGs and needs nothing at runtime.     */
/*                                                                      */
/*    node scripts/art-room/fx-alpha.mjs --light in.jpg out.png        */
/* ------------------------------------------------------------------ */
import { spawnSync } from "node:child_process";

function run(args) {
  const r = spawnSync("convert", args, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr || `convert failed: ${args.join(" ")}`);
}

/** Mean luminance of a small corner patch — tells us which polarity a plate is
 *  without the caller having to know. */
export function cornerLuma(file) {
  const r = spawnSync(
    "convert",
    [file, "-colorspace", "Gray", "-crop", "24x24+0+0", "+repage", "-format", "%[fx:mean]", "info:"],
    { encoding: "utf8" }
  );
  return parseFloat(r.stdout);
}

/** Copy the greyscale of the image into its own alpha channel.
 *
 *  `gamma` shapes the falloff: values > 1 lift the mid tones so thin smoke
 *  keeps some presence instead of vanishing, which is the usual complaint
 *  after a naive luminance key. */
export function toAlpha(input, output, { polarity = "light", gamma = 1.0 } = {}) {
  const maskOps = ["(", "+clone", "-colorspace", "Gray"];
  if (polarity === "dark") maskOps.push("-negate");
  if (gamma !== 1) maskOps.push("-gamma", String(gamma));
  maskOps.push(")");
  run([
    input,
    ...maskOps,
    "-alpha", "off",
    "-compose", "CopyOpacity",
    "-composite",
    // Un-premultiply: the source blended the subject toward its backdrop, so
    // edge pixels carry the backdrop's colour. Flattening against the
    // subject's own tone keeps thin wisps from fringing black (or white).
    "-background", "none",
    output,
  ]);
}

if (process.argv[1] && process.argv[1].endsWith("fx-alpha.mjs")) {
  const args = process.argv.slice(2);
  const polarity = args.includes("--dark") ? "dark" : "light";
  const gi = args.indexOf("--gamma");
  const gamma = gi >= 0 ? Number(args[gi + 1]) : 1.0;
  const files = args.filter((a) => !a.startsWith("--") && !/^[\d.]+$/.test(a));
  const [input, output] = files;
  if (!input || !output) {
    console.error("usage: fx-alpha.mjs [--light|--dark] [--gamma n] in.jpg out.png");
    process.exit(1);
  }
  toAlpha(input, output, { polarity, gamma });
  console.log(`✓ ${output} — ${polarity} subject, gamma ${gamma}`);
}
