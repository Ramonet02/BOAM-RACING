"use client";

import { useState } from "react";
import Image from "next/image";
import TopoButton from "@/components/ui/TopoButton";

const galleryImages = [
  { id: 1, title: "Cruce del Atlas", category: "Rally", src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=600" },
  { id: 2, title: "Entrega de Material", category: "Solidario", src: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=600" },
  { id: 3, title: "Tormenta de Arena", category: "Motor", src: "https://images.unsplash.com/photo-1493558103817-58596001222b?auto=format&fit=crop&q=80&w=600" },
  { id: 4, title: "Equipo Boam 2027", category: "Equipo", src: "https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?auto=format&fit=crop&q=80&w=600" },
  { id: 5, title: "Dunas Erg Chebbi", category: "Aventura", src: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=600" },
  { id: 6, title: "Atardecer Sahara", category: "Rally", src: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=600" },
];

const videos = [
  { id: 1, title: "Trailer Oficial UniRaid", duration: "02:45" },
  { id: 2, title: "Preparacion Tecnica", duration: "08:20" },
];

export default function MediaSection() {
  const [filter] = useState("All");

  return (
    <section id="media" className="relative w-full bg-[var(--color-bg-sand)] pb-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16">

        {/* Header */}
        <div className="mb-20">
          <span className="waypoint-tag block mb-4">MEDIA &middot; FILM</span>
          <h2 className="font-heading text-[clamp(3rem,7vw,96px)] text-[var(--color-text-primary)] leading-[0.88] tracking-[2px] mb-6">
            DIARIO<br />VISUAL
          </h2>
          <p className="font-body text-base text-[var(--color-text-secondary)] max-w-lg leading-[1.7]">
            Un registro inmersivo de la expedicion. Desde la preparacion mecanica hasta el ultimo grano de arena del Sahara.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-32">
          {galleryImages
            .filter((img) => filter === "All" || img.category === filter)
            .map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[4/3] overflow-hidden cursor-pointer shadow-[0_8px_24px_rgba(42,37,34,0.1)] hover:shadow-[0_16px_40px_rgba(42,37,34,0.2)] transition-shadow duration-500"
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-full p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-rust)] uppercase block mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{img.category}</span>
                  <h3 className="font-heading text-lg text-[var(--color-text-light)] tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.title}
                  </h3>
                </div>
              </div>
            ))}
        </div>

        {/* Videos Section */}
        <div className="mb-32">
          <span className="waypoint-tag block mb-4">TRANSMISIONES DESDE EL DESIERTO</span>
          <div className="h-px bg-[var(--color-border)] mb-8"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="group relative aspect-video bg-[var(--color-bg-dark)] overflow-hidden cursor-pointer shadow-[0_12px_32px_rgba(42,37,34,0.2)]">
                <div className="absolute inset-0 bg-[var(--color-bg-dark)]/80"></div>

                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-16 h-16 border border-[var(--color-text-light)]/20 flex items-center justify-center group-hover:bg-[var(--color-rust)] group-hover:border-[var(--color-rust)] transition-all duration-500">
                    <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                  <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-rust)] uppercase block mb-1">Video {video.id}</span>
                  <h4 className="font-heading text-2xl text-[var(--color-text-light)] tracking-wider mb-1">
                    {video.title}
                  </h4>
                  <span className="font-mono text-[9px] text-[var(--color-text-light)]/40 tracking-wider">
                    Duration: {video.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Section */}
        <div className="mb-20">
          <span className="waypoint-tag block mb-4">REDES SOCIALES</span>
          <div className="h-px bg-[var(--color-border)] mb-8"></div>

          <div className="flex flex-wrap gap-4">
            {["Instagram", "TikTok", "YouTube"].map((social) => (
              <TopoButton key={social}>
                <a href="#" className="inline-flex items-center gap-3 px-8 py-4 border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-rust)] hover:text-[var(--color-rust)] font-body text-sm uppercase tracking-[3px] transition-all">
                  {social}
                </a>
              </TopoButton>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="py-20 text-center" style={{
          background: "linear-gradient(180deg, var(--color-bg-sand) 0%, var(--color-bg-dark) 100%)",
          margin: "0 -24px",
          padding: "80px 24px"
        }}>
          <h3 className="font-heading text-[clamp(2.5rem,5vw,64px)] text-[var(--color-text-light)] tracking-[2px] leading-[0.92]">
            LISTO PARA<br />EL DESIERTO?
          </h3>
        </div>
      </div>
    </section>
  );
}
