"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Modal de solicitud de patrocinio
   --------------------------------------------------------------------------
   Diálogo modal real: `role="dialog"` + `aria-modal`, foco atrapado dentro del
   panel, Escape cierra, el foco vuelve al elemento que lo abrió y el fondo deja
   de hacer scroll mientras está abierto. Se monta con `createPortal` sobre
   <body> para que ningún `overflow` o `clip-path` de la sección lo recorte.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  TRANSPORTE DEL FORMULARIO — DOS CAMINOS, Y EL SEGUNDO NO ES UN FALLO ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   La solicitud se rasteriza primero: cada vista con zonas rotuladas se
   convierte en un PNG (`renderPlates`). Después:

     1. Se envía a `POST /api/sponsor/request`, que lo manda por correo con
        las láminas adjuntas.
     2. Si esa ruta contesta 503 `not-configured` —no hay clave de correo dada
        de alta— se descargan las láminas y se abre el cliente de correo del
        usuario con la solicitud ya escrita, para que las adjunte a mano.

   El segundo camino es el que estaba antes, y sigue siendo la red de
   seguridad: un `mailto:` NO admite adjuntos (RFC 6068), así que sin servidor
   la imagen tiene que viajar por el disco del cliente. El diálogo lo dice con
   todas las letras en vez de fingir que se ha enviado.

   La dirección del equipo queda siempre visible en el pie por si el `mailto:`
   tampoco abre nada.
   ══════════════════════════════════════════════════════════════════════════ */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";

import { BRAND, CONTACT } from "@/lib/constants";
import { isArtworkEmpty, type ArtworkDesign } from "@/lib/sponsor/artwork";
import {
  base64Of,
  downloadPlate,
  renderPlates,
  type PlateRequest,
  type RenderedPlate,
} from "@/lib/sponsor/exportImage";
import { zoneBox } from "@/lib/sponsor/zoneBox";
import type { CarView } from "@/lib/types";
import { SPONSOR_TIERS, TIER_COLORS, formatTierPrice } from "@/lib/sponsors";
import type { SponsorTierId } from "@/lib/types";
import DossierLink from "@/components/ui/DossierLink";
import { useLocale, useT } from "@/i18n/LanguageProvider";
import { fill } from "@/i18n/translations";

import { SPONSOR_SCRIM } from "./sponsorPaint";
import type { ResolvedZone } from "./CarViewer";

/**
 * `preparing` y `fallback` son estados de verdad, no matices:
 * rasterizar cinco láminas tarda lo suyo y el botón tiene que decirlo, y
 * `fallback` significa "esto NO se ha enviado solo, te toca adjuntar" — dar
 * ahí el mismo acuse que en `sent` sería mentir.
 */
type SubmitStatus = "idle" | "preparing" | "sending" | "sent" | "fallback" | "error";

interface FormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  tier: SponsorTierId | "";
  message: string;
  consent: boolean;
}

const EMPTY_FORM: FormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  tier: "",
  message: "",
  consent: false,
};

/** Validación deliberadamente laxa: sólo descarta lo que no es una dirección. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface SponsorModalProps {
  open: boolean;
  onClose: () => void;
  /** Zonas que el usuario ha ido marcando en el visor. */
  selection: readonly ResolvedZone[];
  /** Nivel más alto que toca la selección; precarga el desplegable. */
  suggestedTier: SponsorTierId | null;
  /** Total estimado ya formateado por la sección, para copiarlo en el correo. */
  totalLabel: string;
  /** Rotulado compuesto por el cliente, indexado por `slot.id`. */
  artwork: ArtworkDesign;
  /** Marca tecleada en el configurador; encabeza cada lámina. */
  brand: string;
}

