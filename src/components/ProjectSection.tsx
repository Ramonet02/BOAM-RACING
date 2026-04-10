"use client";

import { useEffect, useRef, useState } from "react";
import TopoButton from "@/components/ui/TopoButton";

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
    <div ref={nodeRef} className="flex flex-col border-l-2 border-[var(--color-rust)] pl-4 py-1">
      <span className="font-heading text-4xl md:text-5xl text-[var(--color-rust)] mb-1">
        {count}{suffix}
      </span>
      <span className="font-body text-sm md:text-base uppercase tracking-widest text-[var(--color-text-secondary)]">
        {label}
      </span>
    </div>
  );
};

export default function ProjectSection() {
  return (
    <section id="proyecto" className="relative w-full bg-[var(--color-bg-sand)] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="mb-16 md:mb-24 relative">
          <span className="waypoint-tag block mb-4">EL PROYECTO</span>
          <h2 className="font-heading text-[clamp(3rem,6vw,72px)] text-[var(--color-text-primary)] leading-[0.92] tracking-[2px]">
            El Proyecto
          </h2>
          <div className="mt-4 w-32 h-px bg-[var(--color-rust)]"></div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* Left Column: Text & Counters */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <p className="font-body text-xl text-[var(--color-text-primary)] tracking-wide leading-relaxed">
                Boam Racing participa en Uniraid 2027: un gran rally solidario exclusivo para estudiantes.
              </p>
              <p className="font-body text-base text-[var(--color-text-secondary)] leading-relaxed">
                No es una carrera de velocidad, es un viaje-aventura en el que los participantes debemos completar 7 etapas navegando con roadbook, y superar todo tipo de obstaculos, desafios y pruebas, con el objetivo de cruzar Marruecos de norte a sur y entregar material solidario en las aldeas del desierto.
              </p>
              <p className="font-body text-base text-[var(--color-text-secondary)] leading-relaxed">
                Transportaremos material escolar, logistico y ropa de abrigo a traves del Atlas hasta las dunas del Erg Chebbi, utilizando vehiculos de mas de 20 anos que nosotros mismos preparamos y adaptamos.
              </p>
            </div>

            {/* Counters Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 pt-8 border-t border-[var(--color-border)]">
              <StatCounter label="Dias de Rally" target={9} />
              <StatCounter label="Kilometros" target={2500} suffix="+" />
              <StatCounter label="Aldeas" target={15} suffix="+" />
              <StatCounter label="Coches" target={4} />
            </div>

            <div className="pt-6">
              <TopoButton>
                <button className="px-8 py-4 border border-[var(--color-rust)] text-[var(--color-rust)] hover:bg-[var(--color-rust)] hover:text-[var(--color-text-light)] font-body uppercase tracking-[3px] text-xs font-semibold transition-colors">
                  Descargar Dossier
                </button>
              </TopoButton>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[200px]">
              <div className="group relative md:col-span-2 md:row-span-2 overflow-hidden bg-[var(--color-bg-dark)]/5 border border-[var(--color-border)]">
                <div className="absolute inset-0 flex items-center justify-center p-8 z-20">
                  <span className="font-mono text-xs uppercase tracking-[3px] text-[var(--color-text-secondary)] border border-dashed border-[var(--color-border)] px-6 py-4">Foto: Preparacion de coches</span>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-[var(--color-rust)]/10 border border-[var(--color-border)]">
                <div className="absolute inset-0 flex items-center justify-center p-4 z-20 text-center">
                  <span className="font-mono text-xs uppercase tracking-[3px] text-[var(--color-text-secondary)]">Foto: Entrenamientos</span>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-[var(--color-moss)]/10 border border-[var(--color-border)]">
                <div className="absolute inset-0 flex items-center justify-center p-4 z-20 text-center">
                  <span className="font-mono text-xs uppercase tracking-[3px] text-[var(--color-text-secondary)]">Foto: Logistica y Material</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Communications */}
        <div className="mt-24 md:mt-32">
          <h3 className="font-heading text-3xl text-[var(--color-text-primary)] mb-10 tracking-wider">
            Comunicaciones
          </h3>
          <div className="h-px bg-[var(--color-border)] mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { date: "Octubre 2026", title: "Adquisicion de los 4 Ford Escort", cat: "PROYECTO" },
              { date: "Noviembre 2026", title: "Inicio de la recaudacion de material escolar", cat: "SOLIDARIO" },
              { date: "Diciembre 2026", title: "Primeras pruebas en terreno off-road", cat: "MOTOR" }
            ].map((item, idx) => (
              <div key={idx} className="group flex flex-col justify-between p-8 bg-white border border-[var(--color-border)] hover:shadow-md transition-shadow h-64 cursor-pointer">
                <div>
                  <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-rust)] uppercase mb-4 block font-semibold">
                    {item.cat}
                  </span>
                  <h4 className="font-heading text-xl text-[var(--color-text-primary)] leading-snug tracking-wider">
                    {item.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--color-border)]">
                  <span className="font-body text-sm tracking-wider text-[var(--color-text-secondary)]">
                    {item.date}
                  </span>
                  <span className="text-[var(--color-rust)] opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
