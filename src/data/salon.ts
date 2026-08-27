export const salon = {
  name: "Beauty Ley",
  tagline: "Beauty & Wellness Studio",
  city: "Hurghada",
  country: "Égypte",
  currency: "EGP",
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
  note: "Réservez en ligne ou contactez Beauty Ley sur ses réseaux officiels.",
} as const;
