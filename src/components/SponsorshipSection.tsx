"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Sección de PATROCINIO (Módulo 5 de la spec)
   --------------------------------------------------------------------------
   Reescritura completa. Lo que había antes eran doce rectángulos dibujados a
   mano sobre una silueta de coche inventada, con tres niveles y tres precios
   que no existen en ningún sitio (EXPLORADOR / DISCOVERY / ADVENTURE). Aquí no
   se inventa ni una cifra:

     · Niveles, precios, plazas y matriz de inversión → src/lib/sponsors.ts
       (transcritos del dossier: PRINCIPAL / ORO / PLATA / BRONCE).
     · Geometría real de cada zona de la chapa       → src/lib/car/**
       (medida sobre los SVG del coche, no aproximada).
     · Todo el texto, en tres idiomas                → src/i18n/**

   ESTA SECCIÓN NO CALCULA GEOMETRÍA NI FIJA PRECIOS. Sólo compone:

       ┌ cabecera
       ├ CONFIGURADOR ─ pestañas de vista · TierFilter · CarViewer
       │                · panel de selección · lista textual de zonas
       ├ TARJETAS DE NIVEL (PRINCIPAL destacado: plaza única y exclusiva)
       ├ MATRIZ DE INVERSIÓN (tabla en escritorio, tarjetas apiladas en móvil)
       ├ ventajas · proceso · preguntas frecuentes
       └ CTA + SponsorModal

   ══════════════════════════════════════════════════════════════════════════
   CÓMO SE CALCULA EL "TOTAL ESTIMADO"
   ══════════════════════════════════════════════════════════════════════════
   El precio del dossier es POR NIVEL CONTRATADO, no por zona: ORO son 600 €
   que ya incluyen "2 logos en formato GRANDE" repartidos por el frontal y los
   laterales. Multiplicar 600 € por cada zona marcada sería mentir al
   patrocinador. Por eso el total suma UNA VEZ cada nivel distinto que toca la
   selección, y el desglose se enseña línea a línea junto al total para que se
   vea exactamente de dónde sale. Es una estimación de partida: la propuesta
   firme va en el dossier que se envía por correo.
   ══════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useId, useMemo, useReducer, useRef } from "react";

import CarViewer, {
  ALL_KNOWN_ZONE_IDS,
  CAR_VIEWS,
  formatTierAvailability,
  formatTierAvailabilityShort,
  isExclusiveTier,
  resolveZonesForView,
  type ResolvedZone,
  type TierFilterValue,
} from "@/components/sponsor/CarViewer";
import SponsorModal from "@/components/sponsor/SponsorModal";
import ZoneStudio from "@/components/sponsor/ZoneStudio";
import TierFilter from "@/components/sponsor/TierFilter";
import { SPONSOR_PAINT_CSS } from "@/components/sponsor/sponsorPaint";
import DossierLink from "@/components/ui/DossierLink";
import RallyImage from "@/components/ui/RallyImage";
import ScrollReveal from "@/components/ui/ScrollReveal";

import {
  EMPTY_ARTWORK,
  isArtworkEmpty,
  loadArtwork,
  saveArtwork,
  type ArtworkDesign,
  type ZoneArtwork,
} from "@/lib/sponsor/artwork";
import { CONTACT } from "@/lib/constants";
import {
  SPONSOR_TIERS,
  TIER_BENEFIT_MATRIX,
  TIER_COLORS,
  TIER_TEXT_COLORS,
  assertSlotZonesExist,
  availableSlots,
  formatTierPrice,
} from "@/lib/sponsors";
import type { CarView, SponsorTier, SponsorTierId } from "@/lib/types";

import { useT } from "@/i18n/LanguageProvider";
import type { Dict, MatrixRow, MatrixRowKey } from "@/i18n/translations";

/* ─────────────────────────────────────────────────────────────────────────
   1. Estado del configurador
   ─────────────────────────────────────────────────────────────────────────
   Un solo `useReducer` en vez de seis `useState` sueltos: varias acciones
   tocan más de un campo a la vez (elegir un nivel desde una tarjeta abre el
   modal Y precarga el nivel; vaciar la selección cierra el resumen), y así
   cada transición queda escrita en un sitio.
   ───────────────────────────────────────────────────────────────────────── */

interface ConfigState {
  /** Lámina del coche que se está mostrando. */
  readonly view: CarView;
  /** Nivel por el que se filtra el coche, o "all". */
  readonly tierFilter: TierFilterValue;
  /** Apaga las zonas ya vendidas. */
  readonly availableOnly: boolean;
  /** `slot.id` de las zonas elegidas. Se conserva al cambiar de vista. */
  readonly selectedIds: readonly string[];
  /** Marca que teclea el usuario; se estampa sobre las zonas elegidas. */
  readonly brand: string;
  /** Nivel pedido explícitamente desde una tarjeta de precio. */
  readonly requestedTier: SponsorTierId | null;
  readonly modalOpen: boolean;
  /** Rotulado compuesto por el cliente, indexado por `slot.id`. */
  readonly artwork: ArtworkDesign;
  /** Zona cuyo estudio de rotulación está abierto. */
  readonly studioSlotId: string | null;
}

type ConfigAction =
  | { readonly type: "setView"; readonly view: CarView }
  | { readonly type: "setTierFilter"; readonly value: TierFilterValue }
  | { readonly type: "setAvailableOnly"; readonly value: boolean }
  | { readonly type: "toggleZone"; readonly slotId: string }
  | { readonly type: "clearZones" }
  | { readonly type: "setBrand"; readonly value: string }
  | { readonly type: "requestTier"; readonly tier: SponsorTierId }
  | { readonly type: "openModal" }
  | { readonly type: "closeModal" }
  | { readonly type: "openStudio"; readonly slotId: string }
  | { readonly type: "closeStudio" }
  | { readonly type: "setArtwork"; readonly slotId: string; readonly artwork: ZoneArtwork }
  | { readonly type: "restoreArtwork"; readonly artwork: ArtworkDesign };

