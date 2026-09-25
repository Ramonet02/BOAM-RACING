"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Visor interactivo del coche (Módulo 5 de la spec)
   --------------------------------------------------------------------------
   Pinta el line-art real de `public/car/*.svg` y, encima, las zonas de
   patrocinio como paths rellenos e interactivos.

   DE DÓNDE SALE CADA COSA (este fichero NO calcula geometría):
     · La forma de cada zona  → src/lib/car/lateral.ts · frontRear.ts · top.ts
     · Qué se vende y a qué nivel → src/lib/sponsors.ts (SPONSOR_SLOTS)
     · Todo el texto           → src/i18n/**  (useT)

   POR QUÉ EL SVG SE INYECTA EN LÍNEA
   Con <img src="/car/front.svg"> el navegador aísla el documento y `currentColor`
   se resuelve DENTRO del SVG, así que no hay forma de retematizar el trazo desde
   la página. Por eso se hace fetch del fichero, se sanea y se inyecta como markup
   dentro de nuestro propio <svg>: así el trazo hereda `color` y el grosor sale de
   la custom property --car-stroke, que el usuario puede cambiar desde el HUD.

   LOS TRES MÓDULOS DE GEOMETRÍA DECLARAN CADA UNO SU PROPIO `CarZone`
   Son estructuralmente compatibles pero tienen nombre duplicado, así que aquí NO
   se importa ninguno de los tres tipos: se declara `GeometryZone`, que es el
   subconjunto común, y los tres encajan por tipado estructural. El día que
   alguien consolide un `src/lib/car/types.ts`, esta interfaz se borra y se
   importa aquélla.

   SISTEMA DE COORDENADAS Y ZOOM
   El viewBox del <svg> se AMPLÍA hasta la relación de aspecto real del contenedor
   (`fitBox`), de forma que nunca hay letterboxing de `preserveAspectRatio`. Eso
   permite convertir píxel↔unidad con una regla de tres exacta, que es lo que usan
   el paneo, el zoom focal y el anclaje del tooltip.
   ══════════════════════════════════════════════════════════════════════════ */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { LATERAL_ZONES_BY_VIEW, lateralZoneIds } from "@/lib/car/lateral";
import { FRONT_REAR_ZONE_IDS, zonesForFrontRearView } from "@/lib/car/frontRear";
import { TOP_ZONE_IDS, TOP_ZONES } from "@/lib/car/top";
import { CM_PER_UNIT_BY_VIEW } from "@/lib/car/scale";
import {
  CAR_BOX,
  CAR_SVG_SRC,
  LINE_STYLE,
  loadLineArt,
  peekLineArt,
} from "@/lib/car/lineArt";

import { SPONSOR_TIERS_BY_ID, formatTierSlots, slotsForView } from "@/lib/sponsors";
import type {
  CarView,
  SponsorSlot,
  SponsorTier,
  SponsorTierId,
  VinylDimensions,
} from "@/lib/types";
import { fill, type Dict } from "@/i18n/translations";
import { useT } from "@/i18n/LanguageProvider";
import TiltCard, { TiltDepth } from "@/components/ui/TiltCard";

import { EMPTY_ARTWORK, isArtworkEmpty, type ArtworkDesign } from "@/lib/sponsor/artwork";
import { zoneBox } from "@/lib/sponsor/zoneBox";

import SponsorZone from "./SponsorZone";
import ZoneArtworkLayer from "./ZoneArtworkLayer";
import ZoneTooltip from "./ZoneTooltip";
import { zoneAlpha } from "./sponsorPaint";

/* ─────────────────────────────────────────────────────────────────────────
   1. Tipos públicos del módulo
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Subconjunto común de los tres `CarZone` de `src/lib/car/**`.
 * `lateral.ts` añade `panel` y `areaCm2`; no se necesitan aquí.
 */
export interface GeometryZone {
  readonly id: string;
  readonly label: string;
  readonly tier: SponsorTierId;
  readonly view: CarView;
  readonly d: string;
  readonly anchor: { readonly x: number; readonly y: number };
  readonly vinyl: VinylDimensions;
  /**
   * Si la zona es sólo el canto de un panel que se vende desde otra vista,
   * aquí va esa vista. Pulsarla navega en vez de seleccionar. Lo declara
   * `src/lib/car/lateral.ts` para el capó y el techo.
   */
  readonly linksTo?: CarView;
}

