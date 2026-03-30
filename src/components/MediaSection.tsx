"use client";

import { useState } from "react";
import TopoButton from "@/components/ui/TopoButton";
import TopoDivider from "@/components/ui/TopoDivider";

const galleryImages = [
  { id: 1, title: "Cruce del Atlas", category: "Rally", color: "bg-[var(--color-olive)]" },
  { id: 2, title: "Entrega de Material", category: "Solidario", color: "bg-[var(--color-terracotta)]" },
  { id: 3, title: "Tormenta de Arena", category: "Motor", color: "bg-[var(--color-earth-red)]" },
  { id: 4, title: "Equipo Boam 2027", category: "Equipo", color: "bg-[var(--color-sand)]" },
  { id: 5, title: "Dunas Erg Chebbi", category: "Aventura", color: "bg-[var(--color-olive-dark)]" },
  { id: 6, title: "Atardecer Sahara", category: "Rally", color: "bg-[var(--color-dark)]" },
];

const videos = [
  { id: 1, title: "Tráiler Oficial UniRaid", duration: "02:45", thumbnail: "bg-[var(--color-olive)]" },
  { id: 2, title: "Preparación Técnica", duration: "08:20", thumbnail: "bg-[var(--color-terracotta)]" },
];

export default function MediaSection() {
  const [filter, setFilter] = useState("All");
  
  const categories = ["All", "Rally", "Solidario", "Motor", "Equipo", "Aventura"];

  return (
    <section id="media" className="relative w-full bg-[var(--color-dark)] pb-32 overflow-hidden noise-bg">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16">
        {/* Header */}
        <div className="mb-24 animate-fade-up">
           <span className="font-body tracking-[0.4em] uppercase text-[var(--color-terracotta)] mb-4 text-xs font-bold">Archivo Visual</span>
          <h2 className="font-display text-5xl md:text-8xl font-bold text-[var(--color-cream)] mb-8">
            Media <span className="text-gradient-sand italic">Hub</span>
          </h2>
          <p className="font-body text-xl text-[var(--color-cream)]/50 max-w-2xl leading-relaxed">
            Un registro inmersivo de la expedición. Desde la preparación mecánica hasta el último grano de arena del Sáhara.
          </p>
        </div>

        {/* Categories / Filters - SMOOTH ROUNDED PILLS */}
        <div className="flex flex-wrap gap-4 mb-16 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 font-body text-xs uppercase tracking-[0.2em] font-bold transition-all duration-700 rounded-full border ${
                filter === cat
                  ? "bg-[var(--color-terracotta)] border-[var(--color-terracotta)] text-white shadow-lg shadow-[var(--color-terracotta)]/20"
                  : "border-white/10 text-white/30 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid - Visual Expedition Journal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-40">
          {galleryImages
            .filter((img) => filter === "All" || img.category === filter)
            .map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[3/4] overflow-hidden bg-black/40 border border-white/5 cursor-pointer rounded-[2rem] transition-all duration-1000 ease-in-out hover:shadow-2xl hover:shadow-[var(--color-sand)]/5"
              >
                <div className={`absolute inset-0 ${img.color} opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] via-transparent to-transparent opacity-80"></div>
                
                {/* Tech overlay */}
                <div className="absolute top-8 left-8 flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                   <div className="w-2 h-2 bg-[var(--color-sand)] rounded-full"></div>
                   <span className="font-body text-[8px] tracking-[0.3em] uppercase text-white">Capture ID: 00{img.id}</span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-10 translate-y-2 group-hover:translate-y-0 transition-all duration-700">
                  <span className="font-body text-[10px] tracking-[0.4em] text-[var(--color-terracotta)] uppercase mb-3 block font-bold">
                    {img.category}
                  </span>
                  <h3 className="font-display text-3xl text-[var(--color-cream)] font-bold tracking-wide">
                    {img.title}
                  </h3>
                </div>
              </div>
            ))}
        </div>

        {/* Videos Section */}
        <div className="mb-48">
          <div className="flex items-center gap-10 mb-16">
            <h3 className="font-display text-4xl md:text-5xl text-[var(--color-cream)] shrink-0">
               <span className="text-[var(--color-terracotta)] italic">Crónicas</span> del Desierto
            </h3>
            <div className="h-px bg-gradient-to-r from-white/10 to-transparent w-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {videos.map((video) => (
              <div key={video.id} className="group relative aspect-video bg-black border border-white/5 overflow-hidden cursor-pointer rounded-[2.5rem]">
                <div className={`absolute inset-0 ${video.thumbnail} opacity-10 group-hover:scale-105 transition-transform duration-1000`}></div>
                
                {/* Visual Glitch/Noise overlay on hover */}
                <div className="absolute inset-0 noise-bg opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>

                {/* Play Button - ROUNDED */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-black/60 group-hover:bg-[var(--color-terracotta)] group-hover:scale-110 transition-all duration-700">
                    <svg className="w-7 h-7 text-white translate-x-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Video Info */}
                <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-[var(--color-dark)] to-transparent">
                  <div className="flex justify-between items-end">
                    <div>
                         <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[var(--color-sand)] mb-2 block font-bold">Vídeo Técnico</span>
                      <h4 className="font-display text-3xl text-[var(--color-cream)] mb-1">
                        {video.title}
                      </h4>
                      <span className="font-body text-xs text-white/30 tracking-widest uppercase">
                        Capítulo {video.id} · Duración: {video.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Expedition CTA - FLUID ROUNDED */}
        <div className="relative p-12 md:p-24 bg-white/5 border border-white/5 overflow-hidden text-center flex flex-col items-center rounded-[3rem]">
          {/* Topo line texture background */}
          <div className="absolute inset-0 topo-bg opacity-[0.03] animate-[topo-pan_40s_linear_infinite] pointer-events-none"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-terracotta)] to-transparent"></div>
          
          <span className="font-body text-[10px] tracking-[0.5em] text-[var(--color-sand)] uppercase font-bold mb-6 relative z-10 block">Conexión vía Satélite</span>
          <h3 className="font-display text-5xl md:text-7xl text-[var(--color-cream)] mb-10 relative z-10 leading-tight">
            Únete a la <span className="text-gradient-sand italic">Travesía</span>
          </h3>
          <p className="font-body text-xl text-[var(--color-cream)]/50 max-w-xl mb-16 relative z-10 leading-relaxed">
            Actualizaciones diarias desde el terreno. No te pierdas ni un solo kilómetro de nuestra misión solidaria.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 relative z-10">
            {["Instagram", "LinkedIn", "Youtube"].map((social) => (
              <TopoButton key={social}>
                <a href="#" className="flex items-center gap-3 px-12 py-5 border border-white/10 hover:border-[var(--color-sand)]/50 text-[var(--color-cream)]/60 hover:text-[var(--color-sand)] uppercase tracking-[0.2em] text-xs font-bold transition-all backdrop-blur-md rounded-full shadow-lg">
                  <span>{social}</span>
                </a>
              </TopoButton>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
