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
  { href: "/", label: "Accueil" },
  { href: "/prestations", label: "Prestations" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/galerie", label: "Galerie" },
  { href: "/reservation", label: "Réserver" },
  { href: "/contact", label: "Contact" },
] as const;

export const booking = {
  label: "Prendre rendez-vous",
  note: "Réservez en ligne ou contactez Beauty Ley sur ses réseaux officiels.",
} as const;
