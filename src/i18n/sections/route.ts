/**
 * i18n · ROUTE — the roadbook + the hand-drawn Morocco map (section 03)
 * and the build chronology (section 04).
 *
 * Owner: i18n. Consumer: `TimelineSection` / the route + map module.
 * Access from a component:
 *     const t = useT();
 *     t.route.stages["etapa-03"].title
 *     t.route.terrain[stage.terrain]
 *     t.route.difficulty[stage.difficulty]
 *
 * This section used to be hardcoded in English inside `TimelineSection`.
 *
 * ┌── WHAT IS *NOT* HERE ─────────────────────────────────────────────┐
 * │ Kilometres, days, coordinates, terrain type, difficulty level,    │
 * │ stage order and totals are DATA and live in `src/lib/route.ts`    │
 * │ (`ROUTE_STAGES`, `ROUTE_SUMMARY`, `TOTAL_DAYS`, `APPROACH_KM`).   │
 * │ Not one of those numbers is repeated in this file.                │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * `stages` is keyed by the SAME ids as `ROUTE_STAGES` ("etapa-01" …
 * "etapa-06"), so a roadbook row renders as:
 *
 *     const copy = t.route.stages[stage.id as RouteStageId];
 *     <td>{stage.code}</td>
 *     <td>{copy.title}</td>
 *     <td>{stage.origin} → {stage.destination}</td>
 *     <td>{t.route.terrain[stage.terrain]}</td>
 *     <td>{formatKm(stage.km)}</td>
 *
 * The Spanish wording of `stages[*].title` / `.description` /
 * `.charityGoal` was drafted inside `src/lib/route.ts`; from here on the
 * DICTIONARY is what the UI renders, in the three languages. The data
 * module keeps its Spanish strings for tooling and for anything running
 * outside React.
 *
 * `intro` carries `{stages}` / `{days}` / `{km}` tokens that the
 * component replaces with the real figures — never type them:
 *
 *     t.route.intro
 *       .replace("{stages}", String(ROUTE_SUMMARY.totalStages))
 *       .replace("{days}", String(ROUTE_SUMMARY.totalDays))
 *       .replace("{km}", formatKm(ROUTE_SUMMARY.moroccoKm))
 */

import type { Lines, LocalizedSection } from "./_shared";

/** Stage ids, mirroring `ROUTE_STAGES[].id` in `src/lib/route.ts`. */
export type RouteStageId =
  | "etapa-01"
  | "etapa-02"
  | "etapa-03"
  | "etapa-04"
  | "etapa-05"
  | "etapa-06";

/** Mirrors `TerrainType` in `src/lib/types.ts`. */
export type TerrainKey =
  | "asfalto"
  | "pista"
  | "dunas"
  | "gargantas"
  | "montana"
  | "ferry";

/** Mirrors `DifficultyLevel` in `src/lib/types.ts`. */
export type DifficultyKey = 1 | 2 | 3 | 4 | 5;

/** The localized prose of one stage. Everything else about it is data. */
export interface RouteStageCopy {
  /** Stage name: "Cruce del Gran Atlas". */
  title: string;
  /** Two or three sentences for the expanded row. */
  description: string;
  /** What the crews do for the aid mission on this stage. */
  charityGoal: string;
  /** One-line colour for the collapsed row / map tooltip. */
  note: string;
}

/** One milestone of the build chronology (section 04). */
export interface RoutePhase {
  num: string;
  title: string;
  desc: string;
  /** Mirrors a value of `t.common.status.*`. */
  status: string;
  /** Time marker. `{edition}` is replaced with the localized date. */
  window: string;
}

