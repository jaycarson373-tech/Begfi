-- POW fresh-project bootstrap.
-- Run this entire file once in the Supabase SQL Editor if you are not using
-- the Supabase CLI migration workflow. It applies migrations 001-007 in order.
-- This creates/updates schema and the native campaign; it does not enable payouts.

begin;

-- -----------------------------------------------------------------------------
-- supabase/migrations/001_pow_rewards.sql
-- -----------------------------------------------------------------------------

create table if not exists pow_epochs (
  epoch_id text primary key,
  status text not null check (status in ('running', 'completed', 'failed', 'skipped')),
  mode text not null default 'preview',
  source_mint text not null,
  reward_asset text not null default 'SOL',
  reward_wallet text,
  eligible_count integer not null default 0,
  claim_lamports text not null default '0',
  distributed_lamports text not null default '0',
  distributed_sol numeric not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error text
);

create table if not exists pow_claims (
  epoch_id text primary key references pow_epochs(epoch_id) on delete cascade,
  amount_lamports text not null default '0',
  amount_sol numeric not null default 0,
  tx_sig text,
  created_at timestamptz not null default now()
);

create table if not exists pow_snapshots (
  epoch_id text not null references pow_epochs(epoch_id) on delete cascade,
  wallet text not null,
  source_balance_raw text not null,
  source_balance numeric not null default 0,
  holder_pct numeric not null default 0,
  created_at timestamptz not null default now(),
  primary key (epoch_id, wallet)
);

create table if not exists pow_payouts (
  epoch_id text not null references pow_epochs(epoch_id) on delete cascade,
  wallet text not null,
  reward_asset text not null default 'SOL',
  reward_amount_raw text not null default '0',
  reward_amount numeric not null default 0,
  idempotency_key text not null unique,
  status text not null check (status in ('planned', 'settled', 'failed', 'dry_run')),
  tx_sig text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (epoch_id, wallet, reward_asset)
);

