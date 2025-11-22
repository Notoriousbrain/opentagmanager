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

export interface WebClientConfig {
  projectId: string;

  /**
   * Transport function that actually sends the batch.
   * This is where browser script, React SDK, Node SDK etc.
   * plug in fetch/beacon/HTTP clients.
   */
  send(batch: RawBatchPayload): Promise<void> | void;

  /**
   * Optional storage adapter (KV, localStorage, etc.).
   * Defaults to browser localStorage (if available) or memory.
   */
  storage?: StorageAdapter;

  /**
   * Optional batching overrides.
   */
  batching?: Partial<BatchingConfig>;

  /**
   * Auto-flush interval in ms.
   * - Set to null or 0 to disable interval-based auto-flush.
   * - Defaults to 10_000 ms (10s).
   */
  autoFlushIntervalMs?: number | null;
}

export interface WebClient {
  track(name: string, properties?: Record<string, unknown>): Promise<void>;
  identify(userId: string): void;
  flush(): Promise<void>;
  getClientId(): Promise<string>;
  getSessionId(): Promise<string>;
}

export function createClient(config: WebClientConfig): WebClient {
  const batching: BatchingConfig = {
    ...DEFAULT_BATCHING_CONFIG,
    ...config.batching,
  };

  const storage: StorageAdapter =
    config.storage ??
    getBrowserLocalStorageAdapter() ??
    new MemoryStorageAdapter();

  let currentUserId: string | undefined;
  let queue: RawEvent[] = [];
  let isFlushing = false;

  // IDs are resolved lazily and cached.
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

      const batch: RawBatchPayload = buildBatchBase({
        projectId: config.projectId,
        clientId,
        sessionId,
        events: eventsToSend,
      });

      // retry with exponential backoff
      for (let attempt = 0; attempt < batching.maxRetries; attempt++) {
        try {
          await Promise.resolve(config.send(batch));
          return;
        } catch {
          if (attempt === batching.maxRetries - 1) {
            // give up after last attempt
            return;
          }
          const delay = getBackoffDelay(attempt, batching);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    } finally {
      isFlushing = false;
    }
  }

  // Auto-flush interval (10s default)
  const intervalMs =
    config.autoFlushIntervalMs === undefined
      ? 10_000
      : config.autoFlushIntervalMs;

  if (intervalMs && intervalMs > 0) {
    setInterval(() => {
      void flush();
    }, intervalMs);
  }

  return {
    track,
    identify,
    flush,
    getClientId: ensureClientId,
    getSessionId: ensureSessionId,
  };
}
