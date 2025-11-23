import type { BatchPayload } from "@otm/types";
import { canonicalStringify } from "../serialize/json";
import { signHmacSHA256 } from "../signature/hmac";

export interface NodeClientConfig {
  projectId: string;
  ingestUrl: string;
  secret?: string;
}

export function createNodeClient(config: NodeClientConfig) {
  const { projectId, ingestUrl, secret } = config;

  async function send(batch: BatchPayload): Promise<void> {
    const body = canonicalStringify(batch);

    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (secret) {
      const sig = await signHmacSHA256(secret, body);
      headers["x-osstag-signature"] = sig;
    }

    await fetch(ingestUrl, {
      method: "POST",
      headers,
      body,
    });
  }

  return {
    send,
    async track(name: string, props: Record<string, unknown> = {}) {
      const now = new Date().toISOString();

      const batch: BatchPayload = {
        projectId,
        clientId: "server",
        sessionId: "server",
        sentAt: now,
        events: [
          {
            id: crypto.randomUUID(),
            name,
            props,
            timestamp: now,
            clientId: "server",
            sessionId: "server",
            url: "server",
            referrer: null,
            viewport: { width: 0, height: 0 },
            region: null,
            context: { framework: "node" },
          },
        ],
      };

      await send(batch);
    },
  };
}

export type NodeClient = ReturnType<typeof createNodeClient>;
