/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — CONTRATO DEL TEMA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Un unico sitio donde viven los literales del tema. Lo consumen:
     · `layout.tsx`        (servidor) → inyecta THEME_INIT_SCRIPT en el <head>
     · `ThemeProvider.tsx` (cliente)  → lee/escribe localStorage y el atributo
     · `ThemeToggle.tsx`   (cliente)  → nombres y estado

   Este modulo NO lleva "use client" a proposito: es codigo neutro que se
   importa desde el layout de servidor sin arrastrar un limite de cliente.

   MECANISMO
     · Atributo `data-theme` en <html>, valores "desert" | "tactical".
     · "desert" es el tema PRIMARIO y por defecto en la primera visita.
       No se consulta `prefers-color-scheme`: el cliente ha elegido el claro
       como primario de forma explicita.
     · Persistencia en localStorage bajo la clave "boam-theme".
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/** Los dos temas del sitio. El orden marca el ciclo del toggle. */
export const THEMES = ["desert", "tactical"] as const;

export type Theme = (typeof THEMES)[number];

/** Primera visita, JS desactivado, valor corrupto en storage → siempre este. */
export const DEFAULT_THEME: Theme = "desert";

/** Clave de localStorage. Acordada con el cliente, no renombrar. */
export const THEME_STORAGE_KEY = "boam-theme";

/** Atributo en <html> sobre el que engancha el CSS (`:root[data-theme=…]`). */
export const THEME_ATTRIBUTE = "data-theme";

/**
 * Color de la barra del navegador (`meta[name="theme-color"]`) por tema.
 * Coincide con `--color-bg-base` de cada paleta: el chrome del movil deja
 * de anunciar un fondo oscuro cuando el sitio se ve en crema.
 */
export const THEME_COLOR: Record<Theme, string> = {
  desert: "#F4EEE2",
  tactical: "#0F1012",
};

/** Type guard: descarta null, valores viejos y basura en localStorage. */
export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/** Devuelve el otro tema. Un solo sitio define el ciclo. */
export function nextTheme(theme: Theme): Theme {
  return theme === "desert" ? "tactical" : "desert";
}

/**
 * SCRIPT ANTI-PARPADEO — se inyecta sincrono en el <head>, antes del primer
 * pintado, con dangerouslySetInnerHTML.
 *
 * Sin esto, quien eligio "tactical" se come un fogonazo crema en cada carga:
 * el servidor no sabe que tema guardo el usuario y solo puede emitir el
 * marcado del tema por defecto.
 *
 * Minimo, sincrono y con try/catch: en ventana privada o con cookies
 * bloqueadas el simple acceso a `localStorage` LANZA, y una excepcion aqui
 * dejaria la pagina sin atributo de tema.
 *
 * Se construye a partir de las constantes de arriba (nada escrito a mano
 * dos veces) y se serializa con JSON.stringify, que ya entrecomilla y
 * escapa correctamente para incrustarlo en un <script>.
 */
export const THEME_INIT_SCRIPT = [
  "(function(){",
  "var t=" + JSON.stringify(DEFAULT_THEME) + ";",
  "try{",
  "var s=window.localStorage.getItem(" + JSON.stringify(THEME_STORAGE_KEY) + ");",
  "if(" + JSON.stringify(THEMES) + ".indexOf(s)!==-1){t=s;}",
  "}catch(e){}",
  "try{document.documentElement.setAttribute(" +
    JSON.stringify(THEME_ATTRIBUTE) +
    ",t);}catch(e){}",
  "})();",
].join("");
