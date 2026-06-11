-- =============================================================
-- Combined Migration: 004 + 005 + 006 + 007
-- Run ALL of this in Supabase Dashboard SQL editor at:
-- https://supabase.com/dashboard/project/ejoscvxmctrqhayeyerj/sql/new
-- =============================================================

-- === 004: Module Tables ===
alter table public.designs add column if not exists project_type text not null default 'canvas'
  check (project_type in ('canvas', 'window_screen', 'transit'));
create index if not exists idx_designs_project_type on public.designs(project_type);

create table if not exists public.tickets_windows_screens (
  id text primary key,
  design_id text not null references public.designs(id) on delete cascade,
  service_type text not null check (service_type in ('mesh_repair', 'custom_glass', 'frame_align')),
  exact_dimensions_mm jsonb not null default '{"width": 0, "height": 0, "depth": 0}'::jsonb,
  material_type text not null default 'aluminum',
  assigned_fabricator_id text,
  status text not null default 'draft' check (status in ('draft', 'pending', 'approved', 'in_production', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tickets_windows_screens enable row level security;
create index if not exists idx_tickets_windows_screens_design_id on public.tickets_windows_screens(design_id);
create index if not exists idx_tickets_windows_screens_status on public.tickets_windows_screens(status);

create table if not exists public.transit_shipments (
  id text primary key,
  design_id text not null references public.designs(id) on delete cascade,
  carrier_id text not null,
  carrier_name text not null default 'TBD',
  tracking_number text,
  package_weight_kg numeric(10,2) not null default 0,
  cargo_status text not null default 'manifested' check (cargo_status in ('manifested', 'in_transit', 'delayed', 'delivered')),
  current_eta jsonb,
  origin text,
  destination text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.transit_shipments enable row level security;
create index if not exists idx_transit_shipments_design_id on public.transit_shipments(design_id);
create index if not exists idx_transit_shipments_cargo_status on public.transit_shipments(cargo_status);

-- === 005: RLS for Module Tables ===
create policy if not exists "Users can view own or team tickets"
  on public.tickets_windows_screens for select
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and (
          author_id = current_setting('request.jwt.claim.email', true)
          or (
            team_id is not null
            and exists (
              select 1 from public.team_members
              where team_id = designs.team_id
                and user_id = current_setting('request.jwt.claim.email', true)
            )
          )
        )
    )
  );
create policy if not exists "Users can create tickets for own designs"
  on public.tickets_windows_screens for insert
  with check (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );
create policy if not exists "Users can update own design tickets"
  on public.tickets_windows_screens for update
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );
create policy if not exists "Users can delete own design tickets"
  on public.tickets_windows_screens for delete
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );

create policy if not exists "Users can view own or team shipments"
  on public.transit_shipments for select
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and (
          author_id = current_setting('request.jwt.claim.email', true)
          or (
            team_id is not null
            and exists (
              select 1 from public.team_members
              where team_id = designs.team_id
                and user_id = current_setting('request.jwt.claim.email', true)
            )
          )
        )
    )
  );
create policy if not exists "Users can create shipments for own designs"
  on public.transit_shipments for insert
  with check (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );
create policy if not exists "Users can update own design shipments"
  on public.transit_shipments for update
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );
create policy if not exists "Users can delete own design shipments"
  on public.transit_shipments for delete
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );

-- === 006: Storage Bucket (idempotent) ===
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('design-assets', 'design-assets', true, 5242880, '{image/jpeg,image/png,image/webp,image/gif}')
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Authenticated users can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'design-assets');

CREATE POLICY IF NOT EXISTS "Anyone can view images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'design-assets');

CREATE POLICY IF NOT EXISTS "Users can delete own uploads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'design-assets' AND owner_id = auth.uid());

-- === 007: Publishing Enhancements ===
ALTER TABLE published_snapshots
  ADD COLUMN IF NOT EXISTS title text DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted'));

ALTER TABLE designs
  ADD COLUMN IF NOT EXISTS published_at timestamptz;
