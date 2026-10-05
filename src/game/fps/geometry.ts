import type { FpsDetail, FpsTile } from "./types";

/** Evaluate a tile at a *local* coordinate. Geometry uses 0/1 at the corners;
 * collision uses the fractional world position. Keep these paths identical. */
export function tileFloor(t: FpsTile, x: number, z: number) {
  return (t.floor ?? 0) + (t.slope?.x ?? 0) * x + (t.slope?.z ?? 0) * z;
}
export function detailContains(d: FpsDetail, x: number, z: number, radius = 0) {
  return Math.abs(x - d.x) < d.width / 2 + radius &&
    Math.abs(z - d.z) < d.depth / 2 + radius;
}
export function detailTop(d: FpsDetail, x: number, z: number) {
  const localX = Math.max(0, Math.min(d.width, x - d.x + d.width / 2));
  const localZ = Math.max(0, Math.min(d.depth, z - d.z + d.depth / 2));
  return d.bottom + d.height + (d.slope?.x ?? 0) * localX + (d.slope?.z ?? 0) * localZ;
}

export interface SurfaceQuad {
  vertices: [number, number, number][];
  material?: string;
  shade: number;
  /** World-aligned UV coordinates, multiplied by material.repeat on upload. */
  uv: [number, number][];
  /** Translucent water surface, rendered separately with its own material. */
  kind?: "water";
}

/** DOM-free mesher. Interior faces belong to the room they face, not the
 * generic solid cell; portal soffits close the gaps between unequal ceilings. */
export function mapQuads(
  width: number,
  height: number,
  get: (x: number, z: number) => FpsTile,
): SurfaceQuad[] {
  const quads: SurfaceQuad[] = [];
  const emit = (vertices: SurfaceQuad["vertices"], material: string | undefined, shade: number, uv: SurfaceQuad["uv"]) =>
    quads.push({ vertices, material, shade, uv });
  for (let z = 0; z < height; z++) for (let x = 0; x < width; x++) {
    const t = get(x, z), light = t.light ?? 0.82;
    const corners: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const top = t.solid ? t.wallHeight ?? 10 : undefined;
    emit(corners.map(([u, v]) => [x + u, top ?? tileFloor(t, u, v), z + v]),
      t.solid ? t.wallMaterial : t.floorMaterial, light * (t.solid ? 0.9 : 1),
      corners.map(([u, v]) => [x + u, z + v]));
    if (!t.solid && t.ceiling != null)
      emit(corners.map(([u, v]) => [x + u, t.ceiling!, z + v]), t.ceilingMaterial, light * 0.68,
        corners.map(([u, v]) => [x + u, z + v]));

    if (!t.solid && t.water !== undefined)
      quads.push({
        vertices: corners.map(([u, v]) => [x + u, t.water!, z + v]),
        shade: 1,
        uv: corners.map(([u, v]) => [x + u, z + v]),
        kind: "water",
      });

    if (!t.solid && t.roof != null)
      emit(corners.map(([u, v]) => [x + u, t.roof!, z + v]), t.wallMaterial, light,
        corners.map(([u, v]) => [x + u, z + v]));
    const edges = [
      { dx: 0, dz: -1, a: [0, 0], b: [1, 0] },
      { dx: 1, dz: 0, a: [1, 0], b: [1, 1] },
      { dx: 0, dz: 1, a: [1, 1], b: [0, 1] },
      { dx: -1, dz: 0, a: [0, 1], b: [0, 0] },
    ];
    for (const { dx, dz, a, b } of edges) {
      const n = get(x + dx, z + dz);
      const local = ([u, v]: number[]) => tileFloor(t, u, v);
      const neighbor = ([u, v]: number[]) => n.solid ? n.wallHeight ?? 10 : tileFloor(n, u - dx, v - dz);
      const wall = (loA: number, loB: number, hiA: number, hiB: number, material: string | undefined, shade: number) => {
        if (hiA <= loA + 0.00001 && hiB <= loB + 0.00001) return;
        // Slopes can cross at a shared edge. Clip to their intersection rather
        // than creating an inverted triangle below the neighboring floor.
        let aa = [...a], bb = [...b];
        if (hiA < loA || hiB < loB) {
          const ra = hiA - loA, rb = hiB - loB, ratio = ra / (ra - rb);
          const middle = [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio];
          const y = loA + (loB - loA) * ratio;
          if (ra < 0) { aa = middle; loA = hiA = y; }
          else { bb = middle; loB = hiB = y; }
        }
        const along = ([u, v]: number[]) => dx ? z + v : x + u;
        emit([[x + aa[0], loA, z + aa[1]], [x + bb[0], loB, z + bb[1]],
          [x + bb[0], hiB, z + bb[1]], [x + aa[0], hiA, z + aa[1]]],
          material, shade * (dx ? 0.88 : 1),
          [[along(aa), loA], [along(bb), loB], [along(bb), hiB], [along(aa), hiA]]);
      };
      if (t.solid) {
        if (n.solid) {
          wall(neighbor(a), neighbor(b), top!, top!, t.wallMaterial, light);
        } else {
          // A low counter/parapet retains its own material. Full walls in an
          // enclosed room use that room's wall palette and sector brightness.
          const interior = n.ceiling != null && top! >= n.ceiling;
          const hi = interior ? n.ceiling! : top!;
          wall(neighbor(a), neighbor(b), hi, hi,
            interior ? n.wallMaterial ?? t.wallMaterial : t.wallMaterial,
            interior ? n.light ?? 0.82 : light);
        }
      } else if (!n.solid) {
        wall(neighbor(a), neighbor(b), local(a), local(b), t.wallMaterial, light);
        if (t.ceiling != null && (n.ceiling == null || n.ceiling > t.ceiling)) {
          const hi = t.roof ?? n.ceiling ?? Math.max(t.ceiling + 1.2, 12);
          wall(t.ceiling, t.ceiling, hi, hi, n.wallMaterial ?? t.wallMaterial, n.light ?? light);
        }
      }
    }
  }
  return quads;
}

export function detailQuads(d: FpsDetail): SurfaceQuad[] {
  const x0 = d.x - d.width / 2, x1 = d.x + d.width / 2;
  const z0 = d.z - d.depth / 2, z1 = d.z + d.depth / 2;
  const corners: [number, number][] = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const shade = d.light ?? 0.82;
  const out: SurfaceQuad[] = [{
    vertices: corners.map(([x, z]) => [x, detailTop(d, x, z), z]),
    material: d.topMaterial ?? d.material, shade,
    uv: corners.map(([x, z]) => [x, z]),
  }, {
    vertices: corners.map(([x, z]) => [x, d.bottom, z]), material: d.material, shade: shade * 0.62,
    uv: corners.map(([x, z]) => [x, z]),
  }];
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % 4], ax = i % 2 ? a[1] : a[0], bx = i % 2 ? b[1] : b[0];
    out.push({
      vertices: [[a[0], d.bottom, a[1]], [b[0], d.bottom, b[1]],
        [b[0], detailTop(d, ...b), b[1]], [a[0], detailTop(d, ...a), a[1]]] as SurfaceQuad["vertices"],
      material: d.material, shade: shade * (i % 2 ? 0.83 : 0.94),
      uv: [[ax, d.bottom], [bx, d.bottom], [bx, detailTop(d, ...b)], [ax, detailTop(d, ...a)]],
    });
  });
  return out;
}
