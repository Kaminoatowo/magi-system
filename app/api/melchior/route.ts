import { NextRequest, NextResponse } from "next/server";
import { MELCHIOR_PROMPT } from "@/lib/prompts";
import { UnitResponse, MagiProvider } from "@/lib/types";
import { callLLM } from "@/lib/ai-client";
import { getFreeTierConfig } from "@/lib/free-tier";

export async function POST(req: NextRequest) {
  try {
    const { query, provider = "anthropic", apiKey, customPrompt, model, baseUrl } = await req.json() as {
      query: string;
      provider?: MagiProvider;
      apiKey?: string;
      customPrompt?: string;
      model?: string;
      baseUrl?: string;
    };
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const isCustom = provider === "custom";
    const freeTier = !isCustom && !apiKey ? getFreeTierConfig() : null;
    const resolvedProvider = freeTier ? freeTier.provider : provider;

    const text = await callLLM(customPrompt || MELCHIOR_PROMPT, query, {
      provider: resolvedProvider,
      apiKey,
      model: freeTier ? freeTier.model : model,
      baseUrl: resolvedProvider === "custom" ? baseUrl : undefined,
    });
    const data: UnitResponse = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Melchior error:", err);
    return NextResponse.json(
      { sintesi: err instanceof Error ? err.message : "System error in Melchior unit.", verdetto: "CAUTION" } as UnitResponse,
      { status: 500 }
    );
  }
}
