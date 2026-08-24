import { sendAppointmentEmail } from "@/server/booking";
import { handler, jsonError, jsonOk } from "@/server/http";
import { hasReminderBeenSent } from "@/server/notifications";
import { listAppointments } from "@/server/repo/appointments";

export const dynamic = "force-dynamic";

/**
 * Sends the 24 h reminder for every upcoming appointment. Wire it to a Vercel
 * Cron entry (or any scheduler) hitting this route hourly with the
 * `CRON_SECRET` bearer token.
 */
export const GET = handler(async (request: Request) => {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return jsonError("NOT_CONFIGURED", "CRON_SECRET n'est pas configuré.", 503);
  }
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (provided !== secret) {
    return jsonError("FORBIDDEN", "Jeton invalide.", 403);
  }

  const now = Date.now();
  const from = new Date(now + 23 * 3_600_000).toISOString();
  const to = new Date(now + 25 * 3_600_000).toISOString();

  const upcoming = await listAppointments({ from, to, blockingOnly: true });
  let sent = 0;

  for (const appointment of upcoming) {
    if (appointment.status === "CANCELLED") continue;
    if (await hasReminderBeenSent(appointment.id)) continue;
    await sendAppointmentEmail("reminder", appointment);
    sent += 1;
  }

  return jsonOk({ considered: upcoming.length, sent });
});
