"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookingApiError, createAppointment, fetchCatalog } from "@/lib/booking-client";
import type { AppointmentDto, CatalogDto } from "@/lib/booking-types";
import { priceLabel } from "@/lib/booking-types";
import {
  cartTotals,
  needsBrushingStyle,
  needsManicureOptions,
  needsServiceOptions,
} from "@/lib/booking-cart";
import { formatDateKey, formatDuration } from "@/lib/time";
import { AddMoreStep } from "./AddMoreStep";
import { BrushingStyleStep } from "./BrushingStyleStep";
import { ConfirmationView } from "./ConfirmationView";
import { DateTimeStep } from "./DateTimeStep";
import { DetailsStep } from "./DetailsStep";
import { ManicureOptionStep } from "./ManicureOptionStep";
import { PartySizeStep } from "./PartySizeStep";
import { ServiceStep } from "./ServiceStep";
import { StaffStep } from "./StaffStep";
import { SummaryStep } from "./SummaryStep";
import {
  clearDraft,
  flowSteps,
  initialState,
  loadDraft,
  primaryServiceId,
  reachableSteps,
  reducer,
  saveDraft,
  stepIndex,
} from "./bookingState";
import type { CustomerDetails, StepId } from "./bookingState";
import { ActionButton, Notice, Skeleton } from "./ui";
import { choosableHairStaff, serviceAllowsStaffChoice } from "@/lib/staff-choice";
import { useT, useLocale } from "@/i18n/I18nProvider";
import { bookingStepKey } from "@/i18n/keys";
import { intlLocale } from "@/i18n/config";

type FieldErrors = Partial<Record<keyof CustomerDetails | "acceptTerms", string>>;

