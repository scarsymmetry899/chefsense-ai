import { NextResponse } from 'next/server';
import { callOpenAIJson, hasOpenAIKey } from '@/lib/ai/openai';
import { transcribeAudio } from '@/lib/ai/whisper';
import {
  hasElevenLabsKey,
  synthesizeSpeech,
  type ElevenLabsLocale,
} from '@/lib/ai/elevenlabs';
import { getDish } from '@/lib/data/dishes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SupportedLocale = 'en' | 'hi' | 'te';

type VoiceTurnRow = {
  dish_id: string;
  step_index: number | null;
  locale: SupportedLocale;
  role: 'user' | 'assistant';
  transcript: string;
  source: 'openai' | 'fallback' | 'voice' | null;
};

/**
 * Decode the user id (`sub` claim) from a Supabase JWT without verifying the
 * signature. Supabase still validates the token server-side via RLS — we only
 * use this value to satisfy the NOT NULL `user_id` column on insert.
 */
function decodeJwtSub(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    const claims = JSON.parse(json) as { sub?: unknown };
    return typeof claims.sub === 'string' ? claims.sub : null;
  } catch {
    return null;
  }
}

/**
 * Best-effort: persist a chat exchange to Supabase under the user's identity
 * via their forwarded access token. RLS keeps writes scoped to the user.
 * Failures here NEVER break the voice turn — they're logged-and-swallowed.
 */
