"use client";

import type { BrushingStyleId, CartItem, ManicureOptionId } from "@/lib/booking-cart";

export type CustomerDetails = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  note: string;
  acceptTerms: boolean;
};

export const STEPS = [
  "service",
  "options",
  "addMore",
  "staff",
  "slot",
  "party",
  "summary",
  "details",
] as const;
export type StepId = (typeof STEPS)[number];

export type BookingState = {
  step: StepId;
  /** Selected prestations (order = booking order). */
  items: CartItem[];
  /**
   * Service currently being configured (options / just picked).
   * Cleared once committed into `items`.
   */
  pendingServiceId: string | null;
  /** `null` is a deliberate "peu importe"; `staffPicked` tells the two apart. */
  staffId: string | null;
  staffPicked: boolean;
  /** Hair services only — nails, lashes, etc. skip this step. */
  chooseStaff: boolean;
  date: string | null;
  startAt: string | null;
  time: string | null;
  partySize: number;
  details: CustomerDetails;
};

export const emptyDetails: CustomerDetails = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  note: "",
  acceptTerms: false,
};

export const initialState: BookingState = {
  step: "service",
  items: [],
  pendingServiceId: null,
  staffId: null,
  staffPicked: false,
  chooseStaff: false,
  date: null,
  startAt: null,
  time: null,
  partySize: 1,
  details: emptyDetails,
};

export type BookingAction =
  | { type: "pickService"; serviceId: string; needsOptions: boolean; chooseStaff: boolean }
  | { type: "pickManicureOption"; option: ManicureOptionId }
  | { type: "pickBrushingStyle"; style: BrushingStyleId }
  | { type: "addMore"; yes: boolean }
  | { type: "pickStaff"; staffId: string | null }
  | { type: "pickDate"; date: string }
  | { type: "pickSlot"; startAt: string; time: string; date: string }
  | { type: "pickPartySize"; partySize: number }
  | { type: "setDetails"; patch: Partial<CustomerDetails> }
  | { type: "goto"; step: StepId }
  | { type: "restore"; state: BookingState }
  | { type: "reset" };

function nextAfterCart(chooseStaff: boolean): StepId {
  return chooseStaff ? "staff" : "slot";
}

function commitPending(
  state: BookingState,
  options: {
    manicureOption?: ManicureOptionId | null;
    brushingStyle?: BrushingStyleId | null;
  } = {},
): BookingState {
  if (!state.pendingServiceId) return state;
  const item: CartItem = {
    serviceId: state.pendingServiceId,
    manicureOption: options.manicureOption ?? null,
    brushingStyle: options.brushingStyle ?? null,
  };
  return {
    ...state,
    items: [...state.items, item],
    pendingServiceId: null,
  };
}

export function reducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "pickService": {
      const chooseStaff = state.chooseStaff || action.chooseStaff;
      return {
        ...state,
        pendingServiceId: action.serviceId,
        chooseStaff,
        staffId: chooseStaff ? state.staffId : null,
        staffPicked: chooseStaff ? false : true,
        date: null,
        startAt: null,
        time: null,
        step: action.needsOptions ? "options" : "addMore",
      };
    }
    case "pickManicureOption": {
      const committed = commitPending(state, { manicureOption: action.option });
      return { ...committed, step: "addMore" };
    }
    case "pickBrushingStyle": {
      const committed = commitPending(state, { brushingStyle: action.style });
      return { ...committed, step: "addMore" };
    }
    case "addMore": {
      // Commit pending without finish options when arriving from a plain service path.
      const base =
        state.pendingServiceId && state.step === "addMore" ? commitPending(state) : state;
      if (action.yes) {
        return { ...base, pendingServiceId: null, step: "service" };
      }
      return {
        ...base,
        pendingServiceId: null,
        staffPicked: base.chooseStaff ? base.staffPicked : true,
        step: nextAfterCart(base.chooseStaff),
      };
    }
    case "pickStaff": {
      const changed = state.staffId !== action.staffId || !state.staffPicked;
      return {
        ...state,
        staffId: action.staffId,
        staffPicked: true,
        startAt: changed ? null : state.startAt,
        time: changed ? null : state.time,
        step: "slot",
      };
    }
    case "pickDate":
      return { ...state, date: action.date, startAt: null, time: null };
    case "pickSlot":
      return {
        ...state,
        date: action.date,
        startAt: action.startAt,
        time: action.time,
        step: "party",
      };
    case "pickPartySize":
      return {
        ...state,
        partySize: Math.min(3, Math.max(1, action.partySize)),
        step: "summary",
      };
    case "setDetails":
      return { ...state, details: { ...state.details, ...action.patch } };
    case "goto":
      return { ...state, step: action.step };
    case "restore":
      return { ...action.state, step: furthestReachable(action.state) };
    case "reset":
      return initialState;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

