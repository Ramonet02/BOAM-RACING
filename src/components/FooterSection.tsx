"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <FooterSection />
   Cierre de todas las paginas: CTA de patrocinio + barra legal.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   QUE SE ARREGLA AQUI
   -------------------
   1. i18n. Estaba escrito a mano en ingles ("HELP US REACH THE FINISH LINE",
      "Become a Sponsor"...). Ahora TODO el copy sale de `t.footer`, que
      existe en es/en/ca.
   2. Numeracion. Rotulaba "[ 04 ]", el mismo indice que la cronologia. El
      indice ya no se escribe aqui: es `t.footer.waypoint` -> "[ 08 ]", el
      ultimo de la serie unica del sitio (01 proyecto · 02 coches · 03 ruta ·
      04 cronologia · 05 equipo · 06 patrocinio · 07 media · 08 footer).
   3. Copyright. Decia "© 2026 UNIRAID TEAM": ano congelado y marca erronea.
      Ahora el ano se DERIVA (`new Date().getFullYear()`) y la marca es
      BOAM RACING, tomada de `BRAND`. La edicion del rally es un dato
      aparte (`t.footer.editionLine`, que resuelve a FEBRERO 2027 desde
      `EDITION`), porque el ano de copyright y el ano de la edicion son
      cosas distintas.
   4. Tema: ni un color fijo. El cierre se construye con tokens
      (bg-bg-base + border-slate + rejilla de plano + polvo + hairline
      ambar), asi que es negro en tactical y crema en desert sin una sola
      rama en el codigo. Se mantiene a proposito el MISMO fondo que la
      pagina —no un bloque mas oscuro—: lo que cierra la pagina es el filo
      superior (border + linea ambar) y la rejilla, no un cambio de color.
   5. Email, redes y coordenadas del campamento base son DATO
      (`CONTACT`, `SOCIALS`, `BASECAMP`), no cadenas sueltas. Los iconos "YT"
      inventados desaparecen: solo se listan los perfiles que existen.

   6. Creditos fotograficos: de `t.footer.legal` solo se pinta `credits`,
      como bloque plegable con las fotos de `getCreditedImages()` (paisajes
      de Wikimedia Commons que exigen atribucion).

   Lo que NO se pinta, y por que: el resto de la columna legal y el
   formulario de newsletter (`t.footer.newsletter`) siguen traducidos en el
   diccionario pero no se renderizan, porque no hay ni paginas legales ni
   endpoint de suscripcion. Enlazar a un 404 o a un formulario que no envia
   es peor que no ponerlo. En cuanto existan, se cuelgan de estas claves.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import Link from "next/link";

import DossierLink from "@/components/ui/DossierLink";
import { useT } from "@/i18n/LanguageProvider";
import { BASECAMP, BRAND, CONTACT, SOCIALS } from "@/lib/constants";
import { getCreditedImages } from "@/lib/imagery";

/** Etiqueta corta de cada red, para el rotulo monoespaciado. */
const SOCIAL_SHORT: Record<string, string> = {
  instagram: "IG",
  tiktok: "TK",
  linkedin: "IN",
  youtube: "YT",
};

