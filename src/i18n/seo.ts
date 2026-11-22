import type { Locale } from "./config";

/**
 * Search-facing copy per language: page titles, meta descriptions, the home
 * page's local intro and FAQ. Written around what people actually type in each
 * language ("salon de beauté Hurghada", "салон красоты Хургада", …).
 */
export type PageId = "home" | "services" | "prices" | "gallery" | "contact" | "book";

type SeoCopy = {
  pages: Record<PageId, { title: string; description: string }>;
  /** Small line above the big "Beauty Ley" in the home hero; part of the H1. */
  heroKicker: string;
  intro: { eyebrow: string; title: string; paragraphs: string[] };
  info: { address: string; hours: string; phone: string; directions: string };
  faqTitle: string;
  faq: { q: string; a: string }[];
  reviews: {
    eyebrow: string;
    title: string;
    basedOn: string;
    cta: string;
  };
};

const en: SeoCopy = {
  pages: {
    home: {
      title: "Beauty Salon in Hurghada | Nails, Lashes & Hair – Beauty Ley",
      description:
        "Beauty Ley is a beauty salon in Hurghada: manicure, pedicure, gel nails, eyelash extensions, brows, hair, permanent makeup, waxing and body care. Book online or on WhatsApp.",
    },
    services: {
      title: "Beauty Services in Hurghada – Nails, Lashes, Hair, Waxing",
      description:
        "All beauty treatments at Beauty Ley, Hurghada: manicure, pedicure, nail art, lash extensions, brow lamination, hair colour and brushing, permanent makeup, waxing and massages.",
    },
    prices: {
      title: "Beauty Salon Prices in Hurghada (EGP)",
      description:
        "Full price list of Beauty Ley, beauty salon in Hurghada: nails, pedicure, lashes, hair, permanent makeup, waxing and body care. Prices in Egyptian pounds.",
    },
    gallery: {
      title: "Gallery – Nails, Lashes & Hair in Hurghada",
      description:
        "Photos of the Beauty Ley salon in Hurghada and our work: nail art, gel nails, lash extensions, brows, hair colour and styling.",
    },
    contact: {
      title: "Contact & Directions – Beauty Salon Hurghada",
      description:
        "Beauty Ley, The View, Hurghada 1. Open every day from 1 pm to 10 pm. WhatsApp +20 128 134 3424, Google Maps directions and social media.",
    },
    book: {
      title: "Book a Beauty Appointment in Hurghada",
      description:
        "Book your manicure, pedicure, lashes or hair appointment at Beauty Ley in Hurghada online in a few clicks, or on WhatsApp.",
    },
  },
  heroKicker: "Beauty salon in Hurghada",
  intro: {
    eyebrow: "Beauty salon · Hurghada",
    title: "Your beauty salon in Hurghada",
    paragraphs: [
      "Beauty Ley is a beauty and wellness studio in Hurghada, on the Red Sea. Our team takes care of your nails, lashes, brows, hair and skin in a calm, modern salon.",
      "Manicure and pedicure, gel and nail art, eyelash extensions, brow lamination, haircuts, colour and brushing, permanent makeup, waxing and body treatments: everything is done by specialists, with clear prices in EGP.",
      "Living in Hurghada or on holiday on the Red Sea? Book online in a few clicks or message us on WhatsApp.",
    ],
  },
  info: { address: "Address", hours: "Opening hours", phone: "Phone / WhatsApp", directions: "Get directions" },
  faqTitle: "Frequently asked questions",
  faq: [
    {
      q: "Where is Beauty Ley in Hurghada?",
      a: "Beauty Ley is at The View, Hurghada 1, Red Sea Governorate 84511. You will find directions on Google Maps from our contact page.",
    },
    {
      q: "What are your opening hours?",
      a: "We are open every day from 1 pm to 10 pm (Thursday from 1:30 pm).",
    },
    {
      q: "How do I book an appointment?",
      a: "Choose your service on our booking page and pick a time slot, or send us a message on WhatsApp at +20 128 134 3424.",
    },
    {
      q: "Which beauty services do you offer?",
      a: "Manicure, pedicure, gel nails and nail art, eyelash extensions, brows, haircuts, colour and brushing, permanent makeup, waxing, facials and massages. Men's haircuts and beard trims too.",
    },
    {
      q: "How much does it cost?",
      a: "All our prices are listed in Egyptian pounds (EGP) on the Prices page.",
    },
  ],
  reviews: {
    eyebrow: "Google reviews",
    title: "What our clients say",
    basedOn: "Based on {count} Google reviews",
    cta: "See all reviews on Google",
  },
};

