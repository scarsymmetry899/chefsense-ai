# Codex Brief — ChefSense AI Pickup

> Read this **after** `HANDOFF.md`. Where this brief and HANDOFF.md disagree about visual direction, **this brief wins** — it reflects the most recent founder review (Phase 2.8 retrospective).

---

## 1. State of the project right now

- **Live URL:** https://chefsense-ai.vercel.app/
- **Repo:** https://github.com/scarsymmetry899/chefsense-ai
- **Last successful deployment:** commit `947312d` (Next.js 16.2.6 upgrade), which pulled in all prior Phase 2.x changes.
- **Current branch:** `main`
- **Tech:** Next.js 16.2.6, TypeScript 5.6, Tailwind 3.4, Zod, Framer Motion, Instrument Serif + Inter via `next/font`

The codebase is structurally healthy: schema-validated dish data, typed translation layer, App Router, all builds pass with `npm run build`. The thing that's not landing is the **visual language** decisions made in Phase 2.8.

## 2. What's working — preserve these in the pivot

These are founder-approved and should not be revisited:

- **Real food photography** as the visual anchor across all dish references (5 hero JPGs in `/public/images/dishes/{id}/hero.jpg`)
- **Official PNG logo** at `/public/logo.png` (chef-hat-with-circuits + brown-wok-with-flames illustration)
- **Logo + wordmark composition** — chef-hat icon above "ChefSense AI" with italic primary-orange "AI" — works well on Welcome
- **EN / HI / TE language toggle** with translations for UI strings and dish names (`tx()` helper in `lib/i18n/language-context.tsx`)
- **Schema-first dish data** — Zod validation at import time in `lib/data/dishes.ts`. Do not break this contract.
- **Content rules from HANDOFF.md Section 5** — no real chef names, 5 anonymous source categories, beginner-language jargon rewrites, food-safety conservatism. These are non-negotiable.
- **5-dish MVP set** — Paneer Butter Masala (flagship), Hyderabadi Chicken Biryani, Dhaba Style Dal Tadka, Eggs Kejriwal, Bandi Chicken Fried Rice
- **Warm ivory palette** — never dark or black surfaces. Cream canvas, appetite-orange CTAs, ghee-gold + olive-green accents.
- **Bottom nav structure** — 5 items: Home / Cook / Rescue / Pantry / Profile, with only Home active until Phase 3
- **Popular Dishes horizontal-scroll row** — works as designed
- **Cook by Mood section structure** (5 outlined icons) — just dial back the glass treatment

## 3. What needs the next pass

Three specific founder critiques after reviewing the live Phase 2.8 build.

### A. Typography — pivot away from editorial serif

**Current:** Instrument Serif (display headlines) + Inter (body). Reads as "Linear / Vercel premium tech." Doesn't fit the founder's vision.

**Target vibe:** Food-brand typography — chunky, friendly, slightly rounded, playful but still premium. References named by the founder:

- Burger King (post-2021 rebrand) uses **"Flame"** — chunky, retro-organic, friendly
- Cheetos uses bold playful display work
- Zomato uses **Okra** (proprietary) — rounded geometric sans

**Specific Google Fonts to evaluate as replacements:**

| Font | Role | Why |
|---|---|---|
| **Bricolage Grotesque** | Display | Chunky, characterful, perfect for food-brand headlines. Very close to the Burger King Flame energy. |
| **Outfit** | Body / UI | Geometric, rounded, friendly. Closest free analog to Zomato's Okra. |
| **Plus Jakarta Sans** | Body alt | Modern geometric, friendly, slightly more neutral than Outfit |
| **DM Serif Display** | Display alt | If a serif is desired, this is bolder + friendlier than Instrument Serif |
| **Cabinet Grotesk** | Display alt | Closer to Burger King's Flame character than Bricolage |

**Recommended first attempt:** Bricolage Grotesque (display) + Outfit (body). Swap in `app/layout.tsx`, then audit every `font-serif`-tagged element to make sure weights and sizes still work. Build, screenshot, get founder feedback before pursuing further design changes.

Once typography is locked, the founder will form opinions on everything else based on the new aesthetic, so this is the right thing to do first.

### B. Glass morphism — dial back or remove

**Current:** White panels at 45–55% opacity with `backdrop-blur-xl` over food photos (featured card), over cream canvas (mood cards, recently viewed, search bar). Founder review: "the frosted glass thing is really bad how it's looking."

**Why it's not working:**
- On the featured card, the brown/orange tint of the PBM photo bleeds through the glass and muddies the text contrast — the dish name and summary feel washed out
- On mood cards and recently-viewed cards, glass over a cream canvas has almost nothing to frost over — the effect is barely visible but it weakens contrast and shadow definition
- The aggressive backdrop blur (`backdrop-blur-xl`) is computationally heavy on mobile and the visual payoff isn't there

**Three pivot directions, in priority order:**

1. **Featured card:** drop the overlay glass panel entirely. Try the text-below-photo layout (photo on top, opaque text panel below in solid `bg-card` with shadow). This is the cleaner pattern and the original reference mockup actually shows it. Look at the founder's first reference images for what the dish-detail layout should be.

