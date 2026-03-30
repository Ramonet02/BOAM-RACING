"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ProjectStory() {
  return (
    <section id="proyecto" className="relative w-full py-40 bg-[var(--color-dark)] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-terracotta)]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Content Column */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              <span className="font-body text-[10px] tracking-[0.5em] text-[var(--color-terracotta)] uppercase font-black mb-6 block">01 / Nuestra Misión</span>
              <h2 className="font-display text-6xl md:text-8xl font-bold text-[var(--color-cream)] mb-10 leading-[0.9]">
                Más que una <br />
                <span className="text-gradient-sand italic">Carrera</span>.
              </h2>
              <div className="space-y-6 text-xl text-[var(--color-cream)]/60 font-body leading-relaxed max-w-xl">
                <p>
                  BOAM Racing no es solo un equipo de Raid. Es la culminación de meses de preparación mecánica, estratégica y humana para enfrentar uno de los desafíos más duros del norte de África.
                </p>
                <p>
                  Nacidos de la pasión por la ingeniería y la aventura, nuestro objetivo es demostrar que la determinación técnica y el espíritu de equipo pueden superar cualquier duna.
                </p>
              </div>

              {/* Stats / Highlights */}
              <div className="mt-16 grid grid-cols-2 gap-10">
                <div>
                  <span className="block font-display text-5xl text-[var(--color-sand)] font-bold mb-2">2.5K</span>
                  <span className="block font-body text-[10px] tracking-[0.3em] text-white/30 uppercase font-black">Kilómetros de Desafío</span>
                </div>
                <div>
                  <span className="block font-display text-5xl text-[var(--color-sand)] font-bold mb-2">100%</span>
                  <span className="block font-body text-[10px] tracking-[0.3em] text-white/30 uppercase font-black">Compromiso Solidario</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Column - ASYMMETRICAL */}
          <div className="order-1 lg:order-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1.1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="relative aspect-square w-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl z-20"
            >
               <Image 
                src="https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=2070" 
                alt="Boam Project Origin" 
                fill
                className="object-cover contrast-110 brightness-90 transition-transform duration-[2s] hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/40 to-transparent"></div>
            </motion.div>

            {/* Floating secondary image */}
            <motion.div
              initial={{ opacity: 0, y: 50, x: 50 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute -bottom-10 -right-10 w-2/3 aspect-video rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl z-30 hidden md:block"
            >
               <Image 
                src="https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?auto=format&fit=crop&q=80&w=2070" 
                alt="Technical Prep" 
                fill
                className="object-cover contrast-110 brightness-75"
              />
              <div className="absolute inset-0 backdrop-blur-sm bg-[var(--color-terracotta)]/10 mix-blend-overlay"></div>
            </motion.div>

            {/* Technical HUD element */}
            <div className="absolute -top-6 -left-6 z-30 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl animate-pulse">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-[var(--color-terracotta)]"></div>
                 <span className="font-body text-[8px] tracking-[0.4em] text-[var(--color-sand)] uppercase font-black">Core Prototype</span>
               </div>
               <span className="font-body text-xs text-white/40 tracking-widest">v2.07 SECTOR_SCAN</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
