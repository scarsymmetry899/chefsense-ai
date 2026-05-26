/**
 * ChefSense AI — Recipe schema (Zod)
 *
 * Source of truth for every dish in the app. Used both for static
 * local data validation AND for shaping LLM-generated output in
 * future /api/generate-recipe responses.
 *
 * Beginner-language rule (also re-stated in lib/data/*):
 *   - Avoid jargon. If used, explain immediately in plain words.
 *   - Bad:  "Reduce the masala."
 *     Good: "Cook it slowly until it becomes thicker and shinier.
 *            Small oil drops should appear around the edges."
 *   - Bad:  "Deglaze."
 *     Good: "Add a splash of water and gently scrape the tasty
 *            stuck bits from the pan."
 */

import { z } from 'zod';

// ───────── Primitives ─────────

export const DifficultySchema = z.enum(['Easy', 'Medium', 'Hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const HeatLevelSchema = z.enum([
  'Low',
  'Medium-low',
  'Medium',
  'Medium-high',
  'High',
  'Off',
]);
export type HeatLevel = z.infer<typeof HeatLevelSchema>;

export const SourceCategoryEnum = z.enum([
  'top-chef-style',
  'regional',
  'technique-video',
  'recipe-database',
  'food-science',
]);

// ───────── Sources / Consensus ─────────

export const SourceConsensusEntrySchema = z.object({
  category: SourceCategoryEnum,
  trustScore: z.number().min(0).max(100),
  /** Anonymous chip labels — never publisher names. */
  tags: z.array(z.string()).min(1).max(3),
});

export const SourceConsensusSchema = z.object({
  sources: z.array(SourceConsensusEntrySchema).min(1),
  /** Short bullet statements the sources agree on. */
  insights: z.array(z.string()).min(1),
});

// ───────── Ingredients & Tools ─────────

export const IngredientCategorySchema = z.enum([
  'main',
  'spice',
  'aromatic',
  'finishing',
  'optional',
]);

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.string(),
  category: IngredientCategorySchema,
  note: z.string().optional(),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Tool = z.infer<typeof ToolSchema>;

// ───────── Mise en place ─────────

export const MiseEnPlaceTaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  /** Pre-marked done in the demo flow. */
  done: z.boolean().default(false),
});
export type MiseEnPlaceTask = z.infer<typeof MiseEnPlaceTaskSchema>;

// ───────── Success variables / mistakes ─────────

export const SuccessVariableSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  /** Lucide icon name (e.g. 'flame', 'leaf', 'beaker'). */
  icon: z.string(),
});
export type SuccessVariable = z.infer<typeof SuccessVariableSchema>;

// ───────── Sensory cues ─────────

export const SensoryCueTypeSchema = z.enum([
  'visual',
  'smell',
  'sound',
  'texture',
]);

export const SensoryCueSchema = z.object({
  type: SensoryCueTypeSchema,
  cue: z.string(),
});
export type SensoryCue = z.infer<typeof SensoryCueSchema>;

// ───────── Cooking steps ─────────

export const CookingStepSchema = z.object({
  index: z.number().int().min(1),
  title: z.string(),
  /** Short imperative — what to do. Plain language. */
  instruction: z.string(),
  /** Longer beginner-friendly explanation, jargon avoided. */
  beginnerExplanation: z.string(),
  heat: HeatLevelSchema,
  /** Target duration in seconds (used for the timer). */
  durationSec: z.number().int().min(0),
  sensoryCues: z.array(SensoryCueSchema).min(1),
  /** "Why this matters" — connects the step to the final result. */
  whyThisMatters: z.string(),
  /** Food-science note, optional. Plain language. */
  foodScience: z.string().optional(),
  /** Local image path or warm gradient fallback used if missing. */
  image: z.string(),
});
export type CookingStep = z.infer<typeof CookingStepSchema>;

// ───────── Rescue / Fix My Dish ─────────

export const RescueIssueSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string(),
  diagnosis: z.string(),
  immediateFix: z.array(z.string()).min(1),
  preventNextTime: z.array(z.string()).min(1),
  foodScience: z.string(),
});
export type RescueIssue = z.infer<typeof RescueIssueSchema>;

// ───────── Finish / taste balance ─────────

export const TasteAxisSchema = z.object({
  axis: z.enum(['salt', 'acid', 'richness', 'heat', 'aroma']),
  value: z.number().min(0).max(100),
});
export type TasteAxis = z.infer<typeof TasteAxisSchema>;

