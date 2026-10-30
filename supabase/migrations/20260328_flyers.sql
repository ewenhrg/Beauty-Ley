-- Popup flyer offers shown when clients open the site.
create table if not exists flyer_settings (
  id      text primary key,
  enabled boolean not null default false
);

create table if not exists flyer_offers (
  id          text primary key,
  description text        not null default '',
  image       text        not null,
  active      boolean     not null default true,
  sort_order  integer     not null default 0
);

alter table flyer_settings enable row level security;
alter table flyer_offers   enable row level security;

insert into flyer_settings (id, enabled)
values ('flyer', false)
on conflict (id) do nothing;
