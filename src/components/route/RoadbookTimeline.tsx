"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING · MÓDULO 3 — Hoja de ruta interactiva (roadbook)
   --------------------------------------------------------------------------
   Estética del cuaderno de navegación real de un rally: casillas, numeración
   de tramos, símbolos de terreno y tipografía mono. Cada etapa se despliega
   con su kilometraje, su terreno, su nivel de dificultad y su objetivo
   solidario.

   DE DÓNDE SALE CADA COSA
   -----------------------
     · CIFRAS y hechos  → `src/lib/route.ts` (ROUTE_STAGES / ROUTE_SUMMARY).
                          Aquí no hay ni un kilómetro ni un día escrito a mano.
     · TEXTO            → `t.route.*` (es/en/ca). Ni una cadena en castellano
                          incrustada: los títulos y descripciones de etapa que
                          viven en route.ts son para tooling, la UI pinta el
                          diccionario.

   HONESTIDAD DEL DATO (lo que pedía el encargo)
   ---------------------------------------------
   Las etapas llevan `verified: false`. No se presentan como roadbook oficial:
     · cada kilometraje sin verificar se pinta con el prefijo «≈» y un texto
       solo para lectores de pantalla (`t.common.labels.tbd`);
     · la ficha desplegada lleva un badge «≈ Por confirmar»;
     · al pie, mientras `ROUTE_HAS_UNVERIFIED_DATA` sea true, se muestra
       `t.route.disclaimer` como texto visible para todo el mundo.
   El aviso completo NO se cuelga de cada fila con `aria-describedby`: se
   repetiría seis veces en un lector de pantalla. La marca corta por fila
   cumple la misma función sin ese ruido.

   ACCESIBILIDAD
   -------------
   Patrón acordeón de la WAI-ARIA: cada etapa es un <button> real dentro de un
   encabezado, con `aria-expanded` / `aria-controls`, y su ficha es una región
   etiquetada por ese botón. Flechas ↑/↓, Inicio y Fin mueven el foco entre
   etapas. Las etiquetas de columna van duplicadas como texto `sr-only` dentro
   de cada celda, así que la fila se lee «Terreno Dunas · Dificultad Extrema»
   aunque la cabecera de la tabla esté oculta en móvil.
   ══════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useId, useRef, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { topoSolidRef } from "@/components/ui/topoState";
import { useLocale, useT } from "@/i18n/LanguageProvider";
import type { Locale, RouteStageId } from "@/i18n/translations";
import { formatDMS } from "@/lib/constants";
import {
  ROUTE_HAS_UNVERIFIED_DATA,
  ROUTE_STAGES,
  ROUTE_SUMMARY,
  getStageById,
} from "@/lib/route";
import type { RouteStage, TerrainType } from "@/lib/route";

/* ────────────────────────────────────────────────────────────────────────
   1. Formato de cifras
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Agrupa los millares como los escribe cada idioma: "1.885" en castellano y
 * catalán, "1,885" en inglés.
 *
 * Hecho a mano y NO con `Intl.NumberFormat` / `toLocaleString` por dos
 * motivos: (1) el ICU de Node y el del navegador pueden discrepar y eso sería
 * un error de hidratación dentro de una cifra visible; (2) es exactamente la
 * misma regla que usa el compositor de `src/i18n/translations.ts` para
 * resolver el token {km}, así que la frase de entradilla y esta tabla dicen
 * el mismo número con la misma forma. `formatKm()` de `src/lib/route.ts` no
 * sirve aquí: está fijado a "es-ES" y la web es trilingüe.
 */
function groupThousands(value: number, separator: string): string {
  const digits = String(Math.round(Math.abs(value)));
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += separator;
    out += digits[i];
  }
  return value < 0 ? `-${out}` : out;
}

function formatDistance(km: number, locale: Locale): string {
  return `${groupThousands(km, locale === "en" ? "," : ".")} km`;
}

/** Rango de días como cifras: "5" o "1–2". La palabra la pone la cabecera. */
function formatDayRange(stage: RouteStage): string {
  if (stage.days.length === 0) return "—";
  const first = stage.days[0];
  const last = stage.days[stage.days.length - 1];
  return first === last ? String(first) : `${first}–${last}`;
}

