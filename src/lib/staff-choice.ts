/**
 * Public booking: clients may pick a stylist only for hair services,
 * among the salon coiffeurs or no preference. Everything else is
 * assigned in the admin calendar.
 */

export const HAIR_CATEGORY_SLUGS = ["coiffure", "coloration"] as const;

export const HAIR_STYLISTS = [
  { firstName: "Bebo", slugs: ["bebo"] },
  { firstName: "David", slugs: ["david"] },
  { firstName: "Mickael", slugs: ["mickael", "michael"] },
  { firstName: "Melad", slugs: ["melad"] },
  { firstName: "Mohammed", slugs: ["mohammed", "mohamed"] },
] as const;

/** Rows the app once auto-inserted. Never recreate; drop or hide on boot. */
export const AUTO_CREATED_STAFF_IDS = [
  "staff-ley",
  "staff-sarah",
  "staff-nour",
  "staff-yasmine",
  "staff-bebo",
  "staff-david",
  "staff-mickael",
  "staff-melad",
  "staff-mohammed",
] as const;

/** Studio hours copied onto a new compte when nobody else has a schedule yet. Friday is closed. */
export const DEFAULT_WORK_WINDOWS = [
  { weekday: 0, start_min: 10 * 60, end_min: 20 * 60 },
  { weekday: 1, start_min: 10 * 60, end_min: 20 * 60 },
  { weekday: 2, start_min: 10 * 60, end_min: 20 * 60 },
  { weekday: 3, start_min: 10 * 60, end_min: 20 * 60 },
  { weekday: 4, start_min: 10 * 60, end_min: 20 * 60 },
  { weekday: 6, start_min: 10 * 60, end_min: 20 * 60 },
] as const;

const HAIR_SLUGS = HAIR_STYLISTS.flatMap((stylist) => [...stylist.slugs]);

function keyOf(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isHairCategorySlug(slug: string) {
  return (HAIR_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

export function serviceAllowsStaffChoice(
  categoryId: string,
  categories: Array<{ id: string; slug: string }>,
) {
  const slug = categories.find((category) => category.id === categoryId)?.slug;
  return Boolean(slug && isHairCategorySlug(slug));
}

export function isChoosableHairStylist(name: string, id?: string) {
  if (id && (AUTO_CREATED_STAFF_IDS as readonly string[]).includes(id)) return false;
  const key = keyOf(name);
  return HAIR_SLUGS.some((stylist) => key === stylist || key.startsWith(`${stylist} `));
}

function hairRank(name: string) {
  const key = keyOf(name);
  const bySlug = HAIR_STYLISTS.findIndex((stylist) =>
    stylist.slugs.some((slug) => key === slug || key.startsWith(`${slug} `)),
  );
  return bySlug === -1 ? 99 : bySlug;
}

/** Hair stylists a client may pick, in display order. Anyone assigned to the service. */
export function choosableHairStaff<T extends { id: string; name: string }>(
  staff: T[],
  staffIds: string[],
) {
  const allowed = new Set(staffIds);
  const hidden = new Set<string>(AUTO_CREATED_STAFF_IDS);
  return staff
    .filter((member) => allowed.has(member.id) && !hidden.has(member.id))
    .sort((a, b) => hairRank(a.name) - hairRank(b.name) || a.name.localeCompare(b.name));
}
