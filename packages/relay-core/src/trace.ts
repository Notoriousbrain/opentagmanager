import { randomUUID } from "node:crypto";

export function createTraceId(): string {
  return randomUUID().split("-")[0];
}

export function traceScope(
  traceId: string,
  meta: Record<string, unknown> = {}
) {
  return { traceId, ...meta };
}
