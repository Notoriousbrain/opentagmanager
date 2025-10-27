export interface PublicKeyParts {
  raw: string;
  prefix: "OTM_PK";
  id: string;
  checksum?: string;
}

export const PUBLIC_KEY_PREFIX = "OTM_PK";

const B36 = /^[0-9a-z]+$/;

export function parsePublicKey(input: string): PublicKeyParts {
  if (typeof input !== "string") {
    throw new TypeError("public key must be a string");
  }
  const raw = input.trim();

  const up = raw.toUpperCase();
  if (!up.startsWith(PUBLIC_KEY_PREFIX + "_")) {
    throw new Error("invalid public key prefix");
  }

  const rest = raw.slice(PUBLIC_KEY_PREFIX.length + 1);
  const parts = rest.split("_");
  if (parts.length < 1 || parts.length > 2) {
    throw new Error("invalid public key structure");
  }

  const id = parts[0]?.toLowerCase();
  const checksum = parts[1]?.toLowerCase();

  if (!id || id.length < 16 || id.length > 40 || !B36.test(id)) {
    throw new Error("invalid public key id");
  }

  if (typeof checksum !== "undefined") {
    if (checksum.length < 6 || checksum.length > 12 || !B36.test(checksum)) {
      throw new Error("invalid public key checksum");
    }
  }

  return {
    raw,
    prefix: PUBLIC_KEY_PREFIX,
    id,
    ...(checksum ? { checksum } : {}),
  };
}

export function tryParsePublicKey(input: unknown): PublicKeyParts | null {
  try {
    return parsePublicKey(String(input));
  } catch {
    return null;
  }
}

export function maskPublicKey(raw: string): string {
  const s = String(raw ?? "");
  const keep = 3;
  if (s.length <= keep * 2) return `${PUBLIC_KEY_PREFIX}_***`;
  return `${s.slice(0, keep)}***${s.slice(-keep)}`;
}

export async function getSecretForKey(projectKeyId: string): Promise<string> {
  return "test_secret_for_demo";
}
