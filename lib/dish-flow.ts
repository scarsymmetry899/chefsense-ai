import type { Dish, PlatingGuide, ShareCaptions } from '@/lib/types';
import type { SensoryCue } from '@/lib/types';

function parseNumericToken(token: string): number | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  if (trimmed.includes('/')) {
    const [num, den] = trimmed.split('/');
    const numerator = Number(num);
    const denominator = Number(den);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
  }

  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function formatScaledNumber(value: number): string {
  if (value >= 10 || Number.isInteger(value)) {
    return String(Math.round(value * 100) / 100).replace(/\.0+$/, '');
  }

  const commonFractions = [
    { value: 0.25, label: '1/4' },
    { value: 0.33, label: '1/3' },
    { value: 0.5, label: '1/2' },
    { value: 0.66, label: '2/3' },
    { value: 0.75, label: '3/4' },
  ];

  const whole = Math.floor(value);
  const remainder = value - whole;
  const matched = commonFractions.find((item) => Math.abs(item.value - remainder) < 0.04);

  if (matched) {
    return whole > 0 ? `${whole} ${matched.label}` : matched.label;
  }

  return String(Math.round(value * 100) / 100).replace(/\.0+$/, '');
}

function scaleSingleToken(token: string, factor: number): string {
  const parsed = parseNumericToken(token);
  if (parsed === null) return token;
  return formatScaledNumber(parsed * factor);
}

const HEAT_META = {
  Off: { flames: 0, tempC: '0C', tempLabel: 'Off heat' },
  Low: { flames: 1, tempC: '90C', tempLabel: 'Low flame' },
  'Medium-low': { flames: 2, tempC: '120C', tempLabel: 'Medium-low flame' },
  Medium: { flames: 3, tempC: '160C', tempLabel: 'Medium flame' },
  'Medium-high': { flames: 4, tempC: '190C', tempLabel: 'Medium-high flame' },
  High: { flames: 5, tempC: '220C', tempLabel: 'High flame' },
} as const;

const STEP_GLYPHS = [
  { test: /onion|saute/i, glyph: '🧅' },
  { test: /cashew|soak/i, glyph: '🥣' },
  { test: /paneer/i, glyph: '🧀' },
  { test: /tomato|masala|gravy|reduce/i, glyph: '🍛' },
  { test: /cream|butter|finish|garnish/i, glyph: '✨' },
  { test: /rice|biryani/i, glyph: '🍚' },
  { test: /egg/i, glyph: '🥚' },
];

const DEFAULT_PLATING_STYLES = [
  'Classic Indian',
  'Fine Dining',
  'Modern Minimal',
  'Dhaba Luxe',
  'Festive Serve',
];

export function getBaseServings(serves: string): number {
  const matches = serves.match(/\d+/g);
  if (!matches?.length) return 2;
  const values = matches.map(Number).filter(Number.isFinite);
  if (!values.length) return 2;
  return Math.max(1, Math.round(values.reduce((sum, value) => sum + value, 0) / values.length));
}