const INITIAL_STATE: ConfigState = {
  view: "lateral-izq",
  tierFilter: "all",
  availableOnly: false,
  selectedIds: [],
  brand: "",
  requestedTier: null,
  modalOpen: false,
  artwork: {},
  studioSlotId: null,
};

function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case "setView":
      return state.view === action.view ? state : { ...state, view: action.view };

    case "setTierFilter":
      return { ...state, tierFilter: action.value };

    case "setAvailableOnly":
      return { ...state, availableOnly: action.value };

    case "toggleZone": {
      const selected = state.selectedIds.includes(action.slotId);
      return {
        ...state,
        selectedIds: selected
          ? state.selectedIds.filter((id) => id !== action.slotId)
          : [...state.selectedIds, action.slotId],
      };
    }

    case "clearZones":
      return { ...state, selectedIds: [] };

    case "setBrand":
      return { ...state, brand: action.value };

    // Desde una tarjeta de nivel: se abre el modal ya apuntando a ese nivel.
    case "requestTier":
      return { ...state, requestedTier: action.tier, modalOpen: true };

    // Desde el configurador: manda la selección, no una tarjeta.
    case "openModal":
      return { ...state, requestedTier: null, modalOpen: true };

    case "closeModal":
      return { ...state, modalOpen: false };

    /* Abrir el estudio CONTRATA la zona: nadie rotula una chapa que no
       quiere, y el diálogo lleva su propio botón para quitarla. Si ya
       estaba elegida no se duplica. */
    case "openStudio":
      return {
        ...state,
        studioSlotId: action.slotId,
        selectedIds: state.selectedIds.includes(action.slotId)
          ? state.selectedIds
          : [...state.selectedIds, action.slotId],
      };

    case "closeStudio":
      return { ...state, studioSlotId: null };

    /* El rotulado NO se borra al quitar una zona de la selección: sólo se
       dibuja para las elegidas, así que no ensucia nada, y volver a marcar
       la zona devuelve el diseño intacto en vez de castigar un clic de
       más. */
    case "setArtwork":
      return {
        ...state,
        artwork: { ...state.artwork, [action.slotId]: action.artwork },
      };

    case "restoreArtwork":
      return { ...state, artwork: action.artwork };
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   2. Utilidades de presentación
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Importe en euros, formateado EXACTAMENTE igual que `formatTierPrice()` de
 * `src/lib/sponsors.ts`.
 *
 * Se replica su `toLocaleString("es-ES")` a propósito en vez de agrupar a mano:
 * el total y las tarjetas de nivel están a dos pantallazos el uno del otro y
 * tienen que escribir la misma cifra de la misma forma. Conviene saber que en
 * es-ES los millares de cuatro dígitos NO se agrupan (1500, no 1.500), que es
 * la regla CLDR `minimumGroupingDigits: 2`.
 *
 * Sin riesgo de hidratación: el total sólo existe después de que el usuario
 * marque una zona, así que el servidor nunca renderiza una cifra aquí.
 */
function formatEuros(amount: number): string {
  return `${Math.round(amount).toLocaleString("es-ES")} €`;
}

/** Niveles distintos que toca una selección, ordenados por rango. */
function tiersInSelection(selection: readonly ResolvedZone[]): SponsorTier[] {
  const seen = new Map<SponsorTierId, SponsorTier>();
  for (const zone of selection) seen.set(zone.tier.id, zone.tier);
  return Array.from(seen.values()).sort((a, b) => a.rank - b.rank);
}

/**
 * Suma de los niveles contratados. Ver la nota de cabecera.
 *
 * Devuelve `null` — y NO una suma parcial — en cuanto uno de los niveles tenga
 * el precio `PENDIENTE`. `SponsorTier.priceEur` es `MaybePending<number>`, así
 * que ese caso está contemplado por el modelo de datos aunque hoy los cuatro
 * niveles tengan cifra cerrada. Saltarse el nivel sin precio daría un total
 * MENOR que el real, que es justo la forma de equivocarse que no nos podemos
 * permitir en una página de patrocinio: mejor "a consultar" que una cifra baja.
 */
function estimateTotal(tiers: readonly SponsorTier[]): number | null {
  let total = 0;
  for (const tier of tiers) {
    if (typeof tier.priceEur !== "number") return null;
    total += tier.priceEur;
  }
  return total;
}

/* ─────────────────────────────────────────────────────────────────────────
   3. Sección
   ───────────────────────────────────────────────────────────────────────── */

