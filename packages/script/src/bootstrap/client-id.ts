import { storage } from "./storage";

const CLIENT_ID_KEY = "__osstag_cid";

export function getClientId(): string {
  const existing = storage.get(CLIENT_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  storage.set(CLIENT_ID_KEY, id);
  return id;
}