export function BookingFlow({
  presetServiceId,
  hideServiceStep = false,
}: {
  /** Skip the picker and lock this online service (hybrid reservation). */
  presetServiceId?: string;
  hideServiceStep?: boolean;
} = {}) {
  const t = useT();
  const locale = useLocale();
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
          error instanceof BookingApiError ? error.message : t("booking.loadError"),
        );
      });
    return () => controller.abort();
  }, [t]);

  useEffect(() => {
    if (!catalog || restored.current) return;
    restored.current = true;

    const onlineOnly = catalog.services.filter((service) => service.bookingChannel === "online");
    const requested = presetServiceId || params.get("service");
    const draft = loadDraft();
    const known = (id: string | null) =>
      Boolean(id && onlineOnly.some((service) => service.id === id));

    if (requested && known(requested)) {
      const service = onlineOnly.find((item) => item.id === requested);
      if (!service) return;
      dispatch({
        type: "pickService",
        serviceId: requested,
        needsOptions: needsServiceOptions(service, catalog.categories),
        chooseStaff: serviceAllowsStaffChoice(service.categoryId, catalog.categories),
      });
      return;
    }
    if (!hideServiceStep && draft && draft.items.every((item) => known(item.serviceId))) {
      const chooseStaff = draft.items.some((item) => {
        const service = onlineOnly.find((entry) => entry.id === item.serviceId);
        return service
          ? serviceAllowsStaffChoice(service.categoryId, catalog.categories)
          : false;
      });
      const hairService = onlineOnly.find((service) =>
        draft.items.some((item) => item.serviceId === service.id),
      );
      const allowedHair = hairService
        ? new Set(choosableHairStaff(catalog.staff, hairService.staffIds).map((member) => member.id))
        : new Set<string>();
      const staffId =
        chooseStaff && draft.staffId && allowedHair.has(draft.staffId) ? draft.staffId : null;
      dispatch({
        type: "restore",
        state: {
          ...draft,
          chooseStaff,
          staffId,
          staffPicked: chooseStaff ? draft.staffPicked : true,
          step:
            draft.step === "staff" && !chooseStaff
              ? "slot"
              : draft.step === "service" && hideServiceStep
                ? "addMore"
                : draft.step,
        },
      });
    }
  }, [catalog, params, presetServiceId, hideServiceStep]);

  useEffect(() => {
    if (restored.current) saveDraft(state);
  }, [state]);

  const onlineCatalog = useMemo(() => {
    if (!catalog) return null;
    const services = catalog.services.filter((item) => item.bookingChannel === "online");
    const categoryIds = new Set(services.map((item) => item.categoryId));
    return {
      ...catalog,
      services,
      categories: catalog.categories.filter((category) => categoryIds.has(category.id)),
    };
  }, [catalog]);

  const cartItems = useMemo(() => {
    if (!state.pendingServiceId) return state.items;
    return [
      ...state.items,
      { serviceId: state.pendingServiceId, manicureOption: null, brushingStyle: null },
    ];
  }, [state.items, state.pendingServiceId]);

  const totals = useMemo(() => {
    if (!onlineCatalog) {
      return {
        durationPerPerson: 0,
        pricePerPerson: 0,
        priceKind: "fixed" as const,
        totalPrice: 0,
        labels: [] as string[],
      };
    }
    return cartTotals(state.items, onlineCatalog.services, state.partySize);
  }, [onlineCatalog, state.items, state.partySize]);

  const previewLabels = useMemo(() => {
    if (!onlineCatalog) return [] as string[];
    return cartTotals(cartItems, onlineCatalog.services, 1).labels;
  }, [cartItems, onlineCatalog]);

  const primaryId = useMemo(() => {
    if (!onlineCatalog) return null;
    const durations = new Map(
      onlineCatalog.services.map((service) => [service.id, service.duration]),
    );
    return primaryServiceId(state.items, durations);
  }, [onlineCatalog, state.items]);

  const primaryService = useMemo(
    () => onlineCatalog?.services.find((item) => item.id === primaryId) ?? null,
    [onlineCatalog, primaryId],
  );

  const pendingService = useMemo(
    () =>
      onlineCatalog?.services.find((item) => item.id === state.pendingServiceId) ?? null,
    [onlineCatalog, state.pendingServiceId],
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
      const chooseStaff = state.chooseStaff;
      setDirection(
        stepIndex(step, chooseStaff) >= stepIndex(state.step, chooseStaff) ? "forward" : "back",
      );
      dispatch({ type: "goto", step });
      scrollToTop();
    },
    [scrollToTop, state.chooseStaff, state.step],
  );

  const validateDetails = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    const { firstName, lastName, phone, email, acceptTerms } = state.details;
    if (!firstName.trim()) errors.firstName = t("booking.required");
    if (!lastName.trim()) errors.lastName = t("booking.required");
    if (phone.replace(/\D/g, "").length < 8) errors.phone = t("booking.phoneInvalid");
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      errors.email = t("booking.emailInvalid");
    }
    if (!acceptTerms) errors.acceptTerms = t("booking.termsRequired");
    return errors;
  }, [state.details, t]);

  const submit = useCallback(async () => {
    if (!state.items.length || !state.startAt || !onlineCatalog) return;
    const errors = validateDetails();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const appointment = await createAppointment({
        items: state.items,
        partySize: state.partySize,
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
          setSubmitError(t("booking.slotTaken"));
          goto("slot");
          setSubmitting(false);
          return;
        }
        if (error.field) setFieldErrors({ [error.field]: error.message } as FieldErrors);
        setSubmitError(error.message);
      } else {
        setSubmitError(t("booking.error"));
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    goto,
    onlineCatalog,
    scrollToTop,
    state.details,
    state.items,
    state.partySize,
    state.staffId,
    state.startAt,
    t,
    validateDetails,
  ]);

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
            {t("booking.retry")}
          </ActionButton>
        </div>
      </div>
    );
  }

  if (!catalog || !onlineCatalog) return <CatalogSkeleton />;

  const showServiceStep =
    state.step === "service" && (!hideServiceStep || state.items.length > 0);

  const previousStep: StepId | null = (() => {
    switch (state.step) {
      case "service":
        return state.items.length ? "addMore" : null;
      case "options":
        return hideServiceStep && !state.items.length ? null : "service";
      case "addMore": {
        if (state.pendingServiceId) {
          const pending = onlineCatalog.services.find(
            (service) => service.id === state.pendingServiceId,
          );
          if (pending && needsServiceOptions(pending, onlineCatalog.categories)) {
            return "options";
          }
          return hideServiceStep && !state.items.length ? null : "service";
        }
        return hideServiceStep && state.items.length <= 1 ? null : "service";
      }
      case "staff":
        return "addMore";
      case "slot":
        return state.chooseStaff ? "staff" : "addMore";
      case "party":
        return "slot";
      case "summary":
        return "party";
      case "details":
        return "summary";
      default: {
        const _exhaustive: never = state.step;
        return _exhaustive;
      }
    }
  })();

  const stepNumber = (() => {
    const steps = flowSteps(state.chooseStaff).filter((step) => {
      if (hideServiceStep && step === "service" && !state.items.length) return false;
      return true;
    });
    const index = steps.indexOf(state.step);
    return index >= 0 ? index + 1 : 1;
  })();

  const canContinue =
    state.step === "party"
      ? state.partySize >= 1
      : state.step === "staff"
        ? state.staffPicked
        : state.step === "slot"
          ? Boolean(state.startAt)
          : state.step === "summary"
            ? true
            : false;

  return (
    <div ref={topRef} className="scroll-mt-28">
      <Progress
        current={state.step}
        chooseStaff={state.chooseStaff}
        hideServiceStep={hideServiceStep && state.items.length === 0}
        onJump={goto}
        reachable={reachableSteps(state)}
      />

      {submitError ? (
        <div className="mt-6">
          <Notice tone="error">{submitError}</Notice>
        </div>
      ) : null}

      <div
        key={state.step}
        className={`mt-8 ${direction === "forward" ? "step-in" : "step-in-back"}`}
      >
        {showServiceStep ? (
          <ServiceStep
            catalog={onlineCatalog}
            selectedId={state.pendingServiceId}
            excludeIds={state.items.map((item) => item.serviceId)}
            onSelect={(picked) => {
              setDirection("forward");
              dispatch({
                type: "pickService",
                serviceId: picked.id,
                needsOptions: needsServiceOptions(picked, onlineCatalog.categories),
                chooseStaff: serviceAllowsStaffChoice(picked.categoryId, onlineCatalog.categories),
              });
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "options" &&
        pendingService &&
        needsManicureOptions(pendingService, onlineCatalog.categories) ? (
          <ManicureOptionStep
            services={onlineCatalog.services}
            selected={null}
            stepNumber={stepNumber}
            onSelect={(option) => {
              setDirection("forward");
              dispatch({ type: "pickManicureOption", option });
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "options" && pendingService && needsBrushingStyle(pendingService) ? (
          <BrushingStyleStep
            selected={null}
            stepNumber={stepNumber}
            onSelect={(style) => {
              setDirection("forward");
              dispatch({ type: "pickBrushingStyle", style });
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "addMore" ? (
          <AddMoreStep
            labels={previewLabels}
            stepNumber={stepNumber}
            onAnswer={(yes) => {
              setDirection("forward");
              dispatch({ type: "addMore", yes });
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "staff" && primaryService ? (
          <StaffStep
            service={primaryService}
            staff={onlineCatalog.staff}
            selectedId={state.staffPicked ? state.staffId : undefined}
            onSelect={(staffId) => {
              setDirection("forward");
              dispatch({ type: "pickStaff", staffId });
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "slot" && primaryService ? (
          <DateTimeStep
            service={primaryService}
            staffId={state.staffId}
            staff={onlineCatalog.staff}
            date={state.date}
            startAt={state.startAt}
            revision={revision}
            stepNumber={stepNumber}
            revealStaff={state.chooseStaff}
            durationMin={totals.durationPerPerson || primaryService.duration}
            onSelectDate={(date) => dispatch({ type: "pickDate", date })}
            onSelectSlot={(slot, day) => {
              setDirection("forward");
              dispatch({ type: "pickSlot", startAt: slot.startAt, time: slot.time, date: day });
              setSubmitError(null);
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "party" ? (
          <PartySizeStep
            selected={state.partySize}
            stepNumber={stepNumber}
            onSelect={(partySize) => {
              setDirection("forward");
              dispatch({ type: "pickPartySize", partySize });
              scrollToTop();
            }}
          />
        ) : null}

        {state.step === "summary" && state.date && state.time && state.startAt ? (
          <SummaryStep
            selection={{
              labels: totals.labels,
              staff: staffMember,
              date: state.date,
              time: state.time,
              startAt: state.startAt,
              duration: totals.durationPerPerson,
              price: totals.totalPrice,
              priceKind: totals.priceKind,
              partySize: state.partySize,
            }}
            policy={catalog.policy}
            chooseStaff={state.chooseStaff}
            onEditService={() => goto("service")}
            onEditStaff={() => goto("staff")}
            onEditSlot={() => goto("slot")}
            onEditParty={() => goto("party")}
          />
        ) : null}

        {state.step === "details" && state.items.length ? (
          <>
            <MiniRecap
              service={totals.labels.join(" · ")}
              staff={state.chooseStaff ? (staffMember?.name ?? t("booking.any")) : null}
              when={`${formatDateKey(state.date ?? "", { locale: intlLocale(locale) })} · ${state.time}`}
              price={priceLabel(totals.totalPrice, totals.priceKind, t("price.from"))}
              duration={formatDuration(totals.durationPerPerson)}
              party={
                state.partySize === 1
                  ? t("booking.party.one")
                  : t("booking.party.many", { n: state.partySize })
              }
              onEdit={() => goto("summary")}
            />
            <div className="mt-8">
              <DetailsStep
                details={state.details}
                errors={fieldErrors}
                terms={catalog.policy.terms}
                stepNumber={stepNumber}
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
              {t("booking.back")}
            </button>
          ) : (
            <span />
          )}

          {state.step === "details" ? (
            <ActionButton onClick={submit} loading={submitting} className="min-h-12 flex-1 sm:flex-none">
              {submitting ? t("booking.confirming") : t("booking.confirm")}
            </ActionButton>
          ) : state.step === "service" ||
            state.step === "options" ||
            state.step === "addMore" ||
            state.step === "party" ? (
            <span className="text-[11px] tracking-[0.18em] text-ink-soft uppercase">
              {state.step === "service"
                ? t("booking.selectService")
                : state.step === "party"
                  ? t("booking.selectParty")
                  : t("booking.selectOption")}
            </span>
          ) : (
            <ActionButton
              onClick={() => {
                if (state.step === "summary") {
                  goto("details");
                  return;
                }
                const steps = flowSteps(state.chooseStaff);
                const next = steps[steps.indexOf(state.step) + 1];
                if (next) goto(next);
              }}
              disabled={!canContinue}
              className="min-h-12 flex-1 sm:flex-none"
            >
              {t("booking.continue")}
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}

function Progress({
  current,
  chooseStaff,
  hideServiceStep = false,
  reachable,
  onJump,
}: {
  current: StepId;
  chooseStaff: boolean;
  hideServiceStep?: boolean;
  reachable: StepId[];
  onJump: (step: StepId) => void;
}) {
  const t = useT();
  const steps = flowSteps(chooseStaff).filter((step) => {
    if (hideServiceStep && step === "service") return false;
    // Keep the progress compact: hide intermediate helper steps on small labels.
    if (step === "options" || step === "addMore") return false;
    return true;
  });
  const mappedCurrent =
    current === "options" || current === "addMore"
      ? hideServiceStep
        ? steps[0]
        : "service"
      : current;
  const currentIndex = steps.indexOf(mappedCurrent ?? current);
  return (
    <nav aria-label={t("booking.stepsAria")}>
      <ol className="no-scrollbar -mx-5 flex items-center gap-1 overflow-x-auto px-5 sm:mx-0 sm:gap-2 sm:px-0">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = step === mappedCurrent;
          const enabled = reachable.includes(step) || step === "service";
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
                <span className="hidden sm:inline">{t(bookingStepKey(step))}</span>
              </button>
              {index < steps.length - 1 ? (
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
        {t(bookingStepKey(current))}
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
  party,
  onEdit,
}: {
  service: string;
  staff: string | null;
  when: string;
  price: string;
  duration: string;
  party: string;
  onEdit: () => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl border border-line bg-blush/25 px-4 py-3.5 sm:px-5">
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-ink">{service}</p>
        <p className="mt-0.5 text-[13px] text-ink-soft">
          {party} · {staff ? `${staff} · ` : null}
          {when} · {duration}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-display text-lg text-terracotta">{price}</span>
        <button
          type="button"
          onClick={onEdit}
          className="nav-link text-[10px] tracking-[0.2em] text-ink-soft uppercase hover:text-rose"
        >
          {t("booking.mini.edit")}
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
