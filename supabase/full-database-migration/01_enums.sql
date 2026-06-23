-- TARGET: Run first. Enum definitions from SOURCE inventory (2026).

create extension if not exists "uuid-ossp";

-- Legacy / base enums
create type public."Route Types" as enum (
  'Single family residences',
  'Apartments/Condos',
  'Businesses'
);

create type public.membership_tier_enum as enum (
  'Household',
  'Individual',
  'Senior',
  'Student'
);

create type public.membership_tier as enum (
  'single family residences',
  'multi-unit buildings',
  'business'
);

create type public.membership_status_enum as enum (
  'Active',
  'Expired',
  'Donation',
  'Cancelled'
);

create type public.payment_type_enum as enum (
  'membership',
  'donation'
);

create type public.payment_method_enum as enum (
  'stripe',
  'check',
  'cash'
);

-- App enums
create type public.leaflet_status as enum ('planned', 'active', 'closed');

create type public.delivery_response as enum (
  'pending',
  'confirmed',
  'needs_cover',
  'rejected'
);

create type public.workflow_context as enum (
  'leaflet',
  'event',
  'membership'
);

create type public.comm_trigger as enum (
  'anchor_offset',
  'on_activate'
);

create type public.volunteer_commitment_type as enum ('one_off', 'ongoing');

create type public.volunteer_commitment_unit as enum ('minutes', 'hours');

create type public.committee_slug as enum (
  'events',
  'outreach',
  'hub',
  'leaflet',
  'communications',
  'steering',
  'executive_board',
  'businesses'
);

create type public.meeting_location_type as enum ('in_person', 'remote', 'hybrid');

create type public.minutes_status as enum (
  'draft',
  'submitted',
  'processing',
  'ready',
  'error'
);

create type public.action_item_status as enum ('open', 'done');

create type public.action_item_source as enum ('ai', 'manual', 'bulk');
