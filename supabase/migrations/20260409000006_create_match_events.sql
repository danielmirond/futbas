create type event_type as enum (
  'goal', 'own_goal', 'penalty', 'missed_penalty',
  'yellow_card', 'red_card', 'second_yellow',
  'substitution_in', 'substitution_out'
);

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  event_type event_type not null,
  minute int,
  player_name text,
  player_number int,
  related_player_name text,
  created_at timestamptz not null default now()
);

create index idx_match_events_match on public.match_events(match_id);

alter table public.match_events enable row level security;
create policy "Anyone can read" on public.match_events for select using (true);
create policy "Admins modify" on public.match_events for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
