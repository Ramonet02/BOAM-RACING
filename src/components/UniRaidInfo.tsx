"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Globe, Users, Trophy } from "lucide-react";

const humanitarioPoints = [
  { icon: Globe, label: "Destino Solidario", desc: "Marruecos / Atlas / Sahara" },
  { icon: Heart, label: "Misión Humanitaria", desc: "Entrega de Material Reutilizable" },
  { icon: Users, label: "Impacto Real", desc: "Más de 30Kg por cada equipo" },
  { icon: Trophy, label: "Espíritu Raid", desc: "La victoria es compartir" },
];

export default function UniRaidInfo() {
  return (
    <section id="uniraid" className="relative w-full py-40 overflow-hidden bg-[var(--color-dark)] group">
      {/* Background Gradient Texture */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-[var(--color-terracotta)]/5 via-transparent to-[var(--color-sand)]/5 blur-[120px] rounded-full scale-125"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          
          {/* Visual Grid - SMOTTH ROUNDED */}
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 items-end animate-fade-up">
            <div className="space-y-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl"
              >
                <Image 
                  src="https://images.unsplash.com/photo-1493558103817-58596001222b?auto=format&fit=crop&q=80&w=2070" 
                  alt="UniRaid Humanity" 
                  fill
                  className="object-cover contrast-110 brightness-75 scale-110 group-hover:scale-125 transition-transform duration-[3s]"
                />
              </motion.div>
              <div className="h-40 bg-[var(--color-olive-dark)]/20 rounded-[2.5rem] border border-white/5 backdrop-blur-md flex items-center justify-center p-8 text-center text-white/20">
                <span className="font-body text-[10px] tracking-[0.4em] uppercase font-black italic">Solidary Spirit</span>
              </div>
            </div>
            <div className="pb-12 space-y-4">
              <div className="h-32 bg-[var(--color-terracotta)]/10 rounded-[2rem] border border-white/5 backdrop-blur-md flex items-center justify-center p-8 text-center text-[var(--color-terracotta)]/40">
                <Users size={32} strokeWidth={1} />
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl"
              >
                <Image 
                  src="https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=2070" 
                  alt="Impact" 
                  fill
                  className="object-cover brightness-90 group-hover:scale-110 transition-transform duration-[4s]"
                />
              </motion.div>
            </div>
          </div>

          {/* Content Column */}
          <div className="w-full lg:w-1/2">
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
             >
                <span className="font-body text-[10px] tracking-[0.5em] text-[var(--color-terracotta)] uppercase font-black mb-8 block">02 / Más que un Rally</span>
                <h2 className="font-display text-6xl md:text-8xl font-bold text-[var(--color-cream)] mb-12 leading-[0.9]">
                  Espíritu <br />
                  <span className="text-gradient-sand italic">UniRaid</span>.
                </h2>
                <div className="space-y-8 text-xl text-[var(--color-cream)]/50 font-body leading-relaxed max-w-xl">
                  <p>
                    UniRaid es una expedición formativa y solidaria para estudiantes. No es una carrera de velocidad, es una aventura de navegación, estrategia y, sobre todo, impacto humanitario.
                  </p>
                  <p>
                    Nuestra misión culmina en el corazón de Marruecos, donde cada equipo entrega materiales escolares y deportivos que facilitarán el futuro de miles de niños en las zonas más remotas dell Sáhara.
                  </p>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {humanitarioPoints.map((point, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-start gap-5 hover:translate-x-3 transition-transform duration-500"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-terracotta)] group-hover:bg-[var(--color-terracotta)] group-hover:text-white transition-all duration-700">
                        <point.icon size={20} strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="block font-body text-[10px] tracking-widest text-[var(--color-sand)] uppercase font-black mb-1">{point.label}</span>
                        <p className="font-body text-sm text-[var(--color-cream)]/40">{point.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
