"use client";

import Image from "next/image";
import TopoDivider from "@/components/ui/TopoDivider";

const teams = [
  {
    id: "01",
    car: { model: "Ford Escort MK7", year: "1997", progress: 85 },
    pilots: [
      { name: "Marc", role: "Piloto" },
      { name: "Albert", role: "Copiloto" }
    ]
  },
  {
    id: "02",
    car: { model: "Ford Escort MK7", year: "1998", progress: 60 },
    pilots: [
      { name: "Pol", role: "Piloto" },
      { name: "Joan", role: "Copiloto" }
    ]
  },
  {
    id: "03",
    car: { model: "Ford Escort MK7", year: "1997", progress: 40 },
    pilots: [
      { name: "Carlos", role: "Piloto" },
      { name: "David", role: "Copiloto" }
    ]
  },
  {
    id: "04",
    car: { model: "Ford Escort MK7", year: "1999", progress: 25 },
    pilots: [
      { name: "Alex", role: "Piloto" },
      { name: "Sergi", role: "Copiloto" }
    ]
  }
];

export default function TeamSection() {
  return (
    <section id="equipo" className="relative w-full bg-[var(--color-dark)] pb-32 overflow-hidden noise-bg">
      {/* Background patterns */}
      <div className="absolute inset-0 topo-bg opacity-10 mix-blend-overlay pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-0">
        {/* Team Zig-Zag Units */}
        <div className="space-y-40 md:space-y-64 mt-20">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-16 lg:gap-24 relative`}
            >
              {/* Topographic Route Line connecting teams */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-px h-64 bg-gradient-to-b from-transparent via-[var(--color-terracotta)]/20 to-transparent hidden lg:block"></div>

              {/* Background Car Number Backdrop */}
              <div 
                className={`absolute top-0 ${index % 2 === 0 ? "left-0" : "right-0"} -translate-y-1/2 opacity-[0.03] select-none pointer-events-none`}
              >
                <span className="font-display text-[25rem] font-black italic text-[var(--color-cream)]">
                  {team.id}
                </span>
              </div>

              {/* Car Side - "The Machine" */}
              <div className="w-full lg:w-1/2 flex flex-col group">
                <div 
                  className="relative aspect-[16/9] bg-gradient-to-br from-[var(--color-olive-dark)] to-[var(--color-dark)] border border-[var(--color-olive)]/30 overflow-hidden shadow-2xl mask-erosion"
                >
                  {/* Car Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-9xl font-black text-white/5 italic">
                      {team.id}
                    </span>
                    <div className="absolute inset-0 topo-bg opacity-20 group-hover:scale-110 transition-transform duration-1000"></div>
                  </div>
                  
                  {/* Label Overlay */}
                  <div className="absolute bottom-10 left-10 z-10">
                     <span className="font-body text-[10px] tracking-[0.3em] text-[var(--color-terracotta)] uppercase mb-2 block font-bold">Unidad de Rally</span>
                    <h3 className="font-display text-3xl md:text-4xl text-[var(--color-cream)] uppercase tracking-wider">
                      {team.car.model}
                    </h3>
                  </div>
                </div>

                {/* Car Spec & Progress Bar */}
                <div className="mt-10 px-6 lg:px-10">
                  <div className="flex justify-between items-end mb-6">
                    <div className="flex flex-col">
                      <span className="font-body text-xs tracking-widest text-[var(--color-sand)]/60 uppercase mb-1">Geolocalización</span>
                      <span className="font-body text-lg text-[var(--color-cream)]/70 italic">Sector High Atlas</span>
                    </div>
                    <div className="text-right">
                      <span className="font-body text-[8px] tracking-[0.3em] uppercase text-[var(--color-cream)]/40 mb-1 block leading-none">Preparación</span>
                      <span className="font-display text-3xl text-[var(--color-terracotta)] font-bold">{team.car.progress}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar UI */}
                  <div className="h-1 w-full bg-[var(--color-cream)]/10 relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[var(--color-terracotta)] transition-all duration-1000 ease-out delay-500"
                      style={{ width: `${team.car.progress}%` }}
                    >
                      <div className="absolute inset-0 w-1/2 bg-white/10 skew-x-12 animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pilots Side - "The Crew" */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center gap-10">
                <div className="flex items-center gap-6 mb-2">
                  <h4 className="font-display text-3xl text-[var(--color-cream)] shrink-0">
                    La <span className="text-[var(--color-terracotta)] italic">Tripulación</span>
                  </h4>
                  <div className="h-px bg-gradient-to-r from-[var(--color-sand)]/20 to-transparent w-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {team.pilots.map((pilot, pIdx) => (
                    <div 
                      key={pIdx}
                      className="group relative bg-white/5 border border-white/10 p-8 hover:bg-white/[0.08] hover:border-[var(--color-sand)]/30 transition-all duration-500"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)" }}
                    >
                      {/* Pilot identity circle */}
                      <div 
                        className="w-14 h-14 rounded-none border border-white/10 flex items-center justify-center mb-6 bg-black/40 group-hover:border-[var(--color-terracotta)] transition-colors"
                        style={{ clipPath: "polygon(20% 0, 100% 0, 80% 100%, 0% 100%)" }}
                      >
                        <span className="font-display text-xl text-[var(--color-cream)] font-bold">
                          {pilot.name.charAt(0)}
                        </span>
                      </div>

                      <h5 className="font-display text-2xl text-[var(--color-cream)] mb-1 group-hover:text-[var(--color-sand)] transition-colors">
                        {pilot.name}
                      </h5>
                      <p className="font-body text-sm tracking-[0.2em] text-[var(--color-terracotta)] uppercase font-semibold">
                        {pilot.role}
                      </p>
                      
                      {/* Profile details */}
                      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[10px] tracking-widest text-[var(--color-cream)]/40 uppercase">
                          <span>Especialidad</span>
                          <span className="text-[var(--color-sand)]">{pIdx === 0 ? "Mecánica" : "Navegación"}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] tracking-widest text-[var(--color-cream)]/40 uppercase">
                          <span>Estado</span>
                          <span className="text-emerald-500/60">Listo</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
