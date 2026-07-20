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

