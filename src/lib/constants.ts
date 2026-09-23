/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Constantes globales
   --------------------------------------------------------------------------
   Fuente de verdad única para marca, edición del rally, contacto, redes,
   coordenadas y paleta. Nada de esto se escribe a mano en los componentes.

   Grafo de dependencias (sin ciclos):
       types.ts  <──  route.ts / team.ts / sponsors.ts  <──  constants.ts

   REGLA DE MARCA — no negociable:
     BOAM RACING es el nombre del EQUIPO.
     UniRaid es sólo el nombre del rally en el que compiten.
     "UNIRAID TEAM" no es una marca y no debe aparecer en ningún sitio.

   REGLA DE FECHA — no negociable:
     La edición es FEBRERO 2027 y vive únicamente en {@link EDITION}.
     Para mostrarla se usan los helpers de abajo. Prohibido escribir
     "2027" o "Febrero 2027" suelto en un componente.
   ══════════════════════════════════════════════════════════════════════════ */

import { CREWS, FLEET_SIZE, TEAM_SIZE } from "./team";
import { ROUTE_SUMMARY } from "./route";
import {
  PENDING,
  type CommunicationCard,
  type CounterItem,
  type EditionLocale,
  type GeoPoint,
  type MediaPlaceholder,
  type NavItem,
  type SocialProfile,
} from "./types";

/* ────────────────────────────────────────────────────────────────────────
   1. Marca
   ──────────────────────────────────────────────────────────────────────── */

/** Identidad del equipo. */
export const BRAND = {
  /** Nombre completo del equipo, en mayúsculas como en el logo. */
  name: "BOAM RACING",
  /** Versión corta para espacios estrechos. */
  short: "BOAM",
  /** Versión con capitalización normal, para prosa. */
  display: "Boam Racing",
  /** Qué es el equipo, en una línea. */
  descriptor: "Escudería universitaria",
  /** Claim principal. */
  tagline: "Ocho estudiantes, cuatro coches, una misión solidaria.",
  /** Ciudad base del equipo. */
  city: "Barcelona",
  country: "España",
} as const;

/** El rally en el que compite BOAM RACING. NO es la marca del equipo. */
export const RALLY = {
  /** Nombre del rally. */
  name: "UniRaid",
  /** Descripción de una línea. */
  descriptor: "Rally solidario universitario por Marruecos",
  /** País donde se disputa. */
  country: "Marruecos",
} as const;

/* ────────────────────────────────────────────────────────────────────────
   2. Edición — ÚNICA fuente de verdad de la fecha
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Edición del rally en la que participa el equipo.
 *
 * Lo ÚNICO confirmado por el cliente es el mes: **febrero de 2027**.
 * El día exacto de salida lo publica la organización más adelante, por eso
 * `startDay` es `null` y la cuenta atrás apunta al día 1 del mes.
 */
export const EDITION = {
  /** Año de la edición. */
  year: 2027,
  /** Mes de la edición, 1-12. Febrero. */
  month: 2,
  /** Mes en formato ISO, útil para `<time datetime>`. */
  isoMonth: "2027-02",
  /** Día exacto de salida: aún sin publicar por la organización. */
  startDay: null,
} as const;

