"use client";

import { useEffect, useRef } from "react";
import {
  DEFAULT_THEME,
  THEME_ATTRIBUTE,
  isTheme,
  type Theme,
} from "@/theme/themeScript";
import { topoState } from "./topoState";

// ── Quality tiers ─────────────────────────────────────────────────
// Grid density + contour count scale with detected hardware. The
// per-frame cost is dominated by COLS*ROWS (field build) and LEVELS
// (marching-squares passes), so both tiers shrink together.
type Quality = "high" | "medium" | "low";

type TierCfg = {
  cols: number;
  rows: number;
  levels: number;
  octaves: number;
  smoothPasses: number;
};

const TIERS: Record<Quality, TierCfg> = {
  high:   { cols: 92, rows: 56, levels: 10, octaves: 4, smoothPasses: 3 },
  medium: { cols: 72, rows: 44, levels: 8,  octaves: 3, smoothPasses: 2 },
  low:    { cols: 54, rows: 34, levels: 6,  octaves: 3, smoothPasses: 2 },
};

function detectQuality(): Quality {
  if (typeof navigator === "undefined") return "high";
  const cores = (navigator.hardwareConcurrency ?? 4) as number;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (cores <= 2) return "low";
  if (cores <= 4 || (mem !== undefined && mem <= 4)) return "medium";
  return "high";
}

// ── Cursor hill ───────────────────────────────────────────────────
const BUMP_H      = 1.5;   // height of cursor gaussian
const BUMP_S      = 185;   // sigma (spread) in px
// ── Button peak (when hovering a button) ─────────────────────────
const PEAK_H      = 2.2;   // extra height boost at button center
const PEAK_S      = 130;   // tighter sigma → denser rings on button
// ── Noise ─────────────────────────────────────────────────────────
const NOISE_SCALE = 0.0052;
const TIME_SPEED  = 0.00011;
// ── Frame pacing ─────────────────────────────────────────────────
const TARGET_FPS  = 60;
const FRAME_MS    = 1000 / TARGET_FPS;
// ── Caché del ruido base ──────────────────────────────────────────
// El campo de ruido (fbm) se desplaza TIME_SPEED / NOISE_SCALE ≈ 0.021 px
// por fotograma: a 60 fps tarda 0.79 s en moverse UN píxel. Recalcularlo
// entero cada fotograma —84.816 llamadas a hash() en el tier alto, medido—
// paga por una deriva que el ojo no puede seguir. Se recalcula cada
// NOISE_REBUILD_EVERY fotogramas y el cerro del cursor (y el pico, cuando
// lo haya) se suman cada fotograma sobre esa base cacheada. Con 6 el error
// de posición acumulado es 6×0.021 ≈ 0.13 px — sub-píxel, indistinguible —
// y el coste de ese trozo baja de 0.45 ms a ~0.11 ms de media por fotograma
// (medido con un banco fuera del navegador que reproduce este código).
const NOISE_REBUILD_EVERY = 6;
/** Por debajo de esto el cursor se considera parado: es movimiento sub-pixel
 *  de la interpolacion, invisible en un cerro gaussiano de 185 px de sigma. */
const IDLE_EPS = 0.08;

// ── Colour ────────────────────────────────────────────────────────
// Aquí no hay ni un color fijo, y no es un capricho de estilo: este efecto
// ya estuvo roto e invisible porque unas constantes JS conservaron el tono
// del tema anterior tras un cambio de paleta. Todo sale de los tokens que
// declara globals.css:
//
//   --topo-line / --topo-line-rgb   curvas de nivel en reposo
//   --topo-bump / --topo-bump-rgb   realce bajo el cursor
//   --topo-peak / --topo-peak-rgb   pico al pasar por un botón
//
// Los *-rgb son tripletes separados por COMA ("185, 169, 140"), pensados a
// propósito para entrar tal cual en `rgba(${rgb},${alpha})`. Aun así se
// parsean y se vuelven a serializar: si algún día se migrasen al formato
// separado por ESPACIO que usa el resto del fichero para rgb(… / α), la
// cadena `rgba(185 169 140,0.3)` sería inválida, el canvas ignoraría la
// asignación en silencio y heredaría el strokeStyle del trazo anterior.
// Parsear cuesta cuatro líneas y cierra esa clase entera de fallo.

