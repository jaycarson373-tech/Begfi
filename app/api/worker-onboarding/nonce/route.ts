import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabase-admin";
import {
  createNonce,
  nonceHash,
  normalizeWallet,
  workerOnboardingEnabled
} from "@/lib/server/worker-onboarding";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!workerOnboardingEnabled()) {
    return NextResponse.json({ error: "Worker onboarding is not enabled" }, { status: 404 });
  }

  try {
    const wallet = normalizeWallet((await request.json()).wallet);
    const nonce = createNonce();
    const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
    const result = await supabaseAdmin().from("pow_worker_nonces").insert({
      wallet,
      nonce_hash: nonceHash(nonce),
      expires_at: expiresAt
    });
    if (result.error) throw result.error;
    return NextResponse.json({ nonce, message: `POW Worker Verification: ${nonce}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create wallet challenge";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

