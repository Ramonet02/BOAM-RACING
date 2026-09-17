/**
 * i18n · SPONSORS — the sponsorship configurator, the tier grid, the
 * investment matrix and the /patrocinio page.
 *
 * Owner: i18n. Consumer: `SponsorshipSection`, `app/patrocinio/page.tsx`.
 * Access from a component:
 *     const t = useT();
 *     t.sponsors.tierLabels[tier.id]        // "ORO" / "GOLD" / "OR"
 *     t.sponsors.slotStatus[slot.status]    // "Disponible" / "Ocupado"
 *     t.sponsors.zones[slot.zoneId]         // "Capó (lateral)" …
 *
 * This section used to be hardcoded in Spanish inside
 * `SponsorshipSection`, with invented tiers and invented prices.
 *
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  NO PRICES AND NO SLOT COUNTS LIVE IN THIS FILE — ON PURPOSE.     ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 * Rates, slot counts, tier ranks, colours and which body zone belongs to
 * which tier are commercial DATA and live in `src/lib/sponsors.ts`
 * (`SPONSOR_TIERS`, `SPONSOR_SLOTS`, `TIER_BENEFIT_MATRIX`,
 * `formatTierPrice`, `formatTierSlots`). The day the team changes its
 * rates, it changes them THERE and nothing here has to move.
 *
 * A tier card therefore renders like this:
 *
 *     const tier = SPONSOR_TIERS_BY_ID.oro;
 *     <h3>{t.sponsors.tierLabels[tier.id]}</h3>          // copy
 *     <p>{t.sponsors.tierHeadlines[tier.id]}</p>         // copy
 *     <strong>{formatTierPrice(tier)}</strong>           // data
 *     <span>{t.sponsors.availability.slots                // copy + data
 *              .replace("{n}", String(tier.slots))}</span>
 *
 * And the availability of a body zone:
 *
 *     <span>{t.sponsors.slotStatus[slot.status]}</span>
 *
 * BENEFIT BULLETS
 * ---------------
 * There is no `tierBenefits` key. The bullet list of a tier is the column
 * of that tier in the investment matrix: walk `TIER_BENEFIT_MATRIX`,
 * skip the rows whose value is `null` for that tier, and print
 * `t.sponsors.matrix.rows[key].values[tierId]`. One source, four cards.
 *
 * THE MATRIX
 * ----------
 * `matrix.order` lists the six row keys in the SAME order as
 * `TIER_BENEFIT_MATRIX`, so the table is rendered by zipping them:
 *
 *     TIER_BENEFIT_MATRIX.map((row, i) => {
 *       const copy = t.sponsors.matrix.rows[t.sponsors.matrix.order[i]];
 *       // row.values[tierId] === null → t.sponsors.matrix.notIncluded
 *     });
 *
 * `null` in a `values` map mirrors the dash of the dossier: that tier
 * does not include the concept. The authoritative dash is the one in
 * `TIER_BENEFIT_MATRIX`; these entries are only its localized rendering.
 *
 * ZONE NAMES
 * ----------
 * `zones` is a NAME TABLE keyed by the `zoneId` of `SPONSOR_SLOTS` — the
 * same ids the hand-drawn car geometry uses in `src/lib/car/**`. The
 * geometry (clip-paths, vinyl sizes) is never here; only the label. Both
 * flanks share zone ids because they are the same mirrored geometry, so
 * compose the side with `t.sponsors.sides.*`:
 *
 *     `${t.sponsors.zones[slot.zoneId]} (${t.sponsors.sides.left})`
 *
 * The five view tabs come from `t.common.carViews[view]`, keyed by the
 * `CarView` union ("lateral-izq" | "lateral-der" | "frontal" | "trasera"
 * | "cenital").
 */

import type { Lines, LocalizedSection, PageHero } from "./_shared";

/** Mirrors `SponsorTierId` in `src/lib/types.ts`. */
export type SponsorTierKey = "principal" | "oro" | "plata" | "bronce";

/** Mirrors `SponsorSlotStatus` in `src/lib/types.ts`. */
export type SponsorSlotStatusKey = "available" | "occupied";

/** Mirrors `VisibilityBand` in `src/lib/types.ts`. */
export type VisibilityKey = "maxima" | "alta" | "media" | "complementaria";

/** The six rows of the dossier's investment matrix, in dossier order. */
export type MatrixRowKey =
  | "logoSize"
  | "teamName"
  | "logoRedesign"
  | "promoVideo"
  | "postRally"
  | "instagram";

/**
 * Every `zoneId` referenced by `SPONSOR_SLOTS` in `src/lib/sponsors.ts`.
 * Adding a slot there with a new zone id breaks this build until the
 * label is added here — which is exactly what we want.
 */
export type SponsorZoneId =
  | "zone-hood-side"
  | "zone-front-door"
  | "zone-roof-side"
  | "zone-rear-window-side"
  | "zone-front-wing"
  | "zone-rear-quarter"
  | "zone-rear-door"
  | "zone-rocker"
  | "zone-hood-front"
  | "zone-windshield-top"
  | "zone-grille"
  | "zone-rear-window"
  | "zone-bootlid"
  | "zone-spoiler"
  | "zone-rear-bumper"
  | "zone-roof"
  | "zone-hood-top"
  | "zone-windshield-band"
  | "zone-rear-window-top"
  | "zone-bootlid-top";

/** One row of the investment matrix, translated. */
export interface MatrixRow {
  concept: string;
  /** `null` = the dossier prints a dash for that tier. */
  values: Readonly<Record<SponsorTierKey, string | null>>;
}

export interface SponsorBenefit {
  tag: string;
  title: string;
  desc: string;
}

export interface SponsorStep {
  num: string;
  title: string;
  desc: string;
}

export interface SponsorFaq {
  q: string;
  a: string;
}

/** Ids de `VINYL_COLORS` en `src/lib/sponsor/artwork.ts`. */
type VinylColorKey = "white" | "black" | "amber" | "red" | "blue" | "green" | "silver";
/** Ids de `ARTWORK_FONTS`. */
type ArtworkFontKey = "heading" | "body" | "mono";
/** Valores de `ARTWORK_WEIGHTS`, como claves numéricas. */
type ArtworkWeightKey = 400 | 700;
/** Motivos de rechazo de `importLogo()` en `src/lib/sponsor/importImage.ts`. */
type LogoUploadErrorKey = "too-large" | "not-an-image" | "decode-failed";

