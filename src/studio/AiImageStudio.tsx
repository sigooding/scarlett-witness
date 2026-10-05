import { useState } from "react";
import { uploadDataUrlAsset, useStorageAvailable } from "../data/mediaLibrary";
import {
  AI_PROVIDERS,
  generateAiImage,
  loadAiSettings,
  GEMINI_ASPECT_RATIOS,
  openaiSizesForModel,
  providerReferenceSupport,
  saveAiSettings,
  type AiImageSettings,
  type AiProviderId,
  type AiProviderSettings,
} from "../data/aiImages";
import { FORGE_SIZES, FORGE_STRENGTHS, forgeSpriteSheet, type ForgedSheet, type ForgeKind } from "./spriteForge";

const inputCls =
  "w-full border border-noir-600 bg-noir-950 px-2 py-1 text-xs text-paper focus:border-neon outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-wider text-paper/50">
      {label}
      <div className="mt-0.5 normal-case tracking-normal">{children}</div>
    </label>
  );
}

/** Noir style suffix appended to every prompt so generated art matches the
 * game's look. Toggleable and editable — turn it off for full control. */
const NOIR_SUFFIX = "film noir, dark moody palette with gold and neon accents, cinematic lighting, film grain, no text";

const OPENAI_MODELS = [
  { id: "gpt-image-1", label: "gpt-image-1 (1024–1536px)" },
  { id: "dall-e-3", label: "dall-e-3 (1024–1792px)" },
];
// Size options come from openaiSizesForModel — the two OpenAI model
// families accept different size sets and an invalid pair is a hard 400.
// Nano Banana models, cheapest-first. 2.5-flash-image is the long-standing
// default; the 3.x models are newer and pricier.
const GEMINI_MODELS = [
  { id: "gemini-2.5-flash-image", label: "Nano Banana (2.5 Flash Image)" },
  { id: "gemini-3.1-flash-lite-image", label: "Nano Banana 2 Lite (fastest/cheapest)" },
  { id: "gemini-3.1-flash-image", label: "Nano Banana 2 (best all-round)" },
  { id: "gemini-3-pro-image", label: "Nano Banana Pro (highest quality)" },
];
// NOTE: FLUX.1-schnell-Free was withdrawn from Together's serverless API, so
// it is deliberately not offered — selecting it only ever produced a 404.
const TOGETHER_MODELS = [
  { id: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 schnell" },
  { id: "black-forest-labs/FLUX.1-dev", label: "FLUX.1 dev" },
  { id: "stabilityai/stable-diffusion-3.5-large", label: "SD 3.5 Large" },
];
const A1111_SAMPLERS = ["DPM++ 2M Karras", "DPM++ SDE Karras", "Euler a", "Euler", "DDIM", "UniPC"];
const COMFY_SAMPLERS = ["euler", "euler_ancestral", "dpmpp_2m", "dpmpp_2m_sde", "ddim"];
const COMFY_SCHEDULERS = ["normal", "karras", "exponential", "sgm_uniform"];

const PROMPT_IDEAS = [
  "Rain-slick alley at night, neon signs",
  "Femme fatale portrait in a trench coat",
  "Harbor under a pier, storm rolling in",
  "Vintage detective office, venetian blinds",
];

/**
 * Per-provider connection instructions — swaps with the selected generator.
 * Kept in step with src/data/aiImages.ts: the endpoints, launch flags and key
 * locations named here are exactly what that module calls. `providerLabel`
 * is the short provider name for the header.
 */
function ProviderInstructions({ provider, model, providerLabel }: { provider: AiProviderId; model?: string; providerLabel: string }) {
  const items: string[] = [];
  switch (provider) {
    case "openai":
      items.push(
        "Get a key: platform.openai.com → API keys, then add a few dollars of credit under Billing (you pay per image).",
        "What gets called: POST api.openai.com/v1/images/generations with your key in the Authorization header — straight from this browser, nothing in between.",
        /^gpt-image/.test(model ?? "gpt-image-1")
          ? "gpt-image-1: sizes 1024x1024, 1536x1024, 1024x1536. Accepts a reference image (edit endpoint) — the model decides how closely to follow it. Always returns base64."
          : "dall-e-3: sizes 1024x1024, 1792x1024, 1024x1792. Text-only — reference-image style transfer is not available on this model.",
        "The rendered image appears under the Generate button; save it to the media library to reuse it in any picker.",
      );
      break;
    case "gemini":
      items.push(
        "Get a key: aistudio.google.com/apikey — free to create, with a free tier that covers a lot of casual use.",
        "What gets called: POST generativelanguage.googleapis.com/v1beta/models/<model>:generateContent with your key in the x-goog-api-key header — straight from this browser, nothing in between.",
        "Reference images work: the picture is sent alongside the prompt and the model edits it. There is no match slider — Gemini decides how far to move from the source, so say what to keep in words (\u201ckeep the pose and palette, change the coat to red\u201d).",
        "The aspect-ratio picker replaces width/height, and every image carries an invisible SynthID watermark.",
      );
      break;
    case "stability":
      items.push(
        "Get a key: platform.stability.ai → API keys. Every image costs credits from your account.",
        "What gets called: api.stability.ai/v2beta/stable-image/generate/core for text-to-image (aspect ratio from the picker above), or /generate/sd3 in image-to-image mode when a reference is set — the match slider maps to their strength parameter (inverted: high match = low strength).",
        "The image comes back as raw PNG bytes and renders under the Generate button.",
      );
      break;
    case "together":
      items.push(
        "Get a key: api.together.ai → API Keys. Every model here bills per image — the old FLUX.1-schnell-Free endpoint has been withdrawn from the serverless API, so it is no longer offered.",
        "What gets called: api.together.xyz/v1/images/generations, base64 JSON back.",
        "No reference-image support on this provider. Step count is fixed at 4 — schnell is a few-step model.",
      );
      break;
    case "a1111":
      items.push(
        "Start the WebUI with: --api --cors-allow-origins=*  (the CORS flag is what allows this page to call it).",
        "Server URL default: http://127.0.0.1:7860 — the same machine this browser runs on. To generate from another device, add --listen and use that machine's address.",
        "What gets called: /sdapi/v1/txt2img, or /sdapi/v1/img2img when a reference is set (denoise = 1 − match). Sampler, CFG and steps come from the fields above.",
        "Free and offline, on your own GPU. No key needed.",
      );
      break;
    case "comfyui":
      items.push(
        "Start ComfyUI with: --enable-cors-header '*'  (add --listen 0.0.0.0 to reach it from other devices).",
        "Server URL default: http://127.0.0.1:8188. The checkpoint filename must match a file in ComfyUI/models/checkpoints.",
        "What gets called: POST /prompt with the default txt2img graph (checkpoint → CLIP → KSampler → VAE decode → save), then /history is polled until the image is finished and fetched from /view.",
        "Free and offline, on your own GPU. No key needed.",
      );
      break;
  }
  return (
    <div className="space-y-1 border border-paper/15 bg-noir-900/60 p-2">
      <div className="font-pulp text-[8px] uppercase tracking-widest text-paper/55">
        How {providerLabel} connects
      </div>
      <ul className="list-inside list-disc space-y-0.5 font-type text-[9px] leading-snug text-paper/50">
        {items.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

/** Backdrop-removal strength and output frame size — the two knobs shared by
 * the automatic starter pipeline and the manual convert button. */
function ForgeOptions({
  keyStrength,
  outSize,
  onStrength,
  onSize,
}: {
  keyStrength: string;
  outSize: string;
  onStrength: (v: string) => void;
  onSize: (v: string) => void;
}) {
  return (
    <>
      <label className="flex items-center gap-1 font-type text-[8px] text-paper/55">
        backdrop removal:
        <select
          className="border border-noir-600 bg-noir-950 px-1 py-0.5 text-[9px] text-paper/80"
          value={keyStrength}
          onChange={(e) => onStrength(e.target.value)}
        >
          {FORGE_STRENGTHS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
        — use gentle if it eats into the art, strong if backdrop specks survive.
      </label>
      <label className="flex items-center gap-1 font-type text-[8px] text-paper/55">
        output size:
        <select
          className="border border-noir-600 bg-noir-950 px-1 py-0.5 text-[9px] text-paper/80"
          title="Frame height of the built sheet. A CAP, not a stretch: big art keeps its pixels up to it, small art is never upscaled into blur."
          value={outSize}
          onChange={(e) => onSize(e.target.value)}
        >
          {FORGE_SIZES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        — <b>big</b> / <b>source</b> keep large art's detail (bigger files).
      </label>
    </>
  );
}

/** One-click sprite-sheet starters. Each generates frames side by side on a
 * flat magenta backdrop — and because the backdrop is flat, the whole rest of
 * the job (cut out, slice into frames, build the sheet) runs automatically
 * after generation. They skip the noir style suffix because each prompt
 * carries its own style. */const SPRITE_SHEET_PROMPTS: { label: string; prompt: string; kind: ForgeKind }[] = [
  {
    label: "🗣 Talking portrait (3 frames)",
    kind: "talking",
    prompt:
      "Three separate side-by-side waist-up portraits of the SAME character on one row: a 1950s noir character (describe them here). Painted classic Hollywood style, identical pose and lighting in all three, ONLY the mouth differs: panel 1 mouth open speaking, panel 2 mouth half-open mid-word, panel 3 mouth closed. Clear gaps of pure flat magenta (#FF00FF) between the figures and as the entire background.",
  },
  {
    label: "🚶 Walk cycle (6 frames)",
    kind: "walk",
    prompt:
      "Six side-by-side frames of the SAME character walking, full body, side view facing right, one complete walk cycle (contact, down, passing, up positions). Identical size and lighting in every frame, evenly spaced on one row. Painted cinematic style. Pure flat magenta (#FF00FF) background everywhere, clear gaps between frames.",
  },
  {
    label: "💡 Flickering sign (3 frames)",
    kind: "loop",
    prompt:
      "Three side-by-side frames of the SAME vintage neon sign: frame 1 fully lit and glowing, frame 2 half-dim, frame 3 dark with only a faint tube outline. Identical size and position in every frame, evenly spaced on one row. Painted cinematic style. Pure flat magenta (#FF00FF) background, clear gaps between frames.",
  },
  {
    label: "🚗 Vehicle sprite (front view)",
    kind: "single",
    prompt:
      "A 1949 American sedan seen directly head-on from the front at night, headlights glowing, driver silhouetted through the windshield. Painted cinematic noir style, the entire car fully visible and centered. Solid flat pure magenta (#FF00FF) background all around, crisp edges, no shadows on the background.",
  },
];

export function AiImageStudio({ storyId }: { storyId: string }) {
  const [settings, setSettings] = useState<AiImageSettings>(loadAiSettings);
  const [prompt, setPrompt] = useState("");
  const [applyStyle, setApplyStyle] = useState(true);
  const [styleSuffix, setStyleSuffix] = useState(NOIR_SUFFIX);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  // Sprite-sheet mode: set by the 🎞 starters. After generation the pipeline
  // runs by itself: key out the magenta, slice the frames, build the sheet,
  // save it to the media library, and emit ready-to-use sheet settings.
  const [spriteKind, setSpriteKind] = useState<ForgeKind | null>(null);
  const [forged, setForged] = useState<(ForgedSheet & { assetId?: string; json: string }) | null>(null);
  const [forgeError, setForgeError] = useState<string | null>(null);
  const [forging, setForging] = useState(false);
  const [copiedSheet, setCopiedSheet] = useState(false);
  const [keyStrength, setKeyStrength] = useState("normal");
  const [outSize, setOutSize] = useState("standard");
  // Manual converter: which animation set to build from the rendered image.
  const [convertKind, setConvertKind] = useState<ForgeKind>("talking");
  // Style transfer: a reference image + how closely to match it (providers
  // that support image-to-image only).
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refMatch, setRefMatch] = useState(0.55);
  const storageAvailable = useStorageAvailable();

  const provider = settings.provider;
  const cfg: AiProviderSettings = settings.providers[provider] ?? { id: provider };

  const updateSettings = (next: AiImageSettings) => {
    setSettings(next);
    saveAiSettings(next);
  };
  const setProvider = (id: typeof provider) => updateSettings({ ...settings, provider: id });
  const setCfg = (patch: Partial<AiProviderSettings>) =>
    updateSettings({ ...settings, providers: { ...settings.providers, [provider]: { ...cfg, ...patch } } });

  const finalPrompt = (applyStyle && styleSuffix.trim() ? `${prompt}${prompt.trim() ? ", " : ""}${styleSuffix.trim()}` : prompt).trim();

  const autoForge = async (imageDataUrl: string, kind: ForgeKind) => {
    setForging(true);
    setForged(null);
    setForgeError(null);
    try {
      const strength = FORGE_STRENGTHS.find((f) => f.id === keyStrength) ?? FORGE_STRENGTHS[1];
      const size = FORGE_SIZES.find((s) => s.id === outSize) ?? FORGE_SIZES[0];
      const sheet = await forgeSpriteSheet(imageDataUrl, kind, {
        ...strength,
        ...(size.height ? { targetHeight: size.height } : {}),
      });
      const up = await uploadDataUrlAsset(storyId, `sprite-sheet-${kind}-${Date.now()}.png`, "image", sheet.dataUrl, "sprites");
      const image = up.success && up.assetId ? `asset:${up.assetId}` : sheet.dataUrl;
      const json = JSON.stringify(
        { image, frameWidth: sheet.frameWidth, frameHeight: sheet.frameHeight, animations: sheet.animations, pixelated: false },
        null,
        2
      );
      setForged({ ...sheet, assetId: up.success ? up.assetId : undefined, json });
      if (!up.success) setForgeError(up.error ?? "sheet built, but saving to the library failed");
    } catch (err) {
      setForgeError(err instanceof Error ? err.message : "sprite sheet build failed");
    } finally {
      setForging(false);
    }
  };

  const generate = async () => {
    if (!finalPrompt) {
      setError("Write a prompt first.");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    setSaved(null);
    setForged(null);
    setForgeError(null);
    const refSupport = providerReferenceSupport(provider, cfg.model);
    const res = await generateAiImage(
      settings,
      finalPrompt,
      refImage && refSupport ? { dataUrl: refImage, match: refMatch } : undefined
    );
    setBusy(false);
    if (res.ok && res.dataUrl) {
      setResult(res.dataUrl);
      // Sprite mode: the rest of the work is automatic.
      if (spriteKind) void autoForge(res.dataUrl, spriteKind);
    } else setError(res.error ?? "Generation failed.");
  };

  const saveToLibrary = async () => {
    if (!result) return;
    const r = await uploadDataUrlAsset(storyId, `ai-${Date.now()}.png`, "image", result);
    if (r.success) setSaved("Saved to this story's media library — it's now available in every image dropdown (Background, Foreground, Keyframes) and the 🛠 Media Tools tab.");
    else setError(r.error ?? "Could not save the image.");
  };

  const meta = AI_PROVIDERS.find((m) => m.id === provider)!;

  return (
    <div className="space-y-3">
      <div className="border border-neon/40 bg-neon/5 p-2.5">
        <div className="font-pulp text-[11px] uppercase tracking-widest text-neon">🎨 AI Image Studio</div>
        <p className="mt-1 font-type text-[9px] leading-snug text-paper/60">
          Generate artwork from a text prompt and drop it straight into this story. Commercial providers bill per image and need an
          API key; local generators (AUTOMATIC1111 / Forge, ComfyUI) run free on your own GPU. Keys stay in this browser's storage —
          never paste them on a shared machine.
        </p>
        {storageAvailable === false && (
          <p className="mt-1 border border-crimson/40 bg-crimson/10 p-1.5 font-type text-[9px] text-crimson">
            ⚠ This browser can't store files — generated images won't survive a reload.
          </p>
        )}
      </div>

      <Field label="Image generator">
        <select className={inputCls} value={provider} onChange={(e) => setProvider(e.target.value as typeof provider)}>
          {AI_PROVIDERS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.kind === "commercial" ? "☁ " : "🖥 "}
              {m.label}
            </option>
          ))}
        </select>
        <p className="mt-1 font-type text-[9px] leading-snug text-paper/45">{meta.blurb}</p>
      </Field>

      {/* per-provider setup instructions — swap with the selected generator */}
      <ProviderInstructions provider={provider} model={cfg.model} providerLabel={meta.label.split(" — ")[0]} />

      {/* ---- per-provider configuration ---- */}
      {meta.needsKey && (
        <Field label="API key">
          <input
            type="password"
            className={inputCls}
            placeholder={`Paste your ${meta.label.split(" — ")[0]} API key…`}
            value={cfg.apiKey ?? ""}
            onChange={(e) => setCfg({ apiKey: e.target.value })}
            autoComplete="off"
          />
          <p className="mt-1 font-type text-[8px] text-paper/35">Stored locally on this device only, and sent only to {meta.label.split(" — ")[0]}.</p>
        </Field>
      )}

      {provider === "openai" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Model">
            <select
              className={inputCls}
              value={cfg.model ?? "gpt-image-1"}
              onChange={(e) => {
                const model = e.target.value;
                // The families take different size sets — keep the current
                // size only if the new model accepts it, else fall back.
                const size = `${cfg.width ?? 1024}x${cfg.height ?? 1024}`;
                if (openaiSizesForModel(model).includes(size)) setCfg({ model });
                else setCfg({ model, width: 1024, height: 1024 });
              }}
            >
              {OPENAI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Size">
            <select
              className={inputCls}
              value={`${cfg.width ?? 1024}x${cfg.height ?? 1024}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split("x").map(Number);
                setCfg({ width: w, height: h });
              }}
            >
              {openaiSizesForModel(cfg.model).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {provider === "gemini" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Model">
            <select className={inputCls} value={cfg.model ?? GEMINI_MODELS[0].id} onChange={(e) => setCfg({ model: e.target.value })}>
              {GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Aspect ratio">
            <select className={inputCls} value={cfg.aspectRatio ?? "16:9"} onChange={(e) => setCfg({ aspectRatio: e.target.value })}>
              {GEMINI_ASPECT_RATIOS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {provider === "stability" && (
        <Field label="Aspect ratio">
          <select className={inputCls} value={cfg.aspectRatio ?? "16:9"} onChange={(e) => setCfg({ aspectRatio: e.target.value })}>
            {["1:1", "16:9", "21:9", "3:2", "2:3", "9:16"].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Field>
      )}

      {provider === "together" && (
        <div className="grid grid-cols-3 gap-2">
          <Field label="Model">
            <select className={inputCls} value={cfg.model ?? TOGETHER_MODELS[0].id} onChange={(e) => setCfg({ model: e.target.value })}>
              {TOGETHER_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Width">
            <input type="number" min={512} max={1440} step={32} className={inputCls} value={cfg.width ?? 1024} onChange={(e) => setCfg({ width: Number(e.target.value) || 1024 })} />
          </Field>
          <Field label="Height">
            <input type="number" min={512} max={1440} step={32} className={inputCls} value={cfg.height ?? 768} onChange={(e) => setCfg({ height: Number(e.target.value) || 768 })} />
          </Field>
        </div>
      )}

      {(provider === "a1111" || provider === "comfyui") && (
        <>
          <Field label="Server URL">
            <input className={inputCls} placeholder={provider === "a1111" ? "http://127.0.0.1:7860" : "http://127.0.0.1:8188"} value={cfg.baseUrl ?? ""} onChange={(e) => setCfg({ baseUrl: e.target.value })} />
          </Field>
          {provider === "comfyui" && (
            <Field label="Checkpoint filename (from ComfyUI/models/checkpoints)">
              <input className={inputCls} placeholder="e.g. sd_xl_base_1.0.safetensors" value={cfg.model ?? ""} onChange={(e) => setCfg({ model: e.target.value })} />
            </Field>
          )}
          <div className="grid grid-cols-3 gap-2">
            <Field label="Width">
              <input type="number" min={256} max={2048} step={64} className={inputCls} value={cfg.width ?? 1024} onChange={(e) => setCfg({ width: Number(e.target.value) || 1024 })} />
            </Field>
            <Field label="Height">
              <input type="number" min={256} max={2048} step={64} className={inputCls} value={cfg.height ?? 768} onChange={(e) => setCfg({ height: Number(e.target.value) || 768 })} />
            </Field>
            <Field label="Steps">
              <input type="number" min={1} max={60} className={inputCls} value={cfg.steps ?? 20} onChange={(e) => setCfg({ steps: Number(e.target.value) || 20 })} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="CFG scale">
              <input type="number" min={1} max={20} step={0.5} className={inputCls} value={cfg.cfgScale ?? 7} onChange={(e) => setCfg({ cfgScale: Number(e.target.value) || 7 })} />
            </Field>
            <Field label="Sampler">
              <select className={inputCls} value={cfg.sampler ?? ""} onChange={(e) => setCfg({ sampler: e.target.value })}>
                {(provider === "a1111" ? A1111_SAMPLERS : COMFY_SAMPLERS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            {provider === "comfyui" && (
              <Field label="Scheduler">
                <select className={inputCls} value={cfg.scheduler ?? "normal"} onChange={(e) => setCfg({ scheduler: e.target.value })}>
                  {COMFY_SCHEDULERS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>
          <Field label="Negative prompt">
            <input className={inputCls} value={cfg.negativePrompt ?? ""} onChange={(e) => setCfg({ negativePrompt: e.target.value })} placeholder="blurry, low quality, deformed" />
          </Field>
        </>
      )}

      {/* ---- prompt ---- */}
      <Field label="Prompt">
        <textarea className={`${inputCls} h-20 font-type`} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the scene you want…" />
      </Field>
      <div className="flex flex-wrap gap-1">
        {PROMPT_IDEAS.map((idea) => (
          <button
            key={idea}
            onClick={() => {
              setPrompt(idea);
              setSpriteKind(null);
            }}
            className="border border-paper/20 px-1.5 py-0.5 font-type text-[9px] text-paper/60 hover:border-neon hover:text-neon"
          >
            {idea}
          </button>
        ))}
      </div>
      <div className="space-y-1 border border-cyan-neon/25 bg-cyan-neon/5 p-1.5">
        <div className="font-pulp text-[8px] uppercase tracking-widest text-cyan-neon">🎞 Sprite sheet starters — fully automatic</div>
        <div className="flex flex-wrap gap-1">
          {SPRITE_SHEET_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setPrompt(p.prompt);
                setApplyStyle(false); // the preset carries its own style; keep the magenta backdrop clean
                setSpriteKind(p.kind);
              }}
              className={`border px-1.5 py-0.5 font-type text-[9px] ${
                spriteKind === p.kind
                  ? "border-cyan-neon bg-cyan-neon/15 text-cyan-neon"
                  : "border-cyan-neon/30 text-cyan-neon/80 hover:border-cyan-neon hover:text-cyan-neon"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {spriteKind ? (
          <>
            <p className="font-type text-[8px] leading-snug text-cyan-neon/80">
              ⚙ Sprite mode ON — after generating, the magenta backdrop is keyed out, the frames are sliced, the sheet
              is built with its animations and saved to the media library automatically. Edit the prompt first — swap
              in your own character description where it says so.{" "}
              <button className="underline hover:text-cyan-neon" onClick={() => setSpriteKind(null)}>
                turn off
              </button>
            </p>
            <ForgeOptions
              keyStrength={keyStrength}
              outSize={outSize}
              onStrength={setKeyStrength}
              onSize={setOutSize}
            />
          </>
        ) : (
          <p className="font-type text-[8px] leading-snug text-paper/45">
            Pick a starter and the whole job runs itself: generate → cut out → slice frames → build the sheet →
            save to the media library. You just pick the finished sheet in the Characters tab or the scene's
            🎞 Sprite sheet editor.
          </p>
        )}
      </div>
      <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
        <input type="checkbox" checked={applyStyle} onChange={(e) => setApplyStyle(e.target.checked)} />
        Append noir style (keeps art consistent with the game)
      </label>
      {applyStyle && (
        <input className={inputCls} value={styleSuffix} onChange={(e) => setStyleSuffix(e.target.value)} />
      )}

      {/* ---- reference image: style transfer / image-to-image ---- */}
      {(() => {
        const support = providerReferenceSupport(provider, cfg.model);
        if (!support)
          return (
            <p className="font-type text-[8px] text-paper/35">
              🖼 Reference-image style transfer isn't available on this provider/model — OpenAI (gpt-image-1),
              Stability AI and local A1111/Forge support it.
            </p>
          );
        return (
          <div className="space-y-1 border border-gold/25 bg-gold/5 p-1.5">
            <div className="font-pulp text-[8px] uppercase tracking-widest text-gold">🖼 Reference image (style transfer)</div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer border border-gold/50 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/10">
                {refImage ? "⇄ replace" : "⇧ upload reference"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const r = new FileReader();
                    r.onload = () => setRefImage(String(r.result));
                    r.readAsDataURL(f);
                    e.target.value = "";
                  }}
                />
              </label>
              {refImage && (
                <>
                  <img src={refImage} alt="reference" className="h-10 w-10 border border-noir-600 object-cover" />
                  <button onClick={() => setRefImage(null)} className="text-[10px] text-crimson hover:underline">
                    ✕ clear
                  </button>
                </>
              )}
            </div>
            {refImage && support === "full" && (
              <label className="block text-[10px] uppercase tracking-wider text-paper/50">
                Match the reference {Math.round(refMatch * 100)}% (low = loosely inspired · high = barely changed)
                <input
                  type="range" min={0.1} max={0.9} step={0.05} value={refMatch}
                  className="mt-0.5 w-full accent-gold"
                  onChange={(e) => setRefMatch(Number(e.target.value))}
                />
              </label>
            )}
            {refImage && support === "fixed" && (
              <p className="font-type text-[8px] text-paper/45">
                This model takes the reference but decides itself how closely to follow it — describe the change you
                want in the prompt.
              </p>
            )}
            <p className="font-type text-[8px] leading-snug text-paper/45">
              The generator redraws your image in the style the prompt describes — hand it a photo and ask for
              "painted 1950 noir style", or hand it your existing character art to make variations that match.
            </p>
          </div>
        );
      })()}

      <button
        onClick={generate}
        disabled={busy || !finalPrompt}
        className={`w-full border py-2 font-pulp text-[11px] uppercase tracking-widest ${
          busy ? "border-paper/20 text-paper/40 cursor-wait" : "border-neon bg-neon/10 text-neon hover:bg-neon/20"
        }`}
      >
        {busy ? "⏳ Generating…" : "🎨 Generate image"}
      </button>

      {error && <div className="border border-crimson/40 bg-crimson/10 p-2 font-type text-[10px] text-crimson">⚠ {error}</div>}

      {busy && (
        <div className="border border-paper/20 p-6 text-center font-type text-[10px] text-paper/50">
          Generating — the rendered image will appear here.
        </div>
      )}

      {result && (
        <div className="border border-gold/40 bg-gold/5 p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-pulp text-[8px] uppercase tracking-widest text-gold">Rendered image</span>
            <button
              onClick={() => {
                try {
                  window.open(result, "_blank");
                } catch {
                  /* pop-up blocked — the inline preview is still here */
                }
              }}
              className="border border-noir-600 px-1.5 py-0.5 font-type text-[9px] text-paper/60 hover:text-gold"
              title="Open the full-size image in a new tab"
            >
              full size
            </button>
          </div>
          <img src={result} alt="Rendered" className="w-full border border-noir-600" />
          <button onClick={saveToLibrary} className="mt-2 w-full border border-emerald-500/60 bg-emerald-500/10 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20">
            Save to media library
          </button>
        </div>
      )}

      {/* ---- manual converter: turn the rendered image into a sprite sheet ---- */}
      {result && !forging && (
        <div className="space-y-1.5 border border-cyan-neon/30 bg-cyan-neon/5 p-2">
          <div className="font-pulp text-[8px] uppercase tracking-widest text-cyan-neon">Convert to animated sprite</div>
          <p className="font-type text-[8px] leading-snug text-paper/50">
            Keys the backdrop out, slices the image into frames and builds a ready-to-use sheet with animations, saved
            to the media library. Works best on a plain, flat backdrop — for a clean cut, generate the frames side by
            side on flat magenta with the starters above.
          </p>
          <Field label="Animation set">
            <select className={inputCls} value={convertKind} onChange={(e) => setConvertKind(e.target.value as ForgeKind)}>
              <option value="talking">Talking character (talk + rest)</option>
              <option value="walk">Walk cycle (walk + idle)</option>
              <option value="loop">Looping prop (loop)</option>
              <option value="single">Single still (one frame)</option>
            </select>
          </Field>
          <ForgeOptions
            keyStrength={keyStrength}
            outSize={outSize}
            onStrength={setKeyStrength}
            onSize={setOutSize}
          />
          <button
            onClick={() => void autoForge(result, convertKind)}
            className="w-full border border-cyan-neon/60 bg-cyan-neon/10 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/20"
          >
            Convert to animated sprite
          </button>
        </div>
      )}

      {forging && (
        <div className="border border-cyan-neon/40 bg-cyan-neon/5 p-2 font-type text-[10px] text-cyan-neon">
          ⚙ Building the sprite sheet — keying out the backdrop, slicing frames…
        </div>
      )}
      {forgeError && <div className="border border-crimson/40 bg-crimson/10 p-2 font-type text-[10px] text-crimson">⚠ {forgeError}</div>}
      {forged && (
        <div className="space-y-1.5 border border-cyan-neon/40 bg-cyan-neon/5 p-2">
          <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">✓ Sprite sheet built &amp; saved</div>
          <div
            className="inline-block max-w-full border border-noir-600"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
              backgroundColor: "#1a1a1f",
            }}
          >
            <img src={forged.dataUrl} alt="Sprite sheet" className="block max-h-48 w-auto max-w-full" />
          </div>
          <p className="font-type text-[9px] leading-snug text-paper/60">
            {forged.frameCount} frame{forged.frameCount === 1 ? "" : "s"} · {forged.frameWidth} × {forged.frameHeight}{" "}
            each · animations: {Object.keys(forged.animations).join(" + ")} ·{" "}
            {forged.assetId ? "saved to the media library." : "NOT saved (see warning)."}
          </p>
          <p className="font-type text-[9px] leading-snug text-paper/45">
            Use it now: Characters tab ▸ talking sheet, Scene ▸ 🎞 Sprite sheet editor, or 🚶 Walkable Stage — pick
            the saved sheet image and enter frame {forged.frameWidth} × {forged.frameHeight}. Or copy the settings
            below and paste them into the Media Tools tab's 🎞 Sheet slicer.
          </p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(forged.json).then(() => {
                setCopiedSheet(true);
                window.setTimeout(() => setCopiedSheet(false), 1600);
              });
            }}
            className="border border-noir-600 px-2 py-1 text-[9px] uppercase tracking-wider text-paper/60 hover:border-cyan-neon hover:text-cyan-neon"
          >
            {copiedSheet ? "✓ copied" : "⧉ copy sheet settings (JSON)"}
          </button>
        </div>
      )}
      {saved && <div className="border border-emerald-500/40 bg-emerald-500/10 p-2 font-type text-[10px] text-emerald-400">✓ {saved}</div>}
    </div>
  );
}
