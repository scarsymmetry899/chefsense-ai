/**
 * Dal Tadka — placeholder demo dish.
 * Trimmed data set; full guided flow lives on Paneer Butter Masala.
 * Same house style applies: beginner-friendly language, no jargon.
 */

import type { Dish } from '../types';

export const dalTadka: Dish = {
  dishId: 'dal-tadka',
  dishName: 'Dhaba Style Dal Tadka',
  cuisine: 'Indian',
  region: 'North Indian',
  difficulty: 'Easy',
  totalTimeMin: 25,
  prepTimeMin: 5,
  cookTimeMin: 20,
  serves: '3–4',
  isVegetarian: true,
  heroImage: '/images/dishes/dal-tadka/hero.jpg',
  summary:
    'A homely yellow dal finished with a sizzling tempering of ghee, cumin, garlic and dried red chillies — comfort in a bowl.',
  tags: ['comfort', 'lentil', 'tempered', 'vegetarian'],
  mood: ['Comfort Food', 'Quick & Easy', 'High Protein'],

  sourceConsensus: {
    sources: [
      { category: 'top-chef-style', trustScore: 92, tags: ['Technique'] },
      { category: 'regional', trustScore: 95, tags: ['Authentic'] },
      { category: 'recipe-database', trustScore: 88, tags: ['Tested'] },
      { category: 'food-science', trustScore: 82, tags: ['Science'] },
      { category: 'technique-video', trustScore: 80, tags: ['Visual'] },
    ],
    insights: [
      'Soak the dal for 20 minutes — it cooks faster and smoother.',
      'Finish with a hot tempering for that signature aroma.',
      'A pinch of asafoetida deepens the savoury notes.',
    ],
  },

  ingredients: [
    { id: 'toor-dal', name: 'Toor dal (split pigeon peas)', quantity: '1 cup', category: 'main' },
    { id: 'turmeric', name: 'Turmeric powder', quantity: '1/2 tsp', category: 'spice' },
    { id: 'salt', name: 'Salt', quantity: 'to taste', category: 'spice' },
    { id: 'ghee', name: 'Ghee', quantity: '2 tbsp', category: 'main' },
    { id: 'cumin', name: 'Cumin seeds', quantity: '1 tsp', category: 'spice' },
    { id: 'garlic', name: 'Garlic cloves', quantity: '4, sliced', category: 'aromatic' },
    { id: 'red-chilli', name: 'Dried red chillies', quantity: '2', category: 'spice' },
    { id: 'hing', name: 'Asafoetida (hing)', quantity: '1 pinch', category: 'spice' },
    { id: 'tomato', name: 'Tomato, chopped', quantity: '1 small', category: 'main' },
    { id: 'coriander', name: 'Fresh coriander leaves', quantity: '2 tbsp', category: 'finishing' },
  ],

  tools: [
    { id: 'pressure-cooker', name: 'Pressure cooker' },
    { id: 'tadka-pan', name: 'Small tadka pan' },
    { id: 'spatula', name: 'Wooden spatula' },
  ],

  miseEnPlace: [
    { id: 'rinse-dal', label: 'Rinse dal until water runs clear', done: false },
    { id: 'soak-dal', label: 'Soak dal in warm water for 20 mins', done: false },
    { id: 'slice-garlic', label: 'Slice garlic', done: false },
    { id: 'measure-spices', label: 'Measure tempering spices', done: false },
  ],

  successVariables: [
    {
      id: 'creamy-dal',
      title: 'Creamy texture',
      detail: 'Whisk the cooked dal for a minute to make it naturally creamy without any cream.',
      icon: 'waves',
    },
    {
      id: 'hot-tempering',
      title: 'Hot ghee tempering',
      detail: 'Ghee must be properly hot before adding spices — that is what releases their aroma.',
      icon: 'flame',
    },
  ],

  commonMistakes: [
    'Tempering in cold ghee (spices stay flat).',
    'Overcooking the dal (turns gluey).',
    'Skipping the asafoetida (loses signature flavour).',
  ],

  cookingSteps: [
    {
      index: 1,
      title: 'Cook the dal',
      instruction: 'Pressure-cook soaked dal with turmeric, salt and 3 cups water for 3 whistles.',
      beginnerExplanation:
        'Rinse and soak the dal. Add it to a pressure cooker with turmeric and salt. Cover with 3 cups water. Cook on medium heat for 3 whistles, then let pressure release naturally.',
      heat: 'Medium',
      durationSec: 900,
      sensoryCues: [
        { type: 'visual', cue: 'Dal looks soft and creamy when pressed between fingers' },
      ],
      whyThisMatters: 'Properly cooked dal is the base of everything that follows.',
      image: '/images/dishes/dal-tadka/step-1.jpg',
    },
    {
      index: 2,
      title: 'Prepare the tempering',
      instruction: 'Heat ghee in a small pan. Add cumin, garlic, dried chillies and asafoetida.',
      beginnerExplanation:
        'Heat the ghee until it shimmers. Add cumin seeds — they should sizzle and dance immediately. Add garlic and dried chillies. Cook until garlic turns light golden. Add asafoetida last.',
      heat: 'Medium',
      durationSec: 60,
      sensoryCues: [
        { type: 'sound', cue: 'Cumin sizzles and pops as soon as it hits the ghee' },
        { type: 'smell', cue: 'Warm, nutty aroma fills the kitchen' },
        { type: 'visual', cue: 'Garlic turns light golden, not brown' },
      ],
      whyThisMatters: 'Hot ghee opens up the spice oils — this is the soul of the dish.',
      image: '/images/dishes/dal-tadka/step-2.jpg',
    },
    {
      index: 3,
      title: 'Pour the tempering over dal',
      instruction: 'Pour the hot tempering over the dal. Cover for 1 minute. Serve.',
      beginnerExplanation:
        'Carefully pour the hot tempering over the cooked dal. Cover the pan for one minute to trap the aroma. Garnish with fresh coriander leaves.',
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'sound', cue: 'Loud sizzle when the hot ghee hits the cool dal' },
        { type: 'smell', cue: 'Aromatic burst fills the room' },
      ],
      whyThisMatters: 'A loud sizzle = a good tempering. That sound is your quality check.',
      image: '/images/dishes/dal-tadka/step-3.jpg',
    },
  ],

  rescueIssues: [
    {
      id: 'too-thick',
      label: 'Too thick',
      icon: 'droplet',
      diagnosis: 'Dal absorbed too much water during cooking.',
      immediateFix: ['Add hot water 2 tbsp at a time, whisking.', 'Reheat gently for 1 minute.'],
      preventNextTime: ['Aim for pourable, not gloopy, consistency.'],
      foodScience: 'Cooked lentils continue to swell as they cool.',
    },
  ],

  tasteBalancing: [
    { axis: 'salt', value: 80 },
    { axis: 'acid', value: 60 },
    { axis: 'richness', value: 75 },
    { axis: 'heat', value: 50 },
    { axis: 'aroma', value: 90 },
  ],

  finishingTouches: [
    { id: 'coriander', label: 'Garnish coriander', reason: 'Brightness and freshness.', icon: 'leaf', optional: false },
    { id: 'lemon', label: 'Squeeze of lemon', reason: 'Lifts the whole dish.', icon: 'lemon', optional: true },
  ],

  plating: {
    notes: ['Serve hot with steamed rice or roti.', 'A side of pickle or papad goes beautifully.'],
    serves: 'Serves 3–4 people',
  },
  storage: 'Refrigerate in an airtight container for up to 3 days.',
  reheating: 'Reheat gently with a splash of water until just hot.',

  translations: {
    hi: {
      'dish.name': 'ढाबा स्टाइल दाल तड़का',
      'dish.summary':
        'घर जैसी पीली दाल, जिसके ऊपर देसी घी में चटकाए जीरे, लहसुन और सूखी लाल मिर्च का सुगंधित तड़का — एक कटोरी आराम।',
    },
    te: {
      'dish.name': 'ధాబా స్టైల్ దాల్ తడ్కా',
      'dish.summary':
        'ఇంటి రుచితో పసుపు దాల్‌కు నెయ్యిలో జీలకర్ర, వెల్లుల్లి, ఎండు మిర్చి తాలింపుతో ముగింపు — ఒక గిన్నెలో ఆనందం.',
    },
  },
};
