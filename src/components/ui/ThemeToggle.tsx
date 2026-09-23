"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <ThemeToggle />
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Conmuta entre el tema "desert" (primario, ocres y cremas) y "tactical"
   (secundario, el oscuro de siempre).

   ACCESIBILIDAD — lo que lo hace un control de verdad y no un div pintado:
   · Es un <button type="button"> real: teclado, Enter/Space y el foco
     visible global (`:focus-visible` con perfil ambar en globals.css) salen
     gratis. Nada de clip-path sobre el boton, que recortaria ese outline.
   · `aria-pressed` describe el estado del interruptor (pulsado = nocturno).
   · `aria-label` dice tema actual Y accion, en el idioma activo.
   · El icono es `aria-hidden`: el nombre accesible lo pone la etiqueta.
   · `prefers-reduced-motion` desactiva el giro del icono (framer-motion).

   COLOR — todo por tokens (`text-…`, `border-…`, `--amber-rgb`). Ni un hex
   fijo: el mismo marcado tiene que leerse bien en crema y en negro.

   HIDRATACION — el icono depende de `theme`, que en el primer render es
   siempre el valor por defecto en servidor y cliente. El script del <head>
   ya ha puesto el atributo correcto en <html>, asi que el usuario ve los
   COLORES de su tema desde el primer pintado; el icono se pone al dia en el
   primer efecto del provider. No se condiciona marcado a `theme` antes de
   montar o volveria el mismatch.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useLocale } from "@/i18n/LanguageProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { nextTheme, type Theme } from "@/theme/themeScript";
import type { Locale } from "@/i18n/translations";

/* ── Copy ──────────────────────────────────────────────────────────────────
   Vive aqui, no en `src/i18n/translations.ts`, para que el control sea una
   pieza autocontenida: se puede llevar a otra vista sin tocar el diccionario.
   `useThemeCopy()` se exporta para que quien lo coloca (la Navbar) rotule la
   fila del menu movil con exactamente las mismas palabras.                 */

type ThemeCopy = {
  /** Rotulo corto de la fila ("Tema"). */
  label: string;
  /** Nombre humano de cada tema. */
  names: Record<Theme, string>;
  /** Texto del aria-label: estado actual + accion. */
  action: (current: string, next: string) => string;
};

const COPY: Record<Locale, ThemeCopy> = {
  es: {
    label: "Tema",
    names: { desert: "desierto", tactical: "táctico" },
    action: (current, next) => `Tema ${current} activo. Cambiar al tema ${next}.`,
  },
  en: {
    label: "Theme",
    names: { desert: "desert", tactical: "tactical" },
    action: (current, next) => `${current} theme active. Switch to the ${next} theme.`,
  },
  ca: {
    label: "Tema",
    names: { desert: "desert", tactical: "tàctic" },
    action: (current, next) => `Tema ${current} actiu. Canvia al tema ${next}.`,
  },
};

/** Copy del selector de tema en el idioma activo. */
export function useThemeCopy(): ThemeCopy {
  const { locale } = useLocale();
  return COPY[locale] ?? COPY.es;
}

/* ── Iconografia ───────────────────────────────────────────────────────────
   Dibujada a mano para que hable el idioma del sitio: trazo fino, remates a
   escuadra, sin curvas blandas. Las dos comparten la linea de horizonte
   inferior, que es lo que hace que el cambio se lea como un amanecer /
   anochecer y no como dos dibujos sueltos.                                 */

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Sol sobre duna — tema desert. */
function DesertIcon() {
  return (
    <svg {...ICON_PROPS} className="w-full h-full">
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M12 1.8v1.9M12 13.3v0.6M5.3 8.5H3.4M20.6 8.5h-1.9M7.05 3.55 5.7 2.2M16.95 3.55 18.3 2.2" />
      <path d="M2 18.4 6.6 15.1l3.4 2.3 3.6-3 6.4 4.4" />
      <path d="M2 21.6h20" />
    </svg>
  );
}

/** Luna creciente con marca HUD — tema tactical. */
function TacticalIcon() {
  return (
    <svg {...ICON_PROPS} className="w-full h-full">
      <path d="M19.4 13.2A7.9 7.9 0 0 1 9.6 3.4a7.8 7.8 0 1 0 9.8 9.8Z" />
      <path d="M17.6 3.1v2.8M16.2 4.5h2.8" />
      <path d="M2 21.6h20" />
    </svg>
  );
}

/* ── Control ──────────────────────────────────────────────────────────── */

type ThemeToggleProps = {
  /** Muestra el nombre del tema junto al icono (menu movil). */
  showLabel?: boolean;
  className?: string;
};

export default function ThemeToggle({ showLabel = false, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const copy = useThemeCopy();
  const reduceMotion = useReducedMotion();

  const upcoming = nextTheme(theme);
  const ariaLabel = copy.action(copy.names[theme], copy.names[upcoming]);

  /* Giro corto tipo dial; con reduced-motion queda en un fundido sin
     desplazamiento (las transiciones de 0 s las respeta framer-motion).   */
  const spin = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, rotate: -75, scale: 0.7 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
        exit: { opacity: 0, rotate: 75, scale: 0.7 },
      };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={theme === "tactical"}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`group relative inline-flex items-center justify-center gap-2 h-8 border border-slate text-text-secondary hover:text-amber-text hover:border-amber transition-colors duration-300 cursor-pointer ${
        showLabel ? "px-3" : "w-8"
      } ${className}`}
    >
      {/* Marca HUD de esquina — detalle de la casa, decorativa. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-1.5 h-px bg-amber opacity-60 group-hover:opacity-100 transition-opacity"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-px h-1.5 bg-amber opacity-60 group-hover:opacity-100 transition-opacity"
      />

      {/* Caja de tamano fijo: los iconos se cruzan en absoluto, sin saltos. */}
      <span aria-hidden className="relative block w-4 h-4 shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            className="absolute inset-0 block"
            initial={spin.initial}
            animate={spin.animate}
            exit={spin.exit}
            transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {theme === "desert" ? <DesertIcon /> : <TacticalIcon />}
          </motion.span>
        </AnimatePresence>
      </span>

      {showLabel && (
        <span
          aria-hidden
          className="font-mono text-[0.625rem] tracking-[2px] uppercase font-semibold whitespace-nowrap"
        >
          {copy.names[theme]}
        </span>
      )}
    </button>
  );
}
