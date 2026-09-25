"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <TiltCard /> · <TiltDepth />
   Tarjeta con volumen: gira hacia el puntero en 3D real (la perspectiva la
   pone el navegador), tiene canto, proyecta sombra en el "suelo" y el filo
   se enciende cerca del puntero. Sin WebGL: el texto sigue siendo texto.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   CAPAS (de atrás a delante)
   --------------------------
     raíz     `perspective`. NO gira: su caja es estable y es la que se mide.
       sombra   caja difuminada en el suelo; se aleja al revés que la tarjeta
       cuerpo   rotateX/rotateY + translateZ, con `preserve-3d`
         canto    láminas detrás de la cara (translateZ negativo) = grosor
         hijos    la tarjeta real, con su propio clip-path / overflow
         filo     anillo de 2 px con la misma forma, encendido en ámbar

   POR QUÉ EL BRILLO VA SOLO EN EL FILO
   Un reflejo sobre la cara pasa por encima del texto, y justo donde está el
   puntero, que es donde se lee. Medido en las fases de la cronología: un
   velo blanco del 4 % ya deja el texto más débil por debajo de 4,5:1. El
   anillo no toca el contenido: las tarjetas tienen padding de sobra.

   POR QUÉ LA SOMBRA ES UNA CAPA APARTE
   `.panel` y `.chamfer` recortan con `clip-path`, y `clip-path` recorta
   también el `box-shadow` del propio elemento: la sombra que declara `.panel`
   nunca se ha visto. Una capa hermana, fuera del recorte, sí se ve. El
   `blur` es fijo y lo único que se anima es su `transform` y su opacidad,
   así que el compositor la mueve sin repintarla.

   PROFUNDIDAD DENTRO DE LA TARJETA: <TiltDepth depth={n}>
   Un elemento con `clip-path` u `overflow: hidden` aplana a sus hijos, así
   que un `translateZ` dentro de un `.panel` no hace nada. <TiltDepth>
   desplaza su capa en X/Y lo que la proyectaría un `translateZ(n px)` con el
   giro máximo: positivo sale hacia quien mira, negativo se hunde.

   MOVIMIENTO
   · Motion values + muelles de framer-motion: cero renders de React por
     movimiento del ratón.
   · Solo ratón y lápiz. En táctil no hay hover que seguir.
   · Con prefers-reduced-motion no se mueve nada: queda la sombra de reposo,
     que ya da el volumen.
   · Teclado: con foco visible dentro, la tarjeta se eleva sin girar.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  motion,
  motionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";

import { topoSolidRef } from "./topoState";

/* ────────────────────────────────────────────────────────────
   Parámetros
   ──────────────────────────────────────────────────────────── */

/** Muelle del giro: rápido pero sin rebote visible. */
const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.6 };
/** Muelle de la elevación: un pelo más lento, para que la tarjeta "suba". */
const LIFT_SPRING = { stiffness: 180, damping: 22, mass: 0.7 };

/** Desplazamiento que <TiltDepth> aplica por px de profundidad y por unidad
 *  de puntero: sin(10°) ≈ 0,17, redondeado al giro por defecto. */
const DEPTH_PER_PX = 0.18;

/** Láminas del canto, en px detrás de la cara. */
const EDGE_STEP_PX = 2;

type Shape = "chamfer" | "rect";

/** Deja visible solo el anillo del padding: capa completa menos su contenido. */
const RIM_MASK: CSSProperties = {
  WebkitMaskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
  maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
};

/** Recorte compartido por canto y filo: el mismo path que `.panel`. */
function shapeStyle(shape: Shape): CSSProperties | undefined {
  return shape === "chamfer" ? { clipPath: "var(--chamfer-path)" } : undefined;
}

/* ────────────────────────────────────────────────────────────
   Contexto para las capas de profundidad
   ──────────────────────────────────────────────────────────── */

interface TiltState {
  /** Puntero normalizado y amortiguado, de -0,5 a 0,5. */
  x: MotionValue<number>;
  y: MotionValue<number>;
}

/** Fuera de una <TiltCard>, <TiltDepth> se queda quieto. */
const REST: TiltState = { x: motionValue(0), y: motionValue(0) };
const TiltContext = createContext<TiltState>(REST);

