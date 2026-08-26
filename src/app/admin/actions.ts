"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_PAGE_IDS,
  agendaStaffId,
  authenticate,
  createSessionValue,
  firstAdminHref,
  hashPassword,
  sessionCookieOptions,
  type AdminPageId,
} from "@/server/auth";
import { OWNER_USERNAMES } from "@/server/admin-pages";
import { requirePage, requireSession } from "@/server/access";
import {
  BookingError,
  createBooking,
  moveAppointment,
  sendAppointmentEmail,
  setAppointmentStatus,
} from "@/server/booking";
import { APPOINTMENT_STATUSES } from "@/server/db/types";
import type {
  BusinessClosureRow,
  ServiceCategoryRow,
  ServiceRow,
  StaffRow,
  StaffTimeOffRow,
} from "@/server/db/types";
import { newId, slugify } from "@/server/ids";
import type { AdminUserRow } from "@/server/db/types";
import {
  createCategory,
  createService,
  createStaff,
  deleteCategory,
  deleteService,
  deleteStaff,
  setServiceStaff,
  setStaffServices,
  updateCategory,
  updateService,
  updateStaff,
  upsertStaffFromAccount,
  listStaff,
} from "@/server/repo/catalog";
import { deleteAppointment, getAppointment, updateAppointment } from "@/server/repo/appointments";
import { deleteCustomer, updateCustomer } from "@/server/repo/customers";
import {
  createUser,
  deleteUser,
  findUserByUsername,
  getUser,
  updateUser,
  UsersTableMissingError,
} from "@/server/repo/users";
import {
  createClosure,
  createTimeOff,
  deleteClosure,
  deleteTimeOff,
  replaceStaffSchedules,
  updateBusinessHours,
} from "@/server/repo/schedule";
import { updateSettings } from "@/server/repo/settings";
import { availablePaymentModes } from "@/server/payments";
import {
  asEnum,
  asInteger,
  asOptionalEmail,
  asOptionalString,
  asPhone,
  asString,
  ValidationError,
} from "@/server/validation";
import { labelToMinutes, wallToInstant } from "@/lib/time";
import type { ActionState } from "./action-state";

async function guard(...pages: AdminPageId[]) {
  if (!pages.length) return requireSession();
  return requirePage(...pages);
}

async function assertOwnAppointment(session: Awaited<ReturnType<typeof guard>>, appointmentId: string) {
  const locked = agendaStaffId(session);
  if (!locked) return;
  const appointment = await getAppointment(appointmentId);
  if (!appointment || appointment.staff_id !== locked) {
    throw new ValidationError("Ce rendez-vous n'est pas dans votre planning.");
  }
}

/** Wraps an action so validation failures surface as form messages. */
async function run(fn: () => Promise<string | void>, paths: string[]): Promise<ActionState> {
  try {
    const message = await fn();
    for (const path of paths) revalidatePath(path);
    return { ok: true, message: message ?? null };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof BookingError || error instanceof UsersTableMissingError) {
      return { ok: false, message: error.message };
    }
    console.error("[admin]", error);
    return { ok: false, message: "Une erreur est survenue." };
  }
}

const ADMIN_PATHS = ["/admin", "/admin/calendrier", "/admin/rendez-vous"];

/* -------------------------------------------------------------------------- */
/* Session                                                                     */
/* -------------------------------------------------------------------------- */

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const session = await authenticate(username, password);
  if (!session) {
    return { ok: false, message: "Identifiant ou mot de passe incorrect." };
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSessionValue(session.id), sessionCookieOptions);
  redirect(firstAdminHref(session));
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* Appointments                                                                */
/* -------------------------------------------------------------------------- */

export async function changeStatusAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await guard("calendrier", "rendez-vous");
  return run(async () => {
    const id = asString(formData.get("id"), "id");
    await assertOwnAppointment(session, id);
    const status = asEnum(formData.get("status"), APPOINTMENT_STATUSES, "status");
    await setAppointmentStatus(id, status);
    return "Statut mis à jour.";
  }, ADMIN_PATHS);
}

