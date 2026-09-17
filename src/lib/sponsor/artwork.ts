/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Modelo del rotulado que el cliente compone sobre una zona
   --------------------------------------------------------------------------
   Lo que un patrocinador coloca dentro de una zona: su logo y sus textos. El
   módulo es PURO — ni React, ni DOM, ni acceso a la geometría del coche.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  COORDENADAS NORMALIZADAS AL BBOX DE LA ZONA — NO A LA LÁMINA         ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   Cada elemento guarda su centro como `x`,`y` en 0..1 dentro de la caja
   envolvente del polígono, y su tamaño como fracción de esa caja. Nunca en
   unidades de dibujo.

   Importa por dos razones:
   1. Las cinco láminas tienen escalas distintas (la cenital mide 533 × 1169;
      una lateral 1630 × 535). Con fracciones, "el logo al 60 % de ancho" se
      lee igual en las cinco.
   2. Si mañana se retoca un polígono en `src/lib/car/**` —y ya ha pasado— el
      rotulado sigue encajado en su zona en vez de quedarse flotando donde
      estaba el contorno viejo.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  LOS COLORES DE AQUÍ SON HEX DE VERDAD, NO TOKENS DEL TEMA            ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   Todo lo demás del visor se pinta con rgb(var(--…)) para recomponerse entre
   el tema desierto y el táctico. Esto NO. Esto es vinilo que se imprime: un
   rojo que cambiara de tono al pulsar el interruptor del tema sería mentirle
   al patrocinador sobre lo que va pegado a la chapa. Además el PNG que se
   adjunta al correo se rasteriza FUERA de la cascada CSS del documento,
   donde var() no existe y sólo sobrevive un valor literal.
   ══════════════════════════════════════════════════════════════════════════ */

import type { Bounds } from "@/lib/car/polygon";

/* ─────────────────────────────────────────────────────────────────────────
   1. Catálogos cerrados — fuentes y colores
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Las familias que puede elegir el cliente.
 *
 * Son las TRES que la web ya carga con `next/font` (layout.tsx), no una lista
 * nueva. Dos motivos: se ven idénticas en pantalla y en el PNG sin descargar
 * nada más, y el exportador sabe encontrar su `@font-face` para incrustarlo
 * (`collectFontFaces` en `exportImage.ts`). Añadir aquí una familia que el
 * documento no cargue saldría bien en el editor y mal en el correo.
 */
export const ARTWORK_FONTS = [
  { id: "heading", cssVar: "--font-heading", fallback: "sans-serif" },
  { id: "body", cssVar: "--font-body", fallback: "sans-serif" },
  { id: "mono", cssVar: "--font-mono", fallback: "monospace" },
] as const;

export type ArtworkFontId = (typeof ARTWORK_FONTS)[number]["id"];

export const ARTWORK_FONTS_BY_ID: Readonly<
  Record<ArtworkFontId, (typeof ARTWORK_FONTS)[number]>
> = Object.fromEntries(ARTWORK_FONTS.map((font) => [font.id, font])) as Readonly<
  Record<ArtworkFontId, (typeof ARTWORK_FONTS)[number]>
>;

/** Familia CSS para pantalla, donde la cascada sí resuelve `var()`. */
export function fontStack(id: ArtworkFontId): string {
  const font = ARTWORK_FONTS_BY_ID[id];
  return `var(${font.cssVar}), ${font.fallback}`;
}

export const ARTWORK_WEIGHTS = [400, 700] as const;
export type ArtworkWeight = (typeof ARTWORK_WEIGHTS)[number];

/**
 * Paleta de vinilo: colores planos de corte, no degradados de pantalla.
 * `label` no vive aquí porque es copy y se traduce (`t.sponsors.studio.colors`).
 */
export const VINYL_COLORS = [
  { id: "white", hex: "#FFFFFF" },
  { id: "black", hex: "#141414" },
  { id: "amber", hex: "#E3A23C" },
  { id: "red", hex: "#C5342B" },
  { id: "blue", hex: "#1E5AA8" },
  { id: "green", hex: "#2F7D46" },
  { id: "silver", hex: "#C9CCD1" },
] as const;

export type VinylColorId = (typeof VINYL_COLORS)[number]["id"];

const VINYL_HEX: Readonly<Record<VinylColorId, string>> = Object.fromEntries(
  VINYL_COLORS.map((color) => [color.id, color.hex]),
) as Readonly<Record<VinylColorId, string>>;

