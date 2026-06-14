import { NextRequest, NextResponse } from "next/server";
import { getClientIp, getQuotaUsed, isKvConfigured, FREE_TIER_LIMIT } from "@/lib/free-tier";

export async function GET(req: NextRequest) {
  if (!isKvConfigured()) {
    return NextResponse.json({ used: 0, limit: FREE_TIER_LIMIT, remaining: 999 });
  }

  const ip = getClientIp(req.headers);
  const used = await getQuotaUsed(ip);
  const remaining = Math.max(0, FREE_TIER_LIMIT - used);

  return NextResponse.json({ used, limit: FREE_TIER_LIMIT, remaining });
}
