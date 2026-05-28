'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  /** Compact mode hides the globe icon and just shows EN/HI/TE pills. */
  compact?: boolean;
  className?: string;
}

export function LanguageToggle({ compact = false, className }: LanguageToggleProps) {
  const { lang, setLang, languages } = useLanguage();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-soft',
        className,
      )}
      role="radiogroup"
      aria-label="Language"
    >
      {!compact && (
        <Globe className="ml-1 h-4 w-4 text-copper" aria-hidden />
      )}
      {languages.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLang(l.code)}
            className={cn(
              'inline-flex min-h-9 min-w-10 items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              active
                ? 'gradient-cta text-white shadow-cta'
                : 'bg-background text-muted-foreground hover:text-foreground',
            )}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
