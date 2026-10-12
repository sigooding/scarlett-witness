declare const __SCARLET_REEL_BUILD_ID__: string;

/* Type the build-time virtual module injected by the `builtin-images` Vite
 * plugin in vite.config.ts — the full list of image files under public/img. */
declare module "virtual:builtin-images" {
  export interface BuiltinImage {
    /** stable public path, e.g. "/img/bg-office.jpg" */
    url: string;
    /** human-readable label derived from the file name */
    label: string;
    /** set for files only some pickers offer ("film-depth": the film's depth maps, plates and cut-outs) */
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
    /** set for the voices tree: the person slug the take belongs to */
    person?: string;
    /** set for the voices tree: the scene folder under that person */
    scene?: string;
  }
  const audio: BuiltinAudio[];
  export default audio;
}
