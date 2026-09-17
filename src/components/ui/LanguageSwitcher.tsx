"use client";

/**
 * LanguageSwitcher — three-button inline selector (ES · EN · CA).
 *
 * Color: siempre tokens del tema activo. Antes la rama por defecto pintaba
 * `--color-text-light`, que hoy es solo un alias legacy de
 * `--color-text-primary` en globals.css: las dos ramas ya resolvian al MISMO
 * color, asi que esto no cambia ni un pixel y quita una dependencia del
 * puente legacy (marcado para borrarse).
 *
 * `onLight` se conserva para no romper la API del componente. La Navbar no lo
 * pasa: el selector vive sobre una superficie tematizada (bg-bg-*), nunca
 * sobre una foto, y ahi la tinta correcta es la primaria del tema —clara en
 * tactical, oscura en desert— sin ramas.
 */

import { useLocale } from "@/i18n/LanguageProvider";
import { LOCALES, LOCALE_LABELS } from "@/i18n/translations";

interface LanguageSwitcherProps {
  /** When the navbar is scrolled, text should be dark on sand bg. */
  onLight?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  onLight = false,
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  /* Las dos ramas coinciden a proposito: `--color-text-light` era un alias
     legacy de `--color-text-primary`, asi que ya resolvian al mismo color
     antes de tokenizar. Se conserva la forma —y el prop— para no cambiar la
     API del componente; el dia que haga falta una tinta distinta sobre foto,
     este es el sitio. */
  const activeClass = onLight
    ? "text-text-primary"
    : "text-text-primary";
  const inactiveClass = onLight
    ? "text-text-primary/40 hover:text-text-primary/75"
    : "text-text-primary/40 hover:text-text-primary/75";
  const sepClass = onLight
    ? "text-text-primary/20"
    : "text-text-primary/20";

  return (
    <div
      className={`flex items-center gap-1 font-mono text-[10px] tracking-[2px] font-semibold ${className}`}
      role="group"
      aria-label="Language selector"
    >
      {LOCALES.map((l, i) => (
        <div key={l} className="flex items-center gap-1">
          {i > 0 && <span className={sepClass}>·</span>}
          <button
            type="button"
            onClick={() => setLocale(l)}
            className={`px-1 py-0.5 transition-colors cursor-pointer ${
              locale === l ? activeClass : inactiveClass
            }`}
            aria-label={`Switch language to ${LOCALE_LABELS[l]}`}
            aria-pressed={locale === l}
          >
            {LOCALE_LABELS[l]}
          </button>
        </div>
      ))}
    </div>
  );
}
