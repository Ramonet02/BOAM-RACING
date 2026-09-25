"use client";

/* ══════════════════════════════════════════════════════════════════════════
   TEMPORAL · Editor visual de zonas de patrocinio
   --------------------------------------------------------------------------
   Las zonas se generaron calculando polígonos sobre medidas del SVG, sin verlas
   nunca puestas sobre la chapa. Aquí se ajustan a mano, viéndolas, y el
   resultado se guarda como borrador para convertirlo después en código.

   LO QUE SE EDITA es el polígono final: lo que ves es lo que se guarda. El
   ancla del tooltip y la medida del vinilo NO se tocan a mano, se derivan de la
   forma — que escribir esos números a mano fue justo lo que descuadró el
   sistema la primera vez.

   BÓRRALO junto con `src/app/dev/` y `src/app/api/dev/` cuando esté validado.
   ══════════════════════════════════════════════════════════════════════════ */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  LATERAL_CM_PER_UNIT,
  LATERAL_LEFT_WHEELS,
  LATERAL_VIEWBOX,
  LATERAL_ZONES_BY_VIEW,
} from "@/lib/car/lateral";
import {
  FRONT_CM_PER_UNIT,
  REAR_CM_PER_UNIT,
  zonesForFrontRearView,
} from "@/lib/car/frontRear";
import { CM_PER_UNIT as TOP_CM_PER_UNIT, TOP_ZONES } from "@/lib/car/top";
import {
  CAR_BOX,
  CAR_SVG_SRC,
  LINE_STYLE,
  loadLineArt,
  peekLineArt,
} from "@/lib/car/lineArt";
import {
  area,
  areaCm2,
  bounds,
  centroid,
  chamfer,
  containsPoint,
  overlapsCircle,
  parsePath,
  round1,
  selfIntersects,
  toPathData,
  toVinyl,
  type Vertex,
} from "@/lib/car/polygon";

import { TIER_COLORS } from "@/lib/sponsors";
import type { CarView, SponsorTierId } from "@/lib/types";
import { SPONSOR_PAINT_CSS } from "@/components/sponsor/sponsorPaint";

/* ─────────────────────────────────────────────────────────────────────────
   1. Modelo
   ───────────────────────────────────────────────────────────────────────── */

interface EditorZone {
  readonly id: string;
  readonly label: string;
  readonly tier: SponsorTierId;
  points: Vertex[];
  cut: number;
  anchor: { x: number; y: number } | null;
}

type Board = Record<CarView, EditorZone[]>;

const VIEWS: readonly CarView[] = [
  "lateral-izq",
  "lateral-der",
  "frontal",
  "trasera",
  "cenital",
];

const VIEW_LABEL: Record<CarView, string> = {
  "lateral-izq": "Lateral izq.",
  "lateral-der": "Lateral der.",
  frontal: "Frontal",
  trasera: "Trasera",
  cenital: "Cenital",
};

const CM_PER_UNIT: Record<CarView, number> = {
  "lateral-izq": LATERAL_CM_PER_UNIT,
  "lateral-der": LATERAL_CM_PER_UNIT,
  frontal: FRONT_CM_PER_UNIT,
  trasera: REAR_CM_PER_UNIT,
  cenital: TOP_CM_PER_UNIT,
};

/**
 * Dónde cae el morro en cada lámina, MEDIDO (ver cabecera de `lateral.ts`).
 * Se rotula sobre el lienzo para que un mapeo invertido salte a la vista: si
 * el rótulo MORRO cae sobre el maletero, el fichero y la vista no se
 * corresponden y hay que intercambiar las rutas en `LATERAL_SVG`.
 */
const NOSE_AT: Record<CarView, "left" | "right" | "top" | "bottom" | null> = {
  "lateral-izq": "right",
  "lateral-der": "left",
  frontal: null,
  trasera: null,
  cenital: "bottom",
};

