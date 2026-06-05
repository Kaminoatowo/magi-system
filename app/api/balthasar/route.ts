import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { BALTHASAR_PROMPT } from "@/lib/prompts";
import { UnitResponse } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: BALTHASAR_PROMPT,
      messages: [{ role: "user", content: query }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const data: UnitResponse = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Balthasar error:", err);
    return NextResponse.json(
      { sintesi: "Errore di sistema nell'unità Balthasar.", verdetto: "CAUTION" } as UnitResponse,
      { status: 500 }
    );
  }
}
