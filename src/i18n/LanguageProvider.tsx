"use client";

/**
 * LanguageProvider — client-side i18n context.
 *
 * On mount, reads the user's saved language from localStorage (or falls
 * back to the browser preference, or the default "es"). Updates
 * `document.documentElement.lang` so screen readers and spellcheckers
 * see the right language.
 *
 * Exposes two hooks:
 *   useT()      → the current translation dictionary
 *   useLocale() → { locale, setLocale } for the language switcher
 *
 * Note: SSR always renders in the default locale. If the user had saved
 * a different language, the first frame shows the default before the
 * client swaps it. This is fine for this site because the nav is small
 * and the flash is brief; we accept it to keep the setup simple.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { dict, DEFAULT_LOCALE, type Dict, type Locale } from "./translations";

const STORAGE_KEY = "boam-lang";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLocale(v: unknown): v is Locale {
  return v === "es" || v === "en" || v === "ca";
}

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (isLocale(saved)) return saved;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (browser === "en") return "en";
  if (browser === "ca") return "ca";
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with the default locale on both server and first client render
  // so hydration matches; swap to the user's preference after mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const initial = detectInitialLocale();
    if (initial !== DEFAULT_LOCALE) setLocaleState(initial);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: dict[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT(): Dict {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useT must be used inside <LanguageProvider>");
  return ctx.t;
}

export function useLocale() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLocale must be used inside <LanguageProvider>");
  return ctx;
}
