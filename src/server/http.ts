import { NextResponse } from "next/server";
import { BookingError } from "./booking";
import { BookingUnavailableError } from "./db";
import { ValidationError } from "./validation";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(code: string, message: string, status: number, field?: string) {
  return NextResponse.json({ error: { code, message, field } }, { status });
}

const BOOKING_STATUS: Record<string, number> = {
  SERVICE_UNAVAILABLE: 409,
  SLOT_TAKEN: 409,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  TOO_LATE: 409,
  ALREADY_CANCELLED: 409,
};

/** Single place where server errors become client-readable French messages. */
export function toErrorResponse(error: unknown) {
  if (error instanceof ValidationError) {
    return jsonError("VALIDATION", error.message, 400, error.field);
  }
  if (error instanceof BookingError) {
    return jsonError(error.code, error.message, BOOKING_STATUS[error.code] ?? 400);
  }
  if (error instanceof BookingUnavailableError) {
    return jsonError("BOOKING_UNAVAILABLE", error.message, 503);
  }
  console.error("[booking]", error);
  return jsonError("SERVER_ERROR", "Une erreur est survenue. Merci de réessayer.", 500);
}

/** Wraps a handler so every throw becomes a structured JSON error. */
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
