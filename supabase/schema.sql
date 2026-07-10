-- ============================================================
-- Unified Supabase schema for sip-phone-web
-- Run this once in the Supabase SQL Editor; it is idempotent.
-- ============================================================

-- Helper function to auto-update `updated_at` columns.
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- ------------------------------------------------------------
-- 1. User profiles
--    Stores display name, bio, avatar, and the verified sender
--    phone number. One row per authenticated user.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  bio text,
  avatar text,
  phone_number text,
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------
-- 2. SIP credentials
--    Stores SIP login details so users don't have to re-enter
--    them on every device. One row per authenticated user.
-- ------------------------------------------------------------
create table if not exists public.sip_credentials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  username text not null,
  phone_number text not null,
  password text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.sip_credentials enable row level security;

drop policy if exists "Users can read own sip_credentials" on public.sip_credentials;
create policy "Users can read own sip_credentials"
  on public.sip_credentials
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own sip_credentials" on public.sip_credentials;
create policy "Users can insert own sip_credentials"
  on public.sip_credentials
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own sip_credentials" on public.sip_credentials;
create policy "Users can update own sip_credentials"
  on public.sip_credentials
  for update
  using (auth.uid() = user_id);

drop trigger if exists sip_credentials_updated_at on public.sip_credentials;
create trigger sip_credentials_updated_at
  before update on public.sip_credentials
  for each row execute procedure public.handle_updated_at();
