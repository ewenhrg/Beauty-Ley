"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { BookingButton } from "./BookingButton";
import { nav, salon } from "@/data/salon";
import { InstagramIcon, FacebookIcon, SnapchatIcon } from "./SocialIcons";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { useT } from "@/i18n/I18nProvider";

export function Footer() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-cream pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="animate-drift pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-terracotta/25 blur-3xl" />
      <div className="animate-drift-slow pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-rose/20 blur-3xl" />
      <div className="animate-drift pointer-events-none absolute top-1/3 left-1/2 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr] lg:py-20">
        <div>
          <Logo inverted />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/70">
            {salon.tagline}
            <br />
            {salon.city}
          </p>
          <div className="mt-8">
            <BookingButton variant="light" />
          </div>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.28em] text-gold-soft uppercase">{t("footer.nav")}</p>
          <ul className="mt-5 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-cream/75 transition-all duration-300 hover:translate-x-1 hover:text-cream"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.28em] text-gold-soft uppercase">{t("footer.social")}</p>
          <ul className="mt-5 space-y-4">
            <li>
              <a
                href={salon.social.instagram.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-cream/75 transition-all duration-300 hover:translate-x-1 hover:text-cream"
              >
                <InstagramIcon className="h-4 w-4" />
                {salon.social.instagram.handle}
              </a>
            </li>
            <li>
              <a
                href={salon.social.snapchat.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-cream/75 transition-all duration-300 hover:translate-x-1 hover:text-cream"
              >
                <SnapchatIcon className="h-4 w-4" />
                Snapchat · {salon.social.snapchat.handle}
              </a>
            </li>
            <li>
              <a
                href={salon.social.facebook.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-cream/75 transition-all duration-300 hover:translate-x-1 hover:text-cream"
              >
                <FacebookIcon className="h-4 w-4" />
                Facebook · {salon.social.facebook.handle}
              </a>
            </li>
          </ul>
          <div className="mt-8">
            <LanguageSwitcher light />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-[11px] tracking-[0.16em] text-cream/45 uppercase sm:px-8">
          © {year} {salon.name} · {salon.city}
        </p>
      </div>
    </footer>
  );
}
