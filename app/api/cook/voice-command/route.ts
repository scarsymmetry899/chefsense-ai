/**
 * /api/cook/voice-command — Unified voice pipeline
 *
 * Single serverless hop: audio blob → Whisper STT → GPT-4o (grounded) →
 * ElevenLabs Flash TTS → raw audio stream back to the browser.
 *
 * Why one route instead of three separate trips from the client:
 * - Eliminates two round-trip latencies on mobile (kitchen Wi-Fi)
 * - Transcript + chef reply travel as response headers alongside the audio
 * - No base64 overhead: the audio bytes stream straight through
 * - ElevenLabs eleven_flash_v2_5 model generates audio in ~75 ms
 */

import { getDish } from '@/lib/data/dishes';
import { transcribeAudio } from '@/lib/ai/whisper';
import { hasOpenAIKey } from '@/lib/ai/openai';
import { voiceIdForLocale } from '@/lib/ai/elevenlabs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Max reply length — keeps TTS snappy in the kitchen.
const MAX_REPLY_WORDS = 60;

type SupportedLocale = 'en' | 'hi' | 'te';

function normaliseLocale(raw: string | null): SupportedLocale {
  if (!raw) return 'en';
  const l = raw.trim().toLowerCase();
  if (l.startsWith('hi')) return 'hi';
  if (l.startsWith('te')) return 'te';
  return 'en';
}

const LOCALE_INSTRUCTION: Record<SupportedLocale, string> = {
  en: 'Reply in English.',
  hi: 'Reply in Hindi (Devanagari script). Do NOT use Romanised Hindi.',
  te: 'Reply in Telugu (Telugu script). Do NOT use Romanised Telugu.',
};

function buildSystemPrompt(
  dishId: string,
  stepIndex: number,
  locale: SupportedLocale,
): string {
  const dish = getDish(dishId);
  if (!dish) {
    return [
      `You are ChefSense AI, a real-time Indian cooking coach. ${LOCALE_INSTRUCTION[locale]}`,
      `Keep every reply under ${MAX_REPLY_WORDS} words. Be direct and chef-like.`,
    ].join(' ');
  }

  const step = dish.cookingSteps.find((s) => s.index === stepIndex) ?? dish.cookingSteps[0];

  const cues = step.sensoryCues
    .map((c) => `${c.type}: ${c.cue}`)
    .join(' | ');

  const rescueLines = dish.rescueIssues
    .map((r) => `${r.label}: ${r.immediateFix[0] ?? r.diagnosis}`)
    .join('; ');

  return [
    `You are ChefSense AI, a real-time Indian cooking coach. ${LOCALE_INSTRUCTION[locale]}`,
    ``,
    `DISH: ${dish.dishName} (${dish.region} | ${dish.difficulty})`,
    `CURRENT STEP ${step.index} of ${dish.cookingSteps.length}: "${step.title}"`,
    `INSTRUCTION: ${step.instruction}`,
    `HEAT: ${step.heat} | DURATION: ~${Math.ceil(step.durationSec / 60)} min`,
    cues ? `SENSORY CUES: ${cues}` : '',
    step.foodScience ? `FOOD SCIENCE: ${step.foodScience}` : '',
    ``,
    `RESCUE PROTOCOLS: ${rescueLines}`,
    ``,
    `STRICT RULES:`,
    `1. Only answer from the recipe context above. Never invent extra steps or ingredients.`,
    `2. If asked about anything else: "I'm focused on your ${dish.dishName} right now. What about this step?"`,
    `3. Keep every reply under ${MAX_REPLY_WORDS} words — this is spoken audio in a noisy kitchen.`,
    `4. If the user describes burning, a failure, or an emergency — lead with the relevant rescue protocol immediately.`,
    `5. Be warm and direct, like a calm chef standing next to the stove.`,
  ]
    .filter(Boolean)
    .join('\n');
}

