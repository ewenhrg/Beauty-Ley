import Link from "next/link";
import { AppointmentCard } from "@/components/admin/AppointmentCard";
import { Card, EmptyState } from "@/components/admin/ui";
import { requirePage } from "@/server/access";
import { agendaStaffId } from "@/server/auth";
import { loadAgenda } from "@/server/admin";
import { toAppointmentView } from "@/server/admin-view";
import { APPOINTMENT_STATUSES } from "@/server/db/types";
import type { AppointmentStatus } from "@/server/db/types";
import { listServices, listStaff, staffDisplayName } from "@/server/repo/catalog";
import { addDays, formatDateKey, isValidDateKey, todayKey } from "@/lib/time";
import { getT } from "@/i18n/server";
import { statusKey } from "@/i18n/keys";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    from?: string;
    to?: string;
    staff?: string;
    service?: string;
    status?: string;
    q?: string;
  }>;
};

export default async function AdminAppointmentsPage({ searchParams }: Props) {
  const t = await getT();
  const session = await requirePage("rendez-vous");
  const lockedStaff = agendaStaffId(session);
  const params = await searchParams;
  const today = todayKey();
  const from = isValidDateKey(params.from) ? params.from : today;
  const to = isValidDateKey(params.to) ? params.to : addDays(from, 30);
  const status = APPOINTMENT_STATUSES.includes(params.status as AppointmentStatus)
    ? (params.status as AppointmentStatus)
    : undefined;

  const [entries, staff, services] = await Promise.all([
    loadAgenda(from, addDays(to, 1), {
      staffId: lockedStaff ?? (params.staff || undefined),
      serviceId: params.service || undefined,
      status,
      query: params.q,
    }),
    listStaff(),
    listServices(),
  ]);

  const staffOptions = staff
    .filter((member) => !lockedStaff || member.id === lockedStaff)
    .map((member) => ({
      id: member.id,
      name: staffDisplayName(member),
    }));

  const byDay = new Map<string, typeof entries>();
  for (const entry of entries) {
    const list = byDay.get(entry.date) ?? [];
    list.push(entry);
    byDay.set(entry.date, list);
  }

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Rendez-vous
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">
          {entries.length} rendez-vous
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Du {formatDateKey(from)} au {formatDateKey(to, { withYear: true })}
        </p>
      </header>

      <Card className="mt-6">
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Filter label="Du">
            <input type="date" name="from" defaultValue={from} className={FILTER_INPUT} />
          </Filter>
          <Filter label="Au">
            <input type="date" name="to" defaultValue={to} className={FILTER_INPUT} />
          </Filter>
          {lockedStaff ? (
            <input type="hidden" name="staff" value={lockedStaff} />
          ) : (
          <Filter label="Professionnelle">
            <select name="staff" defaultValue={params.staff ?? ""} className={FILTER_INPUT}>
              <option value="">Toutes</option>
              {staffOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </Filter>
          )}
          <Filter label="Prestation">
            <select name="service" defaultValue={params.service ?? ""} className={FILTER_INPUT}>
              <option value="">Toutes</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </Filter>
          <Filter label="Statut">
            <select name="status" defaultValue={params.status ?? ""} className={FILTER_INPUT}>
              <option value="">Tous</option>
              {APPOINTMENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {t(statusKey(value))}
                </option>
              ))}
            </select>
          </Filter>
          <Filter label="Recherche">
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Nom, téléphone, réf."
              className={FILTER_INPUT}
            />
          </Filter>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
            <button
              type="submit"
              className="rounded-xl bg-terracotta px-4 py-2.5 text-[10px] font-medium tracking-[0.18em] text-cream uppercase transition-colors hover:bg-rose"
            >
              Filtrer
            </button>
            <Link
              href="/admin/rendez-vous"
              className="rounded-xl border border-line px-4 py-2.5 text-[10px] tracking-[0.18em] text-ink-soft uppercase transition-colors hover:text-ink"
            >
              Réinitialiser
            </Link>
          </div>
        </form>
      </Card>

      <div className="mt-6 space-y-8">
        {byDay.size ? (
          [...byDay.entries()].map(([day, list]) => (
            <section key={day}>
              <h2 className="text-[11px] tracking-[0.2em] text-rose uppercase">
                {formatDateKey(day, { withYear: true })}
              </h2>
              <div className="mt-3 space-y-3">
                {list.map((entry) => (
                  <AppointmentCard
                    key={entry.appointment.id}
                    appointment={toAppointmentView(entry)}
                    staff={staffOptions}
                    compact
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <EmptyState>Aucun rendez-vous ne correspond à ces filtres.</EmptyState>
        )}
      </div>
    </div>
  );
}

const FILTER_INPUT =
  "w-full min-h-11 rounded-xl border border-line bg-white/80 px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-terracotta sm:text-sm";

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.2em] text-rose uppercase">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