/** Círculos vetados: no se puede tapar un paso de rueda con un vinilo. */
function forbiddenCircles(
  view: CarView,
): readonly { cx: number; cy: number; r: number; label: string }[] {
  if (view === "lateral-izq") {
    return [
      { ...LATERAL_LEFT_WHEELS.front, r: LATERAL_LEFT_WHEELS.front.archRadius, label: "Paso rueda del." },
      { ...LATERAL_LEFT_WHEELS.rear, r: LATERAL_LEFT_WHEELS.rear.archRadius, label: "Paso rueda tras." },
    ].map((w) => ({ cx: w.cx, cy: w.cy, r: w.r, label: w.label }));
  }
  if (view === "lateral-der") {
    const w = LATERAL_VIEWBOX.width;
    return [
      { cx: w - LATERAL_LEFT_WHEELS.front.cx, cy: LATERAL_LEFT_WHEELS.front.cy, r: LATERAL_LEFT_WHEELS.front.archRadius, label: "Paso rueda del." },
      { cx: w - LATERAL_LEFT_WHEELS.rear.cx, cy: LATERAL_LEFT_WHEELS.rear.cy, r: LATERAL_LEFT_WHEELS.rear.archRadius, label: "Paso rueda tras." },
    ];
  }
  return [];
}

/** Estado inicial: la geometría que hay hoy en `src/lib/car/`. */
function seedBoard(): Board {
  const fromZones = (zones: readonly { id: string; label: string; tier: SponsorTierId; d: string }[]) =>
    zones.map<EditorZone>((z) => ({
      id: z.id,
      label: z.label,
      tier: z.tier,
      points: parsePath(z.d),
      cut: 0, // lo que se parsea ya viene achaflanado: no re-achaflanar
      anchor: null,
    }));

  return {
    "lateral-izq": fromZones(LATERAL_ZONES_BY_VIEW["lateral-izq"]),
    "lateral-der": fromZones(LATERAL_ZONES_BY_VIEW["lateral-der"]),
    frontal: fromZones(zonesForFrontRearView("frontal")),
    trasera: fromZones(zonesForFrontRearView("trasera")),
    cenital: fromZones(TOP_ZONES),
  };
}

