import { NextRequest, NextResponse } from "next/server";
import { BALTHASAR_PROMPT } from "@/lib/prompts";
import { UnitResponse, MagiProvider } from "@/lib/types";
import { callLLM } from "@/lib/ai-client";
import { parseModelJson } from "@/lib/parse-model-json";
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

    const text = await callLLM(customPrompt || BALTHASAR_PROMPT, query, {
      provider: resolvedProvider,
      apiKey,
      model: freeTier ? freeTier.model : model,
      baseUrl: resolvedProvider === "custom" ? baseUrl : undefined,
    });
    const data: UnitResponse | null = parseModelJson<UnitResponse>(text);
    if (!data || !data.sintesi) {
      throw new Error("Model returned no usable JSON from Balthasar unit.");
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Balthasar error:", err);
    return NextResponse.json(
      { sintesi: err instanceof Error ? err.message : "System error in Balthasar unit.", verdetto: "CAUTION" } as UnitResponse,
      { status: 500 }
    );
  }
}
