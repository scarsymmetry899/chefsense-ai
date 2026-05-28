import { NextResponse } from 'next/server';
import { callOpenAIJson, hasOpenAIKey } from '@/lib/ai/openai';
import { getDish } from '@/lib/data/dishes';
import { getDefaultRescueIssue, getStructuredCues } from '@/lib/dish-flow';
import type { Dish, RescueIssue } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Locale = 'en' | 'hi' | 'te';

type FixSuggestionsRequest = {
  dishId?: string;
  currentStep?: number;
  symptoms?: string[];
  freeText?: string;
  locale?: Locale;
};

type Confidence = 'low' | 'medium' | 'high';

type FixSuggestionsModelPayload = {
  diagnosis: string;
  immediateFix: string[];
  preventNextTime: string[];
  confidence: Confidence;
};

type FixSuggestionsResponse =
  | {
      ok: true;
      source: 'openai' | 'fallback';
      diagnosis: string;
      immediateFix: string[];
      preventNextTime: string[];
      confidence: Confidence;
      warning?: string;
    }
  | {
      ok: false;
      error: string;
    };

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  te: 'Telugu (తెలుగు)',
};

function normalizeLocale(value: unknown): Locale {
  if (value === 'hi' || value === 'te') return value;
  return 'en';
}

export async function POST(request: Request) {
  try {
    const body = (await safeJson(request)) as FixSuggestionsRequest;
    const dishId = body.dishId?.trim();

    if (!dishId) {
      return jsonError('dishId is required.');
    }

    const dish = getDish(dishId);
    if (!dish) {
      return jsonError(`Unknown dish: ${dishId}`);
    }

    const step =
      typeof body.currentStep === 'number'
        ? dish.cookingSteps.find((item) => item.index === body.currentStep) ?? dish.cookingSteps[0]
        : dish.cookingSteps[0];

    const symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.map((symptom) => String(symptom).trim()).filter(Boolean)
      : [];
    const freeText = body.freeText?.trim() ?? '';
    const locale = normalizeLocale(body.locale);

    const bestMatch = pickRescueByKeywords(dish.rescueIssues, symptoms, freeText);
    const fallbackRescue = bestMatch ?? getDefaultRescueIssue(dish, step.index);

    if (!hasOpenAIKey()) {
      return jsonResponse(
        buildFallbackPayload(
          fallbackRescue,
          step,
          dish,
          symptoms,
          freeText,
          bestMatch === undefined,
          'OPENAI_API_KEY is missing, so ChefSense returned local rescue guidance.',
        ),
      );
    }

    const aiResult = await callOpenAIJson<FixSuggestionsModelPayload>({
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: [
            'You are ChefSense AI, a calm chef rescue coach for an Indian home cooking app.',
            `Reply in ${LOCALE_LABELS[locale]}. Keep tone warm, plain, and practical for a home cook.`,
            'Use the current step context first — do not jump ahead to later stages or invent ingredients.',
            'Lean on the baked-in rescue knowledge provided but tailor to the symptoms and free text.',
            'Avoid naming external chefs, publishers, channels, or books.',
            'Return only valid JSON matching the requested shape. No prose outside JSON.',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify({
            instruction:
              'Diagnose what likely went wrong at this exact step, give immediate fixes, then short prevention tips for next time.',
            cookContext: {
              dish: dish.dishName,
              cuisine: dish.cuisine,
              region: dish.region,
              currentStep: {
                index: step.index,
                title: step.title,
                instruction: step.instruction,
                heat: step.heat,
                sensoryCues: getStructuredCues(step.title, step.sensoryCues),
              },
              commonMistakes: dish.commonMistakes,
              rescueKnowledge: dish.rescueIssues.map((issue) => ({
                id: issue.id,
                label: issue.label,
                diagnosis: issue.diagnosis,
                immediateFix: issue.immediateFix,
                preventNextTime: issue.preventNextTime,
              })),
            },
            userQuestion: {
              symptoms,
              freeText,
            },
            responseShape: {
              diagnosis: 'string',
              immediateFix: ['string'],
              preventNextTime: ['string'],
              confidence: 'low | medium | high',
            },
          }),
        },
      ],
    });

    if (!aiResult.ok) {
      return jsonResponse(
        buildFallbackPayload(
          fallbackRescue,
          step,
          dish,
          symptoms,
          freeText,
          bestMatch === undefined,
          'OpenAI rescue generation failed, so ChefSense returned local rescue guidance.',
        ),
      );
    }

    const diagnosis = aiResult.data.diagnosis?.trim() || fallbackRescue.diagnosis;
    const immediateFix = cleanList(aiResult.data.immediateFix, fallbackRescue.immediateFix);
    const preventNextTime = cleanList(aiResult.data.preventNextTime, fallbackRescue.preventNextTime);
    const confidence = sanitizeConfidence(aiResult.data.confidence);

    const response: FixSuggestionsResponse = {
      ok: true,
      source: 'openai',
      diagnosis,
      immediateFix,
      preventNextTime,
      confidence,
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unexpected server error.');
  }
}

