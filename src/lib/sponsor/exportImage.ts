"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — La lámina que se adjunta al correo
   --------------------------------------------------------------------------
   Convierte lo que el cliente ha rotulado en un PNG que se puede adjuntar,
   descargar o enseñar en una reunión.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  SE CONSTRUYE UN SVG NUEVO — NO SE FOTOGRAFÍA EL VISOR                ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   Serializar el `<svg>` vivo de `CarViewer` parece el atajo evidente y es una
   trampa doble:

   1. Todo el visor se pinta con `rgb(var(--tier-oro-rgb) / …)` y
      `stroke: currentColor`. Un SVG rasterizado dentro de un `<img>` es un
      DOCUMENTO APARTE: no hereda la cascada de la página, así que ni `var()`
      ni `currentColor` resuelven y la lámina saldría negra o vacía.
   2. Aunque resolviesen, el visor lleva encima estado de interfaz —zonas
      apagadas por el filtro, halo de la que tiene el ratón, trama de las
      vendidas, rejilla de fondo—. Eso es andamiaje para elegir, no lo que el
      patrocinador quiere ver en su bandeja de entrada.

   Así que se compone una lámina limpia con valores LITERALES: carrocería en
   trazo, las zonas contratadas con su rotulado, y un pie con las medidas
   reales de vinilo. Es el mismo dibujo que ve en la web —la colocación sale
   de `paint.ts`, compartido con el render de React— sin el mobiliario.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  LAS FUENTES VIAJAN DENTRO DEL SVG, EN BASE64                         ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   Un SVG cargado como `<img>` NO puede pedir recursos externos: ni una hoja
   de estilo, ni un .woff2. Si el rótulo dice Chakra Petch y la fuente no va
   incrustada, el PNG sale en Times New Roman. `collectFontFaces()` busca las
   reglas `@font-face` que next/font ya inyectó en la página, se descarga sus
   ficheros (mismo origen, así que ya están en caché) y las reescribe con la
   fuente en base64.

   Si algo de eso falla se exporta igual con la familia genérica: una lámina
   con la tipografía cambiada sirve; una excepción a mitad de un envío, no.
   ══════════════════════════════════════════════════════════════════════════ */

import { CAR_BOX, CAR_SVG_SRC, LINE_CLASS, loadLineArt } from "@/lib/car/lineArt";
import type { Bounds } from "@/lib/car/polygon";
import type { CarView } from "@/lib/types";

import {
  ARTWORK_FONTS,
  CAR_PAINT_HEX,
  type ArtworkFontId,
  type ZoneArtwork,
} from "./artwork";
import { imagePaint, textPaint, TEXT_ANCHOR, TEXT_BASELINE } from "./paint";

/* ─────────────────────────────────────────────────────────────────────────
   1. Escritura de SVG a mano
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Escapa texto que entra en el SVG.
 *
 * Es una precaución real, no ritual: aquí llega el nombre de marca que teclea
 * el cliente y el nombre de su fichero. Un `&` en «Martí & Fills» deja el
 * documento mal formado y el `<img>` se niega a cargarlo entero — la lámina
 * se quedaría en blanco sin decir por qué.
 */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Serializa un mapa de atributos, saltándose los vacíos. */
