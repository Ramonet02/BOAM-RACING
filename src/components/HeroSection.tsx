"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <HeroSection />
   Apertura de la home, tema "Rally Desert Tactical" (Modulo 1).
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   CAPAS (de fondo a frente)
     00  fondo        <RallyImage> a sangre, con parallax de scroll y de raton.
     10  scrims       degradados vertical y lateral + rejilla de plano.
     30  HUD          telemetria de esquina (GPS, rumbo) y rotulo vertical.
     20  suelo        lavado bajo el bloque de texto (solo en el tema claro).
     20  contenido    tag, titular, regla, copy, CTAs y contadores.
     20  marquee      banda de teletipo sobre el horizonte.
     20  divisoria    <RidgeDivider> — ULTIMO ELEMENTO EN FLUJO, no absoluto:
                      asi reserva su propio alto y no puede tapar el copy, y
                      la foto (inset-0) se sigue viendo tras las crestas
                      translucidas.

   REPARTO DE ANIMACION — y por que esta asi
   -----------------------------------------
   · La ENTRADA (aparicion de cada bloque) va en CSS, con las utilidades del
     design system (`animate-fade-up`, `animate-slide-left`, `animate-fade-in`)
     mas dos keyframes propios del titular, y el retardo por `animationDelay`
     en linea.
   · El PARALLAX (scroll y raton) va en framer-motion, que es para lo que
     hace falta JS.

   El motivo no es estetico. framer-motion serializa el estado `initial` en
   el HTML del servidor y solo lo resuelve al hidratar: si el bundle de
   cliente no llega (deploy a medias, chunk 404, JS bloqueado), un titular
   animado con `initial={{y:"108%"}}` dentro de un `overflow-hidden` se queda
   FUERA DE PANTALLA para siempre. Con la entrada en CSS el hero se lee
   entero sin una linea de JS, y el parallax simplemente no ocurre.
   Comprobado en el navegador contra este mismo repo.

   `prefers-reduced-motion` lo resuelve el bloque global de globals.css, que
   pone `animation-duration: .001ms !important` sobre `*`: cada animacion de
   entrada salta a su fotograma final (contenido visible, cero movimiento) y
   gana incluso a los `animationDelay` en linea. El parallax de framer-motion
   se apaga aparte, consultando `useReducedMotion()`, porque escribe
   transforms inline por JS y el CSS no puede pararlo.

   DATOS Y COPY — ni una cifra ni una fecha escritas a mano:
     · copy   -> `useT()` (los tokens {edition}/{crew}/{cars} llegan ya
                 resueltos por el compositor de i18n).
     · cifras -> `PROJECT_FACTS`, derivado de route.ts y team.ts.
     · coords -> `HERO_COORDS.dms` de constants.ts.
     · imagen -> manifiesto de `src/lib/imagery.ts` (hoy, paisaje del Erg
                 Chebbi de Wikimedia Commons con su credito en el footer).
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Pause, Play } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import DossierLink from "@/components/ui/DossierLink";
import RallyImage from "@/components/ui/RallyImage";
import RidgeDivider from "@/components/ui/RidgeDivider";
import { HERO_COORDS, PROJECT_FACTS } from "@/lib/constants";
import { useLocale, useT } from "@/i18n/LanguageProvider";
import type { Locale } from "@/i18n/translations";

/** Foto de cabecera de la home, segun el manifiesto de `imagery.ts`. */
const HERO_IMAGE_ID = "portada-home-duna-amanecer";

