"use client";

import { useState } from "react";
import { Button } from "@otm/ui";
import { Card } from "@otm/ui";
import { CopyIcon, ChevronDown, ChevronUp } from "lucide-react";
import { EventRow } from "@otm/types";

const MOCK_EVENTS: EventRow[] = [
  {
    type: "page_view",
    region: "IN",
    occurred_at: "2025-11-09T09:32:11.000Z",
    props: { path: "/home", ref: "google" },
    project_id: "123",
  },
  {
    type: "click",
    region: "US",
    occurred_at: "2025-11-09T09:31:45.000Z",
    props: { button: "signup", color: "blue" },
    project_id: "123",
  },
  {
    type: "purchase",
    region: "DE",
    occurred_at: "2025-11-09T09:30:02.000Z",
    props: { amount: 199, currency: "USD" },
    project_id: "123",
  },
];

function JsonPreview({ data }: { data: Record<string, unknown> | null }) {
  const [expanded, setExpanded] = useState(false);

  if (!data) return <span className="text-muted-foreground italic">—</span>;

  const json = JSON.stringify(data, null, 2);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        JSON
      </Button>

      {expanded && (
        <Card className="absolute z-10 mt-1 w-[320px] max-h-[240px] overflow-auto p-2 text-xs bg-background shadow-xl border">
          <pre>{json}</pre>
          <Button
            variant="secondary"
            className="absolute top-1 right-1"
            onClick={() => navigator.clipboard.writeText(json)}
          >
            <CopyIcon size={12} />
          </Button>
        </Card>
      )}
    </div>
  );
}

export function EventsTable() {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/30">
          <tr className="text-left">
            <th className="p-2">Type</th>
            <th className="p-2">Region</th>
            <th className="p-2">Occurred At</th>
            <th className="p-2">Props</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_EVENTS.map((e, i) => (
            <tr key={i} className="border-t hover:bg-muted/10">
              <td className="p-2 font-medium">{e.type}</td>
              <td className="p-2">{e.region ?? "—"}</td>
              <td className="p-2 text-muted-foreground">
                {new Date(e.occurred_at).toLocaleString()}
              </td>
              <td className="p-2">
                <JsonPreview data={e.props ?? null} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
