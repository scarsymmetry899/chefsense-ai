'use client';

import { Search, Mic } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
}

/**
 * Search bar with mic affordance.
 * Static / decorative for Phase 2 — interactive voice search lands
 * in Phase 5 when SpeechSynthesis + STT come online.
 */
export function SearchBar({ className }: SearchBarProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        'relative flex items-center rounded-full border border-white/70 bg-white/55 backdrop-blur-xl',
        'shadow-[0_4px_16px_-6px_rgba(58,36,23,0.18)]',
        // Inner top highlight
        'before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-px before:rounded-t-full before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent',
        className,
      )}
    >
      <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        placeholder={t('home.search')}
        className="flex-1 bg-transparent px-3 py-3.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none"
      />
      <button
        type="button"
        aria-label={t('home.mic')}
        className="mr-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full gradient-cta text-white shadow-cta active:scale-95 transition-transform"
      >
        <Mic className="h-4 w-4" />
      </button>
    </div>
  );
}
