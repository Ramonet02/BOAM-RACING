"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <RallyImage />
   Renderizador unico de todo el archivo fotografico (Modulo 6).
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Recibe una entrada del manifiesto (`src/lib/imagery.ts`) o su id y decide:

     · `hasAsset: true`  -> next/image con fill, sizes y el alt del manifiesto.
     · `hasAsset: false` -> PLACEHOLDER tactico (rejilla blueprint, marcas HUD,
       alt y caption visibles, coordenadas GPS y badge "pendiente de archivo").
       Se ve en produccion hasta que lleguen las fotos reales, asi que esta
       tratado como pieza de diseno, no como hueco gris.

   El placeholder NUNCA rompe el layout:
     · ocupa exactamente el aspect-ratio que se le pida (prop `aspect` o el
       nativo de la entrada), o el hueco del padre si se usa `fillParent`;
     · mide su propio marco con ResizeObserver y baja de densidad
       (full -> compact -> micro) para que el texto jamas desborde ni se
       solape con las barras del HUD en tarjetas pequenas.

   USO
   ---
     import RallyImage from "@/components/ui/RallyImage";
     import { getGalleryImages, getImage } from "@/lib/imagery";

     // por id (autocompletado y comprobado en build)
     <RallyImage image="etapa-d05-erg-chebbi-amanecer" aspect="wide" priority />

     // por entrada, con overlay de datos de rally al pasar el raton
     {getGalleryImages().map((img) => (
       <RallyImage key={img.id} image={img} overlay="hover" />
     ))}

     // como fondo de un hero (el padre debe ser `relative`)
     <RallyImage image={getImage("portada-media")} fillParent priority />
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  Camera,
  Car,
  HeartHandshake,
  Mountain,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  ASPECT_RATIO,
  CATEGORY_LABELS,
  TERRAIN_LABELS,
  defaultSizesFor,
  findImage,
  formatAssetCode,
  formatCoordinates,
  formatStageLabel,
  type RallyImageAspect,
  type RallyImageCategory,
  type RallyImageEntry,
  type RallyImageId,
} from "@/lib/imagery";

/* ────────────────────────────────────────────────────────────
   Color · DOS REGLAS DISTINTAS, y conviene tenerlas claras
   ────────────────────────────────────────────────────────────

   Este componente pinta dos cosas que no se parecen en nada, y cada
   una tiene su criterio de color:

   A · PLACEHOLDER (todavia no hay fichero). No hay fotografia debajo:
       es una superficie mas de la pagina. Va ENTERO con tokens de
       tema, asi que en desert sale una hoja de blueprint sobre crema
       y en tactical la chapa oscura de siempre. Cero literales.

   B · OVERLAY SOBRE FOTO REAL. Debajo hay una fotografia de brillo
       desconocido: el tema no puede decidir si ahi el texto ha de ser
       claro u oscuro. Por eso el overlay se fabrica su propio suelo
       —un scrim oscuro— y escribe encima con tinta clara, IGUAL en los
       dos temas. Esos pocos literales son deliberados y van marcados
       como PHOTO_*: no son deuda pendiente de tokenizar. El acento del
       tema si entra ahi, pero como marca, filo y borde, nunca como
       unico portador de la legibilidad.                              */

/* ── A · superficies y tinta del placeholder (siguen el tema) ────── */
const BASE = "var(--color-bg-base)";
const SURFACE = "var(--color-bg-surface)";
const SLATE = "var(--color-slate)";
/** Tinta de los micro-rotulos. text-tertiary y no muted a proposito: es el
 *  token de TEXTO (en desert 4.95:1 frente a los 3.41:1 de muted; en tactical
 *  #A0988C frente a #8C8275), que es lo que pide texto de 9-10px. */
const META_INK = "var(--color-text-tertiary)";

