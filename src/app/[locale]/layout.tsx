import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { FlyerPopup } from "@/components/FlyerPopup";
import { BookingProvider } from "@/components/BookingProvider";
import { MobileBookingBar } from "@/components/MobileBookingBar";
import { getSiteUrl } from "@/lib/site";
import { JsonLd, pageMetadata, salonJsonLd } from "@/lib/seo";
import { getStoreStatus } from "@/server/db";
import { getPublicBannerMessages } from "@/server/repo/banner";
import { getPublicFlyers } from "@/server/repo/flyers";
import { I18nProvider } from "@/i18n/I18nProvider";
import { messagesFor } from "@/i18n/t";
import { catalogFor } from "@/i18n/catalog";
import { LOCALES, LOCALE_META } from "@/i18n/config";
import { getLocale, getT } from "@/i18n/server";
import { seoCopy } from "@/i18n/seo";
import { cormorant, outfit } from "../fonts";
import "../globals.css";

/**
 * Every public page is prerendered per language and served from the CDN.
 * Admin changes (banner, flyers, catalog) refresh it through revalidatePath;
 * the timer is only a safety net.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8efe8",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL(getSiteUrl()),
    ...pageMetadata(locale, "home"),
    title: { default: seoCopy(locale).pages.home.title, template: "%s · Beauty Ley Hurghada" },
    applicationName: "Beauty Ley",
    category: "beauty",
    robots: { index: true, follow: true, "max-image-preview": "large" },
    formatDetection: { telephone: true },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!(LOCALES as readonly string[]).includes(raw)) notFound();
  const locale = await getLocale();
  const t = await getT();

  const bookingOnline = getStoreStatus().ready;
  const [promoMessages, flyers] = bookingOnline
    ? await Promise.all([getPublicBannerMessages(), getPublicFlyers()])
    : [[], []];
  const hasPromo = promoMessages.length > 0;

  return (
    <html lang={LOCALE_META[locale].html} className={`${outfit.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <JsonLd data={salonJsonLd(locale)} />
        <I18nProvider locale={locale} messages={messagesFor(locale)} catalog={catalogFor(locale)}>
          <a className="skip-link" href="#contenu">
            {t("skip.content")}
          </a>
          <BookingProvider online={bookingOnline}>
            <div className={hasPromo ? "has-promo-banner" : undefined}>
              <PromoBanner messages={promoMessages} />
              <Header hasPromo={hasPromo} />
              <main id="contenu" className="pb-[calc(5.75rem+env(safe-area-inset-bottom))] lg:pb-0">
                {children}
              </main>
              <Footer />
              <MobileBookingBar />
              <FlyerPopup flyers={flyers} />
            </div>
          </BookingProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
