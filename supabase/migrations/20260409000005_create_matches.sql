create type match_status as enum ('scheduled', 'live', 'finished', 'postponed', 'cancelled');

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  matchday int,
  home_team_id uuid not null references public.teams(id) on delete cascade,
  away_team_id uuid not null references public.teams(id) on delete cascade,
  match_date timestamptz,
  venue text,
  home_score int,
  away_score int,
  status match_status not null default 'scheduled',
  acta_url text,
  acta_data jsonb,
  scraped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_matches_competition on public.matches(competition_id);
create index idx_matches_date on public.matches(match_date);
create index idx_matches_status on public.matches(status);
create index idx_matches_home on public.matches(home_team_id);
create index idx_matches_away on public.matches(away_team_id);

alter table public.matches enable row level security;
create policy "Anyone can read" on public.matches for select using (true);
create policy "Admins modify" on public.matches for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
