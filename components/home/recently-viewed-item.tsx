'use client';

import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/image-with-fallback';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import type { Dish } from '@/lib/types';

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

interface RecentlyViewedItemProps {
  dish: Dish;
  /** Pre-formatted relative time, e.g. "10 mins" or "1 hr". */
  viewedAgo: string;
  href?: string;
  className?: string;
}

export function RecentlyViewedItem({
  dish,
  viewedAgo,
  href,
  className,
}: RecentlyViewedItemProps) {
  const { t, tx, lang } = useLanguage();
  const v = visual(dish);
  const trans = dish.translations as
    | { hi?: Record<string, string>; te?: Record<string, string> }
    | undefined;
  const langMap = trans?.[lang as 'hi' | 'te'];
  const name = tx('dish.name', dish.dishName, langMap);

  const inner = (
    <div
      className={cn(
        'relative flex items-center gap-2.5 rounded-2xl border border-white/50 bg-card/75 backdrop-blur-sm px-2.5 py-2 shadow-soft',
        // Inner top highlight matching mood cards
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent',
        className,
      )}
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
        <ImageWithFallback
          src={dish.heroImage}
          alt={name}
          gradient={v.gradient}
          fallbackGlyph={v.glyph}
          ratioClassName="h-full"
          rounded="none"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-serif text-[13px] leading-tight text-foreground">
          {name}
        </div>
        <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {t('home.viewedAgo').replace('{time}', viewedAgo)}
        </div>
      </div>
      <button
        type="button"
        aria-label={t('home.menu')}
        className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-warm hover:text-foreground"
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
