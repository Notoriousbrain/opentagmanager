"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@otm/ui";

export interface FilterValues {
  type?: string;
  region?: string;
  since?: string;
}

interface EventsFilterBarProps {
  onChange: (filters: FilterValues) => void;
}

const TIME_RANGES = [
  {
    label: "Last 24 h",
    value: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    label: "Last 7 days",
    value: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    label: "Last 14 days",
    value: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
];

const EVENT_TYPES = ["page_view", "signup", "click", "purchase"];
const REGIONS = ["IN", "US", "DE", "FR", "GB"];

export function EventsFilterBar({ onChange }: EventsFilterBarProps) {
  const [type, setType] = useState<string | undefined>();
  const [region, setRegion] = useState<string | undefined>();
  const [since, setSince] = useState(TIME_RANGES[1].value);

  useEffect(() => {
    onChange({
      type: type || undefined,
      region: region || undefined,
      since,
    });
  }, [type, region, since, onChange]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground mb-1">Type</label>
        <Select onValueChange={(v) => setType(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground mb-1">Region</label>
        <Select onValueChange={(v) => setRegion(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground mb-1">Since</label>
        <Select value={since} onValueChange={setSince}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="ml-auto"
        onClick={() => {
          setType("");
          setRegion("");
          setSince(TIME_RANGES[1].value);
        }}
      >
        Reset
      </Button>
    </div>
  );
}
