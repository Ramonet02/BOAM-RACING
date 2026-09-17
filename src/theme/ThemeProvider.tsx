"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <ThemeProvider />
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Contexto de tema: { theme, setTheme, toggleTheme }.

   HIDRATACION — la regla que ordena todo este fichero:
   el servidor NO sabe que tema eligio el usuario, asi que el primer render
   (servidor y cliente) usa SIEMPRE DEFAULT_THEME. Quien ajusta antes del
   primer pintado es el script del <head> (`THEME_INIT_SCRIPT`), que toca el
   ATRIBUTO del <html> —no el arbol de React—, y por eso <html> lleva
   `suppressHydrationWarning`. Este provider se limita a ADOPTAR en el primer
   efecto lo que ya hay en storage/DOM. Ningun componente debe condicionar su
   marcado inicial al tema o vuelve el mismatch de hidratacion.

   ORDEN DE LOS EFECTOS — importa y es sutil: el efecto que escribe el
   atributo espera a `ready`. Si no lo hiciera, en el montaje se ejecutaria
   con el `theme` del render inicial ("desert") y pisaria con un fogonazo el
   "tactical" que el script del head ya habia dejado puesto.

   localStorage va SIEMPRE en try/catch: en ventana privada o con cookies
   bloqueadas el mero acceso lanza, y eso no puede tumbar la pagina.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_THEME,
  THEME_ATTRIBUTE,
  THEME_COLOR,
  THEME_STORAGE_KEY,
  isTheme,
  nextTheme,
  type Theme,
} from "./themeScript";

export type { Theme };

type ThemeContextValue = {
  /** Tema activo. Durante el primer render siempre DEFAULT_THEME. */
  theme: Theme;
  /** Fija un tema concreto y lo persiste. */
  setTheme: (theme: Theme) => void;
  /** Alterna desert ⇄ tactical y lo persiste. */
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Lectura blindada de localStorage. `null` = no hay preferencia guardada. */
function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Escritura blindada. Si el navegador no deja guardar, el tema sigue vivo
 *  en memoria durante la sesion: se pierde solo al recargar. */
function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* modo privado / storage bloqueado: seguimos sin persistencia */
  }
}

/** Mantiene el color del chrome del navegador en sintonia con el tema. */
function syncThemeColorMeta(theme: Theme): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[theme]);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  /* ── 1 · Adopcion en el montaje ────────────────────────────────────────
     Preferimos localStorage; si no hay nada guardado, leemos lo que el
     script del head dejo en el DOM; y si tampoco, el tema por defecto.   */
  useEffect(() => {
    const fromDom = document.documentElement.getAttribute(THEME_ATTRIBUTE);
    const initial = readStoredTheme() ?? (isTheme(fromDom) ? fromDom : DEFAULT_THEME);
    setThemeState(initial);
    setReady(true);
  }, []);

  /* ── 2 · Aplicacion al DOM ─────────────────────────────────────────────
     Solo despues de adoptar (ver nota de ORDEN DE LOS EFECTOS arriba).   */
  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
    syncThemeColorMeta(theme);
  }, [theme, ready]);

  /* ── 3 · Sincronizacion entre pestanas ─────────────────────────────────
     El evento "storage" solo llega a las OTRAS pestanas del mismo origen.
     Aqui no reescribimos storage: ya lo hizo la pestana que cambio.      */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      // newValue null = alguien limpio el storage → volvemos al primario.
      setThemeState(isTheme(event.newValue) ? event.newValue : DEFAULT_THEME);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(nextTheme(theme));
  }, [setTheme, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Hook de consumo. Lanza fuera del provider: el layout lo monta global. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
