import Link from "next/link";
import { AppointmentCard } from "@/components/admin/AppointmentCard";
import { Card, EmptyState, StatCard } from "@/components/admin/ui";
import { dashboardStats } from "@/server/admin";
import { toAppointmentView } from "@/server/admin-view";
import { listStaff, staffDisplayName } from "@/server/repo/catalog";
import { notificationStatus } from "@/server/notifications";
import { formatDateKey, todayKey } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, staff] = await Promise.all([dashboardStats(), listStaff({ activeOnly: true })]);
  const staffOptions = staff.map((member) => ({
    id: member.id,
    name: staffDisplayName(member),
  }));
  const channels = notificationStatus();
  const money = (value: number) => `${new Intl.NumberFormat("fr-FR").format(value)} EGP`;

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Tableau de bord
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">
          {formatDateKey(todayKey(), { withYear: true })}
        </h1>
      </header>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Rendez-vous aujourd'hui"
          value={String(stats.todayCount)}
          hint={stats.pendingCount ? `${stats.pendingCount} en attente` : "Tous confirmés"}
        />
        <StatCard label="Rendez-vous demain" value={String(stats.tomorrowCount)} />
        <StatCard
          label="Chiffre estimé du jour"
          value={money(stats.todayRevenue)}
          hint={`${money(stats.weekRevenue)} sur 7 jours`}
        />
        <StatCard label="Taux d'occupation" value={`${stats.occupancy} %`} hint="Sur la journée" />
        <StatCard label="Clientes enregistrées" value={String(stats.customerCount)} />
        <StatCard
          label="Emails automatiques"
          value={channels.email ? "Actifs" : "Non configurés"}
          hint={channels.email ? `Via ${channels.email}` : "RESEND_API_KEY manquante"}
        />
      </div>

      <div className="mt-8">
        <Card
          title="Prochains rendez-vous"
          action={
            <Link
              href="/admin/calendrier"
              className="nav-link text-[10px] tracking-[0.18em] text-ink-soft uppercase hover:text-ink"
            >
              Voir le calendrier
            </Link>
          }
        >
          {stats.upcoming.length ? (
            <div className="space-y-3">
              {stats.upcoming.map((entry) => (
                <AppointmentCard
                  key={entry.appointment.id}
                  appointment={toAppointmentView(entry)}
                  staff={staffOptions}
                />
              ))}
            </div>
          ) : (
            <EmptyState>Aucun rendez-vous à venir pour le moment.</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
}
