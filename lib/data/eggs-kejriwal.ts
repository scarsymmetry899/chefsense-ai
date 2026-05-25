/**
 * Eggs Kejriwal — Bombay club breakfast classic.
 * Fried eggs on toast, layered with melted cheese and a kick of green chilli.
 * Schema-valid placeholder; full guided flow lives on Paneer Butter Masala for the MVP.
 */

import type { Dish } from '../types';

export const eggsKejriwal: Dish = {
  dishId: 'eggs-kejriwal',
  dishName: 'Eggs Kejriwal',
  cuisine: 'Indian',
  region: 'Bombay Club',
  difficulty: 'Easy',
  totalTimeMin: 15,
  prepTimeMin: 5,
  cookTimeMin: 10,
  serves: '1–2',
  isVegetarian: false,
  heroImage: '/images/dishes/eggs-kejriwal/hero.jpg',
  summary:
    'Bombay’s legendary club breakfast — sunny-side-up eggs on cheese toast, finished with green chilli, fresh coriander and a dusting of cracked black pepper.',
  tags: ['breakfast', 'quick', 'eggs', 'toast', 'café'],
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
      'Cheese should be just melted, not browned.',
      'The egg yolk is the sauce — keep it runny.',
    ],
  },

  ingredients: [
    { id: 'bread', name: 'Sourdough or country bread, thick slices', quantity: '2 slices', category: 'main' },
    { id: 'egg', name: 'Eggs', quantity: '2 large', category: 'main' },
    { id: 'cheese', name: 'Sharp cheese, grated (Amul / cheddar)', quantity: '50 g', category: 'main' },
    { id: 'green-chilli', name: 'Green chillies, finely chopped', quantity: '1–2', category: 'spice' },
    { id: 'coriander', name: 'Fresh coriander, chopped', quantity: '1 tbsp', category: 'aromatic' },
    { id: 'butter', name: 'Butter', quantity: '1 tbsp', category: 'main' },
    { id: 'salt', name: 'Salt', quantity: 'to taste', category: 'spice' },
    { id: 'pepper', name: 'Cracked black pepper', quantity: 'to taste', category: 'spice' },
  ],

  tools: [
    { id: 'pan', name: 'Non-stick frying pan' },
    { id: 'oven-or-grill', name: 'Oven or grill (for melting cheese)' },
    { id: 'spatula', name: 'Spatula' },
  ],

  miseEnPlace: [
    { id: 'grate-cheese', label: 'Grate the cheese', done: false },
    { id: 'chop-chillies', label: 'Finely chop green chillies and coriander', done: false },
    { id: 'eggs-room-temp', label: 'Keep eggs at room temperature', done: false },
  ],

  successVariables: [
    {
      id: 'crisp-toast',
      title: 'Crisp toast base',
      detail: 'Toast the bread until deeply golden so it holds its crunch under the cheese and egg.',
      icon: 'flame',
    },
    {
      id: 'runny-yolk',
      title: 'Runny yolk',
      detail: 'Cook the eggs sunny-side-up just until whites set; the yolk should still wobble.',
      icon: 'droplet',
    },
  ],

  commonMistakes: [
    'Toasting bread too lightly (it goes soft under cheese).',
    'Overcooking the eggs — the yolk is the sauce.',
    'Using mild cheese — needs sharp flavour to balance the chilli.',
  ],

  cookingSteps: [
    {
      index: 1,
      title: 'Toast and cheese',
      instruction: 'Toast bread slices until deeply golden. Top each with grated cheese and chopped green chillies. Run under a hot grill or in the oven until cheese melts and bubbles.',
      beginnerExplanation:
        'Toast the bread well in a toaster or on a hot pan with a little butter until golden brown. Sprinkle grated cheese all over the top, then add the chopped green chillies. Slide under a grill (or top of oven) for 1–2 minutes — watch carefully — until the cheese has just melted and looks bubbly.',
      heat: 'High',
      durationSec: 180,
      sensoryCues: [
        { type: 'visual', cue: 'Cheese turns shiny and starts to bubble' },
        { type: 'smell', cue: 'Toast smells nutty, cheese smells sharp and warm' },
      ],
      whyThisMatters: 'A crisp, cheesy base is the structure that holds everything else.',
      image: '/images/dishes/eggs-kejriwal/step-1.jpg',
    },
    {
      index: 2,
      title: 'Fry the eggs sunny-side-up',
      instruction: 'Melt butter in a non-stick pan over medium heat. Crack in the eggs. Cover briefly to set the whites while keeping yolks runny.',
      beginnerExplanation:
        'Heat a non-stick pan on medium and add butter. When it foams, crack the eggs in gently. Reduce heat to low, cover the pan with a lid for about 30–45 seconds — this sets the whites from the steam without firming up the yolk. Lift the lid; whites should be opaque and yolks still glossy and wobbly.',
      heat: 'Medium-low',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'Whites turn from clear to opaque white; yolk stays bright and shiny' },
      ],
      whyThisMatters: 'A runny yolk acts as the sauce for the entire dish — overcooking ruins it.',
      image: '/images/dishes/eggs-kejriwal/step-2.jpg',
    },
    {
      index: 3,
      title: 'Plate and finish',
      instruction: 'Slide each egg onto a cheese toast. Sprinkle coriander, cracked pepper and a pinch of salt. Serve immediately.',
      beginnerExplanation:
        'Carefully lift each egg with a spatula and place on top of a cheese toast. Scatter fresh chopped coriander over the top, then a good crack of black pepper and a tiny pinch of salt. Eat right away while hot.',
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Bright yellow yolk sits on golden cheese on golden bread' },
      ],
      whyThisMatters: 'Eaten immediately, the contrasts — crisp / melt / runny — are at their peak.',
      image: '/images/dishes/eggs-kejriwal/step-3.jpg',
    },
  ],

  rescueIssues: [
    {
      id: 'overcooked-yolk',
      label: 'Yolk is set / hard',
      icon: 'droplet',
      diagnosis: 'Eggs cooked too long or heat was too high.',
      immediateFix: [
        'You can\'t un-cook a yolk. Plate it as is — it will still taste good.',
        'Next time, lower the heat and cover for less time.',
      ],
      preventNextTime: [
        'Cover the pan briefly with a lid to steam-set the whites instead of cooking longer.',
        'Pull eggs off heat as soon as whites turn opaque.',
      ],
      foodScience: 'Egg yolks set at around 70 °C / 158 °F — once past that, they firm up irreversibly.',
    },
  ],

  tasteBalancing: [
    { axis: 'salt', value: 75 },
    { axis: 'acid', value: 30 },
    { axis: 'richness', value: 80 },
    { axis: 'heat', value: 70 },
    { axis: 'aroma', value: 65 },
  ],

  finishingTouches: [
    { id: 'coriander', label: 'Fresh coriander', reason: 'Brightens the rich cheese and yolk.', icon: 'leaf', optional: false },
    { id: 'pepper', label: 'Cracked pepper', reason: 'Adds gentle heat and aroma.', icon: 'flame', optional: false },
    { id: 'sumac', label: 'Sumac dust (optional)', reason: 'Lemony tang lifts the richness.', icon: 'sparkles', optional: true },
  ],

  plating: {
    notes: ['Serve hot, immediately.', 'Pair with strong black coffee or masala chai.'],
    serves: 'Serves 1–2 people',
  },
  storage:
    'Best eaten fresh. Cheese toasts can be made up to 30 minutes ahead and reheated; cook eggs to order.',
  reheating:
    'Do not reheat. Cooked eggs should reach 75 °C / 165 °F internal temperature and be eaten promptly.',

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