/* ────────────────────────────────────────────────────────────
   <TiltCard />
   ──────────────────────────────────────────────────────────── */

export interface TiltCardProps {
  children: ReactNode;
  /** Etiqueta de la raíz. `li` cuando la tarjeta es un elemento de lista. */
  as?: "div" | "li";
  /** Colocación en la retícula (spans, orden, márgenes). Va en la raíz. */
  className?: string;
  /** Forma de canto y filo. `chamfer` para `.panel` / `.chamfer*`. */
  shape?: Shape;
  /** Giro máximo, en grados. `0` deja la tarjeta quieta (solo sombra). */
  maxTilt?: number;
  /** Cuánto se acerca al espectador con el hover, en px. */
  lift?: number;
  /** Grosor del canto, en px. `0` lo quita. */
  thickness?: number;
  /** Filo que se enciende cerca del puntero. */
  rim?: boolean;
  /** Las curvas de nivel del cursor no se dibujan encima (ver topoState.ts).
   *  Se registra el cuerpo, que es el que gira: su caja incluye el giro. */
  solid?: boolean;
}

export default function TiltCard({
  children,
  as = "div",
  className = "",
  shape = "chamfer",
  maxTilt = 9,
  lift = 22,
  thickness = 6,
  rim = true,
  solid = false,
}: TiltCardProps) {
  const reduce = useReducedMotion() === true;
  const rootRef = useRef<HTMLElement | null>(null);
  /** Caja de la raíz, medida al entrar. La raíz no gira: no cambia dentro. */
  const rectRef = useRef<DOMRect | null>(null);
  /** Una tarjeta quieta no necesita cuerpo transformado (ver abajo). */
  const moves = maxTilt > 0 || lift > 0;

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const active = useMotionValue(0);
  const x = useSpring(px, TILT_SPRING);
  const y = useSpring(py, TILT_SPRING);
  const a = useSpring(active, LIFT_SPRING);

  /* El punto señalado se hunde: puntero a la derecha, canto derecho atrás. */
  const rotateX = useTransform(y, (v) => -v * 2 * maxTilt);
  const rotateY = useTransform(x, (v) => v * 2 * maxTilt);
  const z = useTransform(a, (v) => v * lift);

  /* La sombra cae lejos del punto señalado y se abre al subir la tarjeta. */
  const shadowX = useTransform(x, (v) => -v * 2 * (maxTilt * 2.2));
  const shadowY = useTransform([y, a], ([vy, va]: number[]) => 14 + va * 12 - vy * 2 * (maxTilt * 1.6));
  const shadowScale = useTransform(a, (v) => 0.95 + v * 0.05);
  const shadowOpacity = useTransform(a, (v) => 0.6 + v * 0.4);

  /* Centro de la luz del filo, en % de la propia tarjeta (0 % = canto
     izquierdo/superior). Va a variables CSS del degradado y NO a una capa
     más grande desplazada: esa capa, del doble de la tarjeta, sobresalía de
     la ventana en las tarjetas pegadas al borde (el mapa de la ruta) y, en
     una sección que no recorta, daba scroll horizontal a toda la página. */
  const rimX = useTransform(x, (v) => `${(v + 0.5) * 100}%`);
  const rimY = useTransform(y, (v) => `${(v + 0.5) * 100}%`);

  const measure = useCallback(() => {
    const node = rootRef.current;
    rectRef.current = node ? node.getBoundingClientRect() : null;
    return rectRef.current;
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (reduce || event.pointerType === "touch") return;
      let rect = rectRef.current ?? measure();
      if (!rect || rect.width === 0 || rect.height === 0) return;
      let nx = (event.clientX - rect.left) / rect.width - 0.5;
      let ny = (event.clientY - rect.top) / rect.height - 0.5;
      /* Fuera de la caja guardada: la página ha hecho scroll con el puntero
         dentro. Se vuelve a medir una vez, no en cada movimiento. */
      if (Math.abs(nx) > 0.5 || Math.abs(ny) > 0.5) {
        rect = measure();
        if (!rect || rect.width === 0 || rect.height === 0) return;
        nx = (event.clientX - rect.left) / rect.width - 0.5;
        ny = (event.clientY - rect.top) / rect.height - 0.5;
      }
      px.set(Math.max(-0.5, Math.min(0.5, nx)));
      py.set(Math.max(-0.5, Math.min(0.5, ny)));
      active.set(1);
    },
    [active, measure, px, py, reduce],
  );

  const handlePointerLeave = useCallback(() => {
    rectRef.current = null;
    px.set(0);
    py.set(0);
    active.set(0);
  }, [active, px, py]);

  const handleFocus = useCallback(
    (event: ReactFocusEvent<HTMLElement>) => {
      if (reduce) return;
      if (event.target instanceof Element && event.target.matches(":focus-visible")) {
        active.set(1);
      }
    },
    [active, reduce],
  );

  const handleBlur = useCallback(
    (event: ReactFocusEvent<HTMLElement>) => {
      const next = event.relatedTarget;
      if (next instanceof Node && event.currentTarget.contains(next)) return;
      active.set(0);
    },
    [active],
  );

  const Root = as;
  const edges = Math.max(0, Math.round(thickness / EDGE_STEP_PX));

  /* Con `maxTilt` y `lift` a 0 el cuerpo es un <div> sin transform: un
     transform, aunque sea la identidad, convierte al cuerpo en el bloque
     contenedor de cualquier `position: fixed` que viva dentro. */
  const body = (
    <>
      {Array.from({ length: moves ? edges : 0 }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            ...shapeStyle(shape),
            background: "var(--tilt-edge)",
            transform: `translateZ(${-(index + 1) * EDGE_STEP_PX}px)`,
          }}
        />
      ))}

      {children}

      {rim && moves ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[45] p-[2px]"
          style={{
            ...shapeStyle(shape),
            ...RIM_MASK,
            transform: "translateZ(1px)",
            opacity: a,
            "--rim-x": rimX,
            "--rim-y": rimY,
            backgroundImage:
              "radial-gradient(ellipse 34% 34% at var(--rim-x) var(--rim-y), rgb(var(--amber-rgb) / 0.85), transparent)",
          } as MotionStyle}
        />
      ) : null}
    </>
  );

  return (
    <TiltContext.Provider value={{ x, y }}>
      <Root
        ref={(node: HTMLElement | null) => {
          rootRef.current = node;
        }}
        className={`relative isolate hover:z-10 focus-within:z-10 ${className}`.trim()}
        style={{ perspective: "1000px" }}
        onPointerEnter={moves ? measure : undefined}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        onFocus={moves ? handleFocus : undefined}
        onBlur={moves ? handleBlur : undefined}
      >
        {/* Sombra en el suelo */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[4%] top-[6%] -bottom-[2%] -z-10 blur-[22px] will-change-transform"
          style={{
            x: shadowX,
            y: shadowY,
            scale: shadowScale,
            opacity: shadowOpacity,
            background: "var(--tilt-shadow)",
          }}
        />

        {moves ? (
          <motion.div
            ref={solid ? topoSolidRef : undefined}
            className="relative h-full will-change-transform"
            style={{ rotateX, rotateY, z, transformStyle: "preserve-3d" }}
          >
            {body}
          </motion.div>
        ) : (
          <div ref={solid ? topoSolidRef : undefined} className="relative h-full">
            {body}
          </div>
        )}
      </Root>
    </TiltContext.Provider>
  );
}

/* ────────────────────────────────────────────────────────────
   <TiltDepth />
   ──────────────────────────────────────────────────────────── */

export interface TiltDepthProps {
  children?: ReactNode;
  /** Profundidad en px: positiva sale hacia quien mira, negativa se hunde. */
  depth: number;
  className?: string;
}

/**
 * Capa que flota a otra profundidad dentro de una <TiltCard>. Se mueve hacia
 * el lado del puntero si sale (`depth > 0`) y al contrario si se hunde.
 */
export function TiltDepth({ children, depth, className = "" }: TiltDepthProps) {
  const { x, y } = useContext(TiltContext);
  const shiftX = useTransform(x, (v) => v * 2 * depth * DEPTH_PER_PX);
  const shiftY = useTransform(y, (v) => v * 2 * depth * DEPTH_PER_PX);
  return (
    <motion.div className={className} style={{ x: shiftX, y: shiftY }}>
      {children}
    </motion.div>
  );
}
