# ChefSense AI — Phase 1

Real-time Indian cooking intelligence — a mobile-first PWA that adapts to you, your ingredients, and your taste.

> **This is Phase 1: Foundation.** Project structure, design tokens, types, recipe data, UI primitives, shell components. No AI, no backend, no external API calls.

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

You'll see the Phase 1 boot screen — brand mark, language toggle, design-token swatches, featured dish summary, all dishes loaded, source-category chips. This screen exists to verify everything is wired correctly; the real screens land in Phase 2.

---

## Project structure

```
chefsense-ai/
├── app/
│   ├── globals.css           # Design tokens (CSS variables) + utility classes
│   ├── layout.tsx            # Root layout, font loading, metadata
│   ├── page.tsx              # Phase 1 placeholder home
│   └── providers.tsx         # Client providers (LanguageProvider)
│
├── components/
│   ├── ui/                   # Hand-authored shadcn-style primitives
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── chip.tsx
│   │   ├── input.tsx
│   │   └── progress.tsx
│   │
│   ├── shared/               # Cross-screen UI helpers
│   │   ├── image-with-fallback.tsx
│   │   ├── leaf-divider.tsx
│   │   ├── primary-cta.tsx
│   │   ├── section-heading.tsx
│   │   └── stat-tile.tsx
│   │
│   └── shell/                # App-wide chrome
│       ├── app-shell.tsx     # Phone-frame container
│       ├── bottom-nav.tsx    # 5-tab nav bar
│       ├── brand-logo.tsx    # SVG mark + wordmark
│       ├── header.tsx        # Back, brand, actions, language
│       └── language-toggle.tsx
│
├── lib/
│   ├── constants/
│   │   └── routes.ts         # Central route map (single source of truth)
│   │
│   ├── data/
│   │   ├── paneer-butter-masala.ts   # Full 18-step demo dish
│   │   ├── dal-tadka.ts              # Lighter placeholder
│   │   ├── chicken-biryani.ts        # Lighter placeholder
│   │   └── dishes.ts                 # Index + Zod validation at import time
│   │
│   ├── i18n/
│   │   ├── dictionary.ts             # UI strings en / hi / te
│   │   └── language-context.tsx      # Provider + useLanguage()
│   │
│   ├── source-policy.ts      # Anonymous source categories + legal rules
│   ├── types.ts              # Zod schemas (Dish, CookingStep, RescueIssue, ...)
│   └── utils.ts              # cn(), formatDuration(), clamp()
│
└── public/
    ├── images/               # Drop dish images here (gradient fallback if absent)
    ├── icon-192.svg
    ├── icon-512.svg
    └── manifest.json
```

---

## Design system

All colours flow through CSS variables (`app/globals.css`) and are mirrored in the Tailwind theme (`tailwind.config.ts`) so they're alpha-channel friendly (`bg-primary/40`).

| Token              | Value     | Where to use                        |
| ------------------ | --------- | ----------------------------------- |
| `--background`     | `#FFF8ED` | Page background (warm ivory)        |
| `--surface-warm`   | `#FFF2DE` | Soft inner cards / chip backgrounds |
| `--card`           | `#FFFDF8` | Standard card background            |
| `--primary`        | `#E65A2E` | Appetite orange-red CTAs            |
| `--primary-dark`   | `#B64222` | Darker side of the CTA gradient     |
| `--secondary`      | `#F4A62A` | Ghee gold accents                   |
| `--accent-green`   | `#6F8F3D` | Olive — trust indicators, success   |
| `--copper`         | `#B87333` | Copper details, regional tags       |
| `--turmeric`       | `#D99A21` | Spice accents                       |
| `--chilli`         | `#D94A2B` | Heat indicators                     |
| `--text`           | `#3A2417` | Primary text (dark warm brown)      |
| `--text-muted`     | `#7A6355` | Secondary text                      |
| `--border`         | `#E8D7C2` | Hairlines                           |

**Typography:** Playfair Display (serif, headings), Manrope (sans, body), JetBrains Mono (mono, code). All loaded via `next/font/google`.

