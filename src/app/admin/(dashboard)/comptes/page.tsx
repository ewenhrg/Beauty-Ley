import { UserForm } from "@/components/admin/UserForm";
import { Card } from "@/components/admin/ui";
import { requirePage } from "@/server/access";
import { listStaff, staffDisplayName } from "@/server/repo/catalog";
import { listUsers, publicUser, usersTableReady } from "@/server/repo/users";

export const dynamic = "force-dynamic";

const CREATE_SQL = `create table if not exists admin_users (
  id            text primary key,
  username      text not null unique,
  display_name  text not null,
  password_hash text not null,
  pages         jsonb not null default '[]'::jsonb,
  staff_id      text references staff (id) on delete set null,
  own_agenda    boolean not null default false,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table admin_users enable row level security;`;

export default async function AdminUsersPage() {
  await requirePage("comptes");
  const ready = await usersTableReady();
  const [staff, users] = ready
    ? await Promise.all([
        listStaff(),
        listUsers().then((rows) => rows.map(publicUser)),
      ])
    : [[], []];

  const staffOptions = staff.map((member) => ({
    id: member.id,
    name: staffDisplayName(member),
  }));

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Accès
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">Comptes équipe</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Votre compte admin voit tout. Créez un identifiant par personne et cochez uniquement les
          pages qu&apos;elle a le droit d&apos;ouvrir.
        </p>
      </header>

      {ready ? null : (
        <Card className="mt-6" title="À faire une seule fois">
          <p className="text-sm leading-relaxed text-ink-soft">
            Collez ce SQL dans Supabase (SQL Editor), exécutez-le, puis rechargez cette page.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-ink px-4 py-4 text-[11px] leading-relaxed text-cream">
            {CREATE_SQL}
          </pre>
        </Card>
      )}

      {ready ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {users.map((user) => (
            <Card key={user.id} title={user.display_name}>
              <p className="mb-4 text-xs text-ink-soft">
                @{user.username}
                {user.active ? "" : " · inactif"}
                {user.own_agenda ? " · planning personnel" : ""}
              </p>
              <UserForm user={user} staff={staffOptions} />
            </Card>
          ))}
          <Card title="Nouveau compte">
            <UserForm staff={staffOptions} />
          </Card>
        </div>
      ) : null}
    </div>
  );
}
