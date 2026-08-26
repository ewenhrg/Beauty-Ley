import Link from "next/link";

type Props = {
  variant?: "solid" | "ghost" | "light";
  /** Preselects a prestation in the booking flow. */
  serviceId?: string;
  className?: string;
  children?: React.ReactNode;
};

const VARIANTS = {
  solid: "bg-terracotta text-cream hover:bg-rose shadow-soft hover:shadow-glow",
  ghost: "border border-terracotta/40 text-ink hover:border-rose hover:text-rose bg-transparent",
  light: "bg-cream text-terracotta hover:bg-white shadow-soft hover:shadow-glow",
} as const;

const BASE =
  "inline-flex items-center justify-center px-6 py-3 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]";

/** Public CTA that always opens the reservation page. */
export function BookingButton({
  variant = "solid",
  className = "",
  serviceId,
  children,
}: Props) {
  const styles = VARIANTS[variant];
  const href = serviceId ? `/reservation?service=${encodeURIComponent(serviceId)}` : "/reservation";

  return (
    <Link href={href} className={`${BASE} ${styles} ${className}`}>
      {children ?? "Prendre rendez-vous"}
    </Link>
  );
}
