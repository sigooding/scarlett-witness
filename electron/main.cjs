const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require("electron");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");
const { fileURLToPath, pathToFileURL } = require("node:url");
const { packScreel, unpackScreel, isZipBuffer } = require("./screelZip.cjs");

const APP_NAME = "Scarlet Reel";
const DIST_INDEX = path.join(__dirname, "..", "dist", "index.html");
const DIST_INDEX_URL = pathToFileURL(DIST_INDEX).toString();
const DEV_SERVER_URL = process.env.ELECTRON_START_URL || process.env.VITE_DEV_SERVER_URL || "";
const PRELOAD = path.join(__dirname, "preload.cjs");

const windowState = new Set();
const CONFIGURED = Symbol("scarletReelConfigured");

function shouldOpenFullscreen() {
  const argv = process.argv.map((arg) => arg.toLowerCase());
  if (argv.includes("--windowed") || process.env.SCARLET_REEL_FULLSCREEN === "0") return false;
  return (
    argv.includes("--fullscreen") ||
    argv.includes("--full-screen") ||
    /^(1|true|yes)$/i.test(process.env.SCARLET_REEL_FULLSCREEN || "")
  );
}

function isInternalUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);

    if (DEV_SERVER_URL) {
      const dev = new URL(DEV_SERVER_URL);
      return url.origin === dev.origin;
    }

    if (url.protocol !== "file:") return false;
    return path.normalize(fileURLToPath(url)) === path.normalize(DIST_INDEX);
  } catch {
    return false;
  }
}

function webPreferences() {
  return {
    preload: PRELOAD,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
  };
}

function slugPart(value, fallback = "asset") {
  return String(value || fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || fallback;
}

function extensionFor(name, mimeType) {
  const ext = path.extname(String(name || "")).toLowerCase();
  if (ext && ext.length <= 12) return ext;
  if (/png/i.test(mimeType)) return ".png";
  if (/jpe?g/i.test(mimeType)) return ".jpg";
  if (/webp/i.test(mimeType)) return ".webp";
  if (/gif/i.test(mimeType)) return ".gif";
  if (/mpeg|mp3/i.test(mimeType)) return ".mp3";
  if (/wav/i.test(mimeType)) return ".wav";
  if (/ogg|opus/i.test(mimeType)) return ".ogg";
  if (/mp4/i.test(mimeType)) return ".mp4";
  if (/webm/i.test(mimeType)) return ".webm";
  return "";
}

function desktopUploadTargets(relativePath) {
  const roots = [];
  const appRoot = app.getAppPath();

  if (!app.isPackaged) {
    const publicRoot = path.join(appRoot, "public");
    if (fsSync.existsSync(publicRoot)) roots.push(publicRoot);
    const distRoot = path.join(appRoot, "dist");
    if (fsSync.existsSync(distRoot)) roots.push(distRoot);
  }

  if (!roots.length) roots.push(path.join(app.getPath("userData"), "game-media"));
  return roots.map((root) => path.join(root, relativePath));
}

function windowFromEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

function registerDesktopMediaIpc() {
  ipcMain.handle("scarlet-media:save-upload", async (_event, payload) => {
    const storyId = slugPart(payload?.storyId, "story");
    const assetId = slugPart(payload?.assetId, `${Date.now()}`);
    const originalName = slugPart(payload?.name, "upload");
    const ext = extensionFor(payload?.name, payload?.mimeType);
    const base = slugPart(originalName.replace(/\.[^.]+$/, ""), "upload");
    const relativePath = path.join("uploads", storyId, `${assetId}-${base}${ext}`);
    const bytes = payload?.bytes;
    const buffer = Buffer.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
    if (!buffer.length) throw new Error("Upload was empty.");

    const targets = desktopUploadTargets(relativePath);
    await Promise.all(targets.map(async (target) => {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, buffer);
    }));

    // In desktop preview, copying into public/ and dist/ means the same stable
    // /uploads/... path works immediately and will be included by the next Vite
    // build. In a packaged app, userData is the writable game-media folder, so
    // return a file:// URL instead.
    const publicTarget = targets.find((target) => target.includes(`${path.sep}public${path.sep}`));
    if (publicTarget) return { url: `/${relativePath.split(path.sep).join("/")}`, path: publicTarget };
    const target = targets[0];
    return { url: pathToFileURL(target).toString(), path: target };
  });
}

