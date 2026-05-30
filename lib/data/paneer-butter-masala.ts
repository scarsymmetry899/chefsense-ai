/**
 * ChefSense AI — Paneer Butter Masala (MVP demo dish)
 *
 * ───── BEGINNER-LANGUAGE RULE ─────
 * All instruction copy in this file follows the house style:
 *   - Avoid jargon. If used, define inline in plain words.
 *   - Describe what to SEE / SMELL / HEAR / TOUCH at each step.
 *   - One small idea per sentence. Short sentences win.
 *
 * Bad:  "Reduce the masala."
 * Good: "Cook it slowly until it becomes thicker and shinier.
 *        Small oil drops should appear around the edges."
 *
 * Bad:  "Deglaze the pan."
 * Good: "Add a splash of water and gently scrape the tasty
 *        stuck bits from the pan."
 *
 * Bad:  "Bloom the spices."
 * Good: "Cook the spices in warm oil for a few seconds to wake up
 *        their flavour. They should smell rich, not raw."
 *
 * ───── SOURCE RULE ─────
 * No real chef names. No real publication names. Anonymous
 * source categories only — see lib/source-policy.ts.
 */

import type { Dish } from '../types';

const STEP_IMG = (n: number) =>
  `/images/dishes/paneer-butter-masala/step-${n}.jpg`;

