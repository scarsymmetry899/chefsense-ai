/**
 * Masala Dosa — placeholder demo dish.
 * Minimal but schema-valid. Full guided flow lives on Paneer Butter Masala.
 */

import type { Dish } from '../types';

export const masalaDosa: Dish = {
  dishId: 'masala-dosa',
  dishName: 'Masala Dosa',
  cuisine: 'Indian',
  region: 'South Indian',
  difficulty: 'Easy',
  totalTimeMin: 30,
  prepTimeMin: 10,
  cookTimeMin: 20,
  serves: '2–3',
  isVegetarian: true,
  heroImage: '/images/dishes/masala-dosa/hero.jpg',
  summary:
    'Crisp golden rice-and-lentil crêpes wrapped around a spiced potato filling, served with coconut chutney and sambar.',
  tags: ['crispy', 'fermented', 'breakfast', 'vegetarian'],
  mood: ['Quick & Easy', 'Comfort Food'],

  sourceConsensus: {
    sources: [
      { category: 'top-chef-style', trustScore: 88, tags: ['Technique'] },
      { category: 'regional', trustScore: 96, tags: ['Authentic', 'Cultural'] },
      { category: 'technique-video', trustScore: 90, tags: ['Visual'] },
      { category: 'recipe-database', trustScore: 84, tags: ['Tested'] },
      { category: 'food-science', trustScore: 80, tags: ['Science'] },
    ],
    insights: [
      'The pan must be hot enough that water droplets sizzle and skip.',
      'A thin, even spread is what creates that signature crisp.',
      'Tempering the potato filling adds depth and aroma.',
    ],
  },

  ingredients: [
    { id: 'batter', name: 'Dosa batter (fermented)', quantity: '2 cups', category: 'main', note: 'Store-bought or homemade, well-fermented' },
    { id: 'potato', name: 'Boiled potatoes, crumbled', quantity: '3 medium', category: 'main' },
    { id: 'onion', name: 'Onion, finely sliced', quantity: '1 small', category: 'aromatic' },
    { id: 'mustard', name: 'Mustard seeds', quantity: '1 tsp', category: 'spice' },
    { id: 'curry-leaves', name: 'Curry leaves', quantity: '8–10', category: 'aromatic' },
    { id: 'turmeric', name: 'Turmeric powder', quantity: '1/4 tsp', category: 'spice' },
    { id: 'ginger', name: 'Ginger, grated', quantity: '1 tsp', category: 'aromatic' },
    { id: 'oil', name: 'Oil', quantity: '2 tbsp', category: 'main' },
    { id: 'salt', name: 'Salt', quantity: 'to taste', category: 'spice' },
  ],

  tools: [
    { id: 'dosa-pan', name: 'Flat dosa pan or non-stick skillet' },
    { id: 'ladle', name: 'Ladle' },
    { id: 'spatula', name: 'Thin spatula' },
  ],

  miseEnPlace: [
    { id: 'check-batter', label: 'Check batter is well-fermented & lump-free', done: false },
    { id: 'boil-potatoes', label: 'Boil and crumble potatoes', done: false },
    { id: 'prep-tempering', label: 'Keep tempering spices ready', done: false },
  ],

  successVariables: [
    {
      id: 'pan-temp',
      title: 'Hot pan',
      detail: 'Water droplets should skip and evaporate when sprinkled on the pan.',
      icon: 'flame',
    },
    {
      id: 'thin-spread',
      title: 'Thin even spread',
      detail: 'Spread the batter in a single quick spiral. Thin centre, slightly thicker edges.',
      icon: 'waves',
    },
  ],

  commonMistakes: [
    'Pan not hot enough (dosa sticks).',
    'Batter too thick (no lacy crisp).',
    'Overfilling with potato (hard to fold).',
  ],

  cookingSteps: [
    {
      index: 1,
      title: 'Prepare the potato filling',
      instruction: 'Temper mustard seeds + curry leaves in oil. Add onion, ginger, turmeric. Stir in crumbled potatoes and salt.',
      beginnerExplanation:
        'Heat oil. Add mustard seeds — they should pop quickly. Add curry leaves and onion, cook until soft. Stir in ginger and turmeric. Add the crumbled potatoes, salt, and mix gently until everything is coated and warmed through.',
      heat: 'Medium',
      durationSec: 300,
      sensoryCues: [
        { type: 'sound', cue: 'Mustard seeds pop loudly when oil is hot enough' },
        { type: 'smell', cue: 'Curry leaves release their warm citrus-pepper aroma' },
      ],
      whyThisMatters: 'The tempering is what makes the filling taste authentic rather than plain.',
      image: '/images/dishes/masala-dosa/step-1.jpg',
    },
    {
      index: 2,
      title: 'Heat the pan',
      instruction: 'Place a flat pan on medium-high heat. Test with water — droplets should skip and evaporate.',
      beginnerExplanation:
        'Heat the pan well. Sprinkle a few drops of water on it. If they skip across the surface and evaporate, you are ready. If they just sit and bubble, wait another minute.',
      heat: 'Medium-high',
      durationSec: 120,
      sensoryCues: [
        { type: 'sound', cue: 'Water droplets sizzle sharply and skip when the pan is hot enough' },
      ],
      whyThisMatters: 'A correctly hot pan is the single biggest factor for crisp dosas.',
      image: '/images/dishes/masala-dosa/step-2.jpg',
    },
    {
      index: 3,
      title: 'Spread and crisp the dosa',
      instruction: 'Pour a ladle of batter to the centre. Quickly spiral outward with the ladle to spread thin. Drizzle oil at the edges. Add filling, fold, and serve.',
      beginnerExplanation:
        'Lower heat slightly. Pour a ladle of batter at the centre. Using the back of the ladle in a quick spiral motion from inside out, spread the batter into a thin disc. Drizzle a few drops of oil around the edges. When the underside is golden and crisp (you can see it lift slightly), spoon some potato filling on one side, fold, and serve hot.',
      heat: 'Medium',
      durationSec: 180,
      sensoryCues: [
        { type: 'visual', cue: 'Edges lift away from the pan when it is ready' },
        { type: 'smell', cue: 'A toasty, nutty aroma rises as the dosa crisps' },
      ],
      whyThisMatters: 'Speed and a gentle even hand are what give the dosa its signature lacy crisp finish.',
      image: '/images/dishes/masala-dosa/step-3.jpg',
    },
  ],

  rescueIssues: [
    {
      id: 'dosa-sticks',
      label: 'Dosa sticks to pan',
      icon: 'flame',
      diagnosis: 'Pan was not hot enough or surface was not properly seasoned.',
      immediateFix: [
        'Lift gently with a thin spatula — discard if torn.',
        'Wipe pan, reheat to higher temperature, oil lightly before next attempt.',
      ],
      preventNextTime: ['Always test pan temperature with a few drops of water.'],
      foodScience: 'Heat creates a vapour layer that lets the batter slide instead of bond.',
    },
  ],

  tasteBalancing: [
    { axis: 'salt', value: 70 },
    { axis: 'acid', value: 60 },
    { axis: 'richness', value: 65 },
    { axis: 'heat', value: 45 },
    { axis: 'aroma', value: 85 },
  ],

  finishingTouches: [
    { id: 'chutney', label: 'Coconut chutney', reason: 'Cooling counterpoint to the spice.', icon: 'leaf', optional: false },
    { id: 'sambar', label: 'Sambar', reason: 'A small bowl on the side completes the meal.', icon: 'soup', optional: false },
  ],

  plating: {
    notes: ['Serve immediately while crisp.', 'Place sambar and chutney in small bowls beside.'],
    serves: 'Serves 2–3 people',
  },
  storage: 'Best made fresh. Filling can be made ahead and refrigerated for 2 days.',
  reheating: 'Dosas do not reheat well. Reheat filling alone, then make fresh dosas.',

  translations: {
    hi: {
      'dish.name': 'मसाला डोसा',
      'dish.summary':
        'कुरकुरी सुनहरी चावल-दाल की पतली परत, अंदर मसालेदार आलू भरकर, नारियल चटनी और सांभर के साथ परोसा गया।',
    },
    te: {
      'dish.name': 'మసాలా దోశ',
      'dish.summary':
        'క్రిస్పీ బంగారు రంగు బియ్యం-పప్పు దోశ, లోపల మసాలా బంగాళాదుంప కూర, కొబ్బరి చట్నీ, సాంబార్‌తో పాటు వడ్డిస్తారు.',
    },
  },
};
