"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/react";
import { Button } from "@otm/ui";
import { Loader2, Check } from "lucide-react";

export function SendTestEvent({ projectId }: { projectId: string }) {
  const [done, setDone] = useState(false);

  const mutation = trpc.projects.testEvent.useMutation({
    onSuccess() {
      setDone(true);

      setTimeout(() => {
        setDone(false);
      }, 2500);
    },
  });

  const isLoading = mutation.isPending;
  const isDone = done;

  return (
    <div className="flex items-center gap-3 mt-4">
      <Button
        variant="inverse"
        size="sm"
        disabled={isLoading || isDone}
        onClick={() => mutation.mutate({ projectId })}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

        {isDone ? "Test Event Sent!" : "Send Test Event"}
      </Button>

      {isDone && (
        <div className="flex items-center gap-1 text-green-400 text-sm">
          <Check className="h-4 w-4" />
          Event received
        </div>
      )}
    </div>
  );
}
