-- Tech Club Technology Conference registrations schema

-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists conference_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  email text not null,
  first_name text not null,
  last_name text not null,
  age integer,
  major text,
  expectations text,
  participation text check (participation in ('attending','presenting')) default 'attending',
  unique_code text not null unique,
  checked_in boolean not null default false,
  checked_in_at timestamp with time zone,
  notes text
);

create index if not exists idx_conference_registrations_email on conference_registrations (email);
create index if not exists idx_conference_registrations_unique_code on conference_registrations (unique_code);

-- Enable Row Level Security and allow inserts/selects for anon users (form submission)
alter table conference_registrations enable row level security;

-- Policies: allow anyone to insert a registration, but not view others' data.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conference_registrations' and policyname = 'Allow insert for all'
  ) then
    create policy "Allow insert for all" on conference_registrations for insert to anon, authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conference_registrations' and policyname = 'Allow select own by email'
  ) then
    create policy "Allow select own by email" on conference_registrations for select to authenticated using (email = auth.email());
  end if;

  -- Allow updates for check-in (broad policy; tighten later if needed)
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conference_registrations' and policyname = 'Allow update for all'
  ) then
    create policy "Allow update for all" on conference_registrations for update to anon, authenticated using (true) with check (true);
  end if;
end $$;


