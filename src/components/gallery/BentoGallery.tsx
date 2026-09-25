"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <BentoGallery />
   Galeria principal del Modulo 2. Bento grid asimetrico + lightbox.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   QUE RESUELVE
   ------------
   La disposicion anterior era una rejilla uniforme de 6 huecos 4:3 con fotos
   de stock. Aqui la retícula es un BENTO: cada imagen recibe una de cuatro
   formas segun su relacion de aspecto nativa y su posicion en la lista, de
   modo que la composicion cambia cuando cambia el filtro.

   LA RETICULA (por que encaja sin agujeros)
   -----------------------------------------
   El modulo base es una celda de 2 columnas x 2 filas. Las cuatro formas son
   multiplos exactos de ese modulo:

       block  1x1 modulo      wide  2x1 modulos
       tall   1x2 modulos     hero  2x2 modulos

   Con `grid-flow-row-dense` sobre 6 columnas (3 modulos) en escritorio y 4
   (2 modulos) en tablet, el empaquetado es perfecto: no quedan huecos
   sueltos como pasaria mezclando spans impares. En movil la retícula pasa a
   una sola columna de ancho completo, que es lo unico legible a 375px y
   ademas hace innecesario el empaquetado.

   ANIMACION (toda condicionada a prefers-reduced-motion)
   ------------------------------------------------------
   · Tarjeta con volumen al pasar el raton (<TiltCard />): giro 3D hacia el
     puntero, canto, sombra en el suelo y reflejo, con muelles de
     framer-motion: cero renders de React por movimiento del raton.
   · Parallax vertical sutil: un unico listener de scroll en el contenedor
     recorre solo las celdas visibles y desplaza la capa de imagen segun su
     profundidad. La capa sobresale por arriba y por abajo tantos px como
     recorrido tenga (mas holgura), para que el desplazamiento no descubra
     nunca el borde.

   DATOS Y COPY
   ------------
   · Las imagenes salen del manifiesto `src/lib/imagery.ts` y se pintan con
     <RallyImage />, que ya resuelve foto real vs placeholder tactico.
   · El alt y el pie de cada imagen son del manifiesto (es su dueno).
   · TODO el copy de interfaz — filtros, contador, vacio, acciones — viene de
     i18n. Los filtros se mapean a predicados sobre el manifiesto en
     `GALLERY_FILTERS`, que es el unico punto de union entre ambos.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useReducedMotion } from "framer-motion";
import { Compass, MapPin, Maximize2, Mountain } from "lucide-react";
import RallyImage from "@/components/ui/RallyImage";
import TiltCard from "@/components/ui/TiltCard";
import Lightbox from "@/components/gallery/Lightbox";
import { useT } from "@/i18n/LanguageProvider";
import {
  TERRAIN_LABELS,
  formatCoordinates,
  formatStageLabel,
  getGalleryImages,
  type RallyImageEntry,
  type RallyTerrain,
} from "@/lib/imagery";

/* ────────────────────────────────────────────────────────────
   Filtros
   ──────────────────────────────────────────────────────────── */

/** Ids de filtro. Coinciden 1:1 con las claves de `t.media.filters`. */
export type GalleryFilterId =
  | "all"
  | "rally"
  | "solidarity"
  | "mechanics"
  | "team"
  | "landscape";

/** Terrenos que cuentan como paisaje puro en el filtro "landscape". */
const LANDSCAPE_TERRAINS: ReadonlySet<RallyTerrain> = new Set<RallyTerrain>([
  "dunas",
  "garganta",
  "montana",
  "oasis",
  "pedregal",
  "pista-piedra",
]);

function hasTag(entry: RallyImageEntry, tag: string): boolean {
  return entry.tags?.includes(tag) ?? false;
}

/**
 * Union entre el vocabulario de i18n y el manifiesto.
 *
 * Una imagen puede caer en mas de un filtro (una duna del Erg Chebbi es
 * etapa y es paisaje): es lo normal en una galeria y evita tener que
 * clasificar el archivo dos veces.
 */
const GALLERY_FILTERS: readonly {
  id: GalleryFilterId;
  match: (entry: RallyImageEntry) => boolean;
}[] = [
  { id: "all", match: () => true },
  { id: "rally", match: (entry) => entry.category === "etapas" },
  { id: "solidarity", match: (entry) => entry.category === "solidario" },
  {
    id: "mechanics",
    match: (entry) =>
      entry.category === "coches" ||
      hasTag(entry, "mecanica") ||
      hasTag(entry, "taller"),
  },
  { id: "team", match: (entry) => entry.category === "equipo" },
  {
    id: "landscape",
    match: (entry) =>
      entry.rally?.terrain !== undefined &&
      LANDSCAPE_TERRAINS.has(entry.rally.terrain),
  },
];

