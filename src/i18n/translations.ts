/**
 * BOAM Racing — translation dictionary (es / en / ca)
 *
 * Structure mirrors the site sections. Arrays are used for titles that
 * break across multiple lines in the UI so each language can choose its
 * own line breaks.
 *
 * Proper nouns (car model names, place names like "Marrakech", people's
 * names) stay in their canonical form across languages, with only the
 * spelling adjusted when it differs (e.g. Marrakech/Marràqueix).
 */

export type Locale = "es" | "en" | "ca";

export const LOCALES: Locale[] = ["es", "en", "ca"];

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  ca: "CA",
};

export const DEFAULT_LOCALE: Locale = "es";

/** Shape of one language's content. All three locales must conform to this. */
export interface Dict {
  nav: {
    home: string;
    team: string;
    sponsorship: string;
    media: string;
    sponsorCta: string;
  };
  hero: {
    tag: string;
    title: readonly string[];
    description: string;
    cta: string;
    ctaArrow: string;
    stats: { cars: string; drivers: string; distance: string };
    scroll: string;
    expedition: string;
  };
  project: {
    waypoint: string;
    title: readonly string[];
    p1: string;
    p2: string;
    rules1: string;
    rules2: string;
    imageCaption: string;
    gpsLocation: string;
    sideLabel: string;
  };
  car: {
    waypoint: string;
    title: readonly string[];
    italic: string;
    specLine: string;
    specLineShort: string;
    specs: {
      engine:     { label: string; value: string; desc: string };
      protection: { label: string; value: string; desc: string };
      drivetrain: { label: string; value: string; desc: string };
      suspension: { label: string; value: string; desc: string };
    };
    sideLabel: string;
  };
  team: {
    pilot: string;
    copilot: string;
    unitPrefix: string;
    crewDossier: string;
    rallyUnit: string;
    estLabel: string;
    fromLabel: string;
    city: string;
    preparationLabel: string;
    preparationStatus: string;
    ctaTag: string;
    ctaTitle: readonly string[];
  };
}

