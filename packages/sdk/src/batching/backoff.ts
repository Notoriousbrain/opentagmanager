import type { BatchingConfig } from "./constants";

export function getBackoffDelay(
  attempt: number,
  config: BatchingConfig
): number {
  return config.baseBackoffMs * Math.pow(2, attempt);
}
