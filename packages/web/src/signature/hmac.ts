import { canonicalStringify } from "../serialize/json";

export async function signHmacSHA256(
  secret: string,
  payload: any
): Promise<string> {
  const message = canonicalStringify(payload);

  if (globalThis.crypto?.subtle) {
    const enc = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await globalThis.crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(message)
    );

    return bufToHex(new Uint8Array(signature));
  }

  const nodeCrypto = require("crypto");
  const hmac = nodeCrypto.createHmac("sha256", secret);
  hmac.update(message);
  return hmac.digest("hex");
}

function bufToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
