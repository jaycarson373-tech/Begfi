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

