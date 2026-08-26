import { getStore } from "../db";
import { buildSeed } from "../db/seed";
import { TABLE_NAMES } from "../db/types";
import type { StaffRow, TableName, Tables } from "../db/types";
import { isChoosableHairStylist, isHairCategorySlug, AUTO_CREATED_STAFF_IDS, DEFAULT_WORK_WINDOWS } from "@/lib/staff-choice";
import { newId } from "../ids";
import type { Store } from "../db/store";

let seeded: Promise<void> | null = null;

/**
 * Populates an empty database with the starting catalogue. Idempotent: it only
 * runs when the settings row is missing, and never re-inserts a row whose id is
 * already there — two workers racing on a cold start cannot duplicate it.
 */
export function ensureSeeded() {
  if (!seeded) {
    seeded = run().catch((error) => {
      seeded = null;
      throw error;
    });
  }
  return seeded;
}

async function run() {
  const store = getStore();
  await store.transaction(async () => {
    const existing = await store.select("settings", { limit: 1 });
    if (!existing.length) {
      const seed = buildSeed();
      for (const table of TABLE_NAMES) {
        const rows = seed[table] as Array<Tables[TableName] & { id: string }>;
        if (!rows.length) continue;

        const present = new Set(
          (await store.select(table)).map((row) => (row as { id: string }).id),
        );
        const missing = rows.filter((row) => !present.has(row.id));
        if (missing.length) await store.insert(table, missing as never);
      }
    }

    await removeAutoCreatedStaff(store);
    await ensureStaffForAccounts(store);
  });
}

function splitName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] ?? displayName.trim(),
    last_name: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

/**
 * Drop salon members the app used to invent (Ley, Sarah, Nour, Yasmine, …).
 * Team logins recreate their own profiles from Comptes.
 */
async function removeAutoCreatedStaff(store: Store) {
  const invented = new Set<string>(AUTO_CREATED_STAFF_IDS);
  const staff = await store.select("staff");
  const targets = staff.filter((row) => invented.has(row.id));
  if (!targets.length) return;

  for (const member of targets) {
    try {
      const users = await store.select("admin_users", { eq: { staff_id: member.id } });
      for (const user of users) {
        await store.update("admin_users", user.id, { staff_id: null });
      }
    } catch {
      // admin_users may not exist yet
    }

    const links = await store.select("staff_services", { eq: { staff_id: member.id } });
    for (const link of links) await store.remove("staff_services", link.id);
    const hours = await store.select("staff_schedules", { eq: { staff_id: member.id } });
    for (const row of hours) await store.remove("staff_schedules", row.id);
    const timeOff = await store.select("staff_time_off", { eq: { staff_id: member.id } });
    for (const row of timeOff) await store.remove("staff_time_off", row.id);

    const booked = await store.select("appointments", { eq: { staff_id: member.id }, limit: 1 });
    if (booked.length) {
      await store.update("staff", member.id, { active: false });
      continue;
    }
    await store.remove("staff", member.id);
  }
}

/**
 * Each team login is a working person. If a compte has no staff profile yet,
 * create one from the display name — never invent extra salon members.
 */
async function ensureStaffForAccounts(store: Store) {
  let users: Array<{ id: string; display_name: string; staff_id: string | null }> = [];
  try {
    users = await store.select("admin_users");
  } catch {
    return;
  }

  const staff = await store.select("staff");
  const present = new Set(staff.map((row) => row.id));
  const autoCreated = new Set<string>(AUTO_CREATED_STAFF_IDS);

  for (const user of users) {
    if (user.staff_id && present.has(user.staff_id) && !autoCreated.has(user.staff_id)) continue;
    const { first_name, last_name } = splitName(user.display_name || "Équipe");
    const name = [first_name, last_name].filter(Boolean).join(" ");
    const hair = isChoosableHairStylist(name);
    const row: StaffRow = {
      id: newId("stf"),
      first_name,
      last_name,
      role: hair ? "Coiffeur" : "Équipe",
      bio: null,
      photo: null,
      color: "#c17a5c",
      sort_order: staff.length,
      active: true,
    };
    await store.insert("staff", [row]);
    staff.push(row);
    present.add(row.id);
    await store.update("admin_users", user.id, { staff_id: row.id });
    if (hair) await attachHairWork(store, row.id);
  }
}

async function attachHairWork(store: Store, staffId: string) {
  const categories = await store.select("service_categories");
  const hairIds = new Set(
    categories.filter((row) => isHairCategorySlug(row.slug)).map((row) => row.id),
  );
  const services = await store.select("services");
  const hairServices = services.filter((row) => hairIds.has(row.category_id));
  const existing = await store.select("staff_services", { eq: { staff_id: staffId } });
  if (!existing.length && hairServices.length) {
    await store.insert(
      "staff_services",
      hairServices.map((service) => ({
        id: `link-${staffId}-${service.id}`,
        staff_id: staffId,
        service_id: service.id,
      })),
    );
  }

  const ownHours = await store.select("staff_schedules", { eq: { staff_id: staffId } });
  if (ownHours.length) return;
  const others = (await store.select("staff_schedules")).filter(
    (row) =>
      row.staff_id !== staffId && !(AUTO_CREATED_STAFF_IDS as readonly string[]).includes(row.staff_id),
  );
  const byStaff = new Map<string, typeof others>();
  for (const row of others) {
    const list = byStaff.get(row.staff_id) ?? [];
    list.push(row);
    byStaff.set(row.staff_id, list);
  }
  const hours = [...byStaff.values()][0] ?? [];
  const windows = hours.length
    ? hours.map((row) => ({
        weekday: row.weekday,
        start_min: row.start_min,
        end_min: row.end_min,
      }))
    : [...DEFAULT_WORK_WINDOWS];
  await store.insert(
    "staff_schedules",
    windows.map((row, index) => ({
      id: `sched-${staffId}-${row.weekday}-${index}`,
      staff_id: staffId,
      weekday: row.weekday,
      start_min: row.start_min,
      end_min: row.end_min,
    })),
  );
}
