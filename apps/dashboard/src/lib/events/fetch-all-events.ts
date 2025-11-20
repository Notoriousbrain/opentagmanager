import type { EventRow } from "@otm/types";

interface EventsBatch {
  items: EventRow[];
  nextCursor: string | null;
}

interface TrpcBatchEnvelope<T> {
  result?: {
    data?: {
      json?: T;
    };
  };
}

function isTrpcBatchEnvelope<T>(obj: unknown): obj is TrpcBatchEnvelope<T> {
  if (!obj || typeof obj !== "object") return false;
  const e = obj as Record<string, unknown>;
  const result = e["result"];
  if (!result || typeof result !== "object") return false;

  const data = (result as Record<string, unknown>)["data"];
  if (!data || typeof data !== "object") return false;

  return "json" in (data as Record<string, unknown>);
}

export async function fetchAllEvents(
  projectId: string,
  filters: Record<string, unknown>
): Promise<EventRow[]> {
  const all: EventRow[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const input = { 0: { json: { projectId, cursor, ...filters } } };
    const encoded = encodeURIComponent(JSON.stringify(input));
    const url = `/api/trpc/relay.getEventsByProject?batch=1&input=${encoded}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.statusText}`);
    }

    const json = (await res.json()) as unknown;

    if (!Array.isArray(json)) break;

    const first = json[0];
    if (!isTrpcBatchEnvelope<EventsBatch>(first)) break;

    const batch = first.result?.data?.json;
    if (!batch) break;

    all.push(...batch.items);

    if (!batch.nextCursor) break;
    cursor = batch.nextCursor;

    await new Promise((r) => setTimeout(r, 20));
  }

  return all;
}
