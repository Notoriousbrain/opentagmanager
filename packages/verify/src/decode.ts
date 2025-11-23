import type { BatchPayload, EventProps } from "@otm/types";

export function decodeIncomingPayload(
  input: unknown
): BatchPayload<EventProps> | null {
  if (!input || typeof input !== "object") return null;

  const raw = input as Record<string, unknown>;

  if (raw.projectId && raw.events) {
    return raw as unknown as BatchPayload<EventProps>;
  }

  if (typeof raw.d === "string") {
    try {
      const binary = atob(raw.d);

      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

      const json = new TextDecoder().decode(bytes);

      const decoded = JSON.parse(json) as BatchPayload<EventProps>;

      return decoded;
    } catch {
      return null;
    }
  }

  return null;
}