2. **Mood cards, recently-viewed, search bar:** revert to solid `bg-card` with `border-border` and `shadow-soft`. Keep the inner-highlight pseudo-element for premium feel but ditch the transparency.

3. **If glass is kept anywhere**, restrict it to small accent elements (the "Featured" pill on the dish card, the bell icon background, mic button) where it doesn't compete with content readability.

### C. Welcome screen buttons — refine

**Current:** "Start Cooking" (filled orange, full-width, with chef-hat icon + chevron) and "Explore Demo Dish" (outlined white, full-width, with wok icon + chevron). Founder review: "those things are very off."

**Likely issues:**
- Buttons feel oversized — too much vertical padding (`py-4` is heavy)
- The leading icons (chef-hat / wok) are visual noise — the chevron alone is enough
- The white outlined button border is too crisp (`border-border` is fine but the styling around it doesn't match the photo-led aesthetic of the rest)
- Font weight is heavy semibold — could go down to medium for a more refined feel
- The full-width treatment may not be right; pill-shaped buttons at content width might land better

**Suggested refinement direction:**
```tsx
// Primary
className="inline-flex items-center justify-center gap-1.5 rounded-full
  gradient-cta px-6 py-3 text-[14px] font-medium text-white shadow-cta
  active:scale-95 transition-transform"

// Secondary
className="inline-flex items-center justify-center gap-1.5 rounded-full
  bg-card border border-border/70 px-6 py-3 text-[14px] font-medium
  text-foreground active:scale-95 transition-transform"
```

Drop the leading icons. Keep chevron-right at the end. Reduce vertical padding. Make font medium not semibold.

Reference the founder's original mockups (Welcome screen mockup, image 6 in the original brief set) for the canonical button treatment.

## 4. Concrete first-day plan for Codex

```bash
# 1. Branch off so the design pivot is isolated
git checkout -b phase-2-9-design-pivot

# 2. Swap fonts in app/layout.tsx (Bricolage Grotesque + Outfit recommended)

# 3. Remove the `axes` prop from any font config — Phase 2.7 hit a bug
# from adding `axes: ['SOFT', 'opsz']` together with explicit weights.
# Either use a variable font (no explicit weights, axes allowed) OR
# static weights (no axes). Pick one per font.

# 4. Drop glass treatment from:
#    - components/home/mood-card.tsx (revert to bg-card + shadow-soft)
#    - components/home/recently-viewed-item.tsx (same)
#    - components/home/search-bar.tsx (same)
#    - components/shared/dish-hero-card.tsx horizontal variant (switch to
#      text-below-photo layout in solid bg-card)

# 5. Refine Welcome buttons in app/page.tsx per the snippet in Section 3.C

# 6. Build locally — MUST end with "✓ Compiled successfully"
npm run build

# 7. Commit + push
git add -A
git commit -m "Phase 2.9: typography pivot to food-brand fonts, drop aggressive glass, refine Welcome CTAs"
git push origin phase-2-9-design-pivot

# 8. Open a PR to main, share the Vercel preview URL with the founder
# for review before merging.
```

## 5. After the design pivot lands — start Phase 3

Once typography + glass + buttons are signed off, the next functional phase is the guided cooking flow:

1. **Dish Intelligence** (`/dish/[id]`)
2. **Sources** (`/dish/[id]/sources`)
3. **Mise en Place** (`/dish/[id]/mise-en-place`)
4. **Cook flow** (`/dish/[id]/cook?step=N`)

Specs are in HANDOFF.md Section 9. Critical kitchen-safety rule: the cook flow timer **must not auto-advance** — the user is at a stove, not staring at the screen, and the next step might say something dangerous like "add cream" before they've finished reducing.

After Phase 3: voice mode (Phase 5) and mock API endpoints (Phase 6, with the LLM system prompt in HANDOFF.md Section 10).

## 6. Workflow notes that bit us — internalise these

- **Never `git push` if `npm run build` fails locally.** Vercel will reject the deploy and silently keep serving the previous version. This happened in Phase 2.7 and caused hours of "why isn't this updating?" debugging.
- **Vercel has a CVE security gate** that blocks deploys on vulnerable Next.js versions. Expect to bump Next.js every few weeks as new CVEs land. The current floor is Next.js 16.2.6.
- **Windows `Expand-Archive` silently skips locked files.** Close VS Code and stop the dev server before applying any patch zip. Verify each file landed individually if in doubt.
- **The repo has a stray file** named `ChatGPT Image May 26, 2026, 01_18_37 PM.png` in the project root from an accidental commit. Clean it up: `git rm "ChatGPT Image May 26, 2026, 01_18_37 PM.png"`, commit, push.

## 7. How to brief Codex with this

Give Codex three things at the start of the session:

1. **Repo URL:** `https://github.com/scarsymmetry899/chefsense-ai`
2. **Pin this instruction:** "Read `HANDOFF.md` for project context, then read `CODEX_BRIEF.md` for the immediate task list. Where they disagree, `CODEX_BRIEF.md` wins."
3. **Vercel URL** for visual reference: `https://chefsense-ai.vercel.app/`

That's enough for Codex to ground itself and start the design pivot work on a feature branch.

---

*Last updated after Phase 2.8 went live and the founder reviewed it. The next contributor should update this brief after their pivot lands so the next-next contributor has fresh ground truth.*
