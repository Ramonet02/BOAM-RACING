/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Caja envolvente de una zona, cacheada
   --------------------------------------------------------------------------
   El rotulado coloca sus elementos en fracciones del bbox de la zona, así que
   ese bbox se pide en CADA render de CADA elemento: mover un logo con el ratón
   lo consulta sesenta veces por segundo.

   Calcularlo cuesta `parsePath` + un recorrido de vértices. Es barato, pero no
   gratis, y la forma nunca cambia en caliente: `geometry.d` es una constante
   de módulo generada en `src/lib/car/**`. Por eso se cachea por el propio
   texto del path, que es a la vez la clave y la identidad de la forma — si
   alguien retoca un polígono, el `d` cambia y la entrada vieja deja de usarse
   sola, sin invalidación manual.
   ══════════════════════════════════════════════════════════════════════════ */

import { bounds, containsPoint, parsePath, type Bounds } from "@/lib/car/polygon";

const CACHE = new Map<string, Bounds>();
const ORIGIN_CACHE = new Map<string, { readonly x: number; readonly y: number }>();

/** Bbox del polígono de una zona, en unidades de dibujo de su lámina. */
export function zoneBox(d: string): Bounds {
  const hit = CACHE.get(d);
  if (hit) return hit;
  const box = bounds(parsePath(d));
  CACHE.set(d, box);
  return box;
}

/* ─────────────────────────────────────────────────────────────────────────
   Punto de nacimiento de un elemento nuevo
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Dónde aparece un logo o un texto recién añadido, en fracciones del bbox.
 *
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  EL CENTRO DEL BBOX NO SIRVE: EN SEIS ZONAS CAE FUERA DE LA CHAPA     ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 * Medido sobre la geometría real: en `zone-front-wing`, `zone-hood-side` y
 * `zone-roof-side` —los tres flancos que siguen el perfil del coche y son
 * cuñas muy inclinadas— el centro de la caja envolvente queda fuera del
 * polígono. Un elemento que naciera ahí lo borraría entero el `clipPath` y el
 * cliente pulsaría «subir logo» para no ver absolutamente nada.
 *
 * Se prueba, en este orden:
 *   1. el `anchor` de la zona, que ya está pensado para caer sobre la chapa
 *      (y que en nueve zonas Ramón recolocó a mano);
 *   2. el centro del bbox, que vale para la gran mayoría;
 *   3. una rejilla sobre el bbox, quedándose con el punto interior más
 *      cercano al ancla. Es el respaldo que garantiza que SIEMPRE hay
 *      respuesta, por rara que sea la forma.
 */
export function zoneOrigin(
  d: string,
  anchor: { readonly x: number; readonly y: number },
): { readonly x: number; readonly y: number } {
  const key = `${d}|${anchor.x},${anchor.y}`;
  const hit = ORIGIN_CACHE.get(key);
  if (hit) return hit;

  const box = zoneBox(d);
  const points = parsePath(d);

  const normalize = (x: number, y: number) => ({
    x: box.width > 0 ? (x - box.minX) / box.width : 0.5,
    y: box.height > 0 ? (y - box.minY) / box.height : 0.5,
  });

  let result = normalize(anchor.x, anchor.y);

  if (!containsPoint(points, anchor.x, anchor.y)) {
    const cx = box.minX + box.width / 2;
    const cy = box.minY + box.height / 2;

    if (containsPoint(points, cx, cy)) {
      result = normalize(cx, cy);
    } else {
      const STEPS = 15;
      let best: { x: number; y: number; distance: number } | null = null;
      for (let i = 1; i < STEPS; i += 1) {
        for (let j = 1; j < STEPS; j += 1) {
          const x = box.minX + (box.width * i) / STEPS;
          const y = box.minY + (box.height * j) / STEPS;
          if (!containsPoint(points, x, y)) continue;
          const distance = Math.hypot(x - anchor.x, y - anchor.y);
          if (!best || distance < best.distance) best = { x, y, distance };
        }
      }
      // Sin ningún punto interior el polígono está degenerado; el centro es
      // entonces tan buena respuesta como cualquier otra.
      result = best ? normalize(best.x, best.y) : normalize(cx, cy);
    }
  }

  ORIGIN_CACHE.set(key, result);
  return result;
}