export interface RouteSection {
  waypoint: string;
  title: Lines;
  /** Uses the `{stages}`, `{days}` and `{km}` tokens. */
  intro: string;
  sideLabel: string;
  /** Column headers and controls of the roadbook table. */
  table: {
    index: string;
    code: string;
    stage: string;
    leg: string;
    terrain: string;
    difficulty: string;
    km: string;
    days: string;
    charity: string;
    total: string;
    expand: string;
    collapse: string;
  };
  stages: Readonly<Record<RouteStageId, RouteStageCopy>>;
  terrain: Readonly<Record<TerrainKey, string>>;
  difficulty: Readonly<Record<DifficultyKey, string>>;
  /** Labels of the totals strip. The figures come from `ROUTE_SUMMARY`. */
  summary: {
    title: string;
    stages: string;
    days: string;
    moroccoKm: string;
    approachKm: string;
    oneWayKm: string;
    hardest: string;
    longest: string;
  };
  /** Shown while `ROUTE_HAS_UNVERIFIED_DATA` is true. Carries no figures. */
  disclaimer: string;
  /** Footnote about the pre-rally transfer down to the start line. */
  approachNote: string;
  /** Chrome of the hand-drawn vector map of Morocco (no map library). */
  map: {
    title: string;
    hint: string;
    placeholder: string;
    regionLabel: string;
    startLabel: string;
    finishLabel: string;
    legendTitle: string;
    legend: {
      road: string;
      track: string;
      dune: string;
      ferry: string;
      checkpoint: string;
      start: string;
      finish: string;
    };
    note: string;
  };
  /** Section 04 — from the garage to the start line. */
  chronology: {
    waypoint: string;
    title: Lines;
    sideLabel: string;
    phaseLabel: string;
    phases: readonly [RoutePhase, RoutePhase, RoutePhase, RoutePhase];
  };
}

