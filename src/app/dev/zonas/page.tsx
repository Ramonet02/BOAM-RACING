/* ══════════════════════════════════════════════════════════════════════════
   TEMPORAL · Página del editor visual de zonas
   --------------------------------------------------------------------------
   Sólo existe en desarrollo. BÓRRALA junto con `src/app/api/dev/` y
   `src/components/dev/` cuando las zonas estén dadas por buenas.
   ══════════════════════════════════════════════════════════════════════════ */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ZoneEditor from "@/components/dev/ZoneEditor";

/** Que no se indexe ni aparezca en ningún sitio. */
export const metadata: Metadata = {
  title: "Editor de zonas · BOAM RACING",
  robots: { index: false, follow: false },
};

export default function ZonasDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ZoneEditor />;
}
