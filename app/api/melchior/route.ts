import { NextRequest, NextResponse } from "next/server";
import { MELCHIOR_PROMPT } from "@/lib/prompts";
import { UnitResponse, MagiProvider } from "@/lib/types";
import { callLLM } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
  try {
    const { query, provider = "anthropic", apiKey, customPrompt } = await req.json() as {
      query: string;
      provider?: MagiProvider;
      apiKey?: string;
      customPrompt?: string;
    };
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const text = await callLLM(customPrompt || MELCHIOR_PROMPT, query, provider, apiKey);
    const data: UnitResponse = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Melchior error:", err);
    return NextResponse.json(
      { sintesi: err instanceof Error ? err.message : "Errore di sistema nell'unità Melchior.", verdetto: "CAUTION" } as UnitResponse,
      { status: 500 }
    );
  }
}
