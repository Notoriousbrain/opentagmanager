import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const DEFAULT_PREFIXES = {
  secret: "otm_sk_live_",
  public: "otm_pk_live_",
} as const;

export type ApiKeyKind = "secret" | "public";

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function toBase62(buf: Buffer): string {
  let x = BigInt("0x" + buf.toString("hex"));
  const base = BigInt(62);
  let out = "";
  while (x > 0n) {
    const r = Number(x % base);
    out = BASE62[r] + out;
    x = x / base;
  }
  return out.padStart(43, "0");
}

function b64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function b64urlDecode(s: string): Buffer {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  return Buffer.from(padded, "base64");
}

function scryptHash(secret: string, pepper?: string): string {
  const salt = randomBytes(16);
  const N = 1 << 15;
  const r = 8;
  const p = 1;
  const key = scryptSync((pepper ?? "") + secret, salt, 32, { N, r, p });
  return `scrypt$N=${N},r=${r},p=${p}$${b64urlEncode(salt)}$${b64urlEncode(key)}`;
}

export function verifyScrypt(
  secret: string,
  hash: string,
  pepper?: string
): boolean {
  const match = /^scrypt\$N=(\d+),r=(\d+),p=(\d+)\$([^$]+)\$([^$]+)$/.exec(
    hash
  );
  if (!match) return false;

  const Ns = match[1];
  const rs = match[2];
  const ps = match[3];
  const saltB64 = match[4];
  const keyB64 = match[5];

  const N = Number(Ns);
  const r = Number(rs);
  const p = Number(ps);

  const salt = b64urlDecode(saltB64!);
  const expected = b64urlDecode(keyB64!);

  const derived = scryptSync((pepper ?? "") + secret, salt, expected.length, {
    N,
    r,
    p,
  });
  return timingSafeEqual(derived, expected);
}

export function makeApiKey(
  kind: ApiKeyKind,
  opts?: { prefixOverride?: string; pepper?: string }
) {
  const raw = toBase62(randomBytes(32));
  const prefixBase =
    opts?.prefixOverride ??
    (kind === "secret" ? DEFAULT_PREFIXES.secret : DEFAULT_PREFIXES.public);
  const prefix = prefixBase + raw.slice(0, 8);

  const token = `${prefix}.${toBase62(randomBytes(24))}`;
  const keyHash = scryptHash(token, opts?.pepper);
  return { token, prefix, keyHash };
}
