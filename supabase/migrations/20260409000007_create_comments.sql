create type comment_type as enum ('passio', 'prediccio', 'arbitre');

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  comment_type comment_type not null default 'passio',
  created_at timestamptz not null default now()
);

create index idx_comments_match on public.comments(match_id);
create index idx_comments_created on public.comments(created_at);

alter table public.comments enable row level security;
create policy "Anyone can read" on public.comments for select using (true);
create policy "Auth users insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "Own delete" on public.comments for delete using (auth.uid() = user_id);