const fr: SeoCopy = {
  pages: {
    home: {
      title: "Salon de beauté à Hurghada | Ongles, cils, coiffure – Beauty Ley",
      description:
        "Beauty Ley, salon de beauté à Hurghada : manucure, pédicure, ongles gel, extensions de cils, sourcils, coiffure, maquillage permanent, épilation et soins du corps. Réservation en ligne ou WhatsApp.",
    },
    services: {
      title: "Prestations beauté à Hurghada – ongles, cils, coiffure, épilation",
      description:
        "Toutes les prestations de Beauty Ley à Hurghada : manucure, pédicure, nail art, extensions de cils, rehaussement de sourcils, couleur et brushing, maquillage permanent, épilation et massages.",
    },
    prices: {
      title: "Tarifs salon de beauté Hurghada (EGP)",
      description:
        "Tous les tarifs de Beauty Ley, salon de beauté à Hurghada : ongles, pédicure, cils, cheveux, maquillage permanent, épilation et soins. Prix en livres égyptiennes.",
    },
    gallery: {
      title: "Galerie – ongles, cils et coiffure à Hurghada",
      description:
        "Photos du salon Beauty Ley à Hurghada et de nos réalisations : nail art, ongles gel, extensions de cils, sourcils, couleur et coiffage.",
    },
    contact: {
      title: "Contact et accès – salon de beauté Hurghada",
      description:
        "Beauty Ley, The View, Hurghada 1. Ouvert tous les jours de 13 h à 22 h. WhatsApp +20 128 134 3424, itinéraire Google Maps et réseaux sociaux.",
    },
    book: {
      title: "Prendre rendez-vous beauté à Hurghada",
      description:
        "Réservez votre manucure, pédicure, pose de cils ou coiffure chez Beauty Ley à Hurghada en ligne en quelques clics, ou sur WhatsApp.",
    },
  },
  heroKicker: "Salon de beauté à Hurghada",
  intro: {
    eyebrow: "Salon de beauté · Hurghada",
    title: "Votre salon de beauté à Hurghada",
    paragraphs: [
      "Beauty Ley est un salon de beauté et de bien-être à Hurghada, au bord de la mer Rouge. Notre équipe prend soin de vos ongles, cils, sourcils, cheveux et de votre peau dans un salon calme et moderne.",
      "Manucure et pédicure, ongles gel et nail art, extensions de cils, rehaussement de sourcils, coupe, couleur et brushing, maquillage permanent, épilation et soins du corps : chaque prestation est réalisée par une spécialiste, avec des tarifs clairs en EGP.",
      "Vous vivez à Hurghada ou vous êtes en vacances sur la mer Rouge ? Réservez en ligne en quelques clics ou écrivez-nous sur WhatsApp.",
    ],
  },
  info: { address: "Adresse", hours: "Horaires", phone: "Téléphone / WhatsApp", directions: "Itinéraire" },
  faqTitle: "Questions fréquentes",
  faq: [
    {
      q: "Où se trouve Beauty Ley à Hurghada ?",
      a: "Beauty Ley se trouve à The View, Hurghada 1, Red Sea Governorate 84511. L'itinéraire Google Maps est sur notre page contact.",
    },
    {
      q: "Quels sont vos horaires ?",
      a: "Nous sommes ouverts tous les jours de 13 h à 22 h (le jeudi à partir de 13 h 30).",
    },
    {
      q: "Comment prendre rendez-vous ?",
      a: "Choisissez votre prestation sur la page de réservation puis un créneau, ou envoyez-nous un message WhatsApp au +20 128 134 3424.",
    },
    {
      q: "Quelles prestations proposez-vous ?",
      a: "Manucure, pédicure, ongles gel et nail art, extensions de cils, sourcils, coupe, couleur et brushing, maquillage permanent, épilation, soins du visage et massages. Coupe homme et barbe également.",
    },
    {
      q: "Quels sont les prix ?",
      a: "Tous nos tarifs sont affichés en livres égyptiennes (EGP) sur la page Tarifs.",
    },
  ],
  reviews: {
    eyebrow: "Avis Google",
    title: "Ce que disent nos clientes",
    basedOn: "Sur la base de {count} avis Google",
    cta: "Voir tous les avis sur Google",
  },
};

