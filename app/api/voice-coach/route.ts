import { NextResponse } from 'next/server';
import { callOpenAIJson, hasOpenAIKey } from '@/lib/ai/openai';
import { getDish } from '@/lib/data/dishes';
import type { CookingStep, Dish } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HistoryItem = { role: 'user' | 'assistant'; text: string };

type VoiceCoachRequest = {
  dishId?: string;
  currentStep?: number;
  question?: string;
  locale?: string;
  history?: HistoryItem[];
};

type SupportedLocale = 'en' | 'hi' | 'te';

function normalizeLocale(value: string | undefined): SupportedLocale {
  if (!value) return 'en';
  const lower = value.trim().toLowerCase();
  if (lower.startsWith('hi')) return 'hi';
  if (lower.startsWith('te')) return 'te';
  return 'en';
}

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

async function saveTranscriptTurns(opts: {
  accessToken: string | null;
  dishId: string;
  stepIndex: number;
  locale: SupportedLocale;
  question: string;
  reply: string;
  source: 'openai' | 'fallback';
}) {
  if (!opts.accessToken) return;
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
      body: JSON.stringify([
        {
          user_id: userId,
          dish_id: opts.dishId,
          step_index: opts.stepIndex,
          locale: opts.locale,
          role: 'user',
          transcript: opts.question,
          source: opts.source,
        },
        {
          user_id: userId,
          dish_id: opts.dishId,
          step_index: opts.stepIndex,
          locale: opts.locale,
          role: 'assistant',
          transcript: opts.reply,
          source: opts.source,
        },
      ]),
    });
  } catch {
    // Persistence is best-effort.
  }
}

type VoiceCoachResponse = {
  ok: true;
  source: 'openai' | 'fallback';
  reply: string;
  warning?: string;
};

type VoiceCoachPayload = {
  reply: string;
};

export async function POST(request: Request) {
  const body = (await safeJson(request)) as VoiceCoachRequest;
  const dishId = body.dishId?.trim();
  const question = body.question?.trim();

  if (!dishId || !question) {
    return NextResponse.json(
      { ok: false, error: 'dishId and question are required.' },
      { status: 400 },
    );
  }

  const dish = getDish(dishId);
  if (!dish) {
    return NextResponse.json({ ok: false, error: `Unknown dish: ${dishId}` }, { status: 404 });
  }

  // currentStep=0 means prep/ingredients mode — no specific cooking step yet.
  const isPrepMode = typeof body.currentStep === 'number' && body.currentStep === 0;

  const step =
    typeof body.currentStep === 'number' && body.currentStep > 0
      ? dish.cookingSteps.find((item) => item.index === body.currentStep) ?? dish.cookingSteps[0]
      : dish.cookingSteps[0];

  // Prep-mode fallback: return the ingredient list when in prep/ingredients context
  const fallbackReply = isPrepMode
    ? `For ${dish.dishName} you need: ${dish.ingredients.slice(0, 6).map((i) => `${i.name} (${i.quantity})`).join(', ')}${dish.ingredients.length > 6 ? `, and ${dish.ingredients.length - 6} more` : ''}.`
    : buildFallbackReply(question, step, dish);

  if (!hasOpenAIKey()) {
    const response: VoiceCoachResponse = {
      ok: true,
      source: 'fallback',
      reply: fallbackReply,
      warning: 'OPENAI_API_KEY is missing, so ChefSense returned local voice guidance.',
    };
    return NextResponse.json(response);
  }

  const locale = normalizeLocale(body.locale);

  const localeInstruction: Record<SupportedLocale, string> = {
    en: 'Respond in English.',
    hi: 'Respond in Hindi (Devanagari script). Do NOT use Romanised Hindi.',
    te: 'Respond in Telugu (Telugu script). Do NOT use Romanised Telugu.',
  };

  const ingredientSummary = dish.ingredients
    .map((i) => `${i.name}: ${i.quantity}`)
    .join('; ');

  const systemPrompt = isPrepMode
    ? [
        `You are ChefSense AI, helping someone prepare to cook ${dish.dishName}.`,
        `INGREDIENTS: ${ingredientSummary}.`,
        `TOOLS: ${dish.tools.map((t) => t.name).join(', ')}.`,
        dish.miseEnPlace?.length
          ? `PREP CHECKLIST: ${dish.miseEnPlace.map((m) => m.label).join(', ')}.`
          : '',
        'Answer questions about ingredients, quantities, substitutions, tools, and prep. If asked for the full ingredient list, give every item with its quantity.',
        'Return only JSON with a single reply string. Keep the reply under 100 words.',
        localeInstruction[locale],
      ].filter(Boolean).join(' ')
    : [
        'You are ChefSense AI, a voice cooking coach.',
        `Dish: ${dish.dishName}. Cuisine: ${dish.cuisine ?? 'Indian'}.`,
        `Current step: "${step.title}" — ${step.instruction}`,
        `Heat: ${step.heat}.`,
        step.sensoryCues?.length
          ? `Sensory cues: ${step.sensoryCues.map((c) => c.cue).join('; ')}.`
          : '',
        `You are helping with THIS STEP ONLY — do NOT mention other step numbers. If the user is done, say "Great job! You can move to the next step when you're ready." Do NOT name specific other steps.`,
        'Return only JSON with a single reply string. Keep the reply under 90 words.',
        localeInstruction[locale],
      ].filter(Boolean).join(' ');

  // Include the last few conversational turns as context so the AI can
  // follow the thread across step changes and navigations.
  const history = Array.isArray(body.history) ? (body.history as HistoryItem[]) : [];
  const historyBlock = history.length
    ? `\nConversation so far:\n${history
        .filter((h) => h.role && h.text)
        .map((h) => `${h.role === 'assistant' ? 'Chef' : 'Cook'}: ${h.text}`)
        .join('\n')}\n`
    : '';

  const aiResult = await callOpenAIJson<VoiceCoachPayload>({
    temperature: 0.35,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: JSON.stringify({
          question,
          context: historyBlock || undefined,
          responseShape: { reply: 'string' },
        }),
      },
    ],
  });

  const accessToken =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || null;

  if (!aiResult.ok) {
    void saveTranscriptTurns({
      accessToken,
      dishId,
      stepIndex: step.index,
      locale,
      question,
      reply: fallbackReply,
      source: 'fallback',
    });

    const response: VoiceCoachResponse = {
      ok: true,
      source: 'fallback',
      reply: fallbackReply,
      warning: 'OpenAI voice guidance failed, so ChefSense returned local coaching.',
    };
    return NextResponse.json(response);
  }

  const reply = aiResult.data.reply?.trim() || fallbackReply;

  void saveTranscriptTurns({
    accessToken,
    dishId,
    stepIndex: step.index,
    locale,
    question,
    reply,
    source: 'openai',
  });

  return NextResponse.json({
    ok: true,
    source: 'openai',
    reply,
  } satisfies VoiceCoachResponse);
}

