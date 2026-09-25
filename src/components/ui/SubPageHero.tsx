"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <SubPageHero />
   Cabecera de las subpaginas (/equipo, /patrocinio, /media).
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   QUE CAMBIA RESPECTO A LA VERSION ANTERIOR
   -----------------------------------------
   · Ni un color de fondo escrito a mano: todas las capas salen de tokens
     (--base-rgb, --color-bg-base). Antes esta cabecera abria con un
     degradado a un arena fijo, heredado del tema viejo, que sobrevivio a
     la refactorizacion y habria salido igual en los dos temas.
   · La foto entra por <RallyImage> contra el manifiesto de `imagery.ts`,
     no por una URL de stock. Mientras el equipo no suba su archivo, se ve
     el placeholder tactico; el dia que lo suba, esta cabecera no se toca.
   · La divisoria inferior es <RidgeDivider> (Modulo 1), no el TopoDivider
     del tema viejo.
   · El copy NO se escribe aqui ni en las paginas: llega ya traducido desde
     `t.<seccion>.pageHero`, y las coordenadas desde `PAGE_COORDS`.
   · El indice de seccion lo rotula la seccion de debajo, no la cabecera:
     asi la serie 01→08 se lee una sola vez por pantalla.

   Sin `altitude`: el diccionario dejo de tener ese campo a proposito (era
   un dato inventado). Lo que se rotula es lo que existe: coordenadas reales
   y el nombre del paraje.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import RallyImage from "@/components/ui/RallyImage";
import RidgeDivider, { type RidgeVariant } from "@/components/ui/RidgeDivider";
import type { RallyImageId } from "@/lib/imagery";
import { useT } from "@/i18n/LanguageProvider";
import { PAGE_COORDS } from "@/lib/constants";

/**
 * Seccion del diccionario de la que sale el copy de la cabecera.
 * Las tres tienen `pageHero { title, subtitle, location }`.
 *
 * La cabecera NO rotula el indice de seccion ("[ 05 ]", "[ 06 ]"...): lo
 * rotula ya la seccion que viene justo debajo, y pintarlo dos veces
 * seguidos rompia la lectura de la serie.
 */
export type SubPageSection = "team" | "sponsors" | "media";

/**
 * Calibracion POR TEMA de las capas que van sobre la fotografia. Mismo
 * criterio que <HeroSection />, y por el mismo motivo: el color de las capas
 * ya es tematico (--base-rgb), pero CUANTA foto se deja pasar no puede
 * serlo. Con texto claro sobre foto oscura basta un velo suave; con texto
 * oscuro sobre esa misma foto, cualquier resto de imagen se come el
 * contraste. La dosis es, por tanto, un dato del tema.
 *
 * Solo custom properties (mas la opacidad de la foto, que no tiene otra via
 * porque <RallyImage> no acepta `style`). Al ir sin @layer estas reglas
 * ganan a cualquier utilidad, asi que se limitan a un elemento que no lleva
 * utilidades en conflicto.
 *
 * El selector se escribe igual que en globals.css, comillas incluidas:
 * React no escapa el texto de un <style> y llega intacto al DOM.
 */
const SUBHERO_STYLES = `
.boam-subhero {
  /* DESERT · con foto real, el velo anterior (0.50-0.88, foto al 66 % y
     lavado de texto a todo el ancho) la dejaba invisible. Ahora el centro
     baja a 0.22 y el lavado del texto, en md+, solo cubre la columna del
     titular (TEXT_WASH_MASK): la mitad derecha es de la foto. */
  --subhero-scrim: linear-gradient(180deg,
    rgb(var(--base-rgb) / 0.80) 0%,
    rgb(var(--base-rgb) / 0.22) 34%,
    rgb(var(--base-rgb) / 0.55) 74%,
    rgb(var(--base-rgb)) 100%);
  --subhero-text-wash: 0.985;
  --subhero-plate: 0.94;
}
.boam-subhero-photo { opacity: 0.9; }

/* TACTICAL · el degradado original, stop a stop, y los lavados a cero: no
   habia plancha ni suelo, y la foto iba al 55 %. */
:root[data-theme="tactical"] .boam-subhero {
  --subhero-scrim: linear-gradient(180deg,
    rgb(var(--base-rgb) / 0.92) 0%,
    rgb(var(--base-rgb) / 0.35) 38%,
    rgb(var(--base-rgb) / 0.78) 78%,
    rgb(var(--base-rgb)) 100%);
  --subhero-text-wash: 0;
  --subhero-plate: 0;
}
:root[data-theme="tactical"] .boam-subhero-photo { opacity: 0.55; }
`;