/* ------------------------- player save files --------------------------
 * Every slot save is mirrored to a real .sreel file under the user's saves
 * folder (%APPDATA%/Scarlet Reel/saves on Windows), so a player can see
 * their progress on disk, back it up, and export/import it as a file. */

function savesRoot() {
  return path.join(app.getPath("userData"), "saves");
}

function registerSavesIpc() {
  ipcMain.handle("scarlet-saves:dir", () => savesRoot());

  ipcMain.handle("scarlet-saves:write", async (_event, payload) => {
    const storyId = slugPart(payload?.storyId, "story");
    const slot = Number(payload?.slot);
    if (!Number.isInteger(slot) || slot < 0) throw new Error("Invalid save slot.");
    const saveJson = typeof payload?.saveJson === "string" ? payload.saveJson : "";
    const parsed = JSON.parse(saveJson || "null");
    if (!parsed || typeof parsed !== "object" || !parsed.storyId || !parsed.sceneId) {
      throw new Error("Save payload is not a valid Scarlet Reel save.");
    }
    const dir = payload?.episodeId
      ? path.join(savesRoot(), storyId, slugPart(payload.episodeId, "episode"))
      : path.join(savesRoot(), storyId);
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `slot-${slot}.sreel`);
    await fs.writeFile(file, saveJson, "utf8");
    return { path: file };
  });

  ipcMain.handle("scarlet-saves:list", async (_event, storyIdRaw) => {
    const base = path.join(savesRoot(), slugPart(storyIdRaw, "story"));
    if (!fsSync.existsSync(base)) return [];
    const out = [];
    const walk = async (dir) => {
      for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) await walk(full);
        else if (entry.name.endsWith(".sreel")) {
          try {
            const parsed = JSON.parse(await fs.readFile(full, "utf8"));
            if (parsed && typeof parsed === "object" && parsed.sceneId) {
              out.push({ name: entry.name, path: full, save: parsed });
            }
          } catch {
            /* skip unreadable/corrupt files */
          }
        }
      }
    };
    await walk(base);
    return out.sort((a, b) => (b.save.savedAt ?? 0) - (a.save.savedAt ?? 0));
  });

  ipcMain.handle("scarlet-saves:export", async (event, payload) => {
    const json = String(payload?.json ?? "");
    if (!json) throw new Error("Nothing to export.");
    const win = BrowserWindow.fromWebContents(event.sender);
    const suggested = String(payload?.suggestedName || "scarlet-reel-save.sreel").replace(/[\\/:*?"<>|]/g, "_");
    const res = await dialog.showSaveDialog(win ?? undefined, {
      title: "Export save",
      defaultPath: path.join(app.getPath("documents"), suggested),
      filters: [
        { name: "Scarlet Reel save", extensions: ["sreel"] },
        { name: "All files", extensions: ["*"] },
      ],
    });
    if (res.canceled || !res.filePath) return { canceled: true };
    await fs.writeFile(res.filePath, json, "utf8");
    return { canceled: false, path: res.filePath };
  });

  ipcMain.handle("scarlet-saves:import", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const res = await dialog.showOpenDialog(win ?? undefined, {
      title: "Import save",
      properties: ["openFile"],
      filters: [
        { name: "Scarlet Reel save", extensions: ["sreel", "json"] },
        { name: "All files", extensions: ["*"] },
      ],
    });
    if (res.canceled || !res.filePaths[0]) return { canceled: true };
    const json = await fs.readFile(res.filePaths[0], "utf8");
    return { canceled: false, path: res.filePaths[0], json };
  });

  ipcMain.handle("scarlet-saves:open-dir", async () => {
    const dir = savesRoot();
    await fs.mkdir(dir, { recursive: true });
    await shell.openPath(dir);
    return dir;
  });
}