/* ── B · suelo y tinta del overlay sobre foto (fijos en los dos temas) */
/** Scrim fotografico. Fijo A PROPOSITO: ver la nota B de arriba. */
const PHOTO_SCRIM = "15, 16, 18";
/** Tinta secundaria sobre ese scrim, en ambos temas. Era #8C8275, que da
 *  5.04:1 sobre el scrim OPACO — y el scrim solo llega al 92 %: con un 8 % de
 *  arena o cielo claro detras bajaba a ~4:1 en texto de 9 px. #A0988C (el
 *  mismo terciario de tactical) da 6.7:1 opaco y >5:1 en el peor caso. */
const PHOTO_META = "#A0988C";

/** Acento del HUD. Se elige por categoria salvo que se pase `tone`. */
export type RallyImageTone = "amber" | "sand" | "lime";

interface Tone {
  /** Acento pleno: marcas, filos, iconos y texto sobre scrim oscuro. */
  readonly line: string;
  /** Triplete RGB del acento. Separado por ESPACIO: sintaxis moderna,
   *  se compone con rgb(var(--x) / 0.45). */
  readonly rgb: string;
  /** Acento legible a tamano pequeno SOBRE EL FONDO DE LA PAGINA.
   *  En tactical coincide con `line`; en desert lo oscurece. */
  readonly ink: string;
}

const TONES: Record<RallyImageTone, Tone> = {
  amber: {
    line: "var(--color-amber)",
    rgb: "var(--amber-rgb)",
    ink: "var(--color-amber-text)",
  },
  sand: {
    line: "var(--color-sand)",
    rgb: "var(--sand-rgb)",
    // sand-solid y no sand: --color-sand se quedaba en 3.30:1 sobre crema,
    // por debajo de AA en los rotulos de 9-10 px del placeholder (retratos
    // de /equipo). sand-solid da 4.90 sobre base y 5.30 sobre surface; en
    // tactical vale lo mismo que sand, cero cambio alli.
    ink: "var(--color-sand-solid)",
  },
  lime: {
    line: "var(--color-lime)",
    rgb: "var(--lime-rgb)",
    ink: "var(--color-lime)",
  },
};

const TONE_BY_CATEGORY: Record<RallyImageCategory, RallyImageTone> = {
  portada: "amber",
  etapas: "amber",
  equipo: "sand",
  coches: "amber",
  solidario: "lime",
};

const ICON_BY_CATEGORY: Record<RallyImageCategory, LucideIcon> = {
  portada: Camera,
  etapas: Mountain,
  equipo: Users,
  coches: Car,
  solidario: HeartHandshake,
};

/* Tipografias por CSS var con fallback: el componente sigue funcionando
   aunque el design system renombre sus tokens. */
const MONO: CSSProperties = {
  fontFamily:
    "var(--font-mono, 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace)",
};
const DISPLAY: CSSProperties = {
  fontFamily:
    "var(--font-heading, 'Chakra Petch', ui-sans-serif, system-ui, sans-serif)",
};

/* ────────────────────────────────────────────────────────────
   API publica
   ──────────────────────────────────────────────────────────── */

export type RallyOverlayMode = "none" | "hover" | "always";

/** Nivel de detalle del HUD. Se calcula solo segun el tamano real del marco. */
type Density = "micro" | "compact" | "full";

export interface RallyImageProps {
  /** Entrada del manifiesto, o su id (tipado contra el manifiesto). */
  image: RallyImageEntry | RallyImageId;
  /** Fuerza una relacion de aspecto distinta a la nativa de la entrada. */
  aspect?: RallyImageAspect;
  /** Ignora el aspect-ratio y ocupa el padre posicionado (heroes, fondos). */
  fillParent?: boolean;
  /** `sizes` de next/image. Por defecto, el sugerido para el aspecto. */
  sizes?: string;
  /** Carga prioritaria (solo para imagenes above the fold). */
  priority?: boolean;
  /** Calidad de next/image (1-100). */
  quality?: number;
  /** `object-position` de la foto real. Ej: "center 30%". */
  objectPosition?: string;
  /** Overlay con datos de rally sobre la foto real. Por defecto "hover". */
  overlay?: RallyOverlayMode;
  /** Muestra el pie de foto en el overlay / placeholder. */
  showCaption?: boolean;
  /** Fuerza la version reducida del HUD aunque el marco sea grande. */
  compact?: boolean;
  /** Tamano del chaflan de esquina en px. `false` para marco recto. */
  chamfer?: number | false;
  /** Acento del HUD. Por defecto se deduce de la categoria. */
  tone?: RallyImageTone;
  /** Clases extra sobre el marco. */
  className?: string;
  /** Clases extra sobre el `<img>` (por ejemplo `grayscale`). */
  imageClassName?: string;
  /** Contenido extra dentro del marco (badges propios del consumidor). */
  children?: ReactNode;
  /** Si se pasa, el marco se renderiza como boton accesible (lightbox). */
  onClick?: () => void;
}

