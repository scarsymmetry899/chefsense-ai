/**
 * Bandi Chicken Fried Rice — Hyderabadi street-food classic.
 *
 * Smoky, garlic-forward Indo-Chinese fried rice cooked on a screaming-hot
 * cart-style flat tava ("bandi"). Marinated shredded chicken, finely
 * chopped veg, scrambled egg and a soy + green-chilli + dark-soy +
 * vinegar finish — flame-kissed for that street-cart "wok hei" smokiness.
 *
 * ───── BEGINNER-LANGUAGE RULE ─────
 *   - Avoid jargon. If used, define inline in plain words.
 *   - Describe what to SEE / SMELL / HEAR / TOUCH at each step.
 *   - One small idea per sentence. Short sentences win.
 *
 * Food-safety reminder: chicken must reach an internal temperature of
 * 75 °C / 165 °F before serving.
 */

import type { Dish } from '../types';

const STEP_IMG = (n: number) =>
  `/images/dishes/bandi-chicken-fried-rice/step-${n}.jpg`;

export const bandiChickenFriedRice: Dish = {
  dishId: 'bandi-chicken-fried-rice',
  dishName: 'Bandi Chicken Fried Rice',
  cuisine: 'Indian',
  region: 'Hyderabadi Street',
  difficulty: 'Medium',
  totalTimeMin: 45,
  prepTimeMin: 20,
  cookTimeMin: 25,
  serves: '2–3',
  isVegetarian: false,
  heroImage: '/images/dishes/bandi-chicken-fried-rice/hero.jpg',
  summary:
    'Hyderabad-style street fried rice — smoky long-grain rice tossed with spice-marinated chicken, scrambled egg, finely chopped veg and a soy-vinegar finish, flame-kissed straight off the bandi (cart) tava.',
  tags: ['street-food', 'spicy', 'smoky', 'chicken', 'indo-chinese'],
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
      'Garlic must be freshly chopped, never paste — paste burns and turns bitter.',
      'Cook in stages on ripping-high heat; combine only at the end.',
      'A whisper of dark soy + vinegar at the edge of the wok is the bandi finishing signature.',
    ],
  },

  ingredients: [
    { id: 'rice', name: 'Cooked long-grain rice (cold, day-old)', quantity: '3 cups', category: 'main', note: 'Basmati or sona masuri both work. Must be fully cooled — overnight in the fridge is best.' },
    { id: 'chicken', name: 'Boneless chicken thigh, cut into 1.5 cm cubes', quantity: '250 g', category: 'main', note: 'Cook until internal temperature reaches 75 °C / 165 °F.' },
    { id: 'cornflour', name: 'Cornflour (cornstarch)', quantity: '1 tsp', category: 'main', note: 'For the chicken marinade — gives a velvety sear.' },
    { id: 'egg', name: 'Eggs', quantity: '2', category: 'main' },
    { id: 'light-soy', name: 'Light soy sauce', quantity: '2 tbsp', category: 'main', note: '1 tsp goes into the chicken marinade; the rest finishes the rice.' },
    { id: 'dark-soy', name: 'Dark soy sauce', quantity: '1 tsp', category: 'finishing', note: 'For colour and depth — use sparingly.' },
    { id: 'vinegar', name: 'White vinegar', quantity: '1 tsp', category: 'finishing', note: 'A few drops go in the marinade; the rest finishes the rice.' },
    { id: 'garlic', name: 'Garlic cloves, finely chopped (NOT paste)', quantity: '2 tbsp (about 10–12 cloves)', category: 'aromatic', note: 'Freshly chopped — paste burns and turns bitter on high heat.' },
    { id: 'ginger', name: 'Fresh ginger, finely chopped', quantity: '1 tbsp', category: 'aromatic' },
    { id: 'green-chilli', name: 'Green chillies, finely chopped', quantity: '3–4', category: 'spice' },
    { id: 'spring-onion', name: 'Spring onions (whites and greens separated, finely sliced)', quantity: '6 stalks', category: 'aromatic' },
    { id: 'carrot', name: 'Carrot, fine 5 mm dice', quantity: '1 small', category: 'aromatic' },
    { id: 'french-beans', name: 'French beans, fine 5 mm slices', quantity: '8–10', category: 'aromatic' },
    { id: 'cabbage', name: 'Cabbage, finely shredded', quantity: '1 cup loosely packed', category: 'aromatic' },
    { id: 'capsicum', name: 'Green capsicum, fine 5 mm dice', quantity: '1/2', category: 'aromatic' },
    { id: 'pepper', name: 'White pepper powder', quantity: '1/2 tsp', category: 'spice', note: 'Black pepper is fine too — white is the street-cart classic.' },
    { id: 'msg', name: 'MSG / Aji-no-moto', quantity: '1/4 tsp', category: 'optional', note: 'Traditional in street bandi rice. Skip if you prefer.' },
    { id: 'oil', name: 'Neutral high-smoke-point oil (sunflower, rice-bran or groundnut)', quantity: '3 tbsp', category: 'main' },
    { id: 'sesame-oil', name: 'Toasted sesame oil', quantity: '1/2 tsp', category: 'finishing', note: 'Final drizzle — never cooked with.' },
    { id: 'chilli-oil', name: 'Chilli oil', quantity: '1 tsp', category: 'finishing', note: 'Optional street-cart drizzle at the table.' },
    { id: 'salt', name: 'Salt', quantity: 'to taste', category: 'spice', note: 'Go light — soy sauce already carries salt.' },
  ],

  tools: [
    { id: 'wok', name: 'Carbon-steel wok or heavy iron tava', note: 'Must take ripping-high heat without warping. A non-stick pan will not get hot enough for proper wok hei.' },
    { id: 'spatula', name: 'Long flat metal spatula or wok ladle', note: 'For the high, fast tossing motion that defines bandi rice.' },
    { id: 'tongs', name: 'Tongs or chopsticks', note: 'Useful for turning the chicken sear without crowding the wok.' },
    { id: 'sharp-knife', name: "Sharp chef's knife", note: 'Fine dicing is non-negotiable — chunky veg will not cook through in the short toss time.' },
    { id: 'mixing-bowl', name: 'Small mixing bowl', note: 'For marinating the chicken.' },
    { id: 'tray', name: 'Tray or plate for parked ingredients', note: 'You will be moving cooked components in and out of the wok — keep a landing zone ready.' },
  ],

  miseEnPlace: [
    { id: 'cold-rice', label: 'Use cooked long-grain rice that has been chilled for at least 30 minutes (overnight is best)', done: false },
    { id: 'fluff-rice', label: 'Fluff the cold rice with a fork and toss with a teaspoon of oil so grains separate', done: false },
    { id: 'marinate-chicken', label: 'Marinate chicken cubes in light soy + cornflour + pepper + a few drops of vinegar for 10 minutes', done: false },
    { id: 'chop-aromatics', label: 'Finely chop garlic, ginger, green chillies and spring onion whites + greens (kept separate)', done: false },
    { id: 'fine-dice-veg', label: 'Fine-dice carrots, beans, capsicum and shred cabbage', done: false },
    { id: 'whisk-eggs', label: 'Whisk eggs with a pinch of salt and pepper', done: false },
    { id: 'sauces-ready', label: 'Pre-mix light soy + dark soy + vinegar in a small bowl so they go in at one motion', done: false },
    { id: 'heat-wok', label: 'Place wok on the burner — heat to ripping-hot before any oil goes in', done: false },
  ],

  successVariables: [
    {
      id: 'smoking-wok',
      title: 'Smoking-hot wok before rice goes in',
      detail: 'The pan must throw a thin wisp of smoke before the first ingredient hits it. This is what creates the "wok hei" street-cart smokiness.',
      icon: 'flame',
    },
    {
      id: 'fresh-garlic',
      title: 'Freshly chopped garlic — never paste',
      detail: 'Chopped garlic browns and perfumes the oil. Ginger-garlic paste contains water and burns to a bitter sludge on a screaming-hot wok.',
      icon: 'leaf',
    },
    {
      id: 'cold-rice',
      title: 'Cold, oiled, fluffed rice',
      detail: 'Day-old rice has dried-out grains that fry separately. Fresh hot rice steams and clumps.',
      icon: 'snowflake',
    },
    {
      id: 'stage-cooking',
      title: 'Cook in stages',
      detail: 'Chicken → aromatics → egg → veg → rice → sauces. Adding everything at once mutes the layered street flavour.',
      icon: 'layers',
    },
    {
      id: 'high-toss',
      title: 'High, fast toss — keep it moving',
      detail: 'Lift and flip the rice from the pan edges into the centre. Stationary rice sits in one spot and either burns or steams.',
      icon: 'wind',
    },
  ],

  commonMistakes: [
    'Using freshly cooked warm rice (sticky, clumpy result).',
    'Adding everything to the wok at once — flavours flatten and the veg goes soggy.',
    'Pan not hot enough — the dish steams instead of frying.',
    'Using ginger-garlic paste instead of chopped garlic — burns to bitterness in seconds.',
    'Pouring soy sauce directly on the rice instead of around the wok edges — it pools and over-salts patches.',
    'Crowding the wok with chicken — pieces stew in their own juice instead of searing.',
    'Stirring the chicken the second it lands — robs it of the sear that builds smoky depth.',
  ],

  cookingSteps: [
    {
      index: 1,
      title: 'Cool, oil and fluff the rice',
      instruction: 'Spread cold day-old rice on a tray. Drizzle 1 tsp oil and fluff gently with a fork so every grain is separate.',
      beginnerExplanation:
        'If your rice is fresh-cooked, spread it thin on a tray and refrigerate at least 30 minutes — overnight is much better. When it is cold, drizzle a teaspoon of oil across the top and fluff with a fork, lifting and separating any clumps. You want every grain loose, dry on the outside and just slick with oil. This is the single most important prep step in fried rice — gummy rice cannot be rescued later.',
      heat: 'Off',
      durationSec: 180,
      sensoryCues: [
        { type: 'visual', cue: 'Grains look matte, separate and slightly translucent — no white starchy clumps' },
        { type: 'texture', cue: 'Rice slips off the fork; nothing sticks to the tray' },
      ],
      whyThisMatters:
        'Cold rice has dried-out, retrograded starch on the outside of each grain. That dryness is what lets it fry instead of steam.',
      foodScience:
        'When cooked rice cools, the starch molecules re-crystallise (retrogradation). The grain surface dries and firms up, so on high heat it sears instead of releasing sticky starch.',
      image: STEP_IMG(1),
    },
    {
      index: 2,
      title: 'Marinate the chicken',
      instruction: 'Toss chicken cubes with 1 tsp light soy, 1 tsp cornflour, 1/4 tsp white pepper and a few drops of vinegar. Rest 10 minutes.',
      beginnerExplanation:
        'Cut boneless chicken thigh into small 1.5 cm cubes — roughly the size of a hazelnut. In a small bowl, sprinkle the cornflour, light soy, white pepper and a few drops of vinegar over the chicken. Mix with your fingers until every piece is coated in a slick, slightly sticky film. Let it sit on the counter for 10 minutes while you chop the rest. Do not add salt — the soy carries enough.',
      heat: 'Off',
      durationSec: 300,
      sensoryCues: [
        { type: 'visual', cue: 'Chicken pieces look glossy and lightly coated — no dry powder visible' },
        { type: 'texture', cue: 'Coating feels tacky between fingers — that is the cornflour working' },
      ],
      whyThisMatters:
        'Cornflour protects the chicken in the wok and gives it that velvety bite you taste in good street fried rice. The soy seasons from the inside.',
      foodScience:
        'Cornflour gelatinises on contact with hot oil and forms a thin protective shell. Water stays inside the meat, so the chicken stays juicy even on screaming-hot heat.',
      image: STEP_IMG(2),
    },
    {
      index: 3,
      title: 'Chop the aromatics and veg',
      instruction: 'Finely chop garlic, ginger, green chillies. Slice spring onion whites and greens separately. Fine-dice carrot, beans, capsicum. Shred cabbage.',
      beginnerExplanation:
        'This dish moves fast once the wok is hot — so all chopping must be done first. Mince the garlic small but not paste-fine. Mince the ginger to match. Slice green chillies thin. Slice the spring onion whites into thin rings and put the greens in a separate pile (they are added at different times). Dice carrot, French beans and capsicum into 5 mm pieces — small enough to cook in the brief wok time. Shred cabbage into thin ribbons. Lay them on a tray in the order you will use them.',
      heat: 'Off',
      durationSec: 360,
      sensoryCues: [
        { type: 'visual', cue: 'Every pile is uniform — no chunks that will stay raw in the wok' },
        { type: 'smell', cue: 'Fresh garlic, ginger and chilli give the cutting board a sharp, bright aroma' },
      ],
      whyThisMatters:
        'There is no time to chop mid-cook. A well-laid mise en place is what makes a 5-minute fry feel calm.',
      image: STEP_IMG(3),
    },
    {
      index: 4,
      title: 'Whisk the eggs',
      instruction: 'Beat 2 eggs with a pinch of salt and a crack of pepper.',
      beginnerExplanation:
        'Crack 2 eggs into a bowl. Add a small pinch of salt and a turn of pepper. Whisk with a fork until the yolks and whites are fully blended — about 20 seconds. Leave the bowl next to the wok. Eggs go in fast and need to be ready.',
      heat: 'Off',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Eggs are a uniform pale yellow with no streaks of clear white' },
      ],
      whyThisMatters:
        'Pre-whisked eggs scramble into fine, even curds in seconds. Adding them straight from the shell into the wok gives uneven, omelette-like chunks.',
      image: STEP_IMG(4),
    },
    {
      index: 5,
      title: 'Heat the wok until it smokes',
      instruction: 'Place a dry wok on the highest flame. Wait until you see a thin wisp of smoke. Add 1 tbsp oil and swirl to coat.',
      beginnerExplanation:
        'Put your empty wok on the largest burner on full blast. Do not add oil yet. Wait until you see a thin wisp of smoke rising from the metal — this usually takes 1 to 2 minutes. Now add 1 tablespoon of oil and swirl so it coats the inside of the wok. The oil will shimmer almost instantly. You are ready to cook.',
      heat: 'High',
      durationSec: 120,
      sensoryCues: [
        { type: 'visual', cue: 'A thin grey wisp of smoke rises from the empty wok' },
        { type: 'sound', cue: 'A loud sharp sizzle the moment oil hits the metal' },
        { type: 'smell', cue: 'A faint scorched-metal aroma — this is wok hei in waiting' },
      ],
      whyThisMatters:
        'A smoking-hot wok is the entire personality of bandi rice. Below that temperature, every ingredient steams instead of frying.',
      foodScience:
        'High heat triggers Maillard browning on contact — the surface chemistry that creates the smoky, savoury "wok hei" aroma. Cold pans cannot generate those compounds.',
      image: STEP_IMG(5),
    },
    {
      index: 6,
      title: 'Sear the chicken in a single layer',
      instruction: 'Add marinated chicken in a single layer. Do not stir for 30 seconds. Then toss until just cooked and lightly charred. Remove to a plate.',
      beginnerExplanation:
        'Drop the marinated chicken into the smoking-hot wok in one even layer — pieces should hit the metal, not stack on each other. Step back. Do NOT stir for 30 seconds — let the bottom get a golden char. Then toss and stir-fry for another 2 minutes until pieces are white in the middle and dark-edged on the outside. Slide the chicken onto a plate. It will finish cooking later.',
      heat: 'High',
      durationSec: 180,
      sensoryCues: [
        { type: 'sound', cue: 'Loud, aggressive sizzle on contact — should never go quiet' },
        { type: 'visual', cue: 'Chicken edges turn dark golden-brown with visible char spots' },
        { type: 'smell', cue: 'Smoky, slightly charred chicken aroma rises sharply' },
      ],
      whyThisMatters:
        'Searing first builds the smoky street-cart depth into the chicken itself. Cooking chicken with everything else later gives a bland, boiled-tasting result.',
      foodScience:
        'A 30-second undisturbed sear lets the Maillard reaction develop on one face of the cube. Stirring too early drops the wok temperature and the chicken stews in its own water.',
      image: STEP_IMG(6),
    },
    {
      index: 7,
      title: 'Fry the garlic, ginger and green chilli',
      instruction: 'Add 1 tsp more oil. Toss in chopped garlic, ginger and green chillies. Stir constantly for 10 to 15 seconds.',
      beginnerExplanation:
        'The wok is still ripping hot. Drizzle in a teaspoon more oil and immediately throw in the chopped garlic, ginger and green chillies — all at once. Stir hard and fast with your spatula for 10 to 15 seconds — no longer. The garlic should turn pale gold at the edges and smell intensely fragrant. If it browns past gold, the dish will taste bitter.',
      heat: 'High',
      durationSec: 30,
      sensoryCues: [
        { type: 'smell', cue: 'Sharp, sweet garlic-chilli aroma fills the kitchen instantly' },
        { type: 'visual', cue: 'Garlic specks turn pale gold but not dark brown' },
        { type: 'sound', cue: 'Sharp crackling sizzle' },
      ],
      whyThisMatters:
        'This is the flavour backbone of bandi rice. Burnt garlic is unfixable — pull it out the second it turns gold.',
      image: STEP_IMG(7),
    },
    {
      index: 8,
      title: 'Scramble the eggs in the wok',
      instruction: 'Push aromatics to one side. Pour eggs into the empty side. Scramble briskly, then break up into small curds.',
      beginnerExplanation:
        'With your spatula, sweep the garlic-ginger-chilli to one half of the wok. Pour the whisked eggs into the empty side. They will start setting in 2 seconds — immediately stir them in tight circles to make fine, soft curds. Once they are just set and still glossy, break them apart with the edge of your spatula and fold them through the aromatics.',
      heat: 'High',
      durationSec: 90,
      sensoryCues: [
        { type: 'visual', cue: 'Eggs go from liquid yellow to soft golden curds within seconds' },
        { type: 'texture', cue: 'Curds look small and tender — never rubbery or browned' },
      ],
      whyThisMatters:
        'Quick small egg curds distribute through every spoon of rice. Big slow chunks make it taste like an omelette mixed in.',
      image: STEP_IMG(8),
    },
    {
      index: 9,
      title: 'Add the hard veg first',
      instruction: 'Tip in diced carrot and French beans. Spring onion whites too. Toss hard on high heat for 1 minute.',
      beginnerExplanation:
        'Add the carrot and French beans — the ones that need the most cooking — straight to the hot wok along with the spring onion whites. Toss continuously, scraping from the edges into the centre. After about a minute they will lose their raw look and pick up tiny charred spots. Heat must stay ripping high.',
      heat: 'High',
      durationSec: 60,
      sensoryCues: [
        { type: 'sound', cue: 'Loud crackle as the veg hits the hot metal' },
        { type: 'visual', cue: 'Carrots brighten in colour; beans gleam slightly char-spotted' },
      ],
      whyThisMatters:
        'Hard veg need longer cooking. Adding them with the soft veg leaves the carrots raw and crunchy in a soft dish.',
      image: STEP_IMG(9),
    },
    {
      index: 10,
      title: 'Add the soft veg',
      instruction: 'Add capsicum and shredded cabbage. Toss for another minute. Keep heat ripping high.',
      beginnerExplanation:
        'Now add the diced capsicum and shredded cabbage to the wok. Toss for another minute. The cabbage should wilt slightly but still have crunch — the capsicum should brighten and char in spots. Do not let any of it go fully soft. We want crispness in the final rice.',
      heat: 'High',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Cabbage softens at the edges but holds its shape' },
        { type: 'smell', cue: 'Sweet, slightly smoky capsicum aroma joins the wok' },
      ],
      whyThisMatters:
        'Bandi rice is defined by veg that still snaps when bitten. Overcooked, limp veg makes it taste like takeaway leftovers.',
      image: STEP_IMG(10),
    },
    {
      index: 11,
      title: 'Return the chicken to the wok',
      instruction: 'Tip the seared chicken back in with any resting juices. Toss to combine for 1 minute.',
      beginnerExplanation:
        'Pour the seared chicken and any juices on the resting plate back into the wok. Toss with the veg and egg for one minute. By now the chicken finishes cooking through. Pieces should bounce and brown a little more on contact. If you have an instant-read thermometer, push it into the largest cube — you want 75 °C / 165 °F.',
      heat: 'High',
      durationSec: 60,
      sensoryCues: [
        { type: 'visual', cue: 'Chicken cubes pick up a fresh sheen of colour from the aromatic oil' },
        { type: 'sound', cue: 'A new wave of sharp sizzle as the chicken juices hit the hot wok' },
      ],
      whyThisMatters:
        'Tossing chicken back in early lets its juices flavour the veg and ensures it reaches safe internal temperature.',
      image: STEP_IMG(11),
    },
    {
      index: 12,
      title: 'Add the rice in two batches',
      instruction: 'Tip in half the cold rice. Toss to break clumps. Add the second half. Toss continuously for 2 minutes.',
      beginnerExplanation:
        'Add half the cold oiled rice to the wok. Use the spatula to chop and toss it — break up any clumps without crushing the grains. Once the first half is hot and starting to dance in the pan, add the rest. Keep tossing, scooping from the bottom edges and flipping to the centre. After about 2 minutes every grain should be glossy, hot and separate.',
      heat: 'High',
      durationSec: 120,
      sensoryCues: [
        { type: 'sound', cue: 'Sharp sizzle as cold rice hits the wok; settles into a steady crackle as it dries' },
        { type: 'visual', cue: 'Grains separate, become glossy and lift off the pan as you toss' },
        { type: 'texture', cue: 'Rice feels light and bouncy on the spatula — never wet or sticky' },
      ],
      whyThisMatters:
        'Two batches keeps the wok temperature ripping high. Dumping all the cold rice at once cools the metal and the dish steams.',
      foodScience:
        'A large mass of cold rice would drop the wok surface below the smoke point of the oil. Splitting it in two keeps the pan in the Maillard window throughout the toss.',
      image: STEP_IMG(12),
    },
    {
      index: 13,
      title: 'Sauce the rice from the wok edge',
      instruction: 'Pour the pre-mixed light soy + dark soy + vinegar around the wok rim — never on the rice. Add white pepper, MSG and salt. Toss high to flame-kiss.',
      beginnerExplanation:
        'Lift the wok slightly and pour the pre-mixed soy + dark soy + vinegar all the way around the edge of the wok — not on top of the rice. The sauces flash-cook on the hot metal and release a wave of smoky aroma. Now sprinkle white pepper, MSG (if using) and a small pinch of salt. Toss high and fast — try to lift the rice into the flame for a couple of seconds. You will see and smell the wok hei come alive.',
      heat: 'High',
      durationSec: 90,
      sensoryCues: [
        { type: 'sound', cue: 'A loud hiss as the sauces hit the hot wok rim and steam off' },
        { type: 'smell', cue: 'Sharp soy-vinegar steam followed by a deep smoky, savoury aroma' },
        { type: 'visual', cue: 'Rice takes on a uniform light amber colour — never blotchy dark patches' },
      ],
      whyThisMatters:
        'Pouring sauces around the rim caramelises them onto the metal in milliseconds — they hit the rice as flavoured steam, not as wet liquid. This is the single defining bandi move.',
      foodScience:
        'Soy sauce on hot steel undergoes rapid Maillard browning, producing pyrazines and furans — the molecules behind "wok hei". Poured directly on rice, the sauce just soaks in and salts patches.',
      image: STEP_IMG(13),
    },
    {
      index: 14,
      title: 'Finish with spring onion greens',
      instruction: 'Throw in the spring onion greens. One last high toss to flame-kiss. Kill the heat.',
      beginnerExplanation:
        'Scatter the chopped spring onion greens over the top. Toss once more — high and fast — for about 20 seconds. The greens should brighten and just barely wilt. Cut the heat the moment they smell sharp and fresh.',
      heat: 'High',
      durationSec: 30,
      sensoryCues: [
        { type: 'visual', cue: 'Bright green flecks dotted through amber rice' },
        { type: 'smell', cue: 'Fresh, sharp onion aroma cuts through the smoky base' },
      ],
      whyThisMatters:
        'Spring onion greens added at the end keep their freshness. Added earlier, they wilt to grey and lose their bite.',
      image: STEP_IMG(14),
    },
    {
      index: 15,
      title: 'Plate hot — optional sesame and chilli oil drizzle',
      instruction: 'Pile rice into bowls straight from the wok. Drizzle 1/2 tsp toasted sesame oil and a few drops of chilli oil on top.',
      beginnerExplanation:
        'Bandi rice is a stand-and-eat dish — it loses its smokiness fast. Pile it straight into bowls from the wok. Finish with a quick drizzle of toasted sesame oil for fragrance and, for true street-cart effect, a few drops of chilli oil over the top. Serve immediately with a wedge of lemon and a small bowl of raw onion in vinegar.',
      heat: 'Off',
      durationSec: 30,
      sensoryCues: [
        { type: 'visual', cue: 'Steam rising from a glossy, separate-grained mound of rice' },
        { type: 'smell', cue: 'Toasted sesame and chilli oil sing on top of the smoky base' },
      ],
      whyThisMatters:
        'Wok hei is a volatile aroma — it fades within minutes. Plating fast and eating hot is part of the dish.',
      image: STEP_IMG(15),
    },
  ],

  rescueIssues: [
    {
      id: 'mushy-rice',
      label: 'Rice turned mushy or clumpy',
      icon: 'droplet',
      diagnosis:
        'Rice was too fresh / too warm before frying, OR the wok was not hot enough so the rice steamed instead of fried, OR too much sauce was added at once.',
      immediateFix: [
        'Spread the rice thin across the wok in one layer and crank the heat to maximum.',
        'Leave undisturbed for 1 to 2 minutes to dry out and crisp the bottom.',
        'Add a small splash of oil if it looks dry and gummy.',
      ],
      preventNextTime: [
        'Always use rice that has been refrigerated for at least 30 minutes — overnight is best.',
        'Fluff and oil the rice before it hits the wok.',
        'Heat the wok until you see a wisp of smoke before adding any oil.',
        'Add rice in two batches so the wok temperature does not crash.',
      ],
      foodScience:
        'Cold rice has retrograded starches — the grains are dry on the outside, allowing each one to fry separately. Warm rice still has gelatinised starch on the surface, which turns to glue on heat.',
    },
    {
      id: 'dry-chicken',
      label: 'Chicken came out dry and tough',
      icon: 'thermometer',
      diagnosis:
        'Chicken was overcooked in the initial sear, or the wok was crowded so pieces stewed instead of searing, or the marinade was skipped.',
      immediateFix: [
        'Toss the finished rice with a teaspoon of warm oil and a few drops of vinegar to brighten and lubricate the chicken.',
        'Serve with extra sesame oil drizzle and a cool side of cucumber raita to soften perception.',
      ],
      preventNextTime: [
        'Use chicken thigh, not breast — thigh forgives high heat better.',
        'Always include cornflour in the marinade — it shields moisture during the sear.',
        'Sear in a single layer with space between pieces. Cook in two batches if needed.',
        'Pull chicken off the heat the moment it is just cooked through — it goes back in later.',
      ],
      foodScience:
        'Chicken muscle proteins squeeze out water above 70 °C — every extra minute on heat is more water lost. Cornflour gelatinises into a protective shell that slows this loss.',
    },
    {
      id: 'too-salty',
      label: 'Too salty or soy-heavy',
      icon: 'shaker',
      diagnosis:
        'Soy sauce was poured directly on the rice (pooling instead of distributing), OR salt was added on top of soy without tasting first, OR dark soy was used in a heavy hand.',
      immediateFix: [
        'Squeeze fresh lemon or lime juice over the rice — acid masks salt perception.',
        'Add half a cup of unsalted fluffed rice and toss through to dilute.',
        'Serve with cool plain raita or a slice of cucumber on the side.',
      ],
      preventNextTime: [
        'Pre-mix soy + dark soy + vinegar in a small bowl — pour around the wok rim, never on the rice.',
        'Use dark soy by the teaspoon only — it is 3x more concentrated than light soy.',
        'Taste a grain of rice before adding any salt. Soy carries plenty already.',
      ],
      foodScience:
        'Salt cannot be removed once dissolved. Acid (lemon) and starch (extra rice) can mask or dilute the perception of saltiness but cannot reverse it.',
    },
    {
      id: 'raw-garlic-bitter',
      label: 'Sharp raw garlic taste or burnt-bitter edges',
      icon: 'flame',
      diagnosis:
        'Garlic was added before the wok was hot enough (raw taste), OR garlic was used as paste (water content burned to bitterness), OR garlic stayed in the wok past pale-gold (overcooked).',
      immediateFix: [
        'Finish with a small drizzle of toasted sesame oil — covers the rough edge with a richer aroma.',
        'A squeeze of lime and a scatter of fresh spring onion greens rebalances the dish.',
      ],
      preventNextTime: [
        'Always chop garlic fresh with a knife — never use ginger-garlic paste on a screaming wok.',
        'Wait until the wok smokes before any aromatic goes in.',
        'Cook garlic 10 to 15 seconds only — pull it out the moment edges turn pale gold.',
      ],
      foodScience:
        'Garlic contains allicin (raw, sharp) and water. On a properly hot dry wok, water flashes off and allicin converts to sweet sulphur compounds. On a cool wok, water lingers — garlic boils, never browns, and stays sharp. Past gold, the sugars burn to acrid pyrolysed compounds.',
    },
    {
      id: 'soggy-veg',
      label: 'Vegetables came out soggy and limp',
      icon: 'leaf',
      diagnosis:
        'Veg were diced too large for the short toss time, OR the wok was not hot enough, OR all veg were added together so the soft ones overcooked.',
      immediateFix: [
        'Spread the rice thinly in the wok and re-fire on the highest heat for 90 seconds without stirring — drives off moisture.',
        'A small scatter of fresh spring onion greens and a drizzle of chilli oil restores some crunch perception.',
      ],
      preventNextTime: [
        'Fine-dice veg to 5 mm — uniform and small enough to cook in 1 to 2 minutes.',
        'Add veg in two waves: hard (carrot, beans) first, soft (capsicum, cabbage) a minute later.',
        'Keep the heat ripping high throughout. Lower heat means longer cook time which means soggy veg.',
        'Cabbage especially — wilt only at the edges, never until limp.',
      ],
      foodScience:
        'Plant cell walls collapse when heated past about 80 °C for too long. High heat and short contact denatures the cell-wall enzymes fast enough that texture is preserved.',
    },
  ],

  tasteBalancing: [
    { axis: 'salt', value: 80 },
    { axis: 'acid', value: 50 },
    { axis: 'richness', value: 60 },
    { axis: 'heat', value: 85 },
    { axis: 'aroma', value: 92 },
  ],

  finishingTouches: [
    { id: 'spring-greens', label: 'Spring onion greens', reason: 'Fresh, sharp bite against the smoky rice.', icon: 'leaf', optional: false },
    { id: 'pepper', label: 'Cracked white pepper', reason: 'Adds aromatic heat that builds slowly underneath the soy.', icon: 'flame', optional: false },
    { id: 'sesame-oil', label: 'Toasted sesame oil drizzle', reason: 'Final perfume on the steam — never cooked with.', icon: 'droplet', optional: true },
    { id: 'chilli-oil', label: 'Chilli oil drizzle', reason: 'The street-cart finishing move — visible heat on top.', icon: 'flame', optional: true },
    { id: 'lime', label: 'Lime or lemon wedge', reason: 'A squeeze brightens every grain and cuts the soy.', icon: 'sparkles', optional: true },
  ],

  plating: {
    notes: [
      'Serve very hot, straight from the wok — wok hei aroma fades within minutes.',
      'Pile loosely in the bowl; do not press down.',
      'Pair with cucumber raita, manchurian gravy, or chilli chicken on the side.',
      'Always check chicken is cooked to 75 °C / 165 °F at the centre before serving.',
    ],
    serves: 'Serves 2–3 people',
  },

  storage:
    'Cool completely within 90 minutes. Refrigerate within 2 hours of cooking, in an airtight container, for up to 2 days.',
  reheating:
    'Reheat in a very hot pan with a small splash of water to refresh the rice. Toss high and fast for 2 minutes. Internal temperature must reach 75 °C / 165 °F since chicken is involved.',

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
