"use client";

export type CustomerDetails = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  note: string;
  acceptTerms: boolean;
};

export const STEPS = ["service", "staff", "slot", "summary", "details"] as const;
export type StepId = (typeof STEPS)[number];

export type BookingState = {
  step: StepId;
  serviceId: string | null;
  /** `null` is a deliberate "peu importe"; `staffPicked` tells the two apart. */
  staffId: string | null;
  staffPicked: boolean;
  /** Hair services only — nails, lashes, etc. skip this step. */
  chooseStaff: boolean;
  date: string | null;
  startAt: string | null;
  time: string | null;
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
  serviceId: null,
  staffId: null,
  staffPicked: false,
  chooseStaff: false,
  date: null,
  startAt: null,
  time: null,
  details: emptyDetails,
};

export type BookingAction =
  | { type: "pickService"; serviceId: string; chooseStaff: boolean }
  | { type: "pickStaff"; staffId: string | null }
  | { type: "pickDate"; date: string }
  | { type: "pickSlot"; startAt: string; time: string; date: string }
  | { type: "setDetails"; patch: Partial<CustomerDetails> }
  | { type: "goto"; step: StepId }
  | { type: "restore"; state: BookingState }
  | { type: "reset" };

export function reducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "pickService": {
      // Changing the prestation invalidates every downstream choice.
      const changed = state.serviceId !== action.serviceId;
      return {
        ...state,
        serviceId: action.serviceId,
        chooseStaff: action.chooseStaff,
        staffId: changed ? null : state.staffId,
        staffPicked: changed ? !action.chooseStaff : action.chooseStaff ? state.staffPicked : true,
        date: changed ? null : state.date,
        startAt: changed ? null : state.startAt,
        time: changed ? null : state.time,
        step: action.chooseStaff ? "staff" : "slot",
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
  }
}

const STORAGE_KEY = "beautyley.booking.draft";

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
    return {
      ...initialState,
      ...parsed,
      chooseStaff: Boolean(parsed.chooseStaff),
      details: { ...emptyDetails, ...parsed.details, acceptTerms: false },
    };
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clean up */
  }
}

export function stepIndex(step: StepId, chooseStaff = true) {
  return flowSteps(chooseStaff).indexOf(step);
}

export function flowSteps(chooseStaff: boolean): StepId[] {
  return chooseStaff ? [...STEPS] : STEPS.filter((step) => step !== "staff");
}

/**
 * Steps the current selection can actually render. Restoring a draft clamps to
 * this so a partial draft never lands on an empty screen.
 */
export function reachableSteps(
  state: Pick<BookingState, "serviceId" | "staffPicked" | "startAt" | "chooseStaff">,
) {
  const reachable: StepId[] = ["service"];
  if (state.serviceId && state.chooseStaff) reachable.push("staff");
  if (state.serviceId && (!state.chooseStaff || state.staffPicked)) reachable.push("slot");
  if (state.startAt) reachable.push("summary", "details");
  return reachable;
}

function furthestReachable(state: BookingState): StepId {
  const reachable = reachableSteps(state);
  return reachable.includes(state.step) ? state.step : reachable[reachable.length - 1];
}
