-- Migration: 001_initial_schema
-- Description: Create all tables for the design platform backend
-- Note: Uses NextAuth for auth; profiles are created on first API call

-- 1. Profiles (created on-demand when user first calls an API)
create table if not exists public.profiles (
  id text primary key,
  email text not null unique,
  name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 2. Teams
create table if not exists public.teams (
  id text primary key,
  name text not null,
  owner_id text not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

-- 3. Team members
create table if not exists public.team_members (
  team_id text not null references public.teams(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

alter table public.team_members enable row level security;

-- 4. Designs
create table if not exists public.designs (
  id text primary key,
  author_id text not null references public.profiles(id) on delete cascade,
  name text not null default 'Untitled',
  team_id text references public.teams(id) on delete set null,
  thumbnail text,
  layer_state jsonb not null default '{}'::jsonb,
  design_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.designs enable row level security;

create index if not exists idx_designs_author_id on public.designs(author_id);
create index if not exists idx_designs_team_id on public.designs(team_id);
create index if not exists idx_designs_updated_at on public.designs(updated_at desc);

-- 5. Folders
create table if not exists public.folders (
  id text primary key,
  name text not null,
  user_id text not null references public.profiles(id) on delete cascade,
  parent_id text references public.folders(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.folders enable row level security;

create index if not exists idx_folders_user_id on public.folders(user_id);

-- 6. Published snapshots
create table if not exists public.published_snapshots (
  id text primary key,
  design_id text not null references public.designs(id) on delete cascade,
  author_email text not null,
  layer_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.published_snapshots enable row level security;

create index if not exists idx_published_snapshots_design_id on public.published_snapshots(design_id);