/* ────────────────────────────────────────────────────────────
   Formas del bento
   ──────────────────────────────────────────────────────────── */

type TileShape = "hero" | "wide" | "block" | "tall";

/**
 * Spans por breakpoint. Literales completos a proposito: Tailwind escanea el
 * fuente y no veria clases compuestas en tiempo de ejecucion.
 *
 *   movil  2 col  · todo a ancho completo, alturas distintas
 *   sm     4 col  · 2 modulos de ancho
 *   lg     6 col  · 3 modulos de ancho
 *
 * En sm y lg los spans son multiplos EXACTOS del modulo 2x2, que es lo que
 * permite que `grid-flow-row-dense` empaquete sin dejar huecos sueltos. En
 * movil la retícula es de una sola columna util (las dos columnas se ocupan
 * enteras), asi que ahi no hay empaquetado y las alturas se eligen por
 * legibilidad. Con filas de 5.5rem y hueco de 0.5rem, a 375px de ancho de
 * ventana (327px utiles tras el padding de seccion) cada forma cae en:
 *
 *     wide  184px -> 16:9      block 280px -> ~7:6
 *     hero  376px -> ~7:8      tall  472px -> ~2:3
 */
const TILE_CLASSES: Record<TileShape, string> = {
  hero: "col-span-2 row-span-4 sm:col-span-4 sm:row-span-4 lg:col-span-4 lg:row-span-4",
  wide: "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 lg:col-span-4 lg:row-span-2",
  block: "col-span-2 row-span-3 sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2",
  tall: "col-span-2 row-span-5 sm:col-span-2 sm:row-span-4 lg:col-span-2 lg:row-span-4",
};

/** `sizes` de next/image por forma, para no servir 2400px a un thumbnail. */
const TILE_SIZES: Record<TileShape, string> = {
  hero: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw",
  wide: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 66vw",
  block: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw",
  tall: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw",
};

/**
 * Forma base de una celda a partir de su aspecto nativo y su posicion.
 *
 * El indice introduce la variacion que evita que todas las fotos del mismo
 * aspecto se vean iguales, y hace que la composicion cambie al filtrar.
 */
function baseShapeFor(entry: RallyImageEntry, index: number): TileShape {
  switch (entry.aspect) {
    case "portrait":
      return "tall";
    case "ultrawide":
      return "wide";
    case "wide":
      return index % 3 === 1 ? "wide" : "block";
    case "square":
      return index % 4 === 2 ? "tall" : "block";
    case "landscape":
    default:
      return index % 7 === 3 ? "wide" : "block";
  }
}

/** Una celda "hero" por cada N celdas de la lista. */
const HERO_EVERY = 9;
/** Celdas minimas entre dos "hero", para que no salgan pegados. */
const HERO_MIN_GAP = 5;

/**
 * Formas de TODAS las celdas de una tanda.
 *
 * Es una funcion PURA de la lista: servidor y cliente calculan lo mismo, asi
 * que no hay desajuste de hidratacion.
 *
 * Por que no basta con "si es `featured` -> hero": en el manifiesto hay cinco
 * destacadas y tres de ellas caen dentro de las doce primeras celdas (dias 4,
 * 5 y 5). Promocionarlas todas llenaba media retícula de bloques 2x2 y el
 * bento perdia justo el contraste de tamano que lo hace un bento. Aqui las
 * destacadas solo son CANDIDATAS: se reparte un presupuesto de una hero por
 * cada `HERO_EVERY` celdas y se exige una separacion minima, de modo que la
 * composicion tiene anclas grandes pero espaciadas.
 */
function computeTileShapes(entries: readonly RallyImageEntry[]): TileShape[] {
  const shapes = entries.map(baseShapeFor);

  const budget = Math.max(1, Math.floor(entries.length / HERO_EVERY));
  let promoted = 0;
  let lastHero = -HERO_MIN_GAP;

  for (let index = 0; index < entries.length && promoted < budget; index += 1) {
    const entry = entries[index];
    // Un retrato estirado a 2x2 se recorta fatal: se queda en "tall".
    if (!entry.featured || entry.aspect === "portrait") continue;
    if (index - lastHero < HERO_MIN_GAP) continue;
    shapes[index] = "hero";
    lastHero = index;
    promoted += 1;
  }

  return shapes;
}

/* ────────────────────────────────────────────────────────────
   Parametros de animacion
   ──────────────────────────────────────────────────────────── */

