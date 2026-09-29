export type Price =
  | { kind: "fixed"; value: number }
  | { kind: "from"; value: number }
  | { kind: "range"; min: number; max: number }
  | { kind: "supplement"; value: number }
  | { kind: "quote" };

export type ServiceItem = {
  /** Stable id used for translations (`item.{groupId}.{id}`). */
  id: string;
  /** French fallback label when a translation is missing. */
  name: string;
  price: Price;
};

export type ServiceGroup = {
  id: string;
  title: string;
  /** Catalog note keys (`note.{key}`). */
  notes?: string[];
  items: ServiceItem[];
};

export type ServiceCategory = {
  id: string;
  title: string;
  href: string;
  image: string;
  imageAlt: string;
  groups: ServiceGroup[];
};

export const categories: ServiceCategory[] = [
  {
    id: "cheveux",
    title: "Cheveux",
    href: "/prestations#cheveux",
    image: "/images/work/hair-balayage.jpg",
    imageAlt: "Balayage et brushing, réalisation cheveux Beauty Ley",
    groups: [
      {
        id: "shampoo-brushing",
        title: "Shampoing + brushing",
        notes: ["from-price"],
        items: [
          { id: "short", name: "Cheveux court", price: { kind: "from", value: 600 } },
          { id: "medium", name: "Cheveux mi-longs", price: { kind: "from", value: 750 } },
          { id: "long", name: "Cheveux longs", price: { kind: "from", value: 900 } },
          { id: "extra-long", name: "Cheveux extra longs", price: { kind: "from", value: 1100 } },
          { id: "wavy-extra", name: "Supp wavy", price: { kind: "supplement", value: 150 } },
          { id: "treatment", name: "Soins", price: { kind: "from", value: 300 } },
          { id: "cut", name: "Coupe", price: { kind: "from", value: 500 } },
          { id: "bangs", name: "Frange", price: { kind: "from", value: 300 } },
          { id: "mens-cut", name: "Coupe homme", price: { kind: "from", value: 900 } },
          { id: "beard", name: "Barbe", price: { kind: "from", value: 500 } },
          { id: "mens-cut-beard", name: "Coupe homme + barbe", price: { kind: "from", value: 1200 } },
          { id: "braids", name: "Tresses / rasta", price: { kind: "from", value: 1000 } },
        ],
      },
      {
        id: "couleur",
        title: "Couleur : shampoing + brushing",
        notes: ["from-price"],
        items: [
          { id: "short", name: "Cheveux court", price: { kind: "from", value: 2300 } },
          { id: "medium", name: "Cheveux mi-longs", price: { kind: "from", value: 3100 } },
          { id: "long", name: "Cheveux longs", price: { kind: "from", value: 4500 } },
          { id: "roots", name: "Racine", price: { kind: "from", value: 2000 } },
          { id: "root-decoration", name: "Décoration racine", price: { kind: "from", value: 3500 } },
          { id: "toner", name: "Patine", price: { kind: "from", value: 1800 } },
        ],
      },
      {
        id: "coloration-avancee",
        title: "Ombré · Balayage · Highlight",
        notes: ["from-price"],
        items: [
          { id: "short-ombre", name: "Cheveux court — ombré", price: { kind: "from", value: 4500 } },
          { id: "short-balayage", name: "Cheveux court — balayage", price: { kind: "from", value: 5000 } },
          { id: "short-highlight", name: "Cheveux court — highlight", price: { kind: "from", value: 7000 } },
          { id: "medium-ombre", name: "Cheveux mi-longs — ombré", price: { kind: "from", value: 5500 } },
          { id: "medium-balayage", name: "Cheveux mi-longs — balayage", price: { kind: "from", value: 6000 } },
          { id: "medium-highlight", name: "Cheveux mi-longs — highlight", price: { kind: "from", value: 8500 } },
          { id: "long-ombre", name: "Cheveux longs — ombré", price: { kind: "from", value: 6000 } },
          { id: "long-balayage", name: "Cheveux longs — balayage", price: { kind: "from", value: 7000 } },
          { id: "long-highlight", name: "Cheveux longs — highlight", price: { kind: "from", value: 9500 } },
          { id: "extensions", name: "Extensions", price: { kind: "quote" } },
        ],
      },
    ],
  },
  {
    id: "ongles",
    title: "Manucure & onglerie",
    href: "/prestations#ongles",
    image: "/images/work/nails-french-almond.jpg",
    imageAlt: "Manucure French almond réalisée chez Beauty Ley",
    groups: [
      {
        id: "manucure",
        title: "Manucure & onglerie",
        notes: ["fill-max-3-weeks"],
        items: [
          { id: "simple", name: "Manucure simple", price: { kind: "fixed", value: 1100 } },
          { id: "semi", name: "Manucure semi-permanent", price: { kind: "fixed", value: 1500 } },
          { id: "gel", name: "Manucure gel", price: { kind: "fixed", value: 1750 } },
          { id: "extensions", name: "Manucure extensions", price: { kind: "fixed", value: 2050 } },
          { id: "fill", name: "Remplissage", price: { kind: "fixed", value: 1800 } },
          { id: "remove-semi", name: "Dépose semi-permanent", price: { kind: "fixed", value: 400 } },
          { id: "remove-gel", name: "Dépose gel", price: { kind: "fixed", value: 600 } },
          { id: "babyboomer", name: "Babyboomer / French", price: { kind: "fixed", value: 250 } },
          { id: "nail-art", name: "Nail arts", price: { kind: "range", min: 50, max: 150 } },
          { id: "broken-nail", name: "Ongle cassé (réparation)", price: { kind: "fixed", value: 150 } },
          { id: "mens", name: "Manucure homme", price: { kind: "fixed", value: 1500 } },
        ],
      },
      {
        id: "pedicure",
        title: "Pédicure",
        items: [
          { id: "simple", name: "Pédicure simple", price: { kind: "fixed", value: 1100 } },
          { id: "semi", name: "Pédicure semi-permanent", price: { kind: "fixed", value: 1500 } },
          { id: "gel", name: "Pédicure gel", price: { kind: "fixed", value: 1700 } },
          { id: "spa", name: "Spa pédicure", price: { kind: "fixed", value: 1500 } },
          { id: "spa-semi", name: "Spa pédicure + semi-permanent", price: { kind: "fixed", value: 1900 } },
          { id: "spa-gel", name: "Spa pédicure + gel", price: { kind: "fixed", value: 2200 } },
          { id: "remove-semi", name: "Dépose semi-permanent", price: { kind: "fixed", value: 200 } },
          { id: "remove-gel", name: "Dépose gel", price: { kind: "fixed", value: 400 } },
          { id: "extensions", name: "Extensions", price: { kind: "fixed", value: 150 } },
          { id: "mens", name: "Pédicure homme", price: { kind: "fixed", value: 1600 } },
          { id: "spa-mens", name: "Spa pédicure homme", price: { kind: "fixed", value: 2200 } },
        ],
      },
    ],
  },
  {
    id: "cils",
    title: "Cils & sourcils",
    href: "/prestations#cils",
    image: "/images/work/portrait-volume.jpg",
    imageAlt: "Extensions de cils volume réalisées chez Beauty Ley",
    groups: [
      {
        id: "pose-complete",
        title: "Pose complète",
        notes: ["fill-max-21-days"],
        items: [
          { id: "classic", name: "Cil à cil", price: { kind: "fixed", value: 1900 } },
          { id: "mix", name: "Mix volume", price: { kind: "fixed", value: 2100 } },
          { id: "russian-2-3", name: "Volume russe (2 & 3D)", price: { kind: "fixed", value: 2400 } },
          { id: "russian-4-5", name: "Volume russe (4 & 5D)", price: { kind: "fixed", value: 2600 } },
          { id: "mega-6-7", name: "Méga volume (6 & 7D)", price: { kind: "fixed", value: 2800 } },
          { id: "extra-mega-8", name: "Extra méga volume (8D et plus)", price: { kind: "fixed", value: 3100 } },
          { id: "remove-studio", name: "Dépose beauté", price: { kind: "fixed", value: 300 } },
          { id: "remove-external", name: "Dépose extérieure", price: { kind: "fixed", value: 500 } },
        ],
      },
      {
        id: "comblage",
        title: "Comblage",
        notes: ["lash-extras"],
        items: [
          { id: "classic", name: "Cil à cil", price: { kind: "fixed", value: 1700 } },
          { id: "mix", name: "Mix volume", price: { kind: "fixed", value: 1900 } },
          { id: "russian-2-3", name: "Volume russe (2 & 3D)", price: { kind: "fixed", value: 2200 } },
          { id: "russian-4-5", name: "Volume russe (4 & 5D)", price: { kind: "fixed", value: 2400 } },
          { id: "mega-6-7", name: "Méga volume (6 & 7D)", price: { kind: "fixed", value: 2600 } },
          { id: "extra-mega-8", name: "Extra méga volume (8D et plus)", price: { kind: "fixed", value: 2900 } },
        ],
      },
      {
        id: "lash-brow",
        title: "Lash & brow",
        items: [
          { id: "browlift", name: "Browlift", price: { kind: "fixed", value: 1500 } },
          { id: "tint", name: "Teinture", price: { kind: "fixed", value: 500 } },
          { id: "lash-lift", name: "Rehaussement de cils", price: { kind: "fixed", value: 1500 } },
        ],
      },
    ],
  },
  {
    id: "maquillage-permanent",
    title: "Maquillage permanent",
    href: "/prestations#maquillage-permanent",
    image: "/images/work/portrait-brows.jpg",
    imageAlt: "Regard et sourcils travaillés chez Beauty Ley",
    groups: [
      {
        id: "pmu",
        title: "Maquillage permanent",
        notes: ["after-2-months-full"],
        items: [
          { id: "microblading", name: "Microblading sourcils", price: { kind: "fixed", value: 9900 } },
          { id: "candy-lips", name: "Candy lips", price: { kind: "fixed", value: 9000 } },
          { id: "inter-lash", name: "Inter-cils", price: { kind: "fixed", value: 6000 } },
          { id: "touch-up", name: "Retouche dans les 2 mois", price: { kind: "fixed", value: 5000 } },
        ],
      },
    ],
  },
  {
    id: "esthetique",
    title: "Esthétique & épilation",
    href: "/prestations#esthetique",
    image: "/images/salon/hair-wash.jpg",
    imageAlt: "Espace lavage Beauty Ley",
    groups: [
      {
        id: "epilation",
        title: "Esthétique & épilation",
        notes: ["men-plus-20"],
        items: [
          { id: "brows", name: "Épilation sourcils", price: { kind: "fixed", value: 450 } },
          { id: "lips", name: "Épilation lèvres", price: { kind: "fixed", value: 300 } },
          { id: "cheeks", name: "Épilation joues", price: { kind: "fixed", value: 500 } },
          {
            id: "full-face",
            name: "Épilation visage complet (sourcils, lèvres, joues, menton)",
            price: { kind: "fixed", value: 1300 },
          },
          { id: "underarms", name: "Épilation aisselles", price: { kind: "fixed", value: 450 } },
          { id: "half-arms", name: "Épilation demi-bras", price: { kind: "fixed", value: 650 } },
          { id: "full-arms", name: "Épilation bras complets", price: { kind: "fixed", value: 1000 } },
          { id: "full-legs", name: "Épilation jambes complètes", price: { kind: "fixed", value: 1200 } },
          { id: "half-legs", name: "Épilation demi-jambes", price: { kind: "fixed", value: 700 } },
          { id: "bikini", name: "Épilation maillot simple", price: { kind: "fixed", value: 1200 } },
          { id: "brazilian", name: "Épilation brésilienne", price: { kind: "fixed", value: 700 } },
          { id: "full-bikini", name: "Épilation maillot intégral", price: { kind: "fixed", value: 1200 } },
          { id: "intergluteal", name: "Épilation interfessier", price: { kind: "fixed", value: 300 } },
          { id: "back", name: "Épilation dos", price: { kind: "from", value: 300 } },
        ],
      },
    ],
  },
  {
    id: "soins",
    title: "Soins du corps",
    href: "/prestations#soins",
    image: "/images/salon/pedicure-lounge.jpg",
    imageAlt: "Espace spa et pédicure Beauty Ley",
    groups: [
      {
        id: "corps",
        title: "Soins du corps",
        items: [
          { id: "colombian-lift", name: "Lifting colombien fessier", price: { kind: "fixed", value: 1400 } },
          { id: "maderotherapy", name: "Massage madérothérapie", price: { kind: "fixed", value: 1900 } },
          { id: "massage-30", name: "Massage relaxant — 30 min", price: { kind: "fixed", value: 1800 } },
          { id: "massage-60", name: "Massage relaxant — 1h", price: { kind: "fixed", value: 2200 } },
          { id: "facial", name: "Soins du visage", price: { kind: "fixed", value: 2500 } },
          {
            id: "hijama",
            name: "Séance hijama (thérapie par ventouses)",
            price: { kind: "fixed", value: 2000 },
          },
          { id: "korean-face", name: "Korean face massage", price: { kind: "fixed", value: 1500 } },
        ],
      },
    ],
  },
];

export function getCategory(id: string) {
  return categories.find((category) => category.id === id);
}

export function itemCatalogKey(groupId: string, itemId: string) {
  return `item.${groupId}.${itemId}`;
}

export function groupCatalogKey(groupId: string) {
  return `group.${groupId}`;
}

export function noteCatalogKey(noteId: string) {
  return `note.${noteId}`;
}
