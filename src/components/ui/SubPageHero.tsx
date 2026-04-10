"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
    <section className="relative w-full min-h-[70vh] flex flex-col justify-end overflow-hidden bg-[var(--color-bg-sand)]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage || "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=2070"}
          alt={title}
          fill
          className="object-cover"
          priority
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 z-10" style={{
          background: "linear-gradient(180deg, #F7F4EB 0%, transparent 30%, transparent 50%, #2A2522CC 100%)"
        }}></div>
      </div>

      {/* Noise Texture */}
      <div className="absolute inset-0 z-10 noise-bg pointer-events-none"></div>

      {/* GPS HUD */}
      <div className="absolute top-28 left-12 z-20 hidden md:block">
        <p className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-light)]/40">{coords}</p>
        <p className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-light)]/40">ALT: {altitude}</p>
      </div>

      {/* Content */}
      <div className="relative z-20 px-6 md:px-16 pb-12">
        <h1 className="font-heading text-[clamp(3rem,10vw,140px)] text-[var(--color-text-light)] leading-[0.88] tracking-[3px] mb-4 animate-fade-up">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-lg text-[var(--color-text-light)]/60 tracking-[1px] max-w-md animate-fade-up delay-200">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom TopoDivider */}
      <div className="relative z-20">
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