async function saveTranscriptTurns(opts: {
  accessToken: string | null;
  rows: VoiceTurnRow[];
}) {
  if (!opts.accessToken || opts.rows.length === 0) return;
  const userId = decodeJwtSub(opts.accessToken);
  if (!userId) return;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return;

  try {
    await fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/voice_turns`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${opts.accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(opts.rows.map((row) => ({ ...row, user_id: userId }))),
    });
  } catch {
    // Persistence is best-effort. Never bubble a write error to the user.
  }
}

function extractAccessToken(request: Request): string | null {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

type TurnResponseOk = {
  ok: true;
  transcript: string;
  reply: string;
  locale: SupportedLocale;
  audioBase64?: string;
  audioMime?: string;
  source: 'openai' | 'fallback';
  warnings: string[];
};

type TurnResponseErr = {
  ok: false;
  error: string;
  warnings?: string[];
};

type TurnPayload = {
  reply: string;
};

const FALLBACK_REPLY: Record<SupportedLocale, (stepTitle: string) => string> = {
  en: (stepTitle) =>
    `Stay with ${stepTitle.toLowerCase()} for now. Watch the cues on screen and call me again if anything looks off.`,
  hi: (stepTitle) =>
    `अभी ${stepTitle} पर ध्यान दीजिए। स्क्रीन पर दिए संकेत देखिए और कुछ अलग दिखे तो मुझे फिर बुलाइए।`,
  te: (stepTitle) =>
    `ఇప్పుడు ${stepTitle} మీద దృష్టి పెట్టండి. స్క్రీన్ మీద ఇచ్చిన సూచనలు చూడండి, ఏదైనా తేడాగా అనిపిస్తే మళ్ళీ పిలవండి.`,
};

const SYSTEM_PROMPT: Record<SupportedLocale, string> = {
  en:
    'You are ChefSense AI, a calm hands-free cooking coach. Reply in English in plain, short, chef-style guidance for a home cook. Be specific to the current step, heat, texture, smell, and timing. Keep it under 70 words. Return only JSON with a single "reply" string.',
  hi:
    'आप ChefSense AI हैं, एक शांत हैंड्स-फ़्री कुकिंग कोच। उत्तर सरल, छोटी, शेफ़-स्टाइल हिन्दी में दीजिए। मौजूदा स्टेप, आँच, बनावट, ख़ुशबू और समय के बारे में सटीक रहिए। 70 शब्दों से कम रखिए। केवल JSON दीजिए जिसमें एक "reply" स्ट्रिंग हो।',
  te:
    'మీరు ChefSense AI, ఒక ప్రశాంతమైన హ్యాండ్స్-ఫ్రీ వంట కోచ్. సమాధానం సరళమైన, చిన్నదైన, చెఫ్-శైలి తెలుగులో ఇవ్వండి. ప్రస్తుత స్టెప్, వేడి, ఆకృతి, వాసన మరియు సమయం గురించి స్పష్టంగా ఉండండి. 70 పదాలలోపు ఉంచండి. ఒకే "reply" స్ట్రింగ్‌తో JSON మాత్రమే ఇవ్వండి.',
};

function normalizeLocale(value: unknown): SupportedLocale {
  if (typeof value !== 'string') return 'en';
  const lower = value.trim().toLowerCase();
  if (lower.startsWith('hi')) return 'hi';
  if (lower.startsWith('te')) return 'te';
  return 'en';
}

function parseStepIndex(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}

export async function POST(request: Request): Promise<NextResponse<TurnResponseOk | TurnResponseErr>> {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json<TurnResponseErr>({
        ok: false,
        error: 'invalid_form_data',
      });
    }

    const dishId = (formData.get('dishId') as string | null)?.trim();
    if (!dishId) {
      return NextResponse.json<TurnResponseErr>({
        ok: false,
        error: 'missing_dish_id',
      });
    }

    const dish = getDish(dishId);
    if (!dish) {
      return NextResponse.json<TurnResponseErr>(
        { ok: false, error: 'unknown_dish' },
        { status: 404 },
      );
    }

    const audio = formData.get('audio') as Blob | null;
    if (!audio || typeof (audio as Blob).arrayBuffer !== 'function') {
      return NextResponse.json<TurnResponseErr>({
        ok: false,
        error: 'missing_audio',
      });
    }

    const locale = normalizeLocale(formData.get('locale'));
    const transcriptOnlyRaw = formData.get('transcriptOnly');
    const transcriptOnly =
      typeof transcriptOnlyRaw === 'string' &&
      transcriptOnlyRaw.trim().toLowerCase() === 'true';

    const stepIndex = parseStepIndex(formData.get('currentStep'));
    const step =
      (typeof stepIndex === 'number'
        ? dish.cookingSteps.find((item) => item.index === stepIndex)
        : undefined) ?? dish.cookingSteps[0];

    const warnings: string[] = [];

    // -------- Step 1: STT --------
    if (!hasOpenAIKey()) {
      warnings.push('OPENAI_API_KEY missing; transcription is unavailable.');
      return NextResponse.json<TurnResponseErr>({
        ok: false,
        error: 'transcription_failed',
        warnings,
      });
    }

    const sttMime = (audio as Blob).type || 'audio/webm';
    const stt = await transcribeAudio({
      audio,
      mimeType: sttMime,
      locale,
    });

    if (!stt.ok || !stt.text.trim()) {
      return NextResponse.json<TurnResponseErr>({
        ok: false,
        error: 'transcription_failed',
        warnings,
      });
    }

    const transcript = stt.text.trim();

    // -------- Step 2: Reasoning --------
    const fallbackReply = FALLBACK_REPLY[locale](step.title);
    let reply = fallbackReply;
    let source: 'openai' | 'fallback' = 'fallback';

    const aiResult = await callOpenAIJson<TurnPayload>({
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT[locale],
        },
        {
          role: 'user',
          content: JSON.stringify({
            locale,
            dish: dish.dishName,
            currentStep: {
              index: step.index,
              title: step.title,
              instruction: step.instruction,
              beginnerExplanation: step.beginnerExplanation,
              heat: step.heat,
              sensoryCues: step.sensoryCues,
            },
            question: transcript,
            responseShape: {
              reply: 'string',
            },
          }),
        },
      ],
    });

    if (aiResult.ok) {
      const trimmed = aiResult.data.reply?.trim();
      if (trimmed) {
        reply = trimmed;
        source = 'openai';
      } else {
        warnings.push('OpenAI returned an empty reply; using local fallback.');
      }
    } else {
      warnings.push('OpenAI reasoning failed; using local fallback.');
    }

    // -------- Step 3: TTS --------
    let audioBase64: string | undefined;
    let audioMime: string | undefined;

    if (transcriptOnly) {
      // Skip TTS by request.
    } else if (!hasElevenLabsKey()) {
      warnings.push('ELEVENLABS_API_KEY missing; returning text-only reply.');
    } else {
      const tts = await synthesizeSpeech({
        text: reply,
        locale: locale as ElevenLabsLocale,
      });
      if (tts.ok) {
        audioBase64 = tts.audioBase64;
        audioMime = tts.mime;
      } else {
        warnings.push(`TTS failed (${tts.error}); returning text-only reply.`);
      }
    }

    // Best-effort transcript persistence (does not block response).
    void saveTranscriptTurns({
      accessToken: extractAccessToken(request),
      rows: [
        {
          dish_id: dish.dishId,
          step_index: step.index,
          locale,
          role: 'user',
          transcript,
          source: 'voice',
        },
        {
          dish_id: dish.dishId,
          step_index: step.index,
          locale,
          role: 'assistant',
          transcript: reply,
          source,
        },
      ],
    });

    const responseBody: TurnResponseOk = {
      ok: true,
      transcript,
      reply,
      locale,
      source,
      warnings,
      ...(audioBase64 ? { audioBase64 } : {}),
      ...(audioMime ? { audioMime } : {}),
    };

    return NextResponse.json<TurnResponseOk>(responseBody);
  } catch (error) {
    return NextResponse.json<TurnResponseErr>({
      ok: false,
      error:
        error instanceof Error
          ? `voice_turn_failed:${error.message}`
          : 'voice_turn_failed',
    });
  }
}
