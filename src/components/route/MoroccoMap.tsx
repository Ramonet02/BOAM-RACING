"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING · MÓDULO 3 — Mapa vectorial de Marruecos
   --------------------------------------------------------------------------
   SVG dibujado a mano. CERO dependencias de mapas (ni Mapbox, ni Leaflet, ni
   tiles): la silueta es una lista de pares (lon, lat) proyectada a mano.

   CÓMO FUNCIONA
   -------------
   1. `project()` es una proyección equirectangular: transforma (lon, lat) en
      coordenadas del viewBox. La relación 1004/940 del viewBox ES el factor
      cos(32°) ≈ 0,848 que corrige el achatamiento de los meridianos a esta
      latitud. Por eso la silueta sale con las proporciones correctas sin
      ninguna llamada a Math.cos en runtime.
   2. La MISMA proyección se aplica a la silueta del país y a los waypoints de
      `src/lib/route.ts`. Los marcadores caen donde tienen que caer sin
      colocarlos a ojo: si mañana cambia una coordenada en la capa de datos,
      el marcador se mueve solo.
   3. Los marcadores son <button> HTML posicionados en porcentajes encima del
      SVG (que va `aria-hidden`). Así son controles reales — foco, teclado,
      aria-expanded — en vez de <g> con onClick. El contenedor lleva el
      aspect-ratio exacto del viewBox para que el porcentaje y el SVG no se
      desincronicen a ningún ancho.

   LAS DOS CAPAS DE LA RUTA (y por qué son dos)
   --------------------------------------------
   · Capa BASE   — un trazo por etapa, con el `stroke-dasharray` que codifica
                   su terreno (continuo / a trazos / punteado / ferry). Es
                   estática y se pinta siempre, sin depender de JS.
   · Capa TRAZO  — una única línea ámbar continua que se DIBUJA al entrar en
                   viewport con la utilidad `.animate-draw-in` del design
                   system. Va por debajo de la base, como el rotulador que
                   repasa la ruta sobre el mapa.
   Son dos porque `.animate-draw-in` se apropia de `stroke-dasharray` para
   animar el trazo: si se aplicase a las líneas de terreno borraría su
   grafía y la leyenda dejaría de significar nada.

   DETERMINISMO (Next SSR + hidratación)
   -------------------------------------
   Todo el `d` de los paths se calcula con +, −, ×, ÷, Math.sqrt y toFixed,
   que el estándar IEEE-754 / ECMAScript define de forma exacta. No se usa
   Math.cos / Math.sin / Math.atan2 (implementación libre: el servidor Node y
   el navegador podrían diferir en el último bit y provocar un error de
   hidratación dentro del atributo `d`).

   EL MAPA ES ESQUEMÁTICO, Y LO DICE
   ---------------------------------
   `t.route.map.note` avisa de que el trazado es orientativo. Sobre esa base,
   MAP_NUDGE separa gráficamente los waypoints que, proyectados, caen tan
   juntos que sus marcadores se pisarían: el cruce del Estrecho (Tarifa /
   Tánger Med, 15 km reales) y el par Errachidia / Erg Chebbi (90 km, medidos
   en el navegador: los dos botones se solapaban a CUALQUIER ancho). El mismo
   desplazamiento se aplica al marcador y al trazado, así que la línea sigue
   entrando y saliendo por el marcador. Son los ÚNICOS retoques de posición.
   ══════════════════════════════════════════════════════════════════════════ */

import { useId, useMemo, useRef, type CSSProperties } from "react";
import { useInView } from "framer-motion";

import { useT } from "@/i18n/LanguageProvider";
import { formatDMS } from "@/lib/constants";
import { ROUTE_STAGES, ROUTE_START, ROUTE_WAYPOINTS } from "@/lib/route";
import type { RouteStage, TerrainType } from "@/lib/route";

/* ────────────────────────────────────────────────────────────────────────
   1. Proyección
   ──────────────────────────────────────────────────────────────────────── */

/** Ancho del viewBox. `VIEW_W / VIEW_H` codifica el cos(32°) de la latitud media. */
const VIEW_W = 1004;
/** Alto del viewBox: 10° de latitud × 94 unidades por grado. */
const VIEW_H = 940;

const LON_MIN = -13.4;
const LON_MAX = -0.8;
const LAT_MIN = 27.4;
const LAT_MAX = 37.4;

const LON_SPAN = LON_MAX - LON_MIN;
const LAT_SPAN = LAT_MAX - LAT_MIN;

