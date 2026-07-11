-- FAQs shown on the marketing site, with per-page visibility controlled from the dashboard.
-- Run this entire file in the Supabase SQL editor (not individual lines).

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.faqs is
  'FAQ question/answer pairs surfaced on the marketing site. Visibility per page is controlled via faq_page_assignments.';

-- Which marketing-site page(s) each FAQ should appear on.
-- page_slug is free text (not an enum/FK) so new pages can be wired up from the
-- dashboard without a migration. Current known routes: home, about, about/maple-leaf,
-- board, committees, contact, donate, events, join-the-board, leaflet,
-- meeting-minutes, membership, one-seattle-plan, submit-event, submit-story,
-- subscribe, volunteer.
create table public.faq_page_assignments (
  id uuid primary key default gen_random_uuid(),
  faq_id uuid not null references public.faqs (id) on delete cascade,
  page_slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint faq_page_assignments_faq_page_unique unique (faq_id, page_slug)
);

comment on table public.faq_page_assignments is
  'Join table mapping a FAQ to the marketing-site page(s) it should render on.';

create index faq_page_assignments_faq_id_idx on public.faq_page_assignments (faq_id);
create index faq_page_assignments_page_slug_idx on public.faq_page_assignments (page_slug);

alter table public.faqs enable row level security;
alter table public.faq_page_assignments enable row level security;

-- Public (anon) read access so the marketing site can fetch FAQs server-side;
-- writes restricted to authenticated dashboard users.
create policy faqs_select_all on public.faqs
  for select to anon, authenticated using (true);

create policy faqs_write_authenticated on public.faqs
  for all to authenticated using (true) with check (true);

create policy faq_page_assignments_select_all on public.faq_page_assignments
  for select to anon, authenticated using (true);

create policy faq_page_assignments_write_authenticated on public.faq_page_assignments
  for all to authenticated using (true) with check (true);

-- Seed data extracted from the existing home_faq_list on the marketing site.
insert into public.faqs (question, answer, sort_order) values
(
  'What is the Maple Leaf Community Council?',
  'The Maple Leaf Community Council is a neighborhood organization in North Seattle dedicated to enhancing community engagement and fostering a sense of belonging among residents. We organize various events throughout the year, including annual gatherings and ad-hoc activities that bring neighbors together to connect and collaborate.',
  0
),
(
  'What is your vision for the community?',
  'Our vision is to create a thriving, inclusive community where all residents feel connected and empowered. We aspire to foster a sense of belonging, encourage active participation, and ensure that the voices of all community members are heard and valued in shaping the future of Maple Leaf.',
  1
),
(
  'Are you associated with the city government?',
  'No, the Maple Leaf Community Council is not associated with the city government. We are a group of neighbors who volunteer our time to improve our community. Our board oversees our activities, ensuring that we remain focused on the needs and interests of local residents.',
  2
),
(
  'Who are the volunteers?',
  'All volunteers at the Maple Leaf Community Council are local residents who dedicate their time and effort to support our initiatives. Importantly, none of our volunteers receive payment for their work; they are motivated by a shared commitment to enhancing our neighborhood and fostering community spirit.',
  3
),
(
  'How is the council funded?',
  'The Maple Leaf Community Council is funded mostly through membership dues. Some events and the leaflet are sponsored by local businesses. We also receive donations and grants occaisionally. We rely on the generosity of local residents and businesses to support our initiatives and activities. If you''d like to support the events and efforts in Maple Leaf, consider becoming a member.',
  4
),
(
  'What kind of events do you host?',
  'We host a variety of events throughout the year, including community meetings, social gatherings, and educational workshops. These events are designed to engage residents, share information, and foster connections among neighbors. Our annual events often include celebrations, clean-up days, and informational sessions on local issues.',
  5
),
(
  'Can I suggest an event?',
  'Absolutely! Our approach is to partner with neighbors to help them start events that will benefit the neighborhood. This has included an annual Movie Night, a block party, and a Silent Book Club. We welcome suggestions for events that would benefit the Maple Leaf community. If you have an idea for a gathering, workshop, or activity, please share it with us through our contact form. Please note that we are a volunteer organization so we encourage you to come with an idea and the drive to make it happen!',
  6
),
(
  'How can I get involved with the council?',
  'Getting involved with the Maple Leaf Community Council is easy! You can attend our community meetings, participate in events, or volunteer for specific projects. We welcome all residents who want to contribute to making our neighborhood a better place. Check our website for upcoming meetings and events.',
  7
),
(
  'How can I support the council?',
  'You can support the Maple Leaf Community Council by volunteering your time, attending events, and spreading the word about our initiatives. Additionally, donations are always appreciated and help us fund our activities. Every bit of support contributes to strengthening our community.',
  8
),
(
  'What if I have more questions?',
  'If you have more questions about the Maple Leaf Community Council or our activities, please don''t hesitate to reach out. You can contact us through our website or attend one of our meetings. We are here to provide information and support to our community members.',
  9
);

-- These FAQs currently live on the home page; assign them there by default.
insert into public.faq_page_assignments (faq_id, page_slug, sort_order)
select id, 'home', sort_order from public.faqs;