export function vinylHex(id: VinylColorId): string {
  return VINYL_HEX[id];
}

/* ─────────────────────────────────────────────────────────────────────────
   2. Elementos
   ───────────────────────────────────────────────────────────────────────── */

interface ArtworkItemBase {
  readonly id: string;
  /** Centro del elemento, 0..1 sobre el bbox de la zona. */
  readonly x: number;
  readonly y: number;
  /** Giro en grados alrededor de su propio centro. */
  readonly rotation: number;
}

export interface ArtworkTextItem extends ArtworkItemBase {
  readonly kind: "text";
  readonly text: string;
  readonly font: ArtworkFontId;
  readonly weight: ArtworkWeight;
  readonly color: VinylColorId;
  /** Cuerpo del texto como fracción de la ALTURA de la zona. */
  readonly sizePct: number;
  /** Interletraje como fracción del cuerpo. */
  readonly tracking: number;
  readonly uppercase: boolean;
}

export interface ArtworkImageItem extends ArtworkItemBase {
  readonly kind: "image";
  /** PNG en data URL. No sale del navegador salvo al enviar la solicitud. */
  readonly src: string;
  /** Nombre del fichero original, para poder nombrarlo en la solicitud. */
  readonly name: string;
  readonly naturalWidth: number;
  readonly naturalHeight: number;
  /** Ancho del elemento como fracción del ANCHO de la zona. */
  readonly widthPct: number;
}

export type ArtworkItem = ArtworkTextItem | ArtworkImageItem;

/**
 * Rotulado completo de UNA zona.
 *
 * NO hay color de fondo. El coche lo pinta el equipo, y va de blanco: dejar
 * elegir el fondo ofrecía al patrocinador una decisión que no es suya y que
 * además saldría falsa en la lámina del correo. La chapa es `CAR_PAINT_HEX`
 * en todas partes, y el rotulado se compone encima.
 */
export interface ZoneArtwork {
  readonly items: readonly ArtworkItem[];
}

/**
 * Color de la carrocería. Literal, no token: es pintura real, no interfaz.
 *
 * Lo usan el lienzo del estudio y la lámina exportada, para que el cliente vea
 * su logo sobre el blanco de verdad — y para que un logo blanco se le
 * desaparezca delante, que es exactamente lo que va a pasar en el coche.
 */
export const CAR_PAINT_HEX = "#FFFFFF";

/** Rotulados de toda la configuración, indexados por `slot.id`. */
export type ArtworkDesign = Readonly<Record<string, ZoneArtwork>>;

export const EMPTY_ARTWORK: ZoneArtwork = { items: [] };

