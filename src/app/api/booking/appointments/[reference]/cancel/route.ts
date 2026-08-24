import { cancelBooking, describeAppointment, loadForCustomer } from "@/server/booking";
import { handler, jsonError, jsonOk } from "@/server/http";
import { toAppointmentDto } from "@/server/presenters";
import { asString, readJson } from "@/server/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ reference: string }> };

export const POST = handler(async (request: Request, context: Context) => {
  const { reference } = await context.params;
  const body = await readJson(request);
  const token = asString(body.token, "token");

  const appointment = await loadForCustomer(reference, token);
  const cancelled = await cancelBooking({ appointment, by: "customer" });
  const described = await describeAppointment(cancelled);

  if (!described.service || !described.staff || !described.customer) {
    return jsonError("NOT_FOUND", "Rendez-vous introuvable.", 404);
  }

  return jsonOk(
    toAppointmentDto({
      appointment: cancelled,
      service: described.service,
      staff: described.staff,
      customer: described.customer,
      settings: described.settings,
    }),
  );
});
