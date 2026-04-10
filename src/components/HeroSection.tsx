"use client";

import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-end overflow-hidden bg-[var(--color-bg-sand)]">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=2070"
          alt="Desert expedition"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient fade: top sand, bottom dark */}
        <div className="absolute inset-0 z-10" style={{
          background: "linear-gradient(180deg, #F7F4EB 0%, transparent 25%, transparent 55%, #2A2522DD 100%)"
        }}></div>
        {/* Left fade */}
        <div className="absolute inset-0 z-10" style={{
          background: "linear-gradient(90deg, #2A252288 0%, transparent 50%)"
        }}></div>
      </div>

      {/* Noise Layer */}
      <div className="absolute inset-0 z-10 noise-bg pointer-events-none"></div>

      {/* GPS Coordinates */}
      <div className="absolute top-36 left-12 z-20 hidden md:block">
        <p className="font-mono text-[11px] tracking-[3px] text-[var(--color-text-light)]/40">32&deg;03&apos;12.5&quot;N</p>
        <p className="font-mono text-[11px] tracking-[3px] text-[var(--color-text-light)]/40">1&deg;01&apos;45.8&quot;W</p>
      </div>

      {/* Editorial Tag */}
      <div className="absolute left-12 z-20 hidden md:block" style={{ top: "calc(100vh - 580px)" }}>
        <p className="font-mono text-[10px] tracking-[4px] text-[var(--color-text-light)]/30 uppercase">
          Student Solidarity Rally &middot; 4-Car Fleet &middot; Morocco 2026
        </p>
      </div>

      {/* Side Vertical Label */}
      <div className="absolute right-8 top-48 z-20 hidden lg:block">
        <span className="font-mono text-[10px] tracking-[8px] text-[var(--color-text-primary)]/10 uppercase" style={{ writingMode: "vertical-rl" }}>
          Expedition &middot; 2026
        </span>
      </div>

      {/* Organic Hero Images (floating) */}
      <div className="absolute right-16 z-20 hidden lg:block" style={{ top: "240px" }}>
        <div className="relative w-[280px] h-[200px] rounded-none overflow-hidden shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?auto=format&fit=crop&q=80&w=800"
            alt="Desert landscape"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="absolute right-8 z-20 hidden lg:block" style={{ top: "340px" }}>
        <div className="relative w-[380px] h-[480px] rounded-none overflow-hidden shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=800"
            alt="Rally car"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Main Title — Massive */}
      <div className="relative z-20 w-full px-6 md:px-0" style={{ marginTop: "40vh" }}>
        <h1
          className="font-heading text-[var(--color-text-light)] leading-[0.88] tracking-[-2px] w-full text-center md:text-left md:pl-0"
          style={{ fontSize: "clamp(3rem, 10vw, 148px)" }}
        >
          <span className="block">ONE MISSION.</span>
          <span className="block">FOUR CLASSICS.</span>
          <span className="block">ZERO GPS.</span>
        </h1>
      </div>

      {/* Editorial Rule */}
      <div className="relative z-20 px-6 md:px-12 mt-4">
        <div className="w-80 h-px bg-[var(--color-text-light)]/20"></div>
      </div>

      {/* Subtitle + CTA */}
      <div className="relative z-20 px-6 md:px-12 py-16 pb-24">
        <p className="font-body text-sm text-[var(--color-text-light)]/80 leading-[1.7] tracking-[1px] max-w-md mb-8">
          We are not just one car. We are a unified fleet of 4 classic vehicles taking on the ultimate desert challenge. Students bound by mechanics, solidarity, and the Moroccan dunes.
        </p>

        <div className="flex items-center gap-6 flex-wrap">
          <Link
            href="/patrocinio"
            className="inline-flex items-center gap-3 px-9 py-3.5 bg-[var(--color-rust)] text-[var(--color-text-light)] font-body text-xs font-semibold uppercase tracking-[3px] transition-colors hover:bg-[var(--color-bg-dark)]"
          >
            Follow the Journey
            <span className="text-sm">-&gt;</span>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center opacity-30 animate-bounce-subtle">
        <span className="font-mono text-[8px] tracking-[0.5em] text-[var(--color-text-light)] uppercase mb-3">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-[var(--color-text-light)] to-transparent"></div>
      </div>
    </section>
  );
}