export const paneerButterMasala: Dish = {
  dishId: 'paneer-butter-masala',
  dishName: 'Paneer Butter Masala',
  cuisine: 'Indian',
  region: 'North Indian',
  difficulty: 'Medium',
  totalTimeMin: 50,
  prepTimeMin: 15,
  cookTimeMin: 35,
  serves: '3–4',
  isVegetarian: true,
  heroImage: '/images/dishes/paneer-butter-masala/hero.jpg',
  summary:
    'A rich, creamy and perfectly balanced North Indian classic. Velvety tomato-cashew gravy embraces soft paneer cubes with aromatic spices and butter.',
  tags: ['creamy', 'tomato-based', 'restaurant-style', 'vegetarian'],
  mood: ['Comfort Food', 'Weekend Special'],

  sourceConsensus: {
    sources: [
      {
        category: 'top-chef-style',
        trustScore: 94,
        tags: ['Technique', 'Flavor Focus'],
      },
      {
        category: 'regional',
        trustScore: 90,
        tags: ['Authentic', 'Cultural'],
      },
      {
        category: 'technique-video',
        trustScore: 88,
        tags: ['Visual', 'Step Clarity'],
      },
      {
        category: 'recipe-database',
        trustScore: 87,
        tags: ['Tested', 'Reliable'],
      },
      {
        category: 'food-science',
        trustScore: 85,
        tags: ['Science', 'Precision'],
      },
    ],
    insights: [
      'Sear paneer well to build a rich, caramelised base.',
      'Cook tomatoes slowly until oil separates for depth.',
      'Cashews add creaminess — grind smooth, not frothy.',
      'Finish with gentle simmer to balance spice and texture.',
      'Crush kasuri methi between palms to wake up its aroma.',
    ],
  },

  ingredients: [
    { id: 'paneer', name: 'Paneer', quantity: '250 g', category: 'main' },
    { id: 'tomato', name: 'Ripe tomatoes', quantity: '4 large (about 500 g)', category: 'main' },
    { id: 'cashew', name: 'Cashew nuts', quantity: '12–14', category: 'main', note: 'Soaked in warm water for 10 mins' },
    { id: 'onion', name: 'Onion', quantity: '1 medium, sliced thin', category: 'aromatic' },
    { id: 'ginger', name: 'Ginger', quantity: '1-inch piece, peeled', category: 'aromatic' },
    { id: 'garlic', name: 'Garlic', quantity: '4 cloves', category: 'aromatic' },
    { id: 'butter', name: 'Butter', quantity: '3 tbsp', category: 'main' },
    { id: 'oil', name: 'Sunflower oil', quantity: '1 tbsp', category: 'main', note: 'Can also use rice bran oil or light groundnut oil' },
    { id: 'cream', name: 'Fresh cream', quantity: '3 tbsp', category: 'finishing', note: 'At room temperature' },
    { id: 'kasuri-methi', name: 'Kasuri methi (dried fenugreek leaves)', quantity: '1 tsp', category: 'finishing' },
    { id: 'red-chilli', name: 'Kashmiri red chilli powder', quantity: '1 tsp', category: 'spice', note: 'Mild and colour-rich' },
    { id: 'turmeric', name: 'Turmeric powder', quantity: '1/4 tsp', category: 'spice' },
    { id: 'coriander-pwd', name: 'Coriander powder', quantity: '1 tsp', category: 'spice' },
    { id: 'garam-masala', name: 'Garam masala', quantity: '1/2 tsp', category: 'spice' },
    { id: 'salt', name: 'Salt', quantity: 'to taste', category: 'spice' },
    { id: 'sugar', name: 'Sugar', quantity: '1/2 tsp', category: 'finishing', note: 'Balances tomato acidity' },
    { id: 'cardamom', name: 'Green cardamom pods', quantity: '2', category: 'spice' },
    { id: 'water', name: 'Hot water', quantity: '1/2 cup', category: 'main' },
  ],

  tools: [
    {
      id: 'kadhai',
      name: 'Kadhai or heavy pan',
      note: 'Use this for searing paneer, sauteing the onions, and simmering the finished gravy.',
    },
    {
      id: 'blender',
      name: 'Blender / mixer',
      note: 'Needed to blend the soaked cashews and tomato base into a smooth tomato-cashew masala.',
    },
    {
      id: 'strainer',
      name: 'Fine strainer',
      note: 'Use after blending so the gravy turns silky and restaurant-style.',
    },
    { id: 'knife', name: "Chef's knife", note: 'For slicing onions, chopping tomatoes, and trimming ginger.' },
    { id: 'board', name: 'Cutting board', note: 'Keep one sturdy board ready for all prep work.' },
    { id: 'spatula', name: 'Wooden spatula', note: 'Best for stirring the masala gently without scraping too harshly.' },
  ],

  miseEnPlace: [
    { id: 'cube-paneer', label: 'Cut paneer into 1-inch cubes', done: true },
    { id: 'slice-onions', label: 'Slice onions thin', done: true },
    { id: 'chop-tomatoes', label: 'Rough-chop tomatoes', done: true },
    { id: 'soak-cashews', label: 'Soak cashews in warm water (10 mins)', done: false },
    { id: 'measure-spices', label: 'Measure spices & keep ready', done: false },
    { id: 'cream-temp', label: 'Keep cream at room temperature', done: false },
    { id: 'blender-ready', label: 'Keep blender ready', done: false },
    { id: 'hot-water', label: 'Keep hot water nearby', done: false },
  ],

  successVariables: [
    {
      id: 'slow-tomato',
      title: 'Slow tomato-cashew reduction',
      detail: 'Cook until oil separates and the base turns deep orange for maximum flavour.',
      icon: 'soup',
    },
    {
      id: 'spice-bloom',
      title: 'Controlled spice blooming',
      detail: 'Wake spices on medium heat to release aroma without burning the masalas.',
      icon: 'flame',
    },
    {
      id: 'paneer-late',
      title: 'Add paneer late',
      detail: 'Add paneer towards the end to keep it soft and prevent it from turning rubbery.',
      icon: 'cuboid',
    },
    {
      id: 'gentle-simmer',
      title: 'Gentle simmer after cream',
      detail: 'Simmer on low heat after adding cream to maintain a silky, smooth texture.',
      icon: 'waves',
    },
    {
      id: 'kasuri-finish',
      title: 'Finish with kasuri methi',
      detail: 'Crush between your palms and add at the end for an authentic aroma.',
      icon: 'leaf',
    },
  ],

  commonMistakes: [
    'Cooking the tomatoes too quickly (raw flavour remains).',
    'Adding cream on high heat (may curdle or separate).',
    'Over-cooking paneer (becomes chewy).',
    'Burning spices when blooming (turns the gravy bitter).',
    'Skipping the strain — gravy ends up grainy, not silky.',
  ],

  // ────────────────── 18 cooking steps ──────────────────
  cookingSteps: [
    {
      index: 1,
      title: 'Soak the cashews',
      instruction: 'Soak cashews in hot water for 10 minutes.',
      beginnerExplanation:
        'Soaking softens the cashews so they grind into a perfectly smooth, silky paste — no gritty bits in your gravy.',
      heat: 'Off',
      durationSec: 600,
      sensoryCues: [
        { type: 'visual', cue: 'Cashews look plumper and slightly lighter in colour' },
        { type: 'texture', cue: 'They feel soft when pressed gently between fingers' },
      ],
      whyThisMatters:
        'A smooth cashew paste is the secret to that restaurant-style velvety gravy.',
      image: STEP_IMG(1),
    },
    {
      index: 2,
      title: 'Lightly sear the paneer (optional)',
      instruction: 'Use a flat pan or the same heavy kadhai. Pan-sear paneer cubes in 1 tsp butter until light golden.',
      beginnerExplanation:
        "Heat a flat pan or the same heavy kadhai on medium heat. Add 1 tsp butter. Brown the paneer for about 30 seconds per side. Do not crowd the pan. Move it to warm water right after - this keeps it soft.",
      heat: 'Medium',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'Edges turn a light golden colour' },
        { type: 'sound', cue: 'You hear a soft sizzle when paneer touches the pan' },
        { type: 'smell', cue: 'A warm, slightly nutty aroma rises' },
      ],
      whyThisMatters:
        'Searing adds a savoury, almost grilled flavour to the paneer that contrasts beautifully with the creamy gravy.',
      foodScience:
        'Heat causes the milk proteins on the paneer surface to brown — this is the Maillard reaction, which creates new layers of flavour.',
      image: STEP_IMG(2),
    },
    {
      index: 3,
      title: 'Sauté the onions',
      instruction: 'In the same kadhai or a fresh heavy pan, add the green cardamom pods first and let them sizzle for 15 seconds before adding the onions. Saute sliced onions in butter and oil until soft and lightly golden.',
      beginnerExplanation:
        'If you seared paneer in the kadhai, use that same pan now. Otherwise start with a clean heavy pan. Heat 2 tbsp butter and 1 tbsp oil over medium heat. Drop in the green cardamom pods and let them sizzle for 15 seconds — you will hear a gentle crackle and smell a sweet, floral warmth. Now add the sliced onions. Stir every 30–40 seconds until they look soft, see-through, and lightly golden at the edges.',
      heat: 'Medium',
      durationSec: 360,
      sensoryCues: [
        { type: 'visual', cue: 'Onions go from white to translucent to light golden edges' },
        { type: 'smell', cue: 'Sharp raw smell fades; a sweet, mellow aroma comes through' },
        { type: 'sound', cue: 'Steady gentle sizzle — never aggressive crackling' },
        { type: 'texture', cue: 'Onions feel soft and limp, not crisp' },
      ],
      whyThisMatters:
        'Cooking onions slowly builds natural sweetness, which is the foundation of a balanced gravy.',
      foodScience:
        'Slow heat breaks down the harsh sulphur compounds in onions and turns their natural sugars sweet.',
      image: STEP_IMG(3),
    },
    {
      index: 4,
      title: 'Add ginger & garlic',
      instruction: 'Add the ginger and garlic to the same pan. Cook for 1 minute, stirring often.',
      beginnerExplanation:
        "Drop in the ginger and garlic. Stir constantly. They cook fast, so don't walk away — when the raw smell turns into a warm, mellow aroma, you're done.",
      heat: 'Medium',
      durationSec: 60,
      sensoryCues: [
        { type: 'smell', cue: 'Sharp raw smell turns into a warm, savoury aroma' },
        { type: 'visual', cue: 'Mixture looks glossy with the butter coating everything' },
      ],
      whyThisMatters:
        'Cooking out the raw bite of ginger and garlic prevents harsh notes in the final gravy.',
      image: STEP_IMG(4),
    },
    {
      index: 5,
      title: 'Add the tomatoes',
      instruction: 'Add chopped tomatoes and a pinch of salt to the same pan. Stir until they soften into the onion base.',
      beginnerExplanation:
        'Add the tomatoes. A small pinch of salt now helps them break down faster. Stir everything together until the tomatoes collapse into the onion base.',
      heat: 'Medium',
      durationSec: 90,
      sensoryCues: [
        { type: 'visual', cue: 'Bright red tomato pieces sit on top of the onion base' },
        { type: 'sound', cue: 'You hear a soft hiss as the tomatoes hit the warm pan' },
      ],
      whyThisMatters:
        'Salt pulls water out of tomatoes, helping them soften and release their natural flavour faster.',
      image: STEP_IMG(5),
    },
    {
      index: 6,
      title: 'Wake up the spices',
      instruction:
        'Lower the heat slightly, then add red chilli powder, turmeric and coriander powder. Stir for 30 seconds.',
      beginnerExplanation:
        "Lower the heat to medium-low before the dry spices go in. Stir constantly so they do not sit in one spot. They cook in just 20–30 seconds. If you smell anything sharp or burnt, lower the heat further and add a splash of water immediately.",
      heat: 'Medium-low',
      durationSec: 30,
      sensoryCues: [
        { type: 'visual', cue: 'Whole mixture turns a rich red-orange colour' },
        { type: 'smell', cue: 'Aromatic, slightly toasty smell — never sharp or smoky' },
      ],
      whyThisMatters:
        'Heat releases the natural oils inside spices, turning their raw, powdery flavour into something rich and rounded.',
      foodScience:
        'Spices hold their aroma in tiny oil pockets. Gentle warm oil opens them up. Too much heat burns them and turns the gravy bitter.',
      image: STEP_IMG(6),
    },
    {
      // ── this is the screenshot reference step ──
      index: 7,
      title: 'Cook the tomato-cashew masala',
      instruction:
        'Cook the tomato base first, then blend it with the soaked cashews into a smooth masala and return it to the pan. Slow cook until it thickens and the oil begins to separate.',
      beginnerExplanation:
        'Lower the heat to medium-low. Let the tomato-onion base cook until the tomatoes fully collapse and lose their raw smell. The soaked cashews are part of this same gravy base - they will be blended with it in the next step. Keep cooking patiently. The mixture should turn thick, glossy, and a deeper red-orange. Tiny oil drops around the edges tell you the base is ready to blend.',
      heat: 'Medium-low',
      durationSec: 510, // 8:30 — matches the 08:32 screenshot
      sensoryCues: [
        { type: 'visual', cue: 'Colour deepens to a rich orange-red' },
        { type: 'smell', cue: 'Raw tomato smell fades; rich, nutty aroma comes through' },
        { type: 'sound', cue: 'Bubbling becomes slower and thicker' },
        { type: 'texture', cue: 'Masala coats the spoon thickly' },
      ],
      whyThisMatters:
        'Slow cooking breaks down the tomatoes and cashews, developing natural sweetness and body. This builds the signature rich, buttery flavour.',
      foodScience:
        'Long, low heat lets water evaporate slowly. Sugars caramelise gently, fats release, and proteins thicken — the four things that turn a thin sauce into a luxurious gravy.',
      image: STEP_IMG(7),
    },
    {
      index: 8,
      title: 'Cool and blend',
      instruction: 'Let the tomato base cool for 5 minutes. Add the soaked cashews, then blend everything in the mixer until completely smooth.',
      beginnerExplanation:
        'Turn off the heat and wait 5 minutes so the blender stays safe. Transfer the cooked tomato base and the soaked cashews to the blender. Blend until you see no specks at all. The mixture should look like a velvety, glossy paste - this is your tomato-cashew masala.',
      heat: 'Off',
      durationSec: 300,
      sensoryCues: [
        { type: 'visual', cue: 'Paste looks glossy and uniform with no chunks or specks' },
        { type: 'sound', cue: 'Blender sound changes from chunky to a smooth steady hum' },
      ],
      whyThisMatters: 'A perfectly smooth base is what makes the final gravy silky and restaurant-style.',
      image: STEP_IMG(8),
    },
    {
      index: 9,
      title: 'Strain the gravy',
      instruction: 'Pass the blended masala through a fine strainer back into the pan.',
      beginnerExplanation:
        'Place a fine strainer over the pan. Pour the blended masala through it. Use the back of a spoon to push it through. Discard the rough bits left behind — these include tomato seeds and skins.',
      heat: 'Off',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'Gravy in the pan looks smooth and uniform — no fibre or seeds' },
        { type: 'texture', cue: 'Strained gravy flows easily off a spoon' },
      ],
      whyThisMatters: 'Straining removes seeds and skins that make the gravy feel grainy on the tongue.',
      image: STEP_IMG(9),
    },
    {
      index: 10,
      title: 'Bring to a gentle simmer',
      instruction:
        'Return the strained gravy to the kadhai, keep the heat low-medium, then stir in the garam masala and 1/4 cup hot water.',
      beginnerExplanation:
        'Return the smooth strained gravy to the kadhai or heavy pan. Keep the heat on low-medium. Stir in the garam masala. Add hot water a little at a time until the gravy reaches a thick but pourable consistency — like warm honey.',
      heat: 'Medium-low',
      durationSec: 180,
      sensoryCues: [
        { type: 'visual', cue: 'Surface shows small lazy bubbles — never a hard boil' },
        { type: 'smell', cue: 'Warm aromatic perfume from the garam masala rises gently' },
      ],
      whyThisMatters: 'A gentle simmer marries the spices into the gravy without bitterness or splatter.',
      image: STEP_IMG(10),
    },
    {
      index: 11,
      title: 'Add the butter',
      instruction: 'Add 2 tbsp butter and let it melt into the gravy.',
      beginnerExplanation:
        'Drop in cold butter, one cube at a time. Swirl the pan gently. Butter melts in slowly and gives the gravy a glossy, restaurant-style shine.',
      heat: 'Low',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Surface looks shiny, almost mirror-like' },
        { type: 'smell', cue: 'A rich, slightly sweet buttery aroma' },
      ],
      whyThisMatters: 'Butter at this stage adds richness and a glossy finish.',
      image: STEP_IMG(11),
    },
    {
      index: 12,
      title: 'Adjust salt and sugar',
      instruction: 'Taste. Add salt and 1/2 tsp sugar. Adjust to balance.',
      beginnerExplanation:
        'Take a small spoonful and taste it. If sharp or tangy, add a pinch of sugar. If flat, add a tiny pinch of salt. Adjust slowly — you can always add more, you cannot remove.',
      heat: 'Low',
      durationSec: 60,
      sensoryCues: [
        { type: 'texture', cue: 'Gravy feels balanced on the tongue — not too sharp, not too flat' },
      ],
      whyThisMatters:
        'A tiny pinch of sugar tames tomato acidity, while salt opens up flavour.',
      image: STEP_IMG(12),
    },
    {
      index: 13,
      title: 'Add the cream',
      instruction: 'Lower the heat fully. Slowly stir in the cream.',
      beginnerExplanation:
        'Make sure the heat is low. Pour cream in slowly while stirring gently in one direction. Never add cream to a boiling gravy — it can split into ugly white flakes.',
      heat: 'Low',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Gravy turns from deep red-orange to a softer salmon-orange' },
        { type: 'texture', cue: 'Surface looks silky and unified — no white streaks' },
      ],
      whyThisMatters:
        'Slow stirring on low heat keeps the cream from breaking, giving you a smooth, silky gravy.',
      foodScience:
        'Cream is fat suspended in water. Sudden high heat shocks the proteins and they clump — gentle heat keeps them suspended.',
      image: STEP_IMG(13),
    },
    {
      index: 14,
      title: 'Add the paneer',
      instruction: 'Keep the heat low. Gently slide the paneer cubes into the gravy.',
      beginnerExplanation:
        'Drop paneer cubes in one by one. Do not stir hard — push them gently with the back of a spoon so they sit in the gravy without breaking.',
      heat: 'Low',
      durationSec: 30,
      sensoryCues: [
        { type: 'visual', cue: 'Paneer cubes look bright white against the orange gravy' },
      ],
      whyThisMatters: 'Adding paneer late keeps it soft and pillowy instead of chewy.',
      image: STEP_IMG(14),
    },
    {
      index: 15,
      title: 'Gentle simmer',
      instruction: 'Simmer for 2–3 minutes so the paneer soaks up the gravy.',
      beginnerExplanation:
        'Let the gravy bubble very gently for 2–3 minutes. The paneer will warm through and absorb the flavours. Move pan off heat the moment you see anything more than tiny bubbles.',
      heat: 'Low',
      durationSec: 150,
      sensoryCues: [
        { type: 'visual', cue: 'Tiny lazy bubbles around the edges of the pan' },
        { type: 'texture', cue: 'Paneer feels soft when pressed gently with a spoon' },
      ],
      whyThisMatters: 'A short, gentle simmer infuses the paneer with the spice and cream notes.',
      image: STEP_IMG(15),
    },
    {
      index: 16,
      title: 'Finish with kasuri methi',
      instruction: 'Crush kasuri methi between your palms and sprinkle it in.',
      beginnerExplanation:
        'Take 1 tsp of kasuri methi. Rub it between your palms over the pan — the warmth from your hands releases its aroma. Sprinkle it evenly over the gravy. Stir gently.',
      heat: 'Low',
      durationSec: 30,
      sensoryCues: [
        { type: 'smell', cue: 'Warm, slightly bitter-sweet aroma blooms across the kitchen' },
        { type: 'visual', cue: 'Tiny green flecks dot the surface of the gravy' },
      ],
      whyThisMatters: 'Crushing wakes up the oils in kasuri methi — this is the signature dhaba-style aroma.',
      image: STEP_IMG(16),
    },
    {
      index: 17,
      title: 'Final taste check',
      instruction: 'Taste again. Adjust salt, sugar or chilli if needed. Add a final knob of butter.',
      beginnerExplanation:
        'Take one more spoonful and taste. Adjust salt and sugar as needed. Add a small knob of butter for a glossy finish. Switch off the heat.',
      heat: 'Low',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Surface looks glossy with a soft sheen of butter' },
        { type: 'texture', cue: 'Gravy thickly coats the back of a spoon' },
      ],
      whyThisMatters: 'A final taste-check is what separates a good dish from a great one.',
      image: STEP_IMG(17),
    },
    {
      index: 18,
      title: 'Plate and serve',
      instruction: 'Transfer to a warm serving bowl. Swirl in cream. Garnish with kasuri methi.',
      beginnerExplanation:
        "Pour the dish into a warm serving bowl. Drizzle a small spiral of cream on top. Sprinkle a tiny pinch of crushed kasuri methi. Serve immediately with hot naan or jeera rice.",
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'A bright white cream swirl sits on a glossy orange gravy' },
        { type: 'smell', cue: 'A buttery, herby, slightly smoky aroma rises from the bowl' },
      ],
      whyThisMatters: 'A clean, intentional plate-up is the chef-style finishing touch.',
      image: STEP_IMG(18),
    },
  ],

  // ────────────────── Rescue / Fix My Dish ──────────────────
  rescueIssues: [
    {
      id: 'too-salty',
      label: 'Too salty',
      icon: 'shaker',
      diagnosis: 'Salt was added too generously, or the gravy reduced more than expected, concentrating the salt.',
      immediateFix: [
        'Add 2 tbsp cream or milk and stir gently.',
        'Add a small peeled potato and simmer for 5 minutes — it absorbs salt. Remove before serving.',
        'A tiny pinch of sugar can balance perceived saltiness.',
      ],
      preventNextTime: [
        'Add salt in small amounts, tasting at each stage.',
        'Salt the tomatoes early and the gravy late.',
      ],
      foodScience:
        'Salt does not evaporate. Dilution with fat or starch is the only real fix once it is in the gravy.',
    },
    {
      id: 'too-spicy',
      label: 'Too spicy',
      icon: 'chilli',
      diagnosis: 'Chilli powder or fresh chilli overwhelmed the gravy.',
      immediateFix: [
        'Stir in 2 tbsp cream or yoghurt.',
        'Add 1 tsp butter and a pinch of sugar.',
        'Squeeze in a few drops of lemon juice to brighten and tame the heat.',
      ],
      preventNextTime: [
        'Use Kashmiri red chilli powder for colour and mild heat.',
        'Add chilli in stages, tasting as you go.',
      ],
      foodScience:
        'Capsaicin (the heat compound) is fat-soluble. Cream, ghee and butter bind it and reduce perceived heat.',
    },
    {
      id: 'too-watery',
      label: 'Too watery',
      icon: 'droplet',
      diagnosis: 'Not enough cooking time, or too much water was added during the gentle simmer.',
      immediateFix: [
        'Simmer uncovered on medium-low for 4–6 minutes.',
        'Stir in 1 tbsp cashew paste or 1 tbsp cream to add body.',
        'A small knob of butter helps thicken and shine the surface.',
      ],
      preventNextTime: [
        'Add hot water slowly, a little at a time.',
        'Always cook the masala until tiny oil drops appear at the edges.',
      ],
      foodScience: 'Slow uncovered cooking lets water evaporate. Fats and starches add structure.',
    },
    {
      id: 'too-sour',
      label: 'Too sour',
      icon: 'lemon',
      diagnosis: 'Tomatoes were too tart, or the gravy lacks balancing sweetness and fat.',
      immediateFix: [
        'Stir in 1/2 tsp sugar and a pinch of salt.',
        'Add 1 tbsp butter or cream.',
      ],
      preventNextTime: [
        'Taste tomatoes before cooking — if sharp, use slightly less.',
        'Always balance with a pinch of sugar at the simmer stage.',
      ],
      foodScience:
        'Sugar dampens our perception of acidity. Fat coats the tongue and softens sharp notes.',
    },
    {
      id: 'raw-masala-taste',
      label: 'Raw masala taste',
      icon: 'spice',
      diagnosis:
        'The spices were added too early or not cooked long enough. This leaves their raw, powdery flavour in the dish.',
      immediateFix: [
        'Add 1–2 tsp oil or ghee.',
        'Add 2 tbsp tomato puree or curd.',
        'Cook on medium heat for 5–7 min, stirring till the raw smell disappears.',
      ],
      preventNextTime: [
        'Sauté spices on medium-low heat till aromatic.',
        'Add a splash of water if they start to stick.',
        'Use fresh spices and grind in small batches for best flavour.',
      ],
      foodScience:
        'Spices contain essential oils that need heat and time to release their aroma. Proper cooking changes their flavour compounds from harsh and raw to rich and balanced.',
    },
    {
      id: 'burnt-smell',
      label: 'Burnt smell',
      icon: 'flame',
      diagnosis: 'The base caught at the bottom of the pan, leaving a smoky aroma.',
      immediateFix: [
        'Stop. Do NOT scrape the burnt bottom.',
        'Transfer the unburnt gravy from the top into a fresh pan.',
        'Add 1 tbsp butter and a pinch of sugar. Simmer gently for 3 minutes.',
      ],
      preventNextTime: [
        'Stir every 30–40 seconds when the gravy is thick.',
        'Use a heavy-bottomed pan.',
        'Lower heat if you hear sharp crackling.',
      ],
      foodScience:
        'Burnt sugars produce acrid compounds that bleed into the rest of the gravy. Once they spread, the only fix is dilution and balancing.',
    },
    {
      id: 'gravy-split',
      label: 'Gravy split',
      icon: 'split',
      diagnosis: 'Cream or curd was added on high heat, causing the fat to separate.',
      immediateFix: [
        'Lower heat to the lowest setting.',
        'Add 1 tbsp warm cream and whisk gently in a circular motion.',
        'A pinch of cornflour mixed in 1 tsp water can help re-bind.',
      ],
      preventNextTime: [
        'Always bring cream to room temperature before adding.',
        'Reduce flame before adding cream or curd.',
        'Stir gently in one direction.',
      ],
      foodScience:
        'Dairy proteins clump at high heat. Lower temperatures and gentle motion keep the emulsion stable.',
    },
    {
      id: 'paneer-rubbery',
      label: 'Paneer rubbery',
      icon: 'cuboid',
      diagnosis: 'Paneer was cooked too long or at too high a temperature.',
      immediateFix: [
        'Move paneer to a bowl of warm (not hot) water for 5 minutes.',
        'Strain and return to the gravy off the heat.',
      ],
      preventNextTime: [
        'Add paneer towards the end of cooking.',
        'Sear briefly on medium, not high heat.',
      ],
      foodScience:
        'High heat tightens paneer proteins, squeezing out moisture and turning it chewy. Warm water gently relaxes them.',
    },
    {
      id: 'flat-taste',
      label: 'Flat taste',
      icon: 'mortar',
      diagnosis: 'The dish lacks balancing brightness, finish, or salt.',
      immediateFix: [
        'Add 1/4 tsp salt and a pinch of sugar.',
        'Crush 1/2 tsp kasuri methi between palms and sprinkle in.',
        'A few drops of lemon juice or 1 tsp cream can wake everything up.',
      ],
      preventNextTime: [
        'Always finish with kasuri methi and butter.',
        'Taste before serving and adjust seasoning.',
      ],
      foodScience:
        'Salt, fat, acid and aroma compounds amplify our taste perception. Missing any one makes a dish feel flat.',
    },
  ],

  // ────────────────── Taste balance ──────────────────
  tasteBalancing: [
    { axis: 'salt', value: 85 },
    { axis: 'acid', value: 75 },
    { axis: 'richness', value: 90 },
    { axis: 'heat', value: 70 },
    { axis: 'aroma', value: 88 },
  ],

  finishingTouches: [
    {
      id: 'butter-knob',
      label: 'Add a knob of butter',
      reason: 'Enhances richness & brings it all together.',
      icon: 'butter',
      optional: false,
    },
    {
      id: 'crush-kasuri',
      label: 'Crush kasuri methi',
      reason: 'Adds a warm, aromatic finish.',
      icon: 'leaf',
      optional: false,
    },
    {
      id: 'adjust-salt',
      label: 'Adjust salt',
      reason: 'A tiny pinch can perfect the balance.',
      icon: 'shaker',
      optional: false,
    },
    {
      id: 'cream-swirl',
      label: 'Add cream swirl',
      reason: 'For a restaurant-style silky finish.',
      icon: 'cream',
      optional: false,
    },
    {
      id: 'chilli-oil',
      label: 'Drizzle chilli oil',
      reason: 'For a hint of spice & shine.',
      icon: 'chilli-oil',
      optional: true,
    },
  ],

  plating: {
    notes: [
      'Garnish with cream & kasuri methi.',
      'Best served hot with naan or jeera rice.',
    ],
    serves: 'Serves 2–3 people',
  },

  storage:
    'Cool to room temperature within an hour. Store in an airtight container in the fridge for up to 2 days. The paneer firms up slightly when chilled — that is normal.',
  reheating:
    'Reheat gently on low heat. Add 1–2 tbsp water or milk and stir. Avoid the microwave on high — it can toughen the paneer. If reheating in a microwave, use medium power in short bursts.',

  /**
   * Content-level translations for the demo flow. Each key is a
   * short stable token referenced by component code. Hindi and
   * Telugu samples cover the most-visible strings; the full set
   * lands in Phase 4.
   */
  translations: {
    hi: {
      'dish.name': 'पनीर बटर मसाला',
      'dish.summary':
        'एक समृद्ध, मलाईदार और बेहद संतुलित उत्तर भारतीय क्लासिक। मखमली टमाटर-काजू ग्रेवी में नर्म पनीर के टुकड़े और ख़ुशबूदार मसाले।',
      'step.7.title': 'टमाटर-काजू मसाला पकाएँ',
      'step.7.instruction':
        'मसाला तब तक धीमी आँच पर पकाएँ जब तक गाढ़ा हो जाए और किनारों पर तेल अलग होने लगे।',
      'step.7.why':
        'धीमी पकाई से टमाटर और काजू अपनी मिठास और गाढ़ापन छोड़ते हैं — यही ख़ास मलाईदार स्वाद बनता है।',
    },
    te: {
      'dish.name': 'పనీర్ బటర్ మసాలా',
      'dish.summary':
        'సంపన్నమైన, క్రీమీ, పూర్తిగా సమతుల్యంగా ఉన్న ఉత్తర భారత క్లాసిక్. మెత్తని టమాటో-జీడిపప్పు గ్రేవీలో పనీర్ ముక్కలు, సుగంధ మసాలాలు, వెన్న.',
      'step.7.title': 'టమాటో-జీడిపప్పు మసాలాని ఉడకబెట్టండి',
      'step.7.instruction':
        'మసాలా గట్టిపడి అంచుల వద్ద నూనె వేరయ్యే వరకు మెల్లమెల్లగా ఉడకబెట్టండి.',
      'step.7.why':
        'మెల్లగా ఉడకబెట్టడం వల్ల టమాటో, జీడిపప్పు తమ సహజ తీపిని, మందాన్ని విడుదల చేస్తాయి — అదే వెన్నలాంటి రుచిని తీసుకొస్తుంది.',
    },
  },
};
