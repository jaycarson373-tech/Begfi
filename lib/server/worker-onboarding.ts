import "server-only";

import { powDefaultBuyUrl } from "@/lib/pow-config";

import { createHash, randomBytes } from "crypto";
import { PublicKey } from "@solana/web3.js";

const verificationAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function workerOnboardingEnabled() {
  return process.env.WORKER_ONBOARD_ENABLED?.trim().toLowerCase() === "true";
}

export function workerMinimumBalance() {
  const value = Number(process.env.WORKER_MIN_BALANCE?.trim() || "1000000");
  if (!Number.isFinite(value) || value < 0) throw new Error("WORKER_MIN_BALANCE must be a positive number");
  return value;
}

export function normalizeWallet(value: unknown) {
  if (typeof value !== "string") throw new Error("Wallet is required");
  return new PublicKey(value.trim()).toBase58();
}

export function createNonce() {
  return randomBytes(24).toString("hex");
}

export function nonceHash(nonce: string) {
  return createHash("sha256").update(nonce).digest("hex");
}

export function createVerificationCode() {
  const bytes = randomBytes(4);
  const code = Array.from(bytes, (byte) => verificationAlphabet[byte % verificationAlphabet.length]).join("");
  return `POW-${code}`;
}

export function verificationMessage(nonce: string) {
  return `POW Worker Verification: ${nonce}`;
}

export function buyUrl() {
  return process.env.NEXT_PUBLIC_BUY_URL?.trim() || powDefaultBuyUrl;
}
