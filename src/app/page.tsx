import HeroSection from "@/components/HeroSection";
import ProjectStory from "@/components/ProjectStory";
import UniRaidInfo from "@/components/UniRaidInfo";
import TimelineSection from "@/components/TimelineSection";
import ExpeditionPath from "@/components/ui/ExpeditionPath";
import TopoDivider from "@/components/ui/TopoDivider";

export default function Home() {
  return (
    <main className="relative bg-[var(--color-bg-sand)] overflow-hidden">
      {/* Global Background Expedition Path */}
      <ExpeditionPath />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. What is Uniraid */}
      <div className="relative">
        <ProjectStory />

        {/* Transition: sand → sand — topographic contour lines */}
        <TopoDivider
          type="atlas"
          extreme
          location="Atlas Mountains"
          coords="31°45'N · 7°05'W"
          altitude="2,167m"
        />

        {/* 3. The Machine */}
        <UniRaidInfo />

        {/* Transition: sand → sand — dune type */}
        <TopoDivider
          type="dunes"
          extreme
          location="Erg Chebbi"
          coords="31°09'N · 4°01'W"
          altitude="1,048m"
        />

        {/* 4. Timeline */}
        <TimelineSection />
      </div>
    </main>
  );
}
