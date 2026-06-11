-- Migration: 004_module_tables
-- Description: Add project_type to designs + create windows/screens + transit tables

alter table public.designs add column if not exists project_type text not null default 'canvas'
  check (project_type in ('canvas', 'window_screen', 'transit'));

create index if not exists idx_designs_project_type on public.designs(project_type);

-- 7. Windows & Screens tickets
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

-- 8. Transit shipments
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
