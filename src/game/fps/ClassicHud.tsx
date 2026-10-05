import { useEffect, useState } from "react";
import { assetUrl } from "../../assetPath";
import { resolveAssetReference } from "../../data/mediaLibrary";
import { EQUIPMENT, inventoryActive, inventoryAmount } from "./inventory";
import type { FpsSettings, FpsSnapshot } from "./types";

export function NuclearMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="29" fill="currentColor" />
    <g fill="#24251e">
      <circle cx="32" cy="32" r="6" />
      {[0, 120, 240].map((angle) => <path key={angle} transform={`rotate(${angle} 32 32)`}
        d="M23 27 13 10A27 27 0 0 1 51 10L41 27A11 11 0 0 0 23 27Z" />)}
    </g>
  </svg>;
}
function ItemPicture({ src }: { src?: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let cancelled = false;
    setUrl("");
    if (src?.startsWith("asset:")) void resolveAssetReference(src).then((v) => { if (!cancelled) setUrl(v ?? ""); });
    else setUrl(src ? assetUrl(src) : "");
    return () => { cancelled = true; };
  }, [src]);
  return url ? <img src={url} alt="" draggable={false} /> : <span className="fps-empty-item">—</span>;
}
export function ClassicHud({ config, snapshot, onCycle, onUse, onWeapon }: {
  config: FpsSettings;
  snapshot: FpsSnapshot | null;
  onCycle: (direction: number) => void;
  onUse: () => void;
  onWeapon: (id: string) => void;
}) {
  const p = snapshot?.player;
  const selected = p?.inventorySelected;
  const amount = p && selected ? inventoryAmount(p, selected) : 0;
  const active = !!(p && selected && inventoryActive(p, selected));
  const selectedSprite = config.sprites.find((s) => s.pickup?.itemId === selected && selected);
  return <footer className="fps-hud fps-classic-hud" aria-label="First-person status">
    <div className="fps-hud-emblem"><NuclearMark /><span>DUKE</span></div>
    <div className={`fps-status-number ${p && p.health < 25 ? "is-critical" : ""}`}>
      <small>HEALTH</small><strong data-fps-health>{Math.ceil(p?.health ?? 100)}</strong>
    </div>
    <div className="fps-status-number">
      <small>AMMO</small><strong data-fps-ammo>{p?.ammo[p.weapon] ?? 48}</strong>
      <span className="fps-weapon-name">{config.weapons.find((w) => w.id === p?.weapon)?.name ?? "PISTOL"}</span>
    </div>
    <div className="fps-status-number">
      <small>ARMOR</small><strong>{Math.ceil(p?.armor ?? 0)}</strong>
    </div>
    <div className="fps-classic-weapons" aria-label="Weapon ammunition">
      {[2, 3, 4, 5, 6, 7, 8, 9, 0].map((slot) => {
        const w = config.weapons.find((w) => w.slot === slot);
        const owned = !!w && !!p?.weapons.includes(w.id);
        const bombs = slot === 6 && p ? inventoryAmount(p, "pipebombs") : 0;
        return <button key={slot} className={`${owned || bombs ? "is-owned" : ""} ${w?.id === p?.weapon ? "is-selected" : ""}`}
          type="button" disabled={!owned && !bombs}
          aria-label={w ? `Select ${w.name}` : slot === 6 ? "Throw pipe bomb" : `Weapon slot ${slot} unavailable`}
          onClick={() => { if (w) onWeapon(w.id); else if (slot === 6) onWeapon("pipebombs"); }}>
          <b>{slot}</b><span>{owned && p && w ? p.ammo[w.id] : bombs || 0}</span><i>/{w?.maxAmmo ?? (slot === 6 ? 50 : 0)}</i>
        </button>;
      })}
    </div>
    <div className="fps-classic-inventory">
      <small>INVENTORY</small>
      <div className="fps-item-slot">
        <button type="button" onClick={() => onCycle(-1)} aria-label="Previous inventory item">‹</button>
        <button type="button" className="fps-inventory-use" onClick={onUse} aria-label={`Use ${selected ? EQUIPMENT[selected]?.name ?? selected : "inventory item"}`}>
          <ItemPicture src={selectedSprite?.image} />
          <span>{Math.ceil(amount)}{selected === "pipebombs" ? "" : "%"}</span>
          <em className={active ? "is-active" : ""}>{active ? "ON" : "OFF"}</em>
        </button>
        <button type="button" onClick={() => onCycle(1)} aria-label="Next inventory item">›</button>
      </div>
      <span className="fps-item-name" data-fps-inventory>{selected ? EQUIPMENT[selected]?.name ?? selected : "NONE"}</span>
    </div>
    <div className="fps-classic-access">
      <small>ACCESS</small>
      <div className="fps-card-lights" aria-label={`Access cards: ${p?.keys.join(", ") || "none"}`}>
        {["blue", "red", "yellow"].map((color) => <span key={color} className={`fps-card ${color} ${p?.keys.includes(color) ? "is-owned" : ""}`}>
          <span>{color.toUpperCase()}</span>
        </span>)}
      </div>
      <span className="fps-hud-tally">K <b data-fps-kills>{snapshot?.kills ?? 0}</b> · S <b>{snapshot?.secrets.length ?? 0}</b></span>
    </div>
  </footer>;
}
