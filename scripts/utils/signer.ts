// scripts/utils/signer.ts

import { signIngest } from "../../packages/relay-core/src";

export function createSignedHeaders({
  secret,
  publicKey,
  method = "POST",
  path = "/",
  body,
}: {
  secret: string;
  publicKey: string;
  method?: string;
  path?: string;
  body: string;
}) {
  const ts = Date.now();
  const signature = signIngest({ method, path, body, ts, secret });

  return {
    "x-otm-key": publicKey,
    "x-otm-ts": ts.toString(),
    "x-otm-sig": signature,
    "content-type": "application/json",
  };
}