async function getGPT4oReply(
  systemPrompt: string,
  userText: string,
  history?: Array<{ role: string; text: string }>,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const historyBlock = history?.length
    ? `\nConversation so far:\n${history
        .map((h) => `${h.role === 'assistant' ? 'Chef' : 'Cook'}: ${h.text}`)
        .join('\n')}\n`
    : '';

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 120,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(historyBlock
          ? [{ role: 'user', content: `Context from earlier in this session:${historyBlock}` }]
          : []),
        { role: 'user', content: userText },
      ],
    }),
  });

  if (!resp.ok) {
    throw new Error(`OpenAI GPT-4o error: ${resp.status}`);
  }

  const data = (await resp.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

async function streamFromElevenLabs(
  text: string,
  locale: SupportedLocale,
): Promise<Response | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  const voiceId = voiceIdForLocale(locale);
  // eleven_flash_v2_5 generates in ~75 ms — ideal for kitchen responsiveness.
  const modelId = process.env.ELEVENLABS_FLASH_MODEL_ID?.trim() ?? 'eleven_flash_v2_5';

  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?model_id=${modelId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        voice_settings: { stability: 0.4, similarity_boost: 0.85 },
      }),
    },
  );

  if (!resp.ok) return null;
  return resp;
}

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: 'invalid_form_data' }, { status: 400 });
  }

  const audioFile = formData.get('audio') as File | null;
  const dishId = String(formData.get('dishId') ?? '').trim();
  const stepIndex = Number(formData.get('stepIndex') ?? formData.get('currentStep') ?? 1);
  const locale = normaliseLocale(formData.get('locale') as string | null);
  const historyRaw = formData.get('history');
  const history = historyRaw
    ? (() => { try { return JSON.parse(String(historyRaw)) as Array<{ role: string; text: string }>; } catch { return []; } })()
    : [];

  if (!audioFile) {
    return Response.json({ error: 'no_audio' }, { status: 400 });
  }

  if (!hasOpenAIKey()) {
    return Response.json({ error: 'missing_openai_key' }, { status: 500 });
  }

  // ── 1. Whisper STT ──────────────────────────────────────────────────────────
  let userTranscript: string;
  try {
    const result = await transcribeAudio({ audio: audioFile, locale });
    if (!result.ok) {
      return Response.json(
        { error: result.error, message: "We didn't catch that. Try again." },
        { status: 422 },
      );
    }
    userTranscript = result.text.trim();
    if (!userTranscript) {
      return Response.json(
        { error: 'transcription_empty', message: "We didn't catch that. Speak more clearly and try again." },
        { status: 422 },
      );
    }
  } catch (err) {
    return Response.json(
      { error: 'transcription_failed', detail: String(err) },
      { status: 500 },
    );
  }

  // ── 2. GPT-4o grounded reply ────────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(dishId, stepIndex, locale);
  let chefReply: string;
  try {
    chefReply = await getGPT4oReply(systemPrompt, userTranscript, history.slice(-6));
    if (!chefReply) throw new Error('empty_reply');
  } catch (err) {
    // Graceful text-only fallback — no audio but still useful
    return Response.json(
      {
        ok: true,
        source: 'fallback',
        transcript: userTranscript,
        reply: 'I had trouble understanding that. Could you ask again more clearly?',
      },
      { status: 200 },
    );
  }

  // ── 3. ElevenLabs Flash TTS → stream audio directly ────────────────────────
  let elevenResp: Response | null = null;
  try {
    elevenResp = await streamFromElevenLabs(chefReply, locale);
  } catch {
    // TTS failure → return text-only JSON so the UI can still show the reply
  }

  if (!elevenResp?.body) {
    // No TTS available — return JSON with text so the UI shows the reply
    return Response.json(
      {
        ok: true,
        source: 'openai',
        transcript: userTranscript,
        reply: chefReply,
      },
      { status: 200 },
    );
  }

  // ── 4. Pass the raw audio stream back with text in headers ──────────────────
  return new Response(elevenResp.body, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
      // Transcript and reply travel alongside the audio — no extra fetch needed.
      'X-Chef-Transcript': encodeURIComponent(userTranscript),
      'X-Chef-Reply': encodeURIComponent(chefReply),
      'X-Chef-Source': 'openai',
    },
  });
}
