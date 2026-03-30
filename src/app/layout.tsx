import type { Metadata } from "next";
import { Aubrey, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import CursorTopoEffect from "@/components/ui/CursorTopoEffect";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const aubrey = Aubrey({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
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
    <html lang="es" className={`${aubrey.variable} ${barlow.variable}`}>
      <body className="font-body antialiased bg-[var(--color-dark)] text-[var(--color-cream)]">
        <CursorTopoEffect />
        <Navbar />
        {children}
        <FooterSection />
      </body>
    </html>
  );
}
