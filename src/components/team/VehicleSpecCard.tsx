"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <FleetSpecCard /> · <VehicleSpecCard />
   Las fichas técnicas de la flota, estilo hoja de homologación.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   DOS FICHAS, NO CUATRO IGUALES
   -----------------------------
   Los cuatro Escort llevan la misma preparación (`COMMON_RAID_MODS` en
   `src/lib/team.ts`), y antes la ficha completa se repetía cuatro veces:
   motor, tracción, suspensión, protección, faros y carga, idénticos, en una
   página de 13 pantallas en móvil. Ahora:

     <FleetSpecCard />   una sola vez, con el dibujo y la preparación común.
     <VehicleSpecCard /> por tripulación, solo lo propio de cada coche:
                         dorsal, apodo, año y antigüedad, carga y estado.
                         Si algún día un coche difiere de la ficha común,
                         se pinta ESA diferencia (`modsThatDiffer`).

   EL DIBUJO DEL COCHE
   -------------------
   `public/car/lateral-left.svg` es line-art puro (fill:none,
   stroke:currentColor). Se pinta con `mask-image`: el SVG recorta un
   bloque de color, así que el trazo hereda cualquier token de color del
   design system y sigue siendo UNA sola petición cacheada. El SVG no se
   toca: su geometría ya está verificada por el módulo del coche.

   REGLAS QUE CUMPLE ESTE FICHERO
   ------------------------------
   · DATOS: modelo, años, dorsal, apodo y las modificaciones de raid vienen
     de `Crew.vehicle` (`src/lib/team.ts`). Ni una cifra a mano.
   · COPY: etiquetas vía `useT()`. Los valores técnicos son dato, y por
     tanto se muestran tal cual los publica la capa de datos.
   · La antigüedad del coche (regla de 20 años+ del rally) se DERIVA de
     `EDITION.year`, que es la única fuente de la fecha.
   · MOVIMIENTO: entrada de 0,4 s (NN/g: 100–500 ms), apagada con
     `useReducedMotion()`.
   · VOLUMEN: <TiltCard> pone giro, canto y sombra; el dibujo y el dorsal
     van a profundidades distintas con <TiltDepth>.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lightbulb, PackageOpen } from "lucide-react";

import TiltCard, { TiltDepth } from "@/components/ui/TiltCard";
import { useT } from "@/i18n/LanguageProvider";
import type { Dict } from "@/i18n/translations";
import { EDITION } from "@/lib/constants";
import type { Crew, RaidModifications } from "@/lib/team";

/** Vista lateral en line-art. Ruta pública, no se importa el fichero. */
const CAR_LATERAL_SRC = "/car/lateral-left.svg";

/** viewBox real del SVG: "0 0 1630 535". Fija la relación de aspecto. */
const CAR_ASPECT = "1630 / 535";

/** Curva de entrada del design system (equivalente JS de --ease-tactical). */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Campos de la preparación, en el orden en que se leen. */
const MOD_KEYS = [
  "engine",
  "drivetrain",
  "suspension",
  "underbodyProtection",
  "auxiliaryLights",
  "cargoCapacityKg",
  "cargoNotes",
] as const satisfies readonly (keyof RaidModifications)[];

type ModKey = (typeof MOD_KEYS)[number];

/* ────────────────────────────────────────────────────────────
   Utilidades
   ──────────────────────────────────────────────────────────── */

/**
 * Los valores de `RaidModifications` vienen del dato como
 * "1.6L Zetec · 4 cilindros en línea". Partimos por el separador para
 * jerarquizar la celda: titular arriba, matiz debajo. Si un valor no
 * lleva separador se muestra entero como titular.
 */
function splitSpec(value: string): { head: string; detail: string | null } {
  const separator = " · ";
  const index = value.indexOf(separator);
  if (index === -1) return { head: value, detail: null };
  return {
    head: value.slice(0, index),
    detail: value.slice(index + separator.length),
  };
}

/** Qué tiene un coche distinto de la ficha común. Vacío = nada. */
export function modsThatDiffer(
  mods: RaidModifications,
  reference: RaidModifications,
): ModKey[] {
  return MOD_KEYS.filter((key) => mods[key] !== reference[key]);
}

