import { NextRequest, NextResponse } from "next/server";
import { MODERATOR_PROMPT } from "@/lib/prompts";
import { ModeratorResponse, UnitResponse, MagiProvider } from "@/lib/types";
import { callLLM } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
  try {
    const { query, melchior, balthasar, casper, provider = "anthropic", apiKey } = await req.json() as {
      query: string;
      melchior: UnitResponse;
      balthasar: UnitResponse;
      casper: UnitResponse;
      provider?: MagiProvider;
      apiKey?: string;
    };

    const userMessage = `Query originale: "${query}"

MELCHIOR (scienziata): ${JSON.stringify(melchior)}
BALTHASAR (madre): ${JSON.stringify(balthasar)}
CASPER (donna): ${JSON.stringify(casper)}`;

    const text = await callLLM(MODERATOR_PROMPT, userMessage, provider, apiKey);
    const data: ModeratorResponse = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Moderator error:", err);
    return NextResponse.json(
      { stato: "DEADLOCK", verdetto_finale: err instanceof Error ? err.message : "Errore nel layer di integrazione.", nota: "" } as ModeratorResponse,
      { status: 500 }
    );
  }
}
