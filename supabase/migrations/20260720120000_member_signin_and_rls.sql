-- Public member sign-in: link people to auth.users, add an email-lookup
-- function for the pre-auth admin/member branch, and tighten RLS now that
-- ordinary members (not just staff) can hold an authenticated session.

alter table public.people
  add column auth_user_id uuid references auth.users (id);

create unique index people_auth_user_id_idx
  on public.people (auth_user_id)
  where auth_user_id is not null;

-- ---------------------------------------------------------------------------
-- Email lookup used before the caller has a session: is this email an admin,
-- and/or does it match an existing member? Mirrors the is_admin() pattern.
create or replace function public.check_signin_email(p_email text)
returns table (is_admin boolean, is_member boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from auth.users u
      join public.user_roles r on r.user_id = u.id
      where lower(u.email) = lower(p_email)
    ),
    exists (
      select 1
      from public.people p
      where lower(p.email) = lower(p_email)
    );
$$;

grant execute on function public.check_signin_email(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tighten payments/people/memberships: previously any authenticated user
-- could read every row (fine while only staff had accounts). Now that the
-- public can sign in, scope non-admin reads to the caller's own records.
drop policy payments_read_auth on public.payments;

create policy payments_select_admin
  on public.payments for select to authenticated
  using (is_admin());

create policy payments_select_own
  on public.payments for select to authenticated
  using (
    exists (
      select 1 from public.people p
      where p.id = payments.person_id and p.auth_user_id = auth.uid()
    )
  );

drop policy people_read_auth on public.people;

create policy people_select_admin
  on public.people for select to authenticated
  using (is_admin());

create policy people_select_own
  on public.people for select to authenticated
  using (auth_user_id = auth.uid());

drop policy memberships_read_auth on public.memberships;

create policy memberships_select_admin
  on public.memberships for select to authenticated
  using (is_admin());

create policy memberships_select_own
  on public.memberships for select to authenticated
  using (
    exists (
      select 1 from public.people p
      where p.membership_id = memberships.id and p.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- volunteer_asks / volunteers currently have no RLS at all. Enable it and
-- allow authenticated members to read upcoming opportunities; writes stay
-- admin-only (volunteer signup remains the existing public form for v1).
alter table public.volunteer_asks enable row level security;
alter table public.volunteers enable row level security;

create policy volunteer_asks_select_auth
  on public.volunteer_asks for select to authenticated
  using (true);

create policy volunteer_asks_insert_admin
  on public.volunteer_asks for insert to authenticated
  with check (is_admin());

create policy volunteer_asks_update_admin
  on public.volunteer_asks for update to authenticated
  using (is_admin()) with check (is_admin());

create policy volunteer_asks_delete_admin
  on public.volunteer_asks for delete to authenticated
  using (is_admin());

create policy volunteers_select_admin
  on public.volunteers for select to authenticated
  using (is_admin());

create policy volunteers_insert_admin
  on public.volunteers for insert to authenticated
  with check (is_admin());

create policy volunteers_update_admin
  on public.volunteers for update to authenticated
  using (is_admin()) with check (is_admin());

create policy volunteers_delete_admin
  on public.volunteers for delete to authenticated
  using (is_admin());
