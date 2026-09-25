"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <PilotPassport />
   Ficha de un miembro de la tripulación con estética "PILOT PASSPORT".
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Se lee como un documento de identidad / licencia FIA:

     ┌────────────────────────────────────────────┐
     │ ▮ BOAM RACING                BOAM·01·AL    │  cabecera del documento
     ├──────────┬─────────────────────────────────┤
     │  RETRATO │ PILOTO                          │
     │  (Rally  │ ALEX LORAS                      │
     │   Image) │ INDICATIVO · GRUPO · ORIGEN      │  campos etiquetados en mono
     │   ⊘sello │ 41°23'14.6"N 2°10'06.9"E        │
     ├──────────┴─────────────────────────────────┤
     │ bio (o bloque "por confirmar" con reglas)  │
     ├────────────────────────────────────────────┤
     │ REDES · @handle / por confirmar            │
     ├────────────────────────────────────────────┤
     │ RAID<BOAM<<ALEX<LORAS<<<<<<<<<<<<<<<<<<<<< │  banda MRZ decorativa
     └────────────────────────────────────────────┘

   REGLAS QUE CUMPLE ESTE FICHERO
   ------------------------------
   · DATOS: todo sale de `src/lib/team.ts` vía props. Aquí no hay ni un
     nombre, ni un grupo sanguíneo, ni una coordenada escritos a mano.
   · COPY: cualquier texto de interfaz viene de `useT()`. Los nombres
     propios (persona, apodo del coche, marca) NO se traducen.
   · PENDIENTES: los campos que en `team.ts` son el centinela `PENDING`
     nunca se pintan crudos. Se renderizan como un campo de documento aún
     sin rellenar (regla discontinua + "por confirmar"), que es
     exactamente lo que son.
   · MOVIMIENTO: framer-motion se desactiva con `useReducedMotion()`. El
     CSS global ya neutraliza las animaciones declarativas, pero las de JS
     hay que apagarlas a mano.
   · VOLUMEN: <TiltCard> pone giro, canto y sombra; el retrato con su sello
     flota por delante del documento con <TiltDepth>.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AtSign, Droplet, Fingerprint, Link2, MapPin, Music2 } from "lucide-react";

import RallyImage, { type RallyImageTone } from "@/components/ui/RallyImage";
import TiltCard, { TiltDepth } from "@/components/ui/TiltCard";
import { useT } from "@/i18n/LanguageProvider";
import { BRAND, formatDMS } from "@/lib/constants";
import { getTeamPortrait, isAssetReady } from "@/lib/imagery";
import type { Crew, CrewRole, TeamMember } from "@/lib/team";
import { isPending } from "@/lib/types";

/* ────────────────────────────────────────────────────────────
   Acentos por rol
   El piloto lleva el ámbar de acción; el copiloto, el oro arena.
   Las clases están escritas enteras a propósito: Tailwind no ve los
   nombres construidos por concatenación.
   ──────────────────────────────────────────────────────────── */

interface RoleTone {
  /**
   * Color del rótulo de rol y de los acentos del documento.
   *
   * El piloto usa `text-amber-text` y no `text-amber`: todo lo que pinta este
   * campo es texto de 8-11 px (rol, sello, handles) y el ámbar pleno se queda
   * en 3,87:1 sobre crema. `--color-amber-text` vale EXACTAMENTE lo mismo que
   * `--color-amber` en tactical (#FF6B00) y sube a 5,08:1 en desert, así que
   * el cambio es gratis en oscuro.
   */
  accentText: string;
  /** Barra vertical de la cabecera. */
  accentBar: string;
  /** Borde del sello de entrada. */
  stampBorder: string;
  /** Acento que se le pasa a <RallyImage />. */
  image: RallyImageTone;
}

const ROLE_TONE: Record<CrewRole, RoleTone> = {
  piloto: {
    accentText: "text-amber-text",
    accentBar: "bg-amber",
    stampBorder: "border-amber/50",
    image: "amber",
  },
  copiloto: {
    accentText: "text-sand",
    accentBar: "bg-sand",
    stampBorder: "border-sand/50",
    image: "sand",
  },
};

