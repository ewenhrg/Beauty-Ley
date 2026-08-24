import { getStore } from "../db";
import type {
  ServiceCategoryRow,
  ServiceRow,
  StaffRow,
  StaffServiceRow,
} from "../db/types";
import { ensureSeeded } from "./bootstrap";

export async function listCategories(options: { activeOnly?: boolean } = {}) {
  await ensureSeeded();
  const rows = await getStore().select("service_categories", {
    ...(options.activeOnly ? { eq: { active: true } } : {}),
    order: { column: "sort_order" },
  });
  return rows;
}

export async function listServices(options: { activeOnly?: boolean } = {}) {
  await ensureSeeded();
  return getStore().select("services", {
    ...(options.activeOnly ? { eq: { active: true } } : {}),
    order: { column: "sort_order" },
  });
}

export async function getService(id: string) {
  await ensureSeeded();
  const rows = await getStore().select("services", { eq: { id }, limit: 1 });
  return rows[0] ?? null;
}

export async function listStaff(options: { activeOnly?: boolean } = {}) {
  await ensureSeeded();
  return getStore().select("staff", {
    ...(options.activeOnly ? { eq: { active: true } } : {}),
    order: { column: "sort_order" },
  });
}

export async function getStaff(id: string) {
  await ensureSeeded();
  const rows = await getStore().select("staff", { eq: { id }, limit: 1 });
  return rows[0] ?? null;
}

export async function listStaffServices() {
  await ensureSeeded();
  return getStore().select("staff_services");
}

/** Staff members allowed to perform a service, in display order. */
export async function listStaffForService(serviceId: string, options: { activeOnly?: boolean } = {}) {
  const [links, staff] = await Promise.all([
    getStore().select("staff_services", { eq: { service_id: serviceId } }),
    listStaff(options),
  ]);
  const allowed = new Set(links.map((link) => link.staff_id));
  return staff.filter((member) => allowed.has(member.id));
}

export async function setStaffServices(staffId: string, serviceIds: string[]) {
  const store = getStore();
  const existing = await store.select("staff_services", { eq: { staff_id: staffId } });
  const keep = new Set(serviceIds);

  for (const link of existing) {
    if (!keep.has(link.service_id)) await store.remove("staff_services", link.id);
  }
  const present = new Set(existing.map((link) => link.service_id));
  const added = serviceIds
    .filter((serviceId) => !present.has(serviceId))
    .map<StaffServiceRow>((serviceId) => ({
      id: `link-${staffId}-${serviceId}`,
      staff_id: staffId,
      service_id: serviceId,
    }));
  if (added.length) await store.insert("staff_services", added);
}

export async function setServiceStaff(serviceId: string, staffIds: string[]) {
  const store = getStore();
  const existing = await store.select("staff_services", { eq: { service_id: serviceId } });
  const keep = new Set(staffIds);

  for (const link of existing) {
    if (!keep.has(link.staff_id)) await store.remove("staff_services", link.id);
  }
  const present = new Set(existing.map((link) => link.staff_id));
  const added = staffIds
    .filter((staffId) => !present.has(staffId))
    .map<StaffServiceRow>((staffId) => ({
      id: `link-${staffId}-${serviceId}`,
      staff_id: staffId,
      service_id: serviceId,
    }));
  if (added.length) await store.insert("staff_services", added);
}

export async function createCategory(row: ServiceCategoryRow) {
  const [created] = await getStore().insert("service_categories", [row]);
  return created ?? row;
}

export async function updateCategory(id: string, patch: Partial<ServiceCategoryRow>) {
  return getStore().update("service_categories", id, patch);
}

export async function deleteCategory(id: string) {
  const store = getStore();
  const services = await store.select("services", { eq: { category_id: id } });
  if (services.length) {
    throw new Error("Cette catégorie contient encore des prestations.");
  }
  await store.remove("service_categories", id);
}

export async function createService(row: ServiceRow) {
  const [created] = await getStore().insert("services", [row]);
  return created ?? row;
}

export async function updateService(id: string, patch: Partial<ServiceRow>) {
  return getStore().update("services", id, patch);
}

export async function deleteService(id: string) {
  const store = getStore();
  const links = await store.select("staff_services", { eq: { service_id: id } });
  for (const link of links) await store.remove("staff_services", link.id);
  await store.remove("services", id);
}

export async function createStaff(row: StaffRow) {
  const [created] = await getStore().insert("staff", [row]);
  return created ?? row;
}

export async function updateStaff(id: string, patch: Partial<StaffRow>) {
  return getStore().update("staff", id, patch);
}

export async function deleteStaff(id: string) {
  const store = getStore();
  const links = await store.select("staff_services", { eq: { staff_id: id } });
  for (const link of links) await store.remove("staff_services", link.id);
  const schedules = await store.select("staff_schedules", { eq: { staff_id: id } });
  for (const schedule of schedules) await store.remove("staff_schedules", schedule.id);
  const timeOff = await store.select("staff_time_off", { eq: { staff_id: id } });
  for (const entry of timeOff) await store.remove("staff_time_off", entry.id);
  await store.remove("staff", id);
}

export function staffDisplayName(member: Pick<StaffRow, "first_name" | "last_name">) {
  return [member.first_name, member.last_name].filter(Boolean).join(" ");
}
