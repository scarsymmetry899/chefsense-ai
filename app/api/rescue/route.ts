import { NextResponse } from 'next/server';
import { getDish } from '@/lib/data/dishes';
import { getDefaultRescueIssue } from '@/lib/dish-flow';
import type { RescueIssue } from '@/lib/types';
import { callOpenAIJson, hasOpenAIKey } from '@/lib/ai/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RescueRequest = {
  dishId?: string;
  issueId?: string;
  issue?: string;
  currentStep?: number;
  context?: string;
  notes?: string;
  selectedIssues?: string[];
};

type RescueResponse = {
  ok: true;
  source: 'openai' | 'fallback';
  rescue: RescueIssue;
  stepTitle?: string;
  warning?: string;
};

type RescueModelPayload = Pick<
  RescueIssue,
  'diagnosis' | 'immediateFix' | 'preventNextTime' | 'foodScience'
>;

export async function POST(request: Request) {
  const body = (await safeJson(request)) as RescueRequest;
  const dishId = body.dishId?.trim();

  if (!dishId) {
    return NextResponse.json({ ok: false, error: 'dishId is required.' }, { status: 400 });
  }

  const dish = getDish(dishId);
  if (!dish) {
    return NextResponse.json({ ok: false, error: `Unknown dish: ${dishId}` }, { status: 404 });
  }

  const step =
    typeof body.currentStep === 'number'
      ? dish.cookingSteps.find((item) => item.index === body.currentStep)
      : undefined;

  const baseIssue = pickIssue(dish.rescueIssues, body) ?? getDefaultRescueIssue(dish, step?.index ?? 1);

  if (!hasOpenAIKey()) {
    return NextResponse.json(
      buildFallbackResponse(baseIssue, step?.title, 'OPENAI_API_KEY is missing, so ChefSense returned local rescue guidance.'),
    );
  }

  const aiResult = await callOpenAIJson<RescueModelPayload>({
    temperature: 0.25,
    messages: [
      {
        role: 'system',
        content:
          'You are ChefSense AI. Return only JSON. Improve rescue guidance for a home cook in plain language. Keep the advice practical, calm, and safe. Avoid naming external chefs, publishers, channels, or books.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          dish: {
            dishId: dish.dishId,
            name: dish.dishName,
            summary: dish.summary,
          },
          currentStep: step
            ? {
                index: step.index,
                title: step.title,
                instruction: step.instruction,
                heat: step.heat,
              }
            : null,
          issue: {
            label: baseIssue.label,
            diagnosis: baseIssue.diagnosis,
            immediateFix: baseIssue.immediateFix,
            preventNextTime: baseIssue.preventNextTime,
            foodScience: baseIssue.foodScience,
          },
          cookContext: body.context ?? '',
          notes: body.notes ?? '',
          responseShape: {
            diagnosis: 'string',
            immediateFix: ['string'],
            preventNextTime: ['string'],
            foodScience: 'string',
          },
        }),
      },
    ],
  });

  if (!aiResult.ok) {
    return NextResponse.json(
      buildFallbackResponse(baseIssue, step?.title, 'OpenAI rescue generation failed, so ChefSense returned local rescue guidance.'),
    );
  }

  const rescue: RescueIssue = {
    ...baseIssue,
    diagnosis: aiResult.data.diagnosis?.trim() || baseIssue.diagnosis,
    immediateFix: cleanList(aiResult.data.immediateFix, baseIssue.immediateFix),
    preventNextTime: cleanList(aiResult.data.preventNextTime, baseIssue.preventNextTime),
    foodScience: aiResult.data.foodScience?.trim() || baseIssue.foodScience,
  };

  const response: RescueResponse = {
    ok: true,
    source: 'openai',
    rescue,
    stepTitle: step?.title,
  };

  return NextResponse.json(response);
}

function pickIssue(issues: RescueIssue[], body: RescueRequest) {
  const rawCandidates = [
    body.issueId,
    body.issue,
    ...(body.selectedIssues ?? []),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  if (!rawCandidates.length) return undefined;

  return issues.find((issue) => {
    const id = issue.id.toLowerCase();
    const label = issue.label.toLowerCase();
    return rawCandidates.some((candidate) => candidate === id || label.includes(candidate) || candidate.includes(id));
  });
}

function buildFallbackResponse(rescue: RescueIssue, stepTitle?: string, warning?: string): RescueResponse {
  return {
    ok: true,
    source: 'fallback',
    rescue,
    stepTitle,
    warning,
  };
}

function cleanList(candidate: string[] | undefined, fallback: string[]) {
  const list = Array.isArray(candidate)
    ? candidate.map((item) => item.trim()).filter(Boolean)
    : [];
  return list.length ? list : fallback;
}

async function safeJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