export const FinishingTouchSchema = z.object({
  id: z.string(),
  label: z.string(),
  reason: z.string(),
  icon: z.string(),
  optional: z.boolean().default(false),
});
export type FinishingTouch = z.infer<typeof FinishingTouchSchema>;

export const PlatingSchema = z.object({
  notes: z.array(z.string()).min(1),
  serves: z.string(),
});
export type Plating = z.infer<typeof PlatingSchema>;

export const PlatingGuideStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  visualTip: z.string(),
  icon: z.string(),
});
export type PlatingGuideStep = z.infer<typeof PlatingGuideStepSchema>;

export const PlatingPrincipleSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  icon: z.string(),
});
export type PlatingPrinciple = z.infer<typeof PlatingPrincipleSchema>;

export const PlatingGuideSchema = z.object({
  defaultStyle: z.string(),
  styles: z.array(z.string()).min(1),
  steps: z.array(PlatingGuideStepSchema).min(1),
  principles: z.array(PlatingPrincipleSchema).min(1),
  garnishSuggestions: z.array(z.string()).min(1),
  photoTips: z.array(z.string()).min(1),
});
export type PlatingGuide = z.infer<typeof PlatingGuideSchema>;

export const ShareCaptionsSchema = z.object({
  fineDining: z.string(),
  instagramFoodie: z.string(),
  homeChefProud: z.string(),
  simpleWarm: z.string(),
  short: z.string(),
  hindi: z.string(),
  telugu: z.string(),
});
export type ShareCaptions = z.infer<typeof ShareCaptionsSchema>;

// ───────── Translations (content-level) ─────────

/**
 * Per-locale translation map. Keys are short content-tokens
 * referenced by the dish data (e.g. `step.7.instruction`).
 * Free-form on purpose so each dish can ship the strings it cares
 * about translating without forcing every dish to mirror its full
 * tree.
 */
export const TranslationsSchema = z
  .object({
    hi: z.record(z.string(), z.string()).optional(),
    te: z.record(z.string(), z.string()).optional(),
  })
  .partial();
export type Translations = z.infer<typeof TranslationsSchema>;

// ───────── Dish ─────────

export const DishSchema = z.object({
  dishId: z.string(),
  dishName: z.string(),
  cuisine: z.string(),
  region: z.string(),
  difficulty: DifficultySchema,
  totalTimeMin: z.number().int().min(1),
  prepTimeMin: z.number().int().min(0),
  cookTimeMin: z.number().int().min(0),
  serves: z.string(),
  isVegetarian: z.boolean(),
  heroImage: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
  mood: z.array(z.string()),
  sourceConsensus: SourceConsensusSchema,
  ingredients: z.array(IngredientSchema).min(1),
  tools: z.array(ToolSchema).min(1),
  miseEnPlace: z.array(MiseEnPlaceTaskSchema).min(1),
  successVariables: z.array(SuccessVariableSchema).min(1),
  commonMistakes: z.array(z.string()).min(1),
  cookingSteps: z.array(CookingStepSchema).min(1),
  rescueIssues: z.array(RescueIssueSchema).min(1),
  tasteBalancing: z.array(TasteAxisSchema).min(1),
  finishingTouches: z.array(FinishingTouchSchema).min(1),
  plating: PlatingSchema,
  platingGuide: PlatingGuideSchema.optional(),
  shareCaptions: ShareCaptionsSchema.optional(),
  storage: z.string(),
  reheating: z.string(),
  translations: TranslationsSchema.optional(),
});
export type Dish = z.infer<typeof DishSchema>;

/** Trimmed shape used in the home / search grid. */
export const DishSummarySchema = DishSchema.pick({
  dishId: true,
  dishName: true,
  cuisine: true,
  difficulty: true,
  totalTimeMin: true,
  heroImage: true,
  summary: true,
  isVegetarian: true,
  mood: true,
});
export type DishSummary = z.infer<typeof DishSummarySchema>;

/** Mood categories surfaced on the home screen. */
export const MOOD_CATEGORIES = [
  { id: 'comfort', label: 'Comfort Food', icon: 'soup' },
  { id: 'quick', label: 'Quick & Easy', icon: 'zap' },
  { id: 'protein', label: 'High Protein', icon: 'dumbbell' },
  { id: 'weekend', label: 'Weekend Special', icon: 'star' },
  { id: 'festive', label: 'Festive Treats', icon: 'flame' },
] as const;
export type MoodId = (typeof MOOD_CATEGORIES)[number]['id'];
