"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING · MÓDULO 3 — El recorrido
   --------------------------------------------------------------------------
   Contenedor de las secciones 03 (LA RUTA) y 04 (CRONOLOGÍA).

   Esta sección solo hace tres cosas:
     1. Pinta la cabecera editorial de cada bloque con el copy de `t.route.*`.
     2. Es el ÚNICO dueño del estado de selección — qué etapa está desplegada
        y cuál está resaltada — y se lo pasa al roadbook y al mapa. Por eso
        seleccionar una etapa en la tabla resalta su marcador y al revés: no
        hay dos estados que sincronizar, hay uno solo.
     3. Genera los ids de panel y se los da a los dos hijos, para que el
        marcador del mapa y la fila del roadbook puedan apuntar con
        `aria-controls` al MISMO panel desplegable.

   Lo que ya NO hace (y antes sí): inventarse la ruta. Las 4 etapas
   Biarritz→Marrakech y los "6.200 km" que había aquí codificados a mano no
   existen. El recorrido real —6 etapas, 8 días, el tramo marroquí— vive en
   `src/lib/route.ts` y lo leen directamente `RoadbookTimeline` y `MoroccoMap`.
   ══════════════════════════════════════════════════════════════════════════ */

import { useCallback, useId, useState, type ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";

import MoroccoMap from "@/components/route/MoroccoMap";
import RoadbookTimeline from "@/components/route/RoadbookTimeline";
import { useT } from "@/i18n/LanguageProvider";

/**
 * Aparición al entrar en pantalla.
 *
 * Se usa framer-motion y no el `ScrollReveal` del repo a propósito: ese
 * componente se apoya en `src/hooks/useIntersectionObserver` y, verificado en
 * el navegador contra el dev server, sus bloques se quedaban en `opacity: 0`
 * (no llegaba a añadir `.is-visible`). Ningún otro módulo de la web lo usa ya.
 *
 * El `<MotionConfig reducedMotion="user">` de abajo hace que, si el sistema
 * pide movimiento reducido, framer-motion se salte los desplazamientos y deje
 * solo el fundido. El contenido NUNCA depende de la animación para ser
 * legible: el estado final es el natural.
 */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Acento de cada hito de la cronología, por POSICIÓN.
 * `t.route.chronology.phases` es una tupla de 4 y el estado de cada hito ya
 * viene traducido como texto libre, así que no se puede deducir del string
 * (sería distinto en cada idioma). El orden sí es estable: hecho → en curso
 * → abierto → pendiente.
 */
/*
 * La BARRA y el TEXTO no usan el mismo token a proposito. La barra es una
 * pieza grafica (3 px de ancho): le vale el acento pleno. El rotulo es texto
 * de 10-11 px, y ahi los acentos plenos no llegan al contraste minimo sobre
 * crema: --color-amber da 3.87:1 y --color-muted 3.41:1. Para eso existen las
 * variantes de texto. En tactical el ambar vale lo mismo que el acento
 * pleno (#FF6B00) y el terciario sube a #A0988C (#8C8275 no llegaba a AA
 * sobre las tarjetas); en desert suben a 5.08:1 y 4.95:1:
 *   text-amber      -> text-amber-text
 *   text-muted      -> text-text-tertiary
 * El lima no necesita variante: --color-lime ya es 5.00:1 en desert (moss).
 */
const PHASE_ACCENT: readonly {
  readonly bar: string;
  readonly text: string;
  readonly live: boolean;
}[] = [
  { bar: "bg-lime", text: "text-lime", live: false },
  { bar: "bg-amber", text: "text-amber-text", live: true },
  { bar: "bg-amber", text: "text-amber-text", live: false },
  { bar: "bg-muted", text: "text-text-tertiary", live: false },
];

export default function TimelineSection() {
  const t = useT();
  const uid = useId();

  /** Etapa desplegada. `null` = ninguna. Fuente de verdad de tabla y mapa. */
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  /** Etapa resaltada por cursor o foco, venga de donde venga. */
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

  const getPanelId = useCallback(
    (stageId: string) => `${uid}-stage-${stageId}`,
    [uid],
  );

  /* Los dos bloques (03 LA RUTA y 04 CRONOLOGÍA) son regiones con nombre
     propio: sin `aria-labelledby` serían dos <section> anónimos y no
     aparecerían en la lista de landmarks de un lector de pantalla. */
  const routeTitleId = `${uid}-route-title`;
  const chronologyTitleId = `${uid}-chronology-title`;

  const handleSelectStage = useCallback((stageId: string) => {
    setActiveStageId((current) => (current === stageId ? null : stageId));
  }, []);

  const handleHoverStage = useCallback((stageId: string | null) => {
    setHoveredStageId(stageId);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="timeline"
        className="dust-overlay dust-overlay-soft relative w-full bg-bg-base"
      >
        {/* ══ 03 · LA RUTA ═══════════════════════════════════════════════════ */}
        <section
          id="ruta"
          aria-labelledby={routeTitleId}
          className="relative py-15 md:py-20 lg:py-25"
        >
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12">
            <Reveal>
              <header className="flex flex-col gap-6">
                <span className="waypoint-tag">{t.route.waypoint}</span>
                <hr className="divider-tech w-full max-w-[520px] border-0" />

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
                  <h2
                    id={routeTitleId}
                    className="font-heading text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] tracking-[0.06em] text-text-primary uppercase"
                  >
                    {t.route.title.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </h2>
                  <p className="font-body text-sm leading-relaxed text-text-secondary md:text-base">
                    {t.route.intro}
                  </p>
                </div>
              </header>
            </Reveal>

            {/* Mapa + roadbook. En móvil manda el mapa; en desktop la tabla
              ocupa la columna ancha de la izquierda y el mapa acompaña
              pegado a la derecha mientras se recorren las etapas.
              OJO: `lg:sticky` solo se activa si ningún ancestro tiene
              `overflow: hidden` (hoy lo lleva el <main> de src/app/page.tsx,
              que no es de este módulo). Sin él la columna se comporta como
              estática, que es una degradación aceptable. */}
            <div className="mt-14 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:gap-10">
              <div className="lg:order-2 lg:sticky lg:top-24">
                <MoroccoMap
                  activeStageId={activeStageId}
                  hoveredStageId={hoveredStageId}
                  onSelectStage={handleSelectStage}
                  onHoverStage={handleHoverStage}
                  getPanelId={getPanelId}
                />
              </div>

              <div className="lg:order-1">
                <RoadbookTimeline
                  activeStageId={activeStageId}
                  hoveredStageId={hoveredStageId}
                  onSelectStage={handleSelectStage}
                  onHoverStage={handleHoverStage}
                  getPanelId={getPanelId}
                />
              </div>
            </div>
          </div>

          <span
            className="side-label absolute top-32 right-2 hidden xl:block"
            aria-hidden="true"
          >
            {t.route.sideLabel}
          </span>
        </section>

        {/* ══ 04 · CRONOLOGÍA ════════════════════════════════════════════════ */}
        <section
          id="cronologia"
          aria-labelledby={chronologyTitleId}
          className="relative border-t border-slate py-15 md:py-20 lg:py-25"
        >
          <div
            className="grid-blueprint-lg grid-fade-y absolute inset-0 opacity-40"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12">
            <Reveal>
              <header className="flex flex-col gap-6">
                <span className="waypoint-tag">
                  {t.route.chronology.waypoint}
                </span>
                <hr className="divider-tech w-full max-w-[520px] border-0" />
                <h2
                  id={chronologyTitleId}
                  className="font-heading text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.92] tracking-[0.05em] text-text-primary uppercase"
                >
                  {t.route.chronology.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              </header>
            </Reveal>

            <ol className="mt-14 grid list-none grid-cols-1 gap-px bg-slate p-0 sm:grid-cols-2 xl:grid-cols-4">
              {t.route.chronology.phases.map((phase, index) => {
                const accent =
                  PHASE_ACCENT[index] ?? PHASE_ACCENT[PHASE_ACCENT.length - 1];
                return (
                  <li key={phase.num} className="bg-bg-base">
                    <Reveal className="h-full" delay={index * 0.08}>
                      <article className="flex h-full flex-col gap-4 p-6 transition-colors duration-300 hover:bg-bg-surface">
                        <div className="flex items-start gap-4">
                          <span
                            className={`mt-1 h-10 w-[3px] shrink-0 ${accent.bar}`}
                            aria-hidden="true"
                          />
                          <div className="flex min-w-0 flex-col gap-1">
                            <span className={`telemetry-label ${accent.text}`}>
                              {`${t.route.chronology.phaseLabel} ${phase.num}`}
                            </span>
                            <h3 className="font-heading text-2xl leading-none tracking-[0.06em] text-text-primary uppercase">
                              {phase.title}
                            </h3>
                          </div>
                        </div>

                        <p className="font-body text-sm leading-relaxed text-text-secondary">
                          {phase.desc}
                        </p>

                        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate pt-4">
                          <span className="flex items-center gap-2">
                            {accent.live ? (
                              <span className="status-dot" aria-hidden="true" />
                            ) : null}
                            <span className={`gps-label ${accent.text}`}>
                              <span className="sr-only">{`${t.common.labels.status} `}</span>
                              {phase.status}
                            </span>
                          </span>
                          <span className="gps-label ml-auto text-text-tertiary">
                            <span className="sr-only">{`${t.common.labels.date} `}</span>
                            {phase.window}
                          </span>
                        </div>
                      </article>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>

          <span
            className="side-label absolute top-32 right-2 hidden xl:block"
            aria-hidden="true"
          >
            {t.route.chronology.sideLabel}
          </span>
        </section>
      </section>
    </MotionConfig>
  );
}
