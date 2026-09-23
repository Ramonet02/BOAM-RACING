"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <MediaSection />
   07 · Diario visual: galeria, video, redes y prensa.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Reescritura completa sobre el tema "Rally Desert Tactical".

   QUE HA CAMBIADO RESPECTO A LA VERSION ANTERIOR
   ----------------------------------------------
   · Fuera las seis fotos de stock externas (Modulo 6 de la spec prohibe el
     stock generico) y fuera el tema arena claro.
   · Fuera el copy escrito a mano en castellano (y el "6.200 km / 9 dias",
     que no existia en ningun dato): ahora todo sale de `useT()`, y las
     cifras llegan ya resueltas por el compositor de i18n.
   · La rejilla uniforme de seis huecos la sustituye <BentoGallery />, que
     consume el manifiesto de `src/lib/imagery.ts`.
   · Los enlaces de redes ya no son `href="#"`: salen de `SOCIALS`
     (`src/lib/constants.ts`). El canal que todavia no tiene perfil abierto
     se pinta como fila inerte marcada "proximamente", no como enlace muerto.
   · El video no tiene todavia material: se pinta como ficha pendiente, sin
     boton de reproducir que no reproduzca nada.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { ArrowUpRight, Mail, Play, Radio } from "lucide-react";
import BentoGallery from "@/components/gallery/BentoGallery";
import DossierLink from "@/components/ui/DossierLink";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useT } from "@/i18n/LanguageProvider";
import { CONTACT, PAGE_COORDS, SOCIALS } from "@/lib/constants";
import { getArchiveProgress } from "@/lib/imagery";

/**
 * URL real del canal, si el equipo ya lo tiene abierto.
 * La union entre el copy y el dato es el nombre del canal en minusculas
 * ("Instagram" -> platform "instagram"). `SOCIALS` es la unica fuente de
 * verdad de las direcciones.
 */
function socialUrl(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  return SOCIALS.find((profile) => profile.platform.toLowerCase() === key)?.url;
}

