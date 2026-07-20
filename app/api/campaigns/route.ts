import { NextResponse } from "next/server";
import { getFundedCampaigns } from "@/lib/server/campaign-funding";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await getFundedCampaigns();
    return NextResponse.json({ campaigns }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Funded campaigns API failed", error);
    return NextResponse.json({ campaigns: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