/** Suelo del bloque de texto: entra sin canto y se vuelve opaco al 20 %. */
const TEXT_WASH =
  "linear-gradient(180deg," +
  " rgb(var(--base-rgb) / 0) 0%," +
  " rgb(var(--base-rgb) / var(--subhero-text-wash)) 20%," +
  " rgb(var(--base-rgb) / var(--subhero-text-wash)) 100%)";

/** En md+ el titular ocupa la mitad izquierda: el lavado se queda ahi y se
 *  disuelve hacia la derecha. En movil el texto va a todo el ancho y el
 *  lavado tambien. En tactical el lavado vale 0 y la mascara no cambia nada. */
const TEXT_WASH_MASK =
  "md:[mask-image:linear-gradient(90deg,#000_0%,#000_50%,transparent_80%)]";

/** Plancha del HUD izquierdo. Radial y no lineal: un degradado lineal solo
 *  disuelve un eje y, con la foto visible, los otros cantos se leian como
 *  una caja. La elipse se apaga hacia todos los lados. */
const PLATE_LEFT =
  "radial-gradient(ellipse 62% 58% at 22% 50%," +
  " rgb(var(--base-rgb) / var(--subhero-plate)) 0%," +
  " rgb(var(--base-rgb) / calc(var(--subhero-plate) * 0.75)) 45%," +
  " rgb(var(--base-rgb) / 0) 100%)";

/** Seccion -> clave de `PAGE_COORDS`. Las coordenadas son DATO, no copy. */
const COORDS_KEY: Record<SubPageSection, keyof typeof PAGE_COORDS> = {
  team: "equipo",
  sponsors: "patrocinio",
  media: "media",
};

export interface SubPageHeroProps {
  /**
   * Seccion del diccionario. La cabecera se lee sola el titular, el
   * subtitulo y el paraje: asi la pagina que la monta puede
   * seguir siendo un Server Component con su propio `metadata`, y el copy
   * no se duplica en castellano dentro de los page.tsx (que es justo lo
   * que pasaba antes).
   */
  section: SubPageSection;
  /**
   * Entrada del manifiesto de imagenes. Tipada: un id que no exista no compila.
   * Sin ella la cabecera va sin foto y SIN placeholder: solo el fondo del
   * tema con scrim, rejilla y polvo (asi van /equipo y /patrocinio).
   */
  imageId?: RallyImageId;
  /** Perfil de la divisoria inferior. */
  ridge?: RidgeVariant;
  /** Espeja la divisoria para que dos cabeceras del sitio no rimen. */
  mirrorRidge?: boolean;
}

