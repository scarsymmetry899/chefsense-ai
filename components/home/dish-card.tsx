'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/image-with-fallback';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import type { Dish } from '@/lib/types';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

function visual(dish: Dish): { gradient: 'food' | 'spice' | 'herb'; glyph: string } {
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

interface DishCardProps {
  dish: Dish;
  href?: string;
  className?: string;
}

/**
 * Compact dish card for the Popular Dishes horizontal row.
 * Square photo area on top (real photo, gradient+emoji fallback),
 * name + difficulty dot + time below.
 */
export function DishCard({ dish, href, className }: DishCardProps) {
  const { t, tx, lang } = useLanguage();
  const v = visual(dish);

  const trans = dish.translations as
    | { hi?: Record<string, string>; te?: Record<string, string> }
    | undefined;
  const langMap = trans?.[lang as 'hi' | 'te'];
  const name = tx('dish.name', dish.dishName, langMap);
  const difficultyKey: DictionaryKey = `difficulty.${dish.difficulty}` as DictionaryKey;
  const difficultyLabel = t(difficultyKey);

  const dotColour =
    dish.difficulty === 'Easy'
      ? 'bg-accent-green'
      : dish.difficulty === 'Medium'
        ? 'bg-secondary'
        : 'bg-primary';

  const card = (
    <article
      className={cn(
        'group w-[150px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-card',
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden">
        <ImageWithFallback
          src={dish.heroImage}
          alt={name}
          gradient={v.gradient}
          fallbackGlyph={v.glyph}
          ratioClassName="h-full"
          rounded="none"
        />
      </div>
      <div className="p-2.5">
        <h3 className="font-serif text-[14.5px] leading-tight line-clamp-2 text-foreground min-h-[34px]">
          {name}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className={cn('h-1.5 w-1.5 rounded-full', dotColour)} />
            {difficultyLabel}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {dish.totalTimeMin} {t('common.min')}
          </span>
        </div>
      </div>
    </article>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}
