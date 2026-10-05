/**
 * ElevenLabs voice files — real MP3s on disk, organised per person and scene.
 *
 * Every line ElevenLabs converts is saved as a file at
 *
 *     public/voices/<person>/<scene>/<line>.mp3
 *
 * so it sits in the repo next to the rest of the story's art and can be
 * committed with it. The beat's audioUrl then points at the stable path
 * `/voices/<person>/<scene>/<line>.mp3`, which resolves in the dev server,
 * the single-file build (via assetUrl) and the packaged Electron app.
 *
 * Backends, tried in this order:
 *
 *  1. **Desktop (Electron)** — automatic, no click. The main process writes
 *     the file into `public/voices/…` (and `dist/voices/…`) in the dev
 *     checkout, or `userData/game-media/voices/…` when packaged.
 *  2. **Browser with a linked voice folder** — the File System Access API:
 *     the author picks the repo's `public/voices` folder once (the handle is
 *     persisted in IndexedDB and survives reloads) and every generated line
 *     is written straight into `<person>/<scene>/` under it.
 *  3. **Browser without a linked folder** — the old behaviour: the MP3 is
 *     kept in the media library (base64 in IndexedDB) so the line still
 *     plays, and the result note says so, because that copy is NOT in the
 *     repo and cannot be committed.
 */

import { uploadDataUrlAsset } from "../data/mediaLibrary";

/* ------------------------------- layout ------------------------------- */

/** Make a path segment from any id: lowercase-safe, no slashes, no spaces. */
export function voiceSlug(value: string): string {
  return (
    String(value || "unknown")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "unknown"
  );
}

export interface VoiceFileSpec {
  /** Repo/public-root-relative file path: `voices/<person>/<scene>/<line>.mp3`. */
  relPath: string;
  /** Root-absolute URL the player loads (`assetUrl` rewrites it per deploy). */
  url: string;
}

/** One folder per person, one sub-folder per scene — the committed layout. */
export function voiceFileSpec(characterId: string, sceneId: string, beatId: string): VoiceFileSpec {
  const relPath = `voices/${voiceSlug(characterId)}/${voiceSlug(sceneId)}/${voiceSlug(beatId)}.mp3`;
  return { relPath, url: `/${relPath}` };
}

/* ------------------------------ desktop ------------------------------ */

/** True when running inside the Electron shell (the saveUpload bridge exists). */
export function isDesktop(): boolean {
  return typeof window !== "undefined" && !!window.scarletReelDesktop;
}

export async function saveVoiceViaDesktop(
  spec: VoiceFileSpec,
  blob: Blob
): Promise<{ url?: string; path?: string } | undefined> {
  const bridge = window.scarletReelDesktop;
  if (!bridge?.saveVoice) return undefined;
  try {
    return await bridge.saveVoice({
      relativePath: spec.relPath,
      bytes: await blob.arrayBuffer(),
      name: spec.relPath.split("/").pop() ?? "line.mp3",
      mimeType: "audio/mpeg",
    });
  } catch (err) {
    console.warn("[voice-files] Desktop voice save failed — falling back.", err);
    return undefined;
  }
}

/* --------------------- browser folder (File System Access) ------------- */

/**
 * Minimal structural types for the File System Access API — the TS DOM lib
 * has the handle classes but not `showDirectoryPicker`/permission methods,
 * so we keep them here and cast at the boundary.
 */
type PermissionState = "granted" | "denied" | "prompt";

interface WritableFile {
  write(data: Blob | ArrayBuffer | string): Promise<void>;
  close(): Promise<void>;
}
interface FsFileHandle {
  createWritable(options?: { keepExistingData?: boolean }): Promise<WritableFile>;
}
/** One entry yielded while walking a directory (file or sub-folder). */
export interface FsEntry {
  kind: "file" | "directory";
  name: string;
  getFile?(): Promise<{ size: number; lastModified: number }>;
}
export interface FsDirectoryHandle {
  name: string;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FsDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FsFileHandle>;
  queryPermission?(options?: { mode?: "read" | "readwrite" }): Promise<PermissionState>;
  requestPermission?(options?: { mode?: "read" | "readwrite" }): Promise<PermissionState>;
  /** Present in every browser that ships the File System Access API. */
  values?(): AsyncIterableIterator<FsEntry>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      id?: string;
      mode?: "read" | "readwrite";
    }) => Promise<FsDirectoryHandle>;
  }
}

