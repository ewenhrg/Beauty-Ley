import { UserForm } from "@/components/admin/UserForm";
import { Card } from "@/components/admin/ui";
import { requirePage } from "@/server/access";
import { ntfySubscribeUrl, ntfyTopicForUser } from "@/server/notifications/providers";
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
  const users = ready ? (await listUsers()).map(publicUser) : [];

  return (
    <div>
      <header>
        <p className="text-gradient text-[11px] font-semibold tracking-[0.28em] uppercase">
          Accès
        </p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">Comptes équipe</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Votre compte admin voit tout. Chaque compte que vous créez est une personne de
          l&apos;équipe : le nom affiché est celui que les clientes voient, et c&apos;est cette
          personne qui reçoit la notification quand vous lui attribuez un rendez-vous.
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
          <Card title="Ajouter un compte">
            <p className="mb-4 text-sm leading-relaxed text-ink-soft">
              Autant de personnes que vous voulez. Le nom affiché devient le profil équipe.
            </p>
            <UserForm />
          </Card>
          {users.map((user) => (
            <Card key={user.id} title={user.display_name}>
              <p className="mb-4 text-xs text-ink-soft">
                @{user.username}
                {user.active ? "" : " · inactif"}
                {user.own_agenda ? " · planning personnel" : ""}
              </p>
              <UserForm
                user={user}
                ntfy={(() => {
                  const topic = ntfyTopicForUser(user.username);
                  return topic && ntfySubscribeUrl(topic)
                    ? { topic, url: ntfySubscribeUrl(topic)! }
                    : null;
                })()}
              />
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