/** Per-window app mode ("studio" | "play" | "menu" | …). The File menu
 *  labels and accelerators follow the FOCUSED window so Studio's Ctrl+S
 *  (Save Case) never steals the player's Save Game, and a Studio playtest
 *  popup doesn't rewrite the editor's menu. */
const windowMode = new WeakMap();

/** Last folder the author saved/opened a case in, so the next dialog starts there. */
let lastCaseDir = null;

function focusedMode() {
  const win = BrowserWindow.getFocusedWindow();
  return (win && windowMode.get(win)) || "menu";
}

/** The native File menu. Items send an action string to the FOCUSED window;
 *  Studio and the player each listen via scarletReelDesktop.onMenu. */
function rebuildAppMenu() {
  const send = (action) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win && !win.isDestroyed()) win.webContents.send("scarlet-menu", action);
  };
  const studio = focusedMode() === "studio";
  const fileSubmenu = studio
    ? [
        { label: "Save Case", accelerator: "CmdOrCtrl+S", click: () => send("save") },
        { label: "Save Case As…", accelerator: "CmdOrCtrl+Shift+S", click: () => send("save-case-as") },
        { label: "Open Case…", accelerator: "CmdOrCtrl+O", click: () => send("load") },
        { type: "separator" },
        { label: "Export Save…", click: () => send("export-save") },
        { label: "Import Save…", click: () => send("import-save") },
        { label: "Open Saves Folder", click: () => send("open-saves-dir") },
      ]
    : [
        { label: "Save Game", accelerator: "CmdOrCtrl+S", click: () => send("save") },
        { label: "Load Game…", accelerator: "CmdOrCtrl+O", click: () => send("load") },
        { type: "separator" },
        { label: "Export Save…", click: () => send("export-save") },
        { label: "Import Save…", click: () => send("import-save") },
        { label: "Open Saves Folder", click: () => send("open-saves-dir") },
      ];
  fileSubmenu.push(
    { type: "separator" },
    process.platform === "darwin"
      ? { role: "quit" }
      : { label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => app.quit() }
  );
  const template = [
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    { label: "File", submenu: fileSubmenu },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function registerAppMenu() {
  rebuildAppMenu();
  app.on("browser-window-focus", () => rebuildAppMenu());
}

function assetsToDataUrls(assets) {
  return (Array.isArray(assets) ? assets : []).map((a) => ({
    id: String(a.id || ""),
    name: String(a.name || "asset"),
    type: a.type === "audio" || a.type === "video" || a.type === "image" ? a.type : "image",
    ...(a.folder ? { folder: String(a.folder) } : {}),
    size: Number(a.size) || 0,
    uploadedAt: Number(a.uploadedAt) || Date.now(),
    dataUrl: `data:${a.mime || "application/octet-stream"};base64,${a.base64 || ""}`,
  }));
}

async function writeCaseFile(filePath, storyJson, assets) {
  if (/\.screel$/i.test(filePath)) {
    const buf = packScreel({ storyJson, assets });
    await fs.writeFile(filePath, buf);
    return;
  }
  const story = JSON.parse(storyJson || "null");
  if (!story || typeof story !== "object") throw new Error("Case payload is not valid JSON.");
  const bundled = { ...story, assets: assetsToDataUrls(assets) };
  await fs.writeFile(filePath, JSON.stringify(bundled, null, 2), "utf8");
}

function registerReelIpc() {
  ipcMain.handle("scarlet-app:set-mode", (event, mode) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    windowMode.set(win, String(mode || "menu"));
    if (BrowserWindow.getFocusedWindow() === win) rebuildAppMenu();
  });

  ipcMain.handle("scarlet-reel:save", async (event, payload) => {
    const storyJson = String(payload?.storyJson ?? "");
    if (!storyJson) throw new Error("Nothing to save.");
    const assets = Array.isArray(payload?.assets) ? payload.assets : [];
    const win = BrowserWindow.fromWebContents(event.sender);
    const requested = typeof payload?.filePath === "string" ? payload.filePath : "";
    let filePath = requested;
    if (!filePath) {
      const suggested = String(payload?.suggestedName || "case.screel").replace(/[\\/:*?"<>|]/g, "_");
      const startDir = lastCaseDir || app.getPath("documents");
      const res = await dialog.showSaveDialog(win ?? undefined, {
        title: "Save case",
        defaultPath: path.join(startDir, suggested),
        filters: [
          { name: "Scarlet Reel case", extensions: ["screel"] },
          { name: "Scarlet Reel JSON", extensions: ["json"] },
          { name: "All files", extensions: ["*"] },
        ],
      });
      if (res.canceled || !res.filePath) return { canceled: true };
      filePath = res.filePath;
      // Electron only auto-appends the first filter's extension on some
      // platforms. If the author picked the case filter but typed no
      // extension, give them a .screel.
      if (!path.extname(filePath)) filePath += ".screel";
    }
    await writeCaseFile(filePath, storyJson, assets);
    lastCaseDir = path.dirname(filePath);
    return { canceled: false, path: filePath };
  });

  ipcMain.handle("scarlet-reel:open", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const res = await dialog.showOpenDialog(win ?? undefined, {
      title: "Open case",
      defaultPath: lastCaseDir || app.getPath("documents"),
      properties: ["openFile"],
      filters: [
        { name: "Scarlet Reel case", extensions: ["screel", "json"] },
        { name: "All files", extensions: ["*"] },
      ],
    });
    if (res.canceled || !res.filePaths[0]) return { canceled: true };
    const filePath = res.filePaths[0];
    const buf = await fs.readFile(filePath);
    lastCaseDir = path.dirname(filePath);
    if (isZipBuffer(buf) || /\.screel$/i.test(filePath)) {
      const unpacked = unpackScreel(buf);
      return { canceled: false, path: filePath, storyJson: unpacked.storyJson, assets: unpacked.assets };
    }
    const text = buf.toString("utf8");
    JSON.parse(text); // refuse garbage before we ship it to the renderer
    return { canceled: false, path: filePath, storyJson: text, assets: [] };
  });
}

/** ElevenLabs voice files: strictly voices/<person>/<scene>/<line>.mp3 so the
 *  renderer can never write outside the committed voice tree. */
/** Studio uploads for the 🧱 3D sprite folder: assets/sprites3d/<name>.<ext>.
 *  Same two-mode behaviour as voices/ — dev checkouts get real repo files,
 *  packaged apps get the userData game-media folder. */
const SPRITE3D_REL_PATH_RE = /^assets\/sprites3d\/[a-z0-9][a-z0-9-]*\.(png|jpe?g|webp)$/;

const VOICE_REL_PATH_RE = /^voices\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\.mp3$/;

function registerSprite3dIpc() {
  ipcMain.handle("scarlet-media:save-sprite3d", async (_event, payload) => {
    const relativePath = String(payload?.relativePath ?? "");
    if (!SPRITE3D_REL_PATH_RE.test(relativePath)) {
      throw new Error(`Invalid 3D sprite path "${relativePath}" — expected assets/sprites3d/<name>.<png|jpg|webp>`);
    }
    const bytes = payload?.bytes;
    const buffer = Buffer.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
    if (!buffer.length) throw new Error("Sprite was empty.");

    const targets = desktopUploadTargets(relativePath);
    await Promise.all(targets.map(async (target) => {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, buffer);
    }));

    const publicTarget = targets.find((target) => target.includes(`${path.sep}public${path.sep}`));
    if (publicTarget) return { url: `/${relativePath.split(path.sep).join("/")}`, path: publicTarget };
    const target = targets[0];
    return { url: pathToFileURL(target).toString(), path: target };
  });
}

