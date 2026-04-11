-- ═══════════════════════════════════════════
-- FASE 2: Gestió de Club
-- - Disponibilitat de jugadors
-- - Productes de botiga
-- - Cuotes / socis
-- ═══════════════════════════════════════════

-- ───── AVAILABILITY ─────
create type availability_status as enum ('yes', 'no', 'maybe', 'pending');

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  status availability_status not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, match_id)
);

create index idx_availability_match on public.availability(match_id);
create index idx_availability_user on public.availability(user_id);

alter table public.availability enable row level security;

create policy "Anyone read availability" on public.availability for select using (true);
create policy "Own insert availability" on public.availability for insert
  with check (auth.uid() = user_id);
create policy "Own update availability" on public.availability for update
  using (auth.uid() = user_id);
create policy "Own delete availability" on public.availability for delete
  using (auth.uid() = user_id);

-- ───── PRODUCTS ─────
create type product_category as enum ('shirt', 'equipment', 'accessory', 'kids', 'other');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  description text,
  category product_category not null default 'other',
  price_cents int not null,
  original_price_cents int,
  image_url text,
  in_stock boolean default true,
  is_new boolean default false,
  is_pack boolean default false,
  created_at timestamptz not null default now()
);

create index idx_products_club on public.products(club_id);

alter table public.products enable row level security;

create policy "Anyone read products" on public.products for select using (true);
create policy "Admins manage products" on public.products for all
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- ───── MEMBERSHIPS (Cuotes) ─────
create type membership_status as enum ('paid', 'pending', 'overdue');

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  club_id uuid not null references public.clubs(id) on delete cascade,
  member_name text not null,
  member_number text,
  team_category text,
  amount_cents int not null,
  status membership_status not null default 'pending',
  due_date date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_memberships_club on public.memberships(club_id);
create index idx_memberships_user on public.memberships(user_id);
create index idx_memberships_status on public.memberships(status);

alter table public.memberships enable row level security;

create policy "Admins read memberships" on public.memberships for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));
create policy "Own memberships read" on public.memberships for select
  using (auth.uid() = user_id);
create policy "Admins manage memberships" on public.memberships for all
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- Enable realtime for availability
alter publication supabase_realtime add table public.availability;
