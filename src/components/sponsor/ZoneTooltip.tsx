"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Tooltip HUD de una zona de la carrocería
   --------------------------------------------------------------------------
   Dos modos, tal y como pide la spec:

     · ZONA OCUPADA    → logo del patrocinador, nombre, nivel y enlace a su web.
     · ZONA DISPONIBLE → medida real del vinilo en cm, nivel de aportación
                         necesario y la invitación a añadirla a la propuesta.

   ANCLADO (`pinned`)
   Mientras es sólo un tooltip de hover es decorativo: `aria-hidden` y sin
   eventos de puntero, para no duplicar en el lector de pantalla lo que ya dice
   el `aria-label` de la zona. Al hacer clic sobre una zona OCUPADA el tooltip se
   ancla: pasa a ser interactivo y su enlace al patrocinador se puede pulsar y
   tabular. Se cierra con Escape o con su propio botón.

   POSICIONADO
   Coordenadas en píxeles DENTRO del marco del visor, que las calcula `CarViewer`
   (el viewBox se ajusta a la relación de aspecto del marco, así que la
   conversión unidad→píxel es exacta). Aquí sólo se decide arriba/abajo y se
   mantiene la tarjeta dentro del marco.
   ══════════════════════════════════════════════════════════════════════════ */

import Image from "next/image";

import { TIER_COLORS, TIER_TEXT_COLORS, formatTierPrice } from "@/lib/sponsors";
import { useT } from "@/i18n/LanguageProvider";

import { formatTierAvailabilityShort, type ResolvedZone } from "./CarViewer";

/** Ancho ideal de la tarjeta. En un marco estrecho se encoge (ver `width`). */
const TOOLTIP_MAX_WIDTH = 252;
/** Ancho por debajo del cual la tarjeta deja de ser legible. */
const TOOLTIP_MIN_WIDTH = 168;
const EDGE = 10;
/** Separación entre el ancla de la zona y el borde de la tarjeta. */
const OFFSET = 16;

function clamp(value: number, min: number, max: number): number {
  if (max < min) return (min + max) / 2;
  return value < min ? min : value > max ? max : value;
}

export interface ZoneTooltipProps {
  zone: ResolvedZone;
  /** Ancla de la zona, en píxeles relativos al marco del visor. */
  x: number;
  y: number;
  frameWidth: number;
  frameHeight: number;
  pinned: boolean;
  onClose: () => void;
}

export default function ZoneTooltip({
  zone,
  x,
  y,
  frameWidth,
  frameHeight,
  pinned,
  onClose,
}: ZoneTooltipProps) {
  const t = useT();
  const { slot, tier, label, vinylLabel } = zone;
  const occupied = slot.status === "occupied";
  /* Dos tintas del mismo nivel: la de marca para las piezas gráficas (filo,
     aguja) y la legible para el texto — sobre crema, el sand y el arena del
     tier no llegan a 4.5:1 en 10-17 px. En tactical las dos coinciden. */
  const tierColor = TIER_COLORS[slot.tier];
  const tierInk = TIER_TEXT_COLORS[slot.tier];

  // Si el ancla está en la mitad alta del marco, la tarjeta cae hacia abajo.
  const below = y < frameHeight * 0.46;

  /* El marco del visor mide 100 % del ancho de su columna, y en un móvil de
     320 px eso son ~280 px: una tarjeta rígida de 252 px se comería el marco
     entero y se saldría por los lados. Se encoge hasta el hueco disponible,
     con un suelo por debajo del cual el texto ya no se lee. */
  const width = Math.max(
    TOOLTIP_MIN_WIDTH,
    Math.min(TOOLTIP_MAX_WIDTH, frameWidth - 2 * EDGE),
  );

  const left = clamp(x, width / 2 + EDGE, frameWidth - width / 2 - EDGE);
  const top = clamp(below ? y + OFFSET : y - OFFSET, EDGE, frameHeight - EDGE);

  return (
    <div
      role={pinned ? "dialog" : undefined}
      aria-label={pinned ? label : undefined}
      aria-hidden={pinned ? undefined : true}
      className="absolute z-[6]"
      style={{
        left,
        top,
        width,
        maxWidth: "100%",
        transform: `translate(-50%, ${below ? "0" : "-100%"})`,
        pointerEvents: pinned ? "auto" : "none",
      }}
    >
      <div className="panel chamfer-quad-sm shadow-tactical-lg relative overflow-hidden">
        {/* Filo de color del nivel. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: tierColor }}
        />

        <div className="space-y-2.5 px-3.5 pt-4 pb-3.5">
          {/* Cabecera: nivel + estado */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-mono text-[0.625rem] leading-none font-semibold tracking-[0.22em] uppercase"
              style={{ color: tierInk }}
            >
              {t.sponsors.tierLabels[slot.tier]}
            </span>
            <span
              className={`font-mono text-[0.625rem] leading-none tracking-[0.18em] uppercase ${
                occupied ? "text-text-tertiary" : "text-lime"
              }`}
            >
              {t.sponsors.slotStatus[slot.status]}
            </span>
          </div>

          <p className="font-heading text-text-primary text-[0.9375rem] leading-tight font-semibold tracking-wide uppercase">
            {label}
          </p>

          {occupied && slot.sponsor ? (
            <div className="space-y-2.5">
              <div className="panel-sunken flex h-14 items-center justify-center px-3">
                <Image
                  src={slot.sponsor.logo}
                  alt={slot.sponsor.name}
                  width={160}
                  height={44}
                  unoptimized
                  className="max-h-9 w-auto object-contain"
                />
              </div>
              <p className="font-body text-text-secondary text-[0.8125rem] leading-snug">
                {slot.sponsor.name}
              </p>
              <a
                href={slot.sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-tactical font-mono text-[0.6875rem] tracking-[0.14em] text-amber-text uppercase"
              >
                {slot.sponsor.url.replace(/^https?:\/\//, "")}
                <span className="sr-only"> ({t.common.a11y.externalLink})</span>
              </a>
              <p className="telemetry-label">{t.sponsors.configurator.occupiedTooltip}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Medida real del vinilo: es el dato que pide un patrocinador. */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="tech-badge font-mono">{vinylLabel}</span>
                <span className="tech-badge font-mono">
                  {formatTierAvailabilityShort(tier, t)}
                </span>
              </div>

              <div className="border-slate flex items-baseline justify-between gap-2 border-t pt-2.5">
                <span className="telemetry-label">{t.sponsors.price.label}</span>
                <span
                  className="font-heading text-[1.0625rem] leading-none font-bold"
                  style={{ color: tierInk }}
                >
                  {formatTierPrice(tier)}
                </span>
              </div>

              <p className="telemetry-label">{t.sponsors.configurator.zoneTooltip}</p>
            </div>
          )}

          {pinned ? (
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-text-tertiary hover:text-amber-text mt-1 w-full border-t border-slate pt-2.5 text-[0.625rem] tracking-[0.2em] uppercase transition-colors"
            >
              {t.common.actions.close}
            </button>
          ) : null}
        </div>
      </div>

      {/* Aguja que une la tarjeta con el ancla de la zona. */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 h-3 w-px -translate-x-1/2"
        style={{
          background: tierColor,
          opacity: 0.7,
          bottom: below ? "100%" : undefined,
          top: below ? undefined : "100%",
        }}
      />
    </div>
  );
}
