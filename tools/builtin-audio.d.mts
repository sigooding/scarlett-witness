/**
 * Declarations for tools/builtin-audio.mjs (same pattern as
 * tools/vite-animatic-export.d.mts — the tool is plain JS so Vite's config
 * loader can run it).
 */

export interface BuiltinAudioEntry {
  /** stable public path, e.g. "/film/sfx/crossing.mp3" */
  url: string;
  /** file name without its extension */
  label: string;
  /** folder relative to public/, e.g. "film/sfx" */
  folder: string;
  /** picker heading this folder belongs under */
  section: string;
  /** section order */
  rank: number;
  /** set for the voices tree: the person slug the take belongs to */
  person?: string;
  /** set for the voices tree: the scene folder under that person */
  scene?: string;
}

export declare const AUDIO_EXTS: string[];
export declare function audioRoots(): { dir: string; prefix: string }[];
export declare function defaultRoot(): string;
export declare function sectionFor(folder: string): { name: string; rank: number };
export declare function labelFor(name: string): string;
export declare function scanBuiltinAudio(root?: string): BuiltinAudioEntry[];
