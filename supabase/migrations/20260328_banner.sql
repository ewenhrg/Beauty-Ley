-- Admin-managed scrolling promo banner on the public site.
create table if not exists banner_settings (
  id      text primary key,
  enabled boolean not null default false
);

create table if not exists banner_offers (
  id         text primary key,
  message    text        not null,
  active     boolean     not null default true,
  sort_order integer     not null default 0
);

alter table banner_settings enable row level security;
alter table banner_offers   enable row level security;

insert into banner_settings (id, enabled)
values ('banner', false)
on conflict (id) do nothing;
