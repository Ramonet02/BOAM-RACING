"use client";

import { useState } from "react";
import Image from "next/image";

const galleryImages = [
  { id: 1, title: "Cruce del Atlas", category: "Rally", src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=600" },
  { id: 2, title: "Entrega de Material", category: "Solidario", src: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=600" },
  { id: 3, title: "Tormenta de Arena", category: "Motor", src: "https://images.unsplash.com/photo-1493558103817-58596001222b?auto=format&fit=crop&q=80&w=600" },
  { id: 4, title: "Equipo Boam 2027", category: "Equipo", src: "https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?auto=format&fit=crop&q=80&w=600" },
  { id: 5, title: "Dunas Erg Chebbi", category: "Aventura", src: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=600" },
  { id: 6, title: "Atardecer Sahara", category: "Rally", src: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=600" },
];

const videos = [
  { id: 1, title: "Trailer Oficial UniRaid", duration: "02:45", label: "Video 01" },
  { id: 2, title: "Preparacion Tecnica", duration: "08:20", label: "Video 02" },
];

const socials = [
  { name: "Instagram", handle: "@boamracing", signal: "443.8 MHz", href: "#" },
  { name: "TikTok", handle: "@boamracing", signal: "612.0 MHz", href: "#" },
  { name: "YouTube", handle: "BOAM RACING", signal: "807.2 MHz", href: "#" },
];

export default function MediaSection() {
  const [filter] = useState("All");

  return (
    <section id="media" className="relative w-full bg-[var(--color-bg-sand)] pb-0 overflow-hidden">
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-[2px] mb-32">
          {galleryImages
            .filter((img) => filter === "All" || img.category === filter)
            .map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[4/3] overflow-hidden cursor-pointer"
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

                {/* Corner marker */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[var(--color-rust)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="absolute bottom-0 left-0 w-full p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="font-mono text-[8px] tracking-[4px] text-[var(--color-rust)] uppercase block mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.category}
                  </span>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2px]">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative aspect-video bg-[var(--color-bg-dark)] overflow-hidden cursor-pointer border border-[var(--color-border)]"
              >
                <div className="absolute inset-0 topo-bg opacity-20"></div>
                <div className="absolute inset-0 bg-[var(--color-bg-dark)]/70"></div>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-20 h-20 border border-[var(--color-text-light)]/10 group-hover:border-[var(--color-rust)]/50 transition-colors duration-500"></div>
                    <div className="w-14 h-14 border border-[var(--color-text-light)]/20 flex items-center justify-center group-hover:bg-[var(--color-rust)] group-hover:border-[var(--color-rust)] transition-all duration-500">
                      <svg className="w-5 h-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Corner markers */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[var(--color-rust)]/30"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[var(--color-rust)]/30"></div>

                <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--color-text-light)]/10 px-6 py-5 z-10 bg-[var(--color-bg-dark)]/40 backdrop-blur-sm">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-mono text-[8px] tracking-[4px] text-[var(--color-rust)] uppercase block mb-1">
                        {video.label}
                      </span>
                      <h4 className="font-heading text-2xl text-[var(--color-text-light)] tracking-wider">
                        {video.title}
                      </h4>
                    </div>
                    <span className="font-mono text-[9px] text-[var(--color-text-light)]/40 tracking-wider">
                      {video.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Section — Frequency bands */}
        <div className="mb-0">
          <span className="waypoint-tag block mb-4">REDES SOCIALES</span>
          <div className="h-px bg-[var(--color-border)] mb-0"></div>

          <div className="flex flex-col">
            {socials.map((social, i) => (
              <a
                key={i}
                href={social.href}
                className="group relative flex items-center justify-between py-6 px-0 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-dark)]/4 transition-colors duration-200 overflow-hidden"
              >
                {/* Hover accent */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-rust)] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>

                <div className="flex items-center gap-6 pl-4">
                  <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-secondary)] flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="font-heading text-[clamp(1.8rem,4vw,3.5rem)] text-[var(--color-text-primary)] group-hover:text-[var(--color-rust)] tracking-[2px] leading-none transition-colors duration-300">
                    {social.name.toUpperCase()}
                  </h4>
                  <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-secondary)] hidden sm:block">
                    {social.handle}
                  </span>
                </div>

                <div className="flex items-center gap-6 pr-2">
                  <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-secondary)] hidden md:block">
                    {social.signal}
                  </span>
                  <span className="font-heading text-xl text-[var(--color-rust)] opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA — full bleed dark section */}
      <div className="relative mt-32 overflow-hidden bg-[var(--color-bg-dark)]">
        {/* Topographic texture */}
        <div className="absolute inset-0 topo-bg opacity-25"></div>

        {/* GPS HUD */}
        <div className="absolute top-8 right-8 text-right z-10">
          <p className="gps-label">31°08&apos;N · 3°58&apos;W</p>
          <p className="gps-label">ALT: 840m</p>
        </div>

        {/* Corner frame */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-[var(--color-rust)]/30 z-10"></div>
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-[var(--color-rust)]/30 z-10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
          <span className="waypoint-tag block mb-6 opacity-50">DEPARTURE · FEB 2027</span>
          <h3 className="font-heading text-[clamp(3rem,9vw,120px)] text-[var(--color-text-light)] tracking-[2px] leading-[0.88]">
            LISTO PARA<br />EL DESIERTO?
          </h3>
          <div className="mt-8 flex items-center gap-6">
            <div className="w-12 h-px bg-[var(--color-rust)]"></div>
            <span className="font-mono text-[9px] tracking-[4px] text-[var(--color-text-light)]/30 uppercase">
              6,200 km &nbsp;&middot;&nbsp; 9 días &nbsp;&middot;&nbsp; Sahara
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