/* ────────────────────────────────────────────────────────────
   Medida del marco -> densidad del HUD
   ──────────────────────────────────────────────────────────── */

function densityFor(width: number, height: number, forced: boolean): Density {
  // Antes de la primera medida asumimos "full" (o "compact" si lo piden).
  if (width === 0 || height === 0) return forced ? "compact" : "full";
  if (width < 190 || height < 150) return "micro";
  if (forced || width < 330 || height < 235) return "compact";
  return "full";
}

function useFrameSize() {
  const nodeRef = useRef<HTMLElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const setNode = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      setSize((prev) =>
        Math.abs(prev.width - box.width) < 1 &&
        Math.abs(prev.height - box.height) < 1
          ? prev
          : { width: box.width, height: box.height },
      );
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { setNode, size };
}

/* ────────────────────────────────────────────────────────────
   Componente
   ──────────────────────────────────────────────────────────── */

export default function RallyImage({
  image,
  aspect,
  fillParent = false,
  sizes,
  priority = false,
  quality,
  objectPosition = "center",
  overlay = "hover",
  showCaption = true,
  compact = false,
  chamfer = 14,
  tone,
  className = "",
  imageClassName = "",
  children,
  onClick,
}: RallyImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const { setNode, size } = useFrameSize();

  const entry = typeof image === "string" ? findImage(image) : image;

  // Id desconocido: no reventamos el render, dejamos el hueco con su marco.
  if (!entry) {
    return (
      <div
        className={`relative w-full ${className}`}
        style={{
          aspectRatio: ASPECT_RATIO[aspect ?? "landscape"],
          backgroundColor: SURFACE,
          boxShadow: `inset 0 0 0 1px ${SLATE}`,
        }}
        aria-hidden="true"
      />
    );
  }

  const resolvedAspect = aspect ?? entry.aspect;
  const accent = TONES[tone ?? TONE_BY_CATEGORY[entry.category]];
  const ready = entry.hasAsset && !loadFailed;
  const density = densityFor(size.width, size.height, compact);
  const cornerCut = chamfer === false ? 0 : chamfer;

  const frameStyle: CSSProperties = {
    backgroundColor: SURFACE,
    ...(fillParent ? {} : { aspectRatio: ASPECT_RATIO[resolvedAspect] }),
    ...(cornerCut > 0
      ? {
          clipPath: `polygon(0 0, calc(100% - ${cornerCut}px) 0, 100% ${cornerCut}px, 100% 100%, ${cornerCut}px 100%, 0 calc(100% - ${cornerCut}px))`,
        }
      : {}),
  };

  const frameClass = [
    "group relative isolate block w-full min-w-0 overflow-hidden text-left",
    fillParent ? "absolute inset-0 h-full w-full" : "",
    onClick ? "cursor-pointer focus-visible:outline focus-visible:outline-2" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      {/* Filo tecnico por encima de todo, sin engordar el marco */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30"
        style={{ boxShadow: `inset 0 0 0 1px ${SLATE}` }}
      />

      {ready ? (
        <>
          <Image
            src={entry.src}
            alt={entry.alt}
            fill
            sizes={sizes ?? defaultSizesFor(resolvedAspect)}
            priority={priority}
            quality={quality}
            onError={() => setLoadFailed(true)}
            className={`object-cover ${imageClassName}`}
            style={{ objectPosition }}
          />
          {overlay !== "none" && (
            <PhotoOverlay
              entry={entry}
              accent={accent}
              mode={overlay}
              showCaption={showCaption}
              density={density}
            />
          )}
        </>
      ) : (
        <PendingPlaceholder
          entry={entry}
          accent={accent}
          showCaption={showCaption}
          density={density}
        />
      )}

      {children}
    </>
  );

  if (onClick) {
    return (
      <button
        ref={setNode}
        type="button"
        onClick={onClick}
        className={frameClass}
        style={{ ...frameStyle, outlineColor: accent.line }}
        lang="es"
        aria-label={entry.alt}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      ref={setNode}
      data-density={density}
      data-measured={`${Math.round(size.width)}x${Math.round(size.height)}`}
      className={frameClass}
      style={frameStyle}
      lang="es"
      role={ready ? undefined : "img"}
      aria-label={ready ? undefined : entry.alt}
    >
      {body}
    </div>
  );
}

/* Reexport con nombre, para quien prefiera el import nombrado. */
export { RallyImage };

/* ────────────────────────────────────────────────────────────
   Placeholder tactico (fichero todavia no entregado)
   ──────────────────────────────────────────────────────────── */

function PendingPlaceholder({
  entry,
  accent,
  showCaption,
  density,
}: {
  entry: RallyImageEntry;
  accent: Tone;
  showCaption: boolean;
  density: Density;
}) {
  const Icon = ICON_BY_CATEGORY[entry.category];
  const stage = formatStageLabel(entry);
  const coords = entry.rally?.coordinates
    ? formatCoordinates(entry.rally.coordinates)
    : null;
  const terrain = entry.rally?.terrain
    ? TERRAIN_LABELS[entry.rally.terrain]
    : null;

  const isMicro = density === "micro";
  const isFull = density === "full";
  const showBottomBar = !isMicro && Boolean(coords || entry.rally?.location);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* ── Capas de fondo ── */}
      <div className="absolute inset-0" style={{ backgroundColor: BASE }} />

      {/* Rejilla blueprint: retícula gruesa + fina.
          --grid-rgb es tematico (slate en oscuro, slate-strong en claro,
          porque el slate claro no se distingue de la crema). Los alfas se
          quedan literales para que en tactical salga el gris de siempre. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(to right, rgb(var(--grid-rgb) / 0.9) 1px, transparent 1px)",
            "linear-gradient(to bottom, rgb(var(--grid-rgb) / 0.9) 1px, transparent 1px)",
            "linear-gradient(to right, rgb(var(--grid-rgb) / 0.4) 1px, transparent 1px)",
            "linear-gradient(to bottom, rgb(var(--grid-rgb) / 0.4) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "64px 64px, 64px 64px, 16px 16px, 16px 16px",
        }}
      />

      {/* Luz de acento arriba + caida hacia el fondo abajo. La caida va al
          color BASE del tema: en tactical cae a negro como siempre, en
          desert aclara hacia la crema. Con el negro fijo, el pie del
          placeholder quedaba como una franja sucia sobre la crema. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(100% 70% at 50% 0%, rgb(${accent.rgb} / 0.14), transparent 65%), linear-gradient(to top, rgb(var(--base-rgb) / 0.92) 0%, rgb(var(--base-rgb) / 0.2) 50%, transparent 80%)`,
        }}
      />

      {/* Polvo/arena: la textura del design system, no una propia. Trae ya
          la dosis y el modo de fusion por tema (overlay en oscuro,
          multiply en claro) y se detiene sola con reduced-motion. */}
      <div className="dust-overlay absolute inset-0" />

      <CornerMarks color={accent.line} compact={isMicro} />

      {/* ── Contenido en flujo: barras y nucleo nunca se solapan ── */}
      <div className="absolute inset-0 z-10 flex flex-col">
        {/* Barra superior */}
        {isMicro ? (
          <div className="flex shrink-0 justify-end p-2">
            <span
              className="h-1.5 w-1.5 animate-pulse"
              style={{ backgroundColor: accent.line }}
            />
          </div>
        ) : (
          <div className="flex shrink-0 items-start justify-between gap-2 p-3">
            <span
              className="min-w-0 truncate text-[0.6875rem] uppercase tracking-[0.18em]"
              style={{ ...MONO, color: META_INK }}
            >
              {formatAssetCode(entry)}
            </span>
            <span
              className="flex shrink-0 items-center gap-1.5 px-2 py-1 text-[0.6875rem] uppercase tracking-[0.16em]"
              style={{
                ...MONO,
                color: accent.ink,
                border: `1px solid rgb(${accent.rgb} / 0.45)`,
                backgroundColor: `rgb(${accent.rgb} / 0.08)`,
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse"
                style={{ backgroundColor: accent.line }}
              />
              {isFull ? "Pendiente de archivo" : "Pendiente"}
            </span>
          </div>
        )}

        {/* Nucleo */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-hidden px-4 text-center">
          <span
            className="flex shrink-0 items-center justify-center"
            style={{
              width: isFull ? 48 : isMicro ? 28 : 38,
              height: isFull ? 48 : isMicro ? 28 : 38,
              border: `1px solid rgb(${accent.rgb} / 0.4)`,
              backgroundColor: `rgb(${accent.rgb} / 0.08)`,
              // El icono hereda por currentColor: no se le pasa `color`.
              // lucide lo emitiria como ATRIBUTO stroke, que es la via mas
              // debil del SVG y, si el var() no resolviera, dejaria el icono
              // en negro en vez de sin color. Como propiedad CSS entra ademas
              // en la misma cadena de herencia que el resto del HUD.
              color: accent.line,
              clipPath:
                "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))",
            }}
          >
            <Icon size={isFull ? 20 : isMicro ? 14 : 17} strokeWidth={1.5} />
          </span>

          {!isMicro && (
            <span
              className="shrink-0 truncate text-[0.6875rem] uppercase tracking-[0.28em]"
              style={{ ...MONO, color: accent.ink }}
            >
              {CATEGORY_LABELS[entry.category]}
              {stage ? ` · ${stage}` : ""}
            </span>
          )}

          {isFull && (
            <p
              className="line-clamp-3 max-w-[34ch] text-balance text-[0.8125rem] leading-snug tracking-[0.02em]"
              style={{ ...DISPLAY, color: "rgb(var(--text-rgb) / 0.88)" }}
            >
              {entry.alt}
            </p>
          )}

          {showCaption && isFull && (
            <p
              className="line-clamp-2 max-w-[40ch] text-[0.6875rem] leading-relaxed"
              style={{ color: META_INK }}
            >
              {entry.caption}
            </p>
          )}

          {density === "compact" && (
            <p
              className="line-clamp-2 max-w-[30ch] text-[0.75rem] leading-snug tracking-[0.02em]"
              style={{ ...DISPLAY, color: "rgb(var(--text-rgb) / 0.78)" }}
            >
              {entry.caption}
            </p>
          )}
        </div>

        {/* Barra inferior: telemetria */}
        {showBottomBar && (
          <div
            className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2 text-[0.6875rem] uppercase tracking-[0.14em]"
            style={{
              ...MONO,
              color: META_INK,
              borderColor: "rgb(var(--slate-rgb) / 0.9)",
              backgroundColor: "rgb(var(--base-rgb) / 0.55)",
            }}
          >
            {isFull && entry.rally?.location && (
              <span
                className="min-w-0 truncate"
                style={{ color: "rgb(var(--text-rgb) / 0.72)" }}
              >
                {entry.rally.location}
              </span>
            )}
            {coords && <span className="truncate">{coords}</span>}
            {isFull && terrain && (
              <span className="ml-auto shrink-0" style={{ color: accent.ink }}>
                {terrain}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Overlay de datos de rally sobre la foto real
   ──────────────────────────────────────────────────────────── */

function PhotoOverlay({
  entry,
  accent,
  mode,
  showCaption,
  density,
}: {
  entry: RallyImageEntry;
  accent: Tone;
  mode: RallyOverlayMode;
  showCaption: boolean;
  density: Density;
}) {
  const stage = formatStageLabel(entry);
  const coords = entry.rally?.coordinates
    ? formatCoordinates(entry.rally.coordinates)
    : null;
  const terrain = entry.rally?.terrain
    ? TERRAIN_LABELS[entry.rally.terrain]
    : null;

  const isFull = density === "full";
  const hasMeta = Boolean(
    entry.rally?.location || coords || terrain || stage || showCaption,
  );
  if (!hasMeta || density === "micro") return null;

  const visibility =
    mode === "always"
      ? "opacity-100"
      : "opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-20 flex flex-col justify-end ${visibility}`}
      // Scrim propio, oscuro, IGUAL en los dos temas: debajo hay una foto
      // de brillo desconocido y el tema no puede decidir por ella. Es el
      // suelo que garantiza la tinta clara de mas abajo.
      style={{
        backgroundImage: `linear-gradient(to top, rgba(${PHOTO_SCRIM},0.92) 0%, rgba(${PHOTO_SCRIM},0.5) 40%, rgba(${PHOTO_SCRIM},0) 75%)`,
      }}
    >
      <CornerMarks color={accent.line} compact={false} />

      {stage && (
        <span
          className="absolute left-3 top-3 px-2 py-1 text-[0.6875rem] uppercase tracking-[0.18em]"
          // Aqui SI se usa el acento pleno y no `ink`: el chip se apoya en
          // su propio fondo casi negro, no en el fondo de la pagina. Sube
          // de 0.6 a 0.72 porque el chip cae en la zona alta del overlay,
          // donde el degradado aun no ha oscurecido nada y una foto clara
          // detras se lo comia — en los dos temas.
          style={{
            ...MONO,
            color: accent.line,
            border: `1px solid rgb(${accent.rgb} / 0.45)`,
            backgroundColor: `rgba(${PHOTO_SCRIM},0.72)`,
          }}
        >
          {stage}
        </span>
      )}

      <div className="flex flex-col gap-1 p-3">
        {showCaption && (
          <p
            className="line-clamp-2 text-[0.8125rem] leading-tight tracking-[0.02em] text-white"
            style={DISPLAY}
          >
            {entry.caption}
          </p>
        )}
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] uppercase tracking-[0.14em]"
          style={{ ...MONO, color: PHOTO_META }}
        >
          {isFull && entry.rally?.location && (
            <span className="truncate" style={{ color: "rgba(255,255,255,0.75)" }}>
              {entry.rally.location}
            </span>
          )}
          {coords && <span className="truncate">{coords}</span>}
          {isFull && terrain && (
            <span style={{ color: accent.line }}>{terrain}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Marcas de esquina HUD
   ──────────────────────────────────────────────────────────── */

function CornerMarks({
  color,
  compact,
}: {
  color: string;
  compact: boolean;
}) {
  const size = compact ? 8 : 14;
  const inset = compact ? 5 : 8;
  const common: CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: color,
    opacity: 0.75,
  };

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20"
    >
      <span
        style={{
          ...common,
          left: inset,
          top: inset,
          borderLeft: "1px solid",
          borderTop: "1px solid",
        }}
      />
      <span
        style={{
          ...common,
          right: inset,
          top: inset,
          borderRight: "1px solid",
          borderTop: "1px solid",
        }}
      />
      <span
        style={{
          ...common,
          left: inset,
          bottom: inset,
          borderLeft: "1px solid",
          borderBottom: "1px solid",
        }}
      />
      <span
        style={{
          ...common,
          right: inset,
          bottom: inset,
          borderRight: "1px solid",
          borderBottom: "1px solid",
        }}
      />
    </span>
  );
}