/** Unidades de viewBox por kilómetro (1° de latitud ≈ 111,2 km). */
const UNITS_PER_KM = VIEW_H / LAT_SPAN / 111.2;

/** Longitud de la barra de escala, en kilómetros. */
const SCALE_BAR_KM = 200;

interface Point {
  readonly x: number;
  readonly y: number;
}

/** Par (longitud, latitud) en grados decimales. */
type LonLat = readonly [number, number];

function project(lon: number, lat: number): Point {
  return {
    x: ((lon - LON_MIN) / LON_SPAN) * VIEW_W,
    y: ((LAT_MAX - lat) / LAT_SPAN) * VIEW_H,
  };
}

/** Redondeo fijo para los atributos `d`: mismo string en servidor y cliente. */
function n(value: number): string {
  return value.toFixed(1);
}

function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function toPath(coords: readonly LonLat[], close: boolean): string {
  let d = "";
  for (let i = 0; i < coords.length; i += 1) {
    const p = project(coords[i][0], coords[i][1]);
    d += `${i === 0 ? "M" : "L"}${n(p.x)},${n(p.y)}`;
  }
  return close ? `${d}Z` : d;
}

/* ────────────────────────────────────────────────────────────────────────
   2. Geografía dibujada a mano
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Silueta de Marruecos, en sentido horario desde el cabo Espartel.
 * Costa mediterránea al norte, frontera argelina al este, límite sur en el
 * paralelo 27°40′N (el trazado reconocido internacionalmente) y costa
 * atlántica al oeste. Es una generalización: reconocible, no cartográfica.
 */
const MOROCCO_OUTLINE: readonly LonLat[] = [
  // ── Mediterráneo, de oeste a este ──
  [-5.93, 35.79], // Cabo Espartel
  [-5.8, 35.81], // Tánger
  [-5.55, 35.88],
  [-5.31, 35.91], // Ceuta
  [-5.2, 35.62],
  [-4.95, 35.48],
  [-4.6, 35.35],
  [-4.3, 35.27],
  [-3.93, 35.25], // Alhucemas
  [-3.55, 35.2],
  [-3.2, 35.25],
  [-2.98, 35.45], // Cabo Tres Forcas
  [-2.92, 35.28], // Melilla
  [-2.6, 35.15],
  [-2.2, 35.1], // Saidía
  // ── Frontera con Argelia, de norte a sur ──
  [-1.95, 34.75],
  [-1.75, 34.5],
  [-1.68, 34.05],
  [-1.45, 33.6],
  [-1.25, 33.05],
  [-1.1, 32.6],
  [-1.2, 32.3],
  [-1.23, 32.11], // Figuig
  [-2.1, 31.6],
  [-2.9, 31.05],
  [-3.65, 30.35],
  [-4.45, 29.9],
  [-5.3, 29.45],
  [-6.2, 29.0],
  [-7.2, 28.4],
  [-8.1, 27.9],
  [-8.67, 27.67],
  // ── Límite sur, sobre el paralelo 27°40′N ──
  [-10.5, 27.67],
  [-12.95, 27.67],
  // ── Atlántico, de sur a norte ──
  [-12.93, 27.94], // Tarfaya
  [-12.1, 28.1],
  [-11.33, 28.43], // Cabo Draa
  [-10.65, 28.9],
  [-10.18, 29.38], // Sidi Ifni
  [-9.85, 29.85],
  [-9.62, 30.42], // Agadir
  [-9.7, 30.9],
  [-9.82, 31.4],
  [-9.77, 31.51], // Essaouira
  [-9.45, 31.95],
  [-9.24, 32.3], // Safi
  [-8.85, 32.85],
  [-8.5, 33.25], // El Jadida
  [-7.95, 33.45],
  [-7.62, 33.6], // Casablanca
  [-7.1, 33.85],
  [-6.83, 34.02], // Rabat
  [-6.55, 34.35],
  [-6.3, 34.9],
  [-6.15, 35.19], // Larache
  [-6.04, 35.47], // Asilah
  [-5.97, 35.68],
];

/**
 * Franja de la costa andaluza: da contexto al cruce del Estrecho y evita que
 * el marcador de salida (Tarifa, España) flote en mitad del mar. Se cierra
 * por el borde superior del viewBox.
 */
