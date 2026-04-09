create type favorite_type as enum ('club', 'team', 'competition');

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  favorite_type favorite_type not null,
  club_id uuid references public.clubs(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  competition_id uuid references public.competitions(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint chk_target check (
    club_id is not null or team_id is not null or competition_id is not null
  ),
  unique(user_id, favorite_type, club_id, team_id, competition_id)
);

create index idx_favorites_user on public.favorites(user_id);

alter table public.favorites enable row level security;
create policy "Read own" on public.favorites for select using (auth.uid() = user_id);
create policy "Insert own" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Delete own" on public.favorites for delete using (auth.uid() = user_id);