export async function moveAppointmentAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await guard("calendrier", "rendez-vous");
  return run(async () => {
    const id = asString(formData.get("id"), "id");
    await assertOwnAppointment(session, id);
    const date = asString(formData.get("date"), "date", { max: 10 });
    const time = asString(formData.get("time"), "time", { max: 5 });
    const locked = agendaStaffId(session);
    const staffId = locked ?? asOptionalString(formData.get("staffId"), "staffId", 80);
    const startAt = wallToInstant(date, labelToMinutes(time)).toISOString();
    const updated = await moveAppointment({
      appointmentId: id,
      startAt,
      staffId: staffId ?? undefined,
    });
    await sendAppointmentEmail("reschedule", updated, { notifyAssignee: true });
    return "Personne attribuée. Notification envoyée sur son téléphone.";
  }, ADMIN_PATHS);
}

export async function updateAppointmentNoteAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await guard("calendrier", "rendez-vous");
  return run(async () => {
    const id = asString(formData.get("id"), "id");
    await assertOwnAppointment(session, id);
    await updateAppointment(id, {
      admin_note: asOptionalString(formData.get("adminNote"), "adminNote", 1000),
    });
    return "Note enregistrée.";
  }, ADMIN_PATHS);
}

export async function createAppointmentAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await guard("calendrier", "rendez-vous");
  return run(async () => {
    const date = asString(formData.get("date"), "date", { max: 10 });
    const time = asString(formData.get("time"), "time", { max: 5 });
    const startAt = wallToInstant(date, labelToMinutes(time)).toISOString();
    const locked = agendaStaffId(session);
    const staffId = locked ?? asString(formData.get("staffId"), "staffId", { max: 80 });

    const { appointment } = await createBooking({
      serviceId: asString(formData.get("serviceId"), "serviceId"),
      staffId,
      startAt,
      customer: {
        firstName: asString(formData.get("firstName"), "firstName", { max: 60 }),
        lastName: asString(formData.get("lastName"), "lastName", { max: 60 }),
        phone: asPhone(formData.get("phone")),
        email: asOptionalEmail(formData.get("email")),
        note: asOptionalString(formData.get("note"), "note", 600),
      },
      source: "admin",
    });
    await sendAppointmentEmail("confirmation", appointment, { notifyAssignee: true });
    return `Rendez-vous créé (${appointment.reference}). Notification envoyée.`;
  }, ADMIN_PATHS);
}

export async function deleteAppointmentAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await guard("calendrier", "rendez-vous");
  return run(async () => {
    const id = asString(formData.get("id"), "id");
    await assertOwnAppointment(session, id);
    const appointment = await getAppointment(id);
    if (!appointment) throw new ValidationError("Rendez-vous introuvable.");
    await deleteAppointment(id);
    return "Rendez-vous supprimé.";
  }, ADMIN_PATHS);
}

export async function resendConfirmationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await guard("calendrier", "rendez-vous");
  return run(async () => {
    const id = asString(formData.get("id"), "id");
    await assertOwnAppointment(session, id);
    const appointment = await getAppointment(id);
    if (!appointment) throw new ValidationError("Rendez-vous introuvable.");
    const result = await sendAppointmentEmail("confirmation", appointment);
    if (!result) return "Ce client n'a pas d'adresse email.";
    return result.status === "sent"
      ? "Confirmation renvoyée."
      : "Message enregistré, mais aucun fournisseur email n'est configuré.";
  }, ADMIN_PATHS);
}

/* -------------------------------------------------------------------------- */
/* Customers                                                                   */
/* -------------------------------------------------------------------------- */

export async function updateCustomerAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("clients");
  return run(async () => {
    const id = asString(formData.get("id"), "id");
    await updateCustomer(id, {
      first_name: asString(formData.get("firstName"), "firstName", { max: 60 }),
      last_name: asString(formData.get("lastName"), "lastName", { max: 60 }),
      phone: asPhone(formData.get("phone")),
      email: asOptionalEmail(formData.get("email")),
      notes: asOptionalString(formData.get("notes"), "notes", 2000),
    });
    return "Fiche client mise à jour.";
  }, ["/admin/clients", `/admin/clients/${formData.get("id")}`]);
}

export async function deleteCustomerAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("clients");
  const id = asString(formData.get("id"), "id");
  const result = await run(async () => {
    await deleteCustomer(id);
  }, ["/admin/clients"]);
  if (result.ok) redirect("/admin/clients");
  return result;
}

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                   */
/* -------------------------------------------------------------------------- */

