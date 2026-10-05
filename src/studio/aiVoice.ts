/**
 * ElevenLabs line-by-line voice generation for the Studio.
 *
 * Scope is deliberately narrow: ONE dialogue line at a time, billed to the
 * author's ElevenLabs account per character (credits), with an explicit
 * confirm showing the character count before any spend. The API key lives
 * in localStorage only — it is never written into the story data, saves or
 * exports. Generated MP3s upload into the media library and attach to the
 * beat as a normal `asset:<id>` audioUrl, so playback is the existing
 * MP3-first path (TTS is bypassed for that line; the music duck fires on it
 * exactly as it does for TTS).
 */

export const ELEVENLABS_MODELS = [
  { id: "eleven_v3", label: "Eleven v3 (v3 voices)" },
  { id: "eleven_multilingual_v2", label: "Multilingual v2 (v2 voices)" },
  { id: "eleven_turbo_v2_5", label: "Turbo v2.5 (fast, cheaper)" },
] as const;

const KEY_STORAGE = "scarlet-ai-voice-key";
const MODEL_STORAGE = "scarlet-ai-voice-model";

export function getElevenKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setElevenKey(key: string): void {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* storage unavailable — the key lasts the session */
  }
}

export function getElevenModel(): string {
  try {
    return localStorage.getItem(MODEL_STORAGE) ?? "eleven_v3";
  } catch {
    return "eleven_v3";
  }
}

export function setElevenModel(id: string): void {
  try {
    localStorage.setItem(MODEL_STORAGE, id);
  } catch {
    /* session only */
  }
}

export interface SynthesisResult {
  dataUrl: string;
  /** The raw MP3 — written to disk as a real voice file (see voiceFiles.ts). */
  blob: Blob;
  bytes: number;
  chars: number;
}

/**
 * Build voice_settings appropriate for the chosen model.
 *
 * Eleven v3 does NOT support similarity, speaker boost or speed (product
 * guide). Sending any of those fields with `eleven_v3` produces HTTP 400s from
 * the API — which is exactly what "Generate MP3" was hitting. v2/turbo still
 * take the full set. Style exaggeration is kept low so delivery stays stable;
 * v3 acts through audio tags instead.
 */
function voiceSettingsForModel(model: string): Record<string, number | boolean> {
  const isV3 = model === "eleven_v3" || /(?:^|_)v3(?:_|$)/.test(model);
  if (isV3) {
    // v3: stability is the only supported dial-in (similarity, speed and
    // speaker boost are NOT available on v3). Sending similarity_boost here
    // WAS the 400 — so send just stability. 0.5 ("Natural") is the sweet spot
    // for dialogue.
    return { stability: 0.5 };
  }
  return {
    stability: 0.4,
    similarity_boost: 0.8,
    style: 0.25,
    use_speaker_boost: true,
  };
}

/**
 * Pull a readable message out of every ElevenLabs error body shape we've seen:
 *   { detail: "…" }
 *   { detail: { status, message } }          ← most common (400 voice_not_found etc.)
 *   { detail: [{ msg/message, … }, …] }      ← validation arrays
 *   { message: "…" }
 */
function formatElevenErrorBody(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const b = body as {
    message?: unknown;
    detail?: unknown;
  };
  const detail = b.detail;
  if (typeof detail === "string" && detail.trim()) return detail.trim();
  if (Array.isArray(detail)) {
    const parts = detail
      .map((d) => {
        if (!d || typeof d !== "object") return typeof d === "string" ? d : "";
        const item = d as { message?: unknown; msg?: unknown; loc?: unknown };
        const msg = typeof item.message === "string" ? item.message : typeof item.msg === "string" ? item.msg : "";
        return msg;
      })
      .filter(Boolean);
    if (parts.length) return parts.join("; ");
  }
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const d = detail as { message?: unknown; status?: unknown; msg?: unknown };
    const msg =
      (typeof d.message === "string" && d.message) ||
      (typeof d.msg === "string" && d.msg) ||
      "";
    const status = typeof d.status === "string" && d.status ? d.status : "";
    if (msg && status) return `${status}: ${msg}`;
    if (msg) return msg;
    if (status) return status;
  }
  if (typeof b.message === "string" && b.message.trim()) return b.message.trim();
  try {
    return JSON.stringify(body).slice(0, 280);
  } catch {
    return "";
  }
}

