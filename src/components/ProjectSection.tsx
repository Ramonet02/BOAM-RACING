"use client";

import { useEffect, useRef, useState } from "react";
import TopoButton from "@/components/ui/TopoButton";

// Hook for counting up animation
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return { count, nodeRef };
}

const StatCounter = ({ label, target, suffix = "" }: { label: string, target: number, suffix?: string }) => {
  const { count, nodeRef } = useCountUp(target);
  
  return (
    <div ref={nodeRef} className="flex flex-col border-l-2 border-[var(--color-terracotta)] pl-4 py-1">
      <span className="font-display text-4xl md:text-5xl text-[var(--color-sand)] font-bold mb-1">
        {count}{suffix}
      </span>
      <span className="font-body text-sm md:text-base uppercase tracking-widest text-[var(--color-cream)]/70">
        {label}
      </span>
    </div>
  );
};

export default function ProjectSection() {
  return (
    <section id="proyecto" className="relative w-full bg-[var(--color-dark)] pt-32 pb-24">
      {/* Separator - Top */}
      <div className="absolute top-0 left-0 w-full h-16 moroccan-bg opacity-20 pointer-events-none"></div>
      <div className="absolute top-16 left-0 w-full h-px topo-bg opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="mb-16 md:mb-24 relative">
          <h2 className="font-display text-5xl md:text-7xl font-bold text-[var(--color-cream)]">
            El <span className="text-gradient-sand italic">Proyecto</span>
          </h2>
          <div className="absolute -bottom-6 left-0 w-32 h-[2px] bg-[var(--color-terracotta)] drop-shadow-[0_0_8px_var(--color-terracotta)]"></div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Text & Counters */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <p className="font-body text-xl md:text-2xl text-[var(--color-sand)] tracking-wide leading-relaxed">
                Boam Racing participa en Uniraid 2027: un gran rally solidario exclusivo para estudiantes.
              </p>
              <p className="font-body text-lg text-[var(--color-cream)]/80 leading-relaxed font-light">
                No es una carrera de velocidad, es un viaje-aventura en el que los participantes debemos completar 7 etapas navegando con roadbook, y superar todo tipo de obstáculos, desafíos y pruebas, con el objetivo de cruzar Marruecos de norte a sur y entregar material solidario en las aldeas del desierto.
              </p>
              <p className="font-body text-lg text-[var(--color-cream)]/80 leading-relaxed font-light">
                Transportaremos material escolar, logístico y ropa de abrigo a través del Atlas hasta las dunas del Erg Chebbi, utilizando vehículos de más de 20 años que nosotros mismos preparamos y adaptamos.
              </p>
            </div>

            {/* Counters Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 pt-8 border-t border-[var(--color-sand)]/20">
              <StatCounter label="Días de Rally" target={9} />
              <StatCounter label="Kilómetros" target={2500} suffix="+" />
              <StatCounter label="Aldeas" target={15} suffix="+" />
              <StatCounter label="Coches" target={4} />
            </div>
            
            <div className="pt-6">
              <TopoButton>
                <button
                  className="px-8 py-4 border border-[var(--color-terracotta)] text-[var(--color-terracotta)] hover:bg-[var(--color-terracotta)] hover:text-[var(--color-dark)] font-body uppercase tracking-widest text-sm font-bold transition-colors"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 5% 100%, 0 85%)" }}
                >
                  Descargar Dossier
                </button>
              </TopoButton>
            </div>
          </div>

          {/* Right Column: Visuals & Masonry */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[200px]">
              
              {/* Highlight Item - Expands 2 columns and 2 rows on md */}
              <div className="group relative rounded-sm md:col-span-2 md:row-span-2 overflow-hidden bg-[var(--color-olive-dark)]">
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-all duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center p-8 z-20">
                  <span className="font-body uppercase tracking-widest text-[var(--color-cream)]/50 border border-dashed border-[var(--color-cream)]/30 px-6 py-4">Foto: Preparación de coches</span>
                </div>
                {/* Simulated image background */}
                <div className="absolute inset-0 topo-bg opacity-30 mix-blend-overlay scale-110 group-hover:scale-100 transition-transform duration-700"></div>
              </div>

              {/* Grid Items */}
              <div className="group relative rounded-sm overflow-hidden bg-[var(--color-earth-red)]">
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-all duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center p-4 z-20 text-center">
                  <span className="font-body text-sm uppercase tracking-widest text-[var(--color-cream)]/50">Foto: Entrenamientos</span>
                </div>
              </div>

              <div className="group relative rounded-sm overflow-hidden bg-[var(--color-terracotta)]">
                 <div className="absolute inset-0 flex items-center justify-center p-4 z-20 text-center">
                  <span className="font-body text-sm uppercase tracking-widest text-[var(--color-dark)]/70">Foto: Logística y Material</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Communications / News Section */}
        <div className="mt-24 md:mt-32">
          <h3 className="font-display text-3xl md:text-4xl text-[var(--color-sand)] mb-10 pl-6 border-l-2 border-[var(--color-olive)]">
            Comunicaciones & Hitos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { date: "Octubre 2026", title: "Adquisición de los 4 Ford Escort", cat: "PROYECTO" },
              { date: "Noviembre 2026", title: "Inicio de la recaudación de material escolar", cat: "SOLIDARIO" },
              { date: "Diciembre 2026", title: "Primeras pruebas en terreno off-road", cat: "MOTOR" }
            ].map((item, idx) => (
              <div key={idx} className="group flex flex-col justify-between p-8 bg-[var(--color-olive-dark)]/10 border border-[var(--color-olive-dark)] hover:border-[var(--color-sand)]/50 transition-colors relative overflow-hidden h-64 cursor-pointer">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[var(--color-terracotta)]/20 to-transparent pointer-events-none"></div>
                
                <div>
                  <span className="font-body text-xs tracking-[0.2em] text-[var(--color-terracotta)] uppercase mb-4 block">
                    {item.cat}
                  </span>
                  <h4 className="font-display text-2xl text-[var(--color-cream)] leading-snug group-hover:text-[var(--color-sand)] transition-colors">
                    {item.title}
                  </h4>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--color-cream)]/10">
                  <span className="font-body text-sm tracking-wider text-[var(--color-cream)]/50">
                    {item.date}
                  </span>
                  <svg className="w-5 h-5 text-[var(--color-terracotta)] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
