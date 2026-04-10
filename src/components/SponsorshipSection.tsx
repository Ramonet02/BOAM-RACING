"use client";

import { useState } from "react";
import TopoButton from "@/components/ui/TopoButton";

type View = "lateral" | "frontal" | "trasera";

interface Zone {
  id: string;
  name: string;
  view: View;
  path: string;
}

const ZONES: Zone[] = [
  { id: "lat-capo", name: "Capó (Lateral)", view: "lateral", path: "M 30,120 L 120,110 L 115,130 L 25,135 Z" },
  { id: "lat-puerta-del", name: "Puerta Delantera", view: "lateral", path: "M 130,105 L 200,105 L 200,150 L 130,150 Z" },
  { id: "lat-puerta-tras", name: "Puerta Trasera", view: "lateral", path: "M 205,105 L 260,105 L 260,150 L 205,150 Z" },
  { id: "lat-aleta", name: "Aleta Trasera", view: "lateral", path: "M 265,105 L 340,110 L 340,140 L 265,145 Z" },
  { id: "lat-techo", name: "Techo", view: "lateral", path: "M 150,60 L 250,60 L 260,70 L 140,70 Z" },
  { id: "lat-cristal", name: "Cristal Trasero", view: "lateral", path: "M 255,65 L 290,100 L 270,100 L 245,65 Z" },
  { id: "front-capo", name: "Capó Frontal", view: "frontal", path: "M 80,80 L 320,80 L 340,140 L 60,140 Z" },
  { id: "front-parachoques", name: "Parachoques Del.", view: "frontal", path: "M 50,160 L 350,160 L 360,220 L 40,220 Z" },
  { id: "front-faro-izq", name: "Bajo Faro Izq.", view: "frontal", path: "M 60,145 L 120,145 L 120,155 L 60,155 Z" },
  { id: "front-faro-der", name: "Bajo Faro Der.", view: "frontal", path: "M 280,145 L 340,145 L 340,155 L 280,155 Z" },
  { id: "tras-maletero", name: "Maletero", view: "trasera", path: "M 100,100 L 300,100 L 320,160 L 80,160 Z" },
  { id: "tras-parachoques", name: "Parachoques Tras.", view: "trasera", path: "M 70,170 L 330,170 L 340,220 L 60,220 Z" },
];

const tiers = [
  { name: "EXPLORADOR", price: "350€", desc: "Logo en lateral" },
  { name: "DISCOVERY", price: "500€", desc: "Logo + redes", featured: true },
  { name: "ADVENTURE", price: "1,000€", desc: "Premium package" },
];

