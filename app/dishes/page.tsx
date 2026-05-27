'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, Clock3, Soup, Sparkles, UtensilsCrossed, Users } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { DishVisual } from '@/components/dish/screen-kit';
import { ALL_DISHES } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import { useLanguage } from '@/lib/i18n/language-context';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

const MOOD_MAP = {
  comfort: 'Comfort Food',
  quick: 'Quick & Easy',
  protein: 'High Protein',
  weekend: 'Weekend Special',
  festive: 'Festive Treats',
} as const;

const SCREEN_COPY = {
  en: {
    title: 'All guided dishes',
    subtitle: 'Five source-backed dishes are live now. More chef-guided dishes are coming soon.',
    more: 'More dish guides are coming soon.',
    phase: 'Version 2.0: upload your picture and get the recipe',
    mins: 'min',
    tools: 'tools',
    ingredients: 'ingredients',
  },
  hi: {
    title: 'सभी गाइडेड डिशेज़',
    subtitle: 'अभी पाँच सोर्स-बैक्ड डिशेज़ लाइव हैं। और शेफ़-गाइडेड डिशेज़ जल्द आ रही हैं।',
    more: 'और डिश गाइड्स जल्द आ रही हैं।',
    phase: 'Version 2.0: upload your picture and get the recipe',
    mins: 'मिनट',
    tools: 'टूल्स',
    ingredients: 'इंग्रेडिएंट्स',
  },
  te: {
    title: 'అన్ని గైడెడ్ డిష్‌లు',
    subtitle: 'ఇప్పుడు ఐదు సోర్స్-బ్యాక్డ్ డిష్‌లు లైవ్‌లో ఉన్నాయి. మరిన్ని చెఫ్-గైడెడ్ డిష్‌లు త్వరలో వస్తాయి.',
    more: 'మరిన్ని డిష్ గైడ్లు త్వరలో వస్తాయి.',
    phase: 'Version 2.0: upload your picture and get the recipe',
    mins: 'నిమి',
    tools: 'టూల్స్',
    ingredients: 'ఇంగ్రిడియెంట్స్',
  },
} as const;

function DishesPageContent() {
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();
  const mood = searchParams.get('mood') as keyof typeof MOOD_MAP | null;
  const dishes = mood && MOOD_MAP[mood]
    ? ALL_DISHES.filter((dish) => dish.mood.includes(MOOD_MAP[mood]))
    : ALL_DISHES;
  const copy = SCREEN_COPY[lang];
  const heading = mood ? `${t(`mood.${mood}` as DictionaryKey)} picks` : copy.title;

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.home} title="Browse Dish Guides" />

      <div className="rounded-[26px] border border-border bg-card px-5 py-5 shadow-soft">
        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-copper">
          Curated chef-style guides
        </div>
        <div className="mt-2 font-serif text-[34px] leading-[0.96] text-foreground">{heading}</div>
        <div className="mt-3 text-sm leading-7 text-muted-foreground">{copy.subtitle}</div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
            5 live dish guides
          </span>
          <span className="rounded-full bg-accent-green-soft px-3 py-1.5 text-xs font-semibold text-accent-green">
            Source compared
          </span>
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
                    <div className="font-serif text-[30px] leading-[0.96] text-foreground">{dish.dishName}</div>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-2 text-[14px] leading-6 text-muted-foreground">{dish.summary}</div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
                    {dish.difficulty}
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
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    chef-style flow
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-[26px] border border-dashed border-border bg-card px-5 py-5 text-center shadow-soft">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="mt-3 font-serif text-[24px] leading-none text-foreground">{copy.more}</div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">{copy.phase}</div>
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
