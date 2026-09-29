export const salon = {
  name: "Beauty Ley",
  tagline: "Beauty & Wellness Studio",
  city: "Hurghada",
  country: "Égypte",
  currency: "EGP",
  location: {
    lat: 27.2047397,
    lng: 33.8487333,
    mapsUrl: "https://maps.app.goo.gl/FWYahcDVNFYG8pBU6",
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
