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
  status text not null default 'draft' check (status in ('draft', 'approved', 'published', 'rejected')),
  priority integer not null default 50 check (priority between 0 and 100),
  scheduled_for date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  enabled boolean not null default false,
  kill_switch boolean not null default false,
  discovery_daily_limit integer not null default 12 check (discovery_daily_limit between 0 and 50),
  outreach_daily_limit integer not null default 5 check (outreach_daily_limit between 0 and 20),
  follow_up_daily_limit integer not null default 5 check (follow_up_daily_limit between 0 and 20),
  verification_daily_limit integer not null default 50 check (verification_daily_limit between 0 and 200),
  updated_at timestamptz not null default now()
);

insert into public.bot_settings (id) values (1)
on conflict (id) do nothing;

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
