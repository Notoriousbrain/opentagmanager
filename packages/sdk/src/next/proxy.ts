import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { BatchPayload } from "@otm/types";

import { canonicalStringify } from "../serialize/json";
import { signHmacSHA256 } from "../signature/hmac";
import { createNextServerClient } from "./server";

interface OTMProxyConfig {
  target: string;

  projectId: string;

  secret?: string;

  enrich?: boolean;
}

export function otmProxy(config: OTMProxyConfig) {
  const { target, projectId, secret, enrich = true } = config;

  const serverClient = createNextServerClient({
    projectId,
    ingestUrl: target,
    secret,
  });

  async function handler(req: NextRequest) {
    try {
      const json = (await req.json()) as BatchPayload;

      if (secret) {
        const received = req.headers.get("x-osstag-signature");
        if (!received) {
          return NextResponse.json(
            { ok: false, error: "Missing signature" },
            { status: 401 }
          );
        }

        const bodyCanon = canonicalStringify(json);
        const expected = await signHmacSHA256(secret, bodyCanon);

        if (received !== expected) {
          return NextResponse.json(
            { ok: false, error: "Invalid signature" },
            { status: 403 }
          );
        }
      }

      if (enrich) {
        for (const e of json.events) {
          e.context = {
            ...e.context,
            server: "next-proxy",
          };
        }
      }

      await serverClient.send(json);

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[otm:proxy] failed:", err);
      return NextResponse.json(
        { ok: false, error: "Proxy error" },
        { status: 500 }
      );
    }
  }

  return {
    GET: handler,
    POST: handler,
  };
}
