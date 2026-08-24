import { getAvailabilityRange, findNextOpenDay } from "@/server/availability";
import { handler, jsonOk } from "@/server/http";
import { asDateKey, asString, ValidationError } from "@/server/validation";
import { todayKey } from "@/lib/time";

export const dynamic = "force-dynamic";

/** Day-by-day availability for the calendar strip. */
export const GET = handler(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const serviceId = asString(params.get("serviceId"), "serviceId");
  const staffId = params.get("staffId") || undefined;
  const from = params.get("from") ? asDateKey(params.get("from"), "from") : todayKey();
  const days = Math.min(Math.max(Number(params.get("days") ?? 14), 1), 45);
  if (!Number.isFinite(days)) throw new ValidationError("Nombre de jours invalide.", "days");

  const [range, nextOpen] = await Promise.all([
    getAvailabilityRange(serviceId, from, days, staffId),
    params.get("withNext") === "1" ? findNextOpenDay(serviceId, staffId) : Promise.resolve(null),
  ]);

  return jsonOk({ ...range, nextOpenDay: nextOpen });
});
