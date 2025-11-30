"use client";

import { trpc } from "@/lib/trpc/react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { SendTestEvent } from "./send-test-event";

export function InstallStatus({ projectId }: { projectId: string }) {
  const eventStatus = trpc.projects.installStatus.useQuery(
    { projectId },
    { refetchInterval: 5000 }
  );

  const telemetry = trpc.projects.installTelemetryStatus.useQuery(
    { projectId },
    { refetchInterval: 5000 }
  );

  const isLoading = eventStatus.isLoading || telemetry.isLoading;

  return (
    <div className="rounded-lg border border-neutral-800 p-4 bg-neutral-950/50 space-y-3">
      <h2 className="text-sm font-medium text-neutral-300">Install Status</h2>

      {isLoading && (
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking…
        </div>
      )}

      {!isLoading && telemetry.data?.blocked && (
        <div className="rounded-md bg-red-900/30 border border-red-700 p-3 text-red-300 text-sm">
          ⚠️ OSSTag script appears to be blocked
          <br />
          This usually means an ad-blocker prevented <code>osstag.js</code> from
          loading.
          <br />
          Use the <strong>self-hosted script</strong> instead via{" "}
          <code>/osstag.js</code>.
        </div>
      )}

      {!isLoading && !telemetry.data?.blocked && eventStatus.data && (
        <div className="flex items-center gap-2 text-sm">
          {eventStatus.data.hasEvents ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-400">Connected</span>
              <span className="text-neutral-500">
                • Last event {eventStatus.data.lastEventAt || "unknown"}
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-400">Not receiving events</span>
            </>
          )}
        </div>
      )}

      <div className="pt-2 border-t border-neutral-800">
        <SendTestEvent projectId={projectId} />
      </div>
    </div>
  );
}
