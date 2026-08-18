import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookingProvider } from "@/components/BookingProvider";
import { MobileBookingBar } from "@/components/MobileBookingBar";
import { salon } from "@/data/salon";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: salon.name,
  description: `${salon.name} — ${salon.tagline}, ${salon.city}`,
  image: `${siteUrl}/images/og.jpg`,
  url: siteUrl,
  address: {
    "@type": "PostalAddress",
    addressLocality: salon.city,
    addressCountry: "EG",
  },
  sameAs: [salon.social.instagram.href, salon.social.facebook.href, salon.social.snapchat.href],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${outfit.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <BookingProvider>
          <Header />
          <main id="contenu" className="pb-20 lg:pb-0">
            {children}
          </main>
          <Footer />
          <MobileBookingBar />
        </BookingProvider>
      </body>
    </html>
  );
}
