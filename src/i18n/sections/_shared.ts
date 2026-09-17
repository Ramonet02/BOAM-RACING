/**
 * ════════════════════════════════════════════════════════════════════
 * BOAM RACING — i18n · shared infrastructure
 * ════════════════════════════════════════════════════════════════════
 *
 * Files in `src/i18n/sections/` that start with an underscore are
 * INFRASTRUCTURE, not content. Everything else in this folder is one
 * content section of the site (nav, hero, project, car, route, team,
 * sponsors, media, footer, common).
 *
 * WHY THE DICTIONARY IS SPLIT
 * ---------------------------
 * The dictionary used to be a single monolithic `translations.ts`. It is
 * now one file per section so that several agents / developers can work
 * on different parts of the site at the same time without ever touching
 * the same file. `translations.ts` is now only a *composer*: it stitches
 * the sections together and keeps the public API (`Dict`, `dict`,
 * `Locale`, `LOCALES`, `LOCALE_LABELS`, `DEFAULT_LOCALE`) unchanged.
 *
 * HOW TO ADD / EDIT COPY
 * ----------------------
 *   1. Open the section file you own (e.g. `sections/route.ts`).
 *   2. Add the key to its exported `*Section` interface.
 *   3. Fill it in for `es`, `en` AND `ca`. TypeScript fails the build if
 *      any locale is missing a key, has an extra one, or uses the wrong
 *      type — that is the whole point of the `LocalizedSection<T>`
 *      annotation on every section export.
 *   4. Nothing else to wire: `translations.ts` already composes it.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  THE ONE HARD RULE: COPY LIVES HERE, DATA DOES NOT.              │
 * └──────────────────────────────────────────────────────────────────┘
 * Never write a NUMBER that some module already owns:
 *
 *   • prices, sponsorship slot counts, tier ranks  → `src/lib/sponsors.ts`
 *   • kilometres, stage days, totals, coordinates  → `src/lib/route.ts`
 *   • the edition date, contact details, counters  → `src/lib/constants.ts`
 *   • crew members, cars                           → `src/lib/team.ts`
 *
 * If a figure is duplicated here it WILL drift the day the team changes
 * its rates or the organiser moves a stage. The dictionary therefore
 * ships labels, headings, prose and state words — and the component
 * interpolates the number next to them:
 *
 *     `${formatKm(ROUTE_SUMMARY.moroccoKm)} ${t.common.labels.inMorocco}`
 *
 * The one exception is prose that needs a figure inline. Those strings
 * carry a token the component replaces, never a literal:
 *
 *     t.project.p2.replace("{km}", formatKm(ROUTE_SUMMARY.moroccoKm))
 *
 * Every token used in this folder is `{km}`, `{days}`, `{stages}`,
 * `{cars}`, `{crew}` or `{edition}`. Nothing else.
 *
 * CONVENTIONS
 * -----------
 *   • Multi-line headlines are `Lines` (`readonly string[]`), never a
 *     string with `<br />`, so every language chooses its own breaks.
 *   • Fixed-size lists (chronology phases, pillars…) are typed as TUPLES
 *     so a locale cannot silently ship 3 items where the others ship 4.
 *   • Anything keyed by an id from `src/lib/**` (tier ids, terrain types,
 *     car views, stage ids) is typed as a `Record` over that exact union,
 *     so renaming an id in the data layer breaks the build here too.
 *   • Proper nouns (Ford Escort, Merzouga, BOAM RACING) keep their
 *     canonical form; only the spelling shifts where the language really
 *     differs (Marrakech / Marràqueix, 31°09'W / 31°09'O).
 *   • The team is BOAM RACING. "UniRaid" is only the name of the rally
 *     they compete in — never the brand.
 *   • The edition is FEBRUARY 2027. Its localized rendering lives in
 *     `common.edition`; use it instead of typing the date by hand.
 *   • Catalan is real Catalan, not Spanish with accents.
 */

/** The three locales the site ships. */
export type Locale = "es" | "en" | "ca";

/** Ordered list used by the language switcher. */
export const LOCALES: Locale[] = ["es", "en", "ca"];

/** Short labels shown in the ES · EN · CA switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  ca: "CA",
};

/** Locale rendered on the server and on the first client frame. */
export const DEFAULT_LOCALE: Locale = "es";

/**
 * BCP-47 / OpenGraph tags, for `<html lang>` and metadata.
 * Kept here so the composer and the layout agree on one source.
 *
 * Note: `src/lib/constants.ts` exposes `getEditionLabel(locale)` for
 * `"es" | "en"` only — Catalan has no entry there on purpose, because
 * the Catalan rendering of the date is COPY and belongs to
 * `common.edition.monthYear`.
 */
export const LOCALE_META: Record<Locale, { html: string; og: string }> = {
  es: { html: "es-ES", og: "es_ES" },
  en: { html: "en-GB", og: "en_GB" },
  ca: { html: "ca-ES", og: "ca_ES" },
};

/**
 * A section's content in every locale.
 *
 * Annotating a section export with this is what makes TypeScript
 * complain when a language is missing a key:
 *
 *   export const hero: LocalizedSection<HeroSection> = { es, en, ca };
 */
export type LocalizedSection<TShape> = Readonly<Record<Locale, TShape>>;

/**
 * A headline split into its display lines. The component joins them with
 * `<br />`, so each language controls where the line breaks fall.
 */
export type Lines = readonly string[];

/**
 * Hero block shared by the three sub-pages (/equipo, /patrocinio,
 * /media).
 *
 * `location` is the localized place name of the badge. The COORDINATES
 * are deliberately absent: they are data and live in `PAGE_COORDS`
 * (`src/lib/constants.ts`). Render them as
 *
 *     {t.common.labels.coords} · {PAGE_COORDS.equipo}
 */
export interface PageHero {
  title: string;
  subtitle: string;
  location: string;
}
