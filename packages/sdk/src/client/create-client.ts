import type { BatchPayload } from "@otm/types";
import type { StorageAdapter } from "../storage/storage";
import {
  MemoryStorageAdapter,
  getBrowserLocalStorageAdapter,
} from "../storage/storage";
import { getClientId as coreGetClientId } from "../id/client-id";
import { getSessionId as coreGetSessionId } from "../id/session-id";
import {
  DEFAULT_BATCHING_CONFIG,
  type BatchingConfig,
} from "../batching/constants";
import { getBackoffDelay } from "../batching/backoff";
import { buildBatchBase, RawBatchPayload } from "../batching/build-batch-base";
import { RawEvent } from "../types/raw-events";
import { canonicalStringify } from "../serialize/json";
import { signHmacSHA256 } from "../signature/hmac";

export interface SignatureConfig {
  secret: string;
  headerName?: string;
}

export interface AntiBlockConfig {
  enabled: boolean;

  rotateTransport?: boolean;

  obfuscatePayload?: boolean;
}

export interface WebClientConfig {
  projectId: string;

  send(
    batch: RawBatchPayload,
    meta?: { signature?: string; headerName?: string }
  ): Promise<void> | void;

  storage?: StorageAdapter;

  batching?: Partial<BatchingConfig>;

  autoFlushIntervalMs?: number | null;

  signature?: SignatureConfig;

  antiBlock?: AntiBlockConfig;
}

export interface WebClient {
  track(name: string, properties?: Record<string, unknown>): Promise<void>;
  identify(userId: string): void;
  flush(): Promise<void>;
  getClientId(): Promise<string>;
  getSessionId(): Promise<string>;
  debug(): Promise<Record<string, unknown>>;
}

export function createClient(config: WebClientConfig): WebClient {
  const batching: BatchingConfig = {
    ...DEFAULT_BATCHING_CONFIG,
    ...config.batching,
  };

  const antiBlock = config.antiBlock ?? { enabled: false };

  const storage: StorageAdapter =
    config.storage ??
    getBrowserLocalStorageAdapter() ??
    new MemoryStorageAdapter();

  let currentUserId: string | undefined;
  let queue: RawEvent[] = [];
  let isFlushing = false;

  let clientIdPromise: Promise<string> | null = null;
  let sessionIdPromise: Promise<string> | null = null;

  async function ensureClientId(): Promise<string> {
    if (!clientIdPromise) {
      clientIdPromise = coreGetClientId(storage);
    }
    return clientIdPromise;
  }

  async function ensureSessionId(): Promise<string> {
    if (!sessionIdPromise) {
      sessionIdPromise = coreGetSessionId(storage);
    }
    return sessionIdPromise;
  }

  function identify(userId: string): void {
    currentUserId = userId;
  }

  async function track(
    name: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    const [clientId, sessionId] = await Promise.all([
      ensureClientId(),
      ensureSessionId(),
    ]);

    const event: RawEvent = {
      name,
      properties: properties ?? {},
      timestamp: new Date().toISOString(),
      clientId,
      sessionId,
      ...(currentUserId ? { userId: currentUserId } : {}),
    };

    queue.push(event);

    if (queue.length >= batching.maxBatchEvents) {
      void flush();
    }
  }

  async function flush(): Promise<void> {
    if (isFlushing) return;
    if (queue.length === 0) return;

    isFlushing = true;

    try {
      const [clientId, sessionId] = await Promise.all([
        ensureClientId(),
        ensureSessionId(),
      ]);

      const eventsToSend = queue.slice(0, batching.maxBatchEvents);
      queue = queue.slice(eventsToSend.length);

      const rawBatch = buildBatchBase({
        projectId: config.projectId,
        clientId,
        sessionId,
        events: eventsToSend,
      });

      const batch = rawBatch;

      let signatureMeta: { signature?: string; headerName?: string } = {};

      if (config.signature?.secret) {
        const canonical = canonicalStringify(batch);
        const sig = await signHmacSHA256(config.signature.secret, canonical);
        signatureMeta = {
          signature: sig,
          headerName: config.signature.headerName ?? "x-osstag-signature",
        };
      }

      for (let attempt = 0; attempt < batching.maxRetries; attempt++) {
        try {
          await Promise.resolve(config.send(batch, signatureMeta));
          return;
        } catch {
          if (attempt === batching.maxRetries - 1) return;
          await new Promise((r) =>
            setTimeout(r, getBackoffDelay(attempt, batching))
          );
        }
      }
    } finally {
      isFlushing = false;
    }
  }

  const intervalMs =
    config.autoFlushIntervalMs === undefined
      ? 10_000
      : config.autoFlushIntervalMs;

  if (intervalMs && intervalMs > 0) {
    setInterval(() => {
      void flush();
    }, intervalMs);
  }

  async function debug() {
    const clientId = await ensureClientId();
    const sessionId = await ensureSessionId();

    return {
      clientId,
      sessionId,
      queueLength: queue.length,
      batching,
      signatureEnabled: Boolean(config.signature?.secret),
      storage:
        storage instanceof MemoryStorageAdapter ? "memory" : "persistent",
    };
  }

  return {
    track,
    identify,
    flush,
    getClientId: ensureClientId,
    getSessionId: ensureSessionId,
    debug,
  };
}
