import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { salon } from "@/data/salon";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8efe8",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Beauty Ley — Beauty & Wellness Studio | Hurghada",
    template: "%s · Beauty Ley Hurghada",
  },
  description:
    "Beauty Ley, Beauty & Wellness Studio à Hurghada. Cheveux, manucure, pédicure, cils, sourcils, maquillage permanent, épilation et soins du corps.",
  keywords: [
    "Beauty Ley",
    "Beauty Ley Hurghada",
    "salon de beauté Hurghada",
    "manucure Hurghada",
    "extensions de cils Hurghada",
    "coiffure Hurghada",
    "Beauty & Wellness Studio",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: salon.name,
    title: "Beauty Ley — Beauty & Wellness Studio | Hurghada",
    description:
      "Beauty Ley, Beauty & Wellness Studio à Hurghada. Cheveux, ongles, cils, maquillage permanent et soins.",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Beauty Ley, Hurghada" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beauty Ley — Beauty & Wellness Studio | Hurghada",
    description: "Salon de beauté Beauty Ley à Hurghada. Prestations, tarifs et galerie.",
    images: ["/images/og.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${outfit.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