function buildFallbackReply(question: string, step: CookingStep, dish: Dish) {
  const lower = question.toLowerCase();

  // "How to" navigate / mark as done
  if ((lower.includes('how to') || lower.includes('tell me how') || lower.includes('how do i')) &&
      (lower.includes('next step') || lower.includes('mark') || lower.includes('complete') || lower.includes('done'))) {
    return 'Scroll down and tap "Mark step done" — that completes the current step and unlocks the Next button at the top. Then tap Next to move forward.';
  }

  // Pan check intent
  if (lower.includes('pan') || lower.includes('how does it look') || lower.includes('check my') || lower.includes('analyse')) {
    return 'Tap the AI Pan Checker button below to upload a photo of your pan — it will analyse exactly what\'s happening at this step and give you specific guidance.';
  }

  // Timer intent
  if (lower.includes('how much time') || lower.includes('time left') || (lower.includes('how long') && lower.includes('left'))) {
    return `Check the timer on your screen. Step ${step.index} "${step.title}" has a target of ${Math.ceil(step.durationSec / 60)} minutes.`;
  }

  // Previous/back intent
  if (lower.includes('go back') || lower.includes('previous step') || lower.includes('last step') || lower.includes('back to')) {
    return 'Tap the Prev button above to go back to the previous step.';
  }

  // Next step / done intent
  if (lower.includes('done') || lower.includes('next step') || lower.includes('go to next') || lower.includes('move on') || lower.includes('what next') || lower.includes('what do i do next')) {
    return `When you're ready, tap "Mark step done" below to unlock the next step.`;
  }

  // Visual cues / what to look for
  if (lower.includes('visual') || lower.includes('look for') || lower.includes('how to know') || lower.includes('how do i know')) {
    const cues = step.sensoryCues.map(c => `${c.type}: ${c.cue}`).join('; ');
    return cues ? `For this step, watch for: ${cues}` : `Check the sensory cue cards on your screen — they show exactly what to look, smell, and listen for.`;
  }

  // Burning / sticking
  if (lower.includes('stick') || lower.includes('burn') || lower.includes('smoke')) {
    return 'Lower the heat immediately. Add a splash of hot water if needed and stir gently to lift anything from the base without scraping.';
  }

  // Smell / aroma
  if (lower.includes('smell') || lower.includes('aroma')) {
    return 'Use the aroma cue first. If the raw smell is still sharp, stay on this step a little longer before marking it done.';
  }

  // What steps are left
  if (lower.includes('steps left') || lower.includes('remaining steps') || lower.includes('how many steps') || lower.includes('steps are left')) {
    const remaining = dish.cookingSteps.length - step.index;
    return `You are on Step ${step.index} of ${dish.cookingSteps.length}. There are ${remaining} step${remaining === 1 ? '' : 's'} remaining after this one.`;
  }

  // Generic — return the step instruction
  return `For ${step.title.toLowerCase()}: ${step.instruction}`;
}

async function safeJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
