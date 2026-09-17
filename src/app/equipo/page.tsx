/* Enlace permanente de la seccion [ 05 ] EL EQUIPO. Server Component:
   el copy de la cabecera lo resuelve <SubPageHero> desde el diccionario,
   asi que esta pagina solo declara estructura y metadatos. */

import type { Metadata } from "next";

import TeamSection from "@/components/TeamSection";
import SubPageHero from "@/components/ui/SubPageHero";
import { BRAND, PROJECT_FACTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "El Equipo",
  description: `Las ${PROJECT_FACTS.crews} tripulaciones de ${BRAND.name}: ${PROJECT_FACTS.teamSize} estudiantes de ${BRAND.city} y ${PROJECT_FACTS.fleetSize} Ford Escort preparados para el raid.`,
};

export default function EquipoPage() {
  return (
    <main id="contenido" className="relative bg-bg-base">
      <SubPageHero section="team" imageId="portada-equipo" ridge="atlas" />
      <TeamSection />
    </main>
  );
}
