import { NextRequest, NextResponse } from "next/server";
import { MODERATOR_PROMPT } from "@/lib/prompts";
import { ModeratorResponse, UnitResponse, MagiProvider } from "@/lib/types";
import { callLLM } from "@/lib/ai-client";
import {
  getFreeTierConfig,
  getClientIp,
  getQuotaUsed,
  incrementQuota,
  isKvConfigured,
  FREE_TIER_LIMIT,
} from "@/lib/free-tier";

export async function POST(req: NextRequest) {
  try {
    const { query, melchior, balthasar, casper, provider = "anthropic", apiKey, model, baseUrl } = await req.json() as {
      query: string;
      melchior: UnitResponse;
      balthasar: UnitResponse;
      casper: UnitResponse;
      provider?: MagiProvider;
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    };

    const isCustom = provider === "custom";
    const freeTier = !isCustom && !apiKey ? getFreeTierConfig() : null;

    // Quota enforcement (only for free tier with KV configured)
    if (freeTier && isKvConfigured()) {
      const ip = getClientIp(req.headers);
      const used = await getQuotaUsed(ip);
      if (used >= FREE_TIER_LIMIT) {
        return NextResponse.json(
          { error: "quota_exceeded", used, limit: FREE_TIER_LIMIT },
          { status: 429 }
        );
      }
      await incrementQuota(ip);
    }

    const resolvedProvider = freeTier ? freeTier.provider : provider;

    const userMessage = `Original query: "${query}"

MELCHIOR (scientist): ${JSON.stringify(melchior)}
BALTHASAR (mother): ${JSON.stringify(balthasar)}
CASPER (woman): ${JSON.stringify(casper)}`;

    const text = await callLLM(MODERATOR_PROMPT, userMessage, {
      provider: resolvedProvider,
      apiKey,
      model: freeTier ? freeTier.model : model,
      baseUrl: resolvedProvider === "custom" ? baseUrl : undefined,
    });
    const data: ModeratorResponse = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Moderator error:", err);
    return NextResponse.json(
      { stato: "DEADLOCK", verdetto_finale: err instanceof Error ? err.message : "Error in the integration layer.", nota: "" } as ModeratorResponse,
      { status: 500 }
    );
  }
}