const de: SeoCopy = {
  pages: {
    home: {
      title: "Beautysalon & Kosmetikstudio in Hurghada | Nägel, Wimpern – Beauty Ley",
      description:
        "Beauty Ley, Beautysalon in Hurghada: Maniküre, Pediküre, Gelnägel, Wimpernverlängerung, Augenbrauen, Friseur, Permanent Make-up, Waxing und Körperbehandlungen. Online oder per WhatsApp buchen.",
    },
    services: {
      title: "Beauty-Behandlungen in Hurghada – Nägel, Wimpern, Haare, Waxing",
      description:
        "Alle Leistungen von Beauty Ley in Hurghada: Maniküre, Pediküre, Nail Art, Wimpernverlängerung, Brow Lifting, Haarfarbe und Föhnen, Permanent Make-up, Waxing und Massagen.",
    },
    prices: {
      title: "Preise Beautysalon Hurghada (EGP)",
      description:
        "Preisliste von Beauty Ley, Beautysalon in Hurghada: Nägel, Pediküre, Wimpern, Haare, Permanent Make-up, Waxing und Pflege. Preise in ägyptischen Pfund.",
    },
    gallery: {
      title: "Galerie – Nägel, Wimpern & Haare in Hurghada",
      description:
        "Fotos des Salons Beauty Ley in Hurghada und unserer Arbeiten: Nail Art, Gelnägel, Wimpernverlängerung, Augenbrauen, Haarfarbe und Styling.",
    },
    contact: {
      title: "Kontakt & Anfahrt – Beautysalon Hurghada",
      description:
        "Beauty Ley, The View, Hurghada 1. Täglich von 13 bis 22 Uhr geöffnet. WhatsApp +20 128 134 3424, Google-Maps-Route und soziale Netzwerke.",
    },
    book: {
      title: "Beauty-Termin in Hurghada buchen",
      description:
        "Buchen Sie Maniküre, Pediküre, Wimpern oder Friseur bei Beauty Ley in Hurghada in wenigen Klicks online oder per WhatsApp.",
    },
  },
  heroKicker: "Beautysalon in Hurghada",
  intro: {
    eyebrow: "Beautysalon · Hurghada",
    title: "Ihr Beautysalon in Hurghada",
    paragraphs: [
      "Beauty Ley ist ein Beauty- und Wellnessstudio in Hurghada am Roten Meer. Unser Team kümmert sich in einem ruhigen, modernen Salon um Ihre Nägel, Wimpern, Augenbrauen, Haare und Haut.",
      "Maniküre und Pediküre, Gelnägel und Nail Art, Wimpernverlängerung, Brow Lifting, Haarschnitt, Farbe und Föhnen, Permanent Make-up, Waxing und Körperbehandlungen – alles von Spezialistinnen, mit klaren Preisen in EGP.",
      "Sie wohnen in Hurghada oder machen Urlaub am Roten Meer? Buchen Sie online in wenigen Klicks oder schreiben Sie uns auf WhatsApp.",
    ],
  },
  info: { address: "Adresse", hours: "Öffnungszeiten", phone: "Telefon / WhatsApp", directions: "Route planen" },
  faqTitle: "Häufige Fragen",
  faq: [
    {
      q: "Wo befindet sich Beauty Ley in Hurghada?",
      a: "Beauty Ley befindet sich in The View, Hurghada 1, Red Sea Governorate 84511. Die Google-Maps-Route finden Sie auf unserer Kontaktseite.",
    },
    {
      q: "Wann haben Sie geöffnet?",
      a: "Wir haben täglich von 13 bis 22 Uhr geöffnet (donnerstags ab 13:30 Uhr).",
    },
    {
      q: "Wie buche ich einen Termin?",
      a: "Wählen Sie auf der Buchungsseite Ihre Behandlung und eine Uhrzeit, oder schreiben Sie uns auf WhatsApp: +20 128 134 3424.",
    },
    {
      q: "Welche Behandlungen bieten Sie an?",
      a: "Maniküre, Pediküre, Gelnägel und Nail Art, Wimpernverlängerung, Augenbrauen, Haarschnitt, Farbe und Föhnen, Permanent Make-up, Waxing, Gesichtsbehandlungen und Massagen. Auch Herrenhaarschnitt und Bart.",
    },
    {
      q: "Was kostet es?",
      a: "Alle Preise stehen in ägyptischen Pfund (EGP) auf der Preisseite.",
    },
  ],
  reviews: {
    eyebrow: "Google-Bewertungen",
    title: "Das sagen unsere Kundinnen",
    basedOn: "Basierend auf {count} Google-Bewertungen",
    cta: "Alle Bewertungen auf Google ansehen",
  },
};

