/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Patrocinio: tiers, matriz de inversión y huecos de vinilo
   --------------------------------------------------------------------------
   FUENTE DE VERDAD: el dossier de presentación del equipo, láminas
   "El Lienzo: Zonas de Patrocinio" y "Matriz de Patrocinio: Opciones de
   Inversión". Los precios, el número de plazas, los conceptos de la matriz y
   el reparto de bandas de visibilidad están transcritos TAL CUAL del dossier.
   No los cambies sin que el equipo actualice el dossier primero.

   Precios cerrados:   PRINCIPAL 1.500 € (1 plaza · exclusivo)
                       ORO         600 € (4 plazas)
                       PLATA       300 €
                       BRONCE      150 €

   Bandas de visibilidad del dossier → tier:
     · Visibilidad Máxima          (capó, ventanas, laterales principales) → PRINCIPAL
     · Visibilidad Alta            (frontal y laterales)                   → ORO
     · Visibilidad Media           (puertas traseras, alerón)              → PLATA
     · Visibilidad Complementaria  (paragolpes)                            → BRONCE

   ⚠  LO QUE SIGUE SIN CERRAR:
     El dossier no declara límite de plazas para PLATA ni BRONCE: van con
     `slots: null` en vez de con un número inventado.

   NOTA DE ACOPLAMIENTO: este fichero guarda `zoneId` como texto y NO importa
   nada de `src/lib/car/**`. Aquí vive sólo la parte comercial; la geometría
   de cada zona y las medidas reales del vinilo viven allí. Si allí se
   renombra un id, hay que actualizarlo también aquí — es el único punto de
   contacto entre ambos módulos, y `assertSlotZonesExist()` lo vigila.
   ══════════════════════════════════════════════════════════════════════════ */

import {
  type SponsorSlot,
  type SponsorTier,
  type SponsorTierId,
  type TierBenefitRow,
  type VisibilityBand,
} from "./types";

/* ────────────────────────────────────────────────────────────────────────
   1. Tiers — transcritos del dossier
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Los 4 niveles de patrocinio, del más alto al más bajo.
 *
 * `color` NO lleva un hex: lleva la referencia al token de tema
 * (`var(--tier-…)`). Ver el bloque "Color de los tiers" más abajo.
 */
export const SPONSOR_TIERS: readonly SponsorTier[] = [
  {
    id: "principal",
    label: "PRINCIPAL",
    rank: 1,
    priceEur: 1500,
    slots: 1,
    visibility: "maxima",
    headline: "Patrocinador principal · plaza única",
    benefits: [
      "Logo MUY GRANDE más vinilo trasero",
      "El equipo pasa a llamarse «[Empresa] Escort Team»",
      "Rediseño del logo del equipo incluyendo a la empresa",
      "Vídeo promocional presencial en la empresa",
      "Mención destacada en el dossier y el vídeo post-rally",
      "Top post en la galería de Instagram",
      "Capó, ventanas y laterales principales en exclusiva",
    ],
    color: "var(--tier-principal)", // lima en tactical · moss en desert
    highlight: true, // es la plaza estrella: una sola y exclusiva
  },
  {
    id: "oro",
    label: "ORO",
    rank: 2,
    priceEur: 600,
    slots: 4,
    visibility: "alta",
    headline: "Visibilidad alta · 4 plazas",
    benefits: [
      "2 logos en formato GRANDE",
      "Vídeo promocional presencial en la empresa",
      "Mención destacada en el dossier y el vídeo post-rally",
      "Post dedicado en la galería de Instagram",
      "Frontal y laterales del coche",
    ],
    color: "var(--tier-oro)", // ámbar Dakar · ámbar ocre en desert
    highlight: false,
  },
  {
    id: "plata",
    label: "PLATA",
    rank: 3,
    priceEur: 300,
    slots: null, // el dossier no declara límite
    visibility: "media",
    headline: "Visibilidad media",
    benefits: [
      "2 logos en formato MEDIANO",
      "Vídeo promocional individual en redes",
      "Logo incluido en el dossier y el vídeo post-rally",
      "Presencia en la galería de sponsors de Instagram",
      "Puertas traseras y alerón",
    ],
    color: "var(--tier-plata)", // sand gold · sand ocre en desert
    highlight: false,
  },
  {
    id: "bronce",
    label: "BRONCE",
    rank: 4,
    priceEur: 150,
    slots: null, // el dossier no declara límite
    visibility: "complementaria",
    headline: "Visibilidad complementaria",
    benefits: [
      "2 logos en formato PEQUEÑO",
      "Vídeo promocional grupal en redes",
      "Logo incluido en el dossier y el vídeo post-rally",
      "Agradecimientos en Instagram",
      "Paragolpes delantero y trasero",
    ],
    color: "var(--tier-bronce)", // arena apagada en los dos temas
    highlight: false,
  },
];

