import { NextResponse } from "next/server";
import { emptyPayoutFeed, getPayoutFeed } from "@/lib/server/payout-receipts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const campaign = new URL(request.url).searchParams.get("campaign")?.trim() || undefined;
  if (campaign && !/^[a-z0-9-]{1,64}$/.test(campaign)) {
    return NextResponse.json({ error: "Invalid campaign" }, { status: 400 });
  }
  try {
    return NextResponse.json(await getPayoutFeed(campaign), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Payout receipts API failed", error);
    return NextResponse.json(emptyPayoutFeed, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

