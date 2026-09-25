"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <VehicleSpecCard />
   Ficha técnica del coche de una tripulación, estilo hoja de homologación.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ┌─────────────────────────────────────────────┐
     │ COCHE 01  FORD ESCORT MK7     NOMBRE «Sahara»│
     ├─────────────────────────────────────────────┤
     │  ╔ rejilla blueprint ╗      01              │
     │      ▁▁▁▁▂▂▃ line-art del lateral ▃▂▂▁▁▁    │  mask-image sobre el SVG
     │  └── cota inferior ──┘                      │
     ├───────────────────┬─────────────────────────┤
     │ MOTOR  1.6L Zetec │ TRACCIÓN  2WD           │
     │ SUSPENSIÓN +60 mm │ PROTECCIÓN  cubrecárter │
     ├───────────────────┴─────────────────────────┤
     │ PREPARACIÓN · faros auxiliares / carga      │
     ├─────────────────────────────────────────────┤
     │ MISIÓN SOLIDARIA                    120 kg  │
     └─────────────────────────────────────────────┘

   EL DIBUJO DEL COCHE
   -------------------
   `public/car/lateral-left.svg` es line-art puro (fill:none,
   stroke:currentColor). Se pinta con `mask-image`: el SVG recorta un
   bloque de color, así que el trazo hereda cualquier token de color del
   design system y sigue siendo UNA sola petición cacheada, sin inyectar
   17 KB de paths en el DOM cuatro veces. El SVG no se toca: su geometría
   ya está verificada por el módulo del coche.

   REGLAS QUE CUMPLE ESTE FICHERO
   ------------------------------
   · DATOS: modelo, año, dorsal, apodo y las seis modificaciones de raid
     vienen de `Crew.vehicle` (`src/lib/team.ts`). Ni una cifra a mano.
   · COPY: etiquetas vía `useT()`. Los valores técnicos son dato, y por
     tanto se muestran tal cual los publica la capa de datos.
   · La antigüedad del coche (regla de 20 años+ del rally) se DERIVA de
     `EDITION.year`, que es la única fuente de la fecha.
   · MOVIMIENTO: apagado con `useReducedMotion()`.
   · VOLUMEN: <TiltCard> pone giro, canto y sombra; el dibujo del coche y
     el dorsal fantasma van a profundidades distintas con <TiltDepth>.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lightbulb, PackageOpen } from "lucide-react";

import TiltCard, { TiltDepth } from "@/components/ui/TiltCard";
import { useT } from "@/i18n/LanguageProvider";
import { EDITION } from "@/lib/constants";
import type { Crew } from "@/lib/team";

/** Vista lateral en line-art. Ruta pública, no se importa el fichero. */
const CAR_LATERAL_SRC = "/car/lateral-left.svg";

/** viewBox real del SVG: "0 0 1630 535". Fija la relación de aspecto. */
const CAR_ASPECT = "1630 / 535";

/** Curva de entrada del design system (equivalente JS de --ease-tactical). */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
 * por eso el hover a `text-sand` funciona. Si en algún momento hace falta
 * variar el grosor por vista, hay que pasar a SVG inline y perder la
 * petición única cacheada — no es un cambio de esta tarjeta.
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
      <dt className="telemetry-label text-[0.5625rem]">{label}</dt>
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

/* ────────────────────────────────────────────────────────────
   API pública
   ──────────────────────────────────────────────────────────── */

export interface VehicleSpecCardProps {
  /** Tripulación dueña del coche. La ficha sale de `crew.vehicle`. */
  crew: Crew;
  /** Retardo de entrada, en segundos. */
  delay?: number;
  /** Clases extra de colocación (spans, orden). Van en el envoltorio. */
  className?: string;
}

