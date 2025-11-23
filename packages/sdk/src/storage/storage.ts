export interface StorageAdapter {
  get(key: string): string | null | Promise<string | null>;
  set(key: string, value: string): void | Promise<void>;
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }
}

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
