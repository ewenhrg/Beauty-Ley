import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentCard } from "@/components/admin/AppointmentCard";
import { CustomerForm } from "@/components/admin/CustomerForm";
import { Card, EmptyState, Money, StatCard } from "@/components/admin/ui";
import { customerHistory } from "@/server/admin";
import { toAppointmentView } from "@/server/admin-view";
import { getCustomer } from "@/server/repo/customers";
import { listStaff, staffDisplayName } from "@/server/repo/catalog";
import { formatDateKey } from "@/lib/time";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCustomerPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const [history, staff] = await Promise.all([customerHistory(id), listStaff()]);
  const staffOptions = staff.map((member) => ({
    id: member.id,
    name: staffDisplayName(member),
  }));

  const honoured = history.filter((entry) => entry.appointment.status === "COMPLETED");
  const cancelled = history.filter((entry) => entry.appointment.status === "CANCELLED");
  const totalSpent = honoured.reduce((total, entry) => total + entry.appointment.price, 0);
  const favourite = mostFrequent(history.map((entry) => entry.service?.name).filter(Boolean) as string[]);

  return (
    <div>
      <Link
        href="/admin/clients"
        className="nav-link text-[10px] tracking-[0.18em] text-ink-soft uppercase hover:text-ink"
      >
        ← Toutes les clientes
      </Link>

      <header className="mt-4">
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Fiche cliente
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">
          {customer.first_name} {customer.last_name}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {customer.phone}
          {customer.email ? ` · ${customer.email}` : ""}
        </p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Rendez-vous" value={String(history.length)} />
        <StatCard label="Honorés" value={String(honoured.length)} />
        <StatCard label="Annulés" value={String(cancelled.length)} />
        <StatCard label="Total dépensé" value={`${totalSpent} EGP`} hint={favourite ?? undefined} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card title="Coordonnées">
          <CustomerForm customer={customer} />
        </Card>

        <Card title="Historique">
          {history.length ? (
            <div className="space-y-3">
              {history.map((entry) => (
                <AppointmentCard
                  key={entry.appointment.id}
                  appointment={toAppointmentView(entry)}
                  staff={staffOptions}
                />
              ))}
            </div>
          ) : (
            <EmptyState>Aucun rendez-vous enregistré pour cette cliente.</EmptyState>
          )}
        </Card>
      </div>

      <p className="mt-6 text-xs text-ink-soft">
        Fiche créée le {formatDateKey(customer.created_at.slice(0, 10), { withYear: true })} ·
        Total honoré <Money value={totalSpent} />
      </p>
    </div>
  );
}

function mostFrequent(values: string[]) {
  if (!values.length) return null;
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const [name] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return `Prestation favorite : ${name}`;
}
