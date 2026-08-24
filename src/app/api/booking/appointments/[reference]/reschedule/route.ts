import { describeAppointment, loadForCustomer, rescheduleBooking } from "@/server/booking";
import { handler, jsonError, jsonOk } from "@/server/http";
import { toAppointmentDto } from "@/server/presenters";
import { asIsoInstant, asString, readJson } from "@/server/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ reference: string }> };

export const POST = handler(async (request: Request, context: Context) => {
  const { reference } = await context.params;
  const body = await readJson(request);
  const token = asString(body.token, "token");
  const startAt = asIsoInstant(body.startAt, "startAt");
  const staffId = typeof body.staffId === "string" && body.staffId ? body.staffId : undefined;

  const appointment = await loadForCustomer(reference, token);
  const updated = await rescheduleBooking({ appointment, startAt, staffId, by: "customer" });
  const described = await describeAppointment(updated);

  if (!described.service || !described.staff || !described.customer) {
    return jsonError("NOT_FOUND", "Rendez-vous introuvable.", 404);
  }

  return jsonOk(
    toAppointmentDto({
      appointment: updated,
      service: described.service,
      staff: described.staff,
      customer: described.customer,
      settings: described.settings,
    }),
  );
});
