"use client";

import { useState } from "react";
import { Button } from "@otm/ui";

interface EventPropsViewerProps {
  props: Record<string, unknown> | null;
}

export function EventPropsViewer({ props }: EventPropsViewerProps) {
  const [open, setOpen] = useState(false);

  if (!props || Object.keys(props).length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={() => setOpen(true)}
      >
        View
      </Button>

      {open && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="max-w-2xl w-[90%] rounded-lg border border-white/10 bg-black p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Event Props</h2>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setOpen(false)}
              >
                ✕
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs font-mono whitespace-pre-wrap">
              <pre>{JSON.stringify(props, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
