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

-- ------------------------------------------------------------
-- 3. Phone directory lookup
--    Lets authenticated users resolve a phone number to another
--    app user's SIP username for browser-to-browser calls.
--    Only exposes name and username; password stays private.
-- ------------------------------------------------------------
create or replace function public.lookup_user_by_phone(target_phone text)
returns table(name text, sip_username text) as $$
declare
  normalized text;
begin
  normalized := regexp_replace(target_phone, '[^0-9]', '', 'g');
  return query
    select p.name, s.username as sip_username
    from public.profiles p
    join public.sip_credentials s on p.id = s.user_id
    where regexp_replace(p.phone_number, '[^0-9]', '', 'g') = normalized
      and p.phone_number is not null
      and s.username is not null
    limit 1;
end;
$$ language plpgsql security definer;