export default function SponsorshipSection() {
  const [currentView, setCurrentView] = useState<View>("lateral");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");

  const toggleZone = (id: string) => {
    setSelectedZones((prev) =>
      prev.includes(id) ? prev.filter(z => z !== id) : [...prev, id]
    );
  };

  const activeZones = ZONES.filter(z => z.view === currentView);
  const selectedZonesData = ZONES.filter(z => selectedZones.includes(z.id));

  return (
    <section id="patrocinio" className="relative w-full bg-[var(--color-bg-sand)] pb-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16">

        {/* Section Header */}
        <div className="mb-20">
          <span className="waypoint-tag block mb-4">SPONSORSHIP &middot; PARTNERSHIPS</span>
          <h2 className="font-heading text-[clamp(3rem,7vw,96px)] text-[var(--color-text-primary)] leading-[0.88] tracking-[2px] mb-6">
            JOIN THE<br />MACHINE
          </h2>
          <p className="font-body text-base text-[var(--color-text-secondary)] max-w-lg leading-[1.7]">
            Personaliza tu impacto. Selecciona las zonas estratégicas para que tu empresa nos acompañe en nuestra misión solidaria.
          </p>
        </div>

        {/* Nav Tabs */}
        <div className="flex items-center gap-12 mb-12 border-b border-[var(--color-border)]">
          {(["lateral", "frontal", "trasera"] as View[]).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`font-body text-sm uppercase tracking-[3px] pb-4 transition-all border-b-2 -mb-px ${
                currentView === view
                  ? "border-[var(--color-rust)] text-[var(--color-text-primary)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {view}
            </button>
          ))}
          <div className="ml-auto">
            <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-rust)] uppercase">Select Zone</span>
          </div>
        </div>

        {/* CONFIGURA TU PATROCINIO */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Car Visualizer */}
          <div className="w-full lg:w-2/3">
            <div className="relative w-full aspect-[21/9] bg-white border border-[var(--color-border)] overflow-hidden flex items-center justify-center p-8">
              <svg viewBox="0 0 400 200" className="w-full h-full z-10">
                <g className="opacity-30 stroke-[var(--color-text-primary)] stroke-[0.5] fill-none">
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

                {activeZones.map((zone) => {
                  const isSelected = selectedZones.includes(zone.id);
                  const isHovered = hoveredZone === zone.id;

                  return (
                    <path
                      key={zone.id}
                      d={zone.path}
                      className={`cursor-pointer transition-all duration-500 ${
                        isSelected
                          ? "fill-[var(--color-rust)] stroke-[var(--color-rust)] stroke-1 opacity-70"
                          : isHovered
                            ? "fill-[var(--color-rust)]/10 stroke-[var(--color-rust)] stroke-1 opacity-50"
                            : "fill-[var(--color-text-primary)]/5 stroke-[var(--color-border)] stroke-[0.5]"
                      }`}
                      onClick={() => toggleZone(zone.id)}
                      onMouseEnter={() => setHoveredZone(zone.id)}
                      onMouseLeave={() => setHoveredZone(null)}
                    />
                  );
                })}

                {companyName && (
                  <text
                    x="50%" y="45%"
                    textAnchor="middle"
                    className="font-heading text-4xl fill-[var(--color-text-primary)]/10 pointer-events-none select-none tracking-wider"
                  >
                    {companyName.toUpperCase()}
                  </text>
                )}
              </svg>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[var(--color-rust)] rounded-full animate-pulse"></div>
                <span className="font-mono text-[8px] text-[var(--color-text-secondary)] tracking-[3px] uppercase">Real-time simulation</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-1/3 bg-white border border-[var(--color-border)] p-8">
            <h3 className="font-heading text-3xl text-[var(--color-text-primary)] mb-8 tracking-wider">
              CONFIGURA TU<br />PATROCINIO
            </h3>

            <div className="space-y-8">
              <div>
                <label className="font-mono text-[9px] uppercase tracking-[3px] text-[var(--color-text-secondary)] block mb-3">Tu Marca</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="NOMBRE"
                  className="w-full bg-[var(--color-bg-sand)] border border-[var(--color-border)] px-4 py-3 text-[var(--color-text-primary)] font-body text-sm tracking-widest focus:outline-none focus:border-[var(--color-rust)] transition-colors placeholder:text-[var(--color-text-secondary)]/30"
                />
              </div>

              <div className="pt-6 border-t border-[var(--color-border)]">
                <span className="font-mono text-[9px] uppercase tracking-[3px] text-[var(--color-text-secondary)] block mb-3">Zonas ({selectedZones.length})</span>
                {selectedZones.length === 0 ? (
                  <p className="font-body text-xs text-[var(--color-text-secondary)] italic">Selecciona zonas en el visualizador...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedZonesData.map(zone => (
                      <div key={zone.id} className="bg-[var(--color-bg-sand)] border border-[var(--color-border)] px-3 py-1.5 flex items-center gap-2">
                        <span className="font-mono text-[9px] text-[var(--color-text-primary)] tracking-wider">{zone.name.toUpperCase()}</span>
                        <button onClick={() => toggleZone(zone.id)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-rust)] transition-colors text-xs">&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
              <TopoButton>
                <button
                  className={`w-full py-4 font-body uppercase tracking-[3px] text-xs font-semibold transition-all ${
                    selectedZones.length > 0
                      ? "bg-[var(--color-rust)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-dark)]"
                      : "bg-[var(--color-border)] text-[var(--color-text-secondary)] cursor-not-allowed"
                  }`}
                  disabled={selectedZones.length === 0}
                >
                  Solicitar Dossier
                </button>
              </TopoButton>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mt-32">
          <span className="waypoint-tag block mb-4">ELIGE TU NIVEL</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-8 border border-[var(--color-border)]">
            {tiers.map((tier, i) => (
              <div key={i} className={`p-8 ${i < tiers.length - 1 ? "border-r border-[var(--color-border)]" : ""} ${tier.featured ? "bg-[var(--color-rust)] text-[var(--color-text-light)]" : "bg-white"}`}>
                <span className={`font-mono text-[9px] tracking-[3px] block mb-3 ${tier.featured ? "text-white/60" : "text-[var(--color-text-secondary)]"}`}>{tier.name}</span>
                <span className={`font-heading text-4xl tracking-wider block mb-2 ${tier.featured ? "" : "text-[var(--color-text-primary)]"}`}>{tier.price}</span>
                <span className={`font-body text-sm ${tier.featured ? "text-white/70" : "text-[var(--color-text-secondary)]"}`}>{tier.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-32 py-16">
          <h3 className="font-heading text-[clamp(2.5rem,5vw,64px)] text-[var(--color-text-primary)] tracking-[2px] leading-[0.92]">
            TU MARCA<br />EN EL<br />DESIERTO
          </h3>
        </div>
      </div>
    </section>
  );
}
