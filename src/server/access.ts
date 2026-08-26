import { redirect } from "next/navigation";
import {
  agendaStaffId,
  canAccess,
  firstAdminHref,
  getAdminSession,
  type AdminPageId,
  type AdminSession,
} from "./auth";

export async function requireSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Redirects to the first allowed page when the current one is closed. */
export async function requirePage(...pages: AdminPageId[]): Promise<AdminSession> {
  const session = await requireSession();
  if (!pages.some((page) => canAccess(session, page))) {
    redirect(firstAdminHref(session));
  }
  return session;
}

export { agendaStaffId, canAccess, firstAdminHref };
export type { AdminPageId, AdminSession };
