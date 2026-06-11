-- Migration: 002_rls_policies
-- Description: Row Level Security policies for all tables

-- ========================
-- PROFILES
-- ========================
create policy "Users can read own profile"
  on public.profiles for select
  using (id = current_setting('request.jwt.claim.email', true));

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = current_setting('request.jwt.claim.email', true));

create policy "Users can update own profile"
  on public.profiles for update
  using (id = current_setting('request.jwt.claim.email', true));

-- ========================
-- TEAMS
-- ========================
create policy "Members can view team"
  on public.teams for select
  using (
    owner_id = current_setting('request.jwt.claim.email', true)
    or exists (
      select 1 from public.team_members
      where team_id = id and user_id = current_setting('request.jwt.claim.email', true)
    )
  );

create policy "Users can create teams"
  on public.teams for insert
  with check (owner_id = current_setting('request.jwt.claim.email', true));

create policy "Owner can update team"
  on public.teams for update
  using (owner_id = current_setting('request.jwt.claim.email', true));

create policy "Owner can delete team"
  on public.teams for delete
  using (owner_id = current_setting('request.jwt.claim.email', true));

-- ========================
-- TEAM MEMBERS
-- ========================
create policy "Members can view team members"
  on public.team_members for select
  using (
    user_id = current_setting('request.jwt.claim.email', true)
    or exists (
      select 1 from public.team_members tm
      where tm.team_id = team_id and tm.user_id = current_setting('request.jwt.claim.email', true)
    )
  );

create policy "Admins can manage members"
  on public.team_members for insert
  with check (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_id and tm.user_id = current_setting('request.jwt.claim.email', true) and tm.role = 'admin'
    )
  );

create policy "Admins can update members"
  on public.team_members for update
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_id and tm.user_id = current_setting('request.jwt.claim.email', true) and tm.role = 'admin'
    )
  );

create policy "Admins can delete members"
  on public.team_members for delete
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_id and tm.user_id = current_setting('request.jwt.claim.email', true) and tm.role = 'admin'
    )
  );

-- ========================
-- DESIGNS
-- ========================
create policy "Users can view own or team designs"
  on public.designs for select
  using (
    author_id = current_setting('request.jwt.claim.email', true)
    or (
      team_id is not null
      and exists (
        select 1 from public.team_members
        where team_id = designs.team_id and user_id = current_setting('request.jwt.claim.email', true)
      )
    )
  );

create policy "Users can create designs"
  on public.designs for insert
  with check (author_id = current_setting('request.jwt.claim.email', true));

create policy "Users can update own or team designs"
  on public.designs for update
  using (
    author_id = current_setting('request.jwt.claim.email', true)
    or (
      team_id is not null
      and exists (
        select 1 from public.team_members
        where team_id = designs.team_id
          and user_id = current_setting('request.jwt.claim.email', true)
          and role in ('admin', 'editor')
      )
    )
  );

create policy "Users can delete own designs"
  on public.designs for delete
  using (author_id = current_setting('request.jwt.claim.email', true));

-- ========================
-- FOLDERS
-- ========================
create policy "Users can view own folders"
  on public.folders for select
  using (user_id = current_setting('request.jwt.claim.email', true));

create policy "Users can create folders"
  on public.folders for insert
  with check (user_id = current_setting('request.jwt.claim.email', true));

create policy "Users can update own folders"
  on public.folders for update
  using (user_id = current_setting('request.jwt.claim.email', true));

create policy "Users can delete own folders"
  on public.folders for delete
  using (user_id = current_setting('request.jwt.claim.email', true));

-- ========================
-- PUBLISHED SNAPSHOTS
-- ========================
create policy "Anyone can view published snapshots"
  on public.published_snapshots for select
  using (true);

create policy "Authenticated users can publish"
  on public.published_snapshots for insert
  with check (
    exists (
      select 1 from public.designs
      where id = design_id and author_id = current_setting('request.jwt.claim.email', true)
    )
  );
