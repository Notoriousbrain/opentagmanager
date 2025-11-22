import { storage } from "./storage";

const SESSION_ID_KEY = "__osstag_sid";
const SESSION_TS_KEY = "__osstag_sid_ts";
const SESSION_TTL_MS = 30 * 60 * 1000;

export function getSessionId(): string {
  const sid = storage.get(SESSION_ID_KEY);
  const ts = storage.get(SESSION_TS_KEY);

  const now = Date.now();
  const tsNum = ts ? Number(ts) : 0;

  if (sid && tsNum && now - tsNum < SESSION_TTL_MS) {
    return sid;
  }

  const newId = crypto.randomUUID();
  storage.set(SESSION_ID_KEY, newId);
  storage.set(SESSION_TS_KEY, String(now));
  return newId;
}
