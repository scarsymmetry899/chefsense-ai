import { NextResponse } from 'next/server';
import { callOpenAIJson, hasOpenAIKey, normalizeImageInput } from '@/lib/ai/openai';
import { getDish } from '@/lib/data/dishes';
import {
  getDefaultRescueIssue,
  getHeatMeta,
  getStepAwareRescueCopy,
  getStructuredCues,
} from '@/lib/dish-flow';
import type { RescueIssue } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AnalyzePanRequest = {
  dishId?: string;
  currentStep?: number;
  imageBase64?: string;
  imageUrl?: string;
  issueHints?: string[];
  notes?: string;
};

type PanAnalysis = {
  title: string;
  note: string;
  caution: string;
  suggestion: string;
  stage: string;
  burnRisk: 'Low' | 'Medium' | 'High';
  confidence: number;
  likelyIssueIds: string[];
};

type AnalyzePanResponse = {
  ok: true;
  source: 'openai' | 'fallback';
  analysis: PanAnalysis;
  rescue: RescueIssue;
  warning?: string;
};

type AnalyzePanModelPayload = PanAnalysis;

export async function POST(request: Request) {
  const body = (await safeJson(request)) as AnalyzePanRequest;
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
      ? dish.cookingSteps.find((item) => item.index === body.currentStep) ?? dish.cookingSteps[0]
      : dish.cookingSteps[0];
  const fallbackRescue = pickRescueIssue(dish.rescueIssues, body.issueHints) ?? getDefaultRescueIssue(dish, step.index);
  const fallback = buildFallbackAnalysis(dish.dishName, step, fallbackRescue);
  const imageInput = normalizeImageInput(body.imageBase64, body.imageUrl);

  if (!hasOpenAIKey() || !imageInput) {
    const warning = !hasOpenAIKey()
      ? 'OPENAI_API_KEY is missing, so ChefSense returned local pan-check guidance.'
      : 'No image was provided, so ChefSense returned local step-aware guidance.';

    const response: AnalyzePanResponse = {
      ok: true,
      source: 'fallback',
      analysis: fallback,
      rescue: fallbackRescue,
      warning,
    };

    return NextResponse.json(response);
  }

  const aiResult = await callOpenAIJson<AnalyzePanModelPayload>({
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You are ChefSense AI. Review a cooking photo and return only JSON. Keep outputs short, plain, practical, and appropriate for a home cook. Do not mention uncertainty excessively. Do not name external chefs, publishers, channels, or books.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              dish: dish.dishName,
              step: {
                index: step.index,
                title: step.title,
                instruction: step.instruction,
                heat: step.heat,
                cues: getStructuredCues(step.title, step.sensoryCues),
              },
              rescueIssueOptions: dish.rescueIssues.map((issue) => ({
                id: issue.id,
                label: issue.label,
              })),
              notes: body.notes ?? '',
              responseShape: {
                title: 'string',
                note: 'string',
                caution: 'string',
                suggestion: 'string',
                stage: 'string',
                burnRisk: 'Low | Medium | High',
                confidence: 0,
                likelyIssueIds: ['string'],
              },
            }),
          },
          {
            type: 'image_url',
            image_url: {
              url: imageInput,
            },
          },
        ],
      },
    ],
  });

  if (!aiResult.ok) {
    const response: AnalyzePanResponse = {
      ok: true,
      source: 'fallback',
      analysis: fallback,
      rescue: fallbackRescue,
      warning: 'OpenAI pan analysis failed, so ChefSense returned local step-aware guidance.',
    };

    return NextResponse.json(response);
  }

  const likelyIssueIds = sanitizeIssueIds(aiResult.data.likelyIssueIds, dish.rescueIssues, fallbackRescue.id);
  const rescue = dish.rescueIssues.find((issue) => issue.id === likelyIssueIds[0]) ?? fallbackRescue;

  const response: AnalyzePanResponse = {
    ok: true,
    source: 'openai',
    analysis: {
      title: aiResult.data.title?.trim() || fallback.title,
      note: aiResult.data.note?.trim() || fallback.note,
      caution: aiResult.data.caution?.trim() || fallback.caution,
      suggestion: aiResult.data.suggestion?.trim() || fallback.suggestion,
      stage: aiResult.data.stage?.trim() || fallback.stage,
      burnRisk: sanitizeBurnRisk(aiResult.data.burnRisk, fallback.burnRisk),
      confidence: sanitizeConfidence(aiResult.data.confidence),
      likelyIssueIds,
    },
    rescue,
  };

  return NextResponse.json(response);
}

function buildFallbackAnalysis(dishName: string, step: NonNullable<ReturnType<typeof getDish>>['cookingSteps'][number], rescue: RescueIssue): PanAnalysis {
  const cueSet = getStructuredCues(step.title, step.sensoryCues);
  const heatMeta = getHeatMeta(step.heat);

  return {
    title: step.index >= 2 ? 'On the right track' : `Checking the early ${dishName} base`,
    note: cueSet[0]?.cue ?? step.beginnerExplanation,
    caution: step.heat === 'High' ? 'Watch the pan closely for fast darkening.' : `Heat looks manageable at ${heatMeta.tempLabel.toLowerCase()}.`,
    suggestion:
      cueSet[3]?.cue ??
      getStepAwareRescueCopy(step.title, step.index, step.index),
    stage: step.title,
    burnRisk: step.heat === 'High' ? 'High' : step.heat === 'Medium-high' ? 'Medium' : 'Low',
    confidence: 72,
    likelyIssueIds: [rescue.id],
  };
}

function pickRescueIssue(issues: RescueIssue[], hints?: string[]) {
  const normalized = (hints ?? []).map((hint) => hint.toLowerCase());
  if (!normalized.length) return undefined;

  return issues.find((issue) => {
    const id = issue.id.toLowerCase();
    const label = issue.label.toLowerCase();
    return normalized.some((hint) => hint === id || label.includes(hint));
  });
}

function sanitizeIssueIds(candidate: string[] | undefined, issues: RescueIssue[], fallbackId: string) {
  const allowed = new Set(issues.map((issue) => issue.id));
  const cleaned = Array.isArray(candidate) ? candidate.filter((item) => allowed.has(item)) : [];
  return cleaned.length ? cleaned : [fallbackId];
}

function sanitizeBurnRisk(value: string | undefined, fallback: PanAnalysis['burnRisk']): PanAnalysis['burnRisk'] {
  return value === 'Low' || value === 'Medium' || value === 'High' ? value : fallback;
}

function sanitizeConfidence(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 78;
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function safeJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
