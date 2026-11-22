export const salon = {
  name: "Beauty Ley",
  tagline: "Beauty & Wellness Studio",
  city: "Hurghada",
  country: "Égypte",
  currency: "EGP",
  phone: "+201281343424",
  phoneDisplay: "+20 128 134 3424",
  address: {
    street: "The View, Hurghada 1",
    locality: "Hurghada",
    region: "Red Sea Governorate",
    postalCode: "84511",
    countryCode: "EG",
  },
  /** Opening hours (Africa/Cairo). 0 = Sunday … 6 = Saturday. Same as the Google Business profile. */
  openingHours: [
    { day: 0, opens: "13:00", closes: "22:00" },
    { day: 1, opens: "13:00", closes: "22:00" },
    { day: 2, opens: "13:00", closes: "22:00" },
    { day: 3, opens: "13:00", closes: "22:00" },
    { day: 4, opens: "13:30", closes: "22:00" },
    { day: 5, opens: "13:00", closes: "22:00" },
    { day: 6, opens: "13:00", closes: "22:00" },
  ],
  location: {
    lat: 27.2047397,
    lng: 33.8487333,
    mapsUrl: "https://maps.app.goo.gl/qFyBuX8Ev4QYGSMR7",
    /** Stable Google Maps link to the business profile (CID). */
    placeUrl: "https://www.google.com/maps?cid=5308915388553191408",
    /** Public embed (no API key). Pin points to Beauty Ley in Hurghada. */
    embedUrl: "https://www.google.com/maps?q=27.2047397,33.8487333&z=16&output=embed",
  },
  social: {
    instagram: {
      label: "Instagram",
      handle: "@beautyley.hurghada",
      href: "https://www.instagram.com/beautyley.hurghada/",
    },
    snapchat: {
      label: "Snapchat",
      handle: "Beauty Ley",
      href: "https://snapchat.com/t/repgFHSK",
    },
    facebook: {
      label: "Facebook",
      handle: "Beauty Ley",
      href: "https://www.facebook.com/share/1BT7hYnN94/",
    },
    whatsapp: {
      label: "WhatsApp",
      handle: "+20 128 134 3424",
      href: "https://wa.me/201281343424",
    },
  },
} as const;

export const nav = [
  { href: "/", key: "nav.home" },
  { href: "/prestations", key: "nav.services" },
  { href: "/tarifs", key: "nav.prices" },
  { href: "/galerie", key: "nav.gallery" },
  { href: "/reservation", key: "nav.book" },
  { href: "/contact", key: "nav.contact" },
] as const;

export const booking = {
  label: "Prendre rendez-vous",
  note: "Choisissez votre prestation sur le site, puis finalisez sur WhatsApp.",
} as const;
