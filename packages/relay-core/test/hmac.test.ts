import { describe, it, expect } from "bun:test";
import {
  canonicalString,
  signIngest,
  verifySignatureOrThrow,
  sha256Base64Url,
} from "../src/hmac";

describe("HMAC helpers", () => {
  const secret = "super-secret";
  const method = "POST";
  const path = "/api/ingest";
  const body = JSON.stringify({ hello: "world" });
  const ts = 1_700_000_000_000;
  const nowMs = ts + 1000;
  const skewMs = 300_000;

  it("computes canonical string deterministically", () => {
    const c1 = canonicalString({ method, path, body, ts });
    const c2 = canonicalString({ method, path, body, ts });
    expect(c1).toBe(c2);
    expect(c1.split(".").length).toBe(4);
    expect(c1.endsWith(sha256Base64Url(body))).toBe(true);
  });

  it("signs and verifies correctly", () => {
    const sig = signIngest({ method, path, body, ts, secret });
    expect(typeof sig).toBe("string");
    verifySignatureOrThrow({
      method,
      path,
      body,
      ts,
      secret,
      signature: sig,
      nowMs,
      skewMs,
    });
  });

  it("rejects on bad signature", () => {
    const sig = signIngest({ method, path, body, ts, secret });
    const bad = sig.slice(0, -2) + "zz";
    expect(() =>
      verifySignatureOrThrow({
        method,
        path,
        body,
        ts,
        secret,
        signature: bad,
        nowMs,
        skewMs,
      })
    ).toThrow(/signature/i);
  });

  it("rejects on skew", () => {
    const far = ts + skewMs + 1;
    const sig = signIngest({ method, path, body, ts: far, secret });
    expect(() =>
      verifySignatureOrThrow({
        method,
        path,
        body,
        ts: far,
        secret,
        signature: sig,
        nowMs: ts,
        skewMs,
      })
    ).toThrow(/skew/i);
  });
});