export async function saveCategoryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("prestations");
  return run(async () => {
    const id = asOptionalString(formData.get("id"), "id", 80);
    const name = asString(formData.get("name"), "name", { max: 60 });
    const patch: Partial<ServiceCategoryRow> = {
      name,
      slug: slugify(name),
      description: asOptionalString(formData.get("description"), "description", 300),
      image: asOptionalString(formData.get("image"), "image", 300),
      sort_order: asInteger(formData.get("sortOrder") ?? 0, "sortOrder", { min: 0, max: 999 }),
      active: formData.get("active") === "on",
    };

    if (id) {
      await updateCategory(id, patch);
      return "Catégorie mise à jour.";
    }
    await createCategory({ id: newId("cat"), ...patch } as ServiceCategoryRow);
    return "Catégorie créée.";
  }, ["/admin/prestations"]);
}

export async function deleteCategoryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("prestations");
  return run(async () => {
    await deleteCategory(asString(formData.get("id"), "id"));
    return "Catégorie supprimée.";
  }, ["/admin/prestations"]);
}

export async function saveServiceAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("prestations");
  return run(async () => {
    const id = asOptionalString(formData.get("id"), "id", 80);
    const staffIds = formData.getAll("staffIds").map(String).filter(Boolean);

    const patch: Partial<ServiceRow> = {
      category_id: asString(formData.get("categoryId"), "categoryId"),
      name: asString(formData.get("name"), "name", { max: 120 }),
      description: asOptionalString(formData.get("description"), "description", 400),
      duration_min: asInteger(formData.get("duration"), "duration", { min: 5, max: 600 }),
      buffer_min: asInteger(formData.get("buffer") ?? 0, "buffer", { min: 0, max: 120 }),
      price: asInteger(formData.get("price"), "price", { min: 0, max: 1_000_000 }),
      price_kind: asEnum(formData.get("priceKind"), ["fixed", "from"] as const, "priceKind"),
      image: asOptionalString(formData.get("image"), "image", 300),
      sort_order: asInteger(formData.get("sortOrder") ?? 0, "sortOrder", { min: 0, max: 999 }),
      active: formData.get("active") === "on",
    };

    const serviceId = id ?? newId("svc");
    if (id) {
      await updateService(id, patch);
    } else {
      await createService({ id: serviceId, ...patch } as ServiceRow);
    }
    await setServiceStaff(serviceId, staffIds);
    return id ? "Prestation mise à jour." : "Prestation créée.";
  }, ["/admin/prestations", "/prestations"]);
}

export async function deleteServiceAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("prestations");
  return run(async () => {
    await deleteService(asString(formData.get("id"), "id"));
    return "Prestation supprimée.";
  }, ["/admin/prestations"]);
}

/* -------------------------------------------------------------------------- */
/* Team                                                                        */
/* -------------------------------------------------------------------------- */

export async function saveStaffAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("equipe");
  return run(async () => {
    const id = asOptionalString(formData.get("id"), "id", 80);
    const patch: Partial<StaffRow> = {
      first_name: asString(formData.get("firstName"), "firstName", { max: 60 }),
      last_name: asOptionalString(formData.get("lastName"), "lastName", 60),
      role: asOptionalString(formData.get("role"), "role", 80),
      bio: asOptionalString(formData.get("bio"), "bio", 600),
      photo: asOptionalString(formData.get("photo"), "photo", 300),
      color: asOptionalString(formData.get("color"), "color", 20) ?? "#c17a5c",
      sort_order: asInteger(formData.get("sortOrder") ?? 0, "sortOrder", { min: 0, max: 999 }),
      active: formData.get("active") === "on",
    };

    const staffId = id ?? newId("stf");
    if (id) {
      await updateStaff(id, patch);
    } else {
      await createStaff({ id: staffId, ...patch } as StaffRow);
    }

    const serviceIds = formData.getAll("serviceIds").map(String).filter(Boolean);
    if (serviceIds.length || id) await setStaffServices(staffId, serviceIds);

    return id ? "Profil mis à jour." : "Membre ajouté.";
  }, ["/admin/equipe"]);
}

export async function deleteStaffAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("equipe");
  const id = asString(formData.get("id"), "id");
  const result = await run(async () => {
    await deleteStaff(id);
  }, ["/admin/equipe"]);
  if (result.ok) redirect("/admin/equipe");
  return result;
}