/**
 * Hoja propia del hero. Dos cosas dentro:
 *
 * 1. Keyframes del titular editorial: la linea sube desde debajo de su propia
 *    caja recortada, y la regla crece desde la izquierda. No estan en el
 *    design system porque son especificos de este hero.
 *
 * 2. CALIBRACION POR TEMA de las capas que van SOBRE la fotografia. Esto no
 *    se resuelve con tokens de color: lo que cambia entre temas no es el
 *    color (ese ya sale de --base-rgb) sino CUANTA foto se deja pasar. En
 *    oscuro, texto claro sobre foto oscura se lee con el scrim suave de
 *    siempre; en claro, texto oscuro sobre esa misma foto se vuelve
 *    ilegible en cuanto la foto asoma. La dosis es un dato del tema.
 *
 * Van en un <style> del componente, no en globals.css, por dos razones:
 * globals.css es de otro modulo, y asi el hero es autocontenido. El bloque
 * global de `prefers-reduced-motion` desactiva las animaciones igual, porque
 * actua sobre `*` con `!important`.
 *
 * Las reglas de tema SOLO declaran custom properties. Es deliberado: al ir
 * sin @layer ganarian a cualquier utilidad de Tailwind, y una variable no
 * pinta nada por si misma. Quien pinta es el `style` en linea del elemento.
 *
 * El selector se escribe igual que en globals.css, comillas incluidas:
 * React no escapa el texto de un <style>, asi que llega intacto al DOM
 * (comprobado con el react-dom del propio repo, no por costumbre).
 *
 * Por defecto = DESERT y tactical se reescribe entero: mismo criterio que
 * globals.css, de modo que sin JS —o antes del script anti-parpadeo— el hero
 * ya sale calibrado para el tema primario.
 */
const HERO_STYLES = `
@keyframes boam-hero-line { from { transform: translate3d(0, 112%, 0); } to { transform: none; } }
@keyframes boam-hero-rule { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.boam-hero-line { animation: boam-hero-line 0.6s var(--ease-tactical) both; }
.boam-hero-rule { transform-origin: left; animation: boam-hero-rule 0.5s var(--ease-tactical) both; }

/* DESERT · la foto se lava hacia crema, pero se tiene que VER: con foto real
   el velo anterior (0.46-0.94 + lavado de texto a todo el ancho) la dejaba
   invisible. Ahora el centro queda en 0.18-0.28 y la legibilidad la pone el
   lavado del texto, que en md+ solo cubre la columna del titular (ver la
   mascara en TEXT_WASH_MASK) y deja la mitad derecha a la foto. */
.boam-hero {
  --hero-scrim-v: linear-gradient(180deg,
    rgb(var(--base-rgb) / 0.80) 0%,
    rgb(var(--base-rgb) / 0.28) 22%,
    rgb(var(--base-rgb) / 0.18) 46%,
    rgb(var(--base-rgb) / 0.50) 76%,
    rgb(var(--base-rgb) / 0.92) 100%);
  --hero-scrim-h: linear-gradient(90deg,
    rgb(var(--base-rgb) / 0.62) 0%,
    rgb(var(--base-rgb) / 0.22) 42%,
    transparent 72%);
  /* Suelo del bloque de texto. 0.985 y no 0.90: con 0.90, una foto oscura
     por debajo dejaba .telemetry-label (4.95:1 en limpio) en 4.1:1. */
  --hero-text-wash: 0.985;
  /* Plancha bajo el HUD flotante, que cae justo en la franja donde la foto
     sigue al ~50 %. Se disuelve hacia la foto: no se lee como pegatina. */
  --hero-plate: 0.94;
  --hero-marquee: 0.94;
}

/* TACTICAL · valores originales, uno a uno. Si algo cambia aqui es un bug:
   los dos degradados son exactamente los que tenia el hero antes de existir
   el tema claro, y los tres lavados valen 0 / 0 / 0.55, es decir "no hay
   plancha, no hay lavado y el teletipo mantiene su 55 %". */
:root[data-theme="tactical"] .boam-hero {
  --hero-scrim-v: linear-gradient(180deg,
    rgb(var(--base-rgb) / 0.92) 0%,
    rgb(var(--base-rgb) / 0.45) 22%,
    rgb(var(--base-rgb) / 0.30) 46%,
    rgb(var(--base-rgb) / 0.72) 76%,
    rgb(var(--base-rgb) / 0.96) 100%);
  --hero-scrim-h: linear-gradient(90deg,
    rgb(var(--base-rgb) / 0.88) 0%,
    rgb(var(--base-rgb) / 0.35) 42%,
    transparent 72%);
  --hero-text-wash: 0;
  --hero-plate: 0;
  --hero-marquee: 0.55;
}
`;

/** Suelo del bloque de texto. Transparente por arriba para entrar sin canto,
 *  opaco desde el 18 % de su caja. En tactical la variable vale 0 y la capa
 *  es literalmente invisible. */
