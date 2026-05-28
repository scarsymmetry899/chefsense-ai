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
  suggestedIssueLabels: string[];
  dishMatchConfidence: number;
};

type AnalyzePanResponse = {
  ok: true;
  source: 'openai' | 'fallback';
  analysis: PanAnalysis;
  rescue: RescueIssue;
  warning?: string;
};

type AnalyzePanModelPayload = {
  title: string;
  note: string;
  caution: string;
  suggestion: string;
  stage: string;
  burnRisk: 'Low' | 'Medium' | 'High';
  confidence: number;
  likelyIssueIds: string[];
  suggestedIssueLabels?: string[];
  dishMatchConfidence?: number;
};

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
  const fallback = buildFallbackAnalysis(dish.dishName, step, fallbackRescue, dish);
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

  const model = process.env.OPENAI_VISION_MODEL ?? 'gpt-4o';

  const aiResult = await callOpenAIJson<AnalyzePanModelPayload>({
    model,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: [
          'You are ChefSense AI, an Indian-cooking vision coach.',
          'Look at the photo and judge it against the CURRENT STEP only — not the whole recipe.',
          'Identify visible doneness signals such as colour (golden vs deep brown vs charred), sheen and gloss, oil sheen or droplets, blistering or bubbling pattern, separation of fat, surface moisture, charring, dryness, foam, or splitting.',
          'Tie what you see to the step.sensoryCues and step.title, then say whether the pan is on track, early, late, or in trouble for THIS step.',
          'When something looks off, map the finding to the closest rescueIssueOptions[].id (use the exact id string). Leave likelyIssueIds empty only when nothing is wrong.',
          'ALSO produce suggestedIssueLabels: an array of 4-8 SHORT chip-style labels (each 2-4 words) describing what could realistically have gone wrong AT THIS DISH AND THIS STEP based on what you actually see in the photo. These MUST be DISH-SPECIFIC and step-aware. Examples — biryani: "Rice mushy", "Bottom burnt", "Salt off", "Layers uneven", "Chicken raw". Eggs kejriwal: "Bread soggy", "Cheese broke", "Yolk too set", "Bread burnt", "Salt off". Fried rice: "Rice clumped", "Soy too dark", "Veg soggy", "Garlic raw". Do NOT default to generic chips like "Too salty" or "Burnt smell" unless the photo genuinely shows those.',
          'ALSO produce dishMatchConfidence: a number 0-100 indicating how confident you are that the photo actually matches the named dish at this step. If the photo looks like a completely different dish or an unrelated object, set this below 50. When dishMatchConfidence is low, lean toward FEWER and more generic labels rather than fabricating dish-specific issues.',
          'Keep outputs short, plain, practical, and warm for a home cook. Do not mention uncertainty excessively.',
          'Do not name external chefs, publishers, channels, or books.',
          'Return only JSON in the requested shape.',
        ].join(' '),
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
                sensoryCues: step.sensoryCues,
                structuredCues: getStructuredCues(step.title, step.sensoryCues),
              },
              rescueIssueOptions: dish.rescueIssues.map((issue) => ({
                id: issue.id,
                label: issue.label,
              })),
              notes: body.notes ?? '',
              instruction:
                'Describe what is visible in the photo for this step only, judge doneness/risk, and map findings to a rescueIssue id when applicable.',
              responseShape: {
                title: 'string',
                note: 'string',
                caution: 'string',
                suggestion: 'string',
                stage: 'string',
                burnRisk: 'Low | Medium | High',
                confidence: 0,
                likelyIssueIds: ['string'],
                suggestedIssueLabels: ['string (2-4 words, dish-specific, photo-grounded)'],
                dishMatchConfidence: 0,
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
  const suggestedIssueLabels = sanitizeSuggestedLabels(aiResult.data.suggestedIssueLabels, fallback.suggestedIssueLabels);
  const dishMatchConfidence = sanitizeConfidence(aiResult.data.dishMatchConfidence ?? 85);

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
      suggestedIssueLabels,
      dishMatchConfidence,
    },
    rescue,
  };

  return NextResponse.json(response);
}

function buildFallbackAnalysis(dishName: string, step: NonNullable<ReturnType<typeof getDish>>['cookingSteps'][number], rescue: RescueIssue, dish: NonNullable<ReturnType<typeof getDish>>): PanAnalysis {
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
    suggestedIssueLabels: dish.rescueIssues.map((issue) => issue.label),
    dishMatchConfidence: 85,
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

function sanitizeSuggestedLabels(candidate: string[] | undefined, fallback: string[]): string[] {
  if (!Array.isArray(candidate)) return fallback;
  const cleaned: string[] = [];
  const seen = new Set<string>();
  for (const raw of candidate) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim().replace(/\s+/g, ' ');
    if (!trimmed) continue;
    const wordCount = trimmed.split(' ').length;
    if (wordCount < 1 || wordCount > 5) continue;
    if (trimmed.length > 32) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(trimmed);
    if (cleaned.length >= 8) break;
  }
  if (cleaned.length < 3) return fallback;
  return cleaned;
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
