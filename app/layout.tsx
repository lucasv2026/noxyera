import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: "400",
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: "#1b4332",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Noxyera — Gestion Anti-Nuisibles HACCP pour Restaurants & Hôtels",
    template: "%s | Noxyera",
  },
  description:
    "Noxyera digitalise la gestion anti-nuisibles des restaurants, hôtels et industries agroalimentaires. Rapports HACCP automatiques, conformité garantie, techniciens certifiés Certibiocide.",
  keywords: [
    "gestion anti-nuisibles", "dératisation", "désinsectisation", "HACCP",
    "plan de maîtrise sanitaire", "PMS", "restaurant", "hôtel", "agroalimentaire",
    "nuisibles", "rapport HACCP", "certibiocide", "3D nuisibles", "France",
  ],
  authors: [{ name: "Noxyera", url: "https://noxyera.com" }],
  creator: "Noxyera",
  publisher: "Noxyera",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://noxyera.com",
    siteName: "Noxyera",
    title: "Noxyera — Gestion Anti-Nuisibles HACCP pour Restaurants & Hôtels",
    description:
      "Digitalisez votre gestion anti-nuisibles. Rapports HACCP automatiques, conformité garantie, techniciens certifiés Certibiocide partout en France.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noxyera — Gestion Anti-Nuisibles HACCP",
    description: "Rapports HACCP automatiques, techniciens certifiés, conformité garantie.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Noxyera",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
