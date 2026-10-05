import { useEffect, useRef, useState } from "react";
import type { Hotspot, QuakeModeSettings } from "../types";
import type {
  FpsDoor,
  FpsEntity,
  FpsSettings,
  FpsSprite,
  FpsTile,
  FpsWeapon,
} from "../game/fps/types";
import { createFpsSettings } from "../game/fps/presets";
import { validateFpsRoom } from "../game/fps/validate";
import { tileAt } from "../game/fps/simulation";
import { resolveAssetReference, uploadAsset } from "../data/mediaLibrary";
import { assetUrl } from "../assetPath";
import "./fps-editor.css";

const uid = (name: string) => `${name}-${crypto.randomUUID().slice(0, 8)}`;
function NumberField({
  label,
  value,
  onChange,
  step = 0.1,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  step?: number;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            Number.isFinite(e.target.valueAsNumber)
              ? e.target.valueAsNumber
              : undefined,
          )
        }
      />
    </label>
  );
}
function AssetField({
  label,
  value,
  storyId,
  onChange,
}: {
  label: string;
  value?: string;
  storyId: string;
  onChange: (url: string) => void;
}) {
  const [preview, setPreview] = useState(""),
    [note, setNote] = useState("");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    let dead = false;
    if (value?.startsWith("asset:"))
      void resolveAssetReference(value).then((url) => {
        if (!dead) setPreview(url ?? "");
      });
    else setPreview(value ? assetUrl(value) : "");
    return () => {
      dead = true;
    };
  }, [value]);
  return (
    <div className="fps-editor-asset">
      <label>
        {label}
        <input
          value={value ?? ""}
          placeholder="/img/… or asset:…"
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      {preview && <img src={preview} alt={`${label} preview`} />}
      <label className="fps-editor-upload">
        Upload image
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setNote("Uploading…");
            const result = await uploadAsset(storyId, file);
            if (!alive.current) return;
            if (result.success && result.assetId) {
              onChange(`asset:${result.assetId}`);
              setNote(
                "Stored in the media library; portable export embeds it.",
              );
            } else setNote(result.error ?? "Upload failed");
          }}
        />
      </label>
      {note && <p role="status">{note}</p>}
    </div>
  );
}
function JsonEditor({
  label,
  value,
  onApply,
}: {
  label: string;
  value: unknown;
  onApply: (value: unknown) => void;
}) {
  const [text, setText] = useState(JSON.stringify(value, null, 2)),
    [error, setError] = useState("");
  return (
    <div>
      <label>
        {label}
        <textarea
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={() => {
          try {
            const next: unknown = JSON.parse(text);
            if (!next || typeof next !== "object" || Array.isArray(next))
              throw new Error("Expected an object");
            onApply(next);
            setError("Applied.");
          } catch (e) {
            setError(String(e));
          }
        }}
      >
        Apply {label}
      </button>
      <p role="status">{error}</p>
    </div>
  );
}

