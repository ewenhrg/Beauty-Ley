import { salon } from "@/data/salon";
import { BookingButton } from "./BookingButton";
import { InstagramIcon, FacebookIcon, SnapchatIcon, WhatsAppIcon } from "./SocialIcons";
import { Reveal } from "./Reveal";
import { getT } from "@/i18n/server";

export async function ContactSection() {
  const t = await getT();

  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="relative z-10">
          <Reveal className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
            {t("contact.eyebrow")}
          </Reveal>
          <Reveal as="h2" delay={80} className="font-display mt-4 text-4xl text-ink sm:text-5xl">
            {t("contact.title")}
          </Reveal>
          <Reveal delay={140} className="gold-rule mt-6" />
          <dl className="mt-10 space-y-8">
            <Reveal as="div" delay={200}>
              <dt className="text-[11px] tracking-[0.2em] text-rose uppercase">{t("contact.city")}</dt>
              <dd className="mt-2 text-lg">{salon.city}</dd>
            </Reveal>
            <Reveal as="div" delay={230}>
              <dt className="text-[11px] tracking-[0.2em] text-rose uppercase">{t("contact.map")}</dt>
              <dd className="mt-2">
                <a
                  href={salon.location.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-link text-sm text-terracotta underline-offset-4 hover:text-rose"
                >
                  {t("contact.openMaps")}
                </a>
              </dd>
            </Reveal>
            <Reveal as="div" delay={260}>
              <dt className="text-[11px] tracking-[0.2em] text-rose uppercase">{t("contact.booking")}</dt>
              <dd className="mt-2 max-w-sm text-ink-soft">{t("contact.bookingOnline")}</dd>
            </Reveal>
            <Reveal as="div" delay={320}>
              <dt className="text-[11px] tracking-[0.2em] text-rose uppercase">{t("contact.networks")}</dt>
              <dd className="mt-4 flex gap-4">
                <a
                  href={salon.social.whatsapp.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="text-terracotta transition-transform duration-300 hover:-translate-y-0.5 hover:text-rose"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </a>
                <a
                  href={salon.social.instagram.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="text-terracotta transition-transform duration-300 hover:-translate-y-0.5 hover:text-rose"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href={salon.social.facebook.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="text-terracotta transition-transform duration-300 hover:-translate-y-0.5 hover:text-rose"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a
                  href={salon.social.snapchat.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Snapchat"
                  className="text-terracotta transition-transform duration-300 hover:-translate-y-0.5 hover:text-rose"
                >
                  <SnapchatIcon className="h-5 w-5" />
                </a>
              </dd>
            </Reveal>
          </dl>
          <Reveal delay={380} className="mt-10">
            <BookingButton />
          </Reveal>
        </div>
        <Reveal delay={200} className="min-w-0">
          <div className="overflow-hidden rounded-[2rem] ring-1 ring-line shadow-soft">
            <iframe
              title={t("contact.mapTitle")}
              src={salon.location.embedUrl}
              className="aspect-4/5 h-full w-full border-0 lg:aspect-[4/5]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            href={salon.location.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-ink-soft uppercase transition-colors hover:text-terracotta"
          >
            {t("contact.openMaps")}
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