export default function SponsorshipSection() {
  const t = useT();
  const [state, dispatch] = useReducer(configReducer, INITIAL_STATE);

  /* Las pestañas de vista son un `tablist` de verdad, así que necesitan un
     `tabpanel` real al que apuntar con `aria-controls`. `useId` da ids estables
     entre servidor y cliente sin colisionar con nada más de la página. */
  const uid = useId();
  const tabId = (view: CarView) => `${uid}-tab-${view}`;
  const panelId = `${uid}-panel`;

  /* ── Guardarraíl de desarrollo ──────────────────────────────────────────
     `src/lib/sponsors.ts` referencia la geometría sólo por texto (`zoneId`).
     Si alguien renombra una zona en `src/lib/car/**` el hueco dejaría de
     dibujarse en silencio; esto lo dice en voz alta en cuanto se abre la
     página en desarrollo. En producción no se ejecuta.
     ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const orphans = assertSlotZonesExist(ALL_KNOWN_ZONE_IDS);
    if (orphans.length > 0) {
      console.warn(
        `[BOAM · patrocinio] ${orphans.length} hueco(s) apuntan a una zona que la ` +
          `geometría de src/lib/car/** no conoce y por tanto NO se dibujan:\n  ` +
          orphans.join("\n  "),
      );
    }
  }, []);

  /* ── Zonas de la vista actual, ya cruzadas con copy y geometría ───────── */
  const zones = useMemo(() => resolveZonesForView(state.view, t), [state.view, t]);

  /** Todas las zonas de todas las vistas: la selección sobrevive al cambio. */
  const allZones = useMemo(
    () => CAR_VIEWS.flatMap((view) => resolveZonesForView(view, t)),
    [t],
  );

  const selection = useMemo(
    () =>
      state.selectedIds.flatMap((id) => {
        const zone = allZones.find((candidate) => candidate.slot.id === id);
        return zone ? [zone] : [];
      }),
    [state.selectedIds, allZones],
  );

  /* ── Contadores del filtro: cuántas zonas de cada nivel hay en la vista ── */
  const counts = useMemo<Record<TierFilterValue, number>>(() => {
    const visible = state.availableOnly
      ? zones.filter((zone) => zone.slot.status === "available")
      : zones;
    const result: Record<TierFilterValue, number> = {
      all: visible.length,
      principal: 0,
      oro: 0,
      plata: 0,
      bronce: 0,
    };
    for (const zone of visible) result[zone.slot.tier] += 1;
    return result;
  }, [zones, state.availableOnly]);

  /* ── Estimación ───────────────────────────────────────────────────────── */
  const selectedTiers = useMemo(() => tiersInSelection(selection), [selection]);
  const total = useMemo(() => estimateTotal(selectedTiers), [selectedTiers]);
  const totalLabel =
    selectedTiers.length > 0 && total !== null ? formatEuros(total) : t.common.labels.tbd;
  const suggestedTier =
    state.requestedTier ?? (selectedTiers.length > 0 ? selectedTiers[0].id : null);

  const handleToggleZone = useCallback((zone: ResolvedZone) => {
    dispatch({ type: "toggleZone", slotId: zone.slot.id });
  }, []);

  /* ── Rotulado ───────────────────────────────────────────────────────────
     Se rescata lo guardado DESPUÉS del primer render, nunca durante el
     estado inicial: `localStorage` no existe en el servidor y sembrar el
     reducer con él desde el cliente haría que el primer HTML del servidor y
     el del cliente no coincidieran — error de hidratación en toda regla.
     ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const stored = loadArtwork();
    if (stored && Object.keys(stored).length > 0) {
      dispatch({ type: "restoreArtwork", artwork: stored });
    }
  }, []);

  useEffect(() => {
    if (Object.keys(state.artwork).length === 0) return;
    saveArtwork(state.artwork);
  }, [state.artwork]);

  const studioZone = useMemo(
    () =>
      state.studioSlotId
        ? (allZones.find((zone) => zone.slot.id === state.studioSlotId) ?? null)
        : null,
    [state.studioSlotId, allZones],
  );

  const freeSlots = useMemo(() => availableSlots().length, []);

  /* La matriz del dossier, ya emparejada con su traducción. Se calcula UNA vez
     y alimenta a la vez la tabla comparativa y los bullets de las 4 tarjetas:
     así no pueden decir cosas distintas. */
  const matrix = useMemo(() => buildMatrix(t), [t]);

  return (
    <section
      id="patrocinio"
      className="bg-bg-base relative w-full overflow-hidden pb-24 sm:pb-32"
    >
      {/* Ajustes de pintura del visor para el tema claro. Esta sección es el
          único punto de montaje de todo `components/sponsor/**`, así que la
          hoja se declara aquí una sola vez. Contiene un único bloque
          `:root[data-theme="desert"]`: en tactical no casa nada. */}
      <style>{SPONSOR_PAINT_CSS}</style>

      {/* Rejilla de fondo, sin peso de red: es CSS del design system. */}
      <div
        aria-hidden="true"
        className="grid-blueprint grid-fade-y pointer-events-none absolute inset-0 opacity-50"
      />
      <span
        aria-hidden="true"
        className="side-label absolute top-32 right-2 hidden xl:block"
      >
        {t.sponsors.sideLabel}
      </span>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:px-12">
        {/* ══════════════════ Cabecera ══════════════════ */}
        <header className="mb-14 lg:mb-20">
          <p className="waypoint-tag mb-5">{t.sponsors.waypoint}</p>
          <h2 className="font-heading text-text-primary mb-6 text-[clamp(2.6rem,7vw,5.75rem)] leading-[0.88] font-bold tracking-[0.02em] uppercase">
            {t.sponsors.title.map((line, index) => (
              <span key={line} className="block">
                {index === t.sponsors.title.length - 1 ? (
                  <span className="text-gradient-amber">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h2>
          <p className="font-body text-text-secondary max-w-2xl text-base leading-[1.75]">
            {t.sponsors.intro}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="tech-badge tech-badge-lime">
              {freeSlots} · {t.sponsors.slotStatus.available}
            </span>
            <span className="tech-badge font-mono">
              {CAR_VIEWS.length} · {t.sponsors.configurator.viewLabel}
            </span>
          </div>
        </header>

        {/* ══════════════════ Configurador ══════════════════ */}
        <div className="divider-tech mb-10" />

        <h3 className="font-heading text-text-primary mb-2 text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[0.95] font-bold tracking-wide uppercase">
          {t.sponsors.configurator.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
        <p className="telemetry-label mb-8">{t.sponsors.configurator.hint}</p>

        <ViewTabs
          value={state.view}
          onChange={(view) => dispatch({ type: "setView", view })}
          tabId={tabId}
          panelId={panelId}
          t={t}
        />

        <div className="mt-6">
          <TierFilter
            value={state.tierFilter}
            onChange={(value) => dispatch({ type: "setTierFilter", value })}
            availableOnly={state.availableOnly}
            onAvailableOnlyChange={(value) =>
              dispatch({ type: "setAvailableOnly", value })
            }
            counts={counts}
          />
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:gap-8">
          {/* El panel que gobiernan las pestañas. No lleva `tabIndex={0}`: ya
              contiene controles enfocables (las zonas del coche y la lista),
              que es la condición que pide el patrón APG para no añadirlo. */}
          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId(state.view)}
            className="min-w-0"
          >
            <CarViewer
              view={state.view}
              zones={zones}
              selectedIds={state.selectedIds}
              tierFilter={state.tierFilter}
              availableOnly={state.availableOnly}
              brandName={state.brand}
              onToggleZone={handleToggleZone}
              onNavigateView={(view) => dispatch({ type: "setView", view })}
              artwork={state.artwork}
              onOpenStudio={(zone) =>
                dispatch({ type: "openStudio", slotId: zone.slot.id })
              }
            />

            {/* Alternativa textual al SVG: mismo control, sin dibujo. */}
            <ZoneListing
              zones={zones}
              selectedIds={state.selectedIds}
              tierFilter={state.tierFilter}
              availableOnly={state.availableOnly}
              onToggle={handleToggleZone}
              t={t}
            />
          </div>

          <SelectionPanel
            brand={state.brand}
            onBrandChange={(value) => dispatch({ type: "setBrand", value })}
            artwork={state.artwork}
            onEditArtwork={(zone) =>
              dispatch({ type: "openStudio", slotId: zone.slot.id })
            }
            selection={selection}
            tiers={selectedTiers}
            totalLabel={totalLabel}
            onRemove={handleToggleZone}
            onClear={() => dispatch({ type: "clearZones" })}
            onSubmit={() => dispatch({ type: "openModal" })}
            t={t}
          />
        </div>

        {/* ══════════════════ Tarjetas de nivel ══════════════════ */}
        <div className="divider-tech mt-20 mb-10 lg:mt-28" />

        <header className="mb-10">
          <p className="waypoint-tag mb-4">{t.sponsors.tiersTag}</p>
          <h3 className="font-heading text-text-primary text-[clamp(1.9rem,4.4vw,3.5rem)] leading-[0.92] font-bold tracking-wide uppercase">
            {t.sponsors.tiersTitle.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h3>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SPONSOR_TIERS.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              matrix={matrix}
              onRequest={() => dispatch({ type: "requestTier", tier: tier.id })}
              t={t}
            />
          ))}
        </ul>

        <p className="font-body text-text-tertiary mt-5 max-w-3xl text-xs leading-relaxed">
          {t.sponsors.tiersNote} · {t.sponsors.price.inKind}
        </p>

        {/* ══════════════════ Matriz de inversión ══════════════════ */}
        <div className="divider-tech mt-20 mb-10 lg:mt-28" />
        <InvestmentMatrix entries={matrix} t={t} />

        {/* ══════════════════ Ventajas ══════════════════ */}
        <div className="divider-tech mt-20 mb-10 lg:mt-28" />

        <p className="waypoint-tag mb-6">{t.sponsors.benefitsTag}</p>
        {/* `.animate-on-scroll` por sí sola deja el contenido en opacity:0 para
            siempre: quien añade `.is-visible` es <ScrollReveal>, que es la
            infraestructura de revelado que ya usa el resto de la web. */}
        <ul className="grid gap-px sm:grid-cols-2 xl:grid-cols-4">
          {t.sponsors.benefits.map((benefit, index) => (
            <li key={benefit.title} className="bg-bg-surface border-slate border">
              <ScrollReveal delay={index * 70} className="h-full p-6">
                <p className="telemetry-label telemetry-label-amber mb-3">{benefit.tag}</p>
                <h4 className="font-heading text-text-primary mb-2.5 text-lg leading-tight font-bold tracking-wide uppercase">
                  {benefit.title}
                </h4>
                <p className="font-body text-text-secondary text-sm leading-relaxed">
                  {benefit.desc}
                </p>
              </ScrollReveal>
            </li>
          ))}
        </ul>

        {/* ══════════════════ Proceso + FAQ ══════════════════ */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="waypoint-tag mb-4">{t.sponsors.process.tag}</p>
            <h4 className="font-heading text-text-primary mb-7 text-2xl leading-tight font-bold tracking-wide uppercase">
              {t.sponsors.process.title}
            </h4>
            <ol className="space-y-6">
              {t.sponsors.process.steps.map((step) => (
                <li key={step.num} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="font-mono text-amber-text shrink-0 text-xs tracking-[0.2em]"
                  >
                    {step.num}
                  </span>
                  <span className="min-w-0">
                    <span className="font-heading text-text-primary block text-base font-semibold tracking-wide uppercase">
                      {step.title}
                    </span>
                    <span className="font-body text-text-secondary mt-1.5 block text-sm leading-relaxed">
                      {step.desc}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="waypoint-tag mb-4">{t.sponsors.faqTag}</p>
            <dl className="border-slate border-t">
              {t.sponsors.faq.map((entry) => (
                <div key={entry.q} className="border-slate border-b py-5">
                  <dt className="font-heading text-text-primary text-base leading-snug font-semibold tracking-wide">
                    {entry.q}
                  </dt>
                  <dd className="font-body text-text-secondary mt-2 text-sm leading-relaxed">
                    {entry.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ══════════════════ CTA final ══════════════════ */}
        <div className="border-slate chamfer-lg bg-bg-surface relative mt-20 overflow-hidden border lg:mt-28">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
            <div className="relative z-10 p-7 sm:p-10 lg:p-12">
              <p className="waypoint-tag mb-5">{t.sponsors.cta.tag}</p>
              <h3 className="font-heading text-text-primary mb-5 text-[clamp(1.9rem,4.4vw,3.25rem)] leading-[0.9] font-bold tracking-wide uppercase">
                {t.sponsors.cta.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h3>
              <p className="font-body text-text-secondary mb-8 max-w-md text-sm leading-relaxed">
                {t.sponsors.cta.desc}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "openModal" })}
                  className="btn-tactical btn-amber"
                >
                  {t.sponsors.cta.primary}
                </button>
                <a href={CONTACT.mailto} className="btn-tactical btn-outline">
                  {t.sponsors.cta.secondary}
                </a>
                <DossierLink variant="button" />
              </div>

              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                <div>
                  <dt className="telemetry-label">{t.sponsors.contact.emailLabel}</dt>
                  <dd className="mt-1">
                    <a
                      href={CONTACT.mailto}
                      className="link-tactical font-mono text-text-primary text-xs tracking-[0.1em]"
                    >
                      {CONTACT.email}
                    </a>
                  </dd>
                </div>
                {/* Esta fila ya existía, pero su valor era el tiempo de
                    respuesta: decía "Dossier de patrocinio → Respuesta en
                    menos de 48 h". Era el hueco esperando al documento. */}
                <div>
                  <dt className="telemetry-label">{t.sponsors.contact.dossierLabel}</dt>
                  <dd className="mt-1">
                    <DossierLink />
                  </dd>
                </div>
              </dl>

              {/* El tiempo de respuesta ya es una frase entera ("Respuesta en
                  menos de 48 h"), así que no necesita etiqueta: como fila de
                  <dl> habría que inventarle un <dt> que no existe en i18n. */}
              <p className="font-mono text-text-tertiary mt-4 text-[0.6875rem] tracking-[0.12em]">
                {t.sponsors.contact.responseTime}
              </p>
            </div>

            {/* El archivo fotográfico aún no existe: RallyImage pinta su propio
                placeholder técnico, no una foto de stock. */}
            <div className="relative min-h-[240px] lg:min-h-full">
              <RallyImage
                image="coche-detalle-rotulacion"
                fillParent
                overlay="always"
                chamfer={false}
                showCaption={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estudio de rotulación. Se monta siempre: gestiona él mismo el portal
          y devuelve null sin zona, así que el estado del diálogo (elemento
          activo, error de subida) no se recrea a cada apertura. */}
      <ZoneStudio
        zone={studioZone}
        artwork={
          (studioZone ? state.artwork[studioZone.slot.id] : undefined) ?? EMPTY_ARTWORK
        }
        onChange={(artwork) => {
          if (!studioZone) return;
          dispatch({ type: "setArtwork", slotId: studioZone.slot.id, artwork });
        }}
        onClose={() => dispatch({ type: "closeStudio" })}
        selected={studioZone ? state.selectedIds.includes(studioZone.slot.id) : false}
        onRemoveZone={() => {
          if (!studioZone) return;
          dispatch({ type: "toggleZone", slotId: studioZone.slot.id });
          dispatch({ type: "closeStudio" });
        }}
      />

      <SponsorModal
        open={state.modalOpen}
        onClose={() => dispatch({ type: "closeModal" })}
selection={selection}
        artwork={state.artwork}
        brand={state.brand}
        suggestedTier={suggestedTier}
        totalLabel={totalLabel}
      />
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   4. Pestañas de vista
   ─────────────────────────────────────────────────────────────────────────
   `role="tablist"` de verdad: flechas para moverse, Inicio/Fin a los extremos,
   y sólo la pestaña activa es tabulable (patrón APG). El panel que gobiernan es
   el marco del visor, que vive en `CarViewer`.
   ───────────────────────────────────────────────────────────────────────── */

interface ViewTabsProps {
  value: CarView;
  onChange: (view: CarView) => void;
  /** Id del botón de una vista; el `tabpanel` se etiqueta con el de la activa. */
  tabId: (view: CarView) => string;
  /** Id del único `tabpanel`: las cinco pestañas gobiernan el mismo marco. */
  panelId: string;
  t: Dict;
}

function ViewTabs({ value, onChange, tabId, panelId, t }: ViewTabsProps) {
  const activeIndex = CAR_VIEWS.indexOf(value);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Sólo la pestaña activa es tabulable, así que al navegar con el teclado hay
   * que MOVER el foco con la selección: si no, el foco se quedaría clavado en
   * un botón con `tabIndex={-1}` y la siguiente flecha no llegaría al tablist.
   */
  const select = (index: number) => {
    const next = (index + CAR_VIEWS.length) % CAR_VIEWS.length;
    onChange(CAR_VIEWS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={t.sponsors.configurator.viewLabel}
      /* `flex-nowrap` + scroll, no `flex-wrap`: al envolver, el subrayado de
         `border-b-2` de la pestaña activa se despega del borde del tablist y
         por debajo de 400 px quedaban tres filas de pestañas. Así es una tira
         única que se desplaza, y `.focus()` arrastra la pestaña a la vista. */
      className="border-slate flex flex-nowrap items-center gap-x-1 overflow-x-auto border-b"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          select(activeIndex + 1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          select(activeIndex - 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          select(0);
        } else if (event.key === "End") {
          event.preventDefault();
          select(CAR_VIEWS.length - 1);
        }
      }}
    >
      {CAR_VIEWS.map((view, index) => {
        const isActive = view === value;
        return (
          <button
            key={view}
            type="button"
            role="tab"
            id={tabId(view)}
            aria-controls={panelId}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(view)}
            className={`font-mono -mb-px shrink-0 border-b-2 px-3 py-3 text-[0.6875rem] tracking-[0.18em] whitespace-nowrap uppercase transition-colors sm:px-4 ${
              isActive
                ? "border-amber text-text-primary"
                : "text-text-tertiary hover:text-text-primary border-transparent"
            }`}
          >
            {t.common.carViews[view]}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   5. Lista textual de zonas
   ─────────────────────────────────────────────────────────────────────────
   Alternativa al dibujo que pide la spec de accesibilidad: exactamente las
   mismas zonas y el mismo control, en forma de lista. También es la ruta rápida
   en móvil, donde apuntar a un faldón de 17 cm dentro de un SVG es incómodo
   aunque haya zoom. Se abre plegada para no partir la lectura de la página.
   ───────────────────────────────────────────────────────────────────────── */

interface ZoneListingProps {
  zones: readonly ResolvedZone[];
  selectedIds: readonly string[];
  tierFilter: TierFilterValue;
  availableOnly: boolean;
  onToggle: (zone: ResolvedZone) => void;
  t: Dict;
}

function ZoneListing({
  zones,
  selectedIds,
  tierFilter,
  availableOnly,
  onToggle,
  t,
}: ZoneListingProps) {
  const visible = zones.filter((zone) => {
    if (availableOnly && zone.slot.status !== "available") return false;
    return tierFilter === "all" || zone.slot.tier === tierFilter;
  });

  return (
    <details className="panel chamfer-quad-sm group mt-4">
      <summary className="font-mono text-text-secondary hover:text-text-primary flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[0.6875rem] tracking-[0.16em] uppercase transition-colors [&::-webkit-details-marker]:hidden">
        <span>
          {t.sponsors.configurator.selectZone}
          <span className="text-text-tertiary ml-2">({visible.length})</span>
        </span>
        <span aria-hidden="true" className="text-amber transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>

      <ul className="border-slate divide-slate divide-y border-t">
        {visible.length === 0 ? (
          <li className="font-body text-text-tertiary px-4 py-4 text-xs">
            {t.sponsors.configurator.zonesEmpty}
          </li>
        ) : (
          visible.map((zone) => {
            const isSelected = selectedIds.includes(zone.slot.id);
            const occupied = zone.slot.status === "occupied";
            return (
              <li key={zone.slot.id}>
                <button
                  type="button"
                  onClick={() => onToggle(zone)}
                  disabled={occupied}
                  aria-pressed={occupied ? undefined : isSelected}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    occupied
                      ? "cursor-not-allowed opacity-45"
                      : isSelected
                        ? "bg-lime/10"
                        : "hover:bg-bg-elevated"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0"
                    style={{ background: TIER_COLORS[zone.slot.tier] }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-body text-text-primary block truncate text-sm">
                      {zone.label}
                    </span>
                    <span className="font-mono text-text-tertiary block text-[0.625rem] tracking-[0.12em] uppercase">
                      {t.sponsors.tierLabels[zone.slot.tier]} · {zone.vinylLabel} ·{" "}
                      {t.sponsors.slotStatus[zone.slot.status]}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`font-mono shrink-0 text-[0.625rem] tracking-[0.16em] uppercase ${
                      isSelected ? "text-lime" : "text-text-tertiary"
                    }`}
                  >
                    {occupied ? "—" : isSelected ? "✓" : "+"}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </details>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   6. Panel de selección
   ───────────────────────────────────────────────────────────────────────── */

interface SelectionPanelProps {
  /** Rotulado por `slot.id`: marca qué zonas ya tienen diseño. */
  artwork: ArtworkDesign;
  /** Reabrir el estudio de una zona ya elegida. */
  onEditArtwork: (zone: ResolvedZone) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  selection: readonly ResolvedZone[];
  tiers: readonly SponsorTier[];
  totalLabel: string;
  onRemove: (zone: ResolvedZone) => void;
  onClear: () => void;
  onSubmit: () => void;
  t: Dict;
}

function SelectionPanel({
  artwork,
  onEditArtwork,
  brand,
  onBrandChange,
  selection,
  tiers,
  totalLabel,
  onRemove,
  onClear,
  onSubmit,
  t,
}: SelectionPanelProps) {
  const empty = selection.length === 0;
  const copy = t.sponsors.configurator;

  return (
    /* <div> y no <aside>: el panel vive DENTRO de la seccion de patrocinio,
       y un complementary anidado en otro landmark es un error de ARIA
       (axe: landmark-complementary-is-top-level). */
    <div className="panel hud-frame hud-frame-slate lg:sticky lg:top-24">
      <div className="space-y-6 p-5 sm:p-6">
        <p className="telemetry-label telemetry-label-dash">{copy.summaryTitle}</p>

        {/* ── Marca ── */}
        <label className="block">
          <span className="telemetry-label mb-2 block">{copy.brandLabel}</span>
          <input
            type="text"
            value={brand}
            onChange={(event) => onBrandChange(event.target.value)}
            placeholder={copy.brandPlaceholder}
            maxLength={40}
            autoComplete="organization"
            className="chamfer-quad-sm font-mono bg-bg-sunken text-text-primary placeholder:text-text-tertiary w-full px-3.5 py-2.5 text-sm tracking-[0.12em] uppercase focus:outline-none"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-slate)" }}
          />
        </label>

        {/* ── Zonas elegidas ── */}
        <div className="border-slate border-t pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="telemetry-label">
              {copy.zonesLabel} ({selection.length})
            </span>
            {!empty ? (
              <button
                type="button"
                onClick={onClear}
                className="font-mono text-text-tertiary hover:text-amber-text text-[0.625rem] tracking-[0.16em] uppercase transition-colors"
              >
                {copy.clearAll}
              </button>
            ) : null}
          </div>

          {empty ? (
            <p className="font-body text-text-tertiary text-xs leading-relaxed">
              {copy.zonesEmpty}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {selection.map((zone) => (
                <li
                  key={zone.slot.id}
                  className="bg-bg-elevated chamfer-quad-sm flex items-center gap-2 py-1.5 pr-1.5 pl-2.5"
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0"
                    style={{ background: TIER_COLORS[zone.slot.tier] }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-mono text-text-primary block truncate text-[0.6875rem] tracking-[0.1em] uppercase">
                      {zone.label}
                    </span>
                    <span className="font-mono text-text-tertiary block text-[0.625rem] tracking-[0.1em]">
                      {zone.vinylLabel}
                      {isArtworkEmpty(artwork[zone.slot.id])
                        ? ""
                        : ` · ${t.sponsors.studio.lettered}`}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditArtwork(zone)}
                    aria-label={`${t.sponsors.studio.edit}: ${zone.label}`}
                    className="font-mono text-text-tertiary hover:text-amber-text shrink-0 px-2 text-[0.625rem] tracking-[0.14em] uppercase transition-colors"
                  >
                    {t.sponsors.studio.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(zone)}
                    aria-label={`${copy.removeZone}: ${zone.label}`}
                    className="font-mono text-text-tertiary hover:text-amber-text h-7 w-7 shrink-0 text-xs transition-colors"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Desglose y total ── */}
        <div className="border-slate border-t pt-5">
          <span className="telemetry-label mb-3 block">{copy.summaryTierLabel}</span>

          {tiers.length === 0 ? (
            <p className="font-mono text-text-tertiary text-[0.6875rem] tracking-[0.12em] uppercase">
              {t.common.labels.tbd}
            </p>
          ) : (
            <ul className="mb-4 space-y-1.5">
              {tiers.map((tier) => (
                <li key={tier.id} className="flex items-baseline justify-between gap-3">
                  <span
                    className="font-mono text-[0.6875rem] tracking-[0.14em] uppercase"
                    style={{ color: TIER_TEXT_COLORS[tier.id] }}
                  >
                    {t.sponsors.tierLabels[tier.id]}
                  </span>
                  <span className="font-mono text-text-secondary text-[0.6875rem] tracking-[0.1em]">
                    {formatTierPrice(tier)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="border-slate flex items-baseline justify-between gap-3 border-t pt-3">
            <span className="telemetry-label">{copy.summaryTotalLabel}</span>
            <span className="font-heading text-amber text-2xl leading-none font-bold">
              {totalLabel}
            </span>
          </div>
          <p className="font-mono text-text-tertiary mt-2 text-[0.625rem] leading-relaxed tracking-[0.08em]">
            {t.sponsors.price.vatNote}
          </p>
        </div>

        {/* ── Enviar ── */}
        <div className="border-slate border-t pt-5">
          <button
            type="button"
            onClick={onSubmit}
            disabled={empty}
            className="btn-tactical btn-amber w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copy.submit}
          </button>
          {empty ? (
            <p className="telemetry-label mt-2.5">{copy.submitHint}</p>
          ) : (
            <p className="telemetry-label mt-2.5">{t.sponsors.contact.responseTime}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   7. Tarjeta de nivel
   ─────────────────────────────────────────────────────────────────────────
   Los bullets NO son una lista aparte: son la columna de ese nivel en
   `TIER_BENEFIT_MATRIX`, saltando los `null` (el guion del dossier). Una sola
   fuente para la tabla y para las cuatro tarjetas, así que no pueden
   contradecirse.
   ───────────────────────────────────────────────────────────────────────── */

interface TierCardProps {
  tier: SponsorTier;
  matrix: readonly MatrixEntry[];
  onRequest: () => void;
  t: Dict;
}

function TierCard({ tier, matrix, onRequest, t }: TierCardProps) {
  /* El filo superior es una superficie de color (basta 3:1) y va con el color
     de marca del nivel; el rótulo y los bullets son texto pequeño y van con la
     tinta legible. En tactical ambas son el mismo valor. */
  const color = TIER_COLORS[tier.id];
  const ink = TIER_TEXT_COLORS[tier.id];
  const exclusive = isExclusiveTier(tier);
  const bullets = matrixColumn(matrix, tier.id);

  return (
    <li
      className={`bg-bg-surface relative flex flex-col border p-6 ${
        tier.highlight ? "border-lime" : "border-slate"
      }`}
      style={tier.highlight ? { boxShadow: "0 0 0 1px var(--color-lime)" } : undefined}
    >
      {/* Filo de color del nivel. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: color }}
      />

      {tier.highlight ? (
        <span className="tech-badge tech-badge-lime absolute top-4 right-4">
          {t.sponsors.featuredLabel}
        </span>
      ) : null}

      <p
        className="font-mono mb-3 text-[0.6875rem] font-semibold tracking-[0.24em] uppercase"
        style={{ color: ink }}
      >
        {t.sponsors.tierLabels[tier.id]}
      </p>

      <p className="font-heading text-text-primary mb-1 text-4xl leading-none font-bold tracking-wide">
        {formatTierPrice(tier)}
      </p>
      <p className="font-mono text-text-tertiary mb-4 text-[0.625rem] tracking-[0.14em] uppercase">
        {t.sponsors.price.oneOff}
      </p>

      {/* Disponibilidad: PRINCIPAL deja claro que es plaza única y exclusiva. */}
      <p className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className={`tech-badge font-mono ${exclusive ? "tech-badge-lime" : ""}`}>
          {formatTierAvailability(tier, t)}
        </span>
        {exclusive ? (
          <span className="tech-badge tech-badge-lime font-mono">
            {t.sponsors.availability.exclusive}
          </span>
        ) : null}
      </p>

      <p className="font-body text-text-secondary mb-5 text-sm leading-relaxed">
        {t.sponsors.tierHeadlines[tier.id]}
      </p>

      {/* Banda de visibilidad que le asigna el dossier. */}
      <div className="border-slate mb-5 border-t pt-4">
        <p className="telemetry-label mb-1.5">
          {t.sponsors.visibility[tier.visibility].label}
        </p>
        <p className="font-body text-text-tertiary text-xs leading-relaxed">
          {t.sponsors.visibility[tier.visibility].areas}
        </p>
      </div>

      <ul className="mb-6 flex-1 space-y-2">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2.5">
            <span aria-hidden="true" className="shrink-0" style={{ color: ink }}>
              ▸
            </span>
            <span className="font-body text-text-secondary text-xs leading-relaxed">
              {bullet}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onRequest}
        className={`btn-tactical w-full ${tier.highlight ? "btn-lime" : "btn-outline"}`}
      >
        {t.sponsors.tierCta[tier.id]}
      </button>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   8. Matriz de inversión
   ─────────────────────────────────────────────────────────────────────────
   `TIER_BENEFIT_MATRIX` manda en la ESTRUCTURA (qué filas hay y qué celdas
   llevan guion) y `t.sponsors.matrix` pone el texto. Se emparejan por índice a
   través de `matrix.order`, que el diccionario mantiene en el mismo orden que
   la matriz — así está documentado en `src/i18n/sections/sponsors.ts`.

   Las tablas de columnas fijas no caben en un móvil, así que hay dos
   presentaciones de los MISMOS datos: `<table>` con scroll horizontal propio a
   partir de `lg`, y una tarjeta apilada por nivel por debajo. Sólo una de las
   dos está en el árbol de accesibilidad en cada momento (la otra queda oculta
   con `hidden`, que sí la retira del árbol), así que un lector de pantalla no
   lee la matriz dos veces.
   ───────────────────────────────────────────────────────────────────────── */

/** Filas de la matriz, con la estructura de `sponsors.ts` y el texto de i18n. */
interface MatrixEntry {
  readonly key: string;
  readonly concept: string;
  readonly values: Readonly<Record<SponsorTierId, string | null>>;
}

function buildMatrix(t: Dict): MatrixEntry[] {
  // Se indexan de forma tolerante: si algún día la matriz de datos creciera y
  // el diccionario no, la fila se pinta con el texto del dossier en vez de
  // reventar. La estructura (los `null`) sale SIEMPRE de `sponsors.ts`.
  const order: readonly (MatrixRowKey | undefined)[] = t.sponsors.matrix.order;
  const rows: Readonly<Record<string, MatrixRow | undefined>> = t.sponsors.matrix.rows;

  return TIER_BENEFIT_MATRIX.map((row, index) => {
    const key = order[index];
    const copy = key === undefined ? undefined : rows[key];

    // El guion del dossier manda: si `sponsors.ts` dice `null`, la celda es un
    // guion en los tres idiomas. El diccionario sólo pone el texto de las
    // celdas que SÍ tienen contenido.
    const cell = (tierId: SponsorTierId): string | null =>
      row.values[tierId] === null ? null : (copy?.values[tierId] ?? row.values[tierId]);

    return {
      key: key ?? `row-${index}`,
      concept: copy?.concept ?? row.concept,
      values: {
        principal: cell("principal"),
        oro: cell("oro"),
        plata: cell("plata"),
        bronce: cell("bronce"),
      },
    };
  });
}

/** Columna de un nivel: sus celdas con contenido, saltando los guiones. */
function matrixColumn(matrix: readonly MatrixEntry[], tierId: SponsorTierId): string[] {
  return matrix.flatMap((entry) => {
    const value = entry.values[tierId];
    return value === null ? [] : [value];
  });
}

interface InvestmentMatrixProps {
  entries: readonly MatrixEntry[];
  t: Dict;
}

function InvestmentMatrix({ entries, t }: InvestmentMatrixProps) {
  const copy = t.sponsors.matrix;

  return (
    <div>
      <header className="mb-10">
        <p className="waypoint-tag mb-4">{copy.tag}</p>
        <h3 className="font-heading text-text-primary mb-5 text-[clamp(1.9rem,4.4vw,3.5rem)] leading-[0.92] font-bold tracking-wide uppercase">
          {copy.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
        <p className="font-body text-text-secondary max-w-2xl text-sm leading-relaxed">
          {copy.intro}
        </p>
      </header>

      {/* ── Escritorio: tabla comparativa ─────────────────────────────── */}
      <div className="border-slate hidden overflow-x-auto border lg:block">
        <table className="w-full min-w-[54rem] border-collapse text-left">
          <caption className="sr-only">
            {copy.title.join(" ")} — {copy.intro}
          </caption>
          <thead>
            <tr className="border-slate bg-bg-elevated border-b">
              <th scope="col" className="telemetry-label px-5 py-4 align-bottom">
                {copy.conceptHeader}
              </th>
              {SPONSOR_TIERS.map((tier) => (
                <th
                  key={tier.id}
                  scope="col"
                  className={`px-5 py-4 align-bottom ${
                    tier.highlight ? "bg-lime/[0.07]" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="mb-3 block h-[3px] w-10"
                    style={{ background: TIER_COLORS[tier.id] }}
                  />
                  <span
                    className="font-mono block text-[0.6875rem] font-semibold tracking-[0.22em] uppercase"
                    style={{ color: TIER_TEXT_COLORS[tier.id] }}
                  >
                    {t.sponsors.tierLabels[tier.id]}
                  </span>
                  <span className="font-heading text-text-primary mt-1.5 block text-xl leading-none font-bold">
                    {formatTierPrice(tier)}
                  </span>
                  <span className="font-mono text-text-tertiary mt-1.5 block text-[0.625rem] tracking-[0.12em] uppercase">
                    {formatTierAvailabilityShort(tier, t)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.key} className="border-slate border-b last:border-b-0">
                <th
                  scope="row"
                  className="font-body text-text-primary bg-bg-surface/60 px-5 py-4 align-top text-sm font-medium"
                >
                  {entry.concept}
                </th>
                {SPONSOR_TIERS.map((tier) => {
                  const value = entry.values[tier.id];
                  return (
                    <td
                      key={tier.id}
                      className={`px-5 py-4 align-top text-sm ${
                        tier.highlight ? "bg-lime/[0.05]" : ""
                      }`}
                    >
                      {value === null ? (
                        <>
                          <span aria-hidden="true" className="text-text-tertiary font-mono">
                            —
                          </span>
                          <span className="sr-only">{copy.notIncluded}</span>
                        </>
                      ) : (
                        <span className="font-body text-text-secondary leading-snug">
                          {value}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Móvil y tableta: una tarjeta apilada por nivel ─────────────── */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {SPONSOR_TIERS.map((tier) => (
          <li
            key={tier.id}
            className={`bg-bg-surface relative border p-5 ${
              tier.highlight ? "border-lime" : "border-slate"
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: TIER_COLORS[tier.id] }}
            />
            <div className="border-slate mb-4 flex items-baseline justify-between gap-3 border-b pb-3">
              <span
                className="font-mono text-[0.6875rem] font-semibold tracking-[0.22em] uppercase"
                style={{ color: TIER_TEXT_COLORS[tier.id] }}
              >
                {t.sponsors.tierLabels[tier.id]}
              </span>
              <span className="font-heading text-text-primary text-lg leading-none font-bold">
                {formatTierPrice(tier)}
              </span>
            </div>
            <p className="font-mono text-text-tertiary mb-4 text-[0.625rem] tracking-[0.12em] uppercase">
              {formatTierAvailabilityShort(tier, t)}
            </p>

            <dl className="space-y-3">
              {entries.map((entry) => {
                const value = entry.values[tier.id];
                return (
                  <div key={entry.key}>
                    <dt className="telemetry-label">{entry.concept}</dt>
                    <dd
                      className={`font-body mt-1 text-xs leading-snug ${
                        value === null ? "text-text-tertiary" : "text-text-secondary"
                      }`}
                    >
                      {value === null ? copy.notIncluded : value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ul>

      <p className="font-body text-text-tertiary mt-5 max-w-3xl text-xs leading-relaxed">
        {copy.footnote}
      </p>
    </div>
  );
}
