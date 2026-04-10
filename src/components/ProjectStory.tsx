"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ProjectStory() {
  return (
    <section id="proyecto" className="relative w-full py-40 bg-[var(--color-bg-sand)] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

        {/* Waypoint Tag */}
        <span className="waypoint-tag block mb-6">[ 01 ]  WHAT IS UNIRAID</span>

        {/* Editorial Rule */}
        <div className="w-[460px] max-w-full h-px bg-[var(--color-border)] mb-6"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* Content Column */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
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
              <div className="w-[120px] h-px bg-[var(--color-rust)] mt-8"></div>
            </motion.div>
          </div>

          {/* Visual Column — Organic Images */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full aspect-[4/5] overflow-hidden shadow-[0_20px_48px_rgba(42,37,34,0.2)]"
            >
              <Image
                src="https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=2070"
                alt="Rally expedition"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Secondary Image */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute -bottom-12 -left-8 w-2/3 aspect-video overflow-hidden shadow-[0_16px_40px_rgba(42,37,34,0.2)] hidden md:block"
            >
              <Image
                src="https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?auto=format&fit=crop&q=80&w=2070"
                alt="Desert landscape"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* GPS Caption */}
            <div className="mt-16 md:mt-20">
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
