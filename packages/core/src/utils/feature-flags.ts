import { cache } from "../lib/cache";

const k = (name: string) => `flag:${name}`;

function toBoolean(v: unknown): boolean {
  if (v === true) return true;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "on";
  }
  return false;
}

export async function setFeatureFlag(
  name: string,
  enabled: boolean,
  ttlSeconds?: number
) {
  await cache.set(k(name), enabled ? "true" : "false", ttlSeconds);
}

export async function isFeatureEnabled(name: string): Promise<boolean> {
  const v = await cache.get<string>(k(name));
  return toBoolean(v ?? false);
}

export async function clearFeatureFlag(name: string) {
  await cache.del(k(name));
}