function buildFallbackPayload(
  rescue: RescueIssue,
  step: Dish['cookingSteps'][number],
  dish: Dish,
  symptoms: string[],
  freeText: string,
  generic: boolean,
  warning: string,
): FixSuggestionsResponse {
  if (generic && !symptoms.length && !freeText) {
    // No symptoms at all — fall back to the step's sensory cues.
    const cues = getStructuredCues(step.title, step.sensoryCues);
    return {
      ok: true,
      source: 'fallback',
      diagnosis: `Without a clear symptom, stay with the cues for "${step.title}" on ${dish.dishName}. The dish is still on track if the visible signs match the step.`,
      immediateFix: cues.map((entry) => entry.cue),
      preventNextTime: [
        'Pause every minute on this step and check colour, smell, sound, and texture against the cues above.',
        'Lower the heat by one level if the pan is moving faster than the cues say.',
      ],
      confidence: 'low',
      warning,
    };
  }

  return {
    ok: true,
    source: 'fallback',
    diagnosis: rescue.diagnosis,
    immediateFix: rescue.immediateFix,
    preventNextTime: rescue.preventNextTime,
    confidence: generic ? 'low' : 'medium',
    warning,
  };
}

function pickRescueByKeywords(
  issues: RescueIssue[],
  symptoms: string[],
  freeText: string,
): RescueIssue | undefined {
  const haystack = [...symptoms, freeText]
    .map((value) => value.toLowerCase())
    .filter(Boolean)
    .join(' ');

  if (!haystack.trim()) return undefined;

  const tokens = haystack
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);

  if (!tokens.length) return undefined;

  let best: { issue: RescueIssue; score: number } | undefined;

  for (const issue of issues) {
    const issueText = [
      issue.id,
      issue.label,
      issue.diagnosis,
      ...issue.immediateFix,
      ...issue.preventNextTime,
    ]
      .join(' ')
      .toLowerCase();

    let score = 0;
    for (const token of tokens) {
      if (issueText.includes(token)) score += 1;
      // Boost when the user's exact symptom tag appears in the id/label.
      if (issue.id.toLowerCase().includes(token) || issue.label.toLowerCase().includes(token)) {
        score += 2;
      }
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { issue, score };
    }
  }

  return best?.issue;
}

function cleanList(candidate: string[] | undefined, fallback: string[]): string[] {
  const list = Array.isArray(candidate)
    ? candidate
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
    : [];
  return list.length ? list : fallback;
}

function sanitizeConfidence(value: unknown): Confidence {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return 'medium';
}

function jsonResponse(payload: FixSuggestionsResponse) {
  return NextResponse.json(payload);
}

function jsonError(error: string) {
  const payload: FixSuggestionsResponse = { ok: false, error };
  return NextResponse.json(payload);
}

async function safeJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
