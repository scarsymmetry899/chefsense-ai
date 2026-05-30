import { NextResponse, type NextRequest } from 'next/server';
import { getDish } from '@/lib/data/dishes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime/sessions';
// Use the undated alias — the dated snapshot may not be provisioned on all tiers.
const DEFAULT_MODEL = 'gpt-4o-realtime-preview';

type SupportedLocale = 'en' | 'hi' | 'te';

const VOICE_FOR_LOCALE: Record<SupportedLocale, string> = {
  en: 'alloy',
  hi: 'shimmer',
  te: 'alloy',
};

const LANG_INSTRUCTION: Record<SupportedLocale, string> = {
  en: 'Respond in English.',
  hi: 'RESPOND IN HINDI (Devanagari script). Do NOT use Romanised Hindi.',
  te: 'RESPOND IN TELUGU (Telugu script). Do NOT use Romanised Telugu.',
};

function normaliseLocale(raw: unknown): SupportedLocale {
  if (typeof raw !== 'string') return 'en';
  const l = raw.trim().toLowerCase();
  if (l.startsWith('hi')) return 'hi';
  if (l.startsWith('te')) return 'te';
  return 'en';
}

/**
 * Build the system prompt injected into the Realtime session.
 * Grounded entirely in the dish + current step so the model cannot hallucinate
 * beyond the recipe context.
 */
function buildSystemPrompt(dishId: string, stepIndex: number, locale: SupportedLocale): string {
  const langLine = LANG_INSTRUCTION[locale];
  const dish = getDish(dishId);

  if (!dish) {
    return [
      `You are ChefSense AI, a real-time Indian cooking voice assistant. ${langLine}`,
      'Be concise — 1 to 3 short sentences per reply.',
    ].join('\n');
  }

  const step = dish.cookingSteps.find((s) => s.index === stepIndex) ?? dish.cookingSteps[0];
  const totalSteps = dish.cookingSteps.length;

  const cueText = (type: string) =>
    step.sensoryCues.find((c) => c.type === type)?.cue;

  const cues = [
    cueText('visual') && `• Visual — ${cueText('visual')}`,
    cueText('smell') && `• Smell — ${cueText('smell')}`,
    cueText('sound') && `• Sound — ${cueText('sound')}`,
    cueText('texture') && `• Texture — ${cueText('texture')}`,
  ]
    .filter(Boolean)
    .join('\n');

  const rescueLines = dish.rescueIssues
    .map((r) => `• ${r.label}: ${r.immediateFix[0] ?? r.diagnosis}`)
    .join('\n');

  const ingredientSummary = dish.ingredients
    .slice(0, 10)
    .map((i) => `${i.name} (${i.quantity})`)
    .join(', ');

  const stepOverview = dish.cookingSteps
    .map((s) => `Step ${s.index}: ${s.title}`)
    .join(' | ');

  return [
    `You are ChefSense AI, a real-time Indian cooking voice assistant. ${langLine}`,
    '',
    'STRICT GUARDRAILS:',
    '1. ONLY answer using the recipe context provided below. Never invent extra steps, ingredients, or techniques.',
    '2. If the user asks about anything outside this recipe, say exactly: "I only have context for your current dish. What can I help you with here?"',
    '3. Keep every reply SHORT — 1 to 3 sentences max. This is voice; brevity wins.',
    '4. Never repeat your name in every turn. Answer naturally, like a calm, skilled chef standing next to the user.',
    '5. If the user sounds stressed or uncertain, be reassuring first, then give the fix.',
    '',
    `═══ DISH CONTEXT ═══`,
    `Name: ${dish.dishName}`,
    `Region: ${dish.region} | Difficulty: ${dish.difficulty} | Total time: ${dish.totalTimeMin} min`,
    `About: ${dish.summary}`,
    `Key ingredients: ${ingredientSummary}`,
    '',
    `All steps: ${stepOverview}`,
    '',
    `═══ CURRENT STEP ${step.index} of ${totalSteps}: "${step.title}" ═══`,
    `Instruction: ${step.instruction}`,
    `Heat setting: ${step.heat}`,
    `Target duration: ~${Math.ceil(step.durationSec / 60)} min`,
    step.beginnerExplanation ? `Beginner tip: ${step.beginnerExplanation}` : '',
    cues ? `What to look / listen / smell for:\n${cues}` : '',
    step.foodScience ? `Food science: ${step.foodScience}` : '',
    '',
    `═══ RESCUE PROTOCOLS ═══`,
    rescueLines,
  ]
    .filter((line) => line !== undefined)
    .join('\n');
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'missing_openai_key' }, { status: 500 });
  }

  let dishId = '';
  let stepIndex = 1;
  let locale: SupportedLocale = 'en';

  try {
    const body = (await request.json()) as {
      dishId?: unknown;
      stepIndex?: unknown;
      locale?: unknown;
    };
    dishId = typeof body.dishId === 'string' ? body.dishId.trim() : '';
    stepIndex = typeof body.stepIndex === 'number' ? body.stepIndex : Number(body.stepIndex ?? 1);
    locale = normaliseLocale(body.locale);
  } catch {
    // proceed with defaults
  }

  const instructions = buildSystemPrompt(dishId, stepIndex, locale);
  const voice = VOICE_FOR_LOCALE[locale];
  const model = process.env.OPENAI_REALTIME_MODEL?.trim() || DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch(OPENAI_REALTIME_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        voice,
        instructions,
        modalities: ['audio', 'text'],
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 600,
        },
      }),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'openai_session_request_failed', detail: String(err) },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error('[voice/session] OpenAI error', response.status, errText);

    // Parse OpenAI's error body to give the client an actionable message.
    let openaiMessage = `OpenAI returned HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errText) as { error?: { message?: string; code?: string } };
      if (parsed.error?.message) openaiMessage = parsed.error.message;
    } catch { /* ignore */ }

    // Specific guidance for common access issues
    let hint = '';
    if (response.status === 403 || response.status === 401) {
      hint = 'Your OpenAI account may not have access to the Realtime API. Check platform.openai.com → Settings → Limits.';
    } else if (response.status === 404) {
      hint = 'The Realtime model was not found. Ensure your OpenAI org has gpt-4o-realtime-preview access.';
    }

    return NextResponse.json(
      { error: 'openai_session_failed', status: response.status, message: openaiMessage, hint },
      { status: 502 },
    );
  }

  const data = (await response.json()) as unknown;
  return NextResponse.json(data);
}
