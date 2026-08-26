import Link from "next/link";
import { requirePage } from "@/server/access";
import { StaffForm } from "@/components/admin/StaffForm";
import { Avatar } from "@/components/booking/ui";
import { Card } from "@/components/admin/ui";
import { initialsOf } from "@/lib/booking-types";
import {
  listCategories,
  listServices,
  listStaff,
  listStaffServices,
  staffDisplayName,
} from "@/server/repo/catalog";
import { listStaffSchedules } from "@/server/repo/schedule";
import { minutesToLabel, weekdayLabel } from "@/lib/time";

export const dynamic = "force-dynamic";

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function AdminTeamPage() {
  await requirePage("equipe");
  const [staff, categories, services, links, schedules] = await Promise.all([
    listStaff(),
    listCategories(),
    listServices(),
    listStaffServices(),
    listStaffSchedules(),
  ]);

  const servicesByStaff = new Map<string, string[]>();
  for (const link of links) {
    const list = servicesByStaff.get(link.staff_id) ?? [];
    list.push(link.service_id);
    servicesByStaff.set(link.staff_id, list);
  }

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Studio
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">Équipe</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Profils, prestations réalisées et plannings. Ouvrez une fiche pour régler les horaires et
          les congés.
        </p>
      </header>

      <div className="mt-8 space-y-3">
        {staff.map((member) => {
          const name = staffDisplayName(member);
          const own = schedules.filter((row) => row.staff_id === member.id);
          return (
            <Link
              key={member.id}
              href={`/admin/equipe/${member.id}`}
              className="flex flex-wrap items-center gap-4 rounded-[1.25rem] border border-line bg-white/70 px-4 py-4 transition-colors hover:border-terracotta/45 sm:px-5"
            >
              <Avatar
                name={name}
                initials={initialsOf(name)}
                photo={member.photo}
                color={member.color}
                size="sm"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-ink">
                  {name}
                  {member.active ? "" : " · inactive"}
                </span>
                <span className="mt-0.5 block text-xs text-ink-soft">
                  {member.role ?? "—"} · {(servicesByStaff.get(member.id) ?? []).length} prestations
                </span>
              </span>
              <span className="hidden flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-soft sm:flex">
                {WEEK_ORDER.map((weekday) => {
                  const windows = own
                    .filter((row) => row.weekday === weekday)
                    .sort((a, b) => a.start_min - b.start_min);
                  return (
                    <span key={weekday} className={windows.length ? "text-ink" : "opacity-40"}>
                      {weekdayLabel(weekday, true)}{" "}
                      {windows.length
                        ? `${minutesToLabel(windows[0].start_min)}–${minutesToLabel(
                            windows[windows.length - 1].end_min,
                          )}`
                        : "OFF"}
                    </span>
                  );
                })}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <Card title="Ajouter un membre">
          <StaffForm categories={categories} services={services} selectedServices={[]} />
        </Card>
      </div>
    </div>
  );
}
