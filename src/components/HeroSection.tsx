"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import DuneTransition from "@/components/ui/DuneTransition";
import { useT } from "@/i18n/LanguageProvider";

export default function HeroSection() {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-linked parallax for the hero
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY        = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale    = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY   = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const contentOp  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const indicatorOp = useTransform(scrollYProgress, [0, 0.15], [0.3, 0]);

  // Mouse-driven parallax (counter-motion, max ~16px)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });

  const handleMouse = (e: React.MouseEvent) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    mx.set(-nx * 18);
    my.set(-ny * 18);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouse}
      className="relative w-full min-h-screen flex flex-col justify-end bg-[var(--color-bg-dark)]"
    >
      {/* Hero Background Image — scroll + mouse parallax */}
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        style={{ y: bgY, scale: bgScale }}
      >
        <motion.div className="absolute inset-0" style={{ x: sx, y: sy }}>
          <Image
            src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=2070"
            alt="Desert expedition landscape"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        {/* Dark vignette overlay for depth and contrast */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(42, 37, 34, 0.7) 0%,
                rgba(42, 37, 34, 0.2) 30%,
                rgba(42, 37, 34, 0.1) 50%,
                rgba(42, 37, 34, 0.6) 75%,
                rgba(42, 37, 34, 0.95) 100%
              )
            `,
          }}
        />
        {/* Left side gradient for text area */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(42, 37, 34, 0.5) 0%, transparent 60%)",
          }}
        />
      </motion.div>

      {/* Noise Layer */}
      <div className="absolute inset-0 z-10 noise-bg pointer-events-none" />

      {/* GPS Coordinates — top left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-32 left-8 md:left-12 z-20 hidden md:block"
      >
        <p className="font-mono text-[11px] tracking-[3px] text-[var(--color-text-light)]/50">
          32&deg;03&apos;12.5&quot;N
        </p>
        <p className="font-mono text-[11px] tracking-[3px] text-[var(--color-text-light)]/50">
          1&deg;01&apos;45.8&quot;W
        </p>
      </motion.div>

      {/* Side Vertical Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 1.6 }}
        className="absolute right-8 top-48 z-20 hidden lg:block"
      >
        <span
          className="font-mono text-[10px] tracking-[8px] text-[var(--color-text-light)]/10 uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          {t.hero.expedition}
        </span>
      </motion.div>

      {/* ━━━ Hero Content ━━━ */}
      <motion.div
        className="relative z-20 w-full"
        style={{ marginTop: "40vh", y: contentY, opacity: contentOp }}
      >
        {/* Editorial Tag */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="px-6 md:px-12 mb-6"
        >
          <p className="font-mono text-[10px] md:text-[11px] tracking-[4px] text-[var(--color-rust)] uppercase">
            {t.hero.tag}
          </p>
        </motion.div>

        {/* Main Title — staggered line reveal */}
        <div className="px-6 md:px-12">
          <h1
            className="font-heading text-[var(--color-text-light)] leading-[0.88] tracking-[-2px]"
            style={{ fontSize: "clamp(3rem, 10vw, 148px)" }}
          >
            {t.hero.title.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 1.1,
                    delay: 0.35 + i * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="block"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>

        {/* Editorial Rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="px-6 md:px-12 mt-6"
        >
          <div className="w-24 h-[2px] bg-[var(--color-rust)]" />
        </motion.div>

        {/* Bottom Section: Description + Stats */}
        <div className="px-6 md:px-12 mt-6 pb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          {/* Left: Subtitle + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md"
          >
            <p className="font-body text-sm text-[var(--color-text-light)]/70 leading-[1.8] tracking-[0.5px] mb-8">
              {t.hero.description}
            </p>

            <Link
              href="/patrocinio"
              className="inline-flex items-center gap-3 px-9 py-3.5 bg-[var(--color-rust)] text-[var(--color-text-light)] font-body text-xs font-semibold uppercase tracking-[3px] transition-all duration-300 hover:bg-[var(--color-text-light)] hover:text-[var(--color-bg-dark)] group"
            >
              {t.hero.cta}
              <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">
                {t.hero.ctaArrow}
              </span>
            </Link>
          </motion.div>

          {/* Right: Stats Strip — stagger reveal */}
          <div className="flex gap-10 md:gap-14">
            {[
              { num: "4",    label: t.hero.stats.cars },
              { num: "8",    label: t.hero.stats.drivers },
              { num: "3000", label: t.hero.stats.distance, suffix: "km" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 1.2 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <p className="font-heading text-3xl md:text-4xl text-[var(--color-text-light)]">
                  {s.num}
                  {s.suffix && (
                    <span className="text-lg text-[var(--color-rust)]">{s.suffix}</span>
                  )}
                </p>
                <p className="font-mono text-[10px] tracking-[2px] text-[var(--color-text-light)]/40 uppercase mt-1">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Dune transition — overlays the hero image at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <DuneTransition toColor="#F7F4EB" lineColor="#F7F4EB" height={280} />
      </div>

      {/* Scroll Indicator — fades out as user scrolls */}
      <motion.div
        style={{ opacity: indicatorOp }}
        className="absolute bottom-72 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-bounce-subtle"
      >
        <span className="font-mono text-[8px] tracking-[0.5em] text-[var(--color-text-light)] uppercase mb-3">
          {t.hero.scroll}
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-[var(--color-text-light)] to-transparent" />
      </motion.div>
    </section>
  );
}
