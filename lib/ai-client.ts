import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { MagiProvider } from "./types";

export async function callLLM(
  systemPrompt: string,
  userMessage: string,
  provider: MagiProvider,
  apiKey?: string
): Promise<string> {
  if (provider === "openai") {
    const client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    const res = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });
    return res.choices[0].message.content ?? "";
  }

  const client = new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  });
  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  return res.content[0].type === "text" ? res.content[0].text : "";
}