/** Un hueco comercial ya cruzado con su geometría y con su copy traducido. */
export interface ResolvedZone {
  /** El hueco vendible: id, tier, estado, patrocinador si lo hay. */
  readonly slot: SponsorSlot;
  /** La forma sobre la carrocería. */
  readonly geometry: GeometryZone;
  /** Definición comercial del nivel al que pertenece. */
  readonly tier: SponsorTier;
  /** Nombre de la zona ya traducido y con el flanco cuando procede. */
  readonly label: string;
  /** Medida del vinilo formateada: "92 × 24 cm". */
  readonly vinylLabel: string;
}

/** Valor del filtro de niveles: un tier concreto o "todos". */
export type TierFilterValue = SponsorTierId | "all";

/**
 * De dónde viene la activación de una zona.
 *
 * Importa porque el visor descarta el `click` que cierra un arrastre (si no,
 * pasear el coche seleccionaría la zona donde soltaste el ratón). Ese descarte
 * NO puede aplicarse al teclado: un Enter sobre una zona no tiene nada que ver
 * con el último paneo, y si se filtrase por el mismo sitio habría que pulsar
 * Enter dos veces después de cada arrastre.
 */
export type ZoneActivationSource = "pointer" | "keyboard";

/** Las cinco vistas, en el orden en que se presentan las pestañas. */
export const CAR_VIEWS: readonly CarView[] = [
  "lateral-izq",
  "lateral-der",
  "frontal",
  "trasera",
  "cenital",
];

/* ─────────────────────────────────────────────────────────────────────────
   2. Tablas por vista
   ───────────────────────────────────────────────────────────────────────── */

/** Geometría de una vista, venga del módulo que venga. */
function geometryZonesFor(view: CarView): readonly GeometryZone[] {
  switch (view) {
    case "lateral-izq":
    case "lateral-der":
      return LATERAL_ZONES_BY_VIEW[view];
    case "frontal":
    case "trasera":
      return zonesForFrontRearView(view);
    case "cenital":
      return TOP_ZONES;
  }
}

/**
 * Todos los `zoneId` que la geometría conoce de verdad.
 * Es lo que hay que pasarle a `assertSlotZonesExist()` de `src/lib/sponsors.ts`.
 */
export const ALL_KNOWN_ZONE_IDS: readonly string[] = [
  ...lateralZoneIds(),
  ...FRONT_REAR_ZONE_IDS,
  ...TOP_ZONE_IDS,
];

/* ─────────────────────────────────────────────────────────────────────────
   3. Resolución hueco + geometría + copy
   ───────────────────────────────────────────────────────────────────────── */

/** Medida del vinilo, lista para pintar. */
export function formatVinyl(vinyl: VinylDimensions): string {
  return `${vinyl.widthCm} × ${vinyl.heightCm} cm`;
}

/** Un nivel con una sola plaza es, por definición del dossier, exclusivo. */
export function isExclusiveTier(tier: SponsorTier): boolean {
  return tier.slots === 1;
}

/**
 * Disponibilidad de un nivel, LOCALIZADA.
 *
 * `formatTierSlots()` de `src/lib/sponsors.ts` es la fuente de verdad del dato,
 * pero devuelve castellano fijo ("4 plazas"), así que la web en inglés o en
 * catalán no puede usarla tal cual. Aquí el NÚMERO sigue saliendo del tier y
 * sólo la envoltura viene del diccionario (`availability.slot|slots|unlimited`,
 * con el token `{n}`). Si alguna traducción perdiera el token se cae al helper
 * de la librería, que como mínimo dice la verdad.
 */
export function formatTierAvailability(tier: SponsorTier, t: Dict): string {
  const copy = t.sponsors.availability;
  if (tier.slots === null) return copy.unlimited;

  const template = tier.slots === 1 ? copy.slot : copy.slots;
  if (!template.includes("{n}")) return formatTierSlots(tier);
  return fill(template, { n: tier.slots });
}

/** Disponibilidad en formato corto: los niveles de plaza única dicen "exclusiva". */
export function formatTierAvailabilityShort(tier: SponsorTier, t: Dict): string {
  return isExclusiveTier(tier)
    ? t.sponsors.availability.exclusive
    : formatTierAvailability(tier, t);
}

/**
 * Nombre traducido de una zona. `t.sponsors.zones` está indexado por la unión
 * exacta de `zoneId`, así que se consulta a través de un índice laxo y se cae
 * a la etiqueta castellana de la geometría si alguien añade un id sin copy.
 */
function localizedZoneLabel(
  t: Dict,
  zoneId: string,
  view: CarView,
  fallback: string,
): string {
  const table: Readonly<Record<string, string | undefined>> = t.sponsors.zones;
  const base = table[zoneId] ?? fallback;
  if (view === "lateral-izq") return `${base} · ${t.sponsors.sides.left}`;
  if (view === "lateral-der") return `${base} · ${t.sponsors.sides.right}`;
  return base;
}

