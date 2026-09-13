/**
 * Robust parsing of LLM model output into JSON.
 *
 * Models routed through OpenAI-compatible gateways (OpenRouter, Ollama,
 * llama.cpp, vLLM, …) frequently return output that is NOT directly
 * JSON.parse-able:
 *   - wrapped in markdown code fences (```json … ```)
 *   - wrapped in backticks
 *   - truncated mid-JSON (low max_tokens / long response)
 *   - prefixed/suffixed with prose
 *
 * Instead of letting raw JSON.parse throw "Unexpected end of JSON input",
 * we normalize and try progressively. Returns null when nothing usable is
 * found so callers can decide how to degrade gracefully.
 */

/** Strip markdown code fences / surrounding backticks and whitespace. */
function stripCodeFences(raw: string): string {
  let s = raw.trim();
  // ```json ... ``` (with or without language tag)
  s = s.replace(/^```[a-zA-Z]*\s*/m, "").replace(/```\s*$/m, "");
  // single backticks
  s = s.replace(/^`+/, "").replace(/`+$/, "");
  // Basic thinking / prose that some providers prefix (e.g. "Here you go:\n")
  return s.trim();
}

/** Find the first JSON object {…} in a string, tolerating leading/trailing noise. */
function extractFirstObject(s: string): string | null {
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === "\"") inString = false;
      continue;
    }
    if (c === "\"") { inString = true; continue; }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Try to parse raw model output as JSON. Returns the parsed value, or null.
 */
export function parseModelJson<T = unknown>(raw: string | null | undefined): T | null {
  if (!raw || typeof raw !== "string") return null;

  const cleaned = stripCodeFences(raw);
  if (!cleaned) return null;

  // Attempt 1: direct parse of cleaned string.
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    /* fall through */
  }

  // Attempt 2: extract the first balanced {…} object and parse that.
  const objectSlice = extractFirstObject(cleaned);
  if (objectSlice) {
    try {
      return JSON.parse(objectSlice) as T;
    } catch {
      /* fall through */
    }
  }

  return null;
}