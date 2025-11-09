"use client";

import { useState } from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, ScrollArea } from "@otm/ui";

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-6 bg-black/90 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Event Props</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 max-h-[400px] rounded-lg border border-white/10 bg-black/40 p-3 text-xs font-mono">
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
