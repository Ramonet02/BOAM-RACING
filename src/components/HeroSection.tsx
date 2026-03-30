"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopoButton from "@/components/ui/TopoButton";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-[var(--color-dark)]">
      {/* Background Image Area */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {/* Abstract Desert Background with Heat Haze */}
        <div className="w-full h-full bg-[var(--color-olive-dark)] opacity-40 mix-blend-multiply animate-[heat-haze_12s_infinite_ease-in-out]"></div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-dark)]/80 via-transparent to-[var(--color-dark)] z-10"></div>
      </div>

      {/* Dynamic Topographic Lines */}
      <div
        className="absolute inset-0 z-10 topo-bg opacity-[0.15] mix-blend-overlay animate-[topo-pan_80s_linear_infinite]"
        style={{
          transform: `translateY(${scrollY * -0.08}px)`,
        }}
      ></div>

      {/* Noise / Dust Layer */}
      <div className="absolute inset-0 z-10 noise-bg pointer-events-none opacity-15"></div>

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center pt-20">
        <div className="animate-fade-up delay-200 duration-1000 relative">
          <h1 className="font-display text-7xl md:text-9xl lg:text-[12rem] font-bold leading-none tracking-tight text-[var(--color-cream)] mb-6">
            BOAM<span className="text-gradient-sand italic">RACING</span>
          </h1>
          <div className="absolute -inset-4 glow-heavy opacity-10 pointer-events-none blur-3xl"></div>
        </div>

        {/* CTAs - FLUID PILLS */}
        <div className="animate-fade-up delay-500 duration-1000 mt-16 flex flex-col sm:flex-row items-center gap-8 relative z-30">
          <TopoButton>
            <Link
              href="/patrocinio"
              className="block w-full sm:w-auto px-12 py-5 bg-[var(--color-terracotta)] hover:bg-[var(--color-cream)] text-white hover:text-black font-body uppercase tracking-[0.3em] text-xs md:text-sm font-black transition-all duration-700 rounded-full shadow-2xl shadow-[var(--color-terracotta)]/20"
            >
              Convertirse en patrocinador
            </Link>
          </TopoButton>
          <TopoButton>
            <Link
              href="/equipo"
              className="group block w-full sm:w-auto px-12 py-5 border border-white/10 hover:border-white/30 text-[var(--color-cream)] font-body uppercase tracking-[0.3em] text-xs md:text-sm font-black transition-all duration-700 flex items-center justify-center gap-4 backdrop-blur-xl rounded-full bg-white/5 shadow-2xl"
            >
              <span>El Equipo</span>
              <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </TopoButton>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center opacity-40 animate-bounce transition-opacity duration-1000">
        <span className="font-body text-[8px] tracking-[0.5em] text-[var(--color-cream)] uppercase mb-3 font-black">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-[var(--color-sand)] to-transparent"></div>
      </div>
    </section>
  );
}
