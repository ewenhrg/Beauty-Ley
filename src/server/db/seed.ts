import type { Tables } from "./types";

/**
 * Initial catalogue, derived from the salon's published price list
 * (`src/data/services.ts`). Durations and the team are starting values meant to
 * be adjusted from the admin area — nothing here is hard-wired into the app.
 */

type Seed = { [K in keyof Tables]: Tables[K][] };

const CATEGORIES: Array<{
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}> = [
  {
    id: "cat-coiffure",
    name: "Coiffure",
    slug: "coiffure",
    description: "Coupe, brushing, coiffage et soins profonds.",
    image: "/images/work/hair-styling.jpg",
  },
  {
    id: "cat-coloration",
    name: "Coloration & balayage",
    slug: "coloration",
    description: "Couleur, racines, ombré, balayage et highlights.",
    image: "/images/work/hair-balayage.jpg",
  },
  {
    id: "cat-manucure",
    name: "Manucure",
    slug: "manucure",
    description: "Manucure, semi-permanent, gel, extensions et nail art.",
    image: "/images/work/nails-french-almond.jpg",
  },
  {
    id: "cat-pedicure",
    name: "Pédicure",
    slug: "pedicure",
    description: "Pédicure classique, spa et vernis longue tenue.",
    image: "/images/salon/pedicure-detail.jpg",
  },
  {
    id: "cat-cils",
    name: "Extensions de cils",
    slug: "cils",
    description: "Cil à cil, volume russe et méga volume.",
    image: "/images/work/portrait-volume.jpg",
  },
  {
    id: "cat-sourcils",
    name: "Regard & sourcils",
    slug: "sourcils",
    description: "Browlift, teinture et rehaussement de cils.",
    image: "/images/work/lashes-brow.jpg",
  },
  {
    id: "cat-pmu",
    name: "Maquillage permanent",
    slug: "maquillage-permanent",
    description: "Microblading, candy lips et inter-cils.",
    image: "/images/work/portrait-brows.jpg",
  },
  {
    id: "cat-epilation",
    name: "Épilation",
    slug: "epilation",
    description: "Visage, corps et maillot à la cire.",
    image: "/images/work/portrait-freckles.jpg",
  },
  {
    id: "cat-soins",
    name: "Soins & massages",
    slug: "soins",
    description: "Soins du visage, massages et rituels du corps.",
    image: "/images/salon/pedicure-lounge.jpg",
  },
];

type ServiceSeed = [
  id: string,
  name: string,
  duration: number,
  price: number,
  kind: "fixed" | "from",
  description: string,
];

