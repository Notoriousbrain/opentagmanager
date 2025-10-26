import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { Header } from "./types";
import { SignatureInvalidError, SkewExceededError } from "./errors";

export interface CanonicalInput {
  method: string;
  path: string;
  body: string;
  ts: number;
}

export interface SignInput extends CanonicalInput {
  secret: string;
}

export function toBase64Url(buf: Buffer | Uint8Array): string {
  return Buffer.from(buf)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function sha256Base64Url(input: string | Uint8Array): string {
  const h = createHash("sha256");
  h.update(input);
  return toBase64Url(h.digest());
}

export function canonicalString(i: CanonicalInput): string {
  const bhash = sha256Base64Url(i.body);
  return `${i.ts}.${i.method.toUpperCase()}.${i.path}.${bhash}`;
}

export function hmacSha256Base64Url(secret: string, message: string): string {
  const mac = createHmac("sha256", Buffer.from(secret));
  mac.update(message);
  return toBase64Url(mac.digest());
}

export function signIngest(i: SignInput): string {
  const msg = canonicalString(i);
  return hmacSha256Base64Url(i.secret, msg);
}

export interface VerifyInput extends CanonicalInput {
  secret: string;
  signature: string;
  nowMs: number;
  skewMs: number;
}

export function verifySignatureOrThrow(v: VerifyInput): void {
  const delta = Math.abs(v.nowMs - v.ts);
  if (delta > v.skewMs) {
    throw new SkewExceededError("timestamp outside allowed skew window", {
      detail: { deltaMs: delta, skewMs: v.skewMs, ts: v.ts, nowMs: v.nowMs },
    });
  }

  const expected = signIngest({
    method: v.method,
    path: v.path,
    body: v.body,
    ts: v.ts,
    secret: v.secret,
  });

  const a = Buffer.from(expected);
  const b = Buffer.from(v.signature);
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    throw new SignatureInvalidError("signature mismatch", {
      detail: { header: Header.Signature },
    });
  }
}

export function getHeader(
  h: Record<string, string | undefined>,
  name: string
): string | undefined {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(h)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}
