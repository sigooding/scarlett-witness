declare const __SCARLET_REEL_BUILD_ID__: string;

/* Type the build-time virtual module injected by the `builtin-images` Vite
 * plugin in vite.config.ts — the full list of image files under public/img. */
declare module "virtual:builtin-images" {
  export interface BuiltinImage {
    /** stable public path, e.g. "/img/bg-office.jpg" */
    url: string;
    /** human-readable label derived from the file name */
    label: string;
    /** public prefix of the root the file lives under, e.g. "/film/img" */
    prefix: string;
    /**
     * set for files only some pickers offer by default: "film-img" (Nobody's
     * Witness's own pictures) and "film-depth" (its depth maps, plates and
     * cut-outs). A picker lists such a group when the call site asks for it,
     * when the value already points into it, or when the author ticks
     * “Show every group too”.
     */
    group?: string;
  }
  const images: BuiltinImage[];
  export default images;
}

/* Type the build-time virtual module injected by the `builtin-audio` Vite
 * plugin — every audio file found under public/ (voices tree + uploads). */
declare module "virtual:builtin-audio" {
  export interface BuiltinAudio {
    /** stable public path, e.g. "/voices/jack/nwd_diner/line-1.mp3" */
    url: string;
    /** file name without its extension */
    label: string;
    /** folder relative to public/, e.g. "uploads/nobodys-witness-draft" */
    folder: string;
    /** the picker heading this folder belongs under, e.g. "Film one-shots &
     *  ambience (film/sfx)" — named by tools/builtin-audio.mjs, the one place
     *  the library's sections are defined */
    section: string;
    /** section order (uploads lead, then the film's own sound, then the rest) */
    rank: number;
    /** set for the voices tree: the person slug the take belongs to */
    person?: string;
    /** set for the voices tree: the scene folder under that person */
    scene?: string;
  }
  const audio: BuiltinAudio[];
  export default audio;
}
