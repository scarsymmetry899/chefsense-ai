# ChefSense AI

> Chef-guided Indian cooking — a mobile-first PWA that walks you through every dish like a masterchef. Real step-by-step guidance, sensory cues, live AI coaching, and smart rescue tips when things go wrong.

[![Live App](https://img.shields.io/badge/Live%20App-chefsense--ai.vercel.app-orange?style=flat-square)](https://chefsense-ai.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?style=flat-square)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square)

---

## What is ChefSense AI?

ChefSense AI is a full-stack AI cooking companion for Indian home cooks. Unlike a recipe app that reads you instructions, ChefSense:

- **Guides each step** with exact timers, heat settings, and sensory checkpoints (what to see, smell, hear, feel)
- **Talks and listens** — a real-time voice & chat coach powered by Whisper + GPT-4o + ElevenLabs
- **Analyses your pan** mid-cook using GPT-4o vision and flags the specific problem
- **Rescues the dish** with context-aware AI fixes when something goes wrong
- **Scores your plating** and helps you share the result with an AI-generated caption
- **Works in English, Hindi, and Telugu** — every string, including on-demand Gemini translation fallback

---

## Live Demo

**→ [https://chefsense-ai.vercel.app](https://chefsense-ai.vercel.app)**

Create a free account or use the app on any mobile browser. Works best on Android/iOS Chrome.

---

## Dishes

All five dishes have complete guided cooking flows with 11–18 steps, mise-en-place checklists, sensory cues, and AI rescue scenarios.

| Dish | Region | Difficulty | Time | Steps |
|---|---|---|---|---|
| Paneer Butter Masala | North Indian | Medium | 35 min | 18 |
| Hyderabadi Chicken Biryani | Hyderabadi | Hard | 105 min | 18 |
| Dhaba Style Dal Tadka | North Indian | Easy | 60 min | 15 |
| Eggs Kejriwal | Bombay Club | Easy | 18 min | 11 |
| Bandi Chicken Fried Rice | Hyderabadi Street | Medium | 45 min | 15 |

---

## Features

### Guided Cook Flow
- Step-by-step navigation with URL-based deep linking (`/dish/[id]/cook?step=N`)
- Per-step countdown timer with start / pause / resume
- Heat indicator, sensory cue cards (visual / smell / sound / texture)
- Progress persisted to localStorage + Supabase in real time
- ResumeBanner — floating pill that surfaces an in-progress cook from anywhere in the app
- "Finish cooking" navigates to a plating & score screen

### Voice & Chat Cooking Coach (In Progress)
- **Talk to chef** — records audio via MediaRecorder → Whisper (STT) → GPT-4o → ElevenLabs (TTS)
- **Chat with chef** — text input → GPT-4o, step-aware context injected in system prompt
- Locale-aware (EN / HI / TE) voice IDs and system prompts
- Android overlay permission error detection with retry guidance
- Fallback keyword-matching replies when OpenAI is unavailable

### AI Pan Checker
- Upload a photo of your pan mid-cook
- GPT-4o Vision analyses it against the current step's sensory cues and rescue issue options
- Returns dish-specific chip labels (e.g. *"Bottom burnt"*, *"Rice mushy"* for biryani)
- `dishMatchConfidence` score — shows a warning if the image doesn't look like the dish
- Falls back to static dish rescue issues when no image is provided

### AI Share Captions
- Generates a dish-specific, tone-aware caption via GPT-4o
- Three tones: Fine Dining, Instagram Foodie, Casual
- Three languages: English, Hindi (Devanagari), Telugu
- Shares the uploaded plate photo alongside the caption using `navigator.share`

### Translation (EN / HI / TE)
- All UI strings translated in a flat dictionary
- Smart Gemini fallback: any dictionary key whose HI/TE value matches the EN default is auto-translated on demand via `/api/translate`
- `<TT>` component + `useTranslatedText` hook for inline on-demand translation of hardcoded strings
- Server-side LRU cache (200 entries) + client-side cache (300 entries) to minimise API calls

### Profile & Scoring
- Auth via Supabase email/password
- Profile page: name, tagline, avatar upload (Supabase Storage)
- ChefScore — SVG arc gauge fed from completed cook sessions
- Session history: recently cooked dishes with plating scores
- Taste axis self-rating per cook (Too low / Just right / Too high across 5 axes)

### Search
- Functional live search across all dishes (name, region, cuisine, summary, tags)
- Not-found state lists all available dishes as suggestions
- Direct navigation to dish detail on selection

### Share a Dish Guide
- One-tap share from the home screen
- Composes a full recipe snapshot (name, time, difficulty, top ingredients, summary, app URL)
- Native share sheet on mobile; clipboard copy with toast on desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + hand-authored design tokens |
| Animation | Framer Motion (3D coverflow, drag gestures) |
| Icons | Lucide React |
| Validation | Zod (dish schema validated at import time) |
| Auth | Custom Supabase REST client (no `@supabase/ssr`) |
| Database | Supabase Postgres (`user_state`, `voice_turns` tables) |
| STT | OpenAI Whisper |
| LLM | OpenAI GPT-4o / GPT-4o-mini |
| TTS | ElevenLabs (multilingual model, per-locale voice IDs) |
| Translation | Google Gemini 2.0 Flash |
| Vision | OpenAI GPT-4o Vision |
| Fonts | Fraunces (serif) + Inter (sans) |

---

## API Routes

| Route | Purpose |
|---|---|
| `POST /api/voice/turn` | Audio blob → Whisper → GPT-4o → ElevenLabs pipeline |
| `POST /api/voice-coach` | Text question → step-aware GPT-4o response |
| `POST /api/analyze-pan` | Image + dishId → GPT-4o Vision analysis + rescue chip labels |
| `POST /api/analyze-plate` | Plating image → GPT-4o Vision score + taste axis feedback |
| `POST /api/caption` | dishId + tone + language → GPT-4o generated social caption |
| `POST /api/translate` | Text → Gemini 2.0 Flash translation (server-side LRU cached) |
| `POST /api/rescue` | Dish + issue → GPT-4o rescue coaching |
| `POST /api/explain-axis` | Taste axis + dish → GPT-4o explanation tooltip |
| `GET /api/health` | Integration health check (OpenAI, ElevenLabs, Gemini, Supabase) |

---

## Project Structure

```
chefsense-ai/
├── app/
│   ├── page.tsx                    # Welcome / landing screen
│   ├── home/page.tsx               # Home dashboard (carousel, mood, recent)
│   ├── dishes/page.tsx             # Dish catalogue with mood filters
│   ├── login/page.tsx              # Auth (sign in + sign up)
│   ├── profile/page.tsx            # Profile, ChefScore, session history
│   ├── pantry/page.tsx             # Tools & pantry (coming soon placeholder)
│   ├── auth/callback/route.ts      # Supabase email confirmation handler
│   ├── dish/[id]/
│   │   ├── page.tsx                # Dish detail (hero, ingredients, steps overview)
│   │   ├── cook/page.tsx           # Step-by-step guided cook flow
│   │   ├── finish/page.tsx         # Plating score + taste axis ratings
│   │   ├── pan-check/page.tsx      # AI pan analysis mid-cook
│   │   ├── share/page.tsx          # Caption generator + photo share
│   │   ├── sources/page.tsx        # Recipe source methodology
│   │   ├── mise-en-place/page.tsx  # Prep checklist
│   │   └── rescue/page.tsx         # AI rescue coach
│   └── api/                        # All AI + data API routes (see table above)
│
├── components/
│   ├── cook/
│   │   ├── voice-chat-panel.tsx    # Voice + text chat cooking assistant
│   │   └── rescue-coach.tsx        # In-step rescue modal
│   ├── dish/screen-kit.tsx         # Shared dish screen primitives
│   ├── home/
│   │   ├── search-bar.tsx          # Live dish search with not-found state
│   │   ├── dish-card.tsx           # Horizontal scroll dish card
│   │   ├── mood-card.tsx           # Cook-by-mood chip
│   │   └── recently-viewed-item.tsx
│   ├── shared/
│   │   ├── dish-hero-card.tsx      # Featured dish card (lush + horizontal variants)
│   │   ├── image-with-fallback.tsx # Image with gradient placeholder
│   │   └── translated.tsx          # <TT> on-demand Gemini translation component
│   └── shell/
│       ├── app-shell.tsx           # Root layout wrapper
│       ├── bottom-nav.tsx          # 5-tab bottom navigation
│       ├── header.tsx              # Back nav + title bar
│       ├── brand-logo.tsx
│       ├── language-toggle.tsx     # EN / HI / TE pill toggle
│       └── resume-cook-banner.tsx  # Floating "resume cook" pill
│
├── lib/
│   ├── ai/
│   │   ├── openai.ts               # GPT-4o + vision helpers
│   │   ├── whisper.ts              # Whisper STT
│   │   ├── elevenlabs.ts           # TTS with locale-specific voice IDs
│   │   └── gemini.ts               # Gemini translation (culinary-aware prompt)
│   ├── auth/browser.ts             # Custom Supabase auth client (no SDK)
│   ├── cooking-session.ts          # useCookingSession hook + localStorage persistence
│   ├── data/                       # 5 dish data files (Zod-validated at import)
│   ├── dish-flow.ts                # Dish helpers + share caption templates
│   ├── i18n/
│   │   ├── dictionary.ts           # EN / HI / TE flat key dictionary
│   │   ├── language-context.tsx    # Language provider + smart Gemini fallback in t()
│   │   ├── translate-client.ts     # Client-side translation cache + API wrapper
│   │   ├── use-dynamic-translation.ts
│   │   ├── use-localized-dish.ts
│   │   └── use-localized-step.ts
│   ├── persistence/
│   │   ├── storage.ts              # localStorage read/write helpers
│   │   └── supabase-browser.ts     # localStorage ↔ Supabase sync layer
│   ├── supabase/                   # Supabase REST client (url, anon key, fetch helpers)
│   ├── types.ts                    # Zod dish schema + TypeScript types
│   └── user-state.ts               # Profile, recently viewed, share actions
│
├── supabase/
│   ├── schema.sql                  # Full DB schema
│   └── migrations/
│       ├── 0001_user_state.sql     # user_state JSONB table
│       └── 0002_voice_turns.sql    # voice_turns log table
│
└── middleware.ts                   # Auth guard: /dish/*, /profile, /pantry → /login
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_VISION_MODEL=gpt-4o          # optional, defaults to gpt-4o

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=                 # English voice ID
ELEVENLABS_VOICE_ID_HI=              # Hindi voice ID
ELEVENLABS_VOICE_ID_TE=              # Telugu voice ID

# Google Gemini
GEMINI_API_KEY=
# or: GOOGLE_GENERATIVE_AI_API_KEY=
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env.local

# 3. Apply Supabase migrations (or run supabase/schema.sql in the SQL editor)
# See supabase/migrations/README.md

# 4. Start dev server
npm run dev

# 5. Open
http://localhost:3000
```

---

## Supabase Setup

Two tables are required:

**`user_state`** — stores all per-user persistent state as JSONB (cooking sessions, language, profile, recently viewed, etc.)
```sql
-- See supabase/migrations/0001_user_state.sql
```

**`voice_turns`** — append-only log of every voice/chat coaching turn
```sql
-- See supabase/migrations/0002_voice_turns.sql
```

Enable Row Level Security on both tables. Users can only read/write their own rows.

In **Authentication → URL Configuration**, set:
- **Site URL** → your deployed Vercel URL (e.g. `https://chefsense-ai.vercel.app`)
- **Redirect URLs** → add `https://*.vercel.app/**` to support preview deployments

---

## Design Principles

- **Warm ivory palette** — never dark or black surfaces. Cream cards on warm-ivory canvas, appetite-orange CTAs, ghee-gold accents
- **Mobile-first thumb zone** — all primary CTAs anchored to the bottom 40% of the screen (min-height 44px)
- **Type ladder** — 44/32/22px serif headings + 16/14/12px Inter body, enforced via `.h-display`, `.h-section`, `.h-card` utilities
- **No chef/publication names** — all source references are anonymised to five categories defined in `lib/source-policy.ts`
- **No verbatim recipes** — all instructions written in original beginner-friendly language
- **Schema-first data** — every dish must pass Zod validation at import time; bad data fails the build, not the user

---

## License

Prototype project. All rights reserved.
