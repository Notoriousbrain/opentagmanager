export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }
}

class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }
}

export const storage: StorageAdapter =
  typeof window !== "undefined" && "localStorage" in window
    ? new LocalStorageAdapter()
    : new MemoryStorageAdapter();
