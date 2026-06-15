import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { MagiProvider } from "./types";

export async function callLLM(
  systemPrompt: string,
  userMessage: string,
  provider: MagiProvider,
  apiKey?: string,
  model?: string
): Promise<string> {
  const resolvedKey = apiKey || (provider === "openai" ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY);
  if (!resolvedKey) {
    throw new Error(`Missing API key for ${provider.toUpperCase()} — configure it in the settings panel (⚙ CONFIG).`);
  }

  if (provider === "openai") {
    const client = new OpenAI({ apiKey: resolvedKey });
    const res = await client.chat.completions.create({
      model: model ?? "gpt-4o",
      max_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });
    return res.choices[0].message.content ?? "";
  }

  const client = new Anthropic({ apiKey: resolvedKey });
  const res = await client.messages.create({
    model: model ?? "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  return res.content[0].type === "text" ? res.content[0].text : "";
}
