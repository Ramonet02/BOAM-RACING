"use client";

import { useState } from "react";
import TopoButton from "@/components/ui/TopoButton";
import TopoDivider from "@/components/ui/TopoDivider";

type View = "lateral" | "frontal" | "trasera";

interface Zone {
  id: string;
  name: string;
  view: View;
  path: string;
}

const ZONES: Zone[] = [
  // Lateral Zones
  { id: "lat-capo", name: "Capó (Lateral)", view: "lateral", path: "M 30,120 L 120,110 L 115,130 L 25,135 Z" },
  { id: "lat-puerta-del", name: "Puerta Delantera", view: "lateral", path: "M 130,105 L 200,105 L 200,150 L 130,150 Z" },
  { id: "lat-puerta-tras", name: "Puerta Trasera", view: "lateral", path: "M 205,105 L 260,105 L 260,150 L 205,150 Z" },
  { id: "lat-aleta", name: "Aleta Trasera", view: "lateral", path: "M 265,105 L 340,110 L 340,140 L 265,145 Z" },
  { id: "lat-techo", name: "Techo", view: "lateral", path: "M 150,60 L 250,60 L 260,70 L 140,70 Z" },
  { id: "lat-cristal", name: "Cristal Trasero", view: "lateral", path: "M 255,65 L 290,100 L 270,100 L 245,65 Z" },

  // Frontal Zones
  { id: "front-capo", name: "Capó Frontal", view: "frontal", path: "M 80,80 L 320,80 L 340,140 L 60,140 Z" },
  { id: "front-parachoques", name: "Parachoques Del.", view: "frontal", path: "M 50,160 L 350,160 L 360,220 L 40,220 Z" },
  { id: "front-faro-izq", name: "Bajo Faro Izq.", view: "frontal", path: "M 60,145 L 120,145 L 120,155 L 60,155 Z" },
  { id: "front-faro-der", name: "Bajo Faro Der.", view: "frontal", path: "M 280,145 L 340,145 L 340,155 L 280,155 Z" },

  // Trasera Zones
  { id: "tras-maletero", name: "Maletero", view: "trasera", path: "M 100,100 L 300,100 L 320,160 L 80,160 Z" },
  { id: "tras-parachoques", name: "Parachoques Tras.", view: "trasera", path: "M 70,170 L 330,170 L 340,220 L 60,220 Z" },
];

