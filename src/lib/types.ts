/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Tipos compartidos de la capa de datos
   --------------------------------------------------------------------------
   Este fichero SOLO contiene tipos (más un par de utilidades de tipo). No
   importa nada de los módulos de datos, para que nunca haya ciclos:

       types.ts  <──  route.ts / team.ts / sponsors.ts  <──  constants.ts

   Convención de "dato pendiente": muchos campos del dossier (grupo sanguíneo,
   bios, handles personales, precios sin cerrar) todavía no los tenemos. En vez
   de inventarlos usamos el centinela PENDING, que es visible tanto en el código
   como si alguien lo renderiza por error.
   ══════════════════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────────────────
   1. Estado del dato
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Centinela para cualquier dato real que el equipo todavía no nos ha dado.
 * Es una cadena legible a propósito: si se escapa a la UI se ve "PENDIENTE",
 * no un string vacío ni un `undefined` silencioso.
 */
export const PENDING = "PENDIENTE" as const;

/** Tipo literal del centinela {@link PENDING}. */
export type Pending = typeof PENDING;

/** Un valor de tipo `T` o el centinela {@link PENDING}. */
export type MaybePending<T> = T | Pending;

/** Type guard: estrecha `MaybePending<T>` a `T` cuando devuelve `false`. */
export function isPending<T>(value: MaybePending<T>): value is Pending {
  return value === PENDING;
}

/**
 * Devuelve el valor si está confirmado, o `fallback` si sigue pendiente.
 * Pensado para la UI: `resolvePending(member.bloodType, "—")`.
 */
export function resolvePending<T>(value: MaybePending<T>, fallback: T): T {
  return isPending(value) ? fallback : value;
}

/**
 * Marca de verificación para datos reconstruidos o estimados.
 * `verified: false` significa: "esto es una reconstrucción plausible,
 * el equipo tiene que confirmarlo antes de publicarlo como oficial".
 */
export interface Verifiable {
  readonly verified: boolean;
  /** Qué hay que confirmar exactamente y con quién. */
  readonly verificationNote?: string;
}

/* ────────────────────────────────────────────────────────────────────────
   2. Geografía
   ──────────────────────────────────────────────────────────────────────── */

/** Punto geográfico en grados decimales (WGS84). */
export interface GeoPoint {
  /** Latitud en grados decimales. Norte positivo. */
  readonly lat: number;
  /** Longitud en grados decimales. Este positivo, Oeste negativo. */
  readonly lon: number;
}

/** Países que toca la expedición. */
export type CountryCode = "ES" | "MA" | "FR";

/** Punto geográfico con etiqueta legible para HUD / micro-badging. */
export interface GeoWaypoint extends GeoPoint {
  /** Nombre del lugar: "Merzouga", "Ouarzazate". */
  readonly label: string;
  /** Código ISO-3166-1 alpha-2 del país. */
  readonly country: CountryCode;
}

/* ────────────────────────────────────────────────────────────────────────
   3. Recorrido (route.ts)
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Tipo de terreno dominante de una etapa.
 * Unión cerrada a propósito: la UI mapea cada valor a un icono/color.
 */
export type TerrainType =
  | "asfalto"
  | "pista"
  | "dunas"
  | "gargantas"
  | "montana"
  | "ferry";

/** Nivel de dificultad de una etapa, de 1 (enlace fácil) a 5 (extremo). */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

/** Una etapa del roadbook. */
export interface RouteStage extends Verifiable {
  /** Identificador estable, formato "etapa-01". */
  readonly id: string;
  /** Número de orden, 1-based. */
  readonly order: number;
  /** Código corto para tablas y badges: "E01". */
  readonly code: string;
  /** Título de la etapa tal y como lo dio el cliente. */
  readonly title: string;
  /** Días de expedición que ocupa esta etapa, 1-based. Ej: [1, 2]. */
  readonly days: readonly number[];
  /** Localidad de salida. */
  readonly origin: string;
  /** Localidad de llegada. */
  readonly destination: string;
  /** Kilometraje estimado de la etapa. RECONSTRUIDO, no oficial. */
  readonly km: number;
  /** Terreno dominante: el que manda para el color/icono de la etapa. */
  readonly terrain: TerrainType;
  /** Mezcla real de terrenos, el dominante primero. */
  readonly terrainMix: readonly TerrainType[];
  /** Dificultad 1-5. */
  readonly difficulty: DifficultyLevel;
  /** Objetivo solidario concreto de esa jornada. */
  readonly charityGoal: string;
  /** Punto de control de la etapa (normalmente el destino). */
  readonly waypoint: GeoWaypoint;
  /** Descripción editorial de la etapa. */
  readonly description: string;
}