function cloneBoard(board: Board): Board {
  const out = {} as Board;
  for (const v of VIEWS) {
    out[v] = board[v].map((z) => ({ ...z, points: z.points.map((p) => [p[0], p[1]] as Vertex) }));
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────────────
   2. Cámara
   ───────────────────────────────────────────────────────────────────────── */

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** Amplía la caja del coche a la relación de aspecto del marco: sin bandas. */
function fitBox(car: { w: number; h: number }, frame: { w: number; h: number }): ViewBox {
  const pad = 1.06;
  const carRatio = car.w / car.h;
  const frameRatio = frame.w / frame.h;
  let w = car.w * pad;
  let h = car.h * pad;
  if (frameRatio > carRatio) w = h * frameRatio;
  else h = w / frameRatio;
  return { x: car.w / 2 - w / 2, y: car.h / 2 - h / 2, w, h };
}

/* ─────────────────────────────────────────────────────────────────────────
   3. Componente
   ───────────────────────────────────────────────────────────────────────── */

type Drag =
  | { kind: "vertex"; zoneId: string; index: number }
  | { kind: "zone"; zoneId: string; last: Vertex }
  | { kind: "anchor"; zoneId: string }
  | { kind: "pan"; last: { x: number; y: number } }
  | null;

export default function ZoneEditor() {
  const [board, setBoard] = useState<Board>(seedBoard);
  const [view, setView] = useState<CarView>("lateral-izq");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [mirror, setMirror] = useState(true);
  const [showForbidden, setShowForbidden] = useState(true);
  const [lineOpacity, setLineOpacity] = useState(1);
  const [stroke, setStroke] = useState(1.75);
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null);

  const [lineArt, setLineArt] = useState<string | null>(null);
  const [lineArtError, setLineArtError] = useState<string | null>(null);
  const [past, setPast] = useState<Board[]>([]);
  const [future, setFuture] = useState<Board[]>([]);
  const [status, setStatus] = useState<string>("");

  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const dragRef = useRef<Drag>(null);
  const movedRef = useRef(false);

  /* ── Recuperar el borrador guardado ───────────────────────────────────────
     Al abrir, el tablero arranca con la geometría del código; si hay borrador
     en disco, sus formas lo pisan. Las etiquetas y los tiers SIEMPRE salen del
     código, nunca del borrador: el borrador sólo manda en la forma.            */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/dev/zonas")
      .then((r) => r.json())
      .then((draft: { views?: Record<string, Record<string, { points: Vertex[]; cut?: number; anchor?: { x: number; y: number } | null }>> }) => {
        if (cancelled || !draft.views) return;
        let restored = 0;
        setBoard((prev) => {
          const next = cloneBoard(prev);
          for (const v of VIEWS) {
            const saved = draft.views?.[v];
            if (!saved) continue;
            for (const zone of next[v]) {
              const hit = saved[zone.id];
              if (!hit || !Array.isArray(hit.points) || hit.points.length < 3) continue;
              zone.points = hit.points.map((p) => [p[0], p[1]] as Vertex);
              zone.cut = hit.cut ?? 0;
              zone.anchor = hit.anchor ?? null;
              restored += 1;
            }
          }
          return next;
        });
        if (restored > 0) setStatus(`Borrador recuperado · ${restored} zonas`);
      })
      .catch(() => {
        /* sin borrador: se trabaja sobre la geometría del código */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Line-art ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const src = CAR_SVG_SRC[view];
    const cached = peekLineArt(src);
    if (cached !== undefined) {
      setLineArt(cached);
      return;
    }
    let cancelled = false;
    setLineArt(null);
    setLineArtError(null);
    loadLineArt(src)
      .then((m) => {
        if (cancelled) return;
        // Un SVG que descarga pero viene vacío se veía igual que uno cargando:
        // pantalla en blanco y sin pista de qué ha pasado.
        if (!m || m.trim().length === 0) {
          setLineArtError(`${src} descargó vacío`);
          return;
        }
        setLineArt(m);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLineArtError(`No se pudo cargar ${src} — ${String(err)}`);
      });
    return () => {
      cancelled = true;
    };
  }, [view]);

  /* ── Medida del marco ─────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      if (r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  /* ── Cámara ───────────────────────────────────────────────────────────── */
  const car = CAR_BOX[view];
  const base = useMemo(
    () => (size ? fitBox(car, size) : { x: 0, y: 0, w: car.w, h: car.h }),
    [car, size],
  );
  const viewBox = useMemo<ViewBox>(() => {
    const w = base.w / zoom;
    const h = base.h / zoom;
    const cx = focus ? focus.x : base.x + base.w / 2;
    const cy = focus ? focus.y : base.y + base.h / 2;
    return {
      x: clamp(cx - w / 2, base.x, base.x + base.w - w),
      y: clamp(cy - h / 2, base.y, base.y + base.h - h),
      w,
      h,
    };
  }, [base, zoom, focus]);

  // Espejos para que los handlers lean valores frescos sin recrearse.
  const vbRef = useRef(viewBox);
  const sizeRef = useRef(size);
  vbRef.current = viewBox;
  sizeRef.current = size;

  /** Píxeles de pantalla → unidades de viewBox. */
  const toUnits = useCallback((clientX: number, clientY: number): Vertex => {
    const rect = svgRef.current?.getBoundingClientRect();
    const vb = vbRef.current;
    if (!rect || rect.width === 0) return [0, 0];
    return [
      round1(vb.x + ((clientX - rect.left) / rect.width) * vb.w),
      round1(vb.y + ((clientY - rect.top) / rect.height) * vb.h),
    ];
  }, []);

  // Al cambiar de vista, cámara a cero.
  useEffect(() => {
    setZoom(1);
    setFocus(null);
    setSelectedId(null);
  }, [view]);

  /* ── Historial ────────────────────────────────────────────────────────── */
  const pushHistory = useCallback(() => {
    setPast((p) => [...p.slice(-49), cloneBoard(board)]);
    setFuture([]);
  }, [board]);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [cloneBoard(board), ...f.slice(0, 49)]);
      setBoard(prev);
      return p.slice(0, -1);
    });
  }, [board]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      setPast((p) => [...p, cloneBoard(board)]);
      setBoard(f[0]);
      return f.slice(1);
    });
  }, [board]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  /* ── Mutación de zonas ────────────────────────────────────────────────── */

  /** Aplica un cambio a una zona y, si toca, lo refleja en el otro lateral. */
  const mutate = useCallback(
    (zoneId: string, fn: (z: EditorZone) => void) => {
      setBoard((prev) => {
        const next = cloneBoard(prev);
        const zone = next[view].find((z) => z.id === zoneId);
        if (!zone) return prev;
        fn(zone);

        const isLateral = view === "lateral-izq" || view === "lateral-der";
        if (mirror && isLateral) {
          const other: CarView = view === "lateral-izq" ? "lateral-der" : "lateral-izq";
          const twin = next[other].find((z) => z.id === zoneId);
          if (twin) {
            const W = LATERAL_VIEWBOX.width;
            twin.points = zone.points.map(([x, y]) => [round1(W - x), y] as Vertex);
            twin.cut = zone.cut;
            twin.anchor = zone.anchor ? { x: round1(W - zone.anchor.x), y: zone.anchor.y } : null;
          }
        }
        return next;
      });
    },
    [view, mirror],
  );

  /* ── Punteros ─────────────────────────────────────────────────────────── */

  const startVertexDrag = (e: ReactPointerEvent, zoneId: string, index: number) => {
    e.stopPropagation();
    if (e.altKey) {
      // Alt+clic borra el vértice, si quedan al menos 3.
      const zone = board[view].find((z) => z.id === zoneId);
      if (zone && zone.points.length > 3) {
        pushHistory();
        mutate(zoneId, (z) => {
          z.points = z.points.filter((_, i) => i !== index);
        });
      }
      return;
    }
    pushHistory();
    setSelectedId(zoneId);
    dragRef.current = { kind: "vertex", zoneId, index };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const startZoneDrag = (e: ReactPointerEvent, zoneId: string) => {
    e.stopPropagation();
    setSelectedId(zoneId);
    if (!e.shiftKey) return; // sólo mueve el polígono entero con Shift
    pushHistory();
    dragRef.current = { kind: "zone", zoneId, last: toUnits(e.clientX, e.clientY) };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const insertVertex = (e: ReactPointerEvent, zoneId: string, afterIndex: number) => {
    e.stopPropagation();
    pushHistory();
    const at = toUnits(e.clientX, e.clientY);
    setSelectedId(zoneId);
    mutate(zoneId, (z) => {
      z.points = [...z.points.slice(0, afterIndex + 1), at, ...z.points.slice(afterIndex + 1)];
    });
  };

  const onSvgPointerDown = (e: ReactPointerEvent) => {
    movedRef.current = false;
    dragRef.current = { kind: "pan", last: { x: e.clientX, y: e.clientY } };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    movedRef.current = true;

    if (drag.kind === "vertex") {
      const at = toUnits(e.clientX, e.clientY);
      mutate(drag.zoneId, (z) => {
        z.points = z.points.map((p, i) => (i === drag.index ? at : p));
      });
    } else if (drag.kind === "zone") {
      const at = toUnits(e.clientX, e.clientY);
      const dx = at[0] - drag.last[0];
      const dy = at[1] - drag.last[1];
      drag.last = at;
      mutate(drag.zoneId, (z) => {
        z.points = z.points.map(([x, y]) => [round1(x + dx), round1(y + dy)] as Vertex);
        if (z.anchor) z.anchor = { x: round1(z.anchor.x + dx), y: round1(z.anchor.y + dy) };
      });
    } else if (drag.kind === "anchor") {
      const at = toUnits(e.clientX, e.clientY);
      mutate(drag.zoneId, (z) => {
        z.anchor = { x: at[0], y: at[1] };
      });
    } else if (drag.kind === "pan") {
      const vb = vbRef.current;
      const s = sizeRef.current;
      if (!s) return;
      const dx = ((e.clientX - drag.last.x) / s.w) * vb.w;
      const dy = ((e.clientY - drag.last.y) / s.h) * vb.h;
      drag.last = { x: e.clientX, y: e.clientY };
      setFocus((f) => {
        const cx = (f ? f.x : vb.x + vb.w / 2) - dx;
        const cy = (f ? f.y : vb.y + vb.h / 2) - dy;
        // El centro se limita a la CARROCERÍA, no a la caja ampliada: si no,
        // en vistas donde la caja es mucho mayor que el coche se podía panear
        // hasta un trozo de fondo vacío y parecía que el dibujo no estaba.
        return {
          x: clamp(cx, 0, car.w),
          y: clamp(cy, 0, car.h),
        };
      });
    }
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  // Rueda: zoom con Ctrl/Cmd, como en el visor de producción.
  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clamp(z * Math.exp(-e.deltaY / 260), 1, 12));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  /* ── Derivados de la zona activa ──────────────────────────────────────── */
  const zones = board[view];
  const selected = zones.find((z) => z.id === selectedId) ?? null;
  const cmPerUnit = CM_PER_UNIT[view];
  const circles = showForbidden ? forbiddenCircles(view) : [];

  const report = useMemo(() => {
    if (!selected) return null;
    const shape = chamfer(selected.points, selected.cut);
    const v = toVinyl(shape, cmPerUnit);
    const b = bounds(shape);
    const warnings: string[] = [];

    if (selectedId && selfIntersects(selected.points)) warnings.push("El polígono se cruza a sí mismo.");
    if (b.minX < 0 || b.minY < 0 || b.maxX > car.w || b.maxY > car.h) {
      warnings.push("Se sale del lienzo de la lámina.");
    }
    for (const c of forbiddenCircles(view)) {
      if (overlapsCircle(selected.points, c.cx, c.cy, c.r)) warnings.push(`Invade: ${c.label}.`);
    }
    for (const other of zones) {
      if (other.id === selected.id) continue;
      const hit = other.points.some((p) => containsPoint(selected.points, p[0], p[1]));
      if (hit) warnings.push(`Solapa con “${other.label}”.`);
    }

    return {
      vinyl: `${v.widthCm} × ${v.heightCm} cm`,
      areaCm2: areaCm2(shape, cmPerUnit),
      vertices: selected.points.length,
      degenerate: area(selected.points) < 1,
      warnings,
    };
  }, [selected, selectedId, cmPerUnit, car, view, zones]);

  /* ── Guardado ─────────────────────────────────────────────────────────── */
  const save = useCallback(async () => {
    setStatus("Guardando…");
    const views: Record<string, Record<string, unknown>> = {};
    for (const v of VIEWS) {
      views[v] = Object.fromEntries(
        board[v].map((z) => [z.id, { points: z.points, cut: z.cut, anchor: z.anchor }]),
      );
    }
    try {
      const res = await fetch("/api/dev/zonas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: 1, views }),
      });
      const data = (await res.json()) as { error?: string; zoneCount?: number };
      setStatus(res.ok ? `Guardado · ${data.zoneCount} zonas` : `Error: ${data.error}`);
    } catch (err) {
      setStatus(`Error de red: ${String(err)}`);
    }
  }, [board]);

  // Red de seguridad: autoguardado local en cada cambio.
  useEffect(() => {
    try {
      window.localStorage.setItem("boam-zonas-draft", JSON.stringify(board));
    } catch {
      /* cuota llena o modo privado: no es crítico */
    }
  }, [board]);

  const restoreLocal = useCallback(() => {
    try {
      const raw = window.localStorage.getItem("boam-zonas-draft");
      if (!raw) return setStatus("No hay copia local.");
      pushHistory();
      setBoard(JSON.parse(raw) as Board);
      setStatus("Restaurado desde copia local.");
    } catch {
      setStatus("La copia local está corrupta.");
    }
  }, [pushHistory]);

  const resetZone = useCallback(() => {
    if (!selected) return;
    const fresh = seedBoard()[view].find((z) => z.id === selected.id);
    if (!fresh) return;
    pushHistory();
    mutate(selected.id, (z) => {
      z.points = fresh.points.map((p) => [p[0], p[1]] as Vertex);
      z.cut = 0;
      z.anchor = null;
    });
  }, [selected, view, pushHistory, mutate]);

  /* ── Render ───────────────────────────────────────────────────────────── */

  const vb = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;
  const unitPx = size ? size.w / viewBox.w : 1; // unidades → px, para dimensionar los tiradores
  const handleR = clamp(5 / unitPx, 2, 40);

  return (
    /*
     * Capa completa por encima del chrome del sitio: esta página cuelga del
     * layout raíz, así que hereda Navbar fija y Footer. Taparlos es más simple
     * y más robusto que intentar sacar la ruta del layout con un route group.
     */
    <div className="fixed inset-0 z-[100] overflow-auto bg-bg-base text-text-primary">
      <style>{SPONSOR_PAINT_CSS}</style>

      <header className="border-b border-slate px-6 py-4">
        <p className="telemetry-label text-amber-text">Herramienta temporal</p>
        <h1 className="font-heading text-2xl tracking-[2px]">Editor de zonas de patrocinio</h1>
        <p className="font-body mt-1 text-sm text-text-secondary">
          Arrastra los vértices · clic en una arista inserta un punto · Alt+clic lo borra ·
          Shift+arrastrar mueve la zona entera · Ctrl+rueda hace zoom · arrastrar el fondo panea
        </p>
      </header>

      <div className="flex flex-col gap-4 p-4 lg:flex-row">
        {/* ── Lienzo ───────────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`chamfer-sm font-mono px-3 py-2 text-[0.6875rem] tracking-[0.14em] uppercase transition-colors ${
                  v === view
                    ? "bg-amber-solid text-text-inverse"
                    : "bg-bg-surface text-text-secondary hover:bg-bg-elevated"
                }`}
              >
                {VIEW_LABEL[v]}
              </button>
            ))}
            <span className="font-mono ml-auto text-[0.6875rem] text-text-tertiary">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setFocus(null);
              }}
              className="chamfer-sm font-mono bg-bg-surface px-3 py-2 text-[0.6875rem] uppercase"
            >
              1:1
            </button>
          </div>

          {/*
            El marco TOMA LA PROPORCIÓN DE LA VISTA en vez de ser siempre
            apaisado. Con un marco fijo de 1000×620, la cenital (533×1169, muy
            vertical) dejaba el coche ocupando el 25 % del área: una tira
            estrecha perdida en el centro, que es justo lo que parecía "no
            carga". Ajustando la proporción, el coche llena el marco en las
            cinco vistas.
          */}
          <div
            ref={frameRef}
            className="hud-frame panel relative mx-auto overflow-hidden"
            style={{
              height: "min(68vh, 620px)",
              aspectRatio: `${car.w} / ${car.h}`,
              width: "auto",
              maxWidth: "100%",
            }}
          >
            <svg
              ref={svgRef}
              viewBox={vb}
              className="h-full w-full touch-none"
              style={{ ["--car-stroke" as string]: `${stroke}px`, color: "var(--color-text-primary)" }}
              onPointerDown={onSvgPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
            >
              {/* Line-art del coche */}
              {lineArt ? (
                <g
                  aria-hidden="true"
                  opacity={lineOpacity}
                  dangerouslySetInnerHTML={{ __html: LINE_STYLE + lineArt }}
                />
              ) : null}

              {/* Zonas prohibidas */}
              {circles.map((c, i) => (
                <circle
                  key={i}
                  cx={c.cx}
                  cy={c.cy}
                  r={c.r}
                  fill="rgb(var(--amber-rgb) / 0.08)"
                  stroke="rgb(var(--amber-rgb) / 0.55)"
                  strokeDasharray="8 6"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              ))}

              {/* Rótulo de orientación — si cae sobre el maletero, el mapeo
                  vista→fichero está invertido y hay que cambiar LATERAL_SVG. */}
              {NOSE_AT[view] ? (
                <text
                  x={
                    NOSE_AT[view] === "right"
                      ? car.w * 0.88
                      : NOSE_AT[view] === "left"
                        ? car.w * 0.12
                        : car.w / 2
                  }
                  y={NOSE_AT[view] === "bottom" ? car.h * 0.96 : car.h * 0.07}
                  textAnchor="middle"
                  className="font-mono"
                  fill="rgb(var(--amber-rgb) / 0.8)"
                  // Se escala con la dimensión mayor: si no, en cenital (533 u
                  // de ancho pero 1169 de alto) el rótulo sale ilegible.
                  fontSize={Math.max(car.w, car.h) / 32}
                  pointerEvents="none"
                >
                  {NOSE_AT[view] === "right"
                    ? "MORRO ▶"
                    : NOSE_AT[view] === "left"
                      ? "◀ MORRO"
                      : NOSE_AT[view] === "bottom"
                        ? "▼ MORRO"
                        : "▲ MORRO"}
                </text>
              ) : null}

              {/* Polígonos */}
              {zones.map((zone) => {
                if (hidden.has(zone.id)) return null;
                const isSel = zone.id === selectedId;
                const shape = chamfer(zone.points, zone.cut);
                const color = TIER_COLORS[zone.tier];
                const anchor = zone.anchor ?? centroid(shape);

                return (
                  <g key={zone.id}>
                    <path
                      d={toPathData(shape)}
                      fill={color}
                      fillOpacity={isSel ? 0.42 : 0.16}
                      stroke={color}
                      strokeWidth={isSel ? 2.5 : 1.4}
                      vectorEffect="non-scaling-stroke"
                      style={{ cursor: "pointer" }}
                      onPointerDown={(e) => startZoneDrag(e, zone.id)}
                    />

                    {isSel ? (
                      <>
                        {/* Aristas: clic para insertar vértice */}
                        {zone.points.map((p, i) => {
                          const q = zone.points[(i + 1) % zone.points.length];
                          return (
                            <line
                              key={`e${i}`}
                              x1={p[0]}
                              y1={p[1]}
                              x2={q[0]}
                              y2={q[1]}
                              stroke="transparent"
                              strokeWidth={handleR * 1.6}
                              style={{ cursor: "copy" }}
                              onPointerDown={(e) => insertVertex(e, zone.id, i)}
                            />
                          );
                        })}

                        {/* Vértices */}
                        {zone.points.map((p, i) => (
                          <circle
                            key={`v${i}`}
                            cx={p[0]}
                            cy={p[1]}
                            r={handleR}
                            fill="var(--color-bg-base)"
                            stroke={color}
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                            style={{ cursor: "grab" }}
                            onPointerDown={(e) => startVertexDrag(e, zone.id, i)}
                          />
                        ))}

                        {/* Ancla del tooltip */}
                        <circle
                          cx={anchor.x}
                          cy={anchor.y}
                          r={handleR * 0.8}
                          fill="rgb(var(--lime-rgb) / 0.9)"
                          stroke="var(--color-bg-base)"
                          strokeWidth={1.5}
                          vectorEffect="non-scaling-stroke"
                          style={{ cursor: "move" }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            pushHistory();
                            dragRef.current = { kind: "anchor", zoneId: zone.id };
                          }}
                        />
                      </>
                    ) : null}
                  </g>
                );
              })}
            </svg>

            {!lineArt ? (
              <div className="font-mono absolute inset-0 grid place-items-center px-6 text-center text-xs">
                {lineArtError ? (
                  <span className="text-amber-text">⚠ {lineArtError}</span>
                ) : (
                  <span className="text-text-tertiary">cargando lámina…</span>
                )}
              </div>
            ) : null}
          </div>

          {/* Controles de lienzo */}
          <div className="font-mono mt-2 flex flex-wrap items-center gap-4 text-[0.6875rem] text-text-secondary">
            <label className="flex items-center gap-2">
              Opacidad línea
              <input
                type="range"
                min={0.15}
                max={1}
                step={0.05}
                value={lineOpacity}
                onChange={(e) => setLineOpacity(Number(e.target.value))}
              />
            </label>
            <label className="flex items-center gap-2">
              Grosor
              <input
                type="range"
                min={1}
                max={4}
                step={0.25}
                value={stroke}
                onChange={(e) => setStroke(Number(e.target.value))}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showForbidden}
                onChange={(e) => setShowForbidden(e.target.checked)}
              />
              Zonas prohibidas
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} />
              Espejo de laterales
            </label>
          </div>
        </div>

        {/* ── Panel ────────────────────────────────────────────────────── */}
        <aside className="w-full shrink-0 lg:w-80">
          <div className="panel chamfer-sm p-3">
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={save}
                className="chamfer-sm font-mono flex-1 bg-amber-solid px-3 py-2 text-[0.6875rem] tracking-[0.14em] text-text-inverse uppercase"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={undo}
                disabled={past.length === 0}
                className="chamfer-sm font-mono bg-bg-surface px-3 py-2 text-[0.6875rem] uppercase disabled:opacity-40"
              >
                ↶
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={future.length === 0}
                className="chamfer-sm font-mono bg-bg-surface px-3 py-2 text-[0.6875rem] uppercase disabled:opacity-40"
              >
                ↷
              </button>
            </div>

            {status ? (
              <p className="font-mono mb-3 text-[0.6875rem] text-amber-text">{status}</p>
            ) : null}

            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {zones.map((z) => (
                <li key={z.id}>
                  <div
                    className={`flex items-center gap-2 px-2 py-1.5 ${
                      z.id === selectedId ? "bg-bg-elevated" : ""
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0"
                      style={{ background: TIER_COLORS[z.tier] }}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedId(z.id)}
                      className="font-body min-w-0 flex-1 truncate text-left text-xs"
                      title={z.id}
                    >
                      {z.label}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHidden((h) => {
                          const n = new Set(h);
                          if (n.has(z.id)) n.delete(z.id);
                          else n.add(z.id);
                          return n;
                        })
                      }
                      className="font-mono text-[0.6875rem] text-text-tertiary"
                      aria-label={hidden.has(z.id) ? `Mostrar ${z.label}` : `Ocultar ${z.label}`}
                    >
                      {hidden.has(z.id) ? "○" : "●"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Detalle de la zona activa */}
          {selected && report ? (
            <div className="panel chamfer-sm mt-3 p-3">
              <p className="telemetry-label mb-1">{selected.id}</p>
              <p className="font-heading text-lg tracking-[1px]">{selected.label}</p>

              <dl className="font-mono mt-3 space-y-1 text-[0.6875rem]">
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Vinilo</dt>
                  <dd>{report.vinyl}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Área</dt>
                  <dd>{report.areaCm2} cm²</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Vértices</dt>
                  <dd>{report.vertices}</dd>
                </div>
              </dl>

              <label className="font-mono mt-3 flex items-center gap-2 text-[0.6875rem]">
                Chaflán
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={selected.cut}
                  onChange={(e) => {
                    const cut = Number(e.target.value);
                    mutate(selected.id, (z) => {
                      z.cut = cut;
                    });
                  }}
                />
                <span className="w-6 text-right">{selected.cut}</span>
              </label>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={resetZone}
                  className="chamfer-sm font-mono flex-1 bg-bg-surface px-2 py-1.5 text-[0.6875rem] uppercase"
                >
                  Resetear zona
                </button>
                <button
                  type="button"
                  onClick={() => mutate(selected.id, (z) => (z.anchor = null))}
                  className="chamfer-sm font-mono flex-1 bg-bg-surface px-2 py-1.5 text-[0.6875rem] uppercase"
                >
                  Ancla auto
                </button>
              </div>

              {report.warnings.length > 0 ? (
                <ul className="font-mono mt-3 space-y-1 text-[0.6875rem] text-amber-text">
                  {report.warnings.map((w, i) => (
                    <li key={i}>⚠ {w}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono mt-3 text-[0.6875rem] text-lime">✓ Sin avisos</p>
              )}
            </div>
          ) : (
            <p className="font-body mt-3 px-1 text-xs text-text-tertiary">
              Selecciona una zona de la lista o pincha sobre ella en el coche.
            </p>
          )}

          <button
            type="button"
            onClick={restoreLocal}
            className="chamfer-sm font-mono mt-3 w-full bg-bg-surface px-3 py-2 text-[0.6875rem] uppercase"
          >
            Restaurar copia local
          </button>
        </aside>
      </div>
    </div>
  );
}
