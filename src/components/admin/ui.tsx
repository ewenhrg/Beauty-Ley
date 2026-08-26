"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import type { ActionState } from "@/app/admin/action-state";
import { idleState } from "@/app/admin/action-state";
import type { AppointmentStatus } from "@/server/db/types";
import { Spinner } from "@/components/booking/ui";

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING: "bg-gold/18 text-gold-deep border-gold/35",
  CONFIRMED: "bg-terracotta/15 text-terracotta border-terracotta/35",
  COMPLETED: "bg-ink/8 text-ink-soft border-ink/15",
  CANCELLED: "bg-rose/12 text-rose border-rose/30",
  NO_SHOW: "bg-ink/12 text-ink-soft border-ink/20",
};

export function StatusPill({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.5rem] border border-line bg-white/65 p-5 sm:p-6 ${className}`}
    >
      {title || action ? (
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title ? <h2 className="font-display text-xl text-ink">{title}</h2> : <span />}
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-line bg-white/65 px-5 py-4">
      <p className="text-[10px] tracking-[0.22em] text-rose uppercase">{label}</p>
      <p className="font-display mt-2 text-3xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export const adminInput =
  "w-full min-h-11 rounded-xl border border-line bg-white/80 px-3.5 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-terracotta sm:min-h-0 sm:text-sm";

export const adminLabel = "block text-[10px] tracking-[0.2em] text-rose uppercase";

export function LabelledField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className={adminLabel}>{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

export function SubmitButton({
  children,
  variant = "solid",
  className = "",
  confirm,
}: {
  children: ReactNode;
  variant?: "solid" | "ghost" | "danger";
  className?: string;
  /** Native confirmation before a destructive submit. */
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  const styles = {
    solid: "bg-terracotta text-cream hover:bg-rose",
    ghost: "border border-line text-ink-soft hover:border-terracotta hover:text-ink",
    danger: "border border-rose/40 text-rose hover:bg-rose/10",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={
        confirm
          ? (event) => {
              if (!window.confirm(confirm)) event.preventDefault();
            }
          : undefined
      }
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-medium tracking-[0.18em] uppercase transition-colors disabled:opacity-50 sm:w-auto ${styles} ${className}`}
    >
      {pending ? <Spinner className="h-3 w-3" /> : null}
      {children}
    </button>
  );
}

/** Wraps a server action with inline success/error feedback. */
export function ActionForm({
  action,
  children,
  className = "",
  id,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className={className} id={id}>
      {children}
      {state.message ? (
        <p
          role="status"
          className={`mt-3 rounded-xl px-3.5 py-2.5 text-xs ${
            state.ok ? "bg-gold/12 text-gold-deep" : "bg-rose/12 text-rose"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
      {children}
    </p>
  );
}

export function Money({ value }: { value: number }) {
  return <span>{new Intl.NumberFormat("fr-FR").format(value)} EGP</span>;
}
