import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { inflateSync } from "node:zlib";
import { createHash } from "node:crypto";
import { createFpsSettings } from "../../src/game/fps/presets";
import { directionFrame } from "../../src/game/fps/simulation";
import {
  actorAnimation,
  weaponViewTransform,
} from "../../src/game/fps/spritePresentation";

/** Tiny decoder for the known shipped RGBA8 PNG format; no new test dependency. */
function png(path: string) {
  const bytes = readFileSync(path),
    parts: Buffer[] = [];
  assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  let width = 0,
    height = 0;
  for (let at = 8; at < bytes.length; ) {
    const length = bytes.readUInt32BE(at),
      type = bytes.toString("ascii", at + 4, at + 8),
      data = bytes.subarray(at + 8, at + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.equal(data[8], 8);
      assert.equal(data[9], 6);
      assert.equal(data[12], 0);
    }
    if (type === "IDAT") parts.push(data);
    at += length + 12;
  }
  const stride = width * 4,
    raw = inflateSync(Buffer.concat(parts)),
    pixels = Buffer.alloc(stride * height);
  const paeth = (a: number, b: number, c: number) => {
    const p = a + b - c,
      pa = Math.abs(p - a),
      pb = Math.abs(p - b),
      pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y++)
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x,
        left = x >= 4 ? pixels[i - 4] : 0,
        up = y ? pixels[i - stride] : 0,
        corner = y && x >= 4 ? pixels[i - stride - 4] : 0,
        filter = raw[y * (stride + 1)];
      assert(filter <= 4);
      const correction =
        filter === 1
          ? left
          : filter === 2
            ? up
            : filter === 3
              ? Math.floor((left + up) / 2)
              : filter === 4
                ? paeth(left, up, corner)
                : 0;
      pixels[i] = (raw[y * (stride + 1) + 1 + x] + correction) & 255;
    }
  return { width, height, pixels, bytes };
}
function frameBounds(
  image: ReturnType<typeof png>,
  index: number,
  size: number,
) {
  const cols = image.width / size,
    fx = (index % cols) * size,
    fy = Math.floor(index / cols) * size;
  let left = size,
    right = -1,
    top = size,
    bottom = -1,
    count = 0;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (image.pixels[((fy + y) * image.width + fx + x) * 4 + 3]) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
        count++;
      }
  return { left, right, top, bottom, count };
}
export function checkSpriteArt(check: (name: string, run: () => void) => void) {
  const root = resolve("public/img/hollywood-opening");
  const manifest = JSON.parse(
    readFileSync(resolve(root, "sprites-v3-manifest.json"), "utf8"),
  );
  const entries = Object.values({
    ...manifest.enemies,
    ...manifest.weapons,
    ...manifest.props,
  }) as { file: string; width: number; height: number; sha256: string }[];
  const images = new Map(
    entries.map((e) => [e.file, png(resolve(root, e.file))]),
  );
  check(
    "classic sprite outputs match their manifest and contain only opaque/cutout pixels",
    () => {
      for (const e of entries) {
        const im = images.get(e.file)!;
        assert.equal(im.width, e.width, e.file);
        assert.equal(im.height, e.height, e.file);
        assert.equal(
          createHash("sha256").update(im.bytes).digest("hex"),
          e.sha256,
          e.file,
        );
        const colors = new Set<string>();
        let opaque = 0,
          transparent = 0;
        for (let i = 0; i < im.pixels.length; i += 4) {
          const [r, g, b, a] = im.pixels.subarray(i, i + 4);
          assert(a === 0 || a === 255, `${e.file}: soft alpha fringe`);
          if (a) {
            opaque++;
            colors.add(`${r},${g},${b}`);
            assert(
              !(r > g * 1.8 && b > g * 1.8 && Math.min(r, b) > 30),
              `${e.file}: magenta spill`,
            );
          } else transparent++;
        }
        assert(colors.size <= 128, `${e.file}: not palette limited`);
        assert(opaque > 30 && transparent > 0, e.file);
      }
    },
  );
  check(
    "retained v2 sprite files still match their historical manifest",
    () => {
      const old = JSON.parse(
        readFileSync(resolve(root, "sprites-v2-manifest.json"), "utf8"),
      );
      for (const item of Object.values({
        ...old.enemies,
        ...old.weapons,
        ...old.props,
      }) as { file: string; sha256: string }[])
        assert.equal(
          createHash("sha256")
            .update(readFileSync(resolve(root, item.file)))
            .digest("hex"),
          item.sha256,
          item.file,
        );
    },
  );
  const f = createFpsSettings();
  check(
    "classic enemy atlases have 24 nonempty grounded frames and valid animation indices",
    () => {
      for (const id of ["trooper", "pigcop"]) {
        const s = f.sprites.find((s) => s.id === id)!,
          sheet = s.sheet!,
          im = images.get(`${id}-v3-sheet.png`)!;
        assert.equal(sheet.frameWidth, 96);
        assert.equal(sheet.frameHeight, 96);
        assert.equal(
          s.width,
          s.height,
          "square native frames must not be squeezed",
        );
        for (let index = 0; index < 24; index++) {
          const b = frameBounds(im, index, 96);
          assert(b.count > 40, `${id}:${index} is empty`);
          assert(
            b.left >= 1 && b.right <= 94 && b.top >= 1,
            `${id}:${index} clipped`,
          );
          assert(
            b.bottom >= 91 && b.bottom <= 94,
            `${id}:${index} floating feet`,
          );
        }
        for (const a of Object.values(sheet.animations))
          for (const frame of a.frames) assert(frame >= 0 && frame < 24);
        for (let d = 0; d < 4; d++) {
          assert.equal(sheet.animations[`death-${d}`].loop, false);
          assert.equal(sheet.animations[`death-${d}`].frames.length, 2);
        }
        assert.equal(
          s.radius,
          0.34,
          "art pass must not change the combat capsule",
        );
      }
    },
  );
  check(
    "profile rows match the engine heading convention and mirror cleanly",
    () => {
      assert.equal(directionFrame(0, 0, 0, -2, 0), 1);
      assert.equal(directionFrame(0, 0, 0, 2, 0), 3);
      for (const id of ["trooper", "pigcop"]) {
        const im = images.get(`${id}-v3-sheet.png`)!;
        for (let frame = 0; frame < 6; frame++)
          for (let y = 0; y < 96; y++)
            for (let x = 0; x < 96; x++) {
              const left = ((96 + y) * im.width + frame * 96 + x) * 4,
                right = ((288 + y) * im.width + frame * 96 + 95 - x) * 4;
              assert(
                im.pixels
                  .subarray(left, left + 4)
                  .equals(im.pixels.subarray(right, right + 4)),
                `${id}: mismatched side frames`,
              );
            }
      }
    },
  );
  check(
    "v3 front walks use distinct drawn poses and preserve textured shade ramps",
    () => {
      for (const id of ["trooper", "pigcop"]) {
        const im = images.get(`${id}-v3-sheet.png`)!;
        const colors = new Set<string>();
        let different = 0;
        for (let y = 0; y < 96; y++)
          for (let x = 0; x < 96; x++) {
            const a = (y * im.width + x) * 4,
              b = (y * im.width + 96 + x) * 4;
            if (
              !im.pixels.subarray(a, a + 4).equals(im.pixels.subarray(b, b + 4))
            )
              different++;
            if (im.pixels[a + 3])
              colors.add(im.pixels.subarray(a, a + 3).toString("hex"));
          }
        assert(different > 500, `${id}: front gait was not replaced`);
        assert(colors.size > 65, `${id}: missing textured shading`);
      }
    },
  );
  check(
    "weapon framing defaults remain compatible; classic views are smaller and nearer the sight line",
    () => {
      const old = weaponViewTransform(1.5);
      assert.deepEqual(old, { width: 1.1, height: 1.7, x: 0.32, y: -0.55 });
      for (const w of f.weapons) {
        const v = weaponViewTransform(1.5, w.view);
        assert(v.height < old.height);
        assert(Math.abs(v.x) < old.x);
        assert.equal(w.sheet?.frameWidth, 128);
        assert.equal(w.sheet?.frameHeight, 128);
      }
      const mobile = weaponViewTransform(0.5, f.weapons[0].view);
      assert(Number.isFinite(mobile.width) && mobile.width < 2);
    },
  );
  check(
    "stationary enemies stop walking, while movement, attacks and death choose the right animation",
    () => {
      const a = { hp: 60, attackAt: 0 };
      assert.equal(actorAnimation(a, "enemy", 2, false, 5), "idle");
      assert.equal(actorAnimation(a, "enemy", 2, true, 5), "walk");
      assert.equal(
        actorAnimation({ ...a, attackAt: 6.95 }, "enemy", 2, true, 5),
        "attack",
      );
      assert.equal(
        actorAnimation({ ...a, hp: 0 }, "enemy", 2, true, 5),
        "death",
      );
    },
  );
  check(
    "v1 atlas layouts remain available for existing drafts and portable games",
    () => {
      for (const id of ["trooper", "pigcop"]) {
        const im = readFileSync(resolve(root, `${id}-sheet.png`));
        assert.equal(im.readUInt32BE(16), 512);
        assert.equal(im.readUInt32BE(20), 512);
      }
      for (const id of ["pistol", "shotgun"]) {
        const im = readFileSync(resolve(root, `${id}-sheet.png`));
        assert.equal(im.readUInt32BE(16), 1024);
        assert.equal(im.readUInt32BE(20), 256);
      }
    },
  );
}
