import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Shared building blocks of the booking flow, styled from the site tokens. */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">{children}</p>
  );
}

export function StepTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display mt-3 text-3xl text-ink sm:text-4xl">{children}</h2>;
}

export function StepLead({ children }: { children: ReactNode }) {
  return <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{children}</p>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "quiet";
  loading?: boolean;
};

export function ActionButton({
  variant = "solid",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const styles = {
    solid: "bg-terracotta text-cream shadow-soft hover:bg-rose hover:shadow-glow",
    ghost: "border border-terracotta/40 text-ink hover:border-rose hover:text-rose",
    quiet: "text-ink-soft hover:text-ink",
  }[variant];

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 ${
        variant !== "quiet" ? "hover:-translate-y-0.5" : ""
      } ${styles} ${className}`}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={`spinner ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Avatar({
  name,
  initials,
  photo,
  color,
  size = "md",
}: {
  name: string;
  initials: string;
  photo: string | null;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions = { sm: "h-9 w-9 text-[11px]", md: "h-14 w-14 text-sm", lg: "h-20 w-20 text-lg" }[
    size
  ];

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${dimensions} shrink-0 rounded-full object-cover`}
        loading="lazy"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${dimensions} font-display flex shrink-0 items-center justify-center rounded-full tracking-[0.12em] text-cream`}
      style={{ background: `linear-gradient(140deg, ${color}, color-mix(in srgb, ${color} 55%, #3a2c28))` }}
    >
      {initials}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const styles = {
    info: "border-line bg-blush/20 text-ink-soft",
    error: "border-rose/45 bg-rose/12 text-ink",
    success: "border-gold/45 bg-gold/12 text-ink",
  }[tone];

  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={`rounded-2xl border px-4 py-3.5 text-sm leading-relaxed ${styles}`}
    >
      {children}
    </p>
  );
}

export function SummaryRow({
  label,
  value,
  onEdit,
  editLabel = "Modifier",
}: {
  label: string;
  value: ReactNode;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-4 last:border-b-0">
      <div className="min-w-0">
        <dt className="text-[10px] tracking-[0.24em] text-rose uppercase">{label}</dt>
        <dd className="mt-1.5 text-[15px] leading-snug text-ink">{value}</dd>
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="nav-link shrink-0 text-[10px] tracking-[0.2em] text-ink-soft uppercase transition-colors hover:text-rose"
        >
          {editLabel}
        </button>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.24em] text-rose uppercase">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
      {error ? (
        <span className="mt-1.5 block text-xs text-rose">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ink-soft">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full min-h-12 rounded-2xl border border-line bg-white/70 px-4 py-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/55 focus:border-terracotta focus:bg-white";
