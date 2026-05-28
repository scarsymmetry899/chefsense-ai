'use client';

/**
 * ChefSense AI — Language provider
 *
 * - Persists the active locale in localStorage.
 * - Provides a `t(key)` translator + a small `tx(key, fallback)`
 *   variant for content tokens stored on dish data.
 * - Exposes the active language code so components can route
 *   browser SpeechSynthesis to the right voice in Phase 5.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  LANGUAGES,
  dictionaries,
  type Dictionary,
  type DictionaryKey,
  type LanguageCode,
} from './dictionary';
import {
  PERSISTENCE_EVENT,
  readLocalJson,
  syncKeyToSupabase,
  writeLocalJson,
} from '../persistence/supabase-browser';

export const LANG_STORAGE_KEY = 'chefsense.lang';
const STORAGE_KEY = LANG_STORAGE_KEY;
const DEFAULT_LANG: LanguageCode = 'en';

type LanguageContextValue = {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  t: (key: DictionaryKey) => string;
  /**
   * Look up a content token from a per-dish translation map,
   * falling back to the provided default (usually the English
   * string baked into the recipe data).
   */
  tx: (token: string | undefined, fallback: string,
       map?: Record<string, string>) => string;
  languages: typeof LANGUAGES;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): LanguageCode | null {
  if (typeof window === 'undefined') return null;
  // Prefer the value the persistence engine wrote (matches its serialization).
  const fromEngine = readLocalJson<LanguageCode | null>(STORAGE_KEY, null);
  if (fromEngine && fromEngine in dictionaries) return fromEngine;
  // Backward compatibility: older builds wrote the raw string (no JSON quotes).
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && (raw as LanguageCode) in dictionaries) return raw as LanguageCode;
  } catch {
    /* ignore */
  }
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(DEFAULT_LANG);

  // Hydrate from localStorage after mount (avoid SSR mismatch).
  useEffect(() => {
    const stored = readStoredLang();
    if (stored) setLangState(stored);
  }, []);

  // Pick up updates pushed in by the Supabase hydration on auth changes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string }>).detail;
      if (detail?.key !== STORAGE_KEY) return;
      const stored = readStoredLang();
      if (stored) setLangState(stored);
    };
    window.addEventListener(PERSISTENCE_EVENT, handler);
    return () => window.removeEventListener(PERSISTENCE_EVENT, handler);
  }, []);

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
    writeLocalJson(STORAGE_KEY, code);
    void syncKeyToSupabase(STORAGE_KEY, code);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: DictionaryKey) => {
      const dict: Dictionary = dictionaries[lang] ?? dictionaries[DEFAULT_LANG];
      return dict[key] ?? dictionaries[DEFAULT_LANG][key] ?? key;
    },
    [lang],
  );

  const tx = useCallback(
    (token: string | undefined, fallback: string,
     map?: Record<string, string>) => {
      if (!token || !map) return fallback;
      return map[token] ?? fallback;
    },
    [],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t, tx, languages: LANGUAGES }),
    [lang, setLang, t, tx],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within <LanguageProvider>');
  }
  return ctx;
}