create table if not exists pow_verified_workers (
  id bigint generated always as identity primary key,
  x_user_id text not null unique,
  x_handle text not null,
  wallet text not null,
  handle text,
  proof_url text,
  application_tweet_id text unique,
  application_text text,
  category text not null default 'verified worker',
  payout_label text,
  status text not null default 'verified' check (status in ('pending', 'verified', 'paid', 'rejected')),
  exclusion_reason text,
  holding_raw text not null default '0',
  holding_tokens numeric not null default 0,
  holding_days numeric not null default 0,
  volume_usd numeric not null default 0,
  score numeric not null default 0,
  engagement_score numeric not null default 0,
  holding_score numeric not null default 0,
  volume_score numeric not null default 0,
  post_count integer not null default 0,
  like_count integer not null default 0,
  repost_count integer not null default 0,
  reply_count integer not null default 0,
  quote_count integer not null default 0,
  impression_count integer not null default 0,
  accepted_at timestamptz not null default now(),
  excluded_at timestamptz,
  last_scored_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table pow_verified_workers
  add column if not exists exclusion_reason text,
  add column if not exists excluded_at timestamptz;

create table if not exists pow_worker_applications (
  tweet_id text primary key,
  x_user_id text not null,
  x_handle text not null,
  wallet text,
  text text not null,
  url text not null,
  holding_raw text not null default '0',
  holding_tokens numeric not null default 0,
  status text not null check (status in ('accepted', 'rejected', 'pending')),
  rejection_reason text,
  tweet_created_at timestamptz,
  scanned_at timestamptz not null default now()
);

create table if not exists pow_worker_posts (
  tweet_id text primary key,
  x_user_id text not null,
  x_handle text not null,
  wallet text not null,
  text text not null,
  url text not null,
  like_count integer not null default 0,
  repost_count integer not null default 0,
  reply_count integer not null default 0,
  quote_count integer not null default 0,
  bookmark_count integer not null default 0,
  impression_count integer not null default 0,
  engagement_score numeric not null default 0,
  tweet_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pow_scanner_state (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists pow_blacklist (
  id bigint generated always as identity primary key,
  wallet text,
  x_user_id text,
  x_handle text,
  reason text not null default 'anti-cheat exclusion',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pow_blacklist_has_identifier check (
    wallet is not null or x_user_id is not null or x_handle is not null
  )
);

create index if not exists pow_epochs_started_at_idx on pow_epochs(started_at desc);
create index if not exists pow_snapshots_epoch_balance_idx on pow_snapshots(epoch_id, source_balance desc);
create index if not exists pow_payouts_status_updated_idx on pow_payouts(status, updated_at desc);
create index if not exists pow_payouts_epoch_status_idx on pow_payouts(epoch_id, status);
create index if not exists pow_verified_workers_status_idx on pow_verified_workers(status, created_at desc);
create index if not exists pow_verified_workers_score_idx on pow_verified_workers(score desc);
create index if not exists pow_worker_posts_author_idx on pow_worker_posts(x_user_id, tweet_created_at desc);
create index if not exists pow_worker_applications_status_idx on pow_worker_applications(status, scanned_at desc);
create index if not exists pow_blacklist_active_wallet_idx on pow_blacklist(active, wallet);
create index if not exists pow_blacklist_active_x_user_idx on pow_blacklist(active, x_user_id);
create index if not exists pow_blacklist_active_x_handle_idx on pow_blacklist(active, lower(x_handle));

alter table pow_epochs enable row level security;
alter table pow_claims enable row level security;
alter table pow_snapshots enable row level security;
alter table pow_payouts enable row level security;
alter table pow_verified_workers enable row level security;
alter table pow_worker_applications enable row level security;
alter table pow_worker_posts enable row level security;
alter table pow_scanner_state enable row level security;
alter table pow_blacklist enable row level security;

drop policy if exists "public read pow epochs" on pow_epochs;
drop policy if exists "public read pow claims" on pow_claims;
drop policy if exists "public read pow snapshots" on pow_snapshots;
drop policy if exists "public read settled pow payouts" on pow_payouts;
drop policy if exists "public read verified workers" on pow_verified_workers;
drop policy if exists "public read accepted pow applications" on pow_worker_applications;
drop policy if exists "public read pow worker posts" on pow_worker_posts;

create policy "public read pow epochs" on pow_epochs
  for select using (true);

create policy "public read pow claims" on pow_claims
  for select using (true);

create policy "public read pow snapshots" on pow_snapshots
  for select using (true);

create policy "public read settled pow payouts" on pow_payouts
  for select using (status in ('settled', 'dry_run'));

create policy "public read verified workers" on pow_verified_workers
  for select using (status in ('verified', 'paid'));

create policy "public read accepted pow applications" on pow_worker_applications
  for select using (status = 'accepted');

create policy "public read pow worker posts" on pow_worker_posts
  for select using (true);

-- -----------------------------------------------------------------------------
-- supabase/migrations/002_pow_anti_cheat.sql
-- -----------------------------------------------------------------------------

alter table pow_verified_workers
  add column if not exists exclusion_reason text,
  add column if not exists excluded_at timestamptz;

create table if not exists pow_blacklist (
  id bigint generated always as identity primary key,
  wallet text,
  x_user_id text,
  x_handle text,
  reason text not null default 'anti-cheat exclusion',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pow_blacklist_has_identifier check (
    wallet is not null or x_user_id is not null or x_handle is not null
  )
);

create index if not exists pow_blacklist_active_wallet_idx on pow_blacklist(active, wallet);
create index if not exists pow_blacklist_active_x_user_idx on pow_blacklist(active, x_user_id);
create index if not exists pow_blacklist_active_x_handle_idx on pow_blacklist(active, lower(x_handle));

alter table pow_blacklist enable row level security;

-- -----------------------------------------------------------------------------
-- supabase/migrations/003_pow_campaigns_privacy_and_token_rewards.sql
-- -----------------------------------------------------------------------------

-- Multi-campaign records, private worker scoring, and $POW payout accounting.
-- Apply after 001_pow_rewards.sql and 002_pow_anti_cheat.sql.

alter table pow_epochs
  add column if not exists campaign_slug text not null default 'pow',
  add column if not exists reward_mint text,
  add column if not exists source_reward_balance_raw text not null default '0',
  add column if not exists source_reward_balance numeric not null default 0,
  add column if not exists distributed_reward_raw text not null default '0',
  add column if not exists distributed_reward_amount numeric not null default 0;

alter table pow_payouts
  add column if not exists campaign_slug text not null default 'pow',
  add column if not exists reward_mint text;

create table if not exists pow_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  project_name text not null,
  token_ticker text not null,
  logo_url text,
  x_account text,
  website text,
  description text not null,
  campaign_keyword text not null,
  funding_asset_type text not null check (funding_asset_type in ('sol', 'spl')),
  funding_symbol text not null,
  funding_mint text,
  funding_amount numeric not null default 0 check (funding_amount >= 0),
  payout_asset text not null default 'POW' check (payout_asset = 'POW'),
  payout_mint text,
  starts_at timestamptz,
  ends_at timestamptz,
  winner_count integer not null default 10 check (winner_count > 0),
  eligibility_rules jsonb not null default '[]'::jsonb,
  reward_rules jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'funding', 'active', 'paused', 'completed', 'cancelled')),
  funding_status text not null default 'awaiting_deposit'
    check (funding_status in ('awaiting_deposit', 'awaiting_conversion', 'ready', 'depleted', 'refunded')),
  native boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pow_campaign_spl_mint_required check (
    funding_asset_type = 'sol' or funding_mint is not null
  )
);