const it: SeoCopy = {
  pages: {
    home: {
      title: "Centro estetico a Hurghada | Unghie, ciglia, capelli – Beauty Ley",
      description:
        "Beauty Ley, salone di bellezza a Hurghada: manicure, pedicure, unghie gel, extension ciglia, sopracciglia, parrucchiere, trucco permanente, ceretta e trattamenti corpo. Prenota online o su WhatsApp.",
    },
    services: {
      title: "Trattamenti di bellezza a Hurghada – unghie, ciglia, capelli",
      description:
        "Tutti i servizi di Beauty Ley a Hurghada: manicure, pedicure, nail art, extension ciglia, laminazione sopracciglia, colore e piega, trucco permanente, ceretta e massaggi.",
    },
    prices: {
      title: "Prezzi centro estetico Hurghada (EGP)",
      description:
        "Listino prezzi di Beauty Ley, salone di bellezza a Hurghada: unghie, pedicure, ciglia, capelli, trucco permanente, ceretta e trattamenti. Prezzi in lire egiziane.",
    },
    gallery: {
      title: "Galleria – unghie, ciglia e capelli a Hurghada",
      description:
        "Foto del salone Beauty Ley a Hurghada e dei nostri lavori: nail art, unghie gel, extension ciglia, sopracciglia, colore e styling.",
    },
    contact: {
      title: "Contatti e indicazioni – centro estetico Hurghada",
      description:
        "Beauty Ley, The View, Hurghada 1. Aperto tutti i giorni dalle 13 alle 22. WhatsApp +20 128 134 3424, indicazioni Google Maps e social.",
    },
    book: {
      title: "Prenota un appuntamento di bellezza a Hurghada",
      description:
        "Prenota manicure, pedicure, ciglia o parrucchiere da Beauty Ley a Hurghada online in pochi clic, oppure su WhatsApp.",
    },
  },
  heroKicker: "Centro estetico a Hurghada",
  intro: {
    eyebrow: "Centro estetico · Hurghada",
    title: "Il tuo salone di bellezza a Hurghada",
    paragraphs: [
      "Beauty Ley è uno studio di bellezza e benessere a Hurghada, sul Mar Rosso. Il nostro team si prende cura di unghie, ciglia, sopracciglia, capelli e pelle in un salone tranquillo e moderno.",
      "Manicure e pedicure, unghie gel e nail art, extension ciglia, laminazione sopracciglia, taglio, colore e piega, trucco permanente, ceretta e trattamenti corpo: tutto eseguito da specialiste, con prezzi chiari in EGP.",
      "Vivi a Hurghada o sei in vacanza sul Mar Rosso? Prenota online in pochi clic o scrivici su WhatsApp.",
    ],
  },
  info: { address: "Indirizzo", hours: "Orari", phone: "Telefono / WhatsApp", directions: "Indicazioni" },
  faqTitle: "Domande frequenti",
  faq: [
    {
      q: "Dove si trova Beauty Ley a Hurghada?",
      a: "Beauty Ley si trova a The View, Hurghada 1, Red Sea Governorate 84511. Le indicazioni Google Maps sono nella pagina contatti.",
    },
    { q: "Quali sono gli orari?", a: "Siamo aperti tutti i giorni dalle 13 alle 22 (il giovedì dalle 13:30)." },
    {
      q: "Come prenoto un appuntamento?",
      a: "Scegli il trattamento nella pagina di prenotazione e un orario, oppure scrivici su WhatsApp al +20 128 134 3424.",
    },
    {
      q: "Quali trattamenti offrite?",
      a: "Manicure, pedicure, unghie gel e nail art, extension ciglia, sopracciglia, taglio, colore e piega, trucco permanente, ceretta, trattamenti viso e massaggi. Anche taglio uomo e barba.",
    },
    { q: "Quanto costa?", a: "Tutti i prezzi sono indicati in lire egiziane (EGP) nella pagina Prezzi." },
  ],
  reviews: {
    eyebrow: "Recensioni Google",
    title: "Cosa dicono le nostre clienti",
    basedOn: "Basato su {count} recensioni Google",
    cta: "Vedi tutte le recensioni su Google",
  },
};

