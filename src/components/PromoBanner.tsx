"use client";

import { useEffect, useRef, useState } from "react";

export function PromoBanner({ messages }: { messages: string[] }) {
  const clean = messages.map((message) => message.trim()).filter(Boolean);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [copies, setCopies] = useState(12);
  const [durationSec, setDurationSec] = useState(18);

  useEffect(() => {
    if (!clean.length) return;

    const update = () => {
      const segmentWidth = measureRef.current?.scrollWidth ?? 0;
      if (!segmentWidth) return;
      const viewport = window.innerWidth || 1200;
      // Enough repeats so one animated half always covers the screen (desktop included).
      const needed = Math.ceil((viewport * 1.5) / segmentWidth) + 2;
      setCopies(Math.max(4, needed));
      // ~90px/s — readable but clearly moving.
      const halfWidth = segmentWidth * Math.max(4, needed);
      setDurationSec(Math.max(10, Math.min(28, Math.round(halfWidth / 90))));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [clean.join("|")]);

  if (!clean.length) return null;

  const segment = (
    <>
      {clean.map((message, index) => (
        <span key={`${message}-${index}`} className="inline-flex items-center">
          <span className="px-10 sm:px-16">{message}</span>
          <span aria-hidden="true" className="px-2 text-cream/45">
            ·
          </span>
        </span>
      ))}
    </>
  );

  return (
    <div
      className="promo-banner fixed inset-x-0 top-0 z-[60] overflow-hidden bg-terracotta text-cream"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="region"
      aria-label="Offres en cours"
    >
      {/* Hidden measure of one offer cycle */}
      <div
        ref={measureRef}
        className="pointer-events-none invisible absolute whitespace-nowrap text-[11px] font-medium tracking-[0.18em] uppercase"
        aria-hidden="true"
      >
        {segment}
      </div>

      <div className="flex h-9 items-center overflow-hidden border-b border-cream/15">
        <div
          className="promo-marquee-track whitespace-nowrap text-[11px] font-medium tracking-[0.18em] uppercase"
          style={{ animationDuration: `${durationSec}s` }}
        >
          <div className="inline-flex shrink-0 items-center">
            {Array.from({ length: copies }, (_, index) => (
              <span key={`a-${index}`} className="inline-flex items-center">
                {segment}
              </span>
            ))}
          </div>
          <div className="inline-flex shrink-0 items-center" aria-hidden="true">
            {Array.from({ length: copies }, (_, index) => (
              <span key={`b-${index}`} className="inline-flex items-center">
                {segment}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
