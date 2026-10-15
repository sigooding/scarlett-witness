/** The Studio's built-in image library scan (see tools/builtin-images.mjs). */
export interface BuiltinImage {
  /** stable public path, e.g. "/img/bg-office.jpg" */
  url: string;
  /** human-readable label derived from the file name (see labelFor) */
  label: string;
  /** public prefix of the root this file lives under, e.g. "/film/img" */
  prefix: string;
  /** set for files only some pickers offer by default ("film-img", "film-depth") */
  group?: string;
}
export declare const IMAGE_ROOTS: { dir: string; prefix: string; group?: string }[];
export declare function labelFor(rel: string): string;
export declare function scanBuiltinImages(): BuiltinImage[];