function attrs(map: Record<string, string | number | undefined>): string {
  return Object.entries(map)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}="${typeof value === "string" ? esc(value) : value}"`)
    .join(" ");
}

/* ─────────────────────────────────────────────────────────────────────────
   2. Tipografía incrustada
   ───────────────────────────────────────────────────────────────────────── */

/** Familia generada por next/font para cada id, leída del `:root` en vivo. */
function resolveFamilies(): Readonly<Record<ArtworkFontId, string>> {
  const styles = getComputedStyle(document.documentElement);
  const out = {} as Record<ArtworkFontId, string>;
  for (const font of ARTWORK_FONTS) {
    const value = styles.getPropertyValue(font.cssVar).trim();
    out[font.id] = value || font.fallback;
  }
  return out;
}

/** Primer nombre de una lista de familias, sin comillas. */
function firstFamily(stack: string): string {
  const first = stack.split(",")[0] ?? "";
  return first.trim().replace(/^["']|["']$/g, "");
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

/** Presupuesto de fuentes incrustadas. Por encima se deja de añadir. */
const FONT_BUDGET_BYTES = 600 * 1024;

const FONT_CSS_CACHE = new Map<string, string>();

/**
 * Reglas `@font-face` de las familias pedidas, con el fichero en base64.
 *
 * Recorre las hojas del documento. Las de otro origen lanzan `SecurityError`
 * al tocar `cssRules`; se saltan sin más — las nuestras las sirve Next desde
 * el mismo origen.
 */
async function collectFontFaces(families: readonly string[]): Promise<string> {
  const wanted = new Set(families.map((family) => family.toLowerCase()));
  if (wanted.size === 0) return "";

  const cacheKey = [...wanted].sort().join("|");
  const cached = FONT_CSS_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  const blocks: string[] = [];
  const seen = new Set<string>();
  let budget = FONT_BUDGET_BYTES;

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSFontFaceRule)) continue;

      const family = firstFamily(rule.style.getPropertyValue("font-family"));
      if (!wanted.has(family.toLowerCase())) continue;

      const src = rule.style.getPropertyValue("src");
      const url = /url\(["']?([^"')]+)["']?\)/.exec(src)?.[1];
      if (!url || seen.has(url)) continue;
      seen.add(url);
      if (budget <= 0) continue;

      const dataUrl = await fetchAsDataUrl(url);
      if (!dataUrl) continue;
      budget -= dataUrl.length;

      const weight = rule.style.getPropertyValue("font-weight") || "400";
      const style = rule.style.getPropertyValue("font-style") || "normal";
      blocks.push(
        `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};` +
          `font-display:block;src:url(${dataUrl}) format('woff2');}`,
      );
    }
  }

  const css = blocks.join("");
  FONT_CSS_CACHE.set(cacheKey, css);
  return css;
}

/* ─────────────────────────────────────────────────────────────────────────
   3. Paleta de la lámina — literales, nunca tokens
   ───────────────────────────────────────────────────────────────────────── */

const PLATE = {
  paper: "#FAF7F1",
  ink: "#1F1B16",
  line: "#3A342C",
  muted: "#8C8477",
  rule: "#D9D2C6",
  /** Contorno de una zona rotulada. */
  zone: "#B0762A",
} as const;

/* ─────────────────────────────────────────────────────────────────────────
   4. Composición
   ───────────────────────────────────────────────────────────────────────── */

/** Una zona contratada, tal y como la quiere dibujar la lámina. */
export interface PlateZone {
  readonly id: string;
  readonly label: string;
  /** Contorno del polígono en unidades de la lámina. */
  readonly d: string;
  /** Caja envolvente del contorno; las posiciones son fracciones de ella. */
  readonly box: Bounds;
  /** Medida del vinilo ya formateada: "92 × 24 cm". */
  readonly vinylLabel: string;
  readonly artwork: ZoneArtwork | undefined;
}

export interface PlateRequest {
  readonly view: CarView;
  /** Nombre de la vista ya traducido. */
  readonly viewLabel: string;
  readonly zones: readonly PlateZone[];
}

export interface PlateOptions {
  /** Marca del patrocinador, para la cabecera. */
  readonly brand: string;
  /** Rótulo del equipo. */
  readonly teamName: string;
  /** Ancho del PNG en píxeles. */
  readonly pixelWidth?: number;
}

const DEFAULT_PIXEL_WIDTH = 1600;

function artworkMarkup(
  zone: PlateZone,
  clipId: string,
  families: Readonly<Record<ArtworkFontId, string>>,
): string {
  const artwork = zone.artwork;
  if (!artwork || artwork.items.length === 0) return "";

  const nodes = artwork.items.map((item) => {
    if (item.kind === "image") {
      const paint = imagePaint(item, zone.box);
      return `<image ${attrs({
        href: paint.href,
        x: paint.x,
        y: paint.y,
        width: paint.width,
        height: paint.height,
        transform: paint.transform,
        preserveAspectRatio: "xMidYMid meet",
      })}/>`;
    }

    const paint = textPaint(item, zone.box, (id) => families[id]);
    return `<text ${attrs({
      x: paint.x,
      y: paint.y,
      transform: paint.transform,
      "text-anchor": TEXT_ANCHOR,
      "dominant-baseline": TEXT_BASELINE,
      "font-family": paint.fontFamily,
      "font-size": paint.fontSize,
      "font-weight": paint.fontWeight,
      "letter-spacing": paint.letterSpacing,
      fill: paint.fill,
    })}>${esc(paint.content)}</text>`;
  });

  /* La chapa se pinta SIEMPRE, no sólo si el cliente eligió fondo: el coche
     va de blanco, y sin este relleno el rotulado quedaría sobre el crema del
     papel de la lámina y los colores del logo se leerían distintos de como
     van a quedar en el coche. */
  const paint = `<path ${attrs({ d: zone.d, fill: CAR_PAINT_HEX })}/>`;

  return (
    `<clipPath id="${clipId}"><path ${attrs({ d: zone.d })}/></clipPath>` +
    `<g clip-path="url(#${clipId})">${paint}${nodes.join("")}</g>`
  );
}

/**
 * Construye el SVG completo de una lámina.
 *
 * Exportada para poder inspeccionarla sin rasterizar (y, si algún día hace
 * falta, adjuntar el propio SVG en vez del PNG).
 */
export async function buildPlateSvg(
  request: PlateRequest,
  options: PlateOptions,
): Promise<{ readonly svg: string; readonly width: number; readonly height: number }> {
  const car = CAR_BOX[request.view];
  const lineArt = await loadLineArt(CAR_SVG_SRC[request.view]).catch(() => "");

  /* Todo se dimensiona contra el lado mayor del coche, para que una lateral
     (1630 × 535) y una cenital (533 × 1169) salgan con el mismo peso visual
     de márgenes, trazo y letra. */
  const unit = Math.max(car.w, car.h);
  const margin = unit * 0.05;
  const header = unit * 0.1;
  const footerLine = unit * 0.042;
  const footer = footerLine * (request.zones.length + 1.2);

  const width = car.w + margin * 2;
  const height = header + car.h + footer + margin;

  const families = resolveFamilies();
  const headingFamily = families.heading;
  const fontCss = await collectFontFaces(
    Array.from(new Set(Object.values(families).map(firstFamily))),
  );

  const stroke = unit / 900;
  const titleSize = unit * 0.032;
  const metaSize = unit * 0.022;

  const zoneMarkup = request.zones
    .map((zone, index) => {
      const outline = `<path ${attrs({
        d: zone.d,
        fill: "none",
        stroke: PLATE.zone,
        "stroke-width": stroke * 1.4,
        "stroke-dasharray": `${stroke * 6} ${stroke * 4}`,
      })}/>`;
      return artworkMarkup(zone, `plate-clip-${index}`, families) + outline;
    })
    .join("");

  const legend = request.zones
    .map((zone, index) => {
      const y = header + car.h + footerLine * (index + 1);
      return (
        `<text ${attrs({
          x: margin,
          y,
          "font-family": headingFamily,
          "font-size": metaSize,
          fill: PLATE.ink,
        })}>${esc(zone.label)}</text>` +
        `<text ${attrs({
          x: width - margin,
          y,
          "text-anchor": "end",
          "font-family": headingFamily,
          "font-size": metaSize,
          fill: PLATE.muted,
        })}>${esc(zone.vinylLabel)}</text>`
      );
    })
    .join("");

  const brandLine = options.brand.trim();

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" ${attrs({
      viewBox: `0 0 ${Math.round(width)} ${Math.round(height)}`,
    })}>` +
    `<style>${fontCss}.${LINE_CLASS}{fill:none;stroke:${PLATE.line};` +
    `stroke-miterlimit:10;stroke-width:${stroke * 1.6};}</style>` +
    `<rect ${attrs({ x: 0, y: 0, width, height, fill: PLATE.paper })}/>` +
    /* Cabecera */
    `<text ${attrs({
      x: margin,
      y: header * 0.46,
      "font-family": headingFamily,
      "font-size": titleSize,
      "font-weight": 700,
      "letter-spacing": titleSize * 0.1,
      fill: PLATE.ink,
    })}>${esc(brandLine || options.teamName)}</text>` +
    `<text ${attrs({
      x: margin,
      y: header * 0.72,
      "font-family": headingFamily,
      "font-size": metaSize,
      "letter-spacing": metaSize * 0.14,
      fill: PLATE.muted,
    })}>${esc(`${options.teamName} · ${request.viewLabel}`)}</text>` +
    `<line ${attrs({
      x1: margin,
      y1: header * 0.86,
      x2: width - margin,
      y2: header * 0.86,
      stroke: PLATE.rule,
      "stroke-width": stroke,
    })}/>` +
    /* Coche + rotulado */
    `<g transform="translate(${margin} ${header})">${lineArt}${zoneMarkup}</g>` +
    /* Pie con las medidas reales */
    legend +
    `</svg>`;

  const pixelWidth = options.pixelWidth ?? DEFAULT_PIXEL_WIDTH;
  return {
    svg,
    width: pixelWidth,
    height: Math.round((pixelWidth * height) / width),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   5. Rasterizado
   ───────────────────────────────────────────────────────────────────────── */

export interface RenderedPlate {
  readonly view: CarView;
  readonly filename: string;
  readonly blob: Blob;
  /** Data URL del PNG, para previsualizarlo en el propio diálogo. */
  readonly dataUrl: string;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el blob"));
    reader.readAsDataURL(blob);
  });
}