/** Etiqueta de cada campo de la preparación, del diccionario. */
function modLabel(t: Dict, key: ModKey): string {
  switch (key) {
    case "engine":
      return t.car.specs.engine.label;
    case "drivetrain":
      return t.car.specs.drivetrain.label;
    case "suspension":
      return t.car.specs.suspension.label;
    case "underbodyProtection":
      return t.car.specs.protection.label;
    case "cargoCapacityKg":
      return t.route.table.charity;
    case "auxiliaryLights":
    case "cargoNotes":
      return t.car.prep.title;
  }
}

/** Entrada al hacer scroll: corta y con poco recorrido. */
function entrance(reduce: boolean, delay: number) {
  return {
    initial: reduce ? false : ({ opacity: 0, y: 16 } as const),
    whileInView: reduce ? undefined : ({ opacity: 1, y: 0 } as const),
    viewport: { once: true, amount: 0.2 } as const,
    transition: { duration: 0.4, ease: EASE, delay: reduce ? 0 : delay },
  };
}

/* ────────────────────────────────────────────────────────────
   Piezas internas
   ──────────────────────────────────────────────────────────── */

/**
 * Line-art del lateral recortando un bloque de color con `mask-image`.
 * `aria-hidden`: el nombre accesible lo pone el contenedor del blueprint.
 *
 * LÍMITE CONOCIDO DE LA TÉCNICA — un SVG cargado como imagen CSS es un
 * documento aislado: no ve las custom properties de esta página. El
 * `--car-stroke` del design system NO llega, así que el trazo se queda en
 * el valor de reserva que el propio SVG declara (`var(--car-stroke, 2.5px)`
 * con `vector-effect: non-scaling-stroke`, o sea 2.5 px constantes a
 * cualquier escala). Lo que sí se controla desde aquí es el COLOR, porque
 * el que se ve es el del bloque enmascarado (`currentColor` del span), y
 * por eso el hover a `text-sand` funciona.
 */
function CarLineArt({ className = "" }: { className?: string }) {
  const mask: CSSProperties = {
    aspectRatio: CAR_ASPECT,
    backgroundColor: "currentColor",
    WebkitMaskImage: `url("${CAR_LATERAL_SRC}")`,
    maskImage: `url("${CAR_LATERAL_SRC}")`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };

  return (
    <span
      aria-hidden="true"
      className={`block w-full max-w-full ${className}`}
      style={mask}
    />
  );
}

/** Celda de la parrilla de specs: etiqueta mono + titular + matiz. */
function SpecCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  const { head, detail } = splitSpec(value);

  return (
    <div className={`min-w-0 px-4 py-3.5 sm:px-5 ${className}`}>
      <dt className="telemetry-label text-[0.6875rem]">{label}</dt>
      <dd className="mt-1.5 min-w-0">
        <span className="block font-heading text-[0.9375rem] uppercase leading-tight tracking-[0.04em] text-text-primary">
          {head}
        </span>
        {detail !== null && (
          <span className="mt-1 block text-[0.75rem] leading-snug text-text-secondary">
            {detail}
          </span>
        )}
      </dd>
    </div>
  );
}

