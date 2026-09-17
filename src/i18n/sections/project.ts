/**
 * i18n · PROJECT — "what the UniRaid is" editorial block (section 01).
 *
 * Owner: i18n. Consumers: `ProjectStory`, `ProjectSection`.
 * Access from a component: `const t = useT(); t.project.pillars[0].title`
 *
 * `waypoint` / `sideLabel` are the tactical index markers ("[ 01 ]").
 * `pillars` is a fixed trio (no GPS · no support · aid cargo) typed as a
 * tuple so no language can ship a different number of cards.
 *
 * TOKENS: `p2` carries `{km}` and `p3` / `stats.caption` carry
 * `{edition}`. Replace them with `formatKm(ROUTE_SUMMARY.moroccoKm)` and
 * `t.common.edition.monthYear` — never type the figure or the date.
 * `stats.*` are LABELS: the counters themselves come from `COUNTERS`.
 */

import type { Lines, LocalizedSection } from "./_shared";

export interface ProjectPillar {
  tag: string;
  title: string;
  desc: string;
}

export interface ProjectSection {
  waypoint: string;
  title: Lines;
  /** Body copy, three paragraphs. */
  p1: string;
  p2: string;
  p3: string;
  /** Two technical strips rendered as mono badges. */
  rules1: string;
  rules2: string;
  imageCaption: string;
  imageAlt: string;
  gpsLocation: string;
  sideLabel: string;
  pillars: readonly [ProjectPillar, ProjectPillar, ProjectPillar];
  /** Counter labels (the numbers themselves live in the component). */
  stats: {
    days: string;
    distance: string;
    villages: string;
    cars: string;
    caption: string;
  };
  quote: { text: string; author: string };
  cta: { label: string; note: string };
}

