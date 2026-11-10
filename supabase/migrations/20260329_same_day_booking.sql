-- Same-day online booking allowed, with a 1-hour minimum lead time.
update settings
set min_notice_min = 60,
    updated_at = now()
where min_notice_min = 0
   or min_notice_min >= 120;