const es: SeoCopy = {
  pages: {
    home: {
      title: "Salón de belleza en Hurghada | Uñas, pestañas, pelo – Beauty Ley",
      description:
        "Beauty Ley, salón de belleza en Hurghada: manicura, pedicura, uñas de gel, extensiones de pestañas, cejas, peluquería, maquillaje permanente, depilación y tratamientos corporales. Reserva online o por WhatsApp.",
    },
    services: {
      title: "Servicios de belleza en Hurghada – uñas, pestañas, pelo, depilación",
      description:
        "Todos los servicios de Beauty Ley en Hurghada: manicura, pedicura, nail art, extensiones de pestañas, laminado de cejas, color y brushing, maquillaje permanente, depilación y masajes.",
    },
    prices: {
      title: "Precios salón de belleza Hurghada (EGP)",
      description:
        "Lista de precios de Beauty Ley, salón de belleza en Hurghada: uñas, pedicura, pestañas, pelo, maquillaje permanente, depilación y tratamientos. Precios en libras egipcias.",
    },
    gallery: {
      title: "Galería – uñas, pestañas y pelo en Hurghada",
      description:
        "Fotos del salón Beauty Ley en Hurghada y de nuestros trabajos: nail art, uñas de gel, extensiones de pestañas, cejas, color y peinados.",
    },
    contact: {
      title: "Contacto y cómo llegar – salón de belleza Hurghada",
      description:
        "Beauty Ley, The View, Hurghada 1. Abierto todos los días de 13:00 a 22:00. WhatsApp +20 128 134 3424, ruta en Google Maps y redes sociales.",
    },
    book: {
      title: "Reserva tu cita de belleza en Hurghada",
      description:
        "Reserva manicura, pedicura, pestañas o peluquería en Beauty Ley, Hurghada, online en pocos clics o por WhatsApp.",
    },
  },
  heroKicker: "Salón de belleza en Hurghada",
  intro: {
    eyebrow: "Salón de belleza · Hurghada",
    title: "Tu salón de belleza en Hurghada",
    paragraphs: [
      "Beauty Ley es un estudio de belleza y bienestar en Hurghada, junto al Mar Rojo. Nuestro equipo cuida tus uñas, pestañas, cejas, pelo y piel en un salón tranquilo y moderno.",
      "Manicura y pedicura, uñas de gel y nail art, extensiones de pestañas, laminado de cejas, corte, color y brushing, maquillaje permanente, depilación y tratamientos corporales: todo lo realizan especialistas, con precios claros en EGP.",
      "¿Vives en Hurghada o estás de vacaciones en el Mar Rojo? Reserva online en pocos clics o escríbenos por WhatsApp.",
    ],
  },
  info: { address: "Dirección", hours: "Horario", phone: "Teléfono / WhatsApp", directions: "Cómo llegar" },
  faqTitle: "Preguntas frecuentes",
  faq: [
    {
      q: "¿Dónde está Beauty Ley en Hurghada?",
      a: "Beauty Ley está en The View, Hurghada 1, Red Sea Governorate 84511. La ruta de Google Maps está en nuestra página de contacto.",
    },
    { q: "¿Cuál es el horario?", a: "Abrimos todos los días de 13:00 a 22:00 (el jueves desde las 13:30)." },
    {
      q: "¿Cómo reservo una cita?",
      a: "Elige tu servicio en la página de reservas y un horario, o escríbenos por WhatsApp al +20 128 134 3424.",
    },
    {
      q: "¿Qué servicios ofrecéis?",
      a: "Manicura, pedicura, uñas de gel y nail art, extensiones de pestañas, cejas, corte, color y brushing, maquillaje permanente, depilación, faciales y masajes. También corte de hombre y barba.",
    },
    { q: "¿Cuánto cuesta?", a: "Todos los precios están en libras egipcias (EGP) en la página de Precios." },
  ],
  reviews: {
    eyebrow: "Reseñas de Google",
    title: "Lo que dicen nuestras clientas",
    basedOn: "Basado en {count} reseñas de Google",
    cta: "Ver todas las reseñas en Google",
  },
};

