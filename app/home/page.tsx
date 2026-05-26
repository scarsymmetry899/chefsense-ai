'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, BookOpen } from 'lucide-react';
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
  const heroSlides = useMemo(
    () => [
      featured,
      getDishOrThrow('dal-tadka'),
      getDishOrThrow('chicken-biryani'),
    ],
    [featured],
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return undefined;

    function handleScroll() {
      const currentNode = carouselRef.current;
      if (!currentNode) return;
      const width = currentNode.clientWidth || 1;
      const nextIndex = Math.round(currentNode.scrollLeft / width);
      setActiveSlide(Math.max(0, Math.min(heroSlides.length - 1, nextIndex)));
    }

    node.addEventListener('scroll', handleScroll, { passive: true });
    return () => node.removeEventListener('scroll', handleScroll);
  }, [heroSlides.length]);

  const popular = [
    ...ALL_DISHES.filter((d) => d.dishId !== FEATURED_DISH_ID),
    featured,
  ];

  const recentlyViewed = [
    { dish: featured, agoMins: 10 },
    {
      dish: getDish('bandi-chicken-fried-rice') ?? getDish('dal-tadka')!,
      agoMins: 60,
    },
  ];

  function jumpToSlide(index: number) {
    const node = carouselRef.current;
    if (!node) return;
    node.scrollTo({ left: node.clientWidth * index, behavior: 'smooth' });
    setActiveSlide(index);
  }

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3 pt-2 animate-fade-up">
        <Link href={ROUTES.home} className="min-w-0">
          <BrandLogo size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle compact />
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:bg-surface-warm"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          </button>
        </div>
      </header>

      <div className="pt-5 animate-fade-up">
        <SearchBar />
      </div>

      <section className="pt-6 animate-fade-up">
        <div
          ref={carouselRef}
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide"
        >
          {heroSlides.map((dish) => (
            <div key={dish.dishId} className="w-full shrink-0 snap-center">
              <DishHeroCard
                dish={dish}
                featured={dish.dishId === FEATURED_DISH_ID}
                variant="horizontal"
                showInlineCta
                href={ROUTES.dish(dish.dishId)}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          {heroSlides.map((dish, index) => (
            <button
              key={dish.dishId}
              type="button"
              aria-label={`Show ${dish.dishName}`}
              onClick={() => jumpToSlide(index)}
              className={index === activeSlide ? 'h-2.5 w-6 rounded-full bg-primary' : 'h-2.5 w-2.5 rounded-full bg-primary/25'}
            />
          ))}
        </div>
      </section>

      <section className="pt-7 animate-fade-up">
        <SectionRow title={t('home.popular')} viewAllHref={ROUTES.dish(featured.dishId)} />
        <div className="mt-3 -mx-5 overflow-x-auto scrollbar-hide px-5">
          <div className="flex gap-3 pb-2">
            {popular.map((dish) => (
              <DishCard key={dish.dishId} dish={dish} href={ROUTES.dish(dish.dishId)} />
            ))}
          </div>
        </div>
      </section>

      <section className="pt-7 animate-fade-up">
        <SectionRow title={t('home.mood')} viewAllHref={ROUTES.dish(featured.dishId)} />
        <div className="mt-3 flex flex-row items-stretch gap-2">
          {MOOD_META.map((m) => (
            <div key={m.id} className="min-w-0 flex-1">
              <MoodCard label={t(m.key)} icon={m.icon} href={ROUTES.dish(featured.dishId)} />
            </div>
          ))}
        </div>
      </section>

      <section className="pt-7 animate-fade-up">
        <SectionRow title={t('home.recent')} viewAllHref={ROUTES.dish(featured.dishId)} />
        <div className="mt-3 flex flex-row gap-2.5">
          {recentlyViewed.map((entry, idx) => (
            <div key={`${entry.dish.dishId}-${idx}`} className="min-w-0 flex-1">
              <RecentlyViewedItem
                dish={entry.dish}
                viewedAgo={`${entry.agoMins} ${t('home.mins')}`}
                href={ROUTES.dish(entry.dish.dishId)}
              />
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

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
      <h2 className="font-serif text-[19px] tracking-tight text-foreground">{title}</h2>
      <Link
        href={viewAllHref}
        className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent-green hover:text-accent-green/80"
      >
        {t('home.viewAll')}
        <BookOpen className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
