-- Migration: 005_rls_modules
-- Description: RLS policies for windows/screens tickets and transit shipments

-- ========================
-- TICKETS WINDOWS SCREENS
-- ========================
create policy "Users can view own or team tickets"
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

create policy "Users can create tickets for own designs"
  on public.tickets_windows_screens for insert
  with check (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );

create policy "Users can update own design tickets"
  on public.tickets_windows_screens for update
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );

create policy "Users can delete own design tickets"
  on public.tickets_windows_screens for delete
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );

-- ========================
-- TRANSIT SHIPMENTS
-- ========================
create policy "Users can view own or team shipments"
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

create policy "Users can create shipments for own designs"
  on public.transit_shipments for insert
  with check (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );

create policy "Users can update own design shipments"
  on public.transit_shipments for update
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );

create policy "Users can delete own design shipments"
  on public.transit_shipments for delete
  using (
    exists (
      select 1 from public.designs
      where id = design_id
        and author_id = current_setting('request.jwt.claim.email', true)
    )
  );
