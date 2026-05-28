/**
 * ChefSense AI — Gemini helper
 *
 * Thin wrapper around the Google Generative Language REST API used as the
 * on-demand translation backend for dynamic content (dish prose, voice
 * coach replies, recipe step text). Static UI labels still flow through
 * lib/i18n/dictionary.ts; this module only fills gaps.
 */

export type TargetLang = 'en' | 'hi' | 'te';

type GeminiPart = { text: string };
type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};
type GeminiResponse = {
  candidates?: GeminiCandidate[];
  error?: { message?: string };
};

const LANG_FULL_NAME: Record<TargetLang, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  te: 'Telugu (తెలుగు)',
};

function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
}

export function getGeminiKey(): string | null {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    '';
  return key.length > 0 ? key : null;
}

export function hasGeminiKey(): boolean {
  return getGeminiKey() !== null;
}

function endpoint(model: string, key: string): string {
  return (
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`
  );
}

async function callGemini(
  prompt: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const key = getGeminiKey();
  if (!key) return { ok: false, error: 'missing_api_key' };

  const model = getModel();
  let response: Response;
  try {
    response = await fetch(endpoint(model, key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'network_error';
    return { ok: false, error: `network_error: ${msg}` };
  }

  if (!response.ok) {
    let detail = '';
    try {
      detail = await response.text();
    } catch {
      /* ignore */
    }
    return {
      ok: false,
      error: `http_${response.status}${detail ? `: ${detail.slice(0, 240)}` : ''}`,
    };
  }

  let data: GeminiResponse;
  try {
    data = (await response.json()) as GeminiResponse;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'parse_error';
    return { ok: false, error: `parse_error: ${msg}` };
  }

  if (data.error?.message) {
    return { ok: false, error: `gemini_error: ${data.error.message}` };
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { ok: false, error: 'empty_response' };
  }

  return { ok: true, text: text.trim() };
}

function buildSinglePrompt(opts: {
  text: string;
  targetLang: TargetLang;
  sourceLang?: string;
  context?: string;
}): string {
  const langName = LANG_FULL_NAME[opts.targetLang];
  const ctx = opts.context ? `Context: ${opts.context}\n` : '';
  const src = opts.sourceLang ? `Source language: ${opts.sourceLang}\n` : '';
  return (
    `You are a culinary translator for an Indian cooking app. Translate the following text into ${langName} for a home cook. ` +
    `Preserve numeric amounts, time units, and ingredient names if commonly used untranslated in the kitchen. ` +
    `Return ONLY the translated text, no preamble.\n` +
    src +
    ctx +
    `\nTEXT:\n${opts.text}`
  );
}

export async function translateText(opts: {
  text: string;
  targetLang: TargetLang;
  sourceLang?: string;
  context?: string;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (!opts.text || !opts.text.trim()) {
    return { ok: true, text: opts.text };
  }
  if (opts.targetLang === 'en' && (!opts.sourceLang || opts.sourceLang === 'en')) {
    return { ok: true, text: opts.text };
  }
  return callGemini(buildSinglePrompt(opts));
}

function buildBatchPrompt(opts: {
  items: Array<{ id: string; text: string }>;
  targetLang: TargetLang;
  context?: string;
}): string {
  const langName = LANG_FULL_NAME[opts.targetLang];
  const ctx = opts.context ? `Context: ${opts.context}\n` : '';
  const payload = opts.items.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.text;
    return acc;
  }, {});
  return (
    `You are a culinary translator for an Indian cooking app. Translate each VALUE in the JSON object below into ${langName} for a home cook. ` +
    `Preserve numeric amounts, time units, and ingredient names if commonly used untranslated in the kitchen. ` +
    `Keep the same KEYS. Return ONLY a JSON object with the same keys mapped to their translated values. ` +
    `Do not wrap the JSON in markdown fences or add commentary.\n` +
    ctx +
    `\nINPUT JSON:\n${JSON.stringify(payload)}`
  );
}

function stripJsonFences(raw: string): string {
  let s = raw.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '');
    if (s.endsWith('```')) s = s.slice(0, -3);
    s = s.trim();
  }
  return s;
}

function parseBatchResponse(
  raw: string,
  expectedIds: string[],
): Record<string, string> | null {
  const cleaned = stripJsonFences(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const id of expectedIds) {
    const v = obj[id];
    if (typeof v === 'string') out[id] = v;
  }
  return out;
}

export async function translateBatch(opts: {
  items: Array<{ id: string; text: string }>;
  targetLang: TargetLang;
  context?: string;
}): Promise<
  | { ok: true; translations: Record<string, string> }
  | { ok: false; error: string }
> {
  if (!Array.isArray(opts.items) || opts.items.length === 0) {
    return { ok: true, translations: {} };
  }

  // Filter out empty texts so we never burn quota on whitespace.
  const filtered = opts.items.filter(
    (it) => typeof it.text === 'string' && it.text.trim().length > 0,
  );
  if (filtered.length === 0) {
    const identity: Record<string, string> = {};
    for (const it of opts.items) identity[it.id] = it.text ?? '';
    return { ok: true, translations: identity };
  }

  const result = await callGemini(
    buildBatchPrompt({
      items: filtered,
      targetLang: opts.targetLang,
      context: opts.context,
    }),
  );
  if (!result.ok) return result;

  const parsed = parseBatchResponse(
    result.text,
    filtered.map((it) => it.id),
  );
  if (!parsed) {
    return { ok: false, error: 'batch_parse_error' };
  }

  // Merge: empty originals pass through unchanged.
  const translations: Record<string, string> = {};
  for (const it of opts.items) {
    translations[it.id] = parsed[it.id] ?? it.text ?? '';
  }
  return { ok: true, translations };
}
