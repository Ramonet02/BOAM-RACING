"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <Lightbox />
   Visor modal de alta resolucion de la galeria (Modulo 2).
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Es un DIALOGO MODAL de verdad, no un div con una foto encima:

     · role="dialog" + aria-modal="true" + aria-labelledby al pie de foto.
     · Foco: al abrir va al boton de cierre; al cerrar VUELVE al elemento
       que lo abrio (`returnFocusTo`, y si no, el que tuviera el foco).
     · Trampa de foco: Tab / Shift+Tab circulan solo dentro del dialogo.
     · Teclado completo: Escape cierra, ← → navegan, Inicio / Fin saltan al
       primero y al ultimo.
     · Cierre por backdrop: solo cuando la pulsacion empieza y termina en el
       fondo (el contenido va en una capa superior con pointer-events).
     · Bloqueo del scroll de fondo con compensacion del ancho de la barra de
       scroll, para que la pagina no de un salto lateral al abrir.
     · Gesto de swipe horizontal en tactil.
     · `prefers-reduced-motion`: sin animacion de entrada.

   Se monta en un PORTAL sobre <body> a proposito: las celdas de la galeria
   crean contextos de apilamiento (perspective / transform), y un `fixed`
   dentro de una de ellas se posicionaria contra la celda, no contra la
   ventana.

   El copy sale entero de i18n; los datos de la imagen, del manifiesto
   (`src/lib/imagery.ts`). Aqui no hay ni una cadena escrita a mano.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Compass, MapPin, Mountain, X } from "lucide-react";
import RallyImage from "@/components/ui/RallyImage";
import { useT } from "@/i18n/LanguageProvider";
import {
  ASPECT_RATIO,
  CATEGORY_LABELS,
  TERRAIN_LABELS,
  formatAssetCode,
  formatCoordinates,
  formatStageLabel,
  type RallyImageAspect,
  type RallyImageEntry,
} from "@/lib/imagery";

/* ────────────────────────────────────────────────────────────
   API publica
   ──────────────────────────────────────────────────────────── */

export interface LightboxProps {
  /** Coleccion navegable. El indice se mueve sobre ESTA lista. */
  images: readonly RallyImageEntry[];
  /** Indice visible. El padre es el dueno del estado. */
  index: number;
  /** El visor pide cambiar de imagen (flechas, swipe, teclado). */
  onIndexChange: (next: number) => void;
  /** El visor pide cerrarse (Escape, backdrop, boton). */
  onClose: () => void;
  /** Elemento al que devolver el foco al cerrar (la tarjeta que lo abrio). */
  returnFocusTo?: HTMLElement | null;
}

/** Selector de elementos enfocables para la trampa de foco. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Distancia minima en px para que un arrastre cuente como swipe. */
const SWIPE_THRESHOLD = 48;

/**
 * Relacion de aspecto numerica de un hueco.
 * Se deriva de `ASPECT_RATIO` (una sola fuente) en vez de duplicar la tabla.
 */
function aspectRatioValue(aspect: RallyImageAspect): number {
  const [width, height] = ASPECT_RATIO[aspect]
    .split("/")
    .map((part) => Number(part.trim()));
  const ratio = width / height;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}

/* ────────────────────────────────────────────────────────────
   Componente
   ──────────────────────────────────────────────────────────── */