const TEXT_WASH =
  "linear-gradient(180deg," +
  " rgb(var(--base-rgb) / 0) 0%," +
  " rgb(var(--base-rgb) / var(--hero-text-wash)) 18%," +
  " rgb(var(--base-rgb) / var(--hero-text-wash)) 100%)";

/** En md+ el titular ocupa la mitad izquierda: el lavado se queda ahi y se
 *  disuelve hacia la derecha para no tapar la foto. En movil el texto va a
 *  todo el ancho y el lavado tambien. En tactical el lavado vale 0, asi que
 *  la mascara no cambia nada. */
const TEXT_WASH_MASK =
  "md:[mask-image:linear-gradient(90deg,#000_0%,#000_42%,transparent_72%)]";

/* Planchas bajo el HUD y el rotulo vertical. Radiales y no lineales: un
   degradado lineal solo disuelve un eje, y con la foto ya visible los otros
   dos cantos se leian como una caja pegada encima. La elipse se apaga hacia
   todos los lados, asi que queda un halo detras del texto, sin bordes. */

/** Plancha del HUD derecho: halo centrado en el texto, que va pegado a la derecha. */
const PLATE_RIGHT =
  "radial-gradient(ellipse 62% 58% at 78% 50%," +
  " rgb(var(--base-rgb) / var(--hero-plate)) 0%," +
  " rgb(var(--base-rgb) / calc(var(--hero-plate) * 0.75)) 45%," +
  " rgb(var(--base-rgb) / 0) 100%)";

/** Plancha del rotulo vertical: halo alargado, se apaga por los cuatro cantos. */
const PLATE_VERTICAL =
  "radial-gradient(ellipse 50% 50% at 50% 50%," +
  " rgb(var(--base-rgb) / var(--hero-plate)) 0%," +
  " rgb(var(--base-rgb) / calc(var(--hero-plate) * 0.75)) 55%," +
  " rgb(var(--base-rgb) / 0) 100%)";

/**
 * Retardo (y, si se pide, duración) de entrada en linea; los anula el bloque
 * de reduced-motion, que va con `!important`.
 *
 * La coreografía entera cabe en ~0,8 s. Antes la descripción y los botones
 * esperaban 0,95 s y tardaban 0,8 s más en entrar: casi dos segundos para
 * poder leer la propuesta de valor, que es justo lo que la home tiene que
 * dejar clara primero (NN/g: 100–500 ms por animación).
 */
function delay(seconds: number, duration?: number): CSSProperties {
  return duration === undefined
    ? { animationDelay: `${seconds}s` }
    : { animationDelay: `${seconds}s`, animationDuration: `${duration}s` };
}

/**
 * Agrupa millares a mano — "1.885" en es/ca, "1,885" en en.
 *
 * Deliberadamente sin `Intl`: `toLocaleString` puede discrepar entre el Node
 * del build y el navegador (datos ICU distintos) y eso seria un error de
 * hidratacion dentro del copy. Mismo criterio que el compositor de i18n.
 */
function groupThousands(value: number, locale: Locale): string {
  const separator = locale === "en" ? "," : ".";
  const digits = Math.trunc(Math.abs(value)).toString();
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += separator;
    out += digits[i];
  }
  return value < 0 ? `-${out}` : out;
}

interface HeroStat {
  readonly value: string;
  readonly unit?: string;
  readonly label: string;
}

