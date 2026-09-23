/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Web App Manifest (/manifest.webmanifest)
   --------------------------------------------------------------------------
   Lo que usa el movil al "Añadir a pantalla de inicio": nombre, colores e
   iconos. Next lo enlaza solo en el <head> por existir este fichero.

   Los PNG de /public/icons salen de `src/app/icon.svg` (la placa ambar con
   "BR"), sobre el fondo oscuro del tema tactical: a sangre en `any` y con
   margen de seguridad en `maskable`, que Android recorta a circulo.
   ══════════════════════════════════════════════════════════════════════════ */

import type { MetadataRoute } from "next";

import { BRAND, SITE_META } from "@/lib/constants";
import { DEFAULT_THEME, THEME_COLOR } from "@/theme/themeScript";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_META.title,
    short_name: BRAND.name,
    description: SITE_META.description,
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: THEME_COLOR[DEFAULT_THEME],
    theme_color: THEME_COLOR[DEFAULT_THEME],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