export default function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  returnFocusTo = null,
}: LightboxProps) {
  const t = useT();
  const reducedMotion = useReducedMotion() === true;

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipeOrigin = useRef<{ x: number; y: number } | null>(null);

  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  const titleId = useId();
  const total = images.length;

  /** Navegacion circular: del ultimo al primero y al reves. */
  const go = useCallback(
    (delta: number) => {
      if (total === 0) return;
      onIndexChange((((index + delta) % total) + total) % total);
    },
    [index, total, onIndexChange],
  );

  /* El portal solo existe en cliente. */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* Animacion de entrada (se salta con prefers-reduced-motion). */
  useEffect(() => {
    if (!mounted) return;
    if (reducedMotion) {
      setEntered(true);
      return;
    }
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted, reducedMotion]);

  /* Foco inicial + bloqueo de scroll + devolucion del foco al cerrar. */
  useEffect(() => {
    if (!mounted) return;

    const previouslyFocused =
      returnFocusTo ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    closeRef.current?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      previouslyFocused?.focus();
    };
  }, [mounted, returnFocusTo]);

  /* Teclado: Escape, flechas, Inicio/Fin y trampa de foco con Tab. */
  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onClose();
          return;
        case "ArrowRight":
          event.preventDefault();
          go(1);
          return;
        case "ArrowLeft":
          event.preventDefault();
          go(-1);
          return;
        case "Home":
          event.preventDefault();
          onIndexChange(0);
          return;
        case "End":
          event.preventDefault();
          onIndexChange(Math.max(0, total - 1));
          return;
        case "Tab":
          break;
        default:
          return;
      }

      const root = dialogRef.current;
      if (!root) return;

      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && root.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, go, onClose, onIndexChange, total]);

  /* Swipe horizontal en tactil / lapiz. */
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    swipeOrigin.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = swipeOrigin.current;
    swipeOrigin.current = null;
    if (!origin) return;
    const deltaX = event.clientX - origin.x;
    const deltaY = event.clientY - origin.y;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
    go(deltaX < 0 ? 1 : -1);
  };

  if (!mounted || total === 0) return null;

  const entry = images[index];
  if (!entry) return null;

  const stage = formatStageLabel(entry);
  const coordinates = entry.rally?.coordinates;
  const terrain = entry.rally?.terrain;
  const position = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  const mediaStyle: CSSProperties = {
    aspectRatio: ASPECT_RATIO[entry.aspect],
    width: `min(100%, calc(var(--lb-height) * ${aspectRatioValue(entry.aspect)}))`,
    "--lb-height": "min(62vh, 620px)",
  } as CSSProperties;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[120]"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Fondo: cierra al pulsarlo (solo si el clic empieza y acaba aqui). */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-bg-base/95 backdrop-blur-[3px] transition-opacity duration-300 ease-tactical ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Rejilla de fondo, puramente decorativa. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-blueprint opacity-30"
      />

      {/* Al navegar con flechas o swipe el foco NO se mueve (sigue en el boton
          de avance), asi que un lector de pantalla no se enteraria del cambio
          de imagen. Esta region lo anuncia: "03 / 28 · <pie de foto>". */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {position} · {entry.caption}
      </p>

      {/* Capa de contenido: transparente al puntero salvo en sus piezas. */}
      <div
        className={`pointer-events-none relative z-10 flex h-full w-full flex-col transition-[opacity,transform] duration-300 ease-tactical ${
          entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {/* ── Barra superior ───────────────────────────────────── */}
        <header className="pointer-events-auto flex shrink-0 items-center justify-between gap-4 border-b border-slate/70 bg-bg-base/70 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="telemetry-label telemetry-label-amber shrink-0 tabular-nums">
              {position}
            </span>
            <span className="telemetry-label hidden max-w-[16ch] truncate sm:inline-block">
              {t.media.gallery.countLabel}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="tech-badge hidden sm:inline-flex">
              {formatAssetCode(entry)}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="chamfer-sm flex h-10 w-10 items-center justify-center bg-bg-elevated text-text-secondary transition-colors duration-200 hover:bg-amber hover:text-text-inverse focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              aria-label={t.common.actions.close}
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* ── Zona de imagen ───────────────────────────────────── */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 py-5 sm:px-16 sm:py-8">
          <figure
            className="pointer-events-auto relative mx-auto flex max-h-full w-full flex-col"
            style={mediaStyle}
          >
            <div className="hud-frame hud-frame-lg hud-frame-inset relative h-full w-full">
              <RallyImage
                image={entry}
                fillParent
                overlay="none"
                showCaption={false}
                chamfer={false}
                priority
                sizes="(max-width: 640px) 94vw, (max-width: 1280px) 80vw, 1100px"
              />
            </div>
          </figure>

          {total > 1 && (
            <>
              <NavButton
                side="prev"
                label={t.common.actions.prev}
                onClick={() => go(-1)}
              >
                <ChevronLeft size={22} strokeWidth={1.75} aria-hidden="true" />
              </NavButton>
              <NavButton
                side="next"
                label={t.common.actions.next}
                onClick={() => go(1)}
              >
                <ChevronRight size={22} strokeWidth={1.75} aria-hidden="true" />
              </NavButton>
            </>
          )}
        </div>

        {/* ── Ficha tecnica ──────────────────────────────────────
            <div> y no <footer>: dentro de un dialogo, un <footer> sin
            <article> padre cuenta como el pie (contentinfo) de la pagina, y
            la pagina ya tiene el suyo. */}
        <div className="pointer-events-auto shrink-0 border-t border-slate/70 bg-bg-base/80 px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto flex max-w-5xl flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {stage && (
                <span className="tech-badge tech-badge-amber">{stage}</span>
              )}
              <span className="tech-badge">{CATEGORY_LABELS[entry.category]}</span>
              {!entry.hasAsset && (
                <span className="tech-badge tech-badge-lime">
                  {t.common.placeholder.photoPending}
                </span>
              )}
            </div>

            <h2
              id={titleId}
              className="font-heading text-lg leading-tight tracking-[0.04em] text-text-primary sm:text-2xl"
            >
              {entry.caption}
            </h2>

            <dl className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {entry.rally?.location && (
                <MetaItem
                  icon={<MapPin size={13} strokeWidth={1.75} aria-hidden="true" />}
                  label={t.common.telemetry.checkpoint}
                  value={entry.rally.location}
                />
              )}
              {coordinates && (
                <MetaItem
                  icon={<Compass size={13} strokeWidth={1.75} aria-hidden="true" />}
                  label={t.common.labels.coords}
                  value={formatCoordinates(coordinates, "dms")}
                />
              )}
              {terrain && (
                <MetaItem
                  icon={
                    <Mountain size={13} strokeWidth={1.75} aria-hidden="true" />
                  }
                  label={t.common.labels.terrain}
                  value={TERRAIN_LABELS[terrain]}
                />
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export { Lightbox };

/* ────────────────────────────────────────────────────────────
   Piezas internas
   ──────────────────────────────────────────────────────────── */

/** Chaflan en las cuatro esquinas de los botones de navegacion. */
const NAV_BUTTON_STYLE: CSSProperties = {
  clipPath: "var(--chamfer-path-quad)",
  "--chamfer-size": "8px",
} as CSSProperties;

function NavButton({
  side,
  label,
  onClick,
  children,
}: {
  side: "prev" | "next";
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`pointer-events-auto absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-bg-elevated/90 text-text-secondary transition-colors duration-200 hover:bg-amber hover:text-text-inverse focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber sm:h-14 sm:w-14 ${
        side === "prev" ? "left-2 sm:left-5" : "right-2 sm:right-5"
      }`}
      style={NAV_BUTTON_STYLE}
    >
      {children}
    </button>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="text-amber" aria-hidden="true">
        {icon}
      </span>
      <dt className="telemetry-label shrink-0">{label}</dt>
      <dd className="truncate font-mono text-xs text-text-secondary">{value}</dd>
    </div>
  );
}
