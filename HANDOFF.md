# ChefSense AI — Project Handoff

> A briefing for the next builder (human or AI agent) picking up this codebase. Read sections 1–3 even if you skim the rest.

---

## 1. TL;DR

ChefSense AI is a **mobile-first PWA** that turns Indian cooking into a guided, sensory, science-backed experience instead of a static recipe to follow. The MVP demo dish is **Paneer Butter Masala**. The app supports **English, Hindi, and Telugu** across UI and dish metadata.

Stack: **Next.js 15.0.7 + TypeScript + Tailwind + Zod**. Deployed on Vercel.

**Live:** https://chefsense-ai.vercel.app/
**Repo:** https://github.com/scarsymmetry899/chefsense-ai

**Current phase: 2.8** (Welcome + Home screens shipped with real food photography, glass-morphism design language, Instrument Serif + Inter typography). **Phases 3–6 are not built yet.**

**Five things to read before touching code:**
1. Section 5 — Critical content & legal rules. Breaking these breaks the product.
2. Section 6 — Schema-first data layer. Every dish must pass Zod validation at import time.
3. Section 7 — Translation system. Don't hardcode user-facing strings.
4. Section 9 — Phase 6 LLM system prompt. The whole content strategy hinges on this.
5. Section 11 — Workflow. Don't `git push` without `npm run build` succeeding first.

---

## 2. Project identity

### The pitch
A kitchen assistant that understands cooking the way a chef does — sensory cues, success variables, food science, taste balancing, common rescue paths — not the way Allrecipes does (a list of steps and quantities).

### What it isn't
- It is **not a recipe app**. Recipes are commoditised; sensory guidance is not.
- It is **not a content directory**. No browsing 10,000 dishes. The MVP curates 5.
- It is **not generic**. India-first. No fusion content, no Western recipes shoehorned in.

### Target user
A home cook (any level) who has stood at the stove with a recipe open and wondered *"how do I know it's done? am I doing this right?"* — the gap between instructions and execution that real chefs close with years of experience and sensory pattern-matching.

### Hackathon prototype context
This is a prototype, not a launched product. Schema and architecture choices favour iteration speed and future LLM-readiness. There is intentionally no backend yet; Phase 6 introduces mock API stubs designed to be swapped for real LLM endpoints.

---

## 3. Current state — Phase 2.8

