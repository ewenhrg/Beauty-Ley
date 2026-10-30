-- Per-service booking channel (WhatsApp vs site calendar) and open weekdays.
alter table services
  add column if not exists booking_channel text not null default 'whatsapp';

alter table services
  add column if not exists online_weekdays integer[] not null default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'services_booking_channel_check'
  ) then
    alter table services
      add constraint services_booking_channel_check
      check (booking_channel in ('whatsapp', 'online'));
  end if;
end $$;
