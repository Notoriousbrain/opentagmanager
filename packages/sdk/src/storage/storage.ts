/**
 * Shared Storage Adapter for all OSSTag client SDKs.
 *
 * IMPORTANT:
 * - Supports both sync and async methods.
 * - Browser script will use sync localStorage automatically.
 * - Node/Workers/RSC SDKs may use async implementations later.
 */

export interface StorageAdapter {
  get(key: string): string | null | Promise<string | null>;
  set(key: string, value: string): void | Promise<void>;
}

/**
 * In-memory fallback (used on server or unsupported runtimes).
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }
}

/**
 * Returns a browser localStorage adapter **if available**.
 * Otherwise returns null (SDKs must fallback to memory/storage).
 */
export function getBrowserLocalStorageAdapter(): StorageAdapter | null {
  if (typeof window === "undefined") return null;
  if (!("localStorage" in window)) return null;

  return {
    get(key: string): string | null {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key: string, value: string): void {
      try {
        window.localStorage.setItem(key, value);
      } catch {}
    },
  };
}
