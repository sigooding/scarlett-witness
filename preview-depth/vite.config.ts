import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// A throwaway preview for the depth-map camera, outside the game's build: it imports the REAL
// src/game/DepthParallax.tsx and serves the film's own public/film media, so what it draws is what the
// film draws. `npm run dev` in this folder; the live preview is on 0.0.0.0 so the sandbox can proxy it.
const here = import.meta.dirname;

export default defineConfig({
  root: here,
  publicDir: resolve(here, "../public"),
  plugins: [react()],
  resolve: {
    // The component imported from ../src is resolved from the game's own node_modules, this app from its
    // own: two React copies would break every hook. Keep one, this app's.
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "0.0.0.0",
    port: 5179,
    strictPort: true,
    // The preview host the sandbox proxies through, plus localhost.
    allowedHosts: true,
    fs: { allow: [resolve(here, "..")] },
  },
});
