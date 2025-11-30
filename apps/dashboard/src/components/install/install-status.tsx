"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/react";
import { CheckCircle, Hourglass, AlertTriangle } from "lucide-react";

export function InstallStatus({ projectId }: { projectId: string }) {
  const [enabled, setEnabled] = useState(true);

  const query = trpc.projects.installStatus.useQuery(
    { projectId },
    {
      enabled,
      refetchInterval: 4000,
      refetchOnWindowFocus: false,
    }
  );

  const status = query.data;

  let content = null;

  if (query.isLoading) {
    content = (
      <div className="flex items-center gap-2 text-neutral-400 text-sm">
        <Hourglass className="h-4 w-4 animate-spin" />
        Checking event flow…
      </div>
    );
  } else if (status?.hasEvents) {
    content = (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <CheckCircle className="h-4 w-4" />
        Events received! Last event: {status.lastEventAt}
      </div>
    );
  } else {
    content = (
      <div className="flex items-center gap-2 text-yellow-400 text-sm">
        <AlertTriangle className="h-4 w-4" />
        No events yet — waiting…
      </div>
    );
  }

  return <div className="mt-4">{content}</div>;
}
