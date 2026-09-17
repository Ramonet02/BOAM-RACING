/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Pintura del visor de patrocinio, ajustada por tema
   --------------------------------------------------------------------------
   El COLOR de las zonas ya lo resuelven los tokens (`--tier-*` y sus
   tripletes `--tier-*-rgb`, en `src/app/globals.css`). Lo que los tokens no
   pueden resolver es la DOSIS: un velo del 15 % de naranja sobre negro se ve;
   el mismo 15 % de ocre sobre crema casi no. La tinta clara está más cerca
   del papel, así que la misma alpha rinde menos contraste.

     · rojo #BF5A1E al 62 % sobre crema  → 2.25:1   (borde de zona en reposo)
     · rojo #FF6B00 al 62 % sobre negro  → 3.16:1   (el mismo borde, hoy)

   Así que las alphas del visor se multiplican por un único factor temático.
   Un solo mando, no una tabla de valores paralela: `zoneAlpha(0.15)` emite
   `calc(0.15 * var(--sponsor-alpha-boost, 1))`.

   POR QUÉ ESTO NO PUEDE ROMPER EL TEMA OSCURO
   La hoja de abajo contiene UN bloque, y su selector es
   `:root[data-theme="desert"]`. En tactical no casa ninguna regla, así que
   todas las variables quedan sin definir y cada `var(…, respaldo)` cae en su
   respaldo, que es EXACTAMENTE el número que había escrito a mano antes
   (boost = 1). El oscuro no cambia por construcción, no por revisión.

   POR QUÉ VIVE AQUÍ Y NO EN globals.css
   Mismo criterio que `HeroSection`: globals.css es de otro módulo y estas
   variables sólo las usa el visor. Nombres con prefijo `--sponsor-` para no
   invadir el espacio de nombres del design system. Si algún día el sistema
   publica un `--tier-plata-text`, este fichero se queda en dos líneas.

   QUIÉN LA MONTA
   `SponsorshipSection` renderiza `<style>{SPONSOR_PAINT_CSS}</style>` una vez;
   es el único punto de entrada de todo `components/sponsor/**`. Quien monte
   el visor por su cuenta debe renderizarla también: sin ella nada se rompe,
   pero el tema claro se queda con las dosis pensadas para el oscuro.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Alpha de una capa del visor, escalada por el tema activo.
 *
 * @param base dosis del tema tactical — el número que estaba escrito a mano.
 */
export function zoneAlpha(base: number): string {
  return `calc(${base} * var(--sponsor-alpha-boost, 1))`;
}

/**
 * Velo del modal. En tactical es el de siempre (`bg-bg-sunken/85`, el pozo
 * casi negro); en desert ese mismo pozo es crema y no separaría nada del
 * fondo, así que allí el velo oscurece con la tinta del texto.
 */
export const SPONSOR_SCRIM = "var(--sponsor-scrim, rgb(var(--sunken-rgb) / 0.85))";

/**
 * Ajustes del tema desert. Un bloque, tres variables, ningún hex.
 *
 * · alpha-boost 1.45 — calibrado sobre el borde de zona en reposo, que es la
 *   capa más exigente: 0.62 × 1.45 ≈ 0.9 deja el contorno del tier casi
 *   sólido sobre crema (~3.6:1, por encima del 3:1 que pide un objeto
 *   gráfico). Arrastra al resto de capas en la misma proporción.
 * · ink-plata — el sand ocre (#A67B38) se queda en 3.3:1 sobre crema y no
 *   vale para una etiqueta de 11 px. Se oscurece hacia el texto primario
 *   hasta 4.7–5.4:1 según la superficie. Derivado de los tokens, no un hex:
 *   si el sistema retoca el sand, esto le sigue.
 * · scrim — ver `SPONSOR_SCRIM`.
 */
export const SPONSOR_PAINT_CSS = `
:root[data-theme="desert"] {
  --sponsor-alpha-boost: 1.45;
  --sponsor-ink-plata: color-mix(in srgb, var(--tier-plata) 74%, var(--color-text-primary));
  --sponsor-scrim: rgb(var(--text-rgb) / 0.45);
}
`;
