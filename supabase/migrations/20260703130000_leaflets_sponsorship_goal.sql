-- Per-leaflet-run sponsorship fundraising goal (cents).
ALTER TABLE leaflets
  ADD COLUMN IF NOT EXISTS sponsorship_goal_cents integer;

COMMENT ON COLUMN leaflets.sponsorship_goal_cents IS
  'Fundraising goal for this leaflet run, in USD cents. Null falls back to derived/default goal in the UI.';
