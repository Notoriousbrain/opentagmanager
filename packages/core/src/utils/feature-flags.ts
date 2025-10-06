import { cache } from "../lib/cache";

const k = (name: string) => `flag:${name}`;

export async function setFeatureFlag(
  name: string,
  enabled: boolean,
  ttlSeconds?: number
) {
  await cache.set(k(name), enabled ? "true" : "false", ttlSeconds);
}

export async function isFeatureEnabled(name: string): Promise<boolean> {
  const v = await cache.get<string>(k(name));
  return v === "true";
}

export async function clearFeatureFlag(name: string) {
  await cache.del(k(name));
}
