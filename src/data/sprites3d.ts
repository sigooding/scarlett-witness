/**
 * sprites3d — the catalogue of the 🧱 3D sprite folder.
 *
 * `public/assets/sprites3d/` is where the Quake-style mode keeps its
 * billboard/prop art (doors, cars, plants, the first-person hand…). The
 * Studio's 3D panel offers these as a PULLDOWN when assigning sprites to
 * prop letters, wall/floor textures and the hand overlay; uploads made in
 * the desktop app are written into the same folder (electron
 * `scarlet-media:save-sprite3d`) so they join this catalogue on the next
 * build, and browser uploads ride along as `asset:` references.
 */

export interface Sprite3D {
  id: string;
  url: string;
  label: string;
  /** prop = upright static quad; hand = first-person overlay. */
  kind: "prop" | "hand";
  /** sensible default world height for the prop picker. */
  h: number;
}

export const SPRITES3D: Sprite3D[] = [
  { id: "door-closed", url: "/assets/sprites3d/mta-door-closed.png", label: "Office door (closed)", kind: "prop", h: 2.1 },
  { id: "door-open", url: "/assets/sprites3d/mta-door-open.png", label: "Office door (open, dark)", kind: "prop", h: 2.1 },
  { id: "exit-door", url: "/assets/sprites3d/mta-exit-door.png", label: "Fire-exit door", kind: "prop", h: 2.1 },
  { id: "plant", url: "/assets/sprites3d/mta-plant.png", label: "Sad potted plant", kind: "prop", h: 0.8 },
  { id: "broom", url: "/assets/sprites3d/mta-broom.png", label: "Broom + mop bucket", kind: "prop", h: 0.9 },
  { id: "coffee", url: "/assets/sprites3d/mta-coffee.png", label: "Coffee machine", kind: "prop", h: 0.7 },
  { id: "desk", url: "/assets/sprites3d/mta-desk.png", label: "Desk + CRT monitor", kind: "prop", h: 1.1 },
  { id: "server-cab", url: "/assets/sprites3d/mta-server-cab.png", label: "Server cabinet", kind: "prop", h: 2.0 },
  { id: "car", url: "/assets/sprites3d/mta-car.png", label: "Oatmeal sedan", kind: "prop", h: 1.1 },
  { id: "dumpster", url: "/assets/sprites3d/mta-dumpster.png", label: "Dumpster", kind: "prop", h: 1.0 },
  { id: "vent", url: "/assets/sprites3d/mta-vent.png", label: "Rooftop HVAC unit", kind: "prop", h: 1.0 },
  { id: "antenna", url: "/assets/sprites3d/mta-antenna.png", label: "Antenna + hanging mic", kind: "prop", h: 2.6 },
  { id: "hand-report", url: "/assets/sprites3d/mta-hand-report.png", label: "Matt's hand + report", kind: "hand", h: 0 },
];

/** Tileable wall/floor textures offered by the 3D panel's pulldowns. */
export const TEXTURES3D: { id: string; url: string; label: string }[] = [
  { id: "wall", url: "/img/matt/tex-wall.png", label: "Office wall paneling" },
  { id: "carpet", url: "/img/matt/tex-carpet.png", label: "Office carpet tiles" },
  { id: "concrete", url: "/img/matt/tex-concrete.png", label: "Parking concrete" },
  { id: "brick", url: "/img/matt/tex-brick.png", label: "Brick parapet" },
];

export const sprite3dByUrl = (url: string): Sprite3D | undefined =>
  SPRITES3D.find((s) => s.url === url);
