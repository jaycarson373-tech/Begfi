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
