create type chronicle_status as enum ('draft', 'published', 'archived');

create table public.chronicles (
  id uuid primary key default gen_random_uuid(),
  match_id uuid unique not null references public.matches(id) on delete cascade,
  headline text,
  body text,
  social_summary text,
  mvp_player text,
  mvp_justification text,
  language text not null default 'ca' check (language in ('ca', 'es')),
  status chronicle_status not null default 'draft',
  generated_at timestamptz,
  published_at timestamptz,
  edited_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chronicles enable row level security;
create policy "Read published or admin" on public.chronicles for select
  using (status = 'published' or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));
create policy "Admins modify" on public.chronicles for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