/** Recorrido del parallax por celda, en px. Se alterna para dar profundidad. */
const PARALLAX_DEPTHS = [7, 12, 17] as const;
/** Holgura extra sobre el recorrido, para absorber el redondeo subpixel. */
const PARALLAX_SAFETY_PX = 6;
/** Celdas visibles antes de pulsar "ver mas". */
const DEFAULT_INITIAL_VISIBLE = 12;

/* ────────────────────────────────────────────────────────────
   API publica
   ──────────────────────────────────────────────────────────── */

export interface BentoGalleryProps {
  /** Coleccion a pintar. Por defecto, la galeria del manifiesto. */
  images?: readonly RallyImageEntry[];
  /** Muestra la fila de filtros. */
  showFilters?: boolean;
  /** Cuantas celdas se pintan antes de "ver mas". `0` las pinta todas. */
  initialVisible?: number;
  /** Clases extra sobre el contenedor. */
  className?: string;
}

export default function BentoGallery({
  images,
  showFilters = true,
  initialVisible = DEFAULT_INITIAL_VISIBLE,
  className = "",
}: BentoGalleryProps) {
  const t = useT();
  const reducedMotion = useReducedMotion() === true;

  const gridRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  /** Indice al que devolver el foco tras pulsar "ver mas". */
  const focusAfterExpand = useRef<number | null>(null);

  const [activeFilter, setActiveFilter] = useState<GalleryFilterId>("all");
  const [expanded, setExpanded] = useState(initialVisible <= 0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  /**
   * Gate de movimiento para lo que se RENDERIZA (clases de hover-zoom).
   *
   * `useReducedMotion` de framer-motion lee la media query con
   * `useState(prefersReducedMotion.current)`: en servidor vale `null` y en el
   * primer render de cliente ya vale `true` para quien tenga reducir
   * movimiento activado. Usarlo tal cual en una `className` producia un
   * desajuste de hidratacion en las 12 celdas. Se resuelve emitiendo siempre
   * la variante con movimiento en el HTML del servidor (y en el primer render
   * de cliente, que debe ser identico) y retirandola ya montado. Como lo unico
   * que cambia es una transicion de :hover, no hay salto visible.
   */
  const renderMotion = !mounted || !reducedMotion;

  const source = useMemo(
    () => images ?? getGalleryImages(),
    [images],
  );

  const filtered = useMemo(() => {
    const filter = GALLERY_FILTERS.find((item) => item.id === activeFilter);
    return filter ? source.filter(filter.match) : [...source];
  }, [source, activeFilter]);

  const visible = useMemo(
    () =>
      expanded || initialVisible <= 0
        ? filtered
        : filtered.slice(0, initialVisible),
    [filtered, expanded, initialVisible],
  );

  const hiddenCount = filtered.length - visible.length;

  /** Formas de la tanda visible. Se recalculan al filtrar o al expandir. */
  const shapes = useMemo(() => computeTileShapes(visible), [visible]);

  /**
   * Identidad de la tanda visible. El parallax se re-siembra cuando cambia,
   * no solo cuando cambia la longitud: al filtrar pueden entrar celdas
   * distintas con el mismo recuento y quedarian sin posicion inicial hasta
   * el siguiente scroll.
   */
  const visibleKey = useMemo(
    () => visible.map((entry) => entry.id).join("|"),
    [visible],
  );

  /* Cambiar de filtro reordena la lista: cerrar el visor evita que quede
     apuntando a otra imagen distinta de la que el usuario abrio. */
  const selectFilter = useCallback((id: GalleryFilterId) => {
    setActiveFilter(id);
    setOpenIndex(null);
  }, []);

  const openAt = useCallback((index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setOpenIndex(index);
  }, []);

  const closeLightbox = useCallback(() => setOpenIndex(null), []);

  /* "Ver mas" se desmonta en cuanto deja de haber ocultas: sin esto, el foco
     del teclado caia al <body> y el usuario perdia el sitio. Se anota el
     indice de la primera celda nueva y se le pasa el foco al repintar. */
  const expandAll = useCallback(() => {
    focusAfterExpand.current = visible.length;
    setExpanded(true);
  }, [visible.length]);

  /* ── Foco tras expandir ─────────────────────────────────────────────
     Solo actua cuando `expandAll` dejo un indice anotado; los demas
     repintados de `visibleKey` (cambio de filtro) salen por la puerta de
     arriba sin tocar el foco. */
  useEffect(() => {
    const target = focusAfterExpand.current;
    focusAfterExpand.current = null;
    if (target === null) return;
    const root = gridRef.current;
    if (!root) return;
    const triggers = root.querySelectorAll<HTMLButtonElement>(
      "[data-tile-trigger]",
    );
    triggers.item(target)?.focus();
  }, [visibleKey]);

  /* ── Parallax: un solo listener para toda la retícula ──────────────── */
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;

    /* La lista se resuelve UNA vez por tanda: `querySelectorAll` en cada
       frame de scroll era trabajo puro de descarte. */
    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax]"),
    );

    if (reducedMotion) {
      for (const layer of layers) layer.style.removeProperty("--parallax");
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight || 1;
      for (const layer of layers) {
        const rect = layer.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > viewport + 200) continue;
        const depth = Number(layer.dataset.parallax);
        if (!Number.isFinite(depth) || depth === 0) continue;
        const center = rect.top + rect.height / 2;
        const span = viewport / 2 + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (center - viewport / 2) / span));
        layer.style.setProperty("--parallax", `${(progress * depth).toFixed(2)}px`);
      }
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reducedMotion, visibleKey]);

  return (
    <div className={className}>
      {/* ── Cabecera del bloque ──────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-5 sm:mb-10">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="min-w-0">
            <span className="telemetry-label telemetry-label-amber telemetry-label-dash block">
              {t.media.gallery.tag}
            </span>
            <h3 className="mt-3 font-heading text-2xl leading-tight tracking-[0.04em] text-text-primary sm:text-3xl">
              {t.media.gallery.title}
            </h3>
          </div>

          <p className="shrink-0 font-mono text-xs tracking-[0.18em] text-text-tertiary">
            <span className="text-sand tabular-nums">
              {String(filtered.length).padStart(2, "0")}
            </span>{" "}
            {t.media.gallery.countLabel}
          </p>
        </div>

        <hr className="divider-tech" />

        {showFilters && (
          <div
            className="-mx-1 flex flex-wrap gap-2 px-1"
            role="group"
            aria-label={t.media.gallery.tag}
          >
            {GALLERY_FILTERS.map((filter) => {
              const isActive = filter.id === activeFilter;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => selectFilter(filter.id)}
                  aria-pressed={isActive}
                  className={`chamfer-sm px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${
                    isActive
                      ? "bg-amber-solid text-text-inverse"
                      : "bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-amber-text"
                  }`}
                >
                  {t.media.filters[filter.id]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Retícula ─────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <p className="panel px-6 py-10 text-center font-body text-sm text-text-secondary">
          {t.media.gallery.empty}
        </p>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-flow-row-dense auto-rows-[5.5rem] grid-cols-2 gap-2 sm:auto-rows-[6.5rem] sm:grid-cols-4 lg:auto-rows-[8rem] lg:grid-cols-6"
        >
          {visible.map((entry, index) => (
            <BentoCell
              key={entry.id}
              entry={entry}
              shape={shapes[index]}
              depth={PARALLAX_DEPTHS[index % PARALLAX_DEPTHS.length]}
              priority={index < 2}
              zoomOnHover={renderMotion}
              actionLabel={`${t.common.actions.more} · ${entry.caption}`}
              onOpen={(trigger) => openAt(index, trigger)}
            />
          ))}
        </div>
      )}

      {/* ── Ver mas ──────────────────────────────────────────── */}
      {hiddenCount > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={expandAll}
            className="btn-tactical btn-outline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            {t.common.actions.viewAll}
            <span className="font-mono text-[0.625rem] text-amber-text tabular-nums">
              +{String(hiddenCount).padStart(2, "0")}
            </span>
          </button>
        </div>
      )}

      {/* ── Visor modal ──────────────────────────────────────── */}
      {openIndex !== null && (
        <Lightbox
          images={visible}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={closeLightbox}
          returnFocusTo={triggerRef.current}
        />
      )}
    </div>
  );
}

