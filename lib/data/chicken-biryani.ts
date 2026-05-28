/**
 * ChefSense AI — Hyderabadi Chicken Biryani (pakki / layered method)
 *
 * ───── BEGINNER-LANGUAGE RULE ─────
 * All instruction copy in this file follows the house style:
 *   - Avoid jargon. If used, define inline in plain words.
 *   - Describe what to SEE / SMELL / HEAR / TOUCH at each step.
 *   - One small idea per sentence. Short sentences win.
 *
 * Food-safety reminder: chicken must reach an internal
 * temperature of 75 °C / 165 °F before serving.
 *
 * ───── SOURCE RULE ─────
 * No real chef names. No real publication names. Anonymous
 * source categories only — see lib/source-policy.ts.
 */

import type { Dish } from '../types';

const STEP_IMG = (n: number) =>
  `/images/dishes/chicken-biryani/step-${n}.jpg`;

export const chickenBiryani: Dish = {
  dishId: 'chicken-biryani',
  dishName: 'Hyderabadi Chicken Biryani',
  cuisine: 'Indian',
  region: 'Hyderabadi',
  difficulty: 'Hard',
  totalTimeMin: 105,
  prepTimeMin: 45,
  cookTimeMin: 55,
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
      'Fry the onions slow and deep — birista is the soul of biryani.',
      'Parboil rice to 70%. It finishes during dum.',
      'The dum (steaming) step is non-negotiable for layered flavour.',
    ],
  },

  ingredients: [
    { id: 'chicken', name: 'Chicken pieces, bone-in', quantity: '500 g', category: 'main', note: 'Cook until internal temperature reaches 75 °C / 165 °F.' },
    { id: 'basmati', name: 'Aged basmati rice', quantity: '2 cups (about 400 g)', category: 'main', note: 'Soak for 30 minutes in cold water.' },
    { id: 'yogurt', name: 'Thick yogurt', quantity: '1/2 cup', category: 'main', note: 'Hung curd or thick Greek-style works best.' },
    { id: 'onion', name: 'Large onions, thinly sliced', quantity: '2 large', category: 'aromatic', note: 'For deep-fried birista.' },
    { id: 'ginger-garlic', name: 'Ginger-garlic paste', quantity: '2 tbsp', category: 'aromatic' },
    { id: 'green-chilli', name: 'Green chillies, slit', quantity: '3–4', category: 'aromatic' },
    { id: 'mint', name: 'Fresh mint leaves, chopped', quantity: '1/2 cup', category: 'finishing' },
    { id: 'coriander', name: 'Fresh coriander, chopped', quantity: '1/2 cup', category: 'finishing' },
    { id: 'lemon', name: 'Lemon', quantity: '1', category: 'finishing', note: 'Juice goes into the marinade.' },
    { id: 'ghee', name: 'Ghee', quantity: '3 tbsp', category: 'main' },
    { id: 'oil', name: 'Neutral oil', quantity: '1/2 cup', category: 'main', note: 'For frying the onions.' },
    { id: 'saffron', name: 'Saffron strands', quantity: 'A pinch (about 15 strands)', category: 'finishing' },
    { id: 'warm-milk', name: 'Warm milk', quantity: '3 tbsp', category: 'finishing', note: 'To bloom the saffron.' },
    { id: 'sugar', name: 'Sugar', quantity: '1/4 tsp', category: 'finishing', note: 'A pinch helps the saffron bloom and balances acidity.' },
    { id: 'biryani-masala', name: 'Biryani masala powder', quantity: '2 tbsp', category: 'spice' },
    { id: 'garam-masala', name: 'Garam masala', quantity: '1/2 tsp', category: 'spice', note: 'Sprinkled between the rice layers.' },
    { id: 'red-chilli', name: 'Kashmiri red chilli powder', quantity: '1 tsp', category: 'spice' },
    { id: 'turmeric', name: 'Turmeric powder', quantity: '1/4 tsp', category: 'spice' },
    { id: 'bay-leaf', name: 'Bay leaves', quantity: '2', category: 'spice' },
    { id: 'green-cardamom', name: 'Green cardamom pods', quantity: '4', category: 'spice' },
    { id: 'black-cardamom', name: 'Black cardamom', quantity: '1', category: 'spice', note: 'For smoky depth in the rice water.' },
    { id: 'cinnamon', name: 'Cinnamon stick', quantity: '1-inch piece', category: 'spice' },
    { id: 'cloves', name: 'Cloves', quantity: '4', category: 'spice' },
    { id: 'mace', name: 'Mace (javitri)', quantity: '1 small blade', category: 'spice', note: 'Optional but very traditional.' },
    { id: 'star-anise', name: 'Star anise', quantity: '1', category: 'optional' },
    { id: 'cumin', name: 'Shahi jeera (caraway)', quantity: '1/2 tsp', category: 'spice' },
    { id: 'salt', name: 'Salt', quantity: 'to taste', category: 'spice', note: 'The rice water should taste like seawater.' },
    { id: 'water', name: 'Water', quantity: '4 litres', category: 'main', note: 'For parboiling the rice.' },
  ],

  tools: [
    { id: 'heavy-pot', name: 'Heavy-bottomed handi or pot with tight lid', note: 'A thick base prevents the bottom layer from burning during dum.' },
    { id: 'large-pan', name: 'Wide, deep pot for parboiling rice', note: 'Wide so the rice can spread and cook evenly.' },
    { id: 'colander', name: 'Large colander', note: 'For draining the parboiled rice quickly so it stops cooking.' },
    { id: 'frying-pan', name: 'Frying pan or kadhai', note: 'For deep-frying the onions into birista.' },
    { id: 'tawa', name: 'Flat tawa or griddle', note: 'Sits under the biryani pot during slow dum to diffuse heat.' },
    { id: 'foil-or-dough', name: 'Foil or atta dough strip', note: 'For sealing the lid so steam cannot escape.' },
    { id: 'mixing-bowl', name: 'Large mixing bowl', note: 'For marinating the chicken.' },
    { id: 'spatula', name: 'Flat slotted spatula', note: 'For fluffing the rice gently at the end without breaking grains.' },
    { id: 'knife', name: "Chef's knife", note: 'For slicing onions paper-thin and chopping herbs.' },
    { id: 'thermometer', name: 'Instant-read thermometer', note: 'Optional but ideal — confirms chicken hits 75 °C / 165 °F at the core.' },
  ],

  miseEnPlace: [
    { id: 'marinate', label: 'Marinate chicken for 30+ minutes', done: false },
    { id: 'soak-rice', label: 'Soak basmati for 30 minutes', done: false },
    { id: 'slice-onions', label: 'Thinly slice onions paper-thin', done: true },
    { id: 'fry-onions', label: 'Fry sliced onions to deep golden brown (birista)', done: false },
    { id: 'warm-milk', label: 'Soak saffron in warm milk with a pinch of sugar', done: false },
    { id: 'chop-herbs', label: 'Chop mint and coriander', done: true },
    { id: 'measure-spices', label: 'Measure and gather whole spices in one bowl', done: false },
    { id: 'boil-water', label: 'Heat 4 litres of water for parboiling rice', done: false },
    { id: 'prep-seal', label: 'Prepare foil strip or atta dough for sealing lid', done: false },
  ],

  successVariables: [
    {
      id: 'birista',
      title: 'Deep-fried birista onions',
      detail: 'Fry slowly to a deep golden brown — never burnt black. This is the backbone of the flavour.',
      icon: 'flame',
    },
    {
      id: 'rice-doneness',
      title: 'Parboil the rice to 70%',
      detail: 'Rice should be cooked outside but firm inside. It finishes cooking during dum.',
      icon: 'soup',
    },
    {
      id: 'dum-seal',
      title: 'Seal the pot tightly',
      detail: 'A tight seal traps steam — without steam there is no biryani.',
      icon: 'flame',
    },
    {
      id: 'low-heat',
      title: 'Tawa-buffered low dum',
      detail: 'Place the sealed pot on a tawa over the lowest heat. This prevents the bottom layer from scorching.',
      icon: 'waves',
    },
    {
      id: 'rest',
      title: 'Rest before opening',
      detail: 'Let the sealed pot rest for 10 minutes after the heat is off. Steam finishes the rice and chicken settles.',
      icon: 'clock',
    },
  ],

  commonMistakes: [
    'Over-cooking rice before layering (turns mushy after dum).',
    'Insufficient marination (chicken stays bland and tough).',
    'Frying onions too fast on high heat (burnt outside, raw inside).',
    'Lifting the lid during dum (loses crucial steam).',
    'Skipping the tawa under the pot (bottom layer burns).',
    'Under-salting the rice water (the only chance to season every grain).',
  ],

  // ────────────────── Cooking steps ──────────────────
  cookingSteps: [
    {
      index: 1,
      title: 'Marinate the chicken',
      instruction: 'Mix chicken with yogurt, biryani masala, ginger-garlic, half the fried onions, lemon juice and salt. Rest 30+ minutes.',
      beginnerExplanation:
        'In a large bowl, add chicken, thick yogurt, biryani masala, ginger-garlic paste, slit green chillies, lemon juice and salt. Add half of the fried onions you set aside earlier. Use your hands to coat every piece — get under the skin if there is any. Cover and rest in the fridge for at least 30 minutes. Overnight is even better.',
      heat: 'Off',
      durationSec: 1800,
      sensoryCues: [
        { type: 'visual', cue: 'Chicken is fully coated in a rich yellow-red marinade' },
        { type: 'smell', cue: 'A warm, tangy spiced aroma rises from the bowl' },
        { type: 'texture', cue: 'Marinade clings thickly to the chicken — not watery' },
      ],
      whyThisMatters:
        'Yogurt tenderizes the chicken while the spices and salt slowly travel into the meat. This is the only chance to season the chicken from the inside.',
      foodScience:
        'Lactic acid in yogurt gently denatures muscle proteins, holding water inside the meat so it stays juicy through the long dum cook.',
      image: STEP_IMG(1),
    },
    {
      index: 2,
      title: 'Soak the basmati rice',
      instruction: 'Rinse basmati until water runs clear, then soak in cold water for 30 minutes.',
      beginnerExplanation:
        'Pour the rice into a bowl. Rinse under cold water 3–4 times, swirling gently with your fingers, until the water runs almost clear. Then cover the rice fully with fresh cold water and let it rest for 30 minutes. You can start this at the same time as the chicken marination — they finish together.',
      heat: 'Off',
      durationSec: 1800,
      sensoryCues: [
        { type: 'visual', cue: 'Cloudy starch water turns clear after a few rinses' },
        { type: 'texture', cue: 'Grains feel slightly plumper and softer when pressed' },
      ],
      whyThisMatters:
        'Soaking lets every grain absorb a little water in advance. That means a shorter boil, less breakage, and longer, more separate grains in the final biryani.',
      foodScience:
        'Pre-hydrated starch granules expand more gently when boiled — the grain stays intact instead of bursting open and turning sticky.',
      image: STEP_IMG(2),
    },
    {
      index: 3,
      title: 'Slice onions paper-thin',
      instruction: 'Slice 2 large onions into very thin, even half-moons.',
      beginnerExplanation:
        'Peel the onions and halve them top-to-root. Lay each half flat-side down on the board. Slice as thin as you can — like fine ribbons. Even thickness matters because thin strips fry fast and thick ones stay raw inside. Spread the slices on a paper towel to dry them — drier slices fry crispier.',
      heat: 'Off',
      durationSec: 300,
      sensoryCues: [
        { type: 'visual', cue: 'Slices look like fine pale-purple ribbons' },
        { type: 'texture', cue: 'Slices feel slightly dry on the surface after a minute on paper towel' },
      ],
      whyThisMatters:
        'Thin and even slices fry into delicate, crisp birista. Thick slices stay soft and chewy, and they burn in spots while staying raw in others.',
      image: STEP_IMG(3),
    },
    {
      index: 4,
      title: 'Fry the birista onions',
      instruction: 'Fry the sliced onions in oil on medium heat until deep golden brown. Drain on paper.',
      beginnerExplanation:
        'Heat 1/2 cup of neutral oil in a frying pan on medium heat. Add the sliced onions in two batches so the pan is not crowded. Stir often. They will go from white to translucent to pale gold to deep golden brown — about 8–10 minutes. Pull them out the moment they turn rich brown — they keep darkening on the paper towel. Reserve half for the marinade and half for layering.',
      heat: 'Medium',
      durationSec: 600,
      sensoryCues: [
        { type: 'visual', cue: 'Onions move from white to pale gold to deep nutty brown' },
        { type: 'sound', cue: 'Steady sizzle that slows as the moisture cooks off' },
        { type: 'smell', cue: 'A sweet, almost caramel aroma fills the kitchen' },
      ],
      whyThisMatters:
        'Birista is the soul of Hyderabadi biryani. It builds sweetness, colour, and a roasted depth that no spice can replace.',
      foodScience:
        'Slow frying drives off water, concentrates the natural sugars, and lets the Maillard reaction brown the onions for that deep nutty flavour. Too high heat burns the sugars before the inside cooks.',
      image: STEP_IMG(4),
    },
    {
      index: 5,
      title: 'Bloom the saffron in warm milk',
      instruction: 'Warm 3 tbsp milk, add a pinch of sugar and the saffron strands. Let it bloom for 10 minutes.',
      beginnerExplanation:
        'Warm the milk gently — it should feel warm to the touch, never boiling. Add a tiny pinch of sugar and the saffron strands. Stir once and let it sit. The milk will slowly turn a beautiful sunset orange. This is the colour you will paint across your biryani.',
      heat: 'Off',
      durationSec: 180,
      sensoryCues: [
        { type: 'visual', cue: 'Milk turns a soft, glowing golden-orange' },
        { type: 'smell', cue: 'A floral, honey-like aroma rises from the bowl' },
      ],
      whyThisMatters:
        'Bloomed saffron gives biryani its signature colour, perfume, and luxury feel — far more than dropping dry strands directly into the pot.',
      foodScience:
        'Saffron carries its colour and aroma in water-soluble compounds. Warm milk pulls them out gently without bitterness. A pinch of sugar helps the colour develop more deeply.',
      image: STEP_IMG(5),
    },
    {
      index: 6,
      title: 'Spice the rice water',
      instruction: 'In a wide pot, add 4 litres of water with the whole spices and salt.',
      beginnerExplanation:
        'Fill a wide pot with 4 litres of water. Drop in bay leaves, green and black cardamom, cinnamon stick, cloves, mace, star anise and shahi jeera. Add enough salt that the water tastes like seawater — slightly too salty to drink. Set on high heat. This is the only moment you can season every grain of rice, so do not skimp.',
      heat: 'High',
      durationSec: 240,
      sensoryCues: [
        { type: 'visual', cue: 'Whole spices float and drift gently as the water warms' },
        { type: 'smell', cue: 'A warm, sweet spice aroma rises from the steam' },
      ],
      whyThisMatters:
        'Whole spices in the boiling water perfume every grain of rice. The salt seasons each grain from the inside — you cannot fix bland rice later.',
      image: STEP_IMG(6),
    },
    {
      index: 7,
      title: 'Bring to a rolling boil',
      instruction: 'Bring the spiced water to a hard, rolling boil before adding the rice.',
      beginnerExplanation:
        'Wait until the surface of the water is moving in a fast, lively boil — not just simmering bubbles. The hotter the water, the faster the rice grains seal on the outside when they hit it. A weak boil means soggy rice.',
      heat: 'High',
      durationSec: 300,
      sensoryCues: [
        { type: 'visual', cue: 'Water surface churns with large, lively bubbles' },
        { type: 'sound', cue: 'A steady, roaring boil — not a gentle simmer' },
      ],
      whyThisMatters:
        'A rolling boil cooks the rice quickly and evenly. Slow boiling causes the grains to swell and break.',
      image: STEP_IMG(7),
    },
    {
      index: 8,
      title: 'Parboil the rice to 70%',
      instruction: 'Drain the soaked rice and tip into the boiling water. Cook 5–6 minutes until grains bend with a firm centre.',
      beginnerExplanation:
        'Drain the soaked rice and slide it gently into the boiling water. Stir once with a slotted spoon to stop grains from sticking. Set a timer for 5 minutes. To test, lift one grain out, let it cool a second, and press it between your fingers — it should bend but still have a small hard white centre. That is 70 percent done. The dum will finish it.',
      heat: 'High',
      durationSec: 360,
      sensoryCues: [
        { type: 'visual', cue: 'Grains elongate and turn shiny but still hold their shape' },
        { type: 'texture', cue: 'A pressed grain feels soft outside, firm inside' },
        { type: 'sound', cue: 'The bubbling settles into a steady churn' },
      ],
      whyThisMatters:
        '70% parboiled rice is the single biggest fork in the road for biryani. Too soft now and it turns to mush; too hard and it crunches in the final dish.',
      foodScience:
        'At 70% doneness the starch on the outside has gelatinised but the inner core is still firm. The remaining cook happens with gentle steam during dum, finishing the grain without bursting it.',
      image: STEP_IMG(8),
    },
    {
      index: 9,
      title: 'Drain and spread the rice',
      instruction: 'Tip the rice into a wide colander. Spread it out so it stops cooking.',
      beginnerExplanation:
        'Pour the rice into a large colander set in the sink. Shake to drain off every drop of water. Then use the back of a spoon to spread the rice out across the colander in a thin layer. This stops carry-over cooking from the hot grains. Pick out the big whole spices if you can spot them — they have already done their job.',
      heat: 'Off',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'Water drains away leaving glossy, separate grains' },
        { type: 'texture', cue: 'Grains feel hot but no longer wet' },
      ],
      whyThisMatters:
        'Hot rice piled up keeps cooking from its own heat. Spreading it out arrests the cook so the rice goes into the pot exactly at 70%.',
      image: STEP_IMG(9),
    },
    {
      index: 10,
      title: 'Grease the dum pot',
      instruction: 'Choose a heavy-bottomed handi. Grease the base generously with ghee.',
      beginnerExplanation:
        'Pick the heaviest pot you own that has a tight-fitting lid. Spoon 1 tbsp of ghee into the base and tilt the pot so the ghee coats the bottom and a little way up the sides. This ghee layer is what stops the chicken from sticking and burning during the long dum.',
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'A thin glossy film of ghee coats the bottom of the pot' },
      ],
      whyThisMatters:
        'The base of the pot will sit over heat for nearly half an hour. Ghee creates a buffer so the chicken renders into a flavourful gravy instead of charring.',
      image: STEP_IMG(10),
    },
    {
      index: 11,
      title: 'Spread the marinated chicken',
      instruction: 'Layer all the marinated chicken in one even layer at the bottom of the pot.',
      beginnerExplanation:
        'Tip the marinated chicken and all its juices into the pot. Spread it into one flat layer with the back of a spoon. Do not pile pieces on top of each other — they must all touch the heat. Pour any leftover marinade from the bowl on top.',
      heat: 'Off',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'A single even bed of chicken with marinade pooled around it' },
        { type: 'smell', cue: 'A bright, tangy spiced aroma from the raw marinade' },
      ],
      whyThisMatters:
        'An even layer means even cooking. Stacked pieces stay raw at the centre — a food safety issue, not just a flavour one.',
      image: STEP_IMG(11),
    },
    {
      index: 12,
      title: 'Layer the first half of rice',
      instruction: 'Spread half the parboiled rice over the chicken. Sprinkle half the saffron milk, fried onions, herbs and a dust of garam masala.',
      beginnerExplanation:
        'Gently spoon half the parboiled rice over the chicken. Do not press it down — keep it loose. Now scatter half the saffron milk in lazy lines across the surface. Sprinkle half the fried onions, half the chopped mint and coriander, and a pinch of garam masala. The colour will be uneven — that is the point. Every spoon of biryani should look different.',
      heat: 'Off',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'White rice splashed with streaks of orange saffron and brown birista' },
        { type: 'smell', cue: 'Mint, saffron and warm garam masala mingle in the air' },
      ],
      whyThisMatters:
        'Layering creates the marbled colour and the burst of flavour you get in a single spoonful of good biryani. Uneven sprinkling is intentional.',
      image: STEP_IMG(12),
    },
    {
      index: 13,
      title: 'Top with the second rice layer',
      instruction: 'Spread the remaining rice. Finish with the rest of the saffron milk, onions, herbs and a drizzle of ghee.',
      beginnerExplanation:
        'Spoon the rest of the rice on top in an even layer. Drizzle the remaining saffron milk in slow stripes. Scatter the rest of the fried onions, mint and coriander. Finally, drizzle 2 tbsp of warm ghee across the surface — this melts down through the layers during dum and carries flavour with it.',
      heat: 'Off',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'A colourful top layer with orange, green and brown flecks across white rice' },
        { type: 'smell', cue: 'A festive, aromatic perfume rises from the pot' },
      ],
      whyThisMatters:
        'A second pass of every flavour means the top of the biryani is as exciting as the middle and bottom.',
      image: STEP_IMG(13),
    },
    {
      index: 14,
      title: 'Seal the pot tight',
      instruction: 'Cover with foil tucked tightly around the rim, then place the lid on top. Press down firmly.',
      beginnerExplanation:
        'Tear off a sheet of foil large enough to overhang the pot. Lay it over the rice and press it down firmly against the rim so it forms a tight cap. Place the lid on top and press it down. If you prefer the traditional way, roll a long strip of atta dough and press it around the rim before closing the lid. The goal is simple — no steam escapes.',
      heat: 'Off',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'Foil hugs the pot rim with no gaps' },
        { type: 'texture', cue: 'Lid feels firmly seated and does not rattle' },
      ],
      whyThisMatters:
        'Dum is steam cooking. If steam leaks out, the rice dries on top and the chicken stays raw at the centre.',
      foodScience:
        'A sealed pot becomes a low-pressure steam oven. The trapped vapour stays at 100 °C, gently driving heat through the layers without drying them.',
      image: STEP_IMG(14),
    },
    {
      index: 15,
      title: 'High-heat steam burst',
      instruction: 'Place the sealed pot directly on high heat for 5 minutes to build steam.',
      beginnerExplanation:
        'Set the sealed pot directly on the burner on high heat. After about 2 minutes you will start to hear a soft hiss and see a tiny wisp of steam. Let it run for 5 minutes total. This is the burst that gets the chicken sizzling and fills the pot with steam.',
      heat: 'High',
      durationSec: 300,
      sensoryCues: [
        { type: 'sound', cue: 'A soft hiss builds inside the pot' },
        { type: 'smell', cue: 'Faint aromatic steam begins to escape near the rim' },
      ],
      whyThisMatters:
        'A short, hot start gets the marinade boiling and fills the pot with steam quickly — that steam is what cooks everything from here on.',
      image: STEP_IMG(15),
    },
    {
      index: 16,
      title: 'Slow dum on a tawa',
      instruction: 'Move the pot onto a tawa, reduce to the lowest heat, and dum for 25 minutes.',
      beginnerExplanation:
        'Place a flat tawa or griddle on the burner. Move the sealed biryani pot onto it. Drop the heat to its lowest setting. Do not open the lid. Do not stir. Walk away for 25 minutes. The tawa spreads the heat gently across the base so nothing scorches.',
      heat: 'Low',
      durationSec: 1500,
      sensoryCues: [
        { type: 'smell', cue: 'A complex aromatic perfume seeps from under the lid' },
        { type: 'sound', cue: 'A soft, steady hiss — never loud bubbling' },
      ],
      whyThisMatters:
        'Long, low dum is when steam carries chicken juices and spices upward, infusing every grain of rice. Critically, this is when the chicken reaches safe serving temperature.',
      foodScience:
        'Sealed steam cooks chicken through (must reach 75 °C / 165 °F internally) while the rice absorbs aromatic compounds from the marinade below. The tawa diffuses the heat so the bottom of the pot stays just hot enough to render the chicken without burning.',
      image: STEP_IMG(16),
    },
    {
      index: 17,
      title: 'Rest off the heat',
      instruction: 'Turn off the heat. Leave the pot sealed and rest for 10 minutes. Do NOT open.',
      beginnerExplanation:
        'Switch off the heat completely. Do not lift the lid yet. The residual steam keeps cooking gently for another 10 minutes — this finishes the rice and lets the chicken juices settle. Opening early collapses the steam and you lose the magic.',
      heat: 'Off',
      durationSec: 600,
      sensoryCues: [
        { type: 'sound', cue: 'The hissing fades into silence as the pot cools slightly' },
        { type: 'smell', cue: 'Aroma builds inside, much stronger when you finally open it' },
      ],
      whyThisMatters:
        'Resting redistributes heat and moisture evenly through the layers. The rice finishes cooking and the chicken stays juicy.',
      image: STEP_IMG(17),
    },
    {
      index: 18,
      title: 'Open, fluff and plate',
      instruction: 'Remove the seal. Check chicken is 75 °C / 165 °F at the centre. Fluff gently from the bottom up and serve.',
      beginnerExplanation:
        'Carefully peel off the foil — watch out for the hot steam. The biryani should look striped with orange, white and brown. Push a thermometer into the thickest piece of chicken — it must read at least 75 °C (165 °F) at the core. Use a flat slotted spatula to lift from the bottom up in gentle scoops, so each plate gets a layer of chicken and rice. Serve immediately with raita and a wedge of lemon.',
      heat: 'Off',
      durationSec: 180,
      sensoryCues: [
        { type: 'visual', cue: 'Long, separate rice grains in white, orange and brown stripes' },
        { type: 'smell', cue: 'A wave of saffron, mint and warm spice fills the room' },
        { type: 'texture', cue: 'Chicken pulls cleanly off the bone; rice is fluffy, not sticky' },
      ],
      whyThisMatters:
        'A gentle bottom-up fluff keeps the layers visible on the plate. The temperature check is non-negotiable — chicken below 75 °C is not safe to serve.',
      image: STEP_IMG(18),
    },
  ],

  // ────────────────── Rescue / Fix My Dish ──────────────────
  rescueIssues: [
    {
      id: 'mushy-rice',
      label: 'Rice turned mushy',
      icon: 'soup',
      diagnosis:
        'Rice was over-parboiled before layering, or the dum heat was too high for too long. The starch fully gelatinised and the grains burst.',
      immediateFix: [
        'Spread the biryani on a wide tray to release steam and stop further cooking.',
        'Drizzle 1 tbsp warm ghee over the top and fluff very gently — the fat coats the grains and reduces stickiness.',
        'Serve immediately; do not let it sit covered or it will worsen.',
      ],
      preventNextTime: [
        'Aim for 70% doneness when parboiling — firm white centre is essential.',
        'Use aged basmati. New-crop rice has more free starch and turns mushy faster.',
        'Once parboiled, drain into a wide colander and spread thin so it stops cooking immediately.',
      ],
      foodScience:
        'Rice continues to cook from residual heat. Once starch granules fully gelatinise and burst, there is no going back — grains lose their structure.',
    },
    {
      id: 'undercooked-rice',
      label: 'Rice still hard in the centre',
      icon: 'seedling',
      diagnosis:
        'Rice was pulled from the parboil too early, or the dum was too short or too cold. Not enough steam reached the upper layer.',
      immediateFix: [
        'Sprinkle 2–3 tbsp of hot water across the rice surface.',
        'Reseal the pot tightly with foil and the lid.',
        'Return to the lowest heat on a tawa for another 8–10 minutes.',
      ],
      preventNextTime: [
        'Parboil until grains bend with just a tiny white pinpoint in the middle.',
        'Always do a 5-minute high-heat burst before the long low dum — this builds the steam reservoir.',
        'Check your lid actually seals. Use foil under the lid if it does not.',
      ],
      foodScience:
        'Rice needs both heat AND moisture to finish cooking. Without enough trapped steam, the grain never reaches the temperature it needs to soften its hard core.',
    },
    {
      id: 'burnt-bottom',
      label: 'Burnt layer at the bottom',
      icon: 'flame',
      diagnosis:
        'The pot sat directly on high heat for the dum, or there was not enough ghee in the base, or the chicken released too little moisture.',
      immediateFix: [
        'Stop. Do NOT scrape the burnt bottom.',
        'Lift the unburnt biryani from the top into a fresh warm pot.',
        'Drizzle 1 tbsp warm ghee and a splash of saffron milk on top. Cover for 2 minutes to refresh the aroma.',
      ],
      preventNextTime: [
        'Always use a heavy-bottomed pot.',
        'Place a tawa or griddle under the pot during dum — this diffuses the heat.',
        'Grease the base of the pot generously with ghee before layering.',
        'Keep the dum heat at the lowest possible setting after the initial burst.',
      ],
      foodScience:
        'Direct contact between a thin pot base and a burner creates hotspots. Once sugars in the marinade hit ~170 °C they burn, and the bitter compounds spread upward through the steam.',
    },
    {
      id: 'raw-chicken',
      label: 'Chicken still pink at the centre',
      icon: 'thermometer',
      diagnosis:
        'Dum was too short, the heat was too low, or the chicken pieces were too thick for the cooking time. Internal temperature did not hit 75 °C / 165 °F.',
      immediateFix: [
        'Lift out the undercooked pieces.',
        'Finish them in a covered pan with 2 tbsp water on medium heat for 5–8 minutes, until a thermometer reads 75 °C / 165 °F at the bone.',
        'Return the cooked pieces to the rice and re-seal briefly to warm through.',
      ],
      preventNextTime: [
        'Use medium-sized bone-in pieces, all roughly the same size.',
        'Marinate at least 30 minutes — acid in yogurt starts breaking down the surface and helps heat penetrate faster.',
        'Always do the 5-minute high-heat burst before lowering to dum.',
        'Use an instant-read thermometer. Pink near the bone with a 75 °C core is safe; pink with a lower temperature is not.',
      ],
      foodScience:
        'Chicken is safe at 75 °C / 165 °F internal because Salmonella and Campylobacter are inactivated within seconds at that temperature. Colour alone is not a reliable indicator — myoglobin can stay pink even when fully cooked.',
    },
    {
      id: 'too-salty',
      label: 'Biryani is too salty',
      icon: 'shaker',
      diagnosis:
        'Either the rice water was over-salted or the marinade carried too much salt — and the two stacked up during dum.',
      immediateFix: [
        'Squeeze fresh lemon juice over individual servings to mask the saltiness.',
        'Serve with cool, unsalted raita — yogurt and cucumber dilute the perception of salt.',
        'A small dollop of plain rice on the side helps balance each bite.',
      ],
      preventNextTime: [
        'Season the rice water like seawater — slightly too salty to drink — but no more.',
        'Salt the marinade modestly, knowing the rice will bring more salt to the dish.',
        'Always taste a grain of parboiled rice before draining — that tells you the salt level locked into the rice.',
      ],
      foodScience:
        'Salt does not evaporate during cooking. Once layered and sealed, every bit of salt added is in the final dish. Acid (lemon) and fat (raita) can mask the perception of saltiness but cannot remove it.',
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
    { id: 'lemon-wedge', label: 'Serve with a lemon wedge', reason: 'Brightens the dish and cuts through the richness.', icon: 'lemon', optional: false },
    { id: 'ghee-drizzle', label: 'Drizzle warm ghee', reason: 'Adds shine and amplifies aroma at the table.', icon: 'butter', optional: true },
  ],

  plating: {
    notes: [
      'Serve with raita and a wedge of lemon.',
      'Lift from the bottom up so each plate gets a layer of chicken and rice.',
      'Always check chicken is cooked through before serving.',
    ],
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
