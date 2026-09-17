/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Carga del line-art del coche
   --------------------------------------------------------------------------
   Descarga, sanea y cachea las cinco láminas de `public/car/*.svg`, y publica
   el mapeo vista → fichero → caja de dibujo.

   POR QUÉ EL SVG SE INYECTA EN LÍNEA Y NO CON <img>
   Con `<img src="/car/front.svg">` el navegador aísla el documento y
   `currentColor` se resuelve DENTRO del SVG, así que no hay forma de
   retematizar el trazo desde la página. Por eso se hace fetch del fichero, se
   sanea y se inyecta como markup dentro de nuestro propio `<svg>`: así el
   trazo hereda `color` y el grosor sale de la custom property `--car-stroke`.

   DOS TRAMPAS AL CONSUMIR ESTO
   1. El saneado descarta la etiqueta `<svg>` de apertura, así que el `viewBox`
      declarado en el fichero SE PIERDE. El contenedor tiene que aportarlo desde
      `CAR_BOX`; si no coincide, el coche sale descolocado.
   2. Cada fichero lleva dentro un `<g transform="translate(…)">` que reposiciona
      la geometría original a 0,0. Ese grupo sobrevive al saneado y es
      imprescindible: no lo toques.

   La regla `.boam-carline` que inyecta `LINE_STYLE` es GLOBAL al documento (un
   `<style>` dentro de un SVG inline no está encapsulado). Si hay dos visores
   montados a la vez comparten regla; el grosor se controla por instancia con
   `--car-stroke` en el `style` del `<svg>` padre, nunca tocando la clase.
   ══════════════════════════════════════════════════════════════════════════ */

import { LATERAL_SVG, LATERAL_VIEWBOX } from "./lateral";
import { FRONT_VIEWBOX, REAR_VIEWBOX } from "./frontRear";
import { TOP_VIEW_HEIGHT, TOP_VIEW_WIDTH } from "./top";
import type { CarView } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
   1. Mapeo vista → caja de dibujo y fichero
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Dimensiones del `viewBox` de cada lámina, en unidades de dibujo.
 * Coinciden exactamente con el `viewBox` declarado dentro de cada fichero.
 */
export const CAR_BOX: Readonly<
  Record<CarView, { readonly w: number; readonly h: number }>
> = {
  "lateral-izq": { w: LATERAL_VIEWBOX.width, h: LATERAL_VIEWBOX.height },
  "lateral-der": { w: LATERAL_VIEWBOX.width, h: LATERAL_VIEWBOX.height },
  frontal: { w: FRONT_VIEWBOX.width, h: FRONT_VIEWBOX.height },
  trasera: { w: REAR_VIEWBOX.width, h: REAR_VIEWBOX.height },
  cenital: { w: TOP_VIEW_WIDTH, h: TOP_VIEW_HEIGHT },
};

/** Fichero de `public/` que dibuja cada vista. */
export const CAR_SVG_SRC: Readonly<Record<CarView, string>> = {
  "lateral-izq": LATERAL_SVG["lateral-izq"],
  "lateral-der": LATERAL_SVG["lateral-der"],
  frontal: "/car/front.svg",
  trasera: "/car/rear.svg",
  cenital: "/car/top.svg",
};

/* ─────────────────────────────────────────────────────────────────────────
   2. Saneado
   ───────────────────────────────────────────────────────────────────────── */

/** Clase única con la que se retematiza el trazo del coche. */
export const LINE_CLASS = "boam-carline";

/** Bloque `<style>` que acompaña al markup inyectado. */
export const LINE_STYLE = `<style>.${LINE_CLASS}{fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:var(--car-stroke,1.75px);vector-effect:non-scaling-stroke;}</style>`;

/**
 * Deja sólo el contenido dibujable del SVG.
 *
 * Los ficheros de `public/car/` son nuestros, pero el markup se inyecta con
 * `dangerouslySetInnerHTML`, así que se sanea igualmente: fuera declaración XML,
 * comentarios, `<script>`, `<foreignObject>`, manejadores `on*=` y `href`
 * con esquema `javascript:`.
 *
 * El `<style>` original se sustituye por el nuestro y las clases `cls-1`/`cls-2`
 * se renombran a una clase propia: las reglas CSS dentro de un SVG inline son
 * globales al documento, y `cls-1` es un nombre demasiado probable para dejarlo
 * suelto.
 */
export function sanitizeLineArt(raw: string): string {
  const open = raw.indexOf("<svg");
  const openEnd = open >= 0 ? raw.indexOf(">", open) : -1;
  const close = raw.lastIndexOf("</svg>");
  const inner = openEnd >= 0 && close > openEnd ? raw.slice(openEnd + 1, close) : raw;

  return inner
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s(?:xlink:)?href\s*=\s*"\s*javascript:[^"]*"/gi, "")
    .replace(/class\s*=\s*"cls-\d+"/g, `class="${LINE_CLASS}"`)
    .trim();
}

/* ─────────────────────────────────────────────────────────────────────────
   3. Carga con caché
   ───────────────────────────────────────────────────────────────────────── */

const LINE_ART_CACHE = new Map<string, string>();
const LINE_ART_INFLIGHT = new Map<string, Promise<string>>();

/**
 * Lectura SÍNCRONA de la caché, sin disparar descarga.
 *
 * Sirve para que quien cambia de vista pinte en el mismo render si la lámina
 * ya estaba descargada: pasar por la promesa de `loadLineArt` costaría un
 * frame en blanco aunque el dato ya estuviese en memoria.
 */
export function peekLineArt(src: string): string | undefined {
  return LINE_ART_CACHE.get(src);
}

/**
 * Descarga (una sola vez por fichero) y cachea el line-art ya saneado.
 * La caché es de módulo, así que dos páginas distintas que monten un visor
 * reutilizan las láminas ya descargadas.
 */
export function loadLineArt(src: string): Promise<string> {
  const cached = LINE_ART_CACHE.get(src);
  if (cached !== undefined) return Promise.resolve(cached);

  const inflight = LINE_ART_INFLIGHT.get(src);
  if (inflight) return inflight;

  const request = fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error(`${src} → HTTP ${response.status}`);
      return response.text();
    })
    .then((text) => {
      const markup = sanitizeLineArt(text);
      LINE_ART_CACHE.set(src, markup);
      LINE_ART_INFLIGHT.delete(src);
      return markup;
    })
    .catch((error: unknown) => {
      LINE_ART_INFLIGHT.delete(src);
      throw error;
    });

  LINE_ART_INFLIGHT.set(src, request);
  return request;
}