/** Totales agregados del recorrido. Todo derivado de ROUTE_STAGES. */
export interface RouteSummary {
  readonly totalStages: number;
  readonly totalDays: number;
  /** Suma de los km de las 6 etapas (tramo marroquí). */
  readonly moroccoKm: number;
  /** Enlace basecamp -> Tarifa, fuera de las etapas cronometradas. */
  readonly approachKm: number;
  /** moroccoKm + approachKm, sólo ida. */
  readonly oneWayKm: number;
  /** Estimación ida y vuelta. */
  readonly roundTripKm: number;
  /** Id de la etapa con mayor dificultad. */
  readonly hardestStageId: string;
  /** Id de la etapa más larga en km. */
  readonly longestStageId: string;
}

/* ────────────────────────────────────────────────────────────────────────
   4. Equipo (team.ts)
   ──────────────────────────────────────────────────────────────────────── */

/** Rol dentro de la tripulación. */
export type CrewRole = "piloto" | "copiloto";

/** Grupo sanguíneo según sistema ABO/Rh. Dato obligatorio en raid. */
export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

/** Handles de redes de un miembro. Todos opcionales y por defecto pendientes. */
export interface SocialHandles {
  readonly instagram?: MaybePending<string>;
  readonly tiktok?: MaybePending<string>;
  readonly linkedin?: MaybePending<string>;
}

/**
 * "Pilot passport": la ficha tipo documento de identidad que pide la spec.
 * Todo lo personal que no nos han dado va como PENDING.
 */
export interface TeamMember extends Verifiable {
  /** Identificador estable en kebab-case: "alex-loras". */
  readonly id: string;
  /** Nombre real, tal y como aparece hoy en la web. */
  readonly name: string;
  /** Iniciales para avatares y badges. */
  readonly initials: string;
  readonly role: CrewRole;
  /** Id de la tripulación a la que pertenece. */
  readonly crewId: string;
  /** Grupo sanguíneo. PENDING hasta que cada uno lo confirme. */
  readonly bloodType: MaybePending<BloodType>;
  /** Ciudad de origen. */
  readonly homeCity: string;
  /** Coordenadas de la ciudad de origen, para el micro-badging GPS. */
  readonly homeCoords: GeoPoint;
  /** Bio corta, 2-3 frases. PENDING hasta que la escriban. */
  readonly bio: MaybePending<string>;
  readonly socials: SocialHandles;
}

/** Modificaciones de raid del vehículo, según el módulo de specs de la spec. */
export interface RaidModifications {
  /** Motor de serie del Escort. */
  readonly engine: string;
  /** Suspensión elevada. */
  readonly suspension: string;
  /** Cubrecárter / protección de bajos. */
  readonly underbodyProtection: string;
  /** Faros auxiliares. */
  readonly auxiliaryLights: string;
  /** Tracción. */
  readonly drivetrain: string;
  /** Capacidad de carga solidaria en kg. */
  readonly cargoCapacityKg: number;
  /** Qué se carga exactamente. */
  readonly cargoNotes: string;
}

/** Ficha del vehículo de una tripulación. */
export interface CrewVehicle extends Verifiable {
  /** Modelo: "Ford Escort MK7". */
  readonly model: string;
  /** Año de matriculación. */
  readonly year: number;
  /** Dorsal del coche dentro del equipo, 1-4. */
  readonly carNumber: number;
  /** Apodo interno del coche. */
  readonly nickname: string;
  readonly raidMods: RaidModifications;
}

/** Tripulación: dos personas y un coche. */
export interface Crew {
  /** Identificador estable: "crew-01". */
  readonly id: string;
  /** Código de dos dígitos que usa la UI actual: "01". */
  readonly code: string;
  /** Nombre del equipo formado por los apellidos: "LORAS & HUSE". */
  readonly name: string;
  readonly pilot: TeamMember;
  readonly copilot: TeamMember;
  readonly vehicle: CrewVehicle;
}

/* ────────────────────────────────────────────────────────────────────────
   5. Patrocinio (sponsors.ts)
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Los 4 niveles de patrocinio, de mayor a menor.
 * Nombres tomados TAL CUAL del dossier comercial del equipo
 * ("Matriz de Patrocinio: Opciones de Inversión").
 */
export type SponsorTierId = "principal" | "oro" | "plata" | "bronce";

/**
 * Banda de visibilidad de la carrocería, tal y como está definida en la
 * lámina "El Lienzo: Zonas de Patrocinio" del dossier. Cada banda pertenece
 * en exclusiva a un tier.
 */
export type VisibilityBand = "maxima" | "alta" | "media" | "complementaria";

/**
 * Una fila de la matriz de inversión: un concepto y lo que recibe cada tier.
 * `null` = ese tier no incluye el concepto (en el dossier aparece como "-").
 */
export interface TierBenefitRow {
  /** Concepto de la fila: "Tamaño del Logo", "Vídeo Promocional"... */
  readonly concept: string;
  readonly values: Readonly<Record<SponsorTierId, string | null>>;
}