// ── Alpha por tema ────────────────────────────────────────────────
// El color sale del token, pero el ALPHA no puede: 0.10–0.22 estaba
// calibrado para línea CLARA sobre #0F1012. En desert la línea es OSCURA
// sobre crema y ambos tonos están mucho más cerca en luminancia, así que
// con el mismo alpha la textura desaparece.
//
// Medido con WCAG 2.x sobre la composición REAL de los dos pases (el pase
// brillante se traza encima del base, sobre la MISMA geometría) contra
// --color-bg-base de cada tema.
//
// Ojo al calibrar: `centrality` NUNCA llega a 1. Los tres tiers tienen un
// número par de niveles, así que k/(levels-1) no cae jamás en 0.5 y el techo
// real es 0.800 (low) · 0.857 (medium) · 0.889 (high). No se toca — la rampa
// es común a los dos temas y enderezarla movería tactical. La tabla va al
// tier alto, que es el caso normal:
//
//                          tactical (intacto)    desert
//   base    c = 0 → 8/9    1.11 → 1.29           1.10 → 1.25
//   bump    c = 0 → 8/9    2.15 → 4.43           1.64 → 2.19
//   peak    c = 0 → 8/9    1.67 → 2.88           1.73 → 2.37
//
// La banda base coincide casi punto por punto, que es lo que importa: es la
// textura de fondo y debe pesar lo mismo en los dos temas.
//
// EL REALCE DE DESERT LO LIMITA EL TEXTO, NO EL FONDO.
// El canvas es `position: fixed; z-index: 5`: pinta POR ENCIMA del contenido,
// así que sus líneas cruzan los glifos. En tactical eso da igual, porque el
// realce (#D8CEBE) y el texto (#F2EFE9) son AMBOS claros y un glifo cruzado
// se queda en 12.85:1. En desert el realce (#8A7B5E) es un tono medio sobre
// texto OSCURO (#2A241C): ACLARA la letra en vez de oscurecerla. Con el alpha
// "bonito" de 0.878 un glifo bajo el cursor caía a 3.84:1 — por debajo del
// 4.5:1 de texto normal, y justo en el punto al que el usuario está mirando.
//
// El tope lo marca el bump: alpha 0.603 deja el texto clavado en 4.5:1. Con
// 0.38 + 0.22·c el máximo es 0.576, así que el glifo aguanta 4.57:1 (4.92:1
// bajo el pico ámbar) con margen para la cuantización a 8 bits. A cambio el
// realce sobre el fondo baja de 3.09 a 2.19, que sigue siendo ~1.8× la
// textura base (1.25) y se distingue de sobra.
//
// No se arregla bajando el z-index: cualquier valor ≥ 0 sigue pintando sobre
// el texto en flujo, y con z-index negativo el canvas caería por detrás del
// fondo de <body> y desaparecería del todo.
//
// Donde las curvas no deben cruzar el contenido (fichas, tablas, el mapa), el
// componente se registra como SÓLIDO (`topoSolidRef` / `<TiltCard solid>`,
// ver topoState.ts) y el canvas recorta su caja en cada repintado.
//
// Los números de tactical son exactamente los de siempre: 0.10 + 0.12·c y
// 0.26 + 0.26·c, la misma recta que el 0.52 · (0.5 + 0.5·c) anterior
// (desvío máximo 5.6e-17, indistinguible al cuantizar el alpha a 8 bits).
type AlphaCfg = {
  /** Pase base en el nivel más exterior (centralidad 0). */
  baseMin: number;
  /** Subida del pase base hasta el nivel central (centralidad 1). */
  baseSpan: number;
  /** Pase brillante en el nivel más exterior. */
  brightMin: number;
  /** Subida del pase brillante hasta el nivel central. */
  brightSpan: number;
};

const THEME_ALPHA: Record<Theme, AlphaCfg> = {
  desert:   { baseMin: 0.16, baseSpan: 0.22, brightMin: 0.38, brightSpan: 0.22 },
  tactical: { baseMin: 0.10, baseSpan: 0.12, brightMin: 0.26, brightSpan: 0.26 },
};

type TopoPalette = {
  /** "r,g,b" listo para rgba(). null = el token no se pudo leer. */
  line: string | null;
  bump: string | null;
  peak: string | null;
  alpha: AlphaCfg;
};

