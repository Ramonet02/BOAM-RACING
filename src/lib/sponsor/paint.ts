/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Cómo se pinta un elemento del rotulado
   --------------------------------------------------------------------------
   El rotulado se dibuja DOS veces por caminos distintos:

     · en React, dentro del visor y del estudio, con nodos vivos que además
       llevan asas de arrastre y marcas de selección;
     · como cadena de texto, dentro del SVG que se rasteriza para adjuntarlo
       al correo (`exportImage.ts`), donde no hay React ni cascada CSS.

   Si cada camino calculase su propia posición y su propio cuerpo de letra,
   el patrocinador vería una cosa en la web y recibiría otra en el PDF. Este
   módulo es el único que decide: devuelve los atributos ya resueltos y cada
   camino se limita a escribirlos, React como props y el exportador como
   `atributo="valor"`.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  LA FAMILIA TIPOGRÁFICA LLEGA DESDE FUERA, NO SE LEE AQUÍ             ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   En pantalla vale `var(--font-heading)`, que la cascada resuelve. Dentro del
   SVG exportado NO existe esa variable y hay que escribir la familia literal.
   Es la única diferencia real entre los dos caminos, así que entra como
   parámetro (`resolveFont`) en vez de bifurcar el módulo.
   ══════════════════════════════════════════════════════════════════════════ */

import type { Bounds } from "@/lib/car/polygon";

import {
  itemBox,
  vinylHex,
  type ArtworkImageItem,
  type ArtworkTextItem,
  type ArtworkFontId,
} from "./artwork";

/** Traduce el id de fuente a la familia CSS que toque en cada camino. */
export type FontResolver = (id: ArtworkFontId) => string;

/** Redondeo a dos decimales: más precisión sólo engorda el SVG exportado. */
function r(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Giro alrededor del centro del propio elemento.
 * `undefined` cuando no hay giro, para no ensuciar el marcado con `rotate(0)`.
 */
function rotation(deg: number, cx: number, cy: number): string | undefined {
  if (!deg) return undefined;
  return `rotate(${r(deg)} ${r(cx)} ${r(cy)})`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Texto
   ───────────────────────────────────────────────────────────────────────── */

export interface TextPaint {
  readonly content: string;
  readonly x: number;
  readonly y: number;
  readonly transform?: string;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight: number;
  readonly letterSpacing: number;
  readonly fill: string;
}

export function textPaint(
  item: ArtworkTextItem,
  box: Bounds,
  resolveFont: FontResolver,
): TextPaint {
  const { cx, cy, height } = itemBox(item, box);
  return {
    content: item.uppercase ? item.text.toUpperCase() : item.text,
    x: r(cx),
    y: r(cy),
    transform: rotation(item.rotation, cx, cy),
    fontFamily: resolveFont(item.font),
    fontSize: r(height),
    fontWeight: item.weight,
    letterSpacing: r(height * item.tracking),
    fill: vinylHex(item.color),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Imagen
   ───────────────────────────────────────────────────────────────────────── */

export interface ImagePaint {
  readonly href: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly transform?: string;
}

export function imagePaint(item: ArtworkImageItem, box: Bounds): ImagePaint {
  const { cx, cy, width, height } = itemBox(item, box);
  return {
    href: item.src,
    x: r(cx - width / 2),
    y: r(cy - height / 2),
    width: r(width),
    height: r(height),
    transform: rotation(item.rotation, cx, cy),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Atributos comunes del <text>
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Anclaje del texto. Va aparte porque es idéntico en los dos caminos pero se
 * escribe distinto: React quiere `textAnchor`, el SVG serializado
 * `text-anchor`. Tenerlo en un sitio evita que uno de los dos se quede sin
 * centrar y el rótulo salga desplazado justo en el correo.
 */
export const TEXT_ANCHOR = "middle";
export const TEXT_BASELINE = "central";
