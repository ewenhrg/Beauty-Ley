import { ServiceEditor } from "@/components/admin/ServiceEditor";
import {
  listCategories,
  listServices,
  listStaff,
  listStaffServices,
  staffDisplayName,
} from "@/server/repo/catalog";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const [categories, services, staff, links] = await Promise.all([
    listCategories(),
    listServices(),
    listStaff(),
    listStaffServices(),
  ]);

  const staffByService: Record<string, string[]> = {};
  for (const link of links) {
    (staffByService[link.service_id] ??= []).push(link.staff_id);
  }

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Catalogue
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">Prestations</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Durée, prix, catégorie et professionnelles autorisées. Ces réglages pilotent directement
          les créneaux proposés aux clientes.
        </p>
      </header>

      <div className="mt-8">
        <ServiceEditor
          categories={categories}
          services={services}
          staff={staff.map((member) => ({ id: member.id, name: staffDisplayName(member) }))}
          staffByService={staffByService}
        />
      </div>
    </div>
  );
}
