/* ══════════════════════════════════════════════════════════════════════════
   TEMPORAL · Guardado del borrador del editor visual de zonas
   --------------------------------------------------------------------------
   Esta ruta existe SÓLO para que el editor de `/dev/zonas` pueda escribir el
   borrador a disco y recuperarlo al recargar. Devuelve 404 en producción.

   BÓRRALA junto con `src/app/dev/` cuando las zonas estén dadas por buenas.
   ══════════════════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

/** Siempre en el servidor y sin cachear: es un fichero que cambia a cada rato. */
export const dynamic = "force-dynamic";

const DRAFT_PATH = path.join(process.cwd(), "src", "lib", "car", "zones.draft.json");

/** En producción esta ruta no existe. */
function blockedInProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

type Point = readonly [number, number];

interface DraftZone {
  readonly points: readonly Point[];
  readonly cut: number;
  readonly anchor: { readonly x: number; readonly y: number } | null;
}

interface Draft {
  readonly version: 1;
  readonly savedAt: string;
  readonly views: Record<string, Record<string, DraftZone>>;
}

/**
 * Valida la forma del borrador antes de escribirlo.
 *
 * No es paranoia de seguridad (la ruta sólo vive en desarrollo): es que un
 * borrador corrupto se convierte después en geometría del coche, y prefiero
 * que falle aquí y no al generar los ficheros de `src/lib/car/`.
 */
function parseDraft(raw: unknown): Draft | string {
  if (typeof raw !== "object" || raw === null) return "El cuerpo no es un objeto.";
  const body = raw as Record<string, unknown>;
  if (body.version !== 1) return "Falta `version: 1`.";
  if (typeof body.views !== "object" || body.views === null) return "Falta `views`.";

  const views: Record<string, Record<string, DraftZone>> = {};

  for (const [view, zonesRaw] of Object.entries(body.views as Record<string, unknown>)) {
    if (typeof zonesRaw !== "object" || zonesRaw === null) {
      return `La vista "${view}" no contiene un objeto de zonas.`;
    }
    const zones: Record<string, DraftZone> = {};

    for (const [zoneId, zoneRaw] of Object.entries(zonesRaw as Record<string, unknown>)) {
      if (typeof zoneRaw !== "object" || zoneRaw === null) {
        return `La zona "${zoneId}" de "${view}" no es un objeto.`;
      }
      const zone = zoneRaw as Record<string, unknown>;

      if (!Array.isArray(zone.points) || zone.points.length < 3) {
        return `La zona "${zoneId}" de "${view}" necesita al menos 3 puntos.`;
      }
      const points: Point[] = [];
      for (const pt of zone.points) {
        if (
          !Array.isArray(pt) ||
          pt.length !== 2 ||
          !Number.isFinite(pt[0]) ||
          !Number.isFinite(pt[1])
        ) {
          return `La zona "${zoneId}" de "${view}" tiene un punto inválido.`;
        }
        points.push([Number(pt[0]), Number(pt[1])]);
      }

      const cut = Number.isFinite(zone.cut) ? Number(zone.cut) : 0;

      let anchor: DraftZone["anchor"] = null;
      if (zone.anchor !== null && zone.anchor !== undefined) {
        const a = zone.anchor as Record<string, unknown>;
        if (!Number.isFinite(a.x) || !Number.isFinite(a.y)) {
          return `La zona "${zoneId}" de "${view}" tiene un ancla inválida.`;
        }
        anchor = { x: Number(a.x), y: Number(a.y) };
      }

      zones[zoneId] = { points, cut, anchor };
    }
    views[view] = zones;
  }

  return { version: 1, savedAt: new Date().toISOString(), views };
}

export async function GET() {
  if (blockedInProduction()) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    const raw = await fs.readFile(DRAFT_PATH, "utf8");
    return NextResponse.json(JSON.parse(raw) as Draft);
  } catch {
    // Todavía no hay borrador: no es un error, es el estado inicial.
    return NextResponse.json({ version: 1, views: {} });
  }
}

export async function POST(request: Request) {
  if (blockedInProduction()) {
    return new NextResponse(null, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const draft = parseDraft(body);
  if (typeof draft === "string") {
    return NextResponse.json({ error: draft }, { status: 400 });
  }

  await fs.writeFile(DRAFT_PATH, `${JSON.stringify(draft, null, 2)}\n`, "utf8");

  const zoneCount = Object.values(draft.views).reduce(
    (total, zones) => total + Object.keys(zones).length,
    0,
  );
  return NextResponse.json({ ok: true, savedAt: draft.savedAt, zoneCount });
}