export async function saveScheduleAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("equipe");
  return run(async () => {
    const staffId = asString(formData.get("staffId"), "staffId");
    const windows: Array<{ weekday: number; start_min: number; end_min: number }> = [];

    for (let weekday = 0; weekday < 7; weekday += 1) {
      if (formData.get(`off-${weekday}`) === "on") continue;
      for (const suffix of ["a", "b"]) {
        const start = String(formData.get(`start-${weekday}-${suffix}`) ?? "");
        const end = String(formData.get(`end-${weekday}-${suffix}`) ?? "");
        if (!start || !end) continue;
        const startMin = labelToMinutes(start);
        const endMin = labelToMinutes(end);
        if (endMin <= startMin) {
          throw new ValidationError("L'heure de fin doit suivre l'heure de début.");
        }
        windows.push({ weekday, start_min: startMin, end_min: endMin });
      }
    }

    await replaceStaffSchedules(staffId, windows);
    return "Planning enregistré.";
  }, ["/admin/equipe", "/admin/calendrier"]);
}

export async function createTimeOffAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("equipe");
  return run(async () => {
    const staffId = asString(formData.get("staffId"), "staffId");
    const startDate = asString(formData.get("startDate"), "startDate", { max: 10 });
    const endDate = asString(formData.get("endDate"), "endDate", { max: 10 });
    const startTime = String(formData.get("startTime") || "00:00");
    const endTime = String(formData.get("endTime") || "23:59");

    const start = wallToInstant(startDate, labelToMinutes(startTime));
    const end = wallToInstant(endDate, labelToMinutes(endTime));
    if (end <= start) throw new ValidationError("La fin doit suivre le début.");

    const row: StaffTimeOffRow = {
      id: newId("off"),
      staff_id: staffId,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      reason: asOptionalString(formData.get("reason"), "reason", 200),
    };
    await createTimeOff(row);
    return "Indisponibilité enregistrée.";
  }, ["/admin/equipe", "/admin/calendrier"]);
}

export async function deleteTimeOffAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("equipe");
  return run(async () => {
    await deleteTimeOff(asString(formData.get("id"), "id"));
    return "Indisponibilité supprimée.";
  }, ["/admin/equipe", "/admin/calendrier"]);
}

/* -------------------------------------------------------------------------- */
/* Opening hours, closures and settings                                        */
/* -------------------------------------------------------------------------- */

export async function saveBusinessHoursAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("parametres");
  return run(async () => {
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const id = String(formData.get(`id-${weekday}`) ?? "");
      if (!id) continue;
      const closed = formData.get(`closed-${weekday}`) === "on";
      const open = String(formData.get(`open-${weekday}`) || "10:00");
      const close = String(formData.get(`close-${weekday}`) || "20:00");
      if (!closed && labelToMinutes(close) <= labelToMinutes(open)) {
        throw new ValidationError("L'heure de fermeture doit suivre l'ouverture.");
      }
      await updateBusinessHours(id, {
        closed,
        open_min: labelToMinutes(open),
        close_min: labelToMinutes(close),
      });
    }
    return "Horaires enregistrés.";
  }, ["/admin/parametres", "/admin/calendrier"]);
}

export async function createClosureAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("parametres");
  return run(async () => {
    const startDate = asString(formData.get("startDate"), "startDate", { max: 10 });
    const endDate = asString(formData.get("endDate"), "endDate", { max: 10 });
    if (endDate < startDate) throw new ValidationError("La fin doit suivre le début.");
    const row: BusinessClosureRow = {
      id: newId("clo"),
      start_date: startDate,
      end_date: endDate,
      label: asString(formData.get("label"), "label", { max: 120 }),
    };
    await createClosure(row);
    return "Fermeture enregistrée.";
  }, ["/admin/parametres", "/admin/calendrier"]);
}

export async function deleteClosureAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("parametres");
  return run(async () => {
    await deleteClosure(asString(formData.get("id"), "id"));
    return "Fermeture supprimée.";
  }, ["/admin/parametres", "/admin/calendrier"]);
}