export default function MediaSection() {
  const t = useT();
  const archive = getArchiveProgress();

  return (
    <section
      id="media"
      className="dust-overlay relative w-full overflow-hidden bg-bg-base"
    >
      {/* Rejilla tecnica de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-blueprint grid-fade-y opacity-40"
      />

      <span aria-hidden="true" className="side-label absolute right-2 top-40 hidden xl:block">
        {t.media.sideLabel}
      </span>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-20 md:px-12 md:pt-28">
        {/* ── Cabecera de seccion ──────────────────────────────── */}
        <ScrollReveal className="mb-16 md:mb-20">
          <span className="waypoint-tag block">{t.media.waypoint}</span>

          <h2 className="mt-5 font-heading text-[clamp(2.75rem,7vw,6rem)] font-bold leading-[0.88] tracking-[0.02em] text-text-primary">
            {t.media.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-xl font-body text-base leading-[1.7] text-text-secondary">
              {t.media.intro}
            </p>

            {archive.pending > 0 && (
              <span className="tech-badge tech-badge-amber shrink-0 self-start lg:self-auto">
                <span className="status-dot" aria-hidden="true" />
                {t.common.placeholder.badge}
                <span className="tabular-nums text-text-secondary">
                  {archive.ready}/{archive.total}
                </span>
              </span>
            )}
          </div>
        </ScrollReveal>

        {/* ── Galeria bento ────────────────────────────────────── */}
        <BentoGallery className="mb-24 md:mb-32" />

        {/* ── Video ────────────────────────────────────────────── */}
        <div className="mb-24 md:mb-32">
          <span className="telemetry-label telemetry-label-amber telemetry-label-dash block">
            {t.media.videos.tag}
          </span>
          <h3 className="mt-4 font-heading text-2xl leading-tight tracking-[0.04em] text-text-primary sm:text-3xl">
            {t.media.videos.title}
          </h3>
          <hr className="divider-tech my-7" />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {t.media.videos.items.map((video) => (
              <figure
                key={video.label}
                className="panel scanline relative flex aspect-video flex-col justify-end overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 grid-blueprint-fine opacity-50"
                />

                {/* Marca de reproduccion: decorativa mientras no hay pieza */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
                >
                  <span className="chamfer-sm flex h-16 w-16 items-center justify-center border border-slate bg-bg-base/60 text-muted">
                    <Play size={20} strokeWidth={1.5} />
                  </span>
                </div>

                <span className="tech-badge tech-badge-lime absolute right-4 top-4 z-10">
                  {t.common.placeholder.videoPending}
                </span>

                {/* El marco es `aspect-video` fijo: a 375px son 184px de alto
                    y el pie se come casi todo. Se aprieta el padding en movil
                    para que la marca de reproduccion siga respirando. */}
                <figcaption className="relative z-10 border-t border-slate bg-bg-base/70 px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <span className="telemetry-label telemetry-label-amber block">
                        {video.label}
                      </span>
                      <h4 className="mt-1.5 truncate font-heading text-lg tracking-[0.04em] text-text-primary sm:mt-2 sm:text-xl">
                        {video.title}
                      </h4>
                      <p className="mt-1 line-clamp-2 font-body text-sm leading-relaxed text-text-secondary">
                        {video.desc}
                      </p>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className="telemetry-label block">
                        {t.media.videos.durationLabel}
                      </span>
                      <span className="mt-1 block font-mono text-sm tabular-nums text-sand">
                        {video.duration}
                      </span>
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
            {t.media.videos.empty}
          </p>
        </div>

        {/* ── Redes · bandas de frecuencia ─────────────────────── */}
        <div className="mb-24 md:mb-32">
          <span className="telemetry-label telemetry-label-amber telemetry-label-dash block">
            {t.media.socials.tag}
          </span>
          <h3 className="mt-4 font-heading text-2xl leading-tight tracking-[0.04em] text-text-primary sm:text-3xl">
            {t.media.socials.title}
          </h3>
          <hr className="divider-tech my-7" />

          <ul className="flex flex-col border-t border-slate">
            {t.media.socials.items.map((social, index) => {
              const url = socialUrl(social.name);
              const order = String(index + 1).padStart(2, "0");

              const body = (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 top-0 w-[3px] origin-top scale-y-0 bg-amber transition-transform duration-300 ease-tactical group-hover:scale-y-100 group-focus-visible:scale-y-100"
                  />

                  <span className="flex min-w-0 flex-1 items-center gap-4 pl-4 sm:gap-6">
                    <span className="telemetry-label shrink-0 tabular-nums">
                      {order}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-heading text-[clamp(1.5rem,4vw,2.75rem)] uppercase leading-none tracking-[0.06em] text-text-primary transition-colors duration-300 group-hover:text-amber">
                        {social.name}
                      </span>
                      <span className="mt-2 block truncate font-body text-sm text-text-secondary">
                        {social.desc}
                      </span>
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-4 pr-1 sm:gap-6">
                    <span className="hidden text-right sm:block">
                      <span className="telemetry-label block">
                        {t.media.socials.signalLabel}
                      </span>
                      <span className="mt-1 block font-mono text-xs text-sand">
                        {social.signal}
                      </span>
                    </span>
                    <span className="hidden font-mono text-xs tracking-[0.18em] text-text-tertiary md:block">
                      {social.handle}
                    </span>
                    {url ? (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center text-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <ArrowUpRight size={20} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="tech-badge shrink-0">
                        {t.common.labels.comingSoon}
                      </span>
                    )}
                  </span>
                </>
              );

              return (
                <li key={social.name} className="border-b border-slate">
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-between gap-4 overflow-hidden py-6 transition-colors duration-200 hover:bg-bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber"
                    >
                      {body}
                      <span className="sr-only">
                        {t.media.socials.followLabel} · {social.handle} ·{" "}
                        {t.common.a11y.externalLink}
                      </span>
                    </a>
                  ) : (
                    <div className="group relative flex items-center justify-between gap-4 overflow-hidden py-6 opacity-70">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Prensa ───────────────────────────────────────────── */}
        <ScrollReveal className="pb-24 md:pb-32">
          {/* Las marcas HUD de las esquinas van con --outline-stroke en vez de
              `hud-frame-slate`: ese token vale `var(--color-slate)` en
              tactical —o sea, EXACTAMENTE el mismo gris de siempre— y
              `var(--color-slate-strong)` en desert, donde el slate claro
              (#D8CDB8 sobre #FBF7EF) se pierde y las esquinas desaparecen. */}
          <div className="panel hud-frame [--hud-color:var(--outline-stroke)] flex flex-col gap-8 p-7 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-xl">
              <span className="telemetry-label telemetry-label-amber block">
                {t.media.press.tag}
              </span>
              <h3 className="mt-4 font-heading text-2xl leading-tight tracking-[0.04em] text-text-primary sm:text-3xl">
                {t.media.press.title}
              </h3>
              <p className="mt-4 font-body text-base leading-[1.7] text-text-secondary">
                {t.media.press.desc}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-4">
              <span className="telemetry-label">{t.media.press.kitLabel}</span>
              <a
                href={CONTACT.mailto}
                className="btn-tactical btn-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                <Mail size={15} strokeWidth={2} aria-hidden="true" />
                {t.media.press.kitButton}
              </a>
              <span className="font-mono text-xs text-text-tertiary">
                {t.media.press.contactLabel}:{" "}
                <a href={CONTACT.mailto} className="link-tactical text-sand">
                  {CONTACT.email}
                </a>
              </span>
              {/* El dossier es la ficha del proyecto que pide la prensa. */}
              <DossierLink />
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ── Cierre a sangre ────────────────────────────────────── */}
      <div className="dust-overlay dust-overlay-strong relative overflow-hidden bg-bg-sunken">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid-blueprint-lg opacity-30"
        />

        <div className="pointer-events-none absolute right-6 top-8 z-10 text-right md:right-12">
          <p className="gps-label">{PAGE_COORDS.media}</p>
          <p className="gps-label mt-1">
            {t.common.edition.statusLabel} · {t.common.edition.statusValue}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-6 top-6 z-10 h-8 w-8 border-l border-t border-amber/40 md:left-12"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-6 z-10 h-8 w-8 border-b border-r border-amber/40 md:right-12"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32">
          <span className="waypoint-tag block opacity-70">{t.media.cta.tag}</span>

          <h3 className="mt-6 font-heading text-[clamp(2.5rem,9vw,7.5rem)] font-bold leading-[0.88] tracking-[0.02em] text-text-primary">
            {t.media.cta.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h3>

          <p className="mt-8 max-w-xl font-body text-base leading-[1.7] text-text-secondary">
            {t.media.cta.desc}
          </p>

          <div className="mt-8 flex items-center gap-5">
            <span aria-hidden="true" className="h-px w-12 bg-amber" />
            <span className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.28em] text-text-tertiary">
              <Radio size={13} strokeWidth={1.75} aria-hidden="true" />
              {t.media.cta.statLine}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
