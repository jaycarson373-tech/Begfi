import { NextResponse } from "next/server";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { getPowBalance } from "@/lib/server/helius";
import { supabaseAdmin } from "@/lib/server/supabase-admin";
import {
  buyUrl,
  createVerificationCode,
  nonceHash,
  normalizeWallet,
  verificationMessage,
  workerMinimumBalance,
  workerOnboardingEnabled
} from "@/lib/server/worker-onboarding";
import { onboardingCookieName, secureCookie, signOnboardingToken } from "@/lib/server/worker-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!workerOnboardingEnabled()) {
    return NextResponse.json({ error: "Worker onboarding is not enabled" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as { wallet?: unknown; nonce?: unknown; signature?: unknown };
    const wallet = normalizeWallet(body.wallet);
    if (typeof body.nonce !== "string" || typeof body.signature !== "string") {
      return NextResponse.json({ error: "Nonce and signature are required" }, { status: 400 });
    }

    const challenge = await supabaseAdmin()
      .from("pow_worker_nonces")
      .select("id,wallet,expires_at,used_at")
      .eq("wallet", wallet)
      .eq("nonce_hash", nonceHash(body.nonce))
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();
    if (challenge.error) throw challenge.error;
    if (!challenge.data) {
      return NextResponse.json({ error: "This wallet challenge is invalid or expired" }, { status: 400 });
    }

    const publicKey = new PublicKey(wallet);
    let signature: Uint8Array;
    try {
      signature = bs58.decode(body.signature);
    } catch {
      return NextResponse.json({ error: "Wallet signature is invalid" }, { status: 400 });
    }
    const message = new TextEncoder().encode(verificationMessage(body.nonce));
    if (!nacl.sign.detached.verify(message, signature, publicKey.toBytes())) {
      return NextResponse.json({ error: "Wallet signature does not match the connected wallet" }, { status: 401 });
    }

    const balance = await getPowBalance(wallet);
    const required = workerMinimumBalance();
    const consumed = await supabaseAdmin()
      .from("pow_worker_nonces")
      .update({ used_at: new Date().toISOString() })
      .eq("id", challenge.data.id)
      .is("used_at", null)
      .select("id")
      .maybeSingle();
    if (consumed.error) throw consumed.error;
    if (!consumed.data) {
      return NextResponse.json({ error: "This wallet challenge was already used" }, { status: 409 });
    }

    if (balance < required) {
      return NextResponse.json(
        {
          error: `This wallet holds ${balance.toLocaleString()} $POW. Hold at least ${required.toLocaleString()} $POW to apply.`,
          code: "INSUFFICIENT_BALANCE",
          balance,
          required,
          buyUrl: buyUrl()
        },
        { status: 403 }
      );
    }

    const verificationCode = createVerificationCode();
    const token = await signOnboardingToken({ wallet, balance, verificationCode });
    const response = NextResponse.json({ wallet, balance, required, verificationCode });
    response.cookies.set(onboardingCookieName, token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60
    });
    return response;
  } catch (error) {
    console.error("POW wallet verification failed", error);
    return NextResponse.json({ error: "Wallet verification is temporarily unavailable" }, { status: 500 });
  }
}

