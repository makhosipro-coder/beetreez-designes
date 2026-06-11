-- Run in Supabase Dashboard SQL editor at https://supabase.com/dashboard/project/ejoscvxmctrqhayeyerj/sql/new
-- Adds title, description, visibility, published_at columns to published_snapshots
-- Adds published_at column to designs

ALTER TABLE published_snapshots
  ADD COLUMN IF NOT EXISTS title text DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted'));

ALTER TABLE designs
  ADD COLUMN IF NOT EXISTS published_at timestamptz;