/** Nombre de fichero sin acentos ni espacios, apto para un adjunto. */
function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function rasterize(svg: string, width: number, height: number): Promise<Blob> {
  /* Un Blob con object URL, no un data URL en base64: `btoa` revienta con
     cualquier carácter fuera de Latin-1 (una «ñ» del nombre de una zona basta)
     y la vuelta por `encodeURIComponent` duplica en memoria un documento que
     ya lleva las fuentes incrustadas. Además el object URL es del mismo
     origen, así que NO contamina el canvas y `toBlob()` puede leerlo. */
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const image = new Image();
    image.width = width;
    image.height = height;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("El SVG de la lámina no se pudo cargar"));
      image.src = url;
    });

    /* `decode()` espera además a que el documento SVG tenga sus fuentes
       listas. Sin esto Chrome pinta a veces el primer PNG con la familia de
       respaldo y los siguientes bien, que es el peor fallo posible: sólo
       aparece en el primer envío. No todos los navegadores lo implementan
       para SVG, así que un fallo aquí no aborta nada. */
    await image.decode().catch(() => undefined);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Sin contexto 2D");
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("El canvas no devolvió PNG");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Rasteriza una lámina por vista con zonas rotuladas. */
export async function renderPlates(
  requests: readonly PlateRequest[],
  options: PlateOptions,
): Promise<RenderedPlate[]> {
  const plates: RenderedPlate[] = [];
  const stamp = slug(options.brand) || "patrocinio";

  for (const request of requests) {
    const { svg, width, height } = await buildPlateSvg(request, options);
    const blob = await rasterize(svg, width, height);
    plates.push({
      view: request.view,
      filename: `boam-${stamp}-${slug(request.viewLabel)}.png`,
      blob,
      dataUrl: await blobToDataUrl(blob),
    });
  }

  return plates;
}

/** Descarga un PNG ya rasterizado. Es el plan B cuando no hay envío servidor. */
export function downloadPlate(plate: RenderedPlate): void {
  const url = URL.createObjectURL(plate.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = plate.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  /* El revoke no puede ser inmediato: Safari cancela la descarga si el object
     URL desaparece antes de que el navegador la haya enganchado. */
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Parte base64 de un data URL, que es lo que pide el API de correo. */
export function base64Of(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}