/** Acepta "185, 169, 140" y también "185 169 140" → devuelve "185,169,140". */
function parseTriplet(raw: string): string | null {
  const parts = raw.trim().split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const out: number[] = [];
  for (let i = 0; i < 3; i++) {
    const n = Number(parts[i]);
    if (!Number.isFinite(n)) return null;
    out.push(Math.max(0, Math.min(255, Math.round(n))));
  }
  return out.join(",");
}

/** Respaldo dentro del propio sistema de tokens: el hex hermano (#RGB/#RRGGBB). */
function parseHex(raw: string): string | null {
  const h = raw.trim().replace(/^#/, "");
  const full =
    h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

/** Triplete primero, hex como red de seguridad, null si no hay ninguno. */
function readChannel(
  styles: CSSStyleDeclaration,
  tripletVar: string,
  hexVar: string,
): string | null {
  return (
    parseTriplet(styles.getPropertyValue(tripletVar)) ??
    parseHex(styles.getPropertyValue(hexVar))
  );
}

function activeTheme(root: HTMLElement): Theme {
  const raw = root.getAttribute(THEME_ATTRIBUTE);
  return isTheme(raw) ? raw : DEFAULT_THEME;
}

/**
 * Lee la paleta viva del <html>. Es la ÚNICA fuente de color del efecto.
 * Sin atributo data-theme el fallback es DEFAULT_THEME, que coincide con el
 * selector agrupado `:root, :root[data-theme="desert"]` de globals.css: el
 * alpha y el color salen siempre del mismo tema.
 */
function readPalette(): TopoPalette {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  return {
    line: readChannel(styles, "--topo-line-rgb", "--topo-line"),
    bump: readChannel(styles, "--topo-bump-rgb", "--topo-bump"),
    peak: readChannel(styles, "--topo-peak-rgb", "--topo-peak"),
    alpha: THEME_ALPHA[activeTheme(root)],
  };
}

// ── Segment chaining helpers ───────────────────────────────────────
type Pt  = [number, number];
type Seg = [number, number, number, number]; // x1 y1 x2 y2

/** Convert float coords to integer key for HashMap matching */
const ptKey = (x: number, y: number) =>
  (Math.round(x * 8) * 1_000_003 + Math.round(y * 8)) | 0;

/**
 * Given a flat list of line segments, connect them into
 * continuous polylines by matching endpoints.
 */
function chain(segs: Seg[]): Pt[][] {
  if (!segs.length) return [];

  const startOf = new Map<number, number>();
  const endOf   = new Map<number, number>();
  const used    = new Uint8Array(segs.length);

  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    startOf.set(ptKey(s[0], s[1]), i);
    endOf  .set(ptKey(s[2], s[3]), i);
  }

  const chains: Pt[][] = [];

  for (let s = 0; s < segs.length; s++) {
    if (used[s]) continue;

    let head = s;
    let safety = segs.length;
    while (safety-- > 0) {
      const prev = endOf.get(ptKey(segs[head][0], segs[head][1]));
      if (prev === undefined || used[prev] || prev === head) break;
      head = prev;
    }

    const pts: Pt[] = [];
    let cur: number | undefined = head;
    safety = segs.length;

    while (cur !== undefined && !used[cur] && safety-- > 0) {
      used[cur] = 1;
      const [x1, y1, x2, y2] = segs[cur];
      if (!pts.length) pts.push([x1, y1]);
      pts.push([x2, y2]);
      cur = startOf.get(ptKey(x2, y2));
      if (cur !== undefined && used[cur]) cur = undefined;
    }

    if (pts.length > 1) chains.push(pts);
  }

  return chains;
}

/** Laplacian smoothing — averages each point with its neighbours */
function smooth(pts: Pt[], passes: number): Pt[] {
  let p = pts.slice();
  const closed =
    (p[0][0] - p[p.length-1][0]) ** 2 + (p[0][1] - p[p.length-1][1]) ** 2 < 4;

  for (let pass = 0; pass < passes; pass++) {
    const next: Pt[] = p.slice();
    const len = p.length;
    for (let i = 1; i < len - 1; i++) {
      next[i] = [
        (p[i-1][0] + p[i][0] + p[i+1][0]) / 3,
        (p[i-1][1] + p[i][1] + p[i+1][1]) / 3,
      ];
    }
    if (closed) {
      next[0] = [
        (p[len-1][0] + p[0][0] * 2 + p[1][0]) / 4,
        (p[len-1][1] + p[0][1] * 2 + p[1][1]) / 4,
      ];
      next[len-1] = next[0];
    }
    p = next;
  }
  return p;
}

/**
 * Append a smoothed polyline to a Path2D using Catmull-Rom → cubic
 * bezier. Using Path2D lets us compute once and stroke it twice (base
 * + clipped highlight) without re-running chain/smooth.
 */
function appendSmooth(path: Path2D, rawPts: Pt[], passes: number) {
  if (rawPts.length < 2) return;

  const pts = smooth(rawPts, passes);
  const n   = pts.length;

  const closed =
    (pts[0][0] - pts[n-1][0]) ** 2 + (pts[0][1] - pts[n-1][1]) ** 2 < 4;

  path.moveTo(pts[0][0], pts[0][1]);

  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i === 0 ? (closed ? n - 2 : 0) : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < n ? i + 2 : (closed ? 1 : n - 1)];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
  }

  if (closed) path.closePath();
}

