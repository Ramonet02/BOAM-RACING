/**
 * i18n · COMMON — cross-cutting copy shared by every section.
 *
 * Owner: i18n. Consumers: any component.
 * Access from a component: `const t = useT(); t.common.actions.sponsor`
 *
 * Put something here only when at least two sections need it: brand
 * strings, the rally edition label, generic button verbs, HUD/telemetry
 * micro-badge labels, the enriched image-placeholder copy, accessibility
 * strings and the document metadata.
 *
 * `edition` is the SINGLE source for how the February 2027 edition is
 * WRITTEN in each language — never type "Febrero 2027" inline in a
 * component. The canonical date VALUE (year, month, countdown target)
 * belongs to `src/lib/constants.ts`; this block is only its localized
 * rendering, and the only place Catalan gets one (`getEditionLabel()`
 * over there only speaks Spanish and English).
 *
 * Every `{edition}` token used across the other sections is replaced
 * with `t.common.edition.monthYear`; `meta.*` uses it too, so the
 * document title never hardcodes the date.
 *
 * `meta.*` is the LOCALIZED rendering of `SITE_META`
 * (`src/lib/constants.ts`), which stays as the build-time default for
 * the server-rendered `metadata` export.
 */

import type { LocalizedSection } from "./_shared";

export interface CommonSection {
  /** Team identity. The team is BOAM RACING; UniRaid is only the rally. */
  brand: {
    name: string;
    team: string;
    rally: string;
    tagline: string;
  };
  /**
   * Localized rendering of the rally edition (February 2027) — the ONLY
   * place the date is written in words, in any language.
   *
   *   monthYear        title case, for badges and headings
   *   monthYearInline  sentence case, for the middle of a sentence
   *   month            the bare month, for "…and, come February, …"
   *
   * The token resolver in `translations.ts` feeds `{edition}`,
   * `{editionInline}` and `{editionMonth}` from these three.
   */
  edition: {
    label: string;
    monthYear: string;
    monthYearInline: string;
    month: string;
    monthYearShort: string;
    year: string;
    countdownLabel: string;
    statusLabel: string;
    statusValue: string;
  };
  /** Generic button / link verbs. */
  actions: {
    discover: string;
    sponsor: string;
    contact: string;
    download: string;
    viewAll: string;
    back: string;
    next: string;
    prev: string;
    close: string;
    send: string;
    more: string;
    retry: string;
  };
  /** Generic field and column labels. */
  labels: {
    total: string;
    status: string;
    phase: string;
    stage: string;
    distance: string;
    altitude: string;
    coords: string;
    terrain: string;
    duration: string;
    date: string;
    crew: string;
    unit: string;
    year: string;
    from: string;
    to: string;
    km: string;
    days: string;
    loading: string;
    comingSoon: string;
    tbd: string;
    optional: string;
    required: string;
  };
  /** HUD / technical micro-badging of the "Rally Desert Tactical" UI. */
  telemetry: {
    gps: string;
    altitude: string;
    heading: string;
    bloodType: string;
    temperature: string;
    pressure: string;
    odometer: string;
    fuel: string;
    signal: string;
    checkpoint: string;
    timeZone: string;
  };
  /**
   * Labels of the five hand-drawn car views, keyed by the `CarView`
   * union of `src/lib/types.ts` so a view tab renders as
   * `t.common.carViews[slot.view]`. Shared by the car blueprint and the
   * sponsorship configurator.
   */
  carViews: {
    "lateral-izq": string;
    "lateral-der": string;
    frontal: string;
    trasera: string;
    cenital: string;
  };
  /** Enriched image placeholders — the site ships no stock photography. */
  placeholder: {
    badge: string;
    title: string;
    hint: string;
    credit: string;
    archiveRef: string;
    photoPending: string;
    videoPending: string;
  };
  /** Progress states reused by the fleet, the chronology and the roster. */
  status: {
    planned: string;
    inProgress: string;
    done: string;
    open: string;
    closed: string;
    pending: string;
  };
  /** Screen-reader only strings. */
  a11y: {
    skipToContent: string;
    languageSelector: string;
    openMenu: string;
    closeMenu: string;
    playVideo: string;
    externalLink: string;
    decorative: string;
    carDiagram: string;
    scrollDown: string;
  };
  /** Document metadata (<title>, description, OpenGraph). */
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    keywords: readonly string[];
  };
  /** Error surfaces. */
  errors: {
    notFound: { title: string; desc: string; cta: string };
    generic: string;
  };
}

