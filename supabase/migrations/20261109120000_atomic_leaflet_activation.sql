create unique index if not exists leaflets_one_active_uidx
  on public.leaflets ((true))
  where status = 'active';

create or replace function public.activate_leaflet_issue(
  target_leaflet_id uuid,
  expected_active_leaflet_id uuid
)
returns public.leaflets
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_active_id uuid;
  target public.leaflets;
begin
  -- Serialize lifecycle writes, including updates outside this function.
  lock table public.leaflets in share row exclusive mode;

  select * into target from public.leaflets where id = target_leaflet_id;
  if not found then
    raise exception 'Leaflet not found' using errcode = 'P0002';
  end if;

  select id into current_active_id from public.leaflets where status = 'active';
  if current_active_id = target_leaflet_id then
    return target;
  end if;
  if current_active_id is distinct from expected_active_leaflet_id then
    raise exception 'The active issue has changed. Close this dialog and try again.'
      using errcode = '40001';
  end if;

  update public.leaflets
    set status = 'closed', closed_at = now(), updated_at = now()
    where id = current_active_id;

  update public.leaflets
    set status = 'active', activated_at = now(), closed_at = null, updated_at = now()
    where id = target_leaflet_id
    returning * into target;
  if not found then
    raise exception 'You do not have permission to activate this leaflet' using errcode = '42501';
  end if;

  return target;
end;
$$;

revoke all on function public.activate_leaflet_issue(uuid, uuid) from public, anon;
grant execute on function public.activate_leaflet_issue(uuid, uuid) to authenticated, service_role;