export default function SubPageHero({
  section,
  imageId,
  ridge = "atlas",
  mirrorRidge = false,
}: SubPageHeroProps) {
  const t = useT();
  const { title, subtitle, location } = t[section].pageHero;
  const coords = PAGE_COORDS[COORDS_KEY[section]];
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  /* Parallax de scroll, sin re-render de React. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  /* Deriva suave con el raton. Se apaga con prefers-reduced-motion. */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const driftX = useSpring(mx, { stiffness: 55, damping: 20, mass: 0.6 });
  const driftY = useSpring(my, { stiffness: 55, damping: 20, mass: 0.6 });

  const handleMouse = (event: React.MouseEvent) => {
    if (reduceMotion) return;
    mx.set(-(event.clientX / window.innerWidth - 0.5) * 12);
    my.set(-(event.clientY / window.innerHeight - 0.5) * 12);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouse}
      /* Sin foto, la cabecera baja de ~70 % a ~50 % de la pantalla: solo
         lleva el título, y a 666 px dejaba la intro de la sección por debajo
         de la primera pantalla (NN/g: el falso final). `pt-28` guarda sitio
         para la barra fija pase lo que pase con la altura. */
      className={`boam-subhero relative w-full ${
        imageId ? "min-h-[68vh] md:min-h-[74vh]" : "min-h-[46vh] md:min-h-[54vh]"
      } pt-28 flex flex-col justify-end overflow-hidden bg-bg-base`}
    >
      <style>{SUBHERO_STYLES}</style>

      {/* ── 00 · Foto de archivo (o su placeholder tactico) ─────────────── */}
      {imageId && (
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        style={reduceMotion ? undefined : { y: bgY, scale: bgScale }}
      >
        <motion.div
          className="absolute inset-0"
          style={reduceMotion ? undefined : { x: driftX, y: driftY }}
        >
          <RallyImage
            image={imageId}
            fillParent
            priority
            compact
            overlay="none"
            showCaption={false}
            chamfer={false}
            // Mismo motivo que en el hero de la home: en vertical el recorte
            // `cover` necesita la foto bastante más ancha que la pantalla.
            sizes="(orientation: portrait) 250vw, 100vw"
            // La opacidad es tematica: sobre crema, el 55 % del oscuro deja
            // la foto casi en blanco. <RallyImage> no acepta `style`, asi
            // que va por clase (ver SUBHERO_STYLES).
            className="boam-subhero-photo"
          />
        </motion.div>
      </motion.div>
      )}

      {/* ── 10 · Scrims + rejilla de plano ──────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ backgroundImage: "var(--subhero-scrim)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-10 pointer-events-none grid-blueprint grid-fade opacity-40"
      />
      <div aria-hidden className="absolute inset-0 z-10 pointer-events-none dust-overlay-soft dust-overlay" />

      {/* ── 30 · HUD de telemetria ──────────────────────────────────────── */}
      {/* Lugar y coordenadas son los de la FOTO: sin foto no se pintan, o
          describirían un paisaje que no está ("Paso de Tizi n'Tichka"). */}
      {imageId && (
      <motion.div
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        // Offsets recolocados para que el TEXTO no se mueva pese al relleno
        // nuevo: left-1 + pl-5 = left-6 (en md, left-7 + pl-5 = left-12) y
        // top-[6.5rem] + py-5 = top-28. La plancha se disuelve hacia la
        // derecha; en tactical su alfa es 0 y no existe.
        className="absolute top-[6.5rem] left-1 md:left-7 z-20 hidden py-5 pl-5 pr-24 sm:block"
        style={{ backgroundImage: PLATE_LEFT }}
      >
        <p className="gps-label">
          {t.common.telemetry.gps} · {coords}
        </p>
        <p className="telemetry-label telemetry-label-sand mt-1">{location}</p>
      </motion.div>
      )}

      <div className="absolute top-28 right-6 md:right-12 z-20 hidden md:block text-right">
        <span className="tech-badge tech-badge-amber">
          {t.common.edition.monthYearShort}
        </span>
      </div>

      {/* ── 20 · Contenido ──────────────────────────────────────────────── */}
      <motion.div
        style={reduceMotion ? undefined : { y: textY, opacity: textOpacity }}
        className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-20"
      >
        {/* Suelo del texto. Va pegado a la caja del TEXTO y no a un
            porcentaje del hero: la cabecera cambia mucho de alto entre
            movil y escritorio. A sangre (w-screen centrado) para que no
            aparezca un canto vertical de crema sobre la foto.

            Con el, el texto conserva el contraste de sus tokens
            (text-primary 13.3:1, secondary 7.3:1, gps-label 4.95:1) en vez
            de apoyarse en una fotografia de brillo desconocido. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute bottom-0 -top-14 left-1/2 -z-10 w-screen -translate-x-1/2 ${TEXT_WASH_MASK}`}
          style={{ backgroundImage: TEXT_WASH }}
        />

        <h1 className="font-heading text-[clamp(2.75rem,9vw,7.5rem)] text-text-primary leading-[0.88] tracking-[2px] uppercase">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {title}
            </motion.span>
          </span>
        </h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="mt-6 mb-5 h-px w-[min(340px,70%)] bg-amber"
        />

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-body text-base md:text-lg text-text-secondary max-w-xl"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Coordenadas tambien en movil, donde el HUD lateral esta oculto. */}
        {imageId && <p className="gps-label mt-6 sm:hidden">{coords}</p>}
      </motion.div>

      {/* ── 20 · Divisoria hacia la seccion siguiente ───────────────────── */}
      <div className="relative z-20">
        <RidgeDivider
          variant={ridge}
          mirror={mirrorRidge}
          toColor="var(--color-bg-base)"
          height="clamp(64px, 8vw, 128px)"
        />
      </div>
    </section>
  );
}

export { SubPageHero };
