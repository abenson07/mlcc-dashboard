alter table public.leaflets
  add column if not exists comm_confirmation_followup_sent_at timestamptz;

comment on column public.leaflets.comm_confirmation_followup_sent_at is
  'When the confirmation follow-up (unconfirmed deliverers only) was sent for this edition.';

update public.comm_settings
set
  name = 'Initial reminder',
  updated_at = now()
where context = 'leaflet'
  and step_key = 'initial_confirmation'
  and event_template_id is null;

insert into public.comm_settings (
  context, name, step_key, resend_template_id, trigger, offset_days, offset_time, requires_response, is_enabled
)
select
  'leaflet'::public.workflow_context,
  'Follow-up',
  'confirmation_followup',
  coalesce(
    (select resend_template_id from public.comm_settings
      where context = 'leaflet' and step_key = 'initial_confirmation' and event_template_id is null
      limit 1),
    'placeholder_confirmation_followup'
  ),
  'anchor_offset'::public.comm_trigger,
  -21,
  '09:00'::time,
  true,
  true
where not exists (
  select 1 from public.comm_settings
  where context = 'leaflet' and step_key = 'confirmation_followup' and event_template_id is null
);

update public.comm_settings
set is_enabled = false, updated_at = now()
where context = 'leaflet'
  and event_template_id is null
  and step_key in (
    'distribution_day_pickup',
    'delivery_complete_prompt',
    'completion_followup'
  );

update public.leaflets l
set comm_schedule = coalesce(l.comm_schedule, '{}'::jsonb) || jsonb_build_object(
  'confirmation_followup',
  to_char(l.distribution_date + -21, 'YYYY-MM-DD')
)
where coalesce(l.comm_schedule ->> 'confirmation_followup', '') = '';
