# ChefSense AI

> Real-time Indian cooking intelligence — a mobile-first PWA that adapts to you, your ingredients, and your taste. Cook like a chef, not like a recipe follower.

![Status](https://img.shields.io/badge/status-prototype-orange)
![Framework](https://img.shields.io/badge/Next.js-15.0.2-black)
![Language](https://img.shields.io/badge/TypeScript-5.6-blue)

ChefSense AI is a hackathon prototype exploring what a kitchen assistant would look like if it understood cooking the way a chef does — sensory cues, success variables, food science, taste balancing, common rescue paths — rather than reading you a static recipe.

The MVP demo dish is **Paneer Butter Masala**, with a curated set of five Indian dishes shown across Welcome, Home, and (in upcoming phases) Cook screens. The app supports **English, Hindi, and Telugu** across all UI and dish metadata.

---

## Current state — Phase 2.6

Welcome and Home screens are fully built with real food photography, multilingual content, and a refined visual system.

**What works:**
- Welcome screen with hero food photo, decorative branding, two-CTA flow
- Home screen with horizontal featured card, Popular Dishes row, Cook by Mood strip, Recently Viewed, and inline bottom navigation
- English / Hindi / Telugu language toggle, with translations across UI and dish names
- 5 dish data files passing Zod schema validation at import time
- 5 hero photos at `/public/images/dishes/{dish-id}/hero.jpg`
- Warm ivory palette with appetite-orange CTAs, dark brown text, ghee gold + olive green accents
- Fraunces serif headings, Inter body, JetBrains Mono code

**What's still ahead:**
- Phase 3 — Guided cooking flow (step nav, timer, sensory cues, "fix my dish" button)
- Phase 4 — Full language coverage for the cooking flow
- Phase 5 — Voice cook mode (SpeechSynthesis)
- Phase 6 — Mock API placeholders (`/api/generate-recipe`, `/api/rescue`, `/api/translate`, `/api/analyze-pan`)

---

## Dishes in the MVP

| Dish | Region | Difficulty | Time |
|---|---|---|---|
| Paneer Butter Masala | North Indian | Medium | 35 min |
| Hyderabadi Chicken Biryani | Hyderabadi | Hard | 60 min |
| Dhaba Style Dal Tadka | North Indian | Easy | 25 min |
| Eggs Kejriwal | Bombay Club | Easy | 15 min |
| Bandi Chicken Fried Rice | Hyderabadi Street | Medium | 30 min |

Paneer Butter Masala is the only dish with a complete guided cooking flow; the rest are schema-valid placeholders ready to receive their flows in later phases.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open
http://localhost:3000
```

You'll land on the Welcome screen. Tap **Start Cooking** or **Explore Demo Dish** to navigate to Home. Try the EN / HI / TE toggle in the top right of either screen.

---

## Project structure

```
chefsense-ai/
├── app/
│   ├── globals.css            # Design tokens (CSS variables) + utility classes
│   ├── layout.tsx             # Root layout, font loading, metadata
│   ├── page.tsx               # Welcome screen
│   ├── home/page.tsx          # Home screen
│   └── providers.tsx          # Client providers (LanguageProvider)
│
├── components/
│   ├── ui/                    # Hand-authored shadcn-style primitives
│   ├── shared/                # Cross-screen UI (DishHeroCard, ImageWithFallback, FeaturePill, ...)
│   ├── shell/                 # Shell (AppShell, BrandLogo, BottomNav, LanguageToggle, Header)
│   └── home/                  # Home-specific (SearchBar, DishCard, MoodCard, RecentlyViewedItem)
│
├── lib/
│   ├── constants/routes.ts    # Single source of truth for all route paths
│   ├── data/                  # Static dish data (schema-validated at import time)
│   │   ├── dishes.ts          # Index — imports + validates each dish
│   │   ├── paneer-butter-masala.ts
│   │   ├── chicken-biryani.ts
│   │   ├── dal-tadka.ts
│   │   ├── eggs-kejriwal.ts
│   │   └── bandi-chicken-fried-rice.ts
│   ├── i18n/                  # Language context + dictionary
│   │   ├── language-context.tsx
│   │   └── dictionary.ts      # EN / HI / TE strings, one flat key namespace
│   ├── source-policy.ts       # Anonymous source-category metadata
│   ├── types.ts               # Zod schemas for every dish + UI shape
│   └── utils.ts               # `cn` helper + small utilities
│
└── public/
    └── images/dishes/{id}/hero.jpg
```

---

## Design constraints

The visual and content rules baked into this codebase:

- **Warm ivory backgrounds.** Never dark or black surfaces. Cream cards on warm-ivory canvas with appetite-orange CTAs.
- **No real chef or publication names** anywhere in the codebase. The `lib/source-policy.ts` file restricts every source reference to one of five anonymous categories: `top-chef-style`, `regional`, `technique-video`, `recipe-database`, `food-science`.
- **No verbatim recipes.** Cooking steps are written in original beginner-friendly language. Jargon is rewritten in plain words ("deglaze" → "add a splash of water and gently scrape the tasty stuck bits").
- **Schema-first.** Every dish must pass Zod validation at import time. Bad data fails the build, not the user. The same schema will validate LLM responses in Phase 6.

---

## Tech stack

- **Next.js 15.0.2** (App Router, TypeScript, server components by default)
- **Tailwind CSS 3.4** + hand-authored shadcn-style primitives (no full shadcn install — small footprint)
- **Framer Motion** for transitions
- **Lucide React** for icons
- **Zod** for runtime schema validation
- **Fraunces** + **Inter** + **JetBrains Mono** via `next/font`

No backend, no external API calls, no database. All data is local TypeScript. Phase 6 introduces mock API placeholders intended to be swapped for real LLM calls later.

---

## Adding new dish photography

Drop a JPEG at `/public/images/dishes/{dish-id}/hero.jpg` matching the dish ID from `lib/data/dishes.ts`. `ImageWithFallback` automatically renders it; if the file is missing or fails to load, the component falls back to a warm gradient placeholder with an emoji glyph.

For future cooking-step photos, the path convention is `/public/images/dishes/{dish-id}/step-{n}.jpg`, referenced from the `image` field on each cooking step.

---

## License

Prototype / hackathon project. Not for redistribution in current state.
