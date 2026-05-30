/**
 * ChefSense AI — Dhaba Style Dal Tadka (full guided flow)
 *
 * House style:
 *   - Plain, friendly chef voice. No jargon.
 *   - Each step paints what you SEE / SMELL / HEAR / FEEL.
 *   - Short sentences. One idea each.
 *
 * No real chef names, no publication names. Anonymous source categories.
 */

import type { Dish } from '../types';

const STEP_IMG = (n: number) => `/images/dishes/dal-tadka/step-${n}.jpg`;

export const dalTadka: Dish = {
  dishId: 'dal-tadka',
  dishName: 'Dhaba Style Dal Tadka',
  cuisine: 'Indian',
  region: 'North Indian',
  difficulty: 'Easy',
  totalTimeMin: 60,
  prepTimeMin: 20,
  cookTimeMin: 40,
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
      'Soak the dal — it cooks faster, smoother, and more digestible.',
      'A spoon of chana dal alongside toor dal builds body and depth.',
      'Cook the masala base until ghee separates before adding the dal.',
      'Finish with a second smoking-hot tempering at the table for the dhaba aroma.',
      'A pinch of asafoetida deepens the savoury notes and helps digestion.',
    ],
  },

  ingredients: [
    { id: 'toor-dal', name: 'Toor dal (split pigeon peas)', quantity: '3/4 cup', category: 'main' },
    { id: 'chana-dal', name: 'Chana dal (split chickpeas)', quantity: '2 tbsp', category: 'main', note: 'Adds body and a nutty depth' },
    { id: 'turmeric', name: 'Turmeric powder', quantity: '1/2 tsp', category: 'spice' },
    { id: 'salt', name: 'Salt', quantity: 'to taste', category: 'spice' },
    { id: 'ginger', name: 'Ginger', quantity: '1-inch piece', category: 'aromatic', note: 'Half goes into the cooker, half into the masala base' },
    { id: 'onion', name: 'Onion', quantity: '1 medium, finely chopped', category: 'aromatic' },
    { id: 'tomato', name: 'Tomatoes', quantity: '2 medium, finely chopped', category: 'main' },
    { id: 'garlic', name: 'Garlic cloves', quantity: '6 (4 minced + 2 crushed for tadka)', category: 'aromatic' },
    { id: 'green-chilli', name: 'Green chillies', quantity: '2, slit', category: 'spice' },
    { id: 'red-chilli-whole', name: 'Dried red chillies', quantity: '3 (2 for base + 1 for tadka)', category: 'spice' },
    { id: 'cumin', name: 'Cumin seeds', quantity: '1.5 tsp (1 tsp base + 1/2 tsp tadka)', category: 'spice' },
    { id: 'red-chilli-pwd', name: 'Red chilli powder', quantity: '1 tsp', category: 'spice' },
    { id: 'kashmiri-chilli', name: 'Kashmiri red chilli powder', quantity: '1/2 tsp', category: 'spice', note: 'For colour in the final tadka' },
    { id: 'coriander-pwd', name: 'Coriander powder', quantity: '1 tsp', category: 'spice' },
    { id: 'garam-masala', name: 'Garam masala', quantity: '1/4 tsp', category: 'spice' },
    { id: 'hing', name: 'Asafoetida (hing)', quantity: '2 pinches', category: 'spice' },
    { id: 'ghee', name: 'Ghee', quantity: '3 tbsp (2 tbsp base + 1 tbsp tadka)', category: 'main' },
    { id: 'oil', name: 'Neutral oil', quantity: '1 tbsp', category: 'main' },
    { id: 'kasuri-methi', name: 'Kasuri methi (dried fenugreek leaves)', quantity: '1 tsp', category: 'finishing' },
    { id: 'lemon', name: 'Lemon', quantity: '1/2, for juice', category: 'finishing' },
    { id: 'coriander', name: 'Fresh coriander leaves', quantity: '2 tbsp, chopped', category: 'finishing' },
    { id: 'cream', name: 'Fresh cream', quantity: '1 tbsp', category: 'finishing', note: 'Optional drizzle' },
    { id: 'water', name: 'Hot water', quantity: '3 cups + extra to adjust', category: 'main' },
  ],

  tools: [
    { id: 'pressure-cooker', name: 'Pressure cooker', note: 'For cooking the dal quickly and evenly.' },
    { id: 'kadhai', name: 'Kadhai or heavy pan', note: 'Holds heat well for building the masala base and simmering the dal.' },
    { id: 'tadka-pan', name: 'Small tadka pan', note: 'A tiny iron or steel pan that gets the ghee very hot fast.' },
    { id: 'whisk', name: 'Whisk or dal masher', note: 'For mashing the cooked dal into a creamy texture.' },
    { id: 'knife', name: "Chef's knife", note: 'For chopping onion, tomato, ginger and chillies.' },
    { id: 'board', name: 'Cutting board' },
    { id: 'spatula', name: 'Wooden spatula' },
  ],

  miseEnPlace: [
    { id: 'rinse-dal', label: 'Rinse toor + chana dal until water runs almost clear', done: false },
    { id: 'soak-dal', label: 'Soak dal in warm water for 15–20 mins', done: false },
    { id: 'chop-onion', label: 'Finely chop the onion', done: false },
    { id: 'chop-tomato', label: 'Finely chop the tomatoes', done: false },
    { id: 'mince-ginger-garlic', label: 'Mince ginger + 4 garlic cloves', done: false },
    { id: 'crush-tadka-garlic', label: 'Crush 2 garlic cloves with skin on for the final tadka', done: false },
    { id: 'slit-chillies', label: 'Slit green chillies lengthwise', done: false },
    { id: 'measure-spices', label: 'Measure dry spices into a small bowl', done: false },
    { id: 'hot-water-ready', label: 'Keep a kettle of hot water on standby', done: false },
    { id: 'chop-coriander', label: 'Chop fresh coriander for garnish', done: false },
  ],

  successVariables: [
    {
      id: 'soft-dal',
      title: 'Fully softened dal',
      detail: 'Each grain should mash into paste between two fingers — no chalky core left.',
      icon: 'soup',
    },
    {
      id: 'creamy-mash',
      title: 'Whisked, creamy body',
      detail: 'A short whisk after cooking turns plain dal silky without a drop of cream.',
      icon: 'waves',
    },
    {
      id: 'tomato-break',
      title: 'Tomatoes broken down till ghee separates',
      detail: 'Cook the masala patiently until tiny ghee dots appear at the edges — that is when the base is ready.',
      icon: 'flame',
    },
    {
      id: 'smoking-tadka',
      title: 'Smoking hot final tempering',
      detail: 'The ghee for the second tadka must be just about to smoke — that is what gives the dhaba aroma.',
      icon: 'flame',
    },
    {
      id: 'rest-after-tadka',
      title: 'Cover after the tadka pour',
      detail: 'Lidding the pot for 30 seconds traps the aromatic oils inside the dal.',
      icon: 'leaf',
    },
  ],

  commonMistakes: [
    'Under-cooking the dal so the grains still feel gritty.',
    'Adding tomatoes before the onions are properly golden (gravy stays raw).',
    'Burning the dry spices on high heat (turns the dal bitter).',
    'Cold or barely-warm ghee for the tadka (spices stay flat).',
    'Skipping the asafoetida (loses the signature savoury depth).',
    'Adding lemon while the dal is still on a hard boil (kills the brightness).',
  ],

  cookingSteps: [
    {
      index: 1,
      title: 'Rinse and soak the dal',
      instruction: 'Combine toor and chana dal in a bowl. Rinse 3–4 times, then soak in warm water.',
      beginnerExplanation:
        'Tip both dals into a bowl. Rub the grains gently between your fingers under running water. Keep changing the water until it looks almost clear — this washes away dust and surface starch. Now cover with warm water by an inch and let it sit. Soaked dal cooks faster, mashes smoother, and is gentler on the stomach.',
      heat: 'Off',
      durationSec: 1080,
      sensoryCues: [
        { type: 'visual', cue: 'Soak water turns from cloudy white to almost clear' },
        { type: 'texture', cue: 'Grains feel plump and slightly soft when pressed' },
      ],
      whyThisMatters:
        'Clean, soaked dal is the difference between a smooth, silky bowl and a gritty one.',
      foodScience:
        'Soaking hydrates the starch granules inside each grain so they swell evenly during cooking instead of leaving hard cores.',
      image: STEP_IMG(1),
    },
    {
      index: 2,
      title: 'Pressure cook the dal',
      instruction: 'Drain dal. Add to cooker with 3 cups water, turmeric, salt, half the ginger and a splash of oil. Cook for 4–5 whistles then let the pressure release naturally — this takes another 12–15 minutes. Do not open the lid early.',
      beginnerExplanation:
        'Drain the soaked dal and tip it into the pressure cooker. Add 3 cups of fresh water, the turmeric, a generous pinch of salt, half the minced ginger and a few drops of oil so the foam stays in check. Lock the lid. Cook on medium heat for 4–5 whistles, then turn off and let the pressure release on its own — this natural release takes another 12–15 minutes. Do not open the lid early; forcing it open cuts the cook short and leaves the grains gritty. No cooker? Simmer covered with 4 cups water for 35–40 minutes.',
      heat: 'Medium',
      durationSec: 2100,
      sensoryCues: [
        { type: 'sound', cue: 'Whistles space out evenly, about every 90 seconds' },
        { type: 'smell', cue: 'Warm, earthy turmeric-and-lentil aroma rises from the vent' },
        { type: 'visual', cue: 'Dal looks pale gold and almost shapeless when opened' },
      ],
      whyThisMatters:
        'Properly cooked dal is the foundation. Anything done later cannot fix gritty grains.',
      foodScience:
        'Pressure raises water boiling point above 100 °C, which collapses the lentil cell walls quickly and uniformly.',
      image: STEP_IMG(2),
    },
    {
      index: 3,
      title: 'Whisk the dal creamy',
      instruction: 'Open the cooker. Whisk or mash the dal until smooth and pourable.',
      beginnerExplanation:
        'Once the pressure drops naturally, open the lid. Take a whisk or a dal masher and beat the dal for about a minute. You are not making it watery — you are breaking the grains so the dal turns silky on its own. If it looks too thick, splash in a little hot water. Set aside; we will come back to it.',
      heat: 'Off',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'Dal turns from grainy yellow to a smooth, glossy custard-like pool' },
        { type: 'texture', cue: 'Drops off the whisk in slow, even ribbons' },
      ],
      whyThisMatters:
        'Whisking gives the dal natural creaminess — no cream needed.',
      image: STEP_IMG(3),
    },
    {
      index: 4,
      title: 'Heat ghee and oil',
      instruction: 'In a kadhai, heat 2 tbsp ghee with 1 tbsp oil over medium heat.',
      beginnerExplanation:
        'Set the kadhai on medium heat. Add the ghee and oil together — ghee gives flavour, the oil raises the smoke point so nothing burns. Swirl the pan so the fat coats the base. Wait until the surface shimmers and a tiny test pinch of cumin sizzles on contact.',
      heat: 'Medium',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'Surface looks glossy and shimmers when tilted' },
        { type: 'sound', cue: 'A dropped cumin seed sizzles within a second' },
      ],
      whyThisMatters:
        'Properly warmed fat is what lets every spice that follows release its aroma instantly.',
      image: STEP_IMG(4),
    },
    {
      index: 5,
      title: 'Bloom cumin and dried chillies',
      instruction: 'Add 1 tsp cumin seeds and 2 broken dried red chillies. Let them crackle.',
      beginnerExplanation:
        'Tip in the cumin first — it should sizzle and dance straight away. Break two dried red chillies in half and drop them in. Stir for a few seconds. The kitchen should smell warm and nutty. If it smells sharp or smoky, your heat is too high — pull the pan off for a couple of seconds.',
      heat: 'Medium',
      durationSec: 60,
      sensoryCues: [
        { type: 'sound', cue: 'A lively crackle as cumin pops in the fat' },
        { type: 'smell', cue: 'Warm, toasty, slightly smoky chilli aroma' },
        { type: 'visual', cue: 'Cumin darkens by a shade; chillies puff and turn a deeper red' },
      ],
      whyThisMatters:
        'Blooming wakes the essential oils in whole spices — this is the flavour spine of the dish.',
      foodScience:
        'Whole spices hold flavour in tiny oil capsules. Hot fat dissolves these oils so they spread evenly through the food.',
      image: STEP_IMG(5),
    },
    {
      index: 6,
      title: 'Add hing and onions',
      instruction: 'Add a pinch of asafoetida, then the chopped onion. Saute until golden.',
      beginnerExplanation:
        'Add a pinch of asafoetida first — it lasts only a few seconds in hot ghee, so do not delay the onions. Tip the onions in straight away. Spread them out and stir every 30–40 seconds. You want them past translucent, all the way to a soft golden brown around the edges. Patience here builds the sweetness of the whole dal.',
      heat: 'Medium',
      durationSec: 300,
      sensoryCues: [
        { type: 'visual', cue: 'Onions go from white to translucent to a soft golden brown' },
        { type: 'smell', cue: 'Sharp raw note disappears; a sweet, mellow aroma replaces it' },
        { type: 'sound', cue: 'Steady gentle sizzle, never a frantic crackle' },
      ],
      whyThisMatters:
        'Golden onions are the natural sweetness in the masala base — under-cook them and the dal tastes thin.',
      image: STEP_IMG(6),
    },
    {
      index: 7,
      title: 'Add ginger-garlic',
      instruction: 'Stir in the remaining minced ginger and 4 minced garlic cloves. Cook till raw smell goes.',
      beginnerExplanation:
        'Push the onions to one side and drop the minced ginger and garlic into the hot fat. They cook fast, so keep stirring. In about a minute the sharp raw smell flips into a warm, savoury one. That is your cue to move on.',
      heat: 'Medium',
      durationSec: 120,
      sensoryCues: [
        { type: 'smell', cue: 'Raw bite gives way to a warm, mellow savoury aroma' },
        { type: 'visual', cue: 'Garlic looks pale gold, never dark brown' },
      ],
      whyThisMatters:
        'Raw garlic carries a harsh edge that lingers in the dal. Cooking it briefly takes that edge off.',
      image: STEP_IMG(7),
    },
    {
      index: 8,
      title: 'Cook down the tomatoes',
      instruction: 'Add chopped tomatoes, slit green chillies and a pinch of salt. Cook until ghee separates.',
      beginnerExplanation:
        'Add the tomatoes, the slit green chillies and a small pinch of salt. The salt pulls water out of the tomatoes so they break down faster. Stir every minute. Cover for two minutes if they are stubborn. You are looking for a thick jammy mass with shiny ghee dots gathering at the edges — that is your signal the base is ready.',
      heat: 'Medium',
      durationSec: 360,
      sensoryCues: [
        { type: 'visual', cue: 'Tomatoes collapse into a deep red-orange paste with tiny ghee dots at the edges' },
        { type: 'smell', cue: 'Fresh tomato smell turns into a deeper, almost roasted aroma' },
        { type: 'texture', cue: 'Mixture pulls together and leaves a clear streak when stirred' },
      ],
      whyThisMatters:
        'Ghee separating is the universal sign in Indian cooking that the masala base is fully cooked.',
      foodScience:
        'As water evaporates, fat that was emulsified into the tomato pulp pools back to the surface — visible proof of a finished base.',
      image: STEP_IMG(8),
    },
    {
      index: 9,
      title: 'Bhuno the dry spices',
      instruction: 'Lower heat. Add red chilli powder, coriander powder, garam masala and a splash of water.',
      beginnerExplanation:
        'Pull the heat down to medium-low. Sprinkle in the red chilli powder, coriander powder and garam masala. Splash in two tablespoons of water straight away — this stops the spices from scorching and lets them cook gently. Stir for about 90 seconds until the mixture looks glossy and smells round and warm.',
      heat: 'Medium-low',
      durationSec: 90,
      sensoryCues: [
        { type: 'visual', cue: 'Masala turns a deep brick red and looks glossy' },
        { type: 'smell', cue: 'Aromatic and toasty — never sharp or smoky' },
      ],
      whyThisMatters:
        'Briefly cooking ground spices in fat (with a splash of water as insurance) is what tames their raw, powdery taste.',
      foodScience:
        'A little water lowers the local temperature around the spices so their oils release without burning the dry powders.',
      image: STEP_IMG(9),
    },
    {
      index: 10,
      title: 'Pour in the dal',
      instruction: 'Add the whisked dal to the masala base. Rinse the cooker with 1/2 cup hot water and add that too.',
      beginnerExplanation:
        'Pour the whisked dal straight into the masala. Use half a cup of hot water to swirl out anything stuck in the cooker and add that in too — no flavour left behind. Stir well so the masala melts into the dal. Adjust thickness with more hot water; you want a pourable, slightly thick consistency.',
      heat: 'Medium',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Pale yellow dal turns into a warm orange-yellow as the masala blends in' },
        { type: 'sound', cue: 'A gentle hiss as the cool dal meets the hot pan' },
      ],
      whyThisMatters:
        'Rinsing the cooker captures every drop of flavour and helps you dial in the right consistency.',
      image: STEP_IMG(10),
    },
    {
      index: 11,
      title: 'Simmer covered',
      instruction: 'Partially cover. Simmer on low for 5 minutes so flavours marry.',
      beginnerExplanation:
        'Drop the heat to low. Set the lid on the pan but leave a small gap so steam can escape. Let the dal bubble lazily for five minutes. Give it a stir halfway through — the bottom can catch quickly because of the tomato. This short rest is when the dal stops tasting like two separate things and starts tasting like one dish.',
      heat: 'Low',
      durationSec: 300,
      sensoryCues: [
        { type: 'visual', cue: 'Small lazy bubbles pop across the surface — never a hard rolling boil' },
        { type: 'smell', cue: 'Aroma becomes layered and rounded, all the spices in harmony' },
      ],
      whyThisMatters:
        'A short, gentle simmer is what turns a mix of ingredients into a finished dal.',
      image: STEP_IMG(11),
    },
    {
      index: 12,
      title: 'Taste and balance',
      instruction: 'Taste a spoonful. Adjust salt, add a squeeze of lemon, and chilli if needed.',
      beginnerExplanation:
        'Take a spoonful, blow on it, and taste. If it feels flat, add a pinch of salt. If it tastes heavy, squeeze in a few drops of lemon juice. If you want more kick, a tiny pinch of red chilli powder. Adjust small — you can always add more. Pull the dal off the heat and keep it covered while you build the final tadka.',
      heat: 'Low',
      durationSec: 60,
      sensoryCues: [
        { type: 'texture', cue: 'Dal feels rounded on the tongue — salty, slightly tangy, gently warm' },
      ],
      whyThisMatters:
        'A final taste check is the difference between a fine dal and a memorable one.',
      image: STEP_IMG(12),
    },
    {
      index: 13,
      title: 'Build the smoking tadka',
      instruction: 'In a tadka pan, heat 1 tbsp ghee until nearly smoking. Add cumin, 1 broken red chilli, crushed garlic.',
      beginnerExplanation:
        'Set the tadka pan on high heat. Add a tablespoon of ghee. Let it heat until it just about starts to shimmer with the lightest wisp of smoke. Drop in the cumin — it should crackle aggressively. Within seconds add the crushed garlic (skin on, that is the dhaba secret) and the broken dried red chilli. Cook for about 20 seconds until the garlic is golden at the edges.',
      heat: 'High',
      durationSec: 90,
      sensoryCues: [
        { type: 'sound', cue: 'Loud, sharp crackle the second cumin hits the ghee' },
        { type: 'visual', cue: 'Garlic skin goes from white to a freckled gold-brown' },
        { type: 'smell', cue: 'Sharp, almost smoky aroma fills the kitchen' },
      ],
      whyThisMatters:
        'A second, very hot tempering is what makes a dal taste dhaba-style. The smoke and crackle are the signature.',
      foodScience:
        'Near-smoking ghee extracts aromatic compounds from cumin and garlic that simply do not release at lower temperatures.',
      image: STEP_IMG(13),
    },
    {
      index: 14,
      title: 'Finish off heat with Kashmiri chilli',
      instruction: 'Take the pan off the flame. Stir in 1/2 tsp Kashmiri chilli powder and a pinch of asafoetida.',
      beginnerExplanation:
        'Move the tadka pan off the heat. Sprinkle in the Kashmiri chilli powder and a pinch of asafoetida. The residual heat is enough — the chilli will bloom into a beautiful deep red without burning. Swirl the pan once. Now pour the entire sizzling tadka straight over the dal. Cover the dal pot with a lid for 30 seconds to lock the aroma in.',
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Ghee turns a vivid sunset red the instant the chilli hits it' },
        { type: 'sound', cue: 'Loud sizzle when the hot tadka pours into the cooler dal' },
        { type: 'smell', cue: 'An aromatic cloud rises — the dhaba signature' },
      ],
      whyThisMatters:
        'Adding chilli powder off the heat keeps the colour bright red instead of burnt brown.',
      foodScience:
        'Kashmiri chilli is rich in capsanthin, a heat-sensitive red pigment. Off-heat blooming preserves it.',
      image: STEP_IMG(14),
    },
    {
      index: 15,
      title: 'Garnish and serve',
      instruction: 'Crush kasuri methi, sprinkle coriander, drizzle cream. Serve hot with rice or roti.',
      beginnerExplanation:
        'Lift the lid. Crush the kasuri methi between your palms over the pan so the warmth from your hands releases its scent. Scatter the chopped coriander. Drizzle a spoon of cream in a slow spiral if you like. Ladle the dal into warm bowls and serve straight away with hot jeera rice, plain steamed rice or soft phulkas.',
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'A red ribbon of tadka oil floats on top of golden dal, dotted with green coriander' },
        { type: 'smell', cue: 'Smoky ghee, sweet kasuri methi and fresh coriander all rise together' },
      ],
      whyThisMatters:
        'A dal eaten the moment it is tempered tastes twice as alive as one that sits.',
      image: STEP_IMG(15),
    },
  ],

  rescueIssues: [
    {
      id: 'undercooked-dal',
      label: 'Dal still gritty',
      icon: 'soup',
      diagnosis: 'The dal grains did not cook through — you can feel a chalky core when pressed between fingers.',
      immediateFix: [
        'Add 1/2 cup hot water back to the dal.',
        'Pressure cook for 2 more whistles, or simmer covered for 10–12 minutes.',
        'Whisk again once soft to recover creaminess.',
      ],
      preventNextTime: [
        'Soak the dal for a full 15–20 minutes — older dal needs longer.',
        'Skip adding tomato or acid into the cooker; acid stops lentils from softening.',
        'Make sure water fully covers the dal by at least 2 inches.',
      ],
      foodScience:
        'Acid (from tomatoes or lemon) and hard water both interfere with how lentil starches absorb water. Soft water and a neutral cooker make for fully tender dal.',
    },
    {
      id: 'too-thick',
      label: 'Too thick / pasty',
      icon: 'droplet',
      diagnosis: 'The dal reduced too much, or absorbed extra water as it sat.',
      immediateFix: [
        'Add hot water 2 tablespoons at a time, whisking after each addition.',
        'Bring to a gentle simmer for 1 minute to re-blend.',
        'Re-check salt — diluting the dal also dilutes the seasoning.',
      ],
      preventNextTime: [
        'Aim for pourable, not gloopy, consistency before the final tadka.',
        'Remember that dal thickens as it cools — keep it a touch looser on the stove.',
      ],
      foodScience:
        'Cooked lentil starch keeps swelling and absorbing water as it cools, which is why a perfect-looking dal turns pasty if it sits.',
    },
    {
      id: 'too-watery',
      label: 'Too watery / thin',
      icon: 'waves',
      diagnosis: 'Too much water in the cooker, or not enough simmering time.',
      immediateFix: [
        'Simmer uncovered on medium-low for 5–7 minutes.',
        'Whisk vigorously for 30 seconds to release more starch from the grains.',
        'Mash a small ladle of dal against the side of the pan and stir it back in.',
      ],
      preventNextTime: [
        'Stick to a 1:3 dal-to-water ratio in the cooker.',
        'Add water in small amounts when adjusting — you can always add more.',
      ],
      foodScience:
        'Lentil starch granules thicken the dal as they burst. Open-pan simmering and a quick whisk both help break them.',
    },
    {
      id: 'burnt-tadka',
      label: 'Burnt tadka',
      icon: 'flame',
      diagnosis: 'The ghee got too hot, or the chilli powder went into still-flaming fat — leaves an acrid, smoky taste.',
      immediateFix: [
        'Stop. Discard the burnt tadka — do not pour it into the dal.',
        'Wipe out the tadka pan, start a fresh tempering with 1 tbsp ghee.',
        'Heat ghee on medium this time, add cumin, then garlic, then take off heat before adding chilli powder.',
      ],
      preventNextTime: [
        'Always add chilli powder off the heat for the colour-tadka.',
        'Crush the garlic — whole cloves bring water and slow scorching down.',
        'Keep a small bowl of cold ghee nearby to drop in if things get too hot.',
      ],
      foodScience:
        'Burnt spices release acrid compounds (acrolein, furans) that bleed into the rest of the dish. They cannot be cooked out — only diluted.',
    },
    {
      id: 'too-salty',
      label: 'Too salty',
      icon: 'shaker',
      diagnosis: 'Salt was added in too many stages, or the dal reduced more than expected and concentrated the seasoning.',
      immediateFix: [
        'Stir in 1/2 cup unsalted hot water and bring back to a gentle simmer.',
        'Add 1 tsp ghee and a small squeeze of lemon to round out the saltiness.',
        'Float a peeled raw potato in the dal for 5 minutes, then remove — it absorbs salt.',
      ],
      preventNextTime: [
        'Salt once in the cooker and only adjust at the very end.',
        'Taste after every addition of seasoning — never trust the spoon you have not tasted.',
      ],
      foodScience:
        'Salt does not evaporate; it can only be diluted, absorbed, or balanced. Acid and fat both reduce how strongly we perceive saltiness.',
    },
  ],

  tasteBalancing: [
    { axis: 'salt', value: 80 },
    { axis: 'acid', value: 60 },
    { axis: 'richness', value: 75 },
    { axis: 'heat', value: 50 },
    { axis: 'aroma', value: 92 },
  ],

  finishingTouches: [
    { id: 'kasuri-methi', label: 'Crush kasuri methi', reason: 'Adds the dhaba-style aromatic finish.', icon: 'leaf', optional: false },
    { id: 'coriander', label: 'Fresh coriander', reason: 'Brightness and a fresh green pop.', icon: 'leaf', optional: false },
    { id: 'lemon', label: 'Squeeze of lemon', reason: 'Lifts the whole dish, balances richness.', icon: 'lemon', optional: false },
    { id: 'ghee-drizzle', label: 'Final ghee drizzle', reason: 'A spoon of warm ghee adds gloss and depth.', icon: 'butter', optional: true },
    { id: 'cream-swirl', label: 'Cream swirl', reason: 'Optional richness for a restaurant-style look.', icon: 'cream', optional: true },
  ],

  plating: {
    notes: [
      'Serve in a warm bowl so the dal stays piping hot.',
      'Top with the tadka oil floating in a red ribbon for the dhaba look.',
      'Pair with steamed basmati, jeera rice or hot phulkas, plus a wedge of lemon and sliced onion on the side.',
    ],
    serves: 'Serves 3–4 people',
  },
  storage: 'Cool to room temperature, then refrigerate in an airtight container for up to 3 days. The dal will thicken as it sits.',
  reheating: 'Reheat gently on low with a splash of hot water and a stir. For best flavour, prepare a fresh tadka with 1 tsp ghee, cumin and a pinch of chilli powder, and pour it over just before serving.',

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
