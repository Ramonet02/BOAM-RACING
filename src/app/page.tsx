import HeroSection from "@/components/HeroSection";
import ProjectStory from "@/components/ProjectStory";
import UniRaidInfo from "@/components/UniRaidInfo";
import TimelineSection from "@/components/TimelineSection";
import ExpeditionPath from "@/components/ui/ExpeditionPath";

export default function Home() {
  return (
    <main className="relative bg-[var(--color-dark)] overflow-hidden">
      {/* Global Background Expedition Path */}
      <ExpeditionPath />

      {/* 1. Entry Point (Hero) */}
      <HeroSection />
      
      {/* 2. Story Sections */}
      <div className="relative">
        <ProjectStory />
        
        <div className="h-64 md:h-96"></div> {/* Journey segment */}
        
        <UniRaidInfo />
        
        <div className="h-64 md:h-96 rotate-180 opacity-20"></div> {/* Another gap */}
        
        <TimelineSection />
      </div>
    </main>
  );
}