export default function SponsorshipSection() {
  const [currentView, setCurrentView] = useState<View>("lateral");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  
  // Form State
  const [companyName, setCompanyName] = useState("");

  const toggleZone = (id: string) => {
    setSelectedZones((prev) => 
      prev.includes(id) ? prev.filter(z => z !== id) : [...prev, id]
    );
  };

  const activeZones = ZONES.filter(z => z.view === currentView);
  const selectedZonesData = ZONES.filter(z => selectedZones.includes(z.id));

  return (
    <section id="patrocinio" className="relative w-full bg-[var(--color-dark)] pb-32 overflow-hidden noise-bg">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16">
        {/* Section Header */}
        <div className="text-center mb-24 animate-fade-up">
          <span className="font-body tracking-[0.4em] uppercase text-[var(--color-terracotta)] mb-4 text-xs font-bold">Patrocinio & Alianzas</span>
          <h2 className="font-display text-5xl md:text-8xl font-bold text-[var(--color-cream)]">
            Tu Marca en el <span className="text-gradient-sand italic">Desierto</span>
          </h2>
          <p className="font-body text-xl text-[var(--color-cream)]/50 mt-8 max-w-2xl mx-auto leading-relaxed">
            Personaliza tu impacto. Selecciona las zonas estratégicas para que tu empresa nos acompañe en nuestra misión solidaria.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start mt-12">
          
          {/* Left Column: Configurator - FLUID ROUNDED */}
          <div className="w-full lg:w-2/3 bg-white/5 border border-white/5 p-4 md:p-12 relative overflow-hidden rounded-[3rem]">
             {/* Tech grid texture */}
             <div className="absolute inset-0 opacity-[0.03] topo-bg pointer-events-none"></div>

            {/* View Selectors - ROUNDED PILLS */}
            <div className="flex justify-center space-x-6 mb-16 relative z-10">
              {(["lateral", "frontal", "trasera"] as View[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`font-body uppercase tracking-[0.2em] text-xs px-10 py-3.5 transition-all duration-500 rounded-full border ${
                    currentView === view 
                      ? "bg-[var(--color-terracotta)] border-[var(--color-terracotta)] text-white shadow-xl shadow-[var(--color-terracotta)]/20"
                      : "bg-transparent border-white/10 text-[var(--color-cream)]/40 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* SVG Visualizer - ROUNDED */}
            <div className="relative w-full aspect-[21/9] bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden flex items-center justify-center p-8 group transition-all duration-700">
              <div className="absolute inset-0 opacity-50 grainy-bg"></div>
              
              <svg viewBox="0 0 400 200" className="w-full h-full drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10">
                {/* Technical blueprint lines */}
                <g className="opacity-20 stroke-[var(--color-sand)] stroke-[0.5] fill-none transition-all duration-700">
                  {currentView === "lateral" && (
                    <path d="M 20,140 Q 20,100 60,90 L 120,80 L 160,50 L 250,50 L 300,80 L 350,90 Q 380,100 370,140 L 370,150 L 20,150 Z" />
                  )}
                  {currentView === "frontal" && (
                    <path d="M 50,140 Q 50,80 100,70 L 300,70 Q 350,80 350,140 L 360,200 L 40,200 Z" />
                  )}
                  {currentView === "trasera" && (
                    <path d="M 60,140 Q 60,90 100,80 L 300,80 Q 340,90 340,140 L 350,200 L 50,200 Z" />
                  )}
                </g>

                {/* Interactive Sponsor Zones */}
                {activeZones.map((zone) => {
                  const isSelected = selectedZones.includes(zone.id);
                  const isHovered = hoveredZone === zone.id;
                  
                  return (
                    <path
                      key={zone.id}
                      d={zone.path}
                      className={`cursor-pointer transition-all duration-700 scale-[0.8] origin-center ${
                        isSelected 
                          ? "fill-[var(--color-terracotta)] stroke-[var(--color-sand)] stroke-1 opacity-80" 
                          : isHovered
                            ? "fill-[var(--color-sand)]/20 stroke-[var(--color-sand)] stroke-1 opacity-50"
                            : "fill-white/5 stroke-white/10 stroke-[0.5]"
                      }`}
                      onClick={() => toggleZone(zone.id)}
                      onMouseEnter={() => setHoveredZone(zone.id)}
                      onMouseLeave={() => setHoveredZone(null)}
                    />
                  );
                })}

                {/* Text Preview on Car */}
                {companyName && (
                  <text 
                    x="50%" y="45%" 
                    textAnchor="middle" 
                    className="font-display font-black text-4xl fill-white/10 pointer-events-none select-none tracking-tighter"
                    style={{ filter: "blur(0.5px)" }}
                  >
                    {companyName.toUpperCase()}
                  </text>
                )}
              </svg>

              {/* HUD / Indicators */}
              <div className="absolute top-8 left-8 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[var(--color-terracotta)] rounded-full animate-pulse"></div>
                    <span className="font-body text-[8px] text-[var(--color-sand)] tracking-[0.4em] uppercase">Simulación en tiempo real</span>
                 </div>
                 <span className="font-body text-[10px] text-white/20 tracking-widest">{currentView.toUpperCase()} MODE VISUALIZER v1.0</span>
              </div>
            </div>
          </div>

          {/* Right Column: Panel - ROUNDED */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white/5 border border-white/5 p-12 flex flex-col h-full rounded-[2.5rem]">
              <h3 className="font-display text-4xl text-[var(--color-cream)] mb-10">
                Panel de <span className="text-[var(--color-terracotta)] italic">Impacto</span>
              </h3>
              
              <div className="space-y-10 flex-grow">
                <div>
                  <label className="font-body text-[10px] uppercase tracking-[0.3em] text-[var(--color-sand)] font-bold block mb-4">Tu Identidad Visual</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="NOMBRE DE TU MARCA" 
                    className="w-full bg-black/40 border border-white/10 px-8 py-5 text-[var(--color-cream)] font-body text-sm tracking-widest focus:outline-none focus:border-[var(--color-terracotta)] transition-all placeholder:text-white/10 rounded-2xl"
                  />
                </div>

                <div className="pt-8 border-t border-white/5">
                  <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[var(--color-sand)] font-bold block mb-5">Zonas Reservadas ({selectedZones.length})</span>
                  {selectedZones.length === 0 ? (
                    <p className="font-body text-xs text-white/20 italic">Selecciona espacios en el visualizador...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedZonesData.map(zone => (
                        <div key={zone.id} className="bg-white/5 border border-white/10 px-5 py-2.5 flex items-center gap-3 rounded-full">
                           <span className="font-body text-[9px] text-white/70 tracking-widest font-bold">{zone.name.toUpperCase()}</span>
                           <button onClick={() => toggleZone(zone.id)} className="text-white/20 hover:text-[var(--color-terracotta)] transition-colors text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-white/5">
                 <button
                    className={`w-full py-6 font-body uppercase tracking-[0.4em] text-xs font-black transition-all duration-700 flex items-center justify-center gap-4 rounded-full shadow-2xl ${
                      selectedZones.length > 0
                        ? "bg-[var(--color-terracotta)] hover:bg-[var(--color-cream)] text-white hover:text-black shadow-[var(--color-terracotta)]/30"
                        : "bg-white/5 text-white/20 cursor-not-allowed"
                    }`}
                    disabled={selectedZones.length === 0}
                  >
                    <span>Solicitar Dossier</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
