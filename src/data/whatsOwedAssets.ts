/* ------------------------------------------------------------------ *
 *  WHAT'S OWED — asset path helpers.
 *
 *  A LEAF module on purpose. The act files (whatsOwedAct1/2/3) need the
 *  fx() helper, and whatsOwed.ts imports those acts — so exporting the
 *  helper from whatsOwed.ts created a cycle. TypeScript accepted it, but
 *  at runtime the acts evaluated first and saw `fx` as undefined:
 *  "TypeError: fx is not a function", every story failing to load.
 *  Keeping the helpers dependency-free means anything can import them.
 * ------------------------------------------------------------------ */

/** Story plates — painted 16:9 JPEGs. */
export const img = (n: string) => `/img/whats-owed/${n}.jpg`;

/** Animated foreground FX overlays — REAL alpha PNGs.
 *
 * These shipped as JPEGs, a format with no alpha channel, so each was a
 * solid rectangle with the subject on flat black or flat white. Scenes hid
 * that with CSS blend modes (`screen` drops black, `multiply` drops white),
 * which tints the art toward the plate, only holds while the plate is dark
 * (or light) enough, and was impossible on the PRIMARY foreground layer,
 * which had no blendMode — there the JPEG drew as an opaque slab.
 * scripts/art-room/fx-alpha.mjs derives true alpha from luminance. */
export const fx = (n: string) => `/img/whats-owed/fx/${n}.png`;
