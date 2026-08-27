import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { salon } from "@/data/salon";
import { getSiteUrl } from "@/lib/site";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LOCALE_META } from "@/i18n/config";
import { getLocale, getT } from "@/i18n/server";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8efe8",
};

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("meta.defaultTitle"),
      template: "%s · Beauty Ley Hurghada",
    },
    description: t("meta.description"),
    keywords: [
      "Beauty Ley",
      "Beauty Ley Hurghada",
      "salon de beauté Hurghada",
      "beauty salon Hurghada",
      "Beauty & Wellness Studio",
    ],
    openGraph: {
      type: "website",
      locale: LOCALE_META[locale].og,
      url: siteUrl,
      siteName: salon.name,
      title: t("meta.defaultTitle"),
      description: t("meta.ogDescription"),
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Beauty Ley, Hurghada" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.defaultTitle"),
      description: t("meta.twDescription"),
      images: ["/images/og.jpg"],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html
      lang={LOCALE_META[locale].html}
      dir={LOCALE_META[locale].dir}
      className={`${outfit.variable} ${cormorant.variable}`}
    >
      <body className="font-sans antialiased">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