/* ────────────────────────────────────────────────────────────────────────
   2. Símbolos de navegación
   ──────────────────────────────────────────────────────────────────────── */

/** Trazado de cada símbolo de terreno, sobre un lienzo de 24 × 14. */
const TERRAIN_GLYPH_PATHS: Readonly<Record<TerrainType, readonly string[]>> = {
  asfalto: ["M1,3 H23", "M1,11 H23", "M4,7 h4", "M12,7 h4", "M20,7 h3"],
  pista: ["M1,11 C5,11 5,3 9,3 C13,3 13,11 17,11 C21,11 21,5 23,5"],
  dunas: ["M1,12 q5,-8 10,0 q4,-6 8,0 q2,-3 4,0"],
  gargantas: ["M2,1 L6,12", "M22,1 L18,12", "M7,12 H17", "M9,12 L11,6", "M15,12 L13,6"],
  montana: ["M1,12 L7,3 L12,12", "M10,12 L16,5 L23,12"],
  ferry: ["M4,8 H20 L17,11 H7 Z", "M11,8 V4 H16 L16,8", "M1,2 q2,-1.6 4,0 q2,1.6 4,0 q2,-1.6 4,0 q2,1.6 4,0"],
};

function TerrainGlyph({ terrain }: { terrain: TerrainType }) {
  return (
    <svg
      viewBox="0 0 24 14"
      width="18"
      height="11"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {TERRAIN_GLYPH_PATHS[terrain].map((d, index) => (
        <path
          key={index}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/**
 * Tinta del rótulo de terreno.
 *
 * Ya NO sale de `TERRAIN_COLORS` (src/lib/route.ts): esa tabla son HEX fijos
 * del tema oscuro —#FF6B00, #CCFF00, #D4A359…— y con el tema desert activo
 * se desploman sobre la crema: el lima da 1,02:1 (invisible) y el ámbar
 * 2,47:1. Además el ferry (#2A2E35, el gris de los BORDES) ya era ilegible en
 * oscuro, a 1,3:1 sobre #16181C.
 *
 * El rótulo pinta el mismo ROL de color, pero en token, así que sigue solo al
 * tema activo. La equivalencia conserva el valor EXACTO que se veía en
 * tactical salvo donde ya estaba roto:
 *
 *   asfalto    #8C8275 → --color-text-tertiary  (#A0988C en tactical desde que
 *                                               #8C8275 no llegaba a AA)
 *   pista      #D4A359 → --color-sand-solid     idéntico en tactical; en desert
 *                                               el sand pleno daba 3,3:1 a 11 px
 *   dunas      #FF6B00 → --color-amber-text     idéntico (5,08:1 en desert)
 *   gargantas  #CCFF00 → --color-lime           idéntico (moss en desert)
 *   montana    #D4A359 → --color-sand-solid     ídem
 *   ferry      #2A2E35 → --color-text-tertiary  ya se corregía antes
 *
 * Es un rótulo de 11 px, así que el ámbar va en su variante de TEXTO: en
 * tactical `--color-amber-text` vale lo mismo que `--color-amber`.
 */
const TERRAIN_INK: Readonly<Record<TerrainType, string>> = {
  asfalto: "var(--color-text-tertiary)",
  pista: "var(--color-sand-solid)",
  dunas: "var(--color-amber-text)",
  gargantas: "var(--color-lime)",
  montana: "var(--color-sand-solid)",
  ferry: "var(--color-text-tertiary)",
};

function terrainInk(terrain: TerrainType): string {
  return TERRAIN_INK[terrain];
}

/** Indicador de dificultad: cinco casillas, como el calibre de un roadbook. */
function DifficultyGauge({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={`h-3 w-[3px] ${step <= level ? "bg-amber" : "bg-slate"}`}
        />
      ))}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   3. Rejilla compartida por la cabecera y las filas
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Una sola plantilla para cabecera y filas, así nada se descuadra.
 * Estrecho: 3 columnas (casilla · contenido · chevron) y el contenido apila.
 * Ancho:    6 columnas reales de tabla — los envoltorios del contenido pasan
 *           a `display: contents` y sus celdas suben a la rejilla de la fila.
 *
 * El salto es una CONTAINER QUERY (`@2xl` = 42rem de ancho de CONTENEDOR), no
 * un breakpoint de viewport. El roadbook vive en una columna que a 1280 px de
 * pantalla mide unos 740 px: con `md:` (768 px de VIEWPORT) la tabla se abría
 * dentro de una columna demasiado estrecha y las celdas se solapaban. La
 * container query pregunta por el ancho REAL de la columna, que es lo único
 * que importa aquí.
 */
const ROW_GRID =
  "grid grid-cols-[2.75rem_minmax(0,1fr)_1.25rem] items-center gap-x-3 gap-y-2 " +
  "@2xl:grid-cols-[2.5rem_4.5rem_minmax(0,1fr)_8rem_6rem_1rem] @2xl:gap-y-0";

/* ────────────────────────────────────────────────────────────────────────
   4. Componente
   ──────────────────────────────────────────────────────────────────────── */

export interface RoadbookTimelineProps {
  /** Etapa desplegada. `null` = todas cerradas. */
  activeStageId: string | null;
  /** Etapa resaltada por hover/foco, venga del roadbook o del mapa. */
  hoveredStageId: string | null;
  onSelectStage: (stageId: string) => void;
  onHoverStage: (stageId: string | null) => void;
  /**
   * Genera el id del panel de cada etapa. Lo provee el contenedor para que el
   * marcador del mapa pueda apuntar con `aria-controls` al MISMO panel.
   */
  getPanelId: (stageId: string) => string;
  className?: string;
}

export default function RoadbookTimeline({
  activeStageId,
  hoveredStageId,
  onSelectStage,
  onHoverStage,
  getPanelId,
  className = "",
}: RoadbookTimelineProps) {
  const t = useT();
  const { locale } = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const uid = useId();
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const table = t.route.table;
  const disclaimerId = `${uid}-disclaimer`;
  const buttonId = useCallback((stageId: string) => `${uid}-row-${stageId}`, [uid]);

  /**
   * Cuando la selección llega desde el mapa, la fila puede estar fuera de la
   * pantalla. `block: "nearest"` no hace nada si ya está visible, así que
   * pulsar la propia fila no provoca ningún salto.
   */
  useEffect(() => {
    if (activeStageId === null) return;
    const index = ROUTE_STAGES.findIndex((stage) => stage.id === activeStageId);
    const target = buttonsRef.current[index];
    if (!target) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [activeStageId]);

  /** Flechas, Inicio y Fin mueven el foco entre etapas (patrón acordeón). */
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = ROUTE_STAGES.length;
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % total;
    else if (event.key === "ArrowUp") next = (index - 1 + total) % total;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = total - 1;
    if (next === -1) return;
    event.preventDefault();
    buttonsRef.current[next]?.focus();
  };

  const hardestStage = getStageById(ROUTE_SUMMARY.hardestStageId);
  const longestStage = getStageById(ROUTE_SUMMARY.longestStageId);

  const summaryItems: readonly { key: string; label: string; value: string }[] = [
    { key: "stages", label: t.route.summary.stages, value: String(ROUTE_SUMMARY.totalStages) },
    { key: "days", label: t.route.summary.days, value: String(ROUTE_SUMMARY.totalDays) },
    {
      key: "moroccoKm",
      label: t.route.summary.moroccoKm,
      value: formatDistance(ROUTE_SUMMARY.moroccoKm, locale),
    },
    {
      key: "approachKm",
      label: t.route.summary.approachKm,
      value: formatDistance(ROUTE_SUMMARY.approachKm, locale),
    },
    {
      key: "oneWayKm",
      label: t.route.summary.oneWayKm,
      value: formatDistance(ROUTE_SUMMARY.oneWayKm, locale),
    },
    {
      key: "hardest",
      label: t.route.summary.hardest,
      value: hardestStage
        ? `${hardestStage.code} · ${t.route.difficulty[hardestStage.difficulty]}`
        : "—",
    },
    {
      key: "longest",
      label: t.route.summary.longest,
      value: longestStage
        ? `${longestStage.code} · ${formatDistance(longestStage.km, locale)}`
        : "—",
    },
  ];

  return (
    /* Sólido: las curvas de nivel del cursor no cruzan la lista de etapas. */
    <div ref={topoSolidRef} className={`@container flex flex-col ${className}`.trim()}>
      {/* ── Cabecera de columnas (solo desktop; en móvil cada celda lleva
             su propia etiqueta sr-only) ──────────────────────────────────── */}
      <div
        className={`${ROW_GRID} hidden border-b border-slate px-3 pb-2 @2xl:grid`}
        aria-hidden="true"
      >
        <span className="telemetry-label text-[0.6875rem]">{table.index}</span>
        <span className="telemetry-label text-[0.6875rem]">{table.code}</span>
        <span className="telemetry-label text-[0.6875rem]">{table.stage}</span>
        <span className="telemetry-label text-[0.6875rem]">
          {`${table.terrain} · ${table.difficulty}`}
        </span>
        <span className="telemetry-label text-right text-[0.6875rem]">{table.km}</span>
        <span />
      </div>

      {/* ── Las etapas ──────────────────────────────────────────────────── */}
      <ul className="m-0 list-none p-0">
        {ROUTE_STAGES.map((stage, index) => {
          const copy = t.route.stages[stage.id as RouteStageId];
          const isOpen = stage.id === activeStageId;
          const isHighlighted = isOpen || stage.id === hoveredStageId;
          const panelId = getPanelId(stage.id);
          const rowId = buttonId(stage.id);
          const terrainColor = terrainInk(stage.terrain);

          return (
            <li
              key={stage.id}
              className={`border-b border-slate transition-colors duration-200 ${
                isHighlighted ? "bg-bg-surface" : "bg-transparent"
              }`}
              onMouseEnter={() => onHoverStage(stage.id)}
              /* Si el foco del teclado sigue dentro de la fila, sacar el ratón
                 no debe apagar el resaltado (ni el del mapa, que es el mismo
                 estado). Sin esta guarda, mover el ratón después de tabular
                 dejaba la fila enfocada pero sin marcar. */
              onMouseLeave={(event) => {
                if (!event.currentTarget.contains(document.activeElement)) {
                  onHoverStage(null);
                }
              }}
            >
              <h3 className="m-0">
                <button
                  type="button"
                  id={rowId}
                  ref={(element) => {
                    buttonsRef.current[index] = element;
                  }}
                  onClick={() => onSelectStage(stage.id)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onFocus={() => onHoverStage(stage.id)}
                  onBlur={() => onHoverStage(null)}
                  aria-expanded={isOpen}
                  /* Solo mientras la ficha EXISTE: `AnimatePresence` la
                     desmonta al cerrar y un `aria-controls` apuntando a un id
                     inexistente es una violación real de axe
                     (aria-valid-attr-value). `aria-expanded` ya anuncia que el
                     control despliega algo cuando está cerrado. */
                  aria-controls={isOpen ? panelId : undefined}
                  className={`${ROW_GRID} w-full cursor-pointer px-3 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lime`}
                >
                  {/* 01 · casilla de tramo */}
                  <span className="relative flex h-10 w-10 items-center justify-center self-start @2xl:self-center">
                    <span
                      aria-hidden="true"
                      className={`chamfer-quad-sm absolute inset-0 transition-colors duration-200 ${
                        isHighlighted
                          ? /* amber-solid: el número va en texto inverso encima, y
                               con el ámbar pleno se quedaba en 4,18:1 en desert. */
                            "bg-amber-solid"
                          : "bg-bg-elevated shadow-[inset_0_0_0_1px_var(--color-slate)]"
                      }`}
                    />
                    <span
                      className={`relative font-mono text-sm font-semibold leading-none ${
                        isHighlighted ? "text-text-inverse" : "text-text-secondary"
                      }`}
                    >
                      {String(stage.order).padStart(2, "0")}
                    </span>
                  </span>

                  {/* Contenido: apilado en estrecho, celdas de tabla en ancho */}
                  <span className="flex min-w-0 flex-col gap-2 @2xl:contents">
                    {/* 02 · código + días */}
                    <span className="flex items-center gap-2 @2xl:flex-col @2xl:items-start @2xl:gap-1">
                      <span className="telemetry-label telemetry-label-amber">
                        <span className="sr-only">{`${table.code} `}</span>
                        {stage.code}
                      </span>
                      <span className="gps-label">
                        <span className="sr-only">{`${table.days} `}</span>
                        {formatDayRange(stage)}
                      </span>
                    </span>

                    {/* 03 · etapa + tramo */}
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-heading text-base leading-tight tracking-wide text-text-primary @2xl:text-[1.0625rem]">
                        {copy.title}
                      </span>
                      <span className="gps-label flex flex-wrap items-center gap-1.5 text-text-secondary">
                        <span className="sr-only">{`${table.leg} `}</span>
                        {stage.origin}
                        <span className="text-amber-text" aria-hidden="true">
                          →
                        </span>
                        {stage.destination}
                      </span>
                    </span>

                    {/* 04-05 · terreno + dificultad, y kilometraje */}
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-2 @2xl:contents">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 @2xl:flex-col @2xl:items-start @2xl:gap-1.5">
                        <span
                          className="flex items-center gap-2 text-[0.6875rem] tracking-wider uppercase"
                          style={{ color: terrainColor }}
                        >
                          <TerrainGlyph terrain={stage.terrain} />
                          <span className="font-mono">
                            <span className="sr-only">{`${table.terrain} `}</span>
                            {t.route.terrain[stage.terrain]}
                          </span>
                        </span>

                        <span className="flex items-center gap-2">
                          <DifficultyGauge level={stage.difficulty} />
                          <span className="gps-label text-text-secondary">
                            <span className="sr-only">{`${table.difficulty} `}</span>
                            {t.route.difficulty[stage.difficulty]}
                          </span>
                        </span>
                      </span>

                      <span className="font-heading text-lg leading-none tracking-wide text-text-primary @2xl:text-right">
                        <span className="sr-only">{`${table.km} `}</span>
                        {stage.verified ? null : (
                          <span className="text-text-tertiary" aria-hidden="true">
                            ≈
                          </span>
                        )}
                        {formatDistance(stage.km, locale)}
                        {stage.verified ? null : (
                          <span className="sr-only">{` — ${t.common.labels.tbd}`}</span>
                        )}
                      </span>
                    </span>
                  </span>

                  {/* 07 · chevron */}
                  <span
                    aria-hidden="true"
                    className={`self-start text-amber transition-transform duration-300 ease-tactical @2xl:self-center ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <svg viewBox="0 0 16 16" width="16" height="16" focusable="false">
                      <path
                        d="M3,6 L8,11 L13,6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </h3>

              {/* ── Ficha desplegada ──────────────────────────────────────── */}
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key="panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={rowId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.34,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <div className="panel-sunken mx-3 mb-4 flex flex-col gap-5 p-4 @lg:p-5">
                      <div className="grid gap-5 @2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                        {/* Relato de la etapa */}
                        <div className="flex flex-col gap-3">
                          <p className="font-body text-sm leading-relaxed text-text-secondary">
                            {copy.description}
                          </p>
                          {/* El filo arena marca la nota; el texto va en secundario:
                              sobre el fondo hundido del panel ni el arena oscuro
                              llegaba a 4,5:1 (4,28). */}
                          <p className="border-l-2 border-sand pl-3 font-body text-sm leading-snug text-text-secondary">
                            {copy.note}
                          </p>
                        </div>

                        {/* Telemetría de la etapa */}
                        <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 self-start">
                          <dt className="telemetry-label">{table.km}</dt>
                          <dd className="gps-label m-0 text-text-primary">
                            {stage.verified ? null : (
                              <span className="text-text-tertiary" aria-hidden="true">
                                ≈{" "}
                              </span>
                            )}
                            {formatDistance(stage.km, locale)}
                          </dd>

                          <dt className="telemetry-label">{table.days}</dt>
                          <dd className="gps-label m-0 text-text-primary">
                            {formatDayRange(stage)}
                          </dd>

                          <dt className="telemetry-label">{table.terrain}</dt>
                          <dd className="gps-label m-0 text-text-primary">
                            {stage.terrainMix
                              .map((terrainKey) => t.route.terrain[terrainKey])
                              .join(" · ")}
                          </dd>

                          <dt className="telemetry-label">{table.difficulty}</dt>
                          <dd className="gps-label m-0 text-text-primary">
                            {`${t.route.difficulty[stage.difficulty]} · ${stage.difficulty}/5`}
                          </dd>

                          <dt className="telemetry-label">{t.common.telemetry.checkpoint}</dt>
                          <dd className="gps-label m-0 text-text-primary">
                            <span className="block">{stage.waypoint.label}</span>
                            <span className="block text-text-tertiary">
                              {formatDMS(stage.waypoint)}
                            </span>
                          </dd>
                        </dl>
                      </div>

                      {/* Objetivo solidario — el porqué del viaje */}
                      <div className="flex flex-col gap-2 border-t border-slate pt-4">
                        {/* lime-hover: sobre el fondo hundido del panel, el lima
                            pleno daba 4,36:1 en desert (lime-hover, 5,77:1). */}
                        <span className="telemetry-label text-lime-hover telemetry-label-dash">
                          {table.charity}
                        </span>
                        <p className="font-body text-sm leading-relaxed text-text-secondary">
                          {copy.charityGoal}
                        </p>
                      </div>

                      {/* Aviso honesto del dato sin verificar */}
                      {stage.verified ? null : (
                        <span className="tech-badge self-start">
                          <span aria-hidden="true">≈</span>
                          {t.common.labels.tbd}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      {/* ── Total del tramo marroquí ────────────────────────────────────── */}
      <div className={`${ROW_GRID} border-b border-slate bg-bg-surface px-3 py-4`}>
        <span aria-hidden="true" />
        <span className="flex min-w-0 items-center justify-between gap-3 @2xl:contents">
          <span className="telemetry-label telemetry-label-lg @2xl:col-span-3">
            {table.total}
          </span>
          <span className="font-heading text-xl leading-none tracking-wide text-amber-text @2xl:text-right">
            {ROUTE_HAS_UNVERIFIED_DATA ? (
              <span className="text-text-tertiary" aria-hidden="true">
                ≈
              </span>
            ) : null}
            {formatDistance(ROUTE_SUMMARY.moroccoKm, locale)}
          </span>
        </span>
        <span aria-hidden="true" />
      </div>

      {/* ── Totales del recorrido ───────────────────────────────────────── */}
      <div className="mt-8 flex flex-col gap-3">
        <span className="telemetry-label telemetry-label-dash">{t.route.summary.title}</span>
        <dl className="m-0 grid grid-cols-2 gap-px bg-slate @md:grid-cols-3 @3xl:grid-cols-4">
          {summaryItems.map((item) => (
            /* `min-w-0` + `break-words`: a 360 px de pantalla cada celda mide
               ~150 px y valores como "E03 · Extrema" o "1.885 km" tienen que
               poder partir en vez de desbordar la rejilla. `leading-tight` en
               vez de `leading-none` para que la segunda línea no se solape. */
            <div key={item.key} className="flex min-w-0 flex-col gap-1 bg-bg-base px-3 py-3">
              <dt className="telemetry-label text-[0.6875rem]">{item.label}</dt>
              <dd className="m-0 font-heading text-lg leading-tight tracking-wide break-words text-text-primary">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        {/* Frase, no etiqueta: 12 px de cuerpo y sin el interletrado mono. */}
        <p className="font-body text-xs leading-relaxed text-text-tertiary">{t.route.approachNote}</p>
      </div>

      {/* ── Aviso: el roadbook oficial todavía no existe ─────────────────── */}
      {ROUTE_HAS_UNVERIFIED_DATA ? (
        <p
          id={disclaimerId}
          className="mt-5 flex items-start gap-3 border-l-2 border-sand bg-bg-surface px-4 py-3 font-body text-xs leading-relaxed text-text-secondary"
        >
          <span className="font-mono text-base leading-none text-sand" aria-hidden="true">
            ≈
          </span>
          <span>{t.route.disclaimer}</span>
        </p>
      ) : null}
    </div>
  );
}
