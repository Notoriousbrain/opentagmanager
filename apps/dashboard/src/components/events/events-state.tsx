"use client";

import { AlertCircle } from "lucide-react";

type EventsState = "loading" | "error" | "empty" | "ok";

interface EventsStateBarProps {
  state: EventsState;
  onRetry?: () => void;

  liveStats?: {
    lastEventAt: string | null;
    eventsPerMinute: number;
    totalInWindow: number;
    windowMinutes: number;
  } | null;

  liveLoading?: boolean;
  liveError?: boolean;
}

export function EventsStateBar({
  state,
  onRetry,
  liveStats,
  liveLoading,
  liveError,
}: EventsStateBarProps) {
  if (state === "loading") {
    return (
      <div className="rounded-lg border border-white/10 bg-muted/10 p-4 text-sm text-muted-foreground">
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-1/4 rounded bg-muted/40" />
          <div className="h-3 w-3/4 rounded bg-muted/30" />
          <div className="h-3 w-2/5 rounded bg-muted/20" />
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Failed to load events.</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-100 hover:bg-red-500/30"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
        <p>No recent events yet.</p>
      </div>
    );
  }

  let liveLabel: string | null = null;

  if (liveLoading) {
    liveLabel = "Fetching live stats…";
  } else if (liveError) {
    liveLabel = "Live stats unavailable.";
  } else if (liveStats) {
    const w = liveStats.windowMinutes;

    if (liveStats.totalInWindow === 0) {
      liveLabel = `No events in the last ${w} minutes.`;
    } else {
      liveLabel = `${liveStats.totalInWindow} events in last ${w} minutes (~${liveStats.eventsPerMinute.toFixed(
        1
      )}/min)`;
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-muted/10 p-4 text-xs text-muted-foreground">
      <div className="flex flex-col gap-0.5">
        <span>Showing recent events</span>

        {liveLabel && (
          <span className="text-[11px] text-muted-foreground/80">
            {liveLabel}
          </span>
        )}
      </div>
    </div>
  );
}
