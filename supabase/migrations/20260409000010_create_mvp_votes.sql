create table public.mvp_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  player_name text not null,
  team_id uuid references public.teams(id),
  created_at timestamptz not null default now(),
  unique(user_id, match_id)
);

create index idx_mvp_votes_match on public.mvp_votes(match_id);

alter table public.mvp_votes enable row level security;
create policy "Anyone can read" on public.mvp_votes for select using (true);
create policy "Auth insert" on public.mvp_votes for insert with check (auth.uid() = user_id);
create policy "Own update" on public.mvp_votes for update using (auth.uid() = user_id);
