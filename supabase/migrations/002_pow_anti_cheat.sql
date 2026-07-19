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
