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

  if (!aiResult.ok) {
    const response: VoiceCoachResponse = {
      ok: true,
      source: 'fallback',
      reply: fallbackReply,
      warning: 'OpenAI voice guidance failed, so ChefSense returned local coaching.',
    };
    return NextResponse.json(response);
  }

  return NextResponse.json({
    ok: true,
    source: 'openai',
    reply: aiResult.data.reply?.trim() || fallbackReply,
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
