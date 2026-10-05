/**
 * quakeMath — the pure first-person movement math for the Quake-style
 * stage (src/game/QuakeStage.tsx). Kept DOM-free so the engine tests can
 * pin the contract: W walks where the camera LOOKS, D strafes to the
 * camera's RIGHT, for every heading. (An earlier mirror-image formula
 * made the controls read back-to-front once you turned — the tests below
 * are the regression.)
 *
 * World axes: +x east, +z south; heading 0 faces −z (three.js camera
 * default), positive heading turns LEFT (counter-clockwise from above).
 */

/** The unit vector the camera looks along at `heading`. */
export function quakeForward(heading: number): { x: number; z: number } {
  return { x: -Math.sin(heading), z: -Math.cos(heading) };
}

/** The camera's right-hand unit vector at `heading`. */
export function quakeRight(heading: number): { x: number; z: number } {
  return { x: Math.cos(heading), z: -Math.sin(heading) };
}

/** Movement delta for forward input `f` (+1 = W) and strafe `s` (+1 = D). */
export function quakeMoveDelta(
  heading: number,
  f: number,
  s: number
): { dx: number; dz: number } {
  const fw = quakeForward(heading);
  const rt = quakeRight(heading);
  return { dx: fw.x * f + rt.x * s, dz: fw.z * f + rt.z * s };
}

/** Parse a quake prop value "url" | "url@height" | "url@height@yawDeg".
 *  Height is world units (2.05 = door), yaw is degrees of static facing
 *  (0 = the quad faces +z/south; 90 = faces +x/east). Props are STATIC
 *  upright quads — never billboards — so doors stay put while you move. */
export function quakePropSpec(value: string): { url: string; height: number; yaw: number } {
  const parts = value.split("@");
  return {
    url: parts[0],
    height: parts[1] ? parseFloat(parts[1]) || 2.05 : 2.05,
    yaw: parts[2] ? ((parseFloat(parts[2]) || 0) * Math.PI) / 180 : 0,
  };
}
