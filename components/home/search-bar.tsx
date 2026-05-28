'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Flame, Search, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import { ALL_DISHES } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import type { Dish } from '@/lib/types';

interface SearchBarProps {
  className?: string;
}

function matchesDish(dish: Dish, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  return (
    dish.dishName.toLowerCase().includes(q) ||
    dish.region.toLowerCase().includes(q) ||
    dish.cuisine.toLowerCase().includes(q) ||
    dish.summary.toLowerCase().includes(q) ||
    dish.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export function SearchBar({ className }: SearchBarProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? ALL_DISHES.filter((d) => matchesDish(d, query))
    : [];

  const noResults = query.trim().length > 0 && results.length === 0;

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function handleSelect(dishId: string) {
    setQuery('');
    setOpen(false);
    router.push(ROUTES.dish(dishId));
  }

  function handleClear() {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input row */}
      <div
        className={cn(
          'relative flex items-center rounded-full border bg-white/55 backdrop-blur-xl transition-colors',
          'shadow-[0_4px_16px_-6px_rgba(58,36,23,0.18)]',
          open ? 'border-primary/40' : 'border-white/70',
          // Inner top highlight
          'before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-px before:rounded-t-full before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent',
        )}
      >
        <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
            if (e.key === 'Enter' && results.length === 1) handleSelect(results[0].dishId);
          }}
          placeholder={t('home.search')}
          autoComplete="off"
          className="flex-1 bg-transparent px-3 py-3.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {open && query.trim() ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[20px] border border-border bg-card shadow-lg">
          {results.length > 0 ? (
            <ul role="listbox" className="py-1.5">
              {results.map((dish) => (
                <li key={dish.dishId} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => handleSelect(dish.dishId)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary-soft/40 active:bg-primary-soft"
                  >
                    {/* Emoji glyph stand-in */}
                    <span className="text-xl leading-none" aria-hidden>
                      {dish.isVegetarian ? '🌿' : '🍗'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {dish.dishName}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dish.totalTimeMin} min
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {dish.difficulty}
                        </span>
                        <span>{dish.region}</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : noResults ? (
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-foreground">
                "{query.trim()}" isn't in our kitchen yet.
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                We currently guide you through:
              </p>
              <ul className="mt-2 space-y-1.5">
                {ALL_DISHES.map((dish) => (
                  <li key={dish.dishId}>
                    <button
                      type="button"
                      onClick={() => handleSelect(dish.dishId)}
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <span className="text-base leading-none" aria-hidden>
                        {dish.isVegetarian ? '🌿' : '🍗'}
                      </span>
                      {dish.dishName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
