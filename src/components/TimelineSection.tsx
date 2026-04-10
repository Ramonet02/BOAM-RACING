"use client";

import { motion } from "framer-motion";

const routeStages = [
  { from: "Biarritz", to: "Tarifa", km: "1,200", terrain: "Highway" },
  { from: "Tarifa", to: "Nador", km: "Ferry", terrain: "Sea crossing" },
  { from: "Nador", to: "Merzouga", km: "2,400", terrain: "Atlas passes" },
  { from: "Merzouga", to: "Marrakech", km: "2,600", terrain: "Desert + dunes" },
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
          {/* Waypoint Tag */}
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

              {/* Route Stages Table */}
              <div className="flex flex-col gap-0">
                {routeStages.map((stage, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className="flex items-center justify-between px-4 py-5 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-xl mb-0 -mt-px"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-lg text-[var(--color-text-primary)] tracking-wider">{stage.from}</span>
                      <span className="font-mono text-xs text-[var(--color-text-secondary)]">-&gt;</span>
                      <span className="font-heading text-lg text-[var(--color-text-primary)] tracking-wider">{stage.to}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-[var(--color-text-secondary)] tracking-wider">{stage.terrain}</span>
                      <span className="font-heading text-lg text-[var(--color-rust)]">{stage.km}</span>
                    </div>
                  </motion.div>
                ))}
                {/* Total Row */}
                <div className="flex items-center justify-between px-4 py-6 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-xl -mt-px">
                  <span className="font-heading text-lg text-[var(--color-text-primary)] tracking-wider">TOTAL</span>
                  <span className="font-heading text-2xl text-[var(--color-rust)]">6,200 KM</span>
                </div>
              </div>
            </div>

            {/* Right: Map Image */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                className="relative w-full aspect-[4/5] overflow-hidden shadow-[0_20px_48px_rgba(42,37,34,0.2)]"
              >
                <div className="w-full h-full bg-[var(--color-bg-dark)]/10 flex items-center justify-center">
                  <span className="font-mono text-sm text-[var(--color-text-secondary)] tracking-wider">Route Map</span>
                </div>
              </motion.div>
              <p className="gps-label mt-4 leading-[1.8]">
                Erg Chebbi, Merzouga<br />
                31&deg;08&apos;N &nbsp;3&deg;58&apos;W &middot; ALT 840m
              </p>
            </div>
          </div>
        </div>

        {/* Side Label */}
        <div className="absolute -left-12 top-1/4 hidden xl:block">
          <span className="side-label">03 — THE ROUTE</span>
        </div>
      </div>

      {/* ── MILESTONE CHRONOLOGY ── */}
      <div className="py-40 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          {/* Waypoint Tag */}
          <span className="waypoint-tag block mb-6">[ 04 ]  MILESTONE CHRONOLOGY</span>
          <div className="w-[520px] max-w-full h-px bg-[var(--color-border)] mb-6"></div>

          <h2 className="font-heading text-[clamp(3rem,5vw,72px)] text-[var(--color-text-primary)] leading-[0.92] tracking-[2px] mb-16">
            FROM GARAGE<br />
            TO START LINE
          </h2>

          {/* Phases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12">
            {phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="flex items-start gap-4"
              >
                {/* Dot + Line */}
                <div className="flex items-center gap-3 mt-2 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${
                    phase.color === "rust" ? "bg-[var(--color-rust)]" : "bg-[var(--color-moss)]"
                  }`}></div>
                  <div className={`w-10 h-px ${
                    phase.color === "rust" ? "bg-[var(--color-rust)]/30" : "bg-[var(--color-moss)]/30"
                  }`}></div>
                </div>

                <div>
                  <span className={`font-mono text-[10px] tracking-[3px] font-semibold block mb-1 ${
                    phase.color === "rust" ? "text-[var(--color-rust)]" : "text-[var(--color-moss)]"
                  }`}>
                    PHASE {phase.num}
                  </span>
                  <span className="font-heading text-[28px] text-[var(--color-text-primary)] tracking-[2px] block">
                    {phase.title}
                  </span>
                  <span className="font-body text-[11px] text-[var(--color-text-secondary)] tracking-[1px] block mt-1">
                    {phase.desc}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Side Label */}
        <div className="absolute right-0 top-1/4 hidden xl:block">
          <span className="side-label">04 — CHRONOLOGY</span>
        </div>
      </div>
    </section>
  );
}
