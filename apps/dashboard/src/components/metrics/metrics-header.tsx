"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function MetricsHeader() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">
        Events & Metrics
      </h1>
    </header>
  );
}