export default function SponsorModal({
  open,
  onClose,
  selection,
  suggestedTier,
  totalLabel,
  artwork,
  brand,
}: SponsorModalProps) {
  const t = useT();
  const { locale } = useLocale();
  const copy = t.sponsors.contactModal;

  /* Los ids del diálogo y de los mensajes de error tienen que ser ÚNICOS en el
     documento: "name-error" es un nombre demasiado probable para dejarlo fijo
     con otros formularios en la misma página. `useId` los hace propios de esta
     instancia sin romper la hidratación. */
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const errorId = (key: keyof FormValues) => `${uid}-${String(key)}-error`;

  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  /** Láminas ya rasterizadas: se enseñan en el acuse. */
  const [plates, setPlates] = useState<readonly RenderedPlate[]>([]);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  /* `onClose` llega casi siempre como una flecha en línea desde la sección
     (`() => dispatch({type:"closeModal"})`), así que cambia de identidad en
     CADA render del padre. Si el efecto del foco dependiera de ella, cualquier
     render del padre con el diálogo abierto ejecutaría su limpieza — y esa
     limpieza DEVUELVE EL FOCO al botón que abrió el modal. El usuario vería
     saltar el cursor fuera del campo que está rellenando. Se guarda en una ref
     y el efecto depende sólo de `open`, que es lo que de verdad lo gobierna. */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => setMounted(true), []);

  // Al abrir: formulario limpio y nivel precargado con el de la selección.
  useEffect(() => {
    if (!open) return;
    setValues({ ...EMPTY_FORM, tier: suggestedTier ?? "" });
    setErrors({});
    setStatus("idle");
    // Si no se limpian, al reabrir el diálogo aparecerían las miniaturas de
    // la solicitud ANTERIOR junto al formulario vacío de la siguiente.
    setPlates([]);
  }, [open, suggestedTier]);

  /* ── Foco atrapado, Escape y bloqueo del scroll de fondo ──────────────── */
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusables = (): HTMLElement[] => {
      const panel = panelRef.current;
      if (!panel) return [];
      return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
      );
    };

    const raf = window.requestAnimationFrame(() => {
      const first = focusables()[0];
      if (first) first.focus();
      else panelRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  /* ── Cuerpo de la solicitud, en texto plano ───────────────────────────── */
  const requestBody = useMemo(() => {
    const tierLabel = values.tier ? t.sponsors.tierLabels[values.tier] : copy.tierPlaceholder;
    const zoneLines =
      selection.length > 0
        ? selection
            .map(
              (zone) =>
                `  · ${zone.label} — ${t.sponsors.tierLabels[zone.slot.tier]} — ${zone.vinylLabel}`,
            )
            .join("\n")
        : `  · ${t.sponsors.configurator.zonesEmpty}`;

    return [
      `${copy.nameLabel}: ${values.name}`,
      `${copy.companyLabel}: ${values.company}`,
      `${copy.emailLabel}: ${values.email}`,
      `${copy.phoneLabel}: ${values.phone || "—"}`,
      `${copy.tierLabel}: ${tierLabel}`,
      "",
      `${copy.zonesLabel} (${selection.length}):`,
      zoneLines,
      "",
      `${t.sponsors.configurator.summaryTotalLabel}: ${totalLabel}`,
      "",
      `${copy.messageLabel}:`,
      values.message || "—",
    ].join("\n");
  }, [values, selection, totalLabel, copy, t]);

  /* ── Láminas a rasterizar ───────────────────────────────────────────────
     Una por VISTA con zonas rotuladas, no una por zona: el patrocinador
     quiere ver su logo sobre el coche entero, y cinco recortes sueltos de
     chapa no cuentan esa historia. Las zonas elegidas pero sin rotular no
     generan lámina — un contorno punteado vacío no informa de nada.
     ──────────────────────────────────────────────────────────────────────── */
  const plateRequests = useMemo<PlateRequest[]>(() => {
    const byView = new Map<CarView, PlateRequest["zones"][number][]>();

    for (const zone of selection) {
      const design = artwork[zone.slot.id];
      if (isArtworkEmpty(design)) continue;
      const view = zone.geometry.view;
      const list = byView.get(view) ?? [];
      list.push({
        id: zone.slot.id,
        label: zone.label,
        d: zone.geometry.d,
        box: zoneBox(zone.geometry.d),
        vinylLabel: zone.vinylLabel,
        artwork: design,
      });
      byView.set(view, list);
    }

    return [...byView.entries()].map(([view, zones]) => ({
      view,
      viewLabel: t.common.carViews[view],
      zones,
    }));
  }, [selection, artwork, t]);

  const validate = useCallback((): boolean => {
    const next: Partial<Record<keyof FormValues, string>> = {};
    if (values.name.trim().length === 0) next.name = t.common.labels.required;
    if (values.company.trim().length === 0) next.company = t.common.labels.required;
    if (!EMAIL_RE.test(values.email.trim())) next.email = t.common.labels.required;
    if (!values.consent) next.consent = t.common.labels.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [values, t]);

  /**
   * Plan B: descarga las láminas y abre el correo del usuario con la
   * solicitud escrita. Se usa cuando el servidor de correo no está dado de
   * alta, y también si la red se cae a mitad del envío — el trabajo del
   * cliente no se pierde por eso.
   */
  const handOver = useCallback(
    (rendered: readonly RenderedPlate[]): void => {
      for (const plate of rendered) downloadPlate(plate);

      try {
        void navigator.clipboard?.writeText(requestBody).catch(() => undefined);
      } catch {
        /* el portapapeles es una cortesía, no un requisito */
      }

      try {
        const subject = `${copy.title} · ${BRAND.name}`;
        window.location.href = `${CONTACT.mailto}?subject=${encodeURIComponent(
          subject,
        )}&body=${encodeURIComponent(requestBody)}`;
      } catch {
        /* Sin cliente de correo el diálogo sigue enseñando la dirección y el
           texto ya está en el portapapeles: no es un callejón sin salida. */
      }
    },
    [requestBody, copy.title],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!validate()) return;

      setStatus("preparing");

      /* Un fallo al rasterizar NO aborta la solicitud: el texto es lo que
         cierra el trato, la lámina es el acompañamiento. Se envía sin ella
         antes que no enviar nada. */
      let rendered: RenderedPlate[] = [];
      try {
        rendered = await renderPlates(plateRequests, {
          brand: values.company || brand,
          teamName: BRAND.name,
        });
      } catch {
        rendered = [];
      }
      setPlates(rendered);

      setStatus("sending");
      try {
        const response = await fetch("/api/sponsor/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            company: values.company,
            email: values.email,
            phone: values.phone,
            tier: values.tier ? t.sponsors.tierLabels[values.tier] : "",
            message: values.message,
            consent: values.consent,
            summary: requestBody,
            /* Para el acuse al cliente: ids que el servidor traduce él
               mismo, nunca texto libre (ver la ruta). */
            locale,
            tierId: values.tier ?? "",
            slotIds: selection.map((zone) => zone.slot.id),
            attachments: rendered.map((plate) => ({
              filename: plate.filename,
              content: base64Of(plate.dataUrl),
            })),
          }),
        });

        if (response.ok) {
          setStatus("sent");
          return;
        }
      } catch {
        /* Se cae al plan B igual que con un 503. */
      }

      handOver(rendered);
      setStatus("fallback");
    },
    [validate, plateRequests, values, brand, requestBody, handOver, t, locale, selection],
  );

  if (!mounted || !open) return null;

  const field = (key: keyof FormValues) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? errorId(key) : undefined,
  });

  const inputClass =
    "chamfer-quad-sm font-body w-full bg-bg-sunken px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/70 focus:outline-none";
  const inputStyle = { boxShadow: "inset 0 0 0 1px var(--color-slate)" } as const;
  const errorStyle = { boxShadow: "inset 0 0 0 1px var(--color-amber)" } as const;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      {/* Fondo: cierra al pulsar, pero no es un control anunciable.
          El velo NO puede ser `bg-bg-sunken/85`: ese token es el pozo del
          tema, y en desert el pozo es crema — un velo crema sobre una página
          crema no separa nada y el diálogo se quedaría flotando sin fondo.
          `SPONSOR_SCRIM` mantiene el pozo casi negro en tactical y oscurece
          con la tinta del texto en desert. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: SPONSOR_SCRIM }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="panel hud-frame hud-frame-slate relative z-[1] max-h-[92dvh] w-full max-w-2xl overflow-y-auto focus:outline-none sm:max-h-[88dvh]"
      >
        <div className="p-6 sm:p-8">
          {/* ── Cabecera ────────────────────────────────────────────────── */}
          <div className="border-slate mb-6 flex items-start justify-between gap-4 border-b pb-5">
            <div className="min-w-0">
              <p className="waypoint-tag mb-2">{t.sponsors.cta.tag}</p>
              <h2
                id={titleId}
                className="font-heading text-text-primary text-2xl leading-none font-bold tracking-wide uppercase sm:text-3xl"
              >
                {copy.title}
              </h2>
              <p id={descId} className="font-body text-text-secondary mt-2.5 text-sm leading-relaxed">
                {copy.desc}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.close}
              className="chamfer-quad-sm bg-bg-elevated text-text-secondary hover:text-amber-text shrink-0 px-3 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors"
            >
              ✕
            </button>
          </div>

          {status === "sent" || status === "fallback" ? (
            /* ── Acuse ───────────────────────────────────────────────────
               Dos desenlaces distintos con la misma forma. En `fallback` el
               correo NO ha salido solo: decir "enviado" dejaría al cliente
               esperando una respuesta a un mensaje que sigue en su
               borrador. */
            <div className="space-y-5 py-4 text-center">
              <span className="status-dot mx-auto block" />
              <p className="font-heading text-text-primary text-xl leading-tight font-bold tracking-wide uppercase">
                {status === "sent" ? copy.success : copy.fallback}
              </p>
              {plates.length > 0 ? (
                <ul className="flex flex-wrap justify-center gap-2">
                  {plates.map((plate) => (
                    <li key={plate.view}>
                      {/* Miniatura de la lámina: el cliente ve exactamente lo
                          que ha viajado (o lo que acaba de descargar). Es un
                          data URL propio, no un recurso remoto, así que no
                          pasa por el optimizador de imágenes de Next. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={plate.dataUrl}
                        alt={t.common.carViews[plate.view]}
                        className="border-slate h-20 w-auto border"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="font-body text-text-secondary text-sm">{copy.responseTime}</p>
              <a href={CONTACT.mailto} className="link-tactical font-mono text-amber-text text-xs tracking-[0.16em]">
                {CONTACT.email}
              </a>
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-tactical btn-outline mt-2"
                >
                  {copy.close}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Nombre */}
                <label className="block">
                  <span className="telemetry-label mb-2 block">
                    {copy.nameLabel}{" "}
                    <span className="text-amber-text" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">({t.common.labels.required})</span>
                  </span>
                  <input
                    type="text"
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    placeholder={copy.namePlaceholder}
                    autoComplete="name"
                    className={inputClass}
                    style={errors.name ? errorStyle : inputStyle}
                    {...field("name")}
                  />
                  {errors.name ? (
                    <span id={errorId("name")} className="telemetry-label telemetry-label-amber mt-1.5 block">
                      {errors.name}
                    </span>
                  ) : null}
                </label>

                {/* Empresa */}
                <label className="block">
                  <span className="telemetry-label mb-2 block">
                    {copy.companyLabel}{" "}
                    <span className="text-amber-text" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">({t.common.labels.required})</span>
                  </span>
                  <input
                    type="text"
                    value={values.company}
                    onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
                    placeholder={copy.companyPlaceholder}
                    autoComplete="organization"
                    className={inputClass}
                    style={errors.company ? errorStyle : inputStyle}
                    {...field("company")}
                  />
                  {errors.company ? (
                    <span id={errorId("company")} className="telemetry-label telemetry-label-amber mt-1.5 block">
                      {errors.company}
                    </span>
                  ) : null}
                </label>

                {/* Email */}
                <label className="block">
                  <span className="telemetry-label mb-2 block">
                    {copy.emailLabel}{" "}
                    <span className="text-amber-text" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">({t.common.labels.required})</span>
                  </span>
                  <input
                    type="email"
                    value={values.email}
                    onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                    placeholder={copy.emailPlaceholder}
                    autoComplete="email"
                    inputMode="email"
                    className={inputClass}
                    style={errors.email ? errorStyle : inputStyle}
                    {...field("email")}
                  />
                  {errors.email ? (
                    <span id={errorId("email")} className="telemetry-label telemetry-label-amber mt-1.5 block">
                      {errors.email}
                    </span>
                  ) : null}
                </label>

                {/* Teléfono */}
                <label className="block">
                  <span className="telemetry-label mb-2 block">
                    {copy.phoneLabel}{" "}
                    <span className="text-text-tertiary normal-case">
                      ({t.common.labels.optional})
                    </span>
                  </span>
                  <input
                    type="tel"
                    value={values.phone}
                    onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                    placeholder={copy.phonePlaceholder}
                    autoComplete="tel"
                    inputMode="tel"
                    className={inputClass}
                    style={inputStyle}
                  />
                </label>
              </div>

              {/* Nivel */}
              <label className="block">
                <span className="telemetry-label mb-2 block">{copy.tierLabel}</span>
                <select
                  value={values.tier}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, tier: e.target.value as SponsorTierId | "" }))
                  }
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="">{copy.tierPlaceholder}</option>
                  {SPONSOR_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {t.sponsors.tierLabels[tier.id]} — {formatTierPrice(tier)}
                    </option>
                  ))}
                </select>
              </label>

              {/* Zonas elegidas — sólo lectura, viene del visor */}
              <div>
                <p className="telemetry-label mb-2">
                  {copy.zonesLabel} ({selection.length})
                </p>
                <div className="panel-sunken chamfer-quad-sm max-h-36 overflow-y-auto p-3">
                  {selection.length === 0 ? (
                    <p className="font-body text-text-tertiary text-xs">
                      {t.sponsors.configurator.zonesEmpty}
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {selection.map((zone) => (
                        <li
                          key={zone.slot.id}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="h-2 w-2 shrink-0"
                              style={{ background: TIER_COLORS[zone.slot.tier] }}
                            />
                            <span className="font-body text-text-secondary truncate">
                              {zone.label}
                            </span>
                          </span>
                          <span className="font-mono text-text-tertiary shrink-0 text-[10px] tracking-[0.1em]">
                            {zone.vinylLabel}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Mensaje */}
              <label className="block">
                <span className="telemetry-label mb-2 block">{copy.messageLabel}</span>
                <textarea
                  rows={4}
                  value={values.message}
                  onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                  placeholder={copy.messagePlaceholder}
                  className={`${inputClass} resize-y`}
                  style={inputStyle}
                />
              </label>

              {/* Consentimiento */}
              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={values.consent}
                    onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
                    className="accent-amber mt-0.5 h-4 w-4 shrink-0"
                    {...field("consent")}
                  />
                  <span className="font-body text-text-secondary text-xs leading-relaxed">
                    {copy.consent}
                  </span>
                </label>
                {errors.consent ? (
                  <span id={errorId("consent")} className="telemetry-label telemetry-label-amber mt-1.5 block">
                    {errors.consent}
                  </span>
                ) : null}
              </div>

              {status === "error" ? (
                <p role="alert" className="font-body text-amber-text text-sm">
                  {copy.error}{" "}
                  <a href={CONTACT.mailto} className="link-tactical">
                    {CONTACT.email}
                  </a>
                </p>
              ) : null}

              {plateRequests.length > 0 ? (
                <p className="font-mono text-amber-text text-[11px] tracking-[0.12em]">
                  {fill(copy.attachments, { n: String(plateRequests.length) })}
                </p>
              ) : null}

              {/* Quien está rellenando esto quiere justo el documento que el
                  dossier ya contiene: dárselo aquí le ahorra la espera. */}
              <div className="border-slate border-t pt-5">
                <DossierLink />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-text-tertiary text-[10px] tracking-[0.14em] uppercase">
                  {copy.responseTime} · {CONTACT.email}
                </p>
                <button
                  type="submit"
                  disabled={status === "preparing" || status === "sending"}
                  className="btn-tactical btn-amber w-full sm:w-auto"
                >
                  {status === "preparing"
                    ? copy.preparing
                    : status === "sending"
                      ? copy.sending
                      : copy.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
