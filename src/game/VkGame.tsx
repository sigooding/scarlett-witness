import { useState } from "react";
import { assetUrl } from "../assetPath";
import type { VkConfig, VkQuestion } from "./VkTypes";

interface VkGameProps {
  config: VkConfig;
  onComplete: (verdictIsReplicant: boolean) => void;
  onCancel: () => void;
  resolve?: (value?: string) => string | undefined;
}

export function VkGame({ config, onComplete, onCancel, resolve = v => v }: VkGameProps) {
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [currentTension, setCurrentTension] = useState<number>(10);
  const [lastResponse, setLastResponse] = useState<string>(
    "VK SYSTEM CALIBRATED. BELLOWS REGULATING RESPIRATION AND IRIS RESPONSIVENESS."
  );
  const [verdict, setVerdict] = useState<"replicant" | "human" | null>(null);

  const threshold = config.tensionThreshold ?? 60;

  const handleAskQuestion = (q: VkQuestion) => {
    if (askedQuestions.has(q.id) || verdict) return;

    const newAsked = new Set(askedQuestions).add(q.id);
    setAskedQuestions(newAsked);

    const delta = config.subjectIsReplicant ? q.replicantTensionDelta : q.humanTensionDelta;
    const nextTension = Math.min(100, Math.max(0, currentTension + delta));
    setCurrentTension(nextTension);

    const respText = config.subjectIsReplicant ? q.replicantResponse : q.humanResponse;
    setLastResponse(`"${respText}"`);
  };

  const handleVerdict = (isReplicant: boolean) => {
    setVerdict(isReplicant ? "replicant" : "human");
    onComplete(isReplicant);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Voight-Kampff test" className="fixed inset-0 z-[200] overflow-y-auto bg-black/95 flex flex-col items-center justify-start md:justify-center p-4 font-mono text-amber-400 select-none">
      {/* VK Apparatus Screen Container */}
      <div className="relative w-full max-w-4xl bg-stone-950 border-4 border-amber-700/70 rounded-lg p-5 shadow-[0_0_60px_rgba(217,119,6,0.3)] flex flex-col gap-4">
        {/* CRT Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-40 z-20 rounded-lg" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-amber-800/80 pb-2">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]" />
            <h2 className="text-xl font-bold tracking-widest text-amber-300 uppercase">
              VOIGHT-KAMPFF EMOTIONAL RESPONSE MONITOR
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-amber-950 border border-amber-600 text-amber-300 hover:bg-amber-800 hover:text-white rounded transition text-xs uppercase"
          >
            ✕ Abort Test
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Iris Monitor & Tension Meter */}
          <div className="flex flex-col gap-3">
            {/* Eye / Iris Viewport */}
            <div className="relative aspect-video bg-black border-2 border-amber-800/90 rounded overflow-hidden flex items-center justify-center">
              {/* No built-in iris picture (the Blade Runner one went with that story): without one the monitor stays black under the reticle. */}
              {config.eyeImage && (
                <img
                  src={assetUrl(resolve(config.eyeImage))}
                  alt="Subject Iris"
                  className="w-full h-full object-cover filter contrast-125"
                  style={{
                    transform: `scale(${1 + currentTension / 200})`,
                    transition: "transform 0.8s ease-out",
                  }}
                />
              )}

              {/* Optical Reticle overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-amber-500/30 rounded-full scale-75 animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-24 h-24 border border-amber-400/60 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
                </div>
              </div>

              {/* Subject Tag */}
              <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-amber-700/60 text-[10px] text-amber-300 rounded uppercase">
                SUBJECT: {config.subjectName}
              </div>
            </div>

            {/* Tension Gauge & Respiration Monitor */}
            <div className="bg-stone-900/90 border border-amber-800/80 p-3 rounded flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-amber-300 font-bold uppercase">
                <span>Capillary Dilation & Tension Gauge</span>
                <span className={currentTension >= threshold ? "text-red-400 font-extrabold animate-pulse" : "text-amber-400"}>
                  {currentTension}% / {threshold}% Threshold
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-4 bg-black border border-amber-700/80 rounded overflow-hidden p-0.5">
                <div
                  className={`h-full transition-all duration-500 ${
                    currentTension >= threshold ? "bg-gradient-to-r from-amber-500 to-red-600 shadow-[0_0_10px_#ef4444]" : "bg-amber-500"
                  }`}
                  style={{ width: `${currentTension}%` }}
                />
              </div>

              {/* Respiration Graph Simulation */}
              <div className="h-8 bg-black/90 border border-amber-900/80 rounded flex items-center px-2 overflow-hidden">
                <div className="w-full flex items-center justify-between text-[9px] text-amber-600 font-mono">
                  <span>PULSE: {60 + Math.round(currentTension * 0.8)} BPM</span>
                  <span>IRIS FLUX: {(currentTension * 0.04).toFixed(2)} mm</span>
                  <span>RESPIRATION: STABLE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question Protocols & Response Log */}
          <div className="flex flex-col justify-between bg-stone-900/90 border border-amber-800/80 p-3 rounded gap-3">
            <div>
              <h3 className="text-xs uppercase text-amber-400 border-b border-amber-900 pb-1 mb-2 font-semibold">
                VK Inquiry Protocols
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {config.questions.map((q) => {
                  const isAsked = askedQuestions.has(q.id);
                  return (
                    <button
                      key={q.id}
                      disabled={isAsked || !!verdict}
                      onClick={() => handleAskQuestion(q)}
                      className={`w-full text-left p-2 rounded text-xs border transition flex flex-col gap-1 ${
                        isAsked
                          ? "bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed"
                          : "bg-amber-950/40 border-amber-700/70 text-amber-200 hover:bg-amber-900/60 hover:border-amber-400"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-amber-500 font-bold uppercase">
                        <span>[{q.type.toUpperCase()}]</span>
                        <span>{isAsked ? "ASKED ✓" : "SELECT PROTOCOL"}</span>
                      </div>
                      <p className="line-clamp-2">{q.prompt}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Response Display */}
            <div className="bg-black border border-amber-900 p-2.5 rounded text-xs text-amber-300 font-mono min-h-20">
              <div className="text-[10px] text-amber-600 uppercase mb-1 font-semibold">Subject Response</div>
              <p className="leading-snug text-amber-200 italic">{lastResponse}</p>
            </div>

            {/* Final Verdict Controls */}
            <div className="border-t border-amber-900/80 pt-2 flex flex-col gap-1.5">
              <div className="text-[10px] text-amber-500 uppercase font-semibold text-center">
                Issue Final Voight-Kampff Verdict
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleVerdict(false)}
                  disabled={!!verdict}
                  className="py-2 px-2 bg-emerald-950 border border-emerald-600 text-emerald-300 hover:bg-emerald-800 hover:text-white rounded text-xs font-bold uppercase transition"
                >
                  ✓ VERDICT: HUMAN
                </button>
                <button
                  onClick={() => handleVerdict(true)}
                  disabled={!!verdict}
                  className="py-2 px-2 bg-red-950 border border-red-600 text-red-300 hover:bg-red-800 hover:text-white rounded text-xs font-bold uppercase transition"
                >
                  ⚠ VERDICT: REPLICANT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
