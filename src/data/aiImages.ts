/**
 * AI image generation for Studio.
 *
 * Commercial generators are plain HTTPS APIs: you POST a prompt with your API
 * key and get an image (base64 JSON or binary) straight back. Local generators
 * (AUTOMATIC1111 / Forge, ComfyUI) run on the user's own GPU and expose an HTTP
 * API on localhost — no API key, but the server must be started with CORS
 * enabled so the browser can call it.
 *
 * The requests happen from the player's browser (this is a static, single-file
 * app — there is no backend), so API keys are stored in localStorage on this
 * device only and sent directly to the chosen provider. Keys are never shared
 * with anyone else, but anyone with access to this browser can read them.
 */

/** Where an image came from / how it's charged. */
export type AiProviderId = "openai" | "gemini" | "stability" | "together" | "a1111" | "comfyui";

export interface AiProviderSettings {
  id: AiProviderId;
  /** commercial providers only */
  apiKey?: string;
  /** local servers only — the base URL of the running generator */
  baseUrl?: string;
  /** model id / checkpoint name (provider specific) */
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  scheduler?: string;
  negativePrompt?: string;
  /** Stability Stable-Image API uses aspect ratios instead of exact pixels */
  aspectRatio?: string;
}

export interface AiImageSettings {
  provider: AiProviderId;
  providers: Partial<Record<AiProviderId, AiProviderSettings>>;
}

export const AI_PROVIDERS: {
  id: AiProviderId;
  label: string;
  kind: "commercial" | "local";
  needsKey: boolean;
  blurb: string;
}[] = [
  {
    id: "openai",
    label: "OpenAI — DALL·E 3 / GPT Image",
    kind: "commercial",
    needsKey: true,
    blurb: "Cloud. Polished, follows prompts tightly. Pay-per-image. Needs an OpenAI API key (platform.openai.com).",
  },
  {
    id: "gemini",
    label: "Google — Gemini (Nano Banana)",
    kind: "commercial",
    needsKey: true,
    blurb:
      "Cloud. Google's Nano Banana models — excellent prompt adherence and the strongest image EDITING of the cloud options, so it is a good pick for restyling a reference. Generous free tier. Needs a Gemini API key (aistudio.google.com/apikey).",
  },
  {
    id: "stability",
    label: "Stability AI — Stable Image Core",
    kind: "commercial",
    needsKey: true,
    blurb: "Cloud. Open-weight look, strong for moody/atmospheric art. Needs a Stability AI API key (platform.stability.ai).",
  },
  {
    id: "together",
    label: "Together AI — FLUX.1",
    kind: "commercial",
    needsKey: true,
    blurb: "Cloud. Fast, cheap FLUX images (the schnell model has a generous free tier). Needs a Together AI API key (api.together.xyz).",
  },
  {
    id: "a1111",
    label: "Local — AUTOMATIC1111 / Forge WebUI",
    kind: "local",
    needsKey: false,
    blurb: "Runs on your own GPU. No key, no per-image cost. Start it with: --api --cors-allow-origins=*",
  },
  {
    id: "comfyui",
    label: "Local — ComfyUI",
    kind: "local",
    needsKey: false,
    blurb: "Runs on your own GPU. No key, no per-image cost. Start it with: --listen 0.0.0.0 --enable-cors-header '*'",
  },
];

const STORAGE_KEY = "scarlet-reel-ai-images-v1";

export function defaultAiSettings(): AiImageSettings {
  return {
    provider: "openai",
    providers: {
      openai: { id: "openai", model: "gpt-image-1", width: 1024, height: 1024 },
      gemini: { id: "gemini", model: "gemini-2.5-flash-image", aspectRatio: "16:9" },
      stability: { id: "stability", aspectRatio: "16:9" },
      together: { id: "together", model: "black-forest-labs/FLUX.1-schnell", width: 1024, height: 768 },
      a1111: {
        id: "a1111",
        baseUrl: "http://127.0.0.1:7860",
        width: 1024,
        height: 768,
        steps: 20,
        cfgScale: 7,
        sampler: "DPM++ 2M Karras",
        negativePrompt: "blurry, low quality, deformed",
      },
      comfyui: {
        id: "comfyui",
        baseUrl: "http://127.0.0.1:8188",
        width: 1024,
        height: 768,
        steps: 20,
        cfgScale: 7,
        sampler: "euler",
        scheduler: "normal",
        negativePrompt: "blurry, low quality, deformed",
      },
    },
  };
}

