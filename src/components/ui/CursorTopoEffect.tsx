"use client";

import { useEffect, useRef } from "react";
import { topoState } from "./topoState";

// ── Grid ──────────────────────────────────────────────────────────
const COLS = 95;
const ROWS = 58;
// ── Contour levels ────────────────────────────────────────────────
const LEVELS = 10;
// ── Cursor hill ───────────────────────────────────────────────────
const BUMP_H      = 1.5;   // height of cursor gaussian
const BUMP_S      = 185;   // sigma (spread) in px
// ── Button peak (when hovering a button) ─────────────────────────
const PEAK_H      = 2.2;   // extra height boost at button center
const PEAK_S      = 130;   // tighter sigma → denser rings on button
// ── Noise ─────────────────────────────────────────────────────────
const NOISE_SCALE = 0.0052;
const TIME_SPEED  = 0.00011;
// ── Colour ────────────────────────────────────────────────────────
const LINE_RGB    = "197,109,70";

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

  const startOf = new Map<number, number>(); // key → seg index
  const endOf   = new Map<number, number>();
  const used    = new Uint8Array(segs.length);

  segs.forEach(([x1, y1, x2, y2], i) => {
    startOf.set(ptKey(x1, y1), i);
    endOf  .set(ptKey(x2, y2), i);
  });

  const chains: Pt[][] = [];

  for (let s = 0; s < segs.length; s++) {
    if (used[s]) continue;

    // Try to walk backward first to find the true start of this chain
    let head = s;
    let safety = segs.length;
    while (safety-- > 0) {
      const prev = endOf.get(ptKey(segs[head][0], segs[head][1]));
      if (prev === undefined || used[prev] || prev === head) break;
      head = prev;
    }

    // Now walk forward
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

/** Laplacian smoothing — averages each point with its neighbours (n passes) */
function smooth(pts: Pt[], passes = 3): Pt[] {
  let p = pts.slice();
  const closed =
    (p[0][0] - p[p.length-1][0]) ** 2 + (p[0][1] - p[p.length-1][1]) ** 2 < 4;

  for (let pass = 0; pass < passes; pass++) {
    const next: Pt[] = p.slice();
    const len = p.length;
    for (let i = 1; i < len - 1; i++) {
      next[i] = [
        (p[i-1][0] + p[i][0] * 2 + p[i+1][0]) / 4,
        (p[i-1][1] + p[i][1] * 2 + p[i+1][1]) / 4,
      ];
    }
    if (closed) {
      // Smooth the seam too
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
 * Draw a polyline using Catmull-Rom splines — passes through every point
 * with smooth, continuous tangents. Much rounder than quadratic bezier.
 */
function drawSmooth(ctx: CanvasRenderingContext2D, rawPts: Pt[]) {
  if (rawPts.length < 2) return;

  // Laplacian pre-smoothing
  const pts = smooth(rawPts, 3);
  const n   = pts.length;

  const closed =
    (pts[0][0] - pts[n-1][0]) ** 2 + (pts[0][1] - pts[n-1][1]) ** 2 < 4;

  ctx.moveTo(pts[0][0], pts[0][1]);

  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i === 0 ? (closed ? n - 2 : 0) : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < n ? i + 2 : (closed ? 1 : n - 1)];

    // Catmull-Rom → cubic bezier control points (tension = 0.5)
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
  }

  if (closed) ctx.closePath();
}

export default function CursorTopoEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cur       = useRef({ x: -9999, y: -9999, tx: -9999, ty: -9999 });
  const timeRef   = useRef(0);
  const rafRef    = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let W = 0, H = 0, cW = 0, cH = 0;
    let field = new Float32Array(0);

    const resize = () => {
      canvas.width  = W = window.innerWidth;
      canvas.height = H = window.innerHeight;
      cW = W / COLS;
      cH = H / ROWS;
      field = new Float32Array((COLS + 1) * (ROWS + 1));
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
      for (let i = 0; i < 4; i++) {
        v   += n2(x*f + t*(i%2===0?1:-0.7), y*f + t*(i%2===0?0.6:1.1)) * amp;
        amp *= 0.5; f *= 2.07;
      }
      return v;
    };

    // ── Build and draw one contour level (returns segment list) ───
    const collectSegs = (threshold: number): Seg[] => {
      const segs: Seg[] = [];
      for (let j = 0; j < ROWS; j++) {
        for (let i = 0; i < COLS; i++) {
          const idx = j * (COLS+1) + i;
          const tl = field[idx],         tr = field[idx+1];
          const bl = field[idx+(COLS+1)], br = field[idx+(COLS+2)];
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

    // ── Main loop ─────────────────────────────────────────────────
    const tick = () => {
      if (!W) { rafRef.current = requestAnimationFrame(tick); return; }

      timeRef.current += TIME_SPEED;
      const t = timeRef.current;

      // Smooth cursor lag
      cur.current.x += (cur.current.tx - cur.current.x) * 0.08;
      cur.current.y += (cur.current.ty - cur.current.y) * 0.08;
      const cx = cur.current.x, cy = cur.current.y;

      // ── Lerp button-peak intensity (no jump on enter/leave) ──────
      const targetI = topoState.target ? 1 : 0;
      topoState.intensity += (targetI - topoState.intensity) * 0.055;
      if (topoState.target) topoState.pos = topoState.target; // keep last pos for lerp-out
      const pi   = topoState.intensity;                       // 0..1
      const peak = pi > 0.005 ? topoState.pos : null;
      const peakH = PEAK_H * pi;                             // effective height

      // Build field
      for (let j = 0; j <= ROWS; j++) {
        for (let i = 0; i <= COLS; i++) {
          const px = i * cW, py = j * cH;
          const base = fbm(px * NOISE_SCALE, py * NOISE_SCALE, t);

          // Cursor gaussian
          const dc = (px-cx)*(px-cx) + (py-cy)*(py-cy);
          const bump = BUMP_H * Math.exp(-dc / (2*BUMP_S*BUMP_S));

          // Button peak gaussian — scaled by lerped intensity
          let peakV = 0;
          if (peak) {
            const dp = (px-peak.x)*(px-peak.x) + (py-peak.y)*(py-peak.y);
            peakV = peakH * Math.exp(-dp / (2*PEAK_S*PEAK_S));
          }

          field[j*(COLS+1)+i] = base + bump + peakV;
        }
      }

      ctx.clearRect(0, 0, W, H);

      const rangeTop = 1.2 + BUMP_H + peakH;

      // Draw all levels as smooth chained curves
      for (let k = 0; k < LEVELS; k++) {
        const threshold  = -0.6 + k * rangeTop / (LEVELS - 1);
        const centrality = 1 - Math.abs(k / (LEVELS-1) - 0.5) * 2;
        const alpha      = 0.07 + centrality * 0.09;
        const lw         = 0.4 + centrality * 0.55;

        const chains = chain(collectSegs(threshold));

        ctx.beginPath();
        for (const pts of chains) drawSmooth(ctx, pts);
        ctx.strokeStyle = `rgba(${LINE_RGB},${alpha})`;
        ctx.lineWidth   = lw;
        ctx.stroke();
      }

      // Extra bright pass clipped to cursor + button area
      const clipRegions: { x: number; y: number; r: number; }[] = [
        { x: cx, y: cy, r: BUMP_S * 1.5 },
      ];
      if (peak && pi > 0.01) {
        clipRegions.push({ x: peak.x, y: peak.y, r: PEAK_S * 1.8 });
      }

      for (const region of clipRegions) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(region.x, region.y, region.r, 0, Math.PI * 2);
        ctx.clip();

        for (let k = 0; k < LEVELS; k++) {
          const threshold  = -0.6 + k * rangeTop / (LEVELS - 1);
          const centrality = 1 - Math.abs(k / (LEVELS-1) - 0.5) * 2;
          // Fade the button-area brightness with intensity too
          const brightMult = region.r > BUMP_S ? pi : 1;
          const alpha      = 0.32 * (0.5 + centrality * 0.5) * brightMult;
          const lw         = 0.7 + centrality * 0.5;

          const chains = chain(collectSegs(threshold));
          ctx.beginPath();
          for (const pts of chains) drawSmooth(ctx, pts);
          ctx.strokeStyle = `rgba(${LINE_RGB},${alpha})`;
          ctx.lineWidth   = lw;
          ctx.stroke();
        }
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      cur.current.tx = e.clientX;
      cur.current.ty = e.clientY;
      if (cur.current.x === -9999) {
        cur.current.x = e.clientX;
        cur.current.y = e.clientY;
      }
    };

    document.addEventListener("mousemove", onMove);
    window.addEventListener("resize", resize);
    resize();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5, mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
}
