-- TARGET: Optional reference seeds.
-- SKIP this file if you are copying all rows from SOURCE (including event_templates, comm_settings, task_templates).

insert into public.task_templates (context, title, description, offset_days)
select v.context, v.title, v.description, v.offset_days
from (values
  ('leaflet'::public.workflow_context, 'Example task one', 'Placeholder — replace with real checklist item.', -42),
  ('leaflet'::public.workflow_context, 'Example task two', 'Placeholder — replace with real checklist item.', -14),
  ('leaflet'::public.workflow_context, 'Example task three', 'Placeholder — replace with real checklist item.', -7)
) as v(context, title, description, offset_days)
where not exists (
  select 1 from public.task_templates where context = 'leaflet' and title = v.title
);

insert into public.comm_settings (
  context, name, step_key, resend_template_id, trigger, offset_days, offset_time, requires_response
)
select v.*
from (values
  ('leaflet'::public.workflow_context, 'Initial confirmation', 'initial_confirmation', '5001e3e2-f803-497a-a2ea-d35cef88bd70', 'on_activate'::public.comm_trigger, null::integer, '09:00'::time, true),
  ('leaflet'::public.workflow_context, 'Pre-distribution reminder', 'pre_distribution_reminder', '730c2f7d-61cb-43b4-ac00-1ee15eccf8c1', 'anchor_offset'::public.comm_trigger, -14, '09:00'::time, false),
  ('leaflet'::public.workflow_context, 'Distribution day pickup', 'distribution_day_pickup', '88b30acc-256c-4f0c-b2be-8b9dd5007fb6', 'anchor_offset'::public.comm_trigger, 0, '08:00'::time, false),
  ('leaflet'::public.workflow_context, 'Delivery complete prompt', 'delivery_complete_prompt', '8588c557-2b03-4e72-9c27-b853068e9310', 'anchor_offset'::public.comm_trigger, 0, '10:00'::time, true),
  ('leaflet'::public.workflow_context, 'Completion followup', 'completion_followup', 'd15e937d-a9b2-417f-bb73-d832212b9d0e', 'anchor_offset'::public.comm_trigger, 7, '09:00'::time, true)
) as v(context, name, step_key, resend_template_id, trigger, offset_days, offset_time, requires_response)
where not exists (
  select 1 from public.comm_settings cs
  where cs.context = v.context and cs.step_key = v.step_key and cs.event_template_id is null
);

insert into public.event_templates (name, slug, description, default_field_data, is_active)
select
  'Block Party',
  'block-party',
  'Neighborhood block party — default checklist and sponsorship tiers.',
  jsonb_build_object(
    'kind', 'council',
    'sponsorship_goal_cents', 1500000,
    'sponsorship_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Platinum', 'amount', 2500, 'quantity', 1),
      jsonb_build_object('name', 'Gold', 'amount', 1000, 'quantity', 2),
      jsonb_build_object('name', 'Silver', 'amount', 500, 'quantity', 4),
      jsonb_build_object('name', 'Bronze', 'amount', 250, 'quantity', 8)
    )
  ),
  true
where not exists (select 1 from public.event_templates where slug = 'block-party');

insert into public.task_templates (context, event_template_id, title, description, offset_days, is_active)
select
  'event'::public.workflow_context,
  et.id,
  t.title,
  t.description,
  t.offset_days,
  true
from public.event_templates et
cross join (
  values
    ('Book venue / street closure', 'Confirm location and permits.', -90),
    ('Send save-the-date', 'Email neighbors and post on social.', -60),
    ('Confirm sponsors', 'Follow up on pledged sponsorships.', -45),
    ('Order supplies', 'Tents, tables, signage.', -30),
    ('Volunteer hub reminders', 'Email signed-up volunteers.', -14),
    ('Print day-of materials', 'Signage, name tags, run sheet.', -7),
    ('Day-of setup', 'Arrive early for setup crew.', 0),
    ('Post-event thank yous', 'Thank volunteers and sponsors.', 7)
) as t(title, description, offset_days)
where et.slug = 'block-party'
  and not exists (
    select 1 from public.task_templates tt
    where tt.context = 'event' and tt.event_template_id = et.id and tt.title = t.title
  );