function registerVoiceIpc() {
  ipcMain.handle("scarlet-voice:save", async (_event, payload) => {
    const relativePath = String(payload?.relativePath ?? "");
    if (!VOICE_REL_PATH_RE.test(relativePath)) {
      throw new Error(`Invalid voice path "${relativePath}" — expected voices/<person>/<scene>/<line>.mp3`);
    }
    const bytes = payload?.bytes;
    const buffer = Buffer.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
    if (!buffer.length) throw new Error("Voice file was empty.");

    const targets = desktopUploadTargets(relativePath);
    await Promise.all(targets.map(async (target) => {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, buffer);
    }));

    // Same two-mode behaviour as uploads: dev checkout gets the real repo
    // files (public/ and dist/), a packaged app gets the userData folder.
    const publicTarget = targets.find((target) => target.includes(`${path.sep}public${path.sep}`));
    if (publicTarget) return { url: `/${relativePath.split(path.sep).join("/")}`, path: publicTarget };
    const target = targets[0];
    return { url: pathToFileURL(target).toString(), path: target };
  });

  /** Read a voice MP3 back for self-contained exports. Packaged apps store
   *  voice references as file:// URLs (userData), which the renderer cannot
   *  fetch cross-origin — main reads it. The URL must resolve inside one of
   *  the voices roots; anything else is refused. */
  ipcMain.handle("scarlet-voice:read", async (_event, fileUrl) => {
    const raw = String(fileUrl ?? "");
    if (!raw.startsWith("file://")) throw new Error("Only file:// voice URLs can be read.");
    let resolved;
    try {
      resolved = path.normalize(fileURLToPath(raw));
    } catch {
      throw new Error("Invalid voice file URL.");
    }
    if (!resolved.toLowerCase().endsWith(".mp3")) throw new Error("Voice files must be .mp3.");

    const roots = [path.join(app.getPath("userData"), "game-media", "voices")];
    if (!app.isPackaged) {
      roots.push(path.join(app.getAppPath(), "public", "voices"));
      roots.push(path.join(app.getAppPath(), "dist", "voices"));
    }
    const allowed = roots.some((root) => resolved.startsWith(root + path.sep));
    if (!allowed) throw new Error("Voice file is outside the voices folder.");

    const buffer = await fs.readFile(resolved);
    return { base64: buffer.toString("base64"), size: buffer.length, name: path.basename(resolved) };
  });

  /** List every MP3 already on disk for one person (voices/<person>/<scene>/…),
   *  newest first, so Studio can reuse a line generated for another scene.
   *  Roots mirror scarlet-voice:read — in dev the repo's public/ and dist/
   *  voices trees (returned as /voices/… URLs, preferred), plus the userData
   *  game-media folder a packaged build writes to (returned as file:// URLs). */
  ipcMain.handle("scarlet-voice:list", async (_event, personRaw) => {
    const person = String(personRaw ?? "");
    if (!/^[A-Za-z0-9._-]+$/.test(person)) throw new Error("Invalid voice person slug.");

    const roots = [];
    if (!app.isPackaged) {
      roots.push({ dir: path.join(app.getAppPath(), "public", "voices"), web: true });
      roots.push({ dir: path.join(app.getAppPath(), "dist", "voices"), web: true });
    }
    roots.push({ dir: path.join(app.getPath("userData"), "game-media", "voices"), web: false });

    const out = [];
    const seen = new Set();
    for (const root of roots) {
      const personDir = path.join(root.dir, person);
      let scenes;
      try {
        scenes = await fs.readdir(personDir, { withFileTypes: true });
      } catch {
        continue; // this root holds nothing for this person
      }
      for (const scene of scenes) {
        if (!scene.isDirectory()) continue;
        const sceneDir = path.join(personDir, scene.name);
        let files;
        try {
          files = await fs.readdir(sceneDir, { withFileTypes: true });
        } catch {
          continue;
        }
        for (const file of files) {
          if (!file.isFile() || !file.name.toLowerCase().endsWith(".mp3")) continue;
          const relPath = `voices/${person}/${scene.name}/${file.name}`;
          if (seen.has(relPath)) continue;
          seen.add(relPath);
          const abs = path.join(sceneDir, file.name);
          const stat = await fs.stat(abs).catch(() => null);
          out.push({
            relPath,
            scene: scene.name,
            name: file.name,
            size: stat ? stat.size : 0,
            mtime: stat ? stat.mtimeMs : 0,
            url: root.web ? `/${relPath}` : pathToFileURL(abs).toString(),
          });
        }
      }
    }
    out.sort((a, b) => b.mtime - a.mtime);
    return out;
  });
}

