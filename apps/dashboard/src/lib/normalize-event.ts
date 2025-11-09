import type { EventRow } from "@/types/events";

export function normalizeEventRow(row: EventRow) {
  return {
    ...row,
    occurred_at: new Date(row.occurred_at),
    region: row.region ?? "—",
    props: row.props ?? {},
  };
}
