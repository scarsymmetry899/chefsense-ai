'use client';

import Link from 'next/link';
import { Clock, Flame, Users, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from './image-with-fallback';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import type { Dish } from '@/lib/types';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

/** Decide which warm gradient + glyph backs a dish if the photo fails to load. */
function dishVisual(dish: Dish): { gradient: 'food' | 'spice' | 'herb'; glyph: string } {
  switch (dish.dishId) {
    case 'paneer-butter-masala':
      return { gradient: 'spice', glyph: '🍛' };
    case 'dal-tadka':
      return { gradient: 'food', glyph: '🍲' };
    case 'chicken-biryani':
      return { gradient: 'herb', glyph: '🥘' };
    case 'eggs-kejriwal':
      return { gradient: 'food', glyph: '🍳' };
    case 'bandi-chicken-fried-rice':
      return { gradient: 'spice', glyph: '🍚' };
    default:
      return { gradient: 'food', glyph: '🍲' };
  }
}

type Variant = 'lush' | 'horizontal';

interface DishHeroCardProps {
  dish: Dish;
  featured?: boolean;
  href?: string;
  variant?: Variant;
  /** When `horizontal`, render an inline "Start Guided Cook" button. */
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
    // ── Featured Home card: text-left, image-right, inline CTA ──
    const card = (
      <article
        className={cn(
          'group overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-shadow hover:shadow-lg',
          className,
        )}
      >
        <div className="flex flex-row min-h-[220px]">
          {/* Left: text & stats — explicit basis so the right panel never collapses */}
          <div className="flex basis-3/5 min-w-0 flex-col gap-2.5 p-4">
            {featured && (
              <span className="self-start inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-secondary-soft/90 backdrop-blur-sm px-2.5 py-0.5 text-[10.5px] font-semibold text-copper">
                <Star className="h-3 w-3 fill-current" />
                {t('home.featured')}
              </span>
            )}

            <h3 className="font-serif font-semibold text-[21px] leading-[1.08] tracking-tight text-foreground">
              {name}
            </h3>

            <p className="line-clamp-2 text-[12px] leading-snug text-muted-foreground">
              {summary}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5 text-[11.5px] text-foreground/80">
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
                className="mt-auto self-start inline-flex items-center gap-1 whitespace-nowrap rounded-full gradient-cta px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-cta active:scale-95 transition-transform"
              >
                {t('cta.startGuidedCook')}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {/* Right: real food photo (falls back to gradient + emoji if missing) */}
          <div className="relative basis-2/5 shrink-0 overflow-hidden">
            <ImageWithFallback
              src={dish.heroImage}
              alt={name}
              gradient={v.gradient}
              fallbackGlyph={v.glyph}
              ratioClassName="h-full"
              rounded="none"
            />
          </div>
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

  // ── Lush vertical variant (default) ──
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
          <h3 className="font-serif text-2xl leading-tight">{name}</h3>
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
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-accent-green" />
            {dish.serves}
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
