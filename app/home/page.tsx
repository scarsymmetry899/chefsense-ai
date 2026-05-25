'use client';

/**
 * ChefSense AI — Home screen at /home.
 *
 * Match-reference layout:
 *   [logo+wordmark]  [lang toggle]  [bell w/ red dot]
 *   [search bar]
 *   [HORIZONTAL Featured card with inline "Start Guided Cook" button]
 *   [pagination dots]
 *   [Popular Dishes] [View All]    -- 4 horizontal-scroll cards
 *   [Cook by Mood] [View All]       -- 5 outlined cards in one row
 *   [Recently Viewed] [View All]   -- 2-col list of small items
 *   (inline bottom nav from AppShell)
 *
 * Static data, full translation coverage.
 */

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { BrandLogo } from '@/components/shell/brand-logo';
import { LanguageToggle } from '@/components/shell/language-toggle';
import { SearchBar } from '@/components/home/search-bar';
import { DishCard } from '@/components/home/dish-card';
import { MoodCard } from '@/components/home/mood-card';
import { RecentlyViewedItem } from '@/components/home/recently-viewed-item';
import { DishHeroCard } from '@/components/shared/dish-hero-card';
import { useLanguage } from '@/lib/i18n/language-context';
import { ROUTES } from '@/lib/constants/routes';
import {
  ALL_DISHES,
  FEATURED_DISH_ID,
  getDish,
  getDishOrThrow,
} from '@/lib/data/dishes';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

const MOOD_META = [
  { id: 'comfort', icon: 'soup', key: 'mood.comfort' as DictionaryKey },
  { id: 'quick', icon: 'zap', key: 'mood.quick' as DictionaryKey },
  { id: 'protein', icon: 'dumbbell', key: 'mood.protein' as DictionaryKey },
  { id: 'weekend', icon: 'star', key: 'mood.weekend' as DictionaryKey },
  { id: 'festive', icon: 'flame', key: 'mood.festive' as DictionaryKey },
] as const;

export default function HomePage() {
  const { t } = useLanguage();
  const featured = getDishOrThrow(FEATURED_DISH_ID);

  // Popular row — all dishes except the one shown in featured at top, plus PBM
  // again at the end so users who scroll through Popular still see it.
  const popular = [
    ...ALL_DISHES.filter((d) => d.dishId !== FEATURED_DISH_ID),
    featured,
  ];

  // Recently Viewed — 2-card grid
  const recentlyViewed = [
    { dish: featured, agoMins: 10 },
    { dish: getDish('bandi-chicken-fried-rice') ?? getDish('dal-tadka')!, agoMins: 60 },
  ];

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center justify-between gap-3 pt-2 animate-fade-up">
        <Link href={ROUTES.home} className="min-w-0">
          <BrandLogo size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle compact />
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-surface-warm"
          >
            <Bell className="h-4 w-4" />
            <span
              className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary"
              aria-hidden
            />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="pt-5 animate-fade-up">
        <SearchBar />
      </div>

      {/* Featured — horizontal card */}
      <section className="pt-6 animate-fade-up">
        <DishHeroCard
          dish={featured}
          featured
          variant="horizontal"
          showInlineCta
          href={ROUTES.home}
        />
        {/* Pagination dots — visual hint for future carousel */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/30" />
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="pt-7 animate-fade-up">
        <SectionRow title={t('home.popular')} viewAllHref={ROUTES.home} />
        <div className="mt-3 -mx-5 overflow-x-auto scrollbar-hide px-5">
          <div className="flex gap-3 pb-2">
            {popular.map((dish) => (
              <DishCard key={dish.dishId} dish={dish} href={ROUTES.home} />
            ))}
          </div>
        </div>
      </section>

      {/* Cook by Mood — single horizontal row */}
      <section className="pt-7 animate-fade-up">
        <SectionRow title={t('home.mood')} viewAllHref={ROUTES.home} />
        <div className="mt-3 flex flex-row items-stretch gap-2">
          {MOOD_META.map((m) => (
            <div key={m.id} className="flex-1 min-w-0">
              <MoodCard
                label={t(m.key)}
                icon={m.icon}
                href={ROUTES.home}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="pt-7 animate-fade-up">
        <SectionRow title={t('home.recent')} viewAllHref={ROUTES.home} />
        <div className="mt-3 flex flex-row gap-2.5">
          {recentlyViewed.map((entry, idx) => (
            <div key={`${entry.dish.dishId}-${idx}`} className="flex-1 min-w-0">
              <RecentlyViewedItem
                dish={entry.dish}
                viewedAgo={`${entry.agoMins} ${t('home.mins')}`}
                href={ROUTES.home}
              />
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

/* ────────────────────────────────────────────────────────────── */

function SectionRow({
  title,
  viewAllHref,
}: {
  title: string;
  viewAllHref: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-serif text-[19px] text-foreground tracking-tight">
        {title}
      </h2>
      <Link
        href={viewAllHref}
        className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-accent-green hover:text-accent-green/80"
      >
        {t('home.viewAll')} ›
      </Link>
    </div>
  );
}