/** Acceso directo por id de tier. */
export const SPONSOR_TIERS_BY_ID: Record<SponsorTierId, SponsorTier> =
  SPONSOR_TIERS.reduce(
    (acc, tier) => {
      acc[tier.id] = tier;
      return acc;
    },
    {} as Record<SponsorTierId, SponsorTier>,
  );

/* ────────────────────────────────────────────────────────────────────────
   1 bis. Color de los tiers — NOMBRES de token, nunca valores
   ────────────────────────────────────────────────────────────────────────
   Aquí ya no hay un solo hex. Cada tier apunta a la custom property que
   `src/app/globals.css` define DOS veces, una por tema:

     token              desert (crema #F4EEE2)   tactical (oscuro #0F1012)
     --tier-principal   #5F6B33 moss             #CCFF00 lima
     --tier-oro         #BF5A1E ámbar ocre       #FF6B00 ámbar Dakar
     --tier-plata       #A67B38 sand ocre        #D4A359 sand gold
     --tier-bronce      #8A7F6B arena apagada    #8C8275 arena apagada

   Por qué: los hex de antes eran los del tema oscuro, y medidos sobre la
   crema del tema desert el lima daba 1.02:1 y el sand 1.98:1 — ilegibles.
   Llevando el nombre del token, el dato deja de decidir el color: lo decide
   el tema activo, y estos mapas valen igual en los dos.
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Color de cada tier. Es la IDENTIDAD del nivel: filos, cuadraditos de
 * leyenda, relleno de zona… todo lo que es superficie o marca gráfica.
 *
 * Ojo con el texto pequeño: sobre crema, `--tier-plata` se queda en 3.3:1 y
 * `--tier-bronce` en 3.4:1. Vale para un cuadrado de 10 px (basta 3:1), no
 * para una etiqueta de 11 px. Para texto, `TIER_TEXT_COLORS`.
 */
export const TIER_COLORS: Record<SponsorTierId, string> = {
  principal: "var(--tier-principal)",
  oro: "var(--tier-oro)",
  plata: "var(--tier-plata)",
  bronce: "var(--tier-bronce)",
};

/**
 * La misma identidad, pero en una tinta que se lee. Sólo para TEXTO (y para
 * el fondo de un botón con texto encima, que es el mismo problema al revés).
 *
 * Tres de los cuatro salen de tokens que YA existen y que en tactical valen
 * exactamente lo mismo que el color del tier — así que en el tema oscuro
 * esto no mueve un solo píxel, y en desert sube el contraste sobre crema:
 *
 *   principal → --tier-principal      moss 5.00:1  ·  lima intacto
 *   oro       → --color-amber-text    #A34B17 5.08:1 (era 3.87)  · #FF6B00 intacto
 *   bronce    → --color-text-tertiary #6F6555 4.95:1 (era 3.41)  · #8C8275 intacto
 *   plata     → --sponsor-ink-plata   4.8:1 (era 3.30) vía SPONSOR_PAINT_CSS
 *
 * PLATA es el único que no tiene token propio en el design system: no hay
 * `--tier-plata-text`. Se resuelve con una variable de este módulo
 * (`src/components/sponsor/sponsorPaint.ts`) y con el color del tier como
 * respaldo, de modo que sin esa hoja el comportamiento es el de hoy.
 */
