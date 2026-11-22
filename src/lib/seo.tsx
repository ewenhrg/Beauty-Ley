import type { Metadata } from "next";
import { salon } from "@/data/salon";
import { categories } from "@/data/services";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";
import { languageAlternates, localizePath } from "@/i18n/paths";
import { seoCopy, type PageId } from "@/i18n/seo";
import { translate } from "@/i18n/t";
import { categoryKey } from "@/i18n/keys";
import { getSiteUrl } from "./site";

export const PAGE_PATHS: Record<PageId, string> = {
  home: "/",
  services: "/prestations",
  prices: "/tarifs",
  gallery: "/galerie",
  contact: "/contact",
  book: "/reservation",
};

/** Title, description, canonical URL and hreflang alternates for one page in one language. */
export function pageMetadata(locale: Locale, page: PageId): Metadata {
  const { title, description } = seoCopy(locale).pages[page];
  const path = PAGE_PATHS[page];
  const url = localizePath(locale, path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: salon.name,
      locale: LOCALE_META[locale].og,
      alternateLocale: LOCALES.filter((code) => code !== locale).map((code) => LOCALE_META[code].og),
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: `${salon.name}, Hurghada` }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/images/og.jpg"] },
  };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** schema.org BeautySalon: what Google uses for the local business panel. */
export function salonJsonLd(locale: Locale) {
  const siteUrl = getSiteUrl();
  const copy = seoCopy(locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BeautySalon",
        "@id": `${siteUrl}/#salon`,
        name: salon.name,
        alternateName: ["Beauty LEY", "Beauty Ley Hurghada"],
        description: copy.pages.home.description,
        url: `${siteUrl}${localizePath(locale, "/")}`,
        image: [
          `${siteUrl}/images/og.jpg`,
          `${siteUrl}/images/salon/salon-wide.jpg`,
          `${siteUrl}/images/salon/reception.jpg`,
        ],
        logo: `${siteUrl}/images/logo/monogram.png`,
        telephone: salon.phone,
        priceRange: "EGP",
        currenciesAccepted: "EGP",
        address: {
          "@type": "PostalAddress",
          streetAddress: salon.address.street,
          addressLocality: salon.address.locality,
          addressRegion: salon.address.region,
          postalCode: salon.address.postalCode,
          addressCountry: salon.address.countryCode,
        },
        geo: { "@type": "GeoCoordinates", latitude: salon.location.lat, longitude: salon.location.lng },
        hasMap: salon.location.placeUrl,
        areaServed: { "@type": "City", name: "Hurghada" },
        openingHoursSpecification: salon.openingHours.map((slot) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${DAY_NAMES[slot.day]}`,
          opens: slot.opens,
          closes: slot.closes,
        })),
        sameAs: [salon.social.instagram.href, salon.social.facebook.href, salon.social.snapchat.href],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: copy.pages.services.title,
          itemListElement: categories.map((category) => {
            const key = categoryKey(category.id);
            return {
              "@type": "OfferCatalog",
              name: key ? translate(locale, key) : category.title,
              url: `${siteUrl}${localizePath(locale, category.href)}`,
            };
          }),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: salon.name,
        inLanguage: LOCALE_META[locale].html,
        publisher: { "@id": `${siteUrl}/#salon` },
      },
    ],
  };
}

export function faqJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seoCopy(locale).faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(locale: Locale, page: PageId) {
  const siteUrl = getSiteUrl();
  const copy = seoCopy(locale);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: salon.name, item: `${siteUrl}${localizePath(locale, "/")}` },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.pages[page].title.split(/ [–|(]/)[0],
        item: `${siteUrl}${localizePath(locale, PAGE_PATHS[page])}`,
      },
    ],
  };
}

/** Inline JSON-LD; `<` escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
