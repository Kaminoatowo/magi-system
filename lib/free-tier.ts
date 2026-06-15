import { MagiProvider } from "./types";

export const FREE_TIER_LIMIT = 3;

export const FREE_TIER_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
export const FREE_TIER_OPENAI_MODEL = "gpt-4.1-nano";

/** Returns the server-side provider and model to use for the free tier, or null if no server key is configured. */
export function getFreeTierConfig(): { provider: MagiProvider; model: string } | null {
  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: "anthropic", model: FREE_TIER_ANTHROPIC_MODEL };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: "openai", model: FREE_TIER_OPENAI_MODEL };
  }
  return null;
}

/** Extracts the client IP from request headers (works on Vercel). */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Resolves KV REST credentials from env, accepting multiple naming schemes:
 * the project's `MAGI_KV_` prefixed vars (Upstash integration on Vercel),
 * the standard Vercel KV names, and the native Upstash names.
 */
function getKvCredentials(): { url: string; token: string } | null {
  const url =
    process.env.MAGI_KV_KV_REST_API_URL ??
    process.env.KV_REST_API_URL ??
    process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.MAGI_KV_KV_REST_API_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

/** Returns true if KV is available (credentials are set). */
export function isKvConfigured(): boolean {
  return getKvCredentials() !== null;
}

const kvKey = (ip: string) => `quota:${ip}`;

/** Returns the number of free queries already used by this IP. Returns 0 on any error. */
export async function getQuotaUsed(ip: string): Promise<number> {
  try {
    const creds = getKvCredentials();
    if (!creds) return 0;
    const { createClient } = await import("@vercel/kv");
    const kv = createClient(creds);
    const val = await kv.get<number>(kvKey(ip));
    return val ?? 0;
  } catch {
    return 0;
  }
}

/** Increments the quota counter for this IP. Returns 0 on any error. */
export async function incrementQuota(ip: string): Promise<number> {
  try {
    const creds = getKvCredentials();
    if (!creds) return 0;
    const { createClient } = await import("@vercel/kv");
    const kv = createClient(creds);
    return await kv.incr(kvKey(ip));
  } catch {
    return 0;
  }
}
