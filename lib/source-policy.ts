/**
 * ChefSense AI — Source & Legal Policy
 * ───────────────────────────────────────────────────────────────
 * IMPORTANT — Read before adding any source-related UI or data.
 *
 * RULES:
 *   1. NEVER display real chef names anywhere in the UI.
 *      Forbidden examples (do not use, even in placeholder data):
 *        - Sanjeev Kapoor
 *        - Ranveer Brar
 *        - Kunal Kapur
 *        - Tarla Dalal
 *        - Vikas Khanna
 *        - Vah Chef
 *        - Hebbar's Kitchen
 *        - Madhur Jaffrey
 *
 *   2. NEVER display real publication / channel / site names as
 *      sources in the UI (no "NYT Cooking", "BBC Good Food",
 *      "Food Network", "YouTube channel X", etc.).
 *
 *   3. NEVER copy a recipe verbatim from any external source.
 *      Recipes must be paraphrased, restructured, and rewritten
 *      in beginner-friendly language consistent with the
 *      ChefSense house style.
 *
 *   4. NEVER imply endorsement by any real chef, brand, show,
 *      or platform. Avoid phrases like "Official X recipe",
 *      "As seen on Y", "MasterChef-certified", etc.
 *
 *   5. Source attribution in the UI is limited to the five
 *      ANONYMOUS CATEGORIES below. These are the only labels
 *      that may surface to end users.
 *
 *   6. Citations in research/LLM contexts (e.g. backend RAG
 *      retrieval) may carry real source metadata internally,
 *      but that metadata must NEVER be rendered to the user.
 *      Only the anonymous category label is shown.
 *
 *   7. Trust scores are illustrative consensus indicators, not
 *      claims about specific real-world publishers.
 * ───────────────────────────────────────────────────────────────
 */

export type SourceCategoryId =
  | 'top-chef-style'
  | 'regional'
  | 'technique-video'
  | 'recipe-database'
  | 'food-science';

export interface SourceCategoryMeta {
  id: SourceCategoryId;
  label: string;            // user-facing
  description: string;      // short user-facing description
  tags: string[];           // small chip labels
  accent: 'primary' | 'turmeric' | 'chilli' | 'copper' | 'green';
  icon:
    | 'chef-hat'
    | 'map-pin'
    | 'video'
    | 'book-open'
    | 'flask-conical';
}

/**
 * The ONLY source labels allowed in the UI.
 * Any new source surface must use one of these IDs.
 */
export const SOURCE_CATEGORIES: SourceCategoryMeta[] = [
  {
    id: 'top-chef-style',
    label: 'Top chef-style sources',
    description: 'Professional kitchen methods & heuristics',
    tags: ['Technique', 'Flavor Focus'],
    accent: 'primary',
    icon: 'chef-hat',
  },
  {
    id: 'regional',
    label: 'Regional cooking reference',
    description: 'Traditional regional preparations',
    tags: ['Authentic', 'Cultural'],
    accent: 'turmeric',
    icon: 'map-pin',
  },
  {
    id: 'technique-video',
    label: 'Technique video reference',
    description: 'Visual techniques & process accuracy',
    tags: ['Visual', 'Step Clarity'],
    accent: 'chilli',
    icon: 'video',
  },
  {
    id: 'recipe-database',
    label: 'Recipe database',
    description: 'Tested recipes & user-validated data',
    tags: ['Tested', 'Reliable'],
    accent: 'copper',
    icon: 'book-open',
  },
  {
    id: 'food-science',
    label: 'Food science reference',
    description: 'Ingredients, reactions & science-backed',
    tags: ['Science', 'Precision'],
    accent: 'green',
    icon: 'flask-conical',
  },
];

/**
 * Standard consensus framing copy.
 * Reuse so phrasing stays consistent everywhere.
 */
export const CONSENSUS_FRAMING = {
  building: 'Building your master-chef guide',
  subtitle:
    'We compared 5 trusted source styles to create your most reliable version.',
  comparingProgress: (n: number, total: number) =>
    `Comparing ${total} trusted source styles`,
  whatAgreedOn: 'What top chef-style methods agree on',
  footer: 'Consensus based on multiple trusted cooking styles',
} as const;

/** Helper to fetch a category meta by id. */
export function getSourceCategory(id: SourceCategoryId): SourceCategoryMeta {
  const found = SOURCE_CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown source category: ${id}`);
  return found;
}