const ru: SeoCopy = {
  pages: {
    home: {
      title: "Салон красоты в Хургаде | Маникюр, ресницы, волосы – Beauty Ley",
      description:
        "Beauty Ley — салон красоты в Хургаде: маникюр, педикюр, гель-лак, наращивание ресниц, брови, парикмахер, перманентный макияж, депиляция и уход за телом. Запись онлайн или в WhatsApp.",
    },
    services: {
      title: "Услуги салона красоты в Хургаде – ногти, ресницы, волосы",
      description:
        "Все услуги Beauty Ley в Хургаде: маникюр, педикюр, дизайн ногтей, наращивание ресниц, ламинирование бровей, окрашивание и укладка, перманентный макияж, депиляция и массаж.",
    },
    prices: {
      title: "Цены салона красоты в Хургаде (EGP)",
      description:
        "Прайс-лист Beauty Ley, салона красоты в Хургаде: ногти, педикюр, ресницы, волосы, перманентный макияж, депиляция и уход. Цены в египетских фунтах.",
    },
    gallery: {
      title: "Галерея – маникюр, ресницы и волосы в Хургаде",
      description:
        "Фото салона Beauty Ley в Хургаде и наших работ: дизайн ногтей, гель-лак, наращивание ресниц, брови, окрашивание и укладки.",
    },
    contact: {
      title: "Контакты и как добраться – салон красоты Хургада",
      description:
        "Beauty Ley, The View, Hurghada 1. Открыто ежедневно с 13:00 до 22:00. WhatsApp +20 128 134 3424, маршрут в Google Maps и соцсети.",
    },
    book: {
      title: "Записаться в салон красоты в Хургаде",
      description:
        "Запишитесь на маникюр, педикюр, ресницы или стрижку в Beauty Ley в Хургаде онлайн за пару кликов или через WhatsApp.",
    },
  },
  heroKicker: "Салон красоты в Хургаде",
  intro: {
    eyebrow: "Салон красоты · Хургада",
    title: "Ваш салон красоты в Хургаде",
    paragraphs: [
      "Beauty Ley — студия красоты и велнеса в Хургаде на Красном море. Наша команда позаботится о ваших ногтях, ресницах, бровях, волосах и коже в спокойном современном салоне.",
      "Маникюр и педикюр, гель-лак и дизайн ногтей, наращивание ресниц, ламинирование бровей, стрижка, окрашивание и укладка, перманентный макияж, депиляция и уход за телом — всё выполняют специалисты, с понятными ценами в EGP.",
      "Живёте в Хургаде или отдыхаете на Красном море? Запишитесь онлайн за пару кликов или напишите нам в WhatsApp.",
    ],
  },
  info: { address: "Адрес", hours: "Часы работы", phone: "Телефон / WhatsApp", directions: "Проложить маршрут" },
  faqTitle: "Частые вопросы",
  faq: [
    {
      q: "Где находится Beauty Ley в Хургаде?",
      a: "Beauty Ley находится по адресу The View, Hurghada 1, Red Sea Governorate 84511. Маршрут в Google Maps — на странице контактов.",
    },
    { q: "Какие часы работы?", a: "Мы работаем ежедневно с 13:00 до 22:00 (в четверг с 13:30)." },
    {
      q: "Как записаться?",
      a: "Выберите услугу и время на странице записи или напишите нам в WhatsApp: +20 128 134 3424.",
    },
    {
      q: "Какие услуги вы предлагаете?",
      a: "Маникюр, педикюр, гель-лак и дизайн ногтей, наращивание ресниц, брови, стрижка, окрашивание и укладка, перманентный макияж, депиляция, уход за лицом и массаж. Также мужская стрижка и борода.",
    },
    { q: "Сколько это стоит?", a: "Все цены указаны в египетских фунтах (EGP) на странице «Цены»." },
  ],
  reviews: {
    eyebrow: "Отзывы Google",
    title: "Что говорят наши клиентки",
    basedOn: "На основе {count} отзывов в Google",
    cta: "Все отзывы в Google",
  },
};

