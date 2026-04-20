"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
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
  bgImage,
}: SubPageHeroProps) {
  const ref = useRef<HTMLElement>(null);

  // Scroll parallax without React re-renders
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY     = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY   = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const textOp  = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Subtle mouse drift on bg
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 55, damping: 20, mass: 0.6 });

  const handleMouse = (e: React.MouseEvent) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    mx.set(-nx * 14);
    my.set(-ny * 14);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouse}
      className="relative w-full min-h-[70vh] flex flex-col justify-end overflow-hidden bg-[var(--color-bg-sand)]"
    >
      {/* Background Image — scroll + mouse parallax */}
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        style={{ y: bgY, scale: bgScale }}
      >
        <motion.div className="absolute inset-0" style={{ x: sx, y: sy }}>
          <Image
            src={
              bgImage ||
              "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=2070"
            }
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        {/* Gradient overlays */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(180deg, #F7F4EB 0%, transparent 30%, transparent 50%, #2A2522CC 100%)",
          }}
        />
      </motion.div>

      {/* Noise Texture */}
      <div className="absolute inset-0 z-10 noise-bg pointer-events-none" />

      {/* GPS HUD */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-28 left-12 z-20 hidden md:block"
      >
        <p className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-light)]/40">
          {coords}
        </p>
        <p className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-light)]/40">
          ALT: {altitude}
        </p>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity: textOp }}
        className="relative z-20 px-6 md:px-16 pb-12"
      >
        <h1 className="font-heading text-[clamp(3rem,10vw,140px)] text-[var(--color-text-light)] leading-[0.88] tracking-[3px] mb-4">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {title}
            </motion.span>
          </span>
        </h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-body text-lg text-[var(--color-text-light)]/60 tracking-[1px] max-w-md"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>

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
