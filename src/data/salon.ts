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
  { href: salon.social.whatsapp.href, key: "nav.book", external: true },
  { href: "/contact", key: "nav.contact" },
] as const;

export const booking = {
  label: "Prendre rendez-vous",
  note: "Réservez sur WhatsApp ou contactez Beauty Ley sur ses réseaux officiels.",
} as const;