export const TIER_TEXT_COLORS: Record<SponsorTierId, string> = {
  principal: "var(--tier-principal)",
  oro: "var(--color-amber-text)",
  plata: "var(--sponsor-ink-plata, var(--tier-plata))",
  bronce: "var(--color-text-tertiary)",
};

/** Triplete RGB de cada tier, separado por ESPACIO (sintaxis CSS moderna). */
const TIER_RGB_VARS: Record<SponsorTierId, string> = {
  principal: "var(--tier-principal-rgb)",
  oro: "var(--tier-oro-rgb)",
  plata: "var(--tier-plata-rgb)",
  bronce: "var(--tier-bronce-rgb)",
};

/**
 * Color del tier con alpha, compuesto sobre el fondo del tema activo.
 *
 * Se apoya en el triplete `--tier-*-rgb` en vez de en un `rgba()` con
 * números fijos: así el relleno de una zona del coche se recompone solo al
 * cambiar de tema en vez de arrastrar el naranja del oscuro sobre la crema.
 *
 * `alpha` admite un número (0–1) o cualquier expresión CSS válida en la
 * ranura de alpha — por ejemplo `calc(0.15 * var(--sponsor-alpha-boost, 1))`,
 * que es como el visor sube la dosis en el tema claro.
 */
export function tierAlpha(tier: SponsorTierId, alpha: number | string): string {
  return `rgb(${TIER_RGB_VARS[tier]} / ${alpha})`;
}

/** Etiqueta legible de cada banda de visibilidad, tal y como la nombra el dossier. */
export const VISIBILITY_LABELS: Record<VisibilityBand, string> = {
  maxima: "Visibilidad máxima",
  alta: "Visibilidad alta",
  media: "Visibilidad media",
  complementaria: "Visibilidad complementaria",
};

/** Qué zonas de la carrocería describe cada banda, según el dossier. */
export const VISIBILITY_AREAS: Record<VisibilityBand, string> = {
  maxima: "Capó, ventanas y laterales principales",
  alta: "Frontal y laterales",
  media: "Puertas traseras y alerón",
  complementaria: "Paragolpes",
};

/* ────────────────────────────────────────────────────────────────────────
   2. Matriz de inversión — la tabla del dossier, fila a fila
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Transcripción literal de la tabla "Matriz de Patrocinio: Opciones de
 * Inversión". `null` es el guion "-" del dossier: ese tier no lo incluye.
 * Se renderiza como tabla comparativa en la página de patrocinio.
 */
