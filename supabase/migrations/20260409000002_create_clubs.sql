create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  fcf_code text unique,
  name text not null,
  short_name text,
  badge_url text,
  primary_color text default '#000000',
  secondary_color text default '#FFFFFF',
  delegation text,
  municipality text,
  province text,
  stadium_name text,
  stadium_address text,
  founded_year int,
  website text,
  scraped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_clubs_fcf_code on public.clubs(fcf_code);
create index idx_clubs_delegation on public.clubs(delegation);

alter table public.clubs enable row level security;
create policy "Anyone can read clubs" on public.clubs for select using (true);
create policy "Admins modify clubs" on public.clubs for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

alter table public.users add constraint fk_users_favorite_club
  foreign key (favorite_club_id) references public.clubs(id) on delete set null;
