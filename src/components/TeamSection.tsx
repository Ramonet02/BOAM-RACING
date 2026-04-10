"use client";

import { motion } from "framer-motion";

const teams = [
  {
    id: "01",
    name: "LOS PIONEROS",
    car: { model: "Ford Escort MK7", year: "1997", progress: 85 },
    pilots: [
      { name: "Marc Mestres", role: "Piloto" },
      { name: "Albert Pell", role: "Copiloto" }
    ]
  },
  {
    id: "02",
    name: "LOS NOMADAS",
    car: { model: "Ford Escort MK7", year: "1998", progress: 60 },
    pilots: [
      { name: "Pol Vidal", role: "Piloto" },
      { name: "Joan Roca", role: "Copiloto" }
    ]
  },
  {
    id: "03",
    name: "LOS MECANICOS",
    car: { model: "Ford Escort MK7", year: "1997", progress: 40 },
    pilots: [
      { name: "Carlos Ruiz", role: "Piloto" },
      { name: "David Costa", role: "Copiloto" }
    ]
  },
  {
    id: "04",
    name: "LOS SUPERVIVIENTES",
    car: { model: "Ford Escort MK7", year: "1999", progress: 25 },
    pilots: [
      { name: "Alex Mora", role: "Piloto" },
      { name: "Sergi Font", role: "Copiloto" }
    ]
  }
];

export default function TeamSection() {
  return (
    <section id="equipo" className="relative w-full bg-[var(--color-bg-sand)] pb-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16">
        {/* Team Units */}
        <div className="space-y-32 md:space-y-48 mt-12">
          {teams.map((team, index) => (
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
                {/* Team Name */}
                <div className="mb-6">
                  <span className="font-mono text-[10px] tracking-[4px] text-[var(--color-rust)] font-semibold">UNIT {team.id}</span>
                  <h3 className="font-heading text-[clamp(2rem,4vw,48px)] text-[var(--color-text-primary)] tracking-[2px] leading-[0.9]">
                    {team.name}
                  </h3>
                </div>

                <div className="relative aspect-[16/9] bg-[var(--color-bg-dark)]/5 overflow-hidden shadow-[0_16px_40px_rgba(42,37,34,0.15)]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-heading text-[120px] text-[var(--color-text-primary)]/5">
                      {team.id}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 z-10">
                    <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-rust)] uppercase block mb-1">Rally Unit</span>
                    <span className="font-heading text-2xl text-[var(--color-text-primary)] tracking-wider">
                      {team.car.model}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 px-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-secondary)] uppercase">Preparacion</span>
                    <span className="font-heading text-2xl text-[var(--color-rust)]">{team.car.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-[var(--color-border)] relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-[var(--color-rust)] transition-all duration-1000 ease-out"
                      style={{ width: `${team.car.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Pilots Side */}
              <div className="w-full lg:w-1/2 flex flex-col justify-start gap-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.pilots.map((pilot, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-white border border-[var(--color-border)] p-6 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="w-12 h-12 bg-[var(--color-bg-dark)]/5 border border-[var(--color-border)] flex items-center justify-center mb-4">
                        <span className="font-heading text-lg text-[var(--color-text-primary)]">
                          {pilot.name.charAt(0)}
                        </span>
                      </div>

                      <h5 className="font-heading text-xl text-[var(--color-text-primary)] tracking-wider mb-1">
                        {pilot.name}
                      </h5>
                      <p className="font-mono text-[10px] tracking-[3px] text-[var(--color-rust)] uppercase font-semibold">
                        {pilot.role}
                      </p>

                      <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase font-mono">
                          <span>Especialidad</span>
                          <span className="text-[var(--color-text-primary)]">{pIdx === 0 ? "Mecanica" : "Navegacion"}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase font-mono">
                          <span>Estado</span>
                          <span className="text-[var(--color-moss)]">Listo</span>
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
          <span className="waypoint-tag block mb-4">[ JOIN ]</span>
          <h3 className="font-heading text-[clamp(2.5rem,5vw,64px)] text-[var(--color-text-primary)] tracking-[2px] leading-[0.92] mb-6">
            AYUDANOS<br />A CRUZAR<br />LA META
          </h3>
        </div>
      </div>
    </section>
  );
}
