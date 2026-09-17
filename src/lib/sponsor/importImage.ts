"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Entrada de un logo al rotulado
   --------------------------------------------------------------------------
   Coge el fichero que suelta el cliente y devuelve un PNG en data URL listo
   para meter en el SVG.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  SE REESCALA SIEMPRE, AUNQUE LA IMAGEN YA SEA PEQUEÑA                 ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   El data URL de este logo acaba en tres sitios a la vez: el estado de React,
   `localStorage` (cuota ~5 MB para TODO el diseño) y el adjunto del correo,
   donde además el base64 infla un 33 %. Un PNG de 3000 px que el navegador
   traga sin pestañear reventaría los tres. Se acota el lado mayor a
   MAX_EDGE px, que a tamaño de vinilo real da de sobra.

   El paso por `<canvas>` es además lo que NORMALIZA el formato. Da igual que
   entre un JPEG, un WebP o un AVIF: sale PNG, que es el único mapa de bits que
   conserva la transparencia del logo y que se dibuja igual dentro de un SVG
   rasterizado en cualquier navegador.

   ┌─ SVG: se acepta, pero se rasteriza ────────────────────────────────────┐
   │ Un logo vectorial es justo lo que un patrocinador tiene a mano, así que │
   │ no se rechaza. Pero NO se incrusta como SVG: el exportador mete el      │
   │ resultado dentro de otro SVG que se rasteriza vía <img>, y ahí un SVG   │
   │ anidado con sus propias fuentes o referencias externas no carga. Al     │
   │ pasarlo por canvas queda un mapa de bits que sí sobrevive. Se dibuja a  │
   │ MAX_EDGE, que es más resolución de la que el PNG final necesita.        │
   └────────────────────────────────────────────────────────────────────────┘
   ══════════════════════════════════════════════════════════════════════════ */

/** Lado mayor del PNG resultante, en píxeles. */
const MAX_EDGE = 900;

/** Tope del fichero de entrada. Por encima ni se intenta decodificar. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/svg+xml,image/avif";

export interface ImportedImage {
  readonly src: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

export type ImportFailure = "too-large" | "not-an-image" | "decode-failed";

export class ImageImportError extends Error {
  readonly reason: ImportFailure;
  constructor(reason: ImportFailure) {
    super(reason);
    this.name = "ImageImportError";
    this.reason = reason;
  }
}

/** Carga un data URL en un `HTMLImageElement` ya decodificado. */
function decode(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ImageImportError("decode-failed"));
    image.src = dataUrl;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ImageImportError("decode-failed"));
    reader.readAsDataURL(file);
  });
}

export async function importLogo(file: File): Promise<ImportedImage> {
  if (!file.type.startsWith("image/")) throw new ImageImportError("not-an-image");
  if (file.size > MAX_UPLOAD_BYTES) throw new ImageImportError("too-large");

  const source = await decode(await readAsDataUrl(file));

  /* Un SVG sin `width`/`height` intrínsecos llega con naturalWidth 0 en
     Firefox. Sin este respaldo el canvas saldría de 0 × 0 y el logo
     desaparecería sin decir nada. */
  const naturalW = source.naturalWidth || MAX_EDGE;
  const naturalH = source.naturalHeight || MAX_EDGE;

  const scale = Math.min(1, MAX_EDGE / Math.max(naturalW, naturalH));
  const width = Math.max(1, Math.round(naturalW * scale));
  const height = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageImportError("decode-failed");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);

  return {
    src: canvas.toDataURL("image/png"),
    name: file.name,
    width,
    height,
  };
}
