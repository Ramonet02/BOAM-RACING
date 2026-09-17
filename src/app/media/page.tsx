/* Enlace permanente de la seccion [ 07 ] MEDIA. Server Component:
   el copy de la cabecera lo resuelve <SubPageHero> desde el diccionario. */

import type { Metadata } from "next";

import MediaSection from "@/components/MediaSection";
import SubPageHero from "@/components/ui/SubPageHero";
import { BRAND } from "@/lib/constants";
import { ROUTE_SUMMARY } from "@/lib/route";

export const metadata: Metadata = {
  title: "Media",
  description: `Archivo visual de ${BRAND.name}: galeria, video y redes de los ${ROUTE_SUMMARY.totalDays} dias de travesia por Marruecos.`,
};

export default function MediaPage() {
  return (
    <main id="contenido" className="relative bg-bg-base">
      <SubPageHero section="media" imageId="portada-media" ridge="erg" />
      <MediaSection />
    </main>
  );
}