create table if not exists pow_campaign_funding (
  id bigint generated always as identity primary key,
  campaign_id uuid not null references pow_campaigns(id) on delete cascade,
  depositor_wallet text not null,
  deposit_wallet text not null,
  funding_asset_type text not null check (funding_asset_type in ('sol', 'spl')),
  funding_mint text,
  funding_amount_raw text not null,
  funding_amount numeric not null check (funding_amount > 0),
  tx_sig text not null unique,
  status text not null default 'confirmed'
    check (status in ('pending', 'confirmed', 'awaiting_conversion', 'converted', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pow_campaign_worker_scores (
  campaign_id uuid not null references pow_campaigns(id) on delete cascade,
  x_user_id text not null,
  x_handle text not null,
  wallet text not null,
  status text not null default 'pending'
    check (status in ('pending', 'eligible', 'ineligible', 'excluded', 'paid')),
  meets_minimum boolean not null default false,
  score numeric not null default 0,
  social_score numeric not null default 0,
  onchain_score numeric not null default 0,
  holding_score numeric not null default 0,
  volume_score numeric not null default 0,
  post_count integer not null default 0,
  impression_count bigint not null default 0,
  last_scored_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, x_user_id)
);

create table if not exists pow_campaign_posts (
  campaign_id uuid not null references pow_campaigns(id) on delete cascade,
  tweet_id text not null,
  x_user_id text not null,
  x_handle text not null,
  wallet text not null,
  text text not null,
  url text not null,
  engagement_score numeric not null default 0,
  impression_count bigint not null default 0,
  tweet_created_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (campaign_id, tweet_id)
);

create table if not exists pow_public_leaderboard (
  campaign_id uuid not null references pow_campaigns(id) on delete cascade,
  campaign_slug text not null,
  x_user_id text not null,
  x_handle text not null,
  rank integer not null,
  score numeric not null default 0,
  meets_minimum boolean not null default false,
  worker_status text not null,
  post_count integer not null default 0,
  impression_count bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (campaign_id, x_user_id)
);

create index if not exists pow_campaigns_status_idx
  on pow_campaigns(status, starts_at, ends_at);
create index if not exists pow_campaign_scores_rank_idx
  on pow_campaign_worker_scores(campaign_id, score desc);
create index if not exists pow_campaign_posts_author_idx
  on pow_campaign_posts(campaign_id, x_user_id, tweet_created_at desc);
create index if not exists pow_public_leaderboard_rank_idx
  on pow_public_leaderboard(campaign_id, rank);
create index if not exists pow_verified_workers_wallet_idx
  on pow_verified_workers(wallet);

alter table pow_campaigns enable row level security;
alter table pow_campaign_funding enable row level security;
alter table pow_campaign_worker_scores enable row level security;
alter table pow_campaign_posts enable row level security;
alter table pow_public_leaderboard enable row level security;

-- Wallets remain server-side. The browser only receives the sanitized leaderboard.
drop policy if exists "public read pow epochs" on pow_epochs;
drop policy if exists "public read pow claims" on pow_claims;
drop policy if exists "public read pow snapshots" on pow_snapshots;
drop policy if exists "public read settled pow payouts" on pow_payouts;
drop policy if exists "public read verified workers" on pow_verified_workers;
drop policy if exists "public read accepted pow applications" on pow_worker_applications;
drop policy if exists "public read pow worker posts" on pow_worker_posts;

revoke all on table pow_epochs from anon, authenticated;
revoke all on table pow_claims from anon, authenticated;
revoke all on table pow_snapshots from anon, authenticated;
revoke all on table pow_payouts from anon, authenticated;
revoke all on table pow_verified_workers from anon, authenticated;
revoke all on table pow_worker_applications from anon, authenticated;
revoke all on table pow_worker_posts from anon, authenticated;
revoke all on table pow_scanner_state from anon, authenticated;
revoke all on table pow_blacklist from anon, authenticated;
revoke all on table pow_campaign_funding from anon, authenticated;
revoke all on table pow_campaign_worker_scores from anon, authenticated;
revoke all on table pow_campaign_posts from anon, authenticated;

drop policy if exists "public read active pow campaigns" on pow_campaigns;
create policy "public read active pow campaigns" on pow_campaigns
  for select using (status in ('active', 'completed'));

drop policy if exists "public read pow leaderboard" on pow_public_leaderboard;
create policy "public read pow leaderboard" on pow_public_leaderboard
  for select using (true);

grant select on table pow_campaigns to anon, authenticated;
grant select on table pow_public_leaderboard to anon, authenticated;

insert into pow_campaigns (
  slug,
  project_name,
  token_ticker,
  logo_url,
  description,
  campaign_keyword,
  funding_asset_type,
  funding_symbol,
  payout_asset,
  winner_count,
  eligibility_rules,
  reward_rules,
  status,
  funding_status,
  native
)
values (
  'pow',
  'WORK Campaign',
  '$POW',
  null,
  'The native campaign rewards verified contributors helping grow $POW.',
  '$POW',
  'sol',
  'Protocol Fees',
  'POW',
  100,
  '["Verified X account", "Minimum $POW holding", "Qualifying public $POW posts"]'::jsonb,
  '{"type":"score_weighted","cadence_minutes":15}'::jsonb,
  'active',
  'ready',
  true
)
on conflict (slug) do update set
  project_name = 'WORK Campaign',
  logo_url = null,
  payout_asset = 'POW',
  status = 'active',
  native = true,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- supabase/migrations/004_pow_worker_onboarding.sql
-- -----------------------------------------------------------------------------

-- Signed wallet onboarding and pending X-account verification.
-- The existing hashtag scanner remains available as a fallback.

create table if not exists workers (
  wallet text primary key,
  x_handle text,
  x_verification_code text,
  x_verification_post_url text,
  x_status text not null default 'pending'
    check (x_status in ('pending', 'verified', 'rejected')),
  pow_balance_at_apply numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pow_worker_nonces (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  nonce_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists workers_x_handle_unique_idx
  on workers (lower(x_handle))
  where x_handle is not null and x_status <> 'rejected';

create index if not exists workers_x_status_created_idx
  on workers (x_status, created_at desc);

create index if not exists pow_worker_nonces_wallet_expiry_idx
  on pow_worker_nonces (wallet, expires_at desc)
  where used_at is null;

alter table workers enable row level security;
alter table pow_worker_nonces enable row level security;

revoke all on table workers from anon, authenticated;
revoke all on table pow_worker_nonces from anon, authenticated;


-- -----------------------------------------------------------------------------
-- supabase/migrations/005_pow_campaign_funding_wallets.sql
-- -----------------------------------------------------------------------------

-- Verifiable campaign custody addresses. Public campaign visibility is enforced
-- by the Next.js server after a live Helius balance check.

alter table pow_campaigns
  add column if not exists funding_wallet text,
  add column if not exists funding_token text;

create index if not exists pow_campaigns_public_funding_idx
  on pow_campaigns (status, funding_wallet)
  where funding_wallet is not null;

update pow_campaigns
set
  project_name = 'WORK Campaign',
  logo_url = null,
  funding_token = coalesce(funding_token, payout_mint, funding_mint),
  updated_at = now()
where slug = 'pow';


-- -----------------------------------------------------------------------------
-- supabase/migrations/006_pow_payout_receipts.sql
-- -----------------------------------------------------------------------------

-- Public payout receipts. Planned rows are written before a transaction is
-- broadcast; only confirmed rows are granted to the public read role.

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  campaign_id uuid references pow_campaigns(id),
  wallet text not null,
  x_handle text,
  amount numeric not null check (amount >= 0),
  token text not null default 'POW' check (token = 'POW'),
  tx_signature text,
  status text not null default 'planned'
    check (status in ('planned', 'confirmed', 'failed', 'dry_run')),
  error text,
  paid_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, wallet)
);

-- Real signatures are globally unique. Dry-run rows intentionally share the
-- DRYRUN-{run_id} marker and are never publicly readable.
create unique index if not exists payouts_confirmed_tx_signature_unique_idx
  on payouts (tx_signature)
  where tx_signature is not null and status <> 'dry_run';

create index if not exists payouts_campaign_paid_idx
  on payouts (campaign_id, paid_at desc)
  where status = 'confirmed';

create index if not exists payouts_handle_paid_idx
  on payouts (lower(x_handle), paid_at desc)
  where status = 'confirmed';

alter table payouts enable row level security;

drop policy if exists "public read confirmed payout receipts" on payouts;
create policy "public read confirmed payout receipts" on payouts
  for select using (
    status = 'confirmed'
    and tx_signature is not null
    and tx_signature not like 'DRYRUN-%'
  );

grant select on table payouts to anon, authenticated;
revoke insert, update, delete on table payouts from anon, authenticated;

create or replace view pow_payout_totals
with (security_invoker = true)
as
select
  campaign_id,
  wallet,
  (array_agg(x_handle order by paid_at desc) filter (where x_handle is not null))[1] as x_handle,
  sum(amount) as amount,
  'POW'::text as token
from payouts
where
  status = 'confirmed'
  and tx_signature is not null
  and tx_signature not like 'DRYRUN-%'
group by campaign_id, wallet;

revoke all on table pow_payout_totals from anon, authenticated;


-- -----------------------------------------------------------------------------
-- supabase/migrations/007_pow_brand_assets.sql
-- -----------------------------------------------------------------------------

update public.pow_campaigns
set logo_url = null
where native = true;

-- -----------------------------------------------------------------------------
-- supabase/migrations/008_work_brand.sql
-- -----------------------------------------------------------------------------

update public.pow_campaigns
set
  project_name = 'WORK Campaign',
  description = 'The native campaign for contributors working to grow $POW.',
  logo_url = null,
  updated_at = now()
where native = true;

commit;
