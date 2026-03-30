import MediaSection from "@/components/MediaSection";
import SubPageHero from "@/components/ui/SubPageHero";

export default function MediaPage() {
  return (
    <main>
      <SubPageHero 
        title="MEDIA HUB"
        subtitle="Crónicas desde las Dunas"
        location="Erg Chebbi"
        coords="31.1311° N, 3.9830° W"
        altitude="760m"
        topoType="dunes"
        extreme={true}
        bgImage="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=2070"
      />
      <MediaSection />
    </main>
  );
}
