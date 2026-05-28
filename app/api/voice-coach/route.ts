import { NextResponse } from 'next/server';
import { callOpenAIJson, hasOpenAIKey } from '@/lib/ai/openai';
import { getDish } from '@/lib/data/dishes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type VoiceCoachRequest = {
  dishId?: string;
  currentStep?: number;
  question?: string;
  locale?: string;
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

  const step =
    typeof body.currentStep === 'number'
      ? dish.cookingSteps.find((item) => item.index === body.currentStep) ?? dish.cookingSteps[0]
      : dish.cookingSteps[0];

  const fallbackReply = buildFallbackReply(question, step.title, step.beginnerExplanation);

  if (!hasOpenAIKey()) {
    const response: VoiceCoachResponse = {
      ok: true,
      source: 'fallback',
      reply: fallbackReply,
      warning: 'OPENAI_API_KEY is missing, so ChefSense returned local voice guidance.',
    };
    return NextResponse.json(response);
  }

  const aiResult = await callOpenAIJson<VoiceCoachPayload>({
    temperature: 0.35,
    messages: [
      {
        role: 'system',
        content:
          'You are ChefSense AI. Reply in plain, short, chef-style guidance for a home cook. Return only JSON with a single reply string. Be specific to the current step, heat, texture, smell, and timing. Keep it under 90 words.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          locale: body.locale ?? 'en-IN',
          dish: dish.dishName,
          currentStep: {
            index: step.index,
            title: step.title,
            instruction: step.instruction,
            beginnerExplanation: step.beginnerExplanation,
            heat: step.heat,
            sensoryCues: step.sensoryCues,
          },
          question,
          responseShape: {
            reply: 'string',
          },
        }),
      },
    ],
  });

  const locale = normalizeLocale(body.locale);
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

function buildFallbackReply(question: string, stepTitle: string, explanation: string) {
  const lower = question.toLowerCase();

  if (lower.includes('stick') || lower.includes('burn')) {
    return 'Lower the heat a little, add a spoon of hot water if needed, and stir gently so the pan does not catch while this step finishes.';
  }

  if (lower.includes('look') || lower.includes('ready')) {
    return `For ${stepTitle.toLowerCase()}, look for the visual and texture cues on screen before you move on. ${explanation}`;
  }

  if (lower.includes('smell') || lower.includes('aroma')) {
    return 'Use the aroma cue first. If the raw smell is still sharp, stay on this step a bit longer before marking it done.';
  }

  return `Stay with ${stepTitle.toLowerCase()} for now. ${explanation}`;
}

async function safeJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
