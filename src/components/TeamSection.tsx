"use client";

import { motion } from "framer-motion";
import { useT } from "@/i18n/LanguageProvider";

/**
 * Real team roster — eight friends from Barcelona split into four
 * two-person crews. First name in each pair = piloto, second = copiloto.
 * Team "name" is formed from the pilots' surnames (no stylised
 * military-style callsigns).
 *
 * Car model stays constant (Ford Escort) because that's what the fleet
 * is currently built around; per-team make/year can be broken out later
 * once the cars are actually assigned and dated.
 */
type Pilot = { name: string };

interface Team {
  id: string;
  name: string;
  car: { model: string; year: string };
  pilots: [Pilot, Pilot];
}

const TEAMS: Team[] = [
  {
    id: "01",
    name: "LORAS & HUSE",
    car: { model: "Ford Escort MK7", year: "1997" },
    pilots: [{ name: "Alex Loras" }, { name: "Huse" }],
  },
  {
    id: "02",
    name: "SANS & SANS",
    car: { model: "Ford Escort MK7", year: "1998" },
    pilots: [{ name: "Marc Sans" }, { name: "Sergi Sans" }],
  },
  {
    id: "03",
    name: "SEGURA & PÉREZ",
    car: { model: "Ford Escort MK7", year: "1997" },
    pilots: [{ name: "Bernat Segura" }, { name: "Ramón Pérez" }],
  },
  {
    id: "04",
    name: "MAX & CELL",
    car: { model: "Ford Escort MK7", year: "1999" },
    pilots: [{ name: "Max" }, { name: "Cell" }],
  },
];

export default function TeamSection() {
  const t = useT();

  return (
    <section id="equipo" className="relative w-full bg-[var(--color-bg-sand)] pb-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16">

        {/* Team Units */}
        <div className="space-y-32 md:space-y-48 mt-12">
          {TEAMS.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-start gap-12 lg:gap-20 relative`}
            >
              {/* Car Side */}
              <div className="w-full lg:w-1/2 flex flex-col">
                {/* Unit header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="font-mono text-[10px] tracking-[5px] text-[var(--color-rust)] font-semibold block mb-1">
                      {t.team.unitPrefix} {team.id}
                    </span>
                    <h3 className="font-heading text-[clamp(2rem,4vw,48px)] text-[var(--color-text-primary)] tracking-[2px] leading-[0.9]">
                      {team.name}
                    </h3>
                  </div>
                  <span className="font-mono text-[9px] tracking-[2px] text-[var(--color-text-secondary)] mt-1">
                    {team.car.year}
                  </span>
                </div>

                {/* Car visual */}
                <div className="relative aspect-[16/9] bg-[var(--color-bg-dark)]/6 overflow-hidden border border-[var(--color-border)]">
                  {/* Topo grid background */}
                  <div className="absolute inset-0 topo-bg opacity-40"></div>

                  {/* Large background number */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-heading text-[160px] leading-none text-[var(--color-text-primary)]/4 select-none">
                      {team.id}
                    </span>
                  </div>

                  {/* Corner frame markers */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[var(--color-rust)]/40"></div>
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[var(--color-rust)]/40"></div>
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[var(--color-rust)]/40"></div>
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[var(--color-rust)]/40"></div>

                  {/* Bottom data strip */}
                  <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-bg-sand)]/80 backdrop-blur-sm px-5 py-3 flex items-center justify-between z-10">
                    <div>
                      <span className="font-mono text-[8px] tracking-[3px] text-[var(--color-rust)] uppercase block">
                        {t.team.rallyUnit}
                      </span>
                      <span className="font-heading text-xl text-[var(--color-text-primary)] tracking-wider">
                        {team.car.model}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[8px] tracking-[3px] text-[var(--color-text-secondary)] uppercase block">
                        {t.team.estLabel}
                      </span>
                      <span className="font-heading text-xl text-[var(--color-text-primary)]">{team.car.year}</span>
                    </div>
                  </div>
                </div>

                {/* Preparation status — honest, not a faked %. Same for all crews
                    until we have real per-team progress data. */}
                <div className="mt-5 border border-[var(--color-border)] p-4 flex items-center justify-between">
                  <span className="font-mono text-[8px] tracking-[4px] text-[var(--color-text-secondary)] uppercase">
                    {t.team.preparationLabel}
                  </span>
                  <span className="font-mono text-[10px] tracking-[3px] text-[var(--color-moss)] uppercase">
                    {t.team.preparationStatus}
                  </span>
                </div>
              </div>

              {/* Pilots Side */}
              <div className="w-full lg:w-1/2 flex flex-col justify-start gap-0 pt-4">
                {/* Dossier header */}
                <div className="border-t-[3px] border-[var(--color-rust)] border-l border-r border-[var(--color-border)] px-5 py-3 flex items-center justify-between bg-[var(--color-bg-dark)]/5">
                  <span className="font-mono text-[8px] tracking-[5px] text-[var(--color-rust)] uppercase font-semibold">
                    {t.team.crewDossier}
                  </span>
                  <span className="font-mono text-[8px] tracking-[3px] text-[var(--color-text-secondary)]">
                    {t.team.unitPrefix} {team.id} · {team.car.year}
                  </span>
                </div>

                {/* Pilot cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-r border-b border-[var(--color-border)]">
                  {team.pilots.map((pilot, pIdx) => (
                    <div
                      key={pIdx}
                      className={`group p-6 hover:bg-[var(--color-bg-dark)]/4 transition-colors duration-300 ${
                        pIdx === 0 ? "md:border-r border-b md:border-b-0 border-[var(--color-border)]" : ""
                      }`}
                    >
                      {/* Role */}
                      <div className="mb-5">
                        <span className="font-mono text-[8px] tracking-[4px] text-[var(--color-rust)] uppercase font-semibold">
                          {pIdx === 0 ? t.team.pilot : t.team.copilot}
                        </span>
                      </div>

                      {/* Name */}
                      <h5 className="font-heading text-[clamp(1.4rem,2.5vw,1.8rem)] text-[var(--color-text-primary)] tracking-[2px] leading-[0.92] mb-5">
                        {pilot.name}
                      </h5>

                      {/* City — single honest row */}
                      <div className="border-t border-[var(--color-border)]">
                        <div className="flex items-center justify-between py-2">
                          <span className="font-mono text-[8px] tracking-[3px] text-[var(--color-text-secondary)] uppercase">
                            {t.team.fromLabel}
                          </span>
                          <span className="font-mono text-[9px] tracking-[2px] text-[var(--color-text-primary)]">
                            {t.team.city}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-32 py-16 text-center">
          <span className="waypoint-tag block mb-4">{t.team.ctaTag}</span>
          <h3 className="font-heading text-[clamp(2.5rem,5vw,64px)] text-[var(--color-text-primary)] tracking-[2px] leading-[0.92] mb-6">
            {t.team.ctaTitle.map((line, i) => (
              <span key={i}>
                {line}
                {i < t.team.ctaTitle.length - 1 && <br />}
              </span>
            ))}
          </h3>
        </div>
      </div>
    </section>
  );
}
