import { describe, it, expect } from "bun:test";
import { signIngest } from "../src/hmac";
import { verifyIngressRequest } from "../src/verify";
import { PUBLIC_KEY_PREFIX } from "../src/auth";
import { Header } from "../src/types";

describe("verifyIngressRequest", () => {
  const method = "POST";
  const path = "/api/ingest";
  const body = JSON.stringify({ ok: true });
  const nowMs = 1_700_000_000_000;
  const skewMs = 300_000;

  const keyId = "abc123def456ghi789jkl0ab"; // 24 chars base36
  const publicKey = `${PUBLIC_KEY_PREFIX}_${keyId}_9z8y7x`;
  const secret = "super-secret";

  const headersBase = {
    [Header.Key]: publicKey,
  } as Record<string, string | undefined>;

  it("verifies good request", async () => {
    const ts = nowMs;
    const signature = signIngest({ method, path, body, ts, secret });
    const headers = {
      ...headersBase,
      [Header.Timestamp]: String(ts),
      [Header.Signature]: signature,
    };
    const res = await verifyIngressRequest({
      method,
      path,
      body,
      headers,
      nowMs,
      skewMs,
      getSecretForKey: () => secret,
    });
    expect(res.key.id).toBe(keyId);
    expect(res.secret).toBe(secret);
  });

  it("fails on missing header", async () => {
    await expect(
      verifyIngressRequest({
        method,
        path,
        body,
        headers: { ...headersBase }, // missing ts/sig
        nowMs,
        skewMs,
        getSecretForKey: () => secret,
      }),
    ).rejects.toThrow(/missing/i);
  });

  it("fails on bad signature", async () => {
    const ts = nowMs;
    const headers = {
      ...headersBase,
      [Header.Timestamp]: String(ts),
      [Header.Signature]: "bad",
    };
    await expect(
      verifyIngressRequest({
        method,
        path,
        body,
        headers,
        nowMs,
        skewMs,
        getSecretForKey: () => secret,
      }),
    ).rejects.toThrow(/signature/i);
  });

  it("fails on unknown key", async () => {
    const ts = nowMs;
    const signature = signIngest({ method, path, body, ts, secret });
    const headers = {
      ...headersBase,
      [Header.Timestamp]: String(ts),
      [Header.Signature]: signature,
    };
    await expect(
      verifyIngressRequest({
        method,
        path,
        body,
        headers,
        nowMs,
        skewMs,
        getSecretForKey: () => null,
      }),
    ).rejects.toThrow(/Unknown API key/);
  });
});