**Frame:** Every screen renders inside `.app-frame` — a centred 440px-max container so the UI feels native on mobile and stays readable on desktop.

---

## Recipe data

Each dish is a TypeScript object validated against `DishSchema` (`lib/types.ts`) at import time. Bad data fails the build, not the user.

**Paneer Butter Masala** is the MVP demo dish — 18 cooking steps, 9 rescue cases, 5 success variables, 5 finishing touches, taste-balance values, and sample Hindi + Telugu content translations.

**Dal Tadka** and **Chicken Biryani** are lighter placeholders that satisfy the schema for home-grid testing; they expand in later phases.

### Beginner-language rule

All recipe copy must avoid jargon. The full rule + examples are at the top of `lib/data/paneer-butter-masala.ts`. In short:

- ❌ Bad: *"Reduce the masala."*
- ✅ Good: *"Cook it slowly until it becomes thicker and shinier. Small oil drops should appear around the edges."*

---

## Source / legal policy

See `lib/source-policy.ts`. Summary:

- No real chef names anywhere in the UI.
- No real publication / channel / site names.
- No verbatim recipe copying.
- No implied endorsement.
- Source attribution uses only the **five anonymous categories**:
  1. Top chef-style sources
  2. Regional cooking reference
  3. Technique video reference
  4. Recipe database
  5. Food science reference

Any new source-related UI must pull from `SOURCE_CATEGORIES`.

---

## Image strategy

The Phase 1 prototype ships **zero image assets**. Every image renders via `<ImageWithFallback>`, which gracefully degrades to a warm gradient + glyph if the source 404s. To upgrade to real photography, drop files into the paths referenced in the dish data:

```
public/images/dishes/paneer-butter-masala/hero.jpg
public/images/dishes/paneer-butter-masala/step-1.jpg
public/images/dishes/paneer-butter-masala/step-2.jpg
...
```

No Unsplash, no external CDN, no Next/Image domain config needed.

---

## Assumptions (Phase 1)

1. **No external services.** No Supabase, no OpenAI/Gemini, no scraping, no auth, no database.
2. **No image assets shipped.** Warm gradients handle the missing-image case so the app looks intentional, not broken.
3. **Routes are declared but not all wired.** Real screens land in Phase 2; the route map (`lib/constants/routes.ts`) is the contract.
4. **Bottom-nav items all link to `/home`** for Phase 1. Real targets get wired in Phase 2.
5. **Translation coverage:** UI chrome is fully translated to en / hi / te. Content translations cover the demo dish title, summary, and step 7 — full content translations land in Phase 4.
6. **No `<form>` elements** — kept clean for the build.
7. **Mobile-first.** Layouts are designed against the 440px phone frame. They remain usable on desktop but the visual target is mobile.

---

## What's next: Phase 2 plan

Phase 2 builds out **static UI screens with working navigation, using only the local data**:

- **Welcome** (`/`) — full hero, tagline, source-style preview row, primary CTA.
- **Home** (`/home`) — search bar, featured dish card, popular dishes row, mood grid, recently viewed.
- **Dish Detail** (`/dish/[id]`) — hero image, vegetarian + featured badges, stat tiles, AI-powered summary card, success variables, common mistakes, CTA to plan.
- **Sources** (`/dish/[id]/sources`) — anonymous source category cards with trust scores, consensus footer.
- **Mise en place** (`/dish/[id]/mise-en-place`) — prep progress, tool grid, ingredient checklist, chef tip.
- **Cook** (`/dish/[id]/cook`) — step nav scaffolding (functionality lands in Phase 3).
- **Voice** (`/dish/[id]/voice`) — visual layout (functionality lands in Phase 5).
- **Pan check** (`/dish/[id]/pan-check`) — diagnosis card layout.
- **Rescue** (`/dish/[id]/rescue`) — issue chip grid + detail panel.
- **Finish** (`/dish/[id]/finish`) — taste balance meter, finishing touches list, plating preview.

All navigation will route through `ROUTES.*` — no hardcoded strings.

---

Made with ♥ for Indian kitchens.
