import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../assetPath";
import { SheetSprite } from "../game/SheetSprite";
import { sheetDrawable, type SpriteSheet } from "../game/spriteSheet";

/* ------------------------------------------------------------------ */
/*  SpriteBoxEditor — drag-to-place / drag-to-resize sprite preview.   */
/*                                                                     */
/*  Shows the sprite over the actual scene plate using the SAME maths  */
/*  the game uses, so what you place here is what plays:               */
/*   - mode "extra":   left X% / top Y%, bottom-centre anchored,       */
/*                     height = scale × frame height.                  */
/*   - mode "talking": left X% / bottom Y%, height = 72% × scale       */
/*                     (clamped 20–96%) — identical to StageSprite.    */
/*                                                                     */
/*  Drag the sprite to move it. Drag the ◢ corner handle (or scroll    */
/*  the mouse wheel over the frame) to resize.                         */
/* ------------------------------------------------------------------ */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function SpriteBoxEditor({
  mode,
  backgroundUrl,
  image,
  sheet,
  x,
  y,
  scale,
  flip,
  resolve,
  onChange,
}: {
  mode: "extra" | "talking";
  /** resolved scene plate url (image or "video:<url>"); dark backdrop when missing */
  backgroundUrl?: string;
  /** resolved static sprite url (used when no drawable sheet) */
  image?: string;
  sheet?: SpriteSheet;
  x: number;
  y: number;
  scale: number;
  flip?: boolean;
  resolve?: (v?: string) => string | undefined;
  onChange: (patch: { x?: number; y?: number; scale?: number }) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<null | { kind: "move" | "resize"; startY: number; startScale: number }>(null);
  const [expanded, setExpanded] = useState(false);

  // Full-screen mode is useful for checking silhouette, transparent edges and
  // frame pacing at the size the player will actually see. Escape always gets
  // the author back to the editor without changing any authored values.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const scaleLo = mode === "extra" ? 0.2 : 0.3;
  const scaleHi = mode === "extra" ? 2.5 : 2;
  const yHi = mode === "extra" ? 100 : 60;

  const hasSheet = sheetDrawable(sheet);
  const src = image ? assetUrl(image) : undefined;
  if (!hasSheet && !src) return null;

  const isVideo = !!backgroundUrl?.startsWith("video:");
  const bgUrl = isVideo ? backgroundUrl!.slice(6) : backgroundUrl;

  const moveTo = (clientX: number, clientY: number) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r || r.width <= 0) return;
    const px = clamp(((clientX - r.left) / r.width) * 100, 0, 100);
    const pyTop = clamp(((clientY - r.top) / r.height) * 100, 0, 100);
    onChange(
      mode === "extra"
        ? { x: Math.round(px), y: Math.round(pyTop) }
        : { x: Math.round(px), y: Math.round(clamp(100 - pyTop, 0, yHi)) }
    );
  };

  // Engine-truthful sprite box style per mode.
  const spriteStyle: React.CSSProperties =
    mode === "extra"
      ? {
          left: `${x}%`,
          top: `${y}%`,
          height: `${(scale * 100).toFixed(1)}%`,
          transform: "translate(-50%, -100%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }
      : {
          left: `${x}%`,
          bottom: `${y}%`,
          height: `${Math.min(96, Math.max(20, 72 * Math.max(0.2, scale)))}%`,
          transform: "translateX(-50%)",
        };

  return (
    <div className="space-y-1">
      <div
        ref={frameRef}
        className={`relative aspect-video w-full touch-none select-none overflow-hidden border border-gold/30 bg-noir-950 ${expanded ? "fixed inset-4 z-[100] m-auto max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] shadow-[0_0_0_9999px_rgba(3,5,12,.88),0_0_40px_rgba(232,178,60,.35)]" : ""}`}
        style={
          !isVideo && bgUrl
            ? { backgroundImage: `url(${assetUrl(bgUrl)})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
        onWheel={(e) => {
          e.preventDefault();
          onChange({ scale: Math.round(clamp(scale + (e.deltaY < 0 ? 0.05 : -0.05), scaleLo, scaleHi) * 100) / 100 });
        }}
        onPointerDown={(e) => {
          drag.current = { kind: "move", startY: e.clientY, startScale: scale };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          moveTo(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          if (d.kind === "move") moveTo(e.clientX, e.clientY);
          else {
            // Dragging the corner down = bigger, up = smaller.
            const next = clamp(d.startScale + (e.clientY - d.startY) / 140, scaleLo, scaleHi);
            onChange({ scale: Math.round(next * 100) / 100 });
          }
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        title="Drag to place the sprite · drag the ◢ corner or scroll to resize"
      >
        {isVideo && bgUrl && (
          <video src={assetUrl(bgUrl)} muted loop autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-between gap-2">
          <span className="border border-noir-700 bg-noir-950/80 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/70">
            {hasSheet ? "🎞 sheet preview" : "🖼 foreground preview"}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="border border-gold/60 bg-noir-950/90 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/15"
            title={expanded ? "Close full-screen preview (Escape)" : "Open full-screen preview"}
          >
            {expanded ? "✕ close preview" : "⛶ full screen"}
          </button>
        </div>
        {/* the sprite, engine-positioned */}
        <div className="absolute cursor-move" style={spriteStyle}>
          <div className="relative h-full" style={flip ? { transform: "scaleX(-1)" } : undefined}>
            {hasSheet ? (
              <SheetSprite
                sheet={sheet!}
                anim={mode === "extra" ? "loop" : "talk"}
                fallbacks={mode === "extra" ? ["idle", "walk", "talk", "rest"] : ["rest", "idle", "loop"]}
                height="100%"
                resolve={resolve}
              />
            ) : (
              <img src={src} alt="" draggable={false} className="h-full w-auto max-w-none object-contain" />
            )}
          </div>
          {/* resize handle — outside the flip so it never mirrors away */}
          <div
            className="absolute -bottom-1 -right-1 z-[3] flex h-4 w-4 cursor-nwse-resize items-center justify-center border border-gold bg-noir-950/90 text-[8px] leading-none text-gold shadow-[0_0_6px_rgba(232,178,60,.6)]"
            onPointerDown={(e) => {
              e.stopPropagation();
              drag.current = { kind: "resize", startY: e.clientY, startScale: scale };
              (e.currentTarget.parentElement?.parentElement as HTMLElement)?.setPointerCapture(e.pointerId);
            }}
            title="Drag to resize"
          >
            ◢
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-1 z-[2] flex justify-center gap-2 text-center font-pulp text-[8px] uppercase tracking-widest text-paper/70">
          <span className="bg-noir-950/65 px-2 py-1">Drag to place · corner ◢ or scroll to resize</span>
          {expanded && <span className="bg-noir-950/65 px-2 py-1 text-gold">Escape to close · values save live</span>}
        </div>
      </div>
      <p className="font-type text-[8px] text-paper/40">
        X {Math.round(x)}% · {mode === "extra" ? "Y" : "lift"} {Math.round(y)}% · scale {scale.toFixed(2)}× — matches the in-game position exactly.
      </p>
    </div>
  );
}
