import { retryWithBackoff as coreRetryWithBackoff } from "@otm/core";
import { RelayError } from "./errors";

export interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  onRetry?: (err: unknown, attempt: number, delay: number) => void;
}

export async function retryIfRetryable<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  return coreRetryWithBackoff(async () => {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof RelayError && err.kind === "RETRYABLE") throw err;
      throw new RelayError(
        "INTERNAL_ERROR",
        (err as Error).message ?? "Fatal error",
        500,
        "FATAL",
        { cause: err }
      );
    }
  }, opts);
}