export interface SponsorsSection {
  waypoint: string;
  title: Lines;
  /** Uses the `{km}` token — the figure comes from `ROUTE_SUMMARY`. */
  intro: string;
  sideLabel: string;
  /** /patrocinio sub-page hero. Coordinates come from `PAGE_COORDS`. */
  pageHero: PageHero;

  /* ── Tiers ─────────────────────────────────────────────────────── */
  /** Tier names. NO price, NO slot count: those are data. */
  tierLabels: Readonly<Record<SponsorTierKey, string>>;
  /** One-line pitch per tier. */
  tierHeadlines: Readonly<Record<SponsorTierKey, string>>;
  /** Call to action printed on each tier card. */
  tierCta: Readonly<Record<SponsorTierKey, string>>;
  tiersTag: string;
  tiersTitle: Lines;
  tiersNote: string;
  featuredLabel: string;
  /** Availability copy. `{n}` is replaced with `tier.slots`. */
  availability: {
    label: string;
    slot: string;
    slots: string;
    unlimited: string;
    soldOut: string;
    exclusive: string;
  };
  /** Price chrome only — the amount itself comes from `formatTierPrice`. */
  price: {
    label: string;
    oneOff: string;
    vatNote: string;
    inKind: string;
  };

  /* ── Visibility bands and body zones ───────────────────────────── */
  visibility: Readonly<Record<VisibilityKey, { label: string; areas: string }>>;
  slotStatus: Readonly<Record<SponsorSlotStatusKey, string>>;
  zones: Readonly<Record<SponsorZoneId, string>>;
  sides: { left: string; right: string };

  /* ── Interactive configurator ──────────────────────────────────── */
  configurator: {
    title: Lines;
    hint: string;
    viewLabel: string;
    filterLabel: string;
    filterAll: string;
    filterAvailable: string;
    filterByTier: string;
    legendTitle: string;
    selectZone: string;
    /** Aviso de zona-puente: el capó y el techo desde el lateral llevan a la cenital. Token {view}. */
    zoneLinksTo: string;
    zoneTooltip: string;
    occupiedTooltip: string;
    realtime: string;
    brandLabel: string;
    brandPlaceholder: string;
    zonesLabel: string;
    zonesEmpty: string;
    clearAll: string;
    removeZone: string;
    summaryTitle: string;
    summaryTierLabel: string;
    summaryTotalLabel: string;
    submit: string;
    submitHint: string;
    resetView: string;
    strokeLabel: string;
  };

  /* ── Artwork studio ────────────────────────────────────────────────
     Opens when a free zone is clicked: it blows the zone up and lets the
     client drop their logo and their lettering on it.

     `colors`, `fonts` and `weights` are keyed by the CLOSED unions of
     `src/lib/sponsor/artwork.ts` (`VinylColorId`, `ArtworkFontId`,
     `ArtworkWeight`). Adding a vinyl colour there breaks the build here
     until the three languages name it — which is the point: a swatch with
     no name is a swatch a screen reader cannot announce. */
  studio: {
    done: string;
    addLogo: string;
    addText: string;
    /** Text a freshly added lettering item starts with. */
    defaultText: string;
    uploadErrors: Readonly<Record<LogoUploadErrorKey, string>>;
    /** Nombres de los colores de vinilo del TEXTO. El fondo no se elige:
        el coche va pintado de blanco (`CAR_PAINT_HEX`). */
    colors: Readonly<Record<VinylColorKey, string>>;
    itemsLabel: string;
    itemsEmpty: string;
    bringToFront: string;
    removeItem: string;
    propertiesLabel: string;
    textLabel: string;
    fontLabel: string;
    fonts: Readonly<Record<ArtworkFontKey, string>>;
    weights: Readonly<Record<ArtworkWeightKey, string>>;
    uppercase: string;
    trackingLabel: string;
    colorLabel: string;
    sizeLabel: string;
    rotationLabel: string;
    noSelection: string;
    canvasHint: string;
    zoneIncluded: string;
    zoneNotIncluded: string;
    removeZone: string;
    /** Badge on an already-lettered zone in the selection panel. */
    lettered: string;
    /** Button that reopens the studio for a zone already chosen. */
    edit: string;
  };

  /* ── Investment matrix ─────────────────────────────────────────── */
  matrix: {
    tag: string;
    title: Lines;
    intro: string;
    conceptHeader: string;
    tierHeader: string;
    priceHeader: string;
    slotsHeader: string;
    notIncluded: string;
    /** Row keys in the same order as `TIER_BENEFIT_MATRIX`. */
    order: readonly [
      MatrixRowKey,
      MatrixRowKey,
      MatrixRowKey,
      MatrixRowKey,
      MatrixRowKey,
      MatrixRowKey,
    ];
    rows: Readonly<Record<MatrixRowKey, MatrixRow>>;
    footnote: string;
  };

  /* ── Editorial blocks ──────────────────────────────────────────── */
  benefitsTag: string;
  benefits: readonly [
    SponsorBenefit,
    SponsorBenefit,
    SponsorBenefit,
    SponsorBenefit,
  ];
  process: {
    tag: string;
    title: string;
    steps: readonly [SponsorStep, SponsorStep, SponsorStep];
  };
  faqTag: string;
  faq: readonly [SponsorFaq, SponsorFaq, SponsorFaq, SponsorFaq];

  /* ── Contact modal ─────────────────────────────────────────────── */
  contactModal: {
    title: string;
    desc: string;
    nameLabel: string;
    namePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    tierLabel: string;
    tierPlaceholder: string;
    zonesLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    consent: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
    close: string;
    responseTime: string;
    /** Estado mientras se rasterizan las láminas del rotulado. */
    preparing: string;
    /** Aviso de adjuntos. Token `{n}`. */
    attachments: string;
    /**
     * Plan B: el servidor de correo no está configurado, así que las láminas
     * se descargan y el cliente las adjunta a mano.
     */
    fallback: string;
  };
  cta: {
    tag: string;
    title: Lines;
    desc: string;
    primary: string;
    secondary: string;
  };
  /** Labels only — the address itself is a constant, not copy. */
  contact: {
    emailLabel: string;
    phoneLabel: string;
    dossierLabel: string;
    responseTime: string;
    /** Call to action on the PDF link. */
    dossierCta: string;
    /**
     * Format and weight of the file. Tokens `{pages}` and `{size}` — both
     * come from `DOSSIER` in `src/lib/constants.ts`, never typed here: a
     * link to a PDF that does not say how heavy it is, is a link nobody
     * taps on mobile.
     */
    dossierMeta: string;
    /**
     * Language warning. The dossier exists ONLY in Spanish while the site
     * runs in three languages, so `en` and `ca` say so up front instead of
     * letting the visitor discover it after the download. Empty string in
     * `es`, where there is nothing to warn about.
     */
    dossierNote: string;
  };
}