export const project: LocalizedSection<ProjectSection> = {
  es: {
    waypoint: "[ 01 ]  QUÉ ES EL UNIRAID",
    title: ["NI UNA CARRERA.", "NI TURISMO.", "UN RALLY", "CON SENTIDO."],
    p1: "El UniRaid es una travesía solidaria por Marruecos pensada para universitarios. Las reglas son sencillas: coches de al menos veinte años, sin GPS ni vehículos de apoyo, y el maletero lleno de material que se reparte en escuelas y comunidades del desierto a su paso.",
    p2: "Son {km} de Marruecos, del puerto de Tarifa a Marrakech: asfalto, puertos del Atlas, pistas de tierra y dunas. No hay podio. Al final, llegar es lo importante.",
    p3: "BOAM RACING sale en la edición de {editionInline}. Cuatro tripulaciones, cuatro Ford Escort comprados de segunda mano y una sola norma no escrita: ningún coche se queda atrás.",
    rules1: "REGLAS · SIN GPS · SIN ASISTENCIA · COCHES DE 20 AÑOS+",
    rules2: "CARGA · MATERIAL PARA ESCUELAS DEL DESIERTO",
    imageCaption: "ERG CHEBBI · MERZOUGA",
    imageAlt:
      "Dunas del Erg Chebbi al amanecer con las huellas de un coche cruzando la arena",
    gpsLocation: "Montañas del Atlas, Marruecos",
    sideLabel: "01 — QUÉ ES EL UNIRAID",
    pillars: [
      {
        tag: "NAVEGACIÓN",
        title: "SIN GPS",
        desc: "Mapa de papel, brújula y roadbook. Se navega como se navegaba, y a veces se falla como se fallaba.",
      },
      {
        tag: "MECÁNICA",
        title: "SIN ASISTENCIA",
        desc: "No hay camión escoba ni mecánico detrás. Lo que se rompe lo arreglamos nosotros al borde de la pista.",
      },
      {
        tag: "MISIÓN",
        title: "CARGA SOLIDARIA",
        desc: "Cada coche sale de España con el maletero lleno de material escolar y sanitario para repartir por el camino.",
      },
    ],
    stats: {
      days: "Días de rally",
      distance: "Kilómetros",
      villages: "Pueblos",
      cars: "Coches",
      caption: "Cifras del recorrido de la edición de {editionInline}.",
    },
    quote: {
      text: "No se gana nada por llegar antes. Solo por llegar.",
      author: "BOAM RACING",
    },
    cta: {
      label: "Ver la ruta",
      note: "Etapa por etapa, de Biarritz a Marrakech.",
    },
  },

  en: {
    waypoint: "[ 01 ]  WHAT THE UNIRAID IS",
    title: ["NOT A RACE.", "NOT TOURISM.", "A RALLY", "THAT MEANS SOMETHING."],
    p1: "The UniRaid is a charity drive across Morocco built for university students. The rules are simple: cars at least twenty years old, no GPS, no support vehicles, and a boot full of supplies handed out at schools and desert communities along the way.",
    p2: "It's {km} of Morocco, from the quay in Tarifa to Marrakech: tarmac, Atlas passes, dirt tracks and dunes. There's no podium. In the end, finishing is what matters.",
    p3: "BOAM RACING is on the start list for the {editionInline} edition. Four crews, four second-hand Ford Escorts and one unwritten rule: no car gets left behind.",
    rules1: "RULES · NO GPS · NO SUPPORT · 20YR+ CARS",
    rules2: "CARGO · SUPPLIES FOR DESERT SCHOOLS",
    imageCaption: "ERG CHEBBI · MERZOUGA",
    imageAlt:
      "Erg Chebbi dunes at sunrise with a car's tracks cutting across the sand",
    gpsLocation: "Atlas Mountains, Morocco",
    sideLabel: "01 — WHAT THE UNIRAID IS",
    pillars: [
      {
        tag: "NAVIGATION",
        title: "NO GPS",
        desc: "Paper map, compass and roadbook. You navigate the old way — and sometimes you get it wrong the old way too.",
      },
      {
        tag: "MECHANICS",
        title: "NO SUPPORT",
        desc: "No sweeper truck, no mechanic following behind. Whatever breaks, we fix it on the side of the track.",
      },
      {
        tag: "MISSION",
        title: "AID CARGO",
        desc: "Every car leaves Spain with a boot full of school and medical supplies to hand out along the route.",
      },
    ],
    stats: {
      days: "Rally days",
      distance: "Kilometres",
      villages: "Villages",
      cars: "Cars",
      caption: "Route figures for the {editionInline} edition.",
    },
    quote: {
      text: "Nobody wins for getting there first. Only for getting there.",
      author: "BOAM RACING",
    },
    cta: {
      label: "See the route",
      note: "Stage by stage, from Biarritz to Marrakech.",
    },
  },

  ca: {
    waypoint: "[ 01 ]  QUÈ ÉS L'UNIRAID",
    title: ["NI UNA CURSA.", "NI TURISME.", "UN RALLY", "AMB SENTIT."],
    p1: "L'UniRaid és una travessia solidària pel Marroc pensada per a universitaris. Les regles són senzilles: cotxes d'almenys vint anys, sense GPS ni vehicles d'assistència, i el maleter ple de material que es reparteix a escoles i comunitats del desert pel camí.",
    p2: "Són {km} de Marroc, del port de Tarifa fins a Marràqueix: asfalt, colls de l'Atles, pistes de terra i dunes. No hi ha podi. Al final, el que importa és arribar.",
    p3: "BOAM RACING surt a l'edició de {editionInline}. Quatre tripulacions, quatre Ford Escort comprats de segona mà i una sola norma no escrita: cap cotxe no es queda enrere.",
    rules1: "REGLES · SENSE GPS · SENSE ASSISTÈNCIA · COTXES DE 20 ANYS+",
    rules2: "CÀRREGA · MATERIAL PER A ESCOLES DEL DESERT",
    imageCaption: "ERG CHEBBI · MERZOUGA",
    imageAlt:
      "Dunes de l'Erg Chebbi a trenc d'alba amb les roderes d'un cotxe travessant la sorra",
    gpsLocation: "Muntanyes de l'Atles, Marroc",
    sideLabel: "01 — QUÈ ÉS L'UNIRAID",
    pillars: [
      {
        tag: "NAVEGACIÓ",
        title: "SENSE GPS",
        desc: "Mapa de paper, brúixola i roadbook. Es navega com es navegava, i de vegades s'erra com s'errava.",
      },
      {
        tag: "MECÀNICA",
        title: "SENSE ASSISTÈNCIA",
        desc: "No hi ha camió escombra ni mecànic al darrere. El que es trenca ho arreglem nosaltres a la vora de la pista.",
      },
      {
        tag: "MISSIÓ",
        title: "CÀRREGA SOLIDÀRIA",
        desc: "Cada cotxe surt d'Espanya amb el maleter ple de material escolar i sanitari per repartir pel camí.",
      },
    ],
    stats: {
      days: "Dies de rally",
      distance: "Quilòmetres",
      villages: "Pobles",
      cars: "Cotxes",
      caption: "Xifres del recorregut de l'edició de {editionInline}.",
    },
    quote: {
      text: "No es guanya res per arribar abans. Només per arribar.",
      author: "BOAM RACING",
    },
    cta: {
      label: "Veure la ruta",
      note: "Etapa a etapa, de Biarritz a Marràqueix.",
    },
  },
};