export { BentoGallery };

/* ────────────────────────────────────────────────────────────
   Celda
   ──────────────────────────────────────────────────────────── */

/** Hairline interior del marco: `clip-path` recortaria un borde CSS. */
const CARD_STYLE: CSSProperties = {
  boxShadow: "inset 0 0 0 1px var(--color-slate)",
};

/**
 * Capa de imagen: sobresale del marco por ARRIBA y por ABAJO para que el
 * desplazamiento del parallax no descubra nunca el borde.
 *
 * El margen se calcula en px a partir de la profundidad real de la celda, no
 * como porcentaje del marco. Con un `inset` porcentual el margen encogia con
 * la celda mientras el recorrido seguia siendo fijo: en movil, una celda de
 * 176 px con un margen del 7% daba 12 px de holgura para un recorrido de
 * hasta 17 px, y se veia la franja del fondo por el canto.
 *
 * Solo hay movimiento vertical, asi que a los lados no se desborda nada: se
 * evita ampliar la imagen a lo ancho sin necesidad.
 */
function mediaLayerStyle(depth: number): CSSProperties {
  const overhang = depth + PARALLAX_SAFETY_PX;
  return {
    top: -overhang,
    bottom: -overhang,
    transform: "translate3d(0, var(--parallax, 0px), 0)",
  };
}

