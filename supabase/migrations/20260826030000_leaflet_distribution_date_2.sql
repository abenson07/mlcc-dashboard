-- Second doorstep / pickup date. Dates are calendar days, not email send times.
alter table public.leaflets
  add column if not exists distribution_date_2 date;

comment on column public.leaflets.distribution_date is
  'Primary doorstep/pickup date (not email send date).';

comment on column public.leaflets.distribution_date_2 is
  'Optional second doorstep/pickup date (typically ~5 days after the primary).';

create unique index if not exists leaflets_title_lower_uidx
  on public.leaflets (lower(btrim(title)));