const SPAIN_OUTLINE: readonly LonLat[] = [
  [-7.4, 37.4],
  [-7.4, 37.2],
  [-6.9, 37.2],
  [-6.35, 36.8],
  [-6.3, 36.53], // Cádiz
  [-6.05, 36.18],
  [-5.6, 36.01], // Tarifa
  [-5.45, 36.13], // Algeciras
  [-5.15, 36.42],
  [-4.42, 36.72], // Málaga
  [-3.7, 36.74],
  [-2.9, 36.75],
  [-2.46, 36.83], // Almería
  [-2.19, 36.72], // Cabo de Gata
  [-1.8, 37.05],
  [-1.6, 37.4],
];

/**
 * Los cuatro sistemas montañosos, como ejes de cresta. Se dibujan con un
 * trazo suave más un triángulo por vértice: el recurso cartográfico clásico.
 * El Alto Atlas cruza en diagonal SO→NE, como pedía la spec.
 */
const MOUNTAIN_RANGES: readonly {
  readonly ridge: readonly LonLat[];
  readonly peak: number;
}[] = [
  {
    // Rif
    ridge: [
      [-5.85, 35.35],
      [-5.4, 35.2],
      [-4.9, 35.05],
      [-4.35, 34.95],
      [-3.85, 34.9],
      [-3.35, 34.85],
    ],
    peak: 9,
  },
  {
    // Medio Atlas
    ridge: [
      [-5.95, 32.85],
      [-5.5, 33.25],
      [-5.05, 33.6],
      [-4.6, 33.95],
      [-4.15, 34.2],
    ],
    peak: 10,
  },
  {
    // Alto Atlas — la diagonal que parte el país
    ridge: [
      [-9.3, 30.75],
      [-8.6, 30.95],
      [-7.9, 31.06],
      [-7.25, 31.35],
      [-6.6, 31.7],
      [-5.9, 32.05],
      [-5.25, 32.35],
    ],
    peak: 14,
  },
  {
    // Anti-Atlas
    ridge: [
      [-9.95, 29.55],
      [-9.25, 29.85],
      [-8.55, 30.1],
      [-7.85, 30.4],
      [-7.15, 30.75],
      [-6.45, 31.0],
    ],
    peak: 9,
  },
];

/** Cordones de duna del Erg Chebbi, junto al waypoint de la etapa reina. */
const ERG_CHEBBI_ANCHOR: LonLat = [-3.97, 31.12];

/** Ancla del rótulo del país, sobre la meseta del sur. */
const REGION_LABEL_ANCHOR: LonLat = [-10.3, 28.3];

/* ────────────────────────────────────────────────────────────────────────
   3. Trazado de la ruta
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Separación gráfica de los pares de waypoints que se pisan al proyectarlos.
 * Se aplica el MISMO desplazamiento (Δlon, Δlat en grados) al marcador y al
 * trazado, así que la línea sigue entrando y saliendo por el marcador.
 * Clave = `GeoWaypoint.label`.
 *
 *  · Tarifa / Tánger Med — 15 km reales a un lado y otro del Estrecho.
 *  · Errachidia — Erg Chebbi queda a 90 km al sudeste. Con el mapa a 312 px
 *    (móvil) eso son 25 px de separación entre dos botones de 28 px, y a
 *    400 px (columna de escritorio) 33 px entre dos de 32: se solapaban en
 *    ambos casos. Subiendo Errachidia ~0,3° de latitud —hacia Midelt, que es
 *    por donde pasa el enlace real— los dos marcadores quedan limpios y el
 *    trazado gana la curva correcta.
 */
const MAP_NUDGE: Readonly<Record<string, LonLat>> = {
  Tarifa: [0.0, 0.44],
  "Tánger Med": [-0.11, -0.34],
  Errachidia: [-0.18, 0.3],
};

/** Vértices del trazado, en el orden salida → etapa 01 → … → etapa 06. */
const ROUTE_POINTS: readonly Point[] = ROUTE_WAYPOINTS.map((waypoint) => {
  const nudge = MAP_NUDGE[waypoint.label];
  const lon = waypoint.lon + (nudge ? nudge[0] : 0);
  const lat = waypoint.lat + (nudge ? nudge[1] : 0);
  return project(lon, lat);
});

/** Tensión del spline Catmull-Rom. 0 = polilínea recta, 1/6 = estándar. */
const SPLINE_TENSION = 0.15;

function pointAt(points: readonly Point[], index: number): Point {
  const last = points.length - 1;
  const clamped = index < 0 ? 0 : index > last ? last : index;
  return points[clamped];
}

