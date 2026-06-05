import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { MODERATOR_PROMPT } from "@/lib/prompts";
import { ModeratorResponse, UnitResponse } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { query, melchior, balthasar, casper } = await req.json() as {
      query: string;
      melchior: UnitResponse;
      balthasar: UnitResponse;
      casper: UnitResponse;
    };

    const userMessage = `Query originale: "${query}"

MELCHIOR (scienziata): ${JSON.stringify(melchior)}
BALTHASAR (madre): ${JSON.stringify(balthasar)}
CASPER (donna): ${JSON.stringify(casper)}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: MODERATOR_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const data: ModeratorResponse = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Moderator error:", err);
    return NextResponse.json(
      { stato: "DEADLOCK", verdetto_finale: "Errore nel layer di integrazione.", nota: "" } as ModeratorResponse,
      { status: 500 }
    );
  }
}
