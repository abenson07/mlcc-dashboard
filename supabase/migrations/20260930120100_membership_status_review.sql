-- Adds a "Review" membership status: a flag for members we couldn't verify
-- (e.g. business members with no matching Stripe subscription). Run this on its
-- own, before the Stripe reconcile --apply, because a new enum label can't be
-- used in the same transaction that adds it.
alter type public.membership_status_enum add value if not exists 'Review';
