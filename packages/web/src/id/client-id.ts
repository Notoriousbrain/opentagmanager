import type { StorageAdapter } from "../storage/storage";

/**
 * Returns a stable clientId. If none exists, generates one using crypto.randomUUID().
 *
 * Works with:
 * - Sync storage (browser localStorage)
 * - Async storage (Node/Workers)
 */
export async function getClientId(storage: StorageAdapter): Promise<string> {
  const key = "__osstag_cid";

  const existing = await storage.get(key);
  if (existing) return existing;

  const id = crypto.randomUUID();
  await storage.set(key, id);

  return id;
}
