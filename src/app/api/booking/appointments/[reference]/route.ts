import { describeAppointment, loadForCustomer } from "@/server/booking";
import { handler, jsonError, jsonOk } from "@/server/http";
import { toAppointmentDto } from "@/server/presenters";
import { asString } from "@/server/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ reference: string }> };

export const GET = handler(async (request: Request, context: Context) => {
  const { reference } = await context.params;
  const token = asString(new URL(request.url).searchParams.get("t"), "t");
  const appointment = await loadForCustomer(reference, token);
  const described = await describeAppointment(appointment);

  if (!described.service || !described.staff || !described.customer) {
    return jsonError("NOT_FOUND", "Rendez-vous introuvable.", 404);
  }

  return jsonOk(
    toAppointmentDto({
      appointment,
      service: described.service,
      staff: described.staff,
      customer: described.customer,
      settings: described.settings,
    }),
  );
});
