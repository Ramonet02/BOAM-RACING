"use client";

/**
 * LanguageSwitcher — three-button inline selector (ES · EN · CA).
 *
 * Color: siempre tokens del tema activo. Antes la rama por defecto pintaba
 * `--color-text-light`, un alias legacy (ya retirado) de
 * `--color-text-primary` en globals.css: las dos ramas ya resolvian al MISMO
 * color, asi que esto no cambia ni un pixel y quita una dependencia del
 * puente legacy (marcado para borrarse).
 *
 * `onLight` se conserva para no romper la API del componente. La Navbar no lo
 * pasa: el selector vive sobre una superficie tematizada (bg-bg-*), nunca
 * sobre una foto, y ahi la tinta correcta es la primaria del tema —clara en
 * tactical, oscura en desert— sin ramas.
 */

import { useLocale, useT } from "@/i18n/LanguageProvider";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/translations";

/**
 * Nombre de cada idioma EN ESE IDIOMA, con su `lang`. Es el nombre accesible
 * del boton: quien busca su idioma lo reconoce escrito en el suyo, y el
 * lector de pantalla lo pronuncia con la voz correcta gracias a `lang`.
 * Contiene las siglas visibles ("Es", "En", "Ca"), asi que el control por
 * voz ("pulsa EN") sigue encontrando el boton (WCAG 2.5.3).
 *
 * Antes era `Switch language to ES`, en ingles fijo con la web en cualquier
 * idioma y con unas siglas que el lector deletreaba.
 */
const NATIVE_NAMES: Record<Locale, string> = {
  es: "Español",
  en: "English",
  ca: "Català",
};

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
  const t = useT();

  /* Las dos ramas coinciden a proposito: `--color-text-light` era un alias
     legacy de `--color-text-primary`, asi que ya resolvian al mismo color
     antes de tokenizar. Se conserva la forma —y el prop— para no cambiar la
     API del componente; el dia que haga falta una tinta distinta sobre foto,
     este es el sitio. */
  /* Inactivos al 70 % y no al 40 %: al 40 % daban 2.32:1 sobre la crema y
     3.48:1 sobre el negro, y son botones con texto (WCAG 1.4.3 pide 4.5).
     Al 70 %: 5.34 y 8.41. Como activo e inactivo quedan mas cerca de tono,
     el activo lleva ademas subrayado ambar: la seleccion no depende solo de
     un matiz de gris (1.4.1). */
  const activeClass = onLight
    ? "text-text-primary underline decoration-amber decoration-2 underline-offset-4"
    : "text-text-primary underline decoration-amber decoration-2 underline-offset-4";
  const inactiveClass = onLight
    ? "text-text-primary/70 hover:text-text-primary"
    : "text-text-primary/70 hover:text-text-primary";
  const sepClass = onLight
    ? "text-text-primary/20"
    : "text-text-primary/20";

  return (
    <div
      className={`flex items-center gap-1 font-mono text-[0.625rem] tracking-[2px] font-semibold ${className}`}
      role="group"
      aria-label={t.nav.languageLabel}
    >
      {LOCALES.map((l, i) => (
        <div key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden="true" className={sepClass}>·</span>}
          {/* min 24×24: el objetivo tactil minimo de WCAG 2.2 (2.5.8). Con
              `px-1 py-0.5` a 10 px de cuerpo se quedaba en 24×19. */}
          <button
            type="button"
            onClick={() => setLocale(l)}
            className={`inline-flex min-h-6 min-w-6 items-center justify-center px-1 transition-colors cursor-pointer ${
              locale === l ? activeClass : inactiveClass
            }`}
            lang={l}
            aria-label={NATIVE_NAMES[l]}
            aria-pressed={locale === l}
          >
            {LOCALE_LABELS[l]}
          </button>
        </div>
      ))}
    </div>
  );
}
