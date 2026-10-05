/* ------------------------------------------------------------------ *
 *  NEON SALT — asset path helpers.
 *
 *  A LEAF module on purpose, following the whatsOwedAssets.ts precedent:
 *  exporting these from the story file itself created an import cycle that
 *  TypeScript accepted and the runtime did not ("fx is not a function",
 *  every story failing to load). Keeping the helpers dependency-free means
 *  any scene file can import them safely.
 * ------------------------------------------------------------------ */

/** Story plates — painted 16:9 JPEGs. */
export const img = (n: string) => `/img/neon-salt/${n}.jpg`;

/** Animated foreground FX overlays — REAL alpha PNGs, built by
 *  scripts/art-room/fx-alpha.mjs. Never JPEGs: a JPEG has no alpha channel
 *  and renders as an opaque slab on the primary foreground layer. */
export const fx = (n: string) => `/img/neon-salt/fx/${n}.png`;

/** Evidence item art — flat plates on black, shown in the inventory/examine
 *  card. Plain JPEGs: these are shown as a picture, never composited. */
export const item = (n: string) => `/img/neon-salt/item-${n}.jpg`;

/** Three-pose talking cutouts (mouth closed / half / open), forged from
 *  magenta plates by scripts/art-room/forge-sheet.mjs. */
export const sprite = (n: string) => `/img/neon-salt/sprites/${n}-talk.png`;