export function scaleQuantity(
  quantity: string,
  servings: number,
  baseServings: number,
): string {
  if (!quantity || baseServings <= 0 || servings <= 0) return quantity;

  const factor = servings / baseServings;
  if (Math.abs(factor - 1) < 0.01 || /to taste/i.test(quantity)) {
    return quantity;
  }

  return quantity.replace(
    /\b\d+(?:\/\d+)?(?:\s*[-–]\s*\d+(?:\/\d+)?)?\b/g,
    (match) => {
      if (match.includes('-') || match.includes('–')) {
        const [left, right] = match.split(/[-–]/).map((part) => part.trim());
        return `${scaleSingleToken(left, factor)}-${scaleSingleToken(right, factor)}`;
      }
      return scaleSingleToken(match, factor);
    },
  );
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getHeatMeta(level: string) {
  return HEAT_META[level as keyof typeof HEAT_META] ?? HEAT_META.Medium;
}

export function getStepFallbackGlyph(title: string, instruction?: string) {
  const haystack = `${title} ${instruction ?? ''}`;
  return STEP_GLYPHS.find((entry) => entry.test.test(haystack))?.glyph ?? '🍳';
}

export function isLateTasteStage(stepIndex: number, totalSteps: number) {
  return stepIndex >= Math.max(3, totalSteps - 3);
}

export function getStepProgress(activeStep: number, completedSteps: number[], totalSteps: number) {
  const done = new Set(completedSteps);
  const weighted = Math.min(totalSteps, Math.max(done.size, activeStep - 1));
  return Math.round((weighted / totalSteps) * 100);
}

export function getDefaultRescueIssue(dish: Dish, stepIndex: number) {
  if (stepIndex >= dish.cookingSteps.length - 2) {
    return dish.rescueIssues.find((issue) => /salt|spicy|sour|flat/i.test(issue.label)) ?? dish.rescueIssues[0];
  }
  return dish.rescueIssues.find((issue) => /raw|burn|split|watery/i.test(issue.label)) ?? dish.rescueIssues[0];
}

export function getStepAwareRescueCopy(stepTitle: string, stepIndex: number, totalSteps: number) {
  if (isLateTasteStage(stepIndex, totalSteps)) {
    return `ChefSense will focus on taste and finishing issues that make sense after ${stepTitle.toLowerCase()}.`;
  }
  return `ChefSense will only suggest corrections that fit the dish at step ${stepIndex}, so you can continue cooking from here without jumping ahead.`;
}

export function getStructuredCues(stepTitle: string, cues: SensoryCue[]) {
  const byType = new Map(cues.map((cue) => [cue.type, cue.cue]));
  return [
    { type: 'visual', cue: byType.get('visual') ?? `Watch how ${stepTitle.toLowerCase()} changes in colour and thickness.` },
    { type: 'smell', cue: byType.get('smell') ?? 'There may not be a strong aroma cue at this stage, so stay with the visual and texture changes.' },
    { type: 'sound', cue: byType.get('sound') ?? 'Listen for a gentle steady sizzle rather than harsh crackling.' },
    { type: 'texture', cue: byType.get('texture') ?? 'Check how the sauce or ingredients move on the spoon before advancing.' },
  ] as const;
}

export function getPlatingGuide(dish: Dish): PlatingGuide {
  if (dish.platingGuide) return dish.platingGuide;

  return {
    defaultStyle: 'Classic Indian',
    styles: DEFAULT_PLATING_STYLES,
    steps: [
      {
        id: 'base',
        title: 'Anchor the bowl',
        instruction: `Choose a clean serving bowl or shallow plate that frames ${dish.dishName} without crowding it.`,
        visualTip: 'Keep the rim visible so the colours feel premium and intentional.',
        icon: 'bowl',
      },
      {
        id: 'portion',
        title: 'Build the center',
        instruction: 'Serve the main portion neatly in the middle and create gentle height instead of spreading it flat.',
        visualTip: 'A small mound in the center looks more restaurant-style than a fully flattened serving.',
        icon: 'sparkles',
      },
      {
        id: 'finish',
        title: 'Add garnish with purpose',
        instruction: 'Finish with only one or two garnishes that reinforce the dish rather than covering it up.',
        visualTip: 'Use cream, herbs, or spice dust in one clear focal area.',
        icon: 'leaf',
      },
      {
        id: 'rim',
        title: 'Clean the edges',
        instruction: 'Wipe the rim before serving or photographing so the plate looks polished.',
        visualTip: 'A clean rim instantly improves presentation, even at home.',
        icon: 'cloth',
      },
    ],
    principles: [
      { title: 'Height', explanation: 'Layer the dish slightly upward so it looks abundant and intentional.', icon: 'layers' },
      { title: 'Contrast', explanation: 'Balance creamy sauces, herbs, and warm tones so the plate does not look flat.', icon: 'contrast' },
      { title: 'Negative space', explanation: 'Leave some open plate around the food to create a fine-dining frame.', icon: 'circle' },
      { title: 'Clean rim', explanation: 'Keep the serving vessel clean before the final reveal.', icon: 'sparkles' },
      { title: 'Texture', explanation: 'Show at least one soft and one crisp-looking element when possible.', icon: 'scan' },
      { title: 'Light', explanation: 'Natural side light makes the dish look richer and more dimensional.', icon: 'sun' },
    ],
    garnishSuggestions: dish.finishingTouches.map((touch) => touch.label),
    photoTips: [
      'Move the camera closer than you think and fill the frame with the plated dish.',
      'Use side light from a window instead of overhead room light when possible.',
      'Keep one napkin or one side element only, so the dish stays the hero.',
    ],
  };
}

export function getShareCaptions(dish: Dish): ShareCaptions {
  if (dish.shareCaptions) return dish.shareCaptions;

  return {
    fineDining: `${dish.dishName} in a velvety cashew-butter gravy, finished with kasuri methi and plated with fine-dining restraint.`,
    instagramFoodie: `${dish.dishName}, glossy gravy, soft paneer, and a restaurant-style finish that absolutely deserved its own photo.`,
    homeChefProud: `Made ${dish.dishName} from scratch today with proper chef-guided cues, and it came out beautifully.`,
    simpleWarm: `Warm ${dish.dishName}, cooked with care and served the way it should be at home.`,
    short: `${dish.dishName}, but make it chef-style.`,
    hindi: `Aaj maine ${dish.dishName} ko professional restaurant-style presentation ke saath serve kiya.`,
    telugu: `I roju nenu ${dish.dishName} ni restaurant-style presentation tho serve chesanu.`,
  };
}
