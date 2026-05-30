/**
 * Eggs Kejriwal — Bombay club breakfast classic.
 *
 * The legendary open-faced breakfast born at the Willingdon Club, Bombay:
 *   buttered toast → sharp cheddar + chopped green chilli → melted under
 *   the grill → topped with a sunny-side-up egg → flaky salt, cracked
 *   pepper, coriander → served with green chutney or ketchup.
 *
 * Beginner-language rule applies (see paneer-butter-masala.ts):
 *   - Avoid jargon. Describe what to SEE / SMELL / HEAR / TOUCH.
 *   - One small idea per sentence.
 */

import type { Dish } from '../types';

const STEP_IMG = (n: number) => `/images/dishes/eggs-kejriwal/step-${n}.jpg`;

export const eggsKejriwal: Dish = {
  dishId: 'eggs-kejriwal',
  dishName: 'Eggs Kejriwal',
  cuisine: 'Indian',
  region: 'Bombay Club',
  difficulty: 'Easy',
  totalTimeMin: 18,
  prepTimeMin: 6,
  cookTimeMin: 12,
  serves: '1–2',
  isVegetarian: false,
  heroImage: '/images/dishes/eggs-kejriwal/hero.jpg',
  summary:
    'Bombay’s legendary club breakfast — sunny-side-up eggs on chilli-cheese toast, finished with flaky salt, cracked pepper and fresh coriander. Crisp, melty, runny — three textures in one bite.',
  tags: ['breakfast', 'quick', 'eggs', 'toast', 'café', 'bombay'],
  mood: ['Quick & Easy', 'Comfort Food'],

  sourceConsensus: {
    sources: [
      { category: 'top-chef-style', trustScore: 89, tags: ['Technique', 'Flavor Focus'] },
      { category: 'regional', trustScore: 94, tags: ['Authentic'] },
      { category: 'technique-video', trustScore: 86, tags: ['Visual'] },
      { category: 'recipe-database', trustScore: 85, tags: ['Tested'] },
      { category: 'food-science', trustScore: 82, tags: ['Science'] },
    ],
    insights: [
      'Toast the bread crisp and golden — soggy bread is the enemy here.',
      'Grate the cheese fresh; pre-grated packs do not melt cleanly.',
      'Cheese should be just melted and bubbling, not browned.',
      'Keep the yolk fully runny — it is the sauce.',
      'Build the bite in layers so every mouthful has crunch, melt and yolk.',
    ],
  },

  ingredients: [
    {
      id: 'bread',
      name: 'Bread, thick slices',
      quantity: '2 slices',
      category: 'main',
      note: 'Sourdough, thick milk bread, or a halved pav. Day-old bread toasts crisper.',
    },
    {
      id: 'cheddar',
      name: 'Sharp cheddar (or Amul processed), grated fresh',
      quantity: '60 g',
      category: 'main',
      note: 'Grate from a block — pre-shredded cheese has anti-caking starch and melts unevenly.',
    },
    {
      id: 'green-chilli',
      name: 'Green chillies, finely chopped',
      quantity: '1–2',
      category: 'spice',
      note: 'Indian birds-eye or Thai green. Deseed for milder heat.',
    },
    { id: 'egg', name: 'Eggs, large, room temperature', quantity: '2', category: 'main' },
    {
      id: 'butter',
      name: 'Butter (or ghee)',
      quantity: '2 tbsp',
      category: 'main',
      note: 'White Amul butter is traditional; ghee gives a nuttier toast.',
    },
    {
      id: 'coriander',
      name: 'Fresh coriander, finely chopped',
      quantity: '1 tbsp',
      category: 'aromatic',
    },
    {
      id: 'salt',
      name: 'Flaky salt or fine sea salt',
      quantity: 'to taste',
      category: 'finishing',
      note: 'Flaky salt on top of the egg gives little bursts of seasoning.',
    },
    {
      id: 'pepper',
      name: 'Cracked black pepper',
      quantity: 'to taste',
      category: 'finishing',
    },
    {
      id: 'chutney',
      name: 'Green coriander-mint chutney or tomato ketchup',
      quantity: '2 tbsp',
      category: 'optional',
      note: 'Served on the side for dipping.',
    },
  ],

  tools: [
    {
      id: 'grater',
      name: 'Box grater (medium holes)',
      note: 'Grate cheese fresh from a block for the cleanest melt.',
    },
    {
      id: 'knife',
      name: "Chef's knife",
      note: 'For chopping chillies and coriander finely and evenly.',
    },
    {
      id: 'board',
      name: 'Cutting board',
      note: 'Keep one small board for chilli, coriander and any garnish prep.',
    },
    {
      id: 'pan-toast',
      name: 'Heavy non-stick or cast-iron pan',
      note: 'For toasting the buttered bread to a deep, even gold.',
    },
    {
      id: 'oven-or-grill',
      name: 'Oven on grill mode (or small countertop toaster oven)',
      note: 'Needed to melt and bubble the cheese top. A salamander works too.',
    },
    {
      id: 'pan-egg',
      name: 'Small non-stick frying pan',
      note: 'Dedicated to the sunny-side-up egg — the smaller the pan, the rounder the egg.',
    },
    {
      id: 'spatula',
      name: 'Thin flexible spatula',
      note: 'Slides cleanly under the egg without breaking the yolk.',
    },
  ],

  miseEnPlace: [
    { id: 'grate-cheese', label: 'Grate cheddar fresh from the block', done: false },
    { id: 'chop-chillies', label: 'Finely chop green chillies', done: false },
    { id: 'chop-coriander', label: 'Finely chop fresh coriander', done: false },
    { id: 'eggs-out', label: 'Bring eggs to room temperature', done: false },
    { id: 'bread-out', label: 'Slice bread thick (1.5 cm) and set butter to soften', done: false },
    { id: 'oven-preheat', label: 'Preheat oven / grill on high', done: false },
    { id: 'chutney-ready', label: 'Plate green chutney or ketchup for the side', done: false },
  ],

  successVariables: [
    {
      id: 'crisp-toast',
      title: 'Crisp toast base',
      detail:
        'Toast the bread deep golden in butter — it has to stay crunchy under melted cheese and a wet yolk.',
      icon: 'flame',
    },
    {
      id: 'fresh-grated',
      title: 'Freshly grated cheese',
      detail:
        'Grate from a block. Pre-shredded cheese has starch on the surface and refuses to melt smoothly.',
      icon: 'grid',
    },
    {
      id: 'chilli-balance',
      title: 'Right chilli ratio',
      detail:
        'Mix chilli into the cheese so the heat is even — never a single sharp hit. About 1 tsp chopped chilli per 50 g cheese.',
      icon: 'flame',
    },
    {
      id: 'runny-yolk',
      title: 'Runny yolk',
      detail:
        'Cook eggs sunny-side-up only until the whites set. The yolk is the sauce for the whole dish.',
      icon: 'droplet',
    },
    {
      id: 'eat-fast',
      title: 'Serve immediately',
      detail:
        'The contrast — crisp / melt / runny — fades in under two minutes. Plate to table fast.',
      icon: 'zap',
    },
  ],

  commonMistakes: [
    'Using pre-shredded cheese — the anti-caking starch keeps it from melting smoothly.',
    'Toasting bread too lightly — it goes soft and soggy under cheese and yolk.',
    'Adding chillies on top of the cheese instead of mixing in — heat clusters in one bite.',
    'Cooking eggs too long or on high heat — the yolk firms up and you lose the sauce.',
    'Forgetting to preheat the grill — slow melting dries out the cheese.',
    'Skipping flaky salt at the end — the egg white tastes flat without it.',
  ],

  // ────────────────── 11 cooking steps ──────────────────
  cookingSteps: [
    {
      index: 1,
      title: 'Grate the cheddar fresh',
      instruction: 'Grate sharp cheddar (or Amul block) from a block using the medium holes of a box grater.',
      beginnerExplanation:
        'Hold the block of cheese against the medium holes of a box grater. Grate straight down with even pressure into a small bowl. Use about 60 g — roughly a generous handful per slice of toast. Do not use pre-shredded cheese from a packet: it has powdery starch on it that keeps it from melting smoothly.',
      heat: 'Off',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'Soft, fluffy curls of cheese pile up in the bowl' },
        { type: 'texture', cue: 'Strands feel slightly oily and stick to your fingers' },
      ],
      whyThisMatters:
        'Freshly grated cheese melts into a glossy, even layer. Pre-shredded clumps and breaks oil out — the whole texture goes wrong.',
      foodScience:
        'Bagged shredded cheese is coated in potato starch or cellulose to stop it sticking in the bag. That same coating blocks the proteins from flowing together when melted.',
      image: STEP_IMG(1),
    },
    {
      index: 2,
      title: 'Finely chop green chillies',
      instruction: 'Trim the stems off 1–2 green chillies. Slice lengthwise, scrape out the seeds (optional), then chop very finely.',
      beginnerExplanation:
        'Place the chillies flat on the board. Slice off the stems. If you want less heat, slice lengthwise and scrape out the white seed-vein with the tip of your knife. Then chop the chilli very finely — almost like fine dust. Wash your hands and the board straight after.',
      heat: 'Off',
      durationSec: 90,
      sensoryCues: [
        { type: 'visual', cue: 'Tiny even green flecks — no big pieces' },
        { type: 'smell', cue: 'Sharp, slightly grassy chilli aroma' },
      ],
      whyThisMatters:
        'Fine, even chopping spreads the heat across every bite. Big chunks give one screaming-hot mouthful and bland ones either side.',
      image: STEP_IMG(2),
    },
    {
      index: 3,
      title: 'Mix the chilli-cheese',
      instruction: 'In a bowl, toss the grated cheese with the chopped chillies, a pinch of salt and a tiny pinch of black pepper.',
      beginnerExplanation:
        'Tip the chopped chillies into the bowl of grated cheese. Add a small pinch of salt and a tinier pinch of cracked black pepper. Toss with a fork or your fingers until the chilli is spread evenly through the cheese — no clumps in one spot.',
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Green flecks evenly speckled through the cheese' },
        { type: 'smell', cue: 'Sharp cheese with a soft chilli warmth' },
      ],
      whyThisMatters:
        'A pre-mixed chilli-cheese gives you one fast spread on the toast and guarantees even heat in every bite.',
      image: STEP_IMG(3),
    },
    {
      index: 4,
      title: 'Butter the bread on both sides',
      instruction: 'Take 2 thick slices of bread. Spread softened butter generously on both sides.',
      beginnerExplanation:
        'Lay 2 thick (about 1.5 cm) slices of bread on the board. Use softened — not melted — butter. Spread a thin even layer on each side, right to the edges. Buttering both sides means the toast gets a richer, deeper golden crust.',
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Bread surface looks evenly glossy with butter, no dry patches' },
        { type: 'texture', cue: 'Butter spreads smoothly without tearing the bread' },
      ],
      whyThisMatters:
        'Buttering both sides creates two crisp golden faces — the structure that holds melted cheese and a wet yolk without going soggy.',
      image: STEP_IMG(4),
    },
    {
      index: 5,
      title: 'Toast the bread golden',
      instruction: 'Heat a heavy pan on medium-low. Place the buttered bread in and toast each side until deeply golden.',
      beginnerExplanation:
        'Set a heavy non-stick or cast-iron pan on medium-low heat — not high. Lay the buttered bread slices in the dry pan (the butter is already on the bread). Toast slowly. After about 90 seconds, lift one corner to check — it should be a deep golden brown. Flip and toast the second side the same way. If you see dark spots, drop the heat further.',
      heat: 'Medium-low',
      durationSec: 180,
      sensoryCues: [
        { type: 'visual', cue: 'Surface turns deep golden — like a roasted almond' },
        { type: 'smell', cue: 'Warm, nutty, buttery toast aroma' },
        { type: 'sound', cue: 'A gentle, steady sizzle — never aggressive crackling' },
      ],
      whyThisMatters:
        'A slow medium-low toast lets the butter brown and the bread dry out from the inside, so the slice stays crisp under the cheese and egg.',
      foodScience:
        'Browning at lower temperatures gives the Maillard reaction time to develop deep golden flavour without burning the outer crust.',
      image: STEP_IMG(5),
    },
    {
      index: 6,
      title: 'Spread the chilli-cheese',
      instruction: 'Take the toasted slices off the pan onto a baking tray. Pile the chilli-cheese mix on top, then press it flat right to the edges.',
      beginnerExplanation:
        'Move the toasted bread to a small baking tray lined with foil or parchment. Pile half the chilli-cheese mix on each slice. Use the back of a spoon to gently press it flat and push it all the way to the edges and corners — bare bread edges burn under the grill.',
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Cheese covers the entire surface — no exposed bread showing' },
        { type: 'texture', cue: 'Cheese sits in a soft, even mound about half a centimetre thick' },
      ],
      whyThisMatters:
        'Cheese all the way to the edge means no burnt bread crust under the grill — the rim browns at the same rate as the centre.',
      image: STEP_IMG(6),
    },
    {
      index: 7,
      title: 'Preheat the grill',
      instruction: 'Turn your oven grill or broiler to its highest setting now. It needs at least 4–5 minutes to reach full heat before the cheese toast goes in.',
      beginnerExplanation: 'A cold grill will melt the cheese slowly instead of giving it that golden, bubbly crust. Starting it now means it is ready exactly when you need it.',
      heat: 'High' as any,
      durationSec: 0,
      sensoryCues: [{ type: 'sound' as any, cue: 'You may hear the grill element click or hum as it heats up.' }],
      whyThisMatters: 'The grill must be at full temperature before the cheese toast goes in — a cold grill produces pale, rubbery cheese instead of golden and bubbly.',
      image: '',
    },
    {
      index: 8,
      title: 'Grill until cheese melts and bubbles',
      instruction: 'Slide the tray under a preheated grill (or top of oven) on high. Watch closely. Pull it out as soon as the cheese melts and bubbles — about 2–3 minutes.',
      beginnerExplanation:
        'Your oven should already be hot on grill mode. Place the tray on the top rack, close to (but not touching) the element. Stay at the door — this happens fast. After about 90 seconds the cheese starts to slump. Around 2–3 minutes you will see active bubbles and the top going faintly golden in spots. Pull it out the moment it bubbles — any longer and it turns greasy and tough.',
      heat: 'High',
      durationSec: 180,
      sensoryCues: [
        { type: 'visual', cue: 'Cheese melts into a glossy, even layer with active bubbles on top' },
        { type: 'smell', cue: 'Sharp, sweet, slightly toasty cheese aroma fills the kitchen' },
        { type: 'sound', cue: 'A quiet bubbling and crackling from the tray' },
      ],
      whyThisMatters:
        'Just-melted, bubbling cheese is silky and stretchy. Over-grilling splits the fats and leaves you with a greasy, leathery top.',
      foodScience:
        'Cheese melts smoothly around 65–80 °C. Past that, proteins tighten and squeeze out the fat — what melt scientists call “breaking the emulsion.”',
      image: STEP_IMG(7),
    },
    {
      index: 9,
      title: 'Heat the pan for the eggs',
      instruction: 'While the cheese is grilling, heat a small non-stick pan on medium-low and add 1 tsp butter.',
      beginnerExplanation:
        'Set a small non-stick pan (a small one keeps the egg round) on medium-low heat. Drop in 1 tsp of butter per egg. Wait until the butter has fully melted and looks slightly foamy at the edges — that is your signal the pan is ready. Do not let it brown.',
      heat: 'Medium-low',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Butter foams gently, then settles into a clear glossy film' },
        { type: 'sound', cue: 'A soft sizzle when you flick a tiny drop of water in' },
      ],
      whyThisMatters:
        'A correctly warm — not hot — pan sets the white smoothly without crisping the bottom or rubberising the edges.',
      image: STEP_IMG(8),
    },
    {
      index: 10,
      title: 'Cook the sunny-side-up egg',
      instruction: 'Crack the eggs gently into the pan. Cook on medium-low until the whites set but the yolks are still bright and runny.',
      beginnerExplanation:
        'Crack each egg first into a small cup, then slide it into the pan from low — this stops the yolk from breaking on impact. Cook on medium-low. After about a minute the edges go opaque white. To help the top whites set without firming the yolk, tilt the pan, scoop some hot butter and gently spoon it over the white (not the yolk) twice. The yolk should still wobble and look glossy when you push the pan.',
      heat: 'Medium-low',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'Whites go from clear to opaque white; yolk stays bright orange-yellow and shiny' },
        { type: 'texture', cue: 'Whites feel just set when nudged; yolk wobbles like jelly' },
        { type: 'sound', cue: 'A steady, gentle sizzle — not aggressive popping' },
      ],
      whyThisMatters:
        'A runny yolk is the sauce that ties cheese, chilli and toast together. Overcook and the dish loses its soul.',
      foodScience:
        'Egg whites set around 60–65 °C; yolks firm at 70 °C and above. Keeping heat low lets the white cook through before the yolk crosses that line.',
      image: STEP_IMG(9),
    },
    {
      index: 11,
      title: 'Build the toast',
      instruction: 'Slide each egg gently onto a cheese toast. Sprinkle flaky salt, cracked black pepper and a pinch of chopped coriander.',
      beginnerExplanation:
        'Slide a thin spatula under each egg and lay it carefully on top of the bubbling cheese toast — try to centre the yolk. Sprinkle a small pinch of flaky salt directly over the egg white (never the yolk — it dulls the colour). Add a generous crack of black pepper and a small scatter of chopped coriander over the whole slice.',
      heat: 'Off',
      durationSec: 30,
      sensoryCues: [
        { type: 'visual', cue: 'Bright yellow yolk sits high on a glossy melted cheese top on golden toast' },
        { type: 'smell', cue: 'Buttery toast, sharp cheese, fresh chilli and coriander all rising together' },
      ],
      whyThisMatters:
        'Seasoning the egg directly at the end — not in the pan — keeps the white tender and the salt crystals crunchy on the tongue.',
      image: STEP_IMG(10),
    },
    {
      index: 12,
      title: 'Serve immediately with chutney or ketchup',
      instruction: 'Plate at once with a spoonful of green coriander-mint chutney or tomato ketchup on the side.',
      beginnerExplanation:
        'Move the toast straight to a warm plate. Add a spoonful of green chutney (or ketchup, the Bombay classic) on the side. Eat right away while the cheese is still soft and the yolk still runny. Cut through the egg with a fork — yolk runs into the cheese, coats the bread, and that first bite is the whole point.',
      heat: 'Off',
      durationSec: 30,
      sensoryCues: [
        { type: 'visual', cue: 'Bright yolk breaks and runs into the cheese in a glossy golden trail' },
        { type: 'texture', cue: 'First bite gives a crunch, then melt, then a flood of yolk' },
      ],
      whyThisMatters:
        'Eggs Kejriwal lives in a 90-second window. Served immediately, you get crisp, melt, and runny in one bite — the whole reason this dish became a Bombay legend.',
      image: STEP_IMG(11),
    },
  ],

  // ────────────────── Rescue / Fix My Dish ──────────────────
  rescueIssues: [
    {
      id: 'bread-burnt',
      label: 'Toast burnt or too dark',
      icon: 'flame',
      diagnosis: 'Pan heat was too high, or the bread was left unattended too long.',
      immediateFix: [
        'Scrape the darkest spots gently with the back of a butter knife.',
        'If only one side is burnt, place the burnt side down — the cheese hides the rest.',
        'If badly burnt, start over with a fresh slice on medium-low heat.',
      ],
      preventNextTime: [
        'Toast on medium-low, not high — butter browns fast.',
        'Stay at the pan and check the underside after 90 seconds.',
        'Use a heavier pan so the heat is steady, not spiky.',
      ],
      foodScience:
        'Butter browns and then burns very quickly past 150 °C. Lower temperatures buy you time and give more even colour.',
    },
    {
      id: 'cheese-not-melted',
      label: 'Cheese refuses to melt',
      icon: 'snowflake',
      diagnosis: 'Pre-shredded cheese, cold cheese straight from the fridge, or the grill not hot enough.',
      immediateFix: [
        'Move the tray closer to the grill element and give it another minute.',
        'Switch on the oven element below as well — a fan oven helps.',
        'If still stubborn, cover the toast loosely with foil to trap steam for 60 seconds.',
      ],
      preventNextTime: [
        'Grate from a block — never use pre-shredded packets.',
        'Let the cheese sit at room temperature for 10 minutes before grilling.',
        'Preheat the grill on high for 3 minutes before sliding the toast in.',
      ],
      foodScience:
        'Cheese needs roughly 65–80 °C to flow. Anti-caking starch in pre-shredded cheese blocks the proteins from joining, so it never goes smooth.',
    },
    {
      id: 'broken-yolk',
      label: 'Yolk broke in the pan',
      icon: 'droplet',
      diagnosis: 'The egg was cracked too high above the pan, or the yolk was punctured by the shell.',
      immediateFix: [
        'Do not try to save it as sunny-side-up. Lightly scramble or fold it into a soft omelette and plate that on the cheese toast.',
        'Or strain into the pan, cover for 30 seconds, and serve as a flat “egg blanket.”',
      ],
      preventNextTime: [
        'Crack the egg first into a small cup, then slide it gently into the pan from low.',
        'Tap the egg on a flat surface — not the pan rim, which is more likely to push shell into the yolk.',
        'Use room-temperature eggs — cold yolk membranes tear more easily.',
      ],
      foodScience:
        'The yolk membrane weakens at fridge temperatures and tears easily. Letting eggs come to room temperature for 15 minutes strengthens the membrane.',
    },
    {
      id: 'too-dry',
      label: 'Whole toast feels dry',
      icon: 'wind',
      diagnosis: 'The egg was overcooked (yolk set), or the cheese over-grilled until greasy and leathery.',
      immediateFix: [
        'Add a quick swipe of soft butter under the egg before serving.',
        'Spoon over a teaspoon of green chutney — the moisture and acid revive the bite.',
        'Cook a fresh sunny-side-up egg if you have time and slide it on top instead.',
      ],
      preventNextTime: [
        'Pull the cheese out the moment it bubbles — over-grilling drives out the fat.',
        'Cook eggs only until whites are just set; keep the yolk loose.',
        'Always serve immediately — every extra minute on the plate dries the toast.',
      ],
      foodScience:
        'A runny yolk is mostly water and fat that act as a sauce. Once the yolk firms, that sauce disappears, and the toast feels dry no matter how rich the cheese.',
    },
    {
      id: 'too-salty',
      label: 'Too salty',
      icon: 'shaker',
      diagnosis: 'Too much salt was added to the cheese mix, or the cheddar itself was very mature and sharp.',
      immediateFix: [
        'Add a squeeze of lemon juice or a small dab of unsweetened yoghurt on the side.',
        'Eat with extra coriander leaves and a couple of cool cucumber slices — they balance saltiness.',
        'Skip the side ketchup (which adds more salt) and use plain green chutney.',
      ],
      preventNextTime: [
        'Skip salt in the cheese mix if your cheddar is very sharp — taste the cheese first.',
        'Add flaky salt only at the end, sprinkled on the egg white, where you control the dose.',
        'Use unsalted butter so the toast is not pre-seasoned.',
      ],
      foodScience:
        'Mature cheddar holds 1.5–2% salt by weight. Adding more on top of that pushes the dish above the comfortable seasoning range very quickly.',
    },
  ],

  // ────────────────── Taste balance ──────────────────
  tasteBalancing: [
    { axis: 'salt', value: 78 },
    { axis: 'acid', value: 35 },
    { axis: 'richness', value: 88 },
    { axis: 'heat', value: 70 },
    { axis: 'aroma', value: 72 },
  ],

  finishingTouches: [
    {
      id: 'flaky-salt',
      label: 'Flaky salt on the egg white',
      reason: 'Little crystals burst on the tongue and lift the whole bite.',
      icon: 'shaker',
      optional: false,
    },
    {
      id: 'cracked-pepper',
      label: 'Cracked black pepper',
      reason: 'Adds gentle warmth and aromatic lift.',
      icon: 'flame',
      optional: false,
    },
    {
      id: 'coriander',
      label: 'Fresh coriander',
      reason: 'Bright herbal note cuts through the cheese and yolk richness.',
      icon: 'leaf',
      optional: false,
    },
    {
      id: 'chutney',
      label: 'Green coriander-mint chutney',
      reason: 'Acid and herb on the side keeps every bite fresh.',
      icon: 'leaf',
      optional: false,
    },
    {
      id: 'sumac',
      label: 'Sumac dust',
      reason: 'A tart, lemony top-dust for a modern café spin.',
      icon: 'sparkles',
      optional: true,
    },
  ],

  plating: {
    notes: [
      'Serve on a warm plate immediately — the dish lives in a 90-second window.',
      'Place chutney or ketchup in a small bowl on the side, never poured on top.',
      'Pair with strong black coffee or hot masala chai.',
    ],
    serves: 'Serves 1–2 people',
  },

  storage:
    'Best eaten fresh. The chilli-cheese mix can be prepared and refrigerated in a sealed container for up to 24 hours; bread is best toasted to order.',
  reheating:
    'Do not reheat the assembled toast — the egg will overcook and the toast will sog. If needed, re-toast the bread alone in a hot pan for 30 seconds and cook a fresh egg.',

  translations: {
    hi: {
      'dish.name': 'एग्स केजरीवाल',
      'dish.summary':
        'बॉम्बे क्लब का मशहूर नाश्ता — सनी-साइड-अप अंडे चीज़ टोस्ट पर, ऊपर से हरी मिर्च, ताज़ा हरा धनिया और कुटी हुई काली मिर्च।',
    },
    te: {
      'dish.name': 'ఎగ్స్ కేజ్రీవాల్',
      'dish.summary':
        'బొంబాయి క్లబ్‌లో పుట్టిన ప్రసిద్ధ బ్రేక్‌ఫాస్ట్ — చీజ్ టోస్ట్ మీద సన్నీ-సైడ్-అప్ గుడ్లు, పైన పచ్చిమిర్చి, తాజా కొత్తిమీర, మరియు పగిలిన నల్ల మిరియాలు.',
    },
  },
};