export async function saveSettingsAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("parametres");
  return run(async () => {
    const modes = availablePaymentModes();
    const requestedMode = String(formData.get("paymentMode") ?? "onsite");
    if (!modes.includes(requestedMode as (typeof modes)[number])) {
      throw new ValidationError(
        "Ce mode de paiement nécessite une configuration Stripe (STRIPE_SECRET_KEY).",
      );
    }

    await updateSettings({
      slot_granularity_min: asInteger(formData.get("granularity"), "granularity", {
        min: 5,
        max: 60,
      }),
      min_notice_min: asInteger(formData.get("minNotice"), "minNotice", { min: 0, max: 10_080 }),
      max_advance_days: asInteger(formData.get("maxAdvance"), "maxAdvance", { min: 1, max: 365 }),
      cancellation_window_hours: asInteger(formData.get("cancellation"), "cancellation", {
        min: 0,
        max: 336,
      }),
      auto_confirm: formData.get("autoConfirm") === "on",
      payment_mode: requestedMode as (typeof modes)[number],
      deposit_percent: asInteger(formData.get("depositPercent") ?? 30, "depositPercent", {
        min: 0,
        max: 100,
      }),
      booking_terms: asString(formData.get("terms"), "terms", { max: 1000 }),
      salon_email: asOptionalEmail(formData.get("salonEmail"), "salonEmail"),
      salon_phone: asOptionalString(formData.get("salonPhone"), "salonPhone", 32),
    });
    return "Paramètres enregistrés.";
  }, ["/admin/parametres", "/reservation"]);
}

/* -------------------------------------------------------------------------- */
/* Team logins                                                                 */
/* -------------------------------------------------------------------------- */

function parseUsername(value: FormDataEntryValue | null) {
  const username = asString(value, "username", { min: 3, max: 32 }).toLowerCase();
  if (OWNER_USERNAMES.has(username)) {
    throw new ValidationError("Cet identifiant est réservé au compte administrateur.");
  }
  if (!/^[a-z0-9._-]+$/.test(username)) {
    throw new ValidationError("Identifiant : lettres, chiffres, point, tiret ou underscore.");
  }
  return username;
}

function parsePages(formData: FormData): AdminPageId[] {
  const allowed = new Set<string>(ADMIN_PAGE_IDS.filter((page) => page !== "comptes"));
  const pages = formData
    .getAll("pages")
    .map(String)
    .filter((page): page is AdminPageId => allowed.has(page));
  if (!pages.length) {
    throw new ValidationError("Cochez au moins une page.");
  }
  return pages;
}

export async function saveUserAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("comptes");
  return run(async () => {
    const id = asOptionalString(formData.get("id"), "id", 80);
    const username = parseUsername(formData.get("username"));
    const password = String(formData.get("password") ?? "");
    const existing = await findUserByUsername(username);
    if (existing && existing.id !== id) {
      throw new ValidationError("Cet identifiant est déjà utilisé.");
    }
    if (!id && password.length < 6) {
      throw new ValidationError("Mot de passe : 6 caractères minimum.");
    }
    if (id && password && password.length < 6) {
      throw new ValidationError("Mot de passe : 6 caractères minimum.");
    }

    const displayName = asString(formData.get("displayName"), "displayName", { max: 80 });
    await listStaff();
    const current = id ? await getUser(id) : null;
    if (id && !current) throw new ValidationError("Compte introuvable.");
    const staffId = await upsertStaffFromAccount(current?.staff_id ?? null, displayName);
    const patch: Partial<AdminUserRow> = {
      username,
      display_name: displayName,
      pages: parsePages(formData),
      staff_id: staffId,
      own_agenda: formData.get("ownAgenda") === "on",
      active: formData.get("active") === "on",
      updated_at: new Date().toISOString(),
    };
    if (password) patch.password_hash = hashPassword(password);

    if (id) {
      await updateUser(id, patch);
      return "Compte mis à jour.";
    }

    await createUser({
      id: newId("usr"),
      username,
      display_name: displayName,
      password_hash: patch.password_hash as string,
      pages: patch.pages as AdminPageId[],
      staff_id: staffId,
      own_agenda: Boolean(patch.own_agenda),
      active: patch.active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return "Compte créé.";
  }, ["/admin/comptes"]);
}

export async function deleteUserAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard("comptes");
  return run(async () => {
    await deleteUser(asString(formData.get("id"), "id"));
    return "Compte supprimé.";
  }, ["/admin/comptes"]);
}
