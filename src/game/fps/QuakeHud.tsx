import { EQUIPMENT, inventoryActive, inventoryAmount } from "./inventory";
import type { FpsSettings, FpsSnapshot } from "./types";

/** Quake-style status bar: brown metal strip, gold numerals, numbered weapon
 * slots, ammo counts per slot, Quad Damage timer and biosuit charge. */
export function QuakeHud({
  config,
  snapshot,
  onWeapon,
  onUseInventory,
}: {
  config: FpsSettings;
  snapshot: FpsSnapshot | null;
  onWeapon: (id: string) => void;
  onUseInventory: (id: string) => void;
}) {
  const p = snapshot?.player;
  const weapons = config.weapons.filter((w) => w.slot !== undefined);
  const current = config.weapons.find((w) => w.id === p?.weapon);
  const ammoFor = (w: { id: string; ammoPool?: string }) =>
    w.ammoPool ? (p?.pools?.[w.ammoPool] ?? 0) : (p?.ammo[w.id] ?? 0);
  const quadLeft = p?.quadUntil ? Math.max(0, p.quadUntil - (snapshot?.time ?? 0)) : 0;
  const biosuit = p ? inventoryAmount(p, "biosuit") : 0;
  return (
    <footer className="fps-hud fps-quake-hud" aria-label="First-person status">
      <div className="fps-quake-emblem" aria-hidden="true">QUAKE</div>
      <div className={`fps-status-number ${p && p.health < 25 ? "is-critical" : ""}`}>
        <small>HEALTH</small>
        <strong data-fps-health>{Math.ceil(p?.health ?? 100)}</strong>
      </div>
      <div className="fps-status-number">
        <small>ARMOR</small>
        <strong>{Math.ceil(p?.armor ?? 0)}</strong>
      </div>
      <div className="fps-status-number">
        <small>{current?.ammoPool ? current.ammoPool.toUpperCase() : "AMMO"}</small>
        <strong data-fps-ammo>{current?.melee ? "—" : current ? ammoFor(current) : 0}</strong>
        <span className="fps-weapon-name">{current?.name ?? "NONE"}</span>
      </div>
      <div className="fps-quake-weapons" aria-label="Weapon ammunition">
        {[...Array(8)].map((_, i) => {
          const slot = i + 1;
          const w = config.weapons.find((w) => w.slot === slot);
          const owned = !!w && !!p?.weapons.includes(w.id);
          return (
            <button
              key={slot}
              type="button"
              className={`${owned ? "is-owned" : ""} ${w?.id === p?.weapon ? "is-selected" : ""}`}
              disabled={!owned}
              aria-label={w ? `Select ${w.name}` : `Weapon slot ${slot} unavailable`}
              onClick={() => w && onWeapon(w.id)}
            >
              <b>{slot}</b>
              <span>{owned && w ? (w.melee ? "—" : ammoFor(w)) : ""}</span>
              <i>{w?.name ?? "·"}</i>
            </button>
          );
        })}
      </div>
      <div className="fps-quake-items">
        <small>ITEMS</small>
        <button
          type="button"
          className={`fps-quake-biosuit ${biosuit > 0 ? "is-owned" : ""} ${p && inventoryActive(p, "biosuit") ? "is-active" : ""}`}
          disabled={biosuit <= 0}
          onClick={() => onUseInventory("biosuit")}
          aria-label={p && inventoryActive(p, "biosuit") ? "Biosuit on" : "Use biosuit"}
        >
          {p && inventoryActive(p, "biosuit") ? `SUIT ${Math.ceil(biosuit)}%` : "BIOSUIT"}
        </button>
        <span className={`fps-quake-quad ${quadLeft > 0 ? "is-active" : ""}`} data-fps-quad>
          {quadLeft > 0 ? `QUAD ${Math.ceil(quadLeft)}` : "QUAD"}
        </span>
      </div>
      <div className="fps-hud-tally">
        K <b data-fps-kills>{snapshot?.kills ?? 0}</b> · S <b>{snapshot?.secrets.length ?? 0}</b>
        {config.credit ? <em>{config.credit}</em> : null}
      </div>
      <div className="fps-hud-help">
        WASD MOVE · F FIRE · E USE · SPACE JUMP
        <br />
        1–{Math.max(1, ...weapons.map((w) => w.slot ?? 1))} WEAPONS · B {EQUIPMENT.biosuit?.name}
      </div>
    </footer>
  );
}