function registerWindowIpc() {
  ipcMain.handle("scarlet-window:set-fullscreen", (event, enabled) => {
    const win = windowFromEvent(event);
    if (!win) return false;
    win.setFullScreen(!!enabled);
    return win.isFullScreen();
  });

  ipcMain.handle("scarlet-window:is-fullscreen", (event) => {
    const win = windowFromEvent(event);
    return !!win?.isFullScreen();
  });

  ipcMain.handle("scarlet-window:set-size", (event, size) => {
    const win = windowFromEvent(event);
    if (!win) return { width: 0, height: 0 };
    const width = Math.max(800, Math.min(7680, Math.round(Number(size?.width) || 1280)));
    const height = Math.max(600, Math.min(4320, Math.round(Number(size?.height) || 720)));
    if (win.isFullScreen()) win.setFullScreen(false);
    win.setSize(width, height, true);
    win.center();
    const [actualWidth, actualHeight] = win.getSize();
    return { width: actualWidth, height: actualHeight };
  });

  ipcMain.handle("scarlet-app:quit", () => {
    app.quit();
  });
}

function configureWindow(win) {
  if (win[CONFIGURED]) return;
  win[CONFIGURED] = true;

  win.webContents.on("before-input-event", (event, input) => {
    const key = String(input.key || "").toLowerCase();
    const toggleFullscreen =
      input.type === "keyDown" &&
      (key === "f11" || (process.platform === "darwin" && input.control && input.meta && key === "f"));
    if (!toggleFullscreen) return;
    event.preventDefault();
    win.setFullScreen(!win.isFullScreen());
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalUrl(url)) {
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        title: APP_NAME,
        backgroundColor: "#05050a",
        autoHideMenuBar: false,
          width: 1440,
          height: 900,
          minWidth: 1024,
          minHeight: 700,
          fullscreen: shouldOpenFullscreen(),
          show: false,
          webPreferences: webPreferences(),
        },
      };
    }

    if (/^https?:/i.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (isInternalUrl(url)) return;
    event.preventDefault();
    if (/^https?:/i.test(url)) void shell.openExternal(url);
  });

  win.once("ready-to-show", () => win.show());
  win.on("closed", () => windowState.delete(win));
  windowState.add(win);
}

