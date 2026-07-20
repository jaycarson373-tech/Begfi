-- DESTRUCTIVE: run manually in the Supabase SQL Editor only when a full POW
-- data reset is intended. This preserves schemas, policies, views, and migrations.

begin;

truncate table
  public.payouts,
  public.workers,
  public.pow_worker_nonces,
  public.pow_public_leaderboard,
  public.pow_campaign_posts,
  public.pow_campaign_worker_scores,
  public.pow_campaign_funding,
  public.pow_campaigns,
  public.pow_blacklist,
  public.pow_scanner_state,
  public.pow_worker_posts,
  public.pow_worker_applications,
  public.pow_verified_workers,
  public.pow_payouts,
  public.pow_snapshots,
  public.pow_claims,
  public.pow_epochs
restart identity cascade;

commit;
