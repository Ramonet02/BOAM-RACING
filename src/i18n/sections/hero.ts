/**
 * i18n · HERO — the full-bleed opening block of the home page.
 *
 * Owner: i18n. Consumer: `HeroSection`.
 * Access from a component: `const t = useT(); t.hero.title.map(...)`
 *
 * `title` is a `Lines` array so each language breaks the headline where
 * it reads best.
 *
 * NUMBERS AND DATES ARE NOT WRITTEN HERE.
 *   • `{edition}` / `{editionInline}` → `t.common.edition.*`.
 *   • `{crew}`, `{cars}` → `PROJECT_FACTS.teamSize` / `.fleetSize`.
 *   • The HUD prints `HERO_COORDS.dms` from `src/lib/constants.ts`; this
 *     file only owns the LABELS around it.
 *   • The four counters under the copy are labels only: the figures come
 *     from `COUNTERS` / `ROUTE_SUMMARY`.
 */

import type { Lines, LocalizedSection } from "./_shared";

export interface HeroSection {
  /** Small tag above the headline. Uses the `{edition}` token. */
  tag: string;
  /** Headline, one entry per rendered line. */
  title: Lines;
  /** Body copy. Uses `{crew}`, `{cars}` and `{edition}` tokens. */
  description: string;
  cta: string;
  /** Kept as copy so a text arrow can differ per language. */
  ctaArrow: string;
  secondaryCta: string;
  /** Labels of the four counters under the copy (values live in code). */
  stats: { cars: string; drivers: string; distance: string; days: string };
  scroll: string;
  /** Uses the `{edition}` token. */
  expedition: string;
  /** Corner HUD overlay of the "Rally Desert Tactical" hero. */
  hud: {
    coordsLabel: string;
    altitudeLabel: string;
    headingLabel: string;
    headingValue: string;
    statusLabel: string;
    statusValue: string;
  };
  /** Scrolling ticker strip. Free length — it just loops. */
  marquee: readonly string[];
  /** Alt text for the hero background placeholder. */
  imageAlt: string;
}

export const hero: LocalizedSection<HeroSection> = {
  es: {
    tag: "Rally solidario · Marruecos · {edition}",
    title: ["OCHO DE NOSOTROS.", "CUATRO COCHES.", "UN RAID."],
    description:
      "Somos {crew} amigos de Barcelona repartidos en {cars} coches que ya pasan de los veinte años. En {editionInline} cruzamos Marruecos en un rally solidario, sin GPS ni asistencia, con el maletero cargado de material para las escuelas y los pueblos del camino.",
    cta: "Conoce el proyecto",
    ctaArrow: "→",
    secondaryCta: "Quiero patrocinar",
    stats: {
      cars: "Coches",
      drivers: "Pilotos",
      distance: "En Marruecos",
      days: "Días",
    },
    scroll: "Scroll",
    expedition: "Expedición · {edition}",
    hud: {
      coordsLabel: "GPS",
      altitudeLabel: "ALT",
      headingLabel: "RUMBO",
      headingValue: "SUR",
      statusLabel: "Estado",
      statusValue: "En preparación",
    },
    marquee: [
      "BOAM RACING",
      "SIN GPS",
      "SIN ASISTENCIA",
      "RUMBO SUR",
      "MARRUECOS",
      "MATERIAL SOLIDARIO",
    ],
    imageAlt:
      "Ford Escort de BOAM RACING al amanecer sobre una pista de tierra del desierto marroquí",
  },

  en: {
    tag: "Charity rally · Morocco · {edition}",
    title: ["EIGHT OF US.", "FOUR CARS.", "ONE RAID."],
    description:
      "We're {crew} friends from Barcelona, split between {cars} cars that are already past the twenty-year mark. In {editionInline} we cross Morocco in a charity rally — no GPS, no support crew — with the boot loaded with supplies for the schools and villages along the way.",
    cta: "Discover the project",
    ctaArrow: "→",
    secondaryCta: "Become a sponsor",
    stats: {
      cars: "Cars",
      drivers: "Drivers",
      distance: "In Morocco",
      days: "Days",
    },
    scroll: "Scroll",
    expedition: "Expedition · {edition}",
    hud: {
      coordsLabel: "GPS",
      altitudeLabel: "ALT",
      headingLabel: "HEADING",
      headingValue: "SOUTH",
      statusLabel: "Status",
      statusValue: "In preparation",
    },
    marquee: [
      "BOAM RACING",
      "NO GPS",
      "NO SUPPORT",
      "HEADING SOUTH",
      "MOROCCO",
      "AID CARGO",
    ],
    imageAlt:
      "BOAM RACING's Ford Escort at sunrise on a dirt track in the Moroccan desert",
  },

  ca: {
    tag: "Rally solidari · Marroc · {edition}",
    title: ["VUIT DE NOSALTRES.", "QUATRE COTXES.", "UN RAID."],
    description:
      "Som {crew} amics de Barcelona repartits en {cars} cotxes que ja passen dels vint anys. El {editionInline} creuem el Marroc en un rally solidari, sense GPS ni assistència, amb el maleter carregat de material per a les escoles i els pobles del camí.",
    cta: "Coneix el projecte",
    ctaArrow: "→",
    secondaryCta: "Vull patrocinar",
    stats: {
      cars: "Cotxes",
      drivers: "Pilots",
      distance: "Al Marroc",
      days: "Dies",
    },
    scroll: "Scroll",
    expedition: "Expedició · {edition}",
    hud: {
      coordsLabel: "GPS",
      altitudeLabel: "ALT",
      headingLabel: "RUMB",
      headingValue: "SUD",
      statusLabel: "Estat",
      statusValue: "En preparació",
    },
    marquee: [
      "BOAM RACING",
      "SENSE GPS",
      "SENSE ASSISTÈNCIA",
      "RUMB SUD",
      "MARROC",
      "MATERIAL SOLIDARI",
    ],
    imageAlt:
      "Ford Escort de BOAM RACING a trenc d'alba sobre una pista de terra del desert marroquí",
  },
};
