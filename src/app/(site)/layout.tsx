import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { FlyerPopup } from "@/components/FlyerPopup";
import { BookingProvider } from "@/components/BookingProvider";
import { MobileBookingBar } from "@/components/MobileBookingBar";
import { salon } from "@/data/salon";
import { getSiteUrl } from "@/lib/site";
import { getStoreStatus } from "@/server/db";
import { getPublicBannerMessages } from "@/server/repo/banner";
import { getPublicFlyers } from "@/server/repo/flyers";
import { getT } from "@/i18n/server";

const siteUrl = getSiteUrl();

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
  geo: {
    "@type": "GeoCoordinates",
    latitude: salon.location.lat,
    longitude: salon.location.lng,
  },
  hasMap: salon.location.mapsUrl,
  sameAs: [salon.social.instagram.href, salon.social.facebook.href, salon.social.snapchat.href],
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const bookingOnline = getStoreStatus().ready;
  const [promoMessages, flyers] = bookingOnline
    ? await Promise.all([getPublicBannerMessages(), getPublicFlyers()])
    : [[], []];
  const hasPromo = promoMessages.length > 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  );
}
