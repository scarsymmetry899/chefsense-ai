/**
 * Bandi Chicken Fried Rice — Hyderabadi street-food classic.
 * Smoky, spicy, deeply seasoned fried rice with marinated chicken,
 * scrambled egg, spring onions and dried-chilli heat. Cooked on
 * a screaming-hot cart-style flat pan ("bandi").
 *
 * Schema-valid placeholder; full guided flow lives on PBM for the MVP.
 */

import type { Dish } from '../types';

export const bandiChickenFriedRice: Dish = {
  dishId: 'bandi-chicken-fried-rice',
  dishName: 'Bandi Chicken Fried Rice',
  cuisine: 'Indian',
  region: 'Hyderabadi Street',
  difficulty: 'Medium',
  totalTimeMin: 30,
  prepTimeMin: 12,
  cookTimeMin: 18,
  serves: '2–3',
  isVegetarian: false,
  heroImage: '/images/dishes/bandi-chicken-fried-rice/hero.jpg',
  summary:
    'Hyderabad-style street fried rice — smoky basmati tossed with spice-marinated chicken, scrambled egg, spring onions and a fiery dry-chilli kick straight off the bandi (cart) pan.',
  tags: ['street-food', 'spicy', 'smoky', 'chicken'],
  mood: ['Quick & Easy', 'High Protein'],

  sourceConsensus: {
    sources: [
      { category: 'top-chef-style', trustScore: 87, tags: ['Technique', 'Flavor Focus'] },
      { category: 'regional', trustScore: 95, tags: ['Authentic', 'Cultural'] },
      { category: 'technique-video', trustScore: 90, tags: ['Visual', 'Step Clarity'] },
      { category: 'recipe-database', trustScore: 84, tags: ['Tested'] },
      { category: 'food-science', trustScore: 81, tags: ['Science'] },
    ],
    insights: [
      'Cold day-old rice is essential — fresh rice turns to mush.',
      'Heat the pan until smoking before adding the first ingredient.',
      'Cook in stages and combine at the end for the layered street-cart flavour.',
    ],
  },

  ingredients: [
    { id: 'rice', name: 'Cooked basmati rice (cold, day-old)', quantity: '3 cups', category: 'main' },
    { id: 'chicken', name: 'Boneless chicken thigh, cubed', quantity: '250 g', category: 'main' },
    { id: 'egg', name: 'Eggs', quantity: '2', category: 'main' },
    { id: 'soy', name: 'Soy sauce', quantity: '2 tbsp', category: 'main' },
    { id: 'chilli-sauce', name: 'Hot chilli sauce (or green chilli paste)', quantity: '1 tbsp', category: 'spice' },
    { id: 'ginger-garlic', name: 'Ginger-garlic paste', quantity: '1 tbsp', category: 'aromatic' },
    { id: 'spring-onion', name: 'Spring onions, sliced (whites + greens separated)', quantity: '4', category: 'aromatic' },
    { id: 'capsicum', name: 'Green capsicum, diced small', quantity: '1/2', category: 'aromatic' },
    { id: 'dried-chilli', name: 'Dried red chillies (broken)', quantity: '3–4', category: 'spice' },
    { id: 'pepper', name: 'Black pepper powder', quantity: '1/2 tsp', category: 'spice' },
    { id: 'oil', name: 'Neutral oil', quantity: '3 tbsp', category: 'main' },
    { id: 'salt', name: 'Salt', quantity: 'to taste', category: 'spice' },
  ],

  tools: [
    { id: 'wok', name: 'Wok or large heavy-bottomed pan' },
    { id: 'spatula', name: 'Flat spatula or wok ladle' },
    { id: 'bowl', name: 'Mixing bowl (for marinating chicken)' },
  ],

  miseEnPlace: [
    { id: 'cold-rice', label: 'Use rice that has been cooled overnight in the fridge', done: false },
    { id: 'marinate-chicken', label: 'Marinate chicken in soy + ginger-garlic + pepper for 10 min', done: false },
    { id: 'prep-veg', label: 'Slice spring onions, dice capsicum, break dried chillies', done: false },
    { id: 'whisk-eggs', label: 'Whisk eggs with a pinch of salt', done: false },
  ],

  successVariables: [
    {
      id: 'screaming-pan',
      title: 'Screaming hot pan',
      detail: 'The pan must be smoking-hot before any ingredient hits it — this is the "wok hei" street-cart smokiness.',
      icon: 'flame',
    },
    {
      id: 'cold-rice',
      title: 'Cold rice',
      detail: 'Day-old rice has dried-out grains that fry separately. Fresh rice turns gummy.',
      icon: 'snowflake',
    },
    {
      id: 'stage-cooking',
      title: 'Cook in stages',
      detail: 'Chicken, then eggs, then aromatics, then rice — added in order, combined at the end.',
      icon: 'layers',
    },
  ],

  commonMistakes: [
    'Using freshly cooked warm rice (sticky, clumpy result).',
    'Adding everything at once — flavours don\'t layer properly.',
    'Pan not hot enough — the dish steams instead of frying.',
  ],

  cookingSteps: [
    {
      index: 1,
      title: 'Sear the chicken',
      instruction: 'Heat 1 tbsp oil in a hot wok until smoking. Add marinated chicken in a single layer. Sear undisturbed for 1 minute, then toss until cooked through and lightly charred. Remove to a plate.',
      beginnerExplanation:
        'Heat your wok or large pan on the highest flame until you see wisps of smoke rising — this takes 1–2 minutes. Add 1 tablespoon of oil and swirl. Drop in the marinated chicken cubes spread out in one layer. Don\'t stir for the first 1 minute — let them get a good golden char on one side. Then toss and stir for another 2–3 minutes until chicken is fully cooked, white in the middle, and has nice dark patches. Slide it onto a plate to rest.',
      heat: 'High',
      durationSec: 240,
      sensoryCues: [
        { type: 'sound', cue: 'Loud sizzle the moment chicken hits the pan' },
        { type: 'visual', cue: 'Edges of chicken pieces turn dark golden-brown' },
        { type: 'smell', cue: 'Smoky, slightly charred aroma rises' },
      ],
      whyThisMatters: 'Searing before mixing builds the smoky street-cart flavour into the chicken itself.',
      image: '/images/dishes/bandi-chicken-fried-rice/step-1.jpg',
    },
    {
      index: 2,
      title: 'Scramble the eggs',
      instruction: 'In the same pan, add 1 tsp oil. Pour in whisked eggs and scramble quickly with a spatula into small curds. Push to one side or remove.',
      beginnerExplanation:
        'Keep the pan on high heat. Add a small splash of oil. Pour in the whisked eggs and immediately start moving them with your spatula in quick small motions — you want fine soft curds, not big chunks. This takes 20–30 seconds. As soon as eggs are just set and still glossy, push them to one side of the pan or scoop onto the chicken plate.',
      heat: 'High',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Eggs go from liquid yellow to soft golden curds in seconds' },
      ],
      whyThisMatters: 'Quick small curds distribute through the rice evenly; large slow-cooked chunks make it feel like an omelette mixed in.',
      image: '/images/dishes/bandi-chicken-fried-rice/step-2.jpg',
    },
    {
      index: 3,
      title: 'Build the aromatic base',
      instruction: 'Add the remaining oil. Toss in dried chillies, spring onion whites and ginger-garlic. Stir-fry 30 seconds. Add capsicum and stir-fry 1 minute.',
      beginnerExplanation:
        'Add the rest of the oil to the hot pan. Quickly add the broken dried red chillies (they\'ll darken and release their heat), then the chopped white parts of spring onions and the ginger-garlic paste. Stir constantly for 30 seconds — they should not burn. Add diced green capsicum and stir-fry another minute. The pan should smell incredibly fragrant by now.',
      heat: 'High',
      durationSec: 120,
      sensoryCues: [
        { type: 'smell', cue: 'Sharp, sweet, garlicky, chilli-warm aroma fills the kitchen' },
        { type: 'visual', cue: 'Chillies darken; spring onions soften and turn translucent' },
      ],
      whyThisMatters: 'This is where the layered street-cart flavour gets built — adding everything at once would mute it.',
      image: '/images/dishes/bandi-chicken-fried-rice/step-3.jpg',
    },
    {
      index: 4,
      title: 'Fold in rice and finish',
      instruction: 'Add cold rice and break up any clumps. Drizzle soy and chilli sauce. Toss high and fast for 2 minutes until everything is hot and well coated. Return chicken + egg, toss again. Finish with spring onion greens and a final crack of pepper.',
      beginnerExplanation:
        'Add the cold rice to the pan, breaking up any clumps with your hands first if needed. Drizzle soy sauce and chilli sauce over the top. Toss the rice quickly using two utensils (or by lifting and tossing the pan) for about 2 minutes — keep it moving so it doesn\'t stick or burn. The rice will start picking up colour from the sauces. Return the cooked chicken and scrambled eggs and toss everything together. Sprinkle the green tops of spring onions and a final crack of black pepper. Taste and add salt if needed.',
      heat: 'High',
      durationSec: 180,
      sensoryCues: [
        { type: 'sound', cue: 'Sharp sizzle as rice hits hot pan; quieter as it dries out and fries' },
        { type: 'visual', cue: 'Rice grains separate, take on amber colour from soy, oil-glossed' },
      ],
      whyThisMatters: 'Tossing high and fast on screaming heat is what gives bandi-style rice its signature smoky lift.',
      image: '/images/dishes/bandi-chicken-fried-rice/step-4.jpg',
    },
  ],

  rescueIssues: [
    {
      id: 'mushy-rice',
      label: 'Rice turned mushy',
      icon: 'droplet',
      diagnosis: 'Rice was too fresh / warm, OR pan was not hot enough so the rice steamed instead of fried.',
      immediateFix: [
        'Spread the rice thin in the pan, turn heat to maximum, and leave undisturbed for 1–2 minutes to crisp the bottom.',
        'Add a small splash of oil if it looks dry.',
      ],
      preventNextTime: [
        'Always use cold rice that has been refrigerated for at least 4 hours (overnight is best).',
        'Heat the pan until you see a wisp of smoke before adding any ingredient.',
      ],
      foodScience: 'Cold rice has retrograded starches — the grains are dry on the outside, allowing each one to fry separately instead of steaming together.',
    },
  ],

  tasteBalancing: [
    { axis: 'salt', value: 80 },
    { axis: 'acid', value: 45 },
    { axis: 'richness', value: 60 },
    { axis: 'heat', value: 85 },
    { axis: 'aroma', value: 90 },
  ],

  finishingTouches: [
    { id: 'spring-greens', label: 'Spring onion greens', reason: 'Fresh sharpness against the smoky rice.', icon: 'leaf', optional: false },
    { id: 'pepper', label: 'Cracked black pepper', reason: 'Adds aromatic heat that builds slowly.', icon: 'flame', optional: false },
    { id: 'lime', label: 'Lime wedge', reason: 'A squeeze cuts through the richness.', icon: 'sparkles', optional: true },
  ],

  plating: {
    notes: ['Serve very hot, straight from the wok.', 'Pair with a side of raita or thin gravy.'],
    serves: 'Serves 2–3 people',
  },
  storage:
    'Refrigerate in an airtight container for up to 2 days.',
  reheating:
    'Reheat in a very hot pan with a splash of water to refresh the rice. Internal temperature must reach 75 °C / 165 °F since chicken is involved.',

  translations: {
    hi: {
      'dish.name': 'बंडी चिकन फ्राइड राइस',
      'dish.summary':
        'हैदराबाद की मशहूर सड़क-गाड़ी (बंडी) से प्रेरित — मसालेदार मेरीनेट किया चिकन, फेटे हुए अंडे, हरी प्याज़ और सूखी लाल मिर्च के साथ धुएँदार बासमती चावल।',
    },
    te: {
      'dish.name': 'బండి చికెన్ ఫ్రైడ్ రైస్',
      'dish.summary':
        'హైదరాబాద్ వీధి-బండి శైలి — మసాలాతో మెరినేట్ చేసిన చికెన్, గుడ్డు తాలింపు, పచ్చి ఉల్లి, ఎండు మిర్చి కలిపిన పొగమంటల బాస్మతి ఫ్రైడ్ రైస్.',
    },
  },
};
