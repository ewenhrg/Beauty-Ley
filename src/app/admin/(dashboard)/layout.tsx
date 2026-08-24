import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Notice } from "@/components/booking/ui";
import { isAdmin } from "@/server/auth";
import { getStoreStatus } from "@/server/db";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const status = getStoreStatus();

  return (
    <AdminShell>
      {status.ready ? null : (
        <div className="mb-6">
          <Notice tone="error">{status.reason}</Notice>
        </div>
      )}
      {status.ready ? children : null}
    </AdminShell>
  );
}
