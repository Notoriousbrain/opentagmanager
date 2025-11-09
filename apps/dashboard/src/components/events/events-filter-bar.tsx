"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@otm/ui";

interface EventsFilterBarProps {
  onChange: (filters: {
    type?: string;
    region?: string;
    since?: string;
  }) => void;
}

const EVENT_TYPES = ["page_view", "signup", "click", "purchase"];
const REGIONS = ["IN", "US", "DE", "FR", "GB"];

export function EventsFilterBar({ onChange }: EventsFilterBarProps) {
  const [type, setType] = useState<string | undefined>();
  const [region, setRegion] = useState<string | undefined>();
  const [since, setSince] = useState<string | undefined>("");

  useEffect(() => {
    const id = setTimeout(() => onChange({ type, region, since }), 250);
    return () => clearTimeout(id);
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
        <Input
          type="datetime-local"
          className="w-[200px]"
          value={since ?? ""}
          onChange={(e) =>
            setSince(
              e.target.value
                ? new Date(e.target.value).toISOString()
                : undefined
            )
          }
        />
      </div>

      <Button
        variant="outline"
        className="ml-auto"
        onClick={() => {
          setType(undefined);
          setRegion(undefined);
          setSince(undefined);
          onChange({});
        }}
      >
        Reset
      </Button>
    </div>
  );
}
