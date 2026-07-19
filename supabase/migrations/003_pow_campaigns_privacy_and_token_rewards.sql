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
  'Proof of Work Campaign',
  '$POW',
  '/images/pow-logo.png',
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
  payout_asset = 'POW',
  status = 'active',
  native = true,
  updated_at = now();
