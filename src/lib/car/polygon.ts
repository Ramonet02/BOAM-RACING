/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Geometría de polígonos de zona
   --------------------------------------------------------------------------
   Utilidades puras compartidas por el editor visual de zonas y por los módulos
   de geometría (`lateral.ts`, `frontRear.ts`, `top.ts`).

   Un polígono es siempre un array de vértices en unidades del viewBox de SU
   vista. Todo lo demás —el path `d`, el ancla del tooltip, la medida del
   vinilo, el área— se DERIVA de él. Nunca se escribe a mano: ésa era justo la
   causa de que las zonas no cuadrasen con la chapa.
   ══════════════════════════════════════════════════════════════════════════ */

import type { VinylDimensions } from "../types";

/** Un vértice, en unidades de viewBox. */
export type Vertex = readonly [number, number];

/** Caja envolvente de un polígono, en unidades de viewBox. */
export interface Bounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

/** Redondeo a un decimal, que es la precisión con la que se guardan los paths. */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/* ─────────────────────────────────────────────────────────────────────────
   Conversión path ⇄ puntos
   ───────────────────────────────────────────────────────────────────────── */

/** Convierte el polígono en el atributo `d` de un path cerrado y relleno. */
export function toPathData(points: readonly Vertex[]): string {
  return `M${points.map(([x, y]) => `${round1(x)},${round1(y)}`).join("L")}Z`;
}

/**
 * Lee un path de polígono (`M…L…Z`) y devuelve sus vértices.
 *
 * Acepta los tres estilos que conviven hoy en `src/lib/car/`: separador coma o
 * espacio, con o sin espacio tras el comando. NO entiende curvas: si el path
 * trae C/Q/A devuelve los puntos de control como si fueran vértices, que para
 * nuestros polígonos rectos no ocurre nunca.
 */
export function parsePath(d: string): Vertex[] {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers) return [];

  const points: Vertex[] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    points.push([Number(numbers[i]), Number(numbers[i + 1])]);
  }

  // Un path cerrado con Z a veces repite el primer punto al final: sobra.
  if (points.length > 1) {
    const first = points[0];
    const last = points[points.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) points.pop();
  }
  return points;
}

/* ─────────────────────────────────────────────────────────────────────────
   Achaflanado
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Recorta cada esquina a 45°, sustituyendo el vértice por dos puntos a `cut`
 * unidades de él. Es lo que le da a las zonas el canto del design system.
 *
 * `cut = 0` devuelve el polígono intacto, que es lo que usa el editor mientras
 * dibujas: lo que ves es exactamente lo que se guarda.
 */
export function chamfer(points: readonly Vertex[], cut: number): Vertex[] {
  if (cut <= 0 || points.length < 3) return [...points];

  const n = points.length;
  const out: Vertex[] = [];

  /** Punto a `cut` unidades de `from` en dirección a `to` (máx. media arista). */
  const towards = (from: Vertex, to: Vertex): Vertex => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy);
    if (len === 0) return from;
    const t = Math.min(cut, len / 2) / len;
    return [round1(from[0] + dx * t), round1(from[1] + dy * t)];
  };

  for (let i = 0; i < n; i += 1) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];
    out.push(towards(curr, prev), towards(curr, next));
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────────────
   Medidas derivadas
   ───────────────────────────────────────────────────────────────────────── */

/** Caja envolvente. */
export function bounds(points: readonly Vertex[]): Bounds {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Área del polígono en unidades², por la fórmula del área con signo. */
export function area(points: readonly Vertex[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

/**
 * Centroide de ÁREA (no media de vértices), que es el que cae dentro de la
 * figura aunque los vértices estén repartidos de forma desigual. Se usa para
 * anclar el tooltip.
 *
 * Si el polígono es degenerado (área 0) cae a la media de vértices, que al
 * menos devuelve algo finito.
 */
export function centroid(points: readonly Vertex[]): { x: number; y: number } {
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < points.length; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }

  if (twiceArea === 0) {
    const n = points.length || 1;
    return {
      x: round1(points.reduce((s, p) => s + p[0], 0) / n),
      y: round1(points.reduce((s, p) => s + p[1], 0) / n),
    };
  }

  const factor = 1 / (3 * twiceArea);
  return { x: round1(cx * factor), y: round1(cy * factor) };
}

/** Medida del vinilo en centímetros reales, desde la caja envolvente. */
export function toVinyl(
  points: readonly Vertex[],
  cmPerUnit: number,
  decimals = 1,
): VinylDimensions {
  const b = bounds(points);
  const factor = 10 ** decimals;
  const cm = (units: number) => Math.round(units * cmPerUnit * factor) / factor;
  return { widthCm: cm(b.width), heightCm: cm(b.height) };
}

/** Área del polígono en cm² reales, redondeada a entero. */
export function areaCm2(points: readonly Vertex[], cmPerUnit: number): number {
  return Math.round(area(points) * cmPerUnit * cmPerUnit);
}

/* ─────────────────────────────────────────────────────────────────────────
   Validación
   ───────────────────────────────────────────────────────────────────────── */

/** ¿Se cortan los segmentos AB y CD? Excluye el contacto en los extremos. */
function segmentsCross(a: Vertex, b: Vertex, c: Vertex, d: Vertex): boolean {
  const cross = (p: Vertex, q: Vertex, r: Vertex) =>
    (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);

  const d1 = cross(a, b, c);
  const d2 = cross(a, b, d);
  const d3 = cross(c, d, a);
  const d4 = cross(c, d, b);

  return (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  );
}

/**
 * ¿El polígono se cruza a sí mismo? Un polígono cruzado se rellena en forma de
 * lazo y el vinilo resultante no tiene sentido físico, así que el editor avisa.
 */
export function selfIntersects(points: readonly Vertex[]): boolean {
  const n = points.length;
  if (n < 4) return false;

  for (let i = 0; i < n; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % n];
    for (let j = i + 1; j < n; j += 1) {
      // Las aristas contiguas comparten vértice: no cuentan.
      if (j === i || (j + 1) % n === i || j === (i + 1) % n) continue;
      const c = points[j];
      const d = points[(j + 1) % n];
      if (segmentsCross(a, b, c, d)) return true;
    }
  }
  return false;
}

/** ¿Está el punto dentro del polígono? (ray casting) */
export function containsPoint(points: readonly Vertex[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const crosses = yi > y !== yj > y;
    if (crosses && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * ¿Invade el polígono un círculo prohibido (paso de rueda, faro, matrícula)?
 * Basta con que un vértice caiga dentro o que el centro quede dentro del
 * polígono; para nuestros tamaños de zona no hace falta más finura.
 */
export function overlapsCircle(
  points: readonly Vertex[],
  cx: number,
  cy: number,
  radius: number,
): boolean {
  if (containsPoint(points, cx, cy)) return true;
  return points.some(([x, y]) => Math.hypot(x - cx, y - cy) <= radius);
}