export function loadAiSettings(): AiImageSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AiImageSettings>;
      const defaults = defaultAiSettings();
      const providers = { ...defaults.providers, ...(parsed.providers ?? {}) };
      // MIGRATION: Together withdrew the FLUX.1-schnell-Free endpoint from its
      // serverless API. Anyone who saved it before now has a model id that
      // 404s on every generate, so move them to the paid schnell endpoint
      // (same model, same output) rather than leaving a dead setting behind.
      if (providers.together?.model === "black-forest-labs/FLUX.1-schnell-Free") {
        providers.together = { ...providers.together, model: "black-forest-labs/FLUX.1-schnell" };
      }
      return {
        provider: parsed.provider ?? defaults.provider,
        providers,
      };
    }
  } catch {
    /* ignore — fall back to defaults */
  }
  return defaultAiSettings();
}

export function saveAiSettings(s: AiImageSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

export interface GenerateResult {
  ok: boolean;
  dataUrl?: string;
  error?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Valid size strings per OpenAI model. The two model families take
 * DIFFERENT sets and an invalid pair is a hard 400: gpt-image-* speaks
 * 1024x1024 / 1536x1024 / 1024x1536, dall-e-3 speaks 1024x1024 /
 * 1792x1024 / 1024x1792. Exported for the engine tests. */
export function openaiSizesForModel(model?: string): string[] {
  return /^gpt-image/.test(model ?? "gpt-image-1")
    ? ["1024x1024", "1536x1024", "1024x1536"]
    : ["1024x1024", "1792x1024", "1024x1792"];
}

/** Build the /v1/images/generations request body. `response_format` is only
 * valid on the dall-e family — gpt-image models always return base64 and
 * REJECT the parameter with a 400 (invalid_request_error / unknown_parameter),
 * which is exactly what "Generate" was hitting with the default model.
 * Exported for the engine tests. */
export function openaiGenerationBody(model: string, prompt: string, size: string): Record<string, unknown> {
  const body: Record<string, unknown> = { model, prompt, n: 1, size };
  if (/^dall-e/.test(model)) body.response_format = "b64_json";
  return body;
}

/** Aspect ratios Gemini's image models accept. Anything else is a 400. */
export const GEMINI_ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"];

/** Build the :generateContent body for a Gemini image request.
 *
 * Two things are easy to get wrong here and both are hard 400s:
 *  · responseModalities MUST include "IMAGE", or the model replies with text
 *    describing the picture it declined to draw.
 *  · the reference image is an inline_data part in the SAME parts array as the
 *    prompt — not a separate field — and its mime type must match the data.
 * Exported so the engine tests can assert the shape without a network call. */
export function geminiGenerationBody(
  prompt: string,
  aspectRatio?: string,
  reference?: { mimeType: string; base64: string }
): Record<string, unknown> {
  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (reference) {
    parts.push({ inline_data: { mime_type: reference.mimeType, data: reference.base64 } });
  }
  const generationConfig: Record<string, unknown> = { responseModalities: ["IMAGE"] };
  if (aspectRatio) generationConfig.imageConfig = { aspectRatio };
  return { contents: [{ parts }], generationConfig };
}

/** Split a data URL into its mime type and bare base64 payload. */
export function splitDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const [head, body = ""] = dataUrl.split(",");
  return { mimeType: /data:([^;]+)/.exec(head)?.[1] ?? "image/png", base64: body };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the returned image."));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? "image/png";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** A reference image for style transfer / image-to-image generation.
 * `match` is 0–1: how closely the output should follow the reference
 * (1 = barely change it, 0 = only loosely inspired). */
export interface AiReferenceImage {
  dataUrl: string;
  match: number;
}

/** Whether a provider can use a reference image, and how:
 * "full" = image + adjustable match strength · "fixed" = image accepted but
 * the model decides how closely to follow it · false = text-only. */
export function providerReferenceSupport(id: AiProviderId, model?: string): "full" | "fixed" | false {
  switch (id) {
    case "openai":
      // gpt-image-1 has an edits endpoint; dall-e-3 is text-only.
      return (model || "gpt-image-1") === "gpt-image-1" ? "fixed" : false;
    case "gemini":
      // Native multimodal editing: the reference goes in as an inline_data
      // part alongside the prompt. There is no numeric strength knob — the
      // model decides how far to move from the source.
      return "fixed";
    case "stability":
      return "full"; // SD3 image-to-image with a strength parameter
    case "a1111":
      return "full"; // img2img with denoising_strength
    case "together":
    case "comfyui":
      return false;
    default:
      return false;
  }
}

/** Generate one image for the configured provider. Returns a PNG data URL.
 * With `reference` set (and a provider that supports it), runs style
 * transfer / image-to-image instead of pure text-to-image. */
export async function generateAiImage(
  settings: AiImageSettings,
  prompt: string,
  reference?: AiReferenceImage
): Promise<GenerateResult> {
  const p = settings.providers[settings.provider];
  if (!p) return { ok: false, error: "No provider selected." };
  const ref = reference && providerReferenceSupport(settings.provider, p.model) ? reference : undefined;
  try {
    switch (settings.provider) {
      case "openai":
        return await openaiGenerate(p, prompt, ref);
      case "gemini":
        return await geminiGenerate(p, prompt, ref);
      case "stability":
        return await stabilityGenerate(p, prompt, ref);
      case "together":
        return await togetherGenerate(p, prompt);
      case "a1111":
        return await a1111Generate(p, prompt, ref);
      case "comfyui":
        return await comfyGenerate(p, prompt);
      default:
        return { ok: false, error: "Unknown provider." };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      return {
        ok: false,
        error:
          "Couldn't reach the server. For local generators make sure it's running with CORS enabled (A1111: --cors-allow-origins=* · ComfyUI: --enable-cors-header '*').",
      };
    }
    return { ok: false, error: msg };
  }
}

/* ------------------------------ commercial ------------------------------ */

async function openaiGenerate(p: AiProviderSettings, prompt: string, ref?: AiReferenceImage): Promise<GenerateResult> {
  if (!p.apiKey) return { ok: false, error: "Enter your OpenAI API key first." };
  const size = `${p.width ?? 1024}x${p.height ?? 1024}`;
  // Style transfer / edit path: gpt-image-1's images/edits takes the
  // reference image + prompt (the model decides how closely to follow it).
  if (ref) {
    const fd = new FormData();
    fd.append("model", p.model || "gpt-image-1");
    fd.append("image", dataUrlToBlob(ref.dataUrl), "reference.png");
    fd.append("prompt", prompt);
    fd.append("n", "1");
    fd.append("size", size);
    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${p.apiKey}` },
      body: fd,
    });
    const json: any = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: json?.error?.message || `OpenAI ${res.status}` };
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) return { ok: false, error: "OpenAI returned no image." };
    return { ok: true, dataUrl: `data:image/png;base64,${b64}` };
  }
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
    // Body built by openaiGenerationBody: response_format goes only to the
    // dall-e family — gpt-image models 400 on it (they always return base64).
    body: JSON.stringify(openaiGenerationBody(p.model || "gpt-image-1", prompt, size)),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    return { ok: false, error: json?.error?.message || `OpenAI ${res.status}: ${text.slice(0, 200)}` };
  }
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) return { ok: false, error: "OpenAI returned no image." };
  return { ok: true, dataUrl: `data:image/png;base64,${b64}` };
}

async function geminiGenerate(p: AiProviderSettings, prompt: string, ref?: AiReferenceImage): Promise<GenerateResult> {
  if (!p.apiKey) return { ok: false, error: "Enter your Google Gemini API key first." };
  const model = p.model || "gemini-2.5-flash-image";
  const body = geminiGenerationBody(prompt, p.aspectRatio, ref ? splitDataUrl(ref.dataUrl) : undefined);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      // The key goes in a header, never the query string — a URL-embedded key
      // leaks into logs and browser history.
      headers: { "Content-Type": "application/json", "x-goog-api-key": p.apiKey },
      body: JSON.stringify(body),
    }
  );
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    return { ok: false, error: json?.error?.message || `Gemini ${res.status}: ${text.slice(0, 200)}` };
  }
  // A refusal comes back 200 with no image part, so report the reason rather
  // than a bare "no image" — usually a safety block or a prompt it won't draw.
  const candidate = json?.candidates?.[0];
  const parts: any[] = candidate?.content?.parts ?? [];
  const imagePart = parts.find((part) => part?.inline_data?.data || part?.inlineData?.data);
  const inline = imagePart?.inline_data ?? imagePart?.inlineData;
  if (!inline?.data) {
    const saidWhy =
      parts.map((part) => part?.text).filter(Boolean).join(" ").trim() ||
      candidate?.finishReason ||
      json?.promptFeedback?.blockReason;
    return {
      ok: false,
      error: saidWhy
        ? `Gemini returned no image — ${String(saidWhy).slice(0, 200)}`
        : "Gemini returned no image.",
    };
  }
  return { ok: true, dataUrl: `data:${inline.mime_type ?? inline.mimeType ?? "image/png"};base64,${inline.data}` };
}

async function stabilityGenerate(p: AiProviderSettings, prompt: string, ref?: AiReferenceImage): Promise<GenerateResult> {
  if (!p.apiKey) return { ok: false, error: "Enter your Stability AI API key first." };
  const fd = new FormData();
  fd.append("prompt", prompt);
  fd.append("output_format", "png");
  // Image-to-image (style transfer) runs on the SD3 endpoint. Stability's
  // `strength` is "how much to CHANGE" (0 = identical, 1 = ignore the image),
  // so it's the inverse of our "match the reference" slider.
  const endpoint = ref
    ? "https://api.stability.ai/v2beta/stable-image/generate/sd3"
    : "https://api.stability.ai/v2beta/stable-image/generate/core";
  if (ref) {
    fd.append("mode", "image-to-image");
    fd.append("image", dataUrlToBlob(ref.dataUrl), "reference.png");
    fd.append("strength", String(Math.min(1, Math.max(0, 1 - ref.match))));
  } else if (p.aspectRatio) fd.append("aspect_ratio", p.aspectRatio);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${p.apiKey}`, Accept: "image/*" },
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text.slice(0, 300);
    try {
      const j = JSON.parse(text);
      if (Array.isArray(j?.errors)) msg = j.errors.join(", ");
      else if (j?.message) msg = j.message;
    } catch {
      /* keep raw text */
    }
    return { ok: false, error: `Stability ${res.status}: ${msg}` };
  }
  const blob = await res.blob();
  return { ok: true, dataUrl: await blobToDataUrl(blob) };
}

async function togetherGenerate(p: AiProviderSettings, prompt: string): Promise<GenerateResult> {
  if (!p.apiKey) return { ok: false, error: "Enter your Together AI API key first." };
  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
    body: JSON.stringify({
      model: p.model || "black-forest-labs/FLUX.1-schnell",
      prompt,
      n: 1,
      width: p.width ?? 1024,
      height: p.height ?? 768,
      steps: p.steps ?? 4,
      response_format: "b64_json",
    }),
  });
  const json: any = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, error: json?.error?.message || `Together ${res.status}` };
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) return { ok: false, error: "Together returned no image." };
  return { ok: true, dataUrl: `data:image/png;base64,${b64}` };
}

