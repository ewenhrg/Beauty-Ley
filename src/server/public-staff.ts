import { AUTO_CREATED_STAFF_IDS, isHairCategorySlug } from "@/lib/staff-choice";
import type { ServiceCategoryRow, StaffRow } from "./db/types";

export type BookingAudience = "public" | "internal";

/**
 * Restricts the staff pool for online booking. Hair: people assigned to that
 * service. Other services: ignore a client preference — admin assigns.
 */
export function publicStaffPool(
  category: ServiceCategoryRow | null,
  staff: StaffRow[],
  preferredId?: string,
): { staff: StaffRow[]; preferredId?: string } {
  const hair = Boolean(category && isHairCategorySlug(category.slug));
  if (!hair) return { staff, preferredId: undefined };

  const hidden = new Set<string>(AUTO_CREATED_STAFF_IDS);
  const pool = staff.filter((member) => !hidden.has(member.id));
  const usable = pool.length ? pool : staff;
  if (preferredId && usable.some((member) => member.id === preferredId)) {
    return {
      staff: usable.filter((member) => member.id === preferredId),
      preferredId,
    };
  }
  return { staff: usable, preferredId: undefined };
}
