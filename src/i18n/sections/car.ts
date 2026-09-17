/**
 * i18n · CAR — "the machine" block (section 02) and the fleet.
 *
 * Owner: i18n. Consumers: `UniRaidInfo` / the car blueprint module.
 * Access from a component: `const t = useT(); t.car.specs.engine.label`
 *
 * The five view labels (driver flank, co-driver flank, front, rear,
 * top-down) are NOT here: they live in `common.carViews` because the
 * sponsorship configurator needs exactly the same labels. Use
 * `t.common.carViews.*` for the view tabs.
 *
 * The fleet is four Ford Escort MK5/MK6 saloons from 1997–1999; the copy
 * deliberately avoids pinning a single model year.
 */

import type { Lines, LocalizedSection } from "./_shared";

export interface CarSpec {
  label: string;
  value: string;
  desc: string;
}

export interface CarPrepItem {
  label: string;
  status: string;
  desc: string;
}

export interface CarSection {
  waypoint: string;
  title: Lines;
  /** Pull quote set in italics under the headline. */
  italic: string;
  intro: string;
  /** Full and condensed technical strips. */
  specLine: string;
  specLineShort: string;
  specs: {
    engine: CarSpec;
    protection: CarSpec;
    drivetrain: CarSpec;
    suspension: CarSpec;
  };
  /** Chrome around the hand-drawn line-art blueprint. */
  blueprint: {
    title: string;
    hint: string;
    scaleLabel: string;
    viewLabel: string;
    strokeLabel: string;
  };
  /** Build progress checklist. Fixed at four items. */
  prep: {
    title: string;
    items: readonly [CarPrepItem, CarPrepItem, CarPrepItem, CarPrepItem];
  };
  /** Labels for the four-car fleet grid (data lives in code). */
  fleet: {
    title: string;
    intro: string;
    unitLabel: string;
    nicknameLabel: string;
    yearLabel: string;
    crewLabel: string;
  };
  sideLabel: string;
  imageAlt: string;
}

