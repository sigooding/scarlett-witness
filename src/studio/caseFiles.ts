/**
 * Author case files — real `.screel` (zip of story.json + media/) the author
 * can see, back up and commit. Native Save / Save As / Open live in the
 * Electron main process; this module is the renderer bridge.
 *
 * `.reel.json` stays importable forever. In the browser (no bridge) Save
 * falls back to a `.reel.json` blob download — same as Studio's Export.
 */

import { dataUrlToScreelAsset, parseCaseBytes, suggestedCaseName } from "../data/screel";
import type { MediaAsset, Story } from "../types";

const bridge = () => (typeof window !== "undefined" ? window.scarletReelDesktop : undefined);

export function caseFilesAvailable(): boolean {
  return !!bridge()?.saveCaseFile;
}

export { suggestedCaseName, parseCaseBytes };

/** Last few segments of a path, for toasts. */
export function tailCasePath(p: string, segments = 3): string {
  const parts = p.split(/[\\/]/).filter(Boolean);
  return parts.slice(-segments).join(" / ");
}

export function assetsToScreelPayload(assets: MediaAsset[]) {
  return assets.filter((a) => a.dataUrl).map(dataUrlToScreelAsset);
}

export function storyJsonWithoutAssets(story: Story): string {
  const { assets: _assets, ...clean } = story as Story & { assets?: MediaAsset[] };
  return JSON.stringify(clean);
}

export async function saveCaseFile(opts: {
  story: Story;
  assets: MediaAsset[];
  /** Overwrite this path when set (Save). Omit to show Save As. */
  filePath?: string;
  suggestedName?: string;
}): Promise<{ canceled: boolean; path?: string; error?: string }> {
  const b = bridge();
  if (!b?.saveCaseFile) return { canceled: true };
  try {
    const res = await b.saveCaseFile({
      storyJson: storyJsonWithoutAssets(opts.story),
      assets: assetsToScreelPayload(opts.assets),
      filePath: opts.filePath,
      suggestedName: opts.suggestedName ?? suggestedCaseName(opts.story),
    });
    if (res?.canceled) return { canceled: true };
    return { canceled: false, path: res?.path };
  } catch (err) {
    return { canceled: false, error: err instanceof Error ? err.message : "Couldn't save that case file." };
  }
}

export async function openCaseFile(): Promise<{
  canceled: boolean;
  path?: string;
  story?: Story;
  assets?: MediaAsset[];
  error?: string;
}> {
  const b = bridge();
  if (!b?.openCaseFile) return { canceled: true };
  try {
    const res = await b.openCaseFile();
    if (res?.canceled) return { canceled: true };
    if (res?.storyJson) {
      const parsed = JSON.parse(res.storyJson) as Story;
      const { assets: embedded, ...story } = parsed as Story & { assets?: MediaAsset[] };
      return {
        canceled: false,
        path: res.path,
        story,
        assets: res.assets?.length ? res.assets : embedded ?? [],
      };
    }
    if (res?.bytesBase64) {
      const binary = Uint8Array.from(atob(res.bytesBase64), (ch) => ch.charCodeAt(0));
      const parsed = parseCaseBytes(binary, res.path ?? "");
      return { canceled: false, path: res.path, story: parsed.story, assets: parsed.assets };
    }
    return { canceled: false, error: "Nothing came back from the file picker." };
  } catch (err) {
    return { canceled: false, error: err instanceof Error ? err.message : "Couldn't read that case file." };
  }
}

export async function parseCaseFile(file: File): Promise<{ story: Story; assets: MediaAsset[] }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return parseCaseBytes(bytes, file.name);
}