interface BentoCellProps {
  entry: RallyImageEntry;
  shape: TileShape;
  depth: number;
  priority: boolean;
  /** Zoom de :hover sobre la imagen. Afecta a una clase RENDERIZADA. */
  zoomOnHover: boolean;
  actionLabel: string;
  onOpen: (trigger: HTMLElement) => void;
}

function BentoCell({
  entry,
  shape,
  depth,
  priority,
  zoomOnHover,
  actionLabel,
  onOpen,
}: BentoCellProps) {
  const stage = formatStageLabel(entry);
  const coordinates = entry.rally?.coordinates;
  const terrain = entry.rally?.terrain;

  return (
    <article className={`group relative ${TILE_CLASSES[shape]}`}>
      <TiltCard className="h-full" maxTilt={8} lift={18} thickness={4}>
        <div
          className="chamfer relative h-full w-full overflow-hidden bg-bg-surface"
          style={CARD_STYLE}
        >
          {/* Imagen (o placeholder tactico) con parallax.
              El zoom de hover se apaga por completo con prefers-reduced-motion:
              no basta con matar la transicion, porque el salto instantaneo
              seria aun peor que el movimiento. */}
          <div
            data-parallax={depth}
            className="absolute inset-x-0 will-change-transform"
            style={mediaLayerStyle(depth)}
          >
            <RallyImage
              image={entry}
              fillParent
              overlay="none"
              showCaption={false}
              chamfer={false}
              priority={priority}
              sizes={TILE_SIZES[shape]}
              imageClassName={
                zoomOnHover
                  ? "transition-transform duration-700 ease-tactical group-hover:scale-[1.04]"
                  : ""
              }
            />
          </div>

          {/* Badge de etapa: siempre visible, ancla el dato de ruta */}
          {stage && (
            <span className="pointer-events-none absolute left-3 top-3 z-20 bg-bg-base/75 px-2 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-amber-text">
              {stage}
            </span>
          )}

          {/* Overlay de datos de rally.
              En dispositivos sin hover se muestra siempre (ver la regla
              @media (hover: none) mas abajo). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end opacity-0 transition-opacity duration-300 ease-tactical group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(to top, rgb(var(--base-rgb) / 0.94) 0%, rgb(var(--base-rgb) / 0.55) 42%, rgb(var(--base-rgb) / 0) 78%)",
            }}
          >
            <div className="flex flex-col gap-1.5 p-3 sm:p-4">
              <p className="line-clamp-2 font-heading text-sm uppercase leading-tight tracking-[0.04em] text-text-primary sm:text-base">
                {entry.caption}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-text-tertiary">
                {entry.rally?.location && (
                  <span className="flex min-w-0 items-center gap-1 text-text-secondary">
                    <MapPin size={10} strokeWidth={2} aria-hidden="true" />
                    <span className="truncate">{entry.rally.location}</span>
                  </span>
                )}
                {coordinates && (
                  <span className="flex shrink-0 items-center gap-1">
                    <Compass size={10} strokeWidth={2} aria-hidden="true" />
                    {formatCoordinates(coordinates)}
                  </span>
                )}
                {terrain && (
                  <span className="flex shrink-0 items-center gap-1 text-sand">
                    <Mountain size={10} strokeWidth={2} aria-hidden="true" />
                    {TERRAIN_LABELS[terrain]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Marcas de esquina, encima del overlay */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 ease-tactical group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <span className="absolute left-2 top-2 h-3 w-3 border-l border-t border-amber" />
            <span className="absolute right-2 top-2 h-3 w-3 border-r border-t border-amber" />
            <span className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-amber" />
            <span className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-amber" />
          </span>

          {/* Disparador accesible: cubre la tarjeta entera */}
          <button
            type="button"
            data-tile-trigger=""
            onClick={(event) => onOpen(event.currentTarget)}
            className="absolute inset-0 z-30 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber"
          >
            <span className="sr-only">{actionLabel}</span>
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center bg-bg-base/75 text-amber opacity-0 transition-opacity duration-300 ease-tactical group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <Maximize2 size={12} strokeWidth={2} />
            </span>
          </button>
        </div>
      </TiltCard>
    </article>
  );
}
