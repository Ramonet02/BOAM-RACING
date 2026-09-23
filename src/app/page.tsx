/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — Home
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   NUMERACION DE SECCIONES — una sola serie, unica y correlativa.
   Los indices no se escriben en ningun componente: cada seccion rotula su
   `t.<seccion>.waypoint`, y el diccionario reparte la serie una sola vez:

       [ 01 ]  El proyecto      <ProjectStory />      #proyecto   (home)
       [ 02 ]  Los coches       <UniRaidInfo />       #uniraid    (home)
       [ 03 ]  La ruta          <TimelineSection />   #ruta       (home)
       [ 04 ]  Cronologia       <TimelineSection />   #cronologia (home)
       [ 05 ]  El equipo        <TeamSection />       /equipo
       [ 06 ]  Patrocinio       <SponsorshipSection />/patrocinio
       [ 07 ]  Media            <MediaSection />      /media
       [ 08 ]  Unete            <FooterSection />     (en el layout)

   La home termina en la ruta (01→04). Equipo, patrocinio y media viven SOLO
   en sus paginas, cada una con su propia cabecera; la navegacion ya enlaza
   ahi, no a anclas de la home.

   Sin `overflow-hidden` en el <main> a proposito: ese overflow rompia el
   `position: sticky` de la columna del mapa del roadbook (Modulo 3). Cada
   seccion ya recorta lo suyo.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import HeroSection from "@/components/HeroSection";
import ProjectStory from "@/components/ProjectStory";
import UniRaidInfo from "@/components/UniRaidInfo";
import TimelineSection from "@/components/TimelineSection";
import RidgeDivider from "@/components/ui/RidgeDivider";

export default function Home() {
  return (
    <main id="contenido" className="relative bg-bg-base">
      {/* El hero ya cierra con su propia <RidgeDivider>. */}
      <HeroSection />

      {/* [ 01 ] */}
      <ProjectStory />

      {/* [ 02 ] */}
      <UniRaidInfo />

      <RidgeDivider variant="erg" depth={2} mirror toColor="var(--color-bg-base)" height={96} />

      {/* [ 03 ] + [ 04 ] */}
      <TimelineSection />

      <RidgeDivider depth={2} toColor="var(--color-bg-base)" height={96} />
    </main>
  );
}
