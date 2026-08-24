import { createBooking, describeAppointment, sendAppointmentEmail } from "@/server/booking";
import { handler, jsonError, jsonOk } from "@/server/http";
import { toAppointmentDto } from "@/server/presenters";
import {
  asOptionalEmail,
  asOptionalString,
  asPhone,
  asString,
  asIsoInstant,
  readJson,
  ValidationError,
} from "@/server/validation";

export const dynamic = "force-dynamic";

export const POST = handler(async (request: Request) => {
  const body = await readJson(request);

  if (body.acceptTerms !== true) {
    throw new ValidationError("Merci d'accepter les conditions de réservation.", "acceptTerms");
  }

  const { appointment } = await createBooking({
    serviceId: asString(body.serviceId, "serviceId"),
    staffId: typeof body.staffId === "string" && body.staffId ? body.staffId : undefined,
    startAt: asIsoInstant(body.startAt, "startAt"),
    customer: {
      firstName: asString(body.firstName, "firstName", { max: 60 }),
      lastName: asString(body.lastName, "lastName", { max: 60 }),
      phone: asPhone(body.phone),
      email: asOptionalEmail(body.email),
      note: asOptionalString(body.note, "note", 600),
    },
  });

  const delivery = await sendAppointmentEmail("confirmation", appointment);

  const described = await describeAppointment(appointment);
  if (!described.service || !described.staff || !described.customer) {
    return jsonError("SERVER_ERROR", "Rendez-vous incomplet.", 500);
  }

  return jsonOk(
    toAppointmentDto({
      appointment,
      service: described.service,
      staff: described.staff,
      customer: described.customer,
      settings: described.settings,
      confirmationSent: delivery?.status === "sent",
    }),
    { status: 201 },
  );
});
