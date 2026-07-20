"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  ExternalLink,
  Loader2,
  LogOut,
  ShieldCheck,
  Wallet,
  X
} from "lucide-react";

type WalletProof = { verificationCode: string; balance: number; required: number };
type ApiError = { error?: string; code?: string; buyUrl?: string };

async function jsonResponse<T>(response: Response) {
  const body = (await response.json()) as T & ApiError;
  if (!response.ok) throw Object.assign(new Error(body.error || "Request failed"), body);
  return body;
}

function shortWallet(value: string) {
  return `${value.slice(0, 5)}...${value.slice(-5)}`;
}

export function WorkerOnboarding() {
  const { wallets, wallet, publicKey, connected, connecting, select, connect, disconnect, signMessage } = useWallet();
  const [open, setOpen] = useState(false);
  const [connectAfterSelect, setConnectAfterSelect] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [buyUrl, setBuyUrl] = useState("");
  const [proof, setProof] = useState<WalletProof | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [linkedHandle, setLinkedHandle] = useState("");
  const phantom = useMemo(() => wallets.find((item) => item.adapter.name === "Phantom"), [wallets]);

  useEffect(() => {
    if (!connectAfterSelect || !wallet || connected || connecting) return;
    setConnectAfterSelect(false);
    connect().catch((reason) => setError(reason instanceof Error ? reason.message : "Phantom could not connect"));
  }, [connect, connectAfterSelect, connected, connecting, wallet]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function connectPhantom() {
    setError("");
    if (!phantom) return setError("Phantom is not available in this browser.");
    if (!wallet) {
      select(phantom.adapter.name);
      setConnectAfterSelect(true);
      return;
    }
    try {
      await connect();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Phantom could not connect");
    }
  }

  async function verifyWallet() {
    if (!publicKey || !signMessage) return setError("Phantom must support message signing.");
    setBusy(true);
    setError("");
    setBuyUrl("");
    try {
      const nonce = await jsonResponse<{ nonce: string; message: string }>(
        await fetch("/api/worker-onboarding/nonce", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: publicKey.toBase58() })
        })
      );
      const signature = await signMessage(new TextEncoder().encode(nonce.message));
      const result = await jsonResponse<WalletProof>(
        await fetch("/api/worker-onboarding/verify-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: publicKey.toBase58(),
            nonce: nonce.nonce,
            signature: bs58.encode(signature)
          })
        })
      );
      setProof(result);
    } catch (reason) {
      const failure = reason as Error & ApiError;
      setError(failure.message || "Wallet verification failed");
      if (failure.code === "INSUFFICIENT_BALANCE" && failure.buyUrl) setBuyUrl(failure.buyUrl);
    } finally {
      setBusy(false);
    }
  }

  async function disconnectWallet() {
    setBusy(true);
    setError("");
    try {
      await fetch("/api/worker-onboarding/logout", { method: "POST" });
      await disconnect();
      setProof(null);
      setProfileUrl("");
      setPostUrl("");
      setLinkedHandle("");
      setBuyUrl("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wallet could not disconnect");
    } finally {
      setBusy(false);
    }
  }

  async function linkX() {
    setBusy(true);
    setError("");
    try {
      const result = await jsonResponse<{ xHandle: string }>(
        await fetch("/api/worker-onboarding/link-x", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileUrl, postUrl })
        })
      );
      setLinkedHandle(result.xHandle);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "X verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="button-secondary">
        Become a POW Worker
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#02070d]/80 p-4 backdrop-blur-md"
            onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="worker-onboard-title"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              className="my-8 w-full max-w-xl overflow-hidden rounded-lg border border-white/[0.14] bg-[#071126] shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-start justify-between gap-5 border-b border-white/[0.08] p-6 sm:p-7">
                <div>
                  <p className="text-xs font-extrabold text-[#69a2ff]">POW WORKER ONBOARDING</p>
                  <h2 id="worker-onboard-title" className="mt-2 text-2xl font-black text-white sm:text-3xl">
                    {linkedHandle ? "Application received." : proof ? "Link your X account." : "Verify your wallet."}
                  </h2>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-white/55 transition hover:text-white" aria-label="Close onboarding">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 sm:p-7">
                {linkedHandle ? (
                  <div className="py-5 text-center">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#075dff]/20 text-[#69a2ff]">
                      <Check className="h-8 w-8" aria-hidden="true" />
                    </span>
                    <p className="mt-5 text-xl font-black text-white">@{linkedHandle} is pending review</p>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">Your wallet and X proof are linked. Manual review will move your profile to verified.</p>
                  </div>
                ) : proof ? (
                  <div>
                    <div className="rounded-lg border border-[#1f75ff]/25 bg-[#075dff]/10 p-5">
                      <p className="text-xs font-extrabold text-[#b6d2ff]">YOUR ONE-TIME CODE</p>
                      <p className="mt-2 font-mono text-3xl font-black text-white">{proof.verificationCode}</p>
                      <p className="mt-3 text-sm leading-6 text-white/50">Post this exact code from the X account you want linked, then paste both URLs below.</p>
                      <a href={`https://x.com/intent/post?text=${encodeURIComponent(proof.verificationCode)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#b6d2ff] transition hover:text-white">
                        Post code on X <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                    <label className="mt-6 block text-sm font-bold text-white/70">
                      X profile URL
                      <input value={profileUrl} onChange={(event) => setProfileUrl(event.target.value)} placeholder="https://x.com/yourhandle" className="form-input mt-2" />
                    </label>
                    <label className="mt-5 block text-sm font-bold text-white/70">
                      Verification post URL
                      <input value={postUrl} onChange={(event) => setPostUrl(event.target.value)} placeholder="https://x.com/yourhandle/status/..." className="form-input mt-2" />
                    </label>
                    <button type="button" onClick={linkX} disabled={busy || !profileUrl.trim() || !postUrl.trim()} className="button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-45">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                      Submit for review
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Step icon={Wallet} title="1. Connect Phantom" body="Your wallet stays private on the public leaderboard." />
                      <Step icon={ShieldCheck} title="2. Sign and qualify" body="The server verifies ownership and your live $POW balance." />
                    </div>
                    {connected && publicKey ? (
                      <div className="mt-6 rounded-lg border border-[#1f75ff]/25 bg-[#075dff]/10 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-[#b6d2ff]">PHANTOM CONNECTED</p>
                            <p className="mt-2 font-mono text-sm font-bold text-white">{shortWallet(publicKey.toBase58())}</p>
                          </div>
                          <button
                            type="button"
                            onClick={disconnectWallet}
                            disabled={busy}
                            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-extrabold text-white/55 transition hover:border-white/20 hover:text-white disabled:opacity-45"
                          >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            Disconnect
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={connectPhantom} disabled={connecting} className="button-primary mt-6 w-full disabled:opacity-45">
                        {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                        Connect Phantom
                      </button>
                    )}
                    {connected && publicKey && (
                      <button type="button" onClick={verifyWallet} disabled={busy} className="button-primary mt-4 w-full disabled:opacity-45">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Sign and check eligibility
                      </button>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-lg border border-red-400/25 bg-red-400/[0.07] p-4 text-sm leading-6 text-red-100">
                    {error}
                    {buyUrl && <a href={buyUrl} target="_blank" rel="noreferrer" className="ml-2 font-extrabold text-white underline">Buy $POW</a>}
                  </div>
                )}
                {!linkedHandle && <p className="mt-6 text-center text-xs leading-5 text-white/35">The original #POWApplication community flow remains available as a fallback.</p>}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Step({ icon: Icon, title, body }: { icon: typeof Wallet; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.025] p-4">
      <Icon className="h-5 w-5 text-[#69a2ff]" aria-hidden="true" />
      <p className="mt-3 text-sm font-extrabold text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/40">{body}</p>
    </div>
  );
}