/** Synthesize one line with ElevenLabs and return it as a data URL ready
 *  for the media-library upload. Throws an Error with a readable message
 *  for every failure mode (bad key, credits, rate limit, voice/model).
 *  Pass `context` (the lines immediately around this one, with speaker
 *  labels) for ElevenLabs' previous_text / next_text continuity — the TTS
 *  endpoint accepts these and uses them so delivery responds to the turn
 *  instead of reading the line in isolation. */
export async function synthesizeElevenLabs(
  text: string,
  voiceId: string,
  model: string,
  context?: { previousText?: string; nextText?: string }
): Promise<SynthesisResult> {
  const key = getElevenKey();
  if (!key) throw new Error("No ElevenLabs API key set — add it in the AI Voice section of the People tab first.");
  const line = String(text ?? "").trim();
  if (!line) throw new Error("Nothing to convert — the line is empty.");
  const vid = String(voiceId ?? "").trim();
  if (!vid) throw new Error("No ElevenLabs voice ID — assign one on the character in the People tab.");

  // Cap continuity context. The API accepts previous_text/next_text on the
  // TTS endpoint; very long scene history just burns latency and can trip
  // request-size limits, so keep a useful window.
  const prev = (context?.previousText ?? "").trim().slice(-1500) || undefined;
  const next = (context?.nextText ?? "").trim().slice(0, 500) || undefined;

  const body: Record<string, unknown> = {
    text: line,
    model_id: model || "eleven_v3",
    voice_settings: voiceSettingsForModel(model || "eleven_v3"),
  };
  if (prev) body.previous_text = prev;
  if (next) body.next_text = next;

  let res: Response;
  try {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(vid)}`, {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the ElevenLabs API — check your connection and try again.");
  }
  if (!res.ok) {
    let detail = "";
    try {
      detail = formatElevenErrorBody(await res.json());
    } catch {
      /* non-JSON error body — statusText is enough */
    }
    const msg = detail || res.statusText || "";
    if (res.status === 401) throw new Error(`ElevenLabs rejected the API key (401). ${msg}`.trim());
    if (res.status === 403) throw new Error(`ElevenLabs forbidden (403) — check the key's scopes include Text to Speech. ${msg}`.trim());
    if (res.status === 404) throw new Error(`ElevenLabs voice not found (404) — check the voice ID is in your Voice Lab (library voices must be added first). ${msg}`.trim());
    if (res.status === 400) {
      // Most common: voice_not_found, bad model/voice pairing, unsupported settings.
      const hint = /voice/i.test(msg)
        ? " Voice IDs must be in your Voice Lab (add library voices there first), and v3 voices need the Eleven v3 model."
        : " Check the voice ID, that the model matches the voice (v3 voices → Eleven v3), and that the line isn't empty.";
      throw new Error(`ElevenLabs rejected the request (400). ${msg}${hint}`.trim());
    }
    if (res.status === 422)
      throw new Error(`ElevenLabs refused the request (422) — usually an out-of-credits balance or a voice/model mismatch. ${msg}`.trim());
    if (res.status === 429) throw new Error("Rate limited by ElevenLabs (429) — wait a few seconds and try again.");
    throw new Error(`ElevenLabs error ${res.status}. ${msg}`.trim());
  }
  const blob = await res.blob();
  if (!blob.size) throw new Error("ElevenLabs returned an empty audio file — try again, or switch model.");
  // Rare: a non-2xx-looking payload that still typed as JSON/text. Only
  // inspect when the Content-Type is clearly not audio — reading the blob
  // consumes it, so we never do this for audio/mpeg responses.
  if (blob.type && /json|text\//i.test(blob.type)) {
    let detail = "";
    try {
      detail = formatElevenErrorBody(JSON.parse(await blob.text()));
    } catch {
      detail = "unexpected non-audio response";
    }
    throw new Error(`ElevenLabs returned an error payload instead of audio. ${detail}`.trim());
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
  return { dataUrl, blob, bytes: blob.size, chars: line.length };
}

/** The confirm copy — the credit cost is always on the table before any
 *  spend. ElevenLabs bills by characters, so the count is the estimate. */
export function convertConfirmMessage(charName: string, voiceId: string, model: string, line: string): string {
  const shown = line.length > 140 ? `${line.slice(0, 140)}…` : line;
  return [
    "ElevenLabs conversion — this spends credits on your account.",
    "",
    `Character: ${charName}`,
    `Voice:     ${voiceId} (${model})`,
    `Line:      "${shown}"`,
    `Length:    ${line.length} characters (ElevenLabs charges per character)`,
    "",
    "Convert this line?",
  ].join("\n");
}