export const dict: Record<Locale, Dict> = {
  es: {
    nav: {
      home: "Inicio",
      team: "El Equipo",
      sponsorship: "Patrocinio",
      media: "Media",
      sponsorCta: "Patrocinar",
    },
    hero: {
      tag: "Rally solidario · Marruecos 2027",
      title: ["OCHO DE NOSOTROS.", "CUATRO COCHES.", "UN RAID."],
      description:
        "Somos ocho amigos de Barcelona, repartidos en cuatro equipos y cuatro coches que ya cumplen los veinte. La idea es cruzar Marruecos en un rally solidario, sin GPS ni asistencia, con el maletero lleno de material para repartir en escuelas y pueblos a nuestro paso.",
      cta: "Conoce el proyecto",
      ctaArrow: "→",
      stats: { cars: "Coches", drivers: "Pilotos", distance: "Marruecos" },
      scroll: "Scroll",
      expedition: "Expedición · 2027",
    },
    project: {
      waypoint: "[ 01 ]  QUÉ ES EL UNIRAID",
      title: ["NI UNA CARRERA.", "NI TURISMO.", "UN RALLY", "CON SENTIDO."],
      p1: "El Uniraid es una travesía solidaria por Marruecos pensada para universitarios. Las reglas son sencillas: coches de al menos veinte años, sin GPS ni vehículos de apoyo, y el maletero lleno de material que se reparte en escuelas y comunidades del desierto a su paso.",
      p2: "Son unos 6.000 km entre Biarritz y Marrakech: autopista, puertos de montaña, pistas de tierra y dunas. No hay podio. Al final, llegar es lo importante.",
      rules1: "REGLAS · SIN GPS · SIN ASISTENCIA · COCHES DE 20 AÑOS+",
      rules2: "CARGA · MATERIAL PARA ESCUELAS DEL DESIERTO",
      imageCaption: "ERG CHEBBI · 31°09'N",
      gpsLocation: "Montañas del Atlas, Marruecos",
      sideLabel: "01 — QUÉ ES EL UNIRAID",
    },
    car: {
      waypoint: "[ 02 ]  LOS COCHES",
      title: ["1998 FORD", "ESCORT"],
      italic: "Viejos, ruidosos y más que suficientes para llegar a Marrakech.",
      specLine: "1998 FORD ESCORT MK6 · 1.6L ZETEC · FWD · PROTECCIÓN DE BAJOS",
      specLineShort: "1998 FORD ESCORT MK6 · 1.6L ZETEC · 2WD · PROTECCIÓN DE BAJOS",
      specs: {
        engine:      { label: "MOTOR",      value: "1.6L",       desc: "Zetec cuatro cilindros · Tracción delantera" },
        protection:  { label: "PROTECCIÓN", value: "BAJOS",      desc: "Placa de acero a medida" },
        drivetrain:  { label: "TRACCIÓN",   value: "2WD",        desc: "TRACCIÓN DELANTERA" },
        suspension:  { label: "SUSPENSIÓN", value: "ELEVADA",    desc: "Modificación rally para pistas" },
      },
      sideLabel: "02 — LOS COCHES",
    },
    team: {
      pilot: "Piloto",
      copilot: "Copiloto",
      unitPrefix: "EQUIPO",
      crewDossier: "Tripulación",
      rallyUnit: "Coche",
      estLabel: "Año",
      fromLabel: "Desde",
      city: "Barcelona",
      preparationLabel: "Preparación",
      preparationStatus: "En preparación",
      ctaTag: "[ ÚNETE ]",
      ctaTitle: ["AYÚDANOS", "A LLEGAR", "A MARRAKECH"],
    },
  },
  en: {
    nav: {
      home: "Home",
      team: "The Team",
      sponsorship: "Sponsorship",
      media: "Media",
      sponsorCta: "Sponsor us",
    },
    hero: {
      tag: "Charity rally · Morocco 2027",
      title: ["EIGHT OF US.", "FOUR CARS.", "ONE RAID."],
      description:
        "We're eight friends from Barcelona, split into four teams and four cars that are already past the twenty-year mark. The plan is to cross Morocco in a charity rally — no GPS, no support vehicles — with our trunks full of supplies to hand out at schools and villages along the way.",
      cta: "Discover the project",
      ctaArrow: "→",
      stats: { cars: "Cars", drivers: "Drivers", distance: "Morocco" },
      scroll: "Scroll",
      expedition: "Expedition · 2027",
    },
    project: {
      waypoint: "[ 01 ]  WHAT IS UNIRAID",
      title: ["NOT A RACE.", "NOT TOURISM.", "A RALLY", "THAT MEANS SOMETHING."],
      p1: "Uniraid is a charity drive across Morocco built for university students. The rules are simple: cars at least twenty years old, no GPS, no support vehicles, and a trunk full of supplies to hand out at schools and desert communities along the way.",
      p2: "It's around 6,000 km between Biarritz and Marrakech: highway, mountain passes, dirt tracks and dunes. There's no podium. In the end, finishing is what matters.",
      rules1: "RULES · NO GPS · NO SUPPORT · 20YR+ CARS",
      rules2: "CARGO · SUPPLIES FOR DESERT SCHOOLS",
      imageCaption: "ERG CHEBBI · 31°09'N",
      gpsLocation: "Atlas Mountains, Morocco",
      sideLabel: "01 — WHAT IS UNIRAID",
    },
    car: {
      waypoint: "[ 02 ]  THE CARS",
      title: ["1998 FORD", "ESCORT"],
      italic: "Old, noisy, and more than enough to reach Marrakech.",
      specLine: "1998 FORD ESCORT MK6 · 1.6L ZETEC · FWD · CUSTOM SUMP GUARD",
      specLineShort: "1998 FORD ESCORT MK6 · 1.6L ZETEC · 2WD · SUMP GUARD",
      specs: {
        engine:      { label: "ENGINE",     value: "1.6L",       desc: "Zetec inline-4 · Front-wheel drive" },
        protection:  { label: "PROTECTION", value: "SUMP GUARD", desc: "Custom steel skid plate" },
        drivetrain:  { label: "DRIVETRAIN", value: "2WD",        desc: "FRONT-WHEEL DRIVE" },
        suspension:  { label: "SUSPENSION", value: "RAISED",     desc: "Modified rally suspension lift" },
      },
      sideLabel: "02 — THE CARS",
    },
    team: {
      pilot: "Pilot",
      copilot: "Co-pilot",
      unitPrefix: "TEAM",
      crewDossier: "Crew",
      rallyUnit: "Car",
      estLabel: "Year",
      fromLabel: "From",
      city: "Barcelona",
      preparationLabel: "Preparation",
      preparationStatus: "In prep",
      ctaTag: "[ JOIN ]",
      ctaTitle: ["HELP US", "MAKE IT", "TO MARRAKECH"],
    },
  },
  ca: {
    nav: {
      home: "Inici",
      team: "L'Equip",
      sponsorship: "Patrocini",
      media: "Media",
      sponsorCta: "Patrocina'ns",
    },
    hero: {
      tag: "Rally solidari · Marroc 2027",
      title: ["VUIT DE NOSALTRES.", "QUATRE COTXES.", "UN RAID."],
      description:
        "Som vuit amics de Barcelona, repartits en quatre equips i quatre cotxes que ja passen dels vint anys. La idea és creuar el Marroc en un rally solidari, sense GPS ni assistència, amb el maleter ple de material per repartir a escoles i pobles pel camí.",
      cta: "Coneix el projecte",
      ctaArrow: "→",
      stats: { cars: "Cotxes", drivers: "Pilots", distance: "Marroc" },
      scroll: "Scroll",
      expedition: "Expedició · 2027",
    },
    project: {
      waypoint: "[ 01 ]  QUÈ ÉS L'UNIRAID",
      title: ["NI UNA CURSA.", "NI TURISME.", "UN RALLY", "AMB SENTIT."],
      p1: "L'Uniraid és una travessia solidària pel Marroc pensada per a universitaris. Les regles són senzilles: cotxes d'almenys vint anys, sense GPS ni vehicles d'assistència, i el maleter ple de material que es reparteix a escoles i comunitats del desert pel camí.",
      p2: "Són uns 6.000 km entre Biarritz i Marràqueix: autopista, ports de muntanya, pistes de terra i dunes. No hi ha podi. Al final, el que importa és arribar.",
      rules1: "REGLES · SENSE GPS · SENSE ASSISTÈNCIA · COTXES DE 20 ANYS+",
      rules2: "CÀRREGA · MATERIAL PER A ESCOLES DEL DESERT",
      imageCaption: "ERG CHEBBI · 31°09'N",
      gpsLocation: "Muntanyes de l'Atles, Marroc",
      sideLabel: "01 — QUÈ ÉS L'UNIRAID",
    },
    car: {
      waypoint: "[ 02 ]  ELS COTXES",
      title: ["1998 FORD", "ESCORT"],
      italic: "Vells, sorollosos i més que suficients per arribar a Marràqueix.",
      specLine: "1998 FORD ESCORT MK6 · 1.6L ZETEC · FWD · PROTECCIÓ DELS BAIXOS",
      specLineShort: "1998 FORD ESCORT MK6 · 1.6L ZETEC · 2WD · PROTECCIÓ DELS BAIXOS",
      specs: {
        engine:      { label: "MOTOR",      value: "1.6L",       desc: "Zetec quatre cilindres · Tracció davantera" },
        protection:  { label: "PROTECCIÓ",  value: "BAIXOS",     desc: "Planxa d'acer feta a mida" },
        drivetrain:  { label: "TRACCIÓ",    value: "2WD",        desc: "TRACCIÓ DAVANTERA" },
        suspension:  { label: "SUSPENSIÓ",  value: "ELEVADA",    desc: "Modificació rally per a pistes" },
      },
      sideLabel: "02 — ELS COTXES",
    },
    team: {
      pilot: "Pilot",
      copilot: "Copilot",
      unitPrefix: "EQUIP",
      crewDossier: "Tripulació",
      rallyUnit: "Cotxe",
      estLabel: "Any",
      fromLabel: "Des de",
      city: "Barcelona",
      preparationLabel: "Preparació",
      preparationStatus: "En preparació",
      ctaTag: "[ UNEIX-TE ]",
      ctaTitle: ["AJUDA'NS", "A ARRIBAR", "A MARRÀQUEIX"],
    },
  },
};
