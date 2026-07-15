create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null,
  profile_id text not null,
  profile_title text not null,
  report jsonb not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, assessment_id, completed_at)
);

create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  assessment_id text not null,
  preview jsonb not null,
  report jsonb not null,
  access_token_hash text not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  active boolean not null default true,
  max_redemptions integer,
  redemption_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  product_id text not null,
  customer_name text not null,
  customer_email text not null,
  utr text not null,
  amount_paise integer not null check (amount_paise >= 0),
  discount_paise integer not null default 0 check (discount_paise >= 0),
  final_amount_paise integer not null check (final_amount_paise >= 0),
  currency text not null default 'INR',
  coupon_code text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  status_token_hash text not null,
  status_token_ciphertext text not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  rejection_reason text
);

create unique index if not exists payment_requests_utr_unique
on public.payment_requests (lower(utr));

create index if not exists assessment_reports_user_created_idx
on public.assessment_reports (user_id, created_at desc);

create index if not exists payment_requests_status_created_idx
on public.payment_requests (status, created_at desc);

alter table public.profiles enable row level security;
alter table public.assessment_reports enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.coupons enable row level security;
alter table public.payment_requests enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "reports_select_own" on public.assessment_reports;
create policy "reports_select_own"
on public.assessment_reports for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "reports_insert_own" on public.assessment_reports;
create policy "reports_insert_own"
on public.assessment_reports for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "reports_delete_own" on public.assessment_reports;
create policy "reports_delete_own"
on public.assessment_reports for delete to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.coupons (
  code, discount_type, discount_value, active, max_redemptions, starts_at, expires_at
)
values (
  'VIBE20', 'percent', 20, true, 500, now(), '2027-12-31 23:59:59+00'
)
on conflict (code) do nothing;


create or replace function public.increment_coupon_redemption(coupon_to_increment text)
returns void
language sql
security definer set search_path = ''
as $$
  update public.coupons
  set redemption_count = redemption_count + 1
  where code = coupon_to_increment
    and active = true
    and (max_redemptions is null or redemption_count < max_redemptions);
$$;

revoke all on function public.increment_coupon_redemption(text) from public;
revoke all on function public.increment_coupon_redemption(text) from anon;
revoke all on function public.increment_coupon_redemption(text) from authenticated;
grant execute on function public.increment_coupon_redemption(text) to service_role;


create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  path text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_name_created_idx
on public.analytics_events (event_name, created_at desc);

alter table public.analytics_events enable row level security;
-- No public policy: events are written and read only through server-side service-role routes.
create table if not exists public.growth_items (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('seo', 'content', 'backlink', 'social', 'ads')),
  title text not null,
  objective text not null,
  target_url text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'approved', 'processing', 'published', 'blocked', 'failed', 'rejected')),
  priority integer not null default 50 check (priority between 0 and 100),
  scheduled_for date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- V7.6: broaden growth execution states for truthful autonomous monitoring.
do $$
begin
  alter table public.growth_items drop constraint if exists growth_items_status_check;
  alter table public.growth_items add constraint growth_items_status_check
    check (status in ('draft','approved','processing','published','blocked','failed','rejected'));
exception when others then null;
end $$;
create index if not exists growth_items_schedule_priority_idx
on public.growth_items (scheduled_for desc, priority desc);