/** Curva de entrada del design system (equivalente JS de --ease-tactical). */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ────────────────────────────────────────────────────────────
   Utilidades de documento
   ──────────────────────────────────────────────────────────── */

/**
 * Pasa un valor a la tabla de caracteres de una banda MRZ real: mayúsculas,
 * sin diacríticos y con `<` en lugar de cualquier separador. Se aplica a
 * cada campo por separado para que el `<<` que separa campos sobreviva
 * (si se normalizase la línea entera, `<<` colapsaría a `<`).
 */
function mrzToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "<");
}

/** Rellena (o recorta) la línea a `length` para que ambas queden alineadas. */
function mrzPad(line: string, length: number): string {
  return `${line}${"<".repeat(length)}`.slice(0, length);
}

/* ────────────────────────────────────────────────────────────
   Piezas internas
   ──────────────────────────────────────────────────────────── */

/**
 * Campo del documento: etiqueta mono arriba, valor debajo.
 *
 * Apilado a propósito, no en dos columnas. Es como se maquetan los campos
 * de un pasaporte real y, sobre todo, es la única disposición que aguanta
 * etiquetas largas ("Grupo sanguíneo") dentro de una tarjeta estrecha sin
 * empujar el valor fuera del marco.
 */
function PassportField({
  label,
  children,
  icon,
}: {
  label: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="min-w-0 border-b border-slate/70 py-2 last:border-b-0">
      <dt className="telemetry-label flex min-w-0 items-center gap-1.5 text-[0.5rem] sm:text-[0.5625rem]">
        {icon}
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1 min-w-0 font-mono text-[0.6875rem] leading-tight text-text-primary">
        {children}
      </dd>
    </div>
  );
}

/**
 * Valor todavía sin confirmar. No decimos "PENDIENTE" en bruto: lo
 * dibujamos como lo que es, la casilla de un documento sin rellenar.
 */
function UnfilledValue({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-text-tertiary">
      <span aria-hidden="true" className="h-px w-5 bg-muted/50" />
      {label}
    </span>
  );
}

/** Bloque de bio sin rellenar: tres reglas discontinuas, como un impreso. */
function UnfilledParagraph({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span aria-hidden="true" className="flex flex-col gap-2">
        <span className="block h-px w-full border-t border-dashed border-slate" />
        <span className="block h-px w-full border-t border-dashed border-slate" />
        <span className="block h-px w-3/5 border-t border-dashed border-slate" />
      </span>
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </span>
    </div>
  );
}

/** Una red social ya declarada en `team.ts` (confirmada o pendiente). */
interface SocialRow {
  key: string;
  icon: ReactNode;
  handle: string;
}

/* ────────────────────────────────────────────────────────────
   API pública
   ──────────────────────────────────────────────────────────── */

export interface PilotPassportProps {
  /** Miembro a retratar. Viene de `CREWS[].pilot` / `.copilot`. */
  member: TeamMember;
  /** Su tripulación: aporta el código de unidad y el coche asignado. */
  crew: Crew;
  /** Retardo de entrada, en segundos, para escalonar la pareja. */
  delay?: number;
  /** Clases extra de colocación. Van en el envoltorio de la tarjeta. */
  className?: string;
}

