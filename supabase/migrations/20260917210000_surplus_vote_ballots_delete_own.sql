-- surplus_vote_ballots had select/insert/update policies but no delete policy,
-- so "Reset my vote" deletes silently affected 0 rows under RLS.
-- Run this entire file in the Supabase SQL editor (not individual lines).

create policy surplus_vote_ballots_delete_own
  on public.surplus_vote_ballots
  for delete
  to authenticated
  using (auth.uid() = user_id);