const SERVICES: Record<string, ServiceSeed[]> = {
  "cat-coiffure": [
    ["svc-brushing-court", "Shampoing + brushing — cheveux courts", 45, 600, "from", "Shampoing sur mesure, soin express et brushing."],
    ["svc-brushing-mi-long", "Shampoing + brushing — mi-longs", 60, 750, "from", "Shampoing, soin et brushing volume ou lisse."],
    ["svc-brushing-long", "Shampoing + brushing — longs", 75, 900, "from", "Shampoing, soin et brushing longue tenue."],
    ["svc-brushing-extra", "Shampoing + brushing — extra longs", 90, 1100, "from", "Pour les longueurs au-delà du milieu du dos."],
    ["svc-coupe", "Coupe", 45, 500, "from", "Coupe personnalisée, shampoing inclus."],
    ["svc-frange", "Frange", 20, 300, "from", "Création ou rafraîchissement de frange."],
    ["svc-soin-cheveux", "Soin profond", 40, 300, "from", "Masque restructurant et modelage du cuir chevelu."],
    ["svc-coupe-homme", "Coupe homme", 45, 900, "from", "Coupe, contours et coiffage."],
    ["svc-barbe", "Barbe", 30, 500, "from", "Taille, contours et soin de la barbe."],
    ["svc-coupe-barbe", "Coupe homme + barbe", 75, 1200, "from", "Le duo coupe et barbe en une séance."],
    ["svc-tresses", "Tresses / rasta", 150, 1000, "from", "Tressage sur mesure, durée selon la longueur."],
  ],
  "cat-coloration": [
    ["svc-couleur-court", "Couleur + brushing — cheveux courts", 120, 2300, "from", "Coloration complète, shampoing et brushing."],
    ["svc-couleur-mi-long", "Couleur + brushing — mi-longs", 150, 3100, "from", "Coloration complète, shampoing et brushing."],
    ["svc-couleur-long", "Couleur + brushing — longs", 180, 4500, "from", "Coloration complète, shampoing et brushing."],
    ["svc-racine", "Retouche racines", 90, 2000, "from", "Reprise de racines et brushing."],
    ["svc-patine", "Patine / gloss", 60, 1800, "from", "Neutralisation et brillance."],
    ["svc-ombre", "Ombré hair", 180, 4500, "from", "Dégradé de longueurs, patine incluse."],
    ["svc-balayage", "Balayage", 210, 5000, "from", "Éclaircissement main levée, patine incluse."],
    ["svc-highlight", "Highlights", 240, 7000, "from", "Mèches complètes, patine incluse."],
  ],
  "cat-manucure": [
    ["svc-manucure-simple", "Manucure simple", 45, 900, "fixed", "Mise en forme, cuticules et vernis classique."],
    ["svc-manucure-semi", "Manucure semi-permanent", 60, 1400, "fixed", "Manucure complète et vernis semi-permanent."],
    ["svc-manucure-gel", "Manucure gel", 75, 1600, "fixed", "Renforcement gel et finition longue tenue."],
    ["svc-manucure-extensions", "Manucure extensions", 105, 1800, "fixed", "Pose d'extensions, forme et longueur au choix."],
    ["svc-remplissage", "Remplissage Beauty Ley", 75, 1500, "fixed", "Remplissage sur une pose réalisée au studio (max 3 semaines)."],
    ["svc-remplissage-ext", "Remplissage extérieur", 90, 1600, "fixed", "Remplissage sur une pose réalisée ailleurs."],
    ["svc-depose-ongles", "Dépose", 30, 500, "fixed", "Dépose douce et soin des ongles naturels."],
    ["svc-nail-art", "Nail art", 30, 150, "from", "Décoration à la demande, tarif selon la complexité."],
    ["svc-manucure-homme", "Manucure homme", 45, 1500, "fixed", "Mise en forme, cuticules et finition mate."],
  ],
  "cat-pedicure": [
    ["svc-pedicure-simple", "Pédicure simple", 45, 900, "fixed", "Mise en forme, cuticules et vernis classique."],
    ["svc-pedicure-semi", "Pédicure semi-permanent", 60, 1200, "fixed", "Pédicure complète et vernis semi-permanent."],
    ["svc-pedicure-gel", "Pédicure gel", 75, 1400, "fixed", "Renforcement gel et finition longue tenue."],
    ["svc-spa-pedicure", "Spa pédicure", 60, 1200, "fixed", "Bain, gommage, masque et modelage."],
    ["svc-spa-pedicure-semi", "Spa pédicure + semi-permanent", 90, 1800, "fixed", "Le rituel spa avec vernis semi-permanent."],
    ["svc-spa-pedicure-gel", "Spa pédicure + gel", 105, 2000, "fixed", "Le rituel spa avec finition gel."],
    ["svc-talons", "Propreté talons", 30, 500, "fixed", "Soin ciblé des talons et des callosités."],
    ["svc-pedicure-homme", "Pédicure homme", 60, 1600, "fixed", "Pédicure complète et soin des talons."],
  ],
  "cat-cils": [
    ["svc-cils-cil-a-cil", "Cil à cil — pose complète", 120, 1900, "fixed", "Une extension par cil naturel, effet mascara."],
    ["svc-cils-mix", "Mix volume — pose complète", 135, 2100, "fixed", "Cil à cil et volume mêlés, rendu naturel et dense."],
    ["svc-cils-russe", "Volume russe 2-3D — pose complète", 150, 2400, "fixed", "Bouquets légers, regard intense."],
    ["svc-cils-russe-45", "Volume russe 4-5D — pose complète", 165, 2600, "fixed", "Volume soutenu, effet fourni."],
    ["svc-cils-mega", "Méga volume 6-7D — pose complète", 180, 2800, "fixed", "Volume maximal, effet couture."],
    ["svc-cils-comblage-cil", "Comblage cil à cil", 90, 1700, "fixed", "Remplissage sous 21 jours."],
    ["svc-cils-comblage-russe", "Comblage volume russe", 105, 2200, "fixed", "Remplissage sous 21 jours."],
    ["svc-cils-depose", "Dépose de cils", 30, 300, "fixed", "Retrait des extensions et soin des cils naturels."],
  ],
  "cat-sourcils": [
    ["svc-browlift", "Browlift", 60, 1500, "fixed", "Restructuration et fixation des sourcils."],
    ["svc-rehaussement", "Rehaussement de cils", 60, 1500, "fixed", "Courbure durable des cils naturels."],
    ["svc-teinture", "Teinture cils ou sourcils", 30, 500, "fixed", "Coloration végétale, effet intensifié."],
    ["svc-epilation-sourcils", "Épilation des sourcils", 20, 400, "fixed", "Dessin et épilation à la cire ou à la pince."],
  ],
  "cat-pmu": [
    ["svc-microblading", "Microblading sourcils", 180, 9900, "fixed", "Dessin poil à poil, retouche à prévoir sous 2 mois."],
    ["svc-candy-lips", "Candy lips", 180, 9000, "fixed", "Maquillage permanent des lèvres, effet teinté."],
    ["svc-inter-cils", "Inter-cils", 120, 6000, "fixed", "Densification de la ligne de cils."],
    ["svc-pmu-retouche", "Retouche (sous 2 mois)", 90, 5000, "fixed", "Retouche de tout maquillage permanent réalisé au studio."],
  ],
  "cat-epilation": [
    ["svc-epil-levres", "Épilation lèvres", 15, 300, "fixed", "Épilation à la cire."],
    ["svc-epil-visage", "Épilation visage complet", 30, 750, "fixed", "Sourcils, lèvres, joues et menton."],
    ["svc-epil-aisselles", "Épilation aisselles", 15, 450, "fixed", "Épilation à la cire."],
    ["svc-epil-demi-bras", "Épilation demi-bras", 20, 500, "fixed", "Épilation à la cire."],
    ["svc-epil-bras", "Épilation bras complets", 30, 700, "fixed", "Épilation à la cire."],
    ["svc-epil-demi-jambes", "Épilation demi-jambes", 30, 500, "fixed", "Épilation à la cire."],
    ["svc-epil-jambes", "Épilation jambes complètes", 45, 1000, "fixed", "Épilation à la cire."],
    ["svc-epil-maillot", "Épilation maillot simple", 20, 500, "fixed", "Épilation à la cire."],
    ["svc-epil-bresilienne", "Épilation brésilienne", 30, 700, "fixed", "Épilation à la cire."],
    ["svc-epil-integral", "Épilation maillot intégral", 40, 1000, "fixed", "Épilation à la cire."],
  ],
  "cat-soins": [
    ["svc-soin-visage", "Soin du visage aux ultrasons", 60, 2500, "fixed", "Nettoyage profond, sérum et massage."],
    ["svc-korean-massage", "Korean face massage", 45, 1500, "fixed", "Massage liftant du visage et du cou."],
    ["svc-massage-30", "Massage relaxant — 30 min", 30, 1800, "fixed", "Détente du dos et des épaules."],
    ["svc-massage-60", "Massage relaxant — 1 h", 60, 2200, "fixed", "Massage complet du corps."],
    ["svc-maderotherapie", "Massage madérothérapie", 60, 1900, "fixed", "Modelage aux instruments de bois."],
    ["svc-lifting-colombien", "Lifting colombien fessier", 60, 1400, "fixed", "Modelage remodelant et drainant."],
    ["svc-hijama", "Séance hijama", 60, 2000, "fixed", "Thérapie par ventouses."],
  ],
};