interface RouteSegment {
  readonly d: string;
  /**
   * Cota superior de la longitud del trazo (polígono de control de la
   * Bézier). Alimenta `--draw-len`: pasarse por arriba solo significa que el
   * trazo arranca del todo oculto, que es justo lo que se quiere.
   */
  readonly length: number;
}

/**
 * Convierte los vértices en segmentos Bézier suaves — uno por etapa — con
 * continuidad entre ellos: cada control mira a los vecinos, no solo a los
 * extremos de su propio segmento.
 */
function buildRouteSegments(points: readonly Point[]): readonly RouteSegment[] {
  const segments: RouteSegment[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = pointAt(points, i - 1);
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = pointAt(points, i + 2);

    const c1: Point = {
      x: p1.x + (p2.x - p0.x) * SPLINE_TENSION,
      y: p1.y + (p2.y - p0.y) * SPLINE_TENSION,
    };
    const c2: Point = {
      x: p2.x - (p3.x - p1.x) * SPLINE_TENSION,
      y: p2.y - (p3.y - p1.y) * SPLINE_TENSION,
    };

    segments.push({
      d: `M${n(p1.x)},${n(p1.y)}C${n(c1.x)},${n(c1.y)} ${n(c2.x)},${n(c2.y)} ${n(p2.x)},${n(p2.y)}`,
      length: Math.ceil(distance(p1, c1) + distance(c1, c2) + distance(c2, p2)),
    });
  }
  return segments;
}

const ROUTE_SEGMENTS = buildRouteSegments(ROUTE_POINTS);

/** Trazo completo — el que se dibuja al entrar en viewport. */
const ROUTE_TRACE_D = ROUTE_SEGMENTS.map((segment) => segment.d).join(" ");
const ROUTE_TRACE_LENGTH = ROUTE_SEGMENTS.reduce(
  (total, segment) => total + segment.length,
  0,
);

/* ────────────────────────────────────────────────────────────────────────
   4. Grafía de línea por terreno
   ──────────────────────────────────────────────────────────────────────── */

/** Las cuatro grafías de línea que documenta la leyenda. */
type MapLineKind = "road" | "track" | "dune" | "ferry";

const LEGEND_ORDER: readonly MapLineKind[] = ["road", "track", "dune", "ferry"];

const LINE_KIND_BY_TERRAIN: Readonly<Record<TerrainType, MapLineKind>> = {
  asfalto: "road",
  montana: "road",
  pista: "track",
  gargantas: "track",
  dunas: "dune",
  ferry: "ferry",
};

/** `stroke-dasharray` de cada grafía. `undefined` = línea continua. */
const LINE_DASH: Readonly<Record<MapLineKind, string | undefined>> = {
  road: undefined,
  track: "16 10",
  dune: "2 12",
  ferry: "2 18",
};

/** El mismo patrón a escala de la muestra de la leyenda (26 × 8). */
const LEGEND_DASH: Readonly<Record<MapLineKind, string | undefined>> = {
  road: undefined,
  track: "7 4",
  dune: "1 5",
  ferry: "1 7",
};

const LINE_CAP: Readonly<Record<MapLineKind, "butt" | "round">> = {
  road: "butt",
  track: "butt",
  dune: "round",
  ferry: "round",
};

/* ────────────────────────────────────────────────────────────────────────
   5. Marcadores
   ──────────────────────────────────────────────────────────────────────── */

type LabelSide = "left" | "right" | "bottom";

/**
 * Lado por el que sale la etiqueta de cada waypoint, elegido a mano para que
 * no se pisen entre ellas. Índice 0 = salida, 1..6 = etapas.
 */
const LABEL_SIDES: readonly LabelSide[] = [
  "right", // Tarifa · salida
  "left", // Tánger Med
  "right", // Errachidia
  "right", // Erg Chebbi
  "bottom", // Tazzarine
  "left", // Ouarzazate
  "left", // Marrakech
];

const LABEL_POSITION: Readonly<Record<LabelSide, string>> = {
  right: "left-full top-1/2 ml-2 -translate-y-1/2 text-left",
  left: "right-full top-1/2 mr-2 -translate-y-1/2 text-right",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2 text-center",
};

function labelSideFor(index: number): LabelSide {
  const side = LABEL_SIDES[index];
  return side === undefined ? "right" : side;
}

/* ────────────────────────────────────────────────────────────────────────
   6. Componente
   ──────────────────────────────────────────────────────────────────────── */

