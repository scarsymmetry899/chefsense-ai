import { NextResponse } from 'next/server';
import { callOpenAIJson, hasOpenAIKey, slugify } from '@/lib/ai/openai';
import { getDishOrThrow } from '@/lib/data/dishes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type GenerateRecipeRequest = {
  prompt?: string;
  dishName?: string;
  cuisine?: string;
  servings?: number;
  vegetarian?: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
};

type RecipePreview = {
  recipeId: string;
  title: string;
  summary: string;
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  serves: string;
  prepTimeMin: number;
  cookTimeMin: number;
  totalTimeMin: number;
  ingredients: Array<{
    name: string;
    quantity: string;
    note?: string;
  }>;
  tools: string[];
  prep: string[];
  steps: Array<{
    title: string;
    instruction: string;
    durationSec: number;
    heat: 'Low' | 'Medium-low' | 'Medium' | 'Medium-high' | 'High' | 'Off';
  }>;
  rescueTips: Array<{
    issue: string;
    fix: string;
  }>;
  storage: string;
  reheating: string;
};

type GenerateRecipeResponse = {
  ok: true;
  source: 'openai' | 'fallback';
  recipe: RecipePreview;
  warning?: string;
};

type GenerateRecipeModelPayload = Omit<RecipePreview, 'recipeId' | 'totalTimeMin'>;

export async function POST(request: Request) {
  const body = (await safeJson(request)) as GenerateRecipeRequest;
  const fallback = buildFallbackRecipe(body);

  if (!hasOpenAIKey()) {
    const response: GenerateRecipeResponse = {
      ok: true,
      source: 'fallback',
      recipe: fallback,
      warning: 'OPENAI_API_KEY is missing, so ChefSense returned a local demo recipe preview.',
    };
    return NextResponse.json(response);
  }

  const aiResult = await callOpenAIJson<GenerateRecipeModelPayload>({
    temperature: 0.5,
    messages: [
      {
        role: 'system',
        content:
          'You are ChefSense AI. Create one guided Indian recipe preview for a home cook. Return only JSON. Keep instructions original, plain, and practical. Avoid naming any real chefs, publishers, channels, or books.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          request: {
            prompt: body.prompt ?? '',
            dishName: body.dishName ?? '',
            cuisine: body.cuisine ?? 'Indian',
            servings: body.servings ?? 2,
            vegetarian: body.vegetarian ?? true,
            difficulty: body.difficulty ?? 'Medium',
          },
          responseShape: {
            title: 'string',
            summary: 'string',
            cuisine: 'string',
            difficulty: 'Easy | Medium | Hard',
            serves: 'string',
            prepTimeMin: 0,
            cookTimeMin: 0,
            ingredients: [{ name: 'string', quantity: 'string', note: 'string optional' }],
            tools: ['string'],
            prep: ['string'],
            steps: [{ title: 'string', instruction: 'string', durationSec: 0, heat: 'Low | Medium-low | Medium | Medium-high | High | Off' }],
            rescueTips: [{ issue: 'string', fix: 'string' }],
            storage: 'string',
            reheating: 'string',
          },
        }),
      },
    ],
  });

  if (!aiResult.ok) {
    const response: GenerateRecipeResponse = {
      ok: true,
      source: 'fallback',
      recipe: fallback,
      warning: 'OpenAI recipe generation failed, so ChefSense returned a local demo recipe preview.',
    };
    return NextResponse.json(response);
  }

  const data = aiResult.data;
  const title = data.title?.trim() || fallback.title;
  const prepTimeMin = normalizePositiveInt(data.prepTimeMin, fallback.prepTimeMin);
  const cookTimeMin = normalizePositiveInt(data.cookTimeMin, fallback.cookTimeMin);

  const response: GenerateRecipeResponse = {
    ok: true,
    source: 'openai',
    recipe: {
      recipeId: slugify(title) || fallback.recipeId,
      title,
      summary: data.summary?.trim() || fallback.summary,
      cuisine: data.cuisine?.trim() || fallback.cuisine,
      difficulty: normalizeDifficulty(data.difficulty, fallback.difficulty),
      serves: data.serves?.trim() || fallback.serves,
      prepTimeMin,
      cookTimeMin,
      totalTimeMin: prepTimeMin + cookTimeMin,
      ingredients: cleanIngredients(data.ingredients, fallback.ingredients),
      tools: cleanStrings(data.tools, fallback.tools),
      prep: cleanStrings(data.prep, fallback.prep),
      steps: cleanSteps(data.steps, fallback.steps),
      rescueTips: cleanRescueTips(data.rescueTips, fallback.rescueTips),
      storage: data.storage?.trim() || fallback.storage,
      reheating: data.reheating?.trim() || fallback.reheating,
    },
  };

  return NextResponse.json(response);
}

