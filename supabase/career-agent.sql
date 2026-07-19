-- V15 Career + Sales Agent
-- Run once in Supabase SQL Editor before enabling authorised sending.

create extension if not exists pgcrypto;

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
  service_offers text[] not null default '{}',
  enabled boolean not null default false,
  daily_send_limit integer not null default 10 check (daily_send_limit between 0 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_opportunities (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('job','company','client')),
  external_key text not null unique,
  title text not null,
  organisation text not null,
  location text,
  source text not null,
  source_url text not null,
  contact_email text,
  description text,
  match_score integer not null default 0 check (match_score between 0 and 100),
  match_reasons jsonb not null default '[]'::jsonb,
  status text not null default 'discovered' check (status in ('discovered','eligible','queued','contacted','replied','rejected','closed','blocked')),
  discovered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists career_opportunities_status_score_idx
on public.career_opportunities (status, match_score desc, discovered_at desc);

create table if not exists public.career_outreach (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.career_opportunities(id) on delete cascade,
  recipient text not null,
  subject text not null,
  body_text text not null,
  message_type text not null check (message_type in ('initial','follow_up_1','follow_up_2')),
  status text not null default 'queued' check (status in ('queued','sending','sent','failed','replied','bounced','suppressed')),
  provider_message_id text,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique (opportunity_id, message_type)
);

create index if not exists career_outreach_due_idx
on public.career_outreach (status, scheduled_for, created_at);

create table if not exists public.career_suppressions (
  email text primary key,
  reason text not null check (reason in ('opt_out','bounce','complaint','manual','reply')),
  source text not null default 'system',
  created_at timestamptz not null default now()
);

create table if not exists public.career_agent_runs (
  id bigint generated always as identity primary key,
  status text not null check (status in ('started','completed','failed')),
  summary jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.agent_profile enable row level security;
alter table public.career_opportunities enable row level security;
alter table public.career_outreach enable row level security;
alter table public.career_suppressions enable row level security;
alter table public.career_agent_runs enable row level security;
-- No public policies. All access is through service-role server routes.

insert into public.agent_profile (
  id, full_name, current_title, location, email, target_roles, target_countries, service_offers, enabled
)
values (
  1,
  'Himanshu Singh',
  'Assistant Director – Foreign Markets',
  'Niš, Serbia',
  'hrj107@gmail.com',
  array['International Business Development','Business Development Manager','Business Development Director','Commercial Manager','Partnerships Manager','Country Manager','Regional Manager'],
  array['Serbia','Remote','Germany','Netherlands','Poland','Romania','Slovenia','Slovakia','Malta','Estonia','Latvia','Lithuania','Sweden','Greece'],
  array['International business development','B2B lead generation','Market research','Commercial outreach','Proposal writing'],
  false
)
on conflict (id) do update
set email = excluded.email,
    updated_at = now();