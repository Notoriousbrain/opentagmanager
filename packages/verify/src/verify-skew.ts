export interface SkewValidationOptions {
  maxSkewMs?: number;
}

export interface SkewValidationResult {
  ok: boolean;
  message?: string;
}

export function validateTimestampSkew(
  sentAtIso: string,
  opts: SkewValidationOptions = {}
): SkewValidationResult {
  const maxSkew = opts.maxSkewMs ?? 5 * 60 * 1000;
  const now = Date.now();
  const ts = new Date(sentAtIso).getTime();

  if (Number.isNaN(ts)) {
    return { ok: false, message: "invalid sentAt timestamp" };
  }

  const diff = Math.abs(now - ts);

  if (diff > maxSkew) {
    return {
      ok: false,
      message: `timestamp skew exceeds limit (${maxSkew}ms)`,
    };
  }

  return { ok: true };
}
