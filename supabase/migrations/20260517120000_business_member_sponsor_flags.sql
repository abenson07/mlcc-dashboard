-- Dashboard flags for business member / past sponsor (simple booleans until deep data wiring).

alter table public.businesses
  add column if not exists is_member boolean not null default false,
  add column if not exists is_past_sponsor boolean not null default false;

comment on column public.businesses.is_member is 'Dashboard flag: business is a member (manual until membership sync).';
comment on column public.businesses.is_past_sponsor is 'Dashboard flag: business is a past sponsor (manual until sponsorship sync).';

-- Optional backfill from existing relational data.
-- membership_status_enum labels vary (e.g. "Active"); compare via text, not enum literal 'active'.
update public.businesses b
set is_member = true
from public.business_memberships m
where b.membership_id = m.id
  and lower(m.status::text) like '%active%';

update public.businesses b
set is_past_sponsor = true
where exists (
  select 1 from public.sponsorships s where s.business_id = b.id
)
and not (
  exists (
    select 1
    from public.business_memberships m
    where b.membership_id = m.id
      and lower(m.status::text) like '%active%'
  )
  or exists (
    select 1
    from public.sponsorships s2
    where s2.business_id = b.id
      and s2.status = 'paid'
      and s2.paid_date is not null
  )
);
