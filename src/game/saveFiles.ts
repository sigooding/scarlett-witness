/**
 * Player save files — real `.sreel` files the player can see, back up and
 * carry away.
 *
 * In the compiled app (and the desktop dev shell) every slot save is
 * mirrored from localStorage to a real file:
 *
 *   <user data>/saves/<story>/[<episode>/]slot-<n>.sreel
 *   (Windows: %APPDATA%/Scarlet Reel/saves/…)
 *
 * so the player can be CONFIDENT a save exists somewhere they can find it,
 * and can EXPORT one as a file at any point (e.g. when the case is closed).
 * The player can also:
 *
 *  - Export Save…     → pick a location, get a real file
 *  - Import Save…     → pick a file, resume from it
 *  - Open Saves Folder → see the files in Explorer
 *
 * In the browser the bridge doesn't exist, so all of this is a no-op and
 * saves stay in localStorage exactly as before.
 */

import { SAVE_SCHEMA } from "../logic";
import type { GameSave } from "../types";

const bridge = () => (typeof window !== "undefined" ? window.scarletReelDesktop : undefined);

/** True when the desktop save-file bridge is available (compiled app / desktop dev). */
export function saveFilesAvailable(): boolean {
  return !!bridge()?.saveGameFile;
}

/** Last few segments of a path, for toasts. */
export function tailPath(p: string, segments = 3): string {
  const parts = p.split(/[\\/]/).filter(Boolean);
  return parts.slice(-segments).join(" / ");
}

/** Mirror one slot save to disk. Returns the file path, or undefined. */
export async function writeSaveFile(slot: number, save: GameSave): Promise<string | undefined> {
  const b = bridge();
  if (!b?.saveGameFile) return undefined;
  try {
    const res = await b.saveGameFile({
      storyId: save.storyId,
      episodeId: save.episodeId,
      slot,
      saveJson: JSON.stringify(save),
    });
    return res?.path;
  } catch (err) {
    console.warn("[saves] Could not write the save file.", err);
    return undefined;
  }
}

function suggestedSaveName(save: GameSave): string {
  const clean = (s: string) => s.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 60);
  const stamp = new Date(save.savedAt || Date.now()).toISOString().replace("T", "_").replace(/[:.]/g, "-").slice(0, 19);
  return `scarlet-reel-${clean(save.storyId)}-${clean(save.sceneTitle || "save")}-${stamp}.sreel`;
}

/** Export a save to a player-chosen location. `canceled` when they bailed. */
export async function exportSaveFile(
  save: GameSave
): Promise<{ canceled: boolean; path?: string; error?: string }> {
  const b = bridge();
  if (!b?.exportSaveFile) return { canceled: true };
  try {
    const res = await b.exportSaveFile({ suggestedName: suggestedSaveName(save), json: JSON.stringify(save, null, 2) });
    if (res?.canceled) return { canceled: true };
    return { canceled: false, path: res?.path };
  } catch (err) {
    return { canceled: false, error: err instanceof Error ? err.message : "Export failed." };
  }
}

/** Import a `.sreel` file the player picked; returns the validated save. */
export async function importSaveFile(): Promise<{
  canceled: boolean;
  save?: GameSave;
  path?: string;
  error?: string;
}> {
  const b = bridge();
  if (!b?.importSaveFile) return { canceled: true };
  try {
    const res = await b.importSaveFile();
    if (res?.canceled || !res?.json) return { canceled: true };
    const parsed = JSON.parse(res.json) as GameSave;
    if (!parsed || typeof parsed !== "object" || !parsed.storyId || !parsed.sceneId) {
      return { canceled: false, path: res.path, error: "That file isn't a Scarlet Reel save." };
    }
    const v = parsed.schema ?? 1;
    if (v > SAVE_SCHEMA) {
      return { canceled: false, path: res.path, error: "That save is from a newer version of the game." };
    }
    return { canceled: false, save: parsed, path: res.path };
  } catch (err) {
    return { canceled: false, error: err instanceof Error ? err.message : "Couldn't read that file." };
  }
}

/** Reveal the saves folder in the OS file manager. */
export async function openSavesDir(): Promise<void> {
  await bridge()?.openSavesDir?.();
}

/** Subscribe to the native File menu (Save/Load/Export/Import/Open folder).
 *  Returns an unsubscribe function, or undefined in the browser. */
export function onFileMenu(cb: (action: string) => void): (() => void) | undefined {
  return bridge()?.onMenu?.(cb);
}
