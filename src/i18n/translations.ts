/**
 * ════════════════════════════════════════════════════════════════════
 * BOAM RACING — translation dictionary (es / en / ca)
 * ════════════════════════════════════════════════════════════════════
 *
 * THIS FILE IS A COMPOSER, NOT A DICTIONARY.
 *
 * The copy itself lives in `src/i18n/sections/`, one file per section of
 * the site. This module stitches those sections together into the `Dict`
 * that `useT()` hands to components, and keeps the public API of the old
 * monolithic dictionary exactly as it was:
 *
 *     import { useT } from "@/i18n/LanguageProvider";
 *     const t = useT();
 *     t.nav.home        t.hero.title[0]      t.route.stages["etapa-03"]
 *
 * WHY IT IS SPLIT
 * ---------------
 * Several people (and several agents) edit the copy of different
 * sections at the same time. One file per section means they never touch
 * the same file and never collide. Adding copy is a two-step job:
 *
 *     1. edit (or create) `src/i18n/sections/<section>.ts`
 *     2. if it is a NEW section, add three lines here:
 *        the import, the `Dict` field and the line in `composeDict()`
 *
 * SECTION MAP
 * -----------
 *     sections/_shared.ts   infrastructure (Locale, helper types) — not copy
 *     sections/nav.ts       navbar, mobile drawer, skip link
 *     sections/hero.ts      home hero
 *     sections/project.ts   01 · what the UniRaid is
 *     sections/car.ts       02 · the cars, specs, fleet
 *     sections/route.ts     03 · roadbook + map, 04 · chronology
 *     sections/team.ts      05 · crews + /equipo hero
 *     sections/sponsors.ts  06 · configurator, tiers, matrix + /patrocinio
 *     sections/media.ts     07 · gallery, video, socials + /media hero
 *     sections/footer.ts    08 · closing CTA, legal bar
 *     sections/common.ts    shared: brand, edition, actions, HUD, a11y, meta
 *
 * TYPE SAFETY
 * -----------
 * Every section is annotated `LocalizedSection<XSection>`, so TypeScript
 * fails the build when a locale is missing a key, adds an unknown one,
 * or changes a type. Fixed-length lists (chronology phases, pillars,
 * gallery frames…) are tuples, so a locale cannot ship a different
 * number of rows either, and everything indexed by an id from
 * `src/lib/**` (tier ids, car views, terrain types, stage ids, body
 * zones) is a `Record` over that exact union — rename an id in the data
 * layer and this build fails until the labels follow.
 *
 * ┌── COPY vs DATA — the rule that keeps this dictionary honest ──────┐
 * │ No figure that another module owns is ever written in            │
 * │ `src/i18n/**`:                                                    │
 * │                                                                   │
 * │     prices, slots, tiers, matrix  → src/lib/sponsors.ts           │
 * │     kilometres, days, stages      → src/lib/route.ts              │
 * │     edition date, coordinates     → src/lib/constants.ts          │
 * │     crews and cars                → src/lib/team.ts               │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * Where prose needs a figure inline, the section writes a TOKEN and this
 * file fills it in — once, at module load — from the canonical source:
 *
 *     {edition}       → t.common.edition.monthYear       "Febrero de 2027"
 *     {editionInline} → t.common.edition.monthYearInline "febrero de 2027"
 *     {editionMonth}  → t.common.edition.month           "febrero"
 *     {km}       → ROUTE_SUMMARY.moroccoKm, grouped for the locale
 *     {days}     → ROUTE_SUMMARY.totalDays
 *     {stages}   → ROUTE_SUMMARY.totalStages
 *     {cars}     → FLEET_SIZE   (src/lib/team.ts)
 *     {crew}     → TEAM_SIZE    (src/lib/team.ts)
 *
 * Those two modules are imported directly rather than through
 * `src/lib/constants.ts` on purpose: the dictionary ships in the client
 * bundle, and `route.ts` / `team.ts` pull in nothing but types, while
 * `constants.ts` re-exports the whole data layer.
 *
 * So components never have to know about tokens: `t.hero.tag` already
 * reads "Rally solidario · Marruecos · Febrero de 2027", and the day the
 * organiser moves a stage, every sentence in three languages follows.
 *
 * Tokens that are NOT global — `{n}` in `t.sponsors.availability.*`,
 * which depends on the tier being rendered — are left untouched by the
 * resolver; fill those at the call site with `fill()`, exported below.
 *
 * EDITORIAL RULES
 * ---------------
 *   • The team is BOAM RACING. UniRaid is only the rally it competes in.
 *   • The edition is FEBRUARY 2027, and it is written in exactly one
 *     place per language: `common.edition`.
 *   • Multi-line headlines are arrays, so each language picks its own
 *     line breaks.
 *   • Catalan is real Catalan, not Spanish with accents.
 */

import { ROUTE_SUMMARY } from "@/lib/route";
import { FLEET_SIZE, TEAM_SIZE } from "@/lib/team";

