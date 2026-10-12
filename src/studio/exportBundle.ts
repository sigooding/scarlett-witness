import { assetUrl } from "../assetPath";
import { collectStoryAssetIds, loadStoryAssetsForExport } from "../data/mediaLibrary";
import { visitStoryMediaFields } from "../data/storyMedia";
import type { AssetType, MediaAsset, Story } from "../types";

export interface PortableStoryBundle {
  story: Story;
  assets: MediaAsset[];
  /** Failed file reads and missing library rows. Never silently claim completeness. */
  missing: string[];
}

const MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", svg: "image/svg+xml",
  gif: "image/gif", avif: "image/avif", bmp: "image/bmp", mp3: "audio/mpeg", wav: "audio/wav",
  ogg: "audio/ogg", opus: "audio/opus", flac: "audio/flac", m4a: "audio/mp4", aac: "audio/aac",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
};
const unwrap = (value: string) => {
  const prefix = value.startsWith("video:") ? "video:" : value.startsWith("mp3:") ? "mp3:" : "";
  return { prefix, raw: value.slice(prefix.length) };
};
const isFile = (value: string) => !/^(?:asset:|data:|emoji:|gradient:)/i.test(value);

async function readFile(value: string, kind: AssetType): Promise<Omit<MediaAsset, "id" | "uploadedAt">> {
  const ext = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(value)?.[1]?.toLowerCase() ?? "";
  let name = value.split(/[?#]/)[0].split("/").pop() || `media.${ext || "bin"}`;
  let mime = MIME[ext];
  let bytes: Uint8Array;
  if (value.startsWith("file://") && typeof window !== "undefined" && window.scarletReelDesktop?.readVoice) {
    // Existing desktop bridge is scoped to files the app can read. Never add
    // an unrestricted filesystem endpoint for web exports.
    const result = await window.scarletReelDesktop.readVoice(value);
    if (!result?.base64) throw new Error("File is unavailable on this machine");
    name = result.name || name;
    mime ||= MIME[name.split(".").pop()?.toLowerCase() ?? ""] || "application/octet-stream";
    bytes = Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0));
  } else {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(assetUrl(value), { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
      // Vite/static SPA hosts often return index.html with 200 for missing
      // assets. Bundling that page as an image would make a false success.
      if (contentType === "text/html" || contentType === "application/xhtml+xml") throw new Error("Received an HTML fallback, not media");
      if (contentType && /^(image|audio|video)\//.test(contentType)) mime = contentType;
      bytes = new Uint8Array(await response.arrayBuffer());
    } finally {
      clearTimeout(timeout);
    }
  }
  if (!bytes.byteLength) throw new Error("Empty media file");
  // Some static hosts send their fallback with an incorrect MIME type.
  // Sniff just the prefix; SVG/XML artwork is deliberately not rejected.
  const prefix = new TextDecoder().decode(bytes.subarray(0, 512)).trimStart();
  if (/^(?:<!--[^]*?-->\s*)*(?:<!doctype\s+html\b|<html\b)/i.test(prefix)) throw new Error("Received an HTML fallback, not media");
  mime ||= "application/octet-stream";
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const type = mime.startsWith("video/") ? "video" : mime.startsWith("audio/") ? "audio" : mime.startsWith("image/") ? "image" : kind;
  return { name, type, dataUrl: `data:${mime};base64,${btoa(binary)}`, size: bytes.byteLength };
}

/** Bundle ALL referenced files, not just /voices/*.mp3. Shared paths are read
 * once; four workers bound memory/network pressure. Root paths are rewritten
 * through assetUrl, so Studio exports also work from project subdirectories.
 * Does not mutate the draft, create library rows, or replace a failed URL. */
export async function bundleStoryFileRefs(story: Story): Promise<PortableStoryBundle> {
  const next: Story = JSON.parse(JSON.stringify(story));
  const refs = new Map<string, AssetType>();
  visitStoryMediaFields(next, ({ value, kind }) => {
    const { raw } = unwrap(value);
    if (isFile(raw)) refs.set(raw, kind);
  });
  const entries = [...refs];
  const results = new Map<string, MediaAsset>();
  const failed = new Set<string>();
  const stamp = Date.now();
  const nonce = Math.random().toString(36).slice(2);
  let cursor = 0;
  const worker = async () => {
    while (cursor < entries.length) {
      const index = cursor++;
      const [ref, kind] = entries[index];
      try {
        results.set(ref, { ...await readFile(ref, kind), id: `file-${stamp}-${nonce}-${index}`, uploadedAt: stamp });
      } catch {
        failed.add(ref);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, entries.length) }, worker));
  visitStoryMediaFields(next, ({ value, set }) => {
    const { raw, prefix } = unwrap(value);
    const asset = results.get(raw);
    if (asset) set(`${prefix}asset:${asset.id}`);
  });
  return { story: next, assets: entries.flatMap(([ref]) => results.get(ref) ? [results.get(ref)!] : []), missing: entries.filter(([ref]) => failed.has(ref)).map(([ref]) => ref) };
}

/** How many different files an export of this story has to fetch and embed (uploads and inline data are already in the library). */
export function countExportFiles(story: Story): number {
  const files = new Set<string>();
  visitStoryMediaFields(story, ({ value }) => {
    const { raw } = unwrap(value);
    if (isFile(raw)) files.add(raw);
  });
  return files.size;
}
/** Past this many files an export is a long wait and a very large file (the whole film is about 390 MB and two minutes), so the Studio asks first. */
export const LARGE_EXPORT_FILES = 300;

/** A complete Studio/individual-newsstand export: uploaded rows + inline
 * assets + local/remote media files, with original ids preserved for imports. */
export async function createPortableStoryBundle(story: Story): Promise<PortableStoryBundle> {
  const snapshot: Story = JSON.parse(JSON.stringify(story));
  const [library, files] = await Promise.all([loadStoryAssetsForExport(snapshot), bundleStoryFileRefs(snapshot)]);
  const assets = new Map<string, MediaAsset>();
  for (const { fileUrl: _fileUrl, ...asset } of [...snapshot.assets ?? [], ...library, ...files.assets]) {
    // A row with a missing payload is not a successfully bundled asset.
    if (typeof asset.dataUrl === "string" && /^data:[^,]*,.+/.test(asset.dataUrl)) assets.set(asset.id, asset);
  }
  const missing = [...files.missing];
  for (const assetId of collectStoryAssetIds(files.story)) if (!assets.has(assetId)) missing.push(`asset:${assetId}`);
  delete files.story.assets;
  return { story: files.story, assets: [...assets.values()], missing };
}


/** A portable HD reel can contain tens of MB of base64. Laying all of it out
 * in a wrapping textarea can freeze Chromium for minutes. Preview only;
 * Download and Copy always retain the complete payload. */
export const EXPORT_PREVIEW_LIMIT = 200_000;
export function exportPreviewText(payload: string): string {
  return payload.length <= EXPORT_PREVIEW_LIMIT ? payload : payload.slice(0, EXPORT_PREVIEW_LIMIT) +
    "\n\n[… PREVIEW TRUNCATED — use Download or Copy JSON for the complete, valid reel file.]";
}