/** `true` si la zona todavía no tiene nada que enseñar. */
export function isArtworkEmpty(artwork: ZoneArtwork | undefined): boolean {
  if (!artwork) return true;
  return artwork.items.length === 0;
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Límites de tamaño. Por debajo del mínimo el elemento deja de ser agarrable. */
export const MIN_IMAGE_WIDTH_PCT = 0.06;
export const MAX_IMAGE_WIDTH_PCT = 1.6;
export const MIN_TEXT_SIZE_PCT = 0.06;
export const MAX_TEXT_SIZE_PCT = 1.4;

/* ─────────────────────────────────────────────────────────────────────────
   3. Altas
   ───────────────────────────────────────────────────────────────────────── */

let sequence = 0;

/**
 * Id de elemento.
 *
 * Un contador de módulo, no `crypto.randomUUID()` ni `Math.random()`: el
 * rotulado se serializa a `localStorage` y se compara entre renders, y esto da
 * ids cortos y estables. La unicidad sólo tiene que valer dentro de un mismo
 * diseño, que nunca se mezcla con el de otro navegador.
 */
function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence.toString(36)}`;
}

/**
 * Dónde nace un elemento nuevo, en fracciones del bbox.
 *
 * El centro de la caja (0.5, 0.5) parece la respuesta obvia y es un error
 * medido: en seis de las 28 zonas —las cuñas que siguen el perfil del coche—
 * ese punto cae FUERA del polígono, y el recorte se comería el elemento nada
 * más añadirlo. Quien llama pasa un origen seguro, que calcula `zoneOrigin()`
 * a partir del ancla de la zona. El respaldo al centro sólo cubre las pruebas
 * y cualquier llamada sin geometría a mano.
 */
export interface Origin {
  readonly x: number;
  readonly y: number;
}

const CENTER: Origin = { x: 0.5, y: 0.5 };

/** Fracción del bbox que ocupa un elemento recién añadido. */
const FIT = 0.78;

const DEFAULT_TRACKING = 0.04;
const DEFAULT_TEXT_SIZE_PCT = 0.34;
const DEFAULT_IMAGE_WIDTH_PCT = 0.5;

/**
 * Ancho inicial de un logo, ajustado para que quepa TAMBIÉN de alto.
 *
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  «LA MITAD DEL ANCHO» ES INSERVIBLE EN LAS ZONAS ALARGADAS            ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 * Un taloneras mide 169 × 9 cm de chapa real. Un logo cuadrado al 50 % de su
 * ANCHO nace midiendo 85 × 85 cm: diez veces más alto que la zona, así que el
 * recorte deja ver una franja del centro y el cliente cree que ha subido la
 * imagen mal. Pasa igual en el techo lateral (95 × 5 cm) y en el alerón.
 *
 * Se limita por las dos dimensiones y el mínimo manda, que es lo que hace
 * cualquier «ajustar a la caja».
 */
export function fitImageWidthPct(
  naturalWidth: number,
  naturalHeight: number,
  box: Bounds,
): number {
  if (box.width <= 0 || box.height <= 0) return DEFAULT_IMAGE_WIDTH_PCT;
  const ratio = naturalWidth > 0 && naturalHeight > 0 ? naturalHeight / naturalWidth : 1;
  // altoDelItem = widthPct · box.width · ratio  ≤  FIT · box.height
  const byHeight = (FIT * box.height) / (box.width * ratio);
  return clamp(
    Math.min(DEFAULT_IMAGE_WIDTH_PCT, byHeight),
    MIN_IMAGE_WIDTH_PCT,
    MAX_IMAGE_WIDTH_PCT,
  );
}

/**
 * Cuerpo inicial de un texto, ajustado para que su ANCHO estimado quepa.
 *
 * Mismo problema por el otro lado: «TU MARCA» al 34 % de una zona de 59 cm de
 * ancho sale midiendo 72 cm y nace ya cortado por los dos extremos. Usa la
 * misma estimación de anchura que `itemBox()`, así que las dos cuentas no
 * pueden separarse.
 */
export function fitTextSizePct(text: string, box: Bounds): number {
  if (box.width <= 0 || box.height <= 0) return DEFAULT_TEXT_SIZE_PCT;
  const chars = Math.max(text.length, 1);
  const byWidth =
    (FIT * box.width) / (box.height * chars * (0.58 + DEFAULT_TRACKING));
  return clamp(
    Math.min(DEFAULT_TEXT_SIZE_PCT, byWidth),
    MIN_TEXT_SIZE_PCT,
    MAX_TEXT_SIZE_PCT,
  );
}

export function createTextItem(
  text: string,
  origin: Origin = CENTER,
  box?: Bounds,
): ArtworkTextItem {
  return {
    kind: "text",
    id: nextId("t"),
    text,
    font: "heading",
    weight: 700,
    // Negro, no blanco: sobre la carrocería blanca un rótulo blanco nace
    // invisible y parece que el botón no ha hecho nada.
    color: "black",
    sizePct: box ? fitTextSizePct(text, box) : DEFAULT_TEXT_SIZE_PCT,
    tracking: DEFAULT_TRACKING,
    uppercase: true,
    x: origin.x,
    y: origin.y,
    rotation: 0,
  };
}

export function createImageItem(
  src: string,
  name: string,
  naturalWidth: number,
  naturalHeight: number,
  origin: Origin = CENTER,
  box?: Bounds,
): ArtworkImageItem {
  return {
    kind: "image",
    id: nextId("i"),
    src,
    name,
    naturalWidth,
    naturalHeight,
    widthPct: box
      ? fitImageWidthPct(naturalWidth, naturalHeight, box)
      : DEFAULT_IMAGE_WIDTH_PCT,
    x: origin.x,
    y: origin.y,
    rotation: 0,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   4. Geometría de un elemento dentro de su zona
   ───────────────────────────────────────────────────────────────────────── */

export interface ItemBox {
  /** Centro en unidades de dibujo de la lámina. */
  readonly cx: number;
  readonly cy: number;
  readonly width: number;
  readonly height: number;
}

/** Proporción alto/ancho de una imagen, con guarda para naturales corruptos. */
function aspectOf(item: ArtworkImageItem): number {
  if (item.naturalWidth <= 0 || item.naturalHeight <= 0) return 1;
  return item.naturalHeight / item.naturalWidth;
}

/**
 * Caja de un elemento en unidades de dibujo.
 *
 * Para el texto el ancho es una ESTIMACIÓN: no se mide el glifo. Sirve para el
 * recuadro de selección y para la medida en centímetros, no para dibujar — el
 * `<text>` se pinta centrado y se ajusta solo.
 */
export function itemBox(item: ArtworkItem, box: Bounds): ItemBox {
  const cx = box.minX + item.x * box.width;
  const cy = box.minY + item.y * box.height;

  if (item.kind === "image") {
    const width = item.widthPct * box.width;
    return { cx, cy, width, height: width * aspectOf(item) };
  }

  const height = item.sizePct * box.height;
  const chars = Math.max(item.text.length, 1);
  // 0.58 em por carácter es la anchura media de una mayúscula de palo seco;
  // más el interletraje, que en un rótulo amplio pesa de verdad.
  const width = height * chars * (0.58 + item.tracking);
  return { cx, cy, width, height };
}

/** Medida real del elemento en centímetros de vinilo. */
export function itemVinylCm(
  item: ArtworkItem,
  box: Bounds,
  cmPerUnit: number,
): { readonly w: number; readonly h: number } {
  const { width, height } = itemBox(item, box);
  return {
    w: Math.round(width * cmPerUnit * 10) / 10,
    h: Math.round(height * cmPerUnit * 10) / 10,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   5. Mutaciones puras
   ───────────────────────────────────────────────────────────────────────── */

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * Recoloca un elemento.
 *
 * El centro se limita a 0..1, así que un elemento nunca se pierde fuera del
 * bbox de su zona: puede asomar por el borde —y el recorte del polígono lo
 * cortará— pero su punto de agarre sigue dentro y se puede recuperar.
 */
export function moveItem<T extends ArtworkItem>(item: T, x: number, y: number): T {
  return { ...item, x: clamp01(x), y: clamp01(y) };
}

/** Escala un elemento por un factor, respetando su límite de tamaño. */
export function scaleItem<T extends ArtworkItem>(item: T, factor: number): T {
  if (item.kind === "image") {
    return {
      ...item,
      widthPct: clamp(item.widthPct * factor, MIN_IMAGE_WIDTH_PCT, MAX_IMAGE_WIDTH_PCT),
    };
  }
  return {
    ...item,
    sizePct: clamp(item.sizePct * factor, MIN_TEXT_SIZE_PCT, MAX_TEXT_SIZE_PCT),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   6. Persistencia
   ───────────────────────────────────────────────────────────────────────── */

export const ARTWORK_STORAGE_KEY = "boam-sponsor-artwork";

/**
 * Guarda el diseño en `localStorage`. Devuelve `false` si no cupo.
 *
 * Un logo de 900 px en data URL ronda el medio mega y la cuota del origen son
 * ~5 MB: con cinco o seis zonas rotuladas se llena de verdad. El editor NO
 * trata ese fallo como un error — el diseño sigue entero en memoria durante la
 * sesión, que es lo que necesita el formulario; lo único que se pierde es
 * sobrevivir a un F5.
 */
export function saveArtwork(design: ArtworkDesign): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(ARTWORK_STORAGE_KEY, JSON.stringify(design));
    return true;
  } catch {
    return false;
  }
}

/**
 * Rescata el diseño guardado.
 *
 * Se NORMALIZA lo que sale de `localStorage` en vez de confiar en su forma.
 * Ahí dentro puede haber un diseño escrito por una versión anterior de la web
 * —los primeros llevaban un `background` que ya no existe, porque el coche lo
 * pintamos nosotros de blanco— o simplemente basura de alguien trasteando con
 * la consola. Quedarse sólo con `items` deja el dato en la forma de hoy y de
 * paso tira la clave muerta, que si no se arrastraría para siempre en cada
 * guardado posterior.
 */
export function loadArtwork(): ArtworkDesign | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ARTWORK_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const design: Record<string, ZoneArtwork> = {};
    for (const [slotId, entry] of Object.entries(parsed as Record<string, unknown>)) {
      if (!entry || typeof entry !== "object") continue;
      const items = (entry as { items?: unknown }).items;
      if (!Array.isArray(items) || items.length === 0) continue;
      design[slotId] = { items: items as ArtworkItem[] };
    }
    return design;
  } catch {
    return null;
  }
}

export function clearStoredArtwork(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ARTWORK_STORAGE_KEY);
  } catch {
    /* Sin cuota o sin permisos: el diseño vive en memoria igual. */
  }
}
