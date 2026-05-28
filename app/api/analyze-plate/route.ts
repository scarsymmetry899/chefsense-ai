import { NextResponse } from 'next/server';
import { callOpenAIJson, hasOpenAIKey, normalizeImageInput } from '@/lib/ai/openai';
import { getDish } from '@/lib/data/dishes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AnalyzePlateRequest = {
  dishId?: string;
  imageBase64?: string;
  imageUrl?: string;
};

type DishMatch = {
  matches: boolean;
  confidence: number;
  reason: string;
};

type PlatingScores = {
  presentation: number;
  garnish: number;
  cleanliness: number;
  lighting: number;
};

type AnalyzePlateResponse = {
  ok: true;
  source: 'openai' | 'fallback';
  dishMatch: DishMatch;
  plating: PlatingScores;
  overall: number;
  suggestions: string[];
  warning?: string;
};

type ModelPayload = {
  dishMatch?: Partial<DishMatch>;
  plating?: Partial<PlatingScores>;
  suggestions?: unknown;
};

const FALLBACK_PLATING: PlatingScores = {
  presentation: 78,
  garnish: 75,
  cleanliness: 80,
  lighting: 76,
};

const FALLBACK_SUGGESTIONS = [
  'Move a little closer so the dish fills more of the frame.',
  'Use soft side light so the texture and colour read clearly.',
  'Wipe the rim before the final photo so the plate looks cleaner.',
];

export async function POST(request: Request) {
  try {
    const body = (await safeJson(request)) as AnalyzePlateRequest;
    const dishId = body.dishId?.trim();

    if (!dishId) {
      return NextResponse.json({ ok: false, error: 'dishId is required.' }, { status: 200 });
    }

    const dish = getDish(dishId);
    if (!dish) {
      return NextResponse.json({ ok: false, error: `Unknown dish: ${dishId}` }, { status: 404 });
    }

    const imageInput = normalizeImageInput(body.imageBase64, body.imageUrl);

    if (!hasOpenAIKey() || !imageInput) {
      const warning = !hasOpenAIKey()
        ? 'OPENAI_API_KEY is missing, so ChefSense returned a neutral local plating estimate.'
        : 'No image was provided, so ChefSense returned a neutral local plating estimate.';

      const response: AnalyzePlateResponse = {
        ok: true,
        source: 'fallback',
        dishMatch: {
          matches: true,
          confidence: 50,
          reason: 'Local fallback (no AI vision available)',
        },
        plating: FALLBACK_PLATING,
        overall: 77,
        suggestions: FALLBACK_SUGGESTIONS,
        warning,
      };

      return NextResponse.json(response);
    }

    const model = process.env.OPENAI_VISION_MODEL ?? 'gpt-4o';

    const aiResult = await callOpenAIJson<ModelPayload>({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: [
            'You are ChefSense AI, an expert food-plating vision judge for Indian recipes.',
            `First identify whether the uploaded photo plausibly depicts the dish '${dish.dishName}'. Set dishMatch.matches=false if the photo shows a clearly different dish/category (e.g. shows fried rice when the user is plating biryani, shows a dessert when cooking dal, shows a face/document/unrelated object). Be lenient about plating style, garnish variation, bowl vs plate, etc.`,
            "When matches=false, set ALL plating scores to 0 and provide a clear reason ('The photo looks like fried rice, not Hyderabadi Chicken Biryani').",
            'When matches=true, score plating on four axes 0-100: presentation (composition, framing, food fill), garnish (visible garnish quality), cleanliness (rim wiped, no smudges, clean plate), lighting (clarity, exposure).',
            'STRICT scoring band: most plates fall in 70-90. Score below 70 only if the plate is genuinely poor or off-frame. Score above 95 ONLY if the photo is restaurant-magazine quality. NEVER score 100 unless truly fantabulous.',
            'Be encouraging — a home cook took the photo. Avoid harsh language.',
            'Also return 2-3 short, specific suggestions to improve the next plate photo.',
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
                dishId: dish.dishId,
                cuisine: dish.cuisine,
                responseShape: {
                  dishMatch: {
                    matches: 'boolean',
                    confidence: 'number 0-100',
                    reason: 'string',
                  },
                  plating: {
                    presentation: 'number 0-100',
                    garnish: 'number 0-100',
                    cleanliness: 'number 0-100',
                    lighting: 'number 0-100',
                  },
                  suggestions: ['string (2-3 items)'],
                },
              }),
            },
            {
              type: 'image_url',
              image_url: { url: imageInput },
            },
          ],
        },
      ],
    });

    if (!aiResult.ok) {
      const response: AnalyzePlateResponse = {
        ok: true,
        source: 'fallback',
        dishMatch: {
          matches: true,
          confidence: 50,
          reason: 'Local fallback (AI vision call failed)',
        },
        plating: FALLBACK_PLATING,
        overall: 77,
        suggestions: FALLBACK_SUGGESTIONS,
        warning: 'OpenAI plating analysis failed, so ChefSense returned a neutral local plating estimate.',
      };
      return NextResponse.json(response);
    }

    const data = aiResult.data;
    const matches = data.dishMatch?.matches === true;
    const matchConfidence = clamp(data.dishMatch?.confidence, 0, 100, matches ? 75 : 60);
    const reason = (typeof data.dishMatch?.reason === 'string' && data.dishMatch.reason.trim())
      ? data.dishMatch.reason.trim()
      : (matches ? 'Looks like the dish you cooked.' : `The photo does not appear to match ${dish.dishName}.`);

    const plating: PlatingScores = matches
      ? {
          presentation: clamp(data.plating?.presentation, 0, 100, FALLBACK_PLATING.presentation),
          garnish: clamp(data.plating?.garnish, 0, 100, FALLBACK_PLATING.garnish),
          cleanliness: clamp(data.plating?.cleanliness, 0, 100, FALLBACK_PLATING.cleanliness),
          lighting: clamp(data.plating?.lighting, 0, 100, FALLBACK_PLATING.lighting),
        }
      : { presentation: 0, garnish: 0, cleanliness: 0, lighting: 0 };

    const overall = matches
      ? Math.round((plating.presentation + plating.garnish + plating.cleanliness + plating.lighting) / 4)
      : 0;

    const suggestions = sanitizeSuggestions(data.suggestions);

    const response: AnalyzePlateResponse = {
      ok: true,
      source: 'openai',
      dishMatch: { matches, confidence: matchConfidence, reason },
      plating,
      overall,
      suggestions: suggestions.length ? suggestions : FALLBACK_SUGGESTIONS,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown failure in analyze-plate',
    });
  }
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function sanitizeSuggestions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return cleaned.slice(0, 3);
}

async function safeJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
