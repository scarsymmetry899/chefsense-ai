'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, Clock3, Soup, UtensilsCrossed } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { DishVisual } from '@/components/dish/screen-kit';
import { ALL_DISHES } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import { useLanguage } from '@/lib/i18n/language-context';
import type { DictionaryKey } from '@/lib/i18n/dictionary';
import { cn } from '@/lib/utils';
import { TT } from '@/components/shared/translated';

const MOOD_MAP = {
  comfort: 'Comfort Food',
  quick: 'Quick & Easy',
  protein: 'High Protein',
  weekend: 'Weekend Special',
  festive: 'Festive Treats',
} as const;

type MoodKey = keyof typeof MOOD_MAP;
const MOOD_KEYS: MoodKey[] = ['comfort', 'quick', 'protein', 'weekend', 'festive'];

const SCREEN_COPY = {
  en: {
    title: 'All guided dishes',
    subtitle: 'Five source-backed dishes are live. Tap a chip to narrow by mood.',
    all: 'All',
    mins: 'min',
    tools: 'tools',
    ingredients: 'ingredients',
  },
  hi: {
    title: 'सभी गाइडेड डिशेज़',
    subtitle: 'पाँच सोर्स-बैक्ड डिशेज़ लाइव हैं। मूड से छाँटने के लिए चिप टैप करें।',
    all: 'सभी',
    mins: 'मिनट',
    tools: 'टूल्स',
    ingredients: 'इंग्रेडिएंट्स',
  },
  te: {
    title: 'అన్ని గైడెడ్ డిష్‌లు',
    subtitle: 'ఐదు సోర్స్-బ్యాక్డ్ డిష్‌లు లైవ్‌లో ఉన్నాయి. మూడ్‌తో ఫిల్టర్ చేయడానికి చిప్ నొక్కండి.',
    all: 'అన్నీ',
    mins: 'నిమి',
    tools: 'టూల్స్',
    ingredients: 'ఇంగ్రిడియెంట్స్',
  },
} as const;

function DishesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();
  const mood = searchParams.get('mood') as MoodKey | null;
  const dishes = mood && MOOD_MAP[mood]
    ? ALL_DISHES.filter((dish) => dish.mood.includes(MOOD_MAP[mood]))
    : ALL_DISHES;
  const copy = SCREEN_COPY[lang];
  const moodLabel = mood ? t(`mood.${mood}` as DictionaryKey) : null;

  function setMood(nextMood: MoodKey | null) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (nextMood) {
      params.set('mood', nextMood);
    } else {
      params.delete('mood');
    }
    const query = params.toString();
    router.replace(query ? `/dishes?${query}` : '/dishes');
  }

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.home} title={<TT>Browse Dish Guides</TT>} />

      <div className="rounded-[26px] border border-border bg-card px-5 py-5 shadow-soft">
        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-copper">
          <TT>Curated chef-style guides</TT>
        </div>
        <div className="mt-2 h-section">
          {moodLabel ? <>{moodLabel} <TT>picks</TT></> : copy.title}
        </div>
        <div className="mt-3 t-body text-muted-foreground">{copy.subtitle}</div>
      </div>

      {/* Filter chips — reflect ?mood= URL state and let user clear it. */}
      <div className="mt-4 -mx-5 overflow-x-auto px-5 scrollbar-hide">
        <div className="flex items-center gap-2 pb-1">
          <button
            type="button"
            onClick={() => setMood(null)}
            className={cn(
              'inline-flex min-h-9 shrink-0 items-center rounded-full px-4 py-1.5 text-sm font-semibold transition',
              !mood
                ? 'gradient-cta text-white shadow-cta'
                : 'border border-border bg-card text-foreground hover:bg-surface-warm',
            )}
          >
            {copy.all}
          </button>
          {MOOD_KEYS.map((key) => {
            const active = mood === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMood(active ? null : key)}
                className={cn(
                  'inline-flex min-h-9 shrink-0 items-center rounded-full px-4 py-1.5 text-sm font-semibold transition',
                  active
                    ? 'gradient-cta text-white shadow-cta'
                    : 'border border-border bg-card text-foreground hover:bg-surface-warm',
                )}
              >
                {t(`mood.${key}` as DictionaryKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {dishes.map((dish) => (
          <Link
            key={dish.dishId}
            href={ROUTES.dish(dish.dishId)}
            className="block overflow-hidden rounded-[30px] border border-border bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(254,245,236,0.96))] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="grid grid-cols-[132px_1fr] gap-0">
              <DishVisual src={dish.heroImage} alt={dish.dishName} className="h-full rounded-none border-0" />
              <div className="flex min-h-[178px] flex-col justify-between px-4 py-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-card line-clamp-2"><TT>{dish.dishName}</TT></div>
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-2 t-body text-muted-foreground line-clamp-2"><TT>{dish.summary}</TT></div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
                    <TT>{dish.difficulty}</TT>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5 text-copper" />
                    {dish.totalTimeMin} {copy.mins}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                    {dish.tools.length} {copy.tools}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Soup className="h-3.5 w-3.5 text-accent-green" />
                    {dish.ingredients.length} {copy.ingredients}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

export default function DishesPage() {
  return (
    <Suspense fallback={null}>
      <DishesPageContent />
    </Suspense>
  );
}