const STAFF: Array<{
  id: string;
  first_name: string;
  role: string;
  bio: string;
  color: string;
  categories: string[];
}> = [
  {
    id: "staff-bebo",
    first_name: "Bebo",
    role: "Coiffeur",
    bio: "Coupes, brushing et colorations — l'un des deux coiffeurs du studio.",
    color: "#c17a5c",
    categories: ["cat-coiffure", "cat-coloration"],
  },
  {
    id: "staff-david",
    first_name: "David",
    role: "Coiffeur",
    bio: "Coupes, brushing et colorations — l'un des deux coiffeurs du studio.",
    color: "#8d6236",
    categories: ["cat-coiffure", "cat-coloration"],
  },
  {
    id: "staff-sarah",
    first_name: "Sarah",
    role: "Prothésiste ongulaire",
    bio: "Spécialiste du gel et des extensions, Sarah dessine des ongles sur mesure, du nude le plus discret au nail art le plus graphique.",
    color: "#c97d73",
    categories: ["cat-manucure", "cat-pedicure"],
  },
  {
    id: "staff-nour",
    first_name: "Nour",
    role: "Experte regard",
    bio: "Nour travaille le regard : extensions de cils, browlift et maquillage permanent, avec une obsession pour la symétrie.",
    color: "#c4a06a",
    categories: ["cat-cils", "cat-sourcils", "cat-pmu"],
  },
  {
    id: "staff-yasmine",
    first_name: "Yasmine",
    role: "Esthéticienne & massages",
    bio: "Yasmine accompagne les soins du visage, les massages et l'épilation, dans une approche douce et méthodique.",
    color: "#b08968",
    categories: ["cat-epilation", "cat-soins", "cat-pedicure"],
  },
];

