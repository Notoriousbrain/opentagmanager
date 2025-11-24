"use client";

import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@otm/ui";

interface EventsSearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function EventsSearchBar({ value, onChange }: EventsSearchBarProps) {
  const [local, setLocal] = useState(value);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(t);
  }, [local, onChange]);

  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search events…"
        className="pl-8 border-white/10"
      />
    </div>
  );
}
