-- Distinguish "skipped this time" from "completed" on leaflet/event task instances.
alter table public.tasks
  add column if not exists is_skipped boolean not null default false;

comment on column public.tasks.is_skipped is
  'True when a task was explicitly skipped for this occurrence (row menu action), as opposed to completed. Does not affect the underlying task_templates row.';
