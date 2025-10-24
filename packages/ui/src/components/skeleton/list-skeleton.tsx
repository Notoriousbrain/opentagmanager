"use client";

import { Skeleton } from "../skeleton";

export function ListSkeleton(props: { rows?: number }) {
  const rows = props.rows ?? 3;
  return (
    <div className="rounded-xl border border-white/10">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b border-white/10 p-4 last:border-b-0"
        >
          <div className="min-w-0 flex-1">
            <Skeleton className="mb-2 h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