type Point = { x: number; y: number };

export default function CursorTopoEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cur       = useRef({ x: -9999, y: -9999, tx: -9999, ty: -9999 });
  const timeRef   = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const root        = document.documentElement;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let tier: TierCfg = TIERS[detectQuality()];
    let W = 0, H = 0, cW = 0, cH = 0;
    let field = new Float32Array(0);
    // Sólo el ruido, sin cerro ni pico. Se relee en `field` cada fotograma
    // (barato: un `.set()`) y se recalcula de verdad cada NOISE_REBUILD_EVERY.
    let noise = new Float32Array(0);
    // Cuenta atrás hasta el próximo recálculo de `noise`. 0 = tocaba este
    // fotograma. Arranca en 0 para que el primer fotograma sea siempre fresco.
    let noiseCountdown = 0;

    // Caché de la paleta. null = invalidada (arranque o cambio de tema). Se
    // relee DENTRO del fotograma, nunca en el handler de la mutación: así no
    // se paga un getComputedStyle por mutación y se lee el atributo ya
    // asentado, con el CSS del tema nuevo aplicado.
    let palette: TopoPalette | null = null;

    // Adaptive downgrade tracking
    let probeStart = 0;
    let probeFrames = 0;
    let downgraded = false;

    let rafId = 0;
    /** Bucle de vigilancia de sólidos del modo estático (ver `watchSolids`). */
    let watchId = 0;
    let staticPending = false;
    let lastFrame = 0;
    /** Fuerza un repintado aunque nada se mueva: arranque, cambio de tema,
     *  cambio de tamano y reentrada del raton. */
    let needsPaint = true;

    const cursorPt: Point = { x: 0, y: 0 };

    const resize = () => {
      canvas.width  = W = window.innerWidth;
      canvas.height = H = window.innerHeight;
      cW = W / tier.cols;
      cH = H / tier.rows;
      field = new Float32Array((tier.cols + 1) * (tier.rows + 1));
      noise = new Float32Array((tier.cols + 1) * (tier.rows + 1));
      needsPaint = true;
      // El tamaño de `noise` acaba de cambiar (tamaño de ventana o bajada de
      // tier): la caché vieja tiene la forma equivocada. Se fuerza un
      // recálculo inmediato en el siguiente fotograma.
      noiseCountdown = 0;
    };

    // ── Value noise ───────────────────────────────────────────────
    const hash = (x: number, y: number) => {
      let n = (Math.imul(x | 0, 1619) + Math.imul(y | 0, 31337) + 1013904223) | 0;
      n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
      n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
      return ((n >>> 0) / 0xffffffff) * 2 - 1;
    };
    const s3 = (t: number) => t * t * (3 - 2 * t);
    const n2 = (x: number, y: number) => {
      const ix = Math.floor(x), iy = Math.floor(y);
      const fx = x - ix, fy = y - iy;
      const ux = s3(fx), uy = s3(fy);
      const a = hash(ix, iy), b = hash(ix+1, iy);
      const c = hash(ix, iy+1), d = hash(ix+1, iy+1);
      return a + (b-a)*ux + (c-a)*uy + (a-b-c+d)*ux*uy;
    };
    const fbm = (x: number, y: number, t: number) => {
      let v = 0, amp = 0.52, f = 1;
      const oct = tier.octaves;
      for (let i = 0; i < oct; i++) {
        v   += n2(x*f + t*(i%2===0?1:-0.7), y*f + t*(i%2===0?0.6:1.1)) * amp;
        amp *= 0.5; f *= 2.07;
      }
      return v;
    };

    // ── Marching squares over the current field ───────────────────
    const collectSegs = (threshold: number): Seg[] => {
      const segs: Seg[] = [];
      const cols = tier.cols;
      const rows = tier.rows;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = j * (cols+1) + i;
          const tl = field[idx],         tr = field[idx+1];
          const bl = field[idx+(cols+1)], br = field[idx+(cols+2)];
          const c =
            ((tl > threshold) ? 8 : 0) | ((tr > threshold) ? 4 : 0) |
            ((br > threshold) ? 2 : 0) | ((bl > threshold) ? 1 : 0);
          if (c === 0 || c === 15) continue;

          const x0 = i * cW, y0 = j * cH;
          const g = (a: number, b: number) =>
            a === b ? 0.5 : Math.max(0, Math.min(1, (threshold - a) / (b - a)));

          const topX = x0 + g(tl,tr)*cW,  rightY = y0 + g(tr,br)*cH;
          const botX = x0 + g(bl,br)*cW,  leftY  = y0 + g(tl,bl)*cH;

          const T: Pt = [topX,      y0      ];
          const R: Pt = [x0+cW,     rightY  ];
          const B: Pt = [botX,      y0+cH   ];
          const L: Pt = [x0,        leftY   ];

          const add = (a: Pt, b: Pt) => segs.push([a[0],a[1],b[0],b[1]]);

          switch (c) {
            case  1: add(L,B); break; case  2: add(B,R); break;
            case  3: add(L,R); break; case  4: add(T,R); break;
            case  5: add(T,L); add(R,B); break;
            case  6: add(T,B); break; case  7: add(T,L); break;
            case  8: add(T,L); break; case  9: add(T,B); break;
            case 10: add(T,R); add(L,B); break;
            case 11: add(T,R); break; case 12: add(L,R); break;
            case 13: add(B,R); break; case 14: add(L,B); break;
          }
        }
      }
      return segs;
    };

    // ── Height field ──────────────────────────────────────────────
    // Partido en dos: `rebuildNoise` es la parte cara (fbm en cada nodo de
    // la rejilla) y se llama con cuentagotas; `applyBump` es la parte barata
    // (dos gaussianas) y se llama siempre. Las dos escriben exactamente los
    // mismos números que la `buildField` de una sola pieza de antes — el
    // primero sobre `noise`, el segundo copiando `noise` a `field` y sumando
    // encima —, así que el resultado por fotograma es idéntico; lo único que
    // cambia es CADA CUÁNTO se paga la parte cara.
    const rebuildNoise = (t: number) => {
      const cols = tier.cols;
      const rows = tier.rows;
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const px = i * cW, py = j * cH;
          noise[j * (cols + 1) + i] = fbm(px * NOISE_SCALE, py * NOISE_SCALE, t);
        }
      }
    };

    const applyBump = (
      cursor: Point | null,
      peak: Point | null,
      peakH: number,
    ) => {
      field.set(noise);
      const cols = tier.cols;
      const rows = tier.rows;
      const inv2BumpS = 1 / (2 * BUMP_S * BUMP_S);
      const inv2PeakS = 1 / (2 * PEAK_S * PEAK_S);
      // Sin cerro y sin pico (el caso más común: ratón fuera de pantalla,
      // pico siempre inactivo hoy — ver topoState.ts) no hay nada que sumar:
      // `field` ya es el ruido cacheado tal cual.
      if (!cursor && !peak) return;
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const px = i * cW, py = j * cH;
          let bump = 0;
          if (cursor) {
            const dx = px - cursor.x, dy = py - cursor.y;
            bump = BUMP_H * Math.exp(-(dx*dx + dy*dy) * inv2BumpS);
          }

          let peakV = 0;
          if (peak) {
            const dx = px - peak.x, dy = py - peak.y;
            peakV = peakH * Math.exp(-(dx*dx + dy*dy) * inv2PeakS);
          }

          if (bump !== 0 || peakV !== 0) field[j*(cols+1)+i] += bump + peakV;
        }
      }
    };

    // ── Paint ─────────────────────────────────────────────────────
    // Compute Path2D + style once per level, then reuse in both
    // passes (base unclipped + bright clipped).
    type LevelData = {
      path: Path2D;
      baseAlpha: number; baseLw: number;
      brightAlpha: number; brightLw: number;
    };
    type ClipRegion = {
      x: number; y: number; r: number; mult: number; rgb: string;
    };
    type Scene = { pal: TopoPalette; levels: LevelData[]; regions: ClipRegion[] };

    /** Último dibujo completo. Si solo se mueven los sólidos se repinta este
     *  mismo dibujo con los recortes nuevos, sin volver a trazar las curvas.
     *  Lo sustituye el siguiente `paint` (y `needsPaint` fuerza uno tras un
     *  cambio de tamaño o de tema, que es cuando dejaría de valer). */
    let lastScene: Scene | null = null;

    // ── Sólidos (ver topoState.ts) ────────────────────────────────
    // Cajas de los sólidos visibles en el último repintado: x, y, w, h en
    // bloques de 4. Dos búferes que se alternan para no crear arrays por
    // fotograma: el bucle ocioso los lee 60 veces por segundo.
    let solidBoxes: number[] = [];
    let solidScratch: number[] = [];
    let seenSolidsVersion = -1;

    /** Mide los sólidos que tocan la ventana. true si algo cambió desde la
     *  última medida: una caja movida, una que entra o sale, o un registro. */
    const readSolids = (): boolean => {
      const next = solidScratch;
      next.length = 0;
      for (const el of topoState.solids) {
        // Un sólido invisible (display:none o aún en opacity 0 antes de su
        // entrada) no tapa nada: recortarlo dejaría un hueco vacío en el dibujo.
        if (
          typeof el.checkVisibility === "function" &&
          !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
        ) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.bottom <= 0 || r.top >= H || r.right <= 0 || r.left >= W) continue;
        // Hacia fuera al píxel entero: sin hilos de curva en el canto.
        const x = Math.floor(r.left), y = Math.floor(r.top);
        next.push(x, y, Math.ceil(r.right) - x, Math.ceil(r.bottom) - y);
      }
      let changed =
        topoState.solidsVersion !== seenSolidsVersion ||
        next.length !== solidBoxes.length;
      if (!changed) {
        for (let i = 0; i < next.length; i++) {
          if (next[i] !== solidBoxes[i]) { changed = true; break; }
        }
      }
      seenSolidsVersion = topoState.solidsVersion;
      solidScratch = solidBoxes;
      solidBoxes = next;
      return changed;
    };

    /** Borra el dibujo encima de cada sólido. */
    const cutSolids = () => {
      if (solidBoxes.length === 0) return;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "#000";
      for (let i = 0; i < solidBoxes.length; i += 4) {
        ctx.fillRect(solidBoxes[i], solidBoxes[i + 1], solidBoxes[i + 2], solidBoxes[i + 3]);
      }
      ctx.restore();
    };

    const draw = ({ pal, levels: levelsData, regions: clipRegions }: Scene) => {
      ctx.clearRect(0, 0, W, H);

      // Base unclipped pass
      if (pal.line) {
        for (const L of levelsData) {
          ctx.strokeStyle = `rgba(${pal.line},${L.baseAlpha})`;
          ctx.lineWidth   = L.baseLw;
          ctx.stroke(L.path);
        }
      }

      // Bright clipped pass — reuses the same Path2D objects.
      for (const region of clipRegions) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(region.x, region.y, region.r, 0, Math.PI * 2);
        ctx.clip();

        for (const L of levelsData) {
          ctx.strokeStyle = `rgba(${region.rgb},${L.brightAlpha * region.mult})`;
          ctx.lineWidth   = L.brightLw;
          ctx.stroke(L.path);
        }
        ctx.restore();
      }

      cutSolids();
    };

    /** Solo se han movido los sólidos: mismo dibujo, recortes nuevos. */
    const redrawSolids = () => {
      if (lastScene) draw(lastScene);
    };

    const paint = (
      pal: TopoPalette,
      cursor: Point | null,
      peak: Point | null,
      peakMult: number,
      peakH: number,
    ) => {
      const levels   = tier.levels;
      const rangeTop = 1.2 + BUMP_H + peakH;
      const a        = pal.alpha;

      const levelsData: LevelData[] = [];

      for (let k = 0; k < levels; k++) {
        const threshold  = -0.6 + k * rangeTop / (levels - 1);
        const centrality = 1 - Math.abs(k / (levels-1) - 0.5) * 2;

        const path = new Path2D();
        const chains = chain(collectSegs(threshold));
        for (const pts of chains) appendSmooth(path, pts, tier.smoothPasses);

        levelsData.push({
          path,
          baseAlpha:   a.baseMin   + centrality * a.baseSpan,
          baseLw:      0.4 + centrality * 0.55,
          brightAlpha: a.brightMin + centrality * a.brightSpan,
          brightLw:    0.7 + centrality * 0.5,
        });
      }

      // Cada región lleva su propio color: el cerro del cursor va en
      // --topo-bump y el pico del botón en --topo-peak. Se pintan en orden,
      // así que el acento queda por encima cuando ambos coinciden.
      const clipRegions: ClipRegion[] = [];
      if (cursor && pal.bump) {
        clipRegions.push({ x: cursor.x, y: cursor.y, r: BUMP_S * 1.5, mult: 1, rgb: pal.bump });
      }
      if (peak && pal.peak && peakMult > 0.01) {
        clipRegions.push({ x: peak.x, y: peak.y, r: PEAK_S * 1.8, mult: peakMult, rgb: pal.peak });
      }

      lastScene = { pal, levels: levelsData, regions: clipRegions };
      readSolids();
      draw(lastScene);
    };

    // ── Animated loop ─────────────────────────────────────────────
    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);

      if (!W) return;
      if (document.hidden) { lastFrame = 0; return; }

      // FPS cap — skip frame if we're ahead of schedule
      if (lastFrame === 0) lastFrame = now;
      const dt = now - lastFrame;
      if (dt < FRAME_MS - 1) return;
      lastFrame = now - (dt % FRAME_MS);

      // Adaptive downgrade: if the high tier runs below ~42fps during
      // the first ~1.5s of real animation, step down once.
      if (!downgraded) {
        if (probeStart === 0) probeStart = now;
        probeFrames++;
        const elapsed = now - probeStart;
        if (elapsed > 1500) {
          const fps = (probeFrames * 1000) / elapsed;
          if (fps < 42 && tier !== TIERS.low) {
            tier = tier === TIERS.high ? TIERS.medium : TIERS.low;
            resize();
          }
          downgraded = true;
        }
      }

      /* ── ¿Hay algo que repintar? ────────────────────────────────────────
         ╔═══════════════════════════════════════════════════════════════╗
         ║  CON EL RATÓN QUIETO ESTE LIENZO SE CONGELA                   ║
         ╚═══════════════════════════════════════════════════════════════╝
         Antes repintaba 60 veces por segundo pasara lo que pasara. El
         dibujo en sí es barato (0,37 ms de rasterizado, medido), pero el
         canvas es `position: fixed` y ocupa TODA la ventana por encima del
         contenido: cada repintado obliga al compositor a rehacer la pantalla
         entera, y con ella el `backdrop-filter` de la barra fija y el
         `mix-blend-mode` de cada capa de grano. Es decir, el coste no estaba
         en dibujar, estaba en obligar a todo lo demás a recomponerse.

         El perfil de Ramón lo enseña sin lugar a dudas: 18 fps de media con
         el hilo principal 86 % ocioso — el freno estaba en el compositor.

         Mientras el cursor se mueve se repinta igual que siempre. En cuanto
         se para, no hay nada nuevo que enseñar: el cerro ya está donde tiene
         que estar y el ruido de fondo se desplaza 0,021 px por fotograma,
         así que congelarlo es literalmente invisible. `timeRef` tampoco
         avanza, de modo que al volver a moverse no da un salto. */
      const dxCur = cur.current.tx - cur.current.x;
      const dyCur = cur.current.ty - cur.current.y;
      const targetIntensity = topoState.target ? 1 : 0;
      const cursorMoving = Math.abs(dxCur) > IDLE_EPS || Math.abs(dyCur) > IDLE_EPS;
      const peakChanging = Math.abs(targetIntensity - topoState.intensity) > 0.002;

      if (!cursorMoving && !peakChanging && !needsPaint) {
        // Nada se mueve: el fotograma anterior sigue siendo válido… salvo
        // encima de los sólidos, que se mueven sin que se mueva el ratón (el
        // scroll, la entrada de una tarjeta, una etapa que se despliega).
        // Medir una docena de cajas con el layout limpio es casi gratis; el
        // dibujo solo se repite si alguna cambió, y sin retrazar curvas.
        if (readSolids()) redrawSolids();
        return;
      }
      needsPaint = false;

      if (!palette) palette = readPalette();

      timeRef.current += TIME_SPEED;
      const t = timeRef.current;

      // Smooth cursor lag
      cur.current.x += dxCur * 0.08;
      cur.current.y += dyCur * 0.08;
      const cx = cur.current.x, cy = cur.current.y;
      const onScreen =
        cx > -BUMP_S && cx < W + BUMP_S && cy > -BUMP_S && cy < H + BUMP_S;

      let cursor: Point | null = null;
      if (onScreen) {
        cursorPt.x = cx;
        cursorPt.y = cy;
        cursor = cursorPt;
      }

      // Lerp button-peak intensity
      topoState.intensity += (targetIntensity - topoState.intensity) * 0.055;
      if (topoState.target) topoState.pos = topoState.target;
      const pi    = topoState.intensity;
      const peak  = pi > 0.005 ? topoState.pos : null;
      const peakH = PEAK_H * pi;

      // El ruido se recalcula con cuentagotas; el cerro/pico, cada fotograma.
      if (noiseCountdown <= 0) {
        rebuildNoise(t);
        noiseCountdown = NOISE_REBUILD_EVERY;
      }
      noiseCountdown -= 1;
      applyBump(cursor, peak, peakH);
      paint(palette, cursor, peak, pi, peakH);
    };

    // ── Reduced motion ────────────────────────────────────────────
    // Un solo fotograma: mismo campo de ruido, sin bucle, sin cerro de
    // cursor y sin pico. La textura sigue formando parte del diseño pero no
    // se mueve absolutamente nada. Hay que repintarlo a mano al cambiar de
    // tema o de tamaño porque aquí no hay bucle que refresque los colores:
    // es justo el caso en el que el canvas se quedaba con la paleta vieja.
    const drawStatic = () => {
      if (!W) return;
      if (!palette) palette = readPalette();
      // Aquí no hay bucle que amortice el recálculo: se pide siempre fresco.
      rebuildNoise(timeRef.current);
      applyBump(null, null, 0);
      paint(palette, null, null, 0, 0);
    };

    const scheduleStatic = () => {
      if (staticPending) return;
      staticPending = true;
      rafId = requestAnimationFrame(() => {
        staticPending = false;
        rafId = 0;
        drawStatic();
      });
    };

    /** Modo estático: el dibujo no se mueve, pero los sólidos sí (scroll).
     *  Este bucle solo mide cajas; repinta el mismo dibujo si cambian. */
    const watchSolids = () => {
      watchId = requestAnimationFrame(watchSolids);
      if (document.hidden || staticPending) return;
      if (readSolids()) redrawSolids();
    };

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (watchId) cancelAnimationFrame(watchId);
      rafId = 0;
      watchId = 0;
      staticPending = false;
    };

    /** Arranca el modo que toque. Sirve de arranque y de handler del cambio
     *  de preferencia del sistema, que se puede conmutar en caliente. */
    const applyMotionMode = () => {
      stop();
      if (motionQuery.matches) {
        scheduleStatic();
        watchId = requestAnimationFrame(watchSolids);
        return;
      }
      lastFrame   = 0;
      probeStart  = 0;
      probeFrames = 0;
      downgraded  = false;
      rafId = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      cur.current.tx = e.clientX;
      cur.current.ty = e.clientY;
      needsPaint = true;
      if (cur.current.x === -9999) {
        cur.current.x = e.clientX;
        cur.current.y = e.clientY;
      }
    };

    const onLeave = () => {
      cur.current.tx = -9999;
      cur.current.ty = -9999;
      needsPaint = true;
    };

    const onVisibility = () => {
      if (!document.hidden) {
        lastFrame = 0;
        needsPaint = true;
      }
    };

    const onResize = () => {
      resize();
      if (motionQuery.matches) scheduleStatic();
    };

    // Cambio de tema: invalida la caché y deja que el siguiente fotograma
    // relea los tokens. Con el bucle vivo eso son ~16 ms; en modo estático
    // no hay siguiente fotograma, así que se pide uno explícitamente.
    const onThemeChange = () => {
      palette = null;
      needsPaint = true;
      if (motionQuery.matches) scheduleStatic();
    };

    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(root, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE],
    });

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    motionQuery.addEventListener("change", applyMotionMode);

    resize();
    applyMotionMode();

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", applyMotionMode);
      themeObserver.disconnect();
      stop();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5, mixBlendMode: "normal" }}
      aria-hidden="true"
    />
  );
}
