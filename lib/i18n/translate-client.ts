'use client';

/**
 * ChefSense AI — On-demand translation client
 *
 * Calls the /api/translate route so dish prose, voice replies and recipe
 * steps can render in the active locale even when no static dictionary
 * entry exists. All failures fall back silently to the original text so
 * the UI never breaks because a translation request hit a rate limit.
 */

import type { LanguageCode } from './dictionary';

export type TranslateTarget = Extract<LanguageCode, 'en' | 'hi' | 'te'>;

type BatchItem = { id: string; text: string };

type SingleSuccess = { ok: true; text: string };
type BatchSuccess = { ok: true; translations: Record<string, string> };
type ApiFailure = { ok: false; error: string };

type SingleResponse = SingleSuccess | ApiFailure;
type BatchResponse = BatchSuccess | ApiFailure;

/* --------------------------- client-side cache ------------------------ */

const CLIENT_CACHE_MAX = 300;
const clientCache = new Map<string, string>();

function clientCacheGet(key: string): string | undefined {
  const hit = clientCache.get(key);
  if (hit === undefined) return undefined;
  clientCache.delete(key);
  clientCache.set(key, hit);
  return hit;
}

function clientCacheSet(key: string, value: string): void {
  if (clientCache.has(key)) clientCache.delete(key);
  clientCache.set(key, value);
  while (clientCache.size > CLIENT_CACHE_MAX) {
    const oldest = clientCache.keys().next().value;
    if (oldest === undefined) break;
    clientCache.delete(oldest);
  }
}

function singleCacheKey(lang: TranslateTarget, text: string): string {
  return `${lang}::${text}`;
}

/* ------------------------------- helpers ------------------------------ */

function identityMap(items: BatchItem[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const it of items) out[it.id] = it.text ?? '';
  return out;
}

/* --------------------------- public surface --------------------------- */

export async function translateOnDemand(opts: {
  text: string;
  targetLang: TranslateTarget;
  context?: string;
  sourceLang?: string;
}): Promise<string> {
  const { text, targetLang } = opts;
  if (!text || !text.trim()) return text;
  if (targetLang === 'en' && (!opts.sourceLang || opts.sourceLang === 'en')) {
    return text;
  }

  const key = singleCacheKey(targetLang, text);
  const cached = clientCacheGet(key);
  if (cached !== undefined) return cached;

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLang,
        context: opts.context,
        sourceLang: opts.sourceLang,
      }),
    });
    if (!response.ok) return text;

    const data = (await response.json()) as SingleResponse;
    if (!data.ok || typeof data.text !== 'string') return text;
    clientCacheSet(key, data.text);
    return data.text;
  } catch {
    return text;
  }
}

export async function translateBatchOnDemand(opts: {
  items: BatchItem[];
  targetLang: TranslateTarget;
  context?: string;
}): Promise<Record<string, string>> {
  const { items, targetLang } = opts;
  if (!Array.isArray(items) || items.length === 0) return {};
  if (targetLang === 'en') return identityMap(items);

  // Serve as much as possible from cache.
  const cachedTranslations: Record<string, string> = {};
  const misses: BatchItem[] = [];
  for (const item of items) {
    if (!item || typeof item.text !== 'string') continue;
    if (!item.text.trim()) {
      cachedTranslations[item.id] = item.text;
      continue;
    }
    const hit = clientCacheGet(singleCacheKey(targetLang, item.text));
    if (hit !== undefined) {
      cachedTranslations[item.id] = hit;
    } else {
      misses.push(item);
    }
  }

  if (misses.length === 0) return cachedTranslations;

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: misses,
        targetLang,
        context: opts.context,
      }),
    });
    if (!response.ok) {
      // Fall back to identity for the misses, keep cache hits.
      const fallback = identityMap(misses);
      return { ...cachedTranslations, ...fallback };
    }

    const data = (await response.json()) as BatchResponse;
    if (!data.ok || !data.translations) {
      const fallback = identityMap(misses);
      return { ...cachedTranslations, ...fallback };
    }

    const merged: Record<string, string> = { ...cachedTranslations };
    for (const item of misses) {
      const translated = data.translations[item.id];
      const value =
        typeof translated === 'string' && translated.length > 0
          ? translated
          : item.text;
      merged[item.id] = value;
      clientCacheSet(singleCacheKey(targetLang, item.text), value);
    }
    return merged;
  } catch {
    const fallback = identityMap(misses);
    return { ...cachedTranslations, ...fallback };
  }
}