export const common: LocalizedSection<CommonSection> = {
  /* ─────────────────────────── ES ─────────────────────────── */
  es: {
    brand: {
      name: "BOAM RACING",
      team: "Equipo BOAM RACING",
      rally: "UniRaid",
      tagline: "Cuatro coches viejos, ocho cabezotas y un desierto por delante.",
    },
    edition: {
      label: "Edición",
      monthYear: "Febrero de 2027",
      monthYearInline: "febrero de 2027",
      month: "febrero",
      monthYearShort: "FEB 2027",
      year: "2027",
      countdownLabel: "Salida en",
      statusLabel: "Estado",
      statusValue: "En preparación",
    },
    actions: {
      discover: "Descubrir",
      sponsor: "Patrocinar",
      contact: "Contactar",
      download: "Descargar",
      viewAll: "Ver todo",
      back: "Volver",
      next: "Siguiente",
      prev: "Anterior",
      close: "Cerrar",
      send: "Enviar",
      more: "Ver más",
      retry: "Reintentar",
    },
    labels: {
      total: "Total",
      status: "Estado",
      phase: "Fase",
      stage: "Etapa",
      distance: "Distancia",
      altitude: "Altitud",
      coords: "Coordenadas",
      terrain: "Terreno",
      duration: "Duración",
      date: "Fecha",
      crew: "Tripulación",
      unit: "Unidad",
      year: "Año",
      from: "Desde",
      to: "Hasta",
      km: "KM",
      days: "Días",
      loading: "Cargando",
      comingSoon: "Próximamente",
      tbd: "Por confirmar",
      optional: "Opcional",
      required: "Obligatorio",
    },
    telemetry: {
      gps: "GPS",
      altitude: "ALT",
      heading: "RUMBO",
      bloodType: "GRUPO SANGUÍNEO",
      temperature: "TEMP",
      pressure: "PRESIÓN",
      odometer: "ODÓMETRO",
      fuel: "COMBUSTIBLE",
      signal: "SEÑAL",
      checkpoint: "CONTROL",
      timeZone: "HUSO",
    },
    carViews: {
      "lateral-izq": "Flanco piloto",
      "lateral-der": "Flanco copiloto",
      frontal: "Frontal",
      trasera: "Trasera",
      cenital: "Cenital",
    },
    placeholder: {
      badge: "ARCHIVO PENDIENTE",
      title: "Imagen del archivo del equipo",
      hint: "Este hueco espera una foto real de BOAM RACING.",
      credit: "Archivo BOAM RACING",
      archiveRef: "REF",
      photoPending: "Foto pendiente",
      videoPending: "Vídeo pendiente",
    },
    status: {
      planned: "Planificado",
      inProgress: "En curso",
      done: "Completado",
      open: "Abierto",
      closed: "Cerrado",
      pending: "Pendiente",
    },
    a11y: {
      skipToContent: "Saltar al contenido principal",
      languageSelector: "Selector de idioma",
      openMenu: "Abrir el menú de navegación",
      closeMenu: "Cerrar el menú de navegación",
      playVideo: "Reproducir el vídeo",
      externalLink: "Se abre en una pestaña nueva",
      decorative: "Elemento decorativo",
      carDiagram: "Diagrama técnico del Ford Escort del equipo",
      scrollDown: "Bajar a la siguiente sección",
    },
    meta: {
      title: "BOAM RACING — Rally solidario por Marruecos · {edition}",
      description:
        "BOAM RACING es un equipo universitario de estudiantes de Barcelona. En {edition} cruzamos Marruecos en cuatro Ford Escort de los noventa, sin GPS ni asistencia, cargados de material solidario. Busca tu sitio en nuestros coches.",
      ogTitle: "BOAM RACING — Marruecos, {edition}",
      ogDescription:
        "Estudiantes de Barcelona, cuatro coches de los noventa y un desierto por delante, con el maletero lleno de material solidario.",
      keywords: [
        "BOAM RACING",
        "rally solidario",
        "Marruecos",
        "UniRaid",
        "equipo universitario",
        "Ford Escort",
        "patrocinio",
        "Marrakech",
      ],
    },
    errors: {
      notFound: {
        title: "Fuera de ruta",
        desc: "Esta página no está en el roadbook. Vuelve a la pista principal.",
        cta: "Volver al inicio",
      },
      generic: "Algo se ha roto por el camino. Inténtalo otra vez.",
    },
  },

  /* ─────────────────────────── EN ─────────────────────────── */
  en: {
    brand: {
      name: "BOAM RACING",
      team: "Team BOAM RACING",
      rally: "UniRaid",
      tagline: "Four old cars, eight stubborn heads and a desert ahead.",
    },
    edition: {
      label: "Edition",
      monthYear: "February 2027",
      monthYearInline: "February 2027",
      month: "February",
      monthYearShort: "FEB 2027",
      year: "2027",
      countdownLabel: "Departure in",
      statusLabel: "Status",
      statusValue: "In preparation",
    },
    actions: {
      discover: "Discover",
      sponsor: "Sponsor us",
      contact: "Get in touch",
      download: "Download",
      viewAll: "View all",
      back: "Back",
      next: "Next",
      prev: "Previous",
      close: "Close",
      send: "Send",
      more: "See more",
      retry: "Try again",
    },
    labels: {
      total: "Total",
      status: "Status",
      phase: "Phase",
      stage: "Stage",
      distance: "Distance",
      altitude: "Altitude",
      coords: "Coordinates",
      terrain: "Terrain",
      duration: "Duration",
      date: "Date",
      crew: "Crew",
      unit: "Unit",
      year: "Year",
      from: "From",
      to: "To",
      km: "KM",
      days: "Days",
      loading: "Loading",
      comingSoon: "Coming soon",
      tbd: "To be confirmed",
      optional: "Optional",
      required: "Required",
    },
    telemetry: {
      gps: "GPS",
      altitude: "ALT",
      heading: "HEADING",
      bloodType: "BLOOD TYPE",
      temperature: "TEMP",
      pressure: "PRESSURE",
      odometer: "ODOMETER",
      fuel: "FUEL",
      signal: "SIGNAL",
      checkpoint: "CHECKPOINT",
      timeZone: "TIME ZONE",
    },
    carViews: {
      "lateral-izq": "Driver side",
      "lateral-der": "Co-driver side",
      frontal: "Front",
      trasera: "Rear",
      cenital: "Top-down",
    },
    placeholder: {
      badge: "ARCHIVE PENDING",
      title: "Image from the team archive",
      hint: "This slot is waiting for a real BOAM RACING photo.",
      credit: "BOAM RACING archive",
      archiveRef: "REF",
      photoPending: "Photo pending",
      videoPending: "Video pending",
    },
    status: {
      planned: "Planned",
      inProgress: "In progress",
      done: "Completed",
      open: "Open",
      closed: "Closed",
      pending: "Pending",
    },
    a11y: {
      skipToContent: "Skip to main content",
      languageSelector: "Language selector",
      openMenu: "Open the navigation menu",
      closeMenu: "Close the navigation menu",
      playVideo: "Play the video",
      externalLink: "Opens in a new tab",
      decorative: "Decorative element",
      carDiagram: "Technical diagram of the team's Ford Escort",
      scrollDown: "Scroll to the next section",
    },
    meta: {
      title: "BOAM RACING — Charity rally across Morocco · {edition}",
      description:
        "BOAM RACING is a university team of students from Barcelona. In {edition} we cross Morocco in four nineties Ford Escorts — no GPS, no support crew — loaded with aid supplies. Find your spot on our cars.",
      ogTitle: "BOAM RACING — Morocco, {edition}",
      ogDescription:
        "Students from Barcelona, four nineties cars and a desert ahead, with the boot full of aid supplies.",
      keywords: [
        "BOAM RACING",
        "charity rally",
        "Morocco",
        "UniRaid",
        "university team",
        "Ford Escort",
        "sponsorship",
        "Marrakech",
      ],
    },
    errors: {
      notFound: {
        title: "Off route",
        desc: "This page isn't in the roadbook. Head back to the main track.",
        cta: "Back to home",
      },
      generic: "Something broke along the way. Give it another go.",
    },
  },

  /* ─────────────────────────── CA ─────────────────────────── */
  ca: {
    brand: {
      name: "BOAM RACING",
      team: "Equip BOAM RACING",
      rally: "UniRaid",
      tagline: "Quatre cotxes vells, vuit caparruts i un desert al davant.",
    },
    edition: {
      label: "Edició",
      monthYear: "Febrer del 2027",
      monthYearInline: "febrer del 2027",
      month: "febrer",
      monthYearShort: "FEB 2027",
      year: "2027",
      countdownLabel: "Sortida d'aquí a",
      statusLabel: "Estat",
      statusValue: "En preparació",
    },
    actions: {
      discover: "Descobrir",
      sponsor: "Patrocinar",
      contact: "Contactar",
      download: "Descarregar",
      viewAll: "Veure-ho tot",
      back: "Tornar",
      next: "Següent",
      prev: "Anterior",
      close: "Tancar",
      send: "Enviar",
      more: "Veure'n més",
      retry: "Torna-ho a provar",
    },
    labels: {
      total: "Total",
      status: "Estat",
      phase: "Fase",
      stage: "Etapa",
      distance: "Distància",
      altitude: "Altitud",
      coords: "Coordenades",
      terrain: "Terreny",
      duration: "Durada",
      date: "Data",
      crew: "Tripulació",
      unit: "Unitat",
      year: "Any",
      from: "Des de",
      to: "Fins a",
      km: "KM",
      days: "Dies",
      loading: "Carregant",
      comingSoon: "Properament",
      tbd: "Per confirmar",
      optional: "Opcional",
      required: "Obligatori",
    },
    telemetry: {
      gps: "GPS",
      altitude: "ALT",
      heading: "RUMB",
      bloodType: "GRUP SANGUINI",
      temperature: "TEMP",
      pressure: "PRESSIÓ",
      odometer: "ODÒMETRE",
      fuel: "CARBURANT",
      signal: "SENYAL",
      checkpoint: "CONTROL",
      timeZone: "FUS",
    },
    carViews: {
      "lateral-izq": "Flanc pilot",
      "lateral-der": "Flanc copilot",
      frontal: "Frontal",
      trasera: "Posterior",
      cenital: "Zenital",
    },
    placeholder: {
      badge: "ARXIU PENDENT",
      title: "Imatge de l'arxiu de l'equip",
      hint: "Aquest buit espera una foto real de BOAM RACING.",
      credit: "Arxiu BOAM RACING",
      archiveRef: "REF",
      photoPending: "Foto pendent",
      videoPending: "Vídeo pendent",
    },
    status: {
      planned: "Planificat",
      inProgress: "En curs",
      done: "Completat",
      open: "Obert",
      closed: "Tancat",
      pending: "Pendent",
    },
    a11y: {
      skipToContent: "Salta al contingut principal",
      languageSelector: "Selector d'idioma",
      openMenu: "Obre el menú de navegació",
      closeMenu: "Tanca el menú de navegació",
      playVideo: "Reprodueix el vídeo",
      externalLink: "S'obre en una pestanya nova",
      decorative: "Element decoratiu",
      carDiagram: "Diagrama tècnic del Ford Escort de l'equip",
      scrollDown: "Baixa a la secció següent",
    },
    meta: {
      title: "BOAM RACING — Rally solidari pel Marroc · {edition}",
      description:
        "BOAM RACING és un equip universitari d'estudiants de Barcelona. El {edition} creuem el Marroc amb quatre Ford Escort dels noranta, sense GPS ni assistència, carregats de material solidari. Busca el teu lloc als nostres cotxes.",
      ogTitle: "BOAM RACING — Marroc, {edition}",
      ogDescription:
        "Estudiants de Barcelona, quatre cotxes dels noranta i un desert al davant, amb el maleter ple de material solidari.",
      keywords: [
        "BOAM RACING",
        "rally solidari",
        "Marroc",
        "UniRaid",
        "equip universitari",
        "Ford Escort",
        "patrocini",
        "Marràqueix",
      ],
    },
    errors: {
      notFound: {
        title: "Fora de ruta",
        desc: "Aquesta pàgina no és al roadbook. Torna a la pista principal.",
        cta: "Torna a l'inici",
      },
      generic: "Alguna cosa s'ha trencat pel camí. Torna-ho a provar.",
    },
  },
};
