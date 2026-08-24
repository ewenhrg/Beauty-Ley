import type {
  AppointmentDto,
  ApiError,
  CatalogDto,
  DayDto,
  SlotDto,
} from "./booking-types";

export class BookingApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "BookingApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new BookingApiError(
      "NETWORK",
      "Connexion impossible. Vérifiez votre réseau et réessayez.",
    );
  }

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const error = (payload as ApiError | null)?.error;
    throw new BookingApiError(
      error?.code ?? "SERVER_ERROR",
      error?.message ?? "Une erreur est survenue.",
      error?.field,
    );
  }
  return payload as T;
}

export function fetchCatalog(signal?: AbortSignal) {
  return request<CatalogDto>("/api/booking/catalog", { signal });
}

export function fetchAvailability(
  params: { serviceId: string; staffId?: string; from: string; days: number; withNext?: boolean },
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({
    serviceId: params.serviceId,
    from: params.from,
    days: String(params.days),
  });
  if (params.staffId) query.set("staffId", params.staffId);
  if (params.withNext) query.set("withNext", "1");
  return request<{ days: DayDto[]; maxAdvanceDays: number; nextOpenDay: string | null }>(
    `/api/booking/availability?${query}`,
    { signal },
  );
}

export function fetchSlots(
  params: { serviceId: string; staffId?: string; date: string },
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({ serviceId: params.serviceId, date: params.date });
  if (params.staffId) query.set("staffId", params.staffId);
  return request<{ date: string; slots: SlotDto[]; reason: DayDto["reason"]; label: string | null }>(
    `/api/booking/slots?${query}`,
    { signal },
  );
}

export type BookingPayload = {
  serviceId: string;
  staffId?: string;
  startAt: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  note: string | null;
  acceptTerms: boolean;
};

export function createAppointment(payload: BookingPayload) {
  return request<AppointmentDto>("/api/booking/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelAppointment(reference: string, token: string) {
  return request<AppointmentDto>(`/api/booking/appointments/${reference}/cancel`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function rescheduleAppointment(
  reference: string,
  token: string,
  startAt: string,
  staffId?: string,
) {
  return request<AppointmentDto>(`/api/booking/appointments/${reference}/reschedule`, {
    method: "POST",
    body: JSON.stringify({ token, startAt, staffId }),
  });
}
