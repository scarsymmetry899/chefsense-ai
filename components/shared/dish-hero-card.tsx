'use client';

import Link from 'next/link';
import { Clock, Flame, ChevronRight, Star } from 'lucide-react';
import { ImageWithFallback } from './image-with-fallback';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import type { Dish } from '@/lib/types';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

function dishVisual(dish: Dish): { gradient: 'food' | 'spice' | 'herb'; glyph: string } {
  switch (dish.dishId) {
    case 'paneer-butter-masala':
      return { gradient: 'spice', glyph: '\u{1F35B}' };
    case 'dal-tadka':
      return { gradient: 'food', glyph: '\u{1F372}' };
    case 'chicken-biryani':
      return { gradient: 'herb', glyph: '\u{1F958}' };
    case 'eggs-kejriwal':
      return { gradient: 'food', glyph: '\u{1F373}' };
    case 'bandi-chicken-fried-rice':
      return { gradient: 'spice', glyph: '\u{1F35A}' };
    default:
      return { gradient: 'food', glyph: '\u{1F372}' };
  }
}

type Variant = 'lush' | 'horizontal';

interface DishHeroCardProps {
  dish: Dish;
  featured?: boolean;
  href?: string;
  variant?: Variant;
  showInlineCta?: boolean;
  className?: string;
}

export function DishHeroCard({
  dish,
  featured = false,
  href,
  variant = 'lush',
  showInlineCta = false,
  className,
}: DishHeroCardProps) {
  const { t, tx, lang } = useLanguage();
  const v = dishVisual(dish);

  const trans = dish.translations as
    | { hi?: Record<string, string>; te?: Record<string, string> }
    | undefined;
  const langMap = trans?.[lang as 'hi' | 'te'];

  const name = tx('dish.name', dish.dishName, langMap);
  const summary = tx('dish.summary', dish.summary, langMap);
  const difficultyKey: DictionaryKey = `difficulty.${dish.difficulty}` as DictionaryKey;
  const difficultyLabel = t(difficultyKey);

  if (variant === 'horizontal') {
    const card = (
      <article
        className={cn(
          'group relative overflow-hidden rounded-[30px] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
          className,
        )}
      >
        <div className="relative aspect-[16/11] overflow-hidden">
          <ImageWithFallback
            src={dish.heroImage}
            alt={name}
            gradient={v.gradient}
            fallbackGlyph={v.glyph}
            ratioClassName="h-full"
            rounded="none"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
          {featured && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/65 bg-white/90 px-3 py-1 text-[11px] font-semibold text-copper shadow-soft">
              <Star className="h-3 w-3 fill-current" />
              {t('home.featured')}
            </span>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3 rounded-[26px] border border-copper/20 bg-[hsl(var(--surface-warm))/0.94] p-4 shadow-[0_18px_30px_-18px_rgba(114,66,35,0.38)] backdrop-blur-[1px]">
          <h3 className="max-w-[78%] font-serif text-[24px] font-bold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-[26px]">
            {name}
          </h3>

          <p className="mt-1.5 max-w-[75%] line-clamp-2 text-[12.5px] leading-snug text-foreground/75">
            {summary}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-foreground/80">
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-primary" />
              {difficultyLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-copper" />
              {dish.totalTimeMin} {t('common.min')}
            </span>
          </div>

          {showInlineCta && (
            <Link
              href={href ?? '#'}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full gradient-cta px-4 py-3 text-[13.5px] font-medium text-white shadow-cta transition-transform active:scale-[0.98]"
            >
              {t('cta.startGuidedCook')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </article>
    );

    return href && !showInlineCta ? (
      <Link href={href} className="block">
        {card}
      </Link>
    ) : (
      card
    );
  }

  const lushCard = (
    <article
      className={cn(
        'group overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-shadow hover:shadow-lg',
        className,
      )}
    >
      <div className="relative h-44 overflow-hidden">
        <ImageWithFallback
          src={dish.heroImage}
          alt={name}
          gradient={v.gradient}
          fallbackGlyph={v.glyph}
          ratioClassName="h-full"
          rounded="none"
        />
        {featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-secondary-soft px-2.5 py-1 text-[11px] font-semibold text-copper shadow-soft">
            <Star className="h-3 w-3 fill-current" />
            {t('home.featured')}
          </span>
        )}
        {dish.isVegetarian ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-accent-green/30 bg-accent-green-soft px-2.5 py-1 text-[11px] font-semibold text-accent-green shadow-soft">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-green" />
            {t('welcome.heroBadge.veg')}
          </span>
        ) : (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary-dark shadow-soft">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            {t('dish.nonveg')}
          </span>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-2xl font-semibold leading-tight">{name}</h3>
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] text-copper">
            {dish.region}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-foreground/80">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-copper" />
            {dish.totalTimeMin} {t('common.min')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-primary" />
            {difficultyLabel}
          </span>
        </div>

        {href && (
          <div className="flex items-center justify-between pt-2">
            <span className="inline-flex items-center text-xs font-medium text-accent-green">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse-soft" />
              {t('home.aiConsensus')}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5">
              {t('dish.viewAll')}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </div>
    </article>
  );

  return href ? (
    <Link href={href} className="block">
      {lushCard}
    </Link>
  ) : (
    lushCard
  );
}
