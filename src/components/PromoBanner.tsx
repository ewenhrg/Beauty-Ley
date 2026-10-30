"use client";

export function PromoBanner({ messages }: { messages: string[] }) {
  if (!messages.length) return null;

  const sequence = messages.join("   ·   ");
  // Duplicate the strip so the CSS loop can scroll seamlessly.
  const loop = `${sequence}   ·   ${sequence}   ·   `;

  return (
    <div
      className="promo-banner fixed inset-x-0 top-0 z-[60] overflow-hidden bg-terracotta text-cream"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="region"
      aria-label="Offres en cours"
    >
      <div className="flex h-9 items-center overflow-hidden border-b border-cream/15">
        <div className="promo-marquee-track whitespace-nowrap text-[11px] font-medium tracking-[0.18em] uppercase">
          <span className="inline-block px-6">{loop}</span>
          <span className="inline-block px-6" aria-hidden="true">
            {loop}
          </span>
        </div>
      </div>
    </div>
  );
}
