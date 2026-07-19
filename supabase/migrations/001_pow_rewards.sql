create table if not exists pow_epochs (
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

create table if not exists pow_claims (
  epoch_id text primary key references pow_epochs(epoch_id) on delete cascade,
  amount_lamports text not null default '0',
  amount_sol numeric not null default 0,
  tx_sig text,
  created_at timestamptz not null default now()
);

create table if not exists pow_bounty_wallet_transfers (
  epoch_id text primary key references pow_epochs(epoch_id) on delete cascade,
  wallet text not null,
  amount_lamports text not null default '0',
  amount_sol numeric not null default 0,
  tx_sig text,
  created_at timestamptz not null default now()
);

create table if not exists pow_ansem_swaps (
  epoch_id text primary key references pow_epochs(epoch_id) on delete cascade,
  base_spent_lamports text not null default '0',
  base_spent_sol numeric not null default 0,
  ansem_received_raw text not null default '0',
  ansem_received numeric not null default 0,
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

create table if not exists pow_verified_workers (
  id bigint generated always as identity primary key,
  wallet text not null,
  handle text,
  proof_url text,
  category text not null default 'verified work',
  payout_label text,
  status text not null default 'verified' check (status in ('pending', 'verified', 'paid', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pow_epochs_started_at_idx on pow_epochs(started_at desc);
create index if not exists pow_snapshots_epoch_balance_idx on pow_snapshots(epoch_id, source_balance desc);
create index if not exists pow_payouts_status_updated_idx on pow_payouts(status, updated_at desc);
create index if not exists pow_payouts_epoch_status_idx on pow_payouts(epoch_id, status);
create index if not exists pow_verified_workers_status_idx on pow_verified_workers(status, created_at desc);

alter table pow_epochs enable row level security;
alter table pow_claims enable row level security;
alter table pow_bounty_wallet_transfers enable row level security;
alter table pow_ansem_swaps enable row level security;
alter table pow_snapshots enable row level security;
alter table pow_payouts enable row level security;
alter table pow_verified_workers enable row level security;

drop policy if exists "public read pow epochs" on pow_epochs;
drop policy if exists "public read pow claims" on pow_claims;
drop policy if exists "public read pow bounty wallet transfers" on pow_bounty_wallet_transfers;
drop policy if exists "public read pow ansem swaps" on pow_ansem_swaps;
drop policy if exists "public read pow snapshots" on pow_snapshots;
drop policy if exists "public read settled pow payouts" on pow_payouts;
drop policy if exists "public read verified workers" on pow_verified_workers;

create policy "public read pow epochs" on pow_epochs
  for select using (true);

create policy "public read pow claims" on pow_claims
  for select using (true);

create policy "public read pow bounty wallet transfers" on pow_bounty_wallet_transfers
  for select using (true);

create policy "public read pow ansem swaps" on pow_ansem_swaps
  for select using (true);

create policy "public read pow snapshots" on pow_snapshots
  for select using (true);

create policy "public read settled pow payouts" on pow_payouts
  for select using (status in ('settled', 'dry_run'));

create policy "public read verified workers" on pow_verified_workers
  for select using (status in ('verified', 'paid'));
