alter table public.leaflets
  add column if not exists comm_schedule jsonb not null default '{}'::jsonb;

comment on column public.leaflets.comm_schedule is
  'Per-edition send dates keyed by comm_settings.step_key (YYYY-MM-DD), snapshotted from workback offsets at create.';

update public.leaflets l
set comm_schedule = coalesce((
  select jsonb_object_agg(
    cs.step_key,
    to_char(
      case
        when cs.offset_days is null then current_date
        else l.distribution_date + cs.offset_days
      end,
      'YYYY-MM-DD'
    )
  )
  from public.comm_settings cs
  where cs.context = 'leaflet'
    and cs.event_template_id is null
    and cs.is_enabled is not false
), '{}'::jsonb)
where coalesce(l.comm_schedule, '{}'::jsonb) = '{}'::jsonb;
