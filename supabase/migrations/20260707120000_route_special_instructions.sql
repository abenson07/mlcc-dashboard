-- Adds a per-route notes field for cover sheets (e.g. alley access, gate codes).
-- Run this entire file in the Supabase SQL editor (not individual lines).

alter table public.routes add column special_instructions text;

comment on column public.routes.special_instructions is
  'Optional per-route notes for deliverers (e.g. alley access, gate codes), printed on the cover sheet.';