function buildFallbackRecipe(body: GenerateRecipeRequest): RecipePreview {
  const demo = getDishOrThrow('paneer-butter-masala');
  const title = body.dishName?.trim() || body.prompt?.trim() || demo.dishName;
  const serves = body.servings ? `${body.servings}` : demo.serves;

  return {
    recipeId: slugify(title) || demo.dishId,
    title,
    summary: body.vegetarian === false
      ? 'A guided Indian recipe preview with a balanced masala base, clear timing, and practical rescue notes.'
      : demo.summary,
    cuisine: body.cuisine?.trim() || demo.cuisine,
    difficulty: body.difficulty ?? demo.difficulty,
    serves,
    prepTimeMin: demo.prepTimeMin,
    cookTimeMin: demo.cookTimeMin,
    totalTimeMin: demo.totalTimeMin,
    ingredients: demo.ingredients.slice(0, 8).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      note: item.note,
    })),
    tools: demo.tools.slice(0, 5).map((item) => item.name),
    prep: demo.miseEnPlace.slice(0, 5).map((item) => item.label),
    steps: demo.cookingSteps.slice(0, 6).map((step) => ({
      title: step.title,
      instruction: step.instruction,
      durationSec: step.durationSec,
      heat: step.heat,
    })),
    rescueTips: demo.rescueIssues.slice(0, 3).map((issue) => ({
      issue: issue.label,
      fix: issue.immediateFix[0] ?? issue.diagnosis,
    })),
    storage: demo.storage,
    reheating: demo.reheating,
  };
}

function normalizePositiveInt(value: number | undefined, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return fallback;
  return Math.round(value);
}

function normalizeDifficulty(value: string | undefined, fallback: RecipePreview['difficulty']): RecipePreview['difficulty'] {
  return value === 'Easy' || value === 'Medium' || value === 'Hard' ? value : fallback;
}

function cleanStrings(candidate: string[] | undefined, fallback: string[]) {
  const list = Array.isArray(candidate)
    ? candidate.map((item) => item.trim()).filter(Boolean)
    : [];
  return list.length ? list : fallback;
}

function cleanIngredients(candidate: GenerateRecipeModelPayload['ingredients'] | undefined, fallback: RecipePreview['ingredients']) {
  if (!Array.isArray(candidate)) return fallback;

  const list = candidate
    .map((item) => ({
      name: item?.name?.trim() ?? '',
      quantity: item?.quantity?.trim() ?? '',
      note: item?.note?.trim() || undefined,
    }))
    .filter((item) => item.name && item.quantity);

  return list.length ? list : fallback;
}

function cleanSteps(candidate: GenerateRecipeModelPayload['steps'] | undefined, fallback: RecipePreview['steps']) {
  if (!Array.isArray(candidate)) return fallback;

  const allowedHeat = new Set(['Low', 'Medium-low', 'Medium', 'Medium-high', 'High', 'Off']);
  const list = candidate
    .map((step) => ({
      title: step?.title?.trim() ?? '',
      instruction: step?.instruction?.trim() ?? '',
      durationSec:
        typeof step?.durationSec === 'number' && Number.isFinite(step.durationSec) && step.durationSec >= 0
          ? Math.round(step.durationSec)
          : 0,
      heat: allowedHeat.has(step?.heat) ? step.heat : 'Medium',
    }))
    .filter((step) => step.title && step.instruction);

  return list.length ? list : fallback;
}

function cleanRescueTips(candidate: GenerateRecipeModelPayload['rescueTips'] | undefined, fallback: RecipePreview['rescueTips']) {
  if (!Array.isArray(candidate)) return fallback;

  const list = candidate
    .map((item) => ({
      issue: item?.issue?.trim() ?? '',
      fix: item?.fix?.trim() ?? '',
    }))
    .filter((item) => item.issue && item.fix);

  return list.length ? list : fallback;
}

async function safeJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
