import { BASE_BACKOFF_MS } from "./constants";

export function getBackoffDelay(attempt: number): number {
  return BASE_BACKOFF_MS * Math.pow(2, attempt);
}
