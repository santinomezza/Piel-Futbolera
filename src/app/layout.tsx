import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DOCE | Camisetas de Fútbol Premium en Argentina",
  description: "La tienda oficial de camisetas de fútbol de alta calidad en Argentina. Modelos titulares, suplentes, retro y de arquero con envíos a todo el país.",
  keywords: ["camisetas de fútbol", "camisetas retro", "camisetas titular", "camisetas arquero", "fútbol argentina", "DOCE"],
  authors: [{ name: "DOCE Camisetas" }],
  openGraph: {
    title: "DOCE | Camisetas de Fútbol Premium",
    description: "Modelos exclusivos de camisetas deportivas con envíos por Andreani y Correo Argentino.",
    type: "website",
    locale: "es_AR",
    siteName: "DOCE Camisetas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable} h-full dark antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0B0F17] text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
