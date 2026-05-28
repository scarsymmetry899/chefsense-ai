import { NextResponse } from 'next/server';
import { callOpenAIJson, hasOpenAIKey } from '@/lib/ai/openai';
import { getDish } from '@/lib/data/dishes';
import type { Dish } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Tone = 'fineDining' | 'instagramFoodie' | 'homeChefProud' | 'simpleWarm';
type Lang = 'en' | 'hi' | 'te';

type CaptionRequest = {
  dishId?: string;
  tone?: Tone;
  language?: Lang;
  plateScore?: number;
  suggestions?: string[];
};

type CaptionResponse =
  | { ok: true; source: 'openai' | 'fallback'; caption: string; warning?: string }
  | { ok: false; error: string };

type ModelPayload = {
  caption?: unknown;
};

const VALID_TONES: Tone[] = ['fineDining', 'instagramFoodie', 'homeChefProud', 'simpleWarm'];
const VALID_LANGS: Lang[] = ['en', 'hi', 'te'];

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  fineDining: 'restaurant-magazine prose, sensory + technique',
  instagramFoodie: 'bright, emoji-light, hype',
  homeChefProud: "warm first-person 'I cooked this myself' pride",
  simpleWarm: 'humble, simple, family-table',
};

const LANG_FULL_NAMES: Record<Lang, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
};

export async function POST(request: Request) {
  try {
    const body = (await safeJson(request)) as CaptionRequest;
    const dishId = body.dishId?.trim();

    if (!dishId) {
      return NextResponse.json<CaptionResponse>({ ok: false, error: 'dishId is required.' });
    }

    const dish = getDish(dishId);
    if (!dish) {
      return NextResponse.json<CaptionResponse>(
        { ok: false, error: `Unknown dish: ${dishId}` },
        { status: 404 },
      );
    }

    const tone: Tone = VALID_TONES.includes(body.tone as Tone) ? (body.tone as Tone) : 'fineDining';
    const language: Lang = VALID_LANGS.includes(body.language as Lang)
      ? (body.language as Lang)
      : 'en';
    const plateScore = typeof body.plateScore === 'number' ? body.plateScore : undefined;
    const suggestions = Array.isArray(body.suggestions)
      ? body.suggestions.filter((item): item is string => typeof item === 'string').slice(0, 5)
      : [];

    const primaryIngredients = dish.ingredients.slice(0, 5).map((ing) => ing.name);
    const tasteAxes = dish.tasteBalancing.map((axis) => ({ axis: axis.axis, value: axis.value }));

    if (!hasOpenAIKey()) {
      return NextResponse.json<CaptionResponse>({
        ok: true,
        source: 'fallback',
        caption: buildFallbackCaption(dish, tone, language),
        warning: 'OPENAI_API_KEY is missing, so ChefSense returned a templated caption.',
      });
    }

    const userPayload = {
      dishName: dish.dishName,
      cuisine: dish.cuisine,
      region: dish.region,
      summary: dish.summary,
      primaryIngredients,
      tasteAxes,
      plateScore,
      suggestions,
    };

    const aiResult = await callOpenAIJson<ModelPayload>({
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: [
            'You are ChefSense AI, a chef and copywriter.',
            `Write ONE caption (2-3 sentences max) for ${dish.dishName} that the user just cooked. Tone: ${tone}. Language: ${language}.`,
            `Tone definitions: fineDining = ${TONE_DESCRIPTIONS.fineDining}; instagramFoodie = ${TONE_DESCRIPTIONS.instagramFoodie}; homeChefProud = ${TONE_DESCRIPTIONS.homeChefProud}; simpleWarm = ${TONE_DESCRIPTIONS.simpleWarm}.`,
            "Mention specific cues from THIS dish — its primary ingredients, regional style, or what made it special. Don't reference ingredients the dish doesn't use (e.g. don't mention cashew gravy if it's biryani or eggs).",
            `Reply in ${LANG_FULL_NAMES[language]}. For Hindi/Telugu use native script, not romanized.`,
            'Return only JSON: { caption: string }.',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify(userPayload),
        },
      ],
    });

    if (!aiResult.ok) {
      return NextResponse.json<CaptionResponse>({
        ok: true,
        source: 'fallback',
        caption: buildFallbackCaption(dish, tone, language),
        warning: 'OpenAI caption call failed, so ChefSense returned a templated caption.',
      });
    }

    const raw = aiResult.data.caption;
    const caption = typeof raw === 'string' ? raw.trim() : '';
    if (!caption) {
      return NextResponse.json<CaptionResponse>({
        ok: true,
        source: 'fallback',
        caption: buildFallbackCaption(dish, tone, language),
        warning: 'OpenAI returned no caption, so ChefSense returned a templated caption.',
      });
    }

    return NextResponse.json<CaptionResponse>({
      ok: true,
      source: 'openai',
      caption,
    });
  } catch (error) {
    return NextResponse.json<CaptionResponse>({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown failure in caption route',
    });
  }
}

function buildFallbackCaption(dish: Dish, tone: Tone, language: Lang): string {
  if (language === 'hi') {
    return buildHindiFallback(dish, tone);
  }
  if (language === 'te') {
    return buildTeluguFallback(dish, tone);
  }

  const firstSummarySentence = dish.summary?.split('.')[0]?.toLowerCase().trim();
  const regionPrefix = dish.region ? `${dish.region}-style` : 'restaurant-style';

  switch (tone) {
    case 'fineDining':
      return `${dish.dishName} — ${regionPrefix} ${firstSummarySentence ?? 'plated with care'}.`;
    case 'instagramFoodie':
      return `${dish.dishName} 🔥 ${dish.totalTimeMin} min of chef-guided cooking, and the plate did not survive the table.`;
    case 'homeChefProud':
      return `Made ${dish.dishName} from scratch with proper chef-guided cues. Best one yet.`;
    case 'simpleWarm':
    default:
      return `Warm ${dish.dishName}, cooked with care, plated the way it deserves.`;
  }
}

function buildHindiFallback(dish: Dish, tone: Tone): string {
  switch (tone) {
    case 'fineDining':
      return `${dish.dishName} — ${dish.region || 'घर'} की पारंपरिक शैली में, बारीकी से प्लेट किया हुआ।`;
    case 'instagramFoodie':
      return `${dish.dishName} 🔥 ${dish.totalTimeMin} मिनट की chef-guided cooking, और प्लेट खाली हो गई।`;
    case 'homeChefProud':
      return `आज ${dish.dishName} खुद बनाया, सही chef cues के साथ। अब तक का सबसे अच्छा।`;
    case 'simpleWarm':
    default:
      return `गरमा गरम ${dish.dishName}, प्यार से बनाया, ठीक वैसे ही परोसा।`;
  }
}

function buildTeluguFallback(dish: Dish, tone: Tone): string {
  switch (tone) {
    case 'fineDining':
      return `${dish.dishName} — ${dish.region || 'ఇంటి'} శైలిలో, శ్రద్ధగా ప్లేట్ చేశాను.`;
    case 'instagramFoodie':
      return `${dish.dishName} 🔥 ${dish.totalTimeMin} నిమిషాల chef-guided cooking, ప్లేట్ ఖాళీ అయిపోయింది.`;
    case 'homeChefProud':
      return `ఈరోజు ${dish.dishName} ని సరైన chef cues తో నేనే చేశాను. ఇప్పటివరకు బెస్ట్.`;
    case 'simpleWarm':
    default:
      return `వెచ్చని ${dish.dishName}, ప్రేమతో వండి, తగిన విధంగా వడ్డించాను.`;
  }
}

async function safeJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
