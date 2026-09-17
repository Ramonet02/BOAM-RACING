"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <RidgeDivider />
   Transicion vectorial "sierra de montanas" entre dos secciones (Modulo 1).
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   QUE ES
   ------
   Una banda SVG multicapa que resuelve el borde entre una seccion con imagen
   (el hero) y el color plano de la siguiente. Tres siluetas de cordillera
   superpuestas con `fill-opacity` escalonada (0.3 / 0.6 / 1.0) producen
   perspectiva atmosferica: la cresta lejana queda como bruma sobre la foto y
   la cercana es ya el color solido de la seccion de destino.

   ENCAJE SIN COSTURAS — las tres garantias
   ----------------------------------------
   1. Los poligonos NO se cierran en el borde inferior del viewBox: bajan
      hasta `CLOSE_Y` (360, tres veces la altura util). El propio viewport del
      SVG los recorta, asi que ningun desplazamiento de parallax puede
      descubrir el fondo por abajo.
   2. El SVG se pinta con `height: calc(100% + 1px)`: ese pixel de rebose
      absorbe el redondeo subpixel del navegador contra la seccion siguiente.
   3. Ademas se pinta una barra solida de `toColor` de 2px anclada a
      `bottom:-1px`, como ultima red contra la costura.

   COLOR — SIEMPRE POR TOKEN, Y POR `style`, NO POR ATRIBUTO
   ---------------------------------------------------------
   La capa opaca ES el color de la seccion de destino: si ese color no
   sigue al tema, al conmutar aparece una franja del color equivocado
   entre dos secciones. Por eso `toColor` y `lineColor` son tokens por
   defecto (`var(--color-bg-base)` y `var(--color-sand)`) y quien los
   sobreescriba debe pasar otro token, nunca un hex.

   Y se aplican por `style`, no como atributo SVG. Un atributo de
   presentacion (`fill="…"`) SI resuelve `var()` en los motores actuales
   —comprobado en Chromium contra el globals.css real—, pero es la via mas
   debil de todas: la pisa cualquier hoja, y si el valor no resolviera, el
   path no se queda sin color sino que cae al NEGRO por defecto de SVG. Ese
   fallo es invisible en tactical (negro contra #0F1012) y catastrofico en
   desert (crestas negras sobre crema), asi que no conviene depender de el.
   Como propiedad CSS el valor es explicito y gana a cualquier atributo.

   RESPONSIVE
   ----------
   `preserveAspectRatio="none"` estira la silueta, que es justo lo que se
   quiere para una divisoria... hasta que la pantalla es muy estrecha: a
   400px de ancho la compresion horizontal es 3,6x y las crestas degeneran en
   picos de sierra. Por eso se pintan DOS SVG con el mismo dibujo y distinto
   viewBox: el ancho completo a partir de `sm`, y por debajo una ventana
   central (`NARROW_VIEW`) que muestra solo dos macizos. Los dos comparten los
   mismos MotionValue, asi que no hay coste de animacion extra.

   USO
   ---
     // al final del hero, resolviendo al fondo base
     <RidgeDivider />

     // al principio de una seccion, colgando del techo
     <RidgeDivider flip mirror toColor="var(--color-bg-surface)" />

     // dunas, dos capas, sin parallax
     <RidgeDivider variant="erg" depth={2} parallax={false} />
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { useRef, type CSSProperties } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/* ────────────────────────────────────────────────────────────
   Geometria
   ──────────────────────────────────────────────────────────── */

/** Ancho del lienzo. Fijo: es el sistema de coordenadas de los perfiles. */
const VIEW_W = 1440;
/** Alto util del lienzo. La banda se estira a `height` sobre esta base. */
const VIEW_H = 120;
/**
 * Y de cierre de todos los poligonos, muy por debajo del viewBox.
 * El viewport del SVG recorta el sobrante: es lo que hace que el parallax
 * no pueda abrir nunca una franja bajo la capa opaca.
 */
const CLOSE_Y = 360;
/** Ventana que se muestra por debajo del breakpoint `sm` (dos macizos). */
const NARROW_VIEW = { x: 392, width: 812 } as const;

export type RidgeVariant = "atlas" | "erg";

/**
 * Perfiles de cresta, de la mas LEJANA a la mas CERCANA.
 *
 * Son polilineas y curvas trazadas a mano, no dientes de sierra: macizos de
 * anchura distinta, cumbres asimetricas, hombros, collados y un tramo de
 * meseta redondeada. Cada trazo empieza en x=0 y termina en x=1440, que es
 * lo que permite cerrarlos con `L1440,CLOSE_Y L0,CLOSE_Y Z`.
 */
const RIDGES: Record<RidgeVariant, readonly [string, string, string]> = {
  /* Cordillera del Atlas — roca, aristas rectas, cuatro macizos distintos:
     A gemelo y ancho · B el mas alto y afilado · C meseta baja redondeada ·
     D pico aislado de flanco derecho corto. */
  atlas: [
    "M0,71 L52,66 L92,54 L120,58 L158,39 L182,44 L210,25 L224,31 L238,18 " +
      "L256,27 L274,22 L296,36 L326,49 L358,60 L388,69 L412,77 L448,70 " +
      "L478,57 L500,62 L534,41 L552,46 L576,27 L588,33 L604,11 L618,24 " +
      "L632,19 L648,38 L668,52 L700,63 L736,71 L764,75 L800,69 L838,61 " +
      "L872,56 L908,52 L944,50 L978,52 L1012,57 L1048,64 L1086,71 L1112,76 " +
      "L1152,70 L1188,60 L1210,64 L1244,45 L1262,50 L1288,28 L1300,34 " +
      "L1312,16 L1326,31 L1344,45 L1376,56 L1412,64 L1440,69",
    "M0,90 L44,85 L82,90 L118,79 L146,83 L178,67 L196,55 L212,62 L232,50 " +
      "L248,61 L268,72 L300,80 L340,86 L386,90 L430,93 L470,90 L508,83 " +
      "L540,73 L562,77 L594,61 L614,66 L640,50 L654,57 L672,44 L690,54 " +
      "L708,48 L728,63 L752,74 L790,83 L836,89 L884,92 L928,90 L960,93 " +
      "L1000,87 L1036,78 L1062,82 L1094,68 L1114,73 L1142,57 L1156,63 " +
      "L1176,49 L1194,60 L1218,71 L1256,80 L1302,87 L1350,91 L1400,88 " +
      "L1440,92",
    "M0,112 L60,108 L120,112 L172,104 L210,107 L256,97 L282,101 L320,93 " +
      "L348,99 L392,106 L448,111 L508,114 L566,110 L614,103 L648,99 " +
      "L676,102 L714,94 L742,98 L786,105 L844,110 L902,113 L958,111 " +
      "L1008,105 L1046,100 L1074,103 L1112,95 L1142,99 L1188,106 L1246,111 " +
      "L1308,114 L1368,111 L1412,107 L1440,109",
  ],

  /* Erg — crestas de duna: barlovento largo y sotavento corto, sin aristas. */
  erg: [
    "M0,64 C60,60 108,50 160,36 C196,26 216,20 240,22 C272,25 296,40 336,50 " +
      "C376,60 420,64 470,60 C520,56 556,44 596,30 C624,20 648,16 672,20 " +
      "C704,26 724,42 764,52 C808,63 856,66 906,61 C950,57 984,45 1022,32 " +
      "C1050,23 1074,19 1098,23 C1128,28 1150,44 1190,54 C1234,65 1288,68 " +
      "1344,63 C1386,59 1416,54 1440,50",
    "M0,92 C52,89 100,80 150,68 C188,59 212,52 238,54 C270,57 292,70 330,80 " +
      "C374,91 420,94 468,90 C512,86 548,76 586,64 C616,55 640,50 666,54 " +
      "C698,59 720,73 760,83 C802,93 850,96 898,92 C940,88 972,78 1008,67 " +
      "C1036,58 1060,54 1086,58 C1116,63 1140,76 1180,85 C1226,95 1282,97 " +
      "1338,92 C1382,88 1414,83 1440,80",
    "M0,114 C60,112 118,106 178,98 C214,93 240,89 266,91 C300,94 324,102 " +
      "364,108 C410,115 460,117 508,114 C550,111 588,104 626,97 C656,91 " +
      "682,88 708,91 C740,95 764,104 804,110 C848,116 900,118 950,115 " +
      "C992,112 1028,105 1066,98 C1096,92 1122,89 1148,92 C1180,96 1206,105 " +
      "1248,110 C1296,116 1352,117 1400,114 C1418,113 1432,112 1440,111",
  ],
};

/* ────────────────────────────────────────────────────────────
   Reparto de profundidad
   ──────────────────────────────────────────────────────────── */

interface LayerStyle {
  /** Opacidad del relleno. La ultima capa siempre 1: es la que sella. */
  readonly fill: number;
  /** Pista de parallax. La 2 es la capa quieta (ver TRACK_FACTOR). */
  readonly track: 0 | 1 | 2;
  /** Opacidad de la linea de cresta. */
  readonly crest: number;
  /** Grosor de la linea de cresta, en px reales (non-scaling-stroke). */
  readonly crestWidth: number;
}

/** Escalonado que pide la spec: 0.3 / 0.6 / 1.0. */
const LAYERS_3: readonly [LayerStyle, LayerStyle, LayerStyle] = [
  { fill: 0.3, track: 0, crest: 0.2, crestWidth: 0.75 },
  { fill: 0.6, track: 1, crest: 0.3, crestWidth: 0.9 },
  { fill: 1, track: 2, crest: 0.42, crestWidth: 1.1 },
];

/** Version de dos capas, para divisorias mas discretas. */
const LAYERS_2: readonly [LayerStyle, LayerStyle] = [
  { fill: 0.45, track: 0, crest: 0.26, crestWidth: 0.85 },
  { fill: 1, track: 2, crest: 0.42, crestWidth: 1.1 },
];

/**
 * Cuanto viaja cada pista respecto de `parallaxStrength`.
 *
 * LA CAPA OPACA NO SE MUEVE (factor 0), y es una decision de robustez, no de
 * gusto: es la que sella contra la seccion siguiente. Su punto mas bajo esta
 * en y≈114 de 120, asi que bastaba un desplazamiento hacia abajo de 6
 * unidades para que en esos dos valles el relleno opaco empezara POR DEBAJO
 * del borde del viewBox y se colara una franja al 72 % en el canto inferior.
 * Dejandola quieta el sellado es invariante: da igual que `parallaxStrength`
 * valga 10 o 40, y el render sin JS es identico al hidratado.
 *
 * El parallax se lo reparten las capas de detras, que es ademas lo que hace
 * una cordillera real: el primer plano va clavado al terreno y las crestas
 * lejanas derivan contra el.
 */
const TRACK_FACTOR: readonly [number, number, number] = [1, 0.5, 0];

/* ────────────────────────────────────────────────────────────
   API
   ──────────────────────────────────────────────────────────── */

export interface RidgeDividerProps {
  /**
   * Color de la seccion de DESTINO: el que rellena la capa opaca y sella
   * contra lo que viene detras. Pasa SIEMPRE un token del tema —por
   * defecto `var(--color-bg-base)`—: un hex fijo aqui deja una franja del
   * color equivocado en cuanto se cambia de tema.
   */
  toColor?: string;
  /** Color de la linea de cresta. Mismo criterio: token, no hex. */
  lineColor?: string;
  /**
   * Alto de la banda. Un numero se interpreta en px; una cadena se usa tal
   * cual, para poder pasar `clamp()` y que escale con el viewport.
   */
  height?: number | string;
  /** Perfil: cordillera de roca (`atlas`) o crestas de duna (`erg`). */
  variant?: RidgeVariant;
  /** Numero de siluetas superpuestas. */
  depth?: 2 | 3;
  /** Invierte en vertical: la masa solida pasa arriba (uso a techo de seccion). */
  flip?: boolean;
  /** Espeja en horizontal, para que dos divisorias de la misma pagina no rimen. */
  mirror?: boolean;
  /** Micro-parallax al hacer scroll. Se desactiva solo con `prefers-reduced-motion`. */
  parallax?: boolean;
  /** Recorrido de la capa mas cercana, en unidades del viewBox (120 = la banda entera). */
  parallaxStrength?: number;
  /** Hairline sobre cada cresta. */
  crestLines?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function RidgeDivider({
  toColor = "var(--color-bg-base)",
  lineColor = "var(--color-sand)",
  height = "clamp(88px, 11vw, 168px)",
  variant = "atlas",
  depth = 3,
  flip = false,
  mirror = false,
  parallax = true,
  parallaxStrength = 10,
  crestLines = true,
  className = "",
  style,
}: RidgeDividerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Progreso mientras la banda cruza el viewport: 0 al asomar por abajo,
  // 1 al salir por arriba. Antes del montaje vale 0 y las capas se pintan
  // en su posicion de entrada, que sigue siendo un encuadre valido.
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "end start"],
  });

  // Tres pistas fijas, una por indice de TRACK_FACTOR: los hooks no pueden
  // depender de `depth`, asi que se crean siempre las tres aunque con
  // `depth={2}` solo se consuman dos. Nombradas por la capa que mueven:
  // `far` es la cresta de bruma (la que mas viaja) y `near` la opaca.
  const travelFar = parallaxStrength * TRACK_FACTOR[0];
  const travelMid = parallaxStrength * TRACK_FACTOR[1];
  const travelNear = parallaxStrength * TRACK_FACTOR[2];

  const yFar = useTransform(scrollYProgress, [0, 1], [travelFar, -travelFar]);
  const yMid = useTransform(scrollYProgress, [0, 1], [travelMid, -travelMid]);
  const yNear = useTransform(scrollYProgress, [0, 1], [travelNear, -travelNear]);

  const tracks: readonly [MotionValue<number>, MotionValue<number>, MotionValue<number>] =
    [yFar, yMid, yNear];

  const animate = parallax && prefersReducedMotion !== true;

  const profiles = RIDGES[variant];
  const layers: readonly LayerStyle[] = depth === 2 ? LAYERS_2 : LAYERS_3;
  // Con dos capas se dibujan la intermedia y la cercana: la lejana es la que
  // menos aporta y su ausencia no deja hueco (todas cierran en CLOSE_Y).
  const shapes: readonly string[] = depth === 2 ? profiles.slice(1) : profiles;

  const cssHeight = typeof height === "number" ? `${height}px` : height;

  const transforms: string[] = [];
  if (flip) transforms.push("scaleY(-1)");
  if (mirror) transforms.push("scaleX(-1)");

  /**
   * Pinta el juego completo de capas en un viewBox dado. Se llama dos veces
   * (ancho completo y ventana estrecha) reutilizando los mismos MotionValue.
   */
  const renderCanvas = (viewBox: string, visibility: string) => (
    <svg
      className={`absolute left-0 top-0 block w-full ${visibility}`}
      style={{ height: "calc(100% + 1px)" }}
      viewBox={viewBox}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      {shapes.map((ridge, i) => {
        const layer = layers[i];
        // La capa de factor 0 se pinta como <g> normal: sin MotionValue no
        // hay transform que serializar, asi que queda exactamente igual con
        // y sin hidratacion.
        const drifts = animate && TRACK_FACTOR[layer.track] !== 0;
        return (
          <motion.g
            key={i}
            style={drifts ? { y: tracks[layer.track] } : undefined}
          >
            <path
              d={`${ridge} L${VIEW_W},${CLOSE_Y} L0,${CLOSE_Y} Z`}
              shapeRendering="geometricPrecision"
              // Relleno y opacidad por `style`, no por atributo: ver la nota
              // COLOR de la cabecera. Un fallo de resolucion aqui no deja la
              // cresta sin pintar, la pinta de NEGRO.
              style={{ fill: toColor, fillOpacity: layer.fill }}
            />
            {crestLines && (
              <path
                d={ridge}
                strokeLinejoin="round"
                strokeLinecap="round"
                // Mantiene el hairline uniforme pese al estirado no uniforme.
                vectorEffect="non-scaling-stroke"
                style={{
                  fill: "none",
                  stroke: lineColor,
                  strokeOpacity: layer.crest,
                  strokeWidth: layer.crestWidth,
                }}
              />
            )}
          </motion.g>
        );
      })}
    </svg>
  );

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none relative w-full select-none ${className}`.trim()}
      style={{
        height: cssHeight,
        transform: transforms.length > 0 ? transforms.join(" ") : undefined,
        ...style,
      }}
    >
      {/* Ventana estrecha: menos compresion horizontal en moviles. */}
      {renderCanvas(
        `${NARROW_VIEW.x} 0 ${NARROW_VIEW.width} ${VIEW_H}`,
        "sm:hidden",
      )}
      {/* Lienzo completo a partir de `sm`. */}
      {renderCanvas(`0 0 ${VIEW_W} ${VIEW_H}`, "hidden sm:block")}

      {/* Sello: mata cualquier costura subpixel contra la seccion siguiente. */}
      <span
        className="absolute inset-x-0 bottom-[-1px] block h-[2px]"
        style={{ background: toColor }}
      />
    </div>
  );
}

export { RidgeDivider };
