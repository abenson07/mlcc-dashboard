-- Seed repeatable event template + checklist task templates for events-hub.
-- Idempotent: skips insert when slug already exists.

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
where not exists (
  select 1 from public.event_templates where slug = 'block-party'
);

-- Task templates linked to block-party template (offsets relative to event starts_at)
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
    select 1
    from public.task_templates tt
    where tt.context = 'event'
      and tt.event_template_id = et.id
      and tt.title = t.title
  );
