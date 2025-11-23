import type { StorageAdapter } from "../storage/storage";

export async function getClientId(storage: StorageAdapter): Promise<string> {
  const key = "__osstag_cid";

  const existing = await storage.get(key);
  if (existing) return existing;

  const id = crypto.randomUUID();
  await storage.set(key, id);

  return id;
}