/** Definición comercial de un nivel de patrocinio. */
export interface SponsorTier {
  readonly id: SponsorTierId;
  /** Nombre comercial del dossier: "PRINCIPAL", "ORO", "PLATA", "BRONCE". */
  readonly label: string;
  /** Orden de presentación, 1 = tier más alto. */
  readonly rank: number;
  /** Precio en euros. Dato cerrado por el equipo en el dossier. */
  readonly priceEur: MaybePending<number>;
  /**
   * Plazas disponibles en ese nivel, según el dossier.
   * `null` = sin límite declarado (PLATA y BRONCE no lo especifican).
   */
  readonly slots: number | null;
  /** Banda de visibilidad de carrocería que le corresponde. */
  readonly visibility: VisibilityBand;
  /** Titular de una línea, el que se ve en la tarjeta. */
  readonly headline: string;
  /** Lista de beneficios, derivada de la matriz del dossier. */
  readonly benefits: readonly string[];
  /** Color del tier, token del design system Rally Desert Tactical. */
  readonly color: string;
  /** Tarjeta destacada en la parrilla de precios. */
  readonly highlight: boolean;
}

/** Marca patrocinadora que ya ocupa un hueco. */
export interface Sponsor {
  readonly name: string;
  /** Ruta al logo dentro de /public. */
  readonly logo: string;
  readonly url: string;
}

/** Estado de un hueco de vinilo en la carrocería. */
export type SponsorSlotStatus = "available" | "occupied";

/**
 * Vista de la carrocería donde vive el hueco.
 * Son las cinco vistas del SVG original del equipo, ya separadas en
 * /public/car/. Los dos laterales son vistas distintas porque cada flanco
 * se vende por separado.
 */
export type CarView =
  | "lateral-izq"
  | "lateral-der"
  | "frontal"
  | "trasera"
  | "cenital";

/** Dimensiones físicas del vinilo, en centímetros. */
export interface VinylDimensions {
  readonly widthCm: number;
  readonly heightCm: number;
}

/** Un hueco de patrocinio concreto sobre la carrocería. */
export interface SponsorSlot extends Verifiable {
  /** Identificador estable: "lat-puerta-del". */
  readonly id: string;
  /** Nombre legible de la zona. */
  readonly label: string;
  readonly tier: SponsorTierId;
  readonly status: SponsorSlotStatus;
  /** Sólo presente si `status === "occupied"`. */
  readonly sponsor?: Sponsor;
  readonly view: CarView;
  /**
   * Id de la zona geométrica en el módulo del coche (src/lib/car/**).
   * Este fichero no importa de ahí a propósito: sólo guarda la referencia
   * textual, para que la capa de datos y la geometría no se acoplen.
   *
   * Las MEDIDAS DEL VINILO no viven aquí: las calcula el módulo de geometría
   * a partir del path real de la zona, que es la única fuente fiable.
   * Búscalas en `src/lib/car/**` vía este `zoneId`.
   */
  readonly zoneId: string;
}

/* ────────────────────────────────────────────────────────────────────────
   6. Contenido / UI compartida (constants.ts)
   ──────────────────────────────────────────────────────────────────────── */

/** Entrada de navegación. */
export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** true si es una ruta de Next, false si es un ancla dentro de la home. */
  readonly isRoute: boolean;
}

/** Contador animado de la sección "El Proyecto". */
export interface CounterItem {
  readonly target: number;
  readonly suffix: string;
  readonly label: string;
}

/** Relación de aspecto de un hueco de imagen. */
export type MediaAspect = "square" | "portrait" | "landscape" | "wide";

/**
 * Placeholder enriquecido de imagen (Módulo 6 de la spec).
 * Sustituye a las URLs de stock: describe QUÉ foto va ahí para que el equipo
 * pueda reemplazarla por material propio sin adivinar.
 */
export interface MediaPlaceholder {
  /** Identificador estable, útil como `key` y como nombre de fichero sugerido. */
  readonly id: string;
  /** Briefing de la foto que tiene que ir en ese hueco. */
  readonly brief: string;
  /** Pie de foto publicable. */
  readonly caption: string;
  readonly aspect: MediaAspect;
  /** Texto alternativo accesible. */
  readonly alt: string;
  /**
   * Ruta real dentro de /public cuando el equipo la suba.
   * `null` = sigue siendo un placeholder y hay que renderizar el hueco técnico.
   */
  readonly src: string | null;
}

/** Tarjeta de la sección de comunicación / prensa. */
export interface CommunicationCard {
  readonly title: string;
  readonly excerpt: string;
  /** Fecha legible, o PENDING si aún no hay. */
  readonly date: MaybePending<string>;
  readonly tag: string;
}

/** Perfil social del equipo. */
export interface SocialProfile {
  readonly platform: "instagram" | "tiktok" | "youtube" | "linkedin";
  readonly handle: string;
  readonly url: string;
}

/** Idiomas en los que se formatea la fecha de la edición. */
export type EditionLocale = "es" | "en";
