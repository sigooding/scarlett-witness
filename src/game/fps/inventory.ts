import type { FpsPlayer } from "./types";

export const EQUIPMENT: Record<string, { name: string; key: string; charge: number; drain?: number }> = {
  medkit: { name: "PORTABLE MEDKIT", key: "M", charge: 100 },
  steroids: { name: "STEROIDS", key: "B", charge: 100, drain: 10 },
  jetpack: { name: "JETPACK", key: "J", charge: 100, drain: 2 },
  nightvision: { name: "NIGHT VISION", key: "N", charge: 100, drain: 2 },
  holoduke: { name: "HOLODUKE", key: "H", charge: 100, drain: 4 },
  pipebombs: { name: "PIPE BOMBS", key: "6", charge: 5 },
  /** Quake-style environmental suit: negates hazard-floor damage while it
   * drains (~30 seconds of protection). */
  biosuit: { name: "BIOSUIT", key: "B", charge: 100, drain: 3.33 },
};
export const inventoryAmount = (p: FpsPlayer, id: string) =>
  p.inventoryAmounts?.[id] ?? ((p.inventory ?? []).includes(id) ? EQUIPMENT[id]?.charge ?? 100 : 0);
export const inventoryActive = (p: FpsPlayer, id: string) =>
  (p.activeInventory ?? []).includes(id) && inventoryAmount(p, id) > 0;

/** Old saves stored names only. Give those items their default charge without
 * dropping unknown author-defined inventory or trusting non-finite amounts. */
export function restoreInventory(p: FpsPlayer) {
  const amounts = p.inventoryAmounts ?? {};
  p.inventoryAmounts = Object.fromEntries((p.inventory ?? []).map((id) => {
    const amount = amounts[id];
    return [id, typeof amount === "number" && Number.isFinite(amount)
      ? Math.max(0, Math.min(id === "pipebombs" ? 50 : 100, amount))
      : EQUIPMENT[id]?.charge ?? 100];
  }));
  p.activeInventory = (p.activeInventory ?? []).filter((id) =>
    !!EQUIPMENT[id]?.drain && inventoryAmount(p, id) > 0);
  if (!(p.inventory ?? []).includes(p.inventorySelected ?? "")) p.inventorySelected = p.inventory?.[0];
  if (!inventoryActive(p, "holoduke")) p.holoduke = undefined;
}
