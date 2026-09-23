/* Enlace permanente de la seccion [ 06 ] PATROCINIO. Server Component:
   el copy de la cabecera lo resuelve <SubPageHero> desde el diccionario. */

import type { Metadata } from "next";

import SponsorshipSection from "@/components/SponsorshipSection";
import SubPageHero from "@/components/ui/SubPageHero";
import { BRAND } from "@/lib/constants";
import { availableSlots } from "@/lib/sponsors";

export const metadata: Metadata = {
  title: "Patrocinio",
  description: `${availableSlots().length} espacios de rotulacion disponibles en los coches de ${BRAND.name}. Elige tu zona sobre el plano del vehiculo y llevate tu marca al desierto.`,
};

export default function PatrocinioPage() {
  return (
    <main id="contenido" className="relative bg-bg-base">
      <SubPageHero section="sponsors" ridge="erg" mirrorRidge />
      <SponsorshipSection />
    </main>
  );
}