const STORAGE_KEY = "beautyley.booking.draft.v2";

/** Keeps the draft across reloads so "Modifier" never loses what was typed. */
export function saveDraft(state: BookingState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode or storage disabled — the flow still works in memory */
  }
}

export function loadDraft(): BookingState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BookingState>;
    if (!parsed || typeof parsed !== "object") return null;
    const items = Array.isArray(parsed.items)
      ? parsed.items
          .filter(
            (item): item is CartItem =>
              Boolean(item) &&
              typeof item === "object" &&
              typeof (item as CartItem).serviceId === "string",
          )
          .map((item) => ({
            serviceId: item.serviceId,
            manicureOption: item.manicureOption ?? null,
            brushingStyle: item.brushingStyle ?? null,
          }))
      : [];
    return {
      ...initialState,
      ...parsed,
      items,
      pendingServiceId:
        typeof parsed.pendingServiceId === "string" ? parsed.pendingServiceId : null,
      chooseStaff: Boolean(parsed.chooseStaff),
      partySize: Math.min(3, Math.max(1, Number(parsed.partySize) || 1)),
      details: { ...emptyDetails, ...parsed.details, acceptTerms: false },
    };
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("beautyley.booking.draft");
  } catch {
    /* nothing to clean up */
  }
}

export function stepIndex(step: StepId, chooseStaff = true) {
  return flowSteps(chooseStaff).indexOf(step);
}

export function flowSteps(chooseStaff: boolean): StepId[] {
  return STEPS.filter((step) => {
    if (step === "staff" && !chooseStaff) return false;
    return true;
  });
}

/**
 * Steps the current selection can actually render. Restoring a draft clamps to
 * this so a partial draft never lands on an empty screen.
 */
export function reachableSteps(
  state: Pick<
    BookingState,
    | "items"
    | "pendingServiceId"
    | "staffPicked"
    | "startAt"
    | "chooseStaff"
    | "partySize"
    | "step"
  >,
) {
  const reachable: StepId[] = ["service"];
  const hasCart = state.items.length > 0 || Boolean(state.pendingServiceId);
  if (state.pendingServiceId || state.items.length) reachable.push("options", "addMore");
  if (hasCart && state.chooseStaff) reachable.push("staff");
  if (hasCart && (!state.chooseStaff || state.staffPicked)) reachable.push("slot");
  if (state.startAt) reachable.push("party", "summary", "details");
  return reachable;
}

function furthestReachable(state: BookingState): StepId {
  const reachable = reachableSteps(state);
  return reachable.includes(state.step) ? state.step : reachable[reachable.length - 1];
}

/** Primary service used for availability (longest duration in the cart). */
export function primaryServiceId(items: CartItem[], durations: Map<string, number>): string | null {
  if (!items.length) return null;
  let best = items[0].serviceId;
  let bestDuration = durations.get(best) ?? 0;
  for (const item of items) {
    const duration = durations.get(item.serviceId) ?? 0;
    if (duration > bestDuration) {
      best = item.serviceId;
      bestDuration = duration;
    }
  }
  return best;
}
