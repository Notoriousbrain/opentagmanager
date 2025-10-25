import { RateLimitError } from "./errors.js";
import type { RateLimiter } from "./ratelimit.js";

export interface EnforceRateLimitInput {
  limiter: RateLimiter;
  publicKeyId: string;
  ip?: string | null;
}

export interface EnforceRateLimitOutput {
  remaining: number;
  resetMs: number;
  headers: Record<string, string>;
}

export async function enforceRateLimitOrThrow(
  i: EnforceRateLimitInput
): Promise<EnforceRateLimitOutput> {
  const decision = await i.limiter.take({
    publicKeyId: i.publicKeyId,
    ip: i.ip ?? null,
  });

  if (!decision.ok) {
    const now = Date.now();
    const retryAfterSec = Math.max(
      0,
      Math.ceil((decision.resetMs - now) / 1000)
    );
    throw new RateLimitError("Rate limit exceeded", {
      detail: { resetMs: decision.resetMs, retryAfterSec },
    });
  }

  const headers = {
    "X-RateLimit-Remaining": String(decision.remaining),
    "X-RateLimit-Reset": String(decision.resetMs),
  };

  return {
    remaining: decision.remaining,
    resetMs: decision.resetMs,
    headers,
  };
}
