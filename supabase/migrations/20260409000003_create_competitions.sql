create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  fcf_id text unique,
  name text not null,
  category text not null,
  group_name text,
  season text not null,
  sport_type text not null default 'futbol11',
  total_matchdays int,
  scraped_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_competitions_season on public.competitions(season);

alter table public.competitions enable row level security;
create policy "Anyone can read" on public.competitions for select using (true);
create policy "Admins modify" on public.competitions for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
