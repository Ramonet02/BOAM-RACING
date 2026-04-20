import type { Metadata } from "next";
import { Anton, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import CursorTopoEffect from "@/components/ui/CursorTopoEffect";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boam Racing — UniRaid 2027 · Rally Solidario por Marruecos",
  description:
    "Escudería universitaria de 8 estudiantes. 9 días cruzando Marruecos de norte a sur transportando material humanitario. Conviértete en patrocinador.",
  keywords: [
    "Boam Racing",
    "UniRaid",
    "rally solidario",
    "Marruecos",
    "patrocinio",
    "escudería universitaria",
    "Ford Escort",
  ],
  openGraph: {
    title: "Boam Racing — UniRaid 2027",
    description: "9 días. 4 coches. Una misión. Rally solidario por Marruecos.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${inter.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-body antialiased bg-[var(--color-bg-sand)] text-[var(--color-text-primary)]"
        suppressHydrationWarning
      >
        <CursorTopoEffect />
        <Navbar />
        {children}
        <FooterSection />
      </body>
    </html>
  );
}
