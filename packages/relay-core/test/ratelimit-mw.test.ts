import { describe, it, expect } from "bun:test";
import { createInMemoryLimiter } from "../src/ratelimit";
import { enforceRateLimitOrThrow } from "../src/ratelimit-mw";

describe("enforceRateLimitOrThrow", () => {
  let now = 1_700_000_000_000;
  const clock = () => now;

  it("returns headers when allowed, throws when exceeded", async () => {
    const limiter = createInMemoryLimiter({ rps: 2, burst: 2, clock });

    const ctx = {
      limiter,
      publicKeyId: "abc123def456ghi789jkl0ab",
      ip: "1.2.3.4",
    };

    const a = await enforceRateLimitOrThrow(ctx);
    expect(Number(a.headers["X-RateLimit-Remaining"])).toBeGreaterThanOrEqual(
      0
    );
    await enforceRateLimitOrThrow(ctx);

    expect(enforceRateLimitOrThrow(ctx)).rejects.toThrow(/rate limit/i);

    now += 500; // rps=2 -> 1 token/500ms
    const b = await enforceRateLimitOrThrow(ctx);
    expect(b.remaining).toBeGreaterThanOrEqual(0);
  });
});