/** Dato corto de la ficha de un coche: etiqueta arriba, valor grande. */
function UnitFact({
  label,
  children,
  labelClassName = "",
}: {
  label: string;
  children: ReactNode;
  labelClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className={`telemetry-label text-[0.6875rem] ${labelClassName}`}>{label}</dt>
      <dd className="mt-1.5 flex min-w-0 items-baseline gap-1.5">{children}</dd>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   <FleetSpecCard /> — la preparación común, una sola vez
   ──────────────────────────────────────────────────────────── */

export interface FleetSpecCardProps {
  /** Las tripulaciones de la flota. La ficha común es la del primer coche. */
  crews: readonly Crew[];
  delay?: number;
  className?: string;
}

export function FleetSpecCard({ crews, delay = 0, className = "" }: FleetSpecCardProps) {
  const t = useT();
  const reduce = useReducedMotion() ?? false;

  const reference = crews[0].vehicle;
  const { raidMods } = reference;

  const years = crews.map((crew) => crew.vehicle.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const yearsLabel = minYear === maxYear ? String(minYear) : `${minYear}–${maxYear}`;
  const totalKg = crews.reduce((acc, crew) => acc + crew.vehicle.raidMods.cargoCapacityKg, 0);

  return (
    <motion.div {...entrance(reduce, delay)} className={`min-w-0 ${className}`}>
      {/* Ficha ancha: giro corto, que a este tamaño 4° ya se notan. */}
      <TiltCard className="h-full" solid maxTilt={4} lift={14}>
        <article className="panel group relative isolate grid h-full min-w-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* ── 1 · Cabecera ─────────────────────────────────────────────── */}
          <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-slate px-4 py-4 sm:px-5 lg:col-span-2">
            <div className="min-w-0">
              <span className="telemetry-label telemetry-label-amber telemetry-label-dash block">
                {t.car.fleet.title} · {crews.length}
              </span>
              <h3 className="mt-2 font-heading text-[clamp(1.35rem,3vw,2rem)] uppercase leading-tight tracking-[0.05em] text-text-primary">
                {reference.model}
              </h3>
              <p className="mt-1 text-[0.8125rem] leading-snug text-text-secondary">
                {t.car.fleet.commonLabel}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="telemetry-label text-[0.6875rem]">{t.car.fleet.yearLabel}</span>
              <p className="mt-1.5 font-heading text-xl leading-none tracking-[0.04em] text-text-primary">
                {yearsLabel}
              </p>
            </div>
          </header>

          {/* ── 2 · Blueprint del lateral ────────────────────────────────── */}
          <div
            role="img"
            aria-label={t.common.a11y.carDiagram}
            className="relative flex items-center overflow-hidden border-b border-slate bg-bg-sunken px-4 pb-8 pt-10 sm:px-6 lg:border-b-0 lg:border-r"
          >
            <span
              aria-hidden="true"
              className="grid-blueprint-fine grid-fade pointer-events-none absolute inset-0 opacity-70"
            />

            {/* Cuántos coches: el número fantasma se hunde al girar la ficha */}
            <TiltDepth depth={-30} className="pointer-events-none absolute inset-0">
              <span
                aria-hidden="true"
                className="absolute inset-0 flex select-none items-center justify-center font-heading text-[clamp(5rem,16vw,9rem)] leading-none tracking-[0.06em] text-text-primary/[0.05]"
              >
                ×{crews.length}
              </span>
            </TiltDepth>

            <span
              aria-hidden="true"
              className="absolute left-4 top-3 flex min-w-0 max-w-[70%] items-center gap-2 sm:left-6"
            >
              <span className="telemetry-label shrink-0 text-[0.6875rem]">
                {t.car.blueprint.viewLabel}
              </span>
              <span className="truncate font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-text-secondary">
                {t.common.carViews["lateral-izq"]}
              </span>
            </span>

            {/* El coche sale de la ficha hacia quien mira */}
            <TiltDepth depth={45} className="relative z-10 w-full">
              <CarLineArt className="text-text-secondary transition-colors duration-500 group-hover:text-sand motion-reduce:transition-none" />
            </TiltDepth>

            {/* Cota inferior: línea de suelo con topes, como en un plano */}
            <span
              aria-hidden="true"
              className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-1.5 sm:left-6 sm:right-6"
            >
              <span className="h-2 w-px bg-slate" />
              <span className="h-px flex-1 bg-slate" />
              <span className="h-1.5 w-1.5 rotate-45 border border-slate" />
              <span className="h-px flex-1 bg-slate" />
              <span className="h-2 w-px bg-slate" />
            </span>
          </div>

          {/* ── 3 · Specs, preparación y carga ───────────────────────────── */}
          <div className="flex min-w-0 flex-col">
            {/* Los hairlines salen del fondo a través de `gap-px`. */}
            <dl className="grid grid-cols-1 gap-px bg-slate sm:grid-cols-2">
              <SpecCell label={t.car.specs.engine.label} value={raidMods.engine} className="bg-bg-surface" />
              <SpecCell label={t.car.specs.drivetrain.label} value={raidMods.drivetrain} className="bg-bg-surface" />
              <SpecCell label={t.car.specs.suspension.label} value={raidMods.suspension} className="bg-bg-surface" />
              <SpecCell label={t.car.specs.protection.label} value={raidMods.underbodyProtection} className="bg-bg-surface" />
            </dl>

            <div className="border-t border-slate px-4 py-4 sm:px-5">
              <span className="telemetry-label telemetry-label-dash block text-[0.6875rem]">
                {t.car.prep.title}
              </span>
              <ul className="mt-3 flex flex-col gap-2.5">
                <li className="flex min-w-0 items-start gap-2.5">
                  <Lightbulb size={14} strokeWidth={1.6} aria-hidden="true" className="mt-px shrink-0 text-amber" />
                  <span className="min-w-0 text-[0.8125rem] leading-snug text-text-secondary">
                    {raidMods.auxiliaryLights}
                  </span>
                </li>
                <li className="flex min-w-0 items-start gap-2.5">
                  <PackageOpen size={14} strokeWidth={1.6} aria-hidden="true" className="mt-px shrink-0 text-amber" />
                  <span className="min-w-0 text-[0.8125rem] leading-snug text-text-secondary">
                    {raidMods.cargoNotes}
                  </span>
                </li>
              </ul>
            </div>

            <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-slate bg-bg-elevated px-4 py-3.5 sm:px-5">
              <UnitFact label={`${t.route.table.charity} · ${t.car.fleet.perCar}`} labelClassName="telemetry-label-lime">
                <span className="font-heading text-2xl leading-none tracking-[0.04em] text-lime">
                  {raidMods.cargoCapacityKg}
                </span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-text-tertiary">kg</span>
              </UnitFact>
              <UnitFact label={t.car.fleet.fleetTotal}>
                <span className="font-heading text-2xl leading-none tracking-[0.04em] text-text-primary">
                  {totalKg}
                </span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-text-tertiary">kg</span>
              </UnitFact>
            </dl>
          </div>
        </article>
      </TiltCard>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   <VehicleSpecCard /> — lo propio de cada coche
   ──────────────────────────────────────────────────────────── */

export interface VehicleSpecCardProps {
  /** Tripulación dueña del coche. La ficha sale de `crew.vehicle`. */
  crew: Crew;
  /** Preparación común de la flota, para pintar solo lo que difiere. */
  reference?: RaidModifications;
  /** Retardo de entrada, en segundos. */
  delay?: number;
  /** Clases extra de colocación (spans, orden). Van en el envoltorio. */
  className?: string;
}

export default function VehicleSpecCard({
  crew,
  reference,
  delay = 0,
  className = "",
}: VehicleSpecCardProps) {
  const t = useT();
  const reduce = useReducedMotion() ?? false;

  const { vehicle } = crew;
  const { raidMods } = vehicle;

  /** Dorsal a dos dígitos: 01, 02, 03, 04. */
  const unitCode = String(vehicle.carNumber).padStart(2, "0");

  /**
   * Años que tendrá el coche en la edición. Derivado de EDITION.year,
   * nunca escrito a mano. El rally exige coches de 20 años o más y este
   * es el número que lo demuestra.
   */
  const ageAtEdition = EDITION.year - vehicle.year;

  const differences = reference ? modsThatDiffer(raidMods, reference) : [];

  return (
    <motion.div {...entrance(reduce, delay)} className={`min-w-0 ${className}`}>
      <TiltCard className="h-full" solid>
        <article className="panel group relative isolate flex h-full min-w-0 flex-col">
          {/* ── 1 · Cabecera ─────────────────────────────────────────────── */}
          <header className="flex items-start justify-between gap-4 border-b border-slate px-4 py-3 sm:px-5">
            <span className="telemetry-label telemetry-label-amber text-[0.6875rem]">
              {t.team.rallyUnit} {unitCode}
            </span>
            {/* `max-w-[60%]` en vez de `shrink-0`: con `shrink-0` el `truncate`
                no llega a activarse nunca y un apodo largo desbordaría. */}
            <div className="min-w-0 max-w-[60%] text-right">
              <span className="telemetry-label text-[0.6875rem]">{t.car.fleet.nicknameLabel}</span>
              <p className="mt-1.5 truncate font-heading text-[clamp(1.15rem,2vw,1.4rem)] uppercase leading-tight tracking-[0.05em] text-sand-solid">
                «{vehicle.nickname}»
              </p>
            </div>
          </header>

          <div className="grid flex-1 grid-cols-1 sm:grid-cols-[9rem_minmax(0,1fr)] xl:grid-cols-1">
            {/* ── 2 · Dorsal ─────────────────────────────────────────────── */}
            <div
              aria-hidden="true"
              className="relative flex min-h-[7rem] items-center justify-center overflow-hidden border-b border-slate bg-bg-sunken sm:border-b-0 sm:border-r xl:border-b xl:border-r-0"
            >
              <span className="grid-blueprint-fine grid-fade pointer-events-none absolute inset-0 opacity-70" />
              <TiltDepth depth={-24} className="pointer-events-none absolute inset-0">
                <span className="absolute inset-0 flex select-none items-center justify-center font-heading text-[7rem] leading-none tracking-[0.06em] text-text-primary/[0.05]">
                  {unitCode}
                </span>
              </TiltDepth>
              <TiltDepth depth={40} className="relative z-10">
                <span className="font-heading text-6xl leading-none tracking-[0.06em] text-text-primary">
                  {unitCode}
                </span>
              </TiltDepth>
            </div>

            {/* ── 3 · Datos del coche ────────────────────────────────────── */}
            <dl className="grid grid-cols-2 content-center gap-x-4 gap-y-4 px-4 py-4 sm:px-5">
              {/* Año + antigüedad derivada en la edición. El "+30" va
                  `aria-hidden`: su significado sólo existe en el `title`, y
                  un lector de pantalla anunciaría un "+30" desnudo. */}
              <UnitFact label={t.car.fleet.yearLabel}>
                <span className="font-heading text-2xl leading-none tracking-[0.04em] text-text-primary">
                  {vehicle.year}
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono text-[0.6875rem] leading-none tracking-[0.12em] text-amber-text"
                  title={t.project.rules1}
                >
                  +{ageAtEdition}
                </span>
              </UnitFact>

              <UnitFact label={t.route.table.charity} labelClassName="telemetry-label-lime">
                <span className="font-heading text-2xl leading-none tracking-[0.04em] text-lime">
                  {raidMods.cargoCapacityKg}
                </span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-text-tertiary">kg</span>
              </UnitFact>

              <div className="col-span-2 min-w-0">
                <dt className="telemetry-label text-[0.6875rem]">{t.car.fleet.crewLabel}</dt>
                <dd className="mt-1.5 truncate font-heading text-[0.9375rem] uppercase tracking-[0.05em] text-text-primary">
                  {crew.name}
                </dd>
              </div>
            </dl>
          </div>

          {/* ── 4 · Lo que este coche tiene distinto (hoy, nada) ─────────── */}
          {differences.length > 0 && (
            <div className="border-t border-slate px-4 py-3.5 sm:px-5">
              <span className="telemetry-label telemetry-label-amber telemetry-label-dash block text-[0.6875rem]">
                {t.car.fleet.differs}
              </span>
              <dl className="mt-2.5 flex flex-col gap-2">
                {differences.map((key) => (
                  <div key={key} className="min-w-0">
                    <dt className="telemetry-label text-[0.6875rem]">{modLabel(t, key)}</dt>
                    <dd className="mt-0.5 text-[0.8125rem] leading-snug text-text-secondary">
                      {key === "cargoCapacityKg" ? `${raidMods[key]} kg` : raidMods[key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* ── 5 · Estado de preparación ────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3 border-t border-slate px-4 py-2.5 sm:px-5">
            <span className="telemetry-label shrink-0 text-[0.6875rem]">
              {t.team.preparationLabel}
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="status-dot shrink-0" />
              <span className="truncate font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-lime">
                {t.team.preparationStatus}
              </span>
            </span>
          </div>
        </article>
      </TiltCard>
    </motion.div>
  );
}

export { VehicleSpecCard };