export function voiceFolderSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.showDirectoryPicker === "function" &&
    !isDesktop()
  );
}

/* The folder handle is persisted in its own tiny IndexedDB so a reload
   doesn't force the author to re-pick the voice folder. */
const FSA_DB = "scarlet-reel-voice-files";
const FSA_STORE = "handles";
const FSA_KEY = "voiceFolder";

let fsaDbPromise: Promise<IDBDatabase> | null = null;
function openFsaDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("File storage (IndexedDB) unavailable."));
  }
  if (fsaDbPromise) return fsaDbPromise;
  fsaDbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(FSA_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(FSA_STORE)) {
        req.result.createObjectStore(FSA_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Failed to open the voice-folder store."));
  });
  return fsaDbPromise;
}

export async function persistVoiceFolder(handle: FsDirectoryHandle): Promise<void> {
  try {
    const db = await openFsaDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FSA_STORE, "readwrite");
      tx.objectStore(FSA_STORE).put(handle, FSA_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("[voice-files] Could not persist the voice folder handle.", err);
  }
}

export async function loadPersistedVoiceFolder(): Promise<FsDirectoryHandle | null> {
  try {
    const db = await openFsaDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(FSA_STORE, "readonly").objectStore(FSA_STORE).get(FSA_KEY);
      req.onsuccess = () => resolve((req.result as FsDirectoryHandle | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function clearVoiceFolder(): Promise<void> {
  try {
    const db = await openFsaDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FSA_STORE, "readwrite");
      tx.objectStore(FSA_STORE).delete(FSA_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* nothing else to do */
  }
}

/** Ask the browser for the folder picker. Resolves null if the user cancels. */
export async function linkVoiceFolder(): Promise<FsDirectoryHandle | null> {
  if (typeof window === "undefined" || !window.showDirectoryPicker) return null;
  const handle = await window.showDirectoryPicker({ id: "scarlet-reel-voices", mode: "readwrite" });
  await persistVoiceFolder(handle);
  return handle;
}

export async function voiceFolderPermission(handle: FsDirectoryHandle): Promise<PermissionState> {
  const query = handle.queryPermission?.({ mode: "readwrite" });
  return query ? query : "prompt";
}

/** Re-request write access. Must be called from a user gesture (a click). */
export async function requestVoiceFolderPermission(handle: FsDirectoryHandle): Promise<PermissionState> {
  const request = handle.requestPermission?.({ mode: "readwrite" });
  return request ? request : voiceFolderPermission(handle);
}

/**
 * Write one generated line into the linked voice folder under
 * `<person>/<scene>/<line>.mp3`. Returns true only when the bytes are on
 * disk — the caller falls back to the media library otherwise.
 */
export async function saveVoiceToLinkedFolder(spec: VoiceFileSpec, blob: Blob): Promise<boolean> {
  const handle = await loadPersistedVoiceFolder();
  if (!handle) return false;
  let perm = await voiceFolderPermission(handle);
  if (perm === "denied") return false;
  if (perm === "prompt") {
    // The generate click IS the user gesture this needs.
    perm = await requestVoiceFolderPermission(handle);
    if (perm !== "granted") return false;
  }
  const parts = spec.relPath.split("/").filter(Boolean);
  if (parts.length < 4) return false;
  // The linked folder is the `voices` root itself: sub-path = <person>/<scene>/<line>.mp3
  const subPath = parts.slice(2);
  try {
    let dir: FsDirectoryHandle = handle;
    for (const name of subPath.slice(0, -1)) {
      dir = await dir.getDirectoryHandle(name, { create: true });
    }
    const file = await dir.getFileHandle(subPath[subPath.length - 1], { create: true });
    const writable = await file.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (err) {
    console.warn("[voice-files] Writing the voice file to the linked folder failed.", err);
    return false;
  }
}

/* ----------------------------- top level ------------------------------ */

export interface VoiceSaveResult {
  /** The audioUrl to set on the dialogue beat. */
  url: string;
  kind: "desktop" | "folder" | "library";
  /** Human-facing note shown under the Generate button. */
  note: string;
}

/**
 * Save a freshly synthesized line through the best available backend and
 * return the audioUrl the beat should carry. Throws only when the last-resort
 * media-library write also fails.
 */
export async function saveGeneratedVoice(opts: {
  storyId: string;
  characterId: string;
  sceneId: string;
  beatId: string;
  blob: Blob;
  dataUrl: string;
  /** Library asset name for the fallback: `voice-<character>-<beat>`. */
  assetName: string;
}): Promise<VoiceSaveResult> {
  const spec = voiceFileSpec(opts.characterId, opts.sceneId, opts.beatId);

  if (isDesktop()) {
    const res = await saveVoiceViaDesktop(spec, opts.blob);
    if (res?.url) {
      return {
        url: res.url,
        kind: "desktop",
        note: `MP3 saved to ${res.path ?? spec.relPath} — a real file, commit it with the story.`,
      };
    }
  }

  if (voiceFolderSupported()) {
    const written = await saveVoiceToLinkedFolder(spec, opts.blob);
    if (written) {
      return {
        url: spec.url,
        kind: "folder",
        note: `MP3 written to ${spec.relPath} in the linked voice folder — git add it when you're happy.`,
      };
    }
  }

  const result = await uploadDataUrlAsset(opts.storyId, opts.assetName, "audio", opts.dataUrl);
  if (!result.success || !result.assetId) {
    throw new Error(result.error ?? "Could not store the MP3.");
  }
  return {
    url: `asset:${result.assetId}`,
    kind: "library",
    note: `No voice file saved — not in the repo. ${
      isDesktop()
        ? "The desktop save failed; check the game folder is writable."
        : "Link the public/voices folder (AI Voice section) so MP3s are written to the repo."
    }`,
  };
}

/* --------------------------- listing a person --------------------------- */

export interface VoiceFileEntry {
  /** Repo/public-root-relative path: `voices/<person>/<scene>/<line>.mp3`. */
  relPath: string;
  /** URL the player loads — `/voices/…` in dev/web, `file://…` when packaged. */
  url: string;
  /** Folder under the person (one per scene). */
  scene: string;
  name: string;
  size: number;
  mtime: number;
}

/**
 * Every MP3 already on disk for one person, across ALL their scenes, newest
 * first — so a line can reuse a take recorded for another scene instead of
 * only seeing what was uploaded through the media library.
 *
 * Desktop asks main to walk the real voices tree (repo `public/voices`,
 * `dist/voices`, or the packaged app's game-media folder). In the browser we
 * walk the author's linked voice folder. Returns [] when neither is available;
 * callers then fall back to the uploaded-audio list.
 */
export async function listVoiceFilesForCharacter(characterId: string): Promise<VoiceFileEntry[]> {
  if (!characterId || characterId === "narrator") return [];
  const person = voiceSlug(characterId);

  const bridge = typeof window !== "undefined" ? window.scarletReelDesktop : undefined;
  if (bridge?.listVoices) {
    try {
      const files = await bridge.listVoices(person);
      return [...(files ?? [])].sort((a, b) => b.mtime - a.mtime);
    } catch (err) {
      console.warn("[voice-files] Desktop voice listing failed — trying the linked folder.", err);
    }
  }
  return listVoiceFilesFromLinkedFolder(person);
}

/** Walk `<linked voice folder>/<person>/<scene>/*.mp3` (browser only). */
async function listVoiceFilesFromLinkedFolder(person: string): Promise<VoiceFileEntry[]> {
  const root = await loadPersistedVoiceFolder();
  if (!root || typeof root.values !== "function") return [];

  let personDir: FsDirectoryHandle;
  try {
    personDir = await root.getDirectoryHandle(person);
  } catch {
    return []; // no folder for this person yet
  }
  if (typeof personDir.values !== "function") return [];

  const out: VoiceFileEntry[] = [];
  for await (const sceneEntry of personDir.values()) {
    if (sceneEntry.kind !== "directory") continue;
    let sceneDir: FsDirectoryHandle;
    try {
      sceneDir = await personDir.getDirectoryHandle(sceneEntry.name);
    } catch {
      continue;
    }
    if (typeof sceneDir.values !== "function") continue;
    for await (const fileEntry of sceneDir.values()) {
      if (fileEntry.kind !== "file" || !fileEntry.name.toLowerCase().endsWith(".mp3")) continue;
      let size = 0;
      let mtime = 0;
      try {
        const file = await fileEntry.getFile?.();
        size = file?.size ?? 0;
        mtime = file?.lastModified ?? 0;
      } catch {
        /* listing still useful without sizes */
      }
      const relPath = `voices/${person}/${sceneEntry.name}/${fileEntry.name}`;
      out.push({ relPath, url: `/${relPath}`, scene: sceneEntry.name, name: fileEntry.name, size, mtime });
    }
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}