/* -------------------------------- local -------------------------------- */

async function a1111Generate(p: AiProviderSettings, prompt: string, ref?: AiReferenceImage): Promise<GenerateResult> {
  const base = (p.baseUrl || "http://127.0.0.1:7860").replace(/\/+$/, "");
  // img2img for style transfer: denoising_strength is "how much to change"
  // (0 = identical), so it's the inverse of our "match the reference" slider.
  const endpoint = ref ? `${base}/sdapi/v1/img2img` : `${base}/sdapi/v1/txt2img`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      negative_prompt: p.negativePrompt || "",
      width: p.width ?? 1024,
      height: p.height ?? 768,
      steps: p.steps ?? 20,
      cfg_scale: p.cfgScale ?? 7,
      sampler_name: p.sampler || "DPM++ 2M Karras",
      seed: -1,
      n_iter: 1,
      batch_size: 1,
      ...(ref
        ? {
            init_images: [ref.dataUrl.split(",")[1] ?? ref.dataUrl],
            denoising_strength: Math.min(1, Math.max(0, 1 - ref.match)),
          }
        : {}),
    }),
  });
  const json: any = await res.json().catch(() => null);
  if (!res.ok || !json) {
    return { ok: false, error: `WebUI ${res.status}: ${json?.detail || json?.error || res.statusText}` };
  }
  const b64 = json?.images?.[0];
  if (!b64) return { ok: false, error: "WebUI returned no image." };
  return { ok: true, dataUrl: `data:image/png;base64,${b64}` };
}

