-- Team logins for the admin area. Run once in the Supabase SQL editor
-- (SQL → New query) on the existing Beauty Ley project.

create table if not exists admin_users (
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

create index if not exists admin_users_staff_idx on admin_users (staff_id);

alter table admin_users enable row level security;
