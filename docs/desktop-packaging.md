# Desktop packaging

Scarlet Reel can be packaged as a standalone desktop app with Electron. Electron wraps the existing Vite/React build in a native Chromium container, so the game, Studio, localStorage saves, IndexedDB media library and static public assets all run without a web server.

## Commands

```bash
npm ci
npm run desktop:preview             # build the web app, then open it in Electron
npm run desktop:preview:fullscreen  # same, but the app opens fullscreen
npm run desktop:pack                # create an unpacked desktop app in dist_electron/
npm run desktop:dist                # create distributable installers/packages in dist_electron/
```

`dist_electron/` is intentionally ignored by Git because it contains large generated binaries.

## Packaging targets

The default `electron-builder` targets are configured in `package.json`:

- macOS: `dmg`
- Windows: `nsis`
- Linux: `AppImage`

Run `npm run desktop:dist -- --linux`, `--win`, or `--mac` to build a specific platform where supported by your host OS and signing setup.

## Runtime notes

- Electron loads `dist/index.html` from disk after `npm run build`.
- The Vite build already uses relative asset paths, so story media under `public/` works inside the desktop bundle.
- Studio uploads are copied automatically:
  - during `desktop:preview`, files are written to `public/uploads/` and `dist/uploads/`, so they work immediately and are included by the next build;
  - in an installed/packaged app, files are written to Electron's writable user-data media folder and referenced with `file://` URLs.
- Fullscreen/window controls:
  - use the Newsstand `⚙ Game Menu` for sound, window resolution, fullscreen/windowed mode and Quit Game;
  - launch with `npm run desktop:preview:fullscreen` during development;
  - launch a packaged app with `--fullscreen` or `SCARLET_REEL_FULLSCREEN=1`;
  - use `--windowed` or `SCARLET_REEL_FULLSCREEN=0` to force a normal window;
  - press `F11` (`Ctrl+Cmd+F` on macOS) to toggle fullscreen at runtime.
- External web links are opened in the user's default browser.
- Studio playtests that call `window.open` are allowed for Scarlet Reel's own local app URL and open as additional Electron windows.