/**
 * Cruza los huecos comerciales de una vista con su geometría.
 * Un hueco cuyo `zoneId` no exista en la geometría se descarta: no se puede
 * dibujar. `assertSlotZonesExist()` avisa de ello por consola en desarrollo.
 */
export function resolveZonesForView(view: CarView, t: Dict): ResolvedZone[] {
  const geometry = geometryZonesFor(view);
  const byId = new Map<string, GeometryZone>(geometry.map((zone) => [zone.id, zone]));

  return slotsForView(view).flatMap<ResolvedZone>((slot) => {
    const zone = byId.get(slot.zoneId);
    if (!zone) return [];
    return [
      {
        slot,
        geometry: zone,
        tier: SPONSOR_TIERS_BY_ID[slot.tier],
        label: localizedZoneLabel(t, slot.zoneId, view, zone.label),
        vinylLabel: formatVinyl(zone.vinyl),
      },
    ];
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   5. Zoom / paneo — utilidades puras
   ───────────────────────────────────────────────────────────────────────── */

interface ViewBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
/** Aire alrededor del coche para que no bese los bordes del marco. */
const FRAME_PADDING = 1.08;

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return value < min ? min : value > max ? max : value;
}

/**
 * Amplía la caja del coche hasta la relación de aspecto del contenedor.
 * Al coincidir ambas relaciones, `preserveAspectRatio` no recorta ni añade
 * bandas, y la conversión píxel↔unidad se vuelve una regla de tres exacta.
 */
function fitBox(car: { w: number; h: number }, aspect: number): ViewBox {
  const w0 = car.w * FRAME_PADDING;
  const h0 = car.h * FRAME_PADDING;
  const safeAspect = aspect > 0 && Number.isFinite(aspect) ? aspect : w0 / h0;

  let w = w0;
  let h = h0;
  if (w0 / h0 > safeAspect) h = w0 / safeAspect;
  else w = h0 * safeAspect;

  return { x: (car.w - w) / 2, y: (car.h - h) / 2, w, h };
}

/* ─────────────────────────────────────────────────────────────────────────
   6. Componente
   ───────────────────────────────────────────────────────────────────────── */

/** `useLayoutEffect` no existe en el render del servidor; en SSR cae a `useEffect`. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Los tres grosores de trazo del design system, en px. */
const STROKE_STEPS = [1, 1.75, 2.75] as const;

/** Un nombre más largo que esto no cabe en ningún vinilo: se recorta. */
const BRAND_STAMP_MAX_CHARS = 18;


/**
 * Cuerpo de letra, en unidades de viewBox, para estampar `chars` caracteres
 * dentro del vinilo de una zona.
 *
 * `vinyl` está en centímetros de chapa real, así que se divide por los
 * centímetros-por-unidad de la vista para volver a unidades de dibujo. El
 * avance medio de un carácter en mayúsculas de Chakra Petch ronda 0,58 em y el
 * interletraje añade otro 0,06 em; se deja además un 14 % de aire a los lados y
 * se limita la altura al 62 % del vinilo. Es deliberadamente conservador: las
 * zonas en media luna (aleta delantera) tienen menos chapa útil que su bounding
 * box, y más vale que la marca se quede corta a que se salga del coche.
 */
function brandFontSize(zone: ResolvedZone, chars: number, cmPerUnit: number): number {
  if (chars <= 0 || cmPerUnit <= 0) return 0;

  const widthUnits = zone.geometry.vinyl.widthCm / cmPerUnit;
  const heightUnits = zone.geometry.vinyl.heightCm / cmPerUnit;

  const byHeight = heightUnits * 0.62;
  const byWidth = (widthUnits * 0.86) / (chars * 0.64);

  return Math.max(0, Math.min(byHeight, byWidth));
}

interface Size {
  readonly w: number;
  readonly h: number;
}

export interface CarViewerProps {
  /** Vista de carrocería que se está mostrando. */
  view: CarView;
  /**
   * Cambia la vista del visor. Lo llama una zona con `linksTo`: el capó y el
   * techo desde el lateral llevan a la cenital, que es donde se vende el panel
   * de verdad. Si no se pasa, esas zonas se comportan como cualquier otra.
   */
  readonly onNavigateView?: (view: CarView) => void;
  /** Zonas de esa vista, ya resueltas por `resolveZonesForView`. */
  zones: readonly ResolvedZone[];
  /** Ids de hueco (`slot.id`) ahora mismo en la selección. */
  selectedIds: readonly string[];
  /** Nivel por el que se está filtrando, o "all". */
  tierFilter: TierFilterValue;
  /** Si true, las zonas ya ocupadas se apagan. */
  availableOnly: boolean;
  /**
   * Nombre de marca que el usuario está tecleando. Se estampa sobre las zonas
   * seleccionadas para previsualizar la rotulación. Vacío = no se pinta nada.
   */
  brandName?: string;
  /** Añadir o quitar una zona de la selección. */
  onToggleZone: (zone: ResolvedZone) => void;
  /**
   * Rotulado que el cliente ha compuesto, por `slot.id`. Se dibuja sobre las
   * zonas elegidas para que el coche enseñe el resultado real, no un rótulo
   * genérico.
   */
  artwork?: ArtworkDesign;
  /**
   * Abrir el estudio de rotulación de una zona libre. Es la acción principal
   * de un clic desde que hay estudio: seleccionar una zona sin poder ver qué
   * cabe en ella era elegir a ciegas. Si no se pasa, el clic vuelve a ser el
   * simple alta/baja en la selección.
   */
  onOpenStudio?: (zone: ResolvedZone) => void;
}

export default function CarViewer({
  view,
  zones,
  selectedIds,
  tierFilter,
  availableOnly,
  brandName = "",
  onToggleZone,
  onNavigateView,
  artwork,
  onOpenStudio,
}: CarViewerProps) {
  const t = useT();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  /* ── Line-art ─────────────────────────────────────────────────────────── */
  const [lineArt, setLineArt] = useState<string | null>(null);
  const [lineArtFailed, setLineArtFailed] = useState(false);

  useEffect(() => {
    const src = CAR_SVG_SRC[view];
    let cancelled = false;

    setLineArtFailed(false);
    const cached = peekLineArt(src);
    if (cached !== undefined) {
      setLineArt(cached);
      return () => {
        cancelled = true;
      };
    }

    setLineArt(null);
    loadLineArt(src)
      .then((markup) => {
        if (!cancelled) setLineArt(markup);
      })
      .catch(() => {
        if (!cancelled) setLineArtFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [view]);

  // Precarga silenciosa del resto de láminas: cambiar de pestaña es instantáneo.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const other of CAR_VIEWS) {
        if (other === view) continue;
        void loadLineArt(CAR_SVG_SRC[other]).catch(() => undefined);
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [view]);

  /* ── Medida del marco ─────────────────────────────────────────────────── */
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size | null>(null);

  useIsoLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      setSize((prev) =>
        prev && Math.abs(prev.w - rect.width) < 0.5 && Math.abs(prev.h - rect.height) < 0.5
          ? prev
          : { w: rect.width, h: rect.height },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Estado de cámara ─────────────────────────────────────────────────── */
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null);
  const [strokeIndex, setStrokeIndex] = useState(1);

  // Cada vista tiene su propio encuadre: al cambiar de lámina se vuelve al 1:1.
  useEffect(() => {
    setZoom(1);
    setFocus(null);
  }, [view]);

  const car = CAR_BOX[view];
  const base = useMemo(
    () => fitBox(car, size ? size.w / size.h : car.w / car.h),
    [car, size],
  );

  const viewBox = useMemo<ViewBox>(() => {
    const w = base.w / zoom;
    const h = base.h / zoom;
    const cx = focus ? focus.x : base.x + base.w / 2;
    const cy = focus ? focus.y : base.y + base.h / 2;
    return {
      x: clamp(cx - w / 2, base.x, base.x + base.w - w),
      y: clamp(cy - h / 2, base.y, base.y + base.h - h),
      w,
      h,
    };
  }, [base, zoom, focus]);

  const viewBoxRef = useRef(viewBox);
  viewBoxRef.current = viewBox;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const baseRef = useRef(base);
  baseRef.current = base;

  const zoomAt = useCallback((nextZoom: number, px: number, py: number) => {
    const frame = sizeRef.current;
    if (!frame) return;

    const current = viewBoxRef.current;
    const frameBase = baseRef.current;
    const target = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    // Punto de la carrocería que hay bajo el dedo/cursor: debe quedarse quieto.
    const ux = current.x + (px / frame.w) * current.w;
    const uy = current.y + (py / frame.h) * current.h;

    const nw = frameBase.w / target;
    const nh = frameBase.h / target;

    setZoom(target);
    setFocus({
      x: ux - (px / frame.w) * nw + nw / 2,
      y: uy - (py / frame.h) * nh + nh / 2,
    });
  }, []);

  const resetCamera = useCallback(() => {
    setZoom(1);
    setFocus(null);
  }, []);

  const stepZoom = useCallback(
    (factor: number) => {
      const frame = sizeRef.current;
      if (!frame) {
        setZoom((z) => clamp(z * factor, MIN_ZOOM, MAX_ZOOM));
        return;
      }
      // El zoom efectivo se lee del viewBox, no del estado: durante un paneo o
      // una pinza el viewBox va por delante y ésta es la cifra real en pantalla.
      const current =
        viewBoxRef.current.w > 0 ? baseRef.current.w / viewBoxRef.current.w : 1;
      zoomAt(current * factor, frame.w / 2, frame.h / 2);
    },
    [zoomAt],
  );

  /* ── Gestos: paneo con un dedo, pinza con dos ─────────────────────────── */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  /** Un arrastre real tiene que impedir que el "click" final seleccione la zona. */
  const suppressClickRef = useRef(false);

  /* ── Origen del marco, cacheado durante el gesto ────────────────────────
     `localPoint` lo llama `handlePointerMove`, es decir hasta 120 veces por
     segundo mientras se arrastra el coche. Cada `getBoundingClientRect()`
     obliga al navegador a vaciar estilo y layout antes de contestar, y aquí
     se pedía justo después de que el propio arrastre hubiera escrito un
     `viewBox` nuevo: leer después de escribir es el caso caro. Medido en esta
     página: 2,3 ms por lectura.

     El marco no se mueve durante un gesto, así que se mide al empezarlo
     (`pointerdown`) y se reutiliza. Un scroll o un cambio de tamaño lo
     invalidan, que son las dos únicas cosas que sí lo desplazan. */
  const frameRectRef = useRef<DOMRect | null>(null);

  const readFrameRect = useCallback((): DOMRect | null => {
    const el = frameRef.current;
    if (!el) return null;
    const rect = frameRectRef.current ?? el.getBoundingClientRect();
    frameRectRef.current = rect;
    return rect;
  }, []);

  useEffect(() => {
    const invalidate = () => {
      frameRectRef.current = null;
    };
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  const localPoint = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const rect = readFrameRect();
      if (!rect) return { x: 0, y: 0 };
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    },
    [readFrameRect],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      // Arranca un gesto nuevo: se vuelve a medir el marco una sola vez.
      frameRectRef.current = null;
      const point = localPoint(event);
      pointersRef.current.set(event.pointerId, point);

      if (pointersRef.current.size === 2) {
        const [a, b] = Array.from(pointersRef.current.values());
        pinchRef.current = {
          distance: Math.hypot(a.x - b.x, a.y - b.y) || 1,
          zoom: baseRef.current.w / viewBoxRef.current.w,
        };
        dragRef.current = null;
        return;
      }

      dragRef.current = { x: point.x, y: point.y, moved: false };
      suppressClickRef.current = false;
    },
    [localPoint],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (!pointersRef.current.has(event.pointerId)) return;
      const point = localPoint(event);
      pointersRef.current.set(event.pointerId, point);

      const frame = sizeRef.current;
      if (!frame) return;

      // Pinza: dos dedos → zoom alrededor del punto medio.
      const pinch = pinchRef.current;
      if (pinch && pointersRef.current.size >= 2) {
        const [a, b] = Array.from(pointersRef.current.values());
        const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        zoomAt(
          pinch.zoom * (distance / pinch.distance),
          (a.x + b.x) / 2,
          (a.y + b.y) / 2,
        );
        suppressClickRef.current = true;
        return;
      }

      const drag = dragRef.current;
      if (!drag) return;

      const dx = point.x - drag.x;
      const dy = point.y - drag.y;

      if (!drag.moved) {
        if (Math.hypot(dx, dy) < 5) return;
        // Sólo se captura el puntero cuando hay arrastre de verdad: si se
        // capturase en el pointerdown, un toque simple sobre una zona vería
        // redirigido su `click` al <svg> y dejaría de seleccionar.
        drag.moved = true;
        suppressClickRef.current = true;
        setIsPanning(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      const current = viewBoxRef.current;
      setFocus({
        x: current.x + current.w / 2 - (dx * current.w) / frame.w,
        y: current.y + current.h / 2 - (dy * current.h) / frame.h,
      });
      drag.x = point.x;
      drag.y = point.y;
    },
    [localPoint, zoomAt],
  );

  const endPointer = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) {
      dragRef.current = null;
      setIsPanning(false);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  // Rueda: sólo se roba el scroll con Ctrl/Cmd (es el gesto de pinza en trackpad).
  // Sin modificador la página sigue desplazándose, que es lo que espera el usuario.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = frameRectRef.current ?? el.getBoundingClientRect();
      frameRectRef.current = rect;
      const factor = Math.exp(-event.deltaY / 260);
      zoomAt(
        (baseRef.current.w / viewBoxRef.current.w) * factor,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  /* ── Zona activa y tooltip ────────────────────────────────────────────── */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  useEffect(() => {
    setHoveredId(null);
    setFocusedId(null);
    setPinnedId(null);
  }, [view]);

  /* Escape descarta el tooltip que haya, anclado o no (WCAG 1.4.13: lo que
     aparece al pasar el raton o al enfocar se tiene que poder cerrar sin
     mover ni el puntero ni el foco). Antes solo cerraba el anclado: el de
     hover/foco se quedaba tapando el coche hasta sacar el raton de la zona.
     Vuelve en cuanto el puntero o el foco pasan a otra zona. */
  const tooltipShown = Boolean(pinnedId ?? hoveredId ?? focusedId);
  useEffect(() => {
    if (!tooltipShown) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setPinnedId(null);
      setHoveredId(null);
      setFocusedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tooltipShown]);

  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const isMuted = useCallback(
    (zone: ResolvedZone) => {
      if (availableOnly && zone.slot.status !== "available") return true;
      return tierFilter !== "all" && zone.slot.tier !== tierFilter;
    },
    [availableOnly, tierFilter],
  );

  const activeId = pinnedId ?? hoveredId ?? focusedId;
  const activeZone = useMemo(() => {
    if (!activeId) return null;
    const zone = zones.find((candidate) => candidate.slot.id === activeId);
    if (!zone || isMuted(zone)) return null;
    return zone;
  }, [activeId, zones, isMuted]);

  const tooltipPosition = useMemo(() => {
    if (!activeZone || !size) return null;
    return {
      x: ((activeZone.geometry.anchor.x - viewBox.x) / viewBox.w) * size.w,
      y: ((activeZone.geometry.anchor.y - viewBox.y) / viewBox.h) * size.h,
    };
  }, [activeZone, size, viewBox]);

  const handleActivate = useCallback(
    (zone: ResolvedZone, source: ZoneActivationSource) => {
      // Sólo el puntero arrastra; el teclado nunca debe caer en este filtro.
      if (source === "pointer" && suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      // Zona-puente: no es un hueco que se compre aquí, es el canto de un
      // panel que se vende en otra vista. Navegar es lo único que tiene
      // sentido; seleccionarla vendería 5 cm de tira en vez del panel.
      if (zone.geometry.linksTo && onNavigateView) {
        onNavigateView(zone.geometry.linksTo);
        return;
      }
      if (zone.slot.status === "occupied") {
        // Ocupada: no entra en la selección. Se ancla el tooltip para que su
        // enlace al patrocinador sea alcanzable con ratón y con teclado.
        setPinnedId((prev) => (prev === zone.slot.id ? null : zone.slot.id));
        return;
      }
      setPinnedId(null);
      if (onOpenStudio) {
        onOpenStudio(zone);
        return;
      }
      onToggleZone(zone);
    },
    [onToggleZone, onNavigateView, onOpenStudio],
  );

  /* ── Render ───────────────────────────────────────────────────────────── */
  const scaleLabel = `${Math.round((base.w / viewBox.w) * 100)}%`;
  const viewName = t.common.carViews[view];
  const cmPerUnit = CM_PER_UNIT_BY_VIEW[view];
  const brandStamp = brandName.trim().toUpperCase().slice(0, BRAND_STAMP_MAX_CHARS);

  const svgStyle: CSSProperties & Record<`--${string}`, string> = {
    "--car-stroke": `${STROKE_STEPS[strokeIndex]}px`,
    /* El line-art hereda este `color` por `stroke: currentColor`. Va contra
       el triplete del TEXTO, que es el único que se invierte con el tema:
       tinta clara al 72 % sobre carbón (como hasta ahora) y tinta oscura al
       72 % sobre crema (#635D53, 5.5:1). Sin respaldo a propósito — los dos
       bloques de tema definen `--text-rgb` en `:root`, y un respaldo fijo
       sólo podría entrar en conflicto con uno de los dos. */
    color: "rgb(var(--text-rgb) / 0.72)",
    touchAction: zoom > MIN_ZOOM ? "none" : "pan-y",
    cursor: isPanning ? "grabbing" : zoom > MIN_ZOOM ? "grab" : "default",
  };

  return (
    <div className="relative">
      {/* Sombra en el suelo y rejilla a otra profundidad, pero el visor NO
          gira: aquí se arrastra, se hace zoom y se apunta a zonas pequeñas,
          y la posición del puntero se calcula con la caja del marco, que un
          giro 3D deformaría. Con giro y elevación a 0, <TiltCard> no pone
          ningún transform sobre el marco. */}
      <TiltCard maxTilt={0} lift={0} thickness={0} rim={false}>
        <div
          ref={frameRef}
          className="hud-frame hud-frame-slate panel dust-overlay relative h-[340px] w-full overflow-hidden select-none sm:h-[440px] lg:h-[540px]"
        >
          {/* La rejilla se hunde: se desplaza al contrario que el puntero. Sobra
              por los cuatro lados para que el desplazamiento no descubra el borde. */}
          <TiltDepth depth={-40} className="pointer-events-none absolute -inset-4">
            <div className="grid-blueprint grid-fade absolute inset-0 opacity-70" />
          </TiltDepth>

          <svg
            /* `role="img"` NO vale aquí: la regla ARIA "children presentational"
               convierte en decorativo TODO el subárbol de un `img`, así que los
               <path role="button"> de las zonas desaparecerían del lector de
               pantalla. `group` deja el dibujo etiquetado y a la vez expone las
               zonas como los controles que son. */
            role="group"
            aria-label={`${t.common.a11y.carDiagram} — ${viewName}`}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            className="relative z-[1] block h-full w-full"
            style={svgStyle}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            onPointerLeave={(event) => {
              endPointer(event);
              setHoveredId(null);
            }}
            onDoubleClick={(event) => {
              const rect = frameRef.current?.getBoundingClientRect();
              if (!rect) return;
              const current = base.w / viewBoxRef.current.w;
              zoomAt(
                current > 1.2 ? MIN_ZOOM : 2.6,
                event.clientX - rect.left,
                event.clientY - rect.top,
              );
            }}
          >
            <defs>
              {/* Trama diagonal de las zonas ya vendidas. El gris arena sale
                  del token `--muted-rgb` (el mismo 140 130 117 en tactical) y
                  la dosis sube en el tema claro: una trama pensada para restar
                  luz sobre negro tiene que sumar grano sobre crema.
                  Los colores van en `style`: un atributo de presentación SVG no
                  resuelve var(). */}
              <pattern
                id={`occupied-${uid}`}
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect
                  width="10"
                  height="10"
                  style={{ fill: `rgb(var(--muted-rgb) / ${zoneAlpha(0.16)})` }}
                />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="10"
                  strokeWidth="3"
                  style={{ stroke: `rgb(var(--muted-rgb) / ${zoneAlpha(0.55)})` }}
                />
              </pattern>
            </defs>

            {lineArt ? (
              <g
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: LINE_STYLE + lineArt }}
              />
            ) : null}

            <g>
              {zones.map((zone) => (
                <SponsorZone
                  key={zone.slot.id}
                  zone={zone}
                  muted={isMuted(zone)}
                  selected={selected.has(zone.slot.id)}
                  opensStudio={Boolean(onOpenStudio)}
                  active={activeId === zone.slot.id}
                  occupiedPatternId={`occupied-${uid}`}
                  onActivate={handleActivate}
                  onHoverChange={setHoveredId}
                  onFocusChange={setFocusedId}
                />
              ))}
            </g>

            {/* Rotulado real: lo que el cliente ha compuesto en el estudio, sobre
                la chapa y recortado por el contorno de su zona.

                `pointerEvents: none` es imprescindible: este grupo va ENCIMA de
                las zonas, y sin él un logo taparía el <path> que hay debajo y la
                zona dejaría de poder pulsarse justo cuando ya está rotulada. */}
            {artwork ? (
              <g aria-hidden="true" style={{ pointerEvents: "none" }}>
                {zones.map((zone) => {
                  if (!selected.has(zone.slot.id) || isMuted(zone)) return null;
                  const design = artwork[zone.slot.id];
                  if (isArtworkEmpty(design)) return null;
                  return (
                    <ZoneArtworkLayer
                      key={`art-${zone.slot.id}`}
                      d={zone.geometry.d}
                      box={zoneBox(zone.geometry.d)}
                      artwork={design ?? EMPTY_ARTWORK}
                      clipId={`art-${uid}-${zone.slot.id}`}
                    />
                  );
                })}
              </g>
            ) : null}

            {/* Previsualización de la rotulación: el nombre tecleado, estampado
                sobre cada zona elegida y escalado a su vinilo real. Sólo donde NO
                hay rotulado propio — si el cliente ya ha puesto su logo, seguir
                estampando el nombre encima lo taparía. */}
            {brandStamp.length > 0 ? (
              <g aria-hidden="true" style={{ pointerEvents: "none" }}>
                {zones.map((zone) => {
                  if (!selected.has(zone.slot.id) || isMuted(zone)) return null;
                  if (artwork && !isArtworkEmpty(artwork[zone.slot.id])) return null;
                  // Ojo: `fontSize`, no `size`. `size` es la medida del MARCO en
                  // píxeles, y sombrearla aquí dentro se lee fatal.
                  const fontSize = brandFontSize(zone, brandStamp.length, cmPerUnit);
                  if (fontSize <= 0) return null;
                  return (
                    <text
                      key={`brand-${zone.slot.id}`}
                      x={zone.geometry.anchor.x}
                      y={zone.geometry.anchor.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        /* Rotulación: el color de señal del tema (lima sobre
                           negro, moss sobre crema) con un halo del FONDO del
                           tema, que es lo que la despega de la zona debajo. */
                        fill: "rgb(var(--lime-rgb) / 0.92)",
                        stroke: `rgb(var(--base-rgb) / ${zoneAlpha(0.55)})`,
                        fontFamily: "var(--font-heading), sans-serif",
                        fontWeight: 700,
                        fontSize: `${fontSize}px`,
                        letterSpacing: `${fontSize * 0.06}px`,
                        paintOrder: "stroke",
                        strokeWidth: fontSize * 0.1,
                        strokeLinejoin: "round",
                      }}
                    >
                      {brandStamp}
                    </text>
                  );
                })}
              </g>
            ) : null}
          </svg>

          {/* Estado de carga / fallo del line-art. El coche puede no estar, pero
              las zonas y toda la información siguen siendo utilizables. */}
          {!lineArt ? (
            <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
              <span className="telemetry-label">
                {lineArtFailed ? t.common.errors.generic : t.common.labels.loading}
              </span>
            </div>
          ) : null}

          {/* HUD superior izquierdo: vista y escala. */}
          <div className="pointer-events-none absolute top-3 left-3 z-[2] flex flex-wrap items-center gap-2">
            <span className="tech-badge tech-badge-amber">{viewName}</span>
            <span className="tech-badge font-mono">{scaleLabel}</span>
          </div>

          {/* HUD superior derecho: aviso de simulación en vivo. */}
          <div className="pointer-events-none absolute top-3 right-3 z-[2] hidden items-center gap-2 sm:flex">
            <span className="status-dot" />
            <span className="telemetry-label">{t.sponsors.configurator.realtime}</span>
          </div>

          {/* Controles de cámara: el zoom tiene que ser usable sin gestos. */}
          <div className="absolute right-3 bottom-3 z-[3] flex items-center gap-1.5">
            <div className="panel-sunken chamfer-quad-sm flex items-center gap-1 p-1">
              <button
                type="button"
                onClick={() => stepZoom(1 / 1.45)}
                disabled={zoom <= MIN_ZOOM + 0.001}
                aria-label={t.sponsors.configurator.zoomOut}
                title={t.sponsors.configurator.zoomOut}
                className="font-mono h-8 w-8 text-sm text-text-secondary transition-colors hover:text-amber-text disabled:cursor-not-allowed disabled:opacity-35"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => stepZoom(1.45)}
                disabled={zoom >= MAX_ZOOM - 0.001}
                aria-label={t.sponsors.configurator.zoomIn}
                title={t.sponsors.configurator.zoomIn}
                className="font-mono h-8 w-8 text-sm text-text-secondary transition-colors hover:text-amber-text disabled:cursor-not-allowed disabled:opacity-35"
              >
                +
              </button>
              <button
                type="button"
                onClick={resetCamera}
                disabled={zoom <= MIN_ZOOM + 0.001}
                aria-label={t.sponsors.configurator.resetView}
                title={t.sponsors.configurator.resetView}
                className="font-mono h-8 px-2 text-[0.6875rem] tracking-[0.18em] text-text-secondary uppercase transition-colors hover:text-amber-text disabled:cursor-not-allowed disabled:opacity-35"
              >
                1:1
              </button>
            </div>
          </div>

          {/* Grosor de trazo del line-art. */}
          <div className="absolute bottom-3 left-3 z-[3] hidden items-center gap-2 sm:flex">
            <span className="telemetry-label">{t.sponsors.configurator.strokeLabel}</span>
            <div className="panel-sunken chamfer-quad-sm flex items-center gap-0.5 p-1">
              {STROKE_STEPS.map((step, index) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setStrokeIndex(index)}
                  aria-pressed={strokeIndex === index}
                  aria-label={`${t.sponsors.configurator.strokeLabel} ${index + 1}`}
                  className={`font-mono h-6 w-6 text-[0.6875rem] transition-colors ${
                    strokeIndex === index
                      ? "bg-amber-solid text-text-inverse"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {activeZone && tooltipPosition && size ? (
            <ZoneTooltip
              zone={activeZone}
              x={tooltipPosition.x}
              y={tooltipPosition.y}
              frameWidth={size.w}
              frameHeight={size.h}
              pinned={pinnedId === activeZone.slot.id}
              onClose={() => setPinnedId(null)}
            />
          ) : null}
        </div>
      </TiltCard>

    </div>
  );
}