export default function FooterSection() {
  const t = useT();
  const year = new Date().getFullYear();
  const credited = getCreditedImages();

  const exploreLinks = [
    { label: t.nav.project, href: "/#proyecto" },
    { label: t.nav.route, href: "/#ruta" },
    { label: t.nav.team, href: "/equipo" },
    { label: t.nav.sponsorship, href: "/patrocinio" },
    { label: t.nav.media, href: "/media" },
  ];

  return (
    <footer id="contacto" className="relative w-full overflow-hidden bg-bg-base border-t border-slate">
      {/* Capas de fondo */}
      <div aria-hidden className="absolute inset-0 grid-blueprint grid-fade-y opacity-60 pointer-events-none" />
      <div aria-hidden className="absolute inset-0 dust-overlay dust-overlay-soft pointer-events-none" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--color-amber) 22%, transparent 55%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-10">
        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <span className="waypoint-tag block mb-6">{t.footer.waypoint}</span>

        <div className="divider-tech mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          <div className="lg:col-span-7">
            <h2 className="font-heading text-[clamp(2.5rem,6.5vw,5.5rem)] text-text-primary leading-[0.9] tracking-[2px] uppercase mb-7">
              {t.footer.title.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <p className="font-body text-[0.9375rem] md:text-base text-text-secondary leading-[1.75] max-w-[560px] mb-9">
              {t.footer.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/patrocinio#configurador" className="btn-tactical btn-amber">
                {t.footer.ctaPrimary}
                <span aria-hidden>{t.footer.ctaArrow}</span>
              </Link>
              <a href={CONTACT.mailto} className="btn-tactical btn-outline">
                {t.footer.ctaSecondary}
              </a>
            </div>

            {/* El dossier, siempre a mano desde el pie: es el documento que
                pide una empresa que llega a la web sin pasar por /patrocinio. */}
            <div className="mt-5">
              <DossierLink />
            </div>
          </div>

          {/* ── Columnas de datos ──────────────────────────────────────── */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pt-4">
            <nav aria-label={t.footer.columns.explore} className="flex flex-col gap-3">
              <span className="telemetry-label telemetry-label-sand">{t.footer.columns.explore}</span>
              <ul className="flex flex-col gap-2">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="touch-target font-body text-sm text-text-secondary hover:text-amber-text transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-col gap-3">
              <span className="telemetry-label telemetry-label-sand">{t.footer.columns.follow}</span>
              <ul className="flex flex-col gap-2">
                {SOCIALS.map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="touch-target font-body text-sm text-text-secondary hover:text-amber-text transition-colors inline-flex items-center gap-2"
                    >
                      <span className="font-mono text-[0.6875rem] text-text-tertiary tracking-[2px]">
                        {SOCIAL_SHORT[social.platform] ?? social.platform.slice(0, 2).toUpperCase()}
                      </span>
                      {social.handle}
                      <span className="sr-only"> ({t.common.a11y.externalLink})</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
              <span className="telemetry-label telemetry-label-sand">{t.footer.columns.contact}</span>
              <a
                href={CONTACT.mailto}
                className="touch-target font-body text-sm text-text-secondary hover:text-amber-text transition-colors break-all"
              >
                {CONTACT.email}
              </a>
              <span className="font-mono text-[0.6875rem] tracking-[2px] text-text-tertiary uppercase mt-2">
                {t.footer.locationLabel}
              </span>
              <p className="gps-label leading-[1.7]">
                {t.footer.basecamp}
                <br />
                {BASECAMP.dms}
              </p>
            </div>
          </div>
        </div>

        {/* ── Creditos fotograficos ────────────────────────────────────── */}
        {/* Los paisajes de Wikimedia Commons en CC BY / CC BY-SA exigen
            atribucion visible con autor, licencia y enlace a la ficha. Va
            plegado para que no le robe el cierre a la CTA. */}
        {credited.length > 0 && (
          <details className="mt-16 group">
            <summary className="touch-target telemetry-label telemetry-label-sand cursor-pointer list-none inline-flex items-center gap-2 hover:text-amber-text transition-colors">
              <span aria-hidden className="font-mono transition-transform group-open:rotate-90">›</span>
              {t.footer.legal.credits} · {credited.length}
            </summary>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1.5">
              {credited.map((entry) => (
                <li key={entry.id} className="font-mono text-[0.6875rem] leading-relaxed text-text-tertiary">
                  <span className="text-text-secondary">{entry.rally?.location ?? entry.alt}</span>
                  {" — "}
                  {entry.creditUrl ? (
                    <a
                      href={entry.creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="touch-target underline decoration-dotted underline-offset-2 hover:text-amber-text transition-colors"
                    >
                      {entry.credit}
                      <span className="sr-only"> ({t.common.a11y.externalLink})</span>
                    </a>
                  ) : (
                    entry.credit
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* ── Barra inferior ───────────────────────────────────────────── */}
        <div className={`${credited.length > 0 ? "mt-8" : "mt-16"} pt-6 border-t border-slate flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <span className="font-mono text-[0.6875rem] tracking-[3px] text-text-tertiary uppercase">
            &copy; {year} {BRAND.name} · {t.footer.rights}
          </span>
          <span className="font-mono text-[0.6875rem] tracking-[3px] text-text-tertiary uppercase text-center md:text-right">
            {t.footer.editionLine}
          </span>
          <span className="font-mono text-[0.6875rem] tracking-[3px] text-text-tertiary uppercase md:text-right">
            {t.footer.madeBy}
          </span>
        </div>
      </div>
    </footer>
  );
}