### What's shipped (live on Vercel)
- **Welcome screen** (`/`) — hero food photo, centered logo + Instrument Serif headline, two CTAs, language toggle, footer microcopy
- **Home screen** (`/home`) — header with logo + lang toggle + bell, search bar, photo-led featured card with frosted-glass overlay, 5-card horizontal Popular Dishes row, 5-card Cook by Mood strip with outlined icons, 2-card Recently Viewed grid, inline bottom nav
- **EN / HI / TE language toggle** wired through every visible string and dish name
- **5 dish data files** passing schema validation, with full HI + TE translations for `dish.name` and `dish.summary`
- **5 hero photos** at `/public/images/dishes/{dish-id}/hero.jpg` (~370–430 KB each)
- **Official logo** at `/public/logo.png` (512×512, transparent, ~90 KB) — chef hat with circuit-line motif + wok illustration
- **Glass-morphism design language** — translucent white cards with backdrop-blur over a warm-gradient + subtle SVG noise canvas
- **Bottom nav** as inline bar with active state on Home only (other routes don't exist yet)
- **PWA manifest** + icons + theme color (`#FFF8ED`)

### What is NOT shipped (Phases 3–6)
- Dish detail screen, sources screen, mise en place planner, cook flow with timer + sensory cues
- Voice cook mode (SpeechSynthesis / STT)
- API endpoints for recipe generation, rescue, translation, pan-photo analysis
- Tap actions on dish cards (currently all routes point to `/home`)
- Authentication, user accounts, save-to-favorites, history persistence

---

## 4. Tech stack

| Layer | Tool | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 15.0.7 | App Router, TypeScript. Patched for CVE-2025-66478 — do not downgrade below 15.0.7. |
| Language | TypeScript | 5.6 | `strict: true` |
| Styling | Tailwind CSS | 3.4.x | Plus hand-authored shadcn-style primitives (no full shadcn install) |
| Schema | Zod | Latest 3.x | Validates dish data at import time + will validate LLM responses in Phase 6 |
| Icons | Lucide React | Latest | Used everywhere |
| Animation | Framer Motion | Latest | Currently mostly fade-up entrance; cook-flow needs more |
| Fonts | Instrument Serif + Inter + JetBrains Mono | via `next/font/google` | Loaded with explicit weights — do not add `axes` prop to Instrument Serif (weight 400 only) |
| Hosting | Vercel | Hobby plan | Auto-deploys on push to `main` |

No backend. No database. No external API calls. All dish data is local TypeScript in `lib/data/`.

---

## 5. Critical content & legal rules

**These constraints are not negotiable. Breaking them puts the project at legal/reputational risk and undermines the whole content strategy.**

### a. No real chef names
The codebase must never contain — in dish data, system prompts, marketing copy, comments, or anything else — the names of real chefs, real cooking publications, real YouTube channels, or real cookbook titles. No "Sanjeev Kapoor said this method", no "Ranveer Brar's technique", no "according to Tarla Dalal", no "as seen on Hebbar's Kitchen".

### b. Anonymous source categories
Every claim about cooking method or technique must be attributed to one of **five anonymous source categories** (see `lib/source-policy.ts`):

1. **`top-chef-style`** — Professional kitchen methods & heuristics
2. **`regional`** — Traditional regional preparations
3. **`technique-video`** — Visual technique references
4. **`recipe-database`** — Tested recipes & user-validated data
5. **`food-science`** — Ingredients, reactions, science-backed reasoning

A sixth category, `food-safety`, exists for safety-critical claims (meat handling, storage, reheating). Each dish has a `sourceConsensus.sources[]` array that picks from these categories with trust scores. **Never invent a sixth content category or name a real source.**

### c. No verbatim recipes
Cooking-step instructions are written in original beginner-friendly language. Do not paste from any external recipe. The `beginnerExplanation` field on each step is intentionally longer than the `instruction` field — it's the rewrite of jargon into plain words.

### d. Beginner language rule
Cooking jargon must be rewritten. Examples from PBM data:
- "Reduce" → "Cook slowly until thicker and shinier, small oil drops appear at edges"
- "Deglaze" → "Add a splash of water, gently scrape the tasty stuck bits"
- "Sweat the onions" → "Cook onions on low heat until soft and clear, not browned"
- "Temper" → "Heat oil and quickly fry spices for a few seconds to release their flavour"

### e. Food safety conservatism
For dishes involving meat, seafood, eggs, or rice — always include in the `storage` and `reheating` fields:
- Minimum reheat temperature: **75 °C / 165 °F internal**
- Storage limits in days
- Warnings against partial reheating
- Specific guidance for pressure cookers and deep frying when relevant

This applies to PBM (cream), chicken biryani, eggs kejriwal, bandi chicken fried rice. PBM has cream + paneer (dairy handling). Be conservative.

---

## 6. Schema-first data layer

Every dish lives in `lib/data/{dish-id}.ts` exporting a typed `Dish` object. The full Zod schema is in `lib/types.ts`. Important details:

### The `Dish` shape (abbreviated)
```ts
{
  dishId: string,                    // kebab-case, matches filename
  dishName: string,                  // English name
  cuisine: 'Indian',
  region: string,                    // free-form, e.g. "Hyderabadi Street"
  difficulty: 'Easy' | 'Medium' | 'Hard',
  totalTimeMin, prepTimeMin, cookTimeMin: number,
  serves: string,                    // e.g. "2–3"
  isVegetarian: boolean,
  heroImage: string,                 // /images/dishes/{id}/hero.jpg
  summary: string,
  tags: string[],
  mood: string[],
  sourceConsensus: { sources: [{ category, trustScore, tags }], insights: [] },
  ingredients: [{ id, name, quantity, category, note? }],
  tools: [{ id, name }],
  miseEnPlace: [{ id, label, done }],
  successVariables: [{ id, title, detail, icon }],
  commonMistakes: string[],
  cookingSteps: [{ index, title, instruction, beginnerExplanation, heat, durationSec, sensoryCues, whyThisMatters, image }],
  rescueIssues: [{ id, label, icon, diagnosis, immediateFix, preventNextTime, foodScience }],
  tasteBalancing: [{ axis: 'salt'|'acid'|'richness'|'heat'|'aroma', value: 0-100 }],
  finishingTouches: [{ id, label, reason, icon, optional }],
  plating: { notes, serves },
  storage, reheating: string,
  translations?: { hi?: { 'dish.name', 'dish.summary' }, te?: { ... } }
}
```

### Heat values (enum — strict)
`heat` accepts only: `'Low' | 'Medium-low' | 'Medium' | 'Medium-high' | 'High' | 'Off'`. Use `'Off'` for steps with no flame (plating, serving). The schema will reject anything else at build time — we hit this with `null` and `'Medium–low'` (em-dash) bugs before.

### Validation at import time
`lib/data/dishes.ts` imports every dish file and runs `DishSchema.safeParse()` on each. Failures throw with the index, which is why you may see errors like *"Invalid dish data at index 3"* — that means the 4th dish in the validation array. The same `DishSchema` will validate LLM responses in Phase 6, which is why getting it right now matters.

### Adding a new dish
1. Create `lib/data/{dish-id}.ts` exporting a `Dish`
2. Add the import + push into the array in `lib/data/dishes.ts`
3. Drop hero photo at `/public/images/dishes/{dish-id}/hero.jpg`
4. Update the small `dishVisual()` switches in `dish-hero-card.tsx`, `dish-card.tsx`, `recently-viewed-item.tsx` with gradient + glyph fallbacks

---

## 7. Translation system

### Architecture
- **Dictionary lives in `lib/i18n/dictionary.ts`** — three locale objects (`en`, `hi`, `te`) keyed identically. TypeScript enforces that adding a key in `en` requires adding it in `hi` and `te` too.
- **Language context lives in `lib/i18n/language-context.tsx`** — exposes `useLanguage()` hook that returns `{ t, tx, lang, setLang }`.
- **`t(key)`** translates a static dictionary key.
- **`tx(key, fallback, langMap?)`** translates a key, falling back to the English string if missing. The `langMap` parameter is for per-dish translations (see below).

### Adding a new translatable string
1. Add the key to all three locales in `lib/i18n/dictionary.ts`
2. Use `t('your.key')` in the component
3. Keys follow `namespace.identifier` dot-notation convention (e.g., `home.featured`, `cta.startCooking`)

### Per-dish translations
Each dish's `translations` field carries `'dish.name'` and `'dish.summary'` for `hi` and `te`. Components retrieve them via:
```ts
const trans = dish.translations as { hi?: ..., te?: ... } | undefined;
const langMap = trans?.[lang as 'hi' | 'te'];
const name = tx('dish.name', dish.dishName, langMap);
```

### Difficulty/mood labels
Difficulty values `'Easy' | 'Medium' | 'Hard'` are stored in English in the schema but rendered via `t(`difficulty.${dish.difficulty}`)`. Same pattern for mood labels (`mood.comfort`, `mood.quick`, etc.).

### Mood card labels currently translated
- `mood.comfort` (Comfort Food / कम्फ़र्ट फ़ूड / కంఫర్ట్ ఫుడ్)
- `mood.quick` (Quick & Easy / जल्दी और आसान / త్వరగా & సులభం)
- `mood.protein` (High Protein / हाई प्रोटीन / హై ప్రోటీన్)
- `mood.weekend` (Weekend Special / वीकेंड स्पेशल / వీకెండ్ స్పెషల్)
- `mood.festive` (Festive Treats / त्योहारी व्यंजन / పండుగ వంటకాలు)

---

## 8. Design language

### Palette (all defined as HSL channels in `globals.css`, accessed via Tailwind tokens)
| Token | Value | Use |
|---|---|---|
| `background` | `#FFF8ED` warm ivory | Canvas |
| `surface-warm` | `#FFF2DE` warm cream | Card variant |
| `card` | `#FFFDF8` warm off-white | Primary card |
| `primary` | `#E65A2E` appetite orange | CTAs, headlines emphasis, active states |
| `primary-dark` | `#B64222` deeper orange | Gradient CTA bottom |
| `secondary` | `#F4A62A` ghee gold | Featured pill, sub-accents |
| `accent-green` | `#6F8F3D` olive green | Veg badge, success, View All links |
| `copper` | `#B87333` | Secondary accents, captions |
| `foreground` | `#3A2417` dark brown | Body text |
| `border` | `#E8D7C2` soft beige | Card borders (the visible ones) |

**Never use dark or black surfaces.** This is intentional. The whole design language is warm light food-tech, not midnight dashboard.

### Typography
- **`font-serif` → Instrument Serif (weight 400 only)** — thin, editorial, used by Linear/Vercel. Do not add `axes` prop or extra weights (they don't exist). Use italics for emphasis instead of bold weight.
- **`font-sans` → Inter (400/500/600/700)** — body text
- **`font-mono` → JetBrains Mono** — code snippets if needed

### Glass morphism approach
Used on mood cards, recently-viewed items, search bar, and the featured-card's overlay panel. Pattern:
```
border border-white/70 bg-white/45 backdrop-blur-xl
shadow-[0_4px_16px_-6px_rgba(58,36,23,0.18)]
before:absolute before:inset-x-0 before:top-0 before:h-px
  before:bg-gradient-to-r before:from-transparent
  before:via-white/95 before:to-transparent  /* top-edge inner highlight */
```

The canvas (`<body>`) carries multiple radial gradients + subtle SVG noise (in `globals.css`) so glass cards have something visually interesting to "frost over." Without the canvas texture, the glass effect on a flat cream background is invisible.

### Photography-first
Real food photography lives at `/public/images/dishes/{id}/hero.jpg`. The `ImageWithFallback` component renders the photo and falls back to a warm gradient + emoji glyph if the image fails to load. **Adding a new dish?** Drop the hero photo in the right path and it appears everywhere.

### Featured card design pattern (the photo-led hero card)
Full-bleed photo as background → subtle dark gradient at bottom for legibility → frosted glass panel floating over the lower half with dish name, summary, stats, and CTA. Pattern reused for the featured slot on Home and the eventual dish detail screen.

---

## 9. Phase roadmap

### Phase 3 — Guided cooking flow (NEXT)
Four connected screens, accessed by tapping the featured card or any popular dish card:

1. **Dish Intelligence** (`/dish/[id]`) — photo, dish name, AI-Powered Summary badge, 4-tile stat row (Difficulty / Total Time / Serves / Cuisine), Chef Success Variables, Common Mistakes, CTA to Mise en Place
2. **Sources** (`/dish/[id]/sources`) — "Building your master-chef guide" intro, progress indicator "Comparing 5 trusted source styles," 5 source cards with trust scores from the 5 anonymous categories, "What top chef-style methods agree on" insights box, CTA to Mise en Place
3. **Mise en Place** (`/dish/[id]/mise-en-place`) — prep progress bar, prep-time + tools + ingredients counts, drag-and-drop checklist with strikethrough, Chef Tip callout, CTA to Cook
4. **Cook flow** (`/dish/[id]/cook?step=N`) — step image, "Step N of M" + progress dots, instruction, heat/timer/step-progress triplet, sensory cues grid (visual/smell/sound/texture), "Why this matters" expandable, three buttons (Mine looks different / Fix my dish / Next step), bottom microcopy

**Timer behaviour:** wait for user to tap Next. Do not auto-advance. The user is in a kitchen, not staring at the screen — auto-advance is dangerous if they haven't finished the step.

### Phase 4 — Full language coverage for cook flow
Translate every cooking step's title, instruction, beginnerExplanation, sensory cues, and "why this matters" into Hindi and Telugu. Use the same `translations` pattern on each cooking step. Currently only `dish.name` and `dish.summary` are translated per dish.

### Phase 5 — Voice cook mode
Toggle on the cook screen flips it into voice mode. Uses Web Speech API:
- `SpeechSynthesisUtterance` for reading instructions aloud (Hindi / Telugu / English voices)
- `SpeechRecognition` for "what should it look like now?", "mine is sticking", "next step"
- Reference: image 12 from the original mockup set

### Phase 6 — Mock API placeholders
Four API routes to introduce, designed as future swap points for real LLM/CV calls:
- `POST /api/generate-recipe` — request `{ dishName, dietary?, region?, locale? }`, response is a full `Dish`-shaped object that passes schema validation. **System prompt is in Section 10.**
- `POST /api/rescue` — request `{ dishId, issue, context? }`, response is a `RescueIssue`-shaped object
- `POST /api/translate` — request `{ text, fromLocale, toLocale }`, response is `{ translated }`
- `POST /api/analyze-pan` — request `{ imageBase64, currentStep?, dishId? }`, response is the Pan Check screen data (image 13 in mockups)

All four return mocked but realistic data in Phase 6 — real LLM/CV integration is a later phase.

---

## 10. The Phase 6 LLM system prompt (canonical)

This is the system prompt for `POST /api/generate-recipe`. The constraints here are derived from Section 5's content rules.

```
You are ChefSense AI, a real-time Indian cooking intelligence assistant.
Your job is to generate a single dish's structured cooking data for a
mobile-first PWA used by home cooks in India.

OUTPUT FORMAT
You MUST return strict JSON conforming to the Dish schema (see schema.ts).
No prose outside the JSON. No markdown fences. No commentary. If you cannot
produce valid JSON, return {"error": "<short reason>"}.

SOURCE POLICY
Every claim about technique or method must be attributed to one of these
five anonymous source categories ONLY. Never name a real chef, real
publication, real YouTube channel, or real cookbook.

  1. top-chef-style    — Professional kitchen methods & heuristics
  2. regional          — Traditional regional preparations
  3. technique-video   — Visual technique references
  4. recipe-database   — Tested recipes & user-validated data
  5. food-science      — Ingredients, reactions, science-backed reasoning

For safety-critical claims (meat handling, storage, reheating) use:
  6. food-safety       — Food safety guidance

NO VERBATIM RECIPES
Do not reproduce any external recipe. Write all instructions in original
language. Cooking jargon must be rewritten in plain words. Examples:
  - "reduce" → "cook slowly until thicker and shinier, with small oil drops at edges"
  - "deglaze" → "add a splash of water and gently scrape the tasty stuck bits"
  - "sweat the onions" → "cook onions on low heat until soft and clear, not browned"

BEGINNER LANGUAGE
For every cooking step, provide both an `instruction` (concise, ~1 sentence)
and a `beginnerExplanation` (longer, paragraph-form, removing all jargon).

FOOD SAFETY CONSERVATISM
For dishes involving meat, seafood, eggs, rice, or dairy, include in
`storage` and `reheating`:
  - Minimum reheat temperature: 75°C / 165°F internal
  - Storage limits (days), refrigerated only
  - Warnings against partial reheating
  - Pressure-cooker and deep-frying caveats where relevant

INDIAN CULINARY GROUNDING
Default region is India. Use Indian ingredient names (haldi, jeera, hing,
kasuri methi). Indian quantities (cups, tbsp, tsp, pinch). Indian techniques
(tadka, dum, bhuna). Do not Westernise.

LANGUAGE & TRANSLATION
The `dishName` and `summary` fields in English. Always include
`translations.hi` and `translations.te` with at minimum `dish.name` and
`dish.summary` translated. For Hindi use Devanagari script. For Telugu use
Telugu script.

SCHEMA FIELDS THAT NEED CARE
  - `difficulty`: 'Easy' | 'Medium' | 'Hard' only
  - `heat`: 'Low' | 'Medium-low' | 'Medium' | 'Medium-high' | 'High' | 'Off' only
    (no null, no em-dashes — use regular hyphen)
  - `sensoryCues[].type`: 'visual' | 'smell' | 'sound' | 'texture' only
  - `tasteBalancing[].axis`: 'salt' | 'acid' | 'richness' | 'heat' | 'aroma' only
  - `mood`: free string array, but prefer 'Comfort Food' | 'Quick & Easy' |
    'High Protein' | 'Weekend Special' | 'Festive Treats'

QUALITY BAR
  - Minimum 8 cooking steps for any non-trivial dish
  - Each step should have at least 2 sensory cues
  - Successful variables (3–5 per dish) — the things that separate a
    restaurant-quality version from a mediocre one
  - Common mistakes (3–5 per dish) — what beginners get wrong

FAILURES YOU MUST AVOID
  - Inventing a source name
  - Mentioning a real chef or publication
  - Returning prose around the JSON
  - Using `null` for heat
  - Using an em-dash (–) instead of a hyphen (-) in 'Medium-low' / 'Medium-high'
  - Forgetting `translations.hi` / `translations.te`
  - Generic "season to taste" without specifying a starting amount
```

---

## 11. Workflow

### Local development
- **OS:** project was built on Windows 11, but the codebase is OS-agnostic
- **Path:** `C:\Users\<user>\Downloads\chefsense-ai\chefsense-ai\` (double-nested from the original zip extraction)
- **Dev server:** `npm run dev` → http://localhost:3000
- **Production build:** `npm run build` — must succeed before any `git push`

### The single most important rule
**Never `git push` if `npm run build` fails locally.** Vercel will reject the deploy and silently keep serving the previous version, leading to false "nothing changed" complaints. Phase 2.7 ate ~30 minutes of debugging because of this.

### Git workflow
```bash
# After changes:
npm run build                  # Must end with "✓ Compiled successfully"
git add -A
git commit -m "Phase X.Y: <one-line summary>"
git push
```

### Vercel
- Hobby plan, project: `chefsense-ai`
- Auto-deploys on push to `main`
- Build takes ~60–90s
- **Vercel has a security gate that blocks deployments with critical Next.js CVEs.** This is why we're locked to ≥ 15.0.7 and why downgrading would break the deploy.

### Windows-specific gotchas
- `Expand-Archive -Force` silently skips locked files. Stop the dev server (`Get-Process node | Stop-Process -Force`) before extracting any patch zip.
- LF/CRLF warnings on `git add` are normal and can be ignored.
- The `winget install --id GitHub.cli` flow + `gh auth login` is the easiest path to authenticated pushes from Windows; saves having to deal with PAT rotation.

### Testing
There are no automated tests yet. The Zod schema is the closest thing to a contract — bad dish data will fail at import time with a clear error.

---

## 12. Known issues / open TODOs

1. **No tap actions on dish cards.** All `href` props point to `/home` until Phase 3 builds the dish detail screen. The bottom-nav active-state check is hardcoded to `home` for this reason.
2. **npm audit shows residual moderate vulnerabilities.** Mostly Next.js cumulative issues across the 15.x line that don't apply to our usage (no middleware, no Next/Image optimizer in use, no Server Actions, no Cache Components). Worth re-running `npm audit` before any production launch and considering a jump to 15.5.x or 16.x.
3. **No real OG image.** OpenGraph metadata uses `/logo.png` which is 1:1 square; ideally should be 1200×630 with brand styling.
4. **Photos may have white edge artefacts** from JPEG-to-PNG transparency conversion. If you re-process the logo or dish photos, use a higher `-fuzz` value in ImageMagick (e.g., `-fuzz 10%`) but check it doesn't eat foreground pixels.
5. **Bottom nav routes for Cook / Rescue / Pantry / Profile don't exist.** Tapping them goes to `/home`. Phase 3 introduces Cook; the others stay placeholder for the MVP.
6. **Translation completeness.** Only UI strings + `dish.name` + `dish.summary` are translated. Cooking step content, success variables, common mistakes, sensory cues, etc. are English-only until Phase 4.
7. **No tests, no CI.** Just `npm run build` as the smoke test.

---

## 13. Pointers for whoever picks this up

### If you're a human contributor
- Read `lib/data/paneer-butter-masala.ts` first — it's the canonical example of what a fully-fleshed dish looks like
- The other 4 dishes (chicken biryani, dal tadka, eggs kejriwal, bandi chicken fried rice) are schema-valid but only have 3–4 cooking steps each, not the full 18 PBM has
- Run `npm run dev` and click around; the broken-pointer cursor on Mood and Recently Viewed is intentional (no routes yet)

### If you're an AI agent (Codex, Cursor, etc.)
- The `Dish` schema in `lib/types.ts` is your contract. Conform to it strictly when generating new dish data.
- Use the `tx()` translation helper, not raw string literals, for any user-visible text.
- When in doubt about a visual choice, look at how the *Featured card on `/home`* is built — that's the canonical premium-card pattern for this project.
- Do not add `axes` to the Instrument Serif `next/font/google` config — it ships only weight 400 and the build will reject `axes` with a static font.
- The `dish-illustration.tsx` SVG component was deleted in Phase 2.6; do not re-add it. Use `<ImageWithFallback>` with the photo path instead.

### Quick-reference cheat sheet
```
Brand wordmark              → <BrandLogo size="sm|md|lg|xl" stacked? />
Translatable string         → t('namespace.key')
Translatable dish field     → tx('dish.name', fallback, langMap)
Photo with fallback         → <ImageWithFallback src=... gradient=... fallbackGlyph=... />
Glass card recipe           → border border-white/70 bg-white/45 backdrop-blur-xl
                                + before: top-edge highlight pseudo-element
Primary CTA                 → rounded-full gradient-cta px-* py-* text-white shadow-cta
Photo-led featured card     → DishHeroCard with variant="horizontal" showInlineCta
Standard dish card          → DishHeroCard with variant="lush"
Schema validation           → DishSchema.safeParse() in lib/data/dishes.ts
Heat enum (strict!)         → 'Low'|'Medium-low'|'Medium'|'Medium-high'|'High'|'Off'
```

---

## 14. Recent iteration history (for context)

Skim if you want to know why the codebase looks the way it does:

- **Phase 1:** Foundation — design tokens, Zod schema, PBM data, primitives, shell
- **Phase 2:** First pass at Welcome + Home — broken layouts, fixed in 2.5
- **Phase 2.5:** Major rework to match reference mockups — horizontal featured card, outlined mood icons, inline bottom nav
- **Phase 2.5b/c:** Bug fixes — Tailwind cache invalidation, photo emoji sizing, bottom-nav active state
- **Phase 2.6:** Real food photography integrated — replaced SVG illustrations with hero JPGs; dropped Masala Dosa, added Eggs Kejriwal + Bandi Chicken Fried Rice as the 5-dish MVP set
- **Phase 2.7:** Mobile featured-card fixes, glass-morphism intro attempt (was too subtle), font swap to Fraunces (didn't visually register) — **shipped with a bug**, Vercel kept serving 2.6
- **Phase 2.8:** This iteration — new official PNG logo, dramatic font swap to Instrument Serif, completely redesigned featured card (photo-led with floating glass panel), glass morphism made actually visible via canvas-level gradients + noise texture

---

*This document is canonical. If it diverges from the code, the code is wrong — fix the code, not this doc. If you make significant architectural changes, update this doc in the same PR.*
