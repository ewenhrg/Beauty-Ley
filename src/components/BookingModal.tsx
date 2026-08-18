"use client";

import { useEffect } from "react";
import { salon, booking } from "@/data/salon";
import { InstagramIcon, SnapchatIcon, FacebookIcon } from "./SocialIcons";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function BookingModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const networks = [
    { ...salon.social.instagram, icon: InstagramIcon },
    { ...salon.social.facebook, icon: FacebookIcon },
    { ...salon.social.snapchat, icon: SnapchatIcon },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="backdrop-fade absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="modal-pop relative w-full max-w-md rounded-[1.75rem] bg-cream p-8 shadow-glow sm:p-10"
      >
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Réservation
        </p>
        <h2 id="booking-title" className="font-display mt-3 text-3xl text-ink">
          {booking.label}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{booking.note}</p>
        <ul className="mt-8 space-y-3">
          {networks.map((network) => (
            <li key={network.label}>
              <a
                href={network.href}
                target="_blank"
                rel="noreferrer"
                className="hover-lift flex items-center justify-between gap-4 rounded-2xl border border-blush bg-blush/25 px-4 py-3.5 text-sm transition-[background-color,border-color,transform,box-shadow] hover:border-terracotta hover:bg-blush/40"
              >
                <span className="flex items-center gap-3">
                  <network.icon className="h-4 w-4" />
                  <span>
                    <span className="block font-medium tracking-wide">{network.label}</span>
                    <span className="text-ink-soft">{network.handle}</span>
                  </span>
                </span>
                <span className="text-[11px] tracking-[0.18em] text-gold uppercase">Ouvrir</span>
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 text-xs tracking-[0.22em] text-ink-soft uppercase transition-colors hover:text-ink"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
