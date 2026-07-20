import "server-only";

import { SignJWT, jwtVerify } from "jose";

export const onboardingCookieName = "pow_worker_onboarding";
export const workerSessionCookieName = "pow_worker_session";

export type OnboardingClaims = {
  wallet: string;
  balance: number;
  verificationCode: string;
};

function secret() {
  const value = process.env.SESSION_SECRET?.trim();
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  return new TextEncoder().encode(value);
}

async function signToken(payload: Record<string, unknown>, expiresIn: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret());
}

export function signOnboardingToken(claims: OnboardingClaims) {
  return signToken({ ...claims, purpose: "worker-onboarding" }, "15m");
}

export function signWorkerSession(wallet: string, xHandle: string, status: string) {
  return signToken({ wallet, xHandle, status, purpose: "worker-session" }, "24h");
}

export async function verifyOnboardingToken(token: string) {
  const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
  if (payload.purpose !== "worker-onboarding") throw new Error("Invalid onboarding session");
  if (
    typeof payload.wallet !== "string" ||
    typeof payload.balance !== "number" ||
    typeof payload.verificationCode !== "string"
  ) {
    throw new Error("Invalid onboarding session");
  }
  return payload as unknown as OnboardingClaims;
}

export const secureCookie = process.env.NODE_ENV === "production";

