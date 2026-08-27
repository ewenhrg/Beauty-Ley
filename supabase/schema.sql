-- Beauty Ley — booking schema
-- Run once in the Supabase SQL editor (or `psql`) before setting SUPABASE_URL
-- and SUPABASE_SERVICE_ROLE_KEY in the app environment.
--
-- The catalogue itself is seeded by the application on first request, so there
-- is nothing else to import: create the tables and the studio is ready.

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

create table if not exists service_categories (
  id          text primary key,
  name        text        not null,
  slug        text        not null unique,
  description text,
  image       text,
  sort_order  integer     not null default 0,
  active      boolean     not null default true
);

create table if not exists services (
  id           text primary key,
  category_id  text        not null references service_categories (id) on delete restrict,
  name         text        not null,
  description  text,
  duration_min integer     not null check (duration_min between 5 and 600),
  buffer_min   integer     not null default 0 check (buffer_min between 0 and 120),
  price        integer     not null check (price >= 0),
  price_kind   text        not null default 'fixed' check (price_kind in ('fixed', 'from')),
  image        text,
  sort_order   integer     not null default 0,
  active       boolean     not null default true
);

create index if not exists services_category_idx on services (category_id);
create index if not exists services_active_idx on services (active);

create table if not exists staff (
  id         text primary key,
  first_name text    not null,
  last_name  text,
  role       text,
  bio        text,
  photo      text,
  color      text    not null default '#c17a5c',
  sort_order integer not null default 0,
  active     boolean not null default true
);

create table if not exists staff_services (
  id         text primary key,
  staff_id   text not null references staff (id) on delete cascade,
  service_id text not null references services (id) on delete cascade,
  unique (staff_id, service_id)
);

create index if not exists staff_services_service_idx on staff_services (service_id);
create index if not exists staff_services_staff_idx on staff_services (staff_id);

-- ---------------------------------------------------------------------------
-- Availability
-- ---------------------------------------------------------------------------

-- One work window per weekday. A day without a row is a day off.
create table if not exists staff_schedules (
  id        text primary key,
  staff_id  text    not null references staff (id) on delete cascade,
  weekday   integer not null check (weekday between 0 and 6),
  start_min integer not null check (start_min between 0 and 1440),
  end_min   integer not null check (end_min between 0 and 1440),
  check (end_min > start_min)
);

create index if not exists staff_schedules_staff_idx on staff_schedules (staff_id, weekday);

-- Holidays, training days, one-off absences.
create table if not exists staff_time_off (
  id       text        primary key,
  staff_id text        not null references staff (id) on delete cascade,
  start_at timestamptz not null,
  end_at   timestamptz not null,
  reason   text,
  check (end_at > start_at)
);

create index if not exists staff_time_off_staff_idx on staff_time_off (staff_id, start_at);

create table if not exists business_hours (
  id        text primary key,
  weekday   integer not null unique check (weekday between 0 and 6),
  open_min  integer not null check (open_min between 0 and 1440),
  close_min integer not null check (close_min between 0 and 1440),
  closed    boolean not null default false
);

-- Salon-wide closures: public holidays and annual leave.
create table if not exists business_closures (
  id         text primary key,
  start_date date not null,
  end_date   date not null,
  label      text not null,
  check (end_date >= start_date)
);

create index if not exists business_closures_range_idx on business_closures (start_date, end_date);

-- ---------------------------------------------------------------------------
-- Clients and appointments
-- ---------------------------------------------------------------------------

create table if not exists customers (
  id         text        primary key,
  first_name text        not null,
  last_name  text        not null,
  phone      text        not null,
  email      text,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_phone_idx on customers (phone);
create index if not exists customers_email_idx on customers (email);

create table if not exists appointments (
  id             text        primary key,
  reference      text        not null unique,
  manage_token   text        not null,
  customer_id    text        not null references customers (id) on delete restrict,
  staff_id       text        not null references staff (id) on delete restrict,
  service_id     text        not null references services (id) on delete restrict,
  start_at       timestamptz not null,
  -- Includes the service buffer, so the calendar blocks the clean-up time too.
  end_at         timestamptz not null,
  duration_min   integer     not null,
  buffer_min     integer     not null default 0,
  status         text        not null default 'PENDING'
                 check (status in ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  price          integer     not null check (price >= 0),
  customer_note  text,
  admin_note     text,
  source         text        not null default 'online' check (source in ('online', 'admin')),
  payment_status text        not null default 'NONE'
                 check (payment_status in ('NONE', 'PENDING', 'PAID', 'REFUNDED')),
  deposit_amount integer     not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  cancelled_at   timestamptz,
  cancelled_by   text check (cancelled_by in ('customer', 'salon')),
  check (end_at > start_at)
);

create index if not exists appointments_start_idx on appointments (start_at);
create index if not exists appointments_staff_start_idx on appointments (staff_id, start_at);
create index if not exists appointments_customer_idx on appointments (customer_id, start_at desc);
create index if not exists appointments_status_idx on appointments (status);

-- The authoritative guard against double booking: two live appointments can
-- never overlap for the same staff member, whatever the application does.
alter table appointments drop constraint if exists appointments_no_overlap;
alter table appointments
  add constraint appointments_no_overlap
  exclude using gist (
    staff_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  ) where (status in ('PENDING', 'CONFIRMED', 'COMPLETED'));

-- ---------------------------------------------------------------------------
-- Outbox and settings
-- ---------------------------------------------------------------------------

create table if not exists notifications (
  id             text        primary key,
  appointment_id text        references appointments (id) on delete set null,
  channel        text        not null check (channel in ('email', 'sms', 'whatsapp')),
  kind           text        not null
                 check (kind in ('confirmation', 'reminder', 'reschedule', 'cancellation')),
  recipient      text        not null,
  subject        text,
  body           text        not null,
  status         text        not null default 'queued'
                 check (status in ('queued', 'sent', 'failed', 'skipped')),
  error          text,
  created_at     timestamptz not null default now(),
  sent_at        timestamptz
);

create index if not exists notifications_appointment_idx on notifications (appointment_id, kind);

create table if not exists settings (
  id                        text        primary key,
  slot_granularity_min      integer     not null default 15,
  min_notice_min            integer     not null default 120,
  max_advance_days          integer     not null default 60,
  cancellation_window_hours integer     not null default 24,
  auto_confirm              boolean     not null default true,
  payment_mode              text        not null default 'onsite'
                            check (payment_mode in ('onsite', 'deposit', 'full')),
  deposit_percent           integer     not null default 30 check (deposit_percent between 0 and 100),
  booking_terms             text        not null default '',
  salon_email               text,
  salon_phone               text,
  updated_at                timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Access control
-- ---------------------------------------------------------------------------
-- Row level security is enabled with no policy on purpose: the anon and
-- authenticated roles get nothing. Only the server, which holds the service
-- role key, can read or write — that key must never reach the browser.

alter table service_categories enable row level security;
alter table services           enable row level security;
alter table staff              enable row level security;
alter table staff_services     enable row level security;
alter table staff_schedules    enable row level security;
alter table staff_time_off     enable row level security;
alter table business_hours     enable row level security;
alter table business_closures  enable row level security;
alter table customers          enable row level security;
alter table appointments       enable row level security;
alter table notifications      enable row level security;
alter table settings           enable row level security;

-- Team logins. The salon owner still signs in with ADMIN_PASSWORD; extra
-- accounts live here, each with a password hash and a list of allowed pages.
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
