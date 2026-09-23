"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Estudio de rotulación de una zona
   --------------------------------------------------------------------------
   Se abre al pulsar una zona libre del coche: la amplía a pantalla completa y
   deja al cliente colocar su logo y sus textos sobre ella.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  LA CONVERSIÓN PANTALLA → DIBUJO SALE DE getScreenCTM()               ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   `CarViewer` resuelve el problema al revés: estira el `viewBox` hasta la
   relación de aspecto del contenedor (`fitBox`) para que la regla de tres
   píxel↔unidad sea exacta. Aquí no se puede: el encuadre lo manda la zona, no
   el marco, y `preserveAspectRatio` mete bandas arriba o a los lados según la
   forma del polígono — una lateral es apaisadísima, un pilono casi cuadrado.

   Con bandas, la regla de tres miente y el logo se va del cursor. La matriz
   que devuelve `getScreenCTM()` YA incluye esas bandas, así que invertirla da
   la posición exacta sea cual sea el encuadre. Es además lo que hace que el
   arrastre siga siendo fiel si el usuario redimensiona la ventana a media
   operación.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  ABRIR EL ESTUDIO CONTRATA LA ZONA                                    ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   Nadie rotula una chapa que no quiere. Si la zona no estaba en la selección,
   entrar aquí la añade — y se puede quitar desde el propio pie del diálogo.
   ══════════════════════════════════════════════════════════════════════════ */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";

import { CAR_SVG_SRC, LINE_STYLE, loadLineArt, peekLineArt } from "@/lib/car/lineArt";
import { CM_PER_UNIT_BY_VIEW } from "@/lib/car/scale";
import {
  ARTWORK_FONTS,
  ARTWORK_WEIGHTS,
  MAX_IMAGE_WIDTH_PCT,
  MAX_TEXT_SIZE_PCT,
  MIN_IMAGE_WIDTH_PCT,
  MIN_TEXT_SIZE_PCT,
  CAR_PAINT_HEX,
  VINYL_COLORS,
  clamp,
  createImageItem,
  createTextItem,
  itemBox,
  itemVinylCm,
  moveItem,
  scaleItem,
  type ArtworkItem,
  type ArtworkTextItem,
  type ZoneArtwork,
} from "@/lib/sponsor/artwork";
import {
  ACCEPTED_IMAGE_TYPES,
  ImageImportError,
  importLogo,
  type ImportFailure,
} from "@/lib/sponsor/importImage";
import { zoneBox, zoneOrigin } from "@/lib/sponsor/zoneBox";
import { useT } from "@/i18n/LanguageProvider";

import { ArtworkNode } from "./ZoneArtworkLayer";
import { SPONSOR_SCRIM } from "./sponsorPaint";
import type { ResolvedZone } from "./CarViewer";

/* ─────────────────────────────────────────────────────────────────────────
   1. Utilidades
   ───────────────────────────────────────────────────────────────────────── */

/** Aire alrededor de la zona, como fracción de su lado mayor. */
const FRAME_PADDING = 0.24;

/** Paso del desplazamiento con las flechas, en fracción del bbox. */
const NUDGE = 0.01;
const NUDGE_FINE = 0.002;

/**
 * Punto del puntero en unidades de dibujo.
 *
 * Devuelve `null` si el SVG todavía no está en el layout (`getScreenCTM()` da
 * `null` mientras el elemento no tiene caja). Quien llama aborta el gesto en
 * vez de colocar el elemento en 0,0.
 */
function toUserSpace(
  svg: SVGSVGElement | null,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  if (!svg) return null;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: point.x, y: point.y };
}

/** Mismo campo que el formulario de solicitud: un diálogo, un estilo. */
const INPUT_CLASS =
  "chamfer-quad-sm font-body w-full bg-bg-sunken px-3 py-2 text-sm text-text-primary focus:outline-none";
const INPUT_STYLE = { boxShadow: "inset 0 0 0 1px var(--color-slate)" } as const;

/* ─────────────────────────────────────────────────────────────────────────
   2. Props
   ───────────────────────────────────────────────────────────────────────── */

