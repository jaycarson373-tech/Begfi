create table if not exists begwork_epochs (
  epoch_id text primary key,
  status text not null check (status in ('running', 'completed', 'failed', 'skipped')),
  mode text not null default 'preview',
  source_mint text not null,
  ansem_mint text not null,
  reward_wallet text,
  eligible_count integer not null default 0,
  claim_lamports text not null default '0',
  reward_wallet_lamports text not null default '0',
  ansem_swap_lamports text not null default '0',
  ansem_bought_raw text not null default '0',
  ansem_bought numeric not null default 0,
  ansem_distributed_raw text not null default '0',
  ansem_distributed numeric not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error text
);

create table if not exists begwork_claims (
  epoch_id text primary key references begwork_epochs(epoch_id) on delete cascade,
  amount_lamports text not null default '0',
  amount_sol numeric not null default 0,
  tx_sig text,
  created_at timestamptz not null default now()
);

create table if not exists begwork_reward_wallet_transfers (
  epoch_id text primary key references begwork_epochs(epoch_id) on delete cascade,
  wallet text not null,
  amount_lamports text not null default '0',
  amount_sol numeric not null default 0,
  tx_sig text,
  created_at timestamptz not null default now()
);

create table if not exists begwork_ansem_swaps (
  epoch_id text primary key references begwork_epochs(epoch_id) on delete cascade,
  base_spent_lamports text not null default '0',
  base_spent_sol numeric not null default 0,
  ansem_received_raw text not null default '0',
  ansem_received numeric not null default 0,
  tx_sig text,
  created_at timestamptz not null default now()
);

create table if not exists begwork_snapshots (
  epoch_id text not null references begwork_epochs(epoch_id) on delete cascade,
  wallet text not null,
  source_balance_raw text not null,
  source_balance numeric not null default 0,
  holder_pct numeric not null default 0,
  created_at timestamptz not null default now(),
  primary key (epoch_id, wallet)
);

create table if not exists begwork_payouts (
  epoch_id text not null references begwork_epochs(epoch_id) on delete cascade,
  wallet text not null,
  reward_asset text not null default 'ANSEM',
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

create table if not exists begwork_verified_begworkers (
  id bigint generated always as identity primary key,
  wallet text not null,
  handle text,
  proof_url text,
  category text not null default 'verified bagwork',
  payout_label text,
  status text not null default 'verified' check (status in ('pending', 'verified', 'paid', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists begwork_epochs_started_at_idx on begwork_epochs(started_at desc);
create index if not exists begwork_snapshots_epoch_balance_idx on begwork_snapshots(epoch_id, source_balance desc);
create index if not exists begwork_payouts_status_updated_idx on begwork_payouts(status, updated_at desc);
create index if not exists begwork_payouts_epoch_status_idx on begwork_payouts(epoch_id, status);
create index if not exists begwork_verified_status_idx on begwork_verified_begworkers(status, created_at desc);

alter table begwork_epochs enable row level security;
alter table begwork_claims enable row level security;
alter table begwork_reward_wallet_transfers enable row level security;
alter table begwork_ansem_swaps enable row level security;
alter table begwork_snapshots enable row level security;
alter table begwork_payouts enable row level security;
alter table begwork_verified_begworkers enable row level security;

drop policy if exists "public read begwork epochs" on begwork_epochs;
drop policy if exists "public read begwork claims" on begwork_claims;
drop policy if exists "public read begwork reward wallet transfers" on begwork_reward_wallet_transfers;
drop policy if exists "public read begwork ansem swaps" on begwork_ansem_swaps;
drop policy if exists "public read begwork snapshots" on begwork_snapshots;
drop policy if exists "public read settled begwork payouts" on begwork_payouts;
drop policy if exists "public read verified begworkers" on begwork_verified_begworkers;

create policy "public read begwork epochs" on begwork_epochs
  for select using (true);

create policy "public read begwork claims" on begwork_claims
  for select using (true);

create policy "public read begwork reward wallet transfers" on begwork_reward_wallet_transfers
  for select using (true);

create policy "public read begwork ansem swaps" on begwork_ansem_swaps
  for select using (true);

create policy "public read begwork snapshots" on begwork_snapshots
  for select using (true);

create policy "public read settled begwork payouts" on begwork_payouts
  for select using (status in ('settled', 'dry_run'));

create policy "public read verified begworkers" on begwork_verified_begworkers
  for select using (status in ('verified', 'paid'));
