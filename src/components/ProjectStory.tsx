"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RallyImage from "@/components/ui/RallyImage";
import { useT } from "@/i18n/LanguageProvider";

export default function ProjectStory() {
  const t = useT();
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
      className="relative w-full py-20 md:py-25 bg-bg-base overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

        {/* Waypoint Tag */}
        <span className="waypoint-tag block mb-6">{t.project.waypoint}</span>

        {/* Editorial Rule */}
        <div className="w-[460px] max-w-full h-px bg-slate mb-16"></div>

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
              <h2 className="font-heading text-[clamp(3rem,6vw,68px)] text-text-primary leading-[0.92] tracking-[2px] mb-10">
                {t.project.title.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < t.project.title.length - 1 && <br />}
                  </span>
                ))}
              </h2>

              <div className="space-y-6 text-[15px] text-text-primary/80 font-body leading-[1.7] max-w-[460px]">
                <p>{t.project.p1}</p>
                <p>{t.project.p2}</p>
              </div>

              {/* Technical Rules */}
              <div className="mt-10 space-y-1">
                <p className="font-mono text-[10px] tracking-[2px] text-sand">
                  {t.project.rules1}
                </p>
                <p className="font-mono text-[10px] tracking-[2px] text-sand">
                  {t.project.rules2}
                </p>
              </div>

              {/* Rust Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left" }}
                className="w-[120px] h-px bg-amber mt-8"
              />
            </motion.div>
          </motion.div>

          {/* Visual Column — Asymmetric Mosaic — spans 7 cols */}
          <div className="lg:col-span-7 relative min-h-[500px] md:min-h-[640px]">

            {/* Image 1: Large landscape — top right, hero shot */}
            <motion.div
              style={{ y: y1 }}
              className="relative md:absolute md:top-0 md:right-0 w-full md:w-[65%] aspect-[4/3] overflow-hidden shadow-tactical-lg"
            >
              <motion.div
                initial={{ opacity: 0, scale: 1.08 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <RallyImage
                  image="etapa-d05-erg-chebbi-amanecer"
                  fillParent
                  compact
                  overlay="none"
                  showCaption={false}
                  chamfer={false}
                />
              </motion.div>
              {/* Caption overlay.
                  El velo era `from-black/50` con texto `white/60`: dos colores
                  fijos que en el tema claro dejaban una banda negra pegada a
                  una pagina crema. Ahora es el MISMO patron que ya usa
                  BentoGallery para sus datos sobre foto — velo del color de
                  pagina (--color-bg-base) y tinta de texto del tema—, asi que
                  la banda es negra en tactical y crema en desert sola. */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg-base/85 to-transparent">
                <p className="font-mono text-[9px] tracking-[2px] text-text-secondary">
                  {t.project.imageCaption}
                </p>
              </div>
            </motion.div>

            {/* Image 2: Tall portrait — offset left, overlapping */}
            <motion.div
              style={{ y: y2 }}
              className="relative md:absolute md:top-[35%] md:left-0 w-[70%] md:w-[45%] aspect-[3/4] overflow-hidden shadow-tactical-lg mt-4 md:mt-0"
            >
              <motion.div
                initial={{ opacity: 0, scale: 1.08 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <RallyImage
                  image="etapa-d06-gargantas-todra"
                  fillParent
                  compact
                  overlay="none"
                  showCaption={false}
                  chamfer={false}
                />
              </motion.div>
            </motion.div>

            {/* Image 3: Small square — bottom right, detail shot */}
            <motion.div
              style={{ y: y3 }}
              className="relative md:absolute md:bottom-[-40px] md:right-[5%] w-[45%] md:w-[35%] aspect-square overflow-hidden shadow-tactical mt-4 md:mt-0 ml-auto md:ml-0"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <RallyImage
                  image="solidario-material-deportivo"
                  fillParent
                  compact
                  overlay="none"
                  showCaption={false}
                  chamfer={false}
                />
              </motion.div>
              {/* Accent border */}
              <div className="absolute inset-0 border-2 border-amber/20 pointer-events-none" />
            </motion.div>

            {/* GPS Caption below images */}
            <div className="hidden md:block absolute bottom-[-80px] left-0">
              <p className="gps-label leading-[1.8]">{t.project.gpsLocation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Side Label */}
      <div className="absolute -left-12 top-1/4 hidden xl:block">
        <span className="side-label">{t.project.sideLabel}</span>
      </div>
    </section>
  );
}
