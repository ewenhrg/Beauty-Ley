import Link from "next/link";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import type { CalendarBlock, CalendarView } from "@/components/admin/AdminCalendar";
import { NewAppointmentForm } from "@/components/admin/NewAppointmentForm";
import { loadAgenda } from "@/server/admin";
import { toAppointmentView } from "@/server/admin-view";
import { listCategories, listServices, listStaff, listStaffServices, staffDisplayName } from "@/server/repo/catalog";
import { listBusinessHours } from "@/server/repo/schedule";
import { addDays, formatDateKey, isValidDateKey, monthLabel, todayKey, weekdayOfKey } from "@/lib/time";

export const dynamic = "force-dynamic";

const VIEWS: CalendarView[] = ["jour", "semaine", "mois"];

type Props = {
  searchParams: Promise<{ view?: string; date?: string; staff?: string }>;
};

/** Days covered by the requested view, and the label shown in the header. */
function rangeFor(view: CalendarView, anchor: string) {
  if (view === "jour") {
    return { days: [anchor], title: formatDateKey(anchor, { withYear: true }), step: 1 };
  }
  if (view === "semaine") {
    const start = addDays(anchor, -((weekdayOfKey(anchor) + 6) % 7));
    const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    return {
      days,
      title: `${formatDateKey(days[0])} → ${formatDateKey(days[6], { withYear: true })}`,
      step: 7,
    };
  }
  const monthStart = `${anchor.slice(0, 7)}-01`;
  const [year, month] = monthStart.split("-").map(Number);
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    days: Array.from({ length: count }, (_, index) => addDays(monthStart, index)),
    title: `${monthLabel(month)} ${year}`,
    step: count,
  };
}

export default async function AdminCalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const view = (VIEWS.includes(params.view as CalendarView) ? params.view : "jour") as CalendarView;
  const anchor = isValidDateKey(params.date) ? params.date : todayKey();
  const staffFilter = params.staff || null;

  const { days, title, step } = rangeFor(view, anchor);
  const [entries, staff, services, categories, links, hours] = await Promise.all([
    loadAgenda(days[0], addDays(days[days.length - 1], 1), {
      staffId: staffFilter ?? undefined,
    }),
    listStaff({ activeOnly: true }),
    listServices({ activeOnly: true }),
    listCategories(),
    listStaffServices(),
    listBusinessHours(),
  ]);

  const open = hours.filter((row) => !row.closed);
  const gridStart = open.length ? Math.min(...open.map((row) => row.open_min)) : 9 * 60;
  const gridEnd = open.length ? Math.max(...open.map((row) => row.close_min)) : 20 * 60;

  const blocks: CalendarBlock[] = entries.map((entry) => ({
    ...toAppointmentView(entry),
    startMinutes: entry.startMinutes,
    endMinutes: entry.endMinutes,
  }));

  const staffList = staff.map((member) => ({
    id: member.id,
    name: staffDisplayName(member),
    color: member.color,
  }));

  const categoryName = new Map(categories.map((row) => [row.id, row.name]));
  const staffByService = new Map<string, string[]>();
  for (const link of links) {
    const list = staffByService.get(link.service_id) ?? [];
    list.push(link.staff_id);
    staffByService.set(link.service_id, list);
  }

  const previous = addDays(view === "mois" ? `${anchor.slice(0, 7)}-01` : anchor, -step);
  const next = addDays(view === "mois" ? `${anchor.slice(0, 7)}-01` : anchor, step);
  const link = (patch: Record<string, string>) => {
    const query = new URLSearchParams({ view, date: anchor });
    if (staffFilter) query.set("staff", staffFilter);
    for (const [key, value] of Object.entries(patch)) {
      if (value) query.set(key, value);
      else query.delete(key);
    }
    return `/admin/calendrier?${query}`;
  };

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
            Calendrier
          </p>
          <h1 className="font-display mt-2 text-2xl text-ink capitalize sm:text-3xl">{title}</h1>
        </div>
        <NewAppointmentForm
          services={services.map((service) => ({
            id: service.id,
            name: service.name,
            categoryName: categoryName.get(service.category_id) ?? "",
            staffIds: staffByService.get(service.id) ?? [],
          }))}
          staff={staffList}
          defaultDate={anchor}
        />
      </header>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-line">
            {VIEWS.map((option) => (
              <Link
                key={option}
                href={link({ view: option })}
                className={`min-h-11 px-3.5 py-2.5 text-[10px] tracking-[0.16em] uppercase transition-colors ${
                  option === view ? "bg-terracotta text-cream" : "text-ink-soft hover:text-ink"
                }`}
              >
                {option}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={link({ date: previous })}
              aria-label="Période précédente"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ink-soft transition-colors hover:border-terracotta hover:text-terracotta"
            >
              ‹
            </Link>
            <Link
              href={link({ date: todayKey() })}
              className="flex min-h-11 items-center rounded-xl border border-line px-3.5 py-2 text-[10px] tracking-[0.16em] text-ink-soft uppercase transition-colors hover:border-terracotta hover:text-ink"
            >
              Aujourd&apos;hui
            </Link>
            <Link
              href={link({ date: next })}
              aria-label="Période suivante"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ink-soft transition-colors hover:border-terracotta hover:text-terracotta"
            >
              ›
            </Link>
          </div>
        </div>

        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
          <Link
            href={link({ staff: "" })}
            className={`flex h-10 shrink-0 items-center rounded-full border px-3.5 text-[10px] tracking-[0.14em] uppercase transition-colors ${
              staffFilter
                ? "border-line text-ink-soft hover:text-ink"
                : "border-terracotta bg-terracotta text-cream"
            }`}
          >
            Toute l&apos;équipe
          </Link>
          {staffList.map((member) => (
            <Link
              key={member.id}
              href={link({ staff: member.id })}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[10px] tracking-[0.14em] uppercase transition-colors ${
                staffFilter === member.id
                  ? "border-terracotta bg-terracotta text-cream"
                  : "border-line text-ink-soft hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ background: member.color }}
              />
              {member.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <AdminCalendar
          view={view}
          date={anchor}
          days={days}
          blocks={blocks}
          staff={staffList}
          staffFilter={staffFilter}
          gridStart={gridStart}
          gridEnd={gridEnd}
        />
      </div>
    </div>
  );
}
