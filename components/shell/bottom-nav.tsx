'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ChefHat,
  LifeBuoy,
  Archive,
  User,
  type LucideIcon,
} from 'lucide-react';
import { BOTTOM_NAV_ITEMS } from '@/lib/constants/routes';
import { useLanguage } from '@/lib/i18n/language-context';
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
 * primary; inactive items are muted. No floating pill, no shadow.
 */
export function BottomNav() {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe backdrop-blur-md">
      <div className="mx-auto w-full max-w-[440px] px-2">
        <div className="flex items-center justify-around gap-1 py-2">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? Home;
            // Until other routes are built, only 'home' can be active.
            // Otherwise every item matches pathname (they all point to /home).
            const active =
              item.key === 'home' && (pathname === '/home' || pathname === '/');
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={active ? 'page' : undefined}
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
