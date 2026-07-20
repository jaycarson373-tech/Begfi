import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabase-admin";
import { workerOnboardingEnabled } from "@/lib/server/worker-onboarding";
import {
  onboardingCookieName,
  secureCookie,
  signWorkerSession,
  verifyOnboardingToken,
  workerSessionCookieName
} from "@/lib/server/worker-session";

export const dynamic = "force-dynamic";

function xUrl(value: unknown, kind: "profile" | "post") {
  if (typeof value !== "string") throw new Error(`${kind === "profile" ? "X profile" : "Verification post"} URL is required`);
  const url = new URL(value.trim());
  if (!['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'].includes(url.hostname.toLowerCase())) {
    throw new Error("Use a valid x.com profile and post URL");
  }
  const parts = url.pathname.split("/").filter(Boolean);
  const handle = parts[0]?.replace(/^@/, "");
  if (!handle || !/^[A-Za-z0-9_]{1,15}$/.test(handle)) throw new Error("X handle is invalid");
  if (kind === "post" && (parts[1] !== "status" || !/^\d+$/.test(parts[2] || ""))) {
    throw new Error("Paste the direct URL to your verification post");
  }
  return { url: url.toString(), handle: handle.toLowerCase() };
}

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  if (!workerOnboardingEnabled()) {
    return NextResponse.json({ error: "Worker onboarding is not enabled" }, { status: 404 });
  }

  try {
    const token = cookies().get(onboardingCookieName)?.value;
    if (!token) return NextResponse.json({ error: "Verify your wallet again to continue" }, { status: 401 });
    const claims = await verifyOnboardingToken(token);
    const body = (await request.json()) as { profileUrl?: unknown; postUrl?: unknown };
    const profile = xUrl(body.profileUrl, "profile");
    const post = xUrl(body.postUrl, "post");
    if (profile.handle !== post.handle) {
      return NextResponse.json({ error: "The profile and verification post must belong to the same X account" }, { status: 400 });
    }

    const oembed = await fetch(
      `https://publish.twitter.com/oembed?omit_script=true&dnt=true&url=${encodeURIComponent(post.url)}`,
      { cache: "no-store" }
    );
    if (!oembed.ok) {
      return NextResponse.json({ error: "X could not confirm that public post. Check the URL and try again." }, { status: 400 });
    }
    const proof = (await oembed.json()) as { html?: string; author_url?: string };
    const author = proof.author_url ? xUrl(proof.author_url, "profile") : null;
    if (!author || author.handle !== profile.handle || !plainText(proof.html || "").includes(claims.verificationCode)) {
      return NextResponse.json({ error: `The post must be public and include ${claims.verificationCode}` }, { status: 400 });
    }

    const result = await supabaseAdmin().from("workers").upsert(
      {
        wallet: claims.wallet,
        x_handle: profile.handle,
        x_verification_code: claims.verificationCode,
        x_verification_post_url: post.url,
        x_status: "pending",
        pow_balance_at_apply: claims.balance,
        updated_at: new Date().toISOString()
      },
      { onConflict: "wallet" }
    );
    if (result.error) {
      if (result.error.code === "23505") {
        return NextResponse.json({ error: "That X account is already linked to another active application" }, { status: 409 });
      }
      throw result.error;
    }

    const session = await signWorkerSession(claims.wallet, profile.handle, "pending");
    const response = NextResponse.json({ xHandle: profile.handle, status: "pending" });
    response.cookies.set(workerSessionCookieName, session, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60
    });
    response.cookies.set(onboardingCookieName, "", {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 0
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "X verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

