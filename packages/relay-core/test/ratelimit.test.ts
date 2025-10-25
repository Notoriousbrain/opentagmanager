import { describe, it, expect } from "bun:test";
import { createInMemoryLimiter, buildRateKey } from "../src/ratelimit";

describe("in-memory rate limiter", () => {
  let now = 1_700_000_000_000;
  const clock = () => now;

  it("allows within capacity and limits when exceeded", async () => {
    const limiter = createInMemoryLimiter({ rps: 5, burst: 5, clock });

    const key = { publicKeyId: "abc123def456ghi789jkl0ab", ip: "1.2.3.4" };

    for (let i = 0; i < 5; i++) {
      const res = await limiter.take(key);
      expect(res.ok).toBe(true);
    }

    const blocked = await limiter.take(key);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);

    now += 200;
    const okAgain = await limiter.take(key);
    expect(okAgain.ok).toBe(true);
  });

  it("uses composite key publicKeyId:ip", () => {
    const k = buildRateKey({ publicKeyId: "id", ip: "ip" });
    expect(k).toBe("id:ip");
  });
});
