import { getSlots } from "@/server/availability";
import { handler, jsonOk } from "@/server/http";
import { asDateKey, asString } from "@/server/validation";

export const dynamic = "force-dynamic";

/** Bookable start times for one service on one day. */
export const GET = handler(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const serviceId = asString(params.get("serviceId"), "serviceId");
  const date = asDateKey(params.get("date"), "date");
  const staffId = params.get("staffId") || undefined;

  const result = await getSlots(serviceId, date, staffId);
  return jsonOk(result);
});
