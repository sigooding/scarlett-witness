import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { animaticExportPlugin } from "./tools/vite-animatic-export.mjs";
import { scanBuiltinImages } from "./tools/builtin-images.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildId = process.env.SCARLET_REEL_BUILD_ID ?? process.env.VITE_BUILD_ID ?? new Date().toISOString();

/**
 * Exposes EVERY image the Studio can offer to the app as a stable list of
 * { url, label, prefix, group? } — the source for the Studio image browser.
 * The roots (public/img, public/assets, public/film/img and public/film/depth)
 * and the labelling live in tools/builtin-images.mjs, so the scan can be run
 * and checked on its own; scanning instead of hardcoding means new art dropped
 * into those folders is automatically pickable, and the stored value stays the
 * stable public path (/img/…) so saves never break on a rebuild.
 *
 * Runs in Node during both `vite dev` and `vite build`, so the list is baked
 * into the bundle for the single-file build too.
 */
function builtinImagesPlugin() {
  const virtualId = "virtual:builtin-images";
  const resolvedId = "\0" + virtualId;
  return {
    name: "builtin-images",
    resolveId(id: string) {
      if (id === virtualId) return resolvedId;
    },
    load(id: string) {
      if (id !== resolvedId) return null;
      return `export default ${JSON.stringify(scanBuiltinImages())};`;
    },
  };
}

/**
 * The audio counterpart of builtinImagesPlugin: EVERY sound file under public/
 * becomes a pickable { url, label, folder } entry, so the Studio's beat voice
 * picker can offer them all — including the generated
 * `voices/<person>/<scene>/<line>.mp3` tree, which a browser cannot enumerate
 * over HTTP (there is no directory listing), and the imported uploads.
 *
 * `person`/`scene` are filled in for the voices tree so a character's own takes
 * can be grouped ahead of everything else. Scanned in Node during both
 * `vite dev` and `vite build`, so the single-file build carries the list too.
 */
function builtinAudioPlugin() {
  const virtualId = "virtual:builtin-audio";
  const resolvedId = "\0" + virtualId;
  const root = path.resolve(__dirname, "public");
  const exts = [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"];

  const scan = () => {
    const out: { url: string; label: string; folder: string; person?: string; scene?: string }[] = [];
    const walk = (dir: string, rel: string) => {
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const relPath = rel ? `${rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name), relPath);
          continue;
        }
        const ext = entry.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
        if (!exts.includes(ext)) continue;
        const parts = relPath.split("/");
        const file = parts[parts.length - 1];
        const folders = parts.slice(0, -1);
        const item: { url: string; label: string; folder: string; person?: string; scene?: string } = {
          url: `/${relPath}`,
          label: file.replace(/\.[^.]+$/, ""),
          folder: folders.join("/"),
        };
        if (folders[0] === "voices" && folders[1]) {
          item.person = folders[1];
          item.scene = folders[2];
        }
        out.push(item);
      }
    };
    walk(root, "");
    out.sort((a, b) => a.url.localeCompare(b.url));
    return out;
  };

  return {
    name: "builtin-audio",
    resolveId(id: string) {
      if (id === virtualId) return resolvedId;
    },
    load(id: string) {
      if (id !== resolvedId) return null;
      return `export default ${JSON.stringify(scan())};`;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __SCARLET_REEL_BUILD_ID__: JSON.stringify(buildId),
  },
  // vite-plugin-singlefile pins base to "./" so the built page works from any
  // directory — including a GitHub Pages project site at /<repo>/. Story media
  // (plain strings in the data files, which the bundler never sees) is
  // rewritten against that base at runtime by src/assetPath.ts.
  // animaticExportPlugin: the dev server's side of 🎞 Export animatic (docs/animatic-export.md); `vite dev` only
  plugins: [react(), tailwindcss(), viteSingleFile(), builtinImagesPlugin(), builtinAudioPlugin(), animaticExportPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // The browser suite gets its own port and a stable page. A pending HMR
    // invalidation from the last code edit must not restart a playthrough.
    hmr: process.env.SCARLET_BROWSER_TEST !== "1",
    // Bind all interfaces so the Arena live-preview proxy (outside the
    // sandbox) can reach the server; localhost-only isn't previewable.
    host: "0.0.0.0",
    // Accept the Arena live-preview host (e.g. <port>-<sandboxId>.e2b.app)
    // instead of rejecting it with a 403.
    allowedHosts: true,
    // ⚠ Do NOT full-page-reload on files the APP writes at runtime. The Studio
    // auto-saves ElevenLabs voice MP3s to public/voices/ and uploads to
    // public/uploads/ (and the desktop shell mirrors media under game-media/).
    // Vite's default watcher reloads the whole page whenever anything under
    // public/ changes, so every generated voice line or dropped image looked
    // like "the preview keeps restarting" — a server-side Vite behaviour, not a
    // game bug. Ignoring these paths stops the reload while the files are still
    // served fresh from disk. See docs/dev-server-reload-notes.md.
    watch: {
      ignored: [
        "**/test-results/**",
        "**/playwright-report/**",
        "**/public/uploads/**",
        "**/public/voices/**",
        "**/game-media/**",
        // Huge exported .reel.json drafts at the repo root (tens of MB) — never
        // relevant to a page reload, but they churn the watcher if rewritten.
        "**/*.reel.json",
        // rendered animatics (tools/export-animatic.mjs) and their frames
        "**/exports/**",
      ],
    },
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
