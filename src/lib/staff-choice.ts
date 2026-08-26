/**
 * Public booking: clients may pick a stylist only for hair services,
 * and only among Bebo, David, or no preference. Everything else is
 * assigned in the admin calendar.
 */

export const HAIR_CATEGORY_SLUGS = ["coiffure", "coloration"] as const;

const HAIR_STYLISTS = ["bebo", "david"] as const;

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
  if (id === "staff-bebo" || id === "staff-david") return true;
  const key = keyOf(name);
  return HAIR_STYLISTS.some((stylist) => key === stylist || key.startsWith(`${stylist} `));
}

function hairRank(name: string, id?: string) {
  if (id === "staff-bebo") return 0;
  if (id === "staff-david") return 1;
  const key = keyOf(name);
  const index = HAIR_STYLISTS.findIndex(
    (stylist) => key === stylist || key.startsWith(`${stylist} `),
  );
  return index === -1 ? 99 : index;
}

/** Hair stylists a client may pick, in display order (Bebo, then David). */
export function choosableHairStaff<T extends { id: string; name: string }>(
  staff: T[],
  staffIds: string[],
) {
  const allowed = new Set(staffIds);
  return staff
    .filter((member) => allowed.has(member.id) && isChoosableHairStylist(member.name, member.id))
    .sort(
      (a, b) => hairRank(a.name, a.id) - hairRank(b.name, b.id) || a.name.localeCompare(b.name),
    );
}
