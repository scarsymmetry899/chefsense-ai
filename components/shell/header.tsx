'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, Bookmark, type LucideIcon } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { LanguageToggle } from './language-toggle';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

export interface HeaderAction {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
}

interface HeaderProps {
  /** Whether to show the back arrow. Defaults to true for non-root routes. */
  showBack?: boolean;
  backHref?: string;
  /** Show the brand logo+wordmark in the header. */
  showBrand?: boolean;
  /** Right-side action buttons. */
  actions?: HeaderAction[];
  /** Show the EN/HI/TE language toggle. */
  showLanguageToggle?: boolean;
  /** Optional title centred between back arrow and actions. */
  title?: string;
  className?: string;
}

export function Header({
  showBack = true,
  backHref,
  showBrand = true,
  actions,
  showLanguageToggle = true,
  title,
  className,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 -mx-5 mb-3 flex items-center justify-between gap-2 border-b border-border/55 bg-background px-5 py-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {showBack && (
          backHref ? (
            <Link
              href={backHref}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-surface-warm"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-surface-warm"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )
        )}
        {showBrand && !title && (
          <Link href={ROUTES.home} className="min-w-0">
            <BrandLogo size="sm" />
          </Link>
        )}
        {title && (
          <span className="truncate font-serif text-base text-foreground">{title}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showLanguageToggle && <LanguageToggle compact />}
        {actions?.map((a) => {
          const Icon = a.icon;
          const inner = (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-surface-warm">
              <Icon className="h-4 w-4" />
            </span>
          );
          return a.href ? (
            <Link key={a.label} href={a.href} aria-label={a.label}>
              {inner}
            </Link>
          ) : (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              aria-label={a.label}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </header>
  );
}

// Re-export common icons for convenience
export { Bell, Bookmark };
