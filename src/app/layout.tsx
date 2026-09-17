import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CursorTopoEffect from "@/components/ui/CursorTopoEffect";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { DEFAULT_THEME, THEME_COLOR, THEME_INIT_SCRIPT } from "@/theme/themeScript";
import { BRAND, SITE_META } from "@/lib/constants";

/**
 * NOTA DE INTEGRACION — los metadatos ya NO se escriben aqui.
 *
 * Este fichero tenia dos constantes locales de edicion y una descripcion
 * escrita a mano que decia "9 dias". El dato real son 8 dias y 6 etapas
 * (ROUTE_SUMMARY, derivado de las etapas de `src/lib/route.ts`), asi que
 * los metadatos servidos contradecian a la propia web.
 *
 * Ahora todo sale de `SITE_META` (src/lib/constants.ts), que a su vez
 * compone su texto desde EDITION, BRAND, TEAM_SIZE, FLEET_SIZE y
 * ROUTE_SUMMARY. Ni una cifra ni una fecha escritas a mano.
 */

/**
 * Tipografia del design system "Rally Desert Tactical".
 *
 * next/font expone cada familia en una variable intermedia
 * (--font-chakra / --font-inter / --font-jetbrains) y `globals.css` las
 * reexporta en @theme con los nombres semanticos publicos
 * --font-heading / --font-body / --font-mono (y las utilidades
 * font-heading / font-body / font-mono).
 *
 * Los nombres intermedios son deliberados: si next/font emitiese
 * directamente --font-mono chocaria con el token homonimo del tema por
 * defecto de Tailwind v4 sobre el mismo elemento <html>, y la familia
 * ganadora quedaria al azar del orden de inyeccion del CSS.
 */
const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_META.title,
    template: `%s · ${BRAND.name}`,
  },
  description: SITE_META.description,
  applicationName: BRAND.name,
  keywords: [...SITE_META.keywords],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
  openGraph: {
    title: SITE_META.ogTitle,
    description: SITE_META.ogDescription,
    siteName: BRAND.name,
    type: "website",
    locale: SITE_META.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_META.ogTitle,
    description: SITE_META.ogDescription,
  },
  formatDetection: {
    telephone: false,
  },
};

/**
 * El sitio ya no es monotema, asi que aqui no puede quedar ningun color
 * fijo del tema oscuro (antes: themeColor "#0F1012" y colorScheme "dark",
 * que pintaban el chrome del movil de negro incluso sobre la crema).
 *
 * `themeColor` sale del tema PRIMARIO; cuando el usuario conmuta,
 * `ThemeProvider` reescribe el meta en caliente (THEME_COLOR).
 * `colorScheme: "light dark"` solo declara que se soportan ambos: el valor
 * efectivo lo fija el CSS por tema, no este meta.
 */
export const viewport: Viewport = {
  themeColor: THEME_COLOR[DEFAULT_THEME],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
   * TEMA Y HIDRATACION
   *
   * El servidor no sabe que tema guardo el usuario, asi que <html> sale
   * SIEMPRE con `data-theme` = tema por defecto. El marcado queda estable
   * y, con JS desactivado, el sitio conserva tema (el primario) en vez de
   * quedarse sin atributo y caer en los valores base del @theme.
   *
   * El script del <head> reescribe ese atributo antes del primer pintado y
   * `suppressHydrationWarning` en <html> es justo lo que permite que lo haga
   * sin romper la hidratacion.
   */
  return (
    <html
      lang="es"
      data-theme={DEFAULT_THEME}
      className={`${chakraPetch.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Anti-parpadeo: sincrono, minimo y lo primero del <head>, para que
          `data-theme` quede fijado ANTES del primer pintado. Sin esto, quien
          eligio "tactical" veria un fogonazo crema en cada carga.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body
        className="font-body antialiased bg-[var(--color-bg-base)] text-[var(--color-text-primary)]"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <CursorTopoEffect />
            <Navbar />
            {children}
            <FooterSection />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