export default function HeroSection() {
  const t = useT();
  const { locale } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [marqueePaused, setMarqueePaused] = useState(false);
  const parallax = prefersReducedMotion !== true;

  /* ── Parallax de scroll ─────────────────────────────────────────────── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  /* ── Parallax de raton (contramovimiento, ~20px) ────────────────────── */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 60, damping: 18, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 60, damping: 18, mass: 0.6 });

  /* ── La caja del hero se mide UNA vez por entrada del puntero ─────────
     `getBoundingClientRect()` obliga al navegador a vaciar estilo y layout
     antes de contestar. Llamándolo en cada `mousemove` —hasta 120 veces por
     segundo— se paga ese vaciado una y otra vez, y encima justo después de
     que los muelles de framer-motion hayan escrito transformaciones, que es
     cuando el layout está sucio y el vaciado sale más caro. Medido en esta
     página: 2,3 ms por llamada, unos 280 ms de hilo principal por segundo
     mientras mueves el ratón. Eso es el tirón que se nota.

     La caja no cambia mientras mueves el ratón dentro del hero, así que se
     mide al entrar y se guarda. Si cambia el tamaño de la ventana se
     invalida. Un scroll a media pasada desajusta el origen unos píxeles de
     un efecto decorativo de ±20 px: no se percibe. */
  const boxRef = useRef<DOMRect | null>(null);

  const handleEnter = (event: MouseEvent<HTMLElement>) => {
    boxRef.current = event.currentTarget.getBoundingClientRect();
  };

  const handlePointer = (event: MouseEvent<HTMLElement>) => {
    const box = boxRef.current ?? event.currentTarget.getBoundingClientRect();
    boxRef.current = box;
    if (box.width === 0 || box.height === 0) return;
    pointerX.set(-((event.clientX - box.left) / box.width - 0.5) * 20);
    pointerY.set(-((event.clientY - box.top) / box.height - 0.5) * 20);
  };

  const resetPointer = () => {
    boxRef.current = null;
    pointerX.set(0);
    pointerY.set(0);
  };

  useEffect(() => {
    const invalidate = () => {
      boxRef.current = null;
    };
    window.addEventListener("resize", invalidate);
    return () => window.removeEventListener("resize", invalidate);
  }, []);

  /* ── Contadores: derivados, nunca escritos a mano ───────────────────── */
  const stats: readonly HeroStat[] = [
    { value: String(PROJECT_FACTS.fleetSize), label: t.hero.stats.cars },
    { value: String(PROJECT_FACTS.teamSize), label: t.hero.stats.drivers },
    {
      value: groupThousands(PROJECT_FACTS.moroccoKm, locale),
      unit: "km",
      label: t.hero.stats.distance,
    },
    { value: String(PROJECT_FACTS.days), label: t.hero.stats.days },
  ];

  /* ── Teletipo: dos mitades identicas para que el bucle a -50% cierre ── */
  const marqueeHalf = [...t.hero.marquee, ...t.hero.marquee, ...t.hero.marquee];
  const marqueeTrack = [...marqueeHalf, ...marqueeHalf];

  const lastTitleLine = t.hero.title.length - 1;

  return (
    <section
      ref={sectionRef}
      onMouseEnter={parallax ? handleEnter : undefined}
      onMouseMove={parallax ? handlePointer : undefined}
      onMouseLeave={parallax ? resetPointer : undefined}
      className="boam-hero dust-overlay relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-bg-base"
    >
      <style>{HERO_STYLES}</style>

      {/* ═══ 00 · Fondo ═══════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        style={parallax ? { y: backgroundY, scale: backgroundScale } : undefined}
      >
        {/* Sobredimensionado: el parallax de raton no llega a descubrir borde. */}
        {/* `will-change-transform`: esta capa la mueven los muelles del ratón
            en cada fotograma. Sin promocionarla, el navegador no la trata como
            capa propia y ese movimiento REPINTA la foto del hero entera en vez
            de limitarse a recolocar una textura ya rasterizada. El contenedor
            de fuera ya la llevaba; a ésta se le había olvidado. */}
        <motion.div
          className="absolute inset-[-5%] will-change-transform"
          style={parallax ? { x: smoothX, y: smoothY } : undefined}
        >
          <RallyImage
            image={HERO_IMAGE_ID}
            fillParent
            priority
            compact
            overlay="none"
            showCaption={false}
            chamfer={false}
            /* En vertical el recorte `cover` pide la foto mucho más ancha que
               la pantalla: a 375 px el hueco mide ~413×1153 y la foto 4:3 se
               pinta a ~1537 px de ancho. Con "100vw" el navegador bajaba la
               variante de 750 px y la ampliaba unas 4 veces en retina. */
            sizes="(orientation: portrait) 250vw, 100vw"
            objectPosition="center 45%"
          />
        </motion.div>
      </motion.div>

      {/* ═══ 10 · Scrims ══════════════════════════════════════════════════ */}
      {/* Las dos curvas viven en el <style> de arriba porque su dosis es un
          dato del tema. El color ya era tematico (--base-rgb); lo que no
          podia serlo, y ahora lo es, es cuanta foto dejan pasar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{ backgroundImage: "var(--hero-scrim-v)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{ backgroundImage: "var(--hero-scrim-h)" }}
      />
      <div
        aria-hidden="true"
        className="grid-blueprint grid-fade-y pointer-events-none absolute inset-0 z-10 opacity-40"
      />

      {/* ═══ 30 · HUD de telemetria ═══════════════════════════════════════
          Va en el flanco DERECHO: la columna izquierda la ocupa el titular,
          que arranca a la misma altura, y ahi se solapaban.

          El HUD cae en la franja alta, la unica donde la foto sigue viva al
          ~50 %, asi que en claro necesita suelo propio: la plancha se
          disuelve hacia la izquierda y no llega a leerse como una caja. En
          tactical --hero-plate vale 0 y esto es exactamente lo que habia.

          Los offsets estan recolocados para que el TEXTO siga donde estaba
          pese al relleno nuevo: right-5 + pr-5 = right-10 (en lg, right-11
          + pr-5 = right-16) y top-[6.5rem] + py-5 = top-28. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-[6.5rem] z-30 hidden flex-col items-end gap-4 py-5 pl-24 pr-5 md:flex lg:right-11"
        style={{ backgroundImage: PLATE_RIGHT }}
      >
        <div
          className="animate-slide-right flex flex-col items-end gap-2 border-r border-amber/45 pr-4"
          style={delay(0.4, 0.5)}
        >
          <p className="telemetry-label telemetry-label-amber">
            {t.hero.hud.coordsLabel}
          </p>
          <p className="gps-label text-text-secondary">{HERO_COORDS.dms}</p>
        </div>

        <div
          className="animate-slide-right flex flex-col items-end gap-2 border-r border-slate pr-4"
          style={delay(0.5, 0.5)}
        >
          <p className="telemetry-label">{t.hero.hud.headingLabel}</p>
          <p className="gps-label text-text-secondary">
            {t.hero.hud.headingValue}
          </p>
        </div>
      </div>

      {/* Rotulo vertical pegado al canto derecho, en la franja que queda
          libre entre el HUD y los contadores. Misma plancha que el HUD, en
          tira: right-1 + px-2 devuelve el texto a su right-3 de siempre. */}
      <span
        aria-hidden="true"
        className="telemetry-label animate-fade-in pointer-events-none absolute right-1 top-1/2 z-30 hidden -translate-y-1/2 px-2 py-10 lg:block"
        style={{
          writingMode: "vertical-rl",
          letterSpacing: "0.48em",
          backgroundImage: PLATE_VERTICAL,
          ...delay(0.6, 0.5),
        }}
      >
        {t.hero.expedition}
      </span>

      {/* ═══ 20 · Contenido ═══════════════════════════════════════════════ */}
      <motion.div
        className="relative z-20 flex flex-1 flex-col justify-end px-5 pb-10 pt-32 sm:px-8 sm:pt-36 md:px-12 lg:px-16"
        style={parallax ? { y: contentY, opacity: contentOpacity } : undefined}
      >
        {/* El bloque de texto se envuelve para poder darle SU PROPIO suelo.
            Un degradado a porcentaje fijo de la seccion no sirve: en movil
            el texto arranca al ~18 % del hero y en escritorio al ~55 %, asi
            que el lavado tiene que ir pegado a la caja del TEXTO, no a la
            del hero. Va a sangre (w-screen centrado) para que no aparezca
            un canto vertical de crema recortado sobre la foto.

            ESTE es el mecanismo que mantiene legible el hero en claro: el
            texto conserva el contraste de sus tokens (text-primary 13.3:1,
            secondary 7.3:1, telemetry 4.95:1) porque debajo tiene el fondo
            de la pagina y no una fotografia de brillo desconocido. */}
        <div className="relative">
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute -bottom-16 -top-14 left-1/2 -z-10 w-screen -translate-x-1/2 ${TEXT_WASH_MASK}`}
            style={{ backgroundImage: TEXT_WASH }}
          />

          {/* Tag + badge de edicion */}
          <div
            className="animate-fade-up mb-6 flex flex-wrap items-center gap-x-4 gap-y-3"
            style={delay(0.05, 0.5)}
          >
            <span className="telemetry-label telemetry-label-amber telemetry-label-dash">
              {t.hero.tag}
            </span>
            <span className="tech-badge tech-badge-amber">
              {t.common.edition.monthYearShort}
            </span>
          </div>

          {/* Titular — revelado linea a linea tras su propia mascara.

              Los TRES valores del clamp estan medidos en el navegador contra
              la linea mas larga de los tres idiomas ("OCHO DE NOSOTROS." en
              es, "VUIT DE NOSALTRES." en ca), no elegidos a ojo:

              · 7.4vw (tramo fluido) es el tamano al que esa linea todavia cabe
                en UNA sola linea con el padding lateral de la seccion. Por
                encima rompia en dos y el hero crecia hasta empujar los CTA
                fuera de pantalla.
              · 1.7rem (suelo) hace falta porque por debajo de ~454px de
                viewport el clamp se queda clavado en su minimo y deja de
                encoger. Con el suelo anterior de 2.1rem la linea pedia 329px
                de ancho sobre los 320px utiles de una pantalla de 360px: se
                partia en dos justo en el tamano de movil mas comun. A 1.7rem
                cabe con margen desde 320px de viewport.
              · 7rem (techo) evita que en monitores anchos el titular se coma
                el resto del hero. */}
          <h1
            className="font-heading font-bold uppercase leading-[0.86] tracking-[-0.02em] text-text-primary"
            style={{ fontSize: "clamp(1.7rem, 7.4vw, 7rem)" }}
          >
            {t.hero.title.map((line, i) => (
              <span key={`${i}-${line}`} className="block overflow-hidden pb-[0.06em]">
                <span className="boam-hero-line block" style={delay(0.08 + i * 0.07)}>
                  {i === lastTitleLine ? (
                    <span className="text-gradient-amber">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              </span>
            ))}
          </h1>

          {/* Regla editorial */}
          <div
            className="boam-hero-rule mt-6 h-px w-full max-w-xs bg-gradient-to-r from-amber via-amber/40 to-transparent"
            style={delay(0.3)}
          />

          {/* Copy + CTAs · contadores */}
          <div className="mt-7 flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="animate-fade-up max-w-xl" style={delay(0.3, 0.5)}>
              <p className="font-body text-[0.9375rem] leading-[1.75] text-text-secondary sm:text-base">
                {t.hero.description}
              </p>

              {/* El principal es patrocinar, que es el objetivo de la web; bajar
                  a conocer el proyecto ya lo invita la pista de scroll de abajo,
                  así que va de secundario (jerarquía por objetivo). */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="/patrocinio#configurador"
                  className="btn-tactical btn-amber group w-full sm:w-auto"
                >
                  {t.hero.secondaryCta}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 ease-tactical group-hover:translate-x-1"
                  >
                    {t.hero.ctaArrow}
                  </span>
                </Link>
                <Link
                  href="/#proyecto"
                  className="btn-tactical btn-outline w-full sm:w-auto"
                >
                  {t.hero.cta}
                </Link>
              </div>

              {/* El dossier, desde la primera pantalla: es lo que se reenvia
                  dentro de una empresa, y no tiene por que llegar a /patrocinio
                  para encontrarlo. */}
              <DossierLink className="mt-4" />

              {/* Tira de estado + pista de scroll. La pista va AQUI, y no
                  suelta en una esquina, porque en el fondo a la derecha
                  chocaba con los contadores y en flujo propio se comia ~70px
                  del presupuesto vertical del hero. */}
              <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="status-dot shrink-0" aria-hidden="true" />
                <span className="telemetry-label">{t.hero.hud.statusLabel}</span>
                <span className="gps-label text-lime">
                  {t.hero.hud.statusValue}
                </span>

                <span
                  aria-hidden="true"
                  className="ml-2 hidden h-4 w-px bg-slate sm:block"
                />
                <motion.span
                  style={parallax ? { opacity: scrollHintOpacity } : undefined}
                  className="hidden items-center gap-2.5 sm:flex"
                >
                  <span aria-hidden="true" className="telemetry-label">
                    {t.hero.scroll}
                  </span>
                  <span
                    aria-hidden="true"
                    className="block h-5 w-px bg-gradient-to-b from-amber to-transparent"
                  />
                  <span className="sr-only">{t.common.a11y.scrollDown}</span>
                </motion.span>
              </div>
            </div>

            {/* Contadores. Cada celda usa `flex-col-reverse`: en el DOM va
                primero el <dt> (semantica correcta de la lista de descripcion)
                y en pantalla primero la cifra. */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 lg:flex lg:shrink-0 lg:gap-10">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="animate-fade-up flex flex-col-reverse border-t border-slate pt-3"
                  style={delay(0.4 + i * 0.05, 0.5)}
                >
                  <dt className="telemetry-label mt-2 block">{stat.label}</dt>
                  <dd className="font-heading text-3xl font-semibold leading-none text-text-primary md:text-4xl">
                    {stat.value}
                    {/* amber-text y no amber: 16px no llegan a "texto grande",
                        asi que el ambar pleno (3.87:1 sobre crema) se queda
                        corto. En tactical los dos tokens valen #FF6B00. */}
                    {stat.unit && (
                      <span className="ml-1 font-mono text-base font-medium text-amber-text">
                        {stat.unit}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

      </motion.div>

      {/* ═══ 20 · Teletipo sobre el horizonte ═════════════════════════════ */}
      {/* El 0.55 de siempre deja pasar casi media foto: sobre negro no se
          nota y sobre crema se come el teletipo, que va en mono de 11 px. */}
      {/* SIN `backdrop-blur`.
          Llevaba `backdrop-blur-[2px]`, y un `backdrop-filter` obliga al
          compositor a RELEER y desenfocar todo lo que tiene detrás cada vez
          que eso cambia. Detrás tiene el fondo del hero, que los muelles del
          parallax de ratón mueven de continuo: o sea, una franja de todo el
          ancho re-desenfocada en cada fotograma mientras paseas el cursor por
          la portada. Es exactamente la zona donde Ramón notaba el tirón, y
          que se arregla sola al bajar (abajo no hay ni esta banda ni parallax
          de ratón).

          Lo que se pierde: nada visible. El desenfoque era de 2 px y esta
          banda ya es opaca al 94 % en desierto y al 55 % en táctico — detrás
          de eso, 2 px de blur no se distinguen. */}
      {/* PAUSA (WCAG 2.2.2). El teletipo desplaza texto sin fin, y todo
          movimiento automatico de mas de 5 s necesita una forma de pararlo:
          reduced-motion lo apaga, pero no todo el que se marea lo tiene
          activado. Se para al pasar el raton y tiene boton propio. La cinta
          sigue siendo `aria-hidden` (es decorativa y va triplicada); el boton
          NO puede estar dentro de ese aria-hidden, por eso va aparte. */}
      <div
        className="group/marquee relative z-20 flex w-full items-center border-y border-slate/70"
        style={{ backgroundColor: "rgb(var(--base-rgb) / var(--hero-marquee))" }}
      >
        <div aria-hidden="true" className="min-w-0 flex-1 overflow-hidden py-2.5">
          <div
            className="animate-marquee flex w-max will-change-transform group-hover/marquee:[animation-play-state:paused]"
            style={marqueePaused ? { animationPlayState: "paused" } : undefined}
          >
            {marqueeTrack.map((entry, i) => (
              <span
                key={`${i}-${entry}`}
                className="telemetry-label flex shrink-0 items-center gap-5 px-5"
              >
                {/* Mono de 11px: mismo motivo que la unidad de los contadores. */}
                <span className={i % 3 === 1 ? "text-amber-text" : "text-text-tertiary"}>
                  {entry}
                </span>
                <span className="text-amber/50">&#9670;</span>
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMarqueePaused((paused) => !paused)}
          aria-label={marqueePaused ? t.hero.marqueePlay : t.hero.marqueePause}
          className="mx-2 flex h-7 w-7 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:text-amber-text motion-reduce:hidden"
        >
          {marqueePaused ? (
            <Play size={12} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Pause size={12} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* ═══ 20 · Divisoria "sierra de montanas" ══════════════════════════ */}
      <div className="relative z-20 -mb-px w-full">
        <RidgeDivider
          toColor="var(--color-bg-base)"
          lineColor="var(--color-sand)"
          height="clamp(72px, 9vw, 132px)"
        />
      </div>
    </section>
  );
}
