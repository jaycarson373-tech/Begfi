-- Rebrand the native public campaign without changing any campaign, worker,
-- scanner, or payout identifiers used by the backend.

update public.pow_campaigns
set
  project_name = 'WORK Campaign',
  description = 'The native campaign for contributors working to grow $POW.',
  logo_url = null,
  updated_at = now()
where native = true;