/** The canonical default ComfyUI txt2img workflow graph (API format). */
function buildComfyWorkflow(prompt: string, p: AiProviderSettings): Record<string, unknown> {
  const seed = Math.floor(Math.random() * 1e9);
  return {
    "1": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: p.model || "" } },
    "2": { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["1", 1] } },
    "3": { class_type: "CLIPTextEncode", inputs: { text: p.negativePrompt || "", clip: ["1", 1] } },
    "4": { class_type: "EmptyLatentImage", inputs: { width: p.width ?? 1024, height: p.height ?? 768, batch_size: 1 } },
    "5": {
      class_type: "KSampler",
      inputs: {
        seed,
        steps: p.steps ?? 20,
        cfg: p.cfgScale ?? 7,
        sampler_name: p.sampler || "euler",
        scheduler: p.scheduler || "normal",
        denoise: 1,
        model: ["1", 0],
        positive: ["2", 0],
        negative: ["3", 0],
        latent_image: ["4", 0],
      },
    },
    "6": { class_type: "VAEDecode", inputs: { samples: ["5", 0], vae: ["1", 2] } },
    "7": { class_type: "SaveImage", inputs: { images: ["6", 0], filename_prefix: "scarlet-reel" } },
  };
}

async function comfyGenerate(p: AiProviderSettings, prompt: string): Promise<GenerateResult> {
  const base = (p.baseUrl || "http://127.0.0.1:8188").replace(/\/+$/, "");
  const res = await fetch(`${base}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: buildComfyWorkflow(prompt, p) }),
  });
  const json: any = await res.json().catch(() => null);
  if (!res.ok || !json?.prompt_id) {
    const detail = json?.node_errors ? JSON.stringify(json.node_errors).slice(0, 300) : res.statusText;
    return { ok: false, error: `ComfyUI ${res.status}: ${json?.error?.message || detail}` };
  }
  const id = json.prompt_id;
  // Poll the history queue until the image is written to the output folder.
  for (let i = 0; i < 120; i++) {
    await sleep(1500);
    const hist: any = await fetch(`${base}/history/${id}`).then((r) => r.json()).catch(() => null);
    const entry = hist?.[id];
    if (entry?.status?.status_str === "error") return { ok: false, error: "ComfyUI reported an error (check the server console)." };
    if (entry?.outputs) {
      for (const out of Object.values<any>(entry.outputs)) {
        const img = out?.images?.[0];
        if (img) {
          const imgRes = await fetch(
            `${base}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || "")}&type=${img.type || "output"}`
          );
          if (!imgRes.ok) return { ok: false, error: `Couldn't fetch the finished image (${imgRes.status}).` };
          return { ok: true, dataUrl: await blobToDataUrl(await imgRes.blob()) };
        }
      }
    }
  }
  return { ok: false, error: "Timed out waiting for ComfyUI to finish." };
}
