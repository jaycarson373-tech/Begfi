import { NextResponse } from "next/server";
import { buyUrl, workerMinimumBalance, workerOnboardingEnabled } from "@/lib/server/worker-onboarding";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      enabled: workerOnboardingEnabled(),
      minimumBalance: workerMinimumBalance(),
      buyUrl: buyUrl()
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

