import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { MagiProvider } from "./types";

export interface LLMOptions {
  provider: MagiProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

/** Shared path for any OpenAI-compatible endpoint (OpenAI, OpenRouter, Ollama, llama.cpp, …). */
async function callOpenAICompatible(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  baseUrl?: string,
  model?: string,
  fallbackModel = "gpt-4o"
): Promise<string> {
  const client = new OpenAI({ apiKey, baseURL: baseUrl || undefined });
  const res = await client.chat.completions.create({
    model: model ?? fallbackModel,
    max_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });
  return res.choices[0].message.content ?? "";
}

export async function callLLM(
  systemPrompt: string,
  userMessage: string,
  opts: LLMOptions
): Promise<string> {
  const { provider, apiKey, model, baseUrl } = opts;

  // Custom OpenAI-compatible endpoint (self-hosted / third-party). The OpenAI
  // SDK speaks the same wire protocol, so we just point it at baseUrl. Local
  // servers (Ollama, llama.cpp) usually ignore the auth header, so a placeholder
  // key is fine when none is configured.
  if (provider === "custom") {
    if (!baseUrl) {
      throw new Error("Custom endpoint requires a Base URL — configure it in the settings panel (⚙ CONFIG).");
    }
    return callOpenAICompatible(
      systemPrompt,
      userMessage,
      apiKey || "local", // many self-hosted servers accept any / no auth
      baseUrl,
      model
    );
  }

  if (provider === "openai") {
    const resolvedKey = apiKey || process.env.OPENAI_API_KEY;
    if (!resolvedKey) {
      throw new Error(`Missing API key for OPENAI — configure it in the settings panel (⚙ CONFIG).`);
    }
    return callOpenAICompatible(systemPrompt, userMessage, resolvedKey, undefined, model);
  }

  // Anthropic
  const resolvedKey = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!resolvedKey) {
    throw new Error(`Missing API key for ANTHROPIC — configure it in the settings panel (⚙ CONFIG).`);
  }
  const client = new Anthropic({ apiKey: resolvedKey });
  const res = await client.messages.create({
    model: model || "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  return res.content[0].type === "text" ? res.content[0].text : "";
}