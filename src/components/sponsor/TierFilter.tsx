"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Filtro de niveles del visor
   --------------------------------------------------------------------------
   Botones FUERA del SVG (punto 4 de la spec) que iluminan en el coche sólo las
   zonas del nivel elegido. El cuadradito de cada botón lleva el color del
   nivel — el mismo con el que se pinta su zona sobre la carrocería, así el
   botón y la chapa dicen lo mismo.

   El TEXTO del botón, en cambio, usa la tinta legible del nivel
   (`TIER_TEXT_COLORS`): a 10 px no vale un color de marca de 3.3:1. Y como el
   botón activo invierte (texto crema sobre el color del nivel), el fondo usa
   también esa tinta: sobre el sand puro, el crema se quedaba en 3.57:1. En el
   tema oscuro las dos tintas son el mismo valor, así que no cambia nada.

   Estructura accesible: un `role="group"` etiquetado con `configurator.filterLabel`
   y botones con `aria-pressed`. El interruptor de "sólo disponibles" es un
   `role="switch"` con `aria-checked`, no un checkbox disfrazado.

   La leyenda vive aquí y no dentro del SVG: dentro del dibujo compite con el
   coche por el espacio y no se puede seleccionar ni leer con comodidad.
   ══════════════════════════════════════════════════════════════════════════ */

import {
  SPONSOR_TIERS,
  TIER_COLORS,
  TIER_TEXT_COLORS,
  formatTierPrice,
} from "@/lib/sponsors";
import { useT } from "@/i18n/LanguageProvider";

import { formatTierAvailabilityShort, type TierFilterValue } from "./CarViewer";

export interface TierFilterProps {
  value: TierFilterValue;
  onChange: (value: TierFilterValue) => void;
  availableOnly: boolean;
  onAvailableOnlyChange: (value: boolean) => void;
  /** Cuántas zonas hay en la vista actual por nivel (y en total, bajo "all"). */
  counts: Readonly<Record<TierFilterValue, number>>;
}

export default function TierFilter({
  value,
  onChange,
  availableOnly,
  onAvailableOnlyChange,
  counts,
}: TierFilterProps) {
  const t = useT();

  /** `color` = identidad del nivel (cuadradito) · `ink` = tinta legible. */
  const options: readonly {
    id: TierFilterValue;
    label: string;
    color: string | null;
    ink: string | null;
  }[] = [
    { id: "all", label: t.sponsors.configurator.filterAll, color: null, ink: null },
    ...SPONSOR_TIERS.map((tier) => ({
      id: tier.id,
      label: t.sponsors.tierLabels[tier.id],
      color: TIER_COLORS[tier.id],
      ink: TIER_TEXT_COLORS[tier.id],
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="telemetry-label telemetry-label-dash shrink-0">
          {t.sponsors.configurator.filterLabel}
        </span>

        <div
          role="group"
          aria-label={t.sponsors.configurator.filterByTier}
          className="flex flex-wrap gap-1.5"
        >
          {options.map((option) => {
            const isActive = value === option.id;
            const count = counts[option.id] ?? 0;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                aria-pressed={isActive}
                /* Pastilla, no bisel. El chaflán de `chamfer-quad-sm` corta
                   las cuatro esquinas en ángulo y a 10 px de cuerpo endurece
                   mucho un control tan pequeño. */
                className="font-mono flex items-center gap-2 rounded-full px-3.5 py-2 text-[10px] tracking-[0.16em] uppercase transition-colors"
                style={{
                  color: isActive
                    ? "var(--color-text-inverse)"
                    : (option.ink ?? "var(--color-text-secondary)"),
                  background: isActive
                    ? (option.ink ?? "var(--color-text-primary)")
                    : "var(--color-bg-elevated)",
                  /* En reposo el contorno va en el gris de estructura, no en
                     la tinta del nivel: un borde a plena intensidad en cinco
                     colores distintos convertía la fila en un semáforo. La
                     identidad del nivel sigue estando donde se lee mejor — en
                     el punto y en el color del texto. */
                  boxShadow: isActive ? "none" : "inset 0 0 0 1px var(--color-slate)",
                }}
              >
                {option.color ? (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: isActive ? "var(--color-text-inverse)" : option.color,
                    }}
                  />
                ) : null}
                {option.label}
                <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={availableOnly}
          onClick={() => onAvailableOnlyChange(!availableOnly)}
          className={`font-mono ml-auto flex items-center gap-2 rounded-full px-3.5 py-2 text-[10px] tracking-[0.16em] uppercase transition-colors ${
            availableOnly
              ? "bg-lime text-text-inverse"
              : "text-text-secondary hover:text-text-primary bg-bg-elevated"
          }`}
          style={
            availableOnly ? undefined : { boxShadow: "inset 0 0 0 1px var(--color-slate)" }
          }
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              background: availableOnly ? "var(--color-text-inverse)" : "var(--color-muted)",
            }}
          />
          {t.sponsors.configurator.filterAvailable}
        </button>
      </div>

      {/* ── Leyenda de niveles ───────────────────────────────────────────── */}
      <div className="panel-sunken chamfer-quad-sm p-4">
        <p className="telemetry-label mb-3">{t.sponsors.configurator.legendTitle}</p>
        <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {SPONSOR_TIERS.map((tier) => (
            <li key={tier.id} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[5px] h-2.5 w-2.5 shrink-0"
                style={{ background: TIER_COLORS[tier.id] }}
              />
              <span className="min-w-0">
                <span className="font-mono block text-[11px] leading-tight tracking-[0.14em] text-text-primary uppercase">
                  {t.sponsors.tierLabels[tier.id]}
                </span>
                <span className="font-mono text-text-tertiary block text-[10px] leading-tight tracking-[0.1em]">
                  {formatTierPrice(tier)} · {formatTierAvailabilityShort(tier, t)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
