import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookingProvider } from "@/components/BookingProvider";
import { MobileBookingBar } from "@/components/MobileBookingBar";
import { salon } from "@/data/salon";
import { getSiteUrl } from "@/lib/site";
import { getStoreStatus } from "@/server/db";

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
  sameAs: [salon.social.instagram.href, salon.social.facebook.href, salon.social.snapchat.href],
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const bookingOnline = getStoreStatus().ready;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <BookingProvider online={bookingOnline}>
        <Header />
        <main id="contenu" className="pb-20 lg:pb-0">
          {children}
        </main>
        <Footer />
        <MobileBookingBar />
      </BookingProvider>
    </>
  );
}