export const sponsors: LocalizedSection<SponsorsSection> = {
  /* ═════════════════════════════ ES ═════════════════════════════ */
  es: {
    waypoint: "[ 06 ]  PATROCINIO",
    title: ["TU MARCA", "EN EL", "DESIERTO"],
    intro:
      "Cuatro Ford Escort son cuatro lienzos de chapa que van a cruzar {km} de Marruecos y a salir en cada foto del viaje. Elige dónde quieres estar y te preparamos la propuesta.",
    sideLabel: "06 — PATROCINIO",
    pageHero: {
      title: "PATROCINIO",
      subtitle: "Las puertas del desierto",
      location: "Gargantas del Todra",
    },

    tierLabels: {
      principal: "PRINCIPAL",
      oro: "ORO",
      plata: "PLATA",
      bronce: "BRONCE",
    },
    tierHeadlines: {
      principal:
        "El patrocinio de cabecera: el equipo lleva tu nombre y tú llevas el capó.",
      oro: "Visibilidad alta: frontal y laterales del coche, donde siempre apunta la cámara.",
      plata: "Visibilidad media: puertas traseras y alerón, presentes en todo el recorrido.",
      bronce: "Visibilidad complementaria: paragolpes, la primera chapa que pisa el desierto.",
    },
    tierCta: {
      principal: "Quiero el patrocinio principal",
      oro: "Quiero el nivel Oro",
      plata: "Quiero el nivel Plata",
      bronce: "Quiero el nivel Bronce",
    },
    tiersTag: "ELIGE TU NIVEL",
    tiersTitle: ["CUATRO FORMAS", "DE SUBIRTE", "AL COCHE"],
    tiersNote:
      "Cada aportación va íntegra a la preparación de los coches y al material solidario que se descarga en las escuelas.",
    featuredLabel: "Plaza estrella",
    availability: {
      label: "Disponibilidad",
      slot: "{n} plaza",
      slots: "{n} plazas",
      unlimited: "Plazas limitadas",
      soldOut: "Plazas agotadas",
      exclusive: "En exclusiva",
    },
    price: {
      label: "Aportación",
      oneOff: "pago único",
      vatNote: "IVA incluido · factura emitida por el equipo",
      inKind: "También aceptamos aportación en material o servicios",
    },

    visibility: {
      maxima: {
        label: "Visibilidad máxima",
        areas: "Capó, ventanas y laterales principales",
      },
      alta: { label: "Visibilidad alta", areas: "Frontal y laterales" },
      media: { label: "Visibilidad media", areas: "Puertas traseras y alerón" },
      complementaria: {
        label: "Visibilidad complementaria",
        areas: "Paragolpes",
      },
    },
    slotStatus: {
      available: "Disponible",
      occupied: "Ocupado",
    },
    zones: {
      "zone-hood-side": "Capó (lateral)",
      "zone-front-door": "Puerta delantera",
      "zone-roof-side": "Techo (lateral)",
      "zone-rear-window-side": "Pilona trasera",
      "zone-front-wing": "Aleta delantera",
      "zone-rear-quarter": "Aleta trasera",
      "zone-rear-door": "Puerta trasera",
      "zone-rocker": "Faldón lateral",
      "zone-hood-front": "Capó (frontal)",
      "zone-windshield-top": "Banda del parabrisas",
      "zone-grille": "Paragolpes delantero",
      "zone-rear-window": "Luneta · vinilo trasero",
      "zone-bootlid": "Portón",
      "zone-spoiler": "Alerón",
      "zone-rear-bumper": "Paragolpes trasero",
      "zone-roof": "Techo",
      "zone-hood-top": "Capó (cenital)",
      "zone-windshield-band": "Banda del parabrisas (cenital)",
      "zone-rear-window-top": "Luneta (cenital)",
      "zone-bootlid-top": "Portón (cenital)",
    },
    sides: { left: "lateral izq.", right: "lateral der." },

    configurator: {
      title: ["CONFIGURA TU", "PATROCINIO"],
      hint: "Haz clic en las zonas del coche para reservarlas.",
      viewLabel: "Vista",
      filterLabel: "Filtrar",
      filterAll: "Todas las zonas",
      filterAvailable: "Solo disponibles",
      filterByTier: "Por nivel",
      legendTitle: "Niveles",
      selectZone: "Selecciona una zona",
      zoneLinksTo: "se vende desde la vista {view} · pulsa para ir",
      zoneTooltip: "Zona libre · haz clic para añadirla",
      occupiedTooltip: "Esta zona ya tiene patrocinador",
      realtime: "Simulación en tiempo real",
      brandLabel: "Tu marca",
      brandPlaceholder: "NOMBRE DE TU EMPRESA",
      zonesLabel: "Zonas elegidas",
      zonesEmpty: "Aún no has elegido ninguna zona del coche.",
      clearAll: "Vaciar selección",
      removeZone: "Quitar esta zona",
      summaryTitle: "Resumen",
      summaryTierLabel: "Nivel",
      summaryTotalLabel: "Total estimado",
      submit: "Solicitar dossier",
      submitHint: "Elige al menos una zona para pedir el dossier.",
      resetView: "Volver a la vista inicial",
      strokeLabel: "Trazo",
    },

    studio: {
      done: "Listo",
      addLogo: "Subir logo",
      addText: "Añadir texto",
      defaultText: "TU MARCA",
      uploadErrors: {
        "too-large": "La imagen pesa más de 8 MB. Prueba con una versión más ligera.",
        "not-an-image": "Ese fichero no es una imagen.",
        "decode-failed": "No se ha podido abrir la imagen.",
      },
      colors: {
        white: "Blanco",
        black: "Negro",
        amber: "Ámbar",
        red: "Rojo",
        blue: "Azul",
        green: "Verde",
        silver: "Plata",
      },
      itemsLabel: "Elementos",
      itemsEmpty: "Sube tu logo o añade un texto para empezar.",
      bringToFront: "Traer al frente",
      removeItem: "Quitar elemento",
      propertiesLabel: "Ajustes",
      textLabel: "Texto",
      fontLabel: "Tipografía",
      fonts: {
        heading: "Técnica (Chakra Petch)",
        body: "Neutra (Inter)",
        mono: "Monoespaciada (JetBrains Mono)",
      },
      weights: {
        400: "Normal",
        700: "Negrita",
      },
      uppercase: "MAYÚS",
      trackingLabel: "Interletraje",
      colorLabel: "Color del vinilo",
      sizeLabel: "Tamaño",
      rotationLabel: "Giro",
      noSelection: "Elige un elemento del lienzo para ajustarlo.",
      canvasHint: "Arrastra para mover · flechas para afinar · Supr para borrar",
      zoneIncluded: "Zona incluida en tu solicitud",
      zoneNotIncluded: "Zona no incluida",
      removeZone: "Quitar la zona",
      lettered: "rotulada",
      edit: "Rotular",
    },

    matrix: {
      tag: "MATRIZ DE INVERSIÓN",
      title: ["QUÉ INCLUYE", "CADA NIVEL"],
      intro:
        "La tabla del dossier, tal cual. Compara de un vistazo lo que se lleva cada nivel de patrocinio.",
      conceptHeader: "Concepto",
      tierHeader: "Nivel",
      priceHeader: "Aportación",
      slotsHeader: "Plazas",
      notIncluded: "No incluido",
      order: [
        "logoSize",
        "teamName",
        "logoRedesign",
        "promoVideo",
        "postRally",
        "instagram",
      ],
      rows: {
        logoSize: {
          concept: "Tamaño del logo",
          values: {
            principal: "Muy grande + vinilo trasero",
            oro: "Dos logos en formato grande",
            plata: "Dos logos en formato mediano",
            bronce: "Dos logos en formato pequeño",
          },
        },
        teamName: {
          concept: "Nombre del equipo",
          values: {
            principal: "«[Empresa] Escort Team»",
            oro: null,
            plata: null,
            bronce: null,
          },
        },
        logoRedesign: {
          concept: "Rediseño del logo del equipo",
          values: {
            principal: "Incluye a la empresa",
            oro: null,
            plata: null,
            bronce: null,
          },
        },
        promoVideo: {
          concept: "Vídeo promocional",
          values: {
            principal: "Presencial en la empresa",
            oro: "Presencial en la empresa",
            plata: "Individual, en redes",
            bronce: "Grupal, en redes",
          },
        },
        postRally: {
          concept: "Dossier y vídeo post-rally",
          values: {
            principal: "Mención destacada",
            oro: "Mención destacada",
            plata: "Logo incluido",
            bronce: "Logo incluido",
          },
        },
        instagram: {
          concept: "Galería de Instagram",
          values: {
            principal: "Top post",
            oro: "Post dedicado",
            plata: "Galería de sponsors",
            bronce: "Agradecimientos",
          },
        },
      },
      footnote:
        "Cualquier combinación fuera de la tabla se habla: aceptamos material, servicios y acuerdos a medida.",
    },

    benefitsTag: "POR QUÉ NOSOTROS",
    benefits: [
      {
        tag: "ALCANCE",
        title: "Exposición en movimiento",
        desc: "Tu marca cruza dos países y un desierto pegada a la chapa, y sale en cada parada del camino.",
      },
      {
        tag: "CONTENIDO",
        title: "Material audiovisual",
        desc: "Fotos y vídeo del rally listos para tus redes, sin coste extra ni letra pequeña.",
      },
      {
        tag: "PROPÓSITO",
        title: "Impacto real",
        desc: "Cada coche entra en Marruecos cargado de material escolar y sanitario que se entrega en mano.",
      },
      {
        tag: "CERCANÍA",
        title: "Trato directo",
        desc: "Hablas con el equipo, no con una agencia. Respondemos en menos de 48 horas.",
      },
    ],
    process: {
      tag: "CÓMO FUNCIONA",
      title: "Tres pasos y estás en el coche",
      steps: [
        {
          num: "01",
          title: "Elige tus zonas",
          desc: "Marca en el configurador dónde quieres ver tu logo y con qué nivel.",
        },
        {
          num: "02",
          title: "Recibe el dossier",
          desc: "Te enviamos la propuesta con medidas de vinilo, aportación y plazos.",
        },
        {
          num: "03",
          title: "Firmamos y rotulamos",
          desc: "Rotulamos el coche y te mandamos las fotos antes de salir hacia Tarifa.",
        },
      ],
    },
    faqTag: "PREGUNTAS FRECUENTES",
    faq: [
      {
        q: "¿Cuándo salís?",
        a: "En la edición de {editionInline}. Los coches se rotulan varias semanas antes, así que cuanto antes cerremos el acuerdo, más visibilidad ganas.",
      },
      {
        q: "¿Y si no llegáis a Marrakech?",
        a: "El rally se corre entero aunque un coche se quede por el camino: el convoy sigue y tu marca también. En cualquier caso te contamos siempre qué ha pasado.",
      },
      {
        q: "¿Puedo aportar material en vez de dinero?",
        a: "Sí. Recambios, neumáticos, herramienta, material escolar o sanitario: todo suma y lo valoramos contigo antes de asignarte nivel.",
      },
      {
        q: "¿Cómo se justifica la aportación?",
        a: "Emitimos factura y te enviamos un informe con las fotos del coche rotulado y del material entregado en Marruecos.",
      },
    ],

    contactModal: {
      title: "Solicitar el dossier",
      desc: "Cuéntanos quién eres y qué zonas te interesan. Te contestamos con la propuesta cerrada.",
      nameLabel: "Nombre y apellidos",
      namePlaceholder: "Quién nos escribe",
      companyLabel: "Empresa",
      companyPlaceholder: "Nombre de la empresa",
      emailLabel: "Email",
      emailPlaceholder: "tu@empresa.com",
      phoneLabel: "Teléfono",
      phonePlaceholder: "Opcional, por si es más rápido",
      tierLabel: "Nivel de interés",
      tierPlaceholder: "Aún no lo tengo claro",
      zonesLabel: "Zonas seleccionadas",
      messageLabel: "Mensaje",
      messagePlaceholder: "Qué te gustaría conseguir con este patrocinio",
      consent:
        "Acepto que BOAM RACING use estos datos para responderme. Nada más, y nada de terceros.",
      submit: "Enviar solicitud",
      sending: "Enviando…",
      success: "Recibido. Te escribimos en menos de 48 horas.",
      error: "No hemos podido enviarlo. Inténtalo otra vez o escríbenos directamente.",
      close: "Cerrar",
      responseTime: "Respuesta en menos de 48 h",
      preparing: "Generando las láminas de tu rotulación…",
      attachments: "Se adjuntan {n} lámina(s) con tu rotulación sobre el coche.",
      fallback: "No hemos podido enviarlo automáticamente. Hemos descargado las láminas y abierto tu correo con la solicitud ya escrita: adjúntalas antes de enviarla.",
    },
    cta: {
      tag: "[ PATROCINIO ]",
      title: ["PONLE TU", "NOMBRE A", "ESTE VIAJE"],
      desc: "Cuéntanos quién eres y qué te gustaría conseguir. Te preparamos una propuesta a medida en 48 horas.",
      primary: "Solicitar el dossier",
      secondary: "Escríbenos",
    },
    contact: {
      emailLabel: "Email",
      phoneLabel: "Teléfono",
      dossierLabel: "Dossier de patrocinio",
      responseTime: "Respuesta en menos de 48 h",
      dossierCta: "Descargar el dossier",
      dossierMeta: "PDF · {pages} páginas · {size} MB",
      dossierNote: "",
    },
  },

  /* ═════════════════════════════ EN ═════════════════════════════ */
  en: {
    waypoint: "[ 06 ]  SPONSORSHIP",
    title: ["YOUR BRAND", "IN THE", "DESERT"],
    intro:
      "Four Ford Escorts are four sheet-metal canvases about to cross {km} of Morocco and land in every photo of the trip. Pick where you want to be and we'll put the proposal together.",
    sideLabel: "06 — SPONSORSHIP",
    pageHero: {
      title: "SPONSORSHIP",
      subtitle: "The gates of the desert",
      location: "Todra Gorge",
    },

    tierLabels: {
      principal: "MAIN",
      oro: "GOLD",
      plata: "SILVER",
      bronce: "BRONZE",
    },
    tierHeadlines: {
      principal:
        "Title sponsorship: the team carries your name and you carry the bonnet.",
      oro: "High visibility: the front and the flanks, where the camera always points.",
      plata: "Medium visibility: rear doors and spoiler, in shot the whole way.",
      bronce:
        "Supporting visibility: bumpers, the first panels the desert ever touches.",
    },
    tierCta: {
      principal: "I want the title sponsorship",
      oro: "I want the Gold level",
      plata: "I want the Silver level",
      bronce: "I want the Bronze level",
    },
    tiersTag: "PICK YOUR LEVEL",
    tiersTitle: ["FOUR WAYS", "TO GET ON", "THE CAR"],
    tiersNote:
      "Every contribution goes straight into building the cars and into the aid cargo unloaded at the schools.",
    featuredLabel: "Flagship slot",
    availability: {
      label: "Availability",
      slot: "{n} slot",
      slots: "{n} slots",
      unlimited: "Limited slots",
      soldOut: "Sold out",
      exclusive: "Exclusive",
    },
    price: {
      label: "Contribution",
      oneOff: "one-off payment",
      vatNote: "VAT included · invoiced by the team",
      inKind: "We also accept goods or services instead of cash",
    },

    visibility: {
      maxima: {
        label: "Maximum visibility",
        areas: "Bonnet, windows and main flanks",
      },
      alta: { label: "High visibility", areas: "Front and flanks" },
      media: { label: "Medium visibility", areas: "Rear doors and spoiler" },
      complementaria: { label: "Supporting visibility", areas: "Bumpers" },
    },
    slotStatus: {
      available: "Available",
      occupied: "Taken",
    },
    zones: {
      "zone-hood-side": "Bonnet (side)",
      "zone-front-door": "Front door",
      "zone-roof-side": "Roof (side)",
      "zone-rear-window-side": "Rear pillar",
      "zone-front-wing": "Front wing",
      "zone-rear-quarter": "Rear quarter",
      "zone-rear-door": "Rear door",
      "zone-rocker": "Side skirt",
      "zone-hood-front": "Bonnet (front)",
      "zone-windshield-top": "Windscreen band",
      "zone-grille": "Front bumper",
      "zone-rear-window": "Rear screen · full vinyl",
      "zone-bootlid": "Boot lid",
      "zone-spoiler": "Spoiler",
      "zone-rear-bumper": "Rear bumper",
      "zone-roof": "Roof",
      "zone-hood-top": "Bonnet (top-down)",
      "zone-windshield-band": "Windscreen band (top-down)",
      "zone-rear-window-top": "Rear screen (top-down)",
      "zone-bootlid-top": "Boot lid (top-down)",
    },
    sides: { left: "driver side", right: "co-driver side" },

    configurator: {
      title: ["BUILD YOUR", "SPONSORSHIP"],
      hint: "Click the zones on the car to reserve them.",
      viewLabel: "View",
      filterLabel: "Filter",
      filterAll: "All zones",
      filterAvailable: "Available only",
      filterByTier: "By level",
      legendTitle: "Levels",
      selectZone: "Select a zone",
      zoneLinksTo: "sold from the {view} view · press to go there",
      zoneTooltip: "Free zone · click to add it",
      occupiedTooltip: "This zone already has a sponsor",
      realtime: "Real-time simulation",
      brandLabel: "Your brand",
      brandPlaceholder: "YOUR COMPANY NAME",
      zonesLabel: "Selected zones",
      zonesEmpty: "You haven't picked any zone of the car yet.",
      clearAll: "Clear selection",
      removeZone: "Remove this zone",
      summaryTitle: "Summary",
      summaryTierLabel: "Level",
      summaryTotalLabel: "Estimated total",
      submit: "Request the dossier",
      submitHint: "Pick at least one zone to request the dossier.",
      resetView: "Back to the default view",
      strokeLabel: "Stroke",
    },

    studio: {
      done: "Done",
      addLogo: "Upload logo",
      addText: "Add text",
      defaultText: "YOUR BRAND",
      uploadErrors: {
        "too-large": "That image is over 8 MB. Try a lighter version.",
        "not-an-image": "That file is not an image.",
        "decode-failed": "The image could not be opened.",
      },
      colors: {
        white: "White",
        black: "Black",
        amber: "Amber",
        red: "Red",
        blue: "Blue",
        green: "Green",
        silver: "Silver",
      },
      itemsLabel: "Elements",
      itemsEmpty: "Upload your logo or add some text to start.",
      bringToFront: "Bring to front",
      removeItem: "Remove element",
      propertiesLabel: "Settings",
      textLabel: "Text",
      fontLabel: "Typeface",
      fonts: {
        heading: "Technical (Chakra Petch)",
        body: "Neutral (Inter)",
        mono: "Monospaced (JetBrains Mono)",
      },
      weights: {
        400: "Regular",
        700: "Bold",
      },
      uppercase: "CAPS",
      trackingLabel: "Letter spacing",
      colorLabel: "Vinyl colour",
      sizeLabel: "Size",
      rotationLabel: "Rotation",
      noSelection: "Pick an element on the canvas to adjust it.",
      canvasHint: "Drag to move · arrows to nudge · Del to remove",
      zoneIncluded: "Zone included in your request",
      zoneNotIncluded: "Zone not included",
      removeZone: "Remove the zone",
      lettered: "lettered",
      edit: "Letter it",
    },

    matrix: {
      tag: "INVESTMENT MATRIX",
      title: ["WHAT EACH", "LEVEL INCLUDES"],
      intro:
        "The dossier table, as it stands. Compare at a glance what every sponsorship level gets.",
      conceptHeader: "Item",
      tierHeader: "Level",
      priceHeader: "Contribution",
      slotsHeader: "Slots",
      notIncluded: "Not included",
      order: [
        "logoSize",
        "teamName",
        "logoRedesign",
        "promoVideo",
        "postRally",
        "instagram",
      ],
      rows: {
        logoSize: {
          concept: "Logo size",
          values: {
            principal: "Extra large + rear screen vinyl",
            oro: "Two large logos",
            plata: "Two medium logos",
            bronce: "Two small logos",
          },
        },
        teamName: {
          concept: "Team name",
          values: {
            principal: "“[Company] Escort Team”",
            oro: null,
            plata: null,
            bronce: null,
          },
        },
        logoRedesign: {
          concept: "Team logo redesign",
          values: {
            principal: "Built around your company",
            oro: null,
            plata: null,
            bronce: null,
          },
        },
        promoVideo: {
          concept: "Promotional video",
          values: {
            principal: "Filmed at your offices",
            oro: "Filmed at your offices",
            plata: "Individual, on social",
            bronce: "Group, on social",
          },
        },
        postRally: {
          concept: "Dossier and post-rally video",
          values: {
            principal: "Featured mention",
            oro: "Featured mention",
            plata: "Logo included",
            bronce: "Logo included",
          },
        },
        instagram: {
          concept: "Instagram gallery",
          values: {
            principal: "Top post",
            oro: "Dedicated post",
            plata: "Sponsor gallery",
            bronce: "Thank-you post",
          },
        },
      },
      footnote:
        "Anything outside the table is open to discussion: we take goods, services and tailored deals.",
    },

    benefitsTag: "WHY US",
    benefits: [
      {
        tag: "REACH",
        title: "Exposure on the move",
        desc: "Your brand crosses two countries and a desert bolted to the bodywork, and shows up at every stop.",
      },
      {
        tag: "CONTENT",
        title: "Footage you can use",
        desc: "Photos and video from the rally, ready for your channels, at no extra cost and no small print.",
      },
      {
        tag: "PURPOSE",
        title: "Real impact",
        desc: "Every car enters Morocco loaded with school and medical supplies, handed over in person.",
      },
      {
        tag: "DIRECT",
        title: "You talk to us",
        desc: "No agency in between. We reply in under 48 hours.",
      },
    ],
    process: {
      tag: "HOW IT WORKS",
      title: "Three steps and you're on the car",
      steps: [
        {
          num: "01",
          title: "Pick your zones",
          desc: "Mark where you want your logo in the configurator, and at which level.",
        },
        {
          num: "02",
          title: "Get the dossier",
          desc: "We send the proposal with vinyl sizes, contribution and deadlines.",
        },
        {
          num: "03",
          title: "Sign and wrap",
          desc: "We apply the livery and send you the photos before we set off for Tarifa.",
        },
      ],
    },
    faqTag: "FREQUENT QUESTIONS",
    faq: [
      {
        q: "When do you leave?",
        a: "The {editionInline} edition. The cars are wrapped several weeks earlier, so the sooner we close the deal, the more visibility you get.",
      },
      {
        q: "What if you don't make it to Marrakech?",
        a: "The rally runs to the end even if one car drops out: the convoy keeps going and so does your brand. Either way, we always tell you exactly what happened.",
      },
      {
        q: "Can I contribute goods instead of money?",
        a: "Absolutely. Spares, tyres, tools, school or medical supplies — it all counts, and we value it with you before assigning a level.",
      },
      {
        q: "How is the contribution documented?",
        a: "We issue an invoice and send you a report with photos of the liveried car and of the supplies delivered in Morocco.",
      },
    ],

    contactModal: {
      title: "Request the dossier",
      desc: "Tell us who you are and which zones interest you. We'll come back with a firm proposal.",
      nameLabel: "Full name",
      namePlaceholder: "Who's writing",
      companyLabel: "Company",
      companyPlaceholder: "Company name",
      emailLabel: "Email",
      emailPlaceholder: "you@company.com",
      phoneLabel: "Phone",
      phonePlaceholder: "Optional, if it's quicker",
      tierLabel: "Level of interest",
      tierPlaceholder: "Not sure yet",
      zonesLabel: "Selected zones",
      messageLabel: "Message",
      messagePlaceholder: "What you'd like to get out of this sponsorship",
      consent:
        "I agree that BOAM RACING may use these details to reply to me. Nothing else, and nothing shared with third parties.",
      submit: "Send request",
      sending: "Sending…",
      success: "Got it. We'll write back within 48 hours.",
      error: "We couldn't send it. Try again or email us directly.",
      close: "Close",
      responseTime: "Reply within 48 h",
      preparing: "Rendering your artwork plates…",
      attachments: "{n} plate(s) with your artwork on the car are attached.",
      fallback: "We could not send it automatically. We have downloaded the plates and opened your mail client with the request already written: attach them before sending it.",
    },
    cta: {
      tag: "[ SPONSORSHIP ]",
      title: ["PUT YOUR", "NAME ON", "THIS TRIP"],
      desc: "Tell us who you are and what you'd like to get out of it. We'll build a tailored proposal within 48 hours.",
      primary: "Request the dossier",
      secondary: "Email us",
    },
    contact: {
      emailLabel: "Email",
      phoneLabel: "Phone",
      dossierLabel: "Sponsorship dossier",
      responseTime: "Reply within 48 h",
      dossierCta: "Download the dossier",
      dossierMeta: "PDF · {pages} pages · {size} MB",
      dossierNote: "in Spanish",
    },
  },

  /* ═════════════════════════════ CA ═════════════════════════════ */
  ca: {
    waypoint: "[ 06 ]  PATROCINI",
    title: ["LA TEVA MARCA", "AL", "DESERT"],
    intro:
      "Quatre Ford Escort són quatre llenços de xapa que travessaran {km} de Marroc i sortiran a totes les fotos del viatge. Tria on vols ser i et preparem la proposta.",
    sideLabel: "06 — PATROCINI",
    pageHero: {
      title: "PATROCINI",
      subtitle: "Les portes del desert",
      location: "Gorges del Todra",
    },

    tierLabels: {
      principal: "PRINCIPAL",
      oro: "OR",
      plata: "PLATA",
      bronce: "BRONZE",
    },
    tierHeadlines: {
      principal:
        "El patrocini de capçalera: l'equip porta el teu nom i tu portes el capó.",
      oro: "Visibilitat alta: frontal i laterals del cotxe, on sempre apunta la càmera.",
      plata: "Visibilitat mitjana: portes posteriors i aleró, presents a tot el recorregut.",
      bronce:
        "Visibilitat complementària: para-xocs, la primera xapa que trepitja el desert.",
    },
    tierCta: {
      principal: "Vull el patrocini principal",
      oro: "Vull el nivell Or",
      plata: "Vull el nivell Plata",
      bronce: "Vull el nivell Bronze",
    },
    tiersTag: "TRIA EL TEU NIVELL",
    tiersTitle: ["QUATRE MANERES", "DE PUJAR", "AL COTXE"],
    tiersNote:
      "Cada aportació va íntegrament a la preparació dels cotxes i al material solidari que es descarrega a les escoles.",
    featuredLabel: "Plaça estrella",
    availability: {
      label: "Disponibilitat",
      slot: "{n} plaça",
      slots: "{n} places",
      unlimited: "Places limitades",
      soldOut: "Places exhaurides",
      exclusive: "En exclusiva",
    },
    price: {
      label: "Aportació",
      oneOff: "pagament únic",
      vatNote: "IVA inclòs · factura emesa per l'equip",
      inKind: "També acceptem aportació en material o serveis",
    },

    visibility: {
      maxima: {
        label: "Visibilitat màxima",
        areas: "Capó, finestres i laterals principals",
      },
      alta: { label: "Visibilitat alta", areas: "Frontal i laterals" },
      media: {
        label: "Visibilitat mitjana",
        areas: "Portes posteriors i aleró",
      },
      complementaria: {
        label: "Visibilitat complementària",
        areas: "Para-xocs",
      },
    },
    slotStatus: {
      available: "Disponible",
      occupied: "Ocupat",
    },
    zones: {
      "zone-hood-side": "Capó (lateral)",
      "zone-front-door": "Porta davantera",
      "zone-roof-side": "Sostre (lateral)",
      "zone-rear-window-side": "Pilona posterior",
      "zone-front-wing": "Aleta davantera",
      "zone-rear-quarter": "Aleta posterior",
      "zone-rear-door": "Porta posterior",
      "zone-rocker": "Faldó lateral",
      "zone-hood-front": "Capó (frontal)",
      "zone-windshield-top": "Banda del parabrisa",
      "zone-grille": "Para-xocs davanter",
      "zone-rear-window": "Lluneta · vinil posterior",
      "zone-bootlid": "Portó",
      "zone-spoiler": "Aleró",
      "zone-rear-bumper": "Para-xocs posterior",
      "zone-roof": "Sostre",
      "zone-hood-top": "Capó (cenital)",
      "zone-windshield-band": "Banda del parabrisa (cenital)",
      "zone-rear-window-top": "Lluneta (cenital)",
      "zone-bootlid-top": "Portó (cenital)",
    },
    sides: { left: "lateral esq.", right: "lateral dret" },

    configurator: {
      title: ["CONFIGURA EL TEU", "PATROCINI"],
      hint: "Fes clic a les zones del cotxe per reservar-les.",
      viewLabel: "Vista",
      filterLabel: "Filtrar",
      filterAll: "Totes les zones",
      filterAvailable: "Només disponibles",
      filterByTier: "Per nivell",
      legendTitle: "Nivells",
      selectZone: "Tria una zona",
      zoneLinksTo: "es ven des de la vista {view} · prem per anar-hi",
      zoneTooltip: "Zona lliure · fes clic per afegir-la",
      occupiedTooltip: "Aquesta zona ja té patrocinador",
      realtime: "Simulació en temps real",
      brandLabel: "La teva marca",
      brandPlaceholder: "NOM DE LA TEVA EMPRESA",
      zonesLabel: "Zones triades",
      zonesEmpty: "Encara no has triat cap zona del cotxe.",
      clearAll: "Buidar la selecció",
      removeZone: "Treure aquesta zona",
      summaryTitle: "Resum",
      summaryTierLabel: "Nivell",
      summaryTotalLabel: "Total estimat",
      submit: "Sol·licitar el dossier",
      submitHint: "Tria com a mínim una zona per demanar el dossier.",
      resetView: "Tornar a la vista inicial",
      strokeLabel: "Traç",
    },

    studio: {
      done: "Fet",
      addLogo: "Pujar logo",
      addText: "Afegir text",
      defaultText: "LA TEVA MARCA",
      uploadErrors: {
        "too-large": "La imatge pesa més de 8 MB. Prova amb una versió més lleugera.",
        "not-an-image": "Aquest fitxer no és una imatge.",
        "decode-failed": "No s'ha pogut obrir la imatge.",
      },
      colors: {
        white: "Blanc",
        black: "Negre",
        amber: "Ambre",
        red: "Vermell",
        blue: "Blau",
        green: "Verd",
        silver: "Plata",
      },
      itemsLabel: "Elements",
      itemsEmpty: "Puja el teu logo o afegeix un text per començar.",
      bringToFront: "Portar al davant",
      removeItem: "Treure element",
      propertiesLabel: "Ajustos",
      textLabel: "Text",
      fontLabel: "Tipografia",
      fonts: {
        heading: "Tècnica (Chakra Petch)",
        body: "Neutra (Inter)",
        mono: "Monoespaiada (JetBrains Mono)",
      },
      weights: {
        400: "Normal",
        700: "Negreta",
      },
      uppercase: "MAJÚS",
      trackingLabel: "Interlletratge",
      colorLabel: "Color del vinil",
      sizeLabel: "Mida",
      rotationLabel: "Gir",
      noSelection: "Tria un element del llenç per ajustar-lo.",
      canvasHint: "Arrossega per moure · fletxes per afinar · Supr per esborrar",
      zoneIncluded: "Zona inclosa a la teva sol·licitud",
      zoneNotIncluded: "Zona no inclosa",
      removeZone: "Treure la zona",
      lettered: "retolada",
      edit: "Retolar",
    },

    matrix: {
      tag: "MATRIU D'INVERSIÓ",
      title: ["QUÈ INCLOU", "CADA NIVELL"],
      intro:
        "La taula del dossier, tal qual. Compara d'un cop d'ull què s'emporta cada nivell de patrocini.",
      conceptHeader: "Concepte",
      tierHeader: "Nivell",
      priceHeader: "Aportació",
      slotsHeader: "Places",
      notIncluded: "No inclòs",
      order: [
        "logoSize",
        "teamName",
        "logoRedesign",
        "promoVideo",
        "postRally",
        "instagram",
      ],
      rows: {
        logoSize: {
          concept: "Mida del logo",
          values: {
            principal: "Molt gran + vinil posterior",
            oro: "Dos logos en format gran",
            plata: "Dos logos en format mitjà",
            bronce: "Dos logos en format petit",
          },
        },
        teamName: {
          concept: "Nom de l'equip",
          values: {
            principal: "«[Empresa] Escort Team»",
            oro: null,
            plata: null,
            bronce: null,
          },
        },
        logoRedesign: {
          concept: "Redisseny del logo de l'equip",
          values: {
            principal: "Hi inclou l'empresa",
            oro: null,
            plata: null,
            bronce: null,
          },
        },
        promoVideo: {
          concept: "Vídeo promocional",
          values: {
            principal: "Presencial a l'empresa",
            oro: "Presencial a l'empresa",
            plata: "Individual, a les xarxes",
            bronce: "Grupal, a les xarxes",
          },
        },
        postRally: {
          concept: "Dossier i vídeo post-rally",
          values: {
            principal: "Menció destacada",
            oro: "Menció destacada",
            plata: "Logo inclòs",
            bronce: "Logo inclòs",
          },
        },
        instagram: {
          concept: "Galeria d'Instagram",
          values: {
            principal: "Top post",
            oro: "Post dedicat",
            plata: "Galeria de sponsors",
            bronce: "Agraïments",
          },
        },
      },
      footnote:
        "Qualsevol combinació fora de la taula es parla: acceptem material, serveis i acords a mida.",
    },

    benefitsTag: "PER QUÈ NOSALTRES",
    benefits: [
      {
        tag: "ABAST",
        title: "Exposició en moviment",
        desc: "La teva marca creua dos països i un desert enganxada a la xapa, i surt a cada parada del camí.",
      },
      {
        tag: "CONTINGUT",
        title: "Material audiovisual",
        desc: "Fotos i vídeo del rally a punt per a les teves xarxes, sense cost extra ni lletra petita.",
      },
      {
        tag: "PROPÒSIT",
        title: "Impacte real",
        desc: "Cada cotxe entra al Marroc carregat de material escolar i sanitari que s'entrega en mà.",
      },
      {
        tag: "PROXIMITAT",
        title: "Tracte directe",
        desc: "Parles amb l'equip, no amb una agència. Responem en menys de 48 hores.",
      },
    ],
    process: {
      tag: "COM FUNCIONA",
      title: "Tres passos i ja ets al cotxe",
      steps: [
        {
          num: "01",
          title: "Tria les teves zones",
          desc: "Marca al configurador on vols veure el teu logo i amb quin nivell.",
        },
        {
          num: "02",
          title: "Rep el dossier",
          desc: "T'enviem la proposta amb mides de vinil, aportació i terminis.",
        },
        {
          num: "03",
          title: "Signem i retolem",
          desc: "Retolem el cotxe i t'enviem les fotos abans de sortir cap a Tarifa.",
        },
      ],
    },
    faqTag: "PREGUNTES FREQÜENTS",
    faq: [
      {
        q: "Quan sortiu?",
        a: "A l'edició de {editionInline}. Els cotxes es retolen unes quantes setmanes abans, així que com més aviat tanquem l'acord, més visibilitat hi guanyes.",
      },
      {
        q: "I si no arribeu a Marràqueix?",
        a: "El rally es corre sencer encara que un cotxe es quedi pel camí: el comboi continua i la teva marca també. En qualsevol cas, sempre t'expliquem què ha passat.",
      },
      {
        q: "Puc aportar material en lloc de diners?",
        a: "És clar. Recanvis, pneumàtics, eines, material escolar o sanitari: tot suma, i ho valorem amb tu abans d'assignar-te nivell.",
      },
      {
        q: "Com es justifica l'aportació?",
        a: "Emetem factura i t'enviem un informe amb les fotos del cotxe retolat i del material entregat al Marroc.",
      },
    ],

    contactModal: {
      title: "Sol·licitar el dossier",
      desc: "Explica'ns qui ets i quines zones t'interessen. Et responem amb la proposta tancada.",
      nameLabel: "Nom i cognoms",
      namePlaceholder: "Qui ens escriu",
      companyLabel: "Empresa",
      companyPlaceholder: "Nom de l'empresa",
      emailLabel: "Correu",
      emailPlaceholder: "tu@empresa.com",
      phoneLabel: "Telèfon",
      phonePlaceholder: "Opcional, per si va més ràpid",
      tierLabel: "Nivell d'interès",
      tierPlaceholder: "Encara no ho tinc clar",
      zonesLabel: "Zones seleccionades",
      messageLabel: "Missatge",
      messagePlaceholder: "Què t'agradaria aconseguir amb aquest patrocini",
      consent:
        "Accepto que BOAM RACING faci servir aquestes dades per respondre'm. Res més, i res de tercers.",
      submit: "Enviar la sol·licitud",
      sending: "Enviant…",
      success: "Rebut. T'escrivim en menys de 48 hores.",
      error: "No ho hem pogut enviar. Torna-ho a provar o escriu-nos directament.",
      close: "Tancar",
      responseTime: "Resposta en menys de 48 h",
      preparing: "Generant les làmines de la teva retolació…",
      attachments: "S'adjunten {n} làmina/es amb la teva retolació sobre el cotxe.",
      fallback: "No hem pogut enviar-ho automàticament. Hem descarregat les làmines i hem obert el teu correu amb la sol·licitud ja escrita: adjunta-les abans d'enviar-la.",
    },
    cta: {
      tag: "[ PATROCINI ]",
      title: ["POSA-LI EL TEU", "NOM A", "AQUEST VIATGE"],
      desc: "Explica'ns qui ets i què t'agradaria aconseguir. Et preparem una proposta a mida en 48 hores.",
      primary: "Sol·licitar el dossier",
      secondary: "Escriu-nos",
    },
    contact: {
      emailLabel: "Correu",
      phoneLabel: "Telèfon",
      dossierLabel: "Dossier de patrocini",
      responseTime: "Resposta en menys de 48 h",
      dossierCta: "Descarregar el dossier",
      dossierMeta: "PDF · {pages} pàgines · {size} MB",
      dossierNote: "en castellà",
    },
  },
};