/** Visual first-person authoring: no source edits required for rooms, art or combat. */
export function FpsEditor({
  quake,
  storyId,
  hotspots,
  onChange,
}: {
  quake: QuakeModeSettings;
  storyId: string;
  hotspots: Hotspot[];
  onChange: (next: QuakeModeSettings) => void;
}) {
  const current = useRef({ quake, onChange });
  current.current = { quake, onChange };
  const [tab, setTab] = useState<"map" | "sprites" | "world" | "weapons">(
    "map",
  );
  const [mode, setMode] = useState<
    "inspect" | "tile" | "sprite" | "door" | "spawn"
  >("inspect");
  const [brush, setBrush] = useState("."),
    [selectedSprite, setSelectedSprite] = useState("trooper");
  const [selectedEntity, setSelectedEntity] = useState(""),
    [selectedDoor, setSelectedDoor] = useState("");
  const [cursor, setCursor] = useState({ x: 1, z: 1 });
  const [cols, setCols] = useState(
      Math.max(8, ...quake.map.map((r) => r.length)),
    ),
    [rows, setRows] = useState(quake.map.length);
  const [wide, setWide] = useState(false);
  const f = quake.fps;
  const patch = (change: Partial<FpsSettings>) => {
    const { quake: q, onChange: commit } = current.current;
    if (q.fps) commit({ ...q, fps: { ...q.fps, ...change } });
  };
  const edit = (fn: (f: FpsSettings, q: QuakeModeSettings) => void) => {
    const { quake: q, onChange: commit } = current.current;
    if (!q.fps) return;
    const next = structuredClone(q);
    fn(next.fps!, next);
    commit(next);
  };
  const sprite =
    f?.sprites.find((s) => s.id === selectedSprite) ?? f?.sprites[0];
  const entity = f?.entities.find((e) => e.id === selectedEntity),
    door = f?.doors.find((d) => d.id === selectedDoor);
  const tile = f?.tiles[brush];
  const patchSprite = (s: Partial<FpsSprite>) => {
    if (sprite) {
      const id = sprite.id;
      edit((f) => {
        const target = f.sprites.find((s) => s.id === id);
        if (target) Object.assign(target, s);
      });
    }
  };
  const patchEntity = (s: Partial<FpsEntity>) => {
    if (entity)
      edit((f) => {
        const target = f.entities.find((e) => e.id === entity.id);
        if (target) Object.assign(target, s);
      });
  };
  const patchDoor = (s: Partial<FpsDoor>) => {
    if (door)
      edit((f) => {
        const target = f.doors.find((d) => d.id === door.id);
        if (target) Object.assign(target, s);
      });
  };
  const patchTile = (s: Partial<FpsTile>) =>
    edit((f) => {
      if (f.tiles[brush]) Object.assign(f.tiles[brush], s);
    });
  const place = (x: number, z: number) => {
    setCursor({ x, z });
    if (!f) return;
    if (mode === "tile")
      edit((_f, q) => {
        const grid = q.map.map((r) => r.split(""));
        grid[z][x] = brush;
        q.map = grid.map((r) => r.join(""));
      });
    if (mode === "spawn")
      patch({ spawn: { ...f.spawn, x: x + 0.5, z: z + 0.5 } });
    if (mode === "sprite" && sprite) {
      const id = uid("sprite");
      edit((f) =>
        f.entities.push({ id, sprite: sprite.id, x: x + 0.5, z: z + 0.5 }),
      );
      setSelectedEntity(id);
      setSelectedDoor("");
    }
    if (mode === "door") {
      const id = uid("door");
      edit((f) =>
        f.doors.push({
          id,
          name: "New door",
          x: x + 0.5,
          z: z + 0.5,
          axis: "x",
          width: 1,
          height: 2.4,
          material: "shutter",
        }),
      );
      setSelectedDoor(id);
      setSelectedEntity("");
    }
    if (mode === "inspect") {
      const ent = f.entities.find(
          (e) => Math.hypot(e.x - x - 0.5, e.z - z - 0.5) < 0.8,
        ),
        d = f.doors.find((d) => Math.hypot(d.x - x - 0.5, d.z - z - 0.5) < 0.8);
      setSelectedEntity(ent?.id ?? "");
      setSelectedDoor(d?.id ?? "");
      if (ent) setSelectedSprite(ent.sprite);
      setBrush(quake.map[z]?.[x] ?? ".");
    }
  };
  const materials = (
    value: string | undefined,
    onChange: (v: string) => void,
    label: string,
  ) => (
    <label>
      {label}
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Default</option>
        {f?.materials.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </label>
  );
  if (!f)
    return (
      <div className="fps-editor">
        <p>
          The legacy renderer keeps existing rooms unchanged. Enable the
          sprite-action extension for height tiles, weapons, enemies, pickups
          and doors.
        </p>
        <button
          type="button"
          onClick={() => {
            const next = createFpsSettings();
            const z = quake.map.findIndex((r) => r.includes("S"));
            if (z >= 0)
              next.spawn = {
                x: quake.map[z].indexOf("S") + 0.5,
                z: z + 0.5,
                yaw: 0,
              };
            else next.spawn = { x: 1.5, z: 1.5, yaw: 0 };
            onChange({ ...quake, fps: next });
          }}
        >
          Enable first-person action tools
        </button>
      </div>
    );
  return (
    <div
      className={`fps-editor ${wide ? "fps-editor-wide" : ""}`}
      data-fps-editor
    >
      <header>
        <strong>FIRST-PERSON TOOLS</strong>
        <button type="button" onClick={() => setWide((v) => !v)}>
          {wide ? "Close expanded editor" : "Expand editor"}
        </button>
      </header>
      <p>
        {quake.map[0]?.length}×{quake.map.length} cells · {f.entities.length}{" "}
        sprites · {f.doors.length} doors. Edits use Studio undo, autosave and
        portable export.
      </p>
      <nav aria-label="First-person editor sections">
        {(["map", "sprites", "world", "weapons"] as const).map((t) => (
          <button
            type="button"
            key={t}
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
          >
            {t === "map"
              ? "Map & placement"
              : t === "sprites"
                ? "Sprite library"
                : t === "world"
                  ? "Surfaces & sky"
                  : "Weapons & player"}
          </button>
        ))}
      </nav>
      {tab === "map" && (
        <div className="fps-editor-map-layout">
          <div>
            <div className="fps-editor-grid">
              <label>
                Map tool
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as typeof mode)}
                >
                  {["inspect", "tile", "sprite", "door", "spawn"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tile brush
                <select
                  value={brush}
                  onChange={(e) => setBrush(e.target.value)}
                >
                  {Object.entries(f.tiles).map(([k, t]) => (
                    <option key={k} value={k}>
                      {k} · {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Sprite to place
              <select
                value={sprite?.id}
                onChange={(e) => setSelectedSprite(e.target.value)}
              >
                {f.sprites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} [{s.kind}]
                  </option>
                ))}
              </select>
            </label>
            <div className="fps-editor-map">
              <svg
                viewBox={`0 0 ${Math.max(...quake.map.map((r) => r.length))} ${quake.map.length}`}
                role="grid"
                aria-label="First-person level map"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (
                    [
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    setCursor((c) => ({
                      x: Math.max(
                        0,
                        Math.min(
                          quake.map[0].length - 1,
                          c.x +
                            (e.key === "ArrowRight"
                              ? 1
                              : e.key === "ArrowLeft"
                                ? -1
                                : 0),
                        ),
                      ),
                      z: Math.max(
                        0,
                        Math.min(
                          quake.map.length - 1,
                          c.z +
                            (e.key === "ArrowDown"
                              ? 1
                              : e.key === "ArrowUp"
                                ? -1
                                : 0),
                        ),
                      ),
                    }));
                  }
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    place(cursor.x, cursor.z);
                  }
                }}
              >
                {quake.map.flatMap((row, z) =>
                  [...row].map((char, x) => {
                    const t = tileAt(quake, x, z);
                    return (
                      <rect
                        key={`${x}-${z}`}
                        role="gridcell"
                        aria-label={`Cell ${x}, ${z}: ${f.tiles[char]?.name ?? char}`}
                        x={x}
                        y={z}
                        width={1}
                        height={1}
                        fill={
                          t.solid
                            ? "#343d42"
                            : t.water !== undefined
                              ? "#3f7f79"
                              : t.hazard
                                ? "#4f7a2e"
                                : (t.floor ?? 0) > 0
                                  ? "#9e7445"
                                  : t.ceiling != null
                                    ? "#69715f"
                                    : "#45626c"
                        }
                        stroke="#151d23"
                        strokeWidth={0.06}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          place(x, z);
                        }}
                        onPointerEnter={(e) => {
                          if (e.buttons === 1 && mode === "tile") place(x, z);
                        }}
                      />
                    );
                  }),
                )}
                {f.entities.map((e) => (
                  <circle
                    key={e.id}
                    cx={e.x}
                    cy={e.z}
                    r={e.id === selectedEntity ? 0.4 : 0.23}
                    fill={
                      f.sprites.find((s) => s.id === e.sprite)?.kind === "enemy"
                        ? "#ec725e"
                        : "#e4c583"
                    }
                    pointerEvents="none"
                  />
                ))}
                {f.doors.map((d) => (
                  <line
                    key={d.id}
                    x1={d.x - (d.axis === "x" ? d.width / 2 : 0)}
                    y1={d.z - (d.axis === "z" ? d.width / 2 : 0)}
                    x2={d.x + (d.axis === "x" ? d.width / 2 : 0)}
                    y2={d.z + (d.axis === "z" ? d.width / 2 : 0)}
                    stroke="#81ded5"
                    strokeWidth={0.18}
                    pointerEvents="none"
                  />
                ))}
                <circle
                  cx={f.spawn.x}
                  cy={f.spawn.z}
                  r={0.36}
                  fill="#f2efcf"
                  pointerEvents="none"
                />
                <line
                  x1={f.spawn.x}
                  y1={f.spawn.z}
                  x2={f.spawn.x - Math.sin(f.spawn.yaw) * 1.3}
                  y2={f.spawn.z - Math.cos(f.spawn.yaw) * 1.3}
                  stroke="#f2efcf"
                  strokeWidth={0.15}
                  pointerEvents="none"
                />
                <rect
                  x={cursor.x}
                  y={cursor.z}
                  width={1}
                  height={1}
                  fill="none"
                  stroke="#f8e7a0"
                  strokeWidth={0.12}
                  pointerEvents="none"
                />
              </svg>
            </div>
            <p>
              Click to {mode}. Arrow keys move the map cursor; Enter
              paints/places. Coordinates: {cursor.x}, {cursor.z}. Tile painting
              also supports dragging.
            </p>
            <div className="fps-editor-grid">
              <NumberField
                label="Map width"
                value={cols}
                step={1}
                onChange={(v) => setCols(v ?? 8)}
              />
              <NumberField
                label="Map depth"
                value={rows}
                step={1}
                onChange={(v) => setRows(v ?? 8)}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                edit((_f, q) => {
                  const w = Math.max(8, Math.min(96, Math.round(cols))),
                    h = Math.max(8, Math.min(96, Math.round(rows)));
                  q.map = Array.from({ length: h }, (_, z) =>
                    (q.map[z] ?? "").padEnd(w, "#").slice(0, w),
                  );
                  setCols(w);
                  setRows(h);
                })
              }
            >
              Resize map (Check warns about cropped objects)
            </button>
            <div className="fps-editor-grid">
              <NumberField
                label="Spawn X"
                value={f.spawn.x}
                onChange={(v) => patch({ spawn: { ...f.spawn, x: v ?? 1.5 } })}
              />
              <NumberField
                label="Spawn Z"
                value={f.spawn.z}
                onChange={(v) => patch({ spawn: { ...f.spawn, z: v ?? 1.5 } })}
              />
              <NumberField
                label="Spawn facing degrees"
                value={Math.round((f.spawn.yaw * 180) / Math.PI)}
                step={1}
                onChange={(v) =>
                  patch({
                    spawn: { ...f.spawn, yaw: ((v ?? 0) * Math.PI) / 180 },
                  })
                }
              />
            </div>
          </div>
          <aside>
            <label>
              Placed sprite
              <select
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value);
                  setSelectedDoor("");
                }}
              >
                <option value="">Select a sprite…</option>
                {f.entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.id} · {f.sprites.find((s) => s.id === e.sprite)?.name}
                  </option>
                ))}
              </select>
            </label>
            {entity && (
              <fieldset>
                <legend>Sprite placement</legend>
                <code>{entity.id}</code>
                <label>
                  Sprite definition
                  <select
                    value={entity.sprite}
                    onChange={(e) => patchEntity({ sprite: e.target.value })}
                  >
                    {f.sprites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="fps-editor-grid">
                  <NumberField
                    label="Sprite X"
                    value={entity.x}
                    onChange={(v) => patchEntity({ x: v ?? 0 })}
                  />
                  <NumberField
                    label="Sprite Z"
                    value={entity.z}
                    onChange={(v) => patchEntity({ z: v ?? 0 })}
                  />
                  <NumberField
                    label="Foot elevation (blank = floor)"
                    value={entity.y}
                    onChange={(v) => patchEntity({ y: v })}
                  />
                  <NumberField
                    label="Sprite scale"
                    value={entity.scale ?? 1}
                    onChange={(v) => patchEntity({ scale: v ?? 1 })}
                  />
                  <NumberField
                    label="Facing degrees"
                    value={Math.round(((entity.yaw ?? 0) * 180) / Math.PI)}
                    onChange={(v) =>
                      patchEntity({ yaw: ((v ?? 0) * Math.PI) / 180 })
                    }
                  />
                </div>
                <label>
                  Message
                  <input
                    value={entity.message ?? ""}
                    onChange={(e) => patchEntity({ message: e.target.value })}
                  />
                </label>
                <label>
                  Doors to open (use / destruction)
                  <select
                    multiple
                    value={entity.targets ?? []}
                    onChange={(e) =>
                      patchEntity({
                        targets: Array.from(e.target.selectedOptions).map(
                          (o) => o.value,
                        ),
                      })
                    }
                  >
                    {f.doors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Attached door (moving wall art)
                  <select value={entity.attachedTo ?? ""} onChange={(e) => patchEntity({ attachedTo: e.target.value || undefined })}>
                    <option value="">None</option>
                    {f.doors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </label>
                <label>
                  Exit hotspot
                  <select
                    value={entity.hotspotId ?? ""}
                    onChange={(e) =>
                      patchEntity({ hotspotId: e.target.value || undefined })
                    }
                  >
                    <option value="">No story action</option>
                    {hotspots.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fps-editor-check">
                  <input
                    type="checkbox"
                    checked={!!entity.secret}
                    onChange={(e) => patchEntity({ secret: e.target.checked })}
                  />{" "}
                  Counts as a secret
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const id = uid("sprite");
                    edit((f) =>
                      f.entities.push({
                        ...structuredClone(entity),
                        id,
                        x: entity.x + 1,
                      }),
                    );
                    setSelectedEntity(id);
                  }}
                >
                  Duplicate sprite
                </button>
                <button
                  type="button"
                  onClick={() => {
                    edit((f) => {
                      f.entities = f.entities.filter((e) => e.id !== entity.id);
                    });
                    setSelectedEntity("");
                  }}
                >
                  Delete sprite
                </button>
              </fieldset>
            )}
            <label>
              Placed door
              <select
                value={selectedDoor}
                onChange={(e) => {
                  setSelectedDoor(e.target.value);
                  setSelectedEntity("");
                }}
              >
                <option value="">Select a door…</option>
                {f.doors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            {door && (
              <fieldset>
                <legend>Door</legend>
                <code>{door.id}</code>
                <label>
                  Door name
                  <input
                    value={door.name}
                    onChange={(e) => patchDoor({ name: e.target.value })}
                  />
                </label>
                <div className="fps-editor-grid">
                  <NumberField
                    label="Door X"
                    value={door.x}
                    onChange={(v) => patchDoor({ x: v ?? 0 })}
                  />
                  <NumberField
                    label="Door Z"
                    value={door.z}
                    onChange={(v) => patchDoor({ z: v ?? 0 })}
                  />
                  <NumberField
                    label="Door width"
                    value={door.width}
                    onChange={(v) => patchDoor({ width: v ?? 1 })}
                  />
                  <NumberField
                    label="Door height"
                    value={door.height}
                    onChange={(v) => patchDoor({ height: v ?? 2.4 })}
                  />
                  <NumberField
                    label="Door bottom (blank = floor)"
                    value={door.bottom}
                    onChange={(v) => patchDoor({ bottom: v })}
                  />
                  <NumberField
                    label="Opening speed"
                    value={door.speed ?? 1.5}
                    onChange={(v) => patchDoor({ speed: v ?? 1.5 })}
                  />
                </div>
                <div className="fps-editor-grid">
                  <NumberField label="Slab depth" value={door.depth} onChange={(v) => patchDoor({ depth: v })} />
                  <NumberField label="Lift travel (blank = door)" value={door.lift} onChange={(v) => patchDoor({ lift: v })} />
                </div>
                <label>Door motion
                  <select value={door.motion ?? "raise"} onChange={(e) => patchDoor({ motion: e.target.value as FpsDoor["motion"] })}>
                    <option value="raise">Raise into ceiling</option><option value="split">Split sideways / curtains</option><option value="break">Destroyed panel</option>
                  </select>
                </label>
                <label className="fps-editor-check"><input type="checkbox" checked={!!door.walkable}
                  onChange={(e) => patchDoor({ walkable: e.target.checked })} />Walkable bridge slab</label>
                <label className="fps-editor-check"><input type="checkbox" checked={!!door.sealed}
                  onChange={(e) => patchDoor({ sealed: e.target.checked })} />Intentionally sealed entrance</label>
                <label>
                  Door axis
                  <select
                    value={door.axis}
                    onChange={(e) =>
                      patchDoor({ axis: e.target.value as "x" | "z" })
                    }
                  >
                    <option value="x">East–west (X)</option>
                    <option value="z">North–south (Z)</option>
                  </select>
                </label>
                {materials(
                  door.material,
                  (v) => patchDoor({ material: v }),
                  "Door material",
                )}
                <label>
                  Required key ID
                  <input
                    value={door.key ?? ""}
                    placeholder="e.g. red; blank = unlocked"
                    onChange={(e) =>
                      patchDoor({ key: e.target.value || undefined })
                    }
                  />
                </label>
                <label>
                  Locked message
                  <input
                    value={door.lockedMessage ?? ""}
                    onChange={(e) =>
                      patchDoor({ lockedMessage: e.target.value || undefined })
                    }
                  />
                </label>
                <label className="fps-editor-check">
                  <input
                    type="checkbox"
                    checked={!!door.startsOpen}
                    onChange={(e) =>
                      patchDoor({ startsOpen: e.target.checked })
                    }
                  />{" "}
                  Starts open
                </label>
                <button
                  type="button"
                  onClick={() => {
                    edit((f) => {
                      f.doors = f.doors.filter((d) => d.id !== door.id);
                      f.entities.forEach((e) => {
                        e.targets = e.targets?.filter((id) => id !== door.id);
                        if (e.attachedTo === door.id) e.attachedTo = undefined;
                      });
                    });
                    setSelectedDoor("");
                  }}
                >
                  Delete door and its switch links
                </button>
              </fieldset>
            )}
            {!entity && !door && (
              <p>
                Select a map object, or choose a placement tool. Put wall
                sprites just in front of the wall surface, not inside it.
              </p>
            )}
          </aside>
        </div>
      )}
      {tab === "sprites" && (
        <div>
          <label>
            Sprite definition to edit
            <select
              value={sprite?.id}
              onChange={(e) => setSelectedSprite(e.target.value)}
            >
              {f.sprites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              const id = uid("custom");
              edit((f) =>
                f.sprites.push({
                  id,
                  name: "New sprite",
                  kind: "prop",
                  width: 1,
                  height: 1,
                }),
              );
              setSelectedSprite(id);
            }}
          >
            Add sprite definition
          </button>
          {sprite && (
            <fieldset key={sprite.id}>
              <legend>
                Shared sprite definition — every placement uses these settings
              </legend>
              <label>
                Sprite name
                <input
                  value={sprite.name}
                  onChange={(e) => patchSprite({ name: e.target.value })}
                />
              </label>
              <label>
                Behavior
                <select
                  value={sprite.kind}
                  onChange={(e) => {
                    const kind = e.target.value as FpsSprite["kind"];
                    patchSprite({
                      kind,
                      ...(kind === "enemy"
                        ? { solid: sprite.solid ?? true }
                        : {}),
                      ...(kind === "pickup" && !sprite.pickup
                        ? { pickup: { type: "health" as const, amount: 25 } }
                        : {}),
                      ...(["enemy", "explosive", "breakable"].includes(kind)
                        ? {
                            health: sprite.health ?? 30,
                            damage: sprite.damage ?? 5,
                          }
                        : {}),
                    });
                  }}
                >
                  {[
                    "prop",
                    "enemy",
                    "pickup",
                    "explosive",
                    "breakable",
                    "switch",
                    "exit",
                  ].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <AssetField
                label="Sprite image or atlas"
                storyId={storyId}
                value={sprite.sheet?.image ?? sprite.image}
                onChange={(v) => {
                  const id = sprite.id;
                  edit((f) => {
                    const s = f.sprites.find((s) => s.id === id);
                    if (s?.sheet) s.sheet.image = v;
                    else if (s) s.image = v;
                  });
                }}
              />
              <div className="fps-editor-grid">
                <NumberField
                  label="World width"
                  value={sprite.width}
                  onChange={(v) => patchSprite({ width: v ?? 1 })}
                />
                <NumberField
                  label="World height"
                  value={sprite.height}
                  onChange={(v) => patchSprite({ height: v ?? 1 })}
                />
                <NumberField
                  label="Collision radius"
                  value={sprite.radius}
                  onChange={(v) => patchSprite({ radius: v })}
                />
              </div>
              <label>
                Facing mode
                <select
                  value={sprite.facing ?? "billboard"}
                  onChange={(e) =>
                    patchSprite({
                      facing: e.target.value as FpsSprite["facing"],
                    })
                  }
                >
                  <option value="billboard">
                    Faces the camera (actor / prop)
                  </option>
                  <option value="wall">Fixed wall sprite</option>
                  <option value="floor">Flat floor sprite</option>
                </select>
              </label>
              <div className="fps-editor-grid">
                {(["solid", "platform", "fullbright"] as const).map((k) => (
                  <label className="fps-editor-check" key={k}>
                    <input
                      type="checkbox"
                      checked={!!sprite[k]}
                      onChange={(e) => patchSprite({ [k]: e.target.checked })}
                    />
                    {k}
                  </label>
                ))}
              </div>
              {["enemy", "explosive", "breakable"].includes(sprite.kind) && (
                <div className="fps-editor-grid">
                  <NumberField
                    label="Hit points"
                    value={sprite.health ?? 30}
                    onChange={(v) => patchSprite({ health: v ?? 30 })}
                  />
                  <NumberField
                    label="Damage"
                    value={sprite.damage ?? 5}
                    onChange={(v) => patchSprite({ damage: v ?? 5 })}
                  />
                  <NumberField
                    label="Movement speed"
                    value={sprite.speed ?? 0.9}
                    onChange={(v) => patchSprite({ speed: v ?? 0.9 })}
                  />
                  <NumberField
                    label="Range / blast radius"
                    value={sprite.range ?? 15}
                    onChange={(v) => patchSprite({ range: v ?? 15 })}
                  />
                  <NumberField
                    label="Attack interval"
                    value={sprite.attackInterval ?? 2}
                    onChange={(v) => patchSprite({ attackInterval: v ?? 2 })}
                  />
                </div>
              )}
              {["enemy", "explosive", "breakable"].includes(sprite.kind) && <label>Damage accepted
                <select value={sprite.damageType ?? "any"} onChange={(e) => patchSprite({ damageType: e.target.value as FpsSprite["damageType"] })}>
                  <option value="any">Any weapon</option><option value="explosive">Explosives only (cracked wall)</option>
                </select>
              </label>}
              {sprite.kind === "enemy" && <>
                <label>Enemy attack
                  <select value={sprite.attack ?? "hitscan"} onChange={(e) => patchSprite({ attack: e.target.value as FpsSprite["attack"] })}>
                    <option value="hitscan">Hitscan</option><option value="projectile">Dodgeable projectile</option><option value="melee">Melee (dogs / knights)</option>
                  </select>
                </label>
                {sprite.attack === "melee" && <NumberField label="Melee reach" value={sprite.meleeRange ?? 1.1} onChange={(v) => patchSprite({ meleeRange: v })} />}
                {sprite.attack === "projectile" && <div className="fps-editor-grid">
                  <NumberField label="Projectile speed" value={sprite.projectileSpeed ?? 8} onChange={(v) => patchSprite({ projectileSpeed: v })} />
                  <label>Projectile color<input type="color" value={sprite.projectileColor ?? "#8cfa47"} onChange={(e) => patchSprite({ projectileColor: e.target.value })} /></label>
                </div>}
              </>}
              <label>World interaction
                <select value={sprite.use ?? ""} onChange={(e) => patchSprite({ use: e.target.value as FpsSprite["use"] || undefined })}>
                  <option value="">None / story hotspot</option><option value="water">Drink water</option><option value="arcade">Play arcade / open linked doors</option><option value="teleport">Teleporter pad</option>
                </select>
              </label>
              {sprite.use === "teleport" && <div className="fps-editor-grid">
                <NumberField label="Teleport X" value={sprite.teleport?.x} onChange={(v) => patchSprite({ teleport: { x: v ?? 0, z: sprite.teleport?.z ?? 0, yaw: sprite.teleport?.yaw } })} />
                <NumberField label="Teleport Z" value={sprite.teleport?.z} onChange={(v) => patchSprite({ teleport: { x: sprite.teleport?.x ?? 0, z: v ?? 0, yaw: sprite.teleport?.yaw } })} />
                <NumberField label="Teleport facing degrees" value={sprite.teleport?.yaw !== undefined ? (sprite.teleport.yaw * 180) / Math.PI : undefined} onChange={(v) => patchSprite({ teleport: { x: sprite.teleport?.x ?? 0, z: sprite.teleport?.z ?? 0, yaw: v !== undefined ? (v * Math.PI) / 180 : undefined } })} />
              </div>}
              {sprite.use === "water" && <AssetField label="Broken fixture image" storyId={storyId} value={sprite.brokenImage}
                onChange={(v) => patchSprite({ brokenImage: v || undefined })} />}
              {sprite.kind === "pickup" && (
                <>
                  <label>
                    Pickup type
                    <select
                      value={sprite.pickup?.type ?? "health"}
                      onChange={(e) =>
                        patchSprite({
                          pickup: {
                            ...sprite.pickup,
                            type: e.target.value as NonNullable<
                              FpsSprite["pickup"]
                            >["type"],
                          },
                        })
                      }
                    >
                      {["health", "armor", "ammo", "weapon", "key", "item", "quad"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  {sprite.pickup?.type === "item" && <label>Inventory item ID
                    <input list="fps-equipment-ids" value={sprite.pickup.itemId ?? ""} onChange={(e) => patchSprite({ pickup: { ...sprite.pickup!, itemId: e.target.value } })} />
                    <datalist id="fps-equipment-ids">{["medkit", "jetpack", "steroids", "nightvision", "holoduke", "pipebombs", "biosuit"].map((id) => <option key={id} value={id} />)}</datalist>
                  </label>}
                  {sprite.pickup?.type === "quad" && <NumberField label="Quad duration (seconds)" value={sprite.pickup.duration ?? 30} onChange={(v) => patchSprite({ pickup: { ...sprite.pickup!, duration: v ?? 30 } })} />}
                  <NumberField label="Pickup cap (health / armor)" value={sprite.pickup?.max} onChange={(v) => patchSprite({ pickup: { type: "health", ...sprite.pickup, max: v } })} />
                  <NumberField
                    label="Pickup amount"
                    value={sprite.pickup?.amount ?? 25}
                    onChange={(v) =>
                      patchSprite({
                        pickup: {
                          type: "health",
                          ...sprite.pickup,
                          amount: v ?? 25,
                        },
                      })
                    }
                  />
                  <label>
                    Weapon ID
                    <select
                      value={sprite.pickup?.weaponId ?? ""}
                      onChange={(e) =>
                        patchSprite({
                          pickup: {
                            type: "ammo",
                            ...sprite.pickup,
                            weaponId: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="">None</option>
                      {f.weapons.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Key ID
                    <input
                      value={sprite.pickup?.keyId ?? ""}
                      onChange={(e) =>
                        patchSprite({
                          pickup: {
                            type: "key",
                            ...sprite.pickup,
                            keyId: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                </>
              )}
              <label className="fps-editor-check">
                <input
                  type="checkbox"
                  checked={!!sprite.sheet}
                  onChange={(e) =>
                    patchSprite(
                      e.target.checked
                        ? {
                            sheet: {
                              image: sprite.image ?? "",
                              frameWidth: 128,
                              frameHeight: 128,
                              animations: {
                                idle: { frames: [0] },
                                walk: { frames: [0, 1], fps: 6 },
                                attack: { frames: [2] },
                                death: { frames: [3], loop: false },
                              },
                            },
                          }
                        : { image: sprite.sheet?.image, sheet: undefined },
                    )
                  }
                />{" "}
                Use a sprite sheet
              </label>
              {sprite.sheet && (
                <>
                  <div className="fps-editor-grid">
                    <NumberField
                      label="Frame width"
                      value={sprite.sheet.frameWidth}
                      step={1}
                      onChange={(v) =>
                        patchSprite({
                          sheet: { ...sprite.sheet!, frameWidth: v ?? 128 },
                        })
                      }
                    />
                    <NumberField
                      label="Frame height"
                      value={sprite.sheet.frameHeight}
                      step={1}
                      onChange={(v) =>
                        patchSprite({
                          sheet: { ...sprite.sheet!, frameHeight: v ?? 128 },
                        })
                      }
                    />
                    <label>
                      View directions
                      <select
                        value={sprite.directions ?? 1}
                        onChange={(e) =>
                          patchSprite({
                            directions: Number(e.target.value) as 1 | 4 | 8,
                          })
                        }
                      >
                        {[1, 4, 8].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p>
                    Animations: idle, walk, attack, death. Directional sets use
                    idle-0 … idle-3 (or -7). Frames are counted left→right,
                    top→bottom.
                  </p>
                  <JsonEditor
                    label="Animations"
                    value={sprite.sheet.animations}
                    onApply={(v) => {
                      const anims = v as NonNullable<
                        FpsSprite["sheet"]
                      >["animations"];
                      for (const a of Object.values(anims))
                        if (
                          !Array.isArray(a.frames) ||
                          !a.frames.every((n) => Number.isInteger(n) && n >= 0)
                        )
                          throw new Error(
                            "Each animation needs non-negative integer frames",
                          );
                      patchSprite({
                        sheet: { ...sprite.sheet!, animations: anims },
                      });
                    }}
                  />
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  const id = uid(sprite.id);
                  edit((f) =>
                    f.sprites.push({
                      ...structuredClone(sprite),
                      id,
                      name: `${sprite.name} copy`,
                    }),
                  );
                  setSelectedSprite(id);
                }}
              >
                Duplicate definition
              </button>
            </fieldset>
          )}
        </div>
      )}
      {tab === "world" && (
        <>
          <label>
            Surface tile
            <select value={brush} onChange={(e) => setBrush(e.target.value)}>
              {Object.entries(f.tiles).map(([c, t]) => (
                <option key={c} value={c}>
                  {c} · {t.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              const char = [..."abcdefghijklmnopqrstuvwxyz0123456789"].find(
                (c) => !f.tiles[c],
              );
              if (char) {
                edit((f) => {
                  f.tiles[char] = {
                    name: "New surface",
                    floor: 0,
                    ceiling: null,
                    floorMaterial: "concrete",
                    wallMaterial: "brick",
                  };
                });
                setBrush(char);
              }
            }}
          >
            Add surface tile
          </button>
          {tile && (
            <fieldset>
              <legend>Surface {brush}</legend>
              <label>
                Surface name
                <input
                  value={tile.name}
                  onChange={(e) => patchTile({ name: e.target.value })}
                />
              </label>
              <label className="fps-editor-check">
                <input
                  type="checkbox"
                  checked={!!tile.solid}
                  onChange={(e) => patchTile({ solid: e.target.checked })}
                />{" "}
                Solid wall / column
              </label>
              <div className="fps-editor-grid">
                <NumberField
                  label="Floor elevation"
                  value={tile.floor ?? 0}
                  onChange={(v) => patchTile({ floor: v ?? 0 })}
                />
                <NumberField
                  label="Wall top elevation"
                  value={tile.wallHeight ?? 10}
                  onChange={(v) => patchTile({ wallHeight: v ?? 10 })}
                />
                <NumberField
                  label="Ceiling (blank = sky)"
                  value={tile.ceiling ?? undefined}
                  onChange={(v) => patchTile({ ceiling: v ?? null })}
                />
                <NumberField
                  label="Sector brightness"
                  value={tile.light ?? 0.8}
                  onChange={(v) => patchTile({ light: v ?? 0.8 })}
                />
              </div>
              <div className="fps-editor-grid">
                <NumberField label="Floor slope east" value={tile.slope?.x ?? 0} onChange={(v) => patchTile({ slope: { ...tile.slope, x: v ?? 0 } })} />
                <NumberField label="Floor slope south" value={tile.slope?.z ?? 0} onChange={(v) => patchTile({ slope: { ...tile.slope, z: v ?? 0 } })} />
                <NumberField label="Accessible roof (blank = solid above)" value={tile.roof} onChange={(v) => patchTile({ roof: v })} />
              </div>
              <p>Slopes rise per cell from the north-west corner. Adjacent ramp tiles should meet at the same edge height.</p>
              <div className="fps-editor-grid">
                <NumberField
                  label="Hazard damage per hit (slime / lava)"
                  value={tile.hazard?.damage}
                  onChange={(v) =>
                    patchTile({
                      hazard:
                        v !== undefined
                          ? { damage: v, every: tile.hazard?.every ?? 1, message: tile.hazard?.message }
                          : undefined,
                    })
                  }
                />
                <NumberField
                  label="Hazard seconds between hits"
                  value={tile.hazard?.every ?? 1}
                  onChange={(v) =>
                    patchTile({
                      hazard: {
                        damage: tile.hazard?.damage ?? 5,
                        every: v ?? 1,
                        message: tile.hazard?.message,
                      },
                    })
                  }
                />
                <NumberField
                  label="Water surface height (blank = none)"
                  value={tile.water}
                  onChange={(v) => patchTile({ water: v })}
                />
              </div>
              <p>Hazard floors hurt the player on a timer (Quake slime: 5 damage every second). A water height turns the cell into a wading pool with a translucent surface; the tile floor is the pool bed. The biosuit item negates hazards while it drains.</p>
              {materials(
                tile.floorMaterial,
                (v) => patchTile({ floorMaterial: v }),
                "Floor material",
              )}
              {materials(
                tile.wallMaterial,
                (v) => patchTile({ wallMaterial: v }),
                "Wall material",
              )}
              {materials(
                tile.ceilingMaterial,
                (v) => patchTile({ ceilingMaterial: v }),
                "Ceiling material",
              )}
            </fieldset>
          )}
          <details>
            <summary>Architecture & vertical trigger zones ({f.details?.length ?? 0} dimensional pieces)</summary>
            <p>Boxes have x/z centre, bottom, width, depth, height, material, optional topMaterial, light, solid and slope. Solid pieces have real sides, walkable tops and undersides. Zones may include bottom/top bounds. Check runs before these edits are applied.</p>
            <JsonEditor key={JSON.stringify([f.details, f.zones])} label="Architecture and zones"
              value={{ details: f.details ?? [], zones: f.zones ?? [] }} onApply={(value) => {
                const data = value as Pick<FpsSettings, "details" | "zones">;
                const next = { ...quake, fps: { ...f, details: data.details, zones: data.zones } };
                const errors = validateFpsRoom(next, hotspots).filter((i) => i.severity === "error");
                if (errors.length) throw new Error(errors.map((i) => i.message).join(" "));
                onChange(next);
              }} />
          </details>
          <label>Sky projection
            <select value={f.skyMode ?? "sphere"} onChange={(e) => patch({ skyMode: e.target.value as FpsSettings["skyMode"] })}>
              <option value="sphere">Spherical panorama</option><option value="cylinder">Cylindrical city skyline</option>
            </select>
          </label>
          <label>
            Water tint
            <input type="color" value={f.waterColor ?? "#3a6b63"} onChange={(e) => patch({ waterColor: e.target.value })} />
          </label>
          <AssetField
            label="Sky panorama"
            storyId={storyId}
            value={f.skyImage}
            onChange={(v) => patch({ skyImage: v })}
          />
          {f.materials.map((m) => (
            <details key={m.id}>
              <summary>Material · {m.name}</summary>
              <AssetField
                label={`${m.name} texture`}
                storyId={storyId}
                value={m.image}
                onChange={(v) =>
                  edit((f) => {
                    f.materials = f.materials.map((x) =>
                      x.id === m.id ? { ...x, image: v } : x,
                    );
                  })
                }
              />
              <div className="fps-editor-grid">
                <NumberField label={`${m.name} repetitions per unit`} value={m.repeat ?? 0.5} onChange={(v) => edit((f) => { f.materials.find((x) => x.id === m.id)!.repeat = v; })} />
                <NumberField label={`${m.name} opacity`} value={m.opacity ?? 1} onChange={(v) => edit((f) => { f.materials.find((x) => x.id === m.id)!.opacity = v; })} />
                <NumberField label={`${m.name} alpha cutout`} value={m.alphaTest ?? 0} onChange={(v) => edit((f) => { f.materials.find((x) => x.id === m.id)!.alphaTest = v; })} />
              </div>
              <label className="fps-editor-check"><input type="checkbox" checked={!!m.fullbright}
                onChange={(e) => edit((f) => { f.materials.find((x) => x.id === m.id)!.fullbright = e.target.checked; })} />Full-bright material</label>
              <label>
                Tint
                <input
                  type="color"
                  value={m.color ?? "#ffffff"}
                  onChange={(e) =>
                    edit((f) => {
                      f.materials = f.materials.map((x) =>
                        x.id === m.id ? { ...x, color: e.target.value } : x,
                      );
                    })
                  }
                />
              </label>
            </details>
          ))}
          <details>
            <summary>Explosion / impact sprite effects</summary>
            {[0, 1, 2].map((i) => (
              <AssetField
                key={i}
                label={`Explosion frame ${i + 1}`}
                storyId={storyId}
                value={f.effects?.explosionImages?.[i]}
                onChange={(v) =>
                  edit((f) => {
                    f.effects ??= {};
                    f.effects.explosionImages ??= [];
                    f.effects.explosionImages[i] = v;
                  })
                }
              />
            ))}
            <AssetField
              label="Impact sprite"
              storyId={storyId}
              value={f.effects?.impactImage}
              onChange={(v) =>
                edit((f) => {
                  f.effects ??= {};
                  f.effects.impactImage = v;
                })
              }
            />
          </details>
          <button
            type="button"
            onClick={() =>
              edit((f) =>
                f.materials.push({
                  id: uid("material"),
                  name: "Custom material",
                  color: "#a6a199",
                }),
              )
            }
          >
            Add material
          </button>
        </>
      )}
      {tab === "weapons" && (
        <>
          <label>HUD presentation
            <select value={f.presentation ?? "standard"} onChange={(e) => {
              const v = e.target.value;
              patch({ presentation: v === "classic" || v === "quake" ? v : undefined });
            }}>
              <option value="standard">Scarlet Reel standard</option><option value="classic">Classic DOS status bar</option><option value="quake">Quake status bar</option>
            </select>
          </label>
          {(f.presentation === "classic" || f.presentation === "quake") && <label>Default difficulty
            <select value={f.defaultSkill ?? 2} onChange={(e) => patch({ defaultSkill: Number(e.target.value) as 1 | 2 | 3 })}>
              <option value="1">{f.skillLabels?.[0] ?? (f.presentation === "quake" ? "Easy" : "Piece of Cake")} — reduced damage</option>
              <option value="2">{f.skillLabels?.[1] ?? (f.presentation === "quake" ? "Normal" : "Let's Rock")} — normal</option>
              <option value="3">{f.skillLabels?.[2] ?? (f.presentation === "quake" ? "Hard" : "Come Get Some")} — increased damage</option>
            </select>
          </label>}
          {(f.presentation === "classic" || f.presentation === "quake") && <div className="fps-editor-grid">
            <label>
              Menu wordmark
              <input value={f.menuWordmark ?? ""} placeholder={f.presentation === "quake" ? "QUAKE" : "DUKE NUKEM 3D"} onChange={(e) => patch({ menuWordmark: e.target.value || undefined })} />
            </label>
            <label>
              Menu kicker line
              <input value={f.menuKicker ?? ""} placeholder="Episode · level" onChange={(e) => patch({ menuKicker: e.target.value || undefined })} />
            </label>
          </div>}
          <p>Classic and Quake FOV are measured at 4:3 and expand horizontally on widescreen. Item shortcuts: J jetpack, N night vision, B steroids (classic) or biosuit (Quake), M medkit, H Holoduke. Classic adds 1/` kick, 6 throw bomb and G detonate. Quake adds numbered weapon slots, shared ammo pools, Quad Damage and hazard floors.</p>
          <label>
            Objective
            <input
              value={f.objective ?? ""}
              onChange={(e) => patch({ objective: e.target.value })}
            />
          </label>
          <div className="fps-editor-grid">
            <NumberField
              label="Starting health"
              value={f.health ?? 100}
              onChange={(v) => patch({ health: v ?? 100 })}
            />
            <NumberField
              label="Starting armor"
              value={f.armor ?? 0}
              onChange={(v) => patch({ armor: v ?? 0 })}
            />
            <NumberField
              label="Walk speed"
              value={f.moveSpeed ?? 3.4}
              onChange={(v) => patch({ moveSpeed: v ?? 3.4 })}
            />
            <NumberField
              label="Run multiplier"
              value={f.runMultiplier ?? 1.65}
              onChange={(v) => patch({ runMultiplier: v ?? 1.65 })}
            />
            <NumberField
              label="Jump impulse"
              value={f.jumpSpeed ?? 6.5}
              onChange={(v) => patch({ jumpSpeed: v ?? 6.5 })}
            />
            <NumberField
              label="Horizontal field of view"
              value={quake.fov ?? 90}
              step={1}
              onChange={(v) => onChange({ ...quake, fov: v ?? 90 })}
            />
            <NumberField
              label="Render height (pixels)"
              value={f.renderHeight ?? 360}
              step={1}
              onChange={(v) => patch({ renderHeight: v ?? 360 })}
            />
            <NumberField
              label="Fog distance"
              value={f.fogDistance ?? 65}
              onChange={(v) => patch({ fogDistance: v ?? 65 })}
            />
          </div>
          {f.weapons.map((w) => {
            const change = (p: Partial<FpsWeapon>) =>
              edit((f) => {
                f.weapons = f.weapons.map((x) =>
                  x.id === w.id ? { ...x, ...p } : x,
                );
              });
            return (
              <fieldset key={w.id}>
                <legend>
                  {w.name} · {w.id}
                </legend>
                <label>
                  Weapon name
                  <input
                    value={w.name}
                    onChange={(e) => change({ name: e.target.value })}
                  />
                </label>
                <AssetField
                  label={`${w.name} view sprite`}
                  storyId={storyId}
                  value={w.sheet?.image ?? w.image}
                  onChange={(v) =>
                    edit((f) => {
                      const weapon = f.weapons.find((x) => x.id === w.id);
                      if (weapon?.sheet) weapon.sheet.image = v;
                      else if (weapon) weapon.image = v;
                    })
                  }
                />
                <div className="fps-editor-grid">
                  <NumberField
                    label={`${w.name} view scale`}
                    value={w.view?.scale ?? 1}
                    onChange={(v) =>
                      change({ view: { ...w.view, scale: v ?? 1 } })
                    }
                  />
                  <NumberField
                    label={`${w.name} view horizontal offset`}
                    value={w.view?.x ?? 0.32}
                    onChange={(v) =>
                      change({ view: { ...w.view, x: v ?? 0.32 } })
                    }
                  />
                  <NumberField
                    label={`${w.name} view vertical offset`}
                    value={w.view?.y ?? -0.55}
                    onChange={(v) =>
                      change({ view: { ...w.view, y: v ?? -0.55 } })
                    }
                  />
                  <NumberField
                    label={`${w.name} damage`}
                    value={w.damage}
                    onChange={(v) => change({ damage: v ?? 1 })}
                  />
                  <NumberField
                    label={`${w.name} shot interval`}
                    value={w.interval}
                    onChange={(v) => change({ interval: v ?? 0.25 })}
                  />
                  <NumberField label={`${w.name} maximum ammo`} value={w.maxAmmo} step={1} onChange={(v) => change({ maxAmmo: v })} />
                  <NumberField label={`${w.name} keyboard slot`} value={w.slot} step={1} onChange={(v) => change({ slot: v })} />
                  <NumberField
                    label={`${w.name} starting ammo`}
                    value={w.ammo}
                    step={1}
                    onChange={(v) => change({ ammo: v ?? 0 })}
                  />
                  <NumberField
                    label={`${w.name} range`}
                    value={w.range}
                    onChange={(v) => change({ range: v ?? 25 })}
                  />
                  <NumberField
                    label={`${w.name} pellets`}
                    value={w.pellets ?? 1}
                    step={1}
                    onChange={(v) => change({ pellets: v ?? 1 })}
                  />
                  <NumberField
                    label={`${w.name} spread radians`}
                    value={w.spread ?? 0}
                    onChange={(v) => change({ spread: v ?? 0 })}
                  />
                  <NumberField
                    label={`${w.name} clip size (blank = no magazine)`}
                    value={w.clipSize}
                    step={1}
                    onChange={(v) => change({ clipSize: v })}
                  />
                  <NumberField
                    label={`${w.name} reload seconds`}
                    value={w.reloadTime ?? 0.8}
                    onChange={(v) => change({ reloadTime: v ?? 0.8 })}
                  />
                </div>
                <div className="fps-editor-grid">
                  <label className="fps-editor-check">
                    <input
                      type="checkbox"
                      checked={!!w.melee}
                      onChange={(e) => change({ melee: e.target.checked })}
                    />{" "}
                    Melee weapon (Quake axe — no ammo)
                  </label>
                  <label className="fps-editor-check">
                    <input
                      type="checkbox"
                      checked={!!w.starting}
                      onChange={(e) => change({ starting: e.target.checked })}
                    />{" "}
                    Owned from the start
                  </label>
                  <label>
                    Ammo pool (blank = own ammo)
                    <input
                      list="fps-ammo-pools"
                      value={w.ammoPool ?? ""}
                      placeholder="e.g. shells; shared by shotguns"
                      onChange={(e) =>
                        change({ ammoPool: e.target.value || undefined })
                      }
                    />
                    <datalist id="fps-ammo-pools">
                      {Array.from(
                        new Set(
                          f.weapons
                            .map((x) => x.ammoPool)
                            .filter((p): p is string => !!p),
                        ),
                      ).map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </label>
                </div>
                <label className="fps-editor-check">
                  <input
                    type="checkbox"
                    checked={!!w.projectile}
                    onChange={(e) =>
                      change(
                        e.target.checked
                          ? {
                              projectile: {
                                speed: 14,
                                gravity: 0,
                                bounce: 0,
                                fuse: 0,
                                splash: 2,
                                splashDamage: w.damage,
                                color: "#e8d38a",
                              },
                            }
                          : { projectile: undefined },
                      )
                    }
                  />{" "}
                  Launched projectile (nailgun, grenade launcher, rockets)
                </label>
                {w.projectile && (
                  <>
                    <div className="fps-editor-grid">
                      <NumberField label={`${w.name} projectile speed`} value={w.projectile.speed ?? 14} onChange={(v) => change({ projectile: { ...w.projectile!, speed: v ?? 14 } })} />
                      <NumberField label={`${w.name} projectile gravity`} value={w.projectile.gravity ?? 0} onChange={(v) => change({ projectile: { ...w.projectile!, gravity: v ?? 0 } })} />
                      <NumberField label={`${w.name} bounce (0–1)`} value={w.projectile.bounce ?? 0} onChange={(v) => change({ projectile: { ...w.projectile!, bounce: v ?? 0 } })} />
                    </div>
                    <div className="fps-editor-grid">
                      <NumberField label={`${w.name} fuse seconds (0 = impact)`} value={w.projectile.fuse ?? 0} onChange={(v) => change({ projectile: { ...w.projectile!, fuse: v ?? 0 } })} />
                      <NumberField label={`${w.name} splash radius`} value={w.projectile.splash ?? 2} onChange={(v) => change({ projectile: { ...w.projectile!, splash: v ?? 2 } })} />
                      <NumberField label={`${w.name} splash damage`} value={w.projectile.splashDamage ?? w.damage} onChange={(v) => change({ projectile: { ...w.projectile!, splashDamage: v ?? w.damage } })} />
                      <label>{`${w.name} projectile color`}<input type="color" value={w.projectile.color ?? "#e8d38a"} onChange={(e) => change({ projectile: { ...w.projectile!, color: e.target.value } })} /></label>
                    </div>
                  </>
                )}
                <label className="fps-editor-check">
                  <input
                    type="checkbox"
                    checked={!!w.sheet}
                    onChange={(e) =>
                      change(
                        e.target.checked
                          ? {
                              sheet: {
                                image: w.image ?? "",
                                frameWidth: 256,
                                frameHeight: 256,
                                animations: {
                                  idle: { frames: [0] },
                                  fire: {
                                    frames: [1, 2, 0],
                                    fps: 10,
                                    loop: false,
                                  },
                                  reload: { frames: [3] },
                                },
                              },
                            }
                          : { image: w.sheet?.image, sheet: undefined },
                      )
                    }
                  />{" "}
                  Animated weapon atlas
                </label>
                {w.sheet && (
                  <>
                    <div className="fps-editor-grid">
                      <NumberField
                        label={`${w.name} frame width`}
                        value={w.sheet.frameWidth}
                        step={1}
                        onChange={(v) =>
                          change({
                            sheet: { ...w.sheet!, frameWidth: v ?? 256 },
                          })
                        }
                      />
                      <NumberField
                        label={`${w.name} frame height`}
                        value={w.sheet.frameHeight}
                        step={1}
                        onChange={(v) =>
                          change({
                            sheet: { ...w.sheet!, frameHeight: v ?? 256 },
                          })
                        }
                      />
                    </div>
                    <JsonEditor
                      label={`${w.name} animations`}
                      value={w.sheet.animations}
                      onApply={(value) => {
                        const animations = value as NonNullable<
                          FpsWeapon["sheet"]
                        >["animations"];
                        for (const a of Object.values(animations))
                          if (
                            !Array.isArray(a.frames) ||
                            !a.frames.every(
                              (n) => Number.isInteger(n) && n >= 0,
                            )
                          )
                            throw new Error(
                              "Each animation needs non-negative integer frames",
                            );
                        change({ sheet: { ...w.sheet!, animations } });
                      }}
                    />
                  </>
                )}
              </fieldset>
            );
          })}
          <button
            type="button"
            onClick={() =>
              edit((f) =>
                f.weapons.push({
                  id: uid("weapon"),
                  name: "NEW WEAPON",
                  damage: 20,
                  interval: 0.4,
                  range: 25,
                  ammo: 0,
                }),
              )
            }
          >
            Add weapon
          </button>
          <p>
            First weapon is initially owned. Other weapons are collected through
            pickups. Weapons can be hitscan, melee (no ammo) or launched
            projectiles with gravity, bounce, fuse and splash. Weapons sharing
            an ammo pool (shells, nails, rockets, cells) draw and spend from
            one count; pickups for a pooled weapon add to the pool.
          </p>
        </>
      )}
    </div>
  );
}