export interface ZoneStudioProps {
  /** Zona que se está rotulando. `null` cierra el diálogo. */
  zone: ResolvedZone | null;
  artwork: ZoneArtwork;
  onChange: (artwork: ZoneArtwork) => void;
  onClose: () => void;
  /** La zona está en la selección de compra. */
  selected: boolean;
  /** Quitar la zona de la selección (y cerrar). */
  onRemoveZone: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────
   3. Componente
   ───────────────────────────────────────────────────────────────────────── */

export default function ZoneStudio({
  zone,
  artwork,
  onChange,
  onClose,
  selected,
  onRemoveZone,
}: ZoneStudioProps) {
  const t = useT();
  const copy = t.sponsors.studio;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<ImportFailure | null>(null);
  const [lineArt, setLineArt] = useState<string | null>(null);

  const view = zone?.geometry.view ?? null;

  /* ── Line-art de la lámina ────────────────────────────────────────────── */
  useEffect(() => {
    if (!view) return;
    const src = CAR_SVG_SRC[view];
    const cached = peekLineArt(src);
    if (cached !== undefined) {
      setLineArt(cached);
      return;
    }
    let alive = true;
    setLineArt(null);
    loadLineArt(src)
      .then((markup) => {
        if (alive) setLineArt(markup);
      })
      .catch(() => {
        /* Sin carrocería el estudio sigue siendo utilizable: la zona, su
           contorno y el rotulado se dibujan igual. Sólo se pierde el
           contexto de la chapa alrededor. */
        if (alive) setLineArt("");
      });
    return () => {
      alive = false;
    };
  }, [view]);

  /* ── Encuadre ─────────────────────────────────────────────────────────── */
  const box = useMemo(
    () => (zone ? zoneBox(zone.geometry.d) : null),
    [zone],
  );

  const viewBox = useMemo(() => {
    if (!box) return "0 0 100 100";
    const pad = Math.max(box.width, box.height) * FRAME_PADDING;
    return [
      box.minX - pad,
      box.minY - pad,
      box.width + pad * 2,
      box.height + pad * 2,
    ].join(" ");
  }, [box]);

  /* Punto donde nacen los elementos nuevos. Se calcula desde el ancla de la
     zona porque el centro del bbox cae fuera de la chapa en seis de las 28
     — ver `zoneOrigin()`. */
  const origin = useMemo(
    () => (zone ? zoneOrigin(zone.geometry.d, zone.geometry.anchor) : { x: 0.5, y: 0.5 }),
    [zone],
  );

  const activeItem = useMemo(
    () => artwork.items.find((item) => item.id === activeId) ?? null,
    [artwork.items, activeId],
  );

  /* ── Escritura del rotulado ───────────────────────────────────────────── */
  const patchItem = useCallback(
    (id: string, next: (item: ArtworkItem) => ArtworkItem) => {
      onChange({
        ...artwork,
        items: artwork.items.map((item) => (item.id === id ? next(item) : item)),
      });
    },
    [artwork, onChange],
  );

  const patchText = useCallback(
    (id: string, patch: Partial<ArtworkTextItem>) => {
      patchItem(id, (item) => (item.kind === "text" ? { ...item, ...patch } : item));
    },
    [patchItem],
  );

  const addItem = useCallback(
    (item: ArtworkItem) => {
      onChange({ ...artwork, items: [...artwork.items, item] });
      setActiveId(item.id);
    },
    [artwork, onChange],
  );

  const removeItem = useCallback(
    (id: string) => {
      onChange({ ...artwork, items: artwork.items.filter((item) => item.id !== id) });
      setActiveId((current) => (current === id ? null : current));
    },
    [artwork, onChange],
  );

  /** Lo último del array se pinta encima: traer al frente es moverlo al final. */
  const bringToFront = useCallback(
    (id: string) => {
      const target = artwork.items.find((item) => item.id === id);
      if (!target) return;
      onChange({
        ...artwork,
        items: [...artwork.items.filter((item) => item.id !== id), target],
      });
    },
    [artwork, onChange],
  );

  /* ── Subida del logo ──────────────────────────────────────────────────── */
  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setUploadError(null);
      try {
        const image = await importLogo(file);
        addItem(createImageItem(image.src, image.name, image.width, image.height, origin, box ?? undefined));
      } catch (error) {
        setUploadError(error instanceof ImageImportError ? error.reason : "decode-failed");
      }
    },
    [addItem, origin, box],
  );

  /* ── Arrastre y escalado ──────────────────────────────────────────────── */
  /* El gesto vive en una ref, no en estado: un `setState` por `pointermove`
     reordenaría sesenta renders por segundo para un dato que sólo necesita
     el propio manejador. */
  const gestureRef = useRef<
    | { readonly kind: "move"; readonly id: string; readonly dx: number; readonly dy: number }
    | {
        readonly kind: "scale";
        readonly id: string;
        readonly startDistance: number;
        readonly startItem: ArtworkItem;
      }
    | null
  >(null);

  const beginMove = useCallback(
    (event: ReactPointerEvent<SVGGElement>, item: ArtworkItem) => {
      if (!box) return;
      event.stopPropagation();
      const point = toUserSpace(svgRef.current, event.clientX, event.clientY);
      if (!point) return;
      const { cx, cy } = itemBox(item, box);
      gestureRef.current = { kind: "move", id: item.id, dx: point.x - cx, dy: point.y - cy };
      setActiveId(item.id);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [box],
  );

  const beginScale = useCallback(
    (event: ReactPointerEvent<SVGCircleElement>, item: ArtworkItem) => {
      if (!box) return;
      event.stopPropagation();
      const point = toUserSpace(svgRef.current, event.clientX, event.clientY);
      if (!point) return;
      const { cx, cy } = itemBox(item, box);
      const startDistance = Math.hypot(point.x - cx, point.y - cy);
      // Un agarre exactamente en el centro daría distancia 0 y un factor
      // infinito en el primer movimiento.
      if (startDistance < 1e-3) return;
      gestureRef.current = { kind: "scale", id: item.id, startDistance, startItem: item };
      setActiveId(item.id);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [box],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const gesture = gestureRef.current;
      if (!gesture || !box) return;
      const point = toUserSpace(svgRef.current, event.clientX, event.clientY);
      if (!point) return;

      if (gesture.kind === "move") {
        const cx = point.x - gesture.dx;
        const cy = point.y - gesture.dy;
        patchItem(gesture.id, (item) =>
          moveItem(item, (cx - box.minX) / box.width, (cy - box.minY) / box.height),
        );
        return;
      }

      const { cx, cy } = itemBox(gesture.startItem, box);
      const distance = Math.hypot(point.x - cx, point.y - cy);
      const factor = distance / gesture.startDistance;
      patchItem(gesture.id, (item) =>
        // Se escala SIEMPRE desde el tamaño que tenía al empezar el gesto. Si
        // se acumulara sobre el tamaño actual, cada `pointermove` multiplicaría
        // otra vez y el elemento se dispararía con el primer tirón.
        item.id === gesture.startItem.id ? scaleItem(gesture.startItem, factor) : item,
      );
    },
    [box, patchItem],
  );

  const endGesture = useCallback(() => {
    gestureRef.current = null;
  }, []);

  /* ── Teclado ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!zone) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        // Primero se suelta el elemento; sólo un segundo Escape cierra. Así
        // nadie pierde el diálogo entero por querer deseleccionar un logo.
        if (activeId) setActiveId(null);
        else onClose();
        return;
      }

      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;
      if (typing || !activeId || !box) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeItem(activeId);
        return;
      }

      const step = event.shiftKey ? NUDGE_FINE : NUDGE;
      const delta: Record<string, readonly [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = delta[event.key];
      if (!move) return;
      event.preventDefault();
      patchItem(activeId, (item) => moveItem(item, item.x + move[0], item.y + move[1]));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zone, activeId, box, onClose, removeItem, patchItem]);

  /* ── Foco y scroll del fondo ──────────────────────────────────────────── */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!zone) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [zone]);

  if (!mounted || !zone || !box || !view) return null;

  const cmPerUnit = CM_PER_UNIT_BY_VIEW[view];
  const titleId = `${uid}-title`;

  /* ── Marca de selección del elemento activo ───────────────────────────── */
  const marker = (() => {
    if (!activeItem) return null;
    const { cx, cy, width, height } = itemBox(activeItem, box);
    const pad = Math.max(box.width, box.height) * 0.012;
    const w = width + pad * 2;
    const h = height + pad * 2;
    const handle = Math.max(box.width, box.height) * 0.022;
    return (
      <g transform={activeItem.rotation ? `rotate(${activeItem.rotation} ${cx} ${cy})` : undefined}>
        <rect
          x={cx - w / 2}
          y={cy - h / 2}
          width={w}
          height={h}
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={1.4}
          strokeDasharray="6 4"
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
        <circle
          cx={cx + w / 2}
          cy={cy + h / 2}
          r={handle}
          style={{ fill: "var(--color-lime)", cursor: "nwse-resize" }}
          onPointerDown={(event) => beginScale(event, activeItem)}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
        />
      </g>
    );
  })();

  const sizeValue =
    activeItem?.kind === "image"
      ? activeItem.widthPct
      : activeItem?.kind === "text"
        ? activeItem.sizePct
        : 0;
  const sizeMin = activeItem?.kind === "image" ? MIN_IMAGE_WIDTH_PCT : MIN_TEXT_SIZE_PCT;
  const sizeMax = activeItem?.kind === "image" ? MAX_IMAGE_WIDTH_PCT : MAX_TEXT_SIZE_PCT;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-stretch justify-center p-0 sm:p-4"
      style={{ background: SPONSOR_SCRIM }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="panel hud-frame hud-frame-slate relative flex h-full w-full max-w-6xl flex-col overflow-hidden outline-none sm:h-auto sm:max-h-[94vh]"
      >
        {/* ══════════════ Cabecera ══════════════ */}
        <header className="border-slate flex border-b shrink-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-heading text-text-primary truncate text-lg font-bold sm:text-xl">
              {zone.label}
            </h2>
            <p className="font-mono text-text-tertiary mt-0.5 text-[0.6875rem] tracking-[0.14em] uppercase">
              {t.sponsors.tierLabels[zone.slot.tier]} · {zone.vinylLabel}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-tactical btn-outline shrink-0">
            {copy.done}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* ══════════════ Lienzo ══════════════ */}
          <div className="dust-overlay relative min-h-[240px] flex-1 overflow-hidden">
            <div className="grid-blueprint grid-fade pointer-events-none absolute inset-0 opacity-60" />
            <svg
              ref={svgRef}
              viewBox={viewBox}
              className="relative z-[1] block h-full w-full"
              style={{
                color: "rgb(var(--text-rgb) / 0.45)",
                "--car-stroke": "1.5px",
                touchAction: "none",
              } as React.CSSProperties & Record<`--${string}`, string>}
              onPointerMove={handlePointerMove}
              onPointerUp={endGesture}
              onPointerCancel={endGesture}
              onPointerDown={(event) => {
                // Pinchar fuera de todo elemento deselecciona.
                if (event.target === event.currentTarget) setActiveId(null);
              }}
            >
              {lineArt ? (
                <g
                  aria-hidden="true"
                  style={{ pointerEvents: "none" }}
                  dangerouslySetInnerHTML={{ __html: LINE_STYLE + lineArt }}
                />
              ) : null}

              <defs>
                <clipPath id={`${uid}-clip`}>
                  <path d={zone.geometry.d} />
                </clipPath>
              </defs>

              {/* La chapa, con la pintura REAL del coche: blanco.
                  No es decoración ni un tono del tema — el equipo pinta el
                  coche de blanco, así que un rótulo blanco tiene que
                  desaparecer aquí igual que va a desaparecer allí. */}
              <path d={zone.geometry.d} fill={CAR_PAINT_HEX} />

              <g clipPath={`url(#${uid}-clip)`}>
                {artwork.items.map((item) => (
                  <g
                    key={item.id}
                    onPointerDown={(event) => beginMove(event, item)}
                    onPointerUp={endGesture}
                    onPointerCancel={endGesture}
                    style={{ cursor: "move" }}
                  >
                    {/* El propio dibujo es la superficie de agarre, pero un
                        texto fino deja casi nada que pinchar: este rectángulo
                        invisible da el área de arrastre. */}
                    {(() => {
                      const { cx, cy, width, height } = itemBox(item, box);
                      return (
                        <rect
                          x={cx - width / 2}
                          y={cy - height / 2}
                          width={width}
                          height={height}
                          fill="transparent"
                          transform={
                            item.rotation ? `rotate(${item.rotation} ${cx} ${cy})` : undefined
                          }
                        />
                      );
                    })()}
                    <ArtworkNode item={item} box={box} />
                  </g>
                ))}
              </g>

              {/* Contorno de la zona por encima del rotulado: marca dónde
                  muerde el recorte. */}
              <path
                d={zone.geometry.d}
                fill="none"
                strokeWidth={1.8}
                strokeDasharray="7 5"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
                style={{ stroke: "var(--color-amber)" }}
              />

              {marker}
            </svg>

            <p className="font-mono text-text-tertiary pointer-events-none absolute bottom-2 left-3 z-[2] text-[0.625rem] tracking-[0.12em] uppercase">
              {copy.canvasHint}
            </p>
          </div>

          {/* ══════════════ Herramientas ══════════════ */}
          <aside className="border-slate flex border-t lg:border-t-0 lg:border-l w-full shrink-0 flex-col gap-4 overflow-y-auto p-4 lg:w-[22rem] lg:p-5">
            {/* ── Añadir ── */}
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-tactical btn-amber flex-1"
                onClick={() => fileRef.current?.click()}
              >
                {copy.addLogo}
              </button>
              <button
                type="button"
                className="btn-tactical btn-outline flex-1"
                onClick={() => addItem(createTextItem(copy.defaultText, origin, box))}
              >
                {copy.addText}
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              /* Fuera del arbol de accesibilidad y del tabulador: el control
                 real es el boton "Subir logo", que lo abre. Sin esto, el lector
                 y el Tab encontraban un campo de fichero sin nombre (axe: label). */
              aria-hidden="true"
              tabIndex={-1}
              className="sr-only"
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                // Sin esto, volver a elegir el MISMO fichero no dispara change.
                event.target.value = "";
              }}
            />
            {uploadError ? (
              <p role="alert" className="font-mono text-[0.6875rem] text-amber-text">
                {copy.uploadErrors[uploadError]}
              </p>
            ) : null}

            {/* ── Elementos ── */}
            <section className="min-h-0">
              <h3 className="font-mono text-text-tertiary mb-2 text-[0.625rem] tracking-[0.18em] uppercase">
                {copy.itemsLabel} ({artwork.items.length})
              </h3>
              {artwork.items.length === 0 ? (
                <p className="text-text-tertiary text-xs">{copy.itemsEmpty}</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {/* Se recorre al revés: el último del array se pinta encima,
                      así que la lista lo enseña arriba, como en cualquier
                      editor por capas. */}
                  {[...artwork.items].reverse().map((item) => (
                    <li key={item.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveId(item.id)}
                        aria-pressed={activeId === item.id}
                        className="border-slate border flex-1 truncate px-2 py-1 text-left text-xs"
                        style={{
                          borderColor: activeId === item.id ? "var(--color-lime)" : undefined,
                        }}
                      >
                        {item.kind === "text" ? item.text || copy.addText : item.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => bringToFront(item.id)}
                        aria-label={copy.bringToFront}
                        title={copy.bringToFront}
                        className="border-slate border px-2 py-1 font-mono text-[0.625rem]"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={copy.removeItem}
                        title={copy.removeItem}
                        className="border-slate border px-2 py-1 font-mono text-[0.625rem]"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ── Propiedades del elemento activo ── */}
            {activeItem ? (
              <section className="flex flex-col gap-3">
                <h3 className="font-mono text-text-tertiary text-[0.625rem] tracking-[0.18em] uppercase">
                  {copy.propertiesLabel}
                </h3>

                {activeItem.kind === "text" ? (
                  <>
                    <label className="flex flex-col gap-1">
                      <span className="font-mono text-text-tertiary text-[0.625rem] tracking-[0.14em] uppercase">
                        {copy.textLabel}
                      </span>
                      <input
                        type="text"
                        value={activeItem.text}
                        onChange={(event) =>
                          patchText(activeItem.id, { text: event.target.value })
                        }
                        className={INPUT_CLASS} style={INPUT_STYLE}
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="font-mono text-text-tertiary text-[0.625rem] tracking-[0.14em] uppercase">
                        {copy.fontLabel}
                      </span>
                      <select
                        value={activeItem.font}
                        onChange={(event) =>
                          patchText(activeItem.id, {
                            font: event.target.value as ArtworkTextItem["font"],
                          })
                        }
                        className={INPUT_CLASS} style={INPUT_STYLE}
                      >
                        {ARTWORK_FONTS.map((font) => (
                          <option key={font.id} value={font.id}>
                            {copy.fonts[font.id]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex gap-2">
                      {ARTWORK_WEIGHTS.map((weight) => (
                        <button
                          key={weight}
                          type="button"
                          onClick={() => patchText(activeItem.id, { weight })}
                          aria-pressed={activeItem.weight === weight}
                          className="border-slate border flex-1 px-2 py-1 text-xs"
                          style={{
                            borderColor:
                              activeItem.weight === weight ? "var(--color-lime)" : undefined,
                            fontWeight: weight,
                          }}
                        >
                          {copy.weights[weight]}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          patchText(activeItem.id, { uppercase: !activeItem.uppercase })
                        }
                        aria-pressed={activeItem.uppercase}
                        className="border-slate border flex-1 px-2 py-1 text-xs"
                        style={{
                          borderColor: activeItem.uppercase ? "var(--color-lime)" : undefined,
                        }}
                      >
                        {copy.uppercase}
                      </button>
                    </div>

                    <Slider
                      label={copy.trackingLabel}
                      value={activeItem.tracking}
                      min={-0.05}
                      max={0.4}
                      step={0.01}
                      onChange={(value) => patchText(activeItem.id, { tracking: value })}
                    />

                    <div>
                      <span className="font-mono text-text-tertiary mb-1.5 block text-[0.625rem] tracking-[0.14em] uppercase">
                        {copy.colorLabel}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {VINYL_COLORS.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => patchText(activeItem.id, { color: color.id })}
                            aria-pressed={activeItem.color === color.id}
                            aria-label={copy.colors[color.id]}
                            title={copy.colors[color.id]}
                            className="border-slate border h-7 w-7"
                            style={{
                              background: color.hex,
                              outline:
                                activeItem.color === color.id
                                  ? "2px solid var(--color-lime)"
                                  : undefined,
                              outlineOffset: "1px",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                <Slider
                  label={copy.sizeLabel}
                  value={sizeValue}
                  min={sizeMin}
                  max={sizeMax}
                  step={0.01}
                  onChange={(value) =>
                    patchItem(activeItem.id, (item) =>
                      item.kind === "image"
                        ? { ...item, widthPct: value }
                        : { ...item, sizePct: value },
                    )
                  }
                />

                <Slider
                  label={copy.rotationLabel}
                  value={activeItem.rotation}
                  min={-180}
                  max={180}
                  step={1}
                  onChange={(value) =>
                    patchItem(activeItem.id, (item) => ({ ...item, rotation: value }))
                  }
                />

                {/* La medida REAL del elemento sobre la chapa. Es el dato que
                    convierte el juguete en una herramienta: un logo que se ve
                    bien en pantalla puede salir de 4 cm en el coche. */}
                <p className="font-mono text-amber-text text-[0.6875rem] tracking-[0.1em]">
                  {(() => {
                    const cm = itemVinylCm(activeItem, box, cmPerUnit);
                    return `${cm.w} × ${cm.h} cm`;
                  })()}
                </p>
              </section>
            ) : (
              <p className="text-text-tertiary text-xs">{copy.noSelection}</p>
            )}
          </aside>
        </div>

        {/* ══════════════ Pie ══════════════ */}
        {/* <div> y no <footer>: dentro de un dialogo, un <footer> suelto cuenta
            como el pie (contentinfo) de la pagina, que ya tiene el suyo. */}
        <div className="border-slate flex border-t shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="font-mono text-text-tertiary text-[0.6875rem] tracking-[0.1em]">
            {selected ? copy.zoneIncluded : copy.zoneNotIncluded}
          </p>
          <div className="flex gap-2">
            {selected ? (
              <button type="button" onClick={onRemoveZone} className="btn-tactical btn-outline">
                {copy.removeZone}
              </button>
            ) : null}
            <button type="button" onClick={onClose} className="btn-tactical btn-amber">
              {copy.done}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   4. Control auxiliar
   ───────────────────────────────────────────────────────────────────────── */

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-text-tertiary text-[0.625rem] tracking-[0.14em] uppercase">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-[var(--color-amber)]"
      />
    </label>
  );
}
