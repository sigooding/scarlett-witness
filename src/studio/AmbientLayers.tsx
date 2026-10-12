import { audio } from "../audio";
import { AssetDropdown, MediaUploadButton } from "./MediaLibrary";
import { inputCls } from "./studioLeaves";
import { AMBIENT_PRESETS, joinAmbient, parseAmbient } from "./ambientParts";

export function AmbientLayers({
  storyId,
  value,
  onChange,
  media,
}: {
  storyId: string;
  value: string | undefined;
  onChange: (next: string) => void;
  /** resolves `asset:<id>` to something playable, for the preview button */
  media: (v?: string) => string | undefined;
}) {
  const { preset, loops, other } = parseAmbient(value);
  const labelOf = (l: string) => (l.startsWith("asset:") ? "uploaded loop" : decodeURIComponent(l.split("/").pop() ?? l));
  return (
    <div className="space-y-1">
      <select
        className={inputCls}
        aria-label="Synth ambient preset"
        value={preset}
        onChange={(e) => onChange(joinAmbient(e.target.value, loops, other))}
      >
        {AMBIENT_PRESETS.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      {loops.map((l, i) => (
        <div key={`${l}-${i}`} className="flex items-center gap-2 border border-cyan-neon/20 bg-cyan-neon/5 px-2 py-1 font-type text-[10px] text-paper/80">
          <span className="flex-1 truncate" title={l}>🔁 {labelOf(l)}</span>
          <button
            type="button"
            className="border border-cyan-neon/40 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
            title="Hear the loop"
            onClick={() => audio.playSfx(media(l) ?? l, 0.8)}
          >
            ▶
          </button>
          <button
            type="button"
            aria-label={`Remove recorded loop ${labelOf(l)}`}
            className="border border-crimson/40 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
            onClick={() => onChange(joinAmbient(preset, loops.filter((_, j) => j !== i), other))}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-1">
        <MediaUploadButton
          storyId={storyId}
          accept="audio/*"
          label="⇧ Upload loop"
          onUploaded={(_url, assetId) => onChange(joinAmbient(preset, [...loops, `asset:${assetId}`], other))}
        />
        <div className="flex-1">
          <AssetDropdown
            storyId={storyId}
            assetType="audio"
            returnReference
            onChange={(url) => url && onChange(joinAmbient(preset, [...loops, url], other))}
            placeholder="Add an uploaded recorded loop…"
          />
        </div>
      </div>
      <p className="font-type text-[9px] leading-snug text-paper/45">
        Layers play together, looping: the synth preset and any recorded loops (room tone, a distant train, a vending machine).
      </p>
    </div>
  );
}