/* ------------------------------------------------------------------ *
 *  ElevenLabs non-speech audio tags.
 *  v3 acts out bracketed cues such as [laughs]; v2.5/turbo do NOT and
 *  would read the brackets aloud. Each tag is marked for which models
 *  it works on, and the UI offers them accordingly and sorts them.
 * ------------------------------------------------------------------ */
export interface AudioTag {
  tag: string;
  label: string;
  hint: string;
  /** "v3" cues are only performed by the v3 model; "all" (plain voice
   *  direction such as whispering) is passed through for every model. */
  worksOn: "v3" | "all";
  group: string;
}

/** Curated, known-supported non-speech cues for ElevenLabs v3, sorted by
 *  group then label. The API is tolerant of other natural-language sound
 *  labels too, but these are the reliable, commonly-documented ones. */
export const ELEVENLABS_AUDIO_TAGS: AudioTag[] = [
  // Emotional / vocal reactions
  { group: "Reactions", tag: "[chuckles]", label: "chuckle", hint: "a quiet, amused chuckle", worksOn: "v3" },
  { group: "Reactions", tag: "[laughs]", label: "laugh", hint: "a short laugh", worksOn: "v3" },
  { group: "Reactions", tag: "[sighs]", label: "sigh", hint: "an exhale of relief/tiredness", worksOn: "v3" },
  { group: "Reactions", tag: "[groans]", label: "groan", hint: "a weary or annoyed groan", worksOn: "v3" },
  { group: "Reactions", tag: "[grunts]", label: "grunt", hint: "a short, effortful grunt", worksOn: "v3" },
  { group: "Reactions", tag: "[gasps]", label: "gasp", hint: "a sharp intake of breath / surprise", worksOn: "v3" },
  { group: "Reactions", tag: "[gulps]", label: "gulp", hint: "a nervous swallow", worksOn: "v3" },
  { group: "Reactions", tag: "[yawns]", label: "yawn", hint: "a tired yawn", worksOn: "v3" },
  // Physical / throat
  { group: "Physical", tag: "[coughs]", label: "cough", hint: "a dry cough", worksOn: "v3" },
  { group: "Physical", tag: "[clears throat]", label: "clear throat", hint: "throat-clearing before speaking", worksOn: "v3" },
  { group: "Physical", tag: "[sneezes]", label: "sneeze", hint: "a sneeze", worksOn: "v3" },
  { group: "Physical", tag: "[pauses]", label: "pause / beat", hint: "a held beat before continuing", worksOn: "v3" },
  // Voice delivery — ordinary spoken direction, works on every model
  { group: "Delivery", tag: "[whispers]", label: "whisper", hint: "drop to a whisper", worksOn: "all" },
  { group: "Delivery", tag: "[mumbles]", label: "mumble", hint: "muffled / under-breath", worksOn: "all" },
];

/** Sorted, model-appropriate tags for the picker. v3 gets everything;
 *  older models get only the voice-delivery cues (and a note). */
export function audioTagsForModel(model: string): AudioTag[] {
  const v3 = modelSupportsAudioTags(model);
  return ELEVENLABS_AUDIO_TAGS
    .filter((t) => v3 || t.worksOn === "all")
    .slice()
    .sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
}

/** Model ids that understand bracketed audio tags (v3 family). */
export function modelSupportsAudioTags(model: string): boolean {
  return model === "eleven_v3" || /v3/.test(model);
}

/* ------------------------------------------------------------------ *
 *  Cost estimation (pre-flight warning before a batch spend).
 *  Credits per character by model; v3 = 0.30/char. List USD/1k is
 *  approximate and depends on the account tier/plan grant.
 * ------------------------------------------------------------------ */
export const ELEVENLABS_CREDITS_PER_CHAR: Record<string, number> = {
  eleven_v3: 0.3,
  eleven_multilingual_v2: 0.24,
  eleven_turbo_v2_5: 0.15,
};
// Approximate list overage price per character (USD), from $ per 1k.
export const ELEVENLABS_USD_PER_1K: Record<string, number> = {
  eleven_v3: 0.22,
  eleven_multilingual_v2: 0.18,
  eleven_turbo_v2_5: 0.11,
};

export function estimateVoiceCost(model: string, chars: number): { credits: number; usd: number; perChar: number } {
  const perChar = ELEVENLABS_CREDITS_PER_CHAR[model] ?? 0.3;
  const usdPer1k = ELEVENLABS_USD_PER_1K[model] ?? 0.22;
  return {
    credits: Math.round(chars * perChar),
    usd: (chars / 1000) * usdPer1k,
    perChar,
  };
}
