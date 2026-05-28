'use client';

/**
 * ChefSense AI — Dynamic translation hooks
 *
 * Layered on top of the existing useLanguage() provider. These hooks
 * translate arbitrary strings (dish prose, voice replies, recipe step
 * bodies) via Gemini at request time. The static UI dictionary still
 * handles labels — these hooks only fire when content isn't in it.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from './language-context';
import {
  translateBatchOnDemand,
  translateOnDemand,
  type TranslateTarget,
} from './translate-client';

function isTranslateTarget(value: string): value is TranslateTarget {
  return value === 'en' || value === 'hi' || value === 'te';
}

export function useTranslatedText(
  text: string,
  opts?: { context?: string },
): string {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState<string>(text);
  const context = opts?.context;

  useEffect(() => {
    // Reset to the source whenever inputs change so we never flash
    // a stale translation while the new request is in flight.
    setTranslated(text);

    if (!text || !text.trim()) return;
    if (!isTranslateTarget(lang) || lang === 'en') return;

    let cancelled = false;
    void translateOnDemand({
      text,
      targetLang: lang,
      context,
    }).then((result) => {
      if (cancelled) return;
      setTranslated(result);
    });

    return () => {
      cancelled = true;
    };
  }, [text, lang, context]);

  // English (or empty) returns the source synchronously.
  if (!text || !text.trim()) return text;
  if (!isTranslateTarget(lang) || lang === 'en') return text;
  return translated;
}

export function useTranslatedRecord<K extends string>(
  items: Record<K, string>,
  opts?: { context?: string },
): Record<K, string> {
  const { lang } = useLanguage();
  const context = opts?.context;

  // A stable signature so we only refetch when the values actually change.
  const signature = useMemo(() => {
    const keys = Object.keys(items).sort() as K[];
    return keys.map((k) => `${k}${items[k]}`).join('');
  }, [items]);

  const [translated, setTranslated] = useState<Record<K, string>>(items);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    setTranslated(itemsRef.current);

    if (!isTranslateTarget(lang) || lang === 'en') return;

    const entries = Object.entries(itemsRef.current) as Array<[K, string]>;
    const batchItems = entries
      .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
      .map(([id, text]) => ({ id, text }));

    if (batchItems.length === 0) return;

    let cancelled = false;
    void translateBatchOnDemand({
      items: batchItems,
      targetLang: lang,
      context,
    }).then((result) => {
      if (cancelled) return;
      const next = { ...itemsRef.current };
      for (const id of Object.keys(result) as K[]) {
        const value = result[id];
        if (typeof value === 'string') next[id] = value;
      }
      setTranslated(next);
    });

    return () => {
      cancelled = true;
    };
  }, [signature, lang, context]);

  if (!isTranslateTarget(lang) || lang === 'en') return items;
  return translated;
}
