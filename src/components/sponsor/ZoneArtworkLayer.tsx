"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — El rotulado de una zona, dibujado
   --------------------------------------------------------------------------
   Pinta el logo y los textos que el cliente ha compuesto, recortados por el
   contorno de la zona. Lo usan los dos sitios donde se ve el rotulado: el
   visor del coche (en pequeño, inerte) y el estudio (en grande, con asas).

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  EL RECORTE NO ES DECORACIÓN: ES LA PROMESA COMERCIAL                 ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   Lo que sobresale del polígono se corta, igual que se corta el vinilo en el
   taller. Sin `clipPath` un logo demasiado grande se vería entero encima de
   la carrocería y el patrocinador creería que ha comprado más chapa de la que
   paga. Que el recorte muerda es la señal de "esto no te cabe".

   `clipId` llega desde fuera porque un `<clipPath>` se referencia por id y los
   ids son GLOBALES al documento. Con dos visores montados a la vez —el de la
   sección y el del estudio— un id fijo haría que el segundo secuestrara el
   recorte del primero. Quien monta el componente ya tiene un `useId`.
   ══════════════════════════════════════════════════════════════════════════ */

import type { Bounds } from "@/lib/car/polygon";

import { fontStack, type ArtworkItem, type ZoneArtwork } from "@/lib/sponsor/artwork";
import {
  imagePaint,
  textPaint,
  TEXT_ANCHOR,
  TEXT_BASELINE,
} from "@/lib/sponsor/paint";

export interface ZoneArtworkLayerProps {
  /** Contorno de la zona: recorta el rotulado. */
  d: string;
  /** Caja envolvente del contorno; las posiciones son fracciones de ella. */
  box: Bounds;
  artwork: ZoneArtwork;
  /** Id único para el `<clipPath>`. */
  clipId: string;
}

/**
 * Un elemento suelto, sin envoltorio.
 *
 * Se exporta porque el estudio necesita dibujar el elemento que se está
 * arrastrando por separado, encima de los demás, sin duplicar el mapeo de
 * atributos.
 */
export function ArtworkNode({ item, box }: { item: ArtworkItem; box: Bounds }) {
  if (item.kind === "image") {
    const paint = imagePaint(item, box);
    return (
      <image
        href={paint.href}
        x={paint.x}
        y={paint.y}
        width={paint.width}
        height={paint.height}
        transform={paint.transform}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }

  const paint = textPaint(item, box, fontStack);
  return (
    <text
      x={paint.x}
      y={paint.y}
      transform={paint.transform}
      textAnchor={TEXT_ANCHOR}
      dominantBaseline={TEXT_BASELINE}
      style={{
        fontFamily: paint.fontFamily,
        fontSize: `${paint.fontSize}px`,
        fontWeight: paint.fontWeight,
        letterSpacing: `${paint.letterSpacing}px`,
        fill: paint.fill,
        /* El texto del rotulado es DIBUJO, no contenido: si se pudiera
           seleccionar, arrastrarlo en el estudio empezaría a pintar la
           selección del navegador en vez de mover el rótulo. */
        userSelect: "none",
      }}
    >
      {paint.content}
    </text>
  );
}

export default function ZoneArtworkLayer({
  d,
  box,
  artwork,
  clipId,
}: ZoneArtworkLayerProps) {
  if (artwork.items.length === 0) return null;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {artwork.items.map((item) => (
          <ArtworkNode key={item.id} item={item} box={box} />
        ))}
      </g>
    </>
  );
}
