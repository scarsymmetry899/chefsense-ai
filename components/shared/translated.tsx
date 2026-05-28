'use client';

import { type ReactNode } from 'react';
import { useTranslatedText } from '@/lib/i18n/use-dynamic-translation';

/**
 * `<TT>English text</TT>` — translates the wrapped string into the active
 * language on demand via `/api/translate` (Gemini-backed). When the active
 * language is English (or translation is unavailable), the original text
 * passes through unchanged.
 *
 * Use this anywhere a component currently hardcodes an English string that
 * users see directly. Static dictionary keys should still go through
 * `useLanguage().t()` — `<TT>` is the bridge for strings that aren't worth
 * adding to the dictionary (one-offs, dynamic templates, etc.).
 *
 * Caching is handled by useTranslatedText: identical inputs are translated
 * once per session per language.
 *
 *   <TT>Cook smarter with an AI masterchef.</TT>
 *   <TT>{`Resume ${dishName}`}</TT>
 */
export function TT({ children, context }: { children: string; context?: string }): ReactNode {
  const text = useTranslatedText(children, context ? { context } : undefined);
  return text;
}
