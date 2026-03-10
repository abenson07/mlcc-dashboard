-- Run this in Supabase SQL Editor if feature_ids does not already have
-- a unique constraint on (feature_id, surface). Required for vote upsert.

ALTER TABLE public.feature_ids
ADD CONSTRAINT unique_feature_surface UNIQUE (feature_id, surface);
