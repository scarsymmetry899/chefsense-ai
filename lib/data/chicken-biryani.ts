/**
 * Chicken Biryani — placeholder demo dish.
 * Trimmed; full guided flow lives on Paneer Butter Masala.
 *
 * Food-safety reminder: chicken must reach an internal
 * temperature of 75 °C / 165 °F before serving.
 */

import type { Dish } from '../types';

export const chickenBiryani: Dish = {
  dishId: 'chicken-biryani',
  dishName: 'Hyderabadi Chicken Biryani',
  cuisine: 'Indian',
  region: 'Hyderabadi',
  difficulty: 'Hard',
  totalTimeMin: 60,
  prepTimeMin: 25,
  cookTimeMin: 35,
  serves: '4–5',
  isVegetarian: false,
  heroImage: '/images/dishes/chicken-biryani/hero.jpg',
  summary:
    'A festive layered rice dish where marinated chicken, fragrant basmati and warm spices steam together into a celebration in a pot.',
  tags: ['festive', 'layered', 'rice', 'non-vegetarian'],
  mood: ['Festive Treats', 'Weekend Special', 'High Protein'],

  sourceConsensus: {
    sources: [
      { category: 'top-chef-style', trustScore: 90, tags: ['Technique'] },
      { category: 'regional', trustScore: 96, tags: ['Authentic', 'Cultural'] },
      { category: 'technique-video', trustScore: 92, tags: ['Visual'] },
      { category: 'recipe-database', trustScore: 85, tags: ['Tested'] },
      { category: 'food-science', trustScore: 80, tags: ['Science'] },
    ],
    insights: [
      'Marinate chicken for at least 30 minutes — longer is better.',
      'Soak basmati rice to prevent breakage during cooking.',
      'The dum (steaming) step is non-negotiable for layered flavour.',
    ],
  },

  ingredients: [
    { id: 'chicken', name: 'Chicken pieces, bone-in', quantity: '500 g', category: 'main', note: 'Cook until internal temperature reaches 75 °C / 165 °F.' },
    { id: 'basmati', name: 'Basmati rice', quantity: '2 cups', category: 'main', note: 'Soak for 30 minutes' },
    { id: 'yogurt', name: 'Thick yogurt', quantity: '1/2 cup', category: 'main' },
    { id: 'onion', name: 'Onion, thinly sliced and fried', quantity: '2 large', category: 'aromatic' },
    { id: 'ginger-garlic', name: 'Ginger-garlic paste', quantity: '2 tbsp', category: 'aromatic' },
    { id: 'biryani-masala', name: 'Biryani masala', quantity: '2 tbsp', category: 'spice' },
    { id: 'mint', name: 'Fresh mint leaves', quantity: '1/2 cup', category: 'finishing' },
    { id: 'saffron-milk', name: 'Saffron-infused warm milk', quantity: '2 tbsp', category: 'finishing' },
  ],

  tools: [
    { id: 'heavy-pot', name: 'Heavy-bottomed pot with tight lid' },
    { id: 'large-pan', name: 'Large pan for parboiling rice' },
    { id: 'spatula', name: 'Spatula' },
  ],

  miseEnPlace: [
    { id: 'marinate', label: 'Marinate chicken for 30+ minutes', done: false },
    { id: 'soak-rice', label: 'Soak basmati for 30 minutes', done: false },
    { id: 'fry-onions', label: 'Fry sliced onions to golden brown', done: false },
    { id: 'warm-milk', label: 'Soak saffron in warm milk', done: false },
  ],

  successVariables: [
    {
      id: 'rice-doneness',
      title: 'Parboil the rice 70%',
      detail: 'Rice should be cooked outside but firm inside. It finishes cooking during dum.',
      icon: 'soup',
    },
    {
      id: 'dum-seal',
      title: 'Seal the pot tightly',
      detail: 'A tight seal traps steam — without steam there is no biryani.',
      icon: 'flame',
    },
  ],

  commonMistakes: [
    'Over-cooking rice before layering (turns mushy after dum).',
    'Insufficient marination (chicken stays bland).',
    'Lifting the lid during dum (loses crucial steam).',
  ],

  cookingSteps: [
    {
      index: 1,
      title: 'Marinate the chicken',
      instruction: 'Mix chicken with yogurt, spices and ginger-garlic. Rest 30+ minutes.',
      beginnerExplanation:
        'Combine chicken with thick yogurt, biryani masala, ginger-garlic paste, half the fried onions, and salt. Coat every piece well. Cover and rest in the fridge for at least 30 minutes — overnight is even better.',
      heat: 'Off',
      durationSec: 1800,
      sensoryCues: [
        { type: 'visual', cue: 'Chicken is fully coated in a rich yellow-red marinade' },
      ],
      whyThisMatters: 'Yogurt tenderizes the chicken while spices penetrate the meat.',
      foodScience:
        'Lactic acid in yogurt slowly breaks down proteins, making the chicken tender and flavourful.',
      image: '/images/dishes/chicken-biryani/step-1.jpg',
    },
    {
      index: 2,
      title: 'Parboil the basmati',
      instruction: 'Boil soaked rice with whole spices in salted water until 70% cooked.',
      beginnerExplanation:
        'Bring a large pot of salted water to a rolling boil. Add whole spices like bay leaf and green cardamom. Drain the soaked rice and add. Cook 5–6 minutes until grains bend but still have a firm centre. Drain immediately.',
      heat: 'High',
      durationSec: 360,
      sensoryCues: [
        { type: 'visual', cue: 'Grains elongate and turn shiny but still hold shape' },
        { type: 'texture', cue: 'A grain pressed between fingers feels soft outside, firm inside' },
      ],
      whyThisMatters: '70% cooked rice finishes perfectly during the steaming step.',
      image: '/images/dishes/chicken-biryani/step-2.jpg',
    },
    {
      index: 3,
      title: 'Layer and steam (dum)',
      instruction:
        'Layer chicken at the bottom, rice on top. Sprinkle saffron milk and mint. Seal and cook on low for 25 mins.',
      beginnerExplanation:
        'In a heavy pot, spread the marinated chicken in an even layer. Spread the parboiled rice on top. Sprinkle the saffron-infused milk, remaining fried onions, mint leaves. Cover with a tight-fitting lid (seal with foil if needed). Cook on the lowest heat for 25 minutes. Do not lift the lid.',
      heat: 'Low',
      durationSec: 1500,
      sensoryCues: [
        { type: 'smell', cue: 'A complex aromatic perfume seeps from under the lid' },
        { type: 'sound', cue: 'A soft, steady hiss — never loud bubbling' },
      ],
      whyThisMatters:
        'Steam carries the chicken juices and spices upward, infusing every grain of rice. Critically, this is when the chicken reaches safe serving temperature.',
      foodScience:
        'Sealed steam cooks chicken through (must reach 75 °C / 165 °F internally) while the rice absorbs aromatic compounds.',
      image: '/images/dishes/chicken-biryani/step-3.jpg',
    },
  ],

  rescueIssues: [
    {
      id: 'mushy-rice',
      label: 'Rice turned mushy',
      icon: 'soup',
      diagnosis: 'Rice was over-parboiled before steaming.',
      immediateFix: [
        'Spread the rice on a wide plate to cool quickly and stop cooking.',
        'Serve immediately rather than letting it sit.',
      ],
      preventNextTime: ['Aim for 70% doneness when parboiling — firm centre is essential.'],
      foodScience: 'Rice continues cooking from residual heat.',
    },
  ],

  tasteBalancing: [
    { axis: 'salt', value: 80 },
    { axis: 'acid', value: 55 },
    { axis: 'richness', value: 85 },
    { axis: 'heat', value: 75 },
    { axis: 'aroma', value: 95 },
  ],

  finishingTouches: [
    { id: 'mint', label: 'Garnish with mint', reason: 'Freshness against the rich rice.', icon: 'leaf', optional: false },
    { id: 'fried-onions', label: 'Top with fried onions', reason: 'Sweet, crispy contrast.', icon: 'flame', optional: false },
  ],

  plating: {
    notes: ['Serve with raita and a wedge of lemon.', 'Always check chicken is cooked through before serving.'],
    serves: 'Serves 4–5 people',
  },
  storage:
    'Cool completely within 90 minutes. Refrigerate within 2 hours of cooking, in an airtight container, for up to 2 days.',
  reheating:
    'Reheat thoroughly until steaming hot throughout — minimum 75 °C / 165 °F internal temperature. Sprinkle a few drops of water before reheating to keep rice from drying out.',

  translations: {
    hi: {
      'dish.name': 'हैदराबादी चिकन बिरयानी',
      'dish.summary':
        'एक उत्सवी परतदार चावल जिसमें मसाला चिकन, खुशबूदार बासमती और गर्म मसाले एक साथ दम पर पकते हैं — मानो एक हाँडी में जश्न।',
    },
    te: {
      'dish.name': 'హైదరాబాదీ చికెన్ బిర్యానీ',
      'dish.summary':
        'పండుగ వాతావరణాన్ని తలపించే పొరల బిర్యానీ — మసాలా చికెన్, సుగంధ బాస్మతి, వేడి మసాలాలు దమ్‌లో కలిసి ఒక గిన్నెలో వేడుక.',
    },
  },
};
