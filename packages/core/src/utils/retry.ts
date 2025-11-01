import { logger } from "@otm/relay-core";

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const { attempts = 3, baseDelayMs = 1000 } = opts;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      const delay = baseDelayMs * Math.pow(2, i);
     logger.warn("Retrying operation", { attempt: i + 1, delay });
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error("retryWithBackoff exhausted");
}