/** Split shifts double as lunch breaks: the gap between two windows is closed. */
const SCHEDULES: Record<string, Array<[weekday: number, start: string, end: string]>> = {
  "staff-bebo": [
    [0, "11:00", "19:00"],
    [1, "10:00", "14:00"],
    [1, "15:00", "20:00"],
    [2, "10:00", "14:00"],
    [2, "15:00", "20:00"],
    [3, "10:00", "14:00"],
    [3, "15:00", "20:00"],
    [4, "10:00", "14:00"],
    [4, "15:00", "20:00"],
    [6, "10:00", "20:00"],
  ],
  "staff-david": [
    [0, "11:00", "19:00"],
    [1, "10:00", "14:00"],
    [1, "15:00", "20:00"],
    [2, "10:00", "14:00"],
    [2, "15:00", "20:00"],
    [3, "10:00", "14:00"],
    [3, "15:00", "20:00"],
    [4, "10:00", "14:00"],
    [4, "15:00", "20:00"],
    [6, "10:00", "20:00"],
  ],
  "staff-sarah": [
    [0, "10:00", "18:00"],
    [1, "10:00", "18:00"],
    [2, "12:00", "20:00"],
    [3, "10:00", "14:00"],
    [3, "15:00", "20:00"],
    [6, "10:00", "20:00"],
  ],
  "staff-nour": [
    [0, "10:00", "18:00"],
    [2, "10:00", "18:00"],
    [3, "10:00", "18:00"],
    [4, "11:00", "20:00"],
    [6, "10:00", "18:00"],
  ],
  "staff-yasmine": [
    [1, "10:00", "14:00"],
    [1, "15:00", "19:00"],
    [2, "10:00", "19:00"],
    [3, "10:00", "19:00"],
    [4, "10:00", "14:00"],
    [4, "15:00", "19:00"],
    [6, "11:00", "19:00"],
  ],
};

function toMinutes(label: string) {
  const [hours, minutes] = label.split(":").map(Number);
  return hours * 60 + minutes;
}

export function buildSeed(now = new Date()): Seed {
  const timestamp = now.toISOString();

  const service_categories = CATEGORIES.map((category, index) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    sort_order: index,
    active: true,
  }));

  const services = Object.entries(SERVICES).flatMap(([categoryId, list]) =>
    list.map(([id, name, duration, price, priceKind, description], index) => ({
      id,
      category_id: categoryId,
      name,
      description,
      duration_min: duration,
      buffer_min: 10,
      price,
      price_kind: priceKind,
      image: null,
      sort_order: index,
      active: true,
    })),
  );

  const staff = STAFF.map((member, index) => ({
    id: member.id,
    first_name: member.first_name,
    last_name: null,
    role: member.role,
    bio: member.bio,
    photo: null,
    color: member.color,
    sort_order: index,
    active: true,
  }));

  const staff_services = STAFF.flatMap((member) =>
    services
      .filter((service) => member.categories.includes(service.category_id))
      .map((service) => ({
        id: `link-${member.id}-${service.id}`,
        staff_id: member.id,
        service_id: service.id,
      })),
  );

  const staff_schedules = Object.entries(SCHEDULES).flatMap(([staffId, windows]) =>
    windows.map(([weekday, start, end], index) => ({
      id: `sched-${staffId}-${weekday}-${index}`,
      staff_id: staffId,
      weekday,
      start_min: toMinutes(start),
      end_min: toMinutes(end),
    })),
  );

  // Friday is the salon's weekly closing day.
  const business_hours = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    id: `hours-${weekday}`,
    weekday,
    open_min: toMinutes("10:00"),
    close_min: toMinutes("20:00"),
    closed: weekday === 5,
  }));

  const settings = [
    {
      id: "settings",
      slot_granularity_min: 15,
      min_notice_min: 120,
      max_advance_days: 60,
      cancellation_window_hours: 24,
      auto_confirm: true,
      payment_mode: "onsite" as const,
      deposit_percent: 30,
      booking_terms:
        "Merci d'arriver 5 minutes avant votre rendez-vous. L'annulation est gratuite jusqu'à 24 h avant le créneau réservé.",
      salon_email: null,
      salon_phone: null,
      updated_at: timestamp,
    },
  ];

  return {
    service_categories,
    services,
    staff,
    staff_services,
    staff_schedules,
    staff_time_off: [],
    business_hours,
    business_closures: [],
    customers: [],
    appointments: [],
    notifications: [],
    settings,
    admin_users: [],
  };
}
