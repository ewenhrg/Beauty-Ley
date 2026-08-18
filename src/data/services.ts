export type Price =
  | { kind: "fixed"; value: number }
  | { kind: "from"; value: number }
  | { kind: "range"; min: number; max: number }
  | { kind: "supplement"; value: number }
  | { kind: "quote" };

export type ServiceItem = {
  name: string;
  price: Price;
};

export type ServiceGroup = {
  id: string;
  title: string;
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
        notes: ["Tarifs indiqués à partir de."],
        items: [
          { name: "Cheveux court", price: { kind: "from", value: 600 } },
          { name: "Cheveux mi-longs", price: { kind: "from", value: 750 } },
          { name: "Cheveux longs", price: { kind: "from", value: 900 } },
          { name: "Cheveux extra longs", price: { kind: "from", value: 1100 } },
          { name: "Supp wavy", price: { kind: "supplement", value: 150 } },
          { name: "Soins", price: { kind: "from", value: 300 } },
          { name: "Coupe", price: { kind: "from", value: 500 } },
          { name: "Frange", price: { kind: "from", value: 300 } },
          { name: "Coupe homme", price: { kind: "from", value: 900 } },
          { name: "Barbe", price: { kind: "from", value: 500 } },
          { name: "Coupe homme + barbe", price: { kind: "from", value: 1200 } },
          { name: "Tresses / rasta", price: { kind: "from", value: 1000 } },
        ],
      },
      {
        id: "couleur",
        title: "Couleur : shampoing + brushing",
        notes: ["Tarifs indiqués à partir de."],
        items: [
          { name: "Cheveux court", price: { kind: "from", value: 2300 } },
          { name: "Cheveux mi-longs", price: { kind: "from", value: 3100 } },
          { name: "Cheveux longs", price: { kind: "from", value: 4500 } },
          { name: "Racine", price: { kind: "from", value: 2000 } },
          { name: "Décoration racine", price: { kind: "from", value: 3500 } },
          { name: "Patine", price: { kind: "from", value: 1800 } },
        ],
      },
      {
        id: "coloration-avancee",
        title: "Ombré · Balayage · Highlight",
        notes: ["Tarifs indiqués à partir de."],
        items: [
          { name: "Cheveux court — ombré", price: { kind: "from", value: 4500 } },
          { name: "Cheveux court — balayage", price: { kind: "from", value: 5000 } },
          { name: "Cheveux court — highlight", price: { kind: "from", value: 7000 } },
          { name: "Cheveux mi-longs — ombré", price: { kind: "from", value: 5500 } },
          { name: "Cheveux mi-longs — balayage", price: { kind: "from", value: 6000 } },
          { name: "Cheveux mi-longs — highlight", price: { kind: "from", value: 8500 } },
          { name: "Cheveux longs — ombré", price: { kind: "from", value: 6000 } },
          { name: "Cheveux longs — balayage", price: { kind: "from", value: 7000 } },
          { name: "Cheveux longs — highlight", price: { kind: "from", value: 9500 } },
          { name: "Extensions", price: { kind: "quote" } },
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
        notes: ["Remplissage max 3 semaines."],
        items: [
          { name: "Manucure simple", price: { kind: "fixed", value: 900 } },
          { name: "Manucure semi-permanent", price: { kind: "fixed", value: 1400 } },
          { name: "Manucure gel", price: { kind: "fixed", value: 1600 } },
          { name: "Manucure extensions", price: { kind: "fixed", value: 1800 } },
          { name: "Supplément taille M", price: { kind: "supplement", value: 200 } },
          { name: "Supplément taille L", price: { kind: "supplement", value: 350 } },
          { name: "Supplément taille XL", price: { kind: "supplement", value: 500 } },
          { name: "Remplissage BeautyLey", price: { kind: "fixed", value: 1500 } },
          { name: "Remplissage extérieur", price: { kind: "fixed", value: 1600 } },
          { name: "Dépose", price: { kind: "fixed", value: 500 } },
          { name: "Babyboomer / French", price: { kind: "fixed", value: 250 } },
          { name: "Nail arts", price: { kind: "range", min: 50, max: 150 } },
          { name: "Ongle cassé (réparation)", price: { kind: "fixed", value: 150 } },
          { name: "Manucure homme", price: { kind: "fixed", value: 1500 } },
        ],
      },
      {
        id: "pedicure",
        title: "Pédicure",
        items: [
          { name: "Pédicure simple", price: { kind: "fixed", value: 900 } },
          { name: "Pédicure semi-permanent", price: { kind: "fixed", value: 1200 } },
          { name: "Pédicure gel", price: { kind: "fixed", value: 1400 } },
          { name: "Propreté talon", price: { kind: "fixed", value: 500 } },
          { name: "Spa pédicure", price: { kind: "fixed", value: 1200 } },
          { name: "Spa pédicure + semi-permanent", price: { kind: "fixed", value: 1800 } },
          { name: "Spa pédicure + gel", price: { kind: "fixed", value: 2000 } },
          { name: "Dépose", price: { kind: "fixed", value: 400 } },
          { name: "Extensions", price: { kind: "fixed", value: 150 } },
          { name: "Pédicure homme", price: { kind: "fixed", value: 1600 } },
          { name: "Spa pédicure homme", price: { kind: "fixed", value: 2200 } },
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
        notes: ["Remplissage maximum : 21 jours (3 semaines)."],
        items: [
          { name: "Cil à cil", price: { kind: "fixed", value: 1900 } },
          { name: "Mix volume", price: { kind: "fixed", value: 2100 } },
          { name: "Volume russe (2 & 3D)", price: { kind: "fixed", value: 2400 } },
          { name: "Volume russe (4 & 5D)", price: { kind: "fixed", value: 2600 } },
          { name: "Méga volume (6 & 7D)", price: { kind: "fixed", value: 2800 } },
          { name: "Extra méga volume (8D et plus)", price: { kind: "fixed", value: 3100 } },
          { name: "Dépose beauté", price: { kind: "fixed", value: 300 } },
          { name: "Dépose extérieure", price: { kind: "fixed", value: 500 } },
        ],
      },
      {
        id: "comblage",
        title: "Comblage",
        notes: [
          "Cils colorés, courbure L, effet mouillé ou effet Kim K : +400 EGP.",
        ],
        items: [
          { name: "Cil à cil", price: { kind: "fixed", value: 1700 } },
          { name: "Mix volume", price: { kind: "fixed", value: 1900 } },
          { name: "Volume russe (2 & 3D)", price: { kind: "fixed", value: 2200 } },
          { name: "Volume russe (4 & 5D)", price: { kind: "fixed", value: 2400 } },
          { name: "Méga volume (6 & 7D)", price: { kind: "fixed", value: 2600 } },
          { name: "Extra méga volume (8D et plus)", price: { kind: "fixed", value: 2900 } },
        ],
      },
      {
        id: "lash-brow",
        title: "Lash & brow",
        items: [
          { name: "Browlift", price: { kind: "fixed", value: 1500 } },
          { name: "Teinture", price: { kind: "fixed", value: 500 } },
          { name: "Rehaussement de cils", price: { kind: "fixed", value: 1500 } },
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
        notes: ["Après 2 mois — tarif complet."],
        items: [
          { name: "Microblading sourcils", price: { kind: "fixed", value: 9900 } },
          { name: "Candy lips", price: { kind: "fixed", value: 9000 } },
          { name: "Inter-cils", price: { kind: "fixed", value: 6000 } },
          { name: "Retouche dans les 2 mois", price: { kind: "fixed", value: 5000 } },
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
        items: [
          { name: "Épilation sourcils", price: { kind: "fixed", value: 400 } },
          { name: "Épilation lèvres", price: { kind: "fixed", value: 300 } },
          { name: "Épilation visage complet", price: { kind: "fixed", value: 750 } },
          { name: "Épilation aisselles", price: { kind: "fixed", value: 450 } },
          { name: "Épilation demi-bras", price: { kind: "fixed", value: 500 } },
          { name: "Épilation bras complets", price: { kind: "fixed", value: 700 } },
          { name: "Épilation jambes complètes", price: { kind: "fixed", value: 1000 } },
          { name: "Épilation demi-jambes", price: { kind: "fixed", value: 500 } },
          { name: "Épilation maillot simple", price: { kind: "fixed", value: 500 } },
          { name: "Épilation brésilienne", price: { kind: "fixed", value: 700 } },
          { name: "Épilation maillot intégral", price: { kind: "fixed", value: 1000 } },
          { name: "Épilation interfessier", price: { kind: "fixed", value: 300 } },
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
          { name: "Lifting colombien fessier", price: { kind: "fixed", value: 1400 } },
          { name: "Massage madérothérapie", price: { kind: "fixed", value: 1900 } },
          { name: "Massage relaxant — 30 min", price: { kind: "fixed", value: 1800 } },
          { name: "Massage relaxant — 1h", price: { kind: "fixed", value: 2200 } },
          { name: "Soins du visage au ultrason", price: { kind: "fixed", value: 2500 } },
          { name: "Séance hijama (thérapie par ventouses)", price: { kind: "fixed", value: 2000 } },
          { name: "Korean face massage", price: { kind: "fixed", value: 1500 } },
        ],
      },
    ],
  },
];

export function getCategory(id: string) {
  return categories.find((category) => category.id === id);
}
