"use client";

import { motion } from "framer-motion";

const routeStages = [
  { from: "Biarritz", to: "Tarifa", km: "1,200", terrain: "Highway", code: "ESP-01" },
  { from: "Tarifa", to: "Nador", km: "Ferry", terrain: "Sea crossing", code: "MAR-00" },
  { from: "Nador", to: "Merzouga", km: "2,400", terrain: "Atlas passes", code: "MAR-01" },
  { from: "Merzouga", to: "Marrakech", km: "2,600", terrain: "Desert + dunes", code: "MAR-02" },
];

const phases = [
  { num: "01", title: "THE FLEET", desc: "Acquiring and testing the 4 cars", color: "rust" as const },
  { num: "02", title: "THE BUILD", desc: "Mechanical preparation and safety mods", color: "rust" as const },
  { num: "03", title: "SPONSORSHIPS", desc: "Gathering funds and charity goods", color: "moss" as const },
  { num: "04", title: "THE START LINE", desc: "February departure to Morocco", color: "moss" as const },
];

export default function TimelineSection() {
  return (
    <section id="timeline" className="relative w-full overflow-hidden bg-[var(--color-bg-sand)]">

      {/* ── THE ROUTE ── */}
      <div className="py-40">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

          <span className="waypoint-tag block mb-6">[ 03 ]  THE ROUTE</span>
          <div className="w-[520px] max-w-full h-px bg-[var(--color-border)] mb-6"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

            {/* Left: Title + Stages */}
            <div>
              <h2 className="font-heading text-[clamp(3rem,6vw,80px)] text-[var(--color-text-primary)] leading-[0.9] tracking-[3px] mb-12">
                THE JOURNEY<br />
                ACROSS<br />
                MOROCCO
              </h2>

              {/* Route Log Table */}
              <div className="relative border-l-[3px] border-[var(--color-rust)]">
                {/* Column headers */}
                <div className="flex items-center px-4 py-2 border-b border-[var(--color-border)]">
                  <span className="w-8 font-mono text-[8px] tracking-[3px] text-[var(--color-text-secondary)] flex-shrink-0">#</span>
                  <span className="flex-1 font-mono text-[8px] tracking-[3px] text-[var(--color-text-secondary)] pl-4">ETAPA</span>
                  <span className="w-28 font-mono text-[8px] tracking-[3px] text-[var(--color-text-secondary)] text-right hidden md:block">TERRENO</span>
                  <span className="w-20 font-mono text-[8px] tracking-[3px] text-[var(--color-text-secondary)] text-right">KM</span>
                </div>

                {/* Stage rows */}
                {routeStages.map((stage, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="group flex items-center px-4 py-5 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-dark)]/4 transition-colors duration-200"
                  >
                    <span className="w-8 font-mono text-[9px] tracking-[2px] text-[var(--color-text-secondary)] flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 flex items-center gap-3 pl-4">
                      <span className="font-heading text-[clamp(1rem,2vw,1.25rem)] text-[var(--color-text-primary)] tracking-wider">
                        {stage.from}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--color-rust)]">→</span>
                      <span className="font-heading text-[clamp(1rem,2vw,1.25rem)] text-[var(--color-text-primary)] tracking-wider">
                        {stage.to}
                      </span>
                    </div>
                    <span className="w-28 font-mono text-[8px] tracking-[2px] text-[var(--color-text-secondary)] uppercase text-right hidden md:block">
                      {stage.terrain}
                    </span>
                    <span className="w-20 font-heading text-lg text-[var(--color-rust)] text-right">
                      {stage.km}
                    </span>
                  </motion.div>
                ))}

                {/* Total row */}
                <div className="flex items-center px-4 py-5 bg-[var(--color-bg-dark)]/6">
                  <span className="w-8 flex-shrink-0"></span>
                  <span className="flex-1 font-mono text-[10px] tracking-[4px] text-[var(--color-text-secondary)] pl-4 uppercase">
                    Total
                  </span>
                  <span className="font-heading text-2xl text-[var(--color-rust)]">6,200 KM</span>
                </div>
              </div>

              {/* Coords footnote */}
              <p className="gps-label mt-4">
                Erg Chebbi, Merzouga &nbsp;&middot;&nbsp; 31°08&apos;N 3°58&apos;W &nbsp;&middot;&nbsp; ALT 840m
              </p>
            </div>

            {/* Right: Map placeholder */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                className="relative w-full aspect-[4/5] overflow-hidden border border-[var(--color-border)]"
              >
                {/* Topographic grid */}
                <div className="absolute inset-0 topo-bg opacity-60 bg-[var(--color-bg-dark)]/8"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="font-mono text-[8px] tracking-[5px] text-[var(--color-text-secondary)] uppercase">Route Map</span>
                  <div className="w-8 h-px bg-[var(--color-rust)]"></div>
                  <span className="gps-label">Morocco 2027</span>
                </div>

                {/* Corner markers */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[var(--color-rust)]/50"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[var(--color-rust)]/50"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[var(--color-rust)]/50"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[var(--color-rust)]/50"></div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute -left-12 top-1/4 hidden xl:block">
          <span className="side-label">03 — THE ROUTE</span>
        </div>
      </div>

      {/* ── MILESTONE CHRONOLOGY ── */}
      <div className="py-40 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

          <span className="waypoint-tag block mb-6">[ 04 ]  MILESTONE CHRONOLOGY</span>
          <div className="w-[520px] max-w-full h-px bg-[var(--color-border)] mb-6"></div>

          <h2 className="font-heading text-[clamp(3rem,5vw,72px)] text-[var(--color-text-primary)] leading-[0.92] tracking-[2px] mb-16">
            FROM GARAGE<br />
            TO START LINE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-0 border-t border-[var(--color-border)]">
            {phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="group border-b border-[var(--color-border)] py-8 flex items-start gap-6 hover:bg-[var(--color-bg-dark)]/3 px-2 transition-colors duration-200"
              >
                {/* Phase number accent */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
                  <div className={`w-[2px] h-10 ${
                    phase.color === "rust" ? "bg-[var(--color-rust)]" : "bg-[var(--color-moss)]"
                  }`}></div>
                  <span className={`font-mono text-[8px] tracking-[2px] ${
                    phase.color === "rust" ? "text-[var(--color-rust)]" : "text-[var(--color-moss)]"
                  }`}>
                    {phase.num}
                  </span>
                </div>

                <div>
                  <span className={`font-mono text-[9px] tracking-[4px] font-semibold block mb-2 ${
                    phase.color === "rust" ? "text-[var(--color-rust)]" : "text-[var(--color-moss)]"
                  }`}>
                    PHASE {phase.num}
                  </span>
                  <span className="font-heading text-[28px] text-[var(--color-text-primary)] tracking-[2px] block leading-[0.95] mb-2">
                    {phase.title}
                  </span>
                  <span className="font-body text-[11px] text-[var(--color-text-secondary)] tracking-[1px] block">
                    {phase.desc}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute right-0 top-1/4 hidden xl:block">
          <span className="side-label">04 — CHRONOLOGY</span>
        </div>
      </div>
    </section>
  );
}
