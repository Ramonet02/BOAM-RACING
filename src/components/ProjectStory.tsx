"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ProjectStory() {
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll progress across the whole section (enters → leaves viewport)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Different parallax speeds per image → depth
  const y1 = useTransform(scrollYProgress, [0, 1], [60,  -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [90,  -90]);
  const y3 = useTransform(scrollYProgress, [0, 1], [30,  -30]);

  // Text column drifts gently in the opposite direction
  const textY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <section
      id="proyecto"
      ref={sectionRef}
      className="relative w-full py-32 md:py-40 bg-[var(--color-bg-sand)] overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

        {/* Waypoint Tag */}
        <span className="waypoint-tag block mb-6">[ 01 ]  WHAT IS UNIRAID</span>

        {/* Editorial Rule */}
        <div className="w-[460px] max-w-full h-px bg-[var(--color-border)] mb-16"></div>

        {/* Main Grid: Text Left + Images Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

          {/* Content Column — spans 5 cols */}
          <motion.div className="lg:col-span-5" style={{ y: textY }}>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="font-heading text-[clamp(3rem,6vw,68px)] text-[var(--color-text-primary)] leading-[0.92] tracking-[2px] mb-10">
                MORE THAN<br />
                A RALLY.<br />
                A RITE OF<br />
                PASSAGE.
              </h2>

              <div className="space-y-6 text-[15px] text-[var(--color-text-primary)]/80 font-body leading-[1.7] max-w-[460px]">
                <p>
                  Uniraid is a solidarity adventure across Morocco for students. The rules are brutal: 20-year-old minimum car age, no GPS, no support vehicles. Just a roadbook, a compass, and a trunk full of charity supplies for desert villages.
                </p>
                <p>
                  More than a race — it&apos;s a test of perseverance, navigation, and human spirit across 6,000 kilometers of unforgiving terrain.
                </p>
              </div>

              {/* Technical Rules */}
              <div className="mt-10 space-y-1">
                <p className="font-mono text-[10px] tracking-[2px] text-[var(--color-moss)]">
                  RULES &middot; NO GPS &middot; NO SUPPORT &middot; 20YR+ CARS
                </p>
                <p className="font-mono text-[10px] tracking-[2px] text-[var(--color-moss)]">
                  CARGO &middot; CHARITY SUPPLIES FOR DESERT VILLAGES
                </p>
              </div>

              {/* Rust Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left" }}
                className="w-[120px] h-px bg-[var(--color-rust)] mt-8"
              />
            </motion.div>
          </motion.div>

          {/* Visual Column — Asymmetric Mosaic — spans 7 cols */}
          <div className="lg:col-span-7 relative min-h-[500px] md:min-h-[640px]">

            {/* Image 1: Large landscape — top right, hero shot */}
            <motion.div
              style={{ y: y1 }}
              className="relative md:absolute md:top-0 md:right-0 w-full md:w-[65%] aspect-[4/3] overflow-hidden shadow-[0_20px_48px_rgba(42,37,34,0.15)]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 1.08 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=1200"
                  alt="Sahara desert dunes"
                  fill
                  className="object-cover"
                />
              </motion.div>
              {/* Caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <p className="font-mono text-[9px] tracking-[2px] text-white/60">
                  ERG CHEBBI &middot; 31&deg;09&apos;N
                </p>
              </div>
            </motion.div>

            {/* Image 2: Tall portrait — offset left, overlapping */}
            <motion.div
              style={{ y: y2 }}
              className="relative md:absolute md:top-[35%] md:left-0 w-[70%] md:w-[45%] aspect-[3/4] overflow-hidden shadow-[0_16px_40px_rgba(42,37,34,0.2)] mt-4 md:mt-0"
            >
              <motion.div
                initial={{ opacity: 0, scale: 1.08 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src="https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&q=80&w=800"
                  alt="Morocco desert road"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </motion.div>

            {/* Image 3: Small square — bottom right, detail shot */}
            <motion.div
              style={{ y: y3 }}
              className="relative md:absolute md:bottom-[-40px] md:right-[5%] w-[45%] md:w-[35%] aspect-square overflow-hidden shadow-[0_12px_32px_rgba(42,37,34,0.18)] mt-4 md:mt-0 ml-auto md:ml-0"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src="https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=600"
                  alt="Desert sand texture"
                  fill
                  className="object-cover"
                />
              </motion.div>
              {/* Accent border */}
              <div className="absolute inset-0 border-2 border-[var(--color-rust)]/20 pointer-events-none" />
            </motion.div>

            {/* GPS Caption below images */}
            <div className="hidden md:block absolute bottom-[-80px] left-0">
              <p className="gps-label leading-[1.8]">
                Atlas Mountains, Morocco<br />
                31&deg;45&apos;N &nbsp;7&deg;05&apos;W &middot; ALT 2,167m
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Side Label */}
      <div className="absolute -left-12 top-1/4 hidden xl:block">
        <span className="side-label">01 — WHAT IS UNIRAID</span>
      </div>
    </section>
  );
}
