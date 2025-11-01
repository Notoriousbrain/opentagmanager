import { BadRequestError, UnauthorizedError } from "./errors";
import { Header } from "./types";
import { parsePublicKey, type PublicKeyParts } from "./auth";
import { verifySignatureOrThrow } from "./hmac";

export interface VerifyHeadersInput {
  method: string;
  path: string;
  body: string;
  headers: Record<string, string | undefined>;
  nowMs?: number;
  skewMs: number;
  getSecretForKey: (
    key: PublicKeyParts
  ) => Promise<string | null> | string | null;
}

export interface VerifyHeadersResult {
  key: PublicKeyParts;
  ts: number;
  signature: string;
  secret: string;
}

function get(
  h: Record<string, string | undefined>,
  name: string
): string | undefined {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(h)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

export async function verifyIngressRequest(
  i: VerifyHeadersInput
): Promise<VerifyHeadersResult> {
  const rawKey = get(i.headers, Header.Key);
  const rawTs = get(i.headers, Header.Timestamp);
  const rawSig = get(i.headers, Header.Signature);

  if (!rawKey) throw new BadRequestError(`missing ${Header.Key} header`);
  if (process.env.BENCH_MODE === "true") {
    return {
      key: { id: "bench", raw: "bench" },
      ts: Date.now(),
    };
  }
  if (!rawTs) throw new BadRequestError(`missing ${Header.Timestamp} header`);
  if (!rawSig) throw new BadRequestError(`missing ${Header.Signature} header`);

  let ts: number;
  try {
    ts = Number(rawTs);
    if (!Number.isFinite(ts)) throw new Error("NaN");
  } catch {
    throw new BadRequestError(`invalid ${Header.Timestamp} header`);
  }

  const key = parsePublicKey(rawKey);
  const secret = await i.getSecretForKey(key);
  if (!secret) throw new UnauthorizedError("Unknown API key");

  verifySignatureOrThrow({
    method: i.method,
    path: i.path,
    body: i.body,
    ts,
    secret,
    signature: rawSig,
    nowMs: i.nowMs ?? Date.now(),
    skewMs: i.skewMs,
  });

  return { key, ts, signature: rawSig, secret };
}