export interface MoroccoMapProps {
  /** Etapa desplegada en el roadbook. `null` = ninguna. */
  activeStageId: string | null;
  /** Etapa bajo el cursor o con el foco, venga del mapa o del roadbook. */
  hoveredStageId: string | null;
  /** Alterna la etapa. La decisión de abrir/cerrar la toma el padre. */
  onSelectStage: (stageId: string) => void;
  onHoverStage: (stageId: string | null) => void;
  /**
   * Id del panel del roadbook que abre cada etapa. Si se pasa, cada marcador
   * declara `aria-controls` / `aria-expanded`: un lector de pantalla sabe que
   * pulsar el marcador despliega la ficha de esa etapa, aunque esté lejos.
   */
  getPanelId?: (stageId: string) => string;
  className?: string;
}

/**
 * Cuándo se considera que el mapa ha entrado en pantalla.
 * Se usa `useInView` de framer-motion —la librería que ya mueve el resto de
 * la web— en vez del hook propio del repo: es la misma idea, pero probada.
 */
const IN_VIEW_OPTIONS = { once: true, amount: 0.2 } as const;

/** Estilo con custom properties de CSS, tipado sin recurrir a `any`. */
type TacticalStyle = CSSProperties & Record<`--${string}`, string>;

export default function MoroccoMap({
  activeStageId,
  hoveredStageId,
  onSelectStage,
  onHoverStage,
  getPanelId,
  className = "",
}: MoroccoMapProps) {
  const t = useT();
  /**
   * `useId()` devuelve algo tipo ":r3:". Los dos puntos son válidos en un id
   * de HTML, pero NO dentro de un `url(#…)` de SVG ni en un selector CSS, así
   * que se sanea una sola vez y de ahí salen todos los ids del componente.
   * Los `<defs>` los necesitan únicos: si el mapa llegara a montarse dos veces
   * en la misma página, dos `<pattern id="boam-map-hatch">` colisionarían y el
   * segundo mapa se pintaría con el relleno del primero.
   */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const titleId = `${uid}-title`;
  const hatchId = `${uid}-hatch`;
  const landId = `${uid}-land`;
  const frameRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(frameRef, IN_VIEW_OPTIONS);

  const copy = t.route.map;

  /** Etapa que manda en el HUD: la que está bajo el cursor, o la desplegada. */
  const focusStage: RouteStage | undefined = useMemo(() => {
    const id = hoveredStageId ?? activeStageId;
    if (id === null) return undefined;
    return ROUTE_STAGES.find((stage) => stage.id === id);
  }, [activeStageId, hoveredStageId]);

  const finishStageId = ROUTE_STAGES[ROUTE_STAGES.length - 1].id;

  const traceStyle: TacticalStyle = {
    "--draw-len": String(ROUTE_TRACE_LENGTH),
    "--draw-duration": "2.6s",
    "--draw-delay": "120ms",
  };

  return (
    <figure
      className={`@container m-0 flex flex-col gap-4 ${className}`.trim()}
      aria-labelledby={titleId}
    >
      {/* ── Cabecera ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={titleId} className="telemetry-label telemetry-label-amber telemetry-label-dash">
          {copy.title}
        </h3>
        <p className="gps-label">{copy.hint}</p>
      </div>

      {/* ── Lienzo ──────────────────────────────────────────────────────── */}
      {/* JERARQUÍA DEL MAPA EN CLARO.
          Las hairlines estructurales del lienzo (marcas HUD de las esquinas,
          trama interior del país, costa de España, rosa de los vientos y el
          anillo de los marcadores) NO usan `--color-slate`, sino
          `--outline-stroke`. Ese token vale `var(--color-slate)` en tactical
          —o sea, exactamente el mismo gris de siempre, píxel a píxel— y
          `var(--color-slate-strong)` en desert, donde el slate claro
          (#D8CDB8) sobre la crema del lienzo (#E8DFCE) se queda en 1,1:1 y el
          mapa pierde todo el dibujo técnico. Por eso aquí el color de las
          marcas HUD se fija con `[--hud-color:…]` en vez de `hud-frame-slate`:
          esa utilidad clava el slate y en desert desaparecería. */}
      <div
        ref={frameRef}
        className="hud-frame [--hud-color:var(--outline-stroke)] dust-overlay dust-overlay-soft relative w-full overflow-hidden bg-bg-sunken"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        <div className="grid-blueprint grid-fade absolute inset-0" aria-hidden="true" />

        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {/* Rejilla topográfica interior del país */}
            <pattern id={hatchId} width="26" height="26" patternUnits="userSpaceOnUse">
              <path
                d="M26,0 L0,0 L0,26"
                fill="none"
                stroke="var(--outline-stroke)"
                strokeWidth="1"
                opacity="0.55"
              />
            </pattern>
            <linearGradient id={landId} x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stopColor="var(--color-bg-elevated)" />
              <stop offset="100%" stopColor="var(--color-bg-surface)" />
            </linearGradient>
          </defs>

          {/* Franja de España: contexto del Estrecho */}
          <path
            d={toPath(SPAIN_OUTLINE, true)}
            fill="var(--color-bg-surface)"
            stroke="var(--outline-stroke)"
            strokeWidth="1.25"
            opacity="0.62"
          />

          {/* Marruecos */}
          <path d={toPath(MOROCCO_OUTLINE, true)} fill={`url(#${landId})`} />
          <path d={toPath(MOROCCO_OUTLINE, true)} fill={`url(#${hatchId})`} opacity="0.5" />
          <path
            d={toPath(MOROCCO_OUTLINE, true)}
            fill="none"
            stroke="var(--color-sand)"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.72"
          />

          {/* Cordilleras: Rif, Medio Atlas, Alto Atlas y Anti-Atlas */}
          <g opacity="0.5">
            {MOUNTAIN_RANGES.map((range, rangeIndex) => (
              <g key={`range-${rangeIndex}`}>
                <path
                  d={toPath(range.ridge, false)}
                  fill="none"
                  stroke="var(--color-sand)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  opacity="0.55"
                />
                {range.ridge.map((vertex, vertexIndex) => {
                  const p = project(vertex[0], vertex[1]);
                  const half = range.peak * 0.72;
                  return (
                    <path
                      key={`peak-${rangeIndex}-${vertexIndex}`}
                      d={`M${n(p.x - half)},${n(p.y)}L${n(p.x)},${n(p.y - range.peak)}L${n(p.x + half)},${n(p.y)}`}
                      fill="none"
                      stroke="var(--color-sand)"
                      strokeWidth="1.3"
                    />
                  );
                })}
              </g>
            ))}
          </g>

          {/* Erg Chebbi — cordones de duna junto a la etapa reina */}
          <g opacity="0.55">
            {[0, 1, 2, 3].map((row) => {
              const anchor = project(ERG_CHEBBI_ANCHOR[0], ERG_CHEBBI_ANCHOR[1]);
              const y = anchor.y + row * 9;
              const width = 34 - row * 4;
              return (
                <path
                  key={`dune-${row}`}
                  d={`M${n(anchor.x - width)},${n(y)}q${n(width * 0.5)},-7 ${n(width)},0q${n(width * 0.5)},7 ${n(width)},0`}
                  fill="none"
                  stroke="var(--color-amber)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Rótulo del país */}
          <text
            x={n(project(REGION_LABEL_ANCHOR[0], REGION_LABEL_ANCHOR[1]).x)}
            y={n(project(REGION_LABEL_ANCHOR[0], REGION_LABEL_ANCHOR[1]).y)}
            textAnchor="middle"
            className="font-heading"
            fontSize="30"
            letterSpacing="7"
            fill="var(--color-text-primary)"
            opacity="0.12"
          >
            {copy.regionLabel.toUpperCase()}
          </text>

          {/* Capa TRAZO — se dibuja al entrar en viewport */}
          <g opacity="0.5">
            <path
              d={ROUTE_TRACE_D}
              fill="none"
              stroke="var(--color-amber)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={revealed ? "animate-draw-in" : "opacity-0"}
              style={revealed ? traceStyle : undefined}
            />
          </g>

          {/* Capa BASE — un trazo por etapa, con la grafía de su terreno */}
          <g>
            {ROUTE_SEGMENTS.map((segment, index) => {
              const stage = ROUTE_STAGES[index];
              if (stage === undefined) return null;
              const kind = LINE_KIND_BY_TERRAIN[stage.terrain];
              const isFocus = stage.id === activeStageId || stage.id === hoveredStageId;
              return (
                <g key={stage.id} opacity={isFocus ? 1 : 0.8}>
                  <path
                    d={segment.d}
                    fill="none"
                    stroke={isFocus ? "var(--color-amber)" : "var(--color-sand)"}
                    strokeWidth={isFocus ? 5 : 3}
                    strokeDasharray={LINE_DASH[kind]}
                    strokeLinecap={LINE_CAP[kind]}
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
          </g>

          {/* Escala gráfica, medida sobre la propia proyección */}
          <g className="hidden @sm:block" transform={`translate(40, ${n(VIEW_H - 110)})`}>
            <path
              d={`M0,0 L${n(SCALE_BAR_KM * UNITS_PER_KM)},0 M0,-6 L0,6 M${n(SCALE_BAR_KM * UNITS_PER_KM)},-6 L${n(SCALE_BAR_KM * UNITS_PER_KM)},6`}
              fill="none"
              stroke="var(--color-text-tertiary)"
              strokeWidth="1.5"
            />
            <text
              x={n((SCALE_BAR_KM * UNITS_PER_KM) / 2)}
              y="-12"
              textAnchor="middle"
              className="font-mono"
              fontSize="17"
              letterSpacing="2"
              fill="var(--color-text-tertiary)"
            >
              {`${SCALE_BAR_KM} ${t.common.labels.km}`}
            </text>
          </g>

          {/* Rosa de los vientos */}
          <g transform={`translate(${n(VIEW_W - 64)}, 76)`}>
            <circle cx="0" cy="0" r="30" fill="none" stroke="var(--outline-stroke)" strokeWidth="1.2" />
            <path d="M0,-30 L9,8 L0,1 L-9,8 Z" fill="var(--color-amber)" opacity="0.85" />
            <text
              x="0"
              y="-36"
              textAnchor="middle"
              className="font-mono"
              fontSize="16"
              fill="var(--color-amber)"
            >
              N
            </text>
          </g>
        </svg>

        {/* ── Marcadores: controles HTML reales sobre el SVG ─────────────── */}
        {ROUTE_WAYPOINTS.map((waypoint, index) => {
          const point = ROUTE_POINTS[index];
          const left = `${((point.x / VIEW_W) * 100).toFixed(3)}%`;
          const top = `${((point.y / VIEW_H) * 100).toFixed(3)}%`;
          const side = labelSideFor(index);
          const stage = index === 0 ? undefined : ROUTE_STAGES[index - 1];

          /* Índice 0 = línea de salida. No es una etapa: no es un botón. */
          if (stage === undefined) {
            return (
              <div
                key="waypoint-start"
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left, top }}
              >
                <span className="relative flex h-5 w-5 items-center justify-center @sm:h-6 @sm:w-6">
                  <span className="chamfer-quad-sm absolute inset-0 bg-lime" aria-hidden="true" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-bg-base" aria-hidden="true" />

                  {/* La etiqueta visible se esconde con `hidden` por debajo de
                      cierto ancho de contenedor, y `display:none` la saca
                      también del árbol de accesibilidad. Por eso el nombre va
                      SIEMPRE en un `sr-only` aparte: en móvil la salida se
                      seguiría anunciando. */}
                  <span className="sr-only">
                    {`${copy.startLabel} · ${waypoint.label}`}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute whitespace-nowrap ${LABEL_POSITION[side]}`}
                  >
                    <span className="telemetry-label telemetry-label-lime hidden text-[0.5rem] @sm:block">
                      {copy.startLabel}
                    </span>
                    <span className="gps-label hidden text-text-secondary @md:block">
                      {waypoint.label}
                    </span>
                  </span>
                </span>
              </div>
            );
          }

          const isActive = stage.id === activeStageId;
          const isHovered = stage.id === hoveredStageId;
          const isFinish = stage.id === finishStageId;
          const panelId = getPanelId === undefined ? undefined : getPanelId(stage.id);

          return (
            <div
              key={stage.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                isActive || isHovered ? "z-30" : "z-10"
              }`}
              style={{ left, top }}
            >
              <button
                type="button"
                onClick={() => onSelectStage(stage.id)}
                onMouseEnter={() => onHoverStage(stage.id)}
                /* Si el marcador conserva el FOCO, sacar el ratón de encima no
                   debe apagar el resaltado: el teclado sigue "dentro". */
                onMouseLeave={(event) => {
                  if (event.currentTarget !== document.activeElement) onHoverStage(null);
                }}
                onFocus={() => onHoverStage(stage.id)}
                onBlur={() => onHoverStage(null)}
                aria-expanded={panelId === undefined ? undefined : isActive}
                /* `aria-controls` solo mientras el panel EXISTE en el DOM: el
                   roadbook desmonta la ficha al cerrarla (AnimatePresence) y
                   un IDREF colgando es una violación real de axe. */
                aria-controls={isActive ? panelId : undefined}
                className="relative flex h-7 w-7 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime @sm:h-8 @sm:w-8"
              >
                {/* Fondo achaflanado. Va aparte porque `clip-path` recortaría
                    la etiqueta si estuviera en el propio botón. */}
                <span
                  aria-hidden="true"
                  className={[
                    "chamfer-quad-sm absolute inset-0 transition-colors duration-200 ease-snap",
                    isActive
                      ? "bg-amber shadow-amber-glow"
                      : isHovered
                        ? "bg-bg-elevated shadow-[inset_0_0_0_1px_var(--color-amber)]"
                        : "bg-bg-surface shadow-[inset_0_0_0_1px_var(--outline-stroke)]",
                  ].join(" ")}
                />

                <span
                  aria-hidden="true"
                  className={`relative font-mono text-[0.5625rem] font-semibold leading-none tracking-wider transition-colors duration-200 ease-snap @sm:text-[0.625rem] ${
                    isActive
                      ? "text-text-inverse"
                      : isHovered
                        ? "text-amber-text"
                        : "text-text-secondary"
                  }`}
                >
                  {String(stage.order).padStart(2, "0")}
                </span>

                {/* Nombre accesible del control. La marca de META también va
                    aquí: su versión visible es `@sm:block`, o sea invisible
                    —y fuera del árbol de accesibilidad— en móvil. */}
                <span className="sr-only">
                  {`${t.common.telemetry.checkpoint} ${stage.code} · ${waypoint.label}${
                    isFinish ? ` · ${copy.finishLabel}` : ""
                  }`}
                </span>

                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute whitespace-nowrap ${LABEL_POSITION[side]}`}
                >
                  <span
                    className={`gps-label hidden @md:block ${
                      isActive || isHovered ? "text-amber-text" : "text-text-secondary"
                    }`}
                  >
                    {waypoint.label}
                  </span>
                  {isFinish ? (
                    <span className="telemetry-label telemetry-label-amber hidden text-[0.5rem] @sm:block">
                      {copy.finishLabel}
                    </span>
                  ) : null}
                </span>
              </button>
            </div>
          );
        })}

        {/* ── HUD inferior: la etapa enfocada ────────────────────────────── */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate bg-bg-base/85 px-3 py-2 backdrop-blur-sm">
          {focusStage === undefined ? (
            <>
              <span className="telemetry-label truncate">{copy.placeholder}</span>
              <span className="gps-label ml-auto hidden @sm:block">{formatDMS(ROUTE_START)}</span>
            </>
          ) : (
            <>
              <span className="telemetry-label telemetry-label-amber">{focusStage.code}</span>
              <span className="gps-label truncate text-text-secondary">
                {focusStage.waypoint.label}
              </span>
              <span className="gps-label ml-auto hidden @sm:block">
                {formatDMS(focusStage.waypoint)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Leyenda ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="telemetry-label">{copy.legendTitle}</span>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {LEGEND_ORDER.map((kind) => (
            <li key={kind} className="flex items-center gap-2">
              <svg width="26" height="8" viewBox="0 0 26 8" aria-hidden="true" className="shrink-0">
                <path
                  d="M0,4 L26,4"
                  fill="none"
                  stroke="var(--color-sand)"
                  strokeWidth="2.5"
                  strokeDasharray={LEGEND_DASH[kind]}
                  strokeLinecap={LINE_CAP[kind]}
                />
              </svg>
              <span className="gps-label">{copy.legend[kind]}</span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span
              className="chamfer-quad-sm h-3 w-3 shrink-0 bg-bg-surface shadow-[inset_0_0_0_1px_var(--outline-stroke)]"
              aria-hidden="true"
            />
            <span className="gps-label">{copy.legend.checkpoint}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="chamfer-quad-sm h-3 w-3 shrink-0 bg-lime" aria-hidden="true" />
            <span className="gps-label">{copy.legend.start}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="chamfer-quad-sm h-3 w-3 shrink-0 bg-amber" aria-hidden="true" />
            <span className="gps-label">{copy.legend.finish}</span>
          </li>
        </ul>
      </div>

      <figcaption className="gps-label leading-relaxed text-text-tertiary">{copy.note}</figcaption>
    </figure>
  );
}