/** Nombres de mes por idioma, para no depender de `Intl` (evita desajustes SSR/cliente). */
const MONTH_NAMES: Record<EditionLocale, readonly string[]> = {
  es: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

/** "Febrero 2027" / "February 2027". */
export function getEditionLabel(locale: EditionLocale = "es"): string {
  return `${MONTH_NAMES[locale][EDITION.month - 1]} ${EDITION.year}`;
}

/** "UniRaid Febrero 2027" / "UniRaid February 2027". */
export function getRallyEditionLabel(locale: EditionLocale = "es"): string {
  return `${RALLY.name} ${getEditionLabel(locale)}`;
}

/** Etiqueta por defecto en español: "Febrero 2027". */
export const EDITION_LABEL: string = getEditionLabel("es");

/** "UniRaid 2027" — versión corta para títulos y OpenGraph. */
export const EDITION_SHORT_LABEL = `${RALLY.name} ${EDITION.year}` as const;

/** Sólo el año, como texto: "2027". */
export const EDITION_YEAR_LABEL = String(EDITION.year);

/** Slug para rutas y nombres de fichero: "uniraid-2027". */
export const EDITION_SLUG = `uniraid-${EDITION.year}`;

/**
 * Objetivo de la cuenta atrás: 1 de febrero de 2027, 00:00 UTC.
 * Se fija en UTC a propósito para que servidor y cliente calculen lo mismo.
 * Cuando la organización publique el día exacto, actualizar `EDITION.startDay`
 * y este valor pasará a ser ese día.
 */
export const EDITION_COUNTDOWN_TARGET: Date = new Date(
  Date.UTC(EDITION.year, EDITION.month - 1, EDITION.startDay ?? 1, 0, 0, 0),
);

/** Timestamp de la salida, en milisegundos. Cómodo para `useEffect` de countdown. */
export const EDITION_COUNTDOWN_TARGET_MS: number =
  EDITION_COUNTDOWN_TARGET.getTime();

/* ────────────────────────────────────────────────────────────────────────
   3. Contacto y redes
   ──────────────────────────────────────────────────────────────────────── */

/** Datos de contacto del equipo. */
export const CONTACT = {
  /** Correo del equipo, el mismo que publica el dossier. */
  email: "boamracingteam@gmail.com",
  /** `mailto:` listo para usar. */
  mailto: "mailto:boamracingteam@gmail.com",
  /** Teléfono: el equipo aún no publica ninguno. */
  phone: PENDING,
  city: BRAND.city,
  country: BRAND.country,
} as const;

/**
 * Dossier de patrocinio en PDF.
 *
 * Es el documento comercial que el equipo enseña a las empresas: el mismo del
 * que salen los niveles y los precios de `src/lib/sponsors.ts`. Vive en
 * `public/`, así que se sirve tal cual y NO pasa por el bundle.
 *
 * `locale` está a propósito: el dossier sólo existe en castellano, mientras
 * que la web va en tres idiomas. Quien lo enlace debe avisarlo en inglés y en
 * catalán en vez de dejar que el visitante se lo encuentre — de eso se encarga
 * `t.sponsors.contact.dossierNote`.
 *
 * Las cifras (páginas y tamaño) no son decorativas: un enlace a un PDF que no
 * dice cuánto pesa es un enlace que la gente no pulsa desde el móvil.
 */
export const DOSSIER = {
  href: "/dossier/boam-racing-uniraid-2027.pdf",
  /** Nombre con el que se descarga, no el de la ruta. */
  filename: "Boam_Racing_Team_UNIRAID_2027.pdf",
  pages: 12,
  sizeMb: 1.7,
  /** Único idioma en el que existe el documento hoy. */
  locale: "es",
} as const;

/** Handle común del equipo en redes. DATO REAL. */
export const SOCIAL_HANDLE = "@boamracingteam" as const;

/** Perfiles sociales del equipo. */
export const SOCIALS: readonly SocialProfile[] = [
  {
    platform: "instagram",
    handle: SOCIAL_HANDLE,
    url: "https://www.instagram.com/boamracingteam/",
  },
  {
    platform: "tiktok",
    handle: SOCIAL_HANDLE,
    url: "https://www.tiktok.com/@boamracingteam",
  },
];

/* ────────────────────────────────────────────────────────────────────────
   4. Coordenadas
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Basecamp del equipo: el punto que ya aparece en el footer de la web
 * (43°28'05.2"N 1°33'28.1"W). Es el campamento de salida, no la ciudad
 * del equipo — el equipo es de Barcelona.
 */
export const BASECAMP: GeoPoint & { readonly dms: string; readonly label: string } = {
  // Decimales con precisión suficiente para que `formatDMS` devuelva `dms` exacto.
  lat: 43.468111,
  lon: -1.557806,
  dms: '43°28\'05.2"N 1°33\'28.1"W',
  label: "BASECAMP",
};

/**
 * Coordenadas decorativas del HUD del hero (32°03'12.5"N 1°01'45.8"W).
 * Punto en el desierto oriental marroquí; es ambientación, no un waypoint.
 */
export const HERO_COORDS: GeoPoint & { readonly dms: string } = {
  lat: 32.053472,
  lon: -1.029389,
  dms: '32°03\'12.5"N 1°01\'45.8"W',
};

/** Coordenadas del badge de cabecera de cada subpágina. */
export const PAGE_COORDS = {
  equipo: '31°16\'57.0"N 7°22\'52.0"W',
  patrocinio: '31°33\'06.5"N 5°35\'40.9"W',
  media: '31°07\'52.0"N 3°58\'58.8"W',
} as const;

/**
 * Formatea un punto decimal a grados/minutos/segundos, estilo roadbook.
 * `formatDMS({ lat: 31.6295, lon: -7.9811 })` → `31°37'46.2"N 7°58'51.9"W`
 */
export function formatDMS(point: GeoPoint): string {
  const toDMS = (value: number, positive: string, negative: string): string => {
    const hemisphere = value >= 0 ? positive : negative;
    const abs = Math.abs(value);
    // Se redondea a décimas de segundo ANTES de descomponer, para que no salga
    // nunca un "60.0" por arrastre de redondeo.
    const totalTenths = Math.round(abs * 36000);
    const degrees = Math.floor(totalTenths / 36000);
    const minutes = Math.floor((totalTenths % 36000) / 600);
    const seconds = ((totalTenths % 600) / 10).toFixed(1);
    return `${degrees}°${String(minutes).padStart(2, "0")}'${seconds.padStart(4, "0")}"${hemisphere}`;
  };
  return `${toDMS(point.lat, "N", "S")} ${toDMS(point.lon, "E", "W")}`;
}

/* ────────────────────────────────────────────────────────────────────────
   5. Metadatos del sitio
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Textos de `<title>`, descripción y OpenGraph.
 * La marca es BOAM RACING; UniRaid sólo aparece como el rally.
 */
export const SITE_META = {
  title: `${BRAND.name} — ${EDITION_SHORT_LABEL} · ${RALLY.descriptor}`,
  shortTitle: BRAND.name,
  description: `${BRAND.descriptor} de ${TEAM_SIZE} estudiantes de ${BRAND.city}. ${ROUTE_SUMMARY.totalDays} días y ${ROUTE_SUMMARY.totalStages} etapas cruzando Marruecos con material solidario en ${EDITION_LABEL}. Conviértete en patrocinador.`,
  ogTitle: `${BRAND.name} — ${EDITION_SHORT_LABEL}`,
  ogDescription: `${ROUTE_SUMMARY.totalDays} días. ${FLEET_SIZE} coches. Una misión. Rally solidario por Marruecos.`,
  locale: "es_ES",
  keywords: [
    BRAND.name,
    BRAND.display,
    RALLY.name,
    "rally solidario",
    "Marruecos",
    "patrocinio",
    BRAND.descriptor,
    "Ford Escort",
    EDITION_YEAR_LABEL,
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────────
   6. Navegación
   ──────────────────────────────────────────────────────────────────────── */

/** Navegación principal. `isRoute` distingue página de ancla. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Inicio", href: "/", isRoute: true },
  { label: "El Proyecto", href: "/#proyecto", isRoute: false },
  { label: "El Equipo", href: "/equipo", isRoute: true },
  { label: "Patrocinio", href: "/patrocinio", isRoute: true },
  { label: "Media", href: "/media", isRoute: true },
  { label: "Contacto", href: "/#contacto", isRoute: false },
];

/* ────────────────────────────────────────────────────────────────────────
   7. Cifras del proyecto — TODAS derivadas
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Contadores de la sección "El Proyecto".
 * Salen de `route.ts` y `team.ts`: si cambia una etapa, cambia el contador.
 * Nunca escribir estos números a mano.
 */
export const COUNTERS: readonly CounterItem[] = [
  { target: ROUTE_SUMMARY.totalDays, suffix: "", label: "Días de expedición" },
  { target: ROUTE_SUMMARY.totalStages, suffix: "", label: "Etapas" },
  { target: ROUTE_SUMMARY.moroccoKm, suffix: " km", label: "Kilómetros en Marruecos" },
  { target: FLEET_SIZE, suffix: "", label: "Coches del equipo" },
];

/** Cifras sueltas para badges y micro-copy. */
export const PROJECT_FACTS = {
  teamSize: TEAM_SIZE,
  crews: CREWS.length,
  fleetSize: FLEET_SIZE,
  days: ROUTE_SUMMARY.totalDays,
  stages: ROUTE_SUMMARY.totalStages,
  moroccoKm: ROUTE_SUMMARY.moroccoKm,
  oneWayKm: ROUTE_SUMMARY.oneWayKm,
} as const;

/* ────────────────────────────────────────────────────────────────────────
   8. Imágenes — sistema de placeholders (Módulo 6 de la spec)
   ──────────────────────────────────────────────────────────────────────── */

/*  ⚠  PROHIBIDO usar imágenes de stock (images.unsplash.com y similares).
    Cada hueco de foto es un `MediaPlaceholder` con un briefing de lo que
    tiene que ir ahí. Cuando el equipo suba su material, se rellena `src`
    con la ruta dentro de /public y el hueco deja de pintarse como técnico.

    ⓘ  CONVIVENCIA CON `src/lib/imagery.ts`:
       Existe además un módulo de archivo fotográfico más completo
       (`imagery.ts`: manifiesto por categorías, tags, progreso de archivo).
       ESE es el canónico para la galería y las secciones con mucha foto.
       Lo de aquí abajo es el mínimo para los huecos que consume
       directamente `constants.ts` (hero y ficha de coche) y para no dejar
       ninguna URL de stock viva. Si al integrar se decide unificar, lo
       correcto es quedarse con `imagery.ts` y borrar este bloque. */

/** Foto principal del hero. */
export const HERO_PLACEHOLDER: MediaPlaceholder = {
  id: "hero-main",
  brief:
    "Los cuatro Ford Escort en formación, contraluz de amanecer o atardecer, polvo en suspensión. Horizontal, mucho aire arriba para que respire el titular.",
  caption: `${BRAND.name} · ${getEditionLabel("es")}`,
  aspect: "wide",
  alt: `Los cuatro Ford Escort de ${BRAND.name} preparados para el rally`,
  src: null,
};

/** Foto de la ficha del coche. */
export const CAR_PLACEHOLDER: MediaPlaceholder = {
  id: "car-hero",
  brief:
    "Un Ford Escort del equipo en 3/4 delantero, con el cubrecárter y los faros auxiliares visibles. Fondo limpio, taller o descampado.",
  caption: "Ford Escort preparado para raid",
  aspect: "landscape",
  alt: "Ford Escort del equipo preparado para raid",
  src: null,
};

/** Huecos de la galería. Sustituir `src` conforme llegue el archivo fotográfico. */
export const MEDIA_PLACEHOLDERS: readonly MediaPlaceholder[] = [
  {
    id: "taller-mecanica",
    brief:
      "Plano medio de dos personas del equipo trabajando bajo el coche: suspensión o cubrecárter. Manos sucias, luz de taller.",
    caption: "Revisión de motor y suspensión",
    aspect: "landscape",
    alt: "Preparación mecánica de uno de los Ford Escort",
    src: null,
  },
  {
    id: "equipo-taller",
    brief:
      "Vertical del equipo al completo en el taller, apoyados en un coche. Sin poses de estudio.",
    caption: "La tripulación al completo",
    aspect: "portrait",
    alt: "El equipo de BOAM RACING en el taller",
    src: null,
  },
  {
    id: "test-offroad",
    brief:
      "Coche en movimiento sobre pista de tierra, rueda levantando polvo. Obturador rápido, el coche nítido.",
    caption: "Pruebas en terreno",
    aspect: "landscape",
    alt: "Test de conducción off-road",
    src: null,
  },
  {
    id: "carga-solidaria",
    brief:
      "Cenital del material solidario apilado antes de cargarlo: cajas, material escolar, ropa. Cuadrado.",
    caption: "Carga solidaria",
    aspect: "square",
    alt: "Material humanitario preparado para la expedición",
    src: null,
  },
  {
    id: "planificacion-ruta",
    brief:
      "Vertical de dos personas sobre un mapa de Marruecos con el roadbook y la brújula encima.",
    caption: "Estrategia de ruta",
    aspect: "portrait",
    alt: "Reunión de planificación de la ruta",
    src: null,
  },
  {
    id: "coche-desierto",
    brief:
      "Coche pequeño en el encuadre, duna enorme detrás. La escala es lo que cuenta la foto.",
    caption: "Listos para la aventura",
    aspect: "landscape",
    alt: "Ford Escort en paisaje desértico",
    src: null,
  },
];

/* ────────────────────────────────────────────────────────────────────────
   9. Comunicación
   ──────────────────────────────────────────────────────────────────────── */

/** Tarjetas de la sección de comunicación. */
export const COMMUNICATION_CARDS: readonly CommunicationCard[] = [
  {
    title: `${BRAND.name} arranca su aventura`,
    excerpt: `El equipo comienza los preparativos para el ${getRallyEditionLabel("es")}. ${ROUTE_SUMMARY.totalDays} días cruzando Marruecos con una misión solidaria.`,
    date: "Marzo 2026",
    tag: "Inicio",
  },
  {
    title: "Primeros patrocinadores confirmados",
    excerpt:
      "Empresas locales se suman al proyecto. Buscamos más aliados para hacer realidad esta expedición.",
    date: PENDING,
    tag: "Patrocinio",
  },
  {
    title: "Los Ford Escort toman forma",
    excerpt: `Avances en la preparación mecánica de los ${FLEET_SIZE} vehículos que cruzarán el desierto.`,
    date: PENDING,
    tag: "Coches",
  },
];

/* ────────────────────────────────────────────────────────────────────────
   10. Paleta — design system "Rally Desert Tactical"
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Tokens de color para uso desde JS (SVG inline, framer-motion, canvas).
 * Los mismos valores viven en `globals.css` como custom properties: si se
 * cambia uno, cambiarlo en los dos sitios.
 *
 * El tema claro anterior (#F7F4EB arena) queda eliminado por completo.
 */
export const COLORS = {
  /* Fondos */
  bgBase: "#0F1012",
  bgSurface: "#16181C",

  /* Acentos */
  amber: "#FF6B00", // Dakar Amber — acción primaria
  sandGold: "#D4A359", // Sand Gold — secundario
  lime: "#CCFF00", // High-Viz Lime — estado / alerta

  /* Estructura */
  slate: "#2A2E35", // bordes y separadores
  mutedSand: "#8C8275", // texto terciario

  /* Texto */
  textPrimary: "#F2EFE9",
  textSecondary: "#8C8275",
  textInverse: "#0F1012",
} as const;

/** Nombre de cada color, para la documentación del design system. */
export const COLOR_NAMES: Record<keyof typeof COLORS, string> = {
  bgBase: "Base",
  bgSurface: "Surface",
  amber: "Dakar Amber",
  sandGold: "Sand Gold",
  lime: "High-Viz Lime",
  slate: "Slate",
  mutedSand: "Muted Sand",
  textPrimary: "Text Primary",
  textSecondary: "Text Secondary",
  textInverse: "Text Inverse",
};

/* ────────────────────────────────────────────────────────────────────────
   11. Re-exports de conveniencia
   ──────────────────────────────────────────────────────────────────────── */

export { CREWS, TEAM_MEMBERS, FLEET_SIZE, TEAM_SIZE } from "./team";
export { ROUTE_STAGES, ROUTE_SUMMARY, ROUTE_WAYPOINTS, ROUTE_DISCLAIMER } from "./route";
export { SPONSOR_TIERS, SPONSOR_SLOTS } from "./sponsors";

export type {
  CommunicationCard,
  CounterItem,
  EditionLocale,
  GeoPoint,
  MediaPlaceholder,
  NavItem,
  SocialProfile,
};
