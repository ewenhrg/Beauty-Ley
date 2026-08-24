"use client";

import type { CustomerDetails } from "./bookingState";
import { Eyebrow, Field, StepLead, StepTitle, inputClass } from "./ui";

export function DetailsStep({
  details,
  errors,
  terms,
  onChange,
}: {
  details: CustomerDetails;
  errors: Partial<Record<keyof CustomerDetails | "acceptTerms", string>>;
  terms: string;
  onChange: (patch: Partial<CustomerDetails>) => void;
}) {
  return (
    <div>
      <Eyebrow>Étape 5</Eyebrow>
      <StepTitle>Vos informations</StepTitle>
      <StepLead>
        Elles nous servent uniquement à confirmer et à gérer votre rendez-vous.
      </StepLead>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Prénom" required error={errors.firstName}>
          <input
            className={inputClass}
            value={details.firstName}
            autoComplete="given-name"
            onChange={(event) => onChange({ firstName: event.target.value })}
          />
        </Field>
        <Field label="Nom" required error={errors.lastName}>
          <input
            className={inputClass}
            value={details.lastName}
            autoComplete="family-name"
            onChange={(event) => onChange({ lastName: event.target.value })}
          />
        </Field>
        <Field label="Téléphone" required error={errors.phone} hint="Pour vous joindre en cas d'imprévu.">
          <input
            className={inputClass}
            value={details.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+20 100 000 0000"
            onChange={(event) => onChange({ phone: event.target.value })}
          />
        </Field>
        <Field
          label="Email"
          error={errors.email}
          hint="Pour recevoir la confirmation et le lien de gestion."
        >
          <input
            className={inputClass}
            value={details.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            onChange={(event) => onChange({ email: event.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Note ou demande particulière" error={errors.note}>
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              value={details.note}
              maxLength={600}
              placeholder="J'ai une préférence particulière ou une demande à préciser…"
              onChange={(event) => onChange({ note: event.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-blush/20 p-4 sm:p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={details.acceptTerms}
            onChange={(event) => onChange({ acceptTerms: event.target.checked })}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#c17a5c]"
          />
          <span className="text-sm leading-relaxed text-ink">
            J&apos;accepte les conditions de réservation.
            <span className="mt-1.5 block text-[13px] leading-relaxed text-ink-soft">{terms}</span>
          </span>
        </label>
        {errors.acceptTerms ? (
          <p className="mt-2 text-xs text-rose" role="alert">
            {errors.acceptTerms}
          </p>
        ) : null}
      </div>
    </div>
  );
}