export default function VehicleSpecCard({
  crew,
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

  return (
    /* La entrada va FUERA de la tarjeta con volumen: si la llevara el
       artículo, la sombra del suelo se vería antes que la propia ficha. */
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : delay }}
      className={`min-w-0 ${className}`}
    >
      <TiltCard className="h-full" solid>
        <article className="panel group relative isolate flex h-full min-w-0 flex-col">
          {/* ── 1 · Cabecera ─────────────────────────────────────────────── */}
          <header className="flex items-start justify-between gap-4 border-b border-slate px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <span className="telemetry-label telemetry-label-amber text-[0.5625rem]">
                {t.team.rallyUnit} {unitCode}
              </span>
              <h4 className="mt-1.5 font-heading text-[clamp(1.05rem,2vw,1.35rem)] uppercase leading-tight tracking-[0.05em] text-text-primary">
                {vehicle.model}
              </h4>
            </div>
            {/* `max-w-[48%]` en vez de `shrink-0`: con `shrink-0` el `truncate`
                de abajo no llega a activarse nunca y un apodo largo empujaría el
                modelo fuera del marco en lugar de recortarse. */}
            <div className="min-w-0 max-w-[48%] text-right">
              <span className="telemetry-label text-[0.5625rem]">
                {t.car.fleet.nicknameLabel}
              </span>
              <p className="mt-1.5 truncate font-heading text-[clamp(1.05rem,2vw,1.35rem)] uppercase leading-tight tracking-[0.05em] text-sand">
                «{vehicle.nickname}»
              </p>
            </div>
          </header>

          {/* ── 2 · Blueprint del lateral ────────────────────────────────── */}
          <div
            role="img"
            aria-label={t.common.a11y.carDiagram}
            className="relative overflow-hidden border-b border-slate bg-bg-sunken px-4 pb-8 pt-9 sm:px-6"
          >
            <span
              aria-hidden="true"
              className="grid-blueprint-fine grid-fade pointer-events-none absolute inset-0 opacity-70"
            />

            {/* Dorsal fantasma detrás del dibujo: se hunde al girar la ficha */}
            <TiltDepth depth={-30} className="pointer-events-none absolute inset-0">
              <span
                aria-hidden="true"
                className="absolute inset-0 flex select-none items-center justify-center font-heading text-[clamp(5rem,16vw,9rem)] leading-none tracking-[0.06em] text-text-primary/[0.05]"
              >
                {unitCode}
              </span>
            </TiltDepth>

            {/* Chapa de datos del blueprint.
                Las dos chapas van en posición absoluta sobre el dibujo, así que
                no se empujan entre sí: por debajo de ~400 px de viewport sumaban
                más ancho que la tarjeta y se solapaban. La de tripulación, que es
                la redundante (el nombre ya está en la cabecera del bloque),
                aparece a partir de `sm`; la de vista se queda siempre y recorta. */}
            <span
              aria-hidden="true"
              className="absolute left-4 top-3 flex min-w-0 max-w-[70%] items-center gap-2 sm:left-6 sm:max-w-[48%]"
            >
              <span className="telemetry-label shrink-0 text-[0.5rem]">
                {t.car.blueprint.viewLabel}
              </span>
              <span className="truncate font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-text-secondary">
                {t.common.carViews["lateral-izq"]}
              </span>
            </span>

            <span
              aria-hidden="true"
              className="absolute right-4 top-3 hidden min-w-0 max-w-[48%] items-center gap-2 sm:right-6 sm:flex"
            >
              <span className="telemetry-label shrink-0 text-[0.5rem]">
                {t.car.fleet.crewLabel}
              </span>
              <span className="truncate font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-text-secondary">
                {crew.name}
              </span>
            </span>

            {/* El coche sale de la ficha hacia quien mira */}
            <TiltDepth depth={45} className="relative z-10">
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

          {/* ── 3 · Parrilla de specs ────────────────────────────────────── */}
          {/* Los hairlines salen del fondo a través de `gap-px`: así no hay que
              apagar bordes por celda en cada breakpoint. */}
          <dl className="grid grid-cols-1 gap-px bg-slate sm:grid-cols-2">
            <SpecCell
              label={t.car.specs.engine.label}
              value={raidMods.engine}
              className="bg-bg-surface"
            />
            <SpecCell
              label={t.car.specs.drivetrain.label}
              value={raidMods.drivetrain}
              className="bg-bg-surface"
            />
            <SpecCell
              label={t.car.specs.suspension.label}
              value={raidMods.suspension}
              className="bg-bg-surface"
            />
            <SpecCell
              label={t.car.specs.protection.label}
              value={raidMods.underbodyProtection}
              className="bg-bg-surface"
            />
          </dl>

          {/* ── 4 · Preparación de raid ──────────────────────────────────── */}
          <div className="border-t border-slate px-4 py-4 sm:px-5">
            <span className="telemetry-label telemetry-label-dash block text-[0.5625rem]">
              {t.car.prep.title}
            </span>
            <ul className="mt-3 flex flex-col gap-2.5">
              <li className="flex min-w-0 items-start gap-2.5">
                <Lightbulb
                  size={14}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className="mt-px shrink-0 text-amber"
                />
                <span className="min-w-0 text-[0.75rem] leading-snug text-text-secondary">
                  {raidMods.auxiliaryLights}
                </span>
              </li>
              <li className="flex min-w-0 items-start gap-2.5">
                <PackageOpen
                  size={14}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className="mt-px shrink-0 text-amber"
                />
                <span className="min-w-0 text-[0.75rem] leading-snug text-text-secondary">
                  {raidMods.cargoNotes}
                </span>
              </li>
            </ul>
          </div>

          {/* ── 5 · Carga solidaria + antigüedad ─────────────────────────── */}
          <div className="mt-auto grid grid-cols-[1fr_auto] items-center gap-4 border-t border-slate bg-bg-elevated px-4 py-3.5 sm:px-5">
            <div className="min-w-0">
              <span className="telemetry-label telemetry-label-lime text-[0.5625rem]">
                {t.route.table.charity}
              </span>
              <p className="mt-1.5 flex items-baseline gap-1.5">
                <span className="font-heading text-2xl leading-none tracking-[0.04em] text-lime">
                  {raidMods.cargoCapacityKg}
                </span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-text-tertiary">
                  kg
                </span>
              </p>
            </div>

            {/* Año de matriculación + antigüedad derivada en la edición.
                El "+30" es la prueba de la regla de coches de 20 años o más:
                se calcula, no se escribe.

                Va `aria-hidden`: su significado sólo existe en el `title`, y un
                tooltip que pide hover no es un canal accesible. Sin ocultarlo, un
                lector de pantalla anunciaría un "+30" desnudo y sin contexto
                detrás del año. Así se lee "Año · 1997", que está completo. */}
            <div className="min-w-0 shrink-0 text-right">
              <span className="telemetry-label text-[0.5625rem]">
                {t.car.fleet.yearLabel}
              </span>
              <p className="mt-1.5 flex items-baseline justify-end gap-1.5">
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
              </p>
            </div>
          </div>

          {/* ── 6 · Estado de preparación ────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3 border-t border-slate px-4 py-2.5 sm:px-5">
            <span className="telemetry-label shrink-0 text-[0.5625rem]">
              {t.team.preparationLabel}
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="status-dot shrink-0" />
              <span className="truncate font-mono text-[0.625rem] uppercase tracking-[0.16em] text-lime">
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
