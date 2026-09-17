/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — Home
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   NUMERACION DE SECCIONES — una sola serie, unica y correlativa.
   Antes habia DOS "[ 04 ]" (cronologia y footer) porque el footer escribia
   su indice a mano. Los indices ya no se escriben en ningun componente:
   cada seccion rotula su `t.<seccion>.waypoint`, y el diccionario reparte
   la serie completa una sola vez:

       [ 01 ]  El proyecto      <ProjectStory />      #proyecto
       [ 02 ]  Los coches       <UniRaidInfo />       #uniraid
       [ 03 ]  La ruta          <TimelineSection />   #ruta
       [ 04 ]  Cronologia       <TimelineSection />   #cronologia
       [ 05 ]  El equipo        <TeamSection />       #equipo
       [ 06 ]  Patrocinio       <SponsorshipSection />#patrocinio
       [ 07 ]  Media            <MediaSection />      #media
       [ 08 ]  Unete            <FooterSection />     (en el layout)

   Por eso la home monta la serie ENTERA 01→07 y el footer cierra con 08:
   asi la numeracion que ve el visitante es 01,02,03,04,05,06,07,08 sin
   huecos ni repeticiones. Las paginas /equipo, /patrocinio y /media son
   los enlaces permanentes de las secciones 05, 06 y 07 con su propia
   cabecera; comparten componente, asi que no hay copy duplicado.

   Sin `overflow-hidden` en el <main> a proposito: ese overflow rompia el
   `position: sticky` de la columna del mapa del roadbook (Modulo 3). Cada
   seccion ya recorta lo suyo.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import HeroSection from "@/components/HeroSection";
import ProjectStory from "@/components/ProjectStory";
import UniRaidInfo from "@/components/UniRaidInfo";
import TimelineSection from "@/components/TimelineSection";
import TeamSection from "@/components/TeamSection";
import SponsorshipSection from "@/components/SponsorshipSection";
import MediaSection from "@/components/MediaSection";
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

      {/* [ 05 ] */}
      <TeamSection />

      {/* [ 06 ] */}
      <SponsorshipSection />

      {/* [ 07 ] */}
      <MediaSection />
    </main>
  );
}
