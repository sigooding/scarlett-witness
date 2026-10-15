/**
 * THE STUDIO'S BUILT-IN IMAGE LIBRARY — everything on disk that an image
 * picker can offer, scanned in Node during both `vite dev` and `vite build`
 * (the list is baked into the bundle, so the single-file build carries it too).
 *
 * Lives here rather than inline in vite.config.ts so the scan can be run and
 * checked on its own: `scripts/beta/image-picker-harness.mjs` feeds this real
 * list to the real image picker, which is how the film's pictures are kept
 * reachable from the Studio.
 *
 * Four roots, each mapped to the public URL prefix it is served under:
 *
 *   /img          the scene-and-story art library (the author's own plates)
 *   /assets       shipped sprites and UI art (character keyframes, cursors…)
 *   /film/img     Nobody's Witness's own pictures (811 of them) — `group`
 *                 "film-img", for the film's background and beat fields
 *   /film/depth   the film's depth maps, clean plates and cut-outs — `group`
 *                 "film-depth", offered by the depth-camera fields
 *
 * A `group` marks files only some pickers list by default: the film's depth
 * layers would only clutter a background picker, and its 800+ pictures would
 * swamp a picker for another story. Both stay one click away — the picker's
 * “Show every group too” switch — and a field that ALREADY points into a group
 * (a film scene's background is a `/film/img/…` picture) lists that group
 * straight away.
 *
 * Stored values stay the stable public path (`/img/…`), so saves and exports
 * never break on a rebuild.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The repository root, worked out from this file's own path. A test that
 * BUNDLES this module (scripts/film-backend.entry.ts does) runs it from a
 * scratch directory, where its own path means nothing — there the repo is the
 * working directory. Pass a root explicitly when you know it.
 * @returns {string}
 */
function defaultRoot() {
  const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  return fs.existsSync(path.join(moduleRoot, "public")) ? moduleRoot : process.cwd();
}

/**
 * Roots scanned for the Studio image browser, in the order they are listed.
 * @param {string} [root]
 * @returns {{ dir: string, prefix: string, group?: string }[]}
 */
export function imageRoots(root = defaultRoot()) {
  return [
    { dir: path.join(root, "public/img"), prefix: "/img" },
    { dir: path.join(root, "public/assets"), prefix: "/assets" },
    { dir: path.join(root, "public/film/img"), prefix: "/film/img", group: "film-img" },
    { dir: path.join(root, "public/film/depth"), prefix: "/film/depth", group: "film-depth" },
  ];
}

const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"];

/** A depth-camera layer file: its PICTURE's slug is the folder it sits in. */
const LAYER_FILE = /^(source-)?(depth|plate|cutout|cut)(?:-(\d+))?$/;

/** @param {string} s */
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Human-readable label for one file, relative to its root.
 *
 *  - "bg-office" → "Office", "ch-lena" → "Lena", "cover-velvet-alibi" →
 *    "Velvet Alibi" (the pulp prefixes are stripped);
 *  - the folder is folded into the label so duplicate names stay
 *    disambiguated: "377-the-hive-remembered (s1)";
 *  - dashes between digits survive, so a numbered shot keeps its slug
 *    ("100-01-the-empty-stool" → "100-01 The Empty Stool");
 *  - a depth layer is named after its shot, not after the file, so the
 *    depth-camera picker reads as the film: "377 The Hive Remembered —
 *    depth (s1)", "… — cut-out 1 (s74)".
 */
/** @param {string} rel @returns {string} */
export function labelFor(rel) {
  const base = rel.replace(/\.[^.]+$/, "");
  const parts = base.split("/");
  const last = parts[parts.length - 1] ?? base;

  const layer = LAYER_FILE.exec(last);
  if (layer && parts.length >= 2) {
    const shot = parts[parts.length - 2];
    const scene = parts.slice(0, -2).join("/");
    const kind =
      layer[2] === "cutout" || layer[2] === "cut"
        ? `cut-out${layer[3] ? ` ${layer[3]}` : ""}`
        : `${layer[1] ? "source " : ""}${layer[2]}`;
    const label = `${titleCase(shot.replace(/[-_]+/g, " "))} — ${kind}`;
    return scene ? `${label} (${scene})` : label;
  }

  const stripped = last.replace(/^(bg-|wolf-|cover-|fg-|ch-)/, "");
  // "100-01" keeps its dash (a numbered shot is one name); every other dash and
  // underscore is a word break.
  const nice = stripped
    .replace(/_/g, " ")
    .replace(/-/g, (dash, off, whole) =>
      /\d/.test(whole[off - 1] ?? "") && /\d/.test(whole[off + 1] ?? "") ? dash : " ",
    );
  const titled = titleCase(nice).trim();
  const folder = parts.slice(0, -1).join("/");
  return folder ? `${titled} (${folder})` : titled;
}

/**
 * One image the Studio can offer.
 * @typedef {{ url: string, label: string, prefix: string, group?: string }} BuiltinImage
 */

/** Every image under imageRoots(root), root-major and alphabetical within each
 *  root so the picker's group headings never interleave.
 *  @param {string} [root] @returns {BuiltinImage[]} */
export function scanBuiltinImages(root) {
  /** @type {BuiltinImage[]} */
  const out = [];
  for (const { dir, prefix, group } of imageRoots(root)) {
    if (!fs.existsSync(dir)) continue;
    /** @type {BuiltinImage[]} */
    const found = [];
    /** @param {string} d @param {string} rel */
    const walk = (d, rel) => {
      /** @type {import("node:fs").Dirent[]} */
      let entries;
      try {
        entries = fs.readdirSync(d, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const relPath = rel ? `${rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          // Raw, ignored art plates are not shipped Studio library assets.
          if (entry.name === "src") continue;
          walk(path.join(d, entry.name), relPath);
        } else {
          const ext = entry.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
          if (!EXTS.includes(ext)) continue;
          found.push({ url: `${prefix}/${relPath}`, label: labelFor(relPath), prefix, ...(group ? { group } : {}) });
        }
      }
    };
    walk(dir, "");
    found.sort((a, b) => a.label.localeCompare(b.label));
    out.push(...found);
  }
  return out;
}
