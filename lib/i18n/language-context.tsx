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

const STORAGE_KEY = 'chefsense.lang';
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(DEFAULT_LANG);

  // Hydrate from localStorage after mount (avoid SSR mismatch).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (stored && stored in dictionaries) setLangState(stored);
    } catch {
      /* localStorage may be unavailable; ignore */
    }
  }, []);

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
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
