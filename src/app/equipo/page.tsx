import TeamSection from "@/components/TeamSection";
import SubPageHero from "@/components/ui/SubPageHero";

export default function EquipoPage() {
  return (
    <main>
      <SubPageHero 
        title="EL EQUIPO"
        subtitle="Cruzando el Corazón del Atlas"
        location="Paso de Tizi n'Tichka"
        coords="31.2825° N, 7.3811° W"
        altitude="2,260m"
        topoType="atlas"
        extreme={true}
        bgImage="https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=2070"
      />
      <TeamSection />
    </main>
  );
}
