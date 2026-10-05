import { detailQuads, mapQuads } from "./geometry";
import { inventoryActive } from "./inventory";
import { actorAnimation, weaponViewTransform } from "./spritePresentation";
import * as THREE from "three";
import { assetUrl } from "../../assetPath";
import { resolveAssetReference } from "../../data/mediaLibrary";
import { sheetAnim, sheetCols, sheetFrameAt } from "../spriteSheet";
import {
  directionFrame,
  doorSlab,
  tileAt,
  type FpsWorld,
} from "./simulation";
import type { FpsEvent } from "./types";

/** Height-cell geometry + depth-tested alpha sprites. Materials are batched, not one draw per tile. */
export class FpsRenderer {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(65, 1, 0.04, 120);
  readonly renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  readonly errors: string[] = [];
  pending = 0;
  private disposed = false;
  private textures = new Map<string, THREE.Texture>();
  private clones: THREE.Texture[] = [];
  private actors = new Map<
    string,
    {
      mesh: THREE.Mesh;
      texture?: THREE.Texture;
      cols: number;
      rows: number;
      lastX: number;
      lastZ: number;
      motionUntil: number;
    }
  >();
  private doors = new Map<string, THREE.Group>();
  private worldMaterials = new Map<THREE.MeshBasicMaterial, THREE.Color>();
  private bombs: THREE.Mesh[] = [];
  private bolts: THREE.Mesh[] = [];
  private decoy?: THREE.Mesh;
  private lastPlayer = { x: 0, z: 0 };
  private bob = 0;
  private kick?: THREE.Mesh;
  private effects: {
    mesh: THREE.Mesh;
    at: number;
    explosion: boolean;
    frames: THREE.Texture[];
  }[] = [];
  private observer: ResizeObserver;
  private weapon: THREE.Mesh;
  private weaponScene = new THREE.Scene();
  private weaponCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
  private weapons = new Map<string, THREE.Texture>();
  private sky?: THREE.Mesh;
  constructor(
    mount: HTMLElement,
    readonly world: FpsWorld,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.autoClear = false;
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute("aria-label", "First-person game view");
    this.canvas.style.cssText =
      "width:100%;height:100%;display:block;image-rendering:pixelated;touch-action:none";
    mount.append(this.canvas);
    const f = world.config;
    this.scene.background = new THREE.Color(f.skyColor ?? "#252c3a");
    this.scene.fog = new THREE.Fog(
      f.skyColor ?? "#252c3a",
      (f.fogDistance ?? 65) * 0.55,
      f.fogDistance ?? 65,
    );
    if (f.skyImage) {
      const tex = this.texture(f.skyImage);
      tex.wrapS = THREE.RepeatWrapping;
      this.sky = new THREE.Mesh(
        f.skyMode === "cylinder"
          ? new THREE.CylinderGeometry(85, 85, 100, 64, 1, true)
          : new THREE.SphereGeometry(85, 32, 16),
        new THREE.MeshBasicMaterial({
          map: tex,
          side: THREE.BackSide,
          fog: false,
          depthWrite: false,
        }),
      );
      this.sky.renderOrder = -10;
      this.scene.add(this.sky);
    }
    this.buildMap();
    for (const src of f.effects?.explosionImages ?? []) this.texture(src);
    if (f.effects?.impactImage) this.texture(f.effects.impactImage);
    for (const a of world.state.actors) {
      const e = world.placements.get(a.id)!,
        def = world.definitions.get(e.sprite);
      if (!def) continue;
      const src = def.sheet?.image ?? def.image;
      let texture: THREE.Texture | undefined;
      if (def.brokenImage) this.texture(def.brokenImage);
      if (src) {
        texture = this.texture(src).clone();
        this.clones.push(texture);
      }
      const shade = def.fullbright
        ? 1
        : (tileAt(world.room, a.x, a.z).light ?? 0.82);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          map: texture,
          color: texture ? new THREE.Color(shade, shade, shade) : "#b29e5f",
          alphaTest: 0.3,
          side: THREE.FrontSide,
        }),
      );
      const s = e.scale ?? 1;
      mesh.scale.set(def.width * s, def.height * s, 1);
      mesh.position.set(a.x, a.y + (def.height * s) / 2, a.z);
      if (def.facing === "floor") {
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = a.y + 0.015;
      } else if (def.facing === "wall") mesh.rotation.y = e.yaw ?? 0;
      this.actors.set(a.id, {
        mesh,
        texture,
        cols: 1,
        rows: 1,
        lastX: a.x,
        lastZ: a.z,
        motionUntil: 0,
      });
      this.scene.add(mesh);
    }
    for (const d of f.doors) {
      const group = new THREE.Group();
      const count = d.motion === "split" ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const mat = this.material(d.material ?? "shutter", 0.8);
        const width = d.width / count;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(
          d.axis === "x" ? width : (d.depth ?? 0.24), 1,
          d.axis === "z" ? width : (d.depth ?? 0.24)), mat);
        group.add(mesh);
      }
      group.position.set(d.x, 0, d.z);
      this.scene.add(group);
      this.doors.set(d.id, group);
    }
    const holo = f.sprites.find((s) => s.id === "holo-decoy");
    if (holo?.image) {
      this.decoy = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.85),
        new THREE.MeshBasicMaterial({ map: this.texture(holo.image), transparent: true, opacity: 0.6,
          color: "#83e9ff", alphaTest: 0.15, depthWrite: false, side: THREE.DoubleSide }));
      this.decoy.visible = false;
      this.scene.add(this.decoy);
    }
    this.weaponCamera.position.z = 2;
    this.weapon = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.weaponScene.add(this.weapon);
    const kick = f.sprites.find((s) => s.id === "boot-view");
    if (kick?.image) {
      this.kick = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: this.texture(kick.image), transparent: true, depthTest: false, depthWrite: false }));
      this.kick.visible = false;
      this.weaponScene.add(this.kick);
    }
    for (const w of f.weapons) {
      const src = w.sheet?.image ?? w.image;
      if (src) {
        const texture = this.texture(src).clone();
        this.clones.push(texture);
        this.weapons.set(w.id, texture);
      }
    }
    const resize = () => {
      const aspect = Math.max(
        0.25,
        mount.clientWidth / Math.max(1, mount.clientHeight),
      );
      const height = Math.max(180, Math.min(720, f.renderHeight ?? 360));
      this.renderer.setSize(Math.round(height * aspect), height, false);
      this.camera.aspect = aspect;
      // The author controls HORIZONTAL FOV, matching the Studio label.
      this.camera.fov = THREE.MathUtils.radToDeg(
        2 *
          Math.atan(
            Math.tan(THREE.MathUtils.degToRad(world.room.fov ?? 90) / 2) /
              (f.presentation === "classic" || f.presentation === "quake" ? 4 / 3 : aspect),
          ),
      );
      this.camera.updateProjectionMatrix();
    };
    resize();
    this.observer = new ResizeObserver(resize);
    this.observer.observe(mount);
  }
  private texture(src: string): THREE.Texture {
    const existing = this.textures.get(src);
    if (existing) return existing;
    const texture = new THREE.Texture();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    this.textures.set(src, texture);
    this.pending++;
    const load = async () => {
      try {
        const url = src.startsWith("asset:")
          ? await resolveAssetReference(src)
          : assetUrl(src);
        if (!url) throw new Error(`Unresolved first-person asset: ${src}`);
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Cannot load ${src}`));
          img.src = url;
        });
        if (this.disposed) return;
        texture.image = img;
        texture.needsUpdate = true;
        // Texture clones share the source but need their initial upload flag too.
        for (const clone of this.clones)
          if (clone.source === texture.source) clone.needsUpdate = true;
      } catch (err) {
        if (!this.disposed) this.errors.push(String(err));
      } finally {
        this.pending--;
      }
    };
    void load();
    return texture;
  }
  private material(id: string | undefined, shade: number) {
    const mat = this.world.config.materials.find((m) => m.id === id);
    const color = new THREE.Color(mat?.color ?? "#ffffff").multiplyScalar(
      shade,
    );
    const material = new THREE.MeshBasicMaterial({
      map: mat?.image ? this.texture(mat.image) : undefined,
      color: mat?.fullbright ? mat.color ?? "#ffffff" : color,
      side: THREE.DoubleSide,
      transparent: (mat?.opacity ?? 1) < 1,
      opacity: mat?.opacity ?? 1,
      alphaTest: mat?.alphaTest ?? 0,
      depthWrite: (mat?.opacity ?? 1) >= 1,
    });
    if (!mat?.fullbright) this.worldMaterials.set(material, color.clone());
    return material;
  }
  private buildMap() {
    const batches = new Map<string, { positions: number[]; uv: number[]; material: THREE.Material }>();
    const q = this.world.room;
    const quads = mapQuads(q.map[0].length, q.map.length, (x, z) => tileAt(q, x, z));
    for (const d of this.world.config.details ?? []) quads.push(...detailQuads(d));
    const water: number[] = [];
    for (const face of quads) {
      if (face.kind === "water") {
        for (const i of [0, 1, 2, 0, 2, 3]) water.push(...face.vertices[i]);
        continue;
      }
      const key = `${face.material}-${face.shade.toFixed(3)}`;
      let batch = batches.get(key);
      if (!batch) {
        batch = { positions: [], uv: [], material: this.material(face.material, face.shade) };
        batches.set(key, batch);
      }
      const repeat = this.world.config.materials.find((m) => m.id === face.material)?.repeat ?? 0.5;
      for (const i of [0, 1, 2, 0, 2, 3]) {
        batch.positions.push(...face.vertices[i]);
        batch.uv.push(face.uv[i][0] * repeat, face.uv[i][1] * repeat);
      }
    }
    for (const b of batches.values()) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(b.positions, 3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
      geometry.computeBoundingSphere();
      this.scene.add(new THREE.Mesh(geometry, b.material));
    }
    if (water.length) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(water, 3));
      geometry.computeBoundingSphere();
      this.scene.add(
        new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            color: this.world.config.waterColor ?? "#3a6b63",
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
          }),
        ),
      );
    }
  }
  effect(event: FpsEvent) {
    if (!["hit", "explosion"].includes(event.type) || event.x === undefined)
      return;
    const explosion = event.type === "explosion";
    const sources = explosion
      ? (this.world.config.effects?.explosionImages ?? [])
      : this.world.config.effects?.impactImage
        ? [this.world.config.effects.impactImage]
        : [];
    const frames = sources.map((src) => this.texture(src));
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: frames[0],
        color: frames.length ? "#ffffff" : explosion ? "#ff8c25" : "#ffe4a0",
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    mesh.position.set(event.x, event.y ?? 1, event.z ?? 0);
    mesh.scale.setScalar(explosion ? 1.8 : 0.09);
    this.effects.push({ mesh, at: this.world.state.time, explosion, frames });
    this.scene.add(mesh);
  }
  draw() {
    const { player: p, time: t } = this.world.state;
    this.camera.position.set(p.x, p.y + (p.crouched ? 0.85 : 1.45), p.z);
    this.camera.rotation.set(p.pitch, p.yaw, 0, "YXZ");
    if (this.sky) {
      this.sky.position.copy(this.camera.position);
      if (this.world.config.skyMode === "cylinder") this.sky.position.y += 15;
    }
    const night = inventoryActive(p, "nightvision");
    for (const [material, base] of this.worldMaterials) {
      material.color.copy(base);
      if (night) material.color.multiplyScalar(1.9).multiply(new THREE.Color(0.55, 1.4, 0.6));
    }
    const distance = Math.hypot(p.x - this.lastPlayer.x, p.z - this.lastPlayer.z);
    if (distance < 1) this.bob += distance * 2.4;
    this.lastPlayer = { x: p.x, z: p.z };
    const motion = Math.min(1, distance * 25);
    this.camera.position.y += p.grounded ? Math.sin(this.bob * 2) * 0.026 * motion : 0;
    for (const a of this.world.state.actors) {
      const entry = this.actors.get(a.id);
      if (!entry) continue;
      const e = this.world.placements.get(a.id)!,
        def = this.world.definitions.get(e.sprite)!;
      const { mesh, texture } = entry;
      if (Math.hypot(a.x - entry.lastX, a.z - entry.lastZ) > 0.0001)
        entry.motionUntil = t + 0.12;
      entry.lastX = a.x;
      entry.lastZ = a.z;
      const attached = e.attachedTo ? this.world.config.doors.find((d) => d.id === e.attachedTo) : undefined;
      const opened = attached ? this.world.state.doors[attached.id].open : 0;
      mesh.visible = !a.hidden && !(attached && (attached.motion === "break" || attached.motion === "split") && opened > 0.1) &&
        !(e.flyby && t > e.flyby.duration);
      if (!mesh.visible) continue;
      const dead = a.hp <= 0,
        height = def.height * (e.scale ?? 1);
      mesh.position.set(a.x, a.y + height / 2, a.z);
      if (attached) mesh.position.y += opened * (attached.lift ?? attached.height);
      if (e.flyby) {
        const fraction = Math.min(1, t / e.flyby.duration);
        mesh.position.add(new THREE.Vector3(e.flyby.x, e.flyby.y, e.flyby.z).multiplyScalar(fraction));
      }
      if (def.kind === "pickup" && def.id === "atomic") mesh.position.y += Math.sin(t * 3 + a.x) * 0.08;
      if (dead && def.brokenImage) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const broken = this.texture(def.brokenImage);
        if (mat.map !== broken) { mat.map = broken; mat.needsUpdate = true; }
      }
      if (def.facing === "floor") mesh.position.y = a.y + 0.02;
      if (!def.facing || def.facing === "billboard")
        mesh.rotation.y = Math.atan2(p.x - a.x, p.z - a.z);
      if (texture && def.sheet && texture.image) {
        const img = texture.image as HTMLImageElement;
        entry.cols = sheetCols(def.sheet, img.width);
        entry.rows = Math.max(
          1,
          Math.round(img.height / def.sheet.frameHeight),
        );
        const direction = directionFrame(
          a.yaw,
          a.x,
          a.z,
          p.x,
          p.z,
          def.directions ?? 1,
        );
        const action = actorAnimation(
          a,
          def.kind,
          def.attackInterval ?? 1.7,
          t < entry.motionUntil,
          t,
        );
        const anim = sheetAnim(def.sheet, `${action}-${direction}`, [
          action,
          `idle-${direction}`,
          "idle",
        ]);
        const frame = Math.min(
          entry.cols * entry.rows - 1,
          anim ? sheetFrameAt(anim, dead ? Math.max(0, t - a.diedAt) : t) : 0,
        );
        texture.repeat.set(1 / entry.cols, 1 / entry.rows);
        texture.offset.set(
          (frame % entry.cols) / entry.cols,
          1 - (Math.floor(frame / entry.cols) + 1) / entry.rows,
        );
      }
      (mesh.material as THREE.MeshBasicMaterial).color.setScalar(
        t - a.hurtAt < 0.12
          ? 1.8
          : def.fullbright
            ? 1
            : (tileAt(this.world.room, a.x, a.z).light ?? 0.82) * (night ? 1.8 : 1),
      );
    }
    for (const d of this.world.config.doors) {
      const open = this.world.state.doors[d.id].open;
      const slab = doorSlab(this.world.room, d, open), group = this.doors.get(d.id)!;
      group.visible = d.motion === "split" ? open < 1 : slab.hi - slab.lo > 0.001;
      group.position.y = (slab.lo + slab.hi) / 2;
      group.children.forEach((object, i) => {
        const mesh = object as THREE.Mesh;
        mesh.scale.y = Math.max(0.001, slab.hi - slab.lo);
        if (d.motion === "split") {
          const offset = (i === 0 ? -1 : 1) * (d.width / 4 + d.width * open / 2);
          if (d.axis === "x") mesh.position.x = offset; else mesh.position.z = offset;
        }
      });
    }
    const bolts = this.world.state.projectiles ?? [];
    while (this.bolts.length < bolts.length) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 4), new THREE.MeshBasicMaterial({ color: "#8cfa47", fog: false }));
      this.bolts.push(mesh); this.scene.add(mesh);
    }
    this.bolts.forEach((mesh, i) => {
      mesh.visible = i < bolts.length;
      if (bolts[i]) {
        mesh.position.set(bolts[i].x, bolts[i].y, bolts[i].z);
        mesh.scale.set(1, 1, 2.8);
        mesh.lookAt(bolts[i].x + bolts[i].vx, bolts[i].y + bolts[i].vy, bolts[i].z + bolts[i].vz);
        (mesh.material as THREE.MeshBasicMaterial).color.set(bolts[i].color);
      }
    });
    const bombs = this.world.state.pipebombs ?? [];
    while (this.bombs.length < bombs.length) {
      const sprite = this.world.config.sprites.find((s) => s.id === "pipebombs");
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.2),
        new THREE.MeshBasicMaterial({ map: sprite?.image ? this.texture(sprite.image) : undefined,
          color: "#b1b8a5", alphaTest: 0.3, side: THREE.DoubleSide }));
      this.bombs.push(mesh); this.scene.add(mesh);
    }
    this.bombs.forEach((mesh, i) => {
      mesh.visible = i < bombs.length;
      if (bombs[i]) { mesh.position.set(bombs[i].x, bombs[i].y, bombs[i].z); mesh.rotation.y = p.yaw; }
    });
    if (this.decoy) {
      this.decoy.visible = !!p.holoduke && inventoryActive(p, "holoduke");
      if (p.holoduke) {
        this.decoy.position.set(p.holoduke.x, p.holoduke.y + 0.925, p.holoduke.z);
        this.decoy.rotation.y = p.yaw;
        (this.decoy.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 28) * 0.12;
      }
    }
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i],
        age = t - e.at,
        life = e.explosion ? 0.55 : 0.13;
      if (age > life) {
        this.scene.remove(e.mesh);
        e.mesh.geometry.dispose();
        (e.mesh.material as THREE.Material).dispose();
        this.effects.splice(i, 1);
        continue;
      }
      const mat = e.mesh.material as THREE.MeshBasicMaterial;
      if (e.frames.length)
        mat.map =
          e.frames[
            Math.min(
              e.frames.length - 1,
              Math.floor((age / life) * e.frames.length),
            )
          ];
      e.mesh.rotation.y = p.yaw;
      e.mesh.scale.setScalar(e.explosion ? 1.4 + age * 3 : 0.08);
      (e.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - age / life;
    }
    const w = this.world.config.weapons.find((w) => w.id === p.weapon),
      tex = this.weapons.get(p.weapon);
    this.weapon.visible = !!tex && p.health > 0;
    if (w && tex) {
      const mat = this.weapon.material as THREE.MeshBasicMaterial;
      if (mat.map !== tex) {
        mat.map = tex;
        mat.needsUpdate = true;
      }
      if (w.sheet && tex.image) {
        const cols = sheetCols(w.sheet, (tex.image as HTMLImageElement).width);
        const name =
          p.reloadUntil > t
            ? "reload"
            : t - p.shotAt < w.interval
              ? "fire"
              : "idle";
        const rows = Math.max(
          1,
          Math.floor(
            (tex.image as HTMLImageElement).height / w.sheet.frameHeight,
          ),
        );
        const anim = sheetAnim(w.sheet, name, ["idle"]);
        const frame = Math.min(
          cols * rows - 1,
          anim ? sheetFrameAt(anim, t - p.shotAt) : 0,
        );
        tex.repeat.set(1 / cols, 1 / rows);
        tex.offset.set(
          (frame % cols) / cols,
          1 - (Math.floor(frame / cols) + 1) / rows,
        );
      }
      const view = weaponViewTransform(this.camera.aspect, w.view);
      const frameAspect = w.sheet ? w.sheet.frameWidth / w.sheet.frameHeight :
        tex.image ? (tex.image as HTMLImageElement).width / (tex.image as HTMLImageElement).height : 1;
      this.weapon.scale.set(this.world.config.presentation === "classic" || this.world.config.presentation === "quake" ? view.height * frameAspect / this.camera.aspect : view.width, view.height, 1);
      this.weapon.position.set(
        view.x + Math.sin(this.bob) * 0.022 * motion,
        view.y + Math.abs(Math.sin(this.bob * 2)) * 0.025 * motion,
        0,
      );
    }
    if (this.kick) {
      const age = t - (p.kickAt ?? -100), reach = Math.sin(Math.min(1, age / 0.42) * Math.PI);
      this.kick.visible = age >= 0 && age < 0.42;
      this.kick.scale.set(0.65 / this.camera.aspect, 0.95, 1);
      this.kick.position.set(-0.14, -1 + reach * 0.4, 0.1);
    }
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.clearDepth();
    this.renderer.render(this.weaponScene, this.weaponCamera);
  }
  dispose() {
    this.disposed = true;
    this.observer.disconnect();
    for (const scene of [this.scene, this.weaponScene])
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) m.material.forEach((x) => x.dispose());
        else m.material?.dispose();
      });
    for (const t of [...this.textures.values(), ...this.clones]) t.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
