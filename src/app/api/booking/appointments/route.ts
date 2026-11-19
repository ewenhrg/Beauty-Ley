import { createBooking, describeAppointment, sendAppointmentEmail } from "@/server/booking";
import {
  resolveBookingCart,
  type BookingCartItem,
  type BrushingStyleId,
  type ManicureOptionId,
} from "@/server/booking-cart";
import { handler, jsonError, jsonOk } from "@/server/http";
import { toAppointmentDto } from "@/server/presenters";
import {
  asInteger,
  asOptionalEmail,
  asOptionalString,
  asPhone,
  asString,
  asIsoInstant,
  readJson,
  ValidationError,
} from "@/server/validation";

export const dynamic = "force-dynamic";

const MANICURE_OPTIONS: ManicureOptionId[] = ["nail-art", "french", "none"];
const BRUSHING_STYLES: BrushingStyleId[] = ["lisse", "wavy"];

function parseCartItems(body: Record<string, unknown>): BookingCartItem[] {
  if (Array.isArray(body.items) && body.items.length) {
    return body.items.map((raw, index) => {
      if (!raw || typeof raw !== "object") {
        throw new ValidationError("Panier invalide.", `items.${index}`);
      }
      const item = raw as Record<string, unknown>;
      const serviceId = asString(item.serviceId, `items.${index}.serviceId`);

      const optionRaw = item.manicureOption;
      let manicureOption: ManicureOptionId | null = null;
      if (optionRaw === null || optionRaw === undefined || optionRaw === "") {
        manicureOption = null;
      } else if (
        typeof optionRaw === "string" &&
        MANICURE_OPTIONS.includes(optionRaw as ManicureOptionId)
      ) {
        manicureOption = optionRaw as ManicureOptionId;
      } else {
        throw new ValidationError("Option manucure invalide.", `items.${index}.manicureOption`);
      }

      const styleRaw = item.brushingStyle;
      let brushingStyle: BrushingStyleId | null = null;
      if (styleRaw === null || styleRaw === undefined || styleRaw === "") {
        brushingStyle = null;
      } else if (
        typeof styleRaw === "string" &&
        BRUSHING_STYLES.includes(styleRaw as BrushingStyleId)
      ) {
        brushingStyle = styleRaw as BrushingStyleId;
      } else {
        throw new ValidationError("Style brushing invalide.", `items.${index}.brushingStyle`);
      }

      return { serviceId, manicureOption, brushingStyle };
    });
  }

  // Legacy single-service payload.
  return [
    {
      serviceId: asString(body.serviceId, "serviceId"),
      manicureOption: null,
      brushingStyle: null,
    },
  ];
}

export const POST = handler(async (request: Request) => {
  const body = await readJson(request);

  if (body.acceptTerms !== true) {
    throw new ValidationError("Merci d'accepter les conditions de réservation.", "acceptTerms");
  }

  const items = parseCartItems(body);
  const partySize = body.partySize === undefined ? 1 : asInteger(body.partySize, "partySize", {
    min: 1,
    max: 3,
  });
  const customerNote = asOptionalString(body.note, "note", 600);

  const cart = await resolveBookingCart(items, partySize, customerNote);
  if (!cart) {
    throw new ValidationError("Prestations introuvables ou indisponibles.", "serviceId");
  }

  const { appointment } = await createBooking({
    serviceId: cart.primaryService.id,
    staffId: typeof body.staffId === "string" && body.staffId ? body.staffId : undefined,
    startAt: asIsoInstant(body.startAt, "startAt"),
    durationMin: cart.durationMin,
    price: cart.price,
    customer: {
      firstName: asString(body.firstName, "firstName", { max: 60 }),
      lastName: asString(body.lastName, "lastName", { max: 60 }),
      phone: asPhone(body.phone),
      email: asOptionalEmail(body.email),
      note: cart.note || null,
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
