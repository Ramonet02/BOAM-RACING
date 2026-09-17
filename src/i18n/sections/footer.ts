/**
 * i18n · FOOTER — the closing "join the expedition" block and the legal bar.
 *
 * Owner: i18n. Consumer: `FooterSection`.
 * Access from a component: `const t = useT(); t.footer.ctaPrimary`
 *
 * This section used to be hardcoded in English inside `FooterSection`,
 * and the copyright line still said "UNIRAID TEAM". It now says BOAM
 * RACING, which is the team; UniRaid is only the rally.
 *
 * The email address, the social URLs and the basecamp coordinates are
 * DATA (`src/lib/constants.ts`) — only their labels live here. The
 * copyright year is composed in the component:
 *   `© {year} {t.common.brand.name} · {t.footer.rights}`
 *
 * `editionLine` carries the `{edition}` token: swap it for
 * `t.common.edition.monthYearShort` (or `.monthYear`). The date itself
 * belongs to `EDITION` in `src/lib/constants.ts`.
 */

import type { Lines, LocalizedSection } from "./_shared";

export interface FooterSection {
  waypoint: string;
  title: Lines;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaArrow: string;
  /** Link column headings. */
  columns: {
    explore: string;
    follow: string;
    contact: string;
    legal: string;
  };
  emailLabel: string;
  socialLabel: string;
  locationLabel: string;
  pressLabel: string;
  /** Bottom bar. */
  basecamp: string;
  editionLine: string;
  rights: string;
  madeBy: string;
  /** Optional mailing-list strip. */
  newsletter: {
    title: string;
    desc: string;
    placeholder: string;
    button: string;
    success: string;
    error: string;
    legal: string;
  };
  legal: {
    privacy: string;
    cookies: string;
    terms: string;
    credits: string;
  };
}

export const footer: LocalizedSection<FooterSection> = {
  es: {
    waypoint: "[ 08 ]  ÚNETE A LA EXPEDICIÓN",
    title: ["AYÚDANOS", "A CRUZAR", "EL DESIERTO"],
    description:
      "Buscamos patrocinadores, colaboradores y cómplices que crean en la aventura, en la cabezonería y en llegar hasta el final. Tu logo en nuestro coche. Tu marca en el desierto.",
    ctaPrimary: "Quiero patrocinar",
    ctaSecondary: "Escríbenos",
    ctaArrow: "→",
    columns: {
      explore: "Explorar",
      follow: "Síguenos",
      contact: "Contacto",
      legal: "Legal",
    },
    emailLabel: "Email",
    socialLabel: "Redes",
    locationLabel: "Base",
    pressLabel: "Prensa",
    basecamp: "CAMPAMENTO BASE · BARCELONA",
    editionLine: "BOAM RACING · UNIRAID {edition}",
    rights: "Todos los derechos reservados",
    madeBy: "Hecho en un garaje de Barcelona",
    newsletter: {
      title: "Cuaderno de bitácora",
      desc: "Un correo al mes con los avances del taller y, en {editionMonth}, las crónicas desde Marruecos.",
      placeholder: "tu@correo.com",
      button: "Apuntarme",
      success: "Listo. Nos leemos en el próximo parte.",
      error: "Ese correo no nos vale. Revísalo y vuelve a intentarlo.",
      legal: "Solo lo usamos para esto. Te das de baja cuando quieras.",
    },
    legal: {
      privacy: "Privacidad",
      cookies: "Cookies",
      terms: "Aviso legal",
      credits: "Créditos",
    },
  },

  en: {
    waypoint: "[ 08 ]  JOIN THE EXPEDITION",
    title: ["HELP US", "CROSS", "THE DESERT"],
    description:
      "We're looking for sponsors, partners and accomplices who believe in adventure, in stubbornness, and in making it all the way. Your logo on our car. Your brand in the desert.",
    ctaPrimary: "Become a sponsor",
    ctaSecondary: "Email us",
    ctaArrow: "→",
    columns: {
      explore: "Explore",
      follow: "Follow us",
      contact: "Contact",
      legal: "Legal",
    },
    emailLabel: "Email",
    socialLabel: "Social",
    locationLabel: "Base",
    pressLabel: "Press",
    basecamp: "BASECAMP · BARCELONA",
    editionLine: "BOAM RACING · UNIRAID {edition}",
    rights: "All rights reserved",
    madeBy: "Built in a garage in Barcelona",
    newsletter: {
      title: "Logbook",
      desc: "One email a month with progress from the workshop and, come {editionMonth}, dispatches from Morocco.",
      placeholder: "you@email.com",
      button: "Sign me up",
      success: "You're in. See you in the next dispatch.",
      error: "That address doesn't look right. Check it and try again.",
      legal: "We only use it for this. Unsubscribe whenever you like.",
    },
    legal: {
      privacy: "Privacy",
      cookies: "Cookies",
      terms: "Legal notice",
      credits: "Credits",
    },
  },

  ca: {
    waypoint: "[ 08 ]  UNEIX-TE A L'EXPEDICIÓ",
    title: ["AJUDA'NS", "A CREUAR", "EL DESERT"],
    description:
      "Busquem patrocinadors, col·laboradors i còmplices que creguin en l'aventura, en la tossuderia i en arribar fins al final. El teu logo al nostre cotxe. La teva marca al desert.",
    ctaPrimary: "Vull patrocinar",
    ctaSecondary: "Escriu-nos",
    ctaArrow: "→",
    columns: {
      explore: "Explorar",
      follow: "Segueix-nos",
      contact: "Contacte",
      legal: "Legal",
    },
    emailLabel: "Correu",
    socialLabel: "Xarxes",
    locationLabel: "Base",
    pressLabel: "Premsa",
    basecamp: "CAMPAMENT BASE · BARCELONA",
    editionLine: "BOAM RACING · UNIRAID {edition}",
    rights: "Tots els drets reservats",
    madeBy: "Fet en un garatge de Barcelona",
    newsletter: {
      title: "Quadern de bitàcola",
      desc: "Un correu al mes amb els avenços del taller i, al {editionMonth}, les cròniques des del Marroc.",
      placeholder: "tu@correu.com",
      button: "Apuntar-m'hi",
      success: "Fet. Ens llegim al proper comunicat.",
      error: "Aquest correu no ens serveix. Revisa'l i torna-ho a provar.",
      legal: "Només l'usem per a això. Et pots donar de baixa quan vulguis.",
    },
    legal: {
      privacy: "Privacitat",
      cookies: "Galetes",
      terms: "Avís legal",
      credits: "Crèdits",
    },
  },
};
