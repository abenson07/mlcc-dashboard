-- Marketing site uses the anon key and can only SELECT published events.
-- This RPC lists draft slugs so static-catalog entries can be hidden on unpublish.
create or replace function public.unpublished_event_slugs()
returns table(slug text)
language sql
stable
security definer
set search_path = public
as $$
  select e.slug
  from public.events e
  where e.slug is not null
    and e.publish_status = 'draft';
$$;

revoke all on function public.unpublished_event_slugs() from public;
grant execute on function public.unpublished_event_slugs() to anon, authenticated;
