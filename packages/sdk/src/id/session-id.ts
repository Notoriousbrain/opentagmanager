import type { StorageAdapter } from "../storage/storage";

export async function getSessionId(storage: StorageAdapter): Promise<string> {
  const ID_KEY = "__osstag_sid";
  const TS_KEY = "__osstag_sid_ts";
  const TTL = 30 * 60 * 1000;

  const now = Date.now();

  const [sid, tsRaw] = await Promise.all([
    storage.get(ID_KEY),
    storage.get(TS_KEY),
  ]);

  const ts = tsRaw ? Number(tsRaw) : 0;

  const stillValid = sid && ts && now - ts < TTL;

  if (stillValid) {
    return sid!;
  }

  const newId = crypto.randomUUID();

  await Promise.all([
    storage.set(ID_KEY, newId),
    storage.set(TS_KEY, String(now)),
  ]);

  return newId;
}
