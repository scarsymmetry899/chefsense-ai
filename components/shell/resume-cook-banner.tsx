'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChefHat, ChevronRight, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { getDish } from '@/lib/data/dishes';
import {
  getMostRecentInProgressDishId,
  getResumeStepForDish,
} from '@/lib/cooking-session';

/**
 * A floating "Resume cooking {dish}" pill that surfaces whenever the user
 * wanders off the active cook flow into /home, /profile, /pantry, etc. Tap
 * to jump straight back to the live step of the most recent in-progress
 * dish — fixes the "I lost my place" complaint and removes the previous
 * paneer-fallback behaviour of the bottom-nav Cook tab.
 */
export function ResumeCookBanner() {
  const pathname = usePathname();
  const [dishId, setDishId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  // Track the last dish we showed the banner for — only reset dismiss when a
  // different dish becomes the most-recent in-progress one (not on every nav).
  const prevDishIdRef = useRef<string | null>(null);

  useEffect(() => {
    const nextDishId = getMostRecentInProgressDishId();
    if (nextDishId !== prevDishIdRef.current) {
      prevDishIdRef.current = nextDishId;
      setDismissed(false); // new dish in progress → show banner again
    }
    setDishId(nextDishId);
  }, [pathname]);

  // Hide on screens where we're already in the cook context.
  const onCookSurface =
    pathname.startsWith('/dish/') &&
    (pathname.includes('/cook') ||
      pathname.includes('/voice') ||
      pathname.includes('/finish') ||
      pathname.includes('/plate') ||
      pathname.includes('/share') ||
      pathname.includes('/mise-en-place') ||
      pathname.includes('/pan-check'));

  if (!dishId || dismissed || onCookSurface) return null;
  const dish = getDish(dishId);
  if (!dish) return null;
  const step = getResumeStepForDish(dishId, 1);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[76px] z-30 flex justify-center px-4 sm:bottom-[88px]">
      <div className="pointer-events-auto mx-auto flex w-full max-w-[420px] items-center gap-2 rounded-full border border-primary/25 bg-card/95 px-3 py-2 shadow-card backdrop-blur-md">
        <Link
          href={ROUTES.dishCook(dish.dishId, step)}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-cta text-white shadow-cta">
            <ChefHat className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[13px] font-semibold text-foreground">
              Resume {dish.dishName}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              Step {step} of {dish.cookingSteps.length}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss resume banner"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-warm hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