export default function PilotPassport({
  member,
  crew,
  delay = 0,
  className = "",
}: PilotPassportProps) {
  const t = useT();
  const reduce = useReducedMotion() ?? false;

  const tone = ROLE_TONE[member.role];
  const roleLabel = member.role === "piloto" ? t.team.pilot : t.team.copilot;

  /* Número de documento: derivado, no inventado. BOAM·01·AL */
  const documentCode = `${BRAND.short}·${crew.code}·${member.initials}`;

  const portrait = getTeamPortrait(member.id);
  const portraitReady = portrait !== undefined && isAssetReady(portrait);

  /* Banda MRZ. Decorativa, pero construida con los datos reales del
     miembro para que aguante una lectura de cerca. */
  const mrz: readonly [string, string] = [
    mrzPad(`RAID<${mrzToken(BRAND.short)}<<${mrzToken(member.name)}`, 40),
    mrzPad(
      `${mrzToken(crew.code + member.initials)}<<${mrzToken(
        crew.vehicle.nickname,
      )}<<${mrzToken(member.homeCity)}`,
      40,
    ),
  ];

  /* Redes: sólo las declaradas en team.ts. Si todas siguen pendientes se
     muestra una única marca, no una lista de "pendiente" repetida. */
  const declaredSocials: SocialRow[] = [];
  if (member.socials.instagram !== undefined) {
    declaredSocials.push({
      key: "instagram",
      icon: <AtSign size={12} strokeWidth={1.75} aria-hidden="true" />,
      handle: member.socials.instagram,
    });
  }
  if (member.socials.tiktok !== undefined) {
    declaredSocials.push({
      key: "tiktok",
      icon: <Music2 size={12} strokeWidth={1.75} aria-hidden="true" />,
      handle: member.socials.tiktok,
    });
  }
  if (member.socials.linkedin !== undefined) {
    declaredSocials.push({
      key: "linkedin",
      icon: <Link2 size={12} strokeWidth={1.75} aria-hidden="true" />,
      handle: member.socials.linkedin,
    });
  }

  const confirmedSocials = declaredSocials.filter(
    (row) => !isPending(row.handle),
  );

  return (
    /* La entrada va FUERA de la tarjeta con volumen: si la llevara el
       artículo, la sombra del suelo se vería antes que el propio pasaporte. */
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : delay }}
      className={`min-w-0 ${className}`}
    >
      <TiltCard className="h-full" solid>
        <article className="panel group relative isolate flex h-full min-w-0 flex-col">
          {/* ── 1 · Cabecera del documento ───────────────────────────────── */}
          <header className="flex items-center justify-between gap-3 border-b border-slate px-4 py-2.5 sm:px-5">
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-3 w-[3px] shrink-0 ${tone.accentBar}`}
              />
              <span className="telemetry-label truncate text-[0.5625rem] sm:text-[0.625rem]">
                {t.common.brand.name}
              </span>
            </span>
            <span className="gps-label shrink-0 whitespace-nowrap">
              {documentCode}
            </span>
          </header>

          {/* ── 2 · Retrato + identidad ──────────────────────────────────── */}
          <div className="grid grid-cols-[88px_1fr] gap-4 p-4 sm:grid-cols-[104px_1fr] sm:gap-5 sm:p-5 xl:grid-cols-[120px_1fr]">
            <div className="min-w-0">
              {/* Retrato y sello salen del documento al girar la tarjeta */}
              <TiltDepth depth={30} className="relative">
                {portrait ? (
                  <RallyImage
                    image={portrait}
                    aspect="portrait"
                    tone={tone.image}
                    overlay="none"
                    showCaption={false}
                    chamfer={8}
                    sizes="(max-width: 639px) 88px, (max-width: 1279px) 104px, 120px"
                  />
                ) : (
                  /* Defensivo: los 8 retratos existen hoy en el manifiesto. */
                  <div
                    className="chamfer-sm flex aspect-[3/4] w-full items-center justify-center bg-bg-sunken"
                    aria-hidden="true"
                  >
                    <span className="font-heading text-2xl tracking-[0.12em] text-text-tertiary">
                      {member.initials}
                    </span>
                  </div>
                )}

                {/* Sello de entrada: la edición del rally, girado como en un
                    pasaporte de verdad. Puramente decorativo.

                    El desbordamiento hacia la derecha (`-right-3`) es lo que le
                    da el aire de sello pegado encima, pero por debajo de `sm` la
                    columna de identidad baja de ~200 px y el sello se comería los
                    valores del pasaporte. Ahí se queda dentro de su columna. */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-2 right-0 z-20 flex -rotate-[9deg] flex-col items-center gap-0.5 border px-1.5 py-1 sm:-right-3 ${tone.stampBorder} bg-bg-base/85`}
                >
                  <span
                    className={`font-mono text-[0.5rem] uppercase leading-none tracking-[0.18em] ${tone.accentText}`}
                  >
                    {t.common.brand.rally}
                  </span>
                  <span className="font-mono text-[0.5rem] uppercase leading-none tracking-[0.12em] text-text-secondary">
                    {t.common.edition.monthYearShort}
                  </span>
                </span>
              </TiltDepth>

              {!portraitReady && (
                <p className="telemetry-label mt-3 text-[0.5rem] leading-[1.5] tracking-[0.16em]">
                  {t.team.photoPlaceholder.badge}
                </p>
              )}
            </div>

            <div className="flex min-w-0 flex-col">
              <span
                className={`telemetry-label text-[0.5625rem] sm:text-[0.625rem] ${tone.accentText}`}
              >
                {roleLabel}
              </span>

              <h4 className="mt-1.5 font-heading text-[clamp(1.15rem,2.4vw,1.5rem)] uppercase leading-[0.95] tracking-[0.06em] text-text-primary">
                {member.name}
              </h4>

              <dl className="mt-4 flex flex-col">
                <PassportField
                  label={t.team.dossier.callsignLabel}
                  icon={<Fingerprint size={11} strokeWidth={1.75} aria-hidden="true" />}
                >
                  <span className="tracking-[0.18em]">{member.initials}</span>
                </PassportField>

                <PassportField
                  label={t.team.dossier.bloodLabel}
                  icon={<Droplet size={11} strokeWidth={1.75} aria-hidden="true" />}
                >
                  {isPending(member.bloodType) ? (
                    <UnfilledValue label={t.common.labels.tbd} />
                  ) : (
                    <span className="tech-badge tech-badge-lime">
                      {member.bloodType}
                    </span>
                  )}
                </PassportField>

                <PassportField
                  label={t.team.fromLabel}
                  icon={<MapPin size={11} strokeWidth={1.75} aria-hidden="true" />}
                >
                  <span className="block truncate">{member.homeCity}</span>
                  {/* Sin `nowrap`: en una tarjeta estrecha la coordenada parte
                      por el espacio entre latitud y longitud en vez de
                      desbordar el marco. */}
                  <span className="gps-label mt-0.5 block text-[0.5625rem] leading-snug">
                    {formatDMS(member.homeCoords)}
                  </span>
                </PassportField>
              </dl>
            </div>
          </div>

          {/* ── 3 · Biografía ────────────────────────────────────────────── */}
          <div className="border-t border-slate px-4 py-4 sm:px-5">
            <span className="telemetry-label telemetry-label-dash mb-2.5 block text-[0.5625rem]">
              {t.team.dossier.specialtyLabel}
            </span>
            {isPending(member.bio) ? (
              <UnfilledParagraph label={t.common.labels.tbd} />
            ) : (
              <p className="text-[0.8125rem] leading-relaxed text-text-secondary">
                {member.bio}
              </p>
            )}
          </div>

          {/* ── 4 · Redes ────────────────────────────────────────────────── */}
          {declaredSocials.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-slate px-4 py-2.5 sm:px-5">
              <span className="telemetry-label shrink-0 text-[0.5625rem]">
                {t.footer.socialLabel}
              </span>

              {confirmedSocials.length > 0 ? (
                <ul className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
                  {confirmedSocials.map((row) => (
                    <li key={row.key} className="min-w-0">
                      <span
                        className={`flex min-w-0 items-center gap-1.5 font-mono text-[0.6875rem] ${tone.accentText}`}
                      >
                        {row.icon}
                        <span className="truncate">{row.handle}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="flex min-w-0 items-center gap-2 text-text-tertiary">
                  <span aria-hidden="true" className="flex items-center gap-1.5">
                    {declaredSocials.map((row) => (
                      <span key={row.key} className="opacity-60">
                        {row.icon}
                      </span>
                    ))}
                  </span>
                  <UnfilledValue label={t.common.labels.tbd} />
                </span>
              )}
            </div>
          )}

          {/* ── 5 · Banda MRZ ────────────────────────────────────────────── */}
          <div
            aria-hidden="true"
            className="overflow-hidden border-t border-slate bg-bg-sunken px-4 py-2 sm:px-5"
          >
            <p className="whitespace-nowrap font-mono text-[0.5rem] leading-[1.7] tracking-[0.1em] text-text-tertiary/70 sm:text-[0.5625rem]">
              {mrz[0]}
              <br />
              {mrz[1]}
            </p>
          </div>
        </article>
      </TiltCard>
    </motion.div>
  );
}

export { PilotPassport };
