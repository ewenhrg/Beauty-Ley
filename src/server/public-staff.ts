import {
  isChoosableHairStylist,
  isHairCategorySlug,
} from "@/lib/staff-choice";
import type { ServiceCategoryRow, StaffRow } from "./db/types";
import { staffDisplayName } from "./repo/catalog";

export type BookingAudience = "public" | "internal";

/**
 * Restricts the staff pool for online booking. Hair: Bebo / David only (when
 * they exist). Other services: ignore a client preference — admin assigns.
 */
export function publicStaffPool(
  category: ServiceCategoryRow | null,
  staff: StaffRow[],
  preferredId?: string,
): { staff: StaffRow[]; preferredId?: string } {
  const hair = Boolean(category && isHairCategorySlug(category.slug));
  if (!hair) return { staff, preferredId: undefined };

  const choosable = staff.filter((member) =>
    isChoosableHairStylist(staffDisplayName(member), member.id),
  );
  const pool = choosable.length ? choosable : staff;
  if (preferredId && pool.some((member) => member.id === preferredId)) {
    return {
      staff: pool.filter((member) => member.id === preferredId),
      preferredId,
    };
  }
  return { staff: pool, preferredId: undefined };
}
