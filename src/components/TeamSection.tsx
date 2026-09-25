"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <TeamSection />   ·   Módulo 4 de la spec: EL EQUIPO
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Primero la ficha común de la flota (<FleetSpecCard />, una sola vez: los
   cuatro coches llevan la misma preparación) y después cuatro bloques de
   tripulación. Cada bloque monta la ficha propia del coche
   (<VehicleSpecCard />: dorsal, apodo, año, carga) junto a los dos
   pasaportes de sus ocupantes (<PilotPassport />), alternando el lado en
   escritorio para que la lectura no se vuelva una lista plana.

     ┌ 05 · EL EQUIPO ─────────────────────────────────────────────┐
     │  OCHO AMIGOS. CUATRO TRIPULACIONES.                         │
     │  ledger HUD: tripulación · flota · base · coordenadas       │
     │  LA FLOTA — dibujo + preparación común de los cuatro coches │
     ├─────────────────────────────────────────────────────────────┤
     │  EQUIPO 01 — LORAS & HUSE                                   │
     │  [ coche: dorsal·año ][ pasaporte piloto ][ pasap. copil.  ]│
     │  … ×4                                                       │
     ├─────────────────────────────────────────────────────────────┤
     │  reglas del rally · llamada a la acción                     │
     └─────────────────────────────────────────────────────────────┘

   REGLAS QUE CUMPLE ESTE FICHERO
   ------------------------------
   · DATOS: `CREWS` y los derivados de `src/lib/team.ts`. Se ha borrado el
     array `TEAMS` que esta sección duplicaba a mano (ocho nombres y cuatro
     coches escritos dos veces en el repo).
   · COPY: todo vía `useT()`. Ni una cadena de interfaz escrita aquí.
   · TEMA: "Rally Desert Tactical" sobre fondo oscuro, con los tokens de
     `globals.css`. No queda ni un color del tema arena claro anterior.
   · MOVIMIENTO: `useReducedMotion()` apaga la entrada de cada bloque, que
     dura 0,4 s (NN/g: 100–500 ms).
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import PilotPassport from "@/components/team/PilotPassport";
import DossierLink from "@/components/ui/DossierLink";
import VehicleSpecCard, { FleetSpecCard } from "@/components/team/VehicleSpecCard";
import { useT } from "@/i18n/LanguageProvider";
import { CONTACT, formatDMS } from "@/lib/constants";
import {
  CREWS,
  FLEET_SIZE,
  HOME_CITY,
  HOME_COORDS,
  TEAM_SIZE,
} from "@/lib/team";

/** Curva de entrada del design system (equivalente JS de --ease-tactical). */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ────────────────────────────────────────────────────────────
   Piezas internas
   ──────────────────────────────────────────────────────────── */

/**
 * Celda del ledger HUD de cabecera: etiqueta mono + valor.
 *
 * `wrap` cambia la política de desbordamiento del valor. Por defecto se
 * trunca, que es lo correcto para un dato corto (un número, una ciudad).
 * Una coordenada DMS completa no se puede truncar sin destruirla —«41°23'…»
 * no es una coordenada— así que esa celda pide `wrap` y parte en dos líneas.
 */
