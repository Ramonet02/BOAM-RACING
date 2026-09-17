/* ██████████████████████████████████████████████████████████████████████████
   ██                                                                      ██
   ██   ⚠  AVISO — DATOS NO OFICIALES · RECONSTRUCCIÓN                     ██
   ██                                                                      ██
   ██   El roadbook oficial de UniRaid 2027 NO es público y NO lo tenemos.  ██
   ██   Todo lo que hay en este fichero — kilometrajes, localidades         ██
   ██   intermedias, reparto de días por etapa, dificultades y             ██
   ██   coordenadas de waypoint — es una RECONSTRUCCIÓN PLAUSIBLE hecha a   ██
   ██   partir del brief del cliente (8 días / 6 etapas y los 6            ██
   ██   checkpoints que nos dio) más distancias por carretera conocidas.    ██
   ██                                                                      ██
   ██   Cada etapa lleva `verified: false` y una `verificationNote` con lo  ██
   ██   que hay que confirmar. NO presentar esto como roadbook oficial en   ██
   ██   ningún material público hasta que la organización publique el suyo. ██
   ██   Cuando llegue el roadbook real: actualizar los valores y poner      ██
   ██   `verified: true` etapa por etapa.                                   ██
   ██                                                                      ██
   ██   Lo ÚNICO confirmado por el cliente es:                             ██
   ██     · 8 días de expedición, 6 etapas                                 ██
   ██     · el orden y el contenido de los 6 checkpoints                    ██
   ██     · que la meta está en Marrakech / Fez                            ██
   ██                                                                      ██
   ██████████████████████████████████████████████████████████████████████████ */

import type {
  DifficultyLevel,
  GeoWaypoint,
  RouteStage,
  RouteSummary,
  TerrainType,
} from "./types";

/* ────────────────────────────────────────────────────────────────────────
   Hechos confirmados por el cliente
   ──────────────────────────────────────────────────────────────────────── */

/** Días totales de expedición. CONFIRMADO por el cliente. */
export const TOTAL_DAYS = 8 as const;

/** Etapas totales. CONFIRMADO por el cliente. */
export const TOTAL_STAGES = 6 as const;

/**
 * Enlace desde el basecamp hasta la línea de salida en Tarifa.
 * NO es una etapa: es el traslado previo. Km estimado por carretera.
 * RECONSTRUIDO.
 */
export const APPROACH_KM = 1150;

/* ────────────────────────────────────────────────────────────────────────
   Waypoints del recorrido
   ──────────────────────────────────────────────────────────────────────── */

/** Punto de salida. No pertenece a ninguna etapa: es el km 0. */
export const ROUTE_START: GeoWaypoint = {
  label: "Tarifa",
  country: "ES",
  lat: 36.0143,
  lon: -5.6044,
};

/* ────────────────────────────────────────────────────────────────────────
   Las 6 etapas
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Recorrido oficial según el brief del cliente: 8 días, 6 etapas.
 * RECONSTRUIDO — ver el aviso de la cabecera del fichero.
 */
