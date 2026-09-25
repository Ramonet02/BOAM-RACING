"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Contenido de la página 404
   --------------------------------------------------------------------------
   Tres salidas, en el orden en que las busca quien llega perdido: volver al
   inicio, ir a patrocinio (el objetivo de la web) o bajarse el dossier. El
   copy es `t.common.errors.notFound`, que ya existía en los tres idiomas.
   ══════════════════════════════════════════════════════════════════════════ */

import Link from "next/link";

import DossierLink from "@/components/ui/DossierLink";
import { useDocumentTitle } from "@/components/ui/LocalizedTitle";
import { useT } from "@/i18n/LanguageProvider";
import { BRAND } from "@/lib/constants";

export default function NotFoundView() {
  const t = useT();
  const copy = t.common.errors.notFound;

  /* El servidor titula la pestaña en castellano; aquí se pone en el idioma
     activo, igual que hace <LocalizedTitle> con el resto de páginas. */
  useDocumentTitle(`${copy.title} · ${BRAND.name}`);

  return (
    <section className="relative flex min-h-[72vh] items-center overflow-hidden pt-28 pb-20">
      <div aria-hidden="true" className="grid-blueprint grid-fade pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-12">
        <p className="waypoint-tag mb-6">[ 404 ]</p>
        <h1 className="font-heading text-text-primary text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] font-bold tracking-wide uppercase">
          {copy.title}
        </h1>
        <p className="font-body text-text-secondary mt-6 max-w-xl text-base leading-relaxed">
          {copy.desc}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/" className="btn-tactical btn-amber">
            {copy.cta}
          </Link>
          <Link href="/patrocinio#configurador" className="btn-tactical btn-outline">
            {t.nav.sponsorCta}
          </Link>
        </div>
        <DossierLink className="mt-6" />
      </div>
    </section>
  );
}
