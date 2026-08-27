"use client";

import { salon } from "@/data/salon";
import { FacebookIcon, InstagramIcon, SnapchatIcon } from "../SocialIcons";
import { Eyebrow, StepLead, StepTitle } from "./ui";
import { useT } from "@/i18n/I18nProvider";

/**
 * Shown when online booking has no datastore configured. Rather than a broken
 * form, the client gets the studio's original booking channels.
 */
export function BookingModalFallback({ reason }: { reason: string }) {
  const t = useT();
  const networks = [
    { ...salon.social.instagram, icon: InstagramIcon },
    { ...salon.social.facebook, icon: FacebookIcon },
    { ...salon.social.snapchat, icon: SnapchatIcon },
  ];

  return (
    <div>
      <Eyebrow>{t("booking.fallback.eyebrow")}</Eyebrow>
      <StepTitle>{t("booking.fallback.title")}</StepTitle>
      <StepLead>{t("booking.fallback.lead")}</StepLead>

      <ul className="mt-8 space-y-3">
        {networks.map((network) => (
          <li key={network.label}>
            <a
              href={network.href}
              target="_blank"
              rel="noreferrer"
              className="hover-lift flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/55 px-4 py-4 text-sm transition-colors hover:border-terracotta hover:bg-blush/30"
            >
              <span className="flex items-center gap-3">
                <network.icon className="h-4 w-4" />
                <span>
                  <span className="block font-medium tracking-wide">{network.label}</span>
                  <span className="text-ink-soft">{network.handle}</span>
                </span>
              </span>
              <span className="text-[11px] tracking-[0.18em] text-gold uppercase">
                {t("booking.fallback.open")}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {process.env.NODE_ENV !== "production" ? (
        <p className="mt-6 text-xs text-ink-soft/70">{reason}</p>
      ) : null}
    </div>
  );
}