export const ROUTE_STAGES: readonly RouteStage[] = [
  {
    id: "etapa-01",
    order: 1,
    code: "E01",
    title: "Salida y verificaciones técnicas",
    days: [1, 2],
    origin: "Tarifa",
    destination: "Tánger",
    km: 45,
    terrain: "ferry",
    terrainMix: ["ferry", "asfalto"],
    difficulty: 1,
    charityGoal:
      "Pesaje y precinto del material solidario: carga de libros, material escolar y ropa en los cuatro coches antes de embarcar.",
    waypoint: {
      label: "Tánger Med",
      country: "MA",
      lat: 35.8838,
      lon: -5.5106,
    },
    description:
      "Jornada de verificaciones técnicas en el puerto de Tarifa: revisión de extintores, arneses, cubrecárter y documentación. Cruce del Estrecho en ferry y primer contacto con Marruecos en Tánger.",
    verified: false,
    verificationNote:
      "Confirmar puerto exacto de llegada (Tánger Ville vs Tánger Med) y si las verificaciones se hacen en Tarifa o ya en Marruecos.",
  },
  {
    id: "etapa-02",
    order: 2,
    code: "E02",
    title: "Cruce del Gran Atlas",
    days: [3, 4],
    origin: "Tánger",
    destination: "Errachidia",
    km: 880,
    terrain: "montana",
    terrainMix: ["montana", "asfalto", "gargantas"],
    difficulty: 3,
    charityGoal:
      "Contacto con la ONG local y confirmación de los puntos de entrega en los valles del sur.",
    waypoint: {
      label: "Errachidia",
      country: "MA",
      lat: 31.9314,
      lon: -4.4244,
    },
    description:
      "Largo enlace hacia el interior por Fez y Midelt, con el paso del Gran Atlas por el Tizi n'Talghomt. Puertos de más de 1.900 m, temperatura en caída y el primer día largo de volante del rally.",
    verified: false,
    verificationNote:
      "Reparto real de los días 3 y 4 y punto de vivac intermedio (Midelt es una suposición razonable, no un dato).",
  },
  {
    id: "etapa-03",
    order: 3,
    code: "E03",
    title: "Desierto profundo y dunas de Erg Chebbi",
    days: [5],
    origin: "Errachidia",
    destination: "Merzouga · Erg Chebbi",
    km: 200,
    terrain: "dunas",
    terrainMix: ["dunas", "pista"],
    difficulty: 5,
    charityGoal:
      "Reparto de agua y material sanitario básico en los campamentos nómadas del borde del erg.",
    waypoint: {
      label: "Erg Chebbi",
      country: "MA",
      lat: 31.1497,
      lon: -3.9728,
    },
    description:
      "La etapa reina. Pista rápida hasta Erfoud y entrada al Erg Chebbi: cordones de duna de hasta 150 m, navegación a rumbo y arena blanda. Es donde se decide qué coches llegan enteros al final.",
    verified: false,
    verificationNote:
      "Los dos días de desierto que suele tener UniRaid aquí van comprimidos en uno para cuadrar con los 8 días del brief. Confirmar.",
  },
  {
    id: "etapa-04",
    order: 4,
    code: "E04",
    title: "Entrega del material solidario",
    days: [6],
    origin: "Merzouga",
    destination: "Alnif · Tazzarine",
    km: 210,
    terrain: "pista",
    terrainMix: ["pista", "asfalto"],
    difficulty: 3,
    charityGoal:
      "Núcleo solidario del rally: descarga del material escolar y deportivo en las escuelas rurales de los pueblos bereberes del Draa.",
    waypoint: {
      label: "Tazzarine",
      country: "MA",
      lat: 30.7833,
      lon: -5.5833,
    },
    description:
      "Jornada corta en kilómetros y la más importante del viaje. Pistas de tierra entre pueblos bereberes, con parada en escuelas rurales para entregar en mano lo que se cargó en Tarifa.",
    verified: false,
    verificationNote:
      "Escuelas y aldeas concretas las asigna la organización sobre el terreno. Pendiente de la ONG.",
  },
  {
    id: "etapa-05",
    order: 5,
    code: "E05",
    title: "Etapa maratón de navegación",
    days: [7],
    origin: "Tazzarine",
    destination: "Ouarzazate",
    km: 350,
    terrain: "pista",
    terrainMix: ["pista", "gargantas", "montana"],
    difficulty: 4,
    charityGoal:
      "Etapa sin asistencia: la solidaridad es entre equipos, remolcando y reparando a quien se queda.",
    waypoint: {
      label: "Ouarzazate",
      country: "MA",
      lat: 30.9189,
      lon: -6.8934,
    },
    description:
      "Maratón: sin asistencia exterior y con roadbook cerrado. Pistas de Nekob y Agdz, vadeos secos del Draa y gargantas estrechas. Se navega con brújula y cuentakilómetros, no con GPS.",
    verified: false,
    verificationNote:
      "Kilometraje y trazado de la maratón son los datos más inciertos del fichero.",
  },
  {
    id: "etapa-06",
    order: 6,
    code: "E06",
    title: "Cierre y meta",
    days: [8],
    origin: "Ouarzazate",
    destination: "Marrakech",
    km: 200,
    terrain: "montana",
    terrainMix: ["montana", "asfalto"],
    difficulty: 2,
    charityGoal:
      "Balance de la entrega: recuento del material repartido y acta con la ONG receptora.",
    waypoint: {
      label: "Marrakech",
      country: "MA",
      lat: 31.6295,
      lon: -7.9811,
    },
    description:
      "Subida al Tizi n'Tichka (2.260 m) y descenso al Haouz hasta la meta en Marrakech. Última jornada, con los coches ya marcados por el desierto.",
    verified: false,
    verificationNote:
      "El cliente dio la meta como 'Marrakech / Fez'. Aquí se asume Marrakech por continuidad con la etapa 5; si la organización cierra en Fez hay que rehacer E05 y E06.",
  },
];

/* ────────────────────────────────────────────────────────────────────────
   Derivados — no escribir estos números a mano en ningún sitio
   ──────────────────────────────────────────────────────────────────────── */

const moroccoKm = ROUTE_STAGES.reduce((acc, stage) => acc + stage.km, 0);

const hardestStage = ROUTE_STAGES.reduce((best, stage) =>
  stage.difficulty > best.difficulty ? stage : best,
);

const longestStage = ROUTE_STAGES.reduce((best, stage) =>
  stage.km > best.km ? stage : best,
);

