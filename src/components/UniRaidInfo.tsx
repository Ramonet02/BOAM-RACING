"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RallyImage from "@/components/ui/RallyImage";
import { useT } from "@/i18n/LanguageProvider";

export default function UniRaidInfo() {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);

  // Build spec badges from the current translation dictionary. The
  // `variant` styles are static since they're colour decisions, not copy.
  //
  // Los nombres de variante son historicos ("rust", "moss") y se conservan
  // para no tocar la estructura, pero ya NO pintan los tokens legacy del
  // mismo nombre: rust -> --color-amber y moss -> --color-sand, que es a lo
  // que apuntaba el puente legacy de globals.css. Asi el chip sigue el tema
  // activo sin que cambie ni un pixel en tactical.
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
      className="relative w-full py-25 overflow-hidden bg-bg-base"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

        {/* Waypoint Tag */}
        <div className="text-right mb-6">
          <span className="waypoint-tag">{t.car.waypoint}</span>
        </div>

        {/* Editorial Rule */}
        <div className="ml-auto w-[500px] max-w-full h-px bg-slate mb-6"></div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* Car Image Column */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div
              style={{ y: carY }}
              className="relative w-full aspect-[4/3] overflow-hidden shadow-tactical-lg"
            >
              <motion.div
                initial={{ opacity: 0, scale: 1.04 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <RallyImage
                  image="coches-formacion"
                  fillParent
                  compact
                  overlay="none"
                  showCaption={false}
                  chamfer={false}
                />
              </motion.div>
            </motion.div>

            {/* Detail Image — parallax in opposite direction */}
            <motion.div
              style={{ y: detailY }}
              className="absolute -bottom-8 right-4 w-[220px] h-[240px] overflow-hidden shadow-tactical hidden md:block"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="absolute inset-0"
              >
                <RallyImage
                  image="coche-detalle-rotulacion"
                  fillParent
                  compact
                  overlay="none"
                  showCaption={false}
                  chamfer={false}
                />
              </motion.div>
            </motion.div>

            {/* Spec line */}
            <p className="font-mono text-[0.6875rem] tracking-[2px] text-text-secondary mt-16">
              {t.car.specLineShort}
            </p>
          </div>

          {/* Content Column */}
          <div className="w-full lg:w-1/2">
            <motion.div style={{ y: titleY }}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-heading text-[clamp(3.5rem,8vw,110px)] text-text-primary leading-[0.88] tracking-[3px] mb-6">
                  {t.car.title.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < t.car.title.length - 1 && <br />}
                    </span>
                  ))}
                </h2>

                <p className="font-body text-lg text-text-secondary italic mb-4">
                  {t.car.italic}
                </p>

                {/* Machine Spec Line */}
                <div className="h-px bg-slate mb-8"></div>
                <p className="font-mono text-[0.6875rem] tracking-[2px] text-text-secondary mb-12">
                  {t.car.specLine}
                </p>

                {/* Spec Badges */}
                <div className="grid grid-cols-2 gap-4">
                  {specBadges.map((badge, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{
                        delay: 0.05 + i * 0.05,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{ y: -4, transition: { duration: 0.25 } }}
                      className={`p-4 flex flex-col gap-1 cursor-default ${
                        badge.variant === "rust"
                          ? "bg-amber-solid text-text-inverse"
                          : badge.variant === "moss"
                          ? "bg-sand-solid text-text-inverse"
                          : "bg-bg-elevated border border-slate"
                      }`}
                    >
                      {/*
                        Texto a OPACIDAD COMPLETA en las variantes rust/moss:
                        --color-amber (3.87:1) y --color-sand (3.30:1 inverso
                        / 4.03:1 primary) no aguantan 4.5:1 con NADA encima, y
                        menos aun atenuado al 70-80%. Los tonos *-solid ya
                        estan calibrados para texto inverso a opacidad plena
                        (5.30-5.34:1); diluirlos habria vuelto a romper el
                        mismo caso que arregla el token.
                      */}
                      <span className={`font-mono text-[0.6875rem] tracking-[4px] ${
                        badge.variant === "light" ? "text-text-secondary" : "text-text-inverse"
                      }`}>
                        {badge.label}
                      </span>
                      <span className={`font-heading text-2xl tracking-[1px] ${
                        badge.variant === "light" ? "text-text-primary" : ""
                      }`}>
                        {badge.value}
                      </span>
                      <span className={`font-body text-[0.6875rem] ${
                        badge.variant === "light" ? "text-text-secondary" : "text-text-inverse"
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
      {/* Decorativo (marca de agua a 1,1:1): fuera del árbol de accesibilidad,
          como los rótulos laterales del resto de secciones. */}
      <div aria-hidden="true" className="absolute right-0 top-1/4 hidden xl:block">
        <span className="side-label">{t.car.sideLabel}</span>
      </div>
    </section>
  );
}
