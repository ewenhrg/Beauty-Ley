import { getStore } from "../db";
import type { Store } from "../db/store";
import { buildSeed } from "../db/seed";
import { TABLE_NAMES } from "../db/types";
import type { StaffRow, StaffScheduleRow, StaffServiceRow, TableName, Tables } from "../db/types";
import { isChoosableHairStylist, isHairCategorySlug } from "@/lib/staff-choice";

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

    await ensureChoosableHairStylists(store);
  });
}

function staffName(row: StaffRow) {
  return [row.first_name, row.last_name].filter(Boolean).join(" ");
}

/**
 * Online hair booking offers Bebo and David. Existing databases that still
 * only have the seed "Ley" profile get those two members, with the same hair
 * services and hours as the current hair team.
 */
async function ensureChoosableHairStylists(store: Store) {
  const staff = await store.select("staff");
  const wanted: Array<Pick<StaffRow, "id" | "first_name" | "color" | "sort_order">> = [
    { id: "staff-bebo", first_name: "Bebo", color: "#c17a5c", sort_order: 0 },
    { id: "staff-david", first_name: "David", color: "#8d6236", sort_order: 1 },
  ];

  for (const member of wanted) {
    const exists = staff.some((row) => {
      if (row.id === member.id) return true;
      const key = staffName(row).trim().toLowerCase();
      const first = member.first_name.toLowerCase();
      return key === first || key.startsWith(`${first} `);
    });
    if (exists) continue;
    const row: StaffRow = {
      id: member.id,
      first_name: member.first_name,
      last_name: null,
      role: "Coiffeur",
      bio: "Coupes, brushing et colorations.",
      photo: null,
      color: member.color,
      sort_order: member.sort_order,
      active: true,
    };
    await store.insert("staff", [row]);
    staff.push(row);
  }

  const stylists = staff.filter((row) => isChoosableHairStylist(staffName(row), row.id));
  if (!stylists.length) return;

  const categories = await store.select("service_categories");
  const hairCategoryIds = new Set(
    categories.filter((row) => isHairCategorySlug(row.slug)).map((row) => row.id),
  );
  const services = await store.select("services");
  const hairServiceIds = services
    .filter((row) => hairCategoryIds.has(row.category_id))
    .map((row) => row.id);
  if (!hairServiceIds.length) return;

  const links = await store.select("staff_services");
  const schedules = await store.select("staff_schedules");
  const templateId =
    staff.find((row) => row.id === "staff-ley")?.id ??
    links.find((link) => hairServiceIds.includes(link.service_id))?.staff_id ??
    null;
  const templateLinks = templateId
    ? links.filter((link) => link.staff_id === templateId && hairServiceIds.includes(link.service_id))
    : hairServiceIds.map((serviceId) => ({ service_id: serviceId }));
  const templateSchedules = templateId
    ? schedules.filter((row) => row.staff_id === templateId)
    : [];

  const toLink: StaffServiceRow[] = [];
  const toSchedule: StaffScheduleRow[] = [];
  for (const stylist of stylists) {
    const own = new Set(
      links.filter((link) => link.staff_id === stylist.id).map((link) => link.service_id),
    );
    if (!own.size) {
      for (const link of templateLinks) {
        toLink.push({
          id: `link-${stylist.id}-${link.service_id}`,
          staff_id: stylist.id,
          service_id: link.service_id,
        });
      }
    }
    const hasHours = schedules.some((row) => row.staff_id === stylist.id);
    if (!hasHours) {
      templateSchedules.forEach((row, index) => {
        toSchedule.push({
          id: `sched-${stylist.id}-${row.weekday}-${index}`,
          staff_id: stylist.id,
          weekday: row.weekday,
          start_min: row.start_min,
          end_min: row.end_min,
        });
      });
    }
  }

  if (toLink.length) await store.insert("staff_services", toLink);
  if (toSchedule.length) await store.insert("staff_schedules", toSchedule);
}
