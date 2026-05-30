'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home,
  ChefHat,
  LifeBuoy,
  Archive,
  User,
  type LucideIcon,
} from 'lucide-react';
import { BOTTOM_NAV_ITEMS, ROUTES } from '@/lib/constants/routes';
import { useLanguage } from '@/lib/i18n/language-context';
import { getMostRecentInProgressDishId, getResumeStepForDish } from '@/lib/cooking-session';
import { cn } from '@/lib/utils';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  'chef-hat': ChefHat,
  'life-buoy': LifeBuoy,
  archive: Archive,
  user: User,
};

const LABEL_KEY: Record<string, DictionaryKey> = {
  home: 'nav.home',
  cook: 'nav.cook',
  rescue: 'nav.rescue',
  pantry: 'nav.pantry',
  profile: 'nav.profile',
};

/**
 * Inline bottom navigation — sits flush at the bottom of the
 * phone frame with a hairline top border. Active item is coloured
 * primary; inactive items are muted.
 *
 * Cook + Rescue tabs route to the user's most recent in-progress dish.
 * When no dish is in flight, those tabs route to /dishes (browse) so we
 * never silently send the user to a hard-coded paneer page.
 */
export function BottomNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const currentDishMatch = pathname.match(/^\/dish\/([^/]+)/);
  const urlDishId = currentDishMatch?.[1] ?? null;

  // Track the most recent in-progress dish so Cook/Rescue tabs have a real
  // target when the user is on /home, /profile, etc.
  const [recentDishId, setRecentDishId] = useState<string | null>(null);
  useEffect(() => {
    setRecentDishId(getMostRecentInProgressDishId());
  }, [pathname]);

  const contextualDishId = urlDishId ?? recentDishId;

  function hrefFor(itemKey: string, defaultHref: string): string {
    if (itemKey === 'cook') {
      if (!contextualDishId) return ROUTES.dishes; // browse instead of paneer
      const step = getResumeStepForDish(contextualDishId, 1);
      return ROUTES.dishCook(contextualDishId, step);
    }
    if (itemKey === 'rescue') {
      if (!contextualDishId) return ROUTES.dishes;
      const step = getResumeStepForDish(contextualDishId, 1);
      return ROUTES.dishPanCheck(contextualDishId, step);
    }
    return defaultHref;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-safe shadow-[0_-10px_30px_-26px_rgba(114,66,35,0.35)]">
      <div className="mx-auto w-full max-w-[440px] px-2">
        <div className="flex items-center justify-around gap-1 py-2">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? Home;
            const href = hrefFor(item.key, item.href);
            const isCookOrRescueWithoutDish =
              (item.key === 'cook' || item.key === 'rescue') && !contextualDishId;
            const active =
              (item.key === 'home' && (pathname === '/home' || pathname === '/')) ||
              (item.key === 'pantry' && pathname === '/pantry') ||
              (item.key === 'profile' && pathname === '/profile') ||
              (item.key === 'cook' &&
                (pathname.includes('/mise-en-place') ||
                  pathname.includes('/cook') ||
                  pathname.includes('/voice') ||
                  pathname.includes('/finish') ||
                  pathname.includes('/ingredients'))) ||
              (item.key === 'rescue' &&
                (pathname.includes('/rescue') || pathname.includes('/pan-check')));
            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                  isCookOrRescueWithoutDish && 'opacity-70',
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={
                  isCookOrRescueWithoutDish
                    ? `${t(LABEL_KEY[item.key])} — pick a dish first`
                    : undefined
                }
              >
                <Icon
                  className={cn(
                    'h-[22px] w-[22px] transition-transform',
                    active && 'scale-110',
                  )}
                  strokeWidth={active ? 2.3 : 1.8}
                />
                <span
                  className={cn(
                    'text-[11px] leading-none tracking-tight',
                    active ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {t(LABEL_KEY[item.key])}
                </span>
                {active && (
                  <span className="mt-0.5 h-0.5 w-5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
