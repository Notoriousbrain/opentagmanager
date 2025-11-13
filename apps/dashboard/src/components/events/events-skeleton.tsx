"use client";

import { Card } from "@otm/ui";

export function EventsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-3 h-16 bg-muted/30" />
        ))}
      </div>

      <div className="h-8 bg-muted/30 rounded-md w-full" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-muted/20 rounded-md w-full border border-border/20"
          />
        ))}
      </div>
    </div>
  );
}
