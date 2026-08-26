import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/server/access";
import { ScheduleEditor } from "@/components/admin/ScheduleEditor";
import { StaffForm } from "@/components/admin/StaffForm";
import { Card } from "@/components/admin/ui";
import { Avatar } from "@/components/booking/ui";
import { initialsOf } from "@/lib/booking-types";
import {
  getStaff,
  listCategories,
  listServices,
  listStaffServices,
  staffDisplayName,
} from "@/server/repo/catalog";
import { listStaffSchedules, listTimeOff } from "@/server/repo/schedule";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminStaffPage({ params }: Props) {
  await requirePage("equipe");
  const { id } = await params;
  const member = await getStaff(id);
  if (!member) notFound();

  const [categories, services, links, schedules, timeOff] = await Promise.all([
    listCategories(),
    listServices(),
    listStaffServices(),
    listStaffSchedules(id),
    listTimeOff({ staffId: id }),
  ]);

  const selectedServices = links
    .filter((link) => link.staff_id === id)
    .map((link) => link.service_id);
  const name = staffDisplayName(member);

  return (
    <div>
      <Link
        href="/admin/equipe"
        className="nav-link text-[10px] tracking-[0.18em] text-ink-soft uppercase hover:text-ink"
      >
        ← Toute l&apos;équipe
      </Link>

      <header className="mt-4 flex items-center gap-4">
        <Avatar
          name={name}
          initials={initialsOf(name)}
          photo={member.photo}
          color={member.color}
        />
        <div>
          <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
            Profil
          </p>
          <h1 className="font-display mt-1 text-3xl text-ink">{name}</h1>
          {member.role ? <p className="mt-0.5 text-sm text-ink-soft">{member.role}</p> : null}
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card title="Profil et prestations">
          <StaffForm
            member={member}
            categories={categories}
            services={services}
            selectedServices={selectedServices}
          />
        </Card>

        <Card title="Planning et absences">
          <ScheduleEditor staffId={member.id} schedules={schedules} timeOff={timeOff} />
        </Card>
      </div>
    </div>
  );
}