import { common, type CommonSection } from "./sections/common";
import { nav, type NavSection } from "./sections/nav";
import { hero, type HeroSection } from "./sections/hero";
import { project, type ProjectSection } from "./sections/project";
import { car, type CarSection } from "./sections/car";
import { route, type RouteSection } from "./sections/route";
import { team, type TeamSection } from "./sections/team";
import { sponsors, type SponsorsSection } from "./sections/sponsors";
import { media, type MediaSection } from "./sections/media";
import { footer, type FooterSection } from "./sections/footer";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LABELS,
  LOCALE_META,
  type Locale,
} from "./sections/_shared";

/* ── Public locale API (unchanged) ─────────────────────────────────── */

export type { Locale };
export { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE, LOCALE_META };

/* ── Re-exported helper types, for components that type their props ── */

export type { Lines, LocalizedSection, PageHero } from "./sections/_shared";
export type {
  CommonSection,
  NavSection,
  HeroSection,
  ProjectSection,
  CarSection,
  RouteSection,
  TeamSection,
  SponsorsSection,
  MediaSection,
  FooterSection,
};
export type { ProjectPillar } from "./sections/project";
export type { CarSpec, CarPrepItem } from "./sections/car";
export type {
  RouteStageId,
  RouteStageCopy,
  RoutePhase,
  TerrainKey,
  DifficultyKey,
} from "./sections/route";
export type {
  SponsorTierKey,
  SponsorSlotStatusKey,
  VisibilityKey,
  SponsorZoneId,
  MatrixRowKey,
  MatrixRow,
  SponsorBenefit,
  SponsorStep,
  SponsorFaq,
} from "./sections/sponsors";
export type {
  MediaGalleryItem,
  MediaVideoItem,
  MediaSocialItem,
} from "./sections/media";

/* ── The composed dictionary ───────────────────────────────────────── */

/**
 * Shape of one language's content: the union of every section.
 * All three locales conform to it, enforced section by section.
 */
export interface Dict {
  nav: NavSection;
  hero: HeroSection;
  project: ProjectSection;
  car: CarSection;
  route: RouteSection;
  team: TeamSection;
  sponsors: SponsorsSection;
  media: MediaSection;
  footer: FooterSection;
  common: CommonSection;
}

/** Picks one locale out of every section and assembles the `Dict`. */
function composeDict(locale: Locale): Dict {
  return {
    nav: nav[locale],
    hero: hero[locale],
    project: project[locale],
    car: car[locale],
    route: route[locale],
    team: team[locale],
    sponsors: sponsors[locale],
    media: media[locale],
    footer: footer[locale],
    common: common[locale],
  };
}

/* ── Token resolution ──────────────────────────────────────────────── */

/** Values a `{token}` can be replaced with. */
export type TokenValues = Readonly<Record<string, string | number>>;

/**
 * Fills the `{token}` placeholders of a dictionary string.
 *
 *     fill(t.sponsors.availability.slots, { n: tier.slots })
 *
 * Unknown tokens are left untouched, so a typo shows up in the page as
 * `{tpyo}` instead of silently printing "undefined".
 */
export function fill(template: string, values: TokenValues): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Groups thousands the way each language writes them — "1.885" in
 * Spanish and Catalan, "1,885" in English.
 *
 * Done by hand instead of with `Intl` on purpose: `toLocaleString` can
 * disagree between the Node build and the browser (different ICU data),
 * and a mismatch inside rendered copy is a hydration error.
 */
function groupThousands(value: number, separator: string): string {
  const digits = String(Math.round(Math.abs(value)));
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += separator;
    out += digits[i];
  }
  return value < 0 ? `-${out}` : out;
}

/** The global tokens, resolved for one locale from the canonical data. */
function tokensFor(locale: Locale, composed: Dict): TokenValues {
  const separator = locale === "en" ? "," : ".";
  return {
    edition: composed.common.edition.monthYear,
    editionInline: composed.common.edition.monthYearInline,
    editionMonth: composed.common.edition.month,
    km: `${groupThousands(ROUTE_SUMMARY.moroccoKm, separator)} km`,
    days: ROUTE_SUMMARY.totalDays,
    stages: ROUTE_SUMMARY.totalStages,
    cars: FLEET_SIZE,
    crew: TEAM_SIZE,
  };
}

/**
 * Walks a composed `Dict` and fills every global token it finds, keeping
 * the shape (and therefore the type) untouched: objects stay objects,
 * tuples stay tuples of the same length, `null` cells of the sponsorship
 * matrix stay `null`.
 */
function resolveDeep<T>(value: T, values: TokenValues): T {
  if (typeof value === "string") {
    return (value.includes("{") ? fill(value, values) : value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveDeep(item, values)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      out[key] = resolveDeep(source[key], values);
    }
    return out as T;
  }
  return value;
}

/** Composes a locale and resolves its tokens in one step. */
function buildDict(locale: Locale): Dict {
  const composed = composeDict(locale);
  return resolveDeep(composed, tokensFor(locale, composed));
}

/** The full dictionary, one entry per locale. Consumed by `LanguageProvider`. */
export const dict: Record<Locale, Dict> = {
  es: buildDict("es"),
  en: buildDict("en"),
  ca: buildDict("ca"),
};
