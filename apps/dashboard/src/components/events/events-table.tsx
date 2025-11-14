"use client";

import { EventRow } from "@otm/types";
import { EventPropsViewer } from "./event-props-viewer";

export function EventsTable({ data }: { data: EventRow[] }) {
  if (data.length === 0) return null;

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-white/10 text-left">
          <th className="py-2 px-3">Type</th>
          <th className="py-2 px-3">Region</th>
          <th className="py-2 px-3">Timestamp</th>
          <th className="py-2 px-3">Props</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, i) => (
          <tr
            key={`${e.project_id}-${e.occurred_at}-${i}`}
            className="border-b border-white/5"
          >
            <td className="py-2 px-3">{e.type}</td>
            <td className="py-2 px-3">{e.region ?? "—"}</td>
            <td className="py-2 px-3 text-zinc-400">
              {new Date(e.occurred_at).toLocaleString("en-IN", {
                hour12: false,
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </td>
            <td className="py-2 px-3 text-sm text-zinc-300">
              <EventPropsViewer props={e.props ?? null} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
