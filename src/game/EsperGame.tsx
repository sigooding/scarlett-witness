import { useState } from "react";
import { assetUrl } from "../assetPath";
import type { EsperConfig, EsperRegion } from "./EsperTypes";

interface EsperGameProps {
  config: EsperConfig;
  onComplete: (region: EsperRegion, allTargetsDone: boolean) => void;
  onCancel: () => void;
  resolve?: (value?: string) => string | undefined;
}

export function EsperGame({ config, onComplete, onCancel, resolve = v => v }: EsperGameProps) {
  const [selectedRegion, setSelectedRegion] = useState<EsperRegion | null>(null);
  const [enhancedRegions, setEnhancedRegions] = useState<Set<string>>(new Set());
  const [activeZoom, setActiveZoom] = useState<EsperRegion | null>(null);
  const [logMessage, setLogMessage] = useState<string>(
    config.instruction || "ESPER PHOTO ANALYSIS SYSTEM v2.01 // SELECT GRID SECTOR TO ENHANCE"
  );

  const handleSelectRegion = (region: EsperRegion) => {
    setSelectedRegion(region);
    setLogMessage(`SECTOR REGION SELECTED: ${region.label.toUpperCase()} [${region.x}, ${region.y}]`);
  };

  const handleEnhance = () => {
    if (!selectedRegion) return;
    setActiveZoom(selectedRegion);
    const updated = new Set(enhancedRegions).add(selectedRegion.id);
    setEnhancedRegions(updated);
    setLogMessage(`ENHANCING SECTOR... ${selectedRegion.clueText}`);

    const targets = config.regions.filter((r) => r.isTarget);
    const allDone = targets.length > 0
      ? targets.every((t) => updated.has(t.id))
      : updated.size >= config.regions.length;

    onComplete(selectedRegion, allDone);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="ESPER photo analysis" className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 flex flex-col items-center justify-start md:justify-center p-4 font-mono text-cyan-400 select-none">
      {/* ESPER CRT Bezel */}
      <div className="relative w-full max-w-4xl bg-slate-950 border-4 border-cyan-700/60 rounded-lg p-4 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col gap-4">
        {/* CRT Scanline overlay effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40 z-20 rounded-lg" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-800 pb-2">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xl font-bold tracking-widest text-cyan-300 uppercase">
              {config.title || "ESPER PHOTO ANALYSIS SYSTEM"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-cyan-950 border border-cyan-600 text-cyan-300 hover:bg-cyan-800 hover:text-white rounded transition text-sm uppercase"
          >
            ✕ Exit ESPER
          </button>
        </div>

        {/* Main Display Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Photo Canvas / Viewport */}
          <div className="md:col-span-2 relative aspect-[4/3] bg-black border-2 border-cyan-800 rounded overflow-hidden">
            <img
              src={assetUrl(resolve(activeZoom?.enhancedImage || config.photoImage))}
              alt="ESPER Photo"
              className="w-full h-full object-cover transition-transform duration-500"
            />

            {/* Region Overlays on unzoomed view */}
            {!activeZoom &&
              config.regions.map((region) => {
                const isSelected = selectedRegion?.id === region.id;
                const isEnhanced = enhancedRegions.has(region.id);
                return (
                  <button
                    key={region.id}
                    onClick={() => handleSelectRegion(region)}
                    style={{
                      left: `${region.x}%`,
                      top: `${region.y}%`,
                      width: `${region.w}%`,
                      height: `${region.h}%`,
                    }}
                    className={`absolute border-2 transition-all ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                        : isEnhanced
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-cyan-500/60 hover:border-cyan-300 bg-cyan-500/10"
                    }`}
                  >
                    <span className="absolute top-1 left-1 text-[10px] bg-black/80 px-1 text-cyan-300 font-bold rounded">
                      {region.label} {isEnhanced ? "✓" : ""}
                    </span>
                  </button>
                );
              })}

            {/* Crosshair Overlay */}
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-cyan-500/10 text-[9px] p-1 text-cyan-700 font-mono">
                  S-{i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Control Panel & Log */}
          <div className="flex flex-col justify-between bg-slate-900/80 border border-cyan-800/80 p-3 rounded gap-3">
            <div>
              <h3 className="text-xs uppercase text-cyan-500 border-b border-cyan-900 pb-1 mb-2 font-semibold">
                Control Commands
              </h3>

              <div className="flex flex-col gap-2">
                <button
                  disabled={!selectedRegion}
                  onClick={handleEnhance}
                  className={`w-full py-2.5 px-3 rounded text-sm font-bold tracking-wider uppercase border transition ${
                    selectedRegion
                      ? "bg-amber-600 border-amber-400 text-black hover:bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                      : "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  🔍 Track & Enhance
                </button>

                {activeZoom && (
                  <button
                    onClick={() => setActiveZoom(null)}
                    className="w-full py-1.5 px-3 bg-cyan-900 border border-cyan-600 text-cyan-200 hover:bg-cyan-800 rounded text-xs uppercase"
                  >
                    ↩ Wide Angle View
                  </button>
                )}
              </div>

              {/* Regions List */}
              <div className="mt-4">
                <div className="text-[11px] text-cyan-400 border-b border-cyan-900 pb-1 mb-1 font-semibold uppercase">
                  Identified Sectors
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {config.regions.map((r) => {
                    const isEnhanced = enhancedRegions.has(r.id);
                    const isSel = selectedRegion?.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleSelectRegion(r)}
                        className={`text-xs p-1.5 rounded cursor-pointer border flex justify-between items-center transition ${
                          isSel
                            ? "bg-amber-950/80 border-amber-500 text-amber-300"
                            : isEnhanced
                            ? "bg-emerald-950/50 border-emerald-700 text-emerald-300"
                            : "bg-slate-950 border-cyan-900/60 hover:bg-cyan-950 text-cyan-300"
                        }`}
                      >
                        <span>{r.label}</span>
                        <span>{isEnhanced ? "ENHANCED ✓" : "RAW"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Readout Log */}
            <div className="bg-black/90 border border-cyan-900 p-2.5 rounded text-xs text-cyan-300 font-mono min-h-20 flex flex-col justify-end">
              <div className="text-[10px] text-cyan-600 uppercase mb-1 font-semibold">System Output</div>
              <p className="leading-snug text-emerald-400 font-mono">{logMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
