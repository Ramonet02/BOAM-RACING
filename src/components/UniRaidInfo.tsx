"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const specBadges = [
  { label: "ENGINE", value: "1.6L", desc: "Zetec inline-4 · Front-Wheel Drive", variant: "light" as const },
  { label: "PROTECTION", value: "SUMP GUARD", desc: "Custom steel skid plate", variant: "light" as const },
  { label: "DRIVETRAIN", value: "2WD", desc: "FRONT-WHEEL DRIVE", variant: "rust" as const },
  { label: "SUSPENSION", value: "RAISED", desc: "Modified rally suspension lift", variant: "moss" as const },
];

export default function UniRaidInfo() {
  return (
    <section id="uniraid" className="relative w-full py-40 overflow-hidden bg-[var(--color-bg-sand)]">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

        {/* Waypoint Tag */}
        <div className="text-right mb-6">
          <span className="waypoint-tag">[ 02 ]  THE MACHINE</span>
        </div>

        {/* Editorial Rule */}
        <div className="ml-auto w-[500px] max-w-full h-px bg-[var(--color-border)] mb-6"></div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* Car Image Column */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full aspect-[4/3] overflow-hidden shadow-[0_20px_48px_rgba(42,37,34,0.25)]"
            >
              <Image
                src="https://images.unsplash.com/photo-1493558103817-58596001222b?auto=format&fit=crop&q=80&w=2070"
                alt="Ford Escort MK6"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Detail Image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="absolute -bottom-8 right-4 w-[220px] h-[240px] overflow-hidden shadow-[0_12px_32px_rgba(42,37,34,0.2)] hidden md:block"
            >
              <Image
                src="https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=600"
                alt="Car detail"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Spec line */}
            <p className="font-mono text-[9px] tracking-[2px] text-[var(--color-text-secondary)] mt-16">
              1998 FORD ESCORT MK6 &middot; 1.6L ZETEC &middot; 2WD &middot; SUMP GUARD
            </p>
          </div>

          {/* Content Column */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              <h2 className="font-heading text-[clamp(3.5rem,8vw,110px)] text-[var(--color-text-primary)] leading-[0.88] tracking-[3px] mb-6">
                1998 FORD<br />
                ESCORT
              </h2>

              <p className="font-body text-lg text-[var(--color-text-secondary)] italic mb-4">
                Not to impress. Built to survive the dunes.
              </p>

              {/* Machine Spec Line */}
              <div className="h-px bg-[var(--color-border)] mb-8"></div>
              <p className="font-mono text-[10px] tracking-[2px] text-[var(--color-text-secondary)] mb-12">
                1998 FORD ESCORT MK6 &middot; 1.6L ZETEC &middot; FWD &middot; CUSTOM SUMP GUARD
              </p>

              {/* Spec Badges */}
              <div className="grid grid-cols-2 gap-4">
                {specBadges.map((badge, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className={`p-4 flex flex-col gap-1 ${
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
          </div>
        </div>
      </div>

      {/* Side Label */}
      <div className="absolute right-0 top-1/4 hidden xl:block">
        <span className="side-label">02 — THE MACHINE</span>
      </div>
    </section>
  );
}
