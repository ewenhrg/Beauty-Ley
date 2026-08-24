import Link from "next/link";
import { Card, EmptyState, Money } from "@/components/admin/ui";
import { customerSummaries } from "@/server/admin";
import { normalisePhone } from "@/server/repo/customers";
import { formatDateKey, instantToWall } from "@/lib/time";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminCustomersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const all = await customerSummaries();
  const needle = q?.trim().toLowerCase() ?? "";
  const digits = needle ? normalisePhone(needle) : "";

  const customers = needle
    ? all.filter(({ customer }) => {
        const haystack =
          `${customer.first_name} ${customer.last_name} ${customer.email ?? ""}`.toLowerCase();
        if (haystack.includes(needle)) return true;
        return digits.length >= 3 && normalisePhone(customer.phone).includes(digits);
      })
    : all;

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Clientes
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">
          {`${customers.length} fiche${customers.length > 1 ? "s" : ""}`}
        </h1>
      </header>

      <Card className="mt-6">
        <form method="get" className="flex flex-wrap gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Nom, téléphone ou email…"
            className="min-w-0 flex-1 rounded-xl border border-line bg-white/80 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-terracotta"
          />
          <button
            type="submit"
            className="rounded-xl bg-terracotta px-4 py-2.5 text-[10px] font-medium tracking-[0.18em] text-cream uppercase transition-colors hover:bg-rose"
          >
            Rechercher
          </button>
        </form>
      </Card>

      <div className="mt-6 space-y-2">
        {customers.length ? (
          customers.map(({ customer, appointmentCount, lastVisit, totalSpent }) => (
            <Link
              key={customer.id}
              href={`/admin/clients/${customer.id}`}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-[1.25rem] border border-line bg-white/70 px-4 py-3.5 transition-colors hover:border-terracotta/45 sm:px-5"
            >
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-ink">
                  {customer.first_name} {customer.last_name}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {customer.phone}
                  {customer.email ? ` · ${customer.email}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-ink-soft">
                <span>
                  {appointmentCount} rendez-vous
                </span>
                <span>
                  {lastVisit
                    ? `Dernier : ${formatDateKey(instantToWall(new Date(lastVisit)).dateKey)}`
                    : "Jamais venue"}
                </span>
                <span className="text-ink">
                  <Money value={totalSpent} />
                </span>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState>
            {needle ? "Aucune cliente ne correspond." : "Aucune cliente enregistrée pour l'instant."}
          </EmptyState>
        )}
      </div>
    </div>
  );
}