/**
 * Totales del recorrido, todos derivados de ROUTE_STAGES.
 *
 * Nota histórica: la web anterior anunciaba "6.000 km" y "9 días". Esa cifra
 * incluía el trayecto completo de ida y vuelta desde Francia. El brief actual
 * habla de 8 días y 6 etapas, así que los totales se recalculan aquí desde las
 * etapas reales en vez de arrastrar el número antiguo.
 */
export const ROUTE_SUMMARY: RouteSummary = {
  totalStages: ROUTE_STAGES.length,
  totalDays: TOTAL_DAYS,
  moroccoKm,
  approachKm: APPROACH_KM,
  oneWayKm: moroccoKm + APPROACH_KM,
  roundTripKm: moroccoKm + APPROACH_KM * 2,
  hardestStageId: hardestStage.id,
  longestStageId: longestStage.id,
};

/**
 * Secuencia completa de waypoints: salida + un punto de control por etapa.
 * Es lo que consume el mapa SVG dibujado a mano para trazar la polilínea.
 */
export const ROUTE_WAYPOINTS: readonly GeoWaypoint[] = [
  ROUTE_START,
  ...ROUTE_STAGES.map((stage) => stage.waypoint),
];

/** Caja envolvente de todos los waypoints. Útil para encajar el viewBox del mapa. */
export const ROUTE_BOUNDS: {
  readonly minLat: number;
  readonly maxLat: number;
  readonly minLon: number;
  readonly maxLon: number;
} = {
  minLat: Math.min(...ROUTE_WAYPOINTS.map((w) => w.lat)),
  maxLat: Math.max(...ROUTE_WAYPOINTS.map((w) => w.lat)),
  minLon: Math.min(...ROUTE_WAYPOINTS.map((w) => w.lon)),
  maxLon: Math.max(...ROUTE_WAYPOINTS.map((w) => w.lon)),
};

/* ────────────────────────────────────────────────────────────────────────
   Diccionarios de presentación
   ──────────────────────────────────────────────────────────────────────── */

/** Etiqueta legible de cada tipo de terreno (es). */
export const TERRAIN_LABELS: Record<TerrainType, string> = {
  asfalto: "Asfalto",
  pista: "Pista",
  dunas: "Dunas",
  gargantas: "Gargantas",
  montana: "Montaña",
  ferry: "Ferry",
};

/**
 * Token de color por terreno, dentro del design system Rally Desert Tactical.
 * Se usa para el badge de terreno de cada fila del roadbook.
 */
export const TERRAIN_COLORS: Record<TerrainType, string> = {
  asfalto: "#8C8275", // Muted Sand — enlace, lo menos interesante
  pista: "#D4A359", // Sand Gold
  dunas: "#FF6B00", // Dakar Amber — lo más duro
  gargantas: "#CCFF00", // High-Viz Lime
  montana: "#D4A359", // Sand Gold
  ferry: "#2A2E35", // Slate — tránsito
};

/** Etiqueta legible de cada nivel de dificultad. */
export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: "Enlace",
  2: "Fácil",
  3: "Media",
  4: "Dura",
  5: "Extrema",
};

/* ────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────── */

/** Busca una etapa por su id. `undefined` si no existe. */
export function getStageById(id: string): RouteStage | undefined {
  return ROUTE_STAGES.find((stage) => stage.id === id);
}

/** Etapa que se corre en un día concreto (1-8). */
export function getStageByDay(day: number): RouteStage | undefined {
  return ROUTE_STAGES.find((stage) => stage.days.includes(day));
}

/**
 * Formatea el rango de días de una etapa: "Día 5" o "Días 1–2".
 * Usa guion medio tipográfico, no un guion corto.
 */
export function formatStageDays(stage: RouteStage): string {
  if (stage.days.length === 0) return "";
  if (stage.days.length === 1) return `Día ${stage.days[0]}`;
  const first = stage.days[0];
  const last = stage.days[stage.days.length - 1];
  return `Días ${first}–${last}`;
}

/** Formatea kilometraje con separador de millares español: "1.885 km". */
export function formatKm(km: number): string {
  return `${km.toLocaleString("es-ES")} km`;
}

/** `true` si alguna etapa sigue sin verificar. Sirve para pintar el aviso en la UI. */
export const ROUTE_HAS_UNVERIFIED_DATA: boolean = ROUTE_STAGES.some(
  (stage) => !stage.verified,
);

/**
 * Texto corto para poner junto al roadbook en la web.
 * Mientras ROUTE_HAS_UNVERIFIED_DATA sea `true`, esto debe verse.
 */
export const ROUTE_DISCLAIMER =
  "Recorrido estimado. El roadbook oficial de UniRaid no es público hasta días antes de la salida: kilometrajes y localidades intermedias son una previsión del equipo.";

export type { RouteStage, RouteSummary, TerrainType, DifficultyLevel, GeoWaypoint };