export const TIER_BENEFIT_MATRIX: readonly TierBenefitRow[] = [
  {
    concept: "Tamaño del logo",
    values: {
      principal: "Muy grande + vinilo trasero",
      oro: "2 grandes",
      plata: "2 medianos",
      bronce: "2 pequeños",
    },
  },
  {
    concept: "Nombre del equipo",
    values: {
      principal: "[Empresa] Escort Team",
      oro: null,
      plata: null,
      bronce: null,
    },
  },
  {
    concept: "Rediseño del logo del equipo",
    values: {
      principal: "Incluye a la empresa",
      oro: null,
      plata: null,
      bronce: null,
    },
  },
  {
    concept: "Vídeo promocional",
    values: {
      principal: "Presencial en empresa",
      oro: "Presencial en empresa",
      plata: "Individual (redes)",
      bronce: "Grupal (redes)",
    },
  },
  {
    concept: "Dossier y vídeo post-rally",
    values: {
      principal: "Mención destacada",
      oro: "Mención destacada",
      plata: "Logo incluido",
      bronce: "Logo incluido",
    },
  },
  {
    concept: "Galería de Instagram",
    values: {
      principal: "Top post",
      oro: "Post dedicado",
      plata: "Galería de sponsors",
      bronce: "Agradecimientos",
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────
   3. Huecos de vinilo sobre la carrocería
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Cada hueco referencia por `zoneId` la zona geométrica de `src/lib/car/**`.
 * El `id` del hueco lleva prefijo de vista porque los dos laterales comparten
 * los mismos ids de zona (son la misma geometría reflejada) pero se venden
 * por separado: li = lateral izquierdo, ld = lateral derecho.
 *
 * Ningún hueco está vendido todavía: todos `available`. Cuando entre un
 * patrocinador basta con pasar su hueco a `occupied` y rellenar `sponsor`.
 */
export const SPONSOR_SLOTS: readonly SponsorSlot[] = [
  /* ── Lateral izquierdo (flanco del piloto) ── */
  { id: "li-hood",        label: "Capó (lateral izq.)",        tier: "principal", status: "available", view: "lateral-izq", zoneId: "zone-hood-side", verified: false },
  { id: "li-front-door",  label: "Puerta delantera izq.",      tier: "principal", status: "available", view: "lateral-izq", zoneId: "zone-front-door", verified: false },
  { id: "li-roof-side",   label: "Techo (lateral izq.)",       tier: "principal", status: "available", view: "lateral-izq", zoneId: "zone-roof-side", verified: false },
  { id: "li-rear-window", label: "Pilona trasera izq.",       tier: "principal", status: "available", view: "lateral-izq", zoneId: "zone-rear-window-side", verified: false },
  { id: "li-front-wing",  label: "Aleta delantera izq.",       tier: "oro",       status: "available", view: "lateral-izq", zoneId: "zone-front-wing", verified: false },
  { id: "li-rear-quarter",label: "Aleta trasera izq.",         tier: "oro",       status: "available", view: "lateral-izq", zoneId: "zone-rear-quarter", verified: false },
  { id: "li-rear-door",   label: "Puerta trasera izq.",        tier: "plata",     status: "available", view: "lateral-izq", zoneId: "zone-rear-door", verified: false },
  { id: "li-rocker",      label: "Faldón izq.",                tier: "bronce",    status: "available", view: "lateral-izq", zoneId: "zone-rocker", verified: false },

  /* ── Lateral derecho (flanco del copiloto) ── */
  { id: "ld-hood",        label: "Capó (lateral der.)",        tier: "principal", status: "available", view: "lateral-der", zoneId: "zone-hood-side", verified: false },
  { id: "ld-front-door",  label: "Puerta delantera der.",      tier: "principal", status: "available", view: "lateral-der", zoneId: "zone-front-door", verified: false },
  { id: "ld-roof-side",   label: "Techo (lateral der.)",       tier: "principal", status: "available", view: "lateral-der", zoneId: "zone-roof-side", verified: false },
  { id: "ld-rear-window", label: "Pilona trasera der.",       tier: "principal", status: "available", view: "lateral-der", zoneId: "zone-rear-window-side", verified: false },
  { id: "ld-front-wing",  label: "Aleta delantera der.",       tier: "oro",       status: "available", view: "lateral-der", zoneId: "zone-front-wing", verified: false },
  { id: "ld-rear-quarter",label: "Aleta trasera der.",         tier: "oro",       status: "available", view: "lateral-der", zoneId: "zone-rear-quarter", verified: false },
  { id: "ld-rear-door",   label: "Puerta trasera der.",        tier: "plata",     status: "available", view: "lateral-der", zoneId: "zone-rear-door", verified: false },
  { id: "ld-rocker",      label: "Faldón der.",                tier: "bronce",    status: "available", view: "lateral-der", zoneId: "zone-rocker", verified: false },

  /* ── Frontal ── */
  { id: "fr-hood",        label: "Capó",                       tier: "principal", status: "available", view: "frontal",  zoneId: "zone-hood-front", verified: false },
  { id: "fr-windshield",  label: "Banda del parabrisas",       tier: "principal", status: "available", view: "frontal",  zoneId: "zone-windshield-top", verified: false },
  { id: "fr-grille",      label: "Paragolpes delantero",         tier: "oro",       status: "available", view: "frontal",  zoneId: "zone-grille", verified: false },

  /* ── Trasera ── */
  { id: "tr-rear-window", label: "Luneta · vinilo trasero",    tier: "principal", status: "available", view: "trasera",  zoneId: "zone-rear-window", verified: false },
  { id: "tr-bootlid",     label: "Portón",                     tier: "oro",       status: "available", view: "trasera",  zoneId: "zone-bootlid", verified: false },
  { id: "tr-spoiler",     label: "Alerón",                     tier: "plata",     status: "available", view: "trasera",  zoneId: "zone-spoiler", verified: false },
  { id: "tr-bumper",      label: "Paragolpes trasero",         tier: "bronce",    status: "available", view: "trasera",  zoneId: "zone-rear-bumper", verified: false },

  /* ── Cenital ── */
  { id: "ce-roof",        label: "Techo",                      tier: "principal", status: "available", view: "cenital",  zoneId: "zone-roof", verified: false },
  { id: "ce-hood",        label: "Capó (cenital)",             tier: "principal", status: "available", view: "cenital",  zoneId: "zone-hood-top", verified: false },
  { id: "ce-windshield",  label: "Banda del parabrisas",       tier: "principal", status: "available", view: "cenital",  zoneId: "zone-windshield-band", verified: false },
  { id: "ce-rear-window", label: "Luneta (cenital)",           tier: "principal", status: "available", view: "cenital",  zoneId: "zone-rear-window-top", verified: false },
  { id: "ce-bootlid",     label: "Portón (cenital)",           tier: "oro",       status: "available", view: "cenital",  zoneId: "zone-bootlid-top", verified: false },
];

/* ────────────────────────────────────────────────────────────────────────
   4. Helpers
   ──────────────────────────────────────────────────────────────────────── */

/** Devuelve un tier por id. */
export function getTier(id: SponsorTierId): SponsorTier {
  return SPONSOR_TIERS_BY_ID[id];
}

/** Devuelve un hueco por su id, o `undefined` si no existe. */
export function getSlot(id: string): SponsorSlot | undefined {
  return SPONSOR_SLOTS.find((slot) => slot.id === id);
}

/** Todos los huecos de una vista concreta de la carrocería. */
export function slotsForView(view: SponsorSlot["view"]): SponsorSlot[] {
  return SPONSOR_SLOTS.filter((slot) => slot.view === view);
}

/** Todos los huecos de un tier, en cualquier vista. */
export function slotsForTier(tier: SponsorTierId): SponsorSlot[] {
  return SPONSOR_SLOTS.filter((slot) => slot.tier === tier);
}

/** Huecos que siguen libres. */
export function availableSlots(): SponsorSlot[] {
  return SPONSOR_SLOTS.filter((slot) => slot.status === "available");
}

/**
 * Formatea el precio de un tier: "1.500 €", o "A consultar" si quedara
 * pendiente. Locale es-ES para que el separador de millares sea el punto.
 */
export function formatTierPrice(tier: SponsorTier): string {
  if (typeof tier.priceEur !== "number") return "A consultar";
  return `${tier.priceEur.toLocaleString("es-ES")} €`;
}

/**
 * Texto de disponibilidad de un tier: "1 plaza", "4 plazas" o "Plazas
 * limitadas" cuando el dossier no declara número.
 */
export function formatTierSlots(tier: SponsorTier): string {
  if (tier.slots === null) return "Plazas limitadas";
  return tier.slots === 1 ? "1 plaza" : `${tier.slots} plazas`;
}

/**
 * Comprueba que cada `zoneId` referenciado desde aquí existe de verdad en el
 * módulo de geometría. Llámalo desde el visor del coche en desarrollo: es el
 * guardarraíl del único acoplamiento por texto que tiene este fichero.
 */
export function assertSlotZonesExist(knownZoneIds: readonly string[]): string[] {
  const known = new Set(knownZoneIds);
  return SPONSOR_SLOTS.filter((slot) => !known.has(slot.zoneId)).map(
    (slot) => `${slot.id} → ${slot.zoneId}`,
  );
}
