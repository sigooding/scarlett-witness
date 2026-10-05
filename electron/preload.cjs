const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("scarletReelDesktop", {
  /**
   * Copy an uploaded Studio file into the desktop game-media folder.
   * Returns a URL the renderer can store in the media library and load later.
   */
  saveUpload(payload) {
    return ipcRenderer.invoke("scarlet-media:save-upload", payload);
  },
  /**
   * Copy an uploaded 3D prop/texture into the sprites3d folder
   * (assets/sprites3d/<name>.<ext>) so it becomes a committable repo file.
   */
  saveSprite3d(payload) {
    return ipcRenderer.invoke("scarlet-media:save-sprite3d", payload);
  },
  /**
   * Copy a generated ElevenLabs voice line into the voices folder
   * (voices/<person>/<scene>/<line>.mp3) so it is a real, committable file.
   */
  saveVoice(payload) {
    return ipcRenderer.invoke("scarlet-voice:save", payload);
  },
  /**
   * Read a voice MP3 back (file:// URL from the packaged app's game-media
   * folder) so exports can bundle it. Validated on the main side.
   */
  readVoice(fileUrl) {
    return ipcRenderer.invoke("scarlet-voice:read", fileUrl);
  },
  /**
   * List every MP3 already on disk for one person (voices/<person>/…), across
   * all their scenes, newest first — used by the beat's voice picker.
   */
  listVoices(person) {
    return ipcRenderer.invoke("scarlet-voice:list", person);
  },
  setFullscreen(enabled) {
    return ipcRenderer.invoke("scarlet-window:set-fullscreen", !!enabled);
  },
  isFullscreen() {
    return ipcRenderer.invoke("scarlet-window:is-fullscreen");
  },
  setWindowSize(width, height) {
    return ipcRenderer.invoke("scarlet-window:set-size", { width, height });
  },
  quit() {
    return ipcRenderer.invoke("scarlet-app:quit");
  },
  /* ---- player save files (real .sreel files the player can see/keep) ---- */
  savesDir() {
    return ipcRenderer.invoke("scarlet-saves:dir");
  },
  saveGameFile(payload) {
    return ipcRenderer.invoke("scarlet-saves:write", payload);
  },
  listSaveFiles(storyId) {
    return ipcRenderer.invoke("scarlet-saves:list", storyId);
  },
  exportSaveFile(payload) {
    return ipcRenderer.invoke("scarlet-saves:export", payload);
  },
  importSaveFile() {
    return ipcRenderer.invoke("scarlet-saves:import");
  },
  openSavesDir() {
    return ipcRenderer.invoke("scarlet-saves:open-dir");
  },
  onMenu(cb) {
    const listener = (_event, action) => cb(action);
    ipcRenderer.on("scarlet-menu", listener);
    return () => ipcRenderer.removeListener("scarlet-menu", listener);
  },
  /* ---- author case files (real .screel / .reel.json on disk) ---- */
  setAppMode(mode) {
    return ipcRenderer.invoke("scarlet-app:set-mode", mode);
  },
  saveCaseFile(payload) {
    return ipcRenderer.invoke("scarlet-reel:save", payload);
  },
  openCaseFile() {
    return ipcRenderer.invoke("scarlet-reel:open");
  },
});
