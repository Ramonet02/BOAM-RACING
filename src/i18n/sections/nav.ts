/**
 * i18n · NAV — navbar, mobile menu and skip link.
 *
 * Owner: i18n. Consumers: `Navbar`, `LanguageSwitcher`.
 * Access from a component: `const t = useT(); t.nav.sponsorCta`
 *
 * `home`/`team`/`sponsorship`/`media`/`sponsorCta` are the keys the
 * current `Navbar` already consumes — do not rename them. The rest are
 * additions for the in-page anchors and the mobile drawer.
 *
 * There is no edition badge here on purpose: the date belongs to
 * `t.common.edition.monthYearShort` ("FEB 2027"), whose canonical value
 * is `EDITION` in `src/lib/constants.ts`.
 */

import type { LocalizedSection } from "./_shared";

export interface NavSection {
  /* Primary links */
  home: string;
  project: string;
  car: string;
  route: string;
  team: string;
  sponsorship: string;
  media: string;
  contact: string;
  /* Primary action */
  sponsorCta: string;
  /* Mobile drawer */
  menu: { open: string; close: string; label: string };
  /* Micro-copy around the logo and inside the open drawer */
  languageLabel: string;
  skipToContent: string;
  /** Short state line of the navbar HUD. */
  statusLine: string;
}

export const nav: LocalizedSection<NavSection> = {
  es: {
    home: "Inicio",
    project: "El Proyecto",
    car: "Los Coches",
    route: "La Ruta",
    team: "El Equipo",
    sponsorship: "Patrocinio",
    media: "Media",
    contact: "Contacto",
    sponsorCta: "Patrocinar",
    menu: { open: "Menú", close: "Cerrar", label: "Menú principal" },
    languageLabel: "Idioma",
    skipToContent: "Saltar al contenido",
    statusLine: "BOAM RACING · EN PREPARACIÓN",
  },
  en: {
    home: "Home",
    project: "The Project",
    car: "The Cars",
    route: "The Route",
    team: "The Team",
    sponsorship: "Sponsorship",
    media: "Media",
    contact: "Contact",
    sponsorCta: "Sponsor us",
    menu: { open: "Menu", close: "Close", label: "Main menu" },
    languageLabel: "Language",
    skipToContent: "Skip to content",
    statusLine: "BOAM RACING · IN PREPARATION",
  },
  ca: {
    home: "Inici",
    project: "El Projecte",
    car: "Els Cotxes",
    route: "La Ruta",
    team: "L'Equip",
    sponsorship: "Patrocini",
    media: "Media",
    contact: "Contacte",
    sponsorCta: "Patrocina'ns",
    menu: { open: "Menú", close: "Tancar", label: "Menú principal" },
    languageLabel: "Idioma",
    skipToContent: "Salta al contingut",
    statusLine: "BOAM RACING · EN PREPARACIÓ",
  },
};
