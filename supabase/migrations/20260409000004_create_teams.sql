create table public.teams (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  team_name text not null,
  position int,
  points int default 0,
  played int default 0,
  won int default 0,
  drawn int default 0,
  lost int default 0,
  goals_for int default 0,
  goals_against int default 0,
  goal_difference int generated always as (goals_for - goals_against) stored,
  form text[],
  scraped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(club_id, competition_id)
);

create index idx_teams_competition on public.teams(competition_id);
create index idx_teams_club on public.teams(club_id);

alter table public.teams enable row level security;
create policy "Anyone can read" on public.teams for select using (true);
create policy "Admins modify" on public.teams for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