const zh: SeoCopy = {
  pages: {
    home: {
      title: "赫尔格达美容院 | 美甲、美睫、美发 – Beauty Ley",
      description:
        "Beauty Ley 是位于赫尔格达的美容院：手部护理、足部护理、光疗甲、嫁接睫毛、眉毛、美发、半永久妆、脱毛和身体护理。可在线或通过 WhatsApp 预约。",
    },
    services: {
      title: "赫尔格达美容服务 – 美甲、美睫、美发、脱毛",
      description:
        "Beauty Ley 赫尔格达的全部服务：美甲、足部护理、美甲彩绘、嫁接睫毛、眉毛定型、染发和吹发、半永久妆、脱毛和按摩。",
    },
    prices: {
      title: "赫尔格达美容院价格（埃及镑）",
      description: "Beauty Ley 赫尔格达美容院价目表：美甲、足部护理、睫毛、头发、半永久妆、脱毛和护理。价格以埃及镑计。",
    },
    gallery: {
      title: "作品集 – 赫尔格达美甲、美睫与美发",
      description: "Beauty Ley 赫尔格达店内环境和作品照片：美甲彩绘、光疗甲、嫁接睫毛、眉毛、染发和造型。",
    },
    contact: {
      title: "联系方式与路线 – 赫尔格达美容院",
      description: "Beauty Ley，The View, Hurghada 1。每天 13:00–22:00 营业。WhatsApp +20 128 134 3424，Google 地图导航和社交媒体。",
    },
    book: {
      title: "预约赫尔格达美容服务",
      description: "在线几步即可预约 Beauty Ley 赫尔格达的美甲、足部护理、睫毛或美发服务，也可通过 WhatsApp 预约。",
    },
  },
  heroKicker: "赫尔格达美容院",
  intro: {
    eyebrow: "美容院 · 赫尔格达",
    title: "您在赫尔格达的美容院",
    paragraphs: [
      "Beauty Ley 是位于红海之滨赫尔格达的美容与健康工作室。我们的团队在安静、现代的店内为您打理指甲、睫毛、眉毛、头发和肌肤。",
      "手部与足部护理、光疗甲与美甲彩绘、嫁接睫毛、眉毛定型、剪发、染发与吹发、半永久妆、脱毛和身体护理——均由专业技师完成，价格以埃及镑清晰标示。",
      "住在赫尔格达或在红海度假？在线几步即可预约，或通过 WhatsApp 联系我们。",
    ],
  },
  info: { address: "地址", hours: "营业时间", phone: "电话 / WhatsApp", directions: "导航" },
  faqTitle: "常见问题",
  faq: [
    {
      q: "Beauty Ley 在赫尔格达的什么位置？",
      a: "Beauty Ley 位于 The View, Hurghada 1, Red Sea Governorate 84511。联系页面上有 Google 地图导航。",
    },
    { q: "营业时间是什么？", a: "每天 13:00 至 22:00 营业（周四 13:30 起）。" },
    { q: "如何预约？", a: "在预约页面选择服务和时间，或通过 WhatsApp +20 128 134 3424 联系我们。" },
    {
      q: "提供哪些服务？",
      a: "美甲、足部护理、光疗甲和美甲彩绘、嫁接睫毛、眉毛、剪发、染发和吹发、半永久妆、脱毛、面部护理和按摩，也提供男士理发和修胡。",
    },
    { q: "价格如何？", a: "所有价格均以埃及镑（EGP）列在价格页面。" },
  ],
  reviews: {
    eyebrow: "Google 评价",
    title: "顾客评价",
    basedOn: "基于 {count} 条 Google 评价",
    cta: "在 Google 上查看全部评价",
  },
};

const copies: Record<Locale, SeoCopy> = { en, fr, de, it, es, ru, zh };

export function seoCopy(locale: Locale): SeoCopy {
  return copies[locale];
}