alter table public.growth_items enable row level security;
-- Growth items are available only through server-side administrator routes.
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null unique,
  owner_user_id uuid references auth.users(id) on delete cascade,
  visits integer not null default 0,
  assessment_starts integer not null default 0,
  purchases integer not null default 0,
  revenue_paise bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.autopilot_runs (
  id bigint generated always as identity primary key,
  run_type text not null,
  status text not null check (status in ('started', 'completed', 'failed')),
  summary jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.referrals enable row level security;
alter table public.autopilot_runs enable row level security;

drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own"
on public.referrals for select to authenticated
using ((select auth.uid()) = owner_user_id);
-- Writes use server-side service-role routes only.
create table if not exists public.bot_settings (
  id integer primary key default 1 check (id = 1),
  enabled boolean not null default true,
  kill_switch boolean not null default false,
  discovery_daily_limit integer not null default 12 check (discovery_daily_limit between 0 and 50),
  outreach_daily_limit integer not null default 5 check (outreach_daily_limit between 0 and 20),
  follow_up_daily_limit integer not null default 5 check (follow_up_daily_limit between 0 and 20),
  verification_daily_limit integer not null default 50 check (verification_daily_limit between 0 and 200),
  updated_at timestamptz not null default now()
);

insert into public.bot_settings (id, enabled) values (1, true)
on conflict (id) do update set enabled = true, updated_at = now();

create table if not exists public.backlink_prospects (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  domain text not null,
  contact_email text,
  relevance_score integer not null default 0 check (relevance_score between 0 and 100),
  status text not null default 'discovered'
    check (status in ('discovered','ready','contacted','approved','live','lost','rejected','unsubscribed')),
  source text not null default 'public-search',
  follow_up_count integer not null default 0 check (follow_up_count between 0 and 2),
  last_contacted_at timestamptz,
  backlink_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists backlink_prospects_status_score_idx
on public.backlink_prospects (status, relevance_score desc);

create table if not exists public.outreach_messages (
  id bigint generated always as identity primary key,
  prospect_id uuid not null references public.backlink_prospects(id) on delete cascade,
  recipient text not null,
  subject text not null,
  body_html text not null,
  status text not null check (status in ('queued','sent','failed','replied','unsubscribed')),
  follow_up_number integer not null default 0 check (follow_up_number between 0 and 2),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.autonomous_resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  body jsonb not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists autonomous_resources_status_published_idx
on public.autonomous_resources (status, published_at desc);

alter table public.bot_settings enable row level security;
alter table public.backlink_prospects enable row level security;
alter table public.outreach_messages enable row level security;
alter table public.autonomous_resources enable row level security;
-- All writes and admin reads use service-role server routes.
-- Published resources are exposed only through the server-rendered public route.

create table if not exists public.seo_overrides (
  path text primary key,
  title text not null,
  description text not null,
  updated_at timestamptz not null default now()
);

alter table public.seo_overrides enable row level security;
-- SEO overrides are written by the service-role worker and read server-side only.

create table if not exists public.external_distribution_posts (
  id bigint generated always as identity primary key,
  platform text not null check (platform in ('mastodon','bluesky','devto','wordpress')),
  source_url text not null,
  external_url text,
  external_id text,
  status text not null default 'queued' check (status in ('queued','published','failed','skipped')),
  error_message text,
  attempt_count integer not null default 0 check (attempt_count between 0 and 10),
  next_retry_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, source_url)
);

create index if not exists external_distribution_status_idx
on public.external_distribution_posts (status, created_at desc);

alter table public.external_distribution_posts enable row level security;
-- External distribution logs are available only through service-role/admin routes.


-- V7.6 retry columns for existing installations.
alter table public.external_distribution_posts add column if not exists attempt_count integer not null default 0;
alter table public.external_distribution_posts add column if not exists next_retry_at timestamptz;

-- V8 Autonomous Growth OS: daily evidence snapshots and durable learning memory.
create table if not exists public.growth_metrics_daily (
  id bigint generated always as identity primary key,
  metric_date date not null,
  source text not null,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(metric_date, source)
);
create table if not exists public.growth_memory (
  memory_key text primary key,
  memory_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.growth_metrics_daily enable row level security;
alter table public.growth_memory enable row level security;

-- V9 constrained production architecture: durable, resumable, idempotent job queue.
create table if not exists public.growth_jobs (
  id bigint generated always as identity primary key,
  job_key text not null unique,
  job_type text not null check (job_type in ('collect_signals','evaluate_memory','evaluate_experiments','evaluate_agents','ensure_plan','execute_worker')),
  status text not null default 'queued' check (status in ('queued','running','completed','dead')),
  priority integer not null default 50 check (priority between 0 and 100),
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  attempt_count integer not null default 0 check (attempt_count between 0 and 10),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists growth_jobs_claim_idx on public.growth_jobs (status, available_at, priority desc, id);
alter table public.growth_jobs enable row level security;

create or replace function public.claim_growth_jobs(jobs_to_claim integer default 4)
returns setof public.growth_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  worker_id text := gen_random_uuid()::text;
begin
  return query
  with candidates as (
    select id from public.growth_jobs
    where status = 'queued' and available_at <= now()
    order by priority desc, id
    for update skip locked
    limit greatest(1, least(jobs_to_claim, 10))
  )
  update public.growth_jobs j
  set status = 'running', locked_at = now(), locked_by = worker_id, updated_at = now()
  from candidates c
  where j.id = c.id
  returning j.*;
end;
$$;
revoke all on function public.claim_growth_jobs(integer) from public, anon, authenticated;
grant execute on function public.claim_growth_jobs(integer) to service_role;


-- V10 migration: adaptive experiment evaluation job type.
do $$
begin
  alter table public.growth_jobs drop constraint if exists growth_jobs_job_type_check;
  alter table public.growth_jobs add constraint growth_jobs_job_type_check
    check (job_type in ('collect_signals','evaluate_memory','evaluate_experiments','evaluate_agents','ensure_plan','execute_worker'));
exception when others then null;
end $$;


-- V12 Agentic Growth OS: durable daily decisions from the logical agent council.
create table if not exists public.agent_runs (
  id bigint generated always as identity primary key,
  run_date date not null,
  agent_name text not null,
  status text not null check (status in ('ready','blocked','watch')),
  priority integer not null check (priority between 0 and 100),
  confidence integer not null check (confidence between 0 and 100),
  objective text not null,
  actions jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(run_date, agent_name)
);
create index if not exists agent_runs_date_priority_idx on public.agent_runs (run_date desc, priority desc);
alter table public.agent_runs enable row level security;
