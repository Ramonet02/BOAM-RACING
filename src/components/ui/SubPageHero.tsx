"use client";

import { useEffect, useState } from "react";
import TopoDivider from "./TopoDivider";

interface SubPageHeroProps {
  title: string;
  subtitle?: string;
  location: string;
  coords: string;
  altitude: string;
  topoType?: "atlas" | "dunes" | "plateau" | "gorges";
  extreme?: boolean;
  bgImage?: string;
}

export default function SubPageHero({
  title,
  subtitle,
  location,
  coords,
  altitude,
  topoType = "atlas",
  extreme = true,
  bgImage
}: SubPageHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full min-h-[75vh] flex flex-col items-center justify-center overflow-hidden bg-[var(--color-dark)] py-20 px-6">
      {/* Background Layer - SMOOTHER DRIFT */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="w-full h-full animate-[heat-haze_12s_infinite_ease-in-out] opacity-50">
          <div 
            className="absolute inset-0 bg-cover bg-center contrast-110 brightness-75 scale-110 transition-transform duration-1000 ease-out"
            style={{ 
              backgroundImage: `url(${bgImage || "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=2070"})`,
              transform: `translateY(${scrollY * 0.15}px)`
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] via-transparent to-[var(--color-dark)]/60 z-10"></div>
      </div>

      {/* Noise Texture */}
      <div className="absolute inset-0 z-10 noise-bg pointer-events-none opacity-20"></div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Technical Breadcrumb */}
        <div className="mb-12 animate-fade-up duration-1000">
          <div className="flex flex-col items-center gap-4">
            <span className="font-body text-[10px] tracking-[0.6em] text-[var(--color-terracotta)] uppercase font-black">Expedición Marruecos 2027</span>
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[var(--color-sand)]/40 to-transparent"></div>
          </div>
        </div>

        <h1 className="font-display text-7xl md:text-9xl lg:text-[11rem] font-bold text-[var(--color-cream)] leading-none mb-8 animate-fade-up duration-1000 delay-100">
          {title}<span className="text-gradient-sand italic">.</span>
        </h1>
        
        {subtitle && (
          <p className="font-display text-2xl md:text-4xl text-[var(--color-sand)]/70 italic animate-fade-up duration-1000 delay-300 tracking-wider">
            {subtitle}
          </p>
        )}

        {/* HUD Data - SMOOTH ROUNDED PILL */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 animate-fade-up duration-1000 delay-500 border border-white/5 px-12 py-6 backdrop-blur-xl bg-white/5 rounded-full shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center md:items-end">
            <span className="font-body text-[8px] text-white/20 tracking-[0.5em] uppercase mb-1 font-bold">Posición GPS</span>
            <span className="font-body text-xs md:text-sm text-[var(--color-sand)] tracking-widest font-black uppercase">{coords}</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10 self-center"></div>
          <div className="flex flex-col items-center md:items-start">
            <span className="font-body text-[8px] text-white/20 tracking-[0.5em] uppercase mb-1 font-bold">Altitud MSNM</span>
            <span className="font-body text-xs md:text-sm text-[var(--color-sand)] tracking-widest font-black uppercase">{altitude}</span>
          </div>
        </div>
      </div>

      {/* Bottom Topo Divider */}
      <div className="absolute bottom-0 left-0 w-full z-30 transition-opacity duration-1000">
        <TopoDivider 
          type={topoType} 
          extreme={extreme} 
          location={location}
          coords={coords}
          altitude={altitude}
        />
      </div>
    </section>
  );
}
