import "server-only";

type HeliusResponse<T> = {
  result?: T;
  error?: { code?: number; message?: string };
};

type ParsedTokenAccount = {
  account?: {
    data?: {
      parsed?: {
        info?: {
          tokenAmount?: {
            uiAmountString?: string;
          };
        };
      };
    };
  };
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function heliusRpc<T>(method: string, params: unknown[]) {
  const apiKey = requiredEnv("HELIUS_API_KEY");
  const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "pow-server", method, params }),
    cache: "no-store"
  });

  if (!response.ok) throw new Error(`Helius request failed (${response.status})`);
  const payload = (await response.json()) as HeliusResponse<T>;
  if (payload.error || payload.result === undefined) {
    throw new Error(payload.error?.message || "Helius returned no result");
  }
  return payload.result;
}

export function powMintAddress() {
  return process.env.POW_TOKEN_MINT?.trim() || requiredEnv("SOURCE_TOKEN_MINT");
}

export async function getPowBalance(wallet: string) {
  const result = await heliusRpc<{ value?: ParsedTokenAccount[] }>("getTokenAccountsByOwner", [
    wallet,
    { mint: powMintAddress() },
    { encoding: "jsonParsed", commitment: "confirmed" }
  ]);

  return (result.value ?? []).reduce((sum, tokenAccount) => {
    const value = Number(tokenAccount.account?.data?.parsed?.info?.tokenAmount?.uiAmountString ?? 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
}

