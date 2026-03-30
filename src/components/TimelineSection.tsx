"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const milestones = [
  { id: 1, date: "SEP 2026", title: "Fundación del Equipo", desc: "Siete estudiantes de la UPV se unen para crear BOAM Racing.", status: "completed" },
  { id: 2, date: "NOV 2026", title: "Adquisición del Vehículo", desc: "Llegada del Panda 4x4 a nuestro taller de preparación.", status: "completed" },
  { id: 3, date: "ENE 2027", title: "Test de Altas Prestaciones", desc: "Pruebas mecánicas extremas y ajustes de suspensión.", status: "completed" },
  { id: 4, date: "FEB 2027", title: "Salida a UniRaid", desc: "El inicio oficial de nuestra travesía marroquí.", status: "upcoming" },
  { id: 5, date: "MAR 2027", title: "Llegada a Meta", desc: "Culminación de la misión humanitaria y el desafío deportivo.", status: "future" },
];

export default function TimelineSection() {
  return (
    <section id="timeline" className="relative w-full py-40 bg-[var(--color-dark)] overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent z-0"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-sand)]/5 blur-[100px] rounded-full translate-y-1/2 translate-x-1/3"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-32 animate-fade-up">
           <span className="font-body text-[10px] tracking-[0.5em] text-[var(--color-terracotta)] uppercase font-black mb-6 block">03 / Cronograma</span>
           <h2 className="font-display text-6xl md:text-8xl font-bold text-[var(--color-cream)] mb-10 leading-[0.9]">
             Hitos del <br />
             <span className="text-gradient-sand italic">Proyecto</span>.
           </h2>
           <p className="font-body text-xl text-white/30 max-w-xl mx-auto mt-8">
             Un registro de nuestra preparación y los eventos futuros que marcarán nuestra expedición.
           </p>
        </div>

        {/* Horizontal Scroll / Grid for timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 relative">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="relative group p-8 rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-xl hover:bg-white/[0.08] transition-all duration-700"
            >
              {/* Status Icon */}
              <div className="mb-6 flex items-center justify-between">
                <span className="font-body text-[10px] tracking-[0.3em] text-[var(--color-sand)] uppercase font-black">{milestone.date}</span>
                <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center ${milestone.status === "completed" ? "text-[var(--color-terracotta)] bg-[var(--color-terracotta)]/10" : milestone.status === "upcoming" ? "text-white animate-pulse" : "text-white/20"}`}>
                  {milestone.status === "completed" ? <CheckCircle2 size={16} /> : milestone.status === "upcoming" ? <Clock size={16} /> : <Circle size={16} strokeWidth={1} />}
                </div>
              </div>

              <h4 className="font-display text-2xl text-[var(--color-cream)] font-bold mb-4 tracking-wide group-hover:text-[var(--color-sand)] transition-colors">
                {milestone.title}
              </h4>
              <p className="font-body text-sm text-white/40 leading-relaxed font-medium">
                {milestone.desc}
              </p>

              {/* Technical Indicator */}
              <div className="absolute top-0 right-10 -translate-y-1/2 flex flex-col items-center gap-2">
                 <div className="w-[1px] h-6 bg-gradient-to-t from-[var(--color-terracotta)]/40 to-transparent"></div>
                 <div className="w-1 h-1 bg-[var(--color-terracotta)] rounded-full group-hover:scale-150 transition-transform duration-500 shadow-[0_0_10px_var(--color-terracotta)]"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Next Phase CTA */}
        <div className="mt-32 p-12 md:p-20 bg-[var(--color-terracotta)]/10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
           <div className="absolute inset-0 topo-bg opacity-[0.03] animate-[topo-pan_40s_linear_infinite]"></div>
           <div className="relative z-10 text-center md:text-left">
              <span className="font-body text-[10px] tracking-[0.4em] text-[var(--color-terracotta)] uppercase font-black mb-4 block animate-pulse">Inscripciones Abiertas</span>
              <h3 className="font-display text-4xl md:text-5xl text-[var(--color-cream)] font-bold mb-4">¿Preparado para el desafío 2028?</h3>
              <p className="font-body text-[var(--color-sand)]/50 tracking-widest uppercase text-xs">Marruecos te espera. La aventura empieza aquí.</p>
           </div>
           <button className="relative z-10 px-12 py-5 rounded-full bg-[var(--color-terracotta)] hover:bg-[var(--color-cream)] text-white hover:text-black font-body uppercase tracking-[0.3em] text-xs font-black transition-all duration-700 shadow-2xl shadow-[var(--color-terracotta)]/20 hover:scale-110 active:scale-95">
             Unirse a la Expedición
           </button>
        </div>
      </div>
    </section>
  );
}
