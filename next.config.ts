import type { NextConfig } from "next";

/**
 * Carpeta de compilación.
 *
 * `next dev` y `next build` escriben los dos en la MISMA carpeta (`.next` por
 * defecto), así que compilar producción mientras el servidor de desarrollo
 * está levantado le borra los manifiestos por debajo y lo deja devolviendo
 * 500 hasta que se reinicia. Pasa de verdad, no es teórico.
 *
 * Con esta variable se pueden tener los dos vivos a la vez, cada uno en su
 * carpeta, que es justo lo que hace falta para comparar rendimiento entre
 * desarrollo y producción:
 *
 *     # Terminal 1 — desarrollo, usa .next como siempre
 *     npm run dev
 *
 *     # Terminal 2 — producción en paralelo, en su propia carpeta
 *     $env:NEXT_DIST_DIR = ".next-prod"
 *     npm run build
 *     npx next start -p 3100
 *
 * Sin la variable el comportamiento es EXACTAMENTE el de siempre (`.next`),
 * así que esto no cambia nada para quien no la use.
 */
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
