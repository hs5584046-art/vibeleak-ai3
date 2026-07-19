-- V15 Career + Sales Agent
-- Run once in Supabase SQL Editor before enabling automated sends.

create table if not exists public.agent_profile (
  id integer primary key default 1 check (id = 1),
  full_name text not null,
  current_title text not null,
  location text not null,
  email text not null,
  profile_url text,
  resume_url text,
  target_roles text[] not null default '{}',
  target_countries text[] not null default '{}',
  service_offers text[] not