function createWindow(url = "") {
  const win = new BrowserWindow({
    title: APP_NAME,
    backgroundColor: "#05050a",
    autoHideMenuBar: false,
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    fullscreen: shouldOpenFullscreen(),
    show: false,
    webPreferences: webPreferences(),
  });

  configureWindow(win);

  if (DEV_SERVER_URL) {
    void win.loadURL(url || DEV_SERVER_URL);
  } else if (url) {
    void win.loadURL(url);
  } else {
    void win.loadFile(DIST_INDEX);
  }

  return win;
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  registerDesktopMediaIpc();
  registerSprite3dIpc();
  registerVoiceIpc();
  registerSavesIpc();
  registerReelIpc();
  registerWindowIpc();
  registerAppMenu();

  // Windows opened by the web app (Studio playtests use window.open) are
  // created by Electron, not by createWindow(), so apply the same security,
  // external-link and ready-to-show handling to every BrowserWindow.
  app.on("browser-window-created", (_event, win) => configureWindow(win));

  app.on("second-instance", (_event, argv) => {
    const existing = [...windowState][0];
    if (existing) {
      if (existing.isMinimized()) existing.restore();
      existing.focus();
      return;
    }

    const deepLink = argv.find((arg) => arg.startsWith(DIST_INDEX_URL) || arg.startsWith("scarlet-reel://"));
    createWindow(deepLink && deepLink.startsWith(DIST_INDEX_URL) ? deepLink : undefined);
  });

  app.whenReady().then(() => {
    app.setName(APP_NAME);
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
