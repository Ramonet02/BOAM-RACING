"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useT } from "@/i18n/LanguageProvider";

export default function UniRaidInfo() {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);

  // Build spec badges from the current translation dictionary. The
  // `variant` styles are static since they're colour decisions, not copy.
  const specBadges = [
    { ...t.car.specs.engine,     variant: "light" as const },
    { ...t.car.specs.protection, variant: "light" as const },
    { ...t.car.specs.drivetrain, variant: "rust"  as const },
    { ...t.car.specs.suspension, variant: "moss"  as const },
  ];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax speeds — car image drifts up slowly, detail drifts opposite
  const carY    = useTransform(scrollYProgress, [0, 1], [50,  -50]);
  const detailY = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const titleY  = useTransform(scrollYProgress, [0, 1], [30,  -30]);

  return (
    <section
      id="uniraid"
      ref={sectionRef}
      className="relative w-full py-40 overflow-hidden bg-[var(--color-bg-sand)]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

        {/* Waypoint Tag */}
        <div className="text-right mb-6">
          <span className="waypoint-tag">{t.car.waypoint}</span>
        </div>

        {/* Editorial Rule */}
        <div className="ml-auto w-[500px] max-w-full h-px bg-[var(--color-border)] mb-6"></div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* Car Image Column */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div
              style={{ y: carY }}
              className="relative w-full aspect-[4/3] overflow-hidden shadow-[0_20px_48px_rgba(42,37,34,0.25)]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 1.08 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src="https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=2070"
                  alt="Ford Escort MK6"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </motion.div>

            {/* Detail Image — parallax in opposite direction */}
            <motion.div
              style={{ y: detailY }}
              className="absolute -bottom-8 right-4 w-[220px] h-[240px] overflow-hidden shadow-[0_12px_32px_rgba(42,37,34,0.2)] hidden md:block"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src="https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=600"
                  alt="Car detail"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </motion.div>

            {/* Spec line */}
            <p className="font-mono text-[9px] tracking-[2px] text-[var(--color-text-secondary)] mt-16">
              {t.car.specLineShort}
            </p>
          </div>

          {/* Content Column */}
          <div className="w-full lg:w-1/2">
            <motion.div style={{ y: titleY }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-heading text-[clamp(3.5rem,8vw,110px)] text-[var(--color-text-primary)] leading-[0.88] tracking-[3px] mb-6">
                  {t.car.title.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < t.car.title.length - 1 && <br />}
                    </span>
                  ))}
                </h2>

                <p className="font-body text-lg text-[var(--color-text-secondary)] italic mb-4">
                  {t.car.italic}
                </p>

                {/* Machine Spec Line */}
                <div className="h-px bg-[var(--color-border)] mb-8"></div>
                <p className="font-mono text-[10px] tracking-[2px] text-[var(--color-text-secondary)] mb-12">
                  {t.car.specLine}
                </p>

                {/* Spec Badges */}
                <div className="grid grid-cols-2 gap-4">
                  {specBadges.map((badge, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 24, scale: 0.96 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{
                        delay: 0.2 + i * 0.1,
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{ y: -4, transition: { duration: 0.25 } }}
                      className={`p-4 flex flex-col gap-1 cursor-default ${
                        badge.variant === "rust"
                          ? "bg-[var(--color-rust)] text-[var(--color-text-light)]"
                          : badge.variant === "moss"
                          ? "bg-[var(--color-moss)] text-[var(--color-text-light)]"
                          : "bg-white border border-[var(--color-border)] shadow-sm backdrop-blur-sm"
                      }`}
                    >
                      <span className={`font-mono text-[8px] tracking-[4px] ${
                        badge.variant === "light" ? "text-[var(--color-text-secondary)]" : "text-white/70"
                      }`}>
                        {badge.label}
                      </span>
                      <span className={`font-heading text-2xl tracking-[1px] ${
                        badge.variant === "light" ? "text-[var(--color-text-primary)]" : ""
                      }`}>
                        {badge.value}
                      </span>
                      <span className={`font-body text-[11px] ${
                        badge.variant === "light" ? "text-[var(--color-text-secondary)]" : "text-white/80"
                      }`}>
                        {badge.desc}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Side Label */}
      <div className="absolute right-0 top-1/4 hidden xl:block">
        <span className="side-label">{t.car.sideLabel}</span>
      </div>
    </section>
  );
}
