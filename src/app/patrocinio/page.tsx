import SponsorshipSection from "@/components/SponsorshipSection";
import SubPageHero from "@/components/ui/SubPageHero";

export default function PatrocinioPage() {
  return (
    <main>
      <SubPageHero 
        title="PATROCINIO"
        subtitle="Las Puertas del Desierto"
        location="Gargantas del Todra"
        coords="31.5518° N, 5.5947° W"
        altitude="1,350m"
        topoType="gorges"
        extreme={true}
        bgImage="https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=2070"
      />
      <SponsorshipSection />
    </main>
  );
}
