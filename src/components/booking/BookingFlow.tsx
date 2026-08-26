"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookingApiError, createAppointment, fetchCatalog } from "@/lib/booking-client";
import type { AppointmentDto, CatalogDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import { formatDateKey, formatDuration } from "@/lib/time";
import { ConfirmationView } from "./ConfirmationView";
import { DateTimeStep } from "./DateTimeStep";
import { DetailsStep } from "./DetailsStep";
import { ServiceStep } from "./ServiceStep";
import { StaffStep } from "./StaffStep";
import { SummaryStep } from "./SummaryStep";
import {
  STEPS,
  clearDraft,
  initialState,
  loadDraft,
  reachableSteps,
  reducer,
  saveDraft,
  stepIndex,
} from "./bookingState";
import type { CustomerDetails, StepId } from "./bookingState";
import { ActionButton, Notice, Skeleton } from "./ui";

const STEP_LABELS: Record<StepId, string> = {
  service: "Prestation",
  staff: "Équipe",
  slot: "Créneau",
  summary: "Récapitulatif",
  details: "Coordonnées",
};

type FieldErrors = Partial<Record<keyof CustomerDetails | "acceptTerms", string>>;

export function BookingFlow() {
  const params = useSearchParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [catalog, setCatalog] = useState<CatalogDto | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirmed, setConfirmed] = useState<AppointmentDto | null>(null);
  /** Bumped when a slot is lost, to force a fresh availability read. */
  const [revision, setRevision] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const topRef = useRef<HTMLDivElement | null>(null);
  const restored = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalog(controller.signal)
      .then(setCatalog)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setCatalogError(
          error instanceof BookingApiError
            ? error.message
            : "Impossible de charger les prestations.",
        );
      });
    return () => controller.abort();
  }, []);

  // Restore a draft once the catalogue is known, so stale ids can be dropped.
  useEffect(() => {
    if (!catalog || restored.current) return;
    restored.current = true;

    const requested = params.get("service");
    const draft = loadDraft();
    const known = (id: string | null) =>
      Boolean(id && catalog.services.some((service) => service.id === id));

    if (requested && known(requested)) {
      dispatch({ type: "pickService", serviceId: requested });
      return;
    }
    if (draft && known(draft.serviceId)) {
      dispatch({ type: "restore", state: draft });
    }
  }, [catalog, params]);

  useEffect(() => {
    if (restored.current) saveDraft(state);
  }, [state]);

  const service = useMemo(
    () => catalog?.services.find((item) => item.id === state.serviceId) ?? null,
    [catalog, state.serviceId],
  );
  const staffMember = useMemo(
    () => catalog?.staff.find((member) => member.id === state.staffId) ?? null,
    [catalog, state.staffId],
  );

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goto = useCallback(
    (step: StepId) => {
      setDirection(stepIndex(step) >= stepIndex(state.step) ? "forward" : "back");
      dispatch({ type: "goto", step });
      scrollToTop();
    },
    [scrollToTop, state.step],
  );

  const validateDetails = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    const { firstName, lastName, phone, email, acceptTerms } = state.details;
    if (!firstName.trim()) errors.firstName = "Champ obligatoire.";
    if (!lastName.trim()) errors.lastName = "Champ obligatoire.";
    if (phone.replace(/\D/g, "").length < 8) errors.phone = "Numéro de téléphone invalide.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      errors.email = "Adresse email invalide.";
    }
    if (!acceptTerms) errors.acceptTerms = "Merci d'accepter les conditions de réservation.";
    return errors;
  }, [state.details]);

  const submit = useCallback(async () => {
    if (!service || !state.startAt) return;
    const errors = validateDetails();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const appointment = await createAppointment({
        serviceId: service.id,
        staffId: state.staffId ?? undefined,
        startAt: state.startAt,
        firstName: state.details.firstName.trim(),
        lastName: state.details.lastName.trim(),
        phone: state.details.phone.trim(),
        email: state.details.email.trim() || null,
        note: state.details.note.trim() || null,
        acceptTerms: true,
      });
      clearDraft();
      setConfirmed(appointment);
      scrollToTop();
    } catch (error) {
      if (error instanceof BookingApiError) {
        if (error.code === "SLOT_TAKEN") {
          setRevision((value) => value + 1);
          setSubmitError(
            "Nous sommes désolés, ce créneau vient d'être réservé. Voici les prochains créneaux disponibles.",
          );
          goto("slot");
          setSubmitting(false);
          return;
        }
        if (error.field) setFieldErrors({ [error.field]: error.message } as FieldErrors);
        setSubmitError(error.message);
      } else {
        setSubmitError("Une erreur est survenue. Merci de réessayer.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [goto, scrollToTop, service, state.details, state.staffId, state.startAt, validateDetails]);

  if (confirmed) {
    return (
      <div ref={topRef} className="scroll-mt-28">
        <ConfirmationView appointment={confirmed} />
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="mx-auto max-w-md">
        <Notice tone="error">{catalogError}</Notice>
        <div className="mt-5 text-center">
          <ActionButton variant="ghost" onClick={() => window.location.reload()}>
            Réessayer
          </ActionButton>
        </div>
      </div>
    );
  }

  if (!catalog) return <CatalogSkeleton />;

  const canContinue =
    state.step === "service"
      ? Boolean(service)
      : state.step === "staff"
        ? state.staffPicked
        : state.step === "slot"
          ? Boolean(state.startAt)
          : true;

  const previousStep: StepId | null =
    stepIndex(state.step) > 0 ? STEPS[stepIndex(state.step) - 1] : null;

  return (
    <div ref={topRef} className="scroll-mt-28">
      <Progress current={state.step} onJump={goto} reachable={reachableSteps(state)} />

      {submitError ? (
        <div className="mt-6">
          <Notice tone="error">{submitError}</Notice>
        </div>
      ) : null}

      <div
        key={state.step}
        className={`mt-8 ${direction === "forward" ? "step-in" : "step-in-back"}`}
      >
        {state.step === "service" ? (
          <ServiceStep
            catalog={catalog}
            selectedId={state.serviceId}
            onSelect={(picked) => {
              setDirection("forward");
              dispatch({ type: "pickService", serviceId: picked.id });
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "staff" && service ? (
          <StaffStep
            service={service}
            staff={catalog.staff}
            selectedId={state.staffPicked ? state.staffId : undefined}
            onSelect={(staffId) => {
              setDirection("forward");
              dispatch({ type: "pickStaff", staffId });
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "slot" && service ? (
          <DateTimeStep
            service={service}
            staffId={state.staffId}
            staff={catalog.staff}
            date={state.date}
            startAt={state.startAt}
            revision={revision}
            onSelectDate={(date) => dispatch({ type: "pickDate", date })}
            onSelectSlot={(slot, day) => {
              setDirection("forward");
              dispatch({ type: "pickSlot", startAt: slot.startAt, time: slot.time, date: day });
              setSubmitError(null);
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "summary" && service && state.date && state.time && state.startAt ? (
          <SummaryStep
            selection={{
              service,
              staff: staffMember,
              date: state.date,
              time: state.time,
              startAt: state.startAt,
            }}
            policy={catalog.policy}
            onEditService={() => goto("service")}
            onEditStaff={() => goto("staff")}
            onEditSlot={() => goto("slot")}
          />
        ) : null}

        {state.step === "details" && service ? (
          <>
            <MiniRecap
              service={service.name}
              staff={staffMember?.name ?? "Peu importe"}
              when={`${formatDateKey(state.date ?? "")} · ${state.time}`}
              price={priceLabel(service.price, service.priceKind)}
              duration={formatDuration(service.duration)}
              onEdit={() => goto("summary")}
            />
            <div className="mt-8">
              <DetailsStep
                details={state.details}
                errors={fieldErrors}
                terms={catalog.policy.terms}
                onChange={(patch) => {
                  dispatch({ type: "setDetails", patch });
                  setFieldErrors({});
                }}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-20 -mx-5 mt-10 border-t border-line bg-cream/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:mx-0 sm:rounded-b-[2rem] sm:px-8 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {previousStep ? (
            <button
              type="button"
              onClick={() => goto(previousStep)}
              className="nav-link min-h-11 shrink-0 px-1 text-[11px] tracking-[0.2em] text-ink-soft uppercase transition-colors hover:text-ink"
            >
              Retour
            </button>
          ) : (
            <span />
          )}

          {state.step === "details" ? (
            <ActionButton onClick={submit} loading={submitting} className="min-h-12 flex-1 sm:flex-none">
              {submitting ? "Confirmation…" : "Confirmer"}
            </ActionButton>
          ) : state.step === "service" ? (
            <span className="text-[11px] tracking-[0.18em] text-ink-soft uppercase">
              Sélectionnez une prestation
            </span>
          ) : (
            <ActionButton
              onClick={() => goto(STEPS[stepIndex(state.step) + 1])}
              disabled={!canContinue}
              className="min-h-12 flex-1 sm:flex-none"
            >
              Continuer
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}

function Progress({
  current,
  reachable,
  onJump,
}: {
  current: StepId;
  reachable: StepId[];
  onJump: (step: StepId) => void;
}) {
  const currentIndex = stepIndex(current);
  return (
    <nav aria-label="Étapes de réservation">
      <ol className="no-scrollbar -mx-5 flex items-center gap-1 overflow-x-auto px-5 sm:mx-0 sm:gap-2 sm:px-0">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = step === current;
          const enabled = reachable.includes(step);
          return (
            <li key={step} className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onJump(step)}
                aria-current={active ? "step" : undefined}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-[10px] tracking-[0.16em] uppercase transition-colors sm:px-3.5 ${
                  active
                    ? "bg-terracotta text-cream"
                    : done
                      ? "text-terracotta hover:bg-blush/35"
                      : "text-ink-soft/60"
                } ${enabled && !active ? "cursor-pointer" : ""}`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                    active
                      ? "bg-cream/25 text-cream"
                      : done
                        ? "bg-terracotta/15 text-terracotta"
                        : "bg-ink-soft/10 text-ink-soft/70"
                  }`}
                >
                  {done ? "✓" : index + 1}
                </span>
                <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
              </button>
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`h-px w-4 sm:w-6 ${done ? "bg-terracotta/50" : "bg-line"}`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[11px] tracking-[0.18em] text-ink-soft uppercase sm:hidden">
        {STEP_LABELS[current]}
      </p>
    </nav>
  );
}

function MiniRecap({
  service,
  staff,
  when,
  price,
  duration,
  onEdit,
}: {
  service: string;
  staff: string;
  when: string;
  price: string;
  duration: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl border border-line bg-blush/25 px-4 py-3.5 sm:px-5">
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-ink">{service}</p>
        <p className="mt-0.5 text-[13px] text-ink-soft">
          {staff} · {when} · {duration}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-display text-lg text-terracotta">{price}</span>
        <button
          type="button"
          onClick={onEdit}
          className="nav-link text-[10px] tracking-[0.2em] text-ink-soft uppercase hover:text-rose"
        >
          Modifier
        </button>
      </div>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="mt-8 h-12 w-full" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
