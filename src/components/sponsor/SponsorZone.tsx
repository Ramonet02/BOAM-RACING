"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Una zona de patrocinio sobre la carrocería
   --------------------------------------------------------------------------
   Es un <path> relleno que se pinta encima del line-art. No calcula nada: la
   forma (`d`) viene de `src/lib/car/**` y el estado comercial de
   `src/lib/sponsors.ts`.

   ACCESIBILIDAD
   Cada zona vendible es un control real: `role="button"`, `tabIndex=0`,
   `aria-label` con nombre + estado + nivel + medida del vinilo, `aria-pressed`
   con la selección, y Enter/Espacio la activan. Una zona apagada por el filtro
   sale del orden de tabulación y del árbol de accesibilidad: sigue viéndose
   como contexto del dibujo, pero no es un control.

   DATA-ATTRIBUTES que pide la spec: data-tier, data-status, data-sponsor.

   MARCADO DE FOCO
   El anillo de `:focus-visible` del reset global no se ve bien sobre un path
   SVG, así que el foco se dibuja explícitamente: una silueta discontinua en
   lima por encima de la zona.

   COLOR
   Ni un hex. Cada capa se compone con el triplete RGB del token del tier
   (`tierAlpha`) y con la dosis que corresponde al tema (`zoneAlpha`), así que
   la misma zona se recompone sobre crema o sobre carbón sin tocar el estado.

   `fill` y `stroke` van en `style`, NO como atributos de presentación: un
   atributo SVG no resuelve `var()` en Chrome ni en Safari — eso sólo lo hace
   la cascada CSS. Con los colores ya tokenizados, dejarlos como atributo
   dejaría todas las zonas sin pintar.
   ══════════════════════════════════════════════════════════════════════════ */