function LedgerCell({
  label,
  children,
  className = "",
  wrap = false,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  wrap?: boolean;
}) {
  return (
    <div className={`min-w-0 px-4 py-3.5 sm:px-5 ${className}`}>
      <dt className="telemetry-label text-[0.6875rem]">{label}</dt>
      <dd
        className={`mt-1.5 min-w-0 font-heading text-[0.9375rem] uppercase tracking-[0.06em] text-text-primary ${
          wrap ? "break-words" : "truncate"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Sección
   ──────────────────────────────────────────────────────────── */

export default function TeamSection() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;

  /** Props de entrada compartidos por los bloques de cabecera. */
  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 16 } as const),
    whileInView: reduce ? undefined : ({ opacity: 1, y: 0 } as const),
    viewport: { once: true, amount: 0.3 } as const,
    transition: { duration: 0.4, ease: EASE, delay: reduce ? 0 : delay },
  });

  return (
    <section
      id="equipo"
      className="dust-overlay relative w-full overflow-hidden bg-bg-base pb-24 sm:pb-32"
    >
      {/* Fondo técnico */}
      <span
        aria-hidden="true"
        className="grid-blueprint grid-fade pointer-events-none absolute inset-0 opacity-70"
      />
      <span
        aria-hidden="true"
        className="side-label absolute right-1 top-32 hidden xl:block"
      >
        {t.team.sideLabel}
      </span>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        {/* ── Cabecera de sección ────────────────────────────────────── */}
        <motion.header {...rise(0)} className="max-w-3xl">
          <span className="waypoint-tag block">{t.team.waypoint}</span>
          <h2 className="mt-5 font-heading text-[clamp(2.25rem,7vw,4.5rem)] uppercase leading-[0.9] tracking-[0.04em] text-text-primary">
            {t.team.title.map((line, i) => (
              <span key={`${i}-${line}`} className="block">
                {i === t.team.title.length - 1 ? (
                  <span className="text-gradient-amber">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h2>
          <hr className="divider-tech mt-7 w-full max-w-md" />
          <p className="mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
            {t.team.intro}
          </p>
        </motion.header>

        {/* ── Ledger HUD del equipo ──────────────────────────────────────
            Marco achaflanado con hairline real: el wrapper pinta el borde y
            el hijo directo la superficie (patrón .chamfer-outline).
            Los hairlines interiores salen del `gap-px` sobre `bg-slate`. */}
        <motion.div {...rise(0.1)} className="chamfer-outline mt-10 sm:mt-12">
          <div>
            <dl className="grid grid-cols-2 gap-px bg-slate lg:grid-cols-4">
              <LedgerCell
                label={t.common.labels.crew}
                className="bg-bg-surface"
              >
                {TEAM_SIZE}
              </LedgerCell>
              {/* `project.stats.cars` ("Coches") y no `car.fleet.title`
                  ("La flota"): esto es la etiqueta de un contador, no el
                  titular de una sección. */}
              <LedgerCell
                label={t.project.stats.cars}
                className="bg-bg-surface"
              >
                {FLEET_SIZE}
              </LedgerCell>
              {/* Span 2 igual que la celda de coordenadas: si sólo una de las
                  dos ocupase la fila entera, la otra dejaría media fila vacía
                  y el `gap-px` la pintaría como un hueco de slate. */}
              <LedgerCell
                label={t.footer.locationLabel}
                className="col-span-2 bg-bg-surface lg:col-span-1"
              >
                {HOME_CITY}
              </LedgerCell>
              {/* A dos columnas la celda mide ~128 px por debajo de 360 px de
                  viewport y una DMS completa no cabe. Ocupa la fila entera
                  hasta `lg`, donde el ledger ya es de cuatro columnas. */}
              <LedgerCell
                label={t.common.labels.coords}
                className="col-span-2 bg-bg-surface lg:col-span-1"
                wrap
              >
                <span className="gps-label text-text-secondary">
                  {formatDMS(HOME_COORDS)}
                </span>
              </LedgerCell>
            </dl>
          </div>
        </motion.div>

        {/* ── La flota: lo que comparten los cuatro coches, una vez ──── */}
        <FleetSpecCard crews={CREWS} className="mt-10 sm:mt-12" />

        {/* ── Las cuatro tripulaciones ───────────────────────────────── */}
        <div className="mt-16 flex flex-col gap-16 sm:mt-20 sm:gap-24">
          {CREWS.map((crew, index) => {
            /* En escritorio el coche cambia de lado en las unidades pares
               para romper la columna y dar ritmo a la lectura. */
            const flip = index % 2 === 1;

            return (
              <article key={crew.id} className="relative">
                <motion.header
                  {...rise(0)}
                  className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-slate pb-4"
                >
                  <div className="min-w-0">
                    <span className="telemetry-label telemetry-label-amber telemetry-label-dash block">
                      {t.team.unitPrefix} {crew.code}
                    </span>
                    <h3 className="mt-3 font-heading text-[clamp(1.75rem,5vw,3rem)] uppercase leading-[0.92] tracking-[0.05em] text-text-primary">
                      {crew.name}
                    </h3>
                  </div>

                  <span className="tech-badge tech-badge-amber shrink-0 whitespace-nowrap">
                    {t.team.crewDossier} {crew.code}
                  </span>
                </motion.header>

                {/* El reparto 4/8 sólo entra en xl: entre lg y xl las tres
                    tarjetas quedarían por debajo de 260 px y los campos del
                    pasaporte no respiran. Hasta ahí, la ficha del coche (que
                    ya es compacta) a todo lo ancho y los dos pasaportes en
                    pareja a partir de md. */}
                <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
                  <VehicleSpecCard
                    crew={crew}
                    reference={CREWS[0].vehicle.raidMods}
                    delay={0.05}
                    className={`xl:col-span-4 ${flip ? "xl:order-2" : "xl:order-1"}`}
                  />

                  <div
                    className={`grid grid-cols-1 gap-5 md:grid-cols-2 xl:col-span-8 xl:gap-6 ${
                      flip ? "xl:order-1" : "xl:order-2"
                    }`}
                  >
                    <PilotPassport
                      member={crew.pilot}
                      crew={crew}
                      delay={0.12}
                    />
                    <PilotPassport
                      member={crew.copilot}
                      crew={crew}
                      delay={0.2}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── Franja de reglas del rally ─────────────────────────────── */}
        <motion.div
          {...rise(0)}
          className="mt-16 flex flex-col gap-2 border-y border-slate py-4 sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <p className="telemetry-label telemetry-label-amber min-w-0 text-[0.6875rem] leading-relaxed sm:text-[0.6875rem]">
            {t.project.rules1}
          </p>
          <p className="telemetry-label min-w-0 text-[0.6875rem] leading-relaxed sm:text-[0.6875rem]">
            {t.project.rules2}
          </p>
        </motion.div>

        {/* ── Llamada a la acción ────────────────────────────────────── */}
        <motion.div
          {...rise(0.05)}
          className="panel hud-frame hud-frame-lg relative mt-16 overflow-hidden px-6 py-14 text-center sm:mt-20 sm:px-10 sm:py-20"
        >
          <span
            aria-hidden="true"
            className="grid-blueprint-fine grid-fade pointer-events-none absolute inset-0 opacity-50"
          />

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <span className="waypoint-tag block">{t.team.ctaTag}</span>

            <h3 className="mt-5 font-heading text-[clamp(1.9rem,6vw,3.75rem)] uppercase leading-[0.92] tracking-[0.04em] text-text-primary">
              {t.team.ctaTitle.map((line, i) => (
                <span key={`${i}-${line}`} className="block">
                  {line}
                </span>
              ))}
            </h3>

            <p className="mt-6 text-[0.9375rem] leading-relaxed text-text-secondary">
              {t.team.ctaDescription}
            </p>

            <a href={CONTACT.mailto} className="btn-tactical btn-amber mt-9">
              {t.team.ctaButton}
              <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
            </a>

            <p className="gps-label mt-6 break-all">{CONTACT.email}</p>

            <DossierLink className="mt-5 justify-center" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { TeamSection };
