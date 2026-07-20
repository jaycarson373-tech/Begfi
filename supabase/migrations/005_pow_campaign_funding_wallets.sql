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
  project_name = 'POW Campaign',
  logo_url = '/images/pow-network-mark.svg',
  funding_token = coalesce(funding_token, payout_mint, funding_mint),
  updated_at = now()
where slug = 'pow';