import { useCallback, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { tierAlpha } from "@/lib/sponsors";
import { useT } from "@/i18n/LanguageProvider";
// `fill` colisiona con el relleno del path: se aliasa.
import { fill as interpolate } from "@/i18n/translations";

import { zoneAlpha } from "./sponsorPaint";
import type { ResolvedZone, ZoneActivationSource } from "./CarViewer";

export interface SponsorZoneProps {
  zone: ResolvedZone;
  /** Apagada por el filtro de nivel o por "sólo disponibles". */
  muted: boolean;
  /** Está dentro de la selección actual. */
  selected: boolean;
  /** Es la zona que tiene el puntero, el foco o el tooltip anclado. */
  active: boolean;
  /** Id del <pattern> con la trama de "ocupada". */
  occupiedPatternId: string;
  /**
   * Activar la zona. El segundo argumento dice si vino del puntero o del
   * teclado: el visor descarta el `click` que cierra un arrastre, y ese
   * descarte no debe alcanzar nunca a un Enter/Espacio.
   */
  onActivate: (zone: ResolvedZone, source: ZoneActivationSource) => void;
  onHoverChange: (slotId: string | null) => void;
  onFocusChange: (slotId: string | null) => void;
}

export default function SponsorZone({
  zone,
  muted,
  selected,
  active,
  occupiedPatternId,
  onActivate,
  onHoverChange,
  onFocusChange,
}: SponsorZoneProps) {
  const t = useT();
  const { slot, geometry, label, vinylLabel } = zone;
  const occupied = slot.status === "occupied";

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<SVGPathElement>) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
      event.preventDefault();
      onActivate(zone, "keyboard");
    },
    [onActivate, zone],
  );

  /* ── Zona apagada por el filtro: contexto visual, no control ────────────
     El borde de estructura (`--slate`) es lo único que se invierte solo con
     el tema — gris carbón sobre negro, arena pálida sobre crema — así que
     estas dos capas NO llevan refuerzo: una zona apagada tiene que seguir
     siendo más silenciosa que las encendidas en los dos temas. */
  if (muted) {
    return (
      <path
        d={geometry.d}
        aria-hidden="true"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        style={{
          fill: "rgb(var(--slate-rgb) / 0.28)",
          stroke: "rgb(var(--slate-rgb) / 0.85)",
          pointerEvents: "none",
          transition: "fill 0.2s, stroke 0.2s",
        }}
      />
    );
  }

  /* ── Colores por estado ───────────────────────────────────────────────── */
  let fill: string;
  let stroke: string;
  let strokeWidth: number;
  /** Halo de la zona activa: el color que manda en ese estado. */
  let glow = tierAlpha(slot.tier, zoneAlpha(0.55));

  if (occupied) {
    fill = `url(#${occupiedPatternId})`;
    stroke = active
      ? "var(--color-amber)"
      : `rgb(var(--muted-rgb) / ${zoneAlpha(0.75)})`;
    strokeWidth = active ? 2.4 : 1.2;
    glow = `rgb(var(--amber-rgb) / ${zoneAlpha(0.55)})`;
  } else if (selected) {
    fill = `rgb(var(--lime-rgb) / ${zoneAlpha(active ? 0.38 : 0.28)})`;
    stroke = "var(--color-lime)";
    strokeWidth = active ? 2.8 : 2.2;
    glow = `rgb(var(--lime-rgb) / ${zoneAlpha(0.55)})`;
  } else if (active) {
    fill = tierAlpha(slot.tier, zoneAlpha(0.34));
    stroke = "var(--color-amber)";
    strokeWidth = 2.6;
  } else {
    fill = tierAlpha(slot.tier, zoneAlpha(0.15));
    stroke = tierAlpha(slot.tier, zoneAlpha(0.62));
    strokeWidth = 1.4;
  }

  const zoneStyle: CSSProperties = {
    fill,
    stroke,
    strokeWidth,
    cursor: geometry.linksTo ? "zoom-in" : occupied ? "help" : "pointer",
    outline: "none",
    transition: "fill 0.18s var(--ease-snap, ease), stroke 0.18s var(--ease-snap, ease)",
    filter: active ? `drop-shadow(0 0 10px ${glow})` : undefined,
  };

  const statusLabel = t.sponsors.slotStatus[slot.status];
  const tierLabel = t.sponsors.tierLabels[slot.tier];
  const viewLabel = geometry.linksTo ? t.common.carViews[geometry.linksTo] : null;
  const ariaLabel = viewLabel
    ? // Zona-puente: no es un hueco comprable aquí. Si se anunciara como los
      // demás, con estado y medida, quien navega por teclado creería estar
      // seleccionando chapa cuando en realidad va a cambiar de vista.
      `${label} · ${interpolate(t.sponsors.configurator.zoneLinksTo, { view: viewLabel })}`
    : occupied
      ? `${label} · ${statusLabel} · ${tierLabel} · ${slot.sponsor ? slot.sponsor.name : ""}`.trim()
      : `${label} · ${statusLabel} · ${tierLabel} · ${vinylLabel}`;

  return (
    <g>
      <path
        d={geometry.d}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-pressed={occupied ? undefined : selected}
        aria-disabled={occupied ? true : undefined}
        data-tier={slot.tier}
        data-status={slot.status}
        data-sponsor={slot.sponsor ? slot.sponsor.name : ""}
        data-zone={slot.zoneId}
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
        onClick={() => onActivate(zone, "pointer")}
        onKeyDown={handleKeyDown}
        onPointerEnter={() => onHoverChange(slot.id)}
        onPointerLeave={() => onHoverChange(null)}
        onFocus={() => onFocusChange(slot.id)}
        onBlur={() => onFocusChange(null)}
        style={zoneStyle}
      />

      {/* Silueta discontinua: marca de foco de teclado sobre el path. */}
      {active ? (
        <path
          d={geometry.d}
          aria-hidden="true"
          fill="none"
          strokeWidth={1}
          strokeDasharray="6 5"
          vectorEffect="non-scaling-stroke"
          style={{
            stroke: selected ? "var(--color-lime)" : "var(--color-amber)",
            pointerEvents: "none",
            opacity: 0.85,
          }}
        />
      ) : null}
    </g>
  );
}
