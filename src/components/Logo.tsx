export function Logo({
  inverted = false,
  compact = false,
}: {
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <span className="flex items-center gap-3">
      {inverted ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream font-display text-sm tracking-wide text-ink">
          LB
        </span>
      ) : (
        <img
          src="/images/logo/monogram.png"
          alt=""
          className={compact ? "h-10 w-auto" : "h-12 w-auto"}
        />
      )}
      <span className="flex flex-col leading-none">
        <span
          className={`font-display tracking-[0.28em] uppercase ${compact ? "text-[17px]" : "text-xl"} ${inverted ? "text-cream" : "text-ink"}`}
        >
          Beauty Ley
        </span>
        {compact ? null : (
          <span
            className={`mt-1.5 text-[9px] tracking-[0.28em] uppercase ${inverted ? "text-cream/65" : "text-ink-soft"}`}
          >
            Beauty & Wellness Studio
          </span>
        )}
      </span>
    </span>
  );
}