export const route: LocalizedSection<RouteSection> = {
  /* ─────────────────────────── ES ─────────────────────────── */
  es: {
    waypoint: "[ 03 ]  LA RUTA",
    title: ["EL ROADBOOK", "DE TARIFA", "A MARRAKECH"],
    intro:
      "{stages} etapas, {days} días y {km} de Marruecos de norte a sur. Del precinto del material en el puerto de Tarifa a la meta al pie del Atlas, pasando por el mar de dunas del Erg Chebbi.",
    sideLabel: "03 — LA RUTA",
    table: {
      index: "#",
      code: "Cód.",
      stage: "Etapa",
      leg: "Tramo",
      terrain: "Terreno",
      difficulty: "Dificultad",
      km: "KM",
      days: "Días",
      charity: "Misión solidaria",
      total: "Total",
      expand: "Ver la etapa",
      collapse: "Cerrar la etapa",
    },
    stages: {
      "etapa-01": {
        title: "Salida y verificaciones técnicas",
        description:
          "Jornada de verificaciones en el puerto de Tarifa: extintores, arneses, cubrecárter y documentación. Cruce del Estrecho en ferry y primer contacto con Marruecos al bajar la rampa.",
        charityGoal:
          "Pesaje y precinto de la carga solidaria: libros, material escolar y ropa repartidos entre los cuatro coches antes de embarcar.",
        note: "El rally empieza con un sello de aduana, no con un banderazo.",
      },
      "etapa-02": {
        title: "Cruce del Gran Atlas",
        description:
          "Enlace largo hacia el interior por Fez y Midelt, con el paso del Gran Atlas por el Tizi n'Talghomt. Puertos de alta montaña, el termómetro cayendo y el primer día de verdad al volante.",
        charityGoal:
          "Contacto con la ONG local y cierre de los puntos de entrega en los valles del sur.",
        note: "Aquí se descubre qué coche calienta y qué copiloto sabe leer un mapa.",
      },
      "etapa-03": {
        title: "Desierto profundo y dunas del Erg Chebbi",
        description:
          "La etapa reina. Pista rápida hasta Erfoud y entrada al Erg Chebbi: cordones de duna, navegación a rumbo y arena blanda. Es donde se decide qué coches llegan enteros al final.",
        charityGoal:
          "Reparto de agua y material sanitario básico en los campamentos nómadas del borde del erg.",
        note: "Arena blanda, presión de neumáticos baja y mucha pala.",
      },
      "etapa-04": {
        title: "Entrega del material solidario",
        description:
          "La jornada más corta en kilómetros y la más importante del viaje. Pistas de tierra entre pueblos bereberes del Draa, con parada en las escuelas rurales para descargar en mano lo que se cargó en Tarifa.",
        charityGoal:
          "Núcleo solidario del rally: material escolar y deportivo entregado directamente en las aulas.",
        note: "El día por el que existe todo lo demás.",
      },
      "etapa-05": {
        title: "Etapa maratón de navegación",
        description:
          "Maratón: sin asistencia exterior y con el roadbook cerrado. Pistas de Nekob y Agdz, vadeos secos del Draa y gargantas estrechas. Se navega con brújula y cuentakilómetros, nunca con GPS.",
        charityGoal:
          "Etapa sin asistencia: aquí la solidaridad es entre equipos, remolcando y reparando a quien se queda.",
        note: "Si te pierdes, te pierdes con el mapa en la mano.",
      },
      "etapa-06": {
        title: "Cierre y meta",
        description:
          "Subida al Tizi n'Tichka y descenso al Haouz hasta la meta en Marrakech. Última jornada, con los coches ya marcados por el desierto y la chapa contando el viaje.",
        charityGoal:
          "Balance de la entrega: recuento del material repartido y acta firmada con la ONG receptora.",
        note: "Llegar es el podio.",
      },
    },
    terrain: {
      asfalto: "Asfalto",
      pista: "Pista",
      dunas: "Dunas",
      gargantas: "Gargantas",
      montana: "Montaña",
      ferry: "Ferry",
    },
    difficulty: {
      1: "Enlace",
      2: "Fácil",
      3: "Media",
      4: "Dura",
      5: "Extrema",
    },
    summary: {
      title: "Totales del recorrido",
      stages: "Etapas",
      days: "Días de expedición",
      moroccoKm: "Kilómetros en Marruecos",
      approachKm: "Enlace hasta la salida",
      oneWayKm: "Total de ida",
      hardest: "Etapa más dura",
      longest: "Etapa más larga",
    },
    disclaimer:
      "Recorrido estimado. El roadbook oficial del UniRaid no se publica hasta pocos días antes de la salida: los kilometrajes y las localidades intermedias son la previsión del equipo.",
    approachNote:
      "El trayecto desde el campamento base hasta la línea de salida no puntúa como etapa: es el enlace previo.",
    map: {
      title: "Mapa de la ruta",
      hint: "Pasa el cursor por cada etapa",
      placeholder: "Trazado de la ruta · Marruecos",
      regionLabel: "Marruecos",
      startLabel: "Salida",
      finishLabel: "Meta",
      legendTitle: "Leyenda",
      legend: {
        road: "Carretera",
        track: "Pista",
        dune: "Dunas",
        ferry: "Ferry",
        checkpoint: "Control",
        start: "Salida",
        finish: "Meta",
      },
      note: "Mapa vectorial dibujado a mano por el equipo. Trazado orientativo, no apto para navegar.",
    },
    chronology: {
      waypoint: "[ 04 ]  CRONOLOGÍA",
      title: ["DEL GARAJE", "A LA LÍNEA", "DE SALIDA"],
      sideLabel: "04 — CRONOLOGÍA",
      phaseLabel: "Fase",
      phases: [
        {
          num: "01",
          title: "LA FLOTA",
          desc: "Compra de los Ford Escort y primeras pruebas de carretera.",
          status: "Completado",
          window: "2025",
        },
        {
          num: "02",
          title: "LA PREPARACIÓN",
          desc: "Mecánica, protecciones y seguridad, fin de semana tras fin de semana.",
          status: "En curso",
          window: "2026",
        },
        {
          num: "03",
          title: "PATROCINIOS",
          desc: "Cerrar el presupuesto y llenar el maletero de material solidario.",
          status: "Abierto",
          window: "2026",
        },
        {
          num: "04",
          title: "LA SALIDA",
          desc: "Rumbo a Marruecos con el convoy completo.",
          status: "Pendiente",
          window: "{edition}",
        },
      ],
    },
  },

  /* ─────────────────────────── EN ─────────────────────────── */
  en: {
    waypoint: "[ 03 ]  THE ROUTE",
    title: ["THE ROADBOOK", "FROM TARIFA", "TO MARRAKECH"],
    intro:
      "{stages} stages, {days} days and {km} of Morocco from north to south. From sealing the cargo on the quay in Tarifa to the finish at the foot of the Atlas, by way of the dune sea of Erg Chebbi.",
    sideLabel: "03 — THE ROUTE",
    table: {
      index: "#",
      code: "Code",
      stage: "Stage",
      leg: "Leg",
      terrain: "Terrain",
      difficulty: "Difficulty",
      km: "KM",
      days: "Days",
      charity: "Aid mission",
      total: "Total",
      expand: "Open the stage",
      collapse: "Close the stage",
    },
    stages: {
      "etapa-01": {
        title: "Start and scrutineering",
        description:
          "Scrutineering day on the quay in Tarifa: extinguishers, harnesses, sump guard and paperwork. Ferry across the Strait and first contact with Morocco at the bottom of the ramp.",
        charityGoal:
          "Weighing and sealing the aid cargo: books, school supplies and clothing shared out between the four cars before boarding.",
        note: "The rally starts with a customs stamp, not a flag drop.",
      },
      "etapa-02": {
        title: "Crossing the High Atlas",
        description:
          "A long haul inland through Fez and Midelt, crossing the High Atlas over the Tizi n'Talghomt. High-altitude passes, the temperature dropping and the first real day behind the wheel.",
        charityGoal:
          "Meeting the local NGO and confirming the delivery points down in the southern valleys.",
        note: "This is where you find out which car overheats and which co-driver can read a map.",
      },
      "etapa-03": {
        title: "Deep desert and the Erg Chebbi dunes",
        description:
          "The queen stage. Fast piste to Erfoud, then into Erg Chebbi: dune ridges, navigation by bearing and soft sand. This is where it's decided which cars reach the finish in one piece.",
        charityGoal:
          "Handing out water and basic medical supplies at the nomad camps on the edge of the erg.",
        note: "Soft sand, low tyre pressures and a lot of shovelling.",
      },
      "etapa-04": {
        title: "Delivering the aid cargo",
        description:
          "The shortest day in kilometres and the most important of the trip. Dirt tracks between the Berber villages of the Draa, stopping at the rural schools to unload by hand what was loaded in Tarifa.",
        charityGoal:
          "The heart of the rally: school and sports equipment handed over directly in the classrooms.",
        note: "The day everything else exists for.",
      },
      "etapa-05": {
        title: "Marathon navigation stage",
        description:
          "Marathon: no outside assistance and a sealed roadbook. The Nekob and Agdz tracks, dry crossings of the Draa and narrow gorges. You navigate with a compass and a tripmeter, never with GPS.",
        charityGoal:
          "No-assistance stage: here the solidarity is between crews, towing and repairing whoever gets stuck.",
        note: "If you get lost, you get lost with the map in your hand.",
      },
      "etapa-06": {
        title: "Final run to the finish",
        description:
          "Up the Tizi n'Tichka and down into the Haouz to the finish in Marrakech. Last day out, with the cars already marked by the desert and the bodywork telling the story.",
        charityGoal:
          "Closing the books: counting what was delivered and signing it off with the receiving NGO.",
        note: "Finishing is the podium.",
      },
    },
    terrain: {
      asfalto: "Tarmac",
      pista: "Piste",
      dunas: "Dunes",
      gargantas: "Gorges",
      montana: "Mountain",
      ferry: "Ferry",
    },
    difficulty: {
      1: "Transit",
      2: "Easy",
      3: "Medium",
      4: "Hard",
      5: "Extreme",
    },
    summary: {
      title: "Route totals",
      stages: "Stages",
      days: "Expedition days",
      moroccoKm: "Kilometres in Morocco",
      approachKm: "Transfer to the start",
      oneWayKm: "One-way total",
      hardest: "Hardest stage",
      longest: "Longest stage",
    },
    disclaimer:
      "Estimated route. The official UniRaid roadbook isn't published until a few days before the start: distances and intermediate towns are the team's own forecast.",
    approachNote:
      "The run from basecamp down to the start line doesn't count as a stage: it's the transfer.",
    map: {
      title: "Route map",
      hint: "Hover over each stage",
      placeholder: "Route trace · Morocco",
      regionLabel: "Morocco",
      startLabel: "Start",
      finishLabel: "Finish",
      legendTitle: "Legend",
      legend: {
        road: "Road",
        track: "Piste",
        dune: "Dunes",
        ferry: "Ferry",
        checkpoint: "Checkpoint",
        start: "Start",
        finish: "Finish",
      },
      note: "Vector map hand-drawn by the team. Indicative trace — not for navigation.",
    },
    chronology: {
      waypoint: "[ 04 ]  CHRONOLOGY",
      title: ["FROM THE GARAGE", "TO THE START", "LINE"],
      sideLabel: "04 — CHRONOLOGY",
      phaseLabel: "Phase",
      phases: [
        {
          num: "01",
          title: "THE FLEET",
          desc: "Buying the Ford Escorts and the first shakedown runs.",
          status: "Completed",
          window: "2025",
        },
        {
          num: "02",
          title: "THE BUILD",
          desc: "Mechanics, protection and safety, weekend after weekend.",
          status: "In progress",
          window: "2026",
        },
        {
          num: "03",
          title: "SPONSORSHIPS",
          desc: "Closing the budget and filling the boot with aid supplies.",
          status: "Open",
          window: "2026",
        },
        {
          num: "04",
          title: "THE START LINE",
          desc: "Heading for Morocco with the whole convoy.",
          status: "Pending",
          window: "{edition}",
        },
      ],
    },
  },

  /* ─────────────────────────── CA ─────────────────────────── */
  ca: {
    waypoint: "[ 03 ]  LA RUTA",
    title: ["EL ROADBOOK", "DE TARIFA", "A MARRÀQUEIX"],
    intro:
      "{stages} etapes, {days} dies i {km} de Marroc de nord a sud. Del precinte del material al port de Tarifa fins a la meta al peu de l'Atles, passant pel mar de dunes de l'Erg Chebbi.",
    sideLabel: "03 — LA RUTA",
    table: {
      index: "#",
      code: "Codi",
      stage: "Etapa",
      leg: "Tram",
      terrain: "Terreny",
      difficulty: "Dificultat",
      km: "KM",
      days: "Dies",
      charity: "Missió solidària",
      total: "Total",
      expand: "Veure l'etapa",
      collapse: "Tancar l'etapa",
    },
    stages: {
      "etapa-01": {
        title: "Sortida i verificacions tècniques",
        description:
          "Jornada de verificacions al port de Tarifa: extintors, arnesos, cobrecàrter i documentació. Travessa de l'Estret en ferri i primer contacte amb el Marroc en baixar la rampa.",
        charityGoal:
          "Pesatge i precinte de la càrrega solidària: llibres, material escolar i roba repartits entre els quatre cotxes abans d'embarcar.",
        note: "El rally comença amb un segell de duana, no amb una banderada.",
      },
      "etapa-02": {
        title: "Travessa del Gran Atles",
        description:
          "Enllaç llarg cap a l'interior per Fes i Midelt, amb el pas del Gran Atles pel Tizi n'Talghomt. Colls d'alta muntanya, el termòmetre caient i el primer dia de debò al volant.",
        charityGoal:
          "Contacte amb l'ONG local i tancament dels punts d'entrega a les valls del sud.",
        note: "Aquí es descobreix quin cotxe s'escalfa i quin copilot sap llegir un mapa.",
      },
      "etapa-03": {
        title: "Desert profund i dunes de l'Erg Chebbi",
        description:
          "L'etapa reina. Pista ràpida fins a Erfoud i entrada a l'Erg Chebbi: cordons de duna, navegació a rumb i sorra tova. És on es decideix quins cotxes arriben sencers al final.",
        charityGoal:
          "Repartiment d'aigua i material sanitari bàsic als campaments nòmades de la vora de l'erg.",
        note: "Sorra tova, pressió de pneumàtics baixa i molta pala.",
      },
      "etapa-04": {
        title: "Entrega del material solidari",
        description:
          "La jornada més curta en quilòmetres i la més important del viatge. Pistes de terra entre pobles berbers del Draa, amb parada a les escoles rurals per descarregar en mà el que es va carregar a Tarifa.",
        charityGoal:
          "Nucli solidari del rally: material escolar i esportiu entregat directament a les aules.",
        note: "El dia pel qual existeix tota la resta.",
      },
      "etapa-05": {
        title: "Etapa marató de navegació",
        description:
          "Marató: sense assistència exterior i amb el roadbook tancat. Pistes de Nekob i Agdz, guals secs del Draa i gorges estretes. Es navega amb brúixola i comptaquilòmetres, mai amb GPS.",
        charityGoal:
          "Etapa sense assistència: aquí la solidaritat és entre equips, remolcant i reparant qui es queda.",
        note: "Si et perds, et perds amb el mapa a la mà.",
      },
      "etapa-06": {
        title: "Tancament i meta",
        description:
          "Pujada al Tizi n'Tichka i baixada al Haouz fins a la meta a Marràqueix. Última jornada, amb els cotxes ja marcats pel desert i la xapa explicant el viatge.",
        charityGoal:
          "Balanç de l'entrega: recompte del material repartit i acta signada amb l'ONG receptora.",
        note: "Arribar és el podi.",
      },
    },
    terrain: {
      asfalto: "Asfalt",
      pista: "Pista",
      dunas: "Dunes",
      gargantas: "Gorges",
      montana: "Muntanya",
      ferry: "Ferri",
    },
    difficulty: {
      1: "Enllaç",
      2: "Fàcil",
      3: "Mitjana",
      4: "Dura",
      5: "Extrema",
    },
    summary: {
      title: "Totals del recorregut",
      stages: "Etapes",
      days: "Dies d'expedició",
      moroccoKm: "Quilòmetres al Marroc",
      approachKm: "Enllaç fins a la sortida",
      oneWayKm: "Total d'anada",
      hardest: "Etapa més dura",
      longest: "Etapa més llarga",
    },
    disclaimer:
      "Recorregut estimat. El roadbook oficial de l'UniRaid no es publica fins pocs dies abans de la sortida: els quilometratges i les localitats intermèdies són la previsió de l'equip.",
    approachNote:
      "El trajecte des del campament base fins a la línia de sortida no puntua com a etapa: és l'enllaç previ.",
    map: {
      title: "Mapa de la ruta",
      hint: "Passa el cursor per cada etapa",
      placeholder: "Traçat de la ruta · Marroc",
      regionLabel: "Marroc",
      startLabel: "Sortida",
      finishLabel: "Meta",
      legendTitle: "Llegenda",
      legend: {
        road: "Carretera",
        track: "Pista",
        dune: "Dunes",
        ferry: "Ferri",
        checkpoint: "Control",
        start: "Sortida",
        finish: "Meta",
      },
      note: "Mapa vectorial dibuixat a mà per l'equip. Traçat orientatiu, no apte per navegar.",
    },
    chronology: {
      waypoint: "[ 04 ]  CRONOLOGIA",
      title: ["DEL GARATGE", "A LA LÍNIA", "DE SORTIDA"],
      sideLabel: "04 — CRONOLOGIA",
      phaseLabel: "Fase",
      phases: [
        {
          num: "01",
          title: "LA FLOTA",
          desc: "Compra dels Ford Escort i primeres proves de carretera.",
          status: "Completat",
          window: "2025",
        },
        {
          num: "02",
          title: "LA PREPARACIÓ",
          desc: "Mecànica, proteccions i seguretat, cap de setmana rere cap de setmana.",
          status: "En curs",
          window: "2026",
        },
        {
          num: "03",
          title: "PATROCINIS",
          desc: "Tancar el pressupost i omplir el maleter de material solidari.",
          status: "Obert",
          window: "2026",
        },
        {
          num: "04",
          title: "LA SORTIDA",
          desc: "Rumb al Marroc amb el comboi complet.",
          status: "Pendent",
          window: "{edition}",
        },
      ],
    },
  },
};
