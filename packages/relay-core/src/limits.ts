export interface RelayLimits {
  maxBodyKB: number;
  maxEventsPerBatch: number;
  maxSkewMs: number;
}

export const DEFAULT_LIMITS: RelayLimits = {
  maxBodyKB: 64,
  maxEventsPerBatch: 50,
  maxSkewMs: 300_000,
};


export function getLimitsFromEnv(
  env: Record<string, string | undefined> = typeof process !== "undefined"
    ? (process.env as Record<string, string | undefined>)
    : {},
): RelayLimits {
  const toPosInt = (v: string | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
  };

  return {
    maxBodyKB: toPosInt(env.RELAY_MAX_BODY_KB) ?? DEFAULT_LIMITS.maxBodyKB,
    maxEventsPerBatch:
      toPosInt(env.RELAY_MAX_EVENTS) ?? DEFAULT_LIMITS.maxEventsPerBatch,
    maxSkewMs: Number.isFinite(Number(env.RELAY_SKEW_MS))
      ? Math.floor(Number(env.RELAY_SKEW_MS))
      : DEFAULT_LIMITS.maxSkewMs,
  };
}