export const car: LocalizedSection<CarSection> = {
  es: {
    waypoint: "[ 02 ]  LOS COCHES",
    title: ["FORD ESCORT", "MK5 · MK6"],
    italic: "Viejos, ruidosos y más que suficientes para llegar a Marrakech.",
    intro:
      "Cuatro berlinas de los noventa compradas de segunda mano y preparadas en un garaje de Barcelona. Nada de prototipos: chapa, acero y muchas horas de taller.",
    specLine:
      "FORD ESCORT MK5/MK6 · 1.6L ZETEC · TRACCIÓN DELANTERA · PROTECCIÓN DE BAJOS",
    specLineShort: "FORD ESCORT · 1.6L ZETEC · 2WD · BAJOS PROTEGIDOS",
    specs: {
      engine: {
        label: "MOTOR",
        value: "1.6L",
        desc: "Zetec cuatro cilindros · Tracción delantera",
      },
      protection: {
        label: "PROTECCIÓN",
        value: "BAJOS",
        desc: "Placa de acero a medida",
      },
      drivetrain: {
        label: "TRACCIÓN",
        value: "2WD",
        desc: "TRACCIÓN DELANTERA",
      },
      suspension: {
        label: "SUSPENSIÓN",
        value: "ELEVADA",
        desc: "Modificación rally para pistas",
      },
    },
    blueprint: {
      title: "Plano del vehículo",
      hint: "Gira el coche para ver cada flanco",
      scaleLabel: "Escala",
      viewLabel: "Vista",
      strokeLabel: "Trazo",
    },
    prep: {
      title: "Preparación",
      items: [
        {
          label: "Protección de bajos",
          status: "Montado",
          desc: "Placa de acero de 4 mm bajo motor y caja de cambios.",
        },
        {
          label: "Suspensión elevada",
          status: "En curso",
          desc: "Muelles y amortiguadores de rally para pista rota.",
        },
        {
          label: "Refuerzo interior",
          status: "En curso",
          desc: "Barra antivuelco, arneses y extintor homologado.",
        },
        {
          label: "Depósitos y filtros",
          status: "Pendiente",
          desc: "Filtrado doble y bidones extra para las etapas largas.",
        },
      ],
    },
    fleet: {
      title: "La flota",
      intro: "Cuatro coches, cuatro tripulaciones, un único convoy.",
      unitLabel: "Unidad",
      nicknameLabel: "Nombre",
      yearLabel: "Año",
      crewLabel: "Tripulación",
    },
    sideLabel: "02 — LOS COCHES",
    imageAlt:
      "Ford Escort del equipo en el taller, con el capó abierto durante la preparación mecánica",
  },

  en: {
    waypoint: "[ 02 ]  THE CARS",
    title: ["FORD ESCORT", "MK5 · MK6"],
    italic: "Old, noisy, and more than enough to reach Marrakech.",
    intro:
      "Four nineties saloons bought second-hand and built up in a garage in Barcelona. No prototypes here: sheet metal, steel and a lot of workshop hours.",
    specLine:
      "FORD ESCORT MK5/MK6 · 1.6L ZETEC · FRONT-WHEEL DRIVE · CUSTOM SUMP GUARD",
    specLineShort: "FORD ESCORT · 1.6L ZETEC · 2WD · SUMP GUARD",
    specs: {
      engine: {
        label: "ENGINE",
        value: "1.6L",
        desc: "Zetec inline-four · Front-wheel drive",
      },
      protection: {
        label: "PROTECTION",
        value: "SUMP GUARD",
        desc: "Custom steel skid plate",
      },
      drivetrain: {
        label: "DRIVETRAIN",
        value: "2WD",
        desc: "FRONT-WHEEL DRIVE",
      },
      suspension: {
        label: "SUSPENSION",
        value: "RAISED",
        desc: "Rally lift for broken tracks",
      },
    },
    blueprint: {
      title: "Vehicle blueprint",
      hint: "Rotate the car to see every side",
      scaleLabel: "Scale",
      viewLabel: "View",
      strokeLabel: "Stroke",
    },
    prep: {
      title: "Build progress",
      items: [
        {
          label: "Sump guard",
          status: "Fitted",
          desc: "4 mm steel plate under the engine and gearbox.",
        },
        {
          label: "Raised suspension",
          status: "In progress",
          desc: "Rally springs and dampers for broken surfaces.",
        },
        {
          label: "Interior reinforcement",
          status: "In progress",
          desc: "Roll bar, harnesses and a homologated extinguisher.",
        },
        {
          label: "Tanks and filters",
          status: "Pending",
          desc: "Double filtration and spare jerrycans for the long stages.",
        },
      ],
    },
    fleet: {
      title: "The fleet",
      intro: "Four cars, four crews, one convoy.",
      unitLabel: "Unit",
      nicknameLabel: "Name",
      yearLabel: "Year",
      crewLabel: "Crew",
    },
    sideLabel: "02 — THE CARS",
    imageAlt:
      "The team's Ford Escort in the workshop with the bonnet open during mechanical prep",
  },

  ca: {
    waypoint: "[ 02 ]  ELS COTXES",
    title: ["FORD ESCORT", "MK5 · MK6"],
    italic: "Vells, sorollosos i més que suficients per arribar a Marràqueix.",
    intro:
      "Quatre berlines dels noranta comprades de segona mà i preparades en un garatge de Barcelona. Res de prototips: xapa, acer i moltes hores de taller.",
    specLine:
      "FORD ESCORT MK5/MK6 · 1.6L ZETEC · TRACCIÓ DAVANTERA · PROTECCIÓ DELS BAIXOS",
    specLineShort: "FORD ESCORT · 1.6L ZETEC · 2WD · BAIXOS PROTEGITS",
    specs: {
      engine: {
        label: "MOTOR",
        value: "1.6L",
        desc: "Zetec quatre cilindres · Tracció davantera",
      },
      protection: {
        label: "PROTECCIÓ",
        value: "BAIXOS",
        desc: "Planxa d'acer feta a mida",
      },
      drivetrain: {
        label: "TRACCIÓ",
        value: "2WD",
        desc: "TRACCIÓ DAVANTERA",
      },
      suspension: {
        label: "SUSPENSIÓ",
        value: "ELEVADA",
        desc: "Modificació rally per a pistes",
      },
    },
    blueprint: {
      title: "Plànol del vehicle",
      hint: "Gira el cotxe per veure'n cada flanc",
      scaleLabel: "Escala",
      viewLabel: "Vista",
      strokeLabel: "Traç",
    },
    prep: {
      title: "Preparació",
      items: [
        {
          label: "Protecció dels baixos",
          status: "Muntat",
          desc: "Planxa d'acer de 4 mm sota el motor i la caixa de canvis.",
        },
        {
          label: "Suspensió elevada",
          status: "En curs",
          desc: "Molles i amortidors de rally per a pista trencada.",
        },
        {
          label: "Reforç interior",
          status: "En curs",
          desc: "Barra antibolcada, arnesos i extintor homologat.",
        },
        {
          label: "Dipòsits i filtres",
          status: "Pendent",
          desc: "Filtratge doble i bidons extra per a les etapes llargues.",
        },
      ],
    },
    fleet: {
      title: "La flota",
      intro: "Quatre cotxes, quatre tripulacions, un sol comboi.",
      unitLabel: "Unitat",
      nicknameLabel: "Nom",
      yearLabel: "Any",
      crewLabel: "Tripulació",
    },
    sideLabel: "02 — ELS COTXES",
    imageAlt:
      "Ford Escort de l'equip al taller, amb el capó obert durant la preparació mecànica",
  },
};